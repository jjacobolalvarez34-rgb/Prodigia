import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { vibrar } from "~/lib/efectos";
import { useLiviano } from "~/lib/rendimiento";
import { fuente } from "~/tema";
import Texto, { SobreOscuro } from "../Texto";

// Carteles de evento del Inicio minimizados (pedido del 2026-10-28, igual que la web,
// calibra/src/components/temas/CartelPlegable.tsx): por defecto son una franja compacta
// (dibujo, nombre y contador) para que «jugar» quede a un toque; al tocarla se abre el
// cartel completo, y se puede volver a minimizar. Si se deja abierto, se recuerda por
// evento en el teléfono.
const PREFIJO = "prodigia:cartel-abierto:";
// Lo ya leído o elegido (para no parpadear al volver al Inicio).
const memoria = new Map<string, boolean>();

// El contador de la franja, corto: solo las dos unidades mayores de faltaPara
// («6 d 23 h», «2 h 05 min», «4 min 09 s»).
export function faltaCorto(tiempo: string): string {
  return tiempo.split(" ").slice(0, 4).join(" ");
}

function Chevron({ arriba = false, c = "rgba(255,255,255,0.75)" }: { arriba?: boolean; c?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Path d={arriba ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4"} fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export interface FranjaCartel {
  // Dibujo chico de la izquierda (el del evento).
  icono: ReactNode;
  eyebrow: string;
  titulo: string;
  // El contador o la línea corta de la derecha.
  detalle?: ReactNode;
  acento: string;
  colores: readonly [string, string, ...string[]];
  borde?: string;
  sombra?: string;
  // Algo por reclamar: un punto sobre el dibujo y una etiqueta discreta.
  pendiente?: string | null;
}

export default function CartelPlegable({ id, franja, children }: { id: string; franja: FranjaCartel; children: ReactNode }) {
  const liviano = useLiviano();
  const [abierto, setAbierto] = useState(() => memoria.get(id) ?? false);

  useEffect(() => {
    if (memoria.has(id)) return;
    let vivo = true;
    AsyncStorage.getItem(PREFIJO + id)
      .then((v) => {
        if (!memoria.has(id)) memoria.set(id, v === "1");
        if (vivo && v === "1") setAbierto(true);
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [id]);

  function cambiar(v: boolean) {
    vibrar.ligero();
    memoria.set(id, v);
    setAbierto(v);
    (v ? AsyncStorage.setItem(PREFIJO + id, "1") : AsyncStorage.removeItem(PREFIJO + id)).catch(() => undefined);
  }

  const transicion = liviano ? undefined : LinearTransition.duration(260);
  return (
    <Animated.View layout={transicion}>
      {abierto ? (
        <Animated.View key="abierto" entering={liviano ? undefined : FadeIn.duration(280)}>
          {children}
          <Pressable onPress={() => cambiar(false)} hitSlop={10} style={styles.minimizar} accessibilityRole="button" accessibilityLabel="Minimizar" accessibilityState={{ expanded: true }}>
            <Chevron arriba c="rgba(255,255,255,0.9)" />
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View key="franja" entering={liviano ? undefined : FadeIn.duration(220)}>
          <SobreOscuro>
            <Pressable
              onPress={() => cambiar(true)}
              accessibilityRole="button"
              accessibilityLabel={`${franja.titulo}. Toca para ver el cartel`}
              accessibilityState={{ expanded: false }}
              style={({ pressed }) => [styles.franja, { borderColor: franja.borde ?? "#05060F", boxShadow: franja.sombra ?? "4px 4px 0px #05060F" }, pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <LinearGradient colors={franja.colores} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
              <View style={styles.icono}>
                {franja.icono}
                {!!franja.pendiente && <View style={[styles.punto, { backgroundColor: franja.acento }]} />}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Texto numberOfLines={1} style={{ fontFamily: fuente.cuerpoBold, fontSize: 10, letterSpacing: 2, color: franja.acento }}>
                  {franja.eyebrow.toUpperCase()}
                </Texto>
                <Texto numberOfLines={1} style={{ fontFamily: fuente.display, fontSize: 16, lineHeight: 20 }}>
                  {franja.titulo}
                </Texto>
              </View>
              {franja.pendiente ? (
                <View style={[styles.pastilla, { borderWidth: 1, borderColor: `${franja.acento}99`, backgroundColor: `${franja.acento}1f` }]}>
                  <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 11, color: franja.acento }}>{franja.pendiente}</Texto>
                </View>
              ) : (
                !!franja.detalle && <View style={styles.pastilla}>{franja.detalle}</View>
              )}
              <Chevron />
            </Pressable>
          </SobreOscuro>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  franja: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, borderWidth: 2, backgroundColor: "#0B0A1A" },
  icono: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(5,6,15,0.45)" },
  punto: { position: "absolute", top: -4, right: -4, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "#05060F" },
  pastilla: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.1)" },
  minimizar: { position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(5,6,15,0.6)" },
});
