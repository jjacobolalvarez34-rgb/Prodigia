import { useEffect } from "react";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { oscurecer } from "~/tema";

// Estandarte del clan: banderín con muesca que ondea (maqueta 10).
export default function Bandera({ c, ancho = 22, alto = 34, quieta }: { c: string; ancho?: number; alto?: number; quieta?: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (quieta) return;
    t.set(withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [t, quieta]);
  const estilo = useAnimatedStyle(() => ({ transform: [{ skewY: `${t.value * 5}deg` }, { scaleX: 1 - t.value * 0.06 }] }));
  return (
    <Animated.View style={[{ width: ancho, height: alto, transformOrigin: "top" }, estilo]}>
      <Svg width={ancho} height={alto} viewBox="0 0 22 34" style={{ position: "absolute" }}>
        <Path d="M0 0H22V34L11 27L0 34Z" fill={c} />
        <Path d="M0 0H22V9H0Z" fill="#FFFFFF" opacity={0.18} />
      </Svg>
      <Svg width={ancho} height={alto} viewBox="0 0 22 34" style={{ position: "absolute" }}>
        <Path d="M0 0H22V34L11 27L0 34Z" fill="none" stroke={oscurecer(c, 0.6)} strokeWidth={1.2} />
      </Svg>
    </Animated.View>
  );
}
