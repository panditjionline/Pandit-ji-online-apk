/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { PanditPortrait } from './components/PanditPortrait';
import { LiveTodayPanchangRibbon } from './components/LiveTodayPanchangRibbon';
import { ServicesSection } from './components/ServicesSection';
import { YouTubeFeed } from './components/YouTubeFeed';
import { ShashankSharmaChat } from './components/ShashankSharmaChat';
import { BookingModal } from './components/BookingModal';
import { SpiritualAudioPlayer } from './components/SpiritualAudioPlayer';
import { FloatingChatDrawer } from './components/FloatingChatDrawer';
import { KundaliMilanSection } from './components/KundaliMilanSection';
import { SampurnKundaliSection } from './components/SampurnKundaliSection';
import { MantraJaapSection } from './components/MantraJaapSection';
import { MobileLoginModal } from './components/MobileLoginModal';
import { SmartNotificationManager } from './components/SmartNotificationManager';
import { UserHistoryHub } from './components/UserHistoryHub';
import { VisitorCounterBanner, FooterVisitorBadge } from './components/VisitorCounter';
import { DailyRashifalWidget } from './components/DailyRashifalWidget';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HinduPanchangCalendar } from './components/HinduPanchangCalendar';
import { DharmGyanKoshSection, DharmGyanTabType } from './components/DharmGyanKoshSection';
import { DigitalMandirSection } from './components/DigitalMandirSection';
import { YajmanTestimonials } from './components/YajmanTestimonials';
import { RudrapurLocalBanner } from './components/RudrapurLocalBanner';
import { PersonalizedHomeHero } from './components/PersonalizedHomeHero';
import { getDayDeity } from './data/digitalMandirData';
import {
  PujaService,
  BookingRequest,
  UserMobileAccount,
  ChatMessage,
  JaapHistoryEntry,
  KundaliMilanHistoryItem,
  JanamKundaliHistoryItem,
} from './types';
import { PUJA_SERVICES, SPIRITUAL_TRACKS, getTodayPanchang } from './data/mockData';
import { BRAND_CONFIG } from './config/brand';
import { vedicAudio } from './utils/audioSynthesizer';
import {
  getActiveMobilePhone,
  getActiveSessionAccount,
  getLocalUserByPhone,
  loginOrSyncMobileUser,
  persistUserAccountUpdate,
  saveLocalUserAccount,
  setActiveMobilePhone,
} from './utils/userAccountStorage';
import { getActiveProfile, setActiveProfile, clearActiveProfile } from './utils/autoPersonalization';
import { deriveVedicDetailsForProfile } from './utils/familyVaultStorage';
import { getISTCalendarParts, getMsUntilNextISTMidnight } from './utils/panchangCalendarEngine';
import { claimDailyPunyaPoint } from './utils/punya';
import {
  Sparkles,
  Youtube,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  Tag,
  HeartHandshake,
  Flame,
  History,
  User,
  CheckCircle2,
  Compass,
  Calendar,
  CalendarCheck,
  BookOpen,
  Target,
  Clock,
  ClipboardList,
  Wind,
  Moon,
  Sun,
  ShieldCheck,
  Grid,
  Search,
  X,
  Star,
  Award,
  Zap,
  ChevronRight,
  Landmark,
  Bell,
} from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';
import { resolveInitialTabFromUrl, syncActiveRouteSeo } from './utils/seoEngine';

