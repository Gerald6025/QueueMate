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
  X,
  Search,
  BarChart3,
  Shield
} from 'lucide-react';
import { CompanyPortal } from './CompanyPortal';
import { StaffPortal } from './StaffPortal';
import { CustomerPortal } from './CustomerPortal';
import { useQueue } from '@/context/QueueContext';
import { BankIcon, ClinicIcon, TechMartIcon } from './CustomerKiosk';

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
  const [showCompanyPortal, setShowCompanyPortal] = useState(false);
  const [showStaffPortal, setShowStaffPortal] = useState(false);
  const [showCustomerPortal, setShowCustomerPortal] = useState(false);

  useEffect(() => {
    if (initialStep !== undefined) {
      setCurrentStep(initialStep);
      setShowCompanyPortal(false);
      setShowStaffPortal(false);
      setShowCustomerPortal(false);
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
      description: "Join any registered company's queue from your phone — no more standing around.",
      type: 'customers',
      bgClass: 'bg-[#00A843]',
      isDark: false,
      buttonClass: 'bg-[#00A843] hover:bg-[#00963c] active:bg-[#008234]',
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
    if (showCustomerPortal) {
      return (
        <CustomerPortal 
          onBack={() => setShowCustomerPortal(false)}
          onLoginSuccess={(customerData) => {
            if (typeof window !== 'undefined') {
              if (customerData?.name) {
                localStorage.setItem('queuemate_customer_name', customerData.name);
              }
              if (customerData?.phone) {
                localStorage.setItem('queuemate_customer_phone', customerData.phone);
              }
            }
            onComplete('kiosk');
          }}
        />
      );
    }

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
      <div className={`w-full h-[100dvh] max-h-[100dvh] overflow-y-auto flex flex-col justify-center items-center select-none relative transition-colors duration-200 p-4 sm:p-6 ${
        darkMode ? 'bg-[#101927]' : 'bg-[#F4FAF6]'
      }`}>
        {/* Center Content: Logo, Title, Subtitle, 3 Role Cards */}
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center animate-scale-in my-auto">
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
              onClick={() => setShowCustomerPortal(true)}
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
      </div>
    );
  }

  // SCREEN 1: REDESIGNED WELCOME SCREEN (Matches user screenshot)
  if (currentStep === 0) {
    return (
      <div className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden select-none bg-[#00A843] flex flex-col justify-between">
        {/* TOP GREEN SECTION */}
        <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-between p-4 sm:p-5 relative overflow-hidden min-h-0">
          {/* Header Row: Ticket Badge & Skip Button */}
          <div className="w-full flex items-center justify-between z-20">
            {/* Ticket Badge: A001 - Initial Circular Float */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md shadow-emerald-950/10 animate-float-circle-1 cursor-default hover:scale-105 transition-transform">
              <svg 
                className="w-3.5 h-3.5 text-white/95" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              >
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                <path d="M13 5v2" />
                <path d="M13 17v2" />
                <path d="M13 11v2" />
              </svg>
              <span className="text-[12px] font-bold tracking-wide">A001</span>
            </div>

            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="px-4 py-1.5 rounded-full bg-[#005a26]/45 hover:bg-[#005a26]/60 active:scale-95 text-[#013515] font-bold text-[12px] tracking-wide transition-all cursor-pointer shadow-inner"
            >
              Skip
            </button>
          </div>

          {/* Upper-Right Floating Badge: ⏱️ 5 min - Initial Circular Float */}
          <div className="w-full flex justify-end pr-1 z-20 mt-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md shadow-emerald-950/10 animate-float-circle-2 cursor-default hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5 text-white stroke-[2.2]" />
              <span className="text-[12px] font-semibold">5 min</span>
            </div>
          </div>

          {/* Central Hero: Single Circle behind Q, Logo, QueueMate, Slogan */}
          <div className="flex-1 flex flex-col items-center justify-center relative my-auto z-10 py-1 min-h-0">
            {/* Exactly 2 Concentric Radar Circles behind Q */}
            <div className="absolute w-[280px] h-[280px] sm:w-[310px] sm:h-[310px] rounded-full border-[1.5px] border-white/25 pointer-events-none" />
            <div className="absolute w-[185px] h-[185px] sm:w-[205px] sm:h-[205px] rounded-full border-[1.5px] border-white/30 pointer-events-none" />

            {/* White Squircle Logo with Green Q */}
            <div className="w-20 h-20 sm:w-22 sm:h-22 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-3 sm:mb-4 relative z-10 transition-transform duration-300 hover:scale-105">
              <span className="text-[#00A843] font-black text-4xl sm:text-5xl leading-none select-none tracking-tighter font-sans">
                Q
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-center relative z-10">
              QueueMate
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-medium text-white/95 text-center mt-1 sm:mt-1.5 relative z-10 tracking-wide">
              Skip the line, not the service
            </p>
          </div>

          {/* Lower Floating Badges: 👥 12 waiting & ✅ Open - Initial Circular Float */}
          <div className="w-full flex items-center justify-between px-1 z-20 mb-2">
            {/* 12 waiting */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md shadow-emerald-950/10 animate-float-circle-3 cursor-default hover:scale-105 transition-transform">
              <Users className="w-3.5 h-3.5 text-slate-900 fill-slate-900/80" />
              <span className="text-[12px] font-semibold">12 waiting</span>
            </div>

            {/* Open */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md shadow-emerald-950/10 animate-float-circle-4 cursor-default hover:scale-105 transition-transform">
              <div className="w-3.5 h-3.5 rounded-[3px] bg-[#00C853] flex items-center justify-center text-white flex-shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3.5]" />
              </div>
              <span className="text-[12px] font-semibold">Open</span>
            </div>
          </div>
        </div>

        {/* BOTTOM WHITE CARD */}
        <div className="w-full bg-white px-6 pt-5 pb-6 sm:pt-7 sm:pb-8 flex flex-col justify-between flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          <div className="max-w-md mx-auto w-full flex flex-col items-center">
            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-center mb-2">
              Welcome to QueueMate
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-[13.5px] text-slate-500 font-normal text-center leading-relaxed max-w-[290px] sm:max-w-[330px]">
              A smarter way to manage queues. Customers join from anywhere, companies track everything, staff serve efficiently.
            </p>

            {/* Bottom Row: Centered Pagination & Right Action Button */}
            <div className="relative w-full flex items-center justify-center pt-5 sm:pt-6">
              {/* Pagination Dots */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setCurrentStep(0)}
                  aria-label="Go to slide 1"
                  className="w-7 h-2 bg-[#00A843] rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(1)}
                  aria-label="Go to slide 2"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(2)}
                  aria-label="Go to slide 3"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(3)}
                  aria-label="Go to slide 4"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(4)}
                  aria-label="Go to role selection"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
              </div>

              {/* Circular Green Arrow Button on the right */}
              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="absolute right-0 w-11 h-11 bg-[#00A843] hover:bg-[#00963c] active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-700/25 transition-all cursor-pointer group"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: FOR CUSTOMERS (Matches user screenshot)
  if (currentStep === 1) {
    return (
      <div className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden select-none bg-[#00A843] flex flex-col justify-between">
        {/* TOP GREEN SECTION */}
        <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-between p-4 sm:p-5 relative overflow-hidden min-h-0">
          {/* Header Row: Top Bar with Skip Button */}
          <div className="w-full flex items-center justify-end z-20">
            <button
              onClick={handleSkip}
              className="px-4 py-1.5 rounded-full bg-[#005a26]/45 hover:bg-[#005a26]/60 active:scale-95 text-[#013515] font-bold text-[12px] tracking-wide transition-all cursor-pointer shadow-inner"
            >
              Skip
            </button>
          </div>

          {/* Center Mockup Card: Companies Search & Queue list (Matches screenshot exactly) */}
          <div className="flex-1 flex flex-col items-center justify-center my-auto z-10 py-1 min-h-0 w-full">
            <div className="w-[212px] sm:w-[228px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col transition-transform hover:scale-[1.02] duration-200">
              {/* Card Header: Green with Search Icon and Pill Input (flush with top corners, no border) */}
              <div className="bg-[#00A843] px-3.5 pt-3 pb-2.5 flex items-center space-x-2">
                <Search className="w-4 h-4 text-white stroke-[2.8] flex-shrink-0" />
                <div className="h-6 rounded-full bg-[#008c38] flex-1" />
              </div>

              {/* Card Body: 3 Company Items & Join Queue Button */}
              <div className="p-3 sm:p-3.5 space-y-2">
                {/* 1. City Bank */}
                <div className="bg-[#F8FAFC] rounded-2xl px-2.5 py-1.5 sm:py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BankIcon className="w-6 h-6 flex-shrink-0" />
                    <span className="text-[12px] font-bold text-slate-800">
                      City Bank
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D7F5DE] text-[#00A843]">
                    Open
                  </span>
                </div>

                {/* 2. Health Clinic */}
                <div className="bg-[#F8FAFC] rounded-2xl px-2.5 py-1.5 sm:py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ClinicIcon className="w-6 h-6 flex-shrink-0" />
                    <span className="text-[12px] font-bold text-slate-800">
                      Health Clinic
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D7F5DE] text-[#00A843]">
                    Open
                  </span>
                </div>

                {/* 3. TechMart */}
                <div className="bg-[#F8FAFC] rounded-2xl px-2.5 py-1.5 sm:py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TechMartIcon className="w-6 h-6 flex-shrink-0" />
                    <span className="text-[12px] font-bold text-slate-800">
                      TechMart
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-slate-500">
                    Closed
                  </span>
                </div>

                {/* Bottom Join Queue Button */}
                <div className="w-full bg-[#00A843] py-2.5 rounded-2xl text-center text-white font-extrabold text-[12.5px] tracking-wide shadow-md shadow-emerald-700/20 mt-1 cursor-default">
                  Join Queue
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM WHITE CARD */}
        <div className="w-full bg-white px-6 pt-5 pb-5 sm:pt-6 sm:pb-7 flex flex-col justify-between flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          <div className="max-w-md mx-auto w-full flex flex-col">
            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight text-left mb-1">
              For Customers
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal text-left leading-relaxed mb-4">
              Join any registered company’s queue from your phone — no more standing around.
            </p>

            {/* 3 Feature Bullets */}
            <div className="space-y-3 mb-2">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100/70 flex items-center justify-center flex-shrink-0 text-[#00A843]">
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" />
                </div>
                <span className="text-xs sm:text-[13px] font-medium text-slate-700">
                  Search for any registered company
                </span>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100/70 flex items-center justify-center flex-shrink-0 text-[#00A843]">
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                </div>
                <span className="text-xs sm:text-[13px] font-medium text-slate-700">
                  Get your ticket number instantly
                </span>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100/70 flex items-center justify-center flex-shrink-0 text-[#00A843]">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                </div>
                <span className="text-xs sm:text-[13px] font-medium text-slate-700">
                  Track your position in real time
                </span>
              </div>
            </div>

            {/* Bottom Row: Back Button, Pagination Dots, Next Button */}
            <div className="relative w-full flex items-center justify-center pt-4 sm:pt-5">
              {/* Left Circular Back Button */}
              <button
                onClick={handleBack}
                aria-label="Previous slide"
                className="absolute left-0 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
              </button>

              {/* Centered Pagination Dots */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setCurrentStep(0)}
                  aria-label="Go to slide 1"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(1)}
                  aria-label="Go to slide 2"
                  className="w-7 h-2 bg-[#00A843] rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(2)}
                  aria-label="Go to slide 3"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(3)}
                  aria-label="Go to slide 4"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(4)}
                  aria-label="Go to role selection"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
              </div>

              {/* Right Circular Green Next Button */}
              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="absolute right-0 w-10 h-10 sm:w-11 sm:h-11 bg-[#00A843] hover:bg-[#00963c] active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-700/25 transition-all cursor-pointer group"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 3: FOR COMPANIES (Matches user screenshot)
  if (currentStep === 2) {
    return (
      <div className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden select-none bg-[#0B1322] flex flex-col justify-between">
        {/* TOP DARK NAVY SECTION */}
        <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-between p-4 sm:p-5 relative overflow-hidden min-h-0">
          {/* Header Row: Top Bar with Subtle Skip Button */}
          <div className="w-full flex items-center justify-end z-20">
            <button
              onClick={handleSkip}
              className="px-3.5 py-1 rounded-full bg-slate-800/70 hover:bg-slate-700/70 active:scale-95 text-slate-400 hover:text-slate-200 font-medium text-[12px] tracking-wide transition-all cursor-pointer shadow-sm"
            >
              Skip
            </button>
          </div>

          {/* Center Mockup Card: Live Company Queue Dashboard */}
          <div className="flex-1 flex flex-col items-center justify-center my-auto z-10 py-1 min-h-0 w-full">
            <div className="w-[226px] sm:w-[246px] bg-[#162133] rounded-[28px] sm:rounded-[32px] p-3.5 sm:p-4 border border-slate-700/50 shadow-2xl flex flex-col space-y-3 transition-transform hover:scale-[1.02] duration-200">
              {/* Card Header: Green "C" squircle + City Bank + Open pill */}
              <div className="flex items-center justify-between pb-0.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#00C853] flex items-center justify-center text-white font-black text-[13px] flex-shrink-0 shadow-sm">
                    C
                  </div>
                  <span className="text-[13px] font-bold text-white tracking-tight">
                    City Bank
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#0D281E] border border-[#00C853]/40 text-[#00E575]">
                  Open
                </span>
              </div>

              {/* 3 Stat Boxes Row: 12 Waiting, 2 Serving, 8 Done */}
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Waiting */}
                <div className="bg-[#1F2C40] rounded-xl py-2 px-1 text-center flex flex-col items-center justify-center">
                  <span className="text-[#00E575] font-black text-base sm:text-lg leading-none">
                    12
                  </span>
                  <span className="text-slate-400 text-[10px] font-medium mt-1">
                    Waiting
                  </span>
                </div>

                {/* 2. Serving */}
                <div className="bg-[#1F2C40] rounded-xl py-2 px-1 text-center flex flex-col items-center justify-center">
                  <span className="text-[#38BDF8] font-black text-base sm:text-lg leading-none">
                    2
                  </span>
                  <span className="text-slate-400 text-[10px] font-medium mt-1">
                    Serving
                  </span>
                </div>

                {/* 3. Done */}
                <div className="bg-[#1F2C40] rounded-xl py-2 px-1 text-center flex flex-col items-center justify-center">
                  <span className="text-slate-300 font-black text-base sm:text-lg leading-none">
                    8
                  </span>
                  <span className="text-slate-400 text-[10px] font-medium mt-1">
                    Done
                  </span>
                </div>
              </div>

              {/* 2 Live Customer Rows: A001 John D., A002 Sara M. */}
              <div className="space-y-1.5">
                {/* Row 1: A001 John D. - waiting */}
                <div className="bg-[#1F2C40] rounded-xl px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#00E575] font-bold text-[11.5px]">
                      A001
                    </span>
                    <span className="text-slate-100 text-[11.5px] font-medium">
                      John D.
                    </span>
                  </div>
                  <span className="text-[#00E575] text-[10.5px] font-medium">
                    waiting
                  </span>
                </div>

                {/* Row 2: A002 Sara M. - serving */}
                <div className="bg-[#1F2C40] rounded-xl px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#00E575] font-bold text-[11.5px]">
                      A002
                    </span>
                    <span className="text-slate-100 text-[11.5px] font-medium">
                      Sara M.
                    </span>
                  </div>
                  <span className="text-[#38BDF8] text-[10.5px] font-medium">
                    serving
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM WHITE CARD */}
        <div className="w-full bg-white px-6 pt-5 pb-5 sm:pt-6 sm:pb-7 flex flex-col justify-between flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          <div className="max-w-md mx-auto w-full flex flex-col">
            {/* Title */}
            <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight text-left mb-1">
              For Companies
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal text-left leading-relaxed mb-4">
              Register your business, set your hours, and manage everything from a live dashboard.
            </p>

            {/* 3 Feature Bullets with Rounded-Square Squircle Icons */}
            <div className="space-y-3 mb-2">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
                </div>
                <span className="text-xs sm:text-[13px] font-medium text-slate-700">
                  Set working hours and queue time window
                </span>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
                </div>
                <span className="text-xs sm:text-[13px] font-medium text-slate-700">
                  Register staff members with their own login
                </span>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600">
                  <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
                </div>
                <span className="text-xs sm:text-[13px] font-medium text-slate-700">
                  Track queue stats and daily activity
                </span>
              </div>
            </div>

            {/* Bottom Row: Back Button, Pagination Dots, Next Button */}
            <div className="relative w-full flex items-center justify-center pt-4 sm:pt-5">
              {/* Left Circular Back Button */}
              <button
                onClick={handleBack}
                aria-label="Previous slide"
                className="absolute left-0 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
              </button>

              {/* Centered Pagination Dots */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setCurrentStep(0)}
                  aria-label="Go to slide 1"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(1)}
                  aria-label="Go to slide 2"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(2)}
                  aria-label="Go to slide 3"
                  className="w-7 h-2 bg-[#00A843] rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(3)}
                  aria-label="Go to slide 4"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(4)}
                  aria-label="Go to role selection"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
              </div>

              {/* Right Circular Green Next Button */}
              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="absolute right-0 w-10 h-10 sm:w-11 sm:h-11 bg-[#00A843] hover:bg-[#00963c] active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-700/25 transition-all cursor-pointer group"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 4: FOR STAFF (Matches user screenshot)
  if (currentStep === 3) {
    return (
      <div className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden select-none bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#05602B] via-[#073D1E] to-[#0A1616] flex flex-col justify-between">
        {/* TOP FOREST GREEN GRADIENT SECTION */}
        <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-between p-4 sm:p-5 relative overflow-hidden min-h-0">
          {/* Header Row: Top Bar with Subtle Skip Button */}
          <div className="w-full flex items-center justify-end z-20">
            <button
              onClick={handleSkip}
              className="px-3.5 py-1 rounded-full bg-slate-900/40 hover:bg-slate-900/60 active:scale-95 text-slate-400 hover:text-slate-200 font-medium text-[12px] tracking-wide transition-all cursor-pointer shadow-sm"
            >
              Skip
            </button>
          </div>

          {/* Center Mockup Card: Staff Serving Kiosk Card */}
          <div className="flex-1 flex flex-col items-center justify-center my-auto z-10 py-1 min-h-0 w-full">
            <div className="w-[218px] sm:w-[236px] bg-white rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col transition-transform hover:scale-[1.02] duration-200">
              {/* Card Header: Green with "Now Serving", A003, Jane Cooper */}
              <div className="bg-[#00A843] p-3.5 sm:p-4 text-white flex flex-col">
                <span className="text-[11px] sm:text-[11.5px] font-medium text-emerald-100 tracking-wide">
                  Now Serving
                </span>
                <h3 className="text-3xl sm:text-[34px] font-extrabold text-white tracking-tight leading-none mt-1 mb-1">
                  A003
                </h3>
                <span className="text-[12px] sm:text-[13px] font-medium text-emerald-50">
                  Jane Cooper
                </span>
              </div>

              {/* Action Buttons: Complete & Cancel */}
              <div className="p-3 pt-3 bg-white flex items-center space-x-2">
                {/* Complete Button */}
                <button
                  type="button"
                  className="bg-[#00A843] hover:bg-[#00963c] text-white py-2 px-3 rounded-xl flex-1 flex items-center justify-center space-x-1.5 shadow-sm font-bold text-[11.5px] sm:text-[12px] cursor-default transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.8]" />
                  <span>Complete</span>
                </button>

                {/* Cancel Button */}
                <button
                  type="button"
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 px-3 rounded-xl flex-1 flex items-center justify-center font-medium text-[11.5px] sm:text-[12px] cursor-default transition-colors"
                >
                  <span>Cancel</span>
                </button>
              </div>

              {/* Next Up Box */}
              <div className="bg-[#F8FAFC] rounded-2xl p-2.5 mx-3 mb-3 border border-slate-100/90 flex flex-col space-y-1.5">
                <span className="text-[10px] font-medium text-slate-400">
                  Next up
                </span>
                {/* A004 Tom B. */}
                <div className="flex items-center space-x-2 text-[11px] sm:text-[11.5px]">
                  <span className="text-[#00A843] font-bold">A004</span>
                  <span className="text-slate-700 font-medium">Tom B.</span>
                </div>
                {/* A005 Ali R. */}
                <div className="flex items-center space-x-2 text-[11px] sm:text-[11.5px]">
                  <span className="text-[#00A843] font-bold">A005</span>
                  <span className="text-slate-700 font-medium">Ali R.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM WHITE CARD */}
        <div className="w-full bg-white px-6 pt-5 pb-5 sm:pt-6 sm:pb-7 flex flex-col justify-between flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          <div className="max-w-md mx-auto w-full flex flex-col">
            {/* Title */}
            <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight text-left mb-1">
              For Staff
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal text-left leading-relaxed mb-4">
              Log in under your company and manage the queue with a simple, fast interface.
            </p>

            {/* 3 Feature Bullets with Squircle Icons */}
            <div className="space-y-3 mb-2">
              {/* Bullet 1 */}
              <div className="flex items-center space-x-3 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100/70 flex items-center justify-center flex-shrink-0 text-[#00A843]">
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
                </div>
                <span className="text-xs sm:text-[13px] font-medium text-slate-700">
                  See who is next in the queue
                </span>
              </div>

              {/* Bullet 2 */}
              <div className="flex items-center space-x-3 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100/70 flex items-center justify-center flex-shrink-0 text-[#00A843]">
                  <svg 
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <polyline points="16 11 18 13 22 9" />
                  </svg>
                </div>
                <span className="text-xs sm:text-[13px] font-medium text-slate-700">
                  Call, complete, or cancel with one tap
                </span>
              </div>

              {/* Bullet 3 */}
              <div className="flex items-center space-x-3 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100/70 flex items-center justify-center flex-shrink-0 text-[#00A843]">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
                </div>
                <span className="text-xs sm:text-[13px] font-medium text-slate-700">
                  Secure login with your Staff ID and PIN
                </span>
              </div>
            </div>

            {/* Bottom Row: Back Button, Pagination Dots, Next Button */}
            <div className="relative w-full flex items-center justify-center pt-4 sm:pt-5">
              {/* Left Circular Back Button */}
              <button
                onClick={handleBack}
                aria-label="Previous slide"
                className="absolute left-0 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
              </button>

              {/* Centered Pagination Dots */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setCurrentStep(0)}
                  aria-label="Go to slide 1"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(1)}
                  aria-label="Go to slide 2"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(2)}
                  aria-label="Go to slide 3"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(3)}
                  aria-label="Go to slide 4"
                  className="w-7 h-2 bg-[#00A843] rounded-full transition-all duration-300 cursor-pointer"
                />
                <button
                  onClick={() => setCurrentStep(4)}
                  aria-label="Go to role selection"
                  className="w-2 h-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                />
              </div>

              {/* Right Circular Green Next Button */}
              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="absolute right-0 w-10 h-10 sm:w-11 sm:h-11 bg-[#00A843] hover:bg-[#00963c] active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-700/25 transition-all cursor-pointer group"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
