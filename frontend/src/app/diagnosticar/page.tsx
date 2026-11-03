import type { Metadata } from "next";
import { ToolHero } from "@/components/tool-hero";
import { AnalysisFlow } from "@/components/flow/analysis-flow";

export const metadata: Metadata = { title: "Diagnosticar" };

export default function DiagnosePage() {
  return (
    <>
      <ToolHero toolId="diagnose" />
      <AnalysisFlow />
    </>
  );
}
