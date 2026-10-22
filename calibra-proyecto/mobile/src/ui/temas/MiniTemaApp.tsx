import { memo } from "react";
import { View } from "react-native";
import type { TemaApp } from "@/lib/recompensas/temas";
import { COLOR_NOCHE } from "~/tema";

// Miniatura de un tema de la app: una pantallita con su fondo, dos tarjetas con su
// texto y su dorado, y el botón principal. Se dibuja con la paleta que de verdad se
// aplica (lo que ves es lo que te pones). Igual que MiniTemaApp de la web
// (src/components/recompensas/MiniTemaApp.tsx). Sin tema: Noche de Prodigia.
const CLASICA = { fondo: COLOR_NOCHE.bg, superficie: COLOR_NOCHE.surface1, borde: COLOR_NOCHE.border, texto: COLOR_NOCHE.texto, primario: COLOR_NOCHE.primario, logro: COLOR_NOCHE.logro };

export default memo(function MiniTemaApp({ tema, ancho, alto }: { tema: TemaApp | null; ancho: number; alto: number }) {
  const k = tema ? tema.paleta : CLASICA;
  const radio = tema ? Math.min(tema.radio, 6) : 5;
  const grosor = tema ? Math.max(1, tema.borde) : 1;
  const tarjeta = (h: number, anchoLinea: `${number}%`) => (
    <View style={{ height: h }}>
      {tema?.sombra === "dura" && <View style={{ position: "absolute", left: 2, top: 2, right: -2, bottom: -2, borderRadius: radio, backgroundColor: k.borde }} />}
      <View style={{ flex: 1, borderRadius: radio, backgroundColor: k.superficie, borderWidth: grosor, borderColor: k.borde, padding: 4, gap: 3, justifyContent: "center" }}>
        <View style={{ width: anchoLinea, height: 3, borderRadius: 2, backgroundColor: k.texto, opacity: 0.9 }} />
        <View style={{ width: "40%", height: 3, borderRadius: 2, backgroundColor: k.logro }} />
      </View>
    </View>
  );
  return (
    <View style={{ width: ancho, height: alto, borderRadius: 10, overflow: "hidden", backgroundColor: k.fondo, padding: 7, gap: 5, borderWidth: 1, borderColor: `${k.borde}55` }}>
      <View style={{ width: "48%", height: 5, borderRadius: 2, backgroundColor: k.texto, opacity: 0.9 }} />
      {tarjeta(alto * 0.24, "62%")}
      {tarjeta(alto * 0.17, "50%")}
      <View style={{ flex: 1 }} />
      <View style={{ height: alto * 0.12, borderRadius: radio, backgroundColor: k.primario }} />
    </View>
  );
});
