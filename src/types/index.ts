export type PujaCategory = 'ghar_ki_puja' | 'anushthan_jap' | 'jyotish_kundali';

export type BookingType = 'in_person_rudrapur' | 'phone_consultation';

export interface PujaService {
  id: string;
  name: string;
  hindiName: string;
  category: PujaCategory;
  tagline: string;
  description: string;
  pros: string[]; // Positive spiritual merits & blessings
  precautions: string[]; // Important rules, cautions & requirements
  duration: string;
  samagriIncluded: boolean;
  baseDakshina: string;
  originalDakshina: string;
  discountPercentage: number;
  specialOfferTag?: string;
  popular?: boolean;
  imageIcon: string;
  suitableFor: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  gotra?: string;
  nakshatra?: string;
}

export interface UserGotraVault {
  yajmanName: string;
  gotra?: string;
  fatherHusbandName: string;
  phone: string;
  email?: string;
  localityRudrapur: string;
  customAddress: string;
  isRudrapurResident: boolean;
  rashi?: string;
  nakshatra?: string;
  familyMembers: FamilyMember[];
}

export interface BookingRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  bookingType: BookingType;
  date: string;
  timeSlot: string;
  yajmanName: string;
  gotra?: string;
  phone: string;
  localityRudrapur?: string;
  address?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  specialNotes?: string;
  familyIncluded?: string[];
  status: 'confirmed' | 'pending';
  createdAt: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  hindiTitle: string;
  category: 'puja_vidhi' | 'vrat_tyohar' | 'jyotish_gyan' | 'pravachan';
  duration: string;
  publishedDate: string;
  views: string;
  description: string;
  keyTakeaways: string[];
  youtubeUrl: string;
  videoId?: string;
}

export interface PanchangData {
  date: string;
  hinduDate: string;
  tithi: string;
  paksha: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  suryaUday: string;
  suryaAst: string;
  abhijitMuhurat: string;
  rahuKaal: string;
  yamagandam: string;
  gulikaKaal: string;
  dishaShool: string;
  dishaShoolRemedy: string;
  specialFestival?: string;
  choghadiya: Array<{
    name: string;
    type: 'shubh' | 'labh' | 'amrit' | 'char' | 'rog' | 'kaal' | 'udveg';
    time: string;
  }>;
}

export interface FestivalInfo {
  id: string;
  name: string;
  hindiName: string;
  dateDisplay: string;
  tithi: string;
  paksha: string;
  deity: string;
  significance: string;
  shubhMuhurat: string;
  pujaVidhi: string[];
  bhogPrasad: string;
  dosAndDonts: {
    dos: string[];
    donts: string[];
  };
  specialMantra: string;
  mantraTrackId?: string;
  recommendedServiceId?: string;
  isToday?: boolean;
  tag: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  dateStr?: string;
  quickAction?: {
    type: 'book_service' | 'open_vault' | 'open_youtube';
    targetId?: string;
    label: string;
  };
}

export interface SpiritualTrack {
  id: string;
  title: string;
  hindiTitle: string;
  deity: string;
  category?: string;
  duration: string;
  meaning: string;
  sanskritLyrics: string;
  shortMantra?: string;
  benefits?: string;
  toneFrequency: number;
}

export interface JaapHistoryEntry {
  id: string;
  mantraTitle: string;
  deity: string;
  count: number;
  target: number;
  isFullMala: boolean;
  timestamp: string;
}

export interface KundaliMilanHistoryItem {
  id: string;
  boyName: string;
  boyDob: string;
  boyTime: string;
  boyRashi: string;
  boyNakshatra?: string;
  girlName: string;
  girlDob: string;
  girlTime: string;
  girlRashi: string;
  girlNakshatra?: string;
  totalScore: number;
  compatibilityPercentage: number;
  overallVerdict: string;
  timestamp: string;
}

export interface JanamKundaliHistoryItem {
  id: string;
  name: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
  lagna: string;
  moonRashi: string;
  sunRashi: string;
  nakshatra: string;
  nakshatraPada: number;
  currentMahadasha: string;
  manglikStatus: string;
  luckyGemstone: string;
  timestamp: string;
}

export interface UserMobileAccount {
  phone: string;
  name: string;
  password?: string;
  gotra?: string;
  rashi?: string;
  dob?: string;
  birthTime?: string;
  birthPlace?: string;
  localityRudrapur?: string;
  address?: string;
  lastLoginAt: string;
  chatMessages: ChatMessage[];
  jaapStats: {
    currentCount: number;
    completedMalas: number;
    lifetimeJaap: number;
  };
  jaapHistory: JaapHistoryEntry[];
  kundaliHistory: KundaliMilanHistoryItem[];
  janamKundaliHistory?: JanamKundaliHistoryItem[];
}

