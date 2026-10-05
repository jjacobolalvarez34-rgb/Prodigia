import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View, type ViewStyle } from "react-native";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Svg, { Circle, G, Line, Path, Text as SvgText } from "react-native-svg";
import type { EjeValores, GraficoEstadistica as Grafico } from "@/lib/estadistica/tipos";
import type { VisualEstadisticaArbol, VisualEstadisticaDesvios, VisualEstadisticaDispersion, VisualEstadisticaFrecuencias, VisualEstadisticaGrafico, VisualEstadisticaNormal, VisualEstadisticaOrdenar } from "@/lib/estadistica/visuales";
import {
  bandasNormal,
  calcularDesvios,
  caminosArbol,
  densidadNormal,
  esGraficoEstadistica,
  esListaNumeros,
  esNumeroFinito,
  esRamas,
  media as mediaDe,
  ordenarYCuartiles,
  ordenarYMediana,
  regresionLineal,
  tablaFrecuencias,
  zScore,
  type NodoArbol,
} from "@/lib/estadistica/visualesDatos";
import { textosDe } from "~/lib/textosWeb";
import { color, fuente } from "~/tema";
import Texto from "../../Texto";
import GraficoEstadistica from "../../visuales/GraficoEstadistica";
import { Aparece, BORDE, FG, FONDO, GAparece, Marco, mezcla, SECUNDARIO, SUPERFICIE, T } from "../comun";
import { useReproductor } from "../reproductor";

// Visuales de las lecciones de Estadística (components/estadistica/visuales de la
// web): los mismos cálculos (lib/estadistica/visualesDatos).
const COLOR_ESTADISTICA = "#0D9488";
const CLARO = "#2DD4BF";
const t = textosDe("Estadistica.visuales");

function num(n: number) {
  const texto = Math.abs(n).toLocaleString("es", { maximumFractionDigits: 2 });
  return n < 0 ? `−${texto}` : texto;
}
function conSigno(n: number) {
  return n > 0 ? `+${num(n)}` : num(n);
}

function estiloFicha(activo: boolean): ViewStyle {
  return activo ? { backgroundColor: mezcla(COLOR_ESTADISTICA, 16), borderColor: COLOR_ESTADISTICA } : { backgroundColor: color.surface2, borderColor: BORDE };
}

function estiloDesvio(v: number): ViewStyle {
  if (v === 0) return { backgroundColor: color.surface2, borderColor: BORDE };
  const base = v > 0 ? color.correcto : color.error;
  return { backgroundColor: mezcla(base, 22), borderColor: base };
}

function Resultado({ children }: { children: string }) {
  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <T negrita c={CLARO} centro>
        {children}
      </T>
    </Animated.View>
  );
}

// Ficha que sube con resorte cuando aparece.
function Ficha({ visible, marcada, texto }: { visible: boolean; marcada: boolean; texto: string }) {
  const v = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    v.set(withSpring(visible ? 1 : 0, { damping: 22, stiffness: 300 }));
  }, [visible, v]);
  const a = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: (1 - v.value) * 10 }, { scale: 0.7 + v.value * (marcada ? 0.42 : 0.3) }] }));
  return (
    <Animated.View style={[styles.ficha, estiloFicha(marcada && visible), a]}>
      <Texto style={styles.mono}>{texto}</Texto>
    </Animated.View>
  );
}

