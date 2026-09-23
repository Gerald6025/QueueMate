'use client';

import React, { useState, useEffect } from 'react';
import { useQueue } from '@/context/QueueContext';
import { 
  Megaphone, 
  CheckCheck, 
  UserX, 
  Play, 
  Clock, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Sparkles,
  Users
} from 'lucide-react';

export const StaffCounter: React.FC = () => {
  const { 
    counters, 
    tickets, 
    callNextTicket, 
    recallTicket, 
    startServing, 
    completeTicket, 
    markNoShow,
    soundEnabled,
    setSoundEnabled
  } = useQueue();

  const [selectedCounterId, setSelectedCounterId] = useState<number>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const activeCounter = counters.find((c) => c.id === selectedCounterId) || counters[0];
  const currentTicket = tickets.find((t) => t.id === activeCounter.currentTicketId);

  // Timer for active ticket service duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentTicket && (currentTicket.status === 'called' || currentTicket.status === 'serving')) {
      const startTime = currentTicket.calledAt || Date.now();
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));

      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [currentTicket]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Waiting tickets eligible for this counter
  const waitingForCounter = tickets.filter(
    (t) => t.status === 'waiting' && activeCounter.assignedCategories.includes(t.categoryId)
  ).sort((a, b) => {
    if (a.categoryId === 'vip' && b.categoryId !== 'vip') return -1;
    if (b.categoryId === 'vip' && a.categoryId !== 'vip') return 1;
    return a.createdAt - b.createdAt;
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 backdrop-blur-md">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Staff Counter Console
          </span>
          <h2 className="text-xl font-bold text-white">Operator Management Terminal</h2>
        </div>

        <div className="flex items-center space-x-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs font-medium transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={soundEnabled ? 'Chime & voice alerts ON' : 'Audio muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Test Chime */}
          <button
            onClick={() => recallTicket(activeCounter.id)}
            disabled={!currentTicket}
            className="p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Test Sound</span>
          </button>
        </div>
      </div>

      {/* Counter Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {counters.map((c) => {
          const isSelected = c.id === selectedCounterId;
          const isBusy = c.currentTicketId !== undefined;

          return (
            <button
              key={c.id}
              onClick={() => setSelectedCounterId(c.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-white">{c.name}</span>
                <span className={`w-2 h-2 rounded-full ${
                  c.status === 'serving'
                    ? 'bg-emerald-400 animate-pulse'
                    : c.status === 'calling'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-slate-500'
                }`} />
              </div>
              <p className="text-xs text-slate-400 truncate">{c.staffName}</p>
              <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-500">
                <span>{c.servedCount} served</span>
                <span className={isBusy ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                  {isBusy ? 'Active' : 'Idle'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Service Panel */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        {currentTicket ? (
          <div className="space-y-6">
            {/* Active Ticket Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    currentTicket.status === 'called'
                      ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {currentTicket.status === 'called' ? 'Calling...' : 'Serving Customer'}
                  </span>
                  <span className="text-xs text-slate-400">• {currentTicket.categoryName}</span>
                </div>
                <h3 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">
                  {currentTicket.number}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Customer: <strong className="text-white">{currentTicket.customerName}</strong>
                </p>
              </div>

              {/* Service Timer */}
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 flex items-center space-x-3 sm:self-start">
                <Clock className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Duration</span>
                  <span className="text-2xl font-bold font-mono text-white">{formatTimer(elapsedSeconds)}</span>
                </div>
              </div>
            </div>

            {/* Operator Actions Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Recall / Announce Again */}
              <button
                onClick={() => recallTicket(activeCounter.id)}
                className="py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
              >
                <Megaphone className="w-4 h-4 text-sky-400" />
                <span>Recall (Chime)</span>
              </button>

              {/* Start Serving (if currently called) */}
              {currentTicket.status === 'called' ? (
                <button
                  onClick={() => startServing(activeCounter.id)}
                  className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Serving</span>
                </button>
              ) : (
                <button
                  disabled
                  className="py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 text-sm font-semibold flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  <span>Serving Now</span>
                </button>
              )}

              {/* Complete Service */}
              <button
                onClick={() => completeTicket(activeCounter.id)}
                className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/25"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Finish / Complete</span>
              </button>

              {/* Mark No Show */}
              <button
                onClick={() => markNoShow(activeCounter.id)}
                className="py-3 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <UserX className="w-4 h-4" />
                <span>No-Show</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty / Idle State */
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-700/40 border border-slate-600/50 flex items-center justify-center mb-4 text-slate-400">
              <Users className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {activeCounter.name} is Currently Idle
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              There are currently <strong className="text-emerald-400 font-semibold">{waitingForCounter.length}</strong> customer(s) waiting in your queue.
            </p>

            <button
              onClick={() => callNextTicket(activeCounter.id)}
              disabled={waitingForCounter.length === 0}
              className="py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/20 flex items-center space-x-3 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              <Megaphone className="w-5 h-5" />
              <span>CALL NEXT CUSTOMER</span>
            </button>
          </div>
        )}
      </div>

      {/* Up Next in Line for this counter */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>Waiting Queue for {activeCounter.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-700 text-xs font-mono text-slate-300">
              {waitingForCounter.length}
            </span>
          </h4>
          <span className="text-xs text-slate-400">Services: {activeCounter.assignedCategories.join(', ')}</span>
        </div>

        {waitingForCounter.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Queue is currently clear. No pending tickets.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {waitingForCounter.map((t, idx) => (
              <div
                key={t.id}
                className="bg-slate-900/70 border border-slate-700/50 p-3 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono text-slate-400 font-bold">#{idx + 1}</span>
                  <div>
                    <span className="text-base font-bold font-mono text-white block leading-none">
                      {t.number}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[100px] block mt-0.5">
                      {t.customerName}
                    </span>
                  </div>
                </div>

                {t.categoryId === 'vip' ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>VIP</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-medium">
                    {Math.max(1, Math.floor((Date.now() - t.createdAt) / 60000))}m ago
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
