// Tipos del contrato frontend ↔ backend (ver docs/FloraSense_Plan_Implementacion_8_Dias.md §4).
// Deben mantenerse equivalentes a los schemas Pydantic de backend/schemas/.

export type LocationType = "indoor" | "outdoor" | "unknown";
export type LightLevel = "direct" | "indirect" | "low" | "unknown";
export type LastWatered =
  | "today_yesterday"
  | "2_4_days"
  | "5_7_days"
  | "over_7_days"
  | "unknown";
export type Drainage = "yes" | "no" | "unknown";

export type EnvironmentContext = {
  locationType: LocationType;
  light: LightLevel;
  lastWatered: LastWatered;
  hasDrainage: Drainage;
  city?: string;
};

export type SpeciesCandidate = {
  scientificName: string;
  commonNames: string[];
  score: number | null; // puntuación original de Pl@ntNet; no probabilidad clínica
  catalogId?: string;
};

export type IdentifyResponse = {
  candidates: SpeciesCandidate[];
};

export type SelectedSpecies = {
  scientificName: string;
  commonName?: string;
  confirmed: boolean;
  catalogId?: string;
};

export type SymptomType =
  | "yellowing"
  | "brown_spots"
  | "wilting"
  | "dry_edges"
  | "other";
export type Severity = "mild" | "moderate" | "high" | "unknown";

export type Symptom = {
  type: SymptomType;
  description: string;
  severity: Severity;
  visibleEvidence: string;
};

export type RecommendationCategory =
  | "placement"
  | "lighting"
  | "watering"
  | "substrate"
  | "drainage"
  | "humidity"
  | "monitoring";
export type Priority = "high" | "medium" | "low";
export type RecommendationSource =
  | "plant_profile"
  | "context_rule"
  | "visual_observation";

export type Recommendation = {
  category: RecommendationCategory;
  priority: Priority;
  action: string;
  rationale: string;
  source: RecommendationSource;
};

export type HealthStatus =
  | "no_obvious_issues"
  | "review_needed"
  | "insufficient_evidence";

export type SunExposure = "full_sun" | "partial_sun" | "indirect" | "shade";
export type WaterNeeds = "low" | "medium" | "high";

// Forma propuesta de cada entrada de backend/data/plants.json.
// El contrato la expone como Record<string, unknown>; acordar campos con Dev C.
export type PlantProfile = {
  id: string;
  scientificName: string;
  commonNames: string[];
  family: string;
  sunExposure: SunExposure;
  light: string;
  waterNeeds: WaterNeeds;
  watering: { criterion: string; frequencyHint?: string };
  temperature: { minC: number; maxC: number };
  humidity: string;
  substrate: string;
  drainage: string;
  size?: string;
  warnings: string[];
  prevention: string[];
  sources: string[];
};

export type SegmentationResult = {
  available: boolean;
  overlayUrl?: string;
  note?: string;
};

export type AnalysisResult = {
  species: SelectedSpecies;
  environment: { suggestedLocationType: string; observations: string[] };
  plantProfile: PlantProfile | null;
  health: {
    status: HealthStatus;
    symptoms: Symptom[];
    possibleCauses: string[];
    disclaimer: string;
  };
  recommendations: Recommendation[];
  segmentation?: SegmentationResult;
};
