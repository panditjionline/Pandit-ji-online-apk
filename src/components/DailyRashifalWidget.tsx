import React, { useState, useEffect } from 'react';
import {
  getISTCalendarParts,
  getMsUntilNextISTMidnight,
  VAAR_LIST,
  HINDI_MONTH_SHORT,
  buildSingleDayPanchang,
} from '../utils/panchangCalendarEngine';
import { getTodayPanchang } from '../data/mockData';
import { vedicAudio } from '../utils/audioSynthesizer';
import { getActiveProfile, setActiveProfile } from '../utils/autoPersonalization';
import { generateSampurnKundali } from '../utils/sampurnKundali';
import {
  getCalculationViewingMode,
  setCalculationViewingMode,
  CalculationViewingMode,
  formatUserSalutation,
} from '../utils/familyVaultStorage';
import { getVedicDetailsFromName } from '../utils/kundaliMilan';
import { UserMobileAccount } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Sparkles,
  Sun,
  Star,
  Volume2,
  VolumeX,
  MessageCircle,
  Flame,
  Compass,
  Heart,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Bell,
  CheckCircle2,
  BookmarkCheck,
  GraduationCap,
  AlertTriangle,
  Gem,
  Moon,
  Clock,
} from 'lucide-react';

export interface RashiItem {
  id: string;
  hindiName: string;
  englishName: string;
  symbol: string;
  element: string;
  nature: string; // चर / स्थिर / द्विस्वभाव
  swami: string;
  aradhyaDev: string;
  nakshatras: string;
  ratna: string;
  dhatu: string;
  mitraRashi: string;
  letters: string;
  beejMantra: string;
}

export const TWELVE_RASHIS: RashiItem[] = [
  {
    id: 'mesh',
    hindiName: 'मेष',
    englishName: 'Aries',
    symbol: '♈',
    element: 'अग्नि तत्त्व',
    nature: 'चर राशि',
    swami: 'मंगल देव',
    aradhyaDev: 'श्री हनुमान जी एवं भगवान कार्तिकेय',
    nakshatras: 'अश्विनी (4 चरण), भरणी (4 चरण), कृत्तिका (1 चरण)',
    ratna: 'मूंगा रत्न',
    dhatu: 'तांबा एवं स्वर्ण',
    mitraRashi: 'सिंह, धनु, कर्क, मीन',
    letters: 'चू, चे, चो, ला, ली, लू, ले, लो, अ',
    beejMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः॥',
  },
  {
    id: 'vrishabh',
    hindiName: 'वृषभ',
    englishName: 'Taurus',
    symbol: '♉',
    element: 'पृथ्वी तत्त्व',
    nature: 'स्थिर राशि',
    swami: 'शुक्र देव',
    aradhyaDev: 'माँ महालक्ष्मी एवं माता दुर्गा',
    nakshatras: 'कृत्तिका (3 चरण), रोहिणी (4 चरण), मृगशिरा (2 चरण)',
    ratna: 'हीरा / ओपल रत्न',
    dhatu: 'चांदी एवं प्लैटिनम',
    mitraRashi: 'कन्या, मकर, मिथुन, कुम्भ',
    letters: 'ई, ऊ, ए, ओ, वा, वी, वू, वे, वो',
    beejMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः॥',
  },
  {
    id: 'mithun',
    hindiName: 'मिथुन',
    englishName: 'Gemini',
    symbol: '♊',
    element: 'वायु तत्त्व',
    nature: 'द्विस्वभाव राशि',
    swami: 'बुध देव',
    aradhyaDev: 'भगवान श्री गणेश एवं श्री विष्णु',
    nakshatras: 'मृगशिरा (2 चरण), आर्द्रा (4 चरण), पुनर्वसु (3 चरण)',
    ratna: 'पन्ना रत्न',
    dhatu: 'कांसा एवं स्वर्ण',
    mitraRashi: 'तुला, कुम्भ, वृषभ, सिंह',
    letters: 'का, की, कू, घ, ङ, छ, के, को, हा',
    beejMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः॥',
  },
  {
    id: 'kark',
    hindiName: 'कर्क',
    englishName: 'Cancer',
    symbol: '♋',
    element: 'जल तत्त्व',
    nature: 'चर राशि',
    swami: 'चन्द्र देव',
    aradhyaDev: 'भगवान आशुतोष शिवशंकर एवं माँ गौरी',
    nakshatras: 'पुनर्वसु (1 चरण), पुष्य (4 चरण), आश्लेषा (4 चरण)',
    ratna: 'सच्चा मोती रत्न',
    dhatu: 'चांदी',
    mitraRashi: 'वृश्चिक, मीन, मेष, सिंह',
    letters: 'ही, हू, हे, हो, डा, डी, डू, डे, डो',
    beejMantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः॥',
  },
  {
    id: 'simha',
    hindiName: 'सिंह',
    englishName: 'Leo',
    symbol: '♌',
    element: 'अग्नि तत्त्व',
    nature: 'स्थिर राशि',
    swami: 'सूर्य देव',
    aradhyaDev: 'भगवान सूर्यनारायण एवं श्री राम',
    nakshatras: 'मघा (4 चरण), पूर्वाफाल्गुनी (4 चरण), उत्तराफाल्गुनी (1 चरण)',
    ratna: 'माणिक्य रत्न',
    dhatu: 'स्वर्ण एवं तांबा',
    mitraRashi: 'मेष, धनु, कर्क, वृश्चिक',
    letters: 'मा, मी, मू, मे, मो, टा, टी, टू, टे',
    beejMantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः॥',
  },
  {
    id: 'kanya',
    hindiName: 'कन्या',
    englishName: 'Virgo',
    symbol: '♍',
    element: 'पृथ्वी तत्त्व',
    nature: 'द्विस्वभाव राशि',
    swami: 'बुध देव',
    aradhyaDev: 'भगवान श्री गणेश एवं माँ गायत्री',
    nakshatras: 'उत्तराफाल्गुनी (3 चरण), हस्त (4 चरण), चित्रा (2 चरण)',
    ratna: 'पन्ना रत्न',
    dhatu: 'चांदी एवं स्वर्ण',
    mitraRashi: 'वृषभ, मकर, मिथुन, तुला',
    letters: 'ढो, पा, पी, पू, ष, ण, ठ, पे, पो',
    beejMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः॥',
  },
  {
    id: 'tula',
    hindiName: 'तुला',
    englishName: 'Libra',
    symbol: '♎',
    element: 'वायु तत्त्व',
    nature: 'चर राशि',
    swami: 'शुक्र देव',
    aradhyaDev: 'माँ महालक्ष्मी एवं संतोषी माता',
    nakshatras: 'चित्रा (2 चरण), स्वाति (4 चरण), विशाखा (3 चरण)',
    ratna: 'हीरा / जरकन रत्न',
    dhatu: 'चांदी एवं प्लैटिनम',
    mitraRashi: 'मिथुन, कुम्भ, वृषभ, मकर',
    letters: 'रा, री, रू, रे, रो, ता, ती, तू, ते',
    beejMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः॥',
  },
  {
    id: 'vrishchik',
    hindiName: 'वृश्चिक',
    englishName: 'Scorpio',
    symbol: '♏',
    element: 'जल तत्त्व',
    nature: 'स्थिर राशि',
    swami: 'मंगल देव',
    aradhyaDev: 'श्री हनुमान जी एवं काल भैरव',
    nakshatras: 'विशाखा (1 चरण), अनुराधा (4 चरण), ज्येष्ठा (4 चरण)',
    ratna: 'सिंदूरी मूंगा रत्न',
    dhatu: 'तांबा',
    mitraRashi: 'कर्क, मीन, सिंह, धनु',
    letters: 'तो, ना, नी, नू, ने, नो, या, यी, यू',
    beejMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः॥',
  },
  {
    id: 'dhanu',
    hindiName: 'धनु',
    englishName: 'Sagittarius',
    symbol: '♐',
    element: 'अग्नि तत्त्व',
    nature: 'द्विस्वभाव राशि',
    swami: 'देवगुरु बृहस्पति',
    aradhyaDev: 'भगवान श्री हरि विष्णु एवं दत्तात्रेय',
    nakshatras: 'मूल (4 चरण), पूर्वाषाढ़ा (4 चरण), उत्तराषाढ़ा (1 चरण)',
    ratna: 'पुखराज रत्न',
    dhatu: 'स्वर्ण एवं पीतल',
    mitraRashi: 'मेष, सिंह, कर्क, मीन',
    letters: 'ये, यो, भा, भी, भू, धा, फा, ढा, भे',
    beejMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः॥',
  },
  {
    id: 'makar',
    hindiName: 'मकर',
    englishName: 'Capricorn',
    symbol: '♑',
    element: 'पृथ्वी तत्त्व',
    nature: 'चर राशि',
    swami: 'शनि देव',
    aradhyaDev: 'न्याय के देवता शनि देव एवं श्री हनुमान',
    nakshatras: 'उत्तराषाढ़ा (3 चरण), श्रवण (4 चरण), धनिष्ठा (2 चरण)',
    ratna: 'नीलम / कटैला रत्न',
    dhatu: 'लोहा एवं पंचधातु',
    mitraRashi: 'वृषभ, कन्या, तुला, कुम्भ',
    letters: 'भो, जा, जी, खी, खू, खे, खो, गा, गी',
    beejMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः॥',
  },
  {
    id: 'kumbh',
    hindiName: 'कुम्भ',
    englishName: 'Aquarius',
    symbol: '♒',
    element: 'वायु तत्त्व',
    nature: 'स्थिर राशि',
    swami: 'शनि देव',
    aradhyaDev: 'भगवान शिव एवं शनि महाराज',
    nakshatras: 'धनिष्ठा (2 चरण), शतभिषा (4 चरण), पूर्वाभाद्रपद (3 चरण)',
    ratna: 'नीलम / लाजवर्त रत्न',
    dhatu: 'अष्टधातु एवं लोहा',
    mitraRashi: 'मिथुन, तुला, वृषभ, मकर',
    letters: 'गू, गे, गो, सा, सी, सू, से, सो, दा',
    beejMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः॥',
  },
  {
    id: 'meen',
    hindiName: 'मीन',
    englishName: 'Pisces',
    symbol: '♓',
    element: 'जल तत्त्व',
    nature: 'द्विस्वभाव राशि',
    swami: 'देवगुरु बृहस्पति',
    aradhyaDev: 'भगवान श्री लक्ष्मी-नारायण एवं गुरुदेव',
    nakshatras: 'पूर्वाभाद्रपद (1 चरण), उत्तराभाद्रपद (4 चरण), रेवती (4 चरण)',
    ratna: 'पुखराज / सुनहला रत्न',
    dhatu: 'स्वर्ण',
    mitraRashi: 'कर्क, वृश्चिक, मेष, धनु',
    letters: 'दी, दू, थ, झ, ञ, दे, दो, चा, ची',
    beejMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः॥',
  },
];

const DAILY_SHLOKAS = [
  {
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',
    source: 'श्रीमद्भगवद्गीता २.४७',
    meaning: 'अपने श्रेष्ठ कर्म करने में ही तुम्हारा अधिकार है, फल की चिंता त्याग कर निष्ठा से कर्तव्य पथ पर आगे बढ़ें।',
  },
  {
    sanskrit: 'श्रद्धावान् लभते ज्ञानं तत्परः संयतेन्द्रियः।',
    source: 'श्रीमद्भगवद्गीता ४.३९',
    meaning: 'श्रद्धा और जितेन्द्रिय भाव रखने वाले साधक को परम ज्ञान एवं शाश्वत आध्यात्मिक शांति की प्राप्ति होती है।',
  },
  {
    sanskrit: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।',
    source: 'बृहदारण्यक उपनिषद्',
    meaning: 'संसार के सभी प्राणी सुखी रहें, सभी निरोगी रहें और सभी के जीवन में मंगलमय कल्याण का उदय हो।',
  },
  {
    sanskrit: 'आयुः प्रजां धनं विद्यां स्वर्गं मोक्षं सुखानि च।',
    source: 'विष्णु धर्मोत्तर पुराण',
    meaning: 'नित्य सात्त्विक साधना और प्रभु स्मरण से दीर्घायु, उत्तम संतान, धन, विद्या और परम सुख की प्राप्ति होती है।',
  },
  {
    sanskrit: 'यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः।',
    source: 'श्रीमद्भगवद्गीता १८.७८',
    meaning: 'जहाँ धर्म एवं भगवान का आश्रय है और पुरुषार्थ का धनुष है, वहीं लक्ष्मी, विजय और अटल नीति सदा विराजती है।',
  },
];

