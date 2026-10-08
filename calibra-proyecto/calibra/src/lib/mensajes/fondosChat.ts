// Fondos de chat (0262): se compran una vez con Chispas y cualquiera de los dos
// puede ponerle uno a la conversación; lo ven los dos, en la web y en la app.
// Los precios tienen que coincidir con _precio_fondo_chat (lo comprueba el test).

export type PatronFondoChat = "estrellas" | "puntos" | "cuadricula" | "ondas" | null;

export interface FondoChat {
  slug: string;
  nombre: string;
  precio: number;
  // Degradé de arriba hacia abajo, siempre oscuro para que los mensajes se lean.
  colores: [string, string, ...string[]];
  patron: PatronFondoChat;
  // Color del dibujo del patrón.
  tinta: string;
}

export const FONDOS_CHAT: FondoChat[] = [
  { slug: "cuadriculado", nombre: "Cuaderno", precio: 300, colores: ["#141A2E", "#0E1222"], patron: "cuadricula", tinta: "#5A6BA8" },
  { slug: "estrellas", nombre: "Noche estrellada", precio: 300, colores: ["#0B1030", "#05070F"], patron: "estrellas", tinta: "#F4F6FB" },
  { slug: "oceano", nombre: "Océano", precio: 400, colores: ["#06324A", "#041A2A"], patron: "ondas", tinta: "#4FE0F5" },
  { slug: "bosque", nombre: "Bosque", precio: 400, colores: ["#0F3324", "#061A12"], patron: "puntos", tinta: "#4ADE80" },
  { slug: "atardecer", nombre: "Atardecer", precio: 500, colores: ["#4A1D3A", "#2A1030", "#120A1E"], patron: null, tinta: "#FFB627" },
  { slug: "aurora", nombre: "Aurora", precio: 500, colores: ["#0E3B3A", "#1D1A4A", "#0A0B1E"], patron: "estrellas", tinta: "#9B85FF" },
  { slug: "neon", nombre: "Ciudad de neón", precio: 700, colores: ["#2A0F45", "#0D0B26"], patron: "cuadricula", tinta: "#E36BF2" },
  { slug: "galaxia", nombre: "Galaxia", precio: 900, colores: ["#3A1460", "#14103A", "#05060F"], patron: "estrellas", tinta: "#FFC53D" },
];

export const FONDO_CHAT_POR_SLUG: Record<string, FondoChat> = Object.fromEntries(FONDOS_CHAT.map((f) => [f.slug, f]));

export function fondoChatDe(slug: string | null | undefined): FondoChat | null {
  return slug ? FONDO_CHAT_POR_SLUG[slug] ?? null : null;
}

// Puntos del patrón "estrellas"/"puntos" en un lienzo de 100 × 100, siempre los
// mismos (sin azar en el render).
export function puntosPatron(cantidad = 46): { x: number; y: number; r: number }[] {
  let a = 1234567;
  const azar = () => {
    a = (a * 1103515245 + 12345) % 2147483648;
    return a / 2147483648;
  };
  return Array.from({ length: cantidad }, () => ({ x: azar() * 100, y: azar() * 100, r: 0.25 + azar() * 0.55 }));
}
