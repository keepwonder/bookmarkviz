import { lazy, Suspense, useEffect, useState } from 'react';
import { loadData } from '../lib/data';
import type { BookmarksData } from '../lib/data';
import { useI18n } from '../lib/i18n';
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
  const { t } = useI18n();

  useEffect(() => { loadData().then(setData); }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>{t.loading}</div>
      </div>
    );
  }

  const c = t.charts;

  return (
    <main className="max-w-[1200px] mx-auto px-5 pb-20">
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
