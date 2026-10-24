import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AppLanguage = 'hi' | 'en' | 'hinglish' | 'mr' | 'gu';

export interface LanguageOption {
  code: AppLanguage;
  nativeLabel: string;
  englishLabel: string;
  shortBadge: string;
  greeting: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'hi',
    nativeLabel: 'हिन्दी',
    englishLabel: 'Hindi',
    shortBadge: 'हिन्दी',
    greeting: 'राधे राधे',
  },
  {
    code: 'en',
    nativeLabel: 'English',
    englishLabel: 'English',
    shortBadge: 'EN',
    greeting: 'Radhe Radhe',
  },
  {
    code: 'hinglish',
    nativeLabel: 'Hinglish',
    englishLabel: 'Hindi + English',
    shortBadge: 'Hinglish',
    greeting: 'Radhe Radhe',
  },
  {
    code: 'mr',
    nativeLabel: 'मराठी',
    englishLabel: 'Marathi',
    shortBadge: 'मराठी',
    greeting: 'राधे राधे',
  },
  {
    code: 'gu',
    nativeLabel: 'ગુજરાતી',
    englishLabel: 'Gujarati',
    shortBadge: 'ગુજરાતી',
    greeting: 'રાધે રાધે',
  },
];

const LANGUAGE_STORAGE_KEY = 'panditji_app_language';

type TranslationDict = Record<string, Record<AppLanguage, string>>;

