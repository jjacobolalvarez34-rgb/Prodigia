// Tipo mínimo del cliente: así sirve el de la web y el de la app (que traen su propia copia de supabase-js).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { rpc: (fn: string, args?: Record<string, unknown>) => any };
import { COLECCIONES, slugEvento, type Coleccion } from "./colecciones";
import { inicioEventoMs } from "./calendario";
import type { TemaActivo } from "./temas";

// Evento de la festividad (0289): Fichas, colección y cierre. Web y app.

export interface EstadoEvento {
  ganadas: number;
  gastadas: number;
  saldo: number;
  cerrado: boolean;
  chispas_cierre: number;
  piezas: string[];
}

export interface EventoHoy {
  slug: string;
  coleccion: Coleccion;
  desde: string;
  hasta: string;
  // Momento exacto en que abre (después de una Gran Alineación, si la hay ese día).
  inicioMs: number;
  // «proximo» en la decoración (todavía no se canjea), «abierto» durante el evento y
  // el día de cierre, «cierre» el día después (cambiar las Fichas que sobran).
  estado: "proximo" | "abierto" | "cierre";
}

export function eventoDeTema(t: TemaActivo | null): EventoHoy | null {
  if (!t) return null;
  const coleccion = COLECCIONES[t.tema.id];
  if (!coleccion || !t.hoy.rango.desde) return null;
  return {
    slug: slugEvento(t.tema.id, t.hoy.rango.desde),
    coleccion,
    desde: t.hoy.rango.desde,
    hasta: t.hoy.rango.hasta,
    inicioMs: inicioEventoMs(t.hoy.rango),
    estado: t.fase === "decoracion" ? "proximo" : t.fase === "evento" ? "abierto" : "cierre",
  };
}

export async function estadoEvento(sb: SupabaseClient, slug: string): Promise<EstadoEvento | null> {
  const { data, error } = await sb.rpc("estado_evento", { p_evento: slug });
  if (error) return null;
  const fila = (data as EstadoEvento[] | null)?.[0];
  return fila ? { ...fila, piezas: fila.piezas ?? [] } : null;
}

export async function canjearPieza(sb: SupabaseClient, slug: string, item: string, conCometas: boolean): Promise<{ saldo: number; cometas: number }> {
  const { data, error } = await sb.rpc("canjear_pieza_evento", { p_evento: slug, p_item: item, p_con_cometas: conCometas });
  if (error) throw error;
  return (data as { saldo: number; cometas: number }[])[0];
}

export async function cerrarFichas(sb: SupabaseClient, slug: string): Promise<{ chispas: number; puntos_total: number }> {
  const { data, error } = await sb.rpc("cerrar_fichas_evento", { p_evento: slug });
  if (error) throw error;
  return (data as { chispas: number; puntos_total: number }[])[0];
}

export function mensajeErrorEvento(e: unknown): string {
  const m = (e as { message?: string } | null)?.message ?? "";
  if (/faltan fichas/i.test(m)) return "Te faltan fichas para esta pieza. Juega un poco más.";
  if (/faltan Cometas/i.test(m)) return "Te faltan Cometas para esta pieza.";
  if (/ya tienes/i.test(m)) return "Ya tienes esta pieza.";
  if (/no esta abierto/i.test(m)) return "El evento todavía no empezó (o ya terminó).";
  if (/ya cambiaste/i.test(m)) return "Ya cambiaste tus fichas.";
  return "No se pudo. Inténtalo de nuevo.";
}

// Tiempo que falta hasta el final de un día (UTC): «3 d 4 h» o «5 h 12 min».
export function faltaHasta(isoDia: string, ahora = Date.now()): string {
  return faltaPara(Date.parse(`${isoDia}T23:59:59Z`), ahora);
}

// Tiempo que falta hasta un momento exacto, con el mismo formato.
export function faltaPara(momentoMs: number, ahora = Date.now()): string {
  const ms = Math.max(0, momentoMs - ahora);
  const dias = Math.floor(ms / 86_400_000);
  const horas = Math.floor((ms % 86_400_000) / 3_600_000);
  const min = Math.floor((ms % 3_600_000) / 60_000);
  return dias > 0 ? `${dias} d ${horas} h` : `${horas} h ${min} min`;
}
