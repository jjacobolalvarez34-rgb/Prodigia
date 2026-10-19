import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Easing, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { momentoAlineacion } from "@/lib/recompensas/alineacion";
import { leerAjustes } from "~/lib/ajustes";
import { marcarVideoVisto, usePedidosVideo, videoVisto } from "~/lib/videoAlineacion";
import Texto from "../Texto";

// Video de apertura de la Gran Alineación (aprobado el 2026-10-18; fuente en
// prodigia-marketing/videos/gran-alineacion). Si la app se abre durante el evento, el
// video sale en lugar del menú; si el evento empieza con la app abierta (fuera de una
// partida), entra con un fundido. Una vez por alineación; se puede saltar desde el
// primer segundo y, al terminar, el último cuadro se funde con la app.
const VIDEO = require("../../../assets/videos/gran-alineacion.mp4");
const ENTRADA_MS = 700;
const SALIDA_MS = 650;
const TOPE_MS = 16_000; // si el video no avisa que terminó, no queda trabado

// Solo la primera revisión de la sesión (al abrir la app) sale sin fundido.
let primeraRevision = true;

function Reproductor({ fundido, onFin }: { fundido: boolean; onFin: () => void }) {
  const insets = useSafeAreaInsets();
  const [opacidad] = useState(() => new Animated.Value(fundido ? 0 : 1));
  const [saltable, setSaltable] = useState(false);
  const cerrandoRef = useRef(false);
  const finRef = useRef(onFin);
  useEffect(() => {
    finRef.current = onFin;
  }, [onFin]);

  const player = useVideoPlayer(VIDEO, (p) => {
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

export default function VideoAlineacion() {
  const [video, setVideo] = useState<{ numero: number; fundido: boolean; id: number } | null>(null);
  const pedidos = usePedidosVideo();
  const pedidosVistos = useRef(pedidos);

  useEffect(() => {
    let vivo = true;
    function revisar() {
      const instantaneo = primeraRevision;
      primeraRevision = false;
      const m = momentoAlineacion(Date.now());
      if (m.momento !== "durante") return;
      videoVisto(m.numero).then((visto) => {
        if (vivo && !visto) setVideo((v) => v ?? { numero: m.numero, fundido: !instantaneo, id: Date.now() });
      });
    }
    revisar();
    const id = setInterval(revisar, 30_000);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, []);

  // «Ver el video» desde el cartel del Inicio.
  useEffect(() => {
    if (pedidos === pedidosVistos.current) return;
    pedidosVistos.current = pedidos;
    setVideo({ numero: momentoAlineacion(Date.now()).numero, fundido: true, id: Date.now() });
  }, [pedidos]);

  if (!video) return null;
  return (
    <Reproductor
      key={video.id}
      fundido={video.fundido}
      onFin={() => {
        marcarVideoVisto(video.numero);
        setVideo(null);
      }}
    />
  );
}

const styles = StyleSheet.create({
  pantalla: { backgroundColor: "#000", zIndex: 150, elevation: 150 },
  saltar: { position: "absolute", right: 16, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(8,8,14,0.55)", borderWidth: 1, borderColor: "rgba(246,239,226,0.22)" },
});
