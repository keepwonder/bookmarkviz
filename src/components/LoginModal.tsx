import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/auth';

interface Props {
  open: boolean;
  onClose: () => void;
}

function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginModal({ open, onClose }: Props) {
  const { locale } = useI18n();
  const { login } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<'github' | 'google' | null>(null);

  // Focus trap + Escape
  useEffect(() => {
    if (!open) { setPending(null); return; }
    const prev = document.activeElement as HTMLElement;
    dialogRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pending) { onClose(); return; }
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
  }, [open, onClose, pending]);

  if (!open) return null;

  const title = locale === 'zh' ? '选择登录方式' : 'Choose Login Method';
  const redirecting = locale === 'zh' ? '正在跳转...' : 'Redirecting...';

  const handleLogin = (provider: 'github' | 'google') => {
    setPending(provider);
    login(provider);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      style={{ background: 'var(--overlay)', backdropFilter: 'blur(4px)' }}
      onClick={pending ? undefined : onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="w-full max-w-sm mx-4 rounded-2xl p-6 animate-scale-in"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', outline: 'none' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p className="text-[14px] mb-5" style={{ color: 'var(--text-secondary)' }}>
          {locale === 'zh' ? '选择你偏好的方式登录' : 'Choose your preferred login method'}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => handleLogin('github')}
            disabled={!!pending}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-[15px] font-bold transition-opacity hover:opacity-90 disabled:opacity-70 disabled:cursor-wait"
            style={{ background: '#24292e', color: '#fff' }}
          >
            {pending === 'github' ? (
              <>{<Spinner />}{redirecting}</>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                {locale === 'zh' ? '使用 GitHub 登录' : 'Continue with GitHub'}
              </>
            )}
          </button>

          <button
            onClick={() => handleLogin('google')}
            disabled={!!pending}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-[15px] font-bold transition-opacity hover:opacity-90 disabled:opacity-70 disabled:cursor-wait"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            {pending === 'google' ? (
              <>{<Spinner />}{redirecting}</>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {locale === 'zh' ? '使用 Google 登录' : 'Continue with Google'}
              </>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          disabled={!!pending}
          className="mt-4 w-full text-[13px] py-2 disabled:opacity-50"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {locale === 'zh' ? '取消' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}
