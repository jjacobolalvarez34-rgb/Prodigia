// Ampliación de la tienda (pedido 2026-10-10: «agrega MÁS cosas, de todo tipo»).
// Datos puros, sin importar nada de catalogo.ts (que sí importa esto): marcos de
// colores, fondos, estelas, efectos, sonidos, emotes, títulos y paquetes nuevos.
// La migración 0275 se GENERA desde acá (catalogoAmpliado.test.ts la compara).
//
// Precios en la escala actual de la tienda (común ~400–1000, raro ~1200–2000,
// épico ~2400–3600, legendario ~6000). Cuando se aplique la economía nueva
// (docs/economy/PLAN_ECONOMIA.md) se reescalan todos juntos desde la tabla de precios.

export type RarezaAmpliada = "comun" | "raro" | "epico" | "legendario";

// Marcos con aro de colores que gira (mismo dibujo que los de temporada).
export const MARCOS_ESTILO: { slug: string; nombre: string; colores: string[]; rareza: RarezaAmpliada; precio: number }[] = [
  { slug: "estilo_artico", nombre: "Ártico", colores: ["#E1F5FE", "#80D8FF", "#FFFFFF"], rareza: "comun", precio: 900 },
  { slug: "estilo_medianoche", nombre: "Medianoche", colores: ["#0A0E27", "#3949AB", "#C5CAE9"], rareza: "comun", precio: 900 },
  { slug: "estilo_menta", nombre: "Menta", colores: ["#00BFA5", "#A7FFEB", "#E0F2F1"], rareza: "comun", precio: 900 },
  { slug: "estilo_sakura", nombre: "Sakura", colores: ["#F8BBD0", "#FF80AB", "#FFFFFF"], rareza: "raro", precio: 1800 },
  { slug: "estilo_oceano", nombre: "Océano profundo", colores: ["#0D47A1", "#00BCD4", "#B2EBF2"], rareza: "raro", precio: 1800 },
  { slug: "estilo_esmeralda", nombre: "Esmeralda real", colores: ["#004D40", "#00C853", "#B9F6CA"], rareza: "raro", precio: 1800 },
  { slug: "estilo_rubi", nombre: "Rubí", colores: ["#7F0000", "#FF1744", "#FF8A80"], rareza: "raro", precio: 1800 },
  { slug: "estilo_zafiro", nombre: "Zafiro", colores: ["#0D1B5E", "#2962FF", "#82B1FF"], rareza: "raro", precio: 1800 },
  { slug: "estilo_amatista", nombre: "Amatista", colores: ["#4A148C", "#AA00FF", "#EA80FC"], rareza: "raro", precio: 1800 },
  { slug: "estilo_atardecer", nombre: "Atardecer", colores: ["#FF6F00", "#F50057", "#7C4DFF"], rareza: "raro", precio: 1800 },
  { slug: "estilo_oro_rosa", nombre: "Oro rosa", colores: ["#B76E79", "#F7CAC9", "#FFD8B1"], rareza: "raro", precio: 2000 },
  { slug: "estilo_fenix", nombre: "Fénix", colores: ["#FF3D00", "#FFB300", "#FFF176"], rareza: "epico", precio: 3200 },
  { slug: "estilo_lava", nombre: "Lava", colores: ["#3E0000", "#FF6D00", "#FFD600"], rareza: "epico", precio: 3000 },
  { slug: "estilo_obsidiana", nombre: "Obsidiana dorada", colores: ["#111111", "#FFD54F", "#5D4037"], rareza: "epico", precio: 3000 },
  { slug: "estilo_cyberpunk", nombre: "Cyberpunk", colores: ["#FF00E5", "#00F0FF", "#FFEA00"], rareza: "epico", precio: 3400 },
  { slug: "estilo_galaxia", nombre: "Galaxia", colores: ["#1A0B3D", "#7C4DFF", "#FF4FD8", "#40C4FF"], rareza: "epico", precio: 3600 },
  { slug: "estilo_arcoiris", nombre: "Arcoíris", colores: ["#EF4444", "#F59E0B", "#FACC15", "#22C55E", "#3B82F6", "#8B5CF6"], rareza: "legendario", precio: 6000 },
  { slug: "estilo_holograma", nombre: "Holograma", colores: ["#FF9AE5", "#9AF5FF", "#C3FF9A", "#FFE59A"], rareza: "legendario", precio: 6500 },
];

