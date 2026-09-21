// Mundo Estadística (mundo 11) — 5 modos con bandas de nivel autorales
// (nivel 1-10 vía skill_levels, sin cambio de esquema; cada generador
// satura el nivel a su banda, mismo patrón que calculia.ts):
//   central       1-3   media, mediana, moda, rango, tabla de frecuencias, dato faltante
//   dispersion    3-6   rango intercuartílico, varianza, desvío, transformaciones
//   probabilidad  4-7   simple, condicional, combinatoria (n!, nPr, nCr)
//   datos         6-10  percentiles, z-score, regla empírica, atípicos, correlación/regresión
//   graficos      5-9   lectura de gráficos SVG (ver src/lib/estadistica/graficos.ts)
//
// REGLAS de rigor de todo este archivo:
//  1. Toda ambigüedad estadística la DECLARA el enunciado: varianza
//     poblacional (÷ n) o muestral (÷ n−1) dicha explícitamente; cuartiles
//     por el "método de las mitades"; percentil por "rango más cercano"
//     (posición ⌈P·N/100⌉); atípico = fuera de [Q1 − 1.5·IQR, Q3 + 1.5·IQR].
//  2. Las respuestas numéricas son "limpias": o exactas con <= 2
//     decimales (los datos se construyen para eso: media entera, n que
//     divide a 100, etc.) o redondeadas a 2 decimales con el enunciado
//     diciéndolo. Se comparan NUMÉRICAMENTE (5.20 == 5.2), nunca como texto.
//  3. Los datos que muestra un enunciado van siempre entre llaves
//     `{a, b, c}` (el test los vuelve a parsear de ahí y recalcula cada
//     respuesta por un método independiente, con aritmética racional).
//  4. Nunca se parsea una expresión libre: cada generador construye los
//     datos y calcula la respuesta de esos mismos datos.

import type { ProblemaEstadistica, ProblemaEstadisticaNumero, ProblemaEstadisticaOpciones, ModoEstadistica, TipoProblemaEstadistica } from "@/lib/estadistica/tipos";
import { generarGrafico } from "@/lib/estadistica/graficos";
import {
  armarOpciones,
  azar,
  clamp,
  conRngSembrado,
  cuartilesMitades,
  elegir,
  elegirPonderado,
  esCuadradoPerfecto,
  fmt,
  fmtFraccion,
  fmtLista,
  fraccion,
  medianaOrdenada,
  mezclar,
  ordenar,
  randomInt,
  redondear2,
  suma,
  tieneHasta2Decimales,
  valorFraccion,
  type Fraccion,
} from "@/lib/estadistica/util";

export { MODOS_ESTADISTICA, NOMBRE_MODO_ESTADISTICA } from "@/lib/estadistica/tipos";
export type {
  DetalleEstadistica,
  EjeValores,
  GraficoEstadistica,
  ModoEstadistica,
  ProblemaEstadistica,
  ProblemaEstadisticaNumero,
  ProblemaEstadisticaOpciones,
  TipoProblemaEstadistica,
} from "@/lib/estadistica/tipos";
export { conRngSembrado };

// ---------- Constructores ----------

type Params = Record<string, number | string>;

function num(modo: ModoEstadistica, tipo: TipoProblemaEstadistica, enunciado: string, raw: number, opts?: { redondeada?: boolean; params?: Params }): ProblemaEstadisticaNumero {
  const respuesta = redondear2(raw);
  return {
    modo,
    entrada: "numero",
    enunciado,
    respuesta,
    tolerancia: opts?.redondeada ? 0.01 : Number.isInteger(respuesta) ? 0 : 0.005,
    detalle: { tipo, params: opts?.params },
  };
}

function opc(
  modo: ModoEstadistica,
  tipo: TipoProblemaEstadistica,
  enunciado: string,
  correcta: string,
  distractores: string[],
  params?: Params,
  clave?: (op: string) => string
): ProblemaEstadisticaOpciones {
  return { modo, entrada: "opciones", enunciado, opciones: armarOpciones(correcta, distractores, clave), respuesta: correcta, detalle: { tipo, params } };
}

const conjunto = (datos: readonly number[]) => `{${fmtLista(datos)}}`;

// ---------- Generación de datos ----------

function enteros(n: number, min: number, max: number): number[] {
  return Array.from({ length: n }, () => randomInt(min, max));
}

// n enteros con media ENTERA `media` (desviaciones simétricas acotadas por
// r), no todos iguales y >= min. Con media entera, la suma de cuadrados
// de las desviaciones es entera: varianza = SS/n con n | 100 es limpia.
function datosMediaEntera(n: number, media: number, r: number, min: number): number[] {
  for (let t = 0; t < 400; t++) {
    const dev = Array.from({ length: n - 1 }, () => randomInt(-r, r));
    const ultima = -suma(dev);
    if (Math.abs(ultima) > r) continue;
    const datos = [...dev, ultima].map((d) => media + d);
    if (datos.some((x) => x < min)) continue;
    if (new Set(datos).size === 1) continue;
    return datos;
  }
  const dev: number[] = [];
  for (let k = 1; k <= Math.floor(n / 2); k++) dev.push(k, -k);
  if (n % 2 === 1) dev.push(0);
  return dev.map((d) => media + d);
}

function sumaCuadrados(datos: readonly number[]): number {
  const media = suma(datos) / datos.length;
  return datos.reduce((a, x) => a + (x - media) * (x - media), 0);
}

// Datos con media entera cuya varianza poblacional es un cuadrado perfecto
// entero (=> desvío poblacional entero, sin redondeo).
function datosDesvioEntero(): { datos: number[]; varianza: number; desvio: number } {
  for (let t = 0; t < 600; t++) {
    const n = elegir([4, 5, 6, 8]);
    const datos = datosMediaEntera(n, randomInt(8, 20), 5, 1);
    const ss = Math.round(sumaCuadrados(datos));
    if (ss > 0 && ss % n === 0 && esCuadradoPerfecto(ss / n)) {
      return { datos: mezclar(datos), varianza: ss / n, desvio: Math.round(Math.sqrt(ss / n)) };
    }
  }
  // Clásico: media 5, varianza 4, desvío 2.
  return { datos: mezclar([2, 4, 4, 4, 5, 5, 7, 9]), varianza: 4, desvio: 2 };
}

