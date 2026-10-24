// Digital Mandir (Virtual Sanatan Shrine) Sacred Deities & Rituals Data
// Designed for authentic Vedic aesthetics, daily day-of-week alignment, and spiritual fidelity
import { getISTCalendarParts } from '../utils/panchangCalendarEngine';

export interface DeityVisualInfo {
  id: string;
  name: string;
  hindiName: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  dayName: string;
  hindiDayName: string;
  subTitle: string;
  mantra: string;
  mantraMeaning: string;
  shloka: string;
  shlokaRef: string;
  significance: string;
  favFlower: string;
  favPrasad: string;
  favColor: string;
  primaryTone: string; // Tailwind glow / border accent
  auraColor: string;
  haloGlow: string;
  bannerGradient: string;
  aartiId: string; // Links to AARTI_CHALISA_LIST
  deityIcon: string;
  sacredSymbol: string;
  // High-resolution artistic depiction URLs with graceful fallback
  primaryImage: string;
  symbolDescription: string;
}

export const SACRED_DEITIES_LIST: DeityVisualInfo[] = [
  // 0. Sunday: Bhagwan Surya Narayana (भगवान सूर्य देव)
  {
    id: 'surya-dev',
    name: 'Bhagwan Surya Dev',
    hindiName: 'भगवान सूर्य नारायण',
    dayIndex: 0,
    dayName: 'Sunday',
    hindiDayName: 'रविवार',
    subTitle: 'सर्व प्रकाशक, आरोग्य प्रदाता एवं भुवन भास्कर',
    mantra: 'ॐ ह्रीं ह्रीं सूर्याय सहस्रकिरणराय मनोवांछित फलम् देहि देहि स्वाहा॥',
    mantraMeaning: 'हे सहस्र किरणों वाले भगवान सूर्य, संसार के चक्षु, हमारे जीवन को तेज, आरोग्य एवं प्रकाश से भर दीजिए।',
    shloka: 'ध्येयः सदा सवितृमण्डल मध्यवर्ती नारायणः सरसिजासन सन्निविष्टः। केयूरवान् मकरकुण्डलवान् किरीटी हारी हिरण्मयवपुर्धृतशंखचक्रः॥',
    shlokaRef: 'सूर्य नमस्कार ध्यान श्लोक',
    significance: 'रविवार के दिन सूर्य देव का ध्यान आत्मबल, उच्च पद, नेत्र ज्योति, पिता का सुख तथा तेजस्विता प्रदान करता है।',
    favFlower: 'रक्त कमल, लाल गुड़हल व कनेर',
    favPrasad: 'गेहूं की खीर, गुड़ व तांबे के लोटे से अर्घ्य',
    favColor: 'केसरिया, ताम्र व स्वर्णिम पीत',
    primaryTone: 'text-amber-400 border-amber-500/60 shadow-amber-500/30',
    auraColor: 'rgba(245, 158, 11, 0.45)',
    haloGlow: 'from-amber-500 via-orange-500 to-yellow-300',
    bannerGradient: 'from-[#2b1704] via-[#1c0f05] to-[#0f0d0b]',
    aartiId: 'ram-aarti',
    deityIcon: '☀️',
    sacredSymbol: 'ॐ / सूर्य चक्र',
    primaryImage: '/assets/deities/surya.jpg',
    symbolDescription: 'सात घोड़ों के दिव्य रथ पर आरूढ़, सहस्र किरणों से अंधकार का नाश करने वाले प्रत्यक्ष देव।',
  },

  // 1. Monday: Bhagwan Shiva / Mahadev (देवाधिदेव महादेव)
  {
    id: 'shiva-mahadev',
    name: 'Bhagwan Shiva Mahadev',
    hindiName: 'देवाधिदेव भगवान शिव',
    dayIndex: 1,
    dayName: 'Monday',
    hindiDayName: 'सोमवार',
    subTitle: 'कैलाशपति, गंगाधर, त्रिनेत्रधारी आशुतोष महादेव',
    mantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
    mantraMeaning: 'हम त्रिनेत्रधारी सुगन्धित और पुष्टि के संवर्धक भगवान शिव की वंदना करते हैं। वे हमें जन्म-मृत्यु के बंधनों से मोक्ष प्रदान करें।',
    shloka: 'कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम्। सदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥',
    shlokaRef: 'शिव स्तुति (यजुर्वेद)',
    significance: 'सोमवार को भगवान भोलेनाथ की आराधना से अकाल मृत्यु का भय समाप्त होता है, मानसिक संताप मिटते हैं और मनोकामनाएं तुरंत सिद्ध होती हैं।',
    favFlower: 'बिल्वपत्र (बेलपत्र), श्वेत धतूरा, मदार व कनेर',
    favPrasad: 'कच्चा दूध, पंचामृत, भांग, चंदन व मिश्री',
    favColor: 'श्वेत (सफेद), भस्म रंग व आकाशीय नील',
    primaryTone: 'text-cyan-400 border-cyan-500/60 shadow-cyan-500/30',
    auraColor: 'rgba(56, 189, 248, 0.45)',
    haloGlow: 'from-cyan-400 via-sky-500 to-indigo-400',
    bannerGradient: 'from-[#071b26] via-[#09141f] to-[#0f0d0b]',
    aartiId: 'shiv-aarti',
    deityIcon: '🔱',
    sacredSymbol: 'त्रिशूल, डमरू व अर्धचन्द्र',
    primaryImage: '/assets/deities/shiva.jpg',
    symbolDescription: 'भाल पर त्रिपुण्ड, जटा में माँ गंगा, कंठ में हलाहल विष और मस्तक पर शीतल चन्द्रमा सुशोभित।',
  },

  // 2. Tuesday: Sankatmochan Shri Hanuman Ji (श्री हनुमान जी)
  {
    id: 'hanuman-ji',
    name: 'Sankatmochan Hanuman Ji',
    hindiName: 'संकटमोचन श्री हनुमान जी',
    dayIndex: 2,
    dayName: 'Tuesday',
    hindiDayName: 'मंगलवार',
    subTitle: 'पवनपुत्र, केसरीनंदन, रामदूत अतुलित बलधामा',
    mantra: 'ॐ हं हनुमते रुद्रात्मकाय हुं फट्। मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्॥',
    mantraMeaning: 'मन के समान वेग वाले, इन्द्रियों को जीतने वाले और बुद्धिमानों में श्रेष्ठ श्री रामदूत हनुमान जी को मैं शीश नवाता हूँ।',
    shloka: 'अतुलितबलधामं हेमशैलाभदेहं दनुजवनकृशानुं ज्ञानिनामग्रगण्यम्। सकलगुणनिधानं वानराणामधीशं रघुपतिप्रियभक्तं वातजातं नमामि॥',
    shlokaRef: 'श्री रामचरितमानस (सुंदरकांड मंगलाचरण)',
    significance: 'मंगलवार को श्री हनुमान जी के दर्शन से भूत-पिशाच, भय, कर्ज, कोर्ट-कचहरी और मंगल दोष के कष्ट दूर होते हैं।',
    favFlower: 'लाल गुलाब, गेंदा व चमेली का तेल-सिन्दूर',
    favPrasad: 'बूंदी के लड्डू, चने-गुड़ व पान का बीड़ा',
    favColor: 'केसरी सिन्दूरी, लाल व स्वर्णिम पीला',
    primaryTone: 'text-orange-400 border-orange-500/60 shadow-orange-500/30',
    auraColor: 'rgba(249, 115, 22, 0.45)',
    haloGlow: 'from-orange-500 via-red-500 to-yellow-400',
    bannerGradient: 'from-[#2b0e06] via-[#1a0a05] to-[#0f0d0b]',
    aartiId: 'hanuman-chalisa',
    deityIcon: '🚩',
    sacredSymbol: 'गदा, पर्वत व सिन्दूरी ध्वजा',
    primaryImage: '/assets/deities/hanuman.jpg',
    symbolDescription: 'वज्र समान शरीर, स्वर्ण पर्वत के समान कांति और हृदय में निरंतर श्री सीताराम का वास।',
  },

  // 3. Wednesday: Pratham Pujya Shri Ganesh Ji (श्री गणेश जी)
  {
    id: 'ganesh-ji',
    name: 'Pratham Pujya Shri Ganesh',
    hindiName: 'विघ्नहर्ता श्री गणेश जी',
    dayIndex: 3,
    dayName: 'Wednesday',
    hindiDayName: 'बुधवार',
    subTitle: 'ऋद्धि-सिद्धि दाता, गजानन, लंबोदर प्रथम पूज्य',
    mantra: 'ॐ गं गणपतये नमः। वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    mantraMeaning: 'हे टेढ़ी सूंड़ वाले, विशाल शरीर वाले और करोड़ों सूर्यों के समान तेजस्वी गणेश जी! मेरे समस्त कार्यों को निर्विघ्न पूर्ण करें।',
    shloka: 'गजाननं भूतगणादिसेवितं कपित्थजम्बूफलचारुभक्षणम्। उमासुतं शोकविनाशकारकं नमामि विघ्नेश्वरपादपंकजम्॥',
    shlokaRef: 'गणेश वंदना',
    significance: 'बुधवार को भगवान गणेश की पूजा से बुद्धि, विद्या, व्यापार वृद्धि तथा नए कार्यों में शत-प्रतिशत सफलता मिलती है।',
    favFlower: 'दूर्वा घास (दूब), लाल गुड़हल व पीला गेंदा',
    favPrasad: 'मोदक (लड्डू), केला व पंचमेवा',
    favColor: 'पीला, हरा (दूर्वा) व सिन्दूरी',
    primaryTone: 'text-yellow-400 border-yellow-500/60 shadow-yellow-500/30',
    auraColor: 'rgba(234, 179, 8, 0.45)',
    haloGlow: 'from-yellow-400 via-amber-500 to-emerald-400',
    bannerGradient: 'from-[#292004] via-[#191505] to-[#0f0d0b]',
    aartiId: 'ganesh-aarti',
    deityIcon: '🐘',
    sacredSymbol: 'स्वास्तिक, मोदक, अंकुश व दूर्वा',
    primaryImage: '/assets/deities/ganesh.jpg',
    symbolDescription: 'एकदन्त, चार भुजाधारी, पाश-अंकुश-वरद-मोदक धारण किए हुए मूषक वाहन पर विराजमान।',
  },

  // 4. Thursday: Lord Vishnu / Shri Hari Narayan (भगवान श्री हरि विष्णु)
  {
    id: 'vishnu-narayan',
    name: 'Bhagwan Shri Hari Vishnu',
    hindiName: 'भगवान श्री हरि विष्णु',
    dayIndex: 4,
    dayName: 'Thursday',
    hindiDayName: 'गुरुवार',
    subTitle: 'वैकुंठपति, जगतपालक, पीताम्बरधारी नारायण',
    mantra: 'ॐ नमो भगवते वासुदेवाय। ॐ विष्णवे नमः॥',
    mantraMeaning: 'सर्वव्यापी, सर्वसमर्थ और चराचर जगत के पालक वासुदेव नन्दन भगवान विष्णु को मेरा बारंबार नमन है।',
    shloka: 'शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्। लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥',
    shlokaRef: 'विष्णु सहस्रनाम मंगलाचरण',
    significance: 'गुरुवार को श्री हरि और देवगुरु बृहस्पति की आराधना से पारिवारिक सुख, वैवाहिक अनुकूलता, धन-समृद्धि एवं आध्यात्मिक शांति मिलती है।',
    favFlower: 'पीला कनेर, पीला गेंदा व तुलसी दल (अत्यंत प्रिय)',
    favPrasad: 'चने की दाल, गुड़, पीले फल, बेसन के लड्डू व पंचामृत',
    favColor: 'पीताम्बरी पीला, स्वर्णिम व केसरिया',
    primaryTone: 'text-amber-300 border-yellow-400/60 shadow-yellow-400/30',
    auraColor: 'rgba(251, 191, 36, 0.45)',
    haloGlow: 'from-yellow-300 via-amber-400 to-amber-600',
    bannerGradient: 'from-[#291e04] via-[#1a1304] to-[#0f0d0b]',
    aartiId: 'ram-aarti',
    deityIcon: '🪷',
    sacredSymbol: 'शंख, चक्र, गदा व पद्म (कमल)',
    primaryImage: '/assets/deities/vishnu.jpg',
    symbolDescription: 'क्षीरसागर में शेषनाग की शैय्या पर विश्रामरत, चतुर्भुज रूप में सुदर्शन चक्र व पाञ्चजन्य शंख धारण किए हुए।',
  },

  // 5. Friday: Maa Bhagwati Durga / Maa Lakshmi (माँ दुर्गा / माँ महालक्ष्मी)
  {
    id: 'durga-lakshmi',
    name: 'Maa Bhagwati Durga & Lakshmi',
    hindiName: 'माँ भगवती दुर्गा व महालक्ष्मी',
    dayIndex: 5,
    dayName: 'Friday',
    hindiDayName: 'शुक्रवार',
    subTitle: 'आदिशक्ति, अष्टभुजा, धन-धान्य ऐश्वर्य प्रदायिनी',
    mantra: 'सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥',
    mantraMeaning: 'सब मंगलों में मंगल रूप, कल्याणकारी, समस्त मनोरथों को सिद्ध करने वाली नारायणी हे गौरी! आपको मेरा सादर प्रणाम है।',
    shloka: 'या देवी सर्वभूतेषु शक्ति-रूपेण संस्थिता। नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः॥',
    shlokaRef: 'श्री दुर्गा सप्तशती',
    significance: 'शुक्रवार को माँ जगदम्बा और महालक्ष्मी की पूजा से दारिद्र्य दूर होता है, घर में वैभव, शांति, आभूषण एवं सौभाग्य की वृद्धि होती है।',
    favFlower: 'लाल कमल (गुलाबी कमल), लाल गुड़हल व गुलाब',
    favPrasad: 'खीर, मखाने, बताशे, श्रीफल (नारियल) व अनार',
    favColor: 'लाल, गुलाबी, सिन्दूरी व रानी रंग',
    primaryTone: 'text-rose-400 border-rose-500/60 shadow-rose-500/30',
    auraColor: 'rgba(244, 63, 94, 0.45)',
    haloGlow: 'from-rose-500 via-red-500 to-amber-300',
    bannerGradient: 'from-[#2b0811] via-[#1a070c] to-[#0f0d0b]',
    aartiId: 'durga-chalisa',
    deityIcon: '🌺',
    sacredSymbol: 'त्रिशूल, खड्ग, सुवर्ण कलश व सिंह',
    primaryImage: '/assets/deities/durga.jpg',
    symbolDescription: 'सिंह वाहिनी, अष्टादशभुजा, हाथ में चक्र-त्रिशूल-कमल लिए हुए सम्पूर्ण ब्रह्माण्ड की जननी।',
  },

  // 6. Saturday: Sankatmochan Hanuman & Shani Dev (श्री हनुमान जी व शनिदेव)
  {
    id: 'hanuman-shani',
    name: 'Shri Hanuman & Shani Dev',
    hindiName: 'श्री हनुमान जी व कर्मफल दाता शनिदेव',
    dayIndex: 6,
    dayName: 'Saturday',
    hindiDayName: 'शनिवार',
    subTitle: 'कष्ट भंजन, न्याय प्रिय, साढ़े साती शांति दाता',
    mantra: 'ॐ शं शनैश्चराय नमः। ॐ हं हनुमते नमः॥',
    mantraMeaning: 'सूर्यपुत्र मंदगामी शनिदेव और पवनसुत हनुमान जी हम पर कृपा करें और समस्त कर्म-दोषों को शांत करें।',
    shloka: 'नीलांजन समाभासं रविपुत्रं यमाग्रजम्। छायामार्तंड संभूतं तं नमामि शनैश्चरम्॥',
    shlokaRef: 'शनि स्तोत्र (दशरथ कृत)',
    significance: 'शनिवार को हनुमान चालीसा व शनिदेव के दर्शन से साढ़े साती, ढैय्या, अज्ञात भय और जीवन के संकट समाप्त होते हैं।',
    favFlower: 'नीली अपराजिता, काला तिल, शमी पत्र व गेंदा',
    favPrasad: 'सरसों के तेल का दीया, काली उड़द, गुलाब जामुन व गुड़-चना',
    favColor: 'नीला, श्याम (काला) व गहरा सिन्दूरी',
    primaryTone: 'text-indigo-400 border-indigo-500/60 shadow-indigo-500/30',
    auraColor: 'rgba(99, 102, 241, 0.45)',
    haloGlow: 'from-indigo-500 via-purple-600 to-amber-400',
    bannerGradient: 'from-[#110e2b] via-[#0c0a1a] to-[#0f0d0b]',
    aartiId: 'hanuman-aarti',
    deityIcon: '🛡️',
    sacredSymbol: 'शमी पत्र, सरसों दीपक व गदा',
    primaryImage: '/assets/deities/shani.jpg',
    symbolDescription: 'शनि की क्रूर दृष्टि से भक्तों की रक्षा करने वाले अतुलित बलशाली महावीर हनुमान जी।',
  },

  // Extra beloved deity: Shri Ram Darbar (मर्यादा पुरुषोत्तम श्री राम दरबार)
  {
    id: 'ram-darbar',
    name: 'Shri Ram Darbar',
    hindiName: 'श्री राम दरबार (सीता-राम)',
    dayIndex: 0,
    dayName: 'Special',
    hindiDayName: 'नित्य दर्शन',
    subTitle: 'मर्यादा पुरुषोत्तम श्री राम, माँ जानकी, लक्ष्मण व हनुमान जी',
    mantra: 'श्री राम जय राम जय जय राम। ॐ रां रामाय नमः॥',
    mantraMeaning: 'मर्यादा पुरुषोत्तम रघुकुल शिरोमणि श्री राम की सदा जय हो, जो भवसागर से पार उतारने वाले हैं।',
    shloka: 'रामाय रामभद्राय रामचंद्राय वेधसे। रघुनाथाय नाथाय सीतायाः पतये नमः॥',
    shlokaRef: 'श्री राम रक्षा स्तोत्र',
    significance: 'श्री राम दरबार के नित्य दर्शन से परिवार में एकता, धर्म, मर्यादा, सत्य और अटूट शांति की स्थापना होती है।',
    favFlower: 'सुगंधित गुलाब, कमल व तुलसी मंजरी',
    favPrasad: 'पंचामृत, पंजीरी, खीर व ऋतु फल',
    favColor: 'पीताम्बरी पीला व स्वर्णिम',
    primaryTone: 'text-yellow-300 border-yellow-400/60 shadow-yellow-400/30',
    auraColor: 'rgba(245, 158, 11, 0.45)',
    haloGlow: 'from-yellow-400 via-amber-500 to-orange-400',
    bannerGradient: 'from-[#2b1804] via-[#1c1004] to-[#0f0d0b]',
    aartiId: 'ram-aarti',
    deityIcon: '🏹',
    sacredSymbol: 'कोदण्ड धनुष, बाण व छत्र',
    primaryImage: '/assets/deities/ram_darbar.jpg',
    symbolDescription: 'सिंहासन पर विराजमान श्री राघव, वाम भाग में जानकी माता, दक्षिण में लक्ष्मण जी और चरणों में दास हनुमान।',
  },

  // Extra beloved deity: Radha Krishna (श्री राधा-कृष्ण)
  {
    id: 'radha-krishna',
    name: 'Shri Radha Krishna',
    hindiName: 'श्री राधा-कृष्ण जी',
    dayIndex: 3,
    dayName: 'Special',
    hindiDayName: 'नित्य दर्शन',
    subTitle: 'वृन्दावन बिहारी, मुरलीधर, रसराज श्यामसुंदर',
    mantra: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे। हरे राम हरे राम राम राम हरे हरे॥',
    mantraMeaning: 'हे परमात्मन! हे आनंद स्वरूप भगवान श्री कृष्ण और राधारानी, मुझे अपनी अनन्य निष्काम प्रेम भक्ति में लीन कीजिए।',
    shloka: 'कस्तूरीतिलकं ललाटपटले वक्षःस्थले कौस्तुभं नासाग्रे वरमौक्तिकं करतले वेणुं करे कङ्कणम्। सर्वाङ्गे हरिचन्दनं सुललितं कण्ठे च मुक्तावलिं गोपस्त्रीपरिवेष्टितो विजयते गोपालचूडामणिः॥',
    shlokaRef: 'गोपाल स्तोत्र',
    significance: 'श्री राधा-कृष्ण की आराधना से प्रेम, मधुर वाणी, आकर्षण, दांपत्य सामंजस्य और आनंद की वर्षा होती है।',
    favFlower: 'कदंब पुष्प, श्वेत चमेली व मालती',
    favPrasad: 'माखन-मिश्री, पेड़ा, पंचामृत व तुलसी दल',
    favColor: 'पीताम्बरी पीला व मोरपंखी नीला',
    primaryTone: 'text-teal-300 border-teal-400/60 shadow-teal-400/30',
    auraColor: 'rgba(45, 212, 191, 0.45)',
    haloGlow: 'from-teal-400 via-sky-500 to-amber-300',
    bannerGradient: 'from-[#052220] via-[#071618] to-[#0f0d0b]',
    aartiId: 'ram-aarti',
    deityIcon: '🪈',
    sacredSymbol: 'मुरली (बांसुरी), मोरपंख व कामधेनु',
    primaryImage: '/assets/deities/radha_krishna.jpg',
    symbolDescription: 'त्रिभंगी मुद्रा में मुरली अधरों पर धरे, मस्तक पर मोरपंख सुशोभित और साथ में श्री राधिका जी।',
  },

  // Extra beloved deity: Maa Mahalakshmi (माँ महालक्ष्मी)
  {
    id: 'lakshmi-mata',
    name: 'Maa Mahalakshmi',
    hindiName: 'माँ महालक्ष्मी जी',
    dayIndex: 5,
    dayName: 'Friday',
    hindiDayName: 'शुक्रवार / नित्य दर्शन',
    subTitle: 'कमलासना, अष्टलक्ष्मी, धन-ऐश्वर्य व सौभाग्य प्रदायिनी',
    mantra: 'ॐ श्रीं ह्रीं क्लीं त्रिभुवन महालक्ष्म्यै अस्माकं दारिद्र्यं नाशय प्रचुर धनं देहि देहि क्लीं ह्रीं श्रीं ॐ॥',
    mantraMeaning: 'हे त्रिभुवन की स्वामिनी माँ महालक्ष्मी, हमारे जीवन से दारिद्र्य व अभाव को दूर कर सुख, शांति, समृद्धि व वैभव का वरदान दीजिए।',
    shloka: 'नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते। शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते॥',
    shlokaRef: 'महालक्ष्मी अष्टकम् (इन्द्र कृत)',
    significance: 'माँ महालक्ष्मी के नित्य दर्शन से घर में सुख, शांति, धन-धान्य, व्यापार में अपार लाभ एवं गृह क्लेश का निवारण होता है।',
    favFlower: 'गुलाबी व रक्त कमल पुष्प, गुलाब व चमेली',
    favPrasad: 'खीर, बताशे, पंचमेवा, कमल गट्टा व मखाने',
    favColor: 'गुलाबी, रक्त वर्ण (लाल) व स्वर्णिम पीत',
    primaryTone: 'text-amber-300 border-yellow-500/60 shadow-yellow-500/30',
    auraColor: 'rgba(234, 179, 8, 0.45)',
    haloGlow: 'from-pink-400 via-rose-500 to-amber-300',
    bannerGradient: 'from-[#2b0816] via-[#1a060d] to-[#0f0d0b]',
    aartiId: 'durga-aarti',
    deityIcon: '🪷',
    sacredSymbol: 'कमल, स्वर्ण मुद्रा कलश व शंख',
    primaryImage: '/assets/deities/lakshmi.jpg',
    symbolDescription: 'कमल पुष्प पर विराजित, दोनों हाथों में कमल पुष्प धारण किए हुए, हाथ से स्वर्ण मुद्राओं की वर्षा करती हुई देवी।',
  },
];

