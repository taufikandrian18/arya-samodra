import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { isKnownPath } from './lib/route.js';
import '@fontsource-variable/space-grotesk/wght.css';
import './index.css';

// Unknown paths get the 404 page, a small chunk loaded only when needed.
const NotFound = lazy(() => import('./components/NotFound.jsx'));
const known = isKnownPath(window.location.pathname, import.meta.env.BASE_URL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {known ? (
      <App />
    ) : (
      <Suspense fallback={<div className="min-h-svh bg-navy-deep" />}>
        <NotFound />
      </Suspense>
    )}
  </React.StrictMode>
);
