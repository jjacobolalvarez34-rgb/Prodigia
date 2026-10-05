import { useEffect, useMemo } from "react";
import { useWindowDimensions } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import type { TerminoFuncionCalculia, VisualCalculiaArea, VisualCalculiaEdo, VisualCalculiaSerie, VisualCalculiaTangente } from "@/lib/calculia/visuales";
import { datosArea, datosEdo, datosSerie, datosTangente, esVisualCalculiaArea, esVisualCalculiaEdo, esVisualCalculiaSerie, esVisualCalculiaTangente } from "@/lib/calculia/visualesDatos";
import { textosDe } from "~/lib/textosWeb";
import { FG, largoPoligonal, Leyenda, Marco, SUPERFICIE, T, TrazoDibujado } from "../comun";
import { useReproductor } from "../reproductor";

// Visuales de las lecciones de Calculia (components/calculia/visuales de la web):
// los mismos datos (lib/calculia/visualesDatos) y la misma escala de dibujo.
const COLOR_CURVA = "#4338CA";
const COLOR_CURVA_CLARO = "#8A83FF";
const COLOR_SECANTE = "#F59E0B";
const COLOR_TANGENTE_FINAL = "#DC2626";
const COLOR_AREA = "#16A34A";
const COLOR_DIVERGE = "#DC2626";
const t = textosDe("Calculia.visuales");

const VISTA = { ancho: 320, alto: 210, izq: 30, der: 12, arriba: 12, abajo: 24 } as const;

function redondear1(n: number) {
  return Math.round(n * 10) / 10;
}

function numero(n: number, decimales = 2) {
  const texto = Math.abs(n).toLocaleString("es", { maximumFractionDigits: decimales });
  return n < 0 ? `−${texto}` : texto;
}

function escalaCalculia(rangoX: [number, number], valoresY: number[]) {
  const { ancho, alto, izq, der, arriba, abajo } = VISTA;
  const [xMin, xMax] = rangoX;
  let yMin = Math.min(0, ...valoresY);
  let yMax = Math.max(0, ...valoresY);
  if (yMax - yMin < 1e-6) {
    yMin -= 1;
    yMax += 1;
  }
  const margenY = (yMax - yMin) * 0.12;
  yMin -= margenY;
  yMax += margenY;
  const anchoUtil = ancho - izq - der;
  const altoUtil = alto - arriba - abajo;
  const px = (x: number) => redondear1(izq + ((x - xMin) / (xMax - xMin)) * anchoUtil);
  const py = (y: number) => redondear1(arriba + altoUtil - ((y - yMin) / (yMax - yMin)) * altoUtil);
  const ejeYpx = Math.min(ancho - der, Math.max(izq, px(0)));
  return { px, py, ejeXpx: py(0), ejeYpx };
}

function formulaFuncion(fn: TerminoFuncionCalculia[]): string {
  const partes = fn.map((tm) => {
    const abs = Math.abs(tm.c);
    const coef = abs === 1 && tm.n !== 0 ? "" : `${abs}`;
    let base: string;
    if (tm.tipo === "potencia") {
      base = tm.n === 0 ? "1" : tm.n === 1 ? "x" : `x^{${tm.n}}`;
    } else {
      const bTxt = tm.b === 0 ? "" : tm.b > 0 ? ` + ${tm.b}` : ` - ${Math.abs(tm.b)}`;
      const aTxt = tm.a === 1 ? "x" : `${tm.a}x`;
      base = tm.n === 1 ? `(${aTxt}${bTxt})` : `(${aTxt}${bTxt})^{${tm.n}}`;
    }
    const cuerpo = tm.n === 0 && tm.tipo === "potencia" ? `${abs}` : `${coef}${base}`;
    return tm.c < 0 ? `-${cuerpo}` : cuerpo;
  });
  return partes.map((p, i) => (i === 0 ? p : p.startsWith("-") ? ` - ${p.slice(1)}` : ` + ${p}`)).join("");
}

function Lienzo({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const ancho = Math.min(380, width - 64);
  return (
    <Svg width={ancho} height={(ancho * VISTA.alto) / VISTA.ancho} viewBox={`0 0 ${VISTA.ancho} ${VISTA.alto}`} style={{ alignSelf: "center" }}>
      {children}
    </Svg>
  );
}

function Ejes({ escala, conY = true }: { escala: ReturnType<typeof escalaCalculia>; conY?: boolean }) {
  return (
    <>
      <Line x1={VISTA.izq} y1={escala.ejeXpx} x2={VISTA.ancho - VISTA.der} y2={escala.ejeXpx} stroke={FG} strokeOpacity={0.5} strokeWidth={1.5} />
      {conY && <Line x1={escala.ejeYpx} y1={VISTA.arriba} x2={escala.ejeYpx} y2={VISTA.alto - VISTA.abajo} stroke={FG} strokeOpacity={0.5} strokeWidth={1.5} />}
    </>
  );
}

function trazoDe(puntos: { x: number; y: number }[], escala: ReturnType<typeof escalaCalculia>) {
  const px = puntos.map((p) => ({ x: escala.px(p.x), y: escala.py(p.y) }));
  return { d: px.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" "), largo: largoPoligonal(px) };
}