// ============================================================
// Modo 1: Tendencia central (nivel 1-3)
// ============================================================

function bandaCentral(nivel: number): number {
  return clamp(nivel, 1, 3);
}

function centralMedia(N: number): ProblemaEstadistica {
  for (;;) {
    let datos: number[];
    if (N === 1) datos = mezclar(datosMediaEntera(elegir([4, 5]), randomInt(5, 14), 4, 1));
    else if (N === 2) datos = enteros(elegir([4, 5, 5, 10]), 1, 30);
    else datos = Array.from({ length: elegir([5, 10]) }, () => randomInt(10, 200) / 10);
    const media = suma(datos) / datos.length;
    if (!tieneHasta2Decimales(media)) continue;
    return num("central", "media", `Calcula la media de los datos ${conjunto(datos)}.`, media);
  }
}

function centralMediana(N: number): ProblemaEstadistica {
  const decimales = N === 3 && azar() < 0.4;
  const n = N === 1 ? elegir([3, 5, 7]) : randomInt(4, 9);
  const datos = decimales ? Array.from({ length: n }, () => randomInt(10, 300) / 10) : enteros(n, 1, N === 1 ? 20 : 60);
  return num("central", "mediana", `Calcula la mediana de los datos ${conjunto(datos)}.`, medianaOrdenada(ordenar(datos)));
}

// Moda única por construcción: la moda tiene c apariciones y los demás
// valores, estrictamente menos.
function centralModa(N: number): ProblemaEstadistica {
  const distintos = randomInt(3, N === 1 ? 4 : 5);
  const valores = mezclar(Array.from({ length: 20 }, (_, i) => i + 1)).slice(0, distintos);
  const c = randomInt(2, N === 1 ? 3 : 4);
  const conteos = valores.map((_, i) => (i === 0 ? c : randomInt(1, c - 1)));
  const datos = mezclar(valores.flatMap((v, i) => Array<number>(conteos[i]).fill(v)));
  return num("central", "moda", `¿Cuál es la moda de los datos ${conjunto(datos)}?`, valores[0]);
}

function centralRango(N: number): ProblemaEstadistica {
  for (;;) {
    const datos = enteros(randomInt(5, 8), 1, N === 1 ? 30 : 100);
    if (Math.max(...datos) === Math.min(...datos)) continue;
    return num("central", "rango", `Calcula el rango (máximo − mínimo) de los datos ${conjunto(datos)}.`, Math.max(...datos) - Math.min(...datos));
  }
}

function centralFrecuencias(): ProblemaEstadistica {
  const valores = ordenar(mezclar(Array.from({ length: 12 }, (_, i) => i + 1)).slice(0, 4));
  const total = elegir([10, 20]);
  const f = [1, 1, 1, 1];
  for (let i = 0; i < total - 4; i++) f[randomInt(0, 3)]++;
  const media = valores.reduce((a, v, i) => a + v * f[i], 0) / total;
  return num("central", "media_frecuencias", `Una tabla de frecuencias tiene los valores ${conjunto(valores)} con frecuencias ${conjunto(f)}. Calcula la media.`, media);
}

function centralDatoFaltante(): ProblemaEstadistica {
  const n = randomInt(4, 6);
  const media = randomInt(6, 15);
  const datos = datosMediaEntera(n, media, 4, 1);
  const i = randomInt(0, n - 1);
  const conocidos = mezclar(datos.filter((_, j) => j !== i));
  return num("central", "dato_faltante", `La media de ${n} datos es ${media}. Los otros ${n - 1} datos conocidos son ${conjunto(conocidos)}. ¿Cuál es el dato que falta?`, datos[i]);
}

function generarCentral(nivel: number): ProblemaEstadistica {
  const N = bandaCentral(nivel);
  const tipo = elegirPonderado(
    [
      ["media", 1],
      ["mediana", 1],
      ["moda", 1],
      ["rango", 1],
      ["frecuencias", 3],
      ["faltante", 3],
    ] as const,
    N
  );
  if (tipo === "media") return centralMedia(N);
  if (tipo === "mediana") return centralMediana(N);
  if (tipo === "moda") return centralModa(N);
  if (tipo === "rango") return centralRango(N);
  if (tipo === "frecuencias") return centralFrecuencias();
  return centralDatoFaltante();
}

// ============================================================
// Modo 2: Dispersión (nivel 3-6)
// ============================================================

function bandaDispersion(nivel: number): number {
  return clamp(nivel, 3, 6);
}

const METODO_MITADES =
  "Usa el método de las mitades: Q1 y Q3 son las medianas de la mitad inferior y de la mitad superior de los datos ordenados (si n es impar, la mediana no se incluye en ninguna mitad).";

function dispersionIqr(N: number): ProblemaEstadistica {
  const n = N === 3 ? elegir([7, 8]) : N === 4 ? elegir([8, 9]) : elegir([9, 10, 11, 12]);
  for (;;) {
    const datos = enteros(n, 1, 50);
    const { q1, q3 } = cuartilesMitades(datos);
    if (q3 === q1) continue;
    return num("dispersion", "iqr", `${METODO_MITADES} Calcula el rango intercuartílico (Q3 − Q1) de ${conjunto(datos)}.`, q3 - q1);
  }
}

