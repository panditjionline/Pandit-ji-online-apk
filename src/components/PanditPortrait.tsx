import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';

interface PanditPortraitProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
  allowUpload?: boolean;
}

export const PanditPortrait: React.FC<PanditPortraitProps> = ({
  size = 'md',
  showBadge = true,
  className = '',
  allowUpload = false,
}) => {
  // Primary image source: user's uploaded base64 or official public/FB_IMG_1792320177760.jpg
  const [profileImage, setProfileImage] = useState<string>(() => {
    try {
      return localStorage.getItem('pandit_profile_image') || '/FB_IMG_1792320177760.jpg';
    } catch {
      return '/FB_IMG_1792320177760.jpg';
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const updated = localStorage.getItem('pandit_profile_image');
        if (updated) {
          setProfileImage(updated);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('pandit_image_updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('pandit_image_updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawBase64 = reader.result as string;
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 360;
            let w = img.width;
            let h = img.height;
            if (w > h && w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else if (h >= w && h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              const compressed = canvas.toDataURL('image/jpeg', 0.82);
              setProfileImage(compressed);
              localStorage.setItem('pandit_profile_image', compressed);
              window.dispatchEvent(new Event('pandit_image_updated'));
              return;
            }
          } catch {
            // fallback below
          }
          setProfileImage(rawBase64);
        };
        img.src = rawBase64;
      };
      reader.readAsDataURL(file);
    }
  };

  const sizeClasses = {
    xs: 'w-9 h-9 sm:w-10 sm:h-10',
    sm: 'w-11 h-11 sm:w-12 sm:h-12',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-20 h-20 sm:w-24 sm:h-24',
    xl: 'w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52',
  };

  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${className}`}>
      {/* Outer Cosmic Gold Halo */}
      <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 blur-[3px] opacity-75 pointer-events-none" />

      {/* Decorative Gold Ring Border */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-600 shadow-xl overflow-hidden flex items-center justify-center ring-1 ring-amber-300/60`}
      >
        <img
          src={profileImage}
          alt="पण्डित शशांक शर्मा (Pandit Shashank Sharma)"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.includes('FB_IMG')) {
              target.src = '/pandit-shashank-sharma.jpg';
            } else if (target.src.includes('pandit-shashank')) {
              target.src = '/pandit-photo.jpg';
            }
          }}
          className="w-full h-full object-cover object-top rounded-full bg-[#120a04]"
        />
      </div>

      {/* Verified Acharya Badge */}
      {showBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold rounded-full shadow-lg border-2 border-slate-950 flex items-center justify-center ${
            size === 'xs' || size === 'sm'
              ? 'w-4 h-4 text-[8px]'
              : 'w-5 h-5 sm:w-6 sm:h-6 text-[10px]'
          }`}
          title="प्रमाणित वैदिक ज्योतिषाचार्य - पण्डित शशांक शर्मा"
        >
          ✓
        </span>
      )}

      {/* Optional Photo Upload/Change button */}
      {allowUpload && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className={`absolute -bottom-1 -left-1 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 rounded-full shadow-2xl border-2 border-slate-950 cursor-pointer transition-all transform hover:scale-110 flex items-center justify-center ${
              size === 'sm' || size === 'md' ? 'p-1' : 'p-2'
            }`}
            title="अपनी फोटो बदलें या गैलरी से चुनें"
          >
            <Camera className={size === 'sm' || size === 'md' ? 'w-2.5 h-2.5 text-slate-950' : 'w-3.5 h-3.5 text-slate-950'} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
};
