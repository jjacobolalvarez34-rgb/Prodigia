import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";
import { datosDe } from "@/lib/quimia/datos";
import { ejemploEnlace, polaridad, valenciaDe, type EjemploCovalente, type EjemploIonico, type EjemploMetalico } from "@/lib/quimia/enlaces";
import { formulaLatex, formulaUnicode } from "@/lib/quimia/formulas";
import { fichaDe, grupoVisible, INFO_GRUPO, type FichaMolecula } from "@/lib/quimia/moleculas";
import { condensadaLatex, formulaMolecular, hibridacionDe, hidrogenos, nombrarAbierta, nombrarAnillo, type Dibujo, type ResultadoNombre } from "@/lib/quimia/organica";
import type { VisualQuimiaCadena, VisualQuimiaEnlace, VisualQuimiaGrupos, VisualQuimiaHibridacion, VisualQuimiaIsomeria } from "@/lib/quimia/visuales";
import { textosDe } from "~/lib/textosWeb";
import { color } from "~/tema";
import Texto from "../../Texto";
import { latexAUnicode } from "../../TextoMate";
import { BORDE, FG, FONDO, Marco, mezcla, SECUNDARIO, SUPERFICIE, T } from "../comun";
import { useReproductor } from "../reproductor";
import { COLOR_QUIMIA, TextoPaso } from "./comun";

// Visuales de Quimia con moléculas (esqueletos, nombres, isómeros, hibridación) y
// los tres tipos de enlace animados (components/quimia/visuales de la web).
const tCad = textosDe("Quimia.visuales.cadena");
const tGru = textosDe("Quimia.visuales.grupos");
const tIso = textosDe("Quimia.visuales.isomeria");
const tHib = textosDe("Quimia.visuales.hibridacion");
const tEnl = textosDe("Quimia.visuales.enlace");
const pasoDe = (paso: number, total: number) => Math.min(total, Math.max(1, paso));

function fichaSegura(id: unknown): FichaMolecula | null {
  if (typeof id !== "string") return null;
  try {
    return fichaDe(id);
  } catch {
    return null;
  }
}

// ---------- Esqueleto 2D de una molécula ----------
const ESC_BASE = 30;
const ESC_CON_CARBONOS = 48;
const MARGEN = 20;
const COLOR_RAMA = "#F59E0B";
const anchoEtiqueta = (t: string) => Math.max(16, t.length * 9 + 6);

function Esqueleto({
  dibujo,
  resaltar,
  resaltar2,
  localizadores = false,
  carbonos,
  maxAncho,
}: {
  dibujo: Dibujo;
  resaltar?: Set<number>;
  resaltar2?: Set<number>;
  localizadores?: boolean;
  carbonos?: Map<number, string>;
  maxAncho?: number;
}) {
  const { width } = useWindowDimensions();
  const ESC = carbonos ? ESC_CON_CARBONOS : ESC_BASE;
  const por = new Map(dibujo.atomos.map((a) => [a.id, a]));
  const texto = (id: number) => por.get(id)!.etiqueta ?? carbonos?.get(id);
  const xs = dibujo.atomos.map((a) => a.x * ESC);
  const ys = dibujo.atomos.map((a) => a.y * ESC);
  const anchos = dibujo.atomos.map((a) => (texto(a.id) ? anchoEtiqueta(texto(a.id)!) / 2 : localizadores && a.localizador ? 10 : 2));
  const minX = Math.min(...xs.map((x, i) => x - anchos[i])) - MARGEN;
  const maxX = Math.max(...xs.map((x, i) => x + anchos[i])) + MARGEN;
  const minY = Math.min(...ys) - MARGEN - 4;
  const maxY = Math.max(...ys) + MARGEN + 4;
  const ancho = Math.max(60, maxX - minX);
  const alto = Math.max(60, maxY - minY);
  const enfoque = !!resaltar;
  const w = Math.min(maxAncho ?? Math.max(120, Math.min(ancho, 420)), width - 72);
  const colorDe = (a: number, b: number) => (resaltar?.has(a) && resaltar.has(b) ? COLOR_QUIMIA : resaltar2?.has(a) && resaltar2.has(b) ? COLOR_RAMA : FG);
  const destacado = (a: number, b: number) => !!((resaltar?.has(a) && resaltar.has(b)) || (resaltar2?.has(a) && resaltar2.has(b)));
  return (
    <Svg width={w} height={(w * alto) / ancho} viewBox={`${minX} ${minY} ${ancho} ${alto}`} style={{ alignSelf: "center" }}>
      {dibujo.enlaces.map((e, k) => {
        const a = por.get(e.a)!;
        const b = por.get(e.b)!;
        let x1 = a.x * ESC;
        let y1 = a.y * ESC;
        let x2 = b.x * ESC;
        let y2 = b.y * ESC;
        const largo = Math.hypot(x2 - x1, y2 - y1) || 1;
        const ux = (x2 - x1) / largo;
        const uy = (y2 - y1) / largo;
        const ta = texto(e.a);
        const tb = texto(e.b);
        const tope = carbonos ? 12 : 14;
        if (ta) {
          const r = Math.min(anchoEtiqueta(ta) / 2 + 1, tope);
          x1 += ux * r;
          y1 += uy * r;
        }
        if (tb) {
          const r = Math.min(anchoEtiqueta(tb) / 2 + 1, tope);
          x2 -= ux * r;
          y2 -= uy * r;
        }
        const desp = e.orden === 1 ? [0] : e.orden === 2 ? [-3.2, 3.2] : [-4.5, 0, 4.5];
        const fuerte = destacado(e.a, e.b);
        return (
          <G key={k} opacity={enfoque && !fuerte ? 0.4 : 1}>
            {desp.map((d, i) => (
              <Line key={i} x1={x1 - uy * d} y1={y1 + ux * d} x2={x2 - uy * d} y2={y2 + ux * d} stroke={colorDe(e.a, e.b)} strokeWidth={fuerte ? 3 : 2} strokeLinecap="round" />
            ))}
          </G>
        );
      })}
      {dibujo.atomos.map((a) => {
        const t = texto(a.id);
        const x = a.x * ESC;
        const y = a.y * ESC;
        const c = resaltar?.has(a.id) ? COLOR_QUIMIA : resaltar2?.has(a.id) ? COLOR_RAMA : FG;
        if (t) {
          const wl = anchoEtiqueta(t);
          return (
            <G key={a.id}>
              <Rect x={x - wl / 2} y={y - 10} width={wl} height={20} rx={6} fill={SUPERFICIE} />
              <SvgText x={x} y={y + 4.5} textAnchor="middle" fontSize={13} fontWeight="700" fill={c} opacity={enfoque && c === FG ? 0.5 : 1}>
                {t}
              </SvgText>
            </G>
          );
        }
        if (localizadores && a.localizador) {
          return (
            <G key={a.id}>
              <Circle cx={x} cy={y} r={9} fill={SUPERFICIE} stroke={COLOR_QUIMIA} strokeWidth={1.6} />
              <SvgText x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight="800" fill={COLOR_QUIMIA}>
                {String(a.localizador)}
              </SvgText>
            </G>
          );
        }
        return null;
      })}
    </Svg>
  );
}

