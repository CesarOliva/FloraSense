"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, LoaderCircle, ScanSearch } from "lucide-react";
import { cn } from "cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Photo } from "@/components/photo/photo-slot";
import { resolveApiUrl } from "@/lib/api";
import type { SegmentationResult } from "@/lib/types";

export type SegmentationState =
  | { status: "idle" | "loading" | "error" }
  | { status: "success"; result: SegmentationResult };

export function PlantViewer({
  photos,
  observations,
  segmentation,
}: {
  photos: Photo[];
  observations: string[];
  segmentation: SegmentationState;
}) {
  const [selected, setSelected] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

  const overlayUrl =
    segmentation.status === "success" && segmentation.result.available
      ? segmentation.result.overlayUrl
      : undefined;
  // La segmentación se calcula sobre la primera foto.
  const displayOverlay = overlayUrl && selected === 0 && showOverlay;
  const src = displayOverlay ? resolveApiUrl(overlayUrl) : photos[selected].url;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="size-5 text-primary" aria-hidden />
          Cómo se ve tu planta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-muted">
          <Image
            src={src}
            alt={displayOverlay ? "Planta segmentada" : "Foto de tu planta"}
            fill
            unoptimized
            className="object-contain"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {photos.length > 1 &&
            photos.map((photo, i) => (
              <button
                key={photo.url}
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-pressed={selected === i}
                className={cn(
                  "relative size-14 overflow-hidden rounded-md ring-2 ring-transparent outline-none focus-visible:ring-ring",
                  selected === i && "ring-primary"
                )}
              >
                <Image src={photo.url} alt="" fill unoptimized className="object-cover" />
              </button>
            ))}

          {overlayUrl && selected === 0 && (
            <div className="ml-auto inline-flex rounded-lg border p-0.5 text-xs">
              {[
                { value: false, label: "Original" },
                { value: true, label: "Segmentada" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  aria-pressed={showOverlay === opt.value}
                  onClick={() => setShowOverlay(opt.value)}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium",
                    showOverlay === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <SegmentationNote segmentation={segmentation} />

        {observations.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-sm font-medium">
              Lo que observamos en la foto
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {observations.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SegmentationNote({ segmentation }: { segmentation: SegmentationState }) {
  const base = "flex items-start gap-2 text-xs text-muted-foreground";

  switch (segmentation.status) {
    case "idle":
      return null;
    case "loading":
      return (
        <p className={base} role="status">
          <LoaderCircle className="size-3.5 shrink-0 animate-spin" aria-hidden />
          Detectando y segmentando la planta (Grounding DINO + SAM 2)…
        </p>
      );
    case "error":
      return (
        <p className={base}>
          <ScanSearch className="size-3.5 shrink-0" aria-hidden />
          La segmentación no está disponible ahora. El resto del análisis no se
          ve afectado.
        </p>
      );
    case "success":
      return (
        <p className={base}>
          <ScanSearch className="size-3.5 shrink-0" aria-hidden />
          {segmentation.result.available
            ? segmentation.result.note ??
              "Zona de la planta detectada con Grounding DINO y segmentada con SAM 2."
            : segmentation.result.note ?? "Segmentación no disponible."}
        </p>
      );
  }
}
