// D1 database schema — executed one at a time via prepare().run()

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, github_id INTEGER UNIQUE, google_id TEXT UNIQUE, email TEXT, name TEXT NOT NULL, avatar_url TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,

  `CREATE TABLE IF NOT EXISTS bookmarks (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, text TEXT NOT NULL DEFAULT '', author_handle TEXT NOT NULL, author_name TEXT NOT NULL, author_avatar TEXT NOT NULL DEFAULT '', author_verified INTEGER NOT NULL DEFAULT 0, posted_at TEXT NOT NULL, language TEXT DEFAULT '', like_count INTEGER DEFAULT 0, repost_count INTEGER DEFAULT 0, reply_count INTEGER DEFAULT 0, quote_count INTEGER DEFAULT 0, bookmark_count INTEGER DEFAULT 0, content_type TEXT DEFAULT 'text', url TEXT DEFAULT '', links TEXT DEFAULT '[]')`,

  `CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id, posted_at DESC)`,

  `CREATE TABLE IF NOT EXISTS analytics (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, data TEXT NOT NULL, synced_at TEXT NOT NULL)`,

  `CREATE TABLE IF NOT EXISTS read_status (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, bookmark_id TEXT NOT NULL, read_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (user_id, bookmark_id))`,

  `CREATE TABLE IF NOT EXISTS collections (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, emoji TEXT DEFAULT '📁', created_at INTEGER NOT NULL)`,

  `CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id)`,

  `CREATE TABLE IF NOT EXISTS collection_bookmarks (collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE, bookmark_id TEXT NOT NULL, added_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (collection_id, bookmark_id))`,

  `CREATE TABLE IF NOT EXISTS notes (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, bookmark_id TEXT NOT NULL, content TEXT DEFAULT '', updated_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (user_id, bookmark_id))`,
];

export async function initDB(db: D1Database): Promise<void> {
  for (const sql of STATEMENTS) {
    await db.prepare(sql).run();
  }
}
