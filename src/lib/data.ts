export interface Bookmark {
  id: string;
  text: string;
  authorHandle: string;
  authorName: string;
  authorAvatar: string;
  authorVerified: boolean;
  postedAt: string;
  language: string;
  engagement: {
    likeCount: number;
    repostCount: number;
    replyCount: number;
    quoteCount: number;
    bookmarkCount: number;
  };
  contentType: 'article' | 'video' | 'image' | 'text';
  url: string;
  links: string[];
}

export interface Analytics {
  dailyCounts: { date: string; count: number }[];
  topAuthors: { handle: string; name: string; count: number; avatar: string }[];
  contentTypeDist: { type: string; count: number }[];
  wordFrequencies: { word: string; weight: number }[];
  topEngagement: Bookmark[];
  authorConnections: { source: string; target: string; weight: number }[];
}

export interface BookmarksData {
  meta: {
    totalBookmarks: number;
    dateRange: [string, string];
    totalAuthors: number;
    syncedAt: string;
  };
  bookmarks: Bookmark[];
  analytics: Analytics;
}

let cache: BookmarksData | null = null;

export async function loadData(): Promise<BookmarksData> {
  if (cache) return cache;

  try {
    const { loadFromDB } = await import('./db');
    const dbData = await loadFromDB();
    if (dbData) { cache = dbData; return cache; }
  } catch {}

  const res = await fetch('/data/bookmarks.json');
  cache = await res.json();
  return cache!;
}

export function setData(data: BookmarksData): void {
  cache = data;
}

export function parseDate(dateStr: string): Date {
  if (dateStr.includes('T')) return new Date(dateStr);
  return new Date(dateStr);
}
