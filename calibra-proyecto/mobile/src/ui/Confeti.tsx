import { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";

// Confeti de celebración (resultado, subir de nivel, ganar un duelo).
const COLORES = ["#9B85FF", "#FFB627", "#3DDC97", "#FF8A3D", "#E36BF2", "#4FE0F5", "#FFFFFF"];

function Pieza({ x, demora, c, ancho, alto, giro, duracion, repetir }: { x: number; demora: number; c: string; ancho: number; alto: number; giro: number; duracion: number; repetir: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    const caida = withTiming(1, { duration: duracion, easing: Easing.linear });
    t.set(withDelay(demora, repetir ? withRepeat(caida, -1) : caida));
  }, [t, demora, duracion, repetir]);
  const estilo = useAnimatedStyle(() => ({
    opacity: t.value > 0.92 ? (1 - t.value) * 12 : 1,
    transform: [
      { translateY: -20 + t.value * (alto + 40) },
      { translateX: Math.sin(t.value * Math.PI * 4) * 18 },
      { rotate: `${t.value * giro}deg` },
      { rotateY: `${t.value * 720}deg` },
    ],
  }));
  return <Animated.View style={[styles.pieza, { left: x, width: ancho, height: ancho * 1.6, backgroundColor: c }, estilo]} />;
}

export default function Confeti({ cantidad = 36, repetir = false }: { cantidad?: number; repetir?: boolean }) {
  const { width, height } = useWindowDimensions();
  const piezas = useMemo(() => {
    // Pseudoaleatorio puro (el render no puede tener efectos).
    const r = (i: number, k: number) => {
      const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: cantidad }, (_, i) => ({
      x: r(i, 1) * width,
      demora: r(i, 2) * 900,
      c: COLORES[i % COLORES.length],
      ancho: 5 + r(i, 3) * 5,
      giro: 360 + r(i, 4) * 540,
      duracion: 2400 + r(i, 5) * 1600,
    }));
  }, [cantidad, width]);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {piezas.map((p, i) => (
        <Pieza key={i} {...p} alto={height} repetir={repetir} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pieza: { position: "absolute", top: 0, borderRadius: 2 },
});
