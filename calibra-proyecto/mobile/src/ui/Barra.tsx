import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { aclarar, color, oscurecer } from "~/tema";

// Barra de progreso que se llena con una curva suave (y vuelve a animarse cada vez
// que cambia el valor), con un destello que la recorre de vez en cuando.
interface Props {
  // 0..1
  valor: number;
  acento?: string;
  colores?: [string, string];
  alto?: number;
  demora?: number;
  duracion?: number;
  fondo?: string;
  estilo?: StyleProp<ViewStyle>;
  sinDestello?: boolean;
}

export default function Barra({ valor, acento = color.primarioBase, colores, alto = 8, demora = 0, duracion = 900, fondo = color.surface3, estilo, sinDestello }: Props) {
  const [ancho, setAncho] = useState(0);
  const progreso = useSharedValue(0);
  const destello = useSharedValue(-0.3);
  const objetivo = Math.max(0, Math.min(1, Number.isFinite(valor) ? valor : 0));

  useEffect(() => {
    progreso.set(withDelay(demora, withTiming(objetivo, { duration: duracion, easing: Easing.out(Easing.cubic) })));
  }, [objetivo, demora, duracion, progreso]);

  useEffect(() => {
    if (sinDestello) return;
    destello.set(withRepeat(withSequence(withTiming(-0.3, { duration: 0 }), withDelay(2200, withTiming(1.3, { duration: 1100 }))), -1));
  }, [sinDestello, destello]);

  const estiloRelleno = useAnimatedStyle(() => ({ width: progreso.value * ancho }));
  const estiloDestello = useAnimatedStyle(() => ({ transform: [{ translateX: destello.value * ancho }] }));
  const [c1, c2] = colores ?? [oscurecer(acento, 0.95), aclarar(acento, 0.3)];

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setAncho(e.nativeEvent.layout.width)}
      style={[{ height: alto, borderRadius: alto, backgroundColor: fondo, overflow: "hidden" }, estilo]}
    >
      <Animated.View style={[{ height: "100%", borderRadius: alto, overflow: "hidden" }, estiloRelleno]}>
        <LinearGradient colors={[c1, c2]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        {!sinDestello && (
          <Animated.View style={[styles.destello, estiloDestello]}>
            <LinearGradient
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.5)", "rgba(255,255,255,0)"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  destello: { position: "absolute", top: 0, bottom: 0, width: 40 },
});
