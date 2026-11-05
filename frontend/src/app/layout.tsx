import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { DesktopNav, MobileNav } from "@/components/site-nav";
import { USE_MOCKS } from "@/lib/api";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FotoSinDisease · Tu planta sana, desde una foto",
    template: "%s · FotoSinDisease",
  },
  applicationName: "FotoSinDisease",
  description:
    "Identifica tu planta con una foto y recibe cuidados, riego y prevención de problemas adaptados a tu hogar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/75 backdrop-blur-lg">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
            <Link
              href="/"
              className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Logo />
            </Link>
            <div className="flex items-center gap-2">
              <DesktopNav />
              {USE_MOCKS && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-warning px-2.5 py-1 text-xs font-medium text-warning-foreground"
                  title="Respuestas simuladas: el backend aún no está conectado"
                >
                  <FlaskConical className="size-3.5" aria-hidden />
                  Demo
                </span>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 sm:pt-10 md:pb-14">
          {children}
        </main>
        <footer className="hidden border-t py-6 text-center text-xs text-muted-foreground md:block">
          <p className="mx-auto max-w-5xl px-4">
            FotoSinDisease ofrece orientación a partir de fotografías; no reemplaza
            el diagnóstico de un especialista.
          </p>
        </footer>
        <MobileNav />
      </body>
    </html>
  );
}
