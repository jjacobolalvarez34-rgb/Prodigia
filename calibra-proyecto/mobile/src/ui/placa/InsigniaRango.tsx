import { useEffect } from "react";
import { View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useAnimacionActiva } from "~/lib/rendimiento";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { rangoDeElo } from "~/lib/placa";
import { aclarar, fuente, oscurecer } from "~/tema";
import Texto from "../Texto";

// Insignia hexagonal del rango (maqueta 8, "Competir"): degradé del color del rango
// y un brillo que late. Prodigio usa el degradé violeta → dorado.

interface Props {
  elo: number;
  tam?: number;
  animar?: boolean;
  conTexto?: boolean;
}

export default function InsigniaRango({ elo, tam = 46, animar = true, conTexto = true }: Props) {
  const rango = rangoDeElo(elo);
  const [c1, c2] = rango.degradado ?? [aclarar(rango.colorHex, 0.75), rango.colorHex];
  const c3 = oscurecer(rango.degradado ? rango.degradado[1] : rango.colorHex, 0.5);
  const pulso = useSharedValue(0);
  const activa = useAnimacionActiva();
  useEffect(() => {
    if (!animar || !activa) {
      cancelAnimation(pulso);
      return;
    }
    pulso.set(withRepeat(withSequence(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 1500 })), -1));
    return () => cancelAnimation(pulso);
  }, [animar, activa, pulso]);
  const halo = useAnimatedStyle(() => ({ opacity: 0.25 + pulso.value * 0.55, transform: [{ scale: 1 + pulso.value * 0.08 }] }));
  const id = `ins${rango.slug}${tam}`;
  return (
    <View style={{ width: tam, height: tam, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[{ position: "absolute", width: tam * 0.8, height: tam * 0.8, borderRadius: tam, boxShadow: `0px 0px ${tam * 0.4}px ${rango.colorHex}` }, halo]} />
      <Svg width={tam} height={tam} viewBox="0 0 100 100" style={{ position: "absolute" }}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0.6" y2="1">
            <Stop offset="0" stopColor={c1} />
            <Stop offset="0.5" stopColor={c2} />
            <Stop offset="1" stopColor={c3} />
          </LinearGradient>
        </Defs>
        <Path d="M50 2 L93 26 L93 74 L50 98 L7 74 L7 26 Z" fill={`url(#${id})`} />
        <Path d="M50 12 L84 31 L84 69 L50 88 L16 69 L16 31 Z" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
      </Svg>
      {conTexto && (
        <Texto style={{ fontFamily: fuente.display, fontSize: Math.max(8, tam * 0.15), color: oscurecer(rango.colorHex, 0.25), letterSpacing: 0.6 }}>
          {rango.nombre.toUpperCase()}
        </Texto>
      )}
    </View>
  );
}
