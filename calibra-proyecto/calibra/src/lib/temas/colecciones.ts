import type { IdTema } from "./calendario";
import type { TipoParticula } from "./dibujos";

// Colecciones de los eventos (docs/eventos/PLAN_FESTIVIDADES.md capa 7 y
// economy/PLAN_ECONOMIA.md §7): cada fiesta grande trae sus piezas, que se ganan con
// las Fichas del evento (jugando) o se compran con Cometas. No se venden en el Bazar de
// siempre y vuelven el año siguiente. Las piezas usan las mismas categorías que la
// tienda (marco, fondo, estela, efecto, emote, título), así se ven igual en todas partes.

type Rareza = "comun" | "raro" | "epico" | "legendario";

// `migracion`: la que agrega el valor (sin ella, 0289). Los marcos y fondos nuevos tienen
// que entrar en la restricción de profiles de esa migración.
export const MARCOS_EVENTO: { slug: string; nombre: string; colores: string[]; rareza: Rareza; precio: number; migracion?: string }[] = [
  { slug: "evento_calabaza", nombre: "Calabaza", colores: ["#FF8A1F", "#1C1030", "#FFD36B"], rareza: "epico", precio: 3000 },
  { slug: "evento_esqueleto", nombre: "Esqueleto fosforescente", colores: ["#B8FFD9", "#3DDC97", "#FFFFFF"], rareza: "legendario", precio: 6000 },
  // Fiestas de noviembre a enero (0309).
  { slug: "evento_papel_picado", nombre: "Papel picado", colores: ["#FF5D8F", "#FF9F1C", "#3DDC97", "#A794FF"], rareza: "epico", precio: 3000, migracion: "0309" },
  { slug: "evento_calavera", nombre: "Calavera de azúcar", colores: ["#FFFFFF", "#FF5D8F", "#4FE0F5", "#FFC53D"], rareza: "legendario", precio: 6000, migracion: "0309" },
  { slug: "evento_diya", nombre: "Diya", colores: ["#FFC53D", "#FF7A1A", "#FFF3B0"], rareza: "epico", precio: 3000, migracion: "0309" },
  { slug: "evento_rangoli", nombre: "Rangoli", colores: ["#FF5D8F", "#FFC53D", "#3DDC97", "#7C5CFF", "#4FE0F5"], rareza: "legendario", precio: 6000, migracion: "0309" },
  { slug: "evento_cometa", nombre: "Cometa", colores: ["#5DE4FF", "#FFC53D", "#FFFFFF"], rareza: "epico", precio: 3000, migracion: "0309" },
  { slug: "evento_constelacion", nombre: "Constelación", colores: ["#FFC53D", "#5DE4FF", "#B07CFF", "#FFFFFF"], rareza: "legendario", precio: 6000, migracion: "0309" },
  { slug: "evento_baston", nombre: "Bastón de caramelo", colores: ["#E63946", "#FFFFFF", "#E63946", "#FFFFFF"], rareza: "epico", precio: 3000, migracion: "0309" },
  { slug: "evento_luces", nombre: "Luces que titilan", colores: ["#E63946", "#3DDC97", "#FFC53D", "#4FE0F5"], rareza: "legendario", precio: 6000, migracion: "0309" },
  { slug: "evento_fuegos", nombre: "Fuegos artificiales", colores: ["#FFC53D", "#A794FF", "#FF5D8F"], rareza: "epico", precio: 3000, migracion: "0309" },
  { slug: "evento_medianoche", nombre: "Medianoche dorada", colores: ["#FFC53D", "#FFF3B0", "#2A1F5C", "#E8A317"], rareza: "legendario", precio: 6000, migracion: "0309" },
  // Fiestas de febrero a septiembre (0311).
  { slug: "evento_farol", nombre: "Farol", colores: ["#E63946", "#FFC53D", "#A4161A"], rareza: "epico", precio: 3000, migracion: "0311" },
  { slug: "evento_dragon", nombre: "Dragón dorado", colores: ["#FFC53D", "#E63946", "#FFF3B0", "#B8860B"], rareza: "legendario", precio: 6000, migracion: "0311" },
  { slug: "evento_cupido", nombre: "Cupido", colores: ["#FF5D8F", "#FFB3C7", "#FFFFFF"], rareza: "epico", precio: 3000, migracion: "0311" },
  { slug: "evento_lazo", nombre: "Lazo de amistad", colores: ["#FF5D8F", "#A794FF", "#FFC53D", "#FFB3C7"], rareza: "legendario", precio: 6000, migracion: "0311" },
  { slug: "evento_antifaz", nombre: "Antifaz", colores: ["#7C5CFF", "#FFC53D", "#3DDC97"], rareza: "epico", precio: 3000, migracion: "0311" },
  { slug: "evento_carnaval", nombre: "Plumas de carnaval", colores: ["#3DDC97", "#FFC53D", "#FF5D8F", "#4FE0F5"], rareza: "legendario", precio: 6000, migracion: "0311" },
  { slug: "evento_linterna", nombre: "Linterna", colores: ["#FFB347", "#3DDC97", "#FFD98A"], rareza: "epico", precio: 3000, migracion: "0311" },
  { slug: "evento_luna", nombre: "Luna creciente", colores: ["#FFF3C4", "#FFC53D", "#1B2A6B", "#3DDC97"], rareza: "legendario", precio: 6000, migracion: "0311" },
  { slug: "evento_pi", nombre: "π", colores: ["#9B85FF", "#5DE4FF", "#FFFFFF"], rareza: "epico", precio: 3000, migracion: "0311" },
  { slug: "evento_espiral", nombre: "Espiral de dígitos", colores: ["#5DE4FF", "#9B85FF", "#FFC53D", "#FFFFFF"], rareza: "legendario", precio: 6000, migracion: "0311" },
  { slug: "evento_gulal", nombre: "Gulal", colores: ["#FF5D8F", "#3DDC97", "#FFC53D"], rareza: "epico", precio: 3000, migracion: "0311" },
  { slug: "evento_holi", nombre: "Arcoíris de Holi", colores: ["#FF5D8F", "#FFC53D", "#3DDC97", "#4FE0F5", "#A794FF"], rareza: "legendario", precio: 6000, migracion: "0311" },
  { slug: "evento_huevo", nombre: "Huevo pintado", colores: ["#9BE7FF", "#FFB3C7", "#FFD36B"], rareza: "epico", precio: 3000, migracion: "0311" },
  { slug: "evento_conejo", nombre: "Conejo de primavera", colores: ["#FFFFFF", "#FFB3C7", "#3DDC97", "#9BE7FF"], rareza: "legendario", precio: 6000, migracion: "0311" },
  { slug: "evento_hoja", nombre: "Hoja", colores: ["#3DDC97", "#1F8A5B", "#B8F5D0"], rareza: "epico", precio: 3000, migracion: "0311" },
  { slug: "evento_planeta", nombre: "Planeta azul", colores: ["#4FE0F5", "#3DDC97", "#1E4E79", "#FFFFFF"], rareza: "legendario", precio: 6000, migracion: "0311" },
  { slug: "evento_vinilo", nombre: "Vinilo", colores: ["#A794FF", "#1A1430", "#FFC53D"], rareza: "epico", precio: 3000, migracion: "0311" },
  { slug: "evento_pentagrama", nombre: "Pentagrama dorado", colores: ["#FFC53D", "#A794FF", "#FFF3B0", "#E8A317"], rareza: "legendario", precio: 6000, migracion: "0311" },
  { slug: "evento_cuaderno", nombre: "Cuaderno", colores: ["#5DE4FF", "#FFFFFF", "#FF5D8F"], rareza: "epico", precio: 3000, migracion: "0311" },
  { slug: "evento_birrete", nombre: "Birrete", colores: ["#FFC53D", "#1A1430", "#5DE4FF", "#FFF3B0"], rareza: "legendario", precio: 6000, migracion: "0311" },
];

