// Partida de Numeria en la app: los problemas los genera EXACTAMENTE el mismo código
// que la web (../calibra/src/lib/practica, vía el alias @/), y el guardado usa las
// mismas RPC security definer que las rutas /api/attempts y /api/practica/finish —
// el XP, el anti-apuro y la calibración se deciden en la base, nunca en el teléfono.
import { generarProblema, type Problem } from "@/lib/practica/problems";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { tiempoEsperadoMs } from "@/lib/practica/formulas";
import { operacionPermitidaInvitado } from "@/lib/auth/accesoInvitado";
import { supabase } from "./supabase";

export type Operacion = "suma" | "resta" | "multiplicacion" | "division";
export type { Problem };

export const OPERACIONES: { tipo: Operacion; nombre: string; simbolo: string }[] = [
  { tipo: "suma", nombre: "Suma", simbolo: "+" },
  { tipo: "resta", nombre: "Resta", simbolo: "−" },
  { tipo: "multiplicacion", nombre: "Multiplicación", simbolo: "×" },
  { tipo: "division", nombre: "División", simbolo: "÷" },
];

export const DURACION_SPRINT_MS = 60_000;

export function operacionDisponible(tipo: Operacion, esInvitado: boolean): boolean {
  return !esInvitado || operacionPermitidaInvitado(tipo);
}

// Misma clave que SprintRunner.tsx de la web para no repetir un problema en la partida.
function claveProblema(p: Problem): string {
  return `${p.problemType}:${p.a}${p.symbol}${p.b}${p.incognitaB ? "?" : ""}`;
}

export function nuevoProblema(operaciones: Operacion[], niveles: Record<Operacion, number>, usados: Set<string>): Problem {
  return generarSinRepetir(
    () => {
      const tipo = operaciones[Math.floor(Math.random() * operaciones.length)];
      return generarProblema(tipo, niveles[tipo] ?? 1);
    },
    claveProblema,
    usados
  );
}

export function textoProblema(p: Problem): string {
  return p.incognitaB ? `${p.a} ${p.symbol} ? = ${p.b}` : `${p.a} ${p.symbol} ${p.b}`;
}

export async function cargarNiveles(userId: string): Promise<Record<Operacion, number>> {
  const niveles: Record<Operacion, number> = { suma: 1, resta: 1, multiplicacion: 1, division: 1 };
  const { data } = await supabase
    .from("skill_levels")
    .select("problem_type, nivel")
    .eq("user_id", userId)
    .in("problem_type", OPERACIONES.map((o) => o.tipo));
  for (const fila of data ?? []) niveles[fila.problem_type as Operacion] = fila.nivel as number;
  return niveles;
}

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

export async function guardarIntento(p: Problem, correcto: boolean, timeMs: number): Promise<ResultadoIntento> {
  const sospechoso = esTiempoSospechoso(p.nivel, timeMs);
  const { data, error } = await supabase.rpc("insertar_intento", {
    p_problem_type: p.problemType,
    p_level: p.nivel,
    p_correct: correcto,
    p_time_ms: timeMs,
    p_protegido: false,
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

// Cierre de partida: lo mismo que hace /api/practica/finish para Numeria (sin la parte
// de duelos, apuestas ni feed, que la app todavía no tiene). registrar_xp_diario
// ignora p_xp y suma el XP real de los intentos del día (0120), así que mandar el
// total del sprint es solo informativo.
export async function cerrarPartida(xpSprint: number): Promise<ResultadoPartida> {
  const { data: registro, error } = await supabase.rpc("registrar_xp_diario", { p_xp: xpSprint });
  if (error) throw error;
  await supabase.rpc("consumir_boost_pendiente");

  let nivelMundo: number | null = null;
  let nivelMundoAnterior: number | null = null;
  if (xpSprint > 0) {
    const { data: mundo } = await supabase.rpc("registrar_progreso_mundo", { p_world: "numeria", p_puntos: xpSprint });
    const filaMundo = (mundo as { nivel_mundo_out: number; nivel_anterior: number }[] | null)?.[0];
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
