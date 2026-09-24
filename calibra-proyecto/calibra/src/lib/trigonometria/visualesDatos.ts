import { dec, decTex, r2, type Decimal } from "./formato";
import type { PuntoPx } from "./visualesLey";
import { aNumero, divF, frac, mulF, restaF, sumaF, type Frac } from "./fracciones";
import {
  EXACTO_UNO,
  cosExacto,
  cosecExacto,
  cotExacto,
  igualE,
  mulE,
  planoE,
  secExacto,
  senExacto,
  sumaE,
  tanExacto,
  texE,
  valorE,
  normalizarGrados,
  referenciaGrados,
  type Exacto,
} from "./exactos";
import { cuadranteDe, radianesPlano, radianesTex } from "./angulos";
import {
  aRad,
  arcoCoseno,
  arcoSeno,
  arcoTangente,
  rectanguloDeAnguloYLado,
  rectanguloDeCatetos,
  redondear,
} from "./triangulos";
import {
  amplitud,
  asintotasTan,
  ecuacionPlano,
  ecuacionTex,
  lineaMedia,
  multiploPiPlano,
  onda,
  periodoPi,
  puntosClave,
  valorOnda,
  type Onda,
} from "./ondas";
import type {
  NumeroJson,
  OndaJson,
  PasoOnda,
  PasoTriangulo,
  VisualTrigonometriaCirculo,
  VisualTrigonometriaCuadrantes,
  VisualTrigonometriaEcuacion,
  VisualTrigonometriaIdentidad,
  VisualTrigonometriaOnda,
  VisualTrigonometriaResolver,
  VisualTrigonometriaTriangulo,
} from "./visuales";

// Funciones PURAS que preparan lo que dibujan los visuales de Trigonometría
// (src/components/trigonometria/visuales/): valores exactos, coordenadas ya
// redondeadas a 2 decimales (Math.sin/cos difieren en el último bit entre Node y
// Chromium, y eso rompe la hidratación de un SVG), fórmulas en LaTeX y textos
// alternativos para lectores de pantalla. visualesDatos.test.ts contrasta cada
// una con un cálculo independiente (Math.*, Pitágoras, leyes de seno y coseno).
// El componente nunca calcula un valor ni una posición: solo pinta lo de acá.

export { dec, decTex, type Decimal };

// ---------- entradas JSON ----------
export function fracDeJson(n: NumeroJson | undefined, porDefecto: number): Frac {
  if (n === undefined) return frac(porDefecto);
  if (Array.isArray(n)) return frac(n[0], n[1]);
  return frac(n);
}

export function ondaDeJson(o: OndaJson): Onda {
  return onda(o.fn, fracDeJson(o.a, 1), fracDeJson(o.b, 1), fracDeJson(o.c, 0), fracDeJson(o.d, 0));
}

export function esOndaJsonValida(o: unknown): o is OndaJson {
  if (typeof o !== "object" || o === null) return false;
  const x = o as Record<string, unknown>;
  if (x.fn !== "sen" && x.fn !== "cos" && x.fn !== "tan") return false;
  const num = (v: unknown): boolean =>
    v === undefined || (typeof v === "number" && Number.isFinite(v)) || (Array.isArray(v) && v.length === 2 && v.every((k) => Number.isInteger(k)) && v[1] !== 0);
  if (![x.a, x.b, x.c, x.d].every(num)) return false;
  try {
    ondaDeJson(x as unknown as OndaJson);
    return true;
  } catch {
    return false;
  }
}

// =====================================================================
// 1) Triángulo rectángulo: lados relativos y razones
// =====================================================================
export type Rol = "opuesto" | "adyacente" | "hipotenusa";
export type FnRazon = "sen" | "cos" | "tan" | "cosec" | "sec" | "cot";

export interface RazonDatos {
  fn: FnRazon;
  num: Rol;
  den: Rol;
  numValor: number;
  denValor: number;
  valor: number;
}

export interface PasoTrianguloDatos {
  id: PasoTriangulo;
  // Roles que se resaltan en este paso.
  resaltar: Rol[];
  razon?: RazonDatos;
}

export interface TrianguloDatos {
  a: number;
  b: number;
  c: number;
  vertice: "A" | "B";
  // Rol de cada lado (a, b, c) visto desde el vértice elegido.
  rolDe: Record<"a" | "b" | "c", Rol>;
  anguloGrados: number;
  pasos: PasoTrianguloDatos[];
}

const PASOS_TRIANGULO_POR_DEFECTO: PasoTriangulo[] = ["hipotenusa", "opuesto", "adyacente", "sen", "cos", "tan"];
const RAZON_ROLES: Record<FnRazon, [Rol, Rol]> = {
  sen: ["opuesto", "hipotenusa"],
  cos: ["adyacente", "hipotenusa"],
  tan: ["opuesto", "adyacente"],
  cosec: ["hipotenusa", "opuesto"],
  sec: ["hipotenusa", "adyacente"],
  cot: ["adyacente", "opuesto"],
};

