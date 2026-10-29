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

// FORMATO DE SALIDA (convención $...$ de MathText, ver
// docs/PLAN_REVISION_CONTENIDO.md): todo fragmento matemático de
// `enunciado` y de `opciones`/`respuesta` sale entre `$...$` con LaTeX
// real (`\frac{x^{3}}{3}`, `x^{2}`, `\int ... \,dx`). La respuesta y las
// opciones son el MISMO string (comparación por igualdad, con los `$`
// incluidos). Los runners lo dibujan con <MathText>; para aria-label o
// texto plano, `textoPlano()` de @/lib/texto/latexAPlano lo vuelve a
// `x^3/3`. Las respuestas NUMÉRICAS (input) no llevan marcas.

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
  // «Cómo se resuelve» (repaso de errores, 2026-10-18). Lleva $…$ como el enunciado.
  pasos?: string[];
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

// Envuelve una expresión LaTeX en la marca $...$ de MathText.
const m = (expr: string): string => `$${expr}$`;

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

// Igual que armarOpciones, pero para expresiones matemáticas: la
// deduplicación se hace sobre el LaTeX crudo y después se envuelve cada
// opción en $...$ (la `respuesta` sigue siendo EXACTAMENTE uno de los
// strings de `opciones`).
function opcionesMath(correcta: string, distractoresBrutos: string[]): { opciones: string[]; respuesta: string } {
  return { opciones: armarOpciones(correcta, distractoresBrutos).map(m), respuesta: m(correcta) };
}

// ---------- Formato de expresiones (nunca parseo, solo construcción) ----------

// Un solo término c·x^n (o c·y^n con otra variable), con el formato
// estándar de "coeficiente pegado a la variable" (1x^2 -> x^2, -1x -> -x).
function termino(coef: number, exp: number, variable = "x"): string {
  if (coef === 0) return "0";
  const abs = Math.abs(coef);
  const coefTexto = exp === 0 ? `${abs}` : abs === 1 ? "" : `${abs}`;
  const varTexto = exp === 0 ? "" : exp === 1 ? variable : `${variable}^{${exp}}`;
  const cuerpo = `${coefTexto}${varTexto}` || "1";
  return coef < 0 ? `-${cuerpo}` : cuerpo;
}

// Un término con DOS variables (para multivariable): c·x^p·y^q.
function termino2(coef: number, expX: number, expY: number): string {
  if (coef === 0) return "0";
  const abs = Math.abs(coef);
  const xTexto = expX === 0 ? "" : expX === 1 ? "x" : `x^{${expX}}`;
  const yTexto = expY === 0 ? "" : expY === 1 ? "y" : `y^{${expY}}`;
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
  return `${signo}${coefTexto}(${inner})^{${exp}}`;
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
    enunciado: `Deriva ${m(`f(x) = ${termino(c, n)}`)} respecto de ${m("x")}.`,
    ...opcionesMath(correcta, [noDecrementaExponente, noMultiplicaPorN]),
    pasos: [
      `Regla de la potencia: ${m("(c\\cdot x^{n})' = c\\cdot n\\cdot x^{n-1}")}`,
      `Baja el exponente y multiplícalo por el coeficiente: ${m(`${c}\\cdot ${n} = ${c * n}`)}`,
      `Al exponente réstale 1: ${m(`${n} - 1 = ${n - 1}`)}`,
      `Resultado: ${m(`f'(x) = ${correcta}`)}`,
    ],
  };
}

