'use client';

import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Users, 
  UserPlus, 
  Settings as SettingsIcon, 
  LogOut, 
  Home, 
  User, 
  Info,
  Clock,
  CheckCircle2,
  PhoneCall,
  RotateCcw,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  QrCode
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';
import { SettingsView } from './SettingsView';
import { ProfileView } from './ProfileView';
import { AboutView } from './AboutView';
import { QRScannerModal } from './QRScannerModal';

interface CompanyDashboardViewProps {
  companyName?: string;
  industry?: string;
  workingHours?: string;
  queueWindow?: string;
  dailyCapacity?: string;
  onSignOut: () => void;
  onSwitchRole?: () => void;
}

export const CompanyDashboardView: React.FC<CompanyDashboardViewProps> = ({
  companyName = 'City Bank',
  industry = 'Banking',
  workingHours = '08:00 – 17:00',
  queueWindow = '08:00 – 16:30',
  dailyCapacity = '100',
  onSignOut,
  onSwitchRole,
}) => {
  const { 
    tickets, 
    counters, 
    businesses,
    staffMembers,
    addStaffMember,
    deleteStaffMember,
    darkMode, 
    callNextTicket, 
    completeTicket, 
    recallTicket 
  } = useQueue();

  const [showQRScanner, setShowQRScanner] = useState(false);

  // Top navigation sub-tabs: Overview, Queue, Staff, Settings
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'queue' | 'staff' | 'settings'>('overview');

  // Bottom navigation tabs: Home, Profile, Settings, About
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'profile' | 'settings' | 'about'>('home');

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffCounter, setNewStaffCounter] = useState('Counter 1');

  // Editable Company Settings (Matches user screenshot)
  const [compName, setCompName] = useState(companyName);
  const [compIndustry, setCompIndustry] = useState(industry);
  const [compDesc, setCompDesc] = useState('Full-service banking for all your personal and business financial needs.');
  const [compOpensAt, setCompOpensAt] = useState('08:00 AM');
  const [compClosesAt, setCompClosesAt] = useState('05:00 PM');
  const [compQueueOpens, setCompQueueOpens] = useState('08:00 AM');
  const [compQueueCloses, setCompQueueCloses] = useState('04:30 PM');
  const [compDailyCapacity, setCompDailyCapacity] = useState(dailyCapacity);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  const currentBiz = businesses.find((b) => b.name.toLowerCase() === compName.toLowerCase() || b.name.toLowerCase() === companyName.toLowerCase()) || businesses[0] || null;

  // Compute live queue statistics SCOPED strictly to THIS business
  const waitingTickets = tickets.filter(
    (t) => t.status === 'waiting' && (!currentBiz || t.businessId === currentBiz.id || t.businessName === currentBiz.name)
  );
  const servingTickets = tickets.filter(
    (t) => t.status === 'serving' && (!currentBiz || t.businessId === currentBiz.id || t.businessName === currentBiz.name)
  );
  const doneTodayTickets = tickets.filter(
    (t) => t.status === 'completed' && (!currentBiz || t.businessId === currentBiz.id || t.businessName === currentBiz.name)
  );
  const currentBizStaff = staffMembers.filter(
    (s) => !currentBiz || s.businessId === currentBiz.id || s.businessName === currentBiz.name
  );
  const activeStaffCount = currentBizStaff.filter((s) => s.active).length;

  return (
    <div className={`w-full min-h-screen flex flex-col justify-between select-none transition-colors duration-200 ${
      darkMode ? 'bg-[#101927]' : 'bg-[#F4FAF6]'
    }`}>
      {/* Content Area */}
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col px-4 pt-4 pb-2 animate-scale-in">
        
        {/* If Bottom Nav is NOT 'home', render other screens */}
        {activeNavTab === 'profile' ? (
          <div className="flex-1 flex flex-col">
            <ProfileView defaultRole="Company Admin" />
          </div>
        ) : activeNavTab === 'settings' ? (
          <div className="flex-1 flex flex-col">
            <SettingsView onSwitchRole={onSwitchRole || onSignOut} />
          </div>
        ) : activeNavTab === 'about' ? (
          <div className="flex-1 flex flex-col">
            <AboutView />
          </div>
        ) : (
          /* HOME: COMPANY DASHBOARD */
          <div className="flex-1 flex flex-col">
            
            {/* TOP HEADER: Company Logo/Name/Industry + Sign out */}
            <div className="flex items-center justify-between pt-1 pb-3">
              {/* Left: Building Icon & Company Info */}
              <div className="flex items-center space-x-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-1.5 border shadow-2xs transition-colors ${
                  darkMode 
                    ? 'bg-[#182335] border-slate-700/80 text-emerald-400' 
                    : 'bg-white border-slate-200/90 text-emerald-600'
                }`}>
                  {/* Detailed Bank/Office Building Icon */}
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="12" height="17" rx="2" fill={darkMode ? "#334155" : "#E2E8F0"} stroke={darkMode ? "#64748B" : "#94A3B8"} strokeWidth="1.5"/>
                    <rect x="13" y="9" width="8" height="12" rx="1.5" fill={darkMode ? "#1E293B" : "#CBD5E1"} stroke={darkMode ? "#64748B" : "#94A3B8"} strokeWidth="1.5"/>
                    <rect x="6" y="7" width="2" height="2" rx="0.5" fill="#38BDF8"/>
                    <rect x="10" y="7" width="2" height="2" rx="0.5" fill="#38BDF8"/>
                    <rect x="6" y="11" width="2" height="2" rx="0.5" fill="#38BDF8"/>
                    <rect x="10" y="11" width="2" height="2" rx="0.5" fill="#38BDF8"/>
                    <rect x="6" y="15" width="2" height="2" rx="0.5" fill="#00A843"/>
                    <rect x="10" y="15" width="2" height="2" rx="0.5" fill="#00A843"/>
                    <rect x="15.5" y="12" width="1.5" height="1.5" rx="0.4" fill="#38BDF8"/>
                    <rect x="18" y="12" width="1.5" height="1.5" rx="0.4" fill="#38BDF8"/>
                    <rect x="15.5" y="15" width="1.5" height="1.5" rx="0.4" fill="#38BDF8"/>
                    <rect x="18" y="15" width="1.5" height="1.5" rx="0.4" fill="#38BDF8"/>
                  </svg>
                </div>
                <div>
                  <h1 className={`text-[15px] sm:text-[16px] font-bold tracking-tight leading-tight ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {compName}
                  </h1>
                  <p className="text-[12px] text-slate-400 font-medium leading-none mt-0.5">
                    {compIndustry}
                  </p>
                </div>
              </div>

              {/* Right: Scan QR & Sign out button */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Scan customer QR code"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR</span>
                </button>
                <button
                  onClick={onSignOut}
                  className={`flex items-center space-x-1.5 text-[13px] font-medium transition-colors cursor-pointer px-2 py-1 rounded-lg ${
                    darkMode 
                      ? 'text-slate-300 hover:text-red-400 hover:bg-red-500/10' 
                      : 'text-slate-700 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title="Sign out of company portal"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>

            {/* TOP SUB-TABS: Overview | Queue | Staff | Settings */}
            <div className={`w-full p-1 rounded-2xl flex items-center justify-between mb-3.5 transition-colors ${
              darkMode ? 'bg-[#182335] border border-slate-700/60' : 'bg-slate-100/90'
            }`}>
              {/* Overview */}
              <button
                type="button"
                onClick={() => setActiveSubTab('overview')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
                  activeSubTab === 'overview'
                    ? 'bg-[#00A843] text-white shadow-xs'
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>

              {/* Queue */}
              <button
                type="button"
                onClick={() => setActiveSubTab('queue')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                  activeSubTab === 'queue'
                    ? 'bg-[#00A843] text-white shadow-xs'
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Queue</span>
              </button>

              {/* Staff */}
              <button
                type="button"
                onClick={() => setActiveSubTab('staff')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                  activeSubTab === 'staff'
                    ? 'bg-[#00A843] text-white shadow-xs'
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Staff</span>
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={() => setActiveSubTab('settings')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                  activeSubTab === 'settings'
                    ? 'bg-[#00A843] text-white shadow-xs'
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeSubTab === 'overview' && (
              <div className="space-y-3.5 animate-scale-in">
                {/* 3 STAT CARDS: Waiting, Serving, Done today */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Card 1: Waiting */}
                  <div className={`rounded-2xl border p-4 text-center shadow-2xs transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-[#182335] border-slate-700/60' 
                      : 'bg-white border-slate-100'
                  }`}>
                    <div className="text-[32px] sm:text-[34px] font-extrabold text-[#00A843] leading-none mb-1">
                      {waitingTickets.length}
                    </div>
                    <div className="text-[12px] font-medium text-slate-400">
                      Waiting
                    </div>
                  </div>

                  {/* Card 2: Serving */}
                  <div className={`rounded-2xl border p-4 text-center shadow-2xs transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-[#182335] border-slate-700/60' 
                      : 'bg-white border-slate-100'
                  }`}>
                    <div className={`text-[32px] sm:text-[34px] font-extrabold leading-none mb-1 ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {servingTickets.length}
                    </div>
                    <div className="text-[12px] font-medium text-slate-400">
                      Serving
                    </div>
                  </div>

                  {/* Card 3: Done today */}
                  <div className={`rounded-2xl border p-4 text-center shadow-2xs transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-[#182335] border-slate-700/60' 
                      : 'bg-white border-slate-100'
                  }`}>
                    <div className={`text-[32px] sm:text-[34px] font-extrabold leading-none mb-1 ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {doneTodayTickets.length}
                    </div>
                    <div className="text-[12px] font-medium text-slate-400">
                      Done today
                    </div>
                  </div>
                </div>

                {/* COMPANY DETAILS CARD */}
                <div className={`rounded-3xl border p-5 shadow-2xs transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-[#182335] border-slate-700/60' 
                    : 'bg-white border-slate-100'
                }`}>
                  <h2 className={`text-[16px] font-bold tracking-tight mb-3.5 transition-colors ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Company Details
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[13px] sm:text-[14px]">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                        Working hours
                      </span>
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {compOpensAt.replace(' AM', '').replace(' PM', '')} – {compClosesAt.replace(' AM', '').replace(' PM', '')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[13px] sm:text-[14px]">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                        Queue window
                      </span>
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {compQueueOpens.replace(' AM', '').replace(' PM', '')} – {compQueueCloses.replace(' AM', '').replace(' PM', '')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[13px] sm:text-[14px]">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                        Daily capacity
                      </span>
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {compDailyCapacity || '100'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[13px] sm:text-[14px]">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                        Active staff
                      </span>
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {activeStaffCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QUEUE TAB: Matches user screenshot exactly */}
            {activeSubTab === 'queue' && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 sm:py-24 text-center animate-scale-in">
                {waitingTickets.length === 0 && servingTickets.length === 0 ? (
                  /* Empty state matching user screenshot */
                  <>
                    <Users className="w-16 h-16 text-slate-400/90 dark:text-slate-500 stroke-[1.5] mb-3.5" />
                    <h2 className={`text-[17px] sm:text-[18px] font-bold tracking-tight mb-1 ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      No customers yet
                    </h2>
                    <p className="text-[13px] sm:text-[14px] text-slate-400 dark:text-slate-400 font-normal">
                      Queue tickets will appear here
                    </p>
                  </>
                ) : (
                  /* If tickets exist */
                  <div className="w-full space-y-2.5 max-h-96 overflow-y-auto text-left">
                    {servingTickets.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                        <div>
                          <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">{t.number} - {t.customerName}</div>
                          <div className="text-[11px] text-slate-400">Serving at Counter 1</div>
                        </div>
                        <button
                          onClick={() => completeTicket(1)}
                          className="bg-[#00A843] text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                        >
                          Complete
                        </button>
                      </div>
                    ))}
                    {waitingTickets.map((t, idx) => (
                      <div key={t.id} className={`flex items-center justify-between p-3 rounded-2xl border ${
                        darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100 shadow-2xs'
                      }`}>
                        <div>
                          <div className={`font-semibold text-xs ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            #{idx + 1} - {t.number} ({t.customerName})
                          </div>
                          <div className="text-[11px] text-slate-400">{t.categoryName}</div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Waiting</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STAFF TAB: Matches user screenshot exactly */}
            {activeSubTab === 'staff' && (
              <div className="flex-1 flex flex-col pt-0.5 animate-scale-in">
                {/* Add Staff Member Green Button (Matches user screenshot) */}
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(true)}
                  className="w-full bg-[#00A843] hover:bg-[#00963c] active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer mb-6"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-[14px]">Add Staff Member</span>
                </button>

                {currentBizStaff.length === 0 ? (
                  /* Empty state matching user screenshot */
                  <div className="flex-1 flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                    <Users className="w-16 h-16 text-slate-400/90 dark:text-slate-500 stroke-[1.5] mb-3.5" />
                    <h2 className={`text-[17px] sm:text-[18px] font-bold tracking-tight mb-1 ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      No staff registered
                    </h2>
                    <p className="text-[13px] sm:text-[14px] text-slate-400 dark:text-slate-400 font-normal">
                      Add staff members to manage queues
                    </p>
                  </div>
                ) : (
                  /* Staff list if staff added */
                  <div className="space-y-2.5">
                    {currentBizStaff.map((staff) => (
                      <div
                        key={staff.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
                          darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#00A843] flex items-center justify-center font-bold text-sm">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                              {staff.name}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {staff.counterName} {staff.email ? `• ${staff.email}` : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteStaffMember(staff.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS SUB-TAB: Matches user screenshot exactly */}
            {activeSubTab === 'settings' && (
              <div className="flex-1 flex flex-col pt-0.5 overflow-y-auto max-h-[calc(100vh-190px)] pr-0.5 space-y-3.5 animate-scale-in">
                
                {/* Toast message if saved */}
                {settingsSavedToast && (
                  <div className="bg-emerald-500 text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center space-x-2 animate-scale-in shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Company settings saved successfully!</span>
                  </div>
                )}

                {/* Card 1: Company Info */}
                <div className={`rounded-3xl p-5 border shadow-2xs transition-colors duration-200 ${
                  darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
                }`}>
                  <h2 className={`text-[16px] font-bold tracking-tight mb-3.5 transition-colors ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Company Info
                  </h2>

                  {/* Company Name */}
                  <div className="mb-3.5">
                    <label className="block text-[12.5px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      placeholder="e.g. City Bank"
                      className={`w-full rounded-2xl border px-3.5 py-3 text-sm font-medium outline-none transition-all ${
                        darkMode 
                          ? 'bg-[#101927] border-slate-700 text-white focus:border-[#00A843]' 
                          : 'bg-white border-slate-200 text-slate-900 focus:border-[#00A843]'
                      }`}
                    />
                  </div>

                  {/* Industry */}
                  <div className="mb-3.5">
                    <label className="block text-[12.5px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      Industry
                    </label>
                    <div className="relative">
                      <select
                        value={compIndustry}
                        onChange={(e) => setCompIndustry(e.target.value)}
                        className={`w-full rounded-2xl border px-3.5 py-3 text-sm font-medium outline-none appearance-none transition-all cursor-pointer ${
                          darkMode 
                            ? 'bg-[#101927] border-slate-700 text-white focus:border-[#00A843]' 
                            : 'bg-white border-slate-200 text-slate-900 focus:border-[#00A843]'
                        }`}
                      >
                        <option value="Banking">Banking</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Retail">Retail</option>
                        <option value="Technology">Technology</option>
                        <option value="Government">Government</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700 dark:text-slate-400">
                        <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[12.5px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={compDesc}
                      onChange={(e) => setCompDesc(e.target.value)}
                      className={`w-full rounded-2xl border px-3.5 py-3 text-sm font-medium outline-none resize-none transition-all ${
                        darkMode 
                          ? 'bg-[#101927] border-slate-700 text-white focus:border-[#00A843]' 
                          : 'bg-white border-slate-200 text-slate-900 focus:border-[#00A843]'
                      }`}
                    />
                  </div>
                </div>

                {/* Card 2: Working Hours */}
                <div className={`rounded-3xl p-5 border shadow-2xs transition-colors duration-200 ${
                  darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
                }`}>
                  <h2 className={`text-[16px] font-bold tracking-tight mb-3.5 transition-colors ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Working Hours
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Opens at */}
                    <div>
                      <label className="block text-[12px] text-slate-400 font-medium mb-1.5">
                        Opens at
                      </label>
                      <div className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 transition-colors ${
                        darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                        <input
                          type="text"
                          value={compOpensAt}
                          onChange={(e) => setCompOpensAt(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none font-medium"
                        />
                        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1.5" />
                      </div>
                    </div>

                    {/* Closes at */}
                    <div>
                      <label className="block text-[12px] text-slate-400 font-medium mb-1.5">
                        Closes at
                      </label>
                      <div className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 transition-colors ${
                        darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                        <input
                          type="text"
                          value={compClosesAt}
                          onChange={(e) => setCompClosesAt(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none font-medium"
                        />
                        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Queue Time Range */}
                <div className={`rounded-3xl p-5 border shadow-2xs transition-colors duration-200 ${
                  darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
                }`}>
                  <h2 className={`text-[16px] font-bold tracking-tight mb-0.5 transition-colors ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Queue Time Range
                  </h2>
                  <p className="text-[12px] text-slate-400 font-normal mb-3">
                    Window during which customers can join the queue
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] text-slate-400 font-medium mb-1.5">
                        Queue opens
                      </label>
                      <div className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 transition-colors ${
                        darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                        <input
                          type="text"
                          value={compQueueOpens}
                          onChange={(e) => setCompQueueOpens(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none font-medium"
                        />
                        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] text-slate-400 font-medium mb-1.5">
                        Queue closes
                      </label>
                      <div className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 transition-colors ${
                        darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                        <input
                          type="text"
                          value={compQueueCloses}
                          onChange={(e) => setCompQueueCloses(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none font-medium"
                        />
                        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4: Daily Capacity (Matches user screenshot) */}
                <div className={`rounded-3xl p-5 border shadow-2xs transition-colors duration-200 ${
                  darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100'
                }`}>
                  <div className="flex items-center mb-3">
                    <h2 className={`text-[16px] font-bold tracking-tight transition-colors ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      Daily Capacity
                    </h2>
                    <span className="text-[12px] text-slate-400 font-normal ml-1.5">
                      (optional)
                    </span>
                  </div>

                  <input
                    type="text"
                    value={compDailyCapacity}
                    onChange={(e) => setCompDailyCapacity(e.target.value)}
                    placeholder="e.g. 100"
                    className={`w-full rounded-2xl border px-3.5 py-3 text-sm outline-none transition-all ${
                      darkMode 
                        ? 'bg-[#101927] border-slate-700 text-white focus:border-[#00A843]' 
                        : 'bg-white border-slate-200 text-slate-900 focus:border-[#00A843]'
                    }`}
                  />
                </div>

                {/* Action Buttons: Save Changes & Sign Out */}
                <div className="space-y-2.5 pb-2">
                  {/* Save Changes Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsSavedToast(true);
                      setTimeout(() => setSettingsSavedToast(false), 3000);
                    }}
                    className="w-full bg-[#00A843] hover:bg-[#00963c] active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl shadow-xs text-sm transition-all duration-150 cursor-pointer"
                  >
                    Save Changes
                  </button>

                  {/* Sign Out Button (Matches user screenshot) */}
                  <button
                    type="button"
                    onClick={onSignOut}
                    className={`w-full py-3.5 rounded-2xl flex items-center justify-center space-x-2 border text-sm font-semibold transition-all duration-150 cursor-pointer active:scale-[0.99] ${
                      darkMode
                        ? 'bg-red-950/25 hover:bg-red-950/45 border-red-900/60 text-red-400'
                        : 'bg-[#FFF5F5] hover:bg-red-100/70 border-red-200/90 text-red-600'
                    }`}
                  >
                    <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION BAR (Matches user screenshot: Home, Profile, Settings, About) */}
      <div className={`w-full border-t transition-colors duration-200 ${
        darkMode ? 'bg-[#101927] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="w-full max-w-sm mx-auto flex items-center justify-around py-2.5 px-4">
          {/* Home Tab */}
          <button
            onClick={() => {
              setActiveNavTab('home');
              setActiveSubTab('overview');
            }}
            className={`cursor-pointer transition-all duration-150 flex flex-col items-center ${
              activeNavTab === 'home'
                ? 'bg-[#00A843] text-white py-1.5 px-5 rounded-2xl shadow-xs'
                : (darkMode ? 'text-slate-400 hover:text-white py-1.5 px-3' : 'text-slate-400 hover:text-slate-700 py-1.5 px-3')
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5">Home</span>
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => setActiveNavTab('profile')}
            className={`cursor-pointer transition-all duration-150 flex flex-col items-center ${
              activeNavTab === 'profile'
                ? 'bg-[#00A843] text-white py-1.5 px-5 rounded-2xl shadow-xs'
                : (darkMode ? 'text-slate-400 hover:text-white py-1.5 px-3' : 'text-slate-400 hover:text-slate-700 py-1.5 px-3')
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5">Profile</span>
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => setActiveNavTab('settings')}
            className={`cursor-pointer transition-all duration-150 flex flex-col items-center ${
              activeNavTab === 'settings'
                ? 'bg-[#00A843] text-white py-1.5 px-5 rounded-2xl shadow-xs'
                : (darkMode ? 'text-slate-400 hover:text-white py-1.5 px-3' : 'text-slate-400 hover:text-slate-700 py-1.5 px-3')
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5">Settings</span>
          </button>

          {/* About Tab */}
          <button
            onClick={() => setActiveNavTab('about')}
            className={`cursor-pointer transition-all duration-150 flex flex-col items-center ${
              activeNavTab === 'about'
                ? 'bg-[#00A843] text-white py-1.5 px-5 rounded-2xl shadow-xs'
                : (darkMode ? 'text-slate-400 hover:text-white py-1.5 px-3' : 'text-slate-400 hover:text-slate-700 py-1.5 px-3')
            }`}
          >
            <Info className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5">About</span>
          </button>
        </div>
      </div>

      {/* ADD STAFF MEMBER MODAL */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border ${
            darkMode ? 'bg-[#182335] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'
          } animate-scale-in`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Add New Staff Member</h3>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newStaffName.trim()) return;
                if (currentBiz) {
                  await addStaffMember({
                    businessId: currentBiz.id,
                    businessName: currentBiz.name,
                    name: newStaffName.trim(),
                    email: newStaffEmail.trim() || `${newStaffName.toLowerCase().replace(/\s+/g, '.')}@${currentBiz.id}.com`,
                    counterName: newStaffCounter,
                    role: 'Counter Staff',
                    staffPin: '1234',
                    active: true,
                  });
                }
                setNewStaffName('');
                setNewStaffEmail('');
                setShowAddStaffModal(false);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="elena@citybank.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Counter</label>
                <select
                  value={newStaffCounter}
                  onChange={(e) => setNewStaffCounter(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="Counter 1">Counter 1</option>
                  <option value="Counter 2">Counter 2</option>
                  <option value="Counter 3">Counter 3</option>
                  <option value="Counter 4 (VIP)">Counter 4 (VIP)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#00A843] hover:bg-[#00963c] text-white font-bold py-3 rounded-xl text-sm transition-colors mt-2 cursor-pointer"
              >
                Confirm & Add
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Modal for verifying arriving customers */}
      {showQRScanner && (
        <QRScannerModal
          business={currentBiz}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
};
