'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useQueue } from '@/context/QueueContext';
import { Business, Ticket } from '@/types/queue';
import { checkScanEligibility } from '@/utils/businessHours';
import { 
  QrCode, 
  Camera, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Sparkles,
  Clock,
  Building2,
  RefreshCw,
  Zap
} from 'lucide-react';

interface QRScannerModalProps {
  business?: Business | null;
  onClose: () => void;
  onScanSuccess?: (ticket: Ticket) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  business,
  onClose,
  onScanSuccess,
}) => {
  const { tickets, scanTicket, darkMode } = useQueue();
  const [manualCode, setManualCode] = useState('');
  const [scanStatus, setScanStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
    ticket?: Ticket;
  }>({
    type: 'idle',
    message: '',
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'qr-code-reader-element';

  // Check if scanning is allowed during current operating times
  const eligibility = checkScanEligibility(business);

  // Initialize or cleanup camera scanner
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
      }

      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        async (decodedText) => {
          handleProcessCode(decodedText);
          try {
            await html5QrCode.stop();
            setIsCameraActive(false);
          } catch {}
        },
        () => {} // scan error (ignore frames without QR)
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraError(
        err?.message || 'Unable to access camera. Please allow camera permissions or use manual entry.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleProcessCode = async (rawCode: string) => {
    if (!rawCode.trim()) return;

    // Check operating hours allowed
    if (!eligibility.canScan) {
      setScanStatus({
        type: 'error',
        message: eligibility.reason || 'Scanning is outside allowed operating times.',
      });
      return;
    }

    const result = await scanTicket(rawCode.trim(), business?.id);
    if (result.success && result.ticket) {
      setScanStatus({
        type: 'success',
        message: result.message,
        ticket: result.ticket,
      });
      if (onScanSuccess) {
        onScanSuccess(result.ticket);
      }
    } else {
      setScanStatus({
        type: 'error',
        message: result.message || 'Ticket not found or belongs to another business.',
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleProcessCode(manualCode);
  };

  // Get waiting tickets for quick test-scan
  const waitingTickets = tickets.filter(
    (t) => t.status === 'waiting' && (!business || !t.businessId || t.businessId === business.id)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className={`w-full max-w-md rounded-3xl p-5 shadow-2xl border transition-all animate-scale-in max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-[#141E2E] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                Scan Customer Ticket
              </h2>
              <p className="text-xs text-slate-400">
                {business ? business.name : 'All Queues'} • Arrival Verification
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City Bank 24/7 Testing Indicator */}
        {business && (business.id === 'city-bank' || business.name.toLowerCase().includes('city bank')) && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Testing Active: City Bank scans 24/7 regardless of the time</span>
          </div>
        )}

        {/* Operating Hours Check Notice */}
        {!eligibility.canScan && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start space-x-2.5">
            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Outside Operating Times:</span> {eligibility.reason}
            </div>
          </div>
        )}

        {/* Scan Status Feedback */}
        {scanStatus.type !== 'idle' && (
          <div 
            className={`mb-4 p-4 rounded-2xl border flex items-start space-x-3 animate-scale-in ${
              scanStatus.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            {scanStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <p className="font-bold text-sm mb-0.5">{scanStatus.message}</p>
              {scanStatus.ticket && (
                <div className="mt-1.5 pt-1.5 border-t border-emerald-500/20 text-xs space-y-0.5 text-slate-600 dark:text-slate-300">
                  <p><span className="font-semibold">Ticket:</span> {scanStatus.ticket.number}</p>
                  <p><span className="font-semibold">Customer:</span> {scanStatus.ticket.customerName}</p>
                  <p><span className="font-semibold">Category:</span> {scanStatus.ticket.categoryName}</p>
                  <p><span className="font-semibold">Status:</span> {scanStatus.ticket.status.toUpperCase()}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Camera Scanner Viewport */}
        <div className="mb-4">
          <div 
            id={readerElementId} 
            className={`w-full h-52 rounded-2xl overflow-hidden border flex items-center justify-center relative ${
              darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {!isCameraActive && (
              <div className="text-center p-4">
                <Camera className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 mb-3 font-medium">
                  Use device camera to scan ticket QR code
                </p>
                <button
                  onClick={startCamera}
                  disabled={!eligibility.canScan}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Start Camera Scanner
                </button>
              </div>
            )}
          </div>

          {isCameraActive && (
            <div className="mt-2 flex justify-center">
              <button
                onClick={stopCamera}
                className="text-xs text-rose-500 hover:underline font-semibold"
              >
                Stop Camera
              </button>
            </div>
          )}

          {cameraError && (
            <p className="mt-2 text-[11px] text-amber-500 text-center">
              {cameraError}
            </p>
          )}
        </div>

        {/* Manual Barcode / Ticket ID Input */}
        <form onSubmit={handleManualSubmit} className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-slate-400 block">
            Manual Ticket Entry / Barcode Scanner:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. A-101 or t-101"
              className={`flex-1 rounded-xl px-3.5 py-2.5 text-xs border outline-none font-mono ${
                darkMode
                  ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            <button
              type="submit"
              disabled={!manualCode.trim() || !eligibility.canScan}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold disabled:opacity-50 hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
            >
              Verify Ticket
            </button>
          </div>
        </form>

        {/* Quick Demo Scan Buttons */}
        {waitingTickets.length > 0 && (
          <div className="pt-3 border-t border-slate-200/50">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center">
              <Zap className="w-3 h-3 mr-1 text-emerald-500" />
              Quick Scan Waiting Tickets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {waitingTickets.slice(0, 4).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleProcessCode(t.id)}
                  disabled={!eligibility.canScan}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-emerald-500'
                      : 'bg-slate-100 border-slate-200 text-slate-800 hover:border-emerald-400'
                  }`}
                  title={`Click to simulate scanning ${t.number}`}
                >
                  Scan {t.number} ({t.customerName?.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
