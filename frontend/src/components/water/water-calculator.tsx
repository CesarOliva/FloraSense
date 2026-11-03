"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Camera,
  CircleCheck,
  Cloud,
  Droplets,
  House,
  Leaf,
  Snowflake,
  Sun,
  SunDim,
  ThermometerSun,
  Trees,
  X,
} from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChoiceGroup } from "@/components/flow/choice-group";
import { IdentificationPanel } from "@/components/identify/identification-panel";
import { usePlantIdentification } from "@/components/identify/use-plant-identification";
import { PlantThumb } from "@/components/plants/plant-thumb";
import { makeThumbnail } from "@/lib/image";
import {
  addPlant,
  plantName,
  updatePlant,
  useSavedPlants,
} from "@/lib/plants-store";
import type { PlantProfile, WaterNeeds } from "@/lib/types";
import {
  estimateWatering,
  formatAmount,
  formatInterval,
  type Season,
  type WaterLight,
} from "@/lib/water";

type Source = "saved" | "photo";

type ChosenPlant = {
  key: string;
  name: string;
  profile: PlantProfile | null;
  savedId?: string;
};

const POT_SIZES = [10, 12, 15, 20, 25, 30, 40];

const waterNeedsChoices = [
  { value: "low" as const, label: "Poca (suculentas, cactus)" },
  { value: "medium" as const, label: "Media (la mayoría de interior)" },
  { value: "high" as const, label: "Alta (helechos, calatheas)" },
];

