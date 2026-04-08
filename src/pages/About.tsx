import { useState, useRef } from 'react';
import { useI18n } from '../lib/i18n';
import { exportData, importData } from '../lib/export';

const LINKS = {
  fieldtheory: 'https://github.com/afar1/fieldtheory-cli',
  github: 'https://github.com/keepwonder/bookmarkviz',
  react: 'https://react.dev',
  echarts: 'https://echarts.apache.org',
  tailwindcss: 'https://tailwindcss.com',
  cloudflare: 'https://pages.cloudflare.com',
  typescript: 'https://www.typescriptlang.org',
  vite: 'https://vite.dev',
};

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

  const techStack = [
    { name: 'React 19', href: LINKS.react },
    { name: 'TypeScript', href: LINKS.typescript },
    { name: 'Vite', href: LINKS.vite },
    { name: 'ECharts', href: LINKS.echarts },
    { name: 'Tailwind CSS v4', href: LINKS.tailwindcss },
    { name: 'Cloudflare Pages', href: LINKS.cloudflare },
  ];

  const steps = [a.update1, a.update2, a.update3, a.update4];

  return (
    <main className="max-w-[700px] mx-auto px-5 py-12">
      <h1 className="text-xl font-bold mb-10" style={{ color: 'var(--text-primary)' }}>{a.title}</h1>

      {/* What */}
      <section className="mb-8">
        <h2 className="text-[17px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{a.whatTitle}</h2>
        <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a.whatDesc}</p>
        <div className="mt-3">
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer"
            className="text-[14px] font-medium hover:underline" style={{ color: 'var(--accent)' }}
          >{a.openSourceTitle} →</a>
        </div>
      </section>

      {/* Data Source */}
      <section className="mb-8">
        <h2 className="text-[17px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{a.dataSourceTitle}</h2>
        <p className="text-[15px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{a.dataSourceDesc}</p>
        <p className="text-[14px] mb-2" style={{ color: 'var(--text-secondary)' }}>{a.dataSourceInfo}</p>
        <ul className="text-[14px] space-y-1 pl-4" style={{ color: 'var(--text-tertiary)', listStyle: 'disc' }}>
          <li>{a.dataInfo1}</li>
          <li>{a.dataInfo2}</li>
          <li>{a.dataInfo3}</li>
          <li>{a.dataInfo4}</li>
        </ul>
        <div className="mt-3">
          <a href={LINKS.fieldtheory} target="_blank" rel="noopener noreferrer"
            className="text-[14px] font-medium hover:underline" style={{ color: 'var(--accent)' }}
          >fieldtheory-cli →</a>
        </div>
      </section>

      {/* Features */}
      <section className="mb-8">
        <h2 className="text-[17px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{a.featureTitle}</h2>
        <div className="grid gap-3">
          {[
            { icon: '📊', title: a.dashboardTitle, desc: a.dashboardDesc },
            { icon: '🔍', title: a.exploreTitle, desc: a.exploreDesc },
            { icon: '☁️', title: a.syncTitle, desc: a.syncDesc },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <span className="text-lg">{f.icon}</span>
              <div>
                <h3 className="text-[15px] font-bold" style={{ color: 'var(--accent)' }}>{f.title}</h3>
                <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-8">
        <h2 className="text-[17px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{a.privacyTitle}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[a.privacy1, a.privacy2, a.privacy3, a.privacy4].map((text, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-8">
        <h2 className="text-[17px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{a.techTitle}</h2>
        <div className="flex flex-wrap gap-2">
          {techStack.map(tech => (
            <a key={tech.name} href={tech.href} target="_blank" rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-bg)' }}
            >{tech.name}</a>
          ))}
        </div>
      </section>

      {/* Data Management */}
      <section className="mb-8">
        <h2 className="text-[17px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          {locale === 'zh' ? '数据管理' : 'Data Management'}
        </h2>
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <p className="text-[14px] mb-4" style={{ color: 'var(--text-secondary)' }}>
            {locale === 'zh' ? '导出或导入你的阅读状态、合集和笔记数据。' : 'Export or import your read status, collections, and notes.'}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={exportData}
              className="px-5 py-2 rounded-full text-[14px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)' }}>
              {locale === 'zh' ? '导出数据' : 'Export Data'}
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="px-5 py-2 rounded-full text-[14px] font-bold cursor-pointer transition-colors"
              style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>
              {locale === 'zh' ? '导入数据' : 'Import Data'}
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
          {importMsg && (
            <p className="mt-3 text-[13px]" style={{ color: importMsg.includes('success') || importMsg.includes('成功') ? 'var(--success)' : 'var(--danger)' }}>
              {importMsg}
            </p>
          )}
        </div>
      </section>

      {/* Getting Started */}
      <section className="mb-8">
        <h2 className="text-[17px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{a.updateTitle}</h2>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                style={{ background: 'var(--accent)', color: '#fff' }}>{i + 1}</span>
              <span className="text-[14px] pt-0.5" style={{ color: 'var(--text-secondary)' }}>{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4">
          <a href={LINKS.fieldtheory} target="_blank" rel="noopener noreferrer"
            className="text-[14px] font-medium hover:underline" style={{ color: 'var(--accent)' }}
          >fieldtheory-cli on GitHub →</a>
        </div>
      </section>

      {/* Credits */}
      <section className="mb-4 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="text-center">
          <p className="text-[14px] mb-2" style={{ color: 'var(--text-secondary)' }}>{a.contributeDesc}</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer"
              className="text-[14px] font-medium hover:underline" style={{ color: 'var(--accent)' }}>GitHub</a>
            <a href={LINKS.fieldtheory} target="_blank" rel="noopener noreferrer"
              className="text-[14px] font-medium hover:underline" style={{ color: 'var(--text-secondary)' }}>fieldtheory-cli</a>
          </div>
        </div>
      </section>
    </main>
  );
}
