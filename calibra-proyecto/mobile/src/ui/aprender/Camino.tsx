import { memo, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { cancelAnimation, Easing, FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import type { GrupoLecciones, NodoLeccion } from "~/lib/aprender";
import { vibrar } from "~/lib/efectos";
import { useAnimacionActiva, useLiviano } from "~/lib/rendimiento";
import { brillo, color, conAlfa, fuente, type Mundo } from "~/tema";
import { IconoCandado, IconoCheck } from "../Iconos";
import Texto from "../Texto";
import { textoConFormulas } from "../TextoMate";

// El camino de Aprender como una RUTA, no como una fila de círculos: una carretera
// que serpentea por el paisaje del mundo (asfalto con bordes y línea central), el
// tramo ya recorrido iluminado con el color del mundo, faroles que se encienden al
// lado de cada lección completada, árboles y símbolos del mundo a los costados, un
// cartel al empezar cada tema, el viajero (tu marcador) esperando en la lección que
// toca y la bandera de meta al final.
// Rendimiento: todo el paisaje y la ruta son UN solo dibujo estático; lo único que
// se anima es el marcador de la lección activa (en el hilo nativo).

const NODO = 66;
const ALTO_NODO = 118;
const ALTO_CARTEL = 84;
const INICIO = 40;
const FINAL = 120;

type Item = { tipo: "cartel"; y: number; nombre: string; completos: number; total: number } | { tipo: "nodo"; y: number; x: number; nodo: NodoLeccion; k: number };

function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Curva suave que pasa por todos los puntos (Catmull-Rom → Bézier).
function curva(puntos: { x: number; y: number }[]): string {
  if (puntos.length === 0) return "";
  let d = `M${puntos[0].x} ${puntos[0].y}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[Math.max(0, i - 1)];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[Math.min(puntos.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

function armar(grupos: GrupoLecciones[], ancho: number) {
  const centro = ancho / 2;
  const amplitud = Math.min(ancho * 0.27, 120);
  const items: Item[] = [];
  let y = INICIO;
  let k = 0;
  for (const g of grupos) {
    items.push({ tipo: "cartel", y: y + 10, nombre: g.nombre, completos: g.nodos.filter((n) => n.estado === "completado").length, total: g.nodos.length });
    y += ALTO_CARTEL;
    for (const n of g.nodos) {
      const x = centro + amplitud * Math.sin(k * 0.95 + 0.4);
      items.push({ tipo: "nodo", y: y + NODO / 2, x, nodo: n, k });
      y += ALTO_NODO;
      k++;
    }
  }
  const alto = y + FINAL;
  const nodos = items.filter((i): i is Extract<Item, { tipo: "nodo" }> => i.tipo === "nodo");
  // La ruta entra por arriba al centro, pasa por cada lección y termina en la meta.
  const puntos = [{ x: centro, y: 0 }, ...nodos.map((n) => ({ x: n.x, y: n.y })), { x: centro, y: alto - 40 }];
  // Tramo recorrido: hasta la primera lección sin completar (o todo, si no queda ninguna).
  const primeraPendiente = nodos.findIndex((n) => n.nodo.estado !== "completado");
  const hasta = primeraPendiente === -1 ? puntos.length : primeraPendiente + 2;
  return { items, nodos, alto, centro, amplitud, ruta: curva(puntos), recorrido: curva(puntos.slice(0, hasta)), todoHecho: primeraPendiente === -1 };
}

// Paisaje a los costados de la ruta: árboles, faroles (encendidos junto a lo que ya
// completaste), rocas y los símbolos del mundo en carteles chicos.
function Paisaje({ nodos, ancho, centro, acento, glifos }: { nodos: ReturnType<typeof armar>["nodos"]; ancho: number; centro: number; acento: string; glifos: string[] }) {
  return (
    <G>
      {nodos.map((n) => {
        const lado = n.x > centro ? -1 : 1;
        const base = n.x + lado * (NODO / 2 + 46 + hash(n.k) * 26);
        const x = Math.max(18, Math.min(ancho - 18, base));
        const y = n.y + 8;
        const tipo = Math.floor(hash(n.k + 7) * 4);
        const encendido = n.nodo.estado === "completado";
        if (tipo === 0 || tipo === 3) {
          // Farol
          return (
            <G key={n.k}>
              {encendido && <Circle cx={x} cy={y - 34} r={20} fill={`url(#halo)`} />}
              <Line x1={x} y1={y} x2={x} y2={y - 32} stroke="#3A4466" strokeWidth={3} strokeLinecap="round" />
              <Path d={`M${x} ${y - 32} q 0 -6 8 -6`} stroke="#3A4466" strokeWidth={3} fill="none" strokeLinecap="round" />
              <Circle cx={x + 9} cy={y - 34} r={4.5} fill={encendido ? "#FFE7A3" : "#2A3150"} />
              <Rect x={x - 5} y={y - 1} width={10} height={4} rx={2} fill="#2A3150" />
            </G>
          );
        }
        if (tipo === 1) {
          // Árbol (pino de dos capas)
          const h = 26 + hash(n.k + 3) * 14;
          return (
            <G key={n.k}>
              <Rect x={x - 2.5} y={y - 8} width={5} height={10} rx={1.5} fill="#2B2236" />
              <Path d={`M${x} ${y - h} L${x + 14} ${y - 6} L${x - 14} ${y - 6} Z`} fill={conAlfa(acento, 0.32)} />
              <Path d={`M${x} ${y - h - 8} L${x + 10} ${y - h + 10} L${x - 10} ${y - h + 10} Z`} fill={conAlfa(acento, 0.45)} />
            </G>
          );
        }
        // Mojón con el símbolo del mundo
        const glifo = glifos[n.k % glifos.length];
        return (
          <G key={n.k}>
            <Rect x={x - 13} y={y - 26} width={26} height={26} rx={7} fill="#1A2140" stroke={conAlfa(acento, encendido ? 0.7 : 0.25)} strokeWidth={1.5} />
            <SvgText x={x} y={y - 8} fontSize={glifo.length > 2 ? 9 : 14} fontFamily={fuente.display} fill={encendido ? acento : "#5A6488"} textAnchor="middle">
              {glifo}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}

const Dibujo = memo(function Dibujo({ datos, ancho, mundo }: { datos: ReturnType<typeof armar>; ancho: number; mundo: Mundo }) {
  const { alto, ruta, recorrido, nodos, centro, todoHecho, items } = datos;
  return (
    <Svg width={ancho} height={alto} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={mundo.base} stopOpacity={0.1} />
          <Stop offset="1" stopColor={mundo.base} stopOpacity={0.02} />
        </LinearGradient>
        <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFE7A3" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#FFE7A3" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={ancho} height={alto} rx={22} fill="url(#cielo)" />
      {/* Bordes y asfalto de la ruta */}
      <Path d={ruta} stroke="#0B0F1E" strokeWidth={56} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d={ruta} stroke="#262E4D" strokeWidth={50} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d={ruta} stroke="#1B2238" strokeWidth={42} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Tramo recorrido: el asfalto se tiñe del color del mundo */}
      <Path d={recorrido} stroke={conAlfa(mundo.base, 0.45)} strokeWidth={42} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Línea central discontinua; en lo recorrido, dorada */}
      <Path d={ruta} stroke="#4A5578" strokeWidth={3} strokeDasharray="12 14" fill="none" strokeLinecap="round" />
      <Path d={recorrido} stroke={color.logro} strokeWidth={3} strokeDasharray="12 14" fill="none" strokeLinecap="round" />
      <Paisaje nodos={nodos} ancho={ancho} centro={centro} acento={mundo.neon} glifos={mundo.glifos} />
      {/* Carteles de cada tema (el texto va encima, en vistas) */}
      {items.map((it, i) =>
        it.tipo === "cartel" ? (
          <G key={`c${i}`}>
            <Line x1={centro} y1={it.y + 44} x2={centro} y2={it.y + 66} stroke="#3A4466" strokeWidth={4} strokeLinecap="round" />
          </G>
        ) : null
      )}
      {/* Meta */}
      <G>
        <Line x1={centro + 30} y1={alto - 20} x2={centro + 30} y2={alto - 78} stroke="#C9D3E6" strokeWidth={3} strokeLinecap="round" />
        {Array.from({ length: 12 }, (_, i) => (
          <Rect key={i} x={centro + 31 + (i % 4) * 7} y={alto - 78 + Math.floor(i / 4) * 7} width={7} height={7} fill={(i + Math.floor(i / 4)) % 2 === 0 ? (todoHecho ? color.logro : "#E8ECF6") : "#11152A"} />
        ))}
      </G>
    </Svg>
  );
});

