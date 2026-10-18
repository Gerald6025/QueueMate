const fs = require('fs');
const path = require('path');
const { Vonage } = require('@vonage/server-sdk');
const { Channels } = require('@vonage/messages');

// Auto-load .env.local if present
try {
  const envPath = path.resolve(__dirname, '.env.local');
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

// Initialize Vonage client
const vonage = new Vonage({
  apiKey,
  apiSecret,
});

// Configure message payload
const to = process.argv[2] || '263787247501';
const text = process.argv[3] || 'This is an SMS text message sent using the Vonage Messages API';
const from = process.env.VONAGE_FROM || 'Vonage APIs';

console.log(`Sending SMS to: ${to}...`);

vonage.messages
  .send({
    messageType: 'text',
    channel: Channels.SMS,
    text,
    to,
    from,
  })
  .then(({ messageUUID }) => {
    console.log('Message sent successfully!');
    console.log('Message UUID:', messageUUID);
  })
  .catch((error) => {
    console.error('Failed to send SMS:');
    if (error.response && error.response.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error);
    }
  });
