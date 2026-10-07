import { useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { vibrar } from "~/lib/efectos";
import { color, conAlfa } from "~/tema";
import Boton3D from "./Boton3D";
import Texto from "./Texto";

// Recorrido corto por las 5 pestañas (PLAN_PRIMERA_VEZ_APP.md, paso 10): una sola
// vez por teléfono, también para quien ya jugaba en la web. Se puede saltar.
const PASOS = [
  { titulo: "Inicio", texto: "Tu día: el reto diario, las misiones y tu racha." },
  { titulo: "Mundos", texto: "Las 13 ciudades. Entra a una para practicar o aprender sus técnicas." },
  { titulo: "Competir", texto: "Rankeds, duelos en vivo con amigos y la liga de la semana." },
  { titulo: "Social", texto: "Amigos, clanes y chat." },
  { titulo: "Perfil", texto: "Tu placa, logros, tienda y estadísticas." },
];

export default function RecorridoPestanas({ onTerminar }: { onTerminar: () => void }) {
  const [i, setI] = useState(0);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ancho = (width - 12) / PASOS.length;
  const x = 6 + ancho * (i + 0.5);
  const abajo = Math.max(insets.bottom, 10) + 8;

  function siguiente() {
    vibrar.seleccion();
    if (i < PASOS.length - 1) setI(i + 1);
    else onTerminar();
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.fondo}>
      <Pressable onPress={onTerminar} style={[styles.saltar, { top: insets.top + 10 }]} hitSlop={12}>
        <Texto v="nota" c={color.texto2}>
          Saltar
        </Texto>
      </Pressable>
      <View style={[styles.foco, { left: x - 32, bottom: abajo - 6 }]} />
      <Animated.View key={i} entering={FadeInUp.duration(280)} style={[styles.tarjeta, { bottom: abajo + 74 }]}>
        <Texto v="micro" c={color.primarioClaro}>
          {i + 1} DE {PASOS.length}
        </Texto>
        <Texto v="h2">{PASOS[i].titulo}</Texto>
        <Texto v="cuerpo" c={color.texto2}>
          {PASOS[i].texto}
        </Texto>
        <Boton3D titulo={i < PASOS.length - 1 ? "Siguiente" : "¡Entendido!"} tamano="sm" onPress={siguiente} />
      </Animated.View>
      <View style={[styles.flecha, { left: x - 10, bottom: abajo + 62 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: conAlfa(color.bgHondo, 0.78), zIndex: 120, elevation: 120 },
  saltar: { position: "absolute", right: 20 },
  foco: { position: "absolute", width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: color.primarioNeon, backgroundColor: conAlfa(color.primario, 0.15), boxShadow: `0px 0px 24px ${color.primarioNeon}` },
  tarjeta: { position: "absolute", left: 16, right: 16, gap: 8, padding: 18, borderRadius: 20, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border },
  flecha: { position: "absolute", width: 20, height: 20, backgroundColor: color.surface2, transform: [{ rotate: "45deg" }], borderRightWidth: 1, borderBottomWidth: 1, borderColor: color.border },
});