// Marcador del viajero sobre la lección que toca: sube y baja, y el halo late.
function Viajero({ acento }: { acento: string }) {
  const activa = useAnimacionActiva();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!activa) {
      cancelAnimation(t);
      return;
    }
    t.set(withRepeat(withSequence(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) })), -1));
    return () => cancelAnimation(t);
  }, [activa, t]);
  const estiloPin = useAnimatedStyle(() => ({ transform: [{ translateY: -6 * t.value }] }));
  const estiloHalo = useAnimatedStyle(() => ({ opacity: 0.55 - t.value * 0.35, transform: [{ scale: 1 + t.value * 0.35 }] }));
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.halo, { borderColor: acento, boxShadow: brillo(acento, 22, 0.6) }, estiloHalo]} />
      <Animated.View pointerEvents="none" style={[styles.pin, estiloPin]}>
        <View style={[styles.globo, { backgroundColor: acento }]}>
          <Texto style={{ fontFamily: fuente.display, fontSize: 11, color: "#fff" }}>¡AQUÍ!</Texto>
        </View>
        <View style={[styles.punta, { borderTopColor: acento }]} />
      </Animated.View>
    </>
  );
}

function NodoCamino({ it, mundo, onPress }: { it: Extract<Item, { tipo: "nodo" }>; mundo: Mundo; onPress: (n: NodoLeccion) => void }) {
  const n = it.nodo;
  const hecho = n.estado === "completado";
  const activo = n.estado === "activo";
  const pro = n.bloqueadoPorPlan;
  const fondo = hecho ? mundo.base : activo ? mundo.neon : pro ? "#2A2210" : color.surface3;
  const borde = hecho ? conAlfa(mundo.neon, 0.9) : activo ? "#FFFFFF" : pro ? color.logro : color.border;
  return (
    <View style={[styles.nodoCaja, { left: it.x - 70, top: it.y - NODO / 2 }]}>
      {activo && <Viajero acento={mundo.neon} />}
      <Pressable
        onPress={() => {
          vibrar.seleccion();
          onPress(n);
        }}
        style={({ pressed }) => [
          styles.nodo,
          { backgroundColor: fondo, borderColor: borde, transform: [{ scale: pressed ? 0.92 : 1 }] },
          (hecho || activo) && { boxShadow: brillo(mundo.neon, activo ? 26 : 14, activo ? 0.6 : 0.35) },
        ]}
      >
        {hecho ? <IconoCheck tam={26} c="#fff" /> : activo ? <Texto style={{ fontFamily: fuente.display, fontSize: 24, color: "#fff" }}>{it.k + 1}</Texto> : pro ? <Texto style={{ fontFamily: fuente.display, fontSize: 12, color: color.logro }}>PRO</Texto> : <IconoCandado tam={20} c={color.texto2} />}
      </Pressable>
      <View style={[styles.etiqueta, (hecho || activo) && { borderColor: conAlfa(mundo.neon, 0.4) }]}>
        <Texto v="fuerte" tam={11.5} centro numberOfLines={2} c={n.estado === "bloqueado" && !pro ? color.texto2 : color.texto}>
          {textoConFormulas(n.nombre)}
        </Texto>
      </View>
    </View>
  );
}

