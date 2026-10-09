import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useJugador } from "~/lib/jugador";
import { IconoCheck } from "~/ui/Iconos";
import { PantallaApilada } from "~/ui/Pantalla";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, fuente } from "~/tema";

// Prodigia Pro (03-PANTALLAS §4.13). La compra llega con Google Play Billing; por
// ahora la pantalla muestra qué incluye y si ya lo tienes.
const BENEFICIOS = [
  "Los 15 mundos encendidos, sin gastar Chispas",
  "Clases: lecciones paso a paso en cada mundo",
  "Estadísticas avanzadas de tu progreso",
  "Fondo Prodigio y animación Prisma para tu Placa",
  "Apoyas que Prodigia siga creciendo",
];

export default function Pro() {
  const { plan } = useJugador();
  const brilla = useSharedValue(0);
  useEffect(() => {
    brilla.set(withRepeat(withSequence(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 1600 })), -1));
  }, [brilla]);
  const halo = useAnimatedStyle(() => ({ opacity: 0.35 + brilla.value * 0.5, transform: [{ scale: 0.95 + brilla.value * 0.1 }] }));

  return (
    <PantallaApilada titulo="Prodigia Pro">
      <View style={styles.heroe}>
        <Animated.View style={[styles.halo, halo]} />
        <LinearGradient colors={[color.primario, "#B07CFF", color.logro]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sello}>
          <Texto style={{ fontFamily: fuente.display, fontSize: 30, color: "#fff", letterSpacing: 2 }}>PRO</Texto>
        </LinearGradient>
      </View>
      <Texto v="display" centro>
        {plan === "pro" ? "Ya eres Pro ✦" : "Todo Prodigia, sin límites"}
      </Texto>
      <Tarjeta acento={color.logro} brillo={0.2}>
        {BENEFICIOS.map((b, i) => (
          <Animated.View key={b} entering={FadeInDown.delay(150 + i * 80)} style={styles.beneficio}>
            <View style={styles.check}>
              <IconoCheck tam={14} c="#1F1400" />
            </View>
            <Texto v="fuerte" style={{ flex: 1 }}>
              {b}
            </Texto>
          </Animated.View>
        ))}
      </Tarjeta>
      <Texto v="nota" centro>
        {plan === "pro" ? "Gracias por apoyar Prodigia. Tu plan se comparte con la web." : "Muy pronto vas a poder hacerte Pro desde la app, con Google Play."}
      </Texto>
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  heroe: { height: 150, alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", width: 110, height: 110, borderRadius: 55, boxShadow: `0px 0px 60px ${color.logro}` },
  sello: { width: 110, height: 110, borderRadius: 30, alignItems: "center", justifyContent: "center", transform: [{ rotate: "-8deg" }] },
  beneficio: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: color.logro, alignItems: "center", justifyContent: "center" },
});
