export interface RashiInfo {
  id: string;
  hindiName: string;
  englishName: string;
  fullLabel: string;
  nakshatra: string;
  symbol: string;
  colorBg: string;
  lord: string;
  gocharTitle: string;
  gocharBody: (userName: string) => string;
  luckyColor: string;
  luckyNumber: string;
  remedy: string;
}

export const RASHIS: RashiInfo[] = [
  {
    id: 'mesh',
    hindiName: 'मेष',
    englishName: 'Aries',
    fullLabel: 'मेष (ARIES)',
    nakshatra: 'अश्विनी (ASHWINI)',
    symbol: '♈',
    colorBg: 'bg-red-500',
    lord: 'मंगल (Mars)',
    gocharTitle: 'पराक्रम एवं राज्य भाव में शुभ गोचर - कार्यक्षेत्र में उन्नति व सम्मान',
    gocharBody: (name) =>
      `ओ३म् श्री गणेशाय नमः! ${name} जी (मेष (Aries) राशि), आज गोचर अनुसार आत्मबल व कार्यक्षमता उच्च रहेगी। रुके हुए शासकीय व व्यापारिक कार्यों में सफलता मिलेगी तथा वरिष्ठजनों का पूर्ण सहयोग प्राप्त होगा।`,
    luckyColor: 'सिंदूरी लाल व केसरिया',
    luckyNumber: '9, 1',
    remedy: 'हनुमान चालीसा का पाठ करें एवं गुड़-चने का भोग लगाएं।',
  },
  {
    id: 'vrishabh',
    hindiName: 'वृषभ',
    englishName: 'Taurus',
    fullLabel: 'वृषभ (TAURUS)',
    nakshatra: 'रोहिणी (ROHINI)',
    symbol: '♉',
    colorBg: 'bg-orange-500',
    lord: 'शुक्र (Venus)',
    gocharTitle: 'धन एवं लक्ष्मी भाव में शुभ दृष्टि - आर्थिक लाभ व सुख-सुविधा में वृद्धि',
    gocharBody: (name) =>
      `ओ३म् श्री गणेशाय नमः! ${name} जी (वृषभ (Taurus) राशि), आज शुक्र व चंद्रमा की शुभ स्थिति से आर्थिक पक्ष सुदृढ़ होगा। परिवार में मांगलिक कार्य की रूपरेखा बनेगी और निवेश से उत्तम लाभ के योग हैं।`,
    luckyColor: 'सफेद व हल्का गुलाबी',
    luckyNumber: '6, 2',
    remedy: 'माँ लक्ष्मी को खीर या मिश्री का भोग अर्पित करें।',
  },
  {
    id: 'mithun',
    hindiName: 'मिथुन',
    englishName: 'Gemini',
    fullLabel: 'मिथुन (GEMINI)',
    nakshatra: 'मृगशिरा (MRIGASHIRA)',
    symbol: '♊',
    colorBg: 'bg-amber-500',
    lord: 'बुध (Mercury)',
    gocharTitle: 'बुद्धि व संवाद भाव में श्रेष्ठ योग - व्यापारिक अनुबंध व नई उपलब्धि',
    gocharBody: (name) =>
      `ओ३म् श्री गणेशाय नमः! ${name} जी (मिथुन (Gemini) राशि), आज आपकी बौद्धिक कुशलता और वाणी के प्रभाव से जटिल कार्य भी सरलता से पूर्ण होंगे। मित्रों एवं सहयोगियों से विशेष लाभ प्राप्त होगा।`,
    luckyColor: 'हरा व पीला',
    luckyNumber: '5, 3',
    remedy: 'श्री गणेश जी को दूर्वा अर्पित करें एवं "ॐ बुं बुधाय नमः" का जप करें।',
  },
  {
    id: 'kark',
    hindiName: 'कर्क',
    englishName: 'Cancer',
    fullLabel: 'कर्क (CANCER)',
    nakshatra: 'पुष्य (PUSHYA)',
    symbol: '♋',
    colorBg: 'bg-yellow-500',
    lord: 'चंद्र (Moon)',
    gocharTitle: 'सुख एवं भाग्य भाव में चंद्र बल - मानसिक शांति व संपत्ति लाभ',
    gocharBody: (name) =>
      `ओ३म् श्री गणेशाय नमः! ${name} जी (कर्क (Cancer) राशि), आज मन प्रसन्न रहेगा एवं पारिवारिक सौहार्द बढ़ेगा। भूमि, भवन या वाहन से संबंधित प्रयास सफल होंगे और माता का आशीर्वाद फलीभूत होगा।`,
    luckyColor: 'दूधिया सफेद व क्रीम',
    luckyNumber: '2, 7',
    remedy: 'भगवान शिव का कच्चे दूध व जल से अभिषेक करें।',
  },
  {
    id: 'simha',
    hindiName: 'सिंह',
    englishName: 'Leo',
    fullLabel: 'सिंह (LEO)',
    nakshatra: 'मघा (MAGHA)',
    symbol: '♌',
    colorBg: 'bg-yellow-400',
    lord: 'सूर्य (Sun)',
    gocharTitle: 'तेज व नेतृत्व भाव में सूर्य कृपा - पद-प्रतिष्ठा एवं राजकीय लाभ',
    gocharBody: (name) =>
      `ओ३म् श्री गणेशाय नमः! ${name} जी (सिंह (Leo) राशि), आज नेतृत्व क्षमता में वृद्धि होगी। समाज व कार्यस्थल पर आपके निर्णयों की सराहना होगी तथा नई जिम्मेदारी या पदोन्नति के प्रबल योग हैं।`,
    luckyColor: 'सुनहरा व नारंगी',
    luckyNumber: '1, 5',
    remedy: 'प्रातः तांबे के लोटे से सूर्य देव को अर्घ्य दें।',
  },
  {
    id: 'kanya',
    hindiName: 'कन्या',
    englishName: 'Virgo',
    fullLabel: 'कन्या (VIRGO)',
    nakshatra: 'हस्त (HASTA)',
    symbol: '♍',
    colorBg: 'bg-emerald-500',
    lord: 'बुध (Mercury)',
    gocharTitle: 'भाग्य एवं धर्म भाव में शुभ संयोग - कार्य सिद्धि व आकस्मिक धन लाभ',
    gocharBody: (name) =>
      `ओ३म् श्री गणेशाय नमः! ${name} जी (कन्या (Virgo) राशि), आज योजनाबद्ध कार्यों में बड़ी सफलता मिलेगी। शिक्षा, लेखन एवं व्यापार से जुड़े जातकों के लिए आज का दिन विशेष उपलब्धिदायक रहेगा।`,
    luckyColor: 'पन्ना हरा व सफेद',
    luckyNumber: '5, 6',
    remedy: 'गौ माता को हरा चारा खिलाएं एवं गणेश अथर्वशीर्ष का पाठ करें।',
  },
  {
    id: 'tula',
    hindiName: 'तुला',
    englishName: 'Libra',
    fullLabel: 'तुला (LIBRA)',
    nakshatra: 'स्वाति (SWATI)',
    symbol: '♎',
    colorBg: 'bg-teal-500',
    lord: 'शुक्र (Venus)',
    gocharTitle: 'साझेदारी व ऐश्वर्य भाव में शुभत्व - दाम्पत्य सुख व आर्थिक उन्नति',
    gocharBody: (name) =>
      `ओ३म् श्री गणेशाय नमः! ${name} जी (तुला (Libra) राशि), आज जीवनसाथी व व्यापारिक साझेदारों से पूर्ण सहयोग मिलेगा। कला, व्यापार और न्यायिक मामलों में अनुकूल परिणाम प्राप्त होंगे।`,
    luckyColor: 'चमकीला सफेद व आसमानी',
    luckyNumber: '6, 9',
    remedy: 'श्री सूक्त का पाठ करें एवं मंदिर में कपूर का दीपक जलाएं।',
  },
  {
    id: 'vrishchik',
    hindiName: 'वृश्चिक',
    englishName: 'Scorpio',
    fullLabel: 'वृश्चिक (SCORPIO)',
    nakshatra: 'अनुराधा (ANURADHA)',
    symbol: '♏',
    colorBg: 'bg-red-600',
    lord: 'मंगल (Mars)',
    gocharTitle: 'लाभ एवं कर्म भाव में शुभ गोचर - आय के नए स्रोत व यश',
    gocharBody: (name) =>
      `ओ३म् श्री गणेशाय नमः! ${name} जी, आपकी वृश्चिक (Scorpio) राशि पर ग्रहों की विशेष कृपा दृष्टि है। आय के नवीन स्रोत खुलेंगे, व्यापार में बड़ा ऑर्डर मिल सकता है और पारिवारिक जीवन में सुख शांति रहेगी।`,
    luckyColor: 'केसरिया लाल व पीला',
    luckyNumber: '9, 3',
    remedy: 'हनुमान जी को सिंदूर व चमेली का तेल अर्पित करें।',
  },
  {
    id: 'dhanu',
    hindiName: 'धनु',
    englishName: 'Sagittarius',
    fullLabel: 'धनु (SAGITTARIUS)',
    nakshatra: 'मूल (MOOLA)',
    symbol: '♐',
    colorBg: 'bg-amber-400',
    lord: 'बृहस्पति (Jupiter)',
    gocharTitle: 'गुरु कृपा से धर्म व कर्म में उत्कर्ष - आध्यात्मिक तेज व धन वृद्धि',
    gocharBody: (name) =>
      `ओ३म् श्री गणेशाय नमः! ${name} जी (धनु (Sagittarius) राशि), देवगुरु बृहस्पति की शुभ दृष्टि से आपके ज्ञान, सम्मान और आर्थिक कोष में वृद्धि होगी। धार्मिक यात्रा या शुभ संकल्प पूर्ण होगा।`,
    luckyColor: 'पीला व सुनहरा',
    luckyNumber: '3, 9',
    remedy: 'भगवान श्री हरि विष्णु को पीले पुष्प व चने की दाल अर्पित करें।',
  },
  {
    id: 'makar',
    hindiName: 'मकर',
    englishName: 'Capricorn',
    fullLabel: 'मकर (CAPRICORN)',
    nakshatra: 'श्रवण (SHRAVANA)',
    symbol: '♑',
    colorBg: 'bg-blue-500',
    lord: 'शनि (Saturn)',
    gocharTitle: 'कर्म एवं स्थायित्व भाव में प्रबल योग - परिश्रम का पूर्ण सुफल',
    gocharBody: (name) =>
      `ओ३म् श्री गणेशाय नमः! ${name} जी (मकर (Capricorn) राशि), आज आपके धैर्य व कठिन परिश्रम का श्रेष्ठ फल प्राप्त होगा। स्थायी संपत्ति, निर्माण व तकनीकी कार्यों में विशेष लाभ के योग हैं।`,
    luckyColor: 'नीला व गहरा हरा',
    luckyNumber: '8, 4',
    remedy: 'पीपल के वृक्ष के नीचे सरसों के तेल का दीपक जलाएं एवं शनि मंत्र जपें।',
  },
  {
    id: 'kumbh',
    hindiName: 'कुंभ',
    englishName: 'Aquarius',
    fullLabel: 'कुंभ (AQUARIUS)',
    nakshatra: 'शतभिषा (SHATABHISHA)',
    symbol: '♒',
    colorBg: 'bg-indigo-500',
    lord: 'शनि (Saturn)',
    gocharTitle: 'धन व वाणी भाव में गोचर - आर्थिक प्रगति व पारिवारिक सहयोग',
    gocharBody: (name) =>
      `प्रिय ${name} जी (कुंभ (Aquarius) राशि), आज गोचर अनुसार धन और कुटुंब भाव अत्यंत प्रबल है। आपकी मधुर वाणी से अटके हुए कार्य बनेंगे। व्यापारिक लेन-देन में लाभ तथा संचित कोष में वृद्धि के स्पष्ट योग हैं।`,
    luckyColor: 'आसमानी नीला व बैंगनी',
    luckyNumber: '8, 6',
    remedy: 'ॐ शं शनैश्चराय नमः का 27 बार जप करें एवं निर्धनों की सहायता करें।',
  },
  {
    id: 'meen',
    hindiName: 'मीन',
    englishName: 'Pisces',
    fullLabel: 'मीन (PISCES)',
    nakshatra: 'रेवती (REVATI)',
    symbol: '♓',
    colorBg: 'bg-yellow-500',
    lord: 'बृहस्पति (Jupiter)',
    gocharTitle: 'लग्न व भाग्य भाव में सात्विक ऊर्जा - रचनात्मक सफलता व सुख-समृद्धि',
    gocharBody: (name) =>
      `ओ३म् श्री गणेशाय नमः! ${name} जी (मीन (Pisces) राशि), आज आध्यात्मिक शांति और भाग्य का पूरा साथ मिलेगा। संतान पक्ष से शुभ समाचार प्राप्त होगा तथा रुका हुआ धन वापस मिलने के प्रबल योग हैं।`,
    luckyColor: 'केसरिया पीला व सफेद',
    luckyNumber: '3, 7',
    remedy: 'मस्तक पर केसर या हल्दी का तिलक लगाएं एवं विष्णु सहस्रनाम पढ़ें।',
  },
];

