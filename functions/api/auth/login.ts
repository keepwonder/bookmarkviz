// GET /api/auth/login?provider=github|google — initiate OAuth flow

import { getAuthorizationUrl, randomState } from '../../lib/oauth';
import { createSessionCookie, createSessionData } from '../../lib/session';
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
  const callbackUrl = `${url.origin}/api/auth/callback?provider=${provider}`;
  const state = randomState();

  // Store state in cookie for CSRF protection
  const stateCookie = await createSessionCookie(
    createSessionData('__state__', state),
    env.SESSION_SECRET,
  );

  const authorizeUrl = getAuthorizationUrl(provider, clientId, callbackUrl, state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl,
      'Set-Cookie': `bookmarkviz_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
};
