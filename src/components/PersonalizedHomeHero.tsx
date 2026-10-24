import React, { useState, useEffect, useMemo } from 'react';
import {
  FamilyMemberProfile,
  getFamilyVaultProfiles,
  upsertFamilyMember,
  deriveVedicDetailsForProfile,
  getCalculationViewingMode,
  setCalculationViewingMode,
  CalculationViewingMode,
  formatUserSalutation,
} from '../utils/familyVaultStorage';
import { getVedicDetailsFromName } from '../utils/kundaliMilan';
import { getActiveProfile, setActiveProfile } from '../utils/autoPersonalization';
import { getTodayPanchang } from '../data/mockData';
import {
  buildSingleDayPanchang,
  getISTCalendarParts,
  getMsUntilNextISTMidnight,
} from '../utils/panchangCalendarEngine';
import { generateSampurnKundali } from '../utils/sampurnKundali';
import { vedicAudio } from '../utils/audioSynthesizer';
import {
  Sparkles,
  Sun,
  Moon,
  Compass,
  Star,
  ChevronRight,
  Clock,
  Briefcase,
  TrendingUp,
  Heart,
  ShieldCheck,
  Gem,
  Flame,
  Volume2,
  VolumeX,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { UserMobileAccount } from '../types';

interface PersonalizedHomeHeroProps {
  currentUser?: UserMobileAccount | null;
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
  onSwitchUserAccount?: (account: UserMobileAccount) => void;
  onOpenVault: () => void;
  onOpenJanamKundali: () => void;
  onOpenRashifal: () => void;
}

interface NativeTransitContext {
  userName: string;
  salutationPreference?: 'shri_ji' | 'yajman' | 'simple';
  isNameRashiMode: boolean;
  dob?: string;
  lagnaName: string;
  lagnaLord: string;
  chandraRashi: string;
  chandraRashiLord: string;
  nakshatra: string;
  nakshatraPada: number;
  nakshatraLord: string;
  nadi: string;
  gana: string;
  activeMahadasha: string;
  activeAntardasha: string;
  dashaPeriod: string;
  atmakaraka: string;
  amatyakaraka: string;
  moonHouse: number;
  moonFromLagna: number;
  jupiterHouse: number;
  transitJupiterRashi: string;
  saturnHouse: number;
  transitSaturnRashi: string;
  sunHouse: number;
  marsHouse: number;
  rahuHouse: number;
  ratnaName: string;
  uparatnaName: string;
  ratnaMetalAndFinger: string;
  rudraksha: string;
  beejMantra: string;
  ishtaDevta: string;
  luckyColors: string;
  luckyNumbers: string;
  luckyDirection: string;
}

const NAME_RASHI_ASTRO_MAP: Record<
  string,
  {
    lagnaName: string;
    lagnaLord: string;
    activeDasha: string;
    activeAntardasha: string;
    dashaPeriod: string;
    ratnaName: string;
    uparatnaName: string;
    ratnaMetalAndFinger: string;
    rudraksha: string;
    beejMantra: string;
    ishtaDevta: string;
    luckyColors: string;
    luckyNumbers: string;
    luckyDirection: string;
  }
> = {
  'मेष': {
    lagnaName: 'मेष (नाम राशि आधारित)',
    lagnaLord: 'मंगल (Mars)',
    activeDasha: 'मंगल',
    activeAntardasha: 'बृहस्पति',
    dashaPeriod: '2024 — 2031 (नाम गोचर)',
    ratnaName: 'लाल मूंगा (Red Coral)',
    uparatnaName: 'ताम्र रत्न',
    ratnaMetalAndFinger: 'तांबे की अंगूठी में अनामिका (Ring Finger)',
    rudraksha: '३ मुखी रुद्राक्ष',
    beejMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः॥',
    ishtaDevta: 'श्री हनुमान जी एवं कार्तिकेय',
    luckyColors: 'सिंदूरी लाल एवं नारंगी',
    luckyNumbers: '1, 9',
    luckyDirection: 'पूर्व दिशा',
  },
  'वृषभ': {
    lagnaName: 'वृषभ (नाम राशि आधारित)',
    lagnaLord: 'शुक्र (Venus)',
    activeDasha: 'शुक्र',
    activeAntardasha: 'बुध',
    dashaPeriod: '2022 — 2042 (नाम गोचर)',
    ratnaName: 'हीरा / सफेद ओपल (Opal)',
    uparatnaName: 'जरकन',
    ratnaMetalAndFinger: 'चांदी में मध्यमा / तर्जनी',
    rudraksha: '६ मुखी रुद्राक्ष',
    beejMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः॥',
    ishtaDevta: 'माँ महालक्ष्मी',
    luckyColors: 'श्वेत एवं चमकीला क्रीम',
    luckyNumbers: '2, 6',
    luckyDirection: 'दक्षिण-पूर्व (आग्नेय)',
  },
  'मिथुन': {
    lagnaName: 'मिथुन (नाम राशि आधारित)',
    lagnaLord: 'बुध (Mercury)',
    activeDasha: 'बुध',
    activeAntardasha: 'शुक्र',
    dashaPeriod: '2023 — 2040 (नाम गोचर)',
    ratnaName: 'हरा पन्ना (Emerald)',
    uparatnaName: 'पेरिडॉट / मरगज',
    ratnaMetalAndFinger: 'सोने या कांस्य में कनिष्ठिका (Little Finger)',
    rudraksha: '४ मुखी रुद्राक्ष',
    beejMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः॥',
    ishtaDevta: 'भगवान श्री गणेश',
    luckyColors: 'तोतिया हरा एवं हल्का पीला',
    luckyNumbers: '3, 5',
    luckyDirection: 'उत्तर दिशा',
  },
  'कर्क': {
    lagnaName: 'कर्क (नाम राशि आधारित)',
    lagnaLord: 'चन्द्रमा (Moon)',
    activeDasha: 'चन्द्रमा',
    activeAntardasha: 'बृहस्पति',
    dashaPeriod: '2025 — 2035 (नाम गोचर)',
    ratnaName: 'सच्चा मोती (Pearl)',
    uparatnaName: 'चन्द्रकान्त मणि (Moonstone)',
    ratnaMetalAndFinger: 'चांदी में कनिष्ठिका / तर्जनी',
    rudraksha: '२ मुखी रुद्राक्ष',
    beejMantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः॥',
    ishtaDevta: 'भगवान शिवशंकर',
    luckyColors: 'दूधिया सफेद एवं सिल्वर',
    luckyNumbers: '2, 4',
    luckyDirection: 'उत्तर-पश्चिम (वायव्य)',
  },
  'सिंह': {
    lagnaName: 'सिंह (नाम राशि आधारित)',
    lagnaLord: 'सूर्य (Sun)',
    activeDasha: 'सूर्य',
    activeAntardasha: 'मंगल',
    dashaPeriod: '2024 — 2030 (नाम गोचर)',
    ratnaName: 'माणिक्य (Ruby)',
    uparatnaName: 'गारनेट / लाल तूरी',
    ratnaMetalAndFinger: 'सोने या तांबे में अनामिका (Ring Finger)',
    rudraksha: '१२ मुखी रुद्राक्ष',
    beejMantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः॥',
    ishtaDevta: 'भगवान सूर्यनारायण एवं श्री राम',
    luckyColors: 'केसरिया, स्वर्णिम एवं लाल',
    luckyNumbers: '1, 5',
    luckyDirection: 'पूर्व दिशा',
  },
  'कन्या': {
    lagnaName: 'कन्या (नाम राशि आधारित)',
    lagnaLord: 'बुध (Mercury)',
    activeDasha: 'बुध',
    activeAntardasha: 'गुरु',
    dashaPeriod: '2023 — 2040 (नाम गोचर)',
    ratnaName: 'पन्ना (Emerald)',
    uparatnaName: 'ओनेक्स / मरगज',
    ratnaMetalAndFinger: 'चांदी या सोने में कनिष्ठिका',
    rudraksha: '४ मुखी रुद्राक्ष',
    beejMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः॥',
    ishtaDevta: 'श्री विष्णु जी एवं गणेश जी',
    luckyColors: 'गहरा हरा एवं आकाशी',
    luckyNumbers: '5, 6',
    luckyDirection: 'उत्तर दिशा',
  },
  'तुला': {
    lagnaName: 'तुला (नाम राशि आधारित)',
    lagnaLord: 'शुक्र (Venus)',
    activeDasha: 'शुक्र',
    activeAntardasha: 'शनि',
    dashaPeriod: '2022 — 2042 (नाम गोचर)',
    ratnaName: 'अमेरिकन डायमंड / ओपल',
    uparatnaName: 'जरकन',
    ratnaMetalAndFinger: 'चांदी/प्लैटिनम में मध्यमा',
    rudraksha: '६ मुखी रुद्राक्ष',
    beejMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः॥',
    ishtaDevta: 'माँ सन्तोषी व महालक्ष्मी',
    luckyColors: 'शाही सफेद एवं हल्का नीला',
    luckyNumbers: '6, 7',
    luckyDirection: 'पश्चिम दिशा',
  },
  'वृश्चिक': {
    lagnaName: 'वृश्चिक (नाम राशि आधारित)',
    lagnaLord: 'मंगल (Mars)',
    activeDasha: 'मंगल',
    activeAntardasha: 'चन्द्रमा',
    dashaPeriod: '2024 — 2031 (नाम गोचर)',
    ratnaName: 'सिंदूरी मूंगा (Coral)',
    uparatnaName: 'लाल हकीक',
    ratnaMetalAndFinger: 'तांबे में अनामिका',
    rudraksha: '३ मुखी रुद्राक्ष',
    beejMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः॥',
    ishtaDevta: 'श्री हनुमान जी व काल भैरव',
    luckyColors: 'गहरा लाल व मेहरून',
    luckyNumbers: '8, 9',
    luckyDirection: 'दक्षिण दिशा',
  },
  'धनु': {
    lagnaName: 'धनु (नाम राशि आधारित)',
    lagnaLord: 'देवगुरु बृहस्पति (Jupiter)',
    activeDasha: 'बृहस्पति',
    activeAntardasha: 'सूर्य',
    dashaPeriod: '2020 — 2036 (नाम गोचर)',
    ratnaName: 'पीला पुखराज (Yellow Sapphire)',
    uparatnaName: 'सुनहला (Citrine)',
    ratnaMetalAndFinger: 'सोने / पीतल में तर्जनी (Index Finger)',
    rudraksha: '५ मुखी रुद्राक्ष',
    beejMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः॥',
    ishtaDevta: 'भगवान श्री हरि विष्णु',
    luckyColors: 'पीताम्बरी पीला व नारंगी',
    luckyNumbers: '3, 9',
    luckyDirection: 'उत्तर-पूर्व (ईशान)',
  },
  'मकर': {
    lagnaName: 'मकर (नाम राशि आधारित)',
    lagnaLord: 'शनि देव (Saturn)',
    activeDasha: 'शनि',
    activeAntardasha: 'बुध',
    dashaPeriod: '2021 — 2040 (नाम गोचर)',
    ratnaName: 'नीलम (Blue Sapphire)',
    uparatnaName: 'कटैला (Amethyst)',
    ratnaMetalAndFinger: 'पंचधातु/लोहे में मध्यमा',
    rudraksha: '७ मुखी रुद्राक्ष',
    beejMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः॥',
    ishtaDevta: 'शनि देव व हनुमान जी',
    luckyColors: 'नीला, काला व धूसर',
    luckyNumbers: '8, 10',
    luckyDirection: 'पश्चिम दिशा',
  },
  'कुंभ': {
    lagnaName: 'कुंभ (नाम राशि आधारित)',
    lagnaLord: 'शनि देव (Saturn)',
    activeDasha: 'शनि',
    activeAntardasha: 'शुक्र',
    dashaPeriod: '2021 — 2040 (नाम गोचर)',
    ratnaName: 'नीलम / लाजवर्त (Lapis Lazuli)',
    uparatnaName: 'जामुनिया / कटैला',
    ratnaMetalAndFinger: 'अष्टधातु में मध्यमा (Middle Finger)',
    rudraksha: '७ मुखी रुद्राक्ष',
    beejMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः॥',
    ishtaDevta: 'भगवान शिव व शनि महाराज',
    luckyColors: 'रॉयल ब्लू व आसमानी',
    luckyNumbers: '8, 11',
    luckyDirection: 'पश्चिम दिशा',
  },
  'कुम्भ': {
    lagnaName: 'कुम्भ (नाम राशि आधारित)',
    lagnaLord: 'शनि देव (Saturn)',
    activeDasha: 'शनि',
    activeAntardasha: 'शुक्र',
    dashaPeriod: '2021 — 2040 (नाम गोचर)',
    ratnaName: 'नीलम / लाजवर्त (Lapis Lazuli)',
    uparatnaName: 'जामुनिया / कटैला',
    ratnaMetalAndFinger: 'अष्टधातु में मध्यमा (Middle Finger)',
    rudraksha: '७ मुखी रुद्राक्ष',
    beejMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः॥',
    ishtaDevta: 'भगवान शिव व शनि महाराज',
    luckyColors: 'रॉयल ब्लू व आसमानी',
    luckyNumbers: '8, 11',
    luckyDirection: 'पश्चिम दिशा',
  },
  'मीन': {
    lagnaName: 'मीन (नाम राशि आधारित)',
    lagnaLord: 'देवगुरु बृहस्पति (Jupiter)',
    activeDasha: 'बृहस्पति',
    activeAntardasha: 'मंगल',
    dashaPeriod: '2020 — 2036 (नाम गोचर)',
    ratnaName: 'पुखराज (Yellow Sapphire)',
    uparatnaName: 'सुनहला',
    ratnaMetalAndFinger: 'सोने में तर्जनी (Index Finger)',
    rudraksha: '५ मुखी रुद्राक्ष',
    beejMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः॥',
    ishtaDevta: 'भगवान लक्ष्मी-नारायण',
    luckyColors: 'हल्का पीला व केसरिया',
    luckyNumbers: '3, 12',
    luckyDirection: 'उत्तर-पूर्व (ईशान)',
  },
};

const CAREER_HOUSE_DESCRIPTIONS: Record<number, { hi: string; en: string }> = {
  1: {
    hi: 'लग्न व जन्म राशि पर गोचर होने से आपके स्वावलंबन और त्वरित निर्णय क्षमता में विशेष निखार आएगा। स्वतंत्र रूप से उठाए गए व्यावसायिक कदम प्रतिष्ठा दिलाएंगे।',
    en: 'Transit in 1st house sharpens leadership and decisive action, establishing strong authority in business and career.',
  },
  2: {
    hi: 'द्वितीय धन भाव में संचरण से संवाद व वाणी कौशल द्वारा महत्वपूर्ण व्यावसायिक अनुबंध व शासकीय वार्ताएं अनुकूल सिद्ध होंगी।',
    en: '2nd house transit empowers your communication and negotiation, closing profitable professional agreements.',
  },
  3: {
    hi: 'तृतीय पराक्रम भाव में गोचर से पुरुषार्थ व उद्यम चरम पर रहेगा। नई तकनीकी परियोजनाओं, विपणन एवं व्यावसायिक यात्राओं से उच्च सफलता मिलेगी।',
    en: '3rd house transit activates bold initiatives, short business travels, and enterprise success.',
  },
  4: {
    hi: 'चतुर्थ केंद्र भाव में ग्रह प्रभाव से कार्यस्थल में स्थिरता, प्रबंधन कौशल एवं स्थायी परियोजनाओं में पद-सम्मान की वृद्धि होगी।',
    en: '4th house transit reinforces workplace stability, organizational leadership, and core team confidence.',
  },
  5: {
    hi: 'पंचम त्रिकोण गोचर से बौद्धिक प्रखरता, नवाचार एवं रणनीतिक निर्णयों में सफलता मिलेगी। वरिष्ठ अधिकारी आपकी दूरदृष्टि की सराहना करेंगे।',
    en: '5th house trine transit stimulates strategic brilliance, innovative thinking, and high praise from superiors.',
  },
  6: {
    hi: 'षष्ठ उपचय भाव में गोचर प्रतिस्पर्धियों व व्यावसायिक विरोधियों पर पूर्ण विजय दिलाएगा। लंबित पदोन्नति व शासकीय कार्य गति पकड़ेंगे।',
    en: '6th house transit grants decisive edge over competitors, speeding up promotions and administrative approvals.',
  },
  7: {
    hi: 'सप्तम केंद्र में संचरण से साझेदारियों, जनसंपर्क एवं दैनिक व्यापारिक गतिविधियों में उल्लेखनीय उछाल आएगा। नए व्यावसायिक अनुबंध होंगे।',
    en: '7th house transit drives expansion in joint ventures, trade alliances, and client partnerships.',
  },
  8: {
    hi: 'अष्टम भाव में गोचर से कार्यक्षेत्र में गोपनीयता व धैर्य बनाए रखें। शोध, डेटा विश्लेषण, ऑडिट व दीर्घकालीन नियोजन में उत्कृष्ट परिणाम मिलेंगे।',
    en: '8th house transit advises measured patience and confidentiality; in-depth research and long-term planning bear fruit.',
  },
  9: {
    hi: 'नवम भाग्य त्रिकोण में गोचर से भाग्य का भरपूर सहयोग मिलेगा। गुरुजनों व मार्गदर्शकों की कृपा से करियर की पुरानी बाधाएं स्वतः दूर होंगी।',
    en: '9th house fortune transit brings powerful luck and mentor support, dissolving past professional hurdles.',
  },
  10: {
    hi: 'दशम कर्म केंद्र में प्रबल गोचर से कार्यक्षेत्र में सर्वोच्च यश, अधिकार वृद्धि व पदोन्नति के श्रेष्ठ योग हैं। व्यापार विस्तार में सफलता मिलेगी।',
    en: '10th house karma transit creates peak opportunities for career advancement, executive authority, and business growth.',
  },
  11: {
    hi: 'एकादश लाभ भाव में गोचर से आपके सभी कर्म प्रयासों का श्रेष्ठ फल प्राप्त होगा। उच्चाधिकारियों व उद्योग सहयोगियों से पूर्ण समर्थन मिलेगा।',
    en: '11th house gains transit rewards past hard work with high achievements and recognition from leadership.',
  },
  12: {
    hi: 'द्वादश भाव में गोचर से दूरस्थ संपर्कों, बहुराष्ट्रीय उपक्रमों व विदेशी व्यापारिक योजनाओं में अनुकूल अवसर निर्मित होंगे।',
    en: '12th house transit opens favorable avenues through distant connections, overseas trade, and global collaborations.',
  },
};

const FINANCE_HOUSE_DESCRIPTIONS: Record<number, { hi: string; en: string }> = {
  1: {
    hi: 'आत्मविश्वास व विवेकपूर्ण आर्थिक निर्णयों से स्वयं-अर्जित संपत्ति व साख में निरंतर वृद्धि होगी।',
    en: 'Confident and prudent decisions enhance personal creditworthiness and steady wealth accumulation.',
  },
  2: {
    hi: 'द्वितीय धन भाव सक्रिय रहने से संचित कोष (Savings), बैंक बैलेंस, स्वर्ण-आभूषण व पैतृक संपत्ति में उत्तम वृद्धि का योग है।',
    en: 'Active 2nd house transit enriches family savings, gold/assets, and legacy property growth.',
  },
  3: {
    hi: 'स्वयं के पुरुषार्थ, कमीशन, परामर्श व डिजिटल साधनों से धनागमन के नवीन मार्ग खुलेंगे।',
    en: 'Self-initiative, commissions, and digital enterprise open fresh channels of reliable monetary inflow.',
  },
  4: {
    hi: 'अचल संपत्ति, भूमि, गृह-सज्जा व वाहन संबंधित लेन-देन में श्रेष्ठ आर्थिक लाभ व स्थायी संपत्ति का निर्माण होगा।',
    en: 'Investments in real estate, vehicles, and long-term home assets create solid family prosperity.',
  },
  5: {
    hi: 'पंचम लक्ष्मी-त्रिकोण के प्रभाव से पूर्व संचित बौद्धिक निवेश, परामर्श व कौशल से आकस्मिक अर्थ-लाभ होगा।',
    en: '5th trine transit rewards previous strategic investments, advisory expertise, and intellect with wealth gains.',
  },
  6: {
    hi: 'पुराने ऋणों (Loans) से मुक्ति के मार्ग प्रशस्त होंगे तथा लंबे समय से अटका हुआ धन योजनाबद्ध प्रयास से वापस आएगा।',
    en: 'Favorable phase for clearing outstanding liabilities and recovering delayed dues through systematic follow-ups.',
  },
  7: {
    hi: 'दैनिक वाणिज्यिक कैश-फ्लो तीव्र रहेगा। व्यापारिक साझेदारी व ग्राहकों के माध्यम से प्रचुर आर्थिक लाभ होगा।',
    en: 'Robust daily commercial liquidity backed by profitable deals, trusted partners, and expanding client base.',
  },
  8: {
    hi: 'आज सट्टा व जोखिम भरे निवेश से बचें; दीर्घकालिक सुरक्षित बचत, बीमा व भविष्य निधि में निवेश फलदायी रहेगा।',
    en: 'Avoid speculative ventures today; focus on secure fixed deposits, insurance, and long-term safe instruments.',
  },
  9: {
    hi: 'नवम भाग्य स्थान में शुभ दृष्टि से धर्मोचित उपक्रमों व दीर्घकालीन योजनाओं द्वारा घर में स्थायी लक्ष्मी का वास होगा।',
    en: '9th house fortune alignment attracts righteous wealth, sustained family prosperity, and auspicious financial growth.',
  },
  10: {
    hi: 'व्यावसायिक साख बढ़ने के साथ-साथ राजकीय अनुबंधों, पदोन्नति के साथ वेतन वृद्धि एवं व्यापारिक लाभ का सुअवसर है।',
    en: 'Rising occupational stature translates into lucrative contracts, pay revisions, and healthy commercial profits.',
  },
  11: {
    hi: 'एकादश आय भाव में संचरण से बहुमुखी धन लाभ, बकाया भुगतान की प्राप्ति व आर्थिक समृद्धि का प्रबलतम योग है।',
    en: '11th house gains transit triggers multi-stream cash inflows, bonuses, and unprecedented financial expansion.',
  },
  12: {
    hi: 'मांगलिक, धार्मिक व लोक-कल्याणकारी कार्यों में सद्व्यय होगा। विलासिता के अनावश्यक खर्चों पर वित्तीय संयम रखें।',
    en: 'Noble expenditure on sacred family deeds and spiritual welfare; maintain mindful budget control on non-essentials.',
  },
};

function buildPersonalizedLagnaRashiAnalysis(c: NativeTransitContext, tr: (hi: string, en: string) => string): string {
  const salutation = formatUserSalutation(c.userName, c.salutationPreference);
  if (c.isNameRashiMode) {
    const hi = `${salutation}, आपकी प्रचलित नाम राशि ${c.chandraRashi} (राशि स्वामी: ${c.chandraRashiLord}) एवं नाम नक्षत्र ${c.nakshatra} के सूक्ष्म विश्लेषण अनुसार आपका मन सात्त्विक, दूरदर्शी और धर्मपरायण है। आज चन्द्रमा नाम राशि से ${c.moonHouse}वें भाव तथा सूर्यदेव ${c.sunHouse}वें भाव में स्थित होकर आपके आत्मबल, विवेक और आध्यात्मिक एकाग्रता को प्रबल बना रहे हैं। इष्ट देव (${c.ishtaDevta}) की कृपा से मानसिक शांति व निर्णय क्षमता उच्च रहेगी।`;
    const en = `${salutation} (Name Rashi ${c.chandraRashi}, Lord: ${c.chandraRashiLord}): Moon in house ${c.moonHouse} and Sun in house ${c.sunHouse} strengthen your mental clarity, spiritual poise, and inner determination under the grace of ${c.ishtaDevta}.`;
    return tr(hi, en);
  }
  const hi = `${salutation}, रुद्रपुर के स्थानीय अक्षांश (28.98° N, 79.40° E) एवं लाहिड़ी चित्रापक्ष अयनांश की शुद्ध दृक् गणित गणना से आपका जन्म लग्न ${c.lagnaName} (लग्नेश: ${c.lagnaLord}) तथा जन्म चन्द्र राशि ${c.chandraRashi} (राशीश: ${c.chandraRashiLord}, नक्षत्र: ${c.nakshatra} चरण ${c.nakshatraPada}) है। लग्नेश ${c.lagnaLord} एवं आत्मकारक ${c.atmakaraka} के प्रभाव से आपकी मानसिक-आध्यात्मिक स्थिति अत्यंत सुदृढ़ है तथा आज चन्द्रमा के ${c.moonHouse}वें भाव (लग्न से ${c.moonFromLagna}वें) में संचरण से प्रज्ञा व आत्मविश्वास में विशेष तेज रहेगा।`;
  const en = `${salutation}, per Drik Ganit (Lahiri Ayanamsha, Rudrapur 28.98°N), your ${c.lagnaName} Lagna (Lord: ${c.lagnaLord}) and ${c.chandraRashi} Moon Sign (Lord: ${c.chandraRashiLord}, ${c.nakshatra} Pada ${c.nakshatraPada}) guided by Atmakaraka ${c.atmakaraka} grant high spiritual clarity and decisive willpower.`;
  return tr(hi, en);
}

function buildPersonalizedDashaGocharAnalysis(c: NativeTransitContext, tr: (hi: string, en: string) => string): string {
  const salutation = formatUserSalutation(c.userName, c.salutationPreference);
  if (c.isNameRashiMode) {
    const hi = `${salutation}, नाम राशि ${c.chandraRashi} पर सक्रिय नाम-दशा ${c.activeMahadasha} (अंतर्दशा: ${c.activeAntardasha}, अवधि: ${c.dashaPeriod}) के साथ आज गोचर में देवगुरु बृहस्पति ${c.jupiterHouse}वें भाव (${c.transitJupiterRashi}), कर्मफलदाता शनिदेव ${c.saturnHouse}वें भाव (${c.transitSaturnRashi}) एवं राहु ${c.rahuHouse}वें भाव में संचरण कर रहे हैं। दशा एवं गोचर का यह संयोग आपके रुके हुए कार्यों को गति देने और सकारात्मक बदलाव लाने वाला है।`;
    const en = `${salutation} (Name Rashi ${c.chandraRashi}): Active ${c.activeMahadasha}-${c.activeAntardasha} Dasha combined with Jupiter in house ${c.jupiterHouse} (${c.transitJupiterRashi}) and Saturn in house ${c.saturnHouse} (${c.transitSaturnRashi}) accelerates pending goals.`;
    return tr(hi, en);
  }
  const hi = `${salutation}, आपकी जन्म कुंडली में वर्तमान में ${c.activeMahadasha} की विंशोत्तरी महादशा एवं ${c.activeAntardasha} की अंतर्दशा (${c.dashaPeriod}) गतिमान है। इसके साथ ही आज के सूक्ष्म गोचर में आपकी जन्म राशि से देवगुरु बृहस्पति ${c.jupiterHouse}वें भाव (${c.transitJupiterRashi}), शनिदेव ${c.saturnHouse}वें भाव (${c.transitSaturnRashi}), मंगल ${c.marsHouse}वें भाव तथा राहु ${c.rahuHouse}वें भाव में गोचर कर रहे हैं। दशानाथ ${c.activeMahadasha} और बृहस्पति-शनि के इस गोचर समन्वय से प्रारब्ध के शुभ फल जागृत हो रहे हैं।`;
  const en = `${salutation}, your active Vimshottari ${c.activeMahadasha} Mahadasha and ${c.activeAntardasha} Antardasha (${c.dashaPeriod}) align with transiting Jupiter in house ${c.jupiterHouse} (${c.transitJupiterRashi}) and Saturn in house ${c.saturnHouse} (${c.transitSaturnRashi}), unlocking auspicious karmic rewards.`;
  return tr(hi, en);
}

function buildPersonalizedCareerForecast(c: NativeTransitContext, tr: (hi: string, en: string) => string): string {
  const base = CAREER_HOUSE_DESCRIPTIONS[c.moonHouse] || CAREER_HOUSE_DESCRIPTIONS[10];
  const finBase = FINANCE_HOUSE_DESCRIPTIONS[c.moonHouse] || FINANCE_HOUSE_DESCRIPTIONS[11];
  const salutation = formatUserSalutation(c.userName, c.salutationPreference);
  if (c.isNameRashiMode) {
    const hi = `${salutation}, आपके प्रचलित नाम के अक्षर से प्राप्त नाम राशि ${c.chandraRashi} (राशीश: ${c.chandraRashiLord}) आधारित आजीविका एवं धन योग: चन्द्रमा नाम राशि से ${c.moonHouse}वें भाव, धनकारक गुरु ${c.jupiterHouse}वें भाव (${c.transitJupiterRashi}) तथा शनिदेव ${c.saturnHouse}वें भाव (${c.transitSaturnRashi}) में स्थित हैं। ${base.hi} ${finBase.hi}`;
    const en = `${salutation} (Name Rashi ${c.chandraRashi}): Moon transits house ${c.moonHouse}, Jupiter in house ${c.jupiterHouse}, and Saturn in house ${c.saturnHouse}. ${base.en} ${finBase.en}`;
    return tr(hi, en);
  }
  const hi = `${salutation}, आपके शुद्ध जन्म लग्न ${c.lagnaName} (लग्नेश: ${c.lagnaLord}) के दशम (कर्म), द्वितीय (धन) व एकादश (लाभ) भाव का सटीक दृक् गणित विश्लेषण: आज चन्द्रमा जन्म राशि से ${c.moonHouse}वें भाव (लग्न से ${c.moonFromLagna}वें), धनकारक बृहस्पति ${c.jupiterHouse}वें भाव (${c.transitJupiterRashi}) तथा शनिदेव ${c.saturnHouse}वें भाव (${c.transitSaturnRashi}) में संचरण कर रहे हैं। आपके अमात्यकारक ${c.amatyakaraka} एवं ${c.activeMahadasha} महादशा के प्रभाववश: ${base.hi} ${finBase.hi}`;
  const en = `${salutation}, based on your exact birth ${c.lagnaName} Lagna (Lord: ${c.lagnaLord}) and ${c.chandraRashi} Moon sign: Moon transits house ${c.moonHouse}, Jupiter house ${c.jupiterHouse}, and Saturn house ${c.saturnHouse}. Guided by Amatyakaraka ${c.amatyakaraka}: ${base.en} ${finBase.en}`;
  return tr(hi, en);
}

function buildPersonalizedFinanceForecast(c: NativeTransitContext, tr: (hi: string, en: string) => string): string {
  const base = FINANCE_HOUSE_DESCRIPTIONS[c.moonHouse] || FINANCE_HOUSE_DESCRIPTIONS[11];
  const salutation = formatUserSalutation(c.userName, c.salutationPreference);
  if (c.isNameRashiMode) {
    const hi = `${salutation}, नाम राशि ${c.chandraRashi} के धन व लाभ भाव का गोचर प्रभाव: धनकारक देवगुरु बृहस्पति आपकी नाम राशि से ${c.jupiterHouse}वें भाव (${c.transitJupiterRashi}) एवं चन्द्रमा ${c.moonHouse}वें भाव में विराजमान हैं। ${base.hi}`;
    const en = `${salutation}, Name Rashi ${c.chandraRashi} wealth transit: Jupiter is in house ${c.jupiterHouse} from Name Moon and Moon in house ${c.moonHouse}. ${base.en}`;
    return tr(hi, en);
  }
  const hi = `${salutation}, आपके जन्म लग्न ${c.lagnaName} के धन (द्वितीय) व लाभ (एकादश) भाव का शुद्ध शास्त्रोक्त गोचर प्रभाव: धनकारक देवगुरु बृहस्पति आपकी जन्म राशि से ${c.jupiterHouse}वें भाव (${c.transitJupiterRashi}) में एवं चन्द्रमा ${c.moonHouse}वें भाव में संचार कर रहे हैं। आपके आत्मकारक ${c.atmakaraka} एवं अमात्यकारक ${c.amatyakaraka} के शुभ समन्वय से: ${base.hi}`;
  const en = `${salutation}, 2nd & 11th house financial transit analysis for ${c.lagnaName} Lagna: Wealth karaka Jupiter transits house ${c.jupiterHouse} (${c.transitJupiterRashi}) from your Moon while Moon occupies house ${c.moonHouse}. Guided by Atmakaraka ${c.atmakaraka} and Amatyakaraka ${c.amatyakaraka}: ${base.en}`;
  return tr(hi, en);
}

function buildPersonalizedHealthForecast(c: NativeTransitContext, tr: (hi: string, en: string) => string): string {
  let nadiGuidanceHi = 'प्रातः प्राणायाम (अनुलोम-विलोम), तिल तेल मालिश एवं गुनगुने जल का सेवन वात संतुलन हेतु उत्तम रहेगा।';
  let nadiGuidanceEn = 'Morning Anulom-Vilom Pranayama and warm hydration balance bodily elements.';
  if (c.nadi.includes('मध्य') || c.nadi.toLowerCase().includes('madhya')) {
    nadiGuidanceHi = 'शीतली व ओंकार प्राणायाम, चंदन तिलक, नारियल जल एवं पित्त-शामक सात्त्विक आहार उत्तम रहेगा।';
    nadiGuidanceEn = 'Sheetali Pranayama, sandalwood tilak, and Pitta-pacifying diet keep mental clarity peak.';
  } else if (c.nadi.includes('अन्त्य') || c.nadi.toLowerCase().includes('antya')) {
    nadiGuidanceHi = 'कपालभाति, तांबे के पात्र का जल, त्रिफला चूर्ण एवं सक्रिय दिनचर्या कफ संतुलन व प्राण-ऊर्जा उच्च रखेगी।';
    nadiGuidanceEn = 'Kapalbhati, copper-charged water, and active daily routine keep vitality and immunity high.';
  }

  const salutation = formatUserSalutation(c.userName, c.salutationPreference);

  if (c.isNameRashiMode) {
    const hi = `${salutation}, आपकी नाम राशि ${c.chandraRashi} एवं ${c.nadi} नाड़ी अनुसार नामांक स्वास्थ्य विचार: आज चन्द्रमा नाम राशि से ${c.moonHouse}वें भाव तथा सूर्यदेव ${c.sunHouse}वें भाव में हैं। ${nadiGuidanceHi} नाम स्वामी ${c.chandraRashiLord} का स्मरण आपकी आंतरिक स्फूर्ति बनाए रखेगा।`;
    const en = `${salutation} (Name Rashi ${c.chandraRashi}): Moon transits house ${c.moonHouse} and Sun in house ${c.sunHouse}. ${nadiGuidanceEn}`;
    return tr(hi, en);
  }

  const hi = `${salutation}, आपके जन्म लग्न ${c.lagnaName} (लग्नेश: ${c.lagnaLord}) एवं जन्म नाड़ी ${c.nadi} के अनुसार आरोग्य फल: आज चन्द्रमा जन्म राशि से ${c.moonHouse}वें भाव तथा आरोग्य कारक सूर्यदेव ${c.sunHouse}वें भाव में स्थित हैं। ${nadiGuidanceHi} प्रातः सूर्य देव को अर्घ्य एवं लग्नेश ${c.lagnaLord} का ध्यान आपकी रोग-प्रतिरोधक क्षमता सुदृढ़ रखेगा।`;
  const en = `${salutation}, health analysis for ${c.lagnaName} Lagna (Lord: ${c.lagnaLord}) and ${c.nadi} Nadi: Moon is in house ${c.moonHouse} and Sun in house ${c.sunHouse}. ${nadiGuidanceEn} Surya Arghya reinforces immunity.`;
  return tr(hi, en);
}

function buildPersonalizedFamilyForecast(c: NativeTransitContext, tr: (hi: string, en: string) => string): string {
  let ganaGuidanceHi = 'देव गण के सात्त्विक स्वभाव के कारण कुटुम्ब में शांति, सौहार्द व बड़ों के प्रति आदरभाव बना रहेगा।';
  let ganaGuidanceEn = 'Deva Gana disposition fosters peace, mutual respect, and elder blessings.';
  if (c.gana.includes('मनुष्य') || c.gana.toLowerCase().includes('manushya')) {
    ganaGuidanceHi = 'मनुष्य गण के व्यावहारिक एवं श्रमशील स्वभाव के कारण पारिवारिक उत्तरदायित्वों व गृहस्थ सुख का उत्तम समन्वय रहेगा।';
    ganaGuidanceEn = 'Manushya Gana nature promotes practical harmony and domestic coordination.';
  } else if (c.gana.includes('राक्षस') || c.gana.toLowerCase().includes('rakshasa')) {
    ganaGuidanceHi = 'राक्षस गण के साहसी स्वभाव के कारण परिजनों से वार्ता में विनम्रता व मधुर वाणी का प्रयोग संबंध सुदृढ़ रखेगा।';
    ganaGuidanceEn = 'Courageous temperament; polite speech fosters warm relationship bonding.';
  }

  const salutation = formatUserSalutation(c.userName, c.salutationPreference);

  if (c.isNameRashiMode) {
    const hi = `${salutation}, नाम राशि ${c.chandraRashi} के ${c.gana} गण अनुसार पारिवारिक सौख्य व दांपत्य विचार: देवगुरु बृहस्पति आपकी नाम राशि से ${c.jupiterHouse}वें भाव में गोचर कर रहे हैं। ${ganaGuidanceHi} नाम स्वामी ${c.chandraRashiLord} के शुभ प्रभाव से जीवनसाथी व परिजनों के साथ आत्मीय सामंजस्य एवं मांगलिक उत्सव का योग बना रहेगा।`;
    const en = `${salutation} (Name Rashi ${c.chandraRashi}): Devguru Jupiter transits house ${c.jupiterHouse} supporting domestic happiness and marital harmony. ${ganaGuidanceEn}`;
    return tr(hi, en);
  }

  const hi = `${salutation}, आपके जन्म नक्षत्र के ${c.gana} गण एवं चतुर्थ (सुख) व सप्तम (दांपत्य) भाव का गहन विश्लेषण: देवगुरु बृहस्पति आपकी जन्म राशि से ${c.jupiterHouse}वें भाव में शुभ दृष्टि डाल रहे हैं। आपकी सक्रिय जन्म महादशा ${c.activeMahadasha}-${c.activeAntardasha} के प्रभाववश: ${ganaGuidanceHi} जीवनसाथी का आत्मीय सहयोग, संबंधों में प्रगाढ़ता और मांगलिक पारिवारिक कार्यों में सफलता मिलेगी।`;
  const en = `${salutation}, family & marital harmony insight for ${c.gana} Gana: Devguru Jupiter transits house ${c.jupiterHouse} supporting domestic happiness. ${ganaGuidanceEn} Spouse coordination is favored under ${c.activeMahadasha}-${c.activeAntardasha} period.`;
  return tr(hi, en);
}

function buildPersonalizedRemedy(c: NativeTransitContext, tr: (hi: string, en: string) => string): string {
  const salutation = formatUserSalutation(c.userName, c.salutationPreference);

  if (c.isNameRashiMode) {
    const hi = `${salutation}, आपकी नाम राशि ${c.chandraRashi} (स्वामी: ${c.chandraRashiLord}) के अनिष्ट दोष शमन एवं शुभ फलों की प्राप्ति हेतु: नाम स्वामी के सिद्ध बीज मंत्र "${c.beejMantra}" का नित्य २७ या १०८ बार जप करें। नाम राशि अनुसार शुभ रत्न ${c.ratnaName} (उपरत्न: ${c.uparatnaName}) को ${c.ratnaMetalAndFinger} में धारण करना तथा ${c.rudraksha} कवच पहनना अत्यंत लाभप्रद है। नित्य ${c.ishtaDevta} का ध्यान करें एवं गौमाता को गुड़-रोटी का दान करें। शुभ रंग: ${c.luckyColors} • शुभ दिशा: ${c.luckyDirection}।`;
    const en = `${salutation} (Name Rashi ${c.chandraRashi}): Empower Name Lord ${c.chandraRashiLord}. Wear ${c.ratnaName} (${c.uparatnaName}) in ${c.ratnaMetalAndFinger} and ${c.rudraksha}. Chant "${c.beejMantra}" 108 times and offer Anna-Daan. Auspicious colors: ${c.luckyColors}.`;
    return tr(hi, en);
  }

  const hi = `${salutation}, आपके जन्म लग्नेश ${c.lagnaLord} को महाबली बनाने एवं सक्रिय जन्म महादशा ${c.activeMahadasha}-${c.activeAntardasha} के शुभ फलों की प्राप्ति हेतु: इष्टदेव (${c.ishtaDevta}) की नित्य पूजा करें। आपके जन्म लग्न ${c.lagnaName} हेतु शुभ रत्न ${c.ratnaName} (उपरत्न: ${c.uparatnaName}) को ${c.ratnaMetalAndFinger} में शुक्ल पक्ष में धारण करना अमृत समान फलदायी है। ${c.rudraksha} धारण करें, नित्य दशानाथ व लग्नेश बीज मंत्र "${c.beejMantra}" का १०८ बार जप करें तथा प्रातः सूर्य अर्घ्य व गौ-अन्न दान करें। शुभ रंग: ${c.luckyColors} • शुभ दिशा: ${c.luckyDirection}।`;
  const en = `${salutation}, targeted Vedic remedies to empower Lagna Lord ${c.lagnaLord} and align with ${c.activeMahadasha}-${c.activeAntardasha} Dasha: Worship Ishta Devta (${c.ishtaDevta}). Wear ${c.ratnaName} (${c.uparatnaName}) in ${c.ratnaMetalAndFinger}. Wear ${c.rudraksha}, chant "${c.beejMantra}" 108 times daily, and perform sacred Daan. Auspicious colors: ${c.luckyColors}.`;
  return tr(hi, en);
}

export const PersonalizedHomeHero: React.FC<PersonalizedHomeHeroProps> = ({
  currentUser,
  isLoggedIn,
  onOpenLoginModal,
  onSwitchUserAccount,
  onOpenJanamKundali,
  onOpenRashifal,
}) => {
  const { tr } = useLanguage();
  const isUserAuthenticated = Boolean(isLoggedIn || (currentUser && currentUser.phone));
  const [activeProfile, setActiveProfileState] = useState<FamilyMemberProfile | null>(null);
  const [vaultProfiles, setVaultProfiles] = useState<FamilyMemberProfile[]>([]);
  const [calcViewingMode, setCalcViewingMode] = useState<CalculationViewingMode>(getCalculationViewingMode);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(() => vedicAudio.getActiveSpeechId());
  const [todayPanchang, setTodayPanchang] = useState(() => getTodayPanchang(new Date()));
  const [istParts, setIstParts] = useState(() => getISTCalendarParts(new Date()));

  useEffect(() => {
    const handleModeChange = (e: CustomEvent<CalculationViewingMode> | Event) => {
      const mode = (e as CustomEvent).detail || getCalculationViewingMode();
      setCalcViewingMode(mode);
    };
    window.addEventListener('display_preference_changed', handleModeChange as EventListener);
    return () => {
      window.removeEventListener('display_preference_changed', handleModeChange as EventListener);
    };
  }, []);

  const loadData = () => {
    const all = getFamilyVaultProfiles(currentUser?.phone);
    setVaultProfiles(all);

    if (currentUser && currentUser.name) {
      const dob = currentUser.dob || '1996-03-10';
      const birthTime = currentUser.birthTime || '10:00';
      const birthPlace = currentUser.birthPlace || 'रुद्रपुर, उत्तराखण्ड';
      const vedic = deriveVedicDetailsForProfile(currentUser.name, dob, birthTime, birthPlace);
      const syncedProfile: FamilyMemberProfile = {
        id: currentUser.phone || 'mera-khata-user',
        name: currentUser.name,
        relation: 'self',
        gender: 'male',
        dob,
        birthTime,
        birthPlace,
        rashi: currentUser.rashi || vedic.rashi || 'कुंभ (Aquarius)',
        rashiLord: vedic.rashiLord || 'शनि (Saturn)',
        nakshatra: currentUser.nakshatra || vedic.nakshatra || 'शतभिषा (Shatabhisha)',
        nakshatraPada: vedic.nakshatraPada || 1,
        lagna: currentUser.lagna || vedic.lagna || 'वृषभ (Taurus)',
        isPrimary: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setActiveProfile(syncedProfile);
      setActiveProfileState(syncedProfile);
      return;
    }

    const current = getActiveProfile();
    if (current && current.name && current.id !== 'guest-default') {
      setActiveProfileState(current);
      return;
    }

    if (all.length > 0) {
      const primary = all.find((p) => p.isPrimary) || all[0];
      setActiveProfile(primary);
      setActiveProfileState(primary);
      return;
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.phone, currentUser?.name, currentUser?.dob, currentUser?.rashi, isLoggedIn]);

  useEffect(() => {
    loadData();
    const unsubSpeech = vedicAudio.subscribeSpeech((id) => setActiveSpeechId(id));
    const handleUpdate = () => loadData();
    const handleMidnightEvent = () => {
      const current = new Date();
      setTodayPanchang(getTodayPanchang(current));
      setIstParts(getISTCalendarParts(current));
    };

    window.addEventListener('panditji_vault_updated', handleUpdate);
    window.addEventListener('panditji_active_profile_updated', handleUpdate);
    window.addEventListener('panditji_midnight_refresh', handleMidnightEvent);

    let midnightTimer: number | null = null;
    const tickClock = () => {
      const current = new Date();
      const nextParts = getISTCalendarParts(current);
      setIstParts((prev) => {
        if (prev.dateKey !== nextParts.dateKey) {
          setTodayPanchang(getTodayPanchang(current));
          return nextParts;
        }
        if (prev.minutes !== nextParts.minutes) {
          return nextParts;
        }
        return prev;
      });
    };

    const scheduleMidnight = () => {
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      const msUntilMidnight = getMsUntilNextISTMidnight(new Date());
      midnightTimer = window.setTimeout(() => {
        const current = new Date();
        setTodayPanchang(getTodayPanchang(current));
        setIstParts(getISTCalendarParts(current));
        scheduleMidnight();
      }, msUntilMidnight);
    };

    scheduleMidnight();
    const intervalId = window.setInterval(tickClock, 15000);

    return () => {
      unsubSpeech();
      window.removeEventListener('panditji_vault_updated', handleUpdate);
      window.removeEventListener('panditji_active_profile_updated', handleUpdate);
      window.removeEventListener('panditji_midnight_refresh', handleMidnightEvent);
      window.clearInterval(intervalId);
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
    };
  }, []);

  // Master Parashari, Jaimini & Nadi Astrological Calculation (Refreshes at Midnight IST or Profile change)
  const astroData = useMemo(() => {
    const prof = currentUser
      ? {
          name: currentUser.name || 'यजमान',
          dob: currentUser.dob || '1996-03-10',
          birthTime: currentUser.birthTime || '10:00',
          birthPlace: currentUser.birthPlace || 'रुद्रपुर, उत्तराखण्ड',
        }
      : activeProfile || {
          name: 'Shashank',
          dob: '1996-03-10',
          birthTime: '10:00',
          birthPlace: 'रुद्रपुर, उत्तराखण्ड',
        };

    // 1. Native's Sidereal Birth Kundali (Lahiri Ayanamsa strictly calculated from DOB, Time, Place)
    const kundali = generateSampurnKundali(
      prof.name || 'यजमान',
      prof.dob || '1996-03-10',
      prof.birthTime || '10:00',
      prof.birthPlace || 'रुद्रपुर, उत्तराखण्ड'
    );

    const isNameRashiMode = calcViewingMode === 'name_rashi';

    // 2. Today's Rudrapur IST Sidereal Planetary Transits (Gochar)
    const drikPanchang = buildSingleDayPanchang(istParts.year, istParts.month, istParts.day, true);
    const gocharKundali = generateSampurnKundali(
      'रुद्रपुर दैनिक गोचर',
      istParts.dateKey,
      `${String(istParts.hours).padStart(2, '0')}:${String(istParts.minutes).padStart(2, '0')}`,
      'रुद्रपुर, उत्तराखण्ड'
    );

    const getGocharPlanet = (id: string) => gocharKundali.planets.find((p) => p.id === id);
    const transitMoon = getGocharPlanet('moon');
    const transitSun = getGocharPlanet('sun');
    const transitJupiter = getGocharPlanet('jupiter');
    const transitSaturn = getGocharPlanet('saturn');
    const transitMars = getGocharPlanet('mars');
    const transitRahu = getGocharPlanet('rahu');

    // 3. Separate Dedicated Calculations for Both Modes
    let moonRashiNum: number;
    let lagnaRashiNum: number;
    let resolvedRashiName: string;
    let resolvedRashiLord: string;
    let resolvedNakshatra: string;
    let resolvedLagnaName: string;
    let resolvedLagnaLord: string;
    let activeMahadasha: string;
    let activeAntardasha: string;
    let dashaPeriod: string;
    let ratnaName: string;
    let uparatnaName: string;
    let ratnaMetalAndFinger: string;
    let rudraksha: string;
    let beejMantra: string;
    let ishtaDevta: string;
    let luckyColors: string;
    let luckyNumbers: string;
    let luckyDirection: string;

    if (isNameRashiMode) {
      // MODE B: "नाम राशि अनुसार" (Name-sign derived phonetic calculation)
      const nameAstro = getVedicDetailsFromName(prof.name);
      const RASHI_NUM_MAP: Record<string, number> = {
        'मेष': 1, 'वृषभ': 2, 'मिथुन': 3, 'कर्क': 4, 'सिंह': 5, 'कन्या': 6,
        'तुला': 7, 'वृश्चिक': 8, 'धनु': 9, 'मकर': 10, 'कुंभ': 11, 'कुम्भ': 11, 'मीन': 12
      };
      const cleanRashiShort = nameAstro.rashi ? nameAstro.rashi.split(' ')[0] : 'कुंभ';
      const nameRashiInfo = NAME_RASHI_ASTRO_MAP[cleanRashiShort] || NAME_RASHI_ASTRO_MAP['कुंभ'];

      moonRashiNum = RASHI_NUM_MAP[cleanRashiShort] || 11;
      lagnaRashiNum = moonRashiNum; // Reference Lagna is set to Name Sign
      resolvedRashiName = nameAstro.rashi || 'कुंभ (Aquarius)';
      resolvedRashiLord = nameAstro.rashiLord || 'शनि (Saturn)';
      resolvedNakshatra = nameAstro.nakshatra || 'शतभिषा (Shatabhisha)';
      resolvedLagnaName = nameRashiInfo.lagnaName;
      resolvedLagnaLord = nameRashiInfo.lagnaLord;

      activeMahadasha = nameRashiInfo.activeDasha;
      activeAntardasha = nameRashiInfo.activeAntardasha;
      dashaPeriod = nameRashiInfo.dashaPeriod;

      ratnaName = nameRashiInfo.ratnaName;
      uparatnaName = nameRashiInfo.uparatnaName;
      ratnaMetalAndFinger = nameRashiInfo.ratnaMetalAndFinger;
      rudraksha = nameRashiInfo.rudraksha;
      beejMantra = nameRashiInfo.beejMantra;
      ishtaDevta = nameRashiInfo.ishtaDevta;
      luckyColors = nameRashiInfo.luckyColors;
      luckyNumbers = nameRashiInfo.luckyNumbers;
      luckyDirection = nameRashiInfo.luckyDirection;
    } else {
      // MODE A: "जन्मांक / कुंडली अनुसार" (Authentic Drik Ganit DOB Birth credentials calculation)
      moonRashiNum = kundali.panchang.moonRashiNumber;
      lagnaRashiNum = kundali.panchang.lagnaNumber;
      resolvedRashiName = kundali.panchang.moonRashiName;
      resolvedRashiLord = kundali.panchang.moonRashiLord;
      resolvedNakshatra = kundali.panchang.nakshatraName;
      resolvedLagnaName = kundali.panchang.lagnaName;
      resolvedLagnaLord = kundali.panchang.lagnaLord;

      const birthDasha =
        kundali.mahadashas.find((d) => d.isCurrent) || kundali.mahadashas[0];
      activeMahadasha = birthDasha?.planet || 'बृहस्पति';
      activeAntardasha = birthDasha?.currentAntardasha || 'शुक्र';
      dashaPeriod = birthDasha
        ? `${birthDasha.startDateDisplay} — ${birthDasha.endDateDisplay}`
        : 'सक्रिय जन्म काल';

      ratnaName = kundali.lucky.ratnaName;
      uparatnaName = kundali.lucky.uparatnaName;
      ratnaMetalAndFinger = kundali.lucky.ratnaMetalAndFinger;
      rudraksha = kundali.lucky.rudraksha;
      beejMantra = kundali.lucky.beejMantra;
      ishtaDevta = kundali.lucky.ishtaDevta;
      luckyColors = kundali.lucky.luckyColors;
      luckyNumbers = kundali.lucky.luckyNumbers;
      luckyDirection = kundali.lucky.luckyDirection;
    }

    const houseFromMoon = (rashiNum?: number) =>
      rashiNum ? ((rashiNum - moonRashiNum + 12) % 12) + 1 : 1;
    const houseFromLagna = (rashiNum?: number) =>
      rashiNum ? ((rashiNum - lagnaRashiNum + 12) % 12) + 1 : 1;

    const moonHouse = houseFromMoon(transitMoon?.rashiNumber);
    const jupiterHouse = houseFromMoon(transitJupiter?.rashiNumber);
    const saturnHouse = houseFromMoon(transitSaturn?.rashiNumber);
    const sunHouse = houseFromMoon(transitSun?.rashiNumber);
    const marsHouse = houseFromMoon(transitMars?.rashiNumber);
    const rahuHouse = houseFromMoon(transitRahu?.rashiNumber);
    const moonFromLagna = houseFromLagna(transitMoon?.rashiNumber);

    // Jaimini Atmakaraka & Amatyakaraka
    const sevenPlanets = kundali.planets
      .filter((p) => !['rahu', 'ketu'].includes(p.id))
      .slice()
      .sort((a, b) => b.degInt - a.degInt);
    const atmakaraka = sevenPlanets[0]?.hindiName || 'सूर्य';
    const amatyakaraka = sevenPlanets[1]?.hindiName || 'बृहस्पति';

    const context: NativeTransitContext = {
      userName: (currentUser?.name || prof.name || 'यजमान').trim(),
      salutationPreference: currentUser?.salutationPreference,
      isNameRashiMode,
      dob: prof.dob,
      lagnaName: resolvedLagnaName,
      lagnaLord: resolvedLagnaLord,
      chandraRashi: resolvedRashiName,
      chandraRashiLord: resolvedRashiLord,
      nakshatra: resolvedNakshatra,
      nakshatraPada: kundali.panchang.nakshatraPada || 1,
      nakshatraLord: kundali.panchang.nakshatraLord,
      nadi: kundali.panchang.nadi,
      gana: kundali.panchang.gana,
      activeMahadasha,
      activeAntardasha,
      dashaPeriod,
      atmakaraka,
      amatyakaraka,
      moonHouse,
      moonFromLagna,
      jupiterHouse,
      transitJupiterRashi: transitJupiter?.rashiName || 'वृषभ',
      saturnHouse,
      transitSaturnRashi: transitSaturn?.rashiName || 'कुम्भ',
      sunHouse,
      marsHouse,
      rahuHouse,
      ratnaName,
      uparatnaName,
      ratnaMetalAndFinger,
      rudraksha,
      beejMantra,
      ishtaDevta,
      luckyColors,
      luckyNumbers,
      luckyDirection,
    };

    const lagnaRashiEffect = buildPersonalizedLagnaRashiAnalysis(context, tr);
    const dashaGocharEffect = buildPersonalizedDashaGocharAnalysis(context, tr);
    const careerEffect = buildPersonalizedCareerForecast(context, tr);
    const financeEffect = buildPersonalizedFinanceForecast(context, tr);
    const healthEffect = buildPersonalizedHealthForecast(context, tr);
    const familyEffect = buildPersonalizedFamilyForecast(context, tr);
    const targetedRemedy = buildPersonalizedRemedy(context, tr);

    return {
      userName: (currentUser?.name || prof.name || 'यजमान').trim(),
      dob: kundali.input.formattedDob,
      birthTime: kundali.input.formattedTime,
      birthPlace: kundali.input.birthPlace,
      ayanamsa: kundali.input.ayanamsaDMS,
      lagnaName: resolvedLagnaName,
      lagnaLord: resolvedLagnaLord,
      lagnaDegree: kundali.panchang.lagnaDegreeDMS,
      chandraRashi: resolvedRashiName,
      chandraRashiLord: resolvedRashiLord,
      nakshatra: context.nakshatra,
      nakshatraPada: kundali.panchang.nakshatraPada,
      nakshatraLord: kundali.panchang.nakshatraLord,
      nadi: kundali.panchang.nadi,
      gana: kundali.panchang.gana,
      atmakaraka,
      amatyakaraka,
      activeMahadasha,
      activeAntardasha,
      dashaPeriod,
      dashaPrediction: isNameRashiMode
        ? `नाम राशि स्वामी ${resolvedRashiLord} के अनुकूल प्रभाव से जीवन में उन्नति।`
        : kundali.mahadashas.find((d) => d.isCurrent)?.prediction || '',
      sadeSatiStatus: `${kundali.doshaAnalysis.sadeSati.status} (${kundali.doshaAnalysis.sadeSati.phase})`,
      moonHouse,
      jupiterHouse,
      saturnHouse,
      rahuHouse,
      sunHouse,
      transitMoonRashi: transitMoon?.rashiName || 'मेष',
      transitJupiterRashi: transitJupiter?.rashiName || 'वृषभ',
      transitSaturnRashi: transitSaturn?.rashiName || 'कुम्भ',
      lagnaRashiEffect,
      dashaGocharEffect,
      careerEffect,
      financeEffect,
      healthEffect,
      familyEffect,
      ratnaName,
      uparatnaName,
      ratnaMetalAndFinger,
      rudraksha,
      beejMantra,
      ishtaDevta,
      luckyColors,
      luckyNumbers,
      luckyDirection,
      targetedRemedy,
      drikPanchang,
    };
  }, [activeProfile, currentUser, istParts.dateKey, calcViewingMode, tr]);

  // Requirement 1: If the user is logged out (guest mode), hide the personalized hero section entirely!
  // No guest login/signup prompt card above Panchang.
  if (!isUserAuthenticated || !currentUser) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1006] via-[#19120b] to-[#0d1322] border-2 border-[#d4af37] p-4 sm:p-6 lg:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.85)] space-y-5">
      {/* Decorative Vedic Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP HEADER: Personalized Vedic Greeting + Dual-Calculation Preference Switcher + Lagna / Rashi Badges */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-amber-800/50 pb-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 p-0.5 shadow-[0_0_25px_rgba(212,175,55,0.4)] flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#140b05] rounded-[14px] flex flex-col items-center justify-center text-yellow-300 font-extrabold">
              <span className="text-lg sm:text-xl font-vedic leading-none">
                {astroData.userName.charAt(0)}
              </span>
              <span className="text-[9px] text-amber-400 mt-0.5">कुंडली</span>
            </div>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-yellow-300 text-[10px] sm:text-xs font-bold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>
                  {calcViewingMode === 'name_rashi'
                    ? tr('नाम राशि गणना मोड सक्रिय', 'Name Rashi Driven Mode Active')
                    : tr('जन्मांक (दृक् गणित) शुद्ध गणना मोड सक्रिय', 'DOB Drik Ganit Mode Active')}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-bold">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>
                  {tr(
                    `रुद्रपुर (IST) सूर्योदय: ${todayPanchang.suryaUday}`,
                    `Rudrapur (IST) Sunrise: ${todayPanchang.suryaUday}`
                  )}
                </span>
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-extrabold font-vedic text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-400">
              {(() => {
                const greetingName = formatUserSalutation(
                  astroData.userName,
                  currentUser?.salutationPreference
                );
                return tr(
                  `प्रणाम, ${greetingName}! आपका आज का ५-स्तम्भीय शास्त्रोक्त गोचर एवं महादशा फल`,
                  `Pranaam, ${greetingName}! Your 5-Pillar Shastrokta Gochar & Mahadasha Forecast`
                );
              })()}
            </h2>

            {/* Birth Astro-Identity Strip: Lagna, Chandra Rashi, Nakshatra, Nadi (Respects User Preference Toggle) */}
            {currentUser?.showHeroAstroBadges !== false && currentUser?.displayPreference !== 'simple_devotee' && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] sm:text-xs animate-fadeIn">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-950/90 border border-amber-500/50 text-amber-100 font-bold">
                  🔱 {tr('लग्न:', 'Lagna:')} <strong className="text-yellow-300">{astroData.lagnaName}</strong> ({astroData.lagnaLord})
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950/90 border border-indigo-400/50 text-indigo-100 font-bold">
                  🌙 {tr('राशि:', 'Rashi:')} <strong className="text-yellow-300">{astroData.chandraRashi}</strong> ({astroData.chandraRashiLord})
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-purple-950/90 border border-purple-400/50 text-purple-100 font-bold">
                  ✨ {tr('नक्षत्र:', 'Nakshatra:')} <strong className="text-yellow-300">{astroData.nakshatra}</strong> (चरण {astroData.nakshatraPada})
                </span>
                {calcViewingMode === 'astronomical' && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-teal-950/90 border border-teal-500/40 text-teal-200 font-semibold">
                    📅 {astroData.dob} • {astroData.birthTime} ({astroData.birthPlace})
                  </span>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Controls: Sleek Dual-Calculation Switcher Toggle + Audio Readout */}
        <div className="flex flex-wrap items-center gap-2.5 self-start xl:self-center">
          {/* Gold-Themed Top-Header Preference Switcher Toggle */}
          <div className="flex items-center p-1 bg-slate-950/90 border border-amber-500/60 rounded-xl shadow-inner">
            <button
              type="button"
              onClick={() => setCalculationViewingMode('astronomical')}
              title="जन्मांक व जन्म विवरण (डीओबी) आधारित शुद्ध दृक् गणित गोचर"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                calcViewingMode === 'astronomical'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-amber-200/80 hover:text-amber-100 hover:bg-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>जन्मांक / कुंडली अनुसार</span>
            </button>

            <button
              type="button"
              onClick={() => setCalculationViewingMode('name_rashi')}
              title="प्रचलित नाम अक्षर / नाम राशि आधारित फलित"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                calcViewingMode === 'name_rashi'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-amber-200/80 hover:text-amber-100 hover:bg-slate-900'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>नाम राशि अनुसार</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const speechId = 'personalized-home-hero-speech';
              if (activeSpeechId !== speechId) {
                vedicAudio.playTempleBell(0.5);
              }
              vedicAudio.toggleSpeakText(
                `प्रणाम ${astroData.userName} जी। १. लग्नेश व राशि स्वामी विश्लेषण: ${astroData.lagnaRashiEffect} २. सक्रिय महादशा व गोचर: ${astroData.dashaGocharEffect} ३. करियर व धन योग: ${astroData.careerEffect} ४. पारिवारिक सौख्य: ${astroData.familyEffect} ५. शास्त्रोक्त वैदिक उपाय: ${astroData.targetedRemedy}`,
                speechId
              );
            }}
            className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSpeechId === 'personalized-home-hero-speech'
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg'
                : 'bg-slate-900/90 hover:bg-amber-950/60 border-amber-600/50 text-amber-200'
            }`}
          >
            {activeSpeechId === 'personalized-home-hero-speech' ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>{tr('रोकें', 'Stop')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
                <span>{tr('गोचर फल सुनें', 'Listen Forecast')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. ACTIVE VIMSHOTTARI MAHADASHA / ANTARDASHA & PLANETARY TRANSIT BANNER */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Cols: Active Mahadasha, Antardasha & Jaimini Karaka Analysis */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-950/90 to-indigo-950/60 border border-amber-500/50 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-extrabold text-yellow-300 uppercase tracking-wider">
                {tr(
                  'सक्रिय विंशोत्तरी महादशा • अंतर्दशा एवं जैमिनी विश्लेषण',
                  'Active Vimshottari Mahadasha • Antardasha & Jaimini Analysis'
                )}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-extrabold">
              ⏳ {astroData.activeMahadasha} महादशा • {astroData.activeAntardasha} अंतर्दशा
            </span>
          </div>

          <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed">
            <strong className="text-amber-300">दशा काल ({astroData.dashaPeriod}):</strong>{' '}
            {astroData.dashaPrediction}{' '}
            {tr(
              `जैमिनी सूत्र अनुसार आपके आत्मकारक ग्रह ${astroData.atmakaraka} एवं अमात्यकारक (करियर कारक) ${astroData.amatyakaraka} हैं।`,
              `Per Jaimini Sutras, your Atmakaraka is ${astroData.atmakaraka} and Amatyakaraka (Career significator) is ${astroData.amatyakaraka}.`
            )}
          </p>

          {/* Live Planetary Transit Positions Relative to User's Chandra Rashi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded-xl bg-black/50 border border-amber-700/40">
              <span className="text-amber-400 block font-semibold">🌙 चन्द्र गोचर</span>
              <span className="text-yellow-200 font-bold">
                {astroData.moonHouse}वां भाव ({astroData.transitMoonRashi})
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/50 border border-amber-700/40">
              <span className="text-amber-400 block font-semibold">🪐 गुरु गोचर</span>
              <span className="text-yellow-200 font-bold">
                {astroData.jupiterHouse}वां भाव ({astroData.transitJupiterRashi})
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/50 border border-amber-700/40">
              <span className="text-amber-400 block font-semibold">⚖️ शनि गोचर</span>
              <span className="text-yellow-200 font-bold">
                {astroData.saturnHouse}वां भाव ({astroData.transitSaturnRashi})
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/50 border border-amber-700/40">
              <span className="text-amber-400 block font-semibold">🔱 साढ़े साती/ढैय्या</span>
              <span className="text-emerald-300 font-bold truncate block">
                {astroData.sadeSatiStatus.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Targeted Vedic Remedies (Gemstone, Rudraksha & Mantra) */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-500/50 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-amber-800/40 pb-2">
              <span className="text-xs font-extrabold text-yellow-300 flex items-center gap-1.5">
                <Gem className="w-4 h-4 text-amber-400" />
                <span>
                  {tr(
                    'लग्नेश अनुसार शुभ रत्न, रुद्राक्ष एवं बीज मंत्र',
                    'Lagna Gemstone, Rudraksha & Beej Mantra'
                  )}
                </span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                इष्ट: {astroData.ishtaDevta.split(' ')[0]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-700/40">
                <span className="text-[10px] text-amber-400 block">💎 मुख्य रत्न (Gemstone):</span>
                <span className="font-extrabold text-yellow-300 block">{astroData.ratnaName}</span>
                <span className="text-[10px] text-amber-200/80 block truncate">
                  {astroData.ratnaMetalAndFinger}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-700/40">
                <span className="text-[10px] text-amber-400 block">📿 शुभ रुद्राक्ष एवं रंग:</span>
                <span className="font-extrabold text-emerald-300 block">{astroData.rudraksha}</span>
                <span className="text-[10px] text-amber-200/80 block truncate">
                  रंग: {astroData.luckyColors}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/60 border border-amber-600/40">
              <span className="text-[10px] font-bold text-amber-400 block">
                🕉️ लग्नेश एवं दशानाथ सिद्ध बीज मंत्र:
              </span>
              <span className="text-xs sm:text-sm font-extrabold font-vedic text-yellow-300 block mt-0.5">
                {astroData.beejMantra}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenJanamKundali}
              className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{tr('सम्पूर्ण कुंडली व PDF', 'Full Kundali & PDF')}</span>
            </button>
            <button
              type="button"
              onClick={onOpenRashifal}
              className="flex-1 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              <span>{tr('दैनिक/मासिक राशिफल', 'Daily/Monthly Rashifal')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. FIVE DEEPLY RESEARCHED ASTROLOGICAL PILLARS (DUGNI & SATEEK JANKARI) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Pillar 1: Lagna, Rashi Lord & Mental-Spiritual State */}
        <div className="p-3.5 rounded-2xl bg-slate-950/85 border border-amber-700/45 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>
                {tr(
                  '१. लग्नेश, राशि स्वामी एवं मानसिक-आध्यात्मिक स्थिति',
                  '1. Lagna, Rashi Lord & Mental-Spiritual State'
                )}
              </span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-yellow-300 font-bold whitespace-nowrap">
              {astroData.lagnaLord.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">{astroData.lagnaRashiEffect}</p>
        </div>

        {/* Pillar 2: Active Vimshottari Mahadasha/Antardasha & Subtle Gochar Transit Impact */}
        <div className="p-3.5 rounded-2xl bg-slate-950/85 border border-sky-700/45 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-extrabold text-sky-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span>
                {tr(
                  '२. सक्रिय विंशोत्तरी महादशा/अंतर्दशा एवं गोचर ग्रहों का सूक्ष्म प्रभाव',
                  '2. Active Dasha/Antardasha & Subtle Gochar Impact'
                )}
              </span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold whitespace-nowrap">
              {astroData.activeMahadasha}-{astroData.activeAntardasha}
            </span>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">{astroData.dashaGocharEffect}</p>
        </div>

        {/* Pillar 3: Career, Livelihood, Business & Wealth Yoga */}
        <div className="p-3.5 rounded-2xl bg-slate-950/85 border border-emerald-700/45 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>
                {tr(
                  '३. करियर, आजीविका, व्यवसाय एवं धन योग',
                  '3. Career, Livelihood, Business & Wealth Yoga'
                )}
              </span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold whitespace-nowrap">
              अंक: {astroData.luckyNumbers}
            </span>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">{astroData.careerEffect}</p>
        </div>

        {/* Pillar 4: Family Harmony, Marital Life & Relationships */}
        <div className="p-3.5 rounded-2xl bg-slate-950/85 border border-rose-700/45 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-extrabold text-rose-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span>
                {tr(
                  '४. पारिवारिक सौख्य, दांपत्य जीवन एवं संबंध',
                  '4. Family Harmony, Marital Life & Relationships'
                )}
              </span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold whitespace-nowrap">
              गुरु {astroData.jupiterHouse}वें भाव
            </span>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">{astroData.familyEffect}</p>
        </div>
      </div>

      {/* 4. FIFTH PILLAR & BOTTOM STRIP: Precise Vedic Remedies, Special Mantra Jaap, Gemstone-Rudraksha & Daan Vidhan */}
      <div className="relative z-10 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#1f1308] to-amber-950/80 border border-amber-500/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Flame className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-100 leading-relaxed">
            <strong className="text-yellow-300">
              {tr(
                '५. शास्त्रोक्त वैदिक उपाय, विशेष मंत्र जप, रत्न-रुद्राक्ष एवं दान विधान:',
                '5. Precise Vedic Remedies, Mantras, Gemstone-Rudraksha & Daan Guidance:'
              )}
            </strong>{' '}
            {astroData.targetedRemedy}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold">
            ✨ अभिजित मुहूर्त: {todayPanchang.abhijitMuhurat.replace(/\s*\(.*\)/, '')}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-950/90 border border-rose-500/50 text-rose-300 font-bold">
            ⚠️ राहुकाल: {todayPanchang.rahuKaal}
          </span>
        </div>
      </div>
    </div>
  );
};