// ---------- Cadena: nombrar o escribir las fórmulas ----------
const SUB: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
function textoCarbono(f: FichaMolecula, i: number): string {
  const h = hidrogenos(f.molecula, i);
  return `C${h > 0 ? `H${h > 1 ? SUB[String(h)] : ""}` : ""}`;
}

export function Cadena({ visual }: { visual: VisualQuimiaCadena }) {
  const ficha = fichaSegura(visual.molecula);
  const modo = visual.modo === "formulas" ? "formulas" : "nombrar";
  const anillo = ficha ? ficha.molecula.enlaces.length >= ficha.molecula.atomos.length : false;
  const total = anillo ? 3 : 4;
  const r = useReproductor({ total, ms: 3200, estatico: visual.estatico, inicio: 1 });
  if (!ficha) return null;
  const paso = pasoDe(r.paso, total);
  const m = ficha.molecula;
  let res: ResultadoNombre | null = null;
  let ringAtoms: number[] = [];
  if (anillo) ringAtoms = nombrarAnillo(m).anillo;
  else res = nombrarAbierta(m);
  const cadenaSet = new Set<number>(anillo ? ringAtoms : res!.cadena);
  const cont = formulaMolecular(m);
  const grupoNombre = res && res.principal !== "ninguno" ? tGru(`nombres.${res.principal}`) : "";
  const textos: string[] = [];
  let resaltar: Set<number> | undefined;
  let resaltar2: Set<number> | undefined;
  let localizadores = false;
  let carbonos: Map<number, string> | undefined;
  let nombreFinal: { prefijos: string; cuerpo: string; acido: boolean } | null = null;
  if (modo === "nombrar") {
    if (anillo) {
      const benceno = ficha.nombre.endsWith("benceno") || ficha.nombre === "fenol";
      textos.push(benceno ? tCad("nombrar.p1Benceno") : tCad("nombrar.p1Anillo", { n: ringAtoms.length }));
      const externos = ficha.dibujo.atomos.filter((a) => !cadenaSet.has(a.id));
      textos.push(externos.length > 0 ? tCad("nombrar.p3Anillo") : tCad("nombrar.p3Sin"));
      textos.push(tCad("nombrar.p4", { nombre: ficha.nombre }));
      if (paso === 1) resaltar = cadenaSet;
      if (paso === 2) {
        resaltar = cadenaSet;
        resaltar2 = new Set(externos.map((a) => a.id));
      }
    } else {
      const rr = res!;
      const raiz = rr.partes.cuerpo.match(/^[a-záéíóú]+/)?.[0] ?? "";
      const nCad = rr.cadena.length;
      const tieneGrupo = rr.principal !== "ninguno";
      const tieneMult = rr.dobles.length + rr.triples.length > 0;
      const raizBase = ["", "met", "et", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec", "undec", "dodec"][nCad] ?? raiz;
      if (tieneGrupo && tieneMult) textos.push(tCad("nombrar.p1Ambos", { n: nCad, raiz: raizBase, grupo: grupoNombre }));
      else if (tieneGrupo) textos.push(tCad("nombrar.p1Grupo", { n: nCad, raiz: raizBase, grupo: grupoNombre }));
      else if (tieneMult) textos.push(tCad("nombrar.p1Multiple", { n: nCad, raiz: raizBase }));
      else textos.push(tCad("nombrar.p1Sola", { n: nCad, raiz: raizBase }));
      if (tieneGrupo) textos.push(tCad("nombrar.p2Grupo", { grupo: grupoNombre, loc: rr.posPrincipal.join(", ") }));
      else if (tieneMult) textos.push(tCad("nombrar.p2Multiple", { loc: [...rr.dobles, ...rr.triples].sort((a, b) => a - b).join(", ") }));
      else if (rr.ramas.length > 0) textos.push(tCad("nombrar.p2Ramas", { locs: rr.ramas.map((x) => x.pos).sort((a, b) => a - b).join(", ") }));
      else textos.push(tCad("nombrar.p2Nada"));
      if (rr.ramas.length > 0) {
        const lista = [...rr.ramas]
          .sort((a, b) => a.pos - b.pos)
          .map((x) => tCad("nombrar.ramaEn", { nombre: x.nombre, pos: x.pos }))
          .join("; ");
        textos.push(tCad("nombrar.p3Ramas", { lista }));
      } else textos.push(tCad("nombrar.p3Sin"));
      textos.push(tCad("nombrar.p4", { nombre: ficha.nombre }));
      nombreFinal = rr.partes;
      if (paso === 1) resaltar = cadenaSet;
      if (paso === 2) {
        resaltar = cadenaSet;
        localizadores = true;
      }
      if (paso === 3) {
        localizadores = true;
        const rama = new Set<number>();
        const recorrer = (i: number, desde: number) => {
          rama.add(i);
          for (const x of m.ady[i]) if (x.v !== desde && !cadenaSet.has(x.v)) recorrer(x.v, i);
        };
        for (const x of rr.ramas) recorrer(x.atomo, -1);
        resaltar2 = rama;
        resaltar = cadenaSet;
      }
    }
  } else {
    textos.push(tCad("formulas.f1"));
    textos.push(tCad("formulas.f2", { c: cont.C ?? 0, h: cont.H ?? 0 }));
    if (!anillo) textos.push(tCad("formulas.f3", { condensada: `$\\mathrm{${condensadaLatex(ficha.condensada ?? "")}}$` }));
    const conteo = Object.entries(cont)
      .sort(([a], [b]) => (a === "C" ? -1 : b === "C" ? 1 : a === "H" ? -1 : b === "H" ? 1 : a.localeCompare(b)))
      .map(([s, n]) => `${n} ${s}`)
      .join(", ");
    textos.push(tCad("formulas.f4", { formula: `$${formulaLatex(ficha.formula)}$`, conteo }));
    if (paso >= 2) {
      carbonos = new Map();
      for (const a of ficha.dibujo.atomos) if (a.el === "C") carbonos.set(a.id, textoCarbono(ficha, a.id));
    }
  }
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <Animated.View key={paso} entering={FadeInDown.duration(250)}>
        <Esqueleto dibujo={ficha.dibujo} resaltar={resaltar} resaltar2={resaltar2} localizadores={localizadores} carbonos={carbonos} />
      </Animated.View>
      {modo === "nombrar" && nombreFinal && paso === total && (
        <Animated.View entering={FadeInDown.duration(350)}>
          <Texto v="fuerte" tam={18} centro>
            {nombreFinal.acido ? (
              <Texto v="fuerte" tam={18} c={SECUNDARIO}>
                ácido{" "}
              </Texto>
            ) : null}
            {nombreFinal.prefijos ? (
              <Texto v="fuerte" tam={18} c="#D97706">
                {nombreFinal.prefijos}
              </Texto>
            ) : null}
            <Texto v="fuerte" tam={18} c={COLOR_QUIMIA}>
              {nombreFinal.cuerpo}
            </Texto>
          </Texto>
        </Animated.View>
      )}
      <Texto v="nota" tam={11} centro>
        {tCad("nota")}
      </Texto>
      <TextoPaso texto={textos[paso - 1] ?? ""} />
    </Marco>
  );
}

