import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";

// Intro de marca al abrir la app (como "Made with Unity"): el video de Mamut S.A.S.
// (docs/mamut-intro-vertical-oscuro.mp4, 1080×1920, 4 s): el mamut aparece, se dibuja
// el colmillo y sale el nombre. Se reproduce UNA vez, a pantalla completa, y al
// terminar se desvanece; recién ahí empieza la pantalla de carga de Prodigia (la app
// ya viene cargando por detrás).
// Para apagarla, INTRO_ACTIVA = false.
export const INTRO_ACTIVA = true;

const VIDEO = require("../../assets/intro/mamut-intro.mp4");
const FONDO = "#0F1E2E"; // el azul noche del video
const TOPE_MS = 7000; // si el video no arranca, no queda trabada

export default function IntroMarca({ onTerminada }: { onTerminada: () => void }) {
  const [salida] = useState(() => new Animated.Value(1));
  const terminadaRef = useRef(false);
  const onTerminadaRef = useRef(onTerminada);
  useEffect(() => {
    onTerminadaRef.current = onTerminada;
  }, [onTerminada]);

  const player = useVideoPlayer(VIDEO, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  function cerrar() {
    if (terminadaRef.current) return;
    terminadaRef.current = true;
    Animated.timing(salida, { toValue: 0, duration: 450, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => onTerminadaRef.current());
  }

  useEventListener(player, "playToEnd", cerrar);
  useEffect(() => {
    const t = setTimeout(cerrar, TOPE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.pantalla, { opacity: salida }]} pointerEvents="none">
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} surfaceType="textureView" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pantalla: { backgroundColor: FONDO, zIndex: 200, elevation: 200 },
});
