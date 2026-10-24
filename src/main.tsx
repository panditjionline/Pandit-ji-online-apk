import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './i18n/LanguageContext';
import { AstroModeProvider } from './context/AstroModeContext';
import type { BeforeInstallPromptEvent } from './utils/usePWAInstall';
import './index.css';

// Capture beforeinstallprompt immediately on page load
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    window.__deferredPWAInstallPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
  });

  window.addEventListener('appinstalled', () => {
    window.__deferredPWAInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });

  // Register Service Worker (/sw.js) at root scope immediately for PWA installability
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Promptly check for updates
        registration.update().catch(() => {});
      })
      .catch((err) => {
        console.warn('Service Worker registration issue:', err);
      });
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <AstroModeProvider>
        <App />
      </AstroModeProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
