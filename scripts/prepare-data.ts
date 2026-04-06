import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = process.env.BOOKMARKS_SOURCE || resolve(process.env.HOME || '~', '.ft-bookmarks', 'bookmarks.jsonl');
const OUTPUT = resolve(__dirname, '..', 'public', 'data', 'bookmarks.json');

interface RawBookmark {
  id: string;
  tweetId: string;
  url: string;
  text: string;
  authorHandle: string;
  authorName: string;
  authorProfileImageUrl: string;
  author?: {
    id: string;
    handle: string;
    name: string;
    profileImageUrl: string;
    bio?: string;
    followerCount?: number;
    followingCount?: number;
    isVerified?: boolean;
  };
  postedAt: string;
  bookmarkedAt: string | null;
  syncedAt: string;
  conversationId: string;
  language: string;
  possiblySensitive: boolean;
  engagement: {
    likeCount: number;
    repostCount: number;
    replyCount: number;
    quoteCount: number;
    bookmarkCount: number;
  };
  media: string[];
  mediaObjects: { type: string; url: string }[];
  links: string[];
  tags: string[];
  ingestedVia: string;
}

interface Bookmark {
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

interface PreparedData {
  meta: {
    totalBookmarks: number;
    dateRange: [string, string];
    totalAuthors: number;
    syncedAt: string;
  };
  bookmarks: Bookmark[];
  analytics: {
    dailyCounts: { date: string; count: number }[];
    topAuthors: { handle: string; name: string; count: number; avatar: string }[];
    contentTypeDist: { type: string; count: number }[];
    wordFrequencies: { word: string; weight: number }[];
    topEngagement: Bookmark[];
    authorConnections: { source: string; target: string; weight: number }[];
  };
}

function parseDate(dateStr: string): Date {
  // "Mon Apr 06 01:42:07 +0000 2026" or ISO
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

function extractWords(bookmarks: RawBookmark[]): { word: string; weight: number }[] {
  const freq = new Map<string, number>();
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or',
    'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'that', 'this',
    'it', 'its', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he',
    'she', 'they', 'them', 'their', 'what', 'which', 'who', 'when',
    'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
    'other', 'some', 'such', 'only', 'own', 'same', 'too', 'very',
    'just', 'also', 'about', 'up', 'out', 'https', 'http', 'tco',
    'com', 'www', 'amp', 'rt', 'via', 'like', 'get', 'got', 'go',
    'new', 'one', 'two', 'make', 'much', 'well', 'really', 'know',
    'think', 'see', 'look', 'come', 'take', 'want', 'give', 'use',
    'find', 'tell', 'ask', 'work', 'seem', 'feel', 'try', 'leave',
    'call', 'de', 'la', 'el', 'en', 'un', 'se', 'que', 'los',
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人',
    '都', '一', '个', '上', '也', '到', '说', '要', '去', '你',
    '会', '着', '没', '看', '好', '这', '他', '她', '它', '吗',
    '吧', '啊', '呢', '把', '还', '被', '让', '给', '从', '对',
    '与', '为', '等', '但', '而', '又', '很', '那', '些', '什么',
    '怎么', '为什么', '可以', '这个', '那个', '所以', '因为',
  ]);

  for (const b of bookmarks) {
    const text = b.text
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[^\w\u4e00-\u9fff]+/g, ' ');

    // Chinese words (bigram approach for short texts)
    const chinese = text.match(/[\u4e00-\u9fff]{2,}/g) || [];
    for (const word of chinese) {
      for (let i = 0; i < word.length - 1; i++) {
        const bigram = word.slice(i, i + 2);
        if (!stopWords.has(bigram)) {
          freq.set(bigram, (freq.get(bigram) || 0) + 1);
        }
      }
      if (word.length >= 4) {
        for (let i = 0; i < word.length - 3; i++) {
          const quad = word.slice(i, i + 4);
          freq.set(quad, (freq.get(quad) || 0) + 1);
        }
      }
    }

    // English words
    const english = text.match(/[a-zA-Z]{3,}/g) || [];
    for (const w of english) {
      const lower = w.toLowerCase();
      if (!stopWords.has(lower)) {
        freq.set(lower, (freq.get(lower) || 0) + 1);
      }
    }
  }

  return Array.from(freq.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 80)
    .map(([word, count]) => ({ word, weight: count }));
}

function buildAuthorConnections(bookmarks: RawBookmark[]): { source: string; target: string; weight: number }[] {
  // Group bookmarks by date, find co-occurring authors
  const dateAuthors = new Map<string, Set<string>>();
  for (const b of bookmarks) {
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
    .filter(([, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([key, weight]) => {
      const [source, target] = key.split('|');
      return { source, target, weight };
    });
}

// Main
const raw = readFileSync(SOURCE, 'utf-8');
const rawBookmarks: RawBookmark[] = raw
  .split('\n')
  .filter(l => l.trim())
  .map(l => JSON.parse(l));

const bookmarks: Bookmark[] = rawBookmarks.map(b => ({
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

// Sort by postedAt descending
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
  if (existing) {
    existing.count++;
  } else {
    authorMap.set(b.authorHandle, { name: b.authorName, count: 1, avatar: b.authorAvatar });
  }
}
const topAuthors = Array.from(authorMap.entries())
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 20)
  .map(([handle, data]) => ({ handle, ...data }));

// Content type dist
const typeMap = new Map<string, number>();
for (const b of bookmarks) {
  typeMap.set(b.contentType, (typeMap.get(b.contentType) || 0) + 1);
}
const contentTypeDist = Array.from(typeMap.entries())
  .map(([type, count]) => ({ type, count }))
  .sort((a, b) => b.count - a.count);

// Top engagement
const topEngagement = [...bookmarks]
  .sort((a, b) => (b.engagement.likeCount + b.engagement.bookmarkCount) - (a.engagement.likeCount + a.engagement.bookmarkCount))
  .slice(0, 10);

const dates = bookmarks.map(b => parseDate(b.postedAt));
dates.sort((a, b) => a.getTime() - b.getTime());

const data: PreparedData = {
  meta: {
    totalBookmarks: bookmarks.length,
    dateRange: [formatDate(dates[0]), formatDate(dates[dates.length - 1])],
    totalAuthors: authorMap.size,
    syncedAt: new Date().toISOString(),
  },
  bookmarks,
  analytics: {
    dailyCounts,
    topAuthors,
    contentTypeDist,
    wordFrequencies: extractWords(rawBookmarks),
    topEngagement,
    authorConnections: buildAuthorConnections(rawBookmarks),
  },
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
console.log(`Prepared ${bookmarks.length} bookmarks → ${OUTPUT}`);