// ---------- Tangente: de secantes a la recta tangente ----------
type PasoTangente = "curva" | "secante1" | "secante2" | "tangente";
const PASOS_T: PasoTangente[] = ["curva", "secante1", "secante2", "tangente"];

export function Tangente({ visual }: { visual: VisualCalculiaTangente }) {
  const datos = useMemo(() => {
    try {
      return esVisualCalculiaTangente(visual) ? datosTangente(visual) : null;
    } catch {
      return null;
    }
  }, [visual]);
  const r = useReproductor({ total: datos ? PASOS_T.length : 0, ms: 2200, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const escala = escalaCalculia(datos.rango, datos.curva.map((p) => p.y));
  const formula = formulaFuncion(datos.funcion);
  const activos = new Set(PASOS_T.slice(0, r.paso));
  const ultimo = PASOS_T[Math.max(0, r.paso - 1)];
  const curva = trazoDe(datos.curva, escala);
  const [xMin, xMax] = datos.rango;
  const yEnXmin = datos.y0 + datos.pendiente * (xMin - datos.x0);
  const yEnXmax = datos.y0 + datos.pendiente * (xMax - datos.x0);
  return (
    <Marco acento={COLOR_CURVA} titulo={visual.titulo} r={r}>
      <Lienzo>
        <Ejes escala={escala} />
        <TrazoDibujado d={curva.d} largo={curva.largo} visible={activos.has("curva")} fill="none" stroke={COLOR_CURVA_CLARO} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {activos.has("secante1") && !activos.has("secante2") && (
          <Line x1={escala.px(datos.secante1.x1)} y1={escala.py(datos.secante1.y1)} x2={escala.px(datos.secante1.x2)} y2={escala.py(datos.secante1.y2)} stroke={COLOR_SECANTE} strokeWidth={2.5} strokeDasharray="6 4" />
        )}
        {activos.has("secante2") && !activos.has("tangente") && (
          <Line x1={escala.px(datos.secante2.x1)} y1={escala.py(datos.secante2.y1)} x2={escala.px(datos.secante2.x2)} y2={escala.py(datos.secante2.y2)} stroke={COLOR_SECANTE} strokeWidth={2.5} strokeDasharray="4 3" />
        )}
        {activos.has("tangente") && <Line x1={escala.px(xMin)} y1={escala.py(yEnXmin)} x2={escala.px(xMax)} y2={escala.py(yEnXmax)} stroke={COLOR_TANGENTE_FINAL} strokeWidth={2.5} />}
        <Circle cx={escala.px(datos.x0)} cy={escala.py(datos.y0)} r={4.5} fill={COLOR_TANGENTE_FINAL} stroke={SUPERFICIE} strokeWidth={1.5} />
      </Lienzo>
      <Leyenda acento={COLOR_CURVA}>
        <T>
          {ultimo === "curva"
            ? t("tangente.pasoCurva", { formula })
            : ultimo === "secante1"
              ? t("tangente.pasoSecante1")
              : ultimo === "secante2"
                ? t("tangente.pasoSecante2")
                : t("tangente.pasoTangente", { pendiente: numero(datos.pendiente) })}
        </T>
      </Leyenda>
    </Marco>
  );
}

// ---------- Área bajo la curva: rectángulos que se afinan ----------
type PasoArea = "curva" | "rectangulos1" | "rectangulos2" | "area";
const PASOS_A: PasoArea[] = ["curva", "rectangulos1", "rectangulos2", "area"];

export function Area({ visual }: { visual: VisualCalculiaArea }) {
  const datos = useMemo(() => {
    try {
      return esVisualCalculiaArea(visual) ? datosArea(visual) : null;
    } catch {
      return null;
    }
  }, [visual]);
  const r = useReproductor({ total: datos ? PASOS_A.length : 0, ms: 2200, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const alturas = [...datos.rectangulos4, ...datos.rectangulos12].map((rt) => rt.alto);
  const escala = escalaCalculia(datos.rango, [...datos.curva.map((p) => p.y), ...alturas]);
  const formula = formulaFuncion(datos.funcion);
  const activos = new Set(PASOS_A.slice(0, r.paso));
  const ultimo = PASOS_A[Math.max(0, r.paso - 1)];
  const curva = trazoDe(datos.curva, escala);
  const areaPath =
    datos.relleno.length > 1 ? `M${escala.px(datos.desde)} ${escala.ejeXpx} ` + datos.relleno.map((p) => `L${escala.px(p.x)} ${escala.py(p.y)}`).join(" ") + ` L${escala.px(datos.hasta)} ${escala.ejeXpx} Z` : "";
  const rectangulos = (rects: { x: number; ancho: number; alto: number }[]) =>
    rects.map((rt, i) => {
      const x1 = escala.px(rt.x);
      const x2 = escala.px(rt.x + rt.ancho);
      const yTop = escala.py(rt.alto);
      return <Rect key={i} x={Math.min(x1, x2)} y={Math.min(yTop, escala.ejeXpx)} width={redondear1(Math.abs(x2 - x1))} height={redondear1(Math.abs(escala.ejeXpx - yTop))} fill={COLOR_AREA} fillOpacity={0.35} stroke={COLOR_AREA} strokeWidth={1} />;
    });
  const desde = numero(datos.desde);
  const hasta = numero(datos.hasta);
  return (
    <Marco acento={COLOR_CURVA} titulo={visual.titulo} r={r}>
      <Lienzo>
        <Ejes escala={escala} />
        {activos.has("rectangulos1") && !activos.has("rectangulos2") && !activos.has("area") && rectangulos(datos.rectangulos4)}
        {activos.has("rectangulos2") && !activos.has("area") && rectangulos(datos.rectangulos12)}
        {activos.has("area") && areaPath ? <Path d={areaPath} fill={COLOR_AREA} fillOpacity={0.4} stroke={COLOR_AREA} strokeWidth={1.5} /> : null}
        <TrazoDibujado d={curva.d} largo={curva.largo} visible={activos.has("curva")} fill="none" stroke={COLOR_CURVA_CLARO} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </Lienzo>
      <Leyenda acento={COLOR_CURVA}>
        <T>
          {ultimo === "curva"
            ? t("area.pasoCurva", { formula, desde, hasta })
            : ultimo === "rectangulos1"
              ? t("area.pasoRectangulos1")
              : ultimo === "rectangulos2"
                ? t("area.pasoRectangulos2")
                : t("area.pasoArea", { area: numero(datos.area) })}
        </T>
      </Leyenda>
    </Marco>
  );
}

// ---------- Serie: sumas parciales ----------
const RectAnimado = Animated.createAnimatedComponent(Rect);

function Barra({ x, w, y, h, opacidad }: { x: number; w: number; y: number; h: number; opacidad: number }) {
  const yv = useSharedValue(y);
  const hv = useSharedValue(h);
  useEffect(() => {
    yv.set(withTiming(y, { duration: 350 }));
    hv.set(withTiming(h, { duration: 350 }));
  }, [y, h, yv, hv]);
  const props = useAnimatedProps(() => ({ y: yv.value, height: hv.value }));
  return <RectAnimado animatedProps={props} x={x} width={w} fill={COLOR_CURVA_CLARO} fillOpacity={opacidad} />;
}

export function Serie({ visual }: { visual: VisualCalculiaSerie }) {
  const datos = useMemo(() => {
    try {
      return esVisualCalculiaSerie(visual) ? datosSerie(visual) : null;
    } catch {
      return null;
    }
  }, [visual]);
  const r = useReproductor({ total: datos ? datos.parciales.length : 0, ms: 1100, estatico: visual.estatico });
  if (!datos) return null;
  const { ancho, izq, der, arriba, abajo, alto } = VISTA;
  const anchoUtil = ancho - izq - der;
  const altoUtil = alto - arriba - abajo;
  const n = datos.parciales.length;
  const valores = [0, ...datos.parciales, ...(datos.converge && datos.sumaInfinita !== null ? [datos.sumaInfinita] : [])];
  const rango = Math.max(Math.max(...valores) - Math.min(...valores), 1e-6);
  const techo = Math.max(...valores) + rango * 0.1;
  const piso = Math.min(...valores) - (Math.min(...valores) < 0 ? rango * 0.1 : 0);
  const yDe = (v: number) => redondear1(arriba + ((techo - v) / (techo - piso)) * altoUtil);
  const ejeXpx = yDe(0);
  const anchoBarra = anchoUtil / n;
  const visibles = datos.parciales.slice(0, r.paso);
  const a = numero(datos.a);
  const rr = numero(datos.r, 4);
  const suma = datos.sumaInfinita === null ? null : numero(datos.sumaInfinita);
  const ultima = visibles.length > 0 ? visibles[visibles.length - 1] : null;
  const texto =
    (ultima === null ? t("serie.alt", { a, r: rr }) : t("serie.sumaParcial", { n: visibles.length, valor: numero(ultima) })) +
    (r.alFinal && datos.converge && suma !== null ? ` — ${t("serie.altConverge", { total: suma })}` : "") +
    (r.alFinal && !datos.converge ? ` — ${t("serie.altDiverge")}` : "");
  return (
    <Marco acento={COLOR_CURVA} titulo={visual.titulo} r={r}>
      <Lienzo>
        <Line x1={izq} y1={ejeXpx} x2={ancho - der} y2={ejeXpx} stroke={FG} strokeOpacity={0.5} strokeWidth={1.5} />
        {datos.converge && suma !== null && (
          <Line x1={izq} y1={yDe(datos.sumaInfinita as number)} x2={ancho - der} y2={yDe(datos.sumaInfinita as number)} stroke={COLOR_AREA} strokeWidth={1.5} strokeDasharray="6 4" />
        )}
        {visibles.map((s, i) => (
          <Barra
            key={i}
            x={redondear1(izq + anchoBarra * i + anchoBarra * 0.15)}
            w={redondear1(anchoBarra * 0.7)}
            y={Math.min(yDe(s), ejeXpx)}
            h={Math.max(1, redondear1(Math.abs(yDe(s) - ejeXpx)))}
            opacidad={i === visibles.length - 1 ? 0.9 : 0.5}
          />
        ))}
      </Lienzo>
      <Leyenda acento={datos.converge ? COLOR_AREA : COLOR_DIVERGE}>
        <T>{texto}</T>
      </Leyenda>
    </Marco>
  );
}

// ---------- EDO: la familia de soluciones y la que pasa por el punto ----------
type PasoEdo = "familia" | "punto" | "pendiente";
const PASOS_E: PasoEdo[] = ["familia", "punto", "pendiente"];

function ecuacion(k: number, n: number) {
  const coef = k === 1 ? "" : k === -1 ? "-" : `${k}`;
  const potencia = n === 0 ? "" : n === 1 ? "x" : `x^{${n}}`;
  return `\\dfrac{dy}{dx} = ${coef}${potencia}${potencia ? "\\," : ""}y`;
}

function solucion(k: number, n: number) {
  const m = k / (n + 1);
  const coef = Number.isInteger(m) ? (m === 1 ? "" : m === -1 ? "-" : `${m}`) : `\\dfrac{${k}}{${n + 1}}`;
  return `y = A\\,e^{${coef}x^{${n + 1}}}`;
}

export function Edo({ visual }: { visual: VisualCalculiaEdo }) {
  const datos = useMemo(() => {
    try {
      return esVisualCalculiaEdo(visual) ? datosEdo(visual) : null;
    } catch {
      return null;
    }
  }, [visual]);
  const r = useReproductor({ total: datos ? PASOS_E.length : 0, ms: 2200, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const escala = escalaCalculia(datos.rango, datos.curvas.flatMap((c) => c.puntos.map((p) => p.y)));
  const activos = new Set(PASOS_E.slice(0, r.paso));
  const ultimo = PASOS_E[Math.max(0, r.paso - 1)];
  const eq = ecuacion(datos.k, datos.n);
  const sol = solucion(datos.k, datos.n);
  const x0 = numero(datos.x0);
  const y0 = numero(datos.y0);
  return (
    <Marco acento={COLOR_CURVA} titulo={visual.titulo} r={r}>
      <Lienzo>
        <Ejes escala={escala} />
        {datos.curvas.map((c) => {
          const tr = trazoDe(c.puntos, escala);
          return (
            <TrazoDibujado
              key={c.A}
              d={tr.d}
              largo={tr.largo}
              visible={activos.has("familia")}
              fill="none"
              stroke={COLOR_CURVA_CLARO}
              strokeOpacity={c.A === 1 ? 1 : 0.35}
              strokeWidth={c.A === 1 ? 3 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
        {activos.has("pendiente") && (
          <Line x1={escala.px(datos.tangente.x1)} y1={escala.py(datos.tangente.y1)} x2={escala.px(datos.tangente.x2)} y2={escala.py(datos.tangente.y2)} stroke={COLOR_TANGENTE_FINAL} strokeWidth={2.5} strokeLinecap="round" />
        )}
        {activos.has("punto") && <Circle cx={escala.px(datos.x0)} cy={escala.py(datos.y0)} r={4.5} fill={COLOR_TANGENTE_FINAL} stroke={SUPERFICIE} strokeWidth={1.5} />}
      </Lienzo>
      <Leyenda acento={COLOR_CURVA}>
        <T>
          {ultimo === "familia" ? t("edo.pasoFamilia", { eq, sol }) : ultimo === "punto" ? t("edo.pasoPunto", { x0, y0 }) : t("edo.pasoPendiente", { x0, y0, pendiente: numero(datos.pendiente) })}
        </T>
      </Leyenda>
    </Marco>
  );
}