// ---------- Grupos funcionales ----------
export function Grupos({ visual }: { visual: VisualQuimiaGrupos }) {
  const fichas = (Array.isArray(visual.moleculas) ? visual.moleculas : [])
    .map((id) => fichaSegura(id))
    .filter((f): f is FichaMolecula => f !== null && grupoVisible(f.grupos) !== undefined)
    .slice(0, 8);
  const r = useReproductor({ total: fichas.length, ms: 3000, estatico: visual.estatico, inicio: 1 });
  if (fichas.length === 0) return null;
  const paso = pasoDe(r.paso, fichas.length);
  const actual = fichas[paso - 1];
  const grupo = grupoVisible(actual.grupos)!;
  const textoDe = (f: FichaMolecula) => {
    const g = grupoVisible(f.grupos)!;
    return tGru("paso", {
      grupo: tGru(`nombres.${g.id}`),
      general: `$${INFO_GRUPO[g.id].general}$`,
      terminacion: INFO_GRUPO[g.id].nombre,
      nombre: f.entrada.comun ? `${f.nombre} (${f.entrada.comun})` : f.nombre,
      formula: `$${formulaLatex(f.formula)}$`,
    });
  };
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <View style={styles.chips}>
        {fichas.slice(0, paso).map((f, i) => {
          const esActual = i === paso - 1;
          return (
            <Animated.View key={i} entering={FadeInDown.duration(250)} style={[styles.chip, { backgroundColor: esActual ? COLOR_QUIMIA : "transparent" }]}>
              <Texto v="fuerte" tam={11} c={esActual ? "#fff" : COLOR_QUIMIA}>
                {tGru(`nombres.${grupoVisible(f.grupos)!.id}`)}
              </Texto>
            </Animated.View>
          );
        })}
      </View>
      <Animated.View key={actual.entrada.id} entering={FadeInDown.duration(300)}>
        <Esqueleto dibujo={actual.dibujo} resaltar={new Set(grupo.atomos)} />
      </Animated.View>
      <Texto v="nota" tam={11} centro>
        {tGru("nota")}
      </Texto>
      <TextoPaso texto={textoDe(actual)} />
    </Marco>
  );
}

