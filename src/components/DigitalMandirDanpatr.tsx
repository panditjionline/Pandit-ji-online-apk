import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const DANPATR_UPI_ID = 'internetwebhelp24@okicici';
const DANPATR_PAYEE_NAME = 'Pandit Ji Online Danpatr';
const PRESET_AMOUNTS = [11, 21, 51, 101];

interface DigitalMandirDanpatrProps {
  onOfferSuccess?: (amount: number) => void;
}

export const DigitalMandirDanpatr: React.FC<DigitalMandirDanpatrProps> = ({
  onOfferSuccess,
}) => {
  const { tr } = useLanguage();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(21);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeAmount = customAmount.trim() !== ''
    ? Math.max(1, Number(customAmount) || 0)
    : (selectedPreset || 21);

  const buildUpiUrl = (schemePrefix: string = 'upi://pay') => {
    const note = 'Digital%20Mandir%20Danpatr%20-%20Punya%20Labh';
    const query = `pa=${encodeURIComponent(DANPATR_UPI_ID)}&pn=${encodeURIComponent(
      DANPATR_PAYEE_NAME
    )}&am=${activeAmount}&cu=INR&tn=${note}`;
    return `${schemePrefix}?${query}`;
  };

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(DANPATR_UPI_ID);
      setCopiedUpi(true);
      setStatusMessage(
        tr(
          `✅ UPI ID (${DANPATR_UPI_ID}) कॉपी हो गई!`,
          `✅ UPI ID (${DANPATR_UPI_ID}) copied!`
        )
      );
      window.setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      setStatusMessage(tr(`UPI ID: ${DANPATR_UPI_ID}`, `UPI ID: ${DANPATR_UPI_ID}`));
    }
  };

  const triggerUpiPayment = (appLabel: string, schemePrefix: string = 'upi://pay') => {
    if (!activeAmount || activeAmount < 1) {
      setStatusMessage(tr('कृपया वैध समर्पण राशि चुनें।', 'Please enter a valid offering amount.'));
      return;
    }

    const upiDeepLink = buildUpiUrl(schemePrefix);
    if (onOfferSuccess) {
      onOfferSuccess(activeAmount);
    }

    setStatusMessage(
      tr(
        `🙏 ₹${activeAmount} समर्पण हेतु ${appLabel} खुल रहा है...`,
        `🙏 Opening ${appLabel} for ₹${activeAmount} offering...`
      )
    );

    const anchor = document.createElement('a');
    anchor.href = upiDeepLink;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-[#211307]/95 via-[#160d05]/95 to-[#1d1106]/95 backdrop-blur-md border border-[#d4af37]/65 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_8px_28px_rgba(212,175,55,0.16)] overflow-hidden">
      {/* Subtle Top Sacred Gold Hairline */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-80 pointer-events-none" />

      <div className="relative z-10 space-y-2">
        {/* 1. Single Tight Header Row: Temple Icon (🛕), Title, Subtle Badge & Compact Copy UPI */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 via-[#d4af37] to-amber-700 text-slate-950 flex items-center justify-center text-xs shadow-sm border border-yellow-200/80 shrink-0">
              🛕
            </span>
            <h3 className="text-xs sm:text-sm font-extrabold font-vedic text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 truncate">
              {tr('श्री डिजिटल दानपात्र', 'Shri Digital Danpatr')}
            </h3>
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-[#d4af37]/50 text-[9px] font-bold text-amber-300 tracking-wide whitespace-nowrap shrink-0">
              {tr('सेवा समर्पण', 'Sacred Offering')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyUpiId}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/45 hover:bg-amber-950/70 border border-[#d4af37]/45 text-[10px] font-mono text-amber-200/95 transition-all cursor-pointer shrink-0"
            title={tr('UPI ID कॉपी करें', 'Copy UPI ID')}
          >
            <span className="truncate max-w-[135px] sm:max-w-none">{DANPATR_UPI_ID}</span>
            {copiedUpi ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-amber-400 shrink-0" />
            )}
          </button>
        </div>

        {/* 2. Single Horizontal Compact Row: Quick Amounts (₹11, ₹21, ₹51, ₹101) + Custom Input (Strictly Bounded) */}
        <div className="grid grid-cols-12 gap-1.5 items-center w-full">
          {PRESET_AMOUNTS.map((amt) => {
            const isSelected = customAmount.trim() === '' && selectedPreset === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setSelectedPreset(amt);
                  setCustomAmount('');
                }}
                className={`col-span-2 min-w-0 w-full px-1 sm:px-2.5 py-1.5 rounded-lg font-extrabold text-xs text-center transition-all cursor-pointer border truncate ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-400 via-[#d4af37] to-amber-600 text-slate-950 border-yellow-200 shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                    : 'bg-black/50 hover:bg-amber-950/60 text-amber-200 border-[#d4af37]/35'
                }`}
              >
                ₹{amt}
              </button>
            );
          })}

          <div className="col-span-4 relative min-w-0 w-full">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-400 font-extrabold text-[11px] sm:text-xs pointer-events-none">
              ₹
            </span>
            <input
              type="number"
              min="1"
              max="100000"
              inputMode="numeric"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                if (e.target.value.trim() !== '') {
                  setSelectedPreset(null);
                }
              }}
              placeholder={tr('अन्य राशि', 'Custom')}
              className="w-full min-w-0 box-border pl-5 pr-1.5 py-1.5 rounded-lg bg-black/55 border border-[#d4af37]/45 focus:border-amber-400 focus:outline-none text-amber-100 placeholder-amber-400/60 text-[11px] sm:text-xs font-bold"
            />
          </div>
        </div>

        {/* 3. Neat, Compact 4-Column Payment App Triggers */}
        <div className="grid grid-cols-4 gap-1.5 w-full">
          <button
            type="button"
            onClick={() => triggerUpiPayment('Google Pay', 'tez://upi/pay')}
            className="min-w-0 py-1.5 px-1 sm:px-1.5 rounded-lg bg-gradient-to-b from-slate-900/90 to-slate-950 hover:from-slate-800 hover:to-slate-900 border border-[#d4af37]/40 text-white font-bold text-[10.5px] sm:text-[11px] flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white text-blue-600 font-black text-[8.5px] sm:text-[9px] flex items-center justify-center shrink-0">
              G
            </span>
            <span className="truncate">GPay</span>
          </button>

          <button
            type="button"
            onClick={() => triggerUpiPayment('PhonePe', 'phonepe://pay')}
            className="min-w-0 py-1.5 px-1 sm:px-1.5 rounded-lg bg-gradient-to-b from-[#3b1566]/90 to-[#240b42] hover:from-[#4b1c80] hover:to-[#2e0f54] border border-purple-400/45 text-purple-100 font-bold text-[10.5px] sm:text-[11px] flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-purple-500 text-white font-black text-[8.5px] sm:text-[9px] flex items-center justify-center shrink-0">
              पे
            </span>
            <span className="truncate">PhonePe</span>
          </button>

          <button
            type="button"
            onClick={() => triggerUpiPayment('Paytm', 'paytmmp://pay')}
            className="min-w-0 py-1.5 px-1 sm:px-1.5 rounded-lg bg-gradient-to-b from-[#082f49]/90 to-[#051e30] hover:from-[#0c4a6e] hover:to-[#082f49] border border-sky-400/45 text-sky-100 font-bold text-[10.5px] sm:text-[11px] flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-sky-400 text-slate-950 font-black text-[8.5px] sm:text-[9px] flex items-center justify-center shrink-0">
              P
            </span>
            <span className="truncate">Paytm</span>
          </button>

          <button
            type="button"
            onClick={() => triggerUpiPayment('BHIM UPI', 'upi://pay')}
            className="min-w-0 py-1.5 px-1 sm:px-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-[10.5px] sm:text-[11px] border border-yellow-200 flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <span className="truncate">BHIM ₹{activeAmount}</span>
            <ExternalLink className="w-2.5 h-2.5 shrink-0 hidden sm:inline" />
          </button>
        </div>

        {/* Status Toast / Confirmation Feedback */}
        {statusMessage && (
          <div className="px-2.5 py-1 rounded-lg bg-amber-950/85 border border-[#d4af37]/50 text-amber-100 text-[10px] font-medium flex items-center justify-between gap-2">
            <span className="truncate">{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-amber-300 hover:text-white font-bold text-[10px] cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
