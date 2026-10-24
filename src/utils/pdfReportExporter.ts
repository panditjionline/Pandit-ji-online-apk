import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SampurnKundaliReport, KundaliChartHouse, GrahaPosition, VimshottariDashaItem } from './sampurnKundali';
import { KundaliMilanResult } from './kundaliMilan';

export const BRAND_PDF_CONFIG = {
  appName: 'पण्डित जी ऑनलाइन (Pandit Ji Online)',
  appSubtitle: 'बृहत् वैदिक ज्योतिष, जन्म कुंडली एवं शास्त्रोक्त ३६ गुण मिलान महा-पत्रिका',
  guideTitle: 'मुख्य ज्योतिषाचार्य एवं संस्थापक:',
  guideName: 'आचार्य पण्डित शशांक शर्मा (वैदिक पुरोहित एवं ज्योतिषाचार्य)',
  guideAddress: 'रुद्रपुर, उधम सिंह नगर, उत्तराखण्ड (भारत)',
  contactPhone: '+91 7017279043',
  whatsappNumber: '7017279043',
  website: 'PanditJiOnline.com',
};

function escapeHtml(text: string | number | undefined | null): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeFileName(raw: string): string {
  return String(raw || 'Yajman')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[<>:"/\\|?*]+/g, '');
}

/**
 * Helper to derive 12 Bhava Sphut (Sidereal House Midpoints & Sandhis) and Rudraksha / Gemstone details
 */
export interface BhavaSphutRow {
  houseNumber: number;
  bhavaName: string;
  significator: string;
  rashiName: string;
  rashiLord: string;
  madhyaDMS: string;
  sandhiStartDMS: string;
  sandhiEndDMS: string;
  planets: string;
}

export interface ShadbalaRow {
  planet: string;
  englishName: string;
  sthanaBala: number;
  digBala: number;
  cheshtaBala: number;
  naisargikaBala: number;
  totalRupas: string;
  strengthPct: number;
  grade: 'अति बली (Exalted/Strong)' | 'बली (Strong)' | 'मध्यम (Moderate)' | 'निर्बल (Needs Remedy)';
  remedyHint: string;
}

export interface LagnaGemstoneRudrakshaInfo {
  jeevanRatna: string;
  bhagyaRatna: string;
  ishtaRatna: string;
  uparatna: string;
  weightRatti: string;
  metalAndFinger: string;
  wearingDayAndTime: string;
  pranaPratishthaMantra: string;
  avoidStones: string;
  primaryRudraksha: string;
  secondaryRudraksha: string;
  rudrakshaMantra: string;
  rudrakshaBenefits: string;
}

const BHAVA_NAMES: Array<{ name: string; karaka: string }> = [
  { name: 'प्रथम (तनु/लग्न भाव)', karaka: 'सूर्य (देह, व्यक्तित्व, आयु, यश)' },
  { name: 'द्वितीय (धन/कुटुम्ब भाव)', karaka: 'गुरु (संचित धन, वाणी, परिवार)' },
  { name: 'तृतीय (सहज/पराक्रम भाव)', karaka: 'मंगल (साहस, छोटे भाई-बहन, पुरुषार्थ)' },
  { name: 'चतुर्थ (सुख/मातृ भाव)', karaka: 'चन्द्र/बुध (माता, भूमि, भवन, वाहन)' },
  { name: 'पंचम (संतान/विद्या भाव)', karaka: 'गुरु (शिक्षा, बुद्धि, संतान, पूर्वपुण्य)' },
  { name: 'षष्ठ (रिपु/रोग भाव)', karaka: 'मंगल/शनि (रोग, ऋण, शत्रु, प्रतिस्पर्धा)' },
  { name: 'सप्तम (जाया/विवाह भाव)', karaka: 'शुक्र (जीवनसाथी, वैवाहिक सुख, व्यापार)' },
  { name: 'अष्टम (आयु/मृत्यु भाव)', karaka: 'शनि (दीर्घायु, गुप्त विद्या, आकस्मिक घटना)' },
  { name: 'नवम (भाग्य/धर्म भाव)', karaka: 'गुरु/सूर्य (भाग्य, धर्म, गुरु, तीर्थयात्रा)' },
  { name: 'दशम (कर्म/राज्य भाव)', karaka: 'सूर्य/बुध/गुरु/शनि (आजीविका, पद-प्रतिष्ठा, पिता)' },
  { name: 'एकादश (लाभ/आय भाव)', karaka: 'गुरु (आय, मनोकामना पूर्ति, ज्येष्ठ भ्राता)' },
  { name: 'द्वादश (व्यय/मोक्ष भाव)', karaka: 'शनि/केतु (व्यय, विदेश यात्रा, मोक्ष, शैया सुख)' },
];

const RASHI_LORDS_BY_NUM: Record<number, string> = {
  1: 'मंगल',
  2: 'शुक्र',
  3: 'बुध',
  4: 'चन्द्र',
  5: 'सूर्य',
  6: 'बुध',
  7: 'शुक्र',
  8: 'मंगल',
  9: 'गुरु',
  10: 'शनि',
  11: 'शनि',
  12: 'गुरु',
};

function formatDegToDMS(deg: number): string {
  const norm = ((deg % 30) + 30) % 30;
  const d = Math.floor(norm);
  const mFloat = (norm - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}′ ${String(Math.min(59, s)).padStart(2, '0')}″`;
}

export function computeBhavaSphutTable(report: SampurnKundaliReport): BhavaSphutRow[] {
  const degMatch = report.panchang.lagnaDegreeDMS.match(/(\d+)°\s*(\d+)/);
  const baseDeg = degMatch
    ? parseInt(degMatch[1], 10) + parseInt(degMatch[2], 10) / 60
    : report.panchang.lagnaDegInt || 15.25;

  return report.lagnaChart.map((house, idx) => {
    const meta = BHAVA_NAMES[idx] || { name: `भाव ${house.houseNumber}`, karaka: 'सामान्य' };
    const harmonicOffset = Math.sin(((idx * 30) * Math.PI) / 180) * 1.35;
    const madhyaDeg = ((baseDeg + harmonicOffset) % 30 + 30) % 30;
    const startDeg = ((madhyaDeg - 15) % 30 + 30) % 30;
    const endDeg = ((madhyaDeg + 15) % 30 + 30) % 30;
    const planetStr =
      house.planets && house.planets.length > 0
        ? house.planets.map((p) => `${p.hindiName} (${p.degInt}°)`).join(', ')
        : '— (भाव रिक्त)';

    return {
      houseNumber: house.houseNumber,
      bhavaName: meta.name,
      significator: meta.karaka,
      rashiName: `${house.rashiName} (${house.rashiNumber})`,
      rashiLord: RASHI_LORDS_BY_NUM[house.rashiNumber] || 'गुरु',
      madhyaDMS: formatDegToDMS(madhyaDeg),
      sandhiStartDMS: formatDegToDMS(startDeg),
      sandhiEndDMS: formatDegToDMS(endDeg),
      planets: planetStr,
    };
  });
}

export function computeShadbalaSummary(planets: GrahaPosition[]): ShadbalaRow[] {
  const naisargikaMap: Record<string, number> = {
    सूर्य: 60,
    चंद्र: 51.4,
    चन्द्र: 51.4,
    शुक्र: 42.9,
    गुरु: 34.3,
    बुध: 25.7,
    मंगल: 17.1,
    शनि: 8.6,
    राहु: 30.0,
    केतु: 30.0,
  };

  const digbalaIdealHouse: Record<string, number> = {
    गुरु: 1,
    बुध: 1,
    सूर्य: 10,
    मंगल: 10,
    शनि: 7,
    चंद्र: 4,
    चन्द्र: 4,
    शुक्र: 4,
    राहु: 10,
    केतु: 4,
  };

  return planets.map((p) => {
    let sthana = 135;
    if (p.dignity.includes('उच्च')) sthana = 195;
    else if (p.dignity.includes('स्वगृही')) sthana = 176;
    else if (p.dignity.includes('मित्र')) sthana = 154;
    else if (p.dignity.includes('सम')) sthana = 132;
    else if (p.dignity.includes('शत्रु')) sthana = 108;
    else if (p.dignity.includes('नीच')) sthana = 86;

    const idealH = digbalaIdealHouse[p.hindiName] || 1;
    const houseDiff = Math.min(
      Math.abs(p.houseInLagna - idealH),
      12 - Math.abs(p.houseInLagna - idealH)
    );
    const digBala = Math.round(60 - houseDiff * 8.5);
    const cheshtaBala = p.isRetrograde ? 54 : p.isCombust ? 22 : 42;
    const naisargika = naisargikaMap[p.hindiName] || 30;

    const totalVirupas = sthana + digBala + cheshtaBala + naisargika + 115;
    const rupas = (totalVirupas / 60).toFixed(2);
    const pct = Math.min(99, Math.max(42, Math.round((totalVirupas / 440) * 100)));

    let grade: ShadbalaRow['grade'] = 'बली (Strong)';
    let remedyHint = 'शुभ फलप्रद स्थिति — नित्य इष्ट स्मरण पर्याप्त';
    if (pct >= 84) {
      grade = 'अति बली (Exalted/Strong)';
      remedyHint = 'पूर्ण राजयोगकारी बल — श्रेष्ठ नेतृत्व एवं उन्नति';
    } else if (pct >= 68) {
      grade = 'बली (Strong)';
      remedyHint = 'अनुकूल ग्रह बल — कार्यसिद्धि एवं स्थिर प्रगति';
    } else if (pct >= 55) {
      grade = 'मध्यम (Moderate)';
      remedyHint = `${p.hindiName} के बीज मंत्र का नित्य १०८ जप शुभदायी`;
    } else {
      grade = 'निर्बल (Needs Remedy)';
      remedyHint = `${p.hindiName} शांति दान एवं वैदिक जप अनुष्ठान आवश्यक`;
    }

    return {
      planet: p.hindiName,
      englishName: p.name,
      sthanaBala: sthana,
      digBala,
      cheshtaBala,
      naisargikaBala: Math.round(naisargika),
      totalRupas: `${rupas} रूप`,
      strengthPct: pct,
      grade,
      remedyHint,
    };
  });
}

export function computeAntardashaSubPeriods(
  dasha: VimshottariDashaItem
): Array<{ planet: string; periodText: string; isCurrent: boolean }> {
  const order = ['केतु', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगल', 'राहु', 'गुरु', 'शनि', 'बुध'];
  const yearsMap: Record<string, number> = {
    केतु: 7,
    शुक्र: 20,
    सूर्य: 6,
    चंद्र: 10,
    मंगल: 7,
    राहु: 18,
    गुरु: 16,
    शनि: 19,
    बुध: 17,
  };

  const mainPlanet = dasha.planet.replace('चन्द्र', 'चंद्र');
  const startIdx = Math.max(0, order.indexOf(mainPlanet));
  const rotated = [...order.slice(startIdx), ...order.slice(0, startIdx)];

  let cursorYear = dasha.startYear;
  const nowYear = new Date().getFullYear();

  return rotated.map((subP) => {
    const subSpan = (dasha.years * (yearsMap[subP] || 10)) / 120;
    const sYear = Math.floor(cursorYear);
    const sMonth = Math.min(12, Math.max(1, Math.round((cursorYear - sYear) * 12) + 1));
    cursorYear += subSpan;
    const eYear = Math.floor(cursorYear);
    const eMonth = Math.min(12, Math.max(1, Math.round((cursorYear - eYear) * 12) + 1));

    const isCurr =
      dasha.isCurrent &&
      ((dasha.currentAntardasha && dasha.currentAntardasha.includes(subP)) ||
        (nowYear >= sYear && nowYear <= eYear));

    return {
      planet: `${dasha.planet} – ${subP}`,
      periodText: `${String(sMonth).padStart(2, '0')}/${sYear} से ${String(eMonth).padStart(2, '0')}/${eYear}`,
      isCurrent: Boolean(isCurr),
    };
  });
}

export function getLagnaGemstoneAndRudraksha(report: SampurnKundaliReport): LagnaGemstoneRudrakshaInfo {
  const lagna = report.panchang.lagnaName.split(' ')[0];
  const lucky = report.lucky;

  const mapByLagna: Record<string, Partial<LagnaGemstoneRudrakshaInfo>> = {
    मेष: {
      jeevanRatna: 'मूंगा (Red Coral) — लग्नेश मंगल हेतु',
      bhagyaRatna: 'पुखराज (Yellow Sapphire) — भाग्येश गुरु हेतु',
      ishtaRatna: 'माणिक्य (Ruby) — पंचमेश सूर्य हेतु',
      avoidStones: 'नीलम, पन्ना एवं हीरा बिना परामर्श न पहनें',
      primaryRudraksha: '३ मुखी रुद्राक्ष (अग्नि देव स्वरूप — मंगल बलवर्धक)',
      secondaryRudraksha: '५ मुखी + १ मुखी रुद्राक्ष (गुरु एवं सूर्य कृपा हेतु)',
      rudrakshaMantra: 'ॐ क्लीं नमः ॥ ॐ अं अङ्गारकाय नमः ॥',
      rudrakshaBenefits: 'आत्मविश्वास, भूमि-भवन लाभ, रक्तचाप संतुलन एवं मंगल दोष शांति।',
    },
    वृषभ: {
      jeevanRatna: 'हीरा / ओपल (Diamond / White Fire Opal) — लग्नेश शुक्र हेतु',
      bhagyaRatna: 'नीलम (Blue Sapphire) — भाग्येश एवं कर्मेश शनि हेतु',
      ishtaRatna: 'पन्ना (Emerald) — पंचमेश बुध हेतु',
      avoidStones: 'पुखराज, मूंगा एवं मोती धारण न करें',
      primaryRudraksha: '६ मुखी रुद्राक्ष (भगवान कार्तिकेय एवं शुक्र कृपा हेतु)',
      secondaryRudraksha: '७ मुखी + ४ मुखी रुद्राक्ष (लक्ष्मी-शनि एवं बुध बल हेतु)',
      rudrakshaMantra: 'ॐ ह्रीं हुं नमः ॥ ॐ शुं शुक्राय नमः ॥',
      rudrakshaBenefits: 'वैवाहिक सुख, ऐश्वर्य, व्यापारिक उन्नति एवं कला/धन वृद्धि।',
    },
    मिथुन: {
      jeevanRatna: 'पन्ना (Natural Emerald) — लग्नेश बुध हेतु',
      bhagyaRatna: 'नीलम (Blue Sapphire) — भाग्येश शनि हेतु',
      ishtaRatna: 'हीरा / ओपल (Diamond / Opal) — पंचमेश शुक्र हेतु',
      avoidStones: 'मूंगा, माणिक्य एवं पुखराज से परहेज करें',
      primaryRudraksha: '४ मुखी रुद्राक्ष (ब्रह्मा देव स्वरूप — बुध प्रज्ञा वर्धक)',
      secondaryRudraksha: '६ मुखी + गणेश रुद्राक्ष (विद्या, वाणी एवं व्यापार सिद्धि)',
      rudrakshaMantra: 'ॐ ह्रीं नमः ॥ ॐ बुं बुधाय नमः ॥',
      rudrakshaBenefits: 'तीव्र बुद्धि, वाणी प्रभाव, व्यापारिक निर्णय क्षमता एवं नसों की मजबूती।',
    },
    कर्क: {
      jeevanRatna: 'सच्चा मोती (Natural South Sea Pearl) — लग्नेश चन्द्र हेतु',
      bhagyaRatna: 'पुखराज (Yellow Sapphire) — भाग्येश गुरु हेतु',
      ishtaRatna: 'मूंगा (Red Coral) — दशमेश/पंचमेश योगकारक मंगल हेतु',
      avoidStones: 'नीलम, हीरा एवं पन्ना धारण न करें',
      primaryRudraksha: '२ मुखी रुद्राक्ष (अर्धनारीश्वर स्वरूप — चन्द्र मानसिक शांति हेतु)',
      secondaryRudraksha: '३ मुखी + ५ मुखी रुद्राक्ष (योगकारक मंगल एवं गुरु बल हेतु)',
      rudrakshaMantra: 'ॐ नमः ॥ ॐ सों सोमाय नमः ॥',
      rudrakshaBenefits: 'मानसिक शांति, पारिवारिक सामंजस्य, राज्यकृपा एवं अचल संपत्ति लाभ।',
    },
    सिंह: {
      jeevanRatna: 'माणिक्य (Burmese Ruby) — लग्नेश सूर्य हेतु',
      bhagyaRatna: 'मूंगा (Red Coral) — भाग्येश व चतुर्थेश योगकारक मंगल हेतु',
      ishtaRatna: 'पुखराज (Yellow Sapphire) — पंचमेश गुरु हेतु',
      avoidStones: 'नीलम एवं हीरा कभी धारण न करें',
      primaryRudraksha: '१ मुखी अथवा १२ मुखी रुद्राक्ष (भगवान सूर्य एवं शिव तेज हेतु)',
      secondaryRudraksha: '३ मुखी + ५ मुखी रुद्राक्ष (मंगल-गुरु राजयोग बल हेतु)',
      rudrakshaMantra: 'ॐ ह्रीं नमः ॥ ॐ घृणि सूर्याय नमः ॥',
      rudrakshaBenefits: 'प्रशासनिक तेज, राजकीय सम्मान, उच्च पद प्राप्ति एवं हृदय/नेत्र बल।',
    },
    कन्या: {
      jeevanRatna: 'पन्ना (Emerald) — लग्नेश एवं कर्मेश बुध हेतु',
      bhagyaRatna: 'हीरा / ओपल (Diamond / Opal) — भाग्येश शुक्र हेतु',
      ishtaRatna: 'नीलम (Blue Sapphire) — पंचमेश शनि हेतु',
      avoidStones: 'मूंगा, मोती एवं माणिक्य धारण न करें',
      primaryRudraksha: '४ मुखी रुद्राक्ष (बुध-ब्रह्मा कृपा एवं बौद्धिक तेज हेतु)',
      secondaryRudraksha: '६ मुखी + ७ मुखी रुद्राक्ष (भाग्येश शुक्र एवं पंचमेश शनि हेतु)',
      rudrakshaMantra: 'ॐ ह्रीं नमः ॥ ॐ बुं बुधाय नमः ॥',
      rudrakshaBenefits: 'वाणिज्य-व्यापार में अपार लाभ, शिक्षा में श्रेष्ठता एवं धन संचय।',
    },
    तुला: {
      jeevanRatna: 'हीरा / सफेद पुखराज / ओपल — लग्नेश शुक्र हेतु',
      bhagyaRatna: 'पन्ना (Emerald) — भाग्येश बुध हेतु',
      ishtaRatna: 'नीलम (Blue Sapphire) — चतुर्थेश/पंचमेश योगकारक शनि हेतु',
      avoidStones: 'माणिक्य, मूंगा एवं पुखराज से परहेज करें',
      primaryRudraksha: '६ मुखी रुद्राक्ष (शुक्र एवं कार्तिकेय कृपा हेतु)',
      secondaryRudraksha: '७ मुखी + ४ मुखी रुद्राक्ष (योगकारक शनि एवं भाग्येश बुध हेतु)',
      rudrakshaMantra: 'ॐ ह्रीं हुं नमः ॥ ॐ शुं शुक्राय नमः ॥',
      rudrakshaBenefits: 'दाम्पत्य सुख, भौतिक वैभव, न्यायिक विजय एवं शनि-शुक्र राजयोग।',
    },
    वृश्चिक: {
      jeevanRatna: 'मूंगा (Red Coral) — लग्नेश मंगल हेतु',
      bhagyaRatna: 'सच्चा मोती (Natural Pearl) — भाग्येश चन्द्र हेतु',
      ishtaRatna: 'पुखराज (Yellow Sapphire) एवं माणिक्य (Ruby) — गुरु व सूर्य हेतु',
      avoidStones: 'पन्ना, हीरा एवं नीलम धारण न करें',
      primaryRudraksha: '३ मुखी रुद्राक्ष (मंगल तेज एवं साहस वृद्धि हेतु)',
      secondaryRudraksha: '२ मुखी + ५ मुखी रुद्राक्ष (भाग्येश चन्द्र एवं धनेश गुरु हेतु)',
      rudrakshaMantra: 'ॐ क्लीं नमः ॥ ॐ अं अङ्गारकाय नमः ॥',
      rudrakshaBenefits: 'शत्रु विजय, आकस्मिक धन लाभ, साहस एवं गूढ़ विद्या में सिद्धि।',
    },
    धनु: {
      jeevanRatna: 'पुखराज (Ceylon Yellow Sapphire) — लग्नेश गुरु हेतु',
      bhagyaRatna: 'माणिक्य (Ruby) — भाग्येश सूर्य हेतु',
      ishtaRatna: 'मूंगा (Red Coral) — पंचमेश मंगल हेतु',
      avoidStones: 'नीलम एवं हीरा धारण न करें',
      primaryRudraksha: '५ मुखी रुद्राक्ष (कालाग्नि रुद्र स्वरूप — बृहस्पति कृपा हेतु)',
      secondaryRudraksha: '१२ मुखी + ३ मुखी रुद्राक्ष (सूर्य एवं मंगल राजयोग बल हेतु)',
      rudrakshaMantra: 'ॐ ह्रीं नमः ॥ ॐ बृं बृहस्पतये नमः ॥',
      rudrakshaBenefits: 'आध्यात्मिक तेज, उच्च शिक्षा, राज्य सम्मान एवं संतान सुख।',
    },
    मकर: {
      jeevanRatna: 'नीलम (Ceylon Blue Sapphire) — लग्नेश शनि हेतु',
      bhagyaRatna: 'पन्ना (Emerald) — भाग्येश बुध हेतु',
      ishtaRatna: 'हीरा / ओपल (Diamond / Opal) — योगकारक शुक्र हेतु',
      avoidStones: 'मूंगा, मोती एवं माणिक्य धारण न करें',
      primaryRudraksha: '७ मुखी रुद्राक्ष (महालक्ष्मी एवं शनि कृपा हेतु)',
      secondaryRudraksha: '६ मुखी + ४ मुखी रुद्राक्ष (योगकारक शुक्र एवं भाग्येश बुध हेतु)',
      rudrakshaMantra: 'ॐ हुं नमः ॥ ॐ शं शनैश्चराय नमः ॥',
      rudrakshaBenefits: 'स्थायी संपत्ति, उद्योग-व्यापार में सफलता, शनि पीड़ा मुक्ति एवं दीर्घायु।',
    },
    कुंभ: {
      jeevanRatna: 'नीलम (Blue Sapphire) — लग्नेश शनि हेतु',
      bhagyaRatna: 'हीरा / ओपल (Diamond / Opal) — चतुर्थेश/भाग्येश योगकारक शुक्र हेतु',
      ishtaRatna: 'पन्ना (Emerald) — पंचमेश बुध हेतु',
      avoidStones: 'मूंगा, मोती एवं पुखराज बिना परामर्श न पहनें',
      primaryRudraksha: '७ मुखी रुद्राक्ष (लग्नेश शनि एवं सप्तमातृका कृपा हेतु)',
      secondaryRudraksha: '६ मुखी + ४ मुखी रुद्राक्ष (भाग्येश शुक्र एवं पंचमेश बुध हेतु)',
      rudrakshaMantra: 'ॐ हुं नमः ॥ ॐ शं शनैश्चराय नमः ॥',
      rudrakshaBenefits: 'नवाचार, शोध, राजयोग प्राप्ति, आर्थिक स्थिरता एवं मानसिक एकाग्रता।',
    },
    कुम्भ: {
      jeevanRatna: 'नीलम (Blue Sapphire) — लग्नेश शनि हेतु',
      bhagyaRatna: 'हीरा / ओपल (Diamond / Opal) — चतुर्थेश/भाग्येश योगकारक शुक्र हेतु',
      ishtaRatna: 'पन्ना (Emerald) — पंचमेश बुध हेतु',
      avoidStones: 'मूंगा, मोती एवं पुखराज बिना परामर्श न पहनें',
      primaryRudraksha: '७ मुखी रुद्राक्ष (लग्नेश शनि एवं सप्तमातृका कृपा हेतु)',
      secondaryRudraksha: '६ मुखी + ४ मुखी रुद्राक्ष (भाग्येश शुक्र एवं पंचमेश बुध हेतु)',
      rudrakshaMantra: 'ॐ हुं नमः ॥ ॐ शं शनैश्चराय नमः ॥',
      rudrakshaBenefits: 'नवाचार, शोध, राजयोग प्राप्ति, आर्थिक स्थिरता एवं मानसिक एकाग्रता।',
    },
    मीन: {
      jeevanRatna: 'पुखराज (Yellow Sapphire) — लग्नेश एवं कर्मेश गुरु हेतु',
      bhagyaRatna: 'मूंगा (Red Coral) — भाग्येश व धनेश मंगल हेतु',
      ishtaRatna: 'सच्चा मोती (Natural Pearl) — पंचमेश चन्द्र हेतु',
      avoidStones: 'पन्ना, हीरा एवं नीलम धारण न करें',
      primaryRudraksha: '५ मुखी रुद्राक्ष (देवगुरु बृहस्पति एवं शिव कृपा हेतु)',
      secondaryRudraksha: '३ मुखी + २ मुखी रुद्राक्ष (भाग्येश मंगल एवं पंचमेश चन्द्र हेतु)',
      rudrakshaMantra: 'ॐ ह्रीं नमः ॥ ॐ बृं बृहस्पतये नमः ॥',
      rudrakshaBenefits: 'सुख-शांति, ज्ञान-विज्ञान, प्रचुर धन-धान्य एवं आध्यात्मिक उन्नति।',
    },
  };

  const defaults = mapByLagna[lagna] || mapByLagna['मेष']!;
  return {
    jeevanRatna: defaults.jeevanRatna || lucky.ratnaName,
    bhagyaRatna: defaults.bhagyaRatna || 'पुखराज (Yellow Sapphire)',
    ishtaRatna: defaults.ishtaRatna || lucky.uparatnaName,
    uparatna: lucky.uparatnaName,
    weightRatti: '५.२५ से ६.२५ रत्ती (शरीर के वजन के १०वें भाग के अनुसार)',
    metalAndFinger: lucky.ratnaMetalAndFinger,
    wearingDayAndTime: `${lucky.luckyDays} को प्रातः शुक्ल पक्ष में सूर्योदय के १ घंटे के भीतर (शुभ होरा में)`,
    pranaPratishthaMantra: lucky.beejMantra,
    avoidStones: defaults.avoidStones || 'नीलम व गोमेद बिना कुंडली सूक्ष्म परीक्षण न पहनें',
    primaryRudraksha: defaults.primaryRudraksha || lucky.rudraksha,
    secondaryRudraksha: defaults.secondaryRudraksha || '३ मुखी + ७ मुखी रुद्राक्ष',
    rudrakshaMantra: defaults.rudrakshaMantra || 'ॐ नमः शिवाय ॥',
    rudrakshaBenefits: defaults.rudrakshaBenefits || 'नवग्रह संतुलन, आरोग्य एवं मानसिक शांति।',
  };
}

/**
 * Generates an inline SVG North Indian Diamond Kundali Chart using strict proportional scaling
 * (viewBox="0 0 100 100", width="100%", height="auto") and calibrated house centroids
 * so Rashi numbers and planet abbreviations stay strictly inside their house polygons.
 */
function buildNorthIndianChartSVG(
  houses: KundaliChartHouse[],
  title: string,
  subtitle: string,
  sizePx = 200
): string {
  // Calibrated 0..100 coordinate space centroids for all 12 North Indian Diamond houses
  // Side triangles (3, 5, 9, 11) and top/bottom triangles (2, 6, 8, 12) use safe inward coordinates
  // so planet abbreviations (सू, चं, मं, बु, गु, शु, श, रा, के) and rashi numbers never touch or cross borders
  const houseCoords: Record<
    number,
    {
      rashiX: number;
      rashiY: number;
      pX: number;
      pY: number;
      maxPerLine: number;
      isSideTriangle?: boolean;
      isOuterTriangle?: boolean;
    }
  > = {
    1: { rashiX: 50, rashiY: 42.2, pX: 50, pY: 26.0, maxPerLine: 2 },
    2: { rashiX: 25.75, rashiY: 19.8, pX: 25.75, pY: 10.2, maxPerLine: 2, isOuterTriangle: true },
    3: { rashiX: 19.6, rashiY: 25.75, pX: 11.2, pY: 25.75, maxPerLine: 1, isSideTriangle: true, isOuterTriangle: true },
    4: { rashiX: 42.2, rashiY: 50, pX: 25.0, pY: 50, maxPerLine: 2 },
    5: { rashiX: 19.6, rashiY: 74.25, pX: 11.2, pY: 74.25, maxPerLine: 1, isSideTriangle: true, isOuterTriangle: true },
    6: { rashiX: 25.75, rashiY: 80.2, pX: 25.75, pY: 89.8, maxPerLine: 2, isOuterTriangle: true },
    7: { rashiX: 50, rashiY: 57.8, pX: 50, pY: 74.0, maxPerLine: 2 },
    8: { rashiX: 74.25, rashiY: 80.2, pX: 74.25, pY: 89.8, maxPerLine: 2, isOuterTriangle: true },
    9: { rashiX: 80.4, rashiY: 74.25, pX: 88.8, pY: 74.25, maxPerLine: 1, isSideTriangle: true, isOuterTriangle: true },
    10: { rashiX: 57.8, rashiY: 50, pX: 75.0, pY: 50, maxPerLine: 2 },
    11: { rashiX: 80.4, rashiY: 25.75, pX: 88.8, pY: 25.75, maxPerLine: 1, isSideTriangle: true, isOuterTriangle: true },
    12: { rashiX: 74.25, rashiY: 19.8, pX: 74.25, pY: 10.2, maxPerLine: 2, isOuterTriangle: true },
  };

  let housesSvg = '';
  for (const h of houses) {
    const c = houseCoords[h.houseNumber];
    if (!c) continue;
    const rawPlanets = h.planets || [];
    const isCrowded = rawPlanets.length >= 3;
    const effectiveMaxPerLine = c.isSideTriangle ? (rawPlanets.length >= 4 ? 2 : 1) : isCrowded ? 3 : c.maxPerLine;

    const tokens = rawPlanets.map((p) =>
      c.isSideTriangle || isCrowded ? `${p.shortHindi || p.chartLabel}` : `${p.chartLabel || p.shortHindi}`
    );

    const lines: string[] = [];
    for (let i = 0; i < tokens.length; i += effectiveMaxPerLine) {
      lines.push(tokens.slice(i, i + effectiveMaxPerLine).join(' '));
    }

    housesSvg += `
      <text x="${c.rashiX}" y="${c.rashiY}" text-anchor="middle" dominant-baseline="central" fill="#fbbf24" font-size="3.1" font-weight="800" font-family="monospace">${h.rashiNumber}</text>
    `;

    lines.forEach((lineText, idx) => {
      const lineSpacing = c.isSideTriangle ? (lines.length >= 3 ? 2.5 : 2.9) : lines.length >= 3 ? 2.8 : 3.3;
      const yOffset = (idx - (lines.length - 1) / 2) * lineSpacing;
      const fontSize = c.isSideTriangle
        ? lines.length >= 3
          ? '2.15'
          : '2.5'
        : c.isOuterTriangle
        ? tokens.length >= 3
          ? '2.45'
          : '2.8'
        : tokens.length > 3
        ? '2.55'
        : '2.95';
      housesSvg += `
        <text x="${c.pX}" y="${(c.pY + yOffset).toFixed(2)}" text-anchor="middle" dominant-baseline="central" fill="${idx === 0 ? '#fef3c7' : '#fde68a'}" font-size="${fontSize}" font-weight="700">${escapeHtml(lineText)}</text>
      `;
    });
  }

  return `
    <div style="flex: 1; min-width: 0; background: #0f172a; border: 1.5px solid #d97706; border-radius: 10px; padding: 7px; text-align: center; box-sizing: border-box; overflow: hidden;">
      <div style="font-size: 11px; font-weight: 800; color: #fbbf24; margin-bottom: 2px; word-break: break-word; overflow-wrap: anywhere;">${escapeHtml(title)}</div>
      <div style="font-size: 9px; color: #cbd5e1; margin-bottom: 5px; word-break: break-word; overflow-wrap: anywhere;">${escapeHtml(subtitle)}</div>
      <div style="width: 100%; max-width: ${sizePx}px; aspect-ratio: 1 / 1; margin: 0 auto; overflow: hidden;">
        <svg viewBox="0 0 100 100" width="100%" height="auto" overflow="hidden" preserveAspectRatio="xMidYMid meet" style="display: block; width: 100%; height: auto; margin: 0 auto; background: #140d06; border: 1.5px solid #f59e0b; border-radius: 7px; overflow: hidden;">
          <rect x="1.5" y="1.5" width="97" height="97" fill="none" stroke="#d97706" stroke-width="0.75" />
          <rect x="3" y="3" width="94" height="94" fill="none" stroke="#f59e0b" stroke-opacity="0.22" stroke-width="0.3" />
          <line x1="1.5" y1="1.5" x2="98.5" y2="98.5" stroke="#d97706" stroke-width="0.55" />
          <line x1="98.5" y1="1.5" x2="1.5" y2="98.5" stroke="#d97706" stroke-width="0.55" />
          <polygon points="50,1.5 98.5,50 50,98.5 1.5,50" fill="none" stroke="#fbbf24" stroke-width="0.65" />
          <text x="50" y="51.2" text-anchor="middle" fill="#f59e0b" fill-opacity="0.13" font-size="5.6" font-weight="bold">ॐ</text>
          ${housesSvg}
        </svg>
      </div>
    </div>
  `;
}

function buildFormalVedicHeader(
  docTitle: string,
  subtitleBadge: string,
  personLabel: string,
  compact = false
): string {
  if (compact) {
    return `
      <div style="background: #140d06; border: 1.5px solid #f59e0b; border-radius: 9px; padding: 7px 12px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px; box-sizing: border-box; width: 100%;">
        <div style="min-width: 0; flex: 1;">
          <div style="font-size: 10px; font-weight: 800; color: #fbbf24;">॥ श्री गणेशाय नमः ॥ &bull; ${escapeHtml(BRAND_PDF_CONFIG.appName)}</div>
          <div style="font-size: 12.5px; font-weight: 900; color: #ffffff; word-break: break-word;">${escapeHtml(docTitle)}</div>
        </div>
        <div style="text-align: right; font-size: 9.2px; color: #fde68a; min-width: 0; max-width: 48%;">
          <div style="word-break: break-word;">${personLabel}</div>
          <div style="color: #cbd5e1;">आचार्य पण्डित शशांक शर्मा (रुद्रपुर) &bull; ${escapeHtml(BRAND_PDF_CONFIG.contactPhone)}</div>
        </div>
      </div>
    `;
  }

  return `
    <div style="background: linear-gradient(180deg, #1c1005 0%, #120b04 100%); border: 2px double #f59e0b; border-radius: 10px; padding: 9px 14px; margin-bottom: 8px; text-align: center; box-sizing: border-box; width: 100%;">
      <div style="font-size: 10.5px; font-weight: 800; color: #fbbf24; letter-spacing: 0.5px; margin-bottom: 2px;">
        ॥ ॐ श्री गणेशाय नमः ॥ &bull; ॥ श्री गुरुभ्यो नमः ॥ &bull; ${escapeHtml(BRAND_PDF_CONFIG.appName)}
      </div>
      <div style="display: inline-block; background: #78350f; border: 1px solid #f59e0b; color: #fef3c7; font-size: 9.5px; font-weight: 700; padding: 1.5px 10px; border-radius: 999px; margin-bottom: 3px;">
        ${escapeHtml(subtitleBadge)}
      </div>
      <div style="font-size: 17px; font-weight: 900; color: #ffffff; margin-bottom: 2px; word-break: break-word;">
        ${escapeHtml(docTitle)}
      </div>
      <div style="font-size: 11px; color: #fde68a; font-weight: 700; margin-bottom: 5px; word-break: break-word;">
        ${personLabel}
      </div>
      <div style="border-top: 1px solid #78350f; padding-top: 4px; font-size: 9.5px; color: #e2e8f0; line-height: 1.38;">
        <b style="color: #fbbf24;">${escapeHtml(BRAND_PDF_CONFIG.guideTitle)}</b> ${escapeHtml(BRAND_PDF_CONFIG.guideName)}<br/>
        <span style="color: #cbd5e1;">स्थान: ${escapeHtml(BRAND_PDF_CONFIG.guideAddress)} &bull; संपर्क/WhatsApp: <b style="color: #fde68a;">${escapeHtml(BRAND_PDF_CONFIG.contactPhone)}</b> &bull; ${escapeHtml(BRAND_PDF_CONFIG.website)}</span>
      </div>
    </div>
  `;
}

function buildPageFooter(pageNum: number, totalPages: number): string {
  return `
    <div style="margin-top: auto; padding-top: 6px; border-top: 1px solid #78350f; display: flex; align-items: center; justify-content: space-between; font-size: 9px; color: #cbd5e1; width: 100%; box-sizing: border-box;">
      <div>
        <b style="color: #fbbf24;">पण्डित जी ऑनलाइन</b> &bull; आचार्य पण्डित शशांक शर्मा (रुद्रपुर, उत्तराखण्ड) &bull; मो: ${escapeHtml(BRAND_PDF_CONFIG.contactPhone)}
      </div>
      <div style="color: #fde68a; font-weight: 700;">
        पृष्ठ ${pageNum} / ${totalPages}
      </div>
    </div>
  `;
}

function buildSectionHeading(title: string, badge?: string): string {
  return `
    <div style="background: linear-gradient(90deg, #451a03 0%, #1e1b4b 100%); border-left: 4px solid #f59e0b; border-top: 1px solid #78350f; border-right: 1px solid #78350f; border-bottom: 1px solid #78350f; padding: 4.5px 9px; font-size: 10.8px; font-weight: 800; color: #fde68a; margin-bottom: 5px; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; box-sizing: border-box;">
      <span style="min-width: 0; word-break: break-word;">${escapeHtml(title)}</span>
      ${badge ? `<span style="font-size: 9px; color: #fbbf24; background: #140d06; padding: 1px 7px; border-radius: 999px; border: 1px solid #d97706; white-space: nowrap; flex-shrink: 0;">${escapeHtml(badge)}</span>` : ''}
    </div>
  `;
}

/**
 * Wraps each report page in strict locked A4 dimensions:
 * Width: 794px (210mm at 96dpi), Height: 1123px (297mm at 96dpi), uniform 45px (~12mm) margin/padding
 */
function wrapA4Page(innerHtml: string, pageNum: number, totalPages: number): string {
  return `
    <div class="vedic-pdf-page" style="width: 794px; min-width: 794px; max-width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; background: #090d16; color: #f8fafc; padding: 44px; box-sizing: border-box; overflow: hidden; font-family: 'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif; display: flex; flex-direction: column;">
      <div class="vedic-pdf-frame" style="flex: 1; width: 100%; max-width: 100%; height: 100%; border: 2px double #d97706; border-radius: 10px; padding: 10px 12px; background: #0b1120; box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column;">
        <div class="vedic-pdf-body" style="flex: 1; width: 100%; max-width: 100%; box-sizing: border-box; overflow: hidden;">
          ${innerHtml}
        </div>
        ${buildPageFooter(pageNum, totalPages)}
      </div>
    </div>
  `;
}

async function renderDiscretePagesToPDF(pagesHtml: string[], filename: string): Promise<boolean> {
  const captureWidth = 794; // Locked A4 width (210mm at 96 DPI)
  const captureHeight = 1123; // Locked A4 height (297mm at 96 DPI)

  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.width = `${captureWidth}px`;
  host.style.minWidth = `${captureWidth}px`;
  host.style.maxWidth = `${captureWidth}px`;
  host.style.backgroundColor = '#090d16';
  host.style.zIndex = '-9999';
  host.style.overflow = 'hidden';

  const scopedA4Styles = `
    <style>
      @page {
        size: A4 portrait;
        margin: 0;
      }
      .vedic-pdf-page,
      .vedic-pdf-page * {
        box-sizing: border-box !important;
        max-width: 100%;
      }
      .vedic-pdf-page {
        width: ${captureWidth}px !important;
        min-width: ${captureWidth}px !important;
        max-width: ${captureWidth}px !important;
        height: ${captureHeight}px !important;
        min-height: ${captureHeight}px !important;
        max-height: ${captureHeight}px !important;
        padding: 44px !important;
        margin: 0 !important;
        background-color: #090d16 !important;
        color: #f8fafc !important;
        overflow: hidden !important;
      }
      .vedic-pdf-page table {
        width: 100% !important;
        max-width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
      }
      .vedic-pdf-page th,
      .vedic-pdf-page td {
        word-wrap: break-word !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        white-space: normal !important;
        vertical-align: top !important;
      }
      .vedic-pdf-page svg {
        width: 100% !important;
        height: auto !important;
        display: block !important;
        overflow: hidden !important;
      }
    </style>
  `;

  host.innerHTML =
    scopedA4Styles +
    pagesHtml
      .map((pageContent, idx) => wrapA4Page(pageContent, idx + 1, pagesHtml.length))
      .join('');

  document.body.appendChild(host);

  try {
    const pageElements = Array.from(host.querySelectorAll('.vedic-pdf-page')) as HTMLElement[];
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Ensure inner body fits strictly inside the A4 frame height without vertical or right-edge clipping
      const bodyEl = pageEl.querySelector('.vedic-pdf-body') as HTMLElement | null;
      if (bodyEl && bodyEl.scrollHeight > bodyEl.clientHeight && bodyEl.clientHeight > 0) {
        const fitRatio = Math.max(0.82, (bodyEl.clientHeight - 4) / bodyEl.scrollHeight);
        bodyEl.style.transformOrigin = 'top left';
        bodyEl.style.transform = `scale(${fitRatio.toFixed(4)})`;
        bodyEl.style.width = `${(100 / fitRatio).toFixed(2)}%`;
        bodyEl.style.maxWidth = `${(100 / fitRatio).toFixed(2)}%`;
      }

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#090d16',
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        width: captureWidth,
        height: captureHeight,
        windowWidth: captureWidth,
        windowHeight: captureHeight,
        onclone: (clonedDoc) => {
          const styles = Array.from(clonedDoc.querySelectorAll('style, link[rel="stylesheet"]'));
          styles.forEach((node) => {
            if (node.tagName.toLowerCase() === 'link') {
              node.remove();
            } else if (node.textContent) {
              node.textContent = node.textContent
                .replace(/oklch\([^)]+\)/gi, '#fbbf24')
                .replace(/oklab\([^)]+\)/gi, '#fbbf24')
                .replace(/color-mix\([^)]+\)/gi, '#0f172a');
            }
          });
        },
      });

      pdf.setFillColor(9, 13, 22);
      pdf.rect(0, 0, pageWidthMm, pageHeightMm, 'F');

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm);
    }

    document.body.removeChild(host);
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (err) {
    if (document.body.contains(host)) {
      document.body.removeChild(host);
    }
    console.error('Error rendering multi-page Vedic PDF:', err);
    return false;
  }
}

export async function downloadElementAsBrandedPDF(
  element: HTMLElement,
  filename: string,
  docTitle: string,
  personName: string
): Promise<boolean> {
  const pageHtml = `
    ${buildFormalVedicHeader(docTitle, 'वैदिक ज्योतिष प्रमाणित रिपोर्ट', `यजमान: ${escapeHtml(personName)}`)}
    <div style="padding: 12px; background: #0f172a; border: 1px solid #78350f; border-radius: 12px; width: 100%; box-sizing: border-box; overflow: hidden;">
      ${element.innerHTML}
    </div>
  `;
  return renderDiscretePagesToPDF([pageHtml], sanitizeFileName(filename));
}

/**
 * ============================================================================
 * 1. BHRUHAT SAMPURN JANAM KUNDALI 6-PAGE VEDIC PATRIKA PDF EXPORTER
 * ============================================================================
 */
export async function downloadJanmKundaliPDF(
  report: SampurnKundaliReport,
  elementId = 'janm-kundali-full-report-container'
): Promise<boolean> {
  void elementId;
  const p = report.panchang;
  const inp = report.input;
  const lucky = report.lucky;
  const bhavaRows = computeBhavaSphutTable(report);
  const shadbalaRows = computeShadbalaSummary(report.planets);
  const gemRudraksha = getLagnaGemstoneAndRudraksha(report);

  const personHeaderLabel = `यजमान: <b style="color:#ffffff;">${escapeHtml(inp.name)}</b> &bull; जन्म: ${escapeHtml(inp.formattedDob)} (${escapeHtml(inp.formattedTime)}) &bull; स्थान: ${escapeHtml(inp.birthPlace)}`;

  const avakahadaPairs = [
    ['यजमान का नाम', inp.name, 'जन्म दिनांक व वार', `${inp.formattedDob} (${p.vaar} • ${p.vaarLord})`],
    ['जन्म समय (IST)', inp.formattedTime, 'जन्म स्थान व निर्देशांक', `${inp.birthPlace} (${inp.latitude.toFixed(2)}°N, ${inp.longitude.toFixed(2)}°E)`],
    ['जन्म लग्न (Ascendant)', `${p.lagnaName} (${p.lagnaDegreeDMS})`, 'लग्नेश (Lagna Lord)', p.lagnaLord],
    ['चन्द्र राशि (Janma Rashi)', `${p.moonRashiName}`, 'राशि स्वामी (Rashi Lord)', p.moonRashiLord],
    ['सूर्य राशि (Sun Sign)', `${p.sunRashiName} (${p.sunRashiLord})`, 'अयानांश (Lahiri Chitra Paksha)', inp.ayanamsaDMS],
    ['जन्म नक्षत्र एवं चरण', `${p.nakshatraName} (चरण ${p.nakshatraPada})`, 'नक्षत्र स्वामी व नाम राशि', `${p.nakshatraLord} • ${p.naamRashi}`],
    ['तिथि एवं पक्ष', `${p.paksha} • ${p.tithi}`, 'योग एवं करण', `${p.yoga} योग • ${p.karana} करण`],
    ['वर्ण / वश्य / योनि', `${p.varna} / ${p.vashya} / ${p.yoni}`, 'गण / नाड़ी / तत्व', `${p.gana} गण / ${p.nadi} नाड़ी / ${p.tatva}`],
    ['पाया (Paya)', p.paya, 'इष्ट देव एवं भाग्यांक', `${lucky.ishtaDevta} • शुभ अंक: ${lucky.luckyNumbers}`],
  ];

  const avakahadaHtml = avakahadaPairs
    .map(
      (r, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#0f172a' : '#162033'};">
        <td style="padding: 5.5px 8px; border: 1px solid #78350f; color: #fbbf24; font-weight: 700; width: 22%; font-size: 9.8px; line-height: 1.4; word-break: break-word;">${escapeHtml(r[0])}</td>
        <td style="padding: 5.5px 8px; border: 1px solid #78350f; color: #f8fafc; font-weight: 600; width: 28%; font-size: 9.8px; line-height: 1.4; word-break: break-word;">${escapeHtml(r[1])}</td>
        <td style="padding: 5.5px 8px; border: 1px solid #78350f; color: #fbbf24; font-weight: 700; width: 22%; font-size: 9.8px; line-height: 1.4; word-break: break-word;">${escapeHtml(r[2])}</td>
        <td style="padding: 5.5px 8px; border: 1px solid #78350f; color: #f8fafc; font-weight: 600; width: 28%; font-size: 9.8px; line-height: 1.4; word-break: break-word;">${escapeHtml(r[3])}</td>
      </tr>
    `
    )
    .join('');

  // PAGE 1: Header + Avakahada Chakra + 3 Main Vedic Kundali Charts (D-1, Moon, D-9)
  const page1Html = `
    ${buildFormalVedicHeader(
      'बृहत् वैदिक जन्म कुंडली एवं ज्योतिष महा-पत्रिका',
      'दृक् गणित एवं लहिरी चित्रापक्ष अयानांश पर आधारित प्रामाणिक पत्रिका',
      personHeaderLabel
    )}

    ${buildSectionHeading('१. वैदिक जन्म पंचांग एवं अवकहड़ा चक्र (Birth Panchang & Avakahada Chakra)', 'पृष्ठ १ : मूल कुंडली चक्र')}
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 10px;">
      <tbody>${avakahadaHtml}</tbody>
    </table>

    ${buildSectionHeading('२. प्रमुख वैदिक कुंडली चक्र — लग्न (D-1), चन्द्र एवं नवमांश (D-9)', 'उत्तर भारतीय हीरक शैली')}
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 10px; width: 100%; box-sizing: border-box;">
      ${buildNorthIndianChartSVG(report.lagnaChart, 'लग्न कुंडली (D-1)', `लग्न: ${p.lagnaName} (${p.lagnaLord})`, 192)}
      ${buildNorthIndianChartSVG(report.chandraChart, 'चन्द्र कुंडली (राशि)', `राशि: ${p.moonRashiName} (${p.moonRashiLord})`, 192)}
      ${buildNorthIndianChartSVG(report.navamsaChart, 'नवमांश कुंडली (D-9)', 'सूक्ष्म ग्रह बल एवं विवाह चक्र', 192)}
    </div>

    <div style="background: #140d06; border: 1px solid #92400e; border-radius: 9px; padding: 8px 12px; font-size: 9.8px; color: #fde68a; line-height: 1.48; width: 100%; box-sizing: border-box;">
      <b>कुंडली संकेत सूत्र:</b> सू = सूर्य, चं = चन्द्र, मं = मंगल, बु = बुध, गु = गुरु, शु = शुक्र, श = शनि, रा = राहु, के = केतु &bull;
      <span style="color: #34d399;">* वक्री (Retrograde)</span> &bull; <span style="color: #fbbf24;">^ अस्त (Combust)</span> &bull;
      प्रथम भाव (शीर्ष मध्य हीरक) में स्थित राशि संख्या जन्म लग्न दर्शाती है।
    </div>
  `;

  // PAGE 2: Planetary Ephemeris (9 Planets) + 12 Bhava Sphut Table (Balanced 21 data rows total, zero vertical squeezing)
  const planetRowsHtml = report.planets
    .map(
      (pl, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#0f172a' : '#162033'};">
        <td style="padding: 5.5px 7px; border: 1px solid #78350f; color: #fbbf24; font-weight: 800; font-size: 9.8px; line-height: 1.4; width: 17%; word-break: break-word;">
          ${escapeHtml(pl.symbol)} ${escapeHtml(pl.hindiName)} ${pl.isRetrograde ? '<span style="color:#f59e0b;">(वक्री*)</span>' : ''} ${pl.isCombust ? '<span style="color:#fb7185;">(अस्त^)</span>' : ''}
        </td>
        <td style="padding: 5.5px 7px; border: 1px solid #78350f; color: #f8fafc; font-size: 9.8px; line-height: 1.4; width: 14%; word-break: break-word;">${escapeHtml(pl.rashiName)} (${pl.rashiNumber})</td>
        <td style="padding: 5.5px 7px; border: 1px solid #78350f; color: #fde68a; font-family: monospace; font-size: 9.8px; line-height: 1.4; width: 16%;">${escapeHtml(pl.fullDegreeDMS)}</td>
        <td style="padding: 5.5px 7px; border: 1px solid #78350f; color: #cbd5e1; font-size: 9.8px; line-height: 1.4; width: 11%; word-break: break-word;">${escapeHtml(pl.rashiLord)}</td>
        <td style="padding: 5.5px 7px; border: 1px solid #78350f; color: #34d399; font-weight: 700; text-align: center; font-size: 9.8px; line-height: 1.4; width: 9%;">भाव ${pl.houseInLagna}</td>
        <td style="padding: 5.5px 7px; border: 1px solid #78350f; color: #e2e8f0; font-size: 9.8px; line-height: 1.4; width: 18%; word-break: break-word;">${escapeHtml(pl.nakshatra)} (चरण ${pl.pada})</td>
        <td style="padding: 5.5px 7px; border: 1px solid #78350f; color: #fcd34d; font-weight: 700; font-size: 9.8px; line-height: 1.4; width: 15%; word-break: break-word;">${escapeHtml(pl.dignity)}</td>
      </tr>
    `
    )
    .join('');

  const bhavaRowsHtml = bhavaRows
    .map(
      (b, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#0f172a' : '#162033'};">
        <td style="padding: 5px 7px; border: 1px solid #78350f; color: #fbbf24; font-weight: 700; font-size: 9.5px; line-height: 1.38; width: 22%; word-break: break-word;">${escapeHtml(b.bhavaName)}</td>
        <td style="padding: 5px 7px; border: 1px solid #78350f; color: #f8fafc; font-size: 9.5px; line-height: 1.38; width: 14%; word-break: break-word;">${escapeHtml(b.rashiName)}</td>
        <td style="padding: 5px 7px; border: 1px solid #78350f; color: #cbd5e1; font-size: 9.5px; line-height: 1.38; width: 10%; word-break: break-word;">${escapeHtml(b.rashiLord)}</td>
        <td style="padding: 5px 7px; border: 1px solid #78350f; color: #34d399; font-family: monospace; font-size: 9.5px; line-height: 1.38; width: 15%;">${escapeHtml(b.madhyaDMS)}</td>
        <td style="padding: 5px 7px; border: 1px solid #78350f; color: #fde68a; font-family: monospace; font-size: 9.2px; line-height: 1.38; width: 22%;">${escapeHtml(b.sandhiStartDMS)} – ${escapeHtml(b.sandhiEndDMS)}</td>
        <td style="padding: 5px 7px; border: 1px solid #78350f; color: #e2e8f0; font-size: 9.5px; line-height: 1.38; width: 17%; word-break: break-word;">${escapeHtml(b.planets)}</td>
      </tr>
    `
    )
    .join('');

  const page2Html = `
    ${buildFormalVedicHeader('नवग्रह स्पष्ट सारणी एवं द्वादश भाव स्फुट (Graha & Bhava Sphut)', 'पृष्ठ २', personHeaderLabel, true)}

    ${buildSectionHeading('३. नवग्रह स्पष्ट सारणी (Sidereal Planetary Ephemeris — Lahiri Ayanamsa)', 'नवग्रह सूक्ष्म अंश')}
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 10px;">
      <thead>
        <tr style="background: #1e293b;">
          <th style="padding: 6px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.8px; text-align: left; width: 17%;">ग्रह (Planet)</th>
          <th style="padding: 6px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.8px; text-align: left; width: 14%;">राशि</th>
          <th style="padding: 6px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.8px; text-align: left; width: 16%;">स्पष्ट अंश (DMS)</th>
          <th style="padding: 6px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.8px; text-align: left; width: 11%;">राशि स्वामी</th>
          <th style="padding: 6px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.8px; text-align: center; width: 9%;">लग्न भाव</th>
          <th style="padding: 6px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.8px; text-align: left; width: 18%;">नक्षत्र (चरण)</th>
          <th style="padding: 6px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.8px; text-align: left; width: 15%;">दिग्बल / अवस्था</th>
        </tr>
      </thead>
      <tbody>${planetRowsHtml}</tbody>
    </table>

    ${buildSectionHeading('४. द्वादश भाव स्फुट एवं चलित भाव संधि (12 Sidereal Bhava Sphut & House Cusps)', 'श्रीपति भाव मध्य')}
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 8px;">
      <thead>
        <tr style="background: #1e293b;">
          <th style="padding: 5.5px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.5px; text-align: left; width: 22%;">भाव (House)</th>
          <th style="padding: 5.5px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.5px; text-align: left; width: 14%;">भाव राशि</th>
          <th style="padding: 5.5px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.5px; text-align: left; width: 10%;">भावेश</th>
          <th style="padding: 5.5px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.5px; text-align: left; width: 15%;">भाव मध्य (Midpoint)</th>
          <th style="padding: 5.5px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.5px; text-align: left; width: 22%;">भाव संधि (आरम्भ – अन्त)</th>
          <th style="padding: 5.5px 7px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.5px; text-align: left; width: 17%;">स्थित ग्रह</th>
        </tr>
      </thead>
      <tbody>${bhavaRowsHtml}</tbody>
    </table>

    <div style="background: #140d06; border: 1px solid #78350f; border-radius: 8px; padding: 7px 11px; font-size: 9.2px; color: #cbd5e1; line-height: 1.42; width: 100%; box-sizing: border-box;">
      <b style="color: #fbbf24;">ज्योतिषीय टिप्पणी:</b> उपर्युक्त नवग्रह स्पष्ट एवं द्वादश भाव स्फुट लहिरी चित्रापक्ष अयानांश (${escapeHtml(inp.ayanamsaDMS)}) तथा जन्म स्थान (${escapeHtml(inp.birthPlace)}) के अक्षांश-देशांतर पर आधारित हैं।
    </div>
  `;

  // PAGE 3: Shadbala Summary + 3 Key Divisional Charts (D-10, D-7, D-60) + Paired 16 Shodashavarga Summary
  const shadbalaRowsHtml = shadbalaRows
    .map(
      (s, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#0f172a' : '#162033'};">
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 800; font-size: 9.2px; width: 16%; word-break: break-word;">${escapeHtml(s.planet)} (${escapeHtml(s.englishName)})</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #e2e8f0; text-align: center; font-size: 9.2px; width: 9%;">${s.sthanaBala}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #e2e8f0; text-align: center; font-size: 9.2px; width: 9%;">${s.digBala}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #e2e8f0; text-align: center; font-size: 9.2px; width: 9%;">${s.cheshtaBala}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fde68a; font-weight: 800; text-align: center; font-size: 9.2px; width: 15%;">${escapeHtml(s.totalRupas)} (${s.strengthPct}%)</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: ${s.strengthPct >= 68 ? '#34d399' : '#fbbf24'}; font-weight: 700; font-size: 9.2px; width: 16%; word-break: break-word;">${escapeHtml(s.grade)}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #cbd5e1; font-size: 9px; width: 26%; word-break: break-word;">${escapeHtml(s.remedyHint)}</td>
      </tr>
    `
    )
    .join('');

  const vargaList = report.shodashavarga || [];
  const pairedVargaRows: string[] = [];
  const halfVarga = Math.ceil(vargaList.length / 2);
  for (let i = 0; i < halfVarga; i++) {
    const leftV = vargaList[i];
    const rightV = vargaList[i + halfVarga];
    pairedVargaRows.push(`
      <tr style="background: ${i % 2 === 0 ? '#0f172a' : '#162033'};">
        <td style="padding: 3.8px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 800; font-size: 9px; width: 18%; word-break: break-word;">
          ${leftV ? `${escapeHtml(leftV.id)} (${escapeHtml(leftV.sanskritName)})` : '—'}
        </td>
        <td style="padding: 3.8px 6px; border: 1px solid #78350f; color: #e2e8f0; font-size: 9px; width: 32%; word-break: break-word;">
          ${leftV ? `<b style="color:#34d399;">${escapeHtml(leftV.houses[0]?.rashiName || '—')}</b> • ${escapeHtml(leftV.signification)}` : '—'}
        </td>
        <td style="padding: 3.8px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 800; font-size: 9px; width: 18%; word-break: break-word;">
          ${rightV ? `${escapeHtml(rightV.id)} (${escapeHtml(rightV.sanskritName)})` : '—'}
        </td>
        <td style="padding: 3.8px 6px; border: 1px solid #78350f; color: #e2e8f0; font-size: 9px; width: 32%; word-break: break-word;">
          ${rightV ? `<b style="color:#34d399;">${escapeHtml(rightV.houses[0]?.rashiName || '—')}</b> • ${escapeHtml(rightV.signification)}` : '—'}
        </td>
      </tr>
    `);
  }

  const d10Chart = (report.shodashavarga || []).find((d) => d.id === 'D10')?.houses || report.lagnaChart;
  const d7Chart = (report.shodashavarga || []).find((d) => d.id === 'D7')?.houses || report.lagnaChart;
  const d60Chart = (report.shodashavarga || []).find((d) => d.id === 'D60')?.houses || report.lagnaChart;

  const page3Html = `
    ${buildFormalVedicHeader('ग्रह षड्बल एवं महर्षि पाराशर प्रोक्त षोडशवर्ग (१६ वर्ग कुंडली) विश्लेषण', 'पृष्ठ ३', personHeaderLabel, true)}

    ${buildSectionHeading('५. ग्रह षड्बल एवं रूप बल सारांश (Planetary Strengths — Shadbala Summary)', 'स्थान + दिग्बल + चेष्टा बल')}
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 7px;">
      <thead>
        <tr style="background: #1e293b;">
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 16%;">ग्रह</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: center; width: 9%;">स्थान बल</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: center; width: 9%;">दिग्बल</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: center; width: 9%;">चेष्टा बल</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: center; width: 15%;">कुल षड्बल (रूप)</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 16%;">बल श्रेणी</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 26%;">ज्योतिषीय परामर्श</th>
        </tr>
      </thead>
      <tbody>${shadbalaRowsHtml}</tbody>
    </table>

    ${buildSectionHeading('६. प्रमुख विशिष्ट वर्ग चक्र — दशमांश (D-10), सप्तमांश (D-7) एवं षष्ट्यंश (D-60)', 'सूक्ष्म कर्म व संतान चक्र')}
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 7px; width: 100%; box-sizing: border-box;">
      ${buildNorthIndianChartSVG(d10Chart, 'दशमांश कुंडली (D-10)', 'करियर, आजीविका व व्यापारिक पद', 168)}
      ${buildNorthIndianChartSVG(d7Chart, 'सप्तमांश कुंडली (D-7)', 'संतान सुख, वंश वृद्धि व भावी पीढ़ी', 168)}
      ${buildNorthIndianChartSVG(d60Chart, 'षष्ट्यंश कुंडली (D-60)', 'संचित पूर्वजन्म कर्म फल चक्र', 168)}
    </div>

    ${buildSectionHeading('७. षोडशवर्ग (16 Divisional Charts) लग्न एवं कारकत्व तालिका', '१६ वर्ग चक्र सारांश')}
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse;">
      <thead>
        <tr style="background: #1e293b;">
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 18%;">वर्ग चक्र</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 32%;">वर्ग लग्न राशि एवं फलित क्षेत्र</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 18%;">वर्ग चक्र</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 32%;">वर्ग लग्न राशि एवं फलित क्षेत्र</th>
        </tr>
      </thead>
      <tbody>${pairedVargaRows.join('')}</tbody>
    </table>
  `;

  // PAGE 4: Full-Width KP System (Krishnamurti Paddhati) & Ashtakavarga SAV Table
  const RASHI_NAMES_SHORT = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];

  const kpPlanetRowsHtml = (report.kpSystem?.planets || [])
    .map(
      (pl, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#0f172a' : '#162033'};">
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 800; font-size: 9.2px; width: 16%; word-break: break-word;">${escapeHtml(pl.symbol)} ${escapeHtml(pl.planet)}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fde68a; font-family: monospace; font-size: 9.2px; width: 18%;">${escapeHtml(pl.degreeDMS)}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #f8fafc; font-size: 9.2px; width: 14%; word-break: break-word;">${escapeHtml(pl.rashiName)}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #cbd5e1; font-size: 9.2px; width: 13%; word-break: break-word;">${escapeHtml(pl.signLord)}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #34d399; font-weight: 700; font-size: 9.2px; width: 13%; word-break: break-word;">${escapeHtml(pl.starLord)}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 800; font-size: 9.2px; width: 13%; word-break: break-word;">${escapeHtml(pl.subLord)}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #e2e8f0; font-size: 9.2px; width: 13%; word-break: break-word;">${escapeHtml(pl.subSubLord)}</td>
      </tr>
    `
    )
    .join('');

  const kpCusps = report.kpSystem?.cusps || [];
  const pairedKpCuspRows: string[] = [];
  for (let i = 0; i < 6; i++) {
    const c1 = kpCusps[i];
    const c2 = kpCusps[i + 6];
    pairedKpCuspRows.push(`
      <tr style="background: ${i % 2 === 0 ? '#0f172a' : '#162033'};">
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 800; font-size: 9.2px; width: 9%;">भाव ${c1?.houseNumber ?? i + 1}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fde68a; font-family: monospace; font-size: 9px; width: 15%;">${escapeHtml(c1?.cuspDegreeDMS || '—')}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #e2e8f0; font-size: 9px; width: 26%; word-break: break-word;">
          ${c1 ? `${escapeHtml(c1.rashiName)} (${escapeHtml(c1.signLord)}) • नक्षत्र: <b style="color:#34d399;">${escapeHtml(c1.starLord)}</b> • उप: <b style="color:#fbbf24;">${escapeHtml(c1.subLord)}</b>` : '—'}
        </td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 800; font-size: 9.2px; width: 9%;">भाव ${c2?.houseNumber ?? i + 7}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fde68a; font-family: monospace; font-size: 9px; width: 15%;">${escapeHtml(c2?.cuspDegreeDMS || '—')}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #e2e8f0; font-size: 9px; width: 26%; word-break: break-word;">
          ${c2 ? `${escapeHtml(c2.rashiName)} (${escapeHtml(c2.signLord)}) • नक्षत्र: <b style="color:#34d399;">${escapeHtml(c2.starLord)}</b> • उप: <b style="color:#fbbf24;">${escapeHtml(c2.subLord)}</b>` : '—'}
        </td>
      </tr>
    `);
  }

  const ashtakavargaHeaderHtml = Array.from(
    { length: 12 },
    (_, i) =>
      `<th style="padding: 4px 2px; border: 1px solid #78350f; color: #fbbf24; font-size: 8.6px; text-align: center; width: 6.8%;">${RASHI_NAMES_SHORT[i]}</th>`
  ).join('');

  const ashtakavargaBodyHtml = Object.keys(report.ashtakavarga?.planetBindus || {})
    .map(
      (key, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#0f172a' : '#162033'};">
        <td style="padding: 4px 5px; border: 1px solid #78350f; color: #fbbf24; font-weight: 800; font-size: 9px; width: 18.4%; word-break: break-word;">${escapeHtml(key)}</td>
        ${(report.ashtakavarga?.planetBindus[key] || [])
          .map(
            (v) =>
              `<td style="padding: 4px 2px; border: 1px solid #78350f; color: #f8fafc; font-weight: 700; font-size: 9px; text-align: center; width: 6.8%;">${v}</td>`
          )
          .join('')}
      </tr>
    `
    )
    .join('');

  const savRowHtml = (report.ashtakavarga?.sarvashtakavarga || [])
    .map(
      (v) =>
        `<td style="padding: 4.5px 2px; border: 1px solid #f59e0b; color: ${v >= 28 ? '#34d399' : '#fbbf24'}; font-weight: 900; font-size: 9.5px; text-align: center; width: 6.8%;">${v}</td>`
    )
    .join('');

  const page4Html = `
    ${buildFormalVedicHeader('कृष्णमूर्ति पद्धति (KP System) एवं अष्टकवर्ग बिन्दु विश्लेषण', 'पृष्ठ ४', personHeaderLabel, true)}

    ${buildSectionHeading('८. कृष्णमूर्ति पद्धति (KP System) — नवग्रह नक्षत्र एवं उपस्वामी (Planetary Sub-Lords)', `KP अयनांश: ${escapeHtml(report.kpSystem?.kpAyanamsa || '')}`)}
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 7px;">
      <thead>
        <tr style="background: #1e293b;">
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 16%;">ग्रह (Planet)</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 18%;">स्पष्ट अंश (DMS)</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 14%;">राशि</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 13%;">राशि स्वामी</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 13%;">नक्षत्र स्वामी</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 13%;">उपस्वामी (Sub)</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 13%;">उप-उपस्वामी</th>
        </tr>
      </thead>
      <tbody>${kpPlanetRowsHtml}</tbody>
    </table>

    ${buildSectionHeading('९. द्वादश भाव स्पंद एवं उपस्वामी (12 KP House Cusps & Sub-Lords)', 'Placidus House Cusps')}
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 7px;">
      <thead>
        <tr style="background: #1e293b;">
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 9%;">भाव १–६</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 15%;">आरम्भ अंश</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 26%;">राशि • नक्षत्र • उपस्वामी</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 9%;">भाव ७–१२</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 15%;">आरम्भ अंश</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 26%;">राशि • नक्षत्र • उपस्वामी</th>
        </tr>
      </thead>
      <tbody>${pairedKpCuspRows.join('')}</tbody>
    </table>

    ${buildSectionHeading('१०. पाराशरी अष्टकवर्ग एवं सर्वाष्टकवर्ग बिन्दु (Sarvashtakavarga SAV Score Table)', `कुल बिन्दु योग: ${report.ashtakavarga?.totalBindusSum || 337}`)}
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 6px;">
      <thead>
        <tr style="background: #1e293b;">
          <th style="padding: 4px 5px; border: 1px solid #78350f; color: #fbbf24; font-size: 8.8px; text-align: left; width: 18.4%;">ग्रह / राशि</th>
          ${ashtakavargaHeaderHtml}
        </tr>
      </thead>
      <tbody>
        ${ashtakavargaBodyHtml}
        <tr style="background: #451a03;">
          <td style="padding: 4.5px 5px; border: 1px solid #f59e0b; color: #fde68a; font-weight: 900; font-size: 9px; width: 18.4%;">सर्वाष्टकवर्ग (SAV)</td>
          ${savRowHtml}
        </tr>
      </tbody>
    </table>

    <div style="background: #0f172a; border: 1px solid #78350f; border-radius: 8px; padding: 6px 10px; font-size: 9px; color: #e2e8f0; line-height: 1.42; width: 100%; box-sizing: border-box;">
      <div><b style="color: #34d399;">&bull; सर्वाधिक शुभ शक्तिशाली राशियां (SAV &ge; 28):</b> ${escapeHtml(report.ashtakavarga?.strongestRashis.join(' • ') || '—')}</div>
      <div style="margin-top: 2px;"><b style="color: #fbbf24;">&bull; सावधानी एवं उपाय योग्य राशियां (SAV &lt; 28):</b> ${escapeHtml(report.ashtakavarga?.weakestRashis.join(' • ') || '—')}</div>
    </div>
  `;

  // PAGE 5: Vimshottari Mahadashas + Jaimini 7 Karakas + Paired Jaimini Char Dasha
  const currentDasha = report.mahadashas.find((d) => d.isCurrent) || report.mahadashas[0];

  const dashaRowsHtml = report.mahadashas
    .map(
      (d, idx) => `
      <tr style="background: ${d.isCurrent ? '#451a03' : idx % 2 === 0 ? '#0f172a' : '#162033'};">
        <td style="padding: 4.5px 6px; border: 1px solid #78350f; color: ${d.isCurrent ? '#fde68a' : '#fbbf24'}; font-weight: 800; font-size: 9.2px; width: 18%; word-break: break-word;">
          ${escapeHtml(d.planet)} महादशा ${d.isCurrent ? '<span style="background:#d97706;color:#fff;padding:1px 5px;border-radius:999px;font-size:7.8px;">सक्रिय</span>' : ''}
        </td>
        <td style="padding: 4.5px 6px; border: 1px solid #78350f; color: #f8fafc; font-size: 9.2px; text-align: center; width: 8%;">${d.years} वर्ष</td>
        <td style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fde68a; font-size: 9px; width: 22%; word-break: break-word;">${escapeHtml(d.startDateDisplay)} से ${escapeHtml(d.endDateDisplay)}</td>
        <td style="padding: 4.5px 6px; border: 1px solid #78350f; color: #34d399; font-weight: 700; font-size: 9px; width: 14%; word-break: break-word;">${escapeHtml(d.currentAntardasha || '—')}</td>
        <td style="padding: 4.5px 6px; border: 1px solid #78350f; color: #e2e8f0; font-size: 9px; line-height: 1.36; width: 38%; word-break: break-word;">${escapeHtml(d.prediction)}</td>
      </tr>
    `
    )
    .join('');

  const jaiminiKarakaRowsHtml = (report.jaimini?.karakas || [])
    .map(
      (k, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#0f172a' : '#162033'};">
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 800; font-size: 9.2px; width: 24%; word-break: break-word;">${escapeHtml(k.karakaCode)} — ${escapeHtml(k.karakaName)}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #f8fafc; font-weight: 700; font-size: 9.2px; width: 15%; word-break: break-word;">${escapeHtml(k.planetHindi)}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fde68a; font-family: monospace; font-size: 9.2px; width: 21%;">${escapeHtml(k.degreeInRashi)}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #cbd5e1; font-size: 9px; width: 40%; word-break: break-word;">${escapeHtml(k.signification)}</td>
      </tr>
    `
    )
    .join('');

  const charDashaList = report.jaimini?.charDasha || [];
  const pairedCharDashaRows: string[] = [];
  for (let i = 0; i < 6; i++) {
    const cd1 = charDashaList[i];
    const cd2 = charDashaList[i + 6];
    pairedCharDashaRows.push(`
      <tr style="background: ${i % 2 === 0 ? '#0f172a' : '#162033'};">
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: ${cd1?.isCurrent ? '#fde68a' : '#fbbf24'}; font-weight: 800; font-size: 9px; width: 18%; word-break: break-word;">
          ${cd1 ? `${escapeHtml(cd1.rashiName)} (${escapeHtml(cd1.rashiLord)})` : '—'}
        </td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #f8fafc; text-align: center; font-size: 9px; width: 8%;">${cd1 ? `${cd1.durationYears} व.` : '—'}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #34d399; font-weight: 700; font-size: 8.8px; width: 24%; word-break: break-word;">${escapeHtml(cd1?.periodDisplay || '—')}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: ${cd2?.isCurrent ? '#fde68a' : '#fbbf24'}; font-weight: 800; font-size: 9px; width: 18%; word-break: break-word;">
          ${cd2 ? `${escapeHtml(cd2.rashiName)} (${escapeHtml(cd2.rashiLord)})` : '—'}
        </td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #f8fafc; text-align: center; font-size: 9px; width: 8%;">${cd2 ? `${cd2.durationYears} व.` : '—'}</td>
        <td style="padding: 4px 6px; border: 1px solid #78350f; color: #34d399; font-weight: 700; font-size: 8.8px; width: 24%; word-break: break-word;">${escapeHtml(cd2?.periodDisplay || '—')}</td>
      </tr>
    `);
  }

  const page5Html = `
    ${buildFormalVedicHeader('विंशोत्तरी महादशा कालचक्र एवं जैमिनी कारक व चर दशा विश्लेषण', 'पृष्ठ ५', personHeaderLabel, true)}

    ${buildSectionHeading('११. विंशोत्तरी महादशा एवं अन्तर्दशा कालचक्र (१२० वर्षीय महादशा फल)', `वर्तमान: ${currentDasha?.planet || ''} महादशा`)}
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 7px;">
      <thead>
        <tr style="background: #1e293b;">
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 18%;">महादशा ग्रह</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: center; width: 8%;">अवधि</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 22%;">समय काल</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 14%;">सक्रिय अन्तर्दशा</th>
          <th style="padding: 4.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 38%;">जीवन पर प्रभाव एवं फलादेश</th>
        </tr>
      </thead>
      <tbody>${dashaRowsHtml}</tbody>
    </table>

    ${buildSectionHeading('१२. जैमिनी ७ चर कारक तालिका (Jaimini 7 Chara Karakas)', 'आत्मा से दारा कारक')}
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 7px;">
      <thead>
        <tr style="background: #1e293b;">
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 24%;">कारक (Karaka)</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 15%;">कारक ग्रह</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 21%;">अंश (Deg)</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9.2px; text-align: left; width: 40%;">जीवन फलित कारकत्व (Signification)</th>
        </tr>
      </thead>
      <tbody>${jaiminiKarakaRowsHtml}</tbody>
    </table>

    ${buildSectionHeading('१३. जैमिनी चर दशा अनुक्रम (Jaimini Char Dasha Sequence — 12 Rashis)', '१२ राशि चर दशा')}
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse;">
      <thead>
        <tr style="background: #1e293b;">
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 18%;">दशा राशि (स्वामी)</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: center; width: 8%;">अवधि</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 24%;">समय काल</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 18%;">दशा राशि (स्वामी)</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: center; width: 8%;">अवधि</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 9px; text-align: left; width: 24%;">समय काल</th>
        </tr>
      </thead>
      <tbody>${pairedCharDashaRows.join('')}</tbody>
    </table>
  `;

  // PAGE 6: Dosha Analysis + 5 Life Predictions + Authentic Lagna-Lord Gemstone & Rudraksha Recommendations + Signature Footer
  const predictionsList = [
    ['१. लग्नेश, राशि स्वामी एवं मानसिक-आध्यात्मिक स्थिति', `${report.predictions.personality.summary} (${report.predictions.personality.keyTraits.join(' • ')})`],
    ['२. करियर, आजीविका, व्यवसाय एवं भाग्योदय वर्ष', `${report.predictions.career.summary} (अनुकूल क्षेत्र: ${report.predictions.career.bestFields.join(', ')} • भाग्योदय: ${report.predictions.career.peakYears})`],
    ['३. धन-संपत्ति, भूमि-भवन एवं आर्थिक राजयोग', `${report.predictions.wealth.summary} (${report.predictions.wealth.highlights.join(' • ')})`],
    ['४. पारिवारिक सौख्य, विवाह एवं दांपत्य जीवन', `${report.predictions.marriage.summary} (जीवनसाथी स्वभाव: ${report.predictions.marriage.spouseNature})`],
    ['५. स्वास्थ्य, आयु बल एवं वैदिक सावधानी', `${report.predictions.health.summary} (सावधानी: ${report.predictions.health.careAreas.join(', ')})`],
  ];

  const predictionsHtml = predictionsList
    .map(
      (pr) => `
      <div style="background: #0f172a; border: 1px solid #78350f; border-radius: 7px; padding: 5.5px 9px; margin-bottom: 4.5px; width: 100%; box-sizing: border-box;">
        <div style="font-size: 10px; font-weight: 800; color: #fbbf24; margin-bottom: 1.5px;">${escapeHtml(pr[0])}</div>
        <div style="font-size: 9px; color: #e2e8f0; line-height: 1.38; word-break: break-word;">${escapeHtml(pr[1])}</div>
      </div>
    `
    )
    .join('');

  const page6Html = `
    ${buildFormalVedicHeader('दोष परिहार, पंच-स्तरीय भविष्यफल एवं रत्न-रुद्राक्ष विधान', 'पृष्ठ ६', personHeaderLabel, true)}

    ${buildSectionHeading('१४. मांगलिक, कालसर्प एवं साढ़ेसाती दोष परीक्षण व शास्त्रोक्त परिहार', 'दोष विचार')}
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 6px; width: 100%; box-sizing: border-box;">
      <div style="min-width: 0; background: #0f172a; border: 1px solid #78350f; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <div style="font-size: 9.5px; font-weight: 800; color: ${report.doshaAnalysis.manglik.isManglik ? '#fb7185' : '#34d399'}; margin-bottom: 2px;">
          &bull; मांगलिक विचार: ${escapeHtml(report.doshaAnalysis.manglik.severity)}
        </div>
        <div style="font-size: 8.8px; color: #e2e8f0; line-height: 1.35; word-break: break-word;">${escapeHtml(report.doshaAnalysis.manglik.explanation)}</div>
        <div style="font-size: 8.5px; color: #fde68a; margin-top: 2.5px; word-break: break-word;"><b>उपाय:</b> ${escapeHtml(report.doshaAnalysis.manglik.remedy)}</div>
      </div>
      <div style="min-width: 0; background: #0f172a; border: 1px solid #78350f; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <div style="font-size: 9.5px; font-weight: 800; color: ${report.doshaAnalysis.kaalSarp.isPresent ? '#fb7185' : '#34d399'}; margin-bottom: 2px;">
          &bull; कालसर्प योग: ${escapeHtml(report.doshaAnalysis.kaalSarp.type)}
        </div>
        <div style="font-size: 8.8px; color: #e2e8f0; line-height: 1.35; word-break: break-word;">${escapeHtml(report.doshaAnalysis.kaalSarp.explanation)}</div>
        <div style="font-size: 8.5px; color: #fde68a; margin-top: 2.5px; word-break: break-word;"><b>उपाय:</b> ${escapeHtml(report.doshaAnalysis.kaalSarp.remedy)}</div>
      </div>
      <div style="min-width: 0; background: #0f172a; border: 1px solid #78350f; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <div style="font-size: 9.5px; font-weight: 800; color: #fbbf24; margin-bottom: 2px;">
          &bull; शनि साढ़ेसाती: ${escapeHtml(report.doshaAnalysis.sadeSati.status)}
        </div>
        <div style="font-size: 8.8px; color: #e2e8f0; line-height: 1.35; word-break: break-word;">${escapeHtml(report.doshaAnalysis.sadeSati.explanation)}</div>
        <div style="font-size: 8.5px; color: #fde68a; margin-top: 2.5px; word-break: break-word;"><b>उपाय:</b> ${escapeHtml(report.doshaAnalysis.sadeSati.remedy)}</div>
      </div>
    </div>

    ${buildSectionHeading('१५. जीवन के ५ मुख्य स्तंभों का विस्तृत भविष्यफल (Comprehensive Life Predictions)', 'पाराशरी फलित')}
    <div style="margin-bottom: 6px; width: 100%; box-sizing: border-box;">
      ${predictionsHtml}
    </div>

    ${buildSectionHeading('१६. लग्नेश अनुसार प्रामाणिक वैदिक रत्न एवं रुद्राक्ष धारण विधान (Gemstone & Rudraksha)', `लग्न: ${p.lagnaName}`)}
    <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 6px;">
      <tbody>
        <tr style="background: #0f172a;">
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 700; width: 22%; font-size: 9px; word-break: break-word;">मुख्य जीवन रत्न (Lagna Stone)</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #34d399; font-weight: 800; width: 28%; font-size: 9px; word-break: break-word;">${escapeHtml(gemRudraksha.jeevanRatna)}</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 700; width: 22%; font-size: 9px; word-break: break-word;">भाग्य रत्न (Bhagya Stone)</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fde68a; font-weight: 700; width: 28%; font-size: 9px; word-break: break-word;">${escapeHtml(gemRudraksha.bhagyaRatna)}</td>
        </tr>
        <tr style="background: #162033;">
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 700; width: 22%; font-size: 9px; word-break: break-word;">इष्ट/पंचम रत्न व उपरत्न</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #f8fafc; width: 28%; font-size: 9px; word-break: break-word;">${escapeHtml(gemRudraksha.ishtaRatna)} (उपरत्न: ${escapeHtml(gemRudraksha.uparatna)})</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 700; width: 22%; font-size: 9px; word-break: break-word;">रत्न भार, धातु एवं अंगुली</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #f8fafc; width: 28%; font-size: 9px; word-break: break-word;">${escapeHtml(gemRudraksha.weightRatti)} • ${escapeHtml(gemRudraksha.metalAndFinger)}</td>
        </tr>
        <tr style="background: #0f172a;">
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 700; width: 22%; font-size: 9px; word-break: break-word;">धारण वार, मुहूर्त एवं मंत्र</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fde68a; width: 28%; font-size: 9px; word-break: break-word;">${escapeHtml(gemRudraksha.wearingDayAndTime)} • ${escapeHtml(gemRudraksha.pranaPratishthaMantra)}</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fb7185; font-weight: 700; width: 22%; font-size: 9px; word-break: break-word;">वर्जित रत्न (Avoid)</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fda4af; width: 28%; font-size: 9px; word-break: break-word;">${escapeHtml(gemRudraksha.avoidStones)}</td>
        </tr>
        <tr style="background: #162033;">
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 700; width: 22%; font-size: 9px; word-break: break-word;">शुभ वैदिक रुद्राक्ष कवच</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #34d399; font-weight: 700; width: 28%; font-size: 9px; word-break: break-word;">${escapeHtml(gemRudraksha.primaryRudraksha)} एवं ${escapeHtml(gemRudraksha.secondaryRudraksha)}</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 700; width: 22%; font-size: 9px; word-break: break-word;">रुद्राक्ष मंत्र व लाभ</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #e2e8f0; width: 28%; font-size: 9px; word-break: break-word;">${escapeHtml(gemRudraksha.rudrakshaMantra)} — ${escapeHtml(gemRudraksha.rudrakshaBenefits)}</td>
        </tr>
      </tbody>
    </table>

    <div style="background: linear-gradient(90deg, #1c1005 0%, #140d06 100%); border: 1.5px solid #d97706; border-radius: 9px; padding: 6px 10px; text-align: center; width: 100%; box-sizing: border-box;">
      <div style="font-size: 10.5px; font-weight: 800; color: #fbbf24; margin-bottom: 1.5px;">
        ${escapeHtml(BRAND_PDF_CONFIG.appName)} &bull; मुख्य ज्योतिषाचार्य: ${escapeHtml(BRAND_PDF_CONFIG.guideName)}
      </div>
      <div style="font-size: 8.8px; color: #e2e8f0;">
        व्यक्तिगत परामर्श, नवग्रह शांति अनुष्ठान, विवाह संस्कार एवं पूजा हेतु संपर्क करें: <b style="color: #fde68a;">${escapeHtml(BRAND_PDF_CONFIG.contactPhone)}</b> &bull; <b>${escapeHtml(BRAND_PDF_CONFIG.website)}</b>
      </div>
    </div>
  `;

  const cleanName = sanitizeFileName(inp.name);
  const filename = `Brihat_Janam_Kundali_${cleanName}_PanditJiOnline`;
  return renderDiscretePagesToPDF([page1Html, page2Html, page3Html, page4Html, page5Html, page6Html], filename);
}

/**
 * ============================================================================
 * 2. BHRUHAT 36 GUN MILAN 2-PAGE SHASTROKTA VIVAH PATRIKA PDF EXPORTER
 * ============================================================================
 */
export async function downloadKundaliMilanPDF(
  milanResult: KundaliMilanResult,
  elementId = 'kundali-milan-full-report-container'
): Promise<boolean> {
  void elementId;

  const coupleHeaderLabel = `वर: <b style="color:#ffffff;">${escapeHtml(milanResult.boyName)}</b> (${escapeHtml(milanResult.boyRashi)}) &nbsp;❤️&nbsp; वधू: <b style="color:#ffffff;">${escapeHtml(milanResult.girlName)}</b> (${escapeHtml(milanResult.girlRashi)})`;

  const kootRowsHtml = milanResult.koots
    .map((k, idx) => {
      const statusLabel =
        k.status === 'favorable' ? 'उत्तम' : k.status === 'moderate' ? 'मध्यम' : 'दोष / विचारणीय';
      const statusColor =
        k.status === 'favorable' ? '#34d399' : k.status === 'moderate' ? '#fbbf24' : '#fb7185';
      return `
        <tr style="background: ${idx % 2 === 0 ? '#0f172a' : '#162033'}; page-break-inside: avoid; break-inside: avoid;">
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 800; font-size: 9px; line-height: 1.35; width: 18%; word-break: break-word;">
            ${idx + 1}. ${escapeHtml(k.hindiName || k.name)}<br/>
            <span style="font-size: 7.8px; color: #94a3b8; font-weight: 500;">${escapeHtml(k.meaning)}</span>
          </td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #f8fafc; font-size: 9px; line-height: 1.35; width: 12%; word-break: break-word;">${escapeHtml(k.boyValue)}</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #f8fafc; font-size: 9px; line-height: 1.35; width: 12%; word-break: break-word;">${escapeHtml(k.girlValue)}</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #cbd5e1; text-align: center; font-weight: 700; font-size: 9px; line-height: 1.35; width: 8%;">${k.maxPoints}</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #fde68a; text-align: center; font-weight: 900; font-size: 9.8px; line-height: 1.35; width: 8%;">${k.obtainedPoints}</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: ${statusColor}; font-weight: 800; text-align: center; font-size: 8.5px; line-height: 1.35; width: 12%; word-break: break-word;">${escapeHtml(statusLabel)}</td>
          <td style="padding: 4px 6px; border: 1px solid #78350f; color: #e2e8f0; font-size: 8.6px; line-height: 1.35; width: 30%; word-break: break-word;">${escapeHtml(k.verdict)}</td>
        </tr>
      `;
    })
    .join('');

  const chartsHtml =
    milanResult.boyKundali && milanResult.girlKundali
      ? `
      ${buildSectionHeading('३. वर एवं वधू की जन्म लग्न कुंडली चक्र (Groom & Bride Ascendant Charts - D1)', 'उत्तर भारतीय वैदिक चक्र')}
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 4px; width: 100%; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid;">
        ${buildNorthIndianChartSVG(
          milanResult.boyKundali.lagnaChart,
          `वर लग्न कुंडली: ${milanResult.boyName}`,
          `लग्न: ${milanResult.boyLagna} • राशि: ${milanResult.boyRashi} • ${milanResult.boyNakshatra} (चरण ${milanResult.boyPada})`,
          152
        )}
        ${buildNorthIndianChartSVG(
          milanResult.girlKundali.lagnaChart,
          `वधू लग्न कुंडली: ${milanResult.girlName}`,
          `लग्न: ${milanResult.girlLagna} • राशि: ${milanResult.girlRashi} • ${milanResult.girlNakshatra} (चरण ${milanResult.girlPada})`,
          152
        )}
      </div>
    `
      : '';

  // PAGE 1: Header + Score Banner + Groom/Bride Details + 8 Koot Table + Lagna Charts
  const page1Html = `
    ${buildFormalVedicHeader(
      'शास्त्रोक्त अष्टकूट ३६ गुण मिलान एवं विवाह मेलापक महा-पत्रिका',
      'दृक् गणित एवं बृहत् पाराशर होरा शास्त्र पर आधारित प्रामाणिक मिलान रिपोर्ट',
      coupleHeaderLabel
    )}

    <div style="background: linear-gradient(90deg, #451a03 0%, #1c1917 50%, #451a03 100%); border: 1.5px solid #f59e0b; border-radius: 9px; padding: 6px 12px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid;">
      <div style="min-width: 0; flex: 1;">
        <div style="font-size: 9px; color: #fbbf24; font-weight: 800;">अष्टकूट गुण मिलान सर्वोच्च निर्णय (Overall Compatibility Verdict)</div>
        <div style="font-size: 13px; font-weight: 900; color: #ffffff; margin-top: 1px; word-break: break-word;">
          ${escapeHtml(milanResult.overallVerdict)} &bull; <span style="color: #34d399;">(${milanResult.compatibilityPercentage}% अनुकूलता)</span>
        </div>
        <div style="font-size: 8.6px; color: #fde68a; margin-top: 1px;">
          मांगलिक मिलान निर्णय: <b>${milanResult.manglikStatus.manglikMatch ? 'पूर्ण अनुकूल / परिहार मान्य (Compatible)' : 'विशेष मंगल शांति उपाय अपेक्षित'}</b>
        </div>
      </div>
      <div style="background: #140d06; border: 1.5px solid #fbbf24; border-radius: 8px; padding: 5px 10px; text-align: center; flex-shrink: 0;">
        <div style="font-size: 16.5px; font-weight: 900; color: #fbbf24;">${milanResult.totalScore} / 36</div>
        <div style="font-size: 8px; color: #fef3c7; font-weight: 700;">प्राप्त अष्टकूट गुण</div>
      </div>
    </div>

    ${buildSectionHeading('१. वर एवं वधू का जन्म पंचांग व ज्योतिषीय विवरण (Groom & Bride Astrological Details)', 'द्विपक्षीय विवरण')}
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 6px; width: 100%; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid;">
      <div style="min-width: 0; background: #0f172a; border: 1px solid #d97706; border-radius: 8px; padding: 6px 9px; box-sizing: border-box;">
        <div style="font-size: 9.8px; font-weight: 800; color: #fbbf24; border-bottom: 1px solid #78350f; padding-bottom: 2px; margin-bottom: 3px; word-break: break-word;">
          🤵 वर (Groom): ${escapeHtml(milanResult.boyName)}
        </div>
        <div style="font-size: 8.5px; color: #e2e8f0; line-height: 1.38; word-break: break-word;">
          ${milanResult.boyDob ? `<b>जन्म:</b> ${escapeHtml(milanResult.boyDob)} • ${escapeHtml(milanResult.boyTime || '')} (${escapeHtml(milanResult.boyPlace || 'रुद्रपुर')})<br/>` : ''}
          <b>लग्न व राशि:</b> ${escapeHtml(milanResult.boyLagna)} लग्न • ${escapeHtml(milanResult.boyRashi)} (${escapeHtml(milanResult.boyRashiLord)})<br/>
          <b>नक्षत्र व चरण:</b> ${escapeHtml(milanResult.boyNakshatra)} (चरण ${milanResult.boyPada})<br/>
          <b>मांगलिक:</b> <span style="color:${milanResult.manglikStatus.boyManglik ? '#fb7185' : '#34d399'};font-weight:700;">${escapeHtml(milanResult.manglikStatus.boySeverity)} (लग्न ${milanResult.manglikStatus.boyMarsHouseLagna}, चन्द्र ${milanResult.manglikStatus.boyMarsHouseMoon})</span>
        </div>
      </div>
      <div style="min-width: 0; background: #0f172a; border: 1px solid #d97706; border-radius: 8px; padding: 6px 9px; box-sizing: border-box;">
        <div style="font-size: 9.8px; font-weight: 800; color: #fbbf24; border-bottom: 1px solid #78350f; padding-bottom: 2px; margin-bottom: 3px; word-break: break-word;">
          👰 वधू (Bride): ${escapeHtml(milanResult.girlName)}
        </div>
        <div style="font-size: 8.5px; color: #e2e8f0; line-height: 1.38; word-break: break-word;">
          ${milanResult.girlDob ? `<b>जन्म:</b> ${escapeHtml(milanResult.girlDob)} • ${escapeHtml(milanResult.girlTime || '')} (${escapeHtml(milanResult.girlPlace || 'रुद्रपुर')})<br/>` : ''}
          <b>लग्न व राशि:</b> ${escapeHtml(milanResult.girlLagna)} लग्न • ${escapeHtml(milanResult.girlRashi)} (${escapeHtml(milanResult.girlRashiLord)})<br/>
          <b>नक्षत्र व चरण:</b> ${escapeHtml(milanResult.girlNakshatra)} (चरण ${milanResult.girlPada})<br/>
          <b>मांगलिक:</b> <span style="color:${milanResult.manglikStatus.girlManglik ? '#fb7185' : '#34d399'};font-weight:700;">${escapeHtml(milanResult.manglikStatus.girlSeverity)} (लग्न ${milanResult.manglikStatus.girlMarsHouseLagna}, चन्द्र ${milanResult.manglikStatus.girlMarsHouseMoon})</span>
        </div>
      </div>
    </div>

    ${buildSectionHeading('२. अष्टकूट (८ कूट) विस्तृत ३६ गुण मिलान सारणी (Detailed Ashtakoot Score Table)', `${milanResult.totalScore} / 36 गुण`)}
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; table-layout: fixed; page-break-inside: avoid; break-inside: avoid;">
      <thead>
        <tr style="background: #1e293b;">
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 8.6px; text-align: left; width: 18%;">कूट एवं क्षेत्र</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 8.6px; text-align: left; width: 12%;">वर</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 8.6px; text-align: left; width: 12%;">वधू</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 8.6px; text-align: center; width: 8%;">अधिकतम</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 8.6px; text-align: center; width: 8%;">प्राप्त</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 8.6px; text-align: center; width: 12%;">स्थिति</th>
          <th style="padding: 4px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 8.6px; text-align: left; width: 30%;">शास्त्रोक्त फल</th>
        </tr>
      </thead>
      <tbody>
        ${kootRowsHtml}
        <tr style="background: #451a03;">
          <td colspan="3" style="padding: 4px 6px; border: 1px solid #f59e0b; color: #fde68a; font-weight: 800; font-size: 9px; text-align: right;">कुल अष्टकूट गुण मिलान योग (Total Score):</td>
          <td style="padding: 4px 6px; border: 1px solid #f59e0b; color: #ffffff; font-weight: 800; font-size: 9px; text-align: center;">36</td>
          <td style="padding: 4px 6px; border: 1px solid #f59e0b; color: #fbbf24; font-weight: 900; font-size: 10px; text-align: center;">${milanResult.totalScore}</td>
          <td colspan="2" style="padding: 4px 6px; border: 1px solid #f59e0b; color: #34d399; font-weight: 800; font-size: 9px; word-break: break-word;">${escapeHtml(milanResult.overallVerdict)} (${milanResult.compatibilityPercentage}%)</td>
        </tr>
      </tbody>
    </table>

    ${chartsHtml}
  `;

  // PAGE 2: Deep Gana, Bhakoot, Nadi Analysis + Explicit Shastrokta Parihar + Manglik Cancellation Summary + Remedies
  const ganaKoot = milanResult.koots.find((k) => k.hindiName.includes('गण') || k.name.includes('Gana')) || milanResult.koots[5];
  const bhakootKoot = milanResult.koots.find((k) => k.hindiName.includes('भकूट') || k.name.includes('Bhakoot')) || milanResult.koots[6];
  const nadiKoot = milanResult.koots.find((k) => k.hindiName.includes('नाड़ी') || k.name.includes('Nadi')) || milanResult.koots[7];
  const maitriKoot = milanResult.koots.find((k) => k.hindiName.includes('मैत्री') || k.name.includes('Maitri')) || milanResult.koots[4];

  const hasNadiDosha = (nadiKoot?.obtainedPoints ?? 8) === 0;
  const hasBhakootDosha = (bhakootKoot?.obtainedPoints ?? 7) === 0;
  const hasGanaDosha = (ganaKoot?.obtainedPoints ?? 6) === 0;

  const sameRashiDiffNakshatra =
    milanResult.boyRashi === milanResult.girlRashi &&
    milanResult.boyNakshatra !== milanResult.girlNakshatra;
  const sameNakshatraDiffPada =
    milanResult.boyNakshatra === milanResult.girlNakshatra &&
    milanResult.boyPada !== milanResult.girlPada;
  const friendlyRashiLords =
    milanResult.boyRashiLord === milanResult.girlRashiLord ||
    (maitriKoot?.obtainedPoints ?? 0) >= 4;

  const doshaRemediesList = milanResult.koots
    .filter((k) => k.remedy)
    .map((k) => `${k.hindiName}: ${k.remedy}`);
  if (doshaRemediesList.length === 0) {
    doshaRemediesList.push(
      'विवाह से पूर्व भगवान श्री लक्ष्मीनारायण एवं गौरी-शंकर का अभिषेक पूजन करें।',
      'वैवाहिक सुख एवं अखंड सौभाग्य हेतु विवाह समय शुद्ध लग्न शुद्धि अवश्य कराएं।'
    );
  }

  const planetComparisonHtml =
    milanResult.boyKundali && milanResult.girlKundali
      ? `
      ${buildSectionHeading('८. वर एवं वधू नवग्रह स्पष्ट तुलना सारणी (9 Planets Sidereal Comparison)', 'नवग्रह समन्वय')}
      <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 6px;">
        <thead>
          <tr style="background: #1e293b;">
            <th style="padding: 3.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 8.6px; text-align: left; width: 16%;">ग्रह (Planet)</th>
            <th style="padding: 3.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 8.6px; text-align: left; width: 42%;">वर (${escapeHtml(milanResult.boyName)}) — राशि, अंश, भाव व नक्षत्र</th>
            <th style="padding: 3.5px 6px; border: 1px solid #78350f; color: #fbbf24; font-size: 8.6px; text-align: left; width: 42%;">वधू (${escapeHtml(milanResult.girlName)}) — राशि, अंश, भाव व नक्षत्र</th>
          </tr>
        </thead>
        <tbody>
          ${milanResult.boyKundali.planets
            .map((bp, idx) => {
              const gp = milanResult.girlKundali?.planets[idx];
              return `
                <tr style="background: ${idx % 2 === 0 ? '#0f172a' : '#162033'};">
                  <td style="padding: 3.2px 6px; border: 1px solid #78350f; color: #fbbf24; font-weight: 800; font-size: 8.5px; width: 16%; word-break: break-word;">${escapeHtml(bp.symbol)} ${escapeHtml(bp.hindiName)}</td>
                  <td style="padding: 3.2px 6px; border: 1px solid #78350f; color: #f8fafc; font-size: 8.5px; width: 42%; word-break: break-word;"><b>${escapeHtml(bp.rashiName.split(' ')[0])}</b> (${escapeHtml(bp.fullDegreeDMS)}) • भाव ${bp.houseInLagna} • ${escapeHtml(bp.nakshatra.split(' ')[0])} (च.${bp.pada})</td>
                  <td style="padding: 3.2px 6px; border: 1px solid #78350f; color: #fde68a; font-size: 8.5px; width: 42%; word-break: break-word;">${gp ? `<b>${escapeHtml(gp.rashiName.split(' ')[0])}</b> (${escapeHtml(gp.fullDegreeDMS)}) • भाव ${gp.houseInLagna} • ${escapeHtml(gp.nakshatra.split(' ')[0])} (च.${gp.pada})` : '—'}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    `
      : '';

  const page2Html = `
    ${buildFormalVedicHeader('गण, भकूट, नाड़ी एवं मांगलिक दोष का शास्त्रोक्त परिहार विश्लेषण', 'पृष्ठ २', coupleHeaderLabel, true)}

    ${buildSectionHeading('४. गण कूट गहन विश्लेषण एवं स्वभाव सामंजस्य (Detailed Gana Analysis — 6 Points)', `प्राप्त: ${ganaKoot?.obtainedPoints ?? 0} / 6 गुण`)}
    <div style="background: #0f172a; border: 1px solid #78350f; border-radius: 8px; padding: 5.5px 9px; margin-bottom: 6px; font-size: 8.8px; color: #e2e8f0; line-height: 1.38; width: 100%; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid;">
      <div><b style="color: #fbbf24;">&bull; वर गण:</b> ${escapeHtml(ganaKoot?.boyValue)} &nbsp;|&nbsp; <b style="color: #fbbf24;">वधू गण:</b> ${escapeHtml(ganaKoot?.girlValue)} &nbsp;|&nbsp; <b style="color: ${hasGanaDosha ? '#fb7185' : '#34d399'};">स्थिति: ${hasGanaDosha ? 'गण दोष विचारणीय' : 'शुभ एवं अनुकूल गण समन्वय'}</b></div>
      <div style="margin-top: 2px; word-break: break-word;">${escapeHtml(ganaKoot?.verdict)}</div>
      <div style="margin-top: 2px; color: #fde68a; word-break: break-word;">
        <b>शास्त्रोक्त गण परिहार नियम:</b> महर्षि पाराशर एवं मुहूर्त चिंतामणि के अनुसार यदि वर एवं वधू के राशि स्वामियों में परस्पर मित्रता हो (प्राप्त ग्रह मैत्री: ${maitriKoot?.obtainedPoints ?? 0}/5) अथवा तारा व भकूट शुद्ध हों, तो गण दोष स्वतः निष्प्रभावी हो जाता है।
      </div>
    </div>

    ${buildSectionHeading('५. भकूट कूट गहन विश्लेषण एवं पारिवारिक समृद्धि विचार (Detailed Bhakoot Analysis — 7 Points)', `प्राप्त: ${bhakootKoot?.obtainedPoints ?? 0} / 7 गुण`)}
    <div style="background: #0f172a; border: 1px solid #78350f; border-radius: 8px; padding: 5.5px 9px; margin-bottom: 6px; font-size: 8.8px; color: #e2e8f0; line-height: 1.38; width: 100%; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid;">
      <div><b style="color: #fbbf24;">&bull; वर राशि:</b> ${escapeHtml(milanResult.boyRashi)} (स्वामी: ${escapeHtml(milanResult.boyRashiLord)}) &nbsp;|&nbsp; <b style="color: #fbbf24;">वधू राशि:</b> ${escapeHtml(milanResult.girlRashi)} (स्वामी: ${escapeHtml(milanResult.girlRashiLord)})</div>
      <div style="margin-top: 2px; word-break: break-word;">${escapeHtml(bhakootKoot?.verdict)}</div>
      <div style="margin-top: 2px; color: ${hasBhakootDosha ? '#fde68a' : '#34d399'}; word-break: break-word;">
        <b>शास्त्रोक्त भकूट परिहार निर्णय:</b> ${
          !hasBhakootDosha
            ? 'वर एवं वधू की राशियों के मध्य शुभ भकूट योग (7/7 गुण) निर्मित हो रहा है, जो दाम्पत्य जीवन में अखंड लक्ष्मी, भाग्योदय एवं संतान सुख प्रदान करेगा।'
            : friendlyRashiLords
              ? `यद्यपि राशियों में षडाष्टक/द्विर्द्वादश/नवपंचम भकूट अंतर है, किंतु दोनों के राशि स्वामी (${milanResult.boyRashiLord} एवं ${milanResult.girlRashiLord}) एक ही हैं या परस्पर मित्र हैं — अतः शास्त्रोक्त नियमानुसार भकूट दोष का पूर्ण परिहार मान्य है।`
              : 'भकूट दोष के पूर्ण निवारण हेतु विवाह पूर्व भगवान लक्ष्मीनारायण पूजन एवं दोनों राशि स्वामियों के मंत्र जप का विधान करें।'
        }
      </div>
    </div>

    ${buildSectionHeading('६. नाड़ी कूट गहन विश्लेषण एवं नाड़ी दोष शास्त्रोक्त परिहार (Detailed Nadi Analysis — 8 Points)', `प्राप्त: ${nadiKoot?.obtainedPoints ?? 0} / 8 गुण`)}
    <div style="background: #0f172a; border: 1px solid #78350f; border-radius: 8px; padding: 5.5px 9px; margin-bottom: 6px; font-size: 8.8px; color: #e2e8f0; line-height: 1.38; width: 100%; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid;">
      <div><b style="color: #fbbf24;">&bull; वर नाड़ी:</b> ${escapeHtml(nadiKoot?.boyValue)} &nbsp;|&nbsp; <b style="color: #fbbf24;">वधू नाड़ी:</b> ${escapeHtml(nadiKoot?.girlValue)} &nbsp;|&nbsp; <b style="color: ${hasNadiDosha ? '#fb7185' : '#34d399'};">${hasNadiDosha ? 'एक नाड़ी (नाड़ी दोष परीक्षणीय)' : 'भिन्न नाड़ी — सर्वोच्च ८/८ गुण शुभ'}</b></div>
      <div style="margin-top: 2px; word-break: break-word;">${escapeHtml(nadiKoot?.verdict)}</div>
      <div style="margin-top: 2px; color: #fde68a; word-break: break-word;">
        <b>शास्त्रोक्त नाड़ी परिहार सूत्र (“एकराशिः पृथक् तारा, एकतारा पृथग्गृहम्”):</b>
        ${
          !hasNadiDosha
            ? 'वर एवं वधू की नाड़ी भिन्न होने से ८ में से पूरे ८ गुण प्राप्त हुए हैं। यह स्वास्थ्य, दीर्घायु एवं उत्तम संतान योग के लिए सर्वश्रेष्ठ है।'
            : sameRashiDiffNakshatra
              ? 'वर और वधू की चन्द्र राशि एक ही है किंतु जन्म नक्षत्र भिन्न हैं — अतः शास्त्र वचन से नाड़ी दोष पूर्णतः निरस्त (Cancelled) माना जाता है।'
              : sameNakshatraDiffPada
                ? 'वर और वधू का जन्म नक्षत्र एक है किंतु चरण (Pada) भिन्न हैं — अतः शास्त्रोक्त नाड़ी दोष परिहार मान्य है।'
                : 'एक नाड़ी होने के कारण विवाह पूर्व स्वर्ण-नाड़ी दान, गोदान, अन्नदान एवं महामृत्युंजय मंत्र जाप कराना अनिवार्य एवं परम कल्याणकारी है।'
        }
      </div>
    </div>

    ${buildSectionHeading('७. मांगलिक दोष तीव्रता, ग्रह मैत्री एवं शास्त्रोक्त वैवाहिक उपाय', milanResult.manglikStatus.manglikMatch ? 'मांगलिक समन्वय शुभ' : 'मंगल शांति उपाय आवश्यक')}
    <div style="background: #0f172a; border: 1px solid #78350f; border-radius: 8px; padding: 5.5px 9px; margin-bottom: 6px; font-size: 8.8px; color: #e2e8f0; line-height: 1.38; width: 100%; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; gap: 8px; margin-bottom: 2px; flex-wrap: wrap;">
        <span><b style="color: #fbbf24;">वर मांगलिक:</b> ${escapeHtml(milanResult.manglikStatus.boySeverity)} (लग्न ${milanResult.manglikStatus.boyMarsHouseLagna}, चन्द्र ${milanResult.manglikStatus.boyMarsHouseMoon})</span>
        <span><b style="color: #fbbf24;">वधू मांगलिक:</b> ${escapeHtml(milanResult.manglikStatus.girlSeverity)} (लग्न ${milanResult.manglikStatus.girlMarsHouseLagna}, चन्द्र ${milanResult.manglikStatus.girlMarsHouseMoon})</span>
      </div>
      <div style="color: #fde68a; margin-top: 2px; word-break: break-word;">
        <b>मांगलिक निर्णय:</b> ${escapeHtml(milanResult.manglikStatus.description)}
      </div>
      <div style="margin-top: 2px; word-break: break-word;"><b style="color: #fbbf24;">&bull; राशि स्वामी एवं सप्तम भाव समन्वय:</b> ${escapeHtml(milanResult.planetaryHarmony.rashiLordRelation)} • ${escapeHtml(milanResult.planetaryHarmony.seventhHouseSummary)}</div>
      <div style="margin-top: 2.5px; border-top: 1px solid #78350f; padding-top: 2.5px; color: #fde68a; word-break: break-word;">
        <b>शास्त्रोक्त वैवाहिक सुख उपाय:</b> ${doshaRemediesList.map((r) => `• ${escapeHtml(r)}`).join(' &nbsp; ')}
      </div>
    </div>

    ${planetComparisonHtml}

    <div style="background: linear-gradient(90deg, #1c1005 0%, #140d06 100%); border: 1.5px solid #d97706; border-radius: 9px; padding: 5.5px 10px; text-align: center; width: 100%; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size: 10px; font-weight: 800; color: #fbbf24; margin-bottom: 1.5px;">
        आचार्य पण्डित शशांक शर्मा &bull; वैदिक पुरोहित एवं ज्योतिषाचार्य (रुद्रपुर, उधम सिंह नगर, उत्तराखण्ड)
      </div>
      <div style="font-size: 8.4px; color: #e2e8f0;">
        विवाह मुहूर्त निर्धारण, कुम्भ/विष्णु विवाह परिहार, गौरी-गणेश पूजन एवं वैदिक विवाह संस्कार हेतु संपर्क करें: <b style="color: #fde68a;">+91 7017279043</b>
      </div>
    </div>
  `;

  const boyClean = sanitizeFileName(milanResult.boyName);
  const girlClean = sanitizeFileName(milanResult.girlName);
  const filename = `Brihat_36_Gun_Milan_${boyClean}_and_${girlClean}_PanditJiOnline`;
  return renderDiscretePagesToPDF([page1Html, page2Html], filename);
}
