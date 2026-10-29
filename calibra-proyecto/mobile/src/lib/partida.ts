// Guardado y cierre de partida, comunes a todos los mundos de la app. Usan las mismas
// RPC security definer que las rutas /api/attempts y /api/practica/finish de la web:
// el XP, el anti-apuro y la calibración se deciden en la base, nunca en el teléfono.
import { useSyncExternalStore } from "react";
import { verificarLogros } from "@/lib/logros/verificar";
import { tiempoEsperadoMs } from "@/lib/practica/formulas";
import { verificarTitulos } from "@/lib/titulos/verificar";
import type { MundoSlug } from "~/tema";
import { encolar, esErrorDeRed, hayPendientes, marcarSinRed, sincronizar } from "./sinConexion";
import { supabase } from "./supabase";
import { revisarTrasPartida } from "./recompensas";
import { filasRacha, rachaDeFilas, type FilaRacha } from "./resumen";

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
  // Economía nueva (0280): Chispas de esta partida y Cometas por nivel múltiplo de 10.
  chispasPartida: number;
  cometasNivel: number;
  nivelMundo: number | null;
  nivelMundoAnterior: number | null;
  rachaAntes: number;
  rachaDespues: number;
  logros: { nombre: string; descripcion: string }[];
  // La partida se jugó (o se cerró) sin conexión: queda guardada en el teléfono.
  sinConexion?: boolean;
  // Para escuchar los logros que se terminan de contar después (useExtrasPartida).
  cierreId?: number;
}

// Lo que se termina de contar con el resultado ya en pantalla (2026-10-28): logros,
// títulos, apuesta, cápsulas y constelaciones. Antes todo eso iba en serie ANTES de
// mostrar el resultado y la pantalla de carga del final tardaba muchos segundos.
// Resultado lo escucha con useExtrasPartida(cierreId) y los logros aparecen suaves.
export interface ExtrasPartida {
  listo: boolean;
  logros: { nombre: string; descripcion: string }[];
}

const EXTRAS_VACIO: ExtrasPartida = { listo: false, logros: [] };
const extras = new Map<number, ExtrasPartida>();
const oyentesExtras = new Set<() => void>();
let ultimoCierre = 0;

function fijarExtras(id: number, e: ExtrasPartida) {
  extras.set(id, e);
  // Solo se guardan los últimos cierres; los viejos ya no los mira nadie.
  for (const k of extras.keys()) if (k < id - 5) extras.delete(k);
  oyentesExtras.forEach((o) => o());
}

function suscribirExtras(o: () => void) {
  oyentesExtras.add(o);
  return () => {
    oyentesExtras.delete(o);
  };
}

export function useExtrasPartida(cierreId: number | null | undefined): ExtrasPartida {
  return useSyncExternalStore(suscribirExtras, () => (cierreId == null ? EXTRAS_VACIO : (extras.get(cierreId) ?? EXTRAS_VACIO)));
}