const CHANDRA_BHAVA_DESCRIPTIONS: Array<{
  bhavaName: string;
  chandrabal: string;
  tarabal: string;
  gocharSummary: string;
}> = [
  {
    bhavaName: 'प्रथम (लग्न) भाव में चन्द्र गोचर',
    chandrabal: 'अति-शुभ एवं बली (प्रथम भाव)',
    tarabal: 'सम्पत तारा (धन व यश प्रदायक)',
    gocharSummary:
      'आज चन्द्रमा आपकी अपनी ही राशि (प्रथम भाव) में गोचरस्थ हैं। इससे आत्मबल, चेहरे पर तेज, मानसिक प्रसन्नता और राजकीय सम्मान में वृद्धि का प्रबल योग बन रहा है।',
  },
  {
    bhavaName: 'द्वितीय (धन व वाणी) भाव में चन्द्र गोचर',
    chandrabal: 'शुभ फलदायी (द्वितीय भाव)',
    tarabal: 'क्षेम तारा (कल्याणकारी)',
    gocharSummary:
      'आज चन्द्रमा आपकी राशि से द्वितीय धन भाव में संचरण कर रहे हैं। मधुर वाणी से रुके कार्य सिद्ध होंगे, कुटुम्ब का सहयोग मिलेगा तथा संचित कोष में वृद्धि होगी।',
  },
  {
    bhavaName: 'तृतीय (पराक्रम व भ्रातृ) भाव में चन्द्र गोचर',
    chandrabal: 'अति-श्रेष्ठ एवं विजयप्रद (तृतीय भाव)',
    tarabal: 'साधक तारा (कार्य सिद्धि)',
    gocharSummary:
      'आज चन्द्रमा आपकी राशि से तृतीय पराक्रम भाव में गोचर कर रहे हैं। साहस एवं पुरुषार्थ चरम पर रहेगा, छोटी यात्राएं लाभप्रद रहेंगी और मित्रों से शुभ समाचार मिलेगा।',
  },
  {
    bhavaName: 'चतुर्थ (सुख, भूमि व मातृ) भाव में चन्द्र गोचर',
    chandrabal: 'मध्यम-शुभ (चतुर्थ भाव)',
    tarabal: 'मित्र तारा (सहयोग प्रदायक)',
    gocharSummary:
      'आज चन्द्रमा आपकी राशि से चतुर्थ सुख भाव में स्थित हैं। माता का आशीर्वाद फलित होगा, गृह-सुख व वाहन-संपत्ति से जुड़े विषयों में सकारात्मक प्रगति दिखाई देगी।',
  },
  {
    bhavaName: 'पंचम (विद्या, बुद्धि व संतान) भाव में चन्द्र गोचर',
    chandrabal: 'शुभ एवं ज्ञानवर्धक (पंचम भाव)',
    tarabal: 'परम मित्र तारा (अति-अनुकूल)',
    gocharSummary:
      'आज चन्द्रमा आपकी राशि से पंचम त्रिकोण भाव में विराजमान हैं। बौद्धिक क्षमता प्रखर रहेगी, संतान पक्ष से हर्ष प्राप्त होगा और आकस्मिक धन-लाभ के अवसर बनेंगे।',
  },
  {
    bhavaName: 'षष्ठ (रोग-शत्रु विजय) भाव में चन्द्र गोचर',
    chandrabal: 'विजय कारक एवं अनुकूल (षष्ठ भाव)',
    tarabal: 'सम्पत तारा (विरोधी परास्त)',
    gocharSummary:
      'आज चन्द्रमा आपकी राशि से षष्ठ भाव में गोचर कर रहे हैं। ज्योतिष शास्त्र अनुसार छठे चन्द्रमा विरोधियों को शांत करते हैं, पुराने ऋण से मुक्ति और कार्यक्षेत्र में दबदबा बढ़ाते हैं।',
  },
  {
    bhavaName: 'सप्तम (दांपत्य व साझेदारी) भाव में चन्द्र गोचर',
    chandrabal: 'अति-शुभ एवं लक्ष्मीप्रद (सप्तम भाव)',
    tarabal: 'साधक तारा (व्यापार वृद्धि)',
    gocharSummary:
      'आज चन्द्रमा आपकी राशि से सप्तम केंद्र भाव में पूर्ण दृष्टि डाल रहे हैं। दैनिक व्यापार में विशेष उछाल, साझेदारी में लाभ और जीवनसाथी के साथ मधुर सामंजस्य स्थापित होगा।',
  },
  {
    bhavaName: 'अष्टम (आध्यात्म व गुप्त चिंतन) भाव में चन्द्र गोचर',
    chandrabal: 'संयम व मंत्र-साधना कारक (अष्टम भाव)',
    tarabal: 'क्षेम तारा (इष्ट कृपा से रक्षा)',
    gocharSummary:
      'आज चन्द्रमा आपकी राशि से अष्टम भाव में हैं। आज बड़े जोखिम या जल्दबाजी से बचें; आध्यात्मिक जप, शोध कार्य और शांत चित्त से किए गए नियोजन में विशेष दैवीय सहायता मिलेगी।',
  },
  {
    bhavaName: 'नवम (भाग्य, धर्म व गुरु) भाव में चन्द्र गोचर',
    chandrabal: 'भाग्योदय कारक (नवम भाव)',
    tarabal: 'मित्र तारा (धर्म व पुण्य वृद्धि)',
    gocharSummary:
      'आज चन्द्रमा आपकी राशि से नवम भाग्य त्रिकोण में गोचर कर रहे हैं। भाग्य का भरपूर साथ मिलेगा, धार्मिक अनुष्ठान में रुचि बढ़ेगी और वरिष्ठजनों की कृपा से बड़ी बाधा दूर होगी।',
  },
  {
    bhavaName: 'दशम (कर्म, राज्य व पद-प्रतिष्ठा) भाव में चन्द्र गोचर',
    chandrabal: 'अति-श्रेष्ठ कर्म सिद्धि (दशम भाव)',
    tarabal: 'सम्पत तारा (पद-प्रतिष्ठा लाभ)',
    gocharSummary:
      'आज चन्द्रमा आपकी राशि से दशम कर्म केंद्र में गोचरस्थ हैं। राज्यपक्ष, उच्चाधिकारियों और व्यापारिक जगत में आपके निर्णय की सराहना होगी तथा मान-प्रतिष्ठा में वृद्धि होगी।',
  },
  {
    bhavaName: 'एकादश (लाभ, आय व मनोकामना पूर्ति) भाव में चन्द्र गोचर',
    chandrabal: 'सर्वश्रेष्ठ लाभप्रद (एकादश भाव)',
    tarabal: 'परम मित्र तारा (सर्वार्थ सिद्धि)',
    gocharSummary:
      'आज चन्द्रमा आपकी राशि से एकादश लाभ भाव में गोचर कर रहे हैं। आय के नए स्रोत खुलेंगे, रुका हुआ धन वापस मिलने का योग है तथा दीर्घकालीन मनोकामना पूर्ण होगी।',
  },
  {
    bhavaName: 'द्वादश (व्यय, यात्रा व मोक्ष) भाव में चन्द्र गोचर',
    chandrabal: 'धार्मिक व्यय व संयम कारक (द्वादश भाव)',
    tarabal: 'क्षेम तारा (दान-पुण्य से शुभता)',
    gocharSummary:
      'आज चन्द्रमा आपकी राशि से द्वादश भाव में संचरण कर रहे हैं। मांगलिक या शुभ कार्यों में धन व्यय हो सकता है; बाहरी संपर्क एवं विदेश/दूरस्थ कार्यों से लाभ के संकेत हैं।',
  },
];

const CAREER_FORECASTS = [
  'दैनिक कर्म भाव सक्रिय रहने से आज आपके नेतृत्व और त्वरित निर्णय क्षमता की विशेष प्रशंसा होगी। अटके हुए शासकीय या व्यापारिक अनुबंध आज गति पकड़ेंगे।',
  'आज व्यापार में नए ग्राहकों और अनुभवी सहयोगियों के जुड़ने से दैनिक कारोबार में तेजी आएगी। नौकरीपेशा जातकों को कार्यस्थल पर उच्चाधिकारियों का पूर्ण सहयोग मिलेगा।',
  'आज परिश्रम का त्वरित प्रतिफल प्राप्त होगा। भूमि, निर्माण, तकनीकी या परामर्श से जुड़े दैनिक कार्यों में विशेष सफलता मिलने के प्रबल ज्योतिषीय संकेत हैं।',
  'नवीन कार्य योजना या व्यापारिक समझौते के लिए आज का गोचर अत्यंत उत्साहवर्धक है। सहकर्मियों के साथ समन्वय बनाकर चलने से दैनिक लक्ष्य समय पूर्व पूर्ण होंगे।',
  'कारोबार में दैनिक कैश-फ्लो में सुधार आएगा और पुरानी देनदारियों का समाधान निकलेगा। कार्यस्थल पर आपकी कार्यशैली से विरोधी भी प्रभावित रहेंगे।',
];

const WEEKLY_CAREER_FORECASTS = [
  'साप्ताहिक कार्यक्षेत्र गोचर: इस पूरे सप्ताह सूर्य एवं बुध के अनुकूल प्रभाव से पदोन्नति, नई परियोजना के नेतृत्व और व्यापारिक अनुबंधों के विस्तार के प्रबल योग हैं। सप्ताह के मध्य में लिए गए कूटनीतिक निर्णय अत्यधिक लाभकारी सिद्ध होंगे।',
  'साप्ताहिक व्यावसायिक प्रगति: इस सप्ताह व्यापारिक रणनीतियों में किया गया परिवर्तन मील का पत्थर सिद्ध होगा। कार्यस्थल पर सहकर्मियों के साथ टीम-वर्क सुदृढ़ रहेगा और सप्ताह के उत्तरार्ध में कोई बड़ा व्यावसायिक आर्डर या प्रशंसा पत्र प्राप्त हो सकता है।',
  'साप्ताहिक आजीविका योग: यह सप्ताह आपकी पेशेवर साख को नई ऊंचाई प्रदान करेगा। यदि आप नौकरी में बदलाव या विभागीय स्थानांतरण की प्रतीक्षा में हैं, तो इस सप्ताह के प्रथम तीन दिनों में अनुकूल प्रस्ताव प्राप्त हो सकता है।',
  'साप्ताहिक कर्मबल विश्लेषण: सप्ताह के आरंभ से ही कार्यभार अधिक रहेगा किंतु पराक्रमेश के सहयोग से आप प्रत्येक चुनौती को अवसर में बदल देंगे। सरकारी कार्यों व निविदाओं (Tenders) में सफलता के संकेत हैं।',
];

const MONTHLY_CAREER_FORECASTS = [
  'मासिक पाराशरी गोचर फल: इस मास देवगुरु बृहस्पति एवं शनि देव के संयुक्त प्रभाव से करियर में दीर्घकालीन स्थायित्व और प्रतिष्ठा की वृद्धि होगी। मास के पूर्वार्ध में नए उद्यम या विस्तार की ठोस योजनाएं धरातल पर उतरेंगी।',
  'मासिक आजीविका महा-योग: पूरे महीने दशम कर्म भाव पर शुभ ग्रहों की दृष्टि से आपकी योग्यता को उच्च स्तरीय मान्यता मिलेगी। स्वतंत्र व्यापार करने वालों के लिए यह मास नए बाज़ारों में पैठ बनाने और ब्रांड वैल्यू बढ़ाने का है।',
  'मासिक व्यावसायिक विस्तार: मास के तृतीय सप्ताह में आजीविका के क्षेत्र में बड़ा सकारात्मक परिवर्तन संभव है। बहुराष्ट्रीय कंपनियों, सरकारी विभागों या विदेशी संपर्कों से जुड़े जातकों के लिए यह मास अप्रत्याशित सफलता का रहेगा।',
  'मासिक पद-प्रतिष्ठा विचार: इस पूरे माह कार्यक्षेत्र में आपके सुझावों को सर्वोच्च प्राथमिकता मिलेगी। प्रशासनिक एवं प्रबंधकीय पदों पर कार्यरत जातकों के मान-सम्मान व अधिकारों में विस्तार होगा।',
];

