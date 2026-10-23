// Core DOUBTMAP Domain Models & Type System

export type SourceType = 'official' | 'sensor' | 'crowdsource' | 'field_operator' | 'internal_log';

export interface RawReport {
  id: string;
  source: string;
  sourceType: SourceType;
  timestamp: string; // ISO 8601
  content: string;
  reliabilityScore: number; // 0.0 to 1.0 (calibrated by source type)
}

export type ClaimPolarity = 'asserted' | 'denied' | 'uncertain';
export type ClaimStatus = 'supported' | 'conflicted' | 'stale' | 'unverified' | 'resolved';

export interface Claim {
  id: string;
  reportId: string;
  source: string;
  sourceType: SourceType;
  subject: string;       // e.g. "Span 3 Expansion Joint", "API Gateway Ingress"
  property: string;      // e.g. "structural_status", "inundation_depth"
  value: string;         // e.g. "OPEN_SAFE", "CRACKED_HAZARDOUS"
  polarity: ClaimPolarity;
  timestamp: string;     // ISO 8601
  confidence: number;    // Model extraction confidence (0.0 to 1.0)
  status: ClaimStatus;
  corroborationCount: number;
  corroboratingReportIds: string[];
  supersededBy?: string; // If replaced by fresh verification
}

export type ConflictSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ConflictType = 
  | 'direct_contradiction' 
  | 'stale_vs_fresh' 
  | 'uncalibrated_metric' 
  | 'missing_corroboration';

export interface Conflict {
  id: string;
  claimIdA: string;
  claimIdB: string;
  subject: string;
  property: string;
  severity: ConflictSeverity;
  type: ConflictType;
  description: string;
  detectedAt: string;
  status: 'active' | 'resolved';
  resolutionReason?: string;
  resolvedAt?: string;
}

export type VerificationActionType = 
  | 'dispatch_drone' 
  | 'query_telemetry' 
  | 'deploy_field_crew' 
  | 'cross_reference_logs' 
  | 'request_cctv_feed' 
  | 'satellite_check';

export interface ScoringFactors {
  incidentImportance: number; // 0-100 (weight 0.25)
  freshnessGap: number;        // 0-100 (weight 0.20)
  conflictSeverity: number;    // 0-100 (weight 0.25)
  expectedInfoGain: number;    // 0-100 (weight 0.20)
  costDelayFactor: number;     // 0-100 (weight 0.10, inverse of cost/delay)
}

export interface VerificationAction {
  id: string;
  title: string;
  description: string;
  actionType: VerificationActionType;
  targetConflictId?: string;
  priorityScore: number;       // 0-100 deterministic aggregate
  rankingReason: string;
  scoringFactors: ScoringFactors;
  estimatedDelayMinutes: number;
  simulationPayload: {
    simulatedReport: RawReport;
    expectedResolution: string;
    resolvedConflictId?: string;
  };
}

export interface Assessment {
  headline: string;
  overallStatus: 'normal' | 'investigating' | 'hazard_confirmed' | 'false_alarm_cleared';
  confidenceScore: number;     // 0-100
  supportedFacts: string[];
  activeConflicts: string[];
  unresolvedQuestions: string[];
  recommendedNextStep: string;
  lastCalculatedAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: 'system' | 'user' | 'verifier_agent';
  details: string;
  stateDelta: {
    conflictsResolved: number;
    newClaimsAdded: number;
    confidenceShift: number;
  };
}

export interface Incident {
  id: string;
  title: string;
  domain: 'bridge' | 'service' | 'flooding' | 'other';
  description: string;
  status: 'active' | 'investigating' | 'resolved';
  createdAt: string;
  reports: RawReport[];
  claims: Claim[];
  conflicts: Conflict[];
  verificationQueue: VerificationAction[];
  assessment: Assessment;
  auditTrail: AuditEntry[];
}
