"use client";

import { ArrowRight, CircleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StepHeader } from "@/components/flow/status-panels";
import { PhotoSlot, type Photo } from "@/components/photo/photo-slot";
import { MAX_UPLOAD_SIZE_MB } from "@/lib/validation";

const SLOTS = [
  { title: "Planta completa", hint: "Toda la planta con su maceta" },
  { title: "Hoja de cerca", hint: "Opcional · una hoja bien enfocada" },
  { title: "Zona afectada", hint: "Opcional · manchas, bordes secos…" },
];

type PhotoStepProps = {
  photos: (Photo | null)[];
  error: string | null;
  onSelect: (index: number, file: File) => void;
  onRemove: (index: number) => void;
  onContinue: () => void;
};

export function PhotoStep({
  photos,
  error,
  onSelect,
  onRemove,
  onContinue,
}: PhotoStepProps) {
  const hasPhoto = photos.some(Boolean);

  return (
    <section>
      <StepHeader
        title="Fotografía tu planta"
        description="Sube de 1 a 3 fotos de la misma planta. La identificaremos y te diremos cómo cuidarla."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SLOTS.map((slot, i) => (
          <PhotoSlot
            key={slot.title}
            title={slot.title}
            hint={slot.hint}
            photo={photos[i]}
            featured={i === 0}
            className={i === 0 ? "col-span-2 sm:col-span-1" : undefined}
            onSelect={(file) => onSelect(i, file)}
            onRemove={() => onRemove(i)}
          />
        ))}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <CircleAlert aria-hidden />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ul className="mt-6 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-3">
        <li>• Usa luz natural y evita el flash.</li>
        <li>• Encuadra una sola planta con fondo despejado.</li>
        <li>
          • JPG, PNG o WebP, hasta {MAX_UPLOAD_SIZE_MB} MB por foto.
        </li>
      </ul>

      <div className="mt-8 flex justify-end">
        <Button size="lg" disabled={!hasPhoto} onClick={onContinue}>
          Identificar planta
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </div>
    </section>
  );
}