const WEALTH_FORECASTS = [
  'धनेश एवं लाभेश की शुभ स्थिति से आज का आर्थिक पक्ष सुदृढ़ रहेगा। दैनिक लेन-देन में रुका हुआ धन वापस मिलने के योग हैं तथा बचत योजनाएं सफल होंगी।',
  'दैनिक व्यापारिक लेन-देन में अपेक्षित मुनाफा प्राप्त होगा। किसी पुराने मित्र या सहयोगी के माध्यम से आज आकस्मिक धन-लाभ के योग बन रहे हैं।',
  'आज सात्त्विक एवं योजनाबद्ध दैनिक निवेश भविष्य में उत्तम प्रतिफल देगा। धार्मिक या परोपकारी कार्यों में किया गया व्यय आत्मिक शांति व पुण्य बढ़ाएगा।',
  'आज आय के नए दैनिक स्रोत खुल सकते हैं। अनावश्यक दिखावे के छोटे-मोटे खर्चों पर नियंत्रण रखने से आज का आर्थिक संतुलन बहुत मजबूत रहेगा।',
];

const WEEKLY_WEALTH_FORECASTS = [
  'साप्ताहिक वित्तीय दृष्टिकोण: इस सप्ताह धन भाव एवं लाभ भाव पर शुभ ग्रहों की युति से संचित कोष में निरंतर वृद्धि होगी। शेयर बाज़ार या कमोडिटी में सोच-समझकर किया गया साप्ताहिक निवेश लाभप्रद रहेगा।',
  'साप्ताहिक आर्थिक संतुलन: इस सप्ताह पूर्व में दिए गए उधार की वसूली संभव है। पारिवारिक परिसंपत्तियों या पैतृक भूमि-भवन से जुड़े आर्थिक मामलों में इस सप्ताह के अंत तक सकारात्मक सहमति बन जाएगी।',
  'साप्ताहिक आय व व्यय: सप्ताह के आरंभ में कुछ आवश्यक पारिवारिक व्यय हो सकते हैं, किंतु सप्ताह के मध्य तक नए व्यावसायिक स्रोतों से धन का आगमन आर्थिक संतुलन को दृढ़ कर देगा।',
  'साप्ताहिक निवेश मार्गदर्शन: इस सप्ताह स्वर्ण, वाहन अथवा दीर्घकालीन बांड्स में निवेश की योजना बनाना श्रेयस्कर रहेगा। शनिवार को आर्थिक लेन-देन में विशेष सजगता रखें।',
];

const MONTHLY_WEALTH_FORECASTS = [
  'मासिक धन-संपत्ति विश्लेषण: इस पूरे मास धनेश व लाभेश की केंद्र-त्रिकोण स्थिति से आर्थिक स्थिति अभूतपूर्व रूप से सुदृढ़ रहेगी। स्थाई संपत्ति (Real Estate) के क्रय-विक्रय हेतु यह मास अत्यंत मंगलकारी है।',
  'मासिक वित्तीय समृद्धि: इस महीने आपकी संचित पूंजी में उल्लेखनीय वृद्धि होगी। दीर्घकालीन ऋणों (Loans) के भुगतान में सफलता मिलेगी तथा बैंक बैलेंस में निरंतर उछाल बना रहेगा।',
  'मासिक लक्ष्मी योग: इस मास व्यावसायिक लाभ के समानांतर स्रोत विकसित होंगे। विदेशों अथवा अन्य राज्यों से जुड़े व्यापारिक अनुबंधों से मास के उत्तरार्ध में प्रचुर धन-लाभ का योग निर्मित हो रहा है।',
  'मासिक संपत्ति एवं निवेश: इस पूरे मास वाहन सुख, गृह निर्माण अथवा स्वर्ण आभूषणों की खरीदारी के सुंदर योग हैं। आय के नवीन अवसरों को भुनाने के लिए आर्थिक योजनाएं सुचारू रहेंगी।',
];

const LOVE_FAMILY_FORECASTS = [
  'आज पारिवारिक वातावरण में आपसी प्रेम, आदर और सौहार्द बना रहेगा। जीवनसाथी के साथ महत्वपूर्ण घरेलू विषयों पर आज सकारात्मक सहमति बनेगी।',
  'घर में आज किसी धार्मिक चर्चा, पूजा-पाठ या शुभ समाचार के आगमन से प्रसन्नता का संचार होगा। माता-पिता का आशीर्वाद आत्मबल को सुदृढ़ करेगा।',
  'आज प्रेम संबंधों एवं दांपत्य जीवन में विश्वास और मधुरता प्रगाढ़ होगी। परिवार के छोटे सदस्यों या संतान की किसी छोटी उपलब्धि से मन हर्षित रहेगा।',
  'कुटुम्ब में यदि कोई पुराना मतभेद चल रहा था तो आज शांत संवाद से उसका सुखद समाधान निकल आएगा। ससुराल पक्ष से भी सद्भाव प्राप्त होगा।',
];

const WEEKLY_FAMILY_FORECASTS = [
  'साप्ताहिक पारिवारिक सौहार्द: इस सप्ताह परिवार के सदस्यों के साथ किसी धार्मिक स्थल के भ्रमण या मांगलिक उत्सव की योजना बनेगी। जीवनसाथी के साथ सामंजस्य चरम पर रहेगा।',
  'साप्ताहिक दांपत्य व कुटुम्ब योग: सप्ताह के आरंभ में घरेलू दायित्व बढ़ सकते हैं किंतु सप्ताहांत तक घर में सुख, शांति और उल्लास का माहौल बन जाएगा। बुजुर्गों का विशेष स्नेह प्राप्त होगा।',
  'साप्ताहिक संबंध समन्वय: इस सप्ताह प्रेम संबंधों में परिपक्वता आएगी और विवाह चर्चा आगे बढ़ सकती है। दांपत्य जीवन में आपसी विश्वास और सहयोग से कठिन पारिवारिक निर्णय सुगम होंगे।',
  'साप्ताहिक गृहस्थ सुख: इस सप्ताह घर-परिवार में मांगलिक ऊर्जा का संचार रहेगा। संतान की ओर से कोई सुखद समाचार पूरे सप्ताह घर के वातावरण को प्रफुल्लित रखेगा।',
];

const MONTHLY_FAMILY_FORECASTS = [
  'मासिक कुटुम्ब एवं दांपत्य विचार: इस पूरे मास गुरु की शुभ दृष्टि से परिवार में मांगलिक उत्सव, विवाह अथवा गृह प्रवेश के आयोजन सुनिश्चित होंगे। पारिवारिक प्रतिष्ठा में चौतरफा वृद्धि होगी।',
  'मासिक गृहस्थ जीवन महा-विश्लेषण: इस मास दांपत्य जीवन में अत्यंत मधुर एवं आत्मीय संबंध बने रहेंगे। जीवनसाथी के भाग्य से भी आपको सामाजिक व आर्थिक क्षेत्र में विशेष सहयोग प्राप्त होगा।',
  'मासिक पारिवारिक समृद्धि: पूरे महीने कुटुम्ब के सदस्यों में परस्पर सहयोग और आदर का भाव रहेगा। कुल-परंपरा और धार्मिक संस्कारों का निर्वहन परिवार को एकता के सूत्र में बांधे रखेगा।',
  'मासिक संतान व बंधु विचार: इस मास संतान पक्ष से किसी बड़ी शैक्षणिक या व्यावसायिक उपलब्धि का गौरव प्राप्त होगा। भाई-बहनों और रिश्तेदारों के साथ संबंध और अधिक घनिष्ठ होंगे।',
];

const EDUCATION_FORECASTS = [
  'पंचम भाव पर शुभ दृष्टि से आज विद्यार्थियों की एकाग्रता और स्मरण शक्ति उत्तम रहेगी। दैनिक अध्ययन और विषयों की पुनरावृत्ति में मन लगेगा।',
  'आज प्रतियोगी परीक्षाओं की तैयारी कर रहे छात्रों को नई दिशा मिलेगी। गुरुजनों के मार्गदर्शन से कठिन अध्यायों को समझने में आसानी होगी।',
  'आज रचनात्मक लेखन, विज्ञान, वाणिज्य और प्रबंधन के विद्यार्थियों को अपनी दैनिक प्रस्तुतियों में विशेष सराहना प्राप्त होगी।',
];

const WEEKLY_EDUCATION_FORECASTS = [
  'साप्ताहिक विद्या एवं ज्ञान योग: इस सप्ताह विद्यार्थियों के लिए समय प्रबंधन उत्तम रहेगा। आगामी परीक्षाओं के लिए तैयार किए गए साप्ताहिक टाइम-टेबल का पूर्ण पालन करने से आत्मविश्वास में अभूतपूर्व वृद्धि होगी।',
  'साप्ताहिक उच्च शिक्षा व शोध: शोधार्थियों एवं तकनीकी विषयों के छात्रों के लिए यह सप्ताह महत्वपूर्ण प्रगति का है। प्रोजेक्ट्स को समय पर जमा करने में सफलता मिलेगी।',
  'साप्ताहिक बौद्धिक विकास: इस सप्ताह एकाग्रता में स्थिरता रहेगी। प्रतियोगी परीक्षाओं (UPSC, Banking, SSC, State PSC) के अभ्यास प्रश्न-पत्रों में अपेक्षित सुधार दिखाई देगा।',
];

const MONTHLY_EDUCATION_FORECASTS = [
  'मासिक विद्या एवं करियर निर्माण: इस पूरे माह पंचमेश एवं बुध-गुरु की कृपा से विद्यार्थियों के लिए उच्च शिक्षण संस्थानों में प्रवेश और छात्रवृत्ति के मार्ग प्रशस्त होंगे।',
  'मासिक बौद्धिक एवं प्रतियोगी सफलता: इस मास प्रतियोगी परीक्षाओं के परिणाम आपके अनुकूल आ सकते हैं। प्रतियोगी परीक्षा की तैयारी कर रहे छात्रों का मनोबल मास भर शीर्ष पर रहेगा।',
  'मासिक ज्ञान साधना: इस मास कला, साहित्य, विधि (Law), चिकित्सा एवं इंजीनियरिंग के छात्रों के लिए विशेष शैक्षणिक उपलब्धियों और सम्मान का योग है।',
];

const HEALTH_FORECASTS = [
  'आज शारीरिक ऊर्जा और मानसिक स्फूर्ति उत्तम बनी रहेगी। प्रातःकाल सूर्य नमस्कार और सात्त्विक आहार से दिन भर ताजगी का अनुभव होगा।',
  'आज स्वास्थ्य सामान्यतः अनुकूल रहेगा, किंतु मौसम के बदलाव को देखते हुए पर्याप्त जल ग्रहण करें और रात्रि में समय पर विश्राम लें।',
  'आज मानसिक शांति के लिए 10 मिनट ध्यान एवं गायत्री मंत्र का जप अवश्य करें। हल्का व्यायाम और संतुलित खान-पान आपको ऊर्जावान रखेगा।',
];

const WEEKLY_HEALTH_FORECASTS = [
  'साप्ताहिक स्वास्थ्य एवं जीवनशैली: इस सप्ताह नियमित योग और प्राणायाम को अपनी दिनचर्या का अंग बनाएं। सप्ताह के मध्य में अधिक भागदौड़ से बचें ताकि मांसपेशियों में खिंचाव न हो।',
  'साप्ताहिक ऊर्जा व आरोग्य: इस सप्ताह रोग प्रतिरोधक क्षमता सुदृढ़ रहेगी। यदि पुरानी वात या पित्त की समस्या थी, तो इस सप्ताह आयुर्वेदिक दिनचर्या से उल्लेखनीय राहत मिलेगी।',
  'साप्ताहिक मानसिक संतुलन: इस सप्ताह काम के दबाव को स्वयं पर हावी न होने दें। ध्यान और समय पर पर्याप्त निद्रा लेने से पूरा सप्ताह स्फूर्तिदायक व्यतीत होगा।',
];

