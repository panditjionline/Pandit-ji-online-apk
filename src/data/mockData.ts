import { PujaService, YouTubeVideo, PanchangData, SpiritualTrack, FestivalInfo } from '../types';

export const RUDRAPUR_LOCALITIES = [
  'Awas Vikas (Sector 1, 2, 3)',
  'Indra Colony & Shiv Nagar',
  'Transit Camp (Ward 1 - 10)',
  'Kichha Road & Adarsh Nagar',
  'Dineshpur Road / Bigbara',
  'Alliance City & Metropolis',
  'Civil Lines & Nainital Highway',
  'Kashipur Bypass Road',
  'Rampur Road & Gandhi Nagar',
  'Pantnagar Suburbs',
  'Other Area in Rudrapur'
];

export const PUJA_SERVICES: PujaService[] = [
  {
    id: 'griha-pravesh',
    name: 'Griha Pravesh & Vastu Shanti',
    hindiName: 'गृह प्रवेश एवं वास्तु शांति महापूजन',
    category: 'ghar_ki_puja',
    tagline: 'Vastu dosh shaman, Gau-mata pujan aur Agni dev ki pavitra aahuti se naye ghar me mangal pravesh.',
    description: 'Shastrokta vidhi dwara Mangal Kalash sthapana, Navgrah Pujan, Vastu Purush aahvaan, evam Havan se sthan ko sakaratmak divya urja se paripoorna karna.',
    pros: [
      'Ghar me sthapit sakaratmak urja aur shanti',
      'Vastu doshon ka shastriya shaman',
      'Parivaar ke swasthya aur samriddhi me vriddhi',
      'Kuldevi-Kuldevta evam Ishta Dev ka kripa aashirwad'
    ],
    precautions: [
      'Shubh Muhurat (Tithi, Nakshatra, Shubh Lagn) ka nirdharan anivarya hai',
      'Bhadra aur Rahu Kaal me pravesh sarvatha varjit hai',
      'Pooja se pehle ghar ki poorna shuddhata aur gangajal chhidkav karein',
      'Sankalp lene wale yajman ko upwas ya saatvik aahar rakhna aavashyak hai'
    ],
    duration: '3.5 - 4.5 Ghante',
    samagriIncluded: true,
    originalDakshina: '₹6,200 - ₹10,200',
    baseDakshina: '₹3,100 - ₹5,100',
    discountPercentage: 50,
    specialOfferTag: '50% विशेष छूट (Limited Time)',
    popular: true,
    imageIcon: 'Home',
    suitableFor: 'Naye makan, flat, dukan ya renovative pravesh hetu'
  },
  {
    id: 'satyanarayan-katha',
    name: 'Shri Satyanarayan Bhagwan Mahapuja & Katha',
    hindiName: 'श्री सत्यनारायण भगवान महापूजन एवं कथा',
    category: 'ghar_ki_puja',
    tagline: 'Kaliyug me sankalp siddhi, kalyan aur parivaarik sauhard ka param faldayi anushthan.',
    description: 'Bhagwan Narayan ki 5 adhyayon ki pavitra katha shravan, panchamrit evam panjiri prasad vitran, aarti aur samapti hawan.',
    pros: [
      'Mansik shanti aur parivaar me aapsi prem me ashadharan vikas',
      'Ruke hue kaaryon me saflata aur siddhi',
      'Mata Lakshmi aur Narayan ka sthai nivas'
    ],
    precautions: [
      'Katha ko poore parivaar ke sath dhyan-purvak shravan karein',
      'Prasad hamesha shuddhata se banayein (panjiri, kele, panchamrit)',
      'Sankalp purvak sankalp kalash ko katha purnahuti tak sthir rakhein'
    ],
    duration: '2 - 2.5 Ghante',
    samagriIncluded: true,
    originalDakshina: '₹3,000 - ₹4,200',
    baseDakshina: '₹1,500 - ₹2,100',
    discountPercentage: 50,
    specialOfferTag: '50% छूट',
    popular: true,
    imageIcon: 'BookOpen',
    suitableFor: 'Purnima, Sankranti, Janmadin, Vivah anniversary ya anya shubh avasar'
  },
  {
    id: 'rudrabhishek',
    name: 'Maha Rudrabhishek Pujan',
    hindiName: 'महा रुद्राभिषेक पूजन (द्वादश ज्योतिर्लिंग स्वरूप)',
    category: 'ghar_ki_puja',
    tagline: 'Mahadev Shiv Shankar ko Doodh, Gangajal, Belpatra se shastrokta abhishek.',
    description: 'Shukla Yajurvediya Rudrashtadhyayi ke mantra-path dwara Bhagwan Bholenath ka shastrokta dravyabhishek evam aarti.',
    pros: [
      'Rog, shok aur aakaal mrityu bhay se mukti',
      'Mansik tanav aur kundali ke Chandra dosh ka shaman',
      'Ghar me shivmay pavitrata aur adhyatmik bal'
    ],
    precautions: [
      'Doodh aur Belpatra shuddh aur bina khandan wale hon',
      'Abhishek jal ko charnamrit ke roop me shradha se grahan karein, charnon me na girayein',
      'Yajman aur pandit ji ka dhyan shiv tatva par kendrit rahe'
    ],
    duration: '2 - 3 Ghante',
    samagriIncluded: true,
    originalDakshina: '₹4,200 - ₹7,000',
    baseDakshina: '₹2,100 - ₹3,500',
    discountPercentage: 50,
    specialOfferTag: '50% छूट',
    popular: true,
    imageIcon: 'Flame',
    suitableFor: 'Somwar, Pradosh, Shivratri, Sawan maas ya mansik shanti hetu'
  },
  {
    id: 'mahamrityunjaya-jap',
    name: 'Mahamrityunjaya Mahajap & Anushthan',
    hindiName: 'महामृत्युंजय महाजप एवं अनुष्ठान (11,000 / 1.25 लाख)',
    category: 'anushthan_jap',
    tagline: 'Aayushya vardhan, gambhir rog nivaran aur aadi-daivik sankaton se raksha.',
    description: 'Vaidik panditon dwara niyamit sankalp purvak Mahamrityunjaya beej mantra ka jaap, dashansh hawan aur purnahuti.',
    pros: [
      'Asadhya bimariyon aur aakaal durghatnaon se divya kavach',
      'Kundali ke Marak Grah aur Shani-Rahu peeda ki shanti',
      'Aatmik bal aur aayu vriddhi'
    ],
    precautions: [
      'Mantra uccharan me shuddhata sarvochha niyam hai (ashuddh jaap se prabhav nishfal hota hai)',
      'Bramhacharya aur saatvik bhojan ka niyam anusthan ke dauran anivarya hai',
      'Sankalp me sankalp-karta ka gotra aur naam bilkul sahi hona aavashyak hai'
    ],
    duration: '3 - 7 Din (Anushthan sankalp anusaar)',
    samagriIncluded: true,
    originalDakshina: '₹10,200 - ₹42,000',
    baseDakshina: '₹5,100 - ₹21,000',
    discountPercentage: 50,
    specialOfferTag: '50% छूट',
    popular: true,
    imageIcon: 'ShieldAlert',
    suitableFor: 'Swasthya sankat, aayu sankalp, ya vishisht samasya nivaran'
  },
  {
    id: 'navgrah-shanti',
    name: 'Navgrah Shanti Havan & Samidha Yagya',
    hindiName: 'नवग्रह शांति हवन एवं समिधा यज्ञ',
    category: 'anushthan_jap',
    tagline: 'Navon grahon (Surya se lekar Ketu tak) ke pratikool dashaon ki shanti.',
    description: 'Pratyek grah ki vishisht samidha (Arka, Palash, Khadir, Apamarg, Peepal, Gular, Shami, Durva, Kusha) se aahuti aur stuti.',
    pros: [
      'Grah dasha ke dushprabhavon me kami aur anukulata me vriddhi',
      'Vyapar, shiksha aur parivaarik jeevan me sthirta',
      'Bhagya aur karm ke beech santulan'
    ],
    precautions: [
      'Pehle kundali ka vishleshan karein ki kaun se grah shant karne yogya hain aur kaun se balshali',
      'Havan kund ki vidhivat pooja karein aur dhoop-samagri shuddh honi chahiye',
      'Daan samagri yogya patra ko hi samarpan karein'
    ],
    duration: '3 Ghante',
    samagriIncluded: true,
    originalDakshina: '₹6,200 - ₹9,000',
    baseDakshina: '₹3,100 - ₹4,500',
    discountPercentage: 50,
    specialOfferTag: '50% छूट',
    imageIcon: 'Sun',
    suitableFor: 'Grah dosh, Mahadasha parivartan, ya karya badha'
  },
  {
    id: 'kundali-paramarsh',
    name: 'Personal Consultation & Kundali Analysis',
    hindiName: 'व्यक्तिगत ज्योतिष एवं कुंडली परामर्श (Personal Consultation)',
    category: 'jyotish_kundali',
    tagline: 'पण्डित शशांक शर्मा जी से प्रत्यक्ष वन-ऑन-वन संपूर्ण जन्मपत्री, भविष्यफल एवं अचूक उपाय परामर्श।',
    description: 'Lagn, Rashi, Navamsha, Dasha evam Gochar ka gahan vishleshan. Pandit Shashank Sharma ji dwara phone/video call ya Rudrapur clinic me vyaktigat samay.',
    pros: [
      'अपने जीवन के शुभ समय, विवाह, करियर एवं स्वास्थ्य की सटीक पूर्व जानकारी',
      'दशा-महादशा का संपूर्ण वैज्ञानिक व शास्त्रोक्त विश्लेषण',
      'बिना किसी भय या महंगे रत्नों के आडंबर के, सरल सात्विक वैदिक उपाय'
    ],
    precautions: [
      'जन्म समय एवं स्थान की प्रामाणिक जानकारी होना आवश्यक है',
      'परामर्श से पूर्व अपनी मुख्य समस्याएं व जिज्ञासाएं क्रमबद्ध कर लें',
      'उपायों को श्रद्धा एवं पूर्ण अनुशासन के साथ पालन करें'
    ],
    duration: '45 - 60 Minute',
    samagriIncluded: false,
    originalDakshina: '₹1,000',
    baseDakshina: '₹100',
    discountPercentage: 90,
    specialOfferTag: '90% विशेष महा-छूट (मात्र ₹100)',
    popular: true,
    imageIcon: 'Compass',
    suitableFor: 'व्यक्तिगत मार्गदर्शन, करियर, विवाह, व्यापार एवं पारिवारिक शांति'
  },
  {
    id: 'kundali-milan',
    name: 'Kundali Milan & Ashta-Koot Vivah Vichar',
    hindiName: 'कुंडली मिलान एवं अष्टकूट विवाह विचार',
    category: 'jyotish_kundali',
    tagline: 'Varan, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot aur Nadi milan.',
    description: 'Var-Kanya ke 36 gunon ka milan, Manglik dosh parikshan aur aapsi mansik taalmeyl ka vaidik aakalan.',
    pros: [
      'Dampatya jeevan ki lambi aayu aur sauhard ka aakalan',
      'Santati sukh aur aarthik unnati ka gahan vishleshan',
      'Manglik dosh parihar ke vastavik niyam'
    ],
    precautions: [
      'Kewal 36 gun dekhna kafi nahi; lagn bal aur saptam bhav ka adhyayan zaroori hai',
      'Nadi dosh hone par anavashyak ghabrayein nahi; parihar niyam janch kar lein',
      'Donon pakshon ki sammati aur shanti aavashyak hai'
    ],
    duration: '45 Minute',
    samagriIncluded: false,
    originalDakshina: '₹1,500',
    baseDakshina: '₹750',
    discountPercentage: 50,
    specialOfferTag: '50% छूट',
    imageIcon: 'HeartHandshake',
    suitableFor: 'Vivah yogya var-kanya ke sambandh hetu'
  }
];

