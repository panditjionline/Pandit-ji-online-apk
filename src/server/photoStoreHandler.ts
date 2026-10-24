import fs from 'fs';
import os from 'os';
import path from 'path';

const RUNTIME_PHOTO_FILE = path.join(os.tmpdir(), 'panditji_permanent_photo.json');
const WORKSPACE_PHOTO_FILE = path.resolve(process.cwd(), 'data', 'profile_photo.json');

export interface StoredPhotoData {
  photo: string | null;
  isLocked: boolean;
  updatedAt?: string;
}

export function getPermanentPhoto(): StoredPhotoData {
  try {
    if (fs.existsSync(RUNTIME_PHOTO_FILE)) {
      const raw = fs.readFileSync(RUNTIME_PHOTO_FILE, 'utf-8');
      const parsed = JSON.parse(raw || '{}');
      if (parsed && typeof parsed.photo === 'string' && parsed.photo.startsWith('data:image/') && parsed.photo.length > 500) {
        return {
          photo: parsed.photo,
          isLocked: true,
          updatedAt: parsed.updatedAt,
        };
      }
    }

    if (fs.existsSync(WORKSPACE_PHOTO_FILE)) {
      const raw = fs.readFileSync(WORKSPACE_PHOTO_FILE, 'utf-8');
      const parsed = JSON.parse(raw || '{}');
      if (parsed && typeof parsed.photo === 'string' && parsed.photo.startsWith('data:image/') && parsed.photo.length > 500) {
        try {
          fs.writeFileSync(RUNTIME_PHOTO_FILE, JSON.stringify({ ...parsed, isLocked: true }), 'utf-8');
        } catch {
          // ignore
        }
        return {
          photo: parsed.photo,
          isLocked: true,
          updatedAt: parsed.updatedAt,
        };
      }
    }
  } catch (err) {
    console.warn('Error reading permanent photo store:', err);
  }

  return { photo: null, isLocked: false };
}

export function savePermanentPhoto(photoDataUri: string): StoredPhotoData {
  if (!photoDataUri || typeof photoDataUri !== 'string' || !photoDataUri.startsWith('data:image/') || photoDataUri.length < 500) {
    // Never overwrite a valid photo with null or invalid data
    return getPermanentPhoto();
  }

  const record: StoredPhotoData = {
    photo: photoDataUri,
    isLocked: true,
    updatedAt: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(RUNTIME_PHOTO_FILE, JSON.stringify(record), 'utf-8');
  } catch (err) {
    console.warn('Failed to write runtime photo file:', err);
  }

  try {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(WORKSPACE_PHOTO_FILE, JSON.stringify(record), 'utf-8');
  } catch (err) {
    console.warn('Failed to write workspace photo file:', err);
  }

  // Decode base64 and overwrite all static image files and panditImage.ts so it is 100% permanent
  try {
    const commaIdx = photoDataUri.indexOf(',');
    if (commaIdx !== -1) {
      const b64 = photoDataUri.slice(commaIdx + 1);
      const buffer = Buffer.from(b64, 'base64');

      const targetFiles = [
        path.resolve(process.cwd(), 'public', 'FB_IMG_1792320177760.jpg'),
        path.resolve(process.cwd(), 'public', 'pandit-photo.jpg'),
        path.resolve(process.cwd(), 'public', 'pandit-shashank-sharma.jpg'),
        path.resolve(process.cwd(), 'src', 'assets', 'pandit-photo.jpg'),
        path.resolve(process.cwd(), 'dist', 'FB_IMG_1792320177760.jpg'),
        path.resolve(process.cwd(), 'dist', 'pandit-photo.jpg'),
        path.resolve(process.cwd(), 'dist', 'pandit-shashank-sharma.jpg'),
      ];

      for (const file of targetFiles) {
        try {
          const dir = path.dirname(file);
          if (fs.existsSync(dir)) {
            fs.writeFileSync(file, buffer);
          }
        } catch {
          // ignore individual write error
        }
      }

      // Also update app-icon.svg in public/ and dist/ so logo uses this photo
      const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF59D" />
      <stop offset="50%" stop-color="#FFB300" />
      <stop offset="100%" stop-color="#E65100" />
    </linearGradient>
    <clipPath id="circleClip">
      <circle cx="256" cy="256" r="236" />
    </clipPath>
  </defs>
  <circle cx="256" cy="256" r="252" fill="url(#goldRing)" />
  <circle cx="256" cy="256" r="236" fill="#120a04" />
  <image href="${photoDataUri}" x="20" y="20" width="472" height="472" preserveAspectRatio="xMidYMin slice" clip-path="url(#circleClip)" />
  <circle cx="256" cy="256" r="238" fill="none" stroke="url(#goldRing)" stroke-width="10" />
</svg>`;

      const svgTargets = [
        path.resolve(process.cwd(), 'public', 'app-icon.svg'),
        path.resolve(process.cwd(), 'dist', 'app-icon.svg'),
      ];
      for (const svgFile of svgTargets) {
        try {
          if (fs.existsSync(path.dirname(svgFile))) {
            fs.writeFileSync(svgFile, svgIcon, 'utf-8');
          }
        } catch {
          // ignore
        }
      }

      // Update src/data/panditImage.ts so future builds embed this exact photo permanently
      const tsFile = path.resolve(process.cwd(), 'src', 'data', 'panditImage.ts');
      const tsContent = `// Permanent, embedded original photo for Pandit Shashank Sharma (Pandit Ji Online)\nexport const PANDIT_ORIGINAL_PHOTO = ${JSON.stringify(photoDataUri)};\nexport const PANDIT_DEFAULT_LOCKED = true;\n`;
      try {
        fs.writeFileSync(tsFile, tsContent, 'utf-8');
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.warn('Error baking permanent photo to static assets:', err);
  }

  return record;
}
