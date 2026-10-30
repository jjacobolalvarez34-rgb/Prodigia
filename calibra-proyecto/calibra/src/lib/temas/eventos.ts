// Tipo mínimo del cliente: así sirve el de la web y el de la app (que traen su propia copia de supabase-js).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { rpc: (fn: string, args?: Record<string, unknown>) => any };
import { COLECCIONES, slugEvento, type Coleccion } from "./colecciones";
import { hoyUtc, inicioEventoMs, rangosDelAnio } from "./calendario";
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

// Final de un día (UTC), en ms: hasta cuándo dura el último día de un evento.
export function finDelDiaMs(isoDia: string): number {
  return Date.parse(`${isoDia}T23:59:59Z`);
}

// Tiempo que falta hasta el final de un día (UTC), con el formato de faltaPara.
export function faltaHasta(isoDia: string, ahora = Date.now()): string {
  return faltaPara(finDelDiaMs(isoDia), ahora);
}

// Tiempo que falta hasta un momento exacto, hasta el segundo (pedido 2026-10-21: todos
// los contadores como el de la Gran Alineación): «3 d 04 h 12 min 05 s», «12 min 05 s».
export function faltaPara(momentoMs: number, ahora = Date.now()): string {
  const s = Math.max(0, Math.floor((momentoMs - ahora) / 1000));
  const dias = Math.floor(s / 86_400);
  const horas = Math.floor((s % 86_400) / 3_600);
  const min = Math.floor((s % 3_600) / 60);
  const seg = s % 60;
  const dos = (n: number) => String(n).padStart(2, "0");
  if (dias > 0) return `${dias} d ${dos(horas)} h ${dos(min)} min ${dos(seg)} s`;
  if (horas > 0) return `${horas} h ${dos(min)} min ${dos(seg)} s`;
  if (min > 0) return `${min} min ${dos(seg)} s`;
  return `${seg} s`;
}

// «Dar un dulce» (0292): una vez al día a un amigo; los dos ganan 1 ficha del evento.
export async function darDulce(sb: SupabaseClient, amigo: string): Promise<{ evento: string; saldo: number }> {
  const { data, error } = await sb.rpc("dar_dulce", { p_amigo: amigo });
  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as { evento: string; saldo: number };
}

export function mensajeErrorDulce(e: unknown): string {
  const m = (e as { message?: string } | null)?.message ?? "";
  if (/ya diste/i.test(m)) return "Ya diste tu dulce de hoy. Mañana puedes dar otro.";
  if (/solo puedes/i.test(m)) return "Solo puedes darle un dulce a un amigo.";
  if (/no hay un evento/i.test(m)) return "Ahora no hay un evento abierto.";
  return "No se pudo. Inténtalo de nuevo.";
}

// Eventos con colección que ya terminaron hace poco (hasta 14 días) y que no son el de
// hoy: si su día de cierre quedó tapado por otra fiesta (Halloween cierra el 1 de
// noviembre, que es Día de Muertos), las Fichas que sobran se cambian desde acá.
export function eventosPorCerrar(actual: string | null, ahora = Date.now()): { slug: string; coleccion: Coleccion; hasta: string }[] {
  const hoy = hoyUtc(ahora);
  const limite = hoyUtc(ahora - 14 * 86_400_000);
  const anio = Number(hoy.slice(0, 4));
  return [...rangosDelAnio(anio - 1), ...rangosDelAnio(anio)]
    .filter((r) => COLECCIONES[r.id] && r.hasta < hoy && r.hasta >= limite)
    .map((r) => ({ slug: slugEvento(r.id, r.desde), coleccion: COLECCIONES[r.id]!, hasta: r.hasta }))
    .filter((e, i, lista) => e.slug !== actual && lista.findIndex((x) => x.slug === e.slug) === i);
}
