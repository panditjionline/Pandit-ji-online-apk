import { getVedicDetailsFromName } from './kundaliMilan';

export interface GrahaPosition {
  id: string;
  name: string;
  hindiName: string;
  shortHindi: string;
  symbol: string;
  rashiNumber: number; // 1 to 12
  rashiName: string;
  rashiLord: string;
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
 * Lahiri (Chitrapaksha) Ayanamsa in degrees at Julian Day JD
 */
function getLahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Chitrapaksha Ayanamsa with nutation offset matching traditional Indian Panchang / AstroSage
  return 23.943 + 1.396042 * T + 0.000308 * T * T;
}

function getTrueRahuTropicalLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const meanNode = norm360(125.044555 - 1934.1361849 * T + 0.0020762 * T * T);
  const D = norm360(297.8501921 + 445267.1114034 * T) * DEG2RAD;
  const M = norm360(357.5291092 + 35999.0502909 * T) * DEG2RAD;
  const Mp = norm360(134.9633964 + 477198.8675055 * T) * DEG2RAD;
  const F = norm360(93.272095 + 483202.0175233 * T) * DEG2RAD;

  // Meeus True Node periodic terms
  const deltaNode =
    -1.4979 * Math.sin(2 * (D - F)) -
    0.15 * Math.sin(M) -
    0.1226 * Math.sin(2 * D) +
    0.1176 * Math.sin(2 * F) -
    0.0801 * Math.sin(2 * (Mp - F));

  return norm360(meanNode + deltaNode);
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
 * Tropical Sun Longitude (Meeus high accuracy)
 */
function getTropicalSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = M * DEG2RAD;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  const omega = (125.04 - 1934.136 * T) * DEG2RAD;
  const apparent = L0 + C - 0.00569 - 0.00478 * Math.sin(omega);
  return norm360(apparent);
}

/**
 * Tropical Moon Longitude (Meeus Ch. 47 periodic terms)
 */
function getTropicalMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
  const D = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T) * DEG2RAD;
  const M = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T) * DEG2RAD;
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) * DEG2RAD;
  const F = norm360(93.272095 + 483202.0175233 * T - 0.0036539 * T * T) * DEG2RAD;

  let dL = 0;
  dL += 6.288774 * Math.sin(Mp);
  dL += 1.274027 * Math.sin(2 * D - Mp);
  dL += 0.658314 * Math.sin(2 * D);
  dL += 0.213618 * Math.sin(2 * Mp);
  dL -= 0.185116 * Math.sin(M);
  dL -= 0.114332 * Math.sin(2 * F);
  dL += 0.058793 * Math.sin(2 * D - 2 * Mp);
  dL += 0.057066 * Math.sin(2 * D - M - Mp);
  dL += 0.053322 * Math.sin(2 * D + Mp);
  dL += 0.045758 * Math.sin(2 * D - M);
  dL -= 0.040923 * Math.sin(M - Mp);
  dL -= 0.03472 * Math.sin(D);
  dL -= 0.030383 * Math.sin(M + Mp);
  dL += 0.015327 * Math.sin(2 * D - 2 * F);
  dL -= 0.012528 * Math.sin(Mp + 2 * F);
  dL += 0.01098 * Math.sin(Mp - 2 * F);
  dL += 0.010675 * Math.sin(4 * D - Mp);
  dL += 0.010034 * Math.sin(3 * Mp);
  dL += 0.008548 * Math.sin(4 * D - 2 * Mp);
  dL -= 0.007888 * Math.sin(2 * D + M - Mp);
  dL -= 0.006766 * Math.sin(2 * D + M);
  dL -= 0.005163 * Math.sin(D - Mp);

  return norm360(Lp + dL);
}

interface OrbitalElements {
  a: number;
  e0: number;
  eRate: number;
  i0: number;
  L0: number;
  LRate: number;
  wBar0: number;
  wBarRate: number;
  node0: number;
  nodeRate: number;
}