export type FacilityCategory = 'all' | 'jyotish' | 'panchang' | 'dharm' | 'seva';

export interface AppFacilityItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  category: FacilityCategory;
  themeColor: 'amber' | 'emerald' | 'rose' | 'indigo' | 'cyan' | 'purple';
  iconName: string;
}

export const APP_FACILITIES: AppFacilityItem[] = [
  {
    id: 'mandir',
    title: 'श्री डिजिटल मंदिर (नित्य दर्शन व साधना)',
    badge: 'अखण्ड ज्योति व घंटी',
    description: 'वार अनुसार अधिष्ठाता देव दर्शन, अखण्ड ज्योति प्रज्वलन, घंटी नाद व पुष्पांजलि अर्पण।',
    category: 'panchang',
    themeColor: 'amber',
    iconName: 'landmark',
  },
  {
    id: 'rashifal',
    title: 'दैनिक राशिफल एवं 12 राशियां',
    badge: 'गोचर फल व उपाय',
    description: 'मेष से मीन तक सभी 12 राशियों का आज का सटीक राशिफल, शुभ रंग, अंक व वैदिक उपाय।',
    category: 'jyotish',
    themeColor: 'amber',
    iconName: 'sun',
  },
  {
    id: 'kundali',
    title: 'सम्पूर्ण जन्म कुंडली',
    badge: 'निःशुल्क चार्ट',
    description: 'लग्न, नवमांश, चंद्र कुंडली, ग्रह स्पष्ट व विंशोत्तरी महादशा फल तुरंत बनाएं।',
    category: 'jyotish',
    themeColor: 'emerald',
    iconName: 'compass',
  },
  {
    id: 'gun-milan',
    title: '३६ गुण मिलान (वर-कन्या)',
    badge: 'निःशुल्क मिलान',
    description: 'अष्टकूट मिलान, नाड़ी दोष, भकूट दोष व मांगलिक परिहार विचार।',
    category: 'jyotish',
    themeColor: 'rose',
    iconName: 'heart',
  },
  {
    id: 'panchang-detail',
    title: 'मासिक पंचांग व आज का विवरण',
    badge: 'कैलेंडर व चौघड़िया',
    description: 'मासिक हिन्दू कैलेंडर, आज की सम्पूर्ण जानकारी, चौघड़िया व शुभ मुहूर्त।',
    category: 'panchang',
    themeColor: 'amber',
    iconName: 'calendar',
  },
  {
    id: 'shani-sade-sati',
    title: 'शनि साढ़े साती व ढैय्या जांच',
    badge: 'गोचर कैलकुलेटर',
    description: '१२ राशियों का शनि गोचर, उदय-शिखर-अस्त चरण व दशरथ कृत शनि स्तोत्र उपाय।',
    category: 'jyotish',
    themeColor: 'indigo',
    iconName: 'clock',
  },
  {
    id: 'ram-shalaka',
    title: 'श्री राम शलाका प्रश्नावली',
    badge: 'मानस १५×१५ चक्र',
    description: 'गोस्वामी तुलसीदास कृत रामचरितमानस चौपाई से तुरंत ईश्वरीय मार्गदर्शन प्राप्त करें।',
    category: 'panchang',
    themeColor: 'amber',
    iconName: 'target',
  },
  {
    id: 'jap-mala',
    title: '१०८ मंत्र जप माला काउंटर',
    badge: '१०८ मनके व ध्वनि',
    description: 'रुद्राक्ष/तुलसी माला, शंख व मंदिर घंटी नाद सहित नित्य साधना काउंटर।',
    category: 'panchang',
    themeColor: 'amber',
    iconName: 'flame',
  },
  {
    id: 'jyotish-chat',
    title: 'पण्डित शशांक AI परामर्श',
    badge: '२४×७ निःशुल्क चैट',
    description: 'तार्किक वैदिक समाधान, शंका निवारण, शुभ मुहूर्त व शास्त्रोक्त पूजा मार्गदर्शन।',
    category: 'seva',
    themeColor: 'cyan',
    iconName: 'message-circle',
  },
  {
    id: 'puja-samagri',
    title: 'पूजा सामग्री चेकलिस्ट',
    badge: 'बाज़ार लिस्ट',
    description: 'सत्यनारायण, रुद्राभिषेक, गृह प्रवेश सामग्री टिक-मार्क व व्हाट्सऐप शेयर।',
    category: 'seva',
    themeColor: 'emerald',
    iconName: 'clipboard-list',
  },
  {
    id: 'aarti-chalisa',
    title: 'आरती, चालीसा व स्तोत्र कोष',
    badge: 'ऑडियो वाचन सहित',
    description: 'हनुमान चालीसा, शिव तांडव, गणेश, लक्ष्मी व दुर्गा आरती संग्रह।',
    category: 'dharm',
    themeColor: 'amber',
    iconName: 'book-open',
  },
  {
    id: 'vastu-shastra',
    title: 'गृह वास्तु शास्त्र एवं नियम',
    badge: 'बिना तोड़-फोड़ उपाय',
    description: 'ईशान कोण, मुख्य द्वार, रसोई व सुख-समृद्धि के १० सरल वास्तु नियम।',
    category: 'dharm',
    themeColor: 'emerald',
    iconName: 'compass',
  },
  {
    id: 'navratna-rudraksha',
    title: 'नवरत्न व रुद्राक्ष विज्ञान',
    badge: 'रत्न व रुद्राक्ष',
    description: 'राशि अनुसार रत्न, धातु, उंगली व १ से १४ मुखी रुद्राक्ष धारण विधि।',
    category: 'dharm',
    themeColor: 'purple',
    iconName: 'star',
  },
  {
    id: 'swarodaya',
    title: 'स्वरोदय विज्ञान (स्वर शास्त्र)',
    badge: 'सूर्य-चंद्र स्वर',
    description: 'सूर्य व चंद्र स्वर पहचान, कार्य सिद्धि व प्रातः कदम रखने का रहस्य।',
    category: 'dharm',
    themeColor: 'cyan',
    iconName: 'wind',
  },
  {
    id: 'swapna-phal',
    title: 'स्वप्न फल व अंग लक्षण',
    badge: 'शकुन शास्त्र',
    description: 'शुभ-अशुभ सपनों का अर्थ व आंख/अंग फड़कने का शास्त्रोक्त विचार।',
    category: 'dharm',
    themeColor: 'indigo',
    iconName: 'moon',
  },
  {
    id: 'video-satsang',
    title: 'यूट्यूब वीडियो व कथा सत्संग',
    badge: 'वीडियो लाइब्रेरी',
    description: 'पण्डित जी के प्रामाणिक कथा, आरती व वैदिक पूजन वीडियो प्रवचन।',
    category: 'dharm',
    themeColor: 'rose',
    iconName: 'youtube',
  },
  {
    id: 'khata',
    title: 'मेरा खाता एवं सुरक्षित हिस्ट्री',
    badge: 'निजी रिकॉर्ड',
    description: 'आपके मंत्र जप रिकॉर्ड, सहेजी गई जन्म कुंडलियां व मिलान हिस्ट्री।',
    category: 'seva',
    themeColor: 'emerald',
    iconName: 'history',
  },
  {
    id: 'puja-booking',
    title: 'वैदिक पूजा एवं अनुष्ठान बुकिंग',
    badge: 'वैदिक कर्मकाण्ड',
    description: 'गृह प्रवेश, सत्यनारायण कथा, महा रुद्राभिषेक व शांति हवन बुकिंग।',
    category: 'seva',
    themeColor: 'amber',
    iconName: 'tag',
  },
];

