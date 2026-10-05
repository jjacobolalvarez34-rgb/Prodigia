import { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { tokensPorLinea, type TipoToken } from "@/components/codia/resaltado";
import type { TipoFallo } from "@/lib/codia/interprete";
import { NOMBRE_LENGUAJE, type Lenguaje } from "@/lib/codia/tipos";
import type { VisualCodiaComparar, VisualCodiaCrecimiento, VisualCodiaFlujo, VisualCodiaTraza } from "@/lib/codia/visuales";
import { datosComparar, datosCrecimiento, datosFlujo, datosTraza, nombreFallo, type FlujoBucle, type FlujoCondicional } from "@/lib/codia/visualesDatos";
import { textosDe } from "~/lib/textosWeb";
import { color, fuente } from "~/tema";
import Texto from "../../Texto";
import { Aparece, BORDE, FG, FONDO, Leyenda, Marco, mezcla, SECUNDARIO } from "../comun";
import { useReproductor } from "../reproductor";

// Visuales de las lecciones de Codia (components/codia/visuales de la web): el mismo
// intérprete (lib/codia) ejecuta el programa y se muestra paso a paso.
const COLOR_CODIA = "#06B6D4";
const tv = textosDe("Codia.visuales");

function textoError(fallo: TipoFallo, nombre: string | null): string {
  const descripcion = tv(`fallos.${fallo}`);
  return tv("error", { detalle: nombre ? `${nombre} (${descripcion})` : descripcion });
}

const COLOR_TOKEN: Record<TipoToken, string | undefined> = {
  clave: "#22B8D6",
  cadena: "#8FE3B9",
  numero: "#FFB27A",
  comentario: SECUNDARIO,
  texto: undefined,
};

// Bloque de código con resaltado (BloqueCodigo.tsx de la web): mismos tokens.
export function BloqueCodigo({ codigo, lenguaje, numeros = true, resaltarLinea }: { codigo: string; lenguaje: Lenguaje; numeros?: boolean; resaltarLinea?: number }) {
  const lineas = tokensPorLinea(codigo, lenguaje);
  const ancho = String(lineas.length).length;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.codigo} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}>
      <View>
        {lineas.map((toks, i) => (
          <View key={i} style={[{ flexDirection: "row" }, resaltarLinea === i + 1 && styles.lineaActiva]}>
            {numeros && <Texto style={[styles.mono, { color: SECUNDARIO, minWidth: ancho * 8 + 6, textAlign: "right", marginRight: 10 }]}>{i + 1}</Texto>}
            <Texto style={styles.mono}>
              {toks.length === 0
                ? " "
                : toks.map((tk, j) =>
                    COLOR_TOKEN[tk.tipo] ? (
                      <Texto key={j} style={[styles.mono, { color: COLOR_TOKEN[tk.tipo], fontStyle: tk.tipo === "comentario" ? "italic" : "normal", fontFamily: tk.tipo === "clave" ? fuente.mono : fuente.monoMedio }]}>
                        {tk.texto}
                      </Texto>
                    ) : (
                      tk.texto
                    )
                  )}
            </Texto>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Variables({ variables, vacio }: { variables: [string, string][]; vacio: string }) {
  if (variables.length === 0)
    return (
      <Texto v="cuerpo" tam={13} c={SECUNDARIO}>
        {vacio}
      </Texto>
    );
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 14, rowGap: 2 }}>
      {variables.map(([n, v]) => (
        <Texto key={n} style={styles.mono}>
          <Texto style={[styles.mono, { color: COLOR_CODIA, fontFamily: fuente.mono }]}>{n}</Texto> = {v}
        </Texto>
      ))}
    </View>
  );
}

function Salida({ texto }: { texto: string }) {
  return (
    <View style={styles.salida}>
      <Texto style={styles.mono}>
        <Texto style={[styles.mono, { color: SECUNDARIO }]}>{"> "}</Texto>
        {texto}
      </Texto>
    </View>
  );
}

function Chip({ verdadero, texto }: { verdadero: boolean; texto: string }) {
  const c = verdadero ? color.correcto : color.error;
  return (
    <View style={[styles.chip, { borderColor: mezcla(c, 50), backgroundColor: mezcla(c, 15) }]}>
      <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 10.5, letterSpacing: 0.6, color: c }}>{texto.toUpperCase()}</Texto>
    </View>
  );
}

