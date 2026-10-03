import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet } from "react-native";

// Intro de marca al abrir la app (como "Made with Unity"): la animación de Mamut
// S.A.S. (docs/mamut-intro-*, el mamut aparece, se dibuja el colmillo y sale el
// nombre). Va ANTES de la pantalla de carga y la tapa; mientras se ve, la app ya
// carga por detrás. El GIF dura 4 s: se cuenta desde que termina de cargar (para no
// cortarlo en un teléfono lento) y después se desvanece.
// Para apagarla, INTRO_ACTIVA = false.
export const INTRO_ACTIVA = true;

const INTRO = require("../../assets/intro/mamut-intro.gif");
const FONDO = "#0F1E2E"; // el mismo azul noche del GIF, a pantalla completa
const DURACION_GIF_MS = 4000;
const TOPE_MS = 7000; // si el GIF no carga, no queda trabada
const LADO = Math.min(Dimensions.get("window").width * 0.9, 460);

export default function IntroMarca({ onTerminada }: { onTerminada: () => void }) {
  const [salida] = useState(() => new Animated.Value(1));
  const terminadaRef = useRef(false);
  const onTerminadaRef = useRef(onTerminada);
  useEffect(() => {
    onTerminadaRef.current = onTerminada;
  }, [onTerminada]);

  function cerrar(demora: number) {
    if (terminadaRef.current) return;
    terminadaRef.current = true;
    Animated.timing(salida, { toValue: 0, duration: 450, delay: demora, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => onTerminadaRef.current());
  }

  useEffect(() => {
    const t = setTimeout(() => cerrar(0), TOPE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.pantalla, { opacity: salida }]} pointerEvents="none">
      <Image source={INTRO} style={{ width: LADO, height: LADO }} contentFit="contain" autoplay onLoad={() => cerrar(DURACION_GIF_MS - 300)} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pantalla: { backgroundColor: FONDO, alignItems: "center", justifyContent: "center", zIndex: 200, elevation: 200 },
});
