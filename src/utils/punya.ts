import { getISTCalendarParts } from './panchangCalendarEngine';

const PUNYA_POINTS_KEY = 'punya_points';
const LAST_DARSHAN_KEY = 'last_darshan_date';
const SADHANA_DAYS_KEY = 'sadhana_days_count';
const JAAP_STATS_KEY = 'panditji_jaap_stats';
const ACTIVE_USER_KEY = 'panditji_active_user';
const KUNDALI_HISTORY_KEY = 'panditji_kundali_history';

export interface UserProfile {
  phone: string;
  shortCode: string;
  name: string;
  hindiName: string;
  rashi: string;
  rashiKey: string;
  nakshatra: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
  gotra?: string;
}

export interface JaapStats {
  currentCount: number;
  completedMalas: number;
  lifetimeJaap: number;
}

export interface SavedKundaliRecord {
  id: string;
  name: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
  lagna: string;
  moonRashi: string;
  sunRashi: string;
  nakshatra: string;
  currentMahadasha: string;
  manglikStatus: string;
  luckyGemstone: string;
  timestamp: string;
}

export const PRESET_USERS: Record<string, UserProfile> = {
  '8958499979': {
    phone: '8958499979',
    shortCode: '9979',
    name: 'Shashank',
    hindiName: 'शशांक',
    rashi: 'कुंभ (AQUARIUS)',
    rashiKey: 'kumbh',
    nakshatra: 'शतभिषा (SHATABHISHA)',
    dob: '1996-03-10',
    birthTime: '10:00',
    birthPlace: 'रुद्रपुर, उत्तराखण्ड',
    gotra: 'कश्यप',
  },
  '9837123456': {
    phone: '9837123456',
    shortCode: '3456',
    name: 'Atul',
    hindiName: 'अतुल',
    rashi: 'वृषभ (TAURUS)',
    rashiKey: 'vrishabh',
    nakshatra: 'रोहिणी (ROHINI)',
    dob: '1992-08-22',
    birthTime: '15:45',
    birthPlace: 'देहरादून, उत्तराखण्ड',
    gotra: 'भारद्वाज',
  },
  '7017279043': {
    phone: '7017279043',
    shortCode: '9043',
    name: 'Niraj',
    hindiName: 'नीरज',
    rashi: 'वृश्चिक (SCORPIO)',
    rashiKey: 'vrishchik',
    nakshatra: 'अनुराधा (ANURADHA)',
    dob: '1994-11-18',
    birthTime: '06:30',
    birthPlace: 'नैनीताल, उत्तराखण्ड',
    gotra: 'कौशिक',
  },
  '9917801538': {
    phone: '9917801538',
    shortCode: '1538',
    name: 'Pragya',
    hindiName: 'प्रज्ञा',
    rashi: 'सिंह (LEO)',
    rashiKey: 'singh',
    nakshatra: 'पूर्वाफाल्गुनी (PURVA PHALGUNI)',
    dob: '1996-11-06',
    birthTime: '14:15',
    birthPlace: 'रुद्रपुर, उत्तराखण्ड',
    gotra: 'गर्ग',
  },
};

const LAST_DAILY_PUNYA_CLAIM_KEY = 'panditji_last_daily_punya_claim_date';
const PUNYA_OFFER_COUPON_KEY = 'panditji_punya_100_offer_coupon';

