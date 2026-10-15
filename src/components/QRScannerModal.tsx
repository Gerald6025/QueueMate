'use client';

import React, { useState } from 'react';
import { useQueue } from '@/context/QueueContext';
import { Business, Ticket } from '@/types/queue';
import { 
  Ticket as TicketIcon, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Search,
  Clock,
  User,
  Sparkles,
  ShieldCheck,
  Check
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
  const [ticketInput, setTicketInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [status, setStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
    ticket?: Ticket;
  }>({
    type: 'idle',
    message: '',
  });

  const bizId = business?.id;

  // Filter waiting tickets for this business
  const waitingTickets = tickets.filter((t) => {
    const matchesBiz = !bizId || t.businessId === bizId || (business && t.businessName === business.name);
    const isWaiting = t.status === 'waiting' || t.status === 'called';
    if (!matchesBiz || !isWaiting) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return (
      t.number.toLowerCase().includes(q) ||
      (t.customerName && t.customerName.toLowerCase().includes(q)) ||
      t.categoryName.toLowerCase().includes(q)
    );
  });

  const handleVerify = async (codeToVerify: string) => {
    const code = codeToVerify.trim();
    if (!code) return;

    setStatus({ type: 'idle', message: 'Verifying ticket...' });

    const result = await scanTicket(code, bizId);

    if (result.success && result.ticket) {
      setStatus({
        type: 'success',
        message: `Ticket ${result.ticket.number} successfully verified & checked in!`,
        ticket: result.ticket,
      });
      setTicketInput('');
      if (onScanSuccess) {
        onScanSuccess(result.ticket);
      }
    } else {
      setStatus({
        type: 'error',
        message: result.message || 'Ticket could not be found or verified.',
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(ticketInput);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border transition-all animate-scale-in flex flex-col max-h-[90vh] ${
          darkMode 
            ? 'bg-[#182335] border-slate-700/80 text-white' 
            : 'bg-white border-slate-100 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-700/60 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TicketIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Ticket Verification & Check-in
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {business ? business.name : 'All Queues'} • Verify arriving customer tickets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Status Banner */}
        {status.type === 'success' && status.ticket && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 animate-scale-in flex-shrink-0">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Check-in Verified
                </span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {status.ticket.number}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {status.ticket.customerName || 'Customer'} • {status.ticket.categoryName}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Customer has arrived and is ready to be called at the counter.
                </p>
              </div>
            </div>
          </div>
        )}

        {status.type === 'error' && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2.5 animate-scale-in flex-shrink-0">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span className="font-medium">{status.message}</span>
          </div>
        )}

        {/* Manual Ticket Entry Form */}
        <form onSubmit={handleFormSubmit} className="mt-4 flex-shrink-0">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">
            Enter Ticket Number
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <TicketIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="e.g. A-101 or B-102"
                autoFocus
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold outline-none transition-all ${
                  darkMode
                    ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={!ticketInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Verify Ticket
            </button>
          </div>
        </form>

        {/* Waiting Tickets Section */}
        <div className="mt-5 flex-1 overflow-hidden flex flex-col min-h-0 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-2.5 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Waiting Tickets ({waitingTickets.length})
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter tickets..."
                className={`w-full pl-8 pr-2.5 py-1 rounded-lg text-xs border outline-none ${
                  darkMode
                    ? 'bg-slate-900/60 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
            {waitingTickets.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                {searchFilter ? 'No matching tickets found.' : 'No customers currently waiting in this queue.'}
              </div>
            ) : (
              waitingTickets.map((t) => (
                <div
                  key={t.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    t.isScanned
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : darkMode
                      ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-white hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono font-black text-sm">
                      {t.number}
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {t.customerName || 'Customer'}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {t.categoryName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="flex items-center space-x-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{Math.max(1, Math.floor((Date.now() - t.createdAt) / 60000))}m ago</span>
                        </span>
                        {t.isScanned && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-0.5">
                            <Check className="w-3 h-3" />
                            <span>Checked In</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVerify(t.number)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                      t.isScanned
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.isScanned ? 'Re-verify' : 'Check In'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between flex-shrink-0 text-xs text-slate-400">
          <span>Tickets can be verified by ticket number (e.g. A-101)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export const TicketVerificationModal = QRScannerModal;
