import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { generateSampurnKundali, SampurnKundaliReport } from '../utils/sampurnKundali';
import { buildSingleDayPanchang, getISTCalendarParts } from '../utils/panchangCalendarEngine';
import { getVedicDetailsFromName } from '../utils/kundaliMilan';
import { ChatGroundingSource } from '../types';

export interface ChatTurn {
  role: string;
  parts: Array<{ text: string }>;
}

export interface ChatUserProfileContext {
  name?: string;
  dob?: string;
  birthTime?: string;
  birthPlace?: string;
  rashi?: string;
  lagna?: string;
  nakshatra?: string;
  gotra?: string;
  calcViewingMode?: 'astronomical' | 'name_rashi';
}

export interface ChatResponsePayload {
  reply: string;
  sources?: ChatGroundingSource[];
  searchGrounded?: boolean;
  isFirstTurn?: boolean;
}

interface ComputedAstroContext {
  hasBirthProfile: boolean;
  userName: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
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
  dashaPrediction: string;
  atmakaraka: string;
  amatyakaraka: string;
  darakaraka: string;
  manglikStatus: string;
  sadeSatiStatus: string;
  kaalSarpStatus: string;
  gocharMoonHouse: number;
  gocharJupiterHouse: number;
  gocharSaturnHouse: number;
  gocharRahuHouse: number;
  gocharSunHouse: number;
  todayTransitSummary: string;
  todayEphemerisDegrees: string;
  todayPanchangSummary: string;
  recommendedGemstone: string;
  recommendedUparatna: string;
  recommendedMetalFinger: string;
  recommendedRudraksha: string;
  recommendedBeejMantra: string;
  ishtaDevta: string;
  kundaliReport?: SampurnKundaliReport;
}

/**
 * Computes Parashari, Jaimini (Chara Karakas) & Nadi astrological context + Live Rudrapur IST Panchang & Gochar
 */
function computeUserAstrologicalContext(
  userProfile?: ChatUserProfileContext,
  userMessage: string = ''
): ComputedAstroContext {
  const now = new Date();
  const ist = getISTCalendarParts(now);
  const todayPanchang = buildSingleDayPanchang(ist.year, ist.month, ist.day, true, now);
  const todayGocharReport = generateSampurnKundali(
    'गोचर कुंडली',
    ist.dateKey,
    `${String(ist.hours).padStart(2, '0')}:${String(ist.minutes).padStart(2, '0')}`,
    'रुद्रपुर, उत्तराखण्ड'
  );

  // Extract DOB or Time if user typed it directly in the message (e.g. 15-08-1995 or 1995-08-15)
  let dob = userProfile?.dob || '';
  const dobMatchISO = userMessage.match(/\b(19\d{2}|20\d{2})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b/);
  const dobMatchDMY = userMessage.match(/\b(0?[1-9]|[12]\d|3[01])[-/](0?[1-9]|1[0-2])[-/](19\d{2}|20\d{2})\b/);
  if (dobMatchISO) {
    dob = `${dobMatchISO[1]}-${String(dobMatchISO[2]).padStart(2, '0')}-${String(dobMatchISO[3]).padStart(2, '0')}`;
  } else if (dobMatchDMY) {
    dob = `${dobMatchDMY[3]}-${String(dobMatchDMY[2]).padStart(2, '0')}-${String(dobMatchDMY[1]).padStart(2, '0')}`;
  }

  let birthTime = userProfile?.birthTime || '12:00';
  const timeMatch = userMessage.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (timeMatch) {
    birthTime = `${String(timeMatch[1]).padStart(2, '0')}:${timeMatch[2]}`;
  }

  const userName = (userProfile?.name || 'यजमान').trim();
  const birthPlace = (userProfile?.birthPlace || 'रुद्रपुर, उत्तराखण्ड').trim();
  const hasBirthProfile = Boolean(dob || userProfile?.rashi || userProfile?.lagna);
  const effectiveDob = dob || '1995-05-15';
  const isNameRashiMode = userProfile?.calcViewingMode === 'name_rashi';

  const report = generateSampurnKundali(userName, effectiveDob, birthTime, birthPlace);
  const nameVedic = isNameRashiMode ? getVedicDetailsFromName(userName) : null;

  // Jaimini Chara Karakas (sorted by degree within sign among 7 planets Sun..Saturn)
  const sevenPlanets = report.planets
    .filter((p) => !['rahu', 'ketu'].includes(p.id))
    .slice()
    .sort((a, b) => b.degInt - a.degInt);
  const atmakaraka = sevenPlanets[0]
    ? `${sevenPlanets[0].hindiName} (${sevenPlanets[0].degree}, ${sevenPlanets[0].rashiName})`
    : 'सूर्य';
  const amatyakaraka = sevenPlanets[1]
    ? `${sevenPlanets[1].hindiName} (${sevenPlanets[1].degree}, ${sevenPlanets[1].rashiName})`
    : 'बृहस्पति';
  const darakaraka = sevenPlanets[sevenPlanets.length - 1]
    ? `${sevenPlanets[sevenPlanets.length - 1].hindiName} (${sevenPlanets[sevenPlanets.length - 1].degree}, ${sevenPlanets[sevenPlanets.length - 1].rashiName})`
    : 'शुक्र';

  const currentDasha =
    report.mahadashas.find((d) => d.isCurrent) || report.mahadashas[0];

  const rashiIndexFromName = nameVedic
    ? [
        'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
        'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन',
      ].findIndex((r) => nameVedic.rashi.includes(r)) + 1
    : 0;
  const userMoonRashiNum =
    rashiIndexFromName > 0 ? rashiIndexFromName : report.panchang.moonRashiNumber;
  const transitMoon = todayGocharReport.planets.find((p) => p.id === 'moon');
  const transitJupiter = todayGocharReport.planets.find((p) => p.id === 'jupiter');
  const transitSaturn = todayGocharReport.planets.find((p) => p.id === 'saturn');
  const transitRahu = todayGocharReport.planets.find((p) => p.id === 'rahu');
  const transitSun = todayGocharReport.planets.find((p) => p.id === 'sun');

  const calcHouseFromMoon = (planetRashiNum?: number) =>
    planetRashiNum ? ((planetRashiNum - userMoonRashiNum + 12) % 12) + 1 : 1;

  const gocharMoonHouse = calcHouseFromMoon(transitMoon?.rashiNumber);
  const gocharJupiterHouse = calcHouseFromMoon(transitJupiter?.rashiNumber);
  const gocharSaturnHouse = calcHouseFromMoon(transitSaturn?.rashiNumber);
  const gocharRahuHouse = calcHouseFromMoon(transitRahu?.rashiNumber);
  const gocharSunHouse = calcHouseFromMoon(transitSun?.rashiNumber);

  const effectiveRashiName = nameVedic
    ? nameVedic.rashi
    : userProfile?.rashi || report.panchang.moonRashiName;

  const todayTransitSummary = `आज का गोचर (${isNameRashiMode ? 'नाम राशि' : 'चन्द्र राशि'} ${effectiveRashiName} से): चन्द्रमा ${gocharMoonHouse}वें भाव (${transitMoon?.rashiName || 'मेष'}) में, देवगुरु बृहस्पति ${gocharJupiterHouse}वें भाव (${transitJupiter?.rashiName || 'वृषभ'}) में, शनि देव ${gocharSaturnHouse}वें भाव (${transitSaturn?.rashiName || 'कुम्भ'}) में, सूर्य ${gocharSunHouse}वें भाव (${transitSun?.rashiName || 'तुला'}) में तथा राहु ${gocharRahuHouse}वें भाव (${transitRahu?.rashiName || 'मीन'}) में गोचरस्थ हैं।`;

  const todayEphemerisDegrees = todayGocharReport.planets
    .map((p) => `${p.hindiName}: ${p.rashiName} (${p.degree}${p.isRetrograde ? ' वक्री' : ''}, ${p.nakshatra})`)
    .join(' | ');

  const todayPanchangSummary = `दिनांक: ${todayPanchang.formattedDateHindi} (${todayPanchang.vaarHindi}), विक्रम संवत् ${todayPanchang.vikramSamvat}, ${todayPanchang.hinduMaas}, ${todayPanchang.paksha}, तिथि: ${todayPanchang.tithiName} (${todayPanchang.tithiEndTime} तक), नक्षत्र: ${todayPanchang.nakshatra} (${todayPanchang.nakshatraEndTime} तक), योग: ${todayPanchang.yoga}, करण: ${todayPanchang.karana}, सूर्योदय: ${todayPanchang.sunrise}, सूर्यास्त: ${todayPanchang.sunset}, चन्द्रोदय: ${todayPanchang.moonrise}, दिनमान: ${todayPanchang.dinamanaFormatted}, अभिजित मुहूर्त: ${todayPanchang.abhijitMuhurat}, राहुकाल (भाग ${todayPanchang.rahuKaalPart}/8): ${todayPanchang.rahuKaal}, यमगण्ड (भाग ${todayPanchang.yamagandamPart}/8): ${todayPanchang.yamagandam}, गुलिक काल (भाग ${todayPanchang.gulikaKaalPart}/8): ${todayPanchang.gulikaKaal}${todayPanchang.festivalName ? `, आज का विशेष पर्व/व्रत: ${todayPanchang.festivalName}` : ''}`;

  return {
    hasBirthProfile,
    userName,
    dob: effectiveDob,
    birthTime,
    birthPlace,
    lagnaName: nameVedic
      ? `${nameVedic.rashi} (नाम राशि आधारित)`
      : userProfile?.lagna || report.panchang.lagnaName,
    lagnaLord: nameVedic ? nameVedic.rashiLord : report.panchang.lagnaLord,
    chandraRashi: effectiveRashiName,
    chandraRashiLord: nameVedic ? nameVedic.rashiLord : report.panchang.moonRashiLord,
    nakshatra: nameVedic
      ? nameVedic.nakshatra
      : userProfile?.nakshatra || report.panchang.nakshatraName,
    nakshatraPada: report.panchang.nakshatraPada,
    nakshatraLord: report.panchang.nakshatraLord,
    nadi: report.panchang.nadi,
    gana: report.panchang.gana,
    activeMahadasha: currentDasha?.planet || 'बृहस्पति',
    activeAntardasha: currentDasha?.currentAntardasha || 'शुक्र',
    dashaPeriod: currentDasha ? `${currentDasha.startDateDisplay} से ${currentDasha.endDateDisplay}` : 'सक्रिय काल',
    dashaPrediction: currentDasha?.prediction || '',
    atmakaraka,
    amatyakaraka,
    darakaraka,
    manglikStatus: report.doshaAnalysis.manglik.severity,
    sadeSatiStatus: `${report.doshaAnalysis.sadeSati.status} (${report.doshaAnalysis.sadeSati.phase})`,
    kaalSarpStatus: report.doshaAnalysis.kaalSarp.type,
    gocharMoonHouse,
    gocharJupiterHouse,
    gocharSaturnHouse,
    gocharRahuHouse,
    gocharSunHouse,
    todayTransitSummary,
    todayEphemerisDegrees,
    todayPanchangSummary,
    recommendedGemstone: report.lucky.ratnaName,
    recommendedUparatna: report.lucky.uparatnaName,
    recommendedMetalFinger: report.lucky.ratnaMetalAndFinger,
    recommendedRudraksha: report.lucky.rudraksha,
    recommendedBeejMantra: report.lucky.beejMantra,
    ishtaDevta: report.lucky.ishtaDevta,
    kundaliReport: report,
  };
}

