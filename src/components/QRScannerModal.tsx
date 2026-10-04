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
  RotateCw,
  Zap,
  Image as ImageIcon
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
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [currentCamIndex, setCurrentCamIndex] = useState(0);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readerElementId = 'qr-code-isolated-reader';

  // Check 24/7 scanning eligibility
  const eligibility = checkScanEligibility(business);

  useEffect(() => {
    // Probe available cameras on mount if supported
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      Html5Qrcode.getCameras()
        .then((cameras) => {
          if (cameras && cameras.length > 0) {
            setAvailableCameras(cameras);
            // Default to back/rear camera if available
            const backIdx = cameras.findIndex((c) =>
              c.label.toLowerCase().includes('back') ||
              c.label.toLowerCase().includes('rear') ||
              c.label.toLowerCase().includes('environment') ||
              c.label.toLowerCase().includes('main')
            );
            if (backIdx >= 0) {
              setCurrentCamIndex(backIdx);
            }
          }
        })
        .catch(() => {
          // ignore enumeration error
        });
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

  const startCameraWithDevice = async (cameraConfig: any) => {
    setCameraError(null);
    setIsStartingCamera(true);

    // Ensure previous instance is cleared
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }

    try {
      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 12,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minDim = Math.min(viewfinderWidth, viewfinderHeight);
            const boxSize = Math.max(160, Math.floor(minDim * 0.72));
            return { width: boxSize, height: boxSize };
          },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          handleProcessCode(decodedText);
          await stopCamera();
        },
        () => {} // scan frame error, ignore
      );

      // Mobile Chrome / Samsung Internet fix: ensure video playsinline and muted
      setTimeout(() => {
        const video = document.querySelector<HTMLVideoElement>(`#${readerElementId} video`);
        if (video) {
          video.setAttribute('playsinline', 'true');
          video.setAttribute('webkit-playsinline', 'true');
          video.muted = true;
          video.play().catch(() => {});
        }
      }, 200);

      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      let msg = err?.message || 'Unable to access camera.';
      if (err?.name === 'NotAllowedError' || msg.includes('Permission')) {
        msg = 'Camera permission was denied. Please allow camera permissions in browser settings.';
      } else if (err?.name === 'NotFoundError') {
        msg = 'No camera found on this device.';
      } else if (err?.name === 'NotReadableError') {
        msg = 'Camera sensor busy. Tap "Switch Camera" or use "Take / Upload Photo".';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const startCamera = async () => {
    // If cameras enumerated, use selected camera ID
    if (availableCameras.length > 0 && availableCameras[currentCamIndex]) {
      await startCameraWithDevice(availableCameras[currentCamIndex].id);
    } else {
      // Fallback to environment facing mode
      await startCameraWithDevice({ facingMode: 'environment' });
    }
  };

  const switchCamera = async () => {
    if (availableCameras.length <= 1) {
      // Toggle between facing modes
      await stopCamera();
      await startCameraWithDevice({ facingMode: isCameraActive ? 'user' : 'environment' });
      return;
    }

    const nextIndex = (currentCamIndex + 1) % availableCameras.length;
    setCurrentCamIndex(nextIndex);
    await stopCamera();
    await startCameraWithDevice(availableCameras[nextIndex].id);
  };

  // Mobile Native Camera / Image File Fallback (Works 100% on all devices)
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
        message: 'No QR code recognized in the image. Please try taking another photo or enter ticket number below.',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProcessCode = async (rawCode: string) => {
    if (!rawCode.trim()) return;

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

  const waitingTickets = tickets.filter(
    (t) => t.status === 'waiting' && (!business || !t.businessId || t.businessId === business.id)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div 
        className={`w-full max-w-md rounded-3xl p-5 shadow-2xl border transition-all animate-scale-in max-h-[94vh] overflow-y-auto ${
          darkMode ? 'bg-[#141E2E] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 mb-3.5">
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

        {/* Scan Status Feedback */}
        {scanStatus.type !== 'idle' && (
          <div 
            className={`mb-3.5 p-4 rounded-2xl border flex items-start space-x-3 animate-scale-in ${
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

        {/* Camera Viewport Area */}
        <div className="mb-4">
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-black min-h-[250px] flex items-center justify-center">
            
            {/* The dedicated Html5Qrcode video canvas container - ALWAYS mounted with non-zero dimensions */}
            <div 
              id={readerElementId} 
              className="w-full h-full min-h-[250px] flex items-center justify-center [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
            />

            {/* When Camera is ACTIVE: Show animated scanning laser */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
                <div className="w-[72%] h-[72%] border-2 border-emerald-500/80 rounded-2xl relative shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  {/* Laser line moving across */}
                  <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* When Camera is INACTIVE: Show Placeholder & Start Controls */}
            {!isCameraActive && (
              <div className={`absolute inset-0 p-5 flex flex-col items-center justify-center text-center ${
                darkMode ? 'bg-[#182335]' : 'bg-slate-50'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2.5">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold mb-1">
                  Ready to Scan Ticket
                </h3>
                <p className="text-xs text-slate-400 mb-4 max-w-xs">
                  Tap Live Camera or use your phone camera to take a photo
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={isStartingCamera}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#00A843] hover:bg-[#00963c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isStartingCamera ? 'Starting...' : 'Open Camera'}</span>
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
              </div>
            )}
          </div>

          {/* Active Camera Action Bar: Stop + Switch Camera */}
          {isCameraActive && (
            <div className="mt-2.5 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={switchCamera}
                className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
                title="Switch to another camera sensor"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Switch Camera ({availableCameras.length > 0 ? `${currentCamIndex + 1}/${availableCameras.length}` : 'Flip'})</span>
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                Stop Camera
              </button>
            </div>
          )}

          {/* Native Mobile Camera File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileCapture}
            className="hidden"
          />

          {/* Camera Error Message */}
          {cameraError && (
            <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>

        {/* Manual Ticket Number Entry */}
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
