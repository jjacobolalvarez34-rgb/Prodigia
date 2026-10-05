import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { tono } from "@/lib/recompensas/catalogo";

// La cápsula de Chispas (NivelCuentaSubio.tsx de la web): dos mitades que se
// separan al abrirse (`abierta` de 0 a 1). Los colores cambian según el tipo de
// cápsula (diaria, de racha, de ciudad, de liga…); por defecto, los de la marca.
export default function Capsula({ abierta, colores = ["#7C5CFF", "#FFC53D"], tam = 110 }: { abierta: SharedValue<number>; colores?: [string, string]; tam?: number }) {
  const [a, b] = colores;
  const id = `${a}${b}`.replace(/#/g, "");
  const arriba = useAnimatedStyle(() => ({
    opacity: 1 - abierta.value,
    transform: [{ translateY: -60 * abierta.value }, { translateX: -18 * abierta.value }, { rotate: `${-28 * abierta.value}deg` }],
  }));
  const abajo = useAnimatedStyle(() => ({
    opacity: 1 - abierta.value,
    transform: [{ translateY: 60 * abierta.value }, { translateX: 18 * abierta.value }, { rotate: `${28 * abierta.value}deg` }],
  }));
  const alto = (tam * 150) / 110;
  return (
    <View style={{ width: tam, height: alto }}>
      <Animated.View style={[StyleSheet.absoluteFill, arriba]}>
        <Svg width={tam} height={alto} viewBox="0 0 100 140">
          <Defs>
            <LinearGradient id={`capA${id}`} x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0" stopColor={a} />
              <Stop offset="1" stopColor={tono(a, 0.35)} />
            </LinearGradient>
          </Defs>
          <Path d="M20 70 V50 A30 30 0 0 1 80 50 V70 Z" fill={`url(#capA${id})`} />
          <Path d="M30 44 A20 20 0 0 1 48 30" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={5} strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, abajo]}>
        <Svg width={tam} height={alto} viewBox="0 0 100 140">
          <Defs>
            <LinearGradient id={`capB${id}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={b} />
              <Stop offset="1" stopColor={tono(b, 0.3)} />
            </LinearGradient>
          </Defs>
          <Path d="M20 70 V90 A30 30 0 0 0 80 90 V70 Z" fill={`url(#capB${id})`} />
          <Path d="M17 69 H83 V73 H17 Z" fill="#2A1A00" fillOpacity={0.25} />
        </Svg>
      </Animated.View>
    </View>
  );
}
