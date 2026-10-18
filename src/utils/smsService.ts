import { Ticket } from '@/types/queue';

// Set to track tickets already alerted as 'next' to avoid spamming
const notifiedNextTicketIds = new Set<string>();

export interface SmsResult {
  success: boolean;
  messageUUID?: string;
  error?: string;
  recipient?: string;
  text?: string;
}

/**
 * Dispatch an SMS via the server-side Vonage API route
 */
export async function sendSmsNotification(
  to: string,
  text: string,
  metadata?: {
    customerName?: string;
    ticketNumber?: string;
    counterName?: string;
  }
): Promise<SmsResult> {
  if (!to || !to.trim()) {
    return { success: false, error: 'No phone number provided' };
  }

  try {
    const res = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        text,
        ...metadata,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Failed to trigger SMS API:', err);
    return { success: false, error: err.message || 'Network error sending SMS' };
  }
}

/**
 * Automatically notifies the customer who is next in line
 * when the counter starts serving the current customer.
 */
export async function alertNextCustomerInLine({
  nextTicket,
  servingTicket,
  counterName,
  businessName,
  force = false,
}: {
  nextTicket?: Ticket | null;
  servingTicket?: Ticket | null;
  counterName: string;
  businessName?: string;
  force?: boolean;
}): Promise<SmsResult | null> {
  if (!nextTicket) {
    console.log('[Queue SMS] No next customer waiting in line.');
    return null;
  }

  // Check if phone number exists
  if (!nextTicket.phoneNumber || !nextTicket.phoneNumber.trim()) {
    console.log(`[Queue SMS] Next ticket ${nextTicket.number} has no phone number attached.`);
    return null;
  }

  // Prevent duplicate SMS alerts for the same ticket unless forced
  if (!force && notifiedNextTicketIds.has(nextTicket.id)) {
    console.log(`[Queue SMS] Next ticket ${nextTicket.number} already received "you are next" SMS.`);
    return null;
  }

  const customerName = nextTicket.customerName?.trim() || 'Customer';
  const servingNum = servingTicket?.number ? `Ticket ${servingTicket.number}` : 'the current customer';
  const bizTitle = businessName ? ` (${businessName})` : '';

  const messageText = `Queue Alert${bizTitle}: Hi ${customerName}! ${counterName} is now serving ${servingNum}. You are NEXT in line (Ticket ${nextTicket.number})! Please prepare to approach the counter shortly.`;

  console.log(`[Queue SMS] Sending automated 'Next in line' alert to ${nextTicket.phoneNumber} (Ticket ${nextTicket.number})...`);

  const result = await sendSmsNotification(nextTicket.phoneNumber, messageText, {
    customerName,
    ticketNumber: nextTicket.number,
    counterName,
  });

  if (result.success) {
    notifiedNextTicketIds.add(nextTicket.id);
  }

  return result;
}

export function resetNotifiedStatus(ticketId: string) {
  notifiedNextTicketIds.delete(ticketId);
}
