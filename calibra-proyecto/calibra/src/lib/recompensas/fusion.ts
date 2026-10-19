import type { Capsula } from "./api";
import type { TipoCapsula } from "./catalogo";

// Tipo mínimo del cliente: así sirve el de la web y el de la app.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { rpc: (fn: string, args?: Record<string, unknown>) => any };

// Fusión de cápsulas (0290, PLAN_ECONOMIA.md §4.2): 3 cápsulas del mismo nivel + Chispas
// → 1 del nivel siguiente. Mismo mapa que nivel_fusion_capsula() de la base.
export type NivelFusion = 1 | 2 | 3;

export function nivelFusion(tipo: TipoCapsula): NivelFusion | null {
  if (tipo === "diaria" || tipo === "misiones" || tipo === "nivel" || tipo === "liga") return 1;
  if (tipo === "racha" || tipo === "liga_bronce" || tipo === "plata") return 2;
  if (tipo === "liga_plata" || tipo === "oro") return 3;
  return null;
}

export const FUSION: Record<NivelFusion, { nombre: string; destino: TipoCapsula; costo: number }> = {
  1: { nombre: "Bronce", destino: "plata", costo: 50 },
  2: { nombre: "Plata", destino: "oro", costo: 150 },
  3: { nombre: "Oro", destino: "prisma", costo: 400 },
};

// Etiqueta de rango de cada tipo (para ordenar y mostrar el nivel en la lista).
export type Rango = "bronce" | "plata" | "oro" | "prisma" | "especial";
export function rangoCapsula(tipo: TipoCapsula): Rango {
  const n = nivelFusion(tipo);
  if (n === 1) return "bronce";
  if (n === 2) return "plata";
  if (n === 3) return "oro";
  if (tipo === "prisma" || tipo === "liga_oro" || tipo === "supernova") return "prisma";
  return "especial";
}

export const NOMBRE_RANGO: Record<Rango, string> = { bronce: "Bronce", plata: "Plata", oro: "Oro", prisma: "Prisma", especial: "Especial" };
// Legibles sobre fondo claro y oscuro.
export const COLOR_RANGO: Record<Rango, string> = { bronce: "#B9773A", plata: "#8E9BB5", oro: "#D99A1A", prisma: "#2FB9D9", especial: "#9B6BFF" };
const ORDEN_RANGO: Record<Rango, number> = { prisma: 0, especial: 1, oro: 2, plata: 3, bronce: 4 };

// Las cápsulas por abrir, juntas por tipo (y ciudad): «×4» en vez de cuatro tarjetas.
export interface GrupoCapsulas {
  clave: string;
  tipo: TipoCapsula;
  mundo: string | null;
  capsulas: Capsula[];
}

export function agruparCapsulas(lista: Capsula[]): GrupoCapsulas[] {
  const grupos = new Map<string, GrupoCapsulas>();
  for (const c of lista) {
    const clave = `${c.tipo}:${c.mundo ?? ""}`;
    const g = grupos.get(clave) ?? { clave, tipo: c.tipo, mundo: c.mundo, capsulas: [] };
    g.capsulas.push(c);
    grupos.set(clave, g);
  }
  return [...grupos.values()].sort((a, b) => ORDEN_RANGO[rangoCapsula(a.tipo)] - ORDEN_RANGO[rangoCapsula(b.tipo)] || b.capsulas.length - a.capsulas.length);
}

// Las fusiones que se pueden hacer ahora: por nivel, cuántas hay y cuáles 3 se usarían
// (primero las más viejas).
export interface FusionPosible {
  nivel: NivelFusion;
  cuantas: number;
  ids: string[];
  destino: TipoCapsula;
  costo: number;
}

export function fusionesPosibles(lista: Capsula[]): FusionPosible[] {
  const out: FusionPosible[] = [];
  for (const nivel of [1, 2, 3] as NivelFusion[]) {
    const delNivel = lista.filter((c) => nivelFusion(c.tipo) === nivel).sort((a, b) => (a.creada_at < b.creada_at ? -1 : 1));
    if (delNivel.length >= 3) out.push({ nivel, cuantas: delNivel.length, ids: delNivel.slice(0, 3).map((c) => c.id), destino: FUSION[nivel].destino, costo: FUSION[nivel].costo });
  }
  return out;
}

export async function fusionarCapsulas(sb: SupabaseClient, ids: string[]): Promise<{ id: string; tipo: TipoCapsula; costo: number; puntos_total: number }> {
  const { data, error } = await sb.rpc("fusionar_capsulas", { p_ids: ids });
  if (error) throw error;
  return (data as { id: string; tipo: TipoCapsula; costo: number; puntos_total: number }[])[0];
}

export function mensajeErrorFusion(e: unknown): string {
  const m = (e as { message?: string } | null)?.message ?? "";
  if (/faltan Chispas/i.test(m)) return "Te faltan Chispas para fusionar.";
  if (/mismo nivel/i.test(m)) return "Las 3 cápsulas tienen que ser del mismo nivel.";
  if (/ya no esta disponible/i.test(m)) return "Una de esas cápsulas ya no está. Recarga e inténtalo de nuevo.";
  return "No se pudo fusionar. Inténtalo de nuevo.";
}
