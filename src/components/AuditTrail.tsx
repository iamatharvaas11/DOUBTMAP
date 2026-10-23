'use client';

import React from 'react';
import { AuditEntry } from '@/lib/types';
import { History, Shield, ArrowUpRight, ArrowDownRight, User, Terminal, Sparkles } from 'lucide-react';

interface AuditTrailProps {
  entries: AuditEntry[];
}

export function AuditTrail({ entries }: AuditTrailProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <History className="w-4 h-4 text-indigo-600" />
            <span>Verifiable Audit Log & State Deltas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically traceable event log recording every evidence ingestion, contradiction resolution, and confidence score shift.
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
          {entries.length} Audit Records
        </span>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => {
          const shift = entry.stateDelta.confidenceShift;
          const isPositive = shift >= 0;

          return (
            <div
              key={entry.id}
              className="p-3.5 rounded-lg border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 text-xs transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    entry.actor === 'verifier_agent' ? 'bg-indigo-100 text-indigo-800' :
                    entry.actor === 'user' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {entry.actor === 'verifier_agent' ? <Sparkles className="w-3 h-3 mr-0.5" /> : <Terminal className="w-3 h-3 mr-0.5" />}
                    <span>{entry.actor}</span>
                  </span>

                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    {entry.action}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500">
                  <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  
                  {/* State Deltas Badge */}
                  <div className="flex items-center space-x-2">
                    {entry.stateDelta.conflictsResolved > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Resolved: +{entry.stateDelta.conflictsResolved}
                      </span>
                    )}
                    {shift !== 0 && (
                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                        {isPositive ? `+${shift}` : shift}% Certainty
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed font-sans mt-1">
                {entry.details}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

