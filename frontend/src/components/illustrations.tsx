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
