import React, { useState, useEffect, useMemo } from 'react';
import {
  calculateKundaliMilan,
  KundaliMilanResult,
  getVedicDetailsFromName,
  VEDIC_RASHIS,
  VEDIC_NAKSHATRAS,
} from '../utils/kundaliMilan';
import { generateSampurnKundali, KundaliChartHouse } from '../utils/sampurnKundali';
import { KundaliMilanHistoryItem, UserMobileAccount } from '../types';
import { getWhatsAppLink } from '../config/brand';
import { PanditPortrait } from './PanditPortrait';
import {
  HeartHandshake,
  Sparkles,
  User,
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Copy,
  Check,
  ShieldCheck,
  History,
  Compass,
} from 'lucide-react';

interface KundaliMilanSectionProps {
  onConsultPanditJi: (consultDetails: string) => void;
  currentUser?: UserMobileAccount | null;
  onSaveKundaliHistoryItem?: (item: KundaliMilanHistoryItem) => void;
}

const POPULAR_PLACES = [
  'रुद्रपुर, उत्तराखण्ड',
  'हल्द्वानी, उत्तराखण्ड',
  'देहरादून, उत्तराखण्ड',
  'हरिद्वार, उत्तराखण्ड',
  'नैनीताल, उत्तराखण्ड',
  'काशीपुर, उत्तराखण्ड',
  'दिल्ली (New Delhi)',
  'नोएडा / गाज़ियाबाद',
  'लखनऊ, उत्तर प्रदेश',
  'बरेली, उत्तर प्रदेश',
  'मुरादाबाद / रामपुर',
  'वाराणसी (काशी)',
  'जयपुर, राजस्थान',
  'मुंबई, महाराष्ट्र',
];

