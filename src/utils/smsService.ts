import { Ticket } from '@/types/queue';

// Set to track tickets already alerted to avoid duplicate spamming
const notifiedCalledTicketIds = new Set<string>();
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
 * Automatically notifies the customer who is CURRENTLY called to the counter.
 */
export async function alertCalledCustomer({
  calledTicket,
  counterName,
  businessName,
  force = false,
}: {
  calledTicket: Ticket;
  counterName: string;
  businessName?: string;
  force?: boolean;
}): Promise<SmsResult | null> {
  if (!calledTicket.phoneNumber || !calledTicket.phoneNumber.trim()) {
    console.log(`[Queue SMS] Called ticket ${calledTicket.number} has no phone number.`);
    return null;
  }

  if (!force && notifiedCalledTicketIds.has(calledTicket.id)) {
    console.log(`[Queue SMS] Ticket ${calledTicket.number} already received "called" SMS.`);
    return null;
  }

  const customerName = calledTicket.customerName?.trim() || 'Customer';
  const bizTitle = businessName ? ` (${businessName})` : '';

  const messageText = `Queue Alert${bizTitle}: Hi ${customerName}! Ticket ${calledTicket.number} has been called to ${counterName}. Please proceed to the counter now!`;

  console.log(`[Queue SMS] Sending 'You are called' alert to ${calledTicket.phoneNumber} (${calledTicket.number})...`);

  const result = await sendSmsNotification(calledTicket.phoneNumber, messageText, {
    customerName,
    ticketNumber: calledTicket.number,
    counterName,
  });

  if (result.success) {
    notifiedCalledTicketIds.add(calledTicket.id);
  }

  return result;
}

/**
 * Automatically notifies the customer who is NEXT in line (Ticket 2)
 * when Customer 1 is called or being served.
 */
export async function alertNextCustomerInLine({
  nextTicket,
  servingTicket,
  counterName,
  businessName,
  actionType = 'serving',
  force = false,
}: {
  nextTicket?: Ticket | null;
  servingTicket?: Ticket | null;
  counterName: string;
  businessName?: string;
  actionType?: 'called' | 'serving';
  force?: boolean;
}): Promise<SmsResult | null> {
  if (!nextTicket) {
    console.log('[Queue SMS] No next customer waiting in line.');
    return null;
  }

  if (!nextTicket.phoneNumber || !nextTicket.phoneNumber.trim()) {
    console.log(`[Queue SMS] Next ticket ${nextTicket.number} has no phone number attached.`);
    return null;
  }

  if (!force && notifiedNextTicketIds.has(nextTicket.id)) {
    console.log(`[Queue SMS] Next ticket ${nextTicket.number} already received "you are next" SMS.`);
    return null;
  }

  const customerName = nextTicket.customerName?.trim() || 'Customer';
  const servingNum = servingTicket?.number ? `Ticket ${servingTicket.number}` : 'the current customer';
  const bizTitle = businessName ? ` (${businessName})` : '';
  const actionWord = actionType === 'called' ? 'called' : 'serving';

  const messageText = `Queue Alert${bizTitle}: Hi ${customerName}! ${counterName} is now ${actionWord} ${servingNum}. You are NEXT in line (Ticket ${nextTicket.number})! Please prepare to approach the counter shortly.`;

  console.log(`[Queue SMS] Sending automated 'Next in line' alert to ${nextTicket.phoneNumber} (${nextTicket.number})...`);

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

/**
 * Optional welcome SMS when a customer takes a ticket at the kiosk
 */
export async function alertTicketCreated({
  ticket,
  position,
  businessName,
}: {
  ticket: Ticket;
  position?: number;
  businessName?: string;
}): Promise<SmsResult | null> {
  if (!ticket.phoneNumber || !ticket.phoneNumber.trim()) return null;

  const customerName = ticket.customerName?.trim() || 'Customer';
  const bizTitle = businessName ? ` at ${businessName}` : '';
  const posText = position ? ` You are #${position} in line.` : '';

  const messageText = `QueueMate: Hello ${customerName}! Your ticket is ${ticket.number}${bizTitle}.${posText} We will text you automatically when you are next in line!`;

  return sendSmsNotification(ticket.phoneNumber, messageText, {
    customerName,
    ticketNumber: ticket.number,
  });
}

export function resetNotifiedStatus(ticketId: string) {
  notifiedCalledTicketIds.delete(ticketId);
  notifiedNextTicketIds.delete(ticketId);
}
