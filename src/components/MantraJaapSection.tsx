import React, { useState, useEffect, useRef } from 'react';
import { SPIRITUAL_TRACKS } from '../data/mockData';
import { SpiritualTrack, JaapHistoryEntry, UserMobileAccount } from '../types';
import { vedicAudio } from '../utils/audioSynthesizer';
import { PanditPortrait } from './PanditPortrait';
import {
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Bell,
  Play,
  Pause,
  CheckCircle2,
  Music,
  Flame,
  PlusCircle,
  History,
  Trash2,
  Clock,
  Save
} from 'lucide-react';

interface MantraJaapSectionProps {
  isGlobalPlaying: boolean;
  onToggleGlobalAudio: (freq?: number, mantraText?: string) => void;
  currentUser?: UserMobileAccount | null;
  onSyncJaapData?: (
    stats: { currentCount: number; completedMalas: number; lifetimeJaap: number },
    history: JaapHistoryEntry[]
  ) => void;
}

type TapSoundMode = 'bead' | 'bell' | 'vocal' | 'silent';

export type { JaapHistoryEntry };

export const MantraJaapSection: React.FC<MantraJaapSectionProps> = ({
  isGlobalPlaying,
  onToggleGlobalAudio,
  currentUser,
  onSyncJaapData,
}) => {
  const [selectedMantra, setSelectedMantra] = useState<SpiritualTrack>(SPIRITUAL_TRACKS[0]);
  const [customMantraText, setCustomMantraText] = useState<string>(() => {
    try {
      return localStorage.getItem('panditji_custom_mantra_text') || '';
    } catch {
      return '';
    }
  });
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('panditji_custom_mantra_active') === 'true' &&
        Boolean(localStorage.getItem('panditji_custom_mantra_text')?.trim())
      );
    } catch {
      return false;
    }
  });
  const [savedCustomMantras, setSavedCustomMantras] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('panditji_saved_custom_mantras');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Counter states persisted in localStorage & synced with mobile account
  const [currentCount, setCurrentCount] = useState<number>(() => {
    if (currentUser?.jaapStats) return currentUser.jaapStats.currentCount || 0;
    try {
      const saved = localStorage.getItem('panditji_jaap_current');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [targetCount, setTargetCount] = useState<number>(108);
  const [completedMalas, setCompletedMalas] = useState<number>(() => {
    if (currentUser?.jaapStats) return currentUser.jaapStats.completedMalas || 0;
    try {
      const saved = localStorage.getItem('panditji_jaap_malas');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [lifetimeJaap, setLifetimeJaap] = useState<number>(() => {
    if (currentUser?.jaapStats) return currentUser.jaapStats.lifetimeJaap || 0;
    try {
      const saved = localStorage.getItem('panditji_jaap_lifetime');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // Jaap History state persisted in localStorage & synced with mobile account
  const [jaapHistory, setJaapHistory] = useState<JaapHistoryEntry[]>(() => {
    if (currentUser?.jaapHistory && Array.isArray(currentUser.jaapHistory) && currentUser.jaapHistory.length > 0) {
      return currentUser.jaapHistory;
    }
    try {
      const saved = localStorage.getItem('panditji_jaap_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [tapSoundMode, setTapSoundMode] = useState<TapSoundMode>('bead');
  const [isAutoChanting, setIsAutoChanting] = useState<boolean>(false);
  const [justCompletedMala, setJustCompletedMala] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string>('');
  const [confirmResetAll, setConfirmResetAll] = useState<boolean>(false);
  const [pulseBead, setPulseBead] = useState<boolean>(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(() =>
    vedicAudio.getActiveSpeechId()
  );

  useEffect(() => {
    const unsubSpeech = vedicAudio.subscribeSpeech((id) => {
      setActiveSpeechId(id);
    });
    return unsubSpeech;
  }, []);

  const autoChantActiveRef = useRef(false);
  const isInitialMountRef = useRef(true);
  const lastTapTimeRef = useRef<number>(0);
  const stateRef = useRef({
    currentCount,
    completedMalas,
    lifetimeJaap,
    targetCount,
  });

  useEffect(() => {
    stateRef.current = {
      currentCount,
      completedMalas,
      lifetimeJaap,
      targetCount,
    };
  }, [currentCount, completedMalas, lifetimeJaap, targetCount]);

  // Reload user's jaap stats and history when switching mobile numbers
  useEffect(() => {
    if (currentUser) {
      setCurrentCount(currentUser.jaapStats?.currentCount || 0);
      setCompletedMalas(currentUser.jaapStats?.completedMalas || 0);
      setLifetimeJaap(currentUser.jaapStats?.lifetimeJaap || 0);
      setJaapHistory(Array.isArray(currentUser.jaapHistory) ? currentUser.jaapHistory : []);
    }
  }, [currentUser?.phone]);

  useEffect(() => {
    try {
      localStorage.setItem('panditji_jaap_current', String(currentCount));
      localStorage.setItem('panditji_jaap_malas', String(completedMalas));
      localStorage.setItem('panditji_jaap_lifetime', String(lifetimeJaap));
      localStorage.setItem('panditji_jaap_history', JSON.stringify(jaapHistory));
    } catch {
      // ignore storage quota errors
    }
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    if (onSyncJaapData) {
      onSyncJaapData(
        { currentCount, completedMalas, lifetimeJaap },
        jaapHistory
      );
    }
  }, [currentCount, completedMalas, lifetimeJaap, jaapHistory]);

  // Stop auto-chanting on unmount
  useEffect(() => {
    return () => {
      autoChantActiveRef.current = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? '' : prev));
    }, 3200);
  };

  const activeMantraTitle =
    isCustomMode && customMantraText.trim()
      ? `इष्ट मंत्र: ${customMantraText.trim().slice(0, 28)}`
      : selectedMantra.hindiTitle;

  const activeMantraDeity = isCustomMode ? 'इष्ट देवता' : selectedMantra.deity;

  const activeMantraChantText =
    isCustomMode && customMantraText.trim()
      ? customMantraText.trim()
      : selectedMantra.shortMantra || selectedMantra.sanskritLyrics;

  const addHistoryEntry = (
    countVal: number,
    targetVal: number,
    isFull: boolean,
    customTitle?: string,
    customDeity?: string
  ) => {
    if (countVal <= 0) return;
    const now = new Date();
    const formattedTime = now.toLocaleString('hi-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newEntry: JaapHistoryEntry = {
      id: `jaap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      mantraTitle: customTitle || activeMantraTitle,
      deity: customDeity || activeMantraDeity,
      count: countVal,
      target: targetVal,
      isFullMala: isFull,
      timestamp: formattedTime,
    };

    setJaapHistory((prev) => [newEntry, ...prev.slice(0, 29)]);
  };

  const incrementCounter = (fromAutoChant = false) => {
    const nowMs = Date.now();
    if (!fromAutoChant && nowMs - lastTapTimeRef.current < 45) {
      return;
    }
    lastTapTimeRef.current = nowMs;

    setPulseBead(true);
    setTimeout(() => setPulseBead(false), 180);
    setConfirmResetAll(false);

    // Haptic vibration on mobile devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore
      }
    }

    const prevCurrent = stateRef.current.currentCount;
    const prevMalas = stateRef.current.completedMalas;
    const prevLifetime = stateRef.current.lifetimeJaap;
    const currentTarget = stateRef.current.targetCount;

    const nextCurrent = prevCurrent + 1;
    const nextLifetime = prevLifetime + 1;

    // Update ref immediately and set top-level state once (never inside another state updater!)
    setLifetimeJaap(nextLifetime);

    if (nextCurrent >= currentTarget) {
      // Completed 1 full Mala / Target!
      stateRef.current = {
        ...stateRef.current,
        currentCount: 0,
        completedMalas: prevMalas + 1,
        lifetimeJaap: nextLifetime,
      };
      setCurrentCount(0);
      setCompletedMalas(prevMalas + 1);
      vedicAudio.playShankh();
      setTimeout(() => vedicAudio.playTempleBell(0.8), 400);
      setJustCompletedMala(true);
      addHistoryEntry(currentTarget, currentTarget, true);
      setTimeout(() => setJustCompletedMala(false), 4500);
    } else {
      stateRef.current = {
        ...stateRef.current,
        currentCount: nextCurrent,
        lifetimeJaap: nextLifetime,
      };
      setCurrentCount(nextCurrent);

      // Play tap sound if not already handled by auto-chant
      if (!fromAutoChant) {
        if (tapSoundMode === 'bead') {
          vedicAudio.playBeadClick();
        } else if (tapSoundMode === 'bell') {
          vedicAudio.playTempleBell(0.55);
        } else if (tapSoundMode === 'vocal') {
          vedicAudio.playBeadClick();
          vedicAudio.speakMantraOnce(activeMantraChantText);
        }
      } else {
        vedicAudio.playBeadClick();
      }
    }
  };

  // Handle Auto-Jaap Loop (chants mantra aloud + advances bead automatically)
  useEffect(() => {
    autoChantActiveRef.current = isAutoChanting;
    if (!isAutoChanting) return;

    let cancelled = false;

    const runStep = () => {
      if (cancelled || !autoChantActiveRef.current) return;
      vedicAudio.speakMantraOnce(activeMantraChantText, () => {
        if (cancelled || !autoChantActiveRef.current) return;
        incrementCounter(true);
        setTimeout(() => {
          if (!cancelled && autoChantActiveRef.current) {
            runStep();
          }
        }, 650);
      });
    };

    runStep();

    return () => {
      cancelled = true;
    };
  }, [isAutoChanting, activeMantraChantText, targetCount]);

  // 1. Reset Current Jaap Round (saves partial progress to history if > 0)
  const handleResetCurrent = () => {
    setIsAutoChanting(false);
    if (currentCount > 0) {
      addHistoryEntry(currentCount, targetCount, false);
      showToast(`वर्तमान ${currentCount} जप इतिहास में सहेज कर काउंटर 0 कर दिया गया।`);
    } else {
      showToast('वर्तमान जप काउंटर पहले से 0 है।');
    }
    setCurrentCount(0);
    setJustCompletedMala(false);
  };

  // 2. Reset Completed Malas Count
  const handleResetMalasOnly = () => {
    setCompletedMalas(0);
    showToast('पूर्ण माला संख्या रीसेट (0) कर दी गई है।');
  };

  // 3. Reset ALL Counts (Current Jaap + Completed Malas + Total Lifetime Jaap)
  const handleResetAllCounts = () => {
    setIsAutoChanting(false);
    if (currentCount > 0) {
      addHistoryEntry(currentCount, targetCount, false);
    }
    setCurrentCount(0);
    setCompletedMalas(0);
    setLifetimeJaap(0);
    setJustCompletedMala(false);
    setConfirmResetAll(false);
    localStorage.setItem('panditji_jaap_current', '0');
    localStorage.setItem('panditji_jaap_malas', '0');
    localStorage.setItem('panditji_jaap_lifetime', '0');
    showToast('सभी जप काउंट (वर्तमान जप, पूर्ण माला एवं कुल संचित जप) शून्य (0) कर दिए गए हैं।');
  };

  // Save current partial session into history without losing count, or log on demand
  const handleSaveCurrentToHistory = () => {
    if (currentCount <= 0) {
      showToast('इतिहास में जोड़ने के लिए कम से कम 1 जप करें।');
      return;
    }
    addHistoryEntry(currentCount, targetCount, currentCount >= targetCount);
    showToast(`${activeMantraTitle} के ${currentCount} जप इतिहास में दर्ज कर लिए गए!`);
  };

  const handleClearHistory = () => {
    setJaapHistory([]);
    localStorage.removeItem('panditji_jaap_history');
    showToast('पिछला जप इतिहास साफ़ कर दिया गया है।');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setJaapHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const progressPercentage = Math.min(100, Math.round((currentCount / targetCount) * 100));

  // Generate 27 visual Rudraksha beads around the circle (27 x 4 = 108)
  const totalVisualBeads = 27;
  const activeVisualBeadIndex = Math.floor((currentCount / targetCount) * totalVisualBeads);
  const lastHistoryItem = jaapHistory.length > 0 ? jaapHistory[0] : null;

  return (
    <section className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 animate-fadeIn scroll-mt-24">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/90 via-[#1b1107] to-[#0f172a] border border-amber-600/40 p-4 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
            <PanditPortrait size="lg" showBadge={true} />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-1 border border-amber-500/40">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>आचार्य पण्डित शशांक शर्मा • डिजिटल 108 रुद्राक्ष जप माला एवं साधना</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-vedic text-amber-100">
                वैदिक मंत्र जप काउंटर एवं साधना इतिहास
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-2xl">
                अपना इष्ट मंत्र चुनें, रुद्राक्ष माला पर जप करें, अपना पिछला जप इतिहास देखें और आवश्यकतानुसार किसी भी या सभी काउंट को रीसेट करें।
              </p>
            </div>
          </div>

          {/* Quick Temple Sound Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => vedicAudio.playTempleBell(0.8)}
              className="px-3.5 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-600/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>🔔 मंदिर घंटी बजाएं</span>
            </button>
            <button
              onClick={() => vedicAudio.playShankh()}
              className="px-3.5 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-600/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <span>🐚 मंगल शंख बजाएं</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Interactive 108 Rudraksha Mala Counter, Right = Rich Mantra Library & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* LEFT COLUMN (7 cols): Interactive Rudraksha Mala Counter */}
        <div className="lg:col-span-7 min-w-0 bg-[#0d1322] border border-amber-700/40 rounded-2xl p-4 sm:p-7 shadow-2xl flex flex-col justify-between space-y-5">
          
          {/* Top Stats Bar with Individual Quick Reset Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Stat 1: Current Jaap */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-900/40 flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between text-[11px] text-slate-400">
                <span>वर्तमान जप संख्या</span>
                {currentCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetCurrent}
                    className="text-[10px] text-amber-400 hover:text-rose-400 underline cursor-pointer"
                    title="वर्तमान जप रीसेट करें"
                  >
                    रीसेट
                  </button>
                )}
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono my-1">
                {currentCount} <span className="text-sm text-slate-400">/ {targetCount}</span>
              </span>
            </div>

            {/* Stat 2: Completed Malas */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-900/40 flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between text-[11px] text-slate-400">
                <span>पूर्ण माला (108)</span>
                {completedMalas > 0 && (
                  <button
                    type="button"
                    onClick={handleResetMalasOnly}
                    className="text-[10px] text-amber-400 hover:text-rose-400 underline cursor-pointer"
                    title="पूर्ण माला संख्या 0 करें"
                  >
                    रीसेट
                  </button>
                )}
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono my-1">
                {completedMalas} माला
              </span>
            </div>

            {/* Stat 3: Total Lifetime Jaap */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-900/40 flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between text-[11px] text-slate-400">
                <span>कुल संचित जप</span>
                {(lifetimeJaap > 0 || completedMalas > 0 || currentCount > 0) && (
                  <button
                    type="button"
                    onClick={() => setConfirmResetAll(true)}
                    className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                    title="सभी काउंट रीसेट करें"
                  >
                    सब रीसेट
                  </button>
                )}
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-yellow-400 font-mono my-1">
                {lifetimeJaap}
              </span>
            </div>
          </div>

          {/* Last History Quick Summary Bar */}
          {lastHistoryItem && (
            <div className="px-3.5 py-2 rounded-xl bg-amber-950/30 border border-amber-700/30 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-200">
                <History className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>
                  <b>पिछला जप रिकॉर्ड:</b> {lastHistoryItem.mantraTitle.split(' (')[0]} —{' '}
                  <b className="text-emerald-400">{lastHistoryItem.count} जप</b>{' '}
                  {lastHistoryItem.isFullMala ? '(माला पूर्ण)' : ''}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{lastHistoryItem.timestamp}</span>
            </div>
          )}

          {/* Status / Reset Feedback Toast */}
          {statusToast && (
            <div className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs font-semibold text-center animate-fadeIn">
              ✨ {statusToast}
            </div>
          )}

          {/* Selected / Custom Mantra Display & Direct Input Box RIGHT ABOVE THE COUNTER */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-950/60 via-[#17110b] to-slate-900/95 border-2 border-amber-500/60 shadow-xl space-y-3 min-w-0">
            {/* Top Row: Write Your Own Mantra Input directly above counter */}
            <div className="bg-slate-950/90 border border-amber-600/40 rounded-xl p-2.5 sm:p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                  <span>✍️ अपना मंत्र स्वयं लिखें (काउंटर के ऊपर दिखाने हेतु):</span>
                </label>
                {isCustomMode && customMantraText.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomMode(false);
                      localStorage.setItem('panditji_custom_mantra_active', 'false');
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-700/40 cursor-pointer"
                  >
                    वैदिक सूची वाला मंत्र चुनें
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="यहाँ अपना मंत्र लिखें (जैसे: ॐ नमः शिवाय, श्री राधा, ॐ कुलदेवतायै नमः)..."
                  value={customMantraText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomMantraText(val);
                    localStorage.setItem('panditji_custom_mantra_text', val);
                    if (val.trim()) {
                      setIsCustomMode(true);
                      localStorage.setItem('panditji_custom_mantra_active', 'true');
                    } else {
                      setIsCustomMode(false);
                      localStorage.setItem('panditji_custom_mantra_active', 'false');
                    }
                  }}
                  className="flex-1 bg-slate-900 border border-amber-500/50 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-amber-100 placeholder:text-slate-400 focus:outline-none focus:border-yellow-400 font-medium"
                />

                {customMantraText.trim() && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const clean = customMantraText.trim();
                        if (!clean) return;
                        setIsCustomMode(true);
                        localStorage.setItem('panditji_custom_mantra_active', 'true');
                        if (!savedCustomMantras.includes(clean)) {
                          const next = [clean, ...savedCustomMantras].slice(0, 6);
                          setSavedCustomMantras(next);
                          localStorage.setItem('panditji_saved_custom_mantras', JSON.stringify(next));
                        }
                        showToast(`आपका मंत्र "${clean}" काउंटर के ऊपर सेट कर दिया गया है!`);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold text-xs whitespace-nowrap cursor-pointer shadow-md"
                    >
                      काउंटर पर सेट करें
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomMantraText('');
                        setIsCustomMode(false);
                        localStorage.removeItem('panditji_custom_mantra_text');
                        localStorage.setItem('panditji_custom_mantra_active', 'false');
                      }}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 text-xs font-semibold cursor-pointer"
                      title="हटाएं"
                    >
                      साफ़ करें
                    </button>
                  </div>
                )}
              </div>

              {/* Saved Custom Mantras Quick Chips */}
              {savedCustomMantras.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-amber-400/90 font-semibold">आपके सहेजे मंत्र:</span>
                  {savedCustomMantras.map((mText, idx) => (
                    <div
                      key={idx}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border cursor-pointer transition-all ${
                        isCustomMode && customMantraText.trim() === mText
                          ? 'bg-amber-500 text-slate-950 font-bold border-yellow-300'
                          : 'bg-slate-900 text-amber-200 border-amber-800/50 hover:border-amber-500'
                      }`}
                    >
                      <span
                        onClick={() => {
                          setCustomMantraText(mText);
                          setIsCustomMode(true);
                          localStorage.setItem('panditji_custom_mantra_text', mText);
                          localStorage.setItem('panditji_custom_mantra_active', 'true');
                        }}
                      >
                        🕉️ {mText}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = savedCustomMantras.filter((item) => item !== mText);
                          setSavedCustomMantras(next);
                          localStorage.setItem('panditji_saved_custom_mantras', JSON.stringify(next));
                        }}
                        className="ml-1 text-[10px] opacity-75 hover:opacity-100"
                        title="हटाएं"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Mantra Prominent Display Box RIGHT ABOVE COUNTER */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-amber-400 font-semibold">
                <span className="text-left break-words">
                  🕉️ {isCustomMode && customMantraText.trim() ? 'आपका लिखा हुआ जप मंत्र' : `चयनित जप मंत्र: ${selectedMantra.hindiTitle}`}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const chantToSpeak =
                        isCustomMode && customMantraText.trim()
                          ? customMantraText.trim()
                          : `${selectedMantra.hindiTitle}। ${selectedMantra.sanskritLyrics}। भावार्थ: ${selectedMantra.meaning}`;
                      if (activeSpeechId !== 'jaap-active-mantra-speech') {
                        vedicAudio.playTempleBell(0.6);
                      }
                      vedicAudio.toggleSpeakText(chantToSpeak, 'jaap-active-mantra-speech');
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer border transition-all ${
                      activeSpeechId === 'jaap-active-mantra-speech'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/50'
                    }`}
                  >
                    {activeSpeechId === 'jaap-active-mantra-speech' ? (
                      <>
                        <VolumeX className="w-3 h-3" />
                        <span>मंत्र रोकें</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-yellow-400" />
                        <span>मंत्र उच्चारण सुनें</span>
                      </>
                    )}
                  </button>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {isCustomMode && customMantraText.trim() ? 'स्वयं का इष्ट मंत्र' : selectedMantra.deity}
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-[#261405] via-[#1c1008] to-[#261405] border border-amber-500/50 shadow-inner">
                <p className="text-lg sm:text-2xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 leading-relaxed break-words">
                  {isCustomMode && customMantraText.trim()
                    ? customMantraText.trim()
                    : selectedMantra.sanskritLyrics}
                </p>
              </div>

              {!isCustomMode && (
                <p className="text-xs text-amber-200/80">
                  <b className="text-amber-400">अर्थ:</b> {selectedMantra.meaning}
                </p>
              )}
            </div>
          </div>

          {/* Mala Completion Celebration Toast */}
          {justCompletedMala && (
            <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>अति शुभ! आपकी 1 माला ({targetCount} जप) पूर्ण हुई और जप इतिहास में दर्ज हो गई! 🐚🔔</span>
            </div>
          )}

          {/* Interactive Rudraksha Mala Ring & Central Tap Button */}
          <div className="flex flex-col items-center justify-center py-1">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* SVG Rudraksha Beads Ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
                {/* Background Progress Track */}
                <circle
                  cx="120"
                  cy="120"
                  r="102"
                  fill="none"
                  stroke="rgba(180, 83, 9, 0.2)"
                  strokeWidth="6"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="102"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 102}
                  strokeDashoffset={2 * Math.PI * 102 * (1 - currentCount / targetCount)}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />

                {/* 27 Rudraksha Beads around the perimeter */}
                {Array.from({ length: totalVisualBeads }).map((_, idx) => {
                  const angle = (idx / totalVisualBeads) * 2 * Math.PI;
                  const bx = 120 + 102 * Math.cos(angle);
                  const by = 120 + 102 * Math.sin(angle);
                  const isPassed = idx <= activeVisualBeadIndex && currentCount > 0;
                  const isSumeru = idx === 0;

                  return (
                    <circle
                      key={idx}
                      cx={bx}
                      cy={by}
                      r={isSumeru ? 8 : isPassed ? 6.5 : 5}
                      fill={isSumeru ? '#ef4444' : isPassed ? '#f59e0b' : '#451a03'}
                      stroke={isPassed ? '#fef3c7' : '#92400e'}
                      strokeWidth="1.5"
                      className="transition-all duration-150"
                    />
                  );
                })}
              </svg>

              {/* Giant Tactile Center Jaap Tap Button */}
              <button
                type="button"
                onClick={() => incrementCounter(false)}
                className={`absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-b from-amber-600 via-amber-700 to-[#3b1704] border-4 border-amber-400/80 shadow-2xl shadow-amber-600/30 flex flex-col items-center justify-center text-center p-4 cursor-pointer select-none transition-transform active:scale-95 ${
                  pulseBead ? 'scale-95 ring-4 ring-yellow-400/60' : 'hover:scale-[1.02]'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-widest text-amber-200/90">
                  रुद्राक्ष जप माला
                </span>
                <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono my-1 drop-shadow">
                  {currentCount}
                </span>
                <span className="text-xs font-semibold text-amber-200 bg-black/30 px-3 py-1 rounded-full border border-amber-400/30">
                  👆 जप करें (+1)
                </span>
                <span className="text-[10px] text-amber-300/80 mt-1">
                  ({progressPercentage}% पूर्ण)
                </span>
              </button>
            </div>
          </div>

          {/* Controls: Target Count, Tap Sound Mode, Auto-Chant & Comprehensive Reset Panel */}
          <div className="space-y-4 pt-3 border-t border-amber-900/40">
            
            {/* Row 1: Target Jaap Count Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-amber-300">जप संख्या लक्ष्य:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[11, 21, 51, 108, 1008].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      if (currentCount > 0) {
                        addHistoryEntry(currentCount, targetCount, false);
                      }
                      setTargetCount(num);
                      setCurrentCount(0);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      targetCount === num
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-900 text-slate-300 border border-amber-900/40 hover:text-amber-200'
                    }`}
                  >
                    {num === 108 ? '108 (1 माला)' : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Sound Mode on Tap */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-amber-300">स्पर्श ध्वनि विकल्प:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'bead', label: '📿 रुद्राक्ष मनका' },
                  { id: 'bell', label: '🔔 मंदिर घंटी' },
                  { id: 'vocal', label: '🗣️ मंत्र उच्चारण' },
                  { id: 'silent', label: '🤫 मौन जप' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setTapSoundMode(mode.id as TapSoundMode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      tapSoundMode === mode.id
                        ? 'bg-amber-600/30 text-amber-200 border border-amber-500'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-amber-200'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Action Buttons (Auto-Chant, Background Tanpura, Save to History) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoChanting(!isAutoChanting)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md ${
                    isAutoChanting
                      ? 'bg-emerald-600 text-slate-950'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40'
                  }`}
                >
                  {isAutoChanting ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isAutoChanting ? 'स्वतः जप चल रहा है (रोकें)' : 'स्वतः मंत्र उच्चारण व जप'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onToggleGlobalAudio(
                      selectedMantra.toneFrequency,
                      activeMantraChantText
                    )
                  }
                  className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border transition-all ${
                    isGlobalPlaying
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-amber-300 border-amber-700/40 hover:bg-slate-800'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>{isGlobalPlaying ? 'तानपुरा बंद करें' : 'तानपुरा ध्वनि चलाएं'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveCurrentToHistory}
                className="px-3 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-600/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="वर्तमान जप संख्या को इतिहास में सहेजें"
              >
                <Save className="w-3.5 h-3.5" />
                <span>इतिहास में सहेजें</span>
              </button>
            </div>

            {/* Row 4: Dedicated Reset Controls Bar (Reset Current vs Reset All Counts) */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-900/40 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>काउंटर रीसेट विकल्प:</span>
              </span>

              {!confirmResetAll ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetCurrent}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-950 text-amber-200 border border-amber-700/40 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    वर्तमान जप रीसेट (0)
                  </button>

                  <button
                    type="button"
                    onClick={handleResetMalasOnly}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-950 text-amber-200 border border-amber-700/40 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    माला रीसेट (0)
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmResetAll(true)}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-600/40 text-xs font-bold cursor-pointer transition-colors"
                  >
                    सभी काउंट रीसेट करें
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-rose-300 font-semibold">
                    क्या सभी काउंट (वर्तमान, माला व कुल जप) 0 करें?
                  </span>
                  <button
                    type="button"
                    onClick={handleResetAllCounts}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                  >
                    हाँ, सब 0 करें
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetAll(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    रद्द करें
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Recent Jaap History + 12 Siddha Vedic Mantras Collection */}
        <div className="lg:col-span-5 min-w-0 flex flex-col gap-6">
          
          {/* CARD 1: LAST JAAP HISTORY (पिछला जप इतिहास) */}
          <div className="bg-[#0d1322] border border-amber-700/50 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 min-w-0">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-2.5">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold font-vedic text-amber-100">
                    पिछला जप इतिहास
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    आपके द्वारा किए गए मंत्र जप एवं पूर्ण मालाओं का विवरण
                  </p>
                </div>
              </div>

              {jaapHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-700/40 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="संपूर्ण इतिहास साफ़ करें"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>इतिहास मिटाएं</span>
                </button>
              )}
            </div>

            {jaapHistory.length === 0 ? (
              <div className="text-center py-6 px-3 rounded-xl bg-slate-900/60 border border-amber-900/20 space-y-1">
                <Clock className="w-6 h-6 text-amber-500/40 mx-auto" />
                <p className="text-xs font-semibold text-amber-200/80">
                  अभी कोई पिछला जप इतिहास दर्ज नहीं है।
                </p>
                <p className="text-[11px] text-slate-400">
                  जब आप 1 माला पूर्ण करेंगे, काउंटर रीसेट करेंगे या "इतिहास में सहेजें" दबाएंगे, तो आपका पिछला जप यहाँ दिखाई देगा।
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {jaapHistory.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-amber-900/40 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {idx === 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            नवीनतम
                          </span>
                        )}
                        <span className="text-xs font-bold text-amber-100 truncate">
                          {item.mantraTitle.split(' (')[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{item.deity}</span>
                        <span>•</span>
                        <span className="font-mono">{item.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-lg block ${
                            item.isFullMala
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-600/30'
                          }`}
                        >
                          {item.count} जप {item.isFullMala ? '✓ माला' : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteHistoryItem(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                        title="यह रिकॉर्ड हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARD 2: 12+ SIDDHA VEDIC MANTRAS COLLECTION + CUSTOM MANTRA */}
          <div className="bg-[#0d1322] border border-amber-900/40 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/30 pb-3 mb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-vedic text-amber-100">
                    सिद्ध वैदिक एवं पौराणिक मंत्र संग्रह ({SPIRITUAL_TRACKS.length} मंत्र)
                  </h3>
                  <p className="text-xs text-slate-400">
                    जिस मंत्र का जप या श्रवण करना हो, उस पर क्लिक करें
                  </p>
                </div>
              </div>

              {/* Scrollable List of 12 Mantras */}
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {SPIRITUAL_TRACKS.map((m) => {
                  const isSelected = !isCustomMode && selectedMantra.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        if (currentCount > 0 && selectedMantra.id !== m.id) {
                          addHistoryEntry(currentCount, targetCount, false);
                        }
                        setIsCustomMode(false);
                        localStorage.setItem('panditji_custom_mantra_active', 'false');
                        setSelectedMantra(m);
                        if (isGlobalPlaying) {
                          vedicAudio.playTrack(m.toneFrequency, m.shortMantra || m.sanskritLyrics);
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/50 border-amber-500 shadow-lg'
                          : 'bg-slate-900/75 border-amber-900/30 hover:border-amber-700/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold">
                            {m.deity} • {m.category}
                          </span>
                          <h4 className="text-sm font-bold text-amber-100 mt-1">
                            {m.hindiTitle}
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCustomMode(false);
                            localStorage.setItem('panditji_custom_mantra_active', 'false');
                            setSelectedMantra(m);
                            const cardSpeechId = `jaap-card-mantra-${m.id}`;
                            if (activeSpeechId === cardSpeechId) {
                              vedicAudio.stopSingleSpeech();
                            } else {
                              vedicAudio.playTempleBell(0.6);
                              vedicAudio.toggleSpeakText(
                                `${m.hindiTitle}। ${m.sanskritLyrics}। अर्थ: ${m.meaning}`,
                                cardSpeechId
                              );
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 flex-shrink-0 transition-colors cursor-pointer ${
                            activeSpeechId === `jaap-card-mantra-${m.id}`
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950'
                          }`}
                        >
                          {activeSpeechId === `jaap-card-mantra-${m.id}` ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>रोकें</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>सुनें</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs font-serif text-amber-200/95 mt-2 bg-slate-950/70 p-2 rounded-lg border border-amber-900/30">
                        {m.sanskritLyrics}
                      </p>

                      {m.benefits && (
                        <p className="text-[11px] text-emerald-300/90 mt-1.5">
                          ✨ लाभ: {m.benefits}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Mantra Input Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-800/40 space-y-2">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>अपना इष्ट / गुरु मंत्र लिखकर काउंटर के ऊपर दिखाएं:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="जैसे: ॐ कुलदेवतायै नमः या राधे राधे..."
                  value={customMantraText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomMantraText(val);
                    localStorage.setItem('panditji_custom_mantra_text', val);
                    if (val.trim()) {
                      setIsCustomMode(true);
                      localStorage.setItem('panditji_custom_mantra_active', 'true');
                    } else {
                      setIsCustomMode(false);
                      localStorage.setItem('panditji_custom_mantra_active', 'false');
                    }
                  }}
                  className="flex-1 bg-slate-950 border border-amber-900/60 rounded-xl px-3 py-2 text-xs text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
                {isCustomMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomMode(false);
                      localStorage.setItem('panditji_custom_mantra_active', 'false');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-xs text-amber-300 font-semibold cursor-pointer"
                  >
                    सूची से चुनें
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