export const UI_TRANSLATIONS: TranslationDict = {
  // Brand & Header
  lang_label: {
    hi: 'भाषा चुनें',
    en: 'Select Language',
    hinglish: 'Language Chunein',
    mr: 'भाषा निवडा',
    gu: 'ભાષા પસંદ કરો',
  },
  brand_title: {
    hi: 'पण्डित जी ऑनलाइन',
    en: 'Pandit Ji Online',
    hinglish: 'Pandit Ji Online',
    mr: 'पंडित जी ऑनलाइन',
    gu: 'પંડિત જી ઓનલાઇન',
  },
  brand_name: {
    hi: 'पण्डित जी ऑनलाइन',
    en: 'Pandit Ji Online',
    hinglish: 'Pandit Ji Online',
    mr: 'पंडित जी ऑनलाइन',
    gu: 'પંડિત જી ઓનલાઇન',
  },
  footer_founder: {
    hi: 'संस्थापक:',
    en: 'Founder:',
    hinglish: 'Founder:',
    mr: 'संस्थापक:',
    gu: 'સ્થાપક:',
  },
  footer_helpline: {
    hi: 'हेल्पलाइन:',
    en: 'Helpline:',
    hinglish: 'Helpline:',
    mr: 'हेल्पलाइन:',
    gu: 'હેલ્પલાઇન:',
  },
  footer_services: {
    hi: 'वैदिक पूजा व ज्योतिष सेवा',
    en: 'Vedic Puja & Astrology Services',
    hinglish: 'Vedic Puja & Astrology Services',
    mr: 'वैदिक पूजा व ज्योतिष सेवा',
    gu: 'વૈદિક પૂજા અને જ્યોતિષ સેવા',
  },
  footer_rights: {
    hi: 'सर्वाधिकार सुरक्षित • धर्मो रक्षति रक्षितः',
    en: 'All Rights Reserved • Dharmo Rakshati Rakshitah',
    hinglish: 'All Rights Reserved • Dharmo Rakshati Rakshitah',
    mr: 'सर्व हक्क राखीव • धर्मो रक्षति रक्षितः',
    gu: 'સર્વાધિકાર સુરક્ષિત • ધર્મો રક્ષતિ રક્ષિતઃ',
  },
  verified_badge: {
    hi: 'प्रमाणित',
    en: 'Verified',
    hinglish: 'Verified',
    mr: 'प्रमाणित',
    gu: 'પ્રમાણિત',
  },
  founder_name: {
    hi: 'आचार्य पण्डित शशांक शर्मा',
    en: 'Acharya Pandit Shashank Sharma',
    hinglish: 'Acharya Pandit Shashank Sharma',
    mr: 'आचार्य पंडित शशांक शर्मा',
    gu: 'આચાર્ય પંડિત શશાંક શર્મા',
  },
  founder_role: {
    hi: '(वैदिक पुरोहित एवं ज्योतिषाचार्य)',
    en: '(Vedic Purohit & Jyotishacharya)',
    hinglish: '(Vedic Purohit & Jyotishacharya)',
    mr: '(वैदिक पुरोहित व ज्योतिषाचार्य)',
    gu: '(વૈદિક પુરોહિત અને જ્યોતિષાચાર્ય)',
  },
  location_label: {
    hi: 'रुद्रपुर, उत्तराखण्ड',
    en: 'Rudrapur, Uttarakhand',
    hinglish: 'Rudrapur, Uttarakhand',
    mr: 'रुद्रपूर, उत्तराखंड',
    gu: 'રુદ્રપુર, ઉત્તરાખંડ',
  },
  brand_location: {
    hi: 'रुद्रपुर, उत्तराखण्ड',
    en: 'Rudrapur, Uttarakhand',
    hinglish: 'Rudrapur, Uttarakhand',
    mr: 'रुद्रपूर, उत्तराखंड',
    gu: 'રુદ્રપુર, ઉત્તરાખંડ',
  },
  location_sub: {
    hi: '• वैदिक पूजा एवं ज्योतिष परामर्श केंद्र',
    en: '• Vedic Puja & Astrology Center',
    hinglish: '• Vedic Puja & Astrology Center',
    mr: '• वैदिक पूजा व ज्योतिष मार्गदर्शन केंद्र',
    gu: '• વૈદિક પૂજા અને જ્યોતિષ માર્ગદર્શન કેન્દ્ર',
  },
  online_consult_tag: {
    hi: 'रुद्रपुर एवं ऑनलाइन परामर्श',
    en: 'Rudrapur & Online Consultation',
    hinglish: 'Rudrapur & Online Paramarsh',
    mr: 'रुद्रपूर व ऑनलाइन मार्गदर्शन',
    gu: 'રુદ્રપુર અને ઓનલાઇન માર્ગદર્શન',
  },
  audio_on: {
    hi: 'ध्वनि चालू',
    en: 'Sound On',
    hinglish: 'Dhwani On',
    mr: 'ध्वनी सुरू',
    gu: 'ધ્વનિ ચાલુ',
  },
  audio_off: {
    hi: 'मंत्र ध्वनि',
    en: 'Mantra Audio',
    hinglish: 'Mantra Audio',
    mr: 'मंत्र ध्वनी',
    gu: 'મંત્ર ધ્વનિ',
  },
  free_badge: {
    hi: 'निःशुल्क',
    en: 'FREE',
    hinglish: 'Free',
    mr: 'मोफत',
    gu: 'નિઃશુલ્ક',
  },
  login_account: {
    hi: 'लॉगिन / खाता',
    en: 'Login / Account',
    hinglish: 'Login / Khata',
    mr: 'लॉगिन / खाते',
    gu: 'લોગિન / ખાતું',
  },
  call_short: {
    hi: 'कॉल',
    en: 'Call',
    hinglish: 'Call',
    mr: 'कॉल',
    gu: 'કૉલ',
  },

  // Navigation Tabs
  nav_home: {
    hi: 'मुख्य पृष्ठ',
    en: 'Home',
    hinglish: 'Home Page',
    mr: 'मुख्य पृष्ठ',
    gu: 'મુખ્ય પૃષ્ઠ',
  },
  nav_gyan_kosh: {
    hi: 'धर्म व ज्ञान',
    en: 'Dharma & Wisdom',
    hinglish: 'Dharm Gyan',
    mr: 'धर्म व ज्ञान',
    gu: 'ધર્મ અને જ્ઞાન',
  },
  nav_mandir: {
    hi: 'डिजिटल मंदिर',
    en: 'Digital Mandir',
    hinglish: 'Digital Mandir',
    mr: 'डिजिटल मंदिर',
    gu: 'ડિજિટલ મંદિર',
  },
  nav_panchang: {
    hi: 'पंचांग कैलेंडर',
    en: 'Panchang Calendar',
    hinglish: 'Panchang Calendar',
    mr: 'पंचांग कॅलेंडर',
    gu: 'પંચાંગ કેલેન્ડર',
  },
  nav_kundali: {
    hi: 'जन्म कुंडली',
    en: 'Birth Kundali',
    hinglish: 'Janam Kundali',
    mr: 'जन्म कुंडली',
    gu: 'જન્મ કુંડળી',
  },
  nav_milan: {
    hi: '36 गुण मिलान',
    en: '36 Gun Milan',
    hinglish: '36 Gun Milan',
    mr: '३६ गुण मिलन',
    gu: '૩૬ ગુણ મિલન',
  },
  nav_jaap: {
    hi: 'मंत्र जप माला',
    en: 'Mantra Jaap Mala',
    hinglish: 'Mantra Jaap Mala',
    mr: 'मंत्र जप माळ',
    gu: 'મંત્ર જપ માળા',
  },
  nav_chat: {
    hi: 'ज्योतिष चैट',
    en: 'Pandit Ji AI',
    hinglish: 'Pandit Ji AI',
    mr: 'ज्योतिष चॅट',
    gu: 'જ્યોતિષ ચેટ',
  },
  nav_services: {
    hi: 'पूजा सेवाएं',
    en: 'Puja Booking',
    hinglish: 'Puja Booking',
    mr: 'पूजा सेवा',
    gu: 'પૂજા સેવાઓ',
  },
  nav_youtube: {
    hi: 'यूट्यूब वीडियो',
    en: 'YouTube Videos',
    hinglish: 'YouTube Videos',
    mr: 'यूट्यूब व्हिडिओ',
    gu: 'યુટ્યુબ વિડિયો',
  },
  nav_history: {
    hi: 'मेरा खाता',
    en: 'My Account',
    hinglish: 'Mera Khata',
    mr: 'माझे खाते',
    gu: 'મારું ખાતું',
  },

  // Today's Live Panchang Ribbon
  panchang_today_badge: {
    hi: 'आज का पंचांग',
    en: "Today's Panchang",
    hinglish: 'Aaj Ka Panchang',
    mr: 'आजचे पंचांग',
    gu: 'આજનું પંચાંગ',
  },
  panchang_date_label: {
    hi: '📅 दिनांक:',
    en: '📅 Date:',
    hinglish: '📅 Date:',
    mr: '📅 दिनांक:',
    gu: '📅 તારીખ:',
  },
  panchang_time_label: {
    hi: 'समय:',
    en: 'Time:',
    hinglish: 'Time:',
    mr: 'वेळ:',
    gu: 'સમય:',
  },
  panchang_open_full_btn: {
    hi: 'सम्पूर्ण पंचांग व कैलेंडर खोलें',
    en: 'Open Full Panchang & Calendar',
    hinglish: 'Full Panchang & Calendar Kholein',
    mr: 'संपूर्ण पंचांग व कॅलेंडर उघडा',
    gu: 'સંપૂર્ણ પંચાંગ અને કેલેન્ડર ખોલો',
  },
  panchang_scroll_details_btn: {
    hi: 'कैलेंडर के नीचे आज की सम्पूर्ण जानकारी देखें',
    en: "View Today's Full Details Below Calendar",
    hinglish: 'Calendar Ke Niche Aaj Ki Puri Jankari Dekhein',
    mr: 'कॅलेंडरखाली आजची संपूर्ण माहिती पहा',
    gu: 'કેલેન્ડર નીચે આજની સંપૂર્ણ માહિતી જુઓ',
  },
  panchang_tithi_paksha: {
    hi: 'आज की तिथि व पक्ष',
    en: "Today's Tithi & Paksha",
    hinglish: 'Aaj Ki Tithi & Paksha',
    mr: 'आजची तिथी व पक्ष',
    gu: 'આજની તિથિ અને પક્ષ',
  },
  panchang_nakshatra_yoga: {
    hi: 'नक्षत्र एवं योग',
    en: 'Nakshatra & Yoga',
    hinglish: 'Nakshatra & Yoga',
    mr: 'नक्षत्र व योग',
    gu: 'નક્ષત્ર અને યોગ',
  },
  panchang_sunrise_sunset: {
    hi: 'सूर्योदय एवं सूर्यास्त',
    en: 'Sunrise & Sunset',
    hinglish: 'Sunrise & Sunset',
    mr: 'सूर्योदय व सूर्यास्त',
    gu: 'સૂર્યોદય અને સૂર્યાસ્ત',
  },
  panchang_abhijit: {
    hi: '✨ अभिजित मुहूर्त (शुभ)',
    en: '✨ Abhijit Muhurat (Auspicious)',
    hinglish: '✨ Abhijit Muhurat (Shubh)',
    mr: '✨ अभिजित मुहूर्त (शुभ)',
    gu: '✨ અભિજિત મુહૂર્ત (શુભ)',
  },
  panchang_abhijit_sub: {
    hi: 'सर्वश्रेष्ठ शुभ कार्य समय',
    en: 'Best Time for Auspicious Works',
    hinglish: 'Shubh Karya Ke Liye Best Time',
    mr: 'शुभ कार्यासाठी सर्वोत्तम वेळ',
    gu: 'શુભ કાર્ય માટે શ્રેષ્ઠ સમય',
  },
  panchang_rahukaal: {
    hi: '⚠️ राहुकाल (वर्जित समय)',
    en: '⚠️ Rahu Kaal (Avoid)',
    hinglish: '⚠️ Rahu Kaal (Varjit Samay)',
    mr: '⚠️ राहुकाळ (वर्ज्य वेळ)',
    gu: '⚠️ રાહુકાળ (વર્જિત સમય)',
  },

  // Home Page All-in-One Facilities Hub (both hub_* and dir_* aliases supported)
  hub_badge: {
    hi: 'निःशुल्क वैदिक डिजिटल सुविधाएं • १-क्लिक में सीधा उपयोग करें',
    en: '100% Free Digital Vedic Tools • 1-Click Instant Access',
    hinglish: '100% Free Digital Vedic Suvidhayein • 1-Click Direct Access',
    mr: '१००% मोफत वैदिक डिजिटल सुविधा • १-क्लिकमध्ये थेट वापर करा',
    gu: '૧૦૦% નિઃશુલ્ક વૈદિક ડિજિટલ સુવિધાઓ • ૧-ક્લિકમાં સીધો ઉપયોગ કરો',
  },
  dir_free_pill: {
    hi: 'निःशुल्क वैदिक डिजिटल सुविधाएं • १-क्लिक में सीधा उपयोग करें',
    en: '100% Free Digital Vedic Tools • 1-Click Instant Access',
    hinglish: '100% Free Digital Vedic Suvidhayein • 1-Click Direct Access',
    mr: '१००% मोफत वैदिक डिजिटल सुविधा • १-क्लिकमध्ये थेट वापर करा',
    gu: '૧૦૦% નિઃશુલ્ક વૈદિક ડિજિટલ સુવિધાઓ • ૧-ક્લિકમાં સીધો ઉપયોગ કરો',
  },
  hub_title: {
    hi: 'ऐप की सम्पूर्ण सुविधाएं — एक ही स्थान पर',
    en: 'All App Facilities — In One Place',
    hinglish: 'App Ki Sampoorn Suvidhayein — Ek Hi Sthan Par',
    mr: 'ॲपच्या संपूर्ण सुविधा — एकाच ठिकाणी',
    gu: 'એપની સંપૂર્ણ સુવિધાઓ — એક જ સ્થાને',
  },
  dir_heading: {
    hi: 'ऐप की सम्पूर्ण सुविधाएं — एक ही स्थान पर',
    en: 'All App Facilities — In One Place',
    hinglish: 'App Ki Sampoorn Suvidhayein — Ek Hi Sthan Par',
    mr: 'ॲपच्या संपूर्ण सुविधा — एकाच ठिकाणी',
    gu: 'એપની સંપૂર્ણ સુવિધાઓ — એક જ સ્થાને',
  },
  hub_subtitle: {
    hi: 'कुंडली, ३६ गुण मिलान, पंचांग कैलेंडर, राम शलाका, मंत्र जप, आरती-चालीसा, वास्तु एवं ज्योतिष मार्गदर्शन — अपनी पसंद की सुविधा चुनें।',
    en: 'Birth Kundali, 36 Gun Milan, Panchang Calendar, Ram Shalaka, Mantra Jaap, Aarti-Chalisa, Vastu & Vedic Guidance — Choose any tool below.',
    hinglish: 'Kundali, 36 Gun Milan, Panchang Calendar, Ram Shalaka, Mantra Jaap, Aarti-Chalisa, Vastu & Jyotish Guidance — Apni pasand ki suvidha chunein.',
    mr: 'कुंडली, ३६ गुण मिलन, पंचांग कॅलेंडर, राम शलाका, मंत्र जप, आरती-चालीसा, वास्तू व ज्योतिष मार्गदर्शन — आपल्या पसंतीची सुविधा निवडा.',
    gu: 'કુંડળી, ૩૬ ગુણ મિલન, પંચાંગ કેલેન્ડર, રામ શલાકા, મંત્ર જપ, આરતી-ચાલીસા, વાસ્તુ અને જ્યોતિષ માર્ગદર્શન — આપની પસંદગીની સુવિધા પસંદ કરો.',
  },
  dir_subheading: {
    hi: 'कुंडली, ३६ गुण मिलान, पंचांग कैलेंडर, राम शलाका, मंत्र जप, आरती-चालीसा, वास्तु एवं ज्योतिष मार्गदर्शन — अपनी पसंद की सुविधा चुनें।',
    en: 'Birth Kundali, 36 Gun Milan, Panchang Calendar, Ram Shalaka, Mantra Jaap, Aarti-Chalisa, Vastu & Vedic Guidance — Choose any tool below.',
    hinglish: 'Kundali, 36 Gun Milan, Panchang Calendar, Ram Shalaka, Mantra Jaap, Aarti-Chalisa, Vastu & Jyotish Guidance — Apni pasand ki suvidha chunein.',
    mr: 'कुंडली, ३६ गुण मिलन, पंचांग कॅलेंडर, राम शलाका, मंत्र जप, आरती-चालीसा, वास्तू व ज्योतिष मार्गदर्शन — आपल्या पसंतीची सुविधा निवडा.',
    gu: 'કુંડળી, ૩૬ ગુણ મિલન, પંચાંગ કેલેન્ડર, રામ શલાકા, મંત્ર જપ, આરતી-ચાલીસા, વાસ્તુ અને જ્યોતિષ માર્ગદર્શન — આપની પસંદગીની સુવિધા પસંદ કરો.',
  },
  hub_filter_all: {
    hi: 'सभी सुविधाएं (16)',
    en: 'All Tools (16)',
    hinglish: 'Sabhi Suvidhayein (16)',
    mr: 'सर्व सुविधा (16)',
    gu: 'બધી સુવિધાઓ (16)',
  },
  dir_filter_all: {
    hi: 'सभी सुविधाएं (16)',
    en: 'All Tools (16)',
    hinglish: 'Sabhi Suvidhayein (16)',
    mr: 'सर्व सुविधा (16)',
    gu: 'બધી સુવિધાઓ (16)',
  },
  hub_filter_jyotish: {
    hi: '🌟 ज्योतिष व कुंडली (4)',
    en: '🌟 Astrology & Kundali (4)',
    hinglish: '🌟 Jyotish & Kundali (4)',
    mr: '🌟 ज्योतिष व कुंडली (4)',
    gu: '🌟 જ્યોતિષ અને કુંડળી (4)',
  },
  dir_filter_jyotish: {
    hi: '🌟 ज्योतिष व कुंडली (4)',
    en: '🌟 Astrology & Kundali (4)',
    hinglish: '🌟 Jyotish & Kundali (4)',
    mr: '🌟 ज्योतिष व कुंडली (4)',
    gu: '🌟 જ્યોતિષ અને કુંડળી (4)',
  },
  hub_filter_sadhana: {
    hi: '🕉️ पंचांग व साधना (4)',
    en: '🕉️ Panchang & Sadhana (4)',
    hinglish: '🕉️ Panchang & Sadhana (4)',
    mr: '🕉️ पंचांग व साधना (4)',
    gu: '🕉️ પંચાંગ અને સાધના (4)',
  },
  dir_filter_sadhana: {
    hi: '🕉️ पंचांग व साधना (4)',
    en: '🕉️ Panchang & Sadhana (4)',
    hinglish: '🕉️ Panchang & Sadhana (4)',
    mr: '🕉️ पंचांग व साधना (4)',
    gu: '🕉️ પંચાંગ અને સાધना (4)',
  },
  hub_filter_gyan: {
    hi: '📖 धर्म ज्ञान कोष (5)',
    en: '📖 Sacred Texts & Vastu (5)',
    hinglish: '📖 Dharm Gyan Kosh (5)',
    mr: '📖 धर्म ज्ञान कोष (5)',
    gu: '📖 ધર્મ જ્ઞાન કોષ (5)',
  },
  dir_filter_gyan: {
    hi: '📖 धर्म ज्ञान कोष (5)',
    en: '📖 Sacred Texts & Vastu (5)',
    hinglish: '📖 Dharm Gyan Kosh (5)',
    mr: '📖 धर्म ज्ञान कोष (5)',
    gu: '📖 ધર્મ જ્ઞાન કોષ (5)',
  },
  hub_filter_puja: {
    hi: '🙏 सेवाएं व खाता (3)',
    en: '🙏 Services & Account (3)',
    hinglish: '🙏 Services & Khata (3)',
    mr: '🙏 सेवा व खाते (3)',
    gu: '🙏 સેવાઓ અને ખાતું (3)',
  },
  dir_filter_puja: {
    hi: '🙏 सेवाएं व खाता (3)',
    en: '🙏 Services & Account (3)',
    hinglish: '🙏 Services & Khata (3)',
    mr: '🙏 सेवा व खाते (3)',
    gu: '🙏 સેવાઓ અને ખાતું (3)',
  },
  hub_search_placeholder: {
    hi: '🔍 ऐप की किसी भी सुविधा को यहाँ खोजें (उदा: कुंडली, पंचांग, राम शलाका, हनुमान चालीसा, वास्तु, शनि, मिलान, सामग्री...)',
    en: '🔍 Search any tool or topic (e.g. Kundali, Panchang, Ram Shalaka, Hanuman Chalisa, Vastu, Shani, Milan, Samagri...)',
    hinglish: '🔍 App ki kisi bhi suvidha ko yahan khojein (e.g. Kundali, Panchang, Ram Shalaka, Chalisa, Vastu, Shani, Milan...)',
    mr: '🔍 ॲपमधील कोणतीही सुविधा येथे शोधा (उदा: कुंडली, पंचांग, राम शलाका, हनुमान चालीसा, वास्तू, शनी, मिलन...)',
    gu: '🔍 એપની કોઈપણ સુવિધા અહીં શોધો (દા.ત. કુંડળી, પંચાંગ, રામ શલાકા, હનુમાન ચાલીસા, વાસ્તુ, શનિ, મિલન...)',
  },
  dir_search_placeholder: {
    hi: '🔍 ऐप की किसी भी सुविधा को यहाँ खोजें (उदा: कुंडली, पंचांग, राम शलाका, हनुमान चालीसा, वास्तु, शनि, मिलान, सामग्री...)',
    en: '🔍 Search any tool or topic (e.g. Kundali, Panchang, Ram Shalaka, Hanuman Chalisa, Vastu, Shani, Milan, Samagri...)',
    hinglish: '🔍 App ki kisi bhi suvidha ko yahan khojein (e.g. Kundali, Panchang, Ram Shalaka, Chalisa, Vastu, Shani, Milan...)',
    mr: '🔍 ॲपमधील कोणतीही सुविधा येथे शोधा (उदा: कुंडली, पंचांग, राम शलाका, हनुमान चालीसा, वास्तू, शनी, मिलन...)',
    gu: '🔍 એપની કોઈપણ સુવિધા અહીં શોધો (દા.ત. કુંડળી, પંચાંગ, રામ શલાકા, હનુમાન ચાલીસા, વાસ્તુ, શનિ, મિલન...)',
  },
  hub_open_feature: {
    hi: 'सुविधा खोलें',
    en: 'Open Tool',
    hinglish: 'Suvidha Kholein',
    mr: 'सुविधा उघडा',
    gu: 'સુવિધા ખોલો',
  },
  dir_open_action: {
    hi: 'सुविधा खोलें',
    en: 'Open Tool',
    hinglish: 'Suvidha Kholein',
    mr: 'सुविधा उघडा',
    gu: 'સુવિધા ખોલો',
  },
  hub_no_result: {
    hi: 'से संबंधित कोई सुविधा नहीं मिली।',
    en: 'No matching facility found.',
    hinglish: 'se sambandhit koi suvidha nahi mili.',
    mr: 'संबंधित कोणतीही सुविधा आढळली नाही.',
    gu: 'સંબંધિત કોઈ સુવિધા મળી નથી.',
  },
  hub_reset_btn: {
    hi: 'सभी सुविधाएं दिखाएं (रीसेट करें)',
    en: 'Show All Facilities (Reset)',
    hinglish: 'Sabhi Suvidhayein Dikhayein (Reset)',
    mr: 'सर्व सुविधा दाखवा (रीसेट करा)',
    gu: 'બધી સુવિધાઓ બતાવો (રીસેટ કરો)',
  },
  dir_reset_btn: {
    hi: 'सभी सुविधाएं दिखाएं (रीसेट करें)',
    en: 'Show All Facilities (Reset)',
    hinglish: 'Sabhi Suvidhayein Dikhayein (Reset)',
    mr: 'सर्व सुविधा दाखवा (रीसेट करा)',
    gu: 'બધી સુવિધાઓ બતાવો (રીસેટ કરો)',
  },

  // Acharya Pandit Shashank Sharma Vision Banner on Home Page
  acharya_role: {
    hi: 'संस्थापक एवं मुख्य आचार्य',
    en: 'Founder & Chief Vedic Acharya',
    hinglish: 'Sansthapak & Mukhya Acharya',
    mr: 'संस्थापक व मुख्य आचार्य',
    gu: 'સ્થાપક અને મુખ્ય આચાર્ય',
  },
  acharya_name: {
    hi: 'पण्डित शशांक शर्मा',
    en: 'Pandit Shashank Sharma',
    hinglish: 'Pandit Shashank Sharma',
    mr: 'पंडित शशांक शर्मा',
    gu: 'પંડિત શશાંક શર્મા',
  },
  acharya_title: {
    hi: 'वैदिक पुरोहित एवं ज्योतिषाचार्य',
    en: 'Vedic Purohit & Jyotishacharya',
    hinglish: 'Vedic Purohit & Jyotishacharya',
    mr: 'वैदिक पुरोहित व ज्योतिषाचार्य',
    gu: 'વૈદિક પુરોહિત અને જ્યોતિષાચાર્ય',
  },
  acharya_vision_badge: {
    hi: 'प्रामाणिक सनातन वैदिक परंपरा एवं निःशुल्क डिजिटल ज्ञान कोष',
    en: 'Authentic Sanatan Vedic Tradition & Free Digital Knowledge Hub',
    hinglish: 'Pramanik Sanatan Vedic Parampara & Free Digital Gyan Kosh',
    mr: 'प्रामाणिक सनातन वैदिक परंपरा व मोफत डिजिटल ज्ञान कोष',
    gu: 'પ્રામાણિક સનાતન વૈદિક પરંપરા અને નિઃશુલ્ક ડિજિટલ જ્ઞાન કોષ',
  },
  acharya_vision_title: {
    hi: 'शास्त्रसम्मत ज्ञान, शुद्ध पंचांग एवं',
    en: 'Shastrokta Wisdom, Pure Panchang &',
    hinglish: 'Shastrokta Gyan, Shuddh Panchang &',
    mr: 'शास्त्रोक्त ज्ञान, शुद्ध पंचांग व',
    gu: 'શાસ્ત્રોક્ત જ્ઞાન, શુદ્ધ પંચાંગ અને',
  },
  acharya_vision_highlight: {
    hi: 'संतुलित ज्योतिष दर्शन',
    en: 'Balanced Vedic Astrology',
    hinglish: 'Santulit Jyotish Darshan',
    mr: 'संतुलित ज्योतिष दर्शन',
    gu: 'સંતુલિત જ્યોતિષ દર્શન',
  },
  acharya_vision_desc: {
    hi: '“अंधविश्वास या भय नहीं, कर्म एवं विवेक ही सच्चा धर्म है।” सनातन धर्म के शुद्ध ज्ञान, वैदिक पंचांग, जन्म कुंडली, ३६ गुण मिलान, मंत्र साधना एवं धार्मिक ग्रंथों को प्रत्येक सनातनी परिवार तक निःशुल्क और सरल रूप में पहुँचाने का संकल्प।',
    en: '“True Dharma lies in righteous Karma and wisdom, never in fear or superstition.” Our mission is to bring pure Sanatan Vedic knowledge, authentic Panchang, Birth Kundali, 36 Gun Milan, Mantra Sadhana, and sacred scriptures freely to every family.',
    hinglish: '“Andhavishwas ya bhay nahi, karma aur vivek hi saccha dharma hai.” Sanatan Dharma ke shuddh gyan, Vedic Panchang, Janam Kundali, 36 Gun Milan, Mantra Sadhana aur dharmik granthon ko har parivar tak nishulk pahunchane ka sankalp.',
    mr: '“अंधश्रद्धा किंवा भीती नाही, कर्म आणि विवेक हाच खरा धर्म आहे.” सनातन धर्माचे शुद्ध ज्ञान, वैदिक पंचांग, जन्म कुंडली, ३६ गुण मिलन आणि मंत्र साधना प्रत्येक कुटुंबापर्यंत मोफत पोहोचवण्याचा संकल्प.',
    gu: '“અંધશ્રદ્ધા કે ભય નહીં, કર્મ અને વિવેક જ સાચો ધર્મ છે.” સનાતન ધર્મનું શુદ્ધ જ્ઞાન, વૈદિક પંચાંગ, જન્મ કુંડળી, ૩૬ ગુણ મિલન અને મંત્ર સાધના દરેક પરિવાર સુધી નિઃશુલ્ક પહોંચાડવાનો સંકલ્પ.',
  },
};

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  currentLanguageOption: LanguageOption;
  t: (key: keyof typeof UI_TRANSLATIONS) => string;
  tr: (
    hi: string,
    en: string,
    hinglish?: string,
    mr?: string,
    gu?: string
  ) => string;
  localizeVedicText: (text: string) => string;
}

