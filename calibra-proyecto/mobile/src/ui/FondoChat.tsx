import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { svgFondoChat } from "@/lib/mensajes/dibujoFondosChat";
import type { FondoChat as Fondo } from "@/lib/mensajes/fondosChat";

// El fondo de una conversación (0262): la misma escena ilustrada que la web
// (lib/mensajes/dibujoFondosChat.ts), armada para el tamaño real de la caja. Mientras
// se mide se ve el degradé de base.
export default function FondoChat({ fondo, radio = 0 }: { fondo: Fondo; radio?: number }) {
  const [tam, setTam] = useState<{ ancho: number; alto: number } | null>(null);
  // Redondeado a 20 px: abrir el teclado o rotar no redibuja a cada píxel.
  const xml = useMemo(() => (tam ? svgFondoChat(fondo.slug, tam.ancho, tam.alto, `fc${radio}`) : null), [fondo.slug, tam, radio]);
  return (
    <View
      style={[StyleSheet.absoluteFill, { borderRadius: radio, overflow: "hidden" }]}
      pointerEvents="none"
      onLayout={(e) => {
        const ancho = Math.max(20, Math.round(e.nativeEvent.layout.width / 20) * 20);
        const alto = Math.max(20, Math.round(e.nativeEvent.layout.height / 20) * 20);
        setTam((t) => (t && t.ancho === ancho && t.alto === alto ? t : { ancho, alto }));
      }}
    >
      <LinearGradient colors={fondo.colores} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={StyleSheet.absoluteFill} />
      {xml && <SvgXml xml={xml} width="100%" height="100%" style={StyleSheet.absoluteFill} />}
    </View>
  );
}
