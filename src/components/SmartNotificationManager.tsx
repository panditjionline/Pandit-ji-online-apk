import React, { useState, useEffect } from 'react';
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  buildPersonalizedDailyNotification,
} from '../utils/smartNotificationService';
import { getPrimaryFamilyProfile } from '../utils/familyVaultStorage';
import { UserMobileAccount } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Bell,
  BellRing,
  User,
  Sparkles,
  CheckCircle2,
  X,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SmartNotificationManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentUser?: UserMobileAccount | null;
}

export const SmartNotificationManager: React.FC<SmartNotificationManagerProps> = ({
  isOpen = false,
  onClose,
  currentUser,
}) => {
  const { tr } = useLanguage();

  const [settings, setSettings] = useState<NotificationSettings>(() => getNotificationSettings());
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [statusMsg, setStatusMsg] = useState<string>('');

  const primaryProfile = getPrimaryFamilyProfile();

  const refreshState = () => {
    const loaded = getNotificationSettings();
    setSettings(loaded);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  useEffect(() => {
    refreshState();

    const handleUpdate = () => refreshState();
    window.addEventListener('panditji_notifications_settings_changed', handleUpdate);
    window.addEventListener('panditji_vault_updated', handleUpdate);
    return () => {
      window.removeEventListener('panditji_notifications_settings_changed', handleUpdate);
      window.removeEventListener('panditji_vault_updated', handleUpdate);
    };
  }, []);

  // Determine active user name to show & greet
  const resolvedUserName =
    settings.userName?.trim() ||
    currentUser?.name?.trim() ||
    primaryProfile?.name?.trim() ||
    'शशांक';

  const handleToggleEnable = async (checked: boolean) => {
    if (checked) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setStatusMsg('कृपया अपने ब्राउज़र/फोन सेटिंग्स में नोटिफिकेशन अनुमति (Allow) चालू करें।');
        setTimeout(() => setStatusMsg(''), 5000);
        return;
      }
      setStatusMsg('✅ दैनिक सूचनाएं चालू कर दी गई हैं! प्रतिदिन प्रातः 07:00 बजे नोटिफिकेशन मिलेगा।');
      setTimeout(() => setStatusMsg(''), 4000);
    }
    const updated = { ...settings, enabled: checked };
    setSettings(updated);
    saveNotificationSettings(updated);
    refreshState();
  };

  const handleUpdateName = (newName: string) => {
    const updated = { ...settings, userName: newName };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  if (!isOpen) return null;

  const preview = buildPersonalizedDailyNotification();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn pt-12 sm:pt-10">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0e1424] border-2 border-amber-500/70 p-5 sm:p-6 shadow-2xl space-y-4 mb-10 sm:mb-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-800/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-yellow-300 border border-amber-500/40">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-vedic text-yellow-200">
                दैनिक सूचनाएं (Daily Notifications)
              </h3>
              <p className="text-[11px] text-amber-300/70">
                प्रतिदिन प्रातःकाल शुभ संदेश व दैनिक पंचांग अलर्ट
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-white border border-amber-700/50 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Status Message Toast */}
        {statusMsg && (
          <div className="p-3 rounded-xl bg-amber-950/90 border border-amber-500/60 text-yellow-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* 1. Main Enable/Disable Toggle */}
        <div className="p-4 rounded-2xl bg-[#131b2e] border border-amber-600/50 flex items-center justify-between gap-3 shadow-md">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-amber-100 flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>दैनिक सूचनाएं चालू करें</span>
            </div>
            <p className="text-[11px] text-amber-300/80 mt-0.5 leading-snug">
              ON करने पर प्रतिदिन सुबह स्वतः आपके फोन पर राशिफल व पंचांग अलर्ट आएगा।
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={settings.enabled && permission === 'granted'}
              onChange={(e) => handleToggleEnable(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-amber-500" />
          </label>
        </div>

        {/* 2. Personalized User Name Input */}
        <div className="p-4 rounded-2xl bg-[#131b2e] border border-amber-700/40 space-y-2">
          <label className="block text-xs font-bold text-amber-200 flex items-center gap-1.5">
            <User className="w-4 h-4 text-amber-400" />
            <span>आपका नाम (सूचना में अभिवादन हेतु)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={settings.userName !== undefined ? settings.userName : resolvedUserName}
              onChange={(e) => handleUpdateName(e.target.value)}
              placeholder="उदा. शशांक"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-600/50 text-xs sm:text-sm font-semibold text-amber-100 focus:outline-none focus:border-amber-400"
            />
            <span className="absolute right-3 top-2.5 text-xs text-amber-400 font-bold">
              ✓ सक्रिय
            </span>
          </div>
          <p className="text-[10px] text-amber-300/70">
            सूचना में सीधे: <b>"🙏 {resolvedUserName} जी, सादर प्रणाम!"</b> लिखकर आएगा।
          </p>
        </div>

        {/* 3. Live Notification Preview */}
        <div className="p-4 rounded-2xl bg-black/70 border border-amber-600/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-300 font-bold border-b border-amber-900/50 pb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>आपके फोन पर ऐसी सूचना दिखेगी:</span>
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono">07:00 AM</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0f172a] border border-amber-500/40 space-y-1 shadow-inner">
            <div className="text-xs sm:text-sm font-bold text-yellow-300 font-vedic">
              🙏 {resolvedUserName} जी, सादर प्रणाम! आज का वैदिक संदेश
            </div>
            <div className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
              ✨ आज का पंचांग, अभिजित मुहूर्त एवं दैनिक राशिफल तैयार है।
              <br />
              ॐ श्री गणेशाय नमः • पण्डित जी ऑनलाइन
            </div>
          </div>
        </div>

        {/* 4. Automatic System Notice */}
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            सूचनाएं प्रतिदिन प्रातः 07:00 बजे सिस्टम द्वारा स्वतः आपके डिवाइस पर भेज दी जायेंगी। आपको खुद से कुछ भेजने की आवश्यकता नहीं है।
          </span>
        </div>

        {/* Footer Actions */}
        {onClose && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              सहेजें एवं बंद करें (Done)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
