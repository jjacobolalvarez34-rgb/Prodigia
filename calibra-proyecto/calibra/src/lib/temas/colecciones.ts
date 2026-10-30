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
];

export const FONDOS_EVENTO = [
  { valor: "evento_noche_luna", nombre: "Noche de luna", colores: ["#0B0726", "#3B1F5C", "#FF8A1F", "#0B0726"], rareza: "raro" as Rareza, precio: 1600, migracion: undefined },
  { valor: "evento_ofrenda", nombre: "Ofrenda", colores: ["#1A0B2E", "#7A1F4D", "#FF9F1C", "#1A0B2E"], rareza: "raro" as Rareza, precio: 1600, migracion: "0309" },
  { valor: "evento_luces_diwali", nombre: "Noche de diyas", colores: ["#2A0B3D", "#9D174D", "#FFC53D", "#2A0B3D"], rareza: "raro" as Rareza, precio: 1600, migracion: "0309" },
  { valor: "evento_noche_estelar", nombre: "Noche estelar", colores: ["#050A24", "#1B2A6B", "#5DE4FF", "#050A24"], rareza: "raro" as Rareza, precio: 1600, migracion: "0309" },
  { valor: "evento_pueblo_nevado", nombre: "Pueblo nevado", colores: ["#0B1A33", "#1E4E79", "#E8F4FF", "#0B1A33"], rareza: "raro" as Rareza, precio: 1600, migracion: "0309" },
  { valor: "evento_medianoche", nombre: "Medianoche", colores: ["#0B0726", "#2A1F5C", "#FFC53D", "#0B0726"], rareza: "raro" as Rareza, precio: 1600, migracion: "0309" },
] as const;

export const ESTELAS_EVENTO: { valor: string; nombre: string; base: string; punta: string; rareza: Rareza; precio: number }[] = [
  { valor: "evento_murcielago", nombre: "Murciélago", base: "#7C3AED", punta: "#FF8A1F", rareza: "raro", precio: 1600 },
  { valor: "evento_vela", nombre: "Vela", base: "#FF7A1A", punta: "#FFE08A", rareza: "raro", precio: 1600 },
  { valor: "evento_bengala", nombre: "Bengala", base: "#E8A317", punta: "#FFF3B0", rareza: "raro", precio: 1600 },
  { valor: "evento_nieve", nombre: "Nieve", base: "#7DB9E8", punta: "#FFFFFF", rareza: "raro", precio: 1600 },
  { valor: "evento_serpentina", nombre: "Serpentina", base: "#A794FF", punta: "#FFC53D", rareza: "raro", precio: 1600 },
];

export const EFECTOS_EVENTO: { valor: string; nombre: string; forma: "estrellas" | "chispas" | "confeti" | "glifo"; colores: string[]; glifo?: string; rareza: Rareza; precio: number }[] = [
  { valor: "evento_fuego_fatuo", nombre: "Fuego fatuo", forma: "estrellas", colores: ["#3DDC97", "#7FF0C8", "#A794FF", "#FFFFFF"], rareza: "raro", precio: 1600 },
  { valor: "evento_papel_picado", nombre: "Papel picado", forma: "confeti", colores: ["#FF5D8F", "#FF9F1C", "#3DDC97", "#A794FF", "#4FE0F5"], rareza: "raro", precio: 1600 },
  { valor: "evento_fuegos_colores", nombre: "Fuegos de colores", forma: "estrellas", colores: ["#FFC53D", "#FF5D8F", "#3DDC97", "#4FE0F5"], rareza: "raro", precio: 1600 },
  { valor: "evento_estrella_fugaz", nombre: "Lluvia de estrellas", forma: "estrellas", colores: ["#5DE4FF", "#FFC53D", "#FFFFFF"], rareza: "raro", precio: 1600 },
  { valor: "evento_copos", nombre: "Copos", forma: "glifo", glifo: "✻", colores: ["#FFFFFF", "#BFE3FF", "#7DB9E8"], rareza: "raro", precio: 1600 },
  { valor: "evento_bengalas", nombre: "Bengalas", forma: "chispas", colores: ["#FFC53D", "#FFF3B0", "#A794FF"], rareza: "raro", precio: 1600 },
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
];

export const TITULOS_EVENTO: { item: string; valor: string; nombre: string; rareza: Rareza; precio: number }[] = [
  { item: "titulo_evento_cazafantasmas", valor: "evento-cazafantasmas", nombre: "Cazafantasmas", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_memoria_viva", valor: "evento-memoria-viva", nombre: "Memoria viva", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_portador_luz", valor: "evento-portador-luz", nombre: "Portador de luz", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_cazaofertas", valor: "evento-cazaofertas", nombre: "Cazaofertas", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_duende", valor: "evento-duende", nombre: "Duende de Santa", rareza: "epico", precio: 3000 },
  { item: "titulo_evento_primera_luz", valor: "evento-primera-luz", nombre: "Primera luz del año", rareza: "epico", precio: 3000 },
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
};

// Slug de un evento en la base: tema + año del evento.
export function slugEvento(tema: IdTema, desde: string): string {
  return `${tema}-${desde.slice(0, 4)}`;
}

// Todas las piezas de todos los eventos (para el catálogo y el inventario).
export function piezasDeEventos(): PiezaEvento[] {
  return Object.values(COLECCIONES).flatMap((c) => c?.piezas ?? []);
}
