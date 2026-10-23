'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Incident, VerificationAction, RawReport } from '@/lib/types';
import { SCENARIO_BRIDGE, SCENARIO_SERVICE, SCENARIO_FLOODING } from '@/lib/scenarios';
import { applyVerificationEvidence, detectConflicts, rankVerificationActions, calculateAssessment } from '@/lib/verification-engine';
import { extractClaimsDeterministically } from '@/lib/gemini';
import { Header } from '@/components/Header';
import { KPIStrip } from '@/components/KPIStrip';
import { EvidenceGraph } from '@/components/EvidenceGraph';
import { VerificationQueue } from '@/components/VerificationQueue';
import { AssessmentPanel } from '@/components/AssessmentPanel';
import { EvidenceTimeline } from '@/components/EvidenceTimeline';
import { AuditTrail } from '@/components/AuditTrail';
import { NewReportModal } from '@/components/NewReportModal';
import { ShieldAlert, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

const getScenarioClone = (domain: 'bridge' | 'service' | 'flooding'): Incident => {
  const template = domain === 'bridge' ? SCENARIO_BRIDGE : domain === 'service' ? SCENARIO_SERVICE : SCENARIO_FLOODING;
  return structuredClone ? structuredClone(template) : JSON.parse(JSON.stringify(template));
};

export default function DoubtMapPage() {
  const [selectedDomain, setSelectedDomain] = useState<'bridge' | 'service' | 'flooding' | 'custom'>('bridge');
  const [incident, setIncident] = useState<Incident>(() => getScenarioClone('bridge'));
  const [isExecuting, setIsExecuting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiActive, setIsAiActive] = useState<boolean>(false);
  const [engineUsed, setEngineUsed] = useState<string>('Deterministic Rules (Auto-Fallback)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Switch scenario
  const handleSelectDomain = useCallback((domain: 'bridge' | 'service' | 'flooding' | 'custom') => {
    setSelectedDomain(domain);
    if (domain !== 'custom') {
      setIncident(getScenarioClone(domain));
    }
    showToast(`Switched scenario to: ${domain.toUpperCase()}`);
  }, [showToast]);

  // Reset current scenario to initial state
  const handleResetScenario = useCallback(() => {
    if (selectedDomain !== 'custom') {
      setIncident(getScenarioClone(selectedDomain));
      showToast(`Reset scenario: ${selectedDomain.toUpperCase()}`);
    }
  }, [selectedDomain, showToast]);

  // Execute verification action through server API with resilient offline fallback
  const handleExecuteAction = useCallback(async (action: VerificationAction) => {
    setIsExecuting(true);
    try {
      let updated: Incident | null = null;

      try {
        const res = await fetch('/api/action/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            incident,
            simulatedReport: action.simulationPayload.simulatedReport,
            expectedResolution: action.simulationPayload.expectedResolution,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.updatedIncident) {
            updated = data.updatedIncident;
          }
        }
      } catch {
        // Fallback to client-side engine if server unreachable
      }

      if (!updated) {
        const res = applyVerificationEvidence(
          incident,
          action.simulationPayload.simulatedReport,
          action.simulationPayload.expectedResolution
        );
        updated = res.updatedIncident;
      }

      setIncident(updated);
      showToast(`Verification completed: ${action.title} executed.`);
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setIsExecuting(false);
    }
  }, [incident, showToast]);

  // Ingest new evidence through server verification pipeline with live latency measurement
  const handleAddReport = useCallback(async (report: RawReport) => {
    try {
      let extractedClaims = null;
      let latency = 0;

      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            report,
            existingClaims: incident.claims,
            existingReports: incident.reports,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          extractedClaims = data.extractedClaims;
          latency = data.extractionMetadata?.latencyMs ?? 0;
          setIsAiActive(!data.extractionMetadata?.isFallback);
          setEngineUsed(data.extractionMetadata?.engine ?? 'gemini-1.5-flash');
        }
      } catch {
        // Fallback gracefully
      }

      if (!extractedClaims) {
        const fallback = extractClaimsDeterministically(report);
        extractedClaims = fallback.claims;
        latency = fallback.latencyMs;
        setIsAiActive(false);
        setEngineUsed('deterministic-fallback');
      }

      setIncident(prev => {
        const newClaims = [...prev.claims, ...extractedClaims];
        const newReports = [...prev.reports, report];
        const updatedConflicts = detectConflicts(newClaims, report.timestamp);
        const updatedAssessment = calculateAssessment(newClaims, updatedConflicts, newReports);
        const updatedQueue = rankVerificationActions(prev.verificationQueue, updatedConflicts);

        const auditEntry = {
          id: `audit-add-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'EXTERNAL_EVIDENCE_INGESTED',
          actor: 'user' as const,
          details: `User submitted report from ${report.source} [${report.sourceType}]. Processed in ${latency}ms. Extracted ${extractedClaims.length} claim(s). Active conflicts: ${updatedConflicts.filter(c => c.status === 'active').length}.`,
          stateDelta: {
            conflictsResolved: 0,
            newClaimsAdded: extractedClaims.length,
            confidenceShift: updatedAssessment.confidenceScore - prev.assessment.confidenceScore,
            executionLatencyMs: latency,
          },
        };

        return {
          ...prev,
          reports: newReports,
          claims: newClaims,
          conflicts: updatedConflicts,
          assessment: updatedAssessment,
          verificationQueue: updatedQueue,
          auditTrail: [auditEntry, ...prev.auditTrail],
        };
      });

      showToast(`Evidence from "${report.source}" processed in ${latency}ms.`);
    } catch (err) {
      console.error('Add report error:', err);
    }
  }, [incident.claims, incident.reports, showToast]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <Header
        selectedDomain={selectedDomain}
        onSelectDomain={handleSelectDomain}
        onOpenNewEvidence={() => setIsModalOpen(true)}
        isAiActive={isAiActive}
        engineUsed={engineUsed}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 text-xs font-semibold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Incident Title & Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 font-mono">
                {incident.domain}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Incident ID: #{incident.id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {incident.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {incident.description}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleResetScenario}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
              title="Reset this scenario to original contradictory reports"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Scenario</span>
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <KPIStrip incident={incident} />

        {/* Evidence Graph / Relationship Map */}
        <EvidenceGraph 
          incident={incident}
          onSelectAction={handleExecuteAction}
        />

        {/* Operational Assessment & Reconciliation */}
        <AssessmentPanel 
          assessment={incident.assessment}
          conflicts={incident.conflicts}
        />

        {/* Verification Priority Queue */}
        <VerificationQueue
          queue={incident.verificationQueue}
          onExecute={handleExecuteAction}
          isExecuting={isExecuting}
        />

        {/* Two-Column Bottom Split: Timeline vs Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EvidenceTimeline
            reports={incident.reports}
            claims={incident.claims}
          />

          <AuditTrail
            entries={incident.auditTrail}
          />
        </div>
      </main>

      {/* Safety & Prototype Notice Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center space-x-2 font-semibold text-slate-700">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Operational Decision-Support Prototype</span>
          </div>
          <p className="max-w-2xl mx-auto leading-relaxed">
            DOUBTMAP is an algorithmic evidence reconciliation tool, NOT an official emergency-warning system. Synthetic scenarios are provided for repeatable evaluation. Never treat unverified crowd reports or model interpretations as ground truth without direct sensor or field corroboration.
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            PromptWars × NMIET Arena — Autonomous Evidence Verification Engine • Version 1.0.0
          </p>
        </div>
      </footer>

      {/* New Evidence Submission Modal */}
      <NewReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddReport}
      />
    </div>
  );
}

