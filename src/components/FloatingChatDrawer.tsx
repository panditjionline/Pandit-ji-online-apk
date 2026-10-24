import React, { useState } from 'react';
import { PanditPortrait } from './PanditPortrait';
import { ShashankSharmaChat } from './ShashankSharmaChat';
import { ChatMessage, UserMobileAccount } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { X, MessageCircle, Sparkles, MapPin } from 'lucide-react';

interface FloatingChatDrawerProps {
  onNavigateToTab: (tab: string) => void;
  onOpenBookingWithService?: (serviceName: string) => void;
  currentUser?: UserMobileAccount | null;
  onUpdateChatMessages?: (messages: ChatMessage[]) => void;
  onOpenLoginModal?: () => void;
}

export const FloatingChatDrawer: React.FC<FloatingChatDrawerProps> = ({
  onNavigateToTab,
  onOpenBookingWithService,
  currentUser,
  onUpdateChatMessages,
  onOpenLoginModal,
}) => {
  const { tr } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Compact Non-Intrusive Floating Chat Button (Never covers content on mobile) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-3 md:bottom-5 md:right-5 z-40 flex items-center pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2 pl-1.5 pr-3 py-1.5 sm:pl-2 sm:pr-4 sm:py-2 rounded-full bg-gradient-to-r from-[#281607] via-[#381f0a] to-[#241406] hover:from-[#361e09] hover:to-[#2e1a08] text-amber-50 font-bold shadow-xl border-2 border-amber-400 hover:border-yellow-300 transition-all duration-200 cursor-pointer"
            title={tr('पण्डित शशांक शर्मा AI चैट खोलें', 'Open Pandit Shashank Sharma AI Chat', 'Pandit Shashank Sharma AI Chat Kholें')}
          >
            {/* Pandit Shashank Sharma Portrait Avatar with Live Indicator */}
            <div className="relative flex-shrink-0">
              <PanditPortrait size="xs" showBadge={false} className="sm:hidden" />
              <PanditPortrait size="sm" showBadge={false} className="hidden sm:inline-flex" />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 ring-2 ring-slate-950 flex items-center justify-center"
                title={tr('ऑनलाइन उपलब्ध', 'Available Online', 'Online Uplabdh')}
              />
            </div>

            {/* Compact Label on Mobile, Full Label on Desktop */}
            <div className="relative text-left">
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-amber-300 uppercase tracking-wide whitespace-nowrap">
                <Sparkles className="w-2.5 h-2.5 text-yellow-400 flex-shrink-0" />
                <span>{tr('वैदिक ज्योतिष परामर्श', 'Vedic Astrology Guidance', 'Vedic Jyotish Paramarsh')}</span>
              </span>
              <span className="text-xs sm:text-sm font-extrabold font-vedic text-amber-100 leading-tight block whitespace-nowrap">
                {tr('ज्योतिष चैट', 'Jyotish Chat', 'Jyotish Chat')}
              </span>
            </div>

            {/* Golden Chat Badge Icon */}
            <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-sm flex-shrink-0">
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 fill-slate-950/15" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Window Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end pt-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-hidden">
          <div className="w-full sm:max-w-lg h-[82dvh] max-h-[calc(100dvh-16px)] sm:h-[660px] sm:max-h-[calc(100dvh-40px)] bg-[#0c1220] border-2 border-amber-500/70 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
            {/* Prominent Pandit Shashank Sharma Profile Header in Floating Window */}
            <div className="relative flex-shrink-0 bg-gradient-to-r from-[#241307] via-[#181009] to-[#0f172a] px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-amber-600/50 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <PanditPortrait size="sm" showBadge={true} className="sm:hidden" />
                  <PanditPortrait size="md" showBadge={true} className="hidden sm:inline-flex" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs sm:text-base font-extrabold font-vedic text-amber-100 truncate">
                      {tr('आचार्य पण्डित शशांक शर्मा', 'Acharya Pandit Shashank Sharma', 'Acharya Pandit Shashank Sharma')}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {tr('प्रत्यक्ष', 'Online', 'Online')}
                    </span>
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] text-amber-300/90 font-medium truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="truncate">
                      {tr(
                        'वैदिक पुरोहित एवं ज्योतिषाचार्य • रुद्रपुर',
                        'Vedic Purohit & Jyotishacharya • Rudrapur',
                        'Vedic Purohit & Jyotishacharya • Rudrapur'
                      )}
                    </span>
                  </p>
                  <span className="text-[10px] text-emerald-400/90 block truncate mt-0.5">
                    {currentUser
                      ? tr(
                          `मोबाइल इतिहास सिंक: +91 ${currentUser.phone}`,
                          `Mobile History Synced: +91 ${currentUser.phone}`,
                          `Mobile History Sync: +91 ${currentUser.phone}`
                        )
                      : tr(
                          'तार्किक एवं शास्त्रसम्मत वैदिक ज्योतिष समाधान',
                          'Balanced Vedic Guidance (English / Hindi / Hinglish)',
                          'Tarkik & Shastrokta Samadhan (Hindi / English / Hinglish)'
                        )}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-slate-900/90 border border-amber-700/40 text-amber-200 hover:text-white hover:bg-rose-950/70 hover:border-rose-500/50 transition-colors cursor-pointer flex-shrink-0"
                title={tr('चैट विंडो बंद करें', 'Close Chat Window', 'Chat Window Band Karein')}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Chat Container */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ShashankSharmaChat
                isEmbeddedInDrawer={true}
                onNavigateToTab={(tab) => {
                  setIsOpen(false);
                  onNavigateToTab(tab);
                }}
                onOpenBookingWithService={onOpenBookingWithService}
                currentUser={currentUser}
                onUpdateChatMessages={onUpdateChatMessages}
                onOpenLoginModal={onOpenLoginModal}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
