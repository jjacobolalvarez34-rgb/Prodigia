// Modo "razones" de Trigonometría: triángulo rectángulo (ángulo recto en C, a
// opuesto a A, b opuesto a B, c hipotenusa). Los tipos, sus niveles y sus
// pesos están en trigonometriaEscala.ts; acá solo está CÓMO se arma cada tipo
// (`dif` = cuántos niveles lleva activo, para endurecer sus parámetros). Todo
// dato numérico sale de src/lib/trigonometria/triangulos.ts.
//
// Las respuestas son NUMÉRICAS (input): sen/cos/tan/cosec/sec/cot a 2
// decimales, lados a 2 decimales y ángulos en grados a 1 decimal. El dibujo
// solo muestra los datos del enunciado: las incógnitas van como "?" y los
// ángulos que no se dan quedan como letra de vértice (nunca se filtra la
// respuesta ni se ofrece un ángulo redondeado que lleve a un resultado distinto).

import { OPERADOR_TEX } from "@/lib/trigonometria/exactos";
import {
  aRad,
  arcoCoseno,
  arcoSeno,
  arcoTangente,
  rectanguloDeAnguloYLado,
  rectanguloDeCatetos,
  redondear,
  type Rectangulo,
} from "@/lib/trigonometria/triangulos";
import { azar, elegir, m, numTex, numTxt, randomInt, tolerancia } from "./trigonometriaBase";
import type { ProblemaTrigonometriaNumero, TrianguloDiagrama } from "./trigonometriaTipos";

type Lado = "a" | "b" | "c";
type Vertice = "A" | "B";
type FnRazon = "sen" | "cos" | "tan";
type FnRec = "cosec" | "sec" | "cot";

const LADOS: Lado[] = ["a", "b", "c"];
const CLAVE_LADO: Record<Lado, "ladoA" | "ladoB" | "ladoC"> = { a: "ladoA", b: "ladoB", c: "ladoC" };

export const TERNAS_PITAGORICAS: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
];

const tan = (g: number): number => Math.tan(aRad(g));
const sen = (g: number): number => Math.sin(aRad(g));
const cot = (g: number): number => 1 / tan(g);

function diagrama(r: Rectangulo, o: { ocultar?: Lado[]; omitir?: Lado[]; ocultarAngulos?: Vertice[] } = {}): TrianguloDiagrama {
  return {
    ladoA: r.a,
    ladoB: r.b,
    ladoC: r.c,
    anguloA: r.A,
    anguloB: r.B,
    anguloC: 90,
    marcarRectoEn: "C",
    ocultarLados: (o.ocultar ?? []).map((l) => CLAVE_LADO[l]),
    omitirLados: (o.omitir ?? []).map((l) => CLAVE_LADO[l]),
    ocultarAngulos: o.ocultarAngulos ?? [],
  };
}

const otroVertice = (v: Vertice): Vertice => (v === "A" ? "B" : "A");
const opuestoDe = (v: Vertice): Lado => (v === "A" ? "a" : "b");
const adyacenteDe = (v: Vertice): Lado => (v === "A" ? "b" : "a");

function razon(fn: FnRazon, v: Vertice, r: Rectangulo): number {
  const op = v === "A" ? r.a : r.b;
  const ady = v === "A" ? r.b : r.a;
  return fn === "sen" ? op / r.c : fn === "cos" ? ady / r.c : op / ady;
}

const nombreFn = (fn: FnRazon | FnRec, arg: string): string => m(`${OPERADOR_TEX[fn]}(${arg})`);

function describirLado(l: Lado): string {
  if (l === "a") return `el cateto ${m("a")} (opuesto a ${m("A")})`;
  if (l === "b") return `el cateto ${m("b")} (opuesto a ${m("B")})`;
  return `la hipotenusa ${m("c")}`;
}

function valorLado(r: Rectangulo, l: Lado): number {
  return l === "a" ? r.a : l === "b" ? r.b : r.c;
}

// "un árbol" -> "el árbol", "una torre" -> "la torre".
const definido = (objeto: string): string => objeto.replace(/^una /, "la ").replace(/^un /, "el ");

