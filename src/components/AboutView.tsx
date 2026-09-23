'use client';

import React from 'react';
import { 
  Users, 
  Clock, 
  Zap, 
  ShieldCheck,
  Shield
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

export const AboutView: React.FC = () => {
  const { darkMode } = useQueue();

  const features = [
    {
      id: 1,
      title: 'Easy Queue Management',
      description: 'Customers can join queues seamlessly with just their name and phone number.',
      icon: Users,
    },
    {
      id: 2,
      title: 'Real-time Updates',
      description: 'Track your position and estimated wait time in real-time.',
      icon: Clock,
    },
    {
      id: 3,
      title: 'Fast & Efficient',
      description: 'Staff can manage queues efficiently with one-tap controls.',
      icon: Zap,
    },
    {
      id: 4,
      title: 'Reliable Service',
      description: 'Built with modern technology to ensure smooth operations.',
      icon: Shield,
    },
  ];

  return (
    <div className={`w-full flex-1 flex flex-col transition-colors duration-200 ${
      darkMode ? 'bg-[#101927]' : 'bg-[#F4FAF6]'
    }`}>
      {/* Scrollable Container */}
      <div className="w-full max-w-sm mx-auto flex-1 px-4 pt-6 pb-4 overflow-y-auto animate-scale-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Logo Squircle with white "Q" */}
          <div className="w-14 h-14 rounded-2xl bg-[#00A843] flex items-center justify-center shadow-md shadow-emerald-700/20 mb-3.5">
            <span className="text-white font-extrabold text-[30px] leading-none select-none font-sans">
              Q
            </span>
          </div>

          {/* Title */}
          <h1 className={`text-[23px] sm:text-[25px] font-bold tracking-tight mb-1 transition-colors duration-200 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Queue Manager
          </h1>

          {/* Subtitle */}
          <p className={`text-[13px] font-normal mb-1 transition-colors duration-200 ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Modern queue management solution
          </p>

          {/* Version */}
          <span className="text-[11.5px] text-slate-400 font-normal">
            Version 1.0.0
          </span>
        </div>

        {/* 4 Feature Cards */}
        <div className="space-y-3 pb-3">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className={`rounded-2xl sm:rounded-3xl p-4 shadow-sm border transition-all duration-200 flex items-start space-x-3.5 ${
                  darkMode 
                    ? 'bg-[#182335] border-slate-700/60' 
                    : 'bg-white border-slate-100'
                }`}
              >
                {/* Circular Icon Badge */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-200 ${
                  darkMode ? 'bg-[#00A843]' : 'bg-[#D7F5DE]'
                }`}>
                  <Icon className={`w-5 h-5 stroke-[2.2] transition-colors duration-200 ${
                    darkMode ? 'text-white' : 'text-[#00A843]'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <h2 className={`text-[15px] font-bold leading-snug mb-1 transition-colors duration-200 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {feat.title}
                  </h2>
                  <p className={`text-[12px] font-normal leading-snug transition-colors duration-200 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. Need Help? Card (Matches user screenshot) */}
        <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border flex flex-col items-center text-center transition-all duration-200 mb-2 ${
          darkMode 
            ? 'bg-[#182335] border-slate-700/60' 
            : 'bg-white border-slate-100'
        }`}>
          <h2 className={`text-[17px] font-bold tracking-tight mb-1 transition-colors duration-200 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Need Help?
          </h2>
          <p className={`text-[12.5px] font-normal leading-relaxed max-w-[240px] mb-4 transition-colors duration-200 ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Contact support for assistance with the queue management system
          </p>

          <a
            href="mailto:support@queuemate.com?subject=Queue%20Management%20Support"
            className="w-full max-w-[200px] bg-[#00A843] hover:bg-[#00963c] active:scale-95 text-white font-semibold text-[13px] py-2.5 px-5 rounded-xl shadow-xs transition-all duration-150 inline-block text-center cursor-pointer"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};
