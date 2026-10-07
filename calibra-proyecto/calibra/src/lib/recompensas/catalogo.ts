// Catálogo de la tienda ampliada y de las recompensas (propuesta aprobada el
// 2026-10-05, docs/economy/PROPUESTA_TIENDA_Y_RECOMPENSAS.md). Es el espejo en
// TypeScript de public.catalogo_cosmeticos y public.paquetes_tienda
// (0248_catalogo_cosmeticos_y_tienda.sql): la base decide precios y premios, esto
// solo dice cómo se ve cada cosa. catalogo.test.ts compara los precios con la
// migración. Lo usan la web y la app (docs/PARIDAD_APP_WEB.md), por eso no
// importa nada de React.

export type Rareza = "comun" | "raro" | "epico" | "legendario";

export type MundoCiudad =
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

// Color y glifo de cada ciudad (mismos colores que lib/mundos.ts).
export const CIUDADES: { slug: MundoCiudad; nombre: string; color: string; glifo: string; emoji: string }[] = [
  { slug: "numeria", nombre: "Numeria", color: "#6C4CF1", glifo: "∑", emoji: "🔢" },
  { slug: "enigmia", nombre: "Enigmia", color: "#0E9F6E", glifo: "?", emoji: "🧩" },
  { slug: "geografia", nombre: "Geografía", color: "#1E7A8C", glifo: "◍", emoji: "🌎" },
  { slug: "quimia", nombre: "Quimia", color: "#C026D3", glifo: "⚗", emoji: "🧪" },
  { slug: "anatomia", nombre: "Anatomía", color: "#8B2942", glifo: "♥", emoji: "🫀" },
  { slug: "melodia", nombre: "Melodía", color: "#B8860B", glifo: "♪", emoji: "🎵" },
  { slug: "trigonometria", nombre: "Trigonometría", color: "#84CC16", glifo: "θ", emoji: "📐" },
  { slug: "historia", nombre: "Historia", color: "#A0522D", glifo: "⌛", emoji: "🏛️" },
  { slug: "calculia", nombre: "Calculia", color: "#4338CA", glifo: "∫", emoji: "♾️" },
  { slug: "circuitia", nombre: "Circuitia", color: "#F59E0B", glifo: "⚡", emoji: "🔌" },
  { slug: "estadistica", nombre: "Estadística", color: "#0D9488", glifo: "σ", emoji: "📊" },
  { slug: "naipia", nombre: "Naipia", color: "#B91C1C", glifo: "♠", emoji: "🃏" },
  { slug: "codia", nombre: "Codia", color: "#06B6D4", glifo: "</>", emoji: "💻" },
];

export function ciudadDe(slug: string | null | undefined) {
  return CIUDADES.find((c) => c.slug === slug) ?? null;
}

