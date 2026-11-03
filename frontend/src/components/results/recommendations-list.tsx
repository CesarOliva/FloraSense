import {
  CalendarClock,
  Cloud,
  Droplets,
  Funnel,
  ListChecks,
  MapPin,
  Shovel,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryLabels, priorityLabels, sourceLabels } from "@/lib/labels";
import type {
  Priority,
  Recommendation,
  RecommendationCategory,
} from "@/lib/types";

const categoryIcon: Record<RecommendationCategory, LucideIcon> = {
  placement: MapPin,
  lighting: Sun,
  watering: Droplets,
  substrate: Shovel,
  drainage: Funnel,
  humidity: Cloud,
  monitoring: CalendarClock,
};

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const priorityClass: Record<Priority, string> = {
  high: "bg-warning text-warning-foreground",
  medium: "bg-secondary text-secondary-foreground",
  low: "bg-muted text-muted-foreground",
};

export function RecommendationsList({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  const sorted = [...recommendations].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ListChecks className="size-5 text-primary" aria-hidden />
          Qué hacer ahora
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-muted-foreground">
            No hay acciones urgentes. Sigue con los cuidados habituales.
          </p>
        ) : (
          <ol className="space-y-3">
            {sorted.map((rec, i) => {
              const Icon = categoryIcon[rec.category];
              return (
                <li key={i} className="flex gap-3 rounded-lg border p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-4.5" aria-hidden />
                    <span className="sr-only">{categoryLabels[rec.category]}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{rec.action}</p>
                    <p className="mt-1 text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        Por qué:
                      </span>{" "}
                      {rec.rationale}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge className={priorityClass[rec.priority]}>
                        {priorityLabels[rec.priority]}
                      </Badge>
                      <Badge variant="outline">{sourceLabels[rec.source]}</Badge>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
