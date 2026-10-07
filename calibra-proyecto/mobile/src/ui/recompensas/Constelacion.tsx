import { useMemo } from "react";
import { View } from "react-native";
import Animated, { interpolate, useAnimatedProps, type SharedValue } from "react-native-reanimated";
import Svg, { Circle, Defs, Line, RadialGradient, Rect, Stop } from "react-native-svg";
import { FORMAS_CONSTELACION, polvoDeEstrellas } from "@/lib/recompensas/constelaciones";
import { color, mundoDe, oscurecer } from "~/tema";

// Una constelación en el cielo de su ciudad (0259): 7 estrellas con la forma del
// glifo. Las encendidas brillan con el color de la ciudad; las líneas se dibujan
// solas cuando se completa (`trazo` de 0 a 1, en la celebración).
const LineaAnimada = Animated.createAnimatedComponent(Line);
const CirculoAnimado = Animated.createAnimatedComponent(Circle);

function largo(a: [number, number], b: [number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function Trazo({ a, b, i, total, trazo, c }: { a: [number, number]; b: [number, number]; i: number; total: number; trazo: SharedValue<number>; c: string }) {
  const L = largo(a, b);
  const props = useAnimatedProps(() => {
    const desde = i / total;
    const hasta = (i + 1) / total;
    const p = interpolate(trazo.value, [desde, hasta], [0, 1], "clamp");
    return { strokeDashoffset: L * (1 - p), opacity: p > 0 ? 0.9 : 0 };
  });
  return <LineaAnimada x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={1.6} strokeLinecap="round" strokeDasharray={`${L} ${L}`} animatedProps={props} />;
}

function EstrellaQueSeEnciende({ p, i, encendido, c }: { p: [number, number]; i: number; encendido: SharedValue<number>; c: string }) {
  const props = useAnimatedProps(() => {
    const v = interpolate(encendido.value, [i, i + 1], [0, 1], "clamp");
    return { r: 2.2 + v * 1.6, opacity: 0.35 + v * 0.65 };
  });
  return <CirculoAnimado cx={p[0]} cy={p[1]} fill={c} animatedProps={props} />;
}

interface Props {
  mundo: string;
  estrellas: number;
  tam?: number;
  // Celebración: cuántas estrellas se ven encendidas (0..7, animado) y cuánto de las líneas (0..1).
  encendido?: SharedValue<number>;
  trazo?: SharedValue<number>;
  completa?: boolean;
  radio?: number;
}

export default function Constelacion({ mundo, estrellas, tam = 96, encendido, trazo, completa = false, radio = 16 }: Props) {
  const forma = FORMAS_CONSTELACION[mundo] ?? FORMAS_CONSTELACION.numeria;
  const m = mundoDe(mundo);
  const brillo = m?.neon ?? color.primarioNeon;
  const fondo = oscurecer(m?.base ?? color.primarioBase, 0.22);
  const polvo = useMemo(() => polvoDeEstrellas(mundo), [mundo]);
  const id = `cielo-${mundo}`;

  return (
    <View style={{ width: tam, height: tam, borderRadius: radio, overflow: "hidden" }}>
      <Svg width={tam} height={tam} viewBox="-6 -6 112 112">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="35%" r="75%">
            <Stop offset="0" stopColor={fondo} />
            <Stop offset="1" stopColor={color.bgHondo} />
          </RadialGradient>
        </Defs>
        <Rect x={-6} y={-6} width={112} height={112} fill={`url(#${id})`} />
        {polvo.map(([x, y, r], i) => (
          <Circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={0.25} />
        ))}
        {/* Guía tenue de la forma, para que se lea desde el principio. */}
        {forma.lineas.map(([a, b], i) => (
          <Line key={`g${i}`} x1={forma.puntos[a][0]} y1={forma.puntos[a][1]} x2={forma.puntos[b][0]} y2={forma.puntos[b][1]} stroke={brillo} strokeOpacity={completa ? 0.85 : 0.12} strokeWidth={completa ? 1.6 : 1} strokeDasharray={completa ? undefined : "2 3"} />
        ))}
        {trazo && forma.lineas.map(([a, b], i) => <Trazo key={`t${i}`} a={forma.puntos[a]} b={forma.puntos[b]} i={i} total={forma.lineas.length} trazo={trazo} c={brillo} />)}
        {forma.puntos.map((p, i) =>
          encendido ? (
            <EstrellaQueSeEnciende key={i} p={p} i={i} encendido={encendido} c={brillo} />
          ) : i < estrellas || completa ? (
            <Circle key={i} cx={p[0]} cy={p[1]} r={3.6} fill={brillo} />
          ) : (
            <Circle key={i} cx={p[0]} cy={p[1]} r={2.4} fill="none" stroke={brillo} strokeOpacity={0.45} strokeWidth={1} />
          )
        )}
        {/* Halo de las encendidas. */}
        {!encendido &&
          forma.puntos.map((p, i) => (i < estrellas || completa ? <Circle key={`h${i}`} cx={p[0]} cy={p[1]} r={7} fill={brillo} opacity={0.18} /> : null))}
      </Svg>
    </View>
  );
}
