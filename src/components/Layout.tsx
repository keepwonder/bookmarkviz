import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { useAuth } from '../lib/auth';

const NAV_KEYS = ['dashboard', 'explore', 'collections', 'sync', 'about'] as const;
const NAV_PATHS = ['/dashboard', '/explore', '/collections', '/sync', '/about'];

export default function Layout() {
  const { pathname } = useLocation();
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout, login } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-[1200px] mx-auto px-5 h-[53px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="var(--accent)">
              <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zm-11 0h7v7H3v-7z"/>
            </svg>
            BookmarkViz
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_KEYS.map((key, i) => (
              <Link
                key={key}
                to={NAV_PATHS[i]}
                className="px-4 py-2 text-[15px] rounded-full transition-all"
                style={{
                  color: pathname === NAV_PATHS[i] ? 'var(--accent)' : 'var(--text-primary)',
                  background: pathname === NAV_PATHS[i] ? 'var(--accent-bg)' : 'transparent',
                  fontWeight: pathname === NAV_PATHS[i] ? 700 : 500,
                }}
              >
                {t.nav[key]}
              </Link>
            ))}

            <span className="mx-2 w-px h-5" style={{ background: 'var(--border)' }} />

            {/* Language toggle */}
            <div
              className="flex rounded-full p-0.5 h-8"
              style={{ background: 'var(--bg-hover, rgba(255,255,255,0.08))' }}
            >
              <button
                onClick={() => setLocale('zh')}
                className="px-2.5 rounded-full text-[13px] font-medium transition-all h-7 flex items-center"
                style={{
                  background: locale === 'zh' ? 'var(--accent)' : 'transparent',
                  color: locale === 'zh' ? '#fff' : 'var(--text-secondary)',
                }}
              >中</button>
              <button
                onClick={() => setLocale('en')}
                className="px-2.5 rounded-full text-[13px] font-medium transition-all h-7 flex items-center"
                style={{
                  background: locale === 'en' ? 'var(--accent)' : 'transparent',
                  color: locale === 'en' ? '#fff' : 'var(--text-secondary)',
                }}
              >EN</button>
            </div>

            {/* Theme toggle */}
            <div
              className="flex rounded-full p-0.5 h-8"
              style={{ background: 'var(--bg-hover, rgba(255,255,255,0.08))' }}
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
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: theme === key ? 'var(--accent)' : 'transparent',
                    color: theme === key ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* User menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white" style={{ background: 'var(--accent)' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-10 w-48 rounded-xl shadow-lg z-50 py-1 animate-scale-in overflow-hidden"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                  >
                    <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-[14px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                      {user.email && <p className="text-[12px] truncate" style={{ color: 'var(--text-tertiary)' }}>{user.email}</p>}
                    </div>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2.5 text-[13px] text-left cursor-pointer transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {locale === 'zh' ? '退出登录' : 'Log out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-1.5 rounded-full text-[13px] font-bold transition-opacity hover:opacity-90 cursor-pointer"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {locale === 'zh' ? '登录' : 'Login'}
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            className="md:hidden animate-scale-in overflow-hidden"
            style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_KEYS.map((key, i) => (
                <Link
                  key={key}
                  to={NAV_PATHS[i]}
                  onClick={closeMenu}
                  className="block px-4 py-2.5 text-[15px] rounded-xl transition-all"
                  style={{
                    color: pathname === NAV_PATHS[i] ? 'var(--accent)' : 'var(--text-primary)',
                    background: pathname === NAV_PATHS[i] ? 'var(--accent-bg)' : 'transparent',
                    fontWeight: pathname === NAV_PATHS[i] ? 700 : 500,
                  }}
                >
                  {t.nav[key]}
                </Link>
              ))}
            </div>

            {/* Mobile toggles */}
            <div className="px-4 pb-4 flex items-center gap-3">
              <div
                className="flex rounded-full p-0.5 h-8"
                style={{ background: 'var(--bg-hover, rgba(255,255,255,0.08))' }}
              >
                <button
                  onClick={() => { setLocale('zh'); }}
                  className="px-3 rounded-full text-[13px] font-medium transition-all h-7 flex items-center"
                  style={{
                    background: locale === 'zh' ? 'var(--accent)' : 'transparent',
                    color: locale === 'zh' ? '#fff' : 'var(--text-secondary)',
                  }}
                >中</button>
                <button
                  onClick={() => { setLocale('en'); }}
                  className="px-3 rounded-full text-[13px] font-medium transition-all h-7 flex items-center"
                  style={{
                    background: locale === 'en' ? 'var(--accent)' : 'transparent',
                    color: locale === 'en' ? '#fff' : 'var(--text-secondary)',
                  }}
                >EN</button>
              </div>

              <div
                className="flex rounded-full p-0.5 h-8"
                style={{ background: 'var(--bg-hover, rgba(255,255,255,0.08))' }}
              >
                {(['light', 'dark', 'system'] as const).map(k => (
                  <button
                    key={k}
                    onClick={() => setTheme(k)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all text-[14px]"
                    style={{
                      background: theme === k ? 'var(--accent)' : 'transparent',
                      color: theme === k ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {k === 'light' ? '☀️' : k === 'dark' ? '🌙' : '💻'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
      <Outlet />

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
                onClick={() => { setShowLoginModal(false); login('github'); }}
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-[15px] font-bold transition-opacity hover:opacity-90 cursor-pointer"
                style={{ background: '#24292e', color: '#fff' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                {locale === 'zh' ? '使用 GitHub 登录' : 'Continue with GitHub'}
              </button>

              <button
                onClick={() => { setShowLoginModal(false); login('google'); }}
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-[15px] font-bold transition-opacity hover:opacity-90 cursor-pointer"
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
    </div>
  );
}