// Fondos de Placa (degradé que se mueve lento, igual que los de siempre).
export const FONDOS_ESTILO = [
  { valor: "artico", nombre: "Ártico", colores: ["#0A2540", "#80D8FF", "#E1F5FE", "#0A2540"], rareza: "comun", precio: 1000 },
  { valor: "selva", nombre: "Selva", colores: ["#0B2A12", "#1B5E20", "#AEEA00", "#0B2A12"], rareza: "comun", precio: 1000 },
  { valor: "desierto", nombre: "Desierto", colores: ["#3E2723", "#D4A373", "#FFE0B2", "#3E2723"], rareza: "comun", precio: 1000 },
  { valor: "medianoche", nombre: "Medianoche", colores: ["#05060F", "#1A237E", "#5C6BC0", "#05060F"], rareza: "comun", precio: 1000 },
  { valor: "atardecer", nombre: "Atardecer", colores: ["#2B0A3D", "#FF6F00", "#F50057", "#2B0A3D"], rareza: "raro", precio: 1600 },
  { valor: "sakura", nombre: "Sakura", colores: ["#3D0F25", "#F48FB1", "#FFE4EC", "#3D0F25"], rareza: "raro", precio: 1600 },
  { valor: "lava", nombre: "Lava", colores: ["#1A0000", "#B71C1C", "#FF6D00", "#1A0000"], rareza: "raro", precio: 1600 },
  { valor: "caramelo", nombre: "Caramelo", colores: ["#4A1942", "#FF8FAB", "#FFD6A5", "#4A1942"], rareza: "raro", precio: 1600 },
  { valor: "tormenta", nombre: "Tormenta", colores: ["#0F1418", "#37474F", "#90A4AE", "#0F1418"], rareza: "raro", precio: 1600 },
  { valor: "coral", nombre: "Arrecife", colores: ["#082F49", "#FF7F50", "#FFD3B6", "#082F49"], rareza: "raro", precio: 1600 },
  { valor: "galaxia", nombre: "Galaxia", colores: ["#0B0430", "#4A1B8C", "#FF4FD8", "#0B0430"], rareza: "epico", precio: 2800 },
  { valor: "neon", nombre: "Neón", colores: ["#0D0221", "#FF00E5", "#00F0FF", "#0D0221"], rareza: "epico", precio: 2800 },
] as const satisfies readonly { valor: string; nombre: string; colores: readonly string[]; rareza: RarezaAmpliada; precio: number }[];

export type FondoEstilo = (typeof FONDOS_ESTILO)[number]["valor"];

export function degradeFondoEstilo(valor: string): string | null {
  const f = FONDOS_ESTILO.find((x) => x.valor === valor);
  return f ? `linear-gradient(120deg, ${f.colores.join(", ")})` : null;
}

// Estelas de la racha: base y punta de la llama.
export const ESTELAS_NUEVAS: { valor: string; nombre: string; base: string; punta: string; rareza: RarezaAmpliada; precio: number }[] = [
  { valor: "rosa", nombre: "Rosa", base: "#DB2777", punta: "#FBCFE8", rareza: "comun", precio: 1200 },
  { valor: "hielo", nombre: "Hielo", base: "#0284C7", punta: "#E0F2FE", rareza: "raro", precio: 1600 },
  { valor: "toxica", nombre: "Tóxica", base: "#65A30D", punta: "#D9F99D", rareza: "raro", precio: 1600 },
  { valor: "fantasma", nombre: "Fantasma", base: "#94A3B8", punta: "#F8FAFC", rareza: "raro", precio: 2000 },
  { valor: "lava", nombre: "Lava", base: "#B91C1C", punta: "#FDBA74", rareza: "raro", precio: 2000 },
  { valor: "solar", nombre: "Solar", base: "#F59E0B", punta: "#FFFBEB", rareza: "epico", precio: 2400 },
  { valor: "obsidiana", nombre: "Obsidiana", base: "#1F2937", punta: "#A78BFA", rareza: "epico", precio: 2800 },
];

