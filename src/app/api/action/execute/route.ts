import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Incident, RawReport } from '@/lib/types';
import { applyVerificationEvidence } from '@/lib/verification-engine';
import { formatSafeError } from '@/lib/security';

const ExecuteActionSchema = z.object({
  incident: z.any(),
  simulatedReport: z.object({
    id: z.string(),
    source: z.string(),
    sourceType: z.enum(['official', 'sensor', 'crowdsource', 'field_operator', 'internal_log']),
    timestamp: z.string(),
    content: z.string(),
    reliabilityScore: z.number(),
  }),
  expectedResolution: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ExecuteActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid verification execution payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { incident, simulatedReport, expectedResolution } = parsed.data;

    const { updatedIncident, auditEntry } = applyVerificationEvidence(
      incident as Incident,
      simulatedReport as RawReport,
      expectedResolution
    );

    return NextResponse.json({
      success: true,
      updatedIncident,
      auditEntry,
    });
  } catch (error) {
    const safeErr = formatSafeError(error);
    return NextResponse.json(safeErr, { status: 500 });
  }
}

