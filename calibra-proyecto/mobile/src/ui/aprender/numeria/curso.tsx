import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown, LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";
import {
  areaTriangulo,
  decimal,
  distributiva,
  ecuacion,
  exponentes,
  expresionTex,
  metodoFraccion,
  pitagorasCuadrados,
  porcentaje,
  raiz,
  rectangulo,
  sumaAngulos,
  terminosSemejantes,
  volumen,
  type PasoCurso,
} from "@/lib/numeria/cursoDatos";
import type {
  VisualNumeriaDecimal,
  VisualNumeriaDistributiva,
  VisualNumeriaEcuacion,
  VisualNumeriaExponentes,
  VisualNumeriaFigura,
  VisualNumeriaMetodoFraccion,
  VisualNumeriaPorcentaje,
  VisualNumeriaRaiz,
  VisualNumeriaTerminos,
} from "@/lib/numeria/visuales";
import { color, fuente } from "~/tema";
import Texto from "../../Texto";
import { latexAUnicode } from "../../TextoMate";
import { Aparece, BORDE, FG, FONDO, GAparece, Marco, mezcla, SECUNDARIO, SUPERFICIE, T, TrazoDibujado } from "../comun";
import { useReproductor } from "../reproductor";

// Visuales del curso completo de Numeria (2026-10-06), igual que
// components/numeria/visuales/Curso.tsx y FiguraCurso.tsx de la web: una figura
// animada por método más el pizarrón con los pasos. Los números salen de
// @/lib/numeria/cursoDatos.
const COLOR_NUMERIA = "#6C4CF1";
const C1 = "#4FE0F5";
const C2 = "#FF8A3D";
const C3 = "#3DDC97";

function Pizarra({ pasos, paso }: { pasos: PasoCurso[]; paso: number }) {
  const visibles = pasos.slice(0, Math.max(1, paso));
  return (
    <View style={{ gap: 6, alignSelf: "stretch" }}>
      {visibles.map((p, i) => {
        const actual = i === visibles.length - 1;
        return (
          <Animated.View key={i} entering={FadeInDown.duration(300)} style={[styles.renglon, actual ? { borderColor: mezcla(COLOR_NUMERIA, 60), backgroundColor: mezcla(COLOR_NUMERIA, 10) } : { opacity: 0.75 }]}>
            <Texto v="fuerte" tam={16} centro>
              {latexAUnicode(p.tex)}
            </Texto>
            {actual ? (
              <Texto v="nota" tam={12} centro>
                {p.nota}
              </Texto>
            ) : null}
          </Animated.View>
        );
      })}
    </View>
  );
}

