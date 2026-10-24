import React, { useState } from 'react';
import {
  Flame,
  Bell,
  Volume2,
  Send,
  Sparkles,
  BookOpen,
  Compass,
  Heart,
  Target,
  ClipboardList,
  CheckSquare,
  Square,
  RotateCcw,
  Share2,
  PhoneCall,
  ArrowLeft,
} from 'lucide-react';
import {
  getJaapStats,
  saveJaapStats,
  addPunyaPoint,
  UserProfile,
  saveKundaliRecord,
} from '../utils/punya';
import {
  playBeadClick,
  playTempleBell,
  playShankhSound,
  speakHindiText,
} from '../utils/sound';
import {
  SACRED_TEXTS,
  RAM_SHALAKA_CHAUPAIS,
  RASHIS,
} from '../data/vedicData';
import { buildSingleDayPanchang, getISTCalendarParts } from '../utils/panchangCalendarEngine';
import { generateSampurnKundali } from '../utils/sampurnKundali';
import { calculateKundaliMilan } from '../utils/kundaliMilan';

const MANTRAS = [
  {
    id: 'shiv',
    title: 'पञ्चाक्षर शिव मंत्र',
    text: 'ॐ नमः शिवाय ॥',
    deity: 'देवाधिदेव महादेव',
  },
  {
    id: 'ganesh',
    title: 'विघ्नहर्ता गणेश मंत्र',
    text: 'ॐ गं गणपतये नमः ॥',
    deity: 'श्री गणेश जी',
  },
  {
    id: 'vishnu',
    title: 'द्वादशाक्षर विष्णु मंत्र',
    text: 'ॐ नमो भगवते वासुदेवाय ॥',
    deity: 'भगवान श्री लक्ष्मीनारायण',
  },
  {
    id: 'gayatri',
    title: 'वेदमाता गायत्री महामंत्र',
    text: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥',
    deity: 'माँ गायत्री एवं सूर्य देव',
  },
  {
    id: 'hanuman',
    title: 'संकटमोचन हनुमान मंत्र',
    text: 'ॐ हं हनुमते रुद्रात्मकाय हुं फट् ॥',
    deity: 'श्री हनुमान जी',
  },
];

