"use client";

import { useId } from "react";
import type { ProblemKind } from "@/lib/types";

type ArtKind = ProblemKind | "unknown";

// Hoja base (pie en 0,0 y punta hacia arriba) y sus nervaduras.
const LEAF = "M0 0C-30-24-30-80 0-110C30-80 30-24 0 0Z";
const VEINS =
  "M0-6V-100M0-30L-14-44M0-30L14-44M0-54L-15-69M0-54L15-69M0-78L-10-90M0-78L10-90";
const LEAF_AT = "translate(62 122) rotate(26)";
const GREEN = "#5c9b5c";

/** Color de fondo de cada tarjeta de problema. */
export const PROBLEM_ART_BG: Record<ArtKind, string> = {
  yellowing: "#fbf0c8",
  brown_tips: "#f6e8da",
  spots: "#fbe4dc",
  pests: "#e4f1e2",
  root_rot: "#e2edf5",
  fading: "#eef0e3",
  unknown: "#e8f1e9",
};

function Veins() {
  return (
    <path
      d={VEINS}
      fill="none"
      stroke="#fff"
      strokeOpacity=".35"
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
}

function Stem({ color = "#6f8f4e" }: { color?: string }) {
  return (
    <path d="M0 0V16" stroke={color} strokeWidth="4" strokeLinecap="round" />
  );
}

/** Ilustración del síntoma de un problema común (sin fotos en el catálogo). */
export function ProblemArt({
  kind,
  className,
}: {
  kind?: ProblemKind;
  className?: string;
}) {
  const id = useId();
  const clip = `${id}leaf`;
  const leafClip = (
    <clipPath id={clip}>
      <path d={LEAF} />
    </clipPath>
  );

  const art: Record<ArtKind, React.ReactNode> = {
    yellowing: (
      <>
        <defs>
          <linearGradient
            id={`${id}y`}
            x1="0"
            y1="0"
            x2="0"
            y2="-110"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#e4b83a" />
            <stop offset=".5" stopColor="#d6c457" />
            <stop offset="1" stopColor="#7cb068" />
          </linearGradient>
        </defs>
        <g transform={LEAF_AT}>
          <Stem color="#b99a3c" />
          <path d={LEAF} fill={`url(#${id}y)`} />
          <Veins />
        </g>
        <g transform="translate(116 106) rotate(122) scale(.36)">
          <path d={LEAF} fill="#ecc94e" />
          <path d="M0-6V-100" stroke="#fff" strokeOpacity=".45" strokeWidth="5" />
        </g>
        <path
          d="M126 80q5 5 2 11M112 86q4 4 1 9"
          fill="none"
          stroke="#c79f2e"
          strokeOpacity=".55"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),
    brown_tips: (
      <>
        <defs>{leafClip}</defs>
        <g transform={LEAF_AT}>
          <Stem />
          <path d={LEAF} fill={GREEN} />
          <g clipPath={`url(#${clip})`}>
            <path
              d="M-40-74L-28-81L-20-72L-10-83L0-74L10-85L18-75L28-83L40-77V-120H-40Z"
              fill="#a8693a"
            />
            <path
              d="M-40-74L-28-81L-20-72L-10-83L0-74L10-85L18-75L28-83L40-77"
              fill="none"
              stroke="#7d4b25"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
          <Veins />
        </g>
        <path
          d="M127 44l5 1-2 5zM134 58l4 3-4 2zM121 60l3 3-3 1z"
          fill="#a8693a"
        />
      </>
    ),
    spots: (
      <>
        <defs>{leafClip}</defs>
        <g transform={LEAF_AT}>
          <Stem />
          <path d={LEAF} fill={GREEN} />
          <Veins />
          <g clipPath={`url(#${clip})`}>
            {[
              [-10, -34, 5],
              [9, -50, 6.5],
              [-7, -68, 4.5],
              [7, -86, 3.5],
              [-15, -54, 3],
              [12, -28, 3],
            ].map(([x, y, r]) => (
              <g key={`${x}${y}`}>
                <circle cx={x} cy={y} r={r + 3.5} fill="#d6c75e" fillOpacity=".75" />
                <circle cx={x} cy={y} r={r} fill="#5a3a22" />
              </g>
            ))}
          </g>
        </g>
      </>
    ),
    pests: (
      <>
        <defs>{leafClip}</defs>
        <g transform={LEAF_AT}>
          <Stem />
          <path d={LEAF} fill={GREEN} />
          <Veins />
          <g clipPath={`url(#${clip})`} fill="#e9f0c9" fillOpacity=".8">
            {[
              [-12, -40], [-8, -46], [-14, -50], [-5, -38], [6, -60], [10, -66],
              [4, -70], [12, -58], [-4, -84], [2, -88], [-10, -62], [14, -40],
            ].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" />
            ))}
          </g>
          {/* telaraña de ácaros entre el borde de la hoja y el aire */}
          <path
            d="M18-30C32-40 36-58 30-74M20-48C31-54 33-66 27-80M22-38L36-62M14-62L33-58"
            fill="none"
            stroke="#fff"
            strokeOpacity=".9"
            strokeWidth=".9"
          />
          {/* ácaros */}
          {[
            [-6, -42, 20],
            [9, -63, -30],
            [-9, -79, 60],
          ].map(([x, y, a]) => (
            <g key={`${x}${y}`} transform={`translate(${x} ${y}) rotate(${a})`}>
              <path
                d="M-2-2l-2.4-2.2M0-2.4v-2.8M2-2l2.4-2.2M-2 2l-2.4 2.2M0 2.4v2.8M2 2l2.4 2.2"
                stroke="#8c2a1c"
                strokeWidth=".9"
                strokeLinecap="round"
              />
              <ellipse rx="3.4" ry="2.6" fill="#c2412d" />
            </g>
          ))}
          {/* cochinillas algodonosas */}
          {[
            [6, -24],
            [-12, -22],
          ].map(([x, y]) => (
            <g key={`${x}${y}`} transform={`translate(${x} ${y})`} fill="#fbfaf3">
              <circle r="3.6" />
              <circle cx="3" cy="-1.5" r="2.6" />
              <circle cx="-3" cy="1" r="2.4" />
            </g>
          ))}
        </g>
      </>
    ),
    root_rot: (
      <>
        {/* planta decaída */}
        <path d="M80 54C80 42 79 34 76 26" fill="none" stroke="#8a9a4a" strokeWidth="3.5" strokeLinecap="round" />
        <g transform="translate(77 30) rotate(-118) scale(.34)">
          <path d={LEAF} fill="#b8b552" />
        </g>
        <g transform="translate(79 40) rotate(112) scale(.3)">
          <path d={LEAF} fill="#a7ad4e" />
        </g>
        {/* maceta en corte */}
        <path d="M38 60H122L112 132Q111 136 106 136H54Q49 136 48 132Z" fill="#d9895b" />
        <path d="M45 66H115L106.5 128H53.5Z" fill="#7a5538" />
        <path d="M51.4 112H108.6L106.5 128H53.5Z" fill="#8ec9e8" fillOpacity=".85" />
        <path
          d="M80 68C78 82 70 92 66 104M80 68C84 84 92 94 96 106M80 70V112"
          fill="none"
          stroke="#f0e2c4"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M66 104C63 110 62 116 64 122M96 106C99 112 98 118 95 123M80 112V124"
          fill="none"
          stroke="#3a2a20"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <g fill="#3a2a20">
          <circle cx="64" cy="121" r="3.4" />
          <circle cx="95" cy="122" r="3" />
          <circle cx="80" cy="124" r="2.8" />
        </g>
        <rect x="34" y="54" width="92" height="12" rx="4" fill="#c7744a" />
        {/* gotas: exceso de agua */}
        <g fill="#6fb6e0">
          <path d="M128 20c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12Z" />
          <path d="M142 36c3 4.5 4.5 7 4.5 9a4.5 4.5 0 0 1-9 0c0-2 1.5-4.5 4.5-9Z" />
          <path d="M116 36c2.4 3.6 3.6 5.4 3.6 7.2a3.6 3.6 0 0 1-7.2 0c0-1.8 1.2-3.6 3.6-7.2Z" />
        </g>
      </>
    ),
    fading: (
      <>
        <defs>{leafClip}</defs>
        {/* sol tapado: poca luz */}
        <g opacity=".7">
          <circle cx="32" cy="34" r="12" fill="#f2d36b" />
          <path
            d="M32 14v-5M32 59v-5M12 34H7M57 34h-5M18 20l-3.5-3.5M49.5 51.5L46 48M18 48l-3.5 3.5M49.5 16.5L46 20"
            stroke="#f2d36b"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <path d="M14 52h34a9 9 0 0 0-3-17 12 12 0 0 0-23 4 7.5 7.5 0 0 0-8 13Z" fill="#fff" />
        <g transform={LEAF_AT}>
          <Stem />
          <path d={LEAF} fill="#4f8f57" />
          <g clipPath={`url(#${clip})`} fill="#efe9c4">
            <path
              d="M-30-104C-12-94-6-80-18-68C-6-64 4-72 2-86C8-76 20-80 26-98Z"
              fillOpacity=".9"
            />
            <path
              d="M-28-62C-14-56-8-48-16-38C-6-36 2-44 0-54C6-46 16-50 22-62Z"
              fillOpacity=".45"
            />
            <path d="M-24-24C-12-20-8-14-14-8C-4-8 0-14 0-20C4-14 12-16 18-24Z" fillOpacity=".15" />
          </g>
          <Veins />
        </g>
      </>
    ),
    unknown: (
      <>
        <g transform={LEAF_AT}>
          <Stem />
          <path d={LEAF} fill={GREEN} />
          <Veins />
        </g>
        <g transform="translate(104 64)">
          <circle r="19" fill="#fff" fillOpacity=".4" stroke="#2f4f3a" strokeWidth="5" />
          <path d="M14 14L29 29" stroke="#2f4f3a" strokeWidth="7" strokeLinecap="round" />
        </g>
      </>
    ),
  };

  return (
    <svg viewBox="0 0 160 140" className={className} aria-hidden>
      {art[kind ?? "unknown"]}
    </svg>
  );
}
