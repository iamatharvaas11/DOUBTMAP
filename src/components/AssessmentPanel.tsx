'use client';

import React from 'react';
import { Assessment, Conflict } from '@/lib/types';
import { ShieldCheck, AlertTriangle, HelpCircle, CheckCircle2, ArrowRightCircle, Sparkles } from 'lucide-react';

interface AssessmentPanelProps {
  assessment: Assessment;
  conflicts: Conflict[];
}

export function AssessmentPanel({ assessment, conflicts }: AssessmentPanelProps) {
  const activeConflicts = conflicts.filter(c => c.status === 'active');
  const isHazard = assessment.overallStatus === 'hazard_confirmed';
  const isCleared = assessment.overallStatus === 'false_alarm_cleared';

  const bannerColor = 
    isHazard ? 'bg-rose-50 border-rose-300 text-rose-950' :
    isCleared ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
    'bg-amber-50 border-amber-300 text-amber-950';

  const badgeColor = 
    isHazard ? 'bg-rose-600 text-white' :
    isCleared ? 'bg-emerald-600 text-white' :
    'bg-amber-600 text-white';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      {/* Assessment Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Operational Assessment & Reconciliation Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time synthesis of corroborated evidence, flagged contradictions, and open verification requirements.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">Calibrated Rating:</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {assessment.confidenceScore}% Certainty
          </span>
        </div>
      </div>

      {/* Main Status Headline Alert Banner */}
      <div className={`p-4 rounded-xl border ${bannerColor} mb-5 flex items-start space-x-3.5 shadow-xs`}>
        {isHazard ? (
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        ) : isCleared ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        )}

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
              {assessment.overallStatus.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Evaluated {new Date(assessment.lastCalculatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <h3 className="text-sm font-bold tracking-tight">
            {assessment.headline}
          </h3>
          <div className="mt-2 flex items-center space-x-1.5 text-xs font-medium">
            <span className="opacity-75">Recommended Action:</span>
            <span className="font-semibold underline decoration-current">
              {assessment.recommendedNextStep}
            </span>
          </div>
        </div>
      </div>

      {/* Three-Column Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Supported Facts */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/90">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Facts ({assessment.supportedFacts.length})</span>
          </h4>
          <ul className="space-y-2 text-xs">
            {assessment.supportedFacts.map((fact, idx) => (
              <li key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 leading-relaxed font-medium shadow-2xs">
                {fact}
              </li>
            ))}
          </ul>
        </div>

        {/* Conflicting Claims */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/90">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Active Contradictions ({assessment.activeConflicts.length})</span>
          </h4>
          {assessment.activeConflicts.length === 0 ? (
            <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-400 italic text-center">
              No conflicting claims remaining.
            </div>
          ) : (
            <ul className="space-y-2 text-xs">
              {assessment.activeConflicts.map((conflict, idx) => (
                <li key={idx} className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-200 text-rose-900 leading-relaxed font-medium shadow-2xs">
                  {conflict}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Unresolved Questions */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/90">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Unresolved Questions ({assessment.unresolvedQuestions.length})</span>
          </h4>
          <ul className="space-y-2 text-xs">
            {assessment.unresolvedQuestions.map((q, idx) => (
              <li key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 leading-relaxed font-medium shadow-2xs">
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