export function datosTriangulo(v: Pick<VisualTrigonometriaTriangulo, "catetos" | "vertice" | "pasos">): TrianguloDatos {
  const [a, b] = v.catetos;
  if (!(a > 0 && b > 0)) throw new Error("Los catetos deben ser positivos");
  const r = rectanguloDeCatetos(a, b);
  const rolDe: Record<"a" | "b" | "c", Rol> =
    v.vertice === "A" ? { a: "opuesto", b: "adyacente", c: "hipotenusa" } : { a: "adyacente", b: "opuesto", c: "hipotenusa" };
  const valorDeRol: Record<Rol, number> = { opuesto: v.vertice === "A" ? a : b, adyacente: v.vertice === "A" ? b : a, hipotenusa: r.c };
  const pasos = (v.pasos ?? PASOS_TRIANGULO_POR_DEFECTO).map((id): PasoTrianguloDatos => {
    if (id === "hipotenusa" || id === "opuesto" || id === "adyacente") return { id, resaltar: [id] };
    const [num, den] = RAZON_ROLES[id];
    return { id, resaltar: [num, den], razon: { fn: id, num, den, numValor: valorDeRol[num], denValor: valorDeRol[den], valor: valorDeRol[num] / valorDeRol[den] } };
  });
  return { a, b, c: r.c, vertice: v.vertice, rolDe, anguloGrados: v.vertice === "A" ? r.A : r.B, pasos };
}

// =====================================================================
// 2) Resolver un triángulo rectángulo (hallar un lado o un ángulo)
// =====================================================================
export interface PasoResolver {
  clave: "figura" | "roles" | "razon" | "plantear" | "despejar" | "calcular" | "comprobar";
  // Fórmulas en LaTeX (sin $), en orden de aparición.
  formulas: string[];
}

export interface ResolverDatos {
  modo: "lado" | "angulo";
  // Triángulo real (recto en C) para dibujar.
  a: number;
  b: number;
  c: number;
  A: number;
  // Lados dados (se muestran con su valor) y lado pedido (se muestra como "?"); en modo "angulo" `pedido` es null.
  dados: ("a" | "b" | "c")[];
  pedido: "a" | "b" | "c" | null;
  fn: "sen" | "cos" | "tan";
  // Roles vistos desde A.
  rolDe: Record<"a" | "b" | "c", Rol>;
  resultado: number;
  pasos: PasoResolver[];
}

const ROL_DESDE_A: Record<"a" | "b" | "c", Rol> = { a: "opuesto", b: "adyacente", c: "hipotenusa" };

function fnDeRoles(x: Rol, y: Rol): "sen" | "cos" | "tan" {
  const par = new Set([x, y]);
  if (par.has("opuesto") && par.has("hipotenusa")) return "sen";
  if (par.has("adyacente") && par.has("hipotenusa")) return "cos";
  return "tan";
}

const NOMBRE_FN_TEX: Record<"sen" | "cos" | "tan", string> = { sen: "\\operatorname{sen}", cos: "\\cos", tan: "\\tan" };
const INVERSA_TEX: Record<"sen" | "cos" | "tan", string> = { sen: "\\operatorname{sen}^{-1}", cos: "\\cos^{-1}", tan: "\\tan^{-1}" };
const valorFn = (fn: "sen" | "cos" | "tan", g: number): number => (fn === "sen" ? Math.sin(aRad(g)) : fn === "cos" ? Math.cos(aRad(g)) : Math.tan(aRad(g)));

