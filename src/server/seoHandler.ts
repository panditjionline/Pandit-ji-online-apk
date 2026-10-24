import fs from 'fs';
import path from 'path';
import { PUJA_SERVICES } from '../data/mockData';

export const GOOGLE_SITE_VERIFICATION_TOKEN = 'u_jaTAPmJDavEHwJ0JP4x24F57dOwc_cJmD65DcEsxY';
export const GOOGLE_HTML_VERIFICATION_FILENAME = 'googlea0e64484b80e13d1.html';
export const GOOGLE_HTML_VERIFICATION_CONTENT = 'google-site-verification: googlea0e64484b80e13d1.html';
export const DEFAULT_CANONICAL_ORIGIN =
  process.env.APP_URL?.replace(/\/+$/, '') ||
  'https://ais-pre-vzln7mn7lygnkockjoehu3-746834689688.asia-east1.run.app';

export interface SitemapRouteEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  titleHi: string;
  titleEn: string;
}

/**
 * Computes current IST (UTC+5:30) date strings for accurate daily astrological indexing.
 */
export function getISTSeoTimestamps(now: Date = new Date()): {
  todayDateStr: string;
  dailyIsoLastMod: string;
  weeklyIsoLastMod: string;
  upcomingDates: string[];
} {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffsetMs);
  const year = istTime.getUTCFullYear();
  const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istTime.getUTCDate()).padStart(2, '0');
  const todayDateStr = `${year}-${month}-${day}`;

  // Daily lastmod reflects today's 00:00:00+05:30 refresh
  const dailyIsoLastMod = `${todayDateStr}T00:00:00+05:30`;

  // Weekly lastmod anchored to the start of the current ISO week in IST
  const dayOfWeek = istTime.getUTCDay(); // 0 (Sun) to 6 (Sat)
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(istTime.getTime() + mondayOffset * 86400000);
  const wYear = weekStart.getUTCFullYear();
  const wMonth = String(weekStart.getUTCMonth() + 1).padStart(2, '0');
  const wDay = String(weekStart.getUTCDate()).padStart(2, '0');
  const weeklyIsoLastMod = `${wYear}-${wMonth}-${wDay}T00:00:00+05:30`;

  // Generate today + next 7 days for dynamic daily Panchang & Muhurat crawl discovery
  const upcomingDates: string[] = [];
  for (let i = 0; i <= 7; i++) {
    const d = new Date(istTime.getTime() + i * 86400000);
    const dy = d.getUTCFullYear();
    const dm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    upcomingDates.push(`${dy}-${dm}-${dd}`);
  }

  return {
    todayDateStr,
    dailyIsoLastMod,
    weeklyIsoLastMod,
    upcomingDates,
  };
}

/**
 * Resolves the canonical origin from incoming HTTP headers or environment variables.
 */
