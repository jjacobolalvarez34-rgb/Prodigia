// Tokens de "Noche de Prodigia" (docs/app-nativa/02-SISTEMA-VISUAL.md §2-4). Cuando exista
// packages/tokens, estos valores salen de ahí y los comparte la web.
export const color = {
  bg: "#090C14",
  bgHondo: "#05070D",
  surface1: "#12172A",
  surface2: "#171D34",
  surface3: "#1E2542",
  border: "#232B47",
  texto: "#F4F6FB",
  texto2: "#8892B0",
  primario: "#7C5CFF",
  logro: "#FFB627",
  correcto: "#3DDC97",
  error: "#FF5D5D",
  racha: "#FF8A3D",
} as const;

export const espacio = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radio = { chip: 12, boton: 16, tarjeta: 20, sprint: 28 } as const;

// Fuente monoespaciada del sistema para números (JetBrains Mono llega cuando se
// empaqueten las fuentes).
export const mono = "monospace";

export type MundoSlug =
  | "numeria"
  | "enigmia"
  | "geografia"
  | "quimia"
  | "anatomia"
  | "melodia"
  | "trigonometria"
  | "historia"
  | "calculia"
  | "circuitia"
  | "estadistica"
  | "naipia"
  | "codia";

export interface Mundo {
  slug: MundoSlug;
  nombre: string;
  base: string;
  neon: string;
  glifo: string;
  // Solo los mundos que ya se pueden jugar en la app (el resto sigue en la web).
  enApp: boolean;
}

// Mismo orden y colores base que src/lib/mundos.ts de la web; neón y glifos de §2.2.
export const MUNDOS: Mundo[] = [
  { slug: "numeria", nombre: "Numeria", base: "#6C4CF1", neon: "#9B85FF", glifo: "÷", enApp: true },
  { slug: "enigmia", nombre: "Enigmia", base: "#0E9F6E", neon: "#2FD89B", glifo: "?", enApp: false },
  { slug: "geografia", nombre: "Geografía", base: "#1E7A8C", neon: "#3FC1D6", glifo: "◎", enApp: true },
  { slug: "quimia", nombre: "Quimia", base: "#C026D3", neon: "#E36BF2", glifo: "⚛", enApp: false },
  { slug: "anatomia", nombre: "Anatomía", base: "#8B2942", neon: "#E0607E", glifo: "♥", enApp: false },
  { slug: "melodia", nombre: "Melodía", base: "#B8860B", neon: "#F2C14E", glifo: "♪", enApp: false },
  { slug: "trigonometria", nombre: "Trigonometría", base: "#84CC16", neon: "#A8E84A", glifo: "θ", enApp: false },
  { slug: "historia", nombre: "Historia", base: "#A0522D", neon: "#E08A5C", glifo: "⌛", enApp: false },
  { slug: "calculia", nombre: "Calculia", base: "#4338CA", neon: "#8A83FF", glifo: "∫", enApp: false },
  { slug: "circuitia", nombre: "Circuitia", base: "#F59E0B", neon: "#FFC247", glifo: "Ω", enApp: false },
  { slug: "estadistica", nombre: "Estadística", base: "#0D9488", neon: "#2DD4BF", glifo: "σ", enApp: false },
  { slug: "naipia", nombre: "Naipia", base: "#B91C1C", neon: "#F25C5C", glifo: "♠", enApp: false },
  { slug: "codia", nombre: "Codia", base: "#06B6D4", neon: "#4FE0F5", glifo: "</>", enApp: false },
];

export const NUMERIA = MUNDOS[0];