// ---------- Isomería ----------
const TIPOS_ISO = ["cadena", "posicion", "funcion", "geometrica"] as const;

export function Isomeria({ visual }: { visual: VisualQuimiaIsomeria }) {
  const fichas = (Array.isArray(visual.moleculas) ? visual.moleculas : [])
    .map((id) => fichaSegura(id))
    .filter((f): f is FichaMolecula => f !== null)
    .slice(0, 6);
  const valido = fichas.length >= 2 && fichas.every((f) => f.formula === fichas[0].formula);
  const total = fichas.length + 1;
  const r = useReproductor({ total, ms: 2800, estatico: visual.estatico, inicio: 1 });
  if (!valido) return null;
  const paso = pasoDe(r.paso, total);
  const tipo = TIPOS_ISO.includes(visual.isomeria as (typeof TIPOS_ISO)[number]) ? visual.isomeria : null;
  const formula = `$${formulaLatex(fichas[0].formula)}$`;
  const resumen = tipo ? tIso(`resumen.${tipo}`, { formula, n: fichas.length }) : tIso("resumen.generico", { formula, n: fichas.length });
  const textoPaso = paso <= fichas.length ? tIso("isomero", { n: paso, nombre: fichas[paso - 1].nombre, formula }) : resumen;
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <T negrita tam={15} centro>
        {tIso("formulaComun", { formula })}
      </T>
      <View style={styles.isomeros}>
        {fichas.slice(0, Math.min(paso, fichas.length)).map((f, i) => {
          const esActual = paso <= fichas.length && i === paso - 1;
          return (
            <Animated.View
              key={f.entrada.id}
              entering={FadeInDown.duration(300)}
              style={[styles.isomero, { borderColor: esActual || paso > fichas.length ? COLOR_QUIMIA : BORDE, borderWidth: esActual ? 2 : 1 }]}
            >
              <Esqueleto dibujo={f.dibujo} maxAncho={150} />
              <Texto v="fuerte" tam={12} centro>
                {f.nombre}
              </Texto>
              <Texto v="nota" tam={11} centro>
                {latexAUnicode(`\\mathrm{${condensadaLatex(f.condensada ?? f.formula)}}`)}
              </Texto>
            </Animated.View>
          );
        })}
      </View>
      <Texto v="nota" tam={11} centro>
        {tIso("nota")}
      </Texto>
      <TextoPaso texto={textoPaso} />
    </Marco>
  );
}

// ---------- Hibridación del carbono ----------
const COLOR_PI = "#F59E0B";
const MOLECULAS = ["metano", "eteno", "etino"] as const;
type NombreHib = (typeof MOLECULAS)[number];
interface EnlaceHib {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tipo: "sigma" | "pi" | "cuna" | "atras";
}
interface DibujoHib {
  atomos: { x: number; y: number; texto: string; carbono: boolean }[];
  enlaces: EnlaceHib[];
  arco: { cx: number; cy: number; r: number; desde: number; hasta: number; tx: number; ty: number };
}
const DIBUJOS: Record<NombreHib, DibujoHib> = {
  metano: {
    atomos: [
      { x: 130, y: 78, texto: "C", carbono: true },
      { x: 130, y: 22, texto: "H", carbono: false },
      { x: 82, y: 112, texto: "H", carbono: false },
      { x: 184, y: 112, texto: "H", carbono: false },
      { x: 192, y: 52, texto: "H", carbono: false },
    ],
    enlaces: [
      { x1: 130, y1: 78, x2: 130, y2: 30, tipo: "sigma" },
      { x1: 130, y1: 78, x2: 90, y2: 106, tipo: "sigma" },
      { x1: 130, y1: 78, x2: 176, y2: 106, tipo: "cuna" },
      { x1: 130, y1: 78, x2: 184, y2: 56, tipo: "atras" },
    ],
    arco: { cx: 130, cy: 78, r: 44, desde: 90, hasta: 215, tx: 62, ty: 60 },
  },
  eteno: {
    atomos: [
      { x: 105, y: 75, texto: "C", carbono: true },
      { x: 165, y: 75, texto: "C", carbono: true },
      { x: 75, y: 30, texto: "H", carbono: false },
      { x: 75, y: 120, texto: "H", carbono: false },
      { x: 195, y: 30, texto: "H", carbono: false },
      { x: 195, y: 120, texto: "H", carbono: false },
    ],
    enlaces: [
      { x1: 105, y1: 75, x2: 165, y2: 75, tipo: "sigma" },
      { x1: 105, y1: 86, x2: 165, y2: 86, tipo: "pi" },
      { x1: 105, y1: 75, x2: 82, y2: 38, tipo: "sigma" },
      { x1: 105, y1: 75, x2: 82, y2: 112, tipo: "sigma" },
      { x1: 165, y1: 75, x2: 188, y2: 38, tipo: "sigma" },
      { x1: 165, y1: 75, x2: 188, y2: 112, tipo: "sigma" },
    ],
    arco: { cx: 105, cy: 75, r: 30, desde: 120, hasta: 240, tx: 62, ty: 79 },
  },
  etino: {
    atomos: [
      { x: 40, y: 75, texto: "H", carbono: false },
      { x: 100, y: 75, texto: "C", carbono: true },
      { x: 160, y: 75, texto: "C", carbono: true },
      { x: 220, y: 75, texto: "H", carbono: false },
    ],
    enlaces: [
      { x1: 50, y1: 75, x2: 92, y2: 75, tipo: "sigma" },
      { x1: 108, y1: 75, x2: 152, y2: 75, tipo: "sigma" },
      { x1: 108, y1: 65, x2: 152, y2: 65, tipo: "pi" },
      { x1: 108, y1: 85, x2: 152, y2: 85, tipo: "pi" },
      { x1: 168, y1: 75, x2: 210, y2: 75, tipo: "sigma" },
    ],
    arco: { cx: 100, cy: 75, r: 24, desde: 180, hasta: 180, tx: 130, ty: 42 },
  },
};
const puntoArco = (cx: number, cy: number, r: number, g: number) => ({ x: cx + r * Math.cos((g * Math.PI) / 180), y: cy - r * Math.sin((g * Math.PI) / 180) });

