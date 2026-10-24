import React, { useState, useEffect, useMemo } from 'react';
import {
  AARTI_CHALISA_LIST,
  VASTU_ZONES_LIST,
  NAVRATNA_LIST,
  RUDRAKSHA_LIST,
  SWAPNA_PHAL_LIST,
  ANGA_SPHURAN_LIST,
  GITA_NITI_LIST,
  POPULAR_BABY_NAMES,
  SACRED_TEERTH_LIST,
  VRAT_PARANA_RULES,
} from '../data/vedicKnowledgeData';
import {
  RAM_SHALAKA_ANSWERS,
  RAM_SHALAKA_GRID,
  RamShalakaAnswer,
  RASHI_SHANI_DATA,
  PUJA_SAMAGRI_LISTS,
  SWARODAYA_DATA,
} from '../data/vedicToolsData';
import { vedicAudio } from '../utils/audioSynthesizer';
import { generateSampurnKundali } from '../utils/sampurnKundali';
import { getISTCalendarParts } from '../utils/panchangCalendarEngine';
import {
  Search,
  BookOpen,
  Volume2,
  VolumeX,
  Heart,
  Compass,
  Sparkles,
  Flame,
  Moon,
  Sun,
  ShieldCheck,
  Share2,
  Check,
  MessageCircle,
  Eye,
  Info,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
  ClipboardList,
  Wind,
  RotateCcw,
  CheckSquare,
  Square,
} from 'lucide-react';

export type DharmGyanTabType =
  | 'ram-shalaka'
  | 'shani-sadesati'
  | 'puja-samagri'
  | 'aarti-chalisa'
  | 'vrat-katha'
  | 'vastu'
  | 'ratna-rudraksha'
  | 'swapna-shakun'
  | 'swarodaya'
  | 'gita-niti'
  | 'baby-names'
  | 'teerth'
  | 'favorites';

interface DharmGyanKoshSectionProps {
  initialCategory?: DharmGyanTabType;
  onAskPanditInChat?: (promptText: string) => void;
  onOpenBookingModal?: () => void;
}

