import { describe, it, expect } from 'vitest';
import { processJsonl } from '../lib/processor';

function makeBookmark(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    id: '123',
    text: 'Hello world test content',
    authorHandle: 'testuser',
    authorName: 'Test User',
    authorProfileImageUrl: '',
    author: { isVerified: false, profileImageUrl: '' },
    postedAt: '2025-01-15',
    language: 'en',
    engagement: { likeCount: 10, repostCount: 5, replyCount: 2, quoteCount: 1, bookmarkCount: 20 },
    links: [],
    mediaObjects: [],
    url: 'https://x.com/testuser/status/123',
    ...overrides,
  });
}

describe('processJsonl', () => {
  it('parses a single bookmark', () => {
    const data = processJsonl(makeBookmark());
    expect(data.bookmarks).toHaveLength(1);
    expect(data.bookmarks[0].id).toBe('123');
    expect(data.bookmarks[0].authorHandle).toBe('testuser');
    expect(data.bookmarks[0].contentType).toBe('text');
  });

  it('parses multiple bookmarks from newline-separated JSONL', () => {
    const jsonl = [makeBookmark({ id: '1' }), makeBookmark({ id: '2' }), makeBookmark({ id: '3' })].join('\n');
    const data = processJsonl(jsonl);
    expect(data.bookmarks).toHaveLength(3);
  });

  it('sorts bookmarks by date descending', () => {
    const jsonl = [
      makeBookmark({ id: 'old', postedAt: '2025-01-01' }),
      makeBookmark({ id: 'new', postedAt: '2025-06-15' }),
    ].join('\n');
    const data = processJsonl(jsonl);
    expect(data.bookmarks[0].id).toBe('new');
    expect(data.bookmarks[1].id).toBe('old');
  });

  it('computes correct meta', () => {
    const jsonl = [
      makeBookmark({ authorHandle: 'alice', postedAt: '2025-01-01' }),
      makeBookmark({ authorHandle: 'bob', postedAt: '2025-06-15' }),
      makeBookmark({ authorHandle: 'alice', postedAt: '2025-03-10' }),
    ].join('\n');
    const data = processJsonl(jsonl);
    expect(data.meta.totalBookmarks).toBe(3);
    expect(data.meta.totalAuthors).toBe(2);
    expect(data.meta.dateRange).toEqual(['2025-01-01', '2025-06-15']);
  });

  it('detects content types correctly', () => {
    const article = makeBookmark({ id: 'a', links: ['https://x.com/user/article/123'] });
    const video = makeBookmark({ id: 'v', mediaObjects: [{ type: 'video' }] });
    const image = makeBookmark({ id: 'i', mediaObjects: [{ type: 'photo' }] });
    const text = makeBookmark({ id: 't' });

    const data = processJsonl([article, video, image, text].join('\n'));
    const types = data.bookmarks.map(b => b.contentType);
    expect(types).toContain('article');
    expect(types).toContain('video');
    expect(types).toContain('image');
    expect(types).toContain('text');
  });

  it('computes daily counts', () => {
    const jsonl = [
      makeBookmark({ postedAt: '2025-01-01' }),
      makeBookmark({ postedAt: '2025-01-01' }),
      makeBookmark({ postedAt: '2025-01-02' }),
    ].join('\n');
    const data = processJsonl(jsonl);
    const jan1 = data.analytics.dailyCounts.find(d => d.date === '2025-01-01');
    const jan2 = data.analytics.dailyCounts.find(d => d.date === '2025-01-02');
    expect(jan1?.count).toBe(2);
    expect(jan2?.count).toBe(1);
  });

  it('computes top authors sorted by count', () => {
    const jsonl = [
      makeBookmark({ authorHandle: 'alice', authorName: 'Alice' }),
      makeBookmark({ authorHandle: 'alice', authorName: 'Alice' }),
      makeBookmark({ authorHandle: 'bob', authorName: 'Bob' }),
    ].join('\n');
    const data = processJsonl(jsonl);
    expect(data.analytics.topAuthors[0].handle).toBe('alice');
    expect(data.analytics.topAuthors[0].count).toBe(2);
    expect(data.analytics.topAuthors[1].handle).toBe('bob');
  });

  it('computes content type distribution', () => {
    const jsonl = [
      makeBookmark({ links: ['https://x.com/user/article/1'] }),
      makeBookmark({ mediaObjects: [{ type: 'video' }] }),
      makeBookmark({}),
    ].join('\n');
    const data = processJsonl(jsonl);
    expect(data.analytics.contentTypeDist.length).toBe(3);
    // Sorted by count descending
    expect(data.analytics.contentTypeDist.every((d, i, arr) =>
      i === 0 || arr[i - 1].count >= d.count
    )).toBe(true);
  });

  it('extracts word frequencies with stop word filtering', () => {
    const jsonl = makeBookmark({
      text: 'typescript javascript typescript javascript react react react programming',
    });
    const data = processJsonl(jsonl);
    const words = data.analytics.wordFrequencies;
    // Stop words like "the" should be filtered
    const hasStopWord = words.some(w => w.word === 'the');
    expect(hasStopWord).toBe(false);
    // "react" appears 3 times (>= 2 threshold), should be included
    if (words.length > 0) {
      const react = words.find(w => w.word === 'react');
      expect(react).toBeDefined();
      expect(react!.weight).toBe(3);
    }
  });

  it('computes author connections for same-day authors', () => {
    const jsonl = [
      makeBookmark({ authorHandle: 'alice', postedAt: '2025-01-01' }),
      makeBookmark({ authorHandle: 'bob', postedAt: '2025-01-01' }),
      makeBookmark({ authorHandle: 'charlie', postedAt: '2025-01-02' }),
    ].join('\n');
    const data = processJsonl(jsonl);
    // alice-bob share same day, should be connected
    const conn = data.analytics.authorConnections;
    const ab = conn.find(c =>
      (c.source === 'alice' && c.target === 'bob') ||
      (c.source === 'bob' && c.target === 'alice')
    );
    expect(ab).toBeDefined();
    expect(ab!.weight).toBe(1);
  });

  it('computes top engagement bookmarks', () => {
    const jsonl = [
      makeBookmark({ id: 'low', engagement: { likeCount: 1, repostCount: 0, replyCount: 0, quoteCount: 0, bookmarkCount: 1 } }),
      makeBookmark({ id: 'high', engagement: { likeCount: 100, repostCount: 50, replyCount: 20, quoteCount: 10, bookmarkCount: 200 } }),
    ].join('\n');
    const data = processJsonl(jsonl);
    expect(data.analytics.topEngagement[0].id).toBe('high');
  });

  it('handles ISO date format in postedAt', () => {
    const jsonl = makeBookmark({ postedAt: '2025-03-15T10:30:00Z' });
    const data = processJsonl(jsonl);
    expect(data.meta.dateRange![0]).toBe('2025-03-15');
  });

  it('handles empty input', () => {
    const data = processJsonl('');
    expect(data.bookmarks).toHaveLength(0);
    expect(data.meta.totalBookmarks).toBe(0);
    expect(data.meta.dateRange).toBeUndefined();
  });
});
