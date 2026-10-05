import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown, FadeInLeft, FadeInRight, interpolate, useAnimatedProps } from "react-native-reanimated";
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";
import type { ElementoQuimico } from "@/lib/practica/quimia";
import { ELEMENTOS } from "@/lib/practica/quimia";
import { configuracionAbreviada, configuracionConSuperindices, configuracionElectronica, configuracionTexto, datosDe, esExcepcionAufbau, ORDEN_MOELLER, type DatosElemento, type LetraOrbital } from "@/lib/quimia/datos";
import { formulaLatex, ionLatex, numeroOxidacion } from "@/lib/quimia/formulas";
import { armarFormula, buscarAnion, buscarCation, nombreDe, type IonDef } from "@/lib/quimia/nomenclatura";
import {
  armarPila,
  buscarEjemploRedox,
  ecuacionConNumeros,
  ecuacionLatex,
  ecuacionOxidacionLatex,
  electronesDelEjemplo,
  ELECTRON_LATEX,
  especieLatex,
  formulaConNumeros,
  ladoLatex,
  ladoLatexResaltado,
  oxidacionLatex,
  planOxidacion,
  resolverCaso,
  voltios,
  type EjemploRedox,
  type PilaGalvanica,
  type PlanOxidacion,
  type ResultadoCaso,
  type SemirreaccionBalanceada,
  type TerminoRedox,
} from "@/lib/quimia/redox";
import { elementoPorSimbolo, elementoPorZ, familiaDe, ORDEN_FAMILIAS, posicionEnTabla, simbolosDeSelector, tieneGrupoDefinido, type FamiliaQuimica } from "@/lib/quimia/tabla";
import type {
  CampoFicha,
  FlechaTabla,
  PasoTablaPeriodica,
  VisualQuimiaBalanceo,
  VisualQuimiaCruce,
  VisualQuimiaCuadro,
  VisualQuimiaElemento,
  VisualQuimiaOrbitales,
  VisualQuimiaOxidacion,
  VisualQuimiaPila,
  VisualQuimiaRedox,
  VisualQuimiaTabla,
} from "@/lib/quimia/visuales";
import { textosDe } from "~/lib/textosWeb";
import Texto from "../../Texto";
import { latexAUnicode } from "../../TextoMate";
import { Aparece, BORDE, FG, FONDO, GAparece, Marco, mezcla, SECUNDARIO, SUPERFICIE, T, TrazoDibujado } from "../comun";
import { useReproductor } from "../reproductor";
import { COLOR_QUIMIA, TexColor, TextoPaso, useBucle } from "./comun";

// Visuales de las lecciones de Quimia (components/quimia/visuales de la web): tabla
// periódica, fichas, configuración, nomenclatura y redox, con los mismos cálculos.
const tt = (sub: string) => textosDe(`Quimia.visuales.${sub}`);
const tTabla = tt("tabla");
const tElem = tt("elemento");
const tCruce = tt("cruce");
const tOrb = tt("orbitales");
const tOx = tt("oxidacion");
const tRedox = tt("redox");
const tBal = tt("balanceo");
const tPila = tt("pila");

const pasoDe = (paso: number, total: number) => Math.min(total, Math.max(1, paso));
const intentar = <R,>(f: () => R): R | null => {
  try {
    return f();
  } catch {
    return null;
  }
};
const coma = (n: number) => String(n).replace(".", ",");

function Lienzo({ ancho, alto, max = 420, children }: { ancho: number; alto: number; max?: number; children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const w = Math.min(max, width - 56);
  return (
    <Svg width={w} height={(w * alto) / ancho} viewBox={`0 0 ${ancho} ${alto}`} style={{ alignSelf: "center" }}>
      {children}
    </Svg>
  );
}

function Punta({ x1, y1, x2, y2, c, tam = 9 }: { x1: number; y1: number; x2: number; y2: number; c: string; tam?: number }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (d: number, g: number) => `${x2 - tam * Math.cos(a + g) * d},${y2 - tam * Math.sin(a + g) * d}`;
  return <Polygon points={`${x2},${y2} ${p(1, 0.45)} ${p(1, -0.45)}`} fill={c} />;
}

// ---------- Tabla periódica ----------
export const COLOR_FAMILIA: Record<FamiliaQuimica, string> = {
  alcalino: "#EF4444",
  alcalinoterreo: "#F97316",
  transicion: "#EAB308",
  otrosMetales: "#22C55E",
  metaloide: "#14B8A6",
  noMetal: "#3B82F6",
  halogeno: "#8B5CF6",
  gasNoble: "#EC4899",
  lantanido: "#06B6D4",
  actinido: "#64748B",
};
const CELDA = 22;
const IZQ = 16;
const SUP = 16;
const ANCHO_TABLA = IZQ + 18 * CELDA + 8;
const ALTO_TABLA = SUP + 7 * CELDA + 10 + 2 * CELDA + 4;
const xCol = (c: number) => IZQ + (c - 1) * CELDA;
const yFila = (f: number) => (f <= 7 ? SUP + (f - 1) * CELDA : SUP + 7 * CELDA + 10 + (f - 9) * CELDA);

function FlechaTablaSvg({ direccion }: { direccion: FlechaTabla }) {
  const cx = IZQ + 9 * CELDA;
  const cy = SUP + 3.5 * CELDA;
  const horizontal = direccion === "derecha" || direccion === "izquierda";
  const largo = horizontal ? 15 * CELDA : 6 * CELDA;
  const signo = direccion === "derecha" || direccion === "abajo" ? 1 : -1;
  const x1 = horizontal ? cx - (signo * largo) / 2 : cx;
  const y1 = horizontal ? cy : cy - (signo * largo) / 2;
  const x2 = horizontal ? cx + (signo * largo) / 2 : cx;
  const y2 = horizontal ? cy : cy + (signo * largo) / 2;
  return (
    <G opacity={0.75}>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLOR_QUIMIA} strokeWidth={5} strokeLinecap="round" />
      <Punta x1={x1} y1={y1} x2={x2 + (x2 - x1) * 0.03} y2={y2 + (y2 - y1) * 0.03} c={COLOR_QUIMIA} tam={16} />
    </G>
  );
}

