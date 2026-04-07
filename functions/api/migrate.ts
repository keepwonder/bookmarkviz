// POST /api/migrate — bulk migrate local data to cloud

import { getAuthenticatedUserId, jsonResponse, unauthorizedResponse, type Env } from '../lib/auth';
import { getDB } from '../lib/db';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getAuthenticatedUserId(request, env);
  if (!userId) return unauthorizedResponse();

  const db = await getDB(env);
  const body = await request.json() as {
    bookmarks?: any[];
    analytics?: any;
    readStatus?: string[];
    collections?: { id: string; name: string; emoji: string; bookmarkIds: string[]; createdAt: number }[];
    notes?: Record<string, string>;
  };

  let bookmarkCount = 0;
  let readCount = 0;
  let collectionCount = 0;
  let noteCount = 0;

  // Migrate bookmarks
  if (body.bookmarks?.length) {
    await db.prepare('DELETE FROM bookmarks WHERE user_id = ?').bind(userId).run();

    const stmts = body.bookmarks.map((b: any) =>
      db.prepare(
        `INSERT OR REPLACE INTO bookmarks (id, user_id, text, author_handle, author_name, author_avatar, author_verified, posted_at, language, like_count, repost_count, reply_count, quote_count, bookmark_count, content_type, url, links)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        b.id, userId, b.text || '', b.authorHandle || '', b.authorName || '',
        b.authorAvatar || '', b.authorVerified ? 1 : 0, b.postedAt || '',
        b.language || '', b.engagement?.likeCount || 0, b.engagement?.repostCount || 0,
        b.engagement?.replyCount || 0, b.engagement?.quoteCount || 0,
        b.engagement?.bookmarkCount || 0, b.contentType || 'text', b.url || '',
        JSON.stringify(b.links || []),
      )
    );
    for (let i = 0; i < stmts.length; i += 50) {
      await db.batch(stmts.slice(i, i + 50));
    }
    bookmarkCount = body.bookmarks.length;
  }

  // Save analytics
  if (body.analytics || body.bookmarks?.length) {
    await db.prepare(
      'INSERT OR REPLACE INTO analytics (user_id, data, synced_at) VALUES (?, ?, ?)'
    ).bind(userId, JSON.stringify(body.analytics || {}), new Date().toISOString()).run();
  }

  // Migrate read status
  if (body.readStatus?.length) {
    const stmts = body.readStatus.map(id =>
      db.prepare('INSERT OR IGNORE INTO read_status (user_id, bookmark_id) VALUES (?, ?)').bind(userId, id)
    );
    for (let i = 0; i < stmts.length; i += 50) {
      await db.batch(stmts.slice(i, i + 50));
    }
    readCount = body.readStatus.length;
  }

  // Migrate collections
  if (body.collections?.length) {
    for (const col of body.collections) {
      await db.prepare(
        'INSERT OR IGNORE INTO collections (id, user_id, name, emoji, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(col.id, userId, col.name, col.emoji || '📁', col.createdAt).run();

      if (col.bookmarkIds?.length) {
        const stmts = col.bookmarkIds.map(bid =>
          db.prepare('INSERT OR IGNORE INTO collection_bookmarks (collection_id, bookmark_id) VALUES (?, ?)').bind(col.id, bid)
        );
        for (let i = 0; i < stmts.length; i += 50) {
          await db.batch(stmts.slice(i, i + 50));
        }
      }
      collectionCount++;
    }
  }

  // Migrate notes
  if (body.notes && typeof body.notes === 'object') {
    const entries = Object.entries(body.notes) as [string, string][];
    if (entries.length) {
      const stmts = entries.map(([bookmarkId, content]) =>
        db.prepare(
          'INSERT OR REPLACE INTO notes (user_id, bookmark_id, content, updated_at) VALUES (?, ?, ?, ?)'
        ).bind(userId, bookmarkId, content, new Date().toISOString())
      );
      for (let i = 0; i < stmts.length; i += 50) {
        await db.batch(stmts.slice(i, i + 50));
      }
      noteCount = entries.length;
    }
  }

  return jsonResponse({
    success: true,
    migrated: { bookmarks: bookmarkCount, readStatus: readCount, collections: collectionCount, notes: noteCount },
  });
};
