import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5" style={{ background: 'var(--bg)' }}>
          <div className="text-4xl">:(</div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Something went wrong
          </h2>
          <p className="text-[14px] max-w-md text-center" style={{ color: 'var(--text-secondary)' }}>
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="px-5 py-2 rounded-full text-[14px] font-bold text-white cursor-pointer"
            style={{ background: 'var(--accent)' }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
