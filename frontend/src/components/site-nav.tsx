"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House } from "lucide-react";
import { cn } from "cn";
import { TOOLS } from "@/components/tools";

/** Enlaces a las herramientas en la cabecera (tablet y escritorio). */
export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Herramientas" className="hidden items-center gap-1 md:flex">
      {TOOLS.map((tool) => {
        const active = pathname === tool.href;
        return (
          <Link
            key={tool.href}
            href={tool.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? tool.surface
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tool.navTitle}
          </Link>
        );
      })}
    </nav>
  );
}

/** Barra inferior tipo app para el móvil. */
export function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Inicio", icon: House, surface: "bg-accent text-accent-foreground" },
    ...TOOLS.map((t) => ({
      href: t.href,
      label: t.tabLabel,
      icon: t.icon,
      surface: t.surface,
    })),
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, surface }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium outline-none focus-visible:bg-muted",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    active && surface
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
