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
 * Strict enforcement: If status is 'Closed' or current time is outside queueWindow / queueOpens-queueCloses,
 * customers CANNOT queue.
 */
export function checkQueueEligibility(business: Business): {
  canQueue: boolean;
  reason?: string;
  windowInfo: string;
} {
  // 1. Check manual Open / Closed status
  if (business.status === 'Closed') {
    return {
      canQueue: false,
      reason: `${business.name} is currently closed. Queue joining is unavailable.`,
      windowInfo: business.queueWindow || 'Closed',
    };
  }

  // 2. Parse queue opening and closing times
  let openMinutes: number | null = null;
  let closeMinutes: number | null = null;

  if (business.queueOpens && business.queueCloses) {
    openMinutes = parseTimeToMinutes(business.queueOpens);
    closeMinutes = parseTimeToMinutes(business.queueCloses);
  } else if (business.queueWindow) {
    // e.g. "08:00 – 16:30" or "08:00-16:30"
    const split = business.queueWindow.split(/–|-/);
    if (split.length >= 2) {
      openMinutes = parseTimeToMinutes(split[0]);
      closeMinutes = parseTimeToMinutes(split[1]);
    }
  }

  // If time window cannot be parsed, rely on business.status
  if (openMinutes === null || closeMinutes === null) {
    return {
      canQueue: business.status === 'Open',
      reason: business.status === 'Open' ? undefined : 'Queue is closed.',
      windowInfo: business.queueWindow || 'Standard hours',
    };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (currentMinutes < openMinutes) {
    return {
      canQueue: false,
      reason: `Queue is currently closed. Queue opens at ${business.queueOpens || 'scheduled opening time'}.`,
      windowInfo: `${business.queueWindow} (Opens soon)`,
    };
  }

  if (currentMinutes > closeMinutes) {
    return {
      canQueue: false,
      reason: `Queue acceptance closed for today at ${business.queueCloses || 'scheduled closing time'}.`,
      windowInfo: `${business.queueWindow} (Closed for today)`,
    };
  }

  return {
    canQueue: true,
    windowInfo: `${business.queueWindow} (Open Now)`,
  };
}

/**
 * Checks whether staff can scan tickets.
 * Allowed during operating hours or when business is active.
 */
export function checkScanEligibility(business?: Business | null): {
  canScan: boolean;
  reason?: string;
} {
  if (!business) {
    return { canScan: true }; // General fallback
  }

  if (business.status === 'Closed') {
    return {
      canScan: false,
      reason: `${business.name} is currently closed. Scanning is restricted to allowed operating times.`,
    };
  }

  // Check working hours
  let openMinutes: number | null = null;
  let closeMinutes: number | null = null;

  if (business.opensAt && business.closesAt) {
    openMinutes = parseTimeToMinutes(business.opensAt);
    closeMinutes = parseTimeToMinutes(business.closesAt);
  } else if (business.workingHours) {
    const split = business.workingHours.split(/–|-/);
    if (split.length >= 2) {
      openMinutes = parseTimeToMinutes(split[0]);
      closeMinutes = parseTimeToMinutes(split[1]);
    }
  }

  if (openMinutes !== null && closeMinutes !== null) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes < openMinutes || currentMinutes > closeMinutes) {
      return {
        canScan: false,
        reason: `Scanning allowed only during operating hours (${business.workingHours}).`,
      };
    }
  }

  return { canScan: true };
}
