import React, { useState } from 'react';
import {
  UserMobileAccount,
  BookingRequest,
  KundaliMilanHistoryItem,
} from '../types';
import { RUDRAPUR_LOCALITIES } from '../data/mockData';
import { PanditPortrait } from './PanditPortrait';
import { UserAvatar } from './UserAvatar';
import { deriveVedicDetailsForProfile } from '../utils/familyVaultStorage';
import { setActiveProfile } from '../utils/autoPersonalization';
import { vedicAudio } from '../utils/audioSynthesizer';
import {
  cleanMobileNumber,
  loginOrSyncUser,
  persistUserAccountUpdate,
  clearLocalChatCache,
  clearLocalJaapCache,
  clearLocalKundaliCache,
  clearLocalJanamKundaliCache,
  verifyUserDobForReset,
  saveNewPasswordForUser,
} from '../utils/userAccountStorage';
import {
  PRESET_USERS,
  getPunyaPoints,
  hasClaimedDailyPunyaToday,
  redeemPunyaFor100Offer,
  getActive100OfferCoupon,
} from '../utils/punya';
import { useAstroMode } from '../context/AstroModeContext';
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
  Landmark,
  ShieldCheck,
  Gift,
  Award,
} from 'lucide-react';
import { JanamKundaliHistoryItem } from '../types';
import { generateSampurnKundali } from '../utils/sampurnKundali';
import { getInitialSadhanaState } from '../data/digitalMandirData';

export interface UserHistoryHubProps {
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
  const [userExists, setUserExists] = useState<boolean | null>(true);

  // Forgot Password states inside Mera Khata gate
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [verifyDob, setVerifyDob] = useState('');
  const [verifiedUserName, setVerifiedUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Global Astro Calculation Mode (Janm Kundali vs Naam Rashi)
  const { calcViewingMode, setCalcViewingMode } = useAstroMode();

  // Punya Points Gamification State
  const [punyaPoints, setPunyaPointsState] = useState<number>(() => getPunyaPoints());
  const [claimedToday, setClaimedToday] = useState<boolean>(() => hasClaimedDailyPunyaToday());
  const [active100Coupon, setActive100Coupon] = useState<string | null>(() => getActive100OfferCoupon());
  const [punyaRedeemFeedback, setPunyaRedeemFeedback] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);

  React.useEffect(() => {
    const syncPunya = () => {
      setPunyaPointsState(getPunyaPoints());
      setClaimedToday(hasClaimedDailyPunyaToday());
      setActive100Coupon(getActive100OfferCoupon());
    };
    window.addEventListener('panditji_punya_updated', syncPunya);
    return () => window.removeEventListener('panditji_punya_updated', syncPunya);
  }, []);

  const handleRedeem100Offer = () => {
    const res = redeemPunyaFor100Offer();
    setPunyaPointsState(res.newPoints);
    setActive100Coupon(res.couponCode || getActive100OfferCoupon());
    setPunyaRedeemFeedback({
      type: res.success ? 'success' : 'info',
      text: res.message,
    });
    if (res.success) {
      vedicAudio.playCrispTempleBell(0.75);
    }
  };