export interface SacredTextItem {
  id: string;
  title: string;
  category: string;
  deity: string;
  verses: string[];
  meaning: string;
}

export const SACRED_TEXTS: SacredTextItem[] = [
  {
    id: 'ganesh-aarti',
    title: 'श्री गणेश जी की आरती (जय गणेश जय गणेश देवा)',
    category: 'आरती संग्रह',
    deity: 'विघ्नहर्ता श्री गणेश जी',
    verses: [
      'जय गणेश जय गणेश, जय गणेश देवा । माता जाकी पार्वती, पिता महादेवा ॥',
      'एक दन्त दयावन्त, चार भुजा धारी । माथे सिन्दूर सोहे, मूसे की सवारी ॥',
      'अन्धन को आंख देत, कोढ़िन को काया । बांझन को पुत्र देत, निर्धन को माया ॥',
      'पान चढ़े फूल चढ़े, और चढ़े मेवा । लड्डुअन का भोग लगे, सन्त करें सेवा ॥',
      'दीनन की लाज रखो, शम्भु सुतकारी । कामना को पूर्ण करो, जाऊं बलिहारी ॥',
    ],
    meaning: 'प्रथम पूज्य भगवान श्री गणेश के स्मरण व आरती से समस्त विघ्नों का नाश होता है और घर में ऋद्धि-सिद्धि का वास होता है।',
  },
  {
    id: 'hanuman-chalisa',
    title: 'श्री हनुमान चालीसा (जय हनुमान ज्ञान गुन सागर)',
    category: 'चालीसा पाठ',
    deity: 'संकटमोचन श्री हनुमान जी',
    verses: [
      'दोहा: श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि । बरनउँ रघुबर बिमल जसु, जो दायक फल चारि ॥',
      'जय हनुमान ज्ञान गुन सागर । जय कपीस तिहुँ लोक उजागर ॥',
      'राम दूत अतुलित बल धामा । अंजनि-पुत्र पवनसुत नामा ॥',
      'महाबीर बिक्रम बजरंगी । कुमति निवार सुमति के संगी ॥',
      'संकट कटै मिटै सब पीरा । जो सुमिरै हनुमत बलबीरा ॥',
      'अष्ट सिद्धि नौ निधि के दाता । अस बर दीन जानकी माता ॥',
    ],
    meaning: 'हनुमान चालीसा के नित्य पाठ से भय, ग्रह पीड़ा, शनि दोष और समस्त संकटों का निवारण होता है।',
  },
  {
    id: 'shiv-tandav',
    title: 'शिव पञ्चाक्षर एवं महामृत्युंजय स्तोत्रम्',
    category: 'स्तोत्र कोष',
    deity: 'देवाधिदेव महादेव',
    verses: [
      'नागेन्द्रहाराय त्रिलोचनाय भस्माङ्गरागाय महेश्वराय । नित्याय शुद्धाय दिगम्बराय तस्मै नकाराय नमः शिवाय ॥',
      'मन्दाकिनीसलिलचन्दनचर्चिताय नन्दीश्वरप्रमथनाथमहेश्वराय । मन्दारपुष्पबहुपुष्पसुपूजिताय तस्मै मकाराय नमः शिवाय ॥',
      'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात् ॥',
    ],
    meaning: 'भगवान आशुतोष शिव के पञ्चाक्षर स्तोत्र व महामृत्युंजय मंत्र से आरोग्य, दीर्घायु और अकाल मृत्यु भय से रक्षा होती है।',
  },
  {
    id: 'lakshmi-suktam',
    title: 'श्री महालक्ष्मी आरती एवं श्री सूक्तम् मंत्र',
    category: 'आरती संग्रह',
    deity: 'माँ महालक्ष्मी',
    verses: [
      'ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता । तुमको निशिदिन सेवत, हर विष्णु विधाता ॥',
      'उमा रमा ब्रह्माणी, तुम ही जग माता । सूर्य चन्द्रमा ध्यावत, नारद ऋषि गाता ॥',
      'ॐ हिरण्यवर्णां हरिणीं सुवर्णरजतस्रजाम् । चन्द्रां हिरण्मयीं लक्ष्मीं जातवेदो म आवह ॥',
    ],
    meaning: 'शुक्रवार एवं प्रदोष काल में माँ महालक्ष्मी की आरती व श्री सूक्त पाठ से अखंड धन-धान्य एवं सौभाग्य की प्राप्ति होती है।',
  },
];

