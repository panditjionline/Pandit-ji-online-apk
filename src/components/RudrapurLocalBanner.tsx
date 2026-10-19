import React from 'react';
import { MapPin, Phone, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { PanditPortrait } from './PanditPortrait';
import { RUDRAPUR_LOCALITIES } from '../data/mockData';
import { BRAND_CONFIG, getWhatsAppLink } from '../config/brand';

interface RudrapurLocalBannerProps {
  onOpenBooking: () => void;
}

export const RudrapurLocalBanner: React.FC<RudrapurLocalBannerProps> = ({ onOpenBooking }) => {
  const whatsappUrl = getWhatsAppLink(
    'Radhe Radhe Pandit Shashank Sharma ji! Mujhe Rudrapur (Uttarakhand) me apne ghar par puja/hawan sampann karwana hai. Kripya shubh muhurat aur samay uplabdhata batayein.'
  );

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/80 via-[#19110b] to-[#0d1424] border border-amber-600/40 p-5 sm:p-7 shadow-xl">
      {/* Decorative background aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Local Rudrapur Pitch & Trust Signals */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <PanditPortrait size="sm" showBadge={false} />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>पण्डित शशांक शर्मा • रुद्रपुर एवं सम्पूर्ण उधम सिंह नगर</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-vedic text-amber-100 leading-tight">
            रुद्रपुर में आपके द्वार पर{' '}
            <span className="text-gold-gradient">शास्त्रोक्त वैदिक पूजा एवं हवन</span>
          </h2>

          <p className="mt-2 text-sm sm:text-base text-amber-200/80 leading-relaxed">
            पण्डित शशांक शर्मा जी द्वारा सम्पूर्ण विधि-विधान, शुद्ध मंत्रोच्चार एवं वैदिक संकल्प सहित 
            गृह प्रवेश, सत्यनारायण कथा, महा रुद्राभिषेक एवं नवग्रह शांति का घर पर प्रत्यक्ष आयोजन।
          </p>

          {/* Rudrapur Localities Pill Grid */}
          <div className="mt-4 pt-3 border-t border-amber-900/40">
            <span className="text-xs text-amber-400/90 font-medium block mb-2">
              प्रमुख सेवारत क्षेत्र (Immediate Rudrapur Coverage):
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {RUDRAPUR_LOCALITIES.slice(0, 6).map((locality) => (
                <span
                  key={locality}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-900/30 border border-amber-700/30 text-amber-200 text-xs font-medium"
                >
                  <CheckCircle2 className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  {locality}
                </span>
              ))}
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-amber-950/40 text-amber-400 text-xs font-medium">
                + सम्पूर्ण रुद्रपुर एवं पंतनगर
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Instant Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
          <button
            onClick={onOpenBooking}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>बुक करें घर की पूजा</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-semibold text-sm sm:text-base transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>सीधे WhatsApp ({BRAND_CONFIG.displayPhone})</span>
          </a>

          <a
            href={`tel:+91${BRAND_CONFIG.phone}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-600/30 text-amber-200 font-medium text-xs sm:text-sm transition-all"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span>सीधे कॉल करें: {BRAND_CONFIG.displayPhone}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
