import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { ALTO_MAPA, ANCHO_MAPA, mapaDe, paisEnPunto, type Continente } from "~/lib/geografia";
import { color, fuente } from "~/tema";

// Mapa de Geografía de la app. Mismo mapa real que la web, con:
// - pellizco para acercar/alejar (centrado donde están los dedos) y botones + / − / ⟲;
// - arrastre con un dedo para moverlo;
// - toque para elegir país: si el dedo cae en el mar pero pegado a un país chico
//   (islas, microestados), elige el más cercano. Un arrastre nunca elige.
// Nitidez: react-native-svg dibuja en un bitmap del tamaño de la vista, así que
// agrandarlo con `transform` lo pixela. Por eso hay dos capas: mientras dura el
// gesto se ve la capa que se agranda (rápida); al soltar, la capa nítida se vuelve
// a dibujar con un viewBox que muestra justo la zona visible, a resolución de
// pantalla, y reemplaza a la otra sin moverse.

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
  // Sin tocar (antes de la cuenta 3-2-1 o al terminar), sin revelar la respuesta.
  bloqueado?: boolean;
  onElegir: (id: string) => void;
}

function clamp(v: number, min: number, max: number) {
  "worklet";
  return Math.min(max, Math.max(min, v));
}

export default function MapaGeografia({ continente, acento, objetivoId, seleccionId, respondido, bloqueado, onElegir }: Props) {
  const [ancho, setAncho] = useState(0);
  const alto = (ancho * ALTO_MAPA) / ANCHO_MAPA;
  const [escalaJs, setEscalaJs] = useState(1);
  const mapa = mapaDe(continente);

  const escala = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const inicio = useSharedValue({ escala: 1, tx: 0, ty: 0 });
  // Vista "quieta" (la que dibuja la capa nítida) y si esa capa está al frente.
  const [base, setBase] = useState({ s: 1, x: 0, y: 0 });
  const quieto = useSharedValue(1);

  function fijarVista(s: number, x: number, y: number) {
    setEscalaJs(s);
    setBase({ s, x, y });
  }

  // Cuando la capa nítida ya se dibujó con la vista nueva, vuelve al frente.
  useEffect(() => {
    const id = requestAnimationFrame(() => quieto.set(withTiming(1, { duration: 140 })));
    return () => cancelAnimationFrame(id);
  }, [base, quieto]);

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
      quieto.set(0);
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
      runOnJS(fijarVista)(escala.value, tx.value, ty.value);
    });

  const arrastre = Gesture.Pan()
    .minDistance(6)
    .averageTouches(true)
    .onStart(() => {
      quieto.set(0);
      inicio.value = { escala: escala.value, tx: tx.value, ty: ty.value };
    })
    .onUpdate((e) => {
      tx.value = inicio.value.tx + e.translationX;
      ty.value = inicio.value.ty + e.translationY;
      limitar();
    })
    .onEnd(() => {
      runOnJS(fijarVista)(escala.value, tx.value, ty.value);
    });

  function tocar(x: number, y: number) {
    if (respondido || bloqueado || ancho === 0) return;
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
    opacity: 1 - quieto.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: escala.value }],
  }));
  const estiloNitido = useAnimatedStyle(() => ({ opacity: quieto.value }));

  function animarA(s: number, x: number, y: number, ms: number) {
    quieto.set(0);
    escala.set(withTiming(s, { duration: ms }));
    tx.set(withTiming(x, { duration: ms }));
    ty.set(
      withTiming(y, { duration: ms }, (fin) => {
        if (fin) runOnJS(fijarVista)(s, x, y);
      })
    );
  }

  function zoomBoton(factor: number) {
    const actual = escala.get();
    const nueva = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, actual * factor));
    const k = nueva / actual;
    animarA(nueva, tx.get() * k, ty.get() * k, 220);
  }

  function reiniciar() {
    animarA(1, 0, 0, 260);
  }

  const trazo = 0.8 / escalaJs;
  // Zona del mapa que se ve con la vista quieta (en unidades del mapa 480 × 420).
  const vbX = ancho > 0 ? ((-ancho / 2 - base.x) / base.s + ancho / 2) * (ANCHO_MAPA / ancho) : 0;
  const vbY = alto > 0 ? ((-alto / 2 - base.y) / base.s + alto / 2) * (ALTO_MAPA / alto) : 0;
  const formas = mapa.formas.map((f) => {
    let relleno = RELLENO;
    if (respondido && f.id === objetivoId) relleno = color.correcto;
    else if (respondido && f.id === seleccionId) relleno = color.error;
    return { ...f, relleno };
  });

  return (
    <View style={styles.marco} onLayout={(e: LayoutChangeEvent) => setAncho(e.nativeEvent.layout.width)}>
      {ancho > 0 && (
        <GestureDetector gesture={gestos}>
          <View style={{ width: ancho, height: alto, overflow: "hidden" }}>
            <Animated.View style={[{ width: ancho, height: alto }, estiloMapa]}>
              <Svg width={ancho} height={alto} viewBox={`0 0 ${ANCHO_MAPA} ${ALTO_MAPA}`}>
                {formas.map((f) => (
                  <Path key={f.id} d={f.d} fill={f.relleno} stroke={BORDE} strokeWidth={trazo} />
                ))}
              </Svg>
            </Animated.View>
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, estiloNitido]}>
              <Svg width={ancho} height={alto} viewBox={`${vbX} ${vbY} ${ANCHO_MAPA / base.s} ${ALTO_MAPA / base.s}`}>
                {formas.map((f) => (
                  <Path key={f.id} d={f.d} fill={f.relleno} stroke={BORDE} strokeWidth={trazo} />
                ))}
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
  botonTexto: { color: color.texto, fontSize: 20, fontFamily: fuente.display, lineHeight: 22 },
  ayuda: { position: "absolute", bottom: 6, left: 0, right: 0, textAlign: "center", color: color.texto2, fontSize: 11 },
});