function formatBaseUserName(rawName?: string): string {
  let name = (rawName || 'यजमान').trim();
  name = name.replace(/^(?:हे\s+|श्री\s+|यजमान\s+|shri\s+|hey\s+)+/i, '').trim();
  name = name.replace(/\s+(?:जी|ji)$/i, '').trim();
  if (!name) name = 'यजमान';
  return name;
}

/**
 * Extracts a name if the user explicitly introduces themselves in chat
 */
export function extractSpokenNameFromText(text: string): string | null {
  const clean = (text || '').trim();
  if (!clean) return null;

  const patterns = [
    /(?:mera\s+na+m|meri\s+na+m|मेरा\s+नाम|my\s+name\s+is)\s+([a-zA-Z\u0900-\u097F]{2,20})(?:\s+(?:hai|he|h|हैं|है|हूँ|हूं|जी|ji))?$/i,
    /(?:mera\s+na+m|meri\s+na+m|मेरा\s+नाम|my\s+name\s+is)\s+([a-zA-Z\u0900-\u097F]{2,20})\s+(?:hai|he|h|हैं|है|हूँ|हूं)/i,
    /^(?:main|mai|मैं)\s+([a-zA-Z\u0900-\u097F]{2,20})\s+(?:hoon|hu|हूँ|हूं|बोल\s+रहा|बोल\s+रही)/i,
  ];

  const stopWords = new Set([
    'kya', 'क्या', 'kon', 'kaun', 'कौन', 'batao', 'बताओ', 'hai', 'है', 'जी', 'ji',
    'pandit', 'acharya', 'यहाँ', 'yahan', 'परेशान', 'pareshan',
  ]);

  for (const pat of patterns) {
    const match = clean.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (!stopWords.has(candidate.toLowerCase())) {
        return candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    }
  }
  return null;
}

function getGreetingSalutation(rawName?: string): string {
  const base = formatBaseUserName(rawName);
  return `राधे राधे, ${base} जी! 🙏 कल्याण हो!`;
}

export type UserChatIntent = 'greeting' | 'name_intro' | 'casual_convo' | 'astrology_query';

export function detectUserChatIntent(message: string): UserChatIntent {
  const clean = (message || '').toLowerCase().trim();
  if (!clean) return 'greeting';

  if (extractSpokenNameFromText(message)) {
    return 'name_intro';
  }

  const greetings = [
    'radhe radhe', 'radhey radhey', 'radhe krishna', 'namaste', 'namaskar', 'pranam', 'pranaam',
    'hello', 'hi', 'hey', 'jai shree krishna', 'jai shri krishna', 'jai shri ram', 'jai shree ram',
    'hare krishna', 'har har mahadev', 'jai mata di', 'suprabhat', 'good morning', 'good afternoon',
    'good evening', 'राधे राधे', 'नमस्ते', 'नमस्कार', 'प्रणाम', 'जय श्री राम', 'जय श्री कृष्ण', 'हर हर महादेव',
  ];
  const strippedPunct = clean.replace(/[!.?,🙏✨🌸]+/g, '').trim();
  if (
    greetings.some(
      (g) =>
        strippedPunct === g ||
        strippedPunct === `${g} pandit ji` ||
        strippedPunct === `${g} acharya ji` ||
        strippedPunct === `${g} guruji` ||
        strippedPunct === `${g} guru ji`
    )
  ) {
    return 'greeting';
  }

  const casualPhrases = [
    'kaise ho', 'kaise hain', 'kya haal', 'kya hal', 'how are you', 'are you ok',
    'tum tik ho', 'tum thik ho', 'tum theek ho', 'aap theek', 'aap thik',
    'or kya ho raha', 'aur kya ho raha', 'kya ho raha hai', 'kya chal raha hai',
    'kya kar rahe ho', 'कैसे हो', 'कैसे हैं', 'क्या हाल', 'क्या हो रहा है', 'क्या चल रहा है',
    'thank you', 'thanks', 'dhanyawad', 'shukriya', 'धन्यवाद', 'शुक्रिया',
  ];
  if (casualPhrases.some((p) => strippedPunct.includes(p))) {
    return 'casual_convo';
  }

  return 'astrology_query';
}

function detectEffectiveLanguage(userMessage: string, selectedLang?: string): string {
  const msg = (userMessage || '').trim();
  const hasGujarati = /[\u0A80-\u0AFF]/.test(msg);

  if (hasGujarati || selectedLang === 'gu') return 'gu';
  if (selectedLang === 'mr') return 'mr';

  return 'hi';
}

