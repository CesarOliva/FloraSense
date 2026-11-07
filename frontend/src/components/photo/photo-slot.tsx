"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImagePlus, X } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/validation";

export type Photo = { file: File; url: string };

export function PhotoSlot({
  title,
  hint,
  photo,
  featured,
  onSelect,
  onRemove,
  className,
  selectionContent,
  onRequestSelect,
}: {
  title: string;
  hint: string;
  photo: Photo | null;
  featured: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
  className?: string;
  selectionContent?: React.ReactNode;
  onRequestSelect?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function pick(files: FileList | null) {
    const file = files?.[0];
    if (file) onSelect(file);
  }

  const frame = cn(
    "relative aspect-4/3 overflow-hidden rounded-xl sm:aspect-4/5",
    className
  );

  return (
    <div className={frame}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />

      {photo ? (
        <>
          <Image
            src={photo.url}
            alt={title}
            fill
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-black/70 to-transparent p-3 pt-10 text-white">
            <span className="text-sm font-medium">{title}</span>
            <Button
              size="xs"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              Cambiar
            </Button>
          </div>
          <Button
            size="icon-sm"
            variant="secondary"
            className="absolute top-2 right-2 rounded-full"
            onClick={onRemove}
            aria-label={`Quitar foto: ${title}`}
          >
            <X aria-hidden />
          </Button>
        </>
      ) : (
        selectionContent ?? (
        <button
          type="button"
          onClick={() => {
            if (onRequestSelect) onRequestSelect();
            else inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files);
          }}
          className={cn(
            "flex size-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-card p-3 text-center transition-colors outline-none hover:border-primary/60 hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/50",
            dragging && "border-primary bg-accent/60"
          )}
        >
          <span
            className={cn(
              "flex items-center justify-center rounded-full bg-accent text-accent-foreground",
              featured ? "size-12" : "size-10"
            )}
          >
            {featured ? (
              <Camera className="size-5" aria-hidden />
            ) : (
              <ImagePlus className="size-4.5" aria-hidden />
            )}
          </span>
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </button>
        )
      )}
    </div>
  );
}
