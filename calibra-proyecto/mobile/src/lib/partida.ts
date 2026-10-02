// Guardado y cierre de partida, comunes a todos los mundos de la app. Usan las mismas
// RPC security definer que las rutas /api/attempts y /api/practica/finish de la web:
// el XP, el anti-apuro y la calibración se deciden en la base, nunca en el teléfono.
import { verificarLogros } from "@/lib/logros/verificar";
import { tiempoEsperadoMs } from "@/lib/practica/formulas";
import { verificarTitulos } from "@/lib/titulos/verificar";
import type { MundoSlug } from "~/tema";
import { encolar, esErrorDeRed, hayPendientes, marcarSinRed, sincronizar } from "./sinConexion";
import { supabase } from "./supabase";

// La lógica compartida con la web tipa el cliente con su propia copia de
// supabase-js; en ejecución es el mismo cliente.
type ClienteWeb = Parameters<typeof verificarLogros>[0];

export interface ResultadoIntento {
  xp: number;
  nivel: number | null;
  sospechoso: boolean;
  // Sin conexión: quedó en el teléfono y se sube después (sin XP por ahora).
  sinConexion?: boolean;
}

// Mismo piso de tiempo que /api/attempts: un intento absurdamente rápido se guarda
// pero no calibra (la base además no le da XP).
function esTiempoSospechoso(nivel: number, timeMs: number): boolean {
  const piso = Math.max(150, tiempoEsperadoMs(nivel) * 0.12);
  return timeMs < piso;
}

// `protegido`: el intento fallado no baja el nivel (escudo de calibración, como en la web).
export async function guardarIntentoTipo(problemType: string, nivel: number, correcto: boolean, timeMs: number, protegido = false): Promise<ResultadoIntento> {
  const sospechoso = esTiempoSospechoso(nivel, timeMs);
  const args = { p_problem_type: problemType, p_level: nivel, p_correct: correcto, p_time_ms: timeMs, p_protegido: protegido, p_calibrar: !sospechoso };
  const r = await supabase.rpc("insertar_intento", args).then(
    (x) => x,
    (e: unknown) => ({ data: null, error: e as { message: string; code?: string } })
  );
  if (r.error && esErrorDeRed(r.error)) {
    await encolar({ tipo: "intento", problemType, nivel, correcto, timeMs, protegido, calibrar: !sospechoso });
    return { xp: 0, nivel: null, sospechoso, sinConexion: true };
  }
  if (r.error) throw r.error;
  alVolverLaRed();
  const fila = (r.data as { xp: number; nivel: number | null; sospechoso: boolean }[] | null)?.[0];
  return { xp: fila?.xp ?? 0, nivel: fila?.nivel ?? null, sospechoso: fila?.sospechoso ?? sospechoso };
}

// Enigmia (insertar_intento_logica): calibra por categoría en logic_skill_levels.
export async function guardarIntentoLogica(puzzleId: string, dificultad: number, categoria: string, correcto: boolean, timeMs: number, protegido = false): Promise<ResultadoIntento> {
  const args = { p_puzzle_id: puzzleId, p_dificultad: dificultad, p_correct: correcto, p_time_ms: timeMs, p_categoria: categoria, p_protegido: protegido };
  const r = await supabase.rpc("insertar_intento_logica", args).then(
    (x) => x,
    (e: unknown) => ({ data: null, error: e as { message: string; code?: string } })
  );
  if (r.error && esErrorDeRed(r.error)) {
    await encolar({ tipo: "logica", puzzleId, dificultad, correcto, timeMs, categoria, protegido });
    return { xp: 0, nivel: null, sospechoso: false, sinConexion: true };
  }
  if (r.error) throw r.error;
  alVolverLaRed();
  const fila = (r.data as { xp: number; nivel: number | null; sospechoso: boolean }[] | null)?.[0];
  return { xp: fila?.xp ?? 0, nivel: fila?.nivel ?? null, sospechoso: fila?.sospechoso ?? false };
}

// Hay red otra vez: si quedó algo de una partida sin conexión, se sube.
function alVolverLaRed() {
  marcarSinRed(false);
  if (hayPendientes()) sincronizar();
}

export interface ResultadoPartida {
  chispasTotal: number;
  xpHoy: number;
  metaDiaria: number;
  metaAlcanzada: boolean;
  nivelCuentaSubio: boolean;
  nivelCuentaNuevo: number;
  bonusNivel: number;
  nivelMundo: number | null;
  nivelMundoAnterior: number | null;
  rachaAntes: number;
  rachaDespues: number;
  logros: { nombre: string; descripcion: string }[];
  // La partida se jugó (o se cerró) sin conexión: queda guardada en el teléfono.
  sinConexion?: boolean;
}

