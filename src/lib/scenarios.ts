// Seeded Demonstration Scenarios for DOUBTMAP
import { Incident } from './types';
import { detectConflicts, rankVerificationActions, calculateAssessment } from './verification-engine';

export const SCENARIO_BRIDGE: Incident = (() => {
  const reports = [
    {
      id: 'rep-br-01',
      source: 'State Dept of Transportation (Official Bulletin)',
      sourceType: 'official' as const,
      timestamp: '2026-10-23T08:00:00Z',
      content: 'Routine morning bridge scan completed. All Riverstone Bridge spans are operating within normal structural tolerances. Speed limit 45 mph. Status: OPEN_SAFE.',
      reliabilityScore: 0.90,
    },
    {
      id: 'rep-br-02',
      source: 'Commuter Mobile Report (@LiveCity Transit Alert)',
      sourceType: 'crowdsource' as const,
      timestamp: '2026-10-23T10:15:00Z',
      content: 'Major lateral fracture visible across Span 3 expansion joint! Severe chassis shaking when commercial trucks pass. Police cruiser on site cone-blocking right lane.',
      reliabilityScore: 0.50,
    },
    {
      id: 'rep-br-03',
      source: 'Emergency 911 Dispatch CAD Log #882',
      sourceType: 'internal_log' as const,
      timestamp: '2026-10-23T10:30:00Z',
      content: 'Multiple 911 callers and City Bus Driver #402 report structural snapping sound and vertical pavement heave at Span 3 expansion joint.',
      reliabilityScore: 0.82,
    },
    {
      id: 'rep-br-04',
      source: 'Quarterly Maintenance Archive (Stale)',
      sourceType: 'official' as const,
      timestamp: '2026-10-22T16:00:00Z',
      content: 'Span 3 elastomeric bearing pads inspected yesterday; scheduled for routine seal replacement next quarter. No structural hazard found.',
      reliabilityScore: 0.70,
    },
  ];

  const claims = [
    {
      id: 'cl-br-01',
      reportId: 'rep-br-01',
      source: 'State Dept of Transportation',
      sourceType: 'official' as const,
      subject: 'Span 3 Expansion Joint',
      property: 'structural_status',
      value: 'OPEN_SAFE (Normal tolerances)',
      polarity: 'asserted' as const,
      timestamp: '2026-10-23T08:00:00Z',
      confidence: 0.92,
      status: 'conflicted' as const,
      corroborationCount: 1,
      corroboratingReportIds: ['rep-br-01', 'rep-br-04'],
    },
    {
      id: 'cl-br-02',
      reportId: 'rep-br-02',
      source: 'Commuter Mobile Report',
      sourceType: 'crowdsource' as const,
      subject: 'Span 3 Expansion Joint',
      property: 'structural_status',
      value: 'CRACKED_HAZARDOUS (Major lateral fracture)',
      polarity: 'asserted' as const,
      timestamp: '2026-10-23T10:15:00Z',
      confidence: 0.86,
      status: 'conflicted' as const,
      corroborationCount: 1,
      corroboratingReportIds: ['rep-br-02', 'rep-br-03'],
    },
    {
      id: 'cl-br-03',
      reportId: 'rep-br-03',
      source: 'Emergency Dispatch Log',
      sourceType: 'internal_log' as const,
      subject: 'Span 3 Expansion Joint',
      property: 'pavement_condition',
      value: 'HEAVING_AND_VIBRATING',
      polarity: 'asserted' as const,
      timestamp: '2026-10-23T10:30:00Z',
      confidence: 0.88,
      status: 'unverified' as const,
      corroborationCount: 1,
      corroboratingReportIds: ['rep-br-03'],
    },
  ];

  const conflicts = detectConflicts(claims, '2026-10-23T10:35:00Z');

  const rawActions = [
    {
      id: 'act-br-01',
      title: 'Dispatch High-Resolution Photogrammetry Drone',
      description: 'Deploy Autonomous Inspection UAV to photograph Span 3 load-bearing girder gussets and measure joint gap width.',
      actionType: 'dispatch_drone' as const,
      targetConflictId: conflicts[0]?.id,
      priorityScore: 0,
      rankingReason: '',
      estimatedDelayMinutes: 4,
      scoringFactors: {
        incidentImportance: 95,
        freshnessGap: 85,
        conflictSeverity: 95,
        expectedInfoGain: 95,
        costDelayFactor: 85,
      },
      simulationPayload: {
        simulatedReport: {
          id: 'rep-br-sim-01',
          source: 'Field Inspection Drone #09 (High-Res Photogrammetry)',
          sourceType: 'sensor' as const,
          timestamp: '2026-10-23T10:36:00Z',
          content: 'CONFIRMED: 14mm shear displacement and load-bearing fracture at Span 3 expansion joint. Crack extends through lower flange gusset plate. Immediate closure required.',
          reliabilityScore: 0.98,
        },
        expectedResolution: 'Direct verification confirmed 14mm structural fracture. DOT 08:00 bulletin invalidated as stale.',
        resolvedConflictId: conflicts[0]?.id,
      },
    },
    {
      id: 'act-br-02',
      title: 'Poll Piezoelectric Strain Gauge Telemetry (Sensor B-03)',
      description: 'Query remote strain gauge logs installed beneath Span 3 deck for peak micro-strain readings.',
      actionType: 'query_telemetry' as const,
      targetConflictId: conflicts[0]?.id,
      priorityScore: 0,
      rankingReason: '',
      estimatedDelayMinutes: 1,
      scoringFactors: {
        incidentImportance: 90,
        freshnessGap: 75,
        conflictSeverity: 90,
        expectedInfoGain: 85,
        costDelayFactor: 95,
      },
      simulationPayload: {
        simulatedReport: {
          id: 'rep-br-sim-02',
          source: 'Bridge Strain Sensor B-03 (Telemetry Stream)',
          sourceType: 'sensor' as const,
          timestamp: '2026-10-23T10:37:00Z',
          content: 'Telemetry: Peak microstrain exceeded 2800με (critical yield limit). Continuous cyclic vibration spike recorded since 10:12 AM.',
          reliabilityScore: 0.95,
        },
        expectedResolution: 'Strain telemetry confirms structural yield limit exceeded.',
        resolvedConflictId: conflicts[0]?.id,
      },
    },
    {
      id: 'act-br-03',
      title: 'Deploy State Police Ground Inspection Cruiser',
      description: 'Officer on-scene visual inspection and manual traffic redirection.',
      actionType: 'deploy_field_crew' as const,
      targetConflictId: conflicts[0]?.id,
      priorityScore: 0,
      rankingReason: '',
      estimatedDelayMinutes: 15,
      scoringFactors: {
        incidentImportance: 85,
        freshnessGap: 60,
        conflictSeverity: 80,
        expectedInfoGain: 70,
        costDelayFactor: 40,
      },
      simulationPayload: {
        simulatedReport: {
          id: 'rep-br-sim-03',
          source: 'State Trooper Unit 44 (Field Radio)',
          sourceType: 'field_operator' as const,
          timestamp: '2026-10-23T10:45:00Z',
          content: 'Trooper on site: Visual displacement confirmed. All northbound lanes closed. Traffic diverted to Exit 12.',
          reliabilityScore: 0.92,
        },
        expectedResolution: 'Field crew confirmed visual displacement and enacted total bridge closure.',
        resolvedConflictId: conflicts[0]?.id,
      },
    },
  ];

  const verificationQueue = rankVerificationActions(rawActions, conflicts, 95);
  const assessment = calculateAssessment(claims, conflicts, reports);

  return {
    id: 'inc-bridge-001',
    title: 'Riverstone Suspension Bridge Structural Contradiction',
    domain: 'bridge' as const,
    description: 'Official morning DOT inspection declaring bridge safe contradicts fresh eyewitness and 911 dispatch reports of major lateral fracture on Span 3.',
    status: 'investigating' as const,
    createdAt: '2026-10-23T10:30:00Z',
    reports,
    claims,
    conflicts,
    verificationQueue,
    assessment,
    auditTrail: [
      {
        id: 'aud-br-init',
        timestamp: '2026-10-23T10:31:00Z',
        action: 'INITIAL_EVIDENCE_INGESTED',
        actor: 'system' as const,
        details: 'Ingested 4 initial reports. Detected critical direct contradiction between DOT official report (08:00) and crowdsourced fracture claims (10:15). Ranked 3 candidate verifications.',
        stateDelta: {
          conflictsResolved: 0,
          newClaimsAdded: 3,
          confidenceShift: 0,
        },
      },
    ],
  };
})();

