// Mundo Calculia — 4 modos de dificultad creciente (nivel 1-10 vía
// skill_levels, igual que el resto de los mundos): derivadas (potencia,
// producto, cociente, cadena), integrales (potencia, 1/x, exponencial,
// seno/coseno, sustitución simple), series (suma geométrica,
// convergencia, criterio de la razón) y multivariable/EDOs (derivada
// parcial, EDO separable de primer orden). Sin semilla compartida entre
// rivales de duelo — mismo criterio que Enigmia/Geografía/Anatomía/
// Melodía/Trigonometría/Historia (Numeria y Quimia son la excepción con
// semilla, no la regla, ver src/lib/duelos/rutas.ts).
//
// REGLA DURA de todo este archivo: nunca se parsea ni simplifica una
// expresión simbólica libre — no existe ningún motor simbólico en este
// codebase (ver trigonometria.ts, que documenta la misma restricción) y
// esto no la introduce. Cada generador CONSTRUYE una función chica a
// partir de coeficientes enteros conocidos, calcula la respuesta
// correcta de forma FORMULAICA a partir de esa misma construcción
// (correcta por construcción, nunca por parseo) y arma 2-3 distractores
// a partir de errores reales conocidos (olvidar el factor interno de la
// regla de la cadena, olvidar decrementar el exponente, derivar la
// variable "constante" en una derivada parcial, omitir el factor 1/a en
// una sustitución).

export type ModoCalculia = "derivadas" | "integrales" | "series" | "multivariable";

export const NOMBRE_MODO_CALCULIA: Record<ModoCalculia, string> = {
  derivadas: "Derivadas",
  integrales: "Integrales",
  series: "Series",
  multivariable: "Multivariable y EDOs",
};

interface ProblemaCalculiaBase {
  modo: ModoCalculia;
  enunciado: string;
}

export interface ProblemaCalculiaOpciones extends ProblemaCalculiaBase {
  entrada: "opciones";
  opciones: string[];
  respuesta: string;
}

export interface ProblemaCalculiaNumero extends ProblemaCalculiaBase {
  entrada: "numero";
  respuesta: number;
  tolerancia: number;
}

export type ProblemaCalculia = ProblemaCalculiaOpciones | ProblemaCalculiaNumero;

// Mismo patrón que trigonometria.ts/melodia.ts: una referencia mutable
// a nivel de módulo que conRngSembrado() reemplaza temporalmente
// durante la llamada, en vez de pasar un `rng` explícito por parámetro
// a cada función interna (que reescribiría toda la firma, ver quimia.ts
// para el otro estilo — Calculia sigue la convención de la mayoría, no
// la de Numeria/Quimia).
let rngActual: () => number = Math.random;

export function conRngSembrado<T>(rng: () => number, fn: () => T): T {
  const anterior = rngActual;
  rngActual = rng;
  try {
    return fn();
  } finally {
    rngActual = anterior;
  }
}

function randomInt(min: number, max: number): number {
  return Math.floor(rngActual() * (max - min + 1)) + min;
}

// Entero distinto de 0 en [-max, max] (coeficientes y constantes nunca
// pueden ser 0 — un c=0 volvería trivial o indefinida la construcción).
function randomIntNoCero(max: number): number {
  let n = 0;
  while (n === 0) n = randomInt(-max, max);
  return n;
}

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rngActual() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Arma las opciones finales: la correcta + los distractores brutos,
// descartando cualquier distractor que por construcción haya coincidido
// con la correcta (o entre sí) — no debería pasar casi nunca dado cómo
// se elige cada parámetro, pero es una red de seguridad barata contra
// una MCQ con 2 respuestas "correctas" iguales en texto.
function armarOpciones(correcta: string, distractoresBrutos: string[]): string[] {
  const vistos = new Set<string>([correcta]);
  const distractores: string[] = [];
  for (const d of distractoresBrutos) {
    if (!vistos.has(d)) {
      vistos.add(d);
      distractores.push(d);
    }
  }
  return mezclar([correcta, ...distractores]);
}

