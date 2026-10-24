import React, { useState, useEffect } from 'react';
import {
  FamilyMemberProfile,
  FamilyRelation,
  RELATION_LABELS,
  getFamilyVaultProfiles,
  upsertFamilyMember,
  deleteFamilyMember,
  setPrimaryFamilyMember,
} from '../utils/familyVaultStorage';
import { setActiveProfile } from '../utils/autoPersonalization';
import { vedicAudio } from '../utils/audioSynthesizer';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Compass,
  HeartHandshake,
  Baby,
  X,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface FamilyVaultSectionProps {
  onOpenKundaliWithProfile: (profile: FamilyMemberProfile) => void;
  onOpenMilanWithProfile: (profile: FamilyMemberProfile) => void;
  onOpenRashifalWithRashi: (rashiName: string) => void;
}

export const FamilyVaultSection: React.FC<FamilyVaultSectionProps> = ({
  onOpenKundaliWithProfile,
  onOpenMilanWithProfile,
  onOpenRashifalWithRashi,
}) => {
  const { tr } = useLanguage();

  const [profiles, setProfiles] = useState<FamilyMemberProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState<string>('');
  const [relation, setRelation] = useState<FamilyRelation>('self');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dob, setDob] = useState<string>('');
  const [birthTime, setBirthTime] = useState<string>('12:00');
  const [birthPlace, setBirthPlace] = useState<string>('रुद्रपुर, उत्तराखण्ड');
  const [gotra, setGotra] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string>('');

  const loadProfiles = () => {
    setProfiles(getFamilyVaultProfiles());
  };

  useEffect(() => {
    loadProfiles();

    const handleVaultUpdate = () => loadProfiles();
    window.addEventListener('panditji_vault_updated', handleVaultUpdate);
    return () => window.removeEventListener('panditji_vault_updated', handleVaultUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleOpenAddModal = (member?: FamilyMemberProfile) => {
    if (member) {
      setEditingId(member.id);
      setName(member.name);
      setRelation(member.relation);
      setGender(member.gender);
      setDob(member.dob);
      setBirthTime(member.birthTime);
      setBirthPlace(member.birthPlace);
      setGotra(member.gotra || '');
      setNotes(member.notes || '');
      setIsPrimary(member.isPrimary);
    } else {
      setEditingId(null);
      setName('');
      setRelation(profiles.length === 0 ? 'self' : 'child_son');
      setGender('male');
      setDob('');
      setBirthTime('12:00');
      setBirthPlace('रुद्रपुर, उत्तराखण्ड');
      setGotra('');
      setNotes('');
      setIsPrimary(profiles.length === 0);
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('कृपया सदस्य का नाम दर्ज करें।');
      return;
    }
    if (!dob) {
      setFormError('कृपया जन्म तिथि दर्ज करें।');
      return;
    }
    if (!birthTime) {
      setFormError('कृपया जन्म समय दर्ज करें।');
      return;
    }

    try {
      const savedProfile = upsertFamilyMember({
        id: editingId || undefined,
        name: name.trim(),
        relation,
        gender,
        dob,
        birthTime,
        birthPlace: birthPlace.trim() || 'रुद्रपुर, उत्तराखण्ड',
        gotra: gotra.trim(),
        notes: notes.trim(),
        isPrimary,
      });

      if (isPrimary || profiles.length === 0) {
        setActiveProfile(savedProfile);
      }

      vedicAudio.playCrispTempleBell(0.75);
      showToast(
        editingId
          ? 'सदस्य की जानकारी सफलतापूर्वक अपडेट हो गई!'
          : `'${name.trim()}' को आपकी फैमिली वॉल्ट में सुरक्षित जोड़ दिया गया है!`
      );
      setIsModalOpen(false);
      loadProfiles();
    } catch (err) {
      console.error(err);
      setFormError('प्रोफ़ाइल सहेजने में त्रुटि हुई।');
    }
  };

  const handleDelete = (id: string, memberName: string) => {
    if (window.confirm(`क्या आप '${memberName}' को अपनी फैमिली वॉल्ट से हटाना चाहते हैं?`)) {
      deleteFamilyMember(id);
      loadProfiles();
      showToast(`'${memberName}' को वॉल्ट से हटा दिया गया।`);
    }
  };

  const handleSetPrimary = (id: string, memberName: string) => {
    setPrimaryFamilyMember(id);
    const updatedProfiles = getFamilyVaultProfiles();
    const target = updatedProfiles.find((p) => p.id === id);
    if (target) {
      setActiveProfile(target);
    }
    loadProfiles();
    vedicAudio.playCrispTempleBell(0.65);
    showToast(`'${memberName}' को मुख्य प्रोफ़ाइल (Primary Profile) बनाया गया। अब दैनिक नोटिफिकेशन इन्हीं के नाम व राशि पर मिलेंगे।`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d1006] via-[#241508] to-[#0c1220] border-2 border-amber-500/70 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-yellow-300 text-xs font-bold mb-1">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{tr('मेरी फैमिली • कुण्डली वॉल्ट', 'My Family • Kundali Vault')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-vedic text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-400">
              {tr('पारिवारिक कुण्डली एवं जन्म विवरण वॉल्ट', 'Family Astrological Profiles & Birth Vault')}
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/80 max-w-2xl">
              {tr(
                'अपने परिवार के सभी सदस्यों (माता-पिता, जीवनसाथी, बच्चे) का जन्म विवरण एक बार सुरक्षित सहेजें। बार-बार तारीख और समय डालने की आवश्यकता नहीं रहेगी।',
                'Save birth details for your entire family once securely. Instantly generate Kundali, Matchmaking, and Daily Horoscope with 1 click.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg border border-yellow-200 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>{tr('नया सदस्य जोड़ें', 'Add Family Member')}</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#121929]/90 border border-amber-700/40 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl">
            👨‍👩‍👧‍👦
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-vedic text-amber-100">
            {tr('आपकी फैमिली वॉल्ट अभी खाली है', 'Your Family Vault is Currently Empty')}
          </h3>
          <p className="text-xs sm:text-sm text-amber-200/70 max-w-md mx-auto">
            {tr(
              'अपना या परिवार के सदस्यों का जन्म विवरण जोड़ें ताकि एक क्लिक में कुण्डली, गुण मिलान और दैनिक राशिफल देख सकें।',
              'Add yourself and your family members to access instant Kundali generation and personalized daily horoscope.'
            )}
          </p>
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{tr('पहला सदस्य जोड़ें', 'Add First Member')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((profile) => {
            const relInfo = RELATION_LABELS[profile.relation] || RELATION_LABELS.other;
            return (
              <div
                key={profile.id}
                className={`relative overflow-hidden p-5 rounded-3xl border transition-all shadow-xl flex flex-col justify-between gap-4 ${
                  profile.isPrimary
                    ? 'bg-gradient-to-br from-[#1c1206] via-[#1a140a] to-[#0c1220] border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                    : 'bg-[#121929]/90 border-amber-700/40 hover:border-amber-500/60'
                }`}
              >
                {/* Top Row: Name, Relation & Primary Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base sm:text-lg font-black font-vedic text-yellow-200 truncate">
                          {profile.name}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-yellow-300 border border-amber-500/40">
                          <span>{relInfo.icon}</span>
                          <span>{relInfo.hi}</span>
                        </span>
                        {profile.isPrimary && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-xs">
                            <Star className="w-3 h-3 fill-current" />
                            <span>मुख्य प्रोफ़ाइल (Primary)</span>
                          </span>
                        )}
                      </div>

                      {/* Birth Details Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-[11px] text-amber-200/90 bg-black/40 p-2.5 rounded-xl border border-amber-900/40">
                        <div className="flex items-center gap-1 truncate">
                          <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="truncate">{profile.dob}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="truncate">{profile.birthTime}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate col-span-2 sm:col-span-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="truncate">{profile.birthPlace}</span>
                        </div>
                      </div>

                      {/* Derived Vedic Astrological Highlights */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
                        <div className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-700/50 text-amber-200">
                          <span className="text-[10px] text-amber-400 block font-semibold">चन्द्र राशि</span>
                          <span className="font-bold font-vedic text-yellow-300">{profile.rashi}</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-700/50 text-amber-200">
                          <span className="text-[10px] text-amber-400 block font-semibold">जन्म नक्षत्र</span>
                          <span className="font-bold font-vedic text-yellow-300">
                            {profile.nakshatra} (चरण {profile.nakshatraPada})
                          </span>
                        </div>
                        <div className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-700/50 text-amber-200">
                          <span className="text-[10px] text-amber-400 block font-semibold">लग्न</span>
                          <span className="font-bold font-vedic text-amber-100">{profile.lagna}</span>
                        </div>
                      </div>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal(profile)}
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/30 text-amber-300 cursor-pointer"
                        title="जानकारी संपादित करें"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(profile.id, profile.name)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 cursor-pointer"
                        title="वॉल्ट से हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Quick-Action Buttons */}
                <div className="pt-3 border-t border-amber-800/40 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* View Kundali */}
                    <button
                      type="button"
                      onClick={() => onOpenKundaliWithProfile(profile)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 font-bold text-xs border border-amber-700/50 transition-colors flex items-center gap-1 cursor-pointer"
                      title="सम्पूर्ण जन्म कुण्डली देखें"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>{tr('कुण्डली देखें', 'Kundali')}</span>
                    </button>

                    {/* Milan */}
                    <button
                      type="button"
                      onClick={() => onOpenMilanWithProfile(profile)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-700/50 transition-colors flex items-center gap-1 cursor-pointer"
                      title="36 गुण मिलान में लोड करें"
                    >
                      <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
                      <span>{tr('गुण मिलान', 'Milan')}</span>
                    </button>

                    {/* Today Horoscope */}
                    <button
                      type="button"
                      onClick={() => onOpenRashifalWithRashi(profile.rashi)}
                      className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-yellow-300 font-bold text-xs border border-amber-700/50 transition-colors flex items-center gap-1 cursor-pointer"
                      title="दैनिक राशिफल देखें"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{tr('राशिफल', 'Rashifal')}</span>
                    </button>
                  </div>

                  {!profile.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(profile.id, profile.name)}
                      className="text-[11px] font-bold text-amber-400 hover:text-yellow-300 underline cursor-pointer"
                    >
                      ★ मुख्य बनाएं
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1424] border-2 border-amber-500/70 p-5 sm:p-7 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-amber-800/40 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold font-vedic text-yellow-200">
                  {editingId ? 'सदस्य विवरण संपादित करें' : 'नया सदस्य जोड़ें'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-amber-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveMember} className="space-y-3.5">
              {/* Name & Relation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                    नाम (Full Name) *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="उदा. राहुल शर्मा"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-700/50 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                    संबंध (Relation)
                  </label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value as FamilyRelation)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-700/50 text-xs text-amber-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {Object.entries(RELATION_LABELS).map(([key, item]) => (
                      <option key={key} value={key} className="bg-slate-900 text-amber-100">
                        {item.icon} {item.hi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                  लिंग (Gender)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'male', label: 'पुरुष (Male)' },
                    { id: 'female', label: 'महिला (Female)' },
                    { id: 'other', label: 'अन्य (Other)' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        gender === g.id
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold shadow-sm'
                          : 'bg-slate-950 text-amber-200/70 border-amber-900/50 hover:bg-slate-900'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* DOB & Birth Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                    जन्म तिथि (Date of Birth) *
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-700/50 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                    जन्म समय (Time of Birth) *
                  </label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-700/50 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Birth Place */}
              <div>
                <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                  जन्म स्थान (Birth Place)
                </label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="रुद्रपुर, उत्तराखण्ड (या अन्य शहर)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-700/50 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Gotra & Primary Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                    गोत्र (Gotra - वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    value={gotra}
                    onChange={(e) => setGotra(e.target.value)}
                    placeholder="उदा. भारद्वाज, कश्यप..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-700/50 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-200 font-bold">
                    <input
                      type="checkbox"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded border-amber-700 focus:ring-0 cursor-pointer"
                    />
                    <span>मुख्य प्रोफ़ाइल बनाएं (Set as Primary)</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-800/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 font-bold text-xs border border-amber-900/50 cursor-pointer"
                >
                  रद्द करें
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md border border-yellow-200 cursor-pointer"
                >
                  {editingId ? 'अपडेट करें' : 'वॉल्ट में सहेजें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
