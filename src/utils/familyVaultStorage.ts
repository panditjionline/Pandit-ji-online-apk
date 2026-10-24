/**
 * Family Profile & Kundali Vault ("Meri Family") Storage Manager
 * Persists family member astrological profiles securely in localStorage
 */

import { generateSampurnKundali } from './sampurnKundali';
import { getVedicDetailsFromName } from './kundaliMilan';

export type FamilyRelation =
  | 'self' // स्वयं
  | 'spouse' // पति / पत्नी
  | 'child_son' // पुत्र
  | 'child_daughter' // पुत्री
  | 'father' // पिता
  | 'mother' // माता
  | 'brother' // भाई
  | 'sister' // बहन
  | 'friend' // मित्र
  | 'other'; // अन्य

export interface FamilyMemberProfile {
  id: string;
  name: string;
  relation: FamilyRelation;
  relationCustom?: string;
  gender: 'male' | 'female' | 'other';
  dob: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthPlace: string;
  rashi: string;
  rashiLord: string;
  nakshatra: string;
  nakshatraPada: number;
  lagna: string;
  gotra?: string;
  isPrimary: boolean; // Used for personalized push notifications & daily greeting
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const VAULT_STORAGE_KEY = 'panditji_family_vault_v1';

function getVaultKey(phone?: string): string {
  if (phone) {
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean) return `panditji_family_vault_${clean}`;
  }
  try {
    const active = localStorage.getItem('panditji_active_mobile_phone');
    if (active) {
      const clean = active.replace(/\D/g, '').slice(-10);
      if (clean) return `panditji_family_vault_${clean}`;
    }
  } catch {}
  return VAULT_STORAGE_KEY;
}

export const RELATION_LABELS: Record<FamilyRelation, { hi: string; en: string; icon: string }> = {
  self: { hi: 'स्वयं (Self)', en: 'Self', icon: '👤' },
  spouse: { hi: 'जीवनसाथी (Spouse)', en: 'Spouse', icon: '💍' },
  child_son: { hi: 'पुत्र (Son)', en: 'Son', icon: '👦' },
  child_daughter: { hi: 'पुत्री (Daughter)', en: 'Daughter', icon: '👧' },
  father: { hi: 'पिता (Father)', en: 'Father', icon: '👴' },
  mother: { hi: 'माता (Mother)', en: 'Mother', icon: '👵' },
  brother: { hi: 'भाई (Brother)', en: 'Brother', icon: '🧑' },
  sister: { hi: 'बहन (Sister)', en: 'Sister', icon: '👩' },
  friend: { hi: 'मित्र (Friend)', en: 'Friend', icon: '🤝' },
  other: { hi: 'अन्य (Other)', en: 'Other', icon: '✨' },
};

export function getFamilyVaultProfiles(phone?: string): FamilyMemberProfile[] {
  try {
    const key = getVaultKey(phone);
    const raw = localStorage.getItem(key);
    let parsedList: FamilyMemberProfile[] = [];
    if (!raw || raw === 'undefined' || raw === 'null') {
      if (key !== VAULT_STORAGE_KEY) {
        // Fallback to legacy key only if empty
        const legacy = localStorage.getItem(VAULT_STORAGE_KEY);
        if (legacy && legacy !== 'undefined' && legacy !== 'null') {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length > 0) parsedList = parsed;
        }
      }
    } else {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) parsedList = parsed;
    }

    let repaired = false;
    const normalized = parsedList.map((m) => {
      if (
        m &&
        (m.name?.toLowerCase().includes('pragya') || m.name?.includes('प्रज्ञा')) &&
        m.dob === '1998-05-12'
      ) {
        repaired = true;
        const fixedDob = '1996-11-06';
        const fixedTime = m.birthTime === '18:20' ? '14:15' : m.birthTime || '14:15';
        const fixedPlace =
          m.birthPlace === 'हरिद्वार, उत्तराखण्ड' ? 'रुद्रपुर, उत्तराखण्ड' : m.birthPlace || 'रुद्रपुर, उत्तराखण्ड';
        const astro = deriveVedicDetailsForProfile(m.name, fixedDob, fixedTime, fixedPlace);
        return {
          ...m,
          dob: fixedDob,
          birthTime: fixedTime,
          birthPlace: fixedPlace,
          ...astro,
        };
      }
      return m;
    });

    if (repaired) {
      try {
        localStorage.setItem(key, JSON.stringify(normalized));
      } catch {}
    }

    return normalized;
  } catch (err) {
    console.error('Error loading family vault:', err);
    return [];
  }
}

