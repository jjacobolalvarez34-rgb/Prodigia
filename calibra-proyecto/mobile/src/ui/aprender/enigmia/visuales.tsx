import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInLeft, LinearTransition, ZoomIn } from "react-native-reanimated";
import type { VisualEnigmiaAgrupacion, VisualEnigmiaAlgoritmo, VisualEnigmiaCadena, VisualEnigmiaEliminacion, VisualEnigmiaLoci, VisualEnigmiaSecuencia } from "@/lib/enigmia/visuales";
import { agruparEnBloques, asociarLoci, resolverPorEliminacion, secuenciaAritmetica, secuenciaGeometrica, secuenciaLetras, trazarAlgoritmo, type PasoAlgoritmoEntrada } from "@/lib/enigmia/visualesDatos";
import { textosDe } from "~/lib/textosWeb";
import { fuente } from "~/tema";
import Texto from "../../Texto";
import { Aparece, BORDE, FG, Marco, mezcla, SECUNDARIO, SUPERFICIE, T } from "../comun";
import { useReproductor } from "../reproductor";

// Visuales de las lecciones de Enigmia (components/enigmia/visuales de la web).
const COLOR_ENIGMIA = "#0E9F6E";
const VERDE = "#2FD89B";

function Casilla({ valor, activo = false, chico = false }: { valor: string | number; activo?: boolean; chico?: boolean }) {
  return (
    <View style={[chico ? styles.casillaChica : styles.casilla, activo ? { borderColor: COLOR_ENIGMIA, backgroundColor: mezcla(COLOR_ENIGMIA, 16) } : { borderColor: BORDE, backgroundColor: SUPERFICIE }]}>
      <Texto style={{ fontFamily: fuente.mono, fontSize: chico ? 14 : 18, color: FG }}>{String(valor)}</Texto>
    </View>
  );
}

function Resaltado({ children }: { children: ReactNode }) {
  return <View style={[styles.resaltado, { backgroundColor: mezcla(COLOR_ENIGMIA, 14) }]}>{children}</View>;
}

// ---------- Secuencia ----------
export function Secuencia({ visual }: { visual: VisualEnigmiaSecuencia }) {
  const t = textosDe("Enigmia.visuales.secuencia");
  const cantidad = Math.trunc(visual.cantidad);
  const valido = Number.isFinite(cantidad) && cantidad >= 2 && cantidad <= 12;
  const numerica = visual.modo !== "letras" && valido && Number.isFinite(visual.primerTermino) && Number.isFinite(visual.paso);
  const letras = visual.modo === "letras" && valido && typeof visual.primeraLetra === "string" && visual.primeraLetra.length > 0;
  const datosNum = numerica ? (visual.modo === "aritmetica" ? secuenciaAritmetica(visual.primerTermino, visual.paso, cantidad) : secuenciaGeometrica(visual.primerTermino, visual.paso, cantidad)) : null;
  const datosLetras = letras && visual.modo === "letras" ? secuenciaLetras(visual.primeraLetra, visual.paso, cantidad) : null;
  const terminos: (string | number)[] = datosNum?.terminos ?? datosLetras?.letras ?? [];
  const r = useReproductor({ total: terminos.length, ms: 900, estatico: visual.estatico, inicio: 1 });
  if (terminos.length === 0) return null;
  const geometrica = visual.modo === "geometrica";
  const simbolo = visual.modo === "letras" || !geometrica ? "+" : "×";
  const paso = datosNum?.paso ?? (datosLetras ? datosLetras.paso : 0);
  return (
    <Marco acento={COLOR_ENIGMIA} titulo={visual.titulo} r={r}>
      <View style={styles.filaCentro}>
        {terminos.slice(0, Math.max(1, r.paso)).map((term, i) => (
          <View key={i} style={styles.filaCentro}>
            {i > 0 && (
              <Animated.View entering={FadeIn.duration(250)}>
                <Texto v="fuerte" tam={12} c={VERDE}>
                  {simbolo}
                  {paso}
                </Texto>
              </Animated.View>
            )}
            <Animated.View entering={ZoomIn.duration(250)}>
              <Casilla valor={term} activo={i === Math.max(0, r.paso - 1)} />
            </Animated.View>
          </View>
        ))}
        {r.paso < terminos.length && (
          <View style={styles.filaCentro}>
            <Texto v="fuerte" tam={12} c={VERDE}>
              {simbolo}
              {paso}
            </Texto>
            <Casilla valor="?" />
          </View>
        )}
      </View>
      {r.paso >= terminos.length && (
        <Resaltado>
          <Texto v="fuerte" tam={14} c={VERDE}>
            {t(geometrica ? "razon" : "diferencia", { n: paso })}
          </Texto>
        </Resaltado>
      )}
    </Marco>
  );
}

