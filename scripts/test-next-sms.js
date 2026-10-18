const fs = require('fs');
const path = require('path');
const { Vonage } = require('@vonage/server-sdk');
const { Channels } = require('@vonage/messages');

// Auto-load .env.local if present
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || '').trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
} catch (e) {}

const apiKey = process.env.VONAGE_API_KEY;
const apiSecret = process.env.VONAGE_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error('Missing VONAGE_API_KEY or VONAGE_API_SECRET in environment or .env.local');
  process.exit(1);
}

const vonage = new Vonage({
  apiKey,
  apiSecret,
});

const servingTicket = { number: 'A-102', customerName: 'Emma Watson' };
const nextTicket = { number: 'V-501', customerName: 'Jonathan Hayes', phoneNumber: '263787247501' };
const counterName = 'Counter 1';
const businessName = 'City Bank';

const messageText = `Queue Alert (${businessName}): Hi ${nextTicket.customerName}! ${counterName} is now serving Ticket ${servingTicket.number}. You are NEXT in line (Ticket ${nextTicket.number})! Please prepare to approach the counter.`;

console.log('Sending message:', messageText);

vonage.messages
  .send({
    messageType: 'text',
    channel: Channels.SMS,
    text: messageText,
    to: nextTicket.phoneNumber,
    from: process.env.VONAGE_FROM || 'Vonage APIs',
  })
  .then(({ messageUUID }) => {
    console.log('Automated Next In Line SMS sent successfully! UUID:', messageUUID);
  })
  .catch((err) => {
    console.error('Error sending SMS:', err?.response?.data || err);
  });
