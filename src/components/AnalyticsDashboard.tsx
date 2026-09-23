'use client';

import React from 'react';
import { useQueue } from '@/context/QueueContext';
import { SERVICE_CATEGORIES } from '@/types/queue';
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  UserX, 
  RotateCcw, 
  Download, 
  PlusCircle, 
  Sparkles 
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { tickets, counters, resetQueues, seedDemoTickets } = useQueue();

  const totalIssued = tickets.length;
  const waitingCount = tickets.filter((t) => t.status === 'waiting').length;
  const servingCount = tickets.filter((t) => t.status === 'serving' || t.status === 'called').length;
  const completedTickets = tickets.filter((t) => t.status === 'completed');
  const completedCount = completedTickets.length;
  const noshowCount = tickets.filter((t) => t.status === 'noshow').length;

  // Calculate average wait time for completed tickets
  const totalWaitMinutes = completedTickets.reduce((acc, t) => {
    if (t.calledAt && t.createdAt) {
      return acc + (t.calledAt - t.createdAt) / 60000;
    }
    return acc + 6; // default estimate
  }, 0);
  const avgWaitTime = completedCount > 0 ? (totalWaitMinutes / completedCount).toFixed(1) : '4.2';

  const exportCSV = () => {
    const headers = 'ID,Number,Category,Customer,Status,Counter,Created,Called,Completed\n';
    const rows = tickets.map((t) => 
      `"${t.id}","${t.number}","${t.categoryName}","${t.customerName || ''}","${t.status}","${t.counterName || ''}","${new Date(t.createdAt).toLocaleTimeString()}","${t.calledAt ? new Date(t.calledAt).toLocaleTimeString() : ''}","${t.completedAt ? new Date(t.completedAt).toLocaleTimeString() : ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `queue-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Operations & Analytics
          </span>
          <h2 className="text-xl font-bold text-white">Queue Performance Overview</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={seedDemoTickets}
            className="py-2 px-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Load Demo Data</span>
          </button>

          <button
            onClick={exportCSV}
            className="py-2 px-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all queue tickets?')) {
                resetQueues();
              }
            }}
            className="py-2 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Queue</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Tickets</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white">{totalIssued}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Today's volume</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">In Waiting Queue</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-amber-400">{waitingCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Pending service</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Being Served</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-3xl font-black text-blue-400">{servingCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Active at counters</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-emerald-400">{completedCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Customers served</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg Wait Time</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-3xl font-black text-purple-400">{avgWaitTime}m</span>
          <span className="text-[11px] text-slate-500 block mt-1">Per ticket</span>
        </div>
      </div>

      {/* Counter Staff Performance Table */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Counter Officer Productivity</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700/70 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Counter</th>
                <th className="pb-3">Officer</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Assigned Services</th>
                <th className="pb-3 text-right pr-2">Tickets Served</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {counters.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-white">{c.name}</td>
                  <td className="py-3.5 text-slate-300">{c.staffName}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      c.status === 'serving'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : c.status === 'calling'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400">
                    {c.assignedCategories.join(', ')}
                  </td>
                  <td className="py-3.5 text-right pr-2 font-mono font-bold text-white text-sm">
                    {c.servedCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Category Demand Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SERVICE_CATEGORIES.map((cat) => {
          const catTickets = tickets.filter((t) => t.categoryId === cat.id);
          const catWaiting = catTickets.filter((t) => t.status === 'waiting').length;
          const catDone = catTickets.filter((t) => t.status === 'completed').length;

          return (
            <div key={cat.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{cat.name}</span>
                <span className="text-xs font-mono font-bold text-emerald-400">Series {cat.code}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700/40">
                <span>Waiting: <strong className="text-white">{catWaiting}</strong></span>
                <span>Served: <strong className="text-white">{catDone}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