export default function Camino({ grupos, mundo, onElegir }: { grupos: GrupoLecciones[]; mundo: Mundo; onElegir: (n: NodoLeccion) => void }) {
  const [ancho, setAncho] = useState(0);
  const liviano = useLiviano();
  const datos = useMemo(() => (ancho > 0 ? armar(grupos, ancho) : null), [grupos, ancho]);
  return (
    <View
      onLayout={(e: LayoutChangeEvent) => {
        const w = Math.round(e.nativeEvent.layout.width);
        if (w > 0 && w !== ancho) setAncho(w);
      }}
      style={{ height: datos?.alto ?? 400 }}
    >
      {datos && (
        <Animated.View entering={liviano ? undefined : FadeIn.duration(350)} style={StyleSheet.absoluteFill}>
          <Dibujo datos={datos} ancho={ancho} mundo={mundo} />
          {datos.items.map((it, i) =>
            it.tipo === "cartel" ? (
              <View key={`c${i}`} style={[styles.cartel, { top: it.y, borderColor: conAlfa(mundo.neon, 0.55) }]}>
                <Texto v="micro" c={mundo.neon} centro numberOfLines={1}>
                  {it.nombre}
                </Texto>
                <Texto v="mono" tam={10} c={color.texto2} centro>
                  {it.completos}/{it.total}
                </Texto>
              </View>
            ) : (
              <NodoCamino key={it.nodo.id} it={it} mundo={mundo} onPress={onElegir} />
            )
          )}
          <View style={[styles.meta, { top: datos.alto - 40 }]}>
            <Texto v="micro" c={datos.todoHecho ? color.logro : color.texto2}>
              {datos.todoHecho ? "¡Ruta completa!" : "Meta"}
            </Texto>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nodoCaja: { position: "absolute", width: 140, alignItems: "center" },
  nodo: { width: NODO, height: NODO, borderRadius: NODO / 2, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", top: 0, width: NODO, height: NODO, borderRadius: NODO / 2, borderWidth: 3 },
  pin: { position: "absolute", top: -34, alignItems: "center" },
  globo: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  punta: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 7, borderLeftColor: "transparent", borderRightColor: "transparent" },
  etiqueta: { marginTop: 6, maxWidth: 140, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: "rgba(12,16,32,0.92)", borderWidth: 1, borderColor: color.border },
  cartel: { position: "absolute", alignSelf: "center", left: "50%", marginLeft: -95, width: 190, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1.5, backgroundColor: "#141A33", gap: 1 },
  meta: { position: "absolute", left: 0, right: 0, alignItems: "center" },
});
