import {
  Bell,
  Droplets,
  ScanSearch,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export type ToolId = "diagnose" | "identify" | "water" | "remind";

export type Tool = {
  id: ToolId;
  href: string;
  title: string;
  /** Texto corto para la navegación del escritorio. */
  navTitle: string;
  /** Texto muy corto para la barra inferior del móvil. */
  tabLabel: string;
  description: string;
  tagline: string;
  icon: LucideIcon;
  /** Fondo y color de texto propios de la herramienta. */
  surface: string;
};

export const TOOLS: Tool[] = [
  {
    id: "diagnose",
    href: "/diagnosticar",
    title: "Diagnosticar",
    navTitle: "Diagnosticar",
    tabLabel: "Salud",
    description: "Comprueba la salud de tu planta",
    tagline: "Revisamos hojas, entorno y riego para decirte qué necesita.",
    icon: Stethoscope,
    surface: "bg-diagnose text-diagnose-foreground",
  },
  {
    id: "identify",
    href: "/identificar",
    title: "Identificar",
    navTitle: "Identificar",
    tabLabel: "Identificar",
    description: "Reconoce una planta con una foto",
    tagline: "Toma una foto y te diremos qué planta es y cómo cuidarla.",
    icon: ScanSearch,
    surface: "bg-identify text-identify-foreground",
  },
  {
    id: "water",
    href: "/calculadora-agua",
    title: "Calculadora de agua",
    navTitle: "Agua",
    tabLabel: "Agua",
    description: "Cuánta agua y cada cuánto",
    tagline: "Calcula cuánta agua necesita tu planta y cada cuánto regarla.",
    icon: Droplets,
    surface: "bg-water text-water-foreground",
  },
  {
    id: "remind",
    href: "/recordatorios",
    title: "Recordatorios",
    navTitle: "Recordatorios",
    tabLabel: "Avisos",
    description: "Riego de tus plantas agregadas",
    tagline: "El riego de tus plantas, en orden de urgencia.",
    icon: Bell,
    surface: "bg-remind text-remind-foreground",
  },
];

export function getTool(id: ToolId): Tool {
  return TOOLS.find((tool) => tool.id === id)!;
}
