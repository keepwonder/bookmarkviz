// GET /api/auth/callback?provider=...&code=... — handle OAuth callback

import { exchangeCode, fetchUserProfile } from '../../lib/oauth';
import { createSessionData, createSessionCookie, setSessionHeaders } from '../../lib/session';
import { ensureUser, type Env } from '../../lib/auth';
import { getDB } from '../../lib/db';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider') || 'github';
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing authorization code', { status: 400 });
  }

  const clientId = provider === 'github' ? env.GITHUB_CLIENT_ID : env.GOOGLE_CLIENT_ID;
  const clientSecret = provider === 'github' ? env.GITHUB_CLIENT_SECRET : env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${url.origin}/api/auth/callback?provider=${provider}`;

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

    // Redirect to dashboard
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/dashboard',
        ...setSessionHeaders(cookie),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return Response.redirect(`${url.origin}/?auth_error=${encodeURIComponent(message)}`, 302);
  }
};
