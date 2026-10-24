import React, { useState, useEffect } from 'react';
import { UserMobileAccount } from '../types';
import {
  cleanMobileNumber,
  loginOrSyncUser,
  persistUserAccountUpdate,
  clearLocalChatCache,
  clearLocalJaapCache,
  clearLocalKundaliCache,
  verifyUserDobForReset,
  saveNewPasswordForUser,
} from '../utils/userAccountStorage';
import { setActiveProfile } from '../utils/autoPersonalization';
import { deriveVedicDetailsForProfile } from '../utils/familyVaultStorage';
import { vedicAudio } from '../utils/audioSynthesizer';
import { PanditPortrait } from './PanditPortrait';
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
  const [emailInput, setEmailInput] = useState('');
  const [gotraInput, setGotraInput] = useState('');
  const [dobInput, setDobInput] = useState('1995-01-01');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusToast, setStatusToast] = useState('');
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topTab, setTopTab] = useState<'login' | 'signup'>('login');
  const [showSwitchAccountForm, setShowSwitchAccountForm] = useState(false);

  // Forgot Password Flow
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: verify, 2: reset
  const [verifyDob, setVerifyDob] = useState('');
  const [verifiedUserName, setVerifiedUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setStatusToast('');
      setConfirmDeleteAll(false);
      setShowPassword(false);
      setShowNewPassword(false);
      setIsForgotPassword(false);
      setShowSwitchAccountForm(false);
      setResetStep(1);
      setVerifiedUserName('');
      setNewPassword('');
      setConfirmPassword('');
      if (currentUser) {
        setPhoneInput('');
        setNameInput(currentUser.name || '');
        setEmailInput(currentUser.email || '');
        setGotraInput(currentUser.gotra || '');
        setDobInput(currentUser.dob || '1995-01-01');
        setPasswordInput('');
      } else {
        setPhoneInput('');
        setNameInput('');
        setEmailInput('');
        setGotraInput('');
        setDobInput('1995-01-01');
        setPasswordInput('');
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? '' : prev));
    }, 4000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmail = phoneInput.includes('@');
    const cleaned = isEmail ? phoneInput.trim() : cleanMobileNumber(phoneInput);

    if (!cleaned || (!isEmail && cleaned.length !== 10)) {
      setErrorMsg('कृपया अपना सही 10 अंकों का मोबाइल नंबर या ईमेल दर्ज करें।');
      return;
    }
    if (!passwordInput.trim()) {
      setErrorMsg('कृपया अपना पासवर्ड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const account = await loginOrSyncUser({
        phone: isEmail ? '' : cleaned,
        email: isEmail ? cleaned : '',
        password: passwordInput.trim(),
        mode: 'login',
      });

      vedicAudio.playTempleBell(0.65);
      onLoginSuccess(account);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'WRONG_PASSWORD') {
        setErrorMsg('गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें या "पासवर्ड भूल गए?" पर क्लिक करें।');
      } else if (err instanceof Error && err.message === 'USER_NOT_FOUND') {
        setErrorMsg('यह खाता पंजीकृत नहीं है। कृपया पहले "नया खाता (Sign-Up)" टैब से पंजीकरण करें।');
      } else {
        setErrorMsg('लॉगिन करने में समस्या आई। कृपया पुनः प्रयास करें।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhone = cleanMobileNumber(phoneInput);
    if (cleanedPhone.length !== 10) {
      setErrorMsg('कृपया अपना सही 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!nameInput.trim()) {
      setErrorMsg('कृपया अपना नाम दर्ज करें।');
      return;
    }
    if (!passwordInput.trim() || passwordInput.trim().length < 3) {
      setErrorMsg('कृपया सुरक्षा के लिए कम से कम 3 अक्षरों का पासवर्ड रखें।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const vedic = deriveVedicDetailsForProfile(nameInput.trim(), dobInput, '12:00', 'रुद्रपुर');

      const account = await loginOrSyncUser({
        phone: cleanedPhone,
        name: nameInput.trim(),
        email: emailInput.trim(),
        password: passwordInput.trim(),
        mode: 'signup',
      });

      account.gotra = gotraInput.trim();
      account.dob = dobInput;
      account.rashi = vedic.rashi;
      account.birthPlace = 'रुद्रपुर';
      persistUserAccountUpdate(account);

      setActiveProfile({
        id: cleanedPhone,
        name: nameInput.trim(),
        relation: 'self',
        gender: 'male',
        dob: dobInput,
        birthTime: '12:00',
        birthPlace: 'रुद्रपुर',
        gotra: gotraInput.trim(),
        rashi: vedic.rashi,
        rashiLord: vedic.rashiLord,
        nakshatra: vedic.nakshatra,
        nakshatraPada: vedic.nakshatraPada,
        lagna: vedic.lagna,
        isPrimary: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      vedicAudio.playTempleBell(0.65);
      onLoginSuccess(account);
      onClose();
    } catch {
      setErrorMsg('खाता बनाने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanMobileNumber(phoneInput);
    if (cleaned.length !== 10 || !verifyDob) {
      setErrorMsg('कृपया सही 10 अंकों का मोबाइल नंबर और जन्म तिथि दर्ज करें।');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const result = await verifyUserDobForReset(cleaned, verifyDob);
      setVerifiedUserName(result.name || '');
      setResetStep(2);
      vedicAudio.playTempleBell(0.5);
      showToast('✅ सत्यापन सफल! अब अपना नया पासवर्ड और कन्फर्म पासवर्ड दर्ज करें।');
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'सत्यापन विफल। कृपया सही मोबाइल नंबर और जन्म तिथि दर्ज करें।'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanMobileNumber(phoneInput);
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (trimmedNew.length < 3) {
      setErrorMsg('नया पासवर्ड कम से कम 3 अक्षरों का होना चाहिए।');
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      setErrorMsg('नया पासवर्ड और कन्फर्म पासवर्ड दोनों एक समान होने चाहिए।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await saveNewPasswordForUser(cleaned, verifyDob, trimmedNew);
      vedicAudio.playTempleBell(0.65);
      showToast('✅ आपका नया पासवर्ड सुरक्षित कर दिया गया है! कृपया अब लॉगिन करें।');
      setPhoneInput(cleaned);
      setPasswordInput(trimmedNew);
      setNewPassword('');
      setConfirmPassword('');
      setResetStep(1);
      setIsForgotPassword(false);
      setTopTab('login');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'पासवर्ड रीसेट करने में समस्या आई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetStep(1);
    setErrorMsg('');
    setNewPassword('');
    setConfirmPassword('');
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn pt-12 sm:pt-10 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e1525] border-2 border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden mb-10 sm:mb-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-[#1b1108] to-slate-900 p-4 border-b border-amber-700/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <PanditPortrait size="sm" showBadge={false} />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-bold font-vedic text-amber-100 truncate">
                लॉगिन एवं साइन-अप (Login & Sign-Up)
              </h3>
              <p className="text-[11px] text-amber-300/80 truncate">
                आचार्य पण्डित शशांक शर्मा • सुरक्षित वैदिक हिस्ट्री एक्सेस
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

          {/* Tab Selection (Shown when logged out OR when explicitly switching account) */}
          {(!currentUser || showSwitchAccountForm) && !isForgotPassword && (
            <div className="space-y-2">
              {currentUser && showSwitchAccountForm && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs">
                  <span className="text-amber-200 font-bold">
                    दूसरे खाते से लॉगिन या नया खाता बनाएं:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSwitchAccountForm(false);
                      setErrorMsg('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold text-[11px] cursor-pointer"
                  >
                    ← सक्रिय खाते पर वापस जाएं
                  </button>
                </div>
              )}
              <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-amber-900/30 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setTopTab('login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    topTab === 'login'
                      ? 'bg-amber-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-amber-200'
                  }`}
                >
                  लॉगिन (Login)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTopTab('signup');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    topTab === 'signup'
                      ? 'bg-amber-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-amber-200'
                  }`}
                >
                  नया खाता (Sign-Up)
                </button>
              </div>
            </div>
          )}

          {/* Active Logged In User Data & Quick Delete Controls (Shown cleanly when logged in and not switching account) */}
          {currentUser && !showSwitchAccountForm && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/95 border-2 border-emerald-500/50 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <PanditPortrait size="sm" showBadge={true} />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">पासवर्ड सुरक्षित सक्रिय खाता:</span>
                    </span>
                    <p className="text-sm sm:text-base font-extrabold text-amber-100 mt-0.5 truncate">
                      {currentUser.name} (+91 {currentUser.phone})
                    </p>
                    {currentUser.rashi && (
                      <span className="text-[11px] text-amber-300/90 font-semibold block mt-0.5">
                        राशि: {currentUser.rashi} {currentUser.dob ? `• जन्म: ${currentUser.dob}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFullHistoryHub();
                    }}
                    className="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs cursor-pointer flex items-center gap-1.5 shadow-md transition-all whitespace-nowrap"
                  >
                    <History className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>पूरा डेटा देखें</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
                    title="लॉगआउट करें"
                  >
                    <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>लॉगआउट</span>
                  </button>
                </div>
              </div>

              {/* Individual & All History Delete Options inside Logged-in User Data */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>अपनी हिस्ट्री डिलीट करें (Delete History Options):</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. Delete Chatbot History */}
                  <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate">चैटबॉट हिस्ट्री</span>
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                        {currentUser.chatMessages?.length || 0} संदेश
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteChatOnly}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-600/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0 whitespace-nowrap transition-all"
                    >
                      <Trash2 className="w-3 h-3 flex-shrink-0" />
                      <span>डिलीट</span>
                    </button>
                  </div>

                  {/* 2. Delete Mantra Jaap History & Counts */}
                  <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                        <span className="truncate">मंत्र जप हिस्ट्री</span>
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                        {currentUser.jaapStats?.lifetimeJaap || 0} जप • {currentUser.jaapHistory?.length || 0} सत्र
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteJaapOnly}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-600/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0 whitespace-nowrap transition-all"
                    >
                      <Trash2 className="w-3 h-3 flex-shrink-0" />
                      <span>डिलीट</span>
                    </button>
                  </div>

                  {/* 2.5 Delete Sampurn Janam Kundali History */}
                  <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                        <span className="truncate">जन्म कुंडली हिस्ट्री</span>
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                        {currentUser.janamKundaliHistory?.length || 0} कुंडली रिकॉर्ड
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteJanamKundaliOnly}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-600/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0 whitespace-nowrap transition-all"
                    >
                      <Trash2 className="w-3 h-3 flex-shrink-0" />
                      <span>डिलीट</span>
                    </button>
                  </div>

                  {/* 3. Delete Kundali Milan History */}
                  <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                        <HeartHandshake className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span className="truncate">कुंडली मिलान</span>
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                        {currentUser.kundaliHistory?.length || 0} मिलान रिकॉर्ड
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteKundaliOnly}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-600/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0 whitespace-nowrap transition-all"
                    >
                      <Trash2 className="w-3 h-3 flex-shrink-0" />
                      <span>डिलीट</span>
                    </button>
                  </div>

                  {/* 4. Delete Puja Bookings History */}
                  <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-800 flex items-center justify-between gap-3 sm:col-span-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">पूजा बुकिंग हिस्ट्री</span>
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                        {userBookingsCount} बुकिंग रिकॉर्ड
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteBookingsOnly}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-600/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0 whitespace-nowrap transition-all"
                    >
                      <Trash2 className="w-3 h-3 flex-shrink-0" />
                      <span>डिलीट</span>
                    </button>
                  </div>
                </div>

                {/* Delete All History Button */}
                {!confirmDeleteAll ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAll(true)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>अपनी हर चीज़ की हिस्ट्री एक साथ डिलीट करें (Delete All History)</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-950/95 border border-rose-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <span className="text-xs font-bold text-rose-200">
                      क्या आप वाकई अपनी सारी हिस्ट्री डिलीट करना चाहते हैं?
                    </span>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={handleDeleteEverything}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                      >
                        हाँ, सब डिलीट करें
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteAll(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer whitespace-nowrap"
                      >
                        रद्द करें
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Clean Switch Account Action (opens login form cleanly without overlapping) */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  किसी अन्य मोबाइल नंबर या खाते से लॉगिन करना चाहते हैं?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneInput('');
                    setPasswordInput('');
                    setErrorMsg('');
                    setTopTab('login');
                    setShowSwitchAccountForm(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs cursor-pointer whitespace-nowrap transition-all"
                >
                  दूसरा खाता लॉगिन करें →
                </button>
              </div>
            </div>
          )}

          {/* Login / Signup Flow Area (Only rendered when logged out OR when user clicked Switch Account) */}
          {(!currentUser || showSwitchAccountForm) && (
            !isForgotPassword ? (
            <div className="space-y-3.5">
              {topTab === 'login' ? (
                /* LOGIN TAB */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1.5">
                      मोबाइल नंबर या ईमेल (Mobile or Email) *
                    </label>
                    <div className="flex items-center bg-slate-950 border border-amber-900/60 focus-within:border-amber-400 rounded-xl overflow-hidden transition-all duration-300 shadow-inner">
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="9876543210 या example@mail.com"
                        value={phoneInput}
                        onChange={(e) => {
                          setPhoneInput(e.target.value);
                          setErrorMsg('');
                        }}
                        className="w-full px-4 py-3 bg-transparent text-amber-100 font-bold text-sm sm:text-base focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-amber-300">
                        पासवर्ड (Password) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setResetStep(1);
                          setErrorMsg('');
                        }}
                        className="text-[10px] font-bold text-amber-400 underline"
                      >
                        पासवर्ड भूल गए?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="अपना पासवर्ड दर्ज करें"
                        value={passwordInput}
                        onChange={(e) => {
                          setPasswordInput(e.target.value);
                          setErrorMsg('');
                        }}
                        className="w-full pl-9 pr-10 py-3 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-bold animate-shake">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-black text-sm shadow-xl active:scale-95"
                  >
                    {isSubmitting ? 'जाँच हो रही है...' : 'लॉगिन करें (Secure Login)'}
                  </button>
                </form>
              ) : (
                /* SIGN UP TAB */
                <form onSubmit={handleSignupSubmit} className="space-y-3.5 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">
                        पूरा नाम (Full Name) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. राजेश शर्मा"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">
                        मोबाइल (+91) *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">
                        ईमेल (Email)
                      </label>
                      <input
                        type="email"
                        placeholder="rajesh@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">
                        जन्म तिथि (DOB) *
                      </label>
                      <input
                        type="date"
                        required
                        value={dobInput}
                        onChange={(e) => setDobInput(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1">
                      पासवर्ड (Password) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={3}
                        placeholder="पासवर्ड चुनें"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-bold animate-shake">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-xl active:scale-95"
                  >
                    {isSubmitting ? 'खाता बनाया जा रहा है...' : 'नया खाता बनाएँ (Sign-Up)'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
                <div className="flex items-center gap-2 text-amber-100 font-bold">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>पासवर्ड रीसेट करें (Forgot Password)</span>
                </div>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  वापस लॉगिन (Back to Login)
                </button>
              </div>

              <form
                onSubmit={resetStep === 1 ? handleVerifyForgotPassword : handleResetPassword}
                className="space-y-3.5"
              >
                <p className="text-xs text-amber-300/80">
                  {resetStep === 1
                    ? 'अपना पंजीकृत 10 अंकों का मोबाइल नंबर और जन्म तिथि दर्ज करके सत्यापित करें।'
                    : 'मोबाइल नंबर और जन्म तिथि सत्यापित हो चुकी है। अब अपना नया पासवर्ड सेट करें।'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1.5">
                      मोबाइल नंबर (+91) *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      disabled={resetStep === 2}
                      placeholder="9876543210"
                      value={phoneInput}
                      onChange={(e) => {
                        setPhoneInput(e.target.value.replace(/\D/g, ''));
                        setErrorMsg('');
                      }}
                      className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-amber-100 font-mono text-sm focus:outline-none ${
                        resetStep === 2
                          ? 'border-emerald-500/50 opacity-80 cursor-not-allowed'
                          : 'border-amber-600/50 focus:border-amber-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1.5">
                      जन्म तिथि (Date of Birth) *
                    </label>
                    <input
                      type="date"
                      required
                      disabled={resetStep === 2}
                      value={verifyDob}
                      onChange={(e) => {
                        setVerifyDob(e.target.value);
                        setErrorMsg('');
                      }}
                      className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-amber-100 font-mono text-sm focus:outline-none ${
                        resetStep === 2
                          ? 'border-emerald-500/50 opacity-80 cursor-not-allowed'
                          : 'border-amber-600/50 focus:border-amber-400'
                      }`}
                    />
                  </div>
                </div>

                {resetStep === 1 ? (
                  <>
                    {errorMsg && (
                      <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-bold">
                        {errorMsg}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-700 border border-slate-700"
                      >
                        वापस लॉगिन (Login)
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer transition-all active:scale-95"
                      >
                        {isSubmitting ? 'सत्यापन हो रहा है...' : 'विवरण सत्यापित करें (Verify Details)'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3.5 pt-2 border-t border-emerald-500/30 animate-fadeIn">
                    <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>
                          सत्यापन सफल! {verifiedUserName ? `(${verifiedUserName})` : ''} अब नया पासवर्ड दर्ज करें।
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setResetStep(1);
                          setErrorMsg('');
                        }}
                        className="text-[10px] text-amber-300 underline hover:text-amber-200 flex-shrink-0 cursor-pointer"
                      >
                        बदलें
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-300 mb-1.5">
                        नया पासवर्ड (New Password) *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          autoFocus
                          minLength={3}
                          placeholder="नया पासवर्ड दर्ज करें (कम से कम 3 अक्षर)"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setErrorMsg('');
                          }}
                          className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-amber-500/70 focus:border-amber-400 rounded-xl text-sm text-amber-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-amber-200 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-300 mb-1.5">
                        पासवर्ड की पुष्टि करें (Confirm Password) *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={3}
                          placeholder="नया पासवर्ड दोबारा दर्ज करें"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setErrorMsg('');
                          }}
                          className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-amber-500/70 focus:border-amber-400 rounded-xl text-sm text-amber-100 focus:outline-none"
                        />
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
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isSubmitting
                          ? 'नया पासवर्ड सुरक्षित किया जा रहा है...'
                          : 'नया पासवर्ड सुरक्षित करें (Save New Password)'}
                      </span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          ))}

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
