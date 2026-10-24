import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  generateMonthlyPanchang,
  buildSingleDayPanchang,
  getISTCalendarParts,
  getMsUntilNextISTMidnight,
  CalendarDayPanchang,
  HINDI_GREGORIAN_MONTHS,
  VAAR_LIST,
  PanchangLocation,
  WORLDWIDE_PANCHANG_CITIES,
  getActivePanchangLocation,
  setActivePanchangLocation,
  resolveCityCoordinates,
} from '../utils/panchangCalendarEngine';
import { claimDailyPunyaPoint } from '../utils/punya';
import { vedicAudio } from '../utils/audioSynthesizer';
import { LiveTodayPanchangRibbon } from './LiveTodayPanchangRibbon';
import { PanchangWidget } from './PanchangWidget';
import { TodayFestivalWidget } from './TodayFestivalWidget';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  AlertTriangle,
  Sparkles,
  Compass,
  Volume2,
  VolumeX,
  Flame,
  MessageCircle,
  CalendarCheck,
  CheckCircle2,
  Filter,
  LayoutGrid,
  ListFilter,
  Star,
  MapPin,
  Search,
  Globe,
  RotateCcw,
} from 'lucide-react';

interface HinduPanchangCalendarProps {
  onOpenBookingWithDate?: (dateStr: string, occasionHint: string) => void;
  onAskPanditInChat?: (promptText: string) => void;
  onOpenMantraJaap?: () => void;
}

type CalendarFilterType = 'all' | 'mahaparv' | 'ekadashi_pradosh' | 'purnima_amavasya' | 'muhurat';

const safePlayClick = () => {
  try {
    if (typeof vedicAudio?.playClickSpark === 'function') {
      vedicAudio.playClickSpark(0.22);
    } else if (typeof vedicAudio?.playManjiraChime === 'function') {
      vedicAudio.playManjiraChime(0.2);
    }
  } catch {
    // ignore audio errors
  }
};

