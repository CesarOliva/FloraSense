import { cn } from "cn";

const LEAF = "M0 0 C -14 -18 -12 -44 0 -58 C 12 -44 14 -18 0 0 Z";

const LEAVES = [
  { rotate: -64, scale: 0.8, fill: "#6FBF86" },
  { rotate: 62, scale: 0.85, fill: "#3E8E5A" },
  { rotate: -34, scale: 1.1, fill: "#3E8E5A" },
  { rotate: 34, scale: 1.05, fill: "#5AAE74" },
  { rotate: 0, scale: 1.25, fill: "#2F7A4B" },
];

/** Maceta con hojas que se mecen suavemente. */
export function PottedPlant({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={cn("size-40", className)} aria-hidden>
      <ellipse cx="80" cy="154" rx="36" ry="4" fill="black" opacity="0.08" />
      <g
        className="motion-safe:animate-sway"
        style={{ transformOrigin: "80px 100px" }}
      >
        {LEAVES.map(({ rotate, scale, fill }) => (
          <g
            key={rotate}
            transform={`translate(80 100) rotate(${rotate}) scale(${scale})`}
          >
            <path d={LEAF} fill={fill} />
            <path
              d="M0 -2 V -54"
              stroke="white"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>
      <path
        d="M52 108 H108 L100 147 Q99 152 94 152 H66 Q61 152 60 147 Z"
        fill="#D9895B"
      />
      <rect x="46" y="98" width="68" height="14" rx="5" fill="#C7744A" />
      <path d="M58 122 H102" stroke="white" strokeOpacity="0.25" strokeWidth="3" />
    </svg>
  );
}

/** Hoja grande decorativa para fondos; toma el color del texto. */
export function LeafDecor({ className }: { className?: string }) {
  return (
    <svg viewBox="-30 -64 60 68" className={className} aria-hidden>
      <path d={LEAF} fill="currentColor" />
      <path
        d="M0 -2 V -54 M0 -16 L-9 -26 M0 -16 L9 -26 M0 -32 L-8 -41 M0 -32 L8 -41"
        stroke="var(--background)"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

type LeafProps = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  fill: string;
};

/** Hoja con su nervio, colocada en coordenadas del SVG que la contiene. */
function Leaf({ x, y, rotate, scale, fill }: LeafProps) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d={LEAF} fill={fill} />
      <path
        d="M0 -2 V -54"
        stroke="white"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Maceta de terracota; (x, y) es el centro del borde superior. Mide 50 × 36 a escala 1. */
function Pot({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-20 8 H20 L15 32 Q14 36 10 36 H-10 Q-14 36 -15 32 Z" fill="#D9895B" />
      <rect x="-25" y="0" width="50" height="11" rx="4" fill="#C7744A" />
    </g>
  );
}

function Stem({ x, from, to }: { x: number; from: number; to: number }) {
  return (
    <path
      d={`M${x} ${from} V${to}`}
      stroke="#3E8E5A"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  );
}

const DROP = "M0 -5 C 2.5 -1.5 4 0.5 4 2.5 A 4 4 0 0 1 -4 2.5 C -4 0.5 -2.5 -1.5 0 -5 Z";

const ALERT = "#E5484D";
const SICK = "#B98A1E";
const SNAP = "#22A05A";
const WATER = "#4A9BD6";
const WATER_DARK = "#2F7FBF";
const SUN = "#E2A93B";
const SUN_DARK = "#B9791A";

const SCAN_LEAVES: LeafProps[] = [
  { x: 60, y: 96, rotate: -62, scale: 0.72, fill: "#5AAE74" },
  { x: 60, y: 88, rotate: 70, scale: 0.68, fill: "#3E8E5A" },
  { x: 60, y: 70, rotate: -38, scale: 0.78, fill: "#3E8E5A" },
  { x: 60, y: 46, rotate: -14, scale: 0.62, fill: "#2F7A4B" },
];

/** Diagnosticar: planta con una hoja amarilla que un recuadro rojo de alerta está escaneando. */
export function PlantScanDecor({ className }: { className?: string }) {
  return (
    <svg viewBox="18 7.5 96 134.5" className={className} aria-hidden>
      <path
        d="M60 106 C 60 88 58 70 60 44"
        stroke="#3E8E5A"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {SCAN_LEAVES.map((leaf) => (
        <Leaf key={leaf.y} {...leaf} />
      ))}

      {/* Hoja enferma: amarilla con manchas. */}
      <g transform="translate(60 62) rotate(52) scale(0.8)">
        <path d={LEAF} fill="#E9C649" />
        <path
          d="M0 -2 V -54"
          stroke={SICK}
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="-4" cy="-22" r="3" fill={SICK} opacity="0.7" />
        <circle cx="4" cy="-36" r="2.2" fill={SICK} opacity="0.6" />
      </g>

      <Pot x={60} y={104} />

      {/* Recuadro de escaneo sobre la hoja enferma. */}
      <rect x="62" y="22" width="42" height="42" rx="3" fill={ALERT} fillOpacity="0.1" />
      <path
        d="M62 32 V22 H72 M94 22 H104 V32 M104 54 V64 H94 M72 64 H62 V54"
        stroke={ALERT}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <g className="motion-safe:animate-scan-leaf">
        <rect x="64" y="19" width="38" height="4" fill={ALERT} opacity="0.2" />
        <rect x="64" y="23" width="38" height="1.8" rx="0.9" fill={ALERT} />
      </g>

      {/* Aviso de alerta. */}
      <circle cx="104" cy="22" r="8" fill={ALERT} stroke="white" strokeWidth="2" />
      <path d="M104 17.5 V23" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="104" cy="26.3" r="1.2" fill="white" />
    </svg>
  );
}

const PHONE_LEAVES: LeafProps[] = [
  { x: 62, y: 100, rotate: -58, scale: 0.5, fill: "#5AAE74" },
  { x: 62, y: 94, rotate: 58, scale: 0.5, fill: "#3E8E5A" },
  { x: 62, y: 80, rotate: -30, scale: 0.58, fill: "#3E8E5A" },
  { x: 62, y: 76, rotate: 32, scale: 0.58, fill: "#5AAE74" },
  { x: 62, y: 64, rotate: 0, scale: 0.5, fill: "#2F7A4B" },
];

/** Identificar: un teléfono enfoca una planta y la reconoce. */
export function PhoneScanDecor({ className }: { className?: string }) {
  return (
    <svg viewBox="24 10 85 132" className={className} aria-hidden>
      <rect x="26" y="12" width="72" height="128" rx="13" fill="#2B3A33" />
      <rect x="31" y="22" width="62" height="110" rx="8" fill="#EAF7EE" />
      <rect x="53" y="15" width="18" height="3.5" rx="1.75" fill="#1B2620" />

      <Stem x={62} from={106} to={64} />
      {PHONE_LEAVES.map((leaf) => (
        <Leaf key={leaf.y} {...leaf} />
      ))}
      <Pot x={62} y={104} scale={0.55} />

      {/* Visor de la cámara, enfocando. */}
      <path
        d="M38 40 V30 H48 M76 30 H86 V40 M86 112 V122 H76 M48 122 H38 V112"
        stroke={SNAP}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="origin-center [transform-box:fill-box] motion-safe:animate-focus"
      />

      {/* Planta reconocida. */}
      <circle cx="96" cy="24" r="10" fill={SNAP} stroke="white" strokeWidth="2" />
      <path
        d="M91 24.5 L94.5 28 L101 20.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const SPROUT_LEAVES: LeafProps[] = [
  { x: 94, y: 101, rotate: -55, scale: 0.42, fill: "#5AAE74" },
  { x: 94, y: 99, rotate: 55, scale: 0.42, fill: "#3E8E5A" },
  { x: 94, y: 94, rotate: 0, scale: 0.36, fill: "#2F7A4B" },
];

const DRIPS = [
  { x: 86, y: 68, delay: "0s" },
  { x: 81, y: 78, delay: "0.4s" },
  { x: 89, y: 84, delay: "0.8s" },
];

/** Calculadora de agua: una regadera con marcas de medida riega una maceta. */
export function WateringDecor({ className }: { className?: string }) {
  return (
    <svg viewBox="1 11 117 126" className={className} aria-hidden>
      <g transform="rotate(28 55 50)">
        <path
          d="M23 42 C 6 40 6 68 25 66"
          stroke={WATER_DARK}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M56 62 L84 42" stroke={WATER_DARK} strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="86" cy="40" rx="4" ry="6.5" transform="rotate(-35 86 40)" fill={WATER_DARK} />
        <path d="M22 40 H58 L56 70 Q55 74 51 74 H29 Q25 74 24 70 Z" fill={WATER} />
        <rect x="20" y="34" width="40" height="8" rx="3" fill={WATER_DARK} />
        <path
          d="M29 50 H36 M29 57 H33 M29 64 H36"
          stroke="white"
          strokeOpacity="0.8"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {DRIPS.map(({ x, y, delay }) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <path
            d={DROP}
            fill="#6CC3F0"
            className="motion-safe:animate-drip"
            style={{ animationDelay: delay }}
          />
        </g>
      ))}

      <Stem x={94} from={106} to={94} />
      {SPROUT_LEAVES.map((leaf) => (
        <Leaf key={leaf.y} {...leaf} />
      ))}
      <Pot x={94} y={106} scale={0.8} />
    </svg>
  );
}

const CALENDAR_DAYS = [38, 50, 62].flatMap((y) =>
  [50, 64, 78, 92].map((x) => ({ x, y }))
);

const PLANT_LEAVES: LeafProps[] = [
  { x: 34, y: 100, rotate: -58, scale: 0.6, fill: "#5AAE74" },
  { x: 34, y: 95, rotate: 62, scale: 0.6, fill: "#3E8E5A" },
  { x: 34, y: 84, rotate: -25, scale: 0.62, fill: "#3E8E5A" },
  { x: 34, y: 80, rotate: 14, scale: 0.55, fill: "#5AAE74" },
  { x: 34, y: 78, rotate: -4, scale: 0.5, fill: "#2F7A4B" },
];

/** Recordatorios: calendario con el día de riego marcado y una campana sonando. */
export function CalendarDecor({ className }: { className?: string }) {
  return (
    <svg viewBox="-1 5 118 134" className={className} aria-hidden>
      <rect x="44" y="16" width="62" height="60" rx="8" fill="white" />
      <path d="M44 24 A8 8 0 0 1 52 16 H98 A8 8 0 0 1 106 24 V32 H44 Z" fill={SUN} />
      <rect x="58" y="11" width="4" height="11" rx="2" fill={SUN_DARK} />
      <rect x="88" y="11" width="4" height="11" rx="2" fill={SUN_DARK} />
      {CALENDAR_DAYS.map(({ x, y }) =>
        x === 78 && y === 50 ? null : (
          <rect key={`${x}-${y}`} x={x} y={y} width="8" height="7" rx="2" fill="#F3E6C8" />
        )
      )}

      {/* Día de riego. */}
      <circle cx="82" cy="53.5" r="7" fill={WATER} />
      <path d={DROP} fill="white" transform="translate(82 54) scale(0.75)" />

      <Stem x={34} from={106} to={78} />
      {PLANT_LEAVES.map((leaf) => (
        <Leaf key={leaf.y} {...leaf} />
      ))}
      <Pot x={34} y={106} scale={0.85} />

      {/* Campana sonando. */}
      <circle cx="104" cy="18" r="11" fill="#E08A1E" stroke="white" strokeWidth="2" />
      <g transform="translate(104 18.5) scale(0.62)">
        <g className="origin-top [transform-box:fill-box] motion-safe:animate-ring">
          <circle cx="0" cy="-10" r="1.8" fill="white" />
          <path
            d="M0 -9 C -5.5 -9 -7.5 -4.5 -7.5 1 V4 L-10 7.5 H10 L7.5 4 V1 C7.5 -4.5 5.5 -9 0 -9 Z"
            fill="white"
          />
          <circle cx="0" cy="10" r="2.6" fill="white" />
        </g>
      </g>
    </svg>
  );
}
