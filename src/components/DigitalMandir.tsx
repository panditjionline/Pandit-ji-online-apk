import React, { useState } from 'react';
import { Flame, Bell, Sparkles, Volume2, Share2, Award, Heart } from 'lucide-react';
import { addPunyaPoint, getPunyaPoints } from '../utils/punya';
import { playTempleBell, playShankhSound, speakHindiText } from '../utils/sound';
import { DigitalMandirDanpatr } from './DigitalMandirDanpatr';

interface DeityOption {
  id: string;
  name: string;
  title: string;
  day: string;
  mantra: string;
  aartiLine: string;
  shlok: string;
  meaning: string;
  image?: string;
  symbol: string;
}

const DEITIES: DeityOption[] = [
  {
    id: 'ganesh',
    name: 'श्री गणेश जी',
    title: 'विघ्नहर्ता श्री गणेश जी (ऋद्धि-सिद्धि दाता)',
    day: 'बुधवार विशेष',
    mantra: 'ॐ गं गणपतये नमो नमः ॥ श्री सिद्धिविनायक नमो नमः ॥',
    aartiLine: 'जय गणेश जय गणेश, जय गणेश देवा। माता जाकी पार्वती, पिता महादेवा॥',
    shlok: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    meaning: 'हे घुमावदार सूंड वाले, विशाल शरीर वाले, करोड़ों सूर्यों के समान तेजस्वी भगवान श्री गणेश! मेरे समस्त कार्यों को सदा निर्विघ्न पूर्ण करें।',
    image: '/assets/ganesh_ji.jpg',
    symbol: '🕉️',
  },
  {
    id: 'mahadev',
    name: 'श्री महादेव',
    title: 'देवाधिदेव महाकालेश्वर महादेव',
    day: 'सोमवार विशेष',
    mantra: 'ॐ नमः शिवाय ॥ ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ॥',
    aartiLine: 'ॐ जय शिव ओंकारा, स्वामी जय शिव ओंकारा। ब्रह्मा विष्णु सदाशिव, अर्द्धांगी धारा॥',
    shlok: 'कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्। सदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥',
    meaning: 'जो कर्पूर के समान गौर वर्ण वाले हैं, करुणा के अवतार हैं, संसार के सार हैं, उन माता भवानी सहित भगवान शिव को मैं नमन करता हूँ।',
    symbol: '🔱',
  },
  {
    id: 'vishnu',
    name: 'श्री लक्ष्मीनारायण',
    title: 'भगवान श्री हरि विष्णु एवं माँ महालक्ष्मी',
    day: 'गुरुवार एवं शुक्रवार विशेष',
    mantra: 'ॐ नमो भगवते वासुदेवाय ॥ ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद ॥',
    aartiLine: 'ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे। भक्त जनों के संकट, दास जनों के संकट, क्षण में दूर करे॥',
    shlok: 'शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्॥',
    meaning: 'जिनकी आकृति परम शांत है, जो शेषनाग की शैय्या पर शयन करते हैं, उन संपूर्ण विश्व के आधार भगवान श्री विष्णु को प्रणाम है।',
    symbol: '🪷',
  },
  {
    id: 'hanuman',
    name: 'श्री हनुमान जी',
    title: 'संकटमोचन पवनपुत्र श्री हनुमान जी',
    day: 'मंगलवार एवं शनिवार विशेष',
    mantra: 'ॐ हं हनुमते रुद्रात्मकाय हुं फट् ॥ जय श्री राम ॥',
    aartiLine: 'आरती कीजै हनुमान लला की। दुष्ट दलन रघुनाथ कला की॥',
    shlok: 'मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्। वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये॥',
    meaning: 'मन के समान गति और वायु के समान वेग वाले, बुद्धिमानों में श्रेष्ठ श्री राम के दूत हनुमान जी की मैं शरण लेता हूँ।',
    symbol: '🚩',
  },
];

interface DigitalMandirProps {
  onPointsChange?: (newPoints: number) => void;
}

