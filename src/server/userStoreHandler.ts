import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { UserMobileAccount } from '../types';

const SEED_USERS_FILE = path.resolve(process.cwd(), 'users_store.json');
const RUNTIME_USERS_FILE = path.resolve(process.cwd(), 'users_store.json');

export function normalizePhone(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(digits.length - 10);
  }
  return digits.slice(-10);
}

function hashPassword(password: string): string {
  if (!password || password.length < 3) return password;
  // If it already looks like a SHA256 hash (64 hex chars), keep it.
  // Otherwise, hash it to ensure consistency for new passwords.
  if (/^[a-f0-9]{64}$/.test(password)) return password;
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function getAllUsersStore(): Record<string, UserMobileAccount> {
  try {
    if (fs.existsSync(RUNTIME_USERS_FILE)) {
      const raw = fs.readFileSync(RUNTIME_USERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw || '{}');
      if (parsed && typeof parsed === 'object') return parsed;
    }
    if (fs.existsSync(SEED_USERS_FILE)) {
      const raw = fs.readFileSync(SEED_USERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw || '{}');
      if (parsed && typeof parsed === 'object') {
        try {
          fs.writeFileSync(RUNTIME_USERS_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        } catch {
          // ignore
        }
        return parsed;
      }
    }
    return {};
  } catch (err) {
    console.error('Error reading users store:', err);
    return {};
  }
}

export function getUserByPhone(phone: string): UserMobileAccount | null {
  const clean = normalizePhone(phone);
  if (!clean || clean.length < 10) return null;
  const store = getAllUsersStore();
  const user = store[clean] || null;
  if (user && Array.isArray(user.chatMessages)) {
    user.chatMessages = user.chatMessages.filter(
      (m) =>
        m &&
        m.text &&
        !m.text.includes('Rudrapur (Uttarakhand) aur sampoorn vishva ke shradhaluon ke kalyanarth') &&
        !m.text.includes('पर शास्त्रसम्मत एवं संतुलित वैदिक विचार इस प्रकार है')
    );
  }
  return user;
}

export function getUserByEmail(email: string): UserMobileAccount | null {
  if (!email || !email.includes('@')) return null;
  const store = getAllUsersStore();
  const lower = email.toLowerCase().trim();
  const found = Object.values(store).find(u => u.email && u.email.toLowerCase().trim() === lower);
  return found || null;
}

export function saveOrUpdateUserByPhone(
  accountData: Partial<UserMobileAccount> & { phone: string }
): UserMobileAccount {
  const clean = normalizePhone(accountData.phone);
  const store = getAllUsersStore();
  const existing = store[clean];

  const merged: UserMobileAccount = {
    phone: clean,
    name:
      accountData.name !== undefined && accountData.name.trim() !== ''
        ? accountData.name.trim()
        : existing?.name || 'यजमान (भक्त)',
    email: accountData.email !== undefined ? accountData.email : existing?.email || '',
    password:
      accountData.password !== undefined && accountData.password.trim() !== ''
        ? hashPassword(accountData.password.trim())
        : existing?.password || '',
    rashi: accountData.rashi !== undefined ? accountData.rashi : existing?.rashi || '',
    dob: accountData.dob !== undefined ? accountData.dob : existing?.dob || '',
    birthTime:
      accountData.birthTime !== undefined ? accountData.birthTime : existing?.birthTime || '',
    birthPlace:
      accountData.birthPlace !== undefined ? accountData.birthPlace : existing?.birthPlace || '',
    localityRudrapur:
      accountData.localityRudrapur !== undefined
        ? accountData.localityRudrapur
        : existing?.localityRudrapur || '',
    address: accountData.address !== undefined ? accountData.address : existing?.address || '',
    lastLoginAt: new Date().toISOString(),
    chatMessages:
      accountData.chatMessages !== undefined
        ? accountData.chatMessages
        : existing?.chatMessages || [],
    jaapStats:
      accountData.jaapStats !== undefined
        ? accountData.jaapStats
        : existing?.jaapStats || { currentCount: 0, completedMalas: 0, lifetimeJaap: 0 },
    jaapHistory:
      accountData.jaapHistory !== undefined ? accountData.jaapHistory : existing?.jaapHistory || [],
    kundaliHistory:
      accountData.kundaliHistory !== undefined
        ? accountData.kundaliHistory
        : existing?.kundaliHistory || [],
    janamKundaliHistory:
      accountData.janamKundaliHistory !== undefined
        ? accountData.janamKundaliHistory
        : existing?.janamKundaliHistory || [],
    kulJivanSadhna:
      accountData.kulJivanSadhna !== undefined
        ? accountData.kulJivanSadhna
        : existing?.kulJivanSadhna ?? 0,
  };

  store[clean] = merged;

  try {
    fs.writeFileSync(RUNTIME_USERS_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing runtime users store:', err);
  }

  return merged;
}
