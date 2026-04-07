import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCollections,
  createCollection,
  getCollection,
  updateCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection,
  isBookmarkInCollection,
} from '../lib/collections';

describe('collections', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty collections', () => {
    expect(getCollections()).toEqual([]);
  });

  it('creates a collection', () => {
    const col = createCollection('Test Collection', '⭐');
    expect(col.name).toBe('Test Collection');
    expect(col.emoji).toBe('⭐');
    expect(col.bookmarkIds).toEqual([]);
    expect(getCollections()).toHaveLength(1);
  });

  it('gets collection by id', () => {
    const col = createCollection('Find Me');
    const found = getCollection(col.id);
    expect(found?.name).toBe('Find Me');
  });

  it('returns undefined for non-existent collection', () => {
    expect(getCollection('nope')).toBeUndefined();
  });

  it('updates collection name', () => {
    const col = createCollection('Old Name');
    updateCollection(col.id, { name: 'New Name' });
    expect(getCollection(col.id)?.name).toBe('New Name');
  });

  it('updates collection emoji', () => {
    const col = createCollection('Test', '📁');
    updateCollection(col.id, { emoji: '🔥' });
    expect(getCollection(col.id)?.emoji).toBe('🔥');
  });

  it('deletes a collection', () => {
    const col = createCollection('Delete Me');
    expect(getCollections()).toHaveLength(1);
    deleteCollection(col.id);
    expect(getCollections()).toHaveLength(0);
  });

  it('adds bookmark to collection', () => {
    const col = createCollection('My Col');
    addToCollection(col.id, 'bm-1');
    expect(getCollection(col.id)?.bookmarkIds).toContain('bm-1');
  });

  it('does not add duplicate bookmark', () => {
    const col = createCollection('My Col');
    addToCollection(col.id, 'bm-1');
    addToCollection(col.id, 'bm-1');
    expect(getCollection(col.id)?.bookmarkIds).toEqual(['bm-1']);
  });

  it('removes bookmark from collection', () => {
    const col = createCollection('My Col');
    addToCollection(col.id, 'bm-1');
    addToCollection(col.id, 'bm-2');
    removeFromCollection(col.id, 'bm-1');
    expect(getCollection(col.id)?.bookmarkIds).toEqual(['bm-2']);
  });

  it('checks if bookmark is in collection', () => {
    const col = createCollection('My Col');
    addToCollection(col.id, 'bm-1');
    expect(isBookmarkInCollection(col.id, 'bm-1')).toBe(true);
    expect(isBookmarkInCollection(col.id, 'bm-999')).toBe(false);
  });

  it('ignores update for non-existent collection', () => {
    updateCollection('nope', { name: 'x' });
    expect(getCollections()).toHaveLength(0);
  });
});
