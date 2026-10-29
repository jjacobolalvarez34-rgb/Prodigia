import AsyncStorage from "@react-native-async-storage/async-storage";
import { calcularRachaDiaria } from "@/lib/practica/racha";
import { supabase } from "./supabase";

// Foto chica del estado del jugador: la usan el inicio, el centro de avisos y los
// widgets de la pantalla de inicio del teléfono. Se guarda en el dispositivo para que
// el widget pueda dibujarse aunque no haya red.
export interface Resumen {
  nombre: string;
  racha: number;
  chispas: number;
  // Moneda premium (0279). Sin la migración aplicada, 0.
  cometas: number;
  nivelCuenta: number;
  xpHoy: number;
  metaDiaria: number;
  mensajesSinLeer: number;
  novedadesSinLeer: number;
  actualizado: string;
}

const CLAVE = "prodigia:resumen";

export async function leerResumenGuardado(): Promise<Resumen | null> {
  try {
    const raw = await AsyncStorage.getItem(CLAVE);
    return raw ? (JSON.parse(raw) as Resumen) : null;
  } catch {
    return null;
  }
}

// daily_progress.fecha la escribe la base con current_date (UTC), no la fecha del teléfono.
function hoyEnBase(): string {
  return new Date().toISOString().slice(0, 10);
}

// Racha de días: se deriva de daily_progress, igual que la web (calcularRachaDiaria).
// profiles.streak_dias no la escribe nada en la base y siempre valía 0 (2026-10-12).
export async function rachaDelJugador(userId: string): Promise<number> {
  return rachaDeFilas(await filasRacha(userId));
}

export interface FilaRacha {
  fecha: string;
  meta_alcanzada: boolean;
  congelado: boolean;
}

// Los últimos 60 días de daily_progress, para calcular la racha sin volver a pedirlos.
export async function filasRacha(userId: string): Promise<FilaRacha[]> {
  const { data } = await supabase
    .from("daily_progress")
    .select("fecha, meta_alcanzada, congelado")
    .eq("user_id", userId)
    .order("fecha", { ascending: false })
    .limit(60);
  return (data as { fecha: string; meta_alcanzada: boolean; congelado: boolean | null }[] | null)?.map((d) => ({ ...d, congelado: !!d.congelado })) ?? [];
}

// `metaHoy`: la meta de hoy recién alcanzada (lo que devuelve registrar_xp_diario), para
// saber la racha de después de una partida sin pedir las filas otra vez.
export function rachaDeFilas(filas: FilaRacha[], metaHoy = false): number {
  const hoy = hoyEnBase();
  const conHoy = metaHoy ? [...filas.filter((f) => f.fecha !== hoy), { fecha: hoy, meta_alcanzada: true, congelado: filas.find((f) => f.fecha === hoy)?.congelado ?? false }] : filas;
  return calcularRachaDiaria(conHoy, hoy);
}

// Consulta todo en paralelo. Las RPC de mensajes (0198/0224) y novedades (0065) se
// toleran ausentes: si la base todavía no tiene una migración, esa cifra queda en 0.
export async function cargarResumen(): Promise<Resumen | null> {
  const { data: sesion } = await supabase.auth.getSession();
  const user = sesion.session?.user;
  if (!user) return null;

  const [perfil, progreso, conversaciones, clan, novedades, cometas] = await Promise.all([
    supabase.from("profiles").select("display_name, puntos_total, nivel_cuenta, meta_xp_diaria").eq("id", user.id).single(),
    supabase.from("daily_progress").select("fecha, xp_ganado, meta_alcanzada, congelado").eq("user_id", user.id).order("fecha", { ascending: false }).limit(60),
    user.is_anonymous ? Promise.resolve({ data: [] }) : supabase.rpc("mis_conversaciones"),
    user.is_anonymous ? Promise.resolve({ data: [] }) : supabase.rpc("clan_chat_resumen"),
    supabase.rpc("anuncios_pendientes"),
    // Aparte: si la columna todavía no existe (0279 sin aplicar), no rompe el resto.
    supabase.from("profiles").select("cometas").eq("id", user.id).maybeSingle(),
  ]);
  if (perfil.error || !perfil.data) return null;

  const p = perfil.data as { display_name: string | null; puntos_total: number; nivel_cuenta: number; meta_xp_diaria: number };
  const dias = ((progreso.data as { fecha: string; xp_ganado: number; meta_alcanzada: boolean; congelado: boolean | null }[] | null) ?? []).map((d) => ({ ...d, congelado: !!d.congelado }));
  const hoy = hoyEnBase();
  const directos = ((conversaciones.data as { no_leidos: number }[] | null) ?? []).reduce((acc, c) => acc + Number(c.no_leidos ?? 0), 0);
  const deClan = ((clan.data as { out_no_leidos: number }[] | null) ?? []).reduce((acc, c) => acc + Number(c.out_no_leidos ?? 0), 0);

  const resumen: Resumen = {
    nombre: user.is_anonymous ? "Invitado" : p.display_name ?? "Jugador",
    racha: calcularRachaDiaria(dias, hoy),
    chispas: p.puntos_total ?? 0,
    cometas: cometas.error ? 0 : ((cometas.data as { cometas: number } | null)?.cometas ?? 0),
    nivelCuenta: p.nivel_cuenta ?? 1,
    xpHoy: dias.find((d) => d.fecha === hoy)?.xp_ganado ?? 0,
    metaDiaria: p.meta_xp_diaria ?? 100,
    mensajesSinLeer: directos + deClan,
    novedadesSinLeer: ((novedades.data as unknown[] | null) ?? []).length,
    actualizado: new Date().toISOString(),
  };
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(resumen));
  } catch {
    // Sin almacenamiento el widget usa lo último que tenga; no bloquea la app.
  }
  return resumen;
}

// Al cerrar sesión: el widget vuelve a mostrar "Entra a Prodigia".
export async function borrarResumen() {
  try {
    await AsyncStorage.removeItem(CLAVE);
  } catch {
    // Nada que hacer.
  }
}
