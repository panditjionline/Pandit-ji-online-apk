import React, { useState, useEffect } from 'react';
import {
  generateSampurnKundali,
  SampurnKundaliReport,
  KundaliChartHouse,
} from '../utils/sampurnKundali';
import { JanamKundaliHistoryItem, UserMobileAccount } from '../types';
import { clearLocalJanamKundaliCache } from '../utils/userAccountStorage';
import { getWhatsAppLink } from '../config/brand';
import {
  Sparkles,
  User,
  Calendar,
  Clock,
  MapPin,
  Compass,
  Sun,
  Moon,
  Star,
  ShieldCheck,
  AlertTriangle,
  Award,
  Gem,
  Briefcase,
  Heart,
  Coins,
  BookOpen,
  Activity,
  MessageCircle,
  Copy,
  Check,
  History,
  Trash2,
  Flame,
  CalendarCheck,
  Eye,
  RotateCcw,
} from 'lucide-react';

interface SampurnKundaliSectionProps {
  currentUser?: UserMobileAccount | null;
  onSaveJanamKundaliHistoryItem?: (item: JanamKundaliHistoryItem) => void;
  onDeleteJanamKundaliHistoryItem?: (id: string) => void;
  onClearAllJanamKundaliHistory?: () => void;
  onConsultPanditJi: (promptText: string) => void;
  onOpenBookingModal: () => void;
  onOpenMantraJaap: () => void;
}

/**
 * Authentic North Indian Diamond Vedic Kundali Chart SVG Component
 * Renders the 12 Bhavas (Houses) in classical North Indian geometry with Rashi numbers & Grahas.
 */
