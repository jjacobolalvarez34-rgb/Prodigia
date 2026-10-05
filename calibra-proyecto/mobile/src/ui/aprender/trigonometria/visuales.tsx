import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown, useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Polyline, Rect, Text as SvgText } from "react-native-svg";
import type { TrianguloDiagrama } from "@/lib/practica/trigonometriaTipos";
import { OPERADOR_TEX } from "@/lib/trigonometria/exactos";
import { dec } from "@/lib/trigonometria/formato";
import { redondear } from "@/lib/trigonometria/triangulos";
import type {
  PasoOnda,
  VisualTrigonometriaCirculo,
  VisualTrigonometriaCuadrantes,
  VisualTrigonometriaEcuacion,
  VisualTrigonometriaIdentidad,
  VisualTrigonometriaLey,
  VisualTrigonometriaMano,
  VisualTrigonometriaOnda,
  VisualTrigonometriaResolver,
  VisualTrigonometriaTriangulo,
} from "@/lib/trigonometria/visuales";
import {
  VISTA_CIRCULO,
  VISTA_CUADRANTES,
  VISTA_ECUACION,
  VISTA_ECUACION_CIRCULO,
  VISTA_IDENTIDAD,
  VISTA_ONDA,
  datosCirculo,
  datosCuadrantes,
  datosEcuacion,
  datosIdentidad,
  datosOnda,
  datosResolver,
  datosTriangulo,
  decTex,
  esOndaJsonValida,
  type Rol,
} from "@/lib/trigonometria/visualesDatos";
import { arcoEnVertice, datosLey, VISTA_LEY, type DatosLey, type PuntoPx, type TrianguloLey } from "@/lib/trigonometria/visualesLey";
import { textosDe } from "~/lib/textosWeb";
import { color, fuente } from "~/tema";
import Texto from "../../Texto";
import { BORDE, FG, FONDO, Formula, GAparece, Leyenda, Marco, mezcla, SECUNDARIO, SUPERFICIE, T, TrazoDibujado } from "../comun";
import { useReproductor } from "../reproductor";

// Visuales de las lecciones de Trigonometría (components/trigonometria/visuales de
// la web). Toda la geometría sale de las mismas funciones (lib/trigonometria).
const COLOR_TRIGONOMETRIA = "#84CC16";
const COLOR_SENO = "#3B82F6";
const COLOR_COSENO = "#F59E0B";
const COLOR_TANGENTE = "#EC4899";
const COLOR_HIPOTENUSA = "#8B5CF6";
const COLOR_ALERTA = "#EF4444";
const SEP = ",";
const t = textosDe("Trigonometria.visuales");
const tMano = textosDe("Trigonometria.leccion.mano");

function intentar<R>(f: () => R): R | null {
  try {
    return f();
  } catch {
    return null;
  }
}

// Largo aproximado de un trazo "M x y L x y …" (para dibujarlo de a poco).
function largoDeRuta(d: string): number {
  const n = (d.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
  let l = 0;
  for (let i = 2; i + 1 < n.length; i += 2) l += Math.hypot(n[i] - n[i - 2], n[i + 1] - n[i - 1]);
  return Math.max(1, l * 1.05);
}

// Texto SVG con un borde del color de fondo (paint-order: stroke de la web).
function Halo({ x, y, children, fill = FG, tam = 11, ancla = "start", negrita = true }: { x: number; y: number; children: string; fill?: string; tam?: number; ancla?: "start" | "middle" | "end"; negrita?: boolean }) {
  const comun = { x, y, fontSize: tam, fontWeight: negrita ? ("700" as const) : ("400" as const), textAnchor: ancla };
  return (
    <G>
      <SvgText {...comun} fill={SUPERFICIE} stroke={SUPERFICIE} strokeWidth={3.5} strokeLinejoin="round">
        {children}
      </SvgText>
      <SvgText {...comun} fill={fill}>
        {children}
      </SvgText>
    </G>
  );
}

function Lienzo({ ancho, alto, max = 360, children, opacidad }: { ancho: number; alto: number; max?: number; children: React.ReactNode; opacidad?: number }) {
  const { width } = useWindowDimensions();
  const w = Math.min(max, width - 64);
  return (
    <Svg width={w} height={(w * alto) / ancho} viewBox={`0 0 ${ancho} ${alto}`} style={{ alignSelf: "center", opacity: opacidad }}>
      {children}
    </Svg>
  );
}

// ---------- Triángulo rectángulo de las lecciones (TrianguloSVG con resaltes) ----------
type ClaveLado = "ladoA" | "ladoB" | "ladoC";
const ANCHO_T = 300;
const ALTO_T = 220;
const r2 = (n: number) => Math.round(n * 100) / 100;
const formatoLado = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",");
const formatoAngulo = (g: number) => `${String(Math.round(g * 10) / 10).replace(".", ",")}°`;

function anguloDesdeLados(opuesto: number, l1: number, l2: number) {
  const c = (l1 * l1 + l2 * l2 - opuesto * opuesto) / (2 * l1 * l2);
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}

function alejar(p: PuntoPx, c: PuntoPx, d: number): PuntoPx {
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  const l = Math.hypot(dx, dy) || 1;
  return { x: r2(p.x + (dx / l) * d), y: r2(p.y + (dy / l) * d) };
}