export function TablaPeriodica({ visual }: { visual: VisualQuimiaTabla }) {
  const pasos: PasoTablaPeriodica[] = Array.isArray(visual.pasos) ? visual.pasos.filter((p) => typeof p === "object" && p !== null && typeof p.etiqueta === "string") : [];
  const r = useReproductor({ total: pasos.length, ms: 3200, estatico: visual.estatico, inicio: 1 });
  if (pasos.length === 0) return null;
  const paso = pasos[pasoDe(r.paso, pasos.length) - 1];
  const sel = paso.seleccion;
  const activos = new Set(sel ? simbolosDeSelector(sel) : []);
  const atenuar = sel !== undefined;
  const grupoAct = sel?.por === "grupo" ? sel.n : null;
  const periodoAct = sel?.por === "periodo" ? sel.n : null;
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={ANCHO_TABLA} alto={ALTO_TABLA} max={520}>
        {Array.from({ length: 18 }, (_, i) => (
          <SvgText key={`g${i}`} x={xCol(i + 1) + CELDA / 2} y={SUP - 5} textAnchor="middle" fontSize={7.5} fontWeight={grupoAct === i + 1 ? "800" : "500"} fill={grupoAct === i + 1 ? COLOR_QUIMIA : SECUNDARIO}>
            {String(i + 1)}
          </SvgText>
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <SvgText key={`p${i}`} x={IZQ - 5} y={yFila(i + 1) + CELDA / 2 + 2.5} textAnchor="middle" fontSize={7.5} fontWeight={periodoAct === i + 1 ? "800" : "500"} fill={periodoAct === i + 1 ? COLOR_QUIMIA : SECUNDARIO}>
            {String(i + 1)}
          </SvgText>
        ))}
        {ELEMENTOS.map((e) => {
          const pos = posicionEnTabla(e);
          const on = activos.has(e.simbolo);
          return (
            <G key={e.simbolo}>
              <Rect
                x={xCol(pos.columna) + 0.75}
                y={yFila(pos.fila) + 0.75}
                width={CELDA - 1.5}
                height={CELDA - 1.5}
                rx={2.5}
                fill={COLOR_FAMILIA[familiaDe(e)]}
                fillOpacity={!atenuar ? 0.4 : on ? 0.75 : 0.1}
                stroke={on ? FG : "none"}
                strokeWidth={on ? 1.4 : 0}
              />
              <SvgText x={xCol(pos.columna) + CELDA / 2} y={yFila(pos.fila) + CELDA / 2 + 3} textAnchor="middle" fontSize={9} fontWeight={on ? "800" : "600"} fill={FG} fillOpacity={atenuar && !on ? 0.4 : 1}>
                {e.simbolo}
              </SvgText>
            </G>
          );
        })}
        {[
          { fila: 6, texto: "57–71", fam: "lantanido" as const },
          { fila: 7, texto: "89–103", fam: "actinido" as const },
        ].map((m) => (
          <G key={m.texto}>
            <Rect x={xCol(3) + 0.75} y={yFila(m.fila) + 0.75} width={CELDA - 1.5} height={CELDA - 1.5} rx={2.5} fill={COLOR_FAMILIA[m.fam]} fillOpacity={atenuar ? 0.08 : 0.25} />
            <SvgText x={xCol(3) + CELDA / 2} y={yFila(m.fila) + CELDA / 2 + 2} textAnchor="middle" fontSize={5.5} fill={FG} fillOpacity={0.7}>
              {m.texto}
            </SvgText>
          </G>
        ))}
        {paso.flecha && <FlechaTablaSvg direccion={paso.flecha} />}
      </Lienzo>
      <View style={styles.leyendaFamilias}>
        {ORDEN_FAMILIAS.map((f) => (
          <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: COLOR_FAMILIA[f], opacity: 0.6 }} />
            <Texto v="nota" tam={10}>
              {tTabla(`familias.${f}`)}
            </Texto>
          </View>
        ))}
      </View>
      <Animated.View key={r.paso} entering={FadeInDown.duration(250)}>
        <TextoPaso texto={paso.etiqueta} />
      </Animated.View>
    </Marco>
  );
}

// ---------- Ficha de un elemento ----------
const CAMPOS: CampoFicha[] = ["numeroAtomico", "simbolo", "nombre", "masa", "configuracion", "electronegatividad", "oxidacion", "estado", "posicion", "familia"];

function valorDeCampo(el: ElementoQuimico, d: DatosElemento, campo: CampoFicha): string {
  switch (campo) {
    case "numeroAtomico":
      return String(el.numeroAtomico);
    case "simbolo":
      return el.simbolo;
    case "nombre":
      return el.nombre;
    case "masa":
      return `${coma(d.masa)} u`;
    case "configuracion":
      return configuracionConSuperindices(configuracionAbreviada(el.numeroAtomico));
    case "electronegatividad":
      return d.electronegatividad === null ? tElem("sinElectronegatividad") : coma(d.electronegatividad);
    case "oxidacion":
      return d.estadosOxidacion.map(numeroOxidacion).join(", ");
    case "estado":
      return tElem(`estados.${d.estado}`);
    case "posicion":
      return tieneGrupoDefinido(el) ? `${tElem("grupo")} ${el.grupo}, ${tElem("periodo")} ${el.periodo}` : `${tElem("bloqueF")}, ${tElem("periodo")} ${el.periodo}`;
    case "familia":
      return tTabla(`familias.${familiaDe(el)}`);
  }
}