export function Hibridacion({ visual }: { visual: VisualQuimiaHibridacion }) {
  const { width } = useWindowDimensions();
  const nombre = (MOLECULAS as readonly string[]).includes(visual.molecula) ? (visual.molecula as NombreHib) : null;
  const r = useReproductor({ total: 4, ms: 3000, estatico: visual.estatico, inicio: 1 });
  if (!nombre) return null;
  const ficha = fichaDe(nombre);
  const info = hibridacionDe(ficha.molecula, 0);
  const dibujo = DIBUJOS[nombre];
  const paso = pasoDe(r.paso, 4);
  const angulo = info.angulo.toLocaleString("es", { maximumFractionDigits: 1 });
  const aprox = info.hibridacion === "sp2" ? "≈ " : "";
  const hibTexto = info.hibridacion === "sp3" ? "$\\mathrm{sp^{3}}$" : info.hibridacion === "sp2" ? "$\\mathrm{sp^{2}}$" : "$\\mathrm{sp}$";
  const textos = [
    tHib("p1", { formula: `$${formulaLatex(ficha.formula)}$` }),
    tHib("p2", { sigma: info.sigma, pi: info.pi }),
    tHib("p3", { sigma: info.sigma, hib: hibTexto, mezcla: tHib(`mezcla.${info.hibridacion}`) }),
    tHib("p4", { hib: hibTexto, angulo: `${aprox}${angulo}`, geometria: tHib(`geometria.${info.hibridacion}`) }),
  ];
  const a = dibujo.arco;
  const p1 = puntoArco(a.cx, a.cy, a.r, a.desde);
  const p2 = puntoArco(a.cx, a.cy, a.r, a.hasta);
  const colorSigma = paso >= 2 ? COLOR_QUIMIA : FG;
  const w = Math.min(380, width - 56);
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <Svg width={w} height={(w * 150) / 260} viewBox="0 0 260 150" style={{ alignSelf: "center" }}>
        {dibujo.enlaces.map((e, i) => {
          if (e.tipo === "pi") return <Line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} strokeWidth={3} strokeDasharray="5 4" strokeLinecap="round" stroke={paso >= 2 ? COLOR_PI : FG} />;
          if (e.tipo === "cuna") {
            const n = Math.hypot(e.x2 - e.x1, e.y2 - e.y1);
            const nx = (-(e.y2 - e.y1) / n) * 6;
            const ny = ((e.x2 - e.x1) / n) * 6;
            return <Polygon key={i} points={`${e.x1},${e.y1} ${e.x2 + nx},${e.y2 + ny} ${e.x2 - nx},${e.y2 - ny}`} fill={colorSigma} />;
          }
          return <Line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} strokeWidth={3} strokeLinecap="round" strokeDasharray={e.tipo === "atras" ? "3 4" : undefined} stroke={colorSigma} />;
        })}
        {dibujo.atomos.map((at, i) => (
          <G key={i}>
            <Circle cx={at.x} cy={at.y} r={11} fill={SUPERFICIE} />
            <SvgText x={at.x} y={at.y + 5.5} textAnchor="middle" fontSize={15} fontWeight="800" fill={at.carbono ? COLOR_QUIMIA : FG}>
              {at.texto}
            </SvgText>
          </G>
        ))}
        {paso >= 4 && info.hibridacion !== "sp" && (
          <G>
            <Path d={`M ${p1.x} ${p1.y} A ${a.r} ${a.r} 0 0 1 ${p2.x} ${p2.y}`} fill="none" stroke={FG} strokeWidth={1.5} />
            <SvgText x={a.tx} y={a.ty} textAnchor="middle" fontSize={12} fontWeight="700" fill={FG}>
              {`${aprox}${angulo}°`}
            </SvgText>
          </G>
        )}
        {paso >= 4 && info.hibridacion === "sp" && (
          <G>
            <Line x1={50} y1={112} x2={210} y2={112} stroke={FG} strokeWidth={1.5} />
            <Polygon points="50,112 58,108 58,116" fill={FG} />
            <Polygon points="210,112 202,108 202,116" fill={FG} />
            <SvgText x={130} y={132} textAnchor="middle" fontSize={12} fontWeight="700" fill={FG}>
              {`${angulo}°`}
            </SvgText>
          </G>
        )}
        {paso >= 2 && (
          <G>
            <Line x1={14} y1={140} x2={30} y2={140} stroke={COLOR_QUIMIA} strokeWidth={3} />
            <SvgText x={34} y={143} fontSize={11} fontWeight="700" fill={FG}>
              σ
            </SvgText>
            {info.pi > 0 && (
              <G>
                <Line x1={52} y1={140} x2={68} y2={140} stroke={COLOR_PI} strokeWidth={3} strokeDasharray="4 3" />
                <SvgText x={72} y={143} fontSize={11} fontWeight="700" fill={FG}>
                  π
                </SvgText>
              </G>
            )}
          </G>
        )}
      </Svg>
      <Texto v="nota" tam={11} centro>
        {tHib(nombre === "metano" ? "nota" : "notaPlana")}
      </Texto>
      <TextoPaso texto={textos[paso - 1]} />
    </Marco>
  );
}

