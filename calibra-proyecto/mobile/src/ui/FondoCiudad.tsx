import { useEffect, useMemo, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useAnimacionActiva, useLiviano } from "~/lib/rendimiento";
import { conAlfa } from "~/tema";
import Ciudad from "./Ciudad";

// Fondo de las pantallas de carga (pedido 2026-10-13: «el fondo negro se ve simple»):
// cielo de noche con estrellas, la ciudad grande con sus ventanas que titilan y lo que
// pasa volando (aviones, pájaros, algún ovni, de Ciudad/Cielo), y abajo una carretera
// con farolas y las líneas del medio corriendo. Es opaco: tapa lo que haya detrás.

const ALTO_CARRETERA = 86;
const SEPARACION_LINEAS = 46;

// Estrellas siempre en el mismo lugar (generador con semilla fija).
function armarEstrellas(ancho: number, alto: number) {
  let s = 7;
  const azar = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: 46 }, () => ({ x: azar() * ancho, y: azar() * alto, r: 0.5 + azar() * 1.1, o: 0.25 + azar() * 0.6 }));
}

function Estrellas({ ancho, alto }: { ancho: number; alto: number }) {
  const puntos = useMemo(() => armarEstrellas(ancho, alto), [ancho, alto]);
  return (
    <Svg width={ancho} height={alto} style={StyleSheet.absoluteFill} pointerEvents="none">
      {puntos.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#FFFFFF" opacity={p.o} />
      ))}
    </Svg>
  );
}

function Carretera({ ancho, acento, activa }: { ancho: number; acento: string; activa: boolean }) {
  const avance = useSharedValue(0);
  useEffect(() => {
    if (!activa) {
      cancelAnimation(avance);
      return;
    }
    avance.set(0);
    avance.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1));
    return () => cancelAnimation(avance);
  }, [activa, avance]);
  const estiloLineas = useAnimatedStyle(() => ({ transform: [{ translateX: -avance.value * SEPARACION_LINEAS }] }));
  const lineas = Math.ceil(ancho / SEPARACION_LINEAS) + 2;
  const farolas = Math.max(3, Math.round(ancho / 110));
  return (
    <View style={[styles.carretera, { width: ancho }]} pointerEvents="none">
      <Svg width={ancho} height={ALTO_CARRETERA} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="asfalto" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#11142A" />
            <Stop offset="1" stopColor="#080A16" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={ancho} height={ALTO_CARRETERA} fill="url(#asfalto)" />
        <Rect x={0} y={0} width={ancho} height={10} fill="#1A1E38" />
        <Rect x={0} y={10} width={ancho} height={1.5} fill={conAlfa(acento, 0.55)} />
        <Rect x={0} y={ALTO_CARRETERA - 12} width={ancho} height={12} fill="#1A1E38" />
        {Array.from({ length: farolas }, (_, i) => {
          const x = ((i + 0.5) * ancho) / farolas;
          return <Circle key={i} cx={x} cy={11} r={26} fill="#FFD27A" opacity={0.07} />;
        })}
      </Svg>
      {Array.from({ length: farolas }, (_, i) => (
        <View key={i} style={[styles.farola, { left: ((i + 0.5) * ancho) / farolas - 1 }]}>
          <View style={styles.farolaLuz} />
        </View>
      ))}
      <Animated.View style={[styles.lineas, estiloLineas]}>
        {Array.from({ length: lineas }, (_, i) => (
          <View key={i} style={[styles.linea, { left: i * SEPARACION_LINEAS }]} />
        ))}
      </Animated.View>
    </View>
  );
}

export default function FondoCiudad({ semilla = "prodigia", acento }: { semilla?: string; acento: string }) {
  const [tam, setTam] = useState({ ancho: 0, alto: 0 });
  const activa = useAnimacionActiva();
  const liviano = useLiviano();
  const altoCiudad = Math.round(Math.min(320, tam.alto * 0.36));
  return (
    <View
      style={[StyleSheet.absoluteFill, styles.base]}
      pointerEvents="none"
      onLayout={(e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        if (Math.round(width) !== tam.ancho || Math.round(height) !== tam.alto) setTam({ ancho: Math.round(width), alto: Math.round(height) });
      }}
    >
      {tam.ancho > 0 && (
        <>
          <Estrellas ancho={tam.ancho} alto={tam.alto - altoCiudad - ALTO_CARRETERA} />
          <View style={[styles.halo, { backgroundColor: conAlfa(acento, 0.16), boxShadow: `0px 0px 120px ${conAlfa(acento, 0.35)}` }]} />
          <View style={{ position: "absolute", left: 0, right: 0, bottom: ALTO_CARRETERA }}>
            <Ciudad semilla={semilla} acento={acento} alto={altoCiudad} radio={0} densidad={liviano ? 1 : 1.25} sinLuna />
          </View>
          <View style={{ position: "absolute", left: 0, bottom: 0 }}>
            <Carretera ancho={tam.ancho} acento={acento} activa={activa} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: "#06080F", overflow: "hidden" },
  halo: { position: "absolute", width: 360, height: 360, borderRadius: 180, alignSelf: "center", top: "18%", opacity: 0.8 },
  carretera: { height: ALTO_CARRETERA, overflow: "hidden" },
  farola: { position: "absolute", top: -18, width: 2, height: 28, backgroundColor: "#3A4060" },
  farolaLuz: { position: "absolute", top: -3, left: -3, width: 8, height: 4, borderRadius: 2, backgroundColor: "#FFD27A" },
  lineas: { position: "absolute", left: 0, top: ALTO_CARRETERA / 2 - 2, height: 4, width: "200%" },
  linea: { position: "absolute", width: 22, height: 4, borderRadius: 2, backgroundColor: "#F2C14E", opacity: 0.85 },
});