function numero(
  enunciado: string,
  x: number,
  opciones: { tolRel?: number; tolMin?: number; triangulo?: TrianguloDiagrama } = {}
): ProblemaTrigonometriaNumero {
  const respuesta = redondear(x, 2);
  return {
    modo: "razones",
    entrada: "numero",
    enunciado,
    respuesta,
    tolerancia: tolerancia(respuesta, opciones.tolRel ?? 0.004, opciones.tolMin ?? 0.01),
    triangulo: opciones.triangulo,
  };
}

function anguloNumero(enunciado: string, g: number, triangulo?: TrianguloDiagrama): ProblemaTrigonometriaNumero {
  return { modo: "razones", entrada: "numero", enunciado, respuesta: redondear(g, 1), tolerancia: 0.1, triangulo };
}

const PIDE_GRADOS = "Da el ángulo en grados, redondeado a 1 decimal.";

// ---------- razon-ternas: sen/cos/tan de A o de B con los tres lados ----------
export function generarRazonTernas(dif: number): ProblemaTrigonometriaNumero {
  const banco = dif === 0 ? TERNAS_PITAGORICAS.slice(0, 2) : TERNAS_PITAGORICAS;
  const [x, y, z] = elegir(banco);
  const factor = dif >= 2 ? randomInt(1, 3) : 1;
  const [a, b] = azar() < 0.5 ? [x * factor, y * factor] : [y * factor, x * factor];
  const c = z * factor;
  const r = rectanguloDeCatetos(a, b);
  const vertice: Vertice = dif === 0 ? "A" : elegir<Vertice>(["A", "B"]);
  const fn: FnRazon = dif === 0 ? elegir<FnRazon>(["sen", "cos"]) : elegir<FnRazon>(["sen", "cos", "tan"]);
  return {
    modo: "razones",
    entrada: "numero",
    enunciado: `Triángulo rectángulo con el ángulo recto en ${m("C")} y lados ${m(`a=${a}`)}, ${m(`b=${b}`)} y ${m(`c=${c}`)} (cada lado lleva la letra de su ángulo opuesto). ¿Cuánto vale ${nombreFn(fn, vertice)}? Redondea a 2 decimales.`,
    respuesta: redondear(razon(fn, vertice, r), 2),
    tolerancia: 0.01,
    triangulo: diagrama(r, { ocultarAngulos: ["A", "B"] }),
  };
}

// ---------- lado-notable y lado-calculadora: hallar un lado con un ángulo y un lado ----------
interface EspecLado {
  // Qué lado se da: la hipotenusa, un cateto o cualquiera.
  dado: "hipotenusa" | "cateto" | "cualquiera";
  verticeAleatorio: boolean;
  // Medida del lado dado.
  medida: () => number;
}

const pares = (): number => 2 * randomInt(2, 12);
const enteros = (): number => randomInt(3, 20);
const impares = (): number => 2 * randomInt(1, 12) + 1;
const conMedios = (): number => randomInt(4, 40) + (azar() < 0.5 ? 0.5 : 0);

const ESPEC_NOTABLE: EspecLado[] = [
  { dado: "hipotenusa", verticeAleatorio: false, medida: pares },
  { dado: "cualquiera", verticeAleatorio: false, medida: enteros },
  { dado: "cateto", verticeAleatorio: false, medida: impares },
  { dado: "cateto", verticeAleatorio: true, medida: conMedios },
];

const ESPEC_CALCULADORA: EspecLado[] = [
  { dado: "hipotenusa", verticeAleatorio: false, medida: enteros },
  { dado: "cateto", verticeAleatorio: false, medida: enteros },
  { dado: "cateto", verticeAleatorio: true, medida: enteros },
  { dado: "cualquiera", verticeAleatorio: true, medida: conMedios },
];

function armarLado(espec: EspecLado, angulos: number[], ayuda: string): ProblemaTrigonometriaNumero {
  const verticeDado: Vertice = espec.verticeAleatorio ? elegir<Vertice>(["A", "B"]) : "A";
  const angulo = elegir(angulos);
  const A = verticeDado === "A" ? angulo : 90 - angulo;
  const dado: Lado = espec.dado === "hipotenusa" ? "c" : espec.dado === "cateto" ? elegir<Lado>(["a", "b"]) : elegir(LADOS);
  const pedido = elegir(LADOS.filter((l) => l !== dado));
  const tercero = LADOS.find((l) => l !== dado && l !== pedido)!;
  const medida = espec.medida();
  const r = rectanguloDeAnguloYLado(A, dado, medida);
  return numero(
    `En el triángulo rectángulo de la figura (ángulo recto en ${m("C")}), el ángulo ${m(verticeDado)} mide ${m(`${angulo}^{\\circ}`)} y ${describirLado(dado)} mide ${numTxt(medida)}. ¿Cuánto mide ${describirLado(pedido)}? Redondea a 2 decimales.${ayuda}`,
    valorLado(r, pedido),
    { triangulo: diagrama(r, { ocultar: [pedido], omitir: [tercero], ocultarAngulos: [otroVertice(verticeDado)] }) }
  );
}

