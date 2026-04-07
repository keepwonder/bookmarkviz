// Typed API client for bookmarkviz backend

import type { BookmarksData } from './data';
import type { Collection } from './collections';

const BASE = '/api';

async function request(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, { ...options, credentials: 'include' });
}

async function requestJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await request(path, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Bookmarks
export async function getBookmarks(): Promise<BookmarksData | null> {
  try {
    return await requestJSON<BookmarksData>('/bookmarks');
  } catch {
    return null;
  }
}

export async function putBookmarks(data: BookmarksData): Promise<{ count: number }> {
  return requestJSON('/bookmarks', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookmarks: data.bookmarks,
      analytics: data.analytics,
    }),
  });
}

// Read status
export async function getReadStatus(): Promise<string[]> {
  return requestJSON('/read-status');
}

export async function putReadStatus(ids: string[]): Promise<void> {
  await requestJSON('/read-status', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

// Collections
export async function getCollections(): Promise<Collection[]> {
  return requestJSON('/collections');
}

export async function createCollection(name: string, emoji: string, bookmarkIds?: string[]): Promise<Collection> {
  return requestJSON('/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, emoji, bookmarkIds }),
  });
}

// Notes
export async function getNotes(): Promise<Record<string, string>> {
  return requestJSON('/notes');
}

export async function putNote(bookmarkId: string, content: string): Promise<void> {
  await requestJSON('/notes', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookmarkId, content }),
  });
}

// Migration
export async function migrateData(payload: {
  bookmarks: any[];
  analytics: any;
  readStatus: string[];
  collections: Collection[];
  notes: Record<string, string>;
}): Promise<{ migrated: { bookmarks: number; readStatus: number; collections: number; notes: number } }> {
  return requestJSON('/migrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