export const SCENARIO_SERVICE: Incident = (() => {
  const reports = [
    {
      id: 'rep-srv-01',
      source: 'SRE Monitoring Bot (@Datadog)',
      sourceType: 'sensor' as const,
      timestamp: '2026-10-23T11:00:00Z',
      content: 'CRITICAL ALERT: Auth-Service latency p99 > 8500ms. Token verification failure rate 74%. Suspected Postgres auth_users lock deadlock.',
      reliabilityScore: 0.88,
    },
    {
      id: 'rep-srv-02',
      source: 'Edge Gateway Healthcheck (Envoy Ingress)',
      sourceType: 'internal_log' as const,
      timestamp: '2026-10-23T11:05:00Z',
      content: 'Envoy regional ingress returning HTTP 504 across all client routes. Gateway CPU pegged at 100% due to TLS renegotiation storm and rate-limiter buffer overflow.',
      reliabilityScore: 0.85,
    },
    {
      id: 'rep-srv-03',
      source: 'Payments Team Lead Slack Alert',
      sourceType: 'crowdsource' as const,
      timestamp: '2026-10-23T11:10:00Z',
      content: 'Checkout API down because payment service connection pool exhausted; blaming payment processor upstream gateway.',
      reliabilityScore: 0.60,
    },
    {
      id: 'rep-srv-04',
      source: 'Infrastructure Change Log (10:00 AM)',
      sourceType: 'official' as const,
      timestamp: '2026-10-23T10:00:00Z',
      content: 'Config patch v4.12.0 deployed to regional Envoy ingress. Scheduled canary rolled to 100% at 10:55 AM.',
      reliabilityScore: 0.80,
    },
  ];

  const claims = [
    {
      id: 'cl-srv-01',
      reportId: 'rep-srv-01',
      source: 'SRE Monitoring Bot',
      sourceType: 'sensor' as const,
      subject: 'Outage Root Cause',
      property: 'failing_component',
      value: 'auth_service (Postgres DB deadlock)',
      polarity: 'asserted' as const,
      timestamp: '2026-10-23T11:00:00Z',
      confidence: 0.85,
      status: 'conflicted' as const,
      corroborationCount: 1,
      corroboratingReportIds: ['rep-srv-01'],
    },
    {
      id: 'cl-srv-02',
      reportId: 'rep-srv-02',
      source: 'Edge Gateway Healthcheck',
      sourceType: 'internal_log' as const,
      subject: 'Outage Root Cause',
      property: 'failing_component',
      value: 'api_gateway (Envoy TLS buffer overflow)',
      polarity: 'asserted' as const,
      timestamp: '2026-10-23T11:05:00Z',
      confidence: 0.89,
      status: 'conflicted' as const,
      corroborationCount: 1,
      corroboratingReportIds: ['rep-srv-02', 'rep-srv-04'],
    },
  ];

  const conflicts = detectConflicts(claims, '2026-10-23T11:12:00Z');

  const rawActions = [
    {
      id: 'act-srv-01',
      title: 'Analyze Distributed Traces (Jaeger Waterfall Trace for /checkout)',
      description: 'Query trace spans across Edge Gateway, Auth, and Payments to identify which service originated the timeout cascade.',
      actionType: 'cross_reference_logs' as const,
      targetConflictId: conflicts[0]?.id,
      priorityScore: 0,
      rankingReason: '',
      estimatedDelayMinutes: 2,
      scoringFactors: {
        incidentImportance: 90,
        freshnessGap: 90,
        conflictSeverity: 85,
        expectedInfoGain: 95,
        costDelayFactor: 90,
      },
      simulationPayload: {
        simulatedReport: {
          id: 'rep-srv-sim-01',
          source: 'Jaeger Distributed Tracing Engine',
          sourceType: 'sensor' as const,
          timestamp: '2026-10-23T11:13:00Z',
          content: 'Trace Span Analysis: Auth latency was an artifact of client timeouts. Root cause is Edge Envoy TLS buffer saturation caused by rate-limiter config patch v4.12.0 rolled out at 10:55 AM.',
          reliabilityScore: 0.99,
        },
        expectedResolution: 'Distributed trace reveals Envoy buffer saturation as true root cause; Auth deadlock ruled out as symptom.',
        resolvedConflictId: conflicts[0]?.id,
      },
    },
    {
      id: 'act-srv-02',
      title: 'Query Postgres pg_stat_activity Lock Table',
      description: 'Check active database locks and query queue on Auth DB.',
      actionType: 'query_telemetry' as const,
      targetConflictId: conflicts[0]?.id,
      priorityScore: 0,
      rankingReason: '',
      estimatedDelayMinutes: 3,
      scoringFactors: {
        incidentImportance: 80,
        freshnessGap: 70,
        conflictSeverity: 75,
        expectedInfoGain: 75,
        costDelayFactor: 85,
      },
      simulationPayload: {
        simulatedReport: {
          id: 'rep-srv-sim-02',
          source: 'Postgres pg_stat_activity Telemetry',
          sourceType: 'internal_log' as const,
          timestamp: '2026-10-23T11:14:00Z',
          content: 'DB locks: Zero deadlocks detected. Active query count 12 (normal). Auth DB is idling.',
          reliabilityScore: 0.94,
        },
        expectedResolution: 'Auth DB confirmed healthy with 0 deadlocks.',
        resolvedConflictId: conflicts[0]?.id,
      },
    },
  ];

  const verificationQueue = rankVerificationActions(rawActions, conflicts, 85);
  const assessment = calculateAssessment(claims, conflicts, reports);

  return {
    id: 'inc-service-002',
    title: 'MetroGrid Regional Outage & Component Blame Contradiction',
    domain: 'service' as const,
    description: 'SRE monitoring reports Auth DB deadlock while Edge Gateway logs indicate TLS buffer saturation and Payments suspects vendor outage.',
    status: 'investigating' as const,
    createdAt: '2026-10-23T11:10:00Z',
    reports,
    claims,
    conflicts,
    verificationQueue,
    assessment,
    auditTrail: [
      {
        id: 'aud-srv-init',
        timestamp: '2026-10-23T11:11:00Z',
        action: 'INITIAL_EVIDENCE_INGESTED',
        actor: 'system' as const,
        details: 'Ingested 4 telemetry and report sources. Discovered root-cause contradiction between Auth DB deadlock and Envoy Ingress buffer saturation.',
        stateDelta: {
          conflictsResolved: 0,
          newClaimsAdded: 2,
          confidenceShift: 0,
        },
      },
    ],
  };
})();