function dispersionVarianzaPob(N: number): ProblemaEstadistica {
  const n = N === 3 ? 4 : elegir(N >= 5 ? [4, 5, 10] : [4, 5]);
  const datos = mezclar(datosMediaEntera(n, randomInt(6, 15), N >= 5 ? 6 : 4, 1));
  const varianza = sumaCuadrados(datos) / n;
  return num("dispersion", "varianza_poblacional", `Calcula la varianza poblacional (σ², se divide por n) de los datos ${conjunto(datos)}.`, varianza);
}

function dispersionDesvioPob(N: number): ProblemaEstadistica {
  if (N >= 6 && azar() < 0.5) {
    const n = elegir([5, 6, 8]);
    const datos = mezclar(datosMediaEntera(n, randomInt(8, 20), 5, 1));
    return num("dispersion", "desvio_poblacional", `Calcula el desvío estándar poblacional (σ, se divide por n) de los datos ${conjunto(datos)}. Redondea a 2 decimales.`, Math.sqrt(sumaCuadrados(datos) / n), { redondeada: true });
  }
  const { datos, desvio } = datosDesvioEntero();
  return num("dispersion", "desvio_poblacional", `Calcula el desvío estándar poblacional (σ, se divide por n) de los datos ${conjunto(datos)}.`, desvio);
}

function dispersionVarianzaMuestral(): ProblemaEstadistica {
  // n − 1 divide a 100 (2, 4, 5, 10): la varianza muestral queda con <= 2 decimales.
  const n = elegir([3, 5, 6, 11]);
  const datos = mezclar(datosMediaEntera(n, randomInt(6, 15), 5, 1));
  return num("dispersion", "varianza_muestral", `Calcula la varianza muestral (s², se divide por n − 1) de los datos ${conjunto(datos)}.`, sumaCuadrados(datos) / (n - 1));
}

function dispersionDesvioMuestral(): ProblemaEstadistica {
  const n = elegir([5, 6]);
  const datos = mezclar(datosMediaEntera(n, randomInt(8, 20), 5, 1));
  return num("dispersion", "desvio_muestral", `Calcula el desvío estándar muestral (s, se divide por n − 1) de los datos ${conjunto(datos)}. Redondea a 2 decimales.`, Math.sqrt(sumaCuadrados(datos) / (n - 1)), { redondeada: true });
}

function dispersionTransformacion(): ProblemaEstadistica {
  const { datos, varianza, desvio } = datosDesvioEntero();
  const suma_ = azar() < 0.5;
  const valor = suma_ ? randomInt(2, 9) : randomInt(2, 4);
  const pideVarianza = azar() < 0.5;
  const accion = suma_ ? `sumas ${valor} a cada dato` : `multiplicas cada dato por ${valor}`;
  const nombre = pideVarianza ? "varianza poblacional" : "desvío estándar poblacional";
  const esperado = pideVarianza ? (suma_ ? varianza : valor * valor * varianza) : suma_ ? desvio : valor * desvio;
  return num(
    "dispersion",
    pideVarianza ? "transformacion_varianza" : "transformacion_desvio",
    `Los datos ${conjunto(datos)} tienen varianza poblacional ${varianza} y desvío estándar poblacional ${desvio}. Si ${accion}, ¿cuál es la nueva ${nombre}?`,
    esperado,
    { params: { op: suma_ ? "suma" : "multiplica", valor } }
  );
}

function generarDispersion(nivel: number): ProblemaEstadistica {
  const N = bandaDispersion(nivel);
  const tipo = elegirPonderado(
    [
      ["iqr", 3],
      ["varPob", 3],
      ["desvioPob", 4],
      ["varMuestral", 5],
      ["transformacion", 5],
      ["desvioMuestral", 6],
    ] as const,
    N
  );
  if (tipo === "iqr") return dispersionIqr(N);
  if (tipo === "varPob") return dispersionVarianzaPob(N);
  if (tipo === "desvioPob") return dispersionDesvioPob(N);
  if (tipo === "varMuestral") return dispersionVarianzaMuestral();
  if (tipo === "transformacion") return dispersionTransformacion();
  return dispersionDesvioMuestral();
}

// ============================================================
// Modo 3: Probabilidad y combinatoria (nivel 4-7)
// ============================================================

function bandaProbabilidad(nivel: number): number {
  return clamp(nivel, 4, 7);
}

const COLORES = [
  { pl: "rojas", sg: "roja" },
  { pl: "azules", sg: "azul" },
  { pl: "verdes", sg: "verde" },
  { pl: "amarillas", sg: "amarilla" },
  { pl: "blancas", sg: "blanca" },
  { pl: "negras", sg: "negra" },
] as const;

interface Bolsa {
  colores: Array<(typeof COLORES)[number]>;
  cuentas: number[];
  total: number;
}

// Cada color con al menos 2 bolas (nunca "1 bolas rojas").
function armarBolsa(nColores: number, maxCada: number): Bolsa {
  const colores = mezclar(COLORES).slice(0, nColores);
  const cuentas = colores.map(() => randomInt(2, maxCada));
  return { colores, cuentas, total: suma(cuentas) };
}

function describirBolsa(b: Bolsa): string {
  const partes = b.colores.map((c, i) => (i === 0 ? `${b.cuentas[i]} bolas ${c.pl}` : `${b.cuentas[i]} ${c.pl}`));
  const lista = partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
  return `Una bolsa tiene ${lista}.`;
}

function claveFraccion(op: string): string {
  if (op.includes("/")) {
    const [a, b] = op.split("/").map(Number);
    return String(a / b);
  }
  return String(Number(op));
}

// Distractores válidos (0 < p < 1), sin repetir valor, hasta tener 4
// opciones en total; si faltan, completa con fracciones cercanas.
function opcionesFraccion(correcta: Fraccion, distractores: Fraccion[]): { correcta: string; distractores: string[] } {
  const vistos = new Set<string>([String(valorFraccion(correcta))]);
  const out: string[] = [];
  const agregar = (f: Fraccion) => {
    const v = valorFraccion(f);
    if (!(v > 0 && v < 1) || vistos.has(String(v))) return;
    vistos.add(String(v));
    out.push(fmtFraccion(f));
  };
  for (const d of distractores) agregar(d);
  for (let t = 0; t < 80 && out.length < 3; t++) {
    const den = randomInt(2, Math.max(6, correcta.den + 3));
    agregar(fraccion(randomInt(1, den - 1), den));
  }
  return { correcta: fmtFraccion(correcta), distractores: out };
}

