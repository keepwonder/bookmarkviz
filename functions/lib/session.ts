// AES-GCM encrypted session cookies using Web Crypto API

export interface SessionData {
  userId: string;
  provider: string;
  expiresAt: number;
}

const COOKIE_NAME = 'bookmarkviz_session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

async function getKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret.padEnd(32, '0').slice(0, 32)),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode('bookmarkviz-session'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function createSessionCookie(data: SessionData, secret: string): Promise<string> {
  const key = await getKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function parseSessionCookie(cookie: string, secret: string): Promise<SessionData | null> {
  try {
    const key = await getKey(secret);
    const combined = Uint8Array.from(atob(cookie), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
    const data: SessionData = JSON.parse(new TextDecoder().decode(decrypted));
    if (data.expiresAt < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function getSessionCookie(request: Request): string | null {
  const header = request.headers.get('Cookie') || '';
  const match = header.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

export function setSessionHeaders(cookie: string): Record<string, string> {
  return {
    'Set-Cookie': `${COOKIE_NAME}=${cookie}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE}`,
  };
}

export function clearSessionHeaders(): Record<string, string> {
  return {
    'Set-Cookie': `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
  };
}

export function createSessionData(userId: string, provider: string): SessionData {
  return {
    userId,
    provider,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };
}