export function generarLadoNotable(dif: number): ProblemaTrigonometriaNumero {
  return armarLado(ESPEC_NOTABLE[Math.min(dif, ESPEC_NOTABLE.length - 1)], dif === 0 ? [30, 60] : [30, 45, 60], "");
}

const ANGULOS_CALCULADORA = [12, 15, 18, 20, 22, 25, 28, 32, 35, 38, 40, 42, 48, 50, 52, 55, 58, 62, 65, 68, 70, 72, 75, 78];

export function generarLadoCalculadora(dif: number): ProblemaTrigonometriaNumero {
  return armarLado(ESPEC_CALCULADORA[Math.min(dif, ESPEC_CALCULADORA.length - 1)], ANGULOS_CALCULADORA, dif === 0 ? " Usa la calculadora en modo grados." : "");
}

// ---------- angulo-inverso: hallar un ángulo con arcsen, arccos o arctan ----------
function contextoAngulo(): ProblemaTrigonometriaNumero {
  const caso = randomInt(0, 2);
  if (caso === 0) {
    const largo = elegir([4, 5, 6, 8, 10, 12]);
    const alto = elegir([0.6, 0.8, 1, 1.2, 1.5, 2]);
    return anguloNumero(`Una rampa de ${numTxt(largo)} m de largo llega a ${numTxt(alto)} m de altura. ¿Qué ángulo forma con el suelo? ${PIDE_GRADOS}`, arcoSeno(alto / largo));
  }
  if (caso === 1) {
    const largo = elegir([3, 4, 5, 6, 7]);
    const base = elegir([0.8, 1, 1.2, 1.5, 2]);
    return anguloNumero(`Una escalera de ${numTxt(largo)} m se apoya en una pared con el pie a ${numTxt(base)} m de la pared. ¿Qué ángulo forma la escalera con el suelo? ${PIDE_GRADOS}`, arcoCoseno(base / largo));
  }
  const poste = elegir([4, 5, 6, 8, 10]);
  const sombra = elegir([3, 4, 5, 6, 7, 9]);
  return anguloNumero(`Un poste vertical de ${numTxt(poste)} m proyecta una sombra de ${numTxt(sombra)} m sobre el suelo horizontal. ¿Qué ángulo forman los rayos del sol con el suelo? ${PIDE_GRADOS}`, arcoTangente(poste / sombra));
}

export function generarAnguloInverso(dif: number): ProblemaTrigonometriaNumero {
  if (dif >= 3) return contextoAngulo();
  const fn = elegir<FnRazon>(["sen", "cos", "tan"]);
  const vertice: Vertice = dif >= 2 ? elegir<Vertice>(["A", "B"]) : "A";
  let r: Rectangulo;
  let dados: Lado[];
  if (fn === "tan") {
    let a: number;
    let b: number;
    if (dif === 0) {
      const [x, y] = elegir(TERNAS_PITAGORICAS);
      [a, b] = azar() < 0.5 ? [x, y] : [y, x];
    } else {
      a = randomInt(3, 15);
      b = randomInt(3, 15);
      while (a === b) b = randomInt(3, 15);
    }
    r = rectanguloDeCatetos(a, b);
    dados = ["a", "b"];
  } else {
    // Se da un cateto (el opuesto al ángulo pedido para el seno, el adyacente para el coseno) y la hipotenusa.
    const letraCateto = fn === "sen" ? opuestoDe(vertice) : adyacenteDe(vertice);
    let cateto: number;
    let hipotenusa: number;
    if (dif === 0) {
      const [x, y, z] = elegir(TERNAS_PITAGORICAS);
      hipotenusa = z;
      cateto = azar() < 0.5 ? x : y;
    } else {
      hipotenusa = randomInt(6, 20);
      cateto = randomInt(2, hipotenusa - 1);
    }
    const otro = Math.sqrt(hipotenusa * hipotenusa - cateto * cateto);
    r = letraCateto === "a" ? rectanguloDeCatetos(cateto, otro) : rectanguloDeCatetos(otro, cateto);
    dados = [letraCateto, "c"];
  }
  const angulo = vertice === "A" ? r.A : r.B;
  const omitir = LADOS.filter((l) => !dados.includes(l));
  const dadoTxt = dados.map((l) => m(`${l}=${numTex(valorLado(r, l))}`)).join(" y ");
  return anguloNumero(
    `En el triángulo rectángulo de la figura (ángulo recto en ${m("C")}) se conocen ${dadoTxt} (cada lado lleva la letra de su ángulo opuesto). ¿Cuánto mide el ángulo ${m(vertice)}? ${PIDE_GRADOS}`,
    angulo,
    diagrama(r, { omitir, ocultarAngulos: ["A", "B"] })
  );
}

