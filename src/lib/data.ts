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

function isNewer(a: BookmarksData, b: BookmarksData): boolean {
  const ta = a.meta.syncedAt ? new Date(a.meta.syncedAt).getTime() : 0;
  const tb = b.meta.syncedAt ? new Date(b.meta.syncedAt).getTime() : 0;
  return ta > tb;
}

export async function loadData(isAuthenticated?: boolean): Promise<BookmarksData | null> {
  // Clear cache when auth state changes
  if (isAuthenticated !== lastAuthState) {
    cache = null;
    lastAuthState = isAuthenticated;
  }

  if (cache) return cache;

  // Load from API and IndexedDB in parallel, pick the newer one
  const apiPromise = isAuthenticated
    ? (async () => {
        try {
          const { getBookmarks } = await import('./api');
          const d = await getBookmarks();
          if (d && d.bookmarks?.length) { d.meta.source = 'api'; return d; }
        } catch {}
        return null;
      })()
    : Promise.resolve(null);

  const localPromise = (async () => {
    try {
      const { loadFromDB } = await import('./db');
      const d = await loadFromDB();
      if (d) { d.meta.source = 'local'; return d; }
    } catch {}
    return null;
  })();

  const [apiData, localData] = await Promise.all([apiPromise, localPromise]);

  // Pick whichever is newer
  if (apiData && localData) {
    cache = isNewer(localData, apiData) ? localData : apiData;
  } else {
    cache = apiData || localData;
  }

  if (cache) return cache;

  // Fallback to demo data (unauthenticated only)
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
