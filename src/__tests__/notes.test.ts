import { describe, it, expect, beforeEach } from 'vitest';
import { getNote, setNote, deleteNote, hasNote } from '../lib/notes';

describe('notes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty string when no note exists', () => {
    expect(getNote('bm-1')).toBe('');
  });

  it('sets and gets a note', () => {
    setNote('bm-1', 'Great article');
    expect(getNote('bm-1')).toBe('Great article');
  });

  it('deletes a note', () => {
    setNote('bm-1', 'Remove me');
    deleteNote('bm-1');
    expect(getNote('bm-1')).toBe('');
  });

  it('hasNote returns correct boolean', () => {
    expect(hasNote('bm-1')).toBe(false);
    setNote('bm-1', 'test');
    expect(hasNote('bm-1')).toBe(true);
  });

  it('setting empty string deletes the note', () => {
    setNote('bm-1', 'Exists');
    setNote('bm-1', '   ');
    expect(getNote('bm-1')).toBe('');
    expect(hasNote('bm-1')).toBe(false);
  });
});
