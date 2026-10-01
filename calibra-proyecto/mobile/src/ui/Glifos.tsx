import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming, type SharedValue } from "react-native-reanimated";
import { useAnimacionActiva, useLiviano } from "~/lib/rendimiento";
import { fuente } from "~/tema";

// Fondo vivo de cada mundo (02-SISTEMA-VISUAL.md §6): los glifos del mundo flotan
// muy lento con poca opacidad. `pulso` (0..1) los hace brillar un instante al
// acertar; `velocidad` > 1 los acelera con el combo.

interface GlifoProps {
  texto: string;
  x: number;
  y: number;
  tam: number;
  c: string;
  demora: number;
  pulso?: SharedValue<number>;
  opacidad: number;
}

function Glifo({ texto, x, y, tam, c, demora, pulso, opacidad, activa }: GlifoProps & { activa: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!activa) {
      cancelAnimation(t);
      return;
    }
    t.set(withDelay(demora, withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true)));
    return () => cancelAnimation(t);
  }, [t, demora, activa]);
  const estilo = useAnimatedStyle(() => {
    const brillo = pulso ? pulso.value : 0;
    return {
      opacity: opacidad + brillo * 0.35,
      transform: [{ translateY: -16 * t.value }, { rotate: `${8 * t.value}deg` }, { scale: 1 + brillo * 0.15 }],
    };
  });
  return (
    <Animated.Text style={[styles.glifo, { left: `${x}%`, top: `${y}%`, fontSize: tam, color: c }, estilo]}>{texto}</Animated.Text>
  );
}

interface Props {
  glifos: string[];
  acento: string;
  cantidad?: number;
  pulso?: SharedValue<number>;
  opacidad?: number;
}

export default function Glifos({ glifos, acento, cantidad: pedidos = 9, pulso, opacidad = 0.08 }: Props) {
  const activa = useAnimacionActiva();
  const liviano = useLiviano();
  const cantidad = liviano ? Math.ceil(pedidos / 2) : pedidos;
  const items = useMemo(() => {
    const r = (i: number, k: number) => {
      const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: cantidad }, (_, i) => ({
      texto: glifos[i % glifos.length],
      x: 4 + r(i, 1) * 82,
      y: 4 + r(i, 2) * 86,
      tam: 22 + Math.round(r(i, 3) * 26),
      demora: Math.round(r(i, 4) * 5000),
    }));
  }, [glifos, cantidad]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((g, i) => (
        <Glifo key={i} {...g} c={acento} pulso={pulso} opacidad={opacidad} activa={activa} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  glifo: { position: "absolute", fontFamily: fuente.mono },
});
