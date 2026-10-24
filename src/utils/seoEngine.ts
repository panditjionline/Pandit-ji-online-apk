/**
 * Autonomous Client-Side SEO, Meta Indexing & Route Synchronizer
 * Ensures every core tool and dynamic daily page in "Pandit Ji Online"
 * maintains strict Google Search Console verification, advanced robots directives
 * (index, follow, max-image-preview:large), canonical URLs, and dynamic Schema.org JSON-LD.
 */

export const GOOGLE_SITE_VERIFICATION_CONTENT = 'u_jaTAPmJDavEHwJ0JP4x24F57dOwc_cJmD65DcEsxY';
export const ADVANCED_ROBOTS_DIRECTIVE =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

export interface RouteSeoMetadata {
  tabId: string;
  canonicalPath: string;
  title: string;
  description: string;
  keywords: string;
  changefreq: 'daily' | 'weekly';
  schemaType: string;
}

export const TAB_SEO_MAP: Record<string, RouteSeoMetadata> = {
  home: {
    tabId: 'home',
    canonicalPath: '/',
    title: 'Pandit Ji Online - Drik Ganit Panchang, Gun Milan & Vedic Services | आचार्य पण्डित शशांक शर्मा',
    description:
      'Rudrapur (28.98°N, 79.40°E) ke sthaniy akshansh ke anusaar sateek Drik Ganit Panchang, 36 Gun Milan, Sampurn Janam Kundali, Digital Mandir aur AI Acharya guidance by Acharya Pandit Shashank Sharma.',
    keywords:
      'Pandit Ji Online, Acharya Pandit Shashank Sharma, Rudrapur Astrologer, Drik Ganit Panchang, 36 Gun Milan, Janam Kundali, Digital Mandir, Jyotish AI, Daily Rashifal',
    changefreq: 'daily',
    schemaType: 'WebSite',
  },
  panchang: {
    tabId: 'panchang',
    canonicalPath: '/panchang',
    title: 'आज का दृक गणित पंचांग एवं शुभ मुहूर्त (रुद्रपुर) | Drik Ganit Panchang - Pandit Ji Online',
    description:
      'रुद्रपुर (उत्तराखण्ड) के सटीक अक्षांश 28.98°N एवं देशांतर 79.40°E पर आधारित लाहिड़ी अयनांश दृक गणित पंचांग, तिथि, नक्षत्र, योग, करण, राहुकाल एवं चौघड़िया मुहूर्त।',
    keywords:
      'Drik Ganit Panchang Rudrapur, Aaj Ka Panchang, Shubh Muhurat Today, Choghadiya, Rahukaal, Lahiri Ayanamsha Panchang, Pandit Shashank Sharma',
    changefreq: 'daily',
    schemaType: 'Dataset',
  },
  'janam-kundali': {
    tabId: 'janam-kundali',
    canonicalPath: '/janam-kundali',
    title: 'सम्पूर्ण जन्म कुंडली एवं ५-स्तंभ वैदिक भविष्यफल | Free Janam Kundali - Pandit Ji Online',
    description:
      'लाहिड़ी अयनांश पर आधारित सटीक लग्न कुंडली (D-1), नवांश (D-9), दशमांश (D-10), विंशोत्तरी महादशा, गोचर प्रभाव एवं आचार्य पण्डित शशांक शर्मा द्वारा विस्तृत भविष्यफल।',
    keywords:
      'Janam Kundali Online, Free Vedic Horoscope Hindi, Lagna Kundali PDF, Vimshottari Dasha, Gochar फलित, Pandit Ji Online Kundali',
    changefreq: 'daily',
    schemaType: 'SoftwareApplication',
  },
  milan: {
    tabId: 'milan',
    canonicalPath: '/kundali-milan',
    title: '३६ गुण मिलान (अष्टकूट विवाह कुंडली मिलान एवं मांगलिक दोष) | 36 Gun Milan - Pandit Ji Online',
    description:
      'वर एवं वधू का शास्त्रोक्त ३६ गुण अष्टकूट मिलान, वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट, नाड़ी एवं मंगल दोष परिहार सहित A4 PDF रिपोर्ट।',
    keywords:
      '36 Gun Milan Hindi, Ashtakoot Kundali Matching, Vivah Gun Milan PDF, Manglik Dosh Check, Nadi Dosh Parihar, Pandit Shashank Sharma',
    changefreq: 'weekly',
    schemaType: 'SoftwareApplication',
  },
  mandir: {
    tabId: 'mandir',
    canonicalPath: '/digital-mandir',
    title: 'श्री डिजिटल मंदिर - लाइव दर्शन, आरती, शंखनाद एवं दानपात्र | Digital Mandir - Pandit Ji Online',
    description:
      'घर बैठे श्री डिजिटल मंदिर में दैनिक अधिष्ठाता देवता के पावन दर्शन करें, अखण्ड दीप प्रज्वलित करें, मंदिर घंटी व शंखनाद बजाएं एवं भक्ति संकल्प लें।',
    keywords:
      'Digital Mandir Online, Virtual Hindu Temple, Live Aarti Darshan, Online Shankhnaad, Digital Danpatr UPI, Sanatan Mandir',
    changefreq: 'daily',
    schemaType: 'PlaceOfWorship',
  },
  chat: {
    tabId: 'chat',
    canonicalPath: '/jyotish-ai',
    title: 'ज्योतिष AI परामर्श - आचार्य पण्डित शशांक शर्मा से सीधा संवाद | Jyotish AI Chat',
    description:
      'आचार्य पण्डित शशांक शर्मा के वैदिक ज्योतिष ज्ञान पर आधारित ज्योतिष AI से जन्म कुंडली, विवाह, करियर, महादशा एवं सात्विक उपायों पर निःशुल्क मार्गदर्शन प्राप्त करें।',
    keywords:
      'Jyotish AI Chat, Ask Vedic Astrologer Online, Acharya Pandit Shashank Sharma AI, Free Astrology Consultation Hindi',
    changefreq: 'daily',
    schemaType: 'Service',
  },
  services: {
    tabId: 'services',
    canonicalPath: '/puja-services',
    title: 'वैदिक पूजा एवं अनुष्ठान बुकिंग (रुद्रपुर, उत्तराखण्ड) | Book Vedic Puja - Pandit Ji Online',
    description:
      'रुद्रपुर एवं उधम सिंह नगर में घर पर प्रामाणिक वैदिक पूजा: गृह प्रवेश, वास्तु शांति, महा रुद्राभिषेक, श्री सत्यनारायण कथा, विवाह संस्कार एवं नवग्रह शांति बुकिंग।',
    keywords:
      'Book Pandit in Rudrapur, Griha Pravesh Puja Rudrapur, Rudrabhishek Booking, Satyanarayan Katha Pandit Ji, Acharya Shashank Sharma Contact',
    changefreq: 'weekly',
    schemaType: 'ProfessionalService',
  },
  'gyan-kosh': {
    tabId: 'gyan-kosh',
    canonicalPath: '/dharm-gyan-kosh',
    title: 'वैदिक धर्म एवं ज्ञान कोष - आरती, चालीसा, स्तोत्र एवं व्रत कथाएं | Dharm Gyan Kosh',
    description:
      'सम्पूर्ण आरती संग्रह, हनुमान चालीसा, शिव तांडव स्तोत्र, प्रामाणिक व्रत कथाएं, वैदिक मंत्र एवं पूजा विधि का डिजिटल सनातन ग्रंथालय।',
    keywords:
      'Dharm Gyan Kosh, Aarti Sangrah Hindi, Hanuman Chalisa Lyrics, Vrat Katha Hindi, Vedic Mantra Library',
    changefreq: 'weekly',
    schemaType: 'CollectionPage',
  },
  jaap: {
    tabId: 'jaap',
    canonicalPath: '/mantra-jaap',
    title: 'डिजिटल १०८ रुद्राक्ष मंत्र जाप माला एवं तानपूरा साधना | Digital Mantra Jaap Counter',
    description:
      '१०८ मनकों की डिजिटल रुद्राक्ष माला पर गायत्री मंत्र, महामृत्युंजय मंत्र एवं इष्ट मंत्रों का जाप करें और अपना दैनिक साधना रिकॉर्ड सुरक्षित रखें।',
    keywords:
      '108 Rudraksha Mala Counter Online, Digital Mantra Jaap, Gayatri Mantra Counter, Mahamrityunjaya Jaap Tracker',
    changefreq: 'weekly',
    schemaType: 'WebApplication',
  },
};

