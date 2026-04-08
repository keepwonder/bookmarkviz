import { useState, useEffect, useRef } from 'react';
import type { Bookmark } from '../lib/data';
import { fetchUrlContent, resolveBookmarkUrl, type FetchedContent } from '../lib/content-fetcher';
import { getNote, setNote } from '../lib/notes';
import { useI18n } from '../lib/i18n';

interface Props {
  bookmark: Bookmark;
  onClose: () => void;
}

type FetchState = { status: 'idle' | 'loading' | 'x-article' | 'no-content' | 'done'; content?: FetchedContent };

export default function BookmarkDetail({ bookmark, onClose }: Props) {
  const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' });
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDivElement>(null);

  const { text, authorHandle, authorName, authorAvatar, engagement, url, postedAt, links } = bookmark;

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

  // Resolve the main external link and fetch content
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const resolved = await resolveBookmarkUrl(text, links);

      if (cancelled) return;

      if (resolved.type === 'none') {
        setFetchState({ status: 'no-content' });
        return;
      }

      if (resolved.type === 'x-article') {
        setFetchState({ status: 'x-article' });
        return;
      }

      setFetchState({ status: 'loading' });
      const result = await fetchUrlContent(resolved.url);
      if (!cancelled) {
        setFetchState({ status: 'done', content: result });
      }
    })();

    return () => { cancelled = true; };
  }, [text, links]);

  // Clean display text: remove t.co links
  const displayText = text.replace(/https?:\/\/t\.co\/\S+/g, '').trim();

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
              {new Date(postedAt).toLocaleString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
          {/* Tweet text (non-link part) */}
          {displayText && (
            <p className="text-[15px] leading-[22px] whitespace-pre-wrap mb-4" style={{ color: 'var(--text-primary)' }}>
              {displayText}
            </p>
          )}

          {/* Fetched content preview */}
          {fetchState.status === 'loading' && (
            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
              <div className="inline-block animate-spin mb-2 text-xl">⏳</div>
              <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>{t.common.fetchingContent}</p>
            </div>
          )}

          {fetchState.status === 'done' && fetchState.content && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {/* Article header */}
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'var(--bg-hover)' }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={2}>
                  <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-[13px] font-medium truncate" style={{ color: 'var(--accent)' }}>
                  {fetchState.content.title}
                </span>
              </div>
              {/* Article body */}
              <div className="p-4">
                {fetchState.content.description && (
                  <p className="text-[14px] font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                    {fetchState.content.description}
                  </p>
                )}
                <div className="text-[13px] leading-[19px] space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {fetchState.content.content
                    .split('\n')
                    .filter(l => l.trim())
                    .slice(0, 40)
                    .map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  {fetchState.content.content.split('\n').filter(l => l.trim()).length > 40 && (
                    <p className="text-[12px] pt-1" style={{ color: 'var(--text-tertiary)' }}>
                      ···
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* X article — content lives on X */}
          {fetchState.status === 'x-article' && (
            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
              <div className="text-2xl mb-2">📝</div>
              <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t.common.xArticle}</p>
              <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                {t.common.xArticleDesc}
              </p>
            </div>
          )}

          {/* No external content */}
          {fetchState.status === 'no-content' && !displayText && (
            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
              <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>
                {t.common.noPreview}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <NoteInput id={bookmark.id} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex gap-4 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            <span>💬 {engagement.replyCount.toLocaleString()}</span>
            <span>🔄 {engagement.repostCount.toLocaleString()}</span>
            <span>❤️ {engagement.likeCount.toLocaleString()}</span>
            <span>🔖 {engagement.bookmarkCount.toLocaleString()}</span>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-full text-[13px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            {t.common.openOnX}
          </a>
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
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--text-tertiary)" strokeWidth={2}>
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
