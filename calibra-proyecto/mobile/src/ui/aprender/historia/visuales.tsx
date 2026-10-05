import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { EPOCAS } from "@/lib/historia/epocas";
import { limitesSiglo , formatoAnio } from "@/lib/historia/tiempo";
import type { EpocaId } from "@/lib/historia/tipos";
import type { VisualHistoriaCausas, VisualHistoriaEpocas, VisualHistoriaLinea, VisualHistoriaPersonaje, VisualHistoriaSiglos, VisualHistoriaSincronia } from "@/lib/historia/visuales";
import { datosCausas, datosEpocas, datosLinea, datosPersonajes, datosSiglos, datosSincronia, MEDIDAS_SINCRONIA, r2, type EjemploSiglo } from "@/lib/historia/visualesDatos";
import { textosDe } from "~/lib/textosWeb";
import Texto from "../../Texto";
import { Aparece, BORDE, FG, GAparece, indiceActual, Leyenda, Marco, mezcla, SECUNDARIO, SUPERFICIE, T } from "../comun";
import { useReproductor } from "../reproductor";

// Visuales de las lecciones de Historia (components/historia/visuales de la web):
// mismos datos (lib/historia/visualesDatos), mismos textos y mismos pasos.

const COLOR_HISTORIA = "#A0522D";
const COLOR_EPOCA: Record<EpocaId, string> = {
  prehistoria: "#78716C",
  antiguedad: "#D97706",
  "edad-media": "#7C3AED",
  "edad-moderna": "#0D9488",
  contemporanea: "#2563EB",
};
const t = textosDe("Historia.visuales");

function seguro<T>(f: () => T): T | null {
  try {
    return f();
  } catch {
    return null;
  }
}

// ---------- Línea de tiempo ----------
const ANCHO_EJE = 104;
const X_EJE = 66;

