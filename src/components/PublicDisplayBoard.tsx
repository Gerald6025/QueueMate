'use client';

import React, { useState, useEffect } from 'react';
import { useQueue } from '@/context/QueueContext';
import { Maximize2, Minimize2, Bell, Clock, Users, Volume2 } from 'lucide-react';

export const PublicDisplayBoard: React.FC = () => {
  const { counters, tickets, lastCalledTicket } = useQueue();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const waitingTickets = tickets
    .filter((t) => t.status === 'waiting')
    .sort((a, b) => {
      if (a.categoryId === 'vip' && b.categoryId !== 'vip') return -1;
      if (b.categoryId === 'vip' && a.categoryId !== 'vip') return 1;
      return a.createdAt - b.createdAt;
    })
    .slice(0, 7);

  const activeTickets = counters.map((c) => {
    const ticket = tickets.find((t) => t.id === c.currentTicketId);
    const isRecentlyCalled = lastCalledTicket && ticket && lastCalledTicket.id === ticket.id;
    return {
      counter: c,
      ticket,
      isRecentlyCalled,
    };
  });

  return (
    <div className="w-full min-h-[720px] bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col justify-between select-none">
      {/* Top TV Board Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-glow">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase">
              Central Service Center
            </h1>
            <p className="text-xs text-slate-400">Queue Information & Call Display</p>
          </div>
        </div>

        {/* Live Clock & Fullscreen */}
        <div className="flex items-center space-x-5">
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white block">
              {currentTime}
            </span>
            <span className="text-xs text-slate-400 block">{currentDate}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen TV Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1 items-stretch">
        {/* Left 2 Cols: Now Serving Grid */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-wider uppercase text-emerald-400 flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span>Now Serving</span>
            </h2>
            <span className="text-xs text-slate-400">Proceed when your number appears</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {activeTickets.map(({ counter, ticket, isRecentlyCalled }) => (
              <div
                key={counter.id}
                className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                  isRecentlyCalled
                    ? 'bg-emerald-950/40 border-emerald-400 ring-4 ring-emerald-500/30 shadow-2xl shadow-emerald-500/20 animate-pulse'
                    : ticket
                    ? 'bg-slate-900/90 border-slate-800 shadow-lg'
                    : 'bg-slate-900/30 border-slate-900 opacity-60'
                }`}
              >
                {/* Counter Label */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-extrabold tracking-widest text-slate-300 uppercase">
                    {counter.name}
                  </span>
                  {ticket && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isRecentlyCalled
                        ? 'bg-emerald-500 text-slate-950 font-bold animate-bounce-subtle'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isRecentlyCalled ? 'Calling Now 🔔' : 'Serving'}
                    </span>
                  )}
                </div>

                {/* Big Ticket Display */}
                <div className="my-auto py-3 text-center">
                  {ticket ? (
                    <>
                      <div className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-white drop-shadow-md">
                        {ticket.number}
                      </div>
                      <div className="text-sm font-medium text-emerald-400 mt-2">
                        {ticket.categoryName}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-600 font-mono text-2xl font-bold tracking-widest">
                      ---
                      <p className="text-xs text-slate-600 font-sans mt-1">Ready for next</p>
                    </div>
                  )}
                </div>

                {/* Counter Staff Info */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Officer: {counter.staffName}</span>
                  <span>{counter.servedCount} today</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Up Next Queue */}
        <div className="flex flex-col bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold tracking-wider uppercase text-slate-300 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Up Next in Line</span>
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {waitingTickets.length} waiting
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-hidden">
            {waitingTickets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No customers currently waiting</p>
              </div>
            ) : (
              waitingTickets.map((ticket, idx) => (
                <div
                  key={ticket.id}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/60 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-slate-500 font-bold w-5">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="text-xl font-bold font-mono text-white block leading-none">
                        {ticket.number}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        {ticket.categoryName}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    ~{Math.max(2, (idx + 1) * 4)}m
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ticker / Running Banner */}
      <div className="mt-2 bg-slate-900/90 border border-slate-800 rounded-2xl py-3 px-4 flex items-center overflow-hidden text-xs text-slate-300">
        <span className="font-bold text-emerald-400 flex items-center space-x-1.5 mr-4 flex-shrink-0">
          <Bell className="w-4 h-4" />
          <span>ANNOUNCEMENTS</span>
        </span>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <p className="inline-block animate-marquee">
            📢 Please prepare your required documents prior to approaching the designated counter • Priority express service available for seniors and VIP members at Counter 4 • Complimentary guest Wi-Fi: Center_Guest
          </p>
        </div>
      </div>
    </div>
  );
};
