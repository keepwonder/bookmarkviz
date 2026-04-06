// Collections management — localStorage persistence

export interface Collection {
  id: string;
  name: string;
  emoji: string;
  bookmarkIds: string[];
  createdAt: number;
}

const STORAGE_KEY = 'bookmark-collections';

function load(): Collection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(collections: Collection[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
}

export function getCollections(): Collection[] {
  return load();
}

export function getCollection(id: string): Collection | undefined {
  return load().find(c => c.id === id);
}

export function createCollection(name: string, emoji = '📁'): Collection {
  const collections = load();
  const col: Collection = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    emoji,
    bookmarkIds: [],
    createdAt: Date.now(),
  };
  collections.unshift(col);
  save(collections);
  return col;
}

export function updateCollection(id: string, updates: Partial<Pick<Collection, 'name' | 'emoji'>>): void {
  const collections = load();
  const idx = collections.findIndex(c => c.id === id);
  if (idx === -1) return;
  Object.assign(collections[idx], updates);
  save(collections);
}

export function deleteCollection(id: string): void {
  save(load().filter(c => c.id !== id));
}

export function addToCollection(collectionId: string, bookmarkId: string): void {
  const collections = load();
  const col = collections.find(c => c.id === collectionId);
  if (!col || col.bookmarkIds.includes(bookmarkId)) return;
  col.bookmarkIds.push(bookmarkId);
  save(collections);
}

export function removeFromCollection(collectionId: string, bookmarkId: string): void {
  const collections = load();
  const col = collections.find(c => c.id === collectionId);
  if (!col) return;
  col.bookmarkIds = col.bookmarkIds.filter(id => id !== bookmarkId);
  save(collections);
}

export function isBookmarkInCollection(collectionId: string, bookmarkId: string): boolean {
  const col = getCollection(collectionId);
  return !!col && col.bookmarkIds.includes(bookmarkId);
}
