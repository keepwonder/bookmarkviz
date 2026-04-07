// OAuth helpers for GitHub and Google — manual flow without external deps

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_API_URL = 'https://api.github.com';

const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_API_URL = 'https://www.googleapis.com';

function randomState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, '');
}

export function getAuthorizationUrl(
  provider: string,
  clientId: string,
  redirectUri: string,
  state: string,
): string {
  if (provider === 'github') {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: 'read:user user:email',
    });
    return `${GITHUB_AUTHORIZE_URL}?${params}`;
  }
  if (provider === 'google') {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: 'openid profile email',
      response_type: 'code',
    });
    return `${GOOGLE_AUTHORIZE_URL}?${params}`;
  }
  throw new Error(`Unknown provider: ${provider}`);
}

export async function exchangeCode(
  provider: string,
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string,
): Promise<string> {
  if (provider === 'github') {
    const res = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });
    const data = await res.json() as { access_token?: string; error?: string };
    if (!data.access_token) throw new Error(data.error || 'GitHub OAuth failed');
    return data.access_token;
  }
  if (provider === 'google') {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const data = await res.json() as { access_token?: string; error?: string };
    if (!data.access_token) throw new Error(data.error || 'Google OAuth failed');
    return data.access_token;
  }
  throw new Error(`Unknown provider: ${provider}`);
}

export interface OAuthUserProfile {
  id: string | number;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export async function fetchUserProfile(
  provider: string,
  accessToken: string,
): Promise<OAuthUserProfile> {
  if (provider === 'github') {
    const res = await fetch(`${GITHUB_API_URL}/user`, {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'bookmarkviz' },
    });
    const user = await res.json() as { id: number; login: string; name: string | null; email: string | null; avatar_url: string };
    return {
      id: user.id,
      name: user.name || user.login,
      email: user.email,
      avatarUrl: user.avatar_url,
    };
  }
  if (provider === 'google') {
    const res = await fetch(`${GOOGLE_API_URL}/oauth2/v2/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = await res.json() as { sub: string; name: string; email: string; picture: string };
    return {
      id: user.sub,
      name: user.name,
      email: user.email,
      avatarUrl: user.picture,
    };
  }
  throw new Error(`Unknown provider: ${provider}`);
}

export { randomState };
