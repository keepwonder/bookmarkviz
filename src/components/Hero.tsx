import { useI18n } from '../lib/i18n';
import type { BookmarksData } from '../lib/data';
import { getReadCount } from '../lib/read-status';

interface Props { data: BookmarksData }

export default function Hero({ data }: Props) {
  const { t } = useI18n();
  const { meta } = data;
  const totalLikes = data.bookmarks.reduce((s, b) => s + b.engagement.likeCount, 0);
  const totalBookmarks = data.bookmarks.reduce((s, b) => s + b.engagement.bookmarkCount, 0);
  const avgLikes = Math.round(totalLikes / meta.totalBookmarks);
  const readCount = getReadCount(data.bookmarks.map(b => b.id));
  const readRate = meta.totalBookmarks > 0 ? Math.round((readCount / meta.totalBookmarks) * 100) : 0;

  const h = t.hero;
  const stats = [
    { label: h.totalBookmarks, value: meta.totalBookmarks.toLocaleString(), icon: '🔖' },
    { label: h.totalAuthors, value: meta.totalAuthors, icon: '👤' },
    { label: h.dateSpan, value: meta.dateRange[0].slice(5) + ' ~ ' + meta.dateRange[1].slice(5), icon: '📅' },
    { label: h.avgLikes, value: avgLikes.toLocaleString(), icon: '❤️' },
    { label: h.totalEngBookmarks, value: totalBookmarks.toLocaleString(), icon: '📊' },
    { label: h.readRate, value: `${readRate}%`, icon: '📖' },
  ];

  return (
    <section className="py-10 px-5">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-3xl font-bold mb-1 animate-fade-up" style={{ color: 'var(--text-primary)' }}>
          X Bookmarks
        </h1>
        <p className="text-[13px] mb-8 animate-fade-up delay-1" style={{ color: 'var(--text-secondary)' }}>
          {meta.dateRange[0]} ~ {meta.dateRange[1]} · {t.loading === '加载中...' ? '已同步于' : 'Synced'} {meta.syncedAt.split('T')[0]}
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
              <div className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>{s.icon} {s.label}</div>
              <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