export function saveFamilyVaultProfiles(profiles: FamilyMemberProfile[], phone?: string): void {
  try {
    const key = getVaultKey(phone);
    localStorage.setItem(key, JSON.stringify(profiles));
    // Dispatch event so components react in real-time
    window.dispatchEvent(new CustomEvent('panditji_vault_updated', { detail: profiles }));
  } catch (err) {
    console.error('Error saving family vault:', err);
  }
}

export type CalculationViewingMode = 'astronomical' | 'name_rashi';

const CALC_MODE_STORAGE_KEY = 'panditji_calc_viewing_mode_v1';

export function getCalculationViewingMode(): CalculationViewingMode {
  try {
    const saved = localStorage.getItem(CALC_MODE_STORAGE_KEY);
    if (saved === 'name_rashi' || saved === 'astronomical') {
      return saved;
    }
  } catch (err) {
    console.error('Error reading calculation mode preference:', err);
  }
  return 'astronomical';
}

export function setCalculationViewingMode(mode: CalculationViewingMode): void {
  try {
    localStorage.setItem(CALC_MODE_STORAGE_KEY, mode);
    window.dispatchEvent(
      new CustomEvent('display_preference_changed', { detail: mode })
    );
  } catch (err) {
    console.error('Error setting calculation mode preference:', err);
  }
}

/**
 * Returns YYYY-MM-DD key in IST (+05:30) for midnight date-watcher comparisons
 */