// ---------- Agrupación (chunking) ----------
export function Agrupacion({ visual }: { visual: VisualEnigmiaAgrupacion }) {
  const t = textosDe("Enigmia.visuales.agrupacion");
  const items = Array.isArray(visual.items) ? visual.items.filter((v): v is string => typeof v === "string" && v.length > 0) : [];
  const itemsOk = items.length >= 2 && items.length <= 16 ? items : [];
  const tamanos = Array.isArray(visual.tamanos) ? visual.tamanos.filter((n): n is number => typeof n === "number" && Number.isInteger(n) && n > 0) : [];
  const datos = itemsOk.length > 0 && tamanos.length > 0 ? agruparEnBloques(itemsOk, tamanos) : null;
  const total = datos?.bloques.length ?? 0;
  const r = useReproductor({ total, ms: 1100, estatico: visual.estatico });
  if (!datos) return null;
  return (
    <Marco acento={COLOR_ENIGMIA} titulo={visual.titulo} r={r}>
      <View style={[styles.filaCentro, { gap: 12 }]}>
        {datos.bloques.map((bloque, bi) => {
          const agrupado = bi < r.paso;
          return (
            <Animated.View key={bi} layout={LinearTransition.duration(350)} style={[styles.bloque, agrupado ? { borderColor: COLOR_ENIGMIA, backgroundColor: mezcla(COLOR_ENIGMIA, 12) } : { borderColor: "transparent" }]}>
              {bloque.map((item, ii) => (
                <Casilla key={ii} valor={item} chico />
              ))}
            </Animated.View>
          );
        })}
      </View>
      {r.paso >= total && <T negrita centro>{t("resultado", { n: datos.bloques.length })}</T>}
    </Marco>
  );
}

// ---------- Cadena de deducción ----------
export function Cadena({ visual }: { visual: VisualEnigmiaCadena }) {
  const t = textosDe("Enigmia.visuales.cadena");
  const nodos = Array.isArray(visual.nodos) ? visual.nodos.filter((n): n is string => typeof n === "string" && n.trim().length > 0) : [];
  const validos = nodos.length >= 2 && nodos.length <= 4 ? nodos : [];
  const r = useReproductor({ total: validos.length, ms: 900, estatico: visual.estatico, inicio: 1 });
  if (validos.length === 0) return null;
  return (
    <Marco acento={COLOR_ENIGMIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 6, alignItems: "stretch" }}>
        {validos.map((nodo, i) => {
          const revelado = i < r.paso;
          const ultimo = i === validos.length - 1;
          const conclusion = !!visual.concluir && ultimo && r.paso >= validos.length;
          return (
            <View key={i} style={{ alignItems: "center", gap: 6 }}>
              <Aparece visible opacidad={revelado ? 1 : 0.15} ms={300} estilo={[styles.nodo, conclusion ? { borderColor: COLOR_ENIGMIA, backgroundColor: mezcla(COLOR_ENIGMIA, 18) } : { borderColor: BORDE, backgroundColor: SUPERFICIE }]}>
                <T centro>{nodo}</T>
              </Aparece>
              {!ultimo && (
                <Aparece visible opacidad={i + 1 < r.paso ? 1 : 0.15} ms={300}>
                  <Texto v="fuerte" tam={18} c={VERDE}>
                    ↓
                  </Texto>
                </Aparece>
              )}
            </View>
          );
        })}
      </View>
      {visual.concluir && r.paso >= validos.length && (
        <Texto v="micro" c={VERDE} centro>
          {t("conclusion")}
        </Texto>
      )}
    </Marco>
  );
}

