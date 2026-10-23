// Modo Zen (calibra/docs/PLAN_MODO_SIN_RELOJ.md): preguntas sin reloj con los temas,
// la dificultad (un nivel o un rango que sube), el largo y las opciones de cada mundo
// que elige el jugador. No guarda intentos ni da Chispas, XP o nivel; al terminar solo
// marca la racha del día (registrar_partida_zen, 0266).
//
// La lógica es la MISMA de la web (calibra/src/lib/zen): preguntas, configuración y
// estadísticas. Acá queda solo lo propio de la app: guardar la configuración en el
// teléfono, cargar niveles y el banco de Enigmia, y la llamada a la base.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizarConfigZen, problemTypeDeTema, type ConfigZen } from "@/lib/zen/config";
import { temasZen } from "@/lib/zen/preguntas";
import { cargarNivelesGeografia } from "./geografia";
import { cargarNivelesMundo, mundoJugable } from "./mundosJugables";
import { cargarNivelesNumeria } from "./numeria";
import { supabase } from "./supabase";

export { claveZen, esCorrectaZen, fallaZen, generarZen, solucionZen, temasZen, type PreguntaZen } from "@/lib/zen/preguntas";

// Nombre de la dificultad para la barra (1-10).
export function nombreDificultad(n: number): string {
  return n <= 3 ? "Fácil" : n <= 6 ? "Media" : n <= 8 ? "Difícil" : "Experto";
}

export async function prepararZen(slug: string): Promise<unknown> {
  const def = mundoJugable(slug);
  return def?.preparar ? def.preparar() : null;
}

// Nivel del jugador en cada tema del Zen (por id de tema; en Numeria «seccion:tipo»).
export async function cargarNivelesZen(slug: string, userId: string): Promise<Record<string, number>> {
  const temas = temasZen(slug);
  if (slug === "numeria") {
    const n = await cargarNivelesNumeria(userId);
    return Object.fromEntries(temas.map((t) => [t.id, n[problemTypeDeTema(slug, t.id)]]).filter(([, v]) => typeof v === "number"));
  }
  if (slug === "geografia") return { ...(await cargarNivelesGeografia(userId)) };
  const def = mundoJugable(slug);
  return def ? cargarNivelesMundo(def, userId) : {};
}

const clave = (slug: string) => `prodigia:zen:${slug}`;

export async function leerConfigZen(slug: string, nivelInicial: number): Promise<ConfigZen | null> {
  try {
    const raw = await AsyncStorage.getItem(clave(slug));
    return raw ? normalizarConfigZen(slug, JSON.parse(raw), nivelInicial) : null;
  } catch {
    return null;
  }
}

export function guardarConfigZen(slug: string, config: ConfigZen): void {
  AsyncStorage.setItem(clave(slug), JSON.stringify(config)).catch(() => undefined);
}

export async function registrarPartidaZen(mundo: string, respondidas: number): Promise<number | null> {
  const { data, error } = await supabase.rpc("registrar_partida_zen", { p_mundo: mundo, p_respondidas: respondidas });
  if (error) return null;
  const fila = Array.isArray(data) ? data[0] : data;
  return (fila as { racha?: number } | null)?.racha ?? null;
}
