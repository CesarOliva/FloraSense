import { cn } from "cn";

function ScaleLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </p>
  );
}

/** Escala por niveles: se rellenan los segmentos hasta `level` (1 = el primero). */
export function LevelScale({
  label,
  steps,
  level,
  fillClassName = "bg-primary",
}: {
  label: string;
  steps: readonly string[];
  level: number;
  fillClassName?: string;
}) {
  return (
    <div className="rounded-2xl bg-muted/70 p-3.5">
      <ScaleLabel>{label}</ScaleLabel>
      <div
        role="img"
        aria-label={`${label}: ${steps[level - 1]} (${level} de ${steps.length})`}
        className="flex gap-1.5"
      >
        {steps.map((step, i) => (
          <span
            key={step}
            className={cn(
              "h-2 flex-1 rounded-full",
              i < level ? fillClassName : "bg-border"
            )}
          />
        ))}
      </div>
      <div
        className="mt-1.5 flex gap-1.5 text-[11px] leading-tight text-muted-foreground"
        aria-hidden
      >
        {steps.map((step, i) => (
          <span
            key={step}
            className={cn(
              "flex-1",
              i === level - 1 && "font-semibold text-foreground"
            )}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Rango de temperatura ideal sobre una escala de 0 a 40 °C (o más si hace falta). */
export function TemperatureRange({ minC, maxC }: { minC: number; maxC: number }) {
  const low = Math.min(0, Math.floor((minC - 5) / 5) * 5);
  const high = Math.max(40, Math.ceil((maxC + 5) / 5) * 5);
  const at = (t: number) => ((t - low) / (high - low)) * 100;

  return (
    <div className="rounded-2xl bg-muted/70 p-3.5">
      <ScaleLabel>Rango ideal</ScaleLabel>
      <div className="relative h-4 text-xs font-semibold" aria-hidden>
        <span
          className="absolute -translate-x-1/2 text-water-foreground"
          style={{ left: `${at(minC)}%` }}
        >
          {minC}°
        </span>
        <span
          className="absolute -translate-x-1/2 text-diagnose-foreground"
          style={{ left: `${at(maxC)}%` }}
        >
          {maxC}°
        </span>
      </div>
      <div
        role="img"
        aria-label={`Rango ideal: de ${minC} a ${maxC} °C`}
        className="relative mt-1 h-2 rounded-full bg-border"
      >
        <span
          className="absolute inset-y-0 rounded-full bg-linear-to-r from-water-foreground to-diagnose-foreground"
          style={{ left: `${at(minC)}%`, width: `${at(maxC) - at(minC)}%` }}
        />
      </div>
      <div
        className="mt-1.5 flex justify-between text-[11px] text-muted-foreground"
        aria-hidden
      >
        <span>{low} °C</span>
        <span>{high} °C</span>
      </div>
    </div>
  );
}