const PATH_TO_TAB_MAP: Record<string, string> = {
  '/': 'home',
  '/panchang': 'panchang',
  '/janam-kundali': 'janam-kundali',
  '/kundali': 'janam-kundali',
  '/kundali-milan': 'milan',
  '/gun-milan': 'milan',
  '/milan': 'milan',
  '/digital-mandir': 'mandir',
  '/mandir': 'mandir',
  '/jyotish-ai': 'chat',
  '/chat': 'chat',
  '/puja-services': 'services',
  '/services': 'services',
  '/dharm-gyan-kosh': 'gyan-kosh',
  '/gyan-kosh': 'gyan-kosh',
  '/mantra-jaap': 'jaap',
  '/jaap': 'jaap',
};

/**
 * Resolves the initial active tab from the browser's pathname or `?tab=` query string
 * so deep links from Google Search / Sitemap open the exact tool immediately.
 */
export function resolveInitialTabFromUrl(): string {
  if (typeof window === 'undefined') return 'home';

  try {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab')?.trim().toLowerCase();
    if (tabParam) {
      if (tabParam === 'kundali') return 'janam-kundali';
      if (tabParam === 'gun-milan' || tabParam === 'kundali-milan') return 'milan';
      if (TAB_SEO_MAP[tabParam] || ['history', 'youtube'].includes(tabParam)) {
        return tabParam;
      }
    }

    const cleanPath = window.location.pathname.replace(/\/+$/, '') || '/';
    if (PATH_TO_TAB_MAP[cleanPath]) {
      return PATH_TO_TAB_MAP[cleanPath];
    }
  } catch {
    // ignore URL parse issues
  }

  return 'home';
}

