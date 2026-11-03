"use client";

import Image from "next/image";
import { CircleAlert, CircleQuestionMark, TriangleAlert } from "lucide-react";
import { cn } from "cn";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhotoSlot } from "@/components/photo/photo-slot";
import { ErrorPanel, LoadingPanel } from "@/components/flow/status-panels";
import type { PlantIdentification } from "@/components/identify/use-plant-identification";
import { MAX_UPLOAD_SIZE_MB } from "@/lib/validation";

const LOW_CONFIDENCE = 0.3;

/**
 * Muestra el paso correspondiente de la identificación: captura de la foto,
 * carga, error o la planta reconocida con sus coincidencias alternativas.
 */
export function IdentificationPanel({
  identification,
  action,
}: {
  identification: PlantIdentification;
  action?: React.ReactNode;
}) {
  const { photo, photoError, identify, selected, candidate } = identification;

  if (identify.status === "idle") {
    return (
      <div className="mx-auto max-w-md">
        <PhotoSlot
          title="Toma o sube una foto"
          hint="Una sola planta, con buena luz y bien enfocada"
          photo={null}
          featured
          onSelect={identification.selectPhoto}
          onRemove={identification.reset}
          className="sm:aspect-4/3"
        />
        {photoError && (
          <Alert variant="destructive" className="mt-3">
            <CircleAlert aria-hidden />
            <AlertDescription>{photoError}</AlertDescription>
          </Alert>
        )}
        <p className="mt-3 text-center text-xs text-muted-foreground">
          JPG, PNG o WebP, hasta {MAX_UPLOAD_SIZE_MB} MB.
        </p>
      </div>
    );
  }

  if (identify.status === "loading") {
    return (
      <LoadingPanel
        photoUrl={photo?.url}
        title="Identificando tu planta…"
        description="Comparamos tu foto con imágenes de referencia de Pl@ntNet."
      />
    );
  }

  if (identify.status === "error") {
    return (
      <ErrorPanel message={identify.error} onRetry={identification.retry}>
        <Button variant="outline" onClick={identification.reset}>
          Usar otra foto
        </Button>
      </ErrorPanel>
    );
  }

  if (!candidate || !photo) {
    return (
      <div className="space-y-3">
        <Alert>
          <CircleQuestionMark aria-hidden />
          <AlertTitle>No reconocimos la planta</AlertTitle>
          <AlertDescription>
            Prueba con otra foto donde se vea la planta completa y con luz
            natural.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={identification.reset}>
          Usar otra foto
        </Button>
      </div>
    );
  }

  const candidates = identify.candidates;
  const [commonName, ...otherNames] = candidate.commonNames;
  const percent =
    candidate.score === null ? null : Math.round(candidate.score * 100);
  const lowConfidence = (candidate.score ?? 0) < LOW_CONFIDENCE;

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm duration-500 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 sm:flex">
      <div className="relative aspect-4/3 sm:aspect-auto sm:w-64 sm:shrink-0">
        <Image
          src={photo.url}
          alt={commonName ?? candidate.scientificName}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        <div>
          {percent !== null && (
            <Badge variant="secondary">{percent} % de similitud</Badge>
          )}
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {commonName ?? candidate.scientificName}
          </h2>
          <p className="text-muted-foreground">
            <i>{candidate.scientificName}</i>
            {otherNames.length > 0 && ` · ${otherNames.join(", ")}`}
          </p>
        </div>

        {lowConfidence && (
          <p className="flex gap-2 rounded-lg bg-warning p-2.5 text-sm text-warning-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            Coincidencia baja: compara con tu planta antes de seguir sus
            cuidados.
          </p>
        )}

        {candidates.length > 1 && (
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">
              ¿No es esta? Otras coincidencias:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {candidates.map((c, i) => (
                <button
                  key={c.scientificName}
                  type="button"
                  aria-pressed={i === selected}
                  onClick={() => identification.choose(i)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    i === selected
                      ? "border-primary bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {c.commonNames[0] ?? c.scientificName}
                  {c.score !== null && (
                    <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                      {Math.round(c.score * 100)} %
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {action}
      </div>
    </div>
  );
}
