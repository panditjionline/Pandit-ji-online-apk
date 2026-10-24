import React from 'react';
import { UserMobileAccount } from '../types';

interface UserAvatarProps {
  currentUser?: UserMobileAccount | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackName?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  currentUser,
  size = 'md',
  className = '',
  fallbackName,
}) => {
  const avatarImg = currentUser?.avatar || currentUser?.profileImage;
  const nameToUse = currentUser?.name || fallbackName || '';
  const initial = nameToUse.trim() ? nameToUse.trim().charAt(0).toUpperCase() : 'ॐ';

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (avatarImg) {
    return (
      <div
        className={`relative rounded-full overflow-hidden border-2 border-amber-400 bg-slate-950 shadow-md flex-shrink-0 flex items-center justify-center ${currentSizeClass} ${className}`}
      >
        <img
          src={avatarImg}
          alt={nameToUse || 'User Avatar'}
          className="w-full h-full object-cover object-center"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-full bg-gradient-to-tr from-[#160b04] via-[#241307] to-[#0f172a] border-2 border-[#d4af37] text-amber-300 font-extrabold font-vedic shadow-md flex items-center justify-center flex-shrink-0 select-none ${currentSizeClass} ${className}`}
      title={nameToUse ? `Yajman: ${nameToUse}` : 'Vedic Yajman'}
    >
      <span className="drop-shadow-sm">{initial}</span>
    </div>
  );
};