export const SCENARIO_FLOODING: Incident = (() => {
  const reports = [
    {
      id: 'rep-fld-01',
      source: 'City Traffic Radio Broadcast (07:15 AM)',
      sourceType: 'official' as const,
      timestamp: '2026-10-23T07:15:00Z',
      content: 'Valley Expressway clear and running smoothly. Light morning drizzle; all underpasses open.',
      reliabilityScore: 0.85,
    },
    {
      id: 'rep-fld-02',
      source: 'Ultrasonic Stormwater Depth Sensor U-12',
      sourceType: 'sensor' as const,
      timestamp: '2026-10-23T08:45:00Z',
      content: 'Telemetry reading: Water depth 4.2 inches at 4th Street Underpass. Alert threshold: 6 inches. Status: PASSABLE.',
      reliabilityScore: 0.92,
    },
    {
      id: 'rep-fld-03',
      source: 'Viral Social Media Post (@ValleyCommuter on X)',
      sourceType: 'crowdsource' as const,
      timestamp: '2026-10-23T09:10:00Z',
      content: 'EMERGENCY: 4th Street Underpass is completely submerged in 3 feet of water! Two sedans floating! AVOID VALLEY EXPRESSWAY!',
      reliabilityScore: 0.40,
    },
    {
      id: 'rep-fld-04',
      source: 'Municipal Transit Van Fleet Telemetry',
      sourceType: 'internal_log' as const,
      timestamp: '2026-10-23T09:15:00Z',
      content: 'Transit Vans #104, #109, and #112 passed 4th Street underpass at 09:12 AM with 0 stoppage; wheel-well splash normal, vehicle speeds 24 mph.',
      reliabilityScore: 0.88,
    },
  ];

  const claims = [
    {
      id: 'cl-fld-01',
      reportId: 'rep-fld-02',
      source: 'Ultrasonic Depth Sensor U-12',
      sourceType: 'sensor' as const,
      subject: '4th St Underpass',
      property: 'inundation_depth',
      value: '4.2 inches (Passable)',
      polarity: 'asserted' as const,
      timestamp: '2026-10-23T08:45:00Z',
      confidence: 0.95,
      status: 'conflicted' as const,
      corroborationCount: 1,
      corroboratingReportIds: ['rep-fld-02', 'rep-fld-04'],
    },
    {
      id: 'cl-fld-02',
      reportId: 'rep-fld-03',
      source: 'Viral Social Media Post',
      sourceType: 'crowdsource' as const,
      subject: '4th St Underpass',
      property: 'inundation_depth',
      value: '36 inches (3 feet, submerged sedans)',
      polarity: 'asserted' as const,
      timestamp: '2026-10-23T09:10:00Z',
      confidence: 0.70,
      status: 'conflicted' as const,
      corroborationCount: 0,
      corroboratingReportIds: ['rep-fld-03'],
    },
  ];

  const conflicts = detectConflicts(claims, '2026-10-23T09:20:00Z');

  const rawActions = [
    {
      id: 'act-fld-01',
      title: 'Poll Municipal Traffic CCTV Cam-402 (High-Res Still)',
      description: 'Capture optical CCTV still of 4th St Underpass pavement and lane markers.',
      actionType: 'request_cctv_feed' as const,
      targetConflictId: conflicts[0]?.id,
      priorityScore: 0,
      rankingReason: '',
      estimatedDelayMinutes: 1,
      scoringFactors: {
        incidentImportance: 85,
        freshnessGap: 80,
        conflictSeverity: 90,
        expectedInfoGain: 95,
        costDelayFactor: 95,
      },
      simulationPayload: {
        simulatedReport: {
          id: 'rep-fld-sim-01',
          source: 'Traffic CCTV Cam-402 (Optical Feed)',
          sourceType: 'sensor' as const,
          timestamp: '2026-10-23T09:21:00Z',
          content: 'CCTV Verified: Water depth approximately 4.5 inches confined to right curb gutter. Center and left lanes are fully dry and traffic is flowing smoothly. Social post was sensationalized.',
          reliabilityScore: 0.98,
        },
        expectedResolution: 'Visual CCTV confirmed only 4.5 inches in gutter; debunked viral claim of 3ft submerged cars.',
        resolvedConflictId: conflicts[0]?.id,
      },
    },
    {
      id: 'act-fld-02',
      title: 'Dispatch Highway Patrol Unit #12',
      description: 'Physical roadside inspection by municipal road crew.',
      actionType: 'deploy_field_crew' as const,
      targetConflictId: conflicts[0]?.id,
      priorityScore: 0,
      rankingReason: '',
      estimatedDelayMinutes: 12,
      scoringFactors: {
        incidentImportance: 75,
        freshnessGap: 70,
        conflictSeverity: 80,
        expectedInfoGain: 80,
        costDelayFactor: 50,
      },
      simulationPayload: {
        simulatedReport: {
          id: 'rep-fld-sim-02',
          source: 'Patrol Unit #12 On-Scene Radio',
          sourceType: 'field_operator' as const,
          timestamp: '2026-10-23T09:30:00Z',
          content: 'Patrol on scene: Gutter drain partially blocked by leaves. Drain cleared with rake; water receding. Road safe.',
          reliabilityScore: 0.90,
        },
        expectedResolution: 'Patrol cleared drain and verified traffic flow safe.',
        resolvedConflictId: conflicts[0]?.id,
      },
    },
  ];

  const verificationQueue = rankVerificationActions(rawActions, conflicts, 80);
  const assessment = calculateAssessment(claims, conflicts, reports);

  return {
    id: 'inc-flooding-003',
    title: 'Valley Expressway Underpass Flash Flooding Discrepancy',
    domain: 'flooding' as const,
    description: 'Viral social media reports claim underpass is 3 feet underwater with submerged vehicles, contradicting ultrasonic depth sensors and commercial fleet telemetry.',
    status: 'investigating' as const,
    createdAt: '2026-10-23T09:18:00Z',
    reports,
    claims,
    conflicts,
    verificationQueue,
    assessment,
    auditTrail: [
      {
        id: 'aud-fld-init',
        timestamp: '2026-10-23T09:19:00Z',
        action: 'INITIAL_EVIDENCE_INGESTED',
        actor: 'system' as const,
        details: 'Ingested 4 reports. Flagged viral 3-foot submersion post as uncorroborated contradiction against sensor (4.2 in) and fleet transit data.',
        stateDelta: {
          conflictsResolved: 0,
          newClaimsAdded: 2,
          confidenceShift: 0,
        },
      },
    ],
  };
})();

export const SEEDED_SCENARIOS = {
  bridge: SCENARIO_BRIDGE,
  service: SCENARIO_SERVICE,
  flooding: SCENARIO_FLOODING,
};
