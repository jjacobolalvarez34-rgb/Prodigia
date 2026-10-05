import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";
import { particulasDe, type Efecto, type Particula } from "@/lib/recompensas/catalogo";
import { fuente } from "~/tema";
import Texto from "../Texto";

// Lo que estalla al acertar (efecto de acierto de la tienda, 0248): chispas,
// confeti, burbujas, notas, píxeles, estrellas o el glifo de una ciudad. Las
// partículas salen de particulasDe(), las mismas que dibuja la web.
function Pieza({ p, forma, t }: { p: Particula; forma: Efecto["forma"]; t: SharedValue<number> }) {
  const estilo = useAnimatedStyle(() => {
    const v = t.value;
    return {
      opacity: v < 0.75 ? 1 : (1 - v) * 4,
      transform: [{ translateX: p.dx * v }, { translateY: p.dy * v + (forma === "confeti" ? 14 * v * v : 0) }, { rotate: `${p.giro * v}deg` }, { scale: 0.4 + Math.sin(Math.min(1, v * 1.4) * Math.PI * 0.5) * 0.8 }],
    };
  });
  if (p.texto) {
    return (
      <Animated.View style={[styles.pieza, estilo]}>
        <Texto style={{ fontFamily: fuente.display, fontSize: forma === "glifo" ? 16 : 18, color: p.color }}>{p.texto}</Texto>
      </Animated.View>
    );
  }
  const forma2 =
    forma === "burbujas"
      ? { width: p.tam * 2, height: p.tam * 2, borderRadius: p.tam, borderWidth: 1.5, borderColor: p.color, backgroundColor: "rgba(255,255,255,0.12)" }
      : forma === "confeti"
        ? { width: p.tam, height: p.tam * 1.8, borderRadius: 1.5, backgroundColor: p.color }
        : forma === "pixeles"
          ? { width: p.tam, height: p.tam, backgroundColor: p.color }
          : { width: p.tam, height: p.tam, borderRadius: p.tam / 2, backgroundColor: p.color, boxShadow: `0px 0px 6px ${p.color}` };
  return <Animated.View style={[styles.pieza, forma2, estilo]} />;
}

export default function EfectoAcierto({ efecto, cantidad = 12 }: { efecto: Efecto; cantidad?: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) }));
  }, [t]);
  const piezas = particulasDe(efecto, cantidad, 70);
  return (
    <View pointerEvents="none" style={styles.capa}>
      {piezas.map((p, i) => (
        <Pieza key={i} p={p} forma={efecto.forma} t={t} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  capa: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  pieza: { position: "absolute" },
});
