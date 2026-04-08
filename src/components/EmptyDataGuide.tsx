import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';

export default function EmptyDataGuide() {
  const { locale } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] px-5 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'var(--accent-bg)' }}
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.5}>
          <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      <p className="text-[15px] mb-5" style={{ color: 'var(--text-secondary)' }}>
        {locale === 'zh' ? '还没有书签数据，先上传你的 X 书签文件' : 'No bookmarks yet — upload your X bookmarks file first'}
      </p>
      <Link
        to="/sync"
        className="px-6 py-2.5 rounded-full text-[14px] font-bold transition-transform hover:scale-105 active:scale-95"
        style={{ background: 'var(--accent)', color: 'var(--card-bg)' }}
      >
        {locale === 'zh' ? '上传数据' : 'Upload Data'}
      </Link>
    </div>
  );
}