const MiniNorthIndianChart: React.FC<{
  houses: KundaliChartHouse[];
  title: string;
  subtitle: string;
  lagnaDegInt?: number;
  accentColor?: 'amber' | 'rose';
}> = ({ houses, title, subtitle, lagnaDegInt, accentColor = 'amber' }) => {
  const getHouse = (num: number) => houses.find((h) => h.houseNumber === num);

  const houseCoords: Record<
    number,
    { rashiX: number; rashiY: number; planetX: number; planetY: number; maxCols: number }
  > = {
    1: { rashiX: 200, rashiY: 168, planetX: 200, planetY: 96, maxCols: 3 },
    2: { rashiX: 100, rashiY: 78, planetX: 100, planetY: 34, maxCols: 3 },
    3: { rashiX: 74, rashiY: 100, planetX: 34, planetY: 100, maxCols: 2 },
    4: { rashiX: 166, rashiY: 200, planetX: 100, planetY: 200, maxCols: 2 },
    5: { rashiX: 74, rashiY: 300, planetX: 34, planetY: 300, maxCols: 2 },
    6: { rashiX: 100, rashiY: 324, planetX: 100, planetY: 368, maxCols: 3 },
    7: { rashiX: 200, rashiY: 234, planetX: 200, planetY: 304, maxCols: 3 },
    8: { rashiX: 300, rashiY: 324, planetX: 300, planetY: 368, maxCols: 3 },
    9: { rashiX: 326, rashiY: 300, planetX: 366, planetY: 300, maxCols: 2 },
    10: { rashiX: 234, rashiY: 200, planetX: 300, planetY: 200, maxCols: 2 },
    11: { rashiX: 326, rashiY: 100, planetX: 366, planetY: 100, maxCols: 2 },
    12: { rashiX: 300, rashiY: 78, planetX: 300, planetY: 34, maxCols: 3 },
  };

  return (
    <div className="bg-[#0b101d] border border-amber-500/40 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col items-center">
      <div className="text-center mb-2.5">
        <h4
          className={`text-sm sm:text-base font-bold font-vedic ${
            accentColor === 'rose' ? 'text-rose-200' : 'text-amber-200'
          }`}
        >
          {title}
        </h4>
        <p className="text-[11px] text-amber-300/80">{subtitle}</p>
      </div>

      <div className="w-full max-w-[310px] aspect-square bg-[#fffdf7] rounded-xl p-1.5 border-2 border-amber-600 shadow-inner">
        <svg viewBox="0 0 400 400" className="w-full h-full select-none">
          <rect
            x="6"
            y="6"
            width="388"
            height="388"
            fill="#fffcf2"
            stroke="#c2410c"
            strokeWidth="4"
            rx="4"
          />
          <line x1="6" y1="6" x2="394" y2="394" stroke="#ea580c" strokeWidth="2.2" />
          <line x1="394" y1="6" x2="6" y2="394" stroke="#ea580c" strokeWidth="2.2" />
          <polygon
            points="200,6 394,200 200,394 6,200"
            fill="none"
            stroke="#ea580c"
            strokeWidth="2.4"
          />

          {lagnaDegInt !== undefined && (
            <text
              x="200"
              y="62"
              textAnchor="middle"
              fill="#7c2d12"
              fontSize="11"
              fontWeight="800"
            >
              लग्न {String(lagnaDegInt).padStart(2, '0')}°
            </text>
          )}

          {Array.from({ length: 12 }, (_, idx) => idx + 1).map((houseNum) => {
            const h = getHouse(houseNum);
            const coords = houseCoords[houseNum];
            if (!h || !coords) return null;
            const planets = h.planets || [];
            const rows: Array<typeof planets> = [];
            for (let i = 0; i < planets.length; i += coords.maxCols) {
              rows.push(planets.slice(i, i + coords.maxCols));
            }

            return (
              <g key={houseNum}>
                <text
                  x={coords.rashiX}
                  y={coords.rashiY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#b91c1c"
                  fontSize="12.5"
                  fontWeight="800"
                >
                  {h.rashiNumber}
                </text>

                {rows.map((row, rIdx) => {
                  const totalRows = rows.length;
                  const lineOffset = (rIdx - (totalRows - 1) / 2) * 16;
                  const yPos =
                    houseNum === 1 && lagnaDegInt !== undefined
                      ? coords.planetY + 10 + lineOffset
                      : coords.planetY + lineOffset;

                  return (
                    <text
                      key={rIdx}
                      x={coords.planetX}
                      y={yPos}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#1e1b4b"
                      fontSize={planets.length > 3 ? '10.5' : '12'}
                      fontWeight="800"
                    >
                      {row.map((p, pIdx) => (
                        <tspan key={pIdx} dx={pIdx > 0 ? 4 : 0}>
                          {p.chartLabel || p.shortHindi}
                          <tspan fontSize="8.5" dy="-4" fill="#9a3412" fontWeight="700">
                            {String(p.degInt ?? 0).padStart(2, '0')}
                          </tspan>
                          <tspan dy="4"> </tspan>
                        </tspan>
                      ))}
                    </text>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export const KundaliMilanSection: React.FC<KundaliMilanSectionProps> = ({
  onConsultPanditJi: _onConsultPanditJi,
  currentUser,
  onSaveKundaliHistoryItem,
}) => {
  // Calculation Mode: 'astronomical' (by DOB + Time + Place) or 'manual' (by Rashi + Nakshatra)
  const [milanMode, setMilanMode] = useState<'astronomical' | 'manual'>('astronomical');

  // Boy form state
  const [boyName, setBoyName] = useState('शशांक शर्मा');
  const [boyDob, setBoyDob] = useState('1996-03-10');
  const [boyTime, setBoyTime] = useState('10:55');
  const [boyPlace, setBoyPlace] = useState('रुद्रपुर, उत्तराखण्ड');
  const [boyManualRashi, setBoyManualRashi] = useState(VEDIC_RASHIS[7]); // Vrishchika
  const [boyManualNakshatra, setBoyManualNakshatra] = useState(VEDIC_NAKSHATRAS[16]); // Anuradha

  // Girl form state
  const [girlName, setGirlName] = useState('प्रिया शर्मा');
  const [girlDob, setGirlDob] = useState('1998-11-15');
  const [girlTime, setGirlTime] = useState('14:15');
  const [girlPlace, setGirlPlace] = useState('रुद्रपुर, उत्तराखण्ड');
  const [girlManualRashi, setGirlManualRashi] = useState(VEDIC_RASHIS[5]); // Kanya
  const [girlManualNakshatra, setGirlManualNakshatra] = useState(VEDIC_NAKSHATRAS[12]); // Hasta

  const [milanResult, setMilanResult] = useState<KundaliMilanResult | null>(null);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(true);
  const [copiedReport, setCopiedReport] = useState(false);

  const [localHistory, setLocalHistory] = useState<KundaliMilanHistoryItem[]>(() => {
    if (currentUser?.kundaliHistory && currentUser.kundaliHistory.length > 0) {
      return currentUser.kundaliHistory;
    }
    try {
      const saved = localStorage.getItem('panditji_kundali_history_guest');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    if (currentUser?.kundaliHistory) {
      setLocalHistory(currentUser.kundaliHistory);
    }
  }, [currentUser?.phone, currentUser?.kundaliHistory]);

  // Live astronomical Kundali preview for Boy & Girl based on DOB, Time & Place
  const liveBoyKundali = useMemo(() => {
    if (milanMode !== 'astronomical' || !boyDob) return null;
    try {
      return generateSampurnKundali(
        boyName || 'वर',
        boyDob,
        boyTime || '12:00',
        boyPlace || 'रुद्रपुर, उत्तराखण्ड'
      );
    } catch {
      return null;
    }
  }, [milanMode, boyName, boyDob, boyTime, boyPlace]);

  const liveGirlKundali = useMemo(() => {
    if (milanMode !== 'astronomical' || !girlDob) return null;
    try {
      return generateSampurnKundali(
        girlName || 'कन्या',
        girlDob,
        girlTime || '12:00',
        girlPlace || 'रुद्रपुर, उत्तराखण्ड'
      );
    } catch {
      return null;
    }
  }, [milanMode, girlName, girlDob, girlTime, girlPlace]);

  const boyNameFallback = getVedicDetailsFromName(boyName);
  const girlNameFallback = getVedicDetailsFromName(girlName);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boyName.trim() || !girlName.trim()) return;

    const useAstro = milanMode === 'astronomical' && Boolean(boyDob) && Boolean(girlDob);

    const result = calculateKundaliMilan(
      boyName.trim(),
      girlName.trim(),
      useAstro ? liveBoyKundali?.panchang.moonRashiName : boyManualRashi,
      useAstro ? liveGirlKundali?.panchang.moonRashiName : girlManualRashi,
      useAstro ? liveBoyKundali?.panchang.nakshatraName : boyManualNakshatra,
      useAstro ? liveGirlKundali?.panchang.nakshatraName : girlManualNakshatra,
      boyDob,
      boyTime,
      girlDob,
      girlTime,
      boyPlace,
      girlPlace,
      useAstro
    );
    setMilanResult(result);

    const historyItem: KundaliMilanHistoryItem = {
      id: `milan-${Date.now()}`,
      boyName: boyName.trim(),
      boyDob,
      boyTime,
      boyRashi: result.boyRashi,
      boyNakshatra: result.boyNakshatra,
      girlName: girlName.trim(),
      girlDob,
      girlTime,
      girlRashi: result.girlRashi,
      girlNakshatra: result.girlNakshatra,
      totalScore: result.totalScore,
      compatibilityPercentage: result.compatibilityPercentage,
      overallVerdict: result.overallVerdict,
      timestamp: new Date().toLocaleString('hi-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const nextHist = [historyItem, ...localHistory.slice(0, 19)];
    setLocalHistory(nextHist);
    try {
      localStorage.setItem('panditji_kundali_history_guest', JSON.stringify(nextHist));
    } catch {
      // ignore
    }
    if (onSaveKundaliHistoryItem) {
      onSaveKundaliHistoryItem(historyItem);
    }
  };

  const getWhatsAppMilanText = () => {
    if (!milanResult) return '';
    return `*पण्डित जी ऑनलाइन - खगोलीय अष्टकूट कुंडली मिलान परामर्श*
----------------------------------------
*वर (Boy):* ${milanResult.boyName} | DOB: ${boyDob || '-'} | समय: ${boyTime || '-'} | स्थान: ${boyPlace}
• लग्न: ${milanResult.boyLagna} | चन्द्र राशि: ${milanResult.boyRashi} | नक्षत्र: ${milanResult.boyNakshatra} (चरण ${milanResult.boyPada})
*कन्या (Girl):* ${milanResult.girlName} | DOB: ${girlDob || '-'} | समय: ${girlTime || '-'} | स्थान: ${girlPlace}
• लग्न: ${milanResult.girlLagna} | चन्द्र राशि: ${milanResult.girlRashi} | नक्षत्र: ${milanResult.girlNakshatra} (चरण ${milanResult.girlPada})
----------------------------------------
*कुल अष्टकूट गुण मिलान:* ${milanResult.totalScore} / 36 गुण (${milanResult.compatibilityPercentage}%)
*मांगलिक विचार:* ${milanResult.manglikStatus.description}
*निष्कर्ष:* ${milanResult.overallVerdict}
----------------------------------------
राधे राधे पण्डित शशांक शर्मा जी! कृपया हमारे इस कुंडली मिलान का विस्तृत शास्त्रोक्त विश्लेषण एवं विवाह परामर्श प्रदान करें।`;
  };

  const copyReport = () => {
    if (!milanResult) return;
    const text = `अष्टकूट कुंडली मिलान पत्रक - पण्डित जी ऑनलाइन
वर: ${milanResult.boyName} (DOB: ${boyDob || '-'}, समय: ${boyTime || '-'}, लग्न: ${milanResult.boyLagna}, चन्द्र राशि: ${milanResult.boyRashi}, नक्षत्र: ${milanResult.boyNakshatra} चरण ${milanResult.boyPada})
कन्या: ${milanResult.girlName} (DOB: ${girlDob || '-'}, समय: ${girlTime || '-'}, लग्न: ${milanResult.girlLagna}, चन्द्र राशि: ${milanResult.girlRashi}, नक्षत्र: ${milanResult.girlNakshatra} चरण ${milanResult.girlPada})
अष्टकूट गुण मिलान: ${milanResult.totalScore} / 36 गुण (${milanResult.overallVerdict})
मांगलिक विचार: ${milanResult.manglikStatus.description}
आचार्य: पण्डित शशांक शर्मा (रुद्रपुर) • मो: 7017279043`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <section className="w-full max-w-full overflow-x-hidden space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#191109] to-[#0f172a] border border-amber-600/40 p-4 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left min-w-0">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-slate-950 shadow-xl flex-shrink-0">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-1 border border-amber-500/40">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>लहिरी चित्रापक्ष पंचांग एवं ग्रह गणना आधारित सटीक अष्टकूट मिलान</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-vedic text-amber-100">
                वर-कन्या 36 गुण एवं ग्रह कुंडली मिलान
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-2xl">
                वर एवं कन्या की <b>जन्म तिथि, जन्म समय और जन्म स्थान</b> से वास्तविक खगोलीय{' '}
                <b>चन्द्र राशि, जन्म नक्षत्र (चरण), लग्न कुंडली, नवग्रह स्थिति एवं मांगलिक दोष</b> की सटीक गणना।
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
            <span className="text-xs text-amber-300 font-semibold bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-700/40">
              विस्तृत परामर्श: <span className="line-through text-slate-400 font-mono">₹1,000</span>{' '}
              <span className="text-emerald-400 font-bold font-mono">मात्र ₹100</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="bg-[#0e1424] border border-amber-900/40 rounded-2xl p-4 sm:p-7 shadow-xl overflow-hidden space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold text-amber-200">
              कुंडली मिलान की गणना विधि चुनें:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMilanMode('astronomical')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                milanMode === 'astronomical'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-amber-200/80 border border-amber-800/40 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>जन्म तिथि, समय व स्थान से (पंचांग ग्रह गणना)</span>
            </button>
            <button
              type="button"
              onClick={() => setMilanMode('manual')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                milanMode === 'manual'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-amber-200/80 border border-amber-800/40 hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>राशि व नक्षत्र चुनकर (बिना जन्म समय)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* ==================== BOY DETAILS CARD ==================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-900/40 space-y-4 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-base font-bold font-vedic text-amber-200 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>वर का विवरण (लड़का / Boy)</span>
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-medium">
                  वर पत्रिका
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                  लड़के का नाम (Boy's Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. शशांक शर्मा, राहुल..."
                  value={boyName}
                  onChange={(e) => setBoyName(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-900/60 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {milanMode === 'astronomical' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>जन्म तिथि (Date of Birth) *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={boyDob}
                        onChange={(e) => setBoyDob(e.target.value)}
                        className="w-full bg-slate-950 border border-amber-900/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>जन्म समय (Time of Birth) *</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={boyTime}
                        onChange={(e) => setBoyTime(e.target.value)}
                        className="w-full bg-slate-950 border border-amber-900/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>जन्म स्थान (शहर / गाँव का नाम लिखें)</span>
                    </label>
                    <input
                      type="text"
                      list="kundali-milan-places"
                      value={boyPlace}
                      onChange={(e) => setBoyPlace(e.target.value)}
                      placeholder="अपना जन्म स्थान लिखें (जैसे: रुद्रपुर, हल्द्वानी, बरेली, दिल्ली...)"
                      className="w-full bg-slate-950 border border-amber-900/60 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Live Astronomical Preview for Boy */}
                  {liveBoyKundali && (
                    <div className="p-3 rounded-xl bg-amber-950/35 border border-amber-600/40 text-xs space-y-1.5">
                      <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>खगोलीय पंचांग से प्राप्त वर की ग्रह स्थिति:</span>
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-amber-100">
                        <div className="bg-slate-950/90 px-2.5 py-1.5 rounded-lg border border-amber-800/40">
                          <span className="text-slate-400 block text-[10px]">लग्न (Ascendant):</span>
                          <b className="text-amber-300">{liveBoyKundali.panchang.lagnaName}</b>
                        </div>
                        <div className="bg-slate-950/90 px-2.5 py-1.5 rounded-lg border border-amber-800/40">
                          <span className="text-slate-400 block text-[10px]">चन्द्र राशि (Janma Rashi):</span>
                          <b className="text-amber-300">{liveBoyKundali.panchang.moonRashiName}</b>
                        </div>
                        <div className="bg-slate-950/90 px-2.5 py-1.5 rounded-lg border border-amber-800/40">
                          <span className="text-slate-400 block text-[10px]">जन्म नक्षत्र एवं चरण:</span>
                          <b className="text-amber-200">
                            {liveBoyKundali.panchang.nakshatraName.split(' ')[0]} (चरण{' '}
                            {liveBoyKundali.panchang.nakshatraPada})
                          </b>
                        </div>
                        <div className="bg-slate-950/90 px-2.5 py-1.5 rounded-lg border border-amber-800/40">
                          <span className="text-slate-400 block text-[10px]">मांगलिक स्थिति:</span>
                          <b
                            className={
                              liveBoyKundali.doshaAnalysis.manglik.isManglik
                                ? 'text-rose-300'
                                : 'text-emerald-300'
                            }
                          >
                            {liveBoyKundali.doshaAnalysis.manglik.severity}
                          </b>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      वर की चन्द्र राशि चुनें:
                    </label>
                    <select
                      value={boyManualRashi}
                      onChange={(e) => setBoyManualRashi(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-900/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                    >
                      {VEDIC_RASHIS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      वर का जन्म नक्षत्र चुनें:
                    </label>
                    <select
                      value={boyManualNakshatra}
                      onChange={(e) => setBoyManualNakshatra(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-900/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                    >
                      {VEDIC_NAKSHATRAS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBoyManualRashi(boyNameFallback.rashi);
                      setBoyManualNakshatra(boyNameFallback.nakshatra);
                    }}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    नाम अक्षर ({boyNameFallback.initialLetter}) से स्वतः राशि/नक्षत्र भरें →
                  </button>
                </div>
              )}
            </div>

            {/* ==================== GIRL DETAILS CARD ==================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-900/40 space-y-4 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-base font-bold font-vedic text-rose-200 flex items-center gap-2">
                  <User className="w-4 h-4 text-rose-400" />
                  <span>कन्या का विवरण (लड़की / Girl)</span>
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 font-medium">
                  कन्या पत्रिका
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                  लड़की का नाम (Girl's Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. प्रिया शर्मा, अंजलि..."
                  value={girlName}
                  onChange={(e) => setGirlName(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-900/60 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {milanMode === 'astronomical' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        <span>जन्म तिथि (Date of Birth) *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={girlDob}
                        onChange={(e) => setGirlDob(e.target.value)}
                        className="w-full bg-slate-950 border border-amber-900/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-400" />
                        <span>जन्म समय (Time of Birth) *</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={girlTime}
                        onChange={(e) => setGirlTime(e.target.value)}
                        className="w-full bg-slate-950 border border-amber-900/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>जन्म स्थान (शहर / गाँव का नाम लिखें)</span>
                    </label>
                    <input
                      type="text"
                      list="kundali-milan-places"
                      value={girlPlace}
                      onChange={(e) => setGirlPlace(e.target.value)}
                      placeholder="कन्या का जन्म स्थान लिखें (जैसे: रुद्रपुर, हल्द्वानी, बरेली, दिल्ली...)"
                      className="w-full bg-slate-950 border border-amber-900/60 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Live Astronomical Preview for Girl */}
                  {liveGirlKundali && (
                    <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-500/35 text-xs space-y-1.5">
                      <span className="text-[11px] text-rose-300 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>खगोलीय पंचांग से प्राप्त कन्या की ग्रह स्थिति:</span>
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-amber-100">
                        <div className="bg-slate-950/90 px-2.5 py-1.5 rounded-lg border border-rose-800/40">
                          <span className="text-slate-400 block text-[10px]">लग्न (Ascendant):</span>
                          <b className="text-rose-300">{liveGirlKundali.panchang.lagnaName}</b>
                        </div>
                        <div className="bg-slate-950/90 px-2.5 py-1.5 rounded-lg border border-rose-800/40">
                          <span className="text-slate-400 block text-[10px]">चन्द्र राशि (Janma Rashi):</span>
                          <b className="text-rose-300">{liveGirlKundali.panchang.moonRashiName}</b>
                        </div>
                        <div className="bg-slate-950/90 px-2.5 py-1.5 rounded-lg border border-rose-800/40">
                          <span className="text-slate-400 block text-[10px]">जन्म नक्षत्र एवं चरण:</span>
                          <b className="text-amber-200">
                            {liveGirlKundali.panchang.nakshatraName.split(' ')[0]} (चरण{' '}
                            {liveGirlKundali.panchang.nakshatraPada})
                          </b>
                        </div>
                        <div className="bg-slate-950/90 px-2.5 py-1.5 rounded-lg border border-rose-800/40">
                          <span className="text-slate-400 block text-[10px]">मांगलिक स्थिति:</span>
                          <b
                            className={
                              liveGirlKundali.doshaAnalysis.manglik.isManglik
                                ? 'text-rose-300'
                                : 'text-emerald-300'
                            }
                          >
                            {liveGirlKundali.doshaAnalysis.manglik.severity}
                          </b>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      कन्या की चन्द्र राशि चुनें:
                    </label>
                    <select
                      value={girlManualRashi}
                      onChange={(e) => setGirlManualRashi(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-900/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                    >
                      {VEDIC_RASHIS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      कन्या का जन्म नक्षत्र चुनें:
                    </label>
                    <select
                      value={girlManualNakshatra}
                      onChange={(e) => setGirlManualNakshatra(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-900/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                    >
                      {VEDIC_NAKSHATRAS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGirlManualRashi(girlNameFallback.rashi);
                      setGirlManualNakshatra(girlNameFallback.nakshatra);
                    }}
                    className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                  >
                    नाम अक्षर ({girlNameFallback.initialLetter}) से स्वतः राशि/नक्षत्र भरें →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-amber-900/40">
            <div className="text-xs text-amber-300/80">
              वर: <b>{boyName || '...'}</b> (
              {milanMode === 'astronomical' && liveBoyKundali
                ? `${liveBoyKundali.panchang.moonRashiName.split(' ')[0]} • ${liveBoyKundali.panchang.nakshatraName.split(' ')[0]}`
                : boyManualRashi.split(' ')[0]}
              ) + कन्या: <b>{girlName || '...'}</b> (
              {milanMode === 'astronomical' && liveGirlKundali
                ? `${liveGirlKundali.panchang.moonRashiName.split(' ')[0]} • ${liveGirlKundali.panchang.nakshatraName.split(' ')[0]}`
                : girlManualRashi.split(' ')[0]}
              )
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              <span>सटीक 36 गुण एवं ग्रह मिलान देखें</span>
            </button>
          </div>

          <datalist id="kundali-milan-places">
            {POPULAR_PLACES.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </form>
      </div>

      {/* ==================== RESULTS SECTION ==================== */}
      {milanResult && (
        <div className="space-y-6 animate-slideUp">
          {/* Main Score Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1b120c] to-[#0c1220] border-2 border-amber-500/60 p-4 sm:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Score Dial & Badge */}
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 min-w-0">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-amber-500 flex flex-col items-center justify-center bg-slate-950/80 shadow-inner flex-shrink-0">
                  <span className="text-3xl sm:text-4xl font-extrabold text-gold-gradient font-mono">
                    {milanResult.totalScore}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">/ 36 गुण</span>
                  <span className="text-[10px] text-amber-400 font-semibold mt-0.5">
                    {milanResult.compatibilityPercentage}% अनुकूल
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {milanResult.overallVerdict}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold font-vedic text-amber-100 mt-2">
                    {milanResult.boyName} &amp; {milanResult.girlName}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-800/40 text-amber-200 text-left">
                      <span className="text-amber-400 font-bold block">
                        वर: {milanResult.boyName}
                      </span>
                      <span>
                        लग्न: <b>{milanResult.boyLagna}</b> • चन्द्र राशि:{' '}
                        <b>{milanResult.boyRashi}</b>
                      </span>
                      <span className="block text-slate-300">
                        नक्षत्र: <b>{milanResult.boyNakshatra}</b> (चरण {milanResult.boyPada})
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-800/40 text-rose-200 text-left">
                      <span className="text-rose-400 font-bold block">
                        कन्या: {milanResult.girlName}
                      </span>
                      <span>
                        लग्न: <b>{milanResult.girlLagna}</b> • चन्द्र राशि:{' '}
                        <b>{milanResult.girlRashi}</b>
                      </span>
                      <span className="block text-slate-300">
                        नक्षत्र: <b>{milanResult.girlNakshatra}</b> (चरण {milanResult.girlPada})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-amber-200/90 mt-2.5 max-w-xl leading-relaxed">
                    {milanResult.verdictDescription}
                  </p>
                </div>
              </div>

              {/* Action Buttons: WhatsApp & Copy */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto min-w-[220px]">
                <a
                  href={getWhatsAppLink(getWhatsAppMilanText())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-slate-950" />
                  <span>पण्डित जी से परामर्श (मात्र ₹100)</span>
                </a>

                <button
                  onClick={copyReport}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  {copiedReport ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copiedReport ? 'रिपोर्ट कॉपी हो गई!' : 'मिलान पत्रक कॉपी करें'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Side-by-Side Boy & Girl Lagna Kundali Charts (when astronomical Kundalis exist) */}
          {milanResult.boyKundali && milanResult.girlKundali && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <MiniNorthIndianChart
                houses={milanResult.boyKundali.lagnaChart}
                title={`वर की लग्न कुंडली (${milanResult.boyName})`}
                subtitle={`लग्न: ${milanResult.boyKundali.panchang.lagnaName} (${milanResult.boyKundali.panchang.lagnaDegreeDMS}) • राशि: ${milanResult.boyRashi}`}
                lagnaDegInt={milanResult.boyKundali.panchang.lagnaDegInt}
                accentColor="amber"
              />
              <MiniNorthIndianChart
                houses={milanResult.girlKundali.lagnaChart}
                title={`कन्या की लग्न कुंडली (${milanResult.girlName})`}
                subtitle={`लग्न: ${milanResult.girlKundali.panchang.lagnaName} (${milanResult.girlKundali.panchang.lagnaDegreeDMS}) • राशि: ${milanResult.girlRashi}`}
                lagnaDegInt={milanResult.girlKundali.panchang.lagnaDegInt}
                accentColor="rose"
              />
            </div>
          )}

          {/* Manglik & Planetary Harmony Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-900/40 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                मांगलिक एवं कुज दोष विचार (Manglik Assessment)
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded bg-slate-950 border border-amber-800/40 text-amber-200">
                  वर: <b>{milanResult.manglikStatus.boySeverity}</b> (लग्न से{' '}
                  {milanResult.manglikStatus.boyMarsHouseLagna}वां, चन्द्र से{' '}
                  {milanResult.manglikStatus.boyMarsHouseMoon}वां भाव)
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-950 border border-rose-800/40 text-rose-200">
                  कन्या: <b>{milanResult.manglikStatus.girlSeverity}</b> (लग्न से{' '}
                  {milanResult.manglikStatus.girlMarsHouseLagna}वां, चन्द्र से{' '}
                  {milanResult.manglikStatus.girlMarsHouseMoon}वां भाव)
                </span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                {milanResult.manglikStatus.description}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-900/40 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                ग्रह मैत्री, सप्तम भाव एवं गुरु-शुक्र बल
              </span>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                • {milanResult.planetaryHarmony.rashiLordRelation}
              </p>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                • {milanResult.planetaryHarmony.seventhHouseSummary}
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                • {milanResult.planetaryHarmony.jupiterVenusSummary}
              </p>
            </div>
          </div>

          {/* Ashta-Koot Detailed Table */}
          <div className="bg-[#0e1424] border border-amber-900/40 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-5 py-4 bg-slate-950 border-b border-amber-900/30 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold font-vedic text-amber-100">
                  अष्टकूट 36 गुणों की प्रमाणिक सारणी (Ashtakoot Guna Table)
                </h4>
                <p className="text-xs text-slate-400">
                  बृहत् पाराशर होरा शास्त्र एवं मुहूर्त चिंतामणि के अनुसार वर-कन्या के प्रत्येक कूट का तुलनात्मक अंक
                </p>
              </div>
              <button
                onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <span>{showAdvancedDetails ? 'संक्षिप्त देखें' : 'विस्तार से देखें'}</span>
                {showAdvancedDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-amber-300/80 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">कूट का नाम</th>
                    <th className="px-4 py-3">वर ({milanResult.boyName})</th>
                    <th className="px-4 py-3">कन्या ({milanResult.girlName})</th>
                    <th className="px-4 py-3">प्राप्त / कुल गुण</th>
                    <th className="px-4 py-3">शास्त्रोक्त फल एवं परिहार विचार</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {milanResult.koots.map((koot, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-amber-200 whitespace-nowrap">
                        {koot.hindiName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {koot.meaning}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-amber-100 font-semibold whitespace-nowrap">
                        {koot.boyValue}
                      </td>

                      <td className="px-4 py-3.5 text-rose-200 font-semibold whitespace-nowrap">
                        {koot.girlValue}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-sm whitespace-nowrap">
                        <span className="font-extrabold text-amber-400">{koot.obtainedPoints}</span>
                        <span className="text-slate-500 text-xs"> / {koot.maxPoints}</span>
                      </td>

                      <td className="px-4 py-3.5 min-w-[240px]">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                            koot.status === 'favorable'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : koot.status === 'moderate'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {koot.status === 'favorable'
                            ? '✓ शुभ / अनुकूल'
                            : koot.status === 'moderate'
                            ? '⚡ मध्यम / परिहार युक्त'
                            : '⚠ दोष विचारणीय'}
                        </span>
                        {showAdvancedDetails && (
                          <>
                            <p className="text-[11px] text-slate-300 mt-1">{koot.verdict}</p>
                            {koot.remedy && (
                              <span className="text-[10px] text-amber-400 block mt-0.5 italic">
                                उपाय: {koot.remedy}
                              </span>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-amber-950/40 font-bold border-t-2 border-amber-600/50">
                    <td className="px-4 py-3.5 text-amber-200" colSpan={3}>
                      कुल अष्टकूट गुण योग (Total Ashtakoot Gunas)
                    </td>
                    <td className="px-4 py-3.5 font-mono text-base text-yellow-400">
                      {milanResult.totalScore} / 36
                    </td>
                    <td className="px-4 py-3.5 text-amber-200 text-xs">
                      {milanResult.overallVerdict} ({milanResult.compatibilityPercentage}%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 9 Planets Comparison Table (when both Kundalis are calculated) */}
            {milanResult.boyKundali && milanResult.girlKundali && (
              <div className="border-t border-amber-900/40 p-4 sm:p-5 bg-slate-950/60 space-y-3">
                <h5 className="text-sm font-bold font-vedic text-amber-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>
                    वर एवं कन्या की नवग्रह स्पष्ट स्थिति तुलना (9 Planets Sidereal Comparison)
                  </span>
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-slate-900 text-amber-300/90 text-[10px] uppercase">
                      <tr>
                        <th className="px-3 py-2">ग्रह (Planet)</th>
                        <th className="px-3 py-2">
                          वर ({milanResult.boyName}) — राशि, अंश व भाव
                        </th>
                        <th className="px-3 py-2">
                          कन्या ({milanResult.girlName}) — राशि, अंश व भाव
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {milanResult.boyKundali.planets.map((bp, idx) => {
                        const gp = milanResult.girlKundali?.planets[idx];
                        return (
                          <tr key={bp.id} className="hover:bg-slate-900/40">
                            <td className="px-3 py-2 font-bold text-amber-200 whitespace-nowrap">
                              {bp.symbol} {bp.hindiName}
                            </td>
                            <td className="px-3 py-2 text-amber-100">
                              <b>{bp.rashiName.split(' ')[0]}</b> ({bp.fullDegreeDMS}) •{' '}
                              <span className="text-amber-300">{bp.houseInLagna}वां भाव</span> •{' '}
                              <span className="text-slate-400">
                                {bp.nakshatra.split(' ')[0]} (च.{bp.pada})
                              </span>
                            </td>
                            <td className="px-3 py-2 text-rose-100">
                              {gp ? (
                                <>
                                  <b>{gp.rashiName.split(' ')[0]}</b> ({gp.fullDegreeDMS}) •{' '}
                                  <span className="text-rose-300">{gp.houseInLagna}वां भाव</span> •{' '}
                                  <span className="text-slate-400">
                                    {gp.nakshatra.split(' ')[0]} (च.{gp.pada})
                                  </span>
                                </>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pandit Shashank Sharma Advice Footer */}
            <div className="p-4 bg-amber-950/30 border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <PanditPortrait size="sm" showBadge={false} />
                <div className="text-xs">
                  <span className="font-bold text-amber-200 block">
                    पण्डित शशांक शर्मा जी का परामर्श:
                  </span>
                  <p className="text-slate-300">
                    "यह मिलान चित्रापक्ष (लहिरी) अयनांश एवं दोनों की स्पष्ट चन्द्र-नक्षत्र तथा नवग्रह स्थिति पर आधारित है। विस्तृत विवाह मुहूर्त व परिहार पूजा हेतु संपर्क करें।"
                  </p>
                </div>
              </div>

              <a
                href={getWhatsAppLink(getWhatsAppMilanText())}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs whitespace-nowrap shadow-md cursor-pointer hover:from-yellow-400 hover:to-amber-400"
              >
                संपूर्ण कुंडली विचार (मात्र ₹100) →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Past Kundali Milan History Card */}
      {localHistory.length > 0 && (
        <div className="bg-[#0e1424] border border-amber-900/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm sm:text-base font-bold font-vedic text-amber-100 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>
                आपकी पिछली कुंडली मिलान हिस्ट्री{' '}
                {currentUser ? `(+91 ${currentUser.phone})` : ''}
              </span>
            </h4>
            <span className="text-xs text-amber-400 font-semibold">
              कुल {localHistory.length} मिलान
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {localHistory.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setBoyName(item.boyName);
                  if (item.boyDob) setBoyDob(item.boyDob);
                  if (item.boyTime) setBoyTime(item.boyTime);
                  setGirlName(item.girlName);
                  if (item.girlDob) setGirlDob(item.girlDob);
                  if (item.girlTime) setGirlTime(item.girlTime);
                }}
                className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-amber-950/30 border border-amber-900/40 flex items-center justify-between gap-3 cursor-pointer transition-all"
              >
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-amber-100 block truncate">
                    {item.boyName} &amp; {item.girlName}
                  </span>
                  <span className="text-[11px] text-amber-300/80 block">
                    {item.boyRashi.split(' ')[0]} + {item.girlRashi.split(' ')[0]} •{' '}
                    {item.timestamp}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs flex-shrink-0">
                  {item.totalScore}/36 गुण
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
