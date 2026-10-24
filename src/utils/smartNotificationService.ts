/**
 * Smart Personalized Push Notification & Vedic Daily Reminder Service
 * Uses Web Notification API, localStorage, and dynamic Astrological data
 */

import { getPrimaryFamilyProfile } from './familyVaultStorage';
import { getTodayPanchang, getTodayFestivalInfo } from '../data/mockData';
import { TWELVE_RASHIS } from '../components/DailyRashifalWidget';
import { vedicAudio } from './audioSynthesizer';

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string; // e.g., "07:00"
  userName?: string;
  userRashi?: string;
  notifyHoroscope: boolean;
  notifyMuhurat: boolean;
  notifyVratTyohar: boolean;
  lastNotifiedDate?: string; // YYYY-MM-DD
}

const SETTINGS_KEY = 'panditji_smart_notifications_v1';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  reminderTime: '07:00',
  notifyHoroscope: true,
  notifyMuhurat: true,
  notifyVratTyohar: true,
};

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('panditji_notifications_settings_changed', { detail: settings }));
  } catch (err) {
    console.error('Error saving notification settings:', err);
  }
}

/**
 * Checks browser support for Notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Requests Web Notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Web Notifications not supported in this browser.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    const isGranted = permission === 'granted';
    if (isGranted) {
      const current = getNotificationSettings();
      saveNotificationSettings({ ...current, enabled: true });
    }
    return isGranted;
  } catch (err) {
    console.error('Notification permission error:', err);
    return false;
  }
}

/**
 * Generates personalized daily notification payload
 */
export function buildPersonalizedDailyNotification() {
  const primaryProfile = getPrimaryFamilyProfile();
  const settings = getNotificationSettings();
  const panchang = getTodayPanchang(new Date());
  const festival = getTodayFestivalInfo();

  // 1. Personalized User Name
  const name =
    settings.userName?.trim() ||
    primaryProfile?.name?.trim() ||
    'भक्त';

  // 2. Personalized Rashi
  const rawRashi = settings.userRashi || primaryProfile?.rashi || 'मेष';
  const cleanRashi = rawRashi.split(' ')[0].trim();
  const matchedRashi =
    TWELVE_RASHIS.find(
      (r) =>
        r.hindiName.includes(cleanRashi) ||
        cleanRashi.includes(r.hindiName) ||
        r.englishName.toLowerCase() === cleanRashi.toLowerCase()
    ) || TWELVE_RASHIS[0];

  // 3. Title with personal greeting
  const title = `🙏 ${name} जी, सादर प्रणाम! आज का वैदिक संदेश`;

  // 4. Personalized Body Construction
  const lines: string[] = [];

  // Horoscope line
  if (settings.notifyHoroscope) {
    lines.push(
      `✨ ${matchedRashi.symbol} ${matchedRashi.hindiName} राशि: ${matchedRashi.swami} की कृपा से आज का दिन शुभ है। इष्ट: ${matchedRashi.aradhyaDev}।`
    );
  }

  // Abhijit & Rahukaal
  if (settings.notifyMuhurat) {
    const abhijit = panchang.abhijitMuhurat || 'दोपहर 11:45 से 12:30';
    const rahu = panchang.rahuKaal || 'दोपहर 03:00 से 04:30';
    lines.push(`⏰ अभिजित मुहूर्त: ${abhijit} | राहुकाल: ${rahu} (त्याज्य)`);
  }

  // Tithi & Festival
  if (settings.notifyVratTyohar) {
    if (festival && festival.name) {
      lines.push(`🚩 आज का पावन पर्व: ${festival.name} (${panchang.tithi})`);
    } else {
      lines.push(`📅 आज की तिथि: ${panchang.tithi}, ${panchang.paksha} पक्ष`);
    }
  }

  lines.push('ॐ श्री गणेशाय नमः • पण्डित जी ऑनलाइन');

  return {
    title,
    body: lines.join('\n'),
    name,
    rashi: matchedRashi.hindiName,
    festival: festival?.name || panchang.tithi,
    abhijit: panchang.abhijitMuhurat,
    rahuKaal: panchang.rahuKaal,
  };
}

/**
 * Triggers an authentic browser push notification immediately
 */
export async function sendPersonalizedNotification(isTest: boolean = false): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
  }

  const payload = buildPersonalizedDailyNotification();
  const title = isTest
    ? `🔔 [टेस्ट सूचना] ${payload.title}`
    : payload.title;

  try {
    // Play pleasant temple bell
    vedicAudio.playCrispTempleBell(0.65);

    // If serviceWorker is registered, use showNotification for persistent lockscreen banner
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body: payload.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'panditji-daily-reminder',
        data: { url: window.location.origin },
      } as any);
    } else {
      // Standard Web Notification
      new Notification(title, {
        body: payload.body,
        icon: '/favicon.ico',
        tag: 'panditji-daily-reminder',
      });
    }

    // Mark today as notified
    const todayStr = new Date().toISOString().split('T')[0];
    const settings = getNotificationSettings();
    saveNotificationSettings({ ...settings, lastNotifiedDate: todayStr });
    return true;
  } catch (err) {
    console.error('Failed to trigger notification:', err);
    return false;
  }
}

/**
 * Auto-scheduler: checks if current time matches reminder time once per minute
 */
export function initSmartNotificationScheduler(): () => void {
  if (typeof window === 'undefined') return () => {};

  const checkAndNotify = () => {
    const settings = getNotificationSettings();
    if (!settings.enabled || Notification.permission !== 'granted') return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Already notified today?
    if (settings.lastNotifiedDate === todayStr) return;

    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMins}`;

    // If time reached or passed on this day
    if (currentTimeStr >= settings.reminderTime) {
      sendPersonalizedNotification(false);
    }
  };

  // Run initial check
  checkAndNotify();

  // Run interval every 60 seconds
  const intervalId = window.setInterval(checkAndNotify, 60000);
  return () => window.clearInterval(intervalId);
}
