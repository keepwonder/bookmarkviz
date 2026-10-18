import { useI18n } from '../lib/i18n';

export default function SiteFooter() {
  const { locale } = useI18n();
  const zh = locale === 'zh';

  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div className="max-w-[1200px] mx-auto px-5 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor" aria-hidden="true">
              <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zm-11 0h7v7H3v-7z" />
            </svg>
          </span>
          <span className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>BookmarkViz</span>
          <span className="hidden sm:inline text-[13px] truncate" style={{ color: 'var(--text-tertiary)' }}>
            · {zh ? 'X 书签可视化' : 'X bookmarks visualizer'}
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]" aria-label={zh ? '页脚' : 'Footer'}>
          <a href="https://kiang.website/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--accent)' }}>主站 ↗</a>
          <a href="https://github.com/keepwonder/bookmarkviz" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>GitHub ↗</a>
          <a href="https://x.com/JeunesseQ" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>X / Twitter ↗</a>
          <span style={{ color: 'var(--text-tertiary)' }}>© 2026 Kiang</span>
        </nav>
      </div>
    </footer>
  );
}
