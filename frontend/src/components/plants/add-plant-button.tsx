"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addPlant, type NewPlant } from "@/lib/plants-store";

/**
 * Botón "Agregar a mis plantas". `plantKey` identifica la planta mostrada:
 * si cambia (p. ej. el usuario elige otra coincidencia), el botón vuelve a
 * estar disponible.
 */
export function AddPlantButton({
  plantKey,
  buildPlant,
  disabled,
}: {
  plantKey: string;
  buildPlant: () => Promise<NewPlant>;
  disabled?: boolean;
}) {
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  if (addedKey === plantKey) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          <CircleCheck className="size-4" aria-hidden />
          Agregada a tus plantas
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/recordatorios">Ver recordatorios</Link>
        </Button>
      </div>
    );
  }

  async function handleAdd() {
    setAdding(true);
    addPlant(await buildPlant());
    setAddedKey(plantKey);
    setAdding(false);
  }

  return (
    <Button size="lg" onClick={handleAdd} disabled={disabled || adding}>
      <Plus data-icon="inline-start" aria-hidden />
      Agregar a mis plantas
    </Button>
  );
}
