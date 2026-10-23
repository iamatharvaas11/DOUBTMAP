'use client';

import React, { useState } from 'react';
import { RawReport, SourceType } from '@/lib/types';
import { sanitizeAndCheckInput } from '@/lib/security';
import { X, Send, ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: RawReport) => void;
}

export function NewReportModal({ isOpen, onClose, onSubmit }: NewReportModalProps) {
  const [source, setSource] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('field_operator');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const securityCheck = sanitizeAndCheckInput(content, 2000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !content.trim()) return;

    const newReport: RawReport = {
      id: `rep-usr-${Date.now()}`,
      source: source.trim(),
      sourceType,
      timestamp: new Date().toISOString(),
      content: securityCheck.sanitized,
      reliabilityScore: 
        sourceType === 'official' ? 0.90 :
        sourceType === 'sensor' ? 0.88 :
        sourceType === 'field_operator' ? 0.85 :
        sourceType === 'internal_log' ? 0.82 : 0.50,
    };

    onSubmit(newReport);
    setSource('');
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">
            Submit Corroborating / Verification Evidence
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Ingest new situational report. The verification engine will extract claims, detect conflicts, and update calibrated certainty.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Source Name / Call Sign
            </label>
            <input
              type="text"
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Field Engineer Team Alpha / CCTV Cam-102"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Source Reliability Classification
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="field_operator">Field Operator / Human Inspector (85% Reliability)</option>
              <option value="sensor">Telemetry Sensor / Drone UAV (88% Reliability)</option>
              <option value="official">Official Agency Bulletin (90% Reliability)</option>
              <option value="internal_log">Internal SRE / CAD Dispatch Log (82% Reliability)</option>
              <option value="crowdsource">Crowdsourced Commuter / Social (50% Reliability)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Report Content
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter observed facts, structural measurements, or verified telemetry..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans"
            />

            {/* Prompt Injection Real-time Shield Indicator */}
            {content.length > 0 && (
              <div className="mt-2 text-xs">
                {securityCheck.isSafe ? (
                  <div className="flex items-center space-x-1.5 text-emerald-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Input security policy validated. No prompt injection patterns detected.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>Adversarial Injection Pattern Detected:</span>
                    </div>
                    <ul className="list-disc pl-4 text-[11px]">
                      {securityCheck.flaggedReasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-rose-700 italic">
                      Notice: System will sanitize and isolate this report within strict data boundaries.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ingest & Verify</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