export function FichaElemento({ visual }: { visual: VisualQuimiaElemento }) {
  const el = elementoPorSimbolo(visual.simbolo);
  const datos = datosDe(visual.simbolo);
  const campos = Array.isArray(visual.campos) ? visual.campos.filter((c): c is CampoFicha => CAMPOS.includes(c as CampoFicha)) : [];
  const r = useReproductor({ total: campos.length, ms: 3400, estatico: visual.estatico, inicio: 1 });
  if (!el || !datos || campos.length === 0) return null;
  const activo = campos[pasoDe(r.paso, campos.length) - 1];
  const visibles = new Set(campos.slice(0, Math.max(1, r.paso)));
  const fam = COLOR_FAMILIA[familiaDe(el)];
  const valor = (c: CampoFicha) => valorDeCampo(el, datos, c);
  const caja = (c: CampoFicha) => [styles.campo, activo === c && { borderColor: COLOR_QUIMIA, backgroundColor: mezcla(COLOR_QUIMIA, 14) }];
  const filas: CampoFicha[] = ["configuracion", "electronegatividad", "oxidacion", "estado", "posicion", "familia"];
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <View style={[styles.casillero, { borderColor: fam, backgroundColor: mezcla(fam, 16) }]}>
        <Aparece visible opacidad={visibles.has("numeroAtomico") ? 1 : 0.18} estilo={[caja("numeroAtomico"), { alignSelf: "flex-start" }]}>
          <Texto v="fuerte" tam={14}>
            {String(el.numeroAtomico)}
          </Texto>
        </Aparece>
        <Aparece visible opacidad={visibles.has("simbolo") ? 1 : 0.18} estilo={caja("simbolo")}>
          <Texto v="display" tam={46} style={{ lineHeight: 52 }} centro>
            {el.simbolo}
          </Texto>
        </Aparece>
        <Aparece visible opacidad={visibles.has("nombre") ? 1 : 0.18} estilo={caja("nombre")}>
          <Texto v="fuerte" tam={14} centro>
            {el.nombre}
          </Texto>
        </Aparece>
        <Aparece visible opacidad={visibles.has("masa") ? 1 : 0.18} estilo={caja("masa")}>
          <Texto v="nota" tam={12} centro>
            {coma(datos.masa)}
          </Texto>
        </Aparece>
      </View>
      <View style={{ gap: 3 }}>
        {filas.map((c) => (
          <Aparece key={c} visible opacidad={visibles.has(c) ? 1 : 0.18} estilo={[caja(c), { flexDirection: "row", gap: 10 }]}>
            <Texto v="nota" tam={12} style={{ width: 120 }}>
              {tElem(`campos.${c}.titulo`)}
            </Texto>
            <Texto v="fuerte" tam={12} style={{ flex: 1 }}>
              {valor(c)}
            </Texto>
          </Aparece>
        ))}
      </View>
      <Animated.View key={activo} entering={FadeInDown.duration(250)}>
        <TextoPaso texto={`${tElem(`campos.${activo}.titulo`)}: ${valor(activo)} — ${tElem(`campos.${activo}.explicacion`)}`} />
      </Animated.View>
    </Marco>
  );
}

// ---------- Cuadro que se arma fila por fila ----------
export function Cuadro({ visual }: { visual: VisualQuimiaCuadro }) {
  const columnas = Array.isArray(visual.columnas) ? visual.columnas.filter((x): x is string => typeof x === "string") : [];
  const filas = (Array.isArray(visual.filas) ? visual.filas : []).filter((f): f is string[] => Array.isArray(f) && f.length === columnas.length && f.every((x) => typeof x === "string")).slice(0, 24);
  const r = useReproductor({ total: filas.length, ms: 1500, estatico: visual.estatico, inicio: 1 });
  if (columnas.length === 0 || filas.length === 0) return null;
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <View style={styles.tabla}>
        <View style={[styles.filaTabla, { borderBottomWidth: 2, borderColor: COLOR_QUIMIA, backgroundColor: mezcla(COLOR_QUIMIA, 10) }]}>
          {columnas.map((c, i) => (
            <View key={i} style={styles.celda}>
              <T negrita tam={12}>
                {c}
              </T>
            </View>
          ))}
        </View>
        {filas.slice(0, r.paso).map((fila, i) => (
          <Animated.View key={i} entering={FadeInDown.duration(300)} style={[styles.filaTabla, i === r.paso - 1 && r.paso < filas.length && { backgroundColor: mezcla(COLOR_QUIMIA, 10) }]}>
            {fila.map((celda, j) => (
              <View key={j} style={styles.celda}>
                <T tam={12}>{celda}</T>
              </View>
            ))}
          </Animated.View>
        ))}
      </View>
    </Marco>
  );
}

// ---------- Orbitales (diagrama de Moeller) ----------
const COLUMNAS: LetraOrbital[] = ["s", "p", "d", "f"];
const CAPACIDAD: Record<LetraOrbital, number> = { s: 2, p: 6, d: 10, f: 14 };

