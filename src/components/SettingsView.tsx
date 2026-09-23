'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  Sun, 
  Moon,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

interface SettingsViewProps {
  onSwitchRole?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSwitchRole }) => {
  const { soundEnabled, setSoundEnabled, darkMode, setDarkMode } = useQueue();
  const [notifications, setNotifications] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load notifications preference from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifs = localStorage.getItem('queuemate_setting_notifications');
      if (savedNotifs !== null) setNotifications(savedNotifs === 'true');
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleToggleNotifications = () => {
    const nextVal = !notifications;
    setNotifications(nextVal);
    try {
      localStorage.setItem('queuemate_setting_notifications', String(nextVal));
    } catch {}
    showToast(nextVal ? 'Notifications enabled' : 'Notifications muted');
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    try {
      localStorage.setItem('queuemate_setting_sound', String(nextVal));
    } catch {}
    showToast(nextVal ? 'Sound effects enabled' : 'Sound effects muted');
  };

  const handleToggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    showToast(nextVal ? 'Dark theme enabled' : 'Light theme enabled');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 1800);
  };

  return (
    <div className={`w-full flex-1 flex flex-col transition-colors duration-200 ${
      darkMode ? 'bg-[#101927]' : 'bg-[#F4FAF6]'
    }`}>
      {/* Header */}
      <div className="w-full max-w-sm mx-auto pt-7 px-4 pb-3">
        <h1 className={`text-[24px] font-bold tracking-tight leading-tight transition-colors duration-200 ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>
          Settings
        </h1>
        <p className={`text-[13px] font-normal mt-0.5 transition-colors duration-200 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Customize your experience
        </p>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="w-full max-w-sm mx-auto px-4 mb-2">
          <div className={`text-xs py-1.5 px-3 rounded-xl flex items-center space-x-1.5 font-medium animate-scale-in border transition-colors ${
            darkMode 
              ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-200' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Settings Cards List */}
      <div className="w-full max-w-sm mx-auto flex-1 px-4 space-y-3.5 pb-4 overflow-y-auto">
        {/* Card 1: Notifications */}
        <div className={`rounded-3xl p-4 shadow-sm border flex items-center justify-between transition-all duration-200 ${
          darkMode 
            ? 'bg-[#182335] border-slate-700/60' 
            : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            {/* Badge: Solid green in dark mode, light mint in light mode */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
              darkMode ? 'bg-[#00A843]' : 'bg-[#D7F5DE]'
            }`}>
              <Bell className={`w-5 h-5 stroke-[2.2] transition-colors duration-200 ${
                darkMode ? 'text-white' : 'text-[#00A843]'
              }`} />
            </div>
            <div className="min-w-0">
              <h2 className={`text-[15px] font-bold leading-snug transition-colors duration-200 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Notifications
              </h2>
              <p className={`text-[12px] font-normal leading-tight mt-0.5 transition-colors duration-200 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Get notified when your turn is near
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={handleToggleNotifications}
            className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer flex items-center flex-shrink-0 ${
              notifications 
                ? 'bg-[#00A843] justify-end' 
                : (darkMode ? 'bg-slate-700 justify-start' : 'bg-slate-300 justify-start')
            }`}
            aria-label="Toggle Notifications"
          >
            <span className="w-6 h-6 rounded-full bg-white shadow-md block transition-transform transform" />
          </button>
        </div>

        {/* Card 2: Sound Effects */}
        <div className={`rounded-3xl p-4 shadow-sm border flex items-center justify-between transition-all duration-200 ${
          darkMode 
            ? 'bg-[#182335] border-slate-700/60' 
            : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            {/* Badge: Solid green in dark mode, light mint in light mode */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
              darkMode ? 'bg-[#00A843]' : 'bg-[#D7F5DE]'
            }`}>
              <Volume2 className={`w-5 h-5 stroke-[2.2] transition-colors duration-200 ${
                darkMode ? 'text-white' : 'text-[#00A843]'
              }`} />
            </div>
            <div className="min-w-0">
              <h2 className={`text-[15px] font-bold leading-snug transition-colors duration-200 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Sound Effects
              </h2>
              <p className={`text-[12px] font-normal leading-tight mt-0.5 transition-colors duration-200 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Play sounds for notifications
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer flex items-center flex-shrink-0 ${
              soundEnabled 
                ? 'bg-[#00A843] justify-end' 
                : (darkMode ? 'bg-slate-700 justify-start' : 'bg-slate-300 justify-start')
            }`}
            aria-label="Toggle Sound Effects"
          >
            <span className="w-6 h-6 rounded-full bg-white shadow-md block transition-transform transform" />
          </button>
        </div>

        {/* Card 3: Dark Mode (Shows Moon when dark, Sun when light) */}
        <div className={`rounded-3xl p-4 shadow-sm border flex items-center justify-between transition-all duration-200 ${
          darkMode 
            ? 'bg-[#182335] border-slate-700/60' 
            : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            {/* Badge: Solid green with white Moon in dark mode, light mint with green Sun in light mode */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
              darkMode ? 'bg-[#00A843]' : 'bg-[#D7F5DE]'
            }`}>
              {darkMode ? (
                <Moon className="w-5 h-5 text-white stroke-[2.2]" />
              ) : (
                <Sun className="w-5 h-5 text-[#00A843] stroke-[2.2]" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className={`text-[15px] font-bold leading-snug transition-colors duration-200 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Dark Mode
              </h2>
              <p className={`text-[12px] font-normal leading-tight mt-0.5 transition-colors duration-200 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Toggle dark theme
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={handleToggleDarkMode}
            className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer flex items-center flex-shrink-0 ${
              darkMode 
                ? 'bg-[#00A843] justify-end' 
                : 'bg-slate-300 justify-start'
            }`}
            aria-label="Toggle Dark Mode"
          >
            <span className="w-6 h-6 rounded-full bg-white shadow-md block transition-transform transform" />
          </button>
        </div>

        {/* Card 4: Switch Role */}
        <div className={`rounded-3xl p-4 shadow-sm border flex items-center justify-between transition-all duration-200 ${
          darkMode 
            ? 'bg-[#182335] border-slate-700/60' 
            : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            {/* Badge: Solid red with white Logout in dark mode, light red in light mode */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
              darkMode ? 'bg-[#D90429]' : 'bg-[#FEE2E2]'
            }`}>
              <LogOut className={`w-5 h-5 stroke-[2.2] transition-colors duration-200 ${
                darkMode ? 'text-white' : 'text-[#D90429]'
              }`} />
            </div>
            <div className="min-w-0">
              <h2 className={`text-[15px] font-bold leading-snug transition-colors duration-200 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Switch Role
              </h2>
              <p className={`text-[12px] font-normal leading-tight mt-0.5 transition-colors duration-200 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Sign out and choose a different role
              </p>
            </div>
          </div>

          {/* Switch Action Button (Red) */}
          <button
            type="button"
            onClick={onSwitchRole}
            className="px-5 py-2 rounded-xl bg-[#D90429] hover:bg-[#b80323] active:scale-95 text-white font-semibold text-xs tracking-wide transition-all shadow-xs cursor-pointer flex-shrink-0"
          >
            Switch
          </button>
        </div>
      </div>
    </div>
  );
};
