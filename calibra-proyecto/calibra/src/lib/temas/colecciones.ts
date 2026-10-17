import type { IdTema } from "./calendario";
import type { TipoParticula } from "./dibujos";

// Colecciones de los eventos (docs/eventos/PLAN_FESTIVIDADES.md capa 7 y
// economy/PLAN_ECONOMIA.md §7): cada fiesta grande trae sus piezas, que se ganan con
// las Fichas del evento (jugando) o se compran con Cometas. No se venden en el Bazar de
// siempre y vuelven el año siguiente. Las piezas usan las mismas categorías que la
// tienda (marco, fondo, estela, efecto, emote, título), así se ven igual en todas partes.

type Rareza = "comun" | "raro" | "epico" | "legendario";

export const MARCOS_EVENTO: { slug: string; nombre: string; colores: string[]; rareza: Rareza; precio: number }[] = [
  { slug: "evento_calabaza", nombre: "Calabaza", colores: ["#FF8A1F", "#1C1030", "#FFD36B"], rareza: "epico", precio: 3000 },
  { slug: "evento_esqueleto", nombre: "Esqueleto fosforescente", colores: ["#B8FFD9", "#3DDC97", "#FFFFFF"], rareza: "legendario", precio: 6000 },
];

export const FONDOS_EVENTO = [
  { valor: "evento_noche_luna", nombre: "Noche de luna", colores: ["#0B0726", "#3B1F5C", "#FF8A1F", "#0B0726"], rareza: "raro" as Rareza, precio: 1600 },
] as const;

export const ESTELAS_EVENTO: { valor: string; nombre: string; base: string; punta: string; rareza: Rareza; precio: number }[] = [
  { valor: "evento_murcielago", nombre: "Murciélago", base: "#7C3AED", punta: "#FF8A1F", rareza: "raro", precio: 1600 },
];

export const EFECTOS_EVENTO: { valor: string; nombre: string; forma: "estrellas" | "chispas"; colores: string[]; rareza: Rareza; precio: number }[] = [
  { valor: "evento_fuego_fatuo", nombre: "Fuego fatuo", forma: "estrellas", colores: ["#3DDC97", "#7FF0C8", "#A794FF", "#FFFFFF"], rareza: "raro", precio: 1600 },
];

export const EMOTES_EVENTO: { valor: string; emoji: string; texto: string; precio: number }[] = [{ valor: "evento_buu", emoji: "👻", texto: "¡Buu!", precio: 600 }];

export const TITULOS_EVENTO: { item: string; valor: string; nombre: string; rareza: Rareza; precio: number }[] = [
  { item: "titulo_evento_cazafantasmas", valor: "evento-cazafantasmas", nombre: "Cazafantasmas", rareza: "epico", precio: 3000 },
];

export interface PiezaEvento {
  item: string;
  categoria: "marco" | "fondo" | "estela" | "efecto" | "emote" | "titulo";
  valor: string;
  nombre: string;
  rareza: Rareza;
  fichas: number;
  cometas: number;
}

export interface Coleccion {
  tema: IdTema;
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
