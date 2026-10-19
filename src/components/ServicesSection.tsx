import React, { useState } from 'react';
import { PujaService, PujaCategory } from '../types';
import { PUJA_SERVICES } from '../data/mockData';
import { Sparkles, Clock, CheckCircle2, AlertCircle, MessageSquare, ArrowRight, Home, Flame, Compass, Tag } from 'lucide-react';

interface ServicesSectionProps {
  onSelectServiceToBook: (service: PujaService) => void;
  onAskAboutService: (serviceName: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectServiceToBook,
  onAskAboutService,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PujaCategory | 'all'>('all');

  const categories: Array<{ id: PujaCategory | 'all'; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: 'सम्पूर्ण सेवाएं (All)', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'ghar_ki_puja', label: 'घर की पूजा (Rudrapur)', icon: <Home className="w-4 h-4" /> },
    { id: 'anushthan_jap', label: 'अनुष्ठान एवं जप', icon: <Flame className="w-4 h-4" /> },
    { id: 'jyotish_kundali', label: 'ज्योतिष व कुंडली', icon: <Compass className="w-4 h-4" /> },
  ];

  const filteredServices = selectedCategory === 'all'
    ? PUJA_SERVICES
    : PUJA_SERVICES.filter((s) => s.category === selectedCategory);

  return (
    <section className="w-full max-w-full overflow-x-hidden space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>वैदिक अनुष्ठान एवं परामर्श सूची</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-vedic text-amber-100 leading-snug">
            शास्त्रोक्त पूजा, हवन एवं ज्योतिष सेवाएं
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-2xl">
            प्रत्येक अनुष्ठान के शुभ लाभ एवं शास्त्रसम्मत नियमों (Pros &amp; Precautions) का संतुलित विवरण।
            रुद्रपुर (उत्तराखण्ड) में आपके घर पर वैदिक पूजा एवं फोन/वीडियो कॉल पर व्यक्तिगत ज्योतिष परामर्श।
          </p>
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
                      ? 'Ghar ki Puja (Rudrapur)'
                      : service.category === 'anushthan_jap'
                      ? 'Anushthan & Jap'
                      : 'Jyotish & Kundali'}
                  </span>
                  {service.specialOfferTag && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{service.specialOfferTag}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold font-vedic text-amber-100 group-hover:text-amber-300 transition-colors leading-snug break-words">
                  {service.hindiName}
                </h3>
                <div className="text-xs text-slate-400 font-sans mt-0.5 break-words">{service.name}</div>
              </div>

              {/* Dedicated Full-Width Dakshina / Payment Box (Never cuts off on mobile) */}
              <div className="mb-3.5 p-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-amber-950/60 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-200">
                    निर्धारित दक्षिणा (शुल्क):
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {service.discountPercentage}% छूट
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
                    <span>शुभ लाभ (Spiritual Merits)</span>
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
                    <span>शास्त्रोक्त सावधानियां (Precautions)</span>
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
                  <span>अवधि: <b>{service.duration}</b></span>
                </span>
                <span className="text-amber-300/80">
                  {service.samagriIncluded ? '✓ सम्पूर्ण पूजन सामग्री सहित' : '✓ व्यक्तिगत मार्गदर्शन एवं विचार'}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 mt-2 border-t border-amber-900/30 flex items-center gap-2">
              <button
                onClick={() => onSelectServiceToBook(service)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <span>बुक करें ({service.baseDakshina})</span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </button>

              <button
                onClick={() => onAskAboutService(service.name)}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-100 border border-slate-700 transition-colors flex-shrink-0"
                title="पण्डित शशांक जी से AI Chat में इसके बारे में पूछें"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
