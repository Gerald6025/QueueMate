'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, Counter, ServiceId, SERVICE_CATEGORIES, Business, StaffMember } from '@/types/queue';
import { AudioService } from '@/utils/audio';
import {
  isSupabaseConfigured,
  getBusinessesFromDB,
  saveBusinessToDB,
  deleteBusinessFromDB,
  getStaffFromDB,
  saveStaffMemberToDB,
  deleteStaffFromDB,
  getTicketsFromDB,
  saveTicketToDB,
  deleteTicketFromDB,
} from '@/lib/supabase';

interface QueueContextType {
  tickets: Ticket[];
  counters: Counter[];
  businesses: Business[];
  staffMembers: StaffMember[];
  currentCustomerTicket: Ticket | null;
  lastCalledTicket: Ticket | null;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  issueTicket: (
    categoryId: ServiceId, 
    name?: string, 
    phone?: string, 
    businessId?: string, 
    businessName?: string
  ) => Ticket;
  deleteTicket: (ticketId: string) => Promise<void>;
  callNextTicket: (counterId: number) => Ticket | null;
  recallTicket: (counterId: number) => void;
  startServing: (counterId: number) => void;
  completeTicket: (counterId: number) => void;
  markNoShow: (counterId: number) => void;
  resetQueues: () => void;
  seedDemoTickets: () => void;
  cancelCustomerTicket: (ticketId: string) => void;
  getWaitingCountForCategory: (categoryId: ServiceId, businessId?: string) => number;
  getEstimatedWaitMinutes: (ticket: Ticket) => number;
  getQueuePosition: (ticket: Ticket) => number;
  registerBusiness: (business: Omit<Business, 'id'>) => Promise<Business>;
  updateBusiness: (id: string, updates: Partial<Business>) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
  addStaffMember: (staff: Omit<StaffMember, 'id'>) => Promise<StaffMember>;
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => Promise<void>;
  deleteStaffMember: (id: string) => Promise<void>;
  scanTicket: (
    qrOrTicketId: string, 
    businessId?: string
  ) => Promise<{ success: boolean; message: string; ticket?: Ticket }>;
}

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'city-bank',
    name: 'City Bank',
    industry: 'Banking',
    description: 'Full-service banking for personal and corporate finance',
    fullDescription: 'Full-service banking for all your personal and business financial needs.',
    email: 'admin@citybank.com',
    workingHours: '08:00 – 17:00',
    queueWindow: '08:00 – 16:30',
    opensAt: '08:00 AM',
    closesAt: '05:00 PM',
    queueOpens: '08:00 AM',
    queueCloses: '04:30 PM',
    dailyCapacity: '100',
    status: 'Open',
    waitingCount: 3,
    estWait: '5 min',
    icon: 'bank',
  },
  {
    id: 'health-plus',
    name: 'Health Plus Clinic',
    industry: 'Healthcare',
    description: 'Primary care, specialist consultations & emergency services',
    fullDescription: 'Primary care, specialist consultations, and emergency health services.',
    email: 'admin@healthplus.com',
    workingHours: '07:00 – 16:00',
    queueWindow: '07:30 – 15:30',
    opensAt: '07:00 AM',
    closesAt: '04:00 PM',
    queueOpens: '07:30 AM',
    queueCloses: '03:30 PM',
    dailyCapacity: '80',
    status: 'Open',
    waitingCount: 2,
    estWait: '10 min',
    icon: 'clinic',
  },
  {
    id: 'tech-mart',
    name: 'TechMart',
    industry: 'Retail',
    description: 'Electronics, gadgets and warranty repair counter',
    fullDescription: 'Electronics, gadgets, and tech accessories customer support and sales.',
    email: 'support@techmart.com',
    workingHours: '08:30 – 18:00',
    queueWindow: '09:00 – 17:30',
    opensAt: '08:30 AM',
    closesAt: '06:00 PM',
    queueOpens: '09:00 AM',
    queueCloses: '05:30 PM',
    dailyCapacity: '120',
    status: 'Open',
    waitingCount: 1,
    estWait: '5 min',
    icon: 'techmart',
  },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    businessId: 'city-bank',
    businessName: 'City Bank',
    name: 'Elena Rostova',
    email: 'elena@citybank.com',
    role: 'Senior Teller',
    counterName: 'Counter 1',
    staffPin: '1234',
    active: true,
  },
  {
    id: 'staff-2',
    businessId: 'city-bank',
    businessName: 'City Bank',
    name: 'Marcus Chen',
    email: 'marcus@citybank.com',
    role: 'Customer Representative',
    counterName: 'Counter 2',
    staffPin: '2345',
    active: true,
  },
  {
    id: 'staff-3',
    businessId: 'health-plus',
    businessName: 'Health Plus Clinic',
    name: 'Dr. Sophia Patel',
    email: 'sophia@healthplus.com',
    role: 'Triage Nurse',
    counterName: 'Counter 1',
    staffPin: '3456',
    active: true,
  },
  {
    id: 'staff-4',
    businessId: 'tech-mart',
    businessName: 'TechMart',
    name: 'David Kim',
    email: 'david@techmart.com',
    role: 'Tech Specialist',
    counterName: 'Counter 1',
    staffPin: '4567',
    active: true,
  },
];