/**
 * Builds the natural, conversational Vedic Acharya System Instruction.
 */
function buildPanditSystemInstruction(
  _effectiveLang: string = 'hi',
  astroCtx: ComputedAstroContext,
  _intent: UserChatIntent = 'astrology_query',
  _calcMode: 'astronomical' | 'name_rashi' = 'astronomical',
  isFirstTurn: boolean = true,
  turnNumber: number = 1
): string {
  const baseName = formatBaseUserName(astroCtx.userName);
  const salutation = getGreetingSalutation(baseName);

  const greetingRule = isFirstTurn
    ? `यह इस संवाद में यजमान का पहला संदेश (Turn #1) है। अपने उत्तर का आरम्भ केवल एक बार "${salutation}" से करें।`
    : `यह चल रहे संवाद का अनुवर्ती संदेश (Follow-up Turn #${turnNumber}) है। किसी भी प्रकार का अभिवादन (राधे राधे, कल्याण हो, नमस्ते, प्रणाम आदि) दोबारा बिल्कुल न लिखें। सीधे उत्तर से ही वाक्य आरम्भ करें।`;

  const planetPositionsStr = astroCtx.kundaliReport
    ? astroCtx.kundaliReport.planets
        .map((p) => `${p.hindiName}: ${p.rashiName} (${p.houseInLagna}वें भाव, ${p.degree}${p.isRetrograde ? ' वक्री' : ''})`)
        .join(', ')
    : '';

  return `आप साक्षात् **आचार्य पण्डित शशांक शर्मा** ("पण्डित जी ऑनलाइन", रुद्रपुर, जिला ऊधम सिंह नगर, उत्तराखण्ड) हैं। आप सनातन धर्म-शास्त्रों, बृहत् पराशर होरा शास्त्र, दृक् गणित पंचांग, वास्तु शास्त्र तथा भारतीय तीर्थ-संस्कृति के प्रकांड विद्वान, करुणामय और आत्मीय मार्गदर्शक हैं।

**संभाषण एवं उत्तर शैली के अनिवार्य सिद्धांत (CRITICAL RULES)**:
1. **प्रत्येक प्रश्न का सटीक, विस्तृत और सीधा उत्तर दें**:
   - यजमान जो भी पूछे — चाहे वह किसी शहर/तीर्थ/स्थान के बारे में हो (जैसे रुद्रपुर, मथुरा, वृन्दावन, अयोध्या, काशी, हरिद्वार, केदारनाथ, बद्रीनाथ, नैनीताल आदि), मंदिरों के बारे में हो, ज्योतिष/कुंडली/राशिफल/मुहूर्त/वास्तु के बारे में हो, आध्यात्मिक/पौराणिक विषय हो, या सामान्य बातचीत हो — सीधे उसी विषय पर ज्ञानपूर्ण, रोचक, सटीक और आत्मीय उत्तर दें।
   - कभी भी अस्पष्ट, टालमटोल वाला या एक जैसा रटा-रटाया वाक्य ("मन को सदैव सकारात्मक और धर्मपरायण रखें...") न लिखें।
   - यदि यजमान रुद्रपुर के बारे में पूछे, तो रुद्रपुर (ऊधम सिंह नगर, उत्तराखण्ड) के प्रमुख स्थानों जैसे **प्राचीन माँ अटरिया देवी सिद्धपीठ मंदिर** (जहाँ नवरात्रि में प्रसिद्ध अटरिया मेला लगता है), **श्री लक्ष्मीनारायण मंदिर**, **पंचमुखी महादेव/हनुमान मंदिर**, **लेक पैराडाइज**, **पंतनगर कृषि विश्वविद्यालय**, **सिडकुल (SIDCUL)** और कुमाऊँ के प्रवेश द्वार के रूप में इसकी विशेषताओं का सुंदर वर्णन करें।
   - यदि यजमान मथुरा-वृन्दावन या किसी अन्य तीर्थ के बारे में पूछे, तो वहाँ के प्रमुख मंदिरों, घाटों, दर्शन समय, परिक्रमा और आध्यात्मिक महिमा का विस्तार से वर्णन करें।
2. **वैदिक पृष्ठभूमि संदर्भ का बुद्धिमानी से उपयोग**:
   - जब यजमान अपनी कुंडली, राशि, दशा, करियर, विवाह, धन, स्वास्थ्य या उपाय के बारे में पूछे, तो नीचे दिए गए उनके वास्तविक कुंडली डेटा और आज के रुद्रपुर पंचांग/गोचर का सटीक उपयोग करें।
   - जब यजमान कोई सामान्य या किसी शहर/तीर्थ/ज्ञान का प्रश्न पूछे, तो अकारण उनकी कुंडली के ग्रह न गिनाएं, बल्कि सीधे उनके प्रश्न का उत्तर दें।
3. **अभिवादन शिष्टाचार नियम**:
   - ${greetingRule}
4. **भाषा एवं प्रस्तुति**:
   - सदैव सुस्पष्ट, मधुर और प्रवाहमयी हिन्दी में उत्तर दें (आवश्यकतानुसार बुलेट पॉइंट्स का उपयोग करें ताकि पढ़ने में सरल हो)।

**यजमान एवं आज के पंचांग का वास्तविक डेटा (प्रासंगिक होने पर उपयोग करें)**:
- आचार्य परिचय: आचार्य पण्डित शशांक शर्मा, "पण्डित जी ऑनलाइन", रुद्रपुर, उत्तराखण्ड (28.98° N, 79.40° E)
- आज का रुद्रपुर पंचांग: ${astroCtx.todayPanchangSummary}
- आज का गोचर: ${astroCtx.todayTransitSummary}
- आज के ग्रह स्पष्ट: ${astroCtx.todayEphemerisDegrees}
- यजमान प्रोफ़ाइल: नाम: ${baseName}, जन्म तिथि: ${astroCtx.dob}, समय: ${astroCtx.birthTime}, स्थान: ${astroCtx.birthPlace}
- लग्न: ${astroCtx.lagnaName} (स्वामी: ${astroCtx.lagnaLord}), चन्द्र राशि: ${astroCtx.chandraRashi} (स्वामी: ${astroCtx.chandraRashiLord}), नक्षत्र: ${astroCtx.nakshatra} (चरण ${astroCtx.nakshatraPada})
- जन्म कुंडली ग्रह स्थिति: ${planetPositionsStr}
- सक्रिय विंशोत्तरी दशा: ${astroCtx.activeMahadasha} महादशा - ${astroCtx.activeAntardasha} अंतर्दशा (${astroCtx.dashaPeriod})
- दोष विचार: मांगलिक: ${astroCtx.manglikStatus}, साढ़ेसाती: ${astroCtx.sadeSatiStatus}, कालसर्प: ${astroCtx.kaalSarpStatus}
- इष्ट देव: ${astroCtx.ishtaDevta}, शुभ रत्न: ${astroCtx.recommendedGemstone} (${astroCtx.recommendedMetalFinger}), रुद्राक्ष: ${astroCtx.recommendedRudraksha}, बीज मंत्र: ${astroCtx.recommendedBeejMantra}`;
}

/**
 * Deterministic post-processor that enforces the Strict Greeting Etiquette
 */