// ---------- reciprocas: cosecante, secante y cotangente ----------
const RECIPROCA_DE: Record<FnRec, FnRazon> = { cosec: "sen", sec: "cos", cot: "tan" };

const reciproca = (fn: FnRec, v: Vertice, r: Rectangulo): number => 1 / razon(RECIPROCA_DE[fn], v, r);

export function generarReciprocas(dif: number): ProblemaTrigonometriaNumero {
  const fn = elegir<FnRec>(["cosec", "sec", "cot"]);
  if (dif <= 1) {
    const [x, y, z] = elegir(TERNAS_PITAGORICAS.slice(0, 5));
    const [a, b] = azar() < 0.5 ? [x, y] : [y, x];
    const r = rectanguloDeCatetos(a, b);
    const vertice: Vertice = dif === 0 ? "A" : elegir<Vertice>(["A", "B"]);
    return numero(
      `Triángulo rectángulo con el ángulo recto en ${m("C")} y lados ${m(`a=${a}`)}, ${m(`b=${b}`)} y ${m(`c=${z}`)} (cada lado lleva la letra de su ángulo opuesto). ¿Cuánto vale ${nombreFn(fn, vertice)}? Redondea a 2 decimales.`,
      reciproca(fn, vertice, r),
      { tolRel: 0, tolMin: 0.01, triangulo: diagrama(r, { ocultarAngulos: ["A", "B"] }) }
    );
  }
  if (dif === 2) {
    const base = RECIPROCA_DE[fn];
    const valores = base === "tan" ? [0.25, 0.4, 0.5, 1.25, 2, 4, 5] : [0.2, 0.25, 0.4, 0.5, 0.8];
    const valor = elegir(valores);
    return numero(
      `Si ${m(`${OPERADOR_TEX[base]}(\\theta)=${numTex(valor)}`)}, ¿cuánto vale ${nombreFn(fn, "\\theta")}? Redondea a 2 decimales.`,
      1 / valor,
      { tolRel: 0, tolMin: 0.01 }
    );
  }
  if (dif === 3) {
    const g = elegir(ANGULOS_CALCULADORA);
    const base = RECIPROCA_DE[fn];
    const x = 1 / (base === "sen" ? sen(g) : base === "cos" ? Math.cos(aRad(g)) : tan(g));
    return numero(
      `La calculadora no tiene teclas de cosecante, secante ni cotangente. Calcula ${nombreFn(fn, `${g}^{\\circ}`)} con la calculadora en modo grados. Redondea a 2 decimales.`,
      x,
      { tolRel: 0.002, tolMin: 0.01 }
    );
  }
  // dif >= 4: dada una recíproca como fracción (de una terna), pedir otra razón del mismo ángulo.
  const [x, y, z] = elegir(TERNAS_PITAGORICAS.slice(0, 5));
  const [a, b] = azar() < 0.5 ? [x, y] : [y, x];
  const r = rectanguloDeCatetos(a, b);
  const dadaFn = elegir<FnRec>(["cosec", "sec", "cot"]);
  const [num, den] = dadaFn === "cosec" ? [z, a] : dadaFn === "sec" ? [z, b] : [b, a];
  const pedida = elegir<FnRazon>((["sen", "cos", "tan"] as FnRazon[]).filter((f) => f !== RECIPROCA_DE[dadaFn]));
  return numero(
    `En un triángulo rectángulo, ${m(`${OPERADOR_TEX[dadaFn]}(A)=\\frac{${num}}{${den}}`)}. ¿Cuánto vale ${nombreFn(pedida, "A")}? Redondea a 2 decimales.`,
    razon(pedida, "A", r),
    { tolRel: 0, tolMin: 0.01 }
  );
}