const MONTHLY_HEALTH_FORECASTS = [
  'मासिक स्वास्थ्य एवं दीर्घायु विचार: इस पूरे माह लग्नेश की अनुकूल स्थिति से स्वास्थ्य में निरंतर सुधार बना रहेगा। खान-पान में सात्त्विकता और नियमित दिनचर्या आरोग्य की कुंजी बनेगी।',
  'मासिक आरोग्य महा-विश्लेषण: इस मास मौसमी बीमारियों से बचाव हेतु गिलोय, तुलसी और गुनगुने जल का सेवन लाभकारी रहेगा। नेत्र अथवा उदर संबंधी पुरानी समस्याओं का स्थाई समाधान मिलेगा।',
  'मासिक आध्यात्मिक स्वास्थ्य: पूरे महीने नित्य सूर्य उपासना और संध्या वंदन से मानसिक तनाव पूर्णतः तिरोहित रहेगा और आत्मिक ओजस्विता में वृद्धि होगी।',
];

const TODAY_DOS_LIST = [
  'प्रातः स्नान के पश्चात अपने मस्तक पर केसर या चंदन का तिलक लगाकर ही आज के कार्यों का श्रीगणेश करें।',
  'घर से निकलते समय माता-पिता एवं इष्टदेव को प्रणाम करें तथा थोड़ा गुड़ व जल ग्रहण करें।',
  'महत्वपूर्ण दस्तावेजों या व्यापारिक निर्णयों को आज के शुभ चौघड़िया मुहूर्त में ही संपन्न करें।',
  'गौमाता को हरा चारा या पहली रोटी गुड़ के साथ अर्पित करें, इससे नवग्रह दोष शांत होंगे।',
];

const TODAY_DONTS_LIST = [
  'राहुकाल के समय किसी भी नई यात्रा, बड़े निवेश या विवादित चर्चा की शुरुआत करने से बचें।',
  'आज क्रोध, अहंकार या कटु वाणी का प्रयोग न करें; वाणी का संयम ही आज आपकी सबसे बड़ी शक्ति है।',
  'बिना पूर्ण जांच-पड़ताल के किसी अपरिचित व्यक्ति को आज उधार देने या जमानत लेने से परहेज करें।',
  'संध्याकाल (गोधूलि बेला) में शयन या नकारात्मक चर्चा न करें, उस समय घर में घी का दीपक प्रज्वलित करें।',
];

const WEEKLY_DOS_LIST = [
  'इस सप्ताह के आरंभ में पूरे सप्ताह की कार्य-योजना और बजट की स्पष्ट रूपरेखा तैयार कर लें।',
  'बुधवार अथवा गुरुवार को अपने इष्टदेव के मंदिर जाकर पीले पुष्प और फल अर्पित करें।',
  'सप्ताह के मध्य में किसी धार्मिक या सामाजिक सेवा कार्य में श्रमदान अथवा अन्नदान अवश्य करें।',
  'पारिवारिक सदस्यों के साथ बैठकर सप्ताह में कम से कम एक बार सामूहिक सुंदरकांड या हनुमान चालीसा का पाठ करें।',
];

const WEEKLY_DONTS_LIST = [
  'इस सप्ताह सट्टा, लाटरी अथवा जोखिम भरे अल्पकालिक सट्टा बाज़ार में बड़ा धन लगाने से बचें।',
  'सप्ताहांत में किसी के बहकावे में आकर अपनी पारिवारिक या व्यावसायिक गोपनीय बातें साझा न करें।',
  'मंगलवार और शनिवार के दिन तामसिक भोजन, मदिरा एवं व्यसन से पूर्ण परहेज़ रखें।',
  'महत्वपूर्ण कार्य-योजनाओं को बीच में अधूरा छोड़कर नए कार्यों में हाथ न डालें।',
];

const MONTHLY_DOS_LIST = [
  'इस मास शुक्ल पक्ष की एकादशी या पूर्णिमा को भगवान श्री सत्यनारायण जी की कथा अथवा रुद्राभिषेक संपन्न कराएं।',
  'मास की कुल आय का कम से कम दशांश (10%) अथवा यथाशक्ति अंश धर्मार्थ एवं गौसेवा में समर्पित करें।',
  'महीने में एक बार अपने कुलदेवता / कुलदेवी के निमित्त शुद्ध घी का दीपक प्रज्वलित कर भोग लगाएं।',
  'दीर्घकालीन लक्ष्यों के लिए एक नया बचत खाता अथवा सुरक्षित निवेश योजना प्रारंभ करें।',
];

const MONTHLY_DONTS_LIST = [
  'इस पूरे माह में किसी भी कानूनी या संपत्ति विवाद में बिना अनुभवी विधि विशेषज्ञ की राय के हस्ताक्षर न करें।',
  'मासिक अमावस और ग्रहण काल में किसी भी प्रकार का नया गृह आरंभ या भूमि पूजन न करें।',
  'कार्यक्षेत्र में किसी अधीनस्थ कर्मचारी अथवा निर्धन व्यक्ति का तिरस्कार या पारिश्रमिक रोकने का पाप न करें।',
  'घर में टूटे-फूटे बर्तन, बंद घड़ियां या अनावश्यक कबाड़ एकत्र न होने दें।',
];

const DAILY_REMEDIES = [
  'प्रातः तांबे के लोटे में जल, लाल चंदन व अक्षत मिलाकर भगवान सूर्यनारायण को अर्घ्य दें तथा राशि स्वामी के बीज मंत्र का 27 बार जप करें।',
  'पूजा घर में शुद्ध गाय के घी का दीपक जलाकर श्री हनुमान चालीसा या विष्णु सहस्रनाम का श्रद्धापूर्वक पाठ करें और पक्षियों को सप्तधान्य डालें।',
  'भगवान शिवजी का गंगाजल व कच्चे दूध से अभिषेक करें, बिल्वपत्र अर्पित करें तथा "ॐ नमः शिवाय" की एक माला जप करें।',
  'श्री गणेश जी को दूर्वा एवं मोदक अर्पित करें और किसी जरूरतमंद को अन्न या पीले फल का दान करें, समस्त विघ्न स्वतः शांत होंगे।',
];

const WEEKLY_REMEDIES = [
  'सप्ताहिक विशेष अनुष्ठान: प्रत्येक मंगलवार एवं शनिवार को श्री हनुमान जी के मंदिर में चमेली के तेल का सिंदूरी दीपक जलाएं और ३ बार सुंदरकांड/हनुमान चालीसा का पाठ करें।',
  'सप्ताहिक नवग्रह शांति: गुरुवार को चने की दाल व गुड़ गौमाता को खिलाएं तथा ॐ नमो भगवते वासुदेवाय मंत्र की ३ माला जप करें, इससे पूरे सप्ताह शुभ फल प्राप्त होंगे।',
  'सप्ताहिक वास्तु व लक्ष्मी उपाय: शुक्रवार की शाम घर के मुख्य द्वार पर दोनों ओर हल्दी-कुमकुम से स्वस्तिक बनाकर कपूर का दीपक जलाएं, दरिद्रता का नाश होगा।',
  'सप्ताहिक विघ्नहर्ता पूजन: बुधवार को भगवान श्री गणेश को २१ दूर्वा दल अर्पित करें तथा ॐ गं गणपतये नमः का १०८ बार जप करें, सप्ताह के सभी कार्य निर्विघ्न संपन्न होंगे।',
];

const MONTHLY_REMEDIES = [
  'मासिक महा-अनुष्ठान: मास की किसी भी शुभ तिथि (प्रदोष अथवा सोमवार) पर सपरिवार भगवान आशुतोष का पंचामृत से रुद्राभिषेक कराएं और महामृत्युंजय मंत्र की ११ माला जप करवाएं।',
  'मासिक नवग्रह एवं पितृ शांति: प्रत्येक मास की अमावस्या को पितरों के निमित्त कच्चा अन्न, सफेद वस्त्र एवं काले तिल का दान करें तथा पीपल वृक्ष की ७ परिक्रमा करें।',
  'मासिक कनकधारा लक्ष्मी साधना: शुक्ल पक्ष की प्रतिपदा से पूर्णिमा तक नित्य श्री कनकधारा स्तोत्र अथवा श्री सूक्त का पाठ करें, स्थायी धन व ऐश्वर्य की प्राप्ति होगी।',
  'मासिक महा-दान संकल्प: इस मास किसी वेदपाठी ब्राह्मण अथवा निर्धन कन्या के विवाह/शिक्षा हेतु वस्त्र एवं अन्न का गुप्त दान करें, सभी ग्रहों के अनिष्ट दोष शांत होंगे।',
];

const LUCKY_COLORS = [
  'केसरिया एवं स्वर्णिम पीला',
  'शुभ लाल एवं सिंदूरी',
  'हल्का हरा एवं पन्ना',
  'श्वेत, क्रीम एवं रजत',
  'पीताम्बरी पीला एवं नारंगी',
  'आसमानी एवं रॉयल ब्लू',
];

const AVOID_COLORS = [
  'गहरा काला एवं धूसर',
  'गहरा नीला एवं मटमैला',
  'अत्यधिक गहरा भूरा',
  'काला एवं गहरा हरा',
];

const LUCKY_TIMES = [
  'प्रातः 09:15 से 11:05 बजे तक (लाभ-अमृत चौघड़िया)',
  'दोपहर 11:48 से 12:36 बजे तक (अभिजित शुभ मुहूर्त)',
  'प्रातः 08:10 से 09:45 बजे तक (शुभ वेला)',
  'सायं 04:15 से 05:50 बजे तक (गोधूलि अमृत काल)',
];

const FAVORABLE_DIRECTIONS = ['पूर्व दिशा', 'उत्तर-पूर्व (ईशान कोण)', 'उत्तर दिशा', 'पश्चिम दिशा'];

const FAVORITE_RASHI_STORAGE_KEY = 'panditji_favorite_rashi_id';
const DARSHAN_STREAK_STORAGE_KEY = 'panditji_daily_darshan_streak';
const DARSHAN_LAST_DATE_KEY = 'panditji_daily_darshan_last_date';

function getDailyStreakInfo(now: Date = new Date()): { streak: number; blessedToday: boolean } {
  try {
    const todayIso = getISTCalendarParts(now).dateKey;
    const lastDate = localStorage.getItem(DARSHAN_LAST_DATE_KEY);
    const rawStreak = parseInt(localStorage.getItem(DARSHAN_STREAK_STORAGE_KEY) || '1', 10);
    let streak = Number.isFinite(rawStreak) && rawStreak > 0 ? rawStreak : 1;

    if (lastDate !== todayIso) {
      if (lastDate) {
        const prev = new Date(lastDate);
        const curr = new Date(todayIso);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak += 1;
        } else if (diffDays > 1) {
          streak = 1;
        }
      }
      localStorage.setItem(DARSHAN_LAST_DATE_KEY, todayIso);
      localStorage.setItem(DARSHAN_STREAK_STORAGE_KEY, String(streak));
    }

    return { streak, blessedToday: true };
  } catch {
    return { streak: 1, blessedToday: true };
  }
}

interface DailyRashifalWidgetProps {
  onAskPanditInChat: (question: string) => void;
  onOpenMantraJaap: () => void;
  currentUser?: UserMobileAccount | null;
}

