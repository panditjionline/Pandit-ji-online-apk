import React from 'react';
import { Home, Compass, Flame, Sparkles, History, BookOpen, Landmark } from 'lucide-react';
import { UserMobileAccount } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserMobileAccount | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
}) => {
  const { tr } = useLanguage();

  const items = [
    { id: 'home', label: tr('मुख्य पृष्ठ', 'Home', 'Home', 'मुख्य पृष्ठ', 'મુખ્ય પૃષ્ઠ'), icon: Home },
    { id: 'mandir', label: tr('मंदिर', 'Mandir', 'Mandir', 'मंदिर', 'મંદિર'), icon: Landmark },
    { id: 'gyan-kosh', label: tr('धर्म ज्ञान', 'Wisdom', 'Dharm Gyan', 'धर्म ज्ञान', 'ધર્મ જ્ઞાન'), icon: BookOpen },
    { id: 'jaap', label: tr('जप माला', 'Jaap Mala', 'Jaap Mala', 'जप माळ', 'જપ માળા'), icon: Flame },
    { id: 'chat', label: tr('ज्योतिष चैट', 'Jyotish Chat', 'Jyotish Chat', 'ज्योतिष चॅट', 'જ્યોતિષ ચેટ'), icon: Sparkles },
    {
      id: 'history',
      label: currentUser
        ? `${tr('खाता', 'Acct', 'Khata', 'खाते', 'ખાતું')} (${currentUser.phone.slice(-4)})`
        : tr('खाता', 'Account', 'Khata', 'खाते', 'ખાતું'),
      icon: History,
    },
  ];

  return (
    <nav
      aria-label="Mobile Quick Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0b0f19]/95 backdrop-blur-lg border-t border-amber-600/40 shadow-[0_-8px_24px_rgba(0,0,0,0.65)] px-1 py-1"
    >
      <div className="grid grid-cols-6 gap-0.5 max-w-md mx-auto">
        {items.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-w-0 ${
                isActive
                  ? 'bg-gradient-to-b from-amber-500/25 to-amber-500/10 text-yellow-300 border border-amber-400/50 shadow-xs'
                  : 'text-slate-400 hover:text-amber-200'
              }`}
            >
              <IconComponent
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-yellow-400 scale-110' : 'text-amber-400/80'
                } transition-transform`}
              />
              <span
                className={`text-[10px] mt-0.5 leading-tight truncate max-w-full ${
                  isActive ? 'font-extrabold text-yellow-300' : 'font-semibold text-amber-100/80'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
