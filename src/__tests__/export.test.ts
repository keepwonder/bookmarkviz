import { describe, it, expect, beforeEach } from 'vitest';
import { importData } from '../lib/export';

describe('export/import', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('rejects invalid JSON', () => {
    const result = importData('not json');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Failed to parse');
  });

  it('rejects missing version', () => {
    const result = importData(JSON.stringify({ readStatus: [], collections: [], notes: {} }));
    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid');
  });

  it('imports read status (merges with existing)', () => {
    localStorage.setItem('read-status', JSON.stringify(['existing-1']));
    const result = importData(JSON.stringify({
      version: 1,
      exportedAt: '2025-01-01',
      readStatus: ['bm-1', 'bm-2'],
      collections: [],
      notes: {},
    }));
    expect(result.success).toBe(true);
    const merged = JSON.parse(localStorage.getItem('read-status')!);
    expect(merged).toContain('existing-1');
    expect(merged).toContain('bm-1');
    expect(merged).toContain('bm-2');
  });

  it('imports collections (merges by id)', () => {
    localStorage.setItem('bookmark-collections', JSON.stringify([
      { id: 'col-1', name: 'Existing', bookmarkIds: ['bm-1'] },
    ]));
    const result = importData(JSON.stringify({
      version: 1,
      exportedAt: '2025-01-01',
      readStatus: [],
      collections: [
        { id: 'col-1', name: 'Updated', bookmarkIds: ['bm-2'] },
        { id: 'col-2', name: 'New', bookmarkIds: ['bm-3'] },
      ],
      notes: {},
    }));
    expect(result.success).toBe(true);
    const cols = JSON.parse(localStorage.getItem('bookmark-collections')!);
    const col1 = cols.find((c: { id: string }) => c.id === 'col-1');
    expect(col1.bookmarkIds).toContain('bm-1');
    expect(col1.bookmarkIds).toContain('bm-2');
    const col2 = cols.find((c: { id: string }) => c.id === 'col-2');
    expect(col2).toBeDefined();
  });

  it('imports notes (overwrites by key)', () => {
    localStorage.setItem('bookmark-notes', JSON.stringify({ 'bm-1': 'old note' }));
    const result = importData(JSON.stringify({
      version: 1,
      exportedAt: '2025-01-01',
      readStatus: [],
      collections: [],
      notes: { 'bm-1': 'new note', 'bm-2': 'another' },
    }));
    expect(result.success).toBe(true);
    const notes = JSON.parse(localStorage.getItem('bookmark-notes')!);
    expect(notes['bm-1']).toBe('new note');
    expect(notes['bm-2']).toBe('another');
  });
});