function Lienzo({ ancho, alto, max = 380, children }: { ancho: number; alto: number; max?: number; children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const w = Math.min(max, width - 64);
  return (
    <Svg width={w} height={(w * alto) / ancho} viewBox={`0 0 ${ancho} ${alto}`} style={{ alignSelf: "center" }}>
      {children}
    </Svg>
  );
}

function FraccionSvg({ x, y, n, d, c = FG, tam = 22 }: { x: number; y: number; n: number | string; d: number | string; c?: string; tam?: number }) {
  return (
    <G>
      <SvgText x={x} y={y - 8} textAnchor="middle" fontSize={tam} fontWeight="800" fill={c}>
        {String(n)}
      </SvgText>
      <Line x1={x - tam * 0.8} y1={y} x2={x + tam * 0.8} y2={y} stroke={c} strokeWidth={2} />
      <SvgText x={x} y={y + tam + 2} textAnchor="middle" fontSize={tam} fontWeight="800" fill={c}>
        {String(d)}
      </SvgText>
    </G>
  );
}

const linea = (x1: number, y1: number, x2: number, y2: number) => `M${x1} ${y1} L${x2} ${y2}`;
const largo = (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x2 - x1, y2 - y1);

function Etiqueta({ x, y, texto, c, visible, tam = 14 }: { x: number; y: number; texto: string; c: string; visible: boolean; tam?: number }) {
  return (
    <GAparece visible={visible} ms={350}>
      <SvgText x={x} y={y} textAnchor="middle" fontSize={tam} fontWeight="800" fill={c}>
        {texto}
      </SvgText>
    </GAparece>
  );
}

// Barra partida en `den` piezas con `num` pintadas (varias si num > den).
function Barra({ num, den, c, visible = true }: { num: number; den: number; c: string; visible?: boolean }) {
  const barras = Math.max(1, Math.ceil(num / den));
  return (
    <Aparece visible opacidad={visible ? 1 : 0.15} estilo={{ gap: 6, alignItems: "center" }}>
      {Array.from({ length: barras }, (_, bi) => (
        <View key={bi} style={[styles.barra, { borderColor: COLOR_NUMERIA }]}>
          {Array.from({ length: den }, (_, i) => (
            <View key={i} style={{ flex: 1, borderRightWidth: i < den - 1 ? 1 : 0, borderColor: BORDE, backgroundColor: bi * den + i < num ? c : "transparent" }} />
          ))}
        </View>
      ))}
    </Aparece>
  );
}

// ---------- Fracciones: todos los métodos ----------
export function MetodoFraccion({ visual }: { visual: VisualNumeriaMetodoFraccion }) {
  const datos = metodoFraccion({ modo: visual.modo, fracciones: visual.fracciones, operacion: visual.operacion, factor: visual.factor });
  const r = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2600, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  const [[a, b], [c, d] = [0, 1]] = datos.fracciones;
  const [rn, rd] = datos.resultado;
  const fin = p >= datos.pasos.length;
  const op = visual.operacion === "resta" ? "−" : "+";
  let figura: React.ReactNode = null;

  if (visual.modo === "carita" || visual.modo === "cruz") {
    const carita = visual.modo === "carita";
    const nParcial = carita ? datos.productos[0] + (visual.operacion === "resta" ? -datos.productos[1] : datos.productos[1]) : datos.productos[0];
    const dParcial = carita ? datos.productos[2] : datos.productos[1];
    figura = (
      <Lienzo ancho={360} alto={195}>
        <FraccionSvg x={100} y={92} n={a} d={b} />
        <SvgText x={155} y={100} textAnchor="middle" fontSize={24} fontWeight="800" fill={COLOR_NUMERIA}>
          {carita ? op : "÷"}
        </SvgText>
        <FraccionSvg x={210} y={92} n={c} d={d} />
        <TrazoDibujado d={linea(108, 74, 200, 110)} largo={largo(108, 74, 200, 110)} visible={p >= 2} stroke={C1} strokeWidth={2.5} strokeLinecap="round" />
        <TrazoDibujado d={linea(108, 110, 200, 74)} largo={largo(108, 110, 200, 74)} visible={p >= 3} stroke={C2} strokeWidth={2.5} strokeLinecap="round" />
        {carita ? (
          <>
            <GAparece visible={p >= 2}>
              <Circle cx={70} cy={40} r={16} fill="none" stroke={C1} strokeWidth={2.5} />
              <SvgText x={70} y={45} textAnchor="middle" fontSize={14} fontWeight="800" fill={C1}>
                {String(datos.productos[0])}
              </SvgText>
            </GAparece>
            <GAparece visible={p >= 3}>
              <Circle cx={240} cy={40} r={16} fill="none" stroke={C2} strokeWidth={2.5} />
              <SvgText x={240} y={45} textAnchor="middle" fontSize={14} fontWeight="800" fill={C2}>
                {String(datos.productos[1])}
              </SvgText>
            </GAparece>
            <TrazoDibujado d="M88 150 Q155 205 222 150" largo={160} visible={p >= 4} fill="none" stroke={C3} strokeWidth={3} strokeLinecap="round" />
            <Etiqueta x={155} y={190} texto={String(datos.productos[2])} c={C3} visible={p >= 4} />
          </>
        ) : (
          <>
            <Etiqueta x={154} y={40} texto={`${a}×${d} = ${datos.productos[0]}`} c={C1} visible={p >= 2} />
            <Etiqueta x={154} y={160} texto={`${b}×${c} = ${datos.productos[1]}`} c={C2} visible={p >= 3} />
          </>
        )}
        <GAparece visible={p >= (carita ? 5 : 4)}>
          <SvgText x={258} y={100} fontSize={22} fontWeight="800" fill={COLOR_NUMERIA}>
            =
          </SvgText>
          <FraccionSvg x={312} y={92} n={fin ? rn : nParcial} d={fin ? rd : dParcial} c={COLOR_NUMERIA} />
        </GAparece>
      </Lienzo>
    );
  } else if (visual.modo === "oreja") {
    figura = (
      <Lienzo ancho={340} alto={200}>
        <SvgText x={120} y={36} textAnchor="middle" fontSize={22} fontWeight="800" fill={FG}>
          {String(a)}
        </SvgText>
        <Line x1={102} y1={46} x2={138} y2={46} stroke={FG} strokeWidth={2} />
        <SvgText x={120} y={72} textAnchor="middle" fontSize={22} fontWeight="800" fill={FG}>
          {String(b)}
        </SvgText>
        <Line x1={84} y1={92} x2={156} y2={92} stroke={COLOR_NUMERIA} strokeWidth={3.5} />
        <SvgText x={120} y={128} textAnchor="middle" fontSize={22} fontWeight="800" fill={FG}>
          {String(c)}
        </SvgText>
        <Line x1={102} y1={138} x2={138} y2={138} stroke={FG} strokeWidth={2} />
        <SvgText x={120} y={164} textAnchor="middle" fontSize={22} fontWeight="800" fill={FG}>
          {String(d)}
        </SvgText>
        <TrazoDibujado d="M134 28 C210 20 210 170 134 160" largo={260} visible={p >= 2} fill="none" stroke={C1} strokeWidth={3} strokeLinecap="round" />
        <TrazoDibujado d="M134 66 C170 72 170 116 134 122" largo={110} visible={p >= 3} fill="none" stroke={C2} strokeWidth={3} strokeLinecap="round" />
        <Etiqueta x={240} y={60} texto={`${a}×${d} = ${datos.productos[0]}`} c={C1} visible={p >= 2} tam={13} />
        <Etiqueta x={240} y={130} texto={`${b}×${c} = ${datos.productos[1]}`} c={C2} visible={p >= 3} tam={13} />
        <GAparece visible={p >= 4}>
          <FraccionSvg x={305} y={100} n={fin ? rn : datos.productos[0]} d={fin ? rd : datos.productos[1]} c={COLOR_NUMERIA} />
        </GAparece>
      </Lienzo>
    );
  } else if (visual.modo === "multiplicar") {
    const [k1, k2] = datos.factores ?? [1, 1];
    figura = (
      <Lienzo ancho={360} alto={170}>
        <FraccionSvg x={90} y={80} n={a} d={b} />
        <SvgText x={145} y={88} textAnchor="middle" fontSize={22} fontWeight="800" fill={COLOR_NUMERIA}>
          ×
        </SvgText>
        <FraccionSvg x={200} y={80} n={c} d={d} />
        {k1 > 1 && <TrazoDibujado d={linea(98, 62, 192, 98)} largo={largo(98, 62, 192, 98)} visible={p >= 2} stroke={C1} strokeWidth={1.5} />}
        {k2 > 1 && <TrazoDibujado d={linea(98, 98, 192, 62)} largo={largo(98, 98, 192, 62)} visible={p >= 2} stroke={C2} strokeWidth={1.5} />}
        {k1 > 1 && <Etiqueta x={90} y={36} texto={String(a / k1)} c={C1} visible={p >= 2} tam={13} />}
        {k1 > 1 && <Etiqueta x={200} y={142} texto={String(d / k1)} c={C1} visible={p >= 2} tam={13} />}
        {k2 > 1 && <Etiqueta x={200} y={36} texto={String(c / k2)} c={C2} visible={p >= 2} tam={13} />}
        {k2 > 1 && <Etiqueta x={90} y={142} texto={String(b / k2)} c={C2} visible={p >= 2} tam={13} />}
        <GAparece visible opacidad={fin ? 1 : 0.15}>
          <SvgText x={250} y={88} fontSize={22} fontWeight="800" fill={COLOR_NUMERIA}>
            =
          </SvgText>
          <FraccionSvg x={305} y={80} n={rn} d={rd} c={COLOR_NUMERIA} />
        </GAparece>
      </Lienzo>
    );
  } else if (visual.modo === "mcmVarias") {
    const fs = datos.fracciones;
    const ancho = 320 / fs.length;
    figura = (
      <Lienzo ancho={360} alto={200}>
        <Etiqueta x={180} y={20} texto={`MCM = ${datos.mcm}`} c={C3} visible={p >= 2} />
        {fs.map((fx, i) => {
          const x = 30 + ancho * i + ancho / 2;
          return (
            <G key={i}>
              <FraccionSvg x={x} y={56} n={fx[0]} d={fx[1]} tam={20} />
              <TrazoDibujado d={linea(x, 86, x, 120)} largo={34} visible={p >= 3} stroke={C2} strokeWidth={1.5} />
              <Etiqueta x={x + 18} y={108} texto={`×${datos.factores?.[i]}`} c={C2} visible={p >= 3} tam={12} />
              <GAparece visible={p >= 3}>
                <FraccionSvg x={x} y={152} n={datos.productos[i]} d={datos.mcm ?? 1} c={C1} tam={18} />
              </GAparece>
            </G>
          );
        })}
      </Lienzo>
    );
  } else if (visual.modo === "amplificar" || visual.modo === "simplificar") {
    const k = datos.factores?.[0] ?? 1;
    const [n2, d2] = visual.modo === "amplificar" ? [a * k, b * k] : [rn, rd];
    figura = (
      <View style={{ gap: 10, alignSelf: "stretch" }}>
        <View style={styles.filaBarra}>
          <Texto v="fuerte" tam={15} style={{ width: 46 }} centro>
            {`${a}/${b}`}
          </Texto>
          <Barra num={a} den={b} c={C1} />
        </View>
        <View style={styles.filaBarra}>
          <Texto v="fuerte" tam={15} style={{ width: 46 }} centro>
            {`${n2}/${d2}`}
          </Texto>
          <Barra num={n2} den={d2} c={C2} visible={p >= 2} />
        </View>
        {p >= 3 && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <Texto v="fuerte" tam={13} c={color.correcto} centro>
              Las dos barras pintadas miden lo mismo.
            </Texto>
          </Animated.View>
        )}
      </View>
    );
  } else if (visual.modo === "igualDen") {
    figura = (
      <View style={{ gap: 8, alignSelf: "stretch" }}>
        <Barra num={a} den={b} c={C1} />
        <Barra num={c} den={d} c={C2} />
        <Barra num={datos.productos[0]} den={b} c={C3} visible={p >= 2} />
      </View>
    );
  } else if (visual.modo === "mixto") {
    figura = (
      <View style={{ gap: 8, alignSelf: "stretch" }}>
        <Barra num={a} den={b} c={C1} />
        {p >= 2 && (
          <Texto v="fuerte" tam={13} centro>
            {`${datos.entero} ${datos.entero === 1 ? "entero completo" : "enteros completos"} y ${datos.resto} ${datos.resto === 1 ? "pieza" : "piezas"} de ${b}`}
          </Texto>
        )}
      </View>
    );
  }

  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      {figura}
      <Pizarra pasos={datos.pasos} paso={p} />
    </Marco>
  );
}

