import Image from "next/image";
import {
  BookX,
  Droplets,
  HeartPulse,
  Info,
  RotateCcw,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Photo } from "@/components/photo/photo-slot";
import { AddPlantButton } from "@/components/plants/add-plant-button";
import {
  CareProfile,
  CommonProblemsCard,
  PreventionCard,
} from "@/components/results/care-profile";
import { HealthPanel, healthStatusClass } from "@/components/results/health-panel";
import {
  PlantViewer,
  type SegmentationState,
} from "@/components/results/plant-viewer";
import { RecommendationsList } from "@/components/results/recommendations-list";
import {
  healthStatusLabels,
  locationLabels,
  sunExposureLabels,
} from "@/lib/labels";
import { makeThumbnail } from "@/lib/image";
import { daysAgoISO } from "@/lib/plants-store";
import type {
  AnalysisResult,
  EnvironmentContext,
  LastWatered,
  LocationType,
} from "@/lib/types";
import { BASE_INTERVAL_DAYS } from "@/lib/water";

// Días aproximados desde el último riego según la respuesta del formulario.
const LAST_WATERED_DAYS: Partial<Record<LastWatered, number>> = {
  today_yesterday: 0,
  "2_4_days": 3,
  "5_7_days": 6,
  over_7_days: 8,
};

function QuickFact({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg bg-secondary px-3 py-2.5", className)}>
      <p className="flex items-center gap-1.5 text-xs opacity-80">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

export function ResultsView({
  result,
  photos,
  context,
  segmentation,
  onRestart,
}: {
  result: AnalysisResult;
  photos: Photo[];
  context: EnvironmentContext;
  segmentation: SegmentationState;
  onRestart: () => void;
}) {
  const { species, plantProfile: profile, health } = result;
  const commonName = species.commonName ?? profile?.commonNames[0];
  const suggested = result.environment.suggestedLocationType as LocationType;
  const locationMismatch =
    context.locationType !== "unknown" &&
    suggested in locationLabels &&
    suggested !== "unknown" &&
    suggested !== context.locationType;

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm duration-500 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 sm:flex">
        <div className="relative aspect-4/3 sm:aspect-auto sm:w-64 sm:shrink-0">
          <Image
            src={photos[0].url}
            alt={commonName ?? species.scientificName}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {species.confirmed ? (
              <Badge variant="secondary">Especie confirmada</Badge>
            ) : (
              <Badge className="bg-warning text-warning-foreground">
                Provisional
              </Badge>
            )}
            {profile && <Badge variant="outline">{profile.family}</Badge>}
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {commonName ?? (species.scientificName || "Planta sin identificar")}
          </h2>
          {commonName && species.scientificName && (
            <p className="text-muted-foreground italic">
              {species.scientificName}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            {profile && (
              <QuickFact
                icon={Sun}
                label="Exposición"
                value={sunExposureLabels[profile.sunExposure]}
              />
            )}
            <QuickFact
              icon={HeartPulse}
              label="Salud"
              value={healthStatusLabels[health.status]}
              className={healthStatusClass[health.status]}
            />
            {profile && (
              <QuickFact
                icon={Droplets}
                label="Riego"
                value={
                  profile.watering.frequencyHint ?? profile.watering.criterion
                }
                className="col-span-2"
              />
            )}
          </div>

          {species.scientificName && (
            <div className="mt-4">
              <AddPlantButton
                plantKey={species.scientificName}
                buildPlant={async () => {
                  const daysAgo = LAST_WATERED_DAYS[context.lastWatered];
                  return {
                    scientificName: species.scientificName,
                    commonName,
                    catalogId: species.catalogId,
                    profile,
                    photo: await makeThumbnail(photos[0].file),
                    wateringIntervalDays:
                      BASE_INTERVAL_DAYS[profile?.waterNeeds ?? "medium"],
                    lastWateredAt:
                      daysAgo === undefined ? undefined : daysAgoISO(daysAgo),
                  };
                }}
              />
            </div>
          )}
        </div>
      </div>

      {!species.confirmed && (
        <Alert>
          <Info aria-hidden />
          <AlertTitle>Recomendaciones provisionales</AlertTitle>
          <AlertDescription>
            No se confirmó la especie, así que los consejos son generales.
            Puedes repetir el análisis con fotos más claras.
          </AlertDescription>
        </Alert>
      )}
      {!profile && (
        <Alert>
          <BookX aria-hidden />
          <AlertTitle>Sin ficha botánica para esta especie</AlertTitle>
          <AlertDescription>
            Aún no tenemos sus cuidados verificados en el catálogo. Las
            recomendaciones se basan en tu entorno y en lo observado en las
            fotos.
          </AlertDescription>
        </Alert>
      )}
      {locationMismatch && (
        <Alert>
          <Info aria-hidden />
          <AlertDescription>
            La foto parece de {locationLabels[suggested].toLowerCase()}, pero
            indicaste {locationLabels[context.locationType].toLowerCase()}.
            Usamos tu respuesta.
          </AlertDescription>
        </Alert>
      )}

      <div className={cn("grid gap-6", profile && "lg:grid-cols-5")}>
        <div className="space-y-6 lg:col-span-3">
          <HealthPanel health={health} />
          <RecommendationsList recommendations={result.recommendations} />
          <PlantViewer
            photos={photos}
            observations={result.environment.observations}
            segmentation={segmentation}
          />
        </div>
        {profile && (
          <div className="space-y-6 lg:col-span-2">
            <CareProfile profile={profile} />
            {profile.commonProblems && profile.commonProblems.length > 0 && (
              <CommonProblemsCard problems={profile.commonProblems} />
            )}
            {profile.prevention.length > 0 && (
              <PreventionCard tips={profile.prevention} />
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center pt-2">
        <Button size="lg" variant="outline" onClick={onRestart}>
          <RotateCcw data-icon="inline-start" aria-hidden />
          Analizar otra planta
        </Button>
      </div>
    </section>
  );
}
