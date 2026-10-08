// Tokens de "Noche de Prodigia" (docs/app-nativa/02-SISTEMA-VISUAL.md §2-4 y
// maquetas-android.html). Cuando exista packages/tokens, estos valores salen de ahí
// y los comparte la web.
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
  primarioNeon: "#9B85FF",
  primarioBase: "#6C4CF1",
  primarioLabio: "#4A31B8",
  primarioClaro: "#B9A8FF",
  logro: "#FFB627",
  logroLabio: "#B87800",
  correcto: "#3DDC97",
  error: "#FF5D5D",
  racha: "#FF8A3D",
} as const;

export const espacio = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radio = { chip: 12, boton: 16, tarjeta: 20, sprint: 28 } as const;

// Fuentes de la marca (cargadas en _layout.tsx). En Android una fuente propia ya
// trae su peso: nunca se combina con fontWeight.
export const fuente = {
  display: "SpaceGrotesk_700Bold",
  displaySemi: "SpaceGrotesk_600SemiBold",
  cuerpo: "Inter_400Regular",
  cuerpoMedio: "Inter_500Medium",
  cuerpoFuerte: "Inter_600SemiBold",
  cuerpoBold: "Inter_700Bold",
  mono: "JetBrainsMono_700Bold",
  monoMedio: "JetBrainsMono_500Medium",
} as const;

// Compatibilidad con pantallas viejas que usaban la mono del sistema.
export const mono = fuente.mono;

// Resplandor de color (boxShadow de la nueva arquitectura de React Native).
export function brillo(hex: string, radioPx = 26, alfa = 0.35): string {
  return `0px 0px ${radioPx}px ${conAlfa(hex, alfa)}`;
}

export function conAlfa(hex: string, alfa: number): string {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
}

// Oscurece un color (labio del botón con volumen: el mismo color 35-45 % más oscuro).
export function oscurecer(hex: string, factor = 0.6): string {
  const n = parseInt(hex.slice(1, 7), 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function aclarar(hex: string, cuanto = 0.35): string {
  const n = parseInt(hex.slice(1, 7), 16);
  const mezclar = (c: number) => Math.round(c + (255 - c) * cuanto);
  return `#${((1 << 24) | (mezclar((n >> 16) & 255) << 16) | (mezclar((n >> 8) & 255) << 8) | mezclar(n & 255)).toString(16).slice(1)}`;
}

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
  | "codia"
  | "dinamia"
  | "vitalia";

export interface Mundo {
  slug: MundoSlug;
  nombre: string;
  tema: string;
  base: string;
  neon: string;
  glifo: string;
  glifos: string[];
  // Solo los mundos que ya se pueden jugar en la app (el resto sigue en la web).
  enApp: boolean;
}

// Mismo orden y colores base que src/lib/mundos.ts de la web; neón y glifos de §2.2.
export const MUNDOS: Mundo[] = [
  { slug: "numeria", nombre: "Numeria", tema: "Cálculo mental", base: "#6C4CF1", neon: "#9B85FF", glifo: "÷", glifos: ["+", "−", "×", "÷"], enApp: true },
  { slug: "enigmia", nombre: "Enigmia", tema: "Lógica", base: "#0E9F6E", neon: "#2FD89B", glifo: "?", glifos: ["?", "◆", "▲"], enApp: true },
  { slug: "geografia", nombre: "Geografía", tema: "Países y mapas", base: "#1E7A8C", neon: "#3FC1D6", glifo: "◎", glifos: ["◎", "⌖", "✈"], enApp: true },
  { slug: "quimia", nombre: "Quimia", tema: "Química", base: "#C026D3", neon: "#E36BF2", glifo: "⚛", glifos: ["⚛", "⬡", "H₂O"], enApp: true },
  { slug: "anatomia", nombre: "Anatomía", tema: "Cuerpo humano", base: "#8B2942", neon: "#E0607E", glifo: "♥", glifos: ["♥", "✚"], enApp: true },
  { slug: "melodia", nombre: "Melodía", tema: "Música", base: "#B8860B", neon: "#F2C14E", glifo: "♪", glifos: ["♪", "♫", "♬"], enApp: true },
  { slug: "trigonometria", nombre: "Trigonometría", tema: "Ángulos", base: "#84CC16", neon: "#A8E84A", glifo: "θ", glifos: ["△", "θ", "π"], enApp: true },
  { slug: "historia", nombre: "Historia", tema: "El pasado", base: "#A0522D", neon: "#E08A5C", glifo: "⌛", glifos: ["⌛", "⚔", "♜"], enApp: true },
  { slug: "calculia", nombre: "Calculia", tema: "Cálculo", base: "#4338CA", neon: "#8A83FF", glifo: "∫", glifos: ["∫", "∂", "Σ"], enApp: true },
  { slug: "circuitia", nombre: "Circuitia", tema: "Electricidad", base: "#F59E0B", neon: "#FFC247", glifo: "Ω", glifos: ["Ω", "⏚", "⚡"], enApp: true },
  { slug: "estadistica", nombre: "Estadística", tema: "Datos", base: "#0D9488", neon: "#2DD4BF", glifo: "σ", glifos: ["σ", "x̄", "%"], enApp: true },
  { slug: "naipia", nombre: "Naipia", tema: "Memoria de cartas", base: "#B91C1C", neon: "#F25C5C", glifo: "♠", glifos: ["♠", "♥", "♦", "♣"], enApp: true },
  { slug: "codia", nombre: "Codia", tema: "Programación", base: "#06B6D4", neon: "#4FE0F5", glifo: "</>", glifos: ["{", "}", "<", "/>"], enApp: true },
  { slug: "dinamia", nombre: "Dinamia", tema: "Física", base: "#2563EB", neon: "#60A5FA", glifo: "⇀", glifos: ["⇀", "g", "ΣF", "Δt"], enApp: true },
  { slug: "vitalia", nombre: "Vitalia", tema: "Biología", base: "#16A34A", neon: "#4ADE80", glifo: "✿", glifos: ["✿", "◉", "ADN", "❦"], enApp: true },
];

export const MUNDO_POR_SLUG = Object.fromEntries(MUNDOS.map((m) => [m.slug, m])) as Record<MundoSlug, Mundo>;
export const NUMERIA = MUNDO_POR_SLUG.numeria;

export function mundoDe(slug: string | null | undefined): Mundo | null {
  return slug && slug in MUNDO_POR_SLUG ? MUNDO_POR_SLUG[slug as MundoSlug] : null;
}
