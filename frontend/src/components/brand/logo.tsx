import { useId } from "react";
import { cn } from "cn";
import { LOCKUP, MARK } from "@/components/brand/logo-paths";

/**
 * Aspas de la hoja-obturador, en la caja de 100 x 100 de MARK. Con `mono` van
 * en `currentColor`; si no, cada aspa mezcla --logo-shade y --logo-light según
 * la luz que recibe.
 */
export function LeafShutter({
  id,
  light,
  gap,
  mono = false,
}: {
  id: string;
  light: readonly number[];
  gap: number;
  mono?: boolean;
}) {
  return (
    <>
      <defs>
        <clipPath id={`${id}leaf`}>
          <path d={MARK.leaf} />
        </clipPath>
        {/* Las separaciones y la apertura central dejan ver el fondo. */}
        <mask
          id={`${id}cuts`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100"
          height="100"
        >
          <rect width="100" height="100" fill="#fff" />
          <path
            d={MARK.cuts}
            stroke="#000"
            strokeWidth={gap}
            strokeLinecap="round"
          />
          <path
            d={MARK.hole}
            fill="#000"
            stroke="#000"
            strokeWidth={gap}
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <g mask={`url(#${id}cuts)`}>
        <g clipPath={`url(#${id}leaf)`}>
          {MARK.blades.map(({ d }, i) => (
            <path
              key={d}
              d={d}
              style={{
                fill: mono
                  ? "currentColor"
                  : `color-mix(in srgb, var(--logo-light) ${Math.round(light[i] * 100)}%, var(--logo-shade))`,
              }}
            />
          ))}
        </g>
      </g>
    </>
  );
}

type LogoMarkProps = {
  className?: string;
  /** `mono`: un solo color (`currentColor`), p. ej. blanco sobre un fondo verde. */
  variant?: "color" | "mono";
};

/**
 * Símbolo solo (hoja-obturador con su tallo), para espacios cuadrados.
 * Donde quepa, usa `Logo`.
 */
export function LogoMark({ className, variant = "color" }: LogoMarkProps) {
  const id = useId();
  const mono = variant === "mono";
  return (
    <svg
      viewBox={MARK.viewBox}
      className={cn("size-9 shrink-0", className)}
      aria-hidden
    >
      <LeafShutter
        id={id}
        light={MARK.blades.map((blade) => blade.light)}
        gap={MARK.gap}
        mono={mono}
      />
      <path
        d={MARK.stem}
        strokeWidth={MARK.stemWidth}
        strokeLinecap="round"
        style={{ stroke: mono ? "currentColor" : "var(--logo-shade)" }}
      />
    </svg>
  );
}

/** Logo: el nombre con la hoja-obturador brotando de la "i" de "Sin". */
export function Logo({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox={LOCKUP.viewBox}
      role="img"
      aria-label="FotoSinDisease"
      className={cn("block h-10 w-auto shrink-0", className)}
    >
      <path d={LOCKUP.foto} fill="currentColor" />
      <path d={LOCKUP.sin} className="fill-primary" />
      <path d={LOCKUP.disease} fill="currentColor" />
      <path
        d={LOCKUP.stem.d}
        fill="none"
        strokeWidth={LOCKUP.stem.width}
        strokeLinecap="round"
        style={{ stroke: "var(--logo-shade)" }}
      />
      <g transform={LOCKUP.leaf.transform}>
        <LeafShutter id={id} light={LOCKUP.leaf.light} gap={LOCKUP.leaf.gap} />
      </g>
    </svg>
  );
}
