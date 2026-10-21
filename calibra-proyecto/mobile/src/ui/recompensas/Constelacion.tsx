import { useMemo } from "react";
import { View } from "react-native";
import Animated, { interpolate, useAnimatedProps, type SharedValue } from "react-native-reanimated";
import Svg, { Circle, Defs, G, Image as ImagenSvg, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { Image } from "expo-image";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { capaVisible } from "@/lib/temas/temas";
import { useTemaHoy } from "~/lib/temporada";
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

// Rayo de luz entre dos estrellas (2026-10-21: «las líneas siguen igual de sencillas»):
// halo ancho del color de la ciudad, cuerpo con degradado (blanco junto a las estrellas,
// color en el medio) y núcleo blanco fino. Igual que la web.
function capasRayo(c: string, rayo: string) {
  return [
    { stroke: c, op: 0.16, ancho: 9 },
    { stroke: c, op: 0.32, ancho: 5 },
    { stroke: `url(#${rayo})`, op: 0.95, ancho: 2.2 },
    { stroke: "#FFFFFF", op: 0.95, ancho: 0.8 },
  ];
}

function CapaTrazo({ a, b, i, total, trazo, capa }: { a: [number, number]; b: [number, number]; i: number; total: number; trazo: SharedValue<number>; capa: { stroke: string; op: number; ancho: number } }) {
  const L = largo(a, b);
  const props = useAnimatedProps(() => {
    const desde = i / total;
    const hasta = (i + 1) / total;
    const p = interpolate(trazo.value, [desde, hasta], [0, 1], "clamp");
    return { strokeDashoffset: L * (1 - p), opacity: p > 0 ? capa.op : 0 };
  });
  return <LineaAnimada x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={capa.stroke} strokeWidth={capa.ancho} strokeLinecap="round" strokeDasharray={`${L} ${L}`} animatedProps={props} />;
}

function Trazo({ a, b, i, total, trazo, c, rayo }: { a: [number, number]; b: [number, number]; i: number; total: number; trazo: SharedValue<number>; c: string; rayo: string }) {
  return (
    <G>
      {capasRayo(c, rayo).map((capa, k) => (
        <CapaTrazo key={k} a={a} b={b} i={i} total={total} trazo={trazo} capa={capa} />
      ))}
    </G>
  );
}

function EstrellaQueSeEnciende({ p, i, encendido, c }: { p: [number, number]; i: number; encendido: SharedValue<number>; c: string }) {
  const props = useAnimatedProps(() => {
    const v = interpolate(encendido.value, [i, i + 1], [0, 1], "clamp");
    return { r: 2.2 + v * 1.6, opacity: 0.35 + v * 0.65 };
  });
  return <CirculoAnimado cx={p[0]} cy={p[1]} fill={c} animatedProps={props} />;
}

// Estrella con la forma de la festividad (igual que la web), centrada en p.
function EstrellaTema({ p, tipo, c }: { p: [number, number]; tipo: keyof typeof PARTICULAS; c: string }) {
  const d = PARTICULAS[tipo];
  const lado = tipo === "murcielago" ? 16 : 11;
  return (
    <G transform={`translate(${p[0] - lado / 2} ${p[1] - lado / 2}) scale(${lado / d.ancho})`}>
      {d.formas.map((f, i) => (
        <Path key={i} d={f.d} fill={i === 0 && f.relleno ? c : (f.relleno ?? "none")} stroke={i === 0 && f.trazo && !f.relleno ? c : f.trazo} strokeWidth={f.ancho} strokeLinecap="round" strokeLinejoin="round" opacity={f.opacidad} />
      ))}
    </G>
  );
}

// Cielos y estrellas pintados de antemano (pendiente 94; zz-galeria/constelaciones-render).
const PINTADAS: Record<string, { fondo: number; estrella: number }> = {
  numeria: { fondo: require("../../../assets/constelaciones/fondo-numeria.jpg"), estrella: require("../../../assets/constelaciones/estrella-numeria.png") },
  enigmia: { fondo: require("../../../assets/constelaciones/fondo-enigmia.jpg"), estrella: require("../../../assets/constelaciones/estrella-enigmia.png") },
  geografia: { fondo: require("../../../assets/constelaciones/fondo-geografia.jpg"), estrella: require("../../../assets/constelaciones/estrella-geografia.png") },
  quimia: { fondo: require("../../../assets/constelaciones/fondo-quimia.jpg"), estrella: require("../../../assets/constelaciones/estrella-quimia.png") },
  anatomia: { fondo: require("../../../assets/constelaciones/fondo-anatomia.jpg"), estrella: require("../../../assets/constelaciones/estrella-anatomia.png") },
  melodia: { fondo: require("../../../assets/constelaciones/fondo-melodia.jpg"), estrella: require("../../../assets/constelaciones/estrella-melodia.png") },
  trigonometria: { fondo: require("../../../assets/constelaciones/fondo-trigonometria.jpg"), estrella: require("../../../assets/constelaciones/estrella-trigonometria.png") },
  historia: { fondo: require("../../../assets/constelaciones/fondo-historia.jpg"), estrella: require("../../../assets/constelaciones/estrella-historia.png") },
  calculia: { fondo: require("../../../assets/constelaciones/fondo-calculia.jpg"), estrella: require("../../../assets/constelaciones/estrella-calculia.png") },
  circuitia: { fondo: require("../../../assets/constelaciones/fondo-circuitia.jpg"), estrella: require("../../../assets/constelaciones/estrella-circuitia.png") },
  estadistica: { fondo: require("../../../assets/constelaciones/fondo-estadistica.jpg"), estrella: require("../../../assets/constelaciones/estrella-estadistica.png") },
  naipia: { fondo: require("../../../assets/constelaciones/fondo-naipia.jpg"), estrella: require("../../../assets/constelaciones/estrella-naipia.png") },
  codia: { fondo: require("../../../assets/constelaciones/fondo-codia.jpg"), estrella: require("../../../assets/constelaciones/estrella-codia.png") },
  dinamia: { fondo: require("../../../assets/constelaciones/fondo-dinamia.jpg"), estrella: require("../../../assets/constelaciones/estrella-dinamia.png") },
  vitalia: { fondo: require("../../../assets/constelaciones/fondo-vitalia.jpg"), estrella: require("../../../assets/constelaciones/estrella-vitalia.png") },
};

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
  // Festividades: las estrellas encendidas toman la forma y el color de la fecha.
  const tema = useTemaHoy();
  const piel = capaVisible(tema, "constelacion") ? tema?.tema.constelacion : undefined;
  const brillo = piel?.color ?? m?.neon ?? color.primarioNeon;
  const fondo = oscurecer(m?.base ?? color.primarioBase, 0.22);
  const polvo = useMemo(() => polvoDeEstrellas(mundo), [mundo]);
  const id = `cielo-${mundo}`;
  const pintada = PINTADAS[mundo];

  return (
    <View style={{ width: tam, height: tam, borderRadius: radio, overflow: "hidden", backgroundColor: color.bgHondo }}>
      {pintada && <Image source={pintada.fondo} style={{ position: "absolute", width: tam, height: tam }} contentFit="cover" />}
      <Svg width={tam} height={tam} viewBox="-6 -6 112 112">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="35%" r="75%">
            <Stop offset="0" stopColor={fondo} />
            <Stop offset="1" stopColor={color.bgHondo} />
          </RadialGradient>
          {forma.lineas.map(([a, b], i) => (
            <LinearGradient key={i} id={`${id}rayo${i}`} gradientUnits="userSpaceOnUse" x1={forma.puntos[a][0]} y1={forma.puntos[a][1]} x2={forma.puntos[b][0]} y2={forma.puntos[b][1]}>
              <Stop offset="0" stopColor="#FFFFFF" />
              <Stop offset="0.5" stopColor={brillo} />
              <Stop offset="1" stopColor="#FFFFFF" />
            </LinearGradient>
          ))}
        </Defs>
        {!pintada && <Rect x={-6} y={-6} width={112} height={112} fill={`url(#${id})`} />}
        {!pintada &&
          polvo.map(([x, y, r], i) => (
            <Circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={0.25} />
          ))}
        {/* Guía tenue de la forma, para que se lea desde el principio. */}
        {forma.lineas.map(([a, b], i) =>
          completa ? (
            <G key={`g${i}`}>
              {capasRayo(brillo, `${id}rayo${i}`).map((capa, k) => (
                <Line key={k} x1={forma.puntos[a][0]} y1={forma.puntos[a][1]} x2={forma.puntos[b][0]} y2={forma.puntos[b][1]} stroke={capa.stroke} strokeOpacity={capa.op} strokeWidth={capa.ancho} strokeLinecap="round" />
              ))}
            </G>
          ) : (
            <Line key={`g${i}`} x1={forma.puntos[a][0]} y1={forma.puntos[a][1]} x2={forma.puntos[b][0]} y2={forma.puntos[b][1]} stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={0.8} strokeDasharray="2 3" />
          )
        )}
        {trazo && forma.lineas.map(([a, b], i) => <Trazo key={`t${i}`} a={forma.puntos[a]} b={forma.puntos[b]} i={i} total={forma.lineas.length} trazo={trazo} c={brillo} rayo={`${id}rayo${i}`} />)}
        {forma.puntos.map((p, i) =>
          encendido ? (
            <EstrellaQueSeEnciende key={i} p={p} i={i} encendido={encendido} c={brillo} />
          ) : i < estrellas || completa ? (
            piel ? <EstrellaTema key={i} p={p} tipo={piel.estrella} c={brillo} /> : pintada ? <ImagenSvg key={i} href={pintada.estrella} x={p[0] - 13} y={p[1] - 13} width={26} height={26} /> : <Circle key={i} cx={p[0]} cy={p[1]} r={3.6} fill={brillo} />
          ) : (
            <Circle key={i} cx={p[0]} cy={p[1]} r={2.4} fill="none" stroke={brillo} strokeOpacity={0.45} strokeWidth={1} />
          )
        )}
        {/* Halo de las encendidas. */}
        {!encendido &&
          !pintada &&
          forma.puntos.map((p, i) => (i < estrellas || completa ? <Circle key={`h${i}`} cx={p[0]} cy={p[1]} r={7} fill={brillo} opacity={0.18} /> : null))}
      </Svg>
    </View>
  );
}