// ---------- Ordenar (mediana, cuartiles, posición) ----------
export function Ordenar({ visual }: { visual: VisualEstadisticaOrdenar }) {
  const posOk = typeof visual.posicion === "number" && Number.isInteger(visual.posicion) && visual.posicion >= 1 && visual.posicion <= (visual.datos?.length ?? 0);
  const ok = esListaNumeros(visual.datos) && (visual.resaltar === "mediana" || visual.resaltar === "cuartiles" || (visual.resaltar === "posicion" && posOk));
  const datos = ok ? visual.datos : [0, 0];
  const r = useReproductor({ total: datos.length, ms: 500, estatico: visual.estatico });
  if (!ok) return null;
  const om = ordenarYMediana(datos);
  const oq = visual.resaltar === "cuartiles" ? ordenarYCuartiles(datos) : null;
  const ordenados = om.ordenados;
  const marcas = new Map<number, string>();
  if (visual.resaltar === "mediana") for (const i of om.indicesMediana) marcas.set(i, "M");
  else if (visual.resaltar === "posicion") marcas.set(visual.posicion! - 1, "▲");
  else {
    for (const i of oq!.indicesQ1) marcas.set(i, "Q1");
    for (const i of oq!.indicesMedianaExcluida) marcas.set(i, "M");
    for (const i of oq!.indicesQ3) marcas.set(i, "Q3");
  }
  const etiqueta =
    visual.resaltar === "mediana"
      ? t("ordenarMediana", { mediana: num(om.mediana) })
      : visual.resaltar === "posicion"
        ? t("ordenarPosicion", { etiqueta: visual.etiquetaPosicion ?? t("ordenarPosicionGenerica"), posicion: visual.posicion!, valor: num(ordenados[visual.posicion! - 1]) })
        : t("ordenarCuartiles", { q1: num(oq!.q1), mediana: num(oq!.mediana), q3: num(oq!.q3), iqr: num(oq!.iqr) });
  return (
    <Marco acento={COLOR_ESTADISTICA} titulo={visual.titulo} r={r}>
      <View style={{ alignItems: "center", gap: 8 }}>
        <Texto v="micro" tam={11}>
          {t("ordenarEtiquetaOriginales")}
        </Texto>
        <View style={styles.fichas}>
          {datos.map((d, i) => (
            <View key={i} style={[styles.ficha, estiloFicha(false)]}>
              <Texto style={styles.mono}>{num(d)}</Texto>
            </View>
          ))}
        </View>
        <Texto v="micro" tam={11}>
          {t("ordenarEtiquetaOrdenados")}
        </Texto>
        <View style={styles.fichas}>
          {ordenados.map((d, i) => {
            const visible = i < r.paso;
            const marca = marcas.get(i);
            return (
              <View key={i} style={{ alignItems: "center", gap: 2 }}>
                <Ficha visible={visible} marcada={!!marca} texto={num(d)} />
                <Texto style={{ height: 14, fontFamily: fuente.cuerpoBold, fontSize: 10, color: CLARO }}>{visible && marca ? marca : ""}</Texto>
              </View>
            );
          })}
        </View>
        {r.paso >= ordenados.length && <Resultado>{etiqueta}</Resultado>}
      </View>
    </Marco>
  );
}

// ---------- Tabla de frecuencias (barras) ----------
const ALTO_MAX = 96;

function BarraFrec({ alto, moda }: { alto: number; moda: boolean }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.set(withSpring(alto, { damping: 24, stiffness: 210 }));
  }, [alto, h]);
  const a = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[{ width: 32, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderWidth: 2, borderColor: moda ? COLOR_ESTADISTICA : BORDE, backgroundColor: moda ? COLOR_ESTADISTICA : color.surface2 }, a]} />;
}

export function Frecuencias({ visual }: { visual: VisualEstadisticaFrecuencias }) {
  const ok = esListaNumeros(visual.datos);
  const datos = ok ? visual.datos : [0, 0];
  const tabla = tablaFrecuencias(datos);
  const r = useReproductor({ total: tabla.valores.length, ms: 700, estatico: visual.estatico });
  if (!ok) return null;
  const mediaTexto = visual.mostrarMedia ? t("frecuenciasMedia", { media: num(mediaDe(datos)) }) : null;
  const moda =
    tabla.indicesModa.length === 0
      ? t("frecuenciasSinModa")
      : tabla.indicesModa.length === 1
        ? t("frecuenciasModa", { moda: num(tabla.valores[tabla.indicesModa[0]]) })
        : t("frecuenciasModaVarias", { modas: tabla.indicesModa.map((i) => num(tabla.valores[i])).join(", ") });
  return (
    <Marco acento={COLOR_ESTADISTICA} titulo={visual.titulo} r={r}>
      <View style={[styles.fichas, { alignItems: "flex-end", gap: 12, minHeight: ALTO_MAX + 30 }]}>
        {tabla.valores.map((v, i) => {
          const visible = i < r.paso;
          const esModa = tabla.indicesModa.includes(i) && visible;
          return (
            <View key={v} style={{ alignItems: "center", gap: 4 }}>
              <Texto v="fuerte" tam={12} c={esModa ? CLARO : SECUNDARIO}>
                {visible ? String(tabla.frecuencias[i]) : ""}
              </Texto>
              <BarraFrec alto={visible ? Math.max(6, (tabla.frecuencias[i] / tabla.maxFrecuencia) * ALTO_MAX) : 0} moda={esModa} />
              <Texto style={[styles.mono, { fontSize: 12 }]}>{num(v)}</Texto>
            </View>
          );
        })}
      </View>
      {r.paso >= tabla.valores.length && (
        <View style={{ gap: 2 }}>
          <Resultado>{moda}</Resultado>
          {mediaTexto ? <Resultado>{mediaTexto}</Resultado> : null}
        </View>
      )}
    </Marco>
  );
}

