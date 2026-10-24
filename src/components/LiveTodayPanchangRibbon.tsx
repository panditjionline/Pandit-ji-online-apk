import React, { useState, useEffect } from 'react';
import { getTodayPanchang } from '../data/mockData';
import {
  getISTCalendarParts,
  getMsUntilNextISTMidnight,
  CalendarDayPanchang,
} from '../utils/panchangCalendarEngine';
import { useLanguage } from '../i18n/LanguageContext';
import { Calendar, Clock, Sun, Moon, Sparkles, ChevronRight, ArrowDown } from 'lucide-react';

interface LiveTodayPanchangRibbonProps {
  mode: 'home' | 'panchang';
  onOpenPanchangPage?: () => void;
  onScrollToTodayDetails?: () => void;
  selectedDayPanchang?: CalendarDayPanchang;
}

export const LiveTodayPanchangRibbon: React.FC<LiveTodayPanchangRibbonProps> = ({
  mode,
  onOpenPanchangPage,
  onScrollToTodayDetails,
  selectedDayPanchang,
}) => {
  const { t, tr, language, localizeVedicText } = useLanguage();
  const [nowDate, setNowDate] = useState<Date>(() => new Date());
  const [todayPanchang, setTodayPanchang] = useState(() =>
    getTodayPanchang(new Date(), selectedDayPanchang)
  );
  const [istParts, setIstParts] = useState(() => getISTCalendarParts(new Date()));

  useEffect(() => {
    setTodayPanchang(getTodayPanchang(new Date(), selectedDayPanchang));
  }, [selectedDayPanchang]);

  useEffect(() => {
    let midnightTimer: number | null = null;

    const tickClock = () => {
      const current = new Date();
      setNowDate(current);
      const nextParts = getISTCalendarParts(current);
      setIstParts((prev) => {
        if (prev.dateKey !== nextParts.dateKey) {
          setTodayPanchang(getTodayPanchang(current, selectedDayPanchang));
        }
        return nextParts;
      });
    };

    const scheduleMidnight = () => {
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      const msUntilMidnight = getMsUntilNextISTMidnight(new Date());
      midnightTimer = window.setTimeout(() => {
        const current = new Date();
        setNowDate(current);
        setTodayPanchang(getTodayPanchang(current, selectedDayPanchang));
        setIstParts(getISTCalendarParts(current));
        scheduleMidnight();
      }, msUntilMidnight);
    };

    scheduleMidnight();
    const intervalId = window.setInterval(tickClock, 1000);

    const handleLocationOrProfileSync = () => {
      setTodayPanchang(getTodayPanchang(new Date(), selectedDayPanchang));
    };
    window.addEventListener('panditji_panchang_location_changed', handleLocationOrProfileSync);
    window.addEventListener('panditji_active_profile_updated', handleLocationOrProfileSync);

    return () => {
      window.clearInterval(intervalId);
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      window.removeEventListener('panditji_panchang_location_changed', handleLocationOrProfileSync);
      window.removeEventListener('panditji_active_profile_updated', handleLocationOrProfileSync);
    };
  }, [selectedDayPanchang]);

  // Format live time with seconds in 12-hour IST format
  const liveTimeWithSeconds = (() => {
    const isEnglish = language === 'en' || language === 'hinglish';
    const ampm = isEnglish
      ? istParts.hours >= 12
        ? 'PM'
        : 'AM'
      : istParts.hours === 0
      ? 'मध्यरात्रि'
      : istParts.hours === 12
      ? 'दोपहर'
      : istParts.hours >= 12
      ? 'अपराह्न'
      : 'पूर्वाह्न';
    const h12 = istParts.hours % 12 === 0 ? 12 : istParts.hours % 12;
    return `${String(h12).padStart(2, '0')}:${String(istParts.minutes).padStart(2, '0')}:${String(
      istParts.seconds
    ).padStart(2, '0')} ${ampm}`;
  })();

  // Localized date display for English/Hinglish vs Hindi/Marathi/Gujarati
  const localizedDateDisplay = (() => {
    if (language === 'en' || language === 'hinglish') {
      return nowDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      });
    }
    return todayPanchang.date;
  })();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1f1008] via-[#171226] to-[#0c1822] border-2 border-amber-500/65 p-4 sm:p-5 shadow-2xl">
      <div className="absolute -top-16 -right-16 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Top Row: Badge + Today's Date + Live Ticking IST Clock + Action CTA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-amber-800/40 pb-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-xs shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-slate-950 flex-shrink-0" />
              <span>{t('panchang_today_badge')}</span>
            </div>

            {/* Today's Full Date */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-100 text-xs sm:text-sm font-bold">
              <span>{t('panchang_date_label')}</span>
              <span className="text-yellow-300 font-extrabold">{localizedDateDisplay}</span>
            </div>

            {/* Live IST Digital Clock */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse flex-shrink-0" />
              <span>{t('panchang_time_label')}</span>
              <span className="font-mono font-extrabold text-emerald-300 tabular-nums">
                {liveTimeWithSeconds} ({tr('भारतीय समय', 'IST', 'IST', 'भारतीय वेळ', 'ભારતીય સમય')})
              </span>
            </div>

            <span className="text-xs text-amber-300/90 font-semibold hidden xl:inline">
              • {localizeVedicText(todayPanchang.hinduDate)}
            </span>
          </div>

          {/* Right Action Button depending on page */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            {mode === 'home' && onOpenPanchangPage && (
              <button
                type="button"
                onClick={onOpenPanchangPage}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-extrabold transition-all cursor-pointer shadow-md"
              >
                <span>{t('panchang_open_full_btn')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {mode === 'panchang' && onScrollToTodayDetails && (
              <button
                type="button"
                onClick={onScrollToTodayDetails}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-yellow-300 text-xs font-extrabold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>{t('panchang_scroll_details_btn')}</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Key Today's Panchang Highlights (Tithi, Nakshatra, Surya, Abhijit, Rahukaal) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          {/* 1. Tithi & Paksha */}
          <div className="p-2.5 rounded-xl bg-slate-900/85 border border-amber-800/40">
            <span className="text-[10px] font-bold text-amber-400 uppercase block">
              {t('panchang_tithi_paksha')}
            </span>
            <span className="font-extrabold text-amber-100 block mt-0.5 leading-snug">
              {localizeVedicText(todayPanchang.tithi)}
            </span>
            <span className="text-[10px] text-amber-300/80 block mt-0.5 leading-snug">
              {localizeVedicText(todayPanchang.paksha)}
            </span>
          </div>

          {/* 2. Nakshatra & Yoga */}
          <div className="p-2.5 rounded-xl bg-slate-900/85 border border-amber-800/40">
            <span className="text-[10px] font-bold text-amber-400 uppercase block">
              {t('panchang_nakshatra_yoga')}
            </span>
            <span className="font-extrabold text-amber-100 block mt-0.5 leading-snug">
              {localizeVedicText(todayPanchang.nakshatra)}
            </span>
            <span className="text-[10px] text-amber-300/80 block mt-0.5 leading-snug">
              {tr('योग:', 'Yoga:', 'Yoga:')} {localizeVedicText(todayPanchang.yoga)}
            </span>
          </div>

          {/* 3. Sunrise, Sunset & Moonrise */}
          <div className="p-2.5 rounded-xl bg-slate-900/85 border border-amber-800/40">
            <span className="text-[10px] font-bold text-amber-400 uppercase block">
              {t('panchang_sunrise_sunset')}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-amber-100 mt-0.5">
              <Sun className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              <span className="font-mono text-[11px]">
                {tr('उदय:', 'Rise:', 'Uday:')} {localizeVedicText(todayPanchang.suryaUday)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-300/90 mt-0.5">
              <Sun className="w-3 h-3 text-orange-400 flex-shrink-0" />
              <span className="font-mono">
                {tr('अस्त:', 'Set:', 'Ast:')} {localizeVedicText(todayPanchang.suryaAst)}
              </span>
            </div>
            {todayPanchang.chandraUday && (
              <div className="flex items-center gap-1.5 text-[10px] text-sky-300 mt-0.5">
                <Moon className="w-3 h-3 text-sky-300 flex-shrink-0" />
                <span className="font-mono">
                  {tr('चन्द्रोदय:', 'Moonrise:', 'Chandrodaya:')}{' '}
                  {localizeVedicText(todayPanchang.chandraUday)}
                </span>
              </div>
            )}
          </div>

          {/* 4. Abhijit Muhurat */}
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/45">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">
              {t('panchang_abhijit')}
            </span>
            <span className="font-mono font-extrabold text-emerald-200 block mt-0.5 text-[11px] sm:text-xs">
              {localizeVedicText(todayPanchang.abhijitMuhurat.replace(/\s*\(.*\)/, ''))}
            </span>
            <span className="text-[10px] text-emerald-300/80 block truncate">
              {t('panchang_abhijit_sub')}
            </span>
          </div>

          {/* 5. Rahu Kaal, Yamagandam & Gulika Kaal */}
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/45 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase block">
              {t('panchang_rahukaal')}
            </span>
            <span className="font-mono font-extrabold text-rose-200 block mt-0.5 text-[11px] leading-snug">
              {localizeVedicText(todayPanchang.rahuKaal)}
            </span>
            <span className="text-[10px] text-rose-300/90 block mt-0.5 font-mono leading-snug">
              {tr('यमगण्ड:', 'Yamaganda:', 'Yamaganda:')} {localizeVedicText(todayPanchang.yamagandam)}
            </span>
            <span className="text-[10px] text-rose-300/90 block mt-0.5 font-mono leading-snug">
              {tr('गुलिक काल:', 'Gulika:', 'Gulika:')} {localizeVedicText(todayPanchang.gulikaKaal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
