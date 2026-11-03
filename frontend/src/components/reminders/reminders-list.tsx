"use client";

import Link from "next/link";
import { Bell, Droplets, Minus, Plus, ScanSearch, Trash } from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PottedPlant } from "@/components/illustrations";
import { PlantThumb } from "@/components/plants/plant-thumb";
import { WaterBar } from "@/components/plants/water-bar";
import {
  daysUntilWatering,
  needsWater,
  plantName,
  removePlant,
  todayISO,
  updatePlant,
  useSavedPlants,
  wateringLabel,
  type SavedPlant,
} from "@/lib/plants-store";
import { formatAmount } from "@/lib/water";

// Las plantas sin riego registrado van justo después de las que toca regar hoy.
function sortKey(plant: SavedPlant) {
  return daysUntilWatering(plant) ?? 0.5;
}

export function RemindersList() {
  const plants = useSavedPlants();
  const sorted = [...plants].sort((a, b) => sortKey(a) - sortKey(b));
  const dueCount = plants.filter(needsWater).length;

  return (
    <section>
      {plants.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed bg-card/60 px-6 py-12 text-center">
          <PottedPlant className="size-32" />
          <p className="font-heading text-xl font-semibold">
            Aún no tienes plantas agregadas
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Identifica una planta con una foto y agrégala para recibir
            recordatorios de riego.
          </p>
          <Button asChild size="lg" className="mt-1 rounded-full">
            <Link href="/identificar">
              <ScanSearch data-icon="inline-start" aria-hidden />
              Identificar una planta
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <p
            className={cn(
              "mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
              dueCount > 0
                ? "bg-warning text-warning-foreground"
                : "bg-success text-success-foreground"
            )}
          >
            <Bell className="size-4" aria-hidden />
            {dueCount === 0
              ? "Todas tus plantas están al día"
              : dueCount === 1
                ? "1 planta necesita agua"
                : `${dueCount} plantas necesitan agua`}
          </p>

          <ul className="space-y-3">
            {sorted.map((plant, i) => (
              <li
                key={plant.id}
                className="fill-mode-both duration-500 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <ReminderItem plant={plant} />
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-muted-foreground">
            Tus plantas se guardan en este dispositivo. Ajusta la cantidad y la
            frecuencia con la{" "}
            <Link href="/calculadora-agua" className="text-primary underline-offset-4 hover:underline">
              calculadora de agua
            </Link>
            .
          </p>
        </>
      )}
    </section>
  );
}

function ReminderItem({ plant }: { plant: SavedPlant }) {
  const days = daysUntilWatering(plant);
  const due = days !== null && days <= 0;
  const wateredToday = plant.lastWateredAt === todayISO();
  const name = plantName(plant);

  function changeInterval(delta: number) {
    const next = Math.min(60, Math.max(1, plant.wateringIntervalDays + delta));
    updatePlant(plant.id, { wateringIntervalDays: next });
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-3xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:p-4",
        due && "border-remind-foreground/30 bg-remind/40"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <PlantThumb src={plant.photo} alt="" className="size-18 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          {plant.commonName && (
            <p className="truncate text-xs text-muted-foreground italic">
              {plant.scientificName}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge
              className={cn(
                due
                  ? "bg-warning text-warning-foreground"
                  : days === null
                    ? "bg-muted text-muted-foreground"
                    : "bg-success text-success-foreground"
              )}
            >
              {wateringLabel(days)}
            </Badge>
            {plant.waterAmountMl && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Droplets className="size-3" aria-hidden />≈{" "}
                {formatAmount(plant.waterAmountMl)}
              </span>
            )}
          </div>
          <WaterBar plant={plant} className="mt-2 max-w-48" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <div
          className="flex items-center gap-1 text-sm"
          role="group"
          aria-label={`Frecuencia de riego de ${name}`}
        >
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => changeInterval(-1)}
            aria-label="Regar más seguido"
          >
            <Minus aria-hidden />
          </Button>
          <span className="w-24 text-center tabular-nums">
            cada {plant.wateringIntervalDays}{" "}
            {plant.wateringIntervalDays === 1 ? "día" : "días"}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => changeInterval(1)}
            aria-label="Regar menos seguido"
          >
            <Plus aria-hidden />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={due || days === null ? "default" : "outline"}
            disabled={wateredToday}
            onClick={() => updatePlant(plant.id, { lastWateredAt: todayISO() })}
          >
            <Droplets data-icon="inline-start" aria-hidden />
            {wateredToday ? "Regada hoy" : "La regué hoy"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Quitar ${name}`}
            onClick={() => {
              if (window.confirm(`¿Quitar "${name}" de tus plantas?`)) {
                removePlant(plant.id);
              }
            }}
          >
            <Trash aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
