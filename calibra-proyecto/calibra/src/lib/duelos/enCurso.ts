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
  retado_id?: string | null;
  emparejado?: boolean | null;
  ronda_numero?: number | null;
}

// Un reto que te mandaron y que todavía no aceptaste no es una partida en curso
// (2026-11-06: «cuando me mandan un duelo me aparece "partida en curso"»). La base no
// marca la aceptación (el duelo sigue 'pendiente' hasta jugarse), así que cuenta como
// aceptado solo si este dispositivo ya arrancó la ronda (progreso guardado). Los
// duelos del emparejamiento y las rondas 2 y 3 de una serie ya se aceptaron antes.
export function esRetoSinAceptar(d: FilaDuelo, userId: string, arrancados: ReadonlySet<string>): boolean {
  return d.retado_id === userId && d.emparejado !== true && (d.ronda_numero ?? 1) <= 1 && !arrancados.has(d.id);
}

export function elegirDueloEnCurso(
  duelos: FilaDuelo[],
  conResultado: ReadonlySet<string>,
  retos?: { userId: string; arrancados: ReadonlySet<string> }
): DueloEnCurso | null {
  const d = duelos.find((x) => !conResultado.has(x.id) && !(retos && esRetoSinAceptar(x, retos.userId, retos.arrancados)));
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

// `arrancado(id)`: si este dispositivo ya empezó esa ronda (web: localStorage de
// reanudar.ts; app: progresoDuelo.ts).
export async function buscarDueloEnCurso(
  sb: ClienteMinimo,
  userId: string,
  arrancado: (duelId: string) => boolean | Promise<boolean>
): Promise<DueloEnCurso | null> {
  const desde = new Date(Date.now() - VENTANA_RECONEXION_MS).toISOString();
  const { data } = await sb
    .from("duels")
    .select("id, mundo, serie_id, operation_type, sub_tipo, retado_id, emparejado, ronda_numero")
    .eq("estado", "pendiente")
    // Una serie decidida 2-0 deja su tercera ronda pendiente sin jugarse: no es una
    // partida en curso (2026-11-02: aparecía el aviso con la serie ya terminada).
    .eq("serie_finalizada", false)
    .or(`retador_id.eq.${userId},retado_id.eq.${userId}`)
    .gte("creado_at", desde)
    .order("creado_at", { ascending: false })
    // Las rondas de una serie se crean juntas: primero la que toca jugar.
    .order("ronda_numero", { ascending: true })
    .limit(5);
  const duelos = (data ?? []) as FilaDuelo[];
  if (duelos.length === 0) return null;
  const { data: res } = await sb.from("duel_results").select("duel_id").eq("user_id", userId).in("duel_id", duelos.map((d) => d.id)).limit(5);
  const conResultado = new Set(((res ?? []) as { duel_id: string }[]).map((r) => r.duel_id));
  const arrancados = new Set<string>();
  for (const d of duelos) {
    if (d.retado_id === userId && (await arrancado(d.id))) arrancados.add(d.id);
  }
  return elegirDueloEnCurso(duelos, conResultado, { userId, arrancados });
}
