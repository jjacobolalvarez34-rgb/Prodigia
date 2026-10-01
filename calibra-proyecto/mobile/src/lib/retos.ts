// Reto diario (5 preguntas) y semanal (45): las preguntas salen del MISMO generador
// sembrado que la web (src/lib/retoDiario.ts), así todos los jugadores reciben las
// mismas el mismo día, en la web o en la app. El bonus y el ranking los da la base.
import { calcularRachaDiaria, calcularRachaSemanal, lunesDeEstaSemanaIso } from "@/lib/practica/racha";
import { generarRetoDelDia, generarRetoSemanal, type MundoRetoDiario, type PreguntaRetoDiario } from "@/lib/retoDiario";
import { verificarLogros } from "@/lib/logros/verificar";
import { verificarTitulos } from "@/lib/titulos/verificar";
import { supabase } from "./supabase";

// La lógica compartida con la web tipa el cliente con su propia copia de
// supabase-js; en ejecución es el mismo cliente.
type ClienteWeb = Parameters<typeof verificarLogros>[0];

export type TipoReto = "diario" | "semanal";
export type { PreguntaRetoDiario };

export function claveDe(tipo: TipoReto): string {
  return tipo === "diario" ? new Date().toISOString().slice(0, 10) : lunesDeEstaSemanaIso();
}

export interface EstadoReto {
  clave: string;
  preguntas: PreguntaRetoDiario[];
  completado: { correctos: number; puntosBonus: number } | null;
  racha: number;
}

export async function cargarReto(tipo: TipoReto, userId: string, mundos: string[]): Promise<EstadoReto> {
  const clave = claveDe(tipo);
  const tabla = tipo === "diario" ? "retos_diarios_completados" : "retos_semanales_completados";
  const columna = tipo === "diario" ? "fecha" : "semana_inicio";
  const [{ data: hecho }, { data: historial }] = await Promise.all([
    supabase.from(tabla).select("correctos, puntos_bonus").eq("user_id", userId).eq(columna, clave).maybeSingle(),
    supabase.from(tabla).select(columna).eq("user_id", userId).order(columna, { ascending: false }).limit(tipo === "diario" ? 120 : 60),
  ]);
  const fechas = ((historial as Record<string, string>[] | null) ?? []).map((r) => r[columna]);
  const racha = tipo === "diario" ? calcularRachaDiaria(fechas.map((f) => ({ fecha: f, meta_alcanzada: true })), clave) : calcularRachaSemanal(fechas, clave);
  const lista = (mundos.length > 0 ? mundos : ["numeria"]) as MundoRetoDiario[];
  const preguntas = tipo === "diario" ? generarRetoDelDia(clave, lista) : generarRetoSemanal(clave, lista);
  const h = hecho as { correctos: number; puntos_bonus: number } | null;
  return { clave, preguntas, completado: h ? { correctos: h.correctos, puntosBonus: h.puntos_bonus } : null, racha };
}

export async function completarReto(tipo: TipoReto, clave: string, correctos: number, userId: string) {
  const { data, error } =
    tipo === "diario"
      ? await supabase.rpc("completar_reto_diario", { p_fecha: clave, p_correctos: correctos })
      : await supabase.rpc("completar_reto_semanal", { p_semana: clave, p_correctos: correctos });
  if (error) throw error;
  const fila = (data as { puntos_bonus: number; puntos_total: number; ya_completado: boolean }[])[0];
  const logros = await verificarLogros(supabase as unknown as ClienteWeb, userId).catch(() => []);
  await verificarTitulos(supabase as unknown as ClienteWeb, userId).catch(() => []);
  return { ...fila, logros };
}

// Estado rápido para las tarjetas de Hoy.
export async function estadoRetosHoy(userId: string) {
  const [{ data: d }, { data: s }] = await Promise.all([
    supabase.from("retos_diarios_completados").select("correctos").eq("user_id", userId).eq("fecha", claveDe("diario")).maybeSingle(),
    supabase.from("retos_semanales_completados").select("correctos").eq("user_id", userId).eq("semana_inicio", claveDe("semanal")).maybeSingle(),
  ]);
  return {
    diario: (d as { correctos: number } | null)?.correctos ?? null,
    semanal: (s as { correctos: number } | null)?.correctos ?? null,
  };
}

// Progreso a medio camino del semanal (45 preguntas): se guarda en el teléfono.
export const CLAVE_PROGRESO = (tipo: TipoReto, clave: string) => `prodigia:reto:${tipo}:${clave}`;