export function Linea({ visual }: { visual: VisualHistoriaLinea }) {
  const datos = seguro(() => datosLinea(visual));
  const total = datos ? datos.filas.length : 0;
  const r = useReproductor({ total, ms: 1800, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos) return null;
  const actual = datos.filas[indiceActual(r.paso, datos.filas.length)];
  const prop = datos.escala === "proporcional";
  const primero = datos.filas[0];
  const ultimo = datos.filas[datos.filas.length - 1];
  return (
    <Marco acento={COLOR_HISTORIA} titulo={visual.titulo} r={r}>
      <View style={{ height: datos.alto }}>
        <Svg width={ANCHO_EJE} height={datos.alto} style={StyleSheet.absoluteFill}>
          <Line x1={X_EJE} y1={datos.margen} x2={X_EJE} y2={datos.alto - datos.margen} stroke={BORDE} strokeWidth={3} strokeLinecap="round" strokeDasharray={prop ? undefined : "2 6"} />
          {datos.marcas.map((m) => (
            <G key={m.texto}>
              <Line x1={X_EJE - 5} y1={m.y} x2={X_EJE + 5} y2={m.y} stroke={FG} strokeOpacity={0.45} strokeWidth={1.5} />
              <SvgText x={X_EJE - 9} y={m.y + 3} textAnchor="end" fontSize={9.5} fill={FG} opacity={0.65}>
                {m.texto}
              </SvgText>
            </G>
          ))}
          {datos.eraY !== null && (
            <G>
              <Line x1={X_EJE - 12} y1={datos.eraY} x2={X_EJE + 12} y2={datos.eraY} stroke={COLOR_HISTORIA} strokeWidth={2} />
              <SvgText x={X_EJE - 14} y={datos.eraY - 4} textAnchor="end" fontSize={8.5} fontWeight="700" fill={COLOR_HISTORIA}>
                {t("linea.era")}
              </SvgText>
            </G>
          )}
          {datos.filas.map((f, i) => {
            const activo = i === r.paso - 1;
            return (
              <GAparece key={f.id} visible={i < r.paso}>
                <Path d={`M${X_EJE},${f.yEje} L${X_EJE + 16},${f.yEje} L${ANCHO_EJE - 2},${f.yFila}`} fill="none" stroke={COLOR_HISTORIA} strokeOpacity={activo ? 0.9 : 0.4} strokeWidth={1.5} />
                <Circle cx={X_EJE} cy={f.yEje} r={activo ? 6.5 : 5} fill={f.certeza === "aproximada" ? SUPERFICIE : COLOR_HISTORIA} stroke={COLOR_HISTORIA} strokeWidth={2} />
              </GAparece>
            );
          })}
        </Svg>
        {datos.filas.map((f, i) => {
          const activo = i === r.paso - 1;
          return (
            <Aparece
              key={f.id}
              visible={i < r.paso}
              estilo={[
                styles.fila,
                {
                  left: ANCHO_EJE,
                  top: f.yFila - datos.altoFila / 2 + 3,
                  height: datos.altoFila - 6,
                  borderColor: activo ? COLOR_HISTORIA : BORDE,
                  backgroundColor: activo ? mezcla(COLOR_HISTORIA, 10) : SUPERFICIE,
                },
              ]}
            >
              <Texto v="cuerpo" tam={11.5} numberOfLines={3} style={{ lineHeight: 14 }}>
                <Texto v="fuerte" tam={11.5} c={COLOR_HISTORIA}>
                  {f.anioTexto}
                </Texto>{" "}
                · {f.nombre}
              </Texto>
            </Aparece>
          );
        })}
      </View>
      <Leyenda acento={COLOR_HISTORIA}>
        <T negrita>{`${actual.anioTexto} · ${actual.nombre}`}</T>
        <T tam={12} c={SECUNDARIO}>
          {t(`linea.certeza.${actual.certeza}`)}
        </T>
        <T tam={12} c={SECUNDARIO}>
          {prop ? t("linea.escala", { desde: formatoAnio(primero.anio), hasta: formatoAnio(ultimo.anio) }) : t("linea.sinEscala")}
        </T>
        {datos.superposicion ? (
          <T tam={12} c={SECUNDARIO}>
            {t("linea.superposicion")}
          </T>
        ) : null}
      </Leyenda>
    </Marco>
  );
}

// ---------- Épocas ----------
export function Epocas({ visual }: { visual: VisualHistoriaEpocas }) {
  const bandas = seguro(() => datosEpocas(visual));
  const total = bandas ? bandas.length : 0;
  const r = useReproductor({ total, ms: 1900, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!bandas) return null;
  const actual = bandas[indiceActual(r.paso, bandas.length)];
  return (
    <Marco acento={COLOR_HISTORIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 8 }}>
        {bandas.map((b, i) => {
          const activa = i === r.paso - 1;
          const c = COLOR_EPOCA[b.id];
          return (
            <Aparece
              key={b.id}
              visible={i < r.paso}
              opacidad={b.resaltada ? 1 : 0.55}
              estilo={[styles.banda, { borderColor: activa ? c : BORDE, backgroundColor: mezcla(c, activa ? 14 : 7) }]}
            >
              <View style={[styles.numero, { backgroundColor: c }]}>
                <Texto v="fuerte" tam={13} c="#fff">
                  {b.numero}
                </Texto>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Texto v="fuerte" tam={13}>
                  {b.nombreEs}{" "}
                  <Texto v="cuerpo" tam={13} c={SECUNDARIO}>
                    · {b.rango}
                  </Texto>
                </Texto>
                {b.frontera ? <T tam={11.5}>{`${t("epocas.empiezaCon")}: ${b.frontera.nombre} (${b.frontera.anioTexto})`}</T> : null}
                {b.ejemplos.length > 0 && (
                  <View style={styles.chips}>
                    {b.ejemplos.map((e) => (
                      <View key={e.id} style={styles.chip}>
                        <Texto v="cuerpo" tam={10.5}>
                          {e.nombre} · {e.anioTexto}
                        </Texto>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </Aparece>
          );
        })}
      </View>
      <Leyenda acento={COLOR_EPOCA[actual.id]}>
        <T negrita>{actual.nombreEs}</T>
        <T tam={12} c={SECUNDARIO}>
          {actual.frontera ? actual.frontera.nota : t("epocas.sinFrontera")}
        </T>
        <T tam={12} c={SECUNDARIO}>
          {t("epocas.sinEscala")}
        </T>
      </Leyenda>
    </Marco>
  );
}

// ---------- Causas ----------
const COLOR_ROL = { causa: "#D97706", hecho: "#A0522D", consecuencia: "#0D9488" } as const;

function Flecha({ c }: { c: string }) {
  return (
    <Svg width={20} height={26} viewBox="0 0 20 26">
      <Path d="M10 2 V20" stroke={c} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Path d="M4 15 L10 22 L16 15" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function Causas({ visual }: { visual: VisualHistoriaCausas }) {
  const nodos = seguro(() => datosCausas(visual));
  const total = nodos ? nodos.length : 0;
  const r = useReproductor({ total, ms: 2000, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!nodos) return null;
  const actual = nodos[indiceActual(r.paso, nodos.length)];
  return (
    <Marco acento={COLOR_HISTORIA} titulo={visual.titulo} r={r}>
      <View>
        {nodos.map((n, i) => {
          const activo = i === r.paso - 1;
          const c = COLOR_ROL[n.rol];
          return (
            <Aparece key={n.id} visible={i < r.paso}>
              {i > 0 && (
                <View style={{ alignItems: "center" }}>
                  <Texto v="micro" tam={10.5}>
                    {t("causas.provoco")}
                  </Texto>
                  <Flecha c={COLOR_HISTORIA} />
                </View>
              )}
              <View style={[styles.caja, { borderColor: activo ? c : BORDE, backgroundColor: mezcla(c, activo ? 14 : 7) }]}>
                <Texto v="micro" tam={10.5} c={c}>
                  {t(`causas.rol.${n.rol}`)}
                </Texto>
                <T negrita>{n.nombre}</T>
                <T tam={12} c={SECUNDARIO}>
                  {n.anioTexto}
                </T>
              </View>
            </Aparece>
          );
        })}
      </View>
      <Leyenda acento={COLOR_ROL[actual.rol]}>
        <T negrita>{t(`causas.rol.${actual.rol}`)}</T>
        <T tam={12} c={SECUNDARIO}>
          {t(`causas.explica.${actual.rol}`)}
        </T>
      </Leyenda>
    </Marco>
  );
}

// ---------- Siglos ----------
const ANCHO_S = 300;
const X0 = 14;
const X1 = 286;
const CirculoAnimado = Animated.createAnimatedComponent(Circle);

function posicion(e: EjemploSiglo): number {
  const { primero, ultimo } = limitesSiglo(e.n, e.aC);
  return r2((e.anio - primero) / (ultimo - primero));
}

function PuntoSiglo({ x }: { x: number }) {
  const cx = useSharedValue(x);
  useEffect(() => {
    cx.set(withTiming(x, { duration: 500 }));
  }, [x, cx]);
  const props = useAnimatedProps(() => ({ cx: cx.value }));
  return <CirculoAnimado animatedProps={props} cy={28} r={7} fill={COLOR_HISTORIA} stroke={SUPERFICIE} strokeWidth={2} />;
}

export function Siglos({ visual }: { visual: VisualHistoriaSiglos }) {
  const { width } = useWindowDimensions();
  const ejemplos = seguro(() => datosSiglos(visual));
  const total = ejemplos ? ejemplos.length : 0;
  const r = useReproductor({ total, ms: 2600, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!ejemplos) return null;
  const e = ejemplos[indiceActual(r.paso, ejemplos.length)];
  const p = posicion(e);
  const x = r2(X0 + p * (X1 - X0));
  const anchoSvg = Math.min(340, width - 70);
  return (
    <Marco acento={COLOR_HISTORIA} titulo={visual.titulo} r={r}>
      <View style={[styles.caja, { alignItems: "center", borderColor: BORDE, backgroundColor: SUPERFICIE }]}>
        <T tam={12} c={SECUNDARIO}>
          {e.etiqueta}
        </T>
        <Texto style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 26, color: COLOR_HISTORIA }}>{e.siglo}</Texto>
        <View style={{ alignSelf: "stretch", gap: 3 }}>
          <T tam={12.5}>{e.cierra ? t("siglos.pasoRedondo", { valor: e.valor, centenas: e.centenas }) : t("siglos.pasoCentenas", { valor: e.valor, centenas: e.centenas, resto: e.resto })}</T>
          <T tam={12.5}>{e.cierra ? t("siglos.pasoSigloRedondo", { n: e.n }) : t("siglos.pasoMasUno", { centenas: e.centenas, n: e.n })}</T>
          <T tam={12.5}>{t("siglos.pasoRomano", { n: e.n, romano: e.romano })}</T>
          {e.aC ? <T tam={12.5}>{t("siglos.pasoAC")}</T> : null}
        </View>
      </View>
      <Svg width={anchoSvg} height={(anchoSvg * 58) / ANCHO_S} viewBox={`0 0 ${ANCHO_S} 58`} style={{ alignSelf: "center" }}>
        <Rect x={X0} y={22} width={X1 - X0} height={12} rx={6} fill={BORDE} />
        <Rect x={X0} y={22} width={X1 - X0} height={12} rx={6} fill={COLOR_HISTORIA} opacity={0.18} />
        <PuntoSiglo x={x} />
        <SvgText x={X0} y={52} fontSize={10} fill={FG} opacity={0.75} textAnchor="start">
          {e.desde}
        </SvgText>
        <SvgText x={X1} y={52} fontSize={10} fill={FG} opacity={0.75} textAnchor="end">
          {e.hasta}
        </SvgText>
        <SvgText x={x} y={14} fontSize={10.5} fontWeight="700" fill={COLOR_HISTORIA} textAnchor={p > 0.8 ? "end" : p < 0.2 ? "start" : "middle"}>
          {e.aC ? `${e.valor} a. C.` : String(e.valor)}
        </SvgText>
      </Svg>
      <Leyenda acento={COLOR_HISTORIA}>
        <T tam={13}>{t("siglos.regla")}</T>
      </Leyenda>
    </Marco>
  );
}

// ---------- Sincronía ----------
const COLORES_CARRIL = ["#D97706", "#7C3AED", "#0D9488", "#2563EB"];

export function Sincronia({ visual }: { visual: VisualHistoriaSincronia }) {
  const { width } = useWindowDimensions();
  const datos = seguro(() => datosSincronia(visual));
  const total = datos ? datos.carriles.length : 0;
  const r = useReproductor({ total, ms: 2200, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos) return null;
  const { ancho, alto, x0, x1 } = datos;
  const { altoCarril, margenSup } = MEDIDAS_SINCRONIA;
  const yEje = margenSup + altoCarril * datos.carriles.length + 6;
  const visibles = datos.carriles.slice(0, r.paso);
  const leyenda = datos.leyenda.filter((m) => visibles.some((c) => c.marcas.some((x) => x.id === m.id)));
  const actual = datos.carriles[indiceActual(r.paso, datos.carriles.length)];
  const anchoSvg = Math.min(380, width - 70);
  return (
    <Marco acento={COLOR_HISTORIA} titulo={visual.titulo} r={r}>
      <Svg width={anchoSvg} height={(anchoSvg * alto) / ancho} viewBox={`0 0 ${ancho} ${alto}`} style={{ alignSelf: "center" }}>
        {datos.marcasEje.map((m) => (
          <G key={m.texto}>
            <Line x1={m.y} y1={margenSup - 4} x2={m.y} y2={yEje} stroke={BORDE} strokeWidth={1} strokeDasharray="3 4" />
            <SvgText x={m.y} y={yEje + 14} textAnchor="middle" fontSize={9.5} fill={FG} opacity={0.7}>
              {m.texto}
            </SvgText>
          </G>
        ))}
        <Line x1={x0} y1={yEje} x2={x1} y2={yEje} stroke={FG} strokeOpacity={0.4} strokeWidth={1.5} />
        {datos.carriles.map((c, i) => {
          const col = COLORES_CARRIL[i % COLORES_CARRIL.length];
          return (
            <GAparece key={c.region} visible={i < r.paso}>
              <SvgText x={4} y={c.y + 3.5} fontSize={10} fontWeight="700" fill={col}>
                {t(`regiones.${c.region}`)}
              </SvgText>
              <Line x1={x0} y1={c.y} x2={x1} y2={c.y} stroke={col} strokeOpacity={0.35} strokeWidth={2} />
              {c.marcas.map((m) => (
                <G key={m.id}>
                  <Circle cx={m.x} cy={c.y} r={10} fill={col} stroke={SUPERFICIE} strokeWidth={2} />
                  <SvgText x={m.x} y={c.y + 4} textAnchor="middle" fontSize={11} fontWeight="700" fill="#fff">
                    {String(m.numero)}
                  </SvgText>
                </G>
              ))}
            </GAparece>
          );
        })}
      </Svg>
      <View style={{ gap: 4 }}>
        {leyenda.map((m) => (
          <View key={m.id} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
            <View style={[styles.numeroChico, { backgroundColor: COLORES_CARRIL[datos.carriles.findIndex((c) => c.marcas.some((x) => x.id === m.id)) % COLORES_CARRIL.length] }]}>
              <Texto v="fuerte" tam={11} c="#fff">
                {m.numero}
              </Texto>
            </View>
            <Texto v="cuerpo" tam={12} style={{ flex: 1 }}>
              <Texto v="fuerte" tam={12}>
                {m.anioTexto}
              </Texto>{" "}
              · {m.nombre}
            </Texto>
          </View>
        ))}
      </View>
      <Leyenda acento={COLOR_HISTORIA}>
        <T>{t("sincronia.comparar", { region: t(`regiones.${actual.region}`) })}</T>
      </Leyenda>
    </Marco>
  );
}

// ---------- Personajes ----------
export function Personaje({ visual }: { visual: VisualHistoriaPersonaje }) {
  const fichas = seguro(() => datosPersonajes(visual));
  const total = fichas ? fichas.length : 0;
  const r = useReproductor({ total, ms: 2600, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!fichas) return null;
  const f = fichas[indiceActual(r.paso, fichas.length)];
  const c = COLOR_EPOCA[EPOCAS.find((e) => e.nombre.es === f.epocaEs)?.id ?? "antiguedad"];
  return (
    <Marco acento={COLOR_HISTORIA} titulo={visual.titulo} r={r}>
      <Aparece key={f.id} visible estilo={[styles.caja, { borderColor: c, backgroundColor: mezcla(c, 9), gap: 4 }]}>
        <Texto v="micro" tam={10.5} c={c}>
          {t("personaje.rol")}
        </Texto>
        <T tam={15} negrita>
          {f.nombre}
        </T>
        <T>{f.rol}</T>
        <View style={styles.chips}>
          <View style={[styles.chip, { backgroundColor: c, borderColor: c }]}>
            <Texto v="fuerte" tam={11} c="#fff">
              {f.epocaEs}
            </Texto>
          </View>
          <View style={styles.chip}>
            <Texto v="cuerpo" tam={11}>
              {t(`regiones.${f.region}`)}
            </Texto>
          </View>
          <View style={styles.chip}>
            <Texto v="cuerpo" tam={11}>
              {f.siglo}
            </Texto>
          </View>
        </View>
        <Texto v="cuerpo" tam={12.5}>
          <Texto v="fuerte" tam={12.5}>
            {t("personaje.vida")}:
          </Texto>{" "}
          {f.vida}
        </Texto>
        <T tam={12.5}>{f.logro}</T>
        {f.hechos.length > 0 && (
          <View style={{ borderTopWidth: 1, borderTopColor: BORDE, paddingTop: 6, marginTop: 4, gap: 2 }}>
            <Texto v="micro" tam={10.5}>
              {t("personaje.aparece")}
            </Texto>
            {f.hechos.map((h) => (
              <Texto key={h.id} v="cuerpo" tam={12}>
                {h.nombre} ·{" "}
                <Texto v="fuerte" tam={12}>
                  {h.anioTexto}
                </Texto>
              </Texto>
            ))}
          </View>
        )}
      </Aparece>
    </Marco>
  );
}

const styles = StyleSheet.create({
  fila: { position: "absolute", right: 0, justifyContent: "center", paddingHorizontal: 8, borderRadius: 8, borderWidth: 1 },
  banda: { flexDirection: "row", gap: 8, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  numero: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  numeroChico: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 2 },
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 1, borderColor: BORDE, backgroundColor: SUPERFICIE },
  caja: { gap: 2, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
});
