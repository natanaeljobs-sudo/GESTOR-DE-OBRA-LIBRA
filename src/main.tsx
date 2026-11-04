import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clean up any stale dev service worker registrations that fail behind proxies
if ('serviceWorker' in navigator && import.meta.env.DEV) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => {
      if (
        r.active?.scriptURL.includes('dev-sw.js') ||
        r.waiting?.scriptURL.includes('dev-sw.js') ||
        r.installing?.scriptURL.includes('dev-sw.js')
      ) {
        r.unregister();
      }
    });
  }).catch(() => {});
}

createRoot(document.getElementById('root')!).render(<App />);