export function Orbitales({ visual }: { visual: VisualQuimiaOrbitales }) {
  const z = Number.isInteger(visual.z) ? visual.z : 0;
  const el = z >= 1 && z <= 118 ? elementoPorZ(z) : undefined;
  const config = el ? configuracionElectronica(z) : [];
  const r = useReproductor({ total: config.length, ms: 1800, estatico: visual.estatico, inicio: 1 });
  if (!el || config.length === 0) return null;
  const paso = pasoDe(r.paso, config.length);
  const acumulado = config.slice(0, paso).reduce((a, s) => a + s.electrones, 0);
  const actual = config[paso - 1];
  const ordenDe = (nombre: string) => ORDEN_MOELLER.findIndex((o) => `${o.n}${o.l}` === nombre) + 1;
  const nMax = Math.max(...config.map((s) => s.n));
  const final = paso === config.length;
  const texto = tOrb("paso", { sub: actual.nombre, e: actual.electrones, cap: actual.capacidad, total: acumulado, nombre: el.nombre });
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 4 }}>
        <View style={styles.filaOrb}>
          <View style={{ width: 16 }} />
          {COLUMNAS.map((l) => (
            <Texto key={l} v="fuerte" tam={12} c={SECUNDARIO} centro style={{ flex: 1 }}>
              {l}
            </Texto>
          ))}
        </View>
        {Array.from({ length: nMax }, (_, i) => i + 1).map((n) => (
          <View key={n} style={styles.filaOrb}>
            <Texto v="fuerte" tam={12} c={SECUNDARIO} style={{ width: 16 }}>
              {String(n)}
            </Texto>
            {COLUMNAS.map((l) => {
              if (!ORDEN_MOELLER.some((o) => o.n === n && o.l === l)) return <View key={l} style={{ flex: 1 }} />;
              const nombre = `${n}${l}`;
              const idx = config.findIndex((s) => s.nombre === nombre);
              const usado = idx >= 0 && idx < paso;
              const esActual = idx === paso - 1;
              const sub = idx >= 0 ? config[idx] : null;
              return (
                <Aparece
                  key={l}
                  visible
                  opacidad={usado ? 1 : 0.22}
                  ms={300}
                  estilo={[styles.subcapa, { borderColor: esActual ? COLOR_QUIMIA : BORDE, backgroundColor: usado ? mezcla(COLOR_QUIMIA, esActual ? 18 : 8) : SUPERFICIE }]}
                >
                  <Texto v="fuerte" tam={11}>
                    {usado ? `${nombre} · ${ordenDe(nombre)}º` : nombre}
                  </Texto>
                  <View style={styles.cuadritos}>
                    {Array.from({ length: CAPACIDAD[l] }, (_, k) => (
                      <View key={k} style={[styles.cuadrito, { backgroundColor: usado && sub && k < sub.electrones ? COLOR_QUIMIA : BORDE }]} />
                    ))}
                  </View>
                </Aparece>
              );
            })}
          </View>
        ))}
      </View>
      <TextoPaso
        texto={final ? `${texto} ${configuracionConSuperindices(configuracionTexto(z))}${esExcepcionAufbau(z) ? ` — ${tOrb("excepcion")}` : ""}` : texto}
      />
    </Marco>
  );
}

// ---------- Cruce de cargas ----------
function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

function formulaCruda(c: IonDef, a: IonDef, qa: number, qc: number): string {
  const parte = (ion: IonDef, n: number) => {
    const base = formulaLatex(ion.formula).replace(/^\\mathrm\{/, "").replace(/\}$/, "");
    return `${ion.poliatomico && n > 1 ? `(${base})` : `{${base}}`}_{${n}}`;
  };
  return `\\mathrm{${parte(c, qa)}${parte(a, qc)}}`;
}

export function Cruce({ visual }: { visual: VisualQuimiaCruce }) {
  const ok = intentar(() => ({ c: buscarCation(visual.cation), a: buscarAnion(visual.anion) }));
  const simplifica = ok ? mcd(Math.abs(ok.c.carga), Math.abs(ok.a.carga)) > 1 : false;
  const total = simplifica ? 5 : 4;
  const r = useReproductor({ total, ms: 2800, estatico: visual.estatico, inicio: 1 });
  if (!ok) return null;
  const { c, a } = ok;
  const paso = pasoDe(r.paso, total);
  const armada = armarFormula(c, a);
  const cruda = formulaCruda(c, a, Math.abs(a.carga), Math.abs(c.carga));
  const cuenta = `${armada.nCation}\\times(${c.carga > 0 ? "+" : ""}${c.carga}) + ${armada.nAnion}\\times(${a.carga})`;
  const nombre = intentar(() => nombreDe(armada.formula, "stock")) ?? "";
  const f = `$${formulaLatex(armada.formula)}$`;
  const textos = [
    tCruce("p1"),
    tCruce("p2"),
    ...(simplifica ? [tCruce("p3Simplifica", { cruda: `$${cruda}$`, formula: f })] : []),
    tCruce("pVerifica", { cuenta: `$${cuenta} = 0$` }),
    nombre ? tCruce("pResultadoNombre", { formula: f, nombre }) : tCruce("pResultado", { formula: f }),
  ];
  const mostrarCruce = paso >= 2;
  const opac = paso === 2 ? 1 : 0.25;
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <View style={{ height: 150, alignSelf: "stretch" }}>
        <View style={[styles.ion, { left: "8%" }]}>
          <Texto v="fuerte" tam={24} centro>
            {latexAUnicode(ionLatex(c.formula, c.carga))}
          </Texto>
        </View>
        <View style={[styles.ion, { right: "8%" }]}>
          <Texto v="fuerte" tam={24} centro>
            {latexAUnicode(ionLatex(a.formula, a.carga))}
          </Texto>
        </View>
        {mostrarCruce && (
          <View style={{ position: "absolute", left: 0, right: 0, top: 44 }}>
            <Lienzo ancho={320} alto={64} max={320}>
              <G opacity={opac}>
                <TrazoDibujado d="M106 4 L210 58" largo={118} visible ms={700} stroke={COLOR_QUIMIA} strokeWidth={2.2} />
                <TrazoDibujado d="M214 4 L110 58" largo={118} visible ms={850} stroke={COLOR_QUIMIA} strokeWidth={2.2} />
                <Punta x1={106} y1={4} x2={212} y2={59} c={COLOR_QUIMIA} />
                <Punta x1={214} y1={4} x2={108} y2={59} c={COLOR_QUIMIA} />
              </G>
            </Lienzo>
          </View>
        )}
        {mostrarCruce && (
          <Animated.View key={paso >= 3 ? "final" : "cruda"} entering={FadeInDown.duration(350)} style={{ position: "absolute", bottom: 4, left: 0, right: 0 }}>
            <Texto v="fuerte" tam={30} centro>
              {latexAUnicode(paso >= 3 ? formulaLatex(armada.formula) : cruda)}
            </Texto>
          </Animated.View>
        )}
      </View>
      <TextoPaso texto={textos[paso - 1] ?? ""} />
    </Marco>
  );
}