export const FONDOS_EVENTO = [
  { valor: "evento_noche_luna", nombre: "Noche de luna", colores: ["#0B0726", "#3B1F5C", "#FF8A1F", "#0B0726"], rareza: "raro" as Rareza, precio: 1600, migracion: undefined },
  { valor: "evento_ofrenda", nombre: "Ofrenda", colores: ["#1A0B2E", "#7A1F4D", "#FF9F1C", "#1A0B2E"], rareza: "raro" as Rareza, precio: 1600, migracion: "0309" },
  { valor: "evento_luces_diwali", nombre: "Noche de diyas", colores: ["#2A0B3D", "#9D174D", "#FFC53D", "#2A0B3D"], rareza: "raro" as Rareza, precio: 1600, migracion: "0309" },
  { valor: "evento_noche_estelar", nombre: "Noche estelar", colores: ["#050A24", "#1B2A6B", "#5DE4FF", "#050A24"], rareza: "raro" as Rareza, precio: 1600, migracion: "0309" },
  { valor: "evento_pueblo_nevado", nombre: "Pueblo nevado", colores: ["#0B1A33", "#1E4E79", "#E8F4FF", "#0B1A33"], rareza: "raro" as Rareza, precio: 1600, migracion: "0309" },
  { valor: "evento_medianoche", nombre: "Medianoche", colores: ["#0B0726", "#2A1F5C", "#FFC53D", "#0B0726"], rareza: "raro" as Rareza, precio: 1600, migracion: "0309" },
  { valor: "evento_faroles", nombre: "Faroles rojos", colores: ["#2A0508", "#8B1A1A", "#FFC53D", "#2A0508"], rareza: "raro" as Rareza, precio: 1600, migracion: "0311" },
  { valor: "evento_atardecer_rosa", nombre: "Atardecer rosa", colores: ["#2A0B2E", "#9D174D", "#FFB3C7", "#2A0B2E"], rareza: "raro" as Rareza, precio: 1600, migracion: "0311" },
  { valor: "evento_comparsa", nombre: "Comparsa", colores: ["#0B2A1F", "#7C5CFF", "#FFC53D", "#0B2A1F"], rareza: "raro" as Rareza, precio: 1600, migracion: "0311" },
  { valor: "evento_luna_creciente", nombre: "Luna creciente", colores: ["#050A24", "#0F3B3A", "#FFF3C4", "#050A24"], rareza: "raro" as Rareza, precio: 1600, migracion: "0311" },
  { valor: "evento_circulo", nombre: "Círculo perfecto", colores: ["#0B0726", "#3B2A8C", "#5DE4FF", "#0B0726"], rareza: "raro" as Rareza, precio: 1600, migracion: "0311" },
  { valor: "evento_ciudad_pintada", nombre: "Ciudad pintada", colores: ["#3B0B2E", "#FF5D8F", "#FFC53D", "#3DDC97"], rareza: "raro" as Rareza, precio: 1600, migracion: "0311" },
  { valor: "evento_prado", nombre: "Prado de primavera", colores: ["#0B2A1F", "#1F8A5B", "#9BE7FF", "#FFB3C7"], rareza: "raro" as Rareza, precio: 1600, migracion: "0311" },
  { valor: "evento_planeta", nombre: "Planeta verde", colores: ["#05140E", "#1F8A5B", "#4FE0F5", "#05140E"], rareza: "raro" as Rareza, precio: 1600, migracion: "0311" },
  { valor: "evento_escenario", nombre: "Escenario", colores: ["#0B0726", "#4A1F7A", "#FFC53D", "#0B0726"], rareza: "raro" as Rareza, precio: 1600, migracion: "0311" },
  { valor: "evento_pizarron", nombre: "Pizarrón", colores: ["#0F2A22", "#1E4D3B", "#E8F4FF", "#0F2A22"], rareza: "raro" as Rareza, precio: 1600, migracion: "0311" },
] as const;

