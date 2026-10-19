/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PanditPortrait } from './components/PanditPortrait';
import { PanchangWidget } from './components/PanchangWidget';
import { TodayFestivalWidget } from './components/TodayFestivalWidget';
import { RudrapurLocalBanner } from './components/RudrapurLocalBanner';
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
import { UserHistoryHub } from './components/UserHistoryHub';
import {
  PujaService,
  BookingRequest,
  UserMobileAccount,
  ChatMessage,
  JaapHistoryEntry,
  KundaliMilanHistoryItem,
  JanamKundaliHistoryItem,
} from './types';
import { PUJA_SERVICES, SPIRITUAL_TRACKS } from './data/mockData';
import { BRAND_CONFIG } from './config/brand';
import { vedicAudio } from './utils/audioSynthesizer';
import {
  getActiveMobilePhone,
  getLocalUserByPhone,
  loginOrSyncMobileUser,
  persistUserAccountUpdate,
  setActiveMobilePhone,
} from './utils/userAccountStorage';
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
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<PujaService | null>(null);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  const [recentBookings, setRecentBookings] = useState<BookingRequest[]>([]);

  // Logged-in Mobile Account State
  const [currentUser, setCurrentUser] = useState<UserMobileAccount | null>(() => {
    const activePhone = getActiveMobilePhone();
    if (activePhone) {
      return getLocalUserByPhone(activePhone);
    }
    return null;
  });

  // Sync active mobile user from server on startup (using saved password)
  useEffect(() => {
    const activePhone = getActiveMobilePhone();
    if (activePhone) {
      const localUser = getLocalUserByPhone(activePhone);
      if (localUser) {
        loginOrSyncMobileUser(activePhone, localUser.name, localUser.password)
          .then((synced) => setCurrentUser(synced))
          .catch(() => {});
      }
    }
  }, []);

  // Load Bookings strictly for the logged-in user's phone number (100% private)
  useEffect(() => {
    if (!currentUser?.phone) {
      setRecentBookings([]);
      return;
    }

    const cleanPhone = currentUser.phone.replace(/\D/g, '').slice(-10);
    try {
      const savedBookings = localStorage.getItem('panditji_online_bookings');
      if (savedBookings) {
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
    setCurrentUser(account);
  };

  const handleLogout = () => {
    setActiveMobilePhone(null);
    setCurrentUser(null);
  };

  const handleUpdateUserAccount = (updated: UserMobileAccount) => {
    setCurrentUser(updated);
    persistUserAccountUpdate(updated);
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0b0f19] text-amber-50 flex flex-col font-sans selection:bg-amber-600/30 selection:text-amber-200">
      {/* Universal Vedic Header with Direct WhatsApp Booking & Mobile Login */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAudioPlaying={isAudioPlaying}
        toggleAudio={toggleAudio}
        onOpenBooking={() => {
          setSelectedServiceForBooking(null);
          setIsBookingModalOpen(true);
        }}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full overflow-x-hidden mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* ==================== TAB 1: HOME ==================== */}
        {activeTab === 'home' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Special 50% OFF & ₹100 Personal Consultation Announcement Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-amber-950 to-emerald-950 border-2 border-amber-500/60 p-4 sm:p-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left min-w-0 w-full">
                  <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 font-extrabold shadow-lg flex-shrink-0">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black uppercase tracking-wider">
                        शुभ मुहूर्त महा-छूट
                      </span>
                      <span className="text-xs text-amber-300 font-bold">
                        सीमित समय हेतु विशेष दक्षिणा
                      </span>
                    </div>
                    <h3 className="text-base sm:text-xl font-bold font-vedic text-amber-100 mt-1.5 leading-snug">
                      सभी पूजा व हवन अनुष्ठानों पर{' '}
                      <span className="text-yellow-400 underline decoration-amber-500">
                        50% की विशेष छूट
                      </span>
                      !
                    </h3>
                    <div className="text-xs sm:text-sm text-amber-200/90 font-medium mt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                      <span>व्यक्तिगत ज्योतिष एवं कुंडली परामर्श:</span>
                      <span className="line-through text-slate-400 font-mono">₹1,000</span>
                      <span>नहीं,</span>
                      <span className="font-extrabold text-emerald-300 text-sm sm:text-base font-mono bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-500/50 whitespace-nowrap">
                        मात्र ₹100 (90% छूट)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center w-full sm:w-auto flex-shrink-0">
                  <button
                    onClick={() => {
                      const personalConsult = PUJA_SERVICES.find((s) => s.id === 'kundali-paramarsh');
                      if (personalConsult) openBookingForService(personalConsult);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl hover:from-yellow-400 hover:to-amber-400 transition-all cursor-pointer whitespace-nowrap"
                  >
                    परामर्श बुक करें (मात्र ₹100)
                  </button>
                </div>
              </div>
            </div>

            {/* ==================== TODAY'S FESTIVAL / TYOHAR WIDGET ==================== */}
            <TodayFestivalWidget
              onOpenBookingWithService={openBookingForService}
              onOpenMantraJaap={() => setActiveTab('jaap')}
              onAskPanditInChat={askPanditInChat}
            />

            {/* Hero Section: Pandit Shashank Sharma Identity & Vedic Vision */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b1008] via-[#121929] to-[#0c1220] border border-amber-600/40 p-4 sm:p-8 lg:p-10 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 lg:gap-12">
                {/* Pandit Portrait with Instant Photo Upload/Change */}
                <div className="flex flex-col items-center text-center flex-shrink-0">
                  <PanditPortrait size="xl" showBadge={true} allowUpload={true} />
                  <div className="mt-3">
                    <span className="text-xs font-bold text-amber-400 tracking-wider uppercase block">
                      संस्थापक एवं मुख्य आचार्य
                    </span>
                    <h3 className="text-xl font-bold font-vedic text-gold-gradient py-0.5">
                      पण्डित शशांक शर्मा
                    </h3>
                    <p className="text-xs text-amber-300/80">वैदिक पुरोहित एवं ज्योतिषाचार्य</p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-200/80 bg-amber-950/60 px-2.5 py-0.5 rounded-full mt-1 border border-amber-800/40">
                      <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" /> रुद्रपुर, उत्तराखण्ड • 7017279043
                    </span>
                  </div>
                </div>

                {/* Hero Description & Call to Actions */}
                <div className="flex-1 min-w-0 text-center md:text-left space-y-4">
                  <div className="inline-flex flex-wrap items-center justify-center md:justify-start gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                    <span>पण्डित जी ऑनलाइन • 50% छूट एवं ₹100 व्यक्तिगत परामर्श</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-vedic text-amber-100 tracking-tight leading-tight">
                    शास्त्रसम्मत पूजा, हवन एवं{' '}
                    <span className="text-gold-gradient">संतुलित ज्योतिष दर्शन</span>
                  </h1>

                  <p className="text-xs sm:text-base text-amber-200/85 leading-relaxed max-w-2xl">
                    "अंधविश्वास या भय नहीं, कर्म एवं विवेक ही सच्चा धर्म है।" पण्डित शशांक शर्मा जी के मार्गदर्शन में
                    रुद्रपुर (उत्तराखंड) में आपके घर पर विधिपूर्वक गृह प्रवेश, सत्यनारायण कथा, महा रुद्राभिषेक,
                    एवं प्रत्यक्ष व्यक्तिगत ज्योतिष परामर्श।
                  </p>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3">
                    <button
                      onClick={() => {
                        setSelectedServiceForBooking(null);
                        setIsBookingModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-base shadow-xl shadow-amber-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <Sparkles className="w-4 h-4 flex-shrink-0" />
                      <span>पूजा / परामर्श बुक करें</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('jaap')}
                      className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-900/80 via-amber-800/80 to-amber-900/80 hover:bg-amber-800 border border-amber-400/60 text-amber-100 hover:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg"
                    >
                      <Flame className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span>108 मंत्र जप माला</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('janam-kundali')}
                      className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-950 via-indigo-950 to-amber-950 hover:bg-amber-900/70 border border-amber-400/60 text-amber-100 hover:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg"
                    >
                      <Compass className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>सम्पूर्ण जन्म कुंडली</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('milan')}
                      className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-rose-950 via-amber-950 to-rose-950 hover:bg-amber-900/60 border border-amber-500/50 text-amber-200 hover:text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                    >
                      <HeartHandshake className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>36 गुण मिलान</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('chat')}
                      className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-200 hover:text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>शशांक शर्मा AI से पूछें</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('history')}
                      className="flex items-center gap-2 px-4 py-3 sm:py-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                    >
                      <History className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>मेरी हिस्ट्री एवं खाता</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick 6-Feature Visual Access Grid for easy understanding */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base font-bold font-vedic text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>पण्डित जी ऑनलाइन — मुख्य सेवाएं एवं सुविधाएं (1-क्लिक एक्सेस)</span>
                </span>
                <span className="text-[11px] text-amber-400/80 hidden sm:inline">सरल एवं सुगम</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('janam-kundali')}
                  className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-950/60 to-slate-900 border border-amber-600/40 hover:border-amber-400 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-md group flex flex-col justify-between"
                >
                  <div className="p-2.5 w-fit rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="mt-2.5">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-yellow-300">
                      सम्पूर्ण जन्म कुंडली
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      लग्न, विंशोत्तरी दशा व उपाय
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('milan')}
                  className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-rose-950/50 to-slate-900 border border-rose-500/40 hover:border-rose-400 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-md group flex flex-col justify-between"
                >
                  <div className="p-2.5 w-fit rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 group-hover:bg-rose-500 group-hover:text-slate-950 transition-colors">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div className="mt-2.5">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-yellow-300">
                      36 गुण मिलान
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      वर-कन्या अष्टकूट व मंगल
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('jaap')}
                  className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-950/60 to-slate-900 border border-amber-500/40 hover:border-amber-400 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-md group flex flex-col justify-between"
                >
                  <div className="p-2.5 w-fit rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="mt-2.5">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-yellow-300">
                      108 मंत्र जप माला
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      घंटी व शंख ध्वनि सहित
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-md group flex flex-col justify-between"
                >
                  <div className="p-2.5 w-fit rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="mt-2.5">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-yellow-300">
                      पण्डित शशांक AI
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      24x7 ज्योतिष मार्गदर्शन
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedServiceForBooking(null);
                    setIsBookingModalOpen(true);
                  }}
                  className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-yellow-950/60 to-slate-900 border border-yellow-500/40 hover:border-yellow-400 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-md group flex flex-col justify-between"
                >
                  <div className="p-2.5 w-fit rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 group-hover:bg-yellow-500 group-hover:text-slate-950 transition-colors">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div className="mt-2.5">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-yellow-300">
                      पूजा व ₹100 परामर्श
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      50% छूट एवं WhatsApp
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('youtube')}
                  className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-red-950/50 to-slate-900 border border-red-500/40 hover:border-red-400 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-md group flex flex-col justify-between"
                >
                  <div className="p-2.5 w-fit rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <Youtube className="w-5 h-5 fill-current" />
                  </div>
                  <div className="mt-2.5">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-100 group-hover:text-red-300">
                      यूट्यूब वीडियो
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      कथा, आरती एवं भजन
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Rudrapur Local Banner */}
            <RudrapurLocalBanner onOpenBooking={() => setIsBookingModalOpen(true)} />

            {/* Daily Panchang & Shubh Muhurat Widget */}
            <PanchangWidget />

            {/* Spiritual Audio / Tanpura Player */}
            <SpiritualAudioPlayer
              isGlobalPlaying={isAudioPlaying}
              onToggleGlobal={toggleAudio}
              onOpenMantraJaap={() => setActiveTab('jaap')}
            />

            {/* Featured Services Preview Section with 50% discount and ₹100 consultation */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/30 pb-3">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold font-vedic text-amber-100">
                    प्रमुख वैदिक सेवाएं (रुद्रपुर एवं ऑनलाइन • 50% छूट)
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    प्रत्येक अनुष्ठान के शुभ लाभ व शास्त्रसम्मत सावधानियों सहित
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('services')}
                  className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0 cursor-pointer"
                >
                  <span>सभी सेवाएं देखें (50% Off)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Personal Consultation Highlight (₹100 only!) */}
                {(() => {
                  const consultService = PUJA_SERVICES.find((s) => s.id === 'kundali-paramarsh');
                  if (!consultService) return null;
                  return (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-950/60 to-[#0e1526] border-2 border-amber-500 flex flex-col justify-between transition-all shadow-xl shadow-amber-950/40 min-w-0">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black uppercase tracking-wider">
                            90% महा-छूट • One-on-One
                          </span>
                        </div>
                        <h4 className="text-base font-bold font-vedic text-amber-100 mb-2 leading-snug">
                          {consultService.hindiName}
                        </h4>

                        {/* Clear Dakshina / Payment Box */}
                        <div className="mb-3 p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/40 flex items-center justify-between gap-2">
                          <span className="text-xs text-amber-200 font-semibold">निर्धारित शुल्क:</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-slate-400 line-through font-mono">
                              {consultService.originalDakshina}
                            </span>
                            <span className="text-base sm:text-lg font-black text-emerald-400 font-mono whitespace-nowrap">
                              मात्र {consultService.baseDakshina}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-amber-200/80 line-clamp-2 mb-3">
                          {consultService.tagline}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                        <button
                          onClick={() => openBookingForService(consultService)}
                          className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs transition-colors shadow-md cursor-pointer"
                        >
                          बुक करें (मात्र ₹100)
                        </button>
                        <button
                          onClick={() => askPanditInChat(consultService.name)}
                          className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs transition-colors cursor-pointer"
                          title="पण्डित जी से इसके बारे में पूछें"
                        >
                          परामर्श लें
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* 2 & 3: Other Services with 50% discount */}
                {PUJA_SERVICES.filter((s) => s.id !== 'kundali-paramarsh')
                  .slice(0, 2)
                  .map((service) => (
                    <div
                      key={service.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#0e1526] border border-amber-900/40 hover:border-amber-500/50 flex flex-col justify-between transition-all min-w-0"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            50% विशेष छूट
                          </span>
                        </div>
                        <h4 className="text-base font-bold font-vedic text-amber-100 mb-2 leading-snug">
                          {service.hindiName}
                        </h4>

                        {/* Clear Dakshina / Payment Box */}
                        <div className="mb-3 p-2.5 rounded-xl bg-slate-950/80 border border-amber-800/40 flex items-center justify-between gap-2">
                          <span className="text-xs text-amber-200/90 font-semibold">विशेष दक्षिणा:</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-slate-400 line-through font-mono">
                              {service.originalDakshina}
                            </span>
                            <span className="text-sm sm:text-base font-mono font-extrabold text-amber-400 whitespace-nowrap">
                              {service.baseDakshina}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-amber-200/80 line-clamp-2 mb-3">
                          {service.tagline}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                        <button
                          onClick={() => openBookingForService(service)}
                          className="flex-1 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                        >
                          बुक करें ({service.baseDakshina})
                        </button>
                        <button
                          onClick={() => askPanditInChat(service.name)}
                          className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs transition-colors cursor-pointer"
                          title="पण्डित जी से इसके बारे में पूछें"
                        >
                          परामर्श लें
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Official YouTube Channel Feed Teaser */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/40 border border-red-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-600 text-white">
                  <Youtube className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h4 className="text-base font-bold font-vedic text-white">
                    आधिकारिक यूट्यूब चैनल: {BRAND_CONFIG.youtubeHandle}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    गृह प्रवेश, व्रत-त्योहार, शनि साढ़े साती एवं पूजा विधि पर पण्डित शशांक शर्मा जी के प्रमाणित वीडियो।
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('youtube')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex-shrink-0 cursor-pointer"
              >
                <span>यूट्यूब वीडियो लाइब्रेरी</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
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
          />
        )}

        {/* ==================== TAB 3: SHASHANK SHARMA AI CHAT ==================== */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold font-vedic text-amber-100">
                पण्डित शशांक शर्मा AI वैदिक परामर्श
              </h2>
              <p className="text-xs sm:text-sm text-amber-300/80 mt-1">
                तार्किक विश्लेषण, संतुलित दृष्टिकोण (लाभ व सावधानियां) एवं मोबाइल नंबर से चैट हिस्ट्री सेव
              </p>
            </div>

            <ShashankSharmaChat
              initialPrompt={chatInitialPrompt}
              onNavigateToTab={setActiveTab}
              onOpenBookingWithService={(s) => {
                const found = PUJA_SERVICES.find((srv) =>
                  srv.name.toLowerCase().includes(s.toLowerCase())
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
              srv.name.toLowerCase().includes(s.toLowerCase())
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

      {/* Vedic Footer */}
      <footer className="mt-12 bg-[#080c14] border-t border-amber-900/40 pt-8 pb-20 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <PanditPortrait size="sm" showBadge={false} />
            <div>
              <div className="font-bold font-vedic text-sm text-amber-200">
                पण्डित जी ऑनलाइन (Pandit ji online)
              </div>
              <p className="text-[11px] text-slate-400">
                संस्थापक: {BRAND_CONFIG.founderName} • {BRAND_CONFIG.location}
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
            <span className="text-slate-600">•</span>
            <a href={`tel:+91${BRAND_CONFIG.phone}`} className="text-amber-400 hover:underline">
              हेल्पलाइन: {BRAND_CONFIG.displayPhone}
            </a>
            <span className="text-slate-600">•</span>
            <span>रुद्रपुर एवं वैश्विक ऑनलाइन सेवाएं</span>
          </div>

          <div className="text-[11px] text-slate-500 text-center md:text-right">
            © {new Date().getFullYear()} पण्डित जी ऑनलाइन • सर्वाधिकार सुरक्षित
          </div>
        </div>
      </footer>
    </div>
  );
}
