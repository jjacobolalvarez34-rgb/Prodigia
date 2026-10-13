// Reto de fin de semana en la app: mismas preguntas, reglas y premios que la web
// (src/lib/retoFinde.ts); los intentos, el tiempo y los premios los lleva la base (0281).
import { generarRetoFinde, sabadoAnterior, sabadoDelFinde } from "@/lib/retoFinde";
import type { PreguntaRetoDiario } from "@/lib/retoDiario";
import { placaBasica, type PlacaDatos } from "./placa";
import { supabase } from "./supabase";

export interface IntentoFinde {
  intento: number;
  correctos: number | null;
  tiempo_ms: number | null;
  terminado_at: string | null;
}

export interface FilaFinde {
  placa: PlacaDatos;
  correctos: number;
  tiempoMs: number;
  puesto: number;
}

export interface ResultadoFinde {
  intento: number;
  correctos: number;
  tiempo_ms: number;
  chispas: number;
  mejor_correctos: number;
  mejor_tiempo_ms: number;
  puesto: number;
  puntos_total: number;
}

export interface EstadoFinde {
  sabado: string | null;
  preguntas: PreguntaRetoDiario[];
  intentos: IntentoFinde[];
  ranking: FilaFinde[];
  // Cometas del finde pasado, si recién se pagaron.
  premio: { puesto: number; cometas: number } | null;
}

export async function rankingFinde(sabado: string): Promise<FilaFinde[]> {
  const { data } = await supabase.rpc("ranking_reto_finde", { p_sabado: sabado });
  return ((data as { user_id: string; display_name: string | null; avatar_url: string | null; correctos: number; tiempo_ms: number; puesto: number }[] | null) ?? []).map((f) => ({
    placa: placaBasica(f.user_id, f.display_name, { avatarUrl: f.avatar_url }),
    correctos: f.correctos,
    tiempoMs: f.tiempo_ms,
    puesto: f.puesto,
  }));
}

// El premio del finde pasado se cobra al entrar (la base paga una sola vez).
export async function cobrarPremioFinde(): Promise<{ puesto: number; cometas: number } | null> {
  const { data } = await supabase.rpc("premio_reto_finde");
  return ((data as { puesto: number; cometas: number }[] | null) ?? [])[0] ?? null;
}

export async function cargarFinde(userId: string): Promise<EstadoFinde> {
  const sabado = sabadoDelFinde();
  const [premio, ranking, { data: intentos }] = await Promise.all([
    cobrarPremioFinde().catch(() => null),
    rankingFinde(sabado ?? sabadoAnterior()),
    sabado
      ? supabase.from("retos_finde_intentos").select("intento, correctos, tiempo_ms, terminado_at").eq("user_id", userId).eq("sabado", sabado).order("intento")
      : Promise.resolve({ data: [] }),
  ]);
  return { sabado, preguntas: sabado ? generarRetoFinde(sabado) : [], intentos: (intentos ?? []) as IntentoFinde[], ranking, premio };
}

export async function iniciarFinde(): Promise<{ intento: number; iniciadoAt: number }> {
  const { data, error } = await supabase.rpc("iniciar_reto_finde");
  if (error) throw error;
  const f = (data as { intento: number; iniciado_at: string }[])[0];
  return { intento: f.intento, iniciadoAt: Date.parse(f.iniciado_at) || Date.now() };
}

export async function terminarFinde(correctos: number): Promise<ResultadoFinde> {
  const { data, error } = await supabase.rpc("terminar_reto_finde", { p_correctos: correctos });
  if (error) throw error;
  return (data as ResultadoFinde[])[0];
}
