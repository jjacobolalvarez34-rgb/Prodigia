// Partida de Numeria en la app: los problemas los genera EXACTAMENTE el mismo código
// que la web (../calibra/src/lib/practica, vía el alias @/), y el guardado usa las
// mismas RPC security definer que las rutas /api/attempts y /api/practica/finish —
// el XP, el anti-apuro y la calibración se deciden en la base, nunca en el teléfono.
import { generarProblema, type Problem } from "@/lib/practica/problems";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { operacionPermitidaInvitado } from "@/lib/auth/accesoInvitado";
import { guardarIntentoTipo } from "./partida";
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

// Guardar un intento y cerrar la partida son iguales en todos los mundos: ver partida.ts.
export function guardarIntento(p: Problem, correcto: boolean, timeMs: number) {
  return guardarIntentoTipo(p.problemType, p.nivel, correcto, timeMs);
}
