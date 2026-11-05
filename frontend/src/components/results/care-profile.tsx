"use client";

import {
  BookOpen,
  Bug,
  ChevronRight,
  Cloud,
  Droplets,
  Funnel,
  Gauge,
  Ruler,
  ShieldCheck,
  Shovel,
  SprayCan,
  Sun,
  Thermometer,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailBlock, DetailSheet } from "@/components/results/detail-sheet";
import { PROBLEM_ART_BG, ProblemArt } from "@/components/results/problem-art";
import {
  difficultyHints,
  difficultyLabels,
  sunExposureLabels,
} from "@/lib/labels";
import type { CommonProblem, PlantProfile } from "@/lib/types";

function CareRow({
    icon: Icon,
    label,
    children,
}: {
    icon: LucideIcon;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-3">
            <Icon className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
                <dt className="font-medium">{label}</dt>
                <dd className="text-muted-foreground">{children}</dd>
            </div>
        </div>
    );
}

export function CareProfile({ profile }: { profile: PlantProfile }) {
  return (
    <div className="space-y-4">
      {profile.warnings.length > 0 && (
        <div
          role="note"
          className="rounded-xl bg-warning p-4 text-warning-foreground"
        >
          <p className="flex items-center gap-2 font-medium">
            <TriangleAlert className="size-4" aria-hidden />
            Precauciones
          </p>
          <ul className="mt-1 space-y-1">
            {profile.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="size-5 text-primary" aria-hidden />
            Ficha de cuidados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {profile.difficulty && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Badge
                variant={
                  profile.difficulty === "hard" ? "destructive" : "secondary"
                }
              >
                <Gauge aria-hidden />
                {difficultyLabels[profile.difficulty]}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {difficultyHints[profile.difficulty]}
              </p>
            </div>
          )}
          <dl className="space-y-4">
            <CareRow icon={Sun} label={sunExposureLabels[profile.sunExposure]}>
              {profile.light}
            </CareRow>
            <CareRow icon={Droplets} label="Riego">
              {profile.watering.criterion}
              {profile.watering.frequencyHint && (
                <span className="mt-1 block">
                  {profile.watering.frequencyHint}
                </span>
              )}
            </CareRow>
            <CareRow icon={Thermometer} label="Temperatura">
              Entre {profile.temperature.minC} y {profile.temperature.maxC} °C
            </CareRow>
            <CareRow icon={Cloud} label="Humedad">
              {profile.humidity}
            </CareRow>
            {profile.misting && (
              <CareRow icon={SprayCan} label="Nebulización">
                {profile.misting}
              </CareRow>
            )}
            <CareRow icon={Shovel} label="Sustrato">
              {profile.substrate}
            </CareRow>
            <CareRow icon={Funnel} label="Drenaje">
              {profile.drainage}
            </CareRow>
            {profile.size && (
              <CareRow icon={Ruler} label="Tamaño">
                {profile.size}
              </CareRow>
            )}
          </dl>

          {profile.sources.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Fuentes: {profile.sources.join(" · ")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProblemCard({
  problem,
  className,
  style,
  ...props
}: React.ComponentProps<"button"> & { problem: CommonProblem }) {
  return (
    <button
      type="button"
      style={{
        backgroundColor: PROBLEM_ART_BG[problem.kind ?? "unknown"],
        ...style,
      }}
      className={cn(
        "group relative flex aspect-4/5 w-full flex-col justify-end overflow-hidden rounded-3xl p-3 text-left transition outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 @2xl:aspect-5/4 @2xl:p-4",
        className
      )}
      {...props}
    >
      <ProblemArt
        kind={problem.kind}
        className="absolute inset-x-3 top-3 h-[55%] transition-transform duration-500 group-hover:scale-105 @2xl:h-[66%]"
      />
      <span className="relative font-heading leading-tight font-semibold @2xl:text-lg">
        {problem.name}
      </span>
      <span className="relative mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
        Ver qué hacer
        <ChevronRight className="size-3.5" aria-hidden />
      </span>
    </button>
  );
}

/** Problemas comunes con su ilustración; al tocar uno se abre el detalle. */
export function CommonProblemsCard({
  problems,
}: {
  problems: CommonProblem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bug className="size-5 text-primary" aria-hidden />
          Problemas comunes
        </CardTitle>
      </CardHeader>
      <CardContent className="@container">
        <ul className="-mx-(--card-spacing) flex snap-x snap-mandatory scroll-px-(--card-spacing) gap-3 overflow-x-auto px-(--card-spacing) pb-2 scrollbar-thin max-sm:pb-1 max-sm:scrollbar-none @md:mx-0 @md:grid @md:grid-cols-3 @md:overflow-visible @md:px-0 @md:pb-0">
          {problems.map((problem) => (
            <li
              key={problem.name}
              className="w-[58%] max-w-56 shrink-0 snap-start @md:w-auto @md:max-w-none"
            >
              <DetailSheet
                title={problem.name}
                banner={
                  <div
                    className="flex justify-center"
                    style={{
                      backgroundColor:
                        PROBLEM_ART_BG[problem.kind ?? "unknown"],
                    }}
                  >
                    <ProblemArt kind={problem.kind} className="h-40 w-auto" />
                  </div>
                }
                trigger={<ProblemCard problem={problem} />}
              >
                <DetailBlock title="Cómo reconocerlo">
                  {problem.signs}
                </DetailBlock>
                <DetailBlock title="Qué hacer">{problem.solution}</DetailBlock>
              </DetailSheet>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function PreventionCard({ tips }: { tips: string[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="size-5 text-primary" aria-hidden />
                    Prevención de enfermedades
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2.5">
                    {tips.map((tip) => (
                        <li key={tip} className="flex gap-2.5">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                            {tip}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}