export const DailyRashifalWidget: React.FC<DailyRashifalWidgetProps> = ({
  onAskPanditInChat,
  onOpenMantraJaap,
  currentUser,
}) => {
  const { tr, language, localizeVedicText } = useLanguage();
  const [selectedRashiId, setSelectedRashiId] = useState<string>(() => {
    try {
      if (currentUser && currentUser.rashi) {
        const found = TWELVE_RASHIS.find(
          (r) =>
            currentUser.rashi?.includes(r.hindiName) ||
            r.englishName.toLowerCase() === currentUser.rashi?.toLowerCase() ||
            r.id === currentUser.rashi?.toLowerCase()
        );
        if (found) return found.id;
      }
      const activeProf = getActiveProfile();
      if (activeProf && activeProf.rashi) {
        const found = TWELVE_RASHIS.find(
          (r) => activeProf.rashi.includes(r.hindiName) || r.id === activeProf.rashi.toLowerCase()
        );
        if (found) return found.id;
      }
      const saved = localStorage.getItem(FAVORITE_RASHI_STORAGE_KEY);
      if (saved && TWELVE_RASHIS.some((r) => r.id === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'mesh';
  });

  // Automatically update selected rashi when currentUser or active profile changes
  useEffect(() => {
    if (currentUser && currentUser.rashi) {
      const found = TWELVE_RASHIS.find(
        (r) =>
          currentUser.rashi?.includes(r.hindiName) ||
          r.englishName.toLowerCase() === currentUser.rashi?.toLowerCase() ||
          r.id === currentUser.rashi?.toLowerCase()
      );
      if (found) {
        setSelectedRashiId(found.id);
      }
    }
  }, [currentUser?.phone, currentUser?.name, currentUser?.rashi]);

  const [showAllRashis, setShowAllRashis] = useState<boolean>(false);
  const [forecastMode, setForecastMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [calcViewingMode, setCalcViewingMode] = useState<CalculationViewingMode>(getCalculationViewingMode);

  const [savedAsDefault, setSavedAsDefault] = useState<boolean>(true);
  const [bellRinging, setBellRinging] = useState<boolean>(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(() =>
    vedicAudio.getActiveSpeechId()
  );
  const [streakInfo, setStreakInfo] = useState<{ streak: number; blessedToday: boolean }>(() =>
    getDailyStreakInfo(new Date())
  );
  const [istParts, setIstParts] = useState(() => getISTCalendarParts(new Date()));

  useEffect(() => {
    const unsubSpeech = vedicAudio.subscribeSpeech((id) => {
      setActiveSpeechId(id);
    });
    const handleProfileUpdate = () => {
      try {
        const mode = getCalculationViewingMode();
        setCalcViewingMode(mode);
        const name = currentUser?.name || getActiveProfile()?.name || 'यजमान';
        const dob = currentUser?.dob || getActiveProfile()?.dob || '1996-03-10';
        const time = currentUser?.birthTime || getActiveProfile()?.birthTime || '10:00';
        const place = currentUser?.birthPlace || getActiveProfile()?.birthPlace || 'रुद्रपुर';

        let targetRashiName = '';
        if (mode === 'name_rashi') {
          const nameAstro = getVedicDetailsFromName(name);
          targetRashiName = nameAstro.rashi || 'कुंभ (Aquarius)';
        } else {
          // 'astronomical' (DOB based)
          const kundali = generateSampurnKundali(name, dob, time, place);
          targetRashiName = kundali.panchang.moonRashiName || 'तुला (Libra)';
        }

        if (targetRashiName) {
          const found = TWELVE_RASHIS.find(
            (r) => targetRashiName.includes(r.hindiName) || r.id === targetRashiName.toLowerCase()
          );
          if (found) {
            setSelectedRashiId(found.id);
          }
        }
      } catch {
        // ignore
      }
    };

    handleProfileUpdate(); // Run initially
    window.addEventListener('panditji_active_profile_updated', handleProfileUpdate);
    window.addEventListener('display_preference_changed', handleProfileUpdate);
    return () => {
      unsubSpeech();
      window.removeEventListener('panditji_active_profile_updated', handleProfileUpdate);
      window.removeEventListener('display_preference_changed', handleProfileUpdate);
    };
  }, [currentUser?.phone, currentUser?.name, currentUser?.dob, currentUser?.rashi]);

  useEffect(() => {
    let midnightTimer: number | null = null;

    const syncDaily = () => {
      const now = new Date();
      const nextParts = getISTCalendarParts(now);
      setIstParts((prev) => {
        if (prev.dateKey !== nextParts.dateKey) {
          setStreakInfo(getDailyStreakInfo(now));
          return nextParts;
        }
        if (prev.timeString12h !== nextParts.timeString12h) {
          return nextParts;
        }
        return prev;
      });
    };

    const scheduleMidnight = () => {
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      const msUntilMidnight = getMsUntilNextISTMidnight(new Date());
      midnightTimer = window.setTimeout(() => {
        const now = new Date();
        setIstParts(getISTCalendarParts(now));
        setStreakInfo(getDailyStreakInfo(now));
        scheduleMidnight();
      }, msUntilMidnight);
    };

    syncDaily();
    scheduleMidnight();

    const timer = window.setInterval(syncDaily, 30000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncDaily();
      }
    };
    const handleGlobalMidnight = () => syncDaily();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('panditji_midnight_refresh', handleGlobalMidnight);

    return () => {
      window.clearInterval(timer);
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('panditji_midnight_refresh', handleGlobalMidnight);
    };
  }, []);

  const handleSelectRashi = (id: string) => {
    try {
      vedicAudio.playClickSpark(0.2);
    } catch {
      // safe
    }
    setSelectedRashiId(id);
    setSavedAsDefault(true);
    try {
      localStorage.setItem(FAVORITE_RASHI_STORAGE_KEY, id);
      const activeProf = getActiveProfile();
      if (activeProf) {
        const rashiObj = TWELVE_RASHIS.find((r) => r.id === id);
        if (rashiObj) {
          const updated = {
            ...activeProf,
            rashi: rashiObj.hindiName,
            updatedAt: new Date().toISOString(),
          };
          setActiveProfile(updated);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleRingTempleBell = () => {
    setBellRinging(true);
    try {
      vedicAudio.playTempleBell(0.8);
      window.setTimeout(() => {
        vedicAudio.playShankh();
      }, 300);
    } catch {
      // ignore audio errors
    }
    window.setTimeout(() => {
      setBellRinging(false);
    }, 1200);
  };

  const currentRashiIndex = Math.max(
    0,
    TWELVE_RASHIS.findIndex((r) => r.id === selectedRashiId)
  );
  const currentRashi = TWELVE_RASHIS[currentRashiIndex] || TWELVE_RASHIS[0];
  const rashiNumber = currentRashiIndex + 1;

  // Get Today's Astronomical Panchang & Sidereal Planetary Transits (Lahiri Ayanamsa, Rudrapur IST)
  const todayDayPanchang = buildSingleDayPanchang(istParts.year, istParts.month, istParts.day, true);
  const todayFullPanchang = getTodayPanchang(new Date(istParts.year, istParts.month - 1, istParts.day));
  const currentTimeHHMM = `${String(istParts.hours).padStart(2, '0')}:${String(istParts.minutes).padStart(2, '0')}`;
  const gocharEphemeris = generateSampurnKundali(
    'रुद्रपुर दैनिक गोचर',
    istParts.dateKey,
    currentTimeHHMM,
    'रुद्रपुर, उत्तराखण्ड'
  );

  const getPlanetFromEphemeris = (planetId: string) =>
    gocharEphemeris.planets.find((item) => item.id === planetId);

  const getPlanetHouseFromRashi = (planetId: string) => {
    const p = getPlanetFromEphemeris(planetId);
    const pRashi = p?.rashiNumber || 1;
    return ((pRashi - rashiNumber + 12) % 12) + 1;
  };

  const moonBhava = getPlanetHouseFromRashi('moon');
  const sunBhava = getPlanetHouseFromRashi('sun');
  const guruBhava = getPlanetHouseFromRashi('jupiter');
  const shaniBhava = getPlanetHouseFromRashi('saturn');
  const mangalBhava = getPlanetHouseFromRashi('mars');
  const budhBhava = getPlanetHouseFromRashi('mercury');
  const shukraBhava = getPlanetHouseFromRashi('venus');
  const rahuBhava = getPlanetHouseFromRashi('rahu');

  const moonPlanet = getPlanetFromEphemeris('moon');
  const sunPlanet = getPlanetFromEphemeris('sun');
  const guruPlanet = getPlanetFromEphemeris('jupiter');
  const shaniPlanet = getPlanetFromEphemeris('saturn');
  const budhPlanet = getPlanetFromEphemeris('mercury');
  const shukraPlanet = getPlanetFromEphemeris('venus');
  const mangalPlanet = getPlanetFromEphemeris('mars');

  const dateSeed = istParts.year * 1000 + istParts.month * 35 + istParts.day;
  const weekSeed = Math.floor(istParts.day / 7) + istParts.month * 7 + currentRashiIndex * 11;
  const monthSeed = istParts.year * 12 + istParts.month + currentRashiIndex * 13;
  const activeSeed =
    forecastMode === 'daily'
      ? dateSeed + currentRashiIndex * 17 + moonBhava
      : forecastMode === 'weekly'
      ? weekSeed + sunBhava + budhBhava
      : monthSeed + guruBhava + shaniBhava;

  // Compute Authentic Sidereal Moon Transit Bhava (0..11 index) from selected Rashi
  const chandraBhavaIndex = (moonBhava - 1 + 12) % 12;
  const chandraGochar = CHANDRA_BHAVA_DESCRIPTIONS[chandraBhavaIndex] || CHANDRA_BHAVA_DESCRIPTIONS[0];

  const vaarName = VAAR_LIST[istParts.weekdayIndex]?.full || 'सोमवार';
  const monthHindi = HINDI_MONTH_SHORT[istParts.month - 1] || 'अक्टूबर';
  const todayFormatted = `${vaarName}, ${istParts.day} ${monthHindi} ${istParts.year}`;

  const activeUserName = (currentUser?.name || getActiveProfile()?.name || '').trim();
  const userSalutation = activeUserName
    ? `${formatUserSalutation(activeUserName, currentUser?.salutationPreference)}: `
    : '';

  const rawCareer =
    forecastMode === 'daily'
      ? `${CAREER_FORECASTS[activeSeed % CAREER_FORECASTS.length]} (आज का गोचर: चंद्र ${moonBhava}वें भाव [${moonPlanet?.rashiName.split(' ')[0] || ''} ${moonPlanet?.degree || ''}], सूर्य ${sunBhava}वें एवं शनि ${shaniBhava}वें भाव में)`
      : forecastMode === 'weekly'
      ? `${WEEKLY_CAREER_FORECASTS[activeSeed % WEEKLY_CAREER_FORECASTS.length]} (गोचर प्रभाव: सूर्य ${sunBhava}वें [${sunPlanet?.degree || ''}] एवं बुध ${budhBhava}वें भाव में)`
      : `${MONTHLY_CAREER_FORECASTS[activeSeed % MONTHLY_CAREER_FORECASTS.length]} (${monthHindi} माह गोचर: गुरु ${guruBhava}वें [${guruPlanet?.degree || ''}] एवं शनि ${shaniBhava}वें [${shaniPlanet?.degree || ''}] भाव में)`;
  const careerText = userSalutation ? `${userSalutation}${rawCareer}` : rawCareer;

  const rawWealth =
    forecastMode === 'daily'
      ? `${WEALTH_FORECASTS[(activeSeed + 2) % WEALTH_FORECASTS.length]} (धन गोचर: गुरु ${guruBhava}वें एवं शुक्र ${shukraBhava}वें भाव [${shukraPlanet?.degree || ''}] में)`
      : forecastMode === 'weekly'
      ? `${WEEKLY_WEALTH_FORECASTS[(activeSeed + 1) % WEEKLY_WEALTH_FORECASTS.length]} (शुक्र ${shukraBhava}वें एवं मंगल ${mangalBhava}वें भाव में)`
      : `${MONTHLY_WEALTH_FORECASTS[(activeSeed + 1) % MONTHLY_WEALTH_FORECASTS.length]} (धनेश व लाभेश के साथ गुरु ${guruBhava}वें भाव का संबंध)`;
  const wealthText = userSalutation ? `${userSalutation}${rawWealth}` : rawWealth;

  const rawFamily =
    forecastMode === 'daily'
      ? `${LOVE_FAMILY_FORECASTS[(activeSeed + 3) % LOVE_FAMILY_FORECASTS.length]} (चंद्र ${moonBhava}वें व शुक्र ${shukraBhava}वें भाव में संचरण)`
      : forecastMode === 'weekly'
      ? `${WEEKLY_FAMILY_FORECASTS[(activeSeed + 2) % WEEKLY_FAMILY_FORECASTS.length]} (सप्तम भाव व चतुर्थेश का शुभ प्रभाव)`
      : `${MONTHLY_FAMILY_FORECASTS[(activeSeed + 2) % MONTHLY_FAMILY_FORECASTS.length]} (पारिवारिक भावों में शुभ ग्रहों का संचरण)`;
  const familyText = userSalutation ? `${userSalutation}${rawFamily}` : rawFamily;

  const rawEducation =
    forecastMode === 'daily'
      ? `${EDUCATION_FORECASTS[(activeSeed + 4) % EDUCATION_FORECASTS.length]} (बुध ${budhBhava}वें [${budhPlanet?.degree || ''}] एवं गुरु ${guruBhava}वें भाव में)`
      : forecastMode === 'weekly'
      ? WEEKLY_EDUCATION_FORECASTS[(activeSeed + 3) % WEEKLY_EDUCATION_FORECASTS.length]
      : MONTHLY_EDUCATION_FORECASTS[(activeSeed + 3) % MONTHLY_EDUCATION_FORECASTS.length];
  const educationText = userSalutation ? `${userSalutation}${rawEducation}` : rawEducation;

  const rawHealth =
    forecastMode === 'daily'
      ? `${HEALTH_FORECASTS[(activeSeed + 1) % HEALTH_FORECASTS.length]} (लग्न/राशि से मंगल ${mangalBhava}वें [${mangalPlanet?.degree || ''}] एवं चंद्र ${moonBhava}वें भाव में)`
      : forecastMode === 'weekly'
      ? WEEKLY_HEALTH_FORECASTS[(activeSeed + 2) % WEEKLY_HEALTH_FORECASTS.length]
      : MONTHLY_HEALTH_FORECASTS[(activeSeed + 2) % MONTHLY_HEALTH_FORECASTS.length];
  const healthText = userSalutation ? `${userSalutation}${rawHealth}` : rawHealth;

  const rawRemedy =
    forecastMode === 'daily'
      ? DAILY_REMEDIES[(activeSeed + 5) % DAILY_REMEDIES.length]
      : forecastMode === 'weekly'
      ? WEEKLY_REMEDIES[(activeSeed + 4) % WEEKLY_REMEDIES.length]
      : MONTHLY_REMEDIES[(activeSeed + 4) % MONTHLY_REMEDIES.length];
  const remedyText = userSalutation ? `${userSalutation}${rawRemedy}` : rawRemedy;

  const doToday1 =
    forecastMode === 'daily'
      ? TODAY_DOS_LIST[activeSeed % TODAY_DOS_LIST.length]
      : forecastMode === 'weekly'
      ? WEEKLY_DOS_LIST[activeSeed % WEEKLY_DOS_LIST.length]
      : MONTHLY_DOS_LIST[activeSeed % MONTHLY_DOS_LIST.length];

  const doToday2 =
    forecastMode === 'daily'
      ? TODAY_DOS_LIST[(activeSeed + 1) % TODAY_DOS_LIST.length]
      : forecastMode === 'weekly'
      ? WEEKLY_DOS_LIST[(activeSeed + 1) % WEEKLY_DOS_LIST.length]
      : MONTHLY_DOS_LIST[(activeSeed + 1) % MONTHLY_DOS_LIST.length];

  const dontToday1 =
    forecastMode === 'daily'
      ? TODAY_DONTS_LIST[activeSeed % TODAY_DONTS_LIST.length]
      : forecastMode === 'weekly'
      ? WEEKLY_DONTS_LIST[activeSeed % WEEKLY_DONTS_LIST.length]
      : MONTHLY_DONTS_LIST[activeSeed % MONTHLY_DONTS_LIST.length];

  const dontToday2 =
    forecastMode === 'daily'
      ? TODAY_DONTS_LIST[(activeSeed + 2) % TODAY_DONTS_LIST.length]
      : forecastMode === 'weekly'
      ? WEEKLY_DONTS_LIST[(activeSeed + 2) % WEEKLY_DONTS_LIST.length]
      : MONTHLY_DONTS_LIST[(activeSeed + 2) % MONTHLY_DONTS_LIST.length];

  const luckyColor = LUCKY_COLORS[activeSeed % LUCKY_COLORS.length];
  const avoidColor = AVOID_COLORS[activeSeed % AVOID_COLORS.length];

  // Dynamically derive Lucky Time from today's actual calculated Shubh/Labh/Amrit Choghadiya & Abhijit Muhurat
  const auspiciousChoghadiyas = todayDayPanchang.dayChoghadiya.filter((c) =>
    ['अमृत', 'शुभ', 'लाभ'].includes(c.name)
  );
  const selectedChoghadiya =
    auspiciousChoghadiyas[currentRashiIndex % Math.max(1, auspiciousChoghadiyas.length)] ||
    todayDayPanchang.dayChoghadiya[0];
  const luckyTime = selectedChoghadiya
    ? `${selectedChoghadiya.time} (${selectedChoghadiya.name} चौघड़िया) • अभिजित: ${todayDayPanchang.abhijitMuhurat}`
    : `${todayDayPanchang.abhijitMuhurat} (अभिजित शुभ मुहूर्त)`;

  const luckyDirection = FAVORABLE_DIRECTIONS[activeSeed % FAVORABLE_DIRECTIONS.length];
  const luckyNumber = (( moonBhava + guruBhava + currentRashiIndex) % 9) + 1;
  const allyNumber = ((luckyNumber + shukraBhava) % 9) + 1;

  // Authentic Parashari Gochar Scoring (benefic house transits from Moon Rashi)
  const isMoonBenefic = [1, 3, 6, 7, 10, 11].includes(moonBhava);
  const isGuruBenefic = [2, 5, 7, 9, 11].includes(guruBhava);
  const isShaniBenefic = [3, 6, 11].includes(shaniBhava);
  const isSunBenefic = [3, 6, 10, 11].includes(sunBhava);
  const isBudhBenefic = [2, 4, 6, 8, 10, 11].includes(budhBhava);
  const isShukraBenefic = [1, 2, 3, 4, 5, 8, 9, 11, 12].includes(shukraBhava);
  const isMangalBenefic = [3, 6, 11].includes(mangalBhava);

  const careerScore = Math.min(
    98,
    78 + (isSunBenefic ? 6 : 2) + (isShaniBenefic ? 5 : 2) + (isGuruBenefic ? 5 : 2) + (isMoonBenefic ? 4 : 1)
  );
  const wealthScore = Math.min(
    98,
    77 + (isGuruBenefic ? 7 : 3) + (isShukraBenefic ? 6 : 2) + (isBudhBenefic ? 4 : 2) + (isMoonBenefic ? 4 : 1)
  );
  const familyScore = Math.min(
    98,
    79 + (isShukraBenefic ? 7 : 3) + (isMoonBenefic ? 6 : 2) + (isGuruBenefic ? 5 : 2)
  );
  const educationScore = Math.min(
    98,
    78 + (isBudhBenefic ? 7 : 3) + (isGuruBenefic ? 7 : 3) + (isMoonBenefic ? 5 : 2)
  );
  const healthScore = Math.min(
    98,
    78 + (isSunBenefic ? 6 : 2) + (isMangalBenefic ? 6 : 2) + (isMoonBenefic ? 6 : 3)
  );

  const todayShloka = DAILY_SHLOKAS[dateSeed % DAILY_SHLOKAS.length];
  const modeTitleLabel =
    forecastMode === 'daily'
      ? tr('आज का दैनिक राशिफल', "Today's Daily Horoscope")
      : forecastMode === 'weekly'
      ? tr('इस सप्ताह का साप्ताहिक राशिफल', "This Week's Horoscope")
      : tr(`${monthHindi} ${istParts.year} का मासिक राशिफल`, `Monthly Horoscope (${istParts.year})`);

  const displayRashiName =
    language === 'en' || language === 'hinglish'
      ? `${currentRashi.englishName} (${currentRashi.hindiName})`
      : `${currentRashi.hindiName} राशि`;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Daily Morning Darshan, Temple Bell & Gita Subhashit Strip */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a0f07] via-[#131b2e] to-[#1a0f07] border border-amber-500/50 p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleRingTempleBell}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 p-[2px] shadow-[0_0_20px_rgba(251,191,36,0.4)] flex-shrink-0 cursor-pointer transition-transform ${
                bellRinging ? 'scale-110 ring-4 ring-yellow-300/60' : 'hover:scale-105'
              }`}
              title={tr('मंदिर की घंटी एवं शंख ध्वनि बजाएं', 'Ring Temple Bell & Shankh')}
            >
              <div className="w-full h-full rounded-[14px] bg-[#1c0f06] flex flex-col items-center justify-center">
                <Bell
                  className={`w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 ${
                    bellRinging ? 'animate-bounce' : ''
                  }`}
                />
                <span className="text-[9px] font-bold text-amber-200 mt-0.5">
                  {tr('घंटी बजाएं', 'Ring Bell')}
                </span>
              </div>
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 text-[10px] sm:text-[11px] font-bold">
                  <Sun className="w-3 h-3 text-yellow-400" />
                  <span>{tr('आज का वैदिक सुविचार एवं दैनिक दर्शन', "Today's Sacred Vedic Subhashit & Darshan")}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] sm:text-[11px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{tr(`दैनिक साधना दिवस: #${streakInfo.streak}`, `Daily Sadhana Streak: #${streakInfo.streak}`)}</span>
                </span>
              </div>

              <p className="text-sm sm:text-base font-bold font-vedic text-yellow-300 mt-1.5 leading-snug">
                “{todayShloka.sanskrit}”{' '}
                <span className="text-[11px] font-sans font-semibold text-amber-400/90">
                  — {todayShloka.source}
                </span>
              </p>
              <p className="text-xs text-amber-100/90 mt-0.5 leading-relaxed">
                <strong className="text-amber-300">{tr('भावार्थ:', 'Meaning:')}</strong> {todayShloka.meaning}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end flex-shrink-0 border-t lg:border-t-0 border-amber-900/30 pt-2.5 lg:pt-0">
            <button
              type="button"
              onClick={() => {
                vedicAudio.playTempleBell(0.55);
                vedicAudio.toggleSpeakText(
                  `आज का वैदिक सुविचार। ${todayShloka.sanskrit}। भावार्थ: ${todayShloka.meaning}`,
                  'daily-shloka-speech'
                );
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                activeSpeechId === 'daily-shloka-speech'
                  ? 'bg-emerald-600 text-slate-950 border-emerald-300 shadow-lg'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/50 text-amber-200'
              }`}
            >
              {activeSpeechId === 'daily-shloka-speech' ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>{tr('श्लोक रोकें', 'Stop Shloka')}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{tr('श्लोक सुनें', 'Listen Shloka')}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRingTempleBell}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Bell className="w-3.5 h-3.5 text-yellow-400" />
              <span>{tr('शंख व घंटी ध्वनि', 'Shankh & Bell')}</span>
            </button>

            <button
              type="button"
              onClick={onOpenMantraJaap}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Flame className="w-3.5 h-3.5 text-slate-950" />
              <span>{tr('दैनिक 108 जप करें', 'Daily 108 Jaap')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive 12-Rashi Complete Vedic Jyotish Daily, Weekly & Monthly Horoscope Hub */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#141c2f] via-[#0e1525] to-[#1a1008] border-2 border-amber-500/50 p-4 sm:p-6 shadow-2xl">
        {/* Header with Daily / Weekly / Monthly Period Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-amber-800/40 pb-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Star className="w-4 h-4 fill-amber-400" />
              </span>
              <h3 className="text-lg sm:text-2xl font-extrabold font-vedic text-amber-100">
                {(() => {
                  const displayName = currentUser?.name || getActiveProfile()?.name;
                  if (language === 'en' || language === 'hinglish') {
                    return displayName
                      ? `${displayName}'s ${displayRashiName} — ${modeTitleLabel}`
                      : `${displayRashiName} — ${modeTitleLabel}`;
                  }
                  return displayName
                    ? `${displayName} जी की ${currentRashi.hindiName} राशि का ${modeTitleLabel}`
                    : `${currentRashi.hindiName} राशि — ${modeTitleLabel}`;
                })()}
              </h3>
            </div>
            <p className="text-xs text-amber-300/85 mt-1">
              {localizeVedicText(
                `${todayFormatted} • ${todayDayPanchang.hinduMaas}, ${todayDayPanchang.paksha} ${todayDayPanchang.tithiName} • ${tr('नक्षत्र:', 'Nakshatra:')} ${todayDayPanchang.nakshatra} • ${tr('लाहिड़ी अयनांश:', 'Lahiri Ayanamsa:')} ${gocharEphemeris.input.ayanamsaDMS}`
              )}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center bg-slate-950/95 p-1 rounded-xl border border-amber-500/50 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setCalculationViewingMode('astronomical');
                    setCalcViewingMode('astronomical');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    calcViewingMode === 'astronomical'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow'
                      : 'text-amber-200/80 hover:text-yellow-300'
                  }`}
                >
                  <span>{tr('🔭 जन्मांक / कुंडली अनुसार', '🔭 By Birth Chart (DOB)')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalculationViewingMode('name_rashi');
                    setCalcViewingMode('name_rashi');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    calcViewingMode === 'name_rashi'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow'
                      : 'text-amber-200/80 hover:text-yellow-300'
                  }`}
                >
                  <span>{tr('🔤 नाम राशि अनुसार', '🔤 By Name Rashi')}</span>
                </button>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/90 border border-amber-500/50 text-amber-200 text-[11px] font-bold">
                <Compass className="w-3.5 h-3.5 text-yellow-400" />
                <span>
                  {calcViewingMode === 'name_rashi'
                    ? tr(
                        `नाम अक्षर '${(currentUser?.name || getActiveProfile()?.name || 'यजमान').charAt(0)}' आधारित नाम राशि गोचर (${currentRashi.hindiName})`,
                        `Name Rashi Transit based on '${(currentUser?.name || getActiveProfile()?.name || 'Devotee').charAt(0)}' (${currentRashi.englishName})`
                      )
                    : tr(
                        `जन्मांक (DOB विवरण) आधारित शुद्ध चंद्र राशि गोचर (${currentRashi.hindiName})`,
                        `Pure Moon Sign Transit based on Birth Details (${currentRashi.englishName})`
                      )}
                </span>
              </span>
            </div>
          </div>

          {/* Daily / Weekly / Monthly Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center flex-shrink-0">
            <div className="inline-flex items-center bg-slate-950/90 p-1 rounded-2xl border border-amber-500/50 shadow-inner">
              {[
                { id: 'daily', label: tr('☀️ दैनिक राशिफल', '☀️ Daily Horoscope') },
                { id: 'weekly', label: tr('📅 साप्ताहिक राशिफल', '📅 Weekly Horoscope') },
                { id: 'monthly', label: tr('🌙 मासिक राशिफल', '🌙 Monthly Horoscope') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setForecastMode(tab.id as 'daily' | 'weekly' | 'monthly')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    forecastMode === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                      : 'text-amber-200/80 hover:text-yellow-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 12 Rashi Selector Grid (Permanently Visible) */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 mb-4">
          {TWELVE_RASHIS.map((rashi) => {
            const isSelected = rashi.id === selectedRashiId;
            return (
              <button
                key={rashi.id}
                type="button"
                onClick={() => handleSelectRashi(rashi.id)}
                className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-500 text-slate-950 border-yellow-200 font-extrabold shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-[1.03]'
                    : 'bg-slate-900/85 hover:bg-amber-950/60 text-amber-100 border-amber-800/40 hover:border-amber-500/60 font-semibold'
                }`}
              >
                <span className="text-base sm:text-lg leading-none">{rashi.symbol}</span>
                <span className="text-xs sm:text-sm leading-tight">
                  {language === 'en' || language === 'hinglish' ? rashi.englishName : rashi.hindiName}
                </span>
                <span
                  className={`text-[9px] leading-none hidden sm:block ${
                    isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'
                  }`}
                >
                  {language === 'en' || language === 'hinglish'
                    ? rashi.hindiName
                    : rashi.swami.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Rashi Complete Jyotish Details Card */}
        <div className="mt-4 rounded-2xl bg-slate-950/90 border border-amber-500/45 p-4 sm:p-6 space-y-5">
          {/* A. Top Rashi Identity, Kundali Attributes & Gochar Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-500/10 border-2 border-amber-400/60 flex items-center justify-center text-3xl sm:text-4xl text-yellow-300 shadow-inner flex-shrink-0">
                {currentRashi.symbol}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xl sm:text-2xl font-extrabold font-vedic text-amber-100">
                    {displayRashiName} — {modeTitleLabel}
                  </h4>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                    {tr('राशि स्वामी:', 'Sign Lord:')} {localizeVedicText(currentRashi.swami)}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 font-bold">
                    {currentRashi.element} • {currentRashi.nature}
                  </span>
                </div>
                <p className="text-xs text-amber-200/90">
                  <strong className="text-amber-400">{tr('नामाक्षर:', 'Name Letters:')}</strong> {currentRashi.letters} &nbsp;|&nbsp;{' '}
                  <strong className="text-amber-400">{tr('नक्षत्र एवं चरण:', 'Nakshatras:')}</strong> {localizeVedicText(currentRashi.nakshatras)}
                </p>
                <p className="text-xs text-amber-300/85">
                  <strong className="text-yellow-300">{tr('आराध्य देव:', 'Ishta Devta:')}</strong> {currentRashi.aradhyaDev} &nbsp;|&nbsp;{' '}
                  <strong className="text-yellow-300">{tr('शुभ रत्न:', 'Lucky Gem:')}</strong> {currentRashi.ratna} ({currentRashi.dhatu}) &nbsp;|&nbsp;{' '}
                  <strong className="text-yellow-300">{tr('मित्र राशियां:', 'Friendly Signs:')}</strong> {localizeVedicText(currentRashi.mitraRashi)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (activeSpeechId !== 'rashi-full-rashifal') {
                    vedicAudio.playTempleBell(0.55);
                  }
                  vedicAudio.toggleSpeakText(
                    `${currentRashi.hindiName} राशि का ${modeTitleLabel}। राशि स्वामी ${currentRashi.swami} हैं। ${chandraGochar.gocharSummary} व्यापार एवं करियर: ${careerText} आर्थिक लाभ: ${wealthText} पारिवारिक जीवन: ${familyText} अचूक वैदिक उपाय: ${remedyText}`,
                    'rashi-full-rashifal'
                  );
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeSpeechId === 'rashi-full-rashifal'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg font-extrabold'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/50 text-amber-200'
                }`}
              >
                {activeSpeechId === 'rashi-full-rashifal' ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>{tr('राशिफल चल रहा है (रोकें)', 'Playing Horoscope (Stop)')}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{tr('राशिफल सुनें', 'Listen Horoscope')}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() =>
                  onAskPanditInChat(
                    `पण्डित जी, मेरी राशि ${currentRashi.hindiName} (${currentRashi.englishName}) है। ${modeTitleLabel}, ग्रह गोचर (चन्द्र ${moonBhava}वें, गुरु ${guruBhava}वें, शनि ${shaniBhava}वें भाव) और महादशा के अनुसार मेरे करियर, धन, परिवार और भाग्योदय के लिए शास्त्रोक्त मार्गदर्शन व उपाय बताएं।`
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{tr('पण्डित जी से पूछें', 'Ask Pandit Ji')}</span>
              </button>
            </div>
          </div>

          {/* B. Authentic Parashari Graha Gochar, Chandrabal & Tarabal Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/55 via-slate-900/95 to-indigo-950/45 border border-amber-500/40 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-yellow-400" />
                <h5 className="text-xs sm:text-sm font-extrabold text-yellow-300 uppercase tracking-wider">
                  {forecastMode === 'daily'
                    ? tr(`दैनिक चन्द्र गोचर, चन्द्रबल एवं ताराबल (रुद्रपुर IST: ${todayFormatted})`, `Daily Moon Transit, Chandrabal & Tarabal (Rudrapur IST: ${todayFormatted})`)
                    : forecastMode === 'weekly'
                    ? tr(`साप्ताहिक ग्रह गोचर एवं चंद्र-कला विश्लेषण (${monthHindi} ${istParts.year} — सप्ताह ${Math.min(4, Math.floor(istParts.day / 7) + 1)})`, `Weekly Planetary Transit & Moon Phase Analysis (${istParts.year} — Week ${Math.min(4, Math.floor(istParts.day / 7) + 1)})`)
                    : tr(`मासिक महा-गोचर एवं दीर्घकालिक पराशरी प्रभाव (${monthHindi} ${istParts.year})`, `Monthly Grand Transit & Parashari Influence (${istParts.year})`)}
                </h5>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {forecastMode === 'daily' ? (
                  <>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] font-bold">
                      🌙 {tr('चन्द्र', 'Moon')}: {moonBhava}{tr('वां भाव', 'th House')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                      {tr('चन्द्रबल', 'Chandrabal')}: {localizeVedicText(chandraGochar.chandrabal)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-400/40 text-indigo-200 text-[11px] font-bold">
                      {tr('ताराबल', 'Tarabal')}: {localizeVedicText(chandraGochar.tarabal)}
                    </span>
                  </>
                ) : forecastMode === 'weekly' ? (
                  <>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-yellow-300 text-[11px] font-bold">
                      ☀️ {tr('सूर्य', 'Sun')}: {sunBhava}{tr('वां भाव', 'th House')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                      ☿ {tr('बुध', 'Mercury')}: {budhBhava}{tr('वां भाव', 'th House')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/40 text-rose-300 text-[11px] font-bold">
                      ♂ {tr('मंगल', 'Mars')}: {mangalBhava}{tr('वां भाव', 'th House')}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 text-[11px] font-bold">
                      🪐 {tr('गुरु', 'Jupiter')}: {guruBhava}{tr('वां भाव', 'th House')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-400/40 text-indigo-300 text-[11px] font-bold">
                      ⚖️ {tr('शनि', 'Saturn')}: {shaniBhava}{tr('वां भाव', 'th House')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950/90 border border-purple-400/40 text-purple-300 text-[11px] font-bold">
                      🐉 {tr('राहु', 'Rahu')}: {rahuBhava}{tr('वां भाव', 'th House')}
                    </span>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed">
              <strong className="text-amber-300">{tr('शास्त्रोक्त गोचर फल', 'Scriptural Transit Impact')} ({modeTitleLabel}):</strong>{' '}
              {forecastMode === 'daily' ? (
                <>
                  {language === 'en' ? (
                    <>
                      Today Moon is transiting through the <strong className="text-yellow-300">{moonBhava}th House</strong> from your sign. {localizeVedicText(chandraGochar.gocharSummary)} With the celestial alignment of{' '}
                      <strong className="text-amber-200">{localizeVedicText(todayDayPanchang.nakshatra)} Nakshatra</strong>,{' '}
                      <strong className="text-amber-200">{localizeVedicText(todayDayPanchang.tithiName)} Tithi</strong> and{' '}
                      <strong className="text-amber-200">{localizeVedicText(todayDayPanchang.yoga)} Yoga</strong>, sign lord{' '}
                      <strong className="text-yellow-300">{localizeVedicText(currentRashi.swami)}</strong> provides auspicious strength to your daily endeavors.
                    </>
                  ) : (
                    <>
                      आज चन्द्रमा आपकी राशि से <strong className="text-yellow-300">{moonBhava}वें भाव</strong> में गोचर कर रहे हैं। {chandraGochar.gocharSummary} आज आकाश में{' '}
                      <strong className="text-amber-200">{todayDayPanchang.nakshatra} नक्षत्र</strong>,{' '}
                      <strong className="text-amber-200">{todayDayPanchang.tithiName} तिथि</strong> एवं{' '}
                      <strong className="text-amber-200">{todayDayPanchang.yoga} योग</strong> के समन्वय से राशि स्वामी{' '}
                      <strong className="text-yellow-300">{currentRashi.swami}</strong> आपके दैनिक पुरुषार्थ को बल प्रदान कर रहे हैं।
                    </>
                  )}
                </>
              ) : forecastMode === 'weekly' ? (
                <>
                  {language === 'en' ? (
                    <>
                      According to weekly planetary calculations, Sun is transiting in your <strong className="text-amber-200">{sunBhava}th House</strong> and Mercury in the{' '}
                      <strong className="text-amber-200">{budhBhava}th House</strong> forming benefic aspects. Mars in the{' '}
                      <strong className="text-amber-200">{mangalBhava}th House</strong> instills courage and vitality. Mid-week brings favorable business discussions and banking progress.
                    </>
                  ) : (
                    <>
                      साप्ताहिक गणना अनुसार, इस सप्ताह सूर्यदेव आपकी राशि से <strong className="text-amber-200">{sunBhava}वें भाव</strong> तथा बुधदेव{' '}
                      <strong className="text-amber-200">{budhBhava}वें भाव</strong> में युति/दृष्टि प्रभाव बना रहे हैं। मंगलदेव{' '}
                      <strong className="text-amber-200">{mangalBhava}वें भाव</strong> में साहस व स्फूर्ति दे रहे हैं। सप्ताह के मध्य में व्यापारिक चर्चाएं व बैंकिंग कार्य गति पकड़ेंगे।
                    </>
                  )}
                </>
              ) : (
                <>
                  {language === 'en' ? (
                    <>
                      According to monthly Parashari calculations (Lahiri Ayanamsha, Rudrapur), Jupiter transits through your{' '}
                      <strong className="text-amber-200">{guruBhava}th House</strong> and Karmaphala lord Saturn through your{' '}
                      <strong className="text-amber-200">{shaniBhava}th House</strong>. Rahu occupies the{' '}
                      <strong className="text-amber-200">{rahuBhava}th House</strong>. This month brings favorable opportunities for long-term investments, professional stability, and auspicious ceremonies.
                    </>
                  ) : (
                    <>
                      मासिक पाराशरी गणना (लाहिड़ी अयनांश, रुद्रपुर) के अनुसार, इस पूरे मास देवगुरु बृहस्पति आपकी राशि से{' '}
                      <strong className="text-amber-200">{guruBhava}वें भाव</strong> एवं कर्मफलदाता शनिदेव{' '}
                      <strong className="text-amber-200">{shaniBhava}वें भाव</strong> में संचरण कर रहे हैं। राहु{' '}
                      <strong className="text-amber-200">{rahuBhava}वें भाव</strong> में स्थित हैं। यह मास दीर्घकालिक निवेश, व्यावसायिक स्थिरता और पारिवारिक मांगलिक आयोजनों हेतु अत्यंत मंगलकारी रहेगा।
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          {/* C. Today's 8 Complete Astrological Indicators Grid */}
          {(() => {
            const periodPrefix = forecastMode === 'daily'
              ? tr('आज का', "Today's")
              : forecastMode === 'weekly'
              ? tr('साप्ताहिक', 'Weekly')
              : tr('मासिक', 'Monthly');
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-700/40 text-center">
                  <span className="text-[10px] text-amber-400 font-semibold block">{periodPrefix} {tr('शुभ अंक', 'Lucky No.')}</span>
                  <span className="font-mono font-extrabold text-sm sm:text-base text-yellow-300 mt-0.5 block">
                    {luckyNumber}, {allyNumber}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-700/40 text-center">
                  <span className="text-[10px] text-amber-400 font-semibold block">{periodPrefix} {tr('शुभ रंग', 'Lucky Color')}</span>
                  <span className="font-bold text-[11px] text-amber-100 mt-0.5 block leading-tight">
                    {localizeVedicText(luckyColor)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/35 border border-rose-700/40 text-center">
                  <span className="text-[10px] text-rose-300 font-semibold block">{forecastMode === 'daily' ? tr('आज वर्जित रंग', 'Avoid Color') : `${periodPrefix} ${tr('वर्जित रंग', 'Avoid Color')}`}</span>
                  <span className="font-bold text-[11px] text-rose-100 mt-0.5 block leading-tight">
                    {localizeVedicText(avoidColor)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-center">
                  <span className="text-[10px] text-emerald-400 font-semibold block">{tr('अनुकूल दिशा', 'Lucky Direction')}</span>
                  <span className="font-bold text-[11px] text-emerald-200 mt-0.5 block leading-tight">
                    {localizeVedicText(luckyDirection)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-700/40 text-center">
                  <span className="text-[10px] text-indigo-300 font-semibold block">{tr('सर्वश्रेष्ठ शुभ समय', 'Best Auspicious Time')}</span>
                  <span className="font-bold text-[10px] text-indigo-100 mt-0.5 block leading-tight">
                    {localizeVedicText(luckyTime)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-red-950/35 border border-red-800/40 text-center">
                  <span className="text-[10px] text-red-300 font-semibold block">{tr('राहुकाल (सावधानी)', 'Rahu Kaal (Avoid)')}</span>
                  <span className="font-bold text-[10px] text-red-200 mt-0.5 block leading-tight">
                    {localizeVedicText(todayFullPanchang.rahuKaal)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-950/35 border border-purple-700/40 text-center">
                  <span className="text-[10px] text-purple-300 font-semibold block">{tr('अभिजित मुहूर्त', 'Abhijit Muhurat')}</span>
                  <span className="font-bold text-[10px] text-purple-100 mt-0.5 block leading-tight">
                    {localizeVedicText(todayFullPanchang.abhijitMuhurat)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-teal-950/35 border border-teal-700/40 text-center">
                  <span className="text-[10px] text-teal-300 font-semibold block">{tr('दिशाशूल', 'Disha Shool')}</span>
                  <span className="font-bold text-[10px] text-teal-100 mt-0.5 block leading-tight">
                    {localizeVedicText(todayFullPanchang.dishaShool)}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* D. 5-Pillar Percentage Meters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-900/35">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-amber-200 font-semibold flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" /> {tr('करियर व व्यापार', 'Career & Business')}
                </span>
                <span className="font-mono font-bold text-amber-300">{careerScore}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
                  style={{ width: `${careerScore}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-900/35">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-emerald-200 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> {tr('धन व आर्थिक लाभ', 'Wealth & Finance')}
                </span>
                <span className="font-mono font-bold text-emerald-300">{wealthScore}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${wealthScore}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-900/35">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-rose-200 font-semibold flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> {tr('प्रेम व दांपत्य सुख', 'Love & Harmony')}
                </span>
                <span className="font-mono font-bold text-rose-300">{familyScore}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                  style={{ width: `${familyScore}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-900/35">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-indigo-200 font-semibold flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> {tr('शिक्षा व संतान', 'Education & Family')}
                </span>
                <span className="font-mono font-bold text-indigo-300">{educationScore}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-400"
                  style={{ width: `${educationScore}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-sky-900/35 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-sky-200 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> {tr('स्वास्थ्य व ऊर्जा', 'Health & Vitality')}
                </span>
                <span className="font-mono font-bold text-sky-300">{healthScore}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* E. Complete Today's 5-Pillar Deep Astrological Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. Lagna, Rashi Lord & Mental-Spiritual State */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-amber-800/40 space-y-1.5">
              <h5 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{tr('१. लग्नेश, राशि स्वामी एवं मानसिक-आध्यात्मिक स्थिति', '1. Ascendant, Sign Lord & Spiritual Wellbeing')}</span>
              </h5>
              <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed">
                {language === 'en' ? (
                  <>
                    By the grace of Sign Lord <b>{localizeVedicText(currentRashi.swami)}</b> and Ishta Devta <b>{localizeVedicText(currentRashi.aradhyaDev)}</b>, your mental resilience and spiritual focus remain strengthened. {localizeVedicText(educationText)} {localizeVedicText(healthText)}
                  </>
                ) : (
                  <>
                    राशि स्वामी <b>{currentRashi.swami}</b> एवं आराध्य <b>{currentRashi.aradhyaDev}</b> की कृपा से आपकी मानसिक एवं आध्यात्मिक ऊर्जा सुदृढ़ रहेगी। {educationText} {healthText}
                  </>
                )}
              </p>
            </div>

            {/* 2. Active Dasha & Gochar Transit Impact */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-indigo-800/40 space-y-1.5">
              <h5 className="text-xs sm:text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>{tr('२. सक्रिय विंशोत्तरी महादशा/अंतर्दशा एवं गोचर ग्रहों का सूक्ष्म प्रभाव', '2. Active Vimshottari Dasha & Planetary Transits')}</span>
              </h5>
              <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed">
                {language === 'en' ? (
                  <>
                    According to Rudrapur latitude (28.98° N) and Lahiri Ayanamsha, Moon is transiting in <b>House {moonBhava}</b>, Jupiter in <b>House {guruBhava}</b>, and Saturn in <b>House {shaniBhava}</b>. {localizeVedicText(chandraGochar.gocharSummary)}
                  </>
                ) : (
                  <>
                    रुद्रपुर स्थानीय अक्षांश (28.98° N) व लाहिड़ी अयनांश अनुसार चन्द्रमा <b>{moonBhava}वें भाव</b>, गुरु <b>{guruBhava}वें भाव</b> तथा शनि <b>{shaniBhava}वें भाव</b> में गोचररत हैं। {chandraGochar.gocharSummary}
                  </>
                )}
              </p>
            </div>

            {/* 3. Career, Livelihood, Business & Wealth Yoga */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-emerald-800/40 space-y-1.5">
              <h5 className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>{tr('३. करियर, आजीविका, व्यवसाय एवं धन योग', '3. Career, Livelihood, Business & Wealth Yoga')}</span>
              </h5>
              <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed">
                {language === 'en' ? `${localizeVedicText(careerText)} ${localizeVedicText(wealthText)}` : `${careerText} ${wealthText}`}
              </p>
            </div>

            {/* 4. Family Harmony, Marital Life & Relationships */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-rose-800/40 space-y-1.5">
              <h5 className="text-xs sm:text-sm font-bold text-rose-300 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>{tr('४. पारिवारिक सौख्य, दांपत्य जीवन एवं संबंध', '4. Family Harmony, Marital Life & Relationships')}</span>
              </h5>
              <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed">
                {language === 'en' ? localizeVedicText(familyText) : familyText}
              </p>
            </div>
          </div>

          {/* F. Today's Do's & Don'ts + 5th Pillar: Precise Vedic Remedies, Mantras & Gemstone Guidance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            {/* Today's / Weekly / Monthly Do's & Don'ts */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-600/35 space-y-2">
                <h6 className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {forecastMode === 'daily'
                      ? tr('आज क्या करें (शुभ करणीय कार्य)', "Today's Recommended Actions (Do's)")
                      : forecastMode === 'weekly'
                      ? tr('इस सप्ताह क्या करें (शुभ साप्ताहिक रणनीति)', "Weekly Recommended Strategy (Do's)")
                      : tr('इस माह के मुख्य संकल्प (मासिक नियम)', "Monthly Aspirations & Guidelines (Do's)")}
                  </span>
                </h6>
                <ul className="space-y-1.5 text-xs text-emerald-100/95 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{language === 'en' ? localizeVedicText(doToday1) : doToday1}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{language === 'en' ? localizeVedicText(doToday2) : doToday2}</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-600/35 space-y-2">
                <h6 className="text-xs font-extrabold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>
                    {forecastMode === 'daily'
                      ? tr('आज क्या न करें (ज्योतिषीय सावधानी)', "Astrological Cautions (Don'ts)")
                      : forecastMode === 'weekly'
                      ? tr('इस सप्ताह क्या न करें (साप्ताहिक सावधानी)', "Weekly Cautions (Don'ts)")
                      : tr('इस माह इनसे बचें (मासिक वर्जित कार्य)', "Monthly Cautions to Avoid (Don'ts)")}
                  </span>
                </h6>
                <ul className="space-y-1.5 text-xs text-rose-100/95 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{language === 'en' ? localizeVedicText(dontToday1) : dontToday1}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{language === 'en' ? localizeVedicText(dontToday2) : dontToday2}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 5th Pillar: Precise Vedic Remedy, Gemstone & Beej Mantra */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-b from-amber-950/60 to-slate-900 border border-amber-500/45 flex flex-col justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-yellow-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {tr('५. शास्त्रोक्त वैदिक उपाय, विशेष मंत्र जप, रत्न-रुद्राक्ष एवं दान विधान', '5. Vedic Remedies, Mantra Jaap, Gemstones & Charity')}
                  </span>
                </span>
                <p className="text-xs text-amber-100/95 mt-1.5 leading-relaxed">
                  {language === 'en' ? localizeVedicText(remedyText) : remedyText}{' '}
                  {tr('शुभ रत्न:', 'Auspicious Gemstone:')} <b>{localizeVedicText(currentRashi.ratna)}</b> ({localizeVedicText(currentRashi.dhatu)})।
                </p>
                <div className="mt-2.5 pt-2.5 border-t border-amber-800/40">
                  <span className="text-[10px] text-amber-400 font-semibold block">
                    {tr(`राशि स्वामी (${currentRashi.swami}) तांत्रिक बीज मंत्र:`, `Sign Lord (${localizeVedicText(currentRashi.swami)}) Tantric Beej Mantra:`)}
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-vedic text-yellow-300 block mt-0.5">
                    {currentRashi.beejMantra}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (activeSpeechId !== 'rashi-beej-mantra') {
                      vedicAudio.playTempleBell(0.65);
                    }
                    vedicAudio.toggleSpeakText(
                      `राशि स्वामी ${currentRashi.swami} का सिद्ध बीज मंत्र। ${currentRashi.beejMantra}। ${currentRashi.beejMantra}`,
                      'rashi-beej-mantra'
                    );
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    activeSpeechId === 'rashi-beej-mantra'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-extrabold shadow-md'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/50 text-amber-200'
                  }`}
                >
                  {activeSpeechId === 'rashi-beej-mantra' ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>{tr('मंत्र रोकें', 'Stop Mantra')}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{tr('बीज मंत्र सुनें', 'Listen Beej Mantra')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onOpenMantraJaap}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{tr('108 जप करें', '108 Jaap Mala')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
