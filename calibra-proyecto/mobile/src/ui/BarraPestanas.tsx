import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Animated, Easing, Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { vibrar } from "~/lib/efectos";
import { useJugador } from "~/lib/jugador";
import { color, conAlfa, fuente } from "~/tema";
import { IconoCompetir, IconoHoy, IconoMundos, IconoPerfil, IconoSocial } from "./Iconos";
import Texto from "./Texto";

// Barra inferior de 5 pestañas (maquetas-android.html). Deslizar el dedo sobre la
// barra pasa a la pestaña que queda bajo el dedo (la píldora violeta lo sigue); un
// deslizamiento rápido pasa a la de al lado. El ícono elegido da un saltito.

const PESTANAS: Record<string, { titulo: string; Icono: ComponentType<{ tam?: number; c?: string }> }> = {
  index: { titulo: "Hoy", Icono: IconoHoy },
  mundos: { titulo: "Mundos", Icono: IconoMundos },
  competir: { titulo: "Competir", Icono: IconoCompetir },
  social: { titulo: "Social", Icono: IconoSocial },
  perfil: { titulo: "Perfil", Icono: IconoPerfil },
};

interface Ruta {
  key: string;
  name: string;
  params?: object;
}

interface Props {
  state: { index: number; routes: Ruta[] };
  navigation: { emit: (e: { type: "tabPress"; target: string; canPreventDefault: true }) => { defaultPrevented: boolean }; navigate: (nombre: string, params?: object) => void };
}

function Pestana({ nombre, activa, onPress, insignia }: { nombre: string; activa: boolean; onPress: () => void; insignia: number }) {
  const { titulo, Icono } = PESTANAS[nombre] ?? PESTANAS.index;
  const [salto] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!activa) return;
    salto.setValue(0.82);
    Animated.spring(salto, { toValue: 1, friction: 4, tension: 220, useNativeDriver: true }).start();
  }, [activa, salto]);
  return (
    <Pressable onPress={onPress} style={styles.pestana} accessibilityRole="tab" accessibilityState={{ selected: activa }} accessibilityLabel={titulo}>
      <View style={styles.zonaIcono}>
        <Animated.View style={{ transform: [{ scale: salto }] }}>
          <Icono tam={21} c={activa ? color.primarioClaro : color.texto2} />
        </Animated.View>
        {insignia > 0 && (
          <View style={styles.insignia}>
            <Texto style={styles.insigniaTexto}>{insignia > 9 ? "9+" : insignia}</Texto>
          </View>
        )}
      </View>
      <Texto style={[styles.titulo, { color: activa ? color.texto : color.texto2 }]}>{titulo}</Texto>
    </Pressable>
  );
}

export default function BarraPestanas({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [ancho, setAncho] = useState(0);
  const { resumen } = useJugador();
  const n = state.routes.length;
  const anchoPestana = ancho / n;
  // La píldora viaja hasta la pestaña elegida (en el hilo nativo), al mismo ritmo que
  // el deslizamiento de la pantalla.
  const [indice] = useState(() => new Animated.Value(state.index));
  useEffect(() => {
    Animated.timing(indice, { toValue: state.index, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [state.index, indice]);
  const x =
    anchoPestana > 0
      ? indice.interpolate({ inputRange: state.routes.map((_, i) => i), outputRange: state.routes.map((_, i) => i * anchoPestana), extrapolate: "clamp" })
      : 0;

  // Deslizar sobre la barra: la pestaña sigue al dedo; un tirón rápido salta a la de al lado.
  const gesto = useMemo(() => {
    const marca = { actual: state.index };
    const ir = (i: number) => {
      const destino = Math.max(0, Math.min(n - 1, i));
      const ruta = state.routes[destino];
      if (!ruta || destino === marca.actual) return;
      marca.actual = destino;
      vibrar.seleccion();
      navigation.navigate(ruta.name, ruta.params);
    };
    return Gesture.Pan()
      .runOnJS(true)
      .activeOffsetX([-12, 12])
      .failOffsetY([-20, 20])
      .onUpdate((e) => {
        if (anchoPestana > 0) ir(Math.floor((e.x - 6) / anchoPestana));
      })
      .onEnd((e) => {
        if (Math.abs(e.velocityX) > 900 && Math.abs(e.translationX) < anchoPestana) ir(state.index + (e.velocityX < 0 ? 1 : -1));
      });
  }, [state, navigation, n, anchoPestana]);

  return (
    <GestureDetector gesture={gesto}>
    <View style={[styles.barra, { paddingBottom: Math.max(insets.bottom, 10) }]} onLayout={(e: LayoutChangeEvent) => setAncho(e.nativeEvent.layout.width - 12)}>
      {anchoPestana > 0 && (
        <Animated.View style={[styles.pildoraCarril, { width: anchoPestana, transform: [{ translateX: x }] }]} pointerEvents="none">
          <View style={styles.pildora} />
        </Animated.View>
      )}
      {state.routes.map((ruta, i) => (
        <Pestana
          key={ruta.key}
          nombre={ruta.name}
          activa={state.index === i}
          insignia={ruta.name === "social" ? resumen?.mensajesSinLeer ?? 0 : 0}
          onPress={() => {
            const evento = navigation.emit({ type: "tabPress", target: ruta.key, canPreventDefault: true });
            if (state.index !== i && !evento.defaultPrevented) {
              vibrar.seleccion();
              navigation.navigate(ruta.name, ruta.params);
            }
          }}
        />
      ))}
    </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: "row",
    paddingTop: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: color.border,
    backgroundColor: color.bg,
  },
  pildoraCarril: { position: "absolute", top: 8, left: 6, height: 30, alignItems: "center" },
  pildora: { width: 52, height: 30, borderRadius: 999, backgroundColor: conAlfa(color.primario, 0.26) },
  pestana: { flex: 1, alignItems: "center", gap: 3 },
  zonaIcono: { height: 30, width: 52, alignItems: "center", justifyContent: "center" },
  titulo: { fontFamily: fuente.cuerpoFuerte, fontSize: 10.5 },
  insignia: {
    position: "absolute",
    top: -1,
    right: 6,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: color.primario,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: color.bg,
  },
  insigniaTexto: { fontFamily: fuente.mono, fontSize: 9, color: "#fff" },
});