// ---------- Decimales ----------
export function Decimal({ visual }: { visual: VisualNumeriaDecimal }) {
  const datos = decimal({ modo: visual.modo, a: visual.a, b: visual.b, operacion: visual.operacion, num: visual.num, den: visual.den });
  const r = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2400, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  const fin = p >= datos.pasos.length;
  let figura: React.ReactNode;
  if (datos.celdas) {
    const enteros = datos.celdas.filter((x) => x.posicion >= 0);
    const decs = datos.celdas.filter((x) => x.posicion < 0);
    const celda = (x: (typeof datos.celdas)[number], i: number) => (
      <Aparece key={x.posicion} visible opacidad={i < p ? 1 : 0.25} estilo={{ alignItems: "center", gap: 3 }}>
        <Texto v="micro" tam={8.5}>
          {x.nombre}
        </Texto>
        <View style={[styles.celda, i === p - 1 && { borderColor: COLOR_NUMERIA, backgroundColor: mezcla(COLOR_NUMERIA, 15) }]}>
          <Texto style={styles.digito}>{String(x.digito)}</Texto>
        </View>
      </Aparece>
    );
    figura = (
      <View style={{ flexDirection: "row", alignItems: "flex-end", alignSelf: "center", gap: 4 }}>
        {enteros.map((x, i) => celda(x, i))}
        <Texto style={[styles.digito, { color: color.logro, paddingBottom: 6 }]}>,</Texto>
        {decs.map((x, i) => celda(x, enteros.length + i))}
      </View>
    );
  } else if (datos.filas) {
    const op = visual.modo === "multiplicar" ? "×" : visual.operacion === "resta" ? "−" : "+";
    const filas = [...datos.filas, fin ? datos.resultado : ""];
    const ancho = Math.max(...filas.map((x) => x.length));
    figura = (
      <View style={{ alignSelf: "center", alignItems: "flex-end", gap: 2 }}>
        {filas.map((x, i) => (
          <Aparece key={i} visible={i < 2 || fin} estilo={{ flexDirection: "row", gap: 8 }}>
            <Texto style={[styles.digito, { color: COLOR_NUMERIA, width: 18 }]}>{i === 1 ? op : ""}</Texto>
            <Texto style={[styles.digito, i === 2 && { color: color.correcto }]}>{x.padStart(ancho, " ")}</Texto>
          </Aparece>
        ))}
        {visual.modo === "sumaResta" && (
          <Texto v="fuerte" tam={11} c={color.logro}>
            Comas alineadas
          </Texto>
        )}
      </View>
    );
  } else {
    figura = (
      <Animated.View key={p} entering={FadeInDown.duration(250)} style={{ flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "center" }}>
        <Texto style={styles.digito}>{`${visual.num}/${visual.den}`}</Texto>
        <Texto style={[styles.digito, { color: COLOR_NUMERIA }]}>=</Texto>
        <Texto style={[styles.digito, fin && { color: color.correcto }]}>{fin ? datos.resultado : datos.resultado.slice(0, Math.min(datos.resultado.length, 2 + Math.max(0, p - 2)))}</Texto>
      </Animated.View>
    );
  }
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      {figura}
      <Pizarra pasos={datos.pasos} paso={p} />
    </Marco>
  );
}