// Helper to get deity according to today's day of week
export function getDayDeity(overrideDayIndex?: number): DeityVisualInfo {
  const currentDay = overrideDayIndex !== undefined ? overrideDayIndex : new Date().getDay();
  const found = SACRED_DEITIES_LIST.find((d) => d.dayIndex === currentDay);
  return found || SACRED_DEITIES_LIST[1]; // default Shiva
}

// Storage Schema for LocalStorage Sadhana & Bhakti Streak
export interface BhaktiSadhanaStorage {
  streakDays: number;
  totalLifetimeSadhana: number;
  lastActiveDate: string; // YYYY-MM-DD
  todayRituals: {
    diyaLit: boolean;
    bellRungCount: number;
    flowersCount: number;
    aartiPerformed: boolean;
    mantraChanted: boolean;
  };
  todayCompleted: boolean;
  unlockedBadges: string[];
  punyaPointsCollectedDate?: string;
}

export const SADHANA_STORAGE_KEY = 'panditji_mandir_sadhana_v1';

export function getTodayDateString(): string {
  return getISTCalendarParts(new Date()).dateKey;
}

export function getInitialSadhanaState(userPhone?: string | null): BhaktiSadhanaStorage {
  const today = getTodayDateString();
  const emptyState: BhaktiSadhanaStorage = {
    streakDays: 0,
    totalLifetimeSadhana: 0,
    lastActiveDate: today,
    todayRituals: {
      diyaLit: false,
      bellRungCount: 0,
      flowersCount: 0,
      aartiPerformed: false,
      mantraChanted: false,
    },
    todayCompleted: false,
    unlockedBadges: [],
  };

  if (typeof window === 'undefined') return emptyState;

  // Determine active user phone if not explicitly passed
  let phone = userPhone;
  if (phone === undefined) {
    try {
      phone = localStorage.getItem('panditji_active_mobile_phone');
    } catch {
      phone = null;
    }
  }

  // New user / not logged in -> Always show 0 stats
  if (!phone) {
    return emptyState;
  }

  const userKey = `panditji_bhakti_sadhana_${phone}`;

  try {
    const raw = localStorage.getItem(userKey) || localStorage.getItem(SADHANA_STORAGE_KEY);
    if (!raw) {
      return emptyState;
    }

    const parsed: BhaktiSadhanaStorage = JSON.parse(raw);

    // If day changed, reset today's rituals and recalculate streak
    if (parsed.lastActiveDate !== today) {
      const last = new Date(parsed.lastActiveDate);
      const curr = new Date(today);
      const diffTime = Math.abs(curr.getTime() - last.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let nextStreak = parsed.streakDays;
      if (diffDays > 1) {
        nextStreak = 0;
      }

      return {
        streakDays: nextStreak || 0,
        totalLifetimeSadhana: parsed.totalLifetimeSadhana || 0,
        lastActiveDate: today,
        todayRituals: {
          diyaLit: false,
          bellRungCount: 0,
          flowersCount: 0,
          aartiPerformed: false,
          mantraChanted: false,
        },
        todayCompleted: false,
        unlockedBadges: parsed.unlockedBadges || [],
      };
    }

    return parsed;
  } catch {
    return emptyState;
  }
}

export function saveSadhanaState(state: BhaktiSadhanaStorage, userPhone?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    let phone = userPhone;
    if (phone === undefined) {
      phone = localStorage.getItem('panditji_active_mobile_phone');
    }
    if (phone) {
      localStorage.setItem(`panditji_bhakti_sadhana_${phone}`, JSON.stringify(state));
    }
    localStorage.setItem(SADHANA_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Could not save sadhana state:', err);
  }
}
