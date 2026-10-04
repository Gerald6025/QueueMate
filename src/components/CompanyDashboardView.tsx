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
  AlertCircle,
  PhoneCall,
  RotateCcw,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  QrCode,
  ArrowLeft,
  TrendingUp,
  Mail,
  Pencil
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';
import { Ticket } from '@/types/queue';
import { SettingsView } from './SettingsView';
import { ProfileView } from './ProfileView';
import { AboutView } from './AboutView';
import { QRScannerModal } from './QRScannerModal';
import { BankIcon, ClinicIcon, TechMartIcon } from './CustomerKiosk';

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

  // Top navigation sub-tabs: Home (matches screenshot default), Overview, Queue, Staff, Settings
  const [activeSubTab, setActiveSubTab] = useState<'home' | 'overview' | 'queue' | 'staff' | 'settings'>('home');

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
  const [compEmail, setCompEmail] = useState('admin@citybank.com');
  const [compOpensAt, setCompOpensAt] = useState('08:00 AM');
  const [compClosesAt, setCompClosesAt] = useState('05:00 PM');
  const [compQueueOpens, setCompQueueOpens] = useState('08:00 AM');
  const [compQueueCloses, setCompQueueCloses] = useState('04:30 PM');
  const [compDailyCapacity, setCompDailyCapacity] = useState(dailyCapacity);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [isEditingCompanyProfile, setIsEditingCompanyProfile] = useState(false);
  const [companyToast, setCompanyToast] = useState<string | null>(null);

  const currentBiz =
    businesses.find(
      (b) =>
        (companyName && b.id?.toLowerCase() === companyName.toLowerCase().trim()) ||
        (companyName && b.name.toLowerCase() === companyName.toLowerCase().trim()) ||
        (compName && b.id?.toLowerCase() === compName.toLowerCase().trim()) ||
        (compName && b.name.toLowerCase() === compName.toLowerCase().trim())
    ) || businesses[0] || null;

  // Load saved company details from localStorage on mount
  React.useEffect(() => {
    try {
      const savedName = localStorage.getItem('queuemate_comp_name');
      if (savedName) setCompName(savedName);
      const savedIndustry = localStorage.getItem('queuemate_comp_industry');
      if (savedIndustry) setCompIndustry(savedIndustry);
      const savedDesc = localStorage.getItem('queuemate_comp_desc');
      if (savedDesc) setCompDesc(savedDesc);
      const savedEmail = localStorage.getItem('queuemate_comp_email');
      if (savedEmail) setCompEmail(savedEmail);
      else if (currentBiz?.email) setCompEmail(currentBiz.email);
      const savedCapacity = localStorage.getItem('queuemate_comp_capacity');
      if (savedCapacity) setCompDailyCapacity(savedCapacity);
      const savedOpens = localStorage.getItem('queuemate_comp_opens');
      if (savedOpens) setCompOpensAt(savedOpens);
      const savedCloses = localStorage.getItem('queuemate_comp_closes');
      if (savedCloses) setCompClosesAt(savedCloses);
      const savedQOpens = localStorage.getItem('queuemate_comp_qopens');
      if (savedQOpens) setCompQueueOpens(savedQOpens);
      const savedQCloses = localStorage.getItem('queuemate_comp_qcloses');
      if (savedQCloses) setCompQueueCloses(savedQCloses);
    } catch {
      // ignore
    }
  }, [currentBiz]);

  const handleSaveCompanyProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('queuemate_comp_name', compName);
      localStorage.setItem('queuemate_comp_industry', compIndustry);
      localStorage.setItem('queuemate_comp_desc', compDesc);
      localStorage.setItem('queuemate_comp_email', compEmail);
      localStorage.setItem('queuemate_comp_capacity', compDailyCapacity);
      localStorage.setItem('queuemate_comp_opens', compOpensAt);
      localStorage.setItem('queuemate_comp_closes', compClosesAt);
      localStorage.setItem('queuemate_comp_qopens', compQueueOpens);
      localStorage.setItem('queuemate_comp_qcloses', compQueueCloses);
    } catch {
      // ignore
    }
    setIsEditingCompanyProfile(false);
    setCompanyToast('Company details updated successfully!');
    setTimeout(() => setCompanyToast(null), 2500);
  };

  // Compute live queue statistics SCOPED strictly to THIS business
  const isBizMatch = (t: Ticket) => {
    if (!currentBiz) return true;
    const curId = (currentBiz.id || '').trim().toLowerCase();
    const curName = (currentBiz.name || '').trim().toLowerCase();
    const activeName = (compName || '').trim().toLowerCase();
    const tId = (t.businessId || '').trim().toLowerCase();
    const tName = (t.businessName || '').trim().toLowerCase();

    // If ticket doesn't specify a business ID or name, attribute it to active business
    if (!tId && !tName) return true;

    return (
      (tId && curId && tId === curId) ||
      (tName && curName && tName === curName) ||
      (tName && activeName && tName === activeName) ||
      (curId && tId && (tId.includes(curId) || curId.includes(tId))) ||
      (curName && tName && (tName.includes(curName) || curName.includes(tName))) ||
      (activeName && tName && (tName.includes(activeName) || activeName.includes(tName)))
    );
  };

  const waitingTickets = tickets.filter(
    (t) => t.status === 'waiting' && isBizMatch(t)
  );
  const servingTickets = tickets.filter(
    (t) => t.status === 'serving' && isBizMatch(t)
  );
  const doneTodayTickets = tickets.filter(
    (t) => t.status === 'completed' && isBizMatch(t)
  );
  const currentBizStaff = staffMembers.filter(
    (s) => !currentBiz || s.businessId === currentBiz.id || s.businessName === currentBiz.name
  );
  const activeStaffCount = currentBizStaff.filter((s) => s.active).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  };

  const formatTime24 = (timeStr: string) => {
    return timeStr.replace(' AM', '').replace(' PM', '').trim();
  };
  const queueCloseTime = formatTime24(compQueueCloses) || '16:30';
  const queueOpenTime = formatTime24(compQueueOpens) || '08:00';
  const workOpensTime = formatTime24(compOpensAt) || '08:00';
  const workClosesTime = formatTime24(compClosesAt) || '17:00';
  const isOpen = currentBiz?.status === 'Open';

  return (
    <div className={`w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between select-none transition-colors duration-200 ${
      darkMode ? 'bg-[#101927]' : 'bg-[#F4FAF6]'
    }`}>
      {/* Content Area */}
      <div className="w-full max-w-sm mx-auto flex-1 min-h-0 flex flex-col px-4 pt-0 pb-2 overflow-y-auto overscroll-contain animate-scale-in">
        
        {/* If Bottom Nav is NOT 'home', render other screens */}
        {activeNavTab === 'profile' ? (
          <div className="w-full flex-1 flex flex-col pt-5 pb-8 space-y-4 animate-scale-in">
            {/* Header: Company Profile + Subtitle */}
            <div className="pb-1">
              <h1 className={`text-[23px] sm:text-[25px] font-extrabold tracking-tight leading-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Company Profile
              </h1>
              <p className="text-[13px] text-slate-400 font-normal mt-0.5">
                Your business details and stats
              </p>
            </div>

            {/* Saved Toast Feedback */}
            {companyToast && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-2 px-3 rounded-xl flex items-center space-x-1.5 animate-scale-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-medium">{companyToast}</span>
              </div>
            )}

            {/* 1. Company Overview Card (Matches screenshot exactly) */}
            <div className={`rounded-3xl p-5 shadow-2xs border transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100/90'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  {/* Company Logo Icon Container */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center p-2.5 flex-shrink-0 transition-colors ${
                    darkMode ? 'bg-[#101927] border-slate-700/60' : 'bg-slate-50 border-slate-100'
                  }`}>
                    {compName.toLowerCase().includes('clinic') ? (
                      <ClinicIcon className="w-8 h-8 sm:w-9 sm:h-9" />
                    ) : compName.toLowerCase().includes('tech') ? (
                      <TechMartIcon className="w-8 h-8 sm:w-9 sm:h-9" />
                    ) : (
                      <BankIcon className="w-8 h-8 sm:w-9 sm:h-9" />
                    )}
                  </div>

                  <div>
                    <h2 className={`text-[18px] sm:text-[19px] font-bold leading-tight ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {compName}
                    </h2>
                    
                    {/* Industry Pill Badge */}
                    <div className="mt-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium transition-colors ${
                        darkMode 
                          ? 'bg-slate-800 text-slate-300 border border-slate-700/60' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                      }`}>
                        <span className="text-[11px] leading-none">🏢</span>
                        <span>{compIndustry}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Pencil Button */}
                <button
                  onClick={() => setIsEditingCompanyProfile(true)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/70'
                      : 'bg-slate-100/90 hover:bg-slate-200 text-slate-500 border border-slate-200/60'
                  }`}
                  title="Edit company profile"
                >
                  <Pencil className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
              </div>

              {/* Bio / Description */}
              <p className={`text-[12.5px] sm:text-[13px] leading-relaxed mt-3.5 ${
                darkMode ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {compDesc}
              </p>
            </div>

            {/* 2. Today's Activity Card (3 Stats: Waiting, Served, Staff) */}
            <div className={`rounded-3xl p-5 shadow-2xs border transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100/90'
            }`}>
              <h3 className={`text-[15px] font-bold mb-3 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Today's Activity
              </h3>

              <div className="grid grid-cols-3 gap-2.5">
                {/* 1. Waiting */}
                <div className={`rounded-2xl p-3.5 text-center transition-colors ${
                  darkMode ? 'bg-[#101927]' : 'bg-slate-50/70'
                }`}>
                  <div className="text-[26px] sm:text-[28px] font-black text-[#00A843] leading-none mb-1">
                    {waitingTickets.length}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400">
                    Waiting
                  </div>
                </div>

                {/* 2. Served */}
                <div className={`rounded-2xl p-3.5 text-center transition-colors ${
                  darkMode ? 'bg-[#101927]' : 'bg-slate-50/70'
                }`}>
                  <div className={`text-[26px] sm:text-[28px] font-extrabold leading-none mb-1 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {doneTodayTickets.length}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400">
                    Served
                  </div>
                </div>

                {/* 3. Staff */}
                <div className={`rounded-2xl p-3.5 text-center transition-colors ${
                  darkMode ? 'bg-[#101927]' : 'bg-slate-50/70'
                }`}>
                  <div className={`text-[26px] sm:text-[28px] font-extrabold leading-none mb-1 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {activeStaffCount}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400">
                    Staff
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Company Details Card (Email, Working hours, Queue window, Daily capacity) */}
            <div className={`rounded-3xl p-5 shadow-2xs border transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100/90'
            }`}>
              <h3 className={`text-[15px] font-bold mb-1.5 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Company Details
              </h3>

              <div className="divide-y divide-dashed divide-slate-200/80 dark:divide-slate-700/60">
                {/* Email */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-2.5 text-slate-400">
                    <Mail className="w-4 h-4 stroke-[1.8]" />
                    <span className={`text-[13px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Email
                    </span>
                  </div>
                  <span className={`text-[13px] font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {compEmail}
                  </span>
                </div>

                {/* Working hours */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-2.5 text-slate-400">
                    <Clock className="w-4 h-4 stroke-[1.8]" />
                    <span className={`text-[13px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Working hours
                    </span>
                  </div>
                  <span className={`text-[13px] font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {workOpensTime} – {workClosesTime}
                  </span>
                </div>

                {/* Queue window */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-2.5 text-slate-400">
                    <Users className="w-4 h-4 stroke-[1.8]" />
                    <span className={`text-[13px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Queue window
                    </span>
                  </div>
                  <span className={`text-[13px] font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {queueOpenTime} – {queueCloseTime}
                  </span>
                </div>

                {/* Daily capacity */}
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center space-x-2.5 text-slate-400">
                    <CheckCircle2 className="w-4 h-4 stroke-[1.8]" />
                    <span className={`text-[13px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Daily capacity
                    </span>
                  </div>
                  <span className={`text-[13px] font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {compDailyCapacity || '100'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Registered on QueueMate Card */}
            <div className={`rounded-3xl p-5 shadow-2xs border flex items-center space-x-3.5 transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100/90'
            }`}>
              <div className="text-slate-400 flex-shrink-0">
                <Calendar className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className={`text-[14px] font-bold leading-tight ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Registered on QueueMate
                </h4>
                <p className="text-[12px] text-slate-400 font-normal mt-0.5">
                  October 4, 2026
                </p>
              </div>
            </div>
          </div>
        ) : activeNavTab === 'settings' ? (
          <div className="flex-1 flex flex-col pt-4">
            <SettingsView onSwitchRole={onSwitchRole || onSignOut} />
          </div>
        ) : activeNavTab === 'about' ? (
          <div className="flex-1 flex flex-col pt-4">
            <AboutView />
          </div>
        ) : (
          /* HOME: COMPANY DASHBOARD */
          <div className="flex-1 flex flex-col">
            
            {/* If on 'home' subtab, render the exact home screen from the user screenshot */}
            {activeSubTab === 'home' ? (
              <div className="flex flex-col animate-scale-in pb-4">
                {/* 1. TOP HEADER (Sticky & 100% Opaque Solid): Building Icon + Greeting + Company Name + Status Pill */}
                <div className={`sticky top-0 z-30 -mx-4 px-4 pt-3.5 pb-2.5 transition-colors border-b shadow-2xs ${
                  darkMode 
                    ? 'bg-[#101927] border-slate-800/80' 
                    : 'bg-[#F4FAF6] border-slate-200/90'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      {/* Building emoji icon inside square with soft border */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs text-2xl flex-shrink-0 transition-colors ${
                        darkMode ? 'bg-[#182335] border-slate-700/80' : 'bg-white border-slate-200/90'
                      }`}>
                        🏢
                      </div>
                      <div>
                        <p className="text-[12px] text-slate-400 font-medium leading-tight">
                          {getGreeting()}
                        </p>
                        <h1 className={`text-[17px] font-bold tracking-tight leading-tight ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {compName}
                        </h1>
                      </div>
                    </div>

                    {/* Right Status Pill: Closed / Open */}
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-[11.5px] font-medium flex items-center space-x-1.5 border transition-colors ${
                        isOpen
                          ? (darkMode ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                          : (darkMode ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100/90 text-slate-600 border-slate-200/80')
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500' : 'border border-slate-400'}`} />
                        <span>{isOpen ? 'Open' : 'Closed'}</span>
                      </div>

                      <button
                        onClick={() => setShowQRScanner(true)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        title="Scan customer QR code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SCROLLING BODY CONTENT */}
                <div className="space-y-4 pt-3.5">
                  {/* 2. ALERT / STATUS CARD: Queue closed at / Queue window */}
                  <div className={`w-full rounded-2xl border p-4 flex items-start space-x-3 transition-colors shadow-2xs ${
                    darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-200/80'
                  }`}>
                    <div className="text-slate-400 mt-0.5 flex-shrink-0">
                      <AlertCircle className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div>
                      <h3 className={`text-[13.5px] font-semibold leading-snug ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {isOpen ? `Queue open until ${queueCloseTime}` : `Queue closed at ${queueCloseTime}`}
                      </h3>
                      <p className="text-[12px] text-slate-400 font-normal mt-0.5">
                        Queue window: {queueOpenTime}–{queueCloseTime}
                      </p>
                    </div>
                  </div>

                {/* 3. TODAY'S ACTIVITY CARD */}
                <div className={`w-full rounded-2xl border p-4 transition-colors shadow-2xs ${
                  darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className={`text-[15px] font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      Today's Activity
                    </h3>
                    <button 
                      onClick={() => setActiveSubTab('overview')}
                      className="text-xs font-semibold text-[#00A843] hover:text-[#00963c] flex items-center cursor-pointer transition-colors"
                    >
                      <span>Full dashboard</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Waiting */}
                    <div className={`rounded-xl p-3 text-center transition-colors ${
                      darkMode ? 'bg-[#101927]' : 'bg-[#F8FAF9]'
                    }`}>
                      <div className="text-[28px] font-extrabold text-[#00A843] leading-tight">
                        {waitingTickets.length}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                        Waiting
                      </div>
                    </div>

                    {/* Serving */}
                    <div className={`rounded-xl p-3 text-center transition-colors ${
                      darkMode ? 'bg-[#101927]' : 'bg-[#F8FAF9]'
                    }`}>
                      <div className={`text-[28px] font-extrabold leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {servingTickets.length}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                        Serving
                      </div>
                    </div>

                    {/* Done */}
                    <div className={`rounded-xl p-3 text-center transition-colors ${
                      darkMode ? 'bg-[#101927]' : 'bg-[#F8FAF9]'
                    }`}>
                      <div className={`text-[28px] font-extrabold leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {doneTodayTickets.length}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                        Done
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. QUICK ACTIONS */}
                <div>
                  <h4 className={`text-[13px] font-semibold mb-2.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Quick Actions
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Dashboard */}
                    <button
                      onClick={() => setActiveSubTab('overview')}
                      className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer shadow-2xs ${
                        darkMode ? 'bg-[#182335] border-slate-700/60 hover:border-slate-600' : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#00A843] mb-3">
                        <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className={`text-[13.5px] font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Dashboard
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Full overview
                      </div>
                    </button>

                    {/* Queue */}
                    <button
                      onClick={() => setActiveSubTab('queue')}
                      className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer shadow-2xs ${
                        darkMode ? 'bg-[#182335] border-slate-700/60 hover:border-slate-600' : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-500 mb-3">
                        <Users className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className={`text-[13.5px] font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Queue
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {waitingTickets.length} waiting
                      </div>
                    </button>

                    {/* Staff */}
                    <button
                      onClick={() => setActiveSubTab('staff')}
                      className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer shadow-2xs ${
                        darkMode ? 'bg-[#182335] border-slate-700/60 hover:border-slate-600' : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500 mb-3">
                        <UserPlus className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className={`text-[13.5px] font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Staff
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {activeStaffCount} active
                      </div>
                    </button>

                    {/* Settings */}
                    <button
                      onClick={() => setActiveNavTab('settings')}
                      className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer shadow-2xs ${
                        darkMode ? 'bg-[#182335] border-slate-700/60 hover:border-slate-600' : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3">
                        <SettingsIcon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className={`text-[13.5px] font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Settings
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Hours & more
                      </div>
                    </button>
                  </div>
                </div>

                {/* 5. STAFF SECTION */}
                <div className={`w-full rounded-2xl border p-4 transition-colors shadow-2xs ${
                  darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-[15px] font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      Staff
                    </h3>
                    <button
                      onClick={() => setActiveSubTab('staff')}
                      className="text-xs font-semibold text-[#00A843] hover:text-[#00963c] flex items-center cursor-pointer transition-colors"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>

                  {/* Staff Preview Card: Rounded box with centered UserPlus outline icon if empty */}
                  {currentBizStaff.length === 0 ? (
                    <div 
                      onClick={() => setShowAddStaffModal(true)}
                      className={`w-full py-9 rounded-2xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        darkMode 
                          ? 'border-slate-700/80 bg-[#101927]/60 hover:border-emerald-500/50' 
                          : 'border-slate-200 bg-slate-50/70 hover:border-emerald-400'
                      }`}
                      title="Click to add staff member"
                    >
                      <UserPlus className="w-10 h-10 text-slate-300 dark:text-slate-600 stroke-[1.4] mb-1.5" />
                      <span className="text-[11px] text-slate-400 font-medium">Add staff members to manage counters</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentBizStaff.slice(0, 2).map((staff) => (
                        <div key={staff.id} className={`flex items-center justify-between p-2.5 rounded-xl border ${
                          darkMode ? 'bg-[#101927] border-slate-700/50' : 'bg-slate-50 border-slate-200/60'
                        }`}>
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#00A843] font-bold text-xs flex items-center justify-center">
                              {staff.name.charAt(0)}
                            </div>
                            <div>
                              <div className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{staff.name}</div>
                              <div className="text-[10px] text-slate-400">{staff.counterName}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-emerald-500">Active</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. BUSINESS HOURS SECTION (Matches screenshot) */}
                <div className={`w-full rounded-2xl border p-4 transition-colors shadow-2xs ${
                  darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-200/80'
                }`}>
                  <h3 className={`text-[15px] font-bold mb-3.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Business Hours
                  </h3>

                  <div className="space-y-3">
                    {/* Working hours */}
                    <div className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center space-x-2.5 text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4 stroke-[1.8] text-slate-400" />
                        <span>Working hours</span>
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {workOpensTime} – {workClosesTime}
                      </span>
                    </div>

                    {/* Queue window */}
                    <div className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center space-x-2.5 text-slate-500 dark:text-slate-400">
                        <Users className="w-4 h-4 stroke-[1.8] text-slate-400" />
                        <span>Queue window</span>
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {queueOpenTime} – {queueCloseTime}
                      </span>
                    </div>

                    {/* Daily capacity */}
                    <div className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center space-x-2.5 text-slate-500 dark:text-slate-400">
                        <TrendingUp className="w-4 h-4 stroke-[1.8] text-slate-400" />
                        <span>Daily capacity</span>
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {waitingTickets.length + servingTickets.length + doneTodayTickets.length}/{compDailyCapacity || '100'}
                      </span>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            ) : (
              /* DEEP SUBTAB VIEWS (Overview, Queue, Staff, Settings) */
              <>
                {/* Header with Back to Home button (Sticky & 100% Opaque Solid) */}
                <div className={`sticky top-0 z-30 -mx-4 px-4 pt-3.5 pb-2.5 mb-3.5 transition-colors border-b shadow-2xs ${
                  darkMode ? 'bg-[#101927] border-slate-800/80' : 'bg-[#F4FAF6] border-slate-200/90'
                }`}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setActiveSubTab('home')}
                      className={`flex items-center space-x-1.5 text-xs font-semibold py-1.5 px-3 rounded-xl border transition-colors cursor-pointer ${
                        darkMode 
                          ? 'bg-[#182335] border-slate-700/80 text-slate-300 hover:text-white' 
                          : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>Back to Home</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowQRScanner(true)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan QR</span>
                      </button>
                      <button
                        onClick={onSignOut}
                        className={`flex items-center space-x-1 text-xs font-medium transition-colors cursor-pointer px-2 py-1 rounded-lg ${
                          darkMode ? 'text-slate-300 hover:text-red-400' : 'text-slate-600 hover:text-red-600'
                        }`}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-tabs pills */}
                <div className={`w-full p-1 rounded-2xl flex items-center justify-between mb-3.5 transition-colors ${
                  darkMode ? 'bg-[#182335] border border-slate-700/60' : 'bg-slate-100/90'
                }`}>
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
              </>
            )}

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
      <div className={`w-full flex-shrink-0 border-t py-2 shadow-sm transition-colors duration-200 z-40 ${
        darkMode ? 'bg-[#101927] border-slate-800' : 'bg-white border-slate-100/90'
      }`}>
        <div className="w-full max-w-sm mx-auto flex items-center justify-around px-4">
          {/* Home Tab */}
          <button
            onClick={() => {
              setActiveNavTab('home');
              setActiveSubTab('home');
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

      {/* EDIT COMPANY PROFILE MODAL */}
      {isEditingCompanyProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border ${
            darkMode ? 'bg-[#182335] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'
          } animate-scale-in max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Edit Company Details</h3>
              <button
                onClick={() => setIsEditingCompanyProfile(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCompanyProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Industry</label>
                <input
                  type="text"
                  required
                  value={compIndustry}
                  onChange={(e) => setCompIndustry(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={compEmail}
                  onChange={(e) => setCompEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description / Bio</label>
                <textarea
                  rows={2}
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none resize-none ${
                    darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Opens At</label>
                  <input
                    type="text"
                    value={compOpensAt}
                    onChange={(e) => setCompOpensAt(e.target.value)}
                    placeholder="08:00 AM"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Closes At</label>
                  <input
                    type="text"
                    value={compClosesAt}
                    onChange={(e) => setCompClosesAt(e.target.value)}
                    placeholder="05:00 PM"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Queue Opens</label>
                  <input
                    type="text"
                    value={compQueueOpens}
                    onChange={(e) => setCompQueueOpens(e.target.value)}
                    placeholder="08:00 AM"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Queue Closes</label>
                  <input
                    type="text"
                    value={compQueueCloses}
                    onChange={(e) => setCompQueueCloses(e.target.value)}
                    placeholder="04:30 PM"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Daily Capacity</label>
                <input
                  type="text"
                  value={compDailyCapacity}
                  onChange={(e) => setCompDailyCapacity(e.target.value)}
                  placeholder="100"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    darkMode ? 'bg-[#101927] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCompanyProfile(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#00A843] hover:bg-[#00963c] text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
