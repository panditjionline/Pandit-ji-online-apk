import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Flame,
  Bell,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Trophy,
  Share2,
  BookOpen,
  Music,
  Heart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  SACRED_DEITIES_LIST,
  getDayDeity,
  DeityVisualInfo,
  BhaktiSadhanaStorage,
  getInitialSadhanaState,
  saveSadhanaState,
  getTodayDateString,
} from '../data/digitalMandirData';
import { AARTI_CHALISA_LIST } from '../data/vedicKnowledgeData';
import { vedicAudio } from '../utils/audioSynthesizer';
import { UserMobileAccount } from '../types';
import { getActiveMobilePhone } from '../utils/userAccountStorage';
import { DharmGyanTabType } from './DharmGyanKoshSection';
import { DigitalMandirDanpatr } from './DigitalMandirDanpatr';
import { getISTCalendarParts, getMsUntilNextISTMidnight } from '../utils/panchangCalendarEngine';

interface DigitalMandirSectionProps {
  onOpenGyanKoshCategory?: (category: DharmGyanTabType) => void;
  onOpenJaapMala?: () => void;
  currentUser?: UserMobileAccount | null;
  onUpdateAccount?: (updated: UserMobileAccount) => void;
  onOpenLoginModal?: () => void;
}

interface PetalParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  vAngle: number;
  flip: number;
  vFlip: number;
  type: 'marigold' | 'rose' | 'belpatra' | 'gold_dust';
  opacity: number;
  decay: number;
}