// ---------- Porcentajes ----------
function AnchoAnimado({ pct, fondo, opacidad = 1 }: { pct: number; fondo: string; opacidad?: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.set(withTiming(pct, { duration: 600 }));
  }, [pct, w]);
  const a = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return <Animated.View style={[{ height: "100%", backgroundColor: fondo, opacity: opacidad }, a]} />;
}

export function Porcentaje({ visual }: { visual: VisualNumeriaPorcentaje }) {
  const { width } = useWindowDimensions();
  const datos = porcentaje({ modo: visual.modo, porcentaje: visual.porcentaje, base: visual.base, tipo: visual.tipoCambio });
  const r = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2400, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  let figura: React.ReactNode;
  if (visual.modo === "cuadricula") {
    const lado = Math.min(20, Math.floor((width - 90) / 10) - 2);
    figura = (
      <View style={{ alignSelf: "center", gap: 2 }}>
        {Array.from({ length: 10 }, (_, f) => (
          <View key={f} style={{ flexDirection: "row", gap: 2 }}>
            {Array.from({ length: 10 }, (_, c) => {
              const i = f * 10 + c;
              return <View key={c} style={{ width: lado, height: lado, borderRadius: 3, backgroundColor: i < datos.parte ? COLOR_NUMERIA : "rgba(127,127,127,0.15)" }} />;
            })}
          </View>
        ))}
      </View>
    );
  } else if (visual.modo === "de") {
    const decenas = Math.floor(datos.porcentaje / 10);
    const unidades = datos.porcentaje % 10;
    figura = (
      <View style={{ gap: 6, alignSelf: "stretch" }}>
        <View style={[styles.barraPct, { borderColor: COLOR_NUMERIA }]}>
          {Array.from({ length: 10 }, (_, i) => (
            <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "center", borderRightWidth: i < 9 ? 1 : 0, borderColor: BORDE, backgroundColor: p >= 4 && i < decenas ? C1 : p >= 2 && i === 0 ? mezcla(C1, 55) : "transparent" }}>
              <Texto v="fuerte" tam={8} c="#fff">
                10%
              </Texto>
            </View>
          ))}
        </View>
        <View style={[styles.barraPct, { width: "10%", height: 22, borderColor: BORDE }]}>
          {Array.from({ length: 10 }, (_, i) => (
            <View key={i} style={{ flex: 1, borderRightWidth: i < 9 ? 1 : 0, borderColor: BORDE, backgroundColor: p >= 4 && i < unidades ? C2 : p >= 3 && i === 0 ? mezcla(C2, 55) : "transparent" }} />
          ))}
        </View>
        <Texto v="nota" tam={11} centro>
          {`${datos.base} = 100 % · cada cuadro grande es 10 %`}
        </Texto>
      </View>
    );
  } else {
    const aumento = (visual.tipoCambio ?? "aumento") === "aumento";
    const total = aumento ? 100 + datos.porcentaje : 100;
    figura = (
      <View style={{ gap: 4, alignSelf: "stretch" }}>
        <View style={[styles.barraPct, { borderColor: COLOR_NUMERIA }]}>
          <AnchoAnimado pct={((aumento ? 100 : 100 - (p >= 2 ? datos.porcentaje : 0)) / total) * 100} fondo={C1} />
          <AnchoAnimado pct={(p >= 2 ? datos.porcentaje / total : 0) * 100} fondo={aumento ? C3 : C2} opacidad={aumento ? 1 : 0.35} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Texto v="nota" tam={11}>{`${datos.base} (100 %)`}</Texto>
          <Texto v="fuerte" tam={11} c={aumento ? C3 : C2}>{`${aumento ? "+" : "−"}${datos.porcentaje} %`}</Texto>
        </View>
      </View>
    );
  }
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      {figura}
      <Pizarra pasos={datos.pasos} paso={p} />
    </Marco>
  );
}

// ---------- Leyes de los exponentes ----------
function Ficha({ base, c, tachada = false }: { base: number; c: string; tachada?: boolean }) {
  return (
    <Animated.View layout={LinearTransition.duration(400)} entering={FadeInDown.duration(250)} style={[styles.ficha, { borderColor: c, backgroundColor: mezcla(c, 14), opacity: tachada ? 0.3 : 1 }]}>
      <Texto style={[styles.mono, { fontSize: 15 }]}>{String(base)}</Texto>
      {tachada ? <View style={styles.tachon} /> : null}
    </Animated.View>
  );
}