// ---------- Enlaces (iónico, covalente, metálico) ----------
// Dibujado con vistas (no SVG) para que átomos y electrones se muevan con
// Reanimated: el lienzo es de 320 × 160 como en la web, escalado al ancho.
const ELECTRON = "#F59E0B";
const COLOR_CATION = "#3B82F6";
const COLOR_ANION = "#EF4444";
const SUPER: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
const ionTexto = (s: string, carga: number) => `${s}${Math.abs(carga) === 1 ? "" : SUPER[String(Math.abs(carga))]}${carga > 0 ? "⁺" : "⁻"}`;
const polar = (cx: number, cy: number, radio: number, g: number) => ({ x: cx + radio * Math.cos((g * Math.PI) / 180), y: cy + radio * Math.sin((g * Math.PI) / 180) });
const MS = 750;

function Bola({ e, x, y, r, fondo, borde, opacidad = 1 }: { e: number; x: number; y: number; r: number; fondo: string; borde?: string; opacidad?: number }) {
  const vx = useSharedValue(x);
  const vy = useSharedValue(y);
  const vr = useSharedValue(r);
  useEffect(() => {
    const t = { duration: MS, easing: Easing.out(Easing.cubic) };
    vx.set(withTiming(x, t));
    vy.set(withTiming(y, t));
    vr.set(withTiming(r, t));
  }, [x, y, r, vx, vy, vr]);
  const a = useAnimatedStyle(() => ({
    left: (vx.value - vr.value) * e,
    top: (vy.value - vr.value) * e,
    width: vr.value * 2 * e,
    height: vr.value * 2 * e,
    borderRadius: vr.value * e,
  }));
  return <Animated.View style={[{ position: "absolute", backgroundColor: fondo, opacity: opacidad, borderWidth: borde ? 1.6 : 0, borderColor: borde }, a]} />;
}

function Etiqueta({ e, x, y, texto, c = FG, tam = 15 }: { e: number; x: number; y: number; texto: string; c?: string; tam?: number }) {
  const vx = useSharedValue(x);
  useEffect(() => {
    vx.set(withTiming(x, { duration: MS }));
  }, [x, vx]);
  const a = useAnimatedStyle(() => ({ left: vx.value * e - 40 }));
  return (
    <Animated.View style={[{ position: "absolute", top: y * e - tam * 0.7, width: 80, alignItems: "center" }, a]} pointerEvents="none">
      <Texto v="fuerte" tam={tam * Math.min(1.15, e)} c={c} centro>
        {texto}
      </Texto>
    </Animated.View>
  );
}

// Electrón del "mar" que vaga entre los cationes.
function ElectronVagabundo({ e, x, y, vaga, sem }: { e: number; x: number; y: number; vaga: boolean; sem: number }) {
  const vx = useSharedValue(x);
  const vy = useSharedValue(y);
  useEffect(() => {
    if (vaga) {
      const d = 1300 + (Math.abs(sem) % 3) * 300;
      vx.set(withRepeat(withSequence(withTiming(x + 26 + sem * 3, { duration: d }), withTiming(x - 14, { duration: d }), withTiming(x, { duration: d })), -1));
      vy.set(withRepeat(withSequence(withTiming(y - 16 - sem * 2, { duration: d }), withTiming(y + 8, { duration: d }), withTiming(y, { duration: d })), -1));
    } else {
      vx.set(withTiming(x, { duration: 800 }));
      vy.set(withTiming(y, { duration: 800 }));
    }
  }, [x, y, vaga, sem, vx, vy]);
  const a = useAnimatedStyle(() => ({ left: (vx.value - 3.2) * e, top: (vy.value - 3.2) * e }));
  return <Animated.View style={[{ position: "absolute", width: 6.4 * e, height: 6.4 * e, borderRadius: 3.2 * e, backgroundColor: ELECTRON }, a]} />;
}

interface PuntoE {
  x: number;
  y: number;
  c: string;
}

const ANGULOS_ANION = [0, 45, -45, 90, -90, 135, -135, 180];
const ANGULOS_CATION = [0, -45, 45, -90, 90, -135, 135, 180];

