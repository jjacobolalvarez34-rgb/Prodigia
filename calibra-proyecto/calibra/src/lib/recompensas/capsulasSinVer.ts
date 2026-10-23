// Cápsulas abiertas cuyo premio el jugador quizá no llegó a ver (pedido 2026-10-23:
// «qué pasa si le doy a abrir una cápsula pero me salgo antes de abrirla»).
//
// La base entrega el premio de una sola vez (abrir_capsula, 0249/0297: bloquea la
// fila y marca abierta_at y premio en la misma transacción), así que nunca se pierde
// ni se abre dos veces. Lo que sí podía perderse era VERLO: si el jugador tocaba la
// cápsula y se iba durante el suspenso, el premio quedaba en su cuenta sin que supiera
// qué le había salido. Por eso, justo antes de pedir el premio, se anota la cápsula
// («marca») en el aparato; al verlo se borra. Al volver a Recompensas, las marcas que
// quedan se cruzan con capsulas_usuario (la política de 0249 deja leer las propias):
//   - sigue cerrada → no pasó nada, se borra la marca (está en «Por abrir»);
//   - abierta y con premio → se le muestra lo que le salió (la animación entera);
//   - no aparece → puede ser de otra cuenta en este aparato: se guarda unos días.
// Lo comparten la web (localStorage) y la app (AsyncStorage); el guardado va aparte.
import type { Capsula, PremioCapsula } from "./api";
import type { TipoCapsula } from "./catalogo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { from: (tabla: string) => any };

export const CLAVE_CAPSULAS_ABRIENDO = "prodigia:capsulas-abriendo";
// Una marca que no se encuentra (otra cuenta, cápsula borrada) se descarta pasado esto.
const VIDA_MARCA_MS = 14 * 24 * 3600 * 1000;
const MAX_MARCAS = 30;

export interface MarcaApertura {
  id: string;
  // Cuándo se pidió el premio (ms).
  t: number;
}

// Lo que salió, sin el saldo de ese momento (ya no sirve: se recarga el actual).
export type PremioGuardado = Omit<PremioCapsula, "puntos_total">;

export interface CapsulaSinVer {
  capsula: Capsula;
  premio: PremioGuardado;
}

export function leerMarcas(crudo: string | null | undefined): MarcaApertura[] {
  if (!crudo) return [];
  try {
    const v = JSON.parse(crudo) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((m): m is MarcaApertura => !!m && typeof (m as MarcaApertura).id === "string" && typeof (m as MarcaApertura).t === "number");
  } catch {
    return [];
  }
}

export function conMarca(marcas: MarcaApertura[], id: string, ahora: number): MarcaApertura[] {
  return [...marcas.filter((m) => m.id !== id), { id, t: ahora }].slice(-MAX_MARCAS);
}

export function sinMarca(marcas: MarcaApertura[], id: string): MarcaApertura[] {
  return marcas.filter((m) => m.id !== id);
}

// El jsonb `premio` de capsulas_usuario (0249) como lo devuelve abrir_capsula.
export function premioDeFila(p: unknown): PremioGuardado | null {
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  if (typeof o.premio !== "string") return null;
  return {
    premio: o.premio,
    slug: typeof o.slug === "string" ? o.slug : null,
    nombre: typeof o.nombre === "string" ? o.nombre : null,
    rareza: typeof o.rareza === "string" ? o.rareza : null,
    cantidad: typeof o.cantidad === "number" ? o.cantidad : 0,
    convertido: o.convertido === true,
  };
}

interface FilaCapsula {
  id: string;
  tipo: TipoCapsula;
  mundo: string | null;
  detalle: Capsula["detalle"];
  creada_at: string;
  abierta_at: string | null;
  premio: unknown;
}

// Decide qué hacer con cada marca según su fila (pura, para probarla).
export function clasificarMarcas(marcas: MarcaApertura[], filas: FilaCapsula[], ahora: number): { sinVer: CapsulaSinVer[]; quedan: MarcaApertura[] } {
  const porId = new Map(filas.map((f) => [f.id, f]));
  const sinVer: CapsulaSinVer[] = [];
  const quedan: MarcaApertura[] = [];
  for (const m of marcas) {
    const f = porId.get(m.id);
    if (!f) {
      if (ahora - m.t < VIDA_MARCA_MS) quedan.push(m);
      continue;
    }
    if (!f.abierta_at) continue;
    const premio = premioDeFila(f.premio);
    if (!premio) continue;
    sinVer.push({ capsula: { id: f.id, tipo: f.tipo, mundo: f.mundo, detalle: f.detalle, creada_at: f.creada_at }, premio });
    quedan.push(m);
  }
  return { sinVer, quedan };
}

// Cruza las marcas con la base. Si la consulta falla (sin conexión), no toca nada.
export async function revisarMarcas(sb: SupabaseClient, marcas: MarcaApertura[], ahora: number): Promise<{ sinVer: CapsulaSinVer[]; quedan: MarcaApertura[] }> {
  if (marcas.length === 0) return { sinVer: [], quedan: [] };
  const { data, error } = await sb
    .from("capsulas_usuario")
    .select("id, tipo, mundo, detalle, creada_at, abierta_at, premio")
    .in(
      "id",
      marcas.map((m) => m.id)
    );
  if (error) return { sinVer: [], quedan: marcas };
  return clasificarMarcas(marcas, (data as FilaCapsula[] | null) ?? [], ahora);
}