// Efectos de acierto (formas que ya se dibujan en la web y la app).
export const EFECTOS_NUEVOS: { valor: string; nombre: string; forma: "chispas" | "confeti" | "burbujas" | "notas" | "pixeles" | "estrellas" | "glifo"; colores: string[]; glifo?: string; rareza: RarezaAmpliada; precio: number }[] = [
  { valor: "corazones", nombre: "Corazones", forma: "glifo", colores: ["#FF4D8D", "#FF8FB1", "#FFC2D4"], glifo: "♥", rareza: "comun", precio: 1200 },
  { valor: "copos", nombre: "Copos de nieve", forma: "glifo", colores: ["#E0F2FE", "#7DD3FC", "#FFFFFF"], glifo: "❄", rareza: "comun", precio: 1200 },
  { valor: "fuegos", nombre: "Fuegos artificiales", forma: "chispas", colores: ["#FF3D00", "#FFB300", "#FFF176", "#FF4081"], rareza: "raro", precio: 1600 },
  { valor: "rayos", nombre: "Rayos", forma: "glifo", colores: ["#FACC15", "#FDE68A", "#FFFFFF"], glifo: "⚡", rareza: "raro", precio: 1600 },
  { valor: "hojas", nombre: "Hojas al viento", forma: "glifo", colores: ["#22C55E", "#86EFAC", "#A3E635"], glifo: "❦", rareza: "raro", precio: 1600 },
  { valor: "dados", nombre: "Dados", forma: "glifo", colores: ["#FFFFFF", "#F1F5F9", "#FFC53D"], glifo: "⚄", rareza: "raro", precio: 1600 },
  { valor: "matematicas", nombre: "Matemáticas", forma: "glifo", colores: ["#A794FF", "#4FE0F5", "#FFC53D"], glifo: "∑", rareza: "raro", precio: 2000 },
  { valor: "galaxia", nombre: "Polvo de galaxia", forma: "estrellas", colores: ["#C084FC", "#F0ABFC", "#7DD3FC", "#FFFFFF"], rareza: "epico", precio: 2400 },
];

// Sonidos de acierto (la app usa los .wav que genera mobile/scripts/generar-sonidos.py).
export const SONIDOS_NUEVOS: { valor: string; nombre: string; notas: { rel: number; inicio: number; duracion: number; onda: "sine" | "square" | "triangle"; volumen: number }[]; rareza: RarezaAmpliada; precio: number }[] = [
  {
    valor: "xilofono",
    nombre: "Xilófono",
    notas: [
      { rel: 2, inicio: 0, duracion: 0.18, onda: "sine", volumen: 0.12 },
      { rel: 4, inicio: 0, duracion: 0.06, onda: "sine", volumen: 0.03 },
    ],
    rareza: "comun",
    precio: 1000,
  },
  {
    valor: "arcade",
    nombre: "Arcade",
    notas: [
      { rel: 1, inicio: 0, duracion: 0.05, onda: "square", volumen: 0.05 },
      { rel: 1.25, inicio: 0.05, duracion: 0.05, onda: "square", volumen: 0.05 },
      { rel: 1.5, inicio: 0.1, duracion: 0.05, onda: "square", volumen: 0.05 },
      { rel: 2, inicio: 0.15, duracion: 0.12, onda: "square", volumen: 0.05 },
    ],
    rareza: "comun",
    precio: 1200,
  },
  {
    valor: "arpa",
    nombre: "Arpa",
    notas: [
      { rel: 1, inicio: 0, duracion: 0.35, onda: "triangle", volumen: 0.08 },
      { rel: 1.25, inicio: 0.06, duracion: 0.35, onda: "triangle", volumen: 0.07 },
      { rel: 1.5, inicio: 0.12, duracion: 0.45, onda: "triangle", volumen: 0.07 },
    ],
    rareza: "raro",
    precio: 1500,
  },
  {
    valor: "cristal",
    nombre: "Cristal",
    notas: [
      { rel: 3, inicio: 0, duracion: 0.5, onda: "sine", volumen: 0.06 },
      { rel: 4.5, inicio: 0.02, duracion: 0.4, onda: "sine", volumen: 0.03 },
      { rel: 6, inicio: 0.04, duracion: 0.3, onda: "sine", volumen: 0.02 },
    ],
    rareza: "raro",
    precio: 1500,
  },
];