export function datosResolver(v: VisualTrigonometriaResolver, sep: Decimal = ","): ResolverDatos {
  const d = (x: number, n = 2) => decTex(x, n, sep);
  if (v.modo === "lado") {
    if (v.dado === v.pedido) throw new Error("El lado dado y el pedido deben ser distintos");
    if (!(v.angulo > 0 && v.angulo < 90 && v.valor > 0)) throw new Error("Ángulo agudo y lado positivo");
    const r = rectanguloDeAnguloYLado(v.angulo, v.dado, v.valor);
    const lados = { a: r.a, b: r.b, c: r.c };
    const fn = fnDeRoles(ROL_DESDE_A[v.dado], ROL_DESDE_A[v.pedido]);
    const num = fnRatioNumerador(fn);
    const eq = `${NOMBRE_FN_TEX[fn]}(${v.angulo}^{\\circ})`;
    // fn(A) = numerador / denominador, donde uno de los dos es el lado pedido.
    const denLetra = fnRatioDenominador(fn);
    const letraDe = (rol: Rol): "a" | "b" | "c" => (rol === "opuesto" ? "a" : rol === "adyacente" ? "b" : "c");
    const numL = letraDe(num);
    const denL = letraDe(denLetra);
    const plantear = `${eq}=\\dfrac{${numL === v.pedido ? v.pedido : d(v.valor)}}{${denL === v.pedido ? v.pedido : d(v.valor)}}`;
    const despeje = numL === v.pedido ? `${v.pedido}=${d(v.valor)}\\cdot ${eq}` : `${v.pedido}=\\dfrac{${d(v.valor)}}{${eq}}`;
    const s = valorFn(fn, v.angulo);
    const resultado = redondear(lados[v.pedido], 2);
    const calcular = numL === v.pedido ? `${v.pedido}=${d(v.valor)}\\cdot ${d(s, 4)}\\approx ${d(resultado)}` : `${v.pedido}=\\dfrac{${d(v.valor)}}{${d(s, 4)}}\\approx ${d(resultado)}`;
    const otro = (["a", "b", "c"] as const).find((l) => l !== v.dado && l !== v.pedido)!;
    const comprobar =
      v.pedido === "c"
        ? [`c=${d(resultado)}>${d(redondear(lados.a, 2))}\\ \\text{y}\\ c>${d(redondear(lados.b, 2))}`]
        : v.dado === "c"
          ? [`${v.pedido}=${d(resultado)}<c=${d(v.valor)}`]
          : [`c=${d(redondear(r.c, 2))}>${v.pedido}=${d(resultado)}\\ \\text{y}\\ c>${v.dado}=${d(v.valor)}`];
    void otro;
    return {
      modo: "lado",
      a: r.a,
      b: r.b,
      c: r.c,
      A: v.angulo,
      dados: [v.dado],
      pedido: v.pedido,
      fn,
      rolDe: ROL_DESDE_A,
      resultado,
      pasos: [
        { clave: "figura", formulas: [] },
        { clave: "roles", formulas: [] },
        { clave: "razon", formulas: [`${eq}=\\dfrac{\\text{${num}}}{\\text{${denLetra}}}`] },
        { clave: "plantear", formulas: [plantear] },
        { clave: "despejar", formulas: [despeje] },
        { clave: "calcular", formulas: [calcular] },
        { clave: "comprobar", formulas: comprobar },
      ],
    };
  }
  const [l1, l2] = v.lados;
  if (l1.lado === l2.lado) throw new Error("Los dos lados deben ser distintos");
  if (!(l1.valor > 0 && l2.valor > 0)) throw new Error("Lados positivos");
  const dados = new Set([l1.lado, l2.lado]);
  // Se arma el triángulo con los dos lados dados (se completa con Pitágoras el tercero).
  const val = (l: "a" | "b" | "c"): number | undefined => (l1.lado === l ? l1.valor : l2.lado === l ? l2.valor : undefined);
  let a = val("a");
  let b = val("b");
  const c = val("c");
  if (c !== undefined) {
    const otro = a ?? b!;
    if (!(c > otro)) throw new Error("La hipotenusa debe ser el lado mayor");
    if (a === undefined) a = Math.sqrt(c * c - otro * otro);
    else b = Math.sqrt(c * c - otro * otro);
  }
  const r = rectanguloDeCatetos(a!, b!);
  const fn = fnDeRoles(ROL_DESDE_A[l1.lado], ROL_DESDE_A[l2.lado]);
  const numRol = fnRatioNumerador(fn);
  const denRol = fnRatioDenominador(fn);
  const letraDe = (rol: Rol): "a" | "b" | "c" => (rol === "opuesto" ? "a" : rol === "adyacente" ? "b" : "c");
  const lados = { a: r.a, b: r.b, c: r.c };
  const nL = letraDe(numRol);
  const dL = letraDe(denRol);
  const valN = lados[nL];
  const valD = lados[dL];
  const razon = valN / valD;
  const resultado = redondear(r.A, 1);
  const inv = fn === "sen" ? arcoSeno(razon) : fn === "cos" ? arcoCoseno(razon) : arcoTangente(razon);
  return {
    modo: "angulo",
    a: r.a,
    b: r.b,
    c: r.c,
    A: r.A,
    dados: [...dados],
    pedido: null,
    fn,
    rolDe: ROL_DESDE_A,
    resultado,
    pasos: [
      { clave: "figura", formulas: [] },
      { clave: "roles", formulas: [] },
      { clave: "razon", formulas: [`${NOMBRE_FN_TEX[fn]}(A)=\\dfrac{\\text{${numRol}}}{\\text{${denRol}}}`] },
      { clave: "plantear", formulas: [`${NOMBRE_FN_TEX[fn]}(A)=\\dfrac{${d(valN)}}{${d(valD)}}`] },
      { clave: "despejar", formulas: [`A=${INVERSA_TEX[fn]}\\left(\\dfrac{${d(valN)}}{${d(valD)}}\\right)`] },
      { clave: "calcular", formulas: [`A\\approx ${d(inv, 1)}^{\\circ}`] },
      { clave: "comprobar", formulas: [`B=90^{\\circ}-${d(inv, 1)}^{\\circ}=${d(90 - redondear(inv, 1), 1)}^{\\circ}`, `${NOMBRE_FN_TEX[fn]}(${d(inv, 1)}^{\\circ})\\approx ${d(valorFn(fn, redondear(inv, 1)), 2)}`] },
    ],
  };
}

function fnRatioNumerador(fn: "sen" | "cos" | "tan"): Rol {
  return RAZON_ROLES[fn][0];
}
function fnRatioDenominador(fn: "sen" | "cos" | "tan"): Rol {
  return RAZON_ROLES[fn][1];
}

// =====================================================================
// 3) Círculo unitario
// =====================================================================
export const VISTA_CIRCULO = { ancho: 320, alto: 300, cx: 160, cy: 150, radio: 105 } as const;

export interface PasoCirculoDatos {
  grados: number;
  normalizado: number;
  cuadrante: 1 | 2 | 3 | 4 | null;
  referencia: number;
  gradosTex: string;
  radianesTex: string;
  gradosPlano: string;
  radianesPlano: string;
  cosTex: string;
  senTex: string;
  tanTex: string;
  cosPlano: string;
  senPlano: string;
  tanPlano: string;
  // Coordenadas del punto en el dibujo (px del viewBox), ya redondeadas.
  punto: { x: number; y: number };
  // Rotación CSS (grados) del radio para llegar al ángulo: la CSS gira en sentido horario, así que es -grados.
  rotacion: number;
  // Arco del ángulo (0 -> θ) y del ángulo de referencia, como atributo `d` de un <path>; null si no corresponde.
  arco: string | null;
  arcoReferencia: string | null;
}

