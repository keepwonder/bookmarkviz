import { CONTENT_CACHE_TTL, MAX_CONTENT_LENGTH, PREFETCH_CONCURRENCY } from './constants';

interface CachedContent {
  url: string;
  title: string;
  description: string;
  content: string;       // markdown body
  fetchedAt: number;     // timestamp
}

const DB_NAME = 'bookmarkviz';
const STORE = 'content-cache';
const CACHE_TTL = CONTENT_CACHE_TTL;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'url' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getFromCache(url: string): Promise<CachedContent | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(url);
      req.onsuccess = () => {
        const cached = req.result as CachedContent | undefined;
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
          resolve(cached);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function saveToCache(content: CachedContent): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(content);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* ignore */ }
}

export interface FetchedContent {
  title: string;
  description: string;
  content: string;
  fromCache: boolean;
}

export async function fetchUrlContent(url: string): Promise<FetchedContent> {
  // Check cache first
  const cached = await getFromCache(url);
  if (cached) {
    return {
      title: cached.title,
      description: cached.description,
      content: cached.content,
      fromCache: true,
    };
  }

  // Fetch via Jina Reader API
  try {
    const res = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
      headers: {
        'Accept': 'text/markdown',
        'X-Return-Format': 'markdown',
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const markdown = await res.text();

    // Extract title and description from the markdown
    const lines = markdown.split('\n');
    let title = '';
    let description = '';
    const contentLines: string[] = [];

    for (const line of lines) {
      if (!title && line.startsWith('Title: ')) {
        title = line.replace('Title: ', '').trim();
        continue;
      }
      if (!description && line.startsWith('Description: ')) {
        description = line.replace('Description: ', '').trim();
        continue;
      }
      contentLines.push(line);
    }

    const content = contentLines.join('\n').trim();
    const result: FetchedContent = {
      title: title || new URL(url).hostname,
      description: description || '',
      content: content.slice(0, MAX_CONTENT_LENGTH),
      fromCache: false,
    };

    // Save to cache
    saveToCache({
      url,
      title: result.title,
      description: result.description,
      content: result.content,
      fetchedAt: Date.now(),
    });

    return result;
  } catch (e) {
    return {
      title: new URL(url).hostname,
      description: '',
      content: `Failed to fetch content: ${e instanceof Error ? e.message : 'Unknown error'}`,
      fromCache: false,
    };
  }
}

/**
 * Resolve a bookmark's external URL for content fetching.
 * Returns null if there's no fetchable external content (e.g., X articles, pure text).
 */
export async function resolveBookmarkUrl(
  text: string,
  links: string[],
): Promise<{ url: string; type: 'external' | 'x-article' | 'none' }> {
  // 1. Check links array for real external URLs (not x.com internal)
  const externalLink = links.find(l => {
    try {
      const u = new URL(l);
      return u.hostname !== 'x.com' && u.hostname !== 'twitter.com' &&
             u.hostname !== 'www.x.com' && u.hostname !== 'www.twitter.com';
    } catch { return false; }
  });

  if (externalLink) {
    return { url: externalLink, type: 'external' };
  }

  // 2. If links only contain x.com/i/article, the t.co in text resolves there too
  const hasXArticle = links.some(l => l.includes('x.com/i/article') || l.includes('twitter.com/i/article'));
  if (hasXArticle) {
    return { url: '', type: 'x-article' };
  }

  // 3. Text has t.co but no links info — pass to Jina Reader directly (it follows redirects)
  const tcoMatch = text.match(/https?:\/\/t\.co\/\S+/);
  if (tcoMatch) {
    return { url: tcoMatch[0], type: 'external' };
  }

  // 4. No links at all
  return { url: '', type: 'none' };
}

// Batch pre-fetch for a list of URLs
export async function prefetchUrls(urls: string[]): Promise<void> {
  // Check which are already cached
  const cacheChecks = await Promise.all(urls.map(url => getFromCache(url)));
  const toFetch = urls.filter((_, i) => !cacheChecks[i]);
  // Fetch up to 3 in parallel
  for (let i = 0; i < toFetch.length; i += PREFETCH_CONCURRENCY) {
    const batch = toFetch.slice(i, i + 3);
    await Promise.all(batch.map(url => fetchUrlContent(url).catch(() => {})));
  }
}

// Get all cached content entries (for full-text search)
export async function getAllCachedContent(): Promise<CachedContent[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as CachedContent[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