export function Exponentes({ visual }: { visual: VisualNumeriaExponentes }) {
  const datos = exponentes(visual.ley, visual.base, visual.m, visual.n);
  const r = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2600, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  let figura: React.ReactNode;
  if (datos.ley === "producto") {
    const junto = p >= 3;
    figura = (
      <View style={[styles.fichas, { gap: junto ? 4 : 14 }]}>
        <View style={[styles.fichas, { gap: 4 }]}>
          {Array.from({ length: datos.m }, (_, i) => (
            <Ficha key={`a${i}`} base={datos.base} c={C1} />
          ))}
        </View>
        <View style={[styles.fichas, { gap: 4 }]}>
          {Array.from({ length: datos.n }, (_, i) => (
            <Ficha key={`b${i}`} base={datos.base} c={C2} />
          ))}
        </View>
      </View>
    );
  } else if (datos.ley === "cociente" || datos.ley === "cero") {
    const tachar = p >= 2;
    figura = (
      <View style={{ alignItems: "center", gap: 6 }}>
        <View style={[styles.fichas, { gap: 4 }]}>
          {Array.from({ length: datos.m }, (_, i) => (
            <Ficha key={i} base={datos.base} c={C1} tachada={tachar && i < datos.n} />
          ))}
        </View>
        <View style={{ height: 2, alignSelf: "stretch", backgroundColor: FG, opacity: 0.6 }} />
        <View style={[styles.fichas, { gap: 4 }]}>
          {Array.from({ length: datos.n }, (_, i) => (
            <Ficha key={i} base={datos.base} c={C2} tachada={tachar} />
          ))}
        </View>
      </View>
    );
  } else {
    const cs = [C1, C2, C3, COLOR_NUMERIA];
    figura = (
      <View style={[styles.fichas, { gap: 10 }]}>
        {datos.grupos.map((g, gi) => (
          <Aparece key={gi} visible opacidad={p >= 2 || gi === 0 ? 1 : 0.2} estilo={[styles.grupo, { borderColor: cs[gi % 4] }]}>
            {Array.from({ length: g }, (_, i) => (
              <Ficha key={i} base={datos.base} c={cs[gi % 4]} />
            ))}
          </Aparece>
        ))}
      </View>
    );
  }
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      {figura}
      <Pizarra pasos={datos.pasos} paso={p} />
    </Marco>
  );
}

// ---------- Raíz cuadrada ----------
export function Raiz({ visual }: { visual: VisualNumeriaRaiz }) {
  const datos = raiz(visual.n);
  const r = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2600, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  const lado = datos.arriba;
  const celda = Math.max(10, Math.min(22, Math.floor(220 / lado)));
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <View style={{ alignSelf: "center", gap: 2 }}>
        {Array.from({ length: lado }, (_, fila) => (
          <View key={fila} style={{ flexDirection: "row", gap: 2 }}>
            {Array.from({ length: lado }, (_, col) => {
              const enAbajo = fila < datos.abajo && col < datos.abajo;
              const extra = enAbajo ? -1 : col === datos.abajo && fila < datos.abajo ? fila : fila === datos.abajo ? datos.abajo + col : -1;
              const lleno = enAbajo || (extra >= 0 && extra < datos.n - datos.abajo * datos.abajo);
              return <View key={col} style={{ width: celda, height: celda, borderRadius: 3, opacity: p >= 2 || datos.exacta ? 1 : 0.25, backgroundColor: !lleno ? "rgba(127,127,127,0.12)" : enAbajo ? C1 : C2 }} />;
            })}
          </View>
        ))}
      </View>
      <Texto v="fuerte" tam={13} centro>
        {datos.exacta ? `Lado: ${datos.abajo}` : `Entre ${datos.abajo} y ${datos.arriba} de lado`}
      </Texto>
      <Pizarra pasos={datos.pasos} paso={p} />
    </Marco>
  );
}

// ---------- Términos semejantes ----------
function FichaTermino({ coef, variable }: { coef: number; variable: string }) {
  const c = coef < 0 ? "#FF5D5D" : variable === "" ? C3 : variable === "x" ? C1 : C2;
  return (
    <Animated.View layout={LinearTransition.duration(400)} style={[styles.termino, { height: variable ? 46 : 32, borderColor: c, backgroundColor: mezcla(c, 14) }]}>
      <Texto style={[styles.mono, { fontSize: 14 }]}>{`${coef < 0 ? "−" : "+"}${Math.abs(coef) === 1 && variable ? "" : Math.abs(coef)}${variable}`}</Texto>
    </Animated.View>
  );
}

