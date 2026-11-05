import type {
  CareDifficulty,
  Drainage,
  HealthStatus,
  LastWatered,
  LightLevel,
  LocationType,
  Priority,
  RecommendationCategory,
  RecommendationSource,
  Severity,
  SunExposure,
  SymptomType,
} from "@/lib/types";

export const locationLabels: Record<LocationType, string> = {
  indoor: "Interior",
  outdoor: "Exterior",
  unknown: "No estoy seguro",
};

export const lightLabels: Record<LightLevel, string> = {
  direct: "Sol directo",
  indirect: "Luz indirecta",
  low: "Poca luz",
  unknown: "No lo sé",
};

export const lastWateredLabels: Record<LastWatered, string> = {
  today_yesterday: "Hoy o ayer",
  "2_4_days": "Hace 2–4 días",
  "5_7_days": "Hace 5–7 días",
  over_7_days: "Hace más de una semana",
  unknown: "No lo recuerdo",
};

export const drainageLabels: Record<Drainage, string> = {
  yes: "Sí, tiene agujeros",
  no: "No tiene",
  unknown: "No lo sé",
};

export const sunExposureLabels: Record<SunExposure, string> = {
  full_sun: "Pleno sol",
  partial_sun: "Semisombra",
  indirect: "Luz indirecta",
  shade: "Sombra",
};

export const difficultyLabels: Record<CareDifficulty, string> = {
  easy: "Fácil de cuidar",
  medium: "Dificultad media",
  hard: "Exigente",
};

export const difficultyHints: Record<CareDifficulty, string> = {
  easy: "Perdona descuidos y se adapta a casi cualquier hogar.",
  medium: "Necesita algo de atención a la luz, el riego y la humedad.",
  hard: "Requiere condiciones y rutina constantes; es poco tolerante a errores.",
};

export const healthStatusLabels: Record<HealthStatus, string> = {
  no_obvious_issues: "Sin problemas evidentes",
  review_needed: "Conviene revisarla",
  insufficient_evidence: "Evidencia insuficiente",
};

export const symptomLabels: Record<SymptomType, string> = {
  yellowing: "Amarilleo",
  brown_spots: "Manchas marrones",
  wilting: "Marchitez",
  dry_edges: "Bordes secos",
  other: "Otro",
};

export const severityLabels: Record<Severity, string> = {
  mild: "Leve",
  moderate: "Moderado",
  high: "Alto",
  unknown: "Sin determinar",
};

export const priorityLabels: Record<Priority, string> = {
  high: "Prioridad alta",
  medium: "Prioridad media",
  low: "Prioridad baja",
};

export const categoryLabels: Record<RecommendationCategory, string> = {
  placement: "Ubicación",
  lighting: "Luz",
  watering: "Riego",
  substrate: "Sustrato",
  drainage: "Drenaje",
  humidity: "Humedad",
  monitoring: "Seguimiento",
};

export const sourceLabels: Record<RecommendationSource, string> = {
  plant_profile: "Ficha botánica",
  context_rule: "Tu entorno",
  visual_observation: "Observación en la foto",
};
