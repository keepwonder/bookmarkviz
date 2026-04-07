import { useI18n } from '../lib/i18n';

interface Props {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, confirmLabel, destructive, onConfirm, onCancel }: Props) {
  const { locale } = useI18n();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5" onClick={onCancel}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} />
      <div
        className="relative w-full max-w-[400px] rounded-2xl p-6"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        {message && <p className="text-[14px] mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{message}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-full text-[14px] font-medium cursor-pointer"
            style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            {locale === 'zh' ? '取消' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-full text-[14px] font-bold text-white cursor-pointer"
            style={{ background: destructive ? '#f4212e' : 'var(--accent)' }}
          >
            {confirmLabel || (locale === 'zh' ? '确认' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