export function Terminos({ visual }: { visual: VisualNumeriaTerminos }) {
  const datos = terminosSemejantes(visual.terminos);
  const r = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2600, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      {p >= 2 ? (
        <View style={[styles.fichas, { gap: 12 }]}>
          {datos.grupos.map((g, gi) => (
            <View key={g.var || "num"} style={[styles.grupo, { flexDirection: "column", alignItems: "center", borderColor: BORDE, opacity: p >= 2 + gi ? 1 : 0.4 }]}>
              <View style={[styles.fichas, { gap: 4 }]}>
                {g.terminos.map((t, i) => (
                  <FichaTermino key={i} coef={t.coef} variable={t.var} />
                ))}
              </View>
              {p >= 2 + gi ? (
                <Animated.View entering={FadeInDown.duration(250)}>
                  <Texto v="fuerte" tam={13} c={color.correcto}>
                    {`= ${latexAUnicode(expresionTex([{ coef: g.total, var: g.var }]))}`}
                  </Texto>
                </Animated.View>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.fichas, { gap: 5 }]}>
          {datos.terminos.map((t, i) => (
            <FichaTermino key={i} coef={t.coef} variable={t.var} />
          ))}
        </View>
      )}
      <Pizarra pasos={datos.pasos} paso={p} />
    </Marco>
  );
}

// ---------- Propiedad distributiva ----------
export function Distributiva({ visual }: { visual: VisualNumeriaDistributiva }) {
  const datos = distributiva(visual.factor, visual.sumandos);
  const r = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2600, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  const cs = [C1, C2, C3];
  const anchos = datos.sumandos.map((t) => (t.var ? 100 : Math.max(36, Math.min(100, Math.abs(t.coef) * 18))));
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center" }}>
        <Texto style={[styles.mono, { color: COLOR_NUMERIA, fontSize: 18 }]}>{String(datos.factor)}</Texto>
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row" }}>
            {datos.sumandos.map((t, i) => (
              <Texto key={i} v="fuerte" tam={13} c={SECUNDARIO} centro style={{ width: anchos[i] }}>
                {latexAUnicode(expresionTex([t]))}
              </Texto>
            ))}
          </View>
          <View style={[styles.area, { borderColor: COLOR_NUMERIA }]}>
            {datos.sumandos.map((t, i) => (
              <Aparece key={i} visible opacidad={1} estilo={{ width: anchos[i], alignItems: "center", justifyContent: "center", borderRightWidth: i < datos.sumandos.length - 1 ? 2 : 0, borderStyle: "dashed", borderColor: mezcla(FG, 30), backgroundColor: p >= 2 ? mezcla(cs[i % 3], 35) : "transparent" }}>
                {p >= 2 ? (
                  <Texto v="fuerte" tam={14}>
                    {latexAUnicode(expresionTex([datos.productos[i]]))}
                  </Texto>
                ) : null}
              </Aparece>
            ))}
          </View>
        </View>
      </View>
      <Pizarra pasos={datos.pasos} paso={p} />
    </Marco>
  );
}

// ---------- Ecuación con x en los dos lados (balanza) ----------
export function Ecuacion({ visual }: { visual: VisualNumeriaEcuacion }) {
  const datos = ecuacion(visual.a, visual.b, visual.c, visual.d);
  const r = useReproductor({ total: datos?.etapas.length ?? 0, ms: 2800, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const etapa = datos.etapas[Math.min(datos.etapas.length, Math.max(1, r.paso)) - 1];
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={320} alto={60} max={340}>
        <Polygon points="160,24 146,58 174,58" fill={COLOR_NUMERIA} opacity={0.7} />
        <Line x1={30} y1={24} x2={290} y2={24} stroke={COLOR_NUMERIA} strokeWidth={4} strokeLinecap="round" />
      </Lienzo>
      <Animated.View key={r.paso} entering={FadeInDown.duration(350)} style={styles.platos}>
        <View style={[styles.plato, { borderColor: C1 }]}>
          <Texto v="fuerte" tam={17} centro>
            {latexAUnicode(expresionTex(etapa.izq))}
          </Texto>
        </View>
        <Texto v="fuerte" tam={20} c={COLOR_NUMERIA}>
          =
        </Texto>
        <View style={[styles.plato, { borderColor: C2 }]}>
          <Texto v="fuerte" tam={17} centro>
            {latexAUnicode(expresionTex(etapa.der))}
          </Texto>
        </View>
      </Animated.View>
      <Texto v="nota" tam={12} centro>
        {etapa.nota}
      </Texto>
      {r.paso >= datos.etapas.length ? (
        <T negrita c={color.correcto} centro>{`x = ${datos.x}`}</T>
      ) : null}
    </Marco>
  );
}

// ---------- Figuras del curso ----------
type Modo<M> = Extract<VisualNumeriaFigura, { modo: M }>;

function Notas({ lineas, paso }: { lineas: string[]; paso: number }) {
  return (
    <View style={{ gap: 4, alignItems: "center" }}>
      {lineas.slice(0, paso).map((l, i) => (
        <Animated.View key={i} entering={FadeInDown.duration(250)} style={i === paso - 1 ? styles.resaltado : { opacity: 0.75 }}>
          <T negrita={i === paso - 1} c={i === paso - 1 ? COLOR_NUMERIA : FG} centro>
            {l}
          </T>
        </Animated.View>
      ))}
    </View>
  );
}

function RectanguloFig({ visual }: { visual: Modo<"rectangulo"> }) {
  const d = rectangulo(visual.ancho, visual.alto);
  const r = useReproductor({ total: 3, ms: 2400, estatico: visual.estatico, inicio: 1 });
  const c = Math.max(14, Math.min(30, Math.floor(260 / Math.max(d.ancho, d.alto))));
  const w = d.ancho * c;
  const h = d.alto * c;
  const lineas = [`$\\text{lados: } ${d.ancho} \\text{ y } ${d.alto}$`, `$P = 2 \\times (${d.ancho} + ${d.alto}) = ${d.perimetro}$`, `$A = ${d.ancho} \\times ${d.alto} = ${d.area}$`];
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={w + 60} alto={h + 50} max={340}>
        <G x={30} y={24}>
          {Array.from({ length: d.ancho * d.alto }, (_, i) => (
            <Rect key={i} x={(i % d.ancho) * c + 1} y={Math.floor(i / d.ancho) * c + 1} width={c - 2} height={c - 2} rx={3} fill={r.paso >= 3 ? C1 : "rgba(127,127,127,0.12)"} />
          ))}
          <TrazoDibujado d={`M0 0 H${w} V${h} H0 Z`} largo={2 * (w + h)} visible={r.paso >= 2} ms={1200} fill="none" stroke={C2} strokeWidth={3} />
          <SvgText x={w / 2} y={-8} textAnchor="middle" fontSize={13} fontWeight="800" fill={FG}>
            {String(d.ancho)}
          </SvgText>
          <SvgText x={-12} y={h / 2 + 4} textAnchor="middle" fontSize={13} fontWeight="800" fill={FG}>
            {String(d.alto)}
          </SvgText>
        </G>
      </Lienzo>
      <Notas lineas={lineas} paso={r.paso} />
    </Marco>
  );
}

function AreaTrianguloFig({ visual }: { visual: Modo<"areaTriangulo"> }) {
  const d = areaTriangulo(visual.base, visual.altura);
  const r = useReproductor({ total: 3, ms: 2600, estatico: visual.estatico, inicio: 1 });
  const esc = Math.min(28, 260 / Math.max(d.base, d.altura));
  const w = d.base * esc;
  const h = d.altura * esc;
  const vx = w * 0.4;
  const lineas = [`$\\text{base } ${d.base}, \\text{ altura } ${d.altura}$`, `$\\text{rectángulo: } ${d.base} \\times ${d.altura} = ${d.rectangulo}$`, `$A = \\frac{${d.base} \\times ${d.altura}}{2} = ${String(d.area).replace(".", ",")}$`];
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={w + 52} alto={h + 44} max={340}>
        <G x={26} y={20}>
          <GAparece visible={r.paso >= 2}>
            <Rect x={0} y={0} width={w} height={h} fill={mezcla(C2, 20)} stroke={C2} strokeWidth={2} strokeDasharray="5 4" />
          </GAparece>
          <Polygon points={`0,${h} ${w},${h} ${vx},0`} fill={mezcla(C1, 40)} stroke={C1} strokeWidth={2.5} />
          <Line x1={vx} y1={0} x2={vx} y2={h} stroke={FG} strokeWidth={1.5} strokeDasharray="4 3" />
          <SvgText x={w / 2} y={h + 18} textAnchor="middle" fontSize={13} fontWeight="800" fill={FG}>
            {String(d.base)}
          </SvgText>
          <SvgText x={vx + 12} y={h / 2} fontSize={13} fontWeight="800" fill={FG}>
            {String(d.altura)}
          </SvgText>
        </G>
      </Lienzo>
      {r.paso >= 3 ? (
        <Texto v="fuerte" tam={12} c={C3} centro>
          El triángulo es la mitad del rectángulo
        </Texto>
      ) : null}
      <Notas lineas={lineas} paso={r.paso} />
    </Marco>
  );
}