function TrianguloLeccion({
  tri,
  resaltar,
  nombres,
  marcarAngulo,
  angulosIncognita,
}: {
  tri: TrianguloDiagrama;
  resaltar?: Partial<Record<ClaveLado, string>>;
  nombres?: Partial<Record<ClaveLado, string>>;
  marcarAngulo?: "A" | "B" | "C";
  angulosIncognita?: ("A" | "B" | "C")[];
}) {
  const { A, B, C } =
    tri.marcarRectoEn === "C"
      ? { A: { x: 0, y: 0 }, B: { x: r2(tri.ladoB), y: r2(tri.ladoA) }, C: { x: r2(tri.ladoB), y: 0 } }
      : (() => {
          const a = (anguloDesdeLados(tri.ladoA, tri.ladoB, tri.ladoC) * Math.PI) / 180;
          return { A: { x: 0, y: 0 }, B: { x: r2(tri.ladoC), y: 0 }, C: { x: r2(tri.ladoB * Math.cos(a)), y: r2(tri.ladoB * Math.sin(a)) } };
        })();
  const xs = [A.x, B.x, C.x];
  const ys = [A.y, B.y, C.y];
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const anchoReal = Math.max(...xs) - minX || 1;
  const altoReal = Math.max(...ys) - minY || 1;
  const padX = nombres ? 60 : 46;
  const escala = Math.min((ANCHO_T - padX * 2) / anchoReal, (ALTO_T - 80) / altoReal);
  const offX = (ANCHO_T - anchoReal * escala) / 2;
  const offY = (ALTO_T - altoReal * escala) / 2;
  const svg = (p: PuntoPx): PuntoPx => ({ x: r2(offX + (p.x - minX) * escala), y: r2(ALTO_T - offY - (p.y - minY) * escala) });
  const pA = svg(A);
  const pB = svg(B);
  const pC = svg(C);
  const centro = { x: (pA.x + pB.x + pC.x) / 3, y: (pA.y + pB.y + pC.y) / 3 };
  const ocultos = new Set([...(tri.ocultarLados ?? []), ...(tri.ocultar ? [tri.ocultar] : [])]);
  const omitidos = new Set(tri.omitirLados ?? []);
  const angulosOcultos = new Set(tri.ocultarAngulos ?? []);
  const incognita = new Set(angulosIncognita ?? []);
  const medio = (p: PuntoPx, q: PuntoPx) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
  const lados: { k: ClaveLado; desde: PuntoPx; hasta: PuntoPx; pos: PuntoPx }[] = [
    { k: "ladoA", desde: pB, hasta: pC, pos: alejar(medio(pB, pC), centro, nombres?.ladoA ? 20 : 15) },
    { k: "ladoB", desde: pA, hasta: pC, pos: alejar(medio(pA, pC), centro, nombres?.ladoB ? 20 : 15) },
    { k: "ladoC", desde: pA, hasta: pB, pos: alejar(medio(pA, pB), centro, nombres?.ladoC ? 20 : 15) },
  ];
  const vertices = [
    { n: "A" as const, p: pA, angulo: tri.anguloA },
    { n: "B" as const, p: pB, angulo: tri.anguloB },
    { n: "C" as const, p: pC, angulo: tri.anguloC },
  ];
  let recto: string | null = null;
  if (tri.marcarRectoEn) {
    const mapa = { A: pA, B: pB, C: pC };
    const v = mapa[tri.marcarRectoEn];
    const [o1, o2] = (["A", "B", "C"] as const).filter((k) => k !== tri.marcarRectoEn).map((k) => mapa[k]);
    const u = (h: PuntoPx) => {
      const l = Math.hypot(h.x - v.x, h.y - v.y) || 1;
      return { x: (h.x - v.x) / l, y: (h.y - v.y) / l };
    };
    const u1 = u(o1);
    const u2 = u(o2);
    recto = `${v.x + u1.x * 14},${v.y + u1.y * 14} ${v.x + (u1.x + u2.x) * 14},${v.y + (u1.y + u2.y) * 14} ${v.x + u2.x * 14},${v.y + u2.y * 14}`;
  }
  const conResaltado = resaltar !== undefined;
  const arco = marcarAngulo === "A" ? arcoEnVertice(pA, pB, pC, 26) : marcarAngulo === "B" ? arcoEnVertice(pB, pA, pC, 26) : marcarAngulo === "C" ? arcoEnVertice(pC, pA, pB, 26) : null;
  return (
    <Lienzo ancho={ANCHO_T} alto={ALTO_T} max={320}>
      <Polygon points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`} fill={mezcla(COLOR_TRIGONOMETRIA, 10)} stroke={conResaltado ? "none" : COLOR_TRIGONOMETRIA} strokeWidth={2.5} strokeLinejoin="round" />
      {conResaltado &&
        lados.map(({ k, desde, hasta }) => (
          <Line key={k} x1={desde.x} y1={desde.y} x2={hasta.x} y2={hasta.y} stroke={resaltar?.[k] ?? COLOR_TRIGONOMETRIA} strokeWidth={resaltar?.[k] ? 5 : 2.5} strokeLinecap="round" opacity={resaltar?.[k] ? 1 : 0.55} />
        ))}
      {arco && <Path d={arco} fill="none" stroke={FG} strokeWidth={2} />}
      {recto && <Polyline points={recto} fill="none" stroke={COLOR_TRIGONOMETRIA} strokeWidth={1.5} />}
      {lados.map(({ k, pos }) => {
        if (omitidos.has(k)) return null;
        const texto = ocultos.has(k) ? "?" : formatoLado(tri[k]);
        const nombre = nombres?.[k];
        const c = resaltar?.[k] ?? FG;
        return (
          <G key={k}>
            {nombre ? (
              <SvgText x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize={10} fontWeight="600" fill={c}>
                {nombre}
              </SvgText>
            ) : null}
            <SvgText x={pos.x} y={nombre ? pos.y + 10 : pos.y + 4} textAnchor="middle" fontSize={13} fontWeight="700" fontFamily={fuente.mono} fill={c}>
              {texto}
            </SvgText>
          </G>
        );
      })}
      {vertices.map(({ n, p, angulo }) => {
        const pos = alejar(p, centro, 20);
        const conValor = !angulosOcultos.has(n) && n !== tri.marcarRectoEn;
        return (
          <SvgText key={n} x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={11} fontWeight="600" fill={COLOR_TRIGONOMETRIA}>
            {incognita.has(n) ? `${n} (?)` : conValor ? `${n} (${formatoAngulo(angulo)})` : n}
          </SvgText>
        );
      })}
    </Lienzo>
  );
}

// ---------- Triángulo con sus razones ----------
const COLOR_ROL: Record<Rol, string> = { opuesto: COLOR_SENO, adyacente: COLOR_COSENO, hipotenusa: COLOR_HIPOTENUSA };
const CLAVE = { a: "ladoA", b: "ladoB", c: "ladoC" } as const;

export function Triangulo({ visual }: { visual: VisualTrigonometriaTriangulo }) {
  const datos = useMemo(() => intentar(() => datosTriangulo(visual)), [visual]);
  const total = datos?.pasos.length ?? 0;
  const r = useReproductor({ total, ms: 2600, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos || total === 0) return null;
  const actual = datos.pasos[Math.max(0, r.paso - 1)];
  const nombrados = new Set<Rol>();
  for (const p of datos.pasos.slice(0, r.paso)) p.resaltar.forEach((x) => nombrados.add(x));
  const resaltar: Partial<Record<ClaveLado, string>> = {};
  const nombres: Partial<Record<ClaveLado, string>> = {};
  for (const l of ["a", "b", "c"] as const) {
    const rol = datos.rolDe[l];
    if (actual.resaltar.includes(rol)) resaltar[CLAVE[l]] = COLOR_ROL[rol];
    if (nombrados.has(rol)) nombres[CLAVE[l]] = t(`roles.${rol}`);
  }
  let leyenda: string;
  let formula: string | null = null;
  if (actual.razon) {
    const z = actual.razon;
    const exacto = Math.abs(redondear(z.valor, 2) - z.valor) < 1e-9;
    formula = `${OPERADOR_TEX[z.fn]}(${datos.vertice})=\\dfrac{\\text{${t(`roles.${z.num}`)}}}{\\text{${t(`roles.${z.den}`)}}}=\\dfrac{${decTex(z.numValor, 2, SEP)}}{${decTex(z.denValor, 2, SEP)}}${exacto ? "=" : "\\approx"}${decTex(z.valor, 2, SEP)}`;
    leyenda = t(`triangulo.razon.${z.fn}`);
  } else {
    leyenda = t(`triangulo.${actual.id}`, { vertice: datos.vertice });
  }
  const anguloA = (Math.atan2(datos.a, datos.b) * 180) / Math.PI;
  return (
    <Marco acento={COLOR_TRIGONOMETRIA} titulo={visual.titulo} r={r}>
      <TrianguloLeccion
        tri={{ ladoA: datos.a, ladoB: datos.b, ladoC: datos.c, anguloA, anguloB: 90 - anguloA, anguloC: 90, marcarRectoEn: "C", ocultarAngulos: ["A", "B"] }}
        resaltar={resaltar}
        nombres={nombres}
        marcarAngulo={datos.vertice}
      />
      <Leyenda acento={actual.razon ? COLOR_TRIGONOMETRIA : COLOR_ROL[actual.resaltar[0]]}>
        <T>{leyenda}</T>
      </Leyenda>
      {formula && <Formula tex={formula} tam={15} />}
    </Marco>
  );
}

// ---------- Resolver un triángulo rectángulo ----------
export function Resolver({ visual }: { visual: VisualTrigonometriaResolver }) {
  const datos = useMemo(() => intentar(() => datosResolver(visual, SEP)), [visual]);
  const total = datos?.pasos.length ?? 0;
  const r = useReproductor({ total, ms: 2800, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos) return null;
  const paso = datos.pasos[Math.max(0, r.paso - 1)];
  const mostrarRoles = r.paso >= 2;
  const resaltar: Partial<Record<ClaveLado, string>> = {};
  const nombres: Partial<Record<ClaveLado, string>> = {};
  if (mostrarRoles) {
    for (const l of ["a", "b", "c"] as const) {
      resaltar[CLAVE[l]] = COLOR_ROL[datos.rolDe[l]];
      nombres[CLAVE[l]] = t(`roles.${datos.rolDe[l]}`);
    }
  }
  const oculta = (["a", "b", "c"] as const).filter((l) => l === datos.pedido);
  const omitidas = (["a", "b", "c"] as const).filter((l) => l !== datos.pedido && !datos.dados.includes(l));
  const modoAngulo = datos.modo === "angulo";
  return (
    <Marco acento={COLOR_TRIGONOMETRIA} titulo={visual.titulo} r={r}>
      <TrianguloLeccion
        tri={{
          ladoA: datos.a,
          ladoB: datos.b,
          ladoC: datos.c,
          anguloA: datos.A,
          anguloB: 90 - datos.A,
          anguloC: 90,
          marcarRectoEn: "C",
          ocultarLados: oculta.map((l) => CLAVE[l]),
          omitirLados: omitidas.map((l) => CLAVE[l]),
          ocultarAngulos: modoAngulo ? ["A", "B"] : ["B"],
        }}
        resaltar={mostrarRoles ? resaltar : undefined}
        nombres={mostrarRoles ? nombres : undefined}
        marcarAngulo="A"
        angulosIncognita={modoAngulo ? ["A"] : undefined}
      />
      <View style={{ gap: 6 }}>
        {datos.pasos.slice(0, r.paso).map((p, i) => (
          <Animated.View key={p.clave} entering={FadeInDown.duration(300)} style={[styles.tarjeta, p === paso && styles.tarjetaActual]}>
            <Texto v="cuerpo" tam={13}>
              <Texto v="fuerte" tam={13} c={COLOR_TRIGONOMETRIA}>
                {`${i + 1}. `}
              </Texto>
              <T tam={13}>{t(`resolver.${p.clave}`, { letra: datos.pedido ?? "A", fn: datos.fn })}</T>
            </Texto>
            {p.formulas.map((f, k) => (
              <Formula key={k} tex={f} tam={15} />
            ))}
          </Animated.View>
        ))}
      </View>
    </Marco>
  );
}

// ---------- Círculo unitario ----------
const LineaA = Animated.createAnimatedComponent(Line);
const CirculoA = Animated.createAnimatedComponent(Circle);
const ETIQUETAS_GRADOS = ["0°", "90°", "180°", "270°"];
const ETIQUETAS_RADIANES = ["0", "π/2", "π", "3π/2"];

// El radio que gira hasta el ángulo (en la web: rotate() con transición).
function RadioGiratorio({ cx, cy, radio, rotacion }: { cx: number; cy: number; radio: number; rotacion: number }) {
  const a = useSharedValue(rotacion);
  useEffect(() => {
    a.set(withTiming(rotacion, { duration: 900 }));
  }, [rotacion, a]);
  const linea = useAnimatedProps(() => {
    const r = (a.value * Math.PI) / 180;
    return { x2: cx + radio * Math.cos(r), y2: cy + radio * Math.sin(r) };
  });
  const punta = useAnimatedProps(() => {
    const r = (a.value * Math.PI) / 180;
    return { cx: cx + radio * Math.cos(r), cy: cy + radio * Math.sin(r) };
  });
  return (
    <G>
      <LineaA x1={cx} y1={cy} animatedProps={linea} stroke={COLOR_TRIGONOMETRIA} strokeWidth={3} strokeLinecap="round" />
      <CirculoA animatedProps={punta} r={6} fill={COLOR_TRIGONOMETRIA} stroke={SUPERFICIE} strokeWidth={2} />
    </G>
  );
}

export function Circulo({ visual }: { visual: VisualTrigonometriaCirculo }) {
  const pasos = useMemo(() => {
    const p = intentar(() => datosCirculo(visual));
    return p && p.length > 0 ? p : null;
  }, [visual]);
  const r = useReproductor({ total: pasos?.length ?? 0, ms: 2800, estatico: visual.estatico, inicio: pasos ? 1 : 0 });
  if (!pasos) return null;
  const { ancho, alto, cx, cy, radio } = VISTA_CIRCULO;
  const p = pasos[Math.max(0, r.paso - 1)];
  const unidad = visual.unidad ?? "ambas";
  const conReferencia = visual.mostrar?.includes("referencia") ?? false;
  const conValores = visual.valores !== false;
  const ej = unidad === "radianes" ? ETIQUETAS_RADIANES : ETIQUETAS_GRADOS;
  const angulo = unidad === "grados" ? `$${p.gradosTex}$` : unidad === "radianes" ? `$${p.radianesTex}$` : `$${p.gradosTex}=${p.radianesTex}\\ \\text{rad}$`;
  const cuadrante = p.cuadrante === null ? t("circulo.sobreEje") : t("circulo.cuadrante", { n: p.cuadrante });
  const tan = p.tanTex === "\\text{indefinida}" ? `\\text{${t("circulo.indefinida")}}` : p.tanTex;
  return (
    <Marco acento={COLOR_TRIGONOMETRIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={ancho} alto={alto} max={340}>
        <Line x1={cx - radio - 22} y1={cy} x2={cx + radio + 22} y2={cy} stroke={BORDE} strokeWidth={1.5} />
        <Line x1={cx} y1={cy - radio - 22} x2={cx} y2={cy + radio + 22} stroke={BORDE} strokeWidth={1.5} />
        <Circle cx={cx} cy={cy} r={radio} fill={mezcla(COLOR_TRIGONOMETRIA, 6)} stroke={FG} strokeOpacity={0.55} strokeWidth={1.5} />
        <SvgText x={cx + radio + 6} y={cy - 6} fontSize={10} fill={FG} opacity={0.7}>
          {ej[0]}
        </SvgText>
        <SvgText x={cx + 6} y={cy - radio - 8} fontSize={10} fill={FG} opacity={0.7}>
          {ej[1]}
        </SvgText>
        <SvgText x={cx - radio - 6} y={cy - 6} fontSize={10} fill={FG} opacity={0.7} textAnchor="end">
          {ej[2]}
        </SvgText>
        <SvgText x={cx + 6} y={cy + radio + 16} fontSize={10} fill={FG} opacity={0.7}>
          {ej[3]}
        </SvgText>
        <SvgText x={cx + radio - 10} y={cy + 13} fontSize={10} fill={FG} opacity={0.5}>
          1
        </SvgText>
        {p.arco ? (
          <GAparece key={`arco-${r.paso}`} visible ms={700}>
            <Path d={p.arco} fill="none" stroke={FG} strokeWidth={2} />
          </GAparece>
        ) : null}
        {conReferencia && p.arcoReferencia ? <Path d={p.arcoReferencia} fill="none" stroke={COLOR_TRIGONOMETRIA} strokeWidth={3} strokeDasharray="4 3" /> : null}
        {conValores && (
          <G>
            <Line x1={p.punto.x} y1={p.punto.y} x2={p.punto.x} y2={cy} stroke={COLOR_SENO} strokeWidth={2.5} strokeDasharray="5 3" />
            <Line x1={p.punto.x} y1={p.punto.y} x2={cx} y2={p.punto.y} stroke={COLOR_COSENO} strokeWidth={2.5} strokeDasharray="5 3" />
            <Circle cx={p.punto.x} cy={cy} r={3.5} fill={COLOR_COSENO} />
            <Circle cx={cx} cy={p.punto.y} r={3.5} fill={COLOR_SENO} />
          </G>
        )}
        <RadioGiratorio cx={cx} cy={cy} radio={radio} rotacion={p.rotacion} />
        <Circle cx={cx} cy={cy} r={2.5} fill={FG} />
      </Lienzo>
      <Leyenda acento={COLOR_TRIGONOMETRIA}>
        <T>{`${t("circulo.angulo")} ${angulo} · ${cuadrante}`}</T>
        {conValores && (
          <Texto v="fuerte" tam={13}>
            <T negrita c={COLOR_COSENO}>{`$\\cos\\theta=${p.cosTex}$`}</T>
            {"   "}
            <T negrita c={COLOR_SENO}>{`$\\operatorname{sen}\\theta=${p.senTex}$`}</T>
            {"   "}
            <T>{`$\\tan\\theta=${tan}$`}</T>
          </Texto>
        )}
        {conReferencia && p.cuadrante !== null && <T>{t("circulo.referencia", { g: p.referencia })}</T>}
      </Leyenda>
    </Marco>
  );
}

// ---------- Signos por cuadrante ----------
const DIRECCION = [
  { dx: 1, dy: -1 },
  { dx: -1, dy: -1 },
  { dx: -1, dy: 1 },
  { dx: 1, dy: 1 },
] as const;
const ROMANO = ["I", "II", "III", "IV"];
const LETRA_REGLA = ["T", "S", "T", "C"];

export function Cuadrantes({ visual }: { visual: VisualTrigonometriaCuadrantes }) {
  const cuadrantes = useMemo(() => intentar(() => datosCuadrantes(visual)), [visual]);
  const total = cuadrantes ? 5 : 0;
  const r = useReproductor({ total, ms: 2600, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!cuadrantes) return null;
  const { ancho, alto, cx, cy, radio } = VISTA_CUADRANTES;
  const enRegla = r.paso >= 5;
  const indice = Math.min(3, r.paso - 1);
  const actual = cuadrantes[indice];
  const colorSigno = { sen: COLOR_SENO, cos: COLOR_COSENO, tan: COLOR_TANGENTE } as const;
  return (
    <Marco acento={COLOR_TRIGONOMETRIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={ancho} alto={alto} max={340}>
        <Line x1={8} y1={cy} x2={ancho - 8} y2={cy} stroke={BORDE} strokeWidth={1.5} />
        <Line x1={cx} y1={4} x2={cx} y2={alto - 4} stroke={BORDE} strokeWidth={1.5} />
        <Circle cx={cx} cy={cy} r={radio} fill="none" stroke={FG} strokeOpacity={0.35} strokeWidth={1.5} />
        {cuadrantes.map((q, i) => {
          const visible = i < Math.min(4, r.paso);
          const activo = i === indice && !enRegla;
          const { dx, dy } = DIRECCION[i];
          const xTexto = cx + dx * 148;
          const yBase = dy < 0 ? 26 : alto - 44;
          const ancla = dx > 0 ? "end" : "start";
          return (
            <GAparece key={q.cuadrante} visible={visible} opacidad={enRegla ? 0.28 : 1}>
              {activo && <Rect x={dx > 0 ? cx : 8} y={dy > 0 ? cy : 4} width={dx > 0 ? ancho - 8 - cx : cx - 8} height={dy > 0 ? alto - 4 - cy : cy - 4} fill={COLOR_TRIGONOMETRIA} opacity={0.09} />}
              <Line x1={q.punto.x} y1={q.punto.y} x2={q.punto.x} y2={cy} stroke={COLOR_SENO} strokeWidth={2} strokeDasharray="4 3" />
              <Line x1={q.punto.x} y1={q.punto.y} x2={cx} y2={q.punto.y} stroke={COLOR_COSENO} strokeWidth={2} strokeDasharray="4 3" />
              <Line x1={cx} y1={cy} x2={q.punto.x} y2={q.punto.y} stroke={COLOR_TRIGONOMETRIA} strokeWidth={activo ? 3 : 2} />
              <Circle cx={q.punto.x} cy={q.punto.y} r={activo ? 6 : 4.5} fill={COLOR_TRIGONOMETRIA} stroke={SUPERFICIE} strokeWidth={1.5} />
              <SvgText x={xTexto} y={yBase - 14} textAnchor={ancla} fontSize={10} fontWeight="700" fill={FG} opacity={0.7}>
                {ROMANO[i]}
              </SvgText>
              {(["sen", "cos", "tan"] as const).map((f, k) => (
                <SvgText key={f} x={xTexto} y={yBase + k * 13} textAnchor={ancla} fontSize={11} fontWeight="700" fontFamily={fuente.mono} fill={colorSigno[f]}>
                  {`${f} ${q.signo[f] === "+" ? "+" : "−"}`}
                </SvgText>
              ))}
            </GAparece>
          );
        })}
        {cuadrantes.map((q, i) => {
          const { dx, dy } = DIRECCION[i];
          return (
            <GAparece key={`letra-${q.cuadrante}`} visible={enRegla} ms={500 + i * 150}>
              <SvgText x={cx + dx * 52} y={cy + dy * 40 + 10} textAnchor="middle" fontSize={30} fontWeight="900" fill={COLOR_TRIGONOMETRIA}>
                {LETRA_REGLA[i]}
              </SvgText>
            </GAparece>
          );
        })}
      </Lienzo>
      <Leyenda acento={COLOR_TRIGONOMETRIA}>
        {enRegla ? (
          <T>{t("cuadrantes.regla")}</T>
        ) : (
          <>
            <T>{t("cuadrantes.angulo", { n: actual.cuadrante, g: actual.grados, ref: visual.referencia })}</T>
            <T>{`$\\operatorname{sen}=${actual.senTex}$ · $\\cos=${actual.cosTex}$ · $\\tan=${actual.tanTex}$`}</T>
          </>
        )}
      </Leyenda>
    </Marco>
  );
}

// ---------- Gráfica de una onda ----------
export function Onda({ visual }: { visual: VisualTrigonometriaOnda }) {
  const datos = useMemo(
    () =>
      intentar(() => {
        if (!esOndaJsonValida(visual.onda) || (visual.base !== undefined && !esOndaJsonValida(visual.base))) return null;
        if (!Array.isArray(visual.rango) || visual.rango.length !== 2) return null;
        return datosOnda(visual);
      }),
    [visual]
  );
  const pasos: PasoOnda[] = useMemo(() => (visual.pasos && visual.pasos.length > 0 ? visual.pasos : ["curva"]), [visual.pasos]);
  const r = useReproductor({ total: datos ? pasos.length : 0, ms: 2600, estatico: visual.estatico, inicio: datos ? 1 : 0 });
  if (!datos) return null;
  const { ancho, alto, izq, der, arriba, abajo } = VISTA_ONDA;
  const activos = new Set(pasos.slice(0, r.paso));
  const ultimo = pasos[Math.max(0, r.paso - 1)];
  const colorCurva = datos.onda.fn === "tan" ? COLOR_TANGENTE : datos.onda.fn === "cos" ? COLOR_COSENO : COLOR_SENO;
  const yFondo = alto - abajo;
  const A = COLOR_TRIGONOMETRIA;
  return (
    <Marco acento={COLOR_TRIGONOMETRIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={ancho} alto={alto} max={380}>
        {datos.ticksX.map((k) => (
          <G key={`x${k.pos}`}>
            <Line x1={k.pos} y1={arriba} x2={k.pos} y2={yFondo} stroke={BORDE} strokeWidth={1} opacity={0.6} />
            <SvgText x={k.pos} y={alto - 12} textAnchor="middle" fontSize={10} fill={FG} opacity={0.8}>
              {k.etiqueta}
            </SvgText>
          </G>
        ))}
        {datos.ticksY.map((k) => (
          <G key={`y${k.pos}`}>
            <Line x1={izq} y1={k.pos} x2={ancho - der} y2={k.pos} stroke={BORDE} strokeWidth={1} opacity={0.6} />
            <SvgText x={izq - 5} y={k.pos + 3.5} textAnchor="end" fontSize={10} fill={FG} opacity={0.8}>
              {k.etiqueta}
            </SvgText>
          </G>
        ))}
        <Line x1={izq} y1={datos.ejeXpx} x2={ancho - der} y2={datos.ejeXpx} stroke={FG} strokeOpacity={0.6} strokeWidth={1.5} />
        <Line x1={datos.ejeYpx} y1={arriba} x2={datos.ejeYpx} y2={yFondo} stroke={FG} strokeOpacity={0.6} strokeWidth={1.5} />
        <SvgText x={izq - 5} y={datos.ejeXpx + 3.5} textAnchor="end" fontSize={10} fill={FG} opacity={0.8}>
          0
        </SvgText>
        {datos.curvaBase.map((d, i) => (
          <Path key={`b${i}`} d={d} fill="none" stroke={FG} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="5 4" />
        ))}
        <GAparece visible={activos.has("asintotas")}>
          {datos.asintotas.map((x) => (
            <Line key={`a${x}`} x1={x} y1={arriba} x2={x} y2={yFondo} stroke={COLOR_ALERTA} strokeWidth={1.5} strokeDasharray="6 4" />
          ))}
        </GAparece>
        {datos.lineaMedia && (
          <GAparece visible={activos.has("vertical")}>
            <Line x1={izq} y1={datos.lineaMedia.y} x2={ancho - der} y2={datos.lineaMedia.y} stroke={A} strokeWidth={2} strokeDasharray="7 4" />
            <Halo x={ancho - der - 4} y={datos.lineaMedia.y - 5} ancla="end">{`y = ${datos.lineaMedia.valor}`}</Halo>
          </GAparece>
        )}
        {datos.curva.map((d, i) => (
          <TrazoDibujado key={`c${i}`} d={d} largo={largoDeRuta(d)} visible={activos.has("curva")} ms={1100} fill="none" stroke={colorCurva} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {datos.desfase && (
          <GAparece visible={activos.has("desfase")}>
            <Line x1={datos.ejeYpx} y1={datos.ejeXpx} x2={datos.desfase.x} y2={datos.ejeXpx} stroke={COLOR_ALERTA} strokeWidth={3} />
            <Circle cx={datos.desfase.x} cy={datos.desfase.y} r={4.5} fill={COLOR_ALERTA} />
            <Halo x={datos.desfase.x} y={datos.ejeXpx + 15} ancla="middle">{`c = ${datos.valores.desfase}`}</Halo>
          </GAparece>
        )}
        {datos.amplitud && (
          <GAparece visible={activos.has("amplitud")}>
            <Line x1={datos.amplitud.x} y1={datos.amplitud.yMedio} x2={datos.amplitud.x} y2={datos.amplitud.yExtremo} stroke={A} strokeWidth={3} />
            <Line x1={datos.amplitud.x - 5} y1={datos.amplitud.yExtremo} x2={datos.amplitud.x + 5} y2={datos.amplitud.yExtremo} stroke={A} strokeWidth={3} />
            <Line x1={datos.amplitud.x - 5} y1={datos.amplitud.yMedio} x2={datos.amplitud.x + 5} y2={datos.amplitud.yMedio} stroke={A} strokeWidth={3} />
            <Halo x={datos.amplitud.x + 9} y={(datos.amplitud.yMedio + datos.amplitud.yExtremo) / 2 + 4}>{`a = ${datos.amplitud.valor}`}</Halo>
          </GAparece>
        )}
        {datos.periodo && (
          <GAparece visible={activos.has("periodo")}>
            <Line x1={datos.periodo.x0} y1={datos.periodo.y} x2={datos.periodo.x1} y2={datos.periodo.y} stroke={A} strokeWidth={3} />
            <Line x1={datos.periodo.x0} y1={datos.periodo.y - 5} x2={datos.periodo.x0} y2={datos.periodo.y + 5} stroke={A} strokeWidth={3} />
            <Line x1={datos.periodo.x1} y1={datos.periodo.y - 5} x2={datos.periodo.x1} y2={datos.periodo.y + 5} stroke={A} strokeWidth={3} />
            <Halo x={(datos.periodo.x0 + datos.periodo.x1) / 2} y={datos.periodo.y - 8} ancla="middle">{`P = ${datos.periodo.valor}`}</Halo>
          </GAparece>
        )}
        <GAparece visible={activos.has("puntos")}>
          {datos.puntos.map((p, i) => (
            <Circle key={`p${i}`} cx={p.x} cy={p.y} r={4.5} fill={A} stroke={SUPERFICIE} strokeWidth={1.5} />
          ))}
        </GAparece>
      </Lienzo>
      <Formula tex={datos.valores.ecuacion} tam={15} />
      <Leyenda acento={COLOR_TRIGONOMETRIA}>
        <T>
          {t(ultimo === "curva" ? `onda.curva.${datos.onda.fn}` : `onda.${ultimo}`, {
            amplitud: datos.valores.amplitud,
            periodo: datos.valores.periodo,
            desfase: datos.valores.desfase,
            medio: datos.valores.medio,
            maximo: datos.valores.maximo,
            minimo: datos.valores.minimo,
          })}
        </T>
      </Leyenda>
    </Marco>
  );
}

// ---------- Triángulo oblicuo (leyes del seno, del coseno, área, caso ambiguo) ----------
type Lado = "a" | "b" | "c";
type Vertice = "A" | "B" | "C";
interface Resalte {
  lados: Partial<Record<Lado, string>>;
  angulos: Partial<Record<Vertice, string>>;
  altura: boolean;
  circunferencia: boolean;
  triangulos: boolean;
}
const NADA: Resalte = { lados: {}, angulos: {}, altura: false, circunferencia: false, triangulos: true };

function resalte(ley: DatosLey["ley"], clave: string): Resalte {
  const A = COLOR_SENO;
  const B = COLOR_COSENO;
  const C = COLOR_HIPOTENUSA;
  if (ley === "seno") {
    if (clave === "parejaA") return { ...NADA, lados: { a: A }, angulos: { A } };
    if (clave === "parejaB") return { ...NADA, lados: { b: B }, angulos: { B } };
    if (clave === "datos") return { ...NADA, lados: { a: A }, angulos: { A, B } };
    return { ...NADA, lados: { a: A, b: B }, angulos: { A, B } };
  }
  if (ley === "coseno") {
    if (clave === "resultado" || clave === "calcular") return { ...NADA, lados: { a: A, b: B, c: COLOR_ALERTA }, angulos: { C } };
    return { ...NADA, lados: { a: A, b: B }, angulos: { C } };
  }
  if (ley === "area") {
    if (clave === "datos") return { ...NADA, lados: { a: A, b: B }, angulos: { C } };
    return { ...NADA, lados: { a: A, b: B }, angulos: { C }, altura: true };
  }
  if (clave === "datos") return { ...NADA, lados: { b: B }, angulos: { A }, triangulos: false };
  if (clave === "altura") return { ...NADA, lados: { b: B }, angulos: { A }, altura: true, triangulos: false };
  if (clave === "comparar") return { ...NADA, lados: { b: B }, angulos: { A }, altura: true, circunferencia: true, triangulos: false };
  return { ...NADA, lados: { a: A, b: B }, angulos: { A }, altura: true, circunferencia: true, triangulos: true };
}

const centroDe = (tr: TrianguloLey): PuntoPx => ({ x: (tr.A.x + tr.B.x + tr.C.x) / 3, y: (tr.A.y + tr.B.y + tr.C.y) / 3 });
const medioDe = (p: PuntoPx, q: PuntoPx): PuntoPx => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });

export function Ley({ visual }: { visual: VisualTrigonometriaLey }) {
  const datos = useMemo(() => intentar(() => (typeof visual.datos === "object" && visual.datos !== null ? datosLey(visual, SEP) : null)), [visual]);
  const r = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2800, estatico: visual.estatico, inicio: datos ? 1 : 0 });
  if (!datos) return null;
  const { ancho, alto } = VISTA_LEY;
  const paso = datos.pasos[Math.max(0, r.paso - 1)];
  const rs = resalte(datos.ley, paso.clave);
  const tri = datos.triangulo;
  const c0 = centroDe(tri);
  const otro = datos.segundo;
  const conocidos: Record<Lado, boolean> = { a: true, b: datos.ley !== "seno", c: false };
  const incognitaFinal: Lado | null = datos.ley === "seno" ? "b" : datos.ley === "coseno" ? "c" : null;
  const angulosConocidos: Record<Vertice, boolean> = { A: datos.ley === "seno" || datos.ley === "ambiguo", B: datos.ley === "seno", C: datos.ley === "coseno" || datos.ley === "area" };
  const t0 = tri.t;
  const enResultado = paso.clave === "resultado" || paso.clave === "calcular" || paso.clave === "conclusion";
  const ambiguo = datos.ley === "ambiguo";
  const lados: { l: Lado; p: PuntoPx; q: PuntoPx }[] = [
    { l: "a", p: tri.B, q: tri.C },
    { l: "b", p: tri.A, q: tri.C },
    { l: "c", p: tri.A, q: tri.B },
  ];
  const vertices: { v: Vertice; p: PuntoPx }[] = [
    { v: "A", p: tri.A },
    { v: "B", p: tri.B },
    { v: "C", p: tri.C },
  ];
  return (
    <Marco acento={COLOR_TRIGONOMETRIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={ancho} alto={alto} max={340}>
        {ambiguo && (
          <G>
            <Line x1={tri.A.x - 6} y1={tri.A.y} x2={ancho - 14} y2={tri.A.y} stroke={FG} strokeOpacity={0.4} strokeWidth={1.5} />
            <Line x1={tri.A.x} y1={tri.A.y} x2={tri.C.x} y2={tri.C.y} stroke={rs.lados.b ?? COLOR_TRIGONOMETRIA} strokeWidth={4} strokeLinecap="round" />
            {datos.arcoCircunferencia ? (
              <GAparece visible={rs.circunferencia} ms={500}>
                <Path d={datos.arcoCircunferencia} fill="none" stroke={COLOR_HIPOTENUSA} strokeWidth={2.5} strokeDasharray="6 4" />
              </GAparece>
            ) : null}
          </G>
        )}
        {[tri, ...(otro ? [otro] : [])].map((tt, i) => {
          const visible = ambiguo ? rs.triangulos && datos.cantidad > 0 && (i === 0 || datos.cantidad === 2) : true;
          return (
            <GAparece key={i} visible={visible} opacidad={ambiguo && i === 1 ? 0.9 : 1} ms={500}>
              <Polygon
                points={`${tt.A.x},${tt.A.y} ${tt.B.x},${tt.B.y} ${tt.C.x},${tt.C.y}`}
                fill={mezcla(COLOR_TRIGONOMETRIA, i === 1 ? 6 : 10)}
                stroke={i === 1 ? COLOR_ALERTA : COLOR_TRIGONOMETRIA}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeDasharray={i === 1 ? "6 3" : undefined}
              />
            </GAparece>
          );
        })}
        {!ambiguo && lados.map(({ l, p, q }) => (rs.lados[l] ? <Line key={l} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={rs.lados[l]} strokeWidth={5} strokeLinecap="round" /> : null))}
        {ambiguo && rs.triangulos && datos.cantidad > 0 && <Line x1={tri.B.x} y1={tri.B.y} x2={tri.C.x} y2={tri.C.y} stroke={rs.lados.a ?? COLOR_SENO} strokeWidth={4} strokeLinecap="round" />}
        {ambiguo && rs.triangulos && otro && <Line x1={otro.B.x} y1={otro.B.y} x2={otro.C.x} y2={otro.C.y} stroke={COLOR_ALERTA} strokeWidth={4} strokeLinecap="round" strokeDasharray="6 3" />}
        {vertices.map(({ v }) =>
          rs.angulos[v] || angulosConocidos[v] ? <Path key={`arc${v}`} d={tri.arcos[v]} fill="none" stroke={rs.angulos[v] ?? FG} strokeWidth={rs.angulos[v] ? 3 : 1.5} strokeOpacity={rs.angulos[v] ? 1 : 0.6} /> : null
        )}
        {datos.altura && rs.altura && (
          <G>
            <Line x1={datos.altura.desde.x} y1={datos.altura.desde.y} x2={datos.altura.hasta.x} y2={datos.altura.hasta.y} stroke={COLOR_ALERTA} strokeWidth={2.5} strokeDasharray="5 3" />
            <Halo x={(datos.altura.desde.x + datos.altura.hasta.x) / 2 + 7} y={(datos.altura.desde.y + datos.altura.hasta.y) / 2 + 4} fill={COLOR_ALERTA} tam={12}>
              h
            </Halo>
          </G>
        )}
        {vertices.map(({ v, p }) => {
          const pos = alejar(p, c0, 15);
          const texto = `${v}${angulosConocidos[v] ? ` = ${t0[v] % 1 === 0 ? t0[v] : dec(t0[v], 1, SEP)}°` : ""}`;
          return (
            <Halo key={v} x={pos.x} y={pos.y + 4} ancla="middle" tam={13} fill={rs.angulos[v] ?? FG}>
              {texto}
            </Halo>
          );
        })}
        {ambiguo && otro && rs.triangulos && (
          <Halo x={otro.B.x} y={otro.B.y + 15} ancla="middle" tam={13} fill={COLOR_ALERTA}>
            B₂
          </Halo>
        )}
        {lados.map(({ l, p, q }) => {
          if (ambiguo && (l === "c" || (l === "a" && (!rs.triangulos || datos.cantidad === 0)))) return null;
          const esIncognita = l === incognitaFinal;
          const mostrarValor = conocidos[l] || (esIncognita && enResultado);
          const texto = mostrarValor ? `${l} = ${dec(t0[l], 2, SEP)}` : esIncognita ? `${l} = ?` : l;
          const pos = alejar(medioDe(p, q), c0, 17);
          return (
            <Halo key={l} x={pos.x} y={pos.y + 4} ancla="middle" tam={12} fill={rs.lados[l] ?? FG}>
              {texto}
            </Halo>
          );
        })}
      </Lienzo>
      {paso.clave !== "conclusion" && paso.formulas.map((f, i) => <Formula key={i} tex={f} tam={15} />)}
      <Leyenda acento={COLOR_TRIGONOMETRIA}>
        <T>{t(`ley.${datos.ley}.${paso.clave}`, { n: datos.cantidad })}</T>
      </Leyenda>
    </Marco>
  );
}

// ---------- Ecuación trigonométrica (gráfica + círculo) ----------
export function Ecuacion({ visual }: { visual: VisualTrigonometriaEcuacion }) {
  const datos = useMemo(() => intentar(() => datosEcuacion(visual)), [visual]);
  const r = useReproductor({ total: datos ? 5 : 0, ms: 2600, estatico: visual.estatico, inicio: datos ? 1 : 0 });
  if (!datos) return null;
  const g = VISTA_ECUACION;
  const c = VISTA_ECUACION_CIRCULO;
  const colorFn = datos.fn === "tan" ? COLOR_TANGENTE : datos.fn === "cos" ? COLOR_COSENO : COLOR_SENO;
  const clave = ["curva", "recta", "cortes", "circulo", "resumen"][Math.max(0, r.paso - 1)];
  const nombreFn = datos.fn === "sen" ? "\\operatorname{sen}" : `\\${datos.fn}`;
  return (
    <Marco acento={COLOR_TRIGONOMETRIA} titulo={visual.titulo} r={r}>
      <T tam={16} centro>{`$${nombreFn}\\,x=${datos.valorTex}$`}</T>
      <Lienzo ancho={g.ancho} alto={g.alto} max={380}>
        {datos.ticksX.map((k) => (
          <G key={k.pos}>
            <Line x1={k.pos} y1={g.arriba} x2={k.pos} y2={g.alto - g.abajo} stroke={BORDE} strokeWidth={1} opacity={0.6} />
            <SvgText x={k.pos} y={g.alto - 9} textAnchor="middle" fontSize={10} fill={FG} opacity={0.8}>
              {k.etiqueta}
            </SvgText>
          </G>
        ))}
        <Line x1={g.izq} y1={datos.ejeX} x2={g.ancho - g.der} y2={datos.ejeX} stroke={FG} strokeOpacity={0.6} strokeWidth={1.5} />
        <Line x1={g.izq} y1={g.arriba} x2={g.izq} y2={g.alto - g.abajo} stroke={FG} strokeOpacity={0.6} strokeWidth={1.5} />
        {datos.curva.map((d, i) => (
          <TrazoDibujado key={i} d={d} largo={largoDeRuta(d)} visible={r.paso >= 1} ms={1000} fill="none" stroke={colorFn} strokeWidth={3} strokeLinecap="round" />
        ))}
        <GAparece visible={r.paso >= 2} ms={500}>
          <Line x1={g.izq} y1={datos.rectaY} x2={g.ancho - g.der} y2={datos.rectaY} stroke={COLOR_TRIGONOMETRIA} strokeWidth={2.5} strokeDasharray="7 4" />
          <Halo x={g.ancho - g.der - 3} y={datos.rectaY - 5} ancla="end">{`y = ${datos.valorPlano}`}</Halo>
        </GAparece>
        <GAparece visible={r.paso >= 3} ms={500}>
          {datos.cortes.map((p, i) => (
            <G key={i}>
              <Line x1={p.x} y1={p.y} x2={p.x} y2={datos.ejeX} stroke={COLOR_ALERTA} strokeWidth={1.5} strokeDasharray="3 3" />
              <Circle cx={p.x} cy={p.y} r={5} fill={COLOR_ALERTA} stroke={SUPERFICIE} strokeWidth={1.5} />
              <Halo x={p.x} y={p.y < datos.ejeX ? datos.ejeX + 13 : datos.ejeX - 6} ancla="middle" fill={COLOR_ALERTA}>
                {datos.solucionesPiPlano[i]}
              </Halo>
            </G>
          ))}
        </GAparece>
      </Lienzo>
      <Lienzo ancho={c.ancho} alto={c.alto} max={380} opacidad={r.paso >= 4 ? 1 : 0.15}>
        <Line x1={c.cx - c.radio - 20} y1={c.cy} x2={c.cx + c.radio + 20} y2={c.cy} stroke={BORDE} strokeWidth={1.5} />
        <Line x1={c.cx} y1={c.cy - c.radio - 20} x2={c.cx} y2={c.cy + c.radio + 20} stroke={BORDE} strokeWidth={1.5} />
        <Circle cx={c.cx} cy={c.cy} r={c.radio} fill={mezcla(COLOR_TRIGONOMETRIA, 6)} stroke={FG} strokeOpacity={0.55} strokeWidth={1.5} />
        <Line x1={datos.rectaCirculo.x1} y1={datos.rectaCirculo.y1} x2={datos.rectaCirculo.x2} y2={datos.rectaCirculo.y2} stroke={COLOR_TRIGONOMETRIA} strokeWidth={2.5} strokeDasharray="7 4" />
        {datos.puntosCirculo.map((p, i) => {
          const derecha = p.x >= c.cx;
          return (
            <G key={i}>
              <Line x1={c.cx} y1={c.cy} x2={p.x} y2={p.y} stroke={COLOR_ALERTA} strokeWidth={2} opacity={0.8} />
              <Circle cx={p.x} cy={p.y} r={5.5} fill={COLOR_ALERTA} stroke={SUPERFICIE} strokeWidth={1.5} />
              <Halo x={p.x + (derecha ? 9 : -9)} y={p.y + (p.y < c.cy ? -6 : 14)} ancla={derecha ? "start" : "end"} tam={12} fill={COLOR_ALERTA}>
                {datos.solucionesPiPlano[i]}
              </Halo>
            </G>
          );
        })}
        <Circle cx={c.cx} cy={c.cy} r={2.5} fill={FG} />
      </Lienzo>
      <Leyenda acento={COLOR_TRIGONOMETRIA}>
        <T>
          {t(`ecuacion.${clave}`, {
            n: datos.soluciones.length,
            soluciones: datos.solucionesPiPlano.join(t("ecuacion.y")),
            fn: t(`ecuacion.nombres.${datos.fn}`),
            valor: datos.valorPlano,
          })}
        </T>
      </Leyenda>
    </Marco>
  );
}

// ---------- Identidad pitagórica ----------
export function Identidad({ visual }: { visual: VisualTrigonometriaIdentidad }) {
  const datos = useMemo(() => intentar(() => datosIdentidad(visual)), [visual]);
  const derivadas = visual.forma === "derivadas";
  const total = datos ? (derivadas ? 6 : 4) : 0;
  const r = useReproductor({ total, ms: 2800, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos || !datos.cumple) return null;
  const { ancho, alto, cx, cy, radio } = VISTA_IDENTIDAD;
  const p = r.paso;
  const clave = ["circulo", "catetos", "pitagoras", "numeros", "tangente", "cotangente"][Math.max(0, p - 1)];
  let formula: string | null = null;
  if (clave === "pitagoras") formula = datos.pitagorica.general;
  if (clave === "numeros") formula = `${datos.pitagorica.conNumeros}=${datos.pitagorica.suma}`;
  if (clave === "tangente" && datos.tangente) formula = `${datos.tangente.general}\\qquad ${datos.tangente.conNumeros}`;
  if (clave === "cotangente" && datos.cotangente) formula = `${datos.cotangente.general}\\qquad ${datos.cotangente.conNumeros}`;
  const { origen, pie, punto } = datos;
  return (
    <Marco acento={COLOR_TRIGONOMETRIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={ancho} alto={alto} max={360}>
        <Line x1={cx - radio - 14} y1={cy} x2={cx + radio + 14} y2={cy} stroke={BORDE} strokeWidth={1.5} />
        <Line x1={cx} y1={cy - radio - 14} x2={cx} y2={cy + radio + 14} stroke={BORDE} strokeWidth={1.5} />
        <Circle cx={cx} cy={cy} r={radio} fill={mezcla(COLOR_TRIGONOMETRIA, 6)} stroke={FG} strokeOpacity={0.55} strokeWidth={1.5} />
        <GAparece visible={p >= 2} ms={500}>
          <Polygon points={`${origen.x},${origen.y} ${pie.x},${pie.y} ${punto.x},${punto.y}`} fill={mezcla(COLOR_TRIGONOMETRIA, 14)} />
          <Line x1={origen.x} y1={origen.y} x2={pie.x} y2={pie.y} stroke={COLOR_COSENO} strokeWidth={4.5} strokeLinecap="round" />
          <Line x1={pie.x} y1={pie.y} x2={punto.x} y2={punto.y} stroke={COLOR_SENO} strokeWidth={4.5} strokeLinecap="round" />
          <Polyline points={`${pie.x - 9},${pie.y} ${pie.x - 9},${pie.y - 9} ${pie.x},${pie.y - 9}`} fill="none" stroke={FG} strokeWidth={1.5} />
          <Halo x={(origen.x + pie.x) / 2} y={origen.y + 17} ancla="middle" tam={12} fill={COLOR_COSENO}>
            cos θ
          </Halo>
          <Halo x={pie.x + 8} y={(pie.y + punto.y) / 2 + 4} tam={12} fill={COLOR_SENO}>
            sen θ
          </Halo>
        </GAparece>
        <Line x1={origen.x} y1={origen.y} x2={punto.x} y2={punto.y} stroke={COLOR_HIPOTENUSA} strokeWidth={4} strokeLinecap="round" />
        <Circle cx={punto.x} cy={punto.y} r={6} fill={COLOR_HIPOTENUSA} stroke={SUPERFICIE} strokeWidth={2} />
        <Path d={datos.arco} fill="none" stroke={FG} strokeWidth={2} />
        <Halo x={origen.x + 32} y={origen.y - 8} tam={12}>
          θ
        </Halo>
        <Halo x={(origen.x + punto.x) / 2 - 12} y={(origen.y + punto.y) / 2 - 8} ancla="end" tam={12} fill={COLOR_HIPOTENUSA}>
          1
        </Halo>
      </Lienzo>
      {formula && (
        <Animated.View key={clave} entering={FadeInDown.duration(300)}>
          <Formula tex={formula} tam={15} />
        </Animated.View>
      )}
      <Leyenda acento={COLOR_TRIGONOMETRIA}>
        <T>{t(`identidad.${clave}`, { g: datos.angulo })}</T>
      </Leyenda>
    </Marco>
  );
}

// ---------- El truco de la mano (interactivo) ----------
const PIVOTE = { x: 130, y: 205 };
const COLOR_NEUTRO = "#9CA3AF";
const DEDOS = [
  { id: 0, clave: "pulgar", grados: 0, largo: 58, angulo: -68 },
  { id: 1, clave: "indice", grados: 30, largo: 82, angulo: -34 },
  { id: 2, clave: "medio", grados: 45, largo: 96, angulo: 0 },
  { id: 3, clave: "anular", grados: 60, largo: 88, angulo: 34 },
  { id: 4, clave: "menique", grados: 90, largo: 62, angulo: 68 },
] as const;
const raiz = (k: number) => (k === 0 ? "0" : k === 4 ? "1" : `√${k}/2`);

export function Mano({ visual }: { visual: VisualTrigonometriaMano }) {
  const [activo, setActivo] = useState(3);
  const sen = Math.sqrt(activo) / 2;
  const cos = Math.sqrt(4 - activo) / 2;
  const dedo = DEDOS[activo];
  const colorDe = (id: number) => (id === 0 ? COLOR_NEUTRO : id <= activo ? COLOR_SENO : COLOR_COSENO);
  return (
    <Marco acento={COLOR_TRIGONOMETRIA} titulo={visual.titulo}>
      <Lienzo ancho={260} alto={220} max={260}>
        <Ellipse cx={PIVOTE.x} cy={PIVOTE.y + 18} rx={46} ry={30} fill={color.surface2} />
        {DEDOS.map((d) => {
          const esActivo = d.id === activo;
          const puntaY = PIVOTE.y - d.largo - 8;
          return (
            <G key={d.id} transform={`rotate(${d.angulo} ${PIVOTE.x} ${PIVOTE.y})`}>
              <Rect
                x={PIVOTE.x - 12}
                y={PIVOTE.y - d.largo}
                width={24}
                height={d.largo}
                rx={12}
                fill={colorDe(d.id)}
                opacity={esActivo ? 1 : 0.55}
                stroke={esActivo ? COLOR_TRIGONOMETRIA : "none"}
                strokeWidth={esActivo ? 2.5 : 0}
                onPress={() => setActivo(d.id)}
              />
              <SvgText x={PIVOTE.x} y={puntaY} textAnchor="middle" fontSize={11} fontWeight={esActivo ? "700" : "500"} fill={FG} transform={`rotate(${-d.angulo} ${PIVOTE.x} ${puntaY})`}>
                {`${d.grados}°`}
              </SvgText>
            </G>
          );
        })}
      </Lienzo>
      <View style={styles.dedos}>
        {DEDOS.map((d) => (
          <Pressable key={d.id} onPress={() => setActivo(d.id)} style={[styles.dedo, d.id === activo && { borderColor: COLOR_TRIGONOMETRIA, backgroundColor: mezcla(COLOR_TRIGONOMETRIA, 14) }]}>
            <Texto v="fuerte" tam={11}>
              {`${d.grados}°`}
            </Texto>
          </Pressable>
        ))}
      </View>
      <T tam={13} c={SECUNDARIO} centro>
        {tMano("instruccion", { dedo: tMano(dedo.clave) })}
      </T>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}>
        <View style={{ alignItems: "center", gap: 4, flex: 1 }}>
          <View style={[styles.franja, { backgroundColor: COLOR_SENO }]} />
          <Texto style={styles.mono}>{`sen(${dedo.grados}°) = ${raiz(activo)} ≈ ${sen.toFixed(2)}`}</Texto>
          <Texto v="nota" tam={11} centro>
            {tMano("cuentaSeno")}
          </Texto>
        </View>
        <View style={{ alignItems: "center", gap: 4, flex: 1 }}>
          <View style={[styles.franja, { backgroundColor: COLOR_COSENO }]} />
          <Texto style={styles.mono}>{`cos(${dedo.grados}°) = ${raiz(4 - activo)} ≈ ${cos.toFixed(2)}`}</Texto>
          <Texto v="nota" tam={11} centro>
            {tMano("cuentaCoseno")}
          </Texto>
        </View>
      </View>
      <Texto v="nota" tam={11} centro>
        {tMano("tocarDedo")}
      </Texto>
    </Marco>
  );
}

const styles = StyleSheet.create({
  tarjeta: { gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: BORDE, backgroundColor: FONDO },
  tarjetaActual: { borderColor: mezcla(color.logro, 50), backgroundColor: mezcla(color.logro, 10) },
  dedos: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dedo: { minWidth: 44, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: BORDE, alignItems: "center" },
  franja: { width: 24, height: 8, borderRadius: 4 },
  mono: { fontFamily: fuente.mono, fontSize: 13, color: FG, textAlign: "center" },
});
