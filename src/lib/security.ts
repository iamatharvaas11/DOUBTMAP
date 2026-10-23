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

// Zod schemas for AI model output validation
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