const PLANET_ORBITS: Record<string, OrbitalElements> = {
  earth: {
    a: 1.00000261,
    e0: 0.01671123,
    eRate: -0.00004392,
    i0: -0.00001531,
    L0: 100.46457166,
    LRate: 35999.37244981,
    wBar0: 102.93768193,
    wBarRate: 0.32327364,
    node0: 0.0,
    nodeRate: 0.0,
  },
  mercury: {
    a: 0.38709927,
    e0: 0.20563593,
    eRate: 0.00001906,
    i0: 7.00497902,
    L0: 252.2503235,
    LRate: 149472.67411175,
    wBar0: 77.45779628,
    wBarRate: 0.16047689,
    node0: 48.33076593,
    nodeRate: -0.12534081,
  },
  venus: {
    a: 0.72333566,
    e0: 0.00677672,
    eRate: -0.00004107,
    i0: 3.39467605,
    L0: 181.9790995,
    LRate: 58517.81538729,
    wBar0: 131.60246718,
    wBarRate: 0.00268329,
    node0: 76.67984255,
    nodeRate: -0.27769418,
  },
  mars: {
    a: 1.52371034,
    e0: 0.0933941,
    eRate: 0.00007882,
    i0: 1.84969142,
    L0: 355.44656795,
    LRate: 19140.30268499,
    wBar0: 336.05637041,
    wBarRate: 0.44441088,
    node0: 49.55953891,
    nodeRate: -0.29257343,
  },
  jupiter: {
    a: 5.202887,
    e0: 0.04838624,
    eRate: -0.00013253,
    i0: 1.30439695,
    L0: 34.39644051,
    LRate: 3034.74612775,
    wBar0: 14.72847983,
    wBarRate: 0.21252668,
    node0: 100.47390909,
    nodeRate: 0.20469106,
  },
  saturn: {
    a: 9.53667594,
    e0: 0.05386179,
    eRate: -0.00050991,
    i0: 2.48599187,
    L0: 49.95424423,
    LRate: 1222.49362201,
    wBar0: 92.59887831,
    wBarRate: -0.41897216,
    node0: 113.66242448,
    nodeRate: -0.28867794,
  },
};

function getHeliocentricXY(planetKey: string, jd: number): { x: number; y: number } {
  const T = (jd - 2451545.0) / 36525.0;
  const el = PLANET_ORBITS[planetKey];
  const e = el.e0 + el.eRate * T;
  const L = norm360(el.L0 + el.LRate * T);
  const wBar = norm360(el.wBar0 + el.wBarRate * T);
  const node = norm360(el.node0 + el.nodeRate * T) * DEG2RAD;
  const inc = el.i0 * DEG2RAD;

  let M = norm360(L - wBar);

  // Jupiter-Saturn Great Inequality Perturbation
  if (planetKey === 'jupiter' || planetKey === 'saturn') {
    const Mj = norm360(34.39644 + 3034.74613 * T - 14.72848) * DEG2RAD;
    const Ms = norm360(49.95424 + 1222.49362 * T - 92.59888) * DEG2RAD;
    if (planetKey === 'jupiter') {
      M += -0.332 * Math.sin(2 * Mj - 5 * Ms - 67.6 * DEG2RAD) - 0.056 * Math.sin(2 * Mj - 2 * Ms + 21 * DEG2RAD);
    } else {
      M += 0.812 * Math.sin(2 * Mj - 5 * Ms - 67.6 * DEG2RAD) - 0.229 * Math.cos(2 * Mj - 4 * Ms - 2 * DEG2RAD);
    }
  }

  const Mrad = M * DEG2RAD;
  // Solve Kepler's Equation E - e*sin(E) = M
  let E = Mrad + e * Math.sin(Mrad) * (1.0 + e * Math.cos(Mrad));
  for (let iter = 0; iter < 6; iter++) {
    const dE = (E - e * Math.sin(E) - Mrad) / (1 - e * Math.cos(E));
    E -= dE;
  }

  const xv = el.a * (Math.cos(E) - e);
  const yv = el.a * Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.hypot(xv, yv);

  const argLat = v + (wBar * DEG2RAD - node);
  const x =
    r * (Math.cos(node) * Math.cos(argLat) - Math.sin(node) * Math.sin(argLat) * Math.cos(inc));
  const y =
    r * (Math.sin(node) * Math.cos(argLat) + Math.cos(node) * Math.sin(argLat) * Math.cos(inc));

  return { x, y };
}

