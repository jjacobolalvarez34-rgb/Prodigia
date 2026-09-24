// Modo "leyes" de Trigonometría: triángulos oblicuos (ley del seno, ley del
// coseno, área con ½·a·b·sen C, aplicaciones y caso ambiguo SSA). Todos los
// datos salen de src/lib/trigonometria/triangulos.ts y el dibujo usa siempre
// los tres lados y los tres ángulos REALES del triángulo (el ángulo de un
// triángulo obtuso se calcula con la ley del coseno, no con asin, que lo
// confundiría con su suplementario). El dibujo solo muestra los datos del
// enunciado: la incógnita va como "?" y los ángulos que no se dan quedan como
// letra de vértice.

import {
  aRad,
  areaSAS,
  cantidadSSA,
  oblicuoAAS,
  oblicuoSAS,
  oblicuoSSS,
  redondear,
  solucionesSSA,
  type Oblicuo,
} from "@/lib/trigonometria/triangulos";
import { azar, elegir, gradosTexto, m, numTxt, randomInt, tolerancia } from "./trigonometriaBase";
import type { ProblemaTrigonometriaNumero, TrianguloDiagrama } from "./trigonometriaTipos";

type Lado = "a" | "b" | "c";
type Vertice = "A" | "B" | "C";

const CLAVE_LADO: Record<Lado, "ladoA" | "ladoB" | "ladoC"> = { a: "ladoA", b: "ladoB", c: "ladoC" };
const LADO_DE_VERTICE: Record<Vertice, Lado> = { A: "a", B: "b", C: "c" };
const VERTICE_DE_LADO: Record<Lado, Vertice> = { a: "A", b: "B", c: "C" };
const LADOS: Lado[] = ["a", "b", "c"];
const VERTICES: Vertice[] = ["A", "B", "C"];

const valorLado = (t: Oblicuo, l: Lado): number => t[l];
const valorAngulo = (t: Oblicuo, v: Vertice): number => t[v];

function diagrama(t: Oblicuo, o: { ocultar?: Lado[]; omitir?: Lado[]; ocultarAngulos?: Vertice[] } = {}): TrianguloDiagrama {
  return {
    ladoA: t.a,
    ladoB: t.b,
    ladoC: t.c,
    anguloA: t.A,
    anguloB: t.B,
    anguloC: t.C,
    ocultarLados: (o.ocultar ?? []).map((l) => CLAVE_LADO[l]),
    omitirLados: (o.omitir ?? []).map((l) => CLAVE_LADO[l]),
    ocultarAngulos: o.ocultarAngulos ?? [],
  };
}

const grados = gradosTexto;

function numero(enunciado: string, x: number, opciones: { tolRel?: number; tolMin?: number; triangulo?: TrianguloDiagrama } = {}): ProblemaTrigonometriaNumero {
  const respuesta = redondear(x, 2);
  return {
    modo: "leyes",
    entrada: "numero",
    enunciado,
    respuesta,
    tolerancia: tolerancia(respuesta, opciones.tolRel ?? 0.006, opciones.tolMin ?? 0.05),
    triangulo: opciones.triangulo,
  };
}

function anguloNumero(enunciado: string, g: number, triangulo?: TrianguloDiagrama): ProblemaTrigonometriaNumero {
  return { modo: "leyes", entrada: "numero", enunciado, respuesta: redondear(g, 1), tolerancia: 0.1, triangulo };
}

const PIDE_GRADOS = "Da el ángulo en grados, redondeado a 1 decimal.";

// ---------- seno-lado: ley del seno, hallar un lado (dos ángulos y un lado) ----------
// Ángulos "amigables" para el primer nivel (los valores del seno se reconocen).
const PARES_NOTABLES: [number, number][] = [[30, 45], [45, 30], [30, 60], [60, 45], [45, 60], [60, 75], [45, 75], [30, 75]];

const PERMUTACIONES: Vertice[][] = [
  ["A", "B", "C"],
  ["B", "C", "A"],
  ["C", "A", "B"],
  ["A", "C", "B"],
  ["B", "A", "C"],
  ["C", "B", "A"],
];

