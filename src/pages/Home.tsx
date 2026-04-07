import { lazy, Suspense, useEffect, useState } from 'react';
import { loadData } from '../lib/data';
import type { BookmarksData } from '../lib/data';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import Hero from '../components/Hero';

const CalendarHeatmap = lazy(() => import('../components/charts/CalendarHeatmap'));
const ContentTypePie = lazy(() => import('../components/charts/ContentTypePie'));
const EngagementRank = lazy(() => import('../components/charts/EngagementRank'));
const WordCloud = lazy(() => import('../components/charts/WordCloud'));
const Timeline = lazy(() => import('../components/charts/Timeline'));
const AuthorGraph = lazy(() => import('../components/charts/AuthorGraph'));

function ChartCard({ title, children, delay }: { title: string; children: React.ReactNode; delay: string }) {
  return (
    <section
      className={`rounded-2xl p-5 animate-scale-in`}
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', animationDelay: delay }}
    >
      <h2 className="text-[17px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      <Suspense fallback={
        <div className="flex items-center justify-center h-[200px]">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        </div>
      }>
        {children}
      </Suspense>
    </section>
  );
}

export default function Home() {
  const [data, setData] = useState<BookmarksData | null>(null);
  const { t, locale } = useI18n();
  const { isAuthenticated } = useAuth();

  useEffect(() => { loadData(isAuthenticated).then(setData); }, [isAuthenticated]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>{t.loading}</div>
      </div>
    );
  }

  const isDemo = data.meta.source === 'demo';
  const c = t.charts;

  return (
    <main className="max-w-[1200px] mx-auto px-5 pb-20">
      {/* Demo banner */}
      {isDemo && (
        <div
          className="flex items-center gap-2 rounded-xl px-5 py-3 mb-5 animate-fade-in"
          style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)' }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={2}>
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span className="text-[14px]" style={{ color: 'var(--accent)' }}>
            {locale === 'zh' ? '你正在查看演示数据，点击右上角「登录」查看自己的书签' : 'You are viewing demo data. Click "Login" in the top-right to see your own bookmarks.'}
          </span>
        </div>
      )}

      <Hero data={data} />

      <div className="space-y-5">
        <ChartCard title={c.bookmarkRhythm} delay="0.1s">
          <CalendarHeatmap analytics={data.analytics} />
        </ChartCard>

        <div className="grid md:grid-cols-2 gap-5">
          <ChartCard title={c.engagementRank} delay="0.15s">
            <EngagementRank bookmarks={data.bookmarks} />
          </ChartCard>
          <ChartCard title={c.contentTypes} delay="0.2s">
            <ContentTypePie analytics={data.analytics} />
          </ChartCard>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <ChartCard title={c.hotWords} delay="0.25s">
            <WordCloud analytics={data.analytics} />
          </ChartCard>
          <ChartCard title={c.authorNetwork} delay="0.3s">
            <AuthorGraph analytics={data.analytics} />
          </ChartCard>
        </div>

        <ChartCard title={c.trends} delay="0.35s">
          <Timeline analytics={data.analytics} />
        </ChartCard>
      </div>
    </main>
  );
}
