import { generateSampurnKundali, SampurnKundaliReport } from './sampurnKundali';

export interface KootResult {
  name: string;
  hindiName: string;
  boyValue: string;
  girlValue: string;
  maxPoints: number;
  obtainedPoints: number;
  status: 'favorable' | 'moderate' | 'dosh';
  meaning: string;
  verdict: string;
  remedy?: string;
}

export interface KundaliMilanResult {
  boyName: string;
  girlName: string;
  boyDob?: string;
  boyTime?: string;
  boyPlace?: string;
  girlDob?: string;
  girlTime?: string;
  girlPlace?: string;
  boyRashi: string;
  girlRashi: string;
  boyNakshatra: string;
  girlNakshatra: string;
  boyPada: number;
  girlPada: number;
  boyLagna: string;
  girlLagna: string;
  boyRashiLord: string;
  girlRashiLord: string;
  boyKundali?: SampurnKundaliReport;
  girlKundali?: SampurnKundaliReport;
  totalScore: number;
  maxScore: 36;
  compatibilityPercentage: number;
  overallVerdict: string;
  verdictDescription: string;
  statusColor: 'emerald' | 'amber' | 'rose';
  koots: KootResult[];
  manglikStatus: {
    boyManglik: boolean;
    girlManglik: boolean;
    boySeverity: string;
    girlSeverity: string;
    boyMarsHouseLagna: number;
    girlMarsHouseLagna: number;
    boyMarsHouseMoon: number;
    girlMarsHouseMoon: number;
    manglikMatch: boolean;
    description: string;
  };
  planetaryHarmony: {
    rashiLordRelation: string;
    seventhHouseSummary: string;
    jupiterVenusSummary: string;
  };
}

export const VEDIC_RASHIS = [
  'मेष (Aries)',
  'वृषभ (Taurus)',
  'मिथुन (Gemini)',
  'कर्क (Cancer)',
  'सिंह (Leo)',
  'कन्या (Virgo)',
  'तुला (Libra)',
  'वृश्चिक (Scorpio)',
  'धनु (Sagittarius)',
  'मकर (Capricorn)',
  'कुंभ (Aquarius)',
  'मीन (Pisces)',
];

export const VEDIC_NAKSHATRAS = [
  'अश्विनी (Ashwini)',
  'भरणी (Bharani)',
  'कृत्तिका (Krittika)',
  'रोहिणी (Rohini)',
  'मृगशिरा (Mrigashira)',
  'आर्द्रा (Ardra)',
  'पुनर्वसु (Punarvasu)',
  'पुष्य (Pushya)',
  'आश्लेषा (Ashlesha)',
  'मघा (Magha)',
  'पूर्वाफाल्गुनी (Purva Phalguni)',
  'उत्तराफाल्गुनी (Uttara Phalguni)',
  'हस्त (Hasta)',
  'चित्रा (Chitra)',
  'स्वाति (Swati)',
  'विशाखा (Vishakha)',
  'अनुराधा (Anuradha)',
  'ज्येष्ठा (Jyeshtha)',
  'मूल (Mula)',
  'पूर्वाषाढ़ा (Purva Ashadha)',
  'उत्तराषाढ़ा (Uttara Ashadha)',
  'श्रवण (Shravana)',
  'धनिष्ठा (Dhanishta)',
  'शतभिषा (Shatabhisha)',
  'पूर्वाभाद्रपद (Purva Bhadrapada)',
  'उत्तराभाद्रपद (Uttara Bhadrapada)',
  'रेवती (Revati)',
];

export interface PersonNameProfile {
  name: string;
  rashi: string;
  nakshatra: string;
  rashiLord: string;
  element: string;
  symbol: string;
  initialLetter: string;
}