// ---------- Desvíos respecto del centro ----------
export function Desvios({ visual }: { visual: VisualEstadisticaDesvios }) {
  const ok =
    esListaNumeros(visual.datos, 1) &&
    esNumeroFinito(visual.centro) &&
    typeof visual.etiquetaCentro === "string" &&
    visual.etiquetaCentro.length > 0 &&
    (visual.sigma === undefined || (esNumeroFinito(visual.sigma) && visual.sigma > 0));
  const d = calcularDesvios(ok ? visual.datos : [0], ok ? visual.centro : 0);
  const r = useReproductor({ total: d.datos.length, ms: 700, estatico: visual.estatico });
  if (!ok) return null;
  const sigma = visual.sigma;
  const etiqueta = visual.mostrarCuadrados
    ? t("desviosEtiquetaCuadrados", { suma: num(d.sumaCuadrados) })
    : sigma !== undefined
      ? t("desviosEtiquetaZ", { sigma: num(sigma) })
      : t("desviosEtiquetaSuma", { suma: conSigno(d.sumaDesviaciones) });
  return (
    <Marco acento={COLOR_ESTADISTICA} titulo={visual.titulo} r={r}>
      <T tam={12} c={SECUNDARIO} centro>
        {t("desviosCentro", { etiqueta: visual.etiquetaCentro, centro: num(visual.centro) })}
      </T>
      <View style={[styles.fichas, { gap: 10 }]}>
        {d.datos.map((v, i) => {
          const visible = i < r.paso;
          return (
            <Aparece key={i} visible={visible} ms={350} estilo={[styles.desvio, estiloDesvio(visible ? d.desviaciones[i] : 0)]}>
              <Texto style={styles.mono}>{num(v)}</Texto>
              <Texto style={[styles.mono, { fontSize: 12 }]}>{visible ? conSigno(d.desviaciones[i]) : "…"}</Texto>
              {visual.mostrarCuadrados ? <Texto v="nota" tam={10}>{visible ? `² = ${num(d.cuadrados[i])}` : " "}</Texto> : null}
              {sigma !== undefined ? <Texto v="nota" tam={10}>{visible ? `z = ${conSigno(zScore(v, visual.centro, sigma))}` : " "}</Texto> : null}
            </Aparece>
          );
        })}
      </View>
      {r.paso >= d.datos.length && <Resultado>{etiqueta}</Resultado>}
    </Marco>
  );
}

// ---------- Gráfico (el mismo que en Práctica) ----------
const CLAVE_TIPO = { barras: "graficoTipoBarras", lineas: "graficoTipoLineas", histograma: "graficoTipoHistograma", boxplot: "graficoTipoBoxplot" } as const;

export function GraficoLeccion({ visual }: { visual: VisualEstadisticaGrafico }) {
  if (!esGraficoEstadistica(visual.grafico)) return null;
  const g: Grafico = visual.grafico;
  return (
    <Marco acento={COLOR_ESTADISTICA} titulo={visual.titulo ?? t("graficoEtiqueta", { tipo: t(CLAVE_TIPO[g.tipo]), titulo: g.titulo })}>
      <Animated.View entering={FadeIn.duration(500)}>
        <GraficoEstadistica grafico={g} acento={CLARO} />
      </Animated.View>
    </Marco>
  );
}

// ---------- Dispersión y recta de regresión ----------
const ANCHO_G = 360;
const ALTO_G = 250;
const MARGEN = { izq: 44, der: 14, arriba: 34, abajo: 42 };
const AREA_W = ANCHO_G - MARGEN.izq - MARGEN.der;
const AREA_H = ALTO_G - MARGEN.arriba - MARGEN.abajo;

function marcasDe(eje: EjeValores) {
  const m: number[] = [];
  for (let v = eje.min; v <= eje.max + 1e-9; v += eje.tick) m.push(Math.round(v * 1000) / 1000);
  return m;
}
const yDe = (v: number, eje: EjeValores) => MARGEN.arriba + AREA_H * (1 - (v - eje.min) / (eje.max - eje.min));
const xDe = (v: number, eje: EjeValores) => MARGEN.izq + AREA_W * ((v - eje.min) / (eje.max - eje.min));