export function enforceStrictGreetingEtiquette(
  reply: string,
  isFirstTurn: boolean,
  rawUserName?: string
): string {
  const trimmed = (reply || '').trim();
  if (!trimmed) return trimmed;

  const baseName = formatBaseUserName(rawUserName);
  const salutation = getGreetingSalutation(baseName);

  if (isFirstTurn) {
    const alreadyHasGreeting = /^(?:\*\*?)?\s*(?:राधे[\s-]*राधे|जय\s+श्री\s+राधे|radhe\s+radhe|radhey\s+radhey)/i.test(
      trimmed
    );
    if (alreadyHasGreeting) {
      return trimmed;
    }
    return `**${salutation}** ${trimmed}`;
  }

  let cleaned = trimmed;

  for (let pass = 0; pass < 4; pass++) {
    const before = cleaned;

    cleaned = cleaned
      .replace(
        /^(?:\*{1,2}|\s|🙏|🌸|✨|🔱)*(?:राधे[\s-]*राधे|जय\s+श्री\s+राधे|जय\s+श्री\s+कृष्णा|जय\s+श्री\s+राम|हर\s+हर\s+महादेव|नमस्ते|नमस्कार|प्रणाम|सुप्रभात|radhe\s+radhe|radhey\s+radhey|namaste|namaskar|pranam)[^.!?\n।]*[!.?।\n]+\s*(?:\*{1,2})?\s*/i,
        ''
      )
      .trim();

    cleaned = cleaned
      .replace(
        /^(?:\*{1,2}|\s|🙏|🌸|✨|🔱)*(?:सदैव\s+)?(?:आपका\s+)?(?:कल्याण\s+हो|मंगल\s+हो|शुभ\s+हो|आयुष्मान\s+भव|kalyan\s+ho)[^.!?\n।]*[!.?।\n]+\s*(?:\*{1,2})?\s*/i,
        ''
      )
      .trim();

    cleaned = cleaned
      .replace(
        /^(?:\*{1,2}|\s|🙏|🌸|✨)*(?:राधे[\s-]*राधे|कल्याण\s+हो|नमस्ते|प्रणाम|radhe\s+radhe|kalyan\s+ho)(?:\s+[^,।.!?\n]{1,25})?[,!।]\s*(?:\*{1,2})?\s*/i,
        ''
      )
      .trim();

    cleaned = cleaned.replace(/^(?:\*{1,2}|[!।.,;:-]|🙏)+\s*/, '').trim();

    if (cleaned === before) break;
  }

  return cleaned || trimmed;
}

/**
 * Sanitizes multi-turn conversation history while preserving enough context for natural follow-ups.
 */
function buildValidGeminiContents(
  userMessage: string,
  rawHistory: ChatTurn[]
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const trimmedUserMsg = (userMessage || '').trim();
  const cleaned: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const item of rawHistory || []) {
    let text = item?.parts?.[0]?.text?.trim();
    if (!text) continue;

    // Filter out static welcome messages and old broken canned fallback strings
    if (
      text.includes('Rudrapur (Uttarakhand) aur sampoorn vishva ke shradhaluon') ||
      text.includes('बताइए, आज आपके मन में क्या जिज्ञासा या संकल्प है?') ||
      text.includes('How may I guide you today in your spiritual or astrological journey?') ||
      text.includes('Bataiye, aaj aapke mann mein kya jigyasa ya sankalp hai?') ||
      text.includes('मन को सदैव सकारात्मक और धर्मपरायण रखें')
    ) {
      continue;
    }

    const mappedRole: 'user' | 'model' =
      item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';

    if (cleaned.length === 0 && mappedRole === 'model') {
      continue;
    }

    if (mappedRole === 'model' && text.length > 500) {
      text = text.slice(0, 500) + '...';
    }

    if (cleaned.length > 0 && cleaned[cleaned.length - 1].role === mappedRole) {
      cleaned[cleaned.length - 1].parts[0].text += `\n${text}`;
    } else {
      cleaned.push({
        role: mappedRole,
        parts: [{ text }],
      });
    }
  }

  // Keep up to the last 6 turns (3 exchanges) for multi-turn memory
  const recentHistory = cleaned.slice(-6);

  while (recentHistory.length > 0 && recentHistory[0].role !== 'user') {
    recentHistory.shift();
  }

  while (recentHistory.length > 0 && recentHistory[recentHistory.length - 1].role === 'user') {
    recentHistory.pop();
  }

  recentHistory.push({
    role: 'user',
    parts: [{ text: trimmedUserMsg }],
  });

  return recentHistory;
}

/**
 * Extracts deduplicated web search grounding sources from Gemini response metadata
 */
function extractGroundingSources(response: any): ChatGroundingSource[] {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks) || chunks.length === 0) return [];

  const seen = new Set<string>();
  const sources: ChatGroundingSource[] = [];

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title;
    if (uri && typeof uri === 'string' && !seen.has(uri)) {
      seen.add(uri);
      sources.push({
        uri,
        title: (title && typeof title === 'string' ? title.trim() : uri).slice(0, 90),
      });
    }
  }

  return sources.slice(0, 5);
}

export function resolveGeminiApiKey(): string | undefined {
  const env = process.env;
  const candidate =
    env.GEMINI_API_KEY ||
    env.API_KEY ||
    env.REACT_APP_GEMINI_API_KEY ||
    env.VITE_GEMINI_API_KEY ||
    env.GOOGLE_API_KEY ||
    env.GOOGLE_GENAI_API_KEY;

  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate.trim();
  }
  return undefined;
}

let quotaExhaustedUntil = 0;

const GEMINI_MODEL_CANDIDATES = ['gemini-3-flash-preview', 'gemini-3.8-flash'];

interface GenerateContentResult {
  text: string;
  sources: ChatGroundingSource[];
  quotaExhausted?: boolean;
  notFoundOrInvalidModel?: boolean;
}

async function generateWithModel(
  ai: GoogleGenAI,
  modelName: string,
  formattedContents: any,
  systemInstruction: string,
  useGoogleSearch: boolean,
  timeoutMs = 7000
): Promise<GenerateContentResult> {
  return new Promise((resolve) => {
    let completed = false;
    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        resolve({ text: '', sources: [] });
      }
    }, timeoutMs);

    const config: Record<string, any> = {
      systemInstruction,
      temperature: 0.7,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
      },
    };

    if (useGoogleSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    ai.models
      .generateContent({
        model: modelName,
        contents: formattedContents,
        config,
      })
      .then((response: any) => {
        if (!completed) {
          completed = true;
          clearTimeout(timer);
          const responseText = response?.text;
          if (responseText && responseText.trim().length > 0) {
            const sources = extractGroundingSources(response);
            resolve({
              text: responseText.trim(),
              sources,
            });
          } else {
            resolve({ text: '', sources: [] });
          }
        }
      })
      .catch((error: any) => {
        const status = error?.status || error?.statusCode || error?.code;
        const msg = error?.message || String(error);
        const isQuota =
          status === 429 ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('quota') ||
          msg.includes('429');
        const isModelError =
          status === 404 ||
          status === 400 ||
          msg.includes('not found') ||
          msg.includes('NOT_FOUND') ||
          msg.includes('INVALID_ARGUMENT');

        if (isQuota) {
          quotaExhaustedUntil = Date.now() + 10000;
        }

        if (!completed) {
          completed = true;
          clearTimeout(timer);
          resolve({
            text: '',
            sources: [],
            quotaExhausted: isQuota,
            notFoundOrInvalidModel: isModelError,
          });
        }
      });
  });
}

function needsLiveWebSearch(message: string): boolean {
  const lower = message.toLowerCase();
  return [
    'news', 'khabar', 'live', 'current', 'weather', 'mausam', 'aaj ka bhav', 'gold rate',
    'train', 'flight', 'distance', 'hotel', 'ताज़ा', 'मौसम', 'समाचार'
  ].some((k) => lower.includes(k));
}