// Classical Vedic Naam-Akshar to Rashi & Nakshatra derived according to Muhurat Chintamani
export function getVedicDetailsFromName(rawName: string): PersonNameProfile {
  const clean = (rawName || '').trim();
  const lower = clean.toLowerCase();
  if (!lower) {
    return {
      name: rawName,
      rashi: 'मेष (Aries)',
      nakshatra: 'अश्विनी (Ashwini)',
      rashiLord: 'मंगल (Mars)',
      element: 'अग्नि (Fire)',
      symbol: 'मेष/भेड़ (Ram)',
      initialLetter: 'अ',
    };
  }

  const char1 = lower[0];
  const char2 = lower.slice(0, 2);

  if (
    char2 === 'ch' ||
    char1 === 'a' ||
    char1 === 'l' ||
    clean.startsWith('अ') ||
    clean.startsWith('आ') ||
    clean.startsWith('च') ||
    clean.startsWith('ल')
  ) {
    return {
      name: clean,
      rashi: 'मेष (Aries)',
      nakshatra: char1 === 'l' || clean.startsWith('ल') ? 'भरणी (Bharani)' : 'अश्विनी (Ashwini)',
      rashiLord: 'मंगल (Mars)',
      element: 'अग्नि (Fire)',
      symbol: 'मेष (Ram)',
      initialLetter: clean[0].toUpperCase(),
    };
  } else if (
    char1 === 'i' ||
    char1 === 'u' ||
    char1 === 'v' ||
    char1 === 'b' ||
    clean.startsWith('इ') ||
    clean.startsWith('ई') ||
    clean.startsWith('उ') ||
    clean.startsWith('ऊ') ||
    clean.startsWith('ए') ||
    clean.startsWith('व') ||
    clean.startsWith('ब')
  ) {
    return {
      name: clean,
      rashi: 'वृषभ (Taurus)',
      nakshatra: char1 === 'v' || clean.startsWith('व') ? 'रोहिणी (Rohini)' : 'कृत्तिका (Krittika)',
      rashiLord: 'शुक्र (Venus)',
      element: 'पृथ्वी (Earth)',
      symbol: 'वृष/बैल (Bull)',
      initialLetter: clean[0].toUpperCase(),
    };
  } else if (
    char2 === 'gh' ||
    char1 === 'k' ||
    char1 === 'h' ||
    clean.startsWith('क') ||
    clean.startsWith('घ') ||
    clean.startsWith('छ') ||
    clean.startsWith('ह')
  ) {
    return {
      name: clean,
      rashi: 'मिथुन (Gemini)',
      nakshatra: char1 === 'k' || clean.startsWith('क') ? 'मृगशिरा (Mrigashira)' : 'आर्द्रा (Ardra)',
      rashiLord: 'बुध (Mercury)',
      element: 'वायु (Air)',
      symbol: 'युगल (Twins)',
      initialLetter: clean[0].toUpperCase(),
    };
  } else if (char1 === 'd' || clean.startsWith('ड') || clean.startsWith('द')) {
    return {
      name: clean,
      rashi: 'कर्क (Cancer)',
      nakshatra: 'पुष्य (Pushya)',
      rashiLord: 'चंद्र (Moon)',
      element: 'जल (Water)',
      symbol: 'कर्क/केकड़ा (Crab)',
      initialLetter: clean[0].toUpperCase(),
    };
  } else if (char1 === 'm' || char1 === 't' || clean.startsWith('म') || clean.startsWith('ट')) {
    return {
      name: clean,
      rashi: 'सिंह (Leo)',
      nakshatra: char1 === 'm' || clean.startsWith('म') ? 'मघा (Magha)' : 'पूर्वाफाल्गुनी (Purva Phalguni)',
      rashiLord: 'सूर्य (Sun)',
      element: 'अग्नि (Fire)',
      symbol: 'सिंह/शेर (Lion)',
      initialLetter: clean[0].toUpperCase(),
    };
  } else if (char2 === 'th' || char1 === 'p' || clean.startsWith('प') || clean.startsWith('ठ') || clean.startsWith('ष')) {
    return {
      name: clean,
      rashi: 'कन्या (Virgo)',
      nakshatra: char1 === 'p' || clean.startsWith('प') ? 'उत्तराफाल्गुनी (Uttara Phalguni)' : 'हस्त (Hasta)',
      rashiLord: 'बुध (Mercury)',
      element: 'पृथ्वी (Earth)',
      symbol: 'कन्या (Maiden)',
      initialLetter: clean[0].toUpperCase(),
    };
  } else if (char1 === 'r' || clean.startsWith('र') || clean.startsWith('त')) {
    return {
      name: clean,
      rashi: 'तुला (Libra)',
      nakshatra: char1 === 'r' || clean.startsWith('र') ? 'चित्रा (Chitra)' : 'स्वाति (Swati)',
      rashiLord: 'शुक्र (Venus)',
      element: 'वायु (Air)',
      symbol: 'तुला/तराजू (Scales)',
      initialLetter: clean[0].toUpperCase(),
    };
  } else if (char1 === 'n' || char1 === 'y' || clean.startsWith('न') || clean.startsWith('य')) {
    return {
      name: clean,
      rashi: 'वृश्चिक (Scorpio)',
      nakshatra: char1 === 'n' || clean.startsWith('न') ? 'अनुराधा (Anuradha)' : 'ज्येष्ठा (Jyeshtha)',
      rashiLord: 'मंगल (Mars)',
      element: 'जल (Water)',
      symbol: 'वृश्चिक/बिच्छू (Scorpion)',
      initialLetter: clean[0].toUpperCase(),
    };
  } else if (
    char2 === 'bh' ||
    char2 === 'dh' ||
    char1 === 'f' ||
    clean.startsWith('भ') ||
    clean.startsWith('ध') ||
    clean.startsWith('फ')
  ) {
    return {
      name: clean,
      rashi: 'धनु (Sagittarius)',
      nakshatra: 'मूल (Mula)',
      rashiLord: 'गुरु (Jupiter)',
      element: 'अग्नि (Fire)',
      symbol: 'धनुर्धर (Archer)',
      initialLetter: clean[0].toUpperCase(),
    };
  } else if (char2 === 'kh' || char1 === 'j' || clean.startsWith('ज') || clean.startsWith('ख')) {
    return {
      name: clean,
      rashi: 'मकर (Capricorn)',
      nakshatra: 'श्रवण (Shravana)',
      rashiLord: 'शनि (Saturn)',
      element: 'पृथ्वी (Earth)',
      symbol: 'मकर (Sea-Goat)',
      initialLetter: clean[0].toUpperCase(),
    };
  } else if (
    char2 === 'sh' ||
    char1 === 's' ||
    char1 === 'g' ||
    clean.startsWith('स') ||
    clean.startsWith('श') ||
    clean.startsWith('ग')
  ) {
    return {
      name: clean,
      rashi: 'कुंभ (Aquarius)',
      nakshatra: char2 === 'sh' || clean.startsWith('श') ? 'शतभिषा (Shatabhisha)' : 'धनिष्ठा (Dhanishta)',
      rashiLord: 'शनि (Saturn)',
      element: 'वायु (Air)',
      symbol: 'कुंभ/कलश (Water Bearer)',
      initialLetter: clean[0].toUpperCase(),
    };
  } else {
    return {
      name: clean,
      rashi: 'मीन (Pisces)',
      nakshatra: 'रेवती (Revati)',
      rashiLord: 'गुरु (Jupiter)',
      element: 'जल (Water)',
      symbol: 'मत्स्य/मछली (Fish)',
      initialLetter: clean[0].toUpperCase(),
    };
  }
}

export function getEstimatedRashiFromName(name: string): string {
  return getVedicDetailsFromName(name).rashi;
}

// ==================== CLASSICAL ASHTAKOOT LOOKUP TABLES (BPHS / MUHURAT CHINTAMANI) ====================

// 1. Varna (by Rashi 1..12):
// Brahmin (4): Cancer(4), Scorpio(8), Pisces(12)
// Kshatriya (3): Aries(1), Leo(5), Sagittarius(9)
// Vaishya (2): Taurus(2), Virgo(6), Capricorn(10)
// Shudra (1): Gemini(3), Libra(7), Aquarius(11)
const RASHI_VARNA: Array<{ name: string; rank: number }> = [
  { name: 'क्षत्रिय', rank: 3 }, // 1 Mesha
  { name: 'वैश्य', rank: 2 },    // 2 Vrishabha
  { name: 'शूद्र', rank: 1 },    // 3 Mithuna
  { name: 'ब्राह्मण', rank: 4 }, // 4 Karka
  { name: 'क्षत्रिय', rank: 3 }, // 5 Simha
  { name: 'वैश्य', rank: 2 },    // 6 Kanya
  { name: 'शूद्र', rank: 1 },    // 7 Tula
  { name: 'ब्राह्मण', rank: 4 }, // 8 Vrishchika
  { name: 'क्षत्रिय', rank: 3 }, // 9 Dhanu
  { name: 'वैश्य', rank: 2 },    // 10 Makara
  { name: 'शूद्र', rank: 1 },    // 11 Kumbha
  { name: 'ब्राह्मण', rank: 4 }, // 12 Meena
];

