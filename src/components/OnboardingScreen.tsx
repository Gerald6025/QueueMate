'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Bell,
  Clock,
  Check,
  CheckCircle2,
  Users,
  Home,
  User,
  Settings,
  Info,
  X
} from 'lucide-react';
import { ProfileView } from './ProfileView';
import { SettingsView } from './SettingsView';
import { AboutView } from './AboutView';
import { CompanyPortal } from './CompanyPortal';
import { StaffPortal } from './StaffPortal';
import { useQueue } from '@/context/QueueContext';

// Exact matching Company / Business Building Icon
export const CompanyIcon: React.FC<{ className?: string; strokeColor?: string }> = ({
  className = 'w-16 h-16',
  strokeColor = '#FFFFFF',
}) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Base line with rounded ends */}
    <line
      x1="8"
      y1="52"
      x2="56"
      y2="52"
      stroke={strokeColor}
      strokeWidth="3.8"
      strokeLinecap="round"
    />
    {/* Left Wing (Arch) */}
    <path
      d="M 13 52 V 28 C 13 24 15 22 17 22 C 19 22 21 24 21 28 V 52"
      stroke={strokeColor}
      strokeWidth="3.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Center Tower (Taller Arch) */}
    <path
      d="M 24 52 V 16 C 24 11 27.5 9 32 9 C 36.5 9 40 11 40 16 V 52"
      stroke={strokeColor}
      strokeWidth="3.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right Wing (Arch) */}
    <path
      d="M 43 52 V 28 C 43 24 45 22 47 22 C 49 22 51 24 51 28 V 52"
      stroke={strokeColor}
      strokeWidth="3.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 3 Horizontal bars inside Center Tower */}
    <line
      x1="28.5"
      y1="21"
      x2="35.5"
      y2="21"
      stroke={strokeColor}
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <line
      x1="28.5"
      y1="30"
      x2="35.5"
      y2="30"
      stroke={strokeColor}
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <line
      x1="28.5"
      y1="39"
      x2="35.5"
      y2="39"
      stroke={strokeColor}
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
);

