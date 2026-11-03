import type { Metadata } from "next";
import { ToolHero } from "@/components/tool-hero";
import { RemindersList } from "@/components/reminders/reminders-list";

export const metadata: Metadata = { title: "Recordatorios" };

export default function RemindersPage() {
  return (
    <>
      <ToolHero toolId="remind" />
      <RemindersList />
    </>
  );
}