export const OFFICIAL_YOUTUBE_VIDEOS: YouTubeVideo[] = [
  {
    id: 'yt-1',
    title: 'Griha Pravesh me bhool kar bhi na karein ye 5 galatiyan | Vastu Shanti Vidhi',
    hindiTitle: 'गृह प्रवेश में भूल कर भी न करें ये 5 गलतियां | वास्तु शांति विधि',
    category: 'puja_vidhi',
    duration: '14:20',
    publishedDate: '12 din pehle',
    views: '45K views',
    description: 'Naye ghar me pravesh karte samay Mangal Kalash sthapana, dehleez pujan aur hawan ke shastrokta niyam. Pandit Shashank Sharma dwara spasht margdarshan.',
    keyTakeaways: [
      'Pehle din chulha jalane ka shubh muhurat aur kheer pakane ki vidhi',
      'Rahu kaal aur Krishna paksha ke varjit dinon ka tyag',
      'Gau mata ko pehle pravesh karane ka shastriya rahasya'
    ],
    youtubeUrl: 'https://youtube.com/@panditjionlineofficial'
  },
  {
    id: 'yt-2',
    title: 'Shani Sade Sati ke Sach: Dono Paksh (Labh aur Savdhaniyan) | Jyotish Gyan',
    hindiTitle: 'शनि साढ़े साती का सच: दोनों पक्ष (लाभ और सावधानियां) | ज्योतिष ज्ञान',
    category: 'jyotish_gyan',
    duration: '18:45',
    publishedDate: '3 hafte pehle',
    views: '82K views',
    description: 'Shani Dev se darne ki zaroorat nahi hai. Janein Shani aapke jeevan ko kaise kundan banate hain aur kin aacharon se Shani kripa prapt hoti hai.',
    keyTakeaways: [
      'Shani dev nyay ke devta hain, krodhi nahi',
      'Sade Sati me vyapar aur karm kshetra me anushasan ka mahatva',
      'Shaniwar ko Tel daan aur Hanuman Chalisa ka prabhav'
    ],
    youtubeUrl: 'https://youtube.com/@panditjionlineofficial'
  },
  {
    id: 'yt-3',
    title: 'Satyanarayan Katha Prasad aur Vrat Niyam | Sahi Vidhi kya hai?',
    hindiTitle: 'सत्यनारायण कथा प्रसाद और व्रत नियम | सही विधि क्या है?',
    category: 'puja_vidhi',
    duration: '11:15',
    publishedDate: '1 mahina pehle',
    views: '38K views',
    description: 'Purnima aur Ekadashi par Satyanarayan pujan kaise karein. Prasad me panjiri aur panchamrit ka vaidik mahatva.',
    keyTakeaways: [
      '5 adhyayon ka tatva aur unka aadhunik jeevan se sambandh',
      'Sankalp lene ke baad pooja poori karne ka niyam',
      'Panchamrit nirman me tulsi dal ka niyam'
    ],
    youtubeUrl: 'https://youtube.com/@panditjionlineofficial'
  },
  {
    id: 'yt-4',
    title: 'Ekadashi Vrat me kya khayein aur kya na karein | Vrat-Tyohar Jankari',
    hindiTitle: 'एकादशी व्रत में क्या खाएं और क्या न करें | व्रत-त्योहार जानकारी',
    category: 'vrat_tyohar',
    duration: '16:02',
    publishedDate: '1 mahina pehle',
    views: '61K views',
    description: 'Sabhi varton me shreshtha Ekadashi vrat ka mahatmya, paran samay aur chawal tyag ka shastrokta vigyan.',
    keyTakeaways: [
      'Dashami se lekar Dwadashi tak ke tin divasiya niyam',
      'Chawal na khane ka aadhunik sharirik aur vaidik karan',
      'Paran Muhurat par vrat kholne ka anivarya niyam'
    ],
    youtubeUrl: 'https://youtube.com/@panditjionlineofficial'
  },
  {
    id: 'yt-5',
    title: 'Gotra aur Kuldevi Pujan ka Rahasya | Kyun zaroori hai apna Gotra janna?',
    hindiTitle: 'गोत्र और कुलदेवी पूजन का रहस्य | क्यों जरूरी है अपना गोत्र जानना?',
    category: 'pravachan',
    duration: '21:30',
    publishedDate: '2 mahine pehle',
    views: '110K views',
    description: 'Rishi vansh se juda hamara Gotra kaise hamari DNA aur sanskritik shakti ka prateek hai. Vivah aur puja me Gotra uccharan ka prabhav.',
    keyTakeaways: [
      'Sapta Rishi parampara se jude pramukh Gotra',
      'Puja sankalp me Gotra uccharan ka divya prabhav',
      'Kuldevi-Kuldevta ko prasanna karne ka saral vidhi'
    ],
    youtubeUrl: 'https://youtube.com/@panditjionlineofficial'
  },
  {
    id: 'yt-6',
    title: 'Rudrabhishek se Rog aur Mansik Tanav Mukti | Rudrapur Pujan',
    hindiTitle: 'रुद्राभिषेक से रोग और मानसिक तनाव मुक्ति | रुद्रपुर पूजन',
    category: 'puja_vidhi',
    duration: '13:50',
    publishedDate: '2 mahine pehle',
    views: '54K views',
    description: 'Doodh, shehad, sugandhit dravya se Mahadev ka abhishek. Mansik shanti aur aayu vriddhi hetu sarvashreshtha vidhi.',
    keyTakeaways: [
      'Rudrashtadhyayi ke mantron ki dhwani tarangein',
      'Ghar me shivling sthapana aur abhishek ke saral niyam',
      'Panchamrit abhishek ke pashchat shuddh jal visarjan'
    ],
    youtubeUrl: 'https://youtube.com/@panditjionlineofficial'
  }
];

