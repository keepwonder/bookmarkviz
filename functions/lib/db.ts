// Database helper for D1

import { initDB } from '../db/schema';

let initialized = false;

export async function getDB(env: { DB: D1Database }): Promise<D1Database> {
  if (!initialized) {
    await initDB(env.DB);
    initialized = true;
  }
  return env.DB;
}

export function nanoid(size = 21): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes, b => chars[b % chars.length]).join('');
}
