// Respuestas simuladas para desarrollar el frontend sin depender del backend.
// Se activan mientras NEXT_PUBLIC_USE_MOCKS no sea "false".

import type {
  AnalysisResult,
  EnvironmentContext,
  IdentifyResponse,
  PlantProfile,
  Recommendation,
  SegmentationResult,
  SelectedSpecies,
} from "@/lib/types";

export const mockProfiles: Record<string, PlantProfile> = {
  "monstera-deliciosa": {
    id: "monstera-deliciosa",
    scientificName: "Monstera deliciosa",
    commonNames: ["Costilla de Adán", "Monstera"],
    family: "Araceae",
    sunExposure: "indirect",
    waterNeeds: "medium",
    difficulty: "easy",
    commonProblems: [
      {
        name: "Hojas amarillas",
        kind: "yellowing",
        signs: "Hojas bajas que se vuelven amarillas y blandas.",
        solution:
          "Casi siempre es exceso de riego: deja secar los primeros centímetros del sustrato y revisa el drenaje.",
      },
      {
        name: "Puntas marrones y secas",
        kind: "brown_tips",
        signs: "Bordes o puntas de las hojas crujientes y marrones.",
        solution:
          "Suele ser aire seco o riego irregular: sube la humedad y riega de forma más constante.",
      },
      {
        name: "Araña roja",
        kind: "pests",
        signs: "Puntitos claros en las hojas y telarañas finas en el envés.",
        solution:
          "Aparece con ambiente seco y caliente: limpia las hojas, aumenta la humedad y trata con jabón potásico.",
      },
    ],
    light:
      "Luz indirecta brillante. Tolera algo de sol suave de mañana; el sol directo intenso quema las hojas.",
    watering: {
      criterion:
        "Riega cuando los 3–5 cm superiores del sustrato estén secos al tacto.",
      frequencyHint:
        "Suele ser cada 7–10 días en épocas cálidas y cada 2–3 semanas en invierno.",
    },
    temperature: { minC: 15, maxC: 27 },
    humidity: "Media a alta (más de 50 %). Agradece agrupar plantas o un humidificador.",
    misting:
      "Nebuliza las hojas con agua fina 1–2 veces por semana, por la mañana y con agua sin cal. Si hay hongos o manchas, déjalo.",
    substrate: "Aireado: fibra de coco o turba con corteza de pino y perlita.",
    drainage: "Imprescindible. Maceta con agujeros y sin agua acumulada en el plato.",
    size: "1–3 m en interior",
    warnings: [
      "Tóxica para perros y gatos si se mastica (oxalato de calcio).",
    ],
    prevention: [
      "Evita el encharcamiento: es la causa más común de pudrición de raíz.",
      "Limpia las hojas con un paño húmedo cada 2–3 semanas para prevenir ácaros.",
      "Revisa el envés de las hojas en busca de cochinilla o araña roja.",
      "Mantén buena ventilación y no mojes las hojas al anochecer para evitar hongos.",
    ],
    sources: ["RHS — Monstera deliciosa", "Missouri Botanical Garden"],
  },
  "epipremnum-aureum": {
    id: "epipremnum-aureum",
    scientificName: "Epipremnum aureum",
    commonNames: ["Potus", "Pothos", "Poto"],
    family: "Araceae",
    sunExposure: "indirect",
    waterNeeds: "medium",
    difficulty: "easy",
    commonProblems: [
      {
        name: "Pudrición de raíz",
        kind: "root_rot",
        signs: "Hojas amarillas, tallos blandos y sustrato siempre mojado.",
        solution:
          "Por exceso de agua: riega solo cuando la mitad superior esté seca y asegura el drenaje.",
      },
      {
        name: "Pérdida del jaspeado",
        kind: "fading",
        signs: "Las hojas nuevas salen más verdes y con menos manchas claras.",
        solution: "Le falta luz: acércala a una ventana con luz indirecta brillante.",
      },
      {
        name: "Cochinilla algodonosa",
        kind: "pests",
        signs: "Motas blancas y algodonosas en las axilas de las hojas.",
        solution:
          "Retírala con un algodón con alcohol y revisa la planta cada semana durante un mes.",
      },
    ],
    light:
      "Luz indirecta. Tolera poca luz, aunque las variedades jaspeadas pierden color.",
    watering: {
      criterion: "Riega cuando la mitad superior del sustrato esté seca.",
      frequencyHint: "Habitualmente cada 7–14 días según la temperatura.",
    },
    temperature: { minC: 15, maxC: 29 },
    humidity: "Media. Se adapta bien a la humedad normal de una casa.",
    substrate: "Sustrato universal con un 20–30 % de perlita.",
    drainage: "Necesario. Las raíces se pudren con facilidad si queda agua estancada.",
    size: "Trepadora o colgante, tallos de 1–3 m",
    warnings: ["Tóxica para perros y gatos si se ingiere."],
    prevention: [
      "Deja secar parcialmente el sustrato entre riegos para evitar hongos de raíz.",
      "Poda tallos débiles o amarillos para mantener la planta aireada.",
      "Revisa periódicamente las axilas de las hojas por cochinilla algodonosa.",
    ],
    sources: ["RHS — Epipremnum aureum"],
  },
};