function sector(cx: number, cy: number, rr: number, desde: number, hasta: number) {
  const p = (g: number) => [cx + rr * Math.cos((g * Math.PI) / 180), cy - rr * Math.sin((g * Math.PI) / 180)];
  const [x1, y1] = p(desde);
  const [x2, y2] = p(hasta);
  return `M${cx} ${cy} L${x1} ${y1} A${rr} ${rr} 0 ${hasta - desde > 180 ? 1 : 0} 0 ${x2} ${y2} Z`;
}

function SumaAngulosFig({ visual }: { visual: Modo<"sumaAngulos"> }) {
  const d = sumaAngulos(visual.a, visual.b);
  const r = useReproductor({ total: 3, ms: 2800, estatico: visual.estatico, inicio: 1 });
  if (d.c <= 0) return null;
  const L = 220;
  const ta = Math.tan((d.a * Math.PI) / 180);
  const tb = Math.tan((d.b * Math.PI) / 180);
  const px = (L * tb) / (ta + tb);
  const py = px * ta;
  const esc = Math.min(1, 150 / py);
  const A = [20, 170];
  const B = [20 + L * esc, 170];
  const P = [20 + px * esc, 170 - py * esc];
  const lineas = [`$\\hat{A} = ${d.a}°, \\ \\hat{B} = ${d.b}°$`, `$\\hat{A} + \\hat{B} + \\hat{C} = 180°$`, `$\\hat{C} = 180° - ${d.a}° - ${d.b}° = ${d.c}°$`];
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={360} alto={260}>
        <Polygon points={`${A} ${B} ${P}`} fill={mezcla(COLOR_NUMERIA, 14)} stroke={COLOR_NUMERIA} strokeWidth={2.5} />
        <Path d={sector(A[0], A[1], 26, 0, d.a)} fill={mezcla(C1, 70)} />
        <Path d={sector(B[0], B[1], 26, 180 - d.b, 180)} fill={mezcla(C2, 70)} />
        <Path d={sector(P[0], P[1], 22, 180 + d.a, 360 - d.b)} fill={mezcla(C3, r.paso >= 3 ? 85 : 25)} />
        <SvgText x={A[0] + 34} y={A[1] - 6} fontSize={12} fontWeight="800" fill={C1}>{`${d.a}°`}</SvgText>
        <SvgText x={B[0] - 56} y={B[1] - 6} fontSize={12} fontWeight="800" fill={C2}>{`${d.b}°`}</SvgText>
        <SvgText x={P[0] - 10} y={P[1] + 40} fontSize={12} fontWeight="800" fill={C3}>
          {r.paso >= 3 ? `${d.c}°` : "?"}
        </SvgText>
        <GAparece visible={r.paso >= 2}>
          <Line x1={210} y1={240} x2={350} y2={240} stroke={FG} strokeWidth={2} />
          <Path d={sector(280, 240, 40, 0, d.a)} fill={mezcla(C1, 70)} />
          <Path d={sector(280, 240, 40, d.a, d.a + d.c)} fill={mezcla(C3, 70)} />
          <Path d={sector(280, 240, 40, d.a + d.c, 180)} fill={mezcla(C2, 70)} />
          <SvgText x={280} y={192} textAnchor="middle" fontSize={11} fontWeight="700" fill={FG}>
            180°: una recta
          </SvgText>
        </GAparece>
      </Lienzo>
      <Notas lineas={lineas} paso={r.paso} />
    </Marco>
  );
}

function VolumenFig({ visual }: { visual: Modo<"volumen"> }) {
  const d = volumen(visual.largo, visual.ancho, visual.alto);
  const r = useReproductor({ total: d.alto + 2, ms: 1500, estatico: visual.estatico, inicio: 1 });
  const s = Math.max(10, Math.min(22, 120 / Math.max(d.largo, d.ancho, d.alto)));
  const iso = (x: number, y: number, z: number) => [160 + (x - y) * s * 0.87, 200 + (x + y) * s * 0.5 - z * s];
  const capas = Math.min(d.alto, Math.max(0, r.paso - 1));
  const cubos: { x: number; y: number; z: number }[] = [];
  for (let z = 0; z < capas; z++) for (let y = d.ancho - 1; y >= 0; y--) for (let x = d.largo - 1; x >= 0; x--) cubos.push({ x, y, z });
  cubos.sort((u, v) => u.z - v.z || v.x + v.y - (u.x + u.y));
  const cara = (pts: number[][], fill: string) => <Polygon points={pts.map((q) => q.join(",")).join(" ")} fill={fill} stroke="#0B1020" strokeWidth={0.8} />;
  const lineas = [`$\\text{caja de } ${d.largo} \\times ${d.ancho} \\times ${d.alto}$`, `$\\text{una capa: } ${d.largo} \\times ${d.ancho} = ${d.capa} \\text{ cubitos}$`, `$V = ${d.capa} \\times ${d.alto} = ${d.volumen}$`];
  const cuantas = r.paso >= d.alto + 1 ? 3 : r.paso >= 2 ? 2 : 1;
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={320} alto={240} max={340}>
        {cubos.map((q) => {
          const a = iso(q.x, q.y, q.z + 1);
          const b = iso(q.x + 1, q.y, q.z + 1);
          const c = iso(q.x + 1, q.y + 1, q.z + 1);
          const e = iso(q.x, q.y + 1, q.z + 1);
          const b0 = iso(q.x + 1, q.y, q.z);
          const c0 = iso(q.x + 1, q.y + 1, q.z);
          const e0 = iso(q.x, q.y + 1, q.z);
          return (
            <G key={`${q.x}-${q.y}-${q.z}`}>
              {cara([a, b, c, e], C1)}
              {cara([b, c, c0, b0], "#2BA9BD")}
              {cara([e, c, c0, e0], "#1F7E8E")}
            </G>
          );
        })}
      </Lienzo>
      <Notas lineas={lineas.slice(0, cuantas)} paso={cuantas} />
    </Marco>
  );
}

