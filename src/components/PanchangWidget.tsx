import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sun,
  Moon,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ChevronUp,
  MapPin,
  Compass,
} from 'lucide-react';
import { getPanchang, PanchangData } from '../utils/panchang';
import { CalendarDayPanchang } from '../utils/panchangCalendarEngine';

interface PanchangWidgetProps {
  onOpenFullPanchang?: () => void;
  selectedDayPanchang?: CalendarDayPanchang;
  defaultExpandedChoghadiya?: boolean;
}

export const PanchangWidget: React.FC<PanchangWidgetProps> = ({
  onOpenFullPanchang,
  selectedDayPanchang,
  defaultExpandedChoghadiya = false,
}) => {
  const [panchang, setPanchang] = useState<PanchangData>(() => getPanchang(selectedDayPanchang));
  const [showExpanded, setShowExpanded] = useState<boolean>(defaultExpandedChoghadiya);
  const [chogTab, setChogTab] = useState<'day' | 'night'>('day');

  useEffect(() => {
    setPanchang(getPanchang(selectedDayPanchang));
  }, [selectedDayPanchang]);

  useEffect(() => {
    const refresh = () => setPanchang(getPanchang(selectedDayPanchang));
    const timer = setInterval(refresh, 1000);
    window.addEventListener('panditji_panchang_location_changed', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('panditji_panchang_location_changed', refresh);
    };
  }, [selectedDayPanchang]);

  const handleToggleFull = () => {
    if (onOpenFullPanchang) {
      onOpenFullPanchang();
    } else {
      setShowExpanded((prev) => !prev);
    }
  };

  const activeChoghadiyaList = chogTab === 'day' ? panchang.choghadiya : panchang.nightChoghadiya;

  return (
    <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#23190d] via-[#15110c] to-[#0f0d0a] p-5 shadow-2xl">
      {/* Top Badges Row */}
      <div className="flex flex-wrap items-center gap-2.5 mb-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-1.5 text-sm font-bold text-[#1a1105] shadow-md">
          <Calendar className="w-4 h-4 stroke-[2.5]" />
          <span>{panchang.isSelectedDateToday ? 'आज का दृक् पंचांग' : 'चयनित तिथि का दृक् पंचांग'}</span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/40 bg-[#2a1d0d]/90 px-4 py-1.5 text-sm font-semibold text-amber-200">
          <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">
            {panchang.dayNumber}
          </span>
          <span>
            {panchang.hindiDate} ({panchang.weekdayHindi})
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-amber-300">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {panchang.locationName} ({panchang.coordinatesLabel})
          </span>
        </div>
      </div>

      {/* Live Ticking Indian Time Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-[#07291e]/90 px-4 py-1.5 text-sm font-semibold text-emerald-300">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="tabular-nums">लाइव भारतीय समय: {panchang.liveTime}</span>
        </div>

        <button
          onClick={handleToggleFull}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-5 py-2 text-xs sm:text-sm font-bold text-[#1a1105] shadow-lg hover:brightness-110 transition-all active:scale-95 cursor-pointer"
        >
          <span>
            {onOpenFullPanchang
              ? 'सम्पूर्ण पंचांग व कैलेंडर खोलें'
              : showExpanded
              ? 'चौघड़िया तालिका संक्षिप्त करें'
              : 'दिन-रात्रि चौघड़िया तालिका देखें'}
          </span>
          {showExpanded ? (
            <ChevronUp className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>
      </div>

      <div className="border-t border-amber-500/20 pt-4">
        {/* 2x2 Grid of Core Panchang Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Card 1: Tithi & Paksha */}
          <div className="rounded-2xl border border-amber-500/25 bg-[#121624]/90 p-3.5 shadow-inner">
            <p className="text-xs font-bold text-amber-400 mb-1">पंचांग तिथि एवं पक्ष (सटीक समाप्ति समय)</p>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {panchang.tithi}
            </p>
            <p className="text-xs text-amber-200/80 mt-1">
              {panchang.masaPaksha} • {panchang.samvat}
            </p>
          </div>

          {/* Card 2: Nakshatra, Yoga & Karana */}
          <div className="rounded-2xl border border-amber-500/25 bg-[#121624]/90 p-3.5 shadow-inner">
            <p className="text-xs font-bold text-amber-400 mb-1">नक्षत्र, योग एवं करण (दृक्गणित)</p>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {panchang.nakshatra}
            </p>
            <p className="text-xs text-amber-200/85 mt-1">{panchang.yoga}</p>
            <p className="text-xs text-amber-300/80 mt-0.5">{panchang.karana}</p>
          </div>

          {/* Card 3: Surya & Chandra Ganna */}
          <div className="rounded-2xl border border-amber-500/25 bg-[#121624]/90 p-3.5 shadow-inner space-y-1.5">
            <p className="text-xs font-bold text-amber-400">सूर्य और चंद्र गणना ({panchang.locationName})</p>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs sm:text-sm font-bold text-white tabular-nums">
                सूर्योदय: {panchang.sunrise} | सूर्यास्त: {panchang.sunset}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-sky-400 shrink-0" />
              <p className="text-xs text-sky-200 font-semibold tabular-nums">
                चंद्रोदय: {panchang.moonrise}
              </p>
            </div>
            <p className="text-xs text-amber-200/85 pt-0.5 border-t border-slate-800">
              सूर्य राशि: <b>{panchang.suryaRashi}</b> • चंद्र राशि: <b>{panchang.chandraRashi}</b>
            </p>
          </div>

          {/* Card 4: Shubh Muhurat (Abhijit, Amrit Kaal, Vijay, Brahma Muhurta) */}
          <div className="rounded-2xl border border-emerald-500/40 bg-[#07291e]/85 p-3.5 shadow-inner space-y-1">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>शुभ मुहूर्त (Shubh Muhurt)</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white tabular-nums">
              अभिजित मुहूर्त: {panchang.abhijitMuhurat}
            </p>
            <p className="text-xs text-emerald-200 tabular-nums">
              अमृत काल: <b>{panchang.amritKaal}</b> • विजय मुहूर्त: <b>{panchang.vijayMuhurat}</b>
            </p>
            <p className="text-xs text-emerald-300/90 tabular-nums">
              ब्रह्म मुहूर्त: <b>{panchang.brahmaMuhurat}</b>
            </p>
          </div>
        </div>

        {/* Ashubh / Varjit Samay Full-Width Card (8-Part Ashtamaamsa Calculation) */}
        <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-[#2e0c18] to-[#230913] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-rose-400 mb-2">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>अशुभ / वर्जित समय एवं अष्टमांश (8 भाग) गणना ({panchang.weekdayHindi})</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/35 text-[11px] text-amber-200 font-semibold">
              दिनमान: {panchang.dinamanaFormatted} • 1 अष्टमांश = {panchang.ashtamaamsaDurationFormatted}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm">
            <div className="text-white font-bold tabular-nums">
              <span className="text-rose-300 font-semibold">
                राहु काल ({panchang.rahuKaalPart}वां भाग):{' '}
              </span>
              {panchang.rahukaal}
            </div>
            <div className="text-white font-bold tabular-nums">
              <span className="text-rose-300 font-semibold">
                यमगण्ड ({panchang.yamagandamPart}वां भाग):{' '}
              </span>
              {panchang.yamagandam}
            </div>
            <div className="text-white font-bold tabular-nums">
              <span className="text-amber-300 font-semibold">
                गुलिक काल ({panchang.gulikaKaalPart}वां भाग):{' '}
              </span>
              {panchang.gulikaKaal}
            </div>
            <div className="text-rose-200 font-bold">
              <span className="text-rose-300 font-semibold">दिशा शूल: </span>
              {panchang.dishaShool}
            </div>
          </div>
          {panchang.dishaShoolRemedy && (
            <p className="text-[11px] text-amber-200/90 mt-2 pt-2 border-t border-rose-500/25">
              <strong className="text-yellow-300">दिशा शूल निवारण उपाय: </strong>
              {panchang.dishaShoolRemedy}
            </p>
          )}
        </div>

        {/* Expandable Choghadiya & Samvat Section */}
        {(showExpanded || Boolean(selectedDayPanchang)) && (
          <div className="mt-4 pt-4 border-t border-amber-500/25 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-yellow-400" />
                <span>
                  {panchang.hindiDate} ({panchang.weekdayHindi}) का अष्टमांश (8 बराबर भाग) एवं चौघड़िया मुहूर्त
                </span>
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-slate-900 p-0.5 border border-amber-700/40 text-xs">
                  <button
                    type="button"
                    onClick={() => setChogTab('day')}
                    className={`px-3 py-1 rounded-md font-bold cursor-pointer transition-all ${
                      chogTab === 'day'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-amber-300 hover:text-amber-100'
                    }`}
                  >
                    ☀️ दिन के 8 भाग (चौघड़िया)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChogTab('night')}
                    className={`px-3 py-1 rounded-md font-bold cursor-pointer transition-all ${
                      chogTab === 'night'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-amber-300 hover:text-amber-100'
                    }`}
                  >
                    🌙 रात्रि के 8 भाग (चौघड़िया)
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {activeChoghadiyaList.map((item, idx) => {
                const isAuspicious = item.nature === 'अति शुभ' || item.nature === 'शुभ';
                const isInauspicious = item.nature === 'अशुभ';
                const kaalBadge =
                  'kaalBadge' in item && typeof item.kaalBadge === 'string'
                    ? item.kaalBadge
                    : undefined;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl p-2.5 border ${
                      isAuspicious
                        ? 'border-emerald-500/35 bg-emerald-950/40'
                        : isInauspicious
                        ? 'border-rose-500/35 bg-rose-950/40'
                        : 'border-amber-500/25 bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-white">
                        भाग {idx + 1}: {item.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isAuspicious
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isInauspicious
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {item.nature}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-amber-100/90 tabular-nums">{item.time}</p>
                    {kaalBadge && (
                      <span
                        className={`inline-block mt-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                          kaalBadge === 'गुलिक काल'
                            ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                            : 'bg-rose-500/25 border-rose-400/50 text-rose-200'
                        }`}
                      >
                        {kaalBadge} ({idx + 1}वां भाग)
                      </span>
                    )}
                    <p className="text-[10px] text-slate-300/80 mt-0.5 line-clamp-1">{item.meaning}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanchangWidget;
