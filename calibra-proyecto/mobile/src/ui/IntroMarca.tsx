import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";

// Intro de marca al abrir la app (como "Made with Unity"): el video de Mamut S.A.S.
// (docs/mamut-intro-vertical-oscuro.mp4, 1080×1920, 4 s) es la "marca de agua"
// antes de que arranque Prodigia. Orden:
//   1. el video se reproduce COMPLETO, una sola vez;
//   2. se funde a negro (fade out) y queda 1 s de pantalla negra;
//   3. recién ahí aparece la pantalla de carga (`onNegro`) y el negro se desvanece.
// El tiempo de respaldo (por si el video no termina de avisar) se cuenta desde que
// el video EMPIEZA a reproducirse, no desde que se abrió la app: un arranque lento
// ya no corta la intro a la mitad.
// Para apagarla, INTRO_ACTIVA = false.
export const INTRO_ACTIVA = true;

const VIDEO = require("../../assets/intro/mamut-intro.mp4");
const DURACION_VIDEO_MS = 4000;
const FUNDIDO_MS = 500;
const NEGRO_MS = 1000;
const SALIDA_MS = 450;
const TOPE_SIN_VIDEO_MS = 12000; // si el video nunca arranca, no queda trabada

export default function IntroMarca({ onNegro, onTerminada }: { onNegro: () => void; onTerminada: () => void }) {
  const [video] = useState(() => new Animated.Value(1));
  const [capa] = useState(() => new Animated.Value(1));
  const cerrandoRef = useRef(false);
  const avisos = useRef({ onNegro, onTerminada });
  useEffect(() => {
    avisos.current = { onNegro, onTerminada };
  }, [onNegro, onTerminada]);

  const player = useVideoPlayer(VIDEO, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  function cerrar() {
    if (cerrandoRef.current) return;
    cerrandoRef.current = true;
    Animated.sequence([
      Animated.timing(video, { toValue: 0, duration: FUNDIDO_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.delay(NEGRO_MS),
    ]).start(() => {
      avisos.current.onNegro();
      Animated.timing(capa, { toValue: 0, duration: SALIDA_MS, delay: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => avisos.current.onTerminada());
    });
  }

  useEventListener(player, "playToEnd", cerrar);
  // Respaldo: arranca a contar cuando el video empieza a sonar/verse.
  const respaldoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEventListener(player, "playingChange", ({ isPlaying }) => {
    if (isPlaying && !respaldoRef.current) respaldoRef.current = setTimeout(cerrar, DURACION_VIDEO_MS + 1500);
  });
  useEffect(() => {
    const t = setTimeout(cerrar, TOPE_SIN_VIDEO_MS);
    return () => {
      clearTimeout(t);
      if (respaldoRef.current) clearTimeout(respaldoRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.pantalla, { opacity: capa }]} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: video }]}>
        <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} surfaceType="textureView" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pantalla: { backgroundColor: "#000", zIndex: 200, elevation: 200 },
});