// ---------- Traza ----------
export function Traza({ visual }: { visual: VisualCodiaTraza }) {
  const t = textosDe("Codia.visuales.traza");
  const datos = useMemo(() => {
    try {
      return datosTraza(visual.programa, visual.lenguaje);
    } catch {
      return null;
    }
  }, [visual.programa, visual.lenguaje]);
  const total = datos?.pasos.length ?? 0;
  const r = useReproductor({ total, ms: 1300, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos || total === 0) return null;
  const actual = datos.pasos[Math.max(0, r.paso - 1)];
  const detalleError = datos.fallo ? textoError(datos.fallo, nombreFallo(datos.fallo, visual.lenguaje)) : null;
  return (
    <Marco acento={COLOR_CODIA} titulo={visual.titulo} r={r}>
      <Texto v="micro">{NOMBRE_LENGUAJE[visual.lenguaje]}</Texto>
      <BloqueCodigo codigo={datos.codigo} lenguaje={visual.lenguaje} resaltarLinea={actual?.linea} />
      <Leyenda acento={COLOR_CODIA}>
        <Texto v="fuerte" tam={13} c={SECUNDARIO}>
          {t("variablesDespues", { linea: actual.linea })}
        </Texto>
        <Variables variables={actual.variables} vacio={t("sinVariables")} />
      </Leyenda>
      {r.paso >= total && (
        <Leyenda acento={COLOR_CODIA}>
          <Texto v="fuerte" tam={13} c={SECUNDARIO}>
            {t("salida")}
          </Texto>
          <Texto style={styles.mono}>{detalleError ?? (datos.salida || t("sinSalida"))}</Texto>
        </Leyenda>
      )}
    </Marco>
  );
}

// ---------- Comparar el mismo programa en los 4 lenguajes ----------
export function Comparar({ visual }: { visual: VisualCodiaComparar }) {
  const t = textosDe("Codia.visuales.comparar");
  const datos = useMemo(() => {
    try {
      return datosComparar(visual.programa);
    } catch {
      return null;
    }
  }, [visual.programa]);
  const total = datos?.resultados.length ?? 0;
  const r = useReproductor({ total, ms: 1400, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos || total === 0) return null;
  return (
    <Marco acento={COLOR_CODIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 12 }}>
        {datos.resultados.slice(0, r.paso).map((res) => (
          <Aparece key={res.lenguaje} visible ms={300} estilo={{ gap: 6 }}>
            <Texto v="micro">{NOMBRE_LENGUAJE[res.lenguaje]}</Texto>
            <BloqueCodigo codigo={res.codigo} lenguaje={res.lenguaje} numeros={false} />
            {res.fallo ? (
              <View style={styles.salida}>
                <Texto style={[styles.mono, { color: color.error, fontFamily: fuente.mono }]}>{textoError(res.fallo, res.nombreError)}</Texto>
              </View>
            ) : (
              <Salida texto={res.salida || t("sinSalida")} />
            )}
          </Aparece>
        ))}
      </View>
    </Marco>
  );
}

// ---------- Crecimiento (cuántas operaciones según n) ----------
function BarraCrece({ porcentaje }: { porcentaje: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.set(withTiming(porcentaje, { duration: 400 }));
  }, [porcentaje, w]);
  const estilo = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View style={styles.barraFondo}>
      <Animated.View style={[{ height: "100%", borderRadius: 4, backgroundColor: COLOR_CODIA }, estilo]} />
    </View>
  );
}

