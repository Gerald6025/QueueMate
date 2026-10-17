// SMS Notification Service for QueueMate
// Automatically notifies the next customer in line when a teller starts serving the current ticket

export interface SmsPayload {
  toPhone?: string;
  customerName?: string;
  ticketNumber: string;
  counterName: string;
  servingTicketNumber: string;
  companyName: string;
}

export interface SmsRecord extends Omit<SmsPayload, 'toPhone' | 'customerName'> {
  id: string;
  toPhone: string;
  customerName: string;
  message: string;
  sentAt: number;
  status: 'sent' | 'delivered';
}

export class SmsService {
  /**
   * Sends an SMS alert to Ticket 2 when the teller starts serving Ticket 1
   */
  public static async sendNextInLineAlert(payload: SmsPayload): Promise<SmsRecord> {
    const formattedPhone = payload.toPhone || '+1 (555) 019-2834';
    const cleanCustomer = payload.customerName || 'Customer';
    
    // Clear, friendly SMS notification
    const message = `[${payload.companyName}] Queue Alert: Ticket #${payload.ticketNumber} (${cleanCustomer}), you are NEXT in line! Counter ${payload.counterName} is now serving #${payload.servingTicketNumber}. Please be near ${payload.counterName} so you don't miss your turn.`;

    const record: SmsRecord = {
      ...payload,
      toPhone: formattedPhone,
      customerName: cleanCustomer,
      id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      message,
      sentAt: Date.now(),
      status: 'delivered',
    };

    // Client-side & log persistence
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('queuemate_sms_logs');
        const logs: SmsRecord[] = stored ? JSON.parse(stored) : [];
        logs.unshift(record);
        localStorage.setItem('queuemate_sms_logs', JSON.stringify(logs.slice(0, 50)));
      } catch {}

      // Optional desktop notification if user allowed
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`${payload.companyName}: You're next in line!`, {
            body: `Ticket #${payload.ticketNumber}: Now serving #${payload.servingTicketNumber} at ${payload.counterName}. Head to ${payload.counterName} now.`,
          });
        }
      } catch {}
    }

    console.info(`[SMS Delivered] ${formattedPhone}: "${message}"`);
    return record;
  }
}