export const ESTELAS_EVENTO: { valor: string; nombre: string; base: string; punta: string; rareza: Rareza; precio: number }[] = [
  { valor: "evento_murcielago", nombre: "Murciélago", base: "#7C3AED", punta: "#FF8A1F", rareza: "raro", precio: 1600 },
  { valor: "evento_vela", nombre: "Vela", base: "#FF7A1A", punta: "#FFE08A", rareza: "raro", precio: 1600 },
  { valor: "evento_bengala", nombre: "Bengala", base: "#E8A317", punta: "#FFF3B0", rareza: "raro", precio: 1600 },
  { valor: "evento_nieve", nombre: "Nieve", base: "#7DB9E8", punta: "#FFFFFF", rareza: "raro", precio: 1600 },
  { valor: "evento_serpentina", nombre: "Serpentina", base: "#A794FF", punta: "#FFC53D", rareza: "raro", precio: 1600 },
  { valor: "evento_dragon", nombre: "Dragón", base: "#E63946", punta: "#FFC53D", rareza: "raro", precio: 1600 },
  { valor: "evento_corazones", nombre: "Corazones", base: "#FF5D8F", punta: "#FFB3C7", rareza: "raro", precio: 1600 },
  { valor: "evento_plumas", nombre: "Plumas", base: "#3DDC97", punta: "#FFC53D", rareza: "raro", precio: 1600 },
  { valor: "evento_arcoiris", nombre: "Arcoíris", base: "#FF5D8F", punta: "#3DDC97", rareza: "raro", precio: 1600 },
  { valor: "evento_pastel", nombre: "Pastel", base: "#9BE7FF", punta: "#FFB3C7", rareza: "raro", precio: 1600 },
  { valor: "evento_hojas", nombre: "Hojas", base: "#1F8A5B", punta: "#B8F5D0", rareza: "raro", precio: 1600 },
  { valor: "evento_tiza", nombre: "Tiza", base: "#E8F4FF", punta: "#5DE4FF", rareza: "raro", precio: 1600 },
];

export const EFECTOS_EVENTO: { valor: string; nombre: string; forma: "estrellas" | "chispas" | "confeti" | "glifo"; colores: string[]; glifo?: string; rareza: Rareza; precio: number }[] = [
  { valor: "evento_fuego_fatuo", nombre: "Fuego fatuo", forma: "estrellas", colores: ["#3DDC97", "#7FF0C8", "#A794FF", "#FFFFFF"], rareza: "raro", precio: 1600 },
  { valor: "evento_papel_picado", nombre: "Papel picado", forma: "confeti", colores: ["#FF5D8F", "#FF9F1C", "#3DDC97", "#A794FF", "#4FE0F5"], rareza: "raro", precio: 1600 },
  { valor: "evento_fuegos_colores", nombre: "Fuegos de colores", forma: "estrellas", colores: ["#FFC53D", "#FF5D8F", "#3DDC97", "#4FE0F5"], rareza: "raro", precio: 1600 },
  { valor: "evento_estrella_fugaz", nombre: "Lluvia de estrellas", forma: "estrellas", colores: ["#5DE4FF", "#FFC53D", "#FFFFFF"], rareza: "raro", precio: 1600 },
  { valor: "evento_copos", nombre: "Copos", forma: "glifo", glifo: "✻", colores: ["#FFFFFF", "#BFE3FF", "#7DB9E8"], rareza: "raro", precio: 1600 },
  { valor: "evento_bengalas", nombre: "Bengalas", forma: "chispas", colores: ["#FFC53D", "#FFF3B0", "#A794FF"], rareza: "raro", precio: 1600 },
  { valor: "evento_faroles", nombre: "Faroles", forma: "chispas", colores: ["#E63946", "#FFC53D", "#FF8A1F"], rareza: "raro", precio: 1600 },
  { valor: "evento_corazones", nombre: "Lluvia de corazones", forma: "glifo", glifo: "♥", colores: ["#FF5D8F", "#FFB3C7", "#FFFFFF"], rareza: "raro", precio: 1600 },
  { valor: "evento_confeti_carnaval", nombre: "Confeti de carnaval", forma: "confeti", colores: ["#3DDC97", "#FFC53D", "#FF5D8F", "#7C5CFF", "#4FE0F5"], rareza: "raro", precio: 1600 },
  { valor: "evento_linternas", nombre: "Linternas que suben", forma: "estrellas", colores: ["#FFB347", "#FFD98A", "#3DDC97"], rareza: "raro", precio: 1600 },
  { valor: "evento_pi", nombre: "Dígitos de π", forma: "glifo", glifo: "π", colores: ["#9B85FF", "#5DE4FF", "#FFFFFF"], rareza: "raro", precio: 1600 },
  { valor: "evento_polvo_color", nombre: "Polvo de colores", forma: "confeti", colores: ["#FF5D8F", "#FFC53D", "#3DDC97", "#4FE0F5", "#A794FF"], rareza: "raro", precio: 1600 },
  { valor: "evento_huevos", nombre: "Huevos de colores", forma: "confeti", colores: ["#9BE7FF", "#FFB3C7", "#FFD36B", "#B8F5D0"], rareza: "raro", precio: 1600 },
  { valor: "evento_notas", nombre: "Notas al aire", forma: "glifo", glifo: "♪", colores: ["#FFC53D", "#A794FF", "#FFFFFF"], rareza: "raro", precio: 1600 },
  { valor: "evento_formulas", nombre: "Fórmulas", forma: "glifo", glifo: "∑", colores: ["#E8F4FF", "#5DE4FF", "#FFC53D"], rareza: "raro", precio: 1600 },
];