// ---------- Formato de expresiones (nunca parseo, solo construcción) ----------

// Un solo término c·x^n (o c·y^n con otra variable), con el formato
// estándar de "coeficiente pegado a la variable" (1x^2 -> x^2, -1x -> -x).
function termino(coef: number, exp: number, variable = "x"): string {
  if (coef === 0) return "0";
  const abs = Math.abs(coef);
  const coefTexto = exp === 0 ? `${abs}` : abs === 1 ? "" : `${abs}`;
  const varTexto = exp === 0 ? "" : exp === 1 ? variable : `${variable}^${exp}`;
  const cuerpo = `${coefTexto}${varTexto}` || "1";
  return coef < 0 ? `-${cuerpo}` : cuerpo;
}

// Un término con DOS variables (para multivariable): c·x^p·y^q.
function termino2(coef: number, expX: number, expY: number): string {
  if (coef === 0) return "0";
  const abs = Math.abs(coef);
  const xTexto = expX === 0 ? "" : expX === 1 ? "x" : `x^${expX}`;
  const yTexto = expY === 0 ? "" : expY === 1 ? "y" : `y^${expY}`;
  const varsTexto = `${xTexto}${yTexto}`;
  const coefTexto = varsTexto === "" ? `${abs}` : abs === 1 ? "" : `${abs}`;
  const cuerpo = `${coefTexto}${varsTexto}` || "1";
  return coef < 0 ? `-${cuerpo}` : cuerpo;
}

// Suma de términos ya formateados (filtra ceros, arma signos "a - b"
// en vez de "a + -b").
function unirTerminos(terminos: string[]): string {
  const noCero = terminos.filter((t) => t !== "0");
  if (noCero.length === 0) return "0";
  return noCero
    .map((t, i) => {
      if (i === 0) return t;
      return t.startsWith("-") ? ` - ${t.slice(1)}` : ` + ${t}`;
    })
    .join("");
}

// "ax + b" / "ax - b" / "ax" (b=0) — el factor interno de la regla de
// la cadena y de la sustitución simple. `a` siempre >= 2 en las
// llamadas de este archivo (ver comentario en cadaGeneradorDeCadena)
// para que el distractor "olvidó el factor interno" nunca coincida por
// accidente con la respuesta correcta.
function factorLineal(a: number, b: number): string {
  const coef = a === 1 ? "x" : `${a}x`;
  if (b === 0) return coef;
  return b > 0 ? `${coef} + ${b}` : `${coef} - ${Math.abs(b)}`;
}

// coef·(inner)^exp, con los casos borde de exp=1 (sin exponente
// visible) — usado por la regla de la cadena y por la sustitución
// simple de integrales.
function potenciaDeFactor(coef: number, inner: string, exp: number): string {
  const abs = Math.abs(coef);
  const coefTexto = abs === 1 ? "" : `${abs}`;
  const signo = coef < 0 ? "-" : "";
  if (exp === 1) return `${signo}${coefTexto}(${inner})`;
  return `${signo}${coefTexto}(${inner})^${exp}`;
}

function redondear2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------- Bandas de dificultad (clamps por modo) ----------
// Primera convención propia de Calculia: los 4 modos tienen techos
// autorales deliberadamente asimétricos (Derivadas 1-4, Integrales 3-6,
// Series 5-8, Multivariable/EDOs 7-10) aunque skill_levels sigue yendo
// de 1 a 10 por modo, SIN cambio de esquema — el nivel real calibrado
// puede subir hasta 10 en cualquier modo, pero cada `bandaXNivel()`
// abajo satura (clampea piso Y techo) ese nivel bruto a su propio rango
// autoral antes de decidir la dificultad de la construcción, exactamente
// como bandaCirculoMaxGrados() en trigonometria.ts (que también clampea
// un techo derivado del nivel, no el nivel en sí). Esto NO es un
// candado entre modos — cualquiera de los 4 se puede elegir desde el
// día uno vía /calculia/elegir, igual que Trigonometría/Historia.
function bandaDerivadasNivel(nivel: number): number {
  return Math.min(4, Math.max(1, nivel));
}
function bandaIntegralesNivel(nivel: number): number {
  return Math.min(6, Math.max(3, nivel));
}
function bandaSeriesNivel(nivel: number): number {
  return Math.min(8, Math.max(5, nivel));
}
function bandaMultivariableNivel(nivel: number): number {
  return Math.min(10, Math.max(7, nivel));
}

