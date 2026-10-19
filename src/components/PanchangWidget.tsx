import React, { useState, useEffect } from 'react';
import { getTodayPanchang } from '../data/mockData';
import { Calendar, Sun, Moon, Clock, Compass, AlertTriangle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export const PanchangWidget: React.FC = () => {
  const [panchang, setPanchang] = useState(() => getTodayPanchang());
  const [showAllChoghadiya, setShowAllChoghadiya] = useState(false);

  useEffect(() => {
    const syncPanchang = () => setPanchang(getTodayPanchang(new Date()));
    syncPanchang();
    const timer = setInterval(syncPanchang, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#0f172a]/90 border border-amber-900/40 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Panchang Header with Hindu Vikram Samvat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/30 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-vedic text-amber-100">
              आज का दैनिक पंचांग एवं शुभ मुहूर्त
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-amber-300/80 mt-1 font-medium">
            {panchang.hinduDate} • {panchang.date} (रुद्रपुर मानक समय)
          </p>
        </div>

        {/* Shubh Yoga Notification Pill */}
        {panchang.specialFestival && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/20 to-yellow-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{panchang.specialFestival}</span>
          </div>
        )}
      </div>

      {/* Core Panchang Elements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-900/20">
          <span className="text-[11px] text-amber-400/80 font-medium block">तिथि (Tithi)</span>
          <span className="text-sm font-bold text-amber-100 block mt-0.5">{panchang.tithi}</span>
          <span className="text-[10px] text-slate-400">{panchang.paksha}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-900/20">
          <span className="text-[11px] text-amber-400/80 font-medium block">नक्षत्र (Nakshatra)</span>
          <span className="text-sm font-bold text-amber-100 block mt-0.5">{panchang.nakshatra}</span>
          <span className="text-[10px] text-slate-400">योग: {panchang.yoga}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-900/20">
          <span className="text-[11px] text-amber-400/80 font-medium block">सूर्योदय एवं सूर्यास्त</span>
          <span className="text-sm font-bold text-amber-100 flex items-center gap-1 mt-0.5">
            <Sun className="w-3.5 h-3.5 text-amber-400 inline" /> {panchang.suryaUday}
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Moon className="w-3 h-3 text-slate-400 inline" /> {panchang.suryaAst}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-900/20">
          <span className="text-[11px] text-amber-400/80 font-medium block">करण (Karana)</span>
          <span className="text-sm font-bold text-amber-100 block mt-0.5">{panchang.karana}</span>
          <span className="text-[10px] text-emerald-400">शुभ समय सक्रिय</span>
        </div>
      </div>

      {/* Crucial Timings: Abhijit Muhurat (Shubh) vs Rahu Kaal (Varjit) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Abhijit Muhurat */}
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">
              अभिजित मुहूर्त (सर्वश्रेष्ठ समय)
            </span>
            <div className="text-base font-bold text-emerald-100 mt-0.5">{panchang.abhijitMuhurat}</div>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              किसी भी शुभ कार्य, पूजा संकल्प या यात्रा प्रारंभ हेतु अति प्रशस्त।
            </p>
          </div>
        </div>

        {/* Rahu Kaal */}
        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-rose-400 tracking-wide uppercase">
              राहु काल (अशुभ / वर्जित)
            </span>
            <div className="text-base font-bold text-rose-100 mt-0.5">{panchang.rahuKaal}</div>
            <p className="text-[11px] text-rose-300/80 mt-0.5">
              इस अवधि में नया कार्य, गृह प्रवेश या महत्वपूर्ण निर्णय न लें।
            </p>
          </div>
        </div>

        {/* Disha Shool & Shastrokta Remedy */}
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-400 tracking-wide uppercase">
              दिशा शूल एवं निवारण
            </span>
            <div className="text-xs font-bold text-amber-100 mt-0.5">{panchang.dishaShool}</div>
            <p className="text-[11px] text-amber-300/80 mt-0.5">
              {panchang.dishaShoolRemedy}
            </p>
          </div>
        </div>
      </div>

      {/* Shubh Choghadiya Quick Bar */}
      <div className="mt-2 pt-3 border-t border-amber-900/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-amber-300/90 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            आज का चौघड़िया मुहूर्त (Day Choghadiya)
          </span>
          <button
            onClick={() => setShowAllChoghadiya(!showAllChoghadiya)}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>{showAllChoghadiya ? 'संक्षिप्त देखें' : 'सम्पूर्ण चौघड़िया'}</span>
            {showAllChoghadiya ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(showAllChoghadiya ? panchang.choghadiya : panchang.choghadiya.slice(0, 4)).map((ch, idx) => {
            const isGood = ['amrit', 'shubh', 'labh'].includes(ch.type);
            return (
              <div
                key={idx}
                className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                  isGood
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-900/40 border-slate-700/30 text-slate-300'
                }`}
              >
                <span className="font-semibold">{ch.name}</span>
                <span className="text-[11px] text-amber-300/80">{ch.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