// Cierre de partida: lo mismo que hace /api/practica/finish (registrar el XP del
// día, consumir el boost, nivel de mundo con su hito en el feed, logros y títulos).
// registrar_xp_diario ignora p_xp y suma el XP real de los intentos del día (0120),
// así que mandar el total del sprint es solo informativo. En un duelo casual en un
// mundo que el jugador no compró no se suma nivel de mundo (misma regla que la web).
export async function cerrarPartida(xpSprint: number, mundo: MundoSlug = "numeria", duelId?: string): Promise<ResultadoPartida> {
  // Primero lo que haya quedado sin subir (si no, no contaría para el día).
  if (hayPendientes()) await sincronizar();
  if (hayPendientes()) return partidaSinConexion(mundo);
  const { data: sesion } = await supabase.auth.getSession();
  const userId = sesion.session?.user.id;
  const { data: antes } = userId ? await supabase.from("profiles").select("streak_dias, mundos_desbloqueados").eq("id", userId).single() : { data: null };
  const perfilAntes = antes as { streak_dias: number; mundos_desbloqueados: string[] } | null;

  const { data: registro, error } = await supabase.rpc("registrar_xp_diario", { p_xp: xpSprint });
  if (error && esErrorDeRed(error)) return partidaSinConexion(mundo);
  if (error) throw error;
  await supabase.rpc("consumir_boost_pendiente");

  let sumarMundo = xpSprint > 0;
  if (sumarMundo && duelId) {
    const { data: duelo } = await supabase.from("duels").select("clasificatorio").eq("id", duelId).maybeSingle();
    if (duelo && !(duelo as { clasificatorio: boolean }).clasificatorio && !(perfilAntes?.mundos_desbloqueados ?? []).includes(mundo)) sumarMundo = false;
  }

  let nivelMundo: number | null = null;
  let nivelMundoAnterior: number | null = null;
  if (sumarMundo) {
    const { data: progreso } = await supabase.rpc("registrar_progreso_mundo", { p_world: mundo, p_puntos: xpSprint });
    const filaMundo = (progreso as { nivel_mundo_out: number; nivel_anterior: number }[] | null)?.[0];
    nivelMundo = filaMundo?.nivel_mundo_out ?? null;
    nivelMundoAnterior = filaMundo?.nivel_anterior ?? null;
    // Hito del feed: cruzar un múltiplo de 5 en el nivel de mundo.
    if (userId && nivelMundo != null && nivelMundoAnterior != null && nivelMundo > nivelMundoAnterior && Math.floor(nivelMundo / 5) > Math.floor(nivelMundoAnterior / 5)) {
      await supabase.from("feed_posts").insert({ user_id: userId, tipo: "nivel_mundo", mundo, nivel_mundo_valor: nivelMundo });
    }
  }

  let logros: { nombre: string; descripcion: string }[] = [];
  if (userId) {
    logros = (await verificarLogros(supabase as unknown as ClienteWeb, userId).catch(() => [])).map((l) => ({ nombre: l.nombre, descripcion: l.descripcion }));
    await verificarTitulos(supabase as unknown as ClienteWeb, userId).catch(() => []);
  }
  await supabase.rpc("resolver_apuesta_si_activa");

  const r = (registro as {
    xp_total: number;
    xp_ganado_hoy: number;
    meta_alcanzada: boolean;
    meta_xp_diaria: number;
    nivel_cuenta_subio: boolean;
    nivel_cuenta_nuevo: number;
    nivel_cuenta_bonus: number;
  }[])[0];

  const { data: despues } = userId ? await supabase.from("profiles").select("streak_dias").eq("id", userId).single() : { data: null };

  return {
    chispasTotal: r.xp_total,
    xpHoy: r.xp_ganado_hoy,
    metaDiaria: r.meta_xp_diaria,
    metaAlcanzada: r.meta_alcanzada,
    nivelCuentaSubio: r.nivel_cuenta_subio,
    nivelCuentaNuevo: r.nivel_cuenta_nuevo,
    bonusNivel: r.nivel_cuenta_bonus,
    nivelMundo,
    nivelMundoAnterior,
    rachaAntes: perfilAntes?.streak_dias ?? 0,
    rachaDespues: (despues as { streak_dias: number } | null)?.streak_dias ?? perfilAntes?.streak_dias ?? 0,
    logros,
  };
}

// Cierre sin conexión: la partida queda en la cola y su XP del día y nivel de mundo
// se registran al subirla.
async function partidaSinConexion(mundo: MundoSlug): Promise<ResultadoPartida> {
  await encolar({ tipo: "partida", mundo });
  const { leerJugador } = await import("./jugador");
  const j = leerJugador();
  const racha = j.resumen?.racha ?? 0;
  return {
    chispasTotal: j.resumen?.chispas ?? 0,
    xpHoy: 0,
    metaDiaria: 100,
    metaAlcanzada: false,
    nivelCuentaSubio: false,
    nivelCuentaNuevo: 0,
    bonusNivel: 0,
    nivelMundo: null,
    nivelMundoAnterior: null,
    rachaAntes: racha,
    rachaDespues: racha,
    logros: [],
    sinConexion: true,
  };
}
