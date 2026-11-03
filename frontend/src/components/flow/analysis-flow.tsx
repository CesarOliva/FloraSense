"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ContextStep } from "@/components/flow/context-step";
import { PhotoStep } from "@/components/flow/photo-step";
import type { Photo } from "@/components/photo/photo-slot";
import { SpeciesStep } from "@/components/flow/species-step";
import { ErrorPanel, LoadingPanel } from "@/components/flow/status-panels";
import { StepIndicator } from "@/components/flow/step-indicator";
import type { SegmentationState } from "@/components/results/plant-viewer";
import { ResultsView } from "@/components/results/results-view";
import {
  analyzePlant,
  ApiError,
  identifyPlant,
  segmentPlant,
} from "@/lib/api";
import type {
  AnalysisResult,
  EnvironmentContext,
  SelectedSpecies,
  SpeciesCandidate,
} from "@/lib/types";
import { validateImage } from "@/lib/validation";

type Step = 0 | 1 | 2 | 3;

type IdentifyState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; candidates: SpeciesCandidate[] };

type AnalysisState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; result: AnalysisResult };

const EMPTY_PHOTOS: (Photo | null)[] = [null, null, null];

const EMPTY_CONTEXT: EnvironmentContext = {
  locationType: "unknown",
  light: "unknown",
  lastWatered: "unknown",
  hasDrainage: "unknown",
};

function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

export function AnalysisFlow() {
  const [step, setStep] = useState<Step>(0);
  const [photos, setPhotos] = useState(EMPTY_PHOTOS);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [identify, setIdentify] = useState<IdentifyState | null>(null);
  const [selection, setSelection] = useState("");
  const [manualName, setManualName] = useState("");
  const [context, setContext] = useState(EMPTY_CONTEXT);
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [segmentation, setSegmentation] = useState<SegmentationState>({
    status: "idle",
  });
  // Permite descartar respuestas que llegan después de reiniciar el flujo.
  const requestId = useRef(0);

  const selectedPhotos = photos.filter((p): p is Photo => p !== null);
  const files = selectedPhotos.map((p) => p.file);

  function goTo(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelectPhoto(index: number, file: File) {
    const error = validateImage(file);
    if (error) {
      setPhotoError(error);
      return;
    }
    const previous = photos[index];
    if (previous) URL.revokeObjectURL(previous.url);
    setPhotos(
      photos.map((p, i) =>
        i === index ? { file, url: URL.createObjectURL(file) } : p
      )
    );
    setPhotoError(null);
    setIdentify(null);
  }

  function handleRemovePhoto(index: number) {
    const previous = photos[index];
    if (previous) URL.revokeObjectURL(previous.url);
    setPhotos(photos.map((p, i) => (i === index ? null : p)));
    setIdentify(null);
  }

  async function runIdentify() {
    const id = ++requestId.current;
    setIdentify({ status: "loading" });
    goTo(1);
    try {
      const { candidates } = await identifyPlant(files);
      if (id !== requestId.current) return;
      setIdentify({ status: "success", candidates });
      setSelection(candidates.length > 0 ? "candidate-0" : "");
      setManualName("");
    } catch (error) {
      if (id !== requestId.current) return;
      setIdentify({ status: "error", error: errorMessage(error) });
    }
  }

  function selectedSpecies(): SelectedSpecies {
    if (selection.startsWith("candidate-") && identify?.status === "success") {
      const candidate =
        identify.candidates[Number(selection.slice("candidate-".length))];
      return {
        scientificName: candidate.scientificName,
        commonName: candidate.commonNames[0],
        confirmed: true,
        catalogId: candidate.catalogId,
      };
    }
    if (selection === "manual") {
      return { scientificName: manualName.trim(), confirmed: true };
    }
    return { scientificName: "", confirmed: false };
  }

  async function runSegmentation(id: number) {
    setSegmentation({ status: "loading" });
    try {
      const result = await segmentPlant(files[0]);
      if (id === requestId.current) setSegmentation({ status: "success", result });
    } catch {
      if (id === requestId.current) setSegmentation({ status: "error" });
    }
  }

  async function runAnalyze() {
    const id = ++requestId.current;
    setAnalysis({ status: "loading" });
    setSegmentation({ status: "idle" });
    goTo(3);

    let result: AnalysisResult;
    try {
      result = await analyzePlant(files, selectedSpecies(), context);
    } catch (error) {
      if (id === requestId.current) {
        setAnalysis({ status: "error", error: errorMessage(error) });
      }
      return;
    }
    if (id !== requestId.current) return;
    setAnalysis({ status: "success", result });

    // La segmentación es opcional: si el análisis no la trae, se pide aparte
    // y su fallo nunca bloquea los resultados.
    if (result.segmentation) {
      setSegmentation({ status: "success", result: result.segmentation });
    } else {
      void runSegmentation(id);
    }
  }

  function restart() {
    requestId.current++;
    for (const photo of photos) if (photo) URL.revokeObjectURL(photo.url);
    setPhotos(EMPTY_PHOTOS);
    setPhotoError(null);
    setIdentify(null);
    setSelection("");
    setManualName("");
    setContext(EMPTY_CONTEXT);
    setAnalysis(null);
    setSegmentation({ status: "idle" });
    goTo(0);
  }

  return (
    <div>
      <StepIndicator current={step} />

      {step === 0 && (
        <PhotoStep
          photos={photos}
          error={photoError}
          onSelect={handleSelectPhoto}
          onRemove={handleRemovePhoto}
          onContinue={() =>
            identify?.status === "success" ? goTo(1) : runIdentify()
          }
        />
      )}

      {step === 1 && identify && (
        <SpeciesStep
          status={identify.status}
          photoUrl={selectedPhotos[0]?.url}
          candidates={identify.status === "success" ? identify.candidates : []}
          error={identify.status === "error" ? identify.error : null}
          selection={selection}
          manualName={manualName}
          onSelectionChange={setSelection}
          onManualNameChange={setManualName}
          onRetry={runIdentify}
          onBack={() => goTo(0)}
          onContinue={() => goTo(2)}
        />
      )}

      {step === 2 && (
        <ContextStep
          context={context}
          onChange={setContext}
          onBack={() => goTo(1)}
          onContinue={runAnalyze}
        />
      )}

      {step === 3 && analysis?.status === "loading" && (
        <LoadingPanel
          photoUrl={selectedPhotos[0]?.url}
          title="Analizando tu planta…"
          description="Revisamos el entorno, buscamos síntomas visibles y preparamos recomendaciones. Puede tardar hasta un minuto."
        />
      )}
      {step === 3 && analysis?.status === "error" && (
        <ErrorPanel message={analysis.error} onRetry={runAnalyze}>
          <Button variant="outline" onClick={() => goTo(2)}>
            Revisar datos
          </Button>
        </ErrorPanel>
      )}
      {step === 3 && analysis?.status === "success" && (
        <ResultsView
          result={analysis.result}
          photos={selectedPhotos}
          context={context}
          segmentation={segmentation}
          onRestart={restart}
        />
      )}
    </div>
  );
}
