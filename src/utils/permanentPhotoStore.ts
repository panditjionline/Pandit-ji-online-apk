import { PANDIT_ORIGINAL_PHOTO } from '../data/panditImage';

const LEGACY_STORAGE_KEY = 'pandit_profile_image';
const PERMANENT_STORAGE_KEY = 'panditji_permanent_photo';
const LOCKED_FLAG_KEY = 'panditji_photo_locked_permanent';

function updateDocumentFavicon(photoUri: string) {
  if (typeof document === 'undefined' || !photoUri) return;
  try {
    const iconLinks = document.querySelectorAll("link[rel*='icon']");
    iconLinks.forEach((link) => {
      (link as HTMLLinkElement).href = '/pwa-192x192.png';
      (link as HTMLLinkElement).type = 'image/png';
    });
  } catch {
    // ignore DOM errors
  }
}

let initialized = false;

function initStore() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  try {
    // Always ensure the clean, zero-black-shadow permanent photo is synced to localStorage
    localStorage.setItem(PERMANENT_STORAGE_KEY, PANDIT_ORIGINAL_PHOTO);
    localStorage.setItem(LEGACY_STORAGE_KEY, PANDIT_ORIGINAL_PHOTO);
    localStorage.setItem(LOCKED_FLAG_KEY, 'true');
    updateDocumentFavicon(PANDIT_ORIGINAL_PHOTO);
  } catch {
    // ignore storage errors
  }
}

export function usePermanentPhoto() {
  initStore();

  return {
    photoSrc: PANDIT_ORIGINAL_PHOTO,
    isPhotoLocked: true,
  };
}