export const DigitalMandirSection: React.FC<DigitalMandirSectionProps> = ({
  onOpenGyanKoshCategory,
  onOpenJaapMala,
  currentUser,
  onUpdateAccount,
  onOpenLoginModal,
}) => {
  const { tr } = useLanguage();

  const activePhone = currentUser?.phone || getActiveMobilePhone();
  const isLoggedIn = Boolean(activePhone);

  // 1. Deity Selection: Defaults automatically to IST day of week and rolls over at 12:00 AM IST
  const [todayDayIndex, setTodayDayIndex] = useState<number>(() =>
    getISTCalendarParts(new Date()).weekdayIndex
  );
  const todayDefaultDeity = useMemo(() => getDayDeity(todayDayIndex), [todayDayIndex]);

  const [selectedDeity, setSelectedDeity] = useState<DeityVisualInfo>(todayDefaultDeity);

  // 2. Sadhana State (Bhakti Streak & Lifetime Sadhana saved in localStorage)
  // New users/guests default to 0 stats until logged in
  const [sadhana, setSadhana] = useState<BhaktiSadhanaStorage>(() =>
    getInitialSadhanaState(activePhone)
  );

  // Re-sync sadhana state when user logs in / changes account
  useEffect(() => {
    setSadhana(getInitialSadhanaState(activePhone));
  }, [activePhone]);

  // Automatically roll over presiding deity and daily sadhana at 12:00 AM IST midnight
  useEffect(() => {
    let midnightTimer: number | null = null;
    const syncISTMidnight = () => {
      const nextParts = getISTCalendarParts(new Date());
      setTodayDayIndex((prevDay) => {
        if (prevDay !== nextParts.weekdayIndex) {
          setSelectedDeity(getDayDeity(nextParts.weekdayIndex));
          setSadhana(getInitialSadhanaState(activePhone));
          return nextParts.weekdayIndex;
        }
        return prevDay;
      });
    };

    const scheduleMidnight = () => {
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      const msUntilMidnight = getMsUntilNextISTMidnight(new Date());
      midnightTimer = window.setTimeout(() => {
        syncISTMidnight();
        scheduleMidnight();
      }, msUntilMidnight);
    };

    scheduleMidnight();
    window.addEventListener('panditji_midnight_refresh', syncISTMidnight);
    return () => {
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      window.removeEventListener('panditji_midnight_refresh', syncISTMidnight);
    };
  }, [activePhone]);

  // 3. Audio & Visual State
  const [isAmbientFluteActive, setIsAmbientFluteActive] = useState<boolean>(() =>
    vedicAudio.isMandirAmbientActive()
  );
  const [isBellRinging, setIsBellRinging] = useState<boolean>(false);
  const [isAartiSpinning, setIsAartiSpinning] = useState<boolean>(false);
  const [showAartiDrawer, setShowAartiDrawer] = useState<boolean>(false);
  const [isMantraSpeaking, setIsMantraSpeaking] = useState<boolean>(false);
  const [blessingToast, setBlessingToast] = useState<string | null>(null);

  // Sync ambient audio engine listeners
  useEffect(() => {
    const unsub = vedicAudio.subscribeMandirAmbient((playing: boolean) => {
      setIsAmbientFluteActive(playing);
    });
    return () => unsub();
  }, []);

  // Canvas Petal Shower Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<PetalParticle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Ensure canvas dimensions match container
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  // Petal shower animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const particles = petalsRef.current;
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * 60 * dt;
            p.y += p.vy * 60 * dt;
            p.angle += p.vAngle * 60 * dt;
            p.flip += p.vFlip * 60 * dt;

            // Settle or fade near bottom
            const bottomY = canvas.height / dpr - 25;
            if (p.y >= bottomY) {
              p.vy *= 0.15;
              p.vx *= 0.5;
              p.opacity -= 0.015 * (60 * dt);
            }

            if (p.opacity <= 0.01 || p.y > canvas.height / dpr + 40) {
              particles.splice(i, 1);
              continue;
            }

            // Draw petal
            ctx.save();
            ctx.translate(p.x * dpr, p.y * dpr);
            ctx.rotate(p.angle);
            ctx.scale(Math.cos(p.flip), 1);
            ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));

            if (p.type === 'marigold') {
              // Golden orange marigold petal
              const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, p.size * dpr);
              grad.addColorStop(0, '#fef08a');
              grad.addColorStop(0.4, '#f59e0b');
              grad.addColorStop(1, '#ea580c');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.ellipse(0, 0, p.size * dpr * 0.75, p.size * dpr * 1.3, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.type === 'rose') {
              // Deep crimson velvet rose petal
              const grad = ctx.createRadialGradient(0, -p.size * 0.2 * dpr, 1, 0, 0, p.size * dpr);
              grad.addColorStop(0, '#fda4af');
              grad.addColorStop(0.45, '#e11d48');
              grad.addColorStop(1, '#881337');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(0, 0, p.size * dpr, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.type === 'belpatra') {
              // Tender green auspicious leaf
              ctx.fillStyle = '#16a34a';
              ctx.beginPath();
              ctx.ellipse(0, 0, p.size * dpr * 0.5, p.size * dpr * 1.4, 0, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Sparkle gold dust
              ctx.fillStyle = '#fbbf24';
              ctx.beginPath();
              ctx.arc(0, 0, p.size * dpr * 0.5, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.restore();
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  // Trigger pushpanjali petal spawn
  const triggerPushpanjali = useCallback(() => {
    // Play celestial chime sound
    vedicAudio.playPushpanjaliSound(0.7);

    const canvas = canvasRef.current;
    const width = canvas ? canvas.width / (window.devicePixelRatio || 1) : 400;

    // Spawn 35-45 rich particles
    const newPetals: PetalParticle[] = [];
    const count = 38;
    for (let i = 0; i < count; i++) {
      const typeChoice = Math.random();
      const type: PetalParticle['type'] =
        typeChoice < 0.52 ? 'marigold' : typeChoice < 0.85 ? 'rose' : 'belpatra';

      newPetals.push({
        x: width * 0.15 + Math.random() * (width * 0.7),
        y: -10 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 1.8,
        vy: 1.8 + Math.random() * 2.5,
        size: 7 + Math.random() * 9,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.08,
        flip: Math.random() * Math.PI,
        vFlip: 0.05 + Math.random() * 0.08,
        type,
        opacity: 0.95,
        decay: 0.002,
      });
    }

    petalsRef.current.push(...newPetals);

    // Update Sadhana state & streak
    markSadhanaAction('flowersCount');

    // Show spiritual blessing toast
    showToast(tr('🌸 पुष्पांजलि अर्पित! प्रभु आपकी मनोकामना पूर्ण करें।', '🌸 Pushpanjali offered! May the Divine bless you.'));
  }, [tr]);

  // Helper to mark a ritual action and update streak & lifetime sadhana in localStorage
  const markSadhanaAction = useCallback((actionKey: keyof BhaktiSadhanaStorage['todayRituals']) => {
    setSadhana((prev) => {
      const today = getTodayDateString();
      const isNewDay = prev.lastActiveDate !== today;

      let nextStreak = prev.streakDays;
      if (isNewDay) {
        const last = new Date(prev.lastActiveDate);
        const curr = new Date(today);
        const diffDays = Math.ceil(Math.abs(curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          nextStreak = prev.streakDays + 1;
        } else if (diffDays > 1) {
          nextStreak = 1;
        }
      } else if (!prev.todayCompleted) {
        // First completion today
        nextStreak = prev.streakDays > 0 ? prev.streakDays : 1;
      }

      const nextTodayRituals = { ...prev.todayRituals };
      if (typeof nextTodayRituals[actionKey] === 'number') {
        (nextTodayRituals[actionKey] as number) += 1;
      } else {
        (nextTodayRituals[actionKey] as boolean) = true;
      }

      const completed =
        nextTodayRituals.diyaLit || nextTodayRituals.bellRungCount > 0 || nextTodayRituals.aartiPerformed;

      const nextState: BhaktiSadhanaStorage = {
        streakDays: nextStreak,
        totalLifetimeSadhana: prev.totalLifetimeSadhana + 1,
        lastActiveDate: today,
        todayRituals: nextTodayRituals,
        todayCompleted: completed,
        unlockedBadges: Array.from(new Set([...prev.unlockedBadges, 'आरम्भ साधक'])),
      };

      if (nextStreak >= 7 && !nextState.unlockedBadges.includes('सप्ताह व्रत सिद्ध')) {
        nextState.unlockedBadges.push('सप्ताह व्रत सिद्ध');
      }
      if (nextStreak >= 21 && !nextState.unlockedBadges.includes('संकल्प सिद्ध')) {
        nextState.unlockedBadges.push('संकल्प सिद्ध');
      }

      saveSadhanaState(nextState);

      // Increment Punya Points
      if (currentUser && onUpdateAccount && !prev.todayCompleted && completed) {
        onUpdateAccount({
          ...currentUser,
          punyaPoints: (currentUser.punyaPoints || 0) + 1,
        });
      }

      return nextState;
    });
  }, [currentUser, onUpdateAccount]);

  // Action: Toggle Akhand Diya (लाइट वर्चुअल ऑयल लैम्प)
  const handleToggleDiya = useCallback(() => {
    const nextDiya = !sadhana.todayRituals.diyaLit;

    if (nextDiya) {
      vedicAudio.playDiyaLightSound(0.7);
      showToast(tr('🪔 अखण्ड ज्योति प्रज्वलित हुई! आपका अंतर्मन प्रकाशित हो।', '🪔 Akhand Diya lit! May your inner light shine.'));
      markSadhanaAction('diyaLit');
    } else {
      vedicAudio.playClickSpark(0.3);
      setSadhana((prev) => {
        const updated = {
          ...prev,
          todayRituals: { ...prev.todayRituals, diyaLit: false },
        };
        saveSadhanaState(updated);
        return updated;
      });
    }
  }, [sadhana.todayRituals.diyaLit, markSadhanaAction, tr]);

  // Action: Ring Mandir Ghanti (मंदिर की घंटी)
  const handleRingBell = useCallback(() => {
    setIsBellRinging(true);
    // Play crisp high-quality brass temple bell chime
    vedicAudio.playCrispTempleBell(0.9);

    markSadhanaAction('bellRungCount');
    showToast(tr('🔔 पावन मंदिर घंटी नाद! सकारात्मक ऊर्जा का संचार हुआ।', '🔔 Holy Temple Bell resonated! Positive energy awakened.'));

    window.setTimeout(() => {
      setIsBellRinging(false);
    }, 1100);
  }, [markSadhanaAction, tr]);

  // Action: Perform Circular Aarti (आरती परिक्रमा)
  const handlePerformAarti = useCallback(() => {
    if (isAartiSpinning) return;
    setIsAartiSpinning(true);
    vedicAudio.playManjiraChime(0.65);
    markSadhanaAction('aartiPerformed');
    showToast(tr('✨ भावपूर्ण दिव्य आरती संपन्न! प्रभु की कृपा आप पर सदा रहे।', '✨ Divine Aarti performed! May the Lord protect you.'));

    window.setTimeout(() => {
      setIsAartiSpinning(false);
    }, 4500);
  }, [isAartiSpinning, markSadhanaAction, tr]);

  // Action: Sacred Shankhnaad
  const handleBlowShankh = useCallback(() => {
    vedicAudio.playShankh();
    showToast(tr('🐚 ॐ शंखनाद! समस्त अमंगल व वास्तु दोष दूर हों।', '🐚 Sacred Shankhnaad! Auspicious vibrations invoked.'));
  }, [tr]);

  // Action: Listen to Deity Mantra / Shloka Aloud
  const handleToggleMantraVoice = useCallback(() => {
    const speechId = `mandir-deity-${selectedDeity.id}`;
    if (isMantraSpeaking) {
      vedicAudio.stopSingleSpeech();
      setIsMantraSpeaking(false);
    } else {
      setIsMantraSpeaking(true);
      vedicAudio.speakMantraOnce(
        `${selectedDeity.hindiName} का दिव्य ध्यान मंत्र। ${selectedDeity.mantra}। अर्थ: ${selectedDeity.mantraMeaning}। श्लोक: ${selectedDeity.shloka}`,
        () => setIsMantraSpeaking(false),
        speechId
      );
    }
  }, [isMantraSpeaking, selectedDeity]);

  // Action: Background Flute & Om Chants Toggle
  const handleToggleAmbientAudio = useCallback(() => {
    const nextState = vedicAudio.toggleMandirAmbientFlute();
    setIsAmbientFluteActive(nextState);
    if (nextState) {
      showToast(tr('🎶 शांत मंदिर बांसुरी व ॐ नाद आरम्भ हुआ', '🎶 Soothing Temple Flute & Om Chant started'));
    } else {
      showToast(tr('🔇 पृष्ठभूमि संगीत बंद किया गया', '🔇 Ambient audio muted'));
    }
  }, [tr]);

  // Helper toast notification
  const showToast = (msg: string) => {
    setBlessingToast(msg);
    window.setTimeout(() => {
      setBlessingToast((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Find matching Aarti / Chalisa for the selected deity
  const activeAartiItem = useMemo(() => {
    return (
      AARTI_CHALISA_LIST.find((a) => a.id === selectedDeity.aartiId) ||
      AARTI_CHALISA_LIST[0]
    );
  }, [selectedDeity]);

  const isTodaySpecialDeity = selectedDeity.dayIndex === todayDayIndex;
  const isDiyaLit = sadhana.todayRituals.diyaLit;

  return (
    <div className="relative w-full bg-[#0d0a07] text-amber-100 min-h-screen py-4 sm:py-8 px-3 sm:px-6">
      {/* Toast Notification for Divine Blessings */}
      {blessingToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-900/95 via-yellow-900/95 to-amber-950/95 border border-amber-400 text-yellow-200 text-xs sm:text-sm font-bold shadow-[0_10px_35px_rgba(212,175,55,0.4)] animate-bounce backdrop-blur-md flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <span>{blessingToast}</span>
        </div>
      )}

      {/* Decorative Warm Ambient Glows behind Temple */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[92vw] max-w-4xl h-[500px] bg-gradient-to-b from-amber-600/20 via-orange-600/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* ========================================================= */}
        {/* 1. AUTHENTIC VEDIC MANDIR SHIKHAR & GOPURAM ARCHITECTURE (TOP) */}
        {/* ========================================================= */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#24150b] via-[#1a1007] to-[#120a05] border-2 border-[#d4af37]/70 p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden text-center">
          {/* Temple Gopuram / Shikhar Silhouette Top Crown */}
          <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-amber-500/15 to-transparent pointer-events-none" />
          
          {/* Kalash & Sacred Dhwaja Flag */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-amber-400 text-sm">🚩</span>
            <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-950 via-[#36210e] to-amber-950 border border-[#d4af37] text-yellow-300 text-xs sm:text-sm font-extrabold tracking-widest font-vedic shadow-lg flex items-center gap-2">
              <span>卐</span>
              <span>{tr('श्री डिजिटल मन्दिर प्रांगण', 'Shri Digital Mandir Sanctum')}</span>
              <span>卐</span>
            </div>
            <span className="text-amber-400 text-sm">🚩</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-vedic text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 drop-shadow-md">
            {selectedDeity.hindiName}
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 mt-1 max-w-lg mx-auto font-medium">
            {selectedDeity.subTitle} — {tr('नित्य दर्शन, आरती, घंटी नाद व दिव्य साधना', 'Daily Darshan & Sacred Rituals')}
          </p>

          {/* Ambient Flute Audio & Today Deity Switcher Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 pt-3 border-t border-amber-800/40">
            <button
              type="button"
              onClick={handleToggleAmbientAudio}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md ${
                isAmbientFluteActive
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-yellow-300'
                  : 'bg-slate-900/90 text-amber-200 border-amber-800/70 hover:border-amber-500'
              }`}
            >
              {isAmbientFluteActive ? (
                <>
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>{tr('बांसुरी व ॐ नाद चालू', 'Flute & Om: ON')}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span>{tr('मंदिर बांसुरी संगीत सुनें', 'Play Temple Flute')}</span>
                </>
              )}
            </button>

            {!isTodaySpecialDeity && (
              <button
                type="button"
                onClick={() => setSelectedDeity(todayDefaultDeity)}
                className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>{tr(`आज के देव (${todayDefaultDeity.hindiDayName})`, `Today's Deity`)}</span>
              </button>
            )}
          </div>

          {/* ========================================================= */}
          {/* SUSPENDED BRASS TEMPLE BELL (घंटी) */}
          {/* ========================================================= */}
          <div className="my-5 relative z-20 flex flex-col items-center">
            <div className="w-1 h-7 bg-gradient-to-b from-[#d4af37] via-[#855f1a] to-[#d4af37] rounded-full shadow-xs" />
            <button
              type="button"
              onClick={handleRingBell}
              className={`group relative p-3 rounded-2xl bg-gradient-to-b from-[#fcd34d] via-[#d4af37] to-[#855f1a] text-slate-950 shadow-[0_8px_30px_rgba(212,175,55,0.5)] border-2 border-yellow-200 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                isBellRinging ? 'animate-bell-swing' : ''
              }`}
              title={tr('मंदिर की घंटी बजाएं', 'Ring Temple Bell')}
            >
              <Bell className="w-7 h-7 fill-slate-950 text-slate-950" />
              {isBellRinging && (
                <span className="absolute -inset-2 rounded-2xl border-2 border-yellow-300 animate-ping pointer-events-none" />
              )}
            </button>
            <span className="text-xs text-amber-300 font-bold mt-1.5 flex items-center gap-1">
              <span>{tr('🔔 घंटी बजाएं (Ring Bell)', '🔔 Ring Temple Bell')}</span>
              {sadhana.todayRituals.bellRungCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 border border-amber-400 text-yellow-300 text-[10px]">
                  {sadhana.todayRituals.bellRungCount}
                </span>
              )}
            </span>
          </div>

          {/* ========================================================= */}
          {/* SANCTUM GARBHAGRIHA: DEITY DARSHAN & CANVAS PETAL SHOWER */}
          {/* ========================================================= */}
          <div className="relative my-4 rounded-3xl bg-gradient-to-b from-[#1a110a] via-[#0d0905] to-[#1a110a] border-2 border-[#d4af37]/60 p-4 sm:p-6 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
            {/* Ambient Lighting cast from Diya */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
                isDiyaLit ? 'opacity-100' : 'opacity-40'
              }`}
              style={{
                background: `radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.4) 0%, rgba(212, 175, 55, 0.15) 50%, transparent 80%)`,
              }}
            />

            {/* Glowing Deity Aura */}
            <div
              className="absolute w-60 h-60 sm:w-80 sm:h-80 rounded-full blur-3xl pointer-events-none transition-all duration-1000 animate-pulse"
              style={{ backgroundColor: selectedDeity.auraColor }}
            />

            {/* Petal Shower Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-30"
            />

            {/* Aarti Spinning Halo */}
            {isAartiSpinning && (
              <div className="absolute inset-4 sm:inset-10 border-4 border-dashed border-amber-400 rounded-full animate-spin pointer-events-none z-20 shadow-[0_0_50px_rgba(245,158,11,0.6)]" />
            )}

            {/* Sacred Deity Darshan Frame */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative p-2 rounded-t-[110px] rounded-b-2xl bg-gradient-to-tr from-[#d4af37] via-yellow-200 to-amber-600 shadow-[0_0_50px_rgba(212,175,55,0.5)]">
                <div className="w-52 h-72 sm:w-72 sm:h-96 rounded-t-[102px] rounded-b-xl overflow-hidden border-2 border-black/90 relative bg-black flex items-center justify-center group">
                  <img
                    src={`${selectedDeity.primaryImage}?v=9`}
                    alt={selectedDeity.hindiName}
                    className="w-full h-full object-cover object-top filter contrast-[1.05] brightness-[1.03] transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/deities/hanuman.jpg';
                    }}
                  />

                  {/* Bottom Image Overlay Bar */}
                  <div className="absolute bottom-0 inset-x-0 py-2 px-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent text-xs font-vedic text-yellow-300 font-bold flex items-center justify-between">
                    <span>{selectedDeity.deityIcon} {selectedDeity.favColor}</span>
                    <span>॥ ॐ {selectedDeity.sacredSymbol} ॥</span>
                  </div>
                </div>

                {/* Left/Right Emblems */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#1c1208] border-2 border-[#d4af37] flex items-center justify-center text-sm text-[#d4af37] shadow-lg font-vedic font-bold">
                  🕉️
                </div>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#1c1208] border-2 border-[#d4af37] flex items-center justify-center text-sm text-[#d4af37] shadow-lg font-vedic font-bold">
                  卐
                </div>
              </div>
            </div>

            {/* ===================================================== */}
            {/* ALTAR: AKHAND DIYA & DHOOP */}
            {/* ===================================================== */}
            <div className="relative z-10 w-full max-w-md mt-6 pt-3 border-t border-[#d4af37]/40 flex items-center justify-around gap-2 bg-black/50 rounded-b-2xl p-3">
              <div className="flex flex-col items-center">
                <div className="w-1 h-5 bg-gradient-to-t from-gray-400 to-transparent rounded-full animate-pulse" />
                <div className="w-6 h-3 rounded-t-sm bg-gradient-to-r from-amber-700 to-yellow-600" />
                <span className="text-[10px] text-amber-300 mt-1">{tr('सुगंधित धूप', 'Dhoop')}</span>
              </div>

              {/* Akhand Diya */}
              <div className="flex flex-col items-center -mt-3">
                <button
                  type="button"
                  onClick={handleToggleDiya}
                  className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  {isDiyaLit ? (
                    <div className="relative flex flex-col items-center mb-1">
                      <div className="absolute -top-4 w-9 h-11 bg-amber-500/50 rounded-full blur-md animate-pulse" />
                      <div className="relative w-4.5 h-8 rounded-[50%_50%_20%_20%] bg-gradient-to-t from-amber-600 via-yellow-400 to-yellow-100 shadow-[0_0_25px_#f59e0b] animate-flame-flicker origin-bottom" />
                    </div>
                  ) : (
                    <div className="w-0.5 h-3 bg-neutral-600 mb-1" />
                  )}
                  <div className="w-14 h-6 rounded-[0_0_50%_50%] bg-gradient-to-b from-[#fcd34d] via-[#d4af37] to-[#784d14] border-t-2 border-yellow-200 shadow-xl flex items-center justify-center">
                    <div className="w-11 h-2 rounded-full bg-[#52330a]" />
                  </div>
                </button>
                <span className="text-[10px] font-extrabold text-yellow-300 mt-1">
                  {isDiyaLit ? tr('✨ अखण्ड ज्योति प्रज्वलित', '✨ Diya Lit') : tr('दीपक जलाएं', 'Light Diya')}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-9 h-3 rounded-[50%] bg-gradient-to-r from-[#d4af37] to-yellow-300 flex items-center justify-center gap-1 shadow">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                </div>
                <span className="text-[10px] text-amber-300 mt-1">{tr('कुमकुम-चन्दन', 'Kumkum Thali')}</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* INTERACTIVE RITUALS BUTTONS */}
          {/* ========================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <button
              type="button"
              onClick={triggerPushpanjali}
              className="p-3 rounded-2xl bg-gradient-to-b from-rose-950/80 to-[#120509] border border-rose-500/50 text-rose-200 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-[1.02] flex flex-col items-center justify-center gap-1"
            >
              <span className="text-base">🌸</span>
              <span>{tr('पुष्पांजलि अर्पित करें', 'Offer Flowers')}</span>
              <span className="text-[10px] text-rose-300/80">{tr('गेंदा व गुलाब वर्षा', 'Flower Shower')}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleDiya}
              className={`p-3 rounded-2xl border font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-[1.02] flex flex-col items-center justify-center gap-1 ${
                isDiyaLit
                  ? 'bg-gradient-to-b from-amber-950 to-yellow-950 border-amber-400 text-yellow-300'
                  : 'bg-gradient-to-b from-amber-950/50 to-[#100b05] border-amber-800/60 text-amber-200'
              }`}
            >
              <Flame className={`w-4 h-4 ${isDiyaLit ? 'animate-pulse text-yellow-400' : ''}`} />
              <span>{isDiyaLit ? tr('दीपक प्रज्वलित है', 'Diya is Lit') : tr('दीपक जलाएं', 'Light Diya')}</span>
              <span className="text-[10px] text-amber-300/80">{tr('अखण्ड ज्योति', 'Oil Lamp')}</span>
            </button>

            <button
              type="button"
              onClick={handleRingBell}
              className="p-3 rounded-2xl bg-gradient-to-b from-yellow-950/60 to-[#120d06] border border-[#d4af37]/60 text-amber-100 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-[1.02] flex flex-col items-center justify-center gap-1"
            >
              <Bell className="w-4 h-4 text-yellow-300" />
              <span>{tr('घंटी बजाएं', 'Ring Bell')}</span>
              <span className="text-[10px] text-amber-300/80">{tr('पीतल नाद', 'Temple Chime')}</span>
            </button>

            <button
              type="button"
              onClick={handlePerformAarti}
              disabled={isAartiSpinning}
              className="p-3 rounded-2xl bg-gradient-to-b from-amber-950/60 to-[#100a06] border border-amber-600/60 text-amber-200 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-[1.02] flex flex-col items-center justify-center gap-1"
            >
              <Sparkles className={`w-4 h-4 text-yellow-400 ${isAartiSpinning ? 'animate-spin' : ''}`} />
              <span>{isAartiSpinning ? tr('आरती हो रही है...', 'Aarti...') : tr('आरती परिक्रमा', 'Perform Aarti')}</span>
              <span className="text-[10px] text-amber-300/80">{tr('दिव्य आरती', 'Circular Flame')}</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. ALL INFORMATION BELOW THE MANDIR (ZERO TRUNCATION) */}
        {/* ========================================================= */}
        <div className="space-y-6">

          {/* 0. SHRI DIGITAL DANPATR (UPI DANPATR) — RIGHT ABOVE BHAKTI SANKALP CARD */}
          <DigitalMandirDanpatr
            onOfferSuccess={(amt) => {
              showToast(
                tr(
                  `🙏 ₹${amt} गुप्त दान संकल्प हेतु UPI ऐप खुल रहा है! श्री बांके बिहारी जी आपकी मनोकामना पूर्ण करें।`,
                  `🙏 Opening UPI app for ₹${amt} Sacred Danpatr offering! May the Divine bless you.`
                )
              );
            }}
          />

          {/* A. Bhakti Streak & Lifetime Sadhana Banner (Fully legible & clear, zero truncation) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Bhakti Streak */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#1c1208] via-[#150d06] to-[#0f0904] border border-amber-600/50 flex items-center gap-3 shadow-lg">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-md">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-current animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                  {tr('भक्ति संकल्प स्ट्रीक', 'Bhakti Streak')}
                </div>
                <div className="text-base sm:text-lg font-extrabold text-yellow-300 font-mono leading-tight mt-0.5">
                  {sadhana.streakDays} <span className="text-xs font-semibold text-amber-200">{tr('दिन लगातार', 'Days')}</span>
                </div>
                {!isLoggedIn && (
                  <button
                    type="button"
                    onClick={onOpenLoginModal}
                    className="text-[10px] text-amber-400 hover:text-yellow-300 underline font-semibold mt-0.5 block cursor-pointer"
                  >
                    {tr('नया यूज़र (0) — लॉगिन करें', 'New User (0) — Login')}
                  </button>
                )}
              </div>
            </div>

            {/* Card 2: Lifetime Sadhana */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#1a130c] via-[#120d08] to-[#0c0805] border border-amber-600/50 flex items-center gap-3 shadow-lg">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-600 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-md">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                  {tr('कुल जीवन साधना', 'Lifetime Sadhana')}
                </div>
                <div className="text-base sm:text-lg font-extrabold text-amber-100 font-mono leading-tight mt-0.5">
                  {sadhana.totalLifetimeSadhana} <span className="text-xs font-semibold text-amber-300/80">{tr('बार', 'Times')}</span>
                </div>
                {!isLoggedIn ? (
                  <button
                    type="button"
                    onClick={onOpenLoginModal}
                    className="text-[10px] text-amber-400 hover:text-yellow-300 underline font-semibold mt-0.5 block cursor-pointer"
                  >
                    {tr('नया यूज़र (0) — लॉगिन करें', 'New User (0) — Login')}
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                    {tr('सहेजा गया डेटा', 'Saved Account')}
                  </span>
                )}
              </div>
            </div>

            {/* Card 3: Today's Day & Presiding Deity (High contrast & 100% crystal clear) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#241228] via-[#190b1c] to-[#100613] border border-purple-500/60 flex items-center gap-3 shadow-lg">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-purple-300 font-bold tracking-wide">
                  {tr(`आज का वार: ${todayDefaultDeity.hindiDayName}`, `Today: ${todayDefaultDeity.dayName}`)}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-yellow-300 leading-snug mt-0.5">
                  {todayDefaultDeity.hindiName}
                </div>
                <div className="text-[10px] text-purple-200/90 font-semibold mt-0.5">
                  {tr('आज के मुख्य पूज्य देव', 'Presiding Deity Today')}
                </div>
              </div>
            </div>

            {/* Card 4: Daily Sankalp Ritual Status (High contrast & 100% crystal clear) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#0c2419] via-[#071911] to-[#04100b] border border-emerald-500/60 flex items-center gap-3 shadow-lg">
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${sadhana.todayCompleted ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-emerald-950 border border-emerald-500/60 text-emerald-400'}`}>
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-emerald-300 font-bold tracking-wide">
                  {tr('दैनिक संकल्प', "Daily Sankalp")}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white leading-snug mt-0.5">
                  {sadhana.todayCompleted ? tr('✨ आज की साधना संपन्न', 'Completed') : tr('दीपक / घंटी बजाएं', 'Light Diya / Ring Bell')}
                </div>
                <div className="text-[10px] text-emerald-200/90 font-semibold mt-0.5">
                  {sadhana.todayCompleted ? tr('पुण्य लाभ प्राप्त हुआ', 'Sadhana Complete') : tr('मन्दिर में पूजा आरम्भ करें', 'Perform Ritual')}
                </div>
              </div>
            </div>
          </div>

          {/* B. Sacred Mantra & Shloka Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#1a130b] via-[#120d08] to-[#0c0906] border border-[#d4af37]/45 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/40 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🪷</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-vedic text-yellow-300">
                    {tr(`${selectedDeity.hindiName} का दिव्य ध्यान मन्त्र व श्लोक`, `Divine Mantra & Shloka`)}
                  </h3>
                  <p className="text-xs text-amber-300/80">{selectedDeity.shlokaRef}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBlowShankh}
                  className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-200 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>🐚</span>
                  <span>{tr('शंखनाद', 'Shankh')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleMantraVoice}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isMantraSpeaking
                      ? 'bg-amber-500 text-slate-950 border-yellow-300'
                      : 'bg-amber-900/60 text-yellow-300 border-amber-500/60 hover:bg-amber-900'
                  }`}
                >
                  <Volume2 className={`w-4 h-4 ${isMantraSpeaking ? 'animate-pulse' : ''}`} />
                  <span>{isMantraSpeaking ? tr('रोकें', 'Stop') : tr('मंत्र सुनें', 'Listen')}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-amber-800/40 space-y-2">
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                {tr('वैदिक बीज मन्त्र', 'Vedic Bija Mantra')}
              </div>
              <p className="text-base sm:text-lg font-bold font-vedic text-amber-100 leading-relaxed">
                {selectedDeity.mantra}
              </p>
              <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed italic pt-2 border-t border-amber-900/30">
                <strong className="text-amber-300 not-italic font-semibold">{tr('भावार्थ: ', 'Meaning: ')}</strong>
                {selectedDeity.mantraMeaning}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#140e09]/80 border border-amber-900/50 space-y-2">
              <div className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">
                {tr('पावन स्तुति श्लोक', 'Sacred Stuti Shloka')}
              </div>
              <p className="text-xs sm:text-sm font-semibold font-vedic text-amber-200 leading-relaxed">
                {selectedDeity.shloka}
              </p>
              <div className="pt-2 border-t border-amber-900/30 flex flex-wrap items-center justify-between text-xs text-amber-300/90 gap-2">
                <span><strong>{tr('पुण्य फल: ', 'Merit: ')}</strong>{selectedDeity.significance}</span>
                <span><strong>{tr('प्रिय भोग: ', 'Prasad: ')}</strong>{selectedDeity.favPrasad}</span>
              </div>
            </div>

            {onOpenJaapMala && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/50">
                <span className="text-xs sm:text-sm text-amber-200">
                  {tr('इस मन्त्र की १०८ मनका रुद्राक्ष माला जप करें:', 'Chant 108 Rudraksha Jaap Mala:')}
                </span>
                <button
                  type="button"
                  onClick={onOpenJaapMala}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors whitespace-nowrap shadow"
                >
                  {tr('१०८ जप माला खोलें', 'Open 108 Jaap Mala')}
                </button>
              </div>
            )}
          </div>

          {/* C. Deity Selector Grid */}
          <div className="rounded-3xl bg-gradient-to-br from-[#18110b] to-[#0f0c08] border border-[#d4af37]/35 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-vedic text-amber-100">
                  {tr('अन्य देवी-देवताओं के दर्शन व पूजा', 'Darshan of Other Sacred Deities')}
                </h3>
                <p className="text-xs text-amber-300/80">
                  {tr('अपने इष्ट देव का चयन करें और डिजिटल मंदिर में दर्शन व साधना संपन्न करें', 'Select your Ishta Devta to perform daily darshan')}
                </p>
              </div>
              <span className="text-xs text-yellow-300 bg-yellow-950/80 px-3 py-1 rounded-full border border-yellow-500/40 self-start sm:self-auto font-semibold">
                {tr(`आज का वार: ${todayDefaultDeity.hindiDayName}`, `Today: ${todayDefaultDeity.dayName}`)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {SACRED_DEITIES_LIST.map((deity) => {
                const isSelected = selectedDeity.id === deity.id;
                const isToday = deity.dayIndex === todayDayIndex;
                return (
                  <button
                    key={deity.id}
                    type="button"
                    onClick={() => {
                      setSelectedDeity(deity);
                      vedicAudio.playClickSpark(0.25);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 shadow-sm group ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-950/90 via-[#27180c] to-amber-950/90 border-[#d4af37] ring-1 ring-[#d4af37]'
                        : 'bg-black/50 hover:bg-[#1a1209] border-amber-900/40 hover:border-amber-600/60'
                    }`}
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-[#d4af37]/70 flex-shrink-0 bg-black shadow">
                      <img
                        src={`${deity.primaryImage}?v=9`}
                        alt={deity.hindiName}
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/deities/hanuman.jpg';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-yellow-300 truncate font-vedic">
                        {deity.hindiName.replace('भगवान ', '').replace('देवाधिदेव ', '')}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-300/80 mt-0.5">
                        <span>{deity.hindiDayName}</span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-yellow-300 font-bold text-[9px] border border-amber-400">
                            {tr('आज', 'Today')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* D. Aarti & Chalisa Accordion */}
          <div className="rounded-3xl bg-gradient-to-br from-[#19110a] to-[#0e0a06] border border-amber-700/50 p-5 sm:p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setShowAartiDrawer((prev) => !prev)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-yellow-400 border border-amber-400/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold font-vedic text-yellow-300">
                    {tr(`${activeAartiItem.title} (सम्पूर्ण पाठ व अर्थ)`, `${activeAartiItem.title} (Complete Text)`)}
                  </h4>
                  <p className="text-xs text-amber-300/80">{activeAartiItem.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-bold hidden sm:inline">
                  {showAartiDrawer ? tr('संक्षिप्त करें', 'Collapse') : tr('सम्पूर्ण पाठ पढ़ें', 'Read Aarti')}
                </span>
                {showAartiDrawer ? (
                  <ChevronUp className="w-5 h-5 text-amber-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-amber-400" />
                )}
              </div>
            </button>

            {showAartiDrawer && (
              <div className="mt-5 pt-4 border-t border-amber-900/50 space-y-4 animate-fadeIn">
                <div className="p-4 sm:p-5 rounded-2xl bg-black/70 border border-amber-800/50 max-h-[450px] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-amber-600/40">
                  {activeAartiItem.lyrics.map((line, idx) => (
                    <p
                      key={idx}
                      className="text-xs sm:text-sm text-amber-100 font-vedic leading-relaxed"
                    >
                      {line}
                    </p>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-amber-300/90 gap-3 p-3.5 rounded-xl bg-amber-950/60 border border-amber-900/40">
                  <span><strong>{tr('महत्व: ', 'Significance: ')}</strong>{activeAartiItem.significance}</span>
                  {onOpenGyanKoshCategory && (
                    <button
                      type="button"
                      onClick={() => onOpenGyanKoshCategory('aarti-chalisa')}
                      className="text-amber-400 hover:text-yellow-300 font-bold cursor-pointer underline flex items-center gap-1"
                    >
                      <span>{tr('अन्य सभी आरती व चालीसा देखें', 'View All Aartis & Chalisas')}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

