import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CalculationViewingMode,
  getCalculationViewingMode,
  setCalculationViewingMode,
  getCurrentISTDateKey,
  getMsUntilNextISTMidnight,
} from '../utils/familyVaultStorage';

interface AstroModeContextValue {
  calcViewingMode: CalculationViewingMode;
  setCalcViewingMode: (mode: CalculationViewingMode) => void;
  currentDateKey: string;
  forceRefreshPredictions: () => void;
}

const AstroModeContext = createContext<AstroModeContextValue>({
  calcViewingMode: 'astronomical',
  setCalcViewingMode: () => {},
  currentDateKey: getCurrentISTDateKey(),
  forceRefreshPredictions: () => {},
});

export const AstroModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [calcViewingMode, setCalcViewingModeState] = useState<CalculationViewingMode>(() =>
    getCalculationViewingMode()
  );
  const [currentDateKey, setCurrentDateKey] = useState<string>(() => getCurrentISTDateKey());

  const setCalcViewingMode = useCallback((mode: CalculationViewingMode) => {
    setCalcViewingModeState(mode);
    setCalculationViewingMode(mode);
  }, []);

  const forceRefreshPredictions = useCallback(() => {
    const freshKey = getCurrentISTDateKey();
    setCurrentDateKey(freshKey);
    window.dispatchEvent(new CustomEvent('panditji_midnight_refresh', { detail: freshKey }));
  }, []);

  useEffect(() => {
    const handlePrefChange = (e: Event) => {
      const customEvt = e as CustomEvent<CalculationViewingMode>;
      if (customEvt.detail === 'astronomical' || customEvt.detail === 'name_rashi') {
        setCalcViewingModeState(customEvt.detail);
      } else {
        setCalcViewingModeState(getCalculationViewingMode());
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'panditji_calc_viewing_mode_v1') {
        setCalcViewingModeState(getCalculationViewingMode());
      }
    };

    window.addEventListener('display_preference_changed', handlePrefChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('display_preference_changed', handlePrefChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Automated Midnight Date-Watcher: detects crossing 12:00 AM IST, clears stale cached predictions, and triggers re-evaluation
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleMidnightRefresh = () => {
      const msUntilMidnight = getMsUntilNextISTMidnight();
      timeoutId = setTimeout(() => {
        const nextKey = getCurrentISTDateKey();
        try {
          // Clear any cached daily rashifal or prediction strings
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith('panditji_daily_pred_cache_') || k.startsWith('panditji_rashifal_cache_')) {
              localStorage.removeItem(k);
            }
          });
        } catch {}
        setCurrentDateKey(nextKey);
        window.dispatchEvent(new CustomEvent('panditji_midnight_refresh', { detail: nextKey }));
        scheduleMidnightRefresh();
      }, msUntilMidnight);
    };

    scheduleMidnightRefresh();

    // Also check every 30 seconds in case device slept across midnight
    const intervalId = setInterval(() => {
      const nowKey = getCurrentISTDateKey();
      setCurrentDateKey((prevKey) => {
        if (prevKey !== nowKey) {
          window.dispatchEvent(new CustomEvent('panditji_midnight_refresh', { detail: nowKey }));
          return nowKey;
        }
        return prevKey;
      });
    }, 30000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <AstroModeContext.Provider
      value={{
        calcViewingMode,
        setCalcViewingMode,
        currentDateKey,
        forceRefreshPredictions,
      }}
    >
      {children}
    </AstroModeContext.Provider>
  );
};

export const useAstroMode = () => useContext(AstroModeContext);
