'use client';

import React from 'react';
import { Incident } from '@/lib/types';
import { AlertTriangle, ShieldCheck, Database, HelpCircle, Activity } from 'lucide-react';

interface KPIStripProps {
  incident: Incident;
}

function KPIStripComponent({ incident }: KPIStripProps) {
  const activeConflicts = incident.conflicts.filter(c => c.status === 'active');
  const criticalConflicts = activeConflicts.filter(c => c.severity === 'critical');
  const resolvedConflicts = incident.conflicts.filter(c => c.status === 'resolved');
  const totalReports = incident.reports.length;
  const officialOrSensorCount = incident.reports.filter(
    r => r.sourceType === 'official' || r.sourceType === 'sensor' || r.sourceType === 'field_operator'
  ).length;

  const confidence = incident.assessment.confidenceScore;
  const confidenceColor = 
    confidence >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    confidence >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' :
    'text-rose-700 bg-rose-50 border-rose-200';

  const barColor = 
    confidence >= 80 ? 'bg-emerald-500' :
    confidence >= 50 ? 'bg-amber-500' :
    'bg-rose-500';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Evidence Sources */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evidence Sources</span>
          <Database className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-900">{totalReports}</span>
          <span className="text-xs text-slate-500">
            ({officialOrSensorCount} verified sensors/DOT)
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {incident.claims.length} atomic factual claims tracked
        </p>
      </div>

      {/* Active Contradictions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Conflicts</span>
          <AlertTriangle className={`w-4 h-4 ${criticalConflicts.length > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className={`text-2xl font-bold ${activeConflicts.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {activeConflicts.length}
          </span>
          {criticalConflicts.length > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">
              {criticalConflicts.length} Critical
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {resolvedConflicts.length} contradiction(s) reconciled
        </p>
      </div>

      {/* Verification Queue Depth */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification Queue</span>
          <Activity className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-900">
            {incident.verificationQueue.length}
          </span>
          <span className="text-xs text-slate-500">Candidate actions</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Top candidate: {incident.verificationQueue[0]?.priorityScore ?? 0}/100 priority
        </p>
      </div>

      {/* Engine Confidence */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Calibrated Confidence</span>
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900">{confidence}%</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${confidenceColor}`}>
            {confidence >= 80 ? 'High Certainty' : confidence >= 50 ? 'Investigating' : 'Critical Discrepancy'}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`} 
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export const KPIStrip = React.memo(KPIStripComponent);