export function Crecimiento({ visual }: { visual: VisualCodiaCrecimiento }) {
  const t = textosDe("Codia.visuales.crecimiento");
  const datos = useMemo(() => {
    try {
      if (!Array.isArray(visual.series) || !Array.isArray(visual.ns) || visual.ns.length === 0 || visual.series.length === 0) return null;
      return datosCrecimiento(visual.series, visual.ns);
    } catch {
      return null;
    }
  }, [visual.series, visual.ns]);
  const total = datos?.ns.length ?? 0;
  const r = useReproductor({ total, ms: 1300, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos || total === 0) return null;
  return (
    <Marco acento={COLOR_CODIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 10 }}>
        {datos.series.map((serie) => {
          const maximo = Math.max(...serie.valores, 1);
          return (
            <View key={serie.nombre} style={[styles.serie]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <Texto v="fuerte" tam={13}>
                  {serie.nombre}
                </Texto>
                <Texto style={[styles.mono, { color: COLOR_CODIA }]}>{serie.etiqueta}</Texto>
              </View>
              {datos.ns.slice(0, r.paso).map((valorN, i) => (
                <View key={valorN} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Texto style={[styles.mono, { width: 52, textAlign: "right", color: SECUNDARIO, fontSize: 12 }]}>n = {valorN}</Texto>
                  <BarraCrece porcentaje={Math.max(4, Math.round((serie.valores[i] / maximo) * 100))} />
                  <Texto style={[styles.mono, { width: 40, textAlign: "right", fontSize: 12, fontFamily: fuente.mono }]}>{serie.valores[i]}</Texto>
                  <Texto style={[styles.mono, { width: 36, fontSize: 11, color: SECUNDARIO }]}>{serie.factores[i] !== null ? `×${serie.factores[i]}` : ""}</Texto>
                </View>
              ))}
            </View>
          );
        })}
      </View>
      <Texto v="nota" tam={12} centro>
        {t("leyenda")}
      </Texto>
    </Marco>
  );
}

// ---------- Flujo (si / sino y bucles) ----------
interface NodoRama {
  clave: string;
  condicion: string | null;
  resultado: boolean | null;
  accion: string | null;
  recorrida: boolean;
}

function nodosDe(d: FlujoCondicional): NodoRama[] {
  const nodos: NodoRama[] = d.ramas.map((rama, i) => ({ clave: `c${i}`, condicion: rama.condicion, resultado: rama.resultado, accion: rama.accion, recorrida: rama.resultado !== null }));
  if (d.sino) nodos.push({ clave: "sino", condicion: null, resultado: d.sino.tomada ? true : null, accion: d.sino.accion, recorrida: d.sino.tomada });
  return nodos;
}

function FlujoSi({ datos, visual }: { datos: FlujoCondicional; visual: VisualCodiaFlujo }) {
  const t = textosDe("Codia.visuales.flujo");
  const nodos = nodosDe(datos);
  const recorridos = nodos.filter((n) => n.recorrida);
  const total = recorridos.length;
  const r = useReproductor({ total, ms: 1500, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (total === 0) return null;
  const alFinal = r.paso >= total;
  const posiciones = nodos.map((n) => (n.recorrida ? recorridos.indexOf(n) : -1));
  return (
    <Marco acento={COLOR_CODIA} titulo={visual.titulo} r={r}>
      <Leyenda acento={COLOR_CODIA}>
        <Texto v="fuerte" tam={13} c={SECUNDARIO}>
          {t("valoresAntes")}
        </Texto>
        <Variables variables={datos.variables} vacio={t("sinVariables")} />
      </Leyenda>
      <View style={{ gap: 8 }}>
        {nodos.map((nodo, n) => {
          const indice = posiciones[n];
          const visible = nodo.recorrida ? indice < r.paso : alFinal;
          const activo = nodo.recorrida && indice === r.paso - 1;
          const evaluada = visible && nodo.recorrida;
          return (
            <Aparece key={nodo.clave} visible opacidad={visible ? 1 : 0.4} ms={300} estilo={{ gap: 6 }}>
              <View style={[styles.condicion, activo && { borderColor: COLOR_CODIA, backgroundColor: mezcla(COLOR_CODIA, 12) }]}>
                <Texto style={[styles.mono, { flex: 1, fontFamily: fuente.mono }]}>{nodo.condicion === null ? t("sino") : t("pregunta", { condicion: nodo.condicion })}</Texto>
                {evaluada && nodo.condicion !== null && nodo.resultado !== null && <Chip verdadero={nodo.resultado} texto={nodo.resultado ? t("verdadera") : t("falsa")} />}
                {visible && !nodo.recorrida && (
                  <Texto v="nota" tam={11}>
                    {t("noSeEvalua")}
                  </Texto>
                )}
              </View>
              {nodo.accion ? (
                <View style={{ flexDirection: "row", gap: 8, paddingLeft: 12 }}>
                  <Texto v="fuerte" tam={12} c={SECUNDARIO}>
                    {nodo.condicion === null ? "→" : `${t("si")} →`}
                  </Texto>
                  <View style={[styles.accion, evaluada && nodo.resultado === true && { borderColor: mezcla(color.correcto, 50), backgroundColor: mezcla(color.correcto, 10) }]}>
                    <Texto style={[styles.mono, { fontSize: 12 }]}>{nodo.accion}</Texto>
                  </View>
                </View>
              ) : null}
            </Aparece>
          );
        })}
      </View>
      {alFinal && (
        <Leyenda acento={COLOR_CODIA}>
          <Texto v="fuerte" tam={13} c={SECUNDARIO}>
            {t("salida")}
          </Texto>
          <Texto style={styles.mono}>{datos.fallo ? t("errorAlt") : datos.salida || t("sinSalida")}</Texto>
        </Leyenda>
      )}
    </Marco>
  );
}

function FlujoBucleVista({ datos, visual }: { datos: FlujoBucle; visual: VisualCodiaFlujo }) {
  const t = textosDe("Codia.visuales.flujo");
  const nVueltas = datos.vueltas.length;
  const hayFin = datos.alSalir !== null;
  const total = nVueltas + (hayFin ? 1 : 0);
  const r = useReproductor({ total, ms: 1500, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (total === 0) return null;
  const mientras = datos.forma === "mientras";
  const enSalida = hayFin && r.paso > nVueltas;
  const actual = enSalida ? datos.alSalir! : datos.vueltas[Math.max(0, r.paso - 1)];
  return (
    <Marco acento={COLOR_CODIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 8 }}>
        <View style={[styles.condicion, { borderColor: COLOR_CODIA, backgroundColor: mezcla(COLOR_CODIA, 12) }]}>
          <Texto style={[styles.mono, { flex: 1, fontFamily: fuente.mono }]}>
            {t(mientras ? "bucleMientras" : "buclePara")} {datos.condicion}
          </Texto>
          <Chip verdadero={!enSalida} texto={enSalida ? t(mientras ? "falsa" : "sinMas") : t(mientras ? "verdadera" : "hayMas")} />
        </View>
        <Aparece visible opacidad={enSalida ? 0.4 : 1} ms={300} estilo={{ flexDirection: "row", gap: 8, paddingLeft: 12 }}>
          <Texto v="fuerte" tam={12} c={SECUNDARIO}>
            {t("si")} →
          </Texto>
          <View style={[styles.accion, { flex: 1, borderColor: mezcla(color.correcto, 50), backgroundColor: mezcla(color.correcto, 10) }]}>
            {datos.cuerpo.map((linea, i) => (
              <Texto key={i} style={[styles.mono, { fontSize: 12 }]}>
                {linea}
              </Texto>
            ))}
            <Texto v="nota" tam={11}>
              ↺ {t("vuelve")}
            </Texto>
          </View>
        </Aparece>
        <Aparece visible opacidad={enSalida ? 1 : 0.4} ms={300} estilo={{ flexDirection: "row", gap: 8, paddingLeft: 12 }}>
          <Texto v="fuerte" tam={12} c={SECUNDARIO}>
            {t("no")} ↓
          </Texto>
          <View style={[styles.accion, { borderStyle: "dashed" }]}>
            <Texto v="cuerpo" tam={12}>
              {t("salirDelBucle")}
            </Texto>
          </View>
        </Aparece>
      </View>
      <Leyenda acento={COLOR_CODIA}>
        <Texto v="fuerte" tam={13} c={SECUNDARIO}>
          {enSalida ? t("alSalir") : t("vuelta", { n: Math.min(r.paso, nVueltas), total: nVueltas })}
        </Texto>
        <Variables variables={actual} vacio={t("sinVariables")} />
      </Leyenda>
      {r.paso >= total && (
        <Leyenda acento={COLOR_CODIA}>
          <Texto v="fuerte" tam={13} c={SECUNDARIO}>
            {t("salida")}
          </Texto>
          <Texto style={styles.mono}>{datos.fallo ? t("errorAlt") : datos.salida || t("sinSalida")}</Texto>
        </Leyenda>
      )}
    </Marco>
  );
}

export function Flujo({ visual }: { visual: VisualCodiaFlujo }) {
  const datos = useMemo(() => {
    try {
      return datosFlujo(visual.programa, visual.lenguaje);
    } catch {
      return null;
    }
  }, [visual.programa, visual.lenguaje]);
  if (!datos) return null;
  return datos.tipo === "si" ? <FlujoSi datos={datos} visual={visual} /> : <FlujoBucleVista datos={datos} visual={visual} />;
}

const styles = StyleSheet.create({
  codigo: { borderRadius: 12, borderWidth: 1, borderColor: BORDE, backgroundColor: color.surface2 },
  mono: { fontFamily: fuente.monoMedio, fontSize: 13, lineHeight: 20, color: FG },
  lineaActiva: { backgroundColor: mezcla(color.logro, 15), borderRadius: 4, marginHorizontal: -4, paddingHorizontal: 4 },
  salida: { borderRadius: 10, borderWidth: 1, borderStyle: "dashed", borderColor: BORDE, backgroundColor: FONDO, paddingHorizontal: 10, paddingVertical: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  barraFondo: { flex: 1, height: 16, borderRadius: 4, overflow: "hidden", backgroundColor: color.surface2 },
  serie: { gap: 6, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: BORDE, backgroundColor: FONDO },
  condicion: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: BORDE },
  accion: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: BORDE, backgroundColor: FONDO, flexShrink: 1 },
});
