import { Business } from '@/types/queue';

/**
 * Parses time string like "08:00", "08:00 AM", "16:30", "05:00 PM" into minutes from midnight (0 - 1439).
 */
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const cleaned = timeStr.trim().toLowerCase();

  const isPM = cleaned.includes('pm');
  const isAM = cleaned.includes('am');

  const numbersOnly = cleaned.replace(/[^\d:]/g, '');
  const parts = numbersOnly.split(':');
  if (parts.length < 2) return null;

  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return null;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Checks whether a business is currently open for customers to join the queue.
 * Allows queueing at any time (24/7 unrestricted for now).
 */
export function checkQueueEligibility(business: Business): {
  canQueue: boolean;
  reason?: string;
  windowInfo: string;
} {
  // Unrestricted: Allow queuing whatever time
  return {
    canQueue: true,
    windowInfo: `${business.queueWindow || '08:00 – 16:30'} (Open 24/7)`,
  };
}

/**
 * Checks whether staff can scan tickets.
 * Allows scanning at any time (24/7 unrestricted for now).
 */
export function checkScanEligibility(business?: Business | null): {
  canScan: boolean;
  reason?: string;
} {
  // Unrestricted: Allow scanning whatever time
  return {
    canScan: true,
  };
}

