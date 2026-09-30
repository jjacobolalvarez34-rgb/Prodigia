// Guardado y cierre de partida, comunes a todos los mundos de la app. Usan las mismas
// RPC security definer que las rutas /api/attempts y /api/practica/finish de la web:
// el XP, el anti-apuro y la calibración se deciden en la base, nunca en el teléfono.
import { tiempoEsperadoMs } from "@/lib/practica/formulas";
import type { MundoSlug } from "~/tema";
import { supabase } from "./supabase";

export interface ResultadoIntento {
  xp: number;
  nivel: number | null;
  sospechoso: boolean;
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
  const { data, error } = await supabase.rpc("insertar_intento", {
    p_problem_type: problemType,
    p_level: nivel,
    p_correct: correcto,
    p_time_ms: timeMs,
    p_protegido: protegido,
    p_calibrar: !sospechoso,
  });
  if (error) throw error;
  const fila = (data as { xp: number; nivel: number | null; sospechoso: boolean }[] | null)?.[0];
  return { xp: fila?.xp ?? 0, nivel: fila?.nivel ?? null, sospechoso: fila?.sospechoso ?? sospechoso };
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
}

// Cierre de partida: lo mismo que hace /api/practica/finish (sin la parte
// de duelos, apuestas ni feed, que la app todavía no tiene). registrar_xp_diario
// ignora p_xp y suma el XP real de los intentos del día (0120), así que mandar el
// total del sprint es solo informativo.
export async function cerrarPartida(xpSprint: number, mundo: MundoSlug = "numeria"): Promise<ResultadoPartida> {
  const { data: registro, error } = await supabase.rpc("registrar_xp_diario", { p_xp: xpSprint });
  if (error) throw error;
  await supabase.rpc("consumir_boost_pendiente");

  let nivelMundo: number | null = null;
  let nivelMundoAnterior: number | null = null;
  if (xpSprint > 0) {
    const { data: progreso } = await supabase.rpc("registrar_progreso_mundo", { p_world: mundo, p_puntos: xpSprint });
    const filaMundo = (progreso as { nivel_mundo_out: number; nivel_anterior: number }[] | null)?.[0];
    nivelMundo = filaMundo?.nivel_mundo_out ?? null;
    nivelMundoAnterior = filaMundo?.nivel_anterior ?? null;
  }

  const r = (registro as {
    xp_total: number;
    xp_ganado_hoy: number;
    meta_alcanzada: boolean;
    meta_xp_diaria: number;
    nivel_cuenta_subio: boolean;
    nivel_cuenta_nuevo: number;
    nivel_cuenta_bonus: number;
  }[])[0];

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
  };
}