// ---------- elevacion / depresion / dos-pasos: problemas con contexto ----------
const OBJETOS_ELEVACION: { objeto: string; cima: string }[] = [
  { objeto: "un árbol", cima: "la copa" },
  { objeto: "un edificio", cima: "la azotea" },
  { objeto: "una torre", cima: "la punta" },
  { objeto: "un poste", cima: "la parte más alta" },
  { objeto: "un asta de bandera", cima: "la punta" },
];

const ANGULOS_ELEVACION = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70];

export function generarElevacion(dif: number): ProblemaTrigonometriaNumero {
  const variantes = ["altura"];
  if (dif >= 1) variantes.push("escalera", "distancia");
  if (dif >= 2) variantes.push("angulo");
  if (dif >= 3) variantes.push("cometa", "sombra");
  const v = elegir(variantes);
  const { objeto, cima } = elegir(OBJETOS_ELEVACION);
  const theta = elegir(ANGULOS_ELEVACION);
  const g = m(`${theta}^{\\circ}`);
  if (v === "altura") {
    const d = 5 * randomInt(2, 16);
    const r = rectanguloDeAnguloYLado(theta, "b", d);
    return numero(
      `Un observador está a ${d} m de la base de ${objeto} y mira ${cima} con un ángulo de elevación de ${g}. ¿Qué altura tiene ${definido(objeto)}? Ignora la estatura del observador y redondea a 2 decimales.`,
      d * tan(theta),
      { triangulo: diagrama(r, { ocultar: ["a"], omitir: ["c"], ocultarAngulos: ["B"] }) }
    );
  }
  if (v === "escalera") {
    const largo = randomInt(3, 12);
    const r = rectanguloDeAnguloYLado(theta, "c", largo);
    return numero(
      `Una escalera de ${largo} m se apoya en una pared vertical y forma un ángulo de ${g} con el suelo horizontal. ¿A qué altura de la pared llega? Redondea a 2 decimales.`,
      largo * sen(theta),
      { triangulo: diagrama(r, { ocultar: ["a"], omitir: ["b"], ocultarAngulos: ["B"] }) }
    );
  }
  if (v === "distancia") {
    const h = randomInt(6, 60);
    const r = rectanguloDeAnguloYLado(theta, "a", h);
    return numero(
      `${cima[0].toUpperCase()}${cima.slice(1)} de ${objeto} de ${h} m de altura se ve con un ángulo de elevación de ${g}. ¿A qué distancia horizontal de su base está el observador? Ignora la estatura del observador y redondea a 2 decimales.`,
      h / tan(theta),
      { triangulo: diagrama(r, { ocultar: ["b"], omitir: ["c"], ocultarAngulos: ["B"] }) }
    );
  }
  if (v === "angulo") {
    const h = randomInt(5, 40);
    const d = randomInt(5, 40);
    return anguloNumero(
      `Desde un punto a ${d} m de la base de ${objeto} de ${h} m de altura, ¿cuál es el ángulo de elevación de ${cima}? ${PIDE_GRADOS} (Ignora la estatura del observador.)`,
      arcoTangente(h / d)
    );
  }
  if (v === "cometa") {
    const hilo = randomInt(20, 90);
    return numero(
      `Un cometa está sujeto por un hilo tenso de ${hilo} m que forma un ángulo de ${g} con el suelo horizontal. ¿A qué altura sobre el suelo está el cometa? Redondea a 2 decimales.`,
      hilo * sen(theta)
    );
  }
  const alto = randomInt(3, 12);
  const sombra = randomInt(2, 15);
  return anguloNumero(
    `Un poste de ${alto} m de altura proyecta una sombra de ${sombra} m. ¿Cuál es el ángulo de elevación del sol? ${PIDE_GRADOS}`,
    arcoTangente(alto / sombra)
  );
}