// ============================================================
// Modo 1: Derivadas
// ============================================================

// Potencia: f(x) = c·x^n -> f'(x) = c·n·x^(n-1). Los 2 distractores son
// los 2 errores reales más comunes de la regla de la potencia: no
// decrementar el exponente, y no multiplicar por el exponente.
function derivadaPotencia(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const maxN = 2 + nivelEfectivo; // nivel 1 -> hasta x^3, nivel 4 -> hasta x^6
  const c = randomIntNoCero(6);
  const n = randomInt(2, maxN);
  const correcta = termino(c * n, n - 1);
  const noDecrementaExponente = termino(c * n, n);
  const noMultiplicaPorN = termino(c, n - 1);
  return {
    modo: "derivadas",
    entrada: "opciones",
    enunciado: `Deriva f(x) = ${termino(c, n)} respecto de x.`,
    opciones: armarOpciones(correcta, [noDecrementaExponente, noMultiplicaPorN]),
    respuesta: correcta,
  };
}

// Producto de 2 monomios chicos: f(x) = (a·x^p)(b·x^q). Se resuelve por
// regla del producto, pero el resultado correcto coincide (por
// construcción matemática real, no por atajo) con aplicar la potencia
// al monomio ya combinado ab·x^(p+q) -> f'(x) = ab(p+q)x^(p+q-1).
// Distractor real #1: multiplicar las 2 derivadas entre sí en vez de
// usar la regla del producto (ap·x^(p-1))·(bq·x^(q-1)). Distractor
// real #2: quedarse solo con el primer término de la suma de la regla
// del producto (olvidar sumar el segundo).
function derivadaProducto(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const a = randomIntNoCero(5);
  const b = randomIntNoCero(4);
  const p = randomInt(1, 2 + nivelEfectivo);
  const q = randomInt(1, 2 + nivelEfectivo);
  const correcta = termino(a * b * (p + q), p + q - 1);
  const multiplicaDerivadas = termino(a * p * b * q, p + q - 2);
  const olvidaSegundoTermino = termino(a * b * p, p + q - 1);
  return {
    modo: "derivadas",
    entrada: "opciones",
    enunciado: `Deriva f(x) = (${termino(a, p)})(${termino(b, q)}) respecto de x usando la regla del producto.`,
    opciones: armarOpciones(correcta, [multiplicaDerivadas, olvidaSegundoTermino]),
    respuesta: correcta,
  };
}

// Cociente de 2 monomios donde a es múltiplo de b para que el cociente
// k=a/b sea entero: f(x) = (a·x^p)/(b·x^q) = k·x^(p-q). El resultado
// correcto de la regla del cociente coincide (matemáticamente real)
// con aplicar la potencia a ese cociente ya simplificado: k(p-q)x^(p-q-1).
// Distractor real #1: invertir el orden de la resta del numerador de la
// regla del cociente (bajo'·alto - alto'·bajo en vez de alto'·bajo -
// alto·bajo'), que da el resultado con el signo invertido. Distractor
// real #2: no decrementar el exponente final.
function derivadaCociente(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const b = randomInt(1, 4);
  const k = randomIntNoCero(5);
  const a = k * b;
  const q = randomInt(1, 2);
  const p = q + randomInt(1, 1 + nivelEfectivo);
  const correcta = termino(k * (p - q), p - q - 1);
  const signoInvertido = termino(-k * (p - q), p - q - 1);
  const noDecrementaExponente = termino(k * (p - q), p - q);
  return {
    modo: "derivadas",
    entrada: "opciones",
    enunciado: `Deriva f(x) = (${termino(a, p)}) / (${termino(b, q)}) respecto de x usando la regla del cociente.`,
    opciones: armarOpciones(correcta, [signoInvertido, noDecrementaExponente]),
    respuesta: correcta,
  };
}