const VEDIC_HINDI_TO_EN_PHRASES: Array<[string, string]> = [
  // Multi-word phrases first (longest match priority)
  ['तत्पश्चात अहोरात्र', 'then Full Night'],
  ['अहोरात्र व्यापिनी', 'Full Day & Night'],
  ['पूर्ण रात्रि तक', 'Full Night'],
  ['पूर्ण रात्रि', 'Full Night'],
  ['तक, तत्पश्चात', 'till, then'],
  ['तक, फिर', 'till, then'],
  ['प्रारंभ', 'starts'],
  ['वर्जित समय', 'Avoid'],
  ['अति शुभ', 'Highly Auspicious'],
  ['विक्रम संवत', 'Vikram Samvat'],
  ['शक संवत', 'Shaka Samvat'],
  ['शुक्ल पक्ष', 'Shukla Paksha'],
  ['कृष्ण पक्ष', 'Krishna Paksha'],
  ['पूर्वाफाल्गुनी', 'Purva Phalguni'],
  ['उत्तराफाल्गुनी', 'Uttara Phalguni'],
  ['पूर्वाषाढ़ा', 'Purva Ashadha'],
  ['उत्तराषाढ़ा', 'Uttara Ashadha'],
  ['पूर्वाभाद्रपदा', 'Purva Bhadrapada'],
  ['उत्तराभाद्रपदा', 'Uttara Bhadrapada'],
  ['मृगशिरा', 'Mrigashira'],
  ['पुनर्वसु', 'Punarvasu'],
  ['शतभिषा', 'Shatabhisha'],
  ['अनुराधा', 'Anuradha'],
  ['अश्विनी', 'Ashwini'],
  ['कृत्तिका', 'Krittika'],
  ['रोहिणी', 'Rohini'],
  ['आश्लेषा', 'Ashlesha'],
  ['विशाखा', 'Vishakha'],
  ['धनिष्ठा', 'Dhanishta'],
  ['ज्येष्ठा', 'Jyeshtha'],
  ['भरणी', 'Bharani'],
  ['आर्द्रा', 'Ardra'],
  ['पुष्य', 'Pushya'],
  ['मघा', 'Magha'],
  ['हस्त', 'Hasta'],
  ['चित्रा', 'Chitra'],
  ['स्वाती', 'Swati'],
  ['स्वाति', 'Swati'],
  ['मूल', 'Mula'],
  ['श्रवण', 'Shravana'],
  ['रेवती', 'Revati'],
  // Tithis
  ['प्रतिपदा', 'Pratipada'],
  ['द्वितीया', 'Dwitiya'],
  ['तृतीया', 'Tritiya'],
  ['चतुर्थी', 'Chaturthi'],
  ['पंचमी', 'Panchami'],
  ['षष्ठी', 'Shashthi'],
  ['सप्तमी', 'Saptami'],
  ['अष्टमी', 'Ashtami'],
  ['नवमी', 'Navami'],
  ['दशमी', 'Dashami'],
  ['एकादशी', 'Ekadashi'],
  ['द्वादशी', 'Dwadashi'],
  ['त्रयोदशी', 'Trayodashi'],
  ['चतुर्दशी', 'Chaturdashi'],
  ['पूर्णिमा', 'Purnima'],
  ['अमावस्या', 'Amavasya'],
  // Hindu Months
  ['मार्गशीर्ष', 'Margashirsha'],
  ['भाद्रपद', 'Bhadrapada'],
  ['वैशाख', 'Vaishakha'],
  ['आश्विन', 'Ashwin'],
  ['कार्तिक', 'Kartik'],
  ['फाल्गुन', 'Phalguna'],
  ['आषाढ़', 'Ashadha'],
  ['चैत्र', 'Chaitra'],
  ['ज्येष्ठ', 'Jyeshtha'],
  ['पौष', 'Pausha'],
  ['माघ', 'Magha'],
  // Yogas & Karanas
  ['विष्कम्भ', 'Vishkambha'],
  ['आयुष्मान', 'Ayushman'],
  ['सौभाग्य', 'Saubhagya'],
  ['अतिगण्ड', 'Atiganda'],
  ['सुकर्मा', 'Sukarma'],
  ['व्याघात', 'Vyaghata'],
  ['व्यतीपात', 'Vyatipata'],
  ['वरीयान', 'Variyan'],
  ['वैधृति', 'Vaidhriti'],
  ['हर्षण', 'Harshana'],
  ['शोभन', 'Shobhana'],
  ['प्रीति', 'Priti'],
  ['धृति', 'Dhriti'],
  ['वृद्धि', 'Vriddhi'],
  ['ध्रुव', 'Dhruva'],
  ['सिद्धि', 'Siddhi'],
  ['परिघ', 'Parigha'],
  ['साध्य', 'Sadhya'],
  ['ब्रह्म', 'Brahma'],
  ['ऐन्द्र', 'Indra'],
  ['वज्र', 'Vajra'],
  ['शूल', 'Shula'],
  ['गण्ड', 'Ganda'],
  ['कौस्तुभ', 'Kaustubha'],
  ['किंस्तुघ्न', 'Kimstughna'],
  ['चतुष्पाद', 'Chatushpada'],
  ['वणिज', 'Vanija'],
  ['विष्टि', 'Vishti (Bhadra)'],
  ['भद्रा', 'Bhadra'],
  ['शकुनि', 'Shakuni'],
  ['तैतिल', 'Taitila'],
  ['कौलव', 'Kaulava'],
  ['बालव', 'Balava'],
  ['गर', 'Gara'],
  ['नाग', 'Naga'],
  ['बव', 'Bava'],
  // Weekdays
  ['रविवार', 'Sunday'],
  ['सोमवार', 'Monday'],
  ['मंगलवार', 'Tuesday'],
  ['बुधवार', 'Wednesday'],
  ['गुरुवार', 'Thursday'],
  ['बृहस्पतिवार', 'Thursday'],
  ['शुक्रवार', 'Friday'],
  ['शनिवार', 'Saturday'],
  // Rashis & Planets
  ['वृश्चिक', 'Scorpio (Vrishchik)'],
  ['वृषभ', 'Taurus (Vrishabh)'],
  ['मिथुन', 'Gemini (Mithun)'],
  ['कुम्भ', 'Aquarius (Kumbh)'],
  ['कुंभ', 'Aquarius (Kumbh)'],
  ['कन्या', 'Virgo (Kanya)'],
  ['मकर', 'Capricorn (Makar)'],
  ['मेष', 'Aries (Mesh)'],
  ['कर्क', 'Cancer (Kark)'],
  ['सिंह', 'Leo (Simha)'],
  ['तुला', 'Libra (Tula)'],
  ['धनु', 'Sagittarius (Dhanu)'],
  ['मीन', 'Pisces (Meen)'],
  ['बृहस्पति', 'Jupiter'],
  ['मंगल देव', 'Mars (Mangal)'],
  ['शुक्र देव', 'Venus (Shukra)'],
  ['बुध देव', 'Mercury (Budh)'],
  ['चन्द्र देव', 'Moon (Chandra)'],
  ['सूर्य देव', 'Sun (Surya)'],
  ['शनि देव', 'Saturn (Shani)'],
  // Deities & Subtitles
  ['सर्व प्रकाशक, आरोग्य प्रदाता एवं भुवन भास्कर', 'Universal Illuminator, Giver of Health & Cosmic Sun God'],
  ['कैलाशपति, गंगाधर, त्रिनेत्रधारी आशुतोष महादेव', 'Lord of Kailash, Gangadhar, Three-Eyed Ashutosh Mahadev'],
  ['पवनपुत्र, केसरीनंदन, रामदूत अतुलित बलधामा', 'Son of Wind God, Messenger of Lord Rama & Supreme Protector'],
  ['प्रथम पूज्य, विघ्नहर्ता, मंगलमूर्ति सिद्धिविनायक', 'First Worshipped Lord, Remover of Obstacles & Giver of Wisdom'],
  ['जगत्पालक श्री हरि नारायण एवं ज्ञान प्रदाता देवगुरु', 'Preserver of the Universe Lord Hari Vishnu & Divine Guru Brihaspati'],
  ['धन, वैभव, ऐश्वर्य एवं सुख-सौभाग्य की अधिष्ठात्री देवी', 'Supreme Goddess of Wealth, Prosperity, Grace & Good Fortune'],
  ['न्याय के देवता, कर्मफल दाता सूर्यपुत्र शनि महाराज', 'Lord of Karma, Justice & Discipline — Shani Maharaj'],
  // Time of day & Locations
  ['मध्यरात्रि', 'Midnight'],
  ['अपराह्न', 'Afternoon'],
  ['पूर्वाह्न', 'Morning'],
  ['प्रातः', 'Morning'],
  ['दोपहर', 'Afternoon'],
  ['सायं', 'Evening'],
  ['रात्रि', 'Night'],
  ['रुद्रपुर', 'Rudrapur'],
  ['उत्तराखण्ड', 'Uttarakhand'],
  ['उधम सिंह नगर', 'Udham Singh Nagar'],
  ['दिल्ली', 'Delhi'],
  ['हरिद्वार', 'Haridwar'],
  ['देहरादून', 'Dehradun'],
  ['वाराणसी', 'Varanasi'],
  ['काशी', 'Kashi'],
  ['उज्जैन', 'Ujjain'],
  ['प्रयागराज', 'Prayagraj'],
  ['अयोध्या', 'Ayodhya'],
  ['मथुरा', 'Mathura'],
  ['वृन्दावन', 'Vrindavan'],
  ['हल्द्वानी', 'Haldwani'],
  ['नैनीताल', 'Nainital'],
  // Common Suffixes & Terms
  ['नक्षत्र', 'Nakshatra'],
  ['तिथि', 'Tithi'],
  ['पक्ष', 'Paksha'],
  ['मास', 'Month'],
  ['योग', 'Yoga'],
  ['करण', 'Karana'],
  ['शुक्ल', 'Shukla'],
  ['कृष्ण', 'Krishna'],
  ['शुभ', 'Auspicious'],
  ['अशुभ', 'Avoid'],
  ['वर्जित', 'Avoid'],
  ['शिव', 'Shiva'],
  ['सिद्ध', 'Siddha'],
  ['पूर्व दिशा', 'East Direction'],
  ['पश्चिम दिशा', 'West Direction'],
  ['उत्तर दिशा', 'North Direction'],
  ['दक्षिण दिशा', 'South Direction'],
  ['ईशान कोण', 'North-East (Ishan)'],
  ['आग्नेय कोण', 'South-East (Agneya)'],
  ['नैऋत्य कोण', 'South-West (Nairitya)'],
  ['वायव्य कोण', 'North-West (Vayavya)'],
  ['तक', 'till'],
];

