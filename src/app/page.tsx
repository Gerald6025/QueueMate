'use client';

import React, { useState } from 'react';
import { QueueProvider } from '@/context/QueueContext';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { CustomerKiosk } from '@/components/CustomerKiosk';
import { StaffCounter } from '@/components/StaffCounter';
import { PublicDisplayBoard } from '@/components/PublicDisplayBoard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { 
  Layers, 
  MonitorCheck, 
  Tv, 
  BarChart3, 
  RotateCcw
} from 'lucide-react';

type AppTab = 'onboarding' | 'kiosk' | 'staff' | 'display' | 'analytics';

function MainQueueApp() {
  const [currentTab, setCurrentTab] = useState<AppTab>('onboarding');
  const [onboardingStep, setOnboardingStep] = useState<number>(0);

  const handleOnboardingComplete = (role: AppTab = 'kiosk') => {
    setCurrentTab(role);
  };

  const handleSwitchRole = () => {
    setOnboardingStep(4);
    setCurrentTab('onboarding');
  };

  return (
    <div className={`w-full ${currentTab === 'onboarding' || currentTab === 'kiosk' ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'} selection:bg-emerald-500 selection:text-white`}>
      {/* 1. ONBOARDING & ROLE SELECTOR SCREENS */}
      {currentTab === 'onboarding' && (
        <OnboardingScreen 
          onComplete={handleOnboardingComplete} 
          initialStep={onboardingStep}
        />
      )}

      {/* 2. CUSTOMER EXPERIENCE (Matches user's Join Queue screenshot exactly) */}
      {currentTab === 'kiosk' && (
        <CustomerKiosk 
          onBackToWelcome={() => {
            setOnboardingStep(0);
            setCurrentTab('onboarding');
          }}
          onSwitchRole={handleSwitchRole}
          onSwitchToStaff={() => setCurrentTab('staff')}
        />
      )}

      {/* 3. STAFF & OPERATIONAL TERMINALS (Staff Console, Public TV, Analytics) */}
      {currentTab !== 'onboarding' && currentTab !== 'kiosk' && (
        <div className="w-full min-h-screen bg-slate-950 text-white flex flex-col">
          {/* Operational Header */}
          <div className="w-full bg-slate-900/90 border-b border-slate-800 py-2.5 px-4 flex items-center justify-between sticky top-0 z-40">
            <button
              onClick={handleSwitchRole}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Back to Welcome</span>
            </button>

            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
              <button
                onClick={() => setCurrentTab('kiosk')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 text-slate-400 hover:text-white transition-all cursor-pointer whitespace-nowrap"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Customer App</span>
              </button>

              <button
                onClick={() => setCurrentTab('staff')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === 'staff'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MonitorCheck className="w-3.5 h-3.5" />
                <span>Staff Console</span>
              </button>

              <button
                onClick={() => setCurrentTab('display')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === 'display'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Public TV</span>
              </button>

              <button
                onClick={() => setCurrentTab('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === 'analytics'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>
            </div>
          </div>

          {/* Operational View */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
            {currentTab === 'staff' && <StaffCounter />}
            {currentTab === 'display' && <PublicDisplayBoard />}
            {currentTab === 'analytics' && <AnalyticsDashboard />}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <QueueProvider>
      <MainQueueApp />
    </QueueProvider>
  );
}