export function getCurrentISTDateKey(now: Date = new Date()): string {
  const istTime = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
  const y = istTime.getFullYear();
  const m = String(istTime.getMonth() + 1).padStart(2, '0');
  const d = String(istTime.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Milliseconds remaining until 12:00:01 AM IST
 */
export function getMsUntilNextISTMidnight(now: Date = new Date()): number {
  const istNow = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
  const nextMidnight = new Date(
    istNow.getFullYear(),
    istNow.getMonth(),
    istNow.getDate() + 1,
    0,
    0,
    2
  );
  return Math.max(5000, nextMidnight.getTime() - istNow.getTime());
}

/**
 * Formats user's display name according to their saved Salutation Preference
 * Preferences:
 * - default / 'shri_ji': "[User Name] ji" (e.g., "Shashank ji") - strictly starting directly with user's name without "हे" or "श्री"
 * - 'yajman': "यजमान [User Name]"
 * - 'simple': "[User Name]"
 */
export function formatUserSalutation(
  name: string,
  preference?: 'shri_ji' | 'yajman' | 'simple'
): string {
  const clean = (name || 'यजमान').trim();
  let baseName = clean
    .replace(/^(श्री|shri|shree|आचार्य|acharya|पण्डित|pandit|हे|hey|he)\s+/i, '')
    .replace(/\s+(जी|ji)$/i, '')
    .trim();
  if (!baseName) baseName = clean || 'Shashank';

  if (preference === 'yajman') {
    return `यजमान ${baseName}`;
  }
  if (preference === 'simple') {
    return baseName;
  }
  // Default format strictly starts directly with the user's name followed by 'ji'
  return `${baseName} ji`;
}


/**
 * Computes Vedic Rashi & Nakshatra for a family member's birth details and name
 */
export function deriveVedicDetailsForProfile(
  name: string,
  dob: string,
  birthTime: string,
  birthPlace: string,
  overrideMode?: CalculationViewingMode
) {
  const mode = overrideMode || getCalculationViewingMode();
  const cleanName = (name || '').trim();

  // If user selected name-rashi mode, derive primary details from phonetic name
  if (mode === 'name_rashi') {
    const nameAstro = getVedicDetailsFromName(cleanName);
    return {
      rashi: nameAstro.rashi || 'कुंभ (Aquarius)',
      rashiLord: nameAstro.rashiLord || 'शनि (Saturn)',
      nakshatra: nameAstro.nakshatra || 'शतभिषा (Shatabhisha)',
      nakshatraPada: 1,
      lagna: `${nameAstro.rashi ? nameAstro.rashi.split(' ')[0] : 'कुंभ'} (नाम राशि)`,
      lagnaLord: nameAstro.rashiLord || 'शनि (Saturn)',
    };
  }

  // Authentic Drik Ganit & Lahiri Ayanamsa computation for 'astronomical' mode
  try {
    const report = generateSampurnKundali(
      cleanName || 'श्रद्धालु यजमान',
      dob || '1996-03-10',
      birthTime || '10:00',
      birthPlace?.trim() || 'रुद्रपुर, उत्तराखण्ड'
    );

    if (dob && dob.trim()) {
      return {
        rashi: report.panchang.moonRashiName || 'कुंभ (Aquarius)',
        rashiLord: report.panchang.moonRashiLord || 'शनि (Saturn)',
        nakshatra: report.panchang.nakshatraName || 'शतभिषा (Shatabhisha)',
        nakshatraPada: report.panchang.nakshatraPada || 1,
        lagna: report.panchang.lagnaName || 'वृषभ (Taurus)',
        lagnaLord: report.panchang.lagnaLord || 'शुक्र (Venus)',
      };
    }
  } catch {}

  const nameAstro = getVedicDetailsFromName(cleanName);
  return {
    rashi: nameAstro.rashi || 'कुंभ (Aquarius)',
    rashiLord: nameAstro.rashiLord || 'शनि (Saturn)',
    nakshatra: nameAstro.nakshatra || 'शतभिषा (Shatabhisha)',
    nakshatraPada: 1,
    lagna: 'वृषभ (Taurus)',
    lagnaLord: 'शुक्र (Venus)',
  };
}

/**
 * Adds or updates a member in the vault
 */
export function upsertFamilyMember(
  data: Omit<FamilyMemberProfile, 'id' | 'createdAt' | 'updatedAt' | 'rashi' | 'rashiLord' | 'nakshatra' | 'nakshatraPada' | 'lagna'> & {
    id?: string;
  }
): FamilyMemberProfile {
  const existingList = getFamilyVaultProfiles();
  const now = new Date().toISOString();

  const astro = deriveVedicDetailsForProfile(
    data.name,
    data.dob,
    data.birthTime,
    data.birthPlace
  );

  let updatedList: FamilyMemberProfile[];
  let savedMember: FamilyMemberProfile;

  // If this member is marked as primary, unmark any other primary
  const isPrimary = data.isPrimary || existingList.length === 0;

  if (data.id) {
    // Update
    updatedList = existingList.map((m) => {
      if (m.id === data.id) {
        savedMember = {
          ...m,
          ...data,
          ...astro,
          isPrimary,
          updatedAt: now,
        };
        return savedMember;
      }
      return isPrimary ? { ...m, isPrimary: false } : m;
    });
  } else {
    // Insert new
    savedMember = {
      id: `fam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      relation: data.relation,
      relationCustom: data.relationCustom,
      gender: data.gender,
      dob: data.dob,
      birthTime: data.birthTime,
      birthPlace: data.birthPlace.trim(),
      gotra: data.gotra?.trim(),
      notes: data.notes?.trim(),
      isPrimary,
      createdAt: now,
      updatedAt: now,
      ...astro,
    };

    const cleanedExisting = isPrimary
      ? existingList.map((m) => ({ ...m, isPrimary: false }))
      : existingList;

    updatedList = [savedMember, ...cleanedExisting];
  }

  saveFamilyVaultProfiles(updatedList);
  return savedMember!;
}

/**
 * Deletes a member from the vault
 */
export function deleteFamilyMember(id: string): void {
  const list = getFamilyVaultProfiles().filter((m) => m.id !== id);
  // If we deleted the primary, make the first one primary
  if (list.length > 0 && !list.some((m) => m.isPrimary)) {
    list[0].isPrimary = true;
  }
  saveFamilyVaultProfiles(list);
}

/**
 * Sets a member as the primary profile
 */
export function setPrimaryFamilyMember(id: string): void {
  const list = getFamilyVaultProfiles().map((m) => ({
    ...m,
    isPrimary: m.id === id,
  }));
  saveFamilyVaultProfiles(list);
}

/**
 * Returns the primary profile (or first available)
 */
export function getPrimaryFamilyProfile(): FamilyMemberProfile | null {
  const list = getFamilyVaultProfiles();
  if (list.length === 0) return null;
  return list.find((m) => m.isPrimary) || list[0];
}