// Emotes para los duelos.
export const EMOTES_NUEVOS: { valor: string; emoji: string; texto: string; precio: number }[] = [
  { valor: "jaja", emoji: "😂", texto: "¡Jajaja!", precio: 400 },
  { valor: "respeto", emoji: "🫡", texto: "Respeto", precio: 400 },
  { valor: "ojos", emoji: "👀", texto: "Te estoy viendo", precio: 400 },
  { valor: "fuerza", emoji: "💪", texto: "¡Con todo!", precio: 400 },
  { valor: "suerte", emoji: "🍀", texto: "¡Suerte!", precio: 400 },
  { valor: "casi", emoji: "😅", texto: "Uy, casi", precio: 400 },
  { valor: "pensando", emoji: "🤔", texto: "Hmm…", precio: 400 },
  { valor: "corazon", emoji: "❤️", texto: "¡Gran partida!", precio: 400 },
  { valor: "mente", emoji: "🤯", texto: "¡Mente volada!", precio: 600 },
  { valor: "facil", emoji: "😎", texto: "Muy fácil", precio: 600 },
  { valor: "blanco", emoji: "🎯", texto: "¡En el blanco!", precio: 600 },
  { valor: "revancha", emoji: "😤", texto: "¡Revancha!", precio: 600 },
  { valor: "congelado", emoji: "🥶", texto: "¡Te congelé!", precio: 600 },
  { valor: "cohete", emoji: "🚀", texto: "¡A toda velocidad!", precio: 600 },
  { valor: "fiesta", emoji: "🎉", texto: "¡Fiesta!", precio: 600 },
  { valor: "sueno", emoji: "😴", texto: "Zzz…", precio: 600 },
  { valor: "goat", emoji: "🐐", texto: "El mejor de todos", precio: 900 },
  { valor: "campeon", emoji: "🏆", texto: "¡Campeón!", precio: 900 },
];

// Títulos para la Placa.
export const TITULOS_NUEVOS: { item: string; valor: string; nombre: string; rareza: RarezaAmpliada; precio: number }[] = [
  { item: "titulo_mente_brillante", valor: "tienda-mente-brillante", nombre: "Mente Brillante", rareza: "raro", precio: 1500 },
  { item: "titulo_cazarrecords", valor: "tienda-cazarrecords", nombre: "Cazarrécords", rareza: "raro", precio: 1500 },
  { item: "titulo_maestro_zen", valor: "tienda-maestro-zen", nombre: "Calma Zen", rareza: "raro", precio: 1500 },
  { item: "titulo_viajero_saber", valor: "tienda-viajero-saber", nombre: "Viajero del Saber", rareza: "raro", precio: 1500 },
  { item: "titulo_rey_duelos", valor: "tienda-rey-duelos", nombre: "Realeza de los Duelos", rareza: "raro", precio: 1500 },
  { item: "titulo_sabio_nocturno", valor: "tienda-sabio-nocturno", nombre: "Sabio Nocturno", rareza: "raro", precio: 1500 },
  { item: "titulo_imparable", valor: "tienda-imparable", nombre: "Imparable", rareza: "raro", precio: 1500 },
  { item: "titulo_curioso", valor: "tienda-curioso", nombre: "Curiosidad Profesional", rareza: "raro", precio: 1500 },
  { item: "titulo_genio_construccion", valor: "tienda-genio-construccion", nombre: "Genio en Construcción", rareza: "raro", precio: 1500 },
  { item: "titulo_velocidad_luz", valor: "tienda-velocidad-luz", nombre: "Velocidad Luz", rareza: "raro", precio: 1500 },
  { item: "titulo_leyenda_viva", valor: "tienda-leyenda-viva", nombre: "Leyenda Viva", rareza: "epico", precio: 3000 },
  { item: "titulo_cerebro_galactico", valor: "tienda-cerebro-galactico", nombre: "Cerebro Galáctico", rareza: "epico", precio: 3000 },
];

