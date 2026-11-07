"use client";

import { useId, useState } from "react";
import { LeafShutter } from "@/components/brand/logo";
import { LOCKUP } from "@/components/brand/logo-paths";
import "./splash.css";

/*
 * Animación de entrada: cada letra del nombre crece como una rama por su
 * contorno, de izquierda a derecha; ya formado, el
 * contorno se desvanece y aparece el nombre normal (relleno, con la hoja de
 * la "i" de "Sin"). Luego se abre la app.
 *
 * Sale en cada carga completa de la página (abrirla o recargarla); al navegar
 * dentro de la app no, porque el layout no se vuelve a montar. Tocar la
 * pantalla la salta. Todo corre con CSS desde el primer pintado.
 */

/** Tiempos en segundos; los del final están en splash.css. */
const FIRST = 0.15; // empieza la primera letra
const STAGGER = 0.06; // entre una letra y la siguiente
const DRAW = 0.8; // lo que tarda en dibujarse una letra
const SETTLE = 1.8; // aparece el nombre normal

type Point = readonly [number, number];
type Segment = { control?: Point; to: Point };

/**
 * Qué es cada contorno del nombre, en el orden de LOCKUP: una letra o un
 * contorno que brota de la letra `of` (huecos, trazos que se solapan, el
 * punto de la i).
 */
const ROLES: readonly ("letter" | { of: number })[] = [
  "letter", // F
  { of: 0 },
  "letter", // o
  { of: 2 },
  "letter", // t
  { of: 4 },
  "letter", // o
  { of: 6 },
  "letter", // S
  "letter", // ı
  "letter", // n
  { of: 10 },
  "letter", // D
  { of: 12 },
  "letter", // i
  { of: 14 },
  "letter", // s
  "letter", // e
  "letter", // a
  { of: 18 },
  "letter", // s
  "letter", // e
];

const round = (n: number) => Math.round(n * 100) / 100;
const pt = (p: Point) => `${round(p[0])} ${round(p[1])}`;
const seconds = (n: number) => `${round(n)}s`;
const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Un contorno (M, L, Q, Z absolutos) como lista de tramos. */
function parseContour(d: string) {
  const tokens = d.match(/[MLQZ]|-?\d*\.?\d+/g) ?? [];
  let i = 0;
  let command = "";
  let start: Point = [0, 0];
  const segments: Segment[] = [];
  const read = (): Point => [Number(tokens[i++]), Number(tokens[i++])];
  while (i < tokens.length) {
    if (/[MLQZ]/.test(tokens[i])) command = tokens[i++];
    if (command === "M") {
      start = read();
      command = "L";
    } else if (command === "L") segments.push({ to: read() });
    else if (command === "Q") segments.push({ control: read(), to: read() });
    else i++;
  }
  const last = segments.at(-1)?.to;
  if (last && dist(last, start) > 0.01) segments.push({ to: start });
  return segments;
}

/** El contorno empezando en el vértice `k`, para dibujarlo desde ahí. */
function rotate(segments: Segment[], k: number) {
  const ordered = [...segments.slice(k + 1), ...segments.slice(0, k + 1)];
  const start = segments[k].to;
  const d =
    `M${pt(start)}` +
    ordered
      .map((s) =>
        s.control ? `Q${pt(s.control)} ${pt(s.to)}` : `L${pt(s.to)}`
      )
      .join("") +
    "Z";
  return { d, start, ordered };
}

const contours = (["foto", "sin", "disease"] as const).flatMap((part) =>
  LOCKUP[part].split(/(?=M)/).filter(Boolean).map(parseContour)
);

const outlines: { d: string; delay: number; duration: number }[] = [];

// Cada letra crece desde abajo, desde el vértice inferior más centrado.
contours.forEach((segments, index) => {
  if (ROLES[index] !== "letter") return;
  const n = outlines.length;
  const vertices = segments.map((s) => s.to);
  const xs = vertices.map((v) => v[0]);
  const ys = vertices.map((v) => v[1]);
  const center: Point = [
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2,
  ];
  const bottom = Math.max(...ys);
  let k = 0;
  let best = Infinity;
  vertices.forEach(([x, y], i) => {
    const score = Math.abs(y - bottom) * 3 + Math.abs(x - center[0]);
    if (score < best) [best, k] = [score, i];
  });
  const { d } = rotate(segments, k);
  const delay = FIRST + n * STAGGER;
  outlines.push({ d, delay, duration: DRAW });
});

// Huecos, trazos solapados y el punto de la i: brotan poco después de su letra.
contours.forEach((segments, index) => {
  const role = ROLES[index];
  if (!role || role === "letter") return;
  const parent =
    outlines[ROLES.slice(0, role.of).filter((r) => r === "letter").length];
  outlines.push({
    d: rotate(segments, segments.length - 1).d,
    delay: parent.delay + 0.25,
    duration: DRAW * 0.7,
  });
});

const vars = (values: Record<string, string>) => values as React.CSSProperties;

export function Splash() {
  const id = useId();
  const [phase, setPhase] = useState<"playing" | "done">("playing");

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className="splash"
      style={vars({ "--settle": seconds(SETTLE) })}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setPhase("done");
      }}
    >
      <svg viewBox={LOCKUP.viewBox} className="splash-title">
        {outlines.map((outline) => (
          <path
            key={outline.d}
            d={outline.d}
            pathLength={1}
            className="splash-outline"
            style={vars({
              "--d": seconds(outline.delay),
              "--t": seconds(outline.duration),
            })}
          />
        ))}
        {/* El nombre normal, que aparece cuando ya está formado. */}
        <g className="splash-word">
          <path d={LOCKUP.foto} className="splash-ink" />
          <path d={LOCKUP.sin} className="splash-accent" />
          <path d={LOCKUP.disease} className="splash-ink" />
        </g>
        <path
          d={LOCKUP.stem.d}
          pathLength={1}
          strokeWidth={LOCKUP.stem.width}
          className="splash-stem"
        />
        <g className="splash-logo-leaf">
          <g transform={LOCKUP.leaf.transform}>
            <LeafShutter
              id={id}
              light={LOCKUP.leaf.light}
              gap={LOCKUP.leaf.gap}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