const DEVANAGARI_DIGITS: Record<string, string> = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
};

export function translateVedicHindiToEnglish(text: string, lang: AppLanguage): string {
  if (!text || (lang !== 'en' && lang !== 'hinglish')) {
    return text;
  }

  let result = text.replace(/[०-९]/g, (d) => DEVANAGARI_DIGITS[d] || d);

  for (const [hiPhrase, enPhrase] of VEDIC_HINDI_TO_EN_PHRASES) {
    if (result.includes(hiPhrase)) {
      result = result.split(hiPhrase).join(enPhrase);
    }
  }

  // Reorder "(Morning 02:36 PM till" -> "(till Morning 02:36 PM" for natural English
  result = result.replace(/\((Morning|Afternoon|Evening|Night|Midnight)\s+([0-9:]+\s*(?:AM|PM)?)\s+till/gi, '(till $1 $2');
  result = result.replace(/\(\s*([0-9:]+\s*(?:AM|PM)?)\s+till/gi, '(till $1');

  return result;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always start in Hindi ('hi') by default as requested by the user
  const [language, setLanguageState] = useState<AppLanguage>('hi');

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const htmlLangMap: Record<AppLanguage, string> = {
      hi: 'hi',
      en: 'en',
      hinglish: 'en-IN',
      mr: 'mr',
      gu: 'gu',
    };
    document.documentElement.lang = htmlLangMap[language] || 'hi';
  }, [language]);

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = useCallback(
    (key: keyof typeof UI_TRANSLATIONS | string): string => {
      const strKey = String(key);
      const normalized = strKey.toLowerCase().trim();
      const entry =
        UI_TRANSLATIONS[key as keyof typeof UI_TRANSLATIONS] ||
        UI_TRANSLATIONS[normalized as keyof typeof UI_TRANSLATIONS];

      if (!entry) {
        if (normalized.includes('brand')) {
          return language === 'en' ? 'Pandit Ji Online' : 'पण्डित जी ऑनलाइन';
        }
        return strKey.replace(/_/g, ' ');
      }
      return entry[language] || entry.hi;
    },
    [language]
  );

  const tr = useCallback(
    (hi: string, en: string, hinglish?: string, mr?: string, gu?: string): string => {
      if (language === 'en') return en;
      if (language === 'hinglish') return hinglish || en;
      if (language === 'mr') return mr || hi;
      if (language === 'gu') return gu || hi;
      return hi;
    },
    [language]
  );

  const localizeVedicText = useCallback(
    (text: string): string => {
      return translateVedicHindiToEnglish(text, language);
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageOption,
        t,
        tr,
        localizeVedicText,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: 'hi',
      setLanguage: () => {},
      currentLanguageOption: SUPPORTED_LANGUAGES[0],
      t: (key) => {
        const entry = UI_TRANSLATIONS[key];
        return entry ? entry.hi : String(key);
      },
      tr: (hi) => hi,
      localizeVedicText: (text) => text,
    };
  }
  return ctx;
};

