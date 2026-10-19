import { UserMobileAccount, ChatMessage, JaapHistoryEntry, KundaliMilanHistoryItem } from '../types';

const ACTIVE_PHONE_KEY = 'panditji_active_mobile_phone';
const USERS_MAP_KEY = 'panditji_users_by_phone_v1';

export function cleanMobileNumber(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(digits.length - 10);
  }
  return digits.slice(-10);
}

export function getActiveMobilePhone(): string | null {
  try {
    const saved = localStorage.getItem(ACTIVE_PHONE_KEY);
    if (saved && saved.length === 10) return saved;
  } catch {
    // ignore
  }
  return null;
}

export function setActiveMobilePhone(phone: string | null): void {
  try {
    if (!phone) {
      localStorage.removeItem(ACTIVE_PHONE_KEY);
    } else {
      localStorage.setItem(ACTIVE_PHONE_KEY, cleanMobileNumber(phone));
    }
  } catch {
    // ignore
  }
}

export function getLocalUsersMap(): Record<string, UserMobileAccount> {
  try {
    const raw = localStorage.getItem(USERS_MAP_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {};
}

export function saveLocalUserAccount(account: UserMobileAccount): void {
  try {
    const map = getLocalUsersMap();
    map[account.phone] = account;
    localStorage.setItem(USERS_MAP_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function removeSavedUserAccount(phone: string): void {
  try {
    const clean = cleanMobileNumber(phone);
    const map = getLocalUsersMap();
    delete map[clean];
    localStorage.setItem(USERS_MAP_KEY, JSON.stringify(map));
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

export function getLocalUserByPhone(phone: string): UserMobileAccount | null {
  const clean = cleanMobileNumber(phone);
  if (clean.length !== 10) return null;
  const map = getLocalUsersMap();
  return map[clean] || null;
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
    if (savedJaapHist) guestJaapHistory = JSON.parse(savedJaapHist);

    const savedChat = localStorage.getItem('panditji_chat_history_guest');
    if (savedChat) guestChatMessages = JSON.parse(savedChat);

    const savedMilan = localStorage.getItem('panditji_kundali_history_guest');
    if (savedMilan) guestKundaliHistory = JSON.parse(savedMilan);

    const savedJK = localStorage.getItem('panditji_sampurn_kundali_history');
    if (savedJK) guestJanamKundaliHistory = JSON.parse(savedJK);
  } catch {
    // ignore
  }

  return {
    phone: clean,
    name: name?.trim() || 'श्रद्धालु यजमान',
    password: password?.trim() || '',
    rashi: '',
    dob: '',
    birthTime: '',
    birthPlace: '',
    localityRudrapur: 'Awas Vikas (Sector 1, 2, 3)',
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

export async function loginOrSyncMobileUser(
  phone: string,
  name?: string,
  password?: string
): Promise<UserMobileAccount> {
  const clean = cleanMobileNumber(phone);
  const localExisting = getLocalUserByPhone(clean);
  const enteredPassword = (password || '').trim();

  // Check local password first if account exists locally with a password
  if (
    localExisting &&
    localExisting.password &&
    localExisting.password.trim() !== '' &&
    localExisting.password.trim() !== enteredPassword
  ) {
    throw new Error('WRONG_PASSWORD');
  }

  try {
    const res = await fetch(
      `/api/user-data?phone=${encodeURIComponent(clean)}&password=${encodeURIComponent(enteredPassword)}`
    );
    if (res.status === 401) {
      throw new Error('WRONG_PASSWORD');
    }
    if (res.ok) {
      const data = await res.json();
      if (data.found && data.user) {
        const serverUser: UserMobileAccount = data.user;
        if (
          serverUser.password &&
          serverUser.password.trim() !== '' &&
          serverUser.password.trim() !== enteredPassword
        ) {
          throw new Error('WRONG_PASSWORD');
        }

        const merged: UserMobileAccount = {
          ...serverUser,
          name: name?.trim() || serverUser.name || localExisting?.name || 'श्रद्धालु यजमान',
          password: enteredPassword || serverUser.password || localExisting?.password || '',
          chatMessages: serverUser.chatMessages ?? localExisting?.chatMessages ?? [],
          jaapStats: serverUser.jaapStats ??
            localExisting?.jaapStats ?? { currentCount: 0, completedMalas: 0, lifetimeJaap: 0 },
          jaapHistory: serverUser.jaapHistory ?? localExisting?.jaapHistory ?? [],
          kundaliHistory: serverUser.kundaliHistory ?? localExisting?.kundaliHistory ?? [],
          lastLoginAt: new Date().toISOString(),
        };

        saveLocalUserAccount(merged);
        setActiveMobilePhone(clean);
        fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(merged),
        }).catch(() => {});
        return merged;
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'WRONG_PASSWORD') {
      throw err;
    }
    // Offline fallback
  }

  const account = localExisting
    ? {
        ...localExisting,
        name: name?.trim() || localExisting.name,
        password: enteredPassword || localExisting.password || '',
        lastLoginAt: new Date().toISOString(),
      }
    : createDefaultAccount(clean, name, enteredPassword);

  saveLocalUserAccount(account);
  setActiveMobilePhone(clean);

  // Sync new or updated account to server
  fetch('/api/user-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  }).catch(() => {});

  return account;
}

export function persistUserAccountUpdate(updated: UserMobileAccount): void {
  saveLocalUserAccount(updated);
  fetch('/api/user-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  }).catch(() => {});
}
