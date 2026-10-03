'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2 
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

interface CustomerPortalProps {
  onBack: () => void;
  onLoginSuccess: (customerData?: { phone: string; name?: string }) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ 
  onBack, 
  onLoginSuccess 
}) => {
  const { darkMode } = useQueue();
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setToastMessage('Please enter your phone number');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    setToastMessage(isSignUp ? 'Account created successfully!' : 'Signed in successfully!');
    setTimeout(() => {
      onLoginSuccess({
        phone: phone.trim(),
        name: isSignUp ? fullName.trim() : undefined,
      });
    }, 400);
  };

  return (
    <div className={`fixed inset-0 w-full h-[100dvh] max-h-[100dvh] overflow-hidden overscroll-none flex flex-col justify-between select-none z-50 transition-colors duration-200 ${
      darkMode ? 'bg-[#101927]' : 'bg-[#F4FAF6]'
    }`}>
      <div className="w-full max-w-sm mx-auto flex-1 px-4 pt-3 sm:pt-5 pb-3 sm:pb-5 flex flex-col justify-between overflow-hidden animate-scale-in">
        
        {/* Top Header: Back Button, Green User Circle, Title */}
        <div className="flex items-center space-x-3 mb-4">
          <button
            type="button"
            onClick={onBack}
            className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-2xs transition-colors cursor-pointer ${
              darkMode
                ? 'bg-[#182335] border-slate-700/60 text-slate-300 hover:bg-[#223044]'
                : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
            }`}
            title="Back to role selection"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#00A843] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <User className="w-4 h-4 fill-white" />
            </div>
            <h1 className={`text-[17px] font-bold tracking-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Customer Account
            </h1>
          </div>
        </div>

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="mb-3 animate-scale-in">
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

        {/* Banner Message Card */}
        <div className={`w-full rounded-2xl p-3.5 sm:p-4 shadow-2xs border text-center mb-3 sm:mb-4 transition-colors ${
          darkMode 
            ? 'bg-[#182335] border-slate-700/60' 
            : 'bg-white border-slate-100/90'
        }`}>
          <p className={`text-[12px] sm:text-[13px] font-normal leading-relaxed max-w-[280px] mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-500'
          }`}>
            {isSignUp 
              ? 'Create an account to track your queue history and rejoin faster.'
              : 'Welcome back! Sign in to access your queue history and rejoin faster.'}
          </p>
        </div>

        {/* Segmented Control Tabs: Sign In / Create Account */}
        <div className={`w-full p-1 rounded-2xl flex items-center mb-3 sm:mb-4 transition-colors ${
          darkMode ? 'bg-[#182335] border border-slate-700/50' : 'bg-slate-100/90'
        }`}>
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 sm:py-2.5 rounded-xl font-bold text-[13px] text-center transition-all cursor-pointer ${
              !isSignUp 
                ? 'bg-[#00A843] text-white shadow-sm' 
                : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 sm:py-2.5 rounded-xl font-bold text-[13px] text-center transition-all cursor-pointer ${
              isSignUp 
                ? 'bg-[#00A843] text-white shadow-sm' 
                : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Credentials Form Card */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className={`w-full rounded-3xl p-4 sm:p-5 border shadow-2xs space-y-3 sm:space-y-3.5 transition-colors ${
            darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100/90'
          }`}>
            {/* Full Name Field (Create Account only) */}
            {isSignUp && (
              <div>
                <label className={`block text-[13px] font-semibold mb-1.5 transition-colors ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Full Name
                </label>
                <div className={`flex items-center rounded-xl border px-3.5 py-3 transition-colors ${
                  darkMode 
                    ? 'border-slate-700 bg-[#101927] focus-within:border-[#00A843]' 
                    : 'border-slate-200 bg-white focus-within:border-[#00A843]'
                }`}>
                  <User className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0 stroke-[1.8]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Cooper"
                    className={`w-full text-sm outline-none bg-transparent ${
                      darkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Phone Number Field */}
            <div>
              <label className={`block text-[13px] font-semibold mb-1.5 transition-colors ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Phone Number
              </label>
              <div className={`flex items-center rounded-xl border px-3.5 py-3 transition-colors ${
                darkMode 
                  ? 'border-slate-700 bg-[#101927] focus-within:border-[#00A843]' 
                  : 'border-slate-200 bg-white focus-within:border-[#00A843]'
              }`}>
                <Phone className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0 stroke-[1.8]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0712 345 678"
                  className={`w-full text-sm outline-none bg-transparent ${
                    darkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* PIN Field */}
            <div>
              <label className={`block text-[13px] font-semibold mb-1.5 transition-colors ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>
                PIN
              </label>
              <div className={`flex items-center rounded-xl border px-3.5 py-3 transition-colors ${
                darkMode 
                  ? 'border-slate-700 bg-[#101927] focus-within:border-[#00A843]' 
                  : 'border-slate-200 bg-white focus-within:border-[#00A843]'
              }`}>
                <Lock className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0 stroke-[1.8]" />
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={isSignUp ? 'Create 4-digit PIN' : 'Your PIN'}
                  maxLength={6}
                  className={`w-full text-sm outline-none bg-transparent ${
                    darkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 cursor-pointer"
                >
                  {showPin ? (
                    <EyeOff className="w-4 h-4 stroke-[1.8]" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-[1.8]" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Button: Sign In / Create Account */}
          <button
            type="submit"
            className="w-full bg-[#00A843] hover:bg-[#00963c] active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl shadow-md shadow-emerald-700/20 text-center text-[15px] transition-all cursor-pointer"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          {/* Bottom Switch Link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[13px] text-slate-500 hover:text-[#00A843] transition-colors cursor-pointer font-medium"
            >
              {isSignUp 
                ? 'Already have an account? Sign In →' 
                : "Don't have an account? Create one →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
