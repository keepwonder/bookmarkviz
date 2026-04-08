import { useState, useEffect, useRef } from 'react';
import type { Bookmark } from '../lib/data';
import { getNote, setNote } from '../lib/notes';
import { isRead, toggleRead } from '../lib/read-status';
import { getCollections, addToCollection, type Collection } from '../lib/collections';
import { useI18n } from '../lib/i18n';

interface Props {
  bookmark: Bookmark;
  onClose: () => void;
}

function getExternalLinks(text: string, links: string[]): { url: string; domain: string }[] {
  const seen = new Set<string>();
  const results: { url: string; domain: string }[] = [];

  for (const link of links) {
    try {
      const u = new URL(link);
      if (u.hostname === 'x.com' || u.hostname === 'twitter.com' ||
          u.hostname === 'www.x.com' || u.hostname === 'www.twitter.com') continue;
      if (seen.has(link)) continue;
      seen.add(link);
      results.push({ url: link, domain: u.hostname.replace('www.', '') });
    } catch { /* skip */ }
  }

  // Check for t.co links in text not covered by links array
  const tcoMatches = text.match(/https?:\/\/t\.co\/\S+/g) || [];
  for (const tco of tcoMatches) {
    if (!seen.has(tco)) {
      results.push({ url: tco, domain: 't.co' });
    }
  }

  return results;
}

export default function BookmarkDetail({ bookmark, onClose }: Props) {
  const { t, locale } = useI18n();
  const dialogRef = useRef<HTMLDivElement>(null);

  const { id, text, authorHandle, authorName, authorAvatar, engagement, url, postedAt, links } = bookmark;

  const displayText = text.replace(/https?:\/\/t\.co\/\S+/g, '').trim();
  const externalLinks = getExternalLinks(text, links);
  const [read, setRead] = useState(() => isRead(id));
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showColMenu, setShowColMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load collections
  useEffect(() => { setCollections(getCollections()); }, []);

  // Close collection menu on outside click
  useEffect(() => {
    if (!showColMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showColMenu]);

  // Focus trap + Escape
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    dialogRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); prev?.focus(); };
  }, [onClose]);

  const handleToggleRead = () => {
    toggleRead(id);
    setRead(!read);
  };

  const handleAddToCollection = (colId: string) => {
    addToCollection(colId, id);
    setShowColMenu(false);
    setCollections(getCollections());
  };

  const inAnyCollection = collections.some(c => c.bookmarkIds.includes(id));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'var(--overlay-light)', backdropFilter: 'blur(4px)' }} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${authorName} (@${authorHandle})`}
        tabIndex={-1}
        className="relative w-full max-w-[640px] max-sm:h-full max-sm:max-h-full max-sm:rounded-none max-h-[85vh] rounded-2xl overflow-hidden animate-scale-in flex flex-col"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', outline: 'none' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <img src={authorAvatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[15px]">
              <span className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>{authorName}</span>
              <span style={{ color: 'var(--text-secondary)' }}>@{authorHandle}</span>
            </div>
            <div className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              {new Date(postedAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover-bg"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body: scrollable */}
        <div className="overflow-y-auto p-4 flex-1" style={{ minHeight: 0 }}>
          {/* Full tweet text */}
          {displayText && (
            <p className="text-[15px] leading-[22px] whitespace-pre-wrap mb-4" style={{ color: 'var(--text-primary)' }}>
              {displayText}
            </p>
          )}

          {/* External link previews */}
          {externalLinks.length > 0 && (
            <div className="space-y-2 mb-4">
              {externalLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl transition-colors"
                  style={{
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    padding: '10px 14px',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="var(--text-tertiary)" strokeWidth={2} aria-hidden="true">
                      <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
                      {link.domain}
                    </span>
                    <svg className="w-3.5 h-3.5 flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="var(--text-tertiary)" strokeWidth={2} aria-hidden="true">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <NoteInput id={bookmark.id} />
        </div>

        {/* Footer: actions */}
        <div className="flex items-center justify-between p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            {/* Engagement */}
            <div className="flex gap-3 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              <span>💬 {engagement.replyCount.toLocaleString()}</span>
              <span>🔄 {engagement.repostCount.toLocaleString()}</span>
              <span>❤️ {engagement.likeCount.toLocaleString()}</span>
              <span>🔖 {engagement.bookmarkCount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle read */}
            <button
              onClick={handleToggleRead}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer hover-color-accent hover-bg"
              style={{ color: read ? 'var(--accent)' : 'var(--text-tertiary)' }}
              title={read ? t.common.markAsUnread : t.common.markAsRead}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={read ? 'var(--accent)' : 'none'} stroke={read ? 'var(--accent)' : 'currentColor'} strokeWidth={2} aria-hidden="true">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Add to collection */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowColMenu(!showColMenu)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer hover-color-accent hover-bg"
                style={{ color: inAnyCollection ? 'var(--accent)' : 'var(--text-tertiary)' }}
                title={t.common.addToCollection}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill={inAnyCollection ? 'var(--accent)' : 'none'} stroke={inAnyCollection ? 'var(--accent)' : 'currentColor'} strokeWidth={2} aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </button>
              {showColMenu && (
                <div
                  className="absolute right-0 bottom-9 w-48 rounded-xl shadow-lg z-50 py-1 animate-scale-in overflow-hidden"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                >
                  {collections.length > 0 ? collections.map(col => (
                    <button
                      key={col.id}
                      onClick={() => handleAddToCollection(col.id)}
                      className="w-full px-3 py-2 text-[13px] text-left flex items-center gap-2 transition-colors hover-bg"
                      style={{ color: col.bookmarkIds.includes(id) ? 'var(--accent)' : 'var(--text-primary)' }}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={col.bookmarkIds.includes(id) ? 'var(--accent)' : 'none'} stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                      </svg>
                      {col.name}
                    </button>
                  )) : (
                    <div className="px-3 py-2 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{t.common.noCollections}</div>
                  )}
                </div>
              )}
            </div>

            {/* Open on X */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-full text-[13px] font-bold transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--card-bg)' }}
            >
              {t.common.openOnX}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteInput({ id }: { id: string }) {
  const [value, setValue] = useState(() => getNote(id));
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { t } = useI18n();

  const handleChange = (text: string) => {
    setValue(text);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setNote(id, text), 300);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--text-tertiary)" strokeWidth={2} aria-hidden="true">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{t.common.notes}</span>
      </div>
      <textarea
        value={value}
        onChange={e => handleChange(e.target.value)}
        placeholder={t.common.addNote}
        rows={2}
        className="w-full px-3 py-2 rounded-xl text-[14px] outline-none resize-none transition-colors"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
      />
    </div>
  );
}