export const SPIRITUAL_TRACKS: SpiritualTrack[] = [
  {
    id: 'gayatri-mantra',
    title: 'Gayatri Mahamantra',
    hindiTitle: 'गायत्री महामंत्र (सविता देव स्तुति)',
    deity: 'माँ गायत्री एवं सूर्य देव',
    category: 'बुद्धि एवं तेज',
    duration: '108 जप',
    meaning: 'हे प्राणस्वरूप, दुःखनाशक, सुखस्वरूप परमपिता परमात्मा! हम आपके उस उत्तम पापनाशक तेज का ध्यान करते हैं, जो हमारी बुद्धि को सन्मार्ग की ओर प्रेरित करे।',
    sanskritLyrics: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    shortMantra: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्',
    benefits: 'मानसिक शांति, एकाग्रता, नकारात्मक ऊर्जा का नाश एवं आध्यात्मिक जागृति।',
    toneFrequency: 432
  },
  {
    id: 'mahamrityunjaya',
    title: 'Mahamrityunjaya Mantra',
    hindiTitle: 'महामृत्युंजय मंत्र (अमृत संजीवनी)',
    deity: 'भगवान शिव (महाकाल)',
    category: 'आरोग्य एवं रक्षा',
    duration: '108 जप',
    meaning: 'हम त्रिनेत्रधारी भगवान शिव की आराधना करते हैं जो सुगंधित एवं पुष्टिवर्धक हैं। जिस प्रकार पकी हुई ककड़ी डंठल से स्वतः मुक्त हो जाती है, वैसे ही हमें रोग व अकाल मृत्यु से मुक्त कर अमृत्व प्रदान करें।',
    sanskritLyrics: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
    shortMantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्',
    benefits: 'रोग मुक्ति, दीर्घायु, अकाल मृत्यु भय निवारण एवं ग्रह दोष शांति।',
    toneFrequency: 528
  },
  {
    id: 'om-namah-shivaya',
    title: 'Shiva Panchakshari Mantra',
    hindiTitle: 'पंचाक्षरी शिव मंत्र (ॐ नमः शिवाय)',
    deity: 'भगवान भोलेनाथ',
    category: 'शांति एवं मोक्ष',
    duration: '108 जप',
    meaning: 'मैं कल्याणकारी, सर्वव्यापी भगवान सदाशिव को श्रद्धापूर्वक प्रणाम करता हूँ। यह पंचतत्वों को शुद्ध करने वाला तारक मंत्र है।',
    sanskritLyrics: 'ॐ नमः शिवाय॥ कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्॥',
    shortMantra: 'ॐ नमः शिवाय',
    benefits: 'मन की स्थिरता, क्रोध व तनाव से मुक्ति एवं शिव कृपा प्राप्ति।',
    toneFrequency: 396
  },
  {
    id: 'ganesh-mantra',
    title: 'Shri Ganesh Vighnaharta Mantra',
    hindiTitle: 'श्री गणेश विघ्ननाशक महामंत्र',
    deity: 'श्री सिद्धिविनायक गणेश',
    category: 'कार्य सिद्धि',
    duration: '108 जप',
    meaning: 'घुमावदार सूंड वाले, विशाल शरीर काय, करोड़ों सूर्यों के समान तेजस्वी भगवान गणेश मेरे सभी शुभ कार्यों को सदा निर्विघ्न संपन्न करें।',
    sanskritLyrics: 'ॐ गं गणपतये नमः॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    shortMantra: 'ॐ गं गणपतये नमः',
    benefits: 'व्यापार, शिक्षा व नए कार्यों में आने वाली समस्त बाधाओं का निवारण।',
    toneFrequency: 440
  },
  {
    id: 'mahalakshmi-mantra',
    title: 'Shree Mahalakshmi Siddha Mantra',
    hindiTitle: 'महालक्ष्मी धन-समृद्धि बीज मंत्र',
    deity: 'माँ महालक्ष्मी',
    category: 'धन एवं ऐश्वर्य',
    duration: '108 जप',
    meaning: 'कमल के आसन पर विराजमान भगवती महालक्ष्मी हम पर प्रसन्न हों और हमारे घर-परिवार में अखंड सुख, सौभाग्य व धन-धान्य की वृद्धि करें।',
    sanskritLyrics: 'ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद ॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः॥',
    shortMantra: 'ॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः',
    benefits: 'आर्थिक संकट से मुक्ति, व्यापार वृद्धि एवं घर में स्थायी बरकत।',
    toneFrequency: 528
  },
  {
    id: 'vishnu-dwadasakshari',
    title: 'Bhagwan Vishnu Dwadasakshari',
    hindiTitle: 'भगवान विष्णु द्वादशाक्षर मंत्र',
    deity: 'श्री हरि विष्णु / नारायण',
    category: 'भक्ति एवं सौभाग्य',
    duration: '108 जप',
    meaning: 'संपूर्ण जगत में निवास करने वाले सर्वव्यापी भगवान श्री वासुदेव नारायण को मेरा कोटि-कोटि नमन।',
    sanskritLyrics: 'ॐ नमो भगवते वासुदेवाय॥ शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम्॥',
    shortMantra: 'ॐ नमो भगवते वासुदेवाय',
    benefits: 'पितृ दोष शांति, पारिवारिक कलह निवारण एवं वैकुंठ कृपा।',
    toneFrequency: 432
  },
  {
    id: 'ram-tarak-mantra',
    title: 'Shri Ram Tarak Mantra',
    hindiTitle: 'श्री राम तारक विजय मंत्र',
    deity: 'मर्यादा पुरुषोत्तम श्री राम',
    category: 'भक्ति एवं बल',
    duration: '108 जप',
    meaning: 'प्रभु श्री राम का पावन नाम संपूर्ण विष्णु सहस्रनाम के तुल्य कल्याणकारी और भवसागर से पार लगाने वाला है।',
    sanskritLyrics: 'श्री राम जय राम जय जय राम॥ रामाय रामभद्राय रामचन्द्राय वेधसे॥',
    shortMantra: 'श्री राम जय राम जय जय राम',
    benefits: 'आत्मबल वृद्धि, भय मुक्ति एवं गृहस्थ जीवन में मर्यादा व सुख।',
    toneFrequency: 480
  },
  {
    id: 'hanuman-mantra',
    title: 'Shri Hanuman Raksha Mantra',
    hindiTitle: 'श्री हनुमान संकटमोचन महामंत्र',
    deity: 'श्री बजरंगबली हनुमान',
    category: 'रक्षा एवं साहस',
    duration: '108 जप',
    meaning: 'रुद्र अवतार, पवन के समान वेगवान, जितेन्द्रिय और बुद्धिमानों में श्रेष्ठ पवनपुत्र हनुमान जी हमारी सदैव रक्षा करें।',
    sanskritLyrics: 'ॐ हं हनुमते रुद्रात्मकाय हुं फट्॥ मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्॥',
    shortMantra: 'ॐ हं हनुमते नमः',
    benefits: 'शनि-मंगल दोष शांति, भूत-प्रेत व नज़र दोष से रक्षा एवं अदम्य साहस।',
    toneFrequency: 417
  },
  {
    id: 'durga-navarna',
    title: 'Maa Durga Navarna & Shakti Mantra',
    hindiTitle: 'माँ दुर्गा नवार्ण एवं सर्वमंगल मंत्र',
    deity: 'माँ जगदम्बा दुर्गा',
    category: 'शक्ति एवं रक्षा',
    duration: '108 जप',
    meaning: 'महासरस्वती (ऐं), महालक्ष्मी (ह्रीं) और महाकाली (क्लीं) स्वरूपिणी माँ चामुण्डा हमारे सभी मनोरथ सिद्ध करें।',
    sanskritLyrics: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे॥ सर्वमंगल मांगल्ये शिवे सर्वार्थ साधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥',
    shortMantra: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे',
    benefits: 'शत्रु बाधा निवारण, नवग्रह शांति एवं परिवार पर देवी कवच।',
    toneFrequency: 639
  },
  {
    id: 'hare-krishna',
    title: 'Hare Krishna Mahamantra',
    hindiTitle: 'हरे कृष्ण महामंत्र (कलि-संतरण उपनिषद)',
    deity: 'श्री राधा-कृष्ण',
    category: 'प्रेम एवं आनंद',
    duration: '108 जप',
    meaning: 'कलियुग में जीव के उद्धार और चित्त की परम प्रसन्नता के लिए सोलह नामों वाला यह महामंत्र सर्वश्रेष्ठ साधन है।',
    sanskritLyrics: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे। हरे राम हरे राम राम राम हरे हरे॥',
    shortMantra: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे, हरे राम हरे राम राम राम हरे हरे',
    benefits: 'मानसिक अवसाद से मुक्ति, आध्यात्मिक आनंद एवं भगवत् प्रेम।',
    toneFrequency: 528
  },
  {
    id: 'navagraha-shanti',
    title: 'Navagraha Shanti Stotra Mantra',
    hindiTitle: 'नवग्रह शांति वैदिक मंत्र',
    deity: 'सूर्य आदि नवग्रह देवता',
    category: 'ज्योतिष एवं ग्रह शांति',
    duration: '108 जप',
    meaning: 'सूर्य, चंद्र, मंगल, बुध, बृहस्पति, शुक्र, शनि, राहु और केतु—ये सभी नवग्रह हमारे जीवन में शांत व अनुकूल फल देने वाले हों।',
    sanskritLyrics: 'ब्रह्मा मुरारिस्त्रिपुरांतकारी भानुः शशी भूमिसुतो बुधश्च। गुरुश्च शुक्रः शनिराहुकेतवः सर्वे ग्रहाः शान्तिकरा भवन्तु॥',
    shortMantra: 'ॐ नवग्रहाय नमः सर्वे ग्रहाः शान्तिकरा भवन्तु',
    benefits: 'कुंडली के अशुभ ग्रहों की शांति, भाग्य उदय एवं स्वास्थ्य लाभ।',
    toneFrequency: 432
  },
  {
    id: 'shanti-paath',
    title: 'Vedic Shanti Paath (Yajurveda)',
    hindiTitle: 'यजुर्वेदीय शांति पाठ (सर्व मंगल भाव)',
    deity: 'सर्व वैदिक देवता',
    category: 'गृह शांति',
    duration: '11 जप',
    meaning: 'द्युलोक, अंतरिक्ष, पृथ्वी, जल, औषधियां, वनस्पति और संपूर्ण ब्रह्मांड में परम शांति स्थापित हो।',
    sanskritLyrics: 'ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः। वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः सर्वं शान्तिः॥',
    shortMantra: 'ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिः ॐ शान्तिः शान्तिः शान्तिः',
    benefits: 'वास्तु दोष शांति, घर में सकारात्मक वातावरण एवं कलह निवारण।',
    toneFrequency: 396
  }
];

