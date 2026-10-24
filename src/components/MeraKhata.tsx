import React, { useState } from 'react';
import {
  User,
  Award,
  Flame,
  Compass,
  Calendar,
  MapPin,
  Phone,
  Sparkles,
  CheckCircle2,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import {
  UserProfile,
  PRESET_USERS,
  getPunyaPoints,
  getSadhanaDays,
  getJaapStats,
  getSavedKundalis,
  redeemConsultation,
} from '../utils/punya';

interface MeraKhataProps {
  user: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  onOpenLoginModal: () => void;
  onOpenTool?: (toolId: string) => void;
}

const MeraKhata: React.FC<MeraKhataProps> = ({
  user,
  onSelectUser,
  onOpenLoginModal,
  onOpenTool,
}) => {
  const [points, setPoints] = useState<number>(getPunyaPoints());
  const [redeemMsg, setRedeemMsg] = useState<string>('');
  const sadhanaDays = getSadhanaDays();
  const jaapStats = getJaapStats();
  const savedKundalis = getSavedKundalis();

  const handleRedeem = () => {
    const res = redeemConsultation();
    if (res.success && typeof res.newPoints === 'number') {
      setPoints(res.newPoints);
      setRedeemMsg('🎉 बधाई! 100 पुण्य अंक से आपका विशेष ज्योतिष परामर्श कूपन सक्रिय हो गया है।');
    } else {
      setRedeemMsg(res.message || '');
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-amber-500/45 bg-gradient-to-b from-[#261a0c] via-[#16110b] to-[#0f0c08] p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl border-2 border-amber-400 bg-[#1a1308] flex items-center justify-center text-2xl font-extrabold text-amber-400 shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>पंजीकृत यजमान खाता ({user.shortCode})</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {user.name} जी ({user.rashi})
              </h2>
              <p className="text-xs text-amber-200/80">
                नक्षत्र: {user.nakshatra} • गोत्र: {user.gotra || 'कश्यप'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLoginModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-[#251a0d] px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>खाता बदलें / लॉगिन</span>
          </button>
        </div>

        {/* Quick Account Switcher Pills (Shashank / Niraj / Pragya) */}
        <div className="rounded-2xl border border-amber-500/25 bg-[#14100a] p-3 mb-4">
          <p className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>सहेजे गए परिवार/यजमान खाते (1-क्लिक में बदलें):</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.values(PRESET_USERS).map((u) => {
              const isCurrent = u.phone === user.phone;
              return (
                <button
                  key={u.phone}
                  onClick={() => onSelectUser(u)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isCurrent
                      ? 'bg-amber-500 text-[#1a1105] border-amber-300 shadow'
                      : 'bg-[#1f170d] text-amber-200 border-amber-500/30 hover:border-amber-400'
                  }`}
                >
                  {u.name} ({u.shortCode}) • {u.rashi.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Personal Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="rounded-xl border border-amber-500/20 bg-[#18130c] p-3 flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-amber-200/60">पंजीकृत मोबाइल</p>
              <p className="font-bold text-white tabular-nums">+91 {user.phone}</p>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-[#18130c] p-3 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-amber-200/60">जन्म तिथि व समय</p>
              <p className="font-bold text-white tabular-nums">
                {user.dob} ({user.birthTime || '10:00'})
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-[#18130c] p-3 flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-amber-200/60">जन्म स्थान</p>
              <p className="font-bold text-white">{user.birthPlace}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sadhana & Punya Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-amber-500/35 bg-[#1b140b] p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
            <Award className="w-4 h-4" />
            <span>कुल पुण्य अंक</span>
          </div>
          <p className="text-2xl font-extrabold text-white tabular-nums">{points}</p>
          <p className="text-[11px] text-amber-200/70 mt-0.5">दर्शन व जप से अर्जित</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/35 bg-[#07261c] p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>दैनिक साधना दिवस</span>
          </div>
          <p className="text-2xl font-extrabold text-white tabular-nums">#{sadhanaDays}</p>
          <p className="text-[11px] text-emerald-200/75 mt-0.5">निरंतर आध्यात्मिक क्रम</p>
        </div>

        <div className="rounded-2xl border border-amber-500/35 bg-[#1b140b] p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
            <Flame className="w-4 h-4" />
            <span>पूर्ण १०८ मालाएं</span>
          </div>
          <p className="text-2xl font-extrabold text-white tabular-nums">
            {jaapStats.completedMalas}
          </p>
          <p className="text-[11px] text-amber-200/70 mt-0.5">रुद्राक्ष जप माला</p>
        </div>

        <div className="rounded-2xl border border-amber-500/35 bg-[#1b140b] p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
            <User className="w-4 h-4" />
            <span>कुल मंत्र जप संख्या</span>
          </div>
          <p className="text-2xl font-extrabold text-white tabular-nums">
            {jaapStats.lifetimeJaap}
          </p>
          <p className="text-[11px] text-amber-200/70 mt-0.5">आजीवन जप रिकॉर्ड</p>
        </div>
      </div>

      {/* Punya Redeem Section (Exclusive to ₹100 Special Offer) */}
      <div className="rounded-2xl border border-amber-500/45 bg-gradient-to-r from-[#24190c] to-[#18120a] p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <h3 className="text-sm font-black text-amber-400">
            पुण्य पॉइंट्स रिवार्ड्स (केवल ₹100 स्पेशल ऑफर हेतु मान्य)
          </h3>
          <p className="text-xs text-amber-100/85 mt-0.5">
            प्रतिदिन ऐप खोलने व दैनिक पंचांग दर्शन पर +1 पुण्य पॉइंट स्वतः जुड़ता है। संचित पुण्य पॉइंट्स केवल <strong>₹100 स्पेशल ऑफर</strong> के लिए रिडीम किए जा सकते हैं।
          </p>
          {redeemMsg && <p className="text-xs font-bold text-emerald-400 mt-1.5">{redeemMsg}</p>}
        </div>
        <button
          onClick={handleRedeem}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2.5 text-xs font-black text-[#1a1105] shadow hover:brightness-110 transition-all shrink-0 cursor-pointer"
        >
          ₹100 स्पेशल ऑफर रिडीम करें
        </button>
      </div>

      {/* Saved Janam Kundali History */}
      <div className="rounded-3xl border border-amber-500/35 bg-[#15110b] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <Compass className="w-5 h-5" />
            <span>सहेजी गई जन्म कुंडलियां एवं ज्योतिष रिकॉर्ड</span>
          </h3>
          {onOpenTool && (
            <button
              onClick={() => onOpenTool('kundali')}
              className="text-xs font-bold text-amber-300 underline hover:text-amber-200"
            >
              + नई कुंडली बनाएं
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {savedKundalis.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-amber-500/25 bg-[#1d160e] p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{item.name} जी की जन्म कुंडली</span>
                <span className="text-[11px] text-amber-300/80">{item.timestamp}</span>
              </div>
              <p className="text-xs text-amber-200/80">
                जन्म: {item.dob} • {item.birthTime} ({item.birthPlace})
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
                <div className="rounded-lg bg-[#130f0a] px-2.5 py-1.5">
                  <span className="text-amber-200/60 block text-[10px]">लग्न व राशि</span>
                  <span className="font-bold text-amber-300">
                    {item.lagna} / {item.sunRashi}
                  </span>
                </div>
                <div className="rounded-lg bg-[#130f0a] px-2.5 py-1.5">
                  <span className="text-amber-200/60 block text-[10px]">नक्षत्र व महादशा</span>
                  <span className="font-bold text-emerald-300">
                    {item.nakshatra.split(' ')[0]} • {item.currentMahadasha}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-amber-100/80 pt-1">
                <strong className="text-amber-400">शुभ रत्न:</strong> {item.luckyGemstone} •{' '}
                <span className="text-emerald-300">{item.manglikStatus}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeraKhata;