export function generarSenoLado(dif: number): ProblemaTrigonometriaNumero {
  let A: number;
  let B: number;
  if (dif === 0) {
    [A, B] = elegir(PARES_NOTABLES);
  } else {
    A = randomInt(30, 100);
    B = randomInt(30, 100);
    while (A + B > 150) B = randomInt(30, 100);
  }
  const C = 180 - A - B;
  const lado = randomInt(dif >= 2 ? 6 : 5, dif >= 2 ? 40 : 20);
  // Se permutan los vértices para que el lado dado y el pedido no sean siempre a y b.
  const [vDado, vPedido, vTercero] = dif <= 1 ? (["A", "B", "C"] as Vertice[]) : elegir(PERMUTACIONES);
  const angulos: Record<Vertice, number> = { A, B, C };
  const base = oblicuoAAS(A, B, 1);
  const escala = lado / base[LADO_DE_VERTICE[vDado]];
  const t: Oblicuo = { a: base.a * escala, b: base.b * escala, c: base.c * escala, A, B, C };
  // Datos que se dan: el lado opuesto a vDado y dos ángulos. En dif >= 2 los dos ángulos dados NO incluyen el opuesto al lado dado
  // (hay que calcular el tercer ángulo antes de aplicar la ley del seno).
  const angulosDados: Vertice[] = dif <= 1 ? [vDado, vPedido] : [vPedido, vTercero];
  const ocultarAngulos = VERTICES.filter((v) => !angulosDados.includes(v));
  const descAng = angulosDados.map((v) => m(`${v}=${angulos[v]}^{\\circ}`)).join(" y ");
  const enunciado = `En el triángulo de la figura se conocen ${descAng} y el lado ${m(LADO_DE_VERTICE[vDado])} (opuesto a ${m(vDado)}) mide ${numTxt(lado)}. ¿Cuánto mide el lado ${m(LADO_DE_VERTICE[vPedido])} (opuesto a ${m(vPedido)})? Usa la ley del seno y redondea a 2 decimales.`;
  const tercero = LADOS.find((l) => l !== LADO_DE_VERTICE[vDado] && l !== LADO_DE_VERTICE[vPedido])!;
  return numero(enunciado, valorLado(t, LADO_DE_VERTICE[vPedido]), {
    triangulo: diagrama(t, { ocultar: [LADO_DE_VERTICE[vPedido]], omitir: [tercero], ocultarAngulos }),
  });
}

// ---------- coseno-lado: ley del coseno, tercer lado (SAS) ----------
export function generarCosenoLado(dif: number): ProblemaTrigonometriaNumero {
  const maxLado = dif === 0 ? 12 : dif === 1 ? 15 : 25;
  const a = randomInt(3, maxLado);
  const b = randomInt(3, maxLado);
  const C = dif === 0 ? elegir([60, 120]) : dif === 1 ? randomInt(30, 150) : randomInt(20, 160);
  const t = oblicuoSAS(a, b, C);
  return numero(
    `Un triángulo tiene dos lados de ${a} y ${b} y el ángulo comprendido entre ellos mide ${grados(C)}. ¿Cuánto mide el tercer lado? Usa la ley del coseno y redondea a 2 decimales.`,
    t.c,
    { triangulo: diagrama(t, { ocultar: ["c"], ocultarAngulos: ["A", "B"] }) }
  );
}

// ---------- coseno-angulo: ley del coseno, un ángulo (SSS) ----------
export function generarCosenoAngulo(dif: number): ProblemaTrigonometriaNumero {
  const maxLado = dif === 0 ? 12 : dif === 1 ? 16 : 25;
  let a: number;
  let b: number;
  let c: number;
  do {
    a = randomInt(4, maxLado);
    b = randomInt(4, maxLado);
    c = randomInt(4, maxLado);
  } while (!(a + b - c >= 2 && a + c - b >= 2 && b + c - a >= 2) || (a === b && b === c));
  const t = oblicuoSSS(a, b, c);
  // dif >= 1: el ángulo pedido es el opuesto al lado MAYOR (puede ser obtuso).
  const mayor = LADOS.reduce((x, y) => (valorLado(t, y) > valorLado(t, x) ? y : x));
  const v = dif === 0 ? elegir(VERTICES) : dif === 1 ? VERTICE_DE_LADO[mayor] : elegir([VERTICE_DE_LADO[mayor], ...VERTICES]);
  return anguloNumero(
    `Un triángulo tiene lados ${m(`a=${a}`)}, ${m(`b=${b}`)} y ${m(`c=${c}`)} (cada lado lleva la letra de su ángulo opuesto). ¿Cuánto mide el ángulo ${m(v)}? Usa la ley del coseno. ${PIDE_GRADOS}`,
    valorAngulo(t, v),
    diagrama(t, { ocultarAngulos: VERTICES })
  );
}

