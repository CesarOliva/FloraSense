"use client";

import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { cn } from "cn";

export type Choice<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

/** Grupo de opciones tipo tarjeta, accesible como radio group. */
export function ChoiceGroup<T extends string>({
  label,
  value,
  onValueChange,
  choices,
  className,
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  choices: Choice<T>[];
  className?: string;
}) {
  const labelId = useId();

  return (
    <fieldset>
      <legend id={labelId} className="mb-2.5 text-sm font-medium">
        {label}
      </legend>
      <RadioGroupPrimitive.Root
        aria-labelledby={labelId}
        value={value}
        onValueChange={(v) => onValueChange(v as T)}
        className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}
      >
        {choices.map(({ value: v, label: text, icon: Icon }) => (
          <RadioGroupPrimitive.Item
            key={v}
            value={v}
            className="flex min-h-12 items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-left text-sm transition-colors outline-none hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-primary data-checked:bg-accent data-checked:text-accent-foreground"
          >
            {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
            <span>{text}</span>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    </fieldset>
  );
}
