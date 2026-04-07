import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadData } from '../lib/data';
import type { BookmarksData } from '../lib/data';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import {
  getCollections,
  createCollection,
  deleteCollection,
  updateCollection,
  removeFromCollection,
  type Collection,
} from '../lib/collections';
import BookmarkCard from '../components/BookmarkCard';
import ConfirmModal from '../components/ConfirmModal';

const EMOJIS = ['📁', '📂', '📌', '⭐', '🔥', '💡', '🎯', '📚', '🛠', '🧪', '✨', '🔖'];

function formatDate(ts: number, locale: string): string {
  return new Date(ts).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function Collections() {
  const [data, setData] = useState<BookmarksData | null>(null);
  const [collections, setCollections] = useState<Collection[]>(getCollections);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📁');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'remove'; id: string; bookmarkId?: string } | null>(null);
  const { t, locale } = useI18n();
  const { isAuthenticated } = useAuth();
  const c = t.collections;

  useEffect(() => { loadData(isAuthenticated).then(setData); }, [isAuthenticated]);

  const refresh = () => setCollections(getCollections());

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCollection(newName.trim(), newEmoji);
    setNewName('');
    setNewEmoji('📁');
    setShowCreate(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteCollection(id);
    if (activeId === id) setActiveId(null);
    setConfirmAction(null);
    refresh();
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) { setEditingId(null); return; }
    updateCollection(id, { name: editName.trim() });
    setEditingId(null);
    refresh();
  };

  const activeCollection = collections.find(col => col.id === activeId);

  const activeBookmarks = useMemo(() => {
    if (!data || !activeCollection) return [];
    const idSet = new Set(activeCollection.bookmarkIds);
    return data.bookmarks.filter(b => idSet.has(b.id));
  }, [data, activeCollection]);

  if (!data) {
    return <div className="flex items-center justify-center h-[60vh]"><div className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>{t.loading}</div></div>;
  }

  // Collection detail view
  if (activeCollection) {
    return (
      <main className="max-w-[900px] mx-auto px-5 py-6">
        <button
          onClick={() => setActiveId(null)}
          className="flex items-center gap-1.5 text-[14px] mb-5 cursor-pointer"
          style={{ color: 'var(--accent)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M15 19l-7-7 7-7" />
          </svg>
          {c.back}
        </button>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{activeCollection.emoji}</span>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{activeCollection.name}</h1>
          <span className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {activeCollection.bookmarkIds.length} {c.items}
          </span>
        </div>
        <p className="text-[13px] mb-6" style={{ color: 'var(--text-tertiary)' }}>
          {c.createdAt} {formatDate(activeCollection.createdAt, locale)}
        </p>

        {activeBookmarks.length > 0 ? (
          <div className="space-y-3">
            {activeBookmarks.map(b => (
              <div key={b.id} className="relative">
                <BookmarkCard bookmark={b} />
                <button
                  onClick={() => setConfirmAction({ type: 'remove', id: activeCollection.id, bookmarkId: b.id })}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  style={{ color: 'var(--text-tertiary)', background: 'var(--bg-secondary)' }}
                  title={c.remove}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-3xl mb-3">📭</div>
            <p className="text-[15px] mb-4" style={{ color: 'var(--text-tertiary)' }}>{c.emptyHint}</p>
            <Link to="/explore"
              className="inline-block px-5 py-2 rounded-full text-[14px] font-bold text-white"
              style={{ background: 'var(--accent)' }}>
              {c.goExplore}
            </Link>
          </div>
        )}
      </main>
    );
  }

  // Collections list view
  return (
    <main className="max-w-[900px] mx-auto px-5 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{c.title}</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-full text-[14px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          + {c.create}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-2xl p-4 mb-5 animate-scale-in" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-1 flex-wrap">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] cursor-pointer transition-transform"
                  style={{
                    background: newEmoji === e ? 'var(--accent-bg)' : 'transparent',
                    transform: newEmoji === e ? 'scale(1.2)' : 'scale(1)',
                  }}
                >{e}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={c.namePlaceholder}
              className="flex-1 px-4 py-2 rounded-full text-[15px] outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              className="px-5 py-2 rounded-full text-[14px] font-bold text-white cursor-pointer"
              style={{ background: 'var(--accent)' }}
            >{c.confirm}</button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-5 py-2 rounded-full text-[14px] cursor-pointer"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >{c.cancel}</button>
          </div>
        </div>
      )}

      {/* Collections grid */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map(col => (
            <button
              key={col.id}
              onClick={() => setActiveId(col.id)}
              className="text-left rounded-2xl p-5 transition-all duration-200 cursor-pointer"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{col.emoji}</span>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => { setEditingId(col.id); setEditName(col.name); }}
                    className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                    title={c.rename}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmAction({ type: 'delete', id: col.id })}
                    className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f4212e'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                    title={c.deleteLabel}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
              {editingId === col.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => handleRename(col.id)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRename(col.id); if (e.key === 'Escape') setEditingId(null); }}
                  className="w-full mt-3 text-[15px] font-bold outline-none bg-transparent"
                  style={{ color: 'var(--text-primary)' }}
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <h3 className="mt-3 text-[15px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{col.name}</h3>
              )}
              <p className="mt-1 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                {col.bookmarkIds.length} {c.items} · {formatDate(col.createdAt, locale)}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-3xl mb-3">📂</div>
          <p className="text-[15px] mb-4" style={{ color: 'var(--text-tertiary)' }}>{c.empty}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2 rounded-full text-[14px] font-bold text-white"
            style={{ background: 'var(--accent)' }}>
            + {c.create}
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!confirmAction}
        title={
          confirmAction?.type === 'delete'
            ? (locale === 'zh' ? '删除合集' : 'Delete Collection')
            : (locale === 'zh' ? '移出合集' : 'Remove from Collection')
        }
        message={
          confirmAction?.type === 'delete'
            ? (locale === 'zh' ? '确定要删除这个合集吗？此操作不可撤销。' : 'Are you sure you want to delete this collection? This cannot be undone.')
            : (locale === 'zh' ? '确定要将这条书签从合集中移除吗？' : 'Are you sure you want to remove this bookmark from the collection?')
        }
        confirmLabel={confirmAction?.type === 'delete' ? c.deleteLabel : c.remove}
        destructive
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === 'delete') {
            handleDelete(confirmAction.id);
          } else {
            removeFromCollection(confirmAction.id, confirmAction.bookmarkId!);
            setConfirmAction(null);
            refresh();
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </main>
  );
}