// ---------- Eliminación ----------
export function Eliminacion({ visual }: { visual: VisualEnigmiaEliminacion }) {
  const t = textosDe("Enigmia.visuales.eliminacion");
  const crudos = Array.isArray(visual.candidatos) ? visual.candidatos.filter((v): v is string => typeof v === "string" && v.trim().length > 0) : [];
  const candidatos = crudos.length >= 2 && crudos.length <= 8 && new Set(crudos).size === crudos.length ? crudos : [];
  const disponibles = new Set(candidatos);
  const usados = new Set<string>();
  const descartes: { candidato: string; motivo: string }[] = [];
  for (const v of Array.isArray(visual.descartes) ? visual.descartes : []) {
    if (typeof v !== "object" || v === null) continue;
    const o = v as Record<string, unknown>;
    if (typeof o.candidato !== "string" || typeof o.motivo !== "string" || !disponibles.has(o.candidato) || usados.has(o.candidato)) continue;
    usados.add(o.candidato);
    descartes.push({ candidato: o.candidato, motivo: o.motivo });
  }
  const valido = candidatos.length > 0 && descartes.length > 0 && descartes.length === candidatos.length - 1;
  const datos = valido ? resolverPorEliminacion(candidatos, descartes) : null;
  const restante = datos?.restante ?? null;
  const r = useReproductor({ total: descartes.length, ms: 1100, estatico: visual.estatico });
  if (!datos || !restante) return null;
  const terminado = r.paso >= descartes.length;
  return (
    <Marco acento={COLOR_ENIGMIA} titulo={visual.titulo} r={r}>
      <View style={styles.filaCentro}>
        {candidatos.map((c) => {
          const idx = datos.descartes.findIndex((d) => d.candidato === c);
          const descartado = idx >= 0 && idx < r.paso;
          const gana = c === restante && terminado;
          return (
            <Aparece key={c} visible opacidad={descartado ? 0.4 : 1} ms={300} estilo={[styles.candidato, gana ? { borderColor: COLOR_ENIGMIA, backgroundColor: mezcla(COLOR_ENIGMIA, 16) } : { borderColor: BORDE, backgroundColor: SUPERFICIE }]}>
              <Texto v="fuerte" tam={14} style={{ textDecorationLine: descartado ? "line-through" : "none" }}>
                {c}
              </Texto>
            </Aparece>
          );
        })}
      </View>
      <View style={{ gap: 4, alignSelf: "stretch" }}>
        {datos.descartes.slice(0, r.paso).map((d, i) => (
          <Animated.View key={i} entering={FadeInDown.duration(250)}>
            <T tam={13} c={SECUNDARIO}>
              {t("descartado", { candidato: d.candidato, motivo: d.motivo })}
            </T>
          </Animated.View>
        ))}
      </View>
      {terminado && (
        <Resaltado>
          <Texto v="fuerte" tam={14} c={VERDE}>
            {t("restante", { candidato: restante })}
          </Texto>
        </Resaltado>
      )}
    </Marco>
  );
}