// ---------- area: ½·a·b·sen C ----------
export function generarArea(dif: number): ProblemaTrigonometriaNumero {
  const a = randomInt(4, dif >= 2 ? 30 : 20);
  const b = randomInt(4, dif >= 2 ? 30 : 20);
  const C = dif === 0 ? randomInt(30, 80) : randomInt(30, 150);
  const t = oblicuoSAS(a, b, C);
  if (dif >= 2) {
    const contexto = elegir([
      `Un terreno triangular tiene dos lados de ${a} m y ${b} m que forman un ángulo de ${grados(C)}. ¿Cuál es su área en m²? Redondea a 2 decimales.`,
      `Una vela triangular tiene dos bordes de ${a} dm y ${b} dm que forman un ángulo de ${grados(C)}. ¿Cuál es su área en dm²? Redondea a 2 decimales.`,
    ]);
    return numero(contexto, areaSAS(a, b, C), { tolRel: 0.005, tolMin: 0.05 });
  }
  return numero(
    `Un triángulo tiene dos lados de ${a} y ${b} y el ángulo comprendido entre ellos mide ${grados(C)}. ¿Cuál es su área? Redondea a 2 decimales.`,
    areaSAS(a, b, C),
    { tolRel: 0.005, tolMin: 0.05, triangulo: diagrama(t, { omitir: ["c"], ocultarAngulos: ["A", "B"] }) }
  );
}

// ---------- aplicacion: contextos ----------
export function generarAplicacion(dif: number): ProblemaTrigonometriaNumero {
  const casos = ["lago", "observadores"];
  if (dif >= 1) casos.push("barcos", "perimetro");
  if (dif >= 2) casos.push("parque", "sendero");
  const caso = elegir(casos);
  if (caso === "lago") {
    const pa = 10 * randomInt(6, 20);
    const pb = 10 * randomInt(6, 20);
    const ang = randomInt(35, 110);
    return numero(
      `Para medir la distancia entre dos puntos ${m("A")} y ${m("B")} separados por un lago, se elige un punto ${m("P")} desde el que ${m("PA")} mide ${pa} m, ${m("PB")} mide ${pb} m y el ángulo ${m("APB")} mide ${grados(ang)}. ¿Cuál es la distancia entre ${m("A")} y ${m("B")}? Redondea a 2 decimales.`,
      oblicuoSAS(pa, pb, ang).c,
      { tolRel: 0.006, tolMin: 0.1 }
    );
  }
  if (caso === "observadores") {
    const base = 10 * randomInt(3, 12);
    const alfa = randomInt(45, 80);
    const beta = randomInt(45, 80);
    // A y B están en la orilla (distancia `base`); C es el barco. AB = c; el lado AC = b (opuesto a B).
    const t = oblicuoAAS(alfa, beta, 1); // a es opuesto a A; se escala para que c = base
    const k = base / t.c;
    return numero(
      `Dos observadores, ${m("A")} y ${m("B")}, están en una playa recta a ${base} m uno del otro. Un barco ${m("C")} se ve desde ${m("A")} con un ángulo ${m("CAB")} de ${grados(alfa)} y desde ${m("B")} con un ángulo ${m("CBA")} de ${grados(beta)}. ¿A qué distancia de ${m("A")} está el barco? Redondea a 2 decimales.`,
      t.b * k,
      { tolRel: 0.006, tolMin: 0.1 }
    );
  }
  if (caso === "barcos") {
    const v1 = randomInt(12, 30);
    const v2 = randomInt(12, 30);
    const horas = randomInt(2, 4);
    const ang = randomInt(30, 140);
    return numero(
      `Dos barcos salen del mismo puerto al mismo tiempo, con rumbos que forman un ángulo de ${grados(ang)}. Uno navega a ${v1} km/h y el otro a ${v2} km/h. ¿A qué distancia están entre sí después de ${horas} horas? Redondea a 2 decimales.`,
      oblicuoSAS(v1 * horas, v2 * horas, ang).c,
      { tolRel: 0.006, tolMin: 0.1 }
    );
  }
  if (caso === "perimetro") {
    const a = randomInt(20, 60);
    const b = randomInt(20, 60);
    const ang = randomInt(40, 130);
    const t = oblicuoSAS(a, b, ang);
    return numero(
      `Un terreno triangular tiene dos lados de ${a} m y ${b} m que forman un ángulo de ${grados(ang)}. ¿Cuánto mide su perímetro? Redondea a 2 decimales.`,
      a + b + t.c,
      { tolRel: 0.006, tolMin: 0.1 }
    );
  }
  if (caso === "parque") {
    const a = 10 * randomInt(8, 20);
    const b = 10 * randomInt(8, 20);
    let c = 10 * randomInt(8, 20);
    while (!(a + b - c >= 20 && a + c - b >= 20 && b + c - a >= 20)) c = 10 * randomInt(8, 20);
    const t = oblicuoSSS(a, b, c);
    const mayor = Math.max(t.A, t.B, t.C);
    return anguloNumero(
      `Un parque triangular tiene lados de ${a} m, ${b} m y ${c} m. ¿Cuánto mide su ángulo mayor? ${PIDE_GRADOS}`,
      mayor
    );
  }
  // sendero: dos tramos y el ángulo entre ellos -> distancia en línea recta de vuelta
  const t1 = randomInt(3, 12);
  const t2 = randomInt(3, 12);
  const giro = randomInt(30, 120);
  // Al terminar el primer tramo se gira `giro` grados: el ángulo interior del triángulo es 180° − giro.
  return numero(
    `Una excursionista camina ${t1} km en línea recta, gira ${grados(giro)} hacia la derecha y camina ${t2} km más. ¿A qué distancia en línea recta quedó del punto de partida? Redondea a 2 decimales.`,
    oblicuoSAS(t1, t2, 180 - giro).c,
    { tolRel: 0.006, tolMin: 0.05 }
  );
}