// ---------- Número de oxidación ----------
const REGLA: Record<string, string> = { H: "hidrogeno", O: "oxigeno", F: "fluor", Li: "alcalino", Na: "alcalino", K: "alcalino", Mg: "alcalinoterreo", Ca: "alcalinoterreo", Ba: "alcalinoterreo", Al: "aluminio", Ag: "plata", Zn: "zinc" };

export function Oxidacion({ visual }: { visual: VisualQuimiaOxidacion }) {
  const plan: PlanOxidacion | null =
    typeof visual.formula === "string" && typeof visual.incognita === "string" ? intentar(() => planOxidacion(visual.formula, typeof visual.carga === "number" ? visual.carga : 0, visual.incognita, visual.fijos ?? {})) : null;
  const r = useReproductor({ total: 5, ms: 3200, estatico: visual.estatico, inicio: 1 });
  if (!plan) return null;
  const paso = pasoDe(r.paso, 5);
  const carga = plan.especie.carga;
  const x = plan.numeros[plan.incognita];
  const fijos = visual.fijos ?? {};
  const conocidos: Record<string, number> = {};
  for (const s of plan.conocidos) conocidos[s] = plan.numeros[s];
  const formulaSolo = formulaConNumeros(plan.especie.formula, {}, carga);
  const formulaConocidos = formulaConNumeros(plan.especie.formula, { ...conocidos, [plan.incognita]: "x" }, carga);
  const formulaFinal = formulaConNumeros(plan.especie.formula, plan.numeros, carga);
  const ecuacion = ecuacionOxidacionLatex(plan);
  const suma = Object.keys(plan.cantidades)
    .map((s) => `${plan.cantidades[s] > 1 ? `${plan.cantidades[s]}\\cdot ` : ""}(${oxidacionLatex(plan.numeros[s])})`)
    .join(" + ");
  const lista = plan.conocidos.map((s) => `${s}: ${plan.numeros[s] > 0 ? "+" : "−"}${Math.abs(plan.numeros[s])} (${tOx(`reglas.${s in fijos ? "aclarado" : (REGLA[s] ?? "aclarado")}`)})`).join("; ");
  const textos = [
    tOx("p1", { formula: `$${formulaSolo}$`, incognita: plan.incognita }),
    tOx("p2", { lista }),
    tOx("p3", { ecuacion: `$${ecuacion}$`, carga: carga === 0 ? "0" : `${carga > 0 ? "+" : "−"}${Math.abs(carga)}` }),
    tOx("p4", { incognita: plan.incognita, valor: `$${oxidacionLatex(x)}$` }),
    tOx("p5", { suma: `$${suma} = ${carga > 0 ? `+${carga}` : carga}$` }),
  ];
  const mostrada = paso === 1 ? formulaSolo : paso <= 3 ? formulaConocidos : formulaFinal;
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <Animated.View key={mostrada} entering={FadeInDown.duration(300)}>
        <Texto v="fuerte" tam={26} centro>
          {latexAUnicode(mostrada)}
        </Texto>
      </Animated.View>
      {paso >= 3 && (
        <Animated.View key={paso >= 4 ? "resuelta" : "planteada"} entering={FadeInDown.duration(300)} style={styles.recuadro}>
          <Texto v="fuerte" tam={17} centro>
            {latexAUnicode(paso >= 4 ? `\\mathrm{${plan.incognita}}\\text{: } x = ${oxidacionLatex(x)}` : ecuacion)}
          </Texto>
        </Animated.View>
      )}
      <TextoPaso texto={textos[paso - 1]} />
    </Marco>
  );
}

// ---------- Redox ----------
const COLOR_OXIDA = "#EF4444";
const COLOR_REDUCE = "#3B82F6";
const ELECTRON = "#F59E0B";
const CirculoA = Animated.createAnimatedComponent(Circle);
const conNumero = (simbolo: string, n: number) => `\\overset{${oxidacionLatex(n)}}{\\mathrm{${simbolo}}}`;
const cantidad = (n: number) => (n > 1 ? `${n}\\,` : "");

function nombreAgente(ej: EjemploRedox, formula: string): string {
  const x = ej.reactivos.find((y) => y.especie.formula === formula);
  return x ? `$${especieLatex(x.especie)}$` : `$${formulaLatex(formula)}$`;
}

function FlechaElectron() {
  const v = useBucle(1300, true);
  const props = useAnimatedProps(() => ({ cx: 6 + v.value * 40 }));
  return (
    <Svg width={60} height={30} viewBox="0 0 60 30">
      <Line x1={4} y1={15} x2={50} y2={15} stroke={COLOR_QUIMIA} strokeWidth={2.5} />
      <Punta x1={4} y1={15} x2={56} y2={15} c={COLOR_QUIMIA} />
      <CirculoA cy={15} r={3.4} fill={ELECTRON} animatedProps={props} />
      <SvgText x={30} y={9} textAnchor="middle" fontSize={9} fontWeight="700" fill={FG}>
        e⁻
      </SvgText>
    </Svg>
  );
}

function Caja({ titulo, colorBorde, tex, nota, desde }: { titulo: string; colorBorde: string; tex: string; nota: string; desde: "izq" | "der" }) {
  return (
    <Animated.View entering={(desde === "izq" ? FadeInLeft : FadeInRight).duration(350)} style={[styles.cajaRedox, { borderColor: colorBorde, backgroundColor: mezcla(colorBorde, 8) }]}>
      <Texto v="fuerte" tam={12} c={colorBorde} centro>
        {titulo}
      </Texto>
      <Texto v="fuerte" tam={13} centro>
        {latexAUnicode(tex)}
      </Texto>
      <Texto v="nota" tam={11} centro>
        {nota}
      </Texto>
    </Animated.View>
  );
}