function Ionico({ d, paso, e }: { d: EjemploIonico; paso: number; e: number }) {
  const ec = valenciaDe(d.cation) ?? 0;
  const ea = valenciaDe(d.anion) ?? 0;
  const n = d.transferidos;
  const cy = 80;
  const cxC = paso >= 4 ? 108 : 78;
  const cxA = paso >= 4 ? 200 : 242;
  const rC = paso >= 3 ? 24 : 32;
  const rA = paso >= 3 ? 42 : 36;
  const carga = paso >= 3;
  // Cada electrón con un id fijo: así el que se transfiere VIAJA de un átomo al otro.
  const puntos: (PuntoE & { id: string; visible: boolean })[] = [];
  for (let i = 0; i < ec; i++) {
    const cede = i >= ec - n;
    if (paso >= 2 && cede) puntos.push({ id: `c${i}`, ...polar(cxA, cy, rA, ANGULOS_ANION[ea + (i - (ec - n))]), c: ELECTRON, visible: true });
    else puntos.push({ id: `c${i}`, ...polar(cxC, cy, rC, ANGULOS_CATION[i]), c: ELECTRON, visible: paso < 3 });
  }
  for (let i = 0; i < ea; i++) puntos.push({ id: `a${i}`, ...polar(cxA, cy, rA, ANGULOS_ANION[i]), c: FG, visible: true });
  return (
    <>
      <Bola e={e} x={cxC} y={cy} r={rC} fondo={carga ? mezcla(COLOR_CATION, 28) : color.surface2} borde={carga ? COLOR_CATION : BORDE} />
      <Bola e={e} x={cxA} y={cy} r={rA} fondo={carga ? mezcla(COLOR_ANION, 22) : color.surface2} borde={carga ? COLOR_ANION : BORDE} />
      <Etiqueta e={e} x={cxC} y={cy} texto={d.cation} />
      <Etiqueta e={e} x={cxA} y={cy} texto={d.anion} />
      {carga && <Etiqueta e={e} x={cxC} y={cy - rC - 10} texto={ionTexto(d.cation, n)} c={COLOR_CATION} tam={12} />}
      {carga && <Etiqueta e={e} x={cxA} y={cy - rA - 10} texto={ionTexto(d.anion, -n)} c={COLOR_ANION} tam={12} />}
      {puntos.map((p) => (
        <Bola key={p.id} e={e} x={p.x} y={p.y} r={3.6} fondo={p.c} opacidad={p.visible ? 1 : 0} />
      ))}
      {paso >= 4 && (
        <Animated.View entering={FadeInDown.duration(300)} style={{ position: "absolute", left: (cxC + rC + 6) * e, width: (cxA - rA - cxC - rC - 12) * e, top: cy * e - 1.5, height: 3, backgroundColor: COLOR_QUIMIA, borderRadius: 2 }} />
      )}
    </>
  );
}

function Covalente({ d, paso, e }: { d: EjemploCovalente; paso: number; e: number }) {
  const va = valenciaDe(d.a) ?? 0;
  const vb = valenciaDe(d.b) ?? 0;
  const pares = d.pares;
  const cy = 80;
  const unidos = paso >= 2;
  const cxA = unidos ? 125 : 78;
  const cxB = unidos ? 195 : 242;
  const r = 40;
  const medio = 160;
  const compartidos = paso >= 3;
  const dePar = (i: number) => cy + (i - (pares - 1) / 2) * 16;
  const puntos: (PuntoE & { id: string })[] = [];
  const distribuir = (id: string, cx: number, v: number, lado: 1 | -1, c: string) => {
    const sueltos = v - pares;
    for (let i = 0; i < v; i++) {
      if (compartidos && i < pares) puntos.push({ id: `${id}${i}`, x: medio + lado * 4.5, y: dePar(i), c });
      else if (compartidos) {
        const k = i - pares;
        const desde = lado === 1 ? -65 : 115;
        const g = sueltos === 1 ? desde + 32 : desde + (k * 130) / (sueltos - 1);
        puntos.push({ id: `${id}${i}`, ...polar(cx, cy, r + 2, g), c: FG });
      } else puntos.push({ id: `${id}${i}`, ...polar(cx, cy, r + 2, -90 + (i * 360) / v + (lado === 1 ? 0 : 180 / v)), c: i < pares ? c : FG });
    }
  };
  distribuir("a", cxA, va, -1, ELECTRON);
  distribuir("b", cxB, vb, 1, "#22C55E");
  const esPolar = paso >= 4 && polaridad(d.a, d.b) === "polar";
  return (
    <>
      <Bola e={e} x={cxA} y={cy} r={d.a === "H" ? 30 : r} fondo={color.surface2} borde={BORDE} />
      <Bola e={e} x={cxB} y={cy} r={d.b === "H" ? 30 : r} fondo={color.surface2} borde={BORDE} />
      <Etiqueta e={e} x={unidos ? cxA - 22 : cxA} y={cy} texto={d.a} />
      <Etiqueta e={e} x={unidos ? cxB + 22 : cxB} y={cy} texto={d.b} />
      {puntos.map((p) => (
        <Bola key={p.id} e={e} x={p.x} y={p.y} r={3.6} fondo={p.c} />
      ))}
      {paso >= 4 &&
        Array.from({ length: pares }, (_, i) => (
          <Animated.View key={i} entering={FadeInDown.duration(300)} style={{ position: "absolute", left: (medio - 12) * e, width: 24 * e, top: dePar(i) * e - 1, height: 2.2, borderRadius: 1, backgroundColor: COLOR_QUIMIA }} />
        ))}
      {esPolar && <Etiqueta e={e} x={cxA - 4} y={cy + r + 18} texto="δ+" c={COLOR_CATION} tam={13} />}
      {esPolar && <Etiqueta e={e} x={cxB + 4} y={cy + r + 18} texto="δ−" c={COLOR_ANION} tam={13} />}
    </>
  );
}

