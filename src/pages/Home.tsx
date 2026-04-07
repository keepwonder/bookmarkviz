import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [noData, setNoData] = useState(false);
  const { t, locale } = useI18n();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadData(isAuthenticated).then(d => {
      if (d) {
        setData(d);
      } else {
        // Authenticated but no cloud data yet
        setNoData(true);
      }
    });
  }, [isAuthenticated]);

  if (noData && isAuthenticated) {
    return (
      <main className="max-w-[600px] mx-auto px-5 py-20 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--accent-bg)' }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.5}>
            <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          {locale === 'zh' ? '还没有书签数据' : 'No Bookmarks Yet'}
        </h2>
        <p className="text-[15px] mb-8" style={{ color: 'var(--text-secondary)' }}>
          {locale === 'zh'
            ? '上传你的 X 书签文件，开始可视化分析'
            : 'Upload your X bookmarks file to start visualizing'}
        </p>
        <Link
          to="/sync"
          className="inline-block px-7 py-3 rounded-full text-[15px] font-bold text-white transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'var(--accent)' }}
        >
          {locale === 'zh' ? '上传数据' : 'Upload Data'}
        </Link>
      </main>
    );
  }

  // Demo banner for unauthenticated users viewing demo data
  const isDemo = data?.meta?.source === 'demo' && !isAuthenticated;

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
