import { Router, type Request, type RequestHandler, type Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { currentAppUser, beginManusLogin, endManusLogin, finishManusLogin } from '../auth/manus-oauth.js';
import { execute, query } from '../db/index.js';
import type { AppUser, DiagnosisResult, FarmField, FieldInput, ObservationInput } from '../../src/lib/contracts.js';
import type { RowDataPacket } from 'mysql2/promise';

const router = Router();

const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
router.use((request, response, next) => {
  if (!mutatingMethods.has(request.method)) return next();
  const origin = request.get('origin');
  const fetchSite = request.get('sec-fetch-site');
  let sameOrigin = false;
  if (origin) {
    try { sameOrigin = new URL(origin).origin === `${request.protocol}://${request.get('host')}`; } catch { sameOrigin = false; }
  }
  if (!sameOrigin || (fetchSite && fetchSite !== 'same-origin') || !request.is('application/json')) {
    response.status(403).json({ error: 'This request could not be verified. Refresh and try again.' });
    return;
  }
  next();
});

type AsyncHandler = (request: Request, response: Response) => Promise<void>;
function asyncRoute(handler: AsyncHandler): RequestHandler {
  return (request, response, next) => {
    void handler(request, response).catch(next);
  };
}

function protectedRoute(handler: (request: Request, response: Response, user: AppUser) => Promise<void>): RequestHandler {
  return asyncRoute(async (request, response) => {
    const user = await currentAppUser(request);
    if (!user) {
      response.status(401).json({ error: 'Sign in to access your farm workspace.' });
      return;
    }
    await handler(request, response, user as AppUser);
  });
}

const fieldSchema = z.object({
  farmName: z.string().trim().min(1).max(120),
  fieldName: z.string().trim().min(1).max(120),
  crop: z.enum(['Potato', 'Rice', 'Cotton', 'Soybean', 'Other']),
  variety: z.string().trim().max(120).optional().default(''),
  growthStage: z.enum(['Seedling', 'Vegetative', 'Flowering', 'Fruiting / tuber', 'Maturity', 'Not sure']),
  plantingDate: z.string().optional().default('').refine((value) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'Enter a valid planting date.'),
  region: z.string().trim().max(160).optional().default(''),
});

const scanSchema = z.object({
  fieldId: z.string().uuid(),
  imageCount: z.number().int().min(1).max(3),
});

const observationSchema = z.object({
  fieldId: z.string().uuid(),
  caseId: z.string().uuid().optional(),
  observedSymptoms: z.string().trim().min(2).max(1200),
  actionTaken: z.string().trim().max(800).optional().default(''),
  symptomsImproved: z.boolean().nullable().optional().default(null),
});

interface FieldRow extends RowDataPacket {
  id: string; farm_id: string; farm_name: string; name: string; crop: string; variety: string | null;
  growth_stage: string; planting_date: Date | string | null; region: string; created_at: Date | string;
}

function dateValue(value: Date | string | null): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function timestampValue(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapField(row: FieldRow): FarmField {
  return {
    id: row.id,
    farmId: row.farm_id,
    farmName: row.farm_name,
    name: row.name,
    crop: row.crop,
    variety: row.variety,
    growthStage: row.growth_stage,
    plantingDate: dateValue(row.planting_date),
    region: row.region === 'Not provided' ? '' : row.region,
    createdAt: timestampValue(row.created_at),
  };
}

interface CaseRow extends RowDataPacket {
  id: string; field_id: string; image_count: number; status: string; summary_json: DiagnosisResult | string;
  model_version: string; created_at: Date | string; field_name?: string; crop?: string;
}

function parseSummary(value: DiagnosisResult | string): DiagnosisResult {
  return typeof value === 'string' ? JSON.parse(value) as DiagnosisResult : value;
}

function notConfiguredDiagnosis(id: string, fieldId: string, imageCount: number): DiagnosisResult {
  return {
    id,
    fieldId,
    imageCount,
    status: 'needs_review',
    diagnosis: {
      status: 'needs_review',
      primaryHypothesis: null,
      confidence: null,
      confidenceCalibrated: false,
      alternatives: [],
      imageQuality: 'unverified',
      expertReviewRequired: true,
    },
    forecast: {
      horizonHours: 72,
      riskScore: null,
      riskLabel: 'unconfirmed',
      probabilityCalibrated: false,
      dataCompleteness: 'unavailable',
      drivers: [],
    },
    advisory: {
      priority: 'inspect',
      action: 'Automated analysis is not connected in this prototype. Inspect the affected plants, capture clear close-up and whole-plant images, and ask a local agronomist to review suspected symptoms.',
      chemicalIntervention: 'not_recommended_by_model',
      reassessAfterHours: 12,
      expertReviewRequired: true,
    },
    provenance: {
      weatherSource: 'not_connected',
      modelVersion: 'none',
      generatedAt: new Date().toISOString(),
    },
  };
}

router.get('/health', (_request, response) => response.json({ status: 'ok' }));
router.get('/auth/session', asyncRoute(async (request, response) => {
  const user = await currentAppUser(request);
  response.json({ authenticated: Boolean(user), user: user ?? null });
}));
router.post('/auth/start', asyncRoute(beginManusLogin));
router.get('/auth/callback', asyncRoute(async (request, response) => {
  try {
    await finishManusLogin(request, response);
  } catch {
    response.redirect(302, `/login?error=${encodeURIComponent('Sign-in could not be completed. Please try again.')}`);
  }
}));
router.post('/auth/logout', asyncRoute(async (_request, response) => {
  endManusLogin(response);
  response.json({ ok: true });
}));

router.get('/fields', protectedRoute(async (_request, response, user) => {
  const rows = await query<FieldRow[]>(
    `SELECT f.id, f.farm_id, fm.name AS farm_name, f.name, f.crop, f.variety,
            f.growth_stage, f.planting_date, f.region, f.created_at
     FROM fields f JOIN farms fm ON fm.id = f.farm_id
     WHERE f.owner_id = ? ORDER BY f.created_at DESC`,
    [user.id],
  );
  response.json({ fields: rows.map(mapField) });
}));

router.post('/fields', protectedRoute(async (request, response, user) => {
  const parsed = fieldSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.issues[0]?.message || 'Check the field details.' });
    return;
  }
  const input = parsed.data as FieldInput;
  const region = input.region.trim() || 'Not provided';
  const existing = await query<(RowDataPacket & { id: string })[]>(
    'SELECT id FROM farms WHERE owner_id = ? AND name = ? LIMIT 1',
    [user.id, input.farmName],
  );
  const farmId = existing[0]?.id || randomUUID();
  if (!existing[0]) {
    await execute('INSERT INTO farms (id, owner_id, name, region) VALUES (?, ?, ?, ?)', [farmId, user.id, input.farmName, region]);
  }
  const fieldId = randomUUID();
  await execute(
    `INSERT INTO fields (id, owner_id, farm_id, name, crop, variety, growth_stage, planting_date, region)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULLIF(?, ''), ?)`,
    [fieldId, user.id, farmId, input.fieldName, input.crop, input.variety || null, input.growthStage, input.plantingDate || '', region],
  );
  await execute(
    'INSERT INTO audit_events (id, actor_id, entity_type, entity_id, action, details_json) VALUES (?, ?, ?, ?, ?, ?)',
    [randomUUID(), user.id, 'field', fieldId, 'field.created', JSON.stringify({ crop: input.crop })],
  );
  const [created] = await query<FieldRow[]>(
    `SELECT f.id, f.farm_id, fm.name AS farm_name, f.name, f.crop, f.variety,
            f.growth_stage, f.planting_date, f.region, f.created_at
     FROM fields f JOIN farms fm ON fm.id = f.farm_id WHERE f.id = ? AND f.owner_id = ? LIMIT 1`,
    [fieldId, user.id],
  );
  response.status(201).json({ field: mapField(created) });
}));