export async function handleChatMessage(
  userMessage: string,
  history: ChatTurn[] = [],
  selectedLanguage?: string,
  userProfile?: ChatUserProfileContext
): Promise<ChatResponsePayload> {
  const cleanMessage = (userMessage || '').trim();
  const effectiveLang = detectEffectiveLanguage(cleanMessage, selectedLanguage);

  let spokenName: string | null = extractSpokenNameFromText(cleanMessage);
  if (!spokenName && Array.isArray(history)) {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i]?.role === 'user') {
        const found = extractSpokenNameFromText(history[i]?.parts?.[0]?.text || '');
        if (found) {
          spokenName = found;
          break;
        }
      }
    }
  }

  const effectiveProfile: ChatUserProfileContext = {
    ...userProfile,
    name: spokenName || userProfile?.name,
    calcViewingMode: spokenName ? 'name_rashi' : userProfile?.calcViewingMode,
  };

  const astroCtx = computeUserAstrologicalContext(effectiveProfile, cleanMessage);
  const intent = detectUserChatIntent(cleanMessage);
  const calcMode = effectiveProfile.calcViewingMode || 'astronomical';

  const priorValidTurns = (history || []).filter((h) => {
    const txt = h?.parts?.[0]?.text?.trim();
    if (!txt) return false;
    if (
      txt.includes('बताइए, आज आपके मन में क्या ज्योतिषीय जिज्ञासा या संकल्प है?') ||
      txt.includes('How may I analyze your horoscope or guide your spiritual journey today?') ||
      txt.includes('Bataiye, aaj aap apni Kundali ya jeevan ke kis vishay par parmarsh chahte hain?')
    ) {
      return false;
    }
    return true;
  });

  const priorUserTurns = priorValidTurns.filter((h) => h.role === 'user');
  const isFirstTurn = priorUserTurns.length === 0 && priorValidTurns.length === 0;
  const turnNumber = priorUserTurns.length + 1;

  if (!cleanMessage) {
    const salutation = getGreetingSalutation(astroCtx.userName);
    return {
      reply: isFirstTurn
        ? `**${salutation}** श्री बांके बिहारी जी की कृपा आप पर सदैव बनी रहे। बताइए, आज मैं आपकी किस प्रकार सेवा या मार्गदर्शन कर सकता हूँ?`
        : `बताइए ${formatBaseUserName(astroCtx.userName)} जी, आपके मन में क्या प्रश्न है?`,
      isFirstTurn,
    };
  }

  const apiKey = resolveGeminiApiKey();

  if (apiKey && Date.now() >= quotaExhaustedUntil) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const formattedContents = buildValidGeminiContents(cleanMessage, history);
      const systemInstruction = buildPanditSystemInstruction(
        effectiveLang,
        astroCtx,
        intent,
        calcMode,
        isFirstTurn,
        turnNumber
      );

      const useSearchFirst = needsLiveWebSearch(cleanMessage);

      for (const candidateModel of GEMINI_MODEL_CANDIDATES) {
        const modelTimeout = candidateModel === 'gemini-3-flash-preview' ? 15000 : 3000;
        const result = await generateWithModel(
          ai,
          candidateModel,
          formattedContents,
          systemInstruction,
          useSearchFirst,
          modelTimeout
        );

        if (result.text) {
          const finalReply = enforceStrictGreetingEtiquette(
            result.text,
            isFirstTurn,
            astroCtx.userName
          );
          return {
            reply: finalReply,
            sources: result.sources,
            searchGrounded: result.sources.length > 0 || useSearchFirst,
            isFirstTurn,
          };
        }

        if (result.quotaExhausted) {
          break;
        }
      }
    } catch (initErr) {
      console.warn('[Gemini API Execution Notice]:', initErr);
    }
  }

  const fallbackReply = enforceStrictGreetingEtiquette(
    generateVedicFallbackResponse(
      cleanMessage,
      effectiveLang,
      astroCtx,
      intent,
      isFirstTurn
    ),
    isFirstTurn,
    astroCtx.userName
  );

  return {
    reply: fallbackReply,
    searchGrounded: false,
    isFirstTurn,
  };
}

/**
 * Comprehensive Vedic, Cultural, Tirth & Astrological Knowledge Fallback Engine
 * Ensures rich, accurate, context-specific responses even if offline or rate-limited.
 */
