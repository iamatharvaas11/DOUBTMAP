import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applyVerificationEvidence } from '@/lib/verification-engine';
import { formatSafeError, IncidentSchema, RawReportSchema } from '@/lib/security';

const ExecuteActionSchema = z.object({
  incident: IncidentSchema,
  simulatedReport: RawReportSchema,
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