function getGeocentricPlanetState(
  planetKey: string,
  jd: number
): { tropicalLon: number; isRetrograde: boolean } {
  const earth0 = getHeliocentricXY('earth', jd);
  const p0 = getHeliocentricXY(planetKey, jd);
  const lon0 = norm360(Math.atan2(p0.y - earth0.y, p0.x - earth0.x) * RAD2DEG);

  const earth1 = getHeliocentricXY('earth', jd + 0.25);
  const p1 = getHeliocentricXY(planetKey, jd + 0.25);
  const lon1 = norm360(Math.atan2(p1.y - earth1.y, p1.x - earth1.x) * RAD2DEG);

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
  const T = (jd - 2451545.0) / 36525.0;
  const gmst = norm360(
    280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T
  );
  const ramc = norm360(gmst + lonDeg) * DEG2RAD;
  const eps = (23.439291 - 0.0130042 * T) * DEG2RAD;
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

  const currentYear = new Date().getFullYear();
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
  const karanaIndex = safeMod(Math.floor(moonSunDiff / 6), 7);
  const karanaName = KARANA_NAMES[karanaIndex];

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

  // Calculate Exact Vimshottari Mahadasha Timeline from Birth Moon Nakshatra Fraction
  const startDashaIndex = VIMSHOTTARI_SEQUENCE.findIndex((d) =>
    d.planet.startsWith(nakshatraObj.lord.split(' ')[0])
  );
  const validStartIdx = startDashaIndex >= 0 ? startDashaIndex : 0;

  const birthDecimalYear = year + (month - 1) / 12 + day / 365.25;
  const nowDate = new Date();
  const currentDecimalYear =
    nowDate.getFullYear() + nowDate.getMonth() / 12 + nowDate.getDate() / 365.25;

  let runningDecimalYear = birthDecimalYear;
  const mahadashas: VimshottariDashaItem[] = [];

  for (let i = 0; i < 9; i++) {
    const seqItem = VIMSHOTTARI_SEQUENCE[safeMod(validStartIdx + i, 9)];
    const durationYears =
      i === 0 ? Math.max(0.5, seqItem.years * (1 - nakshatraFractionElapsed)) : seqItem.years;
    const startDec = runningDecimalYear;
    const endDec = runningDecimalYear + durationYears;

    const startY = Math.floor(startDec);
    const endY = Math.floor(endDec);
    const isCurrent = currentDecimalYear >= startDec && currentDecimalYear < endDec;

    // Calculate active Antardasha inside current Mahadasha
    let currentAntardasha: string | undefined;
    if (isCurrent) {
      const elapsedInMaha = (currentDecimalYear - startDec) / durationYears;
      const antarOffset = Math.min(8, Math.max(0, Math.floor(elapsedInMaha * 9)));
      currentAntardasha = VIMSHOTTARI_SEQUENCE[safeMod(validStartIdx + i + antarOffset, 9)].planet;
    }

    mahadashas.push({
      planet: seqItem.planet,
      years: Math.round(durationYears * 10) / 10,
      startYear: startY,
      endYear: endY,
      startDateDisplay: `${startY}`,
      endDateDisplay: `${endY}`,
      isCurrent,
      currentAntardasha,
      prediction: seqItem.effect,
    });

    runningDecimalYear = endDec;
  }

  if (!mahadashas.some((m) => m.isCurrent) && mahadashas.length > 0) {
    mahadashas[0].isCurrent = true;
    mahadashas[0].currentAntardasha = VIMSHOTTARI_SEQUENCE[safeMod(validStartIdx + 1, 9)].planet;
  }

  // Dosha Analysis
  const marsPlanet = planets.find((p) => p.id === 'mars')!;
  const manglikHouses = [1, 4, 7, 8, 12];
  const isMarsInManglikHouse = manglikHouses.includes(marsPlanet.houseInLagna);
  const isManglikCancelled =
    [1, 8, 10].includes(marsPlanet.rashiNumber) ||
    planets.find((p) => p.id === 'jupiter')?.houseInLagna === marsPlanet.houseInLagna;

  const manglikAnalysis = {
    isManglik: isMarsInManglikHouse && !isManglikCancelled,
    severity: !isMarsInManglikHouse
      ? ('मांगलिक दोष रहित (Non-Manglik)' as const)
      : isManglikCancelled
      ? ('आंशिक मांगलिक' as const)
      : ('पूर्ण मांगलिक' as const),
    marsHouse: marsPlanet.houseInLagna,
    explanation: !isMarsInManglikHouse
      ? `आपकी लग्न कुंडली में मंगल ग्रह ${marsPlanet.houseInLagna}वें भाव (${marsPlanet.rashiName}) में स्थित है। अतः आपकी कुंडली मांगलिक दोष से पूर्णतः मुक्त (Non-Manglik) है।`
      : isManglikCancelled
      ? `मंगल ${marsPlanet.houseInLagna}वें भाव में है, परंतु स्वराशि/उच्च प्रभाव या शुभ दृष्टि के कारण मांगलिक दोष स्वतः परिहार (आंशिक/निष्प्रभावी) हो रहा है।`
      : `लग्न कुंडली के ${marsPlanet.houseInLagna}वें भाव में मंगल स्थित होने से मांगलिक प्रभाव बन रहा है। यह आपको ऊर्जावान व साहसी बनाता है, केवल विवाह के समय कुंडली मिलान कर लेना शुभ रहेगा।`,
    remedy: !isMarsInManglikHouse
      ? 'मंगल की शुभता हेतु मंगलवार को श्री हनुमान चालीसा का पाठ करें।'
      : 'मंगलवार को हनुमान जी को सिंदूर व चोला अर्पित करें तथा विवाह से पूर्व पण्डित जी से गुण मिलान अवश्य कराएं।',
  };

  // Kaal Sarp Check: Check if all 7 planets are hemmed on one side of Rahu-Ketu axis
  const rahuLon = rahuSiderealLon;
  const ketuLon = ketuSiderealLon;
  const sevenPlanets = planets.filter((p) => p.id !== 'rahu' && p.id !== 'ketu');
  const sideA = sevenPlanets.every((p, idx) => {
    const lon = rawPlanets[idx].siderealLon;
    return norm360(lon - rahuLon) < 180;
  });
  const sideB = sevenPlanets.every((p, idx) => {
    const lon = rawPlanets[idx].siderealLon;
    return norm360(lon - ketuLon) < 180;
  });
  const isKaalSarp = sideA || sideB;

  const sadeSatiRashis = [11, 12, 1];
  const isSadeSati = sadeSatiRashis.includes(moonRashiNumber);

  // Auspicious Raj Yogas
  const rajYogas: ShubhYogaItem[] = [];
  const sunHouse = planets.find((p) => p.id === 'sun')!.houseInLagna;
  const mercHouse = planets.find((p) => p.id === 'mercury')!.houseInLagna;
  const jupHouse = planets.find((p) => p.id === 'jupiter')!.houseInLagna;
  const moonHouse = planets.find((p) => p.id === 'moon')!.houseInLagna;

  if (sunHouse === mercHouse) {
    rajYogas.push({
      name: 'बुधादित्य राजयोग (Budhaditya Rajyoga)',
      sanskritRule: `भाव ${sunHouse} में सूर्य एवं बुध की युति`,
      strength: 'प्रबल योग',
      description:
        'आपकी कुंडली में सूर्य और बुध एक ही भाव में स्थित होकर प्रबल बुधादित्य राजयोग बना रहे हैं, जो आपको कुशाग्र बुद्धि, वाणी का तेज, ज्योतिष/शास्त्र ज्ञान और समाज में विशेष मान-सम्मान प्रदान करता है।',
    });
  }

  if ([1, 4, 7, 10].includes(safeMod(jupHouse - moonHouse, 12) + 1)) {
    rajYogas.push({
      name: 'गजकेसरी राजयोग (Gajakesari Rajyoga)',
      sanskritRule: 'चंद्रमा से केंद्र में देवगुरु बृहस्पति',
      strength: 'प्रबल योग',
      description:
        'गुरु और चंद्र के शुभ संबंध से गजकेसरी योग बन रहा है। इसके प्रभाव से व्यक्ति अपने कुल का नाम रोशन करता है और स्थायी धन-संपत्ति व प्रतिष्ठा प्राप्त करता है।',
    });
  }

  if (planets.find((p) => p.id === 'jupiter')?.dignity === 'स्वगृही (Own Sign)') {
    rajYogas.push({
      name: 'स्वगृही बृहस्पति (हंस तुल्य ज्ञान योग)',
      sanskritRule: 'देवगुरु बृहस्पति अपनी ही स्वराशि में स्थित',
      strength: 'प्रबल योग',
      description:
        'आपकी कुंडली में देवगुरु बृहस्पति अपनी ही राशि (स्वगृही) में विराजमान हैं, जो धर्म, अध्यात्म, वैदिक ज्ञान, परामर्श और समाज में आचार्य/गुरु के रूप में उच्च प्रतिष्ठा प्रदान करते हैं।',
    });
  }

  rajYogas.push({
    name: 'कर्म-सिद्धि एवं भाग्योदय योग',
    sanskritRule: 'दशम (कर्म) एवं एकादश (लाभ) भाव में ग्रहों का विशेष संयोग',
    strength: 'शुभ योग',
    description:
      'आपकी कुंडली में अपने परिश्रम, वाणी और कर्म के बल पर जीवन में निरंतर उन्नति करने का प्रबल योग है।',
  });

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
    mahadashas,
    doshaAnalysis: {
      manglik: manglikAnalysis,
      kaalSarp: {
        isPresent: isKaalSarp,
        type: isKaalSarp ? 'कालसर्प योग प्रभाव' : 'कालसर्प दोष से मुक्त (No Kaal Sarp Dosh)',
        explanation: isKaalSarp
          ? 'कुंडली में राहु-केतु अक्ष के एक ओर ग्रह होने से प्रारंभिक संघर्ष के बाद 32 वर्ष की आयु से विशेष भाग्योदय होता है।'
          : 'आपकी जन्म कुंडली में नवग्रह राहु-केतु अक्ष के दोनों ओर स्वतंत्र रूप से स्थित हैं, अतः कुंडली कालसर्प दोष से पूर्णतः मुक्त है।',
        remedy: 'सोमवार को शिवलिंग पर जल एवं बिल्वपत्र अर्पित करें और "ॐ नमः शिवाय" का जप करें।',
      },
      sadeSati: {
        status: isSadeSati
          ? 'शनि साढ़े साती का प्रभाव सक्रिय'
          : 'शनि साढ़े साती से मुक्त (अनुकूल गोचर)',
        phase: isSadeSati ? 'मध्य/उतरता चरण (कर्म एवं संयम काल)' : 'शुभ शनि गोचर स्थिति',
        explanation: isSadeSati
          ? `आपकी जन्म चंद्र राशि ${moonData.name} होने से वर्तमान में शनि देव आपको अनुशासन, धैर्य और ठोस कर्म की प्रेरणा दे रहे हैं।`
          : `आपकी चंद्र राशि ${moonData.name} पर वर्तमान में शनि साढ़े साती का प्रभाव नहीं है, जिससे कार्यों में गति और स्थिरता प्राप्त होगी।`,
        remedy: 'शनिवार की संध्या को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक जलाएं एवं हनुमान चालीसा का पाठ करें।',
      },
      pitraDosha: {
        status: 'पितरों एवं कुलदेवता का शुभ आशीर्वाद',
        explanation:
          'आपकी कुंडली में गुरु व शुभ ग्रहों के प्रभाव से आपको अपने पूर्वजों व कुलदेवता की कृपा प्राप्त है।',
      },
    },
    rajYogas,
    predictions: {
      personality: {
        title: `${lagnaData.name} लग्न एवं ${moonData.name} राशि का व्यक्तित्व`,
        summary: `आपका जन्म ${lagnaData.name} लग्न (${lagnaDegInfo.fullDMS}, स्वामी: ${lagnaData.lord}) और ${moonData.name} चंद्र राशि (नक्षत्र: ${nakshatraObj.name}, चरण ${nakshatraPada}) में हुआ है। आप स्वाभिमानी, आकर्षक व्यक्तित्व वाले, धर्म-कर्म में आस्था रखने वाले और अपने उत्तरदायित्वों को गंभीरता से निभाने वाले व्यक्ति हैं।`,
        keyTraits: [
          `तत्व प्रधानता: ${lagnaData.tatva} — स्थिर बुद्धि, दूरदर्शी एवं निर्णय क्षमता में प्रबल`,
          'आत्मनिर्भर स्वभाव: अपनी मेहनत और ज्ञान से समाज में विशेष पहचान बनाने वाले',
          'परिवार, परंपरा व सनातन धर्म के प्रति गहरी निष्ठा एवं सात्विक संस्कार',
        ],
      },
      career: {
        title: 'करियर, कर्म एवं प्रतिष्ठा (दशम भाव विश्लेषण)',
        summary: `आपकी कुंडली के दशम (कर्म) भाव और ग्रहों की स्थिति दर्शाती है कि आपमें नेतृत्व, मार्गदर्शन और स्वतंत्र कार्य की अद्भुत क्षमता है। ${lagnaData.lord} और देवगुरु बृहस्पति के प्रभाव से ज्योतिष/वैदिक कर्मकांड, शिक्षा, परामर्श, प्रशासनिक कार्य या स्वतंत्र व्यवसाय में आपको उच्च मान-सम्मान प्राप्त होगा।`,
        bestFields: [
          'वैदिक ज्ञान, ज्योतिष, शिक्षा, परामर्श एवं आध्यात्मिक मार्गदर्शन',
          'स्वतंत्र व्यवसाय, प्रबंधन एवं जनसंपर्क से जुड़े क्षेत्र',
          'संस्थागत नेतृत्व, मीडिया/यूट्यूब एवं सामाजिक सेवा क्षेत्र',
        ],
        peakYears: 'आयु के 28वें, 30वें, 32वें और 35वें वर्ष से करियर एवं प्रतिष्ठा में विशेष उत्कर्ष के प्रबल योग हैं।',
      },
      wealth: {
        title: 'धन, संपत्ति, भूमि एवं वाहन योग (द्वितीय व एकादश भाव)',
        summary: `धन भाव और एकादश (लाभ) भाव की स्थिति से आपके जीवन में धन और सम्मान का प्रवाह निरंतर बढ़ता रहेगा। मध्य आयु में स्वयं की भूमि, सुंदर भवन और वाहन सुख का पूर्ण योग है।`,
        highlights: [
          'स्व-अर्जित ज्ञान व कर्म से स्थायी संपत्ति व भवन निर्माण का योग',
          'एकादश भाव के प्रभाव से समाज के प्रतिष्ठित लोगों से सहयोग व लाभ',
          'अनावश्यक खर्चों पर नियंत्रण रखने से उत्तम धन संचय होगा',
        ],
      },
      marriage: {
        title: 'विवाह, जीवनसाथी एवं पारिवारिक सुख (सप्तम भाव)',
        summary: `सप्तम भाव के प्रभाव से आपका वैवाहिक एवं पारिवारिक जीवन सुखद, सहयोगपूर्ण और संस्कारित रहेगा। जीवनसाथी परिवार को जोड़कर चलने वाला और आपके भाग्योदय में सहायक सिद्ध होगा।`,
        spouseNature: 'सौम्य व आकर्षक व्यक्तित्व, धार्मिक संस्कारों से युक्त और परिवार के प्रति समर्पित।',
        bestMarriageAge: 'वैवाहिक सुख एवं स्थिरता की दृष्टि से कुंडली के ग्रह अनुकूल हैं।',
      },
      education: {
        title: 'शिक्षा, बुद्धि एवं गूढ़ ज्ञान (पंचम व अष्टम भाव)',
        summary: `पंचम और अष्टम भाव में ग्रहों के प्रभाव से आपकी स्मरण शक्ति, शास्त्र ज्ञान, ज्योतिष एवं गूढ़ विषयों में गहरी पकड़ रहेगी। आपका व्यावहारिक अनुभव और वाणी प्रभावशाली रहेगी।`,
      },
      health: {
        title: 'स्वास्थ्य एवं जीवन ऊर्जा (लग्न व षष्ठ भाव)',
        summary: `आपकी रोग-प्रतिरोधक क्षमता अच्छी रहेगी, किंतु अत्यधिक परिश्रम या अनियमित दिनचर्या से गले, कफ या पाचन संबंधी हल्की सावधानी रखनी चाहिए।`,
        careAreas: [
          'गले, कफ/सर्दी एवं पाचन तंत्र का ऋतु परिवर्तन के समय ध्यान रखें',
          'अत्यधिक मानसिक कार्यभार के बीच पर्याप्त विश्राम लें',
          'नियमित प्रातः सूर्य अर्घ्य, प्राणायाम और सात्विक आहार अत्यंत लाभकारी रहेगा',
        ],
      },
    },
    remedies: {
      strengths: [
        `लग्नेश ${lagnaData.lord} और राशि स्वामी ${moonData.lord} आपको आकर्षक व्यक्तित्व व मानसिक दृढ़ता प्रदान करते हैं।`,
        `जन्म नक्षत्र ${nakshatraObj.name} (चरण ${nakshatraPada}) आपको समाज में विश्वसनीय और सम्मानित बनाता है।`,
        `कुंडली में निर्मित राजयोग आपके ज्ञान, वाणी और कर्म को सार्थक बनाते हैं।`,
      ],
      precautions: [
        'भावनाओं में बहकर या जल्दबाजी में कोई बड़ा आर्थिक निर्णय न लें।',
        'अपनी महत्वपूर्ण योजनाएं पूर्ण होने से पहले गुप्त रखें।',
        `रत्न धारण करने से पूर्व ग्रहों की डिग्री व अवस्था का विचार अवश्य करें (आपके लिए ${lagnaData.gemstone} शुभ है)।`,
      ],
      upayList: [
        `आराध्य उपासना: प्रतिदिन ${lagnaData.ishta} का स्मरण करें और "${lagnaData.mantra}" का 1 माला (108 बार) जप करें।`,
        `शुभ रत्न परामर्श: विधिपूर्वक अभिमंत्रित ${lagnaData.gemstone} (या उपरत्न: ${lagnaData.uparatna}) ${lagnaData.metal} में धारण करना शुभ रहेगा।`,
        `रुद्राक्ष कवच: मानसिक शांति, स्वास्थ्य व ग्रह बल हेतु अभिमंत्रित ${lagnaData.rudraksha} धारण करें।`,
        `दैनिक पुण्य कर्म: प्रातः तांबे के लोटे से सूर्य देव को अर्घ्य दें और गाय को हरा चारा या रोटी खिलाएं।`,
      ],
    },
  };
}
