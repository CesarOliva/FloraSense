"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

/**
 * Tarjeta de detalle que se abre al tocar `trigger`: sube desde abajo en el
 * celular y aparece centrada en pantallas grandes. `icon` va junto al título;
 * `banner`, encima de él.
 */
export function DetailSheet({
  trigger,
  title,
  summary,
  icon,
  banner,
  footer,
  children,
}: {
  trigger: React.ReactElement;
  title: string;
  summary?: string;
  icon?: React.ReactNode;
  banner?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          {...(summary ? {} : { "aria-describedby": undefined })}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-[1.75rem] bg-card text-card-foreground shadow-2xl outline-none",
            "duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom",
            "sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[calc(100%-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
            "sm:data-[state=closed]:fade-out sm:data-[state=closed]:slide-out-to-bottom-4 sm:data-[state=open]:fade-in sm:data-[state=open]:slide-in-from-bottom-4"
          )}
        >
          <span
            className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/25 sm:hidden"
            aria-hidden
          />
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-10 rounded-full bg-card/80 backdrop-blur"
              aria-label="Cerrar"
            >
              <X aria-hidden />
            </Button>
          </Dialog.Close>

          <div className="overflow-y-auto px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-6 sm:pb-6">
            {banner && (
              <div className="mb-4 overflow-hidden rounded-2xl">{banner}</div>
            )}
            <div className="flex items-center gap-3 pr-9">
              {icon}
              <div className="min-w-0">
                <Dialog.Title className="font-heading text-xl leading-tight font-semibold">
                  {title}
                </Dialog.Title>
                {summary && (
                  <Dialog.Description className="mt-0.5 font-medium text-primary">
                    {summary}
                  </Dialog.Description>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-relaxed">
              {children}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Dialog.Close asChild>
                <Button size="lg" variant={footer ? "outline" : "default"}>
                  Entendido
                </Button>
              </Dialog.Close>
              {footer}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Bloque de texto con subtítulo dentro de una tarjeta de detalle. */
export function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <p>{children}</p>
    </div>
  );
}
