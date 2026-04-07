import type { BookmarksData, Bookmark, Analytics } from './data';

interface RawBookmark {
  id: string;
  text: string;
  authorHandle: string;
  authorName: string;
  authorProfileImageUrl: string;
  author?: { isVerified?: boolean; profileImageUrl?: string };
  postedAt: string;
  language: string;
  engagement: {
    likeCount: number;
    repostCount: number;
    replyCount: number;
    quoteCount: number;
    bookmarkCount: number;
  };
  links: string[];
  mediaObjects: { type: string }[];
  url: string;
}

function parseDate(dateStr: string): Date {
  if (dateStr.includes('T')) return new Date(dateStr);
  return new Date(dateStr);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getContentType(b: RawBookmark): Bookmark['contentType'] {
  if (b.links.some(l => l.includes('/article/'))) return 'article';
  if (b.mediaObjects.some(m => m.type === 'video')) return 'video';
  if (b.mediaObjects.some(m => m.type === 'photo')) return 'image';
  return 'text';
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
  'and', 'but', 'or', 'not', 'if', 'then', 'than', 'that', 'this', 'it',
  'its', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they',
  'what', 'which', 'who', 'when', 'how', 'all', 'more', 'most', 'other',
  'some', 'just', 'also', 'about', 'up', 'out', 'https', 'http', 'tco',
  'com', 'www', 'amp', 'rt', 'like', 'get', 'new', 'one', 'make', 'know',
  'see', 'use', 'work', 'really', '的', '了', '在', '是', '我', '有', '和',
  '就', '不', '人', '都', '一', '个', '上', '也', '到', '说', '要', '去',
  '你', '会', '着', '没', '看', '好', '这', '他', '她', '它', '吗', '吧',
  '啊', '呢', '把', '还', '被', '让', '给', '从', '对', '与', '为', '等',
  '但', '而', '又', '很', '那', '些', '什么', '怎么', '可以', '这个',
]);

function extractWords(raw: RawBookmark[]): { word: string; weight: number }[] {
  const freq = new Map<string, number>();
  for (const b of raw) {
    const text = b.text.replace(/https?:\/\/\S+/g, '').replace(/[^\w\u4e00-\u9fff]+/g, ' ');
    const chinese = text.match(/[\u4e00-\u9fff]{2,}/g) || [];
    for (const word of chinese) {
      for (let i = 0; i < word.length - 1; i++) {
        const bigram = word.slice(i, i + 2);
        if (!STOP_WORDS.has(bigram)) freq.set(bigram, (freq.get(bigram) || 0) + 1);
      }
    }
    const english = text.match(/[a-zA-Z]{3,}/g) || [];
    for (const w of english) {
      const lower = w.toLowerCase();
      if (!STOP_WORDS.has(lower)) freq.set(lower, (freq.get(lower) || 0) + 1);
    }
  }
  return Array.from(freq.entries())
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 80)
    .map(([word, weight]) => ({ word, weight }));
}

function buildAuthorConnections(raw: RawBookmark[]): { source: string; target: string; weight: number }[] {
  const dateAuthors = new Map<string, Set<string>>();
  for (const b of raw) {
    const date = formatDate(parseDate(b.postedAt));
    if (!dateAuthors.has(date)) dateAuthors.set(date, new Set());
    dateAuthors.get(date)!.add(b.authorHandle);
  }
  const pairCount = new Map<string, number>();
  for (const authors of dateAuthors.values()) {
    const list = Array.from(authors);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const key = [list[i], list[j]].sort().join('|');
        pairCount.set(key, (pairCount.get(key) || 0) + 1);
      }
    }
  }
  return Array.from(pairCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([key, weight]) => {
      const [source, target] = key.split('|');
      return { source, target, weight };
    });
}

export function processJsonl(jsonl: string): BookmarksData {
  const raw: RawBookmark[] = jsonl
    .split('\n')
    .filter(l => l.trim())
    .map(l => JSON.parse(l));

  const bookmarks: Bookmark[] = raw.map(b => ({
    id: b.id,
    text: b.text,
    authorHandle: b.authorHandle,
    authorName: b.authorName,
    authorAvatar: b.author?.profileImageUrl || b.authorProfileImageUrl,
    authorVerified: b.author?.isVerified || false,
    postedAt: b.postedAt,
    language: b.language,
    engagement: b.engagement,
    contentType: getContentType(b),
    url: b.url,
    links: b.links,
  }));

  bookmarks.sort((a, b) => parseDate(b.postedAt).getTime() - parseDate(a.postedAt).getTime());

  // Daily counts
  const dailyMap = new Map<string, number>();
  for (const b of bookmarks) {
    const date = formatDate(parseDate(b.postedAt));
    dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
  }
  const dailyCounts = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Top authors
  const authorMap = new Map<string, { name: string; count: number; avatar: string }>();
  for (const b of bookmarks) {
    const existing = authorMap.get(b.authorHandle);
    if (existing) { existing.count++; }
    else { authorMap.set(b.authorHandle, { name: b.authorName, count: 1, avatar: b.authorAvatar }); }
  }
  const topAuthors = Array.from(authorMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .map(([handle, data]) => ({ handle, ...data }));

  // Content type dist
  const typeMap = new Map<string, number>();
  for (const b of bookmarks) typeMap.set(b.contentType, (typeMap.get(b.contentType) || 0) + 1);
  const contentTypeDist = Array.from(typeMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Top engagement
  const topEngagement = [...bookmarks]
    .sort((a, b) => (b.engagement.likeCount + b.engagement.bookmarkCount) - (a.engagement.likeCount + a.engagement.bookmarkCount))
    .slice(0, 10);

  const dates = bookmarks.map(b => parseDate(b.postedAt));
  dates.sort((a, b) => a.getTime() - b.getTime());

  const analytics: Analytics = {
    dailyCounts,
    topAuthors,
    contentTypeDist,
    wordFrequencies: extractWords(raw),
    topEngagement,
    authorConnections: buildAuthorConnections(raw),
  };

  return {
    meta: {
      totalBookmarks: bookmarks.length,
      dateRange: dates.length ? [formatDate(dates[0]), formatDate(dates[dates.length - 1])] : undefined,
      totalAuthors: authorMap.size,
      syncedAt: new Date().toISOString(),
    },
    bookmarks,
    analytics,
  };
}
