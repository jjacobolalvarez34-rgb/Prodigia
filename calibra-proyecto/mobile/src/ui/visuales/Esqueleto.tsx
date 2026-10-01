import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { G, Path } from "react-native-svg";
import { vibrar } from "~/lib/efectos";
import { color } from "~/tema";
import Texto from "../Texto";
import datos from "~/lib/datos/esqueleto.json";

// Anatomía, modo óseo: el esqueleto de la web (dominio público, LadyofHats) con cada
// hueso tocable. Se puede pellizcar para acercar y arrastrar (los huesos de la mano
// y del pie son chicos). Al responder, el hueso correcto se pinta de verde y el
// tocado por error de rojo.
interface Trazo {
  d: string;
  f?: string;
  s?: string;
  w?: number;
  h?: string;
  t?: string;
}

const TRAZOS = (datos as { trazos: Trazo[] }).trazos;
const [, , VB_W, VB_H] = (datos as { viewBox: string }).viewBox.split(/\s+/).map(Number);

interface Props {
  objetivo: string;
  respondido: boolean;
  seleccion: string | null;
  onElegir: (hueso: string) => void;
}

export default function Esqueleto({ objetivo, respondido, seleccion, onElegir }: Props) {
  const [ancho, setAncho] = useState(0);
  const alto = 430;
  const escala = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const inicio = useSharedValue({ e: 1, x: 0, y: 0 });

  const pellizco = Gesture.Pinch()
    .onStart(() => {
      inicio.value = { e: escala.value, x: tx.value, y: ty.value };
    })
    .onUpdate((e) => {
      escala.value = Math.min(5, Math.max(1, inicio.value.e * e.scale));
    });
  const arrastre = Gesture.Pan()
    .minDistance(8)
    .onStart(() => {
      inicio.value = { e: escala.value, x: tx.value, y: ty.value };
    })
    .onUpdate((e) => {
      const lim = (escala.value - 1) * 220 + 20;
      tx.value = Math.max(-lim, Math.min(lim, inicio.value.x + e.translationX));
      ty.value = Math.max(-lim * 1.6, Math.min(lim * 1.6, inicio.value.y + e.translationY));
    });
  const gestos = Gesture.Simultaneous(pellizco, arrastre);
  const estilo = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: escala.value }] }));

  // Los trazos de cada hueso se agrupan para tocarlos juntos.
  const grupos = useMemo(() => {
    const lista: { hueso: string | null; trazos: Trazo[] }[] = [];
    for (const t of TRAZOS) {
      const ultimo = lista[lista.length - 1];
      const h = t.h ?? null;
      if (ultimo && ultimo.hueso === h) ultimo.trazos.push(t);
      else lista.push({ hueso: h, trazos: [t] });
    }
    return lista;
  }, []);

  function pintar(t: Trazo, hueso: string | null) {
    if (respondido && hueso === objetivo) return { f: t.f ? color.correcto : undefined, s: t.s ? color.correcto : undefined };
    if (respondido && hueso && hueso === seleccion && seleccion !== objetivo) return { f: t.f ? color.error : undefined, s: t.s ? color.error : undefined };
    return { f: t.f, s: t.s };
  }

  return (
    <View style={styles.marco} onLayout={(e: LayoutChangeEvent) => setAncho(e.nativeEvent.layout.width)}>
      {ancho > 0 && (
        <GestureDetector gesture={gestos}>
          <Animated.View style={[{ width: ancho, height: alto }, estilo]}>
            <Svg width={ancho} height={alto} viewBox={`0 0 ${VB_W} ${VB_H}`}>
              {grupos.map((g, i) => (
                <G
                  key={i}
                  onPress={
                    g.hueso && !respondido
                      ? () => {
                          vibrar.seleccion();
                          onElegir(g.hueso!);
                        }
                      : undefined
                  }
                >
                  {g.trazos.map((t, j) => {
                    const c = pintar(t, g.hueso);
                    return <Path key={j} d={t.d} fill={c.f ?? "none"} stroke={c.s ?? "none"} strokeWidth={t.w} transform={t.t} />;
                  })}
                </G>
              ))}
            </Svg>
          </Animated.View>
        </GestureDetector>
      )}
      <View style={styles.controles}>
        <Pressable
          style={styles.boton}
          onPress={() => {
            escala.set(withTiming(1, { duration: 220 }));
            tx.set(withTiming(0, { duration: 220 }));
            ty.set(withTiming(0, { duration: 220 }));
          }}
        >
          <Texto v="fuerte">⟲</Texto>
        </Pressable>
      </View>
      <Texto v="nota" tam={11} centro style={styles.ayuda}>
        Toca el hueso · pellizca para acercar
      </Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  marco: { width: "100%", height: 430, borderRadius: 18, overflow: "hidden", backgroundColor: "#F3EEDF" },
  controles: { position: "absolute", right: 8, top: 8 },
  boton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(18,23,42,0.85)", alignItems: "center", justifyContent: "center" },
  ayuda: { position: "absolute", bottom: 4, left: 0, right: 0, color: "#5A5040" },
});
