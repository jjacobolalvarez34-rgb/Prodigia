import type { ReactElement } from "react";
import { IconSuma, IconLogica, IconGeometria, IconQuimica, IconAnatomia, IconMelodia, IconTrigonometria, IconHistoria, IconCalculia, IconCircuitia, IconEstadistica, IconNaipia, IconCodia } from "@/components/icons";

export type MundoSlug = "numeria" | "enigmia" | "geografia" | "quimia" | "anatomia" | "melodia" | "trigonometria" | "historia" | "calculia" | "circuitia" | "estadistica" | "naipia" | "codia";

export interface MundoLanding {
  slug: MundoSlug;
  nombre: string;
  colorHex: string;
  Icono: (props: { className?: string }) => ReactElement;
}

// Mismos 8 mundos, mismos colores/íconos que WorldCard/MundoSelector/
// Header (page.tsx de la home autenticada) — separado en su propio
// archivo para que la landing pública y /demo/* lo usen sin duplicar la
// lista a mano en cada componente nuevo. Cada slug de acá necesita su
// propia carpeta src/app/[locale]/demo/<slug>/ — ver la regla en
// docs/PARIDAD_MUNDOS.md ("Rediseño del flujo de landing/onboarding").
export const MUNDOS_LANDING: MundoLanding[] = [
  { slug: "numeria", nombre: "Numeria", colorHex: "#6C4CF1", Icono: IconSuma },
  { slug: "enigmia", nombre: "Enigmia", colorHex: "#0E9F6E", Icono: IconLogica },
  { slug: "geografia", nombre: "Geografía", colorHex: "#1E7A8C", Icono: IconGeometria },
  { slug: "quimia", nombre: "Quimia", colorHex: "#C026D3", Icono: IconQuimica },
  { slug: "anatomia", nombre: "Anatomía", colorHex: "#8B2942", Icono: IconAnatomia },
  { slug: "melodia", nombre: "Melodía", colorHex: "#B8860B", Icono: IconMelodia },
  { slug: "trigonometria", nombre: "Trigonometría", colorHex: "#84CC16", Icono: IconTrigonometria },
  { slug: "historia", nombre: "Historia", colorHex: "#A0522D", Icono: IconHistoria },
  { slug: "calculia", nombre: "Calculia", colorHex: "#4338CA", Icono: IconCalculia },
  { slug: "circuitia", nombre: "Circuitia", colorHex: "#F59E0B", Icono: IconCircuitia },
  { slug: "estadistica", nombre: "Estadística", colorHex: "#0D9488", Icono: IconEstadistica },
  { slug: "naipia", nombre: "Naipia", colorHex: "#B91C1C", Icono: IconNaipia },
  { slug: "codia", nombre: "Codia", colorHex: "#06B6D4", Icono: IconCodia },
];
