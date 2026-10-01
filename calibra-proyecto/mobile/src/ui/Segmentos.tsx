import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { vibrar } from "~/lib/efectos";
import { color, fuente } from "~/tema";
import Texto from "./Texto";

// Pestañas internas (Rankeds · Casual · Liga · Semanal; Inicio · Amigos · Mensajes ·
// Clan): el fondo de la elegida se desliza con resorte.
interface Props<T extends string> {
  opciones: { id: T; titulo: string; insignia?: number }[];
  valor: T;
  onCambio: (id: T) => void;
}

export default function Segmentos<T extends string>({ opciones, valor, onCambio }: Props<T>) {
  const [ancho, setAncho] = useState(0);
  const indice = Math.max(0, opciones.findIndex((o) => o.id === valor));
  const anchoOpcion = ancho / opciones.length;
  const x = useSharedValue(0);
  useEffect(() => {
    if (anchoOpcion > 0) x.set(withSpring(indice * anchoOpcion, { damping: 18, stiffness: 220 }));
  }, [indice, anchoOpcion, x]);
  const estilo = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View style={styles.caja} onLayout={(e: LayoutChangeEvent) => setAncho(e.nativeEvent.layout.width - 8)}>
      {anchoOpcion > 0 && <Animated.View style={[styles.activo, { width: anchoOpcion }, estilo]} />}
      {opciones.map((o) => (
        <Pressable
          key={o.id}
          style={styles.opcion}
          onPress={() => {
            if (o.id === valor) return;
            vibrar.seleccion();
            onCambio(o.id);
          }}
        >
          <Texto style={[styles.texto, { color: o.id === valor ? color.texto : color.texto2 }]} numberOfLines={1}>
            {o.titulo}
          </Texto>
          {o.insignia ? (
            <View style={styles.insignia}>
              <Texto style={styles.insigniaTexto}>{o.insignia > 9 ? "9+" : o.insignia}</Texto>
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { flexDirection: "row", backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, borderRadius: 999, padding: 4 },
  activo: { position: "absolute", top: 4, bottom: 4, left: 4, borderRadius: 999, backgroundColor: color.surface3 },
  opcion: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 7 },
  texto: { fontFamily: fuente.cuerpoFuerte, fontSize: 12.5 },
  insignia: { minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4, backgroundColor: color.primario, alignItems: "center", justifyContent: "center" },
  insigniaTexto: { fontFamily: fuente.mono, fontSize: 9, color: "#fff" },
});
