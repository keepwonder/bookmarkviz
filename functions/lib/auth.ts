// Shared auth helpers for API functions

import { parseSessionCookie, getSessionCookie } from './session';
import { getDB, nanoid } from './db';

export interface Env {
  DB: D1Database;
  SESSION_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

export async function getAuthenticatedUserId(request: Request, env: Env): Promise<string | null> {
  const cookie = getSessionCookie(request);
  if (!cookie) return null;
  const session = await parseSessionCookie(cookie, env.SESSION_SECRET);
  if (!session || session.userId === '__state__') return null;
  return session.userId;
}

export async function ensureUser(db: D1Database, profile: {
  provider: string;
  id: string | number;
  name: string;
  email?: string;
  avatarUrl?: string;
}): Promise<string> {
  const providerColumn = profile.provider === 'github' ? 'github_id' : 'google_id';
  const providerValue = profile.provider === 'github' ? Number(profile.id) : String(profile.id);

  // Check existing user
  const existing = await db.prepare(
    `SELECT id FROM users WHERE ${providerColumn} = ?`
  ).bind(providerValue).first<{ id: string }>();

  if (existing) return existing.id;

  // Create new user
  const userId = nanoid();
  await db.prepare(
    'INSERT INTO users (id, github_id, google_id, email, name, avatar_url) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(
    userId,
    profile.provider === 'github' ? providerValue : null,
    profile.provider === 'google' ? providerValue : null,
    profile.email || null,
    profile.name,
    profile.avatarUrl || null,
  ).run();

  return userId;
}

export function jsonResponse(data: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

export function unauthorizedResponse(): Response {
  return errorResponse('Unauthorized', 401);
}
