import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, type SharedValue } from "react-native-reanimated";
import Svg, { Circle, Ellipse, Line, Path, Rect } from "react-native-svg";
import { mundoDobleExperiencia } from "@/lib/eventos/dobleExperiencia";
import { color } from "~/tema";

// Lo que pasa por el cielo de cada ciudad, de vez en cuando y nunca igual: un avión
// (que entra por cualquiera de los dos lados y a distinta altura), una bandada de
// pájaros o un ovni. Sobre la ciudad que hoy tiene DOBLE EXPERIENCIA cae además un
// paquete en paracaídas (src/lib/eventos/dobleExperiencia.ts; la base duplica la
// Exp, 0247). Una sola animación por ciudad, en el hilo nativo; cada pasada elige
// con la semilla de la ciudad y el número de pasada qué sale y por dónde.

type Evento = "avion" | "pajaros" | "ovni" | "paquete";

function azar(semilla: string, n: number) {
  let h = 2166136261 ^ n;
  for (let i = 0; i < semilla.length; i++) h = Math.imul(h ^ semilla.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Pasada {
  n: number;
  evento: Evento;
  desdeIzquierda: boolean;
  altura: number; // 0..1 del alto
  duracion: number;
  espera: number;
  x: number; // paquete: dónde cae (0..1 del ancho)
}

function elegir(semilla: string, n: number, conPaquete: boolean, liviano: boolean): Pasada {
  const r = azar(semilla, n);
  const tirada = r();
  let evento: Evento;
  if (conPaquete && n % 2 === 0) evento = "paquete";
  else if (tirada < 0.55) evento = "avion";
  else if (tirada < 0.85) evento = "pajaros";
  else evento = "ovni";
  const base = evento === "paquete" ? 9000 : evento === "ovni" ? 5200 : evento === "pajaros" ? 8500 : 7500;
  return {
    n,
    evento,
    desdeIzquierda: r() < 0.5,
    altura: 0.08 + r() * 0.3,
    duracion: (liviano ? 1.2 : 1) * base * (0.85 + r() * 0.3),
    espera: (conPaquete ? 2500 : 6000) + r() * 9000,
    x: 0.2 + r() * 0.6,
  };
}

function Avion() {
  return (
    <Svg width={22} height={10}>
      <Rect x={2} y={4} width={16} height={2.4} rx={1.2} fill="#C9D3E6" />
      <Rect x={8} y={0} width={3} height={10} rx={1} fill="#8892B0" />
      <Rect x={2} y={2} width={2} height={4} rx={1} fill="#8892B0" />
      <Circle cx={19} cy={5.2} r={1.6} fill={color.error} />
    </Svg>
  );
}

function Pajaros() {
  // Cinco "v" en formación.
  const pos = [
    [10, 8],
    [2, 3],
    [18, 3],
    [-5, -1],
    [25, -1],
  ];
  return (
    <Svg width={40} height={18} viewBox="-8 -4 40 18">
      {pos.map(([x, y], i) => (
        <Path key={i} d={`M${x - 3} ${y} q 1.5 -2 3 0 q 1.5 -2 3 0`} stroke="#DDE3F2" strokeWidth={1.1} fill="none" strokeLinecap="round" />
      ))}
    </Svg>
  );
}

function Ovni() {
  return (
    <Svg width={30} height={20}>
      <Path d="M4 13 L-2 22 M26 13 L32 22" stroke="#7CFFB2" strokeOpacity={0.35} strokeWidth={6} />
      <Ellipse cx={15} cy={8} rx={6} ry={5} fill="#9BE7FF" fillOpacity={0.85} />
      <Ellipse cx={15} cy={11} rx={14} ry={4} fill="#B8C2DA" />
      <Circle cx={8} cy={11} r={1.2} fill="#7CFFB2" />
      <Circle cx={15} cy={12} r={1.2} fill={color.logro} />
      <Circle cx={22} cy={11} r={1.2} fill="#7CFFB2" />
    </Svg>
  );
}

function Paquete() {
  return (
    <Svg width={30} height={40}>
      <Path d="M2 12 Q15 -4 28 12 Q22 9 15 12 Q8 9 2 12 Z" fill={color.logro} />
      <Path d="M15 12 V12" stroke="#fff" />
      <Line x1={3} y1={12} x2={12} y2={28} stroke="#E8ECF6" strokeWidth={0.8} />
      <Line x1={27} y1={12} x2={18} y2={28} stroke="#E8ECF6" strokeWidth={0.8} />
      <Line x1={15} y1={12} x2={15} y2={28} stroke="#E8ECF6" strokeWidth={0.8} />
      <Rect x={9} y={27} width={12} height={11} rx={2} fill="#B07CFF" />
      <Rect x={14} y={27} width={2} height={11} fill={color.logro} />
      <Rect x={9} y={31} width={12} height={2} fill={color.logro} />
    </Svg>
  );
}

function Movil({ p, t, ancho, alto }: { p: Pasada; t: SharedValue<number>; ancho: number; alto: number }) {
  const balanceo = useSharedValue(0);
  useEffect(() => {
    if (p.evento !== "paquete" && p.evento !== "ovni") return;
    balanceo.set(withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), withTiming(-1, { duration: 900, easing: Easing.inOut(Easing.sin) })), -1, true));
    return () => cancelAnimation(balanceo);
  }, [p.evento, balanceo]);
  const estilo = useAnimatedStyle(() => {
    const v = t.value;
    if (p.evento === "paquete") {
      // Cae desde arriba hasta los techos y se desvanece al aterrizar.
      return {
        opacity: v < 0.08 ? v / 0.08 : v > 0.9 ? (1 - v) / 0.1 : 1,
        transform: [{ translateX: p.x * ancho - 15 + balanceo.value * 10 }, { translateY: -40 + v * (alto * 0.62) }, { rotate: `${balanceo.value * 8}deg` }],
      };
    }
    const x = p.desdeIzquierda ? -40 + v * (ancho + 80) : ancho + 40 - v * (ancho + 80);
    const y = p.altura * alto + (p.evento === "ovni" ? Math.sin(v * 14) * 6 : p.evento === "pajaros" ? Math.sin(v * 9) * 3 : -v * 6);
    return {
      opacity: v <= 0 || v >= 1 ? 0 : 1,
      transform: [{ translateX: x }, { translateY: y }, { scaleX: p.desdeIzquierda ? 1 : -1 }],
    };
  });
  return (
    <Animated.View style={[styles.movil, estilo]} pointerEvents="none">
      {p.evento === "avion" ? <Avion /> : p.evento === "pajaros" ? <Pajaros /> : p.evento === "ovni" ? <Ovni /> : <Paquete />}
    </Animated.View>
  );
}

export default function Cielo({ semilla, ancho, alto, activa, liviano }: { semilla: string; ancho: number; alto: number; activa: boolean; liviano: boolean }) {
  const conPaquete = mundoDobleExperiencia() === semilla;
  const [pasada, setPasada] = useState<Pasada>(() => elegir(semilla, 0, conPaquete, liviano));
  const t = useSharedValue(0);

  useEffect(() => {
    if (!activa) {
      cancelAnimation(t);
      return;
    }
    t.set(0);
    t.set(withTiming(1, { duration: pasada.duracion, easing: pasada.evento === "paquete" ? Easing.out(Easing.quad) : Easing.linear }));
    const id = setTimeout(() => setPasada(elegir(semilla, pasada.n + 1, conPaquete, liviano)), pasada.duracion + pasada.espera);
    return () => {
      clearTimeout(id);
      cancelAnimation(t);
    };
  }, [activa, pasada, semilla, conPaquete, liviano, t]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Movil key={pasada.n} p={pasada} t={t} ancho={ancho} alto={alto} />
    </View>
  );
}

const styles = StyleSheet.create({
  movil: { position: "absolute", left: 0, top: 0 },
});
