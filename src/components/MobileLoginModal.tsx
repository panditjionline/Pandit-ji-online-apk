import React, { useState, useEffect } from 'react';
import { UserMobileAccount } from '../types';
import {
  cleanMobileNumber,
  loginOrSyncMobileUser,
  clearLocalChatCache,
  clearLocalJaapCache,
  clearLocalKundaliCache,
} from '../utils/userAccountStorage';
import { vedicAudio } from '../utils/audioSynthesizer';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  X,
  ShieldCheck,
  History,
  LogOut,
  ArrowRight,
  Trash2,
  MessageCircle,
  Flame,
  HeartHandshake,
  Calendar,
  Compass,
} from 'lucide-react';

interface MobileLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserMobileAccount | null;
  onLoginSuccess: (account: UserMobileAccount) => void;
  onUpdateAccount?: (updated: UserMobileAccount) => void;
  onLogout: () => void;
  onOpenFullHistoryHub: () => void;
  userBookingsCount?: number;
  onDeleteAllUserBookings?: () => void;
}

export const MobileLoginModal: React.FC<MobileLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onUpdateAccount,
  onLogout,
  onOpenFullHistoryHub,
  userBookingsCount = 0,
  onDeleteAllUserBookings,
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusToast, setStatusToast] = useState('');
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setStatusToast('');
      setConfirmDeleteAll(false);
      setShowPassword(false);
      if (currentUser) {
        setPhoneInput(currentUser.phone);
        setNameInput(currentUser.name || '');
        setPasswordInput(currentUser.password || '');
      } else {
        setPhoneInput('');
        setNameInput('');
        setPasswordInput('');
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? '' : prev));
    }, 3200);
  };

  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setPhoneInput(digitsOnly);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanMobileNumber(phoneInput);
    if (cleaned.length !== 10) {
      setErrorMsg('कृपया अपना सही 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!nameInput.trim()) {
      setErrorMsg('कृपया अपना नाम दर्ज करें।');
      return;
    }
    if (!passwordInput.trim() || passwordInput.trim().length < 3) {
      setErrorMsg('कृपया सुरक्षा के लिए कम से कम 3 अक्षरों/अंकों का पासवर्ड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const account = await loginOrSyncMobileUser(cleaned, nameInput.trim(), passwordInput.trim());
      vedicAudio.playTempleBell(0.65);
      onLoginSuccess(account);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'WRONG_PASSWORD') {
        setErrorMsg('गलत पासवर्ड! इस मोबाइल नंबर का डेटा सुरक्षित है। कृपया सही पासवर्ड दर्ज करें।');
      } else {
        setErrorMsg('लॉगिन करने में समस्या आई। कृपया पुनः प्रयास करें।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChatOnly = () => {
    if (!currentUser || !onUpdateAccount) return;
    clearLocalChatCache();
    onUpdateAccount({
      ...currentUser,
      chatMessages: [],
    });
    showToast('आपकी चैटबॉट हिस्ट्री डिलीट कर दी गई है।');
  };

  const handleDeleteJaapOnly = () => {
    if (!currentUser || !onUpdateAccount) return;
    clearLocalJaapCache(true);
    onUpdateAccount({
      ...currentUser,
      jaapStats: { currentCount: 0, completedMalas: 0, lifetimeJaap: 0 },
      jaapHistory: [],
    });
    showToast('आपकी मंत्र जप हिस्ट्री एवं काउंट डिलीट कर दिए गए हैं।');
  };

  const handleDeleteKundaliOnly = () => {
    if (!currentUser || !onUpdateAccount) return;
    clearLocalKundaliCache();
    onUpdateAccount({
      ...currentUser,
      kundaliHistory: [],
    });
    showToast('आपकी कुंडली मिलान हिस्ट्री डिलीट कर दी गई है।');
  };

  const handleDeleteJanamKundaliOnly = () => {
    if (!currentUser || !onUpdateAccount) return;
    try {
      localStorage.removeItem('panditji_janam_kundali_history');
    } catch {
      // ignore
    }
    onUpdateAccount({
      ...currentUser,
      janamKundaliHistory: [],
    });
    showToast('आपकी सम्पूर्ण जन्म कुंडली हिस्ट्री डिलीट कर दी गई है।');
  };

  const handleDeleteBookingsOnly = () => {
    if (onDeleteAllUserBookings) {
      onDeleteAllUserBookings();
      showToast('आपकी पूजा/परामर्श बुकिंग हिस्ट्री डिलीट कर दी गई है।');
    }
  };

  const handleDeleteEverything = () => {
    if (!currentUser || !onUpdateAccount) return;
    clearLocalChatCache();
    clearLocalJaapCache(true);
    clearLocalKundaliCache();
    try {
      localStorage.removeItem('panditji_janam_kundali_history');
    } catch {
      // ignore
    }
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
    showToast('आपके खाते से हर चीज़ की हिस्ट्री (चैट, जप, जन्म कुंडली, मिलान व बुकिंग) डिलीट कर दी गई है!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0e1525] border-2 border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-[#1b1108] to-slate-900 p-4 border-b border-amber-700/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 shadow-md flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-bold font-vedic text-amber-100 truncate">
                सुरक्षित मोबाइल लॉगिन एवं हिस्ट्री प्रबंधन
              </h3>
              <p className="text-[11px] text-amber-300/80 truncate">
                मोबाइल नंबर, नाम व पासवर्ड से अपना व्यक्तिगत डेटा सुरक्षित रखें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {statusToast && (
            <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{statusToast}</span>
            </div>
          )}

          {/* Active Logged In User Data & Quick Delete Controls */}
          {currentUser && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border-2 border-emerald-500/50 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> पासवर्ड सुरक्षित सक्रिय खाता:
                  </span>
                  <p className="text-sm font-bold text-amber-100 mt-0.5 truncate">
                    {currentUser.name} (+91 {currentUser.phone})
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFullHistoryHub();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>पूरा डेटा देखें</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold cursor-pointer flex items-center gap-1"
                    title="लॉगआउट करें"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>लॉगआउट</span>
                  </button>
                </div>
              </div>

              {/* Individual & All History Delete Options inside Logged-in User Data */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>अपनी हिस्ट्री डिलीट करें (Delete History Options):</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* 1. Delete Chatbot History */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-amber-100 flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate">चैटबॉट हिस्ट्री</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {currentUser.chatMessages?.length || 0} संदेश
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteChatOnly}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>डिलीट</span>
                    </button>
                  </div>

                  {/* 2. Delete Mantra Jaap History & Counts */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-amber-100 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                        <span className="truncate">मंत्र जप हिस्ट्री</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {currentUser.jaapStats?.lifetimeJaap || 0} जप • {currentUser.jaapHistory?.length || 0} सत्र
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteJaapOnly}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>डिलीट</span>
                    </button>
                  </div>

                  {/* 2.5 Delete Sampurn Janam Kundali History */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-amber-100 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                        <span className="truncate">जन्म कुंडली हिस्ट्री</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {currentUser.janamKundaliHistory?.length || 0} कुंडली रिकॉर्ड
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteJanamKundaliOnly}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>डिलीट</span>
                    </button>
                  </div>

                  {/* 3. Delete Kundali Milan History */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-amber-100 flex items-center gap-1">
                        <HeartHandshake className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span className="truncate">कुंडली मिलान</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {currentUser.kundaliHistory?.length || 0} मिलान रिकॉर्ड
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteKundaliOnly}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>डिलीट</span>
                    </button>
                  </div>

                  {/* 4. Delete Puja Bookings History */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-amber-100 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">बुकिंग हिस्ट्री</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {userBookingsCount} बुकिंग रिकॉर्ड
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteBookingsOnly}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>डिलीट</span>
                    </button>
                  </div>
                </div>

                {/* Delete All History Button */}
                {!confirmDeleteAll ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAll(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>अपनी हर चीज़ की हिस्ट्री एक साथ डिलीट करें (Delete All History)</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-500 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-rose-200">
                      क्या आप वाकई अपनी सारी हिस्ट्री डिलीट करना चाहते हैं?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteEverything}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                      >
                        हाँ, सब डिलीट करें
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteAll(false)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        रद्द करें
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Login / Switch Mobile Number Form (Mobile + Name + Password, No Gotra, No Previous Users List) */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                {currentUser
                  ? 'मोबाइल नंबर बदलें या प्रोफ़ाइल अपडेट करें:'
                  : 'आपका 10 अंकों का मोबाइल नंबर (Mobile Number) *'}
              </label>
              <div className="flex items-center bg-slate-950 border-2 border-amber-600/50 focus-within:border-amber-400 rounded-xl overflow-hidden">
                <span className="px-3 py-2.5 bg-amber-950/60 text-amber-300 font-mono font-bold text-sm border-r border-amber-800/50">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={phoneInput}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-transparent text-amber-100 font-mono font-bold text-base tracking-wider focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  आपका नाम (Name) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="उदा. राजेश शर्मा"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-amber-900/60 rounded-xl text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  सुरक्षित पासवर्ड (Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="अपना पासवर्ड दर्ज करें"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-amber-900/60 rounded-xl text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-amber-300 cursor-pointer"
                    title={showPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'सत्यापन हो रहा है...'
                  : currentUser && currentUser.phone === phoneInput
                  ? 'प्रोफ़ाइल व पासवर्ड सहेजें'
                  : 'मोबाइल नंबर व पासवर्ड से लॉगिन करें'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Note */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-amber-900/30 flex items-start gap-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              आपका खाता आपके व्यक्तिगत पासवर्ड से सुरक्षित है ताकि कोई दूसरा व्यक्ति आपके मोबाइल नंबर का डेटा या हिस्ट्री न देख सके।
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
