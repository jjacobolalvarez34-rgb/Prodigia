import { useEffect, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { medirHud, type IdHud, type Rect } from "~/lib/ayudas";
import { vibrar } from "~/lib/efectos";
import { color, conAlfa } from "~/tema";
import Boton3D from "./Boton3D";
import Texto from "./Texto";

// Recorrido corto (una sola vez por teléfono, se puede saltar): primero la barra de
// arriba (Chispas → tienda, racha) y después las 5 pestañas de abajo.
type Paso = { titulo: string; texto: string; hud?: IdHud; pestana?: number };

const PASOS: Paso[] = [
  { hud: "chispas", titulo: "Tus Chispas", texto: "Las ganas jugando. Toca aquí cuando quieras para abrir la tienda: marcos, fondos, fuentes y ayudas para las partidas." },
  { hud: "racha", titulo: "Tu racha", texto: "Los días seguidos que juegas. Con una partida al día, la llama sigue encendida." },
  { pestana: 0, titulo: "Inicio", texto: "Sigue jugando donde quedaste, el reto diario y tus recompensas." },
  { pestana: 1, titulo: "Mundos", texto: "Las 15 ciudades. Entra a una para practicar o aprender sus técnicas." },
  { pestana: 2, titulo: "Competir", texto: "Rankeds, duelos en vivo con amigos y la liga de la semana." },
  { pestana: 3, titulo: "Social", texto: "Amigos, clanes y chat." },
  { pestana: 4, titulo: "Perfil", texto: "Tu placa, tus logros y tus estadísticas." },
];
const PESTANAS = 5;

function Foco({ estilo }: { estilo: object }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withRepeat(withSequence(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 800, easing: Easing.inOut(Easing.quad) })), -1));
  }, [t]);
  const pulso = useAnimatedStyle(() => ({ transform: [{ scale: 1 + t.value * 0.08 }], opacity: 0.75 + t.value * 0.25 }));
  return <Animated.View entering={FadeIn.duration(250)} style={[styles.foco, estilo, pulso]} />;
}

export default function RecorridoPestanas({ onTerminar }: { onTerminar: () => void }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [rects, setRects] = useState<Partial<Record<IdHud, Rect>> | null>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    let vivo = true;
    Promise.all([medirHud("chispas", width), medirHud("racha", width)]).then(([chispas, racha]) => {
      if (vivo) setRects({ chispas: chispas ?? undefined, racha: racha ?? undefined });
    });
    return () => {
      vivo = false;
    };
  }, [width]);

  if (!rects) return <View style={styles.fondo} />;
  const pasos = PASOS.filter((p) => !p.hud || rects[p.hud]);
  const paso = pasos[Math.min(i, pasos.length - 1)];
  const ultimo = i >= pasos.length - 1;

  function siguiente() {
    vibrar.seleccion();
    if (ultimo) onTerminar();
    else setI(i + 1);
  }

  const tarjeta = (
    <>
      <Texto v="micro" c={color.primarioClaro}>
        {i + 1} DE {pasos.length}
      </Texto>
      <Texto v="h2">{paso.titulo}</Texto>
      <Texto v="cuerpo" c={color.texto2}>
        {paso.texto}
      </Texto>
      <Boton3D titulo={ultimo ? "¡Entendido!" : "Siguiente"} tamano="sm" onPress={siguiente} />
    </>
  );

  let contenido;
  const r = paso.hud ? rects[paso.hud] : undefined;
  if (r) {
    const centroX = r.x + r.w / 2;
    contenido = (
      <>
        <Foco key={`f${i}`} estilo={{ left: r.x - 7, top: r.y - 7, width: r.w + 14, height: r.h + 14, borderRadius: (r.h + 14) / 2 }} />
        <View style={[styles.flechaArriba, { left: centroX - 10, top: r.y + r.h + 14 }]} />
        <Animated.View key={i} entering={FadeInDown.duration(300)} style={[styles.tarjeta, { top: r.y + r.h + 23 }]}>
          {tarjeta}
        </Animated.View>
      </>
    );
  } else {
    const ancho = (width - 12) / PESTANAS;
    const x = 6 + ancho * ((paso.pestana ?? 0) + 0.5);
    const abajo = Math.max(insets.bottom, 10) + 8;
    contenido = (
      <>
        <Foco key={`f${i}`} estilo={{ left: x - 32, bottom: abajo - 6, width: 64, height: 64, borderRadius: 32 }} />
        <Animated.View key={i} entering={FadeInUp.duration(300)} style={[styles.tarjeta, { bottom: abajo + 74 }]}>
          {tarjeta}
        </Animated.View>
        <View style={[styles.flechaAbajo, { left: x - 10, bottom: abajo + 62 }]} />
      </>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.fondo}>
      <Pressable onPress={onTerminar} style={[styles.saltar, r ? { bottom: Math.max(insets.bottom, 10) + 100, alignSelf: "center" } : { top: insets.top + 14, right: 20 }]} hitSlop={12}>
        <Texto v="nota" c={color.texto2}>
          Saltar recorrido
        </Texto>
      </Pressable>
      {contenido}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: conAlfa(color.bgHondo, 0.78), zIndex: 120, elevation: 120 },
  saltar: { position: "absolute" },
  foco: { position: "absolute", borderWidth: 3, borderColor: color.primarioNeon, backgroundColor: conAlfa(color.primario, 0.15), boxShadow: `0px 0px 24px ${color.primarioNeon}` },
  tarjeta: { position: "absolute", left: 16, right: 16, gap: 8, padding: 18, borderRadius: 20, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border },
  flechaAbajo: { position: "absolute", width: 20, height: 20, backgroundColor: color.surface2, transform: [{ rotate: "45deg" }], borderRightWidth: 1, borderBottomWidth: 1, borderColor: color.border },
  flechaArriba: { position: "absolute", width: 20, height: 20, backgroundColor: color.surface2, transform: [{ rotate: "45deg" }], borderLeftWidth: 1, borderTopWidth: 1, borderColor: color.border, zIndex: 2 },
});