function arcoSvg(cx: number, cy: number, r: number, desde: number, hasta: number): string {
  // Arco antihorario en pantalla desde `desde` hasta `hasta` (grados, con `hasta` > `desde`).
  const p = (g: number) => `${r2(cx + r * Math.cos(aRad(g)))} ${r2(cy - r * Math.sin(aRad(g)))}`;
  const grande = hasta - desde > 180 ? 1 : 0;
  return `M ${p(desde)} A ${r} ${r} 0 ${grande} 0 ${p(hasta)}`;
}

export function datosCirculo(v: Pick<VisualTrigonometriaCirculo, "angulos">): PasoCirculoDatos[] {
  const { cx, cy, radio } = VISTA_CIRCULO;
  return v.angulos.map((grados) => {
    if (!Number.isInteger(grados) || grados % 15 !== 0) throw new Error(`Ángulo ${grados}° no admitido (múltiplos de 15°)`);
    const n = normalizarGrados(grados);
    const s = senExacto(grados);
    const c = cosExacto(grados);
    const t = tanExacto(grados);
    const cuadrante = cuadranteDe(grados);
    const ref = referenciaGrados(grados);
    let arcoReferencia: string | null = null;
    if (cuadrante !== null) {
      const eje = cuadrante === 1 ? 0 : cuadrante === 4 ? 360 : 180;
      arcoReferencia = arcoSvg(cx, cy, 34, Math.min(eje, n), Math.max(eje, n));
    }
    return {
      grados,
      normalizado: n,
      cuadrante,
      referencia: ref,
      gradosTex: `${grados}^{\\circ}`,
      radianesTex: radianesTex(grados),
      gradosPlano: `${grados}°`,
      radianesPlano: radianesPlano(grados),
      cosTex: texE(c),
      senTex: texE(s),
      tanTex: t === null ? "\\text{indefinida}" : texE(t),
      cosPlano: planoE(c),
      senPlano: planoE(s),
      tanPlano: t === null ? "indefinida" : planoE(t),
      punto: { x: r2(cx + radio * Math.cos(aRad(n))), y: r2(cy - radio * Math.sin(aRad(n))) },
      rotacion: -grados,
      arco: n === 0 ? null : arcoSvg(cx, cy, 24, 0, n),
      arcoReferencia,
    };
  });
}

// =====================================================================
// 4) Cuadrantes y signos (ASTC)
// =====================================================================
export interface CuadranteDatos {
  cuadrante: 1 | 2 | 3 | 4;
  grados: number;
  signo: { sen: "+" | "-"; cos: "+" | "-"; tan: "+" | "-" };
  senTex: string;
  cosTex: string;
  tanTex: string;
  // Qué razón(es) es(son) positiva(s) aquí: la letra de "Todas, Seno, Tangente, Coseno".
  positivas: ("sen" | "cos" | "tan" | "todas")[];
  punto: { x: number; y: number };
}

export const VISTA_CUADRANTES = { ancho: 320, alto: 280, cx: 160, cy: 140, radio: 105 } as const;

export function datosCuadrantes(v: Pick<VisualTrigonometriaCuadrantes, "referencia">): CuadranteDatos[] {
  const { cx, cy, radio } = VISTA_CUADRANTES;
  const angulos = [v.referencia, 180 - v.referencia, 180 + v.referencia, 360 - v.referencia];
  const positivas: CuadranteDatos["positivas"][] = [["todas"], ["sen"], ["tan"], ["cos"]];
  return angulos.map((grados, i) => {
    const s = senExacto(grados);
    const c = cosExacto(grados);
    const t = tanExacto(grados)!;
    const signo = (x: Exacto): "+" | "-" => (valorE(x) > 0 ? "+" : "-");
    return {
      cuadrante: (i + 1) as 1 | 2 | 3 | 4,
      grados,
      signo: { sen: signo(s), cos: signo(c), tan: signo(t) },
      senTex: texE(s),
      cosTex: texE(c),
      tanTex: texE(t),
      positivas: positivas[i],
      punto: { x: r2(cx + radio * Math.cos(aRad(grados))), y: r2(cy - radio * Math.sin(aRad(grados))) },
    };
  });
}

// =====================================================================
// 5) Ondas
// =====================================================================
export const VISTA_ONDA = { ancho: 340, alto: 230, izq: 38, der: 12, arriba: 14, abajo: 32 } as const;

export interface TickOnda {
  pos: number; // px
  etiqueta: string;
}

export interface DatosOnda {
  onda: Onda;
  base: Onda | null;
  pasos: PasoOnda[];
  // Curva (uno o varios tramos: la tangente se corta en sus asíntotas), como `d` de <path>.
  curva: string[];
  curvaBase: string[];
  ejeXpx: number; // y del eje x (donde y = 0), o el borde si 0 no está en la vista
  ejeYpx: number; // x del eje y (donde x = 0), o el borde
  ticksX: TickOnda[];
  ticksY: TickOnda[];
  // Marcas de cada paso, en px.
  amplitud: { x: number; yMedio: number; yExtremo: number; valor: string } | null;
  periodo: { x0: number; x1: number; y: number; valor: string } | null;
  desfase: { x: number; y: number; valor: string } | null;
  lineaMedia: { y: number; valor: string } | null;
  puntos: { x: number; y: number }[];
  asintotas: number[]; // x en px
  textoPlano: string;
  // Valores para los textos i18n del componente.
  valores: { amplitud: string; periodo: string; frecuencia: string; desfase: string; medio: string; maximo: string; minimo: string; ecuacion: string; ecuacionPlano: string };
}