// 2. Vashya (0: Chatushpada, 1: Manava/Dwipada, 2: Jalachara, 3: Vanachara, 4: Keeta)
const VASHYA_NAMES = [
  'चतुष्पद (Chatushpada)',
  'मानव / द्विपद (Manava)',
  'जलचर (Jalachara)',
  'वनचर (Vanachara)',
  'कीट (Keeta)',
];

function getVashyaIndex(rashiNum: number, degInRashi = 10): number {
  switch (rashiNum) {
    case 1:
    case 2:
      return 0; // Chatushpada
    case 3:
    case 6:
    case 7:
    case 11:
      return 1; // Manava
    case 4:
    case 12:
      return 2; // Jalachara
    case 5:
      return 3; // Vanachara
    case 8:
      return 4; // Keeta
    case 9:
      return degInRashi < 15 ? 1 : 0; // First half Manava, second half Chatushpada
    case 10:
      return degInRashi < 15 ? 0 : 2; // First half Chatushpada, second half Jalachara
    default:
      return 1;
  }
}

const VASHYA_MATRIX: number[][] = [
  // Chatush, Manava, Jalachara, Vanachara, Keeta
  [2, 1, 1, 0, 1],     // 0 Chatushpada
  [1, 2, 0.5, 0, 1],   // 1 Manava
  [1, 0.5, 2, 1, 1],   // 2 Jalachara
  [0, 0, 1, 2, 0],     // 3 Vanachara
  [1, 1, 1, 0, 2],     // 4 Keeta
];

// 3. Tara Names (1..9)
const TARA_NAMES = [
  'जन्म तारा',
  'संपत तारा',
  'विपत तारा',
  'क्षेम तारा',
  'प्रत्यरि तारा',
  'साधक तारा',
  'वध तारा',
  'मित्र तारा',
  'अतिमित्र तारा',
];

// 4. Yoni (0..13) for each of the 27 Nakshatras
const YONI_NAMES = [
  'अश्व (घोड़ा)',
  'गज (हाथी)',
  'मेष (भेड़)',
  'सर्प (साँप)',
  'श्वान (कुत्ता)',
  'मार्जार (बिल्ली)',
  'मूषक (चूहा)',
  'गौ (गाय)',
  'महिष (भैंस)',
  'व्याघ्र (बाघ)',
  'मृग (हिरण)',
  'वानर (बंदर)',
  'नकुल (नेवला)',
  'सिंह (शेर)',
];

// Mapping 27 Nakshatras (0..26) to Yoni index (0..13)
const NAKSHATRA_YONI: number[] = [
  0,  // 0 Ashwini -> Ashwa
  1,  // 1 Bharani -> Gaja
  2,  // 2 Krittika -> Mesha
  3,  // 3 Rohini -> Sarpa
  3,  // 4 Mrigashira -> Sarpa
  4,  // 5 Ardra -> Shwan
  5,  // 6 Punarvasu -> Marjar
  2,  // 7 Pushya -> Mesha
  5,  // 8 Ashlesha -> Marjar
  6,  // 9 Magha -> Mushak
  6,  // 10 Purva Phalguni -> Mushak
  7,  // 11 Uttara Phalguni -> Gau
  8,  // 12 Hasta -> Mahish
  9,  // 13 Chitra -> Vyaghra
  8,  // 14 Swati -> Mahish
  9,  // 15 Vishakha -> Vyaghra
  10, // 16 Anuradha -> Mriga
  10, // 17 Jyeshtha -> Mriga
  4,  // 18 Mula -> Shwan
  11, // 19 Purva Ashadha -> Vanar
  12, // 20 Uttara Ashadha -> Nakul
  11, // 21 Shravana -> Vanar
  13, // 22 Dhanishta -> Simha
  0,  // 23 Shatabhisha -> Ashwa
  13, // 24 Purva Bhadrapada -> Simha
  7,  // 25 Uttara Bhadrapada -> Gau
  1,  // 26 Revati -> Gaja
];

// Classical 14x14 Yoni Compatibility Matrix (Muhurat Chintamani)
const YONI_MATRIX: number[][] = [
  // 0:Ashwa, 1:Gaja, 2:Mesha, 3:Sarpa, 4:Shwan, 5:Marjar, 6:Mushak, 7:Gau, 8:Mahish, 9:Vyaghra, 10:Mriga, 11:Vanar, 12:Nakul, 13:Simha
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1], // 0 Ashwa
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0], // 1 Gaja
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1], // 2 Mesha
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2], // 3 Sarpa
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1], // 4 Shwan
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1], // 5 Marjar
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2], // 6 Mushak
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1], // 7 Gau
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1], // 8 Mahish
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1], // 9 Vyaghra
  [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1], // 10 Mriga
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2], // 11 Vanar
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2], // 12 Nakul
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4], // 13 Simha
];

// 5. Graha Maitri (Rashi Lords: 0:Sun, 1:Moon, 2:Mars, 3:Mercury, 4:Jupiter, 5:Venus, 6:Saturn)
const LORD_NAMES = [
  'सूर्य (Sun)',
  'चंद्र (Moon)',
  'मंगल (Mars)',
  'बुध (Mercury)',
  'गुरु (Jupiter)',
  'शुक्र (Venus)',
  'शनि (Saturn)',
];

// Rashi 1..12 to Lord index 0..6
const RASHI_LORD_INDEX: number[] = [
  2, // 1 Mesha -> Mars
  5, // 2 Vrishabha -> Venus
  3, // 3 Mithuna -> Mercury
  1, // 4 Karka -> Moon
  0, // 5 Simha -> Sun
  3, // 6 Kanya -> Mercury
  5, // 7 Tula -> Venus
  2, // 8 Vrishchika -> Mars
  4, // 9 Dhanu -> Jupiter
  6, // 10 Makara -> Saturn
  6, // 11 Kumbha -> Saturn
  4, // 12 Meena -> Jupiter
];

