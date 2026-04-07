import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';

const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const Collections = lazy(() => import('./pages/Collections'));
const DataSync = lazy(() => import('./pages/DataSync'));
const About = lazy(() => import('./pages/About'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  );
}

// Handle stale chunk errors after deployment — force hard reload once
function ChunkErrorBoundary({ children }: { children: React.ReactNode }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    function isChunkError(msg: string) {
      return msg.includes('Failed to fetch dynamically imported module') ||
             msg.includes('Importing a module script failed') ||
             msg.includes('error loading dynamically imported module');
    }
    function handleChunkError() {
      if (!sessionStorage.getItem('chunk-reloaded')) {
        sessionStorage.setItem('chunk-reloaded', '1');
        window.location.reload();
      } else {
        setFailed(true);
      }
    }
    const onError = (e: ErrorEvent) => { if (isChunkError(e.message)) handleChunkError(); };
    const onRejection = (e: PromiseRejectionEvent) => {
      const msg = e.reason?.message || String(e.reason);
      if (isChunkError(msg)) { e.preventDefault(); handleChunkError(); }
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (failed) {
    return (
      <div className="flex items-center justify-center h-[60vh] px-5 text-center">
        <div>
          <p className="text-[15px] mb-4" style={{ color: 'var(--text-secondary)' }}>
            App updated. Please refresh the page.
          </p>
          <button
            onClick={() => { sessionStorage.removeItem('chunk-reloaded'); window.location.reload(); }}
            className="px-6 py-2.5 rounded-full text-[15px] font-bold text-white"
            style={{ background: 'var(--accent)' }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ChunkErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/sync" element={<DataSync />} />
              <Route path="/about" element={<About />} />
            </Route>
          </Routes>
        </Suspense>
      </ChunkErrorBoundary>
    </BrowserRouter>
  );
}