// ---------- ambiguo: caso SSA ----------
// Arma (a, b, A) con la cantidad de triángulos pedida (0, 1 o 2), verificando la
// cantidad con dos métodos independientes (la regla de la altura y la resolución
// por ley del seno).
export interface CasoSSA {
  a: number;
  b: number;
  A: number;
  cantidad: 0 | 1 | 2;
}

export function armarCasoSSA(cantidad: 0 | 1 | 2): CasoSSA {
  for (let intento = 0; intento < 500; intento++) {
    const b = randomInt(8, 24);
    const A = randomInt(20, 60);
    const h = b * Math.sin(aRad(A));
    let a: number;
    let angulo = A;
    if (cantidad === 2) {
      const min = Math.floor(h) + 1;
      if (min >= b) continue;
      a = randomInt(min, b - 1);
    } else if (cantidad === 0) {
      const max = Math.ceil(h) - 1;
      if (max < 3) continue;
      a = randomInt(3, max);
    } else if (azar() < 0.5) {
      a = randomInt(b, b + 8); // a >= b: un solo triángulo con A agudo
    } else {
      angulo = randomInt(95, 140); // A obtuso con a > b
      a = randomInt(b + 1, b + 8);
    }
    if (cantidadSSA(a, b, angulo) === cantidad && solucionesSSA(a, b, angulo).length === cantidad) return { a, b, A: angulo, cantidad };
  }
  throw new Error(`No se pudo armar un caso SSA con ${cantidad} triángulos`);
}

export function generarAmbiguo(dif: number): ProblemaTrigonometriaNumero {
  const cantidad = elegir<0 | 1 | 2>([0, 1, 2]);
  const pideAngulo = dif >= 1 && azar() < 0.5;
  const caso = armarCasoSSA(pideAngulo ? 2 : cantidad);
  const datos = `${m(`a=${caso.a}`)}, ${m(`b=${caso.b}`)} y ${m(`A=${caso.A}^{\\circ}`)} (el ángulo ${m("A")} es opuesto al lado ${m("a")})`;
  if (pideAngulo) {
    const soluciones = solucionesSSA(caso.a, caso.b, caso.A);
    const mayorB = Math.max(...soluciones.map((s) => s.B));
    return anguloNumero(`Con ${datos} se pueden formar dos triángulos distintos. ¿Cuánto mide el mayor de los dos ángulos ${m("B")} posibles? ${PIDE_GRADOS}`, mayorB);
  }
  return {
    modo: "leyes",
    entrada: "numero",
    enunciado: `Se quiere construir un triángulo con ${datos}. ¿Cuántos triángulos distintos existen con esos datos? Escribe 0, 1 o 2.`,
    respuesta: caso.cantidad,
    tolerancia: 0,
  };
}
