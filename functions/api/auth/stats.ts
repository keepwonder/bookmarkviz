// GET /api/auth/stats — return cloud data statistics for current user

import { getAuthenticatedUserId, jsonResponse, unauthorizedResponse, type Env } from '../../lib/auth';
import { getDB } from '../../lib/db';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getAuthenticatedUserId(request, env);
  if (!userId) return unauthorizedResponse();

  const db = await getDB(env);

  const [bookmarkCount, collectionCount, noteCount, analytics] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?').bind(userId).first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM collections WHERE user_id = ?').bind(userId).first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM notes WHERE user_id = ?').bind(userId).first<{ count: number }>(),
    db.prepare('SELECT synced_at FROM analytics WHERE user_id = ?').bind(userId).first<{ synced_at: string | null }>(),
  ]);

  return jsonResponse({
    bookmarkCount: bookmarkCount?.count ?? 0,
    collectionCount: collectionCount?.count ?? 0,
    noteCount: noteCount?.count ?? 0,
    lastSyncedAt: analytics?.synced_at ?? null,
  });
};
