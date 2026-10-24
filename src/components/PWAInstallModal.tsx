import React, { useState } from 'react';
import { PanditPortrait } from './PanditPortrait';
import { usePWAInstall } from '../utils/usePWAInstall';
import {
  Download,
  CheckCircle2,
  X,
  Sparkles,
  WifiOff,
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstalled, triggerNativeInstall } = usePWAInstall();
  const [installSuccessMsg, setInstallSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const result = await triggerNativeInstall();
    if (result === 'accepted') {
      setInstallSuccessMsg(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1a1107] via-[#101726] to-[#0b101d] border-2 border-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.3)] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-[#241508] to-amber-950 px-4 py-3.5 border-b border-amber-600/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <PanditPortrait size="sm" showBadge={true} />
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>Android 1-Click App Install</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold font-vedic text-amber-100 truncate">
                Pandit Ji Online App
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-600/40 cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {installSuccessMsg || isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500/60 text-center space-y-1.5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm sm:text-base font-bold text-emerald-200">
                यह ऐप आपके फ़ोन में सफलतापूर्वक इंस्टॉल है!
              </h4>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-[0_0_25px_rgba(251,191,36,0.5)] cursor-pointer flex items-center justify-center gap-2 transition-all text-center"
            >
              <Download className="w-4 h-4 text-slate-950 flex-shrink-0" />
              <span>📲 Pandit Ji Online App Download Karein</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const OfflineConnectivityBanner: React.FC = () => {
  const { isOnline } = usePWAInstall();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-lg border border-yellow-200">
      <WifiOff className="w-4 h-4 text-slate-950 flex-shrink-0" />
      <span>ऑफ़लाइन मोड सक्रिय — सेव किया हुआ डेटा दिख रहा है</span>
    </div>
  );
};