function opcFraccion(tipo: TipoProblemaEstadistica, enunciado: string, correcta: Fraccion, distractores: Fraccion[], params?: Params): ProblemaEstadisticaOpciones {
  const o = opcionesFraccion(correcta, distractores);
  return opc("probabilidad", tipo, enunciado, o.correcta, o.distractores, params, claveFraccion);
}

function probSimple(): ProblemaEstadistica {
  const b = armarBolsa(randomInt(2, 3), 7);
  const i = randomInt(0, b.colores.length - 1);
  const c = b.cuentas[i];
  const otro = (i + 1) % b.colores.length;
  return opcFraccion(
    "prob_simple",
    `${describirBolsa(b)} Se extrae una bola al azar. ¿Cuál es la probabilidad de que sea ${b.colores[i].sg}?`,
    fraccion(c, b.total),
    [fraccion(b.cuentas[otro], b.total), fraccion(c, b.total - c), fraccion(b.total - c, b.total), fraccion(1, b.colores.length)]
  );
}

const PREDICADOS_DADO: Array<{ txt: string; f: (x: number) => boolean }> = [
  { txt: "un número par", f: (x) => x % 2 === 0 },
  { txt: "un número impar", f: (x) => x % 2 === 1 },
  { txt: "un número primo", f: (x) => [2, 3, 5, 7, 11].includes(x) },
  { txt: "un múltiplo de 3", f: (x) => x % 3 === 0 },
  { txt: "un número mayor que 4", f: (x) => x > 4 },
  { txt: "un número menor que 4", f: (x) => x < 4 },
];

function probDado(): ProblemaEstadistica {
  const caras = elegir([6, 8, 10, 12]);
  const p = elegir(PREDICADOS_DADO);
  let favorables = 0;
  for (let x = 1; x <= caras; x++) if (p.f(x)) favorables++;
  return opcFraccion(
    "prob_dado",
    `Se lanza un dado justo de ${caras} caras (numeradas de 1 a ${caras}). ¿Cuál es la probabilidad de obtener ${p.txt}?`,
    fraccion(favorables, caras),
    [fraccion(caras - favorables, caras), fraccion(favorables, caras - favorables || 1), fraccion(1, caras), fraccion(favorables + 1, caras)]
  );
}

function probComplemento(): ProblemaEstadistica {
  const b = armarBolsa(randomInt(2, 3), 7);
  const i = randomInt(0, b.colores.length - 1);
  const c = b.cuentas[i];
  return opcFraccion(
    "prob_complemento",
    `${describirBolsa(b)} Se extrae una bola al azar. ¿Cuál es la probabilidad de que NO sea ${b.colores[i].sg}?`,
    fraccion(b.total - c, b.total),
    [fraccion(c, b.total), fraccion(b.total - c, c), fraccion(1, b.total)]
  );
}

function probIndependientes(): ProblemaEstadistica {
  const b = armarBolsa(randomInt(2, 3), 6);
  const i = randomInt(0, b.colores.length - 1);
  const j = randomInt(0, b.colores.length - 1);
  const T = b.total;
  const ci = b.cuentas[i];
  const cj = b.cuentas[j];
  return opcFraccion(
    "prob_independientes",
    `${describirBolsa(b)} Se extrae una bola, se anota su color y se DEVUELVE a la bolsa; luego se extrae otra. ¿Cuál es la probabilidad de que la primera sea ${b.colores[i].sg} y la segunda sea ${b.colores[j].sg}?`,
    fraccion(ci * cj, T * T),
    [fraccion(ci * (cj - (i === j ? 1 : 0)), T * (T - 1)), fraccion(ci + cj, 2 * T), fraccion(ci * cj, T * (T - 1)), fraccion(ci, T)]
  );
}

const CONTEXTOS_TABLA = [
  { sujeto: "estudiantes", a: "estudiaron", na: "no estudiaron", b: "aprobaron", nb: "no aprobaron", nomA: "estudió", nomB: "aprobó" },
  { sujeto: "clientes", a: "usaron cupón", na: "no usaron cupón", b: "compraron", nb: "no compraron", nomA: "usó cupón", nomB: "compró" },
  { sujeto: "pacientes", a: "hicieron ejercicio", na: "no hicieron ejercicio", b: "mejoraron", nb: "no mejoraron", nomA: "hizo ejercicio", nomB: "mejoró" },
] as const;

function probCondicionalTabla(): ProblemaEstadistica {
  const ctx = elegir(CONTEXTOS_TABLA);
  const ab = randomInt(3, 20);
  const anb = randomInt(2, 15);
  const nab = randomInt(2, 15);
  const nanb = randomInt(3, 20);
  const N = ab + anb + nab + nanb;
  const dadoA = azar() < 0.5; // P(B | A) o P(A | B)
  const enun =
    `De ${N} ${ctx.sujeto}: ${ab} ${ctx.a} y ${ctx.b}; ${anb} ${ctx.a} y ${ctx.nb}; ${nab} ${ctx.na} y ${ctx.b}; ${nanb} ${ctx.na} y ${ctx.nb}. ` +
    (dadoA
      ? `Si se elige al azar a uno de los que ${ctx.a}, ¿cuál es la probabilidad de que ${ctx.nomB}?`
      : `Si se elige al azar a uno de los que ${ctx.b}, ¿cuál es la probabilidad de que ${ctx.nomA}?`);
  const correcta = dadoA ? fraccion(ab, ab + anb) : fraccion(ab, ab + nab);
  const inversa = dadoA ? fraccion(ab, ab + nab) : fraccion(ab, ab + anb);
  return opcFraccion("prob_condicional_tabla", enun, correcta, [inversa, fraccion(ab, N), fraccion(ab + nab, N), fraccion(ab + anb, N)], { dadoA: dadoA ? 1 : 0 });
}

