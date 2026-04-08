import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message || 'Unknown error';
      const stack = this.state.error?.stack || '';
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5" style={{ background: 'var(--bg)' }}>
          <div className="text-4xl">:(</div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Something went wrong
          </h2>
          <p className="text-[14px] max-w-md text-center font-mono" style={{ color: 'var(--danger)' }}>
            {msg}
          </p>
          {stack && (
            <pre
              className="text-[11px] max-w-lg max-h-[200px] overflow-auto p-3 rounded-xl"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >{stack.split('\n').slice(0, 8).join('\n')}</pre>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); }}
              className="px-5 py-2 rounded-full text-[14px] font-bold cursor-pointer"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Dismiss
            </button>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="px-5 py-2 rounded-full text-[14px] font-bold text-white cursor-pointer"
              style={{ background: 'var(--accent)' }}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
