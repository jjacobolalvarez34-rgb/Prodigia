import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { ESTELAS, estelaDe } from "@/lib/recompensas/catalogo";
import { useCosmeticos } from "~/lib/recompensas";
import { useLiviano } from "~/lib/rendimiento";
import { color, fuente } from "~/tema";
import { IconoLlama } from "./Iconos";
import Texto from "./Texto";

// La racha de preguntas con presencia (2026-10-17): desde 3 seguidas, en cada acierto
// aparece de fondo, en toda la pantalla, una llama enorme con el número de la racha,
// translúcida (se nota pero no tapa la pregunta). Salta al cambiar el número, arde un
// momento y se desvanece. En los hitos (5, 10, 15…) aparece más fuerte y dura más.
// La llama lleva los colores de la estela equipada.
const PICO = 0.16;
const PICO_HITO = 0.26;

export default function RachaDeFondo({ combo }: { combo: number }) {
  const { width, height } = useWindowDimensions();
  const liviano = useLiviano();
  const estela = estelaDe(useCosmeticos().estela);
  const conEstela = estela.base !== ESTELAS.clasica.base;
  const presencia = useSharedValue(0);
  const pop = useSharedValue(1);
  const vaiven = useSharedValue(0);
  const hito = combo >= 5 && combo % 5 === 0;
  const visible = combo >= 3;
  // El último número mostrado: al cortarse la racha se desvanece con él, no con un 0.
  const [numero, setNumero] = useState<number | null>(null);
  if (visible && combo !== numero) setNumero(combo);

  useEffect(() => {
    if (!visible) {
      presencia.set(withTiming(0, { duration: 250 }));
      return;
    }
    const pico = hito ? PICO_HITO : PICO;
    presencia.set(withSequence(withTiming(pico, { duration: 140, easing: Easing.out(Easing.quad) }), withDelay(hito ? 1000 : 650, withTiming(0, { duration: 750, easing: Easing.in(Easing.quad) }))));
    pop.set(withSequence(withTiming(hito ? 1.28 : 1.14, { duration: 130, easing: Easing.out(Easing.quad) }), withSpring(1, { damping: 9, stiffness: 190 })));
  }, [combo, visible, hito, presencia, pop]);

  useEffect(() => {
    if (!visible || liviano) return;
    vaiven.set(withRepeat(withSequence(withTiming(1, { duration: 280 }), withTiming(-1, { duration: 320 })), -1, true));
    return () => cancelAnimation(vaiven);
  }, [visible, liviano, vaiven]);

  const estiloCapa = useAnimatedStyle(() => ({ opacity: presencia.value }));
  const estiloLlama = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }, { scaleY: 1 + vaiven.value * 0.05 }, { scaleX: 1 - vaiven.value * 0.025 }, { skewX: `${vaiven.value * -2.5}deg` }] }));
  const estiloNumero = useAnimatedStyle(() => ({ transform: [{ scale: pop.value * pop.value }] }));

  const lado = Math.min(width * 0.95, height * 0.62);
  const tinta = conEstela ? (estela.arcoiris ? estela.punta : estela.base) : color.racha;
  if (numero === null) return null;
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.centro, estiloCapa]}>
      <Animated.View style={[{ width: lado, height: lado, transformOrigin: "bottom" }, estiloLlama]}>
        <IconoLlama tam={lado} estado="llamas" estela={estela} />
      </Animated.View>
      <View style={[StyleSheet.absoluteFill, styles.centro, { paddingTop: lado * 0.28 }]}>
        <Animated.View style={estiloNumero}>
          <Texto style={{ fontFamily: fuente.display, fontSize: lado * 0.36, lineHeight: lado * 0.42, color: "#FFFFFF", textShadowColor: tinta, textShadowRadius: 30 }}>{numero}</Texto>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  centro: { alignItems: "center", justifyContent: "center" },
});
