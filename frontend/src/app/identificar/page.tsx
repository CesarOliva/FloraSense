import type { Metadata } from "next";
import { ToolHero } from "@/components/tool-hero";
import { IdentifyTool } from "@/components/identify/identify-tool";

export const metadata: Metadata = { title: "Identificar" };

export default function IdentifyPage() {
  return (
    <>
      <ToolHero toolId="identify" />
      <IdentifyTool />
    </>
  );
}