export const mockIdentify: IdentifyResponse = {
  candidates: [
    {
      scientificName: "Monstera deliciosa",
      commonNames: ["Costilla de Adán", "Monstera"],
      score: 0.82,
      catalogId: "monstera-deliciosa",
    },
    {
      scientificName: "Epipremnum aureum",
      commonNames: ["Potus", "Pothos"],
      score: 0.07,
      catalogId: "epipremnum-aureum",
    },
    {
      scientificName: "Thaumatophyllum bipinnatifidum",
      commonNames: ["Filodendro", "Guaimbé"],
      score: 0.04,
    },
  ],
};

function contextRecommendations(
  context: EnvironmentContext,
  profile: PlantProfile | null
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (context.hasDrainage === "no") {
    recs.push({
      category: "drainage",
      priority: "high",
      action: "Trasplanta a una maceta con agujeros de drenaje.",
      rationale:
        "Sin drenaje el agua se acumula en el fondo y favorece la pudrición de raíces.",
      source: "context_rule",
    });
  }
  if (context.lastWatered === "today_yesterday") {
    recs.push({
      category: "watering",
      priority: "high",
      action: "No vuelvas a regar hasta que la capa superior del sustrato esté seca.",
      rationale:
        "Regaste recientemente y en la foto se observan hojas amarillas, señal frecuente de exceso de agua.",
      source: "visual_observation",
    });
  }
  if (context.light === "direct" && profile?.sunExposure === "indirect") {
    recs.push({
      category: "placement",
      priority: "high",
      action: "Aléjala un metro de la ventana o filtra el sol con una cortina.",
      rationale: "Esta especie prefiere luz indirecta; el sol directo quema las hojas.",
      source: "plant_profile",
    });
  }
  if (context.light === "low") {
    recs.push({
      category: "lighting",
      priority: "medium",
      action: "Acércala a una ventana luminosa sin sol directo.",
      rationale: "Con poca luz crece lento y es más sensible al exceso de riego.",
      source: "context_rule",
    });
  }
  return recs;
}

export function mockAnalyze(
  species: SelectedSpecies,
  context: EnvironmentContext
): AnalysisResult {
  const profile = species.catalogId
    ? mockProfiles[species.catalogId] ?? null
    : null;

  const recommendations: Recommendation[] = [
    ...contextRecommendations(context, profile),
    {
      category: "watering",
      priority: "medium",
      action: profile
        ? profile.watering.criterion
        : "Comprueba con el dedo que el sustrato esté seco antes de regar.",
      rationale: profile
        ? "Criterio de riego recomendado para esta especie."
        : "Sin ficha de la especie, es la pauta más segura para la mayoría de plantas de interior.",
      source: profile ? "plant_profile" : "context_rule",
    },
    {
      category: "humidity",
      priority: "low",
      action: "Agrupa tus plantas o coloca un plato con piedras y agua debajo de la maceta.",
      rationale: "Aumenta la humedad ambiental, útil en espacios con calefacción.",
      source: "plant_profile",
    },
    {
      category: "monitoring",
      priority: "low",
      action: "Toma otra foto en 7 días para comparar las hojas amarillas.",
      rationale: "Ver si el síntoma avanza ayuda a distinguir entre riego y luz.",
      source: "visual_observation",
    },
  ];

  return {
    species,
    environment: {
      suggestedLocationType: "indoor",
      observations: [
        "Maceta en interior junto a una ventana.",
        "La luz parece entrar de lado, probablemente indirecta.",
        "El sustrato visible se ve oscuro, posiblemente húmedo.",
      ],
    },
    plantProfile: profile,
    health: {
      status: "review_needed",
      symptoms: [
        {
          type: "yellowing",
          description: "Dos hojas inferiores presentan amarilleo uniforme.",
          severity: "mild",
          visibleEvidence: "Hojas de la base, cerca del borde de la maceta.",
        },
        {
          type: "brown_spots",
          description: "Pequeña mancha marrón seca en el borde de una hoja.",
          severity: "mild",
          visibleEvidence: "Hoja central, borde derecho.",
        },
      ],
      possibleCauses: [
        "Exceso de riego o drenaje insuficiente.",
        "Envejecimiento natural de las hojas inferiores.",
      ],
      disclaimer:
        "Estas observaciones se basan en fotografías y no son un diagnóstico botánico. Si los síntomas avanzan, consulta con un vivero o especialista.",
    },
    recommendations,
  };
}

export const mockSegment: SegmentationResult = {
  available: false,
  note: "Modo demo: la segmentación con Grounding DINO + SAM 2 se mostrará aquí cuando /api/segment esté disponible.",
};