function PitagorasFig({ visual }: { visual: Modo<"pitagoras"> }) {
  const d = pitagorasCuadrados(visual.cateto1, visual.cateto2);
  const r = useReproductor({ total: 4, ms: 2600, estatico: visual.estatico, inicio: 1 });
  const esc = Math.min(16, 90 / Math.max(d.c1, d.c2));
  const a = d.c1 * esc;
  const b = d.c2 * esc;
  const O = [150, 170];
  const X = [O[0] + a, O[1]];
  const Y = [O[0], O[1] - b];
  const h = Math.hypot(a, b);
  const nx = b / h;
  const ny = a / h;
  const sq = (p: number[], q: number[], dx: number, dy: number) => `${p} ${q} ${q[0] + dx},${q[1] + dy} ${p[0] + dx},${p[1] + dy}`;
  const hTxt = Number.isInteger(d.h) ? String(d.h) : d.h.toFixed(2).replace(".", ",");
  const lineas = [`$\\text{catetos } ${d.c1} \\text{ y } ${d.c2}$`, `$${d.c1}^2 = ${d.a1}, \\quad ${d.c2}^2 = ${d.a2}$`, `$c^2 = ${d.a1} + ${d.a2} = ${d.h2}$`, `$c = \\sqrt{${d.h2}} = ${hTxt}$`];
  return (
    <Marco acento={COLOR_NUMERIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={340} alto={300} max={340}>
        <GAparece visible opacidad={r.paso >= 2 ? 1 : 0.1}>
          <Polygon points={sq(O, X, 0, a)} fill={mezcla(C1, 35)} stroke={C1} strokeWidth={2} />
          <Polygon points={sq(Y, O, -b, 0)} fill={mezcla(C2, 35)} stroke={C2} strokeWidth={2} />
        </GAparece>
        <GAparece visible opacidad={r.paso >= 3 ? 1 : 0.1}>
          <Polygon points={sq(X, Y, h * nx, -h * ny)} fill={mezcla(C3, 35)} stroke={C3} strokeWidth={2} />
        </GAparece>
        <Polygon points={`${O} ${X} ${Y}`} fill={mezcla(COLOR_NUMERIA, 35)} stroke={COLOR_NUMERIA} strokeWidth={2.5} />
        <SvgText x={O[0] + a / 2} y={O[1] + a / 2 + 4} textAnchor="middle" fontSize={12} fontWeight="800" fill={C1}>
          {String(d.a1)}
        </SvgText>
        <SvgText x={O[0] - b / 2} y={O[1] - b / 2 + 4} textAnchor="middle" fontSize={12} fontWeight="800" fill={C2}>
          {String(d.a2)}
        </SvgText>
        <SvgText x={(X[0] + Y[0]) / 2 + (h * nx) / 2} y={(X[1] + Y[1]) / 2 - (h * ny) / 2 + 4} textAnchor="middle" fontSize={12} fontWeight="800" fill={C3}>
          {r.paso >= 3 ? String(d.h2) : "?"}
        </SvgText>
      </Lienzo>
      <Notas lineas={lineas} paso={r.paso} />
    </Marco>
  );
}

export function FiguraCurso({ visual }: { visual: VisualNumeriaFigura }) {
  if (visual.modo === "rectangulo") return <RectanguloFig visual={visual} />;
  if (visual.modo === "areaTriangulo") return <AreaTrianguloFig visual={visual} />;
  if (visual.modo === "sumaAngulos") return <SumaAngulosFig visual={visual} />;
  if (visual.modo === "volumen") return <VolumenFig visual={visual} />;
  if (visual.modo === "pitagoras") return <PitagorasFig visual={visual} />;
  return null;
}

const styles = StyleSheet.create({
  renglon: { gap: 2, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: BORDE, backgroundColor: FONDO },
  barra: { flexDirection: "row", width: 260, height: 24, borderRadius: 6, borderWidth: 1, overflow: "hidden" },
  filaBarra: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center" },
  celda: { width: 40, height: 46, borderRadius: 8, borderWidth: 2, borderColor: BORDE, backgroundColor: SUPERFICIE, alignItems: "center", justifyContent: "center" },
  digito: { fontFamily: fuente.mono, fontSize: 24, color: FG },
  mono: { fontFamily: fuente.mono, color: FG },
  barraPct: { flexDirection: "row", height: 34, borderRadius: 8, borderWidth: 2, overflow: "hidden" },
  fichas: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center" },
  ficha: { width: 34, height: 34, borderRadius: 8, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  tachon: { position: "absolute", width: 38, height: 2, backgroundColor: color.error, transform: [{ rotate: "-45deg" }] },
  grupo: { flexDirection: "row", gap: 4, padding: 5, borderRadius: 12, borderWidth: 1, borderStyle: "dashed" },
  termino: { minWidth: 40, paddingHorizontal: 8, borderRadius: 8, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  area: { flexDirection: "row", height: 76, borderRadius: 8, borderWidth: 2, overflow: "hidden" },
  platos: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: -26 },
  plato: { flex: 1, minHeight: 46, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, borderWidth: 2, backgroundColor: SUPERFICIE, alignItems: "center", justifyContent: "center" },
  resaltado: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: mezcla(COLOR_NUMERIA, 14) },
});
