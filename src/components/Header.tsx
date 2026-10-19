import React from 'react';
import { PanditPortrait } from './PanditPortrait';
import { BRAND_CONFIG, getWhatsAppLink } from '../config/brand';
import { UserMobileAccount } from '../types';
import {
  Phone,
  MessageCircle,
  Youtube,
  MapPin,
  Sparkles,
  Volume2,
  VolumeX,
  User,
  History,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAudioPlaying: boolean;
  toggleAudio: () => void;
  onOpenBooking: () => void;
  currentUser: UserMobileAccount | null;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAudioPlaying,
  toggleAudio,
  onOpenBooking,
  currentUser,
  onOpenLoginModal,
}) => {
  const whatsappUrl = getWhatsAppLink(
    'Radhe Radhe Pandit Shashank Sharma ji! Main Pandit Ji Online app ke madhyam se aapse puja/jyotish paramarsh ke liye sampark kar raha/rahi hoon.'
  );

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden bg-[#0b0f19]/95 backdrop-blur-md border-b border-amber-800/50 shadow-xl">
      {/* Top Status Bar: Location + Direct Contact & Sound Toggle (No cut-off text) */}
      <div className="w-full bg-gradient-to-r from-[#231206] via-amber-950/90 to-[#231206] text-amber-200 text-[11px] py-1.5 px-3 sm:px-6 flex items-center justify-between gap-2 border-b border-amber-700/40">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="flex h-2 w-2 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="font-bold text-amber-100 whitespace-nowrap">
            रुद्रपुर (उत्तराखण्ड)
          </span>
          <span className="hidden md:inline text-amber-200/85">
            • घर पर वैदिक पूजा एवं ज्योतिष परामर्श (Indra Colony, Awas Vikas, Transit Camp)
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold whitespace-nowrap"
            title="WhatsApp Pandit Ji"
          >
            <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`tel:+91${BRAND_CONFIG.phone}`}
            className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold whitespace-nowrap"
            title="Call Pandit Ji"
          >
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span>कॉल</span>
          </a>

          <a
            href={BRAND_CONFIG.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold transition-colors whitespace-nowrap"
            title="Official YouTube Channel"
          >
            <Youtube className="w-3.5 h-3.5 fill-current flex-shrink-0" />
            <span className="hidden sm:inline">{BRAND_CONFIG.youtubeHandle}</span>
          </a>

          <button
            type="button"
            onClick={toggleAudio}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-900/70 border border-amber-500/50 hover:bg-amber-800 text-amber-100 transition-all text-[10px] sm:text-[11px] font-semibold flex-shrink-0 cursor-pointer whitespace-nowrap"
            title="Toggle Vedic Tanpura & Chants"
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>ध्वनि चालू</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3 h-3 text-amber-400" />
                <span>मंत्र ध्वनि</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Brand Identity + Action Bar: Full App Name & Full Pandit Shashank Sharma Name Always Visible */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-4">
        {/* Top/Left: Portrait + Full App Name + Full Pandit Shashank Sharma Name & Phone */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab('home')}
        >
          <PanditPortrait size="md" showBadge={false} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-lg sm:text-2xl font-extrabold font-vedic tracking-wide text-gold-gradient leading-tight">
                पण्डित जी ऑनलाइन
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold whitespace-nowrap">
                <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>Verified आचार्य</span>
              </span>
            </div>

            <div className="text-xs sm:text-sm font-bold text-amber-100 leading-snug mt-0.5">
              आचार्य पण्डित शशांक शर्मा{' '}
              <span className="text-amber-400/90 font-normal text-[11px] sm:text-xs">
                (वैदिक पुरोहित एवं ज्योतिषाचार्य)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-amber-300 font-medium mt-0.5">
              <span className="font-mono font-bold text-amber-400">
                📞 +91 {BRAND_CONFIG.phone}
              </span>
              <span className="text-amber-600">•</span>
              <span className="text-emerald-300 font-semibold">
                रुद्रपुर एवं ऑनलाइन परामर्श
              </span>
            </div>
          </div>
        </div>

        {/* Bottom on Mobile / Right on Desktop: Action Buttons (Direct Booking & User Login) */}
        <div className="flex items-center gap-2 w-full md:w-auto pt-1 md:pt-0 border-t border-amber-900/30 md:border-t-0">
          {/* Direct WhatsApp Puja & ₹100 Consultation Booking Button */}
          <button
            type="button"
            onClick={onOpenBooking}
            className="flex-1 md:flex-initial px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 border border-amber-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
            title="सीधे पण्डित शशांक शर्मा जी के WhatsApp पर पूजा व ₹100 परामर्श बुक करें"
          >
            <CalendarCheck className="w-4 h-4 text-slate-950 flex-shrink-0" />
            <span>पूजा बुकिंग</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 font-mono font-bold">
              ₹100 परामर्श
            </span>
          </button>

          {/* Mobile Number Login / User Account Trigger */}
          <button
            type="button"
            onClick={onOpenLoginModal}
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0 whitespace-nowrap ${
              currentUser
                ? 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/60 text-emerald-200 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 border-amber-500/50 text-amber-200 shadow-md'
            }`}
            title={
              currentUser
                ? `लॉगिन: +91 ${currentUser.phone} (अपना निजी डेटा व हिस्ट्री देखें)`
                : 'मोबाइल नंबर और पासवर्ड से लॉगिन करें'
            }
          >
            <User className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            {currentUser ? (
              <span className="font-mono">
                {currentUser.name.split(' ')[0]} • {currentUser.phone.slice(-4)}
              </span>
            ) : (
              <span>लॉगिन करें</span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="w-full border-t border-amber-900/30 bg-[#0d1322]/95 px-2 sm:px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 py-1.5">
          {[
            { id: 'home', label: 'Home & Tyohar', hindi: 'आज का पर्व व पंचांग' },
            { id: 'chat', label: 'Pt. Shashank AI', hindi: 'परामर्श चैटबॉट', highlight: true },
            { id: 'jaap', label: 'Mantra Jaap', hindi: '108 जप काउंटर', highlight: true },
            { id: 'janam-kundali', label: 'Sampurn Kundali', hindi: 'सम्पूर्ण जन्म कुंडली', highlight: true },
            { id: 'milan', label: 'Kundali Milan', hindi: '36 गुण मिलान', highlight: true },
            { id: 'youtube', label: 'YouTube', hindi: 'यूट्यूब वीडियो' },
            { id: 'services', label: 'Puja Booking', hindi: 'पूजा सेवा (रुद्रपुर)' },
            {
              id: 'history',
              label: currentUser ? `मेरा डेटा (${currentUser.phone.slice(-4)})` : 'मेरा डेटा / हिस्ट्री',
              hindi: 'चैट, जप व हिस्ट्री डिलीट',
              highlight: true,
              isHistoryTab: true,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all relative flex flex-col items-center cursor-pointer ${
                  isActive
                    ? 'text-amber-200 bg-amber-600/20 border border-amber-500/40 font-semibold shadow-inner'
                    : tab.highlight
                    ? 'text-amber-300 hover:text-amber-100 bg-amber-950/40 hover:bg-amber-900/40'
                    : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-1 whitespace-nowrap">
                  {tab.isHistoryTab ? (
                    <History className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  ) : (
                    tab.highlight && <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  )}
                  <span>{tab.label}</span>
                </div>
                <span className="text-[10px] text-amber-500/75 font-normal whitespace-nowrap">
                  {tab.hindi}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