// Suma de términos (auditoría de variedad 2026-10-29: el nivel 1 solo tenía c·x^n,
// 24 preguntas en total). f(x) = c1·x^n1 + c2·x^n2 (+ k): se deriva término a término
// y la constante desaparece. Distractores reales: dejar la constante, no bajar los
// exponentes y no multiplicar por el exponente.
function derivadaSuma(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const n1 = randomInt(2, 2 + nivelEfectivo);
  const n2 = randomInt(1, n1 - 1);
  const c1 = randomIntNoCero(6);
  const c2 = randomIntNoCero(9);
  const k = randomInt(-9, 9);
  const f = unirTerminos([termino(c1, n1), termino(c2, n2), termino(k, 0)]);
  const derivados = [termino(c1 * n1, n1 - 1), termino(c2 * n2, n2 - 1)];
  const correcta = unirTerminos(derivados);
  const dejaConstante = unirTerminos([...derivados, termino(k === 0 ? 1 : k, 0)]);
  const noDecrementa = unirTerminos([termino(c1 * n1, n1), termino(c2 * n2, n2)]);
  const noMultiplica = unirTerminos([termino(c1, n1 - 1), termino(c2, n2 - 1)]);
  return {
    modo: "derivadas",
    entrada: "opciones",
    enunciado: `Deriva ${m(`f(x) = ${f}`)} respecto de ${m("x")}.`,
    ...opcionesMath(correcta, [dejaConstante, noDecrementa, noMultiplica]),
    pasos: [
      `La derivada de una suma es la suma de las derivadas; la de una constante es 0`,
      `${m(`(${termino(c1, n1)})' = ${derivados[0]}`)} y ${m(`(${termino(c2, n2)})' = ${derivados[1]}`)}`,
      `Resultado: ${m(`f'(x) = ${correcta}`)}`,
    ],
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
    enunciado: `Deriva ${m(`f(x) = (${termino(a, p)})(${termino(b, q)})`)} respecto de ${m("x")} usando la regla del producto.`,
    ...opcionesMath(correcta, [multiplicaDerivadas, olvidaSegundoTermino]),
    pasos: [
      `Regla del producto: ${m("(u\\cdot v)' = u'\\cdot v + u\\cdot v'")}`,
      `${m(`u = ${termino(a, p)},\\ u' = ${termino(a * p, p - 1)}`)} y ${m(`v = ${termino(b, q)},\\ v' = ${termino(b * q, q - 1)}`)}`,
      `${m(`u'\\cdot v = ${termino(a * p * b, p + q - 1)}`)} y ${m(`u\\cdot v' = ${termino(a * b * q, p + q - 1)}`)}`,
      `Suma los dos: ${m(`f'(x) = ${correcta}`)}`,
    ],
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
    enunciado: `Deriva ${m(`f(x) = \\frac{${termino(a, p)}}{${termino(b, q)}}`)} respecto de ${m("x")} usando la regla del cociente.`,
    ...opcionesMath(correcta, [signoInvertido, noDecrementaExponente]),
    pasos: [
      `Regla del cociente: ${m("\\left(\\frac{u}{v}\\right)' = \\frac{u'\\cdot v - u\\cdot v'}{v^{2}}")}. Aquí conviene simplificar antes (da lo mismo):`,
      `${m(`\\frac{${termino(a, p)}}{${termino(b, q)}} = ${termino(k, p - q)}`)} (divide coeficientes y resta exponentes)`,
      `Regla de la potencia: ${m(`(${termino(k, p - q)})' = ${correcta}`)}`,
    ],
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
    enunciado: `Deriva ${m(`f(x) = (${inner})^{${n}}`)} respecto de ${m("x")} usando la regla de la cadena.`,
    ...opcionesMath(correcta, [olvidaFactorInterno, noDecrementaExponente]),
    pasos: [
      `Regla de la cadena: deriva lo de afuera y multiplica por la derivada de lo de adentro`,
      `Afuera (potencia): ${m(potenciaDeFactor(n, inner, n - 1))}. Adentro: ${m(`(${inner})' = ${a}`)}`,
      `Multiplica: ${m(`${n}\\cdot ${a} = ${a * n}`)}, así que ${m(`f'(x) = ${correcta}`)}`,
    ],
  };
}