export default function App() {
  const { t, tr, localizeVedicText } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>(() => resolveInitialTabFromUrl());
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<PujaService | null>(null);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  const [recentBookings, setRecentBookings] = useState<BookingRequest[]>([]);
  const [gyanKoshCategory, setGyanKoshCategory] = useState<DharmGyanTabType>('aarti-chalisa');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'jyotish' | 'sadhana' | 'gyan' | 'puja'>('all');
  const [directorySearchQuery, setDirectorySearchQuery] = useState<string>('');
  const [istDateKey, setIstDateKey] = useState<string>(() => getISTCalendarParts(new Date()).dateKey);
  const [todayPanchang, setTodayPanchang] = useState(() => getTodayPanchang(new Date()));

  // Automated 12:00 AM IST Midnight Check & State-Refresh Mechanism
  useEffect(() => {
    let midnightTimeoutId: number | null = null;

    const refreshDailyAstrologicalState = () => {
      const now = new Date();
      const nextParts = getISTCalendarParts(now);
      setIstDateKey((prevKey) => {
        if (prevKey !== nextParts.dateKey) {
          setTodayPanchang(getTodayPanchang(now));
          window.dispatchEvent(
            new CustomEvent('panditji_midnight_refresh', { detail: { dateKey: nextParts.dateKey } })
          );
          return nextParts.dateKey;
        }
        return prevKey;
      });
    };

    const scheduleMidnightRefresh = () => {
      if (midnightTimeoutId !== null) window.clearTimeout(midnightTimeoutId);
      const msToMidnight = getMsUntilNextISTMidnight(new Date());
      midnightTimeoutId = window.setTimeout(() => {
        const now = new Date();
        const nextParts = getISTCalendarParts(now);
        setIstDateKey(nextParts.dateKey);
        setTodayPanchang(getTodayPanchang(now));
        window.dispatchEvent(
          new CustomEvent('panditji_midnight_refresh', { detail: { dateKey: nextParts.dateKey } })
        );
        scheduleMidnightRefresh();
      }, msToMidnight);
    };

    scheduleMidnightRefresh();
    const intervalId = window.setInterval(refreshDailyAstrologicalState, 15000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshDailyAstrologicalState();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (midnightTimeoutId !== null) window.clearTimeout(midnightTimeoutId);
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const navigateToGyanKosh = (category: DharmGyanTabType) => {
    setGyanKoshCategory(category);
    setActiveTab('gyan-kosh');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Always keep page at the top when switching tabs and synchronize dynamic SEO metadata
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    syncActiveRouteSeo(activeTab);
    if (activeTab !== 'chat') {
      setChatInitialPrompt('');
    }
  }, [activeTab, istDateKey]);

  // Immediately read and restore the active logged-in mobile account and session token from localStorage on startup
  const [currentUser, setCurrentUser] = useState<UserMobileAccount | null>(() => {
    return getActiveSessionAccount();
  });

  useEffect(() => {
    const restoredAccount = getActiveSessionAccount();
    const activePhone = getActiveMobilePhone();

    if (restoredAccount && activePhone) {
      setCurrentUser(restoredAccount);
      syncAccountToActiveProfile(restoredAccount);

      // Sync latest account state from server in the background while keeping session active
      loginOrSyncMobileUser(activePhone, restoredAccount.name, restoredAccount.password)
        .then((synced) => {
          setCurrentUser(synced);
          syncAccountToActiveProfile(synced);
        })
        .catch(() => {
          // Keep local restored session if offline or background sync fails
        });
    } else if (activePhone) {
      const localAcc = getLocalUserByPhone(activePhone);
      if (localAcc) {
        setCurrentUser(localAcc);
        syncAccountToActiveProfile(localAcc);
      }
      loginOrSyncMobileUser(activePhone, localAcc?.name, localAcc?.password)
        .then((synced) => {
          setCurrentUser(synced);
          syncAccountToActiveProfile(synced);
        })
        .catch(() => {});
    } else {
      clearActiveProfile();
    }

    // Award +1 Daily Punya Point once per calendar day on app open
    claimDailyPunyaPoint('app_open');
  }, []);

  const handleSetActiveTab = (tab: string) => {
    if (tab === 'history' && !currentUser) {
      setIsLoginModalOpen(true);
      setActiveTab('history');
      return;
    }
    setActiveTab(tab);
  };

  const syncAccountToActiveProfile = (account: UserMobileAccount) => {
    try {
      const dob = account.dob || '1996-03-10';
      const birthTime = account.birthTime || '10:00';
      const birthPlace = account.birthPlace || 'रुद्रपुर, उत्तराखण्ड';

      const vedic = deriveVedicDetailsForProfile(
        account.name || 'यजमान',
        dob,
        birthTime,
        birthPlace
      );

      const resolvedRashi = vedic.rashi || account.rashi || 'कुंभ (Aquarius)';
      const resolvedLagna = vedic.lagna || account.lagna || 'वृषभ (Taurus)';
      const resolvedNakshatra = vedic.nakshatra || account.nakshatra || 'शतभिषा (Shatabhisha)';

      // Keep user account fields in sync with the authentic calculation
      account.rashi = resolvedRashi;
      account.lagna = resolvedLagna;
      account.nakshatra = resolvedNakshatra;

      const newProf = {
        id: account.phone ? `user-${account.phone}` : 'mera-khata-user',
        name: account.name || 'यजमान',
        relation: 'self' as const,
        gender: 'male' as const,
        dob,
        birthTime,
        birthPlace,
        rashi: resolvedRashi,
        rashiLord: vedic.rashiLord || 'शनि (Saturn)',
        nakshatra: resolvedNakshatra,
        nakshatraPada: vedic.nakshatraPada || 1,
        lagna: resolvedLagna,
        isPrimary: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setActiveProfile(newProf);
      window.dispatchEvent(new CustomEvent('panditji_active_profile_updated', { detail: newProf }));
    } catch {
      // ignore
    }
  };

  // Sync currentUser (from Mera Khata) to activeProfile so Home page dynamically reflects user name and rashi in real-time
  useEffect(() => {
    if (currentUser && currentUser.name) {
      syncAccountToActiveProfile(currentUser);
    }
  }, [
    currentUser?.phone,
    currentUser?.name,
    currentUser?.dob,
    currentUser?.birthTime,
    currentUser?.birthPlace,
    currentUser?.rashi,
  ]);

  // Load Bookings strictly for the logged-in user's phone number (100% private)
  useEffect(() => {
    if (!currentUser?.phone) {
      setRecentBookings([]);
      return;
    }

    const cleanPhone = currentUser.phone.replace(/\D/g, '').slice(-10);
    try {
      const savedBookings = localStorage.getItem('panditji_online_bookings');
      if (savedBookings && savedBookings !== 'undefined' && savedBookings !== 'null') {
        const parsed: BookingRequest[] = JSON.parse(savedBookings);
        setRecentBookings(
          parsed.filter((b) => (b.phone || '').replace(/\D/g, '').slice(-10) === cleanPhone)
        );
      }
    } catch {
      // ignore
    }

    fetch(`/api/bookings?phone=${encodeURIComponent(cleanPhone)}`)
      .then((res) => res.json())
      .then((serverBookings) => {
        if (Array.isArray(serverBookings) && serverBookings.length > 0) {
          setRecentBookings((prev) => {
            const combined = [...serverBookings];
            prev.forEach((b) => {
              if (!combined.some((item) => item.id === b.id)) {
                combined.push(b);
              }
            });
            return combined;
          });
        }
      })
      .catch(() => {});
  }, [currentUser?.phone]);

  const handleLoginSuccess = (account: UserMobileAccount) => {
    if (account.phone) {
      setActiveMobilePhone(account.phone);
    }
    saveLocalUserAccount(account);
    setCurrentUser(account);
    syncAccountToActiveProfile(account);
  };

  const handleLogout = () => {
    setActiveMobilePhone(null);
    clearActiveProfile();
    setCurrentUser(null);
    try {
      localStorage.removeItem('panditji_active_mobile_phone');
      localStorage.removeItem('panditji_active_session_token');
      localStorage.removeItem('panditji_active_user_account');
      localStorage.removeItem('activeYajmanProfile');
      localStorage.removeItem('panditji_default_active_profile');
      localStorage.removeItem('panditji_family_vault_v1');
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('panditji_active_profile_updated'));
    window.dispatchEvent(new CustomEvent('panditji_vault_updated', { detail: [] }));
    vedicAudio.playClickSpark(0.3);
  };

  const handleUpdateUserAccount = (updated: UserMobileAccount) => {
    setCurrentUser(updated);
    persistUserAccountUpdate(updated);
    syncAccountToActiveProfile(updated);
  };

  const handleUpdateChatMessages = (messages: ChatMessage[]) => {
    if (!currentUser) return;
    const updated: UserMobileAccount = {
      ...currentUser,
      chatMessages: messages,
    };
    setCurrentUser(updated);
    persistUserAccountUpdate(updated);
  };

  const handleSyncJaapData = (
    stats: { currentCount: number; completedMalas: number; lifetimeJaap: number },
    history: JaapHistoryEntry[]
  ) => {
    if (!currentUser) return;
    const updated: UserMobileAccount = {
      ...currentUser,
      jaapStats: stats,
      jaapHistory: history,
    };
    setCurrentUser(updated);
    persistUserAccountUpdate(updated);
  };

  const handleSaveKundaliHistoryItem = (item: KundaliMilanHistoryItem) => {
    if (!currentUser) return;
    const existing = currentUser.kundaliHistory || [];
    const updated: UserMobileAccount = {
      ...currentUser,
      kundaliHistory: [item, ...existing.filter((x) => x.id !== item.id).slice(0, 29)],
    };
    setCurrentUser(updated);
    persistUserAccountUpdate(updated);
  };

  const handleSaveJanamKundaliHistoryItem = (item: JanamKundaliHistoryItem) => {
    if (!currentUser) return;
    const existing = currentUser.janamKundaliHistory || [];
    const updated: UserMobileAccount = {
      ...currentUser,
      janamKundaliHistory: [item, ...existing.filter((x) => x.id !== item.id).slice(0, 29)],
    };
    setCurrentUser(updated);
    persistUserAccountUpdate(updated);
  };

  const handleDeleteJanamKundaliHistoryItem = (id: string) => {
    if (!currentUser) return;
    const existing = currentUser.janamKundaliHistory || [];
    const updated: UserMobileAccount = {
      ...currentUser,
      janamKundaliHistory: existing.filter((x) => x.id !== id),
    };
    setCurrentUser(updated);
    persistUserAccountUpdate(updated);
  };

  const handleClearAllJanamKundaliHistory = () => {
    if (!currentUser) return;
    const updated: UserMobileAccount = {
      ...currentUser,
      janamKundaliHistory: [],
    };
    setCurrentUser(updated);
    persistUserAccountUpdate(updated);
  };

  const handleBookingSuccess = (booking: BookingRequest) => {
    const updated = [booking, ...recentBookings];
    setRecentBookings(updated);
    try {
      localStorage.setItem('panditji_online_bookings', JSON.stringify(updated));
    } catch {
      // ignore
    }

    vedicAudio.playTempleBell(0.75);
    setTimeout(() => {
      vedicAudio.playShankh();
    }, 350);
  };

  const handleDeleteBookingById = (bookingId: string) => {
    setRecentBookings((prev) => {
      const updated = prev.filter((b) => b.id !== bookingId);
      try {
        localStorage.setItem('panditji_online_bookings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    fetch(`/api/bookings?id=${encodeURIComponent(bookingId)}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  const handleDeleteAllUserBookings = () => {
    if (!currentUser) return;
    const cleanPhone = currentUser.phone.replace(/\D/g, '').slice(-10);
    setRecentBookings((prev) => {
      const updated = prev.filter(
        (b) => (b.phone || '').replace(/\D/g, '').slice(-10) !== cleanPhone
      );
      try {
        localStorage.setItem('panditji_online_bookings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    fetch(`/api/bookings?phone=${encodeURIComponent(cleanPhone)}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  useEffect(() => {
    const unsubscribe = vedicAudio.subscribe((playing) => {
      setIsAudioPlaying(playing);
    });
    return unsubscribe;
  }, []);

  const toggleAudio = (freq?: number, mantraText?: string) => {
    try {
      const defaultTrack = SPIRITUAL_TRACKS[0];
      const status = vedicAudio.toggle(
        freq || defaultTrack.toneFrequency,
        mantraText || defaultTrack.shortMantra || defaultTrack.sanskritLyrics
      );
      setIsAudioPlaying(status);
    } catch (err) {
      console.warn('Audio toggle handled:', err);
      setIsAudioPlaying(false);
    }
  };

  const openBookingForService = (service: PujaService) => {
    setSelectedServiceForBooking(service);
    setIsBookingModalOpen(true);
  };

  const askPanditInChat = (serviceOrQuestion: string) => {
    setChatInitialPrompt(
      `पण्डित जी, मुझे "${serviceOrQuestion}" के बारे में शास्त्रसम्मत परामर्श दें। इसके शुभ लाभ, पूजा विधि और क्या सावधानियां रखनी चाहिए?`
    );
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-amber-50 flex flex-col font-sans selection:bg-amber-600/30 selection:text-amber-200">
      {/* Universal Vedic Header with Direct WhatsApp Booking & Mobile Login */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        isAudioPlaying={isAudioPlaying}
        toggleAudio={toggleAudio}
        onOpenBooking={() => {
          setSelectedServiceForBooking(null);
          setIsBookingModalOpen(true);
        }}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full overflow-x-hidden mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* ==================== TAB 1: HOME ==================== */}
        {activeTab === 'home' && (
          <div className="space-y-6 sm:space-y-8">
            {/* ============================================================== */}
            {/* 0. AUTO-PERSONALIZED VEDIC ASTROLOGY HERO (USER NAME & RASHI) */}
            {/* Strictly rendered only when user is actively logged in */}
            {/* ============================================================== */}
            {Boolean(currentUser) && (
              <PersonalizedHomeHero
                currentUser={currentUser}
                isLoggedIn={Boolean(currentUser)}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
                onSwitchUserAccount={handleLoginSuccess}
                onOpenVault={() => {
                  setActiveTab('janam-kundali'); // or family vault modal
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenJanamKundali={() => {
                  setActiveTab('janam-kundali');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenRashifal={() => {
                  setActiveTab('home');
                  const el = document.getElementById('daily-rashifal-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* ============================================================== */}
            {/* 1. TOPMOST: TODAY'S LIVE PANCHANG, DATE & TIME RIBBON */}
            {/* ============================================================== */}
            <LiveTodayPanchangRibbon
              mode="home"
              onOpenPanchangPage={() => {
                setActiveTab('panchang');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* ============================================================== */}
            {/* 1b. FEATURED: DIGITAL MANDIR (DIRECTLY UNDER PANCHANG) */}
            {/* ============================================================== */}
            {(() => {
              const dayDeity = getDayDeity();
              return (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1d1208] via-[#24170a] to-[#140d06] border-2 border-[#d4af37] p-4 sm:p-6 shadow-[0_12px_45px_rgba(0,0,0,0.85)]">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 sm:gap-4 w-full md:w-auto">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.4)] flex-shrink-0 bg-black relative">
                        <img
                          src={`${dayDeity.primaryImage}?v=9`}
                          alt={dayDeity.hindiName}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/deities/hanuman.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-0.5">
                          <span className="text-xs font-bold text-yellow-300 font-vedic">
                            {dayDeity.deityIcon}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-[#d4af37]/50 text-yellow-300 text-[10px] sm:text-xs font-bold mb-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>
                            {tr(
                              `आज: ${dayDeity.hindiDayName} के पावन अधिष्ठाता देव`,
                              `Today: ${dayDeity.dayName}'s Sacred Deity`
                            )}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-2xl font-extrabold font-vedic text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-400">
                          {tr(dayDeity.hindiName, dayDeity.name)}
                        </h3>
                        <p className="text-xs text-amber-200/80 line-clamp-1 mt-0.5">
                          {localizeVedicText(dayDeity.subTitle)}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-amber-300/80 mt-1">
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-400" /> {tr('अखण्ड ज्योति', 'Akhand Diya')}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Bell className="w-3 h-3 text-yellow-400" /> {tr('घंटी नाद', 'Temple Bell')}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            🌸 {tr('पुष्पांजलि', 'Pushpanjali')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          vedicAudio.playCrispTempleBell(0.85);
                          setActiveTab('mandir');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-[0_4px_20px_rgba(212,175,55,0.4)] border border-yellow-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Landmark className="w-4 h-4 text-slate-950" />
                        <span>{tr('मंदिर प्रवेश व दर्शन करें', 'Enter Digital Mandir')}</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Quick 4-Pillar Access Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  vedicAudio.playCrispTempleBell(0.85);
                  setActiveTab('mandir');
                }}
                className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-[#1c1208] to-[#120b05] border border-[#d4af37]/60 hover:border-yellow-300 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-md group flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-yellow-300 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors border border-amber-400/40">
                  🪔
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold font-vedic text-amber-100 group-hover:text-yellow-300 truncate">
                    {tr('श्री डिजिटल मंदिर', 'Digital Mandir')}
                  </div>
                  <div className="text-[10px] text-amber-300/80 truncate">
                    {tr('नित्य दर्शन व आरती', 'Daily Aarti & Bell')}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('janam-kundali')}
                className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-[#121929] to-[#0a101b] border border-amber-600/50 hover:border-amber-300 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-md group flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors border border-indigo-400/40">
                  📜
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold font-vedic text-amber-100 group-hover:text-yellow-300 truncate">
                    {tr('सम्पूर्ण जन्म कुंडली', 'Birth Kundali')}
                  </div>
                  <div className="text-[10px] text-emerald-300 truncate">
                    {tr('निःशुल्क लग्न व दशा', 'Free Chart & Dasha')}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('milan')}
                className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-[#241016] to-[#14080d] border border-rose-500/50 hover:border-rose-300 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-md group flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-rose-500 group-hover:text-slate-950 transition-colors border border-rose-400/40">
                  💑
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold font-vedic text-amber-100 group-hover:text-yellow-300 truncate">
                    {tr('३६ गुण मिलान', '36 Gun Milan')}
                  </div>
                  <div className="text-[10px] text-rose-300 truncate">
                    {tr('वर-कन्या विवाह विचार', 'Marriage Match')}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('jaap')}
                className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-[#1c1408] to-[#110d05] border border-yellow-500/50 hover:border-yellow-300 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-md group flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-300 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-yellow-500 group-hover:text-slate-950 transition-colors border border-yellow-400/40">
                  📿
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold font-vedic text-amber-100 group-hover:text-yellow-300 truncate">
                    {tr('१०८ जप माला', '108 Jaap Mala')}
                  </div>
                  <div className="text-[10px] text-amber-300 truncate">
                    {tr('रुद्राक्ष मनके व ध्वनि', 'Rudraksha Counter')}
                  </div>
                </div>
              </button>
            </div>

            {/* ============================================================== */}
            {/* 2. ALL-IN-ONE APP FACILITIES HUB (SINGLE INSTANCE, INSTANT ACCESS) */}
            {/* ============================================================== */}
            <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-[#160c04] via-[#1a0e04] to-[#0d0904] border-2 border-amber-500/60 shadow-[0_12px_45px_rgba(0,0,0,0.8)] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-800/40 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 mb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('hub_badge')}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-vedic text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-amber-400">
                    {t('hub_title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-200/80 mt-0.5">
                    {t('hub_subtitle')}
                  </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-1 bg-black/50 p-1 rounded-2xl border border-amber-700/40">
                  {[
                    { id: 'all', label: t('hub_filter_all') },
                    { id: 'jyotish', label: t('hub_filter_jyotish') },
                    { id: 'sadhana', label: t('hub_filter_sadhana') },
                    { id: 'gyan', label: t('hub_filter_gyan') },
                    { id: 'puja', label: t('hub_filter_puja') },
                  ].map((flt) => (
                    <button
                      key={flt.id}
                      type="button"
                      onClick={() => setDirectoryFilter(flt.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        directoryFilter === flt.id
                          ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                          : 'text-amber-200/80 hover:text-white'
                      }`}
                    >
                      {flt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instant Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={directorySearchQuery}
                  onChange={(e) => setDirectorySearchQuery(e.target.value)}
                  placeholder={t('hub_search_placeholder')}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/90 border border-amber-700/50 text-xs sm:text-sm text-amber-100 placeholder-amber-400/50 focus:outline-none focus:border-amber-400 transition-colors"
                />
                {directorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDirectorySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-amber-400 hover:text-white cursor-pointer"
                    title={tr('सर्च साफ़ करें', 'Clear search', 'Search saaf karein')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dynamic Grid of App Facilities */}
              {(() => {
                const allDirectoryFeatures = [
                  // 0. Digital Mandir (Virtual Sanatan Shrine)
                  {
                    id: 'mandir',
                    cat: 'sadhana',
                    title: tr('श्री डिजिटल मंदिर (नित्य दर्शन व साधना)', 'Shri Digital Mandir (Virtual Shrine)', 'Shri Digital Mandir (Nitya Darshan)', 'श्री डिजिटल मंदिर (नित्य दर्शन)', 'શ્રી ડિજિટલ મંદિર (નિત્ય દર્શન)'),
                    badge: tr('अखण्ड ज्योति व घंटी', 'Akhand Diya & Bell', 'Akhand Diya & Ghanti'),
                    badgeColor: 'bg-amber-500/20 text-yellow-300 border-amber-400/40',
                    desc: tr(
                      'वार अनुसार अधिष्ठाता देव दर्शन, अखण्ड ज्योति प्रज्वलन, घंटी नाद, पुष्पांजलि व भक्ति स्ट्रीक',
                      'Day-based deity darshan, Akhand Diya, temple brass bell chime, flower shower & Bhakti streak',
                      'Var anusar adhishthata dev darshan, Akhand Diya, Ghanti naad, Pushpanjali aur Bhakti streak'
                    ),
                    icon: Landmark,
                    border: 'border-[#d4af37]/60 hover:border-yellow-300',
                    bg: 'from-amber-950/80 via-[#22140a] to-slate-900',
                    keywords: 'digital mandir temple shrine aarti diya ghanti pushpanjali darshan shiva hanuman durga ganesh streak',
                    action: () => {
                      vedicAudio.playCrispTempleBell(0.85);
                      setActiveTab('mandir');
                    },
                  },
                  // 1. Daily Rashifal
                  {
                    id: 'rashifal',
                    cat: 'jyotish',
                    title: tr('दैनिक राशिफल एवं 12 राशियां', 'Daily Horoscope & 12 Rashis', 'Dainik Rashifal & 12 Rashis', 'दैनिक राशिफल व १२ राशी', 'દૈનિક રાશિફળ અને ૧૨ રાશિ'),
                    badge: tr('गोचर फल व उपाय', 'Gochar Phal & Remedies', 'Gochar Phal & Upay'),
                    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-amber-400/40',
                    desc: tr(
                      'मेष से मीन तक सभी 12 राशियों का आज का सटीक राशिफल, करियर, स्वास्थ्य एवं वैदिक उपाय',
                      "Today's accurate horoscope for all 12 Rashis, career, health & Vedic remedies",
                      "Mesh se Meen tak sabhi 12 rashiyon ka aaj ka sateek rashifal, career aur upay"
                    ),
                    icon: Sun,
                    border: 'border-amber-500/60 hover:border-yellow-300',
                    bg: 'from-amber-950/75 via-[#1e1206] to-slate-900',
                    keywords: 'rashifal horoscope daily 12 rashi mesh vrishabh mithun kark simh kanya tula vrisdhu dhanu makar kumbh meen gochar',
                    action: () => {
                      setActiveTab('home');
                      setTimeout(() => {
                        const el = document.getElementById('daily-rashifal-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    },
                  },
                  // 1. Janam Kundali
                  {
                    id: 'kundali',
                    cat: 'jyotish',
                    title: tr('सम्पूर्ण जन्म कुंडली', 'Complete Birth Kundali', 'Sampoorna Janam Kundali', 'संपूर्ण जन्म कुंडली', 'સંપૂર્ણ જન્મ કુંડળી'),
                    badge: tr('निःशुल्क चार्ट', 'Free Chart', 'Free Chart', 'मोफत चार्ट', 'નિઃશુલ્ક ચાર્ટ'),
                    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
                    desc: tr(
                      'लग्न, नवमांश, चंद्र कुंडली, ग्रह स्पष्ट व विंशोत्तरी महादशा फल',
                      'Lagna, Navamsha, Moon Chart, Planetary Degrees & Vimshottari Mahadasha',
                      'Lagna, Navamsha, Chandra Kundali, Graha Spashta aur Mahadasha Phal'
                    ),
                    icon: Compass,
                    border: 'border-amber-600/50 hover:border-amber-300',
                    bg: 'from-amber-950/70 to-slate-900',
                    keywords: 'janam kundali birth chart lagna navamsha dasha graha',
                    action: () => setActiveTab('janam-kundali'),
                  },
                  // 2. Kundali Milan
                  {
                    id: 'milan',
                    cat: 'jyotish',
                    title: tr('३६ गुण मिलान (वर-कन्या)', '36 Gun Kundali Matching', '36 Gun Milan (Var-Kanya)', '३६ गुण मिलन (वर-वधू)', '૩૬ ગુણ મિલન (વર-કન્યા)'),
                    badge: tr('निःशुल्क मिलान', 'Free Match', 'Free Milan', 'मोफत मिलन', 'નિઃશુલ્ક મિલન'),
                    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
                    desc: tr(
                      'अष्टकूट मिलान, नाड़ी दोष, भकूट दोष व मांगलिक परिहार विचार',
                      'Ashtakoot Matching, Nadi Dosha, Bhakoot Dosha & Manglik Parihar',
                      'Ashtakoot Milan, Nadi Dosha, Bhakoot Dosha aur Manglik Parihar'
                    ),
                    icon: HeartHandshake,
                    border: 'border-rose-500/50 hover:border-rose-300',
                    bg: 'from-rose-950/70 to-slate-900',
                    keywords: 'kundali milan 36 gun ashtakoot vivah nadi dosha bhakoot manglik',
                    action: () => setActiveTab('milan'),
                  },
                  // 3. Monthly Panchang Calendar & Today's Details
                  {
                    id: 'panchang',
                    cat: 'sadhana',
                    title: tr('मासिक पंचांग व आज का विवरण', "Monthly Panchang & Today's Info", 'Masik Panchang & Aaj Ka Vivaran', 'मासिक पंचांग व आजची माहिती', 'માસિક પંચાંગ અને આજની માહિતી'),
                    badge: tr('कैलेंडर व चौघड़िया', 'Calendar & Choghadiya', 'Calendar & Choghadiya'),
                    badgeColor: 'bg-amber-500/20 text-yellow-300 border-amber-400/40',
                    desc: tr(
                      'मासिक हिन्दू कैलेंडर, आज की सम्पूर्ण जानकारी, चौघड़िया व पर्व विधि',
                      "Monthly Hindu Calendar, Today's Complete Details, Choghadiya & Festivals",
                      'Masik Hindu Calendar, Aaj ki sampoorna jankari, Choghadiya aur Parv Vidhi'
                    ),
                    icon: Calendar,
                    border: 'border-amber-500/50 hover:border-yellow-300',
                    bg: 'from-red-950/60 to-slate-900',
                    keywords: 'panchang calendar today tithi nakshatra yog karan rahukaal abhijit muhurat parv festival',
                    action: () => setActiveTab('panchang'),
                  },
                  // 4. Shani Sade Sati
                  {
                    id: 'shani',
                    cat: 'jyotish',
                    title: tr('शनि साढ़े साती व ढैय्या जांच', 'Shani Sade Sati & Dhaiya Check', 'Shani Sade Sati & Dhaiya Check', 'शनि साडेसाती व ढैय्या तपासणी', 'શનિ સાડાસાતી અને ઢૈય્યા તપાસ'),
                    badge: tr('गोचर कैलकुलेटर', 'Transit Calc', 'Gochar Calculator'),
                    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
                    desc: tr(
                      '१२ राशियों का शनि गोचर, उदय-शिखर-अस्त चरण व दशरथ स्तोत्र उपाय',
                      '12-Rashi Saturn Transit, Rising-Peak-Setting Phases & Dashrath Stotra Remedies',
                      '12 Rashiyon ka Shani Gochar, Charan aur Dashrath Stotra Upay'
                    ),
                    icon: Clock,
                    border: 'border-indigo-500/50 hover:border-indigo-300',
                    bg: 'from-indigo-950/70 to-slate-900',
                    keywords: 'shani sade sati dhaiya gochar rashi dashrath stotra upay',
                    action: () => navigateToGyanKosh('shani-sadesati'),
                  },
                  // 5. Shri Ram Shalaka
                  {
                    id: 'shalaka',
                    cat: 'sadhana',
                    title: tr('श्री राम शलाका प्रश्नावली', 'Shri Ram Shalaka Prashnavali', 'Shri Ram Shalaka Prashnavali', 'श्री राम शलाका प्रश्नावली', 'શ્રી રામ શલાકા પ્રશ્નાવલી'),
                    badge: tr('मानस १५x१५ चक्र', '15x15 Grid', '15x15 Chakra'),
                    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
                    desc: tr(
                      'गोस्वामी तुलसीदास कृत रामचरितमानस चौपाई से तुरंत दिव्य मार्गदर्शन',
                      'Instant divine guidance via Goswami Tulsidas Ramcharitmanas Chaupais',
                      'Ramcharitmanas Chaupai se turant divya margdarshan'
                    ),
                    icon: Target,
                    border: 'border-yellow-500/50 hover:border-yellow-300',
                    bg: 'from-amber-950/70 to-slate-900',
                    keywords: 'ram shalaka prashnavali prashna chaupai manas tulsidas ramayan',
                    action: () => navigateToGyanKosh('ram-shalaka'),
                  },
                  // 6. Mantra Jaap Mala
                  {
                    id: 'jaap',
                    cat: 'sadhana',
                    title: tr('१०८ मंत्र जप माला काउंटर', '108 Mantra Jaap Mala Counter', '108 Mantra Jaap Mala Counter', '१०८ मंत्र जप माळ काउंटर', '૧૦૮ મંત્ર જપ માળા કાઉન્ટર'),
                    badge: tr('१०८ मनके व ध्वनि', '108 Beads & Sound', '108 Beads & Sound'),
                    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
                    desc: tr(
                      'रुद्राक्ष/तुलसी माला, शंख व मंदिर घंटी नाद सहित नित्य साधना',
                      'Daily Sadhana with Rudraksha/Tulsi Mala, Shankh & Temple Bell sound',
                      'Rudraksha/Tulsi Mala, Shankh aur Mandir Ghanti naad sahit nitya sadhana'
                    ),
                    icon: Flame,
                    border: 'border-amber-500/50 hover:border-amber-300',
                    bg: 'from-amber-950/70 to-slate-900',
                    keywords: 'mantra jaap mala 108 beads rudraksha tulsi gayatri mahamrityunjaya',
                    action: () => setActiveTab('jaap'),
                  },
                  // 7. Pandit Ji AI Chat
                  {
                    id: 'chat',
                    cat: 'jyotish',
                    title: tr('पण्डित शशांक AI परामर्श', 'Pandit Shashank AI Consultation', 'Pandit Shashank AI Paramarsh', 'पंडित शशांक AI सल्ला', 'પંડિત શશાંક AI માર્ગદર્શન'),
                    badge: tr('२४x७ निःशुल्क चैट', '24x7 Free Chat', '24x7 Free Chat'),
                    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
                    desc: tr(
                      'तार्किक वैदिक समाधान, शंका निवारण, शुभ मुहूर्त व शास्त्रोक्त उपाय',
                      'Balanced Vedic astrology solutions, Muhurat & Shastrokta remedies in your language',
                      'Tarkik Vedic samadhan, shanka nivaran, shubh muhurat aur shastrokta upay'
                    ),
                    icon: MessageCircle,
                    border: 'border-indigo-500/50 hover:border-indigo-300',
                    bg: 'from-indigo-950/70 to-slate-900',
                    keywords: 'pandit shashank sharma ai chat ask question prashna shanka samadhan',
                    action: () => setActiveTab('chat'),
                  },
                  // 8. Puja Samagri Checklist
                  {
                    id: 'samagri',
                    cat: 'sadhana',
                    title: tr('पूजा सामग्री चेकलिस्ट', 'Puja Samagri Checklist', 'Puja Samagri Checklist', 'पूजा साहित्य यादी', 'પૂજા સામગ્રી યાદી'),
                    badge: tr('बाज़ार लिस्ट', 'Shopping List', 'Bazaar List'),
                    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
                    desc: tr(
                      'सत्यनारायण, रुद्राभिषेक, गृह प्रवेश सामग्री टिक-मार्क व WhatsApp शेयर',
                      'Satyanarayan, Rudrabhishek, Griha Pravesh item checklist & WhatsApp share',
                      'Satyanarayan, Rudrabhishek, Griha Pravesh samagri tick-mark aur WhatsApp share'
                    ),
                    icon: ClipboardList,
                    border: 'border-emerald-500/50 hover:border-emerald-300',
                    bg: 'from-emerald-950/70 to-slate-900',
                    keywords: 'puja samagri checklist list dukan kharidari bazaar satyanarayan rudrabhishek griha pravesh',
                    action: () => navigateToGyanKosh('puja-samagri'),
                  },
                  // 9. Aarti & Chalisa
                  {
                    id: 'aarti',
                    cat: 'gyan',
                    title: tr('आरती, चालीसा व स्तोत्र कोष', 'Aarti, Chalisa & Stotram Library', 'Aarti, Chalisa & Stotram Kosh', 'आरती, चालीसा व स्तोत्र कोष', 'આરતી, ચાલીસા અને સ્તોત્ર કોષ'),
                    badge: tr('ऑडियो वाचन सहित', 'With Audio', 'With Audio'),
                    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
                    desc: tr(
                      'हनुमान चालीसा, शिव तांडव, गणेश, लक्ष्मी व दुर्गा आरती संग्रह',
                      'Hanuman Chalisa, Shiv Tandav, Ganesh, Lakshmi & Durga Aarti collection',
                      'Hanuman Chalisa, Shiv Tandav, Ganesh, Lakshmi aur Durga Aarti sangrah'
                    ),
                    icon: BookOpen,
                    border: 'border-yellow-500/50 hover:border-yellow-300',
                    bg: 'from-amber-950/70 to-slate-900',
                    keywords: 'aarti chalisa stotram hanuman chalisa shiv tandav ganesh lakshmi durga audio',
                    action: () => navigateToGyanKosh('aarti-chalisa'),
                  },
                  // 10. Vastu Shastra
                  {
                    id: 'vastu',
                    cat: 'gyan',
                    title: tr('गृह वास्तु शास्त्र एवं नियम', 'Home Vastu Shastra & Rules', 'Griha Vastu Shastra & Niyam', 'गृह वास्तू शास्त्र व नियम', 'ગૃહ વાસ્તુ શાસ્ત્ર અને નિયમો'),
                    badge: tr('बिना तोड़-फोड़ उपाय', 'Easy Remedies', 'Bina Tod-Phod Upay'),
                    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
                    desc: tr(
                      'ईशान कोण, मुख्य द्वार, रसोई व सुख-समृद्धि के १० सरल नियम',
                      'Ishan Kon, Main Door, Kitchen & 10 simple Vastu rules for prosperity',
                      'Ishan Kon, Main Door, Kitchen aur sukh-samriddhi ke 10 saral Vastu niyam'
                    ),
                    icon: Compass,
                    border: 'border-emerald-500/50 hover:border-emerald-300',
                    bg: 'from-emerald-950/70 to-slate-900',
                    keywords: 'vastu shastra disha niyam ishan kon bedroom kitchen main door',
                    action: () => navigateToGyanKosh('vastu'),
                  },
                  // 11. Navratna & Rudraksha
                  {
                    id: 'ratna',
                    cat: 'gyan',
                    title: tr('नवरत्न व रुद्राक्ष विज्ञान', 'Navratna & Rudraksha Guide', 'Navratna & Rudraksha Vigyan', 'नवरत्न व रुद्राक्ष विज्ञान', 'નવરત્ન અને રુદ્રાક્ષ વિજ્ઞાન'),
                    badge: tr('रत्न व रुद्राक्ष', 'Gems & Beads', 'Ratna & Rudraksha'),
                    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
                    desc: tr(
                      'राशि अनुसार रत्न, धातु, उंगली व १ से १४ मुखी रुद्राक्ष धारण विधि',
                      'Rashi gemstones, metal, finger & 1-to-14 Mukhi Rudraksha wearing rules',
                      'Rashi anusar Ratna, dhatu, ungli aur 1 se 14 Mukhi Rudraksha dharan vidhi'
                    ),
                    icon: Star,
                    border: 'border-purple-500/50 hover:border-purple-300',
                    bg: 'from-purple-950/70 to-slate-900',
                    keywords: 'navratna gemstones rudraksha mukhi panna manik pukhraj moti neelam heera',
                    action: () => navigateToGyanKosh('ratna-rudraksha'),
                  },
                  // 12. Swarodaya Vigyan
                  {
                    id: 'swar',
                    cat: 'gyan',
                    title: tr('स्वरोदय विज्ञान (स्वर शास्त्र)', 'Swarodaya Breath Science', 'Swarodaya Vigyan (Swar Shastra)', 'स्वरोदय विज्ञान (स्वर शास्त्र)', 'સ્વરોદય વિજ્ઞાન (સ્વર શાસ્ત્ર)'),
                    badge: tr('सूर्य-चंद्र स्वर', 'Surya-Chandra', 'Surya-Chandra Swar'),
                    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
                    desc: tr(
                      'सूर्य व चंद्र स्वर पहचान, कार्य सिद्धि व प्रातः कदम रखने का नियम',
                      'Identify Surya/Chandra nostril breath for success & morning step rules',
                      'Surya aur Chandra swar pehchan, karya siddhi aur pratah kadam rakhne ka niyam'
                    ),
                    icon: Wind,
                    border: 'border-sky-500/50 hover:border-sky-300',
                    bg: 'from-sky-950/70 to-slate-900',
                    keywords: 'swarodaya swar vigyan surya swar chandra swar ida pingala karya siddhi',
                    action: () => navigateToGyanKosh('swarodaya'),
                  },
                  // 13. Swapna Phal & Shakun
                  {
                    id: 'swapna',
                    cat: 'gyan',
                    title: tr('स्वप्न फल व अंग लक्षण', 'Dream Meanings & Shakun Shastra', 'Swapna Phal & Anga Lakshan', 'स्वप्न फळ व शकुन शास्त्र', 'સ્વપ્ન ફળ અને શકુન શાસ્ત્ર'),
                    badge: tr('शकुन शास्त्र', 'Shakun Guide', 'Shakun Shastra'),
                    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
                    desc: tr(
                      'शुभ-अशुभ सपनों का अर्थ व आंख/अंग फड़कने का शास्त्रोक्त फल',
                      'Auspicious/inauspicious dream meanings & eye/body twitching signs',
                      'Shubh-ashubh sapno ka arth aur aankh/anga phadakne ka shastrokta phal'
                    ),
                    icon: Moon,
                    border: 'border-blue-500/50 hover:border-blue-300',
                    bg: 'from-blue-950/70 to-slate-900',
                    keywords: 'swapna phal dreams shakun anga sphuran sanket sapne ka matlab',
                    action: () => navigateToGyanKosh('swapna-shakun'),
                  },
                  // 14. YouTube Video Library
                  {
                    id: 'youtube',
                    cat: 'puja',
                    title: tr('यूट्यूब वीडियो व कथा सत्संग', 'YouTube Videos & Katha Satsang', 'YouTube Videos & Katha Satsang', 'यूट्यूब व्हिडिओ व कथा सत्संग', 'યુટ્યુબ વિડિયો અને કથા સત્સંગ'),
                    badge: tr('वीडियो लाइब्रेरी', 'Video Library', 'Video Library'),
                    badgeColor: 'bg-red-500/20 text-red-300 border-red-400/40',
                    desc: tr(
                      'पण्डित जी के प्रामाणिक कथा, आरती व वैदिक पूजन वीडियो संग्रह',
                      'Authentic Katha, Aarti & Vedic Puja videos by Pandit Shashank Sharma',
                      'Pandit Ji ke pramanik Katha, Aarti aur Vedic Pujan video sangrah'
                    ),
                    icon: Youtube,
                    border: 'border-red-500/50 hover:border-red-300',
                    bg: 'from-red-950/70 to-slate-900',
                    keywords: 'youtube videos satsang katha pravachan puja vidhi shashank sharma',
                    action: () => setActiveTab('youtube'),
                  },
                  // 15. User Account & History Hub
                  {
                    id: 'history',
                    cat: 'puja',
                    title: tr('मेरा खाता एवं सुरक्षित हिस्ट्री', 'My Account & Saved History', 'Mera Khata & Saved History', 'माझे खाते व सुरक्षित हिस्ट्री', 'મારું ખાતું અને સુરક્ષિત હિસ્ટ્રી'),
                    badge: tr('निजी रिकॉर्ड', 'Saved Records', 'Saved Records'),
                    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
                    desc: tr(
                      'आपके मंत्र जप रिकॉर्ड, सहेजी गई जन्म कुंडलियां व मिलान इतिहास',
                      'Your synced Mantra Jaap records, saved Birth Kundalis & Match history',
                      'Aapke Mantra Jaap records, saved Janam Kundaliyan aur Milan history'
                    ),
                    icon: History,
                    border: 'border-emerald-500/50 hover:border-emerald-300',
                    bg: 'from-emerald-950/70 to-slate-900',
                    keywords: 'user history account profile jaap stats kundali records khata',
                    action: () => handleSetActiveTab('history'),
                  },
                  // 16. Puja & Anushthan Booking Option (No payment shown on Home)
                  {
                    id: 'services',
                    cat: 'puja',
                    title: tr('वैदिक पूजा एवं अनुष्ठान बुकिंग', 'Vedic Puja & Anushthan Booking', 'Vedic Puja & Anushthan Booking', 'वैदिक पूजा व अनुष्ठान बुकिंग', 'વૈદિક પૂજા અને અનુષ્ઠાન બુકિંગ'),
                    badge: tr('वैदिक कर्मकाण्ड', 'Vedic Rituals', 'Vedic Karmakand'),
                    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
                    desc: tr(
                      'गृह प्रवेश, सत्यनारायण कथा, महा रुद्राभिषेक व शांति हवन बुकिंग विकल्प',
                      'Griha Pravesh, Satyanarayan Katha, Maha Rudrabhishek & Shanti Havan booking',
                      'Griha Pravesh, Satyanarayan Katha, Maha Rudrabhishek aur Havan booking'
                    ),
                    icon: Tag,
                    border: 'border-yellow-500/50 hover:border-yellow-300',
                    bg: 'from-yellow-950/60 to-slate-900',
                    keywords: 'puja services booking griha pravesh satyanarayan katha rudrabhishek havan anushthan',
                    action: () => setActiveTab('services'),
                  },
                ];

                const query = directorySearchQuery.trim().toLowerCase();
                const filtered = allDirectoryFeatures.filter((item) => {
                  const matchCat = directoryFilter === 'all' || item.cat === directoryFilter;
                  if (!matchCat) return false;
                  if (!query) return true;
                  return (
                    item.title.toLowerCase().includes(query) ||
                    item.desc.toLowerCase().includes(query) ||
                    item.badge.toLowerCase().includes(query) ||
                    item.keywords.toLowerCase().includes(query)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center rounded-2xl bg-black/40 border border-amber-800/40 space-y-3">
                      <p className="text-amber-200/80 text-sm">
                        "{directorySearchQuery}" — {t('hub_no_result')}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setDirectorySearchQuery('');
                          setDirectoryFilter('all');
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400 transition-colors"
                      >
                        {t('hub_reset_btn')}
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    {filtered.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={item.action}
                          className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-b ${item.bg} border ${item.border} text-left transition-all hover:scale-[1.02] cursor-pointer shadow-md group flex flex-col justify-between`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <div className="p-2 rounded-xl bg-black/40 text-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                                <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                              >
                                {item.badge}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold font-vedic text-amber-100 group-hover:text-yellow-300 leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-amber-200/70 mt-1 line-clamp-2 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>

                          <span className="text-[10px] font-bold text-amber-400 group-hover:text-yellow-300 flex items-center gap-1 pt-2 mt-2 border-t border-amber-900/30">
                            <span>{t('hub_open_feature')}</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* ============================================================== */}
            {/* PANDIT SHASHANK SHARMA INFORMATION & FOUNDER PROFILE CARD */}
            {/* (Placed directly at the end of 'ऐप की सम्पूर्ण सुविधाएं' as requested) */}
            {/* ============================================================== */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1006] via-[#241508] to-[#0c1220] border-2 border-amber-500/70 p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.85)]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Sacred Shloka Inscription Top Strip */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/40 pb-3 mb-4 text-[11px] sm:text-xs">
                <div className="text-amber-300 font-vedic font-bold flex items-center gap-1.5 tracking-wider">
                  <span>
                    {tr(
                      '॥ श्री गणेशाय नमः • ॐ नमः शिवाय • ॐ नमो भगवते वासुदेवाय नमः ॥',
                      '॥ Shri Ganeshaya Namah • Om Namah Shivaya • Om Namo Bhagavate Vasudevaya ॥'
                    )}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{tr('१००% शास्त्रसम्मत वैदिक संस्थान', '100% Authentic Vedic Foundation')}</span>
                </div>
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
                {/* Portrait & Core Credentials */}
                <div className="flex flex-col items-center text-center flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 blur-md opacity-75 animate-pulse" />
                    <div className="relative">
                      <PanditPortrait size="xl" showBadge={true} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-[11px] font-extrabold text-amber-400 tracking-wider uppercase block">
                      {t('acharya_role')}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-vedic text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-400">
                      {t('acharya_name')}
                    </h3>
                    <p className="text-xs text-amber-200/80 mt-0.5">{t('acharya_title')}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-200/90 bg-amber-950/80 px-3 py-0.5 rounded-full mt-1.5 border border-amber-700/50 shadow-xs">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{tr('रुद्रपुर (उधम सिंह नगर, उत्तराखण्ड)', 'Rudrapur (Udham Singh Nagar, UK)')}</span>
                    </span>
                  </div>
                </div>

                {/* Hero Value Proposition & Badges */}
                <div className="flex-1 min-w-0 text-center lg:text-left space-y-3.5">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md">
                      {tr('१५+ वर्ष प्रामाणिक अनुभव', '15+ Years Authentic Vedic Experience')}
                    </span>
                    {/* Note: '५१,०००+ संतुष्ट यजमान परिवार' removed as requested by user */}
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-vedic text-amber-100 leading-tight">
                    {tr(
                      'रुद्रपुर में घर पर वैदिक पूजा एवं फोन पर सटीक ज्योतिषीय समाधान',
                      'Authentic Vedic Puja at Home in Rudrapur & Accurate Astrology'
                    )}
                  </h2>

                  <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed max-w-2xl">
                    {tr(
                      'गृह प्रवेश, वास्तु शांति, श्री सत्यनारायण कथा, महा रुद्राभिषेक, नवग्रह शांति एवं फोन/वीडियो कॉल पर 1-on-1 व्यक्तिगत जन्मपत्री विश्लेषण व अचूक सात्विक वैदिक उपाय।',
                      'Griha Pravesh, Vastu Shanti, Satyanarayan Katha, Maha Rudrabhishek and 1-on-1 personal horoscope consultation with effective Vedic remedies.'
                    )}
                  </p>

                  {/* 4 Trust Feature Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs text-amber-200">
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-black/40 border border-amber-900/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-[11px] font-medium truncate">{tr('शास्त्रोक्त कर्मकाण्ड', 'Shastrokt Rituals')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-black/40 border border-amber-900/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-[11px] font-medium truncate">{tr('सटीक जन्म कुंडली', 'Accurate Kundali')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-black/40 border border-amber-900/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-[11px] font-medium truncate">{tr('१००% सात्विक उपाय', 'Satvik Remedies')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-black/40 border border-amber-900/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-[11px] font-medium truncate">{tr('गोपनीय परामर्श', 'Confidential')}</span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('services');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-md border border-yellow-200 transition-all cursor-pointer flex items-center gap-2 group"
                    >
                      <CalendarCheck className="w-4 h-4 text-slate-950" />
                      <span>{tr('पूजा व परामर्श बुक करें', 'Book Vedic Puja & Consultation')}</span>
                      <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <a
                      href={`tel:+91${BRAND_CONFIG.phone}`}
                      className="px-4 py-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 font-bold text-xs sm:text-sm border border-emerald-500/50 transition-all flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>+91 {BRAND_CONFIG.phone}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 3. DAILY 12-RASHI HOROSCOPE & MORNING SHLOKA (SINGLE SECTION) */}
            {/* ============================================================== */}
            <div id="daily-rashifal-section" className="scroll-mt-24">
              <DailyRashifalWidget
                onAskPanditInChat={(promptText) => {
                  setChatInitialPrompt(promptText);
                  setActiveTab('chat');
                }}
                onOpenMantraJaap={() => setActiveTab('jaap')}
                currentUser={currentUser}
              />
            </div>

            {/* ============================================================== */}
            {/* 4. SPIRITUAL AUDIO / TANPURA PLAYER (SINGLE SECTION) */}
            {/* ============================================================== */}
            <div id="tanpura-player-section" className="scroll-mt-24">
              <SpiritualAudioPlayer
                isGlobalPlaying={isAudioPlaying}
                onToggleGlobal={toggleAudio}
                onOpenMantraJaap={() => setActiveTab('jaap')}
              />
            </div>

            {/* ============================================================== */}
            {/* 5. VERIFIED YAJMAN REVIEWS & TESTIMONIALS (COMMUNITY TRUST) */}
            {/* ============================================================== */}
            <YajmanTestimonials />

            {/* ============================================================== */}
            {/* 6. RUDRAPUR LOCALITY & HOME PUJA CONTACT BANNER */}
            {/* ============================================================== */}
            <RudrapurLocalBanner
              onOpenBooking={() => {
                const offerService = PUJA_SERVICES.find((s) => s.id === 'kundali-paramarsh') || null;
                setSelectedServiceForBooking(offerService);
                setIsBookingModalOpen(true);
              }}
            />

            <VisitorCounterBanner />
          </div>
        )}

        {/* ==================== TAB: DIGITAL MANDIR (VIRTUAL SANATAN SHRINE) ==================== */}
        {activeTab === 'mandir' && (
          <DigitalMandirSection
            onOpenGyanKoshCategory={navigateToGyanKosh}
            onOpenJaapMala={() => setActiveTab('jaap')}
            currentUser={currentUser}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {/* ==================== TAB: VEDIC DHARM & GYAN KOSH ==================== */}
        {activeTab === 'gyan-kosh' && (
          <DharmGyanKoshSection
            initialCategory={gyanKoshCategory}
            onAskPanditInChat={(promptText) => {
              setChatInitialPrompt(promptText);
              setActiveTab('chat');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenBookingModal={() => {
              setSelectedServiceForBooking(null);
              setIsBookingModalOpen(true);
            }}
          />
        )}

        {/* ==================== TAB: MONTHLY HINDU PANCHANG CALENDAR ==================== */}
        {activeTab === 'panchang' && (
          <HinduPanchangCalendar
            onOpenBookingWithDate={() => {
              setSelectedServiceForBooking(null);
              setIsBookingModalOpen(true);
            }}
            onAskPanditInChat={(promptText) => {
              setChatInitialPrompt(promptText);
              setActiveTab('chat');
            }}
            onOpenMantraJaap={() => setActiveTab('jaap')}
          />
        )}

        {/* ==================== TAB: MANTRA JAAP MALA COUNTER ==================== */}
        {activeTab === 'jaap' && (
          <MantraJaapSection
            isGlobalPlaying={isAudioPlaying}
            onToggleGlobalAudio={toggleAudio}
            currentUser={currentUser}
            onSyncJaapData={handleSyncJaapData}
          />
        )}

        {/* ==================== TAB: SAMPURN JANAM KUNDALI ==================== */}
        {activeTab === 'janam-kundali' && (
          <SampurnKundaliSection
            currentUser={currentUser}
            onSaveJanamKundaliHistoryItem={handleSaveJanamKundaliHistoryItem}
            onDeleteJanamKundaliHistoryItem={handleDeleteJanamKundaliHistoryItem}
            onClearAllJanamKundaliHistory={handleClearAllJanamKundaliHistory}
            onConsultPanditJi={(promptText) => {
              setChatInitialPrompt(promptText);
              setActiveTab('chat');
            }}
            onOpenBookingModal={() => {
              const consultService = PUJA_SERVICES.find((s) => s.id === 'kundali-paramarsh') || null;
              setSelectedServiceForBooking(consultService);
              setIsBookingModalOpen(true);
            }}
            onOpenMantraJaap={() => setActiveTab('jaap')}
          />
        )}

        {/* ==================== TAB: KUNDALI MILAN (36 GUN MILAN) ==================== */}
        {activeTab === 'milan' && (
          <KundaliMilanSection
            onConsultPanditJi={(consultDetails) => {
              setChatInitialPrompt(
                `पण्डित जी, मैंने कुंडली मिलान किया है: ${consultDetails}। कृपया इस मिलान पर अपना शास्त्रोक्त विचार व समाधान बताएं।`
              );
              setActiveTab('chat');
            }}
            currentUser={currentUser}
            onSaveKundaliHistoryItem={handleSaveKundaliHistoryItem}
          />
        )}

        {/* ==================== TAB 2: SERVICES & BOOKING ==================== */}
        {activeTab === 'services' && (
          <ServicesSection
            onSelectServiceToBook={openBookingForService}
            onAskAboutService={askPanditInChat}
            onOpenCustomBooking={() => {
              setSelectedServiceForBooking(null);
              setIsBookingModalOpen(true);
            }}
          />
        )}

        {/* ==================== TAB 3: SHASHANK SHARMA AI CHAT ==================== */}
        {activeTab === 'chat' && (
          <div className="w-full">
            <ShashankSharmaChat
              initialPrompt={chatInitialPrompt}
              onNavigateToTab={setActiveTab}
              onOpenBookingWithService={(s) => {
                const found = PUJA_SERVICES.find((srv) =>
                  srv.name.toLowerCase().includes(s.toLowerCase()) ||
                  srv.hindiName.includes(s)
                );
                if (found) setSelectedServiceForBooking(found);
                setIsBookingModalOpen(true);
              }}
              currentUser={currentUser}
              onUpdateChatMessages={handleUpdateChatMessages}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          </div>
        )}

        {/* ==================== TAB: MOBILE LOGIN & FULL HISTORY HUB ==================== */}
        {activeTab === 'history' && (
          <UserHistoryHub
            currentUser={currentUser}
            allBookings={recentBookings}
            onLoginSuccess={handleLoginSuccess}
            onUpdateAccount={handleUpdateUserAccount}
            onLogout={handleLogout}
            onNavigateToTab={setActiveTab}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onDeleteBookingById={handleDeleteBookingById}
            onDeleteAllUserBookings={handleDeleteAllUserBookings}
          />
        )}

        {/* ==================== TAB 4: YOUTUBE FEED ==================== */}
        {activeTab === 'youtube' && <YouTubeFeed />}
      </main>

      {/* Floating Chat Drawer (available when outside the chat tab) */}
      {activeTab !== 'chat' && (
        <FloatingChatDrawer
          onNavigateToTab={setActiveTab}
          onOpenBookingWithService={(s) => {
            const found = PUJA_SERVICES.find((srv) =>
              srv.name.toLowerCase().includes(s.toLowerCase()) ||
              srv.hindiName.includes(s)
            );
            if (found) setSelectedServiceForBooking(found);
            setIsBookingModalOpen(true);
          }}
          currentUser={currentUser}
          onUpdateChatMessages={handleUpdateChatMessages}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />
      )}

      {/* Global Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preSelectedService={selectedServiceForBooking}
        onBookingSuccess={handleBookingSuccess}
        currentUser={currentUser}
      />

      {/* Mobile Number Login Modal */}
      <MobileLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onUpdateAccount={handleUpdateUserAccount}
        onLogout={handleLogout}
        onOpenFullHistoryHub={() => setActiveTab('history')}
        userBookingsCount={
          currentUser
            ? recentBookings.filter(
                (b) =>
                  (b.phone || '').replace(/\D/g, '').slice(-10) ===
                  currentUser.phone.replace(/\D/g, '').slice(-10)
              ).length
            : 0
        }
        onDeleteAllUserBookings={handleDeleteAllUserBookings}
      />

      {/* Smart Daily Notification & Panchang Alert Modal */}
      <SmartNotificationManager
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Vedic Footer */}
      <footer className="mt-12 bg-[#080c14] border-t border-amber-900/40 pt-8 pb-24 md:pb-16 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <PanditPortrait size="sm" showBadge={false} />
            <div>
              <div className="font-bold font-vedic text-sm text-amber-200">
                {t('brand_name')}
              </div>
              <p className="text-[11px] text-slate-400">
                {t('footer_founder')} {t('acharya_name')} · {t('brand_location')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <a
              href={BRAND_CONFIG.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-red-400 hover:text-red-300"
            >
              <Youtube className="w-4 h-4 fill-current" />
              <span>{BRAND_CONFIG.youtubeHandle}</span>
            </a>
            <span className="text-slate-600">·</span>
            <a href={`tel:+91${BRAND_CONFIG.phone}`} className="text-amber-400 hover:underline tabular-nums">
              {t('footer_helpline')} {BRAND_CONFIG.displayPhone}
            </a>
            <span className="text-slate-600">·</span>
            <span>{t('footer_services')}</span>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <FooterVisitorBadge />
            <div className="text-[11px] text-slate-500 text-center md:text-right">
              © {new Date().getFullYear()} {t('brand_name')} · {t('footer_rights')}
            </div>
          </div>
        </div>
      </footer>

      {/* Thumb-Friendly Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        currentUser={currentUser}
      />
    </div>
  );
}
