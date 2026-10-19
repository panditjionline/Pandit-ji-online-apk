import React, { useState, useEffect } from 'react';
import { PUJA_SERVICES, getTodayFestivalInfo, getTodayPanchang } from '../data/mockData';
import { FestivalInfo, PanchangData, PujaService } from '../types';
import { vedicAudio } from '../utils/audioSynthesizer';
import {
  Sparkles,
  Flame,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  BookOpen,
  MessageCircle,
  Gift,
  Sun,
} from 'lucide-react';

interface TodayFestivalWidgetProps {
  onOpenBookingWithService: (service: PujaService) => void;
  onOpenMantraJaap: () => void;
  onAskPanditInChat: (festivalTopic: string) => void;
}

export const TodayFestivalWidget: React.FC<TodayFestivalWidgetProps> = ({
  onOpenBookingWithService,
  onOpenMantraJaap,
  onAskPanditInChat,
}) => {
  const [todayFestival, setTodayFestival] = useState<FestivalInfo>(() => getTodayFestivalInfo());
  const [todayPanchang, setTodayPanchang] = useState<PanchangData>(() => getTodayPanchang());
  const [showFullDetails, setShowFullDetails] = useState<boolean>(true);

  // Automatically update at 12:00 AM midnight (checks every 15 seconds)
  useEffect(() => {
    const syncTodayParv = () => {
      const now = new Date();
      setTodayFestival(getTodayFestivalInfo(now));
      setTodayPanchang(getTodayPanchang(now));
    };

    syncTodayParv();
    const intervalId = setInterval(syncTodayParv, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const handleChantFestivalMantra = () => {
    vedicAudio.playTempleBell(0.7);
    vedicAudio.speakMantraOnce(todayFestival.specialMantra);
  };

  const handleBookRecommendedPuja = () => {
    const found =
      PUJA_SERVICES.find((s) => s.id === todayFestival.recommendedServiceId) || PUJA_SERVICES[0];
    onOpenBookingWithService(found);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#231008] via-[#13192b] to-[#0d1322] border-2 border-amber-500/60 p-4 sm:p-6 shadow-2xl">
      {/* Decorative glow */}
      <div className="absolute -top-12 -right-12 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Automatic Daily Parv Status Bar */}
      <div className="relative z-10 flex flex-col gap-3.5 border-b border-amber-800/40 pb-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 text-slate-950 shadow-lg flex-shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600/30 border border-red-400/50 text-amber-200 text-[11px] font-bold">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span>हिन्दू पंचांग अनुसार आज का महापर्व एवं व्रत-त्योहार</span>
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold">
                  {todayFestival.tag}
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold font-vedic text-amber-100 mt-1.5 leading-snug">
                {todayFestival.hindiName}
              </h3>
              <p className="text-xs text-amber-300/90 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="inline-flex items-center gap-1 font-bold text-yellow-300">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> {todayFestival.dateDisplay}
                </span>
                <span>•</span>
                <span className="font-semibold text-amber-200">पंचांग तिथि: {todayFestival.tithi}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/70 border border-amber-600/40 text-amber-200 text-xs font-semibold cursor-pointer"
            >
              {showFullDetails ? 'संक्षिप्त में देखें' : 'सम्पूर्ण पूजा विधि देखें'}
            </button>
          </div>
        </div>

        {/* Automatic Live Daily Panchang Strip (Replaces Manual Selector) */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-950/85 border border-amber-500/30 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-amber-200">
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              आज का पंचांग पर्व:
            </span>
            <span className="font-bold text-amber-100">{todayPanchang.date}</span>
            <span className="text-amber-500">•</span>
            <span className="font-semibold text-yellow-300">{todayPanchang.tithi}</span>
            <span className="text-amber-500 hidden sm:inline">•</span>
            <span className="text-amber-300/90 hidden sm:inline">
              नक्षत्र: {todayPanchang.nakshatra}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80 font-medium">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>सूर्योदय: {todayPanchang.suryaUday} • रात्रि 12:00 बजे तिथि स्वतः अपडेट</span>
          </div>
        </div>
      </div>

      {/* Main Festival Highlight Box */}
      <div className="relative z-10 space-y-4">
        {/* Deity, Shubh Muhurat & Significance Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-700/40">
            <span className="text-[11px] font-bold text-amber-400 uppercase block">
              आराध्य देवी-देवता (Deity)
            </span>
            <p className="text-sm font-bold text-amber-100 mt-1">{todayFestival.deity}</p>
            <span className="text-[11px] text-amber-300/80 mt-0.5 block">{todayFestival.paksha}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 md:col-span-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> पंचांग अनुसार आज की पूजा, हवन एवं शुभ मुहूर्त
            </span>
            <p className="text-xs sm:text-sm font-bold text-emerald-100 mt-1 leading-relaxed">
              {todayFestival.shubhMuhurat}
            </p>
          </div>
        </div>

        {/* Significance Paragraph */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-amber-950/30 border border-amber-800/40">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>पंचांग एवं शास्त्रोक्त महत्व</span>
          </h4>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            {todayFestival.significance}
          </p>
        </div>

        {showFullDetails && (
          <>
            {/* Puja Vidhi & Do's/Don'ts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Puja Vidhi & Bhog */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-800/40 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold font-vedic text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>शास्त्रोक्त पूजा विधि एवं शुभ भोग प्रसाद</span>
                </h4>
                <ul className="space-y-2 text-xs text-amber-100/90">
                  {todayFestival.pujaVidhi.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-slate-800 flex items-start gap-2 text-xs">
                  <Gift className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">विशेष शुभ भोग / नैवेद्य: </span>
                    <span className="text-amber-100">{todayFestival.bhogPrasad}</span>
                  </div>
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-800/40 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold font-vedic text-amber-200">
                  आज के पर्व पर क्या करें और क्या न करें (नियम व सावधानियां)
                </h4>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> अवश्य करें (शुभ नियम):
                  </span>
                  {todayFestival.dosAndDonts.dos.map((d, idx) => (
                    <p key={idx} className="text-xs text-emerald-100/90 pl-4 leading-relaxed">
                      • {d}
                    </p>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> क्या न करें (वर्जित):
                  </span>
                  {todayFestival.dosAndDonts.donts.map((d, idx) => (
                    <p key={idx} className="text-xs text-rose-200/90 pl-4 leading-relaxed">
                      • {d}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Festival Special Mantra & Action Bar */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950/80 via-slate-950 to-amber-950/80 border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  आज के पर्व का विशेष सिद्ध मंत्र:
                </span>
                <p className="text-sm sm:text-base font-bold font-vedic text-yellow-300 mt-0.5">
                  {todayFestival.specialMantra}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={handleChantFestivalMantra}
                  className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>मंत्र सुनें</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenMantraJaap}
                  className="px-3 py-2 rounded-xl bg-amber-900/70 hover:bg-amber-800 border border-amber-500/40 text-amber-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-yellow-400" />
                  <span>108 जप करें</span>
                </button>

                <button
                  type="button"
                  onClick={handleBookRecommendedPuja}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  त्योहार पूजा बुक करें
                </button>

                <button
                  type="button"
                  onClick={() => onAskPanditInChat(todayFestival.hindiName)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-700/40 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>AI से पूछें</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