function ticksEnPi(x0: Frac, x1: Frac): Frac[] {
  const ancho = aNumero(restaF(x1, x0));
  const paso = ancho <= 2.01 ? frac(1, 2) : ancho <= 4.01 ? frac(1) : frac(2);
  const r: Frac[] = [];
  let k = Math.ceil(aNumero(divF(x0, paso)) - 1e-9);
  for (; ; k++) {
    const x = mulF(paso, frac(k));
    if (aNumero(x) > aNumero(x1) + 1e-9) break;
    r.push(x);
  }
  return r;
}

function ticksEnY(y0: number, y1: number): number[] {
  const ancho = y1 - y0;
  const paso = ancho <= 3 ? 0.5 : ancho <= 8 ? 1 : 2;
  const r: number[] = [];
  for (let y = Math.ceil(y0 / paso) * paso; y <= y1 + 1e-9; y += paso) r.push(Math.round(y * 100) / 100);
  return r;
}

function etiquetaY(y: number): string {
  if (Number.isInteger(y)) return String(y);
  const f = frac(Math.round(y * 2), 2);
  return `${f.n}/${f.d}`;
}

function trazos(o: Onda, x0: number, x1: number, py: (y: number) => number, px: (x: number) => number, yMin: number, yMax: number, muestras: number): string[] {
  const tramos: string[] = [];
  let actual: string[] = [];
  const cerrar = () => {
    if (actual.length > 1) tramos.push(actual.join(" "));
    actual = [];
  };
  for (let i = 0; i <= muestras; i++) {
    const x = x0 + ((x1 - x0) * i) / muestras;
    const y = valorOnda(o, x);
    if (!Number.isFinite(y) || y > yMax + (yMax - yMin) || y < yMin - (yMax - yMin)) {
      cerrar();
      continue;
    }
    actual.push(`${actual.length === 0 ? "M" : "L"} ${r2(px(x))} ${r2(py(y))}`);
  }
  cerrar();
  return tramos;
}