function Metalico({ d, paso, e, estatico }: { d: EjemploMetalico; paso: number; e: number; estatico: boolean }) {
  const n = d.aportados;
  const liberados = paso >= 2;
  const cationes: { x: number; y: number; i: number }[] = [];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) cationes.push({ x: 62 + i * 65, y: 35 + j * 45, i: j * 4 + i });
  return (
    <>
      {paso >= 4 && (
        <Animated.View entering={FadeInDown.duration(300)} style={{ position: "absolute", left: 22 * e, top: 8 * e, width: 276 * e, height: 144 * e, borderRadius: 18 * e, backgroundColor: mezcla(ELECTRON, 14), borderWidth: 1, borderStyle: "dashed", borderColor: mezcla(ELECTRON, 50) }} />
      )}
      {cationes.map((c) => (
        <View key={c.i}>
          <Bola e={e} x={c.x} y={c.y} r={liberados ? 14 : 17} fondo={liberados ? mezcla(COLOR_CATION, 30) : color.surface2} borde={liberados ? COLOR_CATION : BORDE} />
          <Etiqueta e={e} x={c.x} y={c.y} texto={liberados ? ionTexto(d.simbolo, n) : d.simbolo} tam={liberados && n > 1 ? 8 : 9.5} />
        </View>
      ))}
      {cationes.flatMap((c) =>
        Array.from({ length: n }, (_, k) => {
          const propio = polar(c.x, c.y, 17, -45 + k * 180);
          const hueco = { x: c.x + 32 + k * 7, y: c.y + 22 - k * 5 };
          const dest = liberados ? hueco : propio;
          return <ElectronVagabundo key={`${c.i}-${k}`} e={e} x={dest.x} y={dest.y} vaga={liberados && paso >= 3 && !estatico} sem={((c.i * 7 + k * 3) % 5) - 2} />;
        })
      )}
    </>
  );
}

function coma2(n: number) {
  return String(Math.round(n * 100) / 100).replace(".", ",");
}

function parametros(ej: NonNullable<ReturnType<typeof ejemploEnlace>>): Record<string, string | number> {
  if (ej.tipo === "ionico") {
    return {
      cation: ej.cation,
      anion: ej.anion,
      ec: valenciaDe(ej.cation) ?? 0,
      ea: valenciaDe(ej.anion) ?? 0,
      n: ej.transferidos,
      ionCation: ionTexto(ej.cation, ej.transferidos),
      ionAnion: ionTexto(ej.anion, -ej.transferidos),
      formula: formulaUnicode(ej.formula),
    };
  }
  if (ej.tipo === "covalente") {
    const ea = datosDe(ej.a)?.electronegatividad ?? 0;
    const eb = datosDe(ej.b)?.electronegatividad ?? 0;
    return {
      a: ej.a,
      b: ej.b,
      va: valenciaDe(ej.a) ?? 0,
      vb: valenciaDe(ej.b) ?? 0,
      pares: ej.pares,
      tipo: ej.pares === 1 ? "simple" : ej.pares === 2 ? "doble" : "triple",
      dif: coma2(Math.abs(ea - eb)),
      masElectronegativo: ea >= eb ? ej.a : ej.b,
      formula: formulaUnicode(ej.formula),
    };
  }
  return { simbolo: ej.simbolo, n: ej.aportados, ion: ionTexto(ej.simbolo, ej.aportados) };
}

export function Enlace({ visual }: { visual: VisualQuimiaEnlace }) {
  const { width } = useWindowDimensions();
  const ejemplo = ejemploEnlace(visual.ejemplo);
  const valido = ejemplo !== undefined && ejemplo.tipo === visual.enlace;
  const r = useReproductor({ total: 4, ms: 2800, estatico: visual.estatico, inicio: 1 });
  if (!valido || !ejemplo) return null;
  const paso = pasoDe(r.paso, 4);
  const params = parametros(ejemplo);
  const textos = Array.from({ length: 4 }, (_, i) =>
    ejemplo.tipo === "covalente" && i === 3 ? tEnl(`covalente.p4${polaridad(ejemplo.a, ejemplo.b) === "polar" ? "Polar" : "Apolar"}`, params) : tEnl(`${ejemplo.tipo}.p${i + 1}`, params)
  );
  const ancho = Math.min(420, width - 56);
  const e = ancho / 320;
  return (
    <Marco acento={COLOR_QUIMIA} titulo={visual.titulo} r={r}>
      <View style={{ width: ancho, height: 160 * e, alignSelf: "center" }}>
        {ejemplo.tipo === "ionico" && <Ionico d={ejemplo} paso={paso} e={e} />}
        {ejemplo.tipo === "covalente" && <Covalente d={ejemplo} paso={paso} e={e} />}
        {ejemplo.tipo === "metalico" && <Metalico d={ejemplo} paso={paso} e={e} estatico={!!visual.estatico} />}
      </View>
      <TextoPaso texto={textos[paso - 1]} />
    </Marco>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  chip: { paddingHorizontal: 9, paddingVertical: 2, borderRadius: 999, borderWidth: 1, borderColor: COLOR_QUIMIA },
  isomeros: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  isomero: { width: "47%", minWidth: 140, alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 8, borderRadius: 12, backgroundColor: FONDO },
});