function ejeAuto(valores: readonly number[], etiqueta: string): EjeValores {
  const max = Math.max(...valores);
  const min = Math.min(0, ...valores);
  const rango = Math.max(1e-9, max - min);
  const candidatos = [1, 2, 5, 10, 20, 25, 50, 100];
  const tick = candidatos.find((c) => rango / c <= 6) ?? candidatos[candidatos.length - 1];
  return { min: Math.floor(min / tick) * tick, max: Math.ceil((max + 1e-9) / tick) * tick, tick, etiqueta };
}

export function Dispersion({ visual }: { visual: VisualEstadisticaDispersion }) {
  const { width } = useWindowDimensions();
  const ok = esListaNumeros(visual.x) && esListaNumeros(visual.y) && visual.x.length === visual.y.length;
  const xs = ok ? visual.x : [0, 1];
  const ys = ok ? visual.y : [0, 1];
  const n = xs.length;
  const r = useReproductor({ total: n, ms: 400, estatico: visual.estatico });
  if (!ok) return null;
  const reg = regresionLineal(xs, ys);
  const ejeX = ejeAuto(xs, visual.etiquetaX ?? "x");
  const ejeY = ejeAuto(ys, visual.etiquetaY ?? "y");
  const yRecta = (xv: number) => Math.max(ejeY.min, Math.min(ejeY.max, reg.pendiente * xv + reg.intercepto));
  const etiqueta = t("dispersionEtiqueta", { r: num(reg.r) });
  const ancho = Math.min(384, width - 64);
  return (
    <Marco acento={COLOR_ESTADISTICA} titulo={visual.titulo} r={r}>
      <Svg width={ancho} height={(ancho * ALTO_G) / ANCHO_G} viewBox={`0 0 ${ANCHO_G} ${ALTO_G}`} style={{ alignSelf: "center" }}>
        <SvgText x={ANCHO_G / 2} y={18} textAnchor="middle" fontSize={12} fontWeight="700" fill={FG}>
          {etiqueta}
        </SvgText>
        {marcasDe(ejeY).map((v) => (
          <G key={v}>
            <Line x1={MARGEN.izq} x2={ANCHO_G - MARGEN.der} y1={yDe(v, ejeY)} y2={yDe(v, ejeY)} stroke={FG} strokeOpacity={0.2} />
            <SvgText x={MARGEN.izq - 6} y={yDe(v, ejeY) + 3.5} textAnchor="end" fontSize={10} fill={FG} fillOpacity={0.75}>
              {String(v)}
            </SvgText>
          </G>
        ))}
        <Line x1={MARGEN.izq} x2={MARGEN.izq} y1={MARGEN.arriba} y2={MARGEN.arriba + AREA_H} stroke={FG} strokeOpacity={0.5} />
        {marcasDe(ejeX).map((v) => (
          <SvgText key={`x-${v}`} x={xDe(v, ejeX)} y={MARGEN.arriba + AREA_H + 16} textAnchor="middle" fontSize={10} fill={FG} fillOpacity={0.75}>
            {String(v)}
          </SvgText>
        ))}
        <Line x1={MARGEN.izq} x2={MARGEN.izq + AREA_W} y1={yDe(ejeY.min, ejeY)} y2={yDe(ejeY.min, ejeY)} stroke={FG} strokeOpacity={0.5} />
        {visual.mostrarRecta && (
          <GAparece visible={r.paso >= n} ms={400}>
            <Line x1={xDe(ejeX.min, ejeX)} y1={yDe(yRecta(ejeX.min), ejeY)} x2={xDe(ejeX.max, ejeX)} y2={yDe(yRecta(ejeX.max), ejeY)} stroke={CLARO} strokeWidth={2} />
          </GAparece>
        )}
        {xs.map((xi, i) => (
          <GAparece key={i} visible={i < r.paso} ms={250}>
            <Circle cx={xDe(xi, ejeX)} cy={yDe(ys[i], ejeY)} r={5} fill={CLARO} stroke={FONDO} strokeWidth={1.5} />
          </GAparece>
        ))}
        <SvgText x={ANCHO_G / 2} y={MARGEN.arriba + AREA_H + 32} textAnchor="middle" fontSize={10} fill={FG} fillOpacity={0.75}>
          {visual.etiquetaX ?? "x"}
        </SvgText>
        <SvgText x={MARGEN.izq} y={MARGEN.arriba - 8} fontSize={10} fill={FG} fillOpacity={0.75}>
          {visual.etiquetaY ?? "y"}
        </SvgText>
      </Svg>
      {r.paso >= n && (
        <View style={{ gap: 2 }}>
          <Resultado>{t("dispersionR", { r: num(reg.r) })}</Resultado>
          {visual.mostrarRecta ? <Resultado>{t("dispersionRecta", { pendiente: num(reg.pendiente), intercepto: num(reg.intercepto) })}</Resultado> : null}
        </View>
      )}
    </Marco>
  );
}