export const RAM_SHALAKA_CHAUPAIS = [
  {
    chaupai: 'सुनु सिय सत्य असीस हमारी। पूजिहि मन कामना तुम्हारी॥',
    kand: 'बालकाण्ड (श्री रामचरितमानस)',
    result: 'अति उत्तम फल — कार्य निश्चित सिद्ध होगा',
    guidance: 'माँ गौरी के आशीर्वाद के समान आपका मनोरथ पूर्ण होगा। पूर्ण श्रद्धा से कार्य प्रारंभ करें।',
  },
  {
    chaupai: 'प्रबिसि नगर कीजे सब काजा। हृदयँ राखि कोसलपुर राजा॥',
    kand: 'सुन्दरकाण्ड (श्री रामचरितमानस)',
    result: 'श्रेष्ठ सफलता — प्रभु स्मरण कर आगे बढ़ें',
    guidance: 'भगवान श्री सीताराम को हृदय में धारण कर कार्य प्रारंभ करें, प्रत्येक कदम पर सफलता मिलेगी।',
  },
  {
    chaupai: 'होइहि सोइ जो राम रचि राखा। को करि तर्क बढ़ावै साखा॥',
    kand: 'बालकाण्ड (श्री रामचरितमानस)',
    result: 'धैर्य रखें — ईश्वर की इच्छा में ही कल्याण है',
    guidance: 'अनावश्यक चिंता त्यागें और भगवान शिव व श्री राम पर विश्वास रखें, शीघ्र ही अनुकूल समय आएगा।',
  },
  {
    chaupai: 'मंगल भवन अमंगल हारी। द्रवउ सो दसरथ अजिर बिहारी॥',
    kand: 'बालकाण्ड (श्री रामचरितमानस)',
    result: 'मंगलकारी योग — समस्त विघ्न दूर होंगे',
    guidance: 'आपके परिवार और कार्यक्षेत्र में शुभता का संचार होने वाला है। नित्य हनुमान चालीसा का पाठ करें।',
  },
];