// Cadena sobre (ax+b)^n: f'(x) = a·n·(ax+b)^(n-1). `a` siempre >= 2
// (nunca 1) para que el distractor "olvidó el factor interno" (que usa
// coeficiente n en vez de a·n) nunca coincida por accidente con la
// respuesta correcta cuando a=1.
function derivadaCadena(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const a = randomInt(2, 2 + nivelEfectivo);
  const b = randomIntNoCero(6);
  const n = randomInt(2, 2 + nivelEfectivo);
  const inner = factorLineal(a, b);
  const correcta = potenciaDeFactor(a * n, inner, n - 1);
  const olvidaFactorInterno = potenciaDeFactor(n, inner, n - 1);
  const noDecrementaExponente = potenciaDeFactor(a * n, inner, n);
  return {
    modo: "derivadas",
    entrada: "opciones",
    enunciado: `Deriva f(x) = (${inner})^${n} respecto de x usando la regla de la cadena.`,
    opciones: armarOpciones(correcta, [olvidaFactorInterno, noDecrementaExponente]),
    respuesta: correcta,
  };
}

function generarDerivadas(nivel: number): ProblemaCalculiaOpciones {
  const nivelEfectivo = bandaDerivadasNivel(nivel);
  const tipos: Array<"potencia" | "producto" | "cadena" | "cociente"> = ["potencia"];
  if (nivelEfectivo >= 2) tipos.push("producto", "cadena");
  if (nivelEfectivo >= 3) tipos.push("cociente");
  const tipo = tipos[randomInt(0, tipos.length - 1)];
  if (tipo === "potencia") return derivadaPotencia(nivelEfectivo);
  if (tipo === "producto") return derivadaProducto(nivelEfectivo);
  if (tipo === "cociente") return derivadaCociente(nivelEfectivo);
  return derivadaCadena(nivelEfectivo);
}

// ============================================================
// Modo 2: Integrales
// ============================================================

// Antiderivada de la potencia: se elige c múltiplo de (n+1) para que
// c/(n+1) sea siempre un entero limpio (nunca una fracción aproximada).
// Distractor real #1: copiar el integrando tal cual, como si ya fuera
// la respuesta (no integrar). Distractor real #2: no incrementar el
// exponente al integrar (deja x^n en vez de x^(n+1)).
function integralPotencia(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const n = randomInt(1, 1 + nivelEfectivo);
  const k = randomIntNoCero(5);
  const c = k * (n + 1);
  const integrando = termino(c, n);
  const correcta = `${termino(k, n + 1)} + C`;
  const copiaIntegrando = `${integrando} + C`;
  const noIncrementaExponente = `${termino(k, n)} + C`;
  return {
    modo: "integrales",
    entrada: "opciones",
    enunciado: `Calcula ∫ ${integrando} dx.`,
    opciones: armarOpciones(correcta, [copiaIntegrando, noIncrementaExponente]),
    respuesta: correcta,
  };
}

// ∫ k/x dx = k·ln|x| + C. Distractor real #1: copiar el integrando.
// Distractor real #2: olvidar el coeficiente k (dejar ln|x| suelto).
function integralLn(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const k = randomInt(2, 2 + nivelEfectivo);
  const kTexto = k === 1 ? "" : `${k}`;
  const correcta = `${kTexto}ln|x| + C`;
  const copiaIntegrando = `${k}/x + C`;
  const olvidaCoeficiente = `ln|x| + C`;
  return {
    modo: "integrales",
    entrada: "opciones",
    enunciado: `Calcula ∫ ${k}/x dx.`,
    opciones: armarOpciones(correcta, [copiaIntegrando, olvidaCoeficiente]),
    respuesta: correcta,
  };
}