// Paquetes nuevos: −25 % sobre la suma, como los de siempre.
const sumaPack = (precios: number[]) => Math.floor(precios.reduce((a, b) => a + b, 0) * 0.75);
const precioMarco = (slug: string) => MARCOS_ESTILO.find((m) => m.slug === slug)!.precio;
const precioFondo = (valor: string) => FONDOS_ESTILO.find((f) => f.valor === valor)!.precio;
const precioEstela = (valor: string) => ESTELAS_NUEVAS.find((e) => e.valor === valor)!.precio;
const precioEfecto = (valor: string) => EFECTOS_NUEVOS.find((e) => e.valor === valor)!.precio;
const precioSonido = (valor: string) => SONIDOS_NUEVOS.find((e) => e.valor === valor)!.precio;
const precioEmote = (valor: string) => EMOTES_NUEVOS.find((e) => e.valor === valor)!.precio;

export const PAQUETES_NUEVOS: { item: string; nombre: string; items: string[]; precio: number }[] = [
  {
    item: "pack_galaxia",
    nombre: "Pack Galaxia",
    items: ["marco_estilo_galaxia", "fondo_estilo_galaxia", "efecto_galaxia"],
    precio: sumaPack([precioMarco("estilo_galaxia"), precioFondo("galaxia"), precioEfecto("galaxia")]),
  },
  {
    item: "pack_volcan",
    nombre: "Pack Volcán",
    items: ["marco_estilo_lava", "fondo_estilo_lava", "estela_lava", "efecto_fuegos"],
    precio: sumaPack([precioMarco("estilo_lava"), precioFondo("lava"), precioEstela("lava"), precioEfecto("fuegos")]),
  },
  {
    item: "pack_invierno",
    nombre: "Pack Invierno",
    items: ["marco_estilo_artico", "fondo_estilo_artico", "estela_hielo", "efecto_copos"],
    precio: sumaPack([precioMarco("estilo_artico"), precioFondo("artico"), precioEstela("hielo"), precioEfecto("copos")]),
  },
  {
    item: "pack_sonidos_2",
    nombre: "Pack Sonidos II",
    items: ["sonido_xilofono", "sonido_arcade", "sonido_arpa", "sonido_cristal"],
    precio: sumaPack(SONIDOS_NUEVOS.map((s) => s.precio)),
  },
  {
    item: "pack_emotes_2",
    nombre: "Pack Emotes II",
    items: ["emote_mente", "emote_facil", "emote_blanco", "emote_revancha", "emote_congelado", "emote_cohete"],
    precio: sumaPack(["mente", "facil", "blanco", "revancha", "congelado", "cohete"].map(precioEmote)),
  },
  {
    item: "pack_neon_total",
    nombre: "Pack Neón",
    items: ["marco_estilo_cyberpunk", "fondo_estilo_neon", "sonido_arcade"],
    precio: sumaPack([precioMarco("estilo_cyberpunk"), precioFondo("neon"), precioSonido("arcade")]),
  },
];