router.get('/fields/:id', protectedRoute(async (request, response, user) => {
  const rows = await query<FieldRow[]>(
    `SELECT f.id, f.farm_id, fm.name AS farm_name, f.name, f.crop, f.variety,
            f.growth_stage, f.planting_date, f.region, f.created_at
     FROM fields f JOIN farms fm ON fm.id = f.farm_id WHERE f.id = ? AND f.owner_id = ? LIMIT 1`,
    [request.params.id, user.id],
  );
  if (!rows[0]) {
    response.status(404).json({ error: 'Field not found.' });
    return;
  }
  response.json({ field: mapField(rows[0]) });
}));

router.put('/fields/:id', protectedRoute(async (request, response, user) => {
  const parsed = fieldSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.issues[0]?.message || 'Check the field details.' });
    return;
  }
  const input = parsed.data;
  const region = input.region.trim() || 'Not provided';
  const rows = await query<(RowDataPacket & { id: string; farm_id: string })[]>(
    'SELECT id, farm_id FROM fields WHERE id = ? AND owner_id = ? LIMIT 1',
    [request.params.id, user.id],
  );
  if (!rows[0]) {
    response.status(404).json({ error: 'Field not found.' });
    return;
  }
  await execute('UPDATE farms SET name = ?, region = ? WHERE id = ? AND owner_id = ?', [input.farmName, region, rows[0].farm_id, user.id]);
  await execute(
    `UPDATE fields SET name = ?, crop = ?, variety = ?, growth_stage = ?, planting_date = NULLIF(?, ''), region = ?
     WHERE id = ? AND owner_id = ?`,
    [input.fieldName, input.crop, input.variety || null, input.growthStage, input.plantingDate || '', region, request.params.id, user.id],
  );
  await execute(
    'INSERT INTO audit_events (id, actor_id, entity_type, entity_id, action, details_json) VALUES (?, ?, ?, ?, ?, ?)',
    [randomUUID(), user.id, 'field', request.params.id, 'field.updated', JSON.stringify({ crop: input.crop })],
  );
  const [updated] = await query<FieldRow[]>(
    `SELECT f.id, f.farm_id, fm.name AS farm_name, f.name, f.crop, f.variety,
            f.growth_stage, f.planting_date, f.region, f.created_at
     FROM fields f JOIN farms fm ON fm.id = f.farm_id WHERE f.id = ? AND f.owner_id = ? LIMIT 1`,
    [request.params.id, user.id],
  );
  response.json({ field: mapField(updated) });
}));

