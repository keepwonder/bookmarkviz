// GET /api/bookmarks — list bookmarks with analytics
// PUT /api/bookmarks — full replace bookmarks from JSONL

import { getAuthenticatedUserId, jsonResponse, unauthorizedResponse, type Env } from '../../lib/auth';
import { getDB, nanoid } from '../../lib/db';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getAuthenticatedUserId(request, env);
  if (!userId) return unauthorizedResponse();

  const db = await getDB(env);

  // Get meta + analytics snapshot
  const analytics = await db.prepare(
    'SELECT data, synced_at FROM analytics WHERE user_id = ?'
  ).bind(userId).first<{ data: string; synced_at: string }>();

  if (!analytics) {
    return jsonResponse({ meta: null, bookmarks: [], analytics: null });
  }

  const analyticsData = JSON.parse(analytics.data);
  const meta = analyticsData.meta || { totalBookmarks: 0, dateRange: null, totalAuthors: 0, syncedAt: analytics.synced_at };

  // Get all bookmarks
  const { results } = await db.prepare(
    'SELECT * FROM bookmarks WHERE user_id = ? ORDER BY posted_at DESC'
  ).bind(userId).all();

  const bookmarks = results.map((row: any) => ({
    id: row.id,
    text: row.text,
    authorHandle: row.author_handle,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    authorVerified: !!row.author_verified,
    postedAt: row.posted_at,
    language: row.language,
    engagement: {
      likeCount: row.like_count,
      repostCount: row.repost_count,
      replyCount: row.reply_count,
      quoteCount: row.quote_count || 0,
      bookmarkCount: row.bookmark_count,
    },
    contentType: row.content_type,
    url: row.url,
    links: JSON.parse(row.links || '[]'),
  }));

  return jsonResponse({
    meta,
    bookmarks,
    analytics: analyticsData,
  });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getAuthenticatedUserId(request, env);
  if (!userId) return unauthorizedResponse();

  const db = await getDB(env);
  const body = await request.json() as { jsonl?: string; bookmarks?: any[] };

  // If client sends pre-processed data
  if (body.bookmarks && Array.isArray(body.bookmarks)) {
    // Delete existing bookmarks
    await db.prepare('DELETE FROM bookmarks WHERE user_id = ?').bind(userId).run();

    // Batch insert
    const stmts = body.bookmarks.map((b: any) =>
      db.prepare(
        `INSERT OR REPLACE INTO bookmarks (id, user_id, text, author_handle, author_name, author_avatar, author_verified, posted_at, language, like_count, repost_count, reply_count, quote_count, bookmark_count, content_type, url, links)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        b.id, userId, b.text || '', b.authorHandle, b.authorName, b.authorAvatar || '',
        b.authorVerified ? 1 : 0, b.postedAt, b.language || '',
        b.engagement?.likeCount || 0, b.engagement?.repostCount || 0,
        b.engagement?.replyCount || 0, b.engagement?.quoteCount || 0,
        b.engagement?.bookmarkCount || 0, b.contentType || 'text', b.url || '',
        JSON.stringify(b.links || []),
      )
    );

    // Execute in batches of 50
    for (let i = 0; i < stmts.length; i += 50) {
      await db.batch(stmts.slice(i, i + 50));
    }

    // Save analytics snapshot
    const analyticsData = body.analytics || {};
    analyticsData.meta = analyticsData.meta || {
      totalBookmarks: body.bookmarks.length,
      dateRange: null,
      totalAuthors: 0,
      syncedAt: new Date().toISOString(),
    };

    await db.prepare(
      `INSERT OR REPLACE INTO analytics (user_id, data, synced_at) VALUES (?, ?, ?)`
    ).bind(userId, JSON.stringify(analyticsData), new Date().toISOString()).run();

    return jsonResponse({ success: true, count: body.bookmarks.length });
  }

  return new Response(JSON.stringify({ error: 'Invalid payload' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
