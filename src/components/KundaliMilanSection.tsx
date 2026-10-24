import React, { useState, useEffect, useMemo } from 'react';
import {
  calculateKundaliMilan,
  KundaliMilanResult,
  getVedicDetailsFromName,
  VEDIC_RASHIS,
  VEDIC_NAKSHATRAS,
} from '../utils/kundaliMilan';
import { generateSampurnKundali, KundaliChartHouse } from '../utils/sampurnKundali';
import { downloadKundaliMilanPDF } from '../utils/pdfReportExporter';
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
  Download,
  Printer,
  RotateCcw,
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
    1: { rashiX: 50, rashiY: 42.2, planetX: 50, planetY: 26.5, maxCols: 2 },
    2: { rashiX: 25.75, rashiY: 19.8, planetX: 25.75, planetY: 10.2, maxCols: 2 },
    3: { rashiX: 19.6, rashiY: 25.75, planetX: 11.2, planetY: 25.75, maxCols: 1 },
    4: { rashiX: 42.2, rashiY: 50, planetX: 25.0, planetY: 50, maxCols: 2 },
    5: { rashiX: 19.6, rashiY: 74.25, planetX: 11.2, planetY: 74.25, maxCols: 1 },
    6: { rashiX: 25.75, rashiY: 80.2, planetX: 25.75, planetY: 89.8, maxCols: 2 },
    7: { rashiX: 50, rashiY: 57.8, planetX: 50, planetY: 74.0, maxCols: 2 },
    8: { rashiX: 74.25, rashiY: 80.2, planetX: 74.25, planetY: 89.8, maxCols: 2 },
    9: { rashiX: 80.4, rashiY: 74.25, planetX: 88.8, planetY: 74.25, maxCols: 1 },
    10: { rashiX: 57.8, rashiY: 50, planetX: 75.0, planetY: 50, maxCols: 2 },
    11: { rashiX: 80.4, rashiY: 25.75, planetX: 88.8, planetY: 25.75, maxCols: 1 },
    12: { rashiX: 74.25, rashiY: 19.8, planetX: 74.25, planetY: 10.2, maxCols: 2 },
  };

  return (
    <div className="bg-gradient-to-b from-[#161008] via-[#101726] to-[#0b101d] border border-amber-500/40 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col items-center overflow-hidden">
      <div className="text-center mb-2.5 w-full">
        <h4
          className={`text-sm sm:text-base font-bold font-vedic break-words ${
            accentColor === 'rose' ? 'text-rose-200' : 'text-amber-200'
          }`}
        >
          {title}
        </h4>
        <p className="text-[11px] text-amber-300/80 break-words">{subtitle}</p>
      </div>

      <div className="w-full max-w-[310px] aspect-square bg-[#120d06] rounded-xl p-1.5 border border-amber-500/50 shadow-inner overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="auto"
          overflow="hidden"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto block select-none overflow-hidden vedic-kundali-svg"
          aria-label={title}
        >
          <rect
            x="1.5"
            y="1.5"
            width="97"
            height="97"
            fill="#150f07"
            stroke="#f59e0b"
            strokeWidth="0.85"
            rx="2"
          />
          <rect
            x="3"
            y="3"
            width="94"
            height="94"
            fill="none"
            stroke="#fbbf24"
            strokeOpacity="0.25"
            strokeWidth="0.3"
            rx="1"
          />
          <line x1="1.5" y1="1.5" x2="98.5" y2="98.5" stroke="#f59e0b" strokeWidth="0.6" />
          <line x1="98.5" y1="1.5" x2="1.5" y2="98.5" stroke="#f59e0b" strokeWidth="0.6" />
          <polygon
            points="50,1.5 98.5,50 50,98.5 1.5,50"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.65"
          />

          <text
            x="50"
            y="51.8"
            textAnchor="middle"
            fill="#f59e0b"
            fillOpacity="0.12"
            fontSize="5.5"
            fontWeight="bold"
          >
            ॐ
          </text>

          {lagnaDegInt !== undefined && (
            <text
              x="50"
              y="14.5"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#34d399"
              fontSize="2.55"
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
            const isSideTriangle = [3, 5, 9, 11].includes(houseNum);
            const isTopBottomTriangle = [2, 6, 8, 12].includes(houseNum);
            const isCrowded = planets.length >= 3;
            const effectiveMaxCols = isSideTriangle ? (planets.length >= 4 ? 2 : 1) : coords.maxCols;
            const rows: Array<typeof planets> = [];
            for (let i = 0; i < planets.length; i += effectiveMaxCols) {
              rows.push(planets.slice(i, i + effectiveMaxCols));
            }

            return (
              <g key={houseNum}>
                <text
                  x={coords.rashiX}
                  y={coords.rashiY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#fbbf24"
                  fontSize="3.0"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  {h.rashiNumber}
                </text>

                {rows.map((row, rIdx) => {
                  const totalRows = rows.length;
                  const lineStep = isSideTriangle
                    ? totalRows >= 3
                      ? 2.4
                      : 2.75
                    : isTopBottomTriangle
                    ? totalRows >= 3
                      ? 2.45
                      : 2.85
                    : totalRows >= 3
                    ? 2.75
                    : 3.15;
                  const lineOffset = (rIdx - (totalRows - 1) / 2) * lineStep;
                  const yPos =
                    houseNum === 1 && lagnaDegInt !== undefined
                      ? coords.planetY + 2.0 + lineOffset
                      : coords.planetY + lineOffset;

                  const lineText = row
                    .map((p) =>
                      isSideTriangle || isCrowded
                        ? `${p.shortHindi || p.chartLabel}`
                        : `${p.chartLabel || p.shortHindi}${String(p.degInt ?? 0).padStart(2, '0')}`
                    )
                    .join(' ');

                  const fontSize = isSideTriangle
                    ? totalRows >= 3
                      ? '2.05'
                      : '2.35'
                    : isTopBottomTriangle
                    ? totalRows >= 3
                      ? '2.2'
                      : '2.5'
                    : totalRows >= 3
                    ? '2.35'
                    : '2.7';

                  return (
                    <text
                      key={rIdx}
                      x={coords.planetX}
                      y={yPos}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={rIdx === 0 ? '#fef3c7' : '#fde68a'}
                      fontSize={fontSize}
                      fontWeight="800"
                    >
                      {lineText}
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

  const [reusedBannerText, setReusedBannerText] = useState<string | null>(null);

  const DEFAULT_SAVED_MILAN_HISTORY: KundaliMilanHistoryItem[] = [
    {
      id: 'milan-default-shashank-pragya',
      boyName: 'शशांक शर्मा',
      boyDob: '1996-03-10',
      boyTime: '10:00',
      boyPlace: 'रुद्रपुर, उत्तराखण्ड',
      boyRashi: 'तुला राशि (Libra)',
      boyNakshatra: 'विशाखा (Vishakha)',
      girlName: 'Pragya',
      girlDob: '1996-11-06',
      girlTime: '14:15',
      girlPlace: 'रुद्रपुर, उत्तराखण्ड',
      girlRashi: 'सिंह राशि (Leo)',
      girlNakshatra: 'पूर्वाफाल्गुनी (Purva Phalguni)',
      totalScore: 18.5,
      compatibilityPercentage: 51,
      overallVerdict: 'शुभ एवं मध्यम अनुकूल मिलान',
      manglikVerdict: 'दोनों पत्रिकाओं में मांगलिक विचार संतुलित है।',
      ashtakootSummary: '18.5/36 गुण (51%)',
      timestamp: '21 अक्तू॰ 2026, 05:13 pm',
    },
  ];

  const [localHistory, setLocalHistory] = useState<KundaliMilanHistoryItem[]>(() => {
    if (currentUser?.kundaliHistory && currentUser.kundaliHistory.length > 0) {
      return currentUser.kundaliHistory;
    }
    try {
      const saved = localStorage.getItem('panditji_kundali_history_guest');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SAVED_MILAN_HISTORY;
  });

  useEffect(() => {
    if (currentUser?.kundaliHistory && currentUser.kundaliHistory.length > 0) {
      setLocalHistory(currentUser.kundaliHistory);
    }
  }, [currentUser?.phone, currentUser?.kundaliHistory]);

  const handleReuseHistoryItem = (item: KundaliMilanHistoryItem, shouldScroll = true) => {
    if (!item || !item.boyName || !item.girlName) return;

    const resolvedBoyDob = item.boyDob || '1996-03-10';
    const resolvedBoyTime = item.boyTime || '10:00';
    const resolvedBoyPlace = item.boyPlace || 'रुद्रपुर, उत्तराखण्ड';

    const resolvedGirlDob = item.girlDob || '1996-11-06';
    const resolvedGirlTime = item.girlTime || '14:15';
    const resolvedGirlPlace = item.girlPlace || 'रुद्रपुर, उत्तराखण्ड';

    setBoyName(item.boyName);
    setBoyDob(resolvedBoyDob);
    setBoyTime(resolvedBoyTime);
    setBoyPlace(resolvedBoyPlace);

    if (item.boyRashi) {
      const foundBoyR = VEDIC_RASHIS.find(
        (r) => r.includes(item.boyRashi) || item.boyRashi.includes(r.split(' ')[0])
      );
      if (foundBoyR) setBoyManualRashi(foundBoyR);
    }
    if (item.boyNakshatra) {
      const bNak = item.boyNakshatra;
      const foundBoyN = VEDIC_NAKSHATRAS.find(
        (n) => n.includes(bNak) || bNak.includes(n.split(' ')[0])
      );
      if (foundBoyN) setBoyManualNakshatra(foundBoyN);
    }

    setGirlName(item.girlName);
    setGirlDob(resolvedGirlDob);
    setGirlTime(resolvedGirlTime);
    setGirlPlace(resolvedGirlPlace);

    if (item.girlRashi) {
      const foundGirlR = VEDIC_RASHIS.find(
        (r) => r.includes(item.girlRashi) || item.girlRashi.includes(r.split(' ')[0])
      );
      if (foundGirlR) setGirlManualRashi(foundGirlR);
    }
    if (item.girlNakshatra) {
      const gNak = item.girlNakshatra;
      const foundGirlN = VEDIC_NAKSHATRAS.find(
        (n) => n.includes(gNak) || gNak.includes(n.split(' ')[0])
      );
      if (foundGirlN) setGirlManualNakshatra(foundGirlN);
    }

    const useAstro = Boolean(resolvedBoyDob && resolvedGirlDob);
    setMilanMode(useAstro ? 'astronomical' : 'manual');

    const result = calculateKundaliMilan(
      item.boyName,
      item.girlName,
      item.boyRashi,
      item.girlRashi,
      item.boyNakshatra || 'अश्विनी',
      item.girlNakshatra || 'रोहिणी',
      resolvedBoyDob,
      resolvedBoyTime,
      resolvedGirlDob,
      resolvedGirlTime,
      resolvedBoyPlace,
      resolvedGirlPlace,
      useAstro
    );
    setMilanResult(result);
    setShowAdvancedDetails(true);
    setReusedBannerText(
      `✅ "${item.boyName} & ${item.girlName}" का पूर्व सहेजा गया विवरण (जन्म तिथि, समय व स्थान) फॉर्म में लोड हो गया है और ३६ गुण मिलान गणना अपडेट कर दी गई है!`
    );
    setTimeout(() => setReusedBannerText(null), 5000);

    if (shouldScroll) {
      setTimeout(() => {
        const resultEl = document.getElementById('kundali-milan-full-report-container') || document.getElementById('kundali-milan-form-card');
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Auto-reload past Kundali Milan if opened from "Mera Khata" -> "Kundali Milan History"
  useEffect(() => {
    try {
      const pendingRaw = localStorage.getItem('panditji_open_milan_from_history');
      if (pendingRaw && pendingRaw !== 'undefined' && pendingRaw !== 'null') {
        localStorage.removeItem('panditji_open_milan_from_history');
        const item = JSON.parse(pendingRaw) as KundaliMilanHistoryItem;
        if (item && item.boyName && item.girlName) {
          handleReuseHistoryItem(item, true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

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

  const [isDownloadingPDF, setIsDownloadingPDF] = useState<boolean>(false);

  const handleDownloadMilanPDF = async () => {
    if (!milanResult) return;
    setIsDownloadingPDF(true);
    await downloadKundaliMilanPDF(milanResult, 'kundali-milan-full-report-container');
    setIsDownloadingPDF(false);
  };

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
      boyPlace: boyPlace.trim(),
      boyRashi: result.boyRashi,
      boyNakshatra: result.boyNakshatra,
      girlName: girlName.trim(),
      girlDob,
      girlTime,
      girlPlace: girlPlace.trim(),
      girlRashi: result.girlRashi,
      girlNakshatra: result.girlNakshatra,
      totalScore: result.totalScore,
      compatibilityPercentage: result.compatibilityPercentage,
      overallVerdict: result.overallVerdict,
      manglikVerdict: result.manglikStatus.description,
      ashtakootSummary: `${result.totalScore}/36 गुण (${result.compatibilityPercentage}%)`,
      timestamp: new Date().toLocaleString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
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
      <div className="no-print relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#191109] to-[#0f172a] border border-amber-600/40 p-4 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left min-w-0">
            <PanditPortrait size="lg" showBadge={true} />
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
      <div id="kundali-milan-form-card" className="no-print bg-[#0e1424] border border-amber-900/40 rounded-2xl p-4 sm:p-7 shadow-xl overflow-hidden space-y-6">
        {reusedBannerText && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between gap-2 animate-fadeIn">
            <span>{reusedBannerText}</span>
            <button
              type="button"
              onClick={() => setReusedBannerText(null)}
              className="text-emerald-300 hover:text-white text-xs underline shrink-0 cursor-pointer"
            >
              बंद करें
            </button>
          </div>
        )}
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
        <div id="kundali-milan-full-report-container" className="space-y-6 animate-slideUp p-2 bg-[#0d1322] rounded-3xl">
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

              {/* Action Buttons: PDF Download, Browser Print, WhatsApp & Copy */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto min-w-[220px] no-print">
                <button
                  type="button"
                  onClick={handleDownloadMilanPDF}
                  disabled={isDownloadingPDF}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>
                    {isDownloadingPDF
                      ? 'विवाह मिलान PDF तैयार हो रही है...'
                      : 'बृहत् ३६-गुण मिलान PDF डाउनलोड करें'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-200 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>ब्राउज़र प्रिंट / PDF सेव करें</span>
                </button>

                <a
                  href={getWhatsAppLink(getWhatsAppMilanText())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-slate-950" />
                  <span>पण्डित जी से परामर्श (मात्र ₹100)</span>
                </a>

                <button
                  onClick={copyReport}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300/90 text-xs font-medium transition-colors cursor-pointer border border-amber-900/30"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print-charts-box print-keep-together">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-manglik-card print-keep-together">
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

          {/* Deep Gana, Bhakoot & Nadi Shastrokta Parihar Insights */}
          {(() => {
            const ganaK = milanResult.koots[5];
            const bhakootK = milanResult.koots[6];
            const nadiK = milanResult.koots[7];
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-koot-box print-keep-together">
                <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-700/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">१. गण कूट विचार (6 गुण)</span>
                    <span className="text-xs font-mono font-bold text-yellow-400">
                      {ganaK?.obtainedPoints ?? 0}/6
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-100/90 leading-relaxed">
                    वर: <b>{ganaK?.boyValue}</b> • वधू: <b>{ganaK?.girlValue}</b>। {ganaK?.verdict}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-700/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">२. भकूट कूट एवं परिहार (7 गुण)</span>
                    <span className="text-xs font-mono font-bold text-yellow-400">
                      {bhakootK?.obtainedPoints ?? 0}/7
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-100/90 leading-relaxed">
                    {bhakootK?.verdict}{' '}
                    {bhakootK?.remedy ? `शास्त्रोक्त उपाय: ${bhakootK.remedy}` : ''}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-700/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">३. नाड़ी कूट एवं परिहार (8 गुण)</span>
                    <span className="text-xs font-mono font-bold text-yellow-400">
                      {nadiK?.obtainedPoints ?? 0}/8
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-100/90 leading-relaxed">
                    वर: <b>{nadiK?.boyValue}</b> • वधू: <b>{nadiK?.girlValue}</b>। {nadiK?.verdict}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Ashta-Koot Detailed Table */}
          <div className="bg-[#0e1424] border border-amber-900/40 rounded-2xl overflow-hidden shadow-xl print-guna-table print-keep-together">
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
                className="no-print text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <span>{showAdvancedDetails ? 'संक्षिप्त देखें' : 'विस्तार से देखें'}</span>
                {showAdvancedDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed text-left text-xs border-collapse vedic-fixed-table">
                <colgroup>
                  <col className="w-[18%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[12%]" />
                  <col className="w-[40%]" />
                </colgroup>
                <thead className="bg-slate-900/90 text-amber-300/80 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="w-[18%] px-3 py-3 break-words whitespace-normal">कूट का नाम</th>
                    <th className="w-[15%] px-3 py-3 break-words whitespace-normal">वर ({milanResult.boyName})</th>
                    <th className="w-[15%] px-3 py-3 break-words whitespace-normal">कन्या ({milanResult.girlName})</th>
                    <th className="w-[12%] px-3 py-3 break-words whitespace-normal">प्राप्त / कुल गुण</th>
                    <th className="w-[40%] px-3 py-3 break-words whitespace-normal">शास्त्रोक्त फल एवं परिहार विचार</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {milanResult.koots.map((koot, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors align-top">
                      <td className="w-[18%] px-3 py-3 font-bold text-amber-200 break-words whitespace-normal">
                        {koot.hindiName}
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5 break-words whitespace-normal">
                          {koot.meaning}
                        </span>
                      </td>

                      <td className="w-[15%] px-3 py-3 text-amber-100 font-semibold break-words whitespace-normal">
                        {koot.boyValue}
                      </td>

                      <td className="w-[15%] px-3 py-3 text-rose-200 font-semibold break-words whitespace-normal">
                        {koot.girlValue}
                      </td>

                      <td className="w-[12%] px-3 py-3 font-mono text-sm break-words whitespace-normal">
                        <span className="font-extrabold text-amber-400">{koot.obtainedPoints}</span>
                        <span className="text-slate-500 text-xs"> / {koot.maxPoints}</span>
                      </td>

                      <td className="w-[40%] px-3 py-3 break-words whitespace-normal">
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
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed break-words whitespace-normal">
                              {koot.verdict}
                            </p>
                            {koot.remedy && (
                              <span className="text-[10px] text-amber-400 block mt-0.5 italic break-words whitespace-normal">
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
                    <td className="px-3 py-3.5 text-amber-200 break-words whitespace-normal" colSpan={3}>
                      कुल अष्टकूट गुण योग (Total Ashtakoot Gunas)
                    </td>
                    <td className="w-[12%] px-3 py-3.5 font-mono text-base text-yellow-400 break-words whitespace-normal">
                      {milanResult.totalScore} / 36
                    </td>
                    <td className="w-[40%] px-3 py-3.5 text-amber-200 text-xs break-words whitespace-normal">
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
                <div className="w-full overflow-x-auto">
                  <table className="w-full table-fixed text-left text-xs border border-slate-800 rounded-xl overflow-hidden border-collapse vedic-fixed-table">
                    <colgroup>
                      <col className="w-[18%]" />
                      <col className="w-[41%]" />
                      <col className="w-[41%]" />
                    </colgroup>
                    <thead className="bg-slate-900 text-amber-300/90 text-[10px] uppercase">
                      <tr>
                        <th className="w-[18%] px-3 py-2 break-words whitespace-normal">ग्रह (Planet)</th>
                        <th className="w-[41%] px-3 py-2 break-words whitespace-normal">
                          वर ({milanResult.boyName}) — राशि, अंश व भाव
                        </th>
                        <th className="w-[41%] px-3 py-2 break-words whitespace-normal">
                          कन्या ({milanResult.girlName}) — राशि, अंश व भाव
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {milanResult.boyKundali.planets.map((bp, idx) => {
                        const gp = milanResult.girlKundali?.planets[idx];
                        return (
                          <tr key={bp.id} className="hover:bg-slate-900/40 align-top">
                            <td className="w-[18%] px-3 py-2 font-bold text-amber-200 break-words whitespace-normal">
                              {bp.symbol} {bp.hindiName}
                            </td>
                            <td className="w-[41%] px-3 py-2 text-amber-100 break-words whitespace-normal">
                              <b>{bp.rashiName.split(' ')[0]}</b> ({bp.fullDegreeDMS}) •{' '}
                              <span className="text-amber-300">{bp.houseInLagna}वां भाव</span> •{' '}
                              <span className="text-slate-400">
                                {bp.nakshatra.split(' ')[0]} (च.{bp.pada})
                              </span>
                            </td>
                            <td className="w-[41%] px-3 py-2 text-rose-100 break-words whitespace-normal">
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
                className="no-print px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs whitespace-nowrap shadow-md cursor-pointer hover:from-yellow-400 hover:to-amber-400"
              >
                संपूर्ण कुंडली विचार (मात्र ₹100) →
              </a>
            </div>

            {/* Official Application Branding Footer Block (Included in PDF Document) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-[#0f172a] to-slate-900 border-2 border-amber-500/60 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center font-bold text-amber-300 text-2xl font-vedic shadow-md">
                  ॐ
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block">
                    36 गुण मिलान रिपोर्ट • पण्डित जी ऑनलाइन (Pandit Ji Online)
                  </span>
                  <h5 className="text-sm sm:text-base font-extrabold font-vedic text-amber-100 mt-0.5">
                    मार्गदर्शक: आचार्य पण्डित शशांक शर्मा (रुद्रपुर, उधम सिंह नगर, उत्तराखण्ड)
                  </h5>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    वैदिक पुरोहित एवं ज्योतिषाचार्य • सम्पर्क एवं व्हाट्सएप: <b>7017279043</b>
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-amber-300 font-mono">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] uppercase font-bold inline-block mb-1">
                  अष्टकूट मिलान पद्धति
                </span>
                <div className="text-[11px] font-bold text-amber-400">PanditJiOnline.com</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Past Kundali Milan History Card */}
      {localHistory.length > 0 && (
        <div className="no-print bg-[#0e1424] border border-amber-900/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm sm:text-base font-bold font-vedic text-amber-100 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>
                  आपकी पिछली 36 गुण मिलान हिस्ट्री (36 Gun Milan History){' '}
                  {currentUser ? `(+91 ${currentUser.phone})` : ''}
                </span>
              </h4>
              <p className="text-[11px] text-amber-300/75 mt-0.5">
                किसी भी पूर्व मिलान कार्ड पर क्लिक करें — वर और कन्या का विवरण स्वतः फॉर्म में भर जाएगा और तुरंत गुण मिलान गणना खुल जाएगी
              </p>
            </div>
            <span className="text-xs text-amber-400 font-semibold bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-700/40">
              कुल {localHistory.length} मिलान
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {localHistory.slice(0, 6).map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleReuseHistoryItem(item, true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleReuseHistoryItem(item, true);
                  }
                }}
                className="group p-4 rounded-xl bg-slate-900/90 hover:bg-amber-950/40 border border-amber-900/40 hover:border-amber-400/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between gap-3 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-amber-300 transition-colors block truncate">
                      {item.boyName} &amp; {item.girlName}
                    </span>
                    <span className="text-[11px] text-amber-300/85 block mt-0.5">
                      {item.boyRashi.split(' ')[0]} + {item.girlRashi.split(' ')[0]} •{' '}
                      {item.timestamp}
                    </span>
                    <div className="text-[10px] text-slate-300/90 mt-1.5 space-y-0.5 font-mono">
                      <div className="truncate">
                        👦 वर: {item.boyDob || '1996-03-10'} | {item.boyTime || '10:00'} |{' '}
                        {item.boyPlace || 'रुद्रपुर, उत्तराखण्ड'}
                      </div>
                      <div className="truncate">
                        👧 कन्या: {item.girlDob || '1996-11-06'} | {item.girlTime || '14:15'} |{' '}
                        {item.girlPlace || 'रुद्रपुर, उत्तराखण्ड'}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs flex-shrink-0">
                    {item.totalScore}/36 गुण
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-amber-200/80 truncate">
                    {item.overallVerdict || 'अष्टकूट मिलान रिपोर्ट'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 group-hover:from-amber-500 group-hover:to-yellow-400 text-amber-300 group-hover:text-slate-950 border border-amber-500/40 font-bold text-[11px] transition-all shrink-0">
                    <RotateCcw className="w-3 h-3" />
                    <span>🔄 पुनः उपयोग करें (Use Again)</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