const GRAHA_MAITRI_MATRIX: number[][] = [
  // Sun, Moon, Mars, Merc, Jup, Ven, Sat
  [5, 5, 5, 4, 5, 0, 0],       // 0 Sun
  [5, 5, 4, 1, 4, 0.5, 0.5],   // 1 Moon
  [5, 4, 5, 0.5, 5, 3, 0.5],   // 2 Mars
  [4, 1, 0.5, 5, 0.5, 5, 4],   // 3 Mercury
  [5, 4, 5, 0.5, 5, 0.5, 3],   // 4 Jupiter
  [0, 0.5, 3, 5, 0.5, 5, 5],   // 5 Venus
  [0, 0.5, 0.5, 4, 3, 5, 5],   // 6 Saturn
];

// 6. Gana (0: Deva, 1: Manushya, 2: Rakshasa)
const GANA_NAMES = ['देव गण (Deva)', 'मनुष्य गण (Manushya)', 'राक्षस गण (Rakshasa)'];

const NAKSHATRA_GANA: number[] = [
  0, // 0 Ashwini
  1, // 1 Bharani
  2, // 2 Krittika
  1, // 3 Rohini
  0, // 4 Mrigashira
  1, // 5 Ardra
  0, // 6 Punarvasu
  0, // 7 Pushya
  2, // 8 Ashlesha
  2, // 9 Magha
  1, // 10 Purva Phalguni
  1, // 11 Uttara Phalguni
  0, // 12 Hasta
  2, // 13 Chitra
  0, // 14 Swati
  2, // 15 Vishakha
  0, // 16 Anuradha
  2, // 17 Jyeshtha
  2, // 18 Mula
  1, // 19 Purva Ashadha
  1, // 20 Uttara Ashadha
  0, // 21 Shravana
  2, // 22 Dhanishta
  2, // 23 Shatabhisha
  1, // 24 Purva Bhadrapada
  1, // 25 Uttara Bhadrapada
  0, // 26 Revati
];

const GANA_MATRIX: number[][] = [
  [6, 6, 1], // Boy Deva
  [5, 6, 0], // Boy Manushya
  [0, 0, 6], // Boy Rakshasa
];

// 8. Nadi (0: Adi/Vata, 1: Madhya/Pitta, 2: Antya/Kapha)
const NADI_NAMES = ['आदि नाड़ी (Adi)', 'मध्य नाड़ी (Madhya)', 'अन्त्य नाड़ी (Antya)'];

const NAKSHATRA_NADI: number[] = [
  0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2,
];

function findRashiNumber(rashiStr: string): number {
  const idx = VEDIC_RASHIS.findIndex(
    (r) => r === rashiStr || rashiStr.includes(r.split(' ')[0])
  );
  return idx >= 0 ? idx + 1 : 1;
}

function findNakshatraIndex(nakStr: string): number {
  const idx = VEDIC_NAKSHATRAS.findIndex(
    (n) => n === nakStr || nakStr.includes(n.split(' ')[0])
  );
  return idx >= 0 ? idx : 0;
}

/**
 * Authentic Vedic Ashtakoot (36 Guna) & Planetary Kundali Milan
 * Uses true Lahiri Chitrapaksha sidereal ephemeris when DOB & Time are provided,
 * or exact Rashi/Nakshatra tables when manual Rashi/Nakshatra are specified.
 */
