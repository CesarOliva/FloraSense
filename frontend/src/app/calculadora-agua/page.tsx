import type { Metadata } from "next";
import { ToolHero } from "@/components/tool-hero";
import { WaterCalculator } from "@/components/water/water-calculator";

export const metadata: Metadata = { title: "Calculadora de agua" };

export default function WaterCalculatorPage() {
  return (
    <>
      <ToolHero toolId="water" />
      <WaterCalculator />
    </>
  );
}