function probSinReposicion(): ProblemaEstadistica {
  const b = armarBolsa(2, 5);
  const T = b.total;
  const variante = elegir(["ambas", "condicional", "distintas"] as const);
  const c0 = b.cuentas[0];
  const c1 = b.cuentas[1];
  const base = `${describirBolsa(b)} Se extraen dos bolas una tras otra SIN devolverlas.`;
  if (variante === "ambas") {
    return opcFraccion(
      "prob_sin_reposicion",
      `${base} ¿Cuál es la probabilidad de que ambas sean ${b.colores[0].pl}?`,
      fraccion(c0 * (c0 - 1), T * (T - 1)),
      [fraccion(c0 * c0, T * T), fraccion(c0 - 1, T - 1), fraccion(c0 * (c0 - 1), T * T)],
      { variante }
    );
  }
  if (variante === "condicional") {
    return opcFraccion(
      "prob_sin_reposicion",
      `${base} Si la primera fue ${b.colores[0].sg}, ¿cuál es la probabilidad de que la segunda también sea ${b.colores[0].sg}?`,
      fraccion(c0 - 1, T - 1),
      [fraccion(c0, T), fraccion(c0 - 1, T), fraccion(c0, T - 1)],
      { variante }
    );
  }
  return opcFraccion(
    "prob_sin_reposicion",
    `${base} ¿Cuál es la probabilidad de que la primera sea ${b.colores[0].sg} y la segunda ${b.colores[1].sg}?`,
    fraccion(c0 * c1, T * (T - 1)),
    [fraccion(c0 * c1, T * T), fraccion(c1, T - 1), fraccion(c0 * (c1 - 1), T * (T - 1))],
    { variante }
  );
}