// Filas del catálogo (slug, categoría, valor, nombre, rareza, precio) de todo lo nuevo.
// ---------- Fuentes (0294, diseño aprobado el 2026-10-19; galería «fuentes») ----------
// Fuentes de nombre nuevas (se suman a las 9 de siempre). `familia` = la fuente de la
// web (variable CSS de next/font en layout.tsx) y de la app (mobile/assets/fonts/<archivo>.ttf).
export const FUENTES_NOMBRE_NUEVAS: { valor: string; nombre: string; familia: string; archivo: string; rareza: RarezaAmpliada; precio: number }[] = [
  { valor: "letrero", nombre: "Letrero", familia: "--font-bungee", archivo: "Bungee", rareza: "comun", precio: 400 },
  { valor: "retro", nombre: "Retro", familia: "--font-righteous", archivo: "Righteous", rareza: "comun", precio: 400 },
  { valor: "deportiva", nombre: "Deportiva", familia: "--font-russo-one", archivo: "RussoOne", rareza: "comun", precio: 400 },
  { valor: "pixel", nombre: "Pixel", familia: "--font-press-start", archivo: "PressStart2P", rareza: "comun", precio: 400 },
  { valor: "neon", nombre: "Neón", familia: "--font-monoton", archivo: "Monoton", rareza: "comun", precio: 400 },
  { valor: "cursiva_gruesa", nombre: "Cursiva gruesa", familia: "--font-lobster", archivo: "Lobster", rareza: "comun", precio: 400 },
  { valor: "marcador", nombre: "Marcador", familia: "--font-permanent-marker", archivo: "PermanentMarker", rareza: "raro", precio: 700 },
  { valor: "romana", nombre: "Romana", familia: "--font-cinzel", archivo: "Cinzel", rareza: "raro", precio: 700 },
  { valor: "comic", nombre: "Cómic", familia: "--font-bangers", archivo: "Bangers", rareza: "raro", precio: 700 },
  { valor: "redonda", nombre: "Redonda", familia: "--font-fredoka", archivo: "Fredoka", rareza: "raro", precio: 700 },
  { valor: "espacial", nombre: "Espacial", familia: "--font-audiowide", archivo: "Audiowide", rareza: "raro", precio: 700 },
  { valor: "estencil", nombre: "Esténcil", familia: "--font-black-ops", archivo: "BlackOpsOne", rareza: "raro", precio: 700 },
  { valor: "glitch", nombre: "Glitch", familia: "--font-rubik-glitch", archivo: "RubikGlitch", rareza: "epico", precio: 1000 },
  { valor: "pantalla", nombre: "Pantalla", familia: "--font-silkscreen", archivo: "Silkscreen", rareza: "epico", precio: 1000 },
  { valor: "caricatura", nombre: "Caricatura", familia: "--font-luckiest-guy", archivo: "LuckiestGuy", rareza: "epico", precio: 1000 },
  { valor: "maquina", nombre: "Máquina de escribir", familia: "--font-special-elite", archivo: "SpecialElite", rareza: "epico", precio: 1000 },
];

