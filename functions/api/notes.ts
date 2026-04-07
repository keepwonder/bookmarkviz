// GET  /api/notes — get all notes for user
// PUT  /api/notes — upsert a note { bookmarkId, content }

import { getAuthenticatedUserId, jsonResponse, unauthorizedResponse, type Env } from '../lib/auth';
import { getDB } from '../lib/db';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getAuthenticatedUserId(request, env);
  if (!userId) return unauthorizedResponse();

  const db = await getDB(env);
  const { results } = await db.prepare(
    'SELECT bookmark_id, content FROM notes WHERE user_id = ?'
  ).bind(userId).all<{ bookmark_id: string; content: string }>();

  const notes: Record<string, string> = {};
  for (const row of results) {
    notes[row.bookmark_id] = row.content;
  }

  return jsonResponse(notes);
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getAuthenticatedUserId(request, env);
  if (!userId) return unauthorizedResponse();

  const db = await getDB(env);
  const { bookmarkId, content } = await request.json() as { bookmarkId: string; content: string };

  if (!content) {
    await db.prepare('DELETE FROM notes WHERE user_id = ? AND bookmark_id = ?')
      .bind(userId, bookmarkId).run();
  } else {
    await db.prepare(
      'INSERT OR REPLACE INTO notes (user_id, bookmark_id, content, updated_at) VALUES (?, ?, ?, ?)'
    ).bind(userId, bookmarkId, content, new Date().toISOString()).run();
  }

  return jsonResponse({ success: true });
};
