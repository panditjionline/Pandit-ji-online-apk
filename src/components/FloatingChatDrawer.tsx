import React, { useState } from 'react';
import { PanditPortrait } from './PanditPortrait';
import { ShashankSharmaChat } from './ShashankSharmaChat';
import { ChatMessage, UserMobileAccount } from '../types';
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Trigger Button with Prominent Pandit Shashank Sharma Portrait */}
      {!isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex items-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 sm:gap-3 pl-1.5 pr-3.5 py-1.5 sm:pl-2 sm:pr-4 sm:py-2 rounded-full bg-gradient-to-r from-[#1d1106] via-[#2b1808] to-[#1a1006] hover:from-[#291708] hover:to-[#241507] text-amber-50 font-bold shadow-2xl shadow-black/80 border-2 border-amber-400/90 hover:border-yellow-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5"
            title="पण्डित शशांक शर्मा AI चैट खोलें"
          >
            {/* Ambient Golden Glow */}
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 opacity-30 group-hover:opacity-55 blur-xs transition-opacity pointer-events-none" />

            {/* Pandit Shashank Sharma Portrait Avatar with Live Online Dot */}
            <div className="relative flex-shrink-0">
              <PanditPortrait size="sm" showBadge={false} />
              <span
                className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 flex items-center justify-center"
                title="ऑनलाइन उपलब्ध"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping" />
              </span>
            </div>

            {/* Text Content */}
            <div className="relative text-left pr-0.5">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide block whitespace-nowrap">
                  वैदिक AI परामर्श
                </span>
              </div>
              <span className="text-xs sm:text-sm font-extrabold font-vedic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 leading-tight block whitespace-nowrap">
                पं. शशांक शर्मा AI चैट
              </span>
            </div>

            {/* Golden Chat Badge Icon */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-md flex-shrink-0">
              <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-950 fill-slate-950/15" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Window Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-5 bg-black/75 backdrop-blur-xs">
          <div className="w-full sm:max-w-lg h-[90vh] sm:h-[670px] bg-[#0c1220] border-2 border-amber-500/70 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
            {/* Prominent Pandit Shashank Sharma Profile Header in Floating Window */}
            <div className="relative bg-gradient-to-r from-[#241307] via-[#181009] to-[#0f172a] px-4 py-3 border-b border-amber-600/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <PanditPortrait size="md" showBadge={true} allowUpload={true} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm sm:text-base font-extrabold font-vedic text-amber-100 truncate">
                      पण्डित शशांक शर्मा
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      AI लाइव
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300/90 font-medium truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span>वैदिक पुरोहित एवं ज्योतिषाचार्य • रुद्रपुर</span>
                  </p>
                  <span className="text-[10px] text-emerald-400/90 block truncate mt-0.5">
                    {currentUser
                      ? `मोबाइल हिस्ट्री सिंक: +91 ${currentUser.phone}`
                      : 'तार्किक एवं शास्त्रसम्मत समाधान'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-slate-900/90 border border-amber-700/40 text-amber-200 hover:text-white hover:bg-rose-950/70 hover:border-rose-500/50 transition-colors cursor-pointer flex-shrink-0"
                title="चैट विंडो बंद करें"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Container */}
            <div className="flex-1 overflow-hidden">
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