const NorthIndianKundaliChart: React.FC<{
  houses: KundaliChartHouse[];
  title: string;
  subtitle: string;
  lagnaDegInt?: number;
}> = ({ houses, title, subtitle, lagnaDegInt }) => {
  const housePositions: Record<
    number,
    { rashiX: number; rashiY: number; planetX: number; planetY: number }
  > = {
    1: { rashiX: 200, rashiY: 168, planetX: 200, planetY: 108 },
    2: { rashiX: 100, rashiY: 78, planetX: 100, planetY: 36 },
    3: { rashiX: 74, rashiY: 104, planetX: 38, planetY: 102 },
    4: { rashiX: 162, rashiY: 204, planetX: 102, planetY: 200 },
    5: { rashiX: 74, rashiY: 302, planetX: 38, planetY: 300 },
    6: { rashiX: 100, rashiY: 328, planetX: 100, planetY: 368 },
    7: { rashiX: 200, rashiY: 242, planetX: 200, planetY: 302 },
    8: { rashiX: 300, rashiY: 328, planetX: 300, planetY: 368 },
    9: { rashiX: 326, rashiY: 302, planetX: 362, planetY: 300 },
    10: { rashiX: 238, rashiY: 204, planetX: 302, planetY: 200 },
    11: { rashiX: 326, rashiY: 104, planetX: 362, planetY: 102 },
    12: { rashiX: 300, rashiY: 78, planetX: 300, planetY: 36 },
  };

  return (
    <div className="bg-gradient-to-b from-[#161008] via-[#101726] to-[#0b101d] border-2 border-amber-500/50 rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col items-center">
      <div className="text-center mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
          {subtitle}
        </span>
        <h4 className="text-base sm:text-lg font-bold font-vedic text-amber-100 mt-1">{title}</h4>
      </div>

      <div className="w-full max-w-[355px] aspect-square relative bg-[#120d06] rounded-xl border border-amber-600/40 p-1.5 shadow-inner">
        <svg viewBox="0 0 400 400" className="w-full h-full select-none" aria-label={title}>
          <defs>
            <linearGradient id="vedicChartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          <rect
            x="6"
            y="6"
            width="388"
            height="388"
            rx="8"
            fill="#150f07"
            stroke="url(#vedicChartGrad)"
            strokeWidth="3"
          />

          <rect
            x="12"
            y="12"
            width="376"
            height="376"
            rx="4"
            fill="none"
            stroke="#f59e0b"
            strokeOpacity="0.25"
            strokeWidth="1"
          />

          <line
            x1="6"
            y1="6"
            x2="394"
            y2="394"
            stroke="url(#vedicChartGrad)"
            strokeWidth="2.2"
          />
          <line
            x1="394"
            y1="6"
            x2="6"
            y2="394"
            stroke="url(#vedicChartGrad)"
            strokeWidth="2.2"
          />

          <polygon
            points="200,6 394,200 200,394 6,200"
            fill="none"
            stroke="url(#vedicChartGrad)"
            strokeWidth="2.2"
          />

          <text
            x="200"
            y="207"
            textAnchor="middle"
            fill="#f59e0b"
            fillOpacity="0.12"
            fontSize="22"
            fontWeight="bold"
          >
            ॐ
          </text>

          {houses.map((h) => {
            const pos = housePositions[h.houseNumber];
            if (!pos) return null;

            const formattedTokens = h.planets.map(
              (p) => `${p.chartLabel} ${String(p.degInt).padStart(2, '0')}`
            );

            const isCornerTriangle = [3, 5, 9, 11].includes(h.houseNumber);
            const lines: string[] = [];
            if (isCornerTriangle) {
              formattedTokens.forEach((t) => lines.push(t));
            } else {
              for (let i = 0; i < formattedTokens.length; i += 2) {
                lines.push(formattedTokens.slice(i, i + 2).join('  '));
              }
            }

            return (
              <g key={h.houseNumber}>
                <text
                  x={pos.rashiX}
                  y={pos.rashiY}
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="12.5"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  {h.rashiNumber}
                </text>

                {h.houseNumber === 1 && (
                  <text
                    x="200"
                    y="64"
                    textAnchor="middle"
                    fill="#34d399"
                    fontSize="11.5"
                    fontWeight="bold"
                  >
                    {typeof lagnaDegInt === 'number'
                      ? `लग्न ${String(lagnaDegInt).padStart(2, '0')}`
                      : 'लग्न'}
                  </text>
                )}

                {lines.map((lineText, idx) => {
                  const totalLines = lines.length;
                  const yOffset = (idx - (totalLines - 1) / 2) * 14;
                  return (
                    <text
                      key={idx}
                      x={pos.planetX}
                      y={pos.planetY + yOffset}
                      textAnchor="middle"
                      fill={idx === 0 ? '#fef3c7' : '#fde68a'}
                      fontSize={isCornerTriangle ? '10.5' : '11.5'}
                      fontWeight="bold"
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

      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-amber-300/85">
        <span>सू: सूर्य</span>•<span>चं: चंद्र</span>•<span>मं: मंगल</span>•<span>बु: बुध</span>•
        <span>गु: गुरु</span>•<span>शु: शुक्र</span>•<span>श: शनि</span>•<span>रा: राहु</span>•
        <span>के: केतु</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[10.5px] text-emerald-300/90 font-medium">
        <span>* वक्री (Retrograde)</span>•<span>^ अस्त (Combust)</span>•
        <span>↑ उच्च (Exalted)</span>•<span>↓ नीच (Debilitated)</span>
      </div>
    </div>
  );
};

export const SampurnKundaliSection: React.FC<SampurnKundaliSectionProps> = ({
  currentUser,
  onSaveJanamKundaliHistoryItem,
  onDeleteJanamKundaliHistoryItem,
  onClearAllJanamKundaliHistory,
  onConsultPanditJi,
  onOpenBookingModal,
  onOpenMantraJaap,
}) => {
  // Start with empty input fields so Kundali is ONLY shown AFTER the user enters details and submits
  const [personName, setPersonName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [birthTime, setBirthTime] = useState<string>('');
  const [birthPlace, setBirthPlace] = useState<string>(
    currentUser?.birthPlace || 'रुद्रपुर, उत्तराखण्ड'
  );
  const [formError, setFormError] = useState<string>('');

  // Active Result Tab inside Sampurn Kundali
  const [activeSubView, setActiveSubView] = useState<
    'overview' | 'charts' | 'dasha_dosha' | 'predictions' | 'remedies'
  >('overview');

  const [copiedSummary, setCopiedSummary] = useState(false);
  const [deleteToast, setDeleteToast] = useState<string>('');
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);

  // Kundali Report is NULL initially — only shown AFTER user submits details (or clicks a history item)
  const [kundali, setKundali] = useState<SampurnKundaliReport | null>(null);

  // Saved Janam Kundali History (Synced with user account or guest localStorage, auto-upgraded to accurate Panchang ephemeris)
  const upgradeHistoryItems = (items: unknown): JanamKundaliHistoryItem[] => {
    if (!Array.isArray(items)) return [];
    return items
      .filter((item): item is JanamKundaliHistoryItem => Boolean(item && typeof item === 'object'))
      .map((item) => {
        try {
          const safeName = String(item.name || 'श्रद्धालु यजमान');
          const safeDob = String(item.dob || '1996-03-10');
          const safeTime = String(item.birthTime || '10:00');
          const safePlace = String(item.birthPlace || 'रुद्रपुर, उत्तराखण्ड');
          const rep = generateSampurnKundali(safeName, safeDob, safeTime, safePlace);
          const activeDasha =
            rep.mahadashas.find((m) => m.isCurrent)?.planet || rep.mahadashas[0]?.planet || 'गुरु';
          return {
            ...item,
            id: item.id || `jk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: safeName,
            dob: safeDob,
            birthTime: safeTime,
            birthPlace: safePlace,
            lagna: rep.panchang.lagnaName,
            moonRashi: rep.panchang.moonRashiName,
            sunRashi: rep.panchang.sunRashiName,
            nakshatra: rep.panchang.nakshatraName,
            nakshatraPada: rep.panchang.nakshatraPada,
            currentMahadasha: activeDasha,
            manglikStatus: rep.doshaAnalysis.manglik.severity,
            luckyGemstone: rep.lucky.ratnaName,
            timestamp: item.timestamp || '',
          };
        } catch {
          return item;
        }
      });
  };

  const [savedHistory, setSavedHistory] = useState<JanamKundaliHistoryItem[]>(() => {
    if (
      currentUser?.janamKundaliHistory &&
      Array.isArray(currentUser.janamKundaliHistory) &&
      currentUser.janamKundaliHistory.length > 0
    ) {
      return upgradeHistoryItems(currentUser.janamKundaliHistory);
    }
    try {
      const guest = localStorage.getItem('panditji_sampurn_kundali_history');
      if (guest) {
        return upgradeHistoryItems(JSON.parse(guest));
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    if (currentUser?.janamKundaliHistory && Array.isArray(currentUser.janamKundaliHistory)) {
      setSavedHistory(upgradeHistoryItems(currentUser.janamKundaliHistory));
    }
  }, [currentUser?.phone, currentUser?.janamKundaliHistory?.length]);

  // If user clicked "सम्पूर्ण कुंडली खोलें" from Mera Data / History tab, auto-load that Kundali
  useEffect(() => {
    try {
      const pendingRaw = localStorage.getItem('panditji_open_kundali_from_history');
      if (pendingRaw) {
        localStorage.removeItem('panditji_open_kundali_from_history');
        const item = JSON.parse(pendingRaw) as JanamKundaliHistoryItem;
        if (item && item.name && item.dob && item.birthTime) {
          setPersonName(item.name);
          setDob(item.dob);
          setBirthTime(item.birthTime);
          setBirthPlace(item.birthPlace || 'रुद्रपुर, उत्तराखण्ड');
          const report = generateSampurnKundali(
            item.name,
            item.dob,
            item.birthTime,
            item.birthPlace || 'रुद्रपुर, उत्तराखण्ड'
          );
          setKundali(report);
          setActiveSubView('overview');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const showToastMessage = (msg: string) => {
    setDeleteToast(msg);
    setTimeout(() => {
      setDeleteToast((prev) => (prev === msg ? '' : prev));
    }, 3000);
  };

  const handleGenerateKundali = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) {
      setFormError('कृपया अपना नाम दर्ज करें।');
      return;
    }
    if (!dob) {
      setFormError('कृपया अपनी जन्म तिथि (Date of Birth) चुनें।');
      return;
    }
    if (!birthTime) {
      setFormError('कृपया अपना जन्म समय (Time of Birth) चुनें।');
      return;
    }
    setFormError('');

    const report = generateSampurnKundali(personName.trim(), dob, birthTime, birthPlace);
    setKundali(report);
    setActiveSubView('overview');

    const activeDasha =
      report.mahadashas.find((m) => m.isCurrent)?.planet ||
      report.mahadashas[0]?.planet ||
      'गुरु';

    const historyItem: JanamKundaliHistoryItem = {
      id: `jk-${Date.now()}`,
      name: report.input.name,
      dob: report.input.dob,
      birthTime: report.input.birthTime,
      birthPlace: report.input.birthPlace,
      lagna: report.panchang.lagnaName,
      moonRashi: report.panchang.moonRashiName,
      sunRashi: report.panchang.sunRashiName,
      nakshatra: report.panchang.nakshatraName,
      nakshatraPada: report.panchang.nakshatraPada,
      currentMahadasha: activeDasha,
      manglikStatus: report.doshaAnalysis.manglik.severity,
      luckyGemstone: report.lucky.ratnaName,
      timestamp: new Date().toLocaleString('hi-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updatedHistory = [
      historyItem,
      ...savedHistory.filter(
        (x) =>
          !(
            (x?.name || '').toLowerCase() === historyItem.name.toLowerCase() &&
            x?.dob === historyItem.dob &&
            x?.birthTime === historyItem.birthTime
          )
      ),
    ].slice(0, 20);

    setSavedHistory(updatedHistory);
    try {
      localStorage.setItem('panditji_sampurn_kundali_history', JSON.stringify(updatedHistory));
    } catch {
      // ignore
    }

    if (onSaveJanamKundaliHistoryItem) {
      onSaveJanamKundaliHistoryItem(historyItem);
    }
  };

  const handleLoadFromHistory = (item: JanamKundaliHistoryItem) => {
    setPersonName(item.name);
    setDob(item.dob);
    setBirthTime(item.birthTime);
    setBirthPlace(item.birthPlace || 'रुद्रपुर, उत्तराखण्ड');
    setFormError('');
    const report = generateSampurnKundali(
      item.name,
      item.dob,
      item.birthTime,
      item.birthPlace || 'रुद्रपुर, उत्तराखण्ड'
    );
    setKundali(report);
    setActiveSubView('overview');
  };

  const handleResetForm = () => {
    setPersonName('');
    setDob('');
    setBirthTime('');
    setFormError('');
    setKundali(null);
  };

  const handleDeleteHistoryItem = (id: string, itemName: string) => {
    const filtered = savedHistory.filter((item) => item.id !== id);
    setSavedHistory(filtered);
    try {
      localStorage.setItem('panditji_sampurn_kundali_history', JSON.stringify(filtered));
    } catch {
      // ignore
    }
    if (onDeleteJanamKundaliHistoryItem) {
      onDeleteJanamKundaliHistoryItem(id);
    }
    showToastMessage(`"${itemName}" की कुंडली हिस्ट्री डिलीट कर दी गई है।`);
  };

  const handleClearAllHistory = () => {
    setSavedHistory([]);
    setConfirmClearAll(false);
    clearLocalJanamKundaliCache();
    if (onClearAllJanamKundaliHistory) {
      onClearAllJanamKundaliHistory();
    }
    showToastMessage('आपकी सारी खोजी गई जन्म कुंडली हिस्ट्री डिलीट कर दी गई है।');
  };

  const currentDashaObj = kundali
    ? kundali.mahadashas.find((d) => d.isCurrent) || kundali.mahadashas[0]
    : null;

  const getWhatsAppKundaliMessage = () => {
    if (!kundali) return '';
    return `*पण्डित जी ऑनलाइन - सम्पूर्ण जन्म कुंडली परामर्श अनुरोध*
----------------------------------------
*नाम:* ${kundali.input.name}
*जन्म तिथि (DOB):* ${kundali.input.formattedDob}
*जन्म समय (Time):* ${kundali.input.formattedTime}
*जन्म स्थान:* ${kundali.input.birthPlace}
----------------------------------------
*लग्न:* ${kundali.panchang.lagnaName} (स्वामी: ${kundali.panchang.lagnaLord})
*चंद्र राशि:* ${kundali.panchang.moonRashiName}
*जन्म नक्षत्र:* ${kundali.panchang.nakshatraName} (चरण ${kundali.panchang.nakshatraPada})
*वर्तमान महादशा:* ${currentDashaObj?.planet} (अंतर्दशा: ${currentDashaObj?.currentAntardasha || '-'})
*मांगलिक विचार:* ${kundali.doshaAnalysis.manglik.severity}
*शुभ रत्न:* ${kundali.lucky.ratnaName}
----------------------------------------
राधे राधे पण्डित शशांक शर्मा जी! मैंने ऐप में अपनी जन्म कुंडली बनाई है। कृपया मेरी कुंडली का सूक्ष्म अध्ययन करके करियर, धन, विवाह एवं उपाय पर व्यक्तिगत परामर्श (मात्र ₹100 दक्षिणा) प्रदान करें।`;
  };

  const handleCopyKundaliReport = () => {
    if (!kundali) return;
    const text = `सम्पूर्ण वैदिक जन्म कुंडली पत्रक - पण्डित जी ऑनलाइन
नाम: ${kundali.input.name} | जन्म तिथि: ${kundali.input.formattedDob} | समय: ${kundali.input.formattedTime} | स्थान: ${kundali.input.birthPlace}
लग्न: ${kundali.panchang.lagnaName} (${kundali.panchang.lagnaLord}) | चंद्र राशि: ${kundali.panchang.moonRashiName} | सूर्य राशि: ${kundali.panchang.sunRashiName}
नक्षत्र: ${kundali.panchang.nakshatraName} (चरण ${kundali.panchang.nakshatraPada}) | गण: ${kundali.panchang.gana} | नाड़ी: ${kundali.panchang.nadi}
वर्तमान महादशा: ${currentDashaObj?.planet} (${currentDashaObj?.startYear}-${currentDashaObj?.endYear})
मांगलिक स्थिति: ${kundali.doshaAnalysis.manglik.severity}
शुभ रत्न: ${kundali.lucky.ratnaName} | इष्ट देव: ${kundali.lucky.ishtaDevta}
आचार्य: पण्डित शशांक शर्मा (रुद्रपुर) • मो: 7017279043`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <section className="w-full max-w-full overflow-x-hidden space-y-6 animate-fadeIn">
      {/* ==================== TOP HERO BANNER ==================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c1108] via-[#131b2e] to-[#0c1322] border-2 border-amber-500/50 p-4 sm:p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 text-center sm:text-left min-w-0">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 shadow-xl flex-shrink-0">
              <Compass className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-1 border border-amber-500/40">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>वैदिक ज्योतिष • लग्न चक्र, नवग्रह, महादशा एवं सम्पूर्ण भविष्यफल</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-vedic text-amber-100">
                सम्पूर्ण जन्म कुंडली (Janam Kundali & Horoscope)
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/85 mt-1 max-w-2xl">
                अपना <b>नाम, जन्म तिथि (Date of Birth) और जन्म समय (Time of Birth)</b> दर्ज करके बटन दबाएं और अपनी
                <b> लग्न कुंडली, चंद्र राशि, नक्षत्र, महादशा, मांगलिक/साढ़े साती विचार, शुभ रत्न और जीवन का सम्पूर्ण भविष्यफल</b> प्राप्त करें।
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onOpenBookingModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>पण्डित जी से कुंडली दिखाएं (मात्र ₹100)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast message when deleting history */}
      {deleteToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{deleteToast}</span>
        </div>
      )}

      {/* ==================== BIRTH DETAILS INPUT FORM CARD ==================== */}
      <div className="bg-[#0e1525] border-2 border-amber-600/40 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold font-vedic text-amber-100">
              जन्म विवरण दर्ज करें (Enter Name, Date of Birth & Time of Birth)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {currentUser && (currentUser.name || currentUser.dob) && (
              <button
                type="button"
                onClick={() => {
                  if (currentUser.name) setPersonName(currentUser.name);
                  if (currentUser.dob) setDob(currentUser.dob);
                  if (currentUser.birthTime) setBirthTime(currentUser.birthTime);
                  if (currentUser.birthPlace) setBirthPlace(currentUser.birthPlace);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-semibold cursor-pointer"
              >
                मेरा प्रोफाइल डेटा भरें
              </button>
            )}
            {kundali && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>नई कुंडली खोजें</span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleGenerateKundali} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>आपका पूरा नाम (Full Name) *</span>
              </label>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="अपना नाम लिखें (जैसे: राहुल शर्मा)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-600/50 text-amber-100 text-sm font-medium focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* 2. Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>जन्म तिथि (Date of Birth) *</span>
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-600/50 text-amber-100 text-sm font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* 3. Time of Birth */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center justify-between gap-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>जन्म समय (Time of Birth) *</span>
                </span>
                {birthTime && (
                  <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
                    {birthTime}
                  </span>
                )}
              </label>
              <input
                type="time"
                required
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-600/50 text-amber-100 text-sm font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* 4. Place of Birth */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>जन्म स्थान (Birth Place)</span>
              </label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="जैसे: रुद्रपुर, हल्द्वानी, दिल्ली..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-600/50 text-amber-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-bold">
              {formError}
            </div>
          )}

          {/* Quick Time Presets + Submit Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-amber-300/80 font-medium mr-1">अनुमानित जन्म समय चुनें:</span>
              {[
                { label: 'प्रातः (06:30 AM)', val: '06:30' },
                { label: 'सुबह (09:30 AM)', val: '09:30' },
                { label: 'दोपहर (01:30 PM)', val: '13:30' },
                { label: 'संध्या (06:15 PM)', val: '18:15' },
                { label: 'रात्रि (10:30 PM)', val: '22:30' },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setBirthTime(preset.val)}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    birthTime === preset.val
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-600/50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>सम्पूर्ण जन्म कुंडली देखें</span>
            </button>
          </div>
        </form>
      </div>

      {/* ==================== BEFORE SUBMITTING: INSTRUCTION STATE ==================== */}
      {!kundali && (
        <div className="rounded-2xl bg-gradient-to-b from-[#151008] to-[#0d1424] border border-amber-700/40 p-5 sm:p-8 text-center space-y-3 shadow-lg">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Compass className="w-6 h-6" />
          </div>
          <h4 className="text-base sm:text-xl font-bold font-vedic text-amber-100">
            ऊपर अपना नाम, जन्म तिथि और जन्म समय डालकर "सम्पूर्ण जन्म कुंडली देखें" दबाएं
          </h4>
          <p className="text-xs sm:text-sm text-amber-200/80 max-w-xl mx-auto leading-relaxed">
            विवरण दर्ज करते ही आपकी <b>उत्तर भारतीय लग्न एवं चंद्र कुंडली चक्र</b>, <b>नवग्रह स्पष्ट तालिका</b>,{' '}
            <b>विंशोत्तरी महादशा</b>, <b>मांगलिक व शनि साढ़े साती विचार</b>, <b>शुभ रत्न</b> और{' '}
            <b>जीवन के 6 क्षेत्रों का सम्पूर्ण भविष्यफल</b> यहाँ प्रदर्शित होगा।
          </p>
        </div>
      )}

      {/* ==================== GENERATED KUNDALI FULL DETAILS (SHOWN ONLY AFTER DETAILS ENTERED) ==================== */}
      {kundali && (
        <div className="space-y-6 animate-fadeIn">
          {/* Master Summary Strip */}
          <div className="rounded-3xl bg-gradient-to-br from-[#1b1208] via-[#11192b] to-[#0b101d] border-2 border-amber-500/60 p-4 sm:p-6 shadow-2xl space-y-5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-amber-800/40 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider">
                    वैदिक जन्म पत्रिका
                  </span>
                  <span className="text-xs text-amber-300 font-mono">
                    DOB: {kundali.input.formattedDob} • Time: {kundali.input.formattedTime} •{' '}
                    {kundali.input.birthPlace}
                  </span>
                </div>
                <h3 className="text-xl sm:text-3xl font-extrabold font-vedic text-gold-gradient mt-1">
                  {kundali.input.name} की सम्पूर्ण जन्म कुंडली
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={handleCopyKundaliReport}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-600/40 text-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">रिपोर्ट कॉपी हो गई!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>कुंडली सारांश कॉपी करें</span>
                    </>
                  )}
                </button>

                <a
                  href={getWhatsAppLink(getWhatsAppKundaliMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp पर पण्डित जी को कुंडली भेजें</span>
                </a>
              </div>
            </div>

            {/* 6 Key Astrological Highlight Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-500/40">
                <span className="text-[11px] text-amber-400/90 block">जन्म लग्न (Ascendant)</span>
                <p className="text-sm sm:text-base font-extrabold text-amber-100 mt-0.5">
                  {kundali.panchang.lagnaName}
                </p>
                <span className="text-[11px] text-amber-300/80">
                  स्वामी: {kundali.panchang.lagnaLord}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-500/40">
                <span className="text-[11px] text-amber-400/90 block">चंद्र राशि (Moon Sign)</span>
                <p className="text-sm sm:text-base font-extrabold text-amber-100 mt-0.5">
                  {kundali.panchang.moonRashiName}
                </p>
                <span className="text-[11px] text-amber-300/80">
                  स्वामी: {kundali.panchang.moonRashiLord}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-500/40">
                <span className="text-[11px] text-amber-400/90 block">सूर्य राशि (Sun Sign)</span>
                <p className="text-sm sm:text-base font-extrabold text-amber-100 mt-0.5">
                  {kundali.panchang.sunRashiName}
                </p>
                <span className="text-[11px] text-amber-300/80">
                  स्वामी: {kundali.panchang.sunRashiLord}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-500/40">
                <span className="text-[11px] text-amber-400/90 block">जन्म नक्षत्र एवं चरण</span>
                <p className="text-sm sm:text-base font-extrabold text-amber-100 mt-0.5 truncate">
                  {kundali.panchang.nakshatraName}
                </p>
                <span className="text-[11px] text-emerald-300 font-semibold">
                  चरण {kundali.panchang.nakshatraPada} • {kundali.panchang.nakshatraLord}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-emerald-500/40">
                <span className="text-[11px] text-emerald-400 block">वर्तमान महादशा</span>
                <p className="text-sm sm:text-base font-extrabold text-emerald-200 mt-0.5">
                  {currentDashaObj?.planet}
                </p>
                <span className="text-[11px] text-emerald-300/80 font-mono">
                  {currentDashaObj?.startYear} से {currentDashaObj?.endYear} तक
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-500/40">
                <span className="text-[11px] text-amber-400/90 block">भाग्योदय शुभ रत्न</span>
                <p className="text-sm sm:text-base font-extrabold text-yellow-300 mt-0.5 truncate">
                  {kundali.lucky.ratnaName}
                </p>
                <span className="text-[11px] text-amber-300/80 truncate block">
                  {kundali.lucky.rudraksha}
                </span>
              </div>
            </div>

            {/* Sub-Navigation Pills inside Sampurn Kundali */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {[
                { id: 'overview', label: '1. सम्पूर्ण विवरण व लग्न कुंडली चक्र', icon: Compass },
                { id: 'charts', label: '2. नवग्रह तालिका एवं भाव फल', icon: Sun },
                { id: 'dasha_dosha', label: '3. महादशा, मांगलिक व राजयोग', icon: ShieldCheck },
                { id: 'predictions', label: '4. जीवन के 6 क्षेत्रों का भविष्यफल', icon: BookOpen },
                { id: 'remedies', label: '5. शुभ रत्न, मंत्र एवं अचूक उपाय', icon: Gem },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeSubView === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveSubView(
                        tab.id as 'overview' | 'charts' | 'dasha_dosha' | 'predictions' | 'remedies'
                      )
                    }
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg'
                        : 'bg-slate-900/90 hover:bg-slate-800 text-amber-200 border border-amber-800/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 1: OVERVIEW + LAGNA & CHANDRA CHARTS + AVAKAHADA */}
          {activeSubView === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NorthIndianKundaliChart
                  houses={kundali.lagnaChart}
                  title={`लग्न कुंडली चक्र (${kundali.panchang.lagnaName} लग्न)`}
                  subtitle="प्रथम प्रमुख जन्म चक्र (Lagna Chart - D1)"
                  lagnaDegInt={kundali.panchang.lagnaDegInt}
                />

                <NorthIndianKundaliChart
                  houses={kundali.chandraChart}
                  title={`चंद्र कुंडली चक्र (${kundali.panchang.moonRashiName} राशि)`}
                  subtitle="राशि एवं मानसिक बल चक्र (Chandra / Moon Chart)"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0e1525] border border-amber-800/50 rounded-2xl p-4 sm:p-6 shadow-xl">
                  <h4 className="text-base sm:text-lg font-bold font-vedic text-amber-100 border-b border-amber-900/40 pb-2.5 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span>जन्म पंचांग विवरण (Birth Panchang Details)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {[
                      { label: 'यजमान का नाम', val: kundali.input.name },
                      {
                        label: 'जन्म तिथि एवं आयु',
                        val: `${kundali.input.formattedDob} (~${kundali.input.ageYears} वर्ष)`,
                      },
                      { label: 'जन्म समय', val: kundali.input.formattedTime },
                      { label: 'जन्म स्थान', val: kundali.input.birthPlace },
                      { label: 'जन्म वार (Day)', val: kundali.panchang.vaar },
                      { label: 'वार स्वामी', val: kundali.panchang.vaarLord },
                      { label: 'जन्म तिथि (Tithi)', val: kundali.panchang.tithi },
                      { label: 'पक्ष (Paksha)', val: kundali.panchang.paksha },
                      {
                        label: 'नक्षत्र एवं चरण',
                        val: `${kundali.panchang.nakshatraName} (चरण ${kundali.panchang.nakshatraPada})`,
                      },
                      { label: 'नक्षत्र स्वामी', val: kundali.panchang.nakshatraLord },
                      { label: 'योग (Yoga)', val: kundali.panchang.yoga },
                      { label: 'करण (Karana)', val: kundali.panchang.karana },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
                      >
                        <span className="text-[11px] text-amber-400/80">{row.label}</span>
                        <span className="font-bold text-amber-100 mt-0.5">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0e1525] border border-amber-800/50 rounded-2xl p-4 sm:p-6 shadow-xl">
                  <h4 className="text-base sm:text-lg font-bold font-vedic text-amber-100 border-b border-amber-900/40 pb-2.5 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>अवकहड़ा चक्र एवं घट-चक्र (Avakahada Chakra)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {[
                      {
                        label: 'जन्म लग्न एवं स्वामी',
                        val: `${kundali.panchang.lagnaName} (${kundali.panchang.lagnaLord})`,
                      },
                      {
                        label: 'चंद्र राशि एवं स्वामी',
                        val: `${kundali.panchang.moonRashiName} (${kundali.panchang.moonRashiLord})`,
                      },
                      {
                        label: 'सूर्य राशि एवं स्वामी',
                        val: `${kundali.panchang.sunRashiName} (${kundali.panchang.sunRashiLord})`,
                      },
                      { label: 'प्रचलित नाम राशि', val: kundali.panchang.naamRashi },
                      { label: 'गण (Gana)', val: kundali.panchang.gana },
                      { label: 'नाड़ी (Nadi)', val: kundali.panchang.nadi },
                      { label: 'योनि (Yoni)', val: kundali.panchang.yoni },
                      {
                        label: 'वर्ण एवं वश्य',
                        val: `${kundali.panchang.varna} • ${kundali.panchang.vashya}`,
                      },
                      { label: 'तत्व (Element)', val: kundali.panchang.tatva },
                      { label: 'पाया (Paya)', val: kundali.panchang.paya },
                      {
                        label: 'शुभ अंक एवं वार',
                        val: `अंक: ${kundali.lucky.luckyNumbers} | ${kundali.lucky.luckyDays}`,
                      },
                      {
                        label: 'शुभ रंग एवं दिशा',
                        val: `${kundali.lucky.luckyColors} | ${kundali.lucky.luckyDirection}`,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
                      >
                        <span className="text-[11px] text-amber-400/80">{row.label}</span>
                        <span className="font-bold text-amber-100 mt-0.5">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: NAVAGRAHA TABLE & BHAVA EFFECTS */}
          {(activeSubView === 'charts' || activeSubView === 'overview') && (
            <div className="bg-[#0e1525] border border-amber-800/50 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/40 pb-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-vedic text-amber-100 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-400" />
                    <span>नवग्रह स्पष्ट तालिका एवं भाव फल (9 Planets Position & House Effects)</span>
                  </h3>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    आपकी जन्म तिथि और जन्म समय के अनुसार सभी 9 ग्रहों की राशि, भाव, अंश (Degree), नक्षत्र और जीवन पर प्रभाव
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-amber-800/60 bg-amber-950/40 text-amber-300 font-bold">
                      <th className="py-3 px-3">ग्रह (Planet)</th>
                      <th className="py-3 px-3">राशि (Sign)</th>
                      <th className="py-3 px-3">लग्न भाव</th>
                      <th className="py-3 px-3">अंश (Degree)</th>
                      <th className="py-3 px-3">नक्षत्र (चरण)</th>
                      <th className="py-3 px-3">ग्रह अवस्था</th>
                      <th className="py-3 px-3">कुंडली में फल एवं प्रभाव</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {kundali.planets.map((planet) => (
                      <tr key={planet.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-3 font-bold text-amber-100 whitespace-nowrap">
                          <span className="mr-1.5 text-amber-400">{planet.symbol}</span>
                          <span>{planet.hindiName}</span>
                          <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-200 border border-amber-500/30">
                            {planet.chartLabel} {String(planet.degInt).padStart(2, '0')}
                          </span>
                          {planet.isRetrograde && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              वक्री (*)
                            </span>
                          )}
                          {planet.isCombust && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                              अस्त (^)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-amber-200 whitespace-nowrap">
                          {planet.rashiName}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-300 whitespace-nowrap">
                          भाव {planet.houseInLagna}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-200 whitespace-nowrap">
                          {planet.fullDegreeDMS}
                        </td>
                        <td className="py-3 px-3 text-amber-200/90 whitespace-nowrap">
                          {planet.nakshatra} (चरण-{planet.pada})
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              planet.statusBadge === 'shubh'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                : planet.statusBadge === 'madhyam'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {planet.dignity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-amber-100/90 min-w-[260px] leading-relaxed">
                          {planet.houseEffect}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: VIMSHOTTARI MAHADASHA, DOSHA & RAJ YOGAS */}
          {(activeSubView === 'dasha_dosha' || activeSubView === 'overview') && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1525] border border-amber-700/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      मांगलिक दोष विचार
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        !kundali.doshaAnalysis.manglik.isManglik
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {kundali.doshaAnalysis.manglik.severity}
                    </span>
                  </div>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    {kundali.doshaAnalysis.manglik.explanation}
                  </p>
                  <p className="text-[11px] text-emerald-300/90 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <b>वैदिक सलाह:</b> {kundali.doshaAnalysis.manglik.remedy}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1525] border border-amber-700/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      शनि साढ़े साती एवं गोचर
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {kundali.doshaAnalysis.sadeSati.phase}
                    </span>
                  </div>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    {kundali.doshaAnalysis.sadeSati.explanation}
                  </p>
                  <p className="text-[11px] text-emerald-300/90 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <b>वैदिक सलाह:</b> {kundali.doshaAnalysis.sadeSati.remedy}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1525] border border-amber-700/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      कालसर्प एवं पितृ योग विचार
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {kundali.doshaAnalysis.kaalSarp.type}
                    </span>
                  </div>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    {kundali.doshaAnalysis.kaalSarp.explanation}
                  </p>
                  <p className="text-[11px] text-emerald-300/90 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <b>वैदिक सलाह:</b> {kundali.doshaAnalysis.kaalSarp.remedy}
                  </p>
                </div>
              </div>

              {/* Shubh Raj Yogas */}
              <div className="bg-[#0e1525] border border-amber-700/50 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
                <h4 className="text-base sm:text-lg font-bold font-vedic text-amber-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span>कुंडली में निर्मित शुभ राजयोग एवं धन योग (Auspicious Raj Yogas)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {kundali.rajYogas.map((yoga) => (
                    <div
                      key={yoga.name}
                      className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-950 border border-amber-500/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40">
                          {yoga.strength}
                        </span>
                        <span className="text-[11px] text-amber-400">{yoga.sanskritRule}</span>
                      </div>
                      <h5 className="text-sm sm:text-base font-bold text-amber-100 pt-1">
                        {yoga.name}
                      </h5>
                      <p className="text-xs text-amber-200/85 leading-relaxed">
                        {yoga.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vimshottari Mahadasha Timeline */}
              <div className="bg-[#0e1525] border border-amber-700/50 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/40 pb-3">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold font-vedic text-amber-100 flex items-center gap-2">
                      <Moon className="w-5 h-5 text-amber-400" />
                      <span>
                        विंशोत्तरी महादशा चक्र एवं वर्तमान प्रभाव (Vimshottari Mahadasha Timeline)
                      </span>
                    </h4>
                    <p className="text-xs text-amber-300/80 mt-0.5">
                      जन्म नक्षत्र ({kundali.panchang.nakshatraName}) के आधार पर आपके जीवन की ग्रह महादशाओं का क्रम
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {kundali.mahadashas.map((dasha) => (
                    <div
                      key={`${dasha.planet}-${dasha.startYear}`}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        dasha.isCurrent
                          ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-amber-950/60 border-2 border-emerald-400 shadow-lg'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-extrabold text-amber-100">
                          {dasha.planet} महादशा
                        </span>
                        {dasha.isCurrent ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                            वर्तमान सक्रिय दशा
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-amber-400/80">
                            {dasha.years} वर्ष
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-amber-300 mb-1.5">
                        अवधि: <b>{dasha.startYear}</b> से <b>{dasha.endYear}</b> तक
                        {dasha.currentAntardasha && (
                          <span className="block text-emerald-300 font-sans mt-0.5">
                            वर्तमान अंतर्दशा: <b>{dasha.currentAntardasha}</b>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-200/85 leading-relaxed">
                        {dasha.prediction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: 6 PILLARS OF COMPLETE LIFE PREDICTIONS */}
          {(activeSubView === 'predictions' || activeSubView === 'overview') && (
            <div className="bg-[#0e1525] border border-amber-700/50 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
              <div className="border-b border-amber-900/40 pb-3">
                <h3 className="text-lg sm:text-2xl font-bold font-vedic text-amber-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>सम्पूर्ण जीवन भविष्यफल (Complete Horoscope Predictions)</span>
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  लग्न ({kundali.panchang.lagnaName}), चंद्र राशि ({kundali.panchang.moonRashiName}) और ग्रहों के भाव बल पर आधारित विस्तृत फलादेश
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-800/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>1. {kundali.predictions.personality.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                    {kundali.predictions.personality.summary}
                  </p>
                  <ul className="space-y-1 pt-1">
                    {kundali.predictions.personality.keyTraits.map((t) => (
                      <li key={t} className="text-xs text-amber-300/90 flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-800/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    <span>2. {kundali.predictions.career.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                    {kundali.predictions.career.summary}
                  </p>
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-700/30 text-xs text-emerald-300 font-medium">
                    {kundali.predictions.career.peakYears}
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-800/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>3. {kundali.predictions.wealth.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                    {kundali.predictions.wealth.summary}
                  </p>
                  <ul className="space-y-1 pt-1">
                    {kundali.predictions.wealth.highlights.map((h) => (
                      <li key={h} className="text-xs text-amber-300/90 flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-800/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>4. {kundali.predictions.marriage.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                    {kundali.predictions.marriage.summary}
                  </p>
                  <div className="text-xs text-amber-200/90 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <b>जीवनसाथी का स्वभाव:</b> {kundali.predictions.marriage.spouseNature}
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>5. {kundali.predictions.education.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                    {kundali.predictions.education.summary}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>6. {kundali.predictions.health.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                    {kundali.predictions.health.summary}
                  </p>
                  <ul className="space-y-1 pt-1">
                    {kundali.predictions.health.careAreas.map((c) => (
                      <li key={c} className="text-xs text-amber-300/90 flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: GEMSTONE, BEEJ MANTRA & VEDIC REMEDIES */}
          {(activeSubView === 'remedies' || activeSubView === 'overview') && (
            <div className="bg-gradient-to-br from-[#191108] via-[#101829] to-[#0b101d] border-2 border-amber-500/50 rounded-3xl p-4 sm:p-7 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-800/50 pb-4">
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold font-vedic text-amber-100 flex items-center gap-2">
                    <Gem className="w-5 h-5 text-yellow-400" />
                    <span>शुभ रत्न, इष्ट मंत्र एवं पण्डित शशांक शर्मा जी के वैदिक उपाय</span>
                  </h3>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    संतुलित ज्योतिष दर्शन: कुंडली के मजबूत पक्ष (Strengths), आवश्यक सावधानियां (Precautions) और सरल सात्विक उपाय
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenMantraJaap}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-yellow-400" />
                  <span>108 मंत्र जप काउंटर खोलें</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase">
                    जीवन रत्न (Life Gemstone)
                  </span>
                  <h4 className="text-base font-extrabold text-yellow-300">
                    {kundali.lucky.ratnaName}
                  </h4>
                  <p className="text-xs text-amber-200/85">
                    <b>उपरत्न:</b> {kundali.lucky.uparatnaName}
                  </p>
                  <p className="text-xs text-emerald-300">
                    <b>धारण विधि:</b> {kundali.lucky.ratnaMetalAndFinger}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase">
                    आराध्य देव एवं रुद्राक्ष कवच
                  </span>
                  <h4 className="text-base font-extrabold text-amber-100">
                    {kundali.lucky.ishtaDevta}
                  </h4>
                  <p className="text-xs text-amber-200/85">
                    <b>शुभ रुद्राक्ष:</b> {kundali.lucky.rudraksha}
                  </p>
                  <p className="text-xs text-amber-300">
                    <b>शुभ वार:</b> {kundali.lucky.luckyDays}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase">
                    दैनिक भाग्योदय बीज मंत्र
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold font-vedic text-emerald-300">
                    {kundali.lucky.beejMantra}
                  </h4>
                  <p className="text-xs text-amber-200/80">
                    प्रतिदिन प्रातः स्नान के पश्चात 108 बार (1 माला) जप करने से ग्रह बाधा शांत होती है।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 space-y-2">
                  <h5 className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>कुंडली के प्रबल शुभ पक्ष (Planetary Strengths)</span>
                  </h5>
                  <ul className="space-y-1.5">
                    {kundali.remedies.strengths.map((s) => (
                      <li key={s} className="text-xs text-amber-100/90 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                  <h5 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>महत्वपूर्ण सावधानियां (Important Precautions)</span>
                  </h5>
                  <ul className="space-y-1.5">
                    {kundali.remedies.precautions.map((p) => (
                      <li key={p} className="text-xs text-amber-100/90 flex items-start gap-2">
                        <span className="text-amber-400 font-bold">!</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-600/40 space-y-3">
                <h5 className="text-sm sm:text-base font-bold font-vedic text-amber-200">
                  शास्त्रसम्मत सरल वैदिक उपाय (Recommended Vedic Upay):
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {kundali.remedies.upayList.map((u, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-amber-100/90 leading-relaxed"
                    >
                      <span className="font-bold text-amber-400 mr-1.5">उपाय {idx + 1}:</span>
                      {u}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-emerald-950/80 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="text-sm sm:text-base font-bold text-amber-100">
                    क्या आप अपनी कुंडली के किसी विशेष प्रश्न (विवाह, व्यापार, संतान या सरकारी नौकरी) पर सीधा परामर्श चाहते हैं?
                  </h4>
                  <p className="text-xs text-amber-300/85 mt-0.5">
                    पण्डित शशांक शर्मा जी से WhatsApp या फोन पर प्रत्यक्ष कुंडली विश्लेषण प्राप्त करें (विशेष शुल्क मात्र ₹100)।
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      onConsultPanditJi(
                        `मेरा नाम ${kundali.input.name} है (DOB: ${kundali.input.formattedDob}, समय: ${kundali.input.formattedTime}, लग्न: ${kundali.panchang.lagnaName}, राशि: ${kundali.panchang.moonRashiName}, नक्षत्र: ${kundali.panchang.nakshatraName})। मेरी वर्तमान महादशा ${currentDashaObj?.planet} चल रही है। कृपया मेरे करियर, धन और आगामी समय के लिए मार्गदर्शन दें।`
                      )
                    }
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-200 text-xs font-bold cursor-pointer"
                  >
                    पं. शशांक AI से पूछें
                  </button>
                  <a
                    href={getWhatsAppLink(getWhatsAppKundaliMessage())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-extrabold shadow-lg flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>सीधे WhatsApp पर कुंडली भेजें</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== LAST SEARCHED & FULL JANAM KUNDALI HISTORY WITH DELETE OPTIONS ==================== */}
      <div className="bg-[#0e1525] border-2 border-amber-800/50 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-lg font-bold font-vedic text-amber-100">
                खोजी गई जन्म कुंडली हिस्ट्री (Last Searched Kundali & History)
              </h4>
              <p className="text-xs text-amber-300/80">
                आपने जो भी पिछली कुंडली खोजी है, उसे यहाँ से पुनः देखें या डिलीट करें ({savedHistory.length} रिकॉर्ड)
              </p>
            </div>
          </div>

          {savedHistory.length > 0 && (
            <div className="flex items-center gap-2">
              {!confirmClearAll ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>सारी कुंडली हिस्ट्री डिलीट करें</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-rose-950 border border-rose-500 rounded-xl p-1.5">
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                  >
                    हाँ, सब डिलीट करें
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                  >
                    रद्द करें
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {savedHistory.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs sm:text-sm text-slate-400">
            अभी तक कोई जन्म कुंडली हिस्ट्री सेव नहीं है। जब आप ऊपर नाम, जन्म तिथि और समय डालकर कुंडली देखेंगे, तो आपकी अंतिम खोजी गई कुंडली यहाँ सेव हो जाएगी।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {savedHistory.map((item, index) => {
              const isLatest = index === 0;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isLatest
                      ? 'bg-gradient-to-br from-amber-950/60 via-slate-950 to-slate-900 border-2 border-amber-500/70 shadow-lg'
                      : 'bg-slate-950/90 border-amber-900/40 hover:border-amber-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      {isLatest ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                          अंतिम खोजी गई कुंडली (Last Searched)
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                          कुंडली #{index + 1}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.timestamp}
                      </span>
                    </div>

                    <h5 className="text-sm sm:text-base font-bold font-vedic text-amber-100 truncate">
                      {item.name}
                    </h5>

                    <div className="text-xs text-amber-300/90 font-mono mt-1">
                      जन्म तिथि: <b>{item.dob}</b> • समय: <b>{item.birthTime}</b>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5 truncate">
                      स्थान: {item.birthPlace || 'रुद्रपुर, उत्तराखण्ड'}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="text-emerald-300 truncate">
                        <b>लग्न:</b> {item.lagna}
                      </div>
                      <div className="text-amber-200 truncate">
                        <b>राशि:</b> {item.moonRashi}
                      </div>
                      <div className="text-amber-300/90 truncate col-span-2">
                        <b>नक्षत्र:</b> {item.nakshatra} (चरण {item.nakshatraPada})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleLoadFromHistory(item)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>कुंडली देखें</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteHistoryItem(item.id, item.name)}
                      className="py-2 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="इस कुंडली हिस्ट्री को डिलीट करें"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>डिलीट</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