// ∫ e^(ax) dx = (1/a)e^(ax) + C. `a` siempre >= 2 para que el
// distractor "olvidó el factor 1/a" nunca coincida con la respuesta
// correcta (si a=1 ambas dirían lo mismo).
function integralExponencial(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const a = randomInt(2, 2 + nivelEfectivo);
  const correcta = `(1/${a})e^${a}x + C`;
  const olvidaFactor = `e^${a}x + C`;
  const copiaIntegrando = `e^${a}x + C`;
  return {
    modo: "integrales",
    entrada: "opciones",
    enunciado: `Calcula ∫ e^${a}x dx.`,
    // copiaIntegrando y olvidaFactor coinciden a propósito en este caso
    // (copiar el integrando ES el mismo error que olvidar 1/a cuando el
    // integrando ya viene sin coeficiente) — armarOpciones descarta el
    // duplicado solo, dejando 2 opciones reales en vez de 3.
    opciones: armarOpciones(correcta, [olvidaFactor, copiaIntegrando]),
    respuesta: correcta,
  };
}

// ∫ k·cos(x) dx = k·sen(x) + C · ∫ k·sen(x) dx = -k·cos(x) + C.
// Distractor real: error de signo (la confusión más común entre las 2
// reglas). Segundo distractor: copiar el integrando.
function integralTrig(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const k = randomInt(1, 1 + nivelEfectivo);
  const kTexto = k === 1 ? "" : `${k}`;
  const esCoseno = rngActual() < 0.5;
  if (esCoseno) {
    const correcta = `${kTexto}sen(x) + C`;
    const errorDeSigno = `-${kTexto}sen(x) + C`;
    const copiaIntegrando = `${kTexto}cos(x) + C`;
    return {
      modo: "integrales",
      entrada: "opciones",
      enunciado: `Calcula ∫ ${kTexto}cos(x) dx.`,
      opciones: armarOpciones(correcta, [errorDeSigno, copiaIntegrando]),
      respuesta: correcta,
    };
  }
  const correcta = `-${kTexto}cos(x) + C`;
  const errorDeSigno = `${kTexto}cos(x) + C`;
  const copiaIntegrando = `${kTexto}sen(x) + C`;
  return {
    modo: "integrales",
    entrada: "opciones",
    enunciado: `Calcula ∫ ${kTexto}sen(x) dx.`,
    opciones: armarOpciones(correcta, [errorDeSigno, copiaIntegrando]),
    respuesta: correcta,
  };
}

// Sustitución simple u = ax+b sobre ∫(ax+b)^n dx = (1/(a(n+1)))(ax+b)^(n+1) + C.
// Se elige el coeficiente M = a·(n+1)·k (k entero) para que el
// integrando completo sea M·(ax+b)^n y la antiderivada correcta sea
// exactamente k·(ax+b)^(n+1) — siempre un entero limpio, nunca una
// fracción aproximada. Distractor real: omitir el factor 1/a (queda
// a·k en vez de k, "olvidó dividir por la derivada interna"). Segundo
// distractor: no incrementar el exponente.
function integralSustitucionSimple(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const a = randomInt(2, 2 + nivelEfectivo);
  const b = randomIntNoCero(6);
  const n = randomInt(1, 1 + nivelEfectivo);
  const k = randomIntNoCero(4);
  const inner = factorLineal(a, b);
  const integrandoCoef = a * (n + 1) * k;
  const integrando = potenciaDeFactor(integrandoCoef, inner, n);
  const correcta = `${potenciaDeFactor(k, inner, n + 1)} + C`;
  const olvidaFactor1SobreA = `${potenciaDeFactor(a * k, inner, n + 1)} + C`;
  const noIncrementaExponente = `${potenciaDeFactor(k, inner, n)} + C`;
  return {
    modo: "integrales",
    entrada: "opciones",
    enunciado: `Calcula ∫ ${integrando} dx usando sustitución u = ${inner}.`,
    opciones: armarOpciones(correcta, [olvidaFactor1SobreA, noIncrementaExponente]),
    respuesta: correcta,
  };
}

