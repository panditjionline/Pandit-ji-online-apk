import React, { useEffect, useState, useCallback, useRef } from 'react';
import { PanditPortrait } from './PanditPortrait';
import type { BeforeInstallPromptEvent } from '../utils/usePWAInstall';
import { Download, X, Loader2 } from 'lucide-react';

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__deferredPWAInstallPrompt) {
      return window.__deferredPWAInstallPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isWaitingForPrompt, setIsWaitingForPrompt] = useState<boolean>(false);
  const isWaitingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Hide automatically if already running in standalone PWA mode
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      if (standalone) {
        setIsInstalled(true);
      }
    };
    checkStandalone();

    // Sync any prompt captured in main.tsx
    if (window.__deferredPWAInstallPrompt) {
      setDeferredPrompt(window.__deferredPWAInstallPrompt);
    }

    const handlePromptReady = () => {
      if (window.__deferredPWAInstallPrompt) {
        setDeferredPrompt(window.__deferredPWAInstallPrompt);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPWAInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
    };

    const handleAppInstalled = () => {
      window.__deferredPWAInstallPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsWaitingForPrompt(false);
      isWaitingRef.current = false;
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-available', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-installed', handleAppInstalled);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-available', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-installed', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, []);

  // Loop/retry waiter that actively waits for beforeinstallprompt in the background
  const waitForPromptEvent = useCallback((timeoutMs = 6000): Promise<BeforeInstallPromptEvent | null> => {
    return new Promise((resolve) => {
      if (window.__deferredPWAInstallPrompt) {
        resolve(window.__deferredPWAInstallPrompt);
        return;
      }

      let timeoutTimer: ReturnType<typeof setTimeout>;
      let pollTimer: ReturnType<typeof setInterval>;

      const cleanup = () => {
        window.removeEventListener('beforeinstallprompt', onEvent);
        window.removeEventListener('pwa-prompt-available', onEvent);
        clearInterval(pollTimer);
        clearTimeout(timeoutTimer);
      };

      const onEvent = (e?: Event) => {
        if (e && 'prompt' in e) {
          e.preventDefault();
          window.__deferredPWAInstallPrompt = e as BeforeInstallPromptEvent;
        }
        cleanup();
        resolve(window.__deferredPWAInstallPrompt || null);
      };

      window.addEventListener('beforeinstallprompt', onEvent, { once: true });
      window.addEventListener('pwa-prompt-available', onEvent, { once: true });

      // Poll every 150ms to catch prompt as early as possible
      pollTimer = setInterval(() => {
        if (window.__deferredPWAInstallPrompt) {
          cleanup();
          resolve(window.__deferredPWAInstallPrompt);
        }
      }, 150);

      timeoutTimer = setTimeout(() => {
        cleanup();
        resolve(window.__deferredPWAInstallPrompt || null);
      }, timeoutMs);
    });
  }, []);

  const handleInstallClick = useCallback(async () => {
    let activePrompt =
      deferredPrompt ||
      (typeof window !== 'undefined' ? window.__deferredPWAInstallPrompt : null);

    // 1. If deferredPrompt is ready, trigger native prompt instantly
    if (activePrompt) {
      try {
        setIsWaitingForPrompt(true);
        isWaitingRef.current = true;
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        window.__deferredPWAInstallPrompt = null;
        setDeferredPrompt(null);
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      } finally {
        setIsWaitingForPrompt(false);
        isWaitingRef.current = false;
      }
      return;
    }

    // 2. If deferredPrompt is not yet ready, activate loop/retry listener in background
    setIsWaitingForPrompt(true);
    isWaitingRef.current = true;

    try {
      activePrompt = await waitForPromptEvent(6000);
      if (activePrompt) {
        setDeferredPrompt(activePrompt);
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        window.__deferredPWAInstallPrompt = null;
        setDeferredPrompt(null);
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
      }
    } catch (err) {
      console.warn('Retry waiter install error:', err);
    } finally {
      setIsWaitingForPrompt(false);
      isWaitingRef.current = false;
    }
  }, [deferredPrompt, waitForPromptEvent]);

  // Hide when already installed or dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-1.5 sm:pt-2">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1a0f05]/95 via-[#251508]/95 to-[#140b04]/95 border border-amber-500/60 px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-md flex items-center justify-between gap-2 backdrop-blur-xs">
        {/* Clickable Left Identity & Title */}
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isWaitingForPrompt}
          className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer group active:opacity-80 transition-opacity"
        >
          <div className="relative flex-shrink-0">
            <PanditPortrait size="xs" showBadge={false} />
          </div>
          <div className="min-w-0 flex-1 flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-yellow-300 transition-colors truncate">
              📲 Pandit Ji Online App Download Karein
            </span>
          </div>
        </button>

        {/* Right Install Action Button + Dismiss Icon */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={isWaitingForPrompt}
            className={`px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-xs border border-yellow-200 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 whitespace-nowrap ${
              isWaitingForPrompt ? 'opacity-90 ring-2 ring-yellow-300' : ''
            }`}
          >
            {isWaitingForPrompt ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-slate-950 animate-spin flex-shrink-0" />
                <span>खुल रहा है...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-950 flex-shrink-0" />
                <span>Install</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Close"
            className="p-1 rounded-md text-amber-400/70 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
