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
  Zap,
  Image as ImageIcon,
  ShieldAlert
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
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInsecureOrigin, setIsInsecureOrigin] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readerElementId = 'qr-code-isolated-reader';

  // Check 24/7 scanning eligibility
  const eligibility = checkScanEligibility(business);

  useEffect(() => {
    // Check if running on an insecure origin (HTTP on a non-localhost IP),
    // which causes mobile browsers (Chrome / Samsung Internet) to block live camera streams
    if (typeof window !== 'undefined') {
      const isLocal = 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1';
      const isHttps = window.location.protocol === 'https:';
      if (!isLocal && !isHttps) {
        setIsInsecureOrigin(true);
      }
    }

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsStartingCamera(true);

    // Check mediaDevices support
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        'Live camera streaming is blocked by your browser on HTTP. Please use "Take Photo of QR" below or enter the ticket number.'
      );
      setIsStartingCamera(false);
      return;
    }

    try {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          await scannerRef.current.clear();
        } catch {}
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
          await stopCamera();
        },
        () => {} // frame without QR, ignore
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      let msg = err?.message || 'Unable to access camera.';
      if (err?.name === 'NotAllowedError' || msg.includes('Permission')) {
        msg = 'Camera permission was denied. Please allow camera access in browser settings or use Photo / Manual entry.';
      } else if (err?.name === 'NotFoundError') {
        msg = 'No camera found on this device.';
      } else if (err?.name === 'NotReadableError') {
        msg = 'Camera is already in use by another application.';
      } else if (isInsecureOrigin) {
        msg = 'Camera access requires HTTPS or localhost. Use "Take Photo of QR" below to snap a picture.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  // Mobile Native Camera / Image File Fallback (Works on ALL phones and over HTTP)
  const handleFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanStatus({ type: 'idle', message: '' });
    setCameraError(null);

    try {
      const html5QrCode = new Html5Qrcode(readerElementId);
      const decodedText = await html5QrCode.scanFile(file, true);
      handleProcessCode(decodedText);
    } catch (err: any) {
      setScanStatus({
        type: 'error',
        message: 'Could not detect a valid QR code in the image. Please try again or enter ticket number.',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProcessCode = async (rawCode: string) => {
    if (!rawCode.trim()) return;

    // Check operating hours allowed (open 24/7)
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

  // Get waiting tickets for quick one-click test-scan
  const waitingTickets = tickets.filter(
    (t) => t.status === 'waiting' && (!business || !t.businessId || t.businessId === business.id)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className={`w-full max-w-md rounded-3xl p-5 shadow-2xl border transition-all animate-scale-in max-h-[92vh] overflow-y-auto ${
          darkMode ? 'bg-[#141E2E] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center flex-shrink-0">
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
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 24/7 Active Scanning Indicator */}
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Scanner Active: Available 24/7 at any time</span>
        </div>

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
          {/* Isolated video container strictly managed by Html5Qrcode - ZERO React children */}
          <div 
            id={readerElementId} 
            className={`w-full rounded-2xl overflow-hidden border ${
              isCameraActive ? 'block min-h-[220px]' : 'hidden'
            } ${darkMode ? 'bg-black border-slate-700' : 'bg-black border-slate-200'}`}
          />

          {/* Placeholder & Action Buttons when camera is inactive */}
          {!isCameraActive && (
            <div 
              className={`w-full rounded-2xl border p-5 flex flex-col items-center justify-center text-center transition-colors ${
                darkMode ? 'bg-slate-900/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2.5">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-[13px] font-bold mb-1">
                Scan Customer Arrival QR Code
              </p>
              <p className="text-xs text-slate-400 mb-4 max-w-xs">
                Use your device camera or snap a quick photo of the ticket
              </p>

              {/* Actions row: Live Camera + Native Photo */}
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isStartingCamera}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isStartingCamera ? 'Opening Camera...' : 'Live Camera'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span>Take / Upload Photo</span>
                </button>
              </div>

              {/* Hidden file input with mobile camera capture */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileCapture}
                className="hidden"
              />
            </div>
          )}

          {/* Active Camera Controls */}
          {isCameraActive && (
            <div className="mt-2.5 flex justify-center">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold cursor-pointer transition-colors"
              >
                Stop Camera
              </button>
            </div>
          )}

          {/* Camera Error / Notice */}
          {cameraError && (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>

        {/* Manual Ticket Entry */}
        <form onSubmit={handleManualSubmit} className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-slate-400 block">
            Manual Ticket Entry / Barcode Scanner:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. A-101 or ticket_..."
              className={`flex-1 rounded-xl px-3.5 py-2.5 text-xs border outline-none font-mono ${
                darkMode
                  ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#00A843] hover:bg-[#00963c] text-white text-xs font-bold disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              Verify Ticket
            </button>
          </div>
        </form>

        {/* Quick Scan Waiting Tickets (One-Tap Test) */}
        {waitingTickets.length > 0 && (
          <div className="pt-3 border-t border-slate-200/50">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1 text-[#00A843]" />
              Quick Scan Waiting Tickets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {waitingTickets.slice(0, 4).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleProcessCode(t.id)}
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
