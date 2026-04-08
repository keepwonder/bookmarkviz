import { useState, useEffect, useRef } from 'react';
import { useAuth, type AuthUser } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import ConfirmModal from './ConfirmModal';

interface CloudStats {
  bookmarkCount: number;
  collectionCount: number;
  noteCount: number;
  lastSyncedAt: string | null;
}

function formatSyncTime(iso: string | null, locale: string): string {
  if (!iso) return locale === 'zh' ? '从未同步' : 'Never synced';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return locale === 'zh' ? '刚刚' : 'Just now';
  if (diffMin < 60) return locale === 'zh' ? `${diffMin} 分钟前` : `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return locale === 'zh' ? `${diffH} 小时前` : `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return locale === 'zh' ? `${diffD} 天前` : `${diffD}d ago`;
  return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AccountModal({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const { locale } = useI18n();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<CloudStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setStatsLoading(true);
    fetch('/api/auth/stats', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [open, user]);

  // Focus trap + Escape
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement;
    dialogRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showClearConfirm) { onClose(); return; }
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
  }, [open, onClose, showClearConfirm]);

  const handleClearData = async () => {
    const res = await fetch('/api/auth/clear', { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      setStats({ bookmarkCount: 0, collectionCount: 0, noteCount: 0, lastSyncedAt: null });
      setShowClearConfirm(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  if (!open || !user) return null;

  const zh = locale === 'zh';
  const provider = (user as AuthUser & { provider?: string }).provider;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
        style={{ background: 'var(--overlay)', backdropFilter: 'blur(4px)' }}
        onClick={showClearConfirm ? undefined : onClose}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={zh ? '账户信息' : 'Account'}
          tabIndex={-1}
          className="w-full max-w-sm mx-4 rounded-2xl animate-scale-in overflow-hidden"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', outline: 'none' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <div className="flex justify-end p-3 pb-0">
            <button onClick={onClose} aria-label="Close" className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover-bg" style={{ color: 'var(--text-secondary)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info */}
          <div className="flex flex-col items-center px-6 pb-5">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-14 h-14 rounded-full mb-3" />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-3" style={{ background: 'var(--accent)', color: 'var(--card-bg)' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-[17px] font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
            {user.email && <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{user.email}</p>}
          </div>

          {/* Details */}
          <div className="px-6 pb-4 space-y-2.5" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div className="flex justify-between text-[13px]">
              <span style={{ color: 'var(--text-tertiary)' }}>{zh ? '登录方式' : 'Login Method'}</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {provider === 'google' ? 'Google' : 'GitHub'}
              </span>
            </div>
          </div>

          {/* Cloud stats */}
          <div className="px-6 pb-4 space-y-2.5" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <p className="text-[13px] font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>{zh ? '云端数据' : 'Cloud Data'}</p>
            {statsLoading ? (
              <div className="flex items-center justify-center py-3">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-tertiary)' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            ) : stats ? (
              <>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-tertiary)' }}>{zh ? '书签' : 'Bookmarks'}</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{stats.bookmarkCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-tertiary)' }}>{zh ? '合集' : 'Collections'}</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{stats.collectionCount}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-tertiary)' }}>{zh ? '笔记' : 'Notes'}</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{stats.noteCount}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-tertiary)' }}>{zh ? '最后同步' : 'Last Sync'}</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatSyncTime(stats.lastSyncedAt, locale)}</span>
                </div>
              </>
            ) : (
              <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{zh ? '无法加载统计数据' : 'Failed to load stats'}</p>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-2" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            {stats && stats.bookmarkCount > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-2.5 rounded-xl text-[13px] font-medium transition-colors"
                style={{ color: 'var(--danger)', border: '1px solid var(--danger-border)' }}
              >
                {zh ? '清除云端数据' : 'Clear Cloud Data'}
              </button>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: 'var(--card-bg)' }}
            >
              {loggingOut && (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {loggingOut ? (zh ? '正在退出...' : 'Logging out...') : (zh ? '退出登录' : 'Log out')}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showClearConfirm}
        title={zh ? '清除云端数据' : 'Clear Cloud Data'}
        message={zh ? '将删除所有云端书签、合集、笔记数据，此操作不可撤销。本地数据不受影响。' : 'This will delete all your cloud bookmarks, collections, and notes. This cannot be undone. Local data is not affected.'}
        confirmLabel={zh ? '确认清除' : 'Clear Data'}
        destructive
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={handleClearData}
      />
    </>
  );
}
