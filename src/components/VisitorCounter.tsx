import React, { useEffect, useState } from 'react';
import { Users, Sparkles, Eye, Activity } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const BASE_TEN_LAKH = 1000000;
const BASE_ACTIVE_USERS = 100;
const STORAGE_MAX_KEY = 'panditji_permanent_visitor_count_max';
const MY_VISITS_KEY = 'panditji_my_device_visits';
const SESSION_ID_KEY = 'panditji_active_session_id';

export interface VisitorCounterState {
  count: number;
  myVisits: number;
  justIncremented: boolean;
  activeBase: number;
  activeLivePlus: number;
  activeUsers: number;
}

function getOrCreateSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return `s_fallback_${Math.random().toString(36).slice(2, 9)}`;
  }
}

function getStoredMaxCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_MAX_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    if (Number.isFinite(parsed) && parsed >= BASE_TEN_LAKH) {
      return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return BASE_TEN_LAKH;
}

function saveStoredMaxCount(val: number): void {
  try {
    const current = getStoredMaxCount();
    const highest = Math.max(BASE_TEN_LAKH, current, Math.floor(val));
    localStorage.setItem(STORAGE_MAX_KEY, String(highest));
  } catch {
    // ignore storage errors
  }
}

function getAndIncrementMyVisits(): number {
  try {
    const raw = localStorage.getItem(MY_VISITS_KEY);
    const prev = raw ? parseInt(raw, 10) : 0;
    const next = (Number.isFinite(prev) && prev > 0 ? prev : 0) + 1;
    localStorage.setItem(MY_VISITS_KEY, String(next));
    return next;
  } catch {
    return 1;
  }
}

function getMyVisitsReadOnly(): number {
  try {
    const raw = localStorage.getItem(MY_VISITS_KEY);
    const prev = raw ? parseInt(raw, 10) : 1;
    return Number.isFinite(prev) && prev > 0 ? prev : 1;
  } catch {
    return 1;
  }
}

// Module-level singleton so all mounted counter components share the exact same live state
let globalState: VisitorCounterState = {
  count: typeof window !== 'undefined' ? getStoredMaxCount() : BASE_TEN_LAKH,
  myVisits: typeof window !== 'undefined' ? getMyVisitsReadOnly() : 1,
  justIncremented: false,
  activeBase: BASE_ACTIVE_USERS,
  activeLivePlus: 1,
  activeUsers: BASE_ACTIVE_USERS + 1,
};

let hasIncrementedThisPageLoad = false;
let heartbeatInitialized = false;
const listeners = new Set<(state: VisitorCounterState) => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener({ ...globalState });
  }
}

function applyServerData(data: Record<string, unknown>) {
  let changed = false;

  if (typeof data?.count === 'number' && data.count >= BASE_TEN_LAKH) {
    const syncedCount = Math.max(globalState.count, Math.floor(data.count));
    if (syncedCount !== globalState.count) {
      saveStoredMaxCount(syncedCount);
      globalState.count = syncedCount;
      changed = true;
    }
  }

  if (typeof data?.activeLivePlus === 'number' && data.activeLivePlus >= 1) {
    const livePlus = Math.max(1, Math.floor(data.activeLivePlus));
    const totalActive = BASE_ACTIVE_USERS + livePlus;
    if (
      livePlus !== globalState.activeLivePlus ||
      totalActive !== globalState.activeUsers
    ) {
      globalState.activeBase = BASE_ACTIVE_USERS;
      globalState.activeLivePlus = livePlus;
      globalState.activeUsers = totalActive;
      changed = true;
    }
  }

  if (changed) {
    notifyListeners();
  }
}

async function pingActiveHeartbeat() {
  if (typeof window === 'undefined') return;
  try {
    const knownMax = getStoredMaxCount();
    const sessionId = getOrCreateSessionId();
    const res = await fetch(
      `/api/visitor-counter?clientMax=${knownMax}&sessionId=${encodeURIComponent(sessionId)}`
    );
    if (res.ok) {
      const data = await res.json();
      applyServerData(data);
    }
  } catch {
    // Offline fallback
  }
}