export const getActiveUser = (): UserProfile => {
  try {
    const saved = localStorage.getItem(ACTIVE_USER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        // Auto-repair stale seed DOB for Pragya if it was previously set to 1998-05-12
        if (parsed.phone === '9917801538' && parsed.dob === '1998-05-12') {
          parsed.dob = '1996-11-06';
          parsed.birthTime = parsed.birthTime === '18:20' ? '14:15' : parsed.birthTime;
          localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return PRESET_USERS['8958499979'];
};

export const setActiveUser = (user: UserProfile) => {
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
};

export const getPunyaPoints = (): number => {
  const val = parseInt(localStorage.getItem(PUNYA_POINTS_KEY) || '108', 10);
  return isNaN(val) ? 108 : val;
};

export const getSadhanaDays = (): number => {
  const val = parseInt(localStorage.getItem(SADHANA_DAYS_KEY) || '2', 10);
  return isNaN(val) ? 2 : val;
};

export const getLastDailyPunyaClaimDate = (): string | null => {
  try {
    return localStorage.getItem(LAST_DAILY_PUNYA_CLAIM_KEY);
  } catch {
    return null;
  }
};

export const hasClaimedDailyPunyaToday = (): boolean => {
  try {
    const today = getISTCalendarParts(new Date()).dateKey;
    return localStorage.getItem(LAST_DAILY_PUNYA_CLAIM_KEY) === today;
  } catch {
    return false;
  }
};

/**
 * Daily Earning Rule:
 * Automatically awards 1 Punya Point when the user opens the app or visits Daily Panchang
 * on a new IST calendar day (12:00 AM IST rollover), strictly guarded by lastClaimedDate.
 */
export const claimDailyPunyaPoint = (
  source: 'app_open' | 'panchang_visit' = 'app_open'
): {
  awarded: boolean;
  newPoints: number;
  lastClaimedDate: string;
  message: string;
} => {
  const today = getISTCalendarParts(new Date()).dateKey;
  try {
    const lastClaimedDate = localStorage.getItem(LAST_DAILY_PUNYA_CLAIM_KEY);
    const currentPoints = getPunyaPoints();

    if (lastClaimedDate === today) {
      return {
        awarded: false,
        newPoints: currentPoints,
        lastClaimedDate: today,
        message: 'आज का दैनिक +1 पुण्य पॉइंट पहले ही आपके खाते में जुड़ चुका है।',
      };
    }

    const newPoints = currentPoints + 1;
    localStorage.setItem(PUNYA_POINTS_KEY, newPoints.toString());
    localStorage.setItem(LAST_DAILY_PUNYA_CLAIM_KEY, today);
    localStorage.setItem(LAST_DARSHAN_KEY, today);

    const days = getSadhanaDays() + 1;
    localStorage.setItem(SADHANA_DAYS_KEY, days.toString());

    window.dispatchEvent(
      new CustomEvent('panditji_punya_updated', {
        detail: { newPoints, awarded: true, source, date: today },
      })
    );

    return {
      awarded: true,
      newPoints,
      lastClaimedDate: today,
      message:
        source === 'panchang_visit'
          ? 'शुभ पंचांग दर्शन! आज का +1 पुण्य पॉइंट आपके खाते में स्वतः जुड़ गया है।'
          : 'राधे राधे! दैनिक दर्शन हेतु आज का +1 पुण्य पॉइंट आपके खाते में स्वतः जुड़ गया है।',
    };
  } catch {
    const fallbackPoints = getPunyaPoints();
    return {
      awarded: false,
      newPoints: fallbackPoints,
      lastClaimedDate: today,
      message: '',
    };
  }
};

export const addPunyaPoint = (amount = 1) => {
  const today = getISTCalendarParts(new Date()).dateKey;
  const lastDarshan = localStorage.getItem(LAST_DARSHAN_KEY);
  const currentPoints = getPunyaPoints();
  const newPoints = currentPoints + amount;
  localStorage.setItem(PUNYA_POINTS_KEY, newPoints.toString());

  if (lastDarshan !== today) {
    localStorage.setItem(LAST_DARSHAN_KEY, today);
    localStorage.setItem(LAST_DAILY_PUNYA_CLAIM_KEY, today);
    const days = getSadhanaDays() + 1;
    localStorage.setItem(SADHANA_DAYS_KEY, days.toString());
  }

  window.dispatchEvent(
    new CustomEvent('panditji_punya_updated', {
      detail: { newPoints, awarded: true, date: today },
    })
  );

  return {
    success: true,
    newPoints,
    message: `जय श्री गणेश! +${amount} पुण्य अंक आपके खाते में जुड़ गए हैं।`,
  };
};

export const getJaapStats = (): JaapStats => {
  try {
    const raw = localStorage.getItem(JAAP_STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    currentCount: 27,
    completedMalas: 5,
    lifetimeJaap: 567,
  };
};

export const saveJaapStats = (stats: JaapStats) => {
  localStorage.setItem(JAAP_STATS_KEY, JSON.stringify(stats));
};

export const getSavedKundalis = (): SavedKundaliRecord[] => {
  try {
    const raw = localStorage.getItem(KUNDALI_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [
    {
      id: 'jk-1792515350105',
      name: 'Shashank',
      dob: '1996-03-10',
      birthTime: '10:00',
      birthPlace: 'रुद्रपुर, उत्तराखण्ड',
      lagna: 'वृषभ (Taurus)',
      moonRashi: 'तुला (Libra)',
      sunRashi: 'कुंभ (Aquarius)',
      nakshatra: 'विशाखा (Vishakha)',
      currentMahadasha: 'शनि (Saturn)',
      manglikStatus: 'मांगलिक दोष रहित (Non-Manglik)',
      luckyGemstone: 'ओपल या हीरा (Opal / Diamond)',
      timestamp: '21 अक्टू॰, 10:25 am',
    },
    {
      id: 'jk-1792515350106',
      name: 'Niraj',
      dob: '1994-11-18',
      birthTime: '06:30',
      birthPlace: 'नैनीताल, उत्तराखण्ड',
      lagna: 'मिथुन (Gemini)',
      moonRashi: 'वृश्चिक (Scorpio)',
      sunRashi: 'वृश्चिक (Scorpio)',
      nakshatra: 'अनुराधा (Anuradha)',
      currentMahadasha: 'बुध (Mercury)',
      manglikStatus: 'आंशिक मांगलिक परिहार (Cancelled)',
      luckyGemstone: 'मूंगा या पुखराज (Red Coral / Yellow Sapphire)',
      timestamp: '21 अक्टू॰, 11:55 am',
    },
  ];
};

export const saveKundaliRecord = (record: SavedKundaliRecord) => {
  const existing = getSavedKundalis();
  const updated = [record, ...existing];
  localStorage.setItem(KUNDALI_HISTORY_KEY, JSON.stringify(updated));
  return updated;
};

export const getActive100OfferCoupon = (): string | null => {
  try {
    return localStorage.getItem(PUNYA_OFFER_COUPON_KEY);
  } catch {
    return null;
  }
};

/**
 * Exclusive Redemption Rule:
 * Accumulated Punya Points can ONLY be redeemed toward the ₹100 Special Offer.
 */
export const redeemPunyaFor100Offer = () => {
  const currentPoints = getPunyaPoints();
  if (currentPoints < 100) {
    return {
      success: false,
      newPoints: currentPoints,
      couponCode: null,
      message: `₹100 स्पेशल ऑफर रिडीम करने के लिए कम से कम 100 पुण्य पॉइंट्स आवश्यक हैं (वर्तमान: ${currentPoints} अंक)। प्रतिदिन ऐप खोलने व पंचांग दर्शन से +1 पुण्य पॉइंट प्राप्त करें।`,
    };
  }
  const updatedPoints = currentPoints - 100;
  const couponCode = `PUNYA100-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  localStorage.setItem(PUNYA_POINTS_KEY, updatedPoints.toString());
  localStorage.setItem(PUNYA_OFFER_COUPON_KEY, couponCode);
  window.dispatchEvent(
    new CustomEvent('panditji_punya_updated', {
      detail: { newPoints: updatedPoints, redeemed: true, couponCode },
    })
  );
  return {
    success: true,
    newPoints: updatedPoints,
    couponCode,
    message: `बधाई हो! आपके 100 पुण्य पॉइंट्स केवल '₹100 स्पेशल ऑफर' (कूपन: ${couponCode}) के लिए सफलतापूर्वक रिडीम हो गए हैं!`,
  };
};

export const redeemConsultation = () => {
  return redeemPunyaFor100Offer();
};