function generarIntegrales(nivel: number): ProblemaCalculiaOpciones {
  const nivelEfectivo = bandaIntegralesNivel(nivel);
  const tipos: Array<"potencia" | "ln" | "exponencial" | "trig" | "sustitucion"> = ["potencia", "ln"];
  if (nivelEfectivo >= 4) tipos.push("exponencial", "trig");
  if (nivelEfectivo >= 5) tipos.push("sustitucion");
  const tipo = tipos[randomInt(0, tipos.length - 1)];
  if (tipo === "potencia") return integralPotencia(nivelEfectivo);
  if (tipo === "ln") return integralLn(nivelEfectivo);
  if (tipo === "exponencial") return integralExponencial(nivelEfectivo);
  if (tipo === "trig") return integralTrig(nivelEfectivo);
  return integralSustitucionSimple(nivelEfectivo);
}

// ============================================================
// Modo 3: Series
// ============================================================

// Fracciones simples con |r|<1 garantizado por construcción (nunca un
// valor hardcodeado sin verificar) — el banco solo limita las
// combinaciones num/den que se prueban, la condición |r|<1 la impone
// el propio banco (todas las entradas cumplen num<den).
const FRACCIONES_RAZON: [number, number][] = [
  [1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [1, 5], [2, 5], [3, 5],
];

function razonAlAzar(): { num: number; den: number; valor: number } {
  const [num, den] = FRACCIONES_RAZON[randomInt(0, FRACCIONES_RAZON.length - 1)];
  const signo = rngActual() < 0.5 ? 1 : -1;
  return { num: signo * num, den, valor: (signo * num) / den };
}

function formatoRazon(num: number, den: number): string {
  return num < 0 ? `-${Math.abs(num)}/${den}` : `${num}/${den}`;
}

// Suma de una serie geométrica infinita: S = a/(1-r), con |r|<1
// garantizado por el banco de fracciones de arriba. Entrada numérica
// con tolerancia (no es una expresión, es un número real y limpio).
function seriesSumaGeometrica(): ProblemaCalculiaNumero {
  const a = randomIntNoCero(10);
  const { num, den, valor: r } = razonAlAzar();
  const suma = redondear2(a / (1 - r));
  return {
    modo: "series",
    entrada: "numero",
    enunciado: `Calcula la suma de la serie geométrica infinita con primer término a = ${a} y razón r = ${formatoRazon(num, den)}. Redondea a 2 decimales.`,
    respuesta: suma,
    tolerancia: 0.02,
  };
}

// Clasificación de convergencia — el booleano SIEMPRE se calcula en
// código a partir de |r|<1 o p>1, nunca se hardcodea por pregunta.
function seriesClasificarGeometrica(): ProblemaCalculiaOpciones {
  // Rango más amplio que el de la suma (incluye |r|>=1 a propósito,
  // para que "diverge" sea una respuesta real y no solo teórica).
  const num = randomInt(1, 5);
  const den = randomInt(1, 5);
  const signo = rngActual() < 0.5 ? 1 : -1;
  const r = (signo * num) / den;
  const converge = Math.abs(r) < 1;
  const respuesta = converge ? "Converge" : "Diverge";
  return {
    modo: "series",
    entrada: "opciones",
    enunciado: `¿La serie geométrica con razón r = ${formatoRazon(signo * num, den)} converge o diverge?`,
    opciones: mezclar(["Converge", "Diverge"]),
    respuesta,
  };
}

function seriesClasificarP(): ProblemaCalculiaOpciones {
  const pCandidatos = [0.5, 1, 1.5, 2, 3];
  const p = pCandidatos[randomInt(0, pCandidatos.length - 1)];
  const converge = p > 1;
  const respuesta = converge ? "Converge" : "Diverge";
  return {
    modo: "series",
    entrada: "opciones",
    enunciado: `¿La serie p, ∑ 1/n^${p}, converge o diverge?`,
    opciones: mezclar(["Converge", "Diverge"]),
    respuesta,
  };
}

// Criterio de la razón restringido a sucesiones cerradas aₙ = c·rⁿ,
// donde el límite del criterio (lim |a_(n+1)/a_n|) es literalmente |r|
// — nunca un límite general (no existe un motor de límites en este
// codebase). Entrada numérica.
function seriesCriterioDeLaRazon(): ProblemaCalculiaNumero {
  const c = randomIntNoCero(8);
  const { num, den, valor: r } = razonAlAzar();
  return {
    modo: "series",
    entrada: "numero",
    enunciado: `Para la sucesión aₙ = ${c}·(${formatoRazon(num, den)})^n, calcula el límite del criterio de la razón: lim_(n→∞) |a_(n+1)/a_n|. Redondea a 2 decimales.`,
    respuesta: redondear2(Math.abs(r)),
    tolerancia: 0.01,
  };
}

function generarSeries(nivel: number): ProblemaCalculia {
  const nivelEfectivo = bandaSeriesNivel(nivel);
  const tipos: Array<"suma" | "clasificarGeometrica" | "clasificarP" | "razon"> = [
    "suma",
    "clasificarGeometrica",
    "clasificarP",
  ];
  if (nivelEfectivo >= 8) tipos.push("razon");
  const tipo = tipos[randomInt(0, tipos.length - 1)];
  if (tipo === "suma") return seriesSumaGeometrica();
  if (tipo === "clasificarGeometrica") return seriesClasificarGeometrica();
  if (tipo === "clasificarP") return seriesClasificarP();
  return seriesCriterioDeLaRazon();
}

// ============================================================
// Modo 4: Multivariable y EDOs
// ============================================================

interface MonomioXY {
  coef: number;
  expX: number;
  expY: number;
}

function polinomioXYAlAzar(nivelEfectivo: number, cantidad: number): MonomioXY[] {
  const maxExp = Math.min(3, nivelEfectivo - 6);
  const terminos: MonomioXY[] = [];
  for (let i = 0; i < cantidad; i++) {
    const coef = randomIntNoCero(6);
    // El primer término SIEMPRE lleva las 2 variables con exponente >= 1
    // — garantiza que la pregunta nunca sea degenerada (∂f/∂x = 0 para
    // TODAS las opciones a la vez cuando, por azar, ningún término
    // tenía la variable pedida). Los demás términos siguen siendo
    // libres (0 o más), incluido el caso "solo una variable".
    if (i === 0) {
      terminos.push({ coef, expX: randomInt(1, Math.max(1, maxExp)), expY: randomInt(1, Math.max(1, maxExp)) });
      continue;
    }
    const expX = randomInt(0, maxExp);
    const expY = randomInt(0, maxExp);
    // Se descartan monomios constantes (expX=expY=0): su derivada
    // parcial es siempre 0 y no aportan nada a la pregunta.
    if (expX === 0 && expY === 0) {
      terminos.push({ coef, expX: 1, expY: 0 });
    } else {
      terminos.push({ coef, expX, expY });
    }
  }
  return terminos;
}

// Derivada parcial de un polinomio de 2 variables construido a partir
// de monomios chicos de coeficiente entero, usando exactamente la misma
// lógica de regla de la potencia término a término que Derivadas,
// tratando la otra variable como constante. Distractor real: derivar
// las DOS variables a la vez (olvidar que una queda fija).
function multivariableParcial(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const terminos = polinomioXYAlAzar(nivelEfectivo, 2 + (rngActual() < 0.5 ? 0 : 1));
  const respectoDeX = rngActual() < 0.5;

  const original = unirTerminos(terminos.map((t) => termino2(t.coef, t.expX, t.expY)));

  const derivados = terminos.map((t) => {
    const exp = respectoDeX ? t.expX : t.expY;
    if (exp === 0) return { coef: 0, expX: 0, expY: 0 };
    const nuevoCoef = t.coef * exp;
    return respectoDeX
      ? { coef: nuevoCoef, expX: t.expX - 1, expY: t.expY }
      : { coef: nuevoCoef, expX: t.expX, expY: t.expY - 1 };
  });
  const correcta = unirTerminos(derivados.map((d) => termino2(d.coef, d.expX, d.expY)));

  // Distractor: deriva las 2 variables a la vez (multiplica por AMBOS
  // exponentes y decrementa los DOS), ignorando cuál se pidió.
  const derivadosMalos = terminos.map((t) => {
    if (t.expX === 0 || t.expY === 0) return { coef: 0, expX: 0, expY: 0 };
    return { coef: t.coef * t.expX * t.expY, expX: t.expX - 1, expY: t.expY - 1 };
  });
  const derivaAmbasVariables = unirTerminos(derivadosMalos.map((d) => termino2(d.coef, d.expX, d.expY)));

  // Segundo distractor: deriva la variable pedida bien, pero se "come"
  // la potencia de la otra variable en el resultado (como si tratar la
  // otra variable como constante significara que desaparece del todo,
  // en vez de quedarse multiplicando sin cambios).
  const derivadosSinOtraVariable = terminos.map((t) => {
    const exp = respectoDeX ? t.expX : t.expY;
    if (exp === 0) return { coef: 0, expX: 0, expY: 0 };
    const nuevoCoef = t.coef * exp;
    return respectoDeX
      ? { coef: nuevoCoef, expX: t.expX - 1, expY: 0 }
      : { coef: nuevoCoef, expX: 0, expY: t.expY - 1 };
  });
  const olvidaOtraVariable = unirTerminos(derivadosSinOtraVariable.map((d) => termino2(d.coef, d.expX, d.expY)));

  const variable = respectoDeX ? "x" : "y";
  const otraVariable = respectoDeX ? "y" : "x";
  return {
    modo: "multivariable",
    entrada: "opciones",
    enunciado: `Calcula ∂f/∂${variable} para f(x, y) = ${original} (trata ${otraVariable} como constante).`,
    opciones: armarOpciones(correcta, [derivaAmbasVariables, olvidaOtraVariable]),
    respuesta: correcta,
  };
}

// EDO separable de primer orden dy/dx = k·xⁿ·y, resuelta separando
// variables: dy/y = k·xⁿ dx -> ln|y| = (k/(n+1))x^(n+1) + C1 -> y =
// A·e^(m·x^(n+1)), usando la MISMA tabla de antiderivadas de potencia
// que integralPotencia() de arriba (nunca un solver simbólico general).
// Se elige k = m·(n+1) para que m sea siempre entero. Distractor real:
// olvidar dividir por (n+1) al integrar xⁿ (deja el exponente m·(n+1)
// en el exponencial en vez de m). Segundo distractor: no incrementar
// el exponente de x dentro del exponencial.
function multivariableEdoSeparable(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const n = randomInt(1, 1 + (nivelEfectivo - 9) * 2 + 1);
  const m = randomIntNoCero(4);
  const k = m * (n + 1);
  const correcta = `y = A·e^${m === 1 ? "" : m}x^${n + 1}`;
  const olvidaDividirPorNMas1 = `y = A·e^${k === 1 ? "" : k}x^${n + 1}`;
  const noIncrementaExponente = `y = A·e^${m === 1 ? "" : m}x^${n}`;
  return {
    modo: "multivariable",
    entrada: "opciones",
    enunciado: `Resuelve la EDO separable dy/dx = ${k}·x^${n}·y (deja la solución en términos de la constante A). ¿Cuál es la solución general?`,
    opciones: armarOpciones(correcta, [olvidaDividirPorNMas1, noIncrementaExponente]),
    respuesta: correcta,
  };
}

function generarMultivariable(nivel: number): ProblemaCalculiaOpciones {
  const nivelEfectivo = bandaMultivariableNivel(nivel);
  if (nivelEfectivo >= 9 && rngActual() < 0.4) return multivariableEdoSeparable(nivelEfectivo);
  return multivariableParcial(nivelEfectivo);
}

export function generarProblemaCalculia(modo: ModoCalculia, nivel: number): ProblemaCalculia {
  if (modo === "derivadas") return generarDerivadas(nivel);
  if (modo === "integrales") return generarIntegrales(nivel);
  if (modo === "series") return generarSeries(nivel);
  return generarMultivariable(nivel);
}
