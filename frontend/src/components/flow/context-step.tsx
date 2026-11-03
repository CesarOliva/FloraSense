"use client";

import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  CircleQuestionMark,
  Cloud,
  House,
  Sun,
  SunDim,
  Trees,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChoiceGroup } from "@/components/flow/choice-group";
import { StepHeader } from "@/components/flow/status-panels";
import {
  drainageLabels,
  lastWateredLabels,
  lightLabels,
  locationLabels,
} from "@/lib/labels";
import type {
  Drainage,
  EnvironmentContext,
  LastWatered,
  LightLevel,
  LocationType,
} from "@/lib/types";

type ContextStepProps = {
  context: EnvironmentContext;
  onChange: (context: EnvironmentContext) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function ContextStep({
  context,
  onChange,
  onBack,
  onContinue,
}: ContextStepProps) {
  function set<K extends keyof EnvironmentContext>(
    key: K,
    value: EnvironmentContext[K]
  ) {
    onChange({ ...context, [key]: value });
  }

  return (
    <section>
      <StepHeader
        title="Cuéntanos dónde vive"
        description="La foto no muestra todo. Estos datos nos ayudan a ajustar el riego y la ubicación."
      />

      <div className="space-y-7 rounded-xl border bg-card p-4 sm:p-6">
        <ChoiceGroup<LocationType>
          label="¿Dónde está la planta?"
          value={context.locationType}
          onValueChange={(v) => set("locationType", v)}
          className="sm:grid-cols-3"
          choices={[
            { value: "indoor", label: locationLabels.indoor, icon: House },
            { value: "outdoor", label: locationLabels.outdoor, icon: Trees },
            {
              value: "unknown",
              label: locationLabels.unknown,
              icon: CircleQuestionMark,
            },
          ]}
        />
        <Separator />
        <ChoiceGroup<LightLevel>
          label="¿Cuánta luz recibe?"
          value={context.light}
          onValueChange={(v) => set("light", v)}
          choices={[
            { value: "direct", label: lightLabels.direct, icon: Sun },
            { value: "indirect", label: lightLabels.indirect, icon: SunDim },
            { value: "low", label: lightLabels.low, icon: Cloud },
            {
              value: "unknown",
              label: lightLabels.unknown,
              icon: CircleQuestionMark,
            },
          ]}
        />
        <Separator />
        <ChoiceGroup<LastWatered>
          label="¿Cuándo la regaste por última vez?"
          value={context.lastWatered}
          onValueChange={(v) => set("lastWatered", v)}
          className="sm:grid-cols-3"
          choices={(
            Object.keys(lastWateredLabels) as LastWatered[]
          ).map((value) => ({ value, label: lastWateredLabels[value] }))}
        />
        <Separator />
        <ChoiceGroup<Drainage>
          label="¿La maceta tiene agujeros de drenaje?"
          value={context.hasDrainage}
          onValueChange={(v) => set("hasDrainage", v)}
          className="sm:grid-cols-3"
          choices={[
            { value: "yes", label: drainageLabels.yes, icon: CircleCheck },
            { value: "no", label: drainageLabels.no, icon: X },
            {
              value: "unknown",
              label: drainageLabels.unknown,
              icon: CircleQuestionMark,
            },
          ]}
        />
        <Separator />
        <div className="max-w-sm space-y-2">
          <Label htmlFor="city">
            Ciudad <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="city"
            placeholder="Nombre de tu ciudad"
            value={context.city ?? ""}
            onChange={(e) => set("city", e.target.value || undefined)}
            autoComplete="address-level2"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <Button variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft data-icon="inline-start" aria-hidden />
          Atrás
        </Button>
        <Button size="lg" onClick={onContinue}>
          Analizar planta
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </div>
    </section>
  );
}
