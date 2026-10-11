export type UserRole = 'farmer' | 'agronomist' | 'admin';

export interface AppUser {
  id: string;
  openId: string;
  name: string;
  email: string | null;
  role: UserRole;
}

export interface FarmField {
  id: string;
  farmId: string;
  farmName: string;
  name: string;
  crop: string;
  variety: string | null;
  growthStage: string;
  plantingDate: string | null;
  region: string;
  createdAt: string;
}

export interface DiagnosisResult {
  id: string;
  fieldId: string;
  imageCount: number;
  status: 'needs_review' | 'inconclusive';
  diagnosis: {
    status: 'needs_review' | 'inconclusive';
    primaryHypothesis: string | null;
    confidence: number | null;
    confidenceCalibrated: false;
    alternatives: string[];
    imageQuality: 'unverified';
    expertReviewRequired: true;
  };
  forecast: {
    horizonHours: 72;
    riskScore: null;
    riskLabel: 'unconfirmed';
    probabilityCalibrated: false;
    dataCompleteness: 'unavailable';
    drivers: string[];
  };
  advisory: {
    priority: 'inspect';
    action: string;
    chemicalIntervention: 'not_recommended_by_model';
    reassessAfterHours: 12;
    expertReviewRequired: true;
  };
  provenance: {
    weatherSource: 'not_connected';
    modelVersion: 'none';
    generatedAt: string;
  };
}

export interface FieldInput {
  farmName: string;
  fieldName: string;
  crop: string;
  variety?: string;
  growthStage: string;
  plantingDate?: string;
  region: string;
}

export interface ObservationInput {
  fieldId: string;
  caseId?: string;
  observedSymptoms: string;
  actionTaken?: string;
  symptomsImproved?: boolean | null;
}
