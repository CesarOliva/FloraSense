"use client";

import Link from "next/link";
import { ChevronRight, ScanSearch } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { PottedPlant } from "@/components/illustrations";
import { PlantThumb } from "@/components/plants/plant-thumb";
import { WaterBar } from "@/components/plants/water-bar";
import {
  daysUntilWatering,
  needsWater,
  plantName,
  useSavedPlants,
  wateringLabel,
} from "@/lib/plants-store";

export function MyPlantsPreview() {
  const plants = useSavedPlants();

  return (
    <section aria-labelledby="my-plants-title">
      <div className="mb-3 flex items-end justify-between">
        <h2 id="my-plants-title" className="text-2xl font-semibold">
          Mis plantas
        </h2>
        {plants.length > 0 && (
          <Link
            href="/recordatorios"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Ver todas
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>

      {plants.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed bg-card/60 px-6 py-8 text-center sm:flex-row sm:gap-6 sm:text-left">
          <PottedPlant className="size-28 shrink-0" />
          <div>
            <p className="font-heading text-lg font-semibold">
              Tu jardín está esperando
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Identifica una planta con una foto y agrégala para seguir su
              riego desde aquí.
            </p>
            <Button asChild className="mt-4 rounded-full" size="lg">
              <Link href="/identificar">
                <ScanSearch data-icon="inline-start" aria-hidden />
                Identificar mi primera planta
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pt-1 pb-3">
          {plants.map((plant, i) => {
            const days = daysUntilWatering(plant);
            return (
              <li
                key={plant.id}
                className="w-40 shrink-0 snap-start fill-mode-both duration-500 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Link
                  href="/recordatorios"
                  className="block rounded-3xl border bg-card p-2 shadow-sm transition-transform outline-none hover:-translate-y-1 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <PlantThumb
                    src={plant.photo}
                    alt=""
                    className="aspect-square w-full rounded-2xl"
                  />
                  <div className="px-1.5 pt-2 pb-1">
                    <p className="truncate font-medium">{plantName(plant)}</p>
                    <p
                      className={cn(
                        "truncate text-xs",
                        needsWater(plant)
                          ? "font-semibold text-warning-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {wateringLabel(days)}
                    </p>
                    <WaterBar plant={plant} className="mt-2" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