router.post('/diagnoses', protectedRoute(async (request, response, user) => {
  const parsed = scanSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.issues[0]?.message || 'Check the image selection.' });
    return;
  }
  const owned = await query<(RowDataPacket & { id: string })[]>(
    'SELECT id FROM fields WHERE id = ? AND owner_id = ? LIMIT 1', [parsed.data.fieldId, user.id],
  );
  if (!owned[0]) {
    response.status(404).json({ error: 'Choose one of your fields before starting a scan.' });
    return;
  }
  const id = randomUUID();
  const result = notConfiguredDiagnosis(id, parsed.data.fieldId, parsed.data.imageCount);
  await execute(
    `INSERT INTO crop_cases (id, owner_id, field_id, image_count, status, summary_json, model_version, weather_snapshot)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
    [id, user.id, parsed.data.fieldId, parsed.data.imageCount, result.status, JSON.stringify(result), 'none'],
  );
  response.status(201).json({ diagnosis: result });
}));

router.get('/diagnoses/:id', protectedRoute(async (request, response, user) => {
  const rows = await query<CaseRow[]>(
    'SELECT id, field_id, image_count, status, summary_json, model_version, created_at FROM crop_cases WHERE id = ? AND owner_id = ? LIMIT 1',
    [request.params.id, user.id],
  );
  if (!rows[0]) {
    response.status(404).json({ error: 'Scan result not found.' });
    return;
  }
  response.json({ diagnosis: parseSummary(rows[0].summary_json) });
}));

router.get('/history', protectedRoute(async (_request, response, user) => {
  const cases = await query<CaseRow[]>(
    `SELECT c.id, c.field_id, c.image_count, c.status, c.summary_json, c.model_version, c.created_at,
            f.name AS field_name, f.crop
     FROM crop_cases c JOIN fields f ON f.id = c.field_id AND f.owner_id = c.owner_id
     WHERE c.owner_id = ? ORDER BY c.created_at DESC LIMIT 100`,
    [user.id],
  );
  const observations = await query<(RowDataPacket & { id: string; field_id: string; case_id: string | null; observed_symptoms: string; action_taken: string | null; symptoms_improved: boolean | null; verified_by_expert: boolean; created_at: Date | string; field_name: string })[]>(
    `SELECT o.id, o.field_id, o.case_id, o.observed_symptoms, o.action_taken, o.symptoms_improved,
            o.verified_by_expert, o.created_at, f.name AS field_name
     FROM observations o JOIN fields f ON f.id = o.field_id AND f.owner_id = o.owner_id
     WHERE o.owner_id = ? ORDER BY o.created_at DESC LIMIT 100`,
    [user.id],
  );
  response.json({
    cases: cases.map((row) => ({ id: row.id, fieldId: row.field_id, fieldName: row.field_name, crop: row.crop, imageCount: row.image_count, status: row.status, summary: parseSummary(row.summary_json), createdAt: timestampValue(row.created_at) })),
    observations: observations.map((row) => ({ id: row.id, fieldId: row.field_id, fieldName: row.field_name, caseId: row.case_id, observedSymptoms: row.observed_symptoms, actionTaken: row.action_taken, symptomsImproved: row.symptoms_improved, verifiedByExpert: row.verified_by_expert, createdAt: timestampValue(row.created_at) })),
  });
}));

router.post('/observations', protectedRoute(async (request, response, user) => {
  const parsed = observationSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.issues[0]?.message || 'Check the observation.' });
    return;
  }
  const input = parsed.data as ObservationInput;
  const field = await query<(RowDataPacket & { id: string })[]>(
    'SELECT id FROM fields WHERE id = ? AND owner_id = ? LIMIT 1', [input.fieldId, user.id],
  );
  if (!field[0]) {
    response.status(404).json({ error: 'Field not found.' });
    return;
  }
  if (input.caseId) {
    const related = await query<(RowDataPacket & { id: string })[]>(
      'SELECT id FROM crop_cases WHERE id = ? AND field_id = ? AND owner_id = ? LIMIT 1',
      [input.caseId, input.fieldId, user.id],
    );
    if (!related[0]) {
      response.status(400).json({ error: 'That scan is not associated with this field.' });
      return;
    }
  }
  const id = randomUUID();
  await execute(
    `INSERT INTO observations (id, owner_id, field_id, case_id, observed_symptoms, action_taken, symptoms_improved, verified_by_expert)
     VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`,
    [id, user.id, input.fieldId, input.caseId || null, input.observedSymptoms, input.actionTaken || null, input.symptomsImproved],
  );
  await execute(
    'INSERT INTO audit_events (id, actor_id, entity_type, entity_id, action) VALUES (?, ?, ?, ?, ?)',
    [randomUUID(), user.id, 'observation', id, 'observation.recorded'],
  );
  response.status(201).json({ id, verifiedByExpert: false, message: 'Saved as a farmer-reported observation.' });
}));

export default router;
