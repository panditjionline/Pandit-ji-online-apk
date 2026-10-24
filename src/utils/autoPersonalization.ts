import { FamilyMemberProfile } from './familyVaultStorage';

const ACTIVE_PROFILE_KEY = 'panditji_default_active_profile';
const UNIFIED_YAJMAN_KEY = 'activeYajmanProfile';

function safeParseProfile(raw: string | null, keyToClean?: string): FamilyMemberProfile | null {
  if (!raw || raw === 'undefined' || raw === 'null' || raw.trim() === '') {
    if (keyToClean) {
      try { localStorage.removeItem(keyToClean); } catch {}
    }
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.name) {
      // Auto-repair stale seed DOB for Pragya if it was previously seeded as 1998-05-12
      if (
        (parsed.name.toLowerCase().includes('pragya') || parsed.name.includes('प्रज्ञा')) &&
        parsed.dob === '1998-05-12'
      ) {
        parsed.dob = '1996-11-06';
        if (parsed.birthTime === '18:20') parsed.birthTime = '14:15';
        if (parsed.birthPlace === 'हरिद्वार, उत्तराखण्ड') parsed.birthPlace = 'रुद्रपुर, उत्तराखण्ड';
        if (keyToClean) {
          try { localStorage.setItem(keyToClean, JSON.stringify(parsed)); } catch {}
        }
      }
      return parsed as FamilyMemberProfile;
    }
  } catch {
    if (keyToClean) {
      try { localStorage.removeItem(keyToClean); } catch {}
    }
  }
  return null;
}

export const getActiveProfile = (): FamilyMemberProfile | null => {
  try {
    const p1 = safeParseProfile(localStorage.getItem(UNIFIED_YAJMAN_KEY), UNIFIED_YAJMAN_KEY);
    if (p1) return p1;

    const p2 = safeParseProfile(localStorage.getItem(ACTIVE_PROFILE_KEY), ACTIVE_PROFILE_KEY);
    if (p2) return p2;
  } catch {
    // ignore
  }
  return null;
};

export const setActiveProfile = (profile: FamilyMemberProfile | null | undefined): void => {
  try {
    if (!profile || typeof profile !== 'object' || !profile.name) {
      clearActiveProfile();
      return;
    }
    const serialized = JSON.stringify(profile);
    localStorage.setItem(UNIFIED_YAJMAN_KEY, serialized);
    localStorage.setItem(ACTIVE_PROFILE_KEY, serialized);
    window.dispatchEvent(new Event('panditji_active_profile_updated'));
  } catch (e) {
    console.error('Error saving active profile', e);
  }
};

export const clearActiveProfile = (): void => {
  try {
    localStorage.removeItem(UNIFIED_YAJMAN_KEY);
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
    localStorage.removeItem('panditji_active_mobile_phone');
    localStorage.removeItem('panditji_family_vault_v1');
    window.dispatchEvent(new Event('panditji_active_profile_updated'));
    window.dispatchEvent(new CustomEvent('panditji_vault_updated', { detail: [] }));
  } catch (e) {
    console.error('Error clearing active profile', e);
  }
};

export const getPersonalizedGreeting = (profile: FamilyMemberProfile | null): string => {
  if (!profile) {
    return 'राधे राधे! पण्डित जी ऑनलाइन में आपका स्वागत है।';
  }
  const rashiStr = profile.rashi ? ` (${profile.rashi})` : '';
  return `प्रणाम ${profile.name}${rashiStr} जी! आज का दिन आपके लिए मंगलमय एवं शुभ हो।`;
};

export const getPersonalizedRashiInsight = (profile: FamilyMemberProfile | null): string => {
  if (!profile || !profile.rashi) {
    return 'अपनी राशि (जैसे मेष, वृषभ...) सेट करें ताकि दैनिक राशिफल व गोचर फल सीधे आपके नाम से प्रदर्शित हो सकें।';
  }
  return `आपकी राशि ${profile.rashi} एवं जन्म नक्षत्र ${profile.nakshatra || 'शुभ नक्षत्र'} के गोचर अनुसार आज धन लाभ, पारिवारिक सुख और कार्यक्षेत्र में विशेष सफलता के योग हैं।`;
};
