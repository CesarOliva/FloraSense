import Image from "next/image";
import { CircleAlert, RotateCcw, Sprout } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

const SCANNER_CORNERS = [
  "top-3 left-3 rounded-tl-lg border-t-3 border-l-3",
  "top-3 right-3 rounded-tr-lg border-t-3 border-r-3",
  "bottom-3 left-3 rounded-bl-lg border-b-3 border-l-3",
  "right-3 bottom-3 rounded-br-lg border-r-3 border-b-3",
];

/** Estado de carga; con `photoUrl` muestra la foto con un efecto de escáner. */
export function LoadingPanel({
  title,
  description,
  photoUrl,
}: {
  title: string;
  description?: string;
  photoUrl?: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-3xl border bg-card px-6 py-10 text-center shadow-sm"
      role="status"
    >
      {photoUrl ? (
        <div className="relative mb-2 aspect-4/3 w-full max-w-sm overflow-hidden rounded-2xl bg-muted">
          <Image src={photoUrl} alt="" fill unoptimized className="object-cover" />
          <div className="absolute inset-0 bg-hero/20" />
          <div className="absolute inset-x-0 h-20 -translate-y-1/2 bg-linear-to-b from-transparent via-white/45 to-transparent motion-safe:animate-scan" />
          <div className="absolute inset-x-0 h-0.5 -translate-y-1/2 bg-white shadow-[0_0_14px_3px_rgb(167_243_208)] motion-safe:animate-scan" />
          {SCANNER_CORNERS.map((corner) => (
            <span key={corner} className={cn("absolute size-7 border-white", corner)} />
          ))}
        </div>
      ) : (
        <span className="flex size-16 items-center justify-center rounded-full bg-identify text-identify-foreground">
          <Sprout className="size-8 motion-safe:animate-bounce" aria-hidden />
        </span>
      )}
      <p className="font-heading text-lg font-semibold">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function ErrorPanel({
  message,
  onRetry,
  children,
}: {
  message: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-3xl border border-destructive/30 bg-card px-6 py-12 text-center"
      role="alert"
    >
      <CircleAlert className="size-8 text-destructive" aria-hidden />
      <p className="max-w-sm font-medium">{message}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {children}
        {onRetry && (
          <Button onClick={onRetry}>
            <RotateCcw data-icon="inline-start" aria-hidden />
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}

export function StepHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <p className="mt-1.5 text-muted-foreground">{description}</p>
    </div>
  );
}