export function Redox({ visual }: { visual: VisualQuimiaRedox }) {
  const ej = typeof visual.ejemplo === "string" ? buscarEjemploRedox(visual.ejemplo) : undefined;
  const r = useReproductor({ total: 5, ms: 3400, estatico: visual.estatico, inicio: 1 });
  if (!ej) return null;
  const paso = pasoDe(r.paso, 5);
  const { perdidos, ganados } = electronesDelEjemplo(ej);
  const dismutacion = ej.tipo === "dismutacion";
  const ox = ej.oxida;
  const re = ej.reduce;
  const semiOx = `${cantidad(ox.n)}${conNumero(ox.simbolo, ox.de)} \\rightarrow ${cantidad(ox.n)}${conNumero(ox.simbolo, ox.a)} + ${cantidad(perdidos)}${ELECTRON_LATEX}`;
  const semiRe = `${cantidad(re.n)}${conNumero(re.simbolo, re.de)} + ${cantidad(ganados)}${ELECTRON_LATEX} \\rightarrow ${cantidad(re.n)}${conNumero(re.simbolo, re.a)}`;
  const textos = [
    tRedox("p1", { tipo: tRedox(`tipos.${ej.tipo}`) }),
    tRedox("p2"),
    dismutacion
      ? tRedox("p3Dismutacion", { simbolo: ox.simbolo, de: `$${oxidacionLatex(ox.de)}$`, a1: `$${oxidacionLatex(ox.a)}$`, a2: `$${oxidacionLatex(re.a)}$` })
      : tRedox("p3", { oxida: ox.simbolo, deO: `$${oxidacionLatex(ox.de)}$`, aO: `$${oxidacionLatex(ox.a)}$`, reduce: re.simbolo, deR: `$${oxidacionLatex(re.de)}$`, aR: `$${oxidacionLatex(re.a)}$` }),
    tRedox("p4", { oxSemi: `$${semiOx}$`, reSemi: `$${semiRe}$`, perdidos, ganados }),
    dismutacion ? tRedox("p5Dismutacion", { especie: nombreAgente(ej, ej.agenteReductor) }) : tRedox("p5", { reductor: nombreAgente(ej, ej.agenteReductor), oxidante: nombreAgente(ej, ej.agenteOxidante) }),
  ];
  const ecuacion = paso >= 2 ? ecuacionConNumeros(ej) : ecuacionLatex(ej.reactivos, ej.productos);
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <Animated.View key={paso >= 2 ? "num" : "sin"} entering={FadeInDown.duration(300)}>
        <Texto v="fuerte" tam={16} centro>
          {latexAUnicode(ecuacion)}
        </Texto>
      </Animated.View>
      {paso >= 3 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Caja titulo={`${tRedox("seOxida")} ↑`} colorBorde={COLOR_OXIDA} tex={`${conNumero(ox.simbolo, ox.de)} \\rightarrow ${conNumero(ox.simbolo, ox.a)}`} nota={tRedox("pierde", { n: perdidos })} desde="izq" />
          <FlechaElectron />
          <Caja titulo={`${tRedox("seReduce")} ↓`} colorBorde={COLOR_REDUCE} tex={`${conNumero(re.simbolo, re.de)} \\rightarrow ${conNumero(re.simbolo, re.a)}`} nota={tRedox("gana", { n: ganados })} desde="der" />
        </View>
      )}
      {paso >= 4 && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.recuadro}>
          <Texto v="fuerte" tam={13} centro>
            {latexAUnicode(semiOx)}
          </Texto>
          <Texto v="fuerte" tam={13} centro>
            {latexAUnicode(semiRe)}
          </Texto>
        </Animated.View>
      )}
      <TextoPaso texto={textos[paso - 1]} />
    </Marco>
  );
}

// ---------- Balanceo por ion-electrón ----------
interface Estado {
  reactivos: TerminoRedox[];
  productos: TerminoRedox[];
  eR: number;
  eP: number;
}
const porCoef = (l: TerminoRedox[], m: number): TerminoRedox[] => l.map((x) => ({ ...x, coef: x.coef * m }));
const deSemi = (s: SemirreaccionBalanceada): Estado => ({ reactivos: s.reactivos, productos: s.productos, eR: s.tipo === "reduccion" ? s.electrones : 0, eP: s.tipo === "oxidacion" ? s.electrones : 0 });

function linea(actual: Estado, previo: Estado | null): string {
  const p = previo ?? actual;
  return `${ladoLatexResaltado(actual.reactivos, previo ? p.reactivos : actual.reactivos, actual.eR, p.eR)} \\rightarrow ${ladoLatexResaltado(actual.productos, previo ? p.productos : actual.productos, actual.eP, p.eP)}`;
}

function ladoRes(s: SemirreaccionBalanceada, m: number): string {
  const e = deSemi(s);
  return `${ladoLatex(porCoef(e.reactivos, m), e.eR * m)} \\rightarrow ${ladoLatex(porCoef(e.productos, m), e.eP * m)}`;
}

