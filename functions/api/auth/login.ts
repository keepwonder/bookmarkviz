// GET /api/auth/login?provider=github|google — initiate OAuth flow

import { getAuthorizationUrl, randomState } from '../../lib/oauth';
import type { Env } from '../../lib/auth';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider');

  if (provider !== 'github' && provider !== 'google') {
    return new Response(JSON.stringify({ error: 'Invalid provider' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const clientId = provider === 'github' ? env.GITHUB_CLIENT_ID : env.GOOGLE_CLIENT_ID;
  // FIX: Clean callback URL — no query params, must match OAuth provider settings exactly
  const callbackUrl = `${url.origin}/api/auth/callback`;
  const state = randomState();

  // Store provider + CSRF state in cookie (read by callback)
  const payload = btoa(JSON.stringify({ s: state, p: provider }));

  const authorizeUrl = getAuthorizationUrl(provider, clientId, callbackUrl, state);

  // FIX: Use Headers object for Set-Cookie; skip Secure flag on localhost (HTTP)
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  const headers = new Headers();
  headers.set('Location', authorizeUrl);
  headers.append('Set-Cookie', `bookmarkviz_oauth=${payload}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=600`);

  return new Response(null, { status: 302, headers });
};