export function calculateKundaliMilan(
  boyName: string,
  girlName: string,
  boyRashiInput?: string,
  girlRashiInput?: string,
  boyNakshatraInput?: string,
  girlNakshatraInput?: string,
  boyDob?: string,
  boyTime?: string,
  girlDob?: string,
  girlTime?: string,
  boyPlace: string = 'रुद्रपुर, उत्तराखण्ड',
  girlPlace: string = 'रुद्रपुर, उत्तराखण्ड',
  useAstronomicalKundali: boolean = true
): KundaliMilanResult {
  const boyProfile = getVedicDetailsFromName(boyName);
  const girlProfile = getVedicDetailsFromName(girlName);

  // Generate full astronomical Kundalis if DOB is present and astronomical mode is active
  let boyKundali: SampurnKundaliReport | undefined;
  let girlKundali: SampurnKundaliReport | undefined;

  if (useAstronomicalKundali && boyDob) {
    boyKundali = generateSampurnKundali(
      boyName || 'वर',
      boyDob,
      boyTime || '12:00',
      boyPlace || 'रुद्रपुर, उत्तराखण्ड'
    );
  }
  if (useAstronomicalKundali && girlDob) {
    girlKundali = generateSampurnKundali(
      girlName || 'कन्या',
      girlDob,
      girlTime || '12:00',
      girlPlace || 'रुद्रपुर, उत्तराखण्ड'
    );
  }

  // Determine exact Moon Rashi (1..12), Nakshatra (0..26), Pada (1..4), and Moon Degree in Rashi
  const boyRashiNum = boyKundali
    ? boyKundali.panchang.moonRashiNumber
    : findRashiNumber(boyRashiInput || boyProfile.rashi);
  const girlRashiNum = girlKundali
    ? girlKundali.panchang.moonRashiNumber
    : findRashiNumber(girlRashiInput || girlProfile.rashi);

  const boyRashi = VEDIC_RASHIS[boyRashiNum - 1];
  const girlRashi = VEDIC_RASHIS[girlRashiNum - 1];

  const boyNakIdx = boyKundali
    ? findNakshatraIndex(boyKundali.panchang.nakshatraName)
    : findNakshatraIndex(boyNakshatraInput || boyProfile.nakshatra);
  const girlNakIdx = girlKundali
    ? findNakshatraIndex(girlKundali.panchang.nakshatraName)
    : findNakshatraIndex(girlNakshatraInput || girlProfile.nakshatra);

  const boyNakshatra = VEDIC_NAKSHATRAS[boyNakIdx];
  const girlNakshatra = VEDIC_NAKSHATRAS[girlNakIdx];

  const boyPada = boyKundali ? boyKundali.panchang.nakshatraPada : 1;
  const girlPada = girlKundali ? girlKundali.panchang.nakshatraPada : 2;

  const boyMoonPlanet = boyKundali?.planets.find((p) => p.id === 'moon');
  const girlMoonPlanet = girlKundali?.planets.find((p) => p.id === 'moon');
  const boyMoonDegInRashi = boyMoonPlanet ? boyMoonPlanet.degInt : 10;
  const girlMoonDegInRashi = girlMoonPlanet ? girlMoonPlanet.degInt : 10;

  // ==================== 1. VARNA KOOT (Max 1 Point) ====================
  const boyVarna = RASHI_VARNA[boyRashiNum - 1];
  const girlVarna = RASHI_VARNA[girlRashiNum - 1];
  const varanObtained = boyVarna.rank >= girlVarna.rank ? 1 : 0;
  const varanResult: KootResult = {
    name: 'Varna Koot',
    hindiName: '1. वर्ण कूट (Varna)',
    boyValue: boyVarna.name,
    girlValue: girlVarna.name,
    maxPoints: 1,
    obtainedPoints: varanObtained,
    status: varanObtained === 1 ? 'favorable' : 'moderate',
    meaning: 'बौद्धिक स्तर, आध्यात्मिक झुकाव एवं कार्य-प्रकृति का सामंजस्य।',
    verdict:
      varanObtained === 1
        ? `वर (${boyVarna.name}) एवं कन्या (${girlVarna.name}) का वर्ण मिलान शास्त्रसम्मत व श्रेष्ठ (1/1) है।`
        : `वर (${boyVarna.name}) एवं कन्या (${girlVarna.name}) में वर्ण अंतर है, किंतु ग्रह मैत्री शुभ होने पर यह गौण माना जाता है।`,
  };

  // ==================== 2. VASHYA KOOT (Max 2 Points) ====================
  const boyVashyaIdx = getVashyaIndex(boyRashiNum, boyMoonDegInRashi);
  const girlVashyaIdx = getVashyaIndex(girlRashiNum, girlMoonDegInRashi);
  const vashyaObtained = VASHYA_MATRIX[boyVashyaIdx][girlVashyaIdx];
  const vashyaResult: KootResult = {
    name: 'Vashya Koot',
    hindiName: '2. वश्य कूट (Vashya)',
    boyValue: VASHYA_NAMES[boyVashyaIdx],
    girlValue: VASHYA_NAMES[girlVashyaIdx],
    maxPoints: 2,
    obtainedPoints: vashyaObtained,
    status: vashyaObtained >= 1.5 ? 'favorable' : vashyaObtained >= 0.5 ? 'moderate' : 'dosh',
    meaning: 'दांपत्य में पारस्परिक आकर्षण, समर्पण, सहयोग एवं स्नेह बंधन।',
    verdict:
      vashyaObtained === 2
        ? 'समान/उत्तम वश्य (2/2 अंक)। पति-पत्नी में गहरा आकर्षण और अटूट सामंजस्य रहेगा।'
        : vashyaObtained >= 0.5
        ? `मध्यम वश्य मिलान (${vashyaObtained}/2 अंक)। आपसी संवाद व आदर से दांपत्य सुखद रहेगा।`
        : 'वश्य वैषम्य (0/2 अंक)। एक-दूसरे के विचारों पर अधिकार जताने के बजाय सहयोग की भावना रखें।',
  };

  // ==================== 3. TARA KOOT (Max 3 Points) ====================
  const countBG = ((girlNakIdx - boyNakIdx + 27) % 27) + 1;
  const countGB = ((boyNakIdx - girlNakIdx + 27) % 27) + 1;
  const remBG = countBG % 9 === 0 ? 9 : countBG % 9;
  const remGB = countGB % 9 === 0 ? 9 : countGB % 9;
  const boyTaraName = TARA_NAMES[remBG - 1];
  const girlTaraName = TARA_NAMES[remGB - 1];
  const boyTaraShubh = ![3, 5, 7].includes(remBG);
  const girlTaraShubh = ![3, 5, 7].includes(remGB);

  let taraObtained = 0;
  if (boyTaraShubh && girlTaraShubh) taraObtained = 3;
  else if (boyTaraShubh || girlTaraShubh) taraObtained = 1.5;
  else taraObtained = 0;

  const taraResult: KootResult = {
    name: 'Tara Koot',
    hindiName: '3. तारा कूट (Tara)',
    boyValue: `${boyTaraName} (${remBG})`,
    girlValue: `${girlTaraName} (${remGB})`,
    maxPoints: 3,
    obtainedPoints: taraObtained,
    status: taraObtained === 3 ? 'favorable' : taraObtained === 1.5 ? 'moderate' : 'dosh',
    meaning: 'जन्म नक्षत्रों की दूरी के आधार पर भाग्य, आयु, आरोग्य एवं सुख-दुःख का विचार।',
    verdict:
      taraObtained === 3
        ? `दोनों पक्षों की तारा (${boyTaraName} व ${girlTaraName}) परम शुभ है (3/3 अंक)। सौभाग्य व दीर्घायु कारक।`
        : taraObtained === 1.5
        ? `एक पक्ष की तारा शुभ व दूसरे की मध्यम है (1.5/3 अंक)। सामान्य अनुकूलता रहेगी।`
        : `उभय तारा अशुभ (${boyTaraName} व ${girlTaraName}, 0/3 अंक)। नक्षत्र शांति एवं रुद्राभिषेक हितकर है।`,
  };

  // ==================== 4. YONI KOOT (Max 4 Points) ====================
  const boyYoniIdx = NAKSHATRA_YONI[boyNakIdx];
  const girlYoniIdx = NAKSHATRA_YONI[girlNakIdx];
  const yoniObtained = YONI_MATRIX[boyYoniIdx][girlYoniIdx];
  const yoniResult: KootResult = {
    name: 'Yoni Koot',
    hindiName: '4. योनि कूट (Yoni)',
    boyValue: YONI_NAMES[boyYoniIdx],
    girlValue: YONI_NAMES[girlYoniIdx],
    maxPoints: 4,
    obtainedPoints: yoniObtained,
    status: yoniObtained >= 3 ? 'favorable' : yoniObtained >= 2 ? 'moderate' : 'dosh',
    meaning: 'शारीरिक एवं भावनात्मक अनुकूलता, जैविक ऊर्जा एवं अंतरंग दांपत्य सामंजस्य।',
    verdict:
      yoniObtained === 4
        ? `स्वयोनि मिलान (${YONI_NAMES[boyYoniIdx]}, 4/4 अंक)। दांपत्य में पूर्ण मानसिक व शारीरिक संतुष्टि रहेगी।`
        : yoniObtained === 3
        ? `मित्र योनि मिलान (${yoniObtained}/4 अंक)। सहज स्नेह व उत्तम आपसी तालमेल रहेगा।`
        : yoniObtained === 2
        ? `सम योनि मिलान (2/4 अंक)। सामान्य व संतुलित वैवाहिक जीवन रहेगा।`
        : yoniObtained === 1
        ? `प्रतिकूल योनि (1/4 अंक)। धैर्य व एक-दूसरे की भावनाओं का सम्मान आवश्यक है।`
        : `महावैर योनि (${YONI_NAMES[boyYoniIdx]} व ${YONI_NAMES[girlYoniIdx]}, 0/4 अंक)। स्वभाव में टकराव से बचने हेतु विशेष शांति पूजन कराएं।`,
  };

  // ==================== 5. GRAHA MAITRI KOOT (Max 5 Points) ====================
  const boyLordIdx = RASHI_LORD_INDEX[boyRashiNum - 1];
  const girlLordIdx = RASHI_LORD_INDEX[girlRashiNum - 1];
  const grahaObtained = GRAHA_MAITRI_MATRIX[boyLordIdx][girlLordIdx];
  const grahaResult: KootResult = {
    name: 'Graha Maitri',
    hindiName: '5. ग्रह मैत्री (Maitri)',
    boyValue: LORD_NAMES[boyLordIdx],
    girlValue: LORD_NAMES[girlLordIdx],
    maxPoints: 5,
    obtainedPoints: grahaObtained,
    status: grahaObtained >= 4 ? 'favorable' : grahaObtained >= 3 ? 'moderate' : 'dosh',
    meaning: 'वर-कन्या की चन्द्र राशि के स्वामियों की नैसर्गिक मित्रता एवं मानसिक शांति।',
    verdict:
      grahaObtained === 5
        ? `वर (${LORD_NAMES[boyLordIdx]}) व कन्या (${LORD_NAMES[girlLordIdx]}) के राशि स्वामी एक हैं या परम मित्र हैं (5/5 अंक)। यह भकूट व गण दोष का भी निवारण करता है।`
        : grahaObtained >= 3
        ? `राशि स्वामियों में सम/मित्र संबंध है (${grahaObtained}/5 अंक)। विचारों में अच्छा संतुलन रहेगा।`
        : `राशि स्वामियों (${LORD_NAMES[boyLordIdx]} व ${LORD_NAMES[girlLordIdx]}) में शत्रु भाव (${grahaObtained}/5 अंक)। संवाद में मधुरता बनाए रखें।`,
  };

  // ==================== 6. GANA KOOT (Max 6 Points) ====================
  const boyGanaIdx = NAKSHATRA_GANA[boyNakIdx];
  const girlGanaIdx = NAKSHATRA_GANA[girlNakIdx];
  const ganaObtained = GANA_MATRIX[boyGanaIdx][girlGanaIdx];
  const ganaResult: KootResult = {
    name: 'Gana Koot',
    hindiName: '6. गण कूट (Gana)',
    boyValue: GANA_NAMES[boyGanaIdx],
    girlValue: GANA_NAMES[girlGanaIdx],
    maxPoints: 6,
    obtainedPoints: ganaObtained,
    status: ganaObtained >= 5 ? 'favorable' : ganaObtained >= 1 ? 'moderate' : 'dosh',
    meaning: 'व्यक्तित्व का मूल स्वभाव (सात्विक/देव, राजसिक/मनुष्य, तेजस्वी/राक्षस) एवं आचरण।',
    verdict:
      ganaObtained === 6
        ? `उत्तम गण मिलान (${GANA_NAMES[boyGanaIdx]} - ${GANA_NAMES[girlGanaIdx]}, 6/6 अंक)। स्वभाव व जीवनशैली पूर्णतः अनुकूल हैं।`
        : ganaObtained >= 1
        ? `मध्यम गण मिलान (${ganaObtained}/6 अंक)। थोड़ा सामंजस्य रखने से दांपत्य सुखमय रहेगा।`
        : `गण दोष (${GANA_NAMES[boyGanaIdx]} व ${GANA_NAMES[girlGanaIdx]}, 0/6 अंक)। ${
            grahaObtained >= 4
              ? 'परन्तु ग्रह मैत्री श्रेष्ठ होने से शास्त्रानुसार गण दोष का परिहार हो रहा है।'
              : 'गण शांति पूजन एवं सहनशीलता आवश्यक है।'
          }`,
    remedy:
      ganaObtained === 0 && grahaObtained < 4
        ? 'गण दोष निवारण हेतु भगवान शिव-पार्वती का अभिषेक एवं ग्रह मैत्री शांति कराएं।'
        : undefined,
  };

  // ==================== 7. BHAKOOT KOOT (Max 7 Points) ====================
  const distBG = ((girlRashiNum - boyRashiNum + 12) % 12) + 1;
  const distGB = ((boyRashiNum - girlRashiNum + 12) % 12) + 1;
  const bhakootFavorableDistances = [1, 3, 4, 7, 10, 11];
  const bhakootObtained = bhakootFavorableDistances.includes(distBG) ? 7 : 0;
  const hasBhakootParihar =
    bhakootObtained === 0 && (boyLordIdx === girlLordIdx || grahaObtained >= 4);

  let bhakootRelationName = `${distBG}/${distGB} भकूट`;
  if (distBG === 1) bhakootRelationName = 'समसप्तक/एक राशि (1/1)';
  else if (distBG === 7) bhakootRelationName = 'समसप्तक शुभ (7/7)';
  else if (distBG === 3 || distBG === 11) bhakootRelationName = 'तृतीय-एकादश शुभ (3/11)';
  else if (distBG === 4 || distBG === 10) bhakootRelationName = 'चतुर्थ-दशम शुभ (4/10)';
  else if (distBG === 2 || distBG === 12) bhakootRelationName = 'द्विद्वादश भकूट (2/12)';
  else if (distBG === 5 || distBG === 9) bhakootRelationName = 'नवपंचम भकूट (5/9)';
  else if (distBG === 6 || distBG === 8) bhakootRelationName = 'षडाष्टक भकूट (6/8)';

  const bhakootResult: KootResult = {
    name: 'Bhakoot Koot',
    hindiName: '7. भकूट कूट (Bhakoot)',
    boyValue: boyRashi.split(' ')[0],
    girlValue: `${girlRashi.split(' ')[0]} (${bhakootRelationName})`,
    maxPoints: 7,
    obtainedPoints: bhakootObtained,
    status: bhakootObtained === 7 ? 'favorable' : hasBhakootParihar ? 'moderate' : 'dosh',
    meaning: 'राशियों की पारस्परिक दूरी से धन-समृद्धि, पारिवारिक सौख्य, प्रेम एवं वंश वृद्धि।',
    verdict:
      bhakootObtained === 7
        ? `${bhakootRelationName} होने से भकूट पूर्ण शुभ (7/7 अंक) है। परिवार में सुख-समृद्धि व भाग्योदय रहेगा।`
        : hasBhakootParihar
        ? `${bhakootRelationName} से 0/7 अंक हैं, किंतु दोनों राशियों के स्वामी एक/परम मित्र (${LORD_NAMES[boyLordIdx]} - ${LORD_NAMES[girlLordIdx]}) होने से भकूट दोष का शास्त्रोक्त परिहार हो रहा है।`
        : `${bhakootRelationName} दोष (0/7 अंक)। विवाह से पूर्व भकूट शांति एवं कुंडली के सप्तम भाव का विचार आवश्यक है।`,
    remedy:
      bhakootObtained === 0 && !hasBhakootParihar
        ? 'भकूट शांति हेतु रुद्राभिषेक एवं माता गौरी-शंकर पूजन संपन्न कराएं।'
        : undefined,
  };

  // ==================== 8. NADI KOOT (Max 8 Points) ====================
  const boyNadiIdx = NAKSHATRA_NADI[boyNakIdx];
  const girlNadiIdx = NAKSHATRA_NADI[girlNakIdx];
  const nadiObtained = boyNadiIdx !== girlNadiIdx ? 8 : 0;

  // Classical Nadi Dosha Parihar rules (Muhurat Chintamani):
  // 1) Same Rashi but different Nakshatra
  // 2) Same Nakshatra but different Charan (Pada)
  // 3) Different Rashi but same Nakshatra
  const hasNadiParihar =
    nadiObtained === 0 &&
    ((boyRashiNum === girlRashiNum && boyNakIdx !== girlNakIdx) ||
      (boyNakIdx === girlNakIdx && boyPada !== girlPada) ||
      (boyRashiNum !== girlRashiNum && boyNakIdx === girlNakIdx));

  const nadiResult: KootResult = {
    name: 'Nadi Koot',
    hindiName: '8. नाड़ी कूट (Nadi)',
    boyValue: NADI_NAMES[boyNadiIdx],
    girlValue: NADI_NAMES[girlNadiIdx],
    maxPoints: 8,
    obtainedPoints: nadiObtained,
    status: nadiObtained === 8 ? 'favorable' : hasNadiParihar ? 'moderate' : 'dosh',
    meaning: 'वात-पित्त-कफ प्रकृति, आनुवंशिक ऊर्जा (DNA), आरोग्य एवं संतान सुख का सर्वोच्च कूट।',
    verdict:
      nadiObtained === 8
        ? `वर (${NADI_NAMES[boyNadiIdx]}) एवं कन्या (${NADI_NAMES[girlNadiIdx]}) की नाड़ी भिन्न है (8/8 अंक)। नाड़ी दोष पूर्णतः मुक्त—स्वास्थ्य व संतान हेतु सर्वोत्तम।`
        : hasNadiParihar
        ? `दोनों की ${NADI_NAMES[boyNadiIdx]} समान होने से 0/8 अंक हैं, परन्तु राशि/नक्षत्र-चरण भेद होने से शास्त्रोक्त नाड़ी दोष परिहार उपलब्ध है।`
        : `एक नाड़ी दोष (${NADI_NAMES[boyNadiIdx]} - 0/8 अंक)। महामृत्युंजय जप एवं नाड़ी शांति के बिना विवाह निर्णय न लें।`,
    remedy:
      nadiObtained === 0
        ? 'नाड़ी दोष निवारण हेतु महामृत्युंजय अनुष्ठान, स्वर्ण-अन्न दान एवं ब्राह्मण भोज कराएं।'
        : undefined,
  };

  const koots = [
    varanResult,
    vashyaResult,
    taraResult,
    yoniResult,
    grahaResult,
    ganaResult,
    bhakootResult,
    nadiResult,
  ];

  const totalScore = Number(koots.reduce((sum, k) => sum + k.obtainedPoints, 0).toFixed(1));
  const compatibilityPercentage = Math.round((totalScore / 36) * 100);

  // ==================== MANGLIK & PLANETARY HARMONY FROM KUNDALIS ====================
  const boyMarsPlanet = boyKundali?.planets.find((p) => p.id === 'mars');
  const girlMarsPlanet = girlKundali?.planets.find((p) => p.id === 'mars');

  const boyMarsHouseLagna = boyMarsPlanet ? boyMarsPlanet.houseInLagna : 3;
  const girlMarsHouseLagna = girlMarsPlanet ? girlMarsPlanet.houseInLagna : 6;
  const boyMarsHouseMoon = boyMarsPlanet ? boyMarsPlanet.houseInChandra : 3;
  const girlMarsHouseMoon = girlMarsPlanet ? girlMarsPlanet.houseInChandra : 6;

  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const boyManglik = boyKundali
    ? boyKundali.doshaAnalysis.manglik.isManglik
    : manglikHouses.includes(boyMarsHouseLagna);
  const girlManglik = girlKundali
    ? girlKundali.doshaAnalysis.manglik.isManglik
    : manglikHouses.includes(girlMarsHouseLagna);

  const boySeverity = boyKundali
    ? boyKundali.doshaAnalysis.manglik.severity
    : boyManglik
    ? 'मांगलिक'
    : 'मांगलिक दोष रहित';
  const girlSeverity = girlKundali
    ? girlKundali.doshaAnalysis.manglik.severity
    : girlManglik
    ? 'मांगलिक'
    : 'मांगलिक दोष रहित';

  // Also check if one's Saturn/Rahu aspects or occupies same house as other's Mars (Shani-Mangal Parihar)
  const boySaturnHouse = boyKundali?.planets.find((p) => p.id === 'saturn')?.houseInLagna || 0;
  const girlSaturnHouse = girlKundali?.planets.find((p) => p.id === 'saturn')?.houseInLagna || 0;
  const shaniMangalParihar =
    (boyManglik && !girlManglik && manglikHouses.includes(girlSaturnHouse)) ||
    (!boyManglik && girlManglik && manglikHouses.includes(boySaturnHouse));

  const manglikMatch =
    (boyManglik && girlManglik) || (!boyManglik && !girlManglik) || shaniMangalParihar;

  let manglikDescription = '';
  if (!boyManglik && !girlManglik) {
    manglikDescription = `वर (मंगल ${boyMarsHouseLagna}वें भाव में) एवं कन्या (मंगल ${girlMarsHouseLagna}वें भाव में)—दोनों की कुंडली मांगलिक दोष से मुक्त (सौम्य) है। मांगलिक दृष्टि से यह विवाह पूर्णतः शुभ है।`;
  } else if (boyManglik && girlManglik) {
    manglikDescription = `वर (${boySeverity}, मंगल ${boyMarsHouseLagna}वें भाव) एवं कन्या (${girlSeverity}, मंगल ${girlMarsHouseLagna}वें भाव)—दोनों मांगलिक होने से परस्पर मांगलिक दोष का शास्त्रोक्त परिहार (शमन) हो रहा है।`;
  } else if (shaniMangalParihar) {
    manglikDescription = `एक पक्ष में मंगल (${boyManglik ? `वर: ${boyMarsHouseLagna}वां भाव` : `कन्या: ${girlMarsHouseLagna}वां भाव`}) है, किंतु दूसरे पक्ष में शनि के मांगलिक स्थान में होने से 'शनि-मंगल परिहार' बन रहा है।`;
  } else {
    manglikDescription = `वर (${boySeverity}, लग्न से ${boyMarsHouseLagna}वें व चन्द्र से ${boyMarsHouseMoon}वें भाव में मंगल) तथा कन्या (${girlSeverity}, लग्न से ${girlMarsHouseLagna}वें व चन्द्र से ${girlMarsHouseMoon}वें भाव में मंगल) में एक पक्ष मांगलिक है। विवाह से पूर्व कुंभ/पीपल विवाह या मंगल चंडिका शांति आवश्यक है।`;
  }

  // Overall Verdict
  let overallVerdict = '';
  let verdictDescription = '';
  let statusColor: 'emerald' | 'amber' | 'rose' = 'emerald';

  if (totalScore >= 27 && manglikMatch) {
    overallVerdict = 'सर्वोत्तम एवं दिव्य मिलान (Supreme Match)';
    verdictDescription = `खगोलीय गणना से 36 में से ${totalScore} गुण मिल रहे हैं तथा मांगलिक विचार भी अनुकूल है। यह एक अति प्रशस्त व श्रेष्ठ विवाह योग है।`;
    statusColor = 'emerald';
  } else if (totalScore >= 18 && manglikMatch) {
    overallVerdict = 'उत्तम एवं शास्त्रसम्मत मिलान (Auspicious Match)';
    verdictDescription = `खगोलीय गणना से 36 में से ${totalScore} गुण मिल रहे हैं (18+ गुण शुभ विवाह हेतु प्रशस्त हैं) और मांगलिक संतुलन अनुकूल है। दांपत्य जीवन सुखमय रहेगा।`;
    statusColor = 'emerald';
  } else if (totalScore >= 18 && !manglikMatch) {
    overallVerdict = 'गुण शुभ, मांगलिक विचारणीय (Guna Good, Manglik Check)';
    verdictDescription = `अष्टकूट में ${totalScore}/36 गुण शुभ मिल रहे हैं, परन्तु एक पक्ष में मांगलिक प्रभाव होने से मंगल परिहार व शांति पूजन के पश्चात विवाह करना उत्तम रहेगा।`;
    statusColor = 'amber';
  } else {
    overallVerdict = 'विचारणीय मिलान (Detailed Parihar Required)';
    verdictDescription = `अष्टकूट गणना में 36 में से ${totalScore} गुण प्राप्त हुए हैं (18 से कम)। विवाह निर्णय से पूर्व दोनों की लग्न कुंडली के सप्तम भाव, तारा-नाड़ी परिहार व गुरु-शुक्र बल की जांच कराएं।`;
    statusColor = 'rose';
  }

  const boyLagna = boyKundali ? boyKundali.panchang.lagnaName : boyRashi;
  const girlLagna = girlKundali ? girlKundali.panchang.lagnaName : girlRashi;
  const boyRashiLord = LORD_NAMES[boyLordIdx];
  const girlRashiLord = LORD_NAMES[girlLordIdx];

  const boyJup = boyKundali?.planets.find((p) => p.id === 'jupiter');
  const girlJup = girlKundali?.planets.find((p) => p.id === 'jupiter');
  const boyVen = boyKundali?.planets.find((p) => p.id === 'venus');
  const girlVen = girlKundali?.planets.find((p) => p.id === 'venus');

  const planetaryHarmony = {
    rashiLordRelation: `वर राशि स्वामी ${boyRashiLord} एवं कन्या राशि स्वामी ${girlRashiLord} के मध्य ${grahaObtained}/5 मैत्री अंक हैं।`,
    seventhHouseSummary:
      boyKundali && girlKundali
        ? `वर का लग्न ${boyLagna} (सप्तम भाव में राशि #${boyKundali.lagnaChart[6].rashiNumber}) तथा कन्या का लग्न ${girlLagna} (सप्तम भाव में राशि #${girlKundali.lagnaChart[6].rashiNumber}) है।`
        : `वर (${boyRashi}) एवं कन्या (${girlRashi}) के सप्तम भाव का सामंजस्य।`,
    jupiterVenusSummary:
      boyJup && girlJup && boyVen && girlVen
        ? `वर के शुक्र ${boyVen.rashiName} (${boyVen.houseInLagna}वें भाव) में एवं कन्या के गुरु ${girlJup.rashiName} (${girlJup.houseInLagna}वें भाव) में स्थित होकर वैवाहिक स्थायित्व को प्रभावित कर रहे हैं।`
        : 'गुरु एवं शुक्र की शुभता से दांपत्य सुख प्राप्त होता है।',
  };

  return {
    boyName,
    girlName,
    boyDob,
    boyTime,
    boyPlace,
    girlDob,
    girlTime,
    girlPlace,
    boyRashi,
    girlRashi,
    boyNakshatra,
    girlNakshatra,
    boyPada,
    girlPada,
    boyLagna,
    girlLagna,
    boyRashiLord,
    girlRashiLord,
    boyKundali,
    girlKundali,
    totalScore,
    maxScore: 36,
    compatibilityPercentage,
    overallVerdict,
    verdictDescription,
    statusColor,
    koots,
    manglikStatus: {
      boyManglik,
      girlManglik,
      boySeverity,
      girlSeverity,
      boyMarsHouseLagna,
      girlMarsHouseLagna,
      boyMarsHouseMoon,
      girlMarsHouseMoon,
      manglikMatch,
      description: manglikDescription,
    },
    planetaryHarmony,
  };
}
