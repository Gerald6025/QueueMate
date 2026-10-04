'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle2,
  Sparkles,
  Building,
  Briefcase,
  ChevronDown,
  Clock
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

import { CompanyDashboardView } from './CompanyDashboardView';

interface CompanyPortalProps {
  onBack: () => void;
  onLoginSuccess?: (companyName: string) => void;
}

export const CompanyPortal: React.FC<CompanyPortalProps> = ({ 
  onBack,
  onLoginSuccess 
}) => {
  const { darkMode, resetQueues, registerBusiness, businesses } = useQueue();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  
  // Signed In state & company info
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentCompany, setCurrentCompany] = useState({
    name: 'City Bank',
    industry: 'Banking',
    workingHours: '08:00 – 17:00',
    queueWindow: '08:00 – 16:30',
    dailyCapacity: '100',
  });

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('admin@citybank.com');
  const [signInPassword, setSignInPassword] = useState('demo123');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Register State
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regIndustry, setRegIndustry] = useState('Banking');
  const [regDescription, setRegDescription] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [opensAt, setOpensAt] = useState('08:00 AM');
  const [closesAt, setClosesAt] = useState('05:00 PM');
  const [queueOpens, setQueueOpens] = useState('08:00 AM');
  const [queueCloses, setQueueCloses] = useState('04:30 PM');
  const [dailyCapacity, setDailyCapacity] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword.trim()) {
      setToastMessage('Please enter both email and password.');
      return;
    }

    setIsSigningIn(true);

    setTimeout(() => {
      setIsSigningIn(false);
      const cleanEmail = signInEmail.trim().toLowerCase();
      const matched = businesses.find((b) => b.email?.toLowerCase() === cleanEmail);

      if (!matched) {
        setToastMessage('No registered company found with this email. Please register first.');
        return;
      }

      setCurrentCompany({
        name: matched.name,
        industry: matched.industry,
        workingHours: matched.workingHours,
        queueWindow: matched.queueWindow,
        dailyCapacity: matched.dailyCapacity || '100',
      });
      setIsSignedIn(true);
      setToastMessage(null);
      if (onLoginSuccess) {
        onLoginSuccess(matched.name);
      }
    }, 400);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCompanyName || !regEmail || !regPassword) return;

    setIsRegistering(true);
    const formatTime = (t: string) => t.replace(' AM', '').replace(' PM', '').trim();
    const compName = regCompanyName;
    const compInd = regIndustry || 'Banking';
    const workingHours = `${formatTime(opensAt)} – ${formatTime(closesAt)}`;
    const queueWindow = `${formatTime(queueOpens)} – ${formatTime(queueCloses)}`;

    await registerBusiness({
      name: compName,
      industry: compInd,
      description: regDescription || `Full-service ${compInd} operations & queue management.`,
      email: regEmail,
      workingHours,
      queueWindow,
      opensAt,
      closesAt,
      queueOpens,
      queueCloses,
      dailyCapacity: dailyCapacity || '100',
      status: 'Open',
      icon: compInd === 'Healthcare' ? 'clinic' : compInd === 'Retail' ? 'techmart' : 'bank',
    });

    setCurrentCompany({
      name: compName,
      industry: compInd,
      workingHours,
      queueWindow,
      dailyCapacity: dailyCapacity || '100',
    });

    setIsRegistering(false);
    setIsSignedIn(true);
    setToastMessage(null);
    if (onLoginSuccess) {
      onLoginSuccess(compName);
    }
  };

  const fillDemo = () => {
    setSignInEmail('admin@citybank.com');
    setSignInPassword('demo123');
  };

  if (isSignedIn) {
    return (
      <CompanyDashboardView
        companyName={currentCompany.name}
        industry={currentCompany.industry}
        workingHours={currentCompany.workingHours}
        queueWindow={currentCompany.queueWindow}
        dailyCapacity={currentCompany.dailyCapacity}
        onSignOut={() => setIsSignedIn(false)}
        onSwitchRole={onBack}
      />
    );
  }

  return (
    <div className={`w-full min-h-screen flex flex-col justify-between select-none transition-colors duration-200 ${
      darkMode ? 'bg-[#101927]' : 'bg-[#F4FAF6]'
    }`}>
      {/* Scrollable Container */}
      <div className="w-full max-w-sm mx-auto flex-1 px-4 pt-6 pb-6 overflow-y-auto animate-scale-in">
        {/* Top Bar with Circle Back Button and Company Title */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBack}
            className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-2xs transition-colors cursor-pointer ${
              darkMode
                ? 'bg-[#182335] border-slate-700/60 text-slate-300 hover:bg-[#223044]'
                : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
            }`}
            title="Back to roles"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2">
            <Building2 className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-[#00A843]'}`} />
            <h1 className={`text-[19px] font-bold tracking-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Company Portal
            </h1>
          </div>
        </div>

        {/* Toast Feedback */}
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

        {/* Segmented Switcher / Tabs: Sign In vs Register (Matches screenshot) */}
        <div className={`w-full p-1 rounded-2xl flex items-center mb-5 transition-colors ${
          darkMode ? 'bg-[#182335] border border-slate-700/50' : 'bg-slate-100/90'
        }`}>
          {/* Sign In Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-[#00A843] text-white shadow-xs'
                : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            Sign In
          </button>

          {/* Register Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#00A843] text-white shadow-xs'
                : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            Register
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: SIGN IN FORM (Matches user screenshot)                   */}
        {/* ============================================================== */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Form Card */}
            <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border space-y-4 transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
            }`}>
              {/* Email */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Email
                </label>
                <div className={`w-full rounded-xl border px-3.5 py-3 flex items-center space-x-2.5 transition-all ${
                  darkMode 
                    ? 'bg-[#101927] border-slate-700 focus-within:border-[#00A843]' 
                    : 'bg-white border-slate-200 focus-within:border-[#00A843] focus-within:ring-2 focus-within:ring-emerald-500/15'
                }`}>
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="company@email.com"
                    required
                    className={`w-full bg-transparent text-sm outline-none ${
                      darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Password
                </label>
                <div className={`w-full rounded-xl border px-3.5 py-3 flex items-center justify-between transition-all ${
                  darkMode 
                    ? 'bg-[#101927] border-slate-700 focus-within:border-[#00A843]' 
                    : 'bg-white border-slate-200 focus-within:border-[#00A843] focus-within:ring-2 focus-within:ring-emerald-500/15'
                }`}>
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-2">
                    <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full bg-transparent text-sm outline-none ${
                        darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Action Button (Matches green button in screenshot) */}
            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full bg-[#00A843] hover:bg-[#00963c] active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl shadow-sm text-sm transition-all duration-150 cursor-pointer"
            >
              {isSigningIn ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Demo Credentials Footer */}
            <p 
              onClick={fillDemo}
              className="text-[11.5px] text-slate-400 text-center font-normal pt-1 cursor-pointer hover:text-emerald-600 transition-colors"
              title="Click to fill demo credentials"
            >
              Demo credentials: <span className="font-mono text-slate-500 dark:text-slate-400">admin@citybank.com</span> / <span className="font-mono text-slate-500 dark:text-slate-400">demo123</span>
            </p>
          </form>
        )}

        {/* ============================================================== */}
        {/* TAB 2: REGISTER FORM (Matches user screenshot)                 */}
        {/* ============================================================== */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 pb-2">
            {/* Card 1: Company Info */}
            <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border space-y-4 transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
            }`}>
              <h2 className={`text-[16px] font-bold tracking-tight transition-colors ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Company Info
              </h2>

              {/* Company Name * */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  placeholder="Your company name"
                  required
                  className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition-all ${
                    darkMode 
                      ? 'bg-[#101927] border-slate-700 text-white placeholder-slate-500 focus:border-[#00A843]' 
                      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                  }`}
                />
              </div>

              {/* Industry * */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Industry *
                </label>
                <div className="relative">
                  <select
                    value={regIndustry}
                    onChange={(e) => setRegIndustry(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none cursor-pointer appearance-none transition-all ${
                      darkMode 
                        ? 'bg-[#101927] border-slate-700 text-white focus:border-[#00A843]' 
                        : 'bg-white border-slate-200 text-slate-800 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                    }`}
                  >
                    <option value="Banking" className="text-slate-900">Banking</option>
                    <option value="Healthcare" className="text-slate-900">Healthcare</option>
                    <option value="Retail" className="text-slate-900">Retail</option>
                    <option value="Technology" className="text-slate-900">Technology</option>
                    <option value="Government" className="text-slate-900">Government</option>
                    <option value="Other" className="text-slate-900">Other</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700 dark:text-slate-400">
                    <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={regDescription}
                  onChange={(e) => setRegDescription(e.target.value)}
                  placeholder="Brief description of your services..."
                  className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none resize-none transition-all ${
                    darkMode 
                      ? 'bg-[#101927] border-slate-700 text-white placeholder-slate-500 focus:border-[#00A843]' 
                      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                  }`}
                />
              </div>
            </div>

            {/* Card 2: Account */}
            <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border space-y-4 transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
            }`}>
              <h2 className={`text-[16px] font-bold tracking-tight transition-colors ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Account
              </h2>

              {/* Email * */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="admin@company.com"
                  required
                  className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition-all ${
                    darkMode 
                      ? 'bg-[#101927] border-slate-700 text-white placeholder-slate-500 focus:border-[#00A843]' 
                      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                  }`}
                />
              </div>

              {/* Password * */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Password *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Choose a secure password"
                  required
                  className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition-all ${
                    darkMode 
                      ? 'bg-[#101927] border-slate-700 text-white placeholder-slate-500 focus:border-[#00A843]' 
                      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                  }`}
                />
              </div>
            </div>

            {/* Card 3: Working Hours (Matches user screenshot) */}
            <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
            }`}>
              <h2 className={`text-[16px] font-bold tracking-tight mb-0.5 transition-colors ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Working Hours
              </h2>
              <p className="text-[12px] text-slate-400 font-normal mb-3">
                When your business is open
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Opens at */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Opens at
                  </label>
                  <div className={`w-full rounded-xl border px-3 py-2.5 flex items-center justify-between transition-all ${
                    darkMode 
                      ? 'bg-[#101927] border-slate-700 text-white' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <input
                      type="text"
                      value={opensAt}
                      onChange={(e) => setOpensAt(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none font-medium"
                    />
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1.5" />
                  </div>
                </div>

                {/* Closes at */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Closes at
                  </label>
                  <div className={`w-full rounded-xl border px-3 py-2.5 flex items-center justify-between transition-all ${
                    darkMode 
                      ? 'bg-[#101927] border-slate-700 text-white' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <input
                      type="text"
                      value={closesAt}
                      onChange={(e) => setClosesAt(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none font-medium"
                    />
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Queue Time Range (Matches user screenshot) */}
            <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
            }`}>
              <h2 className={`text-[16px] font-bold tracking-tight mb-0.5 transition-colors ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Queue Time Range
              </h2>
              <p className="text-[12px] text-slate-400 font-normal mb-3">
                Customers can only join the queue within this window
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Queue opens */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Queue opens
                  </label>
                  <div className={`w-full rounded-xl border px-3 py-2.5 flex items-center justify-between transition-all ${
                    darkMode 
                      ? 'bg-[#101927] border-slate-700 text-white' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <input
                      type="text"
                      value={queueOpens}
                      onChange={(e) => setQueueOpens(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none font-medium"
                    />
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1.5" />
                  </div>
                </div>

                {/* Queue closes */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Queue closes
                  </label>
                  <div className={`w-full rounded-xl border px-3 py-2.5 flex items-center justify-between transition-all ${
                    darkMode 
                      ? 'bg-[#101927] border-slate-700 text-white' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <input
                      type="text"
                      value={queueCloses}
                      onChange={(e) => setQueueCloses(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none font-medium"
                    />
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: Daily Capacity (Matches user screenshot) */}
            <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center mb-0.5">
                <h2 className={`text-[16px] font-bold tracking-tight transition-colors ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Daily Capacity
                </h2>
                <span className="text-[12px] text-slate-400 font-normal ml-1.5">
                  (optional)
                </span>
              </div>
              <p className="text-[12px] text-slate-400 font-normal mb-3">
                Maximum customers served per day
              </p>

              <input
                type="text"
                value={dailyCapacity}
                onChange={(e) => setDailyCapacity(e.target.value)}
                placeholder="e.g. 100"
                className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition-all ${
                  darkMode 
                    ? 'bg-[#101927] border-slate-700 text-white placeholder-slate-500 focus:border-[#00A843]' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15'
                }`}
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-[#00A843] hover:bg-[#00963c] active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl shadow-sm text-sm transition-all duration-150 cursor-pointer"
            >
              {isRegistering ? 'Registering Company...' : 'Register Company'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
