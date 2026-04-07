// GET /api/auth/callback — handle OAuth callback

import { exchangeCode, fetchUserProfile } from '../../lib/oauth';
import { createSessionData, createSessionCookie } from '../../lib/session';
import { ensureUser, type Env } from '../../lib/auth';
import { getDB } from '../../lib/db';

function readOAuthCookie(request: Request): { s: string; p: string } | null {
  try {
    const header = request.headers.get('Cookie') || '';
    const match = header.match(/bookmarkviz_oauth=([^;]+)/);
    if (!match) return null;
    return JSON.parse(atob(match[1]));
  } catch {
    return null;
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return Response.redirect(`${url.origin}/?auth_error=${encodeURIComponent('Missing code')}`, 302);
  }

  // Read provider from cookie (set by /api/auth/login), not from URL
  const oauth = readOAuthCookie(request);
  const provider = oauth?.p || 'github';

  const clientId = provider === 'github' ? env.GITHUB_CLIENT_ID : env.GOOGLE_CLIENT_ID;
  const clientSecret = provider === 'github' ? env.GITHUB_CLIENT_SECRET : env.GOOGLE_CLIENT_SECRET;
  // FIX 1: Clean URL without ?provider= query param
  const redirectUri = `${url.origin}/api/auth/callback`;

  try {
    // Exchange code for access token
    const accessToken = await exchangeCode(provider, clientId, clientSecret, code, redirectUri);

    // Fetch user profile
    const profile = await fetchUserProfile(provider, accessToken);

    // Create or get user in DB
    const db = await getDB(env);
    const userId = await ensureUser(db, {
      provider,
      id: String(profile.id),
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
    });

    // Create encrypted session cookie
    const session = createSessionData(userId, provider);
    const cookie = await createSessionCookie(session, env.SESSION_SECRET);

    // FIX 2: Use Headers object for multiple Set-Cookie; skip Secure on localhost
    const secure = url.protocol === 'https:' ? '; Secure' : '';
    const headers = new Headers();
    headers.set('Location', '/dashboard');
    headers.append('Set-Cookie', `bookmarkviz_session=${cookie}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`);
    headers.append('Set-Cookie', `bookmarkviz_oauth=; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=0`);

    return new Response(null, { status: 302, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    console.error('OAuth callback error:', message, err);
    return Response.redirect(`${url.origin}/?auth_error=${encodeURIComponent(message)}`, 302);
  }
};
