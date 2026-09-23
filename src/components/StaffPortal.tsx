'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  UserCog, 
  Lock, 
  ChevronDown, 
  Hash, 
  CheckCircle2, 
  Users,
  Sparkles
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

interface StaffPortalProps {
  onBack: () => void;
  onLoginSuccess?: (staffInfo: { name: string; counter: string; company: string }) => void;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({ 
  onBack, 
  onLoginSuccess 
}) => {
  const { darkMode } = useQueue();

  // Form State
  const [selectedCompany, setSelectedCompany] = useState('City Bank');
  const [staffId, setStaffId] = useState('STAFF001');
  const [pin, setPin] = useState('1234');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // As requested: when signing in as staff, don't display anything / don't redirect
  };

  return (
    <div className={`w-full min-h-screen flex flex-col justify-between select-none transition-colors duration-200 ${
      darkMode ? 'bg-[#101927]' : 'bg-[#F4FAF6]'
    }`}>
      {/* Scrollable Main Container */}
      <div className="w-full max-w-sm mx-auto flex-1 px-4 pt-6 pb-6 overflow-y-auto animate-scale-in">
        
        {/* Top Bar with Circle Back Button & Staff Title */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBack}
            className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-2xs transition-colors cursor-pointer ${
              darkMode
                ? 'bg-[#182335] border-slate-700/60 text-slate-300 hover:bg-[#223044]'
                : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
            }`}
            title="Back to role selection"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2">
            <UserCog className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-[#00A843]'}`} />
            <h1 className={`text-[19px] font-bold tracking-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Staff Portal
            </h1>
          </div>
        </div>

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="mb-4 animate-scale-in">
            <div className={`text-xs py-2 px-3.5 rounded-xl flex items-center space-x-2 font-medium border ${
              darkMode 
                ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-200' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Brand Icon Squircle (Matches user screenshot) */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-16 h-16 rounded-3xl bg-[#00A843] flex items-center justify-center shadow-md shadow-emerald-700/20 mb-3">
            {/* User with Cog Icon inside green squircle */}
            <UserCog className="w-8 h-8 text-white stroke-[1.8]" />
          </div>

          <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-normal max-w-[270px] leading-relaxed">
            Log in with your Staff ID and PIN provided by your company admin
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSignIn} className="space-y-4">
          
          {/* Card 1: Select Your Company */}
          <div className={`rounded-3xl p-5 border shadow-2xs transition-colors duration-200 ${
            darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
          }`}>
            <label className={`block text-[13px] font-semibold mb-2.5 transition-colors ${
              darkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>
              Select Your Company
            </label>
            <div className="relative">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none appearance-none font-medium transition-all cursor-pointer ${
                  darkMode 
                    ? 'bg-[#101927] border-slate-700 text-white focus:border-[#00A843]' 
                    : 'bg-white border-slate-200 text-slate-800 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                }`}
              >
                <option value="">— Choose a company —</option>
                <option value="City Bank">City Bank</option>
                <option value="Apex Healthcare">Apex Healthcare</option>
                <option value="Metro Retail">Metro Retail</option>
                <option value="Tech Hub">Tech Hub</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 dark:text-slate-400">
                <ChevronDown className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
          </div>

          {/* Card 2: Staff Credentials */}
          <div className={`rounded-3xl p-5 border shadow-2xs space-y-4 transition-colors duration-200 ${
            darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
          }`}>
            {/* Staff ID */}
            <div>
              <label className={`block text-[13px] font-semibold mb-2 transition-colors ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Staff ID
              </label>
              <div className={`flex items-center rounded-2xl border px-3.5 py-3 transition-all ${
                darkMode 
                  ? 'bg-[#101927] border-slate-700 focus-within:border-[#00A843]' 
                  : 'bg-white border-slate-200 focus-within:border-[#00A843] focus-within:ring-2 focus-within:ring-emerald-500/15'
              }`}>
                <Hash className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  required
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="e.g. STAFF001"
                  className={`w-full bg-transparent text-sm outline-none font-medium placeholder-slate-400 ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* PIN */}
            <div>
              <label className={`block text-[13px] font-semibold mb-2 transition-colors ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>
                PIN
              </label>
              <div className={`flex items-center rounded-2xl border px-3.5 py-3 transition-all ${
                darkMode 
                  ? 'bg-[#101927] border-slate-700 focus-within:border-[#00A843]' 
                  : 'bg-white border-slate-200 focus-within:border-[#00A843] focus-within:ring-2 focus-within:ring-emerald-500/15'
              }`}>
                <Lock className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className={`w-full bg-transparent text-sm outline-none font-medium tracking-widest placeholder-slate-400 ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Sign In Green Button */}
          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full bg-[#00A843] hover:bg-[#00963c] active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl shadow-xs text-sm transition-all duration-150 cursor-pointer"
          >
            {isSigningIn ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Help Text (Matches user screenshot) */}
        <p className="text-[11.5px] sm:text-[12px] text-slate-400 dark:text-slate-500 font-normal text-center mt-4">
          Don&apos;t have credentials? Ask your company admin to register you.
        </p>
      </div>
    </div>
  );
};