export const JapMalaSection: React.FC<{ onPointsEarned?: () => void }> = ({
  onPointsEarned,
}) => {
  const [stats, setStats] = useState(getJaapStats());
  const [selectedMantra, setSelectedMantra] = useState(MANTRAS[0]);
  const [justCompleted, setJustCompleted] = useState(false);

  const handleBeadCount = () => {
    const nextCount = stats.currentCount + 1;
    let nextMalas = stats.completedMalas;
    let resetCount = nextCount;

    if (nextCount >= 108) {
      nextMalas += 1;
      resetCount = 0;
      setJustCompleted(true);
      playShankhSound();
      addPunyaPoint(51);
      if (onPointsEarned) onPointsEarned();
    } else {
      setJustCompleted(false);
      playBeadClick();
    }

    const updated = {
      currentCount: resetCount,
      completedMalas: nextMalas,
      lifetimeJaap: stats.lifetimeJaap + 1,
    };
    setStats(updated);
    saveJaapStats(updated);
  };

  const handleResetCurrent = () => {
    const updated = { ...stats, currentCount: 0 };
    setStats(updated);
    saveJaapStats(updated);
  };

  const progressPct = Math.min(100, Math.round((stats.currentCount / 108) * 100));

  return (
    <div className="rounded-3xl border border-amber-500/45 bg-gradient-to-b from-[#261a0c] via-[#16110b] to-[#0e0b08] p-5 shadow-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>१०८ मनके व ध्वनि साधना</span>
          </span>
          <h2 className="text-xl font-bold text-white">१०८ रुद्राक्ष मंत्र जप माला काउंटर</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => playTempleBell()}
            className="rounded-xl border border-amber-500/40 bg-[#23180b] px-3 py-2 text-xs font-bold text-amber-300 flex items-center gap-1"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>घंटी</span>
          </button>
          <button
            onClick={() => playShankhSound()}
            className="rounded-xl border border-amber-500/40 bg-[#23180b] px-3 py-2 text-xs font-bold text-amber-300 flex items-center gap-1"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>शंख</span>
          </button>
        </div>
      </div>

      {/* Mantra Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {MANTRAS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMantra(m)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border transition-all ${
              selectedMantra.id === m.id
                ? 'bg-amber-500 text-[#1a1105] border-amber-300 shadow'
                : 'bg-[#19130c] text-amber-200 border-amber-500/30'
            }`}
          >
            {m.title}
          </button>
        ))}
      </div>

      {/* Active Mantra Box */}
      <div className="rounded-2xl border border-amber-500/35 bg-[#18120a] p-4 text-center">
        <p className="text-xs text-amber-300/80 mb-1">आराध्य: {selectedMantra.deity}</p>
        <p className="text-base sm:text-lg font-extrabold text-amber-300">
          {selectedMantra.text}
        </p>
      </div>

      {/* Interactive Rudraksha Bead Tap Circle */}
      <div className="flex flex-col items-center justify-center py-4">
        <button
          onClick={handleBeadCount}
          className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-amber-400 bg-gradient-to-b from-[#3b240c] via-[#261708] to-[#170e05] shadow-[0_0_50px_rgba(245,158,11,0.35)] flex flex-col items-center justify-center active:scale-95 transition-transform group relative"
        >
          <span className="text-3xl mb-1">📿</span>
          <span className="text-4xl sm:text-5xl font-extrabold text-amber-400 tabular-nums">
            {stats.currentCount} <span className="text-xl text-amber-200/70">/ 108</span>
          </span>
          <span className="mt-2 rounded-full bg-amber-500 px-4 py-1 text-xs font-extrabold text-[#1a1105] shadow">
            जप करने हेतु स्पर्श करें
          </span>
        </button>

        {/* Progress Bar */}
        <div className="w-full max-w-sm mt-4">
          <div className="h-2.5 w-full rounded-full bg-[#1a140d] border border-amber-500/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-150"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {justCompleted && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/70 p-3.5 text-center text-xs sm:text-sm font-bold text-emerald-300">
          🎉 ॐ तत्सत्! आपकी १०८ मनकों की १ माला पूर्ण हुई! (+51 पुण्य अंक अर्जित)
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="rounded-2xl border border-amber-500/25 bg-[#17120b] p-3">
          <p className="text-[11px] text-amber-200/70">वर्तमान मनका</p>
          <p className="text-lg font-extrabold text-white tabular-nums">{stats.currentCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/25 bg-[#17120b] p-3">
          <p className="text-[11px] text-amber-200/70">पूर्ण मालाएं</p>
          <p className="text-lg font-extrabold text-amber-400 tabular-nums">
            {stats.completedMalas}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/25 bg-[#17120b] p-3">
          <p className="text-[11px] text-amber-200/70">कुल जप संख्या</p>
          <p className="text-lg font-extrabold text-emerald-400 tabular-nums">
            {stats.lifetimeJaap}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleResetCurrent}
          className="inline-flex items-center gap-1 text-xs text-amber-300/70 hover:text-amber-300"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>वर्तमान माला शून्य करें</span>
        </button>
      </div>
    </div>
  );
};

export const JyotishChatSection: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; text: string; timestamp: string }>
  >([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: `राधे राधे! जय श्री सीताराम! प्रणाम ${user.name} जी (${user.rashi})।\nमैं आचार्य पण्डित शशांक शर्मा (रुद्रपुर) का वैदिक ज्योतिष एवं कर्मकाण्ड परामर्श इंजन हूँ। आप अपनी राशि, कुंडली दोष, शुभ मुहूर्त, व्रत विधि या वैदिक पूजा के विषय में निःशुल्क प्रश्न पूछ सकते हैं।`,
      timestamp: 'अभी • ऑनलाइन',
    },
  ]);
  const [input, setInput] = useState('');

  const quickQuestions = [
    'आज के त्योहार व व्रत की पूजा विधि बताएं',
    `मेरी ${user.rashi.split(' ')[0]} राशि का गोचर फल व उपाय बताएं`,
    'गृह प्रवेश एवं रुद्राभिषेक का शुभ मुहूर्त क्या है?',
    'धन वृद्धि व व्यापार उन्नति का अचूक वैदिक उपाय',
  ];

  const generateVedicReply = (question: string): string => {
    const q = question.toLowerCase();
    const userRashiObj = RASHIS.find((r) => r.id === user.rashiKey) || RASHIS[7];

    const istNow = getISTCalendarParts(new Date());
    const livePanchang = buildSingleDayPanchang(istNow.year, istNow.month, istNow.day, true);

    if (q.includes('त्योहार') || q.includes('व्रत') || q.includes('पंचांग')) {
      return `राधे राधे! जय श्री सीताराम! आज के लाइव वैदिक पंचांग एवं पर्व का शास्त्रोक्त विवरण इस प्रकार है:\n\n📅 आज का पंचांग (${livePanchang.formattedDateHindi}):\n• हिन्दू संवत एवं मास: विक्रम संवत ${livePanchang.vikramSamvat}, ${livePanchang.hinduMaas}, ${livePanchang.paksha}, ${livePanchang.tithiName}\n• नक्षत्र: ${livePanchang.nakshatra} | योग: ${livePanchang.yoga}\n• सूर्योदय: ${livePanchang.sunrise} | सूर्यास्त: ${livePanchang.sunset}\n• सर्वश्रेष्ठ अभिजित मुहूर्त: ${livePanchang.abhijitMuhurat} (अति शुभ)\n• दिशा शूल: ${livePanchang.dishaShool} | राहु काल: ${livePanchang.rahuKaal}\n\n📿 शास्त्रोक्त पूजा विधि:\n1. प्रातः स्नान कर भगवान श्री गणेश एवं श्री लक्ष्मीनारायण को पीले पुष्प, तुलसी दल व पंचामृत अर्पित करें।\n2. विष्णु सहस्रनाम एवं श्री सूक्त का पाठ करें तथा संध्या काल में घी का दीपक जलाएं।\n\n✨ विशेष वैदिक मंत्र: "ॐ नमो भगवते वासुदेवाय॥ ॐ गं गणपतये नमः॥"`;
    }

    if (q.includes('राशि') || q.includes('गोचर')) {
      return `ओ३म् श्री गणेशाय नमः! ${user.name} जी (${user.rashi}):\n\n☀️ ${userRashiObj.gocharTitle}\n• ${userRashiObj.gocharBody(user.name)}\n• स्वामी ग्रह: ${userRashiObj.lord}\n• शुभ रंग: ${userRashiObj.luckyColor} | शुभ अंक: ${userRashiObj.luckyNumber}\n• आज का सात्विक उपाय: ${userRashiObj.remedy}`;
    }

    if (q.includes('मुहूर्त') || q.includes('गृह प्रवेश') || q.includes('रुद्राभिषेक')) {
      return `शुभम् भवतु! ${user.name} जी, वैदिक कर्मकाण्ड एवं अनुष्ठान हेतु आज एवं आगामी श्रेष्ठ मुहूर्त:\n\n🪔 1. महा रुद्राभिषेक एवं शिव पूजन: सोमवार, प्रदोष एवं शिवरात्रि तिथि अति उत्तम हैं।\n🏠 2. आज का अभिजित शुभ मुहूर्त: ${livePanchang.abhijitMuhurat} एवं अमृत काल: ${livePanchang.amritKaal}।\n📞 रुद्रपुर या ऑनलाइन संकल्प बुकिंग हेतु आचार्य पण्डित शशांक शर्मा जी से +91 7017279043 पर सीधा संपर्क करें।`;
    }

    return `ओ३म् स्वस्ति! ${user.name} जी (${user.rashi} • ${user.nakshatra}), आपके प्रश्न "${question}" के लिए वैदिक ज्योतिषीय परामर्श:\n\n• वर्तमान गोचर (${livePanchang.tithiName}, ${livePanchang.nakshatra}) में आपके कर्म व लाभ भाव में सकारात्मक ऊर्जा सक्रिय है।\n• नित्य प्रातः सूर्य अर्घ्य दें एवं "${userRashiObj.remedy}" का पालन करें।\n• व्यक्तिगत जन्म पत्रिका के गहन विश्लेषण हेतु आप आचार्य पण्डित शशांक शर्मा जी (+91 7017279043) से परामर्श ले सकते हैं।`;
  };

  const handleSend = (textToSend?: string) => {
    const finalMsg = (textToSend ?? input).trim();
    if (!finalMsg) return;

    const nowTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user' as const,
      text: finalMsg,
      timestamp: nowTime,
    };

    const replyMsg = {
      id: `a-${Date.now() + 1}`,
      role: 'assistant' as const,
      text: generateVedicReply(finalMsg),
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, userMsg, replyMsg]);
    if (!textToSend) setInput('');
  };

  return (
    <div className="rounded-3xl border border-amber-500/45 bg-gradient-to-b from-[#24190b] via-[#15100a] to-[#0d0b08] p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-amber-500/25 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden shrink-0">
            <img
              src="/assets/pandit_shashank.jpg"
              alt="पण्डित शशांक शर्मा"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#15100a]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-bold text-amber-400">
                पण्डित शशांक वैदिक ज्योतिष चैट
              </h2>
              <span className="rounded bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                निःशुल्क
              </span>
            </div>
            <p className="text-xs text-amber-100/80">
              आचार्य पण्डित शशांक शर्मा • २४×७ तार्किक वैदिक समाधान
            </p>
          </div>
        </div>

        <a
          href="tel:+917017279043"
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-extrabold text-[#1a1105] shadow"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>कॉल करें</span>
        </a>
      </div>

      {/* Quick Prompt Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="rounded-xl border border-amber-500/35 bg-[#1d150c] hover:bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 whitespace-nowrap shrink-0 transition-colors"
          >
            ✨ {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-3.5 text-xs sm:text-sm whitespace-pre-line leading-relaxed ${
                m.role === 'user'
                  ? 'bg-amber-500 text-[#1a1105] font-bold'
                  : 'border border-amber-500/30 bg-[#18130d] text-amber-50'
              }`}
            >
              <p>{m.text}</p>
              <p
                className={`text-[10px] mt-1.5 ${
                  m.role === 'user' ? 'text-[#1a1105]/70' : 'text-amber-300/60'
                }`}
              >
                {m.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-amber-500/20"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="अपना ज्योतिष या पूजा से जुड़ा प्रश्न यहाँ लिखें..."
          className="flex-1 rounded-xl border border-amber-500/35 bg-[#120e09] px-4 py-3 text-xs sm:text-sm text-white placeholder:text-amber-200/40 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 text-xs sm:text-sm font-bold text-[#1a1105] flex items-center gap-1.5 shadow-lg hover:brightness-110 shrink-0"
        >
          <span>पूछें</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export const DharmGyanSection: React.FC<{
  activeToolId?: string;
  onBackToHome?: () => void;
}> = ({ activeToolId, onBackToHome }) => {
  const [selectedText, setSelectedText] = useState(SACRED_TEXTS[0]);
  const [activeSubTab, setActiveSubTab] = useState<string>(activeToolId || 'aarti-chalisa');

  // Kundali Generator State
  const [kName, setKName] = useState('Niraj');
  const [kDob, setKDob] = useState('1996-03-10');
  const [kTime, setKTime] = useState('10:15');
  const [kPlace, setKPlace] = useState('रुद्रपुर, उत्तराखण्ड');
  const [generatedKundali, setGeneratedKundali] = useState<boolean>(true);

  // Gun Milan State
  const [boyName, setBoyName] = useState('आदित्य शर्मा');
  const [boyRashi, setBoyRashi] = useState('वृश्चिक');
  const [girlName, setGirlName] = useState('सौम्या पाण्डेय');
  const [girlRashi, setGirlRashi] = useState('कर्क');
  const [milanScore, setMilanScore] = useState<number>(28.5);

  // Ram Shalaka State
  const [shalakaResult, setShalakaResult] = useState(RAM_SHALAKA_CHAUPAIS[0]);

  // Puja Samagri Checklist
  const [samagriChecked, setSamagriChecked] = useState<Record<string, boolean>>({
    'रोली, मौली (कलावा) व अक्षत': true,
    'गाय का शुद्ध घी व कपूर': true,
    'गंगाजल, पंचामृत व शहद': true,
    'सुपारी, लौंग, इलायची व पान के पत्ते': false,
    'पीले व लाल पुष्प, दूर्वा व तुलसी दल': false,
    'नारियल (श्रीफल), ऋतु फल व मिष्ठान': false,
    'हवन समिधा, आम की लकड़ी व हवन सामग्री': false,
  });

  // Puja Booking Form
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingPuja, setBookingPuja] = useState('श्री सत्यनारायण कथा एवं हवन');
  const [bookingDate, setBookingDate] = useState('2026-10-25');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const subTabs = [
    { id: 'aarti-chalisa', label: '📖 आरती व चालीसा' },
    { id: 'kundali', label: '🧭 जन्म कुंडली' },
    { id: 'gun-milan', label: '💑 ३६ गुण मिलान' },
    { id: 'ram-shalaka', label: '🎯 राम शलाका' },
    { id: 'puja-samagri', label: '📋 पूजा सामग्री' },
    { id: 'puja-booking', label: '🪔 पूजा बुकिंग' },
    { id: 'vastu-shastra', label: '🏠 वास्तु व रत्न ज्ञान' },
  ];

  const liveKundaliReport = generateSampurnKundali(
    kName || 'Niraj',
    kDob || '1996-03-10',
    kTime || '10:15',
    kPlace || 'रुद्रपुर, उत्तराखण्ड'
  );

  const liveMilanReport = calculateKundaliMilan(
    `${boyName} (${boyRashi})`,
    `${girlName} (${girlRashi})`
  );

  const handleCreateKundali = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratedKundali(true);
    const activeMaha =
      liveKundaliReport.mahadashas.find((m) => m.isCurrent)?.planet ||
      liveKundaliReport.mahadashas[0]?.planet ||
      'बृहस्पति (Jupiter)';
    saveKundaliRecord({
      id: `jk-${Date.now()}`,
      name: kName || 'Yajman',
      dob: kDob,
      birthTime: kTime,
      birthPlace: kPlace,
      lagna: liveKundaliReport.panchang.lagnaName,
      moonRashi: liveKundaliReport.panchang.moonRashiName,
      sunRashi: liveKundaliReport.panchang.sunRashiName,
      nakshatra: `${liveKundaliReport.panchang.nakshatraName} (चरण ${liveKundaliReport.panchang.nakshatraPada})`,
      currentMahadasha: activeMaha,
      manglikStatus: liveKundaliReport.doshaAnalysis.manglik.severity,
      luckyGemstone: liveKundaliReport.lucky.ratnaName,
      timestamp: 'अभी सहेजा गया',
    });
    playTempleBell();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-amber-500/45 bg-gradient-to-b from-[#261a0c] via-[#15100a] to-[#0e0b08] p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>वैदिक धर्म व ज्योतिष विज्ञान कोष</span>
            </span>
            <h2 className="text-xl font-bold text-white">
              शास्त्रोक्त धर्म ज्ञान, कुंडली एवं वैदिक सुविधाएं
            </h2>
          </div>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-[#23180b] px-3 py-2 text-xs font-bold text-amber-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>मुख्य पृष्ठ</span>
            </button>
          )}
        </div>

        {/* Sub-navigation pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {subTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border transition-all ${
                activeSubTab === t.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-[#1a1105] border-amber-300 shadow'
                  : 'bg-[#19130c] text-amber-200 border-amber-500/30 hover:border-amber-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 1. Aarti, Chalisa & Stotra Reader */}
        {(activeSubTab === 'aarti-chalisa' || activeSubTab === 'video-satsang') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SACRED_TEXTS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedText(item)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedText.id === item.id
                      ? 'border-amber-400 bg-[#281c0d] shadow-md'
                      : 'border-amber-500/25 bg-[#16110b] hover:border-amber-500/50'
                  }`}
                >
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    {item.category} • {item.deity}
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">{item.title}</p>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-amber-500/35 bg-[#18120a] p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-amber-400">
                    {selectedText.title}
                  </h3>
                  <p className="text-xs text-amber-200/75">आराध्य: {selectedText.deity}</p>
                </div>
                <button
                  onClick={() => speakHindiText(selectedText.verses.join(' '))}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-extrabold text-[#1a1105] shadow"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>ऑडियो वाचन सुनें</span>
                </button>
              </div>

              <div className="space-y-2.5 py-2">
                {selectedText.verses.map((verse, idx) => (
                  <p
                    key={idx}
                    className="text-sm sm:text-base font-semibold text-amber-100 leading-relaxed"
                  >
                    {verse}
                  </p>
                ))}
              </div>

              <div className="rounded-xl border border-amber-500/25 bg-[#120e08] p-3 text-xs text-amber-200/90">
                <strong className="text-amber-400">आध्यात्मिक महत्व:</strong> {selectedText.meaning}
              </div>
            </div>
          </div>
        )}

        {/* 2. Sampoorna Janam Kundali Generator */}
        {(activeSubTab === 'kundali' || activeSubTab === 'shani-sade-sati') && (
          <div className="space-y-4">
            <form
              onSubmit={handleCreateKundali}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-2xl border border-amber-500/30 bg-[#17120b] p-4"
            >
              <div>
                <label className="block text-xs text-amber-200/80 mb-1">जातक का नाम</label>
                <input
                  type="text"
                  value={kName}
                  onChange={(e) => setKName(e.target.value)}
                  className="w-full rounded-xl border border-amber-500/35 bg-[#110d08] px-3 py-2 text-xs sm:text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-amber-200/80 mb-1">जन्म तिथि</label>
                <input
                  type="date"
                  value={kDob}
                  onChange={(e) => setKDob(e.target.value)}
                  className="w-full rounded-xl border border-amber-500/35 bg-[#110d08] px-3 py-2 text-xs sm:text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-amber-200/80 mb-1">जन्म समय</label>
                <input
                  type="time"
                  value={kTime}
                  onChange={(e) => setKTime(e.target.value)}
                  className="w-full rounded-xl border border-amber-500/35 bg-[#110d08] px-3 py-2 text-xs sm:text-sm text-white"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-2.5 text-xs sm:text-sm font-extrabold text-[#1a1105] shadow"
                >
                  कुंडली चार्ट बनाएं
                </button>
              </div>
            </form>

            {generatedKundali && (
              <div className="rounded-2xl border border-amber-500/35 bg-[#18120a] p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    <span>{kName} जी की वैदिक लग्न कुंडली एवं ग्रह स्पष्ट</span>
                  </h3>
                  <span className="text-xs text-emerald-400 font-bold">
                    ✓ खाते में सुरक्षित
                  </span>
                </div>

                {/* North Indian Diamond Kundali Chart SVG */}
                <div className="mx-auto max-w-xs aspect-square rounded-2xl border-2 border-amber-500/60 bg-[#120d07] p-2 relative">
                  <svg viewBox="0 0 200 200" className="w-full h-full stroke-amber-500/70 fill-none">
                    <rect x="2" y="2" width="196" height="196" strokeWidth="2" />
                    <line x1="2" y1="2" x2="198" y2="198" strokeWidth="1.5" />
                    <line x1="198" y1="2" x2="2" y2="198" strokeWidth="1.5" />
                    <polygon points="100,2 198,100 100,198 2,100" strokeWidth="1.5" />
                    <text x="100" y="45" textAnchor="middle" className="fill-amber-300 text-[8px] font-bold stroke-none">
                      लग्न ({liveKundaliReport.panchang.lagnaName.split(' ')[0]}) • {liveKundaliReport.lagnaChart[0]?.planets.map((p) => p.shortHindi).join(' ') || 'लग्न'}
                    </text>
                    <text x="45" y="103" textAnchor="middle" className="fill-white text-[8px] stroke-none">
                      चतुर्थ: {liveKundaliReport.lagnaChart[3]?.planets.map((p) => p.shortHindi).join(' ') || liveKundaliReport.lagnaChart[3]?.rashiNumber}
                    </text>
                    <text x="155" y="103" textAnchor="middle" className="fill-emerald-300 text-[8px] stroke-none">
                      दशम: {liveKundaliReport.lagnaChart[9]?.planets.map((p) => p.shortHindi).join(' ') || liveKundaliReport.lagnaChart[9]?.rashiNumber}
                    </text>
                    <text x="100" y="160" textAnchor="middle" className="fill-amber-200 text-[8px] stroke-none">
                      सप्तम: {liveKundaliReport.lagnaChart[6]?.planets.map((p) => p.shortHindi).join(' ') || liveKundaliReport.lagnaChart[6]?.rashiNumber}
                    </text>
                  </svg>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="rounded-xl bg-[#120e09] border border-amber-500/20 p-3">
                    <span className="text-amber-200/60 block">लग्न / चंद्र राशि</span>
                    <span className="font-bold text-white">
                      {liveKundaliReport.panchang.lagnaName.split(' ')[0]} / {liveKundaliReport.panchang.moonRashiName.split(' ')[0]}
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#120e09] border border-amber-500/20 p-3">
                    <span className="text-amber-200/60 block">नक्षत्र व चरण</span>
                    <span className="font-bold text-amber-300">
                      {liveKundaliReport.panchang.nakshatraName.split(' ')[0]} (चरण {liveKundaliReport.panchang.nakshatraPada})
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#120e09] border border-amber-500/20 p-3">
                    <span className="text-amber-200/60 block">शनि साढ़े साती स्थिति</span>
                    <span className="font-bold text-emerald-400">
                      {liveKundaliReport.doshaAnalysis.sadeSati.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. 36 Gun Milan */}
        {activeSubTab === 'gun-milan' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-amber-500/30 bg-[#18120a] p-4 space-y-2.5">
                <h4 className="text-sm font-bold text-amber-400">🤵 वर (Boy) का विवरण</h4>
                <input
                  type="text"
                  value={boyName}
                  onChange={(e) => setBoyName(e.target.value)}
                  className="w-full rounded-xl border border-amber-500/35 bg-[#110d08] px-3 py-2 text-xs text-white"
                  placeholder="वर का नाम"
                />
                <select
                  value={boyRashi}
                  onChange={(e) => {
                    setBoyRashi(e.target.value);
                  }}
                  className="w-full rounded-xl border border-amber-500/35 bg-[#110d08] px-3 py-2 text-xs text-white"
                >
                  {RASHIS.map((r) => (
                    <option key={r.id} value={r.hindiName}>
                      {r.symbol} {r.hindiName} ({r.englishName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-[#1c1014] p-4 space-y-2.5">
                <h4 className="text-sm font-bold text-rose-300">👰 कन्या (Girl) का विवरण</h4>
                <input
                  type="text"
                  value={girlName}
                  onChange={(e) => setGirlName(e.target.value)}
                  className="w-full rounded-xl border border-rose-500/35 bg-[#110d08] px-3 py-2 text-xs text-white"
                  placeholder="कन्या का नाम"
                />
                <select
                  value={girlRashi}
                  onChange={(e) => {
                    setGirlRashi(e.target.value);
                  }}
                  className="w-full rounded-xl border border-rose-500/35 bg-[#110d08] px-3 py-2 text-xs text-white"
                >
                  {RASHIS.map((r) => (
                    <option key={r.id} value={r.hindiName}>
                      {r.symbol} {r.hindiName} ({r.englishName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-[#07261c]/80 p-4 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>अष्टकूट ३६ गुण मिलान परिणाम</span>
              </div>
              <p className="text-3xl font-extrabold text-amber-400 tabular-nums">
                {liveMilanReport.totalScore} / 36 गुण
              </p>
              <p className="text-xs sm:text-sm font-bold text-white">
                {boyName} ({liveMilanReport.boyRashi}) एवं {girlName} ({liveMilanReport.girlRashi}) — {liveMilanReport.overallVerdict}
              </p>
              <p className="text-xs text-emerald-200/80">
                {liveMilanReport.verdictDescription}
              </p>
            </div>
          </div>
        )}

        {/* 4. Shri Ram Shalaka Prashnavali */}
        {activeSubTab === 'ram-shalaka' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-500/35 bg-[#18120a] p-4 text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Target className="w-4 h-4" />
                <span>श्री रामचरितमानस १५×१५ अक्षर चक्र</span>
              </div>
              <p className="text-xs text-amber-100/85">
                भगवान श्री सीताराम का ध्यान कर अपने मन में प्रश्न सोचें और नीचे किसी भी पावन अक्षर पर स्पर्श करें:
              </p>

              <div className="grid grid-cols-9 gap-1.5 max-w-md mx-auto py-2">
                {[
                  'सु', 'प्र', 'उ', 'ग', 'हो', 'मु', 'मं', 'ब', 'स',
                  'नु', 'बि', 'घ', 'र', 'इ', 'द', 'ग', 'र', 'फ',
                  'सि', 'सि', 'र', 'ल', 'हि', 'मं', 'ल', 'न', 'ल',
                  'य', 'न', 'ि', 'ू', 'सो', 'ग', 'भ', 'उ', 'सि',
                ].map((akshar, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playTempleBell();
                      setShalakaResult(
                        RAM_SHALAKA_CHAUPAIS[idx % RAM_SHALAKA_CHAUPAIS.length]
                      );
                    }}
                    className="aspect-square rounded-lg border border-amber-500/40 bg-[#251a0d] hover:bg-amber-500 hover:text-[#1a1105] text-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center transition-colors"
                  >
                    {akshar}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-amber-400/50 bg-[#24180b] p-4 text-left space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400">
                  ✨ {shalakaResult.result} ({shalakaResult.kand})
                </span>
                <p className="text-sm sm:text-base font-extrabold text-amber-300">
                  “{shalakaResult.chaupai}”
                </p>
                <p className="text-xs text-amber-100/90">
                  <strong className="text-amber-400">मार्गदर्शन:</strong> {shalakaResult.guidance}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Puja Samagri Checklist */}
        {activeSubTab === 'puja-samagri' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4" />
                <span>वैदिक पूजा एवं हवन सामग्री बाज़ार चेकलिस्ट</span>
              </h3>
              <button
                onClick={() => {
                  const items = Object.keys(samagriChecked).join('\n• ');
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      `🙏 *पण्डित जी ऑनलाइन - वैदिक पूजा सामग्री लिस्ट*:\n• ${items}`
                    )}`,
                    '_blank',
                    'noopener,noreferrer'
                  );
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>व्हाट्सऐप लिस्ट भेजें</span>
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(samagriChecked).map(([item, checked]) => (
                <button
                  key={item}
                  onClick={() =>
                    setSamagriChecked((prev) => ({ ...prev, [item]: !prev[item] }))
                  }
                  className="w-full flex items-center justify-between rounded-xl border border-amber-500/25 bg-[#18120a] px-4 py-3 text-left text-xs sm:text-sm"
                >
                  <span className={checked ? 'line-through text-amber-200/50' : 'text-white font-semibold'}>
                    {item}
                  </span>
                  {checked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. Vedic Puja Booking */}
        {activeSubTab === 'puja-booking' && (
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setBookingConfirmed(true);
                playShankhSound();
              }}
              className="rounded-2xl border border-amber-500/35 bg-[#18120a] p-4 space-y-3"
            >
              <h3 className="text-base font-bold text-amber-400">
                आचार्य पण्डित शशांक शर्मा जी के साथ वैदिक पूजा / अनुष्ठान बुकिंग
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  placeholder="यजमान का शुभ नाम"
                  className="rounded-xl border border-amber-500/35 bg-[#110d08] px-3.5 py-2.5 text-xs sm:text-sm text-white"
                  required
                />
                <input
                  type="tel"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  placeholder="मोबाइल नंबर (+91)"
                  className="rounded-xl border border-amber-500/35 bg-[#110d08] px-3.5 py-2.5 text-xs sm:text-sm text-white"
                  required
                />
                <select
                  value={bookingPuja}
                  onChange={(e) => setBookingPuja(e.target.value)}
                  className="rounded-xl border border-amber-500/35 bg-[#110d08] px-3.5 py-2.5 text-xs sm:text-sm text-white"
                >
                  <option>श्री सत्यनारायण कथा एवं हवन</option>
                  <option>नूतन गृह प्रवेश एवं वास्तु शांति</option>
                  <option>महा रुद्राभिषेक अनुष्ठान</option>
                  <option>नवग्रह शांति एवं महामृत्युंजय जप</option>
                  <option>व्यक्तिगत जन्म कुंडली परामर्श (1-on-1)</option>
                </select>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="rounded-xl border border-amber-500/35 bg-[#110d08] px-3.5 py-2.5 text-xs sm:text-sm text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-3 text-sm font-extrabold text-[#1a1105] shadow-lg"
              >
                पूजा संकल्प बुक करें
              </button>
            </form>

            {bookingConfirmed && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/70 p-4 text-xs sm:text-sm text-emerald-200 space-y-1">
                <p className="font-bold text-emerald-300">
                  ✅ शुभ संकल्प पंजीकृत! ({bookingPuja} • दिनांक: {bookingDate})
                </p>
                <p>
                  आचार्य पण्डित शशांक शर्मा जी (+91 7017279043) शीघ्र ही मुहूर्त व पूजा सामग्री के साथ आपसे संपर्क करेंगे।
                </p>
              </div>
            )}
          </div>
        )}

        {/* 7. Vastu, Navratna, Swarodaya & Swapna Shastra */}
        {(activeSubTab === 'vastu-shastra' ||
          activeSubTab === 'navratna-rudraksha' ||
          activeSubTab === 'swarodaya' ||
          activeSubTab === 'swapna-phal') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="rounded-2xl border border-amber-500/30 bg-[#18120a] p-4 space-y-1.5">
              <h4 className="font-bold text-amber-400">🏠 गृह वास्तु शास्त्र के अचूक नियम</h4>
              <p className="text-amber-100/85">
                • ईशान कोण (उत्तर-पूर्व) में सदैव मंदिर व जल स्थान रखें तथा इसे स्वच्छ व हल्का रखें।
              </p>
              <p className="text-amber-100/85">
                • आग्नेय कोण (दक्षिण-पूर्व) में रसोई घर तथा पूर्वमुखी होकर भोजन बनाना आरोग्यता देता है।
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-[#18120a] p-4 space-y-1.5">
              <h4 className="font-bold text-amber-400">💎 नवरत्न एवं रुद्राक्ष विज्ञान</h4>
              <p className="text-amber-100/85">
                • १ मुखी व ५ मुखी रुद्राक्ष भगवान शिव की कृपा, मानसिक शांति और रक्तचाप संतुलन हेतु श्रेष्ठ हैं।
              </p>
              <p className="text-amber-100/85">
                • लग्नेश, पंचमेश व भाग्येश ग्रह के अनुसार ही माणिक्य, मोती, मूंगा, पन्ना, पुखराज, हीरा या नीलम धारण करें।
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-[#18120a] p-4 space-y-1.5">
              <h4 className="font-bold text-amber-400">🌬️ स्वरोदय विज्ञान (इड़ा-पिंगला स्वर)</h4>
              <p className="text-amber-100/85">
                • बायां स्वर (चंद्र/इड़ा नाड़ी) चलने पर शुभ, शांत व स्थायी कार्य (विवाह, गृह प्रवेश, निवेश) प्रारंभ करें।
              </p>
              <p className="text-amber-100/85">
                • प्रातः निद्रा से जागकर जिस नासिका से श्वास चल रही हो, वही चरण पहले भूमि पर रखें।
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-[#18120a] p-4 space-y-1.5">
              <h4 className="font-bold text-amber-400">🌙 स्वप्न फल एवं शकुन शास्त्र</h4>
              <p className="text-amber-100/85">
                • स्वप्न में मंदिर की घंटी, गौ माता, श्वेत हाथी, कमल पुष्प या नदी दर्शन अत्यंत भाग्योदय कारक हैं।
              </p>
              <p className="text-amber-100/85">
                • पुरुषों की दाहिनी आंख/भुजा तथा स्त्रियों की बायीं आंख/भुजा का फड़कना शुभ समाचार का सूचक है।
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
