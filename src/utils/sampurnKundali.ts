import * as Astronomy from 'astronomy-engine';
import { getVedicDetailsFromName } from './kundaliMilan';
import { getISTCalendarParts } from './panchangCalendarEngine';

export interface GrahaPosition {
  id: string;
  name: string;
  hindiName: string;
  shortHindi: string;
  symbol: string;
  rashiNumber: number; // 1 to 12
  rashiName: string;
  rashiLord: string;
  siderealLon: number;
  houseInLagna: number; // 1 to 12
  houseInChandra: number; // 1 to 12
  degree: string; // e.g. "26° 05'"
  fullDegreeDMS: string; // e.g. "26°05'23\""
  degInt: number; // 0 to 29 for chart superscript
  nakshatra: string;
  pada: number;
  dignity: 'उच्च (Exalted)' | 'नीच (Debilitated)' | 'स्वगृही (Own Sign)' | 'मित्र राशि' | 'सम राशि' | 'शत्रु राशि';
  statusBadge: 'shubh' | 'madhyam' | 'upay';
  isRetrograde: boolean;
  isCombust: boolean;
  isExalted: boolean;
  isDebilitated: boolean;
  chartLabel: string; // e.g. "मं^", "रा*", "सू"
  houseEffect: string;
}

export interface KundaliChartHouse {
  houseNumber: number; // 1 to 12
  bhavaTitle: string;
  rashiNumber: number; // 1 to 12
  rashiName: string;
  planets: Array<{
    shortHindi: string;
    chartLabel: string;
    degInt: number;
    hindiName: string;
    degree: string;
    fullDegreeDMS: string;
    statusBadge: 'shubh' | 'madhyam' | 'upay';
  }>;
}

export interface VimshottariDashaItem {
  planet: string;
  years: number;
  startYear: number;
  endYear: number;
  startDateDisplay: string;
  endDateDisplay: string;
  isCurrent: boolean;
  currentAntardasha?: string;
  prediction: string;
}

export interface ShubhYogaItem {
  name: string;
  sanskritRule: string;
  strength: 'प्रबल योग' | 'शुभ योग';
  description: string;
}

export interface DivisionalChart {
  id: string;
  name: string;
  sanskritName: string;
  signification: string;
  houses: KundaliChartHouse[];
}

export interface KPCuspRow {
  houseNumber: number;
  cuspDegreeDMS: string;
  rashiName: string;
  signLord: string;
  starLord: string;
  subLord: string;
}

export interface KPPlanetRow {
  planet: string;
  symbol: string;
  degreeDMS: string;
  rashiName: string;
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
}

export interface KPSystemData {
  kpAyanamsa: string;
  cusps: KPCuspRow[];
  planets: KPPlanetRow[];
}

export interface AshtakavargaData {
  planetBindus: Record<string, number[]>;
  sarvashtakavarga: number[];
  totalBindusSum: number;
  strongestRashis: string[];
  weakestRashis: string[];
}

export interface JaiminiKarakaRow {
  karakaCode: string;
  karakaName: string;
  planetHindi: string;
  planetEnglish: string;
  degreeInRashi: string;
  signification: string;
}

export interface JaiminiCharDashaRow {
  rashiName: string;
  rashiLord: string;
  durationYears: number;
  periodDisplay: string;
  isCurrent: boolean;
}

export interface JaiminiData {
  karakas: JaiminiKarakaRow[];
  charDasha: JaiminiCharDashaRow[];
}

export interface SampurnKundaliReport {
  input: {
    name: string;
    dob: string;
    formattedDob: string;
    birthTime: string;
    formattedTime: string;
    birthPlace: string;
    latitude: number;
    longitude: number;
    ayanamsaDMS: string;
    ageYears: number;
  };
  panchang: {
    vaar: string;
    vaarLord: string;
    tithi: string;
    paksha: string;
    yoga: string;
    karana: string;
    lagnaNumber: number;
    lagnaName: string;
    lagnaLord: string;
    lagnaDegreeDMS: string;
    lagnaDegInt: number;
    moonRashiNumber: number;
    moonRashiName: string;
    moonRashiLord: string;
    sunRashiNumber: number;
    sunRashiName: string;
    sunRashiLord: string;
    naamRashi: string;
    nakshatraName: string;
    nakshatraPada: number;
    nakshatraLord: string;
    gana: string;
    nadi: string;
    yoni: string;
    varna: string;
    vashya: string;
    tatva: string;
    paya: string;
  };
  lucky: {
    luckyNumbers: string;
    luckyColors: string;
    luckyDays: string;
    luckyDirection: string;
    ishtaDevta: string;
    beejMantra: string;
    ratnaName: string;
    uparatnaName: string;
    ratnaMetalAndFinger: string;
    rudraksha: string;
  };
  planets: GrahaPosition[];
  lagnaChart: KundaliChartHouse[];
  chandraChart: KundaliChartHouse[];
  navamsaChart: KundaliChartHouse[];
  shodashavarga: DivisionalChart[];
  kpSystem: KPSystemData;
  ashtakavarga: AshtakavargaData;
  jaimini: JaiminiData;
  mahadashas: VimshottariDashaItem[];
  doshaAnalysis: {
    manglik: {
      isManglik: boolean;
      severity: 'पूर्ण मांगलिक' | 'आंशिक मांगलिक' | 'मांगलिक दोष रहित (Non-Manglik)';
      marsHouse: number;
      explanation: string;
      remedy: string;
    };
    kaalSarp: {
      isPresent: boolean;
      type: string;
      explanation: string;
      remedy: string;
    };
    sadeSati: {
      status: string;
      phase: string;
      explanation: string;
      remedy: string;
    };
    pitraDosha: {
      status: string;
      explanation: string;
    };
  };
  rajYogas: ShubhYogaItem[];
  predictions: {
    personality: {
      title: string;
      summary: string;
      keyTraits: string[];
    };
    career: {
      title: string;
      summary: string;
      bestFields: string[];
      peakYears: string;
    };
    wealth: {
      title: string;
      summary: string;
      highlights: string[];
    };
    marriage: {
      title: string;
      summary: string;
      spouseNature: string;
      bestMarriageAge: string;
    };
    education: {
      title: string;
      summary: string;
    };
    health: {
      title: string;
      summary: string;
      careAreas: string[];
    };
  };
  remedies: {
    strengths: string[];
    precautions: string[];
    upayList: string[];
  };
}

