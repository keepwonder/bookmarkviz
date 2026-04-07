import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { useAuth } from '../lib/auth';

export default function Landing() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { loading, login, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const l = t.landing;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Floating controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Language toggle */}
        <div
          className="flex rounded-full p-0.5 h-8"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setLocale('zh')}
            className="px-2.5 rounded-full text-[13px] font-medium transition-all h-7 cursor-pointer"
            style={{
              background: locale === 'zh' ? 'var(--accent)' : 'transparent',
              color: locale === 'zh' ? '#fff' : 'var(--text-secondary)',
            }}
          >中</button>
          <button
            onClick={() => setLocale('en')}
            className="px-2.5 rounded-full text-[13px] font-medium transition-all h-7 cursor-pointer"
            style={{
              background: locale === 'en' ? 'var(--accent)' : 'transparent',
              color: locale === 'en' ? '#fff' : 'var(--text-secondary)',
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
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            )},
            { key: 'dark' as const, icon: (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )},
            { key: 'system' as const, icon: (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
            )},
          ]).map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
              style={{
                background: theme === key ? 'var(--accent)' : 'transparent',
                color: theme === key ? '#fff' : 'var(--text-secondary)',
              }}
            >{icon}</button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <header className="flex-1 flex flex-col items-center justify-center px-5 pt-24 pb-20 text-center animate-fade-up">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 animate-scale-in"
          style={{ background: 'var(--accent)' }}
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
            <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zm-11 0h7v7H3v-7z"/>
          </svg>
        </div>

        <h1
          className="text-5xl md:text-7xl font-bold tracking-tight mb-4 animate-scale-in delay-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {l.title}
          <span style={{ color: 'var(--accent)' }}>{l.titleAccent}</span>
        </h1>

        <p
          className="text-lg max-w-lg mb-10 leading-relaxed animate-fade-in delay-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {l.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 animate-fade-in delay-3">
          <Link
            to="/dashboard"
            className="px-7 py-3 rounded-full text-[15px] font-bold text-white transition-transform hover:scale-105 active:scale-95"
            style={{ background: 'var(--accent)' }}
          >
            {l.cta}
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
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="px-7 py-3 rounded-full text-[15px] font-bold transition-transform hover:scale-105 active:scale-95"
              style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
            >
              {locale === 'zh' ? '进入我的数据' : 'Go to My Data'}
            </Link>
          )}
        </div>
      </header>

      {/* Login modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="w-full max-w-sm mx-4 rounded-2xl p-6 animate-scale-in"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {locale === 'zh' ? '选择登录方式' : 'Choose Login Method'}
            </h2>
            <p className="text-[14px] mb-5" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'zh' ? '选择你偏好的方式登录' : 'Choose your preferred login method'}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => login('github')}
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-[15px] font-bold transition-opacity hover:opacity-90"
                style={{ background: '#24292e', color: '#fff' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                {locale === 'zh' ? '使用 GitHub 登录' : 'Continue with GitHub'}
              </button>

              <button
                onClick={() => login('google')}
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-[15px] font-bold transition-opacity hover:opacity-90"
                style={{ background: '#fff', color: '#333', border: '1px solid #dadce0' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {locale === 'zh' ? '使用 Google 登录' : 'Continue with Google'}
              </button>
            </div>

            <button
              onClick={() => setShowLoginModal(false)}
              className="mt-4 w-full text-[13px] py-2 cursor-pointer"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {locale === 'zh' ? '取消' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <section className="py-20 px-5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-14 animate-fade-up" style={{ color: 'var(--text-primary)' }}>
            {l.featuresTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: '📊', title: l.feature1Title, desc: l.feature1Desc },
              { icon: '🏷️', title: l.feature2Title, desc: l.feature2Desc },
              { icon: '🌐', title: l.feature3Title, desc: l.feature3Desc },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 transition-colors animate-scale-in"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  animationDelay: `${i * 0.1 + 0.2}s`,
                }}
              >
                <div className="text-2xl mb-4">{f.icon}</div>
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
          <h2 className="text-2xl font-bold text-center mb-14" style={{ color: 'var(--text-primary)' }}>{l.stepsTitle}</h2>
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
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-[13px]" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-tertiary)' }}>
        {l.footer}
      </footer>
    </div>
  );
}
