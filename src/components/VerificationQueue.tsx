'use client';

import React from 'react';
import { VerificationAction } from '@/lib/types';
import { 
  CheckCircle2, 
  Clock, 
  Send, 
  Crosshair, 
  Plane, 
  Radio, 
  FileSearch, 
  Camera, 
  Users, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface VerificationQueueProps {
  queue: VerificationAction[];
  onExecute: (action: VerificationAction) => void;
  isExecuting: boolean;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  dispatch_drone: <Plane className="w-4 h-4 text-indigo-600" />,
  query_telemetry: <Radio className="w-4 h-4 text-emerald-600" />,
  deploy_field_crew: <Users className="w-4 h-4 text-blue-600" />,
  cross_reference_logs: <FileSearch className="w-4 h-4 text-amber-600" />,
  request_cctv_feed: <Camera className="w-4 h-4 text-purple-600" />,
  satellite_check: <Cpu className="w-4 h-4 text-cyan-600" />,
};

export function VerificationQueue({ queue, onExecute, isExecuting }: VerificationQueueProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Crosshair className="w-4 h-4 text-indigo-600" />
            <span>Verification Priority Queue & Ranking Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic algorithmic ranking based on incident importance, conflict severity, expected information gain, and time-to-verify.
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
          {queue.length} Actions Queued
        </span>
      </div>

      {queue.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">All Contradictions Reconciled</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No pending high-severity conflicts require direct sensor dispatch or field verification.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((action, index) => {
            const factors = action.scoringFactors;

            return (
              <div
                key={action.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white transition-all shadow-xs"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider">RANK</span>
                      <span className="text-base font-black leading-none mt-0.5">#{index + 1}</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="p-1 rounded bg-slate-100 border border-slate-200">
                          {ACTION_ICONS[action.actionType] ?? <Crosshair className="w-4 h-4 text-slate-600" />}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {action.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {action.description}
                      </p>

                      {/* Transparent Scoring Formula Breakdown */}
                      <div className="mt-2.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-[11px] text-slate-600">
                        <div className="font-mono text-[10px] text-slate-500 mb-1 flex items-center justify-between">
                          <span className="font-semibold text-slate-700">Deterministic Scoring Breakdown:</span>
                          <span className="font-bold text-indigo-700">Aggregate: {action.priorityScore}/100</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[10px]">
                          <div className="bg-white p-1 rounded border border-slate-200/60">
                            <span className="text-slate-400 block text-[9px]">Importance (25%)</span>
                            <span className="font-bold text-slate-800">{factors?.incidentImportance ?? 85}</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-200/60">
                            <span className="text-slate-400 block text-[9px]">Conflict Sev (25%)</span>
                            <span className="font-bold text-rose-700">{factors?.conflictSeverity ?? 90}</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-200/60">
                            <span className="text-slate-400 block text-[9px]">Info Gain (20%)</span>
                            <span className="font-bold text-indigo-700">{factors?.expectedInfoGain ?? 85}</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-200/60">
                            <span className="text-slate-400 block text-[9px]">Freshness Gap (20%)</span>
                            <span className="font-bold text-amber-700">{factors?.freshnessGap ?? 80}</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-200/60">
                            <span className="text-slate-400 block text-[9px]">Speed/Cost (10%)</span>
                            <span className="font-bold text-emerald-700">{factors?.costDelayFactor ?? 80}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Execution CTA */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right mb-2 hidden md:block">
                      <span className="text-xs text-slate-400 flex items-center justify-end font-mono">
                        <Clock className="w-3 h-3 mr-1" /> Est: ~{action.estimatedDelayMinutes}m
                      </span>
                    </div>
                    <button
                      onClick={() => onExecute(action)}
                      disabled={isExecuting}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      aria-label={`Execute verification: ${action.title}`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isExecuting ? 'Verifying...' : 'Execute Verification'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

