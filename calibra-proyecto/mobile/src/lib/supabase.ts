import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const clave = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !clave) {
  throw new Error("Faltan EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY en mobile/.env.local");
}

// Mismo proyecto de Supabase que la web: la cuenta, el progreso y las Chispas son
// los mismos. La app habla directo con la base (RLS + RPC security definer, que
// validan auth.uid() por su cuenta), sin pasar por las rutas /api de Next.
export const supabase = createClient(url, clave, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// En nativo el token solo se refresca mientras la app está en primer plano.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (estado) => {
    if (estado === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

// Los errores de las RPC llegan con el texto del `raise exception` de Postgres; se
// muestran tal cual (ya están en español), con un respaldo si no hay texto.
export function mensajeError(e: unknown): string {
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  return "Algo salió mal. Prueba de nuevo.";
}
