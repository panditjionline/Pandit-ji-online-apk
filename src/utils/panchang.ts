import {
  buildSingleDayPanchang,
  getISTCalendarParts,
  CalendarDayPanchang,
  PanchangLocation,
} from './panchangCalendarEngine';

export interface PanchangData {
  dayNumber: number;
  date: string;
  hindiDate: string;
  liveTime: string;
  samvat: string;
  masaPaksha: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  suryaRashi: string;
  chandraRashi: string;
  abhijitMuhurat: string;
  amritKaal: string;
  brahmaMuhurat: string;
  vijayMuhurat: string;
  rahukaal: string;
  yamagandam: string;
  gulikaKaal: string;
  dinamanaFormatted: string;
  ashtamaamsaDurationFormatted: string;
  rahuKaalPart: number;
  yamagandamPart: number;
  gulikaKaalPart: number;
  dishaShool: string;
  dishaShoolRemedy: string;
  locationName: string;
  coordinatesLabel: string;
  weekdayHindi: string;
  isSelectedDateToday: boolean;
  presidingDeity: {
    dayBadge: string;
    name: string;
    subtitle: string;
    mantra: string;
  };
  choghadiya: Array<{
    name: string;
    time: string;
    nature: 'अति शुभ' | 'शुभ' | 'सामान्य' | 'अशुभ';
    meaning: string;
    partIndex?: number;
    kaalBadge?: 'राहुकाल' | 'यमगण्ड' | 'गुलिक काल';
  }>;
  nightChoghadiya: Array<{
    name: string;
    time: string;
    nature: 'अति शुभ' | 'शुभ' | 'सामान्य' | 'अशुभ';
    meaning: string;
    partIndex?: number;
  }>;
}

export const getPanchang = (
  customDayPanchang?: CalendarDayPanchang,
  customLocation?: PanchangLocation
): PanchangData => {
  const now = new Date();
  const istParts = getISTCalendarParts(now);
  const dayPanchang =
    customDayPanchang ||
    buildSingleDayPanchang(istParts.year, istParts.month, istParts.day, true, now, customLocation);

  const selectedDateObj = new Date(dayPanchang.year, dayPanchang.month - 1, dayPanchang.day);
  const istDateStr = selectedDateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const periodHindi = istParts.hours < 12 ? 'पूर्वाह्न' : 'अपराह्न';
  const timeFormatted = now
    .toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    .replace(/am|pm|AM|PM/, '')
    .trim();

  const mapChoghadiyaNature = (
    type: 'amrit' | 'shubh' | 'labh' | 'char' | 'rog' | 'kaal' | 'udveg'
  ): 'अति शुभ' | 'शुभ' | 'सामान्य' | 'अशुभ' => {
    if (type === 'amrit' || type === 'labh') return 'अति शुभ';
    if (type === 'shubh') return 'शुभ';
    if (type === 'char') return 'सामान्य';
    return 'अशुभ';
  };

  return {
    dayNumber: dayPanchang.day,
    date: istDateStr,
    hindiDate: dayPanchang.formattedDateHindi,
    liveTime: `${timeFormatted} ${periodHindi} (IST)`,
    samvat: `विक्रम संवत ${dayPanchang.vikramSamvat} • शक ${dayPanchang.shakaSamvat}`,
    masaPaksha: `${dayPanchang.paksha} (${dayPanchang.hinduMaas})`,
    tithi: `${dayPanchang.tithiName} (${dayPanchang.tithiEndTime})`,
    nakshatra: `${dayPanchang.nakshatra} (${dayPanchang.nakshatraEndTime})`,
    yoga: `योग: ${dayPanchang.yoga} (${dayPanchang.yogaEndTime})`,
    karana: `करण: ${dayPanchang.karana} (${dayPanchang.karanaEndTime})`,
    sunrise: dayPanchang.sunrise,
    sunset: dayPanchang.sunset,
    moonrise: dayPanchang.moonrise,
    suryaRashi: dayPanchang.suryaRashi,
    chandraRashi: dayPanchang.chandraRashi,
    abhijitMuhurat: dayPanchang.abhijitMuhurat,
    amritKaal: dayPanchang.amritKaal,
    brahmaMuhurat: dayPanchang.brahmaMuhurat,
    vijayMuhurat: dayPanchang.vijayMuhurat,
    rahukaal: dayPanchang.rahuKaal,
    yamagandam: dayPanchang.yamagandam,
    gulikaKaal: dayPanchang.gulikaKaal,
    dinamanaFormatted: dayPanchang.dinamanaFormatted,
    ashtamaamsaDurationFormatted: dayPanchang.ashtamaamsaDurationFormatted,
    rahuKaalPart: dayPanchang.rahuKaalPart,
    yamagandamPart: dayPanchang.yamagandamPart,
    gulikaKaalPart: dayPanchang.gulikaKaalPart,
    dishaShool: dayPanchang.dishaShool,
    dishaShoolRemedy: dayPanchang.dishaShoolRemedy,
    locationName: dayPanchang.locationName || 'रुद्रपुर, उत्तराखण्ड',
    coordinatesLabel: dayPanchang.coordinatesLabel || '28.98°N, 79.40°E',
    weekdayHindi: dayPanchang.vaarHindi,
    isSelectedDateToday: dayPanchang.isToday,
    presidingDeity: {
      dayBadge: `${dayPanchang.formattedDateHindi} (${dayPanchang.vaarHindi}) के अधिष्ठाता देव`,
      name: dayPanchang.festivalDeity || 'आराध्य वैदिक देव',
      subtitle: 'शास्त्रोक्त आराध्य देव एवं दैनिक साधना',
      mantra: dayPanchang.festivalMantra || 'ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥',
    },
    choghadiya: dayPanchang.dayChoghadiya.map((c) => ({
      name: c.hindiName || c.name,
      time: c.time,
      nature: mapChoghadiyaNature(c.type),
      meaning: c.meaning,
      partIndex: c.partIndex,
      kaalBadge: c.kaalBadge,
    })),
    nightChoghadiya: dayPanchang.nightChoghadiya.map((c) => ({
      name: c.hindiName || c.name,
      time: c.time,
      nature: mapChoghadiyaNature(c.type),
      meaning: c.meaning,
      partIndex: c.partIndex,
    })),
  };
};
