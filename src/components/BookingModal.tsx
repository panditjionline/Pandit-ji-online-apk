import React, { useState, useEffect } from 'react';
import { PujaService, BookingRequest, BookingType, UserMobileAccount } from '../types';
import { PUJA_SERVICES, RUDRAPUR_LOCALITIES } from '../data/mockData';
import { PanditPortrait } from './PanditPortrait';
import { X, MapPin, Phone, MessageCircle, CheckCircle2, Tag, Clock, ShieldCheck } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: PujaService | null;
  onBookingSuccess: (booking: BookingRequest) => void;
  currentUser?: UserMobileAccount | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preSelectedService,
  onBookingSuccess,
  currentUser,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('kundali-paramarsh');
  const [bookingType, setBookingType] = useState<BookingType>('phone_consultation');
  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('07:30 AM - प्रातःकाल (Pratahkaal)');

  // User & Sankalp form fields
  const [yajmanName, setYajmanName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [localityRudrapur, setLocalityRudrapur] = useState<string>('');
  const [customAddress, setCustomAddress] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [birthTime, setBirthTime] = useState<string>('');
  const [birthPlace, setBirthPlace] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Booking status
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRequest | null>(null);

  // Set default date to tomorrow
  useEffect(() => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    setDate(tmrw.toISOString().split('T')[0]);
  }, []);

  // Reset confirmation view when modal opens fresh
  useEffect(() => {
    if (isOpen) {
      setConfirmedBooking(null);
    }
  }, [isOpen]);

  // Pre-fill from logged-in mobile user
  useEffect(() => {
    if (isOpen && currentUser) {
      setPhone(currentUser.phone || '');
      if (currentUser.name) setYajmanName(currentUser.name);
      if (currentUser.localityRudrapur) setLocalityRudrapur(currentUser.localityRudrapur);
      if (currentUser.dob) setBirthDate(currentUser.dob);
      if (currentUser.birthTime) setBirthTime(currentUser.birthTime);
      if (currentUser.birthPlace) setBirthPlace(currentUser.birthPlace);
    }
  }, [isOpen, currentUser]);

  // Update selected service if passed via prop
  useEffect(() => {
    if (preSelectedService) {
      setSelectedServiceId(preSelectedService.id);
      if (preSelectedService.category === 'jyotish_kundali') {
        setBookingType('phone_consultation');
      } else {
        setBookingType('in_person_rudrapur');
      }
    }
  }, [preSelectedService]);

  if (!isOpen) return null;

  const currentService = PUJA_SERVICES.find((s) => s.id === selectedServiceId) || PUJA_SERVICES[0];
  const isKundaliService = currentService.category === 'jyotish_kundali';

  const getWhatsAppBookingUrl = (b: BookingRequest) => {
    const text = `*पण्डित जी ऑनलाइन - नवीन पूजा/परामर्श बुकिंग*
----------------------------------------
*बुकिंग आईडी:* ${b.id}
*अनुष्ठान / परामर्श:* ${currentService.hindiName} (${b.serviceName})
*निर्धारित दक्षिणा (Offer):* ${currentService.baseDakshina} *(मूल ${currentService.originalDakshina} - ${currentService.discountPercentage}% छूट)*
*प्रकार:* ${b.bookingType === 'in_person_rudrapur' ? 'घर पर पूजा (रुद्रपुर, उत्तराखंड)' : 'व्यक्तिगत फोन / वीडियो कॉल परामर्श'}
*दिनांक:* ${b.date}
*मुहूर्त समय:* ${b.timeSlot}
----------------------------------------
*यजमान नाम:* ${b.yajmanName}
*मोबाइल नंबर:* ${b.phone}
${b.bookingType === 'in_person_rudrapur' ? `*रुद्रपुर क्षेत्र:* ${b.localityRudrapur}\n*घर का पता:* ${b.address || 'रुद्रपुर'}` : '*माध्यम:* फोन / व्हाट्सएप वीडियो कॉल'}
${b.birthDate ? `*जन्म विवरण:* ${b.birthDate} | ${b.birthTime || 'समय नहीं'} | ${b.birthPlace || 'स्थान नहीं'}` : ''}
${b.specialNotes ? `*विशेष प्रार्थना / प्रश्न:* ${b.specialNotes}` : ''}
----------------------------------------
राधे राधे पण्डित शशांक शर्मा जी! कृपया मेरी यह बुकिंग स्वीकृत करें।`;

    return `https://wa.me/917017279043?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const booking: BookingRequest = {
      id: `PJO-${Date.now().toString().slice(-6)}`,
      serviceId: currentService.id,
      serviceName: currentService.name,
      bookingType,
      date,
      timeSlot,
      yajmanName,
      phone,
      localityRudrapur: bookingType === 'in_person_rudrapur' ? localityRudrapur : undefined,
      address: bookingType === 'in_person_rudrapur' ? customAddress : 'फोन / व्हाट्सएप कॉल परामर्श',
      birthDate: isKundaliService ? birthDate : undefined,
      birthTime: isKundaliService ? birthTime : undefined,
      birthPlace: isKundaliService ? birthPlace : undefined,
      specialNotes,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // Save privately to server store (only accessible with user's own mobile login)
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    }).catch(() => {});

    setConfirmedBooking(booking);
    onBookingSuccess(booking);

    // Immediately redirect / open Pandit Shashank Sharma's WhatsApp with the full booking details
    const directWhatsAppUrl = getWhatsAppBookingUrl(booking);
    const linkEl = document.createElement('a');
    linkEl.href = directWhatsAppUrl;
    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';
    document.body.appendChild(linkEl);
    linkEl.click();
    document.body.removeChild(linkEl);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex flex-col items-center justify-start p-2.5 sm:p-5 pt-12 sm:pt-6">
      <div className="relative w-full max-w-2xl bg-[#0d1322] border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-950 via-[#1c120a] to-amber-950 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-amber-700/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <PanditPortrait size="sm" showBadge={false} />
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold font-vedic text-amber-100 leading-snug">
                वैदिक पूजा एवं ज्योतिष परामर्श बुकिंग
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-300 font-medium truncate">
                सीधे पं. शशांक शर्मा जी के WhatsApp (7017279043) पर गोपनीय बुकिंग
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-200 hover:bg-amber-900/40 transition-colors flex-shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 max-h-[82vh] overflow-y-auto">
          {confirmedBooking ? (
            /* Confirmation Receipt View */
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center py-4 bg-emerald-950/25 border border-emerald-500/40 rounded-2xl p-4 sm:p-5">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-lg sm:text-xl font-bold font-vedic text-emerald-200">
                  आपकी बुकिंग पण्डित जी के WhatsApp पर तैयार है!
                </h4>
                <p className="text-xs sm:text-sm text-emerald-300/80 mt-1">
                  बुकिंग संदर्भ संख्या: <span className="font-mono font-bold text-amber-300">{confirmedBooking.id}</span>
                </p>
                <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
                  आपकी बुकिंग पूरी तरह गोपनीय है और किसी अन्य यूजर को दिखाई नहीं देगी। यदि WhatsApp अपने आप नहीं खुला है, तो नीचे दिए गए हरे बटन पर क्लिक करके सीधे पण्डित शशांक शर्मा जी को संदेश भेजें।
                </p>
              </div>

              {/* Receipt Card with Full Payment / Dakshina Display */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-900/40 text-xs sm:text-sm space-y-2.5">
                <div className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-2">
                  <span className="text-slate-400">अनुष्ठान / सेवा:</span>
                  <span className="font-bold text-amber-200 text-right">{currentService.hindiName}</span>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="text-slate-400">निर्धारित दक्षिणा (शुल्क):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 line-through font-mono">{currentService.originalDakshina}</span>
                    <span className="font-extrabold text-emerald-400 font-mono text-sm sm:text-base">{currentService.baseDakshina}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {currentService.discountPercentage}% छूट
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-2">
                  <span className="text-slate-400">प्रकार:</span>
                  <span className="font-medium text-amber-300 text-right">
                    {confirmedBooking.bookingType === 'in_person_rudrapur'
                      ? 'गृह पूजा (रुद्रपुर में आपके घर पर)'
                      : 'फोन / वीडियो कॉल परामर्श'}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-2">
                  <span className="text-slate-400">दिनांक एवं समय:</span>
                  <span className="font-medium text-amber-100 text-right">{confirmedBooking.date} • {confirmedBooking.timeSlot}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-2">
                  <span className="text-slate-400">यजमान का नाम:</span>
                  <span className="font-medium text-amber-100 text-right">{confirmedBooking.yajmanName}</span>
                </div>
                {confirmedBooking.localityRudrapur && (
                  <div className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-2">
                    <span className="text-slate-400">रुद्रपुर क्षेत्र:</span>
                    <span className="font-medium text-amber-100 text-right">{confirmedBooking.localityRudrapur}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={getWhatsAppBookingUrl(confirmedBooking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  <span>सीधे पण्डित जी के WhatsApp पर भेजें</span>
                </a>

                <button
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 🌟 TOPMOST: 90% DISCOUNT SPECIAL OFFER BANNER (₹1,000 -> मात्र ₹100) */}
              <div
                onClick={() => {
                  setSelectedServiceId('kundali-paramarsh');
                  setBookingType('phone_consultation');
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedServiceId === 'kundali-paramarsh'
                    ? 'bg-gradient-to-r from-amber-950 via-[#221307] to-emerald-950 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400/50'
                    : 'bg-gradient-to-r from-amber-950/90 via-[#1b1008] to-slate-900 border-amber-500/80 hover:border-yellow-300 shadow-lg hover:scale-[1.01]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm">
                        <span>🔥 90% महा छूट ऑफर</span>
                      </span>
                      <span className="text-[11px] text-amber-300 font-bold">
                        सीमित समय विशेष दक्षिणा
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold font-vedic text-yellow-200">
                      व्यक्तिगत ज्योतिष एवं सम्पूर्ण कुंडली परामर्श (1-on-1)
                    </h4>
                    <p className="text-[11px] text-amber-200/90">
                      आचार्य पण्डित शशांक शर्मा जी से फोन/वीडियो कॉल पर जन्मपत्री, भविष्यफल व अचूक वैदिक उपाय
                    </p>
                  </div>

                  <div className="flex items-center sm:flex-col justify-between sm:items-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-900/40">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-slate-400 line-through font-mono">₹1,000</span>
                      <span className="text-lg sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
                        मात्र ₹100
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                        90% बचत
                      </span>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md ${
                        selectedServiceId === 'kundali-paramarsh'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950'
                      }`}
                    >
                      {selectedServiceId === 'kundali-paramarsh' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                          <span>✓ ऑफर सक्रिय है (मात्र ₹100)</span>
                        </>
                      ) : (
                        <span>🎁 यह 90% ऑफर चुनें (मात्र ₹100)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy & Direct WhatsApp Assurance Strip */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2 text-[11px] sm:text-xs text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <b>100% गोपनीय बुकिंग:</b> आपकी जानकारी किसी अन्य को नहीं दिखेगी, सीधे पण्डित शशांक शर्मा जी के WhatsApp (<b>7017279043</b>) पर जाएगी।
                </span>
              </div>

              {/* Service Selection */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-amber-300">
                  पूजा / अनुष्ठान / परामर्श चयन करें
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedServiceId(newId);
                    const found = PUJA_SERVICES.find((s) => s.id === newId);
                    if (found?.category === 'jyotish_kundali') {
                      setBookingType('phone_consultation');
                    } else {
                      setBookingType('in_person_rudrapur');
                    }
                  }}
                  className="w-full bg-slate-900 border border-amber-900/60 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                >
                  {/* Prioritize the 90% offer at the top of the dropdown */}
                  {[
                    ...PUJA_SERVICES.filter((s) => s.id === 'kundali-paramarsh'),
                    ...PUJA_SERVICES.filter((s) => s.id !== 'kundali-paramarsh'),
                  ].map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id === 'kundali-paramarsh' ? '🔥 [90% महा छूट] ' : ''}
                      {s.baseDakshina} — {s.hindiName.split(' (')[0]} ({s.discountPercentage}% छूट)
                    </option>
                  ))}
                </select>

                {/* Dedicated Full-Width Payment / Dakshina Summary Card */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-emerald-950/50 border border-amber-500/50 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-xs font-bold text-amber-200">
                        निर्धारित दक्षिणा / शुल्क (Payment):
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 line-through font-mono">
                        {currentService.originalDakshina}
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono bg-emerald-950/70 px-2.5 py-0.5 rounded-lg border border-emerald-500/40 whitespace-nowrap">
                        {currentService.baseDakshina}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-300/80 border-t border-amber-900/40 pt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span>अवधि: {currentService.duration}</span>
                    </span>
                    <span className="text-emerald-300 font-semibold">
                      ✓ {currentService.discountPercentage}% विशेष छूट लागू (कोई अग्रिम ऑनलाइन पेमेंट कटौती नहीं)
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Mode: Home Puja in Rudrapur vs Phone Consultation */}
              {isKundaliService ? (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/40 space-y-2">
                  <label className="block text-xs font-semibold text-amber-300">
                    परामर्श माध्यम चुनें (Consultation Medium)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingType('phone_consultation')}
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer flex items-center gap-2 ${
                        bookingType === 'phone_consultation'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900 text-amber-200 border-amber-900/60 hover:bg-slate-800'
                      }`}
                    >
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="block font-bold">फोन / व्हाट्सएप कॉल</span>
                        <span className="text-[10px] opacity-80 block">घर बैठे सीधा परामर्श (मात्र ₹100)</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingType('in_person_rudrapur')}
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer flex items-center gap-2 ${
                        bookingType === 'in_person_rudrapur'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900 text-amber-200 border-amber-900/60 hover:bg-slate-800'
                      }`}
                    >
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="block font-bold">प्रत्यक्ष भेंट (रुद्रपुर)</span>
                        <span className="text-[10px] opacity-80 block">पण्डित जी से आमने-सामने</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/40 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-amber-200 block">
                      आयोजन स्थल: आपके घर पर (रुद्रपुर, उत्तराखण्ड)
                    </span>
                    <p className="text-[11px] text-amber-300/80 mt-0.5">
                      पण्डित शशांक शर्मा जी स्वयं सम्पूर्ण वैदिक सामग्री व विधि-विधान सहित आपके घर पधारकर पूजा सम्पन्न कराएंगे।
                    </p>
                  </div>
                </div>
              )}

              {/* Date & Time Slot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    इच्छित तिथि (Date)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-900/60 rounded-xl px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    शुभ समय स्लॉट (Muhurat Slot)
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-900/60 rounded-xl px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="07:30 AM - प्रातःकाल (Pratahkaal Shubh Muhurat)">07:30 AM - प्रातःकाल (Pratahkaal)</option>
                    <option value="11:45 AM - अभिजित मुहूर्त (Abhijit Muhurat)">11:45 AM - अभिजित मुहूर्त (अति शुभ)</option>
                    <option value="04:30 PM - सायंकाल संध्या (Sandhya Kaal)">04:30 PM - सायंकाल संध्या</option>
                    <option value="07:00 PM - रात्रिकालीन अनुष्ठान (Night Anushthan)">07:00 PM - रात्रिकालीन अनुष्ठान</option>
                  </select>
                </div>
              </div>

              {/* Yajman Details: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    यजमान का नाम *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. राहुल शर्मा"
                    value={yajmanName}
                    onChange={(e) => setYajmanName(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-900/60 rounded-xl px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    मोबाइल / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="उदा. 98370XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-900/60 rounded-xl px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Locality / Area Input (If In-Person selected) */}
              {bookingType === 'in_person_rudrapur' && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-900/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>क्षेत्र (Chetr):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="अपना क्षेत्र खुद लिखें (उदा. इंदिरा कॉलोनी, आवास विकास...)"
                      value={localityRudrapur}
                      onChange={(e) => setLocalityRudrapur(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-900/60 rounded-lg px-2.5 py-2 text-xs text-amber-100 placeholder:text-slate-400 font-medium"
                    />

                    <input
                      type="text"
                      placeholder="मकान नं, गली, लैंडमार्क..."
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-900/60 rounded-lg px-2.5 py-2 text-xs text-amber-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* Kundali Specific Details (if consultation selected) */}
              {isKundaliService && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-700/30 space-y-2">
                  <span className="text-xs font-semibold text-amber-300 block">
                    कुंडली विश्लेषण हेतु जन्म विवरण (वैकल्पिक यदि उपलब्ध हो):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="date"
                      placeholder="जन्म तिथि"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-900/40 rounded-lg p-2 text-xs text-amber-100"
                    />
                    <input
                      type="time"
                      placeholder="जन्म समय"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-900/40 rounded-lg p-2 text-xs text-amber-100"
                    />
                    <input
                      type="text"
                      placeholder="जन्म स्थान (शहर/राज्य)"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-900/40 rounded-lg p-2 text-xs text-amber-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* Special Notes or Questions */}
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  विशेष मन्नत / संकल्प विवरण (Special Notes)
                </label>
                <textarea
                  rows={2}
                  placeholder="उदा. नए मकान की नींव पूजा, या विशेष स्वास्थ्य शांति हेतु..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-900/60 rounded-xl px-3 py-2 text-xs text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  रद्द करें
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 hover:from-emerald-500 hover:to-green-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>सीधे WhatsApp पर बुकिंग भेजें ({currentService.baseDakshina})</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
