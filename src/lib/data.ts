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
    source?: 'api' | 'local' | 'demo';
  };
  bookmarks: Bookmark[];
  analytics: Analytics;
}

let cache: BookmarksData | null = null;
let lastAuthState: boolean | undefined = undefined;

export async function loadData(isAuthenticated?: boolean): Promise<BookmarksData | null> {
  // Clear cache when auth state changes
  if (isAuthenticated !== lastAuthState) {
    cache = null;
    lastAuthState = isAuthenticated;
  }

  if (cache) return cache;

  // 1. If authenticated, try API first
  if (isAuthenticated) {
    try {
      const { getBookmarks } = await import('./api');
      const apiData = await getBookmarks();
      if (apiData && apiData.bookmarks?.length) {
        apiData.meta.source = 'api';
        cache = apiData;
        return cache;
      }
    } catch {}
    // API returned no data — fall through to local IndexedDB
  }

  // 2. Try local IndexedDB
  try {
    const { loadFromDB } = await import('./db');
    const dbData = await loadFromDB();
    if (dbData) { dbData.meta.source = 'local'; cache = dbData; return cache; }
  } catch {}

  // 3. Fallback to demo data (unauthenticated only)
  if (!isAuthenticated) {
    const res = await fetch('/data/bookmarks.json');
    cache = await res.json();
    cache!.meta.source = 'demo';
    return cache!;
  }

  // Authenticated but no data anywhere
  return null;
}

export function setData(data: BookmarksData): void {
  cache = data;
}

export function clearCache(): void {
  cache = null;
}

export function parseDate(dateStr: string): Date {
  if (dateStr.includes('T')) return new Date(dateStr);
  return new Date(dateStr);
}