function generateVedicFallbackResponse(
  message: string,
  _effectiveLang: string = 'hi',
  astroCtx: ComputedAstroContext,
  intent: UserChatIntent = 'astrology_query',
  isFirstTurn: boolean = true
): string {
  const baseName = formatBaseUserName(astroCtx.userName);
  const salutation = getGreetingSalutation(baseName);
  const prefix = isFirstTurn ? `**${salutation}** ` : '';
  const lower = message.toLowerCase().trim();

  // 1. User introduced their name (e.g., "Mera nam ... hai")
  const introName = extractSpokenNameFromText(message);
  if (intent === 'name_intro' || introName) {
    const targetName = introName || baseName;
    const nameVedic = getVedicDetailsFromName(targetName);
    return `${prefix}**${targetName} जी**, आपका नाम जानकर अत्यंत प्रसन्नता हुई! वैदिक नामाक्षर सिद्धांत के अनुसार आपकी नाम राशि **${nameVedic.rashi}** (स्वामी: **${nameVedic.rashiLord}**, नक्षत्र: **${nameVedic.nakshatra}**) बनती है। बताइए ${targetName} जी, आज आपके मन में क्या विशेष जिज्ञासा या प्रश्न है?`;
  }

  // 2. Meta / Bot feedback / "Tum sahi se kam nahi kar rahe" / "Ab bhi tik nahi hai"
  if (
    [
      'sahi se kam', 'sahi se kaam', 'kaam nahi kar', 'kam nahi kar', 'work nahi',
      'tik nahi', 'theek nahi', 'thik nahi', 'galat bata', 'ek hi', 'same reply',
      'repeat', 'सही से काम', 'काम नहीं कर', 'ठीक नहीं', 'गलत बता', 'बार बार'
    ].some((k) => lower.includes(k))
  ) {
    return `${prefix}क्षमा करें ${baseName} जी, यदि पिछले उत्तर से आपको असुविधा हुई हो। अब प्रणाली पूर्णतः सुचारू है! आप मुझसे **ज्योतिष, जन्म कुंडली, पंचांग, मुहूर्त, किसी भी शहर या तीर्थ स्थल (जैसे रुद्रपुर, मथुरा, वृन्दावन, काशी, अयोध्या आदि), धर्म-शास्त्र या जीवन के किसी भी विषय** पर सीधा प्रश्न पूछ सकते हैं—मैं आपको तुरंत सटीक और विस्तृत जानकारी दूँगा।`;
  }

  if (
    [
      'kon ho', 'kaun ho', 'apne bare', 'aap kaun', 'shashank sharma', 'pandit ji online',
      'kahan baithte', 'kaha rehte', 'कौन हो', 'आप कौन', 'अपने बारे में', 'कहाँ रहते', 'शशांक शर्मा'
    ].some((k) => lower.includes(k))
  ) {
    return `${prefix}मैं **आचार्य पण्डित शशांक शर्मा** ("पण्डित जी ऑनलाइन", **रुद्रपुर, जिला ऊधम सिंह नगर, उत्तराखण्ड**) हूँ। सनातन वैदिक ज्योतिष (बृहत् पराशर होरा शास्त्र एवं दृक् गणित पंचांग), कुंडली विश्लेषण, गुण मिलान, वास्तु तथा आध्यात्मिक मार्गदर्शन के माध्यम से श्रद्धालुओं की सेवा करना ही मेरा संकल्प है। बताइए ${baseName} जी, आज मैं आपकी क्या सहायता कर सकता हूँ?`;
  }

  // 3. Casual conversation or polite check-in
  if (intent === 'casual_convo' || intent === 'greeting') {
    if (
      lower.includes('kaise ho') ||
      lower.includes('kaise hain') ||
      lower.includes('kya haal') ||
      lower.includes('how are you') ||
      lower.includes('कैसे हो') ||
      lower.includes('कैसे हैं')
    ) {
      return `${prefix}श्री बांके बिहारी जी और माँ अटरिया देवी की कृपा से सब कुशल-मंगल और आनंदमय है। आप बताइए ${baseName} जी, आप कैसे हैं और आज किस विषय पर चर्चा या मार्गदर्शन चाहते हैं?`;
    }

    if (
      lower.includes('thank') ||
      lower.includes('dhanyawad') ||
      lower.includes('shukriya') ||
      lower.includes('धन्यवाद') ||
      lower.includes('शुक्रिया')
    ) {
      return `${prefix}यह तो मेरा धर्म और सेवा है ${baseName} जी। श्री हरि विष्णु और बांके बिहारी जी सदैव आपके जीवन में सुख, शांति और समृद्धि बनाए रखें।`;
    }

    return `${prefix}श्री बांके बिहारी जी की कृपा आप पर सदैव बनी रहे। बताइए ${baseName} जी, आज आप किस विषय (कुंडली, पंचांग, तीर्थ-संस्कृति या जीवन मार्गदर्शन) पर जानकारी चाहते हैं?`;
  }

  // 4. Rudrapur / Udham Singh Nagar / Kumaon / Uttarakhand queries
  if (
    [
      'rudrapur', 'atariya', 'udham singh nagar', 'pantnagar', 'haldwani', 'kumaon',
      'रुद्रपुर', 'अटरिया', 'ऊधम सिंह नगर', 'पंतनगर', 'हल्द्वानी'
    ].some((k) => lower.includes(k))
  ) {
    return `${prefix}**रुद्रपुर (जिला ऊधम सिंह नगर, उत्तराखण्ड)** देवभूमि के कुमाऊँ मंडल के तराई क्षेत्र में स्थित एक प्रमुख ऐतिहासिक, धार्मिक और औद्योगिक नगर है:\n\n- **प्रमुख धार्मिक स्थल**: यहाँ का सबसे प्रसिद्ध सिद्धपीठ **प्राचीन माँ अटरिया देवी मंदिर** है, जहाँ चैत्र नवरात्रि में विशाल ऐतिहासिक 'अटरिया मेला' लगता है। इसके अतिरिक्त **श्री लक्ष्मीनारायण मंदिर (काशीपुर बाईपास/मेन बाज़ार)**, **पंचमुखी महादेव एवं हनुमान मंदिर**, **चौमुंडा मंदिर** और **गुरुद्वारा श्री सिंह सभा** प्रमुख आस्था केंद्र हैं।\n- **प्रमुख आकर्षण व शिक्षा**: रुद्रपुर के निकट ही विश्वप्रसिद्ध **जी.बी. पंत कृषि एवं प्रौद्योगिकी विश्वविद्यालय (पंतनगर)** तथा पंतनगर एयरपोर्ट स्थित है। मनोरंजन व भ्रमण के लिए **लेक पैराडाइज (Lake Paradise)** और गांधी पार्क प्रसिद्ध हैं।\n- **भौगोलिक व औद्योगिक महत्व**: कल्याणी नदी के तट पर बसा यह शहर **सिडकुल (SIDCUL)** के कारण उत्तराखण्ड का बड़ा औद्योगिक केंद्र है और नैनीताल, भीमताल, कैंची धाम तथा अल्मोड़ा जाने वाले यात्रियों के लिए कुमाऊँ का मुख्य प्रवेश द्वार है।`;
  }

  // 5. Mathura / Vrindavan / Barsana / Govardhan / Braj Bhoomi queries
  if (
    [
      'mathura', 'vrindavan', 'barsana', 'govardhan', 'gokul', 'braj', 'brij', 'banke bihari',
      'prem mandir', 'nidhivan', 'dwarkadhish', 'मथुरा', 'वृंदावन', 'वृन्दावन', 'बरसाना',
      'गोवर्धन', 'गोकुल', 'बांके बिहारी', 'प्रेम मंदिर', 'निधिवन'
    ].some((k) => lower.includes(k))
  ) {
    return `${prefix}**श्रीधाम मथुरा और वृन्दावन (ब्रजभूमि)** भगवान श्री कृष्ण की दिव्य जन्मस्थली और लीलाभूमि हैं तथा सनातन धर्म की 'सप्त पुरियों' (सात मोक्षदायिनी नगरियों) में से एक हैं:\n\n- **मथुरा के प्रमुख दर्शनीय स्थल**:\n  1. **श्री कृष्ण जन्मभूमि मंदिर**: वह पावन कारागार (गर्भ गृह) जहाँ भाद्रपद कृष्ण अष्टमी को भगवान श्री कृष्ण का प्राकट्य हुआ था, तथा भव्य केशवदेव मंदिर और भागवत भवन।\n  2. **श्री द्वारकाधीश मंदिर**: पुष्टिमार्गीय संप्रदाय का अत्यंत भव्य एवं प्राचीन मंदिर, जो अपनी राजस्थानी स्थापत्य कला और हिंडोला उत्सव के लिए प्रसिद्ध है।\n  3. **विश्राम घाट**: यमुना जी का सबसे मुख्य घाट जहाँ कंस वध के पश्चात श्री कृष्ण और बलराम जी ने विश्राम किया था; यहाँ की संध्या यमुना आरती अत्यंत दिव्य होती है।\n- **वृन्दावन के प्रमुख मंदिर**:\n  1. **ठाकुर श्री बांके बिहारी मंदिर**: स्वामी हरिदास जी द्वारा प्रकट किए गए ठा. बांके बिहारी जी का विश्वप्रसिद्ध मंदिर।\n  2. **प्रेम मंदिर, इस्कॉन मंदिर एवं निधिवन**: जगद्गुरु कृपालु जी महाराज द्वारा निर्मित श्वेत संगमरमर का भव्य प्रेम मंदिर, श्री राधारमण मंदिर, श्री राधावल्लभ मंदिर और रहस्यमयी सेवाकुंज/निधिवन।\n- **आसपास के ब्रज तीर्थ**: **गोवर्धन पर्वत (२१ किमी परिक्रमा)**, **बरसाना (श्री लाडली जी राधारानी मंदिर)**, **गोकुल (रमण रेती)** और **नंदगाँव**।`;
  }

  // 6. Ayodhya / Kashi / Varanasi / Haridwar / Rishikesh / Kedarnath / Badrinath / Ujjain / Kainchi Dham
  if (['ayodhya', 'ram mandir', 'saryu', 'hanuman garhi', 'अयोध्या', 'राम मंदिर', 'हनुमान गढ़ी'].some((k) => lower.includes(k))) {
    return `${prefix}**श्री अयोध्या धाम** मर्यादा पुरुषोत्तम भगवान श्री राम की पावन जन्मभूमि है:\n\n- **प्रमुख दर्शन**: **श्री राम जन्मभूमि भव्य मंदिर (रामलला सरकार)**, **श्री हनुमान गढ़ी**, **कनक भवन**, **दशरथ महल**, **नागेश्वरनाथ मंदिर** और **छोटी देवकाली**।\n- **सरयू आरती**: राम की पैड़ी और सरयू घाट पर संध्याकालीन आरती एवं दीपदान का विशेष आध्यात्मिक महत्व है।`;
  }

  if (['kashi', 'varanasi', 'banaras', 'vishwanath', 'काशी', 'वाराणसी', 'बनारस', 'विश्वनाथ'].some((k) => lower.includes(k))) {
    return `${prefix}**अविमुक्त क्षेत्र काशी (वाराणसी)** भगवान शिव के त्रिशूल पर बसी मोक्षदायिनी नगरी है:\n\n- **प्रमुख मंदिर**: द्वादश ज्योतिर्लिंगों में प्रमुख **श्री काशी विश्वनाथ धाम**, **काल भैरव मंदिर (काशी के कोतवाल)**, **संकटमोचन हनुमान मंदिर**, **माँ अन्नपूर्णा मंदिर**, **दुर्गा कुंड** और **तुलसी मानस मंदिर**।\n- **प्रमुख घाट**: दशाश्वमेध घाट की विश्वप्रसिद्ध गंगा आरती, अस्सी घाट और मणिकर्णिका घाट।`;
  }

  if (
    [
      'haridwar', 'rishikesh', 'kedarnath', 'badrinath', 'gangotri', 'yamunotri', 'char dham',
      'kainchi dham', 'neem karoli', 'nainital', 'हरिद्वार', 'ऋषिकेश', 'केदारनाथ', 'बद्रीनाथ',
      'चार धाम', 'कैंची धाम', 'नीम करोली', 'नैनीताल'
    ].some((k) => lower.includes(k))
  ) {
    return `${prefix}**देवभूमि उत्तराखण्ड के पावन तीर्थ**:\n\n- **हरिद्वार एवं ऋषिकेश**: हर की पैड़ी (ब्रह्मकुंड) की गंगा आरती, माँ मनसा देवी व चंडी देवी शक्तिपीठ, तथा ऋषिकेश में त्रिवेणी घाट, परमार्थ निकेतन, लक्ष्मण झूला और नीलकंठ महादेव मंदिर।\n- **उत्तराखण्ड चार धाम**: **यमुनोत्री**, **गंगोत्री**, एकादशवें ज्योतिर्लिंग **श्री केदारनाथ धाम** और वैकुण्ठ रूप **श्री बद्रीनाथ धाम**।\n- **कुमाऊँ के प्रमुख धाम**: नैनीताल में **माँ नैना देवी शक्तिपीठ**, भवाली के निकट बाबा नीब करौरी महाराज का **श्री कैंची धाम आश्रम**, और अल्मोड़ा में **जागेश्वर धाम** व **चितई गोलू देवता मंदिर**।`;
  }

  if (['ujjain', 'mahakal', 'mahakaleshwar', 'उज्जैन', 'महाकाल', 'महाकालेश्वर'].some((k) => lower.includes(k))) {
    return `${prefix}**अवंतिका नगरी उज्जैन** क्षिप्रा नदी के तट पर स्थित सप्त पुरियों में से एक है:\n\n- **प्रमुख दर्शन**: दक्षिणमुखी ज्योतिर्लिंग **श्री महाकालेश्वर ज्योतिर्लिंग** (जहाँ की भस्म आरती विश्वप्रसिद्ध है), **महाकाल लोक कॉरिडोर**, **काल भैरव मंदिर**, **माँ हरसिद्धि शक्तिपीठ**, **मंगलनाथ मंदिर** (मंगल दोष शांति का मुख्य केंद्र) और **सांदीपनि आश्रम**।`;
  }

  // 7. Vehicle / Car / Bike purchase
  if (['vahan', 'car', 'gadi', 'gaadi', 'bike', 'scooter', 'वाहन', 'गाड़ी', 'कार', 'बाइक'].some((k) => lower.includes(k))) {
    return `${prefix}${baseName} जी, वाहन (कार/बाइक) क्रय करने के लिए शुक्रवार, बुधवार या सोमवार का दिन और शुक्ल पक्ष की द्वितीया, तृतीया, पंचमी, दशमी या एकादशी तिथि अत्यंत शुभ मानी जाती हैं। आज के पंचांग के अनुसार अभिजित मुहूर्त में वाहन की डिलीवरी लेना तथा संकटमोचन हनुमान जी अथवा भगवान गणेश जी के मंदिर में पहली पूजा कराना सुरक्षित और मंगलकारी रहेगा।`;
  }

  // 8. House / Land / Property / Makaan / Flat / Vastu
  if (['makan', 'ghar', 'bhoomi', 'plot', 'flat', 'property', 'zameen', 'vastu', 'मकान', 'घर', 'भूमि', 'प्रॉपर्टी', 'जमीन', 'वास्तु'].some((k) => lower.includes(k))) {
    return `${prefix}${baseName} जी, भूमि, नया मकान या फ्लैट क्रय अथवा गृह निर्माण के लिए रोहिणी, उत्तराभाद्रपद, उत्तराषाढ़ा, अनुराधा या हस्त नक्षत्र और गुरुवार अथवा शुक्रवार का दिन श्रेष्ठ माना गया है। वास्तु शास्त्र के अनुसार ईशान कोण (उत्तर-पूर्व) में पूजा स्थान व जल स्रोत तथा आग्नेय कोण (दक्षिण-पूर्व) में रसोईघर रखना घर में सुख-समृद्धि लाता है।`;
  }

  // 9. Anger / Stress / Sleeplessness / Mind peace / Health
  if (['gussa', 'krodh', 'stress', 'tension', 'neend', 'ashanti', 'dimag', 'health', 'swasthya', 'bimari', 'क्रोध', 'गुस्सा', 'तनाव', 'नींद', 'अशांति', 'स्वास्थ्य', 'बीमारी'].some((k) => lower.includes(k))) {
    return `${prefix}${baseName} जी, उत्तम स्वास्थ्य, मानसिक शांति और चित्त की स्थिरता के लिए नित्य प्रातः चांदी के पात्र में जल ग्रहण करें तथा "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्" (महामृत्युंजय मंत्र) या "ॐ नमः शिवाय" का १०८ बार जप करें। आपकी राशि **${astroCtx.chandraRashi}** के अनुसार रात्रि में तांबे के पात्र में रखा जल प्रातः पीना और सूर्य नमस्कार करना विशेष लाभकारी रहेगा।`;
  }

  // 10. Studies / Exam / Education
  if (['padhai', 'exam', 'shiksha', 'pariksha', 'study', 'padh', 'पढ़ाई', 'शिक्षा', 'परीक्षा', 'अध्ययन'].some((k) => lower.includes(k))) {
    return `${prefix}${baseName} जी, विद्या, प्रतियोगी परीक्षा और अध्ययन में एकाग्रता हेतु नित्य प्रातः माँ सरस्वती के बीज मंत्र "ॐ ऐं सरस्वत्यै नमः" का १०८ बार जप करें। अध्ययन करते समय पूर्व अथवा उत्तर दिशा की ओर मुख रखें और बुधवार को भगवान गणेश जी को दूर्वा अर्पित करें।`;
  }

  // 11. Children / Santan / Family planning
  if (['santan', 'bachha', 'bachhe', 'child', 'beta', 'beti', 'संतान', 'बच्चा', 'पुत्र', 'पुत्री'].some((k) => lower.includes(k))) {
    return `${prefix}${baseName} जी, संतान सुख और कुल वृद्धि के लिए भगवान श्री कृष्ण के बाल रूप (लड्डू गोपाल) की सेवा तथा 'संतान गोपाल स्तोत्र' अथवा मंत्र ("ॐ श्रीं ह्रीं क्लीं ग्लौं देवकीसुत गोविन्द वासुदेव जगत्पते देहि मे तनयं कृष्ण त्वामहं शरणं गतः") का पाठ अत्यंत फलदायी माना गया है।`;
  }

  // 12. Panchang / Muhurat / Tithi / Ekadashi / Rahukaal
  if (
    ['panchang', 'muhurat', 'muhurt', 'tithi', 'rahukaal', 'rahu kaal', 'abhijit', 'ekadashi', 'yamagand', 'gulika', 'पंचांग', 'मुहूर्त', 'तिथि', 'राहुकाल', 'एकादशी', 'यमगण्ड', 'गुलिक'].some((k) =>
      lower.includes(k)
    )
  ) {
    return `${prefix}**आज का रुद्रपुर दृक् गणित पंचांग**:\n${astroCtx.todayPanchangSummary}\n\n**विशेष निर्देश**: शुभ व मांगलिक कार्य **अभिजित मुहूर्त** में प्रारम्भ करें तथा राहुकाल और यमगण्ड काल में नई यात्रा या अनुबंध से बचें।`;
  }

  // 13. Specific Transit / Gochar / Planetary status / Rashifal
  if (
    [
      'gochar', 'transit', 'planet', 'vakri', 'margi', 'rashifal', 'aaj ka din', 'bhavishya',
      'गोचर', 'ग्रह स्थिति', 'राशिफल', 'आज का दिन', 'भविष्य'
    ].some((k) => lower.includes(k))
  ) {
    return `${prefix}**आपकी राशि (${astroCtx.chandraRashi}) से आज का गोचर एवं राशिफल**:\n- ${astroCtx.todayTransitSummary}\n- **सक्रिय दशा**: **${astroCtx.activeMahadasha} महादशा (${astroCtx.activeAntardasha} अंतर्दशा)**\n- **आज का परामर्श**: चन्द्रमा के ${astroCtx.gocharMoonHouse}वें भाव में गोचर और गुरु के ${astroCtx.gocharJupiterHouse}वें भाव में होने से धैर्यपूर्वक किए गए कार्यों में सफलता मिलेगी। शुभत्व संवर्धन हेतु नित्य जपें: \`${astroCtx.recommendedBeejMantra}\`।`;
  }

  // 14. Specific Horoscope / Kundali / Rashi / Lagna / Dosha demand
  if (
    [
      'kundali', 'kundli', 'lagna', 'rashi', 'nakshatra', 'dosha', 'manglik', 'sade sati', 'kaal sarp', 'pitra',
      'कुंडली', 'लग्न', 'राशि', 'नक्षत्र', 'दोष', 'मांगलिक', 'साढ़ेसाती', 'कालसर्प', 'पितृ'
    ].some((k) => lower.includes(k))
  ) {
    const planetLines = astroCtx.kundaliReport
      ? astroCtx.kundaliReport.planets
          .slice(0, 7)
          .map((p) => `${p.hindiName} (${p.rashiName}, ${p.houseInLagna}वाँ भाव)`)
          .join(', ')
      : '';
    return `${prefix}**${baseName} जी की वैदिक जन्म पत्रिका का सार**:\n\n- **लग्न**: **${astroCtx.lagnaName}** (लग्नेश: **${astroCtx.lagnaLord}**) | **चन्द्र राशि**: **${astroCtx.chandraRashi}** (स्वामी: **${astroCtx.chandraRashiLord}**)\n- **जन्म नक्षत्र**: **${astroCtx.nakshatra}** (चरण ${astroCtx.nakshatraPada}) | **नाड़ी**: ${astroCtx.nadi} | **गण**: ${astroCtx.gana}\n- **प्रमुख ग्रह स्थिति**: ${planetLines}\n- **सक्रिय विंशोत्तरी दशा**: **${astroCtx.activeMahadasha} महादशा में ${astroCtx.activeAntardasha} की अंतर्दशा** (${astroCtx.dashaPeriod})\n- **दोष विचार**: मांगलिक स्थिति: **${astroCtx.manglikStatus}** | शनि साढ़ेसाती: **${astroCtx.sadeSatiStatus}** | कालसर्प योग: **${astroCtx.kaalSarpStatus}**\n- **शुभ रत्न व बीज मंत्र**: **${astroCtx.recommendedGemstone}** (${astroCtx.recommendedMetalFinger}) | मंत्र: \`${astroCtx.recommendedBeejMantra}\``;
  }

  // 15. Career / Job / Business / Promotion
  if (
    ['career', 'naukri', 'job', 'business', 'vyapar', 'promotion', 'kaam', 'rozgar', 'करियर', 'नौकरी', 'व्यापार', 'रोजगार', 'प्रमोशन'].some((k) =>
      lower.includes(k)
    )
  ) {
    return `${prefix}${baseName} जी, आपकी पत्रिका (**${astroCtx.lagnaName} लग्न**, **${astroCtx.chandraRashi} राशि**) और वर्तमान **${astroCtx.activeMahadasha}-${astroCtx.activeAntardasha}** दशा के अनुसार कार्यक्षेत्र व आजीविका में उन्नति के प्रबल योग हैं। दशम भाव और कर्मेश को बल देने के लिए नित्य प्रातः तांबे के लोटे से सूर्य भगवान को रोली व अक्षत युक्त अर्घ्य दें तथा **"ॐ घृणि सूर्याय नमः"** का जप करें। शनिवार को संध्या समय पीपल के नीचे सरसों के तेल का दीपक जलाना कार्यक्षेत्र की बाधाओं को दूर करेगा।`;
  }

  // 16. Marriage / Relationship / Love
  if (
    ['vivah', 'shaadi', 'shadi', 'marriage', 'rishta', 'patni', 'pati', 'love', 'prem', 'विवाह', 'शादी', 'रिश्ता', 'प्रेम', 'दांपत्य'].some((k) =>
      lower.includes(k)
    )
  ) {
    return `${prefix}${baseName} जी, आपकी पत्रिका में सप्तम भाव एवं दारकारक (**${astroCtx.darakaraka}**) के अनुसार विवाह और दांपत्य जीवन में सुख-सौहार्द के लिए गुरुवार को भगवान लक्ष्मीनारायण की आराधना करें और केले के वृक्ष में हल्दी मिश्रित जल अर्पित करें। वर्तमान **${astroCtx.activeMahadasha}-${astroCtx.activeAntardasha}** दशा में शुभ मांगलिक प्रस्तावों और आपसी सामंजस्य में सकारात्मक प्रगति होगी।`;
  }

  // 17. Wealth / Finance / Loan / Karz
  if (
    ['dhan', 'paisa', 'money', 'finance', 'arthik', 'karz', 'loan', 'lakshmi', 'धन', 'पैसा', 'आर्थिक', 'कर्ज', 'लक्ष्मी'].some((k) =>
      lower.includes(k)
    )
  ) {
    return `${prefix}${baseName} जी, आपकी **${astroCtx.chandraRashi}** राशि से धनेश एवं एकादश भाव की अनुकूलता तथा कर्ज मुक्ति और आर्थिक समृद्धि के लिए शुक्रवार को माँ महालक्ष्मी के समक्ष घी का दीपक जलाकर **श्री सूक्त** या **कनकधारा स्तोत्र** का पाठ करें। बुधवार को ऋणहर्ता गणेश स्तोत्र का पाठ करना आर्थिक रुकावटों को दूर करने में अत्यंत सिद्ध माना गया है।`;
  }

  // 18. Gemstone / Rudraksha / Mantra / Upay
  if (
    ['ratna', 'gemstone', 'rudraksha', 'mantra', 'upay', 'stotra', 'puja', 'रत्न', 'रुद्राक्ष', 'मंत्र', 'उपाय', 'पूजा'].some((k) =>
      lower.includes(k)
    )
  ) {
    return `${prefix}**${baseName} जी (${astroCtx.lagnaName} लग्न, ${astroCtx.chandraRashi} राशि) के लिए शास्त्रोक्त उपाय**:\n\n- **अनुशंसित शुभ रत्न**: **${astroCtx.recommendedGemstone}** (उपरत्न: ${astroCtx.recommendedUparatna}) — धारण विधि: ${astroCtx.recommendedMetalFinger}\n- **शुभ रुद्राक्ष**: **${astroCtx.recommendedRudraksha}**\n- **इष्ट आराधना**: **${astroCtx.ishtaDevta}**\n- **सिद्ध बीज मंत्र**: \`${astroCtx.recommendedBeejMantra}\` (नित्य प्रातः १०८ बार जप करें)।`;
  }

  // 19. Contextual synthesis for any other custom question (varied, specific, never repetitive)
  return `${prefix}${baseName} जी, आपके इस विषय (**"${message.trim().slice(0, 80)}"**) पर वैदिक और व्यावहारिक दृष्टि से विचार करें तो:\n\n- वर्तमान में आपकी **${astroCtx.chandraRashi}** राशि से चन्द्रमा **${astroCtx.gocharMoonHouse}वें भाव** में तथा देवगुरु बृहस्पति **${astroCtx.gocharJupiterHouse}वें भाव** में गोचर कर रहे हैं और आपकी **${astroCtx.activeMahadasha}-${astroCtx.activeAntardasha}** दशा सक्रिय है।\n- आज का शुभ **अभिजित मुहूर्त ${astroCtx.todayPanchangSummary.match(/अभिजित मुहूर्त:\s*([^,]+)/)?.[1] || '11:42 AM - 12:28 PM'}** है।\n- इस विषय में पूर्ण सफलता और स्पष्टता के लिए अपने इष्ट देव **${astroCtx.ishtaDevta}** का स्मरण कर कदम आगे बढ़ाएं तथा नित्य \`${astroCtx.recommendedBeejMantra}\` का जप करें। यदि आप इस विषय से जुड़ा कोई और विशिष्ट बिंदु (जैसे जन्म विवरण, स्थान या मुहूर्त) पूछना चाहें तो अवश्य बताइए!`;
}
