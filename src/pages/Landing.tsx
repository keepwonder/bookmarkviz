import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { useAuth } from '../lib/auth';
import LoginModal from '../components/LoginModal';
import AccountModal from '../components/AccountModal';
import SiteFooter from '../components/SiteFooter';

const EXTERNAL_LINKS = {
  fieldtheory: 'https://github.com/afar1/fieldtheory-cli',
  github: 'https://github.com/keepwonder/bookmarkviz',
  x: 'https://x.com/JeunesseQ',
  kiang: 'https://kiang.website/',
  react: 'https://react.dev',
  echarts: 'https://echarts.apache.org',
  cloudflare: 'https://pages.cloudflare.com',
  tailwindcss: 'https://tailwindcss.com',
};

export default function Landing() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { loading, user, isAuthenticated, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const l = t.landing;

  // Show auth errors from OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('auth_error');
    if (err) {
      setAuthError(decodeURIComponent(err));
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Auth error banner */}
      {authError && (
        <div
          className="flex items-center justify-between gap-3 px-5 py-3 text-[14px]"
          style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderBottom: '1px solid var(--danger-border)' }}
        >
          <span>{authError}</span>
          <button onClick={() => setAuthError(null)} className="cursor-pointer font-bold">✕</button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'var(--bg-blur)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-[1200px] mx-auto px-5 h-[53px] flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 text-[15px] font-bold shrink-0" style={{ color: 'var(--text-primary)' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="var(--accent)" aria-hidden="true">
              <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zm-11 0h7v7H3v-7z"/>
            </svg>
            <span className="hidden sm:inline">BookmarkViz</span>
          </Link>

          <div className="flex items-center gap-2">
        {/* Language toggle */}
        <div
          className="flex rounded-full p-0.5 h-8"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setLocale('zh')}
            aria-label="中文"
            aria-pressed={locale === 'zh'}
            className="px-2.5 rounded-full text-[13px] font-medium transition-all h-7 cursor-pointer"
            style={{
              background: locale === 'zh' ? 'var(--accent)' : 'transparent',
              color: locale === 'zh' ? 'var(--card-bg)' : 'var(--text-secondary)',
            }}
          >中</button>
          <button
            onClick={() => setLocale('en')}
            aria-label="English"
            aria-pressed={locale === 'en'}
            className="px-2.5 rounded-full text-[13px] font-medium transition-all h-7 cursor-pointer"
            style={{
              background: locale === 'en' ? 'var(--accent)' : 'transparent',
              color: locale === 'en' ? 'var(--card-bg)' : 'var(--text-secondary)',
            }}
          >EN</button>
        </div>

        {/* Theme toggle */}
        <div
          className="flex rounded-full p-0.5 h-8"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)' }}
        >
          {([
            { key: 'light' as const, icon: (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/>
              </svg>
            )},
            { key: 'dark' as const, icon: (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>
              </svg>
            )},
            { key: 'system' as const, icon: (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
            )},
          ]).map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              aria-label={key.charAt(0).toUpperCase() + key.slice(1)}
              aria-pressed={theme === key}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
              style={{
                background: theme === key ? 'var(--accent)' : 'transparent',
                color: theme === key ? 'var(--card-bg)' : 'var(--text-secondary)',
              }}
            >{icon}</button>
          ))}
        </div>

        {/* User info / Login */}
        {!loading && isAuthenticated && user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              aria-label={user.name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)' }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: 'var(--accent)', color: 'var(--card-bg)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[13px] font-medium max-w-[100px] truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
            </button>
            {userMenuOpen && (
              <div
                className="absolute right-0 top-10 w-48 rounded-xl shadow-lg z-50 py-1 animate-scale-in overflow-hidden"
                role="menu"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-[14px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                  {user.email && <p className="text-[12px] truncate" style={{ color: 'var(--text-tertiary)' }}>{user.email}</p>}
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full px-3 py-2.5 text-[13px] text-left flex items-center gap-2 transition-colors hover-bg"
                  style={{ color: 'var(--text-primary)' }}
                  role="menuitem"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
                  </svg>
                  {locale === 'zh' ? '数据面板' : 'Dashboard'}
                </Link>
                <button
                  onClick={() => { setUserMenuOpen(false); setShowAccountModal(true); }}
                  className="w-full px-3 py-2.5 text-[13px] text-left flex items-center gap-2 transition-colors hover-bg"
                  style={{ color: 'var(--text-primary)' }}
                  role="menuitem"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {locale === 'zh' ? '账户信息' : 'Account'}
                </button>
                <button
                  onClick={async () => { setLoggingOut(true); await logout(); }}
                  disabled={loggingOut}
                  className="w-full px-3 py-2.5 text-[13px] text-left flex items-center gap-2 transition-colors hover-bg disabled:opacity-60 disabled:cursor-wait"
                  style={{ color: 'var(--text-secondary)' }}
                  role="menuitem"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {loggingOut ? (locale === 'zh' ? '正在退出...' : 'Logging out...') : (locale === 'zh' ? '退出登录' : 'Log out')}
                </button>
              </div>
            )}
          </div>
        ) : !loading ? (
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-4 py-1.5 rounded-full text-[13px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            {locale === 'zh' ? '登录' : 'Login'}
          </button>
        ) : null}
          </div>
        </div>
      </header>

      {/* Hero */}
      <header className="px-5 pt-16 pb-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-[1100px] mx-auto grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-12">
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold mb-6"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X Bookmarks · local-first
            </span>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-fade-up">
              {l.title}<span style={{ color: 'var(--accent)' }}>{l.titleAccent}</span>
            </h1>

            <p className="text-lg max-w-lg mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {l.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link
                to="/dashboard"
                className="px-7 py-3 rounded-full text-[15px] font-bold text-white transition-transform hover:scale-105 active:scale-95"
                style={{ background: 'var(--accent)' }}
              >
                {isAuthenticated
                  ? (locale === 'zh' ? '进入我的数据' : 'Go to My Data')
                  : l.cta}
              </Link>
              {!loading && !isAuthenticated && (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-7 py-3 rounded-full text-[15px] font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
                >
                  {locale === 'zh' ? '登录开始使用' : 'Login to Get Started'}
                </button>
              )}
            </div>

            <p className="text-[13px] mt-5" style={{ color: 'var(--text-tertiary)' }}>
              {locale === 'zh' ? '本地优先 · 无追踪 · 登录后可选加密同步' : 'Local-first · No tracking · Optional encrypted sync'}
            </p>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[32px] blur-3xl opacity-20"
              style={{ background: 'var(--accent)' }}
              aria-hidden="true"
            />
            <article
              className="relative rounded-2xl p-5 animate-scale-in"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(0,0,0,0.12)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: 'linear-gradient(135deg, #1d9bf0, #7856ff)' }}
                >
                  K
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>Andrej Karpathy</p>
                  <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>@karpathy</p>
                </div>
                <span
                  className="ml-auto text-[12px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
                >
                  Bookmarked
                </span>
              </div>
              <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {locale === 'zh'
                  ? '最好的学习方式，是把你读到的东西重新做一遍。'
                  : 'The best way to learn is to rebuild what you just read.'}
              </p>
              <div className="flex items-center gap-6 mt-4 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.7 8.7 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z" /></svg>
                  128
                </span>
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true"><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
                  2.4K
                </span>
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                  18.2K
                </span>
                <span className="ml-auto" style={{ color: 'var(--accent)' }}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4V3z" /></svg>
                </span>
              </div>
            </article>

            <div className="mt-3 ml-auto w-[85%] rounded-2xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-bold mb-2" style={{ color: 'var(--text-tertiary)' }}>YOUR READING RHYTHM</p>
              <div className="flex items-end gap-1 h-12">
                {[30, 55, 40, 75, 60, 90, 70].map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{ height: `${h}%`, background: i === 5 ? 'var(--accent)' : 'var(--accent-bg-strong)' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Login modal */}
      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <AccountModal open={showAccountModal} onClose={() => setShowAccountModal(false)} />

      {/* Features — 6 cards */}
      <section className="py-20 px-5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 animate-fade-up" style={{ color: 'var(--text-primary)' }}>
            {l.featuresTitle}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3v18h18" /><path d="M7 16v-4M12 16V8M17 16v-7" /></svg>, title: l.feature1Title, desc: l.feature1Desc },
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.2" /></svg>, title: l.feature2Title, desc: l.feature2Desc },
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>, title: l.feature3Title, desc: l.feature3Desc },
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>, title: l.feature4Title, desc: l.feature4Desc },
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>, title: l.feature5Title, desc: l.feature5Desc },
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 9.2 4 4 0 0 0 7 19h10.5z" /></svg>, title: l.feature6Title, desc: l.feature6Desc },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 transition-colors animate-scale-in"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  animationDelay: `${i * 0.06 + 0.1}s`,
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{f.icon}</div>
                <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text-primary)' }}>{l.stepsTitle}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: l.step1Title, desc: l.step1Desc },
              { step: 2, title: l.step2Title, desc: l.step2Desc },
              { step: 3, title: l.step3Title, desc: l.step3Desc },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-5"
                  style={{ background: 'var(--accent)' }}
                >
                  {s.step}
                </div>
                <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href={EXTERNAL_LINKS.fieldtheory}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] font-medium hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              fieldtheory-cli on GitHub →
            </a>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-20 px-5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-10" style={{ color: 'var(--text-primary)' }}>{l.privacyTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="14" rx="2" /><path d="M8 22h8M12 18v4" /></svg>, text: l.privacy1 },
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, text: l.privacy2 },
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>, text: l.privacy3 },
            ].map((p, i) => (
              <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{p.icon}</div>
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-10" style={{ color: 'var(--text-primary)' }}>{l.techTitle}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'React', href: EXTERNAL_LINKS.react },
              { name: 'ECharts', href: EXTERNAL_LINKS.echarts },
              { name: 'Tailwind CSS', href: EXTERNAL_LINKS.tailwindcss },
              { name: 'Cloudflare Pages', href: EXTERNAL_LINKS.cloudflare },
            ].map(tech => (
              <a
                key={tech.name}
                href={tech.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full text-[14px] font-medium transition-colors"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                {tech.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
