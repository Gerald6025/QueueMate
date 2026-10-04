'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  AlertCircle
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
  const [confirmPin, setConfirmPin] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      showToast('Please enter your phone number', 'error');
      return;
    }

    if (isSignUp) {
      if (!pin.trim()) {
        showToast('Please create a PIN', 'error');
        return;
      }
      if (pin.length < 4) {
        showToast('PIN must be at least 4 digits', 'error');
        return;
      }
      if (pin !== confirmPin) {
        showToast('PINs do not match. Please verify.', 'error');
        return;
      }
    }

    const savedName = typeof window !== 'undefined' ? localStorage.getItem('queuemate_customer_name') : null;
    const resolvedName = fullName.trim() || savedName || 'Gerry';

    if (isSignUp && fullName.trim()) {
      try {
        localStorage.setItem('queuemate_customer_name', fullName.trim());
      } catch {
        // ignore
      }
    }

    showToast(isSignUp ? 'Account created successfully!' : 'Signed in successfully!', 'success');
    setTimeout(() => {
      onLoginSuccess({
        phone: phone.trim(),
        name: resolvedName,
      });
    }, 400);
  };

  return (
    <div className={`fixed inset-0 w-full h-[100dvh] max-h-[100dvh] overflow-y-auto select-none z-50 transition-colors duration-200 ${
      darkMode ? 'bg-[#101927]' : 'bg-[#F4FAF6]'
    }`}>
      {/* Centered Phone Column */}
      <div className="w-full max-w-[360px] mx-auto px-4 pt-3 sm:pt-5 pb-6 flex flex-col animate-scale-in">
        
        {/* Top Header: Circular Back Button, Green User Circle, Title */}
        <div className="flex items-center space-x-3 mb-5">
          <button
            type="button"
            onClick={onBack}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              darkMode
                ? 'bg-[#182335] text-slate-300 hover:bg-[#223044] border border-slate-700/60'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/50'
            }`}
            title="Back to role selection"
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00A843] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
              <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-white" />
            </div>
            <h1 className={`text-[17px] sm:text-[18px] font-bold tracking-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Customer Account
            </h1>
          </div>
        </div>

        {/* Feedback Toast */}
        {toast && (
          <div className="mb-3 animate-scale-in">
            <div className={`text-xs py-2 px-3.5 rounded-xl flex items-center space-x-2 font-medium border ${
              toast.type === 'error'
                ? darkMode
                  ? 'bg-rose-950/80 border-rose-700/60 text-rose-200'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
                : darkMode 
                  ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-200' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 stroke-[2]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 stroke-[2]" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* 1. Banner Message Card */}
        <div className={`w-full rounded-2xl px-5 py-4 border text-center mb-4 shadow-2xs transition-colors ${
          darkMode 
            ? 'bg-[#182335] border-slate-700/60' 
            : 'bg-white border-slate-100/90'
        }`}>
          <p className={`text-[12.5px] sm:text-[13px] font-normal leading-relaxed max-w-[280px] mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-500'
          }`}>
            {isSignUp 
              ? 'Create an account to track your queue history and rejoin faster.'
              : 'Welcome back! Sign in to access your queue history and rejoin faster.'}
          </p>
        </div>

        {/* 2. Segmented Control Tabs: Sign In / Create Account */}
        <div className={`w-full p-1 rounded-2xl flex items-center mb-4 transition-colors ${
          darkMode ? 'bg-[#182335] border border-slate-700/50' : 'bg-[#EBF3ED]/80'
        }`}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setConfirmPin('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] text-center transition-all cursor-pointer ${
              !isSignUp 
                ? 'bg-[#00A843] text-white shadow-xs' 
                : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setConfirmPin('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-[13px] text-center transition-all cursor-pointer ${
              isSignUp 
                ? 'bg-[#00A843] text-white shadow-xs font-bold' 
                : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 3. Form Card & Action Buttons */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className={`w-full rounded-2xl p-4 sm:p-5 border shadow-2xs space-y-4 transition-colors ${
            darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-200/80'
          }`}>
            {/* Full Name (when Create Account is active) */}
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
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? (
                    <EyeOff className="w-4 h-4 stroke-[1.8]" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-[1.8]" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm PIN Field (Under PIN when Create Account is active) */}
            {isSignUp && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block text-[13px] font-semibold transition-colors ${
                    darkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Confirm PIN
                  </label>
                  {confirmPin.length > 0 && (
                    <span className={`text-[11px] font-medium transition-colors ${
                      pin === confirmPin 
                        ? 'text-emerald-500' 
                        : 'text-rose-500'
                    }`}>
                      {pin === confirmPin ? '✓ PINs match' : 'PINs do not match'}
                    </span>
                  )}
                </div>
                <div className={`flex items-center rounded-xl border px-3.5 py-3 transition-colors ${
                  confirmPin.length > 0 && pin !== confirmPin
                    ? (darkMode ? 'border-rose-500/70 bg-[#101927]' : 'border-rose-300 bg-rose-50/20')
                    : confirmPin.length > 0 && pin === confirmPin
                    ? (darkMode ? 'border-emerald-500/70 bg-[#101927]' : 'border-emerald-300 bg-emerald-50/20')
                    : (darkMode ? 'border-slate-700 bg-[#101927] focus-within:border-[#00A843]' : 'border-slate-200 bg-white focus-within:border-[#00A843]')
                }`}>
                  <Lock className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0 stroke-[1.8]" />
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Confirm your 4-digit PIN"
                    maxLength={6}
                    className={`w-full text-sm outline-none bg-transparent ${
                      darkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 cursor-pointer"
                    title={showConfirmPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showConfirmPin ? (
                      <EyeOff className="w-4 h-4 stroke-[1.8]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[1.8]" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Action Button: Sign In / Create Account */}
          <button
            type="submit"
            className="w-full bg-[#00A843] hover:bg-[#00963c] active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl shadow-md shadow-emerald-700/20 text-center text-[15px] tracking-wide transition-all cursor-pointer"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          {/* 5. Bottom Switch Link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className={`text-[13px] font-medium transition-colors cursor-pointer ${
                darkMode ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-[#00A843]'
              }`}
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