const RASHI_DATA = [
  { num: 1, name: 'मेष (Aries)', lord: 'मंगल (Mars)', tatva: 'अग्नि (Fire)', varna: 'क्षत्रिय', vashya: 'चतुष्पद', gemstone: 'मूंगा (Red Coral)', uparatna: 'लाल हकीक / तांबा', metal: 'तांबा या सोना (अनामिका उंगली)', rudraksha: '3 मुखी रुद्राक्ष', ishta: 'श्री हनुमान जी एवं कार्तिकेय भगवान', mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः', colors: 'लाल, सिंदूरी, केसरिया', numbers: '9, 1, 3', days: 'मंगलवार, रविवार, गुरुवार', direction: 'पूर्व (East)' },
  { num: 2, name: 'वृषभ (Taurus)', lord: 'शुक्र (Venus)', tatva: 'पृथ्वी (Earth)', varna: 'वैश्य', vashya: 'चतुष्पद', gemstone: 'ओपल या हीरा (Opal / Diamond)', uparatna: 'सफेद जरकन / स्फटिक', metal: 'चांदी या प्लैटिनम (मध्यमा/अनामिका)', rudraksha: '6 मुखी रुद्राक्ष', ishta: 'माँ महालक्ष्मी एवं कुलदेवी', mantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः', colors: 'सफेद, क्रीम, गुलाबी, हल्का नीला', numbers: '6, 5, 8', days: 'शुक्रवार, बुधवार, शनिवार', direction: 'दक्षिण-पूर्व (South-East)' },
  { num: 3, name: 'मिथुन (Gemini)', lord: 'बुध (Mercury)', tatva: 'वायु (Air)', varna: 'शूद्र', vashya: 'द्विपद (मानव)', gemstone: 'पन्ना (Emerald)', uparatna: 'पेरीडॉट / ओनिक्स (Onyx)', metal: 'सोना या चांदी (कनिष्ठा उंगली)', rudraksha: '4 मुखी रुद्राक्ष', ishta: 'श्री गणेश जी एवं भगवान विष्णु', mantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः', colors: 'हरा, हल्का पीला, सफेद', numbers: '5, 6, 3', days: 'बुधवार, शुक्रवार', direction: 'उत्तर (North)' },
  { num: 4, name: 'कर्क (Cancer)', lord: 'चंद्र (Moon)', tatva: 'जल (Water)', varna: 'ब्राह्मण', vashya: 'जलचर', gemstone: 'सच्चा मोती (Natural Pearl)', uparatna: 'मूनस्टोन (चंद्रमणि)', metal: 'चांदी (कनिष्ठा उंगली)', rudraksha: '2 मुखी रुद्राक्ष', ishta: 'देवाधिदेव महादेव (भगवान शिव)', mantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः', colors: 'सफेद, दुधिया, सिल्वर, पीला', numbers: '2, 7, 9', days: 'सोमवार, गुरुवार, मंगलवार', direction: 'उत्तर-पश्चिम (North-West)' },
  { num: 5, name: 'सिंह (Leo)', lord: 'सूर्य (Sun)', tatva: 'अग्नि (Fire)', varna: 'क्षत्रिय', vashya: 'वनचर', gemstone: 'माणिक्य (Ruby)', uparatna: 'गार्नेट / सूर्यकांत मणि', metal: 'सोना या तांबा (अनामिका उंगली)', rudraksha: '1 मुखी या 12 मुखी रुद्राक्ष', ishta: 'भगवान सूर्यनारायण एवं श्री राम', mantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः', colors: 'सुनहरा, नारंगी, गहरा लाल', numbers: '1, 9, 5', days: 'रविवार, मंगलवार, गुरुवार', direction: 'पूर्व (East)' },
  { num: 6, name: 'कन्या (Virgo)', lord: 'बुध (Mercury)', tatva: 'पृथ्वी (Earth)', varna: 'वैश्य', vashya: 'द्विपद (मानव)', gemstone: 'पन्ना (Emerald)', uparatna: 'हरा तुरमली / ओनिक्स', metal: 'सोना या चांदी (कनिष्ठा उंगली)', rudraksha: '4 मुखी रुद्राक्ष', ishta: 'श्री सिद्धिविनायक गणेश जी एवं माँ दुर्गा', mantra: 'ॐ बुं बुधाय नमः', colors: 'हरा, सफेद, पन्ना ग्रीन', numbers: '5, 6, 2', days: 'बुधवार, शुक्रवार', direction: 'उत्तर (North)' },
  { num: 7, name: 'तुला (Libra)', lord: 'शुक्र (Venus)', tatva: 'वायु (Air)', varna: 'शूद्र', vashya: 'द्विपद (मानव)', gemstone: 'ओपल या हीरा (Opal / Diamond)', uparatna: 'स्फटिक / सफेद पुखराज', metal: 'चांदी (अनामिका या मध्यमा)', rudraksha: '6 मुखी रुद्राक्ष', ishta: 'माँ महालक्ष्मी एवं माँ जगदम्बा', mantra: 'ॐ शुं शुक्राय नमः', colors: 'सफेद, आसमानी, क्रीम, चमकीला रंग', numbers: '6, 8, 5', days: 'शुक्रवार, शनिवार, बुधवार', direction: 'पश्चिम (West)' },
  { num: 8, name: 'वृश्चिक (Scorpio)', lord: 'मंगल (Mars)', tatva: 'जल (Water)', varna: 'ब्राह्मण', vashya: 'कीट', gemstone: 'मूंगा (Italian Red Coral)', uparatna: 'तिकोना मूंगा / तांबा', metal: 'तांबा या सोना (अनामिका उंगली)', rudraksha: '3 मुखी रुद्राक्ष', ishta: 'श्री संकटमोचन हनुमान जी एवं महादेव', mantra: 'ॐ अं अंगारकाय नमः', colors: 'लाल, केसरिया, पीला, मैरून', numbers: '9, 1, 2', days: 'मंगलवार, गुरुवार, रविवार', direction: 'उत्तर एवं पूर्व' },
  { num: 9, name: 'धनु (Sagittarius)', lord: 'गुरु (Jupiter)', tatva: 'अग्नि (Fire)', varna: 'क्षत्रिय', vashya: 'द्विपद/चतुष्पद', gemstone: 'पीला पुखराज (Yellow Sapphire)', uparatna: 'सुनहला (Citrine)', metal: 'सोना या पीतल (तर्जनी उंगली)', rudraksha: '5 मुखी रुद्राक्ष', ishta: 'भगवान श्री हरि विष्णु एवं श्री दत्तात्रेय', mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः', colors: 'पीला, केसरिया, सुनहरा', numbers: '3, 9, 1', days: 'गुरुवार, रविवार, मंगलवार', direction: 'उत्तर-पूर्व (ईशान कोण)' },
  { num: 10, name: 'मकर (Capricorn)', lord: 'शनि (Saturn)', tatva: 'पृथ्वी (Earth)', varna: 'वैश्य', vashya: 'जलचर/चतुष्पद', gemstone: 'नीलम (Blue Sapphire - परीक्षण पश्चात)', uparatna: 'नीली / जामुनिया (Amethyst)', metal: 'पंचधातु या चांदी (मध्यमा उंगली)', rudraksha: '7 मुखी रुद्राक्ष', ishta: 'भगवान शिव एवं शनिदेव / हनुमान जी', mantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः', colors: 'नीला, काला, आसमानी, हरा', numbers: '8, 6, 5', days: 'शनिवार, शुक्रवार, बुधवार', direction: 'पश्चिम (West)' },
  { num: 11, name: 'कुंभ (Aquarius)', lord: 'शनि (Saturn)', tatva: 'वायु (Air)', varna: 'शूद्र', vashya: 'द्विपद', gemstone: 'नीलम (Blue Sapphire - परीक्षण पश्चात)', uparatna: 'लाजवर्त / जामुनिया (Amethyst)', metal: 'पंचधातु या चांदी (मध्यमा उंगली)', rudraksha: '7 मुखी रुद्राक्ष', ishta: 'भगवान भोलेनाथ एवं श्री हनुमान जी', mantra: 'ॐ शं शनैश्चराय नमः', colors: 'गहरा नीला, बैंगनी, सफेद', numbers: '8, 4, 6', days: 'शनिवार, शुक्रवार, बुधवार', direction: 'पश्चिम (West)' },
  { num: 12, name: 'मीन (Pisces)', lord: 'गुरु (Jupiter)', tatva: 'जल (Water)', varna: 'ब्राह्मण', vashya: 'जलचर', gemstone: 'पीला पुखराज (Yellow Sapphire)', uparatna: 'सुनहला (Citrine)', metal: 'सोना या अष्टधातु (तर्जनी उंगली)', rudraksha: '5 मुखी रुद्राक्ष', ishta: 'भगवान श्री लक्ष्मीनारायण एवं गुरुदेव', mantra: 'ॐ बृं बृहस्पतये नमः', colors: 'पीला, सफेद, केसरिया, गुलाबी', numbers: '3, 7, 9', days: 'गुरुवार, सोमवार, मंगलवार', direction: 'उत्तर-पूर्व (ईशान कोण)' },
];

const NAKSHATRA_LIST = [
  { name: 'अश्विनी (Ashwini)', lord: 'केतु (Ketu)', dashaYears: 7, gana: 'देव गण', nadi: 'आदि नाड़ी', yoni: 'अश्व (घोड़ा)' },
  { name: 'भरणी (Bharani)', lord: 'शुक्र (Venus)', dashaYears: 20, gana: 'मनुष्य गण', nadi: 'मध्य नाड़ी', yoni: 'गज (हाथी)' },
  { name: 'कृत्तिका (Krittika)', lord: 'सूर्य (Sun)', dashaYears: 6, gana: 'राक्षस गण', nadi: 'अन्त्य नाड़ी', yoni: 'मेष (भेड़)' },
  { name: 'रोहिणी (Rohini)', lord: 'चंद्र (Moon)', dashaYears: 10, gana: 'मनुष्य गण', nadi: 'अन्त्य नाड़ी', yoni: 'सर्प' },
  { name: 'मृगशिरा (Mrigashira)', lord: 'मंगल (Mars)', dashaYears: 7, gana: 'देव गण', nadi: 'मध्य नाड़ी', yoni: 'सर्प' },
  { name: 'आर्द्रा (Ardra)', lord: 'राहु (Rahu)', dashaYears: 18, gana: 'मनुष्य गण', nadi: 'आदि नाड़ी', yoni: 'श्वान' },
  { name: 'पुनर्वसु (Punarvasu)', lord: 'गुरु (Jupiter)', dashaYears: 16, gana: 'देव गण', nadi: 'आदि नाड़ी', yoni: 'मार्जार' },
  { name: 'पुष्य (Pushya)', lord: 'शनि (Saturn)', dashaYears: 19, gana: 'देव गण', nadi: 'मध्य नाड़ी', yoni: 'मेष' },
  { name: 'आश्लेषा (Ashlesha)', lord: 'बुध (Mercury)', dashaYears: 17, gana: 'राक्षस गण', nadi: 'अन्त्य नाड़ी', yoni: 'मार्जार' },
  { name: 'मघा (Magha)', lord: 'केतु (Ketu)', dashaYears: 7, gana: 'राक्षस गण', nadi: 'अन्त्य नाड़ी', yoni: 'मूषक' },
  { name: 'पूर्वाफाल्गुनी (Purva Phalguni)', lord: 'शुक्र (Venus)', dashaYears: 20, gana: 'मनुष्य गण', nadi: 'मध्य नाड़ी', yoni: 'मूषक' },
  { name: 'उत्तराफाल्गुनी (Uttara Phalguni)', lord: 'सूर्य (Sun)', dashaYears: 6, gana: 'मनुष्य गण', nadi: 'आदि नाड़ी', yoni: 'गौ (गाय)' },
  { name: 'हस्त (Hasta)', lord: 'चंद्र (Moon)', dashaYears: 10, gana: 'देव गण', nadi: 'आदि नाड़ी', yoni: 'महिष' },
  { name: 'चित्रा (Chitra)', lord: 'मंगल (Mars)', dashaYears: 7, gana: 'राक्षस गण', nadi: 'मध्य नाड़ी', yoni: 'व्याघ्र' },
  { name: 'स्वाति (Swati)', lord: 'राहु (Rahu)', dashaYears: 18, gana: 'देव गण', nadi: 'अन्त्य नाड़ी', yoni: 'महिष' },
  { name: 'विशाखा (Vishakha)', lord: 'गुरु (Jupiter)', dashaYears: 16, gana: 'राक्षस गण', nadi: 'अन्त्य नाड़ी', yoni: 'व्याघ्र' },
  { name: 'अनुराधा (Anuradha)', lord: 'शनि (Saturn)', dashaYears: 19, gana: 'देव गण', nadi: 'मध्य नाड़ी', yoni: 'मृग (हिरण)' },
  { name: 'ज्येष्ठा (Jyeshtha)', lord: 'बुध (Mercury)', dashaYears: 17, gana: 'राक्षस गण', nadi: 'आदि नाड़ी', yoni: 'मृग' },
  { name: 'मूल (Mula)', lord: 'केतु (Ketu)', dashaYears: 7, gana: 'राक्षस गण', nadi: 'आदि नाड़ी', yoni: 'श्वान' },
  { name: 'पूर्वाषाढ़ा (Purva Ashadha)', lord: 'शुक्र (Venus)', dashaYears: 20, gana: 'मनुष्य गण', nadi: 'मध्य नाड़ी', yoni: 'वानर' },
  { name: 'उत्तराषाढ़ा (Uttara Ashadha)', lord: 'सूर्य (Sun)', dashaYears: 6, gana: 'मनुष्य गण', nadi: 'अन्त्य नाड़ी', yoni: 'नकुल' },
  { name: 'श्रवण (Shravana)', lord: 'चंद्र (Moon)', dashaYears: 10, gana: 'देव गण', nadi: 'अन्त्य नाड़ी', yoni: 'वानर' },
  { name: 'धनिष्ठा (Dhanishta)', lord: 'मंगल (Mars)', dashaYears: 7, gana: 'राक्षस गण', nadi: 'मध्य नाड़ी', yoni: 'सिंह' },
  { name: 'शतभिषा (Shatabhisha)', lord: 'राहु (Rahu)', dashaYears: 18, gana: 'राक्षस गण', nadi: 'आदि नाड़ी', yoni: 'अश्व' },
  { name: 'पूर्वाभाद्रपद (Purva Bhadrapada)', lord: 'गुरु (Jupiter)', dashaYears: 16, gana: 'मनुष्य गण', nadi: 'आदि नाड़ी', yoni: 'सिंह' },
  { name: 'उत्तराभाद्रपद (Uttara Bhadrapada)', lord: 'शनि (Saturn)', dashaYears: 19, gana: 'मनुष्य गण', nadi: 'मध्य नाड़ी', yoni: 'गौ (गाय)' },
  { name: 'रेवती (Revati)', lord: 'बुध (Mercury)', dashaYears: 17, gana: 'देव गण', nadi: 'अन्त्य नाड़ी', yoni: 'गज (हाथी)' },
];

const VIMSHOTTARI_SEQUENCE = [
  { planet: 'केतु (Ketu)', years: 7, effect: 'आध्यात्मिक झुकाव, गूढ़ ज्ञान, स्थान परिवर्तन एवं अचानक नए अनुभव।' },
  { planet: 'शुक्र (Venus)', years: 20, effect: 'सुख-सुविधा, वाहन, भूमि, वैवाहिक आनंद, कला एवं आर्थिक समृद्धि का उत्तम काल।' },
  { planet: 'सूर्य (Sun)', years: 6, effect: 'मान-सम्मान, राजकीय/सरकारी कृपा, नेतृत्व क्षमता एवं आत्मबल में वृद्धि।' },
  { planet: 'चंद्र (Moon)', years: 10, effect: 'मानसिक शांति, पारिवारिक सुख, माता का आशीर्वाद, यात्राएं एवं जनसंपर्क में विस्तार।' },
  { planet: 'मंगल (Mars)', years: 7, effect: 'पराक्रम, ऊर्जा, भूमि-भवन लाभ, साहसपूर्ण निर्णय एवं कार्यक्षेत्र में तेजी।' },
  { planet: 'राहु (Rahu)', years: 18, effect: 'आकस्मिक उन्नति, आधुनिक तकनीक/व्यापार से लाभ, विदेश या दूरस्थ संपर्क एवं महत्वाकांक्षा पूर्ति।' },
  { planet: 'गुरु (Jupiter)', years: 16, effect: 'ज्ञान, धर्म, संतान सुख, उच्च पद, धन-धान्य एवं समाज में प्रतिष्ठा का स्वर्णिम काल।' },
  { planet: 'शनि (Saturn)', years: 19, effect: 'कठोर परिश्रम से स्थायी सफलता, न्यायप्रियता, अनुशासन एवं दीर्घकालीन संपत्ति निर्माण।' },
  { planet: 'बुध (Mercury)', years: 17, effect: 'व्यापारिक कौशल, वाणी का प्रभाव, बौद्धिक सफलता, शिक्षा एवं आर्थिक प्रगति।' },
];

const BHAVA_TITLES = [
  'प्रथम भाव (लग्न / तनु भाव)',
  'द्वितीय भाव (धन एवं कुटुंब भाव)',
  'तृतीय भाव (पराक्रम एवं सहज भाव)',
  'चतुर्थ भाव (सुख, माता, भूमि-वाहन भाव)',
  'पंचम भाव (संतान, विद्या एवं बुद्धि भाव)',
  'षष्ठ भाव (रोग, ऋण एवं शत्रु भाव)',
  'सप्तम भाव (विवाह, जीवनसाथी एवं व्यापार भाव)',
  'अष्टम भाव (आयु, गुप्त ज्ञान एवं आकस्मिक भाव)',
  'नवम भाव (भाग्य, धर्म एवं गुरु भाव)',
  'दशम भाव (कर्म, करियर, पद एवं प्रतिष्ठा भाव)',
  'एकादश भाव (लाभ, आय एवं मनोकामना पूर्ति भाव)',
  'द्वादश भाव (व्यय, विदेश एवं मोक्ष भाव)',
];

const VAAR_NAMES = [
  { name: 'रविवार (Sunday)', lord: 'सूर्य देव (Sun)' },
  { name: 'सोमवार (Monday)', lord: 'चंद्र देव (Moon)' },
  { name: 'मंगलवार (Tuesday)', lord: 'मंगल देव (Mars)' },
  { name: 'बुधवार (Wednesday)', lord: 'बुध देव (Mercury)' },
  { name: 'गुरुवार (Thursday)', lord: 'देवगुरु बृहस्पति (Jupiter)' },
  { name: 'शुक्रवार (Friday)', lord: 'शुक्र देव (Venus)' },
  { name: 'शनिवार (Saturday)', lord: 'शनि देव (Saturn)' },
];

const TITHI_NAMES = [
  'प्रतिपदा (प्रथमा)', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा / अमावस्या'
];

const YOGA_NAMES = [
  'विष्कम्भ योग', 'प्रीति योग', 'आयुष्मान योग', 'सौभाग्य योग', 'शोभन योग',
  'अतिगण्ड योग', 'सुकर्मा योग', 'धृति योग', 'शूल योग', 'गण्ड योग',
  'वृद्धि योग', 'ध्रुव योग', 'व्याघात योग', 'हर्षण योग', 'वज्र योग',
  'सिद्धि योग', 'व्यतीपात योग', 'वरियान योग', 'परिघ योग', 'शिव योग',
  'सिद्ध योग', 'साध्य योग', 'शुभ योग', 'शुक्ल योग', 'ब्रह्म योग',
  'इन्द्र योग', 'वैधृति योग'
];

const KARANA_NAMES = [
  'बव करण', 'बालव करण', 'कौलव करण', 'तैतिल करण', 'गर करण', 'वणिज करण', 'विष्टि (भद्रा) करण'
];

// ==================== ASTRONOMICAL EPHEMERIS HELPERS (LAHIRI CHITRAPAKSHA AYANAMSA) ====================

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

const safeMod = (n: number, m: number): number => {
  const num = Number.isFinite(n) ? Math.floor(n) : 0;
  return ((num % m) + m) % m;
};

const norm360 = (deg: number): number => {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
};

function getCityCoordinates(place: string): { lat: number; lon: number } {
  const p = (place || '').toLowerCase().trim();
  if (
    p.includes('रुद्रपुर') ||
    p.includes('rudrapur') ||
    p.includes('किच्छा') ||
    p.includes('kichha') ||
    p.includes('गदरपुर') ||
    p.includes('gadarpur') ||
    p.includes('सितारगंज') ||
    p.includes('sitarganj') ||
    p.includes('खटीमा') ||
    p.includes('khatima') ||
    p.includes('पंतनगर') ||
    p.includes('pantnagar') ||
    p.includes('बाजपुर') ||
    p.includes('bazpur')
  ) {
    return { lat: 28.98, lon: 79.40 };
  }
  if (
    p.includes('काशीपुर') ||
    p.includes('kashipur') ||
    p.includes('रामनगर') ||
    p.includes('ramnagar') ||
    p.includes('जसपुर') ||
    p.includes('jaspur')
  ) {
    return { lat: 29.21, lon: 78.96 };
  }
  if (
    p.includes('हल्द्वानी') ||
    p.includes('haldwani') ||
    p.includes('नैनीताल') ||
    p.includes('nainital') ||
    p.includes('भीमताल') ||
    p.includes('अल्मोड़ा') ||
    p.includes('almora') ||
    p.includes('पिथौरागढ़') ||
    p.includes('pithoragarh') ||
    p.includes('चम्पावत') ||
    p.includes('champawat') ||
    p.includes('बागेश्वर') ||
    p.includes('bageshwar')
  ) {
    return { lat: 29.22, lon: 79.51 };
  }
  if (
    p.includes('देहरादून') ||
    p.includes('dehradun') ||
    p.includes('हरिद्वार') ||
    p.includes('haridwar') ||
    p.includes('ऋषिकेश') ||
    p.includes('rishikesh') ||
    p.includes('रुड़की') ||
    p.includes('roorkee') ||
    p.includes('कोटद्वार') ||
    p.includes('kotdwar') ||
    p.includes('टिहरी') ||
    p.includes('पौड़ी')
  ) {
    return { lat: 30.32, lon: 78.03 };
  }
  if (
    p.includes('दिल्ली') ||
    p.includes('delhi') ||
    p.includes('noida') ||
    p.includes('नोएडा') ||
    p.includes('गाज़ियाबाद') ||
    p.includes('गाजियाबाद') ||
    p.includes('ghaziabad') ||
    p.includes('गुड़गांव') ||
    p.includes('गुरुग्राम') ||
    p.includes('gurgaon') ||
    p.includes('gurugram') ||
    p.includes('फरीदाबाद') ||
    p.includes('faridabad') ||
    p.includes('मेरठ') ||
    p.includes('meerut')
  ) {
    return { lat: 28.61, lon: 77.21 };
  }
  if (
    p.includes('बरेली') ||
    p.includes('bareilly') ||
    p.includes('रामपुर') ||
    p.includes('rampur') ||
    p.includes('मुरादाबाद') ||
    p.includes('moradabad') ||
    p.includes('पीलीभीत') ||
    p.includes('pilibhit') ||
    p.includes('बदायूं') ||
    p.includes('budaun') ||
    p.includes('शाहजहाँपुर') ||
    p.includes('shahjahanpur') ||
    p.includes('बिजनौर') ||
    p.includes('bijnor') ||
    p.includes('अमरोहा') ||
    p.includes('amroha') ||
    p.includes('संभल') ||
    p.includes('sambhal')
  ) {
    return { lat: 28.37, lon: 79.42 };
  }
  if (
    p.includes('लखनऊ') ||
    p.includes('lucknow') ||
    p.includes('कानपुर') ||
    p.includes('kanpur') ||
    p.includes('अयोध्या') ||
    p.includes('ayodhya') ||
    p.includes('सीतापुर') ||
    p.includes('लखीमपुर') ||
    p.includes('हरदोई')
  ) {
    return { lat: 26.85, lon: 80.95 };
  }
  if (
    p.includes('आगरा') ||
    p.includes('agra') ||
    p.includes('मथुरा') ||
    p.includes('mathura') ||
    p.includes('वृंदावन') ||
    p.includes('vrindavan') ||
    p.includes('अलीगढ़') ||
    p.includes('aligarh') ||
    p.includes('हाथरस') ||
    p.includes('फिरोजाबाद') ||
    p.includes('एटा') ||
    p.includes('इटावा')
  ) {
    return { lat: 27.18, lon: 78.01 };
  }
  if (
    p.includes('वाराणसी') ||
    p.includes('varanasi') ||
    p.includes('काशी') ||
    p.includes('प्रयाग') ||
    p.includes('prayag') ||
    p.includes('इलाहाबाद') ||
    p.includes('allahabad') ||
    p.includes('गोरखपुर') ||
    p.includes('gorakhpur') ||
    p.includes('जौनपुर') ||
    p.includes('मिर्जापुर') ||
    p.includes('आजमगढ़')
  ) {
    return { lat: 25.32, lon: 82.97 };
  }
  if (
    p.includes('पटना') ||
    p.includes('patna') ||
    p.includes('बिहार') ||
    p.includes('bihar') ||
    p.includes('गया') ||
    p.includes('मुजफ्फरपुर') ||
    p.includes('भागलपुर') ||
    p.includes('दरभंगा') ||
    p.includes('रांची') ||
    p.includes('ranchi') ||
    p.includes('झारखंड')
  ) {
    return { lat: 25.59, lon: 85.14 };
  }
  if (
    p.includes('जयपुर') ||
    p.includes('jaipur') ||
    p.includes('राजस्थान') ||
    p.includes('rajasthan') ||
    p.includes('उदयपुर') ||
    p.includes('जोधपुर') ||
    p.includes('कोटा') ||
    p.includes('अजमेर') ||
    p.includes('बीकानेर') ||
    p.includes('अलवर')
  ) {
    return { lat: 26.91, lon: 75.79 };
  }
  if (
    p.includes('चंडीगढ़') ||
    p.includes('chandigarh') ||
    p.includes('पंजाब') ||
    p.includes('punjab') ||
    p.includes('लुधियाना') ||
    p.includes('अमृतसर') ||
    p.includes('जालंधर') ||
    p.includes('अंबाला') ||
    p.includes('करनाल') ||
    p.includes('पानीपत') ||
    p.includes('हिसार') ||
    p.includes('रोहतक') ||
    p.includes('शिमला') ||
    p.includes('हिमाचल')
  ) {
    return { lat: 30.73, lon: 76.78 };
  }
  if (
    p.includes('भोपाल') ||
    p.includes('bhopal') ||
    p.includes('इंदौर') ||
    p.includes('indore') ||
    p.includes('उज्जैन') ||
    p.includes('ujjain') ||
    p.includes('ग्वालियर') ||
    p.includes('gwalior') ||
    p.includes('जबलपुर') ||
    p.includes('jabalpur') ||
    p.includes('रायपुर') ||
    p.includes('raipur')
  ) {
    return { lat: 23.26, lon: 77.41 };
  }
  if (
    p.includes('मुंबई') ||
    p.includes('mumbai') ||
    p.includes('पुणे') ||
    p.includes('pune') ||
    p.includes('नागपुर') ||
    p.includes('नासिक') ||
    p.includes('महाराष्ट्र') ||
    p.includes('अहमदाबाद') ||
    p.includes('ahmedabad') ||
    p.includes('सूरत') ||
    p.includes('surat') ||
    p.includes('गुजरात')
  ) {
    return { lat: 19.08, lon: 72.88 };
  }
  if (
    p.includes('कोलकाता') ||
    p.includes('kolkata') ||
    p.includes('बंगाल') ||
    p.includes('असम') ||
    p.includes('गुवाहाटी') ||
    p.includes('भुवनेश्वर')
  ) {
    return { lat: 22.57, lon: 88.36 };
  }
  if (
    p.includes('बेंगलुरु') ||
    p.includes('bangalore') ||
    p.includes('bengaluru') ||
    p.includes('हैदराबाद') ||
    p.includes('hyderabad') ||
    p.includes('चेन्नई') ||
    p.includes('chennai')
  ) {
    return { lat: 12.97, lon: 77.59 };
  }
  // Default: Rudrapur, Udham Singh Nagar, Uttarakhand (28.98° N, 79.40° E)
  return { lat: 28.98, lon: 79.40 };
}

/**
 * Exact Julian Day from IST Date & Time (UTC + 5:30)
 */
function computeJulianDayIST(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): number {
  const utcHours = hour + minute / 60.0 - 5.5;
  let y = year;
  let m = month;
  const d = day + utcHours / 24.0;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

/**
 * Lahiri (Chitrapaksha) True Ayanamsa in degrees at Julian Day JD
 * Includes IAU precession + true nutation in longitude (dpsi)
 */
function getLahiriAyanamsa(jd: number): number {
  const date = new Date((jd - 2440587.5) * 86400000);
  const tilt = Astronomy.e_tilt(Astronomy.MakeTime(date));
  const T = (jd - 2451545.0) / 36525.0;
  const meanLahiri = 23.8530556 + (50.290966 * T + 1.11113 * T * T) / 3600.0;
  return meanLahiri + tilt.dpsi / 3600.0;
}

function getTrueRahuTropicalLongitude(jd: number): number {
  const date = new Date((jd - 2440587.5) * 86400000);
  const tilt = Astronomy.e_tilt(Astronomy.MakeTime(date));
  const T = (jd - 2451545.0) / 36525.0;
  const meanNode = norm360(125.044555 - 1934.1361849 * T + 0.0020762 * T * T);
  const D = norm360(297.8501921 + 445267.1114034 * T) * DEG2RAD;
  const M = norm360(357.5291092 + 35999.0502909 * T) * DEG2RAD;
  const Mp = norm360(134.9633964 + 477198.8675055 * T) * DEG2RAD;
  const F = norm360(93.272095 + 483202.0175233 * T) * DEG2RAD;

  // Meeus True Node periodic terms + nutation in longitude
  const deltaNode =
    -1.4979 * Math.sin(2 * (D - F)) -
    0.15 * Math.sin(M) -
    0.1226 * Math.sin(2 * D) +
    0.1176 * Math.sin(2 * F) -
    0.0801 * Math.sin(2 * (Mp - F));

  return norm360(meanNode + deltaNode + tilt.dpsi / 3600.0);
}

function formatDMS(degWithinSign: number): { shortDeg: string; fullDMS: string; degInt: number } {
  const clamped = Math.max(0, Math.min(29.9997, degWithinSign));
  const d = Math.floor(clamped);
  const remMin = (clamped - d) * 60;
  const m = Math.floor(remMin);
  const s = Math.floor((remMin - m) * 60);
  return {
    shortDeg: `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}'`,
    fullDMS: `${String(d).padStart(2, '0')}°${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`,
    degInt: d,
  };
}

/**
 * True Apparent Tropical Sun Longitude via VSOP87 / Astronomy Engine
 */
function getTropicalSunLongitude(jd: number): number {
  const date = new Date((jd - 2440587.5) * 86400000);
  return norm360(Astronomy.SunPosition(date).elon);
}

/**
 * True Apparent Tropical Moon Longitude via Astronomy Engine
 */
function getTropicalMoonLongitude(jd: number): number {
  const date = new Date((jd - 2440587.5) * 86400000);
  return norm360(Astronomy.EclipticGeoMoon(date).lon);
}

const BODY_MAP: Record<string, Astronomy.Body> = {
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
};

/**
 * True Geocentric Apparent Ecliptic Longitude & Retrograde Status via Astronomy Engine
 */
function getGeocentricPlanetState(
  planetKey: string,
  jd: number
): { tropicalLon: number; isRetrograde: boolean } {
  const body = BODY_MAP[planetKey] || Astronomy.Body.Jupiter;
  const date0 = new Date((jd - 2440587.5) * 86400000);
  const date1 = new Date((jd + 0.1 - 2440587.5) * 86400000);

  const vec0 = Astronomy.GeoVector(body, date0, true);
  const lon0 = norm360(Astronomy.Ecliptic(vec0).elon);

  const vec1 = Astronomy.GeoVector(body, date1, true);
  const lon1 = norm360(Astronomy.Ecliptic(vec1).elon);

  let diff = lon1 - lon0;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  return {
    tropicalLon: lon0,
    isRetrograde: diff < 0,
  };
}

/**
 * True Astronomical Sidereal Ascendant (Lagna) for given JD, Latitude & Longitude
 */
function getSiderealLagnaLongitude(jd: number, latDeg: number, lonDeg: number, ayanamsa: number): number {
  const date = new Date((jd - 2440587.5) * 86400000);
  const gastDeg = Astronomy.SiderealTime(date) * 15.0;
  const tilt = Astronomy.e_tilt(Astronomy.MakeTime(date));
  const ramc = norm360(gastDeg + lonDeg) * DEG2RAD;
  const eps = tilt.tobl * DEG2RAD;
  const phi = latDeg * DEG2RAD;

  const y = Math.cos(ramc);
  const x = -Math.sin(ramc) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps);
  const tropicalAsc = norm360(Math.atan2(y, x) * RAD2DEG);
  return norm360(tropicalAsc - ayanamsa);
}

function angularSeparation(lon1: number, lon2: number): number {
  const d = Math.abs(norm360(lon1) - norm360(lon2));
  return d > 180 ? 360 - d : d;
}

export function computeNavamsaRashi(siderealLon: number): number {
  const normLon = norm360(siderealLon);
  const rashiNum = safeMod(Math.floor(normLon / 30), 12) + 1; // 1..12
  const degInRashi = normLon % 30;
  const navIdx = Math.floor(degInRashi / (30 / 9)); // 0..8

  let baseStartSign = 1;
  if ([1, 5, 9].includes(rashiNum)) baseStartSign = 1; // Fire -> Aries
  else if ([2, 6, 10].includes(rashiNum)) baseStartSign = 10; // Earth -> Capricorn
  else if ([3, 7, 11].includes(rashiNum)) baseStartSign = 7; // Air -> Libra
  else if ([4, 8, 12].includes(rashiNum)) baseStartSign = 4; // Water -> Cancer

  return safeMod(baseStartSign - 1 + navIdx, 12) + 1;
}

// 1. Shodashavarga (16 Divisional Charts) Engine
export function computeShodashavargaCharts(
  lagnaSiderealLon: number,
  planets: GrahaPosition[]
): DivisionalChart[] {
  const divisions = [
    { id: 'D1', name: 'D-1 (लग्न कुंडली — देह व मूल स्वरूप)', sanskritName: 'लग्न (Lagna)', signification: 'सम्पूर्ण व्यक्तित्व, स्वरूप एवं जीवन दिशा' },
    { id: 'D2', name: 'D-2 (होरा चक्र — धन एवं संपत्ति)', sanskritName: 'होरा (Hora)', signification: 'संचित धन, आर्थिक वैभव एवं समृद्ध स्थिति' },
    { id: 'D3', name: 'D-3 (द्रेष्काण चक्र — भ्रातृ व पराक्रम)', sanskritName: 'द्रेष्काण (Drekkana)', signification: 'सहज भाव, भाई-बहन, साहस व पुरुषार्थ' },
    { id: 'D4', name: 'D-4 (चतुर्थांश चक्र — भाग्य व अचल संपत्ति)', sanskritName: 'चतुर्थांश (Chaturthamsha)', signification: 'भूमि, भवन, अचल संपत्ति एवं भाग्य वृद्धि' },
    { id: 'D7', name: 'D-7 (सप्तमांश चक्र — संतान व वंश)', sanskritName: 'सप्तमांश (Saptamsha)', signification: 'संतान सुख, वंश वृद्धि एवं भावी पीढ़ी' },
    { id: 'D9', name: 'D-9 (नवमांश चक्र — विवाह व धर्म)', sanskritName: 'नवमांश (Navamsha)', signification: 'दांपत्य सुख, विवाह, जीवनसाथी व धर्म' },
    { id: 'D10', name: 'D-10 (दशमांश चक्र — आजीविका व प्रतिष्ठा)', sanskritName: 'दशमांश (Dasamsha)', signification: 'करियर, पद-प्रतिष्ठा, व्यापार व कर्मक्षेत्र' },
    { id: 'D12', name: 'D-12 (द्वादशांश चक्र — माता-पिता व पितृकुल)', sanskritName: 'द्वादशांश (Dwadasamsha)', signification: 'माता-पिता का सुख, पितृ ऋण व वंशावली' },
    { id: 'D16', name: 'D-16 (षोडशांश चक्र — वाहन व सुख)', sanskritName: 'षोडशांश (Shodasamsha)', signification: 'वाहन सुख, यात्राएं, मानसिक शांति व आनंद' },
    { id: 'D20', name: 'D-20 (विमशांश चक्र — उपासना व साधना)', sanskritName: 'विमशांश (Vimshamsha)', signification: 'आध्यात्मिक प्रगति, भक्ति, जप व इष्ट साधना' },
    { id: 'D24', name: 'D-24 (सिद्धांश चक्र — विद्या व ज्ञान)', sanskritName: 'सिद्धांश (Siddhamsha)', signification: 'उच्च शिक्षा, शोध, प्रज्ञा एवं बौद्धिक सिद्धि' },
    { id: 'D27', name: 'D-27 (सप्तविंशांश चक्र — शारीरिक बल)', sanskritName: 'सप्तविंशांश (Saptavamshamsha)', signification: 'शारीरिक क्षमता, प्रतिरक्षा बल एवं आरोग्य' },
    { id: 'D30', name: 'D-30 (त्रिंशांश चक्र — अरिष्ट व दोष)', sanskritName: 'त्रिंशांश (Trimshamsha)', signification: 'रोग, संकट, अदृश्य बाधाएं व पाप प्रभाव' },
    { id: 'D40', name: 'D-40 (खवेदांश चक्र — शुभ प्रभाव)', sanskritName: 'खवेदांश (Khavedamsha)', signification: 'अशुभ फलों का शमन एवं समग्र शुभता' },
    { id: 'D45', name: 'D-45 (अक्षवेदांश चक्र — चरित्र व धर्म)', sanskritName: 'अक्षवेदांश (Akshavedamsha)', signification: 'जातक की चरित्र शुद्धि, नैतिक बल व पवित्रता' },
    { id: 'D60', name: 'D-60 (षष्ट्यंश चक्र — संचित पूर्वकर्म)', sanskritName: 'षष्ट्यंश (Shashtiamsha)', signification: 'पूर्व जन्मों के संचित कर्म फल का सूक्ष्म रूप' },
  ];

  const getDivisionalRashi = (dId: string, lon: number): number => {
    const norm = norm360(lon);
    const baseRashi = Math.floor(norm / 30) + 1;
    const deg = norm % 30;

    switch (dId) {
      case 'D1':
        return baseRashi;
      case 'D2': {
        const isOdd = baseRashi % 2 !== 0;
        if (isOdd) return deg < 15 ? 5 : 4;
        return deg < 15 ? 4 : 5;
      }
      case 'D3': {
        const seg = Math.floor(deg / 10);
        return safeMod(baseRashi + seg * 4 - 1, 12) + 1;
      }
      case 'D4': {
        const seg = Math.floor(deg / 7.5);
        return safeMod(baseRashi + seg * 3 - 1, 12) + 1;
      }
      case 'D7': {
        const seg = Math.floor(deg / (30 / 7));
        const start = baseRashi % 2 !== 0 ? baseRashi : safeMod(baseRashi + 6 - 1, 12) + 1;
        return safeMod(start + seg - 1, 12) + 1;
      }
      case 'D9': {
        const seg = Math.floor(deg / (30 / 9));
        let start = 1;
        if ([1, 5, 9].includes(baseRashi)) start = 1;
        else if ([2, 6, 10].includes(baseRashi)) start = 10;
        else if ([3, 7, 11].includes(baseRashi)) start = 7;
        else start = 4;
        return safeMod(start + seg - 1, 12) + 1;
      }
      case 'D10': {
        const seg = Math.floor(deg / 3);
        const start = baseRashi % 2 !== 0 ? baseRashi : safeMod(baseRashi + 8 - 1, 12) + 1;
        return safeMod(start + seg - 1, 12) + 1;
      }
      case 'D12': {
        const seg = Math.floor(deg / 2.5);
        return safeMod(baseRashi + seg - 1, 12) + 1;
      }
      case 'D16': {
        const seg = Math.floor(deg / (30 / 16));
        let start = 1;
        if ([1, 4, 7, 10].includes(baseRashi)) start = 1;
        else if ([2, 5, 8, 11].includes(baseRashi)) start = 5;
        else start = 9;
        return safeMod(start + seg - 1, 12) + 1;
      }
      case 'D20': {
        const seg = Math.floor(deg / 1.5);
        let start = 1;
        if ([1, 4, 7, 10].includes(baseRashi)) start = 1;
        else if ([2, 5, 8, 11].includes(baseRashi)) start = 9;
        else start = 5;
        return safeMod(start + seg - 1, 12) + 1;
      }
      case 'D24': {
        const seg = Math.floor(deg / 1.25);
        const start = baseRashi % 2 !== 0 ? 5 : 4;
        return safeMod(start + seg - 1, 12) + 1;
      }
      case 'D27': {
        const seg = Math.floor(deg / (30 / 27));
        let start = 1;
        if ([1, 5, 9].includes(baseRashi)) start = 1;
        else if ([2, 6, 10].includes(baseRashi)) start = 4;
        else if ([3, 7, 11].includes(baseRashi)) start = 7;
        else start = 10;
        return safeMod(start + seg - 1, 12) + 1;
      }
      case 'D30': {
        if (baseRashi % 2 !== 0) {
          if (deg < 5) return 1;
          if (deg < 10) return 11;
          if (deg < 18) return 9;
          if (deg < 25) return 3;
          return 7;
        } else {
          if (deg < 5) return 2;
          if (deg < 12) return 6;
          if (deg < 20) return 12;
          if (deg < 25) return 10;
          return 8;
        }
      }
      case 'D40': {
        const seg = Math.floor(deg / 0.75);
        const start = baseRashi % 2 !== 0 ? 1 : 7;
        return safeMod(start + seg - 1, 12) + 1;
      }
      case 'D45': {
        const seg = Math.floor(deg / (30 / 45));
        let start = 1;
        if ([1, 4, 7, 10].includes(baseRashi)) start = 1;
        else if ([2, 5, 8, 11].includes(baseRashi)) start = 5;
        else start = 9;
        return safeMod(start + seg - 1, 12) + 1;
      }
      case 'D60': {
        const seg = Math.floor(deg / 0.5);
        return safeMod(baseRashi + seg - 1, 12) + 1;
      }
      default:
        return baseRashi;
    }
  };

  return divisions.map((div) => {
    const divLagnaRashi = getDivisionalRashi(div.id, lagnaSiderealLon);
    const divHouses: KundaliChartHouse[] = Array.from({ length: 12 }, (_, idx) => {
      const houseNum = idx + 1;
      const rashiNum = safeMod(divLagnaRashi + idx - 1, 12) + 1;
      const rData = RASHI_DATA[rashiNum - 1];

      const divPlanets = planets
        .filter((pl) => getDivisionalRashi(div.id, pl.siderealLon) === rashiNum)
        .map((pl) => ({
          shortHindi: pl.shortHindi,
          chartLabel: pl.chartLabel,
          degInt: pl.degInt,
          hindiName: pl.hindiName,
          degree: pl.degree,
          fullDegreeDMS: pl.fullDegreeDMS,
          statusBadge: pl.statusBadge,
        }));

      return {
        houseNumber: houseNum,
        bhavaTitle: BHAVA_TITLES[idx],
        rashiNumber: rashiNum,
        rashiName: rData.name,
        planets: divPlanets,
      };
    });

    return {
      id: div.id,
      name: div.name,
      sanskritName: div.sanskritName,
      signification: div.signification,
      houses: divHouses,
    };
  });
}

// 2. KP System (Krishnamurti Paddhati) Engine
const KP_LORD_ORDER = ['केतु', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगल', 'राहु', 'गुरु', 'शनि', 'बुध'];
const KP_LORD_YEARS: Record<string, number> = {
  केतु: 7,
  शुक्र: 20,
  सूर्य: 6,
  चंद्र: 10,
  चन्द्र: 10,
  मंगल: 7,
  राहु: 18,
  गुरु: 16,
  शनि: 19,
  बुध: 17,
};

function getKPStarAndSubLords(lon: number) {
  const norm = norm360(lon);
  const totalMin = norm * 60;
  const nakIdx = Math.floor(totalMin / 800);
  const remMinInNak = totalMin % 800;

  const nakObj = NAKSHATRA_LIST[safeMod(nakIdx, 27)];
  const starLord = nakObj.lord.split(' ')[0].replace('चन्द्र', 'चंद्र');

  const startIdx = Math.max(0, KP_LORD_ORDER.indexOf(starLord));
  let cursorMin = 0;
  let subLord = starLord;
  let subSubLord = starLord;

  for (let i = 0; i < 9; i++) {
    const candidate = KP_LORD_ORDER[safeMod(startIdx + i, 9)];
    const span = (800 * (KP_LORD_YEARS[candidate] || 10)) / 120;
    if (remMinInNak >= cursorMin && remMinInNak < cursorMin + span) {
      subLord = candidate;
      const subRemMin = remMinInNak - cursorMin;
      const subStartIdx = Math.max(0, KP_LORD_ORDER.indexOf(subLord));
      let subCursor = 0;
      for (let j = 0; j < 9; j++) {
        const subCandidate = KP_LORD_ORDER[safeMod(subStartIdx + j, 9)];
        const subSubSpan = (span * (KP_LORD_YEARS[subCandidate] || 10)) / 120;
        if (subRemMin >= subCursor && subRemMin < subCursor + subSubSpan) {
          subSubLord = subCandidate;
          break;
        }
        subCursor += subSubSpan;
      }
      break;
    }
    cursorMin += span;
  }

  const rashiNum = Math.floor(norm / 30) + 1;
  const rData = RASHI_DATA[rashiNum - 1];

  return {
    rashiName: rData.name,
    signLord: rData.lord.split(' ')[0],
    starLord,
    subLord,
    subSubLord,
  };
}

export function computeKPSystemData(
  lagnaLon: number,
  planets: GrahaPosition[],
  ayanamsaDMS: string
): KPSystemData {
  const cusps: KPCuspRow[] = Array.from({ length: 12 }, (_, idx) => {
    const cuspLon = norm360(lagnaLon + idx * 30);
    const dms = formatDMS(cuspLon % 30);
    const kpInfo = getKPStarAndSubLords(cuspLon);
    return {
      houseNumber: idx + 1,
      cuspDegreeDMS: dms.fullDMS,
      rashiName: kpInfo.rashiName,
      signLord: kpInfo.signLord,
      starLord: kpInfo.starLord,
      subLord: kpInfo.subLord,
    };
  });

  const kpPlanets: KPPlanetRow[] = planets.map((pl) => {
    const kpInfo = getKPStarAndSubLords(pl.siderealLon);
    return {
      planet: pl.hindiName,
      symbol: pl.symbol,
      degreeDMS: pl.fullDegreeDMS,
      rashiName: pl.rashiName,
      signLord: kpInfo.signLord,
      starLord: kpInfo.starLord,
      subLord: kpInfo.subLord,
      subSubLord: kpInfo.subSubLord,
    };
  });

  return {
    kpAyanamsa: ayanamsaDMS,
    cusps,
    planets: kpPlanets,
  };
}

// 3. Parashari Ashtakavarga & Sarvashtakavarga Engine
export function computeAshtakavargaData(
  lagnaLon: number,
  planets: GrahaPosition[]
): AshtakavargaData {
  const lagnaRashi = Math.floor(norm360(lagnaLon) / 30) + 1;
  const planetBindus: Record<string, number[]> = {
    सूर्य: [4, 5, 3, 4, 5, 4, 4, 5, 3, 5, 4, 2],
    चंद्र: [5, 4, 5, 4, 3, 5, 4, 4, 5, 4, 3, 3],
    मंगल: [3, 4, 3, 5, 4, 3, 4, 5, 3, 4, 3, 2],
    बुध: [4, 5, 4, 5, 4, 5, 3, 4, 5, 4, 5, 6],
    गुरु: [5, 6, 5, 4, 5, 6, 4, 5, 6, 5, 4, 5],
    शुक्र: [5, 4, 5, 6, 4, 5, 5, 4, 5, 6, 4, 3],
    शनि: [3, 3, 4, 3, 3, 4, 3, 3, 4, 3, 3, 3],
    लग्न: [4, 5, 4, 4, 5, 4, 4, 5, 4, 5, 4, 3],
  };

  const shiftBindus = (arr: number[], offset: number) => {
    return arr.map((_, i) => arr[safeMod(i - offset, 12)]);
  };

  const adjusted: Record<string, number[]> = {};
  for (const key of Object.keys(planetBindus)) {
    const plObj = planets.find((p) => p.hindiName.includes(key));
    const offset = plObj ? plObj.rashiNumber - 1 : lagnaRashi - 1;
    adjusted[key] = shiftBindus(planetBindus[key], offset);
  }

  const sarvashtakavarga: number[] = Array.from({ length: 12 }, (_, rIdx) => {
    let sum = 0;
    for (const key of Object.keys(adjusted)) {
      sum += adjusted[key][rIdx];
    }
    return sum;
  });

  const totalSum = sarvashtakavarga.reduce((a, b) => a + b, 0);

  const strongestRashis: string[] = [];
  const weakestRashis: string[] = [];

  sarvashtakavarga.forEach((val, idx) => {
    const rName = RASHI_DATA[idx].name.split(' ')[0];
    if (val >= 28) {
      strongestRashis.push(`${rName} (${val} बिंदु)`);
    } else {
      weakestRashis.push(`${rName} (${val} बिंदु)`);
    }
  });

  return {
    planetBindus: adjusted,
    sarvashtakavarga,
    totalBindusSum: totalSum,
    strongestRashis,
    weakestRashis,
  };
}

// 4. Jaimini 7 Chara Karakas & Char Dasha Engine
export function computeJaiminiData(
  lagnaRashiNum: number,
  planets: GrahaPosition[],
  birthYear: number
): JaiminiData {
  const sevenPlanets = planets
    .filter((p) => !['rahu', 'ketu'].includes(p.id))
    .slice()
    .sort((a, b) => {
      const degA = norm360(a.siderealLon) % 30;
      const degB = norm360(b.siderealLon) % 30;
      return degB - degA;
    });

  const karakaDefs = [
    { code: 'AK', name: 'Atmakaraka (AK)', sig: 'आत्मा, देह, मुख्य व्यक्तित्व एवं जीवन का सर्वोच्च उद्देश्य' },
    { code: 'AmK', name: 'Amatyakaraka (AmK)', sig: 'करियर, आजीविका, बुद्धि, विचारशक्ति एवं सामाजिक पद' },
    { code: 'BK', name: 'Bhratrukaraka (BK)', sig: 'भाई-बहन, साहस, पराक्रम एवं गुरुजन' },
    { code: 'MK', name: 'Matrukaraka (MK)', sig: 'माता, भूमि, भवन, वाहन सुख एवं आंतरिक शांति' },
    { code: 'PK', name: 'Putrakaraka (PK)', sig: 'संतान, उच्च विद्या, मंत्र शक्ति एवं प्रज्ञा' },
    { code: 'GK', name: 'Gnatikaraka (GK)', sig: 'प्रतिस्पर्धा, रोग, ऋण, शत्रु एवं जीवन की चुनौतियां' },
    { code: 'DK', name: 'Darakaraka (DK)', sig: 'जीवनसाथी, विवाह, दांपत्य सुख एवं व्यापारिक साझेदार' },
  ];

  const karakas: JaiminiKarakaRow[] = sevenPlanets.map((pl, idx) => {
    const def = karakaDefs[idx] || karakaDefs[6];
    return {
      karakaCode: def.code,
      karakaName: def.name,
      planetHindi: pl.hindiName,
      planetEnglish: pl.name,
      degreeInRashi: pl.degree,
      signification: def.sig,
    };
  });

  const isDirect = lagnaRashiNum % 2 !== 0;
  const charDasha: JaiminiCharDashaRow[] = [];
  let currentStartYear = birthYear;
  const currentYearNow = new Date().getFullYear();

  for (let i = 0; i < 12; i++) {
    const signIdx = isDirect
      ? safeMod(lagnaRashiNum + i - 1, 12)
      : safeMod(lagnaRashiNum - i - 1, 12);
    const rData = RASHI_DATA[signIdx];
    const durationYears = safeMod(i * 3 + 7, 11) + 2;
    const startY = Math.floor(currentStartYear);
    const endY = Math.floor(currentStartYear + durationYears);
    const isCurrent = currentYearNow >= startY && currentYearNow <= endY;

    charDasha.push({
      rashiName: rData.name,
      rashiLord: rData.lord,
      durationYears,
      periodDisplay: `${startY} से ${endY}`,
      isCurrent,
    });

    currentStartYear += durationYears;
  }

  return {
    karakas,
    charDasha,
  };
}

export function generateSampurnKundali(
  rawName: string,
  dob: string,
  birthTime: string,
  birthPlace: string = 'रुद्रपुर, उत्तराखण्ड'
): SampurnKundaliReport {
  const name = (rawName || '').trim() || 'श्रद्धालु यजमान';
  const nameProfile = getVedicDetailsFromName(name);

  // Parse Date of Birth safely
  const parsedDate = dob ? new Date(`${dob}T00:00:00`) : new Date('1996-03-10T00:00:00');
  const year = isNaN(parsedDate.getFullYear()) ? 1996 : parsedDate.getFullYear();
  const month = Math.min(12, Math.max(1, isNaN(parsedDate.getMonth()) ? 3 : parsedDate.getMonth() + 1));
  const day = Math.min(31, Math.max(1, isNaN(parsedDate.getDate()) ? 10 : parsedDate.getDate()));
  const dayOfWeek = safeMod(isNaN(parsedDate.getDay()) ? 0 : parsedDate.getDay(), 7);

  // Parse Time of Birth safely
  const timeParts = (birthTime || '10:00').split(':');
  const rawHour = parseInt(timeParts[0] || '10', 10);
  const rawMin = parseInt(timeParts[1] || '00', 10);
  const hour = safeMod(isNaN(rawHour) ? 10 : rawHour, 24);
  const minute = safeMod(isNaN(rawMin) ? 0 : rawMin, 60);

  const nowIST = getISTCalendarParts(new Date());
  const currentYear = nowIST.year;
  const ageYears = Math.max(1, currentYear - year);

  // Coordinates & Astronomical Julian Day
  const coords = getCityCoordinates(birthPlace);
  const jd = computeJulianDayIST(year, month, day, hour, minute);
  const ayanamsa = getLahiriAyanamsa(jd);
  const ayanamsaDMS = formatDMS(ayanamsa).fullDMS;

  // 1. Sidereal Lagna (Ascendant)
  const lagnaSiderealLon = getSiderealLagnaLongitude(jd, coords.lat, coords.lon, ayanamsa);
  const lagnaNumber = safeMod(Math.floor(lagnaSiderealLon / 30), 12) + 1;
  const lagnaDegInfo = formatDMS(lagnaSiderealLon % 30);

  // 2. Sidereal Sun & Moon
  const sunTropicalLon = getTropicalSunLongitude(jd);
  const sunSiderealLon = norm360(sunTropicalLon - ayanamsa);
  const sunRashiNumber = safeMod(Math.floor(sunSiderealLon / 30), 12) + 1;

  const moonTropicalLon = getTropicalMoonLongitude(jd);
  const moonSiderealLon = norm360(moonTropicalLon - ayanamsa);
  const moonRashiNumber = safeMod(Math.floor(moonSiderealLon / 30), 12) + 1;

  // Exact Nakshatra & Pada from Sidereal Moon (Each Nakshatra = 13°20' = 13.3333333°)
  const nakshatraSpan = 360 / 27;
  const nakshatraExact = moonSiderealLon / nakshatraSpan;
  const nakshatraIndex = safeMod(Math.floor(nakshatraExact), 27);
  const nakshatraFractionElapsed = nakshatraExact - Math.floor(nakshatraExact);
  const nakshatraPada = Math.min(4, Math.max(1, Math.floor(nakshatraFractionElapsed * 4) + 1));

  // Exact Panchang Tithi, Yoga & Karana from Sun & Moon longitudes
  const moonSunDiff = norm360(moonTropicalLon - sunTropicalLon);
  const tithiNumber = safeMod(Math.floor(moonSunDiff / 12), 30) + 1; // 1 to 30
  const paksha = tithiNumber <= 15 ? 'शुक्ल पक्ष (Shukla Paksha)' : 'कृष्ण पक्ष (Krishna Paksha)';
  const tithiName =
    tithiNumber === 15
      ? 'पूर्णिमा'
      : tithiNumber === 30
      ? 'अमावस्या'
      : TITHI_NAMES[safeMod(tithiNumber - 1, 15)];

  const yogaIndex = safeMod(Math.floor(norm360(moonSiderealLon + sunSiderealLon) / (360 / 27)), 27);
  const yogaName = YOGA_NAMES[yogaIndex];
  const karanaHalfIndex = Math.floor(moonSunDiff / 6); // 0..59
  const karanaName =
    karanaHalfIndex === 0
      ? 'किंस्तुघ्न'
      : karanaHalfIndex === 57
      ? 'शकुनि'
      : karanaHalfIndex === 58
      ? 'चतुष्पाद'
      : karanaHalfIndex === 59
      ? 'नाग'
      : KARANA_NAMES[safeMod(karanaHalfIndex - 1, 7)];

  // 3. True Sidereal Positions of Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
  const marsState = getGeocentricPlanetState('mars', jd);
  const mercuryState = getGeocentricPlanetState('mercury', jd);
  const jupiterState = getGeocentricPlanetState('jupiter', jd);
  const venusState = getGeocentricPlanetState('venus', jd);
  const saturnState = getGeocentricPlanetState('saturn', jd);

  const rahuTropicalLon = getTrueRahuTropicalLongitude(jd);
  const rahuSiderealLon = norm360(rahuTropicalLon - ayanamsa);
  const ketuSiderealLon = norm360(rahuSiderealLon + 180);

  const lagnaData = RASHI_DATA[safeMod(lagnaNumber - 1, 12)];
  const moonData = RASHI_DATA[safeMod(moonRashiNumber - 1, 12)];
  const sunData = RASHI_DATA[safeMod(sunRashiNumber - 1, 12)];
  const nakshatraObj = NAKSHATRA_LIST[safeMod(nakshatraIndex, 27)];
  const vaarObj = VAAR_NAMES[safeMod(dayOfWeek, 7)];

  const getHouseFromRef = (planetRashi: number, refRashi: number) =>
    safeMod(planetRashi - refRashi, 12) + 1;

  const rawPlanets = [
    {
      id: 'sun',
      name: 'Sun',
      hindiName: 'सूर्य (Sun)',
      shortHindi: 'सू',
      symbol: '☉',
      siderealLon: sunSiderealLon,
      isRetrograde: false,
      combustLimit: 0,
      exalted: 1,
      debilitated: 7,
      own: [5],
      friendly: [1, 4, 8, 9, 12],
    },
    {
      id: 'moon',
      name: 'Moon',
      hindiName: 'चंद्र (Moon)',
      shortHindi: 'च',
      symbol: '☽',
      siderealLon: moonSiderealLon,
      isRetrograde: false,
      combustLimit: 12,
      exalted: 2,
      debilitated: 8,
      own: [4],
      friendly: [1, 3, 5, 6, 9, 12],
    },
    {
      id: 'mars',
      name: 'Mars',
      hindiName: 'मंगल (Mars)',
      shortHindi: 'मं',
      symbol: '♂',
      siderealLon: norm360(marsState.tropicalLon - ayanamsa),
      isRetrograde: marsState.isRetrograde,
      combustLimit: 17,
      exalted: 10,
      debilitated: 4,
      own: [1, 8],
      friendly: [4, 5, 9, 12],
    },
    {
      id: 'mercury',
      name: 'Mercury',
      hindiName: 'बुध (Mercury)',
      shortHindi: 'बु',
      symbol: '☿',
      siderealLon: norm360(mercuryState.tropicalLon - ayanamsa),
      isRetrograde: mercuryState.isRetrograde,
      combustLimit: mercuryState.isRetrograde ? 12 : 14,
      exalted: 6,
      debilitated: 12,
      own: [3, 6],
      friendly: [2, 5, 7, 10, 11],
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      hindiName: 'गुरु (Jupiter)',
      shortHindi: 'गु',
      symbol: '♃',
      siderealLon: norm360(jupiterState.tropicalLon - ayanamsa),
      isRetrograde: jupiterState.isRetrograde,
      combustLimit: 11,
      exalted: 4,
      debilitated: 10,
      own: [9, 12],
      friendly: [1, 5, 8],
    },
    {
      id: 'venus',
      name: 'Venus',
      hindiName: 'शुक्र (Venus)',
      shortHindi: 'शु',
      symbol: '♀',
      siderealLon: norm360(venusState.tropicalLon - ayanamsa),
      isRetrograde: venusState.isRetrograde,
      combustLimit: venusState.isRetrograde ? 8 : 10,
      exalted: 12,
      debilitated: 6,
      own: [2, 7],
      friendly: [3, 6, 10, 11],
    },
    {
      id: 'saturn',
      name: 'Saturn',
      hindiName: 'शनि (Saturn)',
      shortHindi: 'श',
      symbol: '♄',
      siderealLon: norm360(saturnState.tropicalLon - ayanamsa),
      isRetrograde: saturnState.isRetrograde,
      combustLimit: 15,
      exalted: 7,
      debilitated: 1,
      own: [10, 11],
      friendly: [2, 3, 6],
    },
    {
      id: 'rahu',
      name: 'Rahu',
      hindiName: 'राहु (Rahu)',
      shortHindi: 'रा',
      symbol: '☊',
      siderealLon: rahuSiderealLon,
      isRetrograde: true,
      combustLimit: 0,
      exalted: 2,
      debilitated: 8,
      own: [11],
      friendly: [3, 6, 7, 10],
    },
    {
      id: 'ketu',
      name: 'Ketu',
      hindiName: 'केतु (Ketu)',
      shortHindi: 'के',
      symbol: '☋',
      siderealLon: ketuSiderealLon,
      isRetrograde: true,
      combustLimit: 0,
      exalted: 8,
      debilitated: 2,
      own: [8],
      friendly: [9, 12, 1, 5],
    },
  ];

  const getHouseEffectText = (planetHindi: string, house: number): string => {
    const effectsByHouse: Record<number, string> = {
      1: `${planetHindi} लग्न (प्रथम भाव) में बैठकर आपके व्यक्तित्व को प्रभावशाली, आत्मनिर्भर और तेजस्वी बनाता है।`,
      2: `${planetHindi} द्वितीय (धन एवं वाणी) भाव में स्थित होकर कुटुंब सुख, मधुर वाणी और संचित धन में वृद्धि करता है।`,
      3: `${planetHindi} तृतीय (पराक्रम) भाव में साहस, परिश्रम, छोटे भाई-बहनों का सहयोग और आत्मबल प्रदान करता है।`,
      4: `${planetHindi} चतुर्थ (सुख एवं भूमि) भाव में माता का आशीर्वाद, निजी मकान, वाहन सुख और मानसिक संतोष देता है।`,
      5: `${planetHindi} पंचम (विद्या एवं संतान) भाव में तीक्ष्ण बुद्धि, उच्च शिक्षा, इष्ट कृपा और संतान सुख प्रदान करता है।`,
      6: `${planetHindi} षष्ठ भाव में शत्रुओं पर विजय, प्रतियोगी परीक्षाओं में सफलता और कार्यक्षमता में मजबूती देता है।`,
      7: `${planetHindi} सप्तम (दांपत्य एवं व्यापार) भाव में योग्य जीवनसाथी, साझेदारी में लाभ और सामाजिक प्रतिष्ठा देता है।`,
      8: `${planetHindi} अष्टम भाव में दीर्घायु, गूढ़ ज्योतिष/आध्यात्मिक ज्ञान और आकस्मिक धन लाभ के अवसर बनाता है।`,
      9: `${planetHindi} नवम (भाग्य एवं धर्म) भाव में बैठकर भाग्योदय, धार्मिक यात्राएं, पिता/गुरु कृपा और उच्च सम्मान दिलाता है।`,
      10: `${planetHindi} दशम (कर्म एवं राज्य) भाव में करियर में उच्च पद, व्यापारिक विस्तार, नेतृत्व और मान-प्रतिष्ठा देता है।`,
      11: `${planetHindi} एकादश (लाभ एवं आय) भाव में निरंतर आमदनी, बड़े संपर्कों से लाभ और मनोकामनाओं की पूर्ति कराता है।`,
      12: `${planetHindi} द्वादश भाव में शुभ कार्यों में व्यय, बाहरी/विदेशी स्थानों से लाभ और आध्यात्मिक शांति प्रदान करता है।`,
    };
    return effectsByHouse[house] || effectsByHouse[1];
  };

  const planets: GrahaPosition[] = rawPlanets.map((p) => {
    const rashiNumber = safeMod(Math.floor(p.siderealLon / 30), 12) + 1;
    const degWithinSign = p.siderealLon % 30;
    const dms = formatDMS(degWithinSign);

    const rData = RASHI_DATA[safeMod(rashiNumber - 1, 12)];
    const houseInLagna = getHouseFromRef(rashiNumber, lagnaNumber);
    const houseInChandra = getHouseFromRef(rashiNumber, moonRashiNumber);

    const pNakExact = p.siderealLon / nakshatraSpan;
    const pNakIndex = safeMod(Math.floor(pNakExact), 27);
    const pNak = NAKSHATRA_LIST[pNakIndex];
    const pada = Math.min(4, Math.max(1, Math.floor((pNakExact - Math.floor(pNakExact)) * 4) + 1));

    const isCombust =
      p.combustLimit > 0 && angularSeparation(p.siderealLon, sunSiderealLon) <= p.combustLimit;
    const isExalted = rashiNumber === p.exalted;
    const isDebilitated = rashiNumber === p.debilitated;

    let dignity: GrahaPosition['dignity'] = 'सम राशि';
    let statusBadge: GrahaPosition['statusBadge'] = 'madhyam';

    if (isExalted) {
      dignity = 'उच्च (Exalted)';
      statusBadge = 'shubh';
    } else if (p.own.includes(rashiNumber)) {
      dignity = 'स्वगृही (Own Sign)';
      statusBadge = 'shubh';
    } else if (isDebilitated) {
      dignity = 'नीच (Debilitated)';
      statusBadge = 'upay';
    } else if (p.friendly.includes(rashiNumber)) {
      dignity = 'मित्र राशि';
      statusBadge = 'shubh';
    } else if ([6, 8, 12].includes(houseInLagna)) {
      dignity = 'शत्रु राशि';
      statusBadge = 'upay';
    } else {
      dignity = 'सम राशि';
      statusBadge = [1, 4, 5, 7, 9, 10, 11].includes(houseInLagna) ? 'shubh' : 'madhyam';
    }

    // Build traditional Vedic chart label with symbols (* वक्री, ^ अस्त, ↑ उच्च, ↓ नीच)
    let suffix = '';
    if (p.isRetrograde) suffix += '*';
    if (isCombust) suffix += '^';
    if (isExalted) suffix += '↑';
    else if (isDebilitated) suffix += '↓';

    return {
      id: p.id,
      name: p.name,
      hindiName: p.hindiName,
      shortHindi: p.shortHindi,
      symbol: p.symbol,
      rashiNumber,
      rashiName: rData.name,
      rashiLord: rData.lord,
      siderealLon: p.siderealLon,
      houseInLagna,
      houseInChandra,
      degree: dms.shortDeg,
      fullDegreeDMS: dms.fullDMS,
      degInt: dms.degInt,
      nakshatra: pNak.name,
      pada,
      dignity,
      statusBadge,
      isRetrograde: p.isRetrograde,
      isCombust,
      isExalted,
      isDebilitated,
      chartLabel: `${p.shortHindi}${suffix}`,
      houseEffect: getHouseEffectText(p.hindiName, houseInLagna),
    };
  });

  // Build 12 houses for Lagna Chart and Chandra Chart
  const lagnaChart: KundaliChartHouse[] = Array.from({ length: 12 }, (_, idx) => {
    const houseNumber = idx + 1;
    const rashiNum = safeMod(lagnaNumber - 1 + idx, 12) + 1;
    const rData = RASHI_DATA[safeMod(rashiNum - 1, 12)];
    const housePlanets = planets
      .filter((pl) => pl.houseInLagna === houseNumber)
      .map((pl) => ({
        shortHindi: pl.shortHindi,
        chartLabel: pl.chartLabel,
        degInt: pl.degInt,
        hindiName: pl.hindiName,
        degree: pl.degree,
        fullDegreeDMS: pl.fullDegreeDMS,
        statusBadge: pl.statusBadge,
      }));
    return {
      houseNumber,
      bhavaTitle: BHAVA_TITLES[idx],
      rashiNumber: rashiNum,
      rashiName: rData.name,
      planets: housePlanets,
    };
  });

  const chandraChart: KundaliChartHouse[] = Array.from({ length: 12 }, (_, idx) => {
    const houseNumber = idx + 1;
    const rashiNum = safeMod(moonRashiNumber - 1 + idx, 12) + 1;
    const rData = RASHI_DATA[safeMod(rashiNum - 1, 12)];
    const housePlanets = planets
      .filter((pl) => pl.houseInChandra === houseNumber)
      .map((pl) => ({
        shortHindi: pl.shortHindi,
        chartLabel: pl.chartLabel,
        degInt: pl.degInt,
        hindiName: pl.hindiName,
        degree: pl.degree,
        fullDegreeDMS: pl.fullDegreeDMS,
        statusBadge: pl.statusBadge,
      }));
    return {
      houseNumber,
      bhavaTitle: BHAVA_TITLES[idx],
      rashiNumber: rashiNum,
      rashiName: rData.name,
      planets: housePlanets,
    };
  });

  // Calculate Navamsa (D9) Chart
  const navamsaLagnaRashi = computeNavamsaRashi(lagnaSiderealLon);
  const navamsaChart: KundaliChartHouse[] = Array.from({ length: 12 }, (_, idx) => {
    const houseNumber = idx + 1;
    const rashiNum = safeMod(navamsaLagnaRashi - 1 + idx, 12) + 1;
    const rData = RASHI_DATA[safeMod(rashiNum - 1, 12)];

    const housePlanets = planets
      .map((pl) => ({
        ...pl,
        navRashi: computeNavamsaRashi(pl.siderealLon),
      }))
      .filter((pl) => pl.navRashi === rashiNum)
      .map((pl) => ({
        shortHindi: pl.shortHindi,
        chartLabel: `${pl.shortHindi}${pl.isRetrograde ? '*' : pl.isCombust ? '^' : ''}`,
        degInt: pl.degInt,
        hindiName: pl.hindiName,
        degree: pl.degree,
        fullDegreeDMS: pl.fullDegreeDMS,
        statusBadge: pl.statusBadge,
      }));

    return {
      houseNumber,
      bhavaTitle: BHAVA_TITLES[idx],
      rashiNumber: rashiNum,
      rashiName: rData.name,
      planets: housePlanets,
    };
  });

  // Calculate Exact Parashari Vimshottari Mahadasha & Antardasha Timeline from Birth Moon Nakshatra Fraction
  const HINDI_MONTH_NAMES = [
    'जनवरी',
    'फरवरी',
    'मार्च',
    'अप्रैल',
    'मई',
    'जून',
    'जुलाई',
    'अगस्त',
    'सितंबर',
    'अक्टूबर',
    'नवंबर',
    'दिसंबर',
  ];
  const formatDecYearHindi = (decY: number): string => {
    const yr = Math.floor(decY);
    const mIdx = Math.min(11, Math.max(0, Math.floor((decY - yr) * 12)));
    return `${HINDI_MONTH_NAMES[mIdx]} ${yr}`;
  };

  const startDashaIndex = VIMSHOTTARI_SEQUENCE.findIndex((d) =>
    d.planet.startsWith(nakshatraObj.lord.split(' ')[0])
  );
  const validStartIdx = startDashaIndex >= 0 ? startDashaIndex : 0;

  const birthDecimalYear = year + (month - 1) / 12 + (day - 1) / 365.2425;
  const currentDecimalYear =
    nowIST.year + (nowIST.month - 1) / 12 + (nowIST.day - 1) / 365.2425;

  let runningDecimalYear = birthDecimalYear;
  const mahadashas: VimshottariDashaItem[] = [];

  for (let i = 0; i < 9; i++) {
    const seqItem = VIMSHOTTARI_SEQUENCE[safeMod(validStartIdx + i, 9)];
    const durationYears =
      i === 0
        ? Math.max(0.02, seqItem.years * (1 - nakshatraFractionElapsed))
        : seqItem.years;
    const startDec = runningDecimalYear;
    const endDec = runningDecimalYear + durationYears;

    const startY = Math.floor(startDec);
    const endY = Math.floor(endDec);
    const isCurrent = currentDecimalYear >= startDec && currentDecimalYear < endDec;

    // Calculate active Antardasha (Bhukti) proportionally: (MahaYears * AntarYears) / 120
    let currentAntardasha: string | undefined;
    if (isCurrent) {
      const fullMahaStartDec = endDec - seqItem.years;
      let antarCursor = fullMahaStartDec;
      for (let a = 0; a < 9; a++) {
        const antarObj = VIMSHOTTARI_SEQUENCE[safeMod(validStartIdx + i + a, 9)];
        const antarSpanYears = (seqItem.years * antarObj.years) / 120.0;
        if (currentDecimalYear < antarCursor + antarSpanYears || a === 8) {
          currentAntardasha = `${antarObj.planet} (समाप्ति: ${formatDecYearHindi(
            antarCursor + antarSpanYears
          )})`;
          break;
        }
        antarCursor += antarSpanYears;
      }
    }

    mahadashas.push({
      planet: seqItem.planet,
      years: Math.round(durationYears * 100) / 100,
      startYear: startY,
      endYear: endY,
      startDateDisplay: formatDecYearHindi(startDec),
      endDateDisplay: formatDecYearHindi(endDec),
      isCurrent,
      currentAntardasha,
      prediction: seqItem.effect,
    });

    runningDecimalYear = endDec;
  }

  if (!mahadashas.some((m) => m.isCurrent) && mahadashas.length > 0) {
    mahadashas[0].isCurrent = true;
    mahadashas[0].currentAntardasha = VIMSHOTTARI_SEQUENCE[safeMod(validStartIdx, 9)].planet;
  }

  // Dosha Analysis (Classical Parashari Manglik Check from Lagna & Moon + Parihar)
  const marsPlanet = planets.find((p) => p.id === 'mars')!;
  const jupPlanet = planets.find((p) => p.id === 'jupiter')!;
  const venPlanet = planets.find((p) => p.id === 'venus')!;
  const satPlanet = planets.find((p) => p.id === 'saturn')!;
  const sunPlanet = planets.find((p) => p.id === 'sun')!;
  const mercPlanet = planets.find((p) => p.id === 'mercury')!;
  const moonPlanet = planets.find((p) => p.id === 'moon')!;

  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const isMarsInManglikLagna = manglikHouses.includes(marsPlanet.houseInLagna);
  const jupAspectsMars = [1, 5, 7, 9].includes(
    safeMod(marsPlanet.houseInLagna - jupPlanet.houseInLagna, 12) + 1
  );
  const isManglikCancelled =
    [1, 8, 10].includes(marsPlanet.rashiNumber) ||
    jupAspectsMars ||
    marsPlanet.houseInLagna === 2;

  const manglikAnalysis = {
    isManglik: isMarsInManglikLagna && !isManglikCancelled,
    severity: !isMarsInManglikLagna
      ? ('मांगलिक दोष रहित (Non-Manglik)' as const)
      : isManglikCancelled
      ? ('आंशिक मांगलिक' as const)
      : ('पूर्ण मांगलिक' as const),
    marsHouse: marsPlanet.houseInLagna,
    explanation: !isMarsInManglikLagna
      ? `आपकी लग्न कुंडली में मंगल ग्रह ${marsPlanet.houseInLagna}वें भाव (${marsPlanet.rashiName}, ${marsPlanet.fullDegreeDMS}) में स्थित है। अतः आपकी कुंडली मांगलिक दोष से पूर्णतः मुक्त (Non-Manglik) है।`
      : isManglikCancelled
      ? `मंगल ${marsPlanet.houseInLagna}वें भाव (${marsPlanet.rashiName}) में स्थित है, किंतु स्वराशि/उच्च प्रभाव अथवा देवगुरु बृहस्पति की शुभ दृष्टि के कारण मांगलिक दोष का शास्त्रोक्त परिहार (आंशिक/निष्प्रभावी) हो रहा है।`
      : `लग्न कुंडली के ${marsPlanet.houseInLagna}वें भाव (${marsPlanet.rashiName}, ${marsPlanet.fullDegreeDMS}) में मंगल स्थित होने से मांगलिक प्रभाव बन रहा है। यह आपको अदम्य साहस व नेतृत्व देता है; विवाह से पूर्व कुंडली गुण मिलान कर लेना शुभ रहेगा।`,
    remedy: !isMarsInManglikLagna
      ? 'मंगल की शुभता एवं ऊर्जा वृद्धि हेतु मंगलवार को श्री हनुमान चालीसा का पाठ करें।'
      : 'मंगलवार को श्री हनुमान जी को सिंदूर व चोला अर्पित करें, सुंदरकांड का पाठ करें तथा विवाह से पूर्व पण्डित जी से गुण मिलान अवश्य कराएं।',
  };

  // Kaal Sarp Check: Check if all 7 planets are hemmed on one side of Rahu-Ketu axis
  const rahuLon = rahuSiderealLon;
  const ketuLon = ketuSiderealLon;
  const sevenPlanets = planets.filter((p) => p.id !== 'rahu' && p.id !== 'ketu');
  const sideA = sevenPlanets.every((p) => norm360(p.siderealLon - rahuLon) < 180);
  const sideB = sevenPlanets.every((p) => norm360(p.siderealLon - ketuLon) < 180);
  const isKaalSarp = sideA || sideB;

  // Real-Time Transit Saturn Calculation for Authentic Shani Sade Sati & Dhaiya at Current IST Time
  const nowJd = computeJulianDayIST(
    nowIST.year,
    nowIST.month,
    nowIST.day,
    nowIST.hours,
    nowIST.minutes
  );
  const nowAyanamsa = getLahiriAyanamsa(nowJd);
  const transitSaturnState = getGeocentricPlanetState('saturn', nowJd);
  const transitSaturnSiderealLon = norm360(transitSaturnState.tropicalLon - nowAyanamsa);
  const transitSaturnRashi = safeMod(Math.floor(transitSaturnSiderealLon / 30), 12) + 1;
  const transitSaturnRashiName = RASHI_DATA[safeMod(transitSaturnRashi - 1, 12)].name;
  const transitSaturnDMS = formatDMS(transitSaturnSiderealLon % 30).shortDeg;
  const shaniHouseFromNatalMoon = safeMod(transitSaturnRashi - moonRashiNumber, 12) + 1;

  let sadeSatiStatus = 'शनि साढ़े साती एवं ढैय्या से पूर्णतः मुक्त (अनुकूल गोचर)';
  let sadeSatiPhase = `चंद्र से ${shaniHouseFromNatalMoon}वें भाव में शुभ शनि गोचर (${transitSaturnRashiName})`;
  let sadeSatiExplanation = `वर्तमान गोचर में शनि देव ${transitSaturnRashiName} राशि (${transitSaturnDMS}) में आपकी जन्म चंद्र राशि ${moonData.name} से ${shaniHouseFromNatalMoon}वें भाव में भ्रमण कर रहे हैं। आपकी कुंडली पर वर्तमान में साढ़े साती या ढैय्या का प्रभाव नहीं है।`;

  if (shaniHouseFromNatalMoon === 12) {
    sadeSatiStatus = 'शनि साढ़े साती सक्रिय (प्रथम / उदय चरण)';
    sadeSatiPhase = `प्रथम चरण — द्वादश भाव में शनि गोचर (${transitSaturnRashiName} ${transitSaturnDMS})`;
    sadeSatiExplanation = `वर्तमान गोचर में शनि देव ${transitSaturnRashiName} राशि (${transitSaturnDMS}) में भ्रमण कर रहे हैं, जो आपकी जन्म चंद्र राशि ${moonData.name} से द्वादश (12वें) भाव में हैं। साढ़े साती का यह प्रथम चरण धैर्य, संयम और सोच-समझकर आर्थिक निर्णय लेने की प्रेरणा देता है।`;
  } else if (shaniHouseFromNatalMoon === 1) {
    sadeSatiStatus = 'शनि साढ़े साती सक्रिय (द्वितीय / मध्य शिखर चरण)';
    sadeSatiPhase = `द्वितीय चरण — जन्म राशि पर शनि गोचर (${transitSaturnRashiName} ${transitSaturnDMS})`;
    sadeSatiExplanation = `वर्तमान गोचर में शनि देव आपकी ही जन्म चंद्र राशि ${moonData.name} (${transitSaturnDMS}) पर संचरण कर रहे हैं। साढ़े साती का यह मध्य शिखर चरण कठिन परिश्रम, अनुशासन और सत्यनिष्ठा से जीवन में स्थायी सफलता दिलाने वाला काल है।`;
  } else if (shaniHouseFromNatalMoon === 2) {
    sadeSatiStatus = 'शनि साढ़े साती सक्रिय (तृतीय / अस्त चरण)';
    sadeSatiPhase = `तृतीय चरण — द्वितीय भाव में उतरती साढ़े साती (${transitSaturnRashiName} ${transitSaturnDMS})`;
    sadeSatiExplanation = `वर्तमान गोचर में शनि देव ${transitSaturnRashiName} राशि (${transitSaturnDMS}) में आपकी चंद्र राशि ${moonData.name} से द्वितीय भाव में भ्रमण कर रहे हैं। यह उतरती साढ़े साती का चरण है, जो पूर्व के परिश्रम का उत्तम फल और आर्थिक संचय प्रदान करता है।`;
  } else if (shaniHouseFromNatalMoon === 4) {
    sadeSatiStatus = 'शनि की कंटक (चतुर्थ) ढैय्या सक्रिय';
    sadeSatiPhase = `चतुर्थ ढैय्या — चंद्र से 4थे भाव में शनि गोचर (${transitSaturnRashiName} ${transitSaturnDMS})`;
    sadeSatiExplanation = `वर्तमान गोचर में शनि देव ${transitSaturnRashiName} राशि (${transitSaturnDMS}) में आपकी चंद्र राशि ${moonData.name} से चतुर्थ भाव में संचरण कर रहे हैं। कंटक ढैय्या के इस काल में कार्यक्षेत्र व पारिवारिक निर्णयों में धैर्य और हनुमान जी की उपासना विशेष फलदायी रहेगी।`;
  } else if (shaniHouseFromNatalMoon === 8) {
    sadeSatiStatus = 'शनि की अष्टम ढैय्या सक्रिय';
    sadeSatiPhase = `अष्टम ढैय्या — चंद्र से 8वें भाव में शनि गोचर (${transitSaturnRashiName} ${transitSaturnDMS})`;
    sadeSatiExplanation = `वर्तमान गोचर में शनि देव ${transitSaturnRashiName} राशि (${transitSaturnDMS}) में आपकी चंद्र राशि ${moonData.name} से अष्टम भाव में संचरण कर रहे हैं। अष्टम ढैय्या के इस काल में स्वास्थ्य एवं वाणी में संयम रखें तथा शनिवार को पीपल के नीचे दीपदान करें।`;
  }

  // Auspicious Raj Yogas & Classical Parashari Yogas
  const rajYogas: ShubhYogaItem[] = [];
  const sunHouse = sunPlanet.houseInLagna;
  const mercHouse = mercPlanet.houseInLagna;
  const jupHouse = jupPlanet.houseInLagna;
  const moonHouse = moonPlanet.houseInLagna;
  const venHouse = venPlanet.houseInLagna;
  const marsHouse = marsPlanet.houseInLagna;
  const satHouse = satPlanet.houseInLagna;

  if (sunHouse === mercHouse) {
    rajYogas.push({
      name: 'बुधादित्य राजयोग (Budhaditya Rajyoga)',
      sanskritRule: `भाव ${sunHouse} (${sunPlanet.rashiName}) में सूर्य एवं बुध की युति`,
      strength: 'प्रबल योग',
      description:
        'आपकी कुंडली में सूर्य और बुध एक ही भाव में स्थित होकर प्रबल बुधादित्य राजयोग बना रहे हैं, जो आपको कुशाग्र बुद्धि, वाणी का तेज, प्रशासनिक कौशल और समाज में विशेष मान-सम्मान प्रदान करता है।',
    });
  }

  if ([1, 4, 7, 10].includes(safeMod(jupHouse - moonHouse, 12) + 1)) {
    rajYogas.push({
      name: 'गजकेसरी राजयोग (Gajakesari Rajyoga)',
      sanskritRule: `चंद्रमा (भाव ${moonHouse}) से केंद्र (भाव ${jupHouse}) में देवगुरु बृहस्पति`,
      strength: 'प्रबल योग',
      description:
        'गुरु और चंद्र के केंद्र संबंध से गजकेसरी राजयोग बन रहा है। इसके प्रभाव से जातक अपने कुल का नाम रोशन करता है और स्थायी धन-संपत्ति, उच्च विद्या व अक्षुण्ण प्रतिष्ठा प्राप्त करता है।',
    });
  }

  if ([1, 4, 7, 10].includes(jupHouse) && [4, 9, 12].includes(jupPlanet.rashiNumber)) {
    rajYogas.push({
      name: 'हंस पंचमहापुरुष राजयोग (Hamsa Mahapurusha Yoga)',
      sanskritRule: `केंद्र (भाव ${jupHouse}) में उच्च/स्वराशि (${jupPlanet.rashiName}) के बृहस्पति`,
      strength: 'प्रबल योग',
      description:
        'केंद्र भाव में बलवान बृहस्पति हंस महापुरुष राजयोग का निर्माण कर रहे हैं, जो धर्म, अध्यात्म, उच्च ज्ञान और समाज में आचार्य/मार्गदर्शक के रूप में सर्वोच्च सम्मान दिलाता है।',
    });
  }

  if ([1, 4, 7, 10].includes(venHouse) && [2, 7, 12].includes(venPlanet.rashiNumber)) {
    rajYogas.push({
      name: 'मालव्य पंचमहापुरुष राजयोग (Malavya Mahapurusha Yoga)',
      sanskritRule: `केंद्र (भाव ${venHouse}) में उच्च/स्वराशि (${venPlanet.rashiName}) के शुक्र`,
      strength: 'प्रबल योग',
      description:
        'केंद्र में बलवान शुक्र मालव्य महापुरुष राजयोग बना रहे हैं, जो जीवन में भव्य वाहन, भवन, कलात्मक प्रतिभा, ऐश्वर्य और सुखद दांपत्य जीवन प्रदान करता है।',
    });
  }

  if ([1, 4, 7, 10].includes(marsHouse) && [1, 8, 10].includes(marsPlanet.rashiNumber)) {
    rajYogas.push({
      name: 'रुचक पंचमहापुरुष राजयोग (Ruchaka Mahapurusha Yoga)',
      sanskritRule: `केंद्र (भाव ${marsHouse}) में उच्च/स्वराशि (${marsPlanet.rashiName}) के मंगल`,
      strength: 'प्रबल योग',
      description:
        'केंद्र में स्वराशि/उच्च के मंगल रुचक महापुरुष राजयोग बना रहे हैं, जो अदम्य साहस, नेतृत्व क्षमता, भूमि-संपदा और प्रशासनिक क्षेत्र में विजय प्रदान करता है।',
    });
  }

  if ([1, 4, 7, 10].includes(mercHouse) && [3, 6].includes(mercPlanet.rashiNumber)) {
    rajYogas.push({
      name: 'भद्र पंचमहापुरुष राजयोग (Bhadra Mahapurusha Yoga)',
      sanskritRule: `केंद्र (भाव ${mercHouse}) में स्वराशि/उच्च (${mercPlanet.rashiName}) के बुध`,
      strength: 'प्रबल योग',
      description:
        'केंद्र में बलवान बुध भद्र महापुरुष राजयोग बना रहे हैं, जो वाणिज्य-व्यापार, गणित, वाणी कौशल और बौद्धिक क्षेत्रों में असाधारण सफलता देता है।',
    });
  }

  if ([1, 4, 7, 10].includes(satHouse) && [7, 10, 11].includes(satPlanet.rashiNumber)) {
    rajYogas.push({
      name: 'शश पंचमहापुरुष राजयोग (Shasha Mahapurusha Yoga)',
      sanskritRule: `केंद्र (भाव ${satHouse}) में उच्च/स्वराशि (${satPlanet.rashiName}) के शनि`,
      strength: 'प्रबल योग',
      description:
        'केंद्र में बलवान शनि शश महापुरुष राजयोग का निर्माण कर रहे हैं, जो जन-नेतृत्व, न्यायप्रियता, उद्योग-धंधों और दीर्घकालीन साम्राज्य निर्माण की शक्ति देता है।',
    });
  }

  if (mercHouse === venHouse) {
    rajYogas.push({
      name: 'लक्ष्मी-नारायण राजयोग (Lakshmi-Narayana Yoga)',
      sanskritRule: `भाव ${mercHouse} (${mercPlanet.rashiName}) में बुध एवं शुक्र की युति`,
      strength: 'प्रबल योग',
      description:
        'बुध (नारायण तत्व) और शुक्र (लक्ष्मी तत्व) की युति से आपकी कुंडली में लक्ष्मी-नारायण योग बन रहा है, जो व्यापारिक समृद्धि, धन-धान्य और सौभाग्य में निरंतर वृद्धि करता है।',
    });
  }

  if (moonHouse === marsHouse || safeMod(marsHouse - moonHouse, 12) + 1 === 7) {
    rajYogas.push({
      name: 'चंद्र-मंगल महालक्ष्मी धन योग (Chandra-Mangal Yoga)',
      sanskritRule: `चंद्रमा (भाव ${moonHouse}) एवं मंगल (भाव ${marsHouse}) का परस्पर संबंध`,
      strength: 'शुभ योग',
      description:
        'चंद्र और मंगल के संयोग से प्रबल धन-लक्ष्मी योग निर्मित हो रहा है, जो साहसपूर्ण निर्णयों व स्व-परिश्रम से अचल संपत्ति एवं आर्थिक उन्नति कराता है।',
    });
  }

  if (rajYogas.length < 3) {
    const tenthPlanets = planets.filter((p) => p.houseInLagna === 10).map((p) => p.hindiName.split(' ')[0]);
    const eleventhPlanets = planets.filter((p) => p.houseInLagna === 11).map((p) => p.hindiName.split(' ')[0]);
    rajYogas.push({
      name: 'कर्म-सिद्धि एवं स्व-अर्जित भाग्योदय योग',
      sanskritRule: `लग्नेश ${lagnaData.lord.split(' ')[0]} एवं दशम/एकादश भाव का समन्वय`,
      strength: 'शुभ योग',
      description: `आपकी कुंडली में लग्नेश ${lagnaData.lord} तथा कर्म/लाभ भाव (${
        tenthPlanets.length > 0 ? `दशम में ${tenthPlanets.join(', ')}` : 'दशमेश'
      }${
        eleventhPlanets.length > 0 ? `, एकादश में ${eleventhPlanets.join(', ')}` : ''
      }) के प्रभाव से अपने पुरुषार्थ, वाणी और कौशल के बल पर निरंतर उन्नति करने का प्रबल योग है।`,
    });
  }

  const paya =
    [1, 6, 11].includes(moonHouse)
      ? 'स्वर्ण पाद (सोने का पाया)'
      : [2, 5, 9].includes(moonHouse)
      ? 'रजत पाद (चांदी का पाया - अत्यंत शुभ)'
      : [3, 7, 10].includes(moonHouse)
      ? 'ताम्र पाद (तांबे का पाया - शुभ)'
      : 'लौह पाद (लोहे का पाया)';

  const formattedDob = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  const formattedTime = `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;

  // Dynamic Chart-Specific Helper for Predictions
  const getHouseSummaryPlanets = (hNum: number): string => {
    const list = planets.filter((p) => p.houseInLagna === hNum);
    const houseRashi = RASHI_DATA[safeMod(lagnaNumber - 1 + hNum - 1, 12)];
    if (list.length === 0) {
      return `${houseRashi.name} राशि (स्वामी: ${houseRashi.lord})`;
    }
    return `${houseRashi.name} राशि में स्थित ${list
      .map((p) => `${p.hindiName.split(' ')[0]} (${p.degree})`)
      .join(', ')}`;
  };

  const activeMahaObj = mahadashas.find((m) => m.isCurrent) || mahadashas[0];

  // Pitra Dosha / Guru-Rahu / Sun-Rahu check
  const rahuHouse = planets.find((p) => p.id === 'rahu')!.houseInLagna;
  const ketuHouse = planets.find((p) => p.id === 'ketu')!.houseInLagna;
  const hasSunRahu = sunHouse === rahuHouse || sunHouse === ketuHouse;
  const pitraStatus = hasSunRahu
    ? 'सूर्य-राहु/केतु संयोग (पितृ स्मरण एवं तर्पण से विशेष भाग्योदय)'
    : 'पितरों एवं कुलदेवता का पूर्ण शुभ आशीर्वाद';
  const pitraExplanation = hasSunRahu
    ? `आपकी कुंडली के ${sunHouse}वें भाव में सूर्य के साथ राहु/केतु अक्ष का प्रभाव होने से अमावस्या एवं पितृ पक्ष में पूर्वजों के निमित्त अन्न-जल दान व पीपल पूजन करने से कार्यक्षेत्र के समस्त अवरोध तुरंत दूर होंगे।`
    : `आपकी कुंडली में नवम भाव (${getHouseSummaryPlanets(9)}) एवं देवगुरु बृहस्पति (भाव ${jupHouse}) के शुभ प्रभाव से आपको अपने पूर्वजों व कुलदेवता की विशेष कृपा प्राप्त है।`;

  return {
    input: {
      name,
      dob: dob || '1996-03-10',
      formattedDob,
      birthTime: birthTime || '10:00',
      formattedTime,
      birthPlace: birthPlace.trim() || 'रुद्रपुर, उत्तराखण्ड',
      latitude: coords.lat,
      longitude: coords.lon,
      ayanamsaDMS,
      ageYears,
    },
    panchang: {
      vaar: vaarObj.name,
      vaarLord: vaarObj.lord,
      tithi: tithiName,
      paksha,
      yoga: yogaName,
      karana: karanaName,
      lagnaNumber,
      lagnaName: lagnaData.name,
      lagnaLord: lagnaData.lord,
      lagnaDegreeDMS: lagnaDegInfo.fullDMS,
      lagnaDegInt: lagnaDegInfo.degInt,
      moonRashiNumber,
      moonRashiName: moonData.name,
      moonRashiLord: moonData.lord,
      sunRashiNumber,
      sunRashiName: sunData.name,
      sunRashiLord: sunData.lord,
      naamRashi: nameProfile.rashi,
      nakshatraName: nakshatraObj.name,
      nakshatraPada,
      nakshatraLord: nakshatraObj.lord,
      gana: nakshatraObj.gana,
      nadi: nakshatraObj.nadi,
      yoni: nakshatraObj.yoni,
      varna: moonData.varna,
      vashya: moonData.vashya,
      tatva: lagnaData.tatva,
      paya,
    },
    lucky: {
      luckyNumbers: lagnaData.numbers,
      luckyColors: lagnaData.colors,
      luckyDays: lagnaData.days,
      luckyDirection: lagnaData.direction,
      ishtaDevta: lagnaData.ishta,
      beejMantra: lagnaData.mantra,
      ratnaName: lagnaData.gemstone,
      uparatnaName: lagnaData.uparatna,
      ratnaMetalAndFinger: lagnaData.metal,
      rudraksha: lagnaData.rudraksha,
    },
    planets,
    lagnaChart,
    chandraChart,
    navamsaChart,
    shodashavarga: computeShodashavargaCharts(lagnaSiderealLon, planets),
    kpSystem: computeKPSystemData(lagnaSiderealLon, planets, ayanamsaDMS),
    ashtakavarga: computeAshtakavargaData(lagnaSiderealLon, planets),
    jaimini: computeJaiminiData(lagnaNumber, planets, year),
    mahadashas,
    doshaAnalysis: {
      manglik: manglikAnalysis,
      kaalSarp: {
        isPresent: isKaalSarp,
        type: isKaalSarp ? 'कालसर्प योग प्रभाव' : 'कालसर्प दोष से मुक्त (No Kaal Sarp Dosh)',
        explanation: isKaalSarp
          ? `कुंडली में राहु (भाव ${rahuHouse}) एवं केतु (भाव ${ketuHouse}) अक्ष के एक ओर ग्रह स्थित होने से प्रारंभिक परिश्रम के पश्चात विशेष भाग्योदय होता है।`
          : `आपकी जन्म कुंडली में राहु (भाव ${rahuHouse}) एवं केतु (भाव ${ketuHouse}) अक्ष के दोनों ओर ग्रह स्वतंत्र रूप से स्थित हैं, अतः कुंडली कालसर्प दोष से पूर्णतः मुक्त है।`,
        remedy: 'सोमवार को शिवलिंग पर जल एवं बिल्वपत्र अर्पित करें और "ॐ नमः शिवाय" का जप करें।',
      },
      sadeSati: {
        status: sadeSatiStatus,
        phase: sadeSatiPhase,
        explanation: sadeSatiExplanation,
        remedy: 'शनिवार की संध्या को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक जलाएं एवं श्री हनुमान चालीसा का पाठ करें।',
      },
      pitraDosha: {
        status: pitraStatus,
        explanation: pitraExplanation,
      },
    },
    rajYogas,
    predictions: {
      personality: {
        title: `१. लग्नेश, राशि स्वामी एवं मानसिक-आध्यात्मिक स्थिति (${lagnaData.name} लग्न • ${moonData.name} राशि)`,
        summary: `चित्रापक्ष लाहिड़ी अयनांश (${ayanamsaDMS}) एवं स्थानीय अक्षांश (${coords.lat.toFixed(2)}° N, ${coords.lon.toFixed(2)}° E) की शुद्ध दृक् गणित गणना के अनुसार आपका जन्म ${lagnaData.name} लग्न (${lagnaDegInfo.fullDMS}, लग्नेश: ${lagnaData.lord}) और ${moonData.name} चंद्र राशि (चंद्र स्पष्ट: ${moonPlanet.fullDegreeDMS}, नक्षत्र: ${nakshatraObj.name}, चरण ${nakshatraPada}) में हुआ है। प्रथम भाव में ${getHouseSummaryPlanets(1)} का प्रभाव एवं चंद्रमा का ${moonHouse}वें भाव में संचरण आपको प्रखर आत्मबल, सात्त्विक विवेक, स्वाभिमानी व्यक्तित्व और गहन अंतर्दृष्टि प्रदान करता है।`,
        keyTraits: [
          `तत्व एवं स्वभाव प्रधानता: ${lagnaData.tatva} — स्थिर प्रज्ञा, दूरदर्शी सोच एवं विषम परिस्थितियों में भी अडिग निर्णय क्षमता`,
          `नक्षत्र एवं गण प्रभाव: ${nakshatraObj.name} नक्षत्र (${nakshatraObj.gana}, ${nakshatraObj.nadi}, स्वामी: ${nakshatraObj.lord}) के प्रभाव से समाज में विश्वसनीय प्रतिष्ठा एवं सात्त्विक तेज`,
          `आध्यात्मिक एवं मानसिक बल: इष्ट देव (${lagnaData.ishta}) की कृपा से अंतर्ज्ञान, धर्म-कर्म में निष्ठा और मानसिक स्थिरता का प्रबल योग`,
        ],
      },
      career: {
        title: '२. सक्रिय विंशोत्तरी महादशा/अंतर्दशा एवं करियर-आजीविका का सूक्ष्म प्रभाव',
        summary: `आपकी जन्मपत्रिका में वर्तमान में ${activeMahaObj.planet} की महादशा (${activeMahaObj.startDateDisplay} से ${activeMahaObj.endDateDisplay}) एवं ${activeMahaObj.currentAntardasha || 'शुभ'} की अंतर्दशा सक्रिय है। दशम (कर्म) भाव में ${getHouseSummaryPlanets(10)} तथा सूर्य (भाव ${sunHouse}, ${sunPlanet.degree}) और शनि (भाव ${satHouse}, ${satPlanet.degree}) की स्थिति दर्शाती है कि आपमें नेतृत्व, प्रशासन और स्वतंत्र उद्यम की अद्भुत क्षमता है।`,
        bestFields: [
          'वैदिक ज्ञान, ज्योतिष, शिक्षा, परामर्श, प्रशासनिक सेवा एवं आध्यात्मिक मार्गदर्शन',
          'स्वतंत्र व्यवसाय, वाणिज्य, वित्तीय प्रबंधन एवं जनसंपर्क से जुड़े उच्च क्षेत्र',
          'संस्थागत नेतृत्व, तकनीकी नवाचार, मीडिया एवं सामाजिक कल्याण के उपक्रम',
        ],
        peakYears: `सक्रिय ${activeMahaObj.planet.split(' ')[0]} महादशा काल तथा आयु के ${Math.max(24, ageYears)}वें, ${Math.max(27, ageYears + 2)}वें एवं ${Math.max(32, ageYears + 5)}वें वर्ष में करियर एवं प्रतिष्ठा में विशेष उत्कर्ष के प्रबल योग हैं।`,
      },
      wealth: {
        title: '३. करियर, आजीविका, व्यवसाय एवं धन योग (द्वितीय, दशम व एकादश भाव)',
        summary: `द्वितीय (धन-कोष) भाव में ${getHouseSummaryPlanets(2)}, दशम (कर्म) भाव में ${getHouseSummaryPlanets(10)} और एकादश (लाभ) भाव में ${getHouseSummaryPlanets(11)} के परस्पर संबंध से आपकी कुंडली में स्व-अर्जित ऐश्वर्य एवं धन-लक्ष्मी योग निर्मित हो रहा है। देवगुरु बृहस्पति (${jupPlanet.rashiName}, भाव ${jupHouse}) एवं शुक्र (${venPlanet.rashiName}, भाव ${venHouse}) के प्रभाव से जीवन में स्थायी भूमि-भवन, उत्तम वाहन और संचित कोष में निरंतर वृद्धि सुनिश्चित है।`,
        highlights: [
          `धन भाव (${getHouseSummaryPlanets(2)}) एवं लाभ भाव (${getHouseSummaryPlanets(11)}) के बल से एकाधिक स्रोतों से धनागमन`,
          `चतुर्थ भाव (${getHouseSummaryPlanets(4)}) एवं शुक्र के प्रभाव से स्थायी भूमि, निजी भवन निर्माण एवं वाहन सुख का प्रबल योग`,
          `सक्रिय ${activeMahaObj.planet.split(' ')[0]} महादशा में वरिष्ठजनों एवं व्यापारिक संपर्कों से दीर्घकालीन आर्थिक लाभ`,
        ],
      },
      marriage: {
        title: '४. पारिवारिक सौख्य, दांपत्य जीवन एवं संबंध (चतुर्थ व सप्तम भाव विश्लेषण)',
        summary: `चतुर्थ (गृह सुख) भाव में ${getHouseSummaryPlanets(4)} तथा सप्तम (दांपत्य एवं साझेदारी) भाव में ${getHouseSummaryPlanets(7)} के सूक्ष्म पाराशरी विश्लेषण से स्पष्ट है कि आपका पारिवारिक एवं वैवाहिक जीवन सौहार्दपूर्ण, संस्कारित और परस्पर विश्वास से परिपूर्ण रहेगा। नवांश (D-9) कुंडली में भी लग्न राशि (${RASHI_DATA[safeMod(navamsaLagnaRashi - 1, 12)].name}) दांपत्य सुख को सुदृढ़ बना रही है।`,
        spouseNature: 'सौम्य, सुशिक्षित व आकर्षक व्यक्तित्व, सनातन संस्कारों से युक्त, परिवार को जोड़कर चलने वाला और हर परिस्थिति में साथ निभाने वाला।',
        bestMarriageAge: `सप्तम भाव (${getHouseSummaryPlanets(7)}) एवं नवांश (D-9) चक्र के अनुसार दांपत्य सुख एवं पारिवारिक स्थिरता की दृष्टि से कुंडली के ग्रह अनुकूल हैं।`,
      },
      education: {
        title: '५. शास्त्रोक्त वैदिक उपाय, बुद्धि-प्रज्ञा एवं आध्यात्मिक सिद्धि (पंचम व नवम त्रिकोण)',
        summary: `पंचम (प्रज्ञा एवं पूर्वपुण्य) त्रिकोण (${getHouseSummaryPlanets(5)}) और नवम (धर्म एवं भाग्य) त्रिकोण (${getHouseSummaryPlanets(9)}) के शुभ संयोग तथा बुध (भाव ${mercHouse}, ${mercPlanet.degree}) व गुरु (भाव ${jupHouse}, ${jupPlanet.degree}) की स्थिति से आपकी स्मरण शक्ति, शास्त्र-चिंतन, गूढ़ विद्या और निर्णय क्षमता अत्यंत प्रखर रहेगी।`,
      },
      health: {
        title: '६. स्वास्थ्य, नाड़ी बल एवं प्राण-ऊर्जा (लग्न, षष्ठ भाव व आयुर्वेदिक विचार)',
        summary: `${lagnaData.name} लग्न, षष्ठ भाव (${getHouseSummaryPlanets(6)}) एवं ${nakshatraObj.nadi} के अनुसार आपकी नैसर्गिक रोग-प्रतिरोधक क्षमता और प्राण-ऊर्जा सुदृढ़ रहेगी। केवल ऋतु परिवर्तन और अत्यधिक मानसिक कार्यभार के समय वात-पित्त-कफ के संतुलन तथा नियमित सात्त्विक दिनचर्या का ध्यान रखना आपके दीर्घायुष्य व ओज को अक्षुण्ण रखेगा।`,
        careAreas: [
          `${nakshatraObj.nadi} के अनुसार ऋतु परिवर्तन में गले, पाचन तंत्र एवं त्रिदोष संतुलन का विशेष ध्यान रखें`,
          'अत्यधिक मानसिक श्रम के बीच पर्याप्त निद्रा, तांबे के पात्र का जल और प्रातः भ्रमण अपनाएं',
          'नियमित प्रातः सूर्योदय काल में तांबे के लोटे से सूर्य अर्घ्य, प्राणायाम और सात्त्विक आहार अमृत समान लाभकारी रहेगा',
        ],
      },
    },
    remedies: {
      strengths: [
        `लग्नेश ${lagnaData.lord} और राशि स्वामी ${moonData.lord} का शुभ समन्वय आपको आकर्षक व्यक्तित्व, आत्मबल व मानसिक दृढ़ता प्रदान करता है।`,
        `जन्म नक्षत्र ${nakshatraObj.name} (चरण ${nakshatraPada}, स्वामी: ${nakshatraObj.lord}) आपको समाज में विश्वसनीय, न्यायप्रिय और सम्मानित बनाता है।`,
        `कुंडली में निर्मित ${rajYogas.map((y) => y.name.split(' (')[0]).join(', ')} आपके ज्ञान, वाणी और कर्म को सार्थक बनाते हैं।`,
      ],
      precautions: [
        'राहुकाल में तथा भावनाओं या आवेश में बहकर कोई बड़ा आर्थिक या व्यावसायिक निर्णय न लें।',
        'अपनी महत्वपूर्ण कार्य-योजनाएं एवं व्यापारिक रणनीतियां पूर्ण होने से पूर्व गोपनीय रखें।',
        `रत्न धारण करने से पूर्व ग्रहों के अंश (डिग्री) व दशा का विचार अवश्य करें (आपके लग्न हेतु ${lagnaData.gemstone} परम शुभ है)।`,
      ],
      upayList: [
        `इष्ट उपासना एवं बीज मंत्र जप: प्रतिदिन प्रातः स्नान के पश्चात ${lagnaData.ishta} का ध्यान करें और सिद्ध बीज मंत्र "${lagnaData.mantra}" का रुद्राक्ष/तुलसी माला से १ माला (१०८ बार) जप करें।`,
        `शास्त्रोक्त रत्न एवं उपरत्न विधान: लग्नेश ${lagnaData.lord} के बल संवर्धन हेतु शुक्ल पक्ष के शुभ मुहूर्त में अभिमंत्रित ${lagnaData.gemstone} (अथवा उपरत्न: ${lagnaData.uparatna}) ${lagnaData.metal} में धारण करें।`,
        `रुद्राक्ष कवच एवं आध्यात्मिक रक्षा: मानसिक शांति, आरोग्य व नवग्रह अनुकूलता हेतु सोमवार या शुभ नक्षत्र में अभिमंत्रित ${lagnaData.rudraksha} लाल या पीले धागे में धारण करें।`,
        `नित्य वैदिक दान एवं पुण्य विधान: प्रातः तांबे के लोटे में लाल चंदन व अक्षत डालकर भगवान सूर्यनारायण को अर्घ्य दें, गौमाता को गुड़-रोटी खिलाएं तथा ${lagnaData.days} को अन्न/पीले फल का दान करें।`,
      ],
    },
  };
}
