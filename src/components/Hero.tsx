import { useI18n } from '../lib/i18n';
import type { BookmarksData } from '../lib/data';
import { getReadCount } from '../lib/read-status';

function formatDate(dateStr: string | undefined, locale: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatShortDate(dateStr: string | undefined, locale: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short', day: 'numeric',
  });
}

interface Props { data: BookmarksData }

export default function Hero({ data }: Props) {
  const { t, locale } = useI18n();
  const { meta } = data;
  const totalLikes = data.bookmarks.reduce((s, b) => s + b.engagement.likeCount, 0);
  const totalBookmarks = data.bookmarks.reduce((s, b) => s + b.engagement.bookmarkCount, 0);
  const avgLikes = meta.totalBookmarks > 0 ? Math.round(totalLikes / meta.totalBookmarks) : 0;
  const readCount = getReadCount(data.bookmarks.map(b => b.id));
  const readRate = meta.totalBookmarks > 0 ? Math.round((readCount / meta.totalBookmarks) * 100) : 0;
  const dateStart = meta.dateRange?.[0];
  const dateEnd = meta.dateRange?.[1];

  const h = t.hero;
  const iconProps = {
    viewBox: '0 0 24 24',
    className: 'w-3.5 h-3.5',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  const stats = [
    { label: h.totalBookmarks, value: meta.totalBookmarks.toLocaleString(), icon: <svg {...iconProps}><path d="M6 3h12v18l-6-4-6 4V3z" /></svg> },
    { label: h.totalAuthors, value: meta.totalAuthors, icon: <svg {...iconProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></svg> },
    ...(dateStart && dateEnd ? [{ label: h.dateSpan, value: formatShortDate(dateStart, locale) + ' ~ ' + formatShortDate(dateEnd, locale), icon: <svg {...iconProps}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> }] : []),
    { label: h.avgLikes, value: avgLikes.toLocaleString(), icon: <svg {...iconProps}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg> },
    { label: h.totalEngBookmarks, value: totalBookmarks.toLocaleString(), icon: <svg {...iconProps}><path d="M3 3v18h18" /><path d="M7 16v-4M12 16V8M17 16v-7" /></svg> },
    { label: h.readRate, value: `${readRate}%`, icon: <svg {...iconProps}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
  ];

  return (
    <section className="py-10 px-5">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-3xl font-bold mb-1 animate-fade-up" style={{ color: 'var(--text-primary)' }}>
          X Bookmarks
        </h1>
        <p className="text-[13px] mb-8 animate-fade-up delay-1" style={{ color: 'var(--text-secondary)' }}>
          {dateStart && dateEnd ? `${formatDate(dateStart, locale)} ~ ${formatDate(dateEnd, locale)} · ` : ''}
          {locale === 'zh' ? '已同步于' : 'Synced'} {meta.syncedAt?.split('T')[0] || '—'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`rounded-2xl p-4 transition-colors animate-scale-in`}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                animationDelay: `${i * 0.05 + 0.1}s`,
              }}
            >
              <div className="flex items-center gap-1.5 text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>
                <span className="inline-flex w-4 h-4 items-center justify-center" style={{ color: 'var(--accent)' }}>{s.icon}</span>
                {s.label}
              </div>
              <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