export function datosOnda(v: Pick<VisualTrigonometriaOnda, "onda" | "base" | "rango" | "pasos">, sep: Decimal = ","): DatosOnda {
  const o = ondaDeJson(v.onda);
  const base = v.base ? ondaDeJson(v.base) : null;
  const x0Pi = fracDeJson(v.rango[0], 0);
  const x1Pi = fracDeJson(v.rango[1], 2);
  if (aNumero(x1Pi) <= aNumero(x0Pi)) throw new Error("El rango del eje x debe ser creciente");
  const pasos = v.pasos ?? ["curva"];
  const { ancho, alto, izq, der, arriba, abajo } = VISTA_ONDA;
  const x0 = aNumero(x0Pi) * Math.PI;
  const x1 = aNumero(x1Pi) * Math.PI;

  // Rango vertical: las curvas (y la de referencia) con un margen; la tangente se recorta.
  const extremos = (w: Onda): [number, number] => {
    const a = aNumero(amplitud(w));
    const d = aNumero(lineaMedia(w));
    return w.fn === "tan" ? [d - 3.5 * a, d + 3.5 * a] : [d - a, d + a];
  };
  const [minO, maxO] = extremos(o);
  const [minB, maxB] = base ? extremos(base) : [minO, maxO];
  const yMin = Math.floor(Math.min(minO, minB, 0) - 0.5);
  const yMax = Math.ceil(Math.max(maxO, maxB, 0) + 0.5);
  const px = (x: number): number => izq + ((x - x0) / (x1 - x0)) * (ancho - izq - der);
  const py = (y: number): number => arriba + ((yMax - y) / (yMax - yMin)) * (alto - arriba - abajo);
  const pxPi = (f: Frac): number => px(aNumero(f) * Math.PI);

  const ejeXpx = r2(py(Math.min(Math.max(0, yMin), yMax)));
  const ejeYpx = r2(px(Math.min(Math.max(0, x0), x1)));

  const ticksX: TickOnda[] = ticksEnPi(x0Pi, x1Pi).map((f) => ({ pos: r2(pxPi(f)), etiqueta: f.n === 0 ? "0" : multiploPiPlano(f) }));
  const ticksY: TickOnda[] = ticksEnY(yMin, yMax)
    .filter((y) => y !== 0)
    .map((y) => ({ pos: r2(py(y)), etiqueta: etiquetaY(y) }));

  const muestras = 240;
  const curva = trazos(o, x0, x1, py, px, yMin, yMax, muestras);
  const curvaBase = base ? trazos(base, x0, x1, py, px, yMin, yMax, muestras) : [];

  const fmtF = (f: Frac): string => (f.d === 1 ? String(f.n) : sep === "," ? `${f.n}/${f.d}` : `${f.n}/${f.d}`);
  const P = periodoPi(o);
  const a = amplitud(o);
  const d = lineaMedia(o);
  const claves = o.fn === "tan" ? [] : puntosClave(o);

  // Amplitud: junto al primer máximo (o mínimo) dentro de la vista.
  let marcaAmplitud: DatosOnda["amplitud"] = null;
  if (o.fn !== "tan") {
    const maximos = claves.filter((p) => p.tipo === "maximo");
    const candidato = maximos.find((p) => aNumero(p.xPi) >= aNumero(x0Pi) - 1e-9 && aNumero(p.xPi) <= aNumero(x1Pi) + 1e-9) ?? maximos[0];
    if (candidato) {
      marcaAmplitud = { x: r2(pxPi(candidato.xPi)), yMedio: r2(py(aNumero(d))), yExtremo: r2(py(aNumero(sumaF(d, a)))), valor: fmtF(a) };
    }
  }
  // Periodo: un ciclo desde c (o desde el primer punto de la vista) hasta c + P.
  let inicioPi = o.cPi;
  if (aNumero(inicioPi) < aNumero(x0Pi) - 1e-9 || aNumero(sumaF(inicioPi, P)) > aNumero(x1Pi) + 1e-9) {
    // Se corre al ciclo entero más cercano que entre en la vista (si cabe).
    const k = Math.ceil(aNumero(divF(restaF(x0Pi, o.cPi), P)) - 1e-9);
    inicioPi = sumaF(o.cPi, mulF(P, frac(k)));
  }
  const marcaPeriodo: DatosOnda["periodo"] = {
    x0: r2(pxPi(inicioPi)),
    x1: r2(pxPi(sumaF(inicioPi, P))),
    y: r2(py(aNumero(o.fn === "tan" ? d : sumaF(d, a)) + (o.fn === "tan" ? 0 : 0.3))),
    valor: multiploPiPlano(P),
  };
  const marcaDesfase: DatosOnda["desfase"] = o.cPi.n === 0 ? null : { x: r2(pxPi(o.cPi)), y: r2(py(aNumero(d))), valor: multiploPiPlano(o.cPi) };
  const marcaMedia: DatosOnda["lineaMedia"] = { y: r2(py(aNumero(d))), valor: fmtF(d) };
  const puntos = claves.map((p) => ({ x: r2(pxPi(p.xPi)), y: r2(py(aNumero(p.y))) })).filter((p) => p.x >= izq - 1 && p.x <= ancho - der + 1);
  const asintotas = o.fn === "tan" ? asintotasTan(o, x0Pi, x1Pi).map((f) => r2(pxPi(f))) : [];

  const texto = [
    `${ecuacionPlano(o)}.`,
    o.fn === "tan" ? `Periodo ${multiploPiPlano(P)}, sin amplitud ni máximo (crece entre asíntotas verticales).` : `Amplitud ${fmtF(a)}, periodo ${multiploPiPlano(P)}, línea media y = ${fmtF(d)}, máximo ${fmtF(sumaF(d, a))}, mínimo ${fmtF(restaF(d, a))}.`,
    o.cPi.n !== 0 ? `Desfase ${multiploPiPlano(o.cPi)}.` : "",
    `Eje x de ${multiploPiPlano(x0Pi)} a ${multiploPiPlano(x1Pi)}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    onda: o,
    base,
    pasos,
    curva,
    curvaBase,
    ejeXpx,
    ejeYpx,
    ticksX,
    ticksY,
    amplitud: marcaAmplitud,
    periodo: marcaPeriodo,
    desfase: marcaDesfase,
    lineaMedia: marcaMedia,
    puntos,
    asintotas,
    textoPlano: texto,
    valores: {
      amplitud: fmtF(a),
      periodo: multiploPiPlano(P),
      frecuencia: `1/(${multiploPiPlano(P)})`,
      desfase: multiploPiPlano(o.cPi),
      medio: fmtF(d),
      maximo: fmtF(sumaF(d, a)),
      minimo: fmtF(restaF(d, a)),
      ecuacion: ecuacionTex(o),
      ecuacionPlano: ecuacionPlano(o),
    },
  };
}

// =====================================================================
// 7) Ecuación trigonométrica básica en [0, 2π)
// =====================================================================
export const VISTA_ECUACION = { ancho: 340, alto: 150, izq: 30, der: 12, arriba: 10, abajo: 26 } as const;
export const VISTA_ECUACION_CIRCULO = { ancho: 340, alto: 240, cx: 170, cy: 120, radio: 90 } as const;

export interface DatosEcuacion {
  fn: "sen" | "cos" | "tan";
  gradosValor: number;
  valorTex: string;
  valorPlano: string;
  valorNumerico: number;
  // Soluciones en [0°, 360°), en orden.
  soluciones: number[];
  solucionesPiTex: string[];
  solucionesPiPlano: string[];
  // Gráfica
  curva: string[];
  ejeX: number;
  ticksX: TickOnda[];
  rectaY: number; // px
  cortes: PuntoPx[];
  // Círculo: puntos y la recta auxiliar (en px)
  puntosCirculo: PuntoPx[];
  rectaCirculo: { x1: number; y1: number; x2: number; y2: number };
  textoPlano: string;
}

export function solucionesEcuacion(fn: "sen" | "cos" | "tan", gradosValor: number): number[] {
  const objetivo = fn === "sen" ? senExacto(gradosValor) : fn === "cos" ? cosExacto(gradosValor) : tanExacto(gradosValor);
  if (objetivo === null) throw new Error(`tan ${gradosValor}° no está definida`);
  const r: number[] = [];
  for (let g = 0; g < 360; g += 15) {
    const v = fn === "sen" ? senExacto(g) : fn === "cos" ? cosExacto(g) : tanExacto(g);
    if (v !== null && igualE(v, objetivo)) r.push(g);
  }
  return r;
}

export function datosEcuacion(v: Pick<VisualTrigonometriaEcuacion, "fn" | "gradosValor">): DatosEcuacion {
  const valor = v.fn === "sen" ? senExacto(v.gradosValor) : v.fn === "cos" ? cosExacto(v.gradosValor) : tanExacto(v.gradosValor);
  if (valor === null) throw new Error("La tangente de ese ángulo no está definida");
  const soluciones = solucionesEcuacion(v.fn, v.gradosValor);
  const k = valorE(valor);
  const { ancho, alto, izq, der, arriba, abajo } = VISTA_ECUACION;
  const yMax = v.fn === "tan" ? 3 : 1.25;
  const yMin = -yMax;
  const px = (x: number): number => izq + (x / (2 * Math.PI)) * (ancho - izq - der);
  const py = (y: number): number => arriba + ((yMax - y) / (yMax - yMin)) * (alto - arriba - abajo);
  const o = onda(v.fn);
  const curva = trazos(o, 0, 2 * Math.PI, py, px, yMin, yMax, 240);
  const ticksX = [0, 1, 2, 3, 4].map((i) => ({ pos: r2(px((i * Math.PI) / 2)), etiqueta: i === 0 ? "0" : multiploPiPlano(frac(i, 2)) }));
  const cortes = soluciones.map((g) => ({ x: r2(px(aRad(g))), y: r2(py(k)) }));
  const { cx, cy, radio } = VISTA_ECUACION_CIRCULO;
  const enCirculo = (g: number): PuntoPx => ({ x: r2(cx + radio * Math.cos(aRad(g))), y: r2(cy - radio * Math.sin(aRad(g))) });
  const puntosCirculo = soluciones.map(enCirculo);
  const kk = Math.max(-1, Math.min(1, k));
  const rectaCirculo =
    v.fn === "sen"
      ? { x1: r2(cx - radio * 1.1), y1: r2(cy - radio * kk), x2: r2(cx + radio * 1.1), y2: r2(cy - radio * kk) }
      : v.fn === "cos"
        ? { x1: r2(cx + radio * kk), y1: r2(cy - radio * 1.1), x2: r2(cx + radio * kk), y2: r2(cy + radio * 1.1) }
        : { x1: r2(cx - radio * 1.1 * Math.cos(aRad(soluciones[0]))), y1: r2(cy + radio * 1.1 * Math.sin(aRad(soluciones[0]))), x2: r2(cx + radio * 1.1 * Math.cos(aRad(soluciones[0]))), y2: r2(cy - radio * 1.1 * Math.sin(aRad(soluciones[0]))) };
  const solPlano = soluciones.map(radianesPlano);
  return {
    fn: v.fn,
    gradosValor: v.gradosValor,
    valorTex: texE(valor),
    valorPlano: planoE(valor),
    valorNumerico: k,
    soluciones,
    solucionesPiTex: soluciones.map(radianesTex),
    solucionesPiPlano: solPlano,
    curva,
    ejeX: r2(py(0)),
    ticksX,
    rectaY: r2(py(Math.max(yMin, Math.min(yMax, k)))),
    cortes,
    puntosCirculo,
    rectaCirculo,
    textoPlano: `Ecuación ${v.fn} x = ${planoE(valor)} en [0, 2π): ${soluciones.length === 1 ? "una solución" : `${soluciones.length} soluciones`}: x = ${solPlano.join(" y x = ")}.`,
  };
}

// =====================================================================
// 8) Identidad pitagórica sobre el círculo
// =====================================================================
export const VISTA_IDENTIDAD = { ancho: 320, alto: 250, cx: 110, cy: 130, radio: 100 } as const;

export interface DatosIdentidad {
  angulo: number;
  senTex: string;
  cosTex: string;
  // Vértices del triángulo inscripto en px: origen, pie sobre el eje x, punto del círculo.
  origen: PuntoPx;
  pie: PuntoPx;
  punto: PuntoPx;
  arco: string;
  // Fórmulas con números, en orden.
  pitagorica: { general: string; conNumeros: string; suma: string };
  tangente: { general: string; conNumeros: string } | null;
  cotangente: { general: string; conNumeros: string } | null;
  // Verificación exacta: sen² + cos² = 1 (y las derivadas) con el anillo Q(√2, √3).
  cumple: boolean;
  textoPlano: string;
}

export function datosIdentidad(v: Pick<VisualTrigonometriaIdentidad, "angulo" | "forma">): DatosIdentidad {
  const g = v.angulo;
  if (!(g > 0 && g < 90)) throw new Error("El ángulo debe ser agudo");
  const s = senExacto(g);
  const c = cosExacto(g);
  const s2 = mulE(s, s);
  const c2 = mulE(c, c);
  const suma = sumaE(s2, c2);
  const { cx, cy, radio } = VISTA_IDENTIDAD;
  const punto = { x: r2(cx + radio * Math.cos(aRad(g))), y: r2(cy - radio * Math.sin(aRad(g))) };
  const paren = (x: Exacto): string => `\\left(${texE(x)}\\right)^{2}`;
  const t = tanExacto(g)!;
  const ct = cotExacto(g)!;
  const se = secExacto(g)!;
  const cs = cosecExacto(g)!;
  const derivadas = v.forma === "derivadas";
  const cumple =
    igualE(suma, EXACTO_UNO) &&
    igualE(sumaE(EXACTO_UNO, mulE(t, t)), mulE(se, se)) &&
    igualE(sumaE(EXACTO_UNO, mulE(ct, ct)), mulE(cs, cs));
  return {
    angulo: g,
    senTex: texE(s),
    cosTex: texE(c),
    origen: { x: cx, y: cy },
    pie: { x: punto.x, y: cy },
    punto,
    arco: arcoSvg(cx, cy, 26, 0, g),
    pitagorica: {
      general: "\\operatorname{sen}^{2}(\\theta)+\\cos^{2}(\\theta)=1",
      conNumeros: `${paren(s)}+${paren(c)}=${texE(s2)}+${texE(c2)}`,
      suma: texE(suma),
    },
    tangente: derivadas
      ? { general: "1+\\tan^{2}(\\theta)=\\sec^{2}(\\theta)", conNumeros: `1+${paren(t)}=${texE(sumaE(EXACTO_UNO, mulE(t, t)))}=${paren(se)}` }
      : null,
    cotangente: derivadas
      ? { general: "1+\\cot^{2}(\\theta)=\\operatorname{cosec}^{2}(\\theta)", conNumeros: `1+${paren(ct)}=${texE(sumaE(EXACTO_UNO, mulE(ct, ct)))}=${paren(cs)}` }
      : null,
    cumple,
    textoPlano: `Círculo de radio 1 y un triángulo rectángulo con la hipotenusa 1 y el ángulo θ = ${g}°: el cateto horizontal es cos θ = ${planoE(c)} y el vertical sen θ = ${planoE(s)}. Por Pitágoras, sen² θ + cos² θ = ${planoE(s2)} + ${planoE(c2)} = ${planoE(suma)}.${derivadas ? " Al dividir entre cos² θ se obtiene 1 + tan² θ = sec² θ, y al dividir entre sen² θ, 1 + cot² θ = cosec² θ." : ""}`,
  };
}

// =====================================================================
// Textos alternativos (lectores de pantalla) de los visuales sin datos propios
// =====================================================================
export function textoTriangulo(v: Pick<VisualTrigonometriaTriangulo, "catetos" | "vertice" | "pasos">, sep: Decimal = ","): string {
  const d = datosTriangulo(v);
  const f = (x: number) => dec(x, 2, sep);
  const partes = [
    `Triángulo rectángulo con los catetos ${f(d.a)} y ${f(d.b)} y la hipotenusa ${f(d.c)}. Desde el ángulo ${d.vertice}: el opuesto mide ${f(d.rolDe.a === "opuesto" ? d.a : d.b)}, el adyacente ${f(d.rolDe.a === "adyacente" ? d.a : d.b)} y la hipotenusa ${f(d.c)}.`,
  ];
  for (const p of d.pasos) {
    if (!p.razon) continue;
    partes.push(`${p.razon.fn}(${d.vertice}) = ${p.razon.num} / ${p.razon.den} = ${f(p.razon.numValor)} / ${f(p.razon.denValor)} = ${f(p.razon.valor)}.`);
  }
  return partes.join(" ");
}

export function textoResolver(v: VisualTrigonometriaResolver, sep: Decimal = ","): string {
  const d = datosResolver(v, sep);
  if (d.modo === "lado" && v.modo === "lado") {
    return `Triángulo rectángulo con el ángulo A = ${v.angulo}° y ${v.dado} = ${dec(v.valor, 2, sep)}; se pide ${v.pedido}. Se usa ${d.fn}(A) y resulta ${v.pedido} ≈ ${dec(d.resultado, 2, sep)}.`;
  }
  return `Triángulo rectángulo con dos lados conocidos; se pide el ángulo A. Se usa ${d.fn}(A) y la función inversa: A ≈ ${dec(d.resultado, 1, sep)}°.`;
}

export function textoCirculo(v: Pick<VisualTrigonometriaCirculo, "angulos" | "valores">): string {
  return `Círculo unitario. ${datosCirculo(v)
    .map((p) =>
      v.valores === false
        ? `Ángulo ${p.gradosPlano} (${p.radianesPlano} rad), ${p.cuadrante === null ? "sobre un eje" : `en el cuadrante ${p.cuadrante}`}.`
        : `Ángulo ${p.gradosPlano} (${p.radianesPlano} rad): cos = ${p.cosPlano}, sen = ${p.senPlano}, tan = ${p.tanPlano}.`
    )
    .join(" ")}`;
}

export function textoCuadrantes(v: Pick<VisualTrigonometriaCuadrantes, "referencia">): string {
  const nombre = { todas: "todas las razones", sen: "solo el seno", tan: "solo la tangente", cos: "solo el coseno" } as const;
  return `Signos por cuadrante con ángulo de referencia ${v.referencia}°. ${datosCuadrantes(v)
    .map((q) => `Cuadrante ${q.cuadrante} (${q.grados}°): seno ${q.signo.sen === "+" ? "positivo" : "negativo"}, coseno ${q.signo.cos === "+" ? "positivo" : "negativo"}, tangente ${q.signo.tan === "+" ? "positiva" : "negativa"}: son positivas ${nombre[q.positivas[0]]}.`)
    .join(" ")} Regla: Todos, Seno, Tangente, Coseno (ASTC).`;
}

export function textoOnda(v: Pick<VisualTrigonometriaOnda, "onda" | "base" | "rango" | "pasos">): string {
  return datosOnda(v).textoPlano;
}