// ---------- Árbol de probabilidad ----------
function Rama({ nodo, nivel }: { nodo: NodoArbol; nivel: number }) {
  return (
    <View style={{ gap: 6, alignItems: "flex-start" }}>
      <View style={[styles.nodo, { backgroundColor: mezcla(COLOR_ESTADISTICA, 10 + nivel * 6) }]}>
        <Texto v="cuerpo" tam={12}>
          {nodo.etiqueta}
        </Texto>
        <Texto style={[styles.mono, { color: CLARO }]}>{num(nodo.probabilidad)}</Texto>
      </View>
      {nodo.hijos ? (
        <View style={{ marginLeft: 12, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: BORDE, gap: 6 }}>
          {nodo.hijos.map((h, i) => (
            <Rama key={i} nodo={h} nivel={nivel + 1} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function ArbolProbabilidad({ visual }: { visual: VisualEstadisticaArbol }) {
  const ok = typeof visual.raiz === "string" && visual.raiz.length > 0 && esRamas(visual.ramas);
  const ramas = ok ? visual.ramas : [];
  const r = useReproductor({ total: ramas.length, ms: 900, estatico: visual.estatico });
  if (!ok) return null;
  const caminos = caminosArbol(ramas);
  const producto = (f: number[]) => f.map(num).join(" × ");
  return (
    <Marco acento={COLOR_ESTADISTICA} titulo={visual.titulo} r={r}>
      <Texto v="micro" centro>
        {visual.raiz}
      </Texto>
      <View style={{ gap: 8 }}>
        {ramas.map((nodo, i) => (
          <Aparece key={i} visible={i < r.paso} ms={300}>
            <Rama nodo={nodo} nivel={0} />
          </Aparece>
        ))}
      </View>
      {r.paso >= ramas.length && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.caminos}>
          {caminos.map((c, i) => (
            <Texto key={i} v="fuerte" tam={12}>
              {t("arbolCamino", { camino: c.etiquetas.join(" → "), producto: producto(c.factores), probabilidad: num(c.probabilidad) })}
            </Texto>
          ))}
        </Animated.View>
      )}
    </Marco>
  );
}

// ---------- Curva normal y regla 68-95-99,7 ----------
const ANCHO_N = 360;
const ALTO_N = 190;
const MARGEN_X = 14;
const BASE_Y = 150;
const ALTO_CURVA = 120;
const OPACIDAD_BANDA = { 1: 0.5, 2: 0.32, 3: 0.16 } as const;

export function Normal({ visual }: { visual: VisualEstadisticaNormal }) {
  const { width } = useWindowDimensions();
  const ok = esNumeroFinito(visual.media) && esNumeroFinito(visual.sigma) && visual.sigma > 0 && (visual.marcarX === undefined || esNumeroFinito(visual.marcarX));
  const hayMarca = ok && visual.marcarX !== undefined;
  const r = useReproductor({ total: hayMarca ? 4 : 3, ms: 1100, estatico: visual.estatico });
  if (!ok) return null;
  const { media, sigma } = visual;
  const bandas = bandasNormal(media, sigma);
  const xMin = media - 4 * sigma;
  const xMax = media + 4 * sigma;
  const xPix = (x: number) => MARGEN_X + ((x - xMin) / (xMax - xMin)) * (ANCHO_N - 2 * MARGEN_X);
  const pico = densidadNormal(media, media, sigma);
  const yPix = (x: number) => BASE_Y - (densidadNormal(x, media, sigma) / pico) * ALTO_CURVA;
  const puntos = (desde: number, hasta: number, pasos: number) =>
    Array.from({ length: pasos + 1 }, (_, i) => {
      const x = desde + ((hasta - desde) * i) / pasos;
      return [xPix(x), yPix(x)] as const;
    });
  const curva = puntos(xMin, xMax, 80)
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const areaBanda = (k: number) => {
    const p = puntos(media - k * sigma, media + k * sigma, 40);
    return `M${p[0][0].toFixed(1)} ${BASE_Y} ${p.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")} L${p[p.length - 1][0].toFixed(1)} ${BASE_Y} Z`;
  };
  const textoBanda = (b: (typeof bandas)[number]) => t("normalBanda", { k: b.k, porcentaje: num(b.porcentaje), desde: num(b.desde), hasta: num(b.hasta) });
  const z = hayMarca ? zScore(visual.marcarX!, media, sigma) : null;
  const marcaVisible = hayMarca && r.paso >= 4;
  const ancho = Math.min(384, width - 64);
  return (
    <Marco acento={COLOR_ESTADISTICA} titulo={visual.titulo ?? t("normalEtiqueta", { media: num(media), sigma: num(sigma) })} r={r}>
      <Svg width={ancho} height={(ancho * ALTO_N) / ANCHO_N} viewBox={`0 0 ${ANCHO_N} ${ALTO_N}`} style={{ alignSelf: "center" }}>
        {[3, 2, 1].map((k) => (
          <GAparece key={k} visible={r.paso >= k} opacidad={OPACIDAD_BANDA[k as 1 | 2 | 3]} ms={500}>
            <Path d={areaBanda(k)} fill={CLARO} />
          </GAparece>
        ))}
        <Path d={curva} fill="none" stroke={FG} strokeWidth={2} strokeLinejoin="round" />
        <Line x1={MARGEN_X} x2={ANCHO_N - MARGEN_X} y1={BASE_Y} y2={BASE_Y} stroke={FG} strokeOpacity={0.5} />
        {[-3, -2, -1, 0, 1, 2, 3].map((j) => {
          const x = media + j * sigma;
          return (
            <G key={j}>
              <Line x1={xPix(x)} x2={xPix(x)} y1={BASE_Y} y2={BASE_Y + 4} stroke={FG} strokeOpacity={0.6} />
              <SvgText x={xPix(x)} y={BASE_Y + 16} textAnchor="middle" fontSize={10} fill={FG} fillOpacity={0.85}>
                {num(Math.round(x * 100) / 100)}
              </SvgText>
              <SvgText x={xPix(x)} y={BASE_Y + 29} textAnchor="middle" fontSize={9} fill={FG} fillOpacity={0.55}>
                {j === 0 ? "μ" : j > 0 ? `+${j}σ` : `−${Math.abs(j)}σ`}
              </SvgText>
            </G>
          );
        })}
        {hayMarca && (
          <GAparece visible={marcaVisible} ms={400}>
            <Line x1={xPix(visual.marcarX!)} x2={xPix(visual.marcarX!)} y1={BASE_Y} y2={yPix(visual.marcarX!) - 6} stroke={color.logro} strokeWidth={2.5} />
            <Circle cx={xPix(visual.marcarX!)} cy={yPix(visual.marcarX!)} r={4.5} fill={color.logro} stroke={FONDO} strokeWidth={1.5} />
            <SvgText x={xPix(visual.marcarX!)} y={yPix(visual.marcarX!) - 12} textAnchor="middle" fontSize={11} fontWeight="700" fill={FG}>
              {`z = ${z! > 0 ? "+" : ""}${num(z!)}`}
            </SvgText>
          </GAparece>
        )}
      </Svg>
      <View style={{ gap: 3 }}>
        {bandas.map((b) => (
          <View key={b.k} style={{ opacity: r.paso >= b.k ? 1 : 0.4 }}>
            <Texto v="fuerte" tam={12} c={r.paso >= b.k ? FG : SECUNDARIO}>
              {textoBanda(b)}
            </Texto>
          </View>
        ))}
      </View>
      {marcaVisible && z !== null && <Resultado>{t("normalMarca", { x: num(visual.marcarX!), z: (z > 0 ? "+" : "") + num(z) })}</Resultado>}
    </Marco>
  );
}

const styles = StyleSheet.create({
  fichas: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  ficha: { minWidth: 36, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 2, alignItems: "center" },
  mono: { fontFamily: fuente.mono, fontSize: 14, color: FG },
  desvio: { minWidth: 48, alignItems: "center", gap: 2, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, borderWidth: 2 },
  nodo: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 2, borderColor: COLOR_ESTADISTICA },
  caminos: { gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: BORDE, backgroundColor: SUPERFICIE },
});
