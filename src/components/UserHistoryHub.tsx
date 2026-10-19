import React, { useState } from 'react';
import {
  UserMobileAccount,
  BookingRequest,
} from '../types';
import { RUDRAPUR_LOCALITIES } from '../data/mockData';
import {
  cleanMobileNumber,
  loginOrSyncMobileUser,
  clearLocalChatCache,
  clearLocalJaapCache,
  clearLocalKundaliCache,
  clearLocalJanamKundaliCache,
} from '../utils/userAccountStorage';
import {
  Phone,
  User,
  Lock,
  Eye,
  EyeOff,
  MessageCircle,
  Flame,
  HeartHandshake,
  Calendar,
  Sparkles,
  CheckCircle2,
  Trash2,
  LogOut,
  Save,
  ArrowRight,
  MapPin,
  Clock,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { JanamKundaliHistoryItem } from '../types';
import { generateSampurnKundali } from '../utils/sampurnKundali';

interface UserHistoryHubProps {
  currentUser: UserMobileAccount | null;
  allBookings: BookingRequest[];
  onLoginSuccess: (account: UserMobileAccount) => void;
  onUpdateAccount: (updated: UserMobileAccount) => void;
  onLogout: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenLoginModal: () => void;
  onDeleteBookingById?: (id: string) => void;
  onDeleteAllUserBookings?: () => void;
}

type HistorySubTab = 'all' | 'chat' | 'jaap' | 'janam_kundali' | 'milan' | 'bookings';

export const UserHistoryHub: React.FC<UserHistoryHubProps> = ({
  currentUser,
  allBookings,
  onLoginSuccess,
  onUpdateAccount,
  onLogout,
  onNavigateToTab,
  onOpenLoginModal,
  onDeleteBookingById,
  onDeleteAllUserBookings,
}) => {
  const [subTab, setSubTab] = useState<HistorySubTab>('all');
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deleteToast, setDeleteToast] = useState('');

  // Inline quick login states if user is not logged in
  const [quickPhone, setQuickPhone] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickPassword, setQuickPassword] = useState('');
  const [showQuickPassword, setShowQuickPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Profile edit states when logged in
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPassword, setEditPassword] = useState(currentUser?.password || '');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editRashi, setEditRashi] = useState(currentUser?.rashi || '');
  const [editDob, setEditDob] = useState(currentUser?.dob || '');
  const [editBirthTime, setEditBirthTime] = useState(currentUser?.birthTime || '');
  const [editBirthPlace, setEditBirthPlace] = useState(currentUser?.birthPlace || '');
  const [editLocality, setEditLocality] = useState(
    currentUser?.localityRudrapur || RUDRAPUR_LOCALITIES[0]
  );
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditPassword(currentUser.password || '');
      setEditRashi(currentUser.rashi || '');
      setEditDob(currentUser.dob || '');
      setEditBirthTime(currentUser.birthTime || '');
      setEditBirthPlace(currentUser.birthPlace || '');
      setEditLocality(currentUser.localityRudrapur || RUDRAPUR_LOCALITIES[0]);
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    setDeleteToast(msg);
    setTimeout(() => {
      setDeleteToast((prev) => (prev === msg ? '' : prev));
    }, 3200);
  };

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cleanMobileNumber(quickPhone);
    if (clean.length !== 10) {
      setLoginError('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!quickName.trim()) {
      setLoginError('कृपया अपना नाम दर्ज करें।');
      return;
    }
    if (!quickPassword.trim() || quickPassword.trim().length < 3) {
      setLoginError('कृपया सुरक्षा के लिए कम से कम 3 अक्षरों/अंकों का पासवर्ड दर्ज करें।');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const acc = await loginOrSyncMobileUser(clean, quickName.trim(), quickPassword.trim());
      onLoginSuccess(acc);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'WRONG_PASSWORD') {
        setLoginError('गलत पासवर्ड! इस मोबाइल नंबर का डेटा पासवर्ड से सुरक्षित है। कृपया सही पासवर्ड दर्ज करें।');
      } else {
        setLoginError('लॉगिन करने में त्रुटि हुई।');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updated: UserMobileAccount = {
      ...currentUser,
      name: editName.trim() || 'श्रद्धालु यजमान',
      password: editPassword.trim() || currentUser.password || '',
      rashi: editRashi.trim(),
      dob: editDob,
      birthTime: editBirthTime,
      birthPlace: editBirthPlace.trim(),
      localityRudrapur: editLocality,
    };
    onUpdateAccount(updated);
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  // ==================== DELETE HANDLERS FOR ALL HISTORIES ====================
  const handleClearChatHistory = () => {
    if (!currentUser) return;
    clearLocalChatCache();
    onUpdateAccount({
      ...currentUser,
      chatMessages: [],
    });
    showToast('आपकी संपूर्ण चैटबॉट हिस्ट्री डिलीट कर दी गई है।');
  };

  const handleDeleteSingleChatMessage = (msgId: string) => {
    if (!currentUser) return;
    const filtered = (currentUser.chatMessages || []).filter((m) => m.id !== msgId);
    onUpdateAccount({
      ...currentUser,
      chatMessages: filtered,
    });
    showToast('चयनित चैट संदेश हटा दिया गया है।');
  };

  const handleClearJaapHistoryOnly = () => {
    if (!currentUser) return;
    clearLocalJaapCache(false);
    onUpdateAccount({
      ...currentUser,
      jaapHistory: [],
    });
    showToast('आपकी मंत्र जप सत्र हिस्ट्री डिलीट कर दी गई है।');
  };

  const handleClearAllJaapStatsAndHistory = () => {
    if (!currentUser) return;
    clearLocalJaapCache(true);
    onUpdateAccount({
      ...currentUser,
      jaapStats: { currentCount: 0, completedMalas: 0, lifetimeJaap: 0 },
      jaapHistory: [],
    });
    showToast('आपके सभी मंत्र जप काउंट एवं जप हिस्ट्री डिलीट (0) कर दिए गए हैं।');
  };

  const handleDeleteSingleJaapItem = (itemId: string) => {
    if (!currentUser) return;
    const filtered = (currentUser.jaapHistory || []).filter((item) => item.id !== itemId);
    onUpdateAccount({
      ...currentUser,
      jaapHistory: filtered,
    });
    showToast('चयनित मंत्र जप रिकॉर्ड डिलीट कर दिया गया है।');
  };

  const handleClearKundaliHistory = () => {
    if (!currentUser) return;
    clearLocalKundaliCache();
    onUpdateAccount({
      ...currentUser,
      kundaliHistory: [],
    });
    showToast('आपकी संपूर्ण कुंडली मिलान हिस्ट्री डिलीट कर दी गई है।');
  };

  const handleDeleteSingleKundaliItem = (itemId: string) => {
    if (!currentUser) return;
    const filtered = (currentUser.kundaliHistory || []).filter((item) => item.id !== itemId);
    onUpdateAccount({
      ...currentUser,
      kundaliHistory: filtered,
    });
    showToast('चयनित कुंडली मिलान रिकॉर्ड डिलीट कर दिया गया है।');
  };

  const handleClearJanamKundaliHistory = () => {
    if (!currentUser) return;
    clearLocalJanamKundaliCache();
    onUpdateAccount({
      ...currentUser,
      janamKundaliHistory: [],
    });
    showToast('आपकी संपूर्ण जन्म कुंडली हिस्ट्री डिलीट कर दी गई है।');
  };

  const handleDeleteSingleJanamKundaliItem = (itemId: string) => {
    if (!currentUser) return;
    const filtered = (currentUser.janamKundaliHistory || []).filter((item) => item.id !== itemId);
    try {
      localStorage.setItem('panditji_sampurn_kundali_history', JSON.stringify(filtered));
    } catch {
      // ignore
    }
    onUpdateAccount({
      ...currentUser,
      janamKundaliHistory: filtered,
    });
    showToast('चयनित जन्म कुंडली रिकॉर्ड डिलीट कर दिया गया है।');
  };

  const handleOpenJanamKundaliItem = (item: JanamKundaliHistoryItem) => {
    try {
      localStorage.setItem('panditji_open_kundali_from_history', JSON.stringify(item));
    } catch {
      // ignore
    }
    onNavigateToTab('janam-kundali');
  };

  const handleDeleteSingleBooking = (bookingId: string) => {
    if (onDeleteBookingById) {
      onDeleteBookingById(bookingId);
      showToast('चयनित बुकिंग रिकॉर्ड डिलीट कर दिया गया है।');
    }
  };

  const handleClearAllBookings = () => {
    if (onDeleteAllUserBookings) {
      onDeleteAllUserBookings();
      showToast('आपकी सभी पूजा एवं परामर्श बुकिंग हिस्ट्री डिलीट कर दी गई है।');
    }
  };

  const handleDeleteAllEverything = () => {
    if (!currentUser) return;
    clearLocalChatCache();
    clearLocalJaapCache(true);
    clearLocalKundaliCache();
    clearLocalJanamKundaliCache();
    if (onDeleteAllUserBookings) {
      onDeleteAllUserBookings();
    }
    onUpdateAccount({
      ...currentUser,
      chatMessages: [],
      jaapStats: { currentCount: 0, completedMalas: 0, lifetimeJaap: 0 },
      jaapHistory: [],
      kundaliHistory: [],
      janamKundaliHistory: [],
    });
    setConfirmDeleteAll(false);
    showToast('आपके खाते से हर चीज़ की हिस्ट्री (चैट, मंत्र जप, जन्म कुंडली, कुंडली मिलान व बुकिंग) डिलीट कर दी गई है!');
  };

  // Filter bookings matching the logged-in user's mobile number
  const userBookings = currentUser
    ? allBookings.filter(
        (b) => cleanMobileNumber(b.phone) === cleanMobileNumber(currentUser.phone)
      )
    : [];

  const userChatMessages = currentUser?.chatMessages || [];
  const userJaapHistory = currentUser?.jaapHistory || [];
  const userKundaliHistory = currentUser?.kundaliHistory || [];
  const userJanamKundaliHistory: JanamKundaliHistoryItem[] = (() => {
    const rawList =
      currentUser?.janamKundaliHistory && currentUser.janamKundaliHistory.length > 0
        ? currentUser.janamKundaliHistory
        : (() => {
            try {
              const guest = localStorage.getItem('panditji_sampurn_kundali_history');
              return guest ? JSON.parse(guest) : [];
            } catch {
              return [];
            }
          })();
    if (!Array.isArray(rawList)) return [];
    return rawList
      .filter((item): item is JanamKundaliHistoryItem => Boolean(item && typeof item === 'object'))
      .map((item) => {
        try {
          const rep = generateSampurnKundali(
            String(item.name || 'श्रद्धालु यजमान'),
            String(item.dob || '1996-03-10'),
            String(item.birthTime || '10:00'),
            String(item.birthPlace || 'रुद्रपुर, उत्तराखण्ड')
          );
          const activeDasha =
            rep.mahadashas.find((m) => m.isCurrent)?.planet || rep.mahadashas[0]?.planet || 'गुरु';
          return {
            ...item,
            lagna: rep.panchang.lagnaName,
            moonRashi: rep.panchang.moonRashiName,
            sunRashi: rep.panchang.sunRashiName,
            nakshatra: rep.panchang.nakshatraName,
            nakshatraPada: rep.panchang.nakshatraPada,
            currentMahadasha: activeDasha,
            manglikStatus: rep.doshaAnalysis.manglik.severity,
            luckyGemstone: rep.lucky.ratnaName,
          };
        } catch {
          return item;
        }
      });
  })();

  if (!currentUser) {
    return (
      <section className="w-full max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="rounded-3xl bg-gradient-to-br from-[#1b1108] via-[#101726] to-[#0b101d] border-2 border-amber-500/50 p-5 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left border-b border-amber-800/40 pb-5 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 shadow-xl">
              <Phone className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                मोबाइल नंबर से लॉगिन एवं सम्पूर्ण हिस्ट्री
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-vedic text-amber-100 mt-1">
                अपना मोबाइल नंबर डालें और अपना डेटा व हिस्ट्री देखें
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1">
                अपने 10 अंकों के मोबाइल नंबर से लॉगिन करके अपनी <b>चैटबॉट बातचीत</b>, <b>मंत्र जप काउंटर</b>, <b>कुंडली मिलान</b> और <b>पूजा बुकिंग</b> की संपूर्ण हिस्ट्री देखें या डिलीट करें।
              </p>
            </div>
          </div>

          <form onSubmit={handleInlineLogin} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                आपका 10 अंकों का मोबाइल नंबर (Mobile Number) *
              </label>
              <div className="flex items-center bg-slate-950 border-2 border-amber-500/60 rounded-xl overflow-hidden">
                <span className="px-4 py-3.5 bg-amber-950/70 text-amber-300 font-mono font-bold text-base border-r border-amber-800/50">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="अपना 10 अंकों का मोबाइल नंबर लिखें..."
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-4 py-3.5 bg-transparent text-amber-100 font-mono font-bold text-base sm:text-lg tracking-wider focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  आपका नाम (Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. राहुल शर्मा"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  सुरक्षित पासवर्ड (Password) *
                </label>
                <div className="relative">
                  <input
                    type={showQuickPassword ? 'text' : 'password'}
                    required
                    placeholder="अपना पासवर्ड दर्ज करें"
                    value={quickPassword}
                    onChange={(e) => {
                      setQuickPassword(e.target.value);
                      setLoginError('');
                    }}
                    className="w-full px-4 pr-10 py-3 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowQuickPassword(!showQuickPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-amber-300 cursor-pointer"
                  >
                    {showQuickPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isLoggingIn ? 'लॉगिन हो रहा है...' : 'मोबाइल नंबर व पासवर्ड से लॉगिन करें'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-full overflow-x-hidden space-y-6 animate-fadeIn">
      {/* Status Toast for Deletion */}
      {deleteToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{deleteToast}</span>
        </div>
      )}

      {/* Top Logged-In User Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/90 via-[#191108] to-[#0e1525] border-2 border-amber-500/60 p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 font-extrabold text-lg sm:text-xl flex items-center justify-center shadow-lg flex-shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'ॐ'}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                  <Lock className="w-3 h-3" /> पासवर्ड सुरक्षित लॉगिन सक्रिय
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-slate-950/80 px-2.5 py-0.5 rounded-lg border border-amber-700/40">
                  +91 {currentUser.phone}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-vedic text-amber-100 mt-1 truncate">
                {currentUser.name}
              </h2>
              <p className="text-xs text-amber-300/80">
                यहाँ से आप अपनी हर चीज़ की हिस्ट्री देख सकते हैं और किसी भी हिस्ट्री को डिलीट कर सकते हैं
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-shrink-0">
            {!confirmDeleteAll ? (
              <button
                type="button"
                onClick={() => setConfirmDeleteAll(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>सारी हिस्ट्री डिलीट करें</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-rose-950 border border-rose-500 rounded-xl p-1.5">
                <button
                  type="button"
                  onClick={handleDeleteAllEverything}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  हाँ, सब डिलीट करें
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteAll(false)}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  रद्द करें
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-3.5 py-2 rounded-xl bg-amber-900/70 hover:bg-amber-800 border border-amber-500/40 text-amber-100 text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>नंबर बदलें</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* 5 Summary Stat Cards with Quick Delete Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5 pt-4 border-t border-amber-800/40">
          {/* Card 1: Chatbot */}
          <div
            onClick={() => setSubTab('chat')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              subTab === 'chat'
                ? 'bg-amber-500/20 border-amber-400'
                : 'bg-slate-950/80 border-amber-900/40 hover:border-amber-600/50'
            }`}
          >
            <div>
              <span className="text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                <MessageCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> चैटबॉट हिस्ट्री
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-100 mt-1">
                {userChatMessages.length}
              </div>
            </div>
            <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400">संदेश</span>
              {userChatMessages.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearChatHistory();
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> डिलीट
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Mantra Jaap */}
          <div
            onClick={() => setSubTab('jaap')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              subTab === 'jaap'
                ? 'bg-amber-500/20 border-amber-400'
                : 'bg-slate-950/80 border-amber-900/40 hover:border-amber-600/50'
            }`}
          >
            <div>
              <span className="text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                <Flame className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" /> कुल मंत्र जप
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-yellow-400 mt-1">
                {currentUser.jaapStats?.lifetimeJaap || 0}
              </div>
            </div>
            <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 truncate">
                {userJaapHistory.length} सत्र
              </span>
              {((currentUser.jaapStats?.lifetimeJaap || 0) > 0 || userJaapHistory.length > 0) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAllJaapStatsAndHistory();
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5 cursor-pointer flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" /> डिलीट
                </button>
              )}
            </div>
          </div>

          {/* Card 3: Sampurn Janam Kundali */}
          <div
            onClick={() => setSubTab('janam_kundali')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              subTab === 'janam_kundali'
                ? 'bg-amber-500/20 border-amber-400'
                : 'bg-slate-950/80 border-amber-900/40 hover:border-amber-600/50'
            }`}
          >
            <div>
              <span className="text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                <Compass className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> सम्पूर्ण कुंडली
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-200 mt-1">
                {userJanamKundaliHistory.length}
              </div>
            </div>
            <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400">जन्म पत्रिका</span>
              {userJanamKundaliHistory.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearJanamKundaliHistory();
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> डिलीट
                </button>
              )}
            </div>
          </div>

          {/* Card 4: Kundali Milan */}
          <div
            onClick={() => setSubTab('milan')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              subTab === 'milan'
                ? 'bg-amber-500/20 border-amber-400'
                : 'bg-slate-950/80 border-amber-900/40 hover:border-amber-600/50'
            }`}
          >
            <div>
              <span className="text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" /> कुंडली मिलान
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-rose-300 mt-1">
                {userKundaliHistory.length}
              </div>
            </div>
            <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400">मिलान रिपोर्ट्स</span>
              {userKundaliHistory.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearKundaliHistory();
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> डिलीट
                </button>
              )}
            </div>
          </div>

          {/* Card 5: Bookings */}
          <div
            onClick={() => setSubTab('bookings')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              subTab === 'bookings'
                ? 'bg-amber-500/20 border-amber-400'
                : 'bg-slate-950/80 border-amber-900/40 hover:border-amber-600/50'
            }`}
          >
            <div>
              <span className="text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> पूजा बुकिंग
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                {userBookings.length}
              </div>
            </div>
            <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400">संकल्प रिकॉर्ड</span>
              {userBookings.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAllBookings();
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> डिलीट
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'all', label: 'मेरा डेटा व हिस्ट्री नियंत्रण', icon: User },
          { id: 'chat', label: `चैटबॉट हिस्ट्री (${userChatMessages.length})`, icon: MessageCircle },
          { id: 'jaap', label: `मंत्र जप हिस्ट्री (${userJaapHistory.length})`, icon: Flame },
          {
            id: 'janam_kundali',
            label: `सम्पूर्ण कुंडली हिस्ट्री (${userJanamKundaliHistory.length})`,
            icon: Compass,
          },
          { id: 'milan', label: `कुंडली मिलान हिस्ट्री (${userKundaliHistory.length})`, icon: HeartHandshake },
          { id: 'bookings', label: `पूजा बुकिंग हिस्ट्री (${userBookings.length})`, icon: Calendar },
        ].map((item) => {
          const IconComp = item.icon;
          const active = subTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSubTab(item.id as HistorySubTab)}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 flex-shrink-0 cursor-pointer transition-all border ${
                active
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-lg'
                  : 'bg-[#0e1526] hover:bg-slate-800 text-amber-200 border-amber-900/40'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================== SUB-TAB 1: PROFILE & FULL DELETE CONTROL PANEL ==================== */}
      {subTab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Personal Info Form linked to Mobile Number */}
          <div className="lg:col-span-5 bg-[#0e1526] border border-amber-800/40 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base sm:text-lg font-bold font-vedic text-amber-100 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>मोबाइल नंबर से जुड़ी आपकी व्यक्तिगत जानकारी</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                यह जानकारी आपके मोबाइल नंबर (+91 {currentUser.phone}) पर सुरक्षित रहेगी।
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  आपका नाम (Yajman Name)
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-xs sm:text-sm text-amber-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    आपका पासवर्ड (Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      placeholder="सुरक्षित पासवर्ड"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full px-3 pr-8 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-xs sm:text-sm text-amber-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-amber-300 cursor-pointer"
                    >
                      {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    राशि (Rashi)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. मेष / सिंह"
                    value={editRashi}
                    onChange={(e) => setEditRashi(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-xs sm:text-sm text-amber-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    जन्म तिथि (DOB)
                  </label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-amber-900/60 rounded-xl text-xs text-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    जन्म समय (Birth Time)
                  </label>
                  <input
                    type="time"
                    value={editBirthTime}
                    onChange={(e) => setEditBirthTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-amber-900/60 rounded-xl text-xs text-amber-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    जन्म स्थान (Birth Place)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. रुद्रपुर / हल्द्वानी"
                    value={editBirthPlace}
                    onChange={(e) => setEditBirthPlace(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-xs text-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    रुद्रपुर कॉलोनी / क्षेत्र
                  </label>
                  <select
                    value={editLocality}
                    onChange={(e) => setEditLocality(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-xs text-amber-100"
                  >
                    {RUDRAPUR_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {profileSavedToast && (
                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> आपकी जानकारी आपके मोबाइल नंबर पर सहेज ली गई है!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>जानकारी सहेजें (Save Profile)</span>
              </button>
            </form>
          </div>

          {/* Right: Dedicated History Delete Control Panel + Recent Activity */}
          <div className="lg:col-span-7 space-y-4">
            {/* DEDICATED HISTORY DELETE CONTROL PANEL */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-950/30 via-[#0e1526] to-[#0e1526] border border-rose-500/40 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <h4 className="text-sm sm:text-base font-bold font-vedic text-amber-100 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>अपना डेटा एवं हर चीज़ की हिस्ट्री डिलीट करें (Delete History Options)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    आप किसी एक सेक्शन की हिस्ट्री या अपनी संपूर्ण हिस्ट्री एक क्लिक में डिलीट कर सकते हैं
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-amber-200 block">1. चैटबॉट हिस्ट्री</span>
                    <span className="text-[11px] text-slate-400">{userChatMessages.length} संदेश सेव हैं</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearChatHistory}
                    className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>डिलीट करें</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-amber-200 block">2. मंत्र जप हिस्ट्री व काउंट</span>
                    <span className="text-[11px] text-slate-400">
                      {currentUser.jaapStats?.lifetimeJaap || 0} जप • {userJaapHistory.length} सत्र
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAllJaapStatsAndHistory}
                    className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>डिलीट करें</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-amber-200 block">3. सम्पूर्ण जन्म कुंडली हिस्ट्री</span>
                    <span className="text-[11px] text-slate-400">{userJanamKundaliHistory.length} जन्म कुंडली रिकॉर्ड</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearJanamKundaliHistory}
                    className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>डिलीट करें</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-amber-200 block">4. कुंडली मिलान हिस्ट्री</span>
                    <span className="text-[11px] text-slate-400">{userKundaliHistory.length} मिलान रिपोर्ट्स</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearKundaliHistory}
                    className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>डिलीट करें</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2 sm:col-span-2">
                  <div>
                    <span className="text-xs font-bold text-amber-200 block">5. पूजा बुकिंग हिस्ट्री</span>
                    <span className="text-[11px] text-slate-400">{userBookings.length} बुकिंग रिकॉर्ड</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAllBookings}
                    className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>डिलीट करें</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDeleteAllEverything}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>हर चीज़ की संपूर्ण हिस्ट्री एक साथ डिलीट करें (Delete All History)</span>
              </button>
            </div>

            {/* Sampurn Janam Kundali Recent Preview */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1526] border border-amber-800/40 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm sm:text-base font-bold font-vedic text-amber-100 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>हाल ही की सम्पूर्ण जन्म कुंडली हिस्ट्री (Janam Kundali History)</span>
                </h4>
                <div className="flex items-center gap-2">
                  {userJanamKundaliHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearJanamKundaliHistory}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> साफ़ करें
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSubTab('janam_kundali')}
                    className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    सभी {userJanamKundaliHistory.length} देखें →
                  </button>
                </div>
              </div>
              {userJanamKundaliHistory.length === 0 ? (
                <p className="text-xs text-slate-400">
                  अभी तक कोई जन्म कुंडली हिस्ट्री दर्ज नहीं है।
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {userJanamKundaliHistory.slice(0, 4).map((jk) => (
                    <div
                      key={jk.id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-amber-800/40 flex flex-col justify-between gap-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-amber-100 block truncate">{jk.name}</span>
                          <span className="text-[11px] text-amber-300/80 font-mono">
                            DOB: {jk.dob} • {jk.birthTime}
                          </span>
                          <span className="text-[11px] text-emerald-300 block truncate mt-0.5">
                            लग्न: {jk.lagna} • राशि: {jk.moonRashi}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSingleJanamKundaliItem(jk.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer flex-shrink-0"
                          title="यह कुंडली हिस्ट्री डिलीट करें"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenJanamKundaliItem(jk)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-[11px] cursor-pointer text-center"
                      >
                        सम्पूर्ण कुंडली देखें →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chatbot Recent Preview */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1526] border border-amber-800/40 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm sm:text-base font-bold font-vedic text-amber-100 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-amber-400" />
                  <span>हाल ही की चैटबॉट हिस्ट्री (Chatbot History)</span>
                </h4>
                <div className="flex items-center gap-2">
                  {userChatMessages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearChatHistory}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> साफ़ करें
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSubTab('chat')}
                    className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    सभी {userChatMessages.length} देखें →
                  </button>
                </div>
              </div>
              {userChatMessages.length === 0 ? (
                <p className="text-xs text-slate-400">
                  अभी तक कोई चैटबॉट प्रश्न दर्ज नहीं है।
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {userChatMessages.slice(-4).map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-xl text-xs border flex items-start justify-between gap-2 ${
                        msg.role === 'user'
                          ? 'bg-amber-950/40 border-amber-600/40 text-amber-200'
                          : 'bg-slate-900/90 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-amber-400">
                          {msg.role === 'user' ? 'आपका प्रश्न: ' : 'पं. शशांक शर्मा AI: '}
                        </span>
                        <span className="line-clamp-2">{msg.text}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSingleChatMessage(msg.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer flex-shrink-0"
                        title="यह संदेश डिलीट करें"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 2: CHATBOT HISTORY ==================== */}
      {subTab === 'chat' && (
        <div className="bg-[#0e1526] border border-amber-800/40 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold font-vedic text-amber-100 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-amber-400" />
                <span>पण्डित शशांक शर्मा AI चैटबॉट इतिहास (+91 {currentUser.phone})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                किसी एक संदेश को या संपूर्ण चैटबॉट इतिहास को यहाँ से डिलीट कर सकते हैं
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('chat')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                चैटबॉट में नया प्रश्न पूछें →
              </button>
              {userChatMessages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChatHistory}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>संपूर्ण चैट हिस्ट्री डिलीट करें</span>
                </button>
              )}
            </div>
          </div>

          {userChatMessages.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <MessageCircle className="w-10 h-10 text-amber-500/50 mx-auto" />
              <p className="text-sm text-amber-200 font-semibold">
                इस मोबाइल नंबर पर अभी कोई चैटबॉट इतिहास नहीं है।
              </p>
              <button
                type="button"
                onClick={() => onNavigateToTab('chat')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                पं. शशांक शर्मा AI से बात करें
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {userChatMessages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border ${
                      isUser
                        ? 'bg-amber-950/30 border-amber-500/40 ml-0 sm:ml-8'
                        : 'bg-slate-900/90 border-slate-800 mr-0 sm:mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-xs font-bold flex items-center gap-1.5 ${
                          isUser ? 'text-amber-300' : 'text-emerald-300'
                        }`}
                      >
                        {isUser ? (
                          <>👤 आपका प्रश्न ({currentUser.name})</>
                        ) : (
                          <>🙏 पण्डित शशांक शर्मा AI का उत्तर</>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSingleChatMessage(msg.id)}
                          className="p-1 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 cursor-pointer flex items-center gap-1 text-[10px] px-2"
                          title="यह संदेश डिलीट करें"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>हटाएं</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-50 whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB-TAB 3: MANTRA JAAP HISTORY ==================== */}
      {subTab === 'jaap' && (
        <div className="bg-[#0e1526] border border-amber-800/40 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold font-vedic text-amber-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-yellow-400" />
                <span>मंत्र जप माला एवं साधना इतिहास (+91 {currentUser.phone})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                कुल संचित जप: <b>{currentUser.jaapStats?.lifetimeJaap || 0}</b> • पूर्ण माला:{' '}
                <b>{currentUser.jaapStats?.completedMalas || 0}</b> • वर्तमान काउंट:{' '}
                <b>{currentUser.jaapStats?.currentCount || 0}</b>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('jaap')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                मंत्र जप काउंटर खोलें →
              </button>
              {userJaapHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearJaapHistoryOnly}
                  className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>जप हिस्ट्री डिलीट करें</span>
                </button>
              )}
              {((currentUser.jaapStats?.lifetimeJaap || 0) > 0 || userJaapHistory.length > 0) && (
                <button
                  type="button"
                  onClick={handleClearAllJaapStatsAndHistory}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>काउंट व हिस्ट्री सब 0 करें</span>
                </button>
              )}
            </div>
          </div>

          {userJaapHistory.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Flame className="w-10 h-10 text-amber-500/50 mx-auto" />
              <p className="text-sm text-amber-200 font-semibold">
                अभी तक कोई मंत्र जप सत्र इतिहास में दर्ज नहीं है।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userJaapHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-900/40 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-amber-100 block truncate">
                      {item.mantraTitle}
                    </span>
                    <span className="text-[11px] text-amber-300/80 block">
                      {item.deity} • {item.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
                      {item.count} / {item.target} जप
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSingleJaapItem(item.id)}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 cursor-pointer"
                      title="यह जप रिकॉर्ड डिलीट करें"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB-TAB 3.5: SAMPURN JANAM KUNDALI HISTORY ==================== */}
      {subTab === 'janam_kundali' && (
        <div className="bg-[#0e1526] border border-amber-800/40 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold font-vedic text-amber-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <span>सम्पूर्ण जन्म कुंडली इतिहास (+91 {currentUser.phone})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                आपके द्वारा खोजी गई सभी जन्म कुंडलियों (लग्न, राशि, नक्षत्र, महादशा एवं रत्न) का रिकॉर्ड
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('janam-kundali')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                नई जन्म कुंडली बनाएं →
              </button>
              {userJanamKundaliHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearJanamKundaliHistory}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>संपूर्ण जन्म कुंडली हिस्ट्री डिलीट करें</span>
                </button>
              )}
            </div>
          </div>

          {userJanamKundaliHistory.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Compass className="w-10 h-10 text-amber-500/50 mx-auto" />
              <p className="text-sm text-amber-200 font-semibold">
                अभी तक कोई सम्पूर्ण जन्म कुंडली इतिहास में दर्ज नहीं है।
              </p>
              <button
                type="button"
                onClick={() => onNavigateToTab('janam-kundali')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                अपनी जन्म कुंडली देखें
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userJanamKundaliHistory.map((jk, idx) => (
                <div
                  key={jk.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-amber-800/40 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        {idx === 0 && (
                          <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 mb-1">
                            अंतिम खोजी गई कुंडली
                          </span>
                        )}
                        <h4 className="text-sm sm:text-base font-bold font-vedic text-amber-100 truncate">
                          {jk.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[11px] text-slate-400 font-mono">{jk.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSingleJanamKundaliItem(jk.id)}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 cursor-pointer"
                          title="यह जन्म कुंडली रिकॉर्ड डिलीट करें"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-amber-200/90 font-mono">
                      जन्म तिथि (DOB): <b>{jk.dob}</b> • समय: <b>{jk.birthTime}</b>
                    </div>
                    <div className="text-xs text-slate-300">
                      जन्म स्थान: <b>{jk.birthPlace || 'रुद्रपुर, उत्तराखण्ड'}</b>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-amber-400 block">जन्म लग्न</span>
                        <span className="font-bold text-emerald-300">{jk.lagna}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-amber-400 block">चंद्र राशि</span>
                        <span className="font-bold text-amber-100">{jk.moonRashi}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-amber-400 block">जन्म नक्षत्र</span>
                        <span className="font-bold text-amber-200">
                          {jk.nakshatra} (च-{jk.nakshatraPada})
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-amber-400 block">महादशा व शुभ रत्न</span>
                        <span className="font-bold text-yellow-300 truncate block">
                          {jk.currentMahadasha} • {jk.luckyGemstone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-amber-300 font-semibold truncate">
                      {jk.manglikStatus}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenJanamKundaliItem(jk)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer flex items-center gap-1 flex-shrink-0"
                    >
                      <span>सम्पूर्ण कुंडली खोलें →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB-TAB 4: KUNDALI MILAN HISTORY ==================== */}
      {subTab === 'milan' && (
        <div className="bg-[#0e1526] border border-amber-800/40 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold font-vedic text-amber-100 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-400" />
                <span>36 गुण कुंडली मिलान इतिहास (+91 {currentUser.phone})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                आपके द्वारा किए गए सभी वर-कन्या गुण मिलान का रिकॉर्ड
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('milan')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                नया कुंडली मिलान करें →
              </button>
              {userKundaliHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearKundaliHistory}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>संपूर्ण मिलान हिस्ट्री डिलीट करें</span>
                </button>
              )}
            </div>
          </div>

          {userKundaliHistory.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <HeartHandshake className="w-10 h-10 text-rose-400/50 mx-auto" />
              <p className="text-sm text-amber-200 font-semibold">
                अभी तक कोई कुंडली मिलान इतिहास में दर्ज नहीं है।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userKundaliHistory.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-amber-800/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold font-vedic text-amber-100 truncate">
                      वर: {m.boyName} &amp; कन्या: {m.girlName}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs">
                        {m.totalScore} / 36 गुण
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSingleKundaliItem(m.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 cursor-pointer"
                        title="यह कुंडली मिलान रिकॉर्ड डिलीट करें"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-amber-200/85 space-y-1">
                    <p>
                      • वर: {m.boyRashi} {m.boyDob ? `(DOB: ${m.boyDob}, ${m.boyTime})` : ''}
                    </p>
                    <p>
                      • कन्या: {m.girlRashi} {m.girlDob ? `(DOB: ${m.girlDob}, ${m.girlTime})` : ''}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-amber-400 font-semibold">{m.overallVerdict}</span>
                    <span className="text-slate-400">{m.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB-TAB 5: BOOKINGS HISTORY ==================== */}
      {subTab === 'bookings' && (
        <div className="bg-[#0e1526] border border-amber-800/40 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold font-vedic text-amber-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>पूजा एवं ₹100 परामर्श बुकिंग इतिहास (+91 {currentUser.phone})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                इस मोबाइल नंबर से बुक की गई सभी पूजाएं और ज्योतिष परामर्श
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('services')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                नई पूजा / परामर्श बुक करें →
              </button>
              {userBookings.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllBookings}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>संपूर्ण बुकिंग हिस्ट्री डिलीट करें</span>
                </button>
              )}
            </div>
          </div>

          {userBookings.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Calendar className="w-10 h-10 text-emerald-400/50 mx-auto" />
              <p className="text-sm text-amber-200 font-semibold">
                इस मोबाइल नंबर (+91 {currentUser.phone}) से अभी कोई बुकिंग नहीं मिली।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-amber-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold font-vedic text-amber-100 truncate">
                      {b.serviceName}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                        बुकिंग कन्फर्म
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSingleBooking(b.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 cursor-pointer"
                        title="यह बुकिंग रिकॉर्ड डिलीट करें"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-amber-200/80 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        तिथि: <b>{b.date}</b> • समय: <b>{b.timeSlot}</b>
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {b.bookingType === 'in_person_rudrapur'
                          ? `रुद्रपुर घर पर पूजा (${b.localityRudrapur})`
                          : 'फ़ोन / वीडियो कॉल परामर्श'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