function Semirreaccion({ etiqueta, tex, multiplicador, c }: { etiqueta: string; tex: string; multiplicador: number | null; c: string }) {
  return (
    <View style={[styles.semi, { borderColor: c, backgroundColor: mezcla(c, 7) }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Texto v="micro" tam={11} c={c}>
          {etiqueta.toUpperCase()}
        </Texto>
        {multiplicador !== null && multiplicador > 1 && (
          <View style={[styles.pildora, { backgroundColor: c }]}>
            <Texto v="fuerte" tam={11} c="#fff">
              {`× ${multiplicador}`}
            </Texto>
          </View>
        )}
      </View>
      <Animated.View key={tex} entering={FadeInDown.duration(300)}>
        <TexColor tex={tex} tam={14} />
      </Animated.View>
    </View>
  );
}

export function Balanceo({ visual }: { visual: VisualQuimiaBalanceo }) {
  const res: ResultadoCaso | null = typeof visual.caso === "string" ? intentar(() => resolverCaso(visual.caso)) : null;
  const basico = res?.caso.medio === "basico";
  const total = basico ? 8 : 6;
  const r = useReproductor({ total, ms: 3600, estatico: visual.estatico, inicio: 1 });
  if (!res) return null;
  const paso = pasoDe(r.paso, total);
  const { reduccion: R, oxidacion: O, suma } = res;
  type Semi = typeof R;
  const esq = (p: Semi): Estado => ({ ...p.esqueleto, eR: 0, eP: 0 });
  const conAgua = (p: Semi): Estado => ({ reactivos: p.conAgua.reactivos, productos: p.conAgua.productos, eR: 0, eP: 0 });
  const conH = (p: Semi): Estado => ({ reactivos: p.conProtones.reactivos, productos: p.conProtones.productos, eR: 0, eP: 0 });
  const conE = (p: Semi): Estado => deSemi(p.conElectrones);
  const conOH = (p: Semi): Estado => ({
    reactivos: p.basico!.conOH.reactivos,
    productos: p.basico!.conOH.productos,
    eR: p.conElectrones.tipo === "reduccion" ? p.conElectrones.electrones : 0,
    eP: p.conElectrones.tipo === "oxidacion" ? p.conElectrones.electrones : 0,
  });
  const fin = (p: Semi): Estado => deSemi(p.final);
  const secuencia = (p: Semi): Estado[] => (basico ? [esq(p), conAgua(p), conH(p), conE(p), conOH(p), fin(p)] : [esq(p), conAgua(p), conH(p), conE(p)]);
  const sR = secuencia(R);
  const sO = secuencia(O);
  let lineaR: string;
  let lineaO: string;
  let final: string | null = null;
  let mult: { r: number; o: number } | null = null;
  if (paso <= sR.length) {
    lineaR = linea(sR[paso - 1], paso > 1 ? sR[paso - 2] : null);
    lineaO = linea(sO[paso - 1], paso > 1 ? sO[paso - 2] : null);
  } else {
    lineaR = ladoRes(R.final, suma.multReduccion);
    lineaO = ladoRes(O.final, suma.multOxidacion);
    mult = { r: suma.multReduccion, o: suma.multOxidacion };
    if (paso === total) final = ecuacionLatex(suma.reactivos, suma.productos);
  }
  const lado = (l: string | null | undefined) => tBal(`lado.${l ?? "ninguno"}`);
  const textos = [
    tBal("p1"),
    tBal("p2", { rd: R.conAgua.agregadas, ox: O.conAgua.agregadas, aRed: lado(R.conAgua.lado), aOx: lado(O.conAgua.lado) }),
    tBal("p3", { rd: R.conProtones.agregados, ox: O.conProtones.agregados, aRed: lado(R.conProtones.lado), aOx: lado(O.conProtones.lado) }),
    tBal("p4", { rd: R.conElectrones.electrones, ox: O.conElectrones.electrones }),
  ];
  if (basico) {
    textos.push(tBal("p5Basico", { rd: R.basico!.conOH.agregados, ox: O.basico!.conOH.agregados }));
    textos.push(tBal("p6Basico"));
  }
  textos.push(tBal("pMultiplicar", { mr: suma.multReduccion, mo: suma.multOxidacion, e: suma.electrones }));
  textos.push(tBal("pSumar", { ecuacion: `$${ecuacionLatex(suma.reactivos, suma.productos)}$` }));
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 8 }}>
        <Semirreaccion etiqueta={tBal("reduccion")} tex={lineaR} multiplicador={mult?.r ?? null} c={COLOR_REDUCE} />
        <Semirreaccion etiqueta={tBal("oxidacion")} tex={lineaO} multiplicador={mult?.o ?? null} c={COLOR_OXIDA} />
        {final && (
          <Animated.View entering={FadeInDown.duration(350)} style={[styles.semi, { borderWidth: 2, borderColor: COLOR_QUIMIA }]}>
            <Texto v="micro" tam={11} c={COLOR_QUIMIA} centro>
              {tBal("neta").toUpperCase()}
            </Texto>
            <Texto v="fuerte" tam={15} centro>
              {latexAUnicode(final)}
            </Texto>
          </Animated.View>
        )}
      </View>
      <TextoPaso texto={textos[paso - 1]} />
    </Marco>
  );
}

// ---------- Pila galvánica ----------
const SUP_CARGA: Record<string, string> = { "1": "", "2": "²", "3": "³" };
const ionTexto = (s: string, n: number) => `${s}${SUP_CARGA[String(n)] ?? ""}⁺`;
const CABLE_T = [0, 0.2, 0.4, 0.6, 0.8, 1];
const CABLE_X = [80, 80, 128, 192, 240, 240];
const CABLE_Y = [62, 28, 28, 28, 28, 62];

function ElectronCable({ desfase }: { desfase: number }) {
  const v = useBucle(3200, true);
  const props = useAnimatedProps(() => {
    const t = (v.value + desfase) % 1;
    return { cx: interpolate(t, CABLE_T, CABLE_X), cy: interpolate(t, CABLE_T, CABLE_Y) };
  });
  return <CirculoA r={3.6} fill={ELECTRON} stroke={FONDO} strokeWidth={0.8} animatedProps={props} />;
}

function IonPuente({ desde, hasta, c, desfase }: { desde: number; hasta: number; c: string; desfase: number }) {
  const v = useBucle(2400, true);
  const props = useAnimatedProps(() => ({ cx: desde + ((v.value + desfase) % 1) * (hasta - desde) }));
  return <CirculoA cy={86} r={4.5} fill={c} animatedProps={props} />;
}