// ---------- Palacio de la memoria (loci) ----------
export function Loci({ visual }: { visual: VisualEnigmiaLoci }) {
  const lista = (v: unknown) => {
    const l = Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : [];
    return l.length >= 2 && l.length <= 8 ? l : [];
  };
  const lugares = lista(visual.lugares);
  const items = lista(visual.items);
  const datos = lugares.length > 0 && items.length > 0 && lugares.length === items.length ? asociarLoci(lugares, items) : null;
  const r = useReproductor({ total: datos?.pares.length ?? 0, ms: 1000, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  return (
    <Marco acento={COLOR_ENIGMIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 8, alignSelf: "stretch" }}>
        {datos.pares.slice(0, Math.max(1, r.paso)).map((p, i) => {
          const actual = i === Math.max(0, r.paso - 1);
          return (
            <Animated.View key={i} entering={FadeInLeft.duration(300)} style={[styles.par, actual ? { borderColor: COLOR_ENIGMIA, backgroundColor: mezcla(COLOR_ENIGMIA, 10) } : { borderColor: BORDE, backgroundColor: SUPERFICIE }]}>
              <T negrita c={VERDE}>
                {p.lugar}
              </T>
              <Texto v="cuerpo">→</Texto>
              <View style={{ flex: 1 }}>
                <T>{p.item}</T>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </Marco>
  );
}

// ---------- Algoritmo paso a paso ----------
function describirPaso(p: PasoAlgoritmoEntrada, variable: string, t: ReturnType<typeof textosDe>): string {
  if (p.tipo === "condicional") return t("pasoCondicional", { variable, comparacion: p.comparacion, umbral: p.umbral });
  const simbolo = { sumar: "+", restar: "−", multiplicar: "×", dividir: "÷" }[p.tipo];
  return `${variable} = ${variable} ${simbolo} ${p.valor}`;
}

export function Algoritmo({ visual }: { visual: VisualEnigmiaAlgoritmo }) {
  const t = textosDe("Enigmia.visuales.algoritmo");
  const variable = visual.variable && visual.variable.length > 0 ? visual.variable : "x";
  const pasos = (Array.isArray(visual.pasos) ? visual.pasos : []).filter((p): p is PasoAlgoritmoEntrada => {
    if (typeof p !== "object" || p === null) return false;
    const o = p as Record<string, unknown>;
    if (o.tipo === "condicional") return typeof o.comparacion === "string" && typeof o.umbral === "number" && typeof o.siVerdadero === "object" && typeof o.siFalso === "object";
    return (o.tipo === "sumar" || o.tipo === "restar" || o.tipo === "multiplicar" || o.tipo === "dividir") && typeof o.valor === "number";
  });
  const inicial = Number.isFinite(visual.inicial) ? visual.inicial : null;
  const datos = inicial !== null && pasos.length > 0 ? trazarAlgoritmo(inicial, pasos) : null;
  const r = useReproductor({ total: datos?.pasos.length ?? 0, ms: 1200, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const revelados = datos.pasos.slice(0, Math.max(1, r.paso));
  return (
    <Marco acento={COLOR_ENIGMIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 6, alignSelf: "stretch" }}>
        <View style={[styles.lineaAlg, { borderColor: BORDE, backgroundColor: SUPERFICIE }]}>
          <Texto style={styles.mono}>{t("inicial", { variable, n: datos.inicial })}</Texto>
        </View>
        {revelados.map((p, i) => {
          const actual = i === revelados.length - 1;
          return (
            <Animated.View
              key={i}
              entering={FadeInDown.duration(300)}
              style={[styles.lineaAlg, actual ? { borderColor: COLOR_ENIGMIA, backgroundColor: mezcla(COLOR_ENIGMIA, 10) } : { borderColor: BORDE, backgroundColor: SUPERFICIE, opacity: 0.7 }]}
            >
              <Texto style={[styles.mono, { flex: 1 }]}>
                {i + 1}. {describirPaso(p.entrada, variable, t)}
                {p.ramaTomada ? <Texto style={[styles.mono, { color: VERDE, fontSize: 12 }]}>{` (${t(p.ramaTomada === "verdadero" ? "ramaVerdadero" : "ramaFalso")})`}</Texto> : null}
              </Texto>
              <Texto style={[styles.mono, { color: VERDE, fontFamily: fuente.mono }]}>
                {variable} = {p.valorDespues}
              </Texto>
            </Animated.View>
          );
        })}
      </View>
      {r.paso >= datos.pasos.length && (
        <Resaltado>
          <Texto v="fuerte" tam={14} c={VERDE}>
            {t("final", { variable, n: datos.final })}
          </Texto>
        </Resaltado>
      )}
    </Marco>
  );
}

const styles = StyleSheet.create({
  filaCentro: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8 },
  casilla: { minWidth: 44, height: 44, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  casillaChica: { minWidth: 32, height: 32, paddingHorizontal: 4, borderRadius: 6, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  resaltado: { alignSelf: "center", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  bloque: { flexDirection: "row", gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, borderWidth: 2 },
  nodo: { minHeight: 44, maxWidth: 260, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  candidato: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  par: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  lineaAlg: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  mono: { fontFamily: fuente.monoMedio, fontSize: 13, color: FG },
});
