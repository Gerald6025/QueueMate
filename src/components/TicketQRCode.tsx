'use client';

import React, { useState } from 'react';
import { Ticket } from '@/types/queue';
import { 
  Ticket as TicketIcon, 
  CheckCircle2, 
  Download, 
  Check, 
  ShieldCheck,
  Clock,
  User,
  Sparkles
} from 'lucide-react';
import { downloadTicketPass } from '@/utils/ticketDownload';

interface TicketCardProps {
  ticket: Ticket;
  size?: number;
  showDetails?: boolean;
}

export const TicketQRCode: React.FC<TicketCardProps> = ({ 
  ticket, 
  showDetails = true 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadTicketPass(ticket);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2800);
    } catch (err) {
      console.error('Download ticket pass failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const formattedTime = new Date(ticket.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col items-center w-full max-w-[320px] mx-auto select-none">
      {/* Physical Ticket-Style Card */}
      <div className="relative w-full bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md">
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <TicketIcon className="w-4 h-4 text-emerald-200" />
            <span className="text-xs font-black tracking-wide uppercase">Queue Ticket</span>
          </div>
          <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
            {ticket.businessName || 'QueueMate'}
          </span>
        </div>

        {/* Card Body with Ticket Number */}
        <div className="p-5 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Your Ticket Number
          </span>

          <div className="py-2.5 px-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 my-1 inline-block min-w-[200px]">
            <span className="text-4xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {ticket.number}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2 flex items-center justify-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{ticket.customerName || 'Customer'}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{ticket.categoryName}</span>
          </p>

          {/* Scanned / Checked In Badge */}
          {ticket.isScanned ? (
            <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Verified & Checked In</span>
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center space-x-1 text-[11px] text-slate-400 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Issued at {formattedTime}</span>
            </div>
          )}
        </div>

        {/* Dashed Perforation Line with Ticket Notches */}
        <div className="relative flex items-center justify-between my-1">
          <div className="w-4 h-6 bg-[#F4FAF6] dark:bg-[#101927] rounded-r-full -ml-2 border-r border-y border-slate-200 dark:border-slate-800" />
          <div className="flex-1 border-t-2 border-dashed border-slate-200 dark:border-slate-800 mx-2" />
          <div className="w-4 h-6 bg-[#F4FAF6] dark:bg-[#101927] rounded-l-full -mr-2 border-l border-y border-slate-200 dark:border-slate-800" />
        </div>

        {/* Card Footer with Ticket Instructions */}
        <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 text-center">
          <div className="flex items-center justify-center space-x-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Present ticket number to staff upon arrival</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
            Ref: {ticket.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Prominent Save / Download Ticket Button */}
      <div className="w-full mt-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer ${
            downloadSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white disabled:opacity-50'
          }`}
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-white animate-scale-in" />
              <span>Saved Ticket to Device!</span>
            </>
          ) : isDownloading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Pass...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download Ticket Pass</span>
            </>
          )}
        </button>
      </div>

      {showDetails && (
        <div className="mt-2 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[260px]">
            Keep your ticket number handy. Counter staff will call your number when it's your turn.
          </p>
        </div>
      )}
    </div>
  );
};

export const TicketCard = TicketQRCode;
