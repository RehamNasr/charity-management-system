import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

const root = createRoot(rootElement);

// `App` (transitively) evaluates src/firebase/env.ts at import time, which throws synchronously
// if the Firebase environment variables are missing/invalid. That happens *before* React mounts,
// so the app-level <ErrorBoundary/> can't catch it — a dynamic import lets us catch it here and
// show an actionable message instead of a blank page.
import('@app/App')
  .then(({ App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    root.render(
      <StrictMode>
        <div
          style={{
            direction: 'rtl',
            fontFamily: 'sans-serif',
            padding: '2rem',
            maxWidth: 640,
            margin: '4rem auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          <h2>تعذر تشغيل التطبيق</h2>
          <p>{message}</p>
        </div>
      </StrictMode>,
    );
  });
