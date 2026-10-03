import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text } from "react-native";
import { color, fuente } from "~/tema";
import Logo from "./Logo";

// Intro de marca al abrir la app (estilo "Made with Unity"): va ANTES de la
// pantalla de carga y tapa todo. Mientras se ve, la app ya carga por detrás.
//
// PROVISORIA: el diseño final lo define el dueño del producto. Hoy: fondo negro, el
// logo aparece, debajo el nombre, y todo se desvanece. Para cambiarla basta con
// reemplazar lo de adentro manteniendo la misma firma (`onTerminada` al final).
// Para apagarla, INTRO_ACTIVA = false.
export const INTRO_ACTIVA = true;
const DURACION_MS = 2200;

export default function IntroMarca({ onTerminada }: { onTerminada: () => void }) {
  const [t] = useState(() => new Animated.Value(0));
  const [salida] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.sequence([
      Animated.timing(t, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(DURACION_MS - 900 - 400),
      Animated.timing(salida, { toValue: 0, duration: 400, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => onTerminada());
  }, [t, salida, onTerminada]);

  const escala = t.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const textoOpacidad = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.pantalla, { opacity: salida }]} pointerEvents="none">
      <Animated.View style={{ opacity: t, transform: [{ scale: escala }] }}>
        <Logo tam={110} />
      </Animated.View>
      <Animated.View style={{ opacity: textoOpacidad }}>
        <Text style={styles.marca}>Prodigia</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pantalla: { backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: 14, zIndex: 200, elevation: 200 },
  marca: { color: color.texto, fontSize: 30, fontFamily: fuente.display, letterSpacing: 2 },
});
