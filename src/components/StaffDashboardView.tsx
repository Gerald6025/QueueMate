'use client';

import React, { useState, useEffect } from 'react';
import { useQueue } from '@/context/QueueContext';
import { Ticket, Counter, ServiceId, Business, StaffMember } from '@/types/queue';
import { AudioService } from '@/utils/audio';
import { QRScannerModal } from './QRScannerModal';
import { SmsGatewayModal } from './SmsGatewayModal';
import confetti from 'canvas-confetti';
import {
  Megaphone,
  CheckCheck,
  UserX,
  Play,
  Clock,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Users,
  Ticket as TicketIcon,
  ShieldCheck,
  Search,
  CheckCircle2,
  LogOut,
  Moon,
  Sun,
  Coffee,
  ChevronRight,
  TrendingUp,
  Building2,
  User,
  Layers,
  ArrowRight,
  Smartphone,
  MessageSquare,
  X
} from 'lucide-react';

interface StaffDashboardViewProps {
  staffName?: string;
  staffRole?: string;
  staffEmail?: string;
  initialCounterName?: string;
  companyName?: string;
  onSignOut: () => void;
  onSwitchRole?: () => void;
}

export const StaffDashboardView: React.FC<StaffDashboardViewProps> = ({
  staffName: propStaffName,
  staffRole: propStaffRole,
  staffEmail: propStaffEmail,
  initialCounterName: propCounterName,
  companyName: propCompanyName,
  onSignOut,
  onSwitchRole,
}) => {
  const {
    counters,
    tickets,
    businesses,
    staffMembers,
    activeStaff,
    setActiveStaff,
    getCountersForBusiness,
    lastSentSms,
    clearLastSentSms,
    callNextTicket,
    recallTicket,
    startServing,
    completeTicket,
    markNoShow,
    scanTicket,
    soundEnabled,
    setSoundEnabled,
    darkMode,
    setDarkMode
  } = useQueue();

  // Resolve current active staff member identity (Priority: Explicit Props -> activeStaff in Context/Storage -> custom created staff in state -> default)
  const resolvedStaff = React.useMemo(() => {
    if (propStaffName && propStaffName !== 'Elena Rostova') {
      return {
        name: propStaffName,
        role: propStaffRole || 'Counter Staff',
        email: propStaffEmail || '',
        counter: propCounterName || 'Counter 1',
        company: propCompanyName || 'City Bank',
      };
    }
    if (activeStaff?.name) {
      return {
        name: activeStaff.name,
        role: activeStaff.role || 'Counter Staff',
        email: activeStaff.email || '',
        counter: activeStaff.counter || 'Counter 1',
        company: activeStaff.company || 'City Bank',
      };
    }
    const customStaff = staffMembers.find(
      (s) => !['staff-1', 'staff-2', 'staff-3', 'staff-4'].includes(s.id)
    );
    if (customStaff) {
      return {
        name: customStaff.name,
        role: customStaff.role || 'Counter Staff',
        email: customStaff.email || '',
        counter: customStaff.counterName || 'Counter 1',
        company: customStaff.businessName || 'City Bank',
      };
    }
    return {
      name: propStaffName || 'Elena Rostova',
      role: propStaffRole || 'Senior Service Operator',
      email: propStaffEmail || 'elena@citybank.com',
      counter: propCounterName || 'Counter 1',
      company: propCompanyName || 'City Bank',
    };
  }, [propStaffName, propStaffRole, propStaffEmail, propCounterName, propCompanyName, activeStaff, staffMembers]);

  const staffName = resolvedStaff.name;
  const staffRole = resolvedStaff.role;
  const staffEmail = resolvedStaff.email;
  const companyName = resolvedStaff.company;
  const initialCounterName = resolvedStaff.counter;

  // Find business details (safe fallback to companyName instead of generic first business)
  const currentBiz: Business =
    businesses.find(
      (b) =>
        b.name.toLowerCase() === companyName.toLowerCase() ||
        b.id === companyName.toLowerCase() ||
        b.id === companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    ) || {
      id: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: companyName,
      industry: 'General',
      description: '',
      dailyCapacity: '100',
      status: 'Open' as const,
      workingHours: '08:00 – 17:00',
      queueWindow: '08:00 – 16:30',
    };

  // Facility counters strictly matching this company (1 staff account = 1 counter)
  const facilityCounters = React.useMemo(() => {
    const list = getCountersForBusiness(currentBiz.id);
    if (list.length > 0) return list;

    // Fallback: exactly 1 counter for this logged-in staff member
    return [
      {
        id: 1,
        name: initialCounterName || 'Counter 1',
        staffName: staffName,
        status: 'idle' as const,
        assignedCategories: ['general', 'billing', 'tech', 'vip'] as ServiceId[],
        servedCount: 0,
        businessId: currentBiz.id,
      },
    ];
  }, [getCountersForBusiness, currentBiz.id, initialCounterName, staffName]);

  // Selected Counter
  const initialCounter =
    facilityCounters.find((c) => c.name.toLowerCase() === initialCounterName.toLowerCase()) ||
    facilityCounters[0];
  const [selectedCounterId, setSelectedCounterId] = useState<number>(initialCounter.id);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [queueFilter, setQueueFilter] = useState<'my-counter' | 'all'>('my-counter');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickVerifyCode, setQuickVerifyCode] = useState('');
  const [quickVerifyToast, setQuickVerifyToast] = useState<{ message: string; success: boolean } | null>(null);

  // Sync selectedCounterId if facilityCounters changes
  useEffect(() => {
    if (!facilityCounters.some((c) => c.id === selectedCounterId)) {
      setSelectedCounterId(facilityCounters[0].id);
    }
  }, [facilityCounters, selectedCounterId]);

  // Active counter & active ticket (find by currentTicketId or currently called/serving for this counter)
  const activeCounter = facilityCounters.find((c) => c.id === selectedCounterId) || facilityCounters[0];
  const currentTicket =
    tickets.find((t) => t.id === activeCounter.currentTicketId) ||
    tickets.find(
      (t) =>
        (t.status === 'called' || t.status === 'serving') &&
        (t.businessId === currentBiz.id || t.businessName?.toLowerCase() === currentBiz.name.toLowerCase()) &&
        (t.counterId === activeCounter.id || t.counterName === activeCounter.name)
    );

  // Service timer for active customer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentTicket && (currentTicket.status === 'called' || currentTicket.status === 'serving')) {
      const startTime = currentTicket.calledAt || Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));

      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [currentTicket]);

  // Auto-dismiss SMS notification toast after 8 seconds
  useEffect(() => {
    if (lastSentSms) {
      const timer = setTimeout(() => {
        clearLastSentSms();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [lastSentSms, clearLastSentSms]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtered tickets waiting for this facility
  const companyTickets = tickets.filter(
    (t) =>
      t.businessId === currentBiz.id ||
      t.businessName?.toLowerCase() === currentBiz.name.toLowerCase()
  );

  // Waiting tickets eligible for this counter
  const waitingForCounter = companyTickets
    .filter((t) => {
      if (t.status !== 'waiting') return false;
      // If counter was explicitly set up for this business with restricted categories, check them
      if (
        activeCounter.businessId === currentBiz.id &&
        activeCounter.assignedCategories &&
        activeCounter.assignedCategories.length > 0
      ) {
        return activeCounter.assignedCategories.includes(t.categoryId);
      }
      return true;
    })
    .sort((a, b) => {
      if (a.categoryId === 'vip' && b.categoryId !== 'vip') return -1;
      if (b.categoryId === 'vip' && a.categoryId !== 'vip') return 1;
      return a.createdAt - b.createdAt;
    });

  // Display queue based on tab
  const displayedWaitingTickets = (queueFilter === 'my-counter' ? waitingForCounter : companyTickets.filter((t) => t.status === 'waiting'))
    .filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        t.number.toLowerCase().includes(q) ||
        (t.customerName && t.customerName.toLowerCase().includes(q)) ||
        t.categoryName.toLowerCase().includes(q)
      );
    });

  // Stats
  const completedTodayCount = companyTickets.filter((t) => t.status === 'completed').length;
  const nextInLine = waitingForCounter[0];

  const handleCallNext = () => {
    if (isOnBreak) return;
    callNextTicket(activeCounter.id, currentBiz.id, activeCounter.name);
  };

  const handleComplete = () => {
    if (!currentTicket) return;
    completeTicket(activeCounter.id, currentTicket.id);
    confetti({
      particleCount: 40,
      spread: 55,
      origin: { y: 0.6 },
      colors: ['#00A843', '#10b981', '#3b82f6'],
    });
  };


  const handleQuickVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickVerifyCode.trim()) return;

    const res = await scanTicket(quickVerifyCode.trim(), currentBiz?.id);
    if (res.success && res.ticket) {
      setQuickVerifyToast({
        message: `Ticket ${res.ticket.number} (${res.ticket.customerName}) verified & checked in!`,
        success: true,
      });
      setQuickVerifyCode('');
    } else {
      setQuickVerifyToast({
        message: res.message || 'Ticket not found.',
        success: false,
      });
    }

    setTimeout(() => {
      setQuickVerifyToast(null);
    }, 3500);
  };

  return (
    <div
      className={`w-full h-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col transition-colors duration-200 select-none ${
        darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#F4FAF6] text-slate-900'
      }`}
    >
      {/* ============================================================== */}
      {/* 1. TOP STAFF NAVIGATION & IDENTITY BAR                          */}
      {/* ============================================================== */}
      <header
        className={`w-full border-b flex-shrink-0 z-40 px-4 sm:px-6 py-3 transition-colors ${
          darkMode
            ? 'bg-[#182335]/95 border-slate-700/80 backdrop-blur-md'
            : 'bg-white/95 border-slate-200 backdrop-blur-md shadow-2xs'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Branding & Station Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00A843] flex items-center justify-center text-white font-extrabold shadow-sm shadow-emerald-700/20 flex-shrink-0">
              <span className="text-xl leading-none">Q</span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  {currentBiz?.name || companyName}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Staff Console
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isOnBreak ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
                <span>
                  {isOnBreak ? 'Counter On Break' : `Assigned to ${activeCounter.name}`}
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {staffName || activeCounter.staffName || 'Operator'}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Quick Actions & Profile Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
            {/* Quick Ticket Verification Modal Button */}
            <button
              onClick={() => setShowVerifyModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
              title="Verify customer arrival ticket"
            >
              <TicketIcon className="w-3.5 h-3.5" />
              <span>Verify Ticket</span>
            </button>

            {/* Break Toggle */}
            <button
              onClick={() => setIsOnBreak(!isOnBreak)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                isOnBreak
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300'
                  : darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title={isOnBreak ? 'Resume Counter Service' : 'Pause for break'}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>{isOnBreak ? 'Resume Work' : 'Take Break'}</span>
            </button>

            {/* SMS Gateway Setup */}
            <button
              onClick={() => setShowSmsModal(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="SMS Gateway & Phone Delivery Settings"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">SMS Gateway</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title={soundEnabled ? 'Chimes ON' : 'Audio muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                setActiveStaff(null);
                onSignOut();
              }}
              className={`flex items-center space-x-1.5 text-xs font-semibold py-1.5 px-3 rounded-xl border transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20'
                  : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
              }`}
              title="Sign out of staff portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Center Content Container */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {/* Quick Verify Notification Toast */}
        {quickVerifyToast && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center space-x-2 animate-scale-in shadow-sm ${
              quickVerifyToast.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            {quickVerifyToast.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <UserX className="w-4 h-4 text-rose-500 flex-shrink-0" />
            )}
            <span>{quickVerifyToast.message}</span>
          </div>
        )}

        {/* Real-time SMS Dispatch Alert Banner */}
        {lastSentSms && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-sky-500/15 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in text-xs sm:text-sm">
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md mt-0.5 sm:mt-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                    SMS Alert for Ticket #{lastSentSms.ticketNumber}!
                  </span>
                  <span className="font-mono font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs">
                    {lastSentSms.toPhone}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    ({lastSentSms.customerName})
                  </span>
                  {lastSentSms.provider && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      via {lastSentSms.provider}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-1 font-mono">
                  &ldquo;{lastSentSms.message}&rdquo;
                </p>
                {lastSentSms.requiresGatewaySetup && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
                    <span>⚠️ Cellular gateway credentials not set yet. Tap &apos;Send via Phone&apos; or click Setup to connect Twilio / Africa&apos;s Talking / Termii.</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
              {lastSentSms.nativeSmsUrl && (
                <a
                  href={lastSentSms.nativeSmsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 shadow-xs cursor-pointer transition-all"
                  title="Send via your phone's Messages app directly"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Send via Phone</span>
                </a>
              )}

              {lastSentSms.whatsappUrl && (
                <a
                  href={lastSentSms.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center space-x-1 shadow-xs cursor-pointer transition-all"
                  title="Send via WhatsApp directly"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}

              <button
                onClick={() => setShowSmsModal(true)}
                className="py-1.5 px-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
                title="Configure Twilio, Termii, or Africa's Talking API"
              >
                Setup
              </button>

              <button
                onClick={clearLastSentSms}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                title="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. STATS & SUMMARY METRICS BAR                                 */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Active Counter */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-200/80 shadow-2xs'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Station
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeCounter.name}
              </span>
              <span className="text-xs font-semibold text-emerald-500">
                {isOnBreak ? 'Paused' : 'Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-1">
              Categories: {activeCounter.assignedCategories.join(', ')}
            </p>
          </div>

          {/* Card 2: Waiting in Line */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-200/80 shadow-2xs'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              In Your Queue
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {waitingForCounter.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">waiting now</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Est. time: ~{Math.max(3, waitingForCounter.length * 4)} mins
            </p>
          </div>

          {/* Card 3: Served Today */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-200/80 shadow-2xs'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Served Today
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
                {activeCounter.servedCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">customers</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Facility total: {completedTodayCount}
            </p>
          </div>

          {/* Card 4: Service Duration */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-200/80 shadow-2xs'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Current Duration
            </span>
            <div className="flex items-baseline space-x-1.5 font-mono">
              <span className="text-xl sm:text-2xl font-black text-amber-500">
                {formatTimer(elapsedSeconds)}
              </span>
              <span className="text-xs text-slate-400">elapsed</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Avg pace: ~4 min / ticket
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. HERO ACTIVE SERVICE CONSOLE (NOW SERVING)                   */}
        {/* ============================================================== */}
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-sm relative overflow-hidden transition-all ${
            darkMode
              ? 'bg-gradient-to-br from-[#182335] to-[#111a28] border-slate-700/70'
              : 'bg-white border-slate-200'
          }`}
        >
          {isOnBreak ? (
            /* Break State */
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {activeCounter.name} is on Break
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                Your queue is paused. Customers will not be assigned to this counter until you resume.
              </p>
              <button
                onClick={() => setIsOnBreak(false)}
                className="py-3 px-6 rounded-2xl bg-[#00A843] hover:bg-[#00963c] text-white font-bold text-sm shadow-md shadow-emerald-700/20 cursor-pointer transition-all"
              >
                Resume Counter Service
              </button>
            </div>
          ) : currentTicket ? (
            /* Active Customer Being Called or Served */
            <div className="space-y-6">
              {/* Top Banner: Status & Category */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700/60">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        currentTicket.status === 'called'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {currentTicket.status === 'called' ? 'Calling Customer...' : 'Serving Customer'}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {currentTicket.categoryName}
                    </span>
                    {currentTicket.isScanned && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Arrived & Verified</span>
                      </span>
                    )}
                  </div>

                  {/* Big Bold Ticket Number */}
                  <h2 className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                    {currentTicket.number}
                  </h2>

                  <div className="mt-2 flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <span className="flex items-center space-x-1">
                      <User className="w-4 h-4 text-slate-400" />
                      <strong>{currentTicket.customerName || 'Customer'}</strong>
                    </span>
                    {currentTicket.phoneNumber && (
                      <>
                        <span className="text-slate-400">•</span>
                        <span>{currentTicket.phoneNumber}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Service Stopwatch Card */}
                <div
                  className={`p-4 rounded-2xl border flex items-center space-x-3 sm:self-start ${
                    darkMode
                      ? 'bg-slate-900/80 border-slate-700/80'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Clock className="w-6 h-6 text-emerald-500 animate-spin" style={{ animationDuration: '8s' }} />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Service Duration
                    </span>
                    <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {formatTimer(elapsedSeconds)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {/* 1. Recall Ticket / Chime */}
                <button
                  onClick={() => recallTicket(activeCounter.id, currentTicket.id)}
                  className="py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Megaphone className="w-4 h-4 text-sky-400" />
                  <span>Recall Chime</span>
                </button>

                {/* 2. Start Serving (if called) */}
                {currentTicket.status === 'called' ? (
                  <button
                    onClick={() => startServing(activeCounter.id, currentTicket.id)}
                    title="Start serving customer & automatically send SMS alert to the next ticket in line"
                    className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Serving</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 opacity-60 cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                    <span>Serving Now</span>
                  </button>
                )}

                {/* 3. Complete Ticket */}
                <button
                  onClick={handleComplete}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/25 active:scale-95"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Finish & Complete</span>
                </button>

                {/* 4. Mark No Show */}
                <button
                  onClick={() => markNoShow(activeCounter.id, currentTicket.id)}
                  className="py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95"
                >
                  <UserX className="w-4 h-4" />
                  <span>No-Show</span>
                </button>
              </div>
            </div>
          ) : (
            /* Idle Ready State */
            <div className="py-8 sm:py-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
                <Users className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1.5">
                {activeCounter.name} is Ready
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                There are currently <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{waitingForCounter.length}</strong> customer(s) waiting in your line.
              </p>

              {/* Next in Line Preview Badge */}
              {nextInLine && (
                <div className="mb-6 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 inline-flex items-center space-x-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-mono font-black text-sm flex items-center justify-center shadow-xs">
                    {nextInLine.number}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Next: {nextInLine.customerName || 'Customer'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {nextInLine.categoryName} • Waiting {Math.max(1, Math.floor((Date.now() - nextInLine.createdAt) / 60000))}m
                    </span>
                  </div>
                </div>
              )}

              {/* Big Energetic Call Next Customer Button */}
              <button
                onClick={handleCallNext}
                disabled={waitingForCounter.length === 0}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-xl shadow-emerald-700/25 flex items-center space-x-3 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                <Megaphone className="w-5 h-5" />
                <span>CALL NEXT CUSTOMER</span>
              </button>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 4. STATION SWITCHER (FACILITY COUNTERS GRID)                   */}
        {/* ============================================================== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Facility Counters ({facilityCounters.length})
            </h4>
            <span className="text-xs text-slate-500">
              {facilityCounters.length === 1 ? '1 Active Station' : 'Click a counter to operate it'}
            </span>
          </div>

          <div className={`grid gap-2.5 ${
            facilityCounters.length === 1
              ? 'grid-cols-1 max-w-sm'
              : facilityCounters.length === 2
              ? 'grid-cols-2 max-w-xl'
              : 'grid-cols-2 sm:grid-cols-4'
          }`}>
            {facilityCounters.map((c) => {
              const isSelected = c.id === selectedCounterId;
              const isBusy = c.currentTicketId !== undefined;
              const busyTicket = tickets.find((t) => t.id === c.currentTicketId);
              const opName = c.id === activeCounter.id ? staffName : (c.staffName || 'Operator');

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCounterId(c.id)}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : darkMode
                      ? 'bg-[#182335] border-slate-700/60 hover:bg-[#202d42]'
                      : 'bg-white border-slate-200 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {c.name}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        c.status === 'serving'
                          ? 'bg-emerald-500 animate-pulse'
                          : c.status === 'calling'
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                    {opName}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/40 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{c.servedCount} served</span>
                    <span
                      className={`font-mono font-bold ${
                        isBusy ? 'text-amber-500' : 'text-emerald-500'
                      }`}
                    >
                      {busyTicket ? busyTicket.number : 'Idle'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. WAITING QUEUE TABLE & QUICK CHECK-IN BAR                    */}
        {/* ============================================================== */}
        <div
          className={`rounded-3xl p-5 sm:p-6 border shadow-sm space-y-4 transition-colors ${
            darkMode ? 'bg-[#182335] border-slate-700/60' : 'bg-white border-slate-200'
          }`}
        >
          {/* Queue Header with Filters & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQueueFilter('my-counter')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  queueFilter === 'my-counter'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : darkMode
                    ? 'bg-slate-800 text-slate-300 hover:text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                My Counter Queue ({waitingForCounter.length})
              </button>

              <button
                onClick={() => setQueueFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  queueFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : darkMode
                    ? 'bg-slate-800 text-slate-300 hover:text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Facility Tickets ({companyTickets.filter((t) => t.status === 'waiting').length})
              </button>
            </div>

            {/* In-Portal Quick Verify Ticket Input Bar */}
            <form onSubmit={handleQuickVerify} className="flex items-center space-x-2">
              <div className="relative">
                <TicketIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={quickVerifyCode}
                  onChange={(e) => setQuickVerifyCode(e.target.value)}
                  placeholder="Verify Ticket #..."
                  className={`w-36 sm:w-44 pl-8 pr-3 py-1.5 rounded-xl text-xs font-mono font-bold border outline-none ${
                    darkMode
                      ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={!quickVerifyCode.trim()}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
              >
                Check In
              </button>
            </form>
          </div>

          {/* Ticket List Cards */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {displayedWaitingTickets.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No tickets currently waiting in this queue.
              </div>
            ) : (
              displayedWaitingTickets.map((t, idx) => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    t.isScanned
                      ? 'bg-emerald-500/5 border-emerald-500/25'
                      : darkMode
                      ? 'bg-slate-900/60 border-slate-700/50 hover:bg-slate-900'
                      : 'bg-slate-50/70 border-slate-200/70 hover:bg-white hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-slate-400 w-5">
                      #{idx + 1}
                    </span>

                    <div className="w-12 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono font-black text-sm">
                      {t.number}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {t.customerName || 'Customer'}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {t.categoryName}
                        </span>
                        {t.categoryId === 'vip' && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-500 text-[10px] font-black">
                            VIP
                          </span>
                        )}
                        {t.id === nextInLine?.id && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center space-x-1">
                            <Smartphone className="w-2.5 h-2.5" />
                            <span>Next in line • SMS ready</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="flex items-center space-x-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Waiting {Math.max(1, Math.floor((Date.now() - t.createdAt) / 60000))}m</span>
                        </span>
                        {t.phoneNumber && (
                          <span className="text-slate-500 dark:text-slate-400 font-mono flex items-center space-x-0.5">
                            <Smartphone className="w-3 h-3 text-emerald-500" />
                            <span>{t.phoneNumber}</span>
                          </span>
                        )}
                        {t.isScanned && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Arrived</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this Ticket */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Scan/verify ticket
                        scanTicket(t.number, currentBiz?.id);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        t.isScanned
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      title="Mark customer arrived"
                    >
                      {t.isScanned ? 'Checked In' : 'Check In'}
                    </button>

                    <button
                      onClick={() => {
                        // Call this specific ticket immediately to active counter
                        callNextTicket(activeCounter.id, currentBiz.id, activeCounter.name, t.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 shadow-xs"
                    >
                      <span>Call Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Ticket Verification Modal */}
      {showVerifyModal && (
        <QRScannerModal
          business={currentBiz}
          onClose={() => setShowVerifyModal(false)}
        />
      )}

      {/* SMS Gateway Setup & Testing Modal */}
      <SmsGatewayModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        lastSentSms={lastSentSms}
        darkMode={darkMode}
      />
    </div>
  );
};
