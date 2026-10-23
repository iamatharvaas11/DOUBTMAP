'use client';

import React from 'react';
import { RawReport, Claim } from '@/lib/types';
import { Clock, Shield, AlertTriangle, CheckCircle, Radio, FileText, UserCheck, MessageSquare } from 'lucide-react';

interface EvidenceTimelineProps {
  reports: RawReport[];
  claims: Claim[];
}

const SOURCE_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  official: { label: 'Official Bulletin', icon: <Shield className="w-3.5 h-3.5 text-blue-600" />, color: 'bg-blue-50 text-blue-800 border-blue-200' },
  sensor: { label: 'Automated Telemetry Sensor', icon: <Radio className="w-3.5 h-3.5 text-purple-600" />, color: 'bg-purple-50 text-purple-800 border-purple-200' },
  field_operator: { label: 'Field Operator / Trooper', icon: <UserCheck className="w-3.5 h-3.5 text-emerald-600" />, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  internal_log: { label: 'Internal CAD/SRE Log', icon: <FileText className="w-3.5 h-3.5 text-slate-600" />, color: 'bg-slate-100 text-slate-800 border-slate-300' },
  crowdsource: { label: 'Crowdsourced Commuter', icon: <MessageSquare className="w-3.5 h-3.5 text-amber-600" />, color: 'bg-amber-50 text-amber-800 border-amber-200' },
};

export function EvidenceTimeline({ reports, claims }: EvidenceTimelineProps) {
  // Sort reports chronologically
  const sortedReports = [...reports].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Source Timeline & Evidence Provenance</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological log of ingested evidence reports, source reliability calibrations, and atomic extracted claims.
          </p>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {reports.length} Recorded Events
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {sortedReports.map((report, idx) => {
          const associatedClaims = claims.filter(c => c.reportId === report.id);
          const typeMeta = SOURCE_TYPE_LABELS[report.sourceType] ?? SOURCE_TYPE_LABELS.crowdsource;
          const isLatest = idx === sortedReports.length - 1;

          return (
            <div key={report.id} className="relative group">
              {/* Timeline Node Icon */}
              <div className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                isLatest ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isLatest ? 'bg-indigo-600' : 'bg-slate-400'}`} />
              </div>

              {/* Card Body */}
              <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200/90 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold border ${typeMeta.color}`}>
                      {typeMeta.icon}
                      <span>{typeMeta.label}</span>
                    </span>
                    <span className="font-bold text-xs text-slate-900">
                      {report.source}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(report.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-700">
                      Reliability: {(report.reliabilityScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Raw content */}
                <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed font-sans">
                  "{report.content}"
                </p>

                {/* Extracted claims chips */}
                {associatedClaims.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Extracted Claims:
                    </span>
                    {associatedClaims.map(c => {
                      const isConflicted = c.status === 'conflicted';
                      const isResolved = c.status === 'resolved' || c.status === 'supported';
                      const isStale = c.status === 'stale';

                      return (
                        <div
                          key={c.id}
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium border ${
                            isConflicted ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            isResolved ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            isStale ? 'bg-slate-100 text-slate-600 border-slate-200 line-through' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="font-bold">{c.subject}</span>
                          <span className="text-slate-400">|</span>
                          <span>{c.property}:</span>
                          <span className="font-semibold underline decoration-slate-300">"{c.value}"</span>
                          <span className="text-[10px] uppercase font-bold ml-1 opacity-75">
                            ({c.status})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

