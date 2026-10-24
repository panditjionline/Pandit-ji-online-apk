import React, { useState } from 'react';
import { PujaService, PujaCategory } from '../types';
import { PUJA_SERVICES } from '../data/mockData';
import { Sparkles, Clock, CheckCircle2, AlertCircle, MessageSquare, ArrowRight, Home, Flame, Compass, Tag } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

import { PanditPortrait } from './PanditPortrait';
import { RudrapurLocalBanner } from './RudrapurLocalBanner';

interface ServicesSectionProps {
  onSelectServiceToBook: (service: PujaService) => void;
  onAskAboutService: (serviceName: string) => void;
  onOpenCustomBooking?: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectServiceToBook,
  onAskAboutService,
  onOpenCustomBooking,
}) => {
  const { language, tr } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<PujaCategory | 'all'>('all');

  const categories: Array<{ id: PujaCategory | 'all'; label: string; icon: React.ReactNode }> = [
    {
      id: 'all',
      label: tr('सम्पूर्ण सेवाएं', 'All Services', 'Sampurn Sevayein', 'संपूर्ण सेवा', 'સંપૂર્ણ સેવાઓ'),
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'ghar_ki_puja',
      label: tr('घर की पूजा (रुद्रपुर)', 'Home Puja (Rudrapur)', 'Ghar ki Puja (Rudrapur)', 'घरची पूजा (रुद्रपूर)', 'ઘરની પૂજા (રુદ્રપુર)'),
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'anushthan_jap',
      label: tr('अनुष्ठान एवं जप', 'Anushthan & Jaap', 'Anushthan & Jaap', 'अनुष्ठान व जप', 'અનુષ્ઠાન અને જપ'),
      icon: <Flame className="w-4 h-4" />,
    },
    {
      id: 'jyotish_kundali',
      label: tr('ज्योतिष व कुंडली', 'Jyotish & Kundali', 'Jyotish & Kundali', 'ज्योतिष व कुंडली', 'જ્યોતિષ અને કુંડળી'),
      icon: <Compass className="w-4 h-4" />,
    },
  ];

  const filteredServices = selectedCategory === 'all'
    ? PUJA_SERVICES
    : PUJA_SERVICES.filter((s) => s.category === selectedCategory);

  return (
    <section className="w-full max-w-full overflow-x-hidden space-y-6">
      {/* 🌟 1. TOPMOST FEATURED 90% OFF SPECIAL BLESSING OFFER BANNER (₹1,000 -> मात्र ₹100) */}
      {(() => {
        const offerService = PUJA_SERVICES.find((s) => s.id === 'kundali-paramarsh');
        if (!offerService) return null;
        return (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1f1105] via-[#2a1708] to-[#0f1b13] border-2 border-emerald-500/80 p-5 sm:p-7 shadow-[0_12px_45px_rgba(16,185,129,0.28)] ring-1 ring-emerald-400/40">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 uppercase tracking-wider animate-pulse shadow-md flex items-center gap-1.5">
                    <span>🔥 90% महा छूट विशेष ऑफर</span>
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-yellow-300 border border-amber-400/50">
                    {tr('सीमित समय आशीर्वाद दक्षिणा', 'Limited Time Blessing Dakshina')}
                  </span>
                  <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    100% गोपनीय • प्रत्यक्ष 1-on-1
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-vedic text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-300 leading-tight">
                  {language === 'en' ? offerService.name : offerService.hindiName}
                </h3>

                <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                  {tr(
                    'आचार्य पण्डित शशांक शर्मा जी से फोन/वीडियो कॉल पर प्रत्यक्ष 1-on-1 सम्पूर्ण जन्मपत्री, भविष्यफल, दशा-गोचर विश्लेषण एवं अचूक सात्विक वैदिक उपाय।',
                    'Direct 1-on-1 personal consultation with Acharya Pandit Shashank Sharma via Phone/Video Call for full birth chart, future forecasts, and authentic remedies.'
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-3.5 text-xs text-amber-200/90 pt-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{tr('सम्पूर्ण जन्मपत्री व वर्षफल', 'Full Kundali & Year Chart')}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{tr('दशा-महादशा व गोचर फल', 'Dasha & Transit Analysis')}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{tr('सरल सात्विक वैदिक उपाय', 'Satvik Vedic Remedies')}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{tr('सीधे WhatsApp पर बुकिंग', 'Direct WhatsApp Booking')}</span>
                  </span>
                </div>
              </div>

              {/* Price & Booking Action Card */}
              <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto p-4 sm:p-5 rounded-2xl bg-black/60 border-2 border-emerald-500/50 backdrop-blur-md flex-shrink-0 shadow-lg">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  {tr('विशेष दक्षिणा (शुल्क)', 'Special Dakshina')}
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-sm sm:text-base text-slate-400 line-through font-mono">₹1,000</span>
                  <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                    मात्र ₹100
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/50">
                    90% छूट
                  </span>
                </div>
                <div className="text-[11px] text-amber-300/80">
                  {tr('(₹900 की सीधी बचत • 1-on-1 परामर्श)', '(Save ₹900 • 1-on-1 Consult)')}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectServiceToBook(offerService)}
                  className="w-full lg:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_4px_25px_rgba(16,185,129,0.4)] border border-emerald-300 transition-all cursor-pointer flex items-center justify-center gap-2 group whitespace-nowrap"
                >
                  <Tag className="w-4 h-4 text-slate-950" />
                  <span>{tr('मात्र ₹100 में अभी बुक करें (90% OFF)', 'Book Now at ₹100 (90% OFF)')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. Section Header & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <PanditPortrait size="lg" showBadge={true} />
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>
                {tr(
                  'आचार्य पण्डित शशांक शर्मा • वैदिक अनुष्ठान एवं परामर्श सूची',
                  'Acharya Pandit Shashank Sharma • Vedic Rituals & Consultation Catalog',
                  'Acharya Pandit Shashank Sharma • Vedic Anushthan & Paramarsh Suchi',
                  'आचार्य पंडित शशांक शर्मा • वैदिक अनुष्ठान व सल्ला सूची',
                  'આચાર્ય પંડિત શશાંક શર્મા • વૈદિક અનુષ્ઠાન અને માર્ગદર્શન સૂચિ'
                )}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold font-vedic text-amber-100 leading-snug">
              {tr(
                'शास्त्रोक्त पूजा, हवन एवं ज्योतिष सेवाएं',
                'Authentic Vedic Puja, Havan & Astrology Services',
                'Shastrokt Puja, Havan & Jyotish Sevayein',
                'शास्त्रोक्त पूजा, हवन आणि ज्योतिष सेवा',
                'શાસ્ત્રોક્ત પૂજા, હવન અને જ્યોતિષ સેવાઓ'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-2xl">
              {tr(
                'प्रत्येक अनुष्ठान के शुभ लाभ एवं शास्त्रसम्मत नियमों का संतुलित विवरण। रुद्रपुर (उत्तराखण्ड) में आपके घर पर वैदिक पूजा एवं फोन/वीडियो कॉल पर व्यक्तिगत ज्योतिष परामर्श।',
                'Balanced details of spiritual merits and scriptural rules for every ritual. Home Vedic Puja in Rudrapur (Uttarakhand) & personal consultation via Phone/Video Call.',
                'Har anushthan ke shubh labh aur shastrasammat niyamon ka santulit vivaran. Rudrapur me ghar par Vedic Puja aur Phone/Video Call par jyotish paramarsh.'
              )}
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 text-amber-200/80 hover:bg-slate-800 border border-amber-900/40'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="group relative min-w-0 flex flex-col justify-between bg-gradient-to-b from-[#131b2e] to-[#0d1322] border border-amber-900/40 hover:border-amber-500/60 rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/20"
          >
            {/* Top Content */}
            <div className="min-w-0">
              {/* Service Title Block */}
              <div className="mb-3 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest">
                    {service.category === 'ghar_ki_puja'
                      ? tr('घर की पूजा (रुद्रपुर)', 'Home Puja (Rudrapur)', 'Ghar ki Puja (Rudrapur)', 'घरची पूजा (रुद्रपूर)', 'ઘરની પૂજા (રુદ્રપુર)')
                      : service.category === 'anushthan_jap'
                      ? tr('अनुष्ठान एवं जप', 'Anushthan & Jaap', 'Anushthan & Jaap', 'अनुष्ठान व जप', 'અનુષ્ઠાન અને જપ')
                      : tr('ज्योतिष एवं कुंडली', 'Jyotish & Kundali', 'Jyotish & Kundali', 'ज्योतिष व कुंडली', 'જ્યોતિષ અને કુંડળી')}
                  </span>
                  {service.specialOfferTag && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{service.specialOfferTag}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold font-vedic text-amber-100 group-hover:text-amber-300 transition-colors leading-snug break-words">
                  {language === 'en' ? service.name : service.hindiName}
                </h3>
                {(language === 'en' || language === 'hinglish') && (
                  <div className="text-xs text-slate-400 font-sans mt-0.5 break-words">
                    {language === 'en' ? service.hindiName : service.name}
                  </div>
                )}
              </div>

              {/* Dedicated Full-Width Dakshina / Payment Box (Never cuts off on mobile) */}
              <div className="mb-3.5 p-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-amber-950/60 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-200">
                    {tr('निर्धारित दक्षिणा (शुल्क):', 'Dakshina (Fee):', 'Nirdharit Dakshina:', 'निर्धारित दक्षिणा:', 'નિર્ધારિત દક્ષિણા:')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {service.discountPercentage}% {tr('छूट', 'OFF', 'Chhoot', 'सवलत', 'છૂટ')}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 line-through font-mono">
                    {service.originalDakshina}
                  </span>
                  <span className="text-base sm:text-xl font-extrabold text-amber-400 font-mono whitespace-nowrap">
                    {service.baseDakshina}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-amber-200/90 italic mb-4 bg-amber-950/30 p-2.5 rounded-xl border border-amber-900/30 break-words">
                "{service.tagline}"
              </p>

              {/* Balanced Perspective: Pros (Shubh Labh) & Precautions (Shastrokta Niyam) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                {/* Pros */}
                <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/25 min-w-0">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{tr('शुभ लाभ एवं महत्व', 'Spiritual Merits', 'Shubh Labh', 'शुभ लाभ', 'શુભ લાભ')}</span>
                  </span>
                  <ul className="space-y-1 text-[11px] text-emerald-200/90 leading-snug">
                    {service.pros.slice(0, 3).map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-emerald-400 font-bold flex-shrink-0">•</span>
                        <span className="break-words">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Precautions & Considerations */}
                <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-600/25 min-w-0">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{tr('शास्त्रोक्त सावधानियां', 'Vedic Precautions', 'Shastrokt Savdhaniyan', 'शास्त्रोक्त दक्षता', 'શાસ્ત્રોક્ત સાવધાનીઓ')}</span>
                  </span>
                  <ul className="space-y-1 text-[11px] text-amber-200/90 leading-snug">
                    {service.precautions.slice(0, 3).map((caution, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-amber-400 font-bold flex-shrink-0">•</span>
                        <span className="break-words">{caution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Duration and Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs text-slate-400 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{tr('अवधि:', 'Duration:', 'Avadhi:', 'कालावधी:', 'સમયગાળો:')} <b>{service.duration}</b></span>
                </span>
                <span className="text-amber-300/80">
                  {service.samagriIncluded
                    ? tr('✓ सम्पूर्ण पूजन सामग्री सहित', '✓ All Puja Samagri Included', '✓ Sampurn Pujan Samagri Sahit')
                    : tr('✓ व्यक्तिगत मार्गदर्शन एवं विचार', '✓ Personal Guidance & Analysis', '✓ Vyaktigat Margdarshan')}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 mt-2 border-t border-amber-900/30 flex items-center gap-2">
              <button
                onClick={() => onSelectServiceToBook(service)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <span>{tr('बुक करें', 'Book Now', 'Book Karein', 'बुक करा', 'બુક કરો')} ({service.baseDakshina})</span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </button>

              <button
                onClick={() => onAskAboutService(service.hindiName)}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-100 border border-slate-700 transition-colors flex-shrink-0"
                title={tr('पण्डित शशांक जी से इसके बारे में पूछें', 'Ask Pandit Shashank Ji about this', 'Pandit Ji se iske bare me puchein')}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Rudrapur Home Puja & Direct Booking Banner inside Puja Booking Tab */}
      <RudrapurLocalBanner
        onOpenBooking={() => {
          if (onOpenCustomBooking) {
            onOpenCustomBooking();
          } else {
            onSelectServiceToBook(PUJA_SERVICES[0]);
          }
        }}
      />
    </section>
  );
};