export function resolveBaseOrigin(headers?: Record<string, string | string[] | undefined>): string {
  if (headers) {
    const rawHost = headers['x-forwarded-host'] || headers['host'];
    const host = Array.isArray(rawHost) ? rawHost[0] : rawHost;
    const rawProto = headers['x-forwarded-proto'];
    const proto = (Array.isArray(rawProto) ? rawProto[0] : rawProto) || 'https';
    if (host && !host.includes('localhost') && !host.startsWith('127.0.0.1')) {
      return `${proto.split(',')[0].trim()}://${host.split(',')[0].trim()}`.replace(/\/+$/, '');
    }
  }
  if (process.env.APP_URL && process.env.APP_URL.startsWith('http')) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  return DEFAULT_CANONICAL_ORIGIN;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds the complete list of active routes, core Vedic tools, and dynamic daily pages.
 */
export function buildDynamicSitemapEntries(baseOrigin: string, now: Date = new Date()): SitemapRouteEntry[] {
  const cleanOrigin = baseOrigin.replace(/\/+$/, '');
  const { dailyIsoLastMod, weeklyIsoLastMod, upcomingDates } = getISTSeoTimestamps(now);

  const coreEntries: SitemapRouteEntry[] = [
    // 1. Root Home & Daily Rashifal / Live Panchang Hub (Daily update)
    {
      loc: `${cleanOrigin}/`,
      lastmod: dailyIsoLastMod,
      changefreq: 'daily',
      priority: '1.0',
      titleHi: 'पण्डित जी ऑनलाइन - दृक गणित पंचांग, ३६ गुण मिलान, जन्म कुंडली एवं वैदिक ज्योतिष',
      titleEn: 'Pandit Ji Online - Drik Ganit Panchang, 36 Gun Milan, Janam Kundali & Vedic Services',
    },
    // 2. Core Tool: Drik Ganit Panchang (Daily update - Rudrapur 28.98N, 79.40E)
    {
      loc: `${cleanOrigin}/panchang`,
      lastmod: dailyIsoLastMod,
      changefreq: 'daily',
      priority: '0.95',
      titleHi: 'आज का सटीक दृक गणित पंचांग एवं शुभ मुहूर्त - रुद्रपुर',
      titleEn: 'Daily Drik Ganit Hindu Panchang & Shubh Muhurat Calendar',
    },
    {
      loc: `${cleanOrigin}/?tab=panchang`,
      lastmod: dailyIsoLastMod,
      changefreq: 'daily',
      priority: '0.90',
      titleHi: 'मासिक हिन्दू पंचांग कैलेंडर एवं चौघड़िया',
      titleEn: 'Monthly Hindu Panchang Calendar & Choghadiya',
    },
    // 3. Core Tool: Sampurn Janam Kundali & 5-Pillar Predictions (Daily transit/Gochar updates)
    {
      loc: `${cleanOrigin}/janam-kundali`,
      lastmod: dailyIsoLastMod,
      changefreq: 'daily',
      priority: '0.95',
      titleHi: 'सम्पूर्ण जन्म कुंडली, षोडशवर्ग, विंशोत्तरी दशा एवं गोचर फलित',
      titleEn: 'Sampurn Janam Kundali, Lagna Navamsha & Deep Vedic Predictions',
    },
    {
      loc: `${cleanOrigin}/?tab=janam-kundali`,
      lastmod: dailyIsoLastMod,
      changefreq: 'daily',
      priority: '0.90',
      titleHi: 'ऑनलाइन जन्मपत्री एवं जीवन के ५ स्तंभों का ज्योतिषीय विश्लेषण',
      titleEn: 'Online Janam Kundali & 5-Pillar Vedic Horoscope Generator',
    },
    // 4. Core Tool: 36 Gun Milan / Ashtakoot Kundali Matching (Weekly tool)
    {
      loc: `${cleanOrigin}/kundali-milan`,
      lastmod: weeklyIsoLastMod,
      changefreq: 'weekly',
      priority: '0.95',
      titleHi: '३६ गुण मिलान (अष्टकूट एवं मंगल दोष विचार) - विवाह कुंडली मिलान',
      titleEn: '36 Gun Milan - Ashtakoot Vivah Kundali Matching & Manglik Check',
    },
    {
      loc: `${cleanOrigin}/?tab=milan`,
      lastmod: weeklyIsoLastMod,
      changefreq: 'weekly',
      priority: '0.90',
      titleHi: 'वर-वधू ३६ गुण मिलान एवं नाड़ी/भकूट दोष परिहार',
      titleEn: 'Bride & Groom 36 Gun Milan Compatibility Report',
    },
    // 5. Core Tool: Digital Mandir & Daily Deity Darshan (Daily update as deity changes by weekday)
    {
      loc: `${cleanOrigin}/digital-mandir`,
      lastmod: dailyIsoLastMod,
      changefreq: 'daily',
      priority: '0.90',
      titleHi: 'श्री डिजिटल मंदिर - दैनिक देवता दर्शन, आरती, शंखनाद एवं डिजिटल दानपात्र',
      titleEn: 'Digital Mandir - Live Daily Deity Darshan, Aarti & Sankalp',
    },
    {
      loc: `${cleanOrigin}/?tab=mandir`,
      lastmod: dailyIsoLastMod,
      changefreq: 'daily',
      priority: '0.85',
      titleHi: 'वर्चुअल सनातन मंदिर - अखण्ड ज्योति एवं दैनिक पूजा',
      titleEn: 'Virtual Sanatan Mandir & Interactive Puja Shrine',
    },
    // 6. Core Tool: Jyotish AI Chat - Acharya Pandit Shashank Sharma (Daily update for live Gochar context)
    {
      loc: `${cleanOrigin}/jyotish-ai`,
      lastmod: dailyIsoLastMod,
      changefreq: 'daily',
      priority: '0.90',
      titleHi: 'ज्योतिष AI परामर्श - आचार्य पण्डित शशांक शर्मा से सीधा संवाद',
      titleEn: 'Jyotish AI Chat - Direct Vedic Astrology Consultation',
    },
    {
      loc: `${cleanOrigin}/?tab=chat`,
      lastmod: dailyIsoLastMod,
      changefreq: 'daily',
      priority: '0.85',
      titleHi: 'वैदिक ज्योतिष एवं कर्मकाण्ड समाधान चैट',
      titleEn: 'Vedic Astrology & Remedy AI Guidance',
    },
    // 7. Core Tool: Vedic Puja Services & Booking (Weekly update)
    {
      loc: `${cleanOrigin}/puja-services`,
      lastmod: weeklyIsoLastMod,
      changefreq: 'weekly',
      priority: '0.85',
      titleHi: 'वैदिक पूजा बुकिंग - गृह प्रवेश, रुद्राभिषेक, सत्यनारायण कथा एवं अनुष्ठान (रुद्रपुर)',
      titleEn: 'Book Authentic Vedic Puja & Rituals in Rudrapur, Uttarakhand',
    },
    {
      loc: `${cleanOrigin}/?tab=services`,
      lastmod: weeklyIsoLastMod,
      changefreq: 'weekly',
      priority: '0.80',
      titleHi: 'वैदिक कर्मकाण्ड एवं संस्कार सेवाएं',
      titleEn: 'Vedic Karamkand & Sanskar Services',
    },
    // 8. Core Tool: Dharm Gyan Kosh (Weekly update)
    {
      loc: `${cleanOrigin}/dharm-gyan-kosh`,
      lastmod: weeklyIsoLastMod,
      changefreq: 'weekly',
      priority: '0.80',
      titleHi: 'वैदिक धर्म एवं ज्ञान कोष - आरती, चालीसा, स्तोत्र एवं व्रत कथाएं',
      titleEn: 'Dharm Gyan Kosh - Aarti, Chalisa, Stotra & Vrat Katha Library',
    },
    {
      loc: `${cleanOrigin}/?tab=gyan-kosh`,
      lastmod: weeklyIsoLastMod,
      changefreq: 'weekly',
      priority: '0.75',
      titleHi: 'सनातन धर्म ग्रंथ, मंत्र एवं पूजा विधि संग्रह',
      titleEn: 'Sanatan Dharma Sacred Texts & Puja Vidhi',
    },
    // 9. Core Tool: Digital Rudraksha Mantra Jaap Mala (Weekly update)
    {
      loc: `${cleanOrigin}/mantra-jaap`,
      lastmod: weeklyIsoLastMod,
      changefreq: 'weekly',
      priority: '0.80',
      titleHi: 'डिजिटल रुद्राक्ष मंत्र जाप माला (१०८ मनके) एवं वैदिक तानपूरा साधना',
      titleEn: 'Digital 108 Rudraksha Mantra Jaap Counter & Vedic Sadhana',
    },
    {
      loc: `${cleanOrigin}/?tab=jaap`,
      lastmod: weeklyIsoLastMod,
      changefreq: 'weekly',
      priority: '0.75',
      titleHi: 'ऑनलाइन मंत्र जाप एवं साधना ट्रैकर',
      titleEn: 'Online Mantra Jaap Mala Counter',
    },
  ];

  // Dynamic Daily Panchang URLs (Today + Upcoming 7 Days)
  const dailyPanchangEntries: SitemapRouteEntry[] = upcomingDates.map((dateStr, idx) => ({
    loc: `${cleanOrigin}/panchang?date=${dateStr}`,
    lastmod: dailyIsoLastMod,
    changefreq: 'daily',
    priority: idx === 0 ? '0.90' : '0.75',
    titleHi: `दैनिक पंचांग एवं शुभ मुहूर्त (${dateStr}) - रुद्रपुर दृक गणित`,
    titleEn: `Daily Drik Panchang & Muhurat for ${dateStr} - Rudrapur`,
  }));

  // Dynamic 12 Rashi Daily Prediction Pages
  const rashiSlugs = [
    'mesh',
    'vrishabh',
    'mithun',
    'karka',
    'simha',
    'kanya',
    'tula',
    'vrishchik',
    'dhanu',
    'makar',
    'kumbh',
    'meen',
  ];
  const dailyRashiEntries: SitemapRouteEntry[] = rashiSlugs.map((slug) => ({
    loc: `${cleanOrigin}/?tab=home&rashi=${slug}`,
    lastmod: dailyIsoLastMod,
    changefreq: 'daily',
    priority: '0.80',
    titleHi: `आज का दैनिक राशिफल (${slug.toUpperCase()}) - पण्डित शशांक शर्मा`,
    titleEn: `Today's Daily Vedic Horoscope (${slug.toUpperCase()}) - Pandit Ji Online`,
  }));

  // Individual Puja Services Pages
  const serviceEntries: SitemapRouteEntry[] = PUJA_SERVICES.map((srv) => ({
    loc: `${cleanOrigin}/?tab=services&service=${encodeURIComponent(srv.id)}`,
    lastmod: weeklyIsoLastMod,
    changefreq: 'weekly',
    priority: '0.75',
    titleHi: `${srv.hindiName} - वैदिक पूजा विधि एवं बुकिंग`,
    titleEn: `${srv.name} - Authentic Vedic Puja Booking`,
  }));

  return [...coreEntries, ...dailyPanchangEntries, ...dailyRashiEntries, ...serviceEntries];
}

/**
 * Generates standard W3C Sitemap 0.9 XML string with automatic lastmod and changefreq.
 */
export function generateDynamicSitemapXml(baseOrigin: string, now: Date = new Date()): string {
  const entries = buildDynamicSitemapEntries(baseOrigin, now);

  const urlBlocks = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlBlocks}
</urlset>
`;
}

/**
 * Generates a clean, crawler-friendly robots.txt pointing directly to the dynamic /sitemap.xml URL.
 */
export function generateDynamicRobotsTxt(baseOrigin: string): string {
  const cleanOrigin = baseOrigin.replace(/\/+$/, '');
  return `# Pandit Ji Online - Autonomous SEO & Indexing Protocol
# Acharya Pandit Shashank Sharma (Rudrapur, Uttarakhand)

User-agent: *
Allow: /
Allow: /${GOOGLE_HTML_VERIFICATION_FILENAME}
Allow: /panchang
Allow: /janam-kundali
Allow: /kundali-milan
Allow: /digital-mandir
Allow: /jyotish-ai
Allow: /puja-services
Allow: /dharm-gyan-kosh
Allow: /mantra-jaap
Disallow: /api/

User-agent: Googlebot
Allow: /
Allow: /${GOOGLE_HTML_VERIFICATION_FILENAME}
Disallow: /api/

User-agent: Googlebot-Image
Allow: /

Sitemap: ${cleanOrigin}/sitemap.xml
`;
}

/**
 * Syncs static fallback copies of sitemap.xml, robots.txt, and Google Search Console
 * HTML verification file into /public while dynamic server endpoints serve real-time responses first.
 */
export function syncStaticSeoFilesToPublic(publicDirPath: string): void {
  try {
    if (!fs.existsSync(publicDirPath)) return;
    const sitemapXml = generateDynamicSitemapXml(DEFAULT_CANONICAL_ORIGIN, new Date());
    const robotsTxt = generateDynamicRobotsTxt(DEFAULT_CANONICAL_ORIGIN);
    fs.writeFileSync(path.join(publicDirPath, 'sitemap.xml'), sitemapXml, 'utf-8');
    fs.writeFileSync(path.join(publicDirPath, 'robots.txt'), robotsTxt, 'utf-8');
    fs.writeFileSync(
      path.join(publicDirPath, GOOGLE_HTML_VERIFICATION_FILENAME),
      GOOGLE_HTML_VERIFICATION_CONTENT,
      'utf-8'
    );
  } catch (err) {
    console.warn('Could not write static fallback SEO files:', err);
  }
}