export function generarDepresion(dif: number): ProblemaTrigonometriaNumero {
  const variantes = ["distancia"];
  if (dif >= 1) variantes.push("angulo");
  if (dif >= 2) variantes.push("visual");
  const v = elegir(variantes);
  const lugar = elegir([
    { alto: "un faro", bajo: "un bote" },
    { alto: "un acantilado", bajo: "una lancha" },
    { alto: "una torre de vigilancia", bajo: "un camión" },
    { alto: "un edificio", bajo: "un auto estacionado" },
  ]);
  const theta = elegir([15, 20, 25, 30, 35, 40, 45, 50, 55, 60]);
  const h = 5 * randomInt(3, 24);
  if (v === "distancia") {
    return numero(
      `Desde lo alto de ${lugar.alto} de ${h} m de altura, el ángulo de depresión hacia ${lugar.bajo} es de ${m(`${theta}^{\\circ}`)}. ¿A qué distancia horizontal de la base está ${definido(lugar.bajo)}? Redondea a 2 decimales.`,
      h / tan(theta)
    );
  }
  if (v === "angulo") {
    const d = 5 * randomInt(2, 30);
    return anguloNumero(
      `Desde lo alto de ${lugar.alto} de ${h} m de altura se ve ${lugar.bajo} en el suelo, a ${d} m de la base. ¿Cuál es el ángulo de depresión? ${PIDE_GRADOS}`,
      arcoTangente(h / d)
    );
  }
  return numero(
    `Desde lo alto de ${lugar.alto} de ${h} m de altura, el ángulo de depresión hacia ${lugar.bajo} es de ${m(`${theta}^{\\circ}`)}. ¿A qué distancia en línea recta (la visual) está ${definido(lugar.bajo)} de quien mira? Redondea a 2 decimales.`,
    h / sen(theta)
  );
}

export function generarDosPasos(dif: number): ProblemaTrigonometriaNumero {
  const variantes = ["estatura", "mastil"];
  if (dif >= 1) variantes.push("alejarse", "dos-barcos");
  const v = elegir(variantes);
  if (v === "estatura") {
    const ojos = elegir([1.5, 1.6, 1.7, 1.8]);
    const d = 5 * randomInt(4, 16);
    const theta = elegir([20, 25, 30, 35, 40, 45, 50, 55]);
    return numero(
      `Una persona cuyos ojos están a ${numTxt(ojos)} m del suelo se ubica a ${d} m de un edificio y ve la azotea con un ángulo de elevación de ${m(`${theta}^{\\circ}`)}. ¿Qué altura tiene el edificio? Redondea a 2 decimales.`,
      ojos + d * tan(theta),
      { tolRel: 0.015, tolMin: 0.1 }
    );
  }
  if (v === "mastil") {
    const d = 5 * randomInt(4, 16);
    const alfa = randomInt(20, 50);
    const beta = alfa + randomInt(6, 15);
    return numero(
      `Desde un punto a ${d} m de la base de un edificio, la azotea se ve con un ángulo de elevación de ${m(`${alfa}^{\\circ}`)} y la punta de un mástil que está sobre la azotea, con ${m(`${beta}^{\\circ}`)}. ¿Cuánto mide el mástil? Ignora la estatura del observador y redondea a 2 decimales.`,
      d * (tan(beta) - tan(alfa)),
      { tolRel: 0.02, tolMin: 0.1 }
    );
  }
  if (v === "alejarse") {
    const alfa = randomInt(40, 65);
    const beta = randomInt(20, 35);
    const d = 5 * randomInt(2, 10);
    return numero(
      `Un observador ve la punta de una torre con un ángulo de elevación de ${m(`${alfa}^{\\circ}`)}. Se aleja ${d} m en línea recta y ahora la ve con ${m(`${beta}^{\\circ}`)}. ¿Qué altura tiene la torre? Ignora la estatura del observador y redondea a 2 decimales.`,
      d / (cot(beta) - cot(alfa)),
      { tolRel: 0.02, tolMin: 0.1 }
    );
  }
  const h = 10 * randomInt(3, 12);
  const alfa = randomInt(35, 65);
  const beta = randomInt(15, 30);
  return numero(
    `Desde lo alto de un faro de ${h} m se ven dos barcos alineados con el faro y del mismo lado, con ángulos de depresión de ${m(`${alfa}^{\\circ}`)} y ${m(`${beta}^{\\circ}`)}. ¿Qué distancia hay entre los dos barcos? Redondea a 2 decimales.`,
    h * (cot(beta) - cot(alfa)),
    { tolRel: 0.02, tolMin: 0.1 }
  );
}
