"use client";

import { useSyncExternalStore } from "react";
import { Droplets, Lightbulb, Sprout } from "lucide-react";
import { needsWater, useSavedPlants } from "@/lib/plants-store";

// Valores que dependen de la hora del visitante: en el servidor se usa un
// valor neutro y en el navegador el real.
const noopSubscribe = () => () => {};

function useClientValue<T>(read: () => T, serverValue: T) {
  return useSyncExternalStore(noopSubscribe, read, () => serverValue);
}

export function Greeting() {
  const hour = useClientValue<number | null>(() => new Date().getHours(), null);
  const text =
    hour === null
      ? "Hola"
      : hour >= 5 && hour < 12
        ? "Buenos días"
        : hour >= 12 && hour < 20
          ? "Buenas tardes"
          : "Buenas noches";
  return <>{text} 🌿</>;
}

/** Resumen de "Mis plantas" dentro del banner de inicio. */
export function HeroStats() {
  const plants = useSavedPlants();
  const due = plants.filter(needsWater).length;

  if (plants.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
        <Sprout className="size-4" aria-hidden />
        {plants.length === 1 ? "1 planta" : `${plants.length} plantas`}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
        <Droplets className="size-4" aria-hidden />
        {due === 0 ? "Todas regadas" : `${due} por regar`}
      </span>
    </div>
  );
}

/** Número de plantas a las que toca regar, sobre el icono de Recordatorios. */
export function DueBadge() {
  const plants = useSavedPlants();
  const due = plants.filter(needsWater).length;
  if (due === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-remind-foreground px-1.5 text-xs font-semibold text-white ring-2 ring-remind">
      {due}
      <span className="sr-only"> plantas necesitan agua</span>
    </span>
  );
}

const TIPS = [
  {
    title: "El dedo es el mejor medidor",
    text: "Mete un dedo 3 cm en la tierra: si sale húmedo, tu planta aún no necesita agua.",
  },
  {
    title: "Riega por la mañana",
    text: "Las hojas se secan antes de la noche y así se previenen hongos.",
  },
  {
    title: "Gira tus macetas",
    text: "Un cuarto de vuelta cada semana hace que crezcan parejas hacia la luz.",
  },
  {
    title: "Hojas limpias, planta feliz",
    text: "El polvo bloquea la luz. Limpia las hojas grandes con un paño húmedo.",
  },
  {
    title: "Vacía el plato",
    text: "El agua acumulada bajo la maceta es una de las causas más comunes de raíces podridas.",
  },
  {
    title: "Menos agua en invierno",
    text: "Con frío y menos luz, la mayoría de plantas crecen más lento y beben menos.",
  },
  {
    title: "Mira debajo de las hojas",
    text: "La araña roja y la cochinilla suelen esconderse en el envés. Revísalo cada semana.",
  },
  {
    title: "Agua a temperatura ambiente",
    text: "El agua muy fría puede estresar las raíces de las plantas tropicales.",
  },
];

export function TipOfTheDay() {
  const day = useClientValue(
    () => Math.floor(Date.now() / 86_400_000),
    0
  );
  const tip = TIPS[day % TIPS.length];

  return (
    <section
      aria-label="Consejo del día"
      className="flex gap-4 rounded-3xl border bg-card p-5 shadow-sm"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-remind text-remind-foreground">
        <Lightbulb className="size-6" aria-hidden />
      </span>
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Consejo del día
        </p>
        <p className="mt-0.5 font-heading text-lg font-semibold">{tip.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{tip.text}</p>
      </div>
    </section>
  );
}
