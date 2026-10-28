import { useEffect, useSyncExternalStore } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { alineacionEnCurso } from "@/lib/ciudades/cicloDia";
import { SOLES } from "@/lib/recompensas/alineacion";
import { relojEventos } from "~/lib/relojEventos";
import { useAnimacionActiva, useLiviano } from "~/lib/rendimiento";

// Durante la Gran Alineación, fuera de las partidas (igual que la web): la app se tiñe
// de amanecer. Resplandor dorado arriba y en el horizonte, y motas de luz de los
// colores de las 15 ciudades que suben despacio. Sutil: se nota sin tapar nada.
function Mota({ i, color, alto, ancho }: { i: number; color: string; alto: number; ancho: number }) {
  const t = useSharedValue(0);
  const activa = useAnimacionActiva();
  const duracion = 9000 + ((i * 7) % 8) * 1000;
  useEffect(() => {
    if (!activa) return;
    t.set(withDelay(((i * 13) % 10) * 900, withRepeat(withTiming(1, { duration: duracion, easing: Easing.linear }), -1)));
    return () => cancelAnimation(t);
  }, [activa, t, i, duracion]);
  const estilo = useAnimatedStyle(() => ({
    opacity: t.value < 0.12 ? t.value / 0.12 : t.value > 0.8 ? (1 - t.value) / 0.2 : 0.8,
    transform: [{ translateY: -t.value * alto * 0.85 }],
  }));
  const tam = 2 + (i % 3);
  return <Animated.View style={[{ position: "absolute", bottom: 0, left: ancho * (0.04 + ((i * 61) % 92) / 100), width: tam, height: tam, borderRadius: tam, backgroundColor: color, boxShadow: `0px 0px 8px ${color}` }, estilo]} />;
}

const enCurso = () => alineacionEnCurso(Date.now()) !== null;

export default function CapaAlineacion() {
  const { width, height } = useWindowDimensions();
  const liviano = useLiviano();
  // Se enciende y se apaga en el instante exacto (relojEventos), no cada tantos segundos.
  const activa = useSyncExternalStore(relojEventos.suscribir, enCurso, enCurso);
  if (!activa) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={["rgba(242,193,78,0.16)", "transparent"]} style={styles.arriba} />
      <LinearGradient colors={["transparent", "rgba(232,163,23,0.12)"]} style={styles.abajo} />
      {!liviano && SOLES.map((s, i) => <Mota key={s.slug} i={i} color={s.color} alto={height} ancho={width} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  arriba: { position: "absolute", left: 0, right: 0, top: 0, height: 180 },
  abajo: { position: "absolute", left: 0, right: 0, bottom: 0, height: 150 },
});
