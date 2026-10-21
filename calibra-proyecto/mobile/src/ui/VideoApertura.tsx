import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Easing, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { videoAperturaActual } from "@/lib/temas/videosApertura";
import { leerAjustes } from "~/lib/ajustes";
import { marcarVideoVisto, usePedidoVideo, videoVisto } from "~/lib/videoApertura";
import Texto from "./Texto";

// Video de apertura de los eventos (Gran Alineación, Halloween…; cuál toca lo dice
// videoAperturaActual). Si la app se abre durante el evento, el video sale en lugar
// del menú; si el evento empieza con la app abierta (fuera de una partida), entra con
// un fundido. Una vez por edición; se puede saltar desde el primer segundo. Los videos
// terminan con ~5 s de la imagen final animada, y desde ahí se funden con la app.
// Para sumar el de otra fiesta: su archivo acá y en VIDEO_DE_TEMA.
const VIDEOS: Record<string, number> = {
  "gran-alineacion": require("../../assets/videos/gran-alineacion.mp4"),
  halloween: require("../../assets/videos/halloween.mp4"),
  navidad: require("../../assets/videos/navidad.mp4"),
  "viernes-estelar": require("../../assets/videos/viernes-estelar.mp4"),
};
const ENTRADA_MS = 700;
const SALIDA_MS = 650;
const TOPE_MS = 24_000; // si el video no avisa que terminó, no queda trabado

// Solo la primera revisión de la sesión (al abrir la app) sale sin fundido.
let primeraRevision = true;

function Reproductor({ fuente, fundido, onFin }: { fuente: number; fundido: boolean; onFin: () => void }) {
  const insets = useSafeAreaInsets();
  const [opacidad] = useState(() => new Animated.Value(fundido ? 0 : 1));
  const [saltable, setSaltable] = useState(false);
  const cerrandoRef = useRef(false);
  const finRef = useRef(onFin);
  useEffect(() => {
    finRef.current = onFin;
  }, [onFin]);

  const player = useVideoPlayer(fuente, (p) => {
    p.loop = false;
    p.muted = !leerAjustes().sonido;
    p.play();
  });

  function cerrar() {
    if (cerrandoRef.current) return;
    cerrandoRef.current = true;
    Animated.timing(opacidad, { toValue: 0, duration: SALIDA_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start(() => finRef.current());
  }

  useEventListener(player, "playToEnd", cerrar);
  useEffect(() => {
    if (fundido) Animated.timing(opacidad, { toValue: 1, duration: ENTRADA_MS, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    const s = setTimeout(() => setSaltable(true), 1000);
    const tope = setTimeout(cerrar, TOPE_MS);
    const atras = BackHandler.addEventListener("hardwareBackPress", () => {
      cerrar();
      return true;
    });
    return () => {
      clearTimeout(s);
      clearTimeout(tope);
      atras.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.pantalla, { opacity: opacidad }]}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} surfaceType="textureView" />
      {saltable && (
        <Pressable onPress={cerrar} hitSlop={12} style={[styles.saltar, { top: insets.top + 14 }]} accessibilityRole="button" accessibilityLabel="Saltar el video">
          <Texto v="nota" c="rgba(246,239,226,0.85)">
            Saltar
          </Texto>
        </Pressable>
      )}
    </Animated.View>
  );
}

export default function VideoApertura() {
  const [video, setVideo] = useState<{ clave: string | null; archivo: string; fundido: boolean; id: number } | null>(null);
  const pedido = usePedidoVideo();
  const pedidoVisto = useRef(pedido.n);

  useEffect(() => {
    let vivo = true;
    function revisar() {
      const instantaneo = primeraRevision;
      primeraRevision = false;
      const v = videoAperturaActual();
      if (!v || !VIDEOS[v.archivo]) return;
      videoVisto(v.clave).then((visto) => {
        if (vivo && !visto) setVideo((actual) => actual ?? { clave: v.clave, archivo: v.archivo, fundido: !instantaneo, id: Date.now() });
      });
    }
    revisar();
    const id = setInterval(revisar, 30_000);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, []);

  // «Ver el video» desde un cartel (no cuenta como visto).
  useEffect(() => {
    if (pedido.n === pedidoVisto.current) return;
    pedidoVisto.current = pedido.n;
    const archivo = pedido.archivo ?? videoAperturaActual()?.archivo;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (archivo && VIDEOS[archivo]) setVideo({ clave: null, archivo, fundido: true, id: Date.now() });
  }, [pedido]);

  if (!video) return null;
  return (
    <Reproductor
      key={video.id}
      fuente={VIDEOS[video.archivo]}
      fundido={video.fundido}
      onFin={() => {
        if (video.clave) marcarVideoVisto(video.clave);
        setVideo(null);
      }}
    />
  );
}

const styles = StyleSheet.create({
  pantalla: { backgroundColor: "#000", zIndex: 150, elevation: 150 },
  saltar: { position: "absolute", right: 16, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(8,8,14,0.55)", borderWidth: 1, borderColor: "rgba(246,239,226,0.22)" },
});
