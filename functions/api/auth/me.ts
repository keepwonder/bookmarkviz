// GET /api/auth/me — return current user info

import { getAuthenticatedUserId, jsonResponse, unauthorizedResponse, type Env } from '../../lib/auth';
import { getDB } from '../../lib/db';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getAuthenticatedUserId(request, env);
  if (!userId) return unauthorizedResponse();

  const db = await getDB(env);
  const user = await db.prepare(
    'SELECT id, name, avatar_url, email, created_at FROM users WHERE id = ?'
  ).bind(userId).first<{ id: string; name: string; avatar_url: string | null; email: string | null; created_at: string }>();

  if (!user) return unauthorizedResponse();

  return jsonResponse({
    id: user.id,
    name: user.name,
    avatarUrl: user.avatar_url,
    email: user.email,
    createdAt: user.created_at,
  });
};