function generarDerivadas(nivel: number): ProblemaCalculiaOpciones {
  const nivelEfectivo = bandaDerivadasNivel(nivel);
  const tipos: Array<"potencia" | "suma" | "producto" | "cadena" | "cociente"> = ["potencia", "suma"];
  if (nivelEfectivo >= 2) tipos.push("producto", "cadena");
  if (nivelEfectivo >= 3) tipos.push("cociente");
  const tipo = tipos[randomInt(0, tipos.length - 1)];
  if (tipo === "potencia") return derivadaPotencia(nivelEfectivo);
  if (tipo === "suma") return derivadaSuma(nivelEfectivo);
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
    enunciado: `Calcula ${m(`\\int ${integrando}\\,dx`)}.`,
    ...opcionesMath(correcta, [copiaIntegrando, noIncrementaExponente]),
    pasos: [
      `Regla de la potencia al integrar: ${m("\\int c\\cdot x^{n}\\,dx = \\frac{c}{n+1}x^{n+1} + C")}`,
      `Sube el exponente: ${m(`${n} + 1 = ${n + 1}`)}`,
      `Divide el coeficiente por el nuevo exponente: ${m(`${c} \\div ${n + 1} = ${k}`)}`,
      `Resultado: ${m(correcta)}`,
    ],
  };
}

// ∫ k/x dx = k·ln|x| + C. Distractor real #1: copiar el integrando.
// Distractor real #2: olvidar el coeficiente k (dejar ln|x| suelto).
function integralLn(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const k = randomInt(2, 2 + nivelEfectivo);
  const kTexto = k === 1 ? "" : `${k}`;
  const correcta = `${kTexto}\\ln|x| + C`;
  const copiaIntegrando = `\\frac{${k}}{x} + C`;
  const olvidaCoeficiente = `\\ln|x| + C`;
  return {
    modo: "integrales",
    entrada: "opciones",
    enunciado: `Calcula ${m(`\\int \\frac{${k}}{x}\\,dx`)}.`,
    ...opcionesMath(correcta, [copiaIntegrando, olvidaCoeficiente]),
    pasos: [
      `${m("\\int \\frac{1}{x}\\,dx = \\ln|x| + C")} (porque la derivada de ${m("\\ln|x|")} es ${m("\\frac{1}{x}")})`,
      `La constante ${m(`${k}`)} sale afuera: ${m(correcta)}`,
    ],
  };
}

// ∫ e^(ax) dx = (1/a)e^(ax) + C. `a` siempre >= 2 para que el
// distractor "olvidó el factor 1/a" nunca coincida con la respuesta
// correcta (si a=1 ambas dirían lo mismo).
function integralExponencial(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const a = randomInt(2, 2 + nivelEfectivo);
  const correcta = `\\frac{1}{${a}}e^{${a}x} + C`;
  const olvidaFactor = `e^{${a}x} + C`;
  const copiaIntegrando = `e^{${a}x} + C`;
  return {
    modo: "integrales",
    entrada: "opciones",
    enunciado: `Calcula ${m(`\\int e^{${a}x}\\,dx`)}.`,
    // copiaIntegrando y olvidaFactor coinciden a propósito en este caso
    // (copiar el integrando ES el mismo error que olvidar 1/a cuando el
    // integrando ya viene sin coeficiente) — armarOpciones descarta el
    // duplicado solo, dejando 2 opciones reales en vez de 3.
    ...opcionesMath(correcta, [olvidaFactor, copiaIntegrando]),
    pasos: [
      `Al derivar ${m(`e^{${a}x}`)} sale un ${m(`${a}`)} de más (regla de la cadena). Al integrar hay que compensarlo dividiendo por ${m(`${a}`)}`,
      `${m("\\int e^{ax}\\,dx = \\frac{1}{a}e^{ax} + C")}, con ${m(`a = ${a}`)}: ${m(correcta)}`,
    ],
  };
}

// ∫ k·cos(x) dx = k·sen(x) + C · ∫ k·sen(x) dx = -k·cos(x) + C.
// Distractor real: error de signo (la confusión más común entre las 2
// reglas). Segundo distractor: copiar el integrando.
// "sen" (notación en español, la misma que usa Trigonometría) como
// operador de KaTeX — \sin mostraría "sin".
const SEN = "\\operatorname{sen}";

