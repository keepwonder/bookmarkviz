// GET /api/read-status — list read bookmark IDs
// PUT /api/read-status — replace full read status set

import { getAuthenticatedUserId, jsonResponse, unauthorizedResponse, type Env } from '../lib/auth';
import { getDB } from '../lib/db';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getAuthenticatedUserId(request, env);
  if (!userId) return unauthorizedResponse();

  const db = await getDB(env);
  const { results } = await db.prepare(
    'SELECT bookmark_id FROM read_status WHERE user_id = ?'
  ).bind(userId).all<{ bookmark_id: string }>();

  return jsonResponse(results.map(r => r.bookmark_id));
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getAuthenticatedUserId(request, env);
  if (!userId) return unauthorizedResponse();

  const db = await getDB(env);
  const { ids } = await request.json() as { ids: string[] };

  await db.prepare('DELETE FROM read_status WHERE user_id = ?').bind(userId).run();

  if (ids.length > 0) {
    const stmts = ids.map(id =>
      db.prepare('INSERT INTO read_status (user_id, bookmark_id) VALUES (?, ?)').bind(userId, id)
    );
    for (let i = 0; i < stmts.length; i += 50) {
      await db.batch(stmts.slice(i, i + 50));
    }
  }

  return jsonResponse({ success: true, count: ids.length });
};