// Fuentes de puntos: cómo se ve el «+N» al acertar (cosmético nuevo). «clasica» es la
// de siempre y la tiene todo el mundo. `estilo`: color, contorno, sombra o degradé.
export interface EstiloPuntos {
  color: string;
  contorno?: string;
  sombra?: string;
  degrade?: [string, string, string];
  brillo?: string;
}
export const FUENTES_PUNTOS: { valor: string; nombre: string; familia: string | null; archivo: string | null; estilo: EstiloPuntos; rareza: RarezaAmpliada; precio: number }[] = [
  { valor: "arcade", nombre: "Arcade", familia: "--font-press-start", archivo: "PressStart2P", estilo: { color: "#5DE4FF", sombra: "#1B3A8F" }, rareza: "comun", precio: 300 },
  { valor: "comic", nombre: "Cómic", familia: "--font-bangers", archivo: "Bangers", estilo: { color: "#FFE14D", contorno: "#1A1200" }, rareza: "comun", precio: 300 },
  { valor: "pizarra", nombre: "Pizarra", familia: "--font-permanent-marker", archivo: "PermanentMarker", estilo: { color: "#F4F6FB" }, rareza: "comun", precio: 300 },
  { valor: "caramelo", nombre: "Caramelo", familia: "--font-luckiest-guy", archivo: "LuckiestGuy", estilo: { color: "#FF5D8F", contorno: "#FFFFFF" }, rareza: "raro", precio: 600 },
  { valor: "pixel", nombre: "Pixel", familia: "--font-silkscreen", archivo: "Silkscreen", estilo: { color: "#3DDC97", brillo: "#3DDC97" }, rareza: "raro", precio: 600 },
  { valor: "neon", nombre: "Neón", familia: "--font-monoton", archivo: "Monoton", estilo: { color: "#FF6FD8", brillo: "#FF6FD8" }, rareza: "epico", precio: 1200 },
  { valor: "fuego", nombre: "Fuego", familia: "--font-black-ops", archivo: "BlackOpsOne", estilo: { color: "#FF8A1F", degrade: ["#FFE08A", "#FF8A1F", "#E63946"], brillo: "#FF8A1F" }, rareza: "epico", precio: 1200 },
  { valor: "glitch", nombre: "Glitch", familia: "--font-rubik-glitch", archivo: "RubikGlitch", estilo: { color: "#F4F6FB", sombra: "#FF5D5D" }, rareza: "epico", precio: 1200 },
  { valor: "dorada", nombre: "Dorada", familia: "--font-cinzel", archivo: "Cinzel", estilo: { color: "#FFC53D", degrade: ["#FFF6D8", "#FFC53D", "#B8860B"], brillo: "#FFC53D" }, rareza: "legendario", precio: 6000 },
];

export function filasCatalogoAmpliado(): { item: string; categoria: string; valor: string; nombre: string; rareza: RarezaAmpliada; precio: number }[] {
  return [
    ...MARCOS_ESTILO.map((m) => ({ item: `marco_${m.slug}`, categoria: "marco", valor: m.slug, nombre: `Marco ${m.nombre}`, rareza: m.rareza, precio: m.precio })),
    ...FONDOS_ESTILO.map((f) => ({ item: `fondo_estilo_${f.valor}`, categoria: "fondo", valor: f.valor, nombre: `Fondo ${f.nombre}`, rareza: f.rareza as RarezaAmpliada, precio: f.precio })),
    ...ESTELAS_NUEVAS.map((e) => ({ item: `estela_${e.valor}`, categoria: "estela", valor: e.valor, nombre: `Estela ${e.nombre}`, rareza: e.rareza, precio: e.precio })),
    ...EFECTOS_NUEVOS.map((e) => ({ item: `efecto_${e.valor}`, categoria: "efecto", valor: e.valor, nombre: e.nombre, rareza: e.rareza, precio: e.precio })),
    ...SONIDOS_NUEVOS.map((s) => ({ item: `sonido_${s.valor}`, categoria: "sonido", valor: s.valor, nombre: `Sonido ${s.nombre}`, rareza: s.rareza, precio: s.precio })),
    ...EMOTES_NUEVOS.map((e) => ({ item: `emote_${e.valor}`, categoria: "emote", valor: e.valor, nombre: `${e.emoji} ${e.texto}`, rareza: (e.precio >= 900 ? "raro" : "comun") as RarezaAmpliada, precio: e.precio })),
    ...TITULOS_NUEVOS.map((t) => ({ item: t.item, categoria: "titulo", valor: t.valor, nombre: t.nombre, rareza: t.rareza, precio: t.precio })),
    ...FUENTES_NOMBRE_NUEVAS.map((f) => ({ item: `fuente_${f.valor}`, categoria: "fuente", valor: f.valor, nombre: `Fuente ${f.nombre}`, rareza: f.rareza, precio: f.precio })),
    ...FUENTES_PUNTOS.map((f) => ({ item: `puntos_${f.valor}`, categoria: "fuente_puntos", valor: f.valor, nombre: `Puntos ${f.nombre}`, rareza: f.rareza, precio: f.precio })),
  ];
}