// `animado`: emote con animación ya hecha (public/emotes y mobile/assets/emotes: <animado>.webp,
// <animado>-grande.webp y <animado>-icono.png). El «Baile de esqueletos» (0292) es exclusivo de Halloween.
export const EMOTES_EVENTO: { valor: string; emoji: string; texto: string; precio: number; animado?: string }[] = [
  { valor: "evento_buu", emoji: "👻", texto: "¡Buu!", precio: 600 },
  { valor: "evento_esqueletos", emoji: "💀", texto: "¡A bailar!", precio: 3000, animado: "baile-esqueletos" },
  { valor: "evento_cempasuchil", emoji: "🌼", texto: "¡Te recuerdo!", precio: 600 },
  { valor: "evento_diya", emoji: "🪔", texto: "¡Que brille!", precio: 600 },
  { valor: "evento_estelar", emoji: "⭐", texto: "¡Estelar!", precio: 600 },
  { valor: "evento_jojojo", emoji: "🎅", texto: "¡Jo jo jo!", precio: 600 },
  { valor: "evento_salud", emoji: "🥂", texto: "¡Salud!", precio: 600 },
  { valor: "evento_prosperidad", emoji: "🧧", texto: "¡Prosperidad!", precio: 600 },
  { valor: "evento_para_ti", emoji: "💌", texto: "¡Para ti!", precio: 600 },
  { valor: "evento_tambor", emoji: "🥁", texto: "¡Que suene!", precio: 600 },
  { valor: "evento_buenas_noches", emoji: "🌙", texto: "¡Buenas noches!", precio: 600 },
  { valor: "evento_pi", emoji: "🥧", texto: "¡3,14!", precio: 600 },
  { valor: "evento_colores", emoji: "🎨", texto: "¡Colores!", precio: 600 },
  { valor: "evento_encontrado", emoji: "🐣", texto: "¡Lo encontré!", precio: 600 },
  { valor: "evento_plantar", emoji: "🌱", texto: "¡A plantar!", precio: 600 },
  { valor: "evento_suena", emoji: "🎵", texto: "¡Suena bien!", precio: 600 },
  { valor: "evento_presente", emoji: "✏️", texto: "¡Presente!", precio: 600 },
];

