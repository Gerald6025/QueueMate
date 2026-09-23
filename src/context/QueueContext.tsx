'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, Counter, ServiceId, SERVICE_CATEGORIES } from '@/types/queue';
import { AudioService } from '@/utils/audio';

interface QueueContextType {
  tickets: Ticket[];
  counters: Counter[];
  currentCustomerTicket: Ticket | null;
  lastCalledTicket: Ticket | null;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  issueTicket: (categoryId: ServiceId, name?: string, phone?: string) => Ticket;
  callNextTicket: (counterId: number) => Ticket | null;
  recallTicket: (counterId: number) => void;
  startServing: (counterId: number) => void;
  completeTicket: (counterId: number) => void;
  markNoShow: (counterId: number) => void;
  resetQueues: () => void;
  seedDemoTickets: () => void;
  cancelCustomerTicket: (ticketId: string) => void;
  getWaitingCountForCategory: (categoryId: ServiceId) => number;
  getEstimatedWaitMinutes: (ticket: Ticket) => number;
  getQueuePosition: (ticket: Ticket) => number;
}

const INITIAL_COUNTERS: Counter[] = [
  {
    id: 1,
    name: 'Counter 1',
    staffName: 'Elena Rostova',
    status: 'idle',
    assignedCategories: ['general', 'billing'],
    servedCount: 0,
  },
  {
    id: 2,
    name: 'Counter 2',
    staffName: 'Marcus Chen',
    status: 'idle',
    assignedCategories: ['general', 'tech'],
    servedCount: 0,
  },
  {
    id: 3,
    name: 'Counter 3',
    staffName: 'Sophia Patel',
    status: 'idle',
    assignedCategories: ['billing', 'tech'],
    servedCount: 0,
  },
  {
    id: 4,
    name: 'Counter 4 (VIP)',
    staffName: 'David Kim',
    status: 'idle',
    assignedCategories: ['vip', 'general'],
    servedCount: 0,
  },
];

const DEMO_TICKETS: Ticket[] = [
  {
    id: 't-101',
    number: 'A-101',
    categoryId: 'general',
    categoryName: 'General Inquiries',
    customerName: 'Sarah Jenkins',
    status: 'completed',
    counterId: 1,
    counterName: 'Counter 1',
    createdAt: Date.now() - 45 * 60 * 1000,
    calledAt: Date.now() - 40 * 60 * 1000,
    completedAt: Date.now() - 32 * 60 * 1000,
  },
  {
    id: 't-102',
    number: 'B-201',
    categoryId: 'billing',
    categoryName: 'Billing & Payments',
    customerName: 'Michael Brown',
    status: 'completed',
    counterId: 2,
    counterName: 'Counter 2',
    createdAt: Date.now() - 30 * 60 * 1000,
    calledAt: Date.now() - 25 * 60 * 1000,
    completedAt: Date.now() - 15 * 60 * 1000,
  },
  {
    id: 't-103',
    number: 'A-102',
    categoryId: 'general',
    categoryName: 'General Inquiries',
    customerName: 'Emma Watson',
    status: 'serving',
    counterId: 1,
    counterName: 'Counter 1',
    createdAt: Date.now() - 20 * 60 * 1000,
    calledAt: Date.now() - 8 * 60 * 1000,
  },
  {
    id: 't-104',
    number: 'C-301',
    categoryId: 'tech',
    categoryName: 'Customer Support',
    customerName: 'Alex Rivera',
    status: 'serving',
    counterId: 3,
    counterName: 'Counter 3',
    createdAt: Date.now() - 18 * 60 * 1000,
    calledAt: Date.now() - 4 * 60 * 1000,
  },
  {
    id: 't-105',
    number: 'V-501',
    categoryId: 'vip',
    categoryName: 'VIP & Express',
    customerName: 'Jonathan Hayes',
    status: 'waiting',
    createdAt: Date.now() - 12 * 60 * 1000,
  },
  {
    id: 't-106',
    number: 'A-103',
    categoryId: 'general',
    categoryName: 'General Inquiries',
    customerName: 'Liam Miller',
    status: 'waiting',
    createdAt: Date.now() - 10 * 60 * 1000,
  },
  {
    id: 't-107',
    number: 'B-202',
    categoryId: 'billing',
    categoryName: 'Billing & Payments',
    customerName: 'Olivia Davis',
    status: 'waiting',
    createdAt: Date.now() - 7 * 60 * 1000,
  },
  {
    id: 't-108',
    number: 'C-302',
    categoryId: 'tech',
    categoryName: 'Customer Support',
    customerName: 'Noah Wilson',
    status: 'waiting',
    createdAt: Date.now() - 3 * 60 * 1000,
  },
];

