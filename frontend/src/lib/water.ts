// Estimación orientativa de riego. No sustituye comprobar la humedad del
// sustrato: la foto no mide humedad real y cada casa es distinta.

import type { WaterNeeds } from "@/lib/types";

export type Season = "warm" | "mild" | "cold";
export type WaterLight = "direct" | "indirect" | "low";

export type WaterInput = {
  potDiameterCm: number;
  waterNeeds: WaterNeeds;
  location: "indoor" | "outdoor";
  light: WaterLight;
  season: Season;
  hasDrainage: boolean;
};

export type WaterEstimate = {
  amountMl: number;
  intervalDays: number;
  intervalRange: [number, number];
  tips: string[];
};

/** Días entre riegos en interior, luz indirecta y clima templado. */
export const BASE_INTERVAL_DAYS: Record<WaterNeeds, number> = {
  low: 14,
  medium: 7,
  high: 4,
};

// Fracción del volumen de sustrato que se aporta en cada riego.
const VOLUME_FRACTION: Record<WaterNeeds, number> = {
  low: 0.15,
  medium: 0.22,
  high: 0.28,
};

const LIGHT_FACTOR: Record<WaterLight, number> = {
  direct: 0.75,
  indirect: 1,
  low: 1.35,
};

const SEASON_FACTOR: Record<Season, number> = {
  warm: 0.8,
  mild: 1,
  cold: 1.6,
};

/** Volumen aproximado de una maceta troncocónica de alto ≈ diámetro (ml). */
function potVolumeMl(diameterCm: number) {
  const r = diameterCm / 2;
  return Math.PI * r * r * diameterCm * 0.75;
}

function roundAmount(ml: number) {
  const step = ml < 300 ? 10 : 50;
  return Math.max(step, Math.round(ml / step) * step);
}

export function estimateWatering(input: WaterInput): WaterEstimate {
  const tips = [
    "Antes de regar, mete un dedo 3 cm en la tierra: si aún está húmeda, espera un par de días.",
  ];

  let amount = potVolumeMl(input.potDiameterCm) * VOLUME_FRACTION[input.waterNeeds];
  if (!input.hasDrainage) {
    amount *= 0.5;
    tips.push(
      "Sin agujeros de drenaje el agua se acumula en el fondo: riega la mitad y considera cambiar de maceta."
    );
  }

  const interval =
    BASE_INTERVAL_DAYS[input.waterNeeds] *
    LIGHT_FACTOR[input.light] *
    SEASON_FACTOR[input.season] *
    (input.location === "outdoor" ? 0.85 : 1);
  const intervalDays = Math.max(1, Math.round(interval));

  if (input.light === "low") {
    tips.push("Con poca luz la tierra tarda más en secarse; riega con moderación.");
  }
  if (input.season === "cold") {
    tips.push("En época fría la mayoría de plantas casi no crecen y necesitan menos agua.");
  }
  if (input.location === "outdoor") {
    tips.push("En exterior, si llovió en los últimos días, retrasa el riego.");
  }

  return {
    amountMl: roundAmount(amount),
    intervalDays,
    intervalRange: [
      Math.max(1, Math.round(intervalDays * 0.85)),
      Math.max(1, Math.round(intervalDays * 1.15)),
    ],
    tips,
  };
}

export function formatAmount(ml: number) {
  if (ml < 1000) return `${ml} ml`;
  return `${(ml / 1000).toLocaleString("es", { maximumFractionDigits: 1 })} L`;
}

export function formatInterval([min, max]: [number, number]) {
  if (min === max) return min === 1 ? "cada día" : `cada ${min} días`;
  return `cada ${min}–${max} días`;
}
