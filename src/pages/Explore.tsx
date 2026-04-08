import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { loadData } from '../lib/data';
import type { BookmarksData } from '../lib/data';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import { isRead, markAsRead } from '../lib/read-status';
import { getAllCachedContent } from '../lib/content-fetcher';
import { getCollections, addToCollection, type Collection } from '../lib/collections';
import BookmarkCard from '../components/BookmarkCard';
import { PAGE_SIZE, DEBOUNCE_MS } from '../lib/constants';

type SortKey = 'date' | 'likes' | 'bookmarks';
type ReadFilter = 'all' | 'unread' | 'read';

export default function Explore() {
  const [data, setData] = useState<BookmarksData | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [sort, setSort] = useState<SortKey>('date');
  const [page, setPage] = useState(1);
  const [readVersion, setReadVersion] = useState(0);
  const [cachedContentMap, setCachedContentMap] = useState<Map<string, string>>(new Map());
  const [openId, setOpenId] = useState<string | null>(null);
  // Batch selection
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showColPicker, setShowColPicker] = useState(false);
  // Keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const e = t.explore;

  useEffect(() => { loadData(isAuthenticated).then(setData); }, [isAuthenticated]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getAllCachedContent().then(entries => {
      const map = new Map<string, string>();
      for (const entry of entries) {
        map.set(entry.url, `${entry.title} ${entry.description} ${entry.content}`.toLowerCase());
      }
      setCachedContentMap(map);
    });
  }, []);

  useEffect(() => { setPage(1); }, [debouncedSearch, authorFilter, typeFilter, readFilter, sort, readVersion]);

  const onReadChange = useCallback(() => setReadVersion(v => v + 1), []);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = [...data.bookmarks];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(b => {
        if (b.text.toLowerCase().includes(q)) return true;
        if (b.authorHandle.toLowerCase().includes(q) || b.authorName.toLowerCase().includes(q)) return true;
        for (const link of b.links) {
          const cached = cachedContentMap.get(link);
          if (cached && cached.includes(q)) return true;
        }
        const tcoMatch = b.text.match(/https?:\/\/t\.co\/\S+/);
        if (tcoMatch) {
          const cached = cachedContentMap.get(tcoMatch[0]);
          if (cached && cached.includes(q)) return true;
        }
        return false;
      });
    }
    if (authorFilter) list = list.filter(b => b.authorHandle === authorFilter);
    if (typeFilter) list = list.filter(b => b.contentType === typeFilter);
    if (readFilter === 'unread') list = list.filter(b => !isRead(b.id));
    if (readFilter === 'read') list = list.filter(b => isRead(b.id));
    switch (sort) {
      case 'likes': list.sort((a, b) => b.engagement.likeCount - a.engagement.likeCount); break;
      case 'bookmarks': list.sort((a, b) => b.engagement.bookmarkCount - a.engagement.bookmarkCount); break;
      default: break;
    }
    return list;
  }, [data, debouncedSearch, authorFilter, typeFilter, readFilter, sort, readVersion, cachedContentMap]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleBatchMarkRead = () => {
    selectedIds.forEach(id => markAsRead(id));
    setSelectedIds(new Set());
    setBatchMode(false);
    onReadChange();
  };

  const handleBatchAddToCollection = (col: Collection) => {
    selectedIds.forEach(id => addToCollection(col.id, id));
    setSelectedIds(new Set());
    setShowColPicker(false);
    setBatchMode(false);
  };

  const exitBatchMode = () => {
    setBatchMode(false);
    setSelectedIds(new Set());
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const len = paged.length;
      switch (e.key) {
        case 'j': case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(i => Math.min(len - 1, i < 0 ? 0 : i + 1));
          break;
        case 'k': case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(i => Math.max(0, i < 0 ? 0 : i - 1));
          break;
        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < len) {
            setOpenId(paged[focusedIndex].id);
          }
          break;
        case 'Escape':
          setFocusedIndex(-1);
          if (batchMode) exitBatchMode();
          break;
        case 'x':
          if (batchMode && focusedIndex >= 0 && focusedIndex < len) {
            toggleSelect(paged[focusedIndex].id);
          }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [paged, focusedIndex, batchMode]);

  // Scroll focused card into view
  useEffect(() => {
    if (focusedIndex >= 0 && cardRefs.current[focusedIndex]) {
      cardRefs.current[focusedIndex]!.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedIndex]);

  // Reset focus when page/filter changes
  useEffect(() => { setFocusedIndex(-1); cardRefs.current = []; }, [search, typeFilter, readFilter, sort, page]);

  const collections = getCollections();

  if (!data) {
    return <div className="flex items-center justify-center h-[60vh]"><div className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>{t.loading}</div></div>;
  }

  return (
    <main className="max-w-[900px] mx-auto px-5 py-6">
      <h1 className="text-xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>{e.title}</h1>

      {/* Search + Batch toggle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--text-tertiary)" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder={e.searchPlaceholder}
            value={search}
            onChange={ev => setSearch(ev.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full text-[15px] outline-none transition-colors"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            onFocus={ev => { ev.target.style.borderColor = 'var(--accent)'; }}
            onBlur={ev => { ev.target.style.borderColor = 'var(--border)'; }}
          />
          {search && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              {e.searchExtended}
            </span>
          )}
        </div>
      </div>

      {/* Filter toggle (mobile) */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="sm:hidden flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors"
        style={{
          background: showFilters ? 'var(--accent-bg)' : 'transparent',
          color: showFilters ? 'var(--accent)' : 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M3 4h18M3 12h18M3 20h18" />
        </svg>
        {t.common.filters}
      </button>

      {/* Filter chips */}
      <div className={`flex flex-wrap gap-2 mb-5 ${showFilters ? '' : 'max-sm:hidden'}`}>
        {/* Author filter */}
        {data && (() => {
          const authors = [...new Map(data.bookmarks.map(b => [b.authorHandle, b.authorName])).entries()]
            .sort((a, b) => a[1].localeCompare(b[1]));
          return authors.length > 1 ? (
            <select
              value={authorFilter}
              onChange={ev => setAuthorFilter(ev.target.value)}
              className="px-3 py-1.5 rounded-full text-[14px] outline-none cursor-pointer appearance-none max-w-[160px] truncate"
              style={{
                background: authorFilter ? 'var(--accent)' : 'transparent',
                color: authorFilter ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${authorFilter ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              <option value="" style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>{e.allAuthors}</option>
              {authors.map(([handle, name]) => (
                <option key={handle} value={handle} style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>@{handle}{name !== handle ? ` ${name}` : ''}</option>
              ))}
            </select>
          ) : null;
        })()}

        <span className="mx-1" style={{ borderLeft: '1px solid var(--border)' }} />

        {([
          { value: '', label: e.allTypes },
          { value: 'article', label: e.typeArticle },
          { value: 'text', label: e.typeText },
          { value: 'video', label: e.typeVideo },
        ] as const).map(f => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className="px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors cursor-pointer"
            style={{
              background: typeFilter === f.value ? 'var(--accent)' : 'transparent',
              color: typeFilter === f.value ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${typeFilter === f.value ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >{f.label}</button>
        ))}

        <span className="mx-1" style={{ borderLeft: '1px solid var(--border)' }} />
        {([
          { value: 'all' as const, label: e.filterAll },
          { value: 'unread' as const, label: e.filterUnread },
          { value: 'read' as const, label: e.filterRead },
        ]).map(f => (
          <button
            key={f.value}
            onClick={() => setReadFilter(f.value)}
            className="px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors cursor-pointer"
            style={{
              background: readFilter === f.value ? 'var(--accent)' : 'transparent',
              color: readFilter === f.value ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${readFilter === f.value ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >{f.label}</button>
        ))}
      </div>

      {/* Sort + Batch toggle */}
      <div className="flex items-center gap-4 mb-5 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
        <span>{filtered.length} {e.results}{totalPages > 1 ? ` · ${page}/${totalPages}` : ''}</span>
        <div className="flex gap-1">
          {([['date', e.sortByDate], ['likes', e.sortByLikes], ['bookmarks', e.sortByBookmarks]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className="px-3 py-1 rounded-full text-[13px] transition-colors cursor-pointer"
              style={{
                background: sort === k ? 'var(--accent-bg)' : 'transparent',
                color: sort === k ? 'var(--accent)' : 'var(--text-tertiary)',
              }}
            >{label}</button>
          ))}
        </div>
        <div className="ml-auto">
          <button
            onClick={() => batchMode ? exitBatchMode() : setBatchMode(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] transition-colors cursor-pointer"
            style={{
              background: batchMode ? 'var(--accent)' : 'transparent',
              color: batchMode ? '#fff' : 'var(--text-tertiary)',
              border: `1px solid ${batchMode ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            {batchMode ? e.batchCancel : e.batchSelect}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-3">
        {paged.map((b, i) => (
          <div key={b.id} ref={el => { cardRefs.current[i] = el; }}>
            <BookmarkCard
              bookmark={b}
              onReadChange={onReadChange}
              highlight={search}
              selectable={batchMode}
              selected={selectedIds.has(b.id)}
              onSelect={() => toggleSelect(b.id)}
              focused={i === focusedIndex}
              openSignal={openId === b.id ? Date.now() : 0}
              onOpenConsumed={() => setOpenId(null)}
            />
          </div>
        ))}
      </div>

      {!filtered.length && <div className="text-center py-20 text-[15px]" style={{ color: 'var(--text-tertiary)' }}>{e.noResults}</div>}

      {/* Batch action bar */}
      {batchMode && selectedIds.size > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg z-50 animate-scale-in"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {e.batchSelected.replace('{n}', String(selectedIds.size))}
          </span>
          <button
            onClick={handleBatchMarkRead}
            className="px-4 py-1.5 rounded-full text-[13px] font-bold text-white cursor-pointer"
            style={{ background: 'var(--accent)' }}
          >{e.batchMarkRead}</button>
          <div className="relative">
            <button
              onClick={() => setShowColPicker(!showColPicker)}
              className="px-4 py-1.5 rounded-full text-[13px] font-bold cursor-pointer"
              style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
            >{e.batchAddCollection}</button>
            {showColPicker && (
              <div
                className="absolute bottom-12 left-0 w-48 rounded-xl shadow-lg z-50 py-1 animate-scale-in overflow-hidden"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                {collections.length > 0 ? collections.map(col => (
                  <button
                    key={col.id}
                    onClick={() => handleBatchAddToCollection(col)}
                    className="w-full px-3 py-2 text-[13px] text-left flex items-center gap-2 cursor-pointer transition-colors hover-bg"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span>{col.emoji}</span>
                    <span className="truncate">{col.name}</span>
                  </button>
                )) : (
                  <div className="px-3 py-3 text-[13px] text-center" style={{ color: 'var(--text-tertiary)' }}>
                    {e.batchNoCollections}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-5 py-2 rounded-full text-[14px] font-bold transition-colors disabled:opacity-30 cursor-pointer"
            style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >{e.prevPage}</button>
          {generatePages(page, totalPages).map((p, i) =>
            p === '...' ? (
              <span key={`d${i}`} style={{ color: 'var(--text-tertiary)' }}>...</span>
            ) : (
              <button key={p} onClick={() => setPage(p as number)}
                className="w-9 h-9 rounded-full text-[14px] transition-colors cursor-pointer"
                style={{
                  background: page === p ? 'var(--accent)' : 'transparent',
                  color: page === p ? '#fff' : 'var(--text-secondary)',
                }}
              >{p}</button>
            )
          )}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-5 py-2 rounded-full text-[14px] font-bold transition-colors disabled:opacity-30 cursor-pointer"
            style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >{e.nextPage}</button>
        </div>
      )}
    </main>
  );
}

function generatePages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}
