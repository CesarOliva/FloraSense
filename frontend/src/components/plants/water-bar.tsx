import { cn } from "cn";
import { daysUntilWatering, type SavedPlant } from "@/lib/plants-store";

/** "Agua restante" hasta el próximo riego: llena tras regar, vacía cuando toca. */
export function WaterBar({
  plant,
  className,
}: {
  plant: SavedPlant;
  className?: string;
}) {
  const days = daysUntilWatering(plant);
  const due = days !== null && days <= 0;
  const percent =
    days === null
      ? 0
      : Math.round(
          Math.min(1, Math.max(0, days / plant.wateringIntervalDays)) * 100
        );

  return (
    <div
      className={cn(
        "h-1.5 overflow-hidden rounded-full",
        due ? "bg-warning" : "bg-water",
        className
      )}
      aria-hidden
    >
      <div
        className="h-full rounded-full bg-water-foreground transition-[width] duration-700"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