async function initVisitorCounterOnce() {
  if (typeof window === 'undefined' || hasIncrementedThisPageLoad) return;
  hasIncrementedThisPageLoad = true;

  const sessionId = getOrCreateSessionId();
  const myVisits = getAndIncrementMyVisits();
  const localMaxBefore = getStoredMaxCount();
  const optimisticCount = Math.max(BASE_TEN_LAKH, localMaxBefore) + 1;
  saveStoredMaxCount(optimisticCount);

  globalState = {
    ...globalState,
    count: optimisticCount,
    myVisits,
    justIncremented: true,
    activeBase: BASE_ACTIVE_USERS,
    activeLivePlus: Math.max(1, globalState.activeLivePlus),
    activeUsers: BASE_ACTIVE_USERS + Math.max(1, globalState.activeLivePlus),
  };
  notifyListeners();

  try {
    const res = await fetch('/api/visitor-counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientKnownMax: localMaxBefore,
        increment: true,
        sessionId,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      applyServerData(data);
    }
  } catch {
    // Offline fallback already handled
  }
}

function startGlobalHeartbeatAndActivityWatcher() {
  if (typeof window === 'undefined' || heartbeatInitialized) return;
  heartbeatInitialized = true;

  const sessionId = getOrCreateSessionId();

  // Poll every 10 seconds to keep this user session active and receive live active user count
  setInterval(() => {
    pingActiveHeartbeat();
  }, 10000);

  // Also trigger heartbeat on user activity (throttled to once every 6 seconds)
  let lastActivityPing = 0;
  const onUserActivity = () => {
    const now = Date.now();
    if (now - lastActivityPing > 6000) {
      lastActivityPing = now;
      pingActiveHeartbeat();
    }
  };

  window.addEventListener('click', onUserActivity, { passive: true });
  window.addEventListener('keydown', onUserActivity, { passive: true });
  window.addEventListener('touchstart', onUserActivity, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      pingActiveHeartbeat();
    }
  });

  // Notify server when tab closes so active user count updates immediately
  const onLeave = () => {
    try {
      const payload = JSON.stringify({ sessionId });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/active-users/leave', blob);
      } else {
        fetch('/api/active-users/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  window.addEventListener('pagehide', onLeave);
  window.addEventListener('beforeunload', onLeave);
}

export function useVisitorCounter(): VisitorCounterState {
  const [state, setState] = useState<VisitorCounterState>(globalState);

  useEffect(() => {
    listeners.add(setState);
    initVisitorCounterOnce();
    startGlobalHeartbeatAndActivityWatcher();

    return () => {
      listeners.delete(setState);
    };
  }, []);

  return state;
}

/**
 * Formats a number in the Indian numbering system (e.g., 10,00,014)
 */
export function formatIndianNumber(num: number): string {
  const safeNum = Math.max(BASE_TEN_LAKH, Math.floor(num));
  return safeNum.toLocaleString('en-IN');
}

/**
 * Compact Dual Badge for the Header (Clean numbers only)
 */
export const HeaderVisitorBadge: React.FC = () => {
  const { count, activeUsers } = useVisitorCounter();
  const { tr } = useLanguage();
  const formatted = formatIndianNumber(count);

  return (
    <div className="inline-flex items-center gap-1.5 flex-shrink-0">
      {/* Live Active Users Pill */}
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/95 border border-emerald-400/60 text-emerald-100 shadow-xs whitespace-nowrap flex-shrink-0"
        title={`${tr('अभी सक्रिय श्रद्धालु:', 'Active Devotees Now:', 'Abhi Sakriya Shraddhalu:')} ${activeUsers}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
        <span className="text-[10px] text-emerald-200 font-semibold">
          {tr('सक्रिय:', 'Live:', 'Live:', 'सक्रिय:', 'સક્રિય:')}
        </span>
        <span className="font-mono font-extrabold text-[10px] sm:text-[11px] text-emerald-300 tabular-nums">
          {activeUsers}
        </span>
      </div>

      {/* Total Visits Pill */}
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-400/50 text-amber-100 shadow-xs whitespace-nowrap flex-shrink-0"
        title={`${tr('कुल श्रद्धालु एवं दर्शन:', 'Total Devotees & Visits:', 'Kul Shraddhalu & Darshan:')} ${formatted}`}
      >
        <Eye className="w-3 h-3 text-amber-400 flex-shrink-0" />
        <span className="hidden sm:inline text-[10px] text-amber-200/90 font-semibold">
          {tr('दर्शन:', 'Visits:', 'Darshan:', 'दर्शन:', 'દર્શન:')}
        </span>
        <span className="font-mono font-extrabold text-[10px] sm:text-[11px] text-yellow-300 tabular-nums">
          {formatted}
        </span>
      </div>
    </div>
  );
};

/**
 * Royal Vedic Live Active Users & Total Visitor Counter Card for the Home Page (Clean numbers only)
 */
export const VisitorCounterBanner: React.FC = () => {
  const { count, myVisits, activeUsers } = useVisitorCounter();
  const { tr } = useLanguage();
  const formatted = formatIndianNumber(count);
  const chars = formatted.split('');

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1c0f05] via-[#2b1708] to-[#1c0f05] border-2 border-amber-500/60 p-4 sm:p-5 shadow-[0_0_28px_rgba(245,158,11,0.18)]">
      {/* Subtle golden & emerald glow background */}
      <div className="absolute -top-12 -left-12 w-44 h-44 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-4">
        {/* Left: Clean Title */}
        <div className="flex items-center gap-3.5 text-center sm:text-left flex-col sm:flex-row w-full xl:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 p-[2px] shadow-[0_0_16px_rgba(251,191,36,0.45)] flex-shrink-0">
            <div className="w-full h-full rounded-[14px] bg-[#1f1005] flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-400" />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold font-vedic text-amber-100">
              {tr(
                'पण्डित जी ऑनलाइन — प्रत्यक्ष श्रद्धालु एवं कुल दर्शन',
                'Pandit Ji Online — Live Devotees & Total Visits',
                'Pandit Ji Online — Live Shraddhalu & Kul Darshan',
                'पंडित जी ऑनलाइन — थेट भाविक आणि एकूण दर्शन',
                'પંડિત જી ઓનલાઇન — લાઇવ શ્રદ્ધાળુ અને કુલ દર્શન'
              )}
            </h3>
            <p className="text-xs text-amber-300/85 mt-0.5">
              {tr(
                'वैदिक ज्योतिष, कुंडली विश्लेषण एवं अनुष्ठान परामर्श सेवा',
                'Vedic Astrology, Kundali Analysis & Ritual Consultation Service',
                'Vedic Jyotish, Kundali Vishleshan & Anushthan Paramarsh Seva'
              )}
            </p>
          </div>
        </div>

        {/* Right: Clean Numbers (1. Live Active Users | 2. Total Visitors Odometer) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto justify-center xl:justify-end flex-shrink-0">
          {/* 1. Live Active Users Box */}
          <div
            className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-b from-emerald-950/95 via-[#07261c] to-emerald-950/95 border border-emerald-400/60 shadow-[0_0_16px_rgba(16,185,129,0.22)]"
            title={`${tr('अभी सक्रिय श्रद्धालु:', 'Active Devotees Now:', 'Abhi Sakriya Shraddhalu:')} ${activeUsers}`}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40">
                <Activity className="w-4 h-4 text-emerald-300" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-emerald-200">
                  {tr('अभी सक्रिय श्रद्धालु', 'Active Devotees', 'Abhi Sakriya Users', 'सध्या सक्रिय भाविक', 'હાલ સક્રિય શ્રદ્ધાળુ')}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  {tr('प्रत्यक्ष ऑनलाइन', 'Live Active', 'Live Active', 'थेट ऑनलाइन', 'લાઇવ ઓનલાઇન')}
                </div>
              </div>
            </div>

            <div className="px-3.5 py-1 rounded-xl bg-[#041710] border border-emerald-400/70 shadow-inner flex items-baseline gap-1.5">
              <span className="font-mono font-extrabold text-xl sm:text-2xl text-emerald-300 tabular-nums leading-none">
                {activeUsers}
              </span>
              <span className="text-[10px] font-bold text-emerald-400">
                {tr('सक्रिय', 'LIVE', 'LIVE', 'सक्रिय', 'સક્રિય')}
              </span>
            </div>
          </div>

          {/* 2. Royal Odometer Digit Boxes */}
          <div className="flex flex-col items-center sm:items-end gap-1 flex-shrink-0">
            <div
              className="flex items-center gap-1 sm:gap-1.5 p-2 rounded-2xl bg-[#110903]/90 border border-amber-500/50 shadow-inner"
              aria-label={`${tr('कुल दर्शन संख्या:', 'Total Visits:', 'Kul Darshan Sankhya:')} ${formatted}`}
            >
              {chars.map((ch, idx) => {
                if (ch === ',') {
                  return (
                    <span
                      key={`sep-${idx}`}
                      className="text-amber-400 font-extrabold text-base sm:text-xl px-0.5 select-none"
                    >
                      ,
                    </span>
                  );
                }
                return (
                  <div
                    key={`digit-${idx}`}
                    className="w-6 h-8 sm:w-8 sm:h-10 rounded-lg bg-gradient-to-b from-[#331c08] via-[#1f1004] to-[#331c08] border border-amber-400/70 shadow-[0_0_10px_rgba(251,191,36,0.25)] flex items-center justify-center"
                  >
                    <span className="font-mono font-extrabold text-sm sm:text-lg text-gold-gradient tabular-nums leading-none">
                      {ch}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-2 text-[10px] sm:text-[11px] text-amber-200/90 font-medium">
              <span>{tr('कुल पोर्टल दर्शन', 'Total Portal Visits', 'Kul Portal Darshan', 'एकूण पोर्टल दर्शन', 'કુલ પોર્ટલ દર્શન')}</span>
              <span className="text-amber-600">•</span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>{tr('आपका दर्शन क्र.:', 'Your Visit #:', 'Aapka Darshan #:', 'तुमचा दर्शन क्र.:', 'તમારો દર્શન ક્ર.:')} #{myVisits}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Footer Counter & Live Active Users Badge (Clean numbers only)
 */
export const FooterVisitorBadge: React.FC = () => {
  const { count, activeUsers } = useVisitorCounter();
  const { tr } = useLanguage();
  const formatted = formatIndianNumber(count);

  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-2">
      {/* Active Users Footer Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.18)]">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
        <span className="text-xs font-semibold text-emerald-200">
          {tr('अभी सक्रिय श्रद्धालु:', 'Active Devotees:', 'Abhi Sakriya:', 'सध्या सक्रिय:', 'હાલ સક્રિય:')}
        </span>
        <span className="font-mono font-extrabold text-xs sm:text-sm text-emerald-300 tabular-nums">
          {activeUsers}
        </span>
      </div>

      {/* Total Darshan Footer Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1f1106] via-[#2b1808] to-[#1f1106] border border-amber-500/50 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.18)]">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
        <span className="text-xs font-semibold text-amber-200">
          {tr('कुल पोर्टल दर्शन:', 'Total Visits:', 'Kul Darshan:', 'एकूण दर्शन:', 'કુલ દર્શન:')}
        </span>
        <span className="font-mono font-extrabold text-xs sm:text-sm text-yellow-300 tabular-nums">
          {formatted}
        </span>
      </div>
    </div>
  );
};
