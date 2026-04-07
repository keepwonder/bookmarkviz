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
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
              <Link
                to="/"
                className="px-4 py-1.5 rounded-full text-[13px] font-bold transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {locale === 'zh' ? '登录' : 'Login'}
              </Link>
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
    </div>
  );
}
