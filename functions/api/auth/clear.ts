// DELETE /api/auth/clear — delete all cloud data for current user (keeps account)

import { getAuthenticatedUserId, jsonResponse, unauthorizedResponse, type Env } from '../../lib/auth';
import { getDB } from '../../lib/db';

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getAuthenticatedUserId(request, env);
  if (!userId) return unauthorizedResponse();

  const db = await getDB(env);

  // Delete all user data but keep the user record
  await db.batch([
    db.prepare('DELETE FROM notes WHERE user_id = ?').bind(userId),
    db.prepare('DELETE FROM collection_bookmarks WHERE collection_id IN (SELECT id FROM collections WHERE user_id = ?)').bind(userId),
    db.prepare('DELETE FROM collections WHERE user_id = ?').bind(userId),
    db.prepare('DELETE FROM read_status WHERE user_id = ?').bind(userId),
    db.prepare('DELETE FROM bookmarks WHERE user_id = ?').bind(userId),
    db.prepare('DELETE FROM analytics WHERE user_id = ?').bind(userId),
  ]);

  return jsonResponse({ success: true });
};
