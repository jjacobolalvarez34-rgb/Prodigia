import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { getTranslations } from "next-intl/server";
import { esUuid, filaATarjeta, type TarjetaPartida } from "./compartir";
import type { TextosTarjeta } from "./TarjetaImagen";

// Lectura pública de una partida compartida (0300 partida_compartida): sin
// sesión, con la clave anónima, igual para cualquiera que abra el enlace. Si
// la migración no corrió o el id no existe, null.
export const leerPartidaPublica = cache(async (id: string): Promise<TarjetaPartida | null> => {
  if (!esUuid(id)) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !clave) return null;
  const supabase = createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.rpc("partida_compartida", { p_id: id });
  if (error) return null;
  return filaATarjeta((data as Record<string, unknown>[] | null)?.[0]);
});

export async function textosTarjeta(t: TarjetaPartida, locale: string): Promise<TextosTarjeta> {
  const tt = await getTranslations({ locale, namespace: "Partidas.tarjeta" });
  const tm = await getTranslations({ locale, namespace: "Mundos.nombres" });
  const etiqueta = t.tipo === "sprint" ? tt("partida") : t.clasificatorio === false ? tt("casual") : tt("ranked");
  const fecha = new Date(t.fecha ?? Date.now()).toLocaleDateString(locale === "en" ? "en-US" : "es-AR", { day: "numeric", month: "short", year: "numeric" });
  return {
    mundo: tm.has(t.mundo) ? tm(t.mundo) : t.mundo,
    etiqueta,
    resultado: t.resultado ? tt(t.resultado) : null,
    aciertos: tt("aciertos"),
    precision: tt("precision"),
    tiempoProm: tt("tiempoProm"),
    exp: tt("exp"),
    racha: tt("racha"),
    tu: tt("tu"),
    rival: tt("rival"),
    porPregunta: tt("porPregunta"),
    pie: tt("pie"),
    fecha,
  };
}
