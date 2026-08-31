import type { ReactElement } from "react";
import { IconSuma, IconLogica, IconGeometria, IconQuimica, IconAnatomia, IconMelodia, IconTrigonometria, IconHistoria } from "@/components/icons";

export type MundoSlug = "numeria" | "enigmia" | "geografia" | "quimia" | "anatomia" | "melodia" | "trigonometria" | "historia";

export interface MundoLanding {
  slug: MundoSlug;
  nombre: string;
  colorHex: string;
  Icono: (props: { className?: string }) => ReactElement;
}

// Mismos 5 mundos, mismos colores/íconos que WorldCard/MundoSelector/
// Header (page.tsx de la home autenticada) — separado en su propio
// archivo para que la landing pública y /demo/* lo usen sin duplicar la
// lista a mano en cada componente nuevo.
export const MUNDOS_LANDING: MundoLanding[] = [
  { slug: "numeria", nombre: "Numeria", colorHex: "#6C4CF1", Icono: IconSuma },
  { slug: "enigmia", nombre: "Enigmia", colorHex: "#0E9F6E", Icono: IconLogica },
  { slug: "geografia", nombre: "Geografía", colorHex: "#1E7A8C", Icono: IconGeometria },
  { slug: "quimia", nombre: "Quimia", colorHex: "#C026D3", Icono: IconQuimica },
  { slug: "anatomia", nombre: "Anatomía", colorHex: "#8B2942", Icono: IconAnatomia },
  { slug: "melodia", nombre: "Melodía", colorHex: "#B8860B", Icono: IconMelodia },
  { slug: "trigonometria", nombre: "Trigonometría", colorHex: "#84CC16", Icono: IconTrigonometria },
  { slug: "historia", nombre: "Historia", colorHex: "#A0522D", Icono: IconHistoria },
];
