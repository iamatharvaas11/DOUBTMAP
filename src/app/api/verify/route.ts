import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RawReport } from '@/lib/types';
import { extractClaimsWithAI } from '@/lib/gemini';
import { detectConflicts, rankVerificationActions, calculateAssessment } from '@/lib/verification-engine';
import { sanitizeAndCheckInput, formatSafeError } from '@/lib/security';

const VerifyRequestSchema = z.object({
  report: z.object({
    id: z.string().optional(),
    source: z.string().min(1).max(200),
    sourceType: z.enum(['official', 'sensor', 'crowdsource', 'field_operator', 'internal_log']),
    timestamp: z.string(),
    content: z.string().min(1).max(3000),
    reliabilityScore: z.number().min(0).max(1).optional(),
  }),
  existingClaims: z.array(z.any()).default([]),
  existingReports: z.array(z.any()).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid verification request payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { report: rawReportData, existingClaims, existingReports } = parsed.data;

    // Sanitize
    const security = sanitizeAndCheckInput(rawReportData.content, 2500);

    const report: RawReport = {
      id: rawReportData.id || `rep-${Date.now()}`,
      source: rawReportData.source,
      sourceType: rawReportData.sourceType,
      timestamp: rawReportData.timestamp,
      content: security.sanitized,
      reliabilityScore: rawReportData.reliabilityScore ?? 
        (rawReportData.sourceType === 'official' ? 0.90 :
         rawReportData.sourceType === 'sensor' ? 0.88 :
         rawReportData.sourceType === 'field_operator' ? 0.85 :
         rawReportData.sourceType === 'internal_log' ? 0.82 : 0.50),
    };

    // Extract claims (Gemini AI with fallback)
    const extractionResult = await extractClaimsWithAI(report);

    const updatedClaims = [...existingClaims, ...extractionResult.claims];
    const updatedReports = [...existingReports, report];

    // Conflict detection
    const conflicts = detectConflicts(updatedClaims, report.timestamp);

    // Assessment
    const assessment = calculateAssessment(updatedClaims, conflicts, updatedReports);

    return NextResponse.json({
      success: true,
      report,
      extractedClaims: extractionResult.claims,
      conflicts,
      assessment,
      extractionMetadata: {
        engine: extractionResult.engineUsed,
        isFallback: extractionResult.isFallback,
        latencyMs: extractionResult.latencyMs,
        anomalies: extractionResult.anomaliesDetected,
      },
    });
  } catch (error) {
    const safeErr = formatSafeError(error);
    return NextResponse.json(safeErr, { status: 500 });
  }
}

