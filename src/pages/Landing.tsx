import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { useAuth } from '../lib/auth';
import LoginModal from '../components/LoginModal';

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
  const { loading, user, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
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
              color: locale === 'zh' ? 'var(--card-bg)' : 'var(--text-secondary)',
            }}
          >中</button>
          <button
            onClick={() => setLocale('en')}
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
                color: theme === key ? 'var(--card-bg)' : 'var(--text-secondary)',
              }}
            >{icon}</button>
          ))}
        </div>

        {/* User info / Login */}
        {!loading && isAuthenticated && user ? (
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)' }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: 'var(--accent)' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-[13px] font-medium max-w-[100px] truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
          </Link>
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
          className="text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-scale-in delay-1"
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
            {isAuthenticated
              ? (locale === 'zh' ? '进入我的数据' : 'Go to My Data')
              : l.cta}
          </Link>
          {!loading && !isAuthenticated && (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-7 py-3 rounded-full text-[15px] font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }
            }
            >
              {locale === 'zh' ? '登录开始使用' : 'Login to Get Started'}
            </button>
          )}
        </div>
      </header>

      {/* Login modal */}
      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Features — 6 cards */}
      <section className="py-20 px-5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 animate-fade-up" style={{ color: 'var(--text-primary)' }}>
            {l.featuresTitle}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '📊', title: l.feature1Title, desc: l.feature1Desc },
              { icon: '🏷️', title: l.feature2Title, desc: l.feature2Desc },
              { icon: '🌐', title: l.feature3Title, desc: l.feature3Desc },
              { icon: '🔍', title: l.feature4Title, desc: l.feature4Desc },
              { icon: '📁', title: l.feature5Title, desc: l.feature5Desc },
              { icon: '☁️', title: l.feature6Title, desc: l.feature6Desc },
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
          <div className="text-3xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-10" style={{ color: 'var(--text-primary)' }}>{l.privacyTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '💻', text: l.privacy1 },
              { icon: '🚫', text: l.privacy2 },
              { icon: '🔐', text: l.privacy3 },
            ].map((p, i) => (
              <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="text-xl mb-3">{p.icon}</div>
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

      {/* Footer */}
      <footer className="py-8 px-5 text-center text-[13px]" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-tertiary)' }}>
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span>{l.footerBuiltWith}</span>
            <a href={EXTERNAL_LINKS.fieldtheory} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--accent)' }}>fieldtheory-cli</a>
            <span>·</span>
            <span>{l.footerPrivacy}</span>
            <span>·</span>
            <span>{l.footerNoTracking}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            <a href={EXTERNAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--text-tertiary)' }}>GitHub</a>
            <span>·</span>
            <a href={EXTERNAL_LINKS.x} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--text-tertiary)' }}>@JeunesseQ</a>
            <span>·</span>
            <a href={EXTERNAL_LINKS.kiang} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--accent)' }}>Kiang</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