export function Pila({ visual }: { visual: VisualQuimiaPila }) {
  const pila: PilaGalvanica | null = typeof visual.anodo === "string" && typeof visual.catodo === "string" ? intentar(() => armarPila(visual.anodo, visual.catodo)) : null;
  const r = useReproductor({ total: 6, ms: 3600, estatico: visual.estatico, inicio: 1 });
  if (!pila) return null;
  const paso = pasoDe(r.paso, 6);
  const A = pila.anodo;
  const C = pila.catodo;
  const semiOx = `${ladoLatex(pila.oxidacion.reactivos)} \\rightarrow ${ladoLatex(pila.oxidacion.productos, pila.oxidacion.electrones)}`;
  const semiRe = `${ladoLatex(pila.reduccion.reactivos, pila.reduccion.electrones)} \\rightarrow ${ladoLatex(pila.reduccion.productos)}`;
  const global = ecuacionLatex(pila.global.reactivos, pila.global.productos);
  const textos = [
    tPila("p1"),
    tPila("p2", { metal: A.nombre, semi: `$${semiOx}$` }),
    tPila("p3", { metal: C.nombre, semi: `$${semiRe}$` }),
    tPila("p4"),
    tPila("p5"),
    tPila("p6", { global: `$${global}$`, c: voltios(C.cV), a: voltios(A.cV), e: voltios(pila.cV) }),
  ];
  const anchoAnodo = paso >= 2 ? 12 : 20;
  const anchoCatodo = paso >= 3 ? 28 : 20;
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <Lienzo ancho={320} alto={210}>
        <Rect x={30} y={112} width={100} height={70} rx={3} fill="#93C5FD" opacity={0.35} />
        <Rect x={190} y={112} width={100} height={70} rx={3} fill="#93C5FD" opacity={0.35} />
        <Path d="M30 92 V182 H130 V92" fill="none" stroke={FG} strokeWidth={2.5} strokeLinejoin="round" />
        <Path d="M190 92 V182 H290 V92" fill="none" stroke={FG} strokeWidth={2.5} strokeLinejoin="round" />
        <Rect x={80 - anchoAnodo / 2} y={62} width={anchoAnodo} height={102} rx={2} fill="#9CA3AF" />
        <Rect x={240 - anchoCatodo / 2} y={62} width={anchoCatodo} height={102} rx={2} fill="#B45309" />
        <SvgText x={80} y={144} textAnchor="middle" fontSize={12} fontWeight="800" fill={FONDO}>
          {A.simbolo}
        </SvgText>
        <SvgText x={240} y={144} textAnchor="middle" fontSize={12} fontWeight="800" fill={FONDO}>
          {C.simbolo}
        </SvgText>
        <SvgText x={50} y={172} fontSize={11} fontWeight="700" fill={FG}>
          {ionTexto(A.simbolo, A.carga)}
        </SvgText>
        <SvgText x={252} y={172} fontSize={11} fontWeight="700" fill={FG}>
          {ionTexto(C.simbolo, C.carga)}
        </SvgText>
        <SvgText x={80} y={200} textAnchor="middle" fontSize={11} fontWeight="800" fill={COLOR_QUIMIA}>
          {`${tPila("anodo")} (−)`}
        </SvgText>
        <SvgText x={240} y={200} textAnchor="middle" fontSize={11} fontWeight="800" fill={COLOR_QUIMIA}>
          {`${tPila("catodo")} (+)`}
        </SvgText>
        <Path d="M80 62 V28 H130 M190 28 H240 V62" fill="none" stroke={FG} strokeWidth={2} strokeLinejoin="round" />
        <Circle cx={160} cy={28} r={17} fill={SUPERFICIE} stroke={FG} strokeWidth={2} />
        <SvgText x={160} y={32} textAnchor="middle" fontSize={paso >= 6 ? 9 : 12} fontWeight="800" fill={FG}>
          {paso >= 6 ? `${voltios(pila.cV)} V` : "V"}
        </SvgText>
        <Path d="M112 122 V96 Q112 84 124 84 H196 Q208 84 208 96 V122" fill="none" stroke="#9CA3AF" strokeWidth={10} strokeLinecap="round" opacity={0.55} />
        <SvgText x={160} y={68} textAnchor="middle" fontSize={10} fontWeight="700" fill={FG}>
          {tPila("puente")}
        </SvgText>
        {paso >= 4 && (
          <G>
            {[0, 0.25, 0.5].map((d) => (
              <ElectronCable key={d} desfase={d} />
            ))}
            <SvgText x={104} y={20} fontSize={11} fontWeight="800" fill={FG}>
              e⁻
            </SvgText>
            <SvgText x={206} y={20} fontSize={11} fontWeight="800" fill={FG}>
              e⁻
            </SvgText>
            <Line x1={104} y1={44} x2={120} y2={44} stroke={FG} strokeWidth={1.6} />
            <Punta x1={104} y1={44} x2={126} y2={44} c={FG} tam={6} />
          </G>
        )}
        <GAparece visible={paso >= 5}>
          <IonPuente desde={200} hasta={118} c="#EF4444" desfase={0} />
          <IonPuente desde={118} hasta={200} c="#3B82F6" desfase={0.4} />
        </GAparece>
      </Lienzo>
      <Texto v="nota" tam={11} centro>
        {tPila("nota")}
      </Texto>
      <TextoPaso texto={textos[paso - 1]} />
    </Marco>
  );
}

const styles = StyleSheet.create({
  leyendaFamilias: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", columnGap: 10, rowGap: 3 },
  casillero: { alignSelf: "center", width: 170, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 14, borderWidth: 2, alignItems: "center", gap: 2 },
  campo: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1.5, borderColor: "transparent" },
  tabla: { borderRadius: 10, borderWidth: 1, borderColor: BORDE, overflow: "hidden" },
  filaTabla: { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDE },
  celda: { flex: 1, paddingHorizontal: 6, paddingVertical: 6 },
  filaOrb: { flexDirection: "row", alignItems: "center", gap: 4 },
  subcapa: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", gap: 3, paddingHorizontal: 2, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  cuadritos: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 2, maxWidth: 60 },
  cuadrito: { width: 6, height: 6, borderRadius: 2 },
  ion: { position: "absolute", top: 4, minWidth: 80 },
  recuadro: { alignSelf: "stretch", gap: 2, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: BORDE, backgroundColor: FONDO },
  cajaRedox: { flex: 1, gap: 2, paddingHorizontal: 6, paddingVertical: 8, borderRadius: 12, borderWidth: 2 },
  semi: { gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  pildora: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: 999 },
});

