// «Primeros pasos» (0260, aprobado el 2026-10-07; docs/PLAN_PRIMERA_VEZ_APP.md
// paso 12): 8 tareas que enseñan el juego, cada una con su premio, y uno grande al
// completarlas. La base decide si cada tarea está hecha; acá están los textos (los
// usa la app; la web tiene los suyos en messages/*.json, namespace PrimerosPasos),
// adónde lleva cada una y las llamadas.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { rpc: (fn: string, args?: Record<string, unknown>) => any };

export type TareaPrimerosPasos = "reto_diario" | "tecnica" | "amigo" | "duelo_amigo" | "misiones" | "constelacion" | "placa" | "racha" | "final";

export interface PasoPrimerosPasos {
  tarea: TareaPrimerosPasos;
  orden: number;
  premio: "chispas" | "hielo";
  cantidad: number;
  hecha: boolean;
  reclamada: boolean;
}

export const TEXTOS_PRIMEROS_PASOS: Record<TareaPrimerosPasos, { titulo: string; ensena: string }> = {
  reto_diario: { titulo: "Juega el reto diario", ensena: "El mismo reto para todos, cada día." },
  tecnica: { titulo: "Completa una Técnica en Aprender", ensena: "Trucos cortos para resolver más rápido." },
  amigo: { titulo: "Agrega un amigo", ensena: "Juega y compite con tu gente." },
  duelo_amigo: { titulo: "Reta a un amigo a un duelo", ensena: "Duelos en vivo, cara a cara." },
  misiones: { titulo: "Completa las 3 misiones del día", ensena: "Cada día, 3 misiones nuevas." },
  constelacion: { titulo: "Completa tu primera constelación", ensena: "Cada partida enciende estrellas en su ciudad." },
  placa: { titulo: "Personaliza tu placa", ensena: "Foto, marco, fondo o fuente: es tuya." },
  racha: { titulo: "Llega a 3 días de racha", ensena: "Juega cada día para que crezca." },
  final: { titulo: "¡Todos los primeros pasos!", ensena: "500 Chispas y el título «Bien encaminado»." },
};

// Adónde lleva tocar cada tarea en la app (rutas de expo-router).
export const RUTA_APP_PRIMEROS_PASOS: Partial<Record<TareaPrimerosPasos, string>> = {
  reto_diario: "/reto/diario",
  tecnica: "/(tabs)/mundos",
  amigo: "/amigos/buscar",
  duelo_amigo: "/(tabs)/social",
  misiones: "/recompensas",
  constelacion: "/recompensas",
  placa: "/editar-placa",
  racha: "/(tabs)/mundos",
};

// Adónde lleva en la web.
export const RUTA_WEB_PRIMEROS_PASOS: Partial<Record<TareaPrimerosPasos, string>> = {
  reto_diario: "/reto-diario",
  tecnica: "/",
  amigo: "/amigos",
  duelo_amigo: "/amigos",
  misiones: "/recompensas",
  constelacion: "/recompensas",
  placa: "/tienda",
  racha: "/",
};

export function textoPremioPrimerPaso(p: Pick<PasoPrimerosPasos, "premio" | "cantidad">): string {
  return p.premio === "hielo" ? (p.cantidad === 1 ? "1 hielo" : `${p.cantidad} hielos`) : `${p.cantidad} Chispas`;
}

function filas<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

// Sin 0260 en la base devuelve [] (y la tarjeta no se muestra).
export async function misPrimerosPasos(sb: SupabaseClient): Promise<PasoPrimerosPasos[]> {
  const { data, error } = await sb.rpc("mis_primeros_pasos");
  return error ? [] : filas<PasoPrimerosPasos>(data);
}

export async function reclamarPrimerPaso(sb: SupabaseClient, tarea: TareaPrimerosPasos): Promise<number> {
  const { data, error } = await sb.rpc("reclamar_primer_paso", { p_tarea: tarea });
  if (error) throw error;
  return filas<{ puntos_total: number }>(data)[0]?.puntos_total ?? 0;
}

// La tarjeta desaparece cuando ya se reclamó el premio final.
export function primerosPasosTerminados(pasos: PasoPrimerosPasos[]): boolean {
  return pasos.length === 0 || pasos.some((p) => p.tarea === "final" && p.reclamada);
}