const DigitalMandir: React.FC<DigitalMandirProps> = ({ onPointsChange }) => {
  const [selectedDeity, setSelectedDeity] = useState<DeityOption>(DEITIES[0]);
  const [points, setPoints] = useState<number>(getPunyaPoints());
  const [jyotiLit, setJyotiLit] = useState<boolean>(true);
  const [bellRinging, setBellRinging] = useState<boolean>(false);
  const [flowerShower, setFlowerShower] = useState<boolean>(false);
  const [aartiActive, setAartiActive] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [showShlok, setShowShlok] = useState<boolean>(true);

  const updatePoints = (amount: number, customMsg: string) => {
    const result = addPunyaPoint(amount);
    setPoints(result.newPoints);
    if (onPointsChange) onPointsChange(result.newPoints);
    setMessage(customMsg);
    setShowShlok(true);
  };

  const handleRingBell = () => {
    playTempleBell();
    setBellRinging(true);
    setTimeout(() => setBellRinging(false), 1200);
    updatePoints(5, '🔔 मंदिर घंटी नाद संपन्न! +5 पुण्य अंक अर्जित।');
  };

  const handleShankh = () => {
    playShankhSound();
    updatePoints(11, '🐚 पावन शंखनाद संपन्न! वातावरण सकारात्मक ऊर्जा से पूर्ण हुआ (+11 पुण्य अंक)।');
  };

  const handlePushpanjali = () => {
    playTempleBell();
    setFlowerShower(true);
    setTimeout(() => setFlowerShower(false), 2600);
    updatePoints(11, `🌸 ${selectedDeity.name} के श्री चरणों में दिव्य पुष्पांजलि अर्पित! (+11 पुण्य अंक)`);
  };

  const handleDarshanAarti = () => {
    playTempleBell();
    setJyotiLit(true);
    setAartiActive(true);
    setFlowerShower(true);
    setTimeout(() => {
      setAartiActive(false);
      setFlowerShower(false);
    }, 3500);
    updatePoints(21, `🪔 ${selectedDeity.name} की पावन आरती व दर्शन संपन्न! (+21 पुण्य अंक)`);
  };

  const handleWhatsAppShare = () => {
    const shareText = `🙏 *पण्डित जी ऑनलाइन - दिव्य डिजिटल मंदिर दर्शन* 🙏\n\n✨ *${selectedDeity.title}*\n📿 मंत्र: ${selectedDeity.mantra}\n📖 श्लोक: "${selectedDeity.shlok}"\nभावार्थ: ${selectedDeity.meaning}\n\nआचार्य पण्डित शशांक शर्मा (रुद्रपुर) - +91 7017279043`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      {/* Main Digital Mandir Sanctum Card */}
      <div className="rounded-3xl border border-amber-500/45 bg-gradient-to-b from-[#281b0c] via-[#17120b] to-[#0e0c09] p-5 shadow-2xl relative overflow-hidden">
        {/* Top Header & Punya Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>श्री डिजिटल मंदिर (गर्भगृह दर्शन)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {selectedDeity.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-[#23180b] px-4 py-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[11px] text-amber-200/75">कुल पुण्य अंक</p>
              <p className="text-base font-bold text-amber-400 tabular-nums">{points}</p>
            </div>
          </div>
        </div>

        {/* Deity Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {DEITIES.map((deity) => {
            const active = deity.id === selectedDeity.id;
            return (
              <button
                key={deity.id}
                onClick={() => {
                  setSelectedDeity(deity);
                  playTempleBell();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all border ${
                  active
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-[#1a1105] border-amber-300 shadow-lg'
                    : 'bg-[#19140e] text-amber-100/85 border-amber-500/25 hover:border-amber-500/50'
                }`}
              >
                <span className="mr-1.5">{deity.symbol}</span>
                <span>{deity.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sanctum Sanctorum (Garbhagriha) */}
        <div className="relative rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-[#331f0a] via-[#1c1309] to-[#110c06] p-6 text-center shadow-inner overflow-hidden">
          {/* Hanging Temple Bells Left & Right */}
          <button
            onClick={handleRingBell}
            title="घंटी बजाएं"
            className={`absolute top-3 left-4 flex flex-col items-center gap-1 p-2 rounded-2xl border border-amber-500/40 bg-[#261a0b]/90 text-amber-300 hover:bg-amber-500/20 transition-transform ${
              bellRinging ? 'scale-110 rotate-12' : ''
            }`}
          >
            <Bell className="w-6 h-6 text-amber-400" />
            <span className="text-[10px] font-bold">घंटी नाद</span>
          </button>

          <button
            onClick={handleRingBell}
            title="घंटी बजाएं"
            className={`absolute top-3 right-4 flex flex-col items-center gap-1 p-2 rounded-2xl border border-amber-500/40 bg-[#261a0b]/90 text-amber-300 hover:bg-amber-500/20 transition-transform ${
              bellRinging ? 'scale-110 -rotate-12' : ''
            }`}
          >
            <Bell className="w-6 h-6 text-amber-400" />
            <span className="text-[10px] font-bold">घंटी नाद</span>
          </button>

          {/* Flower Shower Overlay */}
          {flowerShower && (
            <div className="pointer-events-none absolute inset-0 flex justify-around items-start pt-4 z-20 animate-bounce">
              <span className="text-2xl">🌸</span>
              <span className="text-3xl">🌺</span>
              <span className="text-2xl">🌼</span>
              <span className="text-3xl">🪷</span>
              <span className="text-2xl">🌸</span>
              <span className="text-3xl">🌼</span>
            </div>
          )}

          {/* Deity Frame */}
          <div className="mx-auto w-44 h-44 sm:w-52 sm:h-52 rounded-3xl border-4 border-amber-400/80 shadow-[0_0_45px_rgba(245,158,11,0.35)] overflow-hidden bg-gradient-to-b from-amber-500/30 to-orange-950 flex items-center justify-center relative my-2">
            {selectedDeity.image ? (
              <img
                src={selectedDeity.image}
                alt={selectedDeity.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-6xl mb-2">{selectedDeity.symbol}</span>
                <span className="text-base font-bold text-amber-300">{selectedDeity.name}</span>
              </div>
            )}

            {/* Rotating Aarti Thali Indicator */}
            {aartiActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-amber-300 flex items-center justify-center animate-spin">
                  <span className="text-3xl">🪔</span>
                </div>
              </div>
            )}
          </div>

          {/* Akhand Jyoti Status */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-[#241709] px-4 py-1.5 text-xs font-bold text-amber-300">
            <Flame className={`w-4 h-4 ${jyotiLit ? 'text-orange-400 fill-amber-400' : 'text-slate-500'}`} />
            <span>{jyotiLit ? 'अखण्ड ज्योति प्रज्वलित है' : 'ज्योति प्रज्वलित करें'}</span>
          </div>

          {/* Sacred Mantra Display */}
          <p className="mt-3 text-sm sm:text-base font-bold text-amber-300 bg-[#1a1208]/90 border border-amber-500/25 rounded-2xl py-2.5 px-4">
            {selectedDeity.mantra}
          </p>
        </div>

        {/* Interactive Puja Ritual Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <button
            onClick={handleDarshanAarti}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 text-xs sm:text-sm font-bold text-[#1a1105] shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            <Flame className="w-4 h-4 stroke-[2.5]" />
            <span>आरती व दर्शन करें</span>
          </button>

          <button
            onClick={handlePushpanjali}
            className="flex items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-[#251a0d] px-4 py-3 text-xs sm:text-sm font-bold text-amber-200 hover:bg-amber-500/20 active:scale-95 transition-all"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>पुष्पांजलि अर्पण</span>
          </button>

          <button
            onClick={handleRingBell}
            className="flex items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-[#251a0d] px-4 py-3 text-xs sm:text-sm font-bold text-amber-200 hover:bg-amber-500/20 active:scale-95 transition-all"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>घंटी बजाएं</span>
          </button>

          <button
            onClick={handleShankh}
            className="flex items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-[#251a0d] px-4 py-3 text-xs sm:text-sm font-bold text-amber-200 hover:bg-amber-500/20 active:scale-95 transition-all"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>शंख ध्वनि</span>
          </button>
        </div>

        {/* Status Message Banner */}
        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-[#082c20] px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-300 flex items-center justify-between">
            <span>{message}</span>
            <span className="text-xs font-bold text-amber-300 shrink-0 ml-2">पुण्य: {points}</span>
          </div>
        )}

        {/* Divya Gyan Ka Sandesh / Shlok Box */}
        {showShlok && (
          <div className="mt-4 rounded-2xl border border-amber-500/35 bg-[#1c150c] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>दिव्य ज्ञान का संदेश एवं आरती श्लोक:</span>
              </h3>
              <button
                onClick={() => speakHindiText(`${selectedDeity.shlok} ${selectedDeity.meaning}`)}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg hover:bg-amber-500/25"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>श्लोक सुनें</span>
              </button>
            </div>
            <p className="text-sm sm:text-base font-bold text-amber-200 italic leading-relaxed">
              “{selectedDeity.shlok}”
            </p>
            <p className="text-xs sm:text-sm text-amber-100/85 leading-relaxed">
              <strong className="text-amber-400">भावार्थ:</strong> {selectedDeity.meaning}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🙏 *पण्डित जी ऑनलाइन - दिव्य डिजिटल मंदिर दर्शन* 🙏\n\n✨ *${selectedDeity.title}*\n📿 मंत्र: ${selectedDeity.mantra}\n📖 श्लोक: "${selectedDeity.shlok}"\nभावार्थ: ${selectedDeity.meaning}\n\nआचार्य पण्डित शशांक शर्मा (रुद्रपुर) - +91 7017279043`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-bold shadow transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>व्हाट्सऐप पर दर्शन व श्लोक शेयर करें</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Shri Digital Danpatr */}
      <DigitalMandirDanpatr />
    </div>
  );
};

export default DigitalMandir;
