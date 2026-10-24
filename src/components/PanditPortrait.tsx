import React from 'react';
import { PANDIT_ORIGINAL_PHOTO } from '../data/panditImage';

interface PanditPortraitProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
}

export const PanditPortrait: React.FC<PanditPortraitProps> = ({
  size = 'md',
  showBadge = true,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8 sm:w-9 sm:h-9',
    sm: 'w-11 h-11 sm:w-12 sm:h-12',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-20 h-20 sm:w-24 sm:h-24',
    xl: 'w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52',
  };

  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 select-none ${className}`}
      title="आचार्य पण्डित शशांक शर्मा (Pandit Shashank Sharma)"
    >
      {/* Pure Radiant Golden Aura (No dark/black shadow) */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-400 blur-[4px] opacity-80 pointer-events-none" />

      {/* Decorative Pure Gold Ring Border with Warm Golden Glow */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full p-[2px] sm:p-[2.5px] bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.55)] overflow-hidden flex items-center justify-center ring-1 ring-yellow-200/90`}
      >
        {/* Warm Saffron-Gold Inner Frame (Zero black background or seam) */}
        <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center">
          <img
            src={PANDIT_ORIGINAL_PHOTO}
            alt="आचार्य पण्डित शशांक शर्मा (Pandit Shashank Sharma)"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith('/pandit-photo.jpg')) {
                target.src = '/pandit-photo.jpg';
              }
            }}
            className="w-full h-full object-cover object-center scale-[1.04] brightness-[1.03]"
            loading="eager"
          />
        </div>
      </div>

      {/* Verified Acharya Badge (Golden-Cream Border, Zero Black Ring/Shadow) */}
      {showBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black rounded-full shadow-[0_2px_8px_rgba(245,158,11,0.65)] border-2 border-amber-100 flex items-center justify-center ${
            size === 'xs' || size === 'sm'
              ? 'w-4 h-4 text-[8px]'
              : 'w-5 h-5 sm:w-6 sm:h-6 text-[10px]'
          }`}
          title="प्रमाणित वैदिक ज्योतिषाचार्य - पण्डित शशांक शर्मा"
        >
          ✓
        </span>
      )}
    </div>
  );
};
