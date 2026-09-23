export type ServiceId = 'general' | 'billing' | 'tech' | 'vip';

export interface ServiceCategory {
  id: ServiceId;
  name: string;
  code: string;
  avgMinutes: number;
  description: string;
  color: string;
}

export type TicketStatus = 'waiting' | 'called' | 'serving' | 'completed' | 'noshow';

export interface Ticket {
  id: string;
  number: string;
  categoryId: ServiceId;
  categoryName: string;
  customerName?: string;
  phoneNumber?: string;
  status: TicketStatus;
  counterId?: number;
  counterName?: string;
  createdAt: number;
  calledAt?: number;
  completedAt?: number;
}

export interface Counter {
  id: number;
  name: string;
  staffName: string;
  status: 'idle' | 'calling' | 'serving';
  currentTicketId?: string;
  assignedCategories: ServiceId[];
  servedCount: number;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'general',
    name: 'General Inquiries',
    code: 'A',
    avgMinutes: 4,
    description: 'Information, registrations, consultations & general help',
    color: 'emerald',
  },
  {
    id: 'billing',
    name: 'Billing & Payments',
    code: 'B',
    avgMinutes: 6,
    description: 'Invoices, fee payments, refunds & account settlements',
    color: 'blue',
  },
  {
    id: 'tech',
    name: 'Customer Support',
    code: 'C',
    avgMinutes: 8,
    description: 'Technical troubleshooting, hardware & account assistance',
    color: 'violet',
  },
  {
    id: 'vip',
    name: 'VIP & Express',
    code: 'V',
    avgMinutes: 3,
    description: 'Priority service, corporate accounts & express verification',
    color: 'amber',
  },
];
