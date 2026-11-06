import Link from "next/link";
import { ArrowUpRight, Camera } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  DueBadge,
  Greeting,
  HeroStats,
  TipOfTheDay,
} from "@/components/home/home-live";
import { MyPlantsPreview } from "@/components/home/my-plants-preview";
import type { ComponentType } from "react";
import {
  CalendarDecor,
  LeafDecor,
  PhoneScanDecor,
  PlantScanDecor,
  PottedPlant,
  WateringDecor,
} from "@/components/illustrations";
import { TOOLS, type ToolId } from "@/components/tools";

const enter =
  "fill-mode-both duration-500 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3";

/** Ilustración de cada herramienta, en la esquina inferior derecha de su tarjeta. */
const TOOL_DECOR: Record<ToolId, ComponentType<{ className?: string }>> = {
  diagnose: PlantScanDecor,
  identify: PhoneScanDecor,
  water: WateringDecor,
  remind: CalendarDecor,
};

export default function Home() {
  return (
    <div className="space-y-10">
      <section
        className={cn(
          "relative overflow-hidden rounded-[2rem] bg-linear-to-br from-hero to-hero-end p-6 text-white shadow-lg shadow-hero/20 sm:p-10",
          enter
        )}
      >
        <span className="absolute -top-20 -right-16 size-72 rounded-full bg-white/10" />
        <span className="absolute -bottom-24 -left-10 size-56 rounded-full bg-white/5" />
        <LeafDecor className="absolute bottom-[-4.5rem] left-1/2 hidden h-64 rotate-[35deg] text-white/10 lg:block" />

        <div className="relative grid items-center gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="font-medium text-white/80">
              <Greeting />
            </p>
            <h1 className="mt-1 max-w-[9ch] text-4xl leading-[1.05] font-semibold tracking-tight sm:max-w-[12ch] sm:text-5xl">
              Cuida tus plantas con una foto
            </h1>
            <p className="mt-3 max-w-md text-white/85">
              Identifica especies, revisa su salud y no vuelvas a olvidar un
              riego.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-11 rounded-full bg-white px-5 text-base text-hero shadow-md hover:bg-white/90"
              >
                <Link href="/identificar">
                  <Camera className="ml-1 size-6" data-icon="inline-start" aria-hidden />
                  Tomar una foto
                </Link>
              </Button>
              <HeroStats />
            </div>
          </div>
          <PottedPlant className="absolute -top-3 -right-4 size-24 sm:static sm:size-52 sm:motion-safe:animate-float" />
        </div>
      </section>

      <section aria-labelledby="tools-title">
        <h2 id="tools-title" className="mb-3 text-2xl font-semibold">
          Herramientas de cuidado
        </h2>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TOOLS.map(({ id, href, title, description, icon: Icon, surface }, i) => {
            const Decor = TOOL_DECOR[id];
            return (
              <li
                key={href}
                className={enter}
                style={{ animationDelay: `${120 + i * 70}ms` }}
              >
                <Link
                  href={href}
                  className={cn(
                    "group relative flex h-full min-h-40 flex-col justify-between gap-6 overflow-hidden rounded-3xl p-4 transition-all outline-none hover:-translate-y-1 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-5",
                    surface
                  )}
                >
                  {/*
                    Misma caja cuadrada en todas, así los dibujos quedan alineados.
                    En móvil va arriba, a la altura del icono; desde sm, centrada en vertical.
                  */}
                  <Decor className="absolute top-2 right-3 size-16 opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100 sm:top-1/2 sm:right-4 sm:size-22 sm:-translate-y-1/2 lg:size-20" />
                  <span className="relative flex size-12 items-center justify-center rounded-2xl bg-card/80 shadow-sm">
                    <Icon className="size-6" aria-hidden />
                    {id === "remind" && <DueBadge />}
                  </span>
                  <ArrowUpRight
                    className="absolute top-4 right-4 size-5 opacity-40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 max-sm:hidden"
                    aria-hidden
                  />
                  {/* Desde sm, el texto deja sitio a la ilustración. */}
                  <span className="relative sm:pr-20">
                    <span className="block font-heading text-lg leading-tight font-semibold">
                      {title}
                    </span>
                    <span className="mt-1 block text-sm opacity-80">
                      {description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className={enter} style={{ animationDelay: "400ms" }}>
        <TipOfTheDay />
      </div>

      <MyPlantsPreview />
    </div>
  );
}
