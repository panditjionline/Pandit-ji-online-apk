import { UserMobileAccount, ChatMessage, JaapHistoryEntry, KundaliMilanHistoryItem } from '../types';

const ACTIVE_PHONE_KEY = 'panditji_active_mobile_phone';
const ACTIVE_SESSION_TOKEN_KEY = 'panditji_active_session_token';
const ACTIVE_USER_CACHE_KEY = 'panditji_active_user_account';
const USERS_MAP_KEY = 'panditji_users_by_phone_v1';

export function cleanMobileNumber(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(digits.length - 10);
  }
  return digits.slice(-10);
}

export function getActiveSessionToken(): string | null {
  try {
    const token = localStorage.getItem(ACTIVE_SESSION_TOKEN_KEY);
    if (token && token.trim().length > 0) return token;
  } catch {
    // ignore
  }
  return null;
}

export function getActiveMobilePhone(): string | null {
  try {
    const saved = localStorage.getItem(ACTIVE_PHONE_KEY);
    if (saved) {
      const cleaned = cleanMobileNumber(saved);
      if (cleaned.length === 10) return cleaned;
    }
    const token = localStorage.getItem(ACTIVE_SESSION_TOKEN_KEY);
    if (token && token.startsWith('sess_')) {
      const parts = token.split('_');
      if (parts[1] && parts[1].length === 10) {
        return parts[1];
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function setActiveMobilePhone(phone: string | null): void {
  try {
    if (!phone) {
      localStorage.removeItem(ACTIVE_PHONE_KEY);
      localStorage.removeItem(ACTIVE_SESSION_TOKEN_KEY);
      localStorage.removeItem(ACTIVE_USER_CACHE_KEY);
    } else {
      const cleaned = cleanMobileNumber(phone);
      if (cleaned.length === 10) {
        localStorage.setItem(ACTIVE_PHONE_KEY, cleaned);
        const existingToken = localStorage.getItem(ACTIVE_SESSION_TOKEN_KEY);
        if (!existingToken || !existingToken.startsWith(`sess_${cleaned}_`)) {
          localStorage.setItem(ACTIVE_SESSION_TOKEN_KEY, `sess_${cleaned}_${Date.now()}`);
        }
        const localUser = getLocalUserByPhone(cleaned);
        if (localUser) {
          localStorage.setItem(ACTIVE_USER_CACHE_KEY, JSON.stringify(localUser));
        }
      }
    }
  } catch {
    // ignore
  }
}

export function getLocalUsersMap(): Record<string, UserMobileAccount> {
  try {
    const raw = localStorage.getItem(USERS_MAP_KEY);
    if (raw && raw !== 'undefined' && raw !== 'null') {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {};
}

export function saveLocalUserAccount(account: UserMobileAccount): void {
  try {
    const clean = cleanMobileNumber(account.phone);
    if (!clean) return;
    const normalizedAccount: UserMobileAccount = {
      ...account,
      phone: clean,
    };
    const map = getLocalUsersMap();
    map[clean] = normalizedAccount;
    localStorage.setItem(USERS_MAP_KEY, JSON.stringify(map));

    const activePhone = getActiveMobilePhone();
    if (activePhone === clean) {
      localStorage.setItem(ACTIVE_USER_CACHE_KEY, JSON.stringify(normalizedAccount));
      const existingToken = localStorage.getItem(ACTIVE_SESSION_TOKEN_KEY);
      if (!existingToken || !existingToken.startsWith(`sess_${clean}_`)) {
        localStorage.setItem(ACTIVE_SESSION_TOKEN_KEY, `sess_${clean}_${Date.now()}`);
      }
    }
  } catch {
    // ignore
  }
}

export function getActiveSessionAccount(): UserMobileAccount | null {
  try {
    const activePhone = getActiveMobilePhone();
    const sessionToken = getActiveSessionToken();
    if (!activePhone && !sessionToken) {
      return null;
    }

    if (activePhone) {
      const fromMap = getLocalUserByPhone(activePhone);
      if (fromMap) {
        if (!sessionToken) {
          localStorage.setItem(ACTIVE_SESSION_TOKEN_KEY, `sess_${activePhone}_${Date.now()}`);
        }
        localStorage.setItem(ACTIVE_USER_CACHE_KEY, JSON.stringify(fromMap));
        return fromMap;
      }
    }

    const cachedRaw = localStorage.getItem(ACTIVE_USER_CACHE_KEY);
    if (cachedRaw && cachedRaw !== 'undefined' && cachedRaw !== 'null') {
      const parsed = JSON.parse(cachedRaw) as UserMobileAccount;
      if (parsed && parsed.phone) {
        const clean = cleanMobileNumber(parsed.phone);
        if (!activePhone && clean.length === 10) {
          localStorage.setItem(ACTIVE_PHONE_KEY, clean);
        }
        saveLocalUserAccount(parsed);
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function removeSavedUserAccount(phone: string): void {
  try {
    const clean = cleanMobileNumber(phone);
    const map = getLocalUsersMap();
    delete map[clean];
    localStorage.setItem(USERS_MAP_KEY, JSON.stringify(map));
    if (getActiveMobilePhone() === clean) {
      setActiveMobilePhone(null);
    }
  } catch {
    // ignore
  }
}

export function clearLocalChatCache(): void {
  try {
    localStorage.removeItem('panditji_chat_history_guest');
    localStorage.removeItem('pandit_shashank_chat_v2');
  } catch {
    // ignore
  }
}

export function clearLocalJaapCache(resetCounts = true): void {
  try {
    localStorage.removeItem('panditji_jaap_history');
    if (resetCounts) {
      localStorage.setItem('panditji_jaap_current', '0');
      localStorage.setItem('panditji_jaap_malas', '0');
      localStorage.setItem('panditji_jaap_lifetime', '0');
    }
  } catch {
    // ignore
  }
}

export function clearLocalKundaliCache(): void {
  try {
    localStorage.removeItem('panditji_kundali_history_guest');
    localStorage.removeItem('panditji_kundali_milan_history');
  } catch {
    // ignore
  }
}

export function clearLocalJanamKundaliCache(): void {
  try {
    localStorage.removeItem('panditji_sampurn_kundali_history');
  } catch {
    // ignore
  }
}

const SEED_ACCOUNTS: Record<string, Partial<UserMobileAccount>> = {
  '8958499979': {
    phone: '8958499979',
    name: 'Shashank',
    email: 'shashank@panditji.com',
    gotra: 'कश्यप',
    rashi: 'कुंभ (Aquarius)',
    dob: '1996-03-10',
    birthTime: '10:00',
    birthPlace: 'रुद्रपुर, उत्तराखण्ड',
    localityRudrapur: 'आवास विकास, रुद्रपुर',
  },
  '9837123456': {
    phone: '9837123456',
    name: 'Atul',
    email: 'atul@panditji.com',
    gotra: 'भारद्वाज',
    rashi: 'वृषभ (Taurus)',
    dob: '1992-08-22',
    birthTime: '15:45',
    birthPlace: 'देहरादून, उत्तराखण्ड',
    localityRudrapur: 'राजपुर रोड, देहरादून',
  },
  '7017279043': {
    phone: '7017279043',
    name: 'Niraj',
    email: 'niraj@panditji.com',
    gotra: 'कौशिक',
    rashi: 'वृश्चिक (Scorpio)',
    dob: '1994-11-18',
    birthTime: '06:30',
    birthPlace: 'नैनीताल, उत्तराखण्ड',
    localityRudrapur: 'मल्लीताल, नैनीताल',
  },
  '9917801538': {
    phone: '9917801538',
    name: 'Pragya',
    email: 'pragya@panditji.com',
    gotra: 'गर्ग',
    rashi: 'सिंह (Leo)',
    dob: '1996-11-06',
    birthTime: '14:15',
    birthPlace: 'रुद्रपुर, उत्तराखण्ड',
    localityRudrapur: '',
  },
};

export function getLocalUserByPhone(phone: string): UserMobileAccount | null {
  const clean = cleanMobileNumber(phone);
  if (clean.length !== 10) return null;
  const map = getLocalUsersMap();
  if (map[clean]) {
    const existing = map[clean];
    // Auto-repair stale seed DOB for Pragya (9917801538) if it was previously seeded as 1998-05-12
    if (clean === '9917801538' && existing.dob === '1998-05-12') {
      existing.dob = '1996-11-06';
      if (existing.birthTime === '18:20') existing.birthTime = '14:15';
      if (existing.birthPlace === 'हरिद्वार, उत्तराखण्ड') existing.birthPlace = 'रुद्रपुर, उत्तराखण्ड';
      saveLocalUserAccount(existing);
    }
    return existing;
  }

  if (SEED_ACCOUNTS[clean]) {
    const seed = SEED_ACCOUNTS[clean];
    const acc = createDefaultAccount(clean, seed.name);
    acc.email = seed.email || '';
    acc.gotra = seed.gotra || '';
    acc.rashi = seed.rashi || '';
    acc.dob = seed.dob || '1996-11-06';
    acc.birthTime = seed.birthTime || '12:00';
    acc.birthPlace = seed.birthPlace || 'रुद्रपुर, उत्तराखण्ड';
    acc.localityRudrapur = '';
    saveLocalUserAccount(acc);
    return acc;
  }

  return null;
}

export function createDefaultAccount(
  phone: string,
  name?: string,
  password?: string
): UserMobileAccount {
  const clean = cleanMobileNumber(phone);

  // Check if there is guest data in localStorage to import on first account creation
  let guestJaapCurrent = 0;
  let guestJaapMalas = 0;
  let guestJaapLifetime = 0;
  let guestJaapHistory: JaapHistoryEntry[] = [];
  let guestChatMessages: ChatMessage[] = [];
  let guestKundaliHistory: KundaliMilanHistoryItem[] = [];
  let guestJanamKundaliHistory = [];

  try {
    guestJaapCurrent = parseInt(localStorage.getItem('panditji_jaap_current') || '0', 10) || 0;
    guestJaapMalas = parseInt(localStorage.getItem('panditji_jaap_malas') || '0', 10) || 0;
    guestJaapLifetime = parseInt(localStorage.getItem('panditji_jaap_lifetime') || '0', 10) || 0;
    const savedJaapHist = localStorage.getItem('panditji_jaap_history');
    if (savedJaapHist && savedJaapHist !== 'undefined' && savedJaapHist !== 'null') guestJaapHistory = JSON.parse(savedJaapHist);

    const savedChat = localStorage.getItem('panditji_chat_history_guest');
    if (savedChat && savedChat !== 'undefined' && savedChat !== 'null') guestChatMessages = JSON.parse(savedChat);

    const savedMilan = localStorage.getItem('panditji_kundali_history_guest');
    if (savedMilan && savedMilan !== 'undefined' && savedMilan !== 'null') guestKundaliHistory = JSON.parse(savedMilan);

    const savedJK = localStorage.getItem('panditji_sampurn_kundali_history');
    if (savedJK && savedJK !== 'undefined' && savedJK !== 'null') guestJanamKundaliHistory = JSON.parse(savedJK);
  } catch {
    // ignore
  }

  return {
    phone: clean,
    name: name?.trim() || 'श्रद्धालु यजमान',
    email: '',
    password: password?.trim() || '',
    gotra: '',
    rashi: '',
    dob: '',
    birthTime: '',
    birthPlace: '',
    localityRudrapur: '',
    address: '',
    lastLoginAt: new Date().toISOString(),
    chatMessages: guestChatMessages,
    jaapStats: {
      currentCount: guestJaapCurrent,
      completedMalas: guestJaapMalas,
      lifetimeJaap: guestJaapLifetime,
    },
    jaapHistory: guestJaapHistory,
    kundaliHistory: guestKundaliHistory,
    janamKundaliHistory: guestJanamKundaliHistory,
  };
}

function normalizeDobDigits(raw: string): string {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  const dmyMatch = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[3]}${dmyMatch[2]}${dmyMatch[1]}`;
  }
  return trimmed.replace(/\D/g, '');
}

export async function verifyUserDobForReset(
  phone: string,
  dob: string
): Promise<{ verified: boolean; name?: string; message: string }> {
  const cleanedPhone = cleanMobileNumber(phone);
  const inputDob = String(dob || '').trim();

  if (cleanedPhone.length !== 10 || !inputDob) {
    throw new Error('कृपया सही 10 अंकों का मोबाइल नंबर और जन्म तिथि दर्ज करें।');
  }

  const localUser = getLocalUserByPhone(cleanedPhone);

  try {
    const resp = await fetch('/api/forgot-password/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanedPhone, dob: inputDob }),
    });

    const contentType = resp.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await resp.json();
      if (resp.ok && data.verified) {
        return {
          verified: true,
          name: data.name || localUser?.name,
          message: data.message || 'मोबाइल नंबर एवं जन्म तिथि का सत्यापन सफल रहा!',
        };
      }
      if (resp.status === 401) {
        throw new Error(data.message || 'जन्म तिथि मेल नहीं खाती! कृपया अपनी पंजीकृत जन्म तिथि दर्ज करें।');
      }
      if (resp.status === 404 && !localUser) {
        throw new Error(data.message || 'यह मोबाइल नंबर पंजीकृत नहीं है। कृपया पहले नया खाता (Sign-Up) बनाएँ।');
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && (err.message.includes('मेल नहीं') || err.message.includes('पंजीकृत नहीं'))) {
      throw err;
    }
  }

  // Fallback to localStorage account verification if present locally
  if (localUser) {
    const storedDob = String(localUser.dob || '').trim();
    if (storedDob) {
      const cleanStored = normalizeDobDigits(storedDob);
      const cleanInput = normalizeDobDigits(inputDob);
      const rawStored = storedDob.replace(/\D/g, '');
      const rawInput = inputDob.replace(/\D/g, '');
      if (cleanStored !== cleanInput && rawStored !== rawInput) {
        throw new Error('जन्म तिथि मेल नहीं खाती! कृपया अपनी पंजीकृत जन्म तिथि दर्ज करें।');
      }
    }
    return {
      verified: true,
      name: localUser.name,
      message: 'मोबाइल नंबर एवं जन्म तिथि का सत्यापन सफल रहा!',
    };
  }

  throw new Error('यह मोबाइल नंबर पंजीकृत नहीं है। कृपया पहले नया खाता (Sign-Up) बनाएँ।');
}

export async function saveNewPasswordForUser(
  phone: string,
  dob: string,
  newPassword: string
): Promise<UserMobileAccount> {
  const cleanedPhone = cleanMobileNumber(phone);
  const cleanPass = String(newPassword || '').trim();

  if (cleanedPhone.length !== 10) {
    throw new Error('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।');
  }
  if (cleanPass.length < 3) {
    throw new Error('पासवर्ड कम से कम 3 अक्षरों का होना चाहिए।');
  }

  const localUser = getLocalUserByPhone(cleanedPhone);
  let updatedAccount: UserMobileAccount | null = null;

  try {
    const resp = await fetch('/api/forgot-password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanedPhone, dob, newPassword: cleanPass }),
    });

    const contentType = resp.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await resp.json();
      if (resp.ok && data.user) {
        updatedAccount = {
          ...(localUser || {}),
          ...data.user,
          password: cleanPass,
        };
      } else if (!resp.ok && !localUser) {
        throw new Error(data.message || 'पासवर्ड रीसेट करने में समस्या आई।');
      }
    }
  } catch (err: unknown) {
    if (!localUser && err instanceof Error) {
      throw err;
    }
  }

  if (!updatedAccount) {
    if (localUser) {
      updatedAccount = {
        ...localUser,
        password: cleanPass,
        dob: localUser.dob || dob,
      };
    } else {
      throw new Error('यह मोबाइल नंबर पंजीकृत नहीं है।');
    }
  }

  // Persist in both localStorage and server
  saveLocalUserAccount(updatedAccount);
  fetch('/api/user-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedAccount),
  }).catch(() => {});

  return updatedAccount;
}

export async function loginOrSyncUser(params: {
  phone?: string;
  email?: string;
  name?: string;
  password?: string;
  mode?: 'login' | 'signup';
}): Promise<UserMobileAccount> {
  const { phone, email, name, password, mode } = params;
  const cleanPhone = phone ? cleanMobileNumber(phone) : '';
  const localExisting = cleanPhone ? getLocalUserByPhone(cleanPhone) : null;
  const enteredPassword = (password || '').trim();

  try {
    const query = new URLSearchParams();
    if (cleanPhone) query.append('phone', cleanPhone);
    if (email) query.append('email', email);
    if (enteredPassword) query.append('password', enteredPassword);

    const res = await fetch(`/api/user-data?${query.toString()}`);
    if (res.status === 401) {
      throw new Error('WRONG_PASSWORD');
    }
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.found && data.user) {
          const serverUser: UserMobileAccount = data.user;

          const localDob =
            localExisting?.dob && localExisting.dob.trim() && localExisting.dob !== '1998-05-12'
              ? localExisting.dob
              : '';
          const serverDob =
            serverUser.dob && serverUser.dob.trim() && serverUser.dob !== '1998-05-12'
              ? serverUser.dob
              : '';

          const merged: UserMobileAccount = {
            ...serverUser,
            ...localExisting,
            name: name?.trim() || localExisting?.name || serverUser.name || 'श्रद्धालु यजमान',
            password: enteredPassword || localExisting?.password || serverUser.password || '',
            email: email || localExisting?.email || serverUser.email || '',
            gotra: localExisting?.gotra || serverUser.gotra || '',
            dob: localDob || serverDob || (cleanPhone === '9917801538' ? '1996-11-06' : ''),
            birthTime: localExisting?.birthTime || serverUser.birthTime || '',
            birthPlace: localExisting?.birthPlace || serverUser.birthPlace || '',
            rashi: localExisting?.rashi || serverUser.rashi || '',
            chatMessages:
              localExisting?.chatMessages && localExisting.chatMessages.length > 0
                ? localExisting.chatMessages
                : (serverUser.chatMessages ?? []),
            jaapStats:
              localExisting?.jaapStats && localExisting.jaapStats.lifetimeJaap > 0
                ? localExisting.jaapStats
                : (serverUser.jaapStats ?? { currentCount: 0, completedMalas: 0, lifetimeJaap: 0 }),
            jaapHistory:
              localExisting?.jaapHistory && localExisting.jaapHistory.length > 0
                ? localExisting.jaapHistory
                : (serverUser.jaapHistory ?? []),
            kundaliHistory:
              localExisting?.kundaliHistory && localExisting.kundaliHistory.length > 0
                ? localExisting.kundaliHistory
                : (serverUser.kundaliHistory ?? []),
            janamKundaliHistory:
              localExisting?.janamKundaliHistory && localExisting.janamKundaliHistory.length > 0
                ? localExisting.janamKundaliHistory
                : (serverUser.janamKundaliHistory ?? []),
            lastLoginAt: new Date().toISOString(),
          };

          saveLocalUserAccount(merged);
          if (merged.phone) setActiveMobilePhone(merged.phone);
          fetch('/api/user-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(merged),
          }).catch(() => {});
          return merged;
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'WRONG_PASSWORD') {
      throw err;
    }
  }

  // If mode is strictly 'login', check localExisting before failing
  if (mode === 'login') {
    if (!localExisting) {
      throw new Error('USER_NOT_FOUND');
    }
    if (localExisting.password && localExisting.password.trim() !== '') {
      if (localExisting.password.trim() !== enteredPassword) {
        throw new Error('WRONG_PASSWORD');
      }
    }
    const updatedLocal: UserMobileAccount = {
      ...localExisting,
      lastLoginAt: new Date().toISOString(),
    };
    saveLocalUserAccount(updatedLocal);
    setActiveMobilePhone(updatedLocal.phone);
    fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedLocal),
    }).catch(() => {});
    return updatedLocal;
  }

  if (!cleanPhone) {
    throw new Error('USER_NOT_FOUND');
  }

  const account = localExisting
    ? {
        ...localExisting,
        name: name?.trim() || localExisting.name,
        password: enteredPassword || localExisting.password || '',
        lastLoginAt: new Date().toISOString(),
      }
    : createDefaultAccount(cleanPhone, name, enteredPassword);

  if (email) account.email = email;

  saveLocalUserAccount(account);
  setActiveMobilePhone(cleanPhone);

  fetch('/api/user-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  }).catch(() => {});

  return account;
}

export async function loginOrSyncMobileUser(
  phone: string,
  name?: string,
  password?: string
): Promise<UserMobileAccount> {
  return loginOrSyncUser({ phone, name, password });
}

export function persistUserAccountUpdate(updated: UserMobileAccount): void {
  saveLocalUserAccount(updated);
  fetch('/api/user-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  }).catch(() => {});
}

export async function updatePunyaPoints(phone: string, pointsChange: number): Promise<UserMobileAccount> {
  const user = getLocalUserByPhone(phone);
  if (!user) throw new Error('USER_NOT_FOUND');
  
  const updatedUser = {
    ...user,
    punyaPoints: (user.punyaPoints || 0) + pointsChange
  };
  
  persistUserAccountUpdate(updatedUser);
  return updatedUser;
}
