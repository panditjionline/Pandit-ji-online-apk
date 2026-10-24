import React, { useState, useEffect } from 'react';
import { generateSampurnKundali } from '../utils/sampurnKundali';
import { getNaamkaranDetails, VEDIC_NAKSHATRA_NAAMKARAN } from '../utils/naamkaranData';
import { upsertFamilyMember } from '../utils/familyVaultStorage';
import { vedicAudio } from '../utils/audioSynthesizer';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Baby,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookmarkCheck,
  Compass,
  ArrowRight,
  ShieldCheck,
  Star,
  Flame,
  Volume2,
  Copy,
  Check,
} from 'lucide-react';

interface NaamkaranFinderSectionProps {
  onOpenKundaliTab?: (name: string, dob: string, time: string, place: string) => void;
  onOpenFamilyVault?: () => void;
  onOpenChatWithQuery?: (query: string) => void;
}

export const NaamkaranFinderSection: React.FC<NaamkaranFinderSectionProps> = ({
  onOpenKundaliTab,
  onOpenFamilyVault,
  onOpenChatWithQuery,
}) => {
  const { tr } = useLanguage();

  const [babyName, setBabyName] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [dob, setDob] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [birthTime, setBirthTime] = useState<string>('08:30');
  const [birthPlace, setBirthPlace] = useState<string>('रुद्रपुर, उत्तराखण्ड');

  const [result, setResult] = useState<any>(null);
  const [copiedLetter, setCopiedLetter] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Calculate automatically on mount or submit
  const calculateNaamkaran = () => {
    try {
      const report = generateSampurnKundali(
        babyName.trim() || (gender === 'male' ? 'बालक' : 'बालिका'),
        dob,
        birthTime,
        birthPlace
      );

      // Find nakshatra index
      const nakshatraNameOnly = report.panchang.nakshatraName.split(' ')[0].trim();
      let matchedIdx = VEDIC_NAKSHATRA_NAAMKARAN.findIndex(
        (n) =>
          n.nameHindi.includes(nakshatraNameOnly) ||
          nakshatraNameOnly.includes(n.nameHindi) ||
          n.nameRoman.toLowerCase().includes(nakshatraNameOnly.toLowerCase())
      );
      if (matchedIdx === -1) matchedIdx = 0;

      const pada = report.panchang.nakshatraPada || 1;
      const details = getNaamkaranDetails(matchedIdx, pada);

      setResult({
        report,
        details,
        nakshatraName: report.panchang.nakshatraName,
        rashiName: report.panchang.moonRashiName,
        rashiLord: report.panchang.moonRashiLord,
        lagnaName: report.panchang.lagnaName,
        pada,
      });

      vedicAudio.playCrispTempleBell(0.7);
    } catch (err) {
      console.error('Naamkaran calculation error:', err);
    }
  };

  useEffect(() => {
    calculateNaamkaran();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLetter(text);
    setTimeout(() => setCopiedLetter(''), 2500);
  };

  const handleSaveToFamilyVault = () => {
    if (!result) return;
    const finalName = babyName.trim() || (gender === 'male' ? 'बालक (शिशु)' : 'बालिका (शिशु)');
    upsertFamilyMember({
      name: finalName,
      relation: gender === 'male' ? 'child_son' : 'child_daughter',
      gender,
      dob,
      birthTime,
      birthPlace,
      notes: `जन्म नक्षत्र: ${result.nakshatraName} (चरण ${result.pada}), नामाक्षर: ${result.details.currentPada.akshar}`,
      isPrimary: false,
    });
    setSaveSuccessMsg(`'${finalName}' को आपकी फैमिली वॉल्ट में सफलतापूर्वक सहेज लिया गया है!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#241306] via-[#1a0f05] to-[#0c1220] border-2 border-amber-500/70 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-yellow-300 text-xs font-bold mb-1">
              <Baby className="w-3.5 h-3.5 text-amber-400" />
              <span>{tr('वैदिक नामकरण एवं नक्षत्र नामाक्षर', 'Vedic Naamkaran & Nakshatra Letter Finder')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-vedic text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-400">
              {tr('शिशु का जन्म नक्षत्र व शुभ नामाक्षर खोजें', 'Find Auspicious Baby Naming Letter by Birth Nakshatra')}
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/80 max-w-2xl">
              {tr(
                'शास्त्रोक्त 27 नक्षत्रों एवं 108 पादों के अनुसार नवजात शिशु का सटीक जन्म नक्षत्र, चरण, चन्द्र राशि एवं शुभ नामाक्षर जानें।',
                'Calculate authentic birth star, quarter (Pada), Moon sign and auspicious naming letters for your newborn.'
              )}
            </p>
          </div>

          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-600/20 border-2 border-amber-400/60 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              👶
            </div>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#121929]/90 border border-amber-600/40 shadow-xl space-y-4">
        <h2 className="text-base sm:text-lg font-bold font-vedic text-amber-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{tr('शिशु की जन्म जानकारी दर्ज करें', 'Enter Baby Birth Details')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Baby Optional Name / Nickname */}
          <div>
            <label className="block text-xs font-semibold text-amber-200/90 mb-1">
              {tr('शिशु का नाम / उपनाम (वैकल्पिक)', 'Baby Name / Nickname (Optional)')}
            </label>
            <input
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="उदा. लल्ला, नन्ही परी..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-amber-700/50 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-amber-200/90 mb-1">
              {tr('शिशु का लिंग', 'Gender')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  gender === 'male'
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold shadow-md'
                    : 'bg-slate-950 text-amber-200/70 border-amber-900/50 hover:bg-slate-900'
                }`}
              >
                <span>👦 बालक (Boy)</span>
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  gender === 'female'
                    ? 'bg-rose-500 text-slate-950 border-rose-300 font-extrabold shadow-md'
                    : 'bg-slate-950 text-amber-200/70 border-amber-900/50 hover:bg-slate-900'
                }`}
              >
                <span>👧 बालिका (Girl)</span>
              </button>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-semibold text-amber-200/90 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{tr('जन्म तिथि (Date of Birth)', 'Date of Birth')}</span>
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-700/50 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Birth Time */}
          <div>
            <label className="block text-xs font-semibold text-amber-200/90 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{tr('जन्म समय (Birth Time)', 'Birth Time')}</span>
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-700/50 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Birth Place & Calculate Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="w-full sm:flex-1 relative">
            <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              placeholder="जन्म स्थान (उदा. रुद्रपुर, उत्तराखण्ड)"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-amber-700/50 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="button"
            onClick={calculateNaamkaran}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg border border-yellow-200 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{tr('शुभ नामाक्षर व नाम देखें', 'Calculate Auspicious Names')}</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Hero Card with Primary Auspicious Letter */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e1106] via-[#2a1708] to-[#121b2d] border-2 border-amber-400/80 p-5 sm:p-7 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md">
                    ⭐ मुख्य नामाक्षर (Primary Letter)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-yellow-300 border border-amber-500/40">
                    चरण {result.pada}
                  </span>
                  {result.details.nakshatra.isGandmool && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>गंडमूल नक्षत्र</span>
                    </span>
                  )}
                </div>

                <div className="pt-1">
                  <div className="text-xs text-amber-300/80 font-medium">शास्त्रोक्त प्रथम अक्षर:</div>
                  <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
                    <span className="text-4xl sm:text-6xl font-black font-vedic text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-400 tracking-wider">
                      "{result.details.currentPada.akshar}"
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-amber-300/90 font-mono">
                      ({result.details.currentPada.aksharRoman})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.details.currentPada.akshar)}
                      className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 cursor-pointer"
                      title="अक्षर कॉपी करें"
                    >
                      {copiedLetter === result.details.currentPada.akshar ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed pt-1">
                  शिशु का जन्म <strong className="text-yellow-300 font-vedic">{result.nakshatraName}</strong> नक्षत्र के{' '}
                  <strong className="text-yellow-300">चरण {result.pada}</strong> में हुआ है। अतः शिशु का नाम अक्षर{' '}
                  <span className="text-amber-300 font-bold">"{result.details.currentPada.akshar}"</span> से रखना
                  सर्वोत्तम एवं भाग्यशाली रहेगा।
                </p>
              </div>

              {/* Quick Astrological Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 w-full md:w-80 flex-shrink-0">
                <div className="p-3 rounded-2xl bg-black/60 border border-amber-600/40 text-center">
                  <div className="text-[10px] text-amber-300/80 font-semibold">जन्म नक्षत्र</div>
                  <div className="text-xs sm:text-sm font-bold text-amber-100 truncate mt-0.5">
                    {result.nakshatraName}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-black/60 border border-amber-600/40 text-center">
                  <div className="text-[10px] text-amber-300/80 font-semibold">चन्द्र राशि</div>
                  <div className="text-xs sm:text-sm font-bold text-yellow-300 truncate mt-0.5">
                    {result.rashiName}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-black/60 border border-amber-600/40 text-center">
                  <div className="text-[10px] text-amber-300/80 font-semibold">नक्षत्र स्वामी / देव</div>
                  <div className="text-xs sm:text-sm font-bold text-amber-200 truncate mt-0.5">
                    {result.details.nakshatra.lord}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-black/60 border border-amber-600/40 text-center">
                  <div className="text-[10px] text-amber-300/80 font-semibold">गण / नाड़ी</div>
                  <div className="text-xs sm:text-sm font-bold text-amber-200 truncate mt-0.5">
                    {result.details.nakshatra.gana} • {result.details.nakshatra.nadi}
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs Inside Hero */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-5 border-t border-amber-800/40">
              <button
                type="button"
                onClick={handleSaveToFamilyVault}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-md border border-emerald-300 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <BookmarkCheck className="w-4 h-4 text-slate-950" />
                <span>{tr('मेरी फैमिली वॉल्ट में सहेजें', 'Save Baby to Family Vault')}</span>
              </button>

              <div className="flex items-center gap-2">
                {onOpenKundaliTab && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenKundaliTab(
                        babyName.trim() || 'शिशु',
                        dob,
                        birthTime,
                        birthPlace
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 font-bold text-xs border border-amber-700/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>{tr('सम्पूर्ण जन्म कुंडली खोलें', 'Open Full Kundali')}</span>
                  </button>
                )}

                {onOpenChatWithQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenChatWithQuery(
                        `राधे राधे पण्डित जी! शिशु का जन्म नक्षत्र ${result.nakshatraName} चरण ${result.pada} है, नामाक्षर '${result.details.currentPada.akshar}' है। कृपया शास्त्रोक्त नामकरण संस्कार की पूर्ण विधि व शुभ दिन बताएं।`
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 font-bold text-xs border border-amber-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{tr('पण्डित जी से नामकरण विधि पूछें', 'Ask Pandit Ji')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Gandmool Warning if Applicable */}
          {result.details.nakshatra.isGandmool && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/50 border border-rose-500/60 text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>गंडमूल नक्षत्र विचार एवं शास्त्रोक्त शांति विधान:</span>
              </div>
              <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed">
                {result.details.nakshatra.gandmoolAdvice ||
                  'यह नक्षत्र गंडमूल श्रेणी में आता है। जन्म के 27वें दिन जब पुनः यही नक्षत्र आए, तब 27 कुओं के जल, 27 पेड़ों की पत्तियों एवं ब्राह्मणों द्वारा गंडमूल शांति पूजा करवाना शास्त्रसम्मत है।'}
              </p>
            </div>
          )}

          {/* Suggested Names for Primary Letter */}
          <div className="p-5 sm:p-7 rounded-3xl bg-[#121929]/90 border border-amber-600/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-800/40 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-vedic text-yellow-300 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>
                    अक्षर "{result.details.currentPada.akshar}" से शुभ वैदिक एवं आधुनिक नाम
                  </span>
                </h3>
                <p className="text-xs text-amber-200/70 mt-0.5">
                  {gender === 'male' ? 'बालकों (Boys) के लिए सुंदर नाम' : 'बालिकाओं (Girls) के लिए सुंदर नाम'}
                </p>
              </div>

              <div className="text-xs text-amber-300 font-semibold bg-amber-950/70 px-3 py-1 rounded-full border border-amber-700/40">
                राशि: {result.details.currentPada.rashi}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(gender === 'male'
                ? result.details.currentPada.boyNames
                : result.details.currentPada.girlNames
              ).map((nameItem: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-950/90 border border-amber-700/40 hover:border-amber-400 transition-all flex items-center justify-between group shadow-xs"
                >
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-yellow-300 font-vedic truncate block">
                      {nameItem}
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-medium">
                      शुभ नामाक्षर: {result.details.currentPada.akshar}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(nameItem.split(' ')[0])}
                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/30 text-amber-300 cursor-pointer"
                    title="नाम कॉपी करें"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* All 4 Padas of this Nakshatra (Complete Reference) */}
          <div className="p-5 sm:p-7 rounded-3xl bg-[#140e07] border border-amber-700/50 shadow-xl space-y-4">
            <h3 className="text-base sm:text-lg font-bold font-vedic text-amber-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>{result.nakshatraName} नक्षत्र के चारों चरणों के नामाक्षर</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {result.details.allPadas.map((pInfo: any) => {
                const isSelectedPada = pInfo.pada === result.pada;
                return (
                  <div
                    key={pInfo.pada}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelectedPada
                        ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : 'bg-black/50 border-amber-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">चरण {pInfo.pada}</span>
                      {isSelectedPada && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                          जन्म चरण
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-black font-vedic text-yellow-300 mt-2">
                      "{pInfo.akshar}"
                    </div>
                    <div className="text-[11px] text-amber-300/80 font-mono">
                      ({pInfo.aksharRoman})
                    </div>

                    <div className="text-[11px] text-amber-200/90 mt-2 border-t border-amber-900/40 pt-2 space-y-0.5">
                      <div>राशि: {pInfo.rashi}</div>
                      <div className="text-[10px] text-amber-400/80">स्वामी: {pInfo.rashiLord}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
