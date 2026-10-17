import { NextRequest, NextResponse } from 'next/server';

interface SmsRequestBody {
  to?: string;
  message?: string;
  customerName?: string;
  ticketNumber?: string;
  companyName?: string;
  customConfig?: {
    provider?: 'twilio' | 'africastalking' | 'termii' | 'textbelt' | 'webhook';
    apiKey?: string;
    apiSecret?: string;
    senderId?: string;
    accountSid?: string;
    webhookUrl?: string;
  };
}

async function safeJsonParse(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { rawText: text };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: SmsRequestBody = await req.json();
    const rawTo = body.to?.trim() || '';
    const message = body.message?.trim() || '';
    const customConfig = body.customConfig;

    if (!rawTo || !message) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number and message are required.' },
        { status: 400 }
      );
    }

    // Clean phone number (strip whitespace, hyphens, brackets)
    let cleanPhone = rawTo.replace(/[\s()-]/g, '');
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = `+${cleanPhone}`;
    }

    // Provider 1: Twilio
    const twilioSid = customConfig?.accountSid || process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = customConfig?.apiSecret || process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = customConfig?.senderId || process.env.TWILIO_PHONE_NUMBER;
    const twilioMsgService = process.env.TWILIO_MESSAGING_SERVICE_SID;

    if (customConfig?.provider === 'twilio' || (twilioSid && twilioToken)) {
      if (!twilioSid || !twilioToken) {
        return NextResponse.json({
          success: false,
          provider: 'twilio',
          error: 'Twilio requires Account SID and Auth Token.',
          requiresGatewaySetup: true,
        });
      }

      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
        const form = new URLSearchParams();
        form.set('To', cleanPhone);
        if (twilioMsgService) {
          form.set('MessagingServiceSid', twilioMsgService);
        } else if (twilioFrom) {
          form.set('From', twilioFrom);
        }
        form.set('Body', message);

        const twilioRes = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form.toString(),
        });

        const twilioData = await safeJsonParse(twilioRes);
        if (twilioRes.ok) {
          return NextResponse.json({
            success: true,
            provider: 'twilio',
            messageId: twilioData.sid,
            status: twilioData.status || 'queued',
            recipient: cleanPhone,
          });
        } else {
          return NextResponse.json({
            success: false,
            provider: 'twilio',
            error: twilioData.message || twilioData.rawText || 'Twilio failed to dispatch message.',
            code: twilioData.code,
            recipient: cleanPhone,
          });
        }
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          provider: 'twilio',
          error: err.message || 'Twilio request failed.',
        });
      }
    }

    // Provider 2: Africa's Talking
    const atUsername = customConfig?.accountSid || process.env.AFRICASTALKING_USERNAME;
    const atApiKey = customConfig?.apiKey || process.env.AFRICASTALKING_API_KEY;
    const atFrom = customConfig?.senderId || process.env.AFRICASTALKING_FROM;

    if (customConfig?.provider === 'africastalking' || (atUsername && atApiKey)) {
      if (!atUsername || !atApiKey) {
        return NextResponse.json({
          success: false,
          provider: 'africastalking',
          error: "Africa's Talking requires Username and API Key.",
          requiresGatewaySetup: true,
        });
      }

      try {
        const atForm = new URLSearchParams();
        atForm.set('username', atUsername);
        atForm.set('to', cleanPhone);
        atForm.set('message', message);
        if (atFrom) atForm.set('from', atFrom);

        const atRes = await fetch('https://api.africastalking.com/version1/messaging', {
          method: 'POST',
          headers: {
            apiKey: atApiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: atForm.toString(),
        });

        const atData = await safeJsonParse(atRes);
        const recipientStatus = atData?.SMSMessageData?.Recipients?.[0]?.status;
        const isSuccess = recipientStatus === 'Success' || recipientStatus === 'Sent';

        return NextResponse.json({
          success: isSuccess,
          provider: 'africastalking',
          data: atData,
          status: recipientStatus || 'sent',
          recipient: cleanPhone,
          error: isSuccess ? undefined : (recipientStatus || atData.errorMessage || atData.rawText || "Africa's Talking error"),
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          provider: 'africastalking',
          error: err.message || "Africa's Talking request failed.",
        });
      }
    }

    // Provider 3: Termii
    const termiiKey = customConfig?.apiKey || process.env.TERMII_API_KEY;
    const termiiSenderId = customConfig?.senderId || process.env.TERMII_SENDER_ID || 'QueueMate';

    if (customConfig?.provider === 'termii' || termiiKey) {
      if (!termiiKey) {
        return NextResponse.json({
          success: false,
          provider: 'termii',
          error: 'Termii requires an API Key.',
          requiresGatewaySetup: true,
        });
      }

      try {
        const termiiRes = await fetch('https://api.ng.termii.com/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: cleanPhone.replace('+', ''),
            from: termiiSenderId,
            sms: message,
            type: 'plain',
            channel: 'generic',
            api_key: termiiKey,
          }),
        });

        const termiiData = await safeJsonParse(termiiRes);
        const isSuccess = termiiRes.ok && (termiiData.code === 'ok' || termiiData.message === 'Successfully Sent');

        return NextResponse.json({
          success: isSuccess,
          provider: 'termii',
          messageId: termiiData.message_id,
          recipient: cleanPhone,
          error: isSuccess ? undefined : (termiiData.message || termiiData.rawText || 'Termii delivery failed.'),
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          provider: 'termii',
          error: err.message || 'Termii request failed.',
        });
      }
    }

    // Provider 4: Textbelt
    const textbeltKey = customConfig?.provider === 'textbelt' ? (customConfig?.apiKey || 'textbelt') : process.env.TEXTBELT_KEY;
    if (textbeltKey) {
      try {
        const tbRes = await fetch('https://textbelt.com/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cleanPhone,
            message: message,
            key: textbeltKey,
          }),
        });

        const tbData = await safeJsonParse(tbRes);
        if (tbData.success) {
          return NextResponse.json({
            success: true,
            provider: 'textbelt',
            textId: tbData.textId,
            quotaRemaining: tbData.quotaRemaining,
            recipient: cleanPhone,
          });
        } else {
          return NextResponse.json({
            success: false,
            provider: 'textbelt',
            error: tbData.error || tbData.rawText || 'Textbelt dispatch limit reached.',
            quotaRemaining: tbData.quotaRemaining,
            recipient: cleanPhone,
            requiresGatewaySetup: true,
          });
        }
      } catch (err: any) {
        console.warn('Textbelt error:', err);
      }
    }

    // Fallback: No cellular SMS provider credentials set
    return NextResponse.json({
      success: false,
      provider: 'none',
      warning: 'No cellular SMS gateway credentials found in .env.local or browser settings.',
      recipient: cleanPhone,
      requiresGatewaySetup: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error processing SMS' },
      { status: 500 }
    );
  }
}