// Aclara (+) u oscurece (−) un color hex.
export function tono(hex: string, cuanto: number): string {
  const n = parseInt(hex.slice(1), 16);
  const canal = (v: number) => Math.max(0, Math.min(255, Math.round(cuanto >= 0 ? v + (255 - v) * cuanto : v * (1 + cuanto))));
  const r = canal((n >> 16) & 255);
  const g = canal((n >> 8) & 255);
  const b = canal(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ---------- Estelas de racha: los colores de la llama del sprint ----------
export interface Estela {
  nombre: string;
  // Base y punta de la llama; `arcoiris` recorre todos los colores.
  base: string;
  punta: string;
  arcoiris?: boolean;
}

export const ESTELAS: Record<string, Estela> = {
  clasica: { nombre: "Clásica", base: "#FF6B35", punta: "#FFC53D" },
  azul: { nombre: "Azul", base: "#2563EB", punta: "#7DD3FC" },
  esmeralda: { nombre: "Esmeralda", base: "#059669", punta: "#6EE7B7" },
  violeta: { nombre: "Violeta", base: "#7C3AED", punta: "#E9D5FF" },
  dorada: { nombre: "Dorada", base: "#B8860B", punta: "#FFF3B0" },
  arcoiris: { nombre: "Arcoíris", base: "#EF4444", punta: "#3B82F6", arcoiris: true },
  ...Object.fromEntries(CIUDADES.map((c) => [`ciudad_${c.slug}`, { nombre: `Estela de ${c.nombre}`, base: c.color, punta: tono(c.color, 0.6) }])),
};

export const ARCOIRIS = ["#EF4444", "#F59E0B", "#FACC15", "#22C55E", "#3B82F6", "#8B5CF6"];

export function estelaDe(valor: string | null | undefined): Estela {
  return ESTELAS[valor ?? "clasica"] ?? ESTELAS.clasica;
}

// ---------- Efectos de acierto: lo que estalla al responder bien ----------
export type FormaEfecto = "chispas" | "confeti" | "burbujas" | "notas" | "pixeles" | "estrellas" | "glifo";

export interface Efecto {
  nombre: string;
  forma: FormaEfecto;
  colores: string[];
  glifo?: string;
}

export const EFECTOS: Record<string, Efecto> = {
  chispas: { nombre: "Chispas", forma: "chispas", colores: ["#FFC53D"] },
  confeti: { nombre: "Confeti", forma: "confeti", colores: ["#EF4444", "#F59E0B", "#22C55E", "#3B82F6", "#A855F7", "#EC4899"] },
  burbujas: { nombre: "Burbujas", forma: "burbujas", colores: ["#7DD3FC", "#A5F3FC", "#E0F2FE"] },
  notas: { nombre: "Notas musicales", forma: "notas", colores: ["#FFC53D", "#A794FF", "#4FE0F5"] },
  pixeles: { nombre: "Píxeles", forma: "pixeles", colores: ["#22C55E", "#4ADE80", "#FACC15", "#38BDF8"] },
  estrellas: { nombre: "Estrellas", forma: "estrellas", colores: ["#FFC53D", "#FFF3B0", "#FFFFFF"] },
  ...Object.fromEntries(CIUDADES.map((c) => [`ciudad_${c.slug}`, { nombre: `Destellos de ${c.nombre}`, forma: "glifo" as const, colores: [c.color, tono(c.color, 0.5)], glifo: c.glifo }])),
};

export function efectoDe(valor: string | null | undefined): Efecto {
  return EFECTOS[valor ?? "chispas"] ?? EFECTOS.chispas;
}

// Partículas de un estallido: posiciones finales, giro y tamaño, iguales en web y app.
export interface Particula {
  dx: number;
  dy: number;
  giro: number;
  tam: number;
  color: string;
  texto?: string;
}

export function particulasDe(efecto: Efecto, cantidad = 10, radio = 46): Particula[] {
  const texto = efecto.forma === "notas" ? ["♪", "♫", "♬"] : efecto.forma === "estrellas" ? ["★", "✦", "✧"] : efecto.forma === "glifo" ? [efecto.glifo ?? "★"] : null;
  return Array.from({ length: cantidad }, (_, i) => {
    const a = (i / cantidad) * Math.PI * 2 + (i % 2) * 0.3;
    const r = radio * (0.7 + ((i * 37) % 10) / 30);
    // Las burbujas y las notas suben; el resto se abre en círculo.
    const sube = efecto.forma === "burbujas" || efecto.forma === "notas" ? -radio * 0.6 : 0;
    return {
      dx: Math.cos(a) * r,
      dy: Math.sin(a) * r * (sube ? 0.5 : 1) + sube,
      giro: efecto.forma === "confeti" ? ((i * 73) % 360) - 180 : 0,
      tam: efecto.forma === "pixeles" ? 6 : efecto.forma === "burbujas" ? 7 + (i % 3) * 3 : efecto.forma === "confeti" ? 7 : 5,
      color: efecto.colores[i % efecto.colores.length],
      texto: texto ? texto[i % texto.length] : undefined,
    };
  });
}

// ---------- Sonidos de acierto ----------
// Cada paquete: notas (frecuencia relativa a la del acierto), onda, duración y
// caída. La web los sintetiza con Web Audio; la app usa los .wav generados con
// los mismos números (mobile/scripts/generar-sonidos.py).
export interface NotaSonido {
  rel: number;
  inicio: number;
  duracion: number;
  onda: "sine" | "square" | "triangle";
  volumen: number;
}

export const SONIDOS: Record<string, { nombre: string; notas: NotaSonido[] }> = {
  clasico: { nombre: "Clásico", notas: [{ rel: 1, inicio: 0, duracion: 0.22, onda: "sine", volumen: 0.12 }] },
  campanitas: {
    nombre: "Campanitas",
    notas: [
      { rel: 2, inicio: 0, duracion: 0.6, onda: "sine", volumen: 0.1 },
      { rel: 5.4, inicio: 0, duracion: 0.35, onda: "sine", volumen: 0.03 },
      { rel: 3, inicio: 0.07, duracion: 0.5, onda: "sine", volumen: 0.06 },
    ],
  },
  ochobits: {
    nombre: "8 bits",
    notas: [
      { rel: 1, inicio: 0, duracion: 0.07, onda: "square", volumen: 0.06 },
      { rel: 1.5, inicio: 0.06, duracion: 0.07, onda: "square", volumen: 0.06 },
      { rel: 2, inicio: 0.12, duracion: 0.1, onda: "square", volumen: 0.06 },
    ],
  },
  marimba: {
    nombre: "Marimba",
    notas: [
      { rel: 0.5, inicio: 0, duracion: 0.3, onda: "sine", volumen: 0.16 },
      { rel: 2, inicio: 0, duracion: 0.08, onda: "sine", volumen: 0.04 },
    ],
  },
};

// ---------- Emotes de duelo ----------
export const EMOTES: Record<string, { emoji: string; texto: string }> = {
  bien_jugado: { emoji: "👏", texto: "¡Bien jugado!" },
  hola: { emoji: "👋", texto: "¡Hola!" },
  fuego: { emoji: "🔥", texto: "¡Qué ritmo!" },
  uy: { emoji: "😅", texto: "¡Uy!" },
  gg: { emoji: "🤝", texto: "GG" },
  cerebro: { emoji: "🧠", texto: "¡A pensar!" },
  rayo: { emoji: "⚡", texto: "¡Rapidísimo!" },
  corona: { emoji: "👑", texto: "¡Reinado!" },
  ...Object.fromEntries(CIUDADES.map((c) => [`ciudad_${c.slug}`, { emoji: c.emoji, texto: `¡Viva ${c.nombre}!` }])),
};

export const EMOTES_GRATIS = ["bien_jugado", "hola"];

// ---------- Marcos de temporada y de colección ----------
export const MARCOS_TEMPORADA: { slug: string; nombre: string; temporada: number; colores: [string, string] }[] = [
  { slug: "temporada_aurora", nombre: "Aurora", temporada: 1, colores: ["#22D3EE", "#A855F7"] },
  { slug: "temporada_brasas", nombre: "Brasas", temporada: 2, colores: ["#F97316", "#DC2626"] },
  { slug: "temporada_escarcha", nombre: "Escarcha", temporada: 3, colores: ["#E0F2FE", "#38BDF8"] },
  { slug: "temporada_cosmos", nombre: "Cosmos", temporada: 4, colores: ["#6366F1", "#F472B6"] },
];

// Mismo cálculo que temporada_actual() de la base.
export function temporadaActual(fecha = new Date()): number {
  return ((fecha.getUTCMonth()) % 4) + 1;
}

// Marcos que no se venden ni salen en cápsulas: «Pionero» es el del Kit del
// Pionero (0258), con los colores de las 13 ciudades girando.
export const MARCOS_ESPECIALES: { slug: string; nombre: string; colores: string[] }[] = [
  { slug: "pionero", nombre: "Pionero", colores: CIUDADES.map((c) => c.color) },
];

// Marcos con aro de colores que gira: los de temporada y los especiales.
export function marcoTemporadaDe(slug: string | null | undefined): { slug: string; nombre: string; colores: string[] } | null {
  return MARCOS_TEMPORADA.find((m) => m.slug === slug) ?? MARCOS_ESPECIALES.find((m) => m.slug === slug) ?? null;
}

// "coleccion_quimia" → la ciudad del marco animado de colección.
export function ciudadDeMarcoColeccion(marco: string | null | undefined) {
  return marco?.startsWith("coleccion_") ? ciudadDe(marco.slice("coleccion_".length)) : null;
}

// Días que faltan para que cambie el marco de temporada.
export function diasHastaFinDeMes(fecha = new Date()): number {
  const fin = Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, 1);
  return Math.max(1, Math.ceil((fin - fecha.getTime()) / 86_400_000));
}

// ---------- Fondos de ciudad ----------
export function degradeFondoCiudad(slug: string): string | null {
  const c = ciudadDe(slug.replace(/^ciudad_/, ""));
  if (!c) return null;
  return `linear-gradient(120deg, ${tono(c.color, -0.7)}, ${c.color}, ${tono(c.color, 0.45)}, ${tono(c.color, -0.7)})`;
}

// ---------- Lo que se vende (espejo de catalogo_cosmeticos con vendible = true) ----------
export type CategoriaNueva = "estela" | "efecto" | "sonido" | "emote" | "ciudad_placa" | "titulo" | "fondo" | "marco";

export interface ItemCatalogo {
  item: string;
  categoria: CategoriaNueva;
  valor: string;
  nombre: string;
  precio: number;
  rareza: Rareza;
  vendible: boolean;
  mundo?: MundoCiudad;
  temporada?: number;
}

const ESTELAS_VENTA: [string, number, Rareza][] = [
  ["azul", 1200, "comun"],
  ["esmeralda", 1600, "raro"],
  ["violeta", 2000, "raro"],
  ["dorada", 2800, "epico"],
  ["arcoiris", 3500, "epico"],
];
const EFECTOS_VENTA: [string, number, Rareza][] = [
  ["confeti", 900, "comun"],
  ["burbujas", 1200, "comun"],
  ["notas", 1600, "raro"],
  ["pixeles", 2000, "raro"],
  ["estrellas", 2400, "epico"],
];
const SONIDOS_VENTA: [string, number, Rareza][] = [
  ["campanitas", 800, "comun"],
  ["ochobits", 1200, "comun"],
  ["marimba", 1500, "raro"],
];
const EMOTES_VENTA: [string, number][] = [
  ["fuego", 400],
  ["uy", 400],
  ["gg", 400],
  ["cerebro", 600],
  ["rayo", 600],
  ["corona", 900],
];

export const TITULOS_TIENDA: { item: string; valor: string; nombre: string }[] = [
  { item: "titulo_mente_veloz", valor: "tienda-mente-veloz", nombre: "Mente Veloz" },
  { item: "titulo_curiosidad", valor: "tienda-curiosidad", nombre: "Curiosidad Infinita" },
  { item: "titulo_alma_estratega", valor: "tienda-alma-estratega", nombre: "Alma Estratega" },
  { item: "titulo_corazon_valiente", valor: "tienda-corazon-valiente", nombre: "Corazón Valiente" },
  { item: "titulo_luz_ciudad", valor: "tienda-luz-ciudad", nombre: "Luz de la Ciudad" },
];

export const CATALOGO_NUEVO: ItemCatalogo[] = [
  ...ESTELAS_VENTA.map(([v, precio, rareza]) => ({ item: `estela_${v}`, categoria: "estela" as const, valor: v, nombre: `Estela ${ESTELAS[v].nombre}`, precio, rareza, vendible: true })),
  ...EFECTOS_VENTA.map(([v, precio, rareza]) => ({ item: `efecto_${v}`, categoria: "efecto" as const, valor: v, nombre: EFECTOS[v].nombre, precio, rareza, vendible: true })),
  ...SONIDOS_VENTA.map(([v, precio, rareza]) => ({ item: `sonido_${v}`, categoria: "sonido" as const, valor: v, nombre: SONIDOS[v].nombre, precio, rareza, vendible: true })),
  ...EMOTES_VENTA.map(([v, precio]) => ({ item: `emote_${v}`, categoria: "emote" as const, valor: v, nombre: `${EMOTES[v].emoji} ${EMOTES[v].texto}`, precio, rareza: "comun" as const, vendible: true })),
  ...TITULOS_TIENDA.map((t) => ({ item: t.item, categoria: "titulo" as const, valor: t.valor, nombre: t.nombre, precio: 1500, rareza: "raro" as const, vendible: true })),
  ...MARCOS_TEMPORADA.map((m) => ({ item: `marco_${m.slug}`, categoria: "marco" as const, valor: m.slug, nombre: `Marco ${m.nombre}`, precio: 4500, rareza: "epico" as const, vendible: true, temporada: m.temporada })),
  ...CIUDADES.flatMap((c) => [
    { item: `fondo_ciudad_${c.slug}`, categoria: "fondo" as const, valor: `ciudad_${c.slug}`, nombre: `Fondo ${c.nombre}`, precio: 1600, rareza: "raro" as const, vendible: true, mundo: c.slug },
    { item: `emote_ciudad_${c.slug}`, categoria: "emote" as const, valor: `ciudad_${c.slug}`, nombre: `${c.emoji} ¡Viva ${c.nombre}!`, precio: 700, rareza: "comun" as const, vendible: true, mundo: c.slug },
    { item: `ciudad_placa_${c.slug}`, categoria: "ciudad_placa" as const, valor: c.slug, nombre: `Ciudad de ${c.nombre} en tu Placa`, precio: 2000, rareza: "raro" as const, vendible: true, mundo: c.slug },
    { item: `estela_ciudad_${c.slug}`, categoria: "estela" as const, valor: `ciudad_${c.slug}`, nombre: `Estela de ${c.nombre}`, precio: 1600, rareza: "raro" as const, vendible: false, mundo: c.slug },
    { item: `efecto_ciudad_${c.slug}`, categoria: "efecto" as const, valor: `ciudad_${c.slug}`, nombre: `Destellos de ${c.nombre}`, precio: 1600, rareza: "raro" as const, vendible: false, mundo: c.slug },
    { item: `titulo_ciudad_${c.slug}`, categoria: "titulo" as const, valor: `habitante-${c.slug}`, nombre: `Habitante de ${c.nombre}`, precio: 3000, rareza: "epico" as const, vendible: false, mundo: c.slug },
  ]),
];

// Las 6 piezas de la colección de una ciudad (marco del mundo, fondo, estela,
// efecto, emote y título). Completarla da el marco animado de colección.
export function piezasColeccion(mundo: string): string[] {
  return [`marco_${mundo}`, `fondo_ciudad_${mundo}`, `estela_ciudad_${mundo}`, `efecto_ciudad_${mundo}`, `emote_ciudad_${mundo}`, `titulo_ciudad_${mundo}`];
}

// ---------- Paquetes y utilidades nuevas ----------
export const PAQUETES: { item: string; nombre: string; items: string[]; precio: number }[] = [
  { item: "pack_noche", nombre: "Pack Noche", items: ["fondo_nebulosa", "marco_neon_violeta", "estela_violeta"], precio: 7500 },
  { item: "pack_fuego", nombre: "Pack Fuego", items: ["fondo_dorado", "estela_dorada", "efecto_estrellas"], precio: 5250 },
  { item: "pack_sonidos", nombre: "Pack Sonidos", items: ["sonido_campanitas", "sonido_ochobits", "sonido_marimba"], precio: 2625 },
  { item: "pack_emotes", nombre: "Pack Emotes", items: ["emote_fuego", "emote_uy", "emote_gg", "emote_cerebro", "emote_rayo", "emote_corona"], precio: 2475 },
];

export const UTILIDADES_NUEVAS: { item: "pista" | "segunda_oportunidad" | "cofre_hielos"; nombre: string; descripcion: string; precio: number }[] = [
  { item: "pista", nombre: "Pista", descripcion: "Descarta 2 opciones incorrectas de una pregunta. No vale en duelos.", precio: 300 },
  { item: "segunda_oportunidad", nombre: "Segunda oportunidad", descripcion: "Si fallas, vuelves a responder la misma pregunta sin que cuente el error. No vale en duelos.", precio: 500 },
  { item: "cofre_hielos", nombre: "Cofre de hielos", descripcion: "3 hielos por menos de lo que cuestan sueltos.", precio: 800 },
];

export const COLOR_RAREZA: Record<Rareza, string> = { comun: "#8892B0", raro: "#4FE0F5", epico: "#B07CFF", legendario: "#FFB627" };
export const NOMBRE_RAREZA: Record<Rareza, string> = { comun: "Común", raro: "Raro", epico: "Épico", legendario: "Legendario" };

// ---------- Cápsulas ----------
export type TipoCapsula = "diaria" | "misiones" | "racha" | "nivel" | "ciudad" | "liga" | "liga_bronce" | "liga_plata" | "liga_oro" | "coleccion";

export const CAPSULAS: Record<TipoCapsula, { nombre: string; colores: [string, string] }> = {
  diaria: { nombre: "Cápsula diaria", colores: ["#7C5CFF", "#FFC53D"] },
  misiones: { nombre: "Cápsula de misiones", colores: ["#4FE0F5", "#7C5CFF"] },
  racha: { nombre: "Cápsula de racha", colores: ["#FF6B35", "#FFC53D"] },
  nivel: { nombre: "Cápsula de nivel", colores: ["#A794FF", "#FFC53D"] },
  ciudad: { nombre: "Cápsula de ciudad", colores: ["#22C55E", "#4FE0F5"] },
  liga: { nombre: "Cápsula de liga", colores: ["#8892B0", "#C7D2FE"] },
  liga_bronce: { nombre: "Cápsula de liga · Bronce", colores: ["#B08D57", "#E8C99A"] },
  liga_plata: { nombre: "Cápsula de liga · Plata", colores: ["#B8C4D9", "#FFFFFF"] },
  liga_oro: { nombre: "Cápsula de liga · Oro", colores: ["#E8B34D", "#FFF3B0"] },
  coleccion: { nombre: "Cápsula de colección", colores: ["#FFB627", "#B07CFF"] },
};

// Colores de una cápsula de ciudad: los de su mundo.
export function coloresCapsula(tipo: TipoCapsula, mundo?: string | null): [string, string] {
  const c = ciudadDe(mundo);
  if (c && (tipo === "ciudad" || tipo === "coleccion")) return [c.color, tono(c.color, 0.55)];
  return CAPSULAS[tipo]?.colores ?? CAPSULAS.diaria.colores;
}

// Texto de cada premio posible (para "¿Qué puede salir?").
export function textoPremio(premio: string, minimo: number, maximo: number, mundo?: string | null): string {
  const c = ciudadDe(mundo);
  if (premio === "chispas") return minimo === maximo ? `${minimo} Chispas` : `${minimo}–${maximo} Chispas`;
  if (premio === "hielo") return "1 hielo";
  if (premio === "tiempo_extra") return "1 × +3 segundos";
  if (premio === "escudo") return "1 escudo";
  if (premio.startsWith("cosmetico_")) return `Un cosmético ${NOMBRE_RAREZA[premio.slice(10) as Rareza].toLowerCase()}`;
  if (premio === "coleccion") return c ? `Una pieza de la colección de ${c.nombre} que te falte` : "Una pieza de la colección de la ciudad";
  if (premio === "marco_coleccion") return c ? `El marco de colección de ${c.nombre}` : "El marco de colección";
  return premio;
}

// ---------- Misiones del día ----------
export function textoMision(tipo: string, meta: number, mundo: string | null): string {
  switch (tipo) {
    case "aciertos":
      return `Acierta ${meta} respuestas`;
    case "aciertos_mundo":
      return `Acierta ${meta} en ${ciudadDe(mundo)?.nombre ?? "un mundo"}`;
    case "experiencia":
      return `Gana ${meta} de Experiencia`;
    case "duelo":
      return "Gana un duelo";
    case "leccion":
      return "Completa una lección";
    case "mundos":
      return `Practica en ${meta} mundos distintos`;
    case "rapidas":
      return `Responde bien ${meta} veces en menos de 3 s`;
    case "reto_diario":
      return "Completa el reto diario";
    default:
      return tipo;
  }
}

// Premio de cada día del calendario (espejo de premios_calendario()).
export const PREMIOS_CALENDARIO: { dia: number; premio: "chispas" | "hielo" | "tiempo_extra" | "estrellas"; cantidad: number }[] = [
  { dia: 1, premio: "chispas", cantidad: 50 },
  { dia: 2, premio: "chispas", cantidad: 75 },
  { dia: 3, premio: "hielo", cantidad: 1 },
  { dia: 4, premio: "chispas", cantidad: 100 },
  { dia: 5, premio: "tiempo_extra", cantidad: 1 },
  { dia: 6, premio: "chispas", cantidad: 150 },
  // Desde 0259: 3 estrellas en tu constelación favorita (antes, una cápsula).
  { dia: 7, premio: "estrellas", cantidad: 3 },
];

export function textoPremioCalendario(p: (typeof PREMIOS_CALENDARIO)[number]): string {
  if (p.premio === "chispas") return `${p.cantidad} Chispas`;
  if (p.premio === "hielo") return "1 hielo";
  if (p.premio === "tiempo_extra") return "+3 s";
  return `${p.cantidad} estrellas`;
}

// Nombre de un cosmético por su slug (catálogo nuevo o de antes).
export function nombreCosmetico(slug: string): string {
  return CATALOGO_NUEVO.find((i) => i.item === slug)?.nombre ?? slug.replace(/_/g, " ");
}
