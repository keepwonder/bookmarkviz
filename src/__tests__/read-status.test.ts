import { describe, it, expect, beforeEach } from 'vitest';
import { isRead, getReadCount, markAsRead, markAsUnread, toggleRead } from '../lib/read-status';

describe('read-status', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with nothing read', () => {
    expect(isRead('bm-1')).toBe(false);
  });

  it('marks as read', () => {
    markAsRead('bm-1');
    expect(isRead('bm-1')).toBe(true);
  });

  it('marks as unread', () => {
    markAsRead('bm-1');
    markAsUnread('bm-1');
    expect(isRead('bm-1')).toBe(false);
  });

  it('toggles read status', () => {
    const result1 = toggleRead('bm-1');
    expect(result1).toBe(true);
    expect(isRead('bm-1')).toBe(true);
    const result2 = toggleRead('bm-1');
    expect(result2).toBe(false);
    expect(isRead('bm-1')).toBe(false);
  });

  it('counts read items', () => {
    markAsRead('bm-1');
    markAsRead('bm-2');
    markAsRead('bm-3');
    const count = getReadCount(['bm-1', 'bm-2', 'bm-4']);
    expect(count).toBe(2);
  });
});
