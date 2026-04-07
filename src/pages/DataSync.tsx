import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { processJsonl } from '../lib/processor';
import { saveToDB } from '../lib/db';
import { setData } from '../lib/data';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import { putBookmarks, migrateData } from '../lib/api';
import { getCollections } from '../lib/collections';
import { loadNotes } from '../lib/notes';
import { loadReadSet } from '../lib/read-status';

export default function DataSync() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudDone, setCloudDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const { isAuthenticated } = useAuth();
  const s = t.sync;

  async function handleFile(file: File) {
    setStatus('processing');
    setMessage(s.processing);
    try {
      const text = await file.text();
      if (!text.trim().startsWith('{')) throw new Error(s.badFormat);
      const data = processJsonl(text);
      await saveToDB(data);
      setData(data);
      setMessage(`${s.successPrefix} ${data.meta.totalBookmarks} ${s.successMiddle} ${data.meta.totalAuthors} ${s.successSuffix}`);
      setStatus('done');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error');
      setStatus('error');
    }
  }

  async function syncToCloud() {
    setCloudSyncing(true);
    try {
      // Load current data from cache/DB
      const { loadData } = await import('../lib/data');
      const data = await loadData(true);
      if (!data || !data.bookmarks.length) {
        setCloudSyncing(false);
        return;
      }

      // Upload bookmarks + analytics
      await putBookmarks(data);

      // Migrate local collections, notes, read-status
      const collections = getCollections();
      const notes = loadNotes();
      const readSet = loadReadSet();
      const readStatus = [...readSet];

      await migrateData({
        bookmarks: data.bookmarks,
        analytics: data.analytics,
        readStatus,
        collections,
        notes,
      });

      setCloudDone(true);
    } catch (e) {
      console.error('Cloud sync failed:', e);
      setMessage(e instanceof Error ? e.message : 'Cloud sync failed');
    } finally {
      setCloudSyncing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <main className="max-w-[600px] mx-auto px-5 py-16">
      <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h1>
      <p className="text-[15px] mb-8" style={{ color: 'var(--text-secondary)' }}>{s.subtitle}</p>

      <div
        className={`rounded-2xl p-10 text-center cursor-pointer transition-all duration-200`}
        style={{
          border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border)'}`,
          background: dragActive ? 'var(--accent-bg)' : 'var(--bg-secondary)',
        }}
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".jsonl" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent-bg)' }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.5}>
            <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div className="text-[15px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{s.dragHint}</div>
        <div className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{s.fileHint}</div>
      </div>

      {status !== 'idle' && (
        <div className="mt-4 p-4 rounded-xl text-[14px]"
          style={{
            background: status === 'done' ? 'var(--accent-bg)' : status === 'error' ? 'rgba(244,33,46,0.1)' : 'var(--accent-bg)',
            color: status === 'error' ? 'var(--danger)' : 'var(--accent)',
            border: '1px solid ' + (status === 'done' ? 'var(--accent-bg-strong)' : 'transparent'),
          }}>
          {status === 'processing' && '⏳ '}{message}
        </div>
      )}

      {status === 'done' && (
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-full text-[15px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >{s.viewDashboard}</button>

          {isAuthenticated && !cloudDone && (
            <button
              onClick={syncToCloud}
              disabled={cloudSyncing}
              className="px-6 py-2.5 rounded-full text-[15px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
            >
              {cloudSyncing ? (locale === 'zh' ? '同步中...' : 'Syncing...') : (locale === 'zh' ? '同步到云端' : 'Sync to Cloud')}
            </button>
          )}
          {cloudDone && (
            <span className="text-[14px]" style={{ color: 'var(--accent)' }}>
              ✓ {locale === 'zh' ? '已同步到云端' : 'Synced to cloud'}
            </span>
          )}
        </div>
      )}

      {/* Cloud sync for logged-in users with existing local data */}
      {isAuthenticated && status === 'idle' && (
        <div
          className="mt-8 rounded-2xl p-5"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.5}>
              <path d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
            <h3 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {locale === 'zh' ? '云端同步' : 'Cloud Sync'}
            </h3>
          </div>
          <p className="text-[14px] mb-4" style={{ color: 'var(--text-secondary)' }}>
            {locale === 'zh'
              ? '上传本地文件后，可以将数据同步到云端，跨设备访问你的书签。'
              : 'After uploading a local file, sync your data to the cloud to access bookmarks across devices.'}
          </p>
          <button
            onClick={syncToCloud}
            disabled={cloudSyncing}
            className="px-5 py-2 rounded-full text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
          >
            {cloudSyncing
              ? (locale === 'zh' ? '同步中...' : 'Syncing...')
              : cloudDone
                ? (locale === 'zh' ? '✓ 已同步' : '✓ Synced')
                : (locale === 'zh' ? '上传本地数据到云端' : 'Upload Local Data to Cloud')}
          </button>
        </div>
      )}

      <div className="mt-12 rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <h3 className="text-[15px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{s.stepsTitle}</h3>
        <ol className="space-y-3 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          <li className="flex gap-3"><span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: 'var(--accent)', color: '#fff' }}>1</span>{s.step1} <code style={{ color: 'var(--accent)', background: 'var(--accent-bg)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>ft sync</code></li>
          <li className="flex gap-3"><span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: 'var(--accent)', color: '#fff' }}>2</span>{s.step2}</li>
          <li className="flex gap-3"><span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: 'var(--accent)', color: '#fff' }}>3</span>{s.step3}</li>
          <li className="flex gap-3"><span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: 'var(--accent)', color: '#fff' }}>4</span>{s.step4}</li>
        </ol>
      </div>
    </main>
  );
}
