import { Ticket } from '@/types/queue';

/**
 * Generates and downloads a beautiful, high-resolution Digital Ticket Pass card.
 * Does not contain any QR codes; uses clean typography and ticket details.
 */
export async function downloadTicketPass(ticket: Ticket): Promise<void> {
  const canvas = document.createElement('canvas');
  const width = 640;
  const height = 820;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // Main Ticket Card Container (White with subtle rounded border)
  const cardX = 32;
  const cardY = 32;
  const cardW = width - 64;
  const cardH = height - 64;

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(cardX, cardY, cardW, cardH, 28);
  } else {
    ctx.rect(cardX, cardY, cardW, cardH);
  }
  ctx.fill();
  ctx.restore();

  // Top Branded Header
  const headerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
  headerGrad.addColorStop(0, '#059669'); // emerald-600
  headerGrad.addColorStop(1, '#0d9488'); // teal-600

  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(cardX, cardY, cardW, 140, [28, 28, 0, 0]);
  } else {
    ctx.rect(cardX, cardY, cardW, 140);
  }
  ctx.fillStyle = headerGrad;
  ctx.fill();
  ctx.restore();

  // Header Brand & Business Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('QueueMate • Digital Ticket', cardX + 32, cardY + 54);

  ctx.font = '600 17px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillText(ticket.businessName || 'General Service', cardX + 32, cardY + 86);

  ctx.font = '500 13px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText('Official Customer Queue Pass', cardX + 32, cardY + 112);

  // Status Badge in Header (Right side)
  const badgeText = ticket.isScanned ? 'VERIFIED' : 'ACTIVE TICKET';
  ctx.textAlign = 'right';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = ticket.isScanned ? '#34d399' : '#a7f3d0';
  ctx.fillText(badgeText, cardX + cardW - 32, cardY + 54);

  // Ticket Number Section
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
  ctx.fillText('YOUR QUEUE TICKET NUMBER', width / 2, 230);

  // Big Bold Ticket Number Box
  const numBoxX = width / 2 - 190;
  const numBoxY = 250;
  const numBoxW = 380;
  const numBoxH = 130;

  ctx.fillStyle = '#f0fdf4';
  ctx.strokeStyle = '#bbf7d0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(numBoxX, numBoxY, numBoxW, numBoxH, 20);
  } else {
    ctx.rect(numBoxX, numBoxY, numBoxW, numBoxH);
  }
  ctx.fill();
  ctx.stroke();

  // Ticket Number Text
  ctx.fillStyle = '#059669';
  ctx.font = '900 82px system-ui, -apple-system, monospace';
  ctx.fillText(ticket.number, width / 2, 345);

  // Perforation / Ticket Cut-out Line
  ctx.save();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(cardX + 24, 420);
  ctx.lineTo(cardX + cardW - 24, 420);
  ctx.stroke();
  ctx.restore();

  // Side cut-out circles for classic ticket appearance
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(cardX, 420, 16, 0, Math.PI * 2);
  ctx.arc(cardX + cardW, 420, 16, 0, Math.PI * 2);
  ctx.fill();

  // Details Grid
  const leftColX = cardX + 44;
  const rightColX = cardX + cardW - 44;

  // Row 1: Customer Name & Category
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('CUSTOMER NAME', leftColX, 465);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
  ctx.fillText(ticket.customerName || 'Customer', leftColX, 492);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('SERVICE CATEGORY', rightColX, 465);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
  ctx.fillText(ticket.categoryName || 'General', rightColX, 492);

  // Row 2: Status & Time Issued
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('STATUS', leftColX, 545);

  const statusLabel = ticket.status.toUpperCase();
  ctx.fillStyle = ticket.status === 'serving' ? '#0284c7' : '#059669';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(statusLabel, leftColX, 572);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('TIME ISSUED', rightColX, 545);

  const formattedTime = new Date(ticket.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = new Date(ticket.createdAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${formattedTime} • ${formattedDate}`, rightColX, 572);

  // Instructions Box
  const infoBoxY = 615;
  const infoBoxH = 75;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(cardX + 32, infoBoxY, cardW - 64, infoBoxH, 16);
  } else {
    ctx.rect(cardX + 32, infoBoxY, cardW - 64, infoBoxH);
  }
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.fillText('Please present this Ticket Number when called by staff', width / 2, infoBoxY + 32);

  ctx.fillStyle = '#64748b';
  ctx.font = 'normal 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Keep this pass open on your screen or take a screenshot', width / 2, infoBoxY + 54);

  // Footer / Reference
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 12px system-ui, -apple-system, monospace';
  ctx.fillText(`Ticket Ref: ${ticket.id} • QueueMate System`, width / 2, cardY + cardH - 24);

  // Trigger file download
  const link = document.createElement('a');
  link.download = `QueueMate-Ticket-${ticket.number}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Backward-compatible alias for downloading ticket passes.
 */
export async function downloadTicketQR(
  ticket: Ticket,
  format: 'pass' | 'qr' = 'pass'
): Promise<void> {
  // Always download the clean ticket pass card without QR
  return downloadTicketPass(ticket);
}
