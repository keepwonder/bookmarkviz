// GET    /api/collections — list collections
// POST   /api/collections — create collection

import { getAuthenticatedUserId, jsonResponse, unauthorizedResponse, type Env } from '../lib/auth';
import { getDB, nanoid } from '../lib/db';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getAuthenticatedUserId(request, env);
  if (!userId) return unauthorizedResponse();

  const db = await getDB(env);
  const { results } = await db.prepare(
    'SELECT id, name, emoji, created_at FROM collections WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all<{ id: string; name: string; emoji: string; created_at: number }>();

  const collections = [];
  for (const col of results) {
    const { results: bookmarks } = await db.prepare(
      'SELECT bookmark_id FROM collection_bookmarks WHERE collection_id = ?'
    ).bind(col.id).all<{ bookmark_id: string }>();
    collections.push({
      id: col.id,
      name: col.name,
      emoji: col.emoji,
      createdAt: col.created_at,
      bookmarkIds: bookmarks.map(b => b.bookmark_id),
    });
  }

  return jsonResponse(collections);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getAuthenticatedUserId(request, env);
  if (!userId) return unauthorizedResponse();

  const db = await getDB(env);
  const body = await request.json() as { name: string; emoji?: string; bookmarkIds?: string[] };

  const id = nanoid();
  const now = Date.now();

  await db.prepare(
    'INSERT INTO collections (id, user_id, name, emoji, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, userId, body.name, body.emoji || '📁', now).run();

  if (body.bookmarkIds?.length) {
    const stmts = body.bookmarkIds.map(bid =>
      db.prepare('INSERT OR IGNORE INTO collection_bookmarks (collection_id, bookmark_id) VALUES (?, ?)').bind(id, bid)
    );
    for (let i = 0; i < stmts.length; i += 50) {
      await db.batch(stmts.slice(i, i + 50));
    }
  }

  return jsonResponse({
    id,
    name: body.name,
    emoji: body.emoji || '📁',
    createdAt: now,
    bookmarkIds: body.bookmarkIds || [],
  }, 201);
};