  // Profile edit states when logged in
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [editPassword, setEditPassword] = useState(currentUser?.password || '');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editRashi, setEditRashi] = useState(currentUser?.rashi || '');
  const [editDob, setEditDob] = useState(currentUser?.dob || '1996-11-06');
  const [editBirthTime, setEditBirthTime] = useState(currentUser?.birthTime || '');
  const [editBirthPlace, setEditBirthPlace] = useState(currentUser?.birthPlace || '');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditAvatar(currentUser.avatar || '');
      setEditPassword(currentUser.password || '');
      setEditRashi(currentUser.rashi || '');
      setEditDob(currentUser.dob || '1996-11-06');
      setEditBirthTime(currentUser.birthTime || '');
      setEditBirthPlace(currentUser.birthPlace || '');
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    setDeleteToast(msg);
    setTimeout(() => {
      setDeleteToast((prev) => (prev === msg ? '' : prev));
    }, 3500);
  };

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmail = quickPhone.includes('@');
    const clean = isEmail ? quickPhone.trim() : cleanMobileNumber(quickPhone);

    if (!clean || (!isEmail && clean.length !== 10)) {
      setLoginError('कृपया अपना सही 10 अंकों का मोबाइल नंबर या ईमेल दर्ज करें।');
      return;
    }
    if (!quickPassword.trim()) {
      setLoginError('कृपया अपना पासवर्ड दर्ज करें।');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const acc = await loginOrSyncUser({
        phone: isEmail ? '' : clean,
        email: isEmail ? clean : '',
        password: quickPassword.trim(),
        mode: 'login',
      });
      vedicAudio.playTempleBell(0.65);
      onLoginSuccess(acc);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'WRONG_PASSWORD') {
        setLoginError('गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें या "पासवर्ड भूल गए?" पर क्लिक करें।');
      } else if (err instanceof Error && err.message === 'USER_NOT_FOUND') {
        setLoginError('यह खाता पंजीकृत नहीं है। कृपया पहले "नया खाता (Sign-Up)" टैब से पंजीकरण करें।');
      } else {
        setLoginError('लॉगिन करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleInlineSignup = async (e: React.FormEvent) => {
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
      const dobVal = editDob || '1995-01-01';
      const vedic = deriveVedicDetailsForProfile(quickName.trim(), dobVal, '12:00', 'रुद्रपुर');
      const acc = await loginOrSyncUser({
        phone: clean,
        name: quickName.trim(),
        password: quickPassword.trim(),
        mode: 'signup',
      });
      acc.dob = dobVal;
      acc.rashi = vedic.rashi;
      acc.birthPlace = 'रुद्रपुर';
      persistUserAccountUpdate(acc);
      vedicAudio.playTempleBell(0.65);
      onLoginSuccess(acc);
    } catch {
      setLoginError('खाता बनाने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyInlineForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cleanMobileNumber(quickPhone);
    if (clean.length !== 10 || !verifyDob) {
      setLoginError('कृपया सही 10 अंकों का मोबाइल नंबर और जन्म तिथि दर्ज करें।');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await verifyUserDobForReset(clean, verifyDob);
      setVerifiedUserName(res.name || '');
      setResetStep(2);
      vedicAudio.playTempleBell(0.5);
      showToast('✅ सत्यापन सफल! अब अपना नया पासवर्ड और कन्फर्म पासवर्ड दर्ज करें।');
    } catch (err: unknown) {
      setLoginError(
        err instanceof Error ? err.message : 'सत्यापन विफल। कृपया सही मोबाइल नंबर और जन्म तिथि दर्ज करें।'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResetInlinePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cleanMobileNumber(quickPhone);
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (trimmedNew.length < 3) {
      setLoginError('नया पासवर्ड कम से कम 3 अक्षरों का होना चाहिए।');
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      setLoginError('नया पासवर्ड और कन्फर्म पासवर्ड दोनों एक समान होने चाहिए।');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');
    try {
      await saveNewPasswordForUser(clean, verifyDob, trimmedNew);
      vedicAudio.playTempleBell(0.65);
      showToast('✅ आपका नया पासवर्ड सुरक्षित कर दिया गया है! अब नए पासवर्ड से लॉगिन करें।');
      setQuickPhone(clean);
      setQuickPassword(trimmedNew);
      setNewPassword('');
      setConfirmPassword('');
      setResetStep(1);
      setIsForgotPassword(false);
      setUserExists(true);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'पासवर्ड रीसेट करने में समस्या आई।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const vedic = deriveVedicDetailsForProfile(
      editName.trim() || currentUser.name,
      editDob || '1996-11-06',
      editBirthTime || '12:00',
      editBirthPlace || 'रुद्रपुर'
    );
    const updated: UserMobileAccount = {
      ...currentUser,
      name: editName.trim() || 'श्रद्धालु यजमान',
      avatar: editAvatar.trim(),
      password: editPassword.trim() || currentUser.password || '',
      rashi: editRashi.trim() || vedic.rashi,
      dob: editDob,
      birthTime: editBirthTime,
      birthPlace: editBirthPlace.trim() || 'रुद्रपुर',
      localityRudrapur: '',
    };
    onUpdateAccount(updated);
    setActiveProfile({
      id: updated.phone,
      name: updated.name,
      relation: 'self',
      gender: 'male',
      dob: updated.dob || '1996-11-06',
      birthTime: updated.birthTime || '12:00',
      birthPlace: updated.birthPlace || 'रुद्रपुर',
      rashi: updated.rashi || vedic.rashi,
      rashiLord: vedic.rashiLord,
      nakshatra: vedic.nakshatra,
      nakshatraPada: vedic.nakshatraPada,
      lagna: vedic.lagna,
      isPrimary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setProfileSavedToast(true);
    vedicAudio.playCrispTempleBell(0.75);
    setTimeout(() => {
      setProfileSavedToast(false);
      onNavigateToTab('home');
    }, 1200);
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

  const handleOpenKundaliMilanItem = (item: KundaliMilanHistoryItem) => {
    try {
      localStorage.setItem('panditji_open_milan_from_history', JSON.stringify(item));
    } catch {
      // ignore
    }
    vedicAudio.playCrispTempleBell(0.7);
    showToast(`✅ ${item.boyName} एवं ${item.girlName} का 36 गुण मिलान लोड किया जा रहा है...`);
    setTimeout(() => {
      onNavigateToTab('milan');
    }, 250);
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
              return guest && guest !== 'undefined' && guest !== 'null' ? JSON.parse(guest) : [];
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
      <section className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6 animate-fadeIn scroll-mt-24">
        {deleteToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{deleteToast}</span>
          </div>
        )}

        <div className="rounded-3xl bg-gradient-to-br from-[#1b1108] via-[#101726] to-[#0b101d] border-2 border-amber-500/60 p-5 sm:p-8 shadow-2xl">
          {/* Protected Account Notice */}
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-amber-200 font-semibold">
              <b>मेरा खाता (My Account) सुरक्षित है:</b> अपनी निजी वैदिक हिस्ट्री, मंत्र जप और कुंडली डेटा देखने के लिए कृपया लॉगिन करें।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left border-b border-amber-800/40 pb-5 mb-6">
            <PanditPortrait size="lg" showBadge={true} />
            <div>
              <span className="text-xs px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                आचार्य पण्डित शशांक शर्मा • निजी वैदिक डेटा एवं हिस्ट्री
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-vedic text-amber-100 mt-1">
                लॉगिन एवं साइन-अप (Login & Sign-Up)
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1">
                अपने 10 अंकों के मोबाइल नंबर से लॉगिन या साइन-अप करके अपनी <b>चैटबॉट बातचीत</b>, <b>मंत्र जप काउंटर</b>, <b>कुंडली मिलान</b> और <b>पूजा बुकिंग</b> की संपूर्ण हिस्ट्री देखें।
              </p>
            </div>
          </div>

          {/* Tab Selection */}
          {!isForgotPassword && (
            <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-amber-900/30 mb-6 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => {
                  setUserExists(true);
                  setLoginError('');
                }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  userExists !== false
                    ? 'bg-amber-500 text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
              >
                लॉगिन (Login)
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserExists(false);
                  setLoginError('');
                }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  userExists === false
                    ? 'bg-amber-500 text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
              >
                नया खाता (Sign-Up)
              </button>
            </div>
          )}

          {/* Quick 1-Click Login for Registered Demo Accounts */}
          <div className="p-3.5 rounded-2xl bg-black/60 border border-amber-600/40 mb-5">
            <p className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>पंजीकृत यजमान खाते (1-क्लिक में लॉगिन / स्विच करें):</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(PRESET_USERS).map((pu) => (
                <button
                  key={pu.phone}
                  type="button"
                  onClick={async () => {
                    setIsLoggingIn(true);
                    setLoginError('');
                    try {
                      const acc = await loginOrSyncUser({ phone: pu.phone, mode: 'login' });
                      vedicAudio.playTempleBell(0.65);
                      onLoginSuccess(acc);
                    } catch {
                      setLoginError('लॉगिन करने में त्रुटि हुई।');
                    } finally {
                      setIsLoggingIn(false);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-yellow-300 group-hover:text-white truncate">
                    {pu.name} ({pu.hindiName})
                  </div>
                  <div className="text-[10px] text-amber-200/80 truncate">
                    {pu.rashi.split(' ')[0]} • +91 {pu.phone.slice(-4)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {isForgotPassword ? (
              /* FORGOT PASSWORD FLOW */
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
                  <div className="flex items-center gap-2 text-amber-100 font-bold">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>पासवर्ड रीसेट करें (Forgot Password)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetStep(1);
                      setLoginError('');
                    }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    वापस लॉगिन (Back to Login)
                  </button>
                </div>

                <form
                  onSubmit={
                    resetStep === 1 ? handleVerifyInlineForgotPassword : handleResetInlinePassword
                  }
                  className="space-y-4"
                >
                  <p className="text-xs sm:text-sm text-amber-300/85">
                    {resetStep === 1
                      ? 'अपना पंजीकृत 10 अंकों का मोबाइल नंबर और जन्म तिथि दर्ज करके सत्यापित करें।'
                      : 'मोबाइल नंबर और जन्म तिथि सत्यापित हो चुकी है। अब अपना नया पासवर्ड सेट करें।'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        value={quickPhone}
                        onChange={(e) => {
                          setQuickPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                          setLoginError('');
                        }}
                        className={`w-full px-3.5 py-3 bg-slate-950 border rounded-xl text-amber-100 font-mono text-sm focus:outline-none ${
                          resetStep === 2
                            ? 'border-emerald-500/50 opacity-80 cursor-not-allowed'
                            : 'border-amber-600/50 focus:border-amber-400'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-300 mb-1.5">
                        पंजीकृत जन्म तिथि (Date of Birth) *
                      </label>
                      <input
                        type="date"
                        required
                        disabled={resetStep === 2}
                        value={verifyDob}
                        onChange={(e) => {
                          setVerifyDob(e.target.value);
                          setLoginError('');
                        }}
                        className={`w-full px-3.5 py-3 bg-slate-950 border rounded-xl text-amber-100 font-mono text-sm focus:outline-none ${
                          resetStep === 2
                            ? 'border-emerald-500/50 opacity-80 cursor-not-allowed'
                            : 'border-amber-600/50 focus:border-amber-400'
                        }`}
                      />
                    </div>
                  </div>

                  {resetStep === 1 ? (
                    <>
                      {loginError && (
                        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-bold">
                          {loginError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(false);
                            setResetStep(1);
                            setLoginError('');
                          }}
                          className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm cursor-pointer hover:bg-slate-700 border border-slate-700"
                        >
                          वापस लॉगिन (Login)
                        </button>
                        <button
                          type="submit"
                          disabled={isLoggingIn}
                          className="flex-[2] py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg cursor-pointer transition-all active:scale-95"
                        >
                          {isLoggingIn ? 'सत्यापन हो रहा है...' : 'विवरण सत्यापित करें (Verify Details)'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 pt-3 border-t border-emerald-500/30 animate-fadeIn">
                      <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between gap-2">
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
                            setLoginError('');
                          }}
                          className="text-xs text-amber-300 underline hover:text-amber-200 cursor-pointer"
                        >
                          बदलें
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-amber-300 mb-1.5">
                          नया पासवर्ड (New Password) *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            autoFocus
                            minLength={3}
                            placeholder="नया पासवर्ड दर्ज करें (कम से कम 3 अक्षर)"
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              setLoginError('');
                            }}
                            className="w-full pl-9 pr-10 py-3 bg-slate-950 border border-amber-500/70 focus:border-amber-400 rounded-xl text-sm text-amber-100 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-3.5 text-slate-400 hover:text-amber-200 cursor-pointer"
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
                          <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            minLength={3}
                            placeholder="नया पासवर्ड दोबारा दर्ज करें"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setLoginError('');
                            }}
                            className="w-full pl-9 pr-10 py-3 bg-slate-950 border border-amber-500/70 focus:border-amber-400 rounded-xl text-sm text-amber-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      {loginError && (
                        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-bold">
                          {loginError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm sm:text-base shadow-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>
                          {isLoggingIn
                            ? 'नया पासवर्ड सुरक्षित किया जा रहा है...'
                            : 'नया पासवर्ड सुरक्षित करें (Save New Password)'}
                        </span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            ) : userExists !== false ? (
              /* LOGIN FLOW */
              <form onSubmit={handleInlineLogin} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                    मोबाइल नंबर या ईमेल (Mobile or Email) *
                  </label>
                  <div className="flex items-center bg-slate-950 border-2 border-amber-500/60 rounded-xl overflow-hidden shadow-inner transition-all duration-300 focus-within:border-amber-400">
                    <input
                      type="text"
                      required
                      placeholder="9876543210 या example@mail.com"
                      value={quickPhone}
                      onChange={(e) => {
                        setQuickPhone(e.target.value);
                        setLoginError('');
                      }}
                      className="w-full px-4 py-3.5 bg-transparent text-amber-100 font-bold text-base sm:text-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-amber-300">
                      पासवर्ड दर्ज करें (Password) *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setResetStep(1);
                        setLoginError('');
                      }}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      पासवर्ड भूल गए? (Forgot Password?)
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
                    <input
                      type={showQuickPassword ? 'text' : 'password'}
                      required
                      placeholder="अपना पासवर्ड दर्ज करें"
                      value={quickPassword}
                      onChange={(e) => {
                        setQuickPassword(e.target.value);
                        setLoginError('');
                      }}
                      className="w-full pl-9 pr-10 py-3 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none focus:border-amber-500 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowQuickPassword(!showQuickPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-amber-300 cursor-pointer"
                    >
                      {showQuickPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs font-semibold animate-shake text-center">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-black text-sm sm:text-base shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoggingIn ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  <span>लॉगिन करें (Secure Login)</span>
                </button>
              </form>
            ) : (
              /* SIGN UP FLOW */
              <form onSubmit={handleInlineSignup} className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      आपका नाम (Full Name) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="उदा. राजेश शर्मा"
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                        className="w-full pl-9 pr-3 py-3 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none focus:border-amber-500 shadow-inner"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      मोबाइल (+91) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={quickPhone}
                        onChange={(e) => setQuickPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-9 pr-3 py-3 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none focus:border-amber-500 shadow-inner font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      जन्म तिथि (DOB) *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                      <input
                        type="date"
                        required
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        className="w-full pl-9 pr-3 py-3 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none shadow-inner"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      पासवर्ड चुनें (Password) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                      <input
                        type={showQuickPassword ? 'text' : 'password'}
                        required
                        minLength={3}
                        placeholder="नया पासवर्ड"
                        value={quickPassword}
                        onChange={(e) => {
                          setQuickPassword(e.target.value);
                          setLoginError('');
                        }}
                        className="w-full pl-9 pr-10 py-3 bg-slate-950 border border-amber-900/60 rounded-xl text-sm text-amber-100 focus:outline-none focus:border-amber-500 shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowQuickPassword(!showQuickPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 cursor-pointer"
                      >
                        {showQuickPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-semibold animate-shake">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoggingIn ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  <span>नया खाता बनाएँ (Sign-Up)</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 animate-fadeIn scroll-mt-24">
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
            <UserAvatar currentUser={currentUser} size="lg" />
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

        {/* Secure Authenticated Account Session Card */}
        <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-[#14100a] border border-amber-500/40 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-xs font-bold text-amber-200">
                सत्यापित निजी खाता: <strong className="text-yellow-300">{currentUser.name}</strong> (+91 {currentUser.phone})
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 font-medium">
              <span>🔒 निजी सत्र सक्रिय — समस्त कुंडली व मिलान डेटा केवल आपके खाते में सुरक्षित है</span>
            </div>
          </div>
        </div>

        {/* Digital Mandir Bhakti Streak & Lifetime Sadhana Highlight */}
        {(() => {
          const mandirState = getInitialSadhanaState();
          return (
            <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-[#1c1208] to-slate-950 border border-[#d4af37]/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
                  🪔
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold font-vedic text-yellow-300">
                      डिजिटल मंदिर भक्ति साधना रिकॉर्ड
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-yellow-300 border border-amber-400/40">
                      नित्य संकल्प
                    </span>
                  </div>
                  <div className="text-xs text-amber-200/80 mt-0.5 flex flex-wrap items-center gap-2">
                    <span>
                      🔥 <b>{mandirState.streakDays} दिन</b> लगातार स्ट्रीक
                    </span>
                    <span>•</span>
                    <span>
                      🕉️ कुल <b>{mandirState.totalLifetimeSadhana} बार</b> साधना संपन्न
                    </span>
                  </div>
                </div>
              </div>

              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('mandir')}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>मंदिर दर्शन करें</span>
                </button>
              )}
            </div>
          );
        })()}

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

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  जन्म स्थान (Birth Place)
                </label>
                <input
                  type="text"
                  placeholder="उदा. रुद्रपुर, उत्तराखण्ड / हल्द्वानी"
                  value={editBirthPlace}
                  onChange={(e) => setEditBirthPlace(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-xs text-amber-100"
                />
              </div>

              {/* Global "जन्मांक / कुंडली अनुसार" vs "नाम राशि अनुसार" Mode Switcher */}
              <div className="pt-3 border-t border-amber-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    ज्योतिष गणना आधार (Global Calculation Mode):
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    पूरे ऐप में सिंक
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcViewingMode('astronomical')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      calcViewingMode === 'astronomical'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-yellow-300 shadow-lg'
                        : 'bg-slate-950 border-amber-900/50 text-amber-200 hover:border-amber-500/50'
                    }`}
                  >
                    <div>🔭 जन्मांक / कुंडली अनुसार</div>
                    <div
                      className={`text-[10px] mt-0.5 font-medium ${
                        calcViewingMode === 'astronomical' ? 'text-slate-900' : 'text-amber-300/60'
                      }`}
                    >
                      जन्म तिथि, समय व लग्न से
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcViewingMode('name_rashi')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      calcViewingMode === 'name_rashi'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-yellow-300 shadow-lg'
                        : 'bg-slate-950 border-amber-900/50 text-amber-200 hover:border-amber-500/50'
                    }`}
                  >
                    <div>🔤 नाम राशि अनुसार</div>
                    <div
                      className={`text-[10px] mt-0.5 font-medium ${
                        calcViewingMode === 'name_rashi' ? 'text-slate-900' : 'text-amber-300/60'
                      }`}
                    >
                      प्रचलित नाम अक्षर व नक्षत्र से
                    </div>
                  </button>
                </div>
              </div>

              {profileSavedToast && (
                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> आपकी जानकारी सहेज ली गई है!
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

            {/* ==================== TEMPLE-GOLD PUNYA POINTS REWARD DASHBOARD ==================== */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-950/80 via-[#1b1005] to-slate-950 border-2 border-amber-500/60 shadow-xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-yellow-300">
                      पुण्य पॉइंट्स (Punya Points) रिवार्ड्स
                    </h4>
                    <p className="text-[11px] text-amber-200/80">
                      प्रतिदिन ऐप खोलने या पंचांग दर्शन पर +1 पुण्य पॉइंट स्वतः जुड़ता है
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-yellow-400/60 text-right shrink-0">
                  <div className="text-[10px] font-bold text-amber-300 uppercase">कुल संचित पुण्य</div>
                  <div className="text-base font-black text-yellow-300">{punyaPoints} अंक</div>
                </div>
              </div>

              {/* Daily Earning Status */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between gap-2 text-xs">
                <span className="text-amber-200 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  आज का दैनिक पंचांग दर्शन (+1 पुण्य पॉइंट):
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold text-[11px]">
                  {claimedToday ? '✓ आज प्राप्त हो चुका' : 'सक्रिय (+1 अंक)'}
                </span>
              </div>

              {/* Exclusive ₹100 Special Offer Redemption Rule */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 space-y-2">
                <div className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] sm:text-xs text-amber-100 leading-relaxed font-semibold">
                    <span className="text-yellow-300 font-extrabold">विशेष नियम (Exclusive Rule):</span>{' '}
                    आपके संचित पुण्य पॉइंट्स <span className="underline decoration-yellow-400 font-black">केवल ₹100 स्पेशल ऑफर</span> (विशेष दक्षिणा / परामर्श पैकेज) में ही रिडीम किए जा सकते हैं। किसी अन्य पैकेज पर यह लागू नहीं होगा।
                  </p>
                </div>

                {active100Coupon && (
                  <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center justify-between">
                    <span>🎟️ सक्रिय ₹100 स्पेशल ऑफर कूपन:</span>
                    <span className="font-mono text-yellow-300 bg-slate-950 px-2 py-0.5 rounded border border-yellow-400/40">
                      {active100Coupon}
                    </span>
                  </div>
                )}

                {punyaRedeemFeedback && (
                  <div
                    className={`p-2 rounded-lg text-xs font-bold ${
                      punyaRedeemFeedback.type === 'success'
                        ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300'
                        : 'bg-amber-950/90 border border-amber-500/50 text-amber-200'
                    }`}
                  >
                    {punyaRedeemFeedback.text}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRedeem100Offer}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Gift className="w-4 h-4" />
                  <span>₹100 स्पेशल ऑफर के लिए 100 पुण्य पॉइंट्स रिडीम करें</span>
                </button>
              </div>
            </div>
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

            {/* 36 Gun Kundali Milan Recent Preview */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1526] border border-amber-800/40 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm sm:text-base font-bold font-vedic text-amber-100 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-rose-400" />
                  <span>हाल ही का 36 गुण मिलान (Kundali Milan History)</span>
                </h4>
                <div className="flex items-center gap-2">
                  {userKundaliHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearKundaliHistory}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> साफ़ करें
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSubTab('milan')}
                    className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    सभी {userKundaliHistory.length} देखें →
                  </button>
                </div>
              </div>
              {userKundaliHistory.length === 0 ? (
                <p className="text-xs text-slate-400">
                  अभी तक कोई 36 गुण कुंडली मिलान रिकॉर्ड दर्ज नहीं है।
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {userKundaliHistory.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenKundaliMilanItem(m)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenKundaliMilanItem(m);
                        }
                      }}
                      className="group p-3.5 rounded-xl bg-slate-900/90 hover:bg-amber-950/35 border border-amber-800/40 hover:border-amber-400/80 hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-2.5 text-xs cursor-pointer shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-amber-100 group-hover:text-amber-300 transition-colors block truncate">
                            {m.boyName} &amp; {m.girlName}
                          </span>
                          <span className="text-[11px] text-emerald-300 font-mono font-bold block mt-0.5">
                            {m.totalScore}/36 गुण • {m.overallVerdict}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {m.timestamp}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSingleKundaliItem(m.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer flex-shrink-0"
                          title="यह मिलान हिस्ट्री डिलीट करें"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenKundaliMilanItem(m);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <RotateCcw className="w-3 h-3 text-slate-950" />
                        <span>🔄 पुनः उपयोग करें (Use Again) →</span>
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
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenKundaliMilanItem(m)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenKundaliMilanItem(m);
                    }
                  }}
                  className="group p-4 rounded-2xl bg-slate-900/90 hover:bg-amber-950/35 border border-amber-800/40 hover:border-amber-400/80 hover:-translate-y-0.5 transition-all space-y-2.5 cursor-pointer shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold font-vedic text-amber-100 group-hover:text-amber-300 transition-colors truncate">
                      वर: {m.boyName} &amp; कन्या: {m.girlName}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs">
                        {m.totalScore} / 36 गुण
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenKundaliMilanItem(m);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                        title="यह कुंडली मिलान पुनः लोड करें और 36 गुण रिपोर्ट देखें"
                      >
                        <RotateCcw className="w-3 h-3 text-slate-950" />
                        <span>🔄 पुनः उपयोग करें (Use Again)</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSingleKundaliItem(m.id);
                        }}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 cursor-pointer"
                        title="यह कुंडली मिलान रिकॉर्ड डिलीट करें"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-amber-200/85 space-y-1">
                    <p>
                      • वर: <strong className="text-amber-100">{m.boyName}</strong> — {m.boyRashi} {m.boyNakshatra ? `(${m.boyNakshatra})` : ''} {m.boyDob ? `(DOB: ${m.boyDob}, ${m.boyTime}${m.boyPlace ? `, ${m.boyPlace}` : ''})` : ''}
                    </p>
                    <p>
                      • कन्या: <strong className="text-amber-100">{m.girlName}</strong> — {m.girlRashi} {m.girlNakshatra ? `(${m.girlNakshatra})` : ''} {m.girlDob ? `(DOB: ${m.girlDob}, ${m.girlTime}${m.girlPlace ? `, ${m.girlPlace}` : ''})` : ''}
                    </p>
                    {m.manglikVerdict && (
                      <p className="text-[11px] text-rose-300 font-medium">
                        • {m.manglikVerdict}
                      </p>
                    )}
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