function upsertMetaTag(attrName: 'name' | 'property', attrValue: string, content: string): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  if (el.getAttribute('content') !== content) {
    el.setAttribute('content', content);
  }
}

/**
 * Synchronizes document title, meta description, advanced robots directives,
 * Google Site Verification tag, canonical URL, and JSON-LD structured data whenever the active tab changes.
 */
export function syncActiveRouteSeo(activeTab: string): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const meta = TAB_SEO_MAP[activeTab] || TAB_SEO_MAP.home;
  const origin = window.location.origin;
  const canonicalUrl = `${origin}${meta.canonicalPath === '/' ? '/' : meta.canonicalPath}`;

  // 1. Update Document Title
  document.title = meta.title;

  // 2. Enforce Google Search Console Verification Meta Tag permanently
  upsertMetaTag('name', 'google-site-verification', GOOGLE_SITE_VERIFICATION_CONTENT);

  // 3. Enforce Advanced Robots Indexing Directives across all layouts
  upsertMetaTag('name', 'robots', ADVANCED_ROBOTS_DIRECTIVE);
  upsertMetaTag('name', 'googlebot', ADVANCED_ROBOTS_DIRECTIVE);

  // 4. Update Primary & Social Meta Tags
  upsertMetaTag('name', 'description', meta.description);
  upsertMetaTag('name', 'keywords', meta.keywords);
  upsertMetaTag('property', 'og:title', meta.title);
  upsertMetaTag('property', 'og:description', meta.description);
  upsertMetaTag('property', 'og:url', canonicalUrl);
  upsertMetaTag('name', 'twitter:title', meta.title);
  upsertMetaTag('name', 'twitter:description', meta.description);

  // 5. Update Canonical Link & Sitemap Link
  let canonicalEl = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  let sitemapEl = document.head.querySelector('link[rel="sitemap"]') as HTMLLinkElement | null;
  if (!sitemapEl) {
    sitemapEl = document.createElement('link');
    sitemapEl.setAttribute('rel', 'sitemap');
    sitemapEl.setAttribute('type', 'application/xml');
    sitemapEl.setAttribute('title', 'Sitemap');
    sitemapEl.setAttribute('href', '/sitemap.xml');
    document.head.appendChild(sitemapEl);
  }

  // 6. Inject/Update Dynamic Route JSON-LD Schema
  let schemaScript = document.getElementById('dynamic-route-jsonld') as HTMLScriptElement | null;
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'dynamic-route-jsonld';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  const istNowIso = new Date().toISOString();
  const jsonLdPayload = {
    '@context': 'https://schema.org',
    '@type': meta.schemaType,
    name: meta.title,
    description: meta.description,
    url: canonicalUrl,
    dateModified: istNowIso,
    inLanguage: 'hi-IN',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Pandit Ji Online',
      url: `${origin}/`,
    },
    provider: {
      '@type': 'Person',
      name: 'Acharya Pandit Shashank Sharma',
      jobTitle: 'Vedic Astrologer & Purohit',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Rudrapur',
        addressRegion: 'Uttarakhand',
        postalCode: '263153',
        addressCountry: 'IN',
      },
    },
  };

  schemaScript.textContent = JSON.stringify(jsonLdPayload);
}
