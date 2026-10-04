'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Ticket } from '@/types/queue';
import { 
  QrCode, 
  CheckCircle2, 
  Download, 
  Maximize2, 
  ShieldCheck, 
  Check, 
  FileImage, 
  Share2,
  ChevronDown
} from 'lucide-react';
import { downloadTicketQR } from '@/utils/ticketDownload';

interface TicketQRCodeProps {
  ticket: Ticket;
  size?: number;
  showDetails?: boolean;
}

export const TicketQRCode: React.FC<TicketQRCodeProps> = ({ 
  ticket, 
  size = 180,
  showDetails = true 
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  useEffect(() => {
    // Generate QR payload:
    // If running on a public non-localhost origin, provide a valid URL.
    // Otherwise use a clean TICKET identifier so phone cameras don't try to open invalid JSON as a URL.
    let payload = `TICKET:${ticket.number}:${ticket.id}`;
    if (typeof window !== 'undefined' && window.location.origin) {
      const isLocalhost = 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1';
      if (!isLocalhost && window.location.protocol.startsWith('http')) {
        payload = `${window.location.origin}/?ticket=${encodeURIComponent(ticket.id)}&num=${encodeURIComponent(ticket.number)}`;
      }
    }

    QRCode.toDataURL(payload, {
      width: size * 2,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [ticket, size]);

  const handleDownload = async (format: 'pass' | 'qr' = 'pass') => {
    try {
      setIsDownloading(true);
      setShowDownloadMenu(false);
      await downloadTicketQR(ticket, format);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2800);
    } catch (err) {
      console.error('Download QR failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[280px] mx-auto">
      {/* QR Code Container */}
      <div className="relative group p-3.5 bg-white rounded-2xl shadow-sm border border-slate-200/90 transition-all hover:shadow-md w-full flex flex-col items-center">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR Code for Ticket ${ticket.number}`}
            style={{ width: size, height: size }}
            className="rounded-xl object-contain mx-auto cursor-pointer"
            onClick={() => setIsZoomed(true)}
          />
        ) : (
          <div 
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-100 rounded-xl text-slate-400"
          >
            <QrCode className="w-8 h-8 animate-pulse text-slate-400" />
          </div>
        )}

        {/* Scanned Badge Overlay */}
        {ticket.isScanned && (
          <div className="absolute inset-0 bg-emerald-950/75 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-2 text-white animate-scale-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-1" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Verified & Scanned
            </span>
            {ticket.scannedAt && (
              <span className="text-[10px] text-emerald-200/80 mt-0.5 font-mono">
                {new Date(ticket.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        )}

        {/* Quick Zoom Button */}
        {!ticket.isScanned && (
          <button
            onClick={() => setIsZoomed(true)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/5 hover:bg-slate-900/10 text-slate-600 transition-colors cursor-pointer"
            title="Enlarge QR Code"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Prominent Download Button */}
      <div className="w-full mt-2.5 relative">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleDownload('pass')}
            disabled={isDownloading || !qrDataUrl}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
              downloadSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white disabled:opacity-50'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white animate-scale-in" />
                <span>Saved to Device!</span>
              </>
            ) : isDownloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download QR Pass</span>
              </>
            )}
          </button>

          {/* Options Dropdown button */}
          <button
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            disabled={isDownloading || !qrDataUrl}
            className="p-2 rounded-xl bg-emerald-700/90 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
            title="Download Options"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Download Format Dropdown Menu */}
        {showDownloadMenu && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-white rounded-xl shadow-xl border border-slate-200 p-1 animate-scale-in text-left">
            <button
              onClick={() => handleDownload('pass')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <FileImage className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Digital Ticket Pass</p>
                <p className="text-[10px] text-slate-500">Includes ticket # and company details</p>
              </div>
            </button>
            <button
              onClick={() => handleDownload('qr')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition-colors cursor-pointer border-t border-slate-100"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              <div>
                <p className="font-bold">QR Code Only (PNG)</p>
                <p className="text-[10px] text-slate-500">Clean standalone scannable QR</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200/60 mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Present this QR Code to Staff</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[240px]">
            Download or take a screenshot to scan upon your arrival.
          </p>
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-slate-200 flex flex-col items-center animate-scale-in"
          >
            <div className="text-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 font-mono">
                {ticket.businessName || 'QueueMate'}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                Ticket {ticket.number}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {ticket.customerName || 'Customer'} • {ticket.categoryName}
              </p>
            </div>

            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt={`QR Code ${ticket.number}`}
                className="w-56 h-56 rounded-2xl border border-slate-100 p-2 shadow-xs"
              />
            )}

            <div className="w-full space-y-2 mt-4">
              <button
                onClick={() => handleDownload('pass')}
                disabled={isDownloading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadSuccess ? 'Downloaded!' : 'Download Pass to Device'}</span>
              </button>

              <button
                onClick={() => setIsZoomed(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
