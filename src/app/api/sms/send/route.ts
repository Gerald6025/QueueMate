import { NextResponse } from 'next/server';
import { Vonage } from '@vonage/server-sdk';
import { Channels } from '@vonage/messages';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, text, from: customFrom, customerName, ticketNumber, counterName } = body;

    if (!to || !text) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number (to) and text message are required.' },
        { status: 400 }
      );
    }

    // Clean phone number (digits only for Vonage Messages API)
    let cleanedNumber = to.toString().replace(/\D/g, '');

    // Zimbabwe regional convenience: 078XXXXXXX -> 26378XXXXXXX, 78XXXXXXX -> 26378XXXXXXX
    if (cleanedNumber.startsWith('0') && cleanedNumber.length === 10) {
      cleanedNumber = '263' + cleanedNumber.slice(1);
    } else if (cleanedNumber.length === 9 && (cleanedNumber.startsWith('7') || cleanedNumber.startsWith('8'))) {
      cleanedNumber = '263' + cleanedNumber;
    }

    const apiKey = process.env.VONAGE_API_KEY || '16317175';
    const apiSecret = process.env.VONAGE_API_SECRET || 'sFtupFTFXLRJRN3g';
    const from = customFrom || process.env.VONAGE_FROM || 'Vonage APIs';

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: 'Vonage API credentials (VONAGE_API_KEY / VONAGE_API_SECRET) not configured.' },
        { status: 500 }
      );
    }

    const vonage = new Vonage({
      apiKey,
      apiSecret,
    });

    const response = await vonage.messages.send({
      messageType: 'text',
      channel: Channels.SMS,
      text,
      to: cleanedNumber,
      from,
    });

    console.log(`[Vonage SMS] Sent to ${cleanedNumber} (UUID: ${response?.messageUUID}): "${text}"`);

    return NextResponse.json({
      success: true,
      messageUUID: response?.messageUUID,
      recipient: cleanedNumber,
      customerName,
      ticketNumber,
      counterName,
      text,
    });
  } catch (error: any) {
    const errorDetails = error?.response?.data || error?.message || error;
    console.error('[Vonage SMS Error]:', errorDetails);
    return NextResponse.json(
      {
        success: false,
        error: error?.response?.data?.detail || error?.message || 'Failed to dispatch SMS',
      },
      { status: 500 }
    );
  }
}
