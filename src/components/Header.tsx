import React from 'react';
import { PanditPortrait } from './PanditPortrait';
import { UserAvatar } from './UserAvatar';
import { ActiveProfileSwitcher } from './ActiveProfileSwitcher';
import { PANDIT_ORIGINAL_PHOTO } from '../data/panditImage';
import { BRAND_CONFIG, getWhatsAppLink } from '../config/brand';
import { UserMobileAccount } from '../types';
import { HeaderVisitorBadge } from './VisitorCounter';
import {
  useLanguage,
  SUPPORTED_LANGUAGES,
  AppLanguage,
} from '../i18n/LanguageContext';
import {
  Phone,
  MessageCircle,
  Youtube,
  MapPin,
  Sparkles,
  Volume2,
  VolumeX,
  History,
  CalendarCheck,
  Calendar,
  ShieldCheck,
  Compass,
  HeartHandshake,
  Flame,
  Home,
  BookOpen,
  Globe,
  Landmark,
  Users,
  Baby,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAudioPlaying: boolean;
  toggleAudio: () => void;
  onOpenBooking: () => void;
  currentUser: UserMobileAccount | null;
  onOpenLoginModal: () => void;
  onOpenNotificationModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAudioPlaying,
  toggleAudio,
  currentUser,
  onOpenLoginModal,
}) => {
  const { language, setLanguage, t, tr } = useLanguage();

  const whatsappUrl = getWhatsAppLink(
    'Radhe Radhe Pandit Shashank Sharma ji! Main Pandit Ji Online app ke madhyam se aapse puja/jyotish paramarsh ke liye sampark kar raha/rahi hoon.'
  );

  const navTabs = [
    { id: 'home', label: t('nav_home'), icon: Home },
    { id: 'mandir', label: t('nav_mandir'), icon: Landmark },
    { id: 'gyan-kosh', label: t('nav_gyan_kosh'), icon: BookOpen },
    { id: 'panchang', label: t('nav_panchang'), icon: Calendar },
    { id: 'janam-kundali', label: t('nav_kundali'), icon: Compass },
    { id: 'milan', label: t('nav_milan'), icon: HeartHandshake },
    { id: 'jaap', label: t('nav_jaap'), icon: Flame },
    { id: 'chat', label: t('nav_chat'), icon: Sparkles },
    { id: 'services', label: t('nav_services'), icon: CalendarCheck },
    { id: 'youtube', label: t('nav_youtube'), icon: Youtube },
    {
      id: 'history',
      label: currentUser ? `${t('nav_history')} (${currentUser.phone.slice(-4)})` : t('nav_history'),
      icon: History,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden bg-[#0b0f19]/95 backdrop-blur-md border-b border-amber-800/40 shadow-lg">
      {/* 1. Top Utility Bar — Sleek, professional, balanced & zero overflow */}
      <div className="w-full bg-gradient-to-r from-[#1d0f05] via-[#2b1608] to-[#1d0f05] text-amber-200 text-xs py-1.5 px-3 sm:px-6 border-b border-amber-700/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-0">
          {/* Left: Location — Crisp and clean */}
          <div className="flex items-center gap-1.5 min-w-0 text-amber-100 font-bold whitespace-nowrap text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="sm:hidden tracking-wide truncate">
              {tr('रुद्रपुर', 'Rudrapur', 'Rudrapur', 'रुद्रपूर', 'રુદ્રપુર')}
            </span>
            <span className="hidden sm:inline tracking-wide">{t('location_label')}</span>
          </div>

          {/* Right: Language Selector, Quick Contact & Sound Toggle (Uniform Height & Spacing) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div className="hidden md:block">
              <HeaderVisitorBadge />
            </div>

            {/* Sleek Multi-Language Selector */}
            <div
              translate="no"
              className="notranslate relative flex items-center h-7 bg-slate-950/95 border border-amber-500/60 rounded-lg px-2 text-xs font-bold text-amber-200 shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400 mr-1 flex-shrink-0 pointer-events-none" />
              <select
                translate="no"
                aria-label="Select Language / भाषा चुनें"
                value={language}
                onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                className="notranslate bg-transparent text-amber-200 font-bold focus:outline-none cursor-pointer pr-0.5 text-xs"
              >
                <option value="hi" className="bg-[#0d1322] text-amber-100 font-semibold">
                  हिन्दी
                </option>
                <option value="en" className="bg-[#0d1322] text-amber-100 font-semibold">
                  English
                </option>
                <option value="hinglish" className="bg-[#0d1322] text-amber-100 font-semibold">
                  Hinglish
                </option>
                <option value="mr" className="bg-[#0d1322] text-amber-100 font-semibold">
                  मराठी
                </option>
                <option value="gu" className="bg-[#0d1322] text-amber-100 font-semibold">
                  ગુજરાતી
                </option>
              </select>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 h-7 px-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 hover:text-emerald-200 font-bold transition-colors whitespace-nowrap text-xs"
              title="WhatsApp Pandit Ji"
            >
              <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{tr('व्हाट्सऐप', 'WhatsApp', 'WhatsApp', 'व्हॉट्सॲप', 'વોટ્સએપ')}</span>
            </a>

            <a
              href={`tel:+91${BRAND_CONFIG.phone}`}
              className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-200 hover:text-amber-100 font-bold transition-colors whitespace-nowrap text-xs shadow-xs"
              title="Call Pandit Ji"
            >
              <Phone className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span className="sm:hidden">{t('call_short')}</span>
              <span className="hidden sm:inline">+91 {BRAND_CONFIG.phone}</span>
            </a>

            <button
              type="button"
              onClick={toggleAudio}
              className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-amber-900/60 border border-amber-500/50 hover:bg-amber-800/80 text-amber-100 transition-all text-xs font-semibold flex-shrink-0 cursor-pointer whitespace-nowrap shadow-xs"
              title="Toggle Vedic Tanpura & Chants"
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-[11px]">{t('audio_on')}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-[11px]">{t('audio_off')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Brand Identity & Action Bar — Compact, Balanced & Zero Overflow */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4">
        {/* Brand Identity */}
        <div
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer min-w-0"
          onClick={() => setActiveTab('home')}
        >
          <PanditPortrait size="sm" showBadge={true} className="sm:hidden" />
          <PanditPortrait size="md" showBadge={true} className="hidden sm:inline-flex" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-2xl font-extrabold font-vedic tracking-wide text-gold-gradient leading-tight truncate">
                {t('brand_title')}
              </h1>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-[9px] sm:text-[10px] text-emerald-300 font-bold whitespace-nowrap flex-shrink-0">
                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 flex-shrink-0" />
                <span>{t('verified_badge')}</span>
              </span>
            </div>

            <div className="text-[11px] sm:text-sm font-bold text-amber-100 leading-tight mt-0.5 truncate">
              {t('founder_name')}{' '}
              <span className="text-amber-400/90 font-normal text-[10px] sm:text-xs">
                {t('founder_role')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-amber-300/90 font-medium mt-1">
              <span className="font-mono font-bold text-amber-400 tabular-nums whitespace-nowrap">
                📞 +91 {BRAND_CONFIG.phone}
              </span>
              <span className="hidden sm:inline text-amber-600">•</span>
              <span className="hidden sm:inline text-emerald-300 font-semibold truncate">
                {t('online_consult_tag')}
              </span>
              <div className="md:hidden">
                <HeaderVisitorBadge />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons & Active Profile Switcher */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 w-full md:w-auto pt-1.5 md:pt-0 border-t border-amber-900/30 md:border-t-0 min-w-0">
          <div className="hidden sm:block flex-shrink-0">
            <ActiveProfileSwitcher />
          </div>
          {/* 100% Free AI Guidance Shortcut */}
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className="flex-1 min-w-0 md:flex-initial px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs shadow-sm border border-yellow-300 transition-all cursor-pointer flex items-center justify-center gap-1 h-9 whitespace-nowrap"
            title="Pandit Shashank Sharma AI Free Consultation"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950 flex-shrink-0" />
            <span className="truncate">{t('nav_chat')}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-950 text-emerald-300 font-bold flex-shrink-0">
              {t('free_badge')}
            </span>
          </button>

          {/* Mobile Number Login / User Account Trigger */}
          <button
            type="button"
            onClick={onOpenLoginModal}
            className={`flex-1 min-w-0 md:flex-initial px-2.5 py-1.5 rounded-lg border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 h-9 whitespace-nowrap ${
              currentUser
                ? 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/60 text-emerald-200 shadow-sm'
                : 'bg-slate-900/95 hover:bg-slate-800 border-amber-500/50 text-amber-200 shadow-sm'
            }`}
            title={
              currentUser
                ? `Logged in: +91 ${currentUser.phone}`
                : t('login_account')
            }
          >
            <UserAvatar currentUser={currentUser} size="xs" />
            {currentUser ? (
              <span className="font-mono tabular-nums truncate font-bold text-xs">
                {currentUser.name.split(' ')[0]} ({currentUser.phone.slice(-4)})
              </span>
            ) : (
              <span className="truncate">{t('login_account')}</span>
            )}
          </button>
        </div>
      </div>

      {/* 2b. Dynamic Conditional Login/Signup Banner Widget (Home Page & Logged-Out Only) */}
      {!currentUser && activeTab === 'home' && (
        <div className="w-full px-3 sm:px-6 pb-2 pt-0.5">
          <div
            onClick={onOpenLoginModal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenLoginModal();
              }
            }}
            className="max-w-7xl mx-auto relative overflow-hidden rounded-xl bg-gradient-to-r from-[#261205] via-[#381b07] to-[#221004] border border-[#d4af37]/75 shadow-[0_4px_20px_rgba(212,175,55,0.18)] px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 cursor-pointer group hover:border-yellow-300 transition-all"
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
            <p className="text-[11px] sm:text-xs md:text-sm font-bold text-amber-100 leading-snug text-center sm:text-left">
              {language === 'en' ? (
                <>
                  🔐 Login or Sign Up to unlock 100% accurate predictions for both your{' '}
                  <span className="text-yellow-300 font-extrabold">Birth Kundali</span> &amp;{' '}
                  <span className="text-yellow-300 font-extrabold">Name Rashi</span>!
                </>
              ) : language === 'hinglish' ? (
                <>
                  🔐 Login ya Sign In karein aur apni{' '}
                  <span className="text-yellow-300 font-extrabold">Janam Kundali</span> va{' '}
                  <span className="text-yellow-300 font-extrabold">Naam Rashi</span> dono prakar ki 100% sateek bhavishyavaniyan payein!
                </>
              ) : language === 'mr' ? (
                <>
                  🔐 लॉगिन किंवा साइन इन करा आणि आपली{' '}
                  <span className="text-yellow-300 font-extrabold">जन्म Kundali</span> व{' '}
                  <span className="text-yellow-300 font-extrabold">Naam Rashi</span> दोन्ही प्रकारच्या १००% अचूक भविष्यवाण्या मिळवा!
                </>
              ) : language === 'gu' ? (
                <>
                  🔐 લોગિન અથવા સાઇન ઇન કરો અને તમારી{' '}
                  <span className="text-yellow-300 font-extrabold">જન્મ Kundali</span> व{' '}
                  <span className="text-yellow-300 font-extrabold">Naam Rashi</span> બંને પ્રકારની ૧૦૦% સચોટ ભવિષ્યવાણીઓ મેળવો!
                </>
              ) : (
                <>
                  🔐 लॉगइन या साइन इन करें और अपनी <span className="text-yellow-300 font-extrabold">जन्म Kundali</span> व <span className="text-yellow-300 font-extrabold">Naam Rashi</span> दोनों प्रकार की 100% सटीक भविष्यवाणियां पाएं!
                </>
              )}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLoginModal();
              }}
              className="flex-shrink-0 w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold text-xs shadow-[0_2px_12px_rgba(245,158,11,0.4)] border border-yellow-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap group-hover:scale-[1.02]"
            >
              <span>{tr('लॉगइन करें', 'Login Now', 'Login Karein', 'लॉगिन करा', 'લોગિન કરો')}</span>
              <span aria-hidden="true" className="text-slate-950 font-black">→</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Sleek Single-Line Navigation Bar */}
      <div className="w-full border-t border-amber-900/35 bg-[#0d1322]/95 px-2 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 py-1.5">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer border whitespace-nowrap ${
                  isActive
                    ? 'text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-yellow-300 font-extrabold shadow-sm'
                    : 'text-amber-100/90 hover:text-white bg-slate-900/70 hover:bg-amber-950/60 border-amber-900/40 font-semibold'
                }`}
              >
                <IconComponent
                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                    isActive ? 'text-slate-950' : 'text-amber-400'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