// Exact matching Customer Icon (Overlapping two persons in emerald green)
export const CustomerIcon: React.FC<{ className?: string; strokeColor?: string }> = ({
  className = 'w-14 h-14',
  strokeColor = '#00A843'
}) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Front Person Head */}
    <circle
      cx="24"
      cy="20"
      r="8.5"
      stroke={strokeColor}
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Front Person Shoulders Arch */}
    <path
      d="M 10 49 C 10 39.5 16 35 24 35 C 32 35 38 39.5 38 49"
      stroke={strokeColor}
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Back Person Head Arc */}
    <path
      d="M 37 13 C 41 14 44 17.5 44 22 C 44 25.5 41.5 28.5 38 29.5"
      stroke={strokeColor}
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Back Person Shoulder Arc */}
    <path
      d="M 41 37 C 45 38.5 48 42.5 48 49"
      stroke={strokeColor}
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Exact matching Staff Icon (Person with left shoulder curve and gear on right)
export const StaffIcon: React.FC<{ className?: string; strokeColor?: string }> = ({
  className = 'w-14 h-14',
  strokeColor = '#101828',
}) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Person Head */}
    <circle
      cx="25"
      cy="19"
      r="8.5"
      stroke={strokeColor}
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Left shoulder and horizontal arm */}
    <path
      d="M 12 48 V 38 C 12 33 16 31 22 31 H 32"
      stroke={strokeColor}
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Gear / Cog Wheel */}
    <circle
      cx="45"
      cy="39"
      r="3.5"
      stroke={strokeColor}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 8 teeth */}
    <path
      d="
        M 45 31.5 v 2.5
        M 45 44 v 2.5
        M 37.5 39 h 2.5
        M 50 39 h 2.5
        M 39.7 33.7 l 1.8 1.8
        M 48.5 42.5 l 1.8 1.8
        M 39.7 44.3 l 1.8 -1.8
        M 48.5 35.5 l 1.8 -1.8
      "
      stroke={strokeColor}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface OnboardingScreenProps {
  onComplete: (role?: 'kiosk' | 'staff' | 'analytics' | 'display') => void;
  initialStep?: number;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ 
  onComplete,
  initialStep = 0
}) => {
  const { darkMode } = useQueue();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'profile' | 'settings' | 'about'>('home');
  const [showCompanyPortal, setShowCompanyPortal] = useState(false);
  const [showStaffPortal, setShowStaffPortal] = useState(false);

  useEffect(() => {
    if (initialStep !== undefined) {
      setCurrentStep(initialStep);
      setActiveNavTab('home');
      setShowCompanyPortal(false);
      setShowStaffPortal(false);
    }
  }, [initialStep]);

  const slides = [
    {
      id: 0,
      title: 'Welcome to Queue Management',
      description: 'A modern solution to manage queues efficiently and keep everyone informed',
      type: 'welcome',
      bgClass: 'bg-[#FAFCFB]',
      isDark: false,
      buttonClass: 'bg-[#101828] hover:bg-[#1a2436] active:bg-[#0b101c]',
      buttonText: 'Next',
    },
    {
      id: 1,
      title: 'For Customers',
      description: 'Join the queue with your name and phone number. Get a ticket number and track your position in real-time.',
      type: 'customers',
      bgClass: 'bg-[#EBF7EE]',
      isDark: false,
      buttonClass: 'bg-[#101828] hover:bg-[#1a2436] active:bg-[#0b101c]',
      buttonText: 'Next',
    },
    {
      id: 2,
      title: 'For Companies',
      description: 'Register your business, set queue hours, and let your staff manage customer flow effortlessly.',
      type: 'companies',
      bgClass: 'bg-[#151E2E]',
      isDark: true,
      buttonClass: 'bg-[#00A843] hover:bg-[#00963c] active:bg-[#008234] shadow-emerald-600/30',
      buttonText: 'Next',
    },
    {
      id: 3,
      title: 'Ready to go?',
      description: 'Choose your role on the next screen to get started.',
      type: 'ready',
      bgClass: 'bg-[#FAFCFB]',
      isDark: false,
      buttonClass: 'bg-[#101828] hover:bg-[#1a2436] active:bg-[#0b101c]',
      buttonText: 'Get Started',
    },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete('kiosk');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < 4) {
      setCurrentStep(4);
    } else {
      onComplete('kiosk');
    }
  };

  const currentSlide = slides[currentStep] || slides[3];

  // SCREEN 5: QUEUEMATE ROLE SELECTOR (Matches user screenshot)
  if (currentStep === 4) {
    if (showCompanyPortal) {
      return (
        <CompanyPortal 
          onBack={() => setShowCompanyPortal(false)}
        />
      );
    }

    if (showStaffPortal) {
      return (
        <StaffPortal 
          onBack={() => setShowStaffPortal(false)}
        />
      );
    }

    return (
      <div className={`w-full min-h-screen flex flex-col justify-between select-none relative transition-colors duration-200 ${
        darkMode ? 'bg-[#101927]' : 'bg-[#F4FAF6]'
      }`}>
        {activeNavTab === 'profile' ? (
          <ProfileView defaultRole="Customer" />
        ) : activeNavTab === 'settings' ? (
          <SettingsView onSwitchRole={() => {
            setCurrentStep(4);
            setActiveNavTab('home');
          }} />
        ) : activeNavTab === 'about' ? (
          <AboutView />
        ) : (
          /* Center Content: Logo, Title, Subtitle, 3 Role Cards */
          <div className="w-full max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-4 py-8 animate-scale-in my-auto">
            {/* Logo: Green Squircle with bold white "Q" */}
            <div className="w-14 h-14 rounded-2xl bg-[#00A843] flex items-center justify-center shadow-md shadow-emerald-700/20 mb-3.5">
              <span className="text-white font-extrabold text-[30px] leading-none select-none font-sans">
                Q
              </span>
            </div>

            {/* App Title */}
            <h1 className={`text-[25px] sm:text-[27px] font-bold tracking-tight mb-1 text-center transition-colors ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              QueueMate
            </h1>

            {/* Subtitle */}
            <p className={`text-[14px] font-normal mb-7 text-center transition-colors ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Choose your role to get started
            </p>

            {/* 3 Role Cards */}
            <div className="w-full space-y-3.5">
              {/* 1. I'm a Customer */}
              <button
                onClick={() => onComplete('kiosk')}
                className={`w-full rounded-2xl p-4 shadow-sm border transition-all duration-200 flex items-center space-x-3.5 text-left cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${
                  darkMode 
                    ? 'bg-[#182335] border-slate-700/60 hover:border-emerald-500' 
                    : 'bg-white border-slate-100 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${
                  darkMode ? 'bg-[#00A843]' : 'bg-[#D7F5DE]'
                }`}>
                  <CustomerIcon className="w-6 h-6" strokeColor={darkMode ? '#FFFFFF' : '#00A843'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={`text-[16px] font-bold leading-tight mb-0.5 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    I&apos;m a Customer
                  </h2>
                  <p className={`text-[12.5px] font-normal leading-snug ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Search companies and join their queue
                  </p>
                </div>
              </button>

              {/* 2. I'm a Company */}
              <button
                onClick={() => setShowCompanyPortal(true)}
                className={`w-full rounded-2xl p-4 shadow-sm border transition-all duration-200 flex items-center space-x-3.5 text-left cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${
                  darkMode 
                    ? 'bg-[#182335] border-slate-700/60 hover:border-slate-500' 
                    : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#151E2E] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-slate-700/50">
                  <CompanyIcon className="w-6 h-6" strokeColor="#FFFFFF" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={`text-[16px] font-bold leading-tight mb-0.5 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    I&apos;m a Company
                  </h2>
                  <p className={`text-[12.5px] font-normal leading-snug ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Register or log in to manage your queue
                  </p>
                </div>
              </button>

              {/* 3. I'm Staff (Highlighted green card) */}
              <button
                onClick={() => setShowStaffPortal(true)}
                className="w-full bg-[#00A843] rounded-2xl p-4 shadow-md shadow-emerald-700/20 hover:bg-[#00963c] transition-all duration-200 flex items-center space-x-3.5 text-left cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#18BA57] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <StaffIcon className="w-6 h-6" strokeColor="#FFFFFF" />
                </div>
                <div className="flex-1 min-w-0 text-white">
                  <h2 className="text-[16px] font-bold text-white leading-tight mb-0.5">
                    I&apos;m Staff
                  </h2>
                  <p className="text-[12.5px] text-emerald-50 font-normal leading-snug">
                    Log in to manage queues and serve customers
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <div className={`w-full py-2 px-6 flex items-center justify-around shadow-sm transition-colors duration-200 ${
          darkMode 
            ? 'bg-[#101927] border-t border-slate-800' 
            : 'bg-white border-t border-slate-100/90'
        }`}>
          {/* Home */}
          <button
            onClick={() => setActiveNavTab('home')}
            className={`cursor-pointer transition-all duration-150 flex flex-col items-center ${activeNavTab === 'home'
                ? 'bg-[#00A843] text-white py-1.5 px-4 rounded-xl shadow-sm'
                : (darkMode ? 'text-slate-400 hover:text-white py-1.5 px-3' : 'text-slate-400 hover:text-slate-600 py-1.5 px-3')
              }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5">Home</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => setActiveNavTab('profile')}
            className={`cursor-pointer transition-all duration-150 flex flex-col items-center ${activeNavTab === 'profile'
                ? 'bg-[#00A843] text-white py-1.5 px-4 rounded-xl shadow-sm'
                : (darkMode ? 'text-slate-400 hover:text-white py-1.5 px-3' : 'text-slate-400 hover:text-slate-600 py-1.5 px-3')
              }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5">Profile</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveNavTab('settings')}
            className={`cursor-pointer transition-all duration-150 flex flex-col items-center ${activeNavTab === 'settings'
                ? 'bg-[#00A843] text-white py-1.5 px-4 rounded-xl shadow-sm'
                : (darkMode ? 'text-slate-400 hover:text-white py-1.5 px-3' : 'text-slate-400 hover:text-slate-600 py-1.5 px-3')
              }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5">Settings</span>
          </button>

          {/* About */}
          <button
            onClick={() => setActiveNavTab('about')}
            className={`cursor-pointer transition-all duration-150 flex flex-col items-center ${activeNavTab === 'about'
                ? 'bg-[#00A843] text-white py-1.5 px-4 rounded-xl shadow-sm'
                : (darkMode ? 'text-slate-400 hover:text-white py-1.5 px-3' : 'text-slate-400 hover:text-slate-600 py-1.5 px-3')
              }`}
          >
            <Info className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5">About</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen transition-colors duration-500 ${currentSlide.bgClass} flex flex-col justify-between select-none py-6 px-4 sm:px-6`}>
      {/* Top Bar with Back and Skip Buttons */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        {currentStep > 0 ? (
          <button
            onClick={handleBack}
            className={`text-[15px] font-medium transition-colors cursor-pointer flex items-center space-x-1 ${currentSlide.isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-700 hover:text-slate-900'
              }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div className="w-12" />
        )}

        <button
          onClick={handleSkip}
          className={`text-[15px] font-medium transition-colors cursor-pointer ${currentSlide.isDark
              ? 'text-slate-300 hover:text-white'
              : 'text-sky-600 hover:text-sky-700'
            }`}
        >
          Skip
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col items-center justify-center px-4 text-center my-auto">
        {/* SCREEN 1: WELCOME SCREEN */}
        {currentStep === 0 && (
          <div className="flex flex-col items-center animate-scale-in">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 relative">
              <svg
                className="w-24 h-24"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 85 45 A 36 36 0 1 1 58 14.5"
                  stroke="#00A843"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 33 49.5 L 45.5 62 L 80 25.5"
                  stroke="#00A843"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="text-[26px] sm:text-[30px] font-bold text-slate-900 tracking-tight leading-snug mb-4">
              {currentSlide.title}
            </h1>

            <p className="text-[15px] sm:text-[16px] text-slate-600 leading-relaxed max-w-[300px]">
              {currentSlide.description}
            </p>
          </div>
        )}

        {/* SCREEN 2: FOR CUSTOMERS */}
        {currentStep === 1 && (
          <div className="w-full flex flex-col items-center animate-scale-in">
            <div className="w-20 h-20 flex items-center justify-center mb-6">
              <CustomerIcon className="w-16 h-16" strokeColor="#00A843" />
            </div>

            <h1 className="text-[26px] sm:text-[30px] font-bold text-slate-900 tracking-tight leading-snug mb-3">
              {currentSlide.title}
            </h1>

            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed max-w-[340px] mb-7">
              {currentSlide.description}
            </p>

            <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-lg shadow-emerald-950/5 border border-emerald-100/60 space-y-4">
              <div className="flex items-center space-x-3.5 text-left">
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-[#00A843]">
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[14px] font-medium text-slate-800">
                  Get your ticket number instantly
                </span>
              </div>

              <div className="flex items-center space-x-3.5 text-left">
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-[#00A843]">
                  <Clock className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[14px] font-medium text-slate-800">
                  See estimated wait time
                </span>
              </div>

              <div className="flex items-center space-x-3.5 text-left">
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-[#00A843]">
                  <Check className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-[14px] font-medium text-slate-800">
                  Track your queue position
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: FOR COMPANIES */}
        {currentStep === 2 && (
          <div className="w-full flex flex-col items-center animate-scale-in">
            <div className="w-20 h-20 flex items-center justify-center mb-6">
              <CompanyIcon className="w-16 h-16" strokeColor="#FFFFFF" />
            </div>

            <h1 className="text-[26px] sm:text-[30px] font-bold text-white tracking-tight leading-snug mb-3">
              {currentSlide.title}
            </h1>

            <p className="text-[14px] sm:text-[15px] text-slate-300 leading-relaxed max-w-[340px] mb-7">
              {currentSlide.description}
            </p>

            <div className="w-full max-w-sm bg-[#1B263B]/90 rounded-3xl p-5 shadow-2xl border border-slate-700/60 space-y-4">
              <div className="flex items-center space-x-3.5 text-left">
                <div className="w-9 h-9 rounded-full bg-[#00A843] flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-emerald-950/20">
                  <Clock className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-[14px] sm:text-[15px] font-medium text-white">
                  Set working and queue hours
                </span>
              </div>

              <div className="flex items-center space-x-3.5 text-left">
                <div className="w-9 h-9 rounded-full bg-[#00A843] flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-emerald-950/20">
                  <Users className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-[14px] font-medium text-white">
                  Register and manage staff
                </span>
              </div>

              <div className="flex items-center space-x-3.5 text-left">
                <div className="w-9 h-9 rounded-full bg-[#00A843] flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-emerald-950/20">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-[14px] font-medium text-white">
                  Control daily customer capacity
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 4: READY TO GO? (Matches user screenshot) */}
        {currentStep === 3 && (
          <div className="w-full flex flex-col items-center animate-scale-in">
            {/* Side-by-Side Dual Icons: Green Customer + Dark Staff */}
            <div className="flex items-center justify-center space-x-6 mb-6">
              <CustomerIcon className="w-14 h-14" strokeColor="#00A843" />
              <StaffIcon className="w-14 h-14" strokeColor="#101828" />
            </div>

            <h1 className="text-[28px] sm:text-[32px] font-bold text-slate-900 tracking-tight leading-snug mb-3">
              {currentSlide.title}
            </h1>

            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed max-w-[320px]">
              {currentSlide.description}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Area: Pagination Dots & Action Buttons */}
      <div className="max-w-md mx-auto w-full flex flex-col items-center pb-4 sm:pb-8">
        {/* Pagination Dots (Shown for onboarding steps 0 to 3) */}
        <div className="flex items-center space-x-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`transition-all duration-300 cursor-pointer ${currentStep === index
                  ? 'w-8 h-2 bg-[#00A843] rounded-full'
                  : currentSlide.isDark
                    ? 'w-2 h-2 bg-slate-600/70 hover:bg-slate-500 rounded-full'
                    : 'w-2 h-2 bg-slate-300/80 hover:bg-slate-400 rounded-full'
                }`}
            />
          ))}
        </div>

        {/* SCREENS 1-4: Action Button ("Next >" or "Get Started >") */}
        <button
          onClick={handleNext}
          className={`w-full max-w-sm ${currentSlide.buttonClass} py-3.5 px-6 rounded-2xl flex items-center justify-center text-white font-semibold text-[15px] tracking-wide shadow-lg transition-all duration-150 cursor-pointer group hover:scale-[1.01] active:scale-[0.98]`}
        >
          <span>{currentSlide.buttonText || 'Next'}</span>
          <ChevronRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
