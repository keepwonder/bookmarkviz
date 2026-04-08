import { useState, useRef, useEffect, useMemo } from 'react';
import type { Bookmark } from '../lib/data';
import BookmarkDetail from './BookmarkDetail';
import { isRead, toggleRead } from '../lib/read-status';
import { getCollections, addToCollection, type Collection } from '../lib/collections';
import { hasNote, getNote } from '../lib/notes';
import { useI18n } from '../lib/i18n';

interface Props {
  bookmark: Bookmark;
  onReadChange?: () => void;
  highlight?: string;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  focused?: boolean;
  openSignal?: number;
  onOpenConsumed?: () => void;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = useMemo(() => {
    const result: { text: string; match: boolean }[] = [];
    const lower = text.toLowerCase();
    const q = query.toLowerCase();
    let last = 0;
    let idx = lower.indexOf(q);
    while (idx !== -1) {
      if (idx > last) result.push({ text: text.slice(last, idx), match: false });
      result.push({ text: text.slice(idx, idx + q.length), match: true });
      last = idx + q.length;
      idx = lower.indexOf(q, last);
    }
    if (last < text.length) result.push({ text: text.slice(last), match: false });
    return result;
  }, [text, query]);

  return (
    <>
      {parts.map((p, i) =>
        p.match
          ? <mark key={i} style={{ background: 'rgba(29,155,240,0.25)', color: 'inherit', borderRadius: '2px', padding: '0 1px' }}>{p.text}</mark>
          : <span key={i}>{p.text}</span>
      )}
    </>
  );
}

export default function BookmarkCard({ bookmark, onReadChange, highlight, selectable, selected, onSelect, focused, openSignal, onOpenConsumed }: Props) {
  const [showDetail, setShowDetail] = useState(false);
  const [read, setRead] = useState(() => isRead(bookmark.id));
  const [showColMenu, setShowColMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const { text, authorHandle, authorName, authorAvatar, engagement, postedAt } = bookmark;

  // Respond to keyboard open signal
  useEffect(() => {
    if (openSignal && openSignal > 0) {
      setShowDetail(true);
      onOpenConsumed?.();
    }
  }, [openSignal]);

  // Close collection menu on outside click
  useEffect(() => {
    if (!showColMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowColMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showColMenu]);

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleRead(bookmark.id);
    setRead(next);
    onReadChange?.();
  };

  const handleAddToCollection = (e: React.MouseEvent, col: Collection) => {
    e.stopPropagation();
    addToCollection(col.id, bookmark.id);
    setShowColMenu(false);
  };

  const collections = getCollections();
  const inAnyCollection = collections.some(c => c.bookmarkIds.includes(bookmark.id));

  return (
    <>
      <div
        className="w-full rounded-2xl p-4 transition-all duration-200 relative cursor-pointer hover-border-accent hover-bg"
        style={{
          background: 'var(--bg-secondary)',
          border: selected ? '2px solid var(--accent)' : focused ? '2px solid var(--accent)' : '1px solid var(--border)',
          boxShadow: focused ? '0 0 0 2px rgba(29,155,240,0.2)' : 'none',
        }}
        onClick={selectable ? onSelect : () => setShowDetail(true)}
      >
        <div className="flex gap-3">
          {/* Left control: checkbox in batch mode, read toggle in normal mode */}
          <div className="flex items-center pt-3 flex-shrink-0">
            {selectable ? (
              <div
                className="w-[22px] h-[22px] rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer"
                style={{
                  border: selected ? 'none' : '2px solid var(--text-tertiary)',
                  background: selected ? 'var(--accent)' : 'transparent',
                }}
              >
                {selected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ) : (
              <button
                onClick={handleToggleRead}
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
                style={{
                  border: read ? 'none' : '2px solid var(--accent)',
                  background: read ? 'var(--accent)' : 'transparent',
                }}
                title={read ? t.common.markAsUnread : t.common.markAsRead}
              >
                {read && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )}
          </div>
          <img src={authorAvatar} alt="" className="w-10 h-10 max-sm:w-8 max-sm:h-8 rounded-full flex-shrink-0" loading="lazy" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[15px]">
              <span className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                <Highlight text={authorName} query={highlight || ''} />
              </span>
              <span className="text-[15px] truncate" style={{ color: 'var(--text-secondary)' }}>
                @<Highlight text={authorHandle} query={highlight || ''} />
              </span>
              <span className="text-[15px] flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>·</span>
              <span className="text-[13px] flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                {new Date(postedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              </span>
              {/* Add to collection button */}
              <div className="ml-auto flex-shrink-0 relative" ref={menuRef}>
                <button
                  onClick={e => { e.stopPropagation(); setShowColMenu(!showColMenu); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer hover-color-accent hover-bg"
                  style={{ color: 'var(--text-tertiary)' }}
                  title={t.common.addToCollection}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={inAnyCollection ? 'var(--accent)' : 'none'} stroke={inAnyCollection ? 'var(--accent)' : 'currentColor'} strokeWidth={2}>
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                  </svg>
                </button>
                {showColMenu && (
                  <div
                    className="absolute right-0 top-9 w-48 rounded-xl shadow-lg z-50 py-1 animate-scale-in overflow-hidden"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    onClick={e => e.stopPropagation()}
                  >
                    {collections.length > 0 ? collections.map(col => (
                      <button
                        key={col.id}
                        onClick={e => handleAddToCollection(e, col)}
                        className="w-full px-3 py-2 text-[13px] text-left flex items-center gap-2 cursor-pointer transition-colors hover-bg"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <span>{col.emoji}</span>
                        <span className="truncate">{col.name}</span>
                        {col.bookmarkIds.includes(bookmark.id) && (
                          <svg className="w-3.5 h-3.5 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={3}>
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )) : (
                      <div className="px-3 py-3 text-[13px] text-center" style={{ color: 'var(--text-tertiary)' }}>
                        {t.common.noCollections}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className={`text-[15px] leading-[20px] mt-1 line-clamp-3 ${!read ? 'font-medium' : ''}`} style={{ color: 'var(--text-primary)' }}>
              <Highlight text={text} query={highlight || ''} />
            </p>
            <div className="flex gap-5 mt-3 text-[13px] max-sm:gap-3" style={{ color: 'var(--text-tertiary)' }}>
              <span className="flex items-center gap-1"><span>💬</span>{engagement.replyCount.toLocaleString()}</span>
              <span className="hidden sm:flex items-center gap-1"><span>🔄</span>{engagement.repostCount.toLocaleString()}</span>
              <span className="flex items-center gap-1"><span>❤️</span>{engagement.likeCount.toLocaleString()}</span>
              <span className="hidden sm:flex items-center gap-1"><span>🔖</span>{engagement.bookmarkCount.toLocaleString()}</span>
            </div>
            {hasNote(bookmark.id) && (
              <div className="mt-2 px-3 py-1.5 rounded-lg text-[13px] italic line-clamp-1" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                📝 {getNote(bookmark.id)}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetail && <BookmarkDetail bookmark={bookmark} onClose={() => setShowDetail(false)} />}
    </>
  );
}
