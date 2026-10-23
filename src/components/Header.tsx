'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, Layers, PlusCircle, Activity } from 'lucide-react';

interface HeaderProps {
  selectedDomain: 'bridge' | 'service' | 'flooding' | 'custom';
  onSelectDomain: (domain: 'bridge' | 'service' | 'flooding' | 'custom') => void;
  onOpenNewEvidence: () => void;
  isAiActive: boolean;
  engineUsed: string;
}

export function Header({
  selectedDomain,
  onSelectDomain,
  onOpenNewEvidence,
  isAiActive,
  engineUsed,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black tracking-wider shadow-md">
              <span className="text-xl">DM</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">DOUBTMAP</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Decision Support Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Autonomous Evidence Verification & Contradiction Resolution
              </p>
            </div>
          </div>

          {/* Scenario Selector */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200" role="tablist" aria-label="Incident Scenarios">
            <button
              onClick={() => onSelectDomain('bridge')}
              role="tab"
              aria-selected={selectedDomain === 'bridge'}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedDomain === 'bridge'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Bridge Structural
            </button>
            <button
              onClick={() => onSelectDomain('service')}
              role="tab"
              aria-selected={selectedDomain === 'service'}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedDomain === 'service'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Service Outage
            </button>
            <button
              onClick={() => onSelectDomain('flooding')}
              role="tab"
              aria-selected={selectedDomain === 'flooding'}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedDomain === 'flooding'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Road Flooding
            </button>
          </div>

          {/* System status & Action */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs border border-slate-200 rounded-md px-2.5 py-1 bg-slate-50" title={`Model extraction: ${engineUsed}`}>
              <div className={`w-2 h-2 rounded-full ${isAiActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-medium text-slate-700">
                {isAiActive ? 'Gemini 1.5 Flash' : 'Deterministic Rules'}
              </span>
            </div>

            <button
              onClick={onOpenNewEvidence}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Add new report evidence"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Evidence</span>
            </button>
          </div>
        </div>

        {/* Mobile Scenario Selector */}
        <div className="flex md:hidden py-2 space-x-1 overflow-x-auto border-t border-slate-100">
          <button
            onClick={() => onSelectDomain('bridge')}
            className={`px-2.5 py-1 text-xs font-medium rounded ${
              selectedDomain === 'bridge' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Bridge Incident
          </button>
          <button
            onClick={() => onSelectDomain('service')}
            className={`px-2.5 py-1 text-xs font-medium rounded ${
              selectedDomain === 'service' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Service Outage
          </button>
          <button
            onClick={() => onSelectDomain('flooding')}
            className={`px-2.5 py-1 text-xs font-medium rounded ${
              selectedDomain === 'flooding' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Flooding
          </button>
        </div>
      </div>
    </header>
  );
}

