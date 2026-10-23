// Security & Input Sanitization Layer for DOUBTMAP
import { z } from 'zod';

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s+prompt/i,
  /disregard\s+(the\s+)?guidelines/i,
  /you\s+are\s+now\s+(an?\s+)?unrestricted/i,
  /bypass\s+(safety|filter|rules)/i,
  /exfiltrate/i,
  /dump\s+(all\s+)?memory/i,
  /reveal\s+your\s+hidden\s+prompt/i,
  /override\s+policy/i,
  /dan\s+mode/i,
];

export interface SecurityCheckResult {
  isSafe: boolean;
  sanitized: string;
  flaggedReasons: string[];
}

export function sanitizeAndCheckInput(rawText: string, maxLength: number = 2000): SecurityCheckResult {
  const flaggedReasons: string[] = [];

  if (typeof rawText !== 'string') {
    return { isSafe: false, sanitized: '', flaggedReasons: ['Input is not a string'] };
  }

  // Length constraint enforcement
  let text = rawText.trim();
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
    flaggedReasons.push(`Input truncated to ${maxLength} characters`);
  }

  // Strip null bytes and dangerous control characters
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');

  // Strip embedded script/HTML tags
  text = text.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '[REMOVED_SCRIPT]');
  text = text.replace(/<[^>]+>/g, '');

  // Prompt injection heuristic scanning
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      flaggedReasons.push(`Potential adversarial prompt injection detected: ${pattern.toString()}`);
    }
  }

  const isSafe = flaggedReasons.filter(r => r.includes('injection')).length === 0;

  return {
    isSafe,
    sanitized: text,
    flaggedReasons,
  };
}

// Zod schemas for AI model output validation and API runtime safety
export const SourceTypeSchema = z.enum(['official', 'sensor', 'crowdsource', 'field_operator', 'internal_log']);

export const RawReportSchema = z.object({
  id: z.string(),
  source: z.string().min(1).max(200),
  sourceType: SourceTypeSchema,
  timestamp: z.string(),
  content: z.string().min(1).max(3000),
  reliabilityScore: z.number().min(0).max(1),
});

export const ClaimSchema = z.object({
  id: z.string(),
  reportId: z.string(),
  source: z.string(),
  sourceType: SourceTypeSchema,
  subject: z.string(),
  property: z.string(),
  value: z.string(),
  polarity: z.enum(['asserted', 'denied', 'uncertain']),
  timestamp: z.string(),
  confidence: z.number().min(0).max(1),
  status: z.enum(['supported', 'conflicted', 'stale', 'unverified', 'resolved']),
  corroborationCount: z.number(),
  corroboratingReportIds: z.array(z.string()),
  supersededBy: z.string().optional(),
});

export const ConflictSchema = z.object({
  id: z.string(),
  claimIdA: z.string(),
  claimIdB: z.string(),
  subject: z.string(),
  property: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  type: z.enum(['direct_contradiction', 'stale_vs_fresh', 'uncalibrated_metric', 'missing_corroboration']),
  description: z.string(),
  detectedAt: z.string(),
  status: z.enum(['active', 'resolved']),
  resolutionReason: z.string().optional(),
  resolvedAt: z.string().optional(),
});

export const ScoringFactorsSchema = z.object({
  incidentImportance: z.number(),
  freshnessGap: z.number(),
  conflictSeverity: z.number(),
  expectedInfoGain: z.number(),
  costDelayFactor: z.number(),
});

export const VerificationActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  actionType: z.enum(['dispatch_drone', 'query_telemetry', 'deploy_field_crew', 'cross_reference_logs', 'request_cctv_feed', 'satellite_check']),
  targetConflictId: z.string().optional(),
  priorityScore: z.number(),
  rankingReason: z.string(),
  scoringFactors: ScoringFactorsSchema,
  estimatedDelayMinutes: z.number(),
  simulationPayload: z.object({
    simulatedReport: RawReportSchema,
    expectedResolution: z.string(),
    resolvedConflictId: z.string().optional(),
  }),
});

export const AssessmentSchema = z.object({
  headline: z.string(),
  overallStatus: z.enum(['normal', 'investigating', 'hazard_confirmed', 'false_alarm_cleared']),
  confidenceScore: z.number().min(0).max(100),
  supportedFacts: z.array(z.string()),
  activeConflicts: z.array(z.string()),
  unresolvedQuestions: z.array(z.string()),
  recommendedNextStep: z.string(),
  lastCalculatedAt: z.string(),
});

export const AuditEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  action: z.string(),
  actor: z.enum(['system', 'user', 'verifier_agent']),
  details: z.string(),
  stateDelta: z.object({
    conflictsResolved: z.number(),
    newClaimsAdded: z.number(),
    confidenceShift: z.number(),
  }),
});

export const IncidentSchema = z.object({
  id: z.string(),
  title: z.string(),
  domain: z.enum(['bridge', 'service', 'flooding', 'other']),
  description: z.string(),
  status: z.enum(['active', 'investigating', 'resolved']),
  createdAt: z.string(),
  reports: z.array(RawReportSchema),
  claims: z.array(ClaimSchema),
  conflicts: z.array(ConflictSchema),
  verificationQueue: z.array(VerificationActionSchema),
  assessment: AssessmentSchema,
  auditTrail: z.array(AuditEntrySchema),
});

export const ExtractedClaimSchema = z.object({
  subject: z.string().min(1).max(200),
  property: z.string().min(1).max(100),
  value: z.string().min(1).max(200),
  polarity: z.enum(['asserted', 'denied', 'uncertain']),
  confidence: z.number().min(0).max(1),
  sourceClaimText: z.string().optional(),
});

export const ModelExtractionResponseSchema = z.object({
  claims: z.array(ExtractedClaimSchema).min(1).max(10),
  summary: z.string().max(500),
  detectedAnomalies: z.array(z.string()).default([]),
});

export type ModelExtractionResponse = z.infer<typeof ModelExtractionResponseSchema>;

// Safe Error Formatter to prevent leaking environment variables or paths
export function formatSafeError(error: unknown): { error: string; code: string } {
  if (error instanceof z.ZodError) {
    return {
      error: 'Schema validation failed on verification payload',
      code: 'INVALID_PAYLOAD_SCHEMA',
    };
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('api_key') || msg.includes('401') || msg.includes('unauthorized')) {
      return {
        error: 'AI verification service authentication error. Using deterministic fallback.',
        code: 'AI_AUTH_ERROR',
      };
    }
    if (msg.includes('rate') || msg.includes('429')) {
      return {
        error: 'Upstream rate limit reached. Switched to deterministic rules engine.',
        code: 'RATE_LIMITED',
      };
    }
    if (msg.includes('injection')) {
      return {
        error: 'Security policy violation: Suspicious adversarial instructions detected.',
        code: 'INJECTION_DETECTED',
      };
    }
  }

  return {
    error: 'An internal verification processing exception occurred safely.',
    code: 'PROCESSING_ERROR',
  };
}

