import React, { useState, useEffect, useMemo } from 'react';
import { PUJA_SERVICES, getTodayFestivalInfo, getTodayPanchang } from '../data/mockData';
import {
  buildSingleDayPanchang,
  getISTCalendarParts,
  getMsUntilNextISTMidnight,
  HINDI_MONTH_SHORT,
  CalendarDayPanchang,
} from '../utils/panchangCalendarEngine';
import { FestivalInfo, PanchangData, PujaService } from '../types';
import { vedicAudio } from '../utils/audioSynthesizer';
import { PanditPortrait } from './PanditPortrait';
import {
  Sparkles,
  Flame,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  BookOpen,
  MessageCircle,
  Gift,
  Sun,
  Star,
} from 'lucide-react';

interface TodayFestivalWidgetProps {
  onOpenBookingWithService?: (service: PujaService) => void;
  onOpenMantraJaap: () => void;
  onAskPanditInChat: (festivalTopic: string) => void;
  selectedDayPanchang?: CalendarDayPanchang;
}

export const TodayFestivalWidget: React.FC<TodayFestivalWidgetProps> = ({
  onOpenBookingWithService,
  onOpenMantraJaap,
  onAskPanditInChat,
  selectedDayPanchang,
}) => {
  const [todayFestival, setTodayFestival] = useState<FestivalInfo>(() =>
    getTodayFestivalInfo(new Date(), selectedDayPanchang)
  );
  const [todayPanchang, setTodayPanchang] = useState<PanchangData>(() =>
    getTodayPanchang(new Date(), selectedDayPanchang)
  );
  const [istClock, setIstClock] = useState(() => getISTCalendarParts());
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(() =>
    vedicAudio.getActiveSpeechId()
  );

  // Immediately sync when user selects a different date or location in the calendar
  useEffect(() => {
    const now = new Date();
    setTodayFestival(getTodayFestivalInfo(now, selectedDayPanchang));
    setTodayPanchang(getTodayPanchang(now, selectedDayPanchang));
  }, [selectedDayPanchang]);

  useEffect(() => {
    const unsubSpeech = vedicAudio.subscribeSpeech((id) => {
      setActiveSpeechId(id);
    });
    return unsubSpeech;
  }, []);

  // Automatically roll over date & festival at 12:00 AM midnight IST and sync on location change
  useEffect(() => {
    let midnightTimer: number | null = null;

    const syncTodayParv = () => {
      const now = new Date();
      const nextClock = getISTCalendarParts(now);
      setIstClock((prev) => {
        if (prev.dateKey !== nextClock.dateKey) {
          setTodayFestival(getTodayFestivalInfo(now, selectedDayPanchang));
          setTodayPanchang(getTodayPanchang(now, selectedDayPanchang));
          return nextClock;
        }
        if (prev.timeString12h !== nextClock.timeString12h) {
          return nextClock;
        }
        return prev;
      });
    };

    const handleLocationChanged = () => {
      const now = new Date();
      setTodayFestival(getTodayFestivalInfo(now, selectedDayPanchang));
      setTodayPanchang(getTodayPanchang(now, selectedDayPanchang));
    };

    const scheduleExactMidnightRollover = () => {
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      const msUntilMidnight = getMsUntilNextISTMidnight(new Date());
      midnightTimer = window.setTimeout(() => {
        const now = new Date();
        setTodayFestival(getTodayFestivalInfo(now, selectedDayPanchang));
        setTodayPanchang(getTodayPanchang(now, selectedDayPanchang));
        setIstClock(getISTCalendarParts(now));
        scheduleExactMidnightRollover();
      }, msUntilMidnight);
    };

    scheduleExactMidnightRollover();

    const intervalId = window.setInterval(syncTodayParv, 30000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncTodayParv();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('panditji_panchang_location_changed', handleLocationChanged);

    return () => {
      window.clearInterval(intervalId);
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('panditji_panchang_location_changed', handleLocationChanged);
    };
  }, [selectedDayPanchang]);

  // Compute the next 4 upcoming major festivals/vrats dynamically from the selected date (or today) onwards
  const upcomingParvs = useMemo(() => {
    const list: Array<{
      dateLabel: string;
      daysAway: number;
      title: string;
      tithi: string;
      isMajor: boolean;
    }> = [];
    const baseYear = selectedDayPanchang ? selectedDayPanchang.year : istClock.year;
    const baseMonth = selectedDayPanchang ? selectedDayPanchang.month : istClock.month;
    const baseDay = selectedDayPanchang ? selectedDayPanchang.day : istClock.day;
    const baseDate = new Date(baseYear, baseMonth - 1, baseDay);

    for (let offset = 1; offset <= 45 && list.length < 4; offset++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + offset);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const dayNum = d.getDate();
      const info = buildSingleDayPanchang(y, m, dayNum, true);

      if (info.festivalName || info.isEkadashi || info.isPurnima || info.isAmavasya) {
        const title =
          info.festivalName ||
          (info.isEkadashi
            ? `${info.pakshaShort} एकादशी व्रत`
            : info.isPurnima
            ? `${info.hinduMaas} पूर्णिमा पर्व`
            : `${info.hinduMaas} अमावस्या`);

        list.push({
          dateLabel: `${dayNum} ${HINDI_MONTH_SHORT[m - 1] || ''}`,
          daysAway: offset,
          title,
          tithi: `${info.tithiShort} (${info.tithiEndTime.split(',')[0]})`,
          isMajor: info.festivalCategory === 'mahaparv' || info.isEkadashi || info.isPurnima,
        });
      }
    }
    return list;
  }, [selectedDayPanchang, istClock.year, istClock.month, istClock.day]);

  const handleChantFestivalMantra = () => {
    try {
      if (activeSpeechId !== 'festival-special-mantra') {
        vedicAudio.playTempleBell(0.65);
      }
      vedicAudio.toggleSpeakText(
        `आज के पर्व का विशेष सिद्ध मंत्र। ${todayFestival.specialMantra}। ${todayFestival.specialMantra}`,
        'festival-special-mantra'
      );
    } catch {
      // safe
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#241007] via-[#13192b] to-[#0d1322] border-2 border-amber-500/70 p-4 sm:p-6 lg:p-7 shadow-2xl">
      {/* Decorative glows */}
      <div className="absolute -top-12 -right-12 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Top Header: Pandit Portrait + Festival Name + Live Panchang Date */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-800/40 pb-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <PanditPortrait size="md" showBadge={true} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600/35 border border-red-400/60 text-amber-200 text-[11px] font-bold">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span>आज का पंचांग पर्व एवं व्रत-त्योहार</span>
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold">
                  {todayFestival.tag}
                </span>

              </div>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold font-vedic text-amber-100 mt-1.5 leading-snug">
                {todayFestival.hindiName}
              </h2>
              <p className="text-xs sm:text-sm text-amber-300/90 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="inline-flex items-center gap-1 font-bold text-yellow-300">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> {todayPanchang.date}
                </span>
                <span>•</span>
                <span className="font-semibold text-amber-200">{todayPanchang.tithi}</span>
                <span>•</span>
                <span className="text-amber-300/90">नक्षत्र: {todayPanchang.nakshatra}</span>
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center flex-shrink-0">
            <button
              type="button"
              onClick={onOpenMantraJaap}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Flame className="w-4 h-4" />
              <span>108 मंत्र जप करें</span>
            </button>

            <button
              type="button"
              onClick={() => onAskPanditInChat(todayFestival.hindiName)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <MessageCircle className="w-4 h-4 text-amber-400" />
              <span>पण्डित जी से विधि पूछें</span>
            </button>
          </div>
        </div>

        {/* Deity, Shubh Muhurat & Live Surya/Abhijit Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/85 border border-amber-700/40 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                आराध्य देवी-देवता एवं पक्ष
              </span>
              <p className="text-sm sm:text-base font-extrabold text-amber-100 mt-1">
                {todayFestival.deity}
              </p>
              <span className="text-xs text-amber-300/85 mt-0.5 block">{todayFestival.paksha}</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-300/90">
              <span className="inline-flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> सूर्योदय: {todayPanchang.suryaUday}
              </span>
              <span>सूर्यास्त: {todayPanchang.suryaAst}</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/45 md:col-span-2 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> पंचांग अनुसार आज की पूजा, हवन एवं शुभ मुहूर्त
              </span>
              <p className="text-xs sm:text-sm font-bold text-emerald-100 mt-1.5 leading-relaxed">
                {todayFestival.shubhMuhurat}
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-emerald-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-emerald-300 font-semibold">
                ✨ अभिजित मुहूर्त: <strong className="font-mono text-emerald-100">{todayPanchang.abhijitMuhurat}</strong>
              </span>
              <span className="text-rose-300 font-semibold">
                ⚠️ राहुकाल: <strong className="font-mono">{todayPanchang.rahuKaal}</strong>
              </span>
              <span className="text-amber-300 font-semibold">
                ⚠️ यमगण्ड: <strong className="font-mono">{todayPanchang.yamagandam}</strong>
              </span>
              <span className="text-orange-300 font-semibold">
                🔸 गुलिक काल: <strong className="font-mono">{todayPanchang.gulikaKaal}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Significance & Siddha Mantra Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          <div className="lg:col-span-7 p-4 rounded-2xl bg-amber-950/35 border border-amber-700/40 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>पंचांग एवं शास्त्रोक्त महत्व</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    if (activeSpeechId !== 'festival-significance-speech') {
                      vedicAudio.playTempleBell(0.5);
                    }
                    vedicAudio.toggleSpeakText(
                      `${todayFestival.hindiName}। ${todayFestival.significance} शुभ भोग प्रसाद: ${todayFestival.bhogPrasad}`,
                      'festival-significance-speech'
                    );
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    activeSpeechId === 'festival-significance-speech'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/50 text-amber-200'
                  }`}
                >
                  {activeSpeechId === 'festival-significance-speech' ? (
                    <>
                      <VolumeX className="w-3 h-3" />
                      <span>महत्व रोकें</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-yellow-400" />
                      <span>पर्व महत्व सुनें</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed">
                {todayFestival.significance}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 p-4 rounded-2xl bg-gradient-to-br from-[#2a1306] to-[#141b2d] border border-amber-500/50 flex flex-col justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-yellow-400" /> आज के पर्व का विशेष सिद्ध मंत्र
              </span>
              <p className="text-sm sm:text-base font-extrabold font-vedic text-yellow-300 mt-1.5 leading-snug">
                “{todayFestival.specialMantra}”
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleChantFestivalMantra}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  activeSpeechId === 'festival-special-mantra'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-extrabold shadow-md'
                    : 'bg-amber-500/25 hover:bg-amber-500/35 border-amber-400/60 text-amber-100'
                }`}
              >
                {activeSpeechId === 'festival-special-mantra' ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>मंत्र रोकें</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
                    <span>मंत्र ध्वनि सुनें</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenMantraJaap}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>108 जप माला खोलें</span>
              </button>
            </div>
          </div>
        </div>

        {/* Full Puja Vidhi, Bhog & Do's and Don'ts Grid (Always Visible) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Puja Vidhi & Bhog */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-800/40 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold font-vedic text-amber-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>शास्त्रोक्त पूजा विधि एवं शुभ भोग प्रसाद</span>
            </h4>
            <ul className="space-y-2 text-xs text-amber-100/95">
              {todayFestival.pujaVidhi.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2.5 border-t border-slate-800 flex items-start gap-2 text-xs">
              <Gift className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">विशेष शुभ भोग / नैवेद्य: </span>
                <span className="text-amber-100">{todayFestival.bhogPrasad}</span>
              </div>
            </div>
          </div>

          {/* Do's and Don'ts */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-800/40 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold font-vedic text-amber-200">
              आज के पर्व पर क्या करें और क्या न करें (नियम व सावधानियां)
            </h4>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> अवश्य करें (शुभ नियम):
              </span>
              {todayFestival.dosAndDonts.dos.map((d, idx) => (
                <p key={idx} className="text-xs text-emerald-100/95 pl-4 leading-relaxed">
                  • {d}
                </p>
              ))}
            </div>

            <div className="space-y-1.5 pt-2.5 border-t border-slate-800">
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> क्या न करें (वर्जित):
              </span>
              {todayFestival.dosAndDonts.donts.map((d, idx) => (
                <p key={idx} className="text-xs text-rose-200/95 pl-4 leading-relaxed">
                  • {d}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Festivals & Ekadashi Preview Bar */}
        {upcomingParvs.length > 0 && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-amber-500/35">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-extrabold font-vedic text-amber-200 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span>आगामी प्रमुख व्रत एवं त्योहार (पंचांग कैलेंडर अनुसार)</span>
              </span>
              <span className="text-[11px] text-amber-400/80 hidden sm:inline">
                किसी भी पर्व पर क्लिक करके पण्डित जी से पूछें
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {upcomingParvs.map((parv, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onAskPanditInChat(
                      `${parv.title} (${parv.dateLabel}) की पूजा विधि, शुभ मुहूर्त और नियम बताएं`
                    )
                  }
                  className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-950/50 border border-amber-700/35 hover:border-amber-400/60 text-left transition-all cursor-pointer flex items-center justify-between gap-2 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-extrabold text-yellow-300">
                        {parv.dateLabel}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 font-semibold">
                        {parv.daysAway === 1 ? 'कल' : `${parv.daysAway} दिन बाद`}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-amber-100 group-hover:text-yellow-200 truncate mt-0.5">
                      {parv.title}
                    </p>
                    <span className="text-[10px] text-slate-400 block truncate">{parv.tithi}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
