"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CircleQuestionMark,
  PenLine,
  TriangleAlert,
} from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ErrorPanel,
  LoadingPanel,
  StepHeader,
} from "@/components/flow/status-panels";
import type { SpeciesCandidate } from "@/lib/types";

/** Puntuación por debajo de la cual pedimos al usuario que confirme con cuidado. */
const LOW_CONFIDENCE = 0.3;

const optionClass =
  "flex w-full items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors outline-none hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-primary data-checked:bg-accent/60";

function RadioDot() {
  return (
    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-background group-data-[state=checked]:border-primary">
      <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-primary" />
    </span>
  );
}

type SpeciesStepProps = {
  status: "loading" | "error" | "success";
  photoUrl?: string;
  candidates: SpeciesCandidate[];
  error: string | null;
  selection: string;
  manualName: string;
  onSelectionChange: (value: string) => void;
  onManualNameChange: (value: string) => void;
  onRetry: () => void;
  onBack: () => void;
  onContinue: () => void;
};

export function SpeciesStep({
  status,
  photoUrl,
  candidates,
  error,
  selection,
  manualName,
  onSelectionChange,
  onManualNameChange,
  onRetry,
  onBack,
  onContinue,
}: SpeciesStepProps) {
  const header = (
    <StepHeader
      title="¿Es esta tu planta?"
      description="Confirma la especie o corrígela. Así las recomendaciones serán más precisas."
    />
  );

  if (status === "loading") {
    return (
      <section>
        {header}
        <LoadingPanel
          photoUrl={photoUrl}
          title="Identificando tu planta…"
          description="Comparamos tus fotos con miles de imágenes de referencia de Pl@ntNet."
        />
      </section>
    );
  }

  if (status === "error") {
    return (
      <section>
        {header}
        <ErrorPanel message={error ?? "No pudimos identificar la planta."} onRetry={onRetry}>
          <Button variant="outline" onClick={onBack}>
            Cambiar fotos
          </Button>
        </ErrorPanel>
      </section>
    );
  }

  const topScore = candidates[0]?.score ?? 0;
  const canContinue =
    selection !== "" && (selection !== "manual" || manualName.trim() !== "");

  return (
    <section>
      {header}

      {candidates.length === 0 ? (
        <Alert className="mb-4">
          <CircleQuestionMark aria-hidden />
          <AlertTitle>No encontramos coincidencias fiables</AlertTitle>
          <AlertDescription>
            Escribe el nombre si lo conoces o continúa con recomendaciones
            generales. También puedes probar con otra foto más nítida.
          </AlertDescription>
        </Alert>
      ) : (
        topScore < LOW_CONFIDENCE && (
          <Alert className="mb-4 border-warning-foreground/30 bg-warning text-warning-foreground">
            <TriangleAlert aria-hidden />
            <AlertTitle>Coincidencia baja</AlertTitle>
            <AlertDescription className="text-warning-foreground/90">
              Compara con cuidado antes de confirmar. Una foto de la planta
              completa con buena luz suele mejorar el resultado.
            </AlertDescription>
          </Alert>
        )
      )}

      <RadioGroupPrimitive.Root
        aria-label="Especie de la planta"
        value={selection}
        onValueChange={onSelectionChange}
        className="grid gap-2.5"
      >
        {candidates.map((candidate, i) => {
          const [commonName, ...otherNames] = candidate.commonNames;
          const percent =
            candidate.score === null ? null : Math.round(candidate.score * 100);
          return (
            <RadioGroupPrimitive.Item
              key={candidate.scientificName}
              value={`candidate-${i}`}
              className={`group ${optionClass}`}
            >
              <RadioDot />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium">
                    {commonName ?? candidate.scientificName}
                  </span>
                  {i === 0 && <Badge>Más probable</Badge>}
                  {candidate.catalogId && (
                    <Badge variant="secondary">
                      <BookOpen aria-hidden />
                      Ficha de cuidados
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  <i>{candidate.scientificName}</i>
                  {otherNames.length > 0 && ` · ${otherNames.join(", ")}`}
                </p>
                {percent !== null && (
                  <div className="mt-3 flex items-center gap-3">
                    <Progress
                      value={percent}
                      className="h-1.5 max-w-48"
                      aria-label="Similitud"
                    />
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {percent} % de similitud
                    </span>
                  </div>
                )}
              </div>
            </RadioGroupPrimitive.Item>
          );
        })}

        <RadioGroupPrimitive.Item value="manual" className={`group ${optionClass}`}>
          <RadioDot />
          <div className="flex-1">
            <span className="flex items-center gap-2 font-medium">
              <PenLine className="size-4" aria-hidden />
              Es otra planta
            </span>
            <p className="text-sm text-muted-foreground">
              Escribe su nombre común o científico.
            </p>
          </div>
        </RadioGroupPrimitive.Item>
        {selection === "manual" && (
          <Input
            autoFocus
            aria-label="Nombre de la planta"
            placeholder="Ej. Ficus lyrata, Potus…"
            value={manualName}
            onChange={(e) => onManualNameChange(e.target.value)}
            className="h-10"
          />
        )}

        <RadioGroupPrimitive.Item value="unknown" className={`group ${optionClass}`}>
          <RadioDot />
          <div className="flex-1">
            <span className="flex items-center gap-2 font-medium">
              <CircleQuestionMark className="size-4" aria-hidden />
              No lo sé
            </span>
            <p className="text-sm text-muted-foreground">
              Continuar con recomendaciones generales (provisionales).
            </p>
          </div>
        </RadioGroupPrimitive.Item>
      </RadioGroupPrimitive.Root>

      {candidates.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          La similitud indica cuánto se parecen tus fotos a imágenes de
          referencia de Pl@ntNet; no es una certeza.
        </p>
      )}

      <div className="mt-8 flex justify-between gap-3">
        <Button variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft data-icon="inline-start" aria-hidden />
          Atrás
        </Button>
        <Button size="lg" disabled={!canContinue} onClick={onContinue}>
          Continuar
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </div>
    </section>
  );
}
