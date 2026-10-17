'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  UserCog,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Users,
  Shield,
  UserPlus
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';
import { StaffMember } from '@/types/queue';
import { StaffDashboardView } from './StaffDashboardView';

interface StaffPortalProps {
  onBack: () => void;
  onLoginSuccess?: (staffInfo: { name: string; counter: string; company: string }) => void;
}

type LoginStep = 'select-business' | 'select-staff' | 'enter-pin';

export const StaffPortal: React.FC<StaffPortalProps> = ({
  onBack,
  onLoginSuccess,
}) => {
  const { darkMode, businesses, staffMembers, addStaffMember, activeStaff, setActiveStaff } = useQueue();

  // Tab mode: Sign In vs Create Account
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Auth session state
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [signedInStaff, setSignedInStaff] = useState<{
    name: string;
    role: string;
    email: string;
    counter: string;
    company: string;
  } | null>(null);

  // Multi-step sign-in flow
  const [step, setStep] = useState<LoginStep>('select-business');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // PIN entry
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Registration form state
  const [regBusinessId, setRegBusinessId] = useState<string>(businesses[0]?.id || 'city-bank');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Counter Staff');
  const [regCounter, setRegCounter] = useState('Counter 1');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Ensure default regBusinessId is valid
  useEffect(() => {
    if (!regBusinessId && businesses.length > 0) {
      setRegBusinessId(businesses[0].id);
    }
  }, [businesses, regBusinessId]);

  // Dynamically update default counter based on existing staff in selected business
  useEffect(() => {
    if (regBusinessId) {
      const count = staffMembers.filter(
        (s) => s.businessId === regBusinessId
      ).length;
      setRegCounter(`Counter ${count + 1}`);
    }
  }, [regBusinessId, staffMembers]);

  // Derived data
  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId) || null,
    [businesses, selectedBusinessId]
  );

  const staffForBusiness = useMemo(
    () =>
      selectedBusinessId
        ? staffMembers.filter(
            (s) =>
              s.businessId === selectedBusinessId ||
              s.businessName?.toLowerCase() === selectedBusiness?.name?.toLowerCase()
          )
        : [],
    [selectedBusinessId, selectedBusiness, staffMembers]
  );

  // ─── handlers ────────────────────────────────────────────────────────────────

  const handleSelectBusiness = (bizId: string) => {
    setSelectedBusinessId(bizId);
    setSelectedStaff(null);
    setPin('');
    setErrorMessage(null);
    setStep('select-staff');
  };

  const handleSelectStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setPin('');
    setErrorMessage(null);
    setStep('enter-pin');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !selectedBusiness) return;
    setIsSigningIn(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsSigningIn(false);

      const validPin = selectedStaff.staffPin
        ? selectedStaff.staffPin === pin
        : pin.length >= 4;

      if (!validPin) {
        setErrorMessage('Incorrect PIN. Please try again.');
        setPin('');
        return;
      }

      const staffInfo = {
        name: selectedStaff.name,
        role: selectedStaff.role || 'Service Operator',
        email: selectedStaff.email || 'operator@queuemate.com',
        counter: selectedStaff.counterName || 'Counter 1',
        company: selectedBusiness.name,
        businessId: selectedBusiness.id,
      };

      setActiveStaff(staffInfo);
      setSignedInStaff(staffInfo);
      setIsSignedIn(true);
      setErrorMessage(null);

      if (onLoginSuccess) onLoginSuccess(staffInfo);
    }, 350);
  };

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regPin || regPin.length < 4) {
      setErrorMessage('PIN must be at least 4 digits.');
      return;
    }
    if (regPin !== regConfirmPin) {
      setErrorMessage('PINs do not match.');
      return;
    }

    const targetBiz =
      businesses.find((b) => b.id === regBusinessId) || businesses[0];
    if (!targetBiz) {
      setErrorMessage('Please select a valid business.');
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    try {
      const existingCount = staffMembers.filter(
        (s) =>
          s.businessId === targetBiz.id ||
          s.businessName?.toLowerCase() === targetBiz.name.toLowerCase()
      ).length;

      const counterToAssign = regCounter.trim() || `Counter ${existingCount + 1}`;
      const emailToUse =
        regEmail.trim() ||
        `${regName.toLowerCase().replace(/\s+/g, '.')}@${targetBiz.id}.com`;

      const newStaff = await addStaffMember({
        businessId: targetBiz.id,
        businessName: targetBiz.name,
        name: regName.trim(),
        email: emailToUse,
        role: regRole.trim() || 'Counter Staff',
        counterName: counterToAssign,
        staffPin: regPin.trim(),
        active: true,
      });

      const staffInfo = {
        name: newStaff.name,
        role: newStaff.role || 'Counter Staff',
        email: newStaff.email,
        counter: newStaff.counterName,
        company: targetBiz.name,
        businessId: targetBiz.id,
      };

      setActiveStaff(staffInfo);
      setSignedInStaff(staffInfo);
      setIsSignedIn(true);

      if (onLoginSuccess) onLoginSuccess(staffInfo);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to create staff account. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const goBack = () => {
    if (authMode === 'register') {
      setAuthMode('signin');
      setErrorMessage(null);
    } else if (step === 'enter-pin') {
      setStep('select-staff');
      setPin('');
      setErrorMessage(null);
    } else if (step === 'select-staff') {
      setStep('select-business');
      setSelectedBusinessId(null);
      setErrorMessage(null);
    } else {
      onBack();
    }
  };

  // ─── Signed-in view ───────────────────────────────────────────────────────────
  if (isSignedIn && signedInStaff) {
    return (
      <StaffDashboardView
        staffName={signedInStaff.name}
        staffRole={signedInStaff.role}
        staffEmail={signedInStaff.email}
        initialCounterName={signedInStaff.counter}
        companyName={signedInStaff.company}
        onSignOut={() => {
          setActiveStaff(null);
          setIsSignedIn(false);
          setSignedInStaff(null);
          setStep('select-business');
          setSelectedBusinessId(null);
          setSelectedStaff(null);
          setPin('');
        }}
        onSwitchRole={onBack}
      />
    );
  }

  // ─── Shared page wrapper ──────────────────────────────────────────────────────
  const card = (content: React.ReactNode) => (
    <div
      className={`w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col select-none transition-colors duration-200 ${
        darkMode ? 'bg-[#101927]' : 'bg-[#F4FAF6]'
      }`}
    >
      {/* Top Header Bar */}
      <div className="w-full max-w-sm mx-auto px-4 pt-6 pb-3 flex-shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={goBack}
            className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-2xs transition-colors cursor-pointer ${
              darkMode
                ? 'bg-[#182335] border-slate-700/60 text-slate-300 hover:bg-[#223044]'
                : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
            }`}
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2">
            <UserCog className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-[#00A843]'}`} />
            <h1
              className={`text-[19px] font-bold tracking-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              Staff Console
            </h1>
          </div>
        </div>
      </div>

      {/* Center Content: Scrollable */}
      <div className="w-full max-w-sm mx-auto flex-1 min-h-0 px-4 pt-1 pb-8 overflow-y-auto overscroll-contain animate-scale-in">
        {/* Auth mode switcher on the top screen */}
        {step === 'select-business' && (
          <div
            className={`w-full p-1 rounded-2xl flex items-center mb-5 transition-colors ${
              darkMode ? 'bg-[#182335] border border-slate-700/50' : 'bg-[#EBF3ED]/80'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-center transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-[#00A843] text-white shadow-xs'
                  : darkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-center transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#00A843] text-white shadow-xs'
                  : darkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {content}
      </div>
    </div>
  );

  // ─── CREATE STAFF ACCOUNT VIEW ──────────────────────────────────────────────
  if (authMode === 'register') {
    return card(
      <>
        {/* Hero icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-[#00A843] flex items-center justify-center shadow-md shadow-emerald-700/20 mb-3">
            <UserPlus className="w-8 h-8 text-white stroke-[1.8]" />
          </div>
          <h2
            className={`text-[17px] font-bold mb-1 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            Register as Staff
          </h2>
          <p className={`text-[13px] leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Create your counter staff profile to operate the console
          </p>
        </div>

        {/* Error toast */}
        {errorMessage && (
          <div className="mb-4 animate-scale-in">
            <div
              className={`text-xs py-2 px-3.5 rounded-xl flex items-center space-x-2 font-medium border ${
                darkMode
                  ? 'bg-rose-950/80 border-rose-700/60 text-rose-200'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleRegisterStaff} className="space-y-3.5">
          <div
            className={`rounded-3xl p-5 border shadow-2xs space-y-3.5 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
            }`}
          >
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Company / Workplace
              </label>
              <select
                value={regBusinessId}
                onChange={(e) => setRegBusinessId(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none cursor-pointer ${
                  darkMode
                    ? 'bg-[#101927] border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.industry})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => {
                  setRegName(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="e.g. minna"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                  darkMode
                    ? 'bg-[#101927] border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="minna@company.com"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                  darkMode
                    ? 'bg-[#101927] border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Role</label>
                <input
                  type="text"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  placeholder="Counter Staff"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    darkMode
                      ? 'bg-[#101927] border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Assigned Counter</label>
                <input
                  type="text"
                  value={regCounter}
                  onChange={(e) => setRegCounter(e.target.value)}
                  placeholder="Counter 1"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    darkMode
                      ? 'bg-[#101927] border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Security PIN (4–8 digits)
              </label>
              <input
                type="password"
                required
                maxLength={8}
                minLength={4}
                value={regPin}
                onChange={(e) => {
                  setRegPin(e.target.value.replace(/\D/g, ''));
                  setErrorMessage(null);
                }}
                placeholder="••••"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-widest outline-none ${
                  darkMode
                    ? 'bg-[#101927] border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Confirm Security PIN
              </label>
              <input
                type="password"
                required
                maxLength={8}
                minLength={4}
                value={regConfirmPin}
                onChange={(e) => {
                  setRegConfirmPin(e.target.value.replace(/\D/g, ''));
                  setErrorMessage(null);
                }}
                placeholder="••••"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-widest outline-none ${
                  darkMode
                    ? 'bg-[#101927] border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating || !regName.trim() || regPin.length < 4}
            className="w-full bg-[#00A843] hover:bg-[#00963c] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl shadow-xs text-sm transition-all duration-150 cursor-pointer flex items-center justify-center space-x-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Staff Account & Enter</span>
              </>
            )}
          </button>
        </form>
      </>
    );
  }

  // ─── STEP 1: Select Business ──────────────────────────────────────────────────
  if (step === 'select-business') {
    return card(
      <>
        {/* Hero icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-[#00A843] flex items-center justify-center shadow-md shadow-emerald-700/20 mb-3">
            <Building2 className="w-8 h-8 text-white stroke-[1.8]" />
          </div>
          <h2
            className={`text-[17px] font-bold mb-1 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            Choose Your Workplace
          </h2>
          <p className={`text-[13px] leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Select the business you work at to see your account
          </p>
        </div>

        {/* Business cards */}
        <div className="space-y-3">
          {businesses.map((biz) => {
            const staffCount = staffMembers.filter(
              (s) =>
                s.businessId === biz.id ||
                s.businessName?.toLowerCase() === biz.name.toLowerCase()
            ).length;

            return (
              <button
                key={biz.id}
                onClick={() => handleSelectBusiness(biz.id)}
                className={`w-full rounded-2xl p-4 border flex items-center justify-between text-left transition-all duration-200 cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${
                  darkMode
                    ? 'bg-[#182335] border-slate-700/60 hover:border-emerald-500'
                    : 'bg-white border-slate-100 hover:border-emerald-300 hover:shadow-md shadow-2xs'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-[#00A843] font-extrabold text-lg ${
                      darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
                    }`}
                  >
                    {biz.name.charAt(0)}
                  </div>
                  <div>
                    <div
                      className={`text-[14px] font-bold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {biz.name}
                    </div>
                    <div className="text-[11.5px] text-slate-400">
                      {biz.industry} · {staffCount} staff member{staffCount !== 1 ? 's' : ''} ({staffCount} counter{staffCount !== 1 ? 's' : ''})
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    darkMode
                      ? 'text-slate-600 group-hover:text-emerald-400'
                      : 'text-slate-300 group-hover:text-emerald-500'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </>
    );
  }

  // ─── STEP 2: Select Staff Account ────────────────────────────────────────────
  if (step === 'select-staff') {
    return card(
      <>
        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-[#00A843] flex items-center justify-center shadow-md shadow-emerald-700/20 mb-3">
            <Users className="w-8 h-8 text-white stroke-[1.8]" />
          </div>
          <h2
            className={`text-[17px] font-bold mb-1 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            {selectedBusiness?.name}
          </h2>
          <p className={`text-[13px] leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Select your account or counter to continue
          </p>
        </div>

        {/* Staff accounts for selected business */}
        {staffForBusiness.length === 0 ? (
          <div
            className={`w-full py-12 rounded-2xl border border-dashed flex flex-col items-center justify-center ${
              darkMode ? 'border-slate-700/80 bg-[#101927]/60' : 'border-slate-200 bg-slate-50/70'
            }`}
          >
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 stroke-[1.4] mb-2" />
            <p className={`text-[13px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              No staff accounts found
            </p>
            <button
              onClick={() => {
                if (selectedBusinessId) setRegBusinessId(selectedBusinessId);
                setAuthMode('register');
              }}
              className="mt-3 text-xs font-bold text-[#00A843] hover:underline cursor-pointer"
            >
              + Create staff account for this workplace
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {staffForBusiness.map((staff) => (
              <button
                key={staff.id}
                onClick={() => handleSelectStaff(staff)}
                className={`w-full rounded-2xl p-4 border flex items-center justify-between text-left transition-all duration-200 cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${
                  darkMode
                    ? 'bg-[#182335] border-slate-700/60 hover:border-emerald-500'
                    : 'bg-white border-slate-100 hover:border-emerald-300 hover:shadow-md shadow-2xs'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-base text-[#00A843] ${
                      darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
                    }`}
                  >
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div
                      className={`text-[14px] font-bold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {staff.name}
                    </div>
                    <div className="text-[11.5px] text-slate-400">
                      {staff.counterName} · {staff.role || 'Counter Staff'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      staff.active
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    {staff.active ? 'Active' : 'Inactive'}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      darkMode
                        ? 'text-slate-600 group-hover:text-emerald-400'
                        : 'text-slate-300 group-hover:text-emerald-500'
                    }`}
                  />
                </div>
              </button>
            ))}

            <button
              onClick={() => {
                if (selectedBusinessId) setRegBusinessId(selectedBusinessId);
                setAuthMode('register');
              }}
              className="w-full py-3 text-center text-xs font-bold text-[#00A843] hover:underline cursor-pointer"
            >
              + Add another staff account
            </button>
          </div>
        )}
      </>
    );
  }

  // ─── STEP 3: Enter PIN ────────────────────────────────────────────────────────
  return card(
    <>
      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-7">
        <div className="w-16 h-16 rounded-3xl bg-[#00A843] flex items-center justify-center shadow-md shadow-emerald-700/20 mb-3 relative">
          <span className="text-white font-extrabold text-2xl leading-none">
            {selectedStaff?.name.charAt(0).toUpperCase()}
          </span>
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-[#182335] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
            <Shield className="w-3.5 h-3.5 text-[#00A843]" />
          </div>
        </div>
        <h2
          className={`text-[17px] font-bold mb-0.5 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
          {selectedStaff?.name}
        </h2>
        <p className={`text-[12.5px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {selectedStaff?.counterName} · {selectedBusiness?.name}
        </p>
      </div>

      {/* Error toast */}
      {errorMessage && (
        <div className="mb-4 animate-scale-in">
          <div
            className={`text-xs py-2 px-3.5 rounded-xl flex items-center space-x-2 font-medium border ${
              darkMode
                ? 'bg-rose-950/80 border-rose-700/60 text-rose-200'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* PIN form */}
      <form onSubmit={handlePinSubmit}>
        <div
          className={`rounded-3xl p-5 border shadow-2xs transition-colors duration-200 mb-4 ${
            darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
          }`}
        >
          <label
            className={`block text-[13px] font-semibold mb-2.5 ${
              darkMode ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            Enter your Security PIN
          </label>
          <div
            className={`flex items-center rounded-2xl border px-3.5 py-3.5 transition-all ${
              darkMode
                ? 'bg-[#101927] border-slate-700 focus-within:border-[#00A843]'
                : 'bg-white border-slate-200 focus-within:border-[#00A843] focus-within:ring-2 focus-within:ring-emerald-500/15'
            }`}
          >
            <Lock className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
            <input
              type={showPin ? 'text' : 'password'}
              required
              maxLength={8}
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="••••"
              className={`w-full bg-transparent text-base outline-none font-mono tracking-[0.35em] placeholder-slate-400 ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-2 cursor-pointer"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* PIN numpad — quick tap entry */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (!key) return;
                if (key === '⌫') {
                  setPin((p) => p.slice(0, -1));
                } else if (pin.length < 8) {
                  setPin((p) => p + key);
                }
                setErrorMessage(null);
              }}
              className={`h-12 rounded-2xl text-base font-semibold transition-all active:scale-95 cursor-pointer ${
                !key
                  ? 'pointer-events-none opacity-0'
                  : key === '⌫'
                  ? darkMode
                    ? 'bg-[#182335] border border-slate-700/60 text-rose-400 hover:bg-rose-900/20'
                    : 'bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 shadow-2xs'
                  : darkMode
                  ? 'bg-[#182335] border border-slate-700/60 text-white hover:border-emerald-500 hover:bg-[#223044]'
                  : 'bg-white border border-slate-200 text-slate-800 hover:border-emerald-400 hover:shadow-md shadow-2xs'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSigningIn || pin.length < 4}
          className="w-full bg-[#00A843] hover:bg-[#00963c] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl shadow-xs text-sm transition-all duration-150 cursor-pointer flex items-center justify-center space-x-2"
        >
          {isSigningIn ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Sign In & Open Station</span>
            </>
          )}
        </button>
      </form>
    </>
  );
};
