// SMS Notification Service for QueueMate
// Handles real cellular SMS dispatch via Next.js API, carrier gateways (Twilio, Africa's Talking, Termii, Textbelt),
// and provides 1-click native mobile SMS & WhatsApp dispatch fallbacks.

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
  status: 'sent' | 'delivered' | 'failed' | 'simulated';
  provider?: string;
  nativeSmsUrl?: string;
  whatsappUrl?: string;
  error?: string;
  requiresGatewaySetup?: boolean;
}

export interface SmsGatewayConfig {
  provider: 'twilio' | 'africastalking' | 'termii' | 'textbelt';
  apiKey?: string;
  apiSecret?: string;
  senderId?: string;
  accountSid?: string;
}

export class SmsService {
  /**
   * Retrieves active SMS gateway configuration saved by user in browser
   */
  public static getSavedConfig(): SmsGatewayConfig | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('queuemate_sms_gateway_config');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Saves SMS gateway configuration to browser localStorage
   */
  public static saveConfig(config: SmsGatewayConfig | null): void {
    if (typeof window === 'undefined') return;
    try {
      if (config) {
        localStorage.setItem('queuemate_sms_gateway_config', JSON.stringify(config));
      } else {
        localStorage.removeItem('queuemate_sms_gateway_config');
      }
    } catch {}
  }

  /**
   * Sends an SMS alert to Ticket 2 when the teller starts serving Ticket 1
   */
  public static async sendNextInLineAlert(payload: SmsPayload): Promise<SmsRecord> {
    const formattedPhone = payload.toPhone || '+1 (555) 019-2834';
    const cleanCustomer = payload.customerName || 'Customer';
    
    // Clear, friendly SMS notification
    const message = `[${payload.companyName}] Queue Alert: Ticket #${payload.ticketNumber} (${cleanCustomer}), you are NEXT in line! Counter ${payload.counterName} is now serving #${payload.servingTicketNumber}. Please return to ${payload.counterName} so you don't miss your turn.`;

    // Direct phone link fallbacks (native device SMS app and WhatsApp)
    const digitsOnly = formattedPhone.replace(/\D/g, '');
    const nativeSmsUrl = `sms:${encodeURIComponent(formattedPhone)}?&body=${encodeURIComponent(message)}`;
    const whatsappUrl = `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;

    let deliveryStatus: SmsRecord['status'] = 'simulated';
    let providerName = 'in-app';
    let deliveryError: string | undefined;
    let requiresGateway = false;

    // Call server-side cellular SMS gateway
    if (typeof window !== 'undefined') {
      try {
        const customConfig = this.getSavedConfig();

        const res = await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: formattedPhone,
            message,
            customerName: cleanCustomer,
            ticketNumber: payload.ticketNumber,
            companyName: payload.companyName,
            customConfig,
          }),
        });

        const data = await res.json();
        if (data.success) {
          deliveryStatus = 'delivered';
          providerName = data.provider || 'gateway';
        } else {
          deliveryStatus = data.requiresGatewaySetup ? 'simulated' : 'failed';
          providerName = data.provider || 'simulation';
          deliveryError = data.error || data.warning;
          requiresGateway = !!data.requiresGatewaySetup;
        }
      } catch (err: any) {
        deliveryStatus = 'simulated';
        providerName = 'offline-simulated';
        deliveryError = err?.message || 'Could not reach SMS gateway endpoint.';
        requiresGateway = true;
      }
    }

    const record: SmsRecord = {
      ...payload,
      toPhone: formattedPhone,
      customerName: cleanCustomer,
      id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      message,
      sentAt: Date.now(),
      status: deliveryStatus,
      provider: providerName,
      nativeSmsUrl,
      whatsappUrl,
      error: deliveryError,
      requiresGatewaySetup: requiresGateway,
    };

    // Client-side & log persistence
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('queuemate_sms_logs');
        const logs: SmsRecord[] = stored ? JSON.parse(stored) : [];
        logs.unshift(record);
        localStorage.setItem('queuemate_sms_logs', JSON.stringify(logs.slice(0, 50)));
      } catch {}

      // Desktop notification
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`${payload.companyName}: You're next in line!`, {
            body: `Ticket #${payload.ticketNumber}: Now serving #${payload.servingTicketNumber} at ${payload.counterName}.`,
          });
        }
      } catch {}
    }

    console.info(`[SMS Dispatch] [${providerName}] ${formattedPhone}: "${message}"`, { status: deliveryStatus, error: deliveryError });
    return record;
  }
}