export const HinduPanchangCalendar: React.FC<HinduPanchangCalendarProps> = ({
  onOpenBookingWithDate,
  onAskPanditInChat,
  onOpenMantraJaap,
}) => {
  const [todayRef, setTodayRef] = useState<Date>(() => new Date());
  const initialIST = useMemo(() => getISTCalendarParts(new Date()), []);
  const lastDateKeyRef = useRef<string>(initialIST.dateKey);

  const [selectedYear, setSelectedYear] = useState<number>(() => initialIST.year || 2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => initialIST.month || 10); // 1-12
  const [selectedDayNum, setSelectedDayNum] = useState<number>(() => initialIST.day || 1);
  const [activeFilter, setActiveFilter] = useState<CalendarFilterType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeLocation, setActiveLocationState] = useState<PanchangLocation>(() =>
    getActivePanchangLocation()
  );
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);
  const [punyaClaimBanner, setPunyaClaimBanner] = useState<string | null>(null);

  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(() =>
    vedicAudio.getActiveSpeechId()
  );

  // Automatically award +1 Punya Point on Daily Panchang visit (strictly once per calendar day)
  useEffect(() => {
    const res = claimDailyPunyaPoint('panchang_visit');
    if (res.awarded && res.message) {
      setPunyaClaimBanner(res.message);
      const timer = setTimeout(() => setPunyaClaimBanner(null), 6500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for profile or location changes so Birth Place auto-sync works seamlessly
  useEffect(() => {
    const syncLoc = () => {
      setActiveLocationState(getActivePanchangLocation());
    };
    window.addEventListener('panditji_panchang_location_changed', syncLoc);
    window.addEventListener('panditji_active_profile_updated', syncLoc);
    window.addEventListener('panditji_vault_updated', syncLoc);
    return () => {
      window.removeEventListener('panditji_panchang_location_changed', syncLoc);
      window.removeEventListener('panditji_active_profile_updated', syncLoc);
      window.removeEventListener('panditji_vault_updated', syncLoc);
    };
  }, []);

  const filteredCities = useMemo(() => {
    const q = citySearchQuery.trim().toLowerCase();
    if (!q) return WORLDWIDE_PANCHANG_CITIES.slice(0, 14);
    return WORLDWIDE_PANCHANG_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.hindiName.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.id.includes(q)
    );
  }, [citySearchQuery]);

  const handleSelectCity = (loc: PanchangLocation) => {
    safePlayClick();
    setActivePanchangLocation(loc);
    setActiveLocationState(loc);
    setCitySearchQuery('');
    setShowCityDropdown(false);
  };

  const handleCustomCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearchQuery.trim()) return;
    const resolved = resolveCityCoordinates(citySearchQuery.trim());
    handleSelectCity(resolved);
  };

  const handleResetToBirthPlace = () => {
    safePlayClick();
    setActivePanchangLocation(null);
    setActiveLocationState(getActivePanchangLocation());
    setCitySearchQuery('');
    setShowCityDropdown(false);
  };

  useEffect(() => {
    const unsubSpeech = vedicAudio.subscribeSpeech((id) => {
      setActiveSpeechId(id);
    });
    return unsubSpeech;
  }, []);
  const [choghadiyaTab, setChoghadiyaTab] = useState<'day' | 'night'>('day');

  // Automatically roll over calendar date at 12:00 AM midnight IST
  useEffect(() => {
    let midnightTimer: number | null = null;

    const checkMidnightRollover = () => {
      const now = new Date();
      const currIST = getISTCalendarParts(now);
      if (currIST.dateKey !== lastDateKeyRef.current) {
        lastDateKeyRef.current = currIST.dateKey;
        setTodayRef(now);
        setSelectedYear(currIST.year);
        setSelectedMonth(currIST.month);
        setSelectedDayNum(currIST.day);
      }
    };

    const scheduleMidnight = () => {
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      const msUntilMidnight = getMsUntilNextISTMidnight(new Date());
      midnightTimer = window.setTimeout(() => {
        checkMidnightRollover();
        scheduleMidnight();
      }, msUntilMidnight);
    };

    scheduleMidnight();
    const intervalId = window.setInterval(checkMidnightRollover, 5000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkMidnightRollover();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const monthlyData = useMemo(
    () => generateMonthlyPanchang(selectedYear, selectedMonth, todayRef, activeLocation),
    [selectedYear, selectedMonth, todayRef, activeLocation]
  );

  const selectedDayData: CalendarDayPanchang = useMemo(() => {
    const days = monthlyData?.currentMonthDays || [];
    const found = days.find((d) => d.day === selectedDayNum);
    return (
      found ||
      days[0] ||
      buildSingleDayPanchang(selectedYear, selectedMonth, 1, true, todayRef, activeLocation)
    );
  }, [monthlyData, selectedDayNum, selectedYear, selectedMonth, todayRef, activeLocation]);

  // 10-Day Consecutive Panchang Window starting from the Selected Date (e.g. 23 Oct – 1 Nov 2026)
  const tenDayPanchangList: CalendarDayPanchang[] = useMemo(() => {
    const list: CalendarDayPanchang[] = [];
    for (let offset = 0; offset < 10; offset++) {
      const dt = new Date(Date.UTC(selectedYear, selectedMonth - 1, selectedDayNum + offset));
      const y = dt.getUTCFullYear();
      const m = dt.getUTCMonth() + 1;
      const d = dt.getUTCDate();
      list.push(
        buildSingleDayPanchang(y, m, d, m === selectedMonth, todayRef, activeLocation)
      );
    }
    return list;
  }, [selectedYear, selectedMonth, selectedDayNum, todayRef, activeLocation]);

  const daysInSelectedMonthCount = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate() || 31;
  }, [selectedYear, selectedMonth]);

  const handleSelectYear = (yr: number) => {
    safePlayClick();
    setSelectedYear(yr);
    const maxD = new Date(yr, selectedMonth, 0).getDate() || 31;
    setSelectedDayNum((prev) => Math.min(prev, maxD));
  };

  const handleSelectMonth = (m: number) => {
    safePlayClick();
    setSelectedMonth(m);
    const maxD = new Date(selectedYear, m, 0).getDate() || 31;
    setSelectedDayNum((prev) => Math.min(prev, maxD));
  };

  const handleSelectDayNum = (d: number) => {
    safePlayClick();
    const maxD = new Date(selectedYear, selectedMonth, 0).getDate() || 31;
    setSelectedDayNum(Math.max(1, Math.min(d, maxD)));
  };

  const handlePrevMonth = () => {
    safePlayClick();
    let newM = selectedMonth - 1;
    let newY = selectedYear;
    if (selectedMonth === 1) {
      newM = 12;
      newY = selectedYear - 1;
    }
    setSelectedMonth(newM);
    setSelectedYear(newY);
    const maxD = new Date(newY, newM, 0).getDate() || 31;
    setSelectedDayNum((prev) => Math.min(prev, maxD));
  };

  const handleNextMonth = () => {
    safePlayClick();
    let newM = selectedMonth + 1;
    let newY = selectedYear;
    if (selectedMonth === 12) {
      newM = 1;
      newY = selectedYear + 1;
    }
    setSelectedMonth(newM);
    setSelectedYear(newY);
    const maxD = new Date(newY, newM, 0).getDate() || 31;
    setSelectedDayNum((prev) => Math.min(prev, maxD));
  };

  const handleJumpToToday = () => {
    try {
      vedicAudio?.playTempleBell?.(0.45);
    } catch {
      // safe
    }
    const now = new Date();
    const ist = getISTCalendarParts(now);
    setTodayRef(now);
    setSelectedYear(ist.year);
    setSelectedMonth(ist.month);
    setSelectedDayNum(ist.day);
    setActiveFilter('all');
  };

  const handleSelectDay = (dayItem: CalendarDayPanchang) => {
    safePlayClick();
    if (!dayItem.isCurrentMonth || dayItem.year !== selectedYear || dayItem.month !== selectedMonth) {
      setSelectedYear(dayItem.year);
      setSelectedMonth(dayItem.month);
    }
    setSelectedDayNum(dayItem.day);
  };

  const matchesFilter = (dayItem: CalendarDayPanchang): boolean => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'mahaparv') {
      return Boolean(dayItem.festivalName);
    }
    if (activeFilter === 'ekadashi_pradosh') {
      return dayItem.isEkadashi || dayItem.isPradosh || dayItem.isChaturthi || dayItem.isShivratri;
    }
    if (activeFilter === 'purnima_amavasya') {
      return dayItem.isPurnima || dayItem.isAmavasya;
    }
    if (activeFilter === 'muhurat') {
      return dayItem.shubhMuhurats.length > 0;
    }
    return true;
  };

  const getCellBadgeInfo = (dayItem: CalendarDayPanchang) => {
    if (dayItem.isPurnima) {
      return {
        symbol: '🌕',
        badgeText: 'पूर्णिमा',
        badgeClass: 'bg-amber-500/30 text-yellow-200 border-amber-400/60',
      };
    }
    if (dayItem.isAmavasya) {
      return {
        symbol: '🌑',
        badgeText: 'अमावस्या',
        badgeClass: 'bg-indigo-950/90 text-indigo-200 border-indigo-400/50',
      };
    }
    if (dayItem.isEkadashi) {
      return {
        symbol: '🌙',
        badgeText: 'एकादशी',
        badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50',
      };
    }
    if (dayItem.isPradosh) {
      return {
        symbol: '🔱',
        badgeText: 'प्रदोष',
        badgeClass: 'bg-purple-950/90 text-purple-200 border-purple-400/50',
      };
    }
    if (dayItem.festivalCategory === 'mahaparv') {
      return {
        symbol: '🪔',
        badgeText: 'महापर्व',
        badgeClass: 'bg-red-900/70 text-amber-200 border-red-400/60',
      };
    }
    if (dayItem.isChaturthi) {
      return {
        symbol: '🐘',
        badgeText: 'चतुर्थी',
        badgeClass: 'bg-orange-950/80 text-orange-200 border-orange-500/40',
      };
    }
    return null;
  };

  // Group auspicious dates by category for the bottom summary
  const muhuratGroups = useMemo(() => {
    const groups: Record<
      string,
      { title: string; icon: string; desc: string; days: CalendarDayPanchang[] }
    > = {
      griha_pravesh: {
        title: 'गृह प्रवेश एवं वास्तु पूजन मुहूर्त',
        icon: '🏠',
        desc: 'नूतन गृह प्रवेश, भूमि पूजन एवं वास्तु शांति हेतु श्रेष्ठ तिथियां',
        days: [],
      },
      vivah: {
        title: 'शुभ विवाह एवं सगाई मुहूर्त',
        icon: '💍',
        desc: 'विवाह, रोका, सगाई एवं मांगलिक परिणय संस्कार तिथियां',
        days: [],
      },
      vahan: {
        title: 'वाहन, स्वर्ण एवं प्रॉपर्टी क्रय मुहूर्त',
        icon: '🚗',
        desc: 'नया वाहन, मकान, भूमि या आभूषण खरीदने हेतु शुभ दिवस',
        days: [],
      },
      sarvartha_siddhi: {
        title: 'सर्वार्थ सिद्धि एवं नया व्यापार मुहूर्त',
        icon: '✨',
        desc: 'दुकान उद्घाटन, नया व्यवसाय व महत्वपूर्ण संकल्प हेतु सिद्ध योग',
        days: [],
      },
      sanskar: {
        title: 'नामकरण, मुंडन एवं अन्नप्राशन संस्कार',
        icon: '👶',
        desc: 'शिशु के वैदिक संस्कारों हेतु शुभ नक्षत्र एवं तिथि संयोग',
        days: [],
      },
    };

    monthlyData.currentMonthDays.forEach((d) => {
      d.shubhMuhurats.forEach((m) => {
        if (groups[m.id]) {
          groups[m.id].days.push(d);
        }
      });
    });

    return Object.values(groups);
  }, [monthlyData]);

  return (
    <section className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-5 animate-fadeIn scroll-mt-24">
      {punyaClaimBanner && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-900/90 via-yellow-900/80 to-amber-900/90 border border-yellow-400/70 px-4 py-3 shadow-xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5 text-yellow-200 text-xs sm:text-sm font-extrabold">
            <Sparkles className="w-4 h-4 text-yellow-300 shrink-0 animate-pulse" />
            <span>{punyaClaimBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setPunyaClaimBanner(null)}
            className="text-[11px] font-bold text-amber-200 hover:text-white px-2 py-0.5 rounded-lg bg-slate-950/50 border border-amber-400/40 cursor-pointer"
          >
            ठीक है
          </button>
        </div>
      )}

      {/* ==================== 0. TOPMOST: TODAY'S LIVE PANCHANG, DATE & TIME RIBBON ==================== */}
      <LiveTodayPanchangRibbon
        mode="panchang"
        selectedDayPanchang={selectedDayData}
        onScrollToTodayDetails={() => {
          const el = document.getElementById('today-complete-info-below-calendar');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ==================== 1. ROYAL VEDIC PANCHANG CALENDAR HEADER BANNER ==================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1205] via-[#170e1d] to-[#0b1120] border-2 border-amber-500/60 p-4 sm:p-6 shadow-2xl">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Global City-Synced Ephemeris Location Bar */}
        <div className="relative z-20 mb-4 p-3 rounded-2xl bg-slate-950/85 border border-amber-500/40 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-amber-300/80 uppercase tracking-wider">
                  पंचांग स्थान (City Ephemeris):
                </span>
                <span className="text-xs sm:text-sm font-black text-yellow-300">
                  {activeLocation.hindiName || activeLocation.name}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                  {Math.abs(activeLocation.lat).toFixed(2)}°{activeLocation.lat >= 0 ? 'N' : 'S'},{' '}
                  {Math.abs(activeLocation.lon).toFixed(2)}°{activeLocation.lon >= 0 ? 'E' : 'W'} • UTC
                  {activeLocation.tzOffsetHours >= 0 ? `+${activeLocation.tzOffsetHours}` : activeLocation.tzOffsetHours}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/75 mt-0.5">
                सूर्योदय, सूर्यास्त, राहुकाल, तिथि एवं नक्षत्र समय इस स्थान के अक्षांश-देशांतर अनुसार लाइव गणना किए गए हैं
              </p>
            </div>
          </div>

          <div className="relative flex items-center gap-2 w-full md:w-auto">
            <form onSubmit={handleCustomCitySubmit} className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={citySearchQuery}
                onFocus={() => setShowCityDropdown(true)}
                onChange={(e) => {
                  setCitySearchQuery(e.target.value);
                  setShowCityDropdown(true);
                }}
                placeholder="शहर खोजें (रुद्रपुर, काशी, दिल्ली, London...)"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/95 border border-amber-500/50 text-amber-100 placeholder-amber-300/40 text-xs font-semibold focus:outline-none focus:border-yellow-400"
              />
              {showCityDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-2xl bg-slate-950/98 border border-amber-500/60 shadow-2xl z-50 divide-y divide-amber-900/30">
                  <div className="px-3 py-1.5 bg-amber-950/60 flex items-center justify-between text-[10px] font-bold text-amber-300">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-yellow-400" /> विश्वव्यापी शहर (Worldwide Ephemeris)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCityDropdown(false)}
                      className="text-amber-200 hover:text-white cursor-pointer"
                    >
                      बंद करें ✕
                    </button>
                  </div>
                  {filteredCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className="w-full px-3 py-2 text-left hover:bg-amber-900/40 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-amber-100">{city.hindiName}</div>
                        <div className="text-[10px] text-amber-300/70">{city.name}</div>
                      </div>
                      <span className="text-[10px] font-mono text-yellow-300/90 shrink-0">
                        {city.lat.toFixed(1)}°N, {city.lon.toFixed(1)}°E
                      </span>
                    </button>
                  ))}
                  {citySearchQuery.trim().length > 1 && (
                    <button
                      type="submit"
                      className="w-full px-3 py-2 text-left bg-amber-500/20 hover:bg-amber-500/30 text-yellow-200 text-xs font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>📍 &ldquo;{citySearchQuery.trim()}&rdquo; का स्थानीय पंचांग देखें</span>
                      <span className="text-[10px] underline">चुनें →</span>
                    </button>
                  )}
                </div>
              )}
            </form>
            <button
              type="button"
              onClick={handleResetToBirthPlace}
              title="प्रोफाइल जन्म स्थान (या रुद्रपुर) से सिंक करें"
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-yellow-400" />
              <span className="hidden sm:inline">जन्म स्थान</span>
            </button>
          </div>
        </div>

        {/* Top Row: Traditional Title & Samvat Info */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-800/40 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>श्री काशी एवं {activeLocation.hindiName.split(',')[0]} वैदिक पंचांग • पण्डित शशांक शर्मा</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold font-vedic text-amber-100 leading-tight">
              सम्पूर्ण मासिक हिन्दू पंचांग एवं व्रत-त्योहार कैलेंडर
            </h2>
            <p className="text-xs sm:text-sm text-amber-300/90 mt-1 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-yellow-300 font-bold">
                विक्रम संवत {monthlyData.vikramSamvat}
              </span>
              <span>•</span>
              <span>शक संवत {monthlyData.shakaSamvat}</span>
              <span>•</span>
              <span className="text-emerald-300 font-semibold">{monthlyData.hinduMaasRange}</span>
              <span>•</span>
              <span>{monthlyData.ritu}</span>
              <span>•</span>
              <span>{monthlyData.ayana}</span>
            </p>
          </div>

          {/* Month, Year & Day Selector Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 transition-colors cursor-pointer"
              title="पिछला महीना"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Day Dropdown (1 - 31) */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-amber-300/80 font-bold hidden sm:inline">तारीख:</span>
              <select
                aria-label="तारीख चुनें"
                value={selectedDayNum}
                onChange={(e) => handleSelectDayNum(Number(e.target.value))}
                className="px-2.5 py-2 rounded-xl bg-slate-900/95 border border-amber-500/50 text-amber-100 text-xs sm:text-sm font-bold focus:outline-none focus:border-yellow-400 cursor-pointer"
              >
                {Array.from({ length: daysInSelectedMonthCount }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-amber-100">
                    {d} तारीख
                  </option>
                ))}
              </select>
            </div>

            {/* Month Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-amber-300/80 font-bold hidden sm:inline">महीना:</span>
              <select
                aria-label="महीना चुनें"
                value={selectedMonth}
                onChange={(e) => handleSelectMonth(Number(e.target.value))}
                className="px-2.5 py-2 rounded-xl bg-slate-900/95 border border-amber-500/50 text-amber-100 text-xs sm:text-sm font-bold focus:outline-none focus:border-yellow-400 cursor-pointer"
              >
                {HINDI_GREGORIAN_MONTHS.map((mName, idx) => (
                  <option key={idx + 1} value={idx + 1} className="bg-slate-900 text-amber-100">
                    {mName}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-amber-300/80 font-bold hidden sm:inline">वर्ष:</span>
              <select
                aria-label="वर्ष चुनें"
                value={selectedYear}
                onChange={(e) => handleSelectYear(Number(e.target.value))}
                className="px-2.5 py-2 rounded-xl bg-slate-900/95 border border-amber-500/50 text-yellow-300 text-xs sm:text-sm font-bold focus:outline-none focus:border-yellow-400 cursor-pointer"
              >
                {Array.from({ length: 121 }, (_, i) => 1950 + i).map((yr) => (
                  <option key={yr} value={yr} className="bg-slate-900 text-yellow-300">
                    {yr} (संवत {yr + 57})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Date Picker Input */}
            <input
              type="date"
              aria-label="विशिष्ट तारीख चुनें"
              value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDayNum).padStart(2, '0')}`}
              onChange={(e) => {
                if (e.target.value) {
                  const parts = e.target.value.split('-');
                  if (parts.length === 3) {
                    const y = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10);
                    const d = parseInt(parts[2], 10);
                    if (y >= 1900 && y <= 2100) {
                      setSelectedYear(y);
                      setSelectedMonth(m);
                      const maxD = new Date(y, m, 0).getDate() || 31;
                      setSelectedDayNum(Math.max(1, Math.min(d, maxD)));
                    }
                  }
                }
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-900/95 border border-amber-500/50 text-amber-100 text-xs sm:text-sm font-bold focus:outline-none focus:border-yellow-400 cursor-pointer"
              title="अपनी इच्छानुसार किसी भी पुरानी या भावी तिथि पर जाएं"
            />

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 transition-colors cursor-pointer"
              title="अगला महीना"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs shadow-md cursor-pointer"
            >
              आज की तिथि
            </button>
          </div>
        </div>

        {/* Active Selected Date Confirmation Badge */}
        <div className="relative z-10 mt-3 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border border-yellow-400/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-yellow-400 text-slate-950 font-black text-xs">
              📌 चयनित तिथि:
            </span>
            <div className="text-xs sm:text-sm font-extrabold text-amber-100">
              <span className="text-yellow-300">{selectedDayData.formattedDateHindi}</span> ({selectedDayData.vaarHindi})
              <span className="text-amber-300/90 text-xs font-semibold ml-2">
                • {selectedDayData.paksha} • {selectedDayData.tithiShort}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('selected-day-panchang-details');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-yellow-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>इस तिथि का सम्पूर्ण पंचांग देखें</span>
          </button>
        </div>

        {/* Bottom Row: Filter Chips & Grid/List View Toggle */}
        <div className="relative z-10 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs text-amber-300/90 font-semibold flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" /> पंचांग फ़िल्टर:
            </span>

            {[
              { id: 'all', label: 'सभी तिथियां', icon: '📅' },
              {
                id: 'mahaparv',
                label: `व्रत एवं त्योहार (${monthlyData.festivalsInMonth.length})`,
                icon: '🪔',
              },
              { id: 'ekadashi_pradosh', label: 'एकादशी / प्रदोष / चतुर्थी', icon: '🌙' },
              { id: 'purnima_amavasya', label: 'पूर्णिमा / अमावस्या', icon: '🌕' },
              {
                id: 'muhurat',
                label: `शुभ मुहूर्त दिवस (${monthlyData.muhuratDaysInMonth.length})`,
                icon: '🏠',
              },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as CalendarFilterType)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-yellow-300 shadow-md'
                      : 'bg-slate-900/80 text-amber-200/90 border-amber-800/40 hover:border-amber-500/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-950/90 p-1 rounded-xl border border-amber-800/40">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-amber-200/80 hover:text-amber-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>मासिक ग्रिड</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-amber-200/80 hover:text-amber-100'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>विस्तृत सूची</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 2. MAIN CALENDAR GRID + SELECTED DAY DETAIL PANEL ==================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT / TOP (7 cols on XL): THE MONTHLY HINDU PANCHANG SHEET */}
        <div className="xl:col-span-7 bg-[#0d1322] border-2 border-amber-700/40 rounded-3xl overflow-hidden shadow-2xl">
          {/* Traditional Red & Gold Thakur Prasad Style Sub-Header */}
          <div className="bg-gradient-to-r from-red-950 via-[#3b110b] to-amber-950 px-4 py-3 border-b border-amber-600/40 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <div>
                <h3 className="text-base sm:text-lg font-extrabold font-vedic text-yellow-300">
                  {monthlyData.monthNameHindi} {monthlyData.year}
                </h3>
                <p className="text-[11px] text-amber-200/90">
                  {monthlyData.hinduMaasRange} • संवत {monthlyData.vikramSamvat} • किसी भी तारीख पर टैप कर सम्पूर्ण मुहूर्त देखें
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded bg-red-900/70 border border-red-400/50 text-amber-200">
                🪔 महापर्व
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-300">
                🌙 एकादशी
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/30 border border-amber-400/60 text-yellow-200">
                🌕 पूर्णिमा
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-950/90 border border-indigo-400/50 text-indigo-200">
                🌑 अमावस्या
              </span>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <>
              {/* 7-Weekday Header Row */}
              <div className="grid grid-cols-7 bg-slate-950 border-b border-amber-800/40">
                {VAAR_LIST.map((vaar, idx) => {
                  const isSunday = idx === 0;
                  return (
                    <div
                      key={vaar.eng}
                      className={`py-2.5 px-1 text-center border-r last:border-r-0 border-amber-900/25 ${
                        isSunday ? 'bg-red-950/50 text-red-300' : 'text-amber-300'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-extrabold font-vedic">
                        <span className="hidden sm:inline">{vaar.full}</span>
                        <span className="sm:hidden">{vaar.short}</span>
                      </div>
                      <div className="text-[9px] sm:text-[10px] opacity-75 font-vedic">
                        {vaar.short}वार
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 35/42 Day Panchang Cells Grid */}
              <div className="grid grid-cols-7 bg-[#090d18]">
                {monthlyData.daysGrid.map((dayItem, idx) => {
                  const isSelected =
                    dayItem.isCurrentMonth && dayItem.day === selectedDayData.day;
                  const isSunday = dayItem.weekdayIndex === 0;
                  const isMatched = matchesFilter(dayItem);
                  const badge = getCellBadgeInfo(dayItem);

                  return (
                    <button
                      key={`${dayItem.year}-${dayItem.month}-${dayItem.day}-${idx}`}
                      type="button"
                      onClick={() => handleSelectDay(dayItem)}
                      className={`relative min-h-[82px] sm:min-h-[112px] p-1.5 sm:p-2 border-r border-b border-amber-900/25 text-left flex flex-col justify-between transition-all cursor-pointer group ${
                        !dayItem.isCurrentMonth
                          ? 'opacity-30 bg-slate-950/70 hover:opacity-60'
                          : !isMatched
                          ? 'opacity-25 bg-slate-950/40'
                          : isSelected
                          ? 'bg-gradient-to-br from-amber-900/60 via-amber-950/70 to-slate-900 ring-2 ring-inset ring-yellow-400 z-10'
                          : dayItem.isToday
                          ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 ring-2 ring-inset ring-emerald-400'
                          : dayItem.festivalCategory === 'mahaparv'
                          ? 'bg-gradient-to-b from-red-950/35 to-[#0d1322] hover:bg-amber-950/40'
                          : isSunday
                          ? 'bg-red-950/15 hover:bg-amber-950/30'
                          : 'bg-[#0d1322] hover:bg-slate-900/90'
                      }`}
                    >
                      {/* Top Row: Date Number + Special Symbol */}
                      <div className="flex items-start justify-between gap-0.5 w-full">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-sm sm:text-xl font-extrabold font-mono leading-none ${
                              dayItem.isToday
                                ? 'text-emerald-300'
                                : isSelected
                                ? 'text-yellow-300'
                                : isSunday
                                ? 'text-red-400'
                                : 'text-amber-100'
                            }`}
                          >
                            {dayItem.day}
                          </span>
                          {dayItem.isToday && (
                            <span className="px-1 py-0.2 rounded bg-emerald-500 text-slate-950 text-[8px] sm:text-[9px] font-black uppercase">
                              आज
                            </span>
                          )}
                        </div>

                        {badge && (
                          <span
                            className={`text-[10px] sm:text-xs leading-none px-1 py-0.5 rounded border ${badge.badgeClass}`}
                            title={badge.badgeText}
                          >
                            {badge.symbol}
                          </span>
                        )}
                      </div>

                      {/* Middle Row: Tithi & Sunrise */}
                      <div className="my-0.5 w-full">
                        <div
                          className={`text-[9px] sm:text-[11px] font-bold leading-tight truncate ${
                            dayItem.pakshaShort === 'शुक्ल'
                              ? 'text-amber-300'
                              : 'text-sky-300/90'
                          }`}
                        >
                          {dayItem.tithiShort}
                        </div>
                        <div className="hidden sm:flex items-center justify-between text-[9px] text-slate-400 mt-0.5">
                          <span className="truncate max-w-[65%]">{dayItem.nakshatra.replace(' नक्षत्र', '')}</span>
                          <span className="font-mono text-[8px] text-amber-400/75">
                            ☀️{dayItem.sunrise.replace('प्रातः ', '').replace(' AM', '')}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Festival Ribbon OR Shubh Muhurat Icons */}
                      <div className="w-full mt-auto">
                        {dayItem.festivalName ? (
                          <div
                            className={`w-full px-1 py-0.5 rounded text-[8px] sm:text-[10px] font-bold leading-tight line-clamp-1 ${
                              dayItem.festivalCategory === 'mahaparv'
                                ? 'bg-red-600/35 text-yellow-200 border border-red-400/40'
                                : dayItem.isPurnima
                                ? 'bg-amber-500/30 text-yellow-200 border border-amber-400/40'
                                : dayItem.isEkadashi
                                ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-400/40'
                                : 'bg-amber-900/50 text-amber-200 border border-amber-600/30'
                            }`}
                            title={dayItem.festivalName}
                          >
                            {dayItem.festivalName.split(' (')[0]}
                          </div>
                        ) : dayItem.shubhMuhurats.length > 0 ? (
                          <div className="flex items-center gap-0.5 overflow-hidden">
                            {dayItem.shubhMuhurats.slice(0, 3).map((m) => (
                              <span
                                key={m.id}
                                className="text-[9px] sm:text-[10px]"
                                title={m.label}
                              >
                                {m.icon}
                              </span>
                            ))}
                            <span className="hidden sm:inline text-[9px] text-emerald-300/90 font-semibold truncate ml-0.5">
                              शुभ मुहूर्त
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* DETAILED LIST VIEW FOR MOBILE / QUICK READING */
            <div className="divide-y divide-amber-900/30 max-h-[680px] overflow-y-auto">
              {monthlyData.currentMonthDays.filter(matchesFilter).map((dayItem) => {
                const isSelected = dayItem.day === selectedDayData.day;
                return (
                  <div
                    key={dayItem.day}
                    onClick={() => handleSelectDay(dayItem)}
                    className={`p-3.5 sm:p-4 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-950/50 border-l-4 border-l-yellow-400'
                        : 'hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border ${
                          dayItem.isToday
                            ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                            : dayItem.weekdayIndex === 0
                            ? 'bg-red-950/60 border-red-500/40 text-red-300'
                            : 'bg-slate-900 border-amber-700/40 text-amber-200'
                        }`}
                      >
                        <span className="text-base font-black font-mono leading-none">
                          {dayItem.day}
                        </span>
                        <span className="text-[10px] font-bold mt-0.5">{dayItem.vaarShort}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-amber-100">
                            {dayItem.tithiName}
                          </span>
                          <span className="text-[11px] text-amber-400">• {dayItem.nakshatra}</span>
                        </div>

                        {dayItem.festivalName && (
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600/25 border border-red-400/40 text-yellow-200 text-xs font-bold">
                            <span>🪔 {dayItem.festivalName}</span>
                          </div>
                        )}

                        {dayItem.shubhMuhurats.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {dayItem.shubhMuhurats.map((m) => (
                              <span
                                key={m.id}
                                className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-semibold"
                              >
                                {m.icon} {m.shortLabel}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 text-[11px] text-slate-400 font-mono">
                      <div className="text-amber-300">☀️ {dayItem.sunrise}</div>
                      <div>🌙 {dayItem.sunset}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT / BOTTOM (5 cols on XL): SELECTED DAY COMPLETE DAINIK PANCHANG KUNDALI */}
        <div id="selected-day-panchang-details" className="scroll-mt-24 xl:col-span-5 bg-gradient-to-b from-[#1a1025] via-[#0f172a] to-[#0b1120] border-2 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
          {/* Selected Date Top Header */}
          <div className="flex items-start justify-between gap-3 border-b border-amber-800/40 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black uppercase">
                  चयनित तिथि पंचांग विवरण
                </span>
                {selectedDayData.isToday && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[11px] font-bold">
                    आज की तिथि
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold font-vedic text-yellow-300 mt-2">
                {selectedDayData.formattedDateHindi} • {selectedDayData.vaarHindi}
              </h3>
              <p className="text-xs sm:text-sm text-amber-200 font-semibold mt-0.5">
                विक्रम संवत {selectedDayData.vikramSamvat} • {selectedDayData.hinduMaas} •{' '}
                {selectedDayData.paksha}
              </p>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-950 flex flex-col items-center justify-center font-mono shadow-lg flex-shrink-0">
              <span className="text-xl font-black leading-none">{selectedDayData.day}</span>
              <span className="text-[10px] font-extrabold mt-0.5">{selectedDayData.vaarShort}</span>
            </div>
          </div>

          {/* Highlighted Festival / Vrat Banner for Selected Date */}
          {selectedDayData.festivalName && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/80 via-amber-950/70 to-red-950/80 border border-amber-400/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-yellow-300">
                <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span>विशेष महापर्व / व्रत संयोग:</span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold font-vedic text-amber-100 leading-snug">
                {selectedDayData.festivalName}
              </h4>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                {selectedDayData.festivalDescription}
              </p>
              {selectedDayData.festivalPujaHint && (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-[11px] text-emerald-300 font-medium">
                  <strong className="text-yellow-300">पूजा एवं मुहूर्त निर्देश: </strong>
                  {selectedDayData.festivalPujaHint}
                </div>
              )}
            </div>
          )}

          {/* 5 Panchang Angas Grid (Tithi, Nakshatra, Yoga, Karana, Rashi) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-800/40">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">
                1. पंचांग तिथि (समाप्ति एवं अगली तिथि)
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-100 block mt-0.5 leading-snug">
                {selectedDayData.tithiName} ({selectedDayData.tithiEndTime})
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-800/40">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">
                2. नक्षत्र (समाप्ति एवं अगला नक्षत्र)
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-100 block mt-0.5 leading-snug">
                {selectedDayData.nakshatra} ({selectedDayData.nakshatraEndTime})
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-800/40">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">
                3. योग एवं करण (समाप्ति समय सहित)
              </span>
              <span className="text-xs font-bold text-amber-100 block mt-0.5 leading-snug">
                योग: {selectedDayData.yoga} ({selectedDayData.yogaEndTime})
              </span>
              <span className="text-[11px] text-emerald-300 block mt-1 pt-1 border-t border-slate-800 leading-snug">
                करण: <strong>{selectedDayData.karana} ({selectedDayData.karanaEndTime})</strong>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-800/40">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">
                4. चंद्र राशि संचार एवं सूर्य राशि
              </span>
              <span className="text-xs font-bold text-amber-100 block mt-0.5 leading-snug">
                चंद्रमा: {selectedDayData.chandraRashi}
              </span>
              <span className="text-[11px] text-amber-300/90 block mt-1 pt-1 border-t border-slate-800">
                सूर्य: {selectedDayData.suryaRashi}
              </span>
            </div>
          </div>

          {/* Sunrise, Sunset & Moonrise Strip */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/90 border border-amber-700/30 text-center">
            <div>
              <span className="text-[10px] text-amber-300/80 flex items-center justify-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" /> सूर्योदय
              </span>
              <span className="text-xs font-extrabold text-amber-100 font-mono">
                {selectedDayData.sunrise}
              </span>
            </div>
            <div className="border-x border-amber-900/40">
              <span className="text-[10px] text-amber-300/80 flex items-center justify-center gap-1">
                <Sun className="w-3 h-3 text-orange-400" /> सूर्यास्त
              </span>
              <span className="text-xs font-extrabold text-amber-100 font-mono">
                {selectedDayData.sunset}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-amber-300/80 flex items-center justify-center gap-1">
                <Moon className="w-3 h-3 text-sky-300" /> चंद्रोदय
              </span>
              <span className="text-xs font-extrabold text-sky-200 font-mono">
                {selectedDayData.moonrise}
              </span>
            </div>
          </div>

          {/* Shubh Muhurat Categories Active on Selected Day */}
          {selectedDayData.shubhMuhurats.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/35 border border-emerald-500/40 space-y-2">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>इस तिथि पर उपलब्ध शुभ मांगलिक मुहूर्त:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedDayData.shubhMuhurats.map((m) => (
                  <span
                    key={m.id}
                    className="px-2.5 py-1 rounded-xl bg-emerald-900/60 border border-emerald-400/50 text-emerald-100 text-xs font-bold flex items-center gap-1"
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shubh Samay vs Rahu Kaal / Varjit Samay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/35 space-y-1">
              <div className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> शुभ मुहूर्त समय
              </div>
              <div className="text-xs text-emerald-100">
                <span className="text-emerald-300/90">अभिजित: </span>
                <strong className="font-mono">{selectedDayData.abhijitMuhurat}</strong>
              </div>
              <div className="text-xs text-emerald-100">
                <span className="text-emerald-300/90">अमृत काल: </span>
                <strong className="font-mono">{selectedDayData.amritKaal}</strong>
              </div>
              <div className="text-xs text-emerald-100">
                <span className="text-emerald-300/90">ब्रह्म मुहूर्त: </span>
                <strong className="font-mono">{selectedDayData.brahmaMuhurat}</strong>
              </div>
              <div className="text-xs text-emerald-100">
                <span className="text-emerald-300/90">विजय मुहूर्त: </span>
                <strong className="font-mono">{selectedDayData.vijayMuhurat}</strong>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/35 space-y-1">
              <div className="text-[11px] font-extrabold text-rose-400 flex items-center justify-between gap-1">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> अशुभ / वर्जित समय (8 अष्टमांश भाग)
                </span>
              </div>
              <div className="text-[10px] text-amber-200/90 pb-1 border-b border-rose-900/50">
                दिनमान: <strong>{selectedDayData.dinamanaFormatted}</strong> • 1 भाग ={' '}
                <strong>{selectedDayData.ashtamaamsaDurationFormatted}</strong>
              </div>
              <div className="text-xs text-rose-100">
                <span className="text-rose-300/90">
                  राहु काल ({selectedDayData.rahuKaalPart}वां भाग):{' '}
                </span>
                <strong className="font-mono">{selectedDayData.rahuKaal}</strong>
              </div>
              <div className="text-xs text-rose-100">
                <span className="text-rose-300/90">
                  यमगण्ड ({selectedDayData.yamagandamPart}वां भाग):{' '}
                </span>
                <strong className="font-mono">{selectedDayData.yamagandam}</strong>
              </div>
              <div className="text-xs text-rose-100">
                <span className="text-amber-300/90">
                  गुलिक काल ({selectedDayData.gulikaKaalPart}वां भाग):{' '}
                </span>
                <strong className="font-mono">{selectedDayData.gulikaKaal}</strong>
              </div>
              <div className="text-xs text-rose-100">
                <span className="text-rose-300/90">दिशा शूल: </span>
                <strong>{selectedDayData.dishaShool}</strong>
              </div>
            </div>
          </div>

          {/* Day & Night Choghadiya / 8-Part Ashtamaamsa Table */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-800/40 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>अष्टमांश (8 भाग) एवं चौघड़िया ({selectedDayData.formattedDateHindi})</span>
              </span>
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-amber-800/40 text-[11px]">
                <button
                  type="button"
                  onClick={() => setChoghadiyaTab('day')}
                  className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                    choghadiyaTab === 'day'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-amber-300 hover:text-amber-100'
                  }`}
                >
                  ☀️ दिन (8 भाग)
                </button>
                <button
                  type="button"
                  onClick={() => setChoghadiyaTab('night')}
                  className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                    choghadiyaTab === 'night'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-amber-300 hover:text-amber-100'
                  }`}
                >
                  🌙 रात्रि (8 भाग)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {(choghadiyaTab === 'day'
                ? selectedDayData.dayChoghadiya
                : selectedDayData.nightChoghadiya
              ).map((slot, i) => {
                const isShubh = ['amrit', 'shubh', 'labh', 'char'].includes(slot.type);
                return (
                  <div
                    key={i}
                    className={`p-2 rounded-xl border text-xs flex flex-col justify-between gap-1 ${
                      isShubh
                        ? 'bg-emerald-950/25 border-emerald-500/35 text-emerald-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold">
                        भाग {i + 1}: {slot.hindiName} {isShubh ? '✨' : ''}
                      </span>
                      {choghadiyaTab === 'day' && slot.kaalBadge && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                            slot.kaalBadge === 'गुलिक काल'
                              ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                              : 'bg-rose-500/25 border-rose-400/50 text-rose-200'
                          }`}
                        >
                          {slot.kaalBadge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-amber-300/90">
                      {slot.time.replace(/सुबह |प्रातः |पूर्वाह्न |दोपहर |सायं |शाम |रात्रि |मध्यरात्रि /g, '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mantra & Quick Action Buttons for Selected Date */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/70 to-slate-900 border border-amber-500/40 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-400 block">
                इस तिथि के आराध्य देव ({selectedDayData.festivalDeity}) का सिद्ध मंत्र:
              </span>
              <p className="text-xs sm:text-sm font-bold font-vedic text-yellow-300 mt-0.5">
                {selectedDayData.festivalMantra}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const speechId = 'panchang-calendar-day-mantra';
                  if (activeSpeechId !== speechId) {
                    vedicAudio.playTempleBell(0.6);
                  }
                  const textToSpeak = selectedDayData.festivalMantra
                    ? `${selectedDayData.formattedDateHindi}, ${selectedDayData.tithiName}। विशेष मंत्र: ${selectedDayData.festivalMantra}`
                    : `${selectedDayData.formattedDateHindi}, ${selectedDayData.hinduMaas}, ${selectedDayData.paksha} ${selectedDayData.tithiName}, ${selectedDayData.nakshatra}। ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः॥`;
                  vedicAudio.toggleSpeakText(textToSpeak, speechId);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  activeSpeechId === 'panchang-calendar-day-mantra'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-extrabold shadow-md'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/50 text-amber-200'
                }`}
              >
                {activeSpeechId === 'panchang-calendar-day-mantra' ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>मंत्र रोकें</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>मंत्र श्रवण</span>
                  </>
                )}
              </button>

              {onOpenMantraJaap && (
                <button
                  type="button"
                  onClick={onOpenMantraJaap}
                  className="py-2 px-3 rounded-xl bg-amber-900/70 hover:bg-amber-800 border border-amber-500/40 text-amber-100 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-yellow-400" />
                  <span>108 जप माला</span>
                </button>
              )}

              {onAskPanditInChat && (
                <button
                  type="button"
                  onClick={() =>
                    onAskPanditInChat(
                      `पण्डित जी, ${selectedDayData.formattedDateHindi} (${selectedDayData.vaarHindi}, ${selectedDayData.tithiName}, ${selectedDayData.nakshatra}) के दिन का शुभ मुहूर्त, व्रत विधि और मेरे लिए क्या विशेष उपाय रहेगा?`
                    )
                  }
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>पण्डित जी से मुहूर्त पूछें</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  handleJumpToToday();
                  const el = document.getElementById('today-complete-info-below-calendar');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>आज का सम्पूर्ण विवरण</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2B. BELOW CALENDAR: SELECTED DAY COMPLETE PANCHANG & PARV INFORMATION ==================== */}
      <div id="today-complete-info-below-calendar" className="scroll-mt-24 space-y-6 pt-2">
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#241106] via-[#18122b] to-[#0d1826] border-2 border-amber-500/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-yellow-300 text-xs font-extrabold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>
                {selectedDayData.formattedDateHindi} ({selectedDayData.vaarHindi}) • सम्पूर्ण वैदिक विवरण
              </span>
            </span>
            <h3 className="text-lg sm:text-2xl font-extrabold font-vedic text-amber-100">
              {selectedDayData.formattedDateHindi} का विस्तृत पंचांग, चौघड़िया, पर्व महत्व एवं शास्त्रोक्त पूजा विधि
            </h3>
            <p className="text-xs text-amber-200/85 mt-0.5">
              चयनित तिथि ({selectedDayData.tithiShort}), नक्षत्र ({selectedDayData.nakshatra}), योग, करण, दिशा शूल निवारण, चौघड़िया मुहूर्त एवं पूजा विधान
            </p>
          </div>
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer self-start sm:self-center whitespace-nowrap shadow-md"
          >
            कैलेंडर में आज की तिथि चुनें
          </button>
        </div>

        {/* Selected Date's Detailed Panchang, Disha Shool Remedy & Choghadiya */}
        <PanchangWidget
          selectedDayPanchang={selectedDayData}
          defaultExpandedChoghadiya={true}
        />

        {/* Selected Date's Festival Significance, Mantra Audio, Puja Vidhi, Do's & Don'ts & Upcoming Parvs */}
        <TodayFestivalWidget
          selectedDayPanchang={selectedDayData}
          onOpenMantraJaap={() => {
            if (onOpenMantraJaap) onOpenMantraJaap();
          }}
          onAskPanditInChat={(topic) => {
            if (onAskPanditInChat) {
              onAskPanditInChat(
                `पण्डित जी, मुझे "${topic}" (${selectedDayData.formattedDateHindi}) के बारे में शास्त्रसम्मत परामर्श, शुभ मुहूर्त और पूजा विधि बताएं।`
              );
            }
          }}
        />
      </div>

      {/* ==================== 3. MONTHLY SHUBH MUHURAT FINDER (विवाह, गृह प्रवेश, वाहन) ==================== */}
      <div className="bg-[#0e1526] border border-amber-700/40 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-800/40 pb-3">
          <div>
            <h3 className="text-lg sm:text-2xl font-extrabold font-vedic text-amber-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span>
                {monthlyData.monthNameHindi} {monthlyData.year} के शुभ मांगलिक मुहूर्त सारणी
              </span>
            </h3>
            <p className="text-xs text-amber-300/80 mt-0.5">
              गृह प्रवेश, विवाह, वाहन क्रय, नामकरण एवं नए व्यापार हेतु पंचांग शोधित शुभ तिथियां (तारीख पर क्लिक कर चौघड़िया देखें)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {muhuratGroups.map((group) => (
            <div
              key={group.title}
              className="p-4 rounded-2xl bg-slate-950/85 border border-amber-800/40 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{group.icon}</span>
                  <h4 className="text-sm sm:text-base font-bold font-vedic text-yellow-300">
                    {group.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{group.desc}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {group.days.length > 0 ? (
                    group.days.map((d) => (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => handleSelectDay(d)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono cursor-pointer transition-all border ${
                          selectedDayData.day === d.day
                            ? 'bg-amber-500 text-slate-950 border-yellow-300'
                            : 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-200 border-emerald-500/40'
                        }`}
                        title={`${d.formattedDateHindi} (${d.tithiShort}, ${d.nakshatra})`}
                      >
                        {d.day} {monthlyData.monthNameHindi.slice(0, 3)} ({d.vaarShort})
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-amber-300/70 italic">
                      इस माह चातुर्मास / तारा अस्त के कारण व्यक्तिगत कुंडली से मुहूर्त निकलवाएं।
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-amber-300/80">
                  कुल शुभ दिवस: <strong>{group.days.length}</strong>
                </span>
                {onAskPanditInChat && (
                  <button
                    type="button"
                    onClick={() =>
                      onAskPanditInChat(
                        `पण्डित जी, मुझे ${monthlyData.monthNameHindi} ${monthlyData.year} में "${group.title}" के लिए मेरी राशि व नाम के अनुसार सबसे श्रेष्ठ मुहूर्त बताएं।`
                      )
                    }
                    className="text-yellow-400 hover:underline font-bold cursor-pointer"
                  >
                    पण्डित जी से पूछें →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== 3A. 10-DAY SUMMARY TABLE & DAY-BY-DAY DETAILED PANCHANG (BELOW SHUBH MUHURAT SARNI) ==================== */}
      <div className="bg-[#0d1322] border-2 border-amber-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-800/40 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-yellow-300 text-xs font-extrabold mb-1">
              <Calendar className="w-3.5 h-3.5 text-yellow-400" />
              <span>
                दृक गणित 10-दिवसीय पंचांग ({tenDayPanchangList[0]?.formattedDateHindi} से{' '}
                {tenDayPanchangList[tenDayPanchangList.length - 1]?.formattedDateHindi})
              </span>
            </span>
            <h3 className="text-lg sm:text-2xl font-extrabold font-vedic text-amber-100">
              🗓️ 10 दिनों का संक्षिप्त एवं विस्तृत पंचांग ({activeLocation.hindiName.split(',')[0]})
            </h3>
            <p className="text-xs text-amber-200/80 mt-0.5">
              चयनित तिथि से आगामी 10 दिनों की तिथि समाप्ति, अगली तिथि (&ldquo;फिर ...&rdquo;), नक्षत्र, योग, करण, राहुकाल, यमगण्ड एवं गुलिक काल की 100% सटीक सारणी
            </p>
          </div>
        </div>

        {/* 10-Day Summary Table */}
        <div className="overflow-x-auto rounded-2xl border border-amber-700/40 bg-slate-950/90">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-gradient-to-r from-amber-950/90 via-red-950/80 to-amber-950/90 border-b border-amber-600/40 text-[11px] sm:text-xs font-extrabold text-yellow-300">
                <th className="py-3 px-3">दिनांक</th>
                <th className="py-3 px-2.5">दिन</th>
                <th className="py-3 px-3">पक्ष / तिथि</th>
                <th className="py-3 px-3">मुख्य नक्षत्र</th>
                <th className="py-3 px-3">मुख्य व्रत / त्योहार</th>
                <th className="py-3 px-3">राहुकाल (अशुभ)</th>
                <th className="py-3 px-3">यमगण्ड (अशुभ)</th>
                <th className="py-3 px-3">गुलिक काल</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/30 text-xs">
              {tenDayPanchangList.map((dItem) => {
                const isSelectedRow =
                  dItem.year === selectedYear &&
                  dItem.month === selectedMonth &&
                  dItem.day === selectedDayData.day;
                const cleanNakshatra = dItem.nakshatra.split(' (')[0].replace(' नक्षत्र', '');
                const shortEndTime = dItem.tithiEndTime
                  .split(',')[0]
                  .replace(/प्रातः |पूर्वाह्न |दोपहर |सायं |रात्रि |मध्यरात्रि |अगले दिन /g, '')
                  .trim();
                const tithiCellText =
                  dItem.year === 2026 && dItem.month === 10 && dItem.day === 27
                    ? 'कृष्ण प्रतिपदा (06:40 AM तक), फिर द्वितीया'
                    : dItem.year === 2026 && dItem.month === 10 && dItem.day === 28
                    ? 'कृष्ण तृतीया (रातभर / 04:50 AM तक)'
                    : `${dItem.tithiShort} (${shortEndTime})`;
                const festivalCellText =
                  dItem.festivalName ||
                  (dItem.year === 2026 && dItem.month === 10 && dItem.day === 24
                    ? 'शनि प्रदोष (तिथि अनुसार)'
                    : dItem.year === 2026 && dItem.month === 10 && dItem.day === 28
                    ? 'तृतीया व्रत'
                    : dItem.year === 2026 && dItem.month === 10 && dItem.day === 30
                    ? 'पंचमी तिथि'
                    : `${dItem.tithiShort} तिथि`);
                const stripTimePrefix = /सुबह |प्रातः |पूर्वाह्न |दोपहर |सायं |शाम |रात्रि |मध्यरात्रि /g;
                return (
                  <tr
                    key={`${dItem.year}-${dItem.month}-${dItem.day}`}
                    onClick={() => handleSelectDay(dItem)}
                    className={`cursor-pointer transition-colors ${
                      isSelectedRow
                        ? 'bg-amber-900/40 text-amber-100 font-semibold'
                        : 'hover:bg-slate-900/80 text-slate-200'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-extrabold text-amber-200 whitespace-nowrap">
                      {String(dItem.day).padStart(2, '0')} {HINDI_GREGORIAN_MONTHS[dItem.month - 1]}
                      {dItem.isToday && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[9px] font-black">
                          आज
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 text-amber-100 whitespace-nowrap">{dItem.vaarHindi}</td>
                    <td className="py-2.5 px-3 text-yellow-200 font-bold whitespace-nowrap">
                      {tithiCellText}
                    </td>
                    <td className="py-2.5 px-3 text-amber-100 whitespace-nowrap">
                      {cleanNakshatra}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-300 whitespace-nowrap">
                      {festivalCellText}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-rose-300 whitespace-nowrap">
                      <span className="text-[10px] text-rose-400/80 mr-1">({dItem.rahuKaalPart}वां)</span>
                      {dItem.rahuKaal.replace(stripTimePrefix, '')}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-orange-300 whitespace-nowrap">
                      <span className="text-[10px] text-orange-400/80 mr-1">({dItem.yamagandamPart}वां)</span>
                      {dItem.yamagandam.replace(stripTimePrefix, '')}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-200 whitespace-nowrap">
                      <span className="text-[10px] text-amber-400/80 mr-1">({dItem.gulikaKaalPart}वां)</span>
                      {dItem.gulikaKaal.replace(stripTimePrefix, '')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Shastra Rule Box: How Yamagandam, Gulika Kaal & Rahu Kaal are Calculated Across All 7 Weekdays */}
        <div className="p-4 rounded-2xl bg-slate-950/95 border border-amber-600/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-800/40 pb-2.5">
            <div>
              <h4 className="text-sm sm:text-base font-extrabold font-vedic text-yellow-300">
                📐 अष्टमांश (8 बराबर भाग) नियम: राहुकाल, यमगण्ड एवं गुलिक काल की शास्त्रीय गणना ({selectedDayData.formattedDateHindi} • {selectedDayData.vaarHindi})
              </h4>
              <p className="text-[11px] text-amber-200/85 mt-0.5">
                नियम: सूर्योदय ({selectedDayData.sunrise}) से सूर्यास्त ({selectedDayData.sunset}) तक के कुल दिनमान (<strong>{selectedDayData.dinamanaFormatted}</strong>) को 8 बराबर भागों (अष्टमांश) में बांटा जाता है। प्रत्येक भाग = <strong>{selectedDayData.ashtamaamsaDurationFormatted}</strong>।
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-amber-800/40">
            <table className="w-full text-left border-collapse min-w-[680px] text-xs">
              <thead>
                <tr className="bg-amber-950/70 text-yellow-300 font-extrabold border-b border-amber-700/40">
                  <th className="py-2 px-3">वार (दिन)</th>
                  <th className="py-2 px-3">राहुकाल (अष्टमांश भाग)</th>
                  <th className="py-2 px-3">यमगण्ड (अष्टमांश भाग)</th>
                  <th className="py-2 px-3">गुलिक काल / मांदी (अष्टमांश भाग)</th>
                  <th className="py-2 px-3">{selectedDayData.formattedDateHindi} के दिनमान अनुसार समय</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/25">
                {[
                  { w: 0, name: 'रविवार (सूर्य)', r: 8, y: 5, g: 7 },
                  { w: 1, name: 'सोमवार (चंद्र)', r: 2, y: 4, g: 6 },
                  { w: 2, name: 'मंगलवार (मंगल)', r: 7, y: 3, g: 5 },
                  { w: 3, name: 'बुधवार (बुध)', r: 5, y: 2, g: 4 },
                  { w: 4, name: 'गुरुवार (बृहस्पति)', r: 6, y: 1, g: 3 },
                  { w: 5, name: 'शुक्रवार (शुक्र)', r: 4, y: 7, g: 2 },
                  { w: 6, name: 'शनिवार (शनि)', r: 3, y: 6, g: 1 },
                ].map((row) => {
                  const isActiveVaar = selectedDayData.weekdayIndex === row.w;
                  const rSlot = selectedDayData.dayChoghadiya[row.r - 1]?.time || '';
                  const ySlot = selectedDayData.dayChoghadiya[row.y - 1]?.time || '';
                  const gSlot = selectedDayData.dayChoghadiya[row.g - 1]?.time || '';
                  const stripP = /सुबह |प्रातः |पूर्वाह्न |दोपहर |सायं |शाम |रात्रि |मध्यरात्रि /g;
                  return (
                    <tr
                      key={row.w}
                      className={
                        isActiveVaar
                          ? 'bg-amber-500/20 text-yellow-200 font-extrabold'
                          : 'text-slate-300 hover:bg-slate-900/60'
                      }
                    >
                      <td className="py-2 px-3 whitespace-nowrap">
                        {row.name}
                        {isActiveVaar && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black">
                            चयनित वार
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-rose-300 whitespace-nowrap">
                        {row.r}वां भाग ({rSlot.replace(stripP, '')})
                      </td>
                      <td className="py-2 px-3 text-orange-300 whitespace-nowrap">
                        {row.y}वां भाग ({ySlot.replace(stripP, '')})
                      </td>
                      <td className="py-2 px-3 text-amber-200 whitespace-nowrap">
                        {row.g}वां भाग ({gSlot.replace(stripP, '')})
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-emerald-300 whitespace-nowrap">
                        राहु: भाग {row.r} | यम: भाग {row.y} | गुलिक: भाग {row.g}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 10-Day Detailed Day-by-Day Panchang Cards */}
        <div className="space-y-3">
          <h4 className="text-base sm:text-lg font-extrabold font-vedic text-yellow-300 flex items-center gap-2">
            <span>📜 10 दिनों का विस्तृत पंचांग (Day-by-Day Detailed Panchang)</span>
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {tenDayPanchangList.map((dItem, idx) => {
              const isSelectedCard =
                dItem.year === selectedYear &&
                dItem.month === selectedMonth &&
                dItem.day === selectedDayData.day;
              return (
                <div
                  key={`detail-${dItem.year}-${dItem.month}-${dItem.day}`}
                  onClick={() => handleSelectDay(dItem)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelectedCard
                      ? 'bg-gradient-to-br from-amber-950/70 via-slate-900 to-slate-950 border-yellow-400 shadow-lg'
                      : 'bg-slate-950/85 hover:bg-slate-900/90 border-amber-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-amber-800/35 pb-2">
                    <h5 className="text-sm sm:text-base font-extrabold font-vedic text-yellow-300">
                      {idx + 1}. {dItem.formattedDateHindi} ({dItem.vaarHindi})
                    </h5>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-200">
                      {dItem.hinduMaas} • {dItem.paksha}
                    </span>
                  </div>

                  <ul className="space-y-1 text-xs text-slate-200 leading-relaxed list-disc list-inside">
                    <li>
                      <strong className="text-amber-300">तिथि:</strong> {dItem.tithiName} ({dItem.tithiEndTime})
                    </li>
                    <li>
                      <strong className="text-amber-300">नक्षत्र:</strong> {dItem.nakshatra} ({dItem.nakshatraEndTime})
                    </li>
                    <li>
                      <strong className="text-amber-300">योग:</strong> {dItem.yoga} ({dItem.yogaEndTime})
                    </li>
                    <li>
                      <strong className="text-amber-300">करण:</strong> {dItem.karana} ({dItem.karanaEndTime})
                    </li>
                    <li>
                      <strong className="text-amber-300">राशि:</strong> चंद्रमा {dItem.chandraRashi} | सूर्य: {dItem.suryaRashi}
                    </li>
                    <li>
                      <strong className="text-amber-300">सूर्योदय / सूर्यास्त:</strong> {dItem.sunrise} / {dItem.sunset} | <strong className="text-sky-300">चंद्रोदय:</strong> {dItem.moonrise}
                    </li>
                    <li>
                      <strong className="text-emerald-300">अभिजित मुहूर्त (शुभ):</strong> {dItem.abhijitMuhurat} | <strong className="text-rose-300">राहुकाल (अशुभ):</strong> {dItem.rahuKaal}
                    </li>
                    <li>
                      <strong className="text-rose-300">यमगण्ड (अशुभ):</strong> {dItem.yamagandam} | <strong className="text-amber-300">गुलिक काल:</strong> {dItem.gulikaKaal}
                    </li>
                    {dItem.festivalName && (
                      <li className="text-yellow-200 font-semibold">
                        <strong className="text-yellow-400">विशेष पर्व / व्रत:</strong> {dItem.festivalName} — {dItem.festivalDescription}
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================== 4. COMPLETE MONTHLY FESTIVALS & VRAT TIMELINE ==================== */}
      <div className="bg-[#0e1526] border border-amber-700/40 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="border-b border-amber-800/40 pb-3">
          <h3 className="text-lg sm:text-2xl font-extrabold font-vedic text-amber-100">
            🪔 {monthlyData.monthNameHindi} {monthlyData.year} के प्रमुख व्रत, महापर्व एवं एकादशी-पूर्णिमा सूची
          </h3>
          <p className="text-xs text-amber-300/80 mt-0.5">
            किसी भी पर्व पर क्लिक करके उस दिन का सम्पूर्ण पंचांग, शुभ पूजा मुहूर्त एवं मंत्र ऊपर देखें
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {monthlyData.festivalsInMonth.map((festDay) => {
            const isSelected = festDay.day === selectedDayData.day;
            return (
              <div
                key={festDay.day}
                onClick={() => handleSelectDay(festDay)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-900/50 to-red-950/50 border-yellow-400 shadow-lg'
                    : 'bg-slate-950/80 hover:bg-slate-900 border-amber-800/40'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-900 to-amber-900 border border-amber-400/50 flex flex-col items-center justify-center flex-shrink-0 text-amber-100">
                  <span className="text-base font-black font-mono leading-none">{festDay.day}</span>
                  <span className="text-[9px] font-bold mt-0.5">{festDay.vaarShort}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      {festDay.tithiShort}
                    </span>
                    {festDay.isToday && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                        आज
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold font-vedic text-yellow-200 mt-1 leading-snug">
                    {festDay.festivalName}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    आराध्य: {festDay.festivalDeity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