export const DharmGyanKoshSection: React.FC<DharmGyanKoshSectionProps> = ({
  initialCategory = 'aarti-chalisa',
  onAskPanditInChat,
  onOpenBookingModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<DharmGyanTabType>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>('all');
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('panditji_user_favorites');
      return saved ? JSON.parse(saved) : ['hanuman-chalisa', 'ganesh-aarti', 'ishan-northeast'];
    } catch {
      return ['hanuman-chalisa', 'ganesh-aarti'];
    }
  });

  // Ram Shalaka state
  const [shalakaAnswer, setShalakaAnswer] = useState<RamShalakaAnswer | null>(null);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);

  // Shani Sade Sati state & live IST transit refresh at 12:00 AM IST
  const [selectedShaniRashi, setSelectedShaniRashi] = useState<string>('कुम्भ');
  const [istDateKey, setIstDateKey] = useState<string>(() => getISTCalendarParts(new Date()).dateKey);

  useEffect(() => {
    const handleMidnight = () => {
      setIstDateKey(getISTCalendarParts(new Date()).dateKey);
    };
    window.addEventListener('panditji_midnight_refresh', handleMidnight);
    return () => window.removeEventListener('panditji_midnight_refresh', handleMidnight);
  }, []);

  const liveShaniTransit = useMemo(() => {
    const parts = getISTCalendarParts(new Date());
    const hhmm = `${String(parts.hours).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}`;
    const gochar = generateSampurnKundali('शनि गोचर', istDateKey, hhmm, 'रुद्रपुर, उत्तराखण्ड');
    return gochar.planets.find((p) => p.id === 'saturn');
  }, [istDateKey]);

  // Puja Samagri Checklist state
  const [selectedPujaId, setSelectedPujaId] = useState<string>('satyanarayan');
  const [checkedSamagri, setCheckedSamagri] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('panditji_puja_samagri_checked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>('hanuman-chalisa');
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  // Update category if initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  // Subscribe to speech state
  useEffect(() => {
    const unsub = vedicAudio.subscribeSpeech((id) => setActiveSpeechId(id));
    return unsub;
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('panditji_user_favorites', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Toggle item in Puja Samagri Checklist
  const toggleSamagriCheck = (itemId: string) => {
    setCheckedSamagri((prev) => {
      const updated = { ...prev, [itemId]: !prev[itemId] };
      try {
        localStorage.setItem('panditji_puja_samagri_checked', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resetSamagriChecklist = () => {
    setCheckedSamagri({});
    try {
      localStorage.removeItem('panditji_puja_samagri_checked');
    } catch {}
  };

  const handleShareOrCopy = (title: string, text: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareContent = `🚩 *${title}* 🚩\n\n${text}\n\n— पण्डित शशांक शर्मा जी द्वारा संचालित 'पण्डित जी ऑनलाइन' ऐप से साभार।`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareContent);
      setCopiedItemId(id);
      setTimeout(() => setCopiedItemId(null), 2500);
    }
  };

  const handleToggleSpeech = (speechId: string, textToSpeak: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeSpeechId !== speechId) {
      vedicAudio.playTempleBell(0.5);
    }
    vedicAudio.toggleSpeakText(textToSpeak, speechId);
  };

  // Handle Ram Shalaka Cell Click
  const handleShalakaCellClick = (index: number) => {
    setSelectedCellIndex(index);
    const answerId = (index % 9) + 1;
    const answer = RAM_SHALAKA_ANSWERS[answerId];
    setShalakaAnswer(answer);
  };

  const resetShalaka = () => {
    setSelectedCellIndex(null);
    setShalakaAnswer(null);
  };

  // Font size classes
  const fontClass =
    fontSizeLevel === 'xlarge'
      ? 'text-lg sm:text-xl leading-loose'
      : fontSizeLevel === 'large'
      ? 'text-base sm:text-lg leading-relaxed'
      : 'text-sm sm:text-base leading-relaxed';

  // Categories config
  const CATEGORIES: { id: DharmGyanTabType; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'ram-shalaka', label: 'श्री राम शलाका', icon: Target, badge: 'विशेष' },
    { id: 'shani-sadesati', label: 'शनि साढ़े साती', icon: Clock, badge: 'कैलकुलेटर' },
    { id: 'puja-samagri', label: 'पूजा सामग्री चेकलिस्ट', icon: ClipboardList, badge: 'मार्केट' },
    { id: 'aarti-chalisa', label: 'आरती व चालीसा', icon: Flame },
    { id: 'vrat-katha', label: 'व्रत व पारण नियम', icon: Calendar },
    { id: 'vastu', label: 'वास्तु शास्त्र', icon: Compass },
    { id: 'ratna-rudraksha', label: 'रत्न व रुद्राक्ष', icon: Sparkles },
    { id: 'swapna-shakun', label: 'स्वप्न फल व शकुन', icon: Moon },
    { id: 'swarodaya', label: 'स्वरोदय विज्ञान', icon: Wind },
    { id: 'gita-niti', label: 'गीता व चाणक्य नीति', icon: BookOpen },
    { id: 'baby-names', label: 'वैदिक शिशु नाम', icon: Sun },
    { id: 'teerth', label: 'तीर्थ व धाम दर्शन', icon: ShieldCheck },
    { id: 'favorites', label: `पसंदीदा (${favorites.length})`, icon: Heart },
  ];

  // Filtering for Aarti / Chalisa
  const filteredAartiChalisa = useMemo(() => {
    return AARTI_CHALISA_LIST.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.significance.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = selectedSubFilter === 'all' || item.category === selectedSubFilter;
      const matchFav = activeCategory !== 'favorites' || favorites.includes(item.id);
      return matchSearch && matchFilter && matchFav;
    });
  }, [searchQuery, selectedSubFilter, activeCategory, favorites]);

  // Filtering for Vastu
  const filteredVastu = useMemo(() => {
    return VASTU_ZONES_LIST.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.directionHindi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.element.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFav = activeCategory !== 'favorites' || favorites.includes(item.id);
      return matchSearch && matchFav;
    });
  }, [searchQuery, activeCategory, favorites]);

  // Filtering for Gemstones
  const filteredGemstones = useMemo(() => {
    return NAVRATNA_LIST.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.hindiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.planet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.suitableRashi.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchFav = activeCategory !== 'favorites' || favorites.includes(item.id);
      return matchSearch && matchFav;
    });
  }, [searchQuery, activeCategory, favorites]);

  // Active Puja Samagri List
  const activePujaChecklist = useMemo(() => {
    return PUJA_SAMAGRI_LISTS.find((p) => p.id === selectedPujaId) || PUJA_SAMAGRI_LISTS[0];
  }, [selectedPujaId]);

  // Active Shani Transit Info
  const activeShaniInfo = useMemo(() => {
    return RASHI_SHANI_DATA[selectedShaniRashi] || RASHI_SHANI_DATA['कुम्भ'];
  }, [selectedShaniRashi]);

  return (
    <section className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c0d02] via-[#2a1304] to-[#0c0702] border-2 border-amber-600/50 p-5 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.7)] text-amber-50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-yellow-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>संपूर्ण वैदिक एवं सनातन धर्म ज्ञान कोष</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-vedic text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-amber-400">
              वैदिक ज्ञान व साधना केंद्र
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-2xl leading-relaxed">
              श्री राम शलाका प्रश्नावली, शनि साढ़े साती कैलकुलेटर, पूजा सामग्री चेकलिस्ट, सम्पूर्ण आरती-चालीसा, वास्तु शास्त्र व स्वरोदय विज्ञान।
            </p>
          </div>

          {/* Quick Font Size Controls */}
          <div className="flex items-center gap-2.5 self-start md:self-auto bg-black/40 backdrop-blur-md px-3 py-2 rounded-2xl border border-amber-500/30">
            <span className="text-[11px] text-amber-300 font-semibold">अक्षर आकार:</span>
            <div className="inline-flex rounded-xl bg-amber-950/60 p-0.5 border border-amber-700/50">
              <button
                type="button"
                onClick={() => setFontSizeLevel('normal')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fontSizeLevel === 'normal' ? 'bg-amber-500 text-slate-950' : 'text-amber-200 hover:text-white'
                }`}
                title="सामान्य अक्षर"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSizeLevel('large')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fontSizeLevel === 'large' ? 'bg-amber-500 text-slate-950' : 'text-amber-200 hover:text-white'
                }`}
                title="बड़े अक्षर"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSizeLevel('xlarge')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fontSizeLevel === 'xlarge' ? 'bg-amber-500 text-slate-950' : 'text-amber-200 hover:text-white'
                }`}
                title="अति-विशाल अक्षर (वरिष्ठ जनों हेतु)"
              >
                A++
              </button>
            </div>
          </div>
        </div>

        {/* Universal Search Bar */}
        <div className="mt-5 relative z-10">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3.5 text-amber-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="आरती, चालीसा, वास्तु, शलाका, शनि, पूजा सामग्री, पुखराज, रुद्राक्ष या स्वप्न फल खोजें..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-black/60 border border-amber-500/50 focus:border-yellow-400 focus:outline-hidden text-sm sm:text-base text-amber-100 placeholder-amber-400/50 shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-amber-400 hover:text-amber-200 text-xs font-bold cursor-pointer"
              >
                हटाएं
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Category Selector Horizontal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedSubFilter('all');
              }}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/20 border-yellow-400 shadow-[0_4px_16px_rgba(245,158,11,0.25)] text-yellow-300'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-amber-800/40 text-amber-200/80 hover:text-amber-100'
              }`}
            >
              <div
                className={`p-2 rounded-xl flex-shrink-0 ${
                  isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-amber-950/60 text-amber-400'
                }`}
              >
                <IconComp className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold font-vedic block truncate">{cat.label}</span>
                {cat.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-yellow-300 border border-amber-500/40 w-fit inline-block mt-0.5">
                    {cat.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ================= 1. SHRI RAM SHALAKA PRASHNAVALI ================= */}
      {activeCategory === 'ram-shalaka' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 border-2 border-amber-600/50 space-y-4 shadow-xl">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-yellow-300 text-xs font-bold border border-amber-500/40">
                <Target className="w-4 h-4 text-yellow-400" />
                <span>गोस्वामी तुलसीदास कृत श्रीरामचरितमानस प्रश्नावली</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold font-vedic text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-200 to-amber-400">
                श्री राम शलाका प्रश्नावली
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                प्रभु श्री राम का मन में ध्यान करें, अपने अभीष्ट प्रश्न का चिंतन करें और नीचे दिए गए चक्र में किसी भी एक अक्षर पर श्रद्धापूर्वक स्पर्श करें।
              </p>
            </div>

            {/* Answer Result Card if cell selected */}
            {shalakaAnswer && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#1c1206] to-[#0c0903] border-2 border-yellow-400 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/40 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs text-amber-300 font-semibold font-vedic">{shalakaAnswer.sourceKand}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                        shalakaAnswer.result.includes('सफलता')
                          ? 'bg-emerald-500 text-slate-950'
                          : shalakaAnswer.result.includes('संशय')
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {shalakaAnswer.result}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleSpeech(
                          `shalaka-${shalakaAnswer.id}`,
                          `${shalakaAnswer.chaupai}। इसका अर्थ है: ${shalakaAnswer.meaning}। पण्डित जी का निर्णय: ${shalakaAnswer.explanation}`
                        )
                      }
                      className="p-1.5 rounded-lg bg-amber-950 border border-amber-600/40 text-amber-300 hover:text-white cursor-pointer"
                      title="चौपाई सुनें"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-amber-500/40 text-center">
                  <p className="text-base sm:text-xl font-extrabold font-vedic text-yellow-300 leading-relaxed">
                    “{shalakaAnswer.chaupai}”
                  </p>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-amber-100">
                  <p>
                    <strong className="text-amber-300">भावार्थ: </strong>
                    {shalakaAnswer.meaning}
                  </p>
                  <p className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/30 text-amber-200">
                    <strong className="text-yellow-300 block mb-0.5">🌟 प्रश्नोत्तर निष्कर्ष: </strong>
                    {shalakaAnswer.explanation}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={resetShalaka}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-200 text-xs font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>अन्य प्रश्न पूछें</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onAskPanditInChat?.(
                        `पण्डित जी, मैंने श्री राम शलाका प्रश्नावली पर प्रश्न पूछा था और मुझे चौपाई प्राप्त हुई: "${shalakaAnswer.chaupai}"। कृपया इस पर विस्तार से मार्गदर्शन करें।`
                      )
                    }
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>पण्डित जी से मार्गदर्शन लें</span>
                  </button>
                </div>
              </div>
            )}

            {/* 15 x 15 Grid */}
            <div className="bg-[#0b0f19] p-2 sm:p-4 rounded-2xl border border-amber-700/50 shadow-inner overflow-x-auto">
              <div className="grid grid-cols-15 gap-1 min-w-[340px] max-w-xl mx-auto">
                {RAM_SHALAKA_GRID.map((letter, idx) => {
                  const isSelected = selectedCellIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleShalakaCellClick(idx)}
                      className={`aspect-square flex items-center justify-center rounded-md text-[11px] sm:text-xs font-vedic font-bold transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-yellow-400 text-slate-950 scale-110 shadow-lg ring-2 ring-yellow-300'
                          : 'bg-amber-950/40 hover:bg-amber-500 hover:text-slate-950 text-amber-200 border border-amber-800/40'
                      }`}
                      title="स्पर्श करें"
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-amber-400/80 text-center italic">
              नोट: श्री राम शलाका में एक ही प्रश्न को बार-बार न पूछें। पूर्ण विश्वास एवं एकाग्रता से पूछा गया प्रथम उत्तर ही प्रामाणिक माना जाता है।
            </p>
          </div>
        </div>
      )}

      {/* ================= 2. SHANI SADE SATI & DHAIYA CALCULATOR ================= */}
      {activeCategory === 'shani-sadesati' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-950 border-2 border-amber-600/40 space-y-5 shadow-xl">
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-yellow-300 text-xs font-bold border border-amber-500/40">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span>तार्किक एवं भयमुक्त वैदिक विश्लेषण</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold font-vedic text-amber-100">
                शनि साढ़े साती एवं ढैय्या जांच व अचूक उपाय
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/80">
                अपनी चंद्र राशि चुनें और जानें शनि देव की वर्तमान स्थिति, प्रभाव एवं दशरथ कृत शनि स्तोत्र।
              </p>
            </div>

            {/* 12 Rashi Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {Object.keys(RASHI_SHANI_DATA).map((rashi) => {
                const isSelected = selectedShaniRashi === rashi;
                return (
                  <button
                    key={rashi}
                    type="button"
                    onClick={() => setSelectedShaniRashi(rashi)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold ring-2 ring-yellow-400'
                        : 'bg-slate-800/90 text-amber-200 border border-amber-700/40 hover:bg-slate-700'
                    }`}
                  >
                    {rashi} राशि
                  </button>
                );
              })}
            </div>

            {/* Shani Transit Detail Display */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121624] to-[#0e101a] border border-amber-500/50 space-y-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-800/40 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeShaniInfo.rashi} राशि
                    </span>
                    {liveShaniTransit && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                        लाइव शनि स्पष्ट: {liveShaniTransit.rashiName.split(' ')[0]} {liveShaniTransit.fullDegreeDMS} • {liveShaniTransit.nakshatra.split(' ')[0]} (चरण {liveShaniTransit.pada}){liveShaniTransit.isRetrograde ? ' • वक्री' : ' • मार्गी'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-vedic text-yellow-300 mt-1">
                    {activeShaniInfo.statusHeading}
                  </h3>
                  <span className="text-xs text-amber-200/70 font-semibold">
                    चरण: {activeShaniInfo.phaseName} • अवधि: {activeShaniInfo.durationYears}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleToggleSpeech(
                      `shani-${activeShaniInfo.rashi}`,
                      `${activeShaniInfo.rashi} राशि के लिए: ${activeShaniInfo.statusHeading}। प्रभाव: ${activeShaniInfo.generalImpact}। सकारात्मक पक्ष: ${activeShaniInfo.positiveSide}। उपाय: ${activeShaniInfo.remedies.join('। ')}`
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950 border border-amber-600/40 text-amber-300 hover:text-white text-xs font-bold cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>शनि विश्लेषण सुनें</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-black/40 border border-amber-800/40 space-y-1">
                  <strong className="text-yellow-300 block">⚡ सामान्य प्रभाव व जीवन में परिवर्तन:</strong>
                  <p className="text-amber-100 leading-relaxed">{activeShaniInfo.generalImpact}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-600/30 space-y-1">
                  <strong className="text-emerald-400 block">✨ सकारात्मक पक्ष (शनि देव का वरदान):</strong>
                  <p className="text-slate-200 leading-relaxed">{activeShaniInfo.positiveSide}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-700/30 text-xs">
                <strong className="text-red-400 block mb-0.5">⚠️ जरूरी सावधानियां:</strong>
                <p className="text-amber-100">{activeShaniInfo.precaution}</p>
              </div>

              {/* Remedies */}
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 space-y-2">
                <strong className="text-sm font-bold font-vedic text-yellow-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>शास्त्रसम्मत अचूक शनि शांति उपाय:</span>
                </strong>
                <ul className="space-y-1.5 text-xs text-amber-100">
                  {activeShaniInfo.remedies.map((remedy, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold mt-0.5">•</span>
                      <span>{remedy}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-900/30">
                <button
                  type="button"
                  onClick={() =>
                    onAskPanditInChat?.(
                      `पण्डित जी, मेरी राशि ${activeShaniInfo.rashi} है और वर्तमान में ${activeShaniInfo.statusHeading} चल रही है। मुझे भयमुक्त होकर क्या दैनिक उपाय करने चाहिए?`
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>पण्डित जी से व्यक्तिगत उपाय पूछें</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenBookingModal?.()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-extrabold cursor-pointer"
                >
                  <span>शनि शांति महापूजा बुक करें</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. PUJA SAMAGRI CHECKLIST ================= */}
      {activeCategory === 'puja-samagri' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-950 border-2 border-amber-600/40 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-yellow-300 text-xs font-bold border border-amber-500/40 mb-1.5">
                  <ClipboardList className="w-4 h-4 text-yellow-400" />
                  <span>बाज़ार व खरीदारी हेतु डिजिटल चेकलिस्ट</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold font-vedic text-amber-100">
                  सम्पूर्ण पूजा सामग्री चेकलिस्ट
                </h2>
                <p className="text-xs text-amber-200/80">
                  दुकान पर सामान खरीदते समय चेकबॉक्स पर टिक (✓) करें और पूरी सूची परिवार या पण्डित जी को WhatsApp पर भेजें।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetSamagriChecklist}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  title="सभी टिक हटाएं"
                >
                  रीसेट करें
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const itemsText = activePujaChecklist.items
                      .map((it, idx) => `${checkedSamagri[it.id] ? '✅' : '⬜'} ${idx + 1}. ${it.name} - ${it.quantity}`)
                      .join('\n');
                    const message = `🚩 *${activePujaChecklist.title}* 🚩\n\n${itemsText}\n\n— पण्डित शशांक शर्मा जी द्वारा संचालित 'पण्डित जी ऑनलाइन' से साभार।`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(message);
                      setCopiedItemId(activePujaChecklist.id);
                      setTimeout(() => setCopiedItemId(null), 2500);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  {copiedItemId === activePujaChecklist.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>लिस्ट कॉपी हो गई!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp पर शेयर</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Puja Type Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PUJA_SAMAGRI_LISTS.map((p) => {
                const isSelected = selectedPujaId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPujaId(p.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-extrabold border-yellow-300 shadow-md'
                        : 'bg-slate-800/80 text-amber-200 border-amber-800/40 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold font-vedic block leading-snug">{p.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Checklist items container */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#0e1422] border border-amber-700/40 space-y-3">
              <div className="border-b border-amber-800/30 pb-2">
                <h3 className="text-base font-bold font-vedic text-yellow-300">{activePujaChecklist.title}</h3>
                <p className="text-xs text-amber-200/80">{activePujaChecklist.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePujaChecklist.items.map((item, idx) => {
                  const isChecked = Boolean(checkedSamagri[item.id]);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSamagriCheck(item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-slate-300 opacity-75'
                          : 'bg-black/40 hover:bg-amber-950/30 border-amber-800/40 text-amber-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
                        )}
                        <span
                          className={`text-xs font-semibold leading-tight truncate ${
                            isChecked ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {idx + 1}. {item.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/30 flex-shrink-0">
                        {item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. SWARODAYA VIGYAN ================= */}
      {activeCategory === 'swarodaya' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-950 border-2 border-amber-600/40 space-y-5 shadow-xl">
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-yellow-300 text-xs font-bold border border-amber-500/40">
                <Wind className="w-4 h-4 text-yellow-400" />
                <span>प्राचीन शिव स्वरोदय शास्त्र</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold font-vedic text-amber-100">
                स्वरोदय विज्ञान (स्वर देखकर कार्य सिद्धि)
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/80">
                प्रातःकाल बिस्तर से उठते समय अथवा घर से निकलते समय सक्रिय स्वर का पैर आगे बढ़ाने से दिन भर सफलता प्राप्त होती है।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SWARODAYA_DATA.map((swar) => (
                <div
                  key={swar.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-[#121624] to-[#0e101a] border border-amber-600/40 space-y-3.5 shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40">
                      {swar.nadi}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold font-vedic text-amber-100">{swar.name}</h3>
                    <p className="text-xs text-amber-300/80 font-semibold">{swar.nature}</p>
                    <p className="text-xs text-slate-300">
                      <strong className="text-yellow-300">तत्त्व: </strong> {swar.element}
                    </p>

                    <div className="p-3 rounded-xl bg-black/40 border border-amber-800/40 space-y-1 text-xs">
                      <strong className="text-emerald-400 block mb-1">✅ इस स्वर में किए जाने वाले उत्तम कार्य:</strong>
                      <ul className="space-y-1 text-slate-300 text-[11px]">
                        {swar.bestTasks.map((t, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-700/30 text-[11px] text-amber-200/90">
                    <strong className="text-yellow-300 block mb-0.5">🔍 जांच कैसे करें:</strong>
                    {swar.howToCheck}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= EXISTING SECTION: AARTI, CHALISA & STOTRAM ================= */}
      {(activeCategory === 'aarti-chalisa' || activeCategory === 'favorites') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold font-vedic text-yellow-300 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>आरती, चालीसा एवं स्तोत्र संग्रह ({filteredAartiChalisa.length})</span>
            </h2>
            <span className="text-xs text-amber-300/70">पाठ व शुद्ध ध्वनि श्रवण</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredAartiChalisa.map((item) => {
              const isExpanded = expandedItemId === item.id;
              const isFav = favorites.includes(item.id);
              const isPlaying = activeSpeechId === `kosh-${item.id}`;

              return (
                <article
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? 'bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-900 border-amber-500/70 shadow-[0_8px_30px_rgba(245,158,11,0.15)]'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-amber-800/40'
                  }`}
                >
                  {/* Card Header Bar */}
                  <div
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                          {item.category === 'aarti'
                            ? 'आरती'
                            : item.category === 'chalisa'
                            ? 'चालीसा'
                            : 'स्तोत्रम्'}
                        </span>
                        <span className="text-xs text-amber-400 font-semibold">{item.deity}</span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">• {item.shubhDay}</span>
                      </div>
                      <h3 className="text-base sm:text-xl font-bold font-vedic text-amber-100 flex items-center gap-2">
                        <span>{item.title}</span>
                      </h3>
                      <p className="text-xs text-amber-300/80 italic font-vedic line-clamp-1">{item.tagline}</p>
                    </div>

                    {/* Action Buttons in Header */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleSpeech(`kosh-${item.id}`, item.audioMantraSnippet, e)}
                        className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                          isPlaying
                            ? 'bg-amber-500 text-slate-950 animate-pulse shadow-md'
                            : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-600/40'
                        }`}
                        title={isPlaying ? 'ध्वनि रोकें' : 'ध्वनि सुनें'}
                      >
                        {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isPlaying ? 'रोकें' : 'सुनें'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          isFav
                            ? 'bg-red-950/60 border-red-500 text-red-400'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-amber-200'
                        }`}
                        title={isFav ? 'पसंदीदा से हटाएं' : 'पसंदीदा में जोड़ें'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current text-red-500' : ''}`} />
                      </button>

                      <div className="p-2 text-amber-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-amber-800/30 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-black/40 border border-amber-600/30 text-xs">
                        <div>
                          <span className="font-bold text-yellow-300 block mb-0.5">🌟 महात्म्य व फल:</span>
                          <p className="text-amber-200/90 leading-relaxed">{item.significance}</p>
                        </div>
                        <div>
                          <span className="font-bold text-yellow-300 block mb-0.5">🪔 पाठ विधि व शुभ दिन:</span>
                          <p className="text-amber-200/90 leading-relaxed">
                            {item.vidhi} ({item.shubhDay})
                          </p>
                        </div>
                      </div>

                      <div className="p-4 sm:p-6 rounded-2xl bg-[#0e1422] border border-amber-700/40 shadow-inner">
                        <div className="flex items-center justify-between mb-3 border-b border-amber-800/30 pb-2">
                          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-vedic">
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            <span>सम्पूर्ण प्रामाणिक पाठ (हिंदी लिपि)</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) =>
                              handleShareOrCopy(item.title, item.lyrics.join('\n'), item.id, e)
                            }
                            className="text-xs font-bold text-amber-400 hover:text-yellow-300 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedItemId === item.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">कॉपी हो गया!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span>शेयर / कॉपी</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className={`space-y-2.5 font-vedic text-amber-100 ${fontClass}`}>
                          {item.lyrics.map((line, idx) => (
                            <p
                              key={idx}
                              className={`py-0.5 ${
                                line.startsWith('दोहा:')
                                  ? 'text-yellow-300 font-bold bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-800/30'
                                  : line.startsWith('चौपाई:')
                                  ? 'text-amber-200 font-semibold pt-1'
                                  : 'text-amber-50/90'
                              }`}
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            onAskPanditInChat?.(
                              `पण्डित जी, मुझे ${item.title} के नित्य पाठ की शास्त्रोक्त विधि, संकल्प और विशेष फल के बारे में मार्गदर्शन दें।`
                            )
                          }
                          className="px-3.5 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-600/50 text-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>पण्डित जी से इस पाठ पर मार्गदर्शन लें</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenBookingModal?.()}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>घर पर अनुष्ठान / पाठ बुक करें</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= EXISTING SECTION: VRAT & PARANA ================= */}
      {(activeCategory === 'vrat-katha' || (activeCategory === 'favorites' && favorites.length > 0)) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold font-vedic text-yellow-300 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>व्रत, उपवास एवं पारण नियम</span>
            </h2>
            <span className="text-xs text-amber-300/70">शास्त्रसम्मत आहार व पारण समय</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VRAT_PARANA_RULES.map((vrat) => (
              <div
                key={vrat.id}
                className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-700/40 space-y-3.5 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold font-vedic text-amber-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>{vrat.vratName}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleSpeech(
                        `vrat-${vrat.id}`,
                        `${vrat.vratName}। ${vrat.spiritualSignificance}। पारण नियम: ${vrat.paranaTimingRule}`
                      )
                    }
                    className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-300 text-xs cursor-pointer"
                    title="सुनें"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-amber-200/90 leading-relaxed">
                  <div>
                    <span className="font-bold text-yellow-300">📅 तिथि व समय नियम: </span>
                    <span>{vrat.tithiRule}</span>
                  </div>
                  <div>
                    <span className="font-bold text-yellow-300">⏰ पारण समय व मुहूर्त: </span>
                    <span className="text-amber-100 font-semibold">{vrat.paranaTimingRule}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-black/40 border border-amber-800/40 text-[11px]">
                  <div>
                    <span className="font-bold text-emerald-400 block mb-1">✅ क्या खा सकते हैं:</span>
                    <ul className="space-y-0.5 text-slate-300">
                      {vrat.dietRules.allowed.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <span className="text-emerald-400">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-red-400 block mb-1">❌ क्या सर्वथा वर्जित है:</span>
                    <ul className="space-y-0.5 text-slate-300">
                      {vrat.dietRules.strictlyAvoid.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <span className="text-red-400">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="text-xs text-amber-300/80 italic font-vedic border-t border-amber-800/30 pt-2">
                  ✨ फल: {vrat.spiritualSignificance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= EXISTING SECTION: VASTU SHASTRA ================= */}
      {(activeCategory === 'vastu' || (activeCategory === 'favorites' && favorites.length > 0)) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold font-vedic text-yellow-300 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <span>गृह वास्तु शास्त्र एवं दिशा निर्देश ({filteredVastu.length})</span>
            </h2>
            <span className="text-xs text-amber-300/70">बिना तोड़-फोड़ के वैदिक उपाय</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVastu.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#141b2d] border border-amber-600/40 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40">
                      {v.directionHindi} • {v.element}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold font-vedic text-amber-100 mt-1">{v.zone}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(v.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(v.id) ? 'fill-current text-red-500' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-600/30">
                    <span className="font-bold text-emerald-400 block mb-1">✅ उत्तम निर्माण:</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {v.recommended.map((r, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-600/30">
                    <span className="font-bold text-red-400 block mb-1">❌ भूलकर भी न बनाएं:</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {v.avoid.map((a, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-red-400 mt-0.5">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs">
                  <span className="font-bold text-yellow-300 flex items-center gap-1 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>सरल वास्तु दोष निवारण उपाय:</span>
                  </span>
                  <p className="text-amber-100 leading-relaxed">{v.quickRemedy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= EXISTING SECTION: NAVRATNA & RUDRAKSHA ================= */}
      {(activeCategory === 'ratna-rudraksha' || (activeCategory === 'favorites' && favorites.length > 0)) && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold font-vedic text-yellow-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>९ नवरत्न सम्पूर्ण मार्गदर्शिका</span>
              </h2>
              <span className="text-xs text-amber-300/70">राशि, धातु, उंगली व सिद्ध मंत्र</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGemstones.map((gem) => (
                <div
                  key={gem.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#171322] border border-amber-600/40 space-y-3 shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40">
                          {gem.planet}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold font-vedic text-amber-100 mt-1">
                          {gem.hindiName}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(gem.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(gem.id) ? 'fill-current text-red-500' : ''}`} />
                      </button>
                    </div>

                    <div className="space-y-1 text-xs text-amber-200/90 leading-relaxed">
                      <p>
                        <strong className="text-yellow-300">शुभ राशियां: </strong>
                        {gem.suitableRashi.join(', ')}
                      </p>
                      <p>
                        <strong className="text-yellow-300">धातु व उंगली: </strong>
                        {gem.metal} • {gem.finger}
                      </p>
                      <p>
                        <strong className="text-yellow-300">धारण दिन: </strong>
                        {gem.auspiciousDay}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs">
                      <strong className="text-amber-300 block mb-0.5">सिद्ध बीज मंत्र:</strong>
                      <span className="font-vedic font-bold text-yellow-200">{gem.mantra}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-emerald-400">लाभ: </strong> {gem.benefits}
                    </p>
                  </div>

                  <p className="text-[11px] text-amber-400/80 italic border-t border-amber-800/30 pt-2">
                    ⚠️ सावधानी: {gem.cautions}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Rudraksha List */}
          <div className="space-y-4 pt-4 border-t border-amber-800/30">
            <h2 className="text-lg sm:text-xl font-bold font-vedic text-yellow-300 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>१ से ७ मुखी रुद्राक्ष परिचय एवं धारण लाभ</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RUDRAKSHA_LIST.map((rud) => (
                <div
                  key={rud.mukhi}
                  className="p-4 rounded-2xl bg-slate-900 border border-amber-700/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold font-vedic text-amber-100 text-sm">{rud.mukhi}</h3>
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                      देवता: {rud.deity} • ग्रह: {rud.planet}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-yellow-300">लाभ: </strong> {rud.benefits}
                  </p>
                  <p className="text-amber-200/90">
                    <strong className="text-yellow-300">किन्हें धारण करना चाहिए: </strong> {rud.whoShouldWear}
                  </p>
                  <p className="font-vedic font-bold text-yellow-300 pt-1">
                    मंत्र: {rud.mantra} (108 बार जप करके धारण करें)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= EXISTING SECTION: SWAPNA PHAL & SHAKUN ================= */}
      {(activeCategory === 'swapna-shakun' || (activeCategory === 'favorites' && favorites.length > 0)) && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold font-vedic text-yellow-300 flex items-center gap-2">
                <Moon className="w-5 h-5 text-amber-400" />
                <span>स्वप्न फल दर्पण (सपनों का शास्त्रोक्त अर्थ)</span>
              </h2>
              <span className="text-xs text-amber-300/70">स्वप्न शास्त्र एवं वैदिक उपाय</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SWAPNA_PHAL_LIST.map((dream) => (
                <div
                  key={dream.id}
                  className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-700/40 space-y-2.5 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-bold font-vedic text-amber-100">
                      {dream.dreamObject}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        dream.nature === 'very_shubh'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : dream.nature === 'shubh'
                          ? 'bg-amber-500/20 text-yellow-300 border border-amber-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {dream.nature === 'very_shubh'
                        ? 'अति शुभ फल'
                        : dream.nature === 'shubh'
                        ? 'शुभ फल'
                        : 'अशुभ / सावधानी'}
                    </span>
                  </div>

                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    <strong className="text-yellow-300">स्वप्न का अर्थ: </strong> {dream.meaning}
                  </p>

                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs">
                    <strong className="text-amber-300 block mb-0.5">प्रातःकाल का अचूक उपाय:</strong>
                    <span className="text-amber-100">{dream.remedy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-amber-800/30">
            <h2 className="text-lg sm:text-xl font-bold font-vedic text-yellow-300 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              <span>सामुद्रिक अंग लक्षण (आंख व अंग फड़कने का फल)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ANGA_SPHURAN_LIST.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-amber-700/40 space-y-3 text-xs"
                >
                  <h3 className="font-bold font-vedic text-amber-100 text-sm border-b border-amber-800/30 pb-2">
                    {item.part}
                  </h3>
                  <div>
                    <span className="font-bold text-blue-400 block mb-0.5">👨 पुरुषों के लिए फल:</span>
                    <p className="text-slate-300">{item.maleResult}</p>
                  </div>
                  <div>
                    <span className="font-bold text-pink-400 block mb-0.5">👩 महिलाओं के लिए फल:</span>
                    <p className="text-slate-300">{item.femaleResult}</p>
                  </div>
                  <p className="text-[11px] text-amber-300/80 italic border-t border-amber-800/30 pt-2">
                    📖 शास्त्रोक्त तर्क: {item.vedicLogic}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= EXISTING SECTION: GITA & CHANAKYA NITI ================= */}
      {(activeCategory === 'gita-niti' || (activeCategory === 'favorites' && favorites.length > 0)) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold font-vedic text-yellow-300 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>श्रीमद्भगवद्गीता ज्ञान एवं चाणक्य नीति सूत्र</span>
            </h2>
            <span className="text-xs text-amber-300/70">जीवन प्रबंधन के शाश्वत नियम</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GITA_NITI_LIST.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950/15 to-slate-900 border border-amber-600/40 space-y-3.5 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40">
                      {item.category === 'gita' ? 'श्रीमद्भगवद्गीता' : 'आचार्य चाणक्य नीति'}
                    </span>
                    <h3 className="text-base font-bold font-vedic text-amber-100 mt-1">{item.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleSpeech(
                        `gita-${item.id}`,
                        `${item.sanskritVerse}। इसका हिंदी अर्थ है: ${item.hindiMeaning}।`
                      )
                    }
                    className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-300 text-xs cursor-pointer"
                    title="सुनें"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 border border-amber-600/30">
                  <p className="font-vedic font-bold text-yellow-300 text-sm sm:text-base leading-relaxed">
                    {item.sanskritVerse}
                  </p>
                </div>

                <div className="text-xs text-amber-100 leading-relaxed">
                  <strong className="text-amber-300 block mb-0.5">भावार्थ:</strong>
                  {item.hindiMeaning}
                </div>

                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs">
                  <strong className="text-yellow-300 block mb-0.5">🌟 दैनिक जीवन में व्यावहारिक प्रयोग:</strong>
                  <p className="text-slate-300 leading-relaxed">{item.lifeApplication}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= EXISTING SECTION: BABY NAMES ================= */}
      {activeCategory === 'baby-names' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold font-vedic text-yellow-300 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <span>वैदिक एवं आधुनिक हिंदू शिशु नाम ({POPULAR_BABY_NAMES.length})</span>
            </h2>
            <span className="text-xs text-amber-300/70">राशि, नक्षत्र व अक्षर अनुसार</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {POPULAR_BABY_NAMES.map((baby) => (
              <div
                key={baby.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-amber-700/40 space-y-1.5 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-yellow-200 font-vedic">{baby.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      baby.gender === 'boy'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-pink-500/20 text-pink-300'
                    }`}
                  >
                    {baby.gender === 'boy' ? 'बालक' : 'बालिका'}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-tight">
                  <strong className="text-amber-300">अर्थ: </strong>
                  {baby.meaning}
                </p>
                <div className="flex items-center justify-between text-[10px] text-amber-400/80 pt-1 border-t border-amber-900/30">
                  <span>राशि: {baby.rashi}</span>
                  <span>नक्षत्र: {baby.nakshatra}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= EXISTING SECTION: TEERTH & DHAMS ================= */}
      {activeCategory === 'teerth' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold font-vedic text-yellow-300 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>रुद्रपुर, कुमाऊं एवं उत्तराखंड के पावन तीर्थ व धाम</span>
            </h2>
            <span className="text-xs text-amber-300/70">दर्शन समय व इतिहास</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SACRED_TEERTH_LIST.map((teerth) => (
              <div
                key={teerth.id}
                className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-[#121624] border border-amber-600/40 space-y-3 shadow-md"
              >
                <div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40">
                    {teerth.location}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-vedic text-amber-100 mt-1">
                    {teerth.name}
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold">{teerth.deity}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{teerth.historicalSignificance}</p>

                <div className="p-3 rounded-xl bg-black/40 border border-amber-800/40 space-y-1 text-xs text-amber-200">
                  <p>
                    <strong className="text-yellow-300">⏰ दर्शन समय: </strong>
                    {teerth.darshanTiming}
                  </p>
                  <p>
                    <strong className="text-yellow-300">🪔 विशेष आरती: </strong>
                    {teerth.specialAarti}
                  </p>
                  <p>
                    <strong className="text-yellow-300">🚗 कैसे पहुंचे: </strong>
                    {teerth.howToReach}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Bottom Quick Consultation CTA */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-700/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-200/90 leading-relaxed">
            सभी शलाका सूत्र, शनि विश्लेषण, चेकलिस्ट व वास्तु निर्देश महर्षि पराशर व वेदों के प्रामाणिक सूत्रों के आधार पर संकलित हैं।
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onAskPanditInChat?.('पण्डित जी, मुझे अपनी कुंडली या घर के वास्तु अनुसार विशेष अनुष्ठान का सुझाव दीजिए।')
          }
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex-shrink-0 cursor-pointer whitespace-nowrap shadow-sm"
        >
          पण्डित जी से परामर्श लें
        </button>
      </div>
    </section>
  );
};
