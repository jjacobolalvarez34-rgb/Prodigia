// Reconexión a un duelo (pedido 2026-10-14: «si estoy en un duelo, me salgo de la app y
// vuelvo al instante, no me vuelve a conectar»). Busca un duelo tuyo que siga pendiente,
// reciente, y en el que todavía no mandaste tu resultado: ese es el que quedó a medias.
// Lo usan la web (BannerDueloEnCurso) y la app (ui/BannerDueloEnCurso).

export interface DueloEnCurso {
  id: string;
  mundo: string;
  serieId: string | null;
  operacion: string | null;
  subTipo: string | null;
}

// Los duelos duran unos minutos (0256: 2 min para entrar); 15 min de margen
// alcanzan aunque el reloj del dispositivo esté corrido.
export const VENTANA_RECONEXION_MS = 15 * 60_000;

// Parte pura: de los duelos pendientes recientes, el primero sin tu resultado.
interface FilaDuelo {
  id: string;
  mundo: string;
  serie_id: string | null;
  operation_type?: string | null;
  sub_tipo?: string | null;
}

export function elegirDueloEnCurso(duelos: FilaDuelo[], conResultado: ReadonlySet<string>): DueloEnCurso | null {
  const d = duelos.find((x) => !conResultado.has(x.id));
  return d ? { id: d.id, mundo: d.mundo, serieId: d.serie_id, operacion: d.operation_type ?? null, subTipo: d.sub_tipo ?? null } : null;
}

// Cliente mínimo (sirve el de la web y el de la app).
interface Consulta {
  select(c: string): Consulta;
  eq(c: string, v: unknown): Consulta;
  in(c: string, v: unknown[]): Consulta;
  or(f: string): Consulta;
  gte(c: string, v: unknown): Consulta;
  order(c: string, o: { ascending: boolean }): Consulta;
  limit(n: number): PromiseLike<{ data: unknown[] | null }>;
}
export interface ClienteMinimo {
  from(t: string): Consulta;
}

export async function buscarDueloEnCurso(sb: ClienteMinimo, userId: string): Promise<DueloEnCurso | null> {
  const desde = new Date(Date.now() - VENTANA_RECONEXION_MS).toISOString();
  const { data } = await sb
    .from("duels")
    .select("id, mundo, serie_id, operation_type, sub_tipo")
    .eq("estado", "pendiente")
    .or(`retador_id.eq.${userId},retado_id.eq.${userId}`)
    .gte("creado_at", desde)
    .order("creado_at", { ascending: false })
    .limit(5);
  const duelos = (data ?? []) as FilaDuelo[];
  if (duelos.length === 0) return null;
  const { data: res } = await sb.from("duel_results").select("duel_id").eq("user_id", userId).in("duel_id", duelos.map((d) => d.id)).limit(5);
  return elegirDueloEnCurso(duelos, new Set(((res ?? []) as { duel_id: string }[]).map((r) => r.duel_id)));
}
