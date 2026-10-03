'use client';

import React, { useState } from 'react';
import { useQueue } from '@/context/QueueContext';
import { 
  Users, 
  Clock, 
  Ticket as TicketIcon, 
  ListFilter,
  Home, 
  User, 
  Settings, 
  Info,
  Volume2,
  Printer,
  Trash2,
  QrCode,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Search,
  X,
  AlertCircle,
  Download,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Business } from '@/types/queue';
import { checkQueueEligibility } from '@/utils/businessHours';
import { TicketQRCode } from './TicketQRCode';
import { downloadTicketQR } from '@/utils/ticketDownload';
import { ProfileView } from './ProfileView';
import { SettingsView } from './SettingsView';
import { AboutView } from './AboutView';

// Icon 1: City Bank building
export const BankIcon = ({ className = 'w-7 h-7' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="7" width="16" height="20" rx="2" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.8" />
    <rect x="9" y="10" width="3" height="3" rx="0.5" fill="#38BDF8" />
    <rect x="15" y="10" width="3" height="3" rx="0.5" fill="#38BDF8" />
    <rect x="9" y="15" width="3" height="3" rx="0.5" fill="#38BDF8" />
    <rect x="15" y="15" width="3" height="3" rx="0.5" fill="#38BDF8" />
    <rect x="11" y="21" width="6" height="6" fill="#00A843" stroke="#1E293B" strokeWidth="1.5" />
    <rect x="22" y="14" width="6" height="13" rx="1" fill="#00A843" stroke="#1E293B" strokeWidth="1.5" />
    <rect x="24" y="17" width="2" height="2" fill="#FFFFFF" />
  </svg>
);

// Icon 2: Health Plus Clinic
export const ClinicIcon = ({ className = 'w-7 h-7' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="8" width="16" height="19" rx="2" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.8" />
    <rect x="9" y="11" width="3" height="3" rx="0.5" fill="#38BDF8" />
    <rect x="15" y="11" width="3" height="3" rx="0.5" fill="#38BDF8" />
    <rect x="9" y="16" width="3" height="3" rx="0.5" fill="#38BDF8" />
    <rect x="15" y="16" width="3" height="3" rx="0.5" fill="#38BDF8" />
    <rect x="11" y="21" width="6" height="6" fill="#DC2626" stroke="#1E293B" strokeWidth="1.5" />
    <rect x="22" y="14" width="7" height="13" rx="1.5" fill="#DC2626" stroke="#1E293B" strokeWidth="1.5" />
    <path d="M25.5 17.5v6M22.5 20.5h6" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// Icon 3: TechMart
export const TechMartIcon = ({ className = 'w-7 h-7' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9 C12 6, 20 6, 20 9" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <rect x="7" y="9" width="18" height="18" rx="3" fill="#8B5CF6" stroke="#1E293B" strokeWidth="1.8" />
    <path d="M7 16 C12 18, 20 18, 25 16 V24 C25 25.5, 23.5 27, 22 27 H10 C8.5 27, 7 25.5, 7 24 Z" fill="#00A843" opacity="0.9" />
    <circle cx="16" cy="18" r="3" fill="#FACC15" stroke="#1E293B" strokeWidth="1.2" />
    <path d="M16 13v2M16 21v2M11 18h2M19 18h2" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export interface CompanyQueueInfo {
  id: string;
  name: string;
  industry: string;
  description: string;
  fullDescription: string;
  hours: string;
  workingHours: string;
  queueWindow: string;
  closeTime: string;
  status: 'Closed' | 'Open';
  waitingCount: number;
  estWait: string;
  icon: 'bank' | 'clinic' | 'techmart';
}

const DEFAULT_COMPANIES: CompanyQueueInfo[] = [
  {
    id: 'city-bank',
    name: 'City Bank',
    industry: 'Banking',
    description: 'Full-service banking for all your...',
    fullDescription: 'Full-service banking for all your personal and business financial needs.',
    hours: '08:00–16:30',
    workingHours: '08:00 – 17:00',
    queueWindow: '08:00 – 16:30',
    closeTime: '16:30',
    status: 'Closed',
    waitingCount: 0,
    estWait: '5 min',
    icon: 'bank',
  },
  {
    id: 'health-plus',
    name: 'Health Plus Clinic',
    industry: 'Healthcare',
    description: 'Primary care, specialist...',
    fullDescription: 'Primary care, specialist consultations, and emergency health services.',
    hours: '07:30–15:30',
    workingHours: '07:00 – 16:00',
    queueWindow: '07:30 – 15:30',
    closeTime: '15:30',
    status: 'Closed',
    waitingCount: 0,
    estWait: '10 min',
    icon: 'clinic',
  },
  {
    id: 'tech-mart',
    name: 'TechMart',
    industry: 'Retail',
    description: 'Electronics, gadgets, and tech...',
    fullDescription: 'Electronics, gadgets, and tech accessories customer support and sales.',
    hours: '09:00–17:30',
    workingHours: '08:30 – 18:00',
    queueWindow: '09:00 – 17:30',
    closeTime: '17:30',
    status: 'Closed',
    waitingCount: 0,
    estWait: '5 min',
    icon: 'techmart',
  },
];

interface CustomerKioskProps {
  onBackToWelcome?: () => void;
  onSwitchRole?: () => void;
  onSwitchToStaff?: () => void;
}

export const CustomerKiosk: React.FC<CustomerKioskProps> = ({ 
  onBackToWelcome,
  onSwitchRole,
  onSwitchToStaff 
}) => {
  const { 
    tickets,
    businesses,
    issueTicket, 
    currentCustomerTicket, 
    cancelCustomerTicket, 
    getQueuePosition,
    getEstimatedWaitMinutes,
    darkMode
  } = useQueue();

  const [selectedCompany, setSelectedCompany] = useState<Business | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bottomTab, setBottomTab] = useState<'home' | 'profile' | 'settings' | 'about'>('home');
  const [manualClosedOverride, setManualClosedOverride] = useState<boolean | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const [qrDownloaded, setQrDownloaded] = useState(false);

  // Strict operating hours & queue window check
  const autoEligibility = selectedCompany ? checkQueueEligibility(selectedCompany) : { canQueue: true, windowInfo: '' };
  const isClosed = manualClosedOverride !== null ? manualClosedOverride : !autoEligibility.canQueue;

  // Live queue count
  const waitingCount = tickets.filter((t) => t.status === 'waiting').length;

  const canSubmit = name.trim().length > 0;

  const handleJoinQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isClosed || !selectedCompany) return;

    setIsSubmitting(true);

    setTimeout(() => {
      issueTicket('general', name.trim(), phone.trim() || undefined, selectedCompany.id, selectedCompany.name);
      setIsSubmitting(false);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#00A843', '#10b981', '#3b82f6']
      });
    }, 350);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredCompanies = businesses.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`w-full min-h-screen flex flex-col justify-between select-none transition-colors duration-200 ${
      darkMode ? 'bg-[#101927] text-white' : 'bg-[#F4FAF6] text-slate-900'
    }`}>
      {/* ============================================================== */}
      {/* VIEW: PROFILE SCREEN (Matches user screenshot)                 */}
      {/* ============================================================== */}
      {bottomTab === 'profile' ? (
        <ProfileView defaultRole="Customer" />
      ) : bottomTab === 'settings' ? (
        <SettingsView onSwitchRole={onSwitchRole || onBackToWelcome} />
      ) : bottomTab === 'about' ? (
        <AboutView />
      ) : !selectedCompany ? (
        <div className="w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="w-full max-w-sm mx-auto pt-7 px-4 pb-2">
            <div className="flex items-center space-x-3 mb-4">
              {(onSwitchRole || onBackToWelcome) && (
                <button
                  onClick={onSwitchRole || onBackToWelcome}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-2xs transition-colors cursor-pointer flex-shrink-0 ${
                    darkMode
                      ? 'bg-[#182335] border-slate-700/60 text-slate-300 hover:bg-[#223044]'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Back to roles"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {/* Logo: Green squircle with white "Q" */}
              <div className="w-8 h-8 rounded-lg bg-[#00A843] flex items-center justify-center shadow-xs flex-shrink-0">
                <span className="text-white font-extrabold text-[17px] leading-none select-none font-sans">
                  Q
                </span>
              </div>

              <div>
                <h1 className={`text-[20px] font-bold tracking-tight leading-tight transition-colors duration-200 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Find a Queue
                </h1>
                <p className="text-[12px] text-slate-400 font-normal">
                  {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'} available
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className={`w-full rounded-xl border px-3.5 py-2.5 flex items-center space-x-2.5 shadow-xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all duration-200 ${
              darkMode 
                ? 'bg-[#182335] border-slate-700/60' 
                : 'bg-white border-slate-200/80'
            }`}>
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, industry..."
                className={`w-full bg-transparent text-sm outline-none transition-colors ${
                  darkMode ? 'text-white placeholder-slate-400' : 'text-slate-800 placeholder-slate-400'
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-slate-400 hover:text-slate-200 p-0.5 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Companies List */}
          <div className="w-full max-w-sm mx-auto flex-1 px-4 py-3 space-y-3.5 overflow-y-auto">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                onClick={() => {
                  setSelectedCompany(company);
                  setManualClosedOverride(null);
                }}
                className={`w-full rounded-2xl p-4 shadow-sm border transition-all duration-200 flex items-center justify-between cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${
                  darkMode
                    ? 'bg-[#182335] border-slate-700/60 hover:border-slate-600'
                    : 'bg-white border-slate-100/90 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                {/* Left Icon Container */}
                <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center p-2.5 flex-shrink-0 group-hover:scale-105 transition-transform ${
                  darkMode ? 'bg-[#223044] border-slate-700/50' : 'bg-slate-50 border-slate-100'
                }`}>
                  {company.icon === 'bank' && <BankIcon className="w-7 h-7" />}
                  {company.icon === 'clinic' && <ClinicIcon className="w-7 h-7" />}
                  {company.icon === 'techmart' && <TechMartIcon className="w-7 h-7" />}
                </div>

                {/* Middle Details */}
                <div className="flex-1 min-w-0 px-3.5 text-left">
                  <h2 className={`text-[15px] font-bold leading-tight mb-0.5 transition-colors duration-200 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {company.name}
                  </h2>
                  <p className="text-[12px] text-slate-400 font-medium mb-1">
                    {company.industry}
                  </p>
                  <p className={`text-[12.5px] font-normal truncate max-w-[190px] mb-2 transition-colors duration-200 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {company.description}
                  </p>

                  <div className="flex items-center space-x-3 text-[11.5px] text-slate-400 font-medium">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tickets.filter((t) => t.businessId === company.id && t.status === 'waiting').length} waiting</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{company.workingHours}</span>
                    </span>
                  </div>
                </div>

                {/* Right Status Badge & Chevron */}
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-[#223044] text-slate-300 border-slate-700/50' 
                      : 'bg-slate-100 text-slate-500 border-transparent'
                  }`}>
                    {company.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No companies match your search</p>
                <p className="text-xs text-slate-400 mt-1">Try another keyword</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* VIEW B: JOIN QUEUE COMPANY SCREEN (Matches user's screenshot)  */
        /* ============================================================== */
        <div className="w-full flex-1 flex flex-col">
          {/* Top Bar with Circle Back Button and "Join Queue" Title */}
          <div className="w-full max-w-sm mx-auto pt-6 px-4 pb-2 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCompany(null)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-2xs transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-[#182335] border-slate-700/60 text-slate-300 hover:bg-[#223044]'
                  : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
              }`}
              title="Back to companies"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className={`text-[19px] font-bold tracking-tight transition-colors duration-200 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Join Queue
            </h1>
          </div>

          {/* Scrollable Content Container */}
          <div className="w-full flex-1 max-w-sm mx-auto px-4 py-3 space-y-4 overflow-y-auto">
            {/* 1. Company Profile Card */}
            <div className={`rounded-3xl p-5 shadow-sm border animate-scale-in transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100/90'
            }`}>
              <div className="flex items-start space-x-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center p-2.5 flex-shrink-0 ${
                  darkMode ? 'bg-[#223044] border-slate-700/50' : 'bg-slate-50 border-slate-100'
                }`}>
                  {selectedCompany.icon === 'bank' && <BankIcon className="w-8 h-8" />}
                  {selectedCompany.icon === 'clinic' && <ClinicIcon className="w-8 h-8" />}
                  {selectedCompany.icon === 'techmart' && <TechMartIcon className="w-8 h-8" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className={`text-[17px] font-bold leading-tight mb-0.5 transition-colors duration-200 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {selectedCompany.name}
                  </h2>
                  <p className="text-[12px] text-slate-400 font-medium mb-1.5">
                    {selectedCompany.industry}
                  </p>
                  <p className={`text-[12.5px] font-normal leading-relaxed transition-colors duration-200 ${
                    darkMode ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {selectedCompany.fullDescription}
                  </p>
                </div>
              </div>

              {/* 3 Sub-Cards */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {/* Box 1: Waiting */}
                <div className={`rounded-2xl p-3 text-center border transition-colors ${
                  darkMode ? 'bg-[#101927] border-slate-700/50' : 'bg-[#F4FBF6] border-emerald-100/60'
                }`}>
                  <div className="text-[20px] font-black text-[#00A843] leading-none mb-1">
                    {tickets.filter((t) => t.businessId === selectedCompany.id && t.status === 'waiting').length}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Waiting</div>
                </div>

                {/* Box 2: Est. wait */}
                <div className={`rounded-2xl p-3 text-center border transition-colors ${
                  darkMode ? 'bg-[#101927] border-slate-700/50 text-white' : 'bg-slate-50/80 border-slate-100 text-slate-900'
                }`}>
                  <div className="text-[16px] font-bold leading-none mb-1">
                    {Math.max(3, tickets.filter((t) => t.businessId === selectedCompany.id && t.status === 'waiting').length * 4)} min
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Est. wait</div>
                </div>

                {/* Box 3: Closed 08:00–16:30 */}
                <div className={`rounded-2xl p-3 text-center border transition-colors ${
                  darkMode ? 'bg-[#101927] border-slate-700/50 text-slate-300' : 'bg-slate-50/80 border-slate-100 text-slate-600'
                }`}>
                  <div className="text-[12px] font-semibold leading-none mb-1">
                    {isClosed ? 'Closed' : 'Open'}
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-medium">
                    {selectedCompany.workingHours}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Notice Banner */}
            {/* 2. Queue Status Card */}
            <div
              className={`rounded-2xl p-3.5 flex items-start justify-between border transition-all ${
                isClosed
                  ? 'bg-[#FFFBEB] border-[#FDE68A]/80 text-[#B45309]'
                  : 'bg-[#F0FDF4] border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="flex items-start space-x-2.5">
                <AlertCircle
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    isClosed ? 'text-[#D97706]' : 'text-[#00A843]'
                  }`}
                />
                <div>
                  <div
                    className={`font-semibold text-[13px] leading-tight ${
                      isClosed ? 'text-[#D97706]' : 'text-emerald-700'
                    }`}
                  >
                    {isClosed ? 'Queue is Closed' : 'Queue is Open'}
                  </div>
                  <div className="text-[12px] text-slate-600 dark:text-slate-300 mt-0.5">
                    {isClosed
                      ? (autoEligibility.reason || `Queue closed for ${selectedCompany.name}`)
                      : `Accepting customers • Queue Window: ${selectedCompany.queueWindow}`}
                  </div>
                </div>
              </div>

              {/* Status Toggle Button for testing / flexibility */}
              <button
                onClick={() => setManualClosedOverride(isClosed ? false : true)}
                className="text-[10px] font-semibold px-2 py-1 rounded-md bg-white/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-800 cursor-pointer transition-colors flex-shrink-0 ml-2"
                title="Toggle open or closed state"
              >
                {isClosed ? 'Force Open' : 'Force Close'}
              </button>
            </div>

            {/* 3. Your Details Card */}
            <div className={`rounded-3xl p-5 shadow-sm border space-y-3.5 transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100/90'
            }`}>
              <h3 className={`text-[16px] font-bold transition-colors ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {currentCustomerTicket && 
                 currentCustomerTicket.status !== 'completed' && 
                 (currentCustomerTicket.businessId === selectedCompany.id || currentCustomerTicket.businessName === selectedCompany.name)
                  ? 'Your Queue Ticket & QR Code'
                  : 'Your Details'}
              </h3>

              {/* Active Ticket & Scannable QR Code for THIS company */}
              {currentCustomerTicket && 
               currentCustomerTicket.status !== 'completed' && 
               (currentCustomerTicket.businessId === selectedCompany.id || currentCustomerTicket.businessName === selectedCompany.name) ? (
                <div className={`p-4 rounded-2xl text-center border animate-scale-in ${
                  darkMode ? 'bg-emerald-950/40 border-emerald-800/80 text-white' : 'bg-emerald-50/80 border-emerald-200 text-slate-900'
                }`}>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-500/20">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-500">
                      Active Ticket
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      #{getQueuePosition(currentCustomerTicket)} in line (~{getEstimatedWaitMinutes(currentCustomerTicket)}m)
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-3xl font-mono font-extrabold text-emerald-500 tracking-tight">
                      {currentCustomerTicket.number}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {currentCustomerTicket.customerName} • {currentCustomerTicket.categoryName}
                    </p>
                  </div>

                  {/* Scannable QR Code */}
                  <div className="my-3">
                    <TicketQRCode ticket={currentCustomerTicket} size={160} showDetails={true} />
                  </div>

                  <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-emerald-500/20">
                    <button
                      onClick={async () => {
                        if (!currentCustomerTicket) return;
                        setIsDownloadingQR(true);
                        try {
                          await downloadTicketQR(currentCustomerTicket, 'pass');
                          setQrDownloaded(true);
                          setTimeout(() => setQrDownloaded(false), 2500);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsDownloadingQR(false);
                        }
                      }}
                      disabled={isDownloadingQR}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      {qrDownloaded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Saved!</span>
                        </>
                      ) : isDownloadingQR ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Save QR</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer hover:bg-slate-800"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => cancelCustomerTicket(currentCustomerTicket.id)}
                      className="flex-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={isClosed}
                      className={`w-full px-3.5 py-3 rounded-xl border text-sm outline-none transition-all ${
                        isClosed
                          ? (darkMode ? 'bg-[#101927] border-slate-700 text-slate-500 placeholder-slate-600 cursor-not-allowed' : 'bg-slate-50/70 border-slate-200/80 text-slate-500 placeholder-slate-400 cursor-not-allowed')
                          : (darkMode ? 'bg-[#101927] border-slate-700 text-white focus:border-[#00A843]' : 'bg-white border-slate-200 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15')
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 transition-colors ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      disabled={isClosed}
                      className={`w-full px-3.5 py-3 rounded-xl border text-sm outline-none transition-all ${
                        isClosed
                          ? (darkMode ? 'bg-[#101927] border-slate-700 text-slate-500 placeholder-slate-600 cursor-not-allowed' : 'bg-slate-50/70 border-slate-200/80 text-slate-500 placeholder-slate-400 cursor-not-allowed')
                          : (darkMode ? 'bg-[#101927] border-slate-700 text-white focus:border-[#00A843]' : 'bg-white border-slate-200 focus:border-[#00A843] focus:ring-2 focus:ring-emerald-500/15')
                      }`}
                    />
                  </div>

                  {/* Action Button: Matches screenshot "Queue is Closed" with CheckCircle icon */}
                  {isClosed ? (
                    <button
                      disabled
                      className={`w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 cursor-not-allowed border transition-colors ${
                        darkMode ? 'bg-[#1e2a3c] border-slate-700 text-slate-500' : 'bg-slate-200/80 border-transparent text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      <span>Queue is Closed (No Queuing During Closed Hours)</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinQueue}
                      disabled={!canSubmit || isSubmitting}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white transition-all shadow-md flex items-center justify-center space-x-2 ${
                        canSubmit && !isSubmitting
                          ? 'bg-[#00A843] hover:bg-[#00963c] shadow-emerald-700/20 active:scale-[0.98] cursor-pointer'
                          : 'bg-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <TicketIcon className="w-4 h-4" />
                      <span>{isSubmitting ? 'Joining Queue...' : 'Join Queue & Get QR Ticket'}</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* 4. Hours Card */}
            <div className={`rounded-3xl p-5 shadow-sm border space-y-3 pb-6 transition-colors duration-200 ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-100/90'
            }`}>
              <h3 className={`text-[15px] font-bold transition-colors ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Hours
              </h3>

              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Working hours</span>
                </div>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {selectedCompany.workingHours}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Queue window</span>
                </div>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {selectedCompany.queueWindow}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BOTTOM NAVIGATION BAR (Shown on "Find a Queue", Profile, Settings & About) */}
      {/* ============================================================== */}
      {(!selectedCompany || bottomTab === 'profile' || bottomTab === 'settings' || bottomTab === 'about') && (
        <div className={`w-full py-2 px-6 flex items-center justify-around shadow-sm mt-auto transition-colors duration-200 ${
          darkMode 
            ? 'bg-[#101927] border-t border-slate-800' 
            : 'bg-white border-t border-slate-100/90'
        }`}>
          {/* Home */}
          <button
            onClick={() => {
              if (bottomTab === 'profile' || bottomTab === 'settings' || bottomTab === 'about') {
                setBottomTab('home');
              } else if (onBackToWelcome) {
                onBackToWelcome();
              }
            }}
            className={`cursor-pointer transition-all duration-150 flex flex-col items-center ${
              bottomTab === 'home'
                ? 'bg-[#00A843] text-white py-1.5 px-4 rounded-xl shadow-xs'
                : (darkMode ? 'text-slate-400 hover:text-white py-1.5 px-3' : 'text-slate-400 hover:text-slate-600 py-1.5 px-3')
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5">Home</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => setBottomTab('profile')}
            className={`cursor-pointer transition-all duration-150 flex flex-col items-center ${
              bottomTab === 'profile'
                ? 'bg-[#00A843] text-white py-1.5 px-4 rounded-xl shadow-xs'
                : (darkMode ? 'text-slate-400 hover:text-white py-1.5 px-3' : 'text-slate-400 hover:text-slate-600 py-1.5 px-3')
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5">Profile</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setBottomTab('settings')}
            className={`cursor-pointer transition-all duration-150 flex flex-col items-center ${
              bottomTab === 'settings'
                ? 'bg-[#00A843] text-white py-1.5 px-4 rounded-xl shadow-xs'
                : (darkMode ? 'text-slate-400 hover:text-white py-1.5 px-3' : 'text-slate-400 hover:text-slate-600 py-1.5 px-3')
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5">Settings</span>
          </button>

          {/* About */}
          <button
            onClick={() => setBottomTab('about')}
            className={`cursor-pointer transition-all duration-150 flex flex-col items-center ${
              bottomTab === 'about'
                ? 'bg-[#00A843] text-white py-1.5 px-4 rounded-xl shadow-xs'
                : (darkMode ? 'text-slate-400 hover:text-white py-1.5 px-3' : 'text-slate-400 hover:text-slate-600 py-1.5 px-3')
            }`}
          >
            <Info className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5">About</span>
          </button>
        </div>
      )}
    </div>
  );
};
