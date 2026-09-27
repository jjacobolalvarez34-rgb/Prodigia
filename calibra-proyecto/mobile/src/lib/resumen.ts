import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

// Foto chica del estado del jugador: la usan el inicio, el centro de avisos y los
// widgets de la pantalla de inicio del teléfono. Se guarda en el dispositivo para que
// el widget pueda dibujarse aunque no haya red.
export interface Resumen {
  nombre: string;
  racha: number;
  chispas: number;
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

// Consulta todo en paralelo. Las RPC de mensajes (0198/0224) y novedades (0065) se
// toleran ausentes: si la base todavía no tiene una migración, esa cifra queda en 0.
export async function cargarResumen(): Promise<Resumen | null> {
  const { data: sesion } = await supabase.auth.getSession();
  const user = sesion.session?.user;
  if (!user) return null;

  const [perfil, progreso, conversaciones, clan, novedades] = await Promise.all([
    supabase.from("profiles").select("display_name, streak_dias, puntos_total, nivel_cuenta, meta_xp_diaria").eq("id", user.id).single(),
    supabase.from("daily_progress").select("xp_ganado").eq("user_id", user.id).eq("fecha", hoyEnBase()).maybeSingle(),
    user.is_anonymous ? Promise.resolve({ data: [] }) : supabase.rpc("mis_conversaciones"),
    user.is_anonymous ? Promise.resolve({ data: [] }) : supabase.rpc("clan_chat_resumen"),
    supabase.rpc("anuncios_pendientes"),
  ]);
  if (perfil.error || !perfil.data) return null;

  const p = perfil.data as { display_name: string | null; streak_dias: number; puntos_total: number; nivel_cuenta: number; meta_xp_diaria: number };
  const directos = ((conversaciones.data as { no_leidos: number }[] | null) ?? []).reduce((acc, c) => acc + Number(c.no_leidos ?? 0), 0);
  const deClan = ((clan.data as { out_no_leidos: number }[] | null) ?? []).reduce((acc, c) => acc + Number(c.out_no_leidos ?? 0), 0);

  const resumen: Resumen = {
    nombre: user.is_anonymous ? "Invitado" : p.display_name ?? "Jugador",
    racha: p.streak_dias ?? 0,
    chispas: p.puntos_total ?? 0,
    nivelCuenta: p.nivel_cuenta ?? 1,
    xpHoy: (progreso.data as { xp_ganado: number } | null)?.xp_ganado ?? 0,
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