export const TITULOS_EVENTO: { item: string; valor: string; nombre: string; rareza: Rareza; precio: number }[] = [
  { item: "titulo_evento_cazafantasmas", valor: "evento-cazafantasmas", nombre: "Cazafantasmas", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_memoria_viva", valor: "evento-memoria-viva", nombre: "Memoria viva", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_portador_luz", valor: "evento-portador-luz", nombre: "Portador de luz", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_cazaofertas", valor: "evento-cazaofertas", nombre: "Cazaofertas", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_duende", valor: "evento-duende", nombre: "Duende de Santa", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_primera_luz", valor: "evento-primera-luz", nombre: "Primera luz del año", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_danza_dragon", valor: "evento-danza-dragon", nombre: "Danza del dragón", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_amigo_fiel", valor: "evento-amigo-fiel", nombre: "Amigo fiel", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_alma_comparsa", valor: "evento-alma-comparsa", nombre: "Alma de la comparsa", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_guardian_luna", valor: "evento-guardian-luna", nombre: "Guardián de la luna", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_calculador_pi", valor: "evento-calculador-pi", nombre: "Calculador de π", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_pintor", valor: "evento-pintor", nombre: "Pintor de ciudades", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_buscador", valor: "evento-buscador", nombre: "Buscador de huevos", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_guardian_bosque", valor: "evento-guardian-bosque", nombre: "Guardián del bosque", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_musico", valor: "evento-musico", nombre: "Músico de la ciudad", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_primero_clase", valor: "evento-primero-clase", nombre: "Primero de la clase", rareza: "epico", precio: 3000 },
];

export interface PiezaEvento {
  item: string;
  categoria: "marco" | "fondo" | "estela" | "efecto" | "emote" | "titulo";
  valor: string;
  nombre: string;
  rareza: Rareza;
  fichas: number;
  cometas: number;
  // Si la pieza llegó después (no está en 0289): la migración que la agrega.
  migracion?: string;
}

export interface Coleccion {
  tema: IdTema;
  // La migración que programa sus eventos (sin ella, 0289).
  migracion?: string;
  ficha: { nombre: string; nombreEn: string; dibujo: TipoParticula };
  piezas: PiezaEvento[];
}

// Fichas: 1 cada 40 de Exp ganada en los días del evento, hasta 12 por día (lo calcula la base).
export const EXP_POR_FICHA = 40;
export const FICHAS_MAX_DIA = 12;
// Al cerrar, cada ficha que sobra vale estas Chispas.
export const CHISPAS_POR_FICHA = 30;

export const COLECCIONES: Partial<Record<IdTema, Coleccion>> = {
  halloween: {
    tema: "halloween",
    ficha: { nombre: "Caramelos", nombreEn: "Candies", dibujo: "dulce" },
    piezas: [
      { item: "emote_evento_buu", categoria: "emote", valor: "evento_buu", nombre: "👻 ¡Buu!", rareza: "comun", fichas: 8, cometas: 60 },
      { item: "estela_evento_murcielago", categoria: "estela", valor: "evento_murcielago", nombre: "Estela Murciélago", rareza: "raro", fichas: 16, cometas: 120 },
      { item: "efecto_evento_fuego_fatuo", categoria: "efecto", valor: "evento_fuego_fatuo", nombre: "Fuego fatuo", rareza: "raro", fichas: 16, cometas: 120 },
      { item: "fondo_evento_noche_luna", categoria: "fondo", valor: "evento_noche_luna", nombre: "Fondo Noche de luna", rareza: "raro", fichas: 18, cometas: 140 },
      { item: "titulo_evento_cazafantasmas", categoria: "titulo", valor: "evento-cazafantasmas", nombre: "Cazafantasmas", rareza: "epico", fichas: 24, cometas: 220 },
      { item: "marco_evento_calabaza", categoria: "marco", valor: "evento_calabaza", nombre: "Marco Calabaza", rareza: "epico", fichas: 30, cometas: 300 },
      { item: "marco_evento_esqueleto", categoria: "marco", valor: "evento_esqueleto", nombre: "Marco Esqueleto fosforescente", rareza: "legendario", fichas: 45, cometas: 600 },
      { item: "emote_evento_esqueletos", categoria: "emote", valor: "evento_esqueletos", nombre: "Baile de esqueletos", rareza: "epico", fichas: 30, cometas: 300, migracion: "0292" },
    ],
  },
  // Fiestas cortas: las Fichas cuestan menos que en Halloween (hay menos días para
  // ganarlas); las Cometas, lo mismo por rareza.
  muertos: {
    tema: "muertos",
    migracion: "0309",
    ficha: { nombre: "Cempasúchil", nombreEn: "Marigolds", dibujo: "cempasuchil" },
    piezas: [
      { item: "emote_evento_cempasuchil", categoria: "emote", valor: "evento_cempasuchil", nombre: "🌼 ¡Te recuerdo!", rareza: "comun", fichas: 4, cometas: 60, migracion: "0309" },
      { item: "estela_evento_vela", categoria: "estela", valor: "evento_vela", nombre: "Estela Vela", rareza: "raro", fichas: 8, cometas: 120, migracion: "0309" },
      { item: "efecto_evento_papel_picado", categoria: "efecto", valor: "evento_papel_picado", nombre: "Papel picado", rareza: "raro", fichas: 8, cometas: 120, migracion: "0309" },
      { item: "fondo_evento_ofrenda", categoria: "fondo", valor: "evento_ofrenda", nombre: "Fondo Ofrenda", rareza: "raro", fichas: 9, cometas: 140, migracion: "0309" },
      { item: "titulo_evento_memoria_viva", categoria: "titulo", valor: "evento-memoria-viva", nombre: "Memoria viva", rareza: "epico", fichas: 12, cometas: 220, migracion: "0309" },
      { item: "marco_evento_papel_picado", categoria: "marco", valor: "evento_papel_picado", nombre: "Marco Papel picado", rareza: "epico", fichas: 14, cometas: 300, migracion: "0309" },
      { item: "marco_evento_calavera", categoria: "marco", valor: "evento_calavera", nombre: "Marco Calavera de azúcar", rareza: "legendario", fichas: 20, cometas: 600, migracion: "0309" },
    ],
  },
  diwali: {
    tema: "diwali",
    migracion: "0309",
    ficha: { nombre: "Diyas", nombreEn: "Diyas", dibujo: "diya" },
    piezas: [
      { item: "emote_evento_diya", categoria: "emote", valor: "evento_diya", nombre: "🪔 ¡Que brille!", rareza: "comun", fichas: 6, cometas: 60, migracion: "0309" },
      { item: "estela_evento_bengala", categoria: "estela", valor: "evento_bengala", nombre: "Estela Bengala", rareza: "raro", fichas: 12, cometas: 120, migracion: "0309" },
      { item: "efecto_evento_fuegos_colores", categoria: "efecto", valor: "evento_fuegos_colores", nombre: "Fuegos de colores", rareza: "raro", fichas: 12, cometas: 120, migracion: "0309" },
      { item: "fondo_evento_luces_diwali", categoria: "fondo", valor: "evento_luces_diwali", nombre: "Fondo Noche de diyas", rareza: "raro", fichas: 13, cometas: 140, migracion: "0309" },
      { item: "titulo_evento_portador_luz", categoria: "titulo", valor: "evento-portador-luz", nombre: "Portador de luz", rareza: "epico", fichas: 18, cometas: 220, migracion: "0309" },
      { item: "marco_evento_diya", categoria: "marco", valor: "evento_diya", nombre: "Marco Diya", rareza: "epico", fichas: 22, cometas: 300, migracion: "0309" },
      { item: "marco_evento_rangoli", categoria: "marco", valor: "evento_rangoli", nombre: "Marco Rangoli", rareza: "legendario", fichas: 34, cometas: 600, migracion: "0309" },
    ],
  },
  viernes_estelar: {
    tema: "viernes_estelar",
    migracion: "0309",
    ficha: { nombre: "Estrellas fugaces", nombreEn: "Shooting stars", dibujo: "estrella_fugaz" },
    piezas: [
      { item: "emote_evento_estelar", categoria: "emote", valor: "evento_estelar", nombre: "⭐ ¡Estelar!", rareza: "comun", fichas: 5, cometas: 60, migracion: "0309" },
      { item: "efecto_evento_estrella_fugaz", categoria: "efecto", valor: "evento_estrella_fugaz", nombre: "Lluvia de estrellas", rareza: "raro", fichas: 10, cometas: 120, migracion: "0309" },
      { item: "fondo_evento_noche_estelar", categoria: "fondo", valor: "evento_noche_estelar", nombre: "Fondo Noche estelar", rareza: "raro", fichas: 11, cometas: 140, migracion: "0309" },
      { item: "titulo_evento_cazaofertas", categoria: "titulo", valor: "evento-cazaofertas", nombre: "Cazaofertas", rareza: "epico", fichas: 15, cometas: 220, migracion: "0309" },
      { item: "marco_evento_cometa", categoria: "marco", valor: "evento_cometa", nombre: "Marco Cometa", rareza: "epico", fichas: 18, cometas: 300, migracion: "0309" },
      { item: "marco_evento_constelacion", categoria: "marco", valor: "evento_constelacion", nombre: "Marco Constelación", rareza: "legendario", fichas: 28, cometas: 600, migracion: "0309" },
    ],
  },
  navidad: {
    tema: "navidad",
    migracion: "0309",
    ficha: { nombre: "Regalos", nombreEn: "Gifts", dibujo: "regalo" },
    piezas: [
      { item: "emote_evento_jojojo", categoria: "emote", valor: "evento_jojojo", nombre: "🎅 ¡Jo jo jo!", rareza: "comun", fichas: 10, cometas: 60, migracion: "0309" },
      { item: "estela_evento_nieve", categoria: "estela", valor: "evento_nieve", nombre: "Estela Nieve", rareza: "raro", fichas: 20, cometas: 120, migracion: "0309" },
      { item: "efecto_evento_copos", categoria: "efecto", valor: "evento_copos", nombre: "Copos", rareza: "raro", fichas: 20, cometas: 120, migracion: "0309" },
      { item: "fondo_evento_pueblo_nevado", categoria: "fondo", valor: "evento_pueblo_nevado", nombre: "Fondo Pueblo nevado", rareza: "raro", fichas: 22, cometas: 140, migracion: "0309" },
      { item: "titulo_evento_duende", categoria: "titulo", valor: "evento-duende", nombre: "Duende de Santa", rareza: "epico", fichas: 34, cometas: 220, migracion: "0309" },
      { item: "marco_evento_baston", categoria: "marco", valor: "evento_baston", nombre: "Marco Bastón de caramelo", rareza: "epico", fichas: 40, cometas: 300, migracion: "0309" },
      { item: "marco_evento_luces", categoria: "marco", valor: "evento_luces", nombre: "Marco Luces que titilan", rareza: "legendario", fichas: 60, cometas: 600, migracion: "0309" },
    ],
  },
  anio_nuevo: {
    tema: "anio_nuevo",
    migracion: "0309",
    ficha: { nombre: "Campanadas", nombreEn: "Chimes", dibujo: "campana" },
    piezas: [
      { item: "emote_evento_salud", categoria: "emote", valor: "evento_salud", nombre: "🥂 ¡Salud!", rareza: "comun", fichas: 5, cometas: 60, migracion: "0309" },
      { item: "estela_evento_serpentina", categoria: "estela", valor: "evento_serpentina", nombre: "Estela Serpentina", rareza: "raro", fichas: 9, cometas: 120, migracion: "0309" },
      { item: "efecto_evento_bengalas", categoria: "efecto", valor: "evento_bengalas", nombre: "Bengalas", rareza: "raro", fichas: 9, cometas: 120, migracion: "0309" },
      { item: "fondo_evento_medianoche", categoria: "fondo", valor: "evento_medianoche", nombre: "Fondo Medianoche", rareza: "raro", fichas: 10, cometas: 140, migracion: "0309" },
      { item: "titulo_evento_primera_luz", categoria: "titulo", valor: "evento-primera-luz", nombre: "Primera luz del año", rareza: "epico", fichas: 14, cometas: 220, migracion: "0309" },
      { item: "marco_evento_fuegos", categoria: "marco", valor: "evento_fuegos", nombre: "Marco Fuegos artificiales", rareza: "epico", fichas: 16, cometas: 300, migracion: "0309" },
      { item: "marco_evento_medianoche", categoria: "marco", valor: "evento_medianoche", nombre: "Marco Medianoche dorada", rareza: "legendario", fichas: 24, cometas: 600, migracion: "0309" },
    ],
  },
  // Fiestas de febrero a septiembre (0311). Las Fichas, según los días de cada una; las
  // de un solo día cuestan poco (el tope de Exp es 12 por día, más su minievento).
  anio_nuevo_lunar: {
    tema: "anio_nuevo_lunar",
    migracion: "0311",
    ficha: { nombre: "Monedas de la suerte", nombreEn: "Lucky coins", dibujo: "moneda" },
    piezas: [
      { item: "emote_evento_prosperidad", categoria: "emote", valor: "evento_prosperidad", nombre: "🧧 ¡Prosperidad!", rareza: "comun", fichas: 7, cometas: 60, migracion: "0311" },
      { item: "estela_evento_dragon", categoria: "estela", valor: "evento_dragon", nombre: "Estela Dragón", rareza: "raro", fichas: 14, cometas: 120, migracion: "0311" },
      { item: "efecto_evento_faroles", categoria: "efecto", valor: "evento_faroles", nombre: "Faroles", rareza: "raro", fichas: 14, cometas: 120, migracion: "0311" },
      { item: "fondo_evento_faroles", categoria: "fondo", valor: "evento_faroles", nombre: "Fondo Faroles rojos", rareza: "raro", fichas: 16, cometas: 140, migracion: "0311" },
      { item: "titulo_evento_danza_dragon", categoria: "titulo", valor: "evento-danza-dragon", nombre: "Danza del dragón", rareza: "epico", fichas: 21, cometas: 220, migracion: "0311" },
      { item: "marco_evento_farol", categoria: "marco", valor: "evento_farol", nombre: "Marco Farol", rareza: "epico", fichas: 26, cometas: 300, migracion: "0311" },
      { item: "marco_evento_dragon", categoria: "marco", valor: "evento_dragon", nombre: "Marco Dragón dorado", rareza: "legendario", fichas: 40, cometas: 600, migracion: "0311" },
    ],
  },
  amor_amistad: {
    tema: "amor_amistad",
    migracion: "0311",
    ficha: { nombre: "Cartas", nombreEn: "Letters", dibujo: "carta" },
    piezas: [
      { item: "emote_evento_para_ti", categoria: "emote", valor: "evento_para_ti", nombre: "💌 ¡Para ti!", rareza: "comun", fichas: 5, cometas: 60, migracion: "0311" },
      { item: "estela_evento_corazones", categoria: "estela", valor: "evento_corazones", nombre: "Estela Corazones", rareza: "raro", fichas: 10, cometas: 120, migracion: "0311" },
      { item: "efecto_evento_corazones", categoria: "efecto", valor: "evento_corazones", nombre: "Lluvia de corazones", rareza: "raro", fichas: 10, cometas: 120, migracion: "0311" },
      { item: "fondo_evento_atardecer_rosa", categoria: "fondo", valor: "evento_atardecer_rosa", nombre: "Fondo Atardecer rosa", rareza: "raro", fichas: 11, cometas: 140, migracion: "0311" },
      { item: "titulo_evento_amigo_fiel", categoria: "titulo", valor: "evento-amigo-fiel", nombre: "Amigo fiel", rareza: "epico", fichas: 15, cometas: 220, migracion: "0311" },
      { item: "marco_evento_cupido", categoria: "marco", valor: "evento_cupido", nombre: "Marco Cupido", rareza: "epico", fichas: 18, cometas: 300, migracion: "0311" },
      { item: "marco_evento_lazo", categoria: "marco", valor: "evento_lazo", nombre: "Marco Lazo de amistad", rareza: "legendario", fichas: 28, cometas: 600, migracion: "0311" },
    ],
  },
  carnaval: {
    tema: "carnaval",
    migracion: "0311",
    ficha: { nombre: "Máscaras", nombreEn: "Masks", dibujo: "mascara" },
    piezas: [
      { item: "emote_evento_tambor", categoria: "emote", valor: "evento_tambor", nombre: "🥁 ¡Que suene!", rareza: "comun", fichas: 5, cometas: 60, migracion: "0311" },
      { item: "estela_evento_plumas", categoria: "estela", valor: "evento_plumas", nombre: "Estela Plumas", rareza: "raro", fichas: 10, cometas: 120, migracion: "0311" },
      { item: "efecto_evento_confeti_carnaval", categoria: "efecto", valor: "evento_confeti_carnaval", nombre: "Confeti de carnaval", rareza: "raro", fichas: 10, cometas: 120, migracion: "0311" },
      { item: "fondo_evento_comparsa", categoria: "fondo", valor: "evento_comparsa", nombre: "Fondo Comparsa", rareza: "raro", fichas: 11, cometas: 140, migracion: "0311" },
      { item: "titulo_evento_alma_comparsa", categoria: "titulo", valor: "evento-alma-comparsa", nombre: "Alma de la comparsa", rareza: "epico", fichas: 15, cometas: 220, migracion: "0311" },
      { item: "marco_evento_antifaz", categoria: "marco", valor: "evento_antifaz", nombre: "Marco Antifaz", rareza: "epico", fichas: 18, cometas: 300, migracion: "0311" },
      { item: "marco_evento_carnaval", categoria: "marco", valor: "evento_carnaval", nombre: "Marco Plumas de carnaval", rareza: "legendario", fichas: 28, cometas: 600, migracion: "0311" },
    ],
  },
  linternas: {
    tema: "linternas",
    migracion: "0311",
    ficha: { nombre: "Lunas", nombreEn: "Moons", dibujo: "luna" },
    piezas: [
      { item: "emote_evento_buenas_noches", categoria: "emote", valor: "evento_buenas_noches", nombre: "🌙 ¡Buenas noches!", rareza: "comun", fichas: 5, cometas: 60, migracion: "0311" },
      { item: "efecto_evento_linternas", categoria: "efecto", valor: "evento_linternas", nombre: "Linternas que suben", rareza: "raro", fichas: 9, cometas: 120, migracion: "0311" },
      { item: "fondo_evento_luna_creciente", categoria: "fondo", valor: "evento_luna_creciente", nombre: "Fondo Luna creciente", rareza: "raro", fichas: 10, cometas: 140, migracion: "0311" },
      { item: "titulo_evento_guardian_luna", categoria: "titulo", valor: "evento-guardian-luna", nombre: "Guardián de la luna", rareza: "epico", fichas: 13, cometas: 220, migracion: "0311" },
      { item: "marco_evento_linterna", categoria: "marco", valor: "evento_linterna", nombre: "Marco Linterna", rareza: "epico", fichas: 16, cometas: 300, migracion: "0311" },
      { item: "marco_evento_luna", categoria: "marco", valor: "evento_luna", nombre: "Marco Luna creciente", rareza: "legendario", fichas: 24, cometas: 600, migracion: "0311" },
    ],
  },
  dia_pi: {
    tema: "dia_pi",
    migracion: "0311",
    ficha: { nombre: "Dígitos", nombreEn: "Digits", dibujo: "pi" },
    piezas: [
      { item: "emote_evento_pi", categoria: "emote", valor: "evento_pi", nombre: "🥧 ¡3,14!", rareza: "comun", fichas: 2, cometas: 60, migracion: "0311" },
      { item: "efecto_evento_pi", categoria: "efecto", valor: "evento_pi", nombre: "Dígitos de π", rareza: "raro", fichas: 4, cometas: 120, migracion: "0311" },
      { item: "fondo_evento_circulo", categoria: "fondo", valor: "evento_circulo", nombre: "Fondo Círculo perfecto", rareza: "raro", fichas: 4, cometas: 140, migracion: "0311" },
      { item: "titulo_evento_calculador_pi", categoria: "titulo", valor: "evento-calculador-pi", nombre: "Calculador de π", rareza: "epico", fichas: 5, cometas: 220, migracion: "0311" },
      { item: "marco_evento_pi", categoria: "marco", valor: "evento_pi", nombre: "Marco π", rareza: "epico", fichas: 6, cometas: 300, migracion: "0311" },
      { item: "marco_evento_espiral", categoria: "marco", valor: "evento_espiral", nombre: "Marco Espiral de dígitos", rareza: "legendario", fichas: 9, cometas: 600, migracion: "0311" },
    ],
  },
  holi: {
    tema: "holi",
    migracion: "0311",
    ficha: { nombre: "Polvos de color", nombreEn: "Color powder", dibujo: "gulal" },
    piezas: [
      { item: "emote_evento_colores", categoria: "emote", valor: "evento_colores", nombre: "🎨 ¡Colores!", rareza: "comun", fichas: 4, cometas: 60, migracion: "0311" },
      { item: "estela_evento_arcoiris", categoria: "estela", valor: "evento_arcoiris", nombre: "Estela Arcoíris", rareza: "raro", fichas: 8, cometas: 120, migracion: "0311" },
      { item: "efecto_evento_polvo_color", categoria: "efecto", valor: "evento_polvo_color", nombre: "Polvo de colores", rareza: "raro", fichas: 8, cometas: 120, migracion: "0311" },
      { item: "fondo_evento_ciudad_pintada", categoria: "fondo", valor: "evento_ciudad_pintada", nombre: "Fondo Ciudad pintada", rareza: "raro", fichas: 9, cometas: 140, migracion: "0311" },
      { item: "titulo_evento_pintor", categoria: "titulo", valor: "evento-pintor", nombre: "Pintor de ciudades", rareza: "epico", fichas: 12, cometas: 220, migracion: "0311" },
      { item: "marco_evento_gulal", categoria: "marco", valor: "evento_gulal", nombre: "Marco Gulal", rareza: "epico", fichas: 14, cometas: 300, migracion: "0311" },
      { item: "marco_evento_holi", categoria: "marco", valor: "evento_holi", nombre: "Marco Arcoíris de Holi", rareza: "legendario", fichas: 20, cometas: 600, migracion: "0311" },
    ],
  },
  pascua: {
    tema: "pascua",
    migracion: "0311",
    ficha: { nombre: "Huevos", nombreEn: "Eggs", dibujo: "huevo" },
    piezas: [
      { item: "emote_evento_encontrado", categoria: "emote", valor: "evento_encontrado", nombre: "🐣 ¡Lo encontré!", rareza: "comun", fichas: 5, cometas: 60, migracion: "0311" },
      { item: "estela_evento_pastel", categoria: "estela", valor: "evento_pastel", nombre: "Estela Pastel", rareza: "raro", fichas: 10, cometas: 120, migracion: "0311" },
      { item: "efecto_evento_huevos", categoria: "efecto", valor: "evento_huevos", nombre: "Huevos de colores", rareza: "raro", fichas: 10, cometas: 120, migracion: "0311" },
      { item: "fondo_evento_prado", categoria: "fondo", valor: "evento_prado", nombre: "Fondo Prado de primavera", rareza: "raro", fichas: 11, cometas: 140, migracion: "0311" },
      { item: "titulo_evento_buscador", categoria: "titulo", valor: "evento-buscador", nombre: "Buscador de huevos", rareza: "epico", fichas: 15, cometas: 220, migracion: "0311" },
      { item: "marco_evento_huevo", categoria: "marco", valor: "evento_huevo", nombre: "Marco Huevo pintado", rareza: "epico", fichas: 18, cometas: 300, migracion: "0311" },
      { item: "marco_evento_conejo", categoria: "marco", valor: "evento_conejo", nombre: "Marco Conejo de primavera", rareza: "legendario", fichas: 28, cometas: 600, migracion: "0311" },
    ],
  },
  dia_tierra: {
    tema: "dia_tierra",
    migracion: "0311",
    ficha: { nombre: "Semillas", nombreEn: "Seeds", dibujo: "semilla" },
    piezas: [
      { item: "emote_evento_plantar", categoria: "emote", valor: "evento_plantar", nombre: "🌱 ¡A plantar!", rareza: "comun", fichas: 2, cometas: 60, migracion: "0311" },
      { item: "estela_evento_hojas", categoria: "estela", valor: "evento_hojas", nombre: "Estela Hojas", rareza: "raro", fichas: 4, cometas: 120, migracion: "0311" },
      { item: "fondo_evento_planeta", categoria: "fondo", valor: "evento_planeta", nombre: "Fondo Planeta verde", rareza: "raro", fichas: 4, cometas: 140, migracion: "0311" },
      { item: "titulo_evento_guardian_bosque", categoria: "titulo", valor: "evento-guardian-bosque", nombre: "Guardián del bosque", rareza: "epico", fichas: 5, cometas: 220, migracion: "0311" },
      { item: "marco_evento_hoja", categoria: "marco", valor: "evento_hoja", nombre: "Marco Hoja", rareza: "epico", fichas: 6, cometas: 300, migracion: "0311" },
      { item: "marco_evento_planeta", categoria: "marco", valor: "evento_planeta", nombre: "Marco Planeta azul", rareza: "legendario", fichas: 9, cometas: 600, migracion: "0311" },
    ],
  },
  dia_musica: {
    tema: "dia_musica",
    migracion: "0311",
    ficha: { nombre: "Notas", nombreEn: "Notes", dibujo: "nota" },
    piezas: [
      { item: "emote_evento_suena", categoria: "emote", valor: "evento_suena", nombre: "🎵 ¡Suena bien!", rareza: "comun", fichas: 3, cometas: 60, migracion: "0311" },
      { item: "efecto_evento_notas", categoria: "efecto", valor: "evento_notas", nombre: "Notas al aire", rareza: "raro", fichas: 5, cometas: 120, migracion: "0311" },
      { item: "fondo_evento_escenario", categoria: "fondo", valor: "evento_escenario", nombre: "Fondo Escenario", rareza: "raro", fichas: 6, cometas: 140, migracion: "0311" },
      { item: "titulo_evento_musico", categoria: "titulo", valor: "evento-musico", nombre: "Músico de la ciudad", rareza: "epico", fichas: 8, cometas: 220, migracion: "0311" },
      { item: "marco_evento_vinilo", categoria: "marco", valor: "evento_vinilo", nombre: "Marco Vinilo", rareza: "epico", fichas: 10, cometas: 300, migracion: "0311" },
      { item: "marco_evento_pentagrama", categoria: "marco", valor: "evento_pentagrama", nombre: "Marco Pentagrama dorado", rareza: "legendario", fichas: 14, cometas: 600, migracion: "0311" },
    ],
  },
  vuelta_clases: {
    tema: "vuelta_clases",
    migracion: "0311",
    ficha: { nombre: "Lápices", nombreEn: "Pencils", dibujo: "lapiz" },
    piezas: [
      { item: "emote_evento_presente", categoria: "emote", valor: "evento_presente", nombre: "✏️ ¡Presente!", rareza: "comun", fichas: 7, cometas: 60, migracion: "0311" },
      { item: "estela_evento_tiza", categoria: "estela", valor: "evento_tiza", nombre: "Estela Tiza", rareza: "raro", fichas: 14, cometas: 120, migracion: "0311" },
      { item: "efecto_evento_formulas", categoria: "efecto", valor: "evento_formulas", nombre: "Fórmulas", rareza: "raro", fichas: 14, cometas: 120, migracion: "0311" },
      { item: "fondo_evento_pizarron", categoria: "fondo", valor: "evento_pizarron", nombre: "Fondo Pizarrón", rareza: "raro", fichas: 16, cometas: 140, migracion: "0311" },
      { item: "titulo_evento_primero_clase", categoria: "titulo", valor: "evento-primero-clase", nombre: "Primero de la clase", rareza: "epico", fichas: 21, cometas: 220, migracion: "0311" },
      { item: "marco_evento_cuaderno", categoria: "marco", valor: "evento_cuaderno", nombre: "Marco Cuaderno", rareza: "epico", fichas: 26, cometas: 300, migracion: "0311" },
      { item: "marco_evento_birrete", categoria: "marco", valor: "evento_birrete", nombre: "Marco Birrete", rareza: "legendario", fichas: 40, cometas: 600, migracion: "0311" },
    ],
  },
};

// Slug de un evento en la base: tema + año del evento.
export function slugEvento(tema: IdTema, desde: string): string {
  return `${tema}-${desde.slice(0, 4)}`;
}

// Todas las piezas de todos los eventos (para el catálogo y el inventario).
export function piezasDeEventos(): PiezaEvento[] {
  return Object.values(COLECCIONES).flatMap((c) => c?.piezas ?? []);
}
