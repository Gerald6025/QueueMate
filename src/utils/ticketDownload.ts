import QRCode from 'qrcode';
import { Ticket } from '@/types/queue';

/**
 * Generates the standard JSON payload encoded inside the QR code for a ticket.
 */
export function getTicketQRPayload(ticket: Ticket): string {
  return JSON.stringify({
    ticketId: ticket.id,
    number: ticket.number,
    businessId: ticket.businessId || 'city-bank',
    businessName: ticket.businessName || 'Business',
    customerName: ticket.customerName || 'Customer',
    categoryId: ticket.categoryId,
    createdAt: ticket.createdAt,
  });
}

/**
 * Generates a Data URL for the QR code image.
 */
export async function generateQRDataUrl(ticket: Ticket, size: number = 360): Promise<string> {
  const payload = getTicketQRPayload(ticket);
  return QRCode.toDataURL(payload, {
    width: size,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}

/**
 * Downloads a scannable QR code image or a complete digital ticket pass card.
 */
export async function downloadTicketQR(
  ticket: Ticket,
  format: 'pass' | 'qr' = 'pass'
): Promise<void> {
  const qrDataUrl = await generateQRDataUrl(ticket, 400);

  if (format === 'qr') {
    const link = document.createElement('a');
    link.download = `QueueMate-QR-${ticket.number}.png`;
    link.href = qrDataUrl;
    link.click();
    return;
  }

  // Generate a beautiful, branded high-res Digital Ticket Pass (640 x 860)
  const canvas = document.createElement('canvas');
  const width = 640;
  const height = 860;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Gradient Top Bar
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, '#059669'); // emerald-600
  grad.addColorStop(1, '#0284c7'); // sky-600
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, 130);

  // Brand Name & Tagline
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('QueueMate • Digital Pass', 36, 52);

  ctx.font = '500 16px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText(ticket.businessName || 'QueueMate Service', 36, 82);

  // Ticket Number Header
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YOUR QUEUE TICKET NUMBER', width / 2, 185);

  // Ticket Number
  ctx.fillStyle = '#059669';
  ctx.font = '800 76px system-ui, -apple-system, sans-serif';
  ctx.fillText(ticket.number, width / 2, 260);

  // Customer Name & Service
  ctx.fillStyle = '#1e293b';
  ctx.font = '600 20px system-ui, -apple-system, sans-serif';
  const subInfo = `${ticket.customerName || 'Customer'} • ${ticket.categoryName || 'General Service'}`;
  ctx.fillText(subInfo, width / 2, 305);

  // Draw QR Code onto Canvas
  await new Promise<void>((resolve) => {
    const qrImg = new Image();
    qrImg.onload = () => {
      const qrSize = 340;
      const qrX = (width - qrSize) / 2;
      const qrY = 340;

      // Rounded container background for QR
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 24);
      } else {
        ctx.rect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
      }
      ctx.fill();
      ctx.stroke();

      // QR Image
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Scanned Status if verified
      if (ticket.isScanned) {
        ctx.fillStyle = 'rgba(6, 78, 59, 0.85)';
        ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓ VERIFIED & SCANNED', width / 2, qrY + qrSize / 2);
      }

      // Instructions Below QR
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Present this QR code to staff upon arrival', width / 2, 755);

      // Footer info & Date
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'normal 14px system-ui, -apple-system, sans-serif';
      const formattedDate = new Date(ticket.createdAt).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      ctx.fillText(`Issued: ${formattedDate} • Ref: ${ticket.id.slice(0, 8)}`, width / 2, 785);

      resolve();
    };
    qrImg.src = qrDataUrl;
  });

  // Trigger file download
  const link = document.createElement('a');
  link.download = `QueueMate-Ticket-${ticket.number}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