export function WaterCalculator() {
  const plants = useSavedPlants();
  const identification = usePlantIdentification();
  const [sourceChoice, setSourceChoice] = useState<Source | null>(null);
  const [savedId, setSavedId] = useState("");

  const [potDiameter, setPotDiameter] = useState(15);
  const [potText, setPotText] = useState("15");
  const [needsOverride, setNeedsOverride] = useState<{
    key: string;
    value: WaterNeeds;
  } | null>(null);
  const [location, setLocation] = useState<"indoor" | "outdoor">("indoor");
  const [light, setLight] = useState<WaterLight>("indirect");
  const [season, setSeason] = useState<Season>("mild");
  const [drainage, setDrainage] = useState<"yes" | "no">("yes");
  const [savedState, setSavedState] = useState<{
    signature: string;
    message: string;
  } | null>(null);

  const source: Source = sourceChoice ?? (plants.length > 0 ? "saved" : "photo");

  let chosen: ChosenPlant | null = null;
  if (source === "saved") {
    const plant = plants.find((p) => p.id === savedId);
    if (plant) {
      chosen = {
        key: plant.id,
        name: plantName(plant),
        profile: plant.profile,
        savedId: plant.id,
      };
    }
  } else if (
    identification.candidate &&
    identification.profileState?.status !== "loading"
  ) {
    const { candidate, profileState } = identification;
    chosen = {
      key: candidate.scientificName,
      name: candidate.commonNames[0] ?? candidate.scientificName,
      profile: profileState?.status === "success" ? profileState.profile : null,
    };
  }

  const waterNeeds =
    needsOverride && needsOverride.key === chosen?.key
      ? needsOverride.value
      : (chosen?.profile?.waterNeeds ?? "medium");

  const estimate = estimateWatering({
    potDiameterCm: potDiameter,
    waterNeeds,
    location,
    light,
    season,
    hasDrainage: drainage === "yes",
  });
  const signatureFor = (key: string) =>
    `${key}|${estimate.amountMl}|${estimate.intervalDays}`;
  const savedMessage =
    chosen && savedState?.signature === signatureFor(chosen.key)
      ? savedState.message
      : null;

  async function handleSave() {
    if (!chosen) return;
    if (chosen.savedId) {
      updatePlant(chosen.savedId, {
        wateringIntervalDays: estimate.intervalDays,
        waterAmountMl: estimate.amountMl,
      });
      setSavedState({
        signature: signatureFor(chosen.key),
        message: "Recordatorio actualizado",
      });
    } else if (identification.candidate && identification.photo) {
      const { candidate, photo } = identification;
      const plant = addPlant({
        scientificName: candidate.scientificName,
        commonName: candidate.commonNames[0],
        catalogId: candidate.catalogId,
        profile: chosen.profile,
        photo: await makeThumbnail(photo.file),
        wateringIntervalDays: estimate.intervalDays,
        waterAmountMl: estimate.amountMl,
      });
      // A partir de aquí la planta ya es de "Mis plantas": seguir editándola
      // actualiza su recordatorio en vez de agregarla otra vez.
      setSourceChoice("saved");
      setSavedId(plant.id);
      setNeedsOverride({ key: plant.id, value: waterNeeds });
      setSavedState({
        signature: signatureFor(plant.id),
        message: "Agregada a tus plantas",
      });
    }
  }

  return (
    <section>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Elige la planta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="inline-flex rounded-lg border p-0.5" role="group">
              {[
                { value: "saved" as const, label: `Mis plantas (${plants.length})`, icon: Leaf },
                { value: "photo" as const, label: "Foto nueva", icon: Camera },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={source === value}
                  onClick={() => setSourceChoice(value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    source === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </button>
              ))}
            </div>

            {source === "saved" &&
              (plants.length === 0 ? (
                <p className="text-muted-foreground">
                  Aún no tienes plantas agregadas.{" "}
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    onClick={() => setSourceChoice("photo")}
                  >
                    Usa una foto nueva
                  </button>{" "}
                  o agrégalas desde{" "}
                  <Link
                    href="/identificar"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Identificar
                  </Link>
                  .
                </p>
              ) : (
                <RadioGroupPrimitive.Root
                  aria-label="Tus plantas"
                  value={savedId}
                  onValueChange={setSavedId}
                  className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {plants.map((plant) => (
                    <RadioGroupPrimitive.Item
                      key={plant.id}
                      value={plant.id}
                      className="flex items-center gap-3 rounded-lg border bg-card p-2.5 text-left transition-colors outline-none hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-primary data-checked:bg-accent"
                    >
                      <PlantThumb src={plant.photo} alt="" className="size-12" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {plantName(plant)}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground italic">
                          {plant.scientificName}
                        </span>
                      </span>
                    </RadioGroupPrimitive.Item>
                  ))}
                </RadioGroupPrimitive.Root>
              ))}

            {source === "photo" && (
              <IdentificationPanel identification={identification} />
            )}
          </CardContent>
        </Card>

        {chosen && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  2. Cuéntanos de su maceta y su lugar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-7">
                <fieldset>
                  <legend className="mb-2.5 text-sm font-medium">
                    Diámetro de la maceta (por arriba)
                  </legend>
                  <div className="flex flex-wrap items-center gap-2">
                    {POT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        aria-pressed={potDiameter === size}
                        onClick={() => {
                          setPotDiameter(size);
                          setPotText(String(size));
                        }}
                        className={cn(
                          "h-9 rounded-lg border px-3 text-sm tabular-nums outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          potDiameter === size
                            ? "border-primary bg-accent text-accent-foreground"
                            : "bg-card hover:bg-accent/40"
                        )}
                      >
                        {size} cm
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="pot-size" className="sr-only">
                        Otro diámetro en centímetros
                      </Label>
                      <Input
                        id="pot-size"
                        type="number"
                        inputMode="numeric"
                        min={5}
                        max={80}
                        value={potText}
                        onChange={(e) => {
                          setPotText(e.target.value);
                          const value = Number(e.target.value);
                          if (value >= 5 && value <= 80) setPotDiameter(value);
                        }}
                        className="h-9 w-20"
                      />
                      <span className="text-sm text-muted-foreground">cm</span>
                    </div>
                  </div>
                </fieldset>
                <Separator />
                <ChoiceGroup<WaterNeeds>
                  label={
                    chosen.profile
                      ? "Necesidad de agua (según su ficha)"
                      : "Necesidad de agua"
                  }
                  value={waterNeeds}
                  onValueChange={(value) =>
                    setNeedsOverride({ key: chosen.key, value })
                  }
                  className="grid-cols-1 sm:grid-cols-3"
                  choices={waterNeedsChoices}
                />
                <Separator />
                <ChoiceGroup<"indoor" | "outdoor">
                  label="¿Dónde está?"
                  value={location}
                  onValueChange={setLocation}
                  choices={[
                    { value: "indoor", label: "Interior", icon: House },
                    { value: "outdoor", label: "Exterior", icon: Trees },
                  ]}
                />
                <Separator />
                <ChoiceGroup<WaterLight>
                  label="¿Cuánta luz recibe?"
                  value={light}
                  onValueChange={setLight}
                  className="sm:grid-cols-3"
                  choices={[
                    { value: "direct", label: "Sol directo", icon: Sun },
                    { value: "indirect", label: "Luz indirecta", icon: SunDim },
                    { value: "low", label: "Poca luz", icon: Cloud },
                  ]}
                />
                <Separator />
                <ChoiceGroup<Season>
                  label="¿Qué época del año es?"
                  value={season}
                  onValueChange={setSeason}
                  className="sm:grid-cols-3"
                  choices={[
                    { value: "warm", label: "Cálida", icon: ThermometerSun },
                    { value: "mild", label: "Templada", icon: Leaf },
                    { value: "cold", label: "Fría", icon: Snowflake },
                  ]}
                />
                <Separator />
                <ChoiceGroup<"yes" | "no">
                  label="¿La maceta tiene agujeros de drenaje?"
                  value={drainage}
                  onValueChange={setDrainage}
                  choices={[
                    { value: "yes", label: "Sí", icon: CircleCheck },
                    { value: "no", label: "No", icon: X },
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="ring-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Droplets className="size-5 text-primary" aria-hidden />
                  Riego recomendado para {chosen.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-accent p-4 text-accent-foreground">
                    <p className="text-xs opacity-80">Cantidad por riego</p>
                    <p className="mt-1 text-3xl font-semibold tabular-nums">
                      ≈ {formatAmount(estimate.amountMl)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-accent p-4 text-accent-foreground">
                    <p className="text-xs opacity-80">Frecuencia</p>
                    <p className="mt-1 text-3xl font-semibold">
                      {formatInterval(estimate.intervalRange)}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {estimate.tips.map((tip) => (
                    <li key={tip} className="flex gap-2.5">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {tip}
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-muted-foreground">
                  Es una estimación orientativa según el tamaño de la maceta y
                  las condiciones que indicaste; la tierra de cada casa se seca
                  a un ritmo distinto.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {savedMessage ? (
                    <>
                      <p className="text-sm font-medium text-primary">
                        {savedMessage}
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/recordatorios">Ver recordatorios</Link>
                      </Button>
                    </>
                  ) : (
                    <Button size="lg" onClick={handleSave}>
                      {chosen.savedId
                        ? "Usar en sus recordatorios"
                        : "Agregar a mis plantas con este riego"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </section>
  );
}
