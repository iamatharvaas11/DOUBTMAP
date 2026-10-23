'use client';

import React, { useState } from 'react';
import { Incident, Claim, Conflict, VerificationAction } from '@/lib/types';
import { GitCommit, AlertOctagon, CheckCircle2, Clock, ShieldAlert, Cpu, Eye, Radio } from 'lucide-react';

interface EvidenceGraphProps {
  incident: Incident;
  onSelectAction?: (action: VerificationAction) => void;
}

export function EvidenceGraph({ incident, onSelectAction }: EvidenceGraphProps) {
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);

  const activeConflicts = incident.conflicts.filter(c => c.status === 'active');
  const resolvedConflicts = incident.conflicts.filter(c => c.status === 'resolved');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <GitCommit className="w-4 h-4 text-indigo-600" />
            <span>Interactive Evidence & Conflict Graph</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Trace causal links between raw reports, extracted claims, detected contradictions, and verification actions.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Contradiction</span>
          </span>
          <span className="flex items-center space-x-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Verified / Resolved</span>
          </span>
          <span className="flex items-center space-x-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>Action</span>
          </span>
        </div>
      </div>

      {/* Grid Flow: 4 Column Visual Relationship Map */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Column 1: Evidence Sources */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>1. Raw Sources</span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
              {incident.reports.length} ingested
            </span>
          </div>
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {incident.reports.map((report) => (
              <div
                key={report.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    report.sourceType === 'official' ? 'bg-blue-100 text-blue-800' :
                    report.sourceType === 'sensor' ? 'bg-purple-100 text-purple-800' :
                    report.sourceType === 'field_operator' ? 'bg-emerald-100 text-emerald-800' :
                    report.sourceType === 'internal_log' ? 'bg-slate-200 text-slate-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {report.sourceType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="font-semibold text-slate-900 truncate" title={report.source}>
                  {report.source}
                </div>
                <p className="text-slate-600 line-clamp-2 mt-1 text-[11px] leading-relaxed">
                  "{report.content}"
                </p>
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Reliability</span>
                  <span className="font-mono font-bold text-slate-700">{(report.reliabilityScore * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Extracted Claims */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>2. Extracted Claims</span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
              {incident.claims.length} claims
            </span>
          </div>
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {incident.claims.map((claim) => {
              const isConflicted = claim.status === 'conflicted';
              const isResolved = claim.status === 'resolved' || claim.status === 'supported';
              const isStale = claim.status === 'stale';

              return (
                <div
                  key={claim.id}
                  className={`p-3 rounded-lg border text-xs transition-all ${
                    isConflicted ? 'border-rose-200 bg-rose-50/50' :
                    isResolved ? 'border-emerald-200 bg-emerald-50/40' :
                    isStale ? 'border-slate-200 bg-slate-100/70 opacity-60' :
                    'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 truncate text-[11px]" title={claim.subject}>
                      {claim.subject}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                      isConflicted ? 'bg-rose-100 text-rose-800' :
                      isResolved ? 'bg-emerald-100 text-emerald-800' :
                      isStale ? 'bg-slate-200 text-slate-600' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mb-1">
                    [{claim.property}]
                  </div>
                  <div className="font-medium text-slate-800 bg-white/80 p-1.5 rounded border border-slate-200/60 text-[11px]">
                    "{claim.value}"
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Source: {claim.source.split(' ')[0]}</span>
                    <span className="font-mono">Conf: {(claim.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Detected Contradictions */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>3. Contradictions</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
              activeConflicts.length > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {activeConflicts.length} active
            </span>
          </div>
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {incident.conflicts.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No contradictions detected.
              </div>
            ) : (
              incident.conflicts.map((conflict) => {
                const isActive = conflict.status === 'active';
                const isSelected = selectedConflictId === conflict.id;

                return (
                  <button
                    key={conflict.id}
                    onClick={() => setSelectedConflictId(isSelected ? null : conflict.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isActive
                        ? isSelected
                          ? 'border-rose-400 bg-rose-50 shadow-md ring-2 ring-rose-400'
                          : 'border-rose-200 bg-white hover:bg-rose-50/30'
                        : 'border-emerald-200 bg-emerald-50/30 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        conflict.severity === 'critical' ? 'bg-rose-600 text-white' :
                        conflict.severity === 'high' ? 'bg-amber-500 text-white' :
                        'bg-slate-600 text-white'
                      }`}>
                        {conflict.severity}
                      </span>
                      <span className={`text-[10px] font-bold ${isActive ? 'text-rose-600' : 'text-emerald-600 flex items-center space-x-1'}`}>
                        {isActive ? 'UNRESOLVED' : <><CheckCircle2 className="w-3 h-3 inline mr-0.5" /> RESOLVED</>}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 text-xs mb-1">
                      {conflict.subject}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-3">
                      {conflict.description}
                    </p>
                    {conflict.resolutionReason && (
                      <div className="mt-2 p-1.5 rounded bg-emerald-100/70 border border-emerald-200 text-[10px] text-emerald-900 font-medium">
                        Resolution: {conflict.resolutionReason}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 4: Prioritized Verifications */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>4. Verification Queue</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">
              Ranked Top
            </span>
          </div>
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {incident.verificationQueue.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400">
                All contradictions resolved.
              </div>
            ) : (
              incident.verificationQueue.map((action, idx) => (
                <div
                  key={action.id}
                  className="p-3 rounded-lg border border-indigo-200 bg-white hover:border-indigo-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                      RANK #{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-700">
                      Score: {action.priorityScore}/100
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {action.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> ~{action.estimatedDelayMinutes}m delay
                    </span>
                    {onSelectAction && (
                      <button
                        onClick={() => onSelectAction(action)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 transition-colors"
                      >
                        Execute
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

