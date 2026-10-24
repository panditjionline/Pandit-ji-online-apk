import React from 'react';
import { Home, Landmark, BookOpen, Flame, Sparkles, History, MessageCircle } from 'lucide-react';

export type MainViewType = 'home' | 'mandir' | 'dharm' | 'jap-mala' | 'jyotish-chat' | 'khata';

interface BottomNavProps {
  setView: (view: MainViewType) => void;
  currentView: string;
  userShortCode?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({
  setView,
  currentView,
  userShortCode = '9979',
}) => {
  const navItems: Array<{
    id: MainViewType;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'home', label: 'मुख्य पृष्ठ', icon: <Home className="w-5 h-5" /> },
    { id: 'mandir', label: 'मंदिर', icon: <Landmark className="w-5 h-5" /> },
    { id: 'dharm', label: 'धर्म ज्ञान', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'jap-mala', label: 'जप माला', icon: <Flame className="w-5 h-5" /> },
    { id: 'jyotish-chat', label: 'ज्योतिष चैट', icon: <Sparkles className="w-5 h-5" /> },
    {
      id: 'khata',
      label: `खाता (${userShortCode.slice(0, 2)}...)`,
      icon: <History className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Floating Pandit Ji Jyotish Chat Pill Button (Bottom Right) */}
      <button
        onClick={() => setView('jyotish-chat')}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2.5 rounded-full border-2 border-amber-400 bg-gradient-to-r from-[#2c1d0b] via-[#1f1508] to-[#2c1d0b] p-1.5 pr-3 shadow-[0_8px_30px_rgba(245,158,11,0.45)] hover:scale-105 active:scale-95 transition-all"
      >
        <div className="relative w-11 h-11 rounded-full border-2 border-amber-400 overflow-hidden shrink-0 bg-amber-900">
          <img
            src="/assets/pandit_shashank.jpg"
            alt="पण्डित शशांक शर्मा"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1f1508]" />
        </div>
        <span className="text-sm font-bold text-white whitespace-nowrap">ज्योतिष चैट</span>
        <span className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-[#1a1105] shadow">
          <MessageCircle className="w-4 h-4 fill-current" />
        </span>
      </button>

      {/* Fixed 6-Item Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0e14]/95 backdrop-blur-md border-t border-amber-500/35 px-2 py-1.5 shadow-[0_-8px_25px_rgba(0,0,0,0.8)]">
        <div className="max-w-2xl mx-auto grid grid-cols-6 gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-b from-amber-500/25 to-amber-600/10 border border-amber-400/60 text-amber-400 shadow-inner'
                    : 'text-[#c2b293] hover:text-amber-300 border border-transparent'
                }`}
              >
                <div className={isActive ? 'text-amber-400' : 'text-amber-400/80'}>
                  {item.icon}
                </div>
                <span
                  className={`text-[10px] sm:text-xs mt-1 whitespace-nowrap truncate max-w-full ${
                    isActive ? 'font-extrabold text-amber-300' : 'font-semibold text-[#d8cbb0]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
