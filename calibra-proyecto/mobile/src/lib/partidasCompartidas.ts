// Compartir el resultado de una partida y ver el detalle de un duelo del
// historial (2026-10-21). La lógica (estadísticas, tarjeta, detalle) es la de la
// web (@/lib/partidas); acá solo las llamadas a la base y la captura de la tarjeta.
import { ImageFormat, makeImageFromView } from "@shopify/react-native-skia";
import * as FileSystem from "expo-file-system/legacy";
import type { RefObject } from "react";
import { Platform, Share, type View } from "react-native";
import { compartirImagenNativo } from "widgets-prodigia";
import { aciertosTexto, esFuncionFaltante, esUuid, rutaPartidaPublica, type OrigenCompartir, type TarjetaPartida } from "@/lib/partidas/compartir";
import {
  armarDetalleDuelo,
  COLUMNAS_DUELO_DETALLE,
  COLUMNAS_RESULTADO_DETALLE,
  type DetalleDuelo,
  type FilaDueloDetalle,
  type FilaResultadoDuelo,
} from "@/lib/partidas/detalleDuelo";
import { MUNDO_POR_SLUG, type MundoSlug } from "~/tema";
import { ORIGEN_WEB } from "./entorno";
import { supabase } from "./supabase";
import { textosDe } from "./textosWeb";

const t = textosDe("Partidas");

// Enlace público (/partida/<id> en la web). Null si la migración 0300 no corrió
// o algo falló: entonces se comparte solo la imagen.
export async function crearEnlacePartida(origen: OrigenCompartir | null): Promise<string | null> {
  if (!origen) return null;
  const { data, error } =
    "duelId" in origen
      ? await supabase.rpc("compartir_duelo", { p_duel_id: origen.duelId })
      : await supabase.rpc("compartir_sprint", { p_mundo: origen.mundo, p_cantidad: origen.cantidad, p_desde: origen.desde });
  if (error) {
    if (!esFuncionFaltante(error)) console.warn("compartir partida:", error.message);
    return null;
  }
  return esUuid(data) ? `${ORIGEN_WEB}${rutaPartidaPublica(data, "es")}` : null;
}

// Mismo detalle que /rankeds/duelo/<id> de la web: duels + duel_results (RLS de
// participantes) + el nombre del rival (obtener_duelo). No necesita migraciones.
export async function cargarDetalleDuelo(duelId: string, userId: string): Promise<DetalleDuelo | null> {
  if (!esUuid(duelId)) return null;
  const [{ data: duelo }, { data: resultados }, { data: info }] = await Promise.all([
    supabase.from("duels").select(COLUMNAS_DUELO_DETALLE).eq("id", duelId).maybeSingle(),
    supabase.from("duel_results").select(COLUMNAS_RESULTADO_DETALLE).eq("duel_id", duelId),
    supabase.rpc("obtener_duelo", { p_duel_id: duelId }),
  ]);
  const fila = (info as { rival_nombre: string | null; rival_es_bot: boolean | null }[] | null)?.[0];
  return armarDetalleDuelo(duelo as FilaDueloDetalle | null, resultados as FilaResultadoDuelo[] | null, userId, fila ? { nombre: fila.rival_nombre, esBot: fila.rival_es_bot === true } : null);
}

export function nombreMundo(slug: string): string {
  return MUNDO_POR_SLUG[slug as MundoSlug]?.nombre ?? slug;
}

// El texto que acompaña la imagen (los mismos de la web, messages/es.json).
export function mensajeCompartir(tarjeta: TarjetaPartida, enlace: string | null): string {
  const mundo = nombreMundo(tarjeta.mundo);
  const base =
    tarjeta.tipo === "duelo" && tarjeta.rival
      ? t(`mensaje.${tarjeta.resultado ?? "pendiente"}`, {
          rival: tarjeta.rival.nombre ?? t("tarjeta.rival"),
          mundo,
          mio: tarjeta.yo.puntaje ?? 0,
          suyo: tarjeta.rival.puntaje ?? 0,
        })
      : t("mensaje.sprint", { aciertos: aciertosTexto(tarjeta.yo), mundo });
  return enlace ? `${base} ${enlace}` : base;
}

// Captura la tarjeta (la vista de `ref`) y la comparte con el menú de Android.
// En un APK sin la función nativa (anterior a 2026-10-21) o si la captura
// falla, comparte el texto (con el enlace, si hay).
export async function compartirTarjeta(ref: RefObject<View | null>, texto: string): Promise<"imagen" | "texto"> {
  if (Platform.OS === "android") {
    try {
      const imagen = await makeImageFromView(ref);
      if (imagen) {
        const ruta = `${FileSystem.cacheDirectory}prodigia-partida-${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(ruta, imagen.encodeToBase64(ImageFormat.PNG, 100), { encoding: FileSystem.EncodingType.Base64 });
        const uri = await FileSystem.getContentUriAsync(ruta);
        if (compartirImagenNativo(uri, texto, t("compartirResultado"))) return "imagen";
      }
    } catch (e) {
      console.warn("compartir imagen:", e);
    }
  }
  await Share.share({ message: texto });
  return "texto";
}