const INITIAL_TICKETS: Ticket[] = [];

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [counters, setCounters] = useState<Counter[]>(INITIAL_COUNTERS);

  const [currentCustomerTicket, setCurrentCustomerTicket] = useState<Ticket | null>(null);
  const [lastCalledTicket, setLastCalledTicket] = useState<Ticket | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Load state from localStorage on client mount if present
  useEffect(() => {
    try {
      const savedTickets = localStorage.getItem('qms_tickets');
      const savedCounters = localStorage.getItem('qms_counters');
      const savedCustomerTicket = localStorage.getItem('qms_my_ticket');
      const savedDark = localStorage.getItem('queuemate_setting_dark');
      if (savedTickets) setTickets(JSON.parse(savedTickets));
      if (savedCounters) setCounters(JSON.parse(savedCounters));
      if (savedCustomerTicket) setCurrentCustomerTicket(JSON.parse(savedCustomerTicket));
      if (savedDark !== null) setDarkMode(savedDark === 'true');
    } catch {
      // LocalStorage fallback
    }
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

  // Save changes to localStorage
  useEffect(() => {
    try {
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
  }, [tickets, counters, currentCustomerTicket]);

  // Keep customer ticket up to date if status changes
  useEffect(() => {
    if (!currentCustomerTicket) return;
    const fresh = tickets.find((t) => t.id === currentCustomerTicket.id);
    if (fresh) {
      setCurrentCustomerTicket(fresh);
    }
  }, [tickets]);

  const issueTicket = (categoryId: ServiceId, name?: string, phone?: string): Ticket => {
    const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId)!;
    
    // Count existing tickets in this category to generate next number
    const categoryTickets = tickets.filter((t) => t.categoryId === categoryId);
    const nextSeq = categoryTickets.length + 101;
    const ticketNumber = `${category.code}-${nextSeq}`;

    const newTicket: Ticket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      number: ticketNumber,
      categoryId,
      categoryName: category.name,
      customerName: name || `Guest #${nextSeq}`,
      phoneNumber: phone,
      status: 'waiting',
      createdAt: Date.now(),
    };

    setTickets((prev) => [...prev, newTicket]);
    setCurrentCustomerTicket(newTicket);
    return newTicket;
  };

  const callNextTicket = (counterId: number): Ticket | null => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter) return null;

    // Find next waiting ticket matching counter's assigned categories
    // Prioritize VIP if counter serves it, or FIFO
    const eligibleTickets = tickets.filter(
      (t) => t.status === 'waiting' && counter.assignedCategories.includes(t.categoryId)
    );

    if (eligibleTickets.length === 0) return null;

    // Prioritize VIP, then earliest createdAt
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
      prev.map((t) => (t.id === counter.currentTicketId ? { ...t, status: 'serving' } : t))
    );

    setCounters((prev) =>
      prev.map((c) => (c.id === counterId ? { ...c, status: 'serving' } : c))
    );
  };

  const completeTicket = (counterId: number) => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === counter.currentTicketId
          ? { ...t, status: 'completed', completedAt: Date.now() }
          : t
      )
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
      prev.map((t) =>
        t.id === counter.currentTicketId
          ? { ...t, status: 'noshow', completedAt: Date.now() }
          : t
      )
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
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    if (currentCustomerTicket?.id === ticketId) {
      setCurrentCustomerTicket(null);
    }
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
    setTickets(DEMO_TICKETS);
    setCounters(
      INITIAL_COUNTERS.map((c) => {
        const active = DEMO_TICKETS.find(
          (t) => (t.status === 'serving' || t.status === 'called') && t.counterId === c.id
        );
        return {
          ...c,
          status: active ? (active.status === 'called' ? 'calling' : 'serving') : 'idle',
          currentTicketId: active ? active.id : undefined,
        };
      })
    );
  };

  const getWaitingCountForCategory = (categoryId: ServiceId) => {
    return tickets.filter((t) => t.status === 'waiting' && t.categoryId === categoryId).length;
  };

  const getQueuePosition = (ticket: Ticket): number => {
    if (ticket.status !== 'waiting') return 0;
    const waitingSameCategory = tickets
      .filter((t) => t.status === 'waiting' && t.categoryId === ticket.categoryId)
      .sort((a, b) => a.createdAt - b.createdAt);
    const index = waitingSameCategory.findIndex((t) => t.id === ticket.id);
    return index >= 0 ? index + 1 : 1;
  };

  const getEstimatedWaitMinutes = (ticket: Ticket): number => {
    const pos = getQueuePosition(ticket);
    const cat = SERVICE_CATEGORIES.find((c) => c.id === ticket.categoryId);
    const baseTime = cat ? cat.avgMinutes : 5;
    return Math.max(1, pos * baseTime);
  };

  return (
    <QueueContext.Provider
      value={{
        tickets,
        counters,
        currentCustomerTicket,
        lastCalledTicket,
        soundEnabled,
        setSoundEnabled,
        darkMode,
        setDarkMode,
        issueTicket,
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