// Cierre de partida: lo mismo que hace /api/practica/finish (registrar el XP del
// día, consumir el boost, nivel de mundo con su hito en el feed, logros y títulos).
// registrar_xp_diario ignora p_xp y suma el XP real de los intentos del día (0120),
// así que mandar el total del sprint es solo informativo. En un duelo casual en un
// mundo que el jugador no compró no se suma nivel de mundo (misma regla que la web).
//
// Cierre rápido (2026-10-28): devuelve en cuanto está lo que la pantalla de resultado
// muestra primero (Chispas, Exp del día, meta, nivel de cuenta y de mundo, racha), con
// una sola ida y vuelta después de los intentos. Orden que se respeta:
//   - la racha "de antes" se lee mientras se suben los últimos intentos (`esperar`),
//     porque registrar_xp_diario marca la meta de hoy; la de después se calcula acá;
//   - registrar_xp_diario y registrar_progreso_mundo van juntos (no dependen entre sí);
//   - consumir_boost va después del registro (que lee el boost), ya en segundo plano;
//   - logros, títulos, apuesta y cápsulas, en segundo plano y en paralelo.
// `xpSprint` puede ser una función: se lee después de `esperar` (los intentos suman XP).
export async function cerrarPartida(xpSprint: number | (() => number), mundo: MundoSlug = "numeria", duelId?: string, esperar?: Promise<unknown>): Promise<ResultadoPartida> {
  const { data: sesion } = await supabase.auth.getSession();
  const userId = sesion.session?.user.id;
  // Lecturas previas, en paralelo con los intentos que todavía se están subiendo.
  const filasAntes = userId ? filasRacha(userId).catch(() => [] as FilaRacha[]) : Promise.resolve([] as FilaRacha[]);
  const dueloCasualSinMundo = duelId && userId ? dueloNoSumaMundo(duelId, userId, mundo).catch(() => false) : Promise.resolve(false);
  if (esperar) await esperar;
  const xp = typeof xpSprint === "function" ? xpSprint() : xpSprint;

  // Primero lo que haya quedado sin subir (si no, no contaría para el día).
  if (hayPendientes()) await sincronizar();
  if (hayPendientes()) return partidaSinConexion(mundo);
  const filas = await filasAntes;
  const rachaAntes = rachaDeFilas(filas);

  const sumarMundo = xp > 0 && !(await dueloCasualSinMundo);
  const [registroRes, progresoRes] = await Promise.all([
    supabase.rpc("registrar_xp_diario", { p_xp: xp }),
    sumarMundo ? supabase.rpc("registrar_progreso_mundo", { p_world: mundo, p_puntos: xp }) : Promise.resolve(null),
  ]);
  const { data: registro, error } = registroRes;
  if (error && esErrorDeRed(error)) return partidaSinConexion(mundo);
  if (error) throw error;

  const filaMundo = (progresoRes?.data as { nivel_mundo_out: number; nivel_anterior: number }[] | null | undefined)?.[0];
  const nivelMundo = filaMundo?.nivel_mundo_out ?? null;
  const nivelMundoAnterior = filaMundo?.nivel_anterior ?? null;

  const r = (registro as {
    xp_total: number;
    xp_ganado_hoy: number;
    meta_alcanzada: boolean;
    meta_xp_diaria: number;
    nivel_cuenta_subio: boolean;
    nivel_cuenta_nuevo: number;
    nivel_cuenta_bonus: number;
    chispas_partida?: number;
    cometas_nivel?: number;
  }[])[0];

  const rachaDespues = userId ? rachaDeFilas(filas, r.meta_alcanzada) : rachaAntes;

  const cierreId = ++ultimoCierre;
  fijarExtras(cierreId, EXTRAS_VACIO);
  void contarEnSegundoPlano(cierreId, userId, mundo, nivelMundo, nivelMundoAnterior);

  return {
    chispasTotal: r.xp_total,
    xpHoy: r.xp_ganado_hoy,
    metaDiaria: r.meta_xp_diaria,
    metaAlcanzada: r.meta_alcanzada,
    nivelCuentaSubio: r.nivel_cuenta_subio,
    nivelCuentaNuevo: r.nivel_cuenta_nuevo,
    bonusNivel: r.nivel_cuenta_bonus,
    chispasPartida: r.chispas_partida ?? 0,
    cometasNivel: r.cometas_nivel ?? 0,
    nivelMundo,
    nivelMundoAnterior,
    rachaAntes,
    rachaDespues,
    logros: [],
    cierreId,
  };
}

// Duelo casual en un mundo que el jugador no compró: no suma nivel de mundo.
async function dueloNoSumaMundo(duelId: string, userId: string, mundo: MundoSlug): Promise<boolean> {
  const [{ data: duelo }, { data: perfil }] = await Promise.all([
    supabase.from("duels").select("clasificatorio").eq("id", duelId).maybeSingle(),
    supabase.from("profiles").select("mundos_desbloqueados").eq("id", userId).single(),
  ]);
  if (!duelo || (duelo as { clasificatorio: boolean }).clasificatorio) return false;
  return !((perfil as { mundos_desbloqueados: string[] } | null)?.mundos_desbloqueados ?? []).includes(mundo);
}

const nada = () => undefined;

async function contarEnSegundoPlano(cierreId: number, userId: string | undefined, mundo: MundoSlug, nivelMundo: number | null, nivelMundoAnterior: number | null) {
  const tareas: PromiseLike<unknown>[] = [
    // registrar_xp_diario ya leyó el boost: recién ahora se apaga.
    supabase.rpc("consumir_boost_pendiente").then(nada, nada),
    supabase.rpc("resolver_apuesta_si_activa").then(nada, nada),
    // Cápsulas (diaria, de nivel, de ciudad…): las otorga la base; acá solo se revisa.
    revisarTrasPartida(),
  ];
  // Hito del feed: cruzar un múltiplo de 5 en el nivel de mundo.
  if (userId && nivelMundo != null && nivelMundoAnterior != null && nivelMundo > nivelMundoAnterior && Math.floor(nivelMundo / 5) > Math.floor(nivelMundoAnterior / 5)) {
    tareas.push(supabase.from("feed_posts").insert({ user_id: userId, tipo: "nivel_mundo", mundo, nivel_mundo_valor: nivelMundo }).then(nada, nada));
  }
  let logros: { nombre: string; descripcion: string }[] = [];
  if (userId) {
    tareas.push(verificarTitulos(supabase as unknown as ClienteWeb, userId).catch(nada));
    logros = (await verificarLogros(supabase as unknown as ClienteWeb, userId).catch(() => [])).map((l) => ({ nombre: l.nombre, descripcion: l.descripcion }));
  }
  // Los logros se muestran apenas están; lo demás termina por su cuenta.
  fijarExtras(cierreId, { listo: true, logros });
  await Promise.allSettled(tareas);
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
    chispasPartida: 0,
    cometasNivel: 0,
    nivelMundo: null,
    nivelMundoAnterior: null,
    rachaAntes: racha,
    rachaDespues: racha,
    logros: [],
    sinConexion: true,
  };
}
