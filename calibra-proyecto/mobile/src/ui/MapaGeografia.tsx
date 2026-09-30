import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { ALTO_MAPA, ANCHO_MAPA, mapaDe, paisEnPunto, type Continente } from "~/lib/geografia";
import { color } from "~/tema";

// Mapa de Geografía de la app. Mismo mapa real que la web, con:
// - pellizco para acercar/alejar (centrado donde están los dedos) y botones + / − / ⟲;
// - arrastre con un dedo para moverlo;
// - toque para elegir país: si el dedo cae en el mar pero pegado a un país chico
//   (islas, microestados), elige el más cercano. Un arrastre nunca elige.

const ESCALA_MIN = 1;
const ESCALA_MAX = 8;
// Radio de "toque generoso" en píxeles de pantalla (se achica en el lienzo al hacer zoom).
const TOLERANCIA_PX = 14;

const RELLENO = "#1D4A56";
const BORDE = color.bg;

interface Props {
  continente: Continente;
  acento: string;
  objetivoId: string | null;
  seleccionId: string | null;
  respondido: boolean;
  onElegir: (id: string) => void;
}

function clamp(v: number, min: number, max: number) {
  "worklet";
  return Math.min(max, Math.max(min, v));
}

export default function MapaGeografia({ continente, acento, objetivoId, seleccionId, respondido, onElegir }: Props) {
  const [ancho, setAncho] = useState(0);
  const alto = (ancho * ALTO_MAPA) / ANCHO_MAPA;
  const [escalaJs, setEscalaJs] = useState(1);
  const mapa = mapaDe(continente);

  const escala = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const inicio = useSharedValue({ escala: 1, tx: 0, ty: 0 });

  // El mapa no puede irse del recuadro: como mucho, un 10 % de margen.
  function limitar() {
    "worklet";
    const maxX = (ancho * (escala.value - 1)) / 2 + ancho * 0.1;
    const maxY = (alto * (escala.value - 1)) / 2 + alto * 0.1;
    tx.value = clamp(tx.value, -maxX, maxX);
    ty.value = clamp(ty.value, -maxY, maxY);
  }

  const pellizco = Gesture.Pinch()
    .onStart(() => {
      inicio.value = { escala: escala.value, tx: tx.value, ty: ty.value };
    })
    .onUpdate((e) => {
      const nueva = clamp(inicio.value.escala * e.scale, ESCALA_MIN, ESCALA_MAX);
      const factor = nueva / inicio.value.escala;
      // El punto entre los dedos se queda quieto mientras se hace zoom.
      const fx = e.focalX - ancho / 2;
      const fy = e.focalY - alto / 2;
      escala.value = nueva;
      tx.value = fx - (fx - inicio.value.tx) * factor;
      ty.value = fy - (fy - inicio.value.ty) * factor;
      limitar();
    })
    .onEnd(() => {
      runOnJS(setEscalaJs)(escala.value);
    });

  const arrastre = Gesture.Pan()
    .minDistance(6)
    .averageTouches(true)
    .onStart(() => {
      inicio.value = { escala: escala.value, tx: tx.value, ty: ty.value };
    })
    .onUpdate((e) => {
      tx.value = inicio.value.tx + e.translationX;
      ty.value = inicio.value.ty + e.translationY;
      limitar();
    });

  function tocar(x: number, y: number) {
    if (respondido || ancho === 0) return;
    const s = escala.get();
    // De la pantalla (con zoom y desplazamiento) al lienzo 480 × 420 del mapa.
    const px = ((x - ancho / 2 - tx.get()) / s + ancho / 2) * (ANCHO_MAPA / ancho);
    const py = ((y - alto / 2 - ty.get()) / s + alto / 2) * (ALTO_MAPA / alto);
    const id = paisEnPunto(mapa, px, py, (TOLERANCIA_PX / s) * (ANCHO_MAPA / ancho));
    if (id) onElegir(id);
    else Haptics.selectionAsync();
  }

  const toque = Gesture.Tap()
    .maxDistance(8)
    .onEnd((e, exito) => {
      if (exito) runOnJS(tocar)(e.x, e.y);
    });

  const gestos = Gesture.Race(Gesture.Simultaneous(pellizco, arrastre), toque);

  const estiloMapa = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: escala.value }],
  }));

  function zoomBoton(factor: number) {
    const actual = escala.get();
    const nueva = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, actual * factor));
    const k = nueva / actual;
    escala.set(withTiming(nueva, { duration: 220 }));
    tx.set(withTiming(tx.get() * k, { duration: 220 }));
    ty.set(withTiming(ty.get() * k, { duration: 220 }));
    setEscalaJs(nueva);
  }

  function reiniciar() {
    escala.set(withTiming(1, { duration: 260 }));
    tx.set(withTiming(0, { duration: 260 }));
    ty.set(withTiming(0, { duration: 260 }));
    setEscalaJs(1);
  }

  const trazo = 0.8 / escalaJs;

  return (
    <View style={styles.marco} onLayout={(e: LayoutChangeEvent) => setAncho(e.nativeEvent.layout.width)}>
      {ancho > 0 && (
        <GestureDetector gesture={gestos}>
          <View style={{ width: ancho, height: alto, overflow: "hidden" }}>
            <Animated.View style={[{ width: ancho, height: alto }, estiloMapa]}>
              <Svg width={ancho} height={alto} viewBox={`0 0 ${ANCHO_MAPA} ${ALTO_MAPA}`}>
                {mapa.formas.map((f) => {
                  let relleno = RELLENO;
                  if (respondido && f.id === objetivoId) relleno = color.correcto;
                  else if (respondido && f.id === seleccionId) relleno = color.error;
                  return <Path key={f.id} d={f.d} fill={relleno} stroke={BORDE} strokeWidth={trazo} />;
                })}
              </Svg>
            </Animated.View>
          </View>
        </GestureDetector>
      )}

      <View style={styles.controles}>
        <Pressable onPress={() => zoomBoton(1.6)} style={[styles.boton, { borderColor: acento + "88" }]} accessibilityLabel="Acercar">
          <Text style={styles.botonTexto}>+</Text>
        </Pressable>
        <Pressable onPress={() => zoomBoton(1 / 1.6)} style={[styles.boton, { borderColor: acento + "88" }]} accessibilityLabel="Alejar">
          <Text style={styles.botonTexto}>−</Text>
        </Pressable>
        <Pressable onPress={reiniciar} style={[styles.boton, { borderColor: acento + "88" }]} accessibilityLabel="Ver el mapa completo">
          <Text style={[styles.botonTexto, { fontSize: 16 }]}>⟲</Text>
        </Pressable>
      </View>
      <Text style={styles.ayuda} pointerEvents="none">
        Pellizca para acercar · arrastra para mover
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marco: { width: "100%", borderRadius: 20, overflow: "hidden", backgroundColor: "#0B1822", borderWidth: 1, borderColor: color.border },
  controles: { position: "absolute", right: 8, top: 8, gap: 6 },
  boton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    backgroundColor: "#12172AE6",
    alignItems: "center",
    justifyContent: "center",
  },
  botonTexto: { color: color.texto, fontSize: 20, fontWeight: "800", lineHeight: 22 },
  ayuda: { position: "absolute", bottom: 6, left: 0, right: 0, textAlign: "center", color: color.texto2, fontSize: 11 },
});
