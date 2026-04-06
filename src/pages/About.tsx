import { useState, useRef } from 'react';
import { useI18n } from '../lib/i18n';
import { exportData, importData } from '../lib/export';

export default function About() {
  const { t, locale } = useI18n();
  const a = t.about;
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = importData(e.target?.result as string);
      setImportMsg(result.message);
      setTimeout(() => setImportMsg(''), 3000);
    };
    reader.readAsText(file);
  };

  const sections = [
    { title: a.whatTitle, items: [a.whatDesc] },
    { title: a.dataSourceTitle, items: [a.dataSourceDesc, a.dataSourceInfo, `• ${a.dataInfo1}`, `• ${a.dataInfo2}`, `• ${a.dataInfo3}`, `• ${a.dataInfo4}`] },
    { title: a.privacyTitle, items: [`• ${a.privacy1}`, `• ${a.privacy2}`, `• ${a.privacy3}`, `• ${a.privacy4}`] },
    { title: a.featureTitle, items: [
      { sub: a.dashboardTitle, items: [a.dashboardDesc, `• ${a.dashStat}`, `• ${a.dashHeatmap}`, `• ${a.dashRank}`, `• ${a.dashType}`, `• ${a.dashWord}`, `• ${a.dashAuthor}`, `• ${a.dashTrend}`] },
      { sub: a.exploreTitle, items: [a.exploreDesc, `• ${a.exp1}`, `• ${a.exp2}`, `• ${a.exp3}`, `• ${a.exp4}`] },
      { sub: a.syncTitle, items: [a.syncDesc, `• ${a.sync1}`, `• ${a.sync2}`, `• ${a.sync3}`, `• ${a.sync4}`] },
    ]},
    { title: a.updateTitle, items: [`1. ${a.update1}`, `2. ${a.update2}`, `3. ${a.update3}`, `4. ${a.update4}`] },
  ];

  return (
    <main className="max-w-[700px] mx-auto px-5 py-12">
      <h1 className="text-xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>{a.title}</h1>

      {sections.map((section, i) => (
        <section key={i} className="mb-8">
          <h2 className="text-[17px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{section.title}</h2>
          {section.title === a.techTitle ? (
            <div className="flex flex-wrap gap-2">
              {['React 19', 'TypeScript', 'Vite', 'ECharts', 'Tailwind CSS v4', 'Cloudflare Pages'].map(tech => (
                <span key={tech} className="px-4 py-1.5 rounded-full text-[13px] font-medium"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-bg)' }}
                >{tech}</span>
              ))}
            </div>
          ) : section.title === a.featureTitle ? (
            <div className="space-y-6">
              {(section.items as { sub: string; items: string[] }[]).map((sub, j) => (
                <div key={j} className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--accent)' }}>{sub.sub}</h3>
                  <div className="text-[14px] space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    {sub.items.map((line, k) => <p key={k}>{line}</p>)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[15px] space-y-2" style={{ color: 'var(--text-secondary)' }}>
              {(section.items as string[]).map((item, j) => <p key={j}>{item}</p>)}
            </div>
          )}
        </section>
      ))}

      {/* Data Export/Import */}
      <section className="mb-8">
        <h2 className="text-[17px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          {locale === 'zh' ? '数据管理' : 'Data Management'}
        </h2>
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <p className="text-[14px] mb-4" style={{ color: 'var(--text-secondary)' }}>
            {locale === 'zh'
              ? '导出或导入你的阅读状态、合集和笔记数据。'
              : 'Export or import your read status, collections, and notes.'}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={exportData}
              className="px-5 py-2 rounded-full text-[14px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)' }}
            >
              {locale === 'zh' ? '导出数据' : 'Export Data'}
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="px-5 py-2 rounded-full text-[14px] font-bold cursor-pointer transition-colors"
              style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
            >
              {locale === 'zh' ? '导入数据' : 'Import Data'}
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
          {importMsg && (
            <p className="mt-3 text-[13px]" style={{ color: importMsg.includes('success') || importMsg.includes('成功') ? '#00ba7c' : '#f4212e' }}>
              {importMsg}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