function integralTrig(nivelEfectivo: number): ProblemaCalculiaOpciones {
  const k = randomInt(1, 1 + nivelEfectivo);
  const kTexto = k === 1 ? "" : `${k}`;
  const esCoseno = rngActual() < 0.5;
  if (esCoseno) {
    const correcta = `${kTexto}${SEN}(x) + C`;
    const errorDeSigno = `-${kTexto}${SEN}(x) + C`;
    const copiaIntegrando = `${kTexto}\\cos(x) + C`;
    return {
      modo: "integrales",
      entrada: "opciones",
      enunciado: `Calcula ${m(`\\int ${kTexto}\\cos(x)\\,dx`)}.`,
      ...opcionesMath(correcta, [errorDeSigno, copiaIntegrando]),
      pasos: [`${m(`\\int \\cos(x)\\,dx = ${SEN}(x) + C`)}, porque ${m(`(${SEN}(x))' = \\cos(x)`)}`, `La constante sale afuera: ${m(correcta)}`],
    };
  }
  const correcta = `-${kTexto}\\cos(x) + C`;
  const errorDeSigno = `${kTexto}\\cos(x) + C`;
  const copiaIntegrando = `${kTexto}${SEN}(x) + C`;
  return {
    modo: "integrales",
    entrada: "opciones",
    enunciado: `Calcula ${m(`\\int ${kTexto}${SEN}(x)\\,dx`)}.`,
    ...opcionesMath(correcta, [errorDeSigno, copiaIntegrando]),
    pasos: [`${m(`\\int ${SEN}(x)\\,dx = -\\cos(x) + C`)}, porque ${m(`(-\\cos(x))' = ${SEN}(x)`)} (ojo con el signo)`, `La constante sale afuera: ${m(correcta)}`],
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
    enunciado: `Calcula ${m(`\\int ${integrando}\\,dx`)} usando sustitución ${m(`u = ${inner}`)}.`,
    ...opcionesMath(correcta, [olvidaFactor1SobreA, noIncrementaExponente]),
    pasos: [
      `${m(`u = ${inner}`)}, entonces ${m(`du = ${a}\\,dx`)}, o sea ${m(`dx = \\frac{du}{${a}}`)}`,
      `La integral queda ${m(`\\int ${integrandoCoef}u^{${n}}\\cdot\\frac{du}{${a}} = \\int ${integrandoCoef / a}u^{${n}}\\,du`)}`,
      `Potencia: ${m(`${integrandoCoef / a}\\cdot\\frac{u^{${n + 1}}}{${n + 1}} = ${termino(k, n + 1, "u")}`)}`,
      `Vuelve a ${m("x")}: ${m(correcta)}`,
    ],
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

// LaTeX de la razón: -\frac{3}{4} (o el entero solo cuando el
// denominador es 1, nunca "\frac{3}{1}").
function formatoRazon(num: number, den: number): string {
  const abs = den === 1 ? `${Math.abs(num)}` : `\\frac{${Math.abs(num)}}{${den}}`;
  return num < 0 ? `-${abs}` : abs;
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
    enunciado: `Calcula la suma de la serie geométrica infinita con primer término ${m(`a = ${a}`)} y razón ${m(`r = ${formatoRazon(num, den)}`)}. Redondea a 2 decimales.`,
    respuesta: suma,
    tolerancia: 0.02,
    pasos: [
      `Si ${m("|r| < 1")}, la serie geométrica suma ${m("S = \\frac{a}{1 - r}")}`,
      `${m(`1 - r = 1 - \\left(${formatoRazon(num, den)}\\right) = \\frac{${den - num}}{${den}}`)}`,
      `${m(`S = ${a} \\div \\frac{${den - num}}{${den}} = \\frac{${a * den}}{${den - num}} \\approx ${suma}`)}`,
    ],
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
    enunciado: `¿La serie geométrica con razón ${m(`r = ${formatoRazon(signo * num, den)}`)} converge o diverge?`,
    opciones: mezclar(["Converge", "Diverge"]),
    respuesta,
    pasos: [
      `Una serie geométrica converge solo si ${m("|r| < 1")}`,
      `${m(`|r| = \\frac{${num}}{${den}} = ${redondear2(Math.abs(r))}`)}: ${converge ? "es menor que 1, converge" : "no es menor que 1, diverge"}`,
    ],
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
    enunciado: `¿La serie p, ${m(`\\sum_{n=1}^{\\infty} \\frac{1}{n^{${p}}}`)}, converge o diverge?`,
    opciones: mezclar(["Converge", "Diverge"]),
    respuesta,
    pasos: [`La serie ${m("\\sum \\frac{1}{n^{p}}")} converge solo si ${m("p > 1")}`, `Aquí ${m(`p = ${p}`)}: ${converge ? "es mayor que 1, converge" : p === 1 ? "es la serie armónica (p = 1), diverge" : "es menor que 1, diverge"}`],
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
    enunciado: `Para la sucesión ${m(`a_{n} = ${c}\\cdot\\left(${formatoRazon(num, den)}\\right)^{n}`)}, calcula el límite del criterio de la razón: ${m("\\lim_{n\\to\\infty} \\left|\\frac{a_{n+1}}{a_{n}}\\right|")}. Redondea a 2 decimales.`,
    respuesta: redondear2(Math.abs(r)),
    tolerancia: 0.01,
    pasos: [
      `${m(`\\frac{a_{n+1}}{a_{n}} = \\frac{${c}\\cdot r^{n+1}}{${c}\\cdot r^{n}} = r`)}: el ${m(`${c}`)} y las potencias se cancelan`,
      `El límite es ${m(`|r| = \\left|${formatoRazon(num, den)}\\right| = ${redondear2(Math.abs(r))}`)}`,
    ],
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
    enunciado: `Calcula ${m(`\\frac{\\partial f}{\\partial ${variable}}`)} para ${m(`f(x, y) = ${original}`)} (trata ${m(otraVariable)} como constante).`,
    ...opcionesMath(correcta, [derivaAmbasVariables, olvidaOtraVariable]),
    pasos: [
      `${m(otraVariable)} es una constante: deriva cada término solo en ${m(variable)}, con la regla de la potencia`,
      ...terminos.map((t, i) => `${m(termino2(t.coef, t.expX, t.expY))} → ${m(termino2(derivados[i].coef, derivados[i].expX, derivados[i].expY))}${(respectoDeX ? t.expX : t.expY) === 0 ? ` (no tiene ${variable}: es constante)` : ""}`),
      `Resultado: ${m(`\\frac{\\partial f}{\\partial ${variable}} = ${correcta}`)}`,
    ],
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
  const m1 = randomIntNoCero(4);
  const k = m1 * (n + 1);
  const coefM = m1 === 1 ? "" : m1 === -1 ? "-" : `${m1}`;
  const correcta = `y = Ae^{${coefM}x^{${n + 1}}}`;
  const olvidaDividirPorNMas1 = `y = Ae^{${k}x^{${n + 1}}}`;
  const noIncrementaExponente = `y = Ae^{${coefM}x^{${n}}}`;
  return {
    modo: "multivariable",
    entrada: "opciones",
    enunciado: `Resuelve la EDO separable ${m(`\\frac{dy}{dx} = ${k}\\cdot x^{${n}}\\cdot y`)} (deja la solución en términos de la constante ${m("A")}). ¿Cuál es la solución general?`,
    ...opcionesMath(correcta, [olvidaDividirPorNMas1, noIncrementaExponente]),
    pasos: [
      `Separa variables: ${m(`\\frac{dy}{y} = ${k}x^{${n}}\\,dx`)}`,
      `Integra los dos lados: ${m(`\\ln|y| = \\frac{${k}}{${n + 1}}x^{${n + 1}} + C = ${coefM === "-" ? "-" : coefM}x^{${n + 1}} + C`)}`,
      `Despeja ${m("y")}: ${m(correcta)} (con ${m("A = e^{C}")})`,
    ],
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