const INITIAL_COUNTERS: Counter[] = [
  {
    id: 1,
    name: 'Counter 1',
    staffName: 'Elena Rostova',
    status: 'idle',
    assignedCategories: ['general', 'billing'],
    servedCount: 0,
    businessId: 'city-bank',
  },
  {
    id: 2,
    name: 'Counter 2',
    staffName: 'Marcus Chen',
    status: 'idle',
    assignedCategories: ['general', 'tech'],
    servedCount: 0,
    businessId: 'city-bank',
  },
  {
    id: 3,
    name: 'Counter 3',
    staffName: 'Sophia Patel',
    status: 'idle',
    assignedCategories: ['billing', 'tech'],
    servedCount: 0,
    businessId: 'health-plus',
  },
  {
    id: 4,
    name: 'Counter 4 (VIP)',
    staffName: 'David Kim',
    status: 'idle',
    assignedCategories: ['vip', 'general'],
    servedCount: 0,
    businessId: 'tech-mart',
  },
];

const INITIAL_DEMO_TICKETS: Ticket[] = [
  {
    id: 't-101',
    number: 'A-101',
    businessId: 'city-bank',
    businessName: 'City Bank',
    categoryId: 'general',
    categoryName: 'General Inquiries',
    customerName: 'Sarah Jenkins',
    status: 'completed',
    counterId: 1,
    counterName: 'Counter 1',
    isScanned: true,
    scannedAt: Date.now() - 40 * 60 * 1000,
    createdAt: Date.now() - 45 * 60 * 1000,
    calledAt: Date.now() - 40 * 60 * 1000,
    completedAt: Date.now() - 32 * 60 * 1000,
  },
  {
    id: 't-102',
    number: 'B-201',
    businessId: 'city-bank',
    businessName: 'City Bank',
    categoryId: 'billing',
    categoryName: 'Billing & Payments',
    customerName: 'Michael Brown',
    status: 'completed',
    counterId: 2,
    counterName: 'Counter 2',
    isScanned: true,
    scannedAt: Date.now() - 25 * 60 * 1000,
    createdAt: Date.now() - 30 * 60 * 1000,
    calledAt: Date.now() - 25 * 60 * 1000,
    completedAt: Date.now() - 15 * 60 * 1000,
  },
  {
    id: 't-103',
    number: 'A-102',
    businessId: 'city-bank',
    businessName: 'City Bank',
    categoryId: 'general',
    categoryName: 'General Inquiries',
    customerName: 'Emma Watson',
    status: 'serving',
    counterId: 1,
    counterName: 'Counter 1',
    isScanned: true,
    scannedAt: Date.now() - 8 * 60 * 1000,
    createdAt: Date.now() - 20 * 60 * 1000,
    calledAt: Date.now() - 8 * 60 * 1000,
  },
  {
    id: 't-104',
    number: 'V-501',
    businessId: 'city-bank',
    businessName: 'City Bank',
    categoryId: 'vip',
    categoryName: 'VIP & Express',
    customerName: 'Jonathan Hayes',
    status: 'waiting',
    isScanned: false,
    createdAt: Date.now() - 12 * 60 * 1000,
  },
  {
    id: 't-105',
    number: 'A-103',
    businessId: 'city-bank',
    businessName: 'City Bank',
    categoryId: 'general',
    categoryName: 'General Inquiries',
    customerName: 'Liam Miller',
    status: 'waiting',
    isScanned: false,
    createdAt: Date.now() - 10 * 60 * 1000,
  },
  {
    id: 't-106',
    number: 'A-104',
    businessId: 'health-plus',
    businessName: 'Health Plus Clinic',
    categoryId: 'general',
    categoryName: 'General Consultation',
    customerName: 'Claire Redfield',
    status: 'waiting',
    isScanned: false,
    createdAt: Date.now() - 5 * 60 * 1000,
  },
];

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(INITIAL_STAFF);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_DEMO_TICKETS);
  const [counters, setCounters] = useState<Counter[]>(INITIAL_COUNTERS);

  const [currentCustomerTicket, setCurrentCustomerTicket] = useState<Ticket | null>(null);
  const [lastCalledTicket, setLastCalledTicket] = useState<Ticket | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Initialize from Supabase if configured, otherwise localStorage
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured()) {
        try {
          const [dbBusinesses, dbStaff, dbTickets] = await Promise.all([
            getBusinessesFromDB(),
            getStaffFromDB(),
            getTicketsFromDB(),
          ]);

          if (dbBusinesses && dbBusinesses.length > 0) setBusinesses(dbBusinesses);
          if (dbStaff && dbStaff.length > 0) setStaffMembers(dbStaff);
          if (dbTickets && dbTickets.length > 0) setTickets(dbTickets);
        } catch (err) {
          console.warn('Supabase fetch failed on mount, using local fallback:', err);
        }
      } else {
        try {
          const savedBusinesses = localStorage.getItem('queuemate_businesses');
          const savedStaff = localStorage.getItem('queuemate_staff');
          const savedTickets = localStorage.getItem('qms_tickets');
          const savedCounters = localStorage.getItem('qms_counters');
          const savedCustomerTicket = localStorage.getItem('qms_my_ticket');
          const savedDark = localStorage.getItem('queuemate_setting_dark');

          if (savedBusinesses) setBusinesses(JSON.parse(savedBusinesses));
          if (savedStaff) setStaffMembers(JSON.parse(savedStaff));
          if (savedTickets) setTickets(JSON.parse(savedTickets));
          if (savedCounters) setCounters(JSON.parse(savedCounters));
          if (savedCustomerTicket) setCurrentCustomerTicket(JSON.parse(savedCustomerTicket));
          if (savedDark !== null) setDarkMode(savedDark === 'true');
        } catch {
          // LocalStorage fallback
        }
      }
    }

    loadData();
  }, []);

  // Sync darkMode with html document element and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('queuemate_setting_dark', String(darkMode));
    } catch {}
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  // Persist state changes locally
  useEffect(() => {
    try {
      localStorage.setItem('queuemate_businesses', JSON.stringify(businesses));
      localStorage.setItem('queuemate_staff', JSON.stringify(staffMembers));
      localStorage.setItem('qms_tickets', JSON.stringify(tickets));
      localStorage.setItem('qms_counters', JSON.stringify(counters));
      if (currentCustomerTicket) {
        localStorage.setItem('qms_my_ticket', JSON.stringify(currentCustomerTicket));
      } else {
        localStorage.removeItem('qms_my_ticket');
      }
    } catch {
      // ignore
    }
  }, [businesses, staffMembers, tickets, counters, currentCustomerTicket]);

  // Keep customer ticket up to date if status changes
  useEffect(() => {
    if (!currentCustomerTicket) return;
    const fresh = tickets.find((t) => t.id === currentCustomerTicket.id);
    if (fresh) {
      setCurrentCustomerTicket(fresh);
    }
  }, [tickets]);

  // ========================================================
  // BUSINESS OPERATIONS
  // ========================================================
  const registerBusiness = async (businessData: Omit<Business, 'id'>): Promise<Business> => {
    const id = businessData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || `biz-${Date.now()}`;
    const newBusiness: Business = {
      ...businessData,
      id,
      createdAt: new Date().toISOString(),
    };

    setBusinesses((prev) => [newBusiness, ...prev.filter((b) => b.id !== id)]);

    // Add initial counter & default staff
    const initialStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      businessId: id,
      businessName: newBusiness.name,
      name: `${newBusiness.name} Admin Staff`,
      email: newBusiness.email || `admin@${id}.com`,
      role: 'Business Admin',
      counterName: 'Counter 1',
      staffPin: '1234',
      active: true,
    };
    setStaffMembers((prev) => [initialStaff, ...prev]);

    // Save to Supabase
    saveBusinessToDB(newBusiness);
    saveStaffMemberToDB(initialStaff);

    return newBusiness;
  };

  const updateBusiness = async (id: string, updates: Partial<Business>) => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, ...updates };
          saveBusinessToDB(updated);
          return updated;
        }
        return b;
      })
    );
  };

  const deleteBusiness = async (id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
    setStaffMembers((prev) => prev.filter((s) => s.businessId !== id));
    setTickets((prev) => prev.filter((t) => t.businessId !== id));

    deleteBusinessFromDB(id);
  };

  // ========================================================
  // STAFF OPERATIONS
  // ========================================================
  const addStaffMember = async (staffData: Omit<StaffMember, 'id'>): Promise<StaffMember> => {
    const newStaff: StaffMember = {
      ...staffData,
      id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    setStaffMembers((prev) => [newStaff, ...prev]);
    saveStaffMemberToDB(newStaff);
    return newStaff;
  };

  const updateStaffMember = async (id: string, updates: Partial<StaffMember>) => {
    setStaffMembers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          saveStaffMemberToDB(updated);
          return updated;
        }
        return s;
      })
    );
  };

  const deleteStaffMember = async (id: string) => {
    setStaffMembers((prev) => prev.filter((s) => s.id !== id));
    deleteStaffFromDB(id);
  };

  // ========================================================
  // TICKET & QUEUE OPERATIONS
  // ========================================================
  const issueTicket = (
    categoryId: ServiceId, 
    name?: string, 
    phone?: string,
    businessId = 'city-bank',
    businessName = 'City Bank'
  ): Ticket => {
    const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId)!;
    
    // Count existing tickets in this category for this business
    const categoryTickets = tickets.filter(
      (t) => t.categoryId === categoryId && (!t.businessId || t.businessId === businessId)
    );
    const nextSeq = categoryTickets.length + 101;
    const ticketNumber = `${category.code}-${nextSeq}`;
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const newTicket: Ticket = {
      id: ticketId,
      number: ticketNumber,
      businessId,
      businessName,
      categoryId,
      categoryName: category.name,
      customerName: name || `Customer #${nextSeq}`,
      phoneNumber: phone,
      status: 'waiting',
      isScanned: false,
      createdAt: Date.now(),
      qrCodeData: JSON.stringify({
        ticketId,
        number: ticketNumber,
        businessId,
        businessName,
      }),
    };

    setTickets((prev) => [...prev, newTicket]);
    setCurrentCustomerTicket(newTicket);

    // Save to Supabase
    saveTicketToDB(newTicket);

    return newTicket;
  };

  const deleteTicket = async (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    if (currentCustomerTicket?.id === ticketId) {
      setCurrentCustomerTicket(null);
    }
    deleteTicketFromDB(ticketId);
  };

  const scanTicket = async (
    qrOrTicketId: string, 
    businessId?: string
  ): Promise<{ success: boolean; message: string; ticket?: Ticket }> => {
    let targetTicketId = qrOrTicketId.trim();
    let targetNumber = qrOrTicketId.trim();

    // Check if JSON payload from QR Code
    if (qrOrTicketId.startsWith('{')) {
      try {
        const parsed = JSON.parse(qrOrTicketId);
        if (parsed.ticketId) targetTicketId = parsed.ticketId;
        if (parsed.number) targetNumber = parsed.number;
      } catch {}
    }

    // Match ticket by ID or Number
    const matched = tickets.find(
      (t) =>
        t.id.toLowerCase() === targetTicketId.toLowerCase() ||
        t.number.toLowerCase() === targetNumber.toLowerCase()
    );

    if (!matched) {
      return {
        success: false,
        message: `Ticket "${qrOrTicketId}" not found in system.`,
      };
    }

    // Validate business match if businessId provided
    if (businessId && matched.businessId && matched.businessId !== businessId) {
      const ticketBiz = businesses.find((b) => b.id === matched.businessId)?.name || 'another business';
      return {
        success: false,
        message: `This ticket belongs to ${ticketBiz}, not your counter.`,
      };
    }

    // Mark as scanned & verified
    const updatedTicket: Ticket = {
      ...matched,
      isScanned: true,
      scannedAt: Date.now(),
    };

    setTickets((prev) => prev.map((t) => (t.id === matched.id ? updatedTicket : t)));
    saveTicketToDB(updatedTicket);

    if (soundEnabled) {
      AudioService.playCounterChime();
    }

    return {
      success: true,
      message: `Ticket ${matched.number} (${matched.customerName}) verified and checked in!`,
      ticket: updatedTicket,
    };
  };

  const callNextTicket = (counterId: number): Ticket | null => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter) return null;

    const eligibleTickets = tickets.filter(
      (t) =>
        t.status === 'waiting' &&
        counter.assignedCategories.includes(t.categoryId) &&
        (!counter.businessId || !t.businessId || t.businessId === counter.businessId)
    );

    if (eligibleTickets.length === 0) return null;

    eligibleTickets.sort((a, b) => {
      if (a.categoryId === 'vip' && b.categoryId !== 'vip') return -1;
      if (b.categoryId === 'vip' && a.categoryId !== 'vip') return 1;
      return a.createdAt - b.createdAt;
    });

    const ticketToCall = eligibleTickets[0];

    const updatedTicket: Ticket = {
      ...ticketToCall,
      status: 'called',
      counterId: counter.id,
      counterName: counter.name,
      calledAt: Date.now(),
    };

    setTickets((prev) => prev.map((t) => (t.id === ticketToCall.id ? updatedTicket : t)));
    saveTicketToDB(updatedTicket);

    setCounters((prev) =>
      prev.map((c) =>
        c.id === counterId
          ? {
              ...c,
              status: 'calling',
              currentTicketId: ticketToCall.id,
            }
          : c
      )
    );

    setLastCalledTicket(updatedTicket);

    if (soundEnabled) {
      AudioService.announceCall(updatedTicket.number, counter.name);
    }

    return updatedTicket;
  };

  const recallTicket = (counterId: number) => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    const currentTicket = tickets.find((t) => t.id === counter.currentTicketId);
    if (!currentTicket) return;

    setLastCalledTicket({ ...currentTicket, calledAt: Date.now() });

    if (soundEnabled) {
      AudioService.announceCall(currentTicket.number, counter.name);
    }
  };

  const startServing = (counterId: number) => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === counter.currentTicketId) {
          const updated: Ticket = { ...t, status: 'serving' };
          saveTicketToDB(updated);
          return updated;
        }
        return t;
      })
    );

    setCounters((prev) =>
      prev.map((c) => (c.id === counterId ? { ...c, status: 'serving' } : c))
    );
  };

  const completeTicket = (counterId: number) => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === counter.currentTicketId) {
          const updated: Ticket = { ...t, status: 'completed', completedAt: Date.now() };
          saveTicketToDB(updated);
          return updated;
        }
        return t;
      })
    );

    setCounters((prev) =>
      prev.map((c) =>
        c.id === counterId
          ? {
              ...c,
              status: 'idle',
              currentTicketId: undefined,
              servedCount: c.servedCount + 1,
            }
          : c
      )
    );
  };

  const markNoShow = (counterId: number) => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === counter.currentTicketId) {
          const updated: Ticket = { ...t, status: 'noshow', completedAt: Date.now() };
          saveTicketToDB(updated);
          return updated;
        }
        return t;
      })
    );

    setCounters((prev) =>
      prev.map((c) =>
        c.id === counterId
          ? {
              ...c,
              status: 'idle',
              currentTicketId: undefined,
            }
          : c
      )
    );
  };

  const cancelCustomerTicket = (ticketId: string) => {
    deleteTicket(ticketId);
  };

  const resetQueues = () => {
    setTickets([]);
    setCounters(INITIAL_COUNTERS);
    setCurrentCustomerTicket(null);
    setLastCalledTicket(null);
    try {
      localStorage.removeItem('qms_tickets');
      localStorage.removeItem('qms_counters');
      localStorage.removeItem('qms_my_ticket');
    } catch {
      // ignore
    }
  };

  const seedDemoTickets = () => {
    setTickets(INITIAL_DEMO_TICKETS);
    INITIAL_DEMO_TICKETS.forEach((t) => saveTicketToDB(t));
  };

  const getWaitingCountForCategory = (categoryId: ServiceId, businessId?: string): number => {
    return tickets.filter(
      (t) =>
        t.status === 'waiting' &&
        t.categoryId === categoryId &&
        (!businessId || !t.businessId || t.businessId === businessId)
    ).length;
  };

  const getQueuePosition = (ticket: Ticket): number => {
    const waitingSameCategory = tickets
      .filter(
        (t) =>
          t.status === 'waiting' &&
          t.categoryId === ticket.categoryId &&
          (!ticket.businessId || !t.businessId || t.businessId === ticket.businessId)
      )
      .sort((a, b) => a.createdAt - b.createdAt);

    const index = waitingSameCategory.findIndex((t) => t.id === ticket.id);
    return index >= 0 ? index + 1 : 1;
  };

  const getEstimatedWaitMinutes = (ticket: Ticket): number => {
    const position = getQueuePosition(ticket);
    const cat = SERVICE_CATEGORIES.find((c) => c.id === ticket.categoryId);
    const avgMin = cat ? cat.avgMinutes : 5;
    return Math.max(1, position * avgMin);
  };

  return (
    <QueueContext.Provider
      value={{
        tickets,
        counters,
        businesses,
        staffMembers,
        currentCustomerTicket,
        lastCalledTicket,
        soundEnabled,
        setSoundEnabled,
        darkMode,
        setDarkMode,
        issueTicket,
        deleteTicket,
        callNextTicket,
        recallTicket,
        startServing,
        completeTicket,
        markNoShow,
        resetQueues,
        seedDemoTickets,
        cancelCustomerTicket,
        getWaitingCountForCategory,
        getEstimatedWaitMinutes,
        getQueuePosition,
        registerBusiness,
        updateBusiness,
        deleteBusiness,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        scanTicket,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