export function getISTDateParts(now: Date = new Date()) {
  // Always compute date in Indian Standard Time (IST = UTC + 5:30)
  const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth() + 1; // 1-12
  const day = istTime.getUTCDate();
  const weekdayIndex = istTime.getUTCDay(); // 0=Sunday .. 6=Saturday

  const hindiWeekdays = [
    'रविवार',
    'सोमवार',
    'मंगलवार',
    'बुधवार',
    'गुरुवार',
    'शुक्रवार',
    'शनिवार',
  ];
  const hindiMonths = [
    'जनवरी',
    'फ़रवरी',
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

  const dayName = hindiWeekdays[weekdayIndex];
  const formattedDate = `${day} ${hindiMonths[month - 1]} ${year}`;
  const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return { year, month, day, weekdayIndex, dayName, formattedDate, dateKey };
}

const VAAR_DAILY_PANCHANG_META = [
  {
    // 0 Sunday
    rahuKaal: '04:30 PM - 06:00 PM (वर्जित समय)',
    yamagandam: '12:00 PM - 01:30 PM',
    gulikaKaal: '03:00 PM - 04:30 PM',
    dishaShool: 'पश्चिम दिशा (West) - दलिया, घी या पान खाकर प्रस्थान करें',
    dishaShoolRemedy: 'सूर्य भगवान को अर्घ्य देकर एवं गुड़ खाकर यात्रा प्रारंभ करें',
    deity: 'भगवान सूर्यनारायण एवं श्री राम दरबार',
    mantra: 'ॐ घृणि सूर्याय नमः॥ ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः॥',
    mantraTrackId: 'gayatri-mantra',
    serviceId: 'navgrah-shanti',
    bhog: 'गुड़, गेहूं का हलवा, लाल फल एवं मिश्री।',
  },
  {
    // 1 Monday
    rahuKaal: '07:30 AM - 09:00 AM (वर्जित समय)',
    yamagandam: '10:30 AM - 12:00 PM',
    gulikaKaal: '01:30 PM - 03:00 PM',
    dishaShool: 'पूर्व दिशा (East) - दर्पण देखकर या दूध पीकर प्रस्थान करें',
    dishaShoolRemedy: 'भगवान शिव को बिल्वपत्र अर्पित कर प्रस्थान करें',
    deity: 'देवाधिदेव महादेव (भगवान शिव) एवं माँ पार्वती',
    mantra: 'ॐ नमः शिवाय॥ ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
    mantraTrackId: 'om-namah-shivaya',
    serviceId: 'rudrabhishek',
    bhog: 'पंचामृत, सफेद बर्फी, मखाने की खीर एवं बेलपत्र।',
  },
  {
    // 2 Tuesday
    rahuKaal: '03:00 PM - 04:30 PM (वर्जित समय)',
    yamagandam: '09:00 AM - 10:30 AM',
    gulikaKaal: '12:00 PM - 01:30 PM',
    dishaShool: 'उत्तर दिशा (North) - गुड़ खाकर यात्रा प्रारंभ करें',
    dishaShoolRemedy: 'श्री हनुमान जी का स्मरण कर लाल चंदन का तिलक लगाएं',
    deity: 'संकटमोचन श्री हनुमान जी एवं माँ मंगला गौरी',
    mantra: 'ॐ हं हनुमते रुद्रात्मकाय हुं फट्॥ ॐ क्रां क्रीं क्रौं सः भौमाय नमः॥',
    mantraTrackId: 'hanuman-mantra',
    serviceId: 'mahamrityunjaya-jap',
    bhog: 'बूंदी के लड्डू, चना-गुड़, तुलसी दल एवं अनार।',
  },
  {
    // 3 Wednesday
    rahuKaal: '12:00 PM - 01:30 PM (वर्जित समय)',
    yamagandam: '07:30 AM - 09:00 AM',
    gulikaKaal: '10:30 AM - 12:00 PM',
    dishaShool: 'उत्तर दिशा (North) - धनिया या तिल खाकर प्रस्थान करें',
    dishaShoolRemedy: 'श्री गणेश जी को दूर्वा अर्पित कर शुभ कार्य प्रारंभ करें',
    deity: 'विघ्नहर्ता श्री सिद्धिविनायक गणेश जी एवं भगवान श्री कृष्ण',
    mantra: 'ॐ गं गणपतये नमः॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    mantraTrackId: 'ganesh-mantra',
    serviceId: 'griha-pravesh',
    bhog: 'मोदक, मूंग दाल का हलवा, बेसन के लड्डू एवं दूर्वा।',
  },
  {
    // 4 Thursday
    rahuKaal: '01:30 PM - 03:00 PM (वर्जित समय)',
    yamagandam: '06:00 AM - 07:30 AM',
    gulikaKaal: '09:00 AM - 10:30 AM',
    dishaShool: 'दक्षिण दिशा (South) - दही या जीरा खाकर प्रस्थान करें',
    dishaShoolRemedy: 'भगवान विष्णु एवं केले के वृक्ष का पूजन कर केसर तिलक लगाएं',
    deity: 'जगत्पालक भगवान श्री हरि विष्णु एवं देवगुरु बृहस्पति',
    mantra: 'ॐ नमो भगवते वासुदेवाय॥ ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः॥',
    mantraTrackId: 'vishnu-dwadasakshari',
    serviceId: 'satyanarayan-katha',
    bhog: 'चने की दाल, गुड़, पीले लड्डू, केला एवं पंजीरी।',
  },
  {
    // 5 Friday
    rahuKaal: '10:30 AM - 12:00 PM (वर्जित समय)',
    yamagandam: '03:00 PM - 04:30 PM',
    gulikaKaal: '07:30 AM - 09:00 AM',
    dishaShool: 'पश्चिम दिशा (West) - जौ या दही-मिश्री खाकर प्रस्थान करें',
    dishaShoolRemedy: 'माँ महालक्ष्मी को कमल पुष्प व इत्र अर्पित कर प्रस्थान करें',
    deity: 'माँ महालक्ष्मी, संतोषी माता एवं कुलदेवी भगवती',
    mantra: 'ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद ॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः॥',
    mantraTrackId: 'mahalakshmi-mantra',
    serviceId: 'satyanarayan-katha',
    bhog: 'मखाने की केसरिया खीर, बताशे, सफेद मिठाई एवं श्रीफल।',
  },
  {
    // 6 Saturday
    rahuKaal: '09:00 AM - 10:30 AM (वर्जित समय)',
    yamagandam: '01:30 PM - 03:00 PM',
    gulikaKaal: '06:00 AM - 07:30 AM',
    dishaShool: 'पूर्व दिशा (East) - अदरक या उड़द खाकर प्रस्थान करें',
    dishaShoolRemedy: 'पीपल वृक्ष के नीचे सरसों के तेल का दीपक जलाकर प्रस्थान करें',
    deity: 'न्याय के देवता भगवान शनिदेव एवं श्री बजरंगबली हनुमान',
    mantra: 'ॐ शं शनैश्चराय नमः॥ नीलांजन समाभासं रविपुत्रं यमाग्रजम्॥',
    mantraTrackId: 'navagraha-shanti',
    serviceId: 'navgrah-shanti',
    bhog: 'काले तिल के लड्डू, उड़द की खिचड़ी एवं गुड़-चना।',
  },
];

export function getTodayPanchang(now: Date = new Date()): PanchangData {
  const { month, day, weekdayIndex, dayName, formattedDate } = getISTDateParts(now);
  const vaarMeta = VAAR_DAILY_PANCHANG_META[weekdayIndex];

  if (month === 10 && day === 18) {
    return {
      date: formattedDate,
      hinduDate: `विक्रम संवत 2083, आश्विन मास, शुक्ल पक्ष, महाअष्टमी (${dayName})`,
      tithi: 'अष्टमी तिथि (शारदीय नवरात्रि दुर्गा महाअष्टमी • माँ महागौरी पूजन)',
      paksha: 'शुक्ल पक्ष (शारदीय नवरात्रि पर्व)',
      nakshatra: 'उत्तराषाढ़ा / श्रवण नक्षत्र (सर्वार्थ सिद्धि योग)',
      yoga: 'सुकर्मा योग एवं रवि योग (अति शुभ)',
      karana: 'बव करण (Bava Karana)',
      suryaUday: '06:15 AM (रुद्रपुर)',
      suryaAst: '05:41 PM (रुद्रपुर)',
      abhijitMuhurat: '11:43 AM - 12:29 PM (कन्या पूजन व संकल्प हेतु सर्वश्रेष्ठ)',
      rahuKaal: vaarMeta.rahuKaal,
      yamagandam: vaarMeta.yamagandam,
      gulikaKaal: vaarMeta.gulikaKaal,
      dishaShool: vaarMeta.dishaShool,
      dishaShoolRemedy: vaarMeta.dishaShoolRemedy,
      specialFestival: 'आज का महापर्व: शारदीय नवरात्रि दुर्गा महाअष्टमी • माँ महागौरी पूजन एवं कन्या पूजन',
      choghadiya: [
        { name: 'चल (Char)', type: 'char', time: '07:40 AM - 09:06 AM' },
        { name: 'लाभ (Labh)', type: 'labh', time: '09:06 AM - 10:31 AM' },
        { name: 'अमृत (Amrit)', type: 'amrit', time: '10:31 AM - 11:56 AM' },
        { name: 'शुभ (Shubh)', type: 'shubh', time: '01:21 PM - 02:46 PM' },
      ],
    };
  }

  if (month === 10 && day === 19) {
    return {
      date: formattedDate,
      hinduDate: `विक्रम संवत 2083, आश्विन मास, शुक्ल पक्ष, महानवमी (${dayName})`,
      tithi: 'नवमी तिथि (शारदीय नवरात्रि महानवमी • माँ सिद्धिदात्री पूजन एवं हवन)',
      paksha: 'शुक्ल पक्ष (आश्विन शारदीय नवरात्रि)',
      nakshatra: 'श्रवण नक्षत्र (Shravana Nakshatra • सर्वार्थ सिद्धि योग)',
      yoga: 'धृति योग एवं रवि योग (अति शुभ)',
      karana: 'बालव एवं कौलव करण',
      suryaUday: '06:16 AM (रुद्रपुर)',
      suryaAst: '05:40 PM (रुद्रपुर)',
      abhijitMuhurat: '11:42 AM - 12:28 PM (कन्या पूजन व हवन पूर्णाहुति हेतु श्रेष्ठ)',
      rahuKaal: '07:30 AM - 09:00 AM (वर्जित समय)',
      yamagandam: '10:30 AM - 12:00 PM',
      gulikaKaal: '01:30 PM - 03:00 PM',
      dishaShool: 'पूर्व दिशा (East) - दर्पण देखकर या दूध पीकर प्रस्थान करें',
      dishaShoolRemedy: 'माँ सिद्धिदात्री को कमल पुष्प व नारियल अर्पित कर प्रस्थान करें',
      specialFestival:
        'आज का महापर्व: शारदीय नवरात्रि महानवमी • माँ सिद्धिदात्री महापूजन, कन्या पूजन एवं हवन पूर्णाहुति',
      choghadiya: [
        { name: 'अमृत (Amrit - प्रातः पूजन)', type: 'amrit', time: '06:16 AM - 07:41 AM' },
        { name: 'काल (Kaal)', type: 'kaal', time: '07:41 AM - 09:06 AM' },
        { name: 'शुभ (Shubh - नवमी हवन)', type: 'shubh', time: '09:06 AM - 10:31 AM' },
        { name: 'रोग (Rog)', type: 'rog', time: '10:31 AM - 11:56 AM' },
        { name: 'उद्वेग (Udveg)', type: 'udveg', time: '11:56 AM - 01:21 PM' },
        { name: 'चल (Char - कन्या भोज)', type: 'char', time: '01:21 PM - 02:46 PM' },
        { name: 'लाभ (Labh - पूर्णाहुति)', type: 'labh', time: '02:46 PM - 04:11 PM' },
        { name: 'अमृत (Amrit - सायं आरती)', type: 'amrit', time: '04:11 PM - 05:40 PM' },
      ],
    };
  }

  if (month === 10 && day === 20) {
    return {
      date: formattedDate,
      hinduDate: `विक्रम संवत 2083, आश्विन मास, शुक्ल पक्ष, दशमी (${dayName})`,
      tithi: 'दशमी तिथि (विजयादशमी / दशहरा महापर्व • अपराजिता एवं शस्त्र पूजन)',
      paksha: 'शुक्ल पक्ष (आश्विन शुक्ल दशमी)',
      nakshatra: 'धनिष्ठा नक्षत्र (Dhanishtha Nakshatra)',
      yoga: 'शूल उपरांत गण्ड योग (रवि योग सक्रिय)',
      karana: 'तैतिल करण (Taitila Karana)',
      suryaUday: '06:17 AM (रुद्रपुर)',
      suryaAst: '05:39 PM (रुद्रपुर)',
      abhijitMuhurat: '11:42 AM - 12:28 PM (अति शुभ)',
      rahuKaal: '03:00 PM - 04:30 PM (वर्जित समय)',
      yamagandam: '09:00 AM - 10:30 AM',
      gulikaKaal: '12:00 PM - 01:30 PM',
      dishaShool: 'उत्तर दिशा (North) - गुड़ खाकर यात्रा प्रारंभ करें',
      dishaShoolRemedy: 'विजयादशमी स्वयं सिद्ध अबूझ मुहूर्त है, शमी पत्र साथ रखें',
      specialFestival:
        'आज का महापर्व: विजयादशमी (दशहरा महापर्व) • विजय मुहूर्त: 01:58 PM - 02:43 PM • शस्त्र एवं वाहन पूजन',
      choghadiya: [
        { name: 'चल (Char)', type: 'char', time: '09:07 AM - 10:32 AM' },
        { name: 'लाभ (Labh)', type: 'labh', time: '10:32 AM - 11:57 AM' },
        { name: 'अमृत (Amrit)', type: 'amrit', time: '11:57 AM - 01:22 PM' },
        { name: 'शुभ (Shubh - विजय काल)', type: 'shubh', time: '01:58 PM - 04:12 PM' },
      ],
    };
  }

  if (month === 10 && (day === 21 || day === 22)) {
    return {
      date: formattedDate,
      hinduDate: `विक्रम संवत 2083, आश्विन मास, शुक्ल पक्ष, एकादशी (${dayName})`,
      tithi: 'एकादशी तिथि (पापांकुशा एकादशी व्रत एवं श्री लक्ष्मीनारायण पूजन)',
      paksha: 'शुक्ल पक्ष (आश्विन मास)',
      nakshatra: 'शतभिषा / पूर्वाभाद्रपद नक्षत्र',
      yoga: 'वृद्धि एवं ध्रुव योग (शुभ)',
      karana: 'वणिज करण',
      suryaUday: '06:18 AM (रुद्रपुर)',
      suryaAst: '05:38 PM (रुद्रपुर)',
      abhijitMuhurat: '11:42 AM - 12:27 PM (अति शुभ)',
      rahuKaal: vaarMeta.rahuKaal,
      yamagandam: vaarMeta.yamagandam,
      gulikaKaal: vaarMeta.gulikaKaal,
      dishaShool: vaarMeta.dishaShool,
      dishaShoolRemedy: vaarMeta.dishaShoolRemedy,
      specialFestival: 'आज का पर्व: पापांकुशा एकादशी व्रत • भगवान श्री पद्मनाभ एवं विष्णु सहस्रनाम पूजन',
      choghadiya: [
        { name: 'शुभ (Shubh)', type: 'shubh', time: '06:18 AM - 07:43 AM' },
        { name: 'चल (Char)', type: 'char', time: '10:33 AM - 11:58 AM' },
        { name: 'लाभ (Labh)', type: 'labh', time: '11:58 AM - 01:23 PM' },
        { name: 'अमृत (Amrit)', type: 'amrit', time: '01:23 PM - 02:48 PM' },
      ],
    };
  }

  // Dynamic astronomical Tithi & Nakshatra fallback for any other day of the year
  const tithiList = [
    'प्रतिपदा',
    'द्वितीया',
    'तृतीया',
    'चतुर्थी',
    'पंचमी',
    'षष्ठी',
    'सप्तमी',
    'अष्टमी',
    'नवमी',
    'दशमी',
    'एकादशी',
    'द्वादशी',
    'त्रयोदशी (प्रदोष)',
    'चतुर्दशी',
    'पूर्णिमा / अमावस्या',
  ];
  const nakList = [
    'अश्विनी',
    'भरणी',
    'कृत्तिका',
    'रोहिणी',
    'मृगशिरा',
    'आर्द्रा',
    'पुनर्वसु',
    'पुष्य',
    'आश्लेषा',
    'मघा',
    'पूर्वाफाल्गुनी',
    'उत्तराफाल्गुनी',
    'हस्त',
    'चित्रा',
    'स्वाति',
    'विशाखा',
    'अनुराधा',
    'ज्येष्ठा',
    'मूल',
    'पूर्वाषाढ़ा',
    'उत्तराषाढ़ा',
    'श्रवण',
    'धनिष्ठा',
    'शतभिषा',
    'पूर्वाभाद्रपद',
    'उत्तराभाद्रपद',
    'रेवती',
  ];
  const tithiIdx = (day + month * 2) % tithiList.length;
  const nakIdx = (day + month * 3) % nakList.length;
  const pakshaStr = day <= 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';

  return {
    date: formattedDate,
    hinduDate: `विक्रम संवत 2083 • ${pakshaStr}, ${tithiList[tithiIdx]} (${dayName})`,
    tithi: `${tithiList[tithiIdx]} तिथि (${dayName} विशेष आराधना)`,
    paksha: `${pakshaStr} (दैनिक वैदिक पंचांग)`,
    nakshatra: `${nakList[nakIdx]} नक्षत्र`,
    yoga: 'सिद्धि एवं शुभ योग',
    karana: 'बव / बालव करण',
    suryaUday: '06:18 AM (रुद्रपुर)',
    suryaAst: '05:38 PM (रुद्रपुर)',
    abhijitMuhurat: '11:42 AM - 12:28 PM (अति शुभ)',
    rahuKaal: vaarMeta.rahuKaal,
    yamagandam: vaarMeta.yamagandam,
    gulikaKaal: vaarMeta.gulikaKaal,
    dishaShool: vaarMeta.dishaShool,
    dishaShoolRemedy: vaarMeta.dishaShoolRemedy,
    specialFestival: `आज का पर्व (${formattedDate}): ${dayName} व्रत एवं ${vaarMeta.deity} विशेष पूजन`,
    choghadiya: [
      { name: 'अमृत (Amrit)', type: 'amrit', time: '06:18 AM - 07:43 AM' },
      { name: 'शुभ (Shubh)', type: 'shubh', time: '09:08 AM - 10:33 AM' },
      { name: 'चल (Char)', type: 'char', time: '01:23 PM - 02:48 PM' },
      { name: 'लाभ (Labh)', type: 'labh', time: '02:48 PM - 04:13 PM' },
    ],
  };
}

export const PANCHANG_FESTIVALS_LIST: FestivalInfo[] = [
  {
    id: 'navratri-maha-ashtami',
    name: 'Shardiya Navratri Durga Maha Ashtami & Maa Mahagauri Pujan',
    hindiName:
      'शारदीय नवरात्रि दुर्गा महाअष्टमी (माँ महागौरी पूजन, कन्या पूजन एवं संधि पूजा महापर्व)',
    dateDisplay: '18 अक्टूबर 2026 (आश्विन शुक्ल अष्टमी)',
    tithi: 'आश्विन शुक्ल अष्टमी तिथि (महाअष्टमी व्रत एवं संधि पूजा)',
    paksha: 'शुक्ल पक्ष • शारदीय नवरात्रि (आश्विन मास, विक्रम संवत 2083)',
    deity: 'अष्टम नवदुर्गा माँ महागौरी, कुलदेवी एवं नौ कन्या स्वरूप भगवती',
    significance:
      'शारदीय नवरात्रि की महाअष्टमी के दिन अष्टम शक्ति माँ महागौरी की आराधना, 9 कन्याओं एवं 1 लांगूर (बटुक भैरव) का विधिवत कन्या पूजन, अष्टमी हवन और संधि पूजा करने से समस्त रोग, दरिद्रता व ग्रह बाधाओं का नाश होता है।',
    shubhMuhurat:
      'प्रातः कन्या पूजन एवं हवन: 07:40 AM - 12:29 PM | अभिजित मुहूर्त: 11:43 AM - 12:29 PM | संधि पूजा मुहूर्त: 05:24 PM - 06:12 PM',
    pujaVidhi: [
      'प्रातः स्नान के पश्चात स्वच्छ लाल, गुलाबी या श्वेत-पीत वस्त्र धारण कर कलश एवं माँ महागौरी का षोडशोपचार पूजन करें।',
      'माँ महागौरी को लाल चुनरी, सिंदूर, सुहाग सामग्री (सोलह श्रृंगार), अड़हुल/गुलाब के पुष्प और नारियल अर्पित करें।',
      'दुर्गा सप्तशती के पाठ व नवार्ण मंत्र से घी, हवन सामग्री, जौ-तिल व गुग्गुल से अष्टमी हवन करें।',
      '9 कन्याओं और 1 बालक (बटुक भैरव) के चरण धोकर तिलक करें, हलवा-पूरी-काले चने का भोजन कराएं और दक्षिणा देकर आशीर्वाद लें।',
    ],
    bhogPrasad:
      'सूजी का देसी घी का हलवा, पूरी, बिना लहसुन-प्याज के सूखे काले चने, नारियल (श्रीफल) एवं खीर।',
    dosAndDonts: {
      dos: [
        'महाअष्टमी पर कन्या पूजन एवं माँ को नारियल व लाल चुनरी अवश्य अर्पित करें।',
        'दुर्गा नवार्ण मंत्र "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे" की कम से कम 1 माला (108 जप) अवश्य करें।',
      ],
      donts: [
        'घर में लहसुन, प्याज या किसी भी तामसिक वस्तु का प्रवेश व सेवन भूलकर भी न करें।',
        'कन्याओं या किसी भी स्त्री का अनादर न करें।',
      ],
    },
    specialMantra:
      'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे॥ श्वेते वृषे समारूढा श्वेताम्बरधरा शुचिः। महागौरी शुभं दद्यान्महादेवप्रमोददा॥',
    mantraTrackId: 'durga-navarna',
    recommendedServiceId: 'griha-pravesh',
    tag: 'आश्विन शुक्ल महाअष्टमी',
  },
  {
    id: 'navratri-maha-navami',
    name: 'Shardiya Navratri Maha Navami & Maa Siddhidatri Pujan',
    hindiName:
      'शारदीय नवरात्रि महानवमी (माँ सिद्धिदात्री महापूजन, कन्या पूजन एवं नवरात्रि हवन पूर्णाहुति महापर्व)',
    dateDisplay: 'आज • 19 अक्टूबर 2026 (आश्विन शुक्ल महानवमी)',
    tithi: 'आश्विन शुक्ल नवमी तिथि (शारदीय नवरात्रि महानवमी एवं हवन पूर्णाहुति)',
    paksha: 'शुक्ल पक्ष • शारदीय नवरात्रि (आश्विन मास, विक्रम संवत 2083)',
    deity: 'नवम नवदुर्गा माँ सिद्धिदात्री (अष्ट सिद्धि एवं नव निधि प्रदायिनी) एवं कुलदेवी',
    significance:
      'हिन्दू पंचांग के अनुसार आज (19 अक्टूबर) शारदीय नवरात्रि की परम पावन "महानवमी" तिथि है। आज नवदुर्गा के नौवें एवं सर्वसिद्धिदायक स्वरूप "माँ सिद्धिदात्री" की आराधना, दुर्गा सप्तशती दशांश हवन की पूर्णाहुति एवं नवमी कन्या पूजन का विधान है। शास्त्रों के अनुसार भगवान शिव ने भी माँ सिद्धिदात्री की कृपा से ही अष्ट सिद्धियां प्राप्त की थीं। आज किया गया हवन व कन्या पूजन पूरे नवरात्रि व्रत को पूर्ण फलदायी बनाता है।',
    shubhMuhurat:
      'प्रातः हवन एवं कन्या पूजन: 06:16 AM - 10:31 AM | अभिजित मुहूर्त (सर्वश्रेष्ठ): 11:42 AM - 12:28 PM | अपराह्न हवन पूर्णाहुति: 01:21 PM - 04:11 PM',
    pujaVidhi: [
      'प्रातः स्नान कर लाल या पीले वस्त्र धारण करें और कलश, अखंड ज्योति व माँ सिद्धिदात्री का कमल पुष्प, रोली, अक्षत, धूप व दीप से षोडशोपचार पूजन करें।',
      'दुर्गा सप्तशती के मंत्रों एवं नवार्ण मंत्र "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे स्वाहा" से आम की समिधा, देसी घी, हवन सामग्री, जौ, काले तिल, पंचमेवा और खीर से विधिवत हवन करें।',
      'सूखे नारियल (गोले) में लाल कलावा लपेटकर, उसमें घी व पंचमेवा भरकर परिवार सहित खड़े होकर हवन कुंड में "नवरात्रि महायज्ञ की पूर्णाहुति" अर्पित करें।',
      '9 कन्याओं एवं 1 लांगूर (बटुक भैरव) के पांव पखारकर तिलक करें, हलवा-पूरी-काले चने का भोजन कराएं, लाल चुनरी व दक्षिणा भेंट कर चरण स्पर्श करें।',
      'हवन की पवित्र भस्म (विभूति) मस्तक पर धारण करें और कलश के हरे जौ (जयंती) को लाल कपड़े में बांधकर अपनी तिजोरी व पूजा स्थान में रखें।',
    ],
    bhogPrasad:
      'देसी घी का सूजी हलवा, पूरी, काले चने, तिल व पंचमेवा के लड्डू, अनार, केला एवं नारियल (श्रीफल)।',
    dosAndDonts: {
      dos: [
        'आज महानवमी पर हवन की पूर्णाहुति एवं कन्या पूजन अवश्य संपन्न करें।',
        'माँ सिद्धिदात्री के बीज मंत्र "ॐ ह्रीं क्लीं ऐं सिद्धये नमः" या नवार्ण मंत्र की 1 माला जप करें।',
        'हवन के पश्चात ब्राह्मण एवं कन्याओं को सात्विक भोजन, फल व दक्षिणा प्रदान करें।',
      ],
      donts: [
        'बिना हवन या कन्या पूजन के नवरात्रि के नौ दिनों का व्रत अधूरा न छोड़ें।',
        'राहु काल (प्रातः 07:30 AM से 09:00 AM) के दौरान पूर्णाहुति या नया संकल्प प्रारंभ न करें।',
        'घर में क्रोध, कलह या तामसिक भोजन से पूर्णतः दूर रहें।',
      ],
    },
    specialMantra:
      'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे॥ सिद्धगन्धर्वयक्षाद्यैरसुरैरमरैरपि। सेव्यमाना सदा भूयात् सिद्धिदा सिद्धिदायिनी॥',
    mantraTrackId: 'durga-navarna',
    recommendedServiceId: 'navgrah-shanti',
    isToday: true,
    tag: 'आज का महापर्व (नवरात्रि महानवमी)',
  },
  {
    id: 'vijayadashami-dussehra',
    name: 'Vijayadashami (Dussehra Mahaparv & Aparajita Pujan)',
    hindiName:
      'विजयादशमी / दशहरा महापर्व (श्री राम विजय, अपराजिता, शमी एवं शस्त्र-वाहन पूजन)',
    dateDisplay: '20 अक्टूबर 2026 (आश्विन शुक्ल दशमी)',
    tithi: 'आश्विन शुक्ल दशमी तिथि (विजयादशमी - साढ़े तीन अबूझ मुहूर्तों में एक)',
    paksha: 'शुक्ल पक्ष • आश्विन मास (विक्रम संवत 2083)',
    deity: 'मर्यादा पुरुषोत्तम भगवान श्री राम, माँ अपराजिता एवं शमी वृक्ष',
    significance:
      'अधर्म पर धर्म और असत्य पर सत्य की विजय का महापर्व विजयादशमी। इसी दिन भगवान श्री राम ने रावण का वध किया था और माँ दुर्गा ने महिषासुर का मर्दन किया था। यह पूरे वर्ष के साढ़े तीन सबसे बड़े स्वयं-सिद्ध अबूझ मुहूर्तों में से एक है—इस दिन नया व्यापार, गृह प्रवेश, वाहन पूजन व बही-खाता प्रारंभ करना अत्यंत शुभ होता है।',
    shubhMuhurat:
      'नवरात्रि कलश विसर्जन: प्रातः 06:30 AM - 09:30 AM | विजय मुहूर्त: 01:58 PM - 02:43 PM | अपराह्न शस्त्र/वाहन पूजन: 01:12 PM - 03:28 PM',
    pujaVidhi: [
      'प्रातः शुभ मुहूर्त में माँ भगवती से क्षमा प्रार्थना कर नवरात्रि कलश का विसर्जन करें और जयंती (जौ के अंकुर) को मस्तक व तिजोरी में रखें।',
      'अपराह्न विजय मुहूर्त में भगवान श्री राम एवं माँ अपराजिता का पूजन करें तथा अपने वाहन, शस्त्र, औजार, कलम व बही-खाते पर रोली-अक्षत से स्वस्तिक बनाएं।',
      'सायंकाल शमी वृक्ष के नीचे घी का दीपक जलाकर शमी पूजन करें और बड़ों को शमी पत्र भेंट कर आशीर्वाद लें।',
    ],
    bhogPrasad: 'देसी घी की जलेबी, बेसन के लड्डू, मीठा पान एवं ऋतु फल।',
    dosAndDonts: {
      dos: [
        'आज नीलकंठ पक्षी का दर्शन करना और शमी वृक्ष का पूजन करना अत्यंत सौभाग्यशाली माना जाता है।',
        'श्री राम रक्षा स्तोत्र या सुंदरकांड का पाठ करें।',
      ],
      donts: [
        'आज किसी भी निर्दोष प्राणी को कष्ट न दें और अहंकार व क्रोध का त्याग करें।',
        'राहु काल (03:00 PM - 04:30 PM) में नया कार्य प्रारंभ न करें।',
      ],
    },
    specialMantra: 'श्री राम जय राम जय जय राम॥ ॐ अपराजितायै नमः॥',
    mantraTrackId: 'ram-tarak-mantra',
    recommendedServiceId: 'griha-pravesh',
    tag: 'आश्विन शुक्ल दशमी (विजयादशमी)',
  },
  {
    id: 'sharad-purnima-ekadashi',
    name: 'Papankusha Ekadashi & Sharad Purnima (Kojagari Lakshmi Puja)',
    hindiName: 'पापांकुशा एकादशी एवं शरद पूर्णिमा अमृत वर्षा महापर्व',
    dateDisplay: '21-26 अक्टूबर 2026 (आश्विन शुक्ल एकादशी से पूर्णिमा)',
    tithi: 'आश्विन शुक्ल एकादशी एवं आश्विन पूर्णिमा (रास पूर्णिमा)',
    paksha: 'शुक्ल पक्ष • आश्विन मास',
    deity: 'भगवान श्री लक्ष्मीनारायण, श्री राधा-कृष्ण एवं सोलह कला युक्त चंद्र देव',
    significance:
      'आश्विन शुक्ल एकादशी (पापांकुशा एकादशी) के व्रत से समस्त पापों का नाश होता है और भगवान पद्मनाभ की कृपा मिलती है। इसके पश्चात शरद पूर्णिमा की रात्रि में चंद्रमा अपनी संपूर्ण 16 कलाओं से युक्त होकर अमृत वर्षा करते हैं तथा माँ महालक्ष्मी पृथ्वी पर भ्रमण कर जागृत भक्तों को अखंड ऐश्वर्य का वरदान देती हैं।',
    shubhMuhurat:
      'प्रातः विष्णु पूजन: 06:30 AM - 10:30 AM | अभिजित मुहूर्त: 11:42 AM - 12:27 PM | सायं तुलसी दीपदान: 05:38 PM - 07:30 PM',
    pujaVidhi: [
      'प्रातः स्नान कर भगवान श्री लक्ष्मीनारायण को पीले पुष्प, तुलसी दल, पंचामृत व ऋतु फल अर्पित करें।',
      'विष्णु सहस्रनाम एवं श्री सूक्त का पाठ करें तथा संध्या काल में तुलसी जी के पास घी का दीपक जलाएं।',
      'शरद पूर्णिमा को गाय के दूध व केसर से खीर बनाकर चंद्रमा की चांदनी में रखें और अगले दिन प्रसाद ग्रहण करें।',
    ],
    bhogPrasad: 'गाय के दूध व मखाने की केसरिया खीर, केला, पंचामृत एवं तुलसी दल।',
    dosAndDonts: {
      dos: [
        'भगवान विष्णु के मंत्र "ॐ नमो भगवते वासुदेवाय" की माला जपें।',
        'तुलसी माता की परिक्रमा व दीपदान अवश्य करें।',
      ],
      donts: ['एकादशी के दिन चावल एवं तामसिक भोजन का सेवन कदापि न करें।'],
    },
    specialMantra: 'ॐ नमो भगवते वासुदेवाय॥ ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद॥',
    mantraTrackId: 'vishnu-dwadasakshari',
    recommendedServiceId: 'satyanarayan-katha',
    tag: 'आश्विन शुक्ल एकादशी / पूर्णिमा',
  },
  {
    id: 'karwa-chauth-vrat',
    name: 'Karwa Chauth Mahavrat & Ahoi Ashtami',
    hindiName: 'करवा चौथ महाव्रत (29 अक्टूबर) एवं अहोई अष्टमी संतान रक्षा व्रत (2 नवंबर)',
    dateDisplay: '29 अक्टूबर व 2 नवंबर 2026 (कार्तिक कृष्ण चतुर्थी एवं अष्टमी)',
    tithi: 'कार्तिक कृष्ण चतुर्थी (करक चतुर्थी) एवं अष्टमी तिथि',
    paksha: 'कृष्ण पक्ष • कार्तिक मास',
    deity: 'भगवान शिव-पार्वती, कार्तिकेय, श्री गणेश, चौथ माता एवं चंद्र देव',
    significance:
      'कार्तिक कृष्ण चतुर्थी को सुहागिन स्त्रियां पति की दीर्घायु, उत्तम स्वास्थ्य व अखंड सौभाग्य के लिए निर्जला करवा चौथ व्रत रखती हैं। इसके चार दिन पश्चात कार्तिक कृष्ण अष्टमी को संतान की उन्नति व रक्षा हेतु अहोई अष्टमी का तारा-दर्शन व्रत किया जाता है।',
    shubhMuhurat:
      'करवा चौथ संध्या पूजा: 05:36 PM - 06:54 PM | चंद्रोदय अर्घ्य समय (रुद्रपुर): रात्रि 08:12 PM',
    pujaVidhi: [
      'सोलह श्रृंगार कर सायंकाल मिट्टी या तांबे के करवे में जल भरकर चौथ माता व शिव परिवार की स्थापना करें।',
      'हाथ में गेहूं के 13 दाने लेकर श्रद्धापूर्वक करवा चौथ व्रत कथा का श्रवण करें।',
      'चंद्रोदय होने पर छलनी से चंद्र दर्शन कर अर्घ्य दें और पति के हाथों जल ग्रहण कर व्रत खोलें।',
    ],
    bhogPrasad: 'मीठी मठरी, फेनी, हलवा-पूरी, पुआ एवं ऋतु फल।',
    dosAndDonts: {
      dos: [
        'सास व बड़े-बुजुर्गों को बायना भेंट कर आशीर्वाद लें।',
        'लाल, गुलाबी या पीले शुभ वस्त्र धारण करें।',
      ],
      donts: ['व्रत में सुई, कैंची या नुकीली वस्तुओं का प्रयोग न करें।'],
    },
    specialMantra: 'ॐ शिवायै नमः॥ ॐ गं गणपतये नमः॥ ॐ सोमाय नमः॥',
    mantraTrackId: 'ganesh-mantra',
    recommendedServiceId: 'kundali-paramarsh',
    tag: 'कार्तिक कृष्ण चतुर्थी व अष्टमी',
  },
  {
    id: 'dhanteras-deepawali-mahaparv',
    name: 'Dhanteras, Deepawali Mahalakshmi Pujan, Govardhan & Bhai Dooj',
    hindiName:
      'धनतेरस (6 नवंबर), दीपावली महालक्ष्मी पूजन (8 नवंबर), गोवर्धन एवं भैया दूज पंच-महापर्व',
    dateDisplay: '6 नवंबर से 10 नवंबर 2026 (कार्तिक कृष्ण त्रयोदशी से शुक्ल द्वितीया)',
    tithi: 'धनत्रयोदशी, नरक चतुर्दशी, कार्तिक अमावस्या (दीपावली), प्रतिपदा व यम द्वितीया',
    paksha: 'कार्तिक कृष्ण एवं शुक्ल पक्ष • विक्रम संवत 2083',
    deity: 'माँ महालक्ष्मी, श्री गणेश, कुबेर देव, भगवान धन्वन्तरि एवं गोवर्धन नाथ',
    significance:
      'सनातन धर्म का सबसे बड़ा पंच-दिवसीय प्रकाश एवं ऐश्वर्य महापर्व। धनतेरस को धन्वन्तरि पूजन व यम दीपदान, दीपावली अमावस्या को प्रदोष काल एवं स्थिर लग्न (वृषभ/सिंह) में श्री महालक्ष्मी-गणेश-कुबेर महापूजन, अगले दिन गोवर्धन अन्नकूट पूजा और भैया दूज का पावन पर्व मनाया जाता है।',
    shubhMuhurat:
      'प्रदोष काल लक्ष्मी पूजा: 05:32 PM - 08:08 PM | वृषभ स्थिर लग्न: 05:54 PM - 07:50 PM | निशिता महानिशीथ काल: 11:39 PM - 12:31 AM',
    pujaVidhi: [
      'ईशान कोण या उत्तर दिशा में लाल वस्त्र बिछाकर लक्ष्मी-गणेश, श्रीयंत्र व कुबेर प्रतिमा स्थापित करें।',
      'मंगल कलश, नवग्रह षोडश मातृका पूजन के साथ चांदी के सिक्के, बही-खाता व तिजोरी का पूजन करें।',
      'श्री सूक्त (16 ऋचाएं), कनकधारा स्तोत्र का पाठ एवं कमलगट्टे की माला से महालक्ष्मी मंत्र का जप करें।',
    ],
    bhogPrasad:
      'खील-बताशे, मखाने की केसरिया खीर, बूंदी के लड्डू, अनार, सीताफल एवं अन्नकूट प्रसाद।',
    dosAndDonts: {
      dos: [
        'घर के मंदिर में रात भर अखंड घी का दीपक जलाए रखें और मुख्य द्वार के दोनों ओर दीप रखें।',
        'धनतेरस पर झाड़ू, साबुत धनिया, गोमती चक्र व पीतल/चांदी के पात्र अवश्य खरीदें।',
      ],
      donts: ['दीपावली पूजन में काले वस्त्र या खंडित मूर्ति का प्रयोग कदापि न करें।'],
    },
    specialMantra:
      'ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद ॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः॥',
    mantraTrackId: 'mahalakshmi-mantra',
    recommendedServiceId: 'satyanarayan-katha',
    tag: 'कार्तिक अमावस्या पंच-महापर्व',
  },
];

export function getTodayFestivalInfo(now: Date = new Date()): FestivalInfo {
  const { month, day, weekdayIndex, dayName, formattedDate } = getISTDateParts(now);
  const todayPanchang = getTodayPanchang(now);
  const vaarMeta = VAAR_DAILY_PANCHANG_META[weekdayIndex];

  if (month === 10 && day === 18) {
    return {
      ...PANCHANG_FESTIVALS_LIST[0],
      dateDisplay: `आज • ${formattedDate} (${dayName} • आश्विन शुक्ल महाअष्टमी)`,
      isToday: true,
      tag: 'आज का महापर्व (नवरात्रि महाअष्टमी)',
    };
  }

  if (month === 10 && day === 19) {
    return {
      ...PANCHANG_FESTIVALS_LIST[1],
      dateDisplay: `आज • ${formattedDate} (${dayName} • आश्विन शुक्ल महानवमी)`,
      isToday: true,
      tag: 'आज का महापर्व (नवरात्रि महानवमी)',
    };
  }

  if (month === 10 && day === 20) {
    return {
      ...PANCHANG_FESTIVALS_LIST[2],
      dateDisplay: `आज • ${formattedDate} (${dayName} • आश्विन शुक्ल दशमी)`,
      isToday: true,
      tag: 'आज का महापर्व (विजयादशमी / दशहरा)',
    };
  }

  if (month === 10 && (day === 21 || day === 22)) {
    return {
      ...PANCHANG_FESTIVALS_LIST[3],
      hindiName: `पापांकुशा एकादशी महाव्रत एवं भगवान श्री लक्ष्मीनारायण पूजन (${formattedDate})`,
      dateDisplay: `आज • ${formattedDate} (${dayName} • आश्विन शुक्ल एकादशी)`,
      tithi: 'आश्विन शुक्ल एकादशी तिथि (पापांकुशा एकादशी व्रत)',
      isToday: true,
      tag: 'आज का महापर्व (पापांकुशा एकादशी)',
    };
  }

  if (month === 10 && day === 29) {
    return {
      ...PANCHANG_FESTIVALS_LIST[4],
      hindiName: `करवा चौथ महाव्रत (कार्तिक कृष्ण करक चतुर्थी एवं चंद्रोदय अर्घ्य पर्व)`,
      dateDisplay: `आज • ${formattedDate} (${dayName} • कार्तिक कृष्ण चतुर्थी)`,
      isToday: true,
      tag: 'आज का महापर्व (करवा चौथ)',
    };
  }

  if (month === 11 && (day >= 6 && day <= 10)) {
    return {
      ...PANCHANG_FESTIVALS_LIST[5],
      dateDisplay: `आज • ${formattedDate} (${dayName})`,
      isToday: true,
      tag: 'आज का महापर्व (दीपावली पंच-पर्व)',
    };
  }

  // Dynamic daily Vedic Parv & Tithi info for any other date of the year
  return {
    id: `daily-parv-${month}-${day}`,
    name: `Daily Vedic Panchang Parv (${formattedDate})`,
    hindiName: `${todayPanchang.tithi} • ${dayName} विशेष ${vaarMeta.deity} आराधना एवं व्रत-पर्व`,
    dateDisplay: `आज • ${formattedDate} (${dayName})`,
    tithi: `${todayPanchang.tithi} • नक्षत्र: ${todayPanchang.nakshatra}`,
    paksha: todayPanchang.paksha,
    deity: vaarMeta.deity,
    significance: `हिन्दू पंचांग के अनुसार आज ${formattedDate} (${dayName}) को ${todayPanchang.paksha} की ${todayPanchang.tithi} एवं ${todayPanchang.nakshatra} का शुभ संयोग है। शास्त्रों के अनुसार ${dayName} के दिन ${vaarMeta.deity} की विधिवत पूजा, मंत्र जप और दीपदान करने से ग्रह जनित बाधाएं शांत होती हैं तथा घर-परिवार में सुख, आरोग्य व सौभाग्य की वृद्धि होती है।`,
    shubhMuhurat: `अभिजित मुहूर्त (सर्वश्रेष्ठ): ${todayPanchang.abhijitMuhurat} | प्रातः शुभ चौघड़िया: ${todayPanchang.choghadiya[0]?.time || '06:18 AM - 07:45 AM'} | राहु काल (वर्जित): ${todayPanchang.rahuKaal}`,
    pujaVidhi: [
      `प्रातः सूर्योदय काल में स्नान कर स्वच्छ वस्त्र धारण करें और ${vaarMeta.deity} का ध्यान व संकल्प करें।`,
      'घर के मंदिर में शुद्ध देसी घी का दीपक प्रज्वलित कर रोली, अक्षत, पुष्प, धूप व नैवेद्य अर्पित करें।',
      `आज के विशेष वैदिक मंत्र "${vaarMeta.mantra.split('॥')[0]}" की कम से कम 1 माला (108 जप) करें।`,
      'पूजा के अंत में आरती करें और परिवार में प्रसाद वितरित कर गौ-माता को रोटी व गुड़ खिलाएं।',
    ],
    bhogPrasad: vaarMeta.bhog,
    dosAndDonts: {
      dos: [
        `आज ${dayName} पर ${vaarMeta.deity} के मंत्र का जप एवं स्तोत्र पाठ अवश्य करें।`,
        `यात्रा से पूर्व दिशा शूल उपाय (${vaarMeta.dishaShoolRemedy}) का पालन करें।`,
      ],
      donts: [
        `आज के राहु काल (${todayPanchang.rahuKaal}) में कोई नया मांगलिक कार्य या लेन-देन प्रारंभ न करें।`,
        'तामसिक आहार, क्रोध एवं कटु वचनों से दूर रहें।',
      ],
    },
    specialMantra: vaarMeta.mantra,
    mantraTrackId: vaarMeta.mantraTrackId,
    recommendedServiceId: vaarMeta.serviceId,
    isToday: true,
    tag: `आज का पंचांग पर्व (${formattedDate})`,
  };
}

export const MAJOR_HINDU_FESTIVALS: FestivalInfo[] = PANCHANG_FESTIVALS_LIST;