function factorialDe(n: number): number {
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

function permutacionesDe(n: number, r: number): number {
  return factorialDe(n) / factorialDe(n - r);
}

function combinacionesDe(n: number, r: number): number {
  return factorialDe(n) / (factorialDe(r) * factorialDe(n - r));
}

function probFactorial(N: number): ProblemaEstadistica {
  const n = randomInt(3, N >= 7 ? 8 : 7);
  return num("probabilidad", "factorial", `Calcula ${n}! (${n} factorial).`, factorialDe(n));
}

function probPermutaciones(): ProblemaEstadistica {
  const n = randomInt(5, 9);
  const r = randomInt(2, 4);
  const ctx = elegir([
    `En una carrera compiten ${n} corredores. ¿De cuántas maneras distintas pueden repartirse los primeros ${r} puestos (el orden importa)?`,
    `Hay ${n} libros distintos y se quieren ordenar ${r} de ellos en un estante (el orden importa). ¿Cuántas ordenaciones distintas hay?`,
    `Un club tiene ${n} socios y debe elegir ${r} cargos distintos (el orden importa). ¿De cuántas maneras se pueden asignar?`,
  ]);
  return num("probabilidad", "permutaciones", ctx, permutacionesDe(n, r), { params: { n, r } });
}

function probCombinaciones(): ProblemaEstadistica {
  const n = randomInt(5, 10);
  const r = randomInt(2, Math.min(4, n - 2));
  const ctx = elegir([
    `De un grupo de ${n} personas se elige un comité de ${r} (el orden NO importa). ¿Cuántos comités distintos se pueden formar?`,
    `Una pizzería ofrece ${n} ingredientes y una pizza lleva ${r} distintos (el orden NO importa). ¿Cuántas pizzas diferentes se pueden armar?`,
    `De ${n} libros se eligen ${r} para llevarse de viaje (el orden NO importa). ¿De cuántas maneras se pueden elegir?`,
  ]);
  return num("probabilidad", "combinaciones", ctx, combinacionesDe(n, r), { params: { n, r } });
}

function probCombinatoria(): ProblemaEstadistica {
  const b = armarBolsa(2, 5);
  const T = b.total;
  const c0 = b.cuentas[0];
  const c1 = b.cuentas[1];
  const total2 = combinacionesDe(T, 2);
  const iguales = azar() < 0.5;
  const base = `${describirBolsa(b)} Se extraen 2 bolas a la vez.`;
  if (iguales) {
    return opcFraccion(
      "prob_combinatoria",
      `${base} ¿Cuál es la probabilidad de que las dos sean ${b.colores[0].pl}?`,
      fraccion(combinacionesDe(c0, 2), total2),
      [fraccion(c0 * c0, T * T), fraccion(c0 * (c0 - 1), T * T), fraccion(c0, T)],
      { variante: "iguales" }
    );
  }
  return opcFraccion(
    "prob_combinatoria",
    `${base} ¿Cuál es la probabilidad de que una sea ${b.colores[0].sg} y la otra ${b.colores[1].sg}?`,
    fraccion(c0 * c1, total2),
    [fraccion(c0 * c1, T * T), fraccion(c0, T), fraccion(c0 * c1, total2 * 2)],
    { variante: "mixtas" }
  );
}

function generarProbabilidad(nivel: number): ProblemaEstadistica {
  const N = bandaProbabilidad(nivel);
  const tipo = elegirPonderado(
    [
      ["simple", 4],
      ["dado", 4],
      ["complemento", 5],
      ["independientes", 5],
      ["condicional", 5],
      ["sinReposicion", 6],
      ["factorial", 6],
      ["permutaciones", 6],
      ["combinaciones", 7],
      ["combinatoria", 7],
    ] as const,
    N
  );
  if (tipo === "simple") return probSimple();
  if (tipo === "dado") return probDado();
  if (tipo === "complemento") return probComplemento();
  if (tipo === "independientes") return probIndependientes();
  if (tipo === "condicional") return probCondicionalTabla();
  if (tipo === "sinReposicion") return probSinReposicion();
  if (tipo === "factorial") return probFactorial(N);
  if (tipo === "permutaciones") return probPermutaciones();
  if (tipo === "combinaciones") return probCombinaciones();
  return probCombinatoria();
}

// ============================================================
// Modo 4: Análisis de datos (nivel 6-10)
// ============================================================

function bandaDatos(nivel: number): number {
  return clamp(nivel, 6, 10);
}

function distintos(n: number, min: number, max: number): number[] {
  return mezclar(Array.from({ length: max - min + 1 }, (_, i) => min + i)).slice(0, n);
}

const METODO_PERCENTIL = "Método del rango más cercano: el percentil P es el dato que ocupa la posición ⌈P·N/100⌉ del conjunto ordenado de menor a mayor";

function datosPercentil(): ProblemaEstadistica {
  const n = elegir([10, 20]);
  const datos = distintos(n, 10, 99);
  const p = elegir([10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]);
  const posicion = Math.floor((p * n + 99) / 100); // ⌈p·n/100⌉ en enteros
  return num(
    "datos",
    "percentil",
    `${METODO_PERCENTIL} (N = ${n}). ¿Cuál es el percentil ${p} de ${conjunto(datos)}?`,
    ordenar(datos)[posicion - 1],
    { params: { p, n } }
  );
}

function datosRangoPercentil(): ProblemaEstadistica {
  const n = elegir([10, 20, 25]);
  const datos = distintos(n, 10, 99);
  const x = elegir(datos);
  const menoresOIguales = datos.filter((d) => d <= x).length;
  return num(
    "datos",
    "rango_percentil",
    `En el conjunto ${conjunto(datos)} (N = ${n} datos), ¿qué porcentaje de los datos es menor o igual que ${x}?`,
    (menoresOIguales * 100) / n,
    { params: { x, n } }
  );
}

function datosZScore(): ProblemaEstadistica {
  for (;;) {
    const sigma = elegir([2, 4, 5, 10, 20, 25]);
    const mu = randomInt(40, 100);
    const dif = randomInt(-3 * sigma, 3 * sigma);
    if (dif === 0) continue;
    const z = dif / sigma;
    if (!tieneHasta2Decimales(z)) continue;
    const x = mu + dif;
    if (x < 0) continue;
    return num("datos", "z_score", `Un conjunto de datos tiene media μ = ${mu} y desvío estándar σ = ${sigma}. ¿Cuál es el puntaje z del valor x = ${x}? (z = (x − μ)/σ)`, z, { params: { mu, sigma, x } });
  }
}

function datosZInverso(): ProblemaEstadistica {
  const sigma = elegir([2, 4, 6, 8, 10]);
  const mu = randomInt(40, 100);
  const z = elegir([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5]);
  return num("datos", "z_inverso", `Un conjunto de datos tiene media μ = ${mu} y desvío estándar σ = ${sigma}. ¿Qué valor x tiene un puntaje z = ${z}? (x = μ + z·σ)`, mu + z * sigma, { params: { mu, sigma, z } });
}

function datosZComparar(): ProblemaEstadistica {
  for (;;) {
    const mu1 = randomInt(50, 80);
    const s1 = elegir([4, 5, 8, 10]);
    const mu2 = randomInt(50, 80);
    const s2 = elegir([4, 5, 6, 8, 10]);
    const x1 = mu1 + randomInt(-2, 3) * s1 + elegir([-1, 0, 1, 2]);
    const x2 = mu2 + randomInt(-2, 3) * s2 + elegir([-1, 0, 1, 2]);
    const z1 = (x1 - mu1) / s1;
    const z2 = (x2 - mu2) / s2;
    if (Math.abs(z1 - z2) < 1e-9 || x1 < 0 || x2 < 0) continue;
    const correcta = z1 > z2 ? "Matemática" : "Lengua";
    return opc(
      "datos",
      "z_comparar",
      `En Matemática (μ = ${mu1}, σ = ${s1}) un estudiante sacó ${x1}; en Lengua (μ = ${mu2}, σ = ${s2}) sacó ${x2}. Comparando los puntajes z, ¿en qué materia le fue relativamente mejor?`,
      correcta,
      [correcta === "Matemática" ? "Lengua" : "Matemática", "Le fue igual en ambas", "No se puede comparar"]
    );
  }
}

const TABLA_EMPIRICA: Record<number, number> = { 1: 68, 2: 95, 3: 99.7 };

function datosReglaEmpirica(): ProblemaEstadistica {
  const mu = elegir([50, 60, 70, 100, 120]);
  const sigma = elegir([5, 10, 15]);
  const k = randomInt(1, 3);
  const variante = elegir(["entre", "cola_derecha", "cola_izquierda"] as const);
  const centro = TABLA_EMPIRICA[k];
  let pct: number;
  let pregunta: string;
  if (variante === "entre") {
    pct = centro;
    pregunta = `¿qué porcentaje aproximado de los datos está entre ${mu - k * sigma} y ${mu + k * sigma}?`;
  } else if (variante === "cola_derecha") {
    pct = redondear2((100 - centro) / 2);
    pregunta = `¿qué porcentaje aproximado de los datos es mayor que ${mu + k * sigma}?`;
  } else {
    pct = redondear2((100 - centro) / 2);
    pregunta = `¿qué porcentaje aproximado de los datos es menor que ${mu - k * sigma}?`;
  }
  const correcta = `${fmt(pct)}%`;
  const pool = ["50%", "34%", "16%", "2.5%", "68%", "95%", "99.7%", "0.15%"];
  return opc(
    "datos",
    "regla_empirica",
    `Una variable tiene distribución normal con μ = ${mu} y σ = ${sigma}. Según la regla empírica (68% a ±1σ, 95% a ±2σ, 99.7% a ±3σ), ${pregunta}`,
    correcta,
    mezclar(pool.filter((p) => p !== correcta)).slice(0, 3),
    { mu, sigma, k, variante }
  );
}

const METODO_ATIPICOS =
  "Cuartiles por el método de las mitades (medianas de la mitad inferior y superior; con n impar la mediana no entra en ninguna mitad). Un dato es atípico si es menor que Q1 − 1.5·IQR o mayor que Q3 + 1.5·IQR (IQR = Q3 − Q1).";

function conjuntoConAtipicos(): { datos: number[]; q1: number; q3: number; inf: number; sup: number } {
  for (let t = 0; t < 400; t++) {
    const c = randomInt(25, 60);
    const s = randomInt(3, 8);
    const base = Array.from({ length: randomInt(7, 10) }, () => c + randomInt(-s, s));
    const k = elegir([0, 1, 1, 2]);
    const fuera = Array.from({ length: k }, () => c + (azar() < 0.5 ? 1 : -1) * (randomInt(4, 7) * s + randomInt(0, 5)));
    const datos = mezclar([...base, ...fuera]);
    if (datos.some((x) => x < 0)) continue;
    const { q1, q3 } = cuartilesMitades(datos);
    const iqr = q3 - q1;
    if (iqr === 0) continue;
    const inf = q1 - 1.5 * iqr;
    const sup = q3 + 1.5 * iqr;
    // Sin ambigüedad de borde: ningún dato justo sobre una cerca.
    if (datos.some((x) => x === inf || x === sup)) continue;
    return { datos, q1, q3, inf, sup };
  }
  const datos = [22, 24, 25, 26, 27, 28, 29, 30, 60];
  const { q1, q3 } = cuartilesMitades(datos);
  return { datos, q1, q3, inf: q1 - 1.5 * (q3 - q1), sup: q3 + 1.5 * (q3 - q1) };
}

function datosAtipicos(): ProblemaEstadistica {
  const { datos, inf, sup } = conjuntoConAtipicos();
  const atipicos = datos.filter((x) => x < inf || x > sup);
  const variante = elegir(["cantidad", "valor", "cerca"] as const);
  if (variante === "valor" && atipicos.length === 1) {
    return num("datos", "atipicos_valor", `${METODO_ATIPICOS} En ${conjunto(datos)} hay exactamente un valor atípico. ¿Cuál es?`, atipicos[0]);
  }
  if (variante === "cerca") {
    const arriba = azar() < 0.5;
    return num(
      "datos",
      "atipicos_cerca",
      `${METODO_ATIPICOS} Para ${conjunto(datos)}, ¿cuánto vale el límite ${arriba ? "superior (Q3 + 1.5·IQR)" : "inferior (Q1 − 1.5·IQR)"} de la regla de atípicos?`,
      arriba ? sup : inf,
      { params: { lado: arriba ? "superior" : "inferior" } }
    );
  }
  return num("datos", "atipicos_cantidad", `${METODO_ATIPICOS} ¿Cuántos valores atípicos hay en ${conjunto(datos)}?`, atipicos.length);
}

// x = x0..x0+4 (x̄ entero, Sxx = 10): pendiente = Sxy/10 y demás
// resultados quedan con <= 1-2 decimales exactos.
function xsDe(x0: number): number[] {
  return [0, 1, 2, 3, 4].map((i) => x0 + i);
}

function sxyDe(ys: readonly number[]): number {
  return ys.reduce((a, y, i) => a + (i - 2) * y, 0);
}

function datosCorrelacionSigno(): ProblemaEstadistica {
  const x0 = elegir([0, 1, 2, 5, 10]);
  let ys: number[];
  const cero = azar() < 0.2;
  if (cero) {
    // Simétrica: Sxy = 0 exacto (relación curva, sin correlación lineal).
    for (;;) {
      const [a, b, c] = enteros(3, 1, 12);
      ys = [a, b, c, b, a];
      if (new Set(ys).size > 1) break;
    }
  } else {
    for (;;) {
      ys = enteros(5, 1, 12);
      if (Math.abs(sxyDe(ys)) >= 4) break;
    }
  }
  const sxy = sxyDe(ys);
  const correcta = sxy > 0 ? "Positiva" : sxy < 0 ? "Negativa" : "Cero (no hay relación lineal)";
  return opc(
    "datos",
    "correlacion_signo",
    `Para los pares (x, y) con x = ${conjunto(xsDe(x0))} e y = ${conjunto(ys)}, ¿cómo es la correlación lineal entre x e y?`,
    correcta,
    ["Positiva", "Negativa", "Cero (no hay relación lineal)"].filter((o) => o !== correcta)
  );
}

function datosRegresion(): ProblemaEstadistica {
  const x0 = elegir([0, 1, 2, 5, 10]);
  const xs = xsDe(x0);
  const ys = enteros(5, 2, 20);
  const b = sxyDe(ys) / 10;
  const ymedia = suma(ys) / 5;
  const a = ymedia - b * (x0 + 2);
  const intro = `Para los pares (x, y) con x = ${conjunto(xs)} e y = ${conjunto(ys)}, la recta de mínimos cuadrados es ŷ = a + b·x.`;
  const variante = elegir(["pendiente", "intercepto", "prediccion"] as const);
  if (variante === "pendiente") return num("datos", "regresion_pendiente", `${intro} ¿Cuánto vale la pendiente b?`, b);
  if (variante === "intercepto") return num("datos", "regresion_intercepto", `${intro} ¿Cuánto vale el intercepto a?`, a);
  const xNuevo = x0 + randomInt(5, 7);
  return num("datos", "regresion_prediccion", `${intro} ¿Qué valor predice la recta (ŷ) para x = ${xNuevo}?`, a + b * xNuevo, { params: { xNuevo } });
}

let cacheYsR: number[][] | null = null;

// y (5 valores en 1..9) para los que r de Pearson con x = 1..5 (en
// cualquier desplazamiento) es NO nulo y exacto con <= 2 decimales:
// r = Sxy / √(2T) con T = 5·Σy² − (Σy)² y 2T cuadrado perfecto.
export function conjuntosYConRExacto(): number[][] {
  if (cacheYsR) return cacheYsR;
  const res: number[][] = [];
  for (let a = 1; a <= 9; a++)
    for (let b = 1; b <= 9; b++)
      for (let c = 1; c <= 9; c++)
        for (let d = 1; d <= 9; d++)
          for (let e = 1; e <= 9; e++) {
            const ys = [a, b, c, d, e];
            const s = suma(ys);
            const T = 5 * ys.reduce((acc, y) => acc + y * y, 0) - s * s;
            if (T <= 0) continue;
            const sxy = sxyDe(ys);
            if (sxy === 0) continue;
            const raiz = Math.round(Math.sqrt(2 * T));
            if (raiz * raiz !== 2 * T) continue;
            if (!tieneHasta2Decimales(sxy / raiz)) continue;
            res.push(ys);
          }
  cacheYsR = res;
  return res;
}

function datosCorrelacionR(): ProblemaEstadistica {
  const x0 = elegir([1, 2, 5, 10]);
  const ys = elegir(conjuntosYConRExacto());
  const T = 5 * ys.reduce((acc, y) => acc + y * y, 0) - suma(ys) ** 2;
  const r = sxyDe(ys) / Math.round(Math.sqrt(2 * T));
  return num("datos", "correlacion_r", `Para los pares (x, y) con x = ${conjunto(xsDe(x0))} e y = ${conjunto(ys)}, calcula el coeficiente de correlación de Pearson r.`, r);
}

function generarDatos(nivel: number): ProblemaEstadistica {
  const N = bandaDatos(nivel);
  const tipo = elegirPonderado(
    [
      ["percentil", 6],
      ["rangoPercentil", 6],
      ["z", 6],
      ["zInverso", 7],
      ["zComparar", 7],
      ["empirica", 7],
      ["atipicos", 8],
      ["correlacionSigno", 8],
      ["regresion", 9],
      ["correlacionR", 10],
    ] as const,
    N
  );
  if (tipo === "percentil") return datosPercentil();
  if (tipo === "rangoPercentil") return datosRangoPercentil();
  if (tipo === "z") return datosZScore();
  if (tipo === "zInverso") return datosZInverso();
  if (tipo === "zComparar") return datosZComparar();
  if (tipo === "empirica") return datosReglaEmpirica();
  if (tipo === "atipicos") return datosAtipicos();
  if (tipo === "correlacionSigno") return datosCorrelacionSigno();
  if (tipo === "regresion") return datosRegresion();
  return datosCorrelacionR();
}

// ============================================================
// Modo 5: Lectura de gráficos (nivel 5-9)
// ============================================================

function bandaGraficos(nivel: number): number {
  return clamp(nivel, 5, 9);
}

function generarGraficos(nivel: number): ProblemaEstadistica {
  const bruto = generarGrafico(bandaGraficos(nivel));
  return { modo: "graficos", ...bruto } as ProblemaEstadistica;
}

// ============================================================

export function generarProblemaEstadistica(modo: ModoEstadistica, nivel: number): ProblemaEstadistica {
  if (modo === "central") return generarCentral(nivel);
  if (modo === "dispersion") return generarDispersion(nivel);
  if (modo === "probabilidad") return generarProbabilidad(nivel);
  if (modo === "datos") return generarDatos(nivel);
  return generarGraficos(nivel);
}

// Clave para no repetir un problema dentro de una partida.
export function claveEstadistica(p: ProblemaEstadistica): string {
  const g = p.grafico ? JSON.stringify(p.grafico) : "";
  return `${p.enunciado}|${p.respuesta}|${g}`;
}

// ---------- Reto diario ----------

// Misma forma que preguntaCalculia de src/lib/retoDiario.ts (el reto
// enchufa esto en GENERADORES). El reto no dibuja gráficos, así que
// "graficos" queda afuera; los modos numéricos se convierten a opción
// múltiple con distractores numéricos cercanos generados con el mismo rng.
export interface PreguntaEstadisticaReto {
  mundo: "estadistica";
  enunciado: string;
  opciones: string[];
  respuesta: string;
}

const MODOS_ESTADISTICA_RETO: ModoEstadistica[] = ["central", "dispersion", "probabilidad", "datos"];

function opcionesNumericas(respuesta: number): string[] {
  const entero = Number.isInteger(respuesta);
  const paso = entero ? Math.max(1, Math.round(Math.abs(respuesta) * 0.15)) : 0.25 * Math.max(1, Math.round(Math.abs(respuesta) / 4));
  const correcta = fmt(respuesta);
  const vistos = new Set<string>([correcta]);
  const out: string[] = [];
  for (const k of mezclar([-3, -2, -1, 1, 2, 3, 4])) {
    const v = respuesta + k * paso;
    if (respuesta >= 0 && v < 0) continue;
    const s = fmt(v);
    if (vistos.has(s)) continue;
    vistos.add(s);
    out.push(s);
    if (out.length === 3) break;
  }
  return mezclar([correcta, ...out]);
}

export function preguntaEstadistica(rng: () => number): PreguntaEstadisticaReto {
  return conRngSembrado(rng, () => {
    const modo = elegir(MODOS_ESTADISTICA_RETO);
    const nivel = randomInt(3, 7);
    const p = generarProblemaEstadistica(modo, nivel);
    if (p.entrada === "opciones") return { mundo: "estadistica" as const, enunciado: p.enunciado, opciones: p.opciones, respuesta: p.respuesta };
    return { mundo: "estadistica" as const, enunciado: p.enunciado, opciones: opcionesNumericas(p.respuesta), respuesta: fmt(p.respuesta) };
  });
}
