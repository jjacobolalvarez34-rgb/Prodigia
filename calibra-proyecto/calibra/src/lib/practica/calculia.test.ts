import { describe, it, expect } from "vitest";
import katex from "katex";
import { generarProblemaCalculia, type ProblemaCalculia } from "./calculia";
import { textoPlano as sinMarcas } from "@/lib/texto/latexAPlano";

// Verificación "real, nunca aproximada" pedida para Calculia: para cada
// generador, no alcanza con revisar la FORMA de la respuesta (eso ya lo
// garantiza "correcta por construcción" en calculia.ts) — hay que
// cruzarla contra un método numérico INDEPENDIENTE que nunca reutiliza
// el camino de fórmulas del generador:
//   - Derivadas: diferencia central finita de la función f(x) literal
//     (reconstruida desde el propio enunciado, no desde variables
//     internas del generador) contra la fórmula de derivada reclamada.
//   - Integrales: Simpson sobre f(x) entre 2 puntos, comparado contra
//     F(x1)-F(x0) de la antiderivada reclamada.
//   - Series: suma parcial de muchos términos (convergencia numérica) y
//     el cálculo literal de |r|<1 / p>1 para las clasificaciones.
//   - Multivariable: mismo criterio de diferencia central que
//     Derivadas, variando solo la variable pedida y congelando la otra.
//   - EDO separable: se verifica que la solución reclamada satisface la
//     propia ecuación diferencial (dy/dx = k·xⁿ·y) por diferencia finita,
//     en vez de re-derivar por la tabla de antiderivadas.
//
// Los evaluadores de abajo son parsers/aritmética de cero, escritos a
// mano contra el formato de texto exacto que emite calculia.ts — nunca
// llaman a ninguna función interna del generador.
//
// Desde que calculia.ts emite LaTeX entre $...$ (para que MathText lo
// dibuje con KaTeX), estos parsers reciben el enunciado/respuesta a
// través de `sinMarcas` (= textoPlano de @/lib/texto/latexAPlano: quita
// los $ y pasa el LaTeX de vuelta a `x^3/3`, `R1`, `√3`...). La
// verificación numérica independiente es exactamente la misma; solo
// cambia el formato que se le muestra al parser. Un test aparte valida
// que TODA fórmula emitida compile en KaTeX.

const H = 1e-4;

function centralDiff(f: (x: number) => number, x: number, h = H): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

// Tolerancia RELATIVA (no de decimales fijos): las derivadas/integrales
// de este archivo abarcan varios órdenes de magnitud (desde constantes
// chicas hasta potencias de un factor lineal con exponente 5-6), así
// que un toBeCloseTo(…, 1) de decimales fijos sería demasiado estricto
// para los valores grandes y demasiado laxo para los chicos. 2% de
// tolerancia relativa (+ un piso absoluto chico para valores cerca de
// 0) es más que suficiente para diferencia central finita (h=1e-4) y
// Simpson (400 particiones) sobre las funciones lisas de este archivo.
function expectClose(actual: number, expected: number, relTol = 0.02) {
  const escala = Math.max(1, Math.abs(expected));
  const tolerancia = relTol * escala + 1e-2;
  expect(Math.abs(actual - expected), `esperaba ≈${expected}, llegó ${actual} (tolerancia ${tolerancia})`).toBeLessThanOrEqual(tolerancia);
}

// Regla de Simpson compuesta — de sobra para las funciones lisas que
// usa este archivo (polinomios, e^x, sen/cos, potencias de un lineal).
function simpson(f: (x: number) => number, a: number, b: number, n = 400): number {
  const pares = n % 2 === 0 ? n : n + 1;
  const h = (b - a) / pares;
  let suma = f(a) + f(b);
  for (let i = 1; i < pares; i++) {
    suma += f(a + i * h) * (i % 2 === 0 ? 2 : 4);
  }
  return (suma * h) / 3;
}

// ---------- Evaluadores de texto (independientes del generador) ----------

function evalMonoX(strBruto: string, x: number): number {
  const s = strBruto.trim();
  const mConst = /^(-?\d+)$/.exec(s);
  if (mConst) return Number(mConst[1]);
  const m = /^(-)?(\d+)?x(?:\^(\d+))?$/.exec(s);
  if (!m) throw new Error(`no pude parsear termino en x: "${s}"`);
  const signo = m[1] ? -1 : 1;
  const coef = m[2] ? Number(m[2]) : 1;
  const exp = m[3] ? Number(m[3]) : 1;
  return signo * coef * Math.pow(x, exp);
}

function stripMasC(str: string): string {
  return str.replace(/\s*\+\s*C$/, "").trim();
}

function evalShapeA(str: string, x: number): number {
  return evalMonoX(stripMasC(str), x);
}

function evalFactorLineal(inner: string, x: number): number {
  const m = /^(\d+)?x(?:\s*([+-])\s*(\d+))?$/.exec(inner.trim());
  if (!m) throw new Error(`no pude parsear factor lineal: "${inner}"`);
  const a = m[1] ? Number(m[1]) : 1;
  const signoB = m[2] === "-" ? -1 : 1;
  const b = m[3] ? signoB * Number(m[3]) : 0;
  return a * x + b;
}

function evalShapeB(strBruto: string, x: number): number {
  const str = stripMasC(strBruto);
  const m = /^(-)?(\d+)?\(([^)]+)\)(?:\^(\d+))?$/.exec(str);
  if (!m) throw new Error(`no pude parsear shapeB: "${str}"`);
  const signo = m[1] ? -1 : 1;
  const coef = m[2] ? Number(m[2]) : 1;
  const inner = evalFactorLineal(m[3], x);
  const exp = m[4] ? Number(m[4]) : 1;
  return signo * coef * Math.pow(inner, exp);
}

function evalLogShape(strBruto: string, x: number): number {
  const str = stripMasC(strBruto);
  const m = /^(\d+)?ln\|x\|$/.exec(str);
  if (!m) throw new Error(`no pude parsear log shape: "${str}"`);
  const coef = m[1] ? Number(m[1]) : 1;
  return coef * Math.log(Math.abs(x));
}

function evalExpShape(strBruto: string, x: number): number {
  const str = stripMasC(strBruto);
  let m = /^(\d+)\/(\d+)e\^(\d+)x$/.exec(str);
  if (m) return (Number(m[1]) / Number(m[2])) * Math.exp(Number(m[3]) * x);
  m = /^e\^(\d+)x$/.exec(str);
  if (m) return Math.exp(Number(m[1]) * x);
  throw new Error(`no pude parsear exp shape: "${str}"`);
}

function evalTrigShape(strBruto: string, x: number): number {
  const str = stripMasC(strBruto);
  const m = /^(-)?(\d+)?(sen|cos)\(x\)$/.exec(str);
  if (!m) throw new Error(`no pude parsear trig shape: "${str}"`);
  const signo = m[1] ? -1 : 1;
  const coef = m[2] ? Number(m[2]) : 1;
  const fn = m[3] === "sen" ? Math.sin : Math.cos;
  return signo * coef * fn(x);
}

// Suma de términos c·x^p·y^q (multivariable) — separador " + "/" - " a
// nivel de texto, nunca de árbol de expresión.
function evalPolyXY(exprBruto: string, x: number, y: number): number {
  const expr = exprBruto.trim();
  if (expr === "0") return 0;
  const normalizado = expr.replace(/ - /g, " + -");
  const terminos = normalizado.split(" + ").map((t) => t.trim());
  return terminos.reduce((acc, t) => acc + evalTerminoXY(t, x, y), 0);
}

function evalTerminoXY(str: string, x: number, y: number): number {
  const m = /^(-)?(\d+)?(x(?:\^(\d+))?)?(y(?:\^(\d+))?)?$/.exec(str);
  if (!m || (!m[3] && !m[5] && !m[2])) throw new Error(`no pude parsear termino xy: "${str}"`);
  const signo = m[1] ? -1 : 1;
  const coef = m[2] ? Number(m[2]) : 1;
  const expX = m[3] ? (m[4] ? Number(m[4]) : 1) : 0;
  const expY = m[5] ? (m[6] ? Number(m[6]) : 1) : 0;
  return signo * coef * Math.pow(x, expX) * Math.pow(y, expY);
}

function evalEdoShape(str: string): { coef: number; exp: number } {
  // y = Ae^(2x^3) / y = Ae^(-x^3) / y = Ae^(x^3)
  const m = /^y = Ae\^\((-?)(\d*)x\^(\d+)\)$/.exec(str.trim());
  if (!m) throw new Error(`no pude parsear edo shape: "${str}"`);
  return { coef: (m[1] ? -1 : 1) * (m[2] ? Number(m[2]) : 1), exp: Number(m[3]) };
}

// ---------- Invariantes comunes de toda pregunta de opción múltiple ----------

function chequearOpcionesValidas(p: ProblemaCalculia) {
  if (p.entrada !== "opciones") return;
  expect(p.opciones.length).toBeGreaterThanOrEqual(2);
  expect(new Set(p.opciones).size).toBe(p.opciones.length);
  expect(p.opciones).toContain(p.respuesta);
}

const ITERACIONES = 300;
const X_MUESTRAS = [0.6, 1.3, 2.1, -1.7, 3.4];

describe("Calculia — generarProblemaCalculia('derivadas', nivel)", () => {
  it(`${ITERACIONES} llamadas en niveles 1-10: opciones válidas + derivada verificada por diferencia central finita`, () => {
    for (let i = 0; i < ITERACIONES; i++) {
      const nivel = 1 + (i % 10);
      const p = generarProblemaCalculia("derivadas", nivel);
      chequearOpcionesValidas(p);
      expect(p.entrada).toBe("opciones");
      if (p.entrada !== "opciones") continue;
      const enunciado = sinMarcas(p.enunciado);
      const respuesta = sinMarcas(p.respuesta);

      let mm: RegExpExecArray | null;
      if ((mm = /^Deriva f\(x\) = \(([^)]+)\)\(([^)]+)\) respecto de x usando la regla del producto\.$/.exec(enunciado))) {
        const [, f1, f2] = mm;
        const f = (x: number) => evalMonoX(f1, x) * evalMonoX(f2, x);
        for (const x of X_MUESTRAS) {
          expectClose(evalShapeA(respuesta, x), centralDiff(f, x));
        }
      } else if ((mm = /^Deriva f\(x\) = ([^/ ]+)\/([^/ ]+) respecto de x usando la regla del cociente\.$/.exec(enunciado))) {
        const [, num, den] = mm;
        const f = (x: number) => evalMonoX(num, x) / evalMonoX(den, x);
        for (const x of [1.1, 1.7, 2.3]) {
          expectClose(evalShapeA(respuesta, x), centralDiff(f, x));
        }
      } else if ((mm = /^Deriva f\(x\) = \(([^)]+)\)\^(\d+) respecto de x usando la regla de la cadena\.$/.exec(enunciado))) {
        const [, inner] = mm;
        const f = (x: number) => Math.pow(evalFactorLineal(inner, x), Number(mm![2]));
        for (const x of X_MUESTRAS) {
          expectClose(evalShapeB(respuesta, x), centralDiff(f, x));
        }
      } else if ((mm = /^Deriva f\(x\) = (.+) respecto de x\.$/.exec(enunciado))) {
        const [, fTexto] = mm;
        const f = (x: number) => evalMonoX(fTexto, x);
        for (const x of X_MUESTRAS) {
          expectClose(evalShapeA(respuesta, x), centralDiff(f, x));
        }
      } else {
        throw new Error(`enunciado de derivadas sin patrón reconocido: "${enunciado}"`);
      }
    }
  });
});

describe("Calculia — generarProblemaCalculia('integrales', nivel)", () => {
  it(`${ITERACIONES} llamadas en niveles 1-10: opciones válidas + antiderivada verificada por Simpson`, () => {
    for (let i = 0; i < ITERACIONES; i++) {
      const nivel = 1 + (i % 10);
      const p = generarProblemaCalculia("integrales", nivel);
      chequearOpcionesValidas(p);
      expect(p.entrada).toBe("opciones");
      if (p.entrada !== "opciones") continue;
      const enunciado = sinMarcas(p.enunciado);
      const respuesta = sinMarcas(p.respuesta);

      let mm: RegExpExecArray | null;
      if ((mm = /^Calcula ∫ (.+) dx usando sustitución u = (.+)\.$/.exec(enunciado))) {
        const [, integrando] = mm;
        // El integrando de la sustitución simple siempre tiene forma
        // B (coef·(lineal)^n) — nunca forma A.
        const f = (x: number) => evalShapeB(integrando, x);
        const x0 = 0.3;
        const x1 = 1.6;
        const F = (x: number) => evalShapeB(respuesta, x);
        expectClose(F(x1) - F(x0), simpson(f, x0, x1));
      } else if ((mm = /^Calcula ∫ (\d+)\/x dx\.$/.exec(enunciado))) {
        const k = Number(mm[1]);
        const f = (x: number) => k / x;
        const x0 = 1.2;
        const x1 = 2.8;
        const F = (x: number) => evalLogShape(respuesta, x);
        expectClose(F(x1) - F(x0), simpson(f, x0, x1));
      } else if ((mm = /^Calcula ∫ e\^(\d+)x dx\.$/.exec(enunciado))) {
        const a = Number(mm[1]);
        const f = (x: number) => Math.exp(a * x);
        const x0 = 0.1;
        const x1 = 0.6;
        const F = (x: number) => evalExpShape(respuesta, x);
        expectClose(F(x1) - F(x0), simpson(f, x0, x1));
      } else if ((mm = /^Calcula ∫ (\d*)(cos|sen)\(x\) dx\.$/.exec(enunciado))) {
        const k = mm[1] ? Number(mm[1]) : 1;
        const fn = mm[2] === "cos" ? Math.cos : Math.sin;
        const f = (x: number) => k * fn(x);
        const x0 = 0.2;
        const x1 = 1.1;
        const F = (x: number) => evalTrigShape(respuesta, x);
        expectClose(F(x1) - F(x0), simpson(f, x0, x1));
      } else if ((mm = /^Calcula ∫ (.+) dx\.$/.exec(enunciado))) {
        const [, integrando] = mm;
        const f = (x: number) => evalMonoX(integrando, x);
        const x0 = 0.4;
        const x1 = 1.9;
        const F = (x: number) => evalShapeA(respuesta, x);
        expectClose(F(x1) - F(x0), simpson(f, x0, x1));
      } else {
        throw new Error(`enunciado de integrales sin patrón reconocido: "${enunciado}"`);
      }
    }
  });
});

describe("Calculia — generarProblemaCalculia('series', nivel)", () => {
  it(`${ITERACIONES} llamadas en niveles 1-10: sumas geométricas por convergencia numérica + clasificaciones por |r|<1 / p>1`, () => {
    for (let i = 0; i < ITERACIONES; i++) {
      const nivel = 1 + (i % 10);
      const p = generarProblemaCalculia("series", nivel);
      const enunciado = sinMarcas(p.enunciado);

      let mm: RegExpExecArray | null;
      if (
        (mm = /^Calcula la suma de la serie geométrica infinita con primer término a = (-?\d+) y razón r = (-?\d+)(?:\/(\d+))?\. Redondea a 2 decimales\.$/.exec(
          enunciado
        ))
      ) {
        expect(p.entrada).toBe("numero");
        if (p.entrada !== "numero") continue;
        const a = Number(mm[1]);
        const r = Number(mm[2]) / Number(mm[3] ?? 1);
        expect(Math.abs(r)).toBeLessThan(1);
        // Convergencia numérica: suma parcial de muchos términos, en vez
        // de reusar la fórmula a/(1-r) del generador.
        let sumaParcial = 0;
        let termino = a;
        for (let n = 0; n < 3000; n++) {
          sumaParcial += termino;
          termino *= r;
        }
        expect(p.respuesta).toBeCloseTo(sumaParcial, 1);
      } else if ((mm = /^¿La serie geométrica con razón r = (-?\d+)(?:\/(\d+))? converge o diverge\?$/.exec(enunciado))) {
        expect(p.entrada).toBe("opciones");
        if (p.entrada !== "opciones") continue;
        chequearOpcionesValidas(p);
        const r = Number(mm[1]) / Number(mm[2] ?? 1);
        expect(p.respuesta).toBe(Math.abs(r) < 1 ? "Converge" : "Diverge");
      } else if ((mm = /^¿La serie p, ∑ _\(n=1\)\^\(∞\) 1\/n\^(\d+(?:\.\d+)?), converge o diverge\?$/.exec(enunciado))) {
        expect(p.entrada).toBe("opciones");
        if (p.entrada !== "opciones") continue;
        chequearOpcionesValidas(p);
        const pExp = Number(mm[1]);
        expect(p.respuesta).toBe(pExp > 1 ? "Converge" : "Diverge");
      } else if (
        (mm = /^Para la sucesión a_n = (-?\d+)·\((-?\d+)\/(\d+)\)\^n, calcula el límite del criterio de la razón: lim_\(n→∞\) \|a_\(n\+1\)\/a_n\|\. Redondea a 2 decimales\.$/.exec(
          enunciado
        ))
      ) {
        expect(p.entrada).toBe("numero");
        if (p.entrada !== "numero") continue;
        const r = Number(mm[2]) / Number(mm[3]);
        expect(p.respuesta).toBeCloseTo(Math.abs(r), 2);
      } else {
        throw new Error(`enunciado de series sin patrón reconocido: "${enunciado}"`);
      }
    }
  });
});

describe("Calculia — generarProblemaCalculia('multivariable', nivel)", () => {
  it(`${ITERACIONES} llamadas en niveles 1-10: derivada parcial por diferencia central + EDO separable que satisface dy/dx=k·xⁿ·y`, () => {
    for (let i = 0; i < ITERACIONES; i++) {
      const nivel = 1 + (i % 10);
      const p = generarProblemaCalculia("multivariable", nivel);
      chequearOpcionesValidas(p);
      expect(p.entrada).toBe("opciones");
      if (p.entrada !== "opciones") continue;
      const enunciado = sinMarcas(p.enunciado);
      const respuesta = sinMarcas(p.respuesta);

      let mm: RegExpExecArray | null;
      if (
        (mm = /^Calcula ∂f\/∂(x|y) para f\(x, y\) = (.+) \(trata (x|y) como constante\)\.$/.exec(enunciado))
      ) {
        const variable = mm[1];
        const original = mm[2];
        for (const [x, y] of [
          [0.7, 1.3],
          [1.9, -0.6],
          [-1.1, 2.4],
        ]) {
          const f = (v: number) => (variable === "x" ? evalPolyXY(original, v, y) : evalPolyXY(original, x, v));
          const puntoActual = variable === "x" ? x : y;
          const derivadaNumerica = centralDiff(f, puntoActual);
          const derivadaReclamada = evalPolyXY(respuesta, x, y);
          expectClose(derivadaReclamada, derivadaNumerica);
        }
      } else if (
        (mm = /^Resuelve la EDO separable dy\/dx = (-?\d+)·x\^(\d+)·y \(deja la solución en términos de la constante A\)\. ¿Cuál es la solución general\?$/.exec(
          enunciado
        ))
      ) {
        const k = Number(mm[1]);
        const n = Number(mm[2]);
        const { coef, exp } = evalEdoShape(respuesta);
        // y = e^(coef * x^exp) (A=1) debe satisfacer dy/dx = k*x^n*y en
        // varios puntos, verificado por diferencia central — no se
        // reusa la tabla de antiderivadas del generador para nada.
        const y = (x: number) => Math.exp(coef * Math.pow(x, exp));
        for (const x of [0.4, 0.9, 1.3]) {
          const dydx = centralDiff(y, x);
          expectClose(dydx, k * Math.pow(x, n) * y(x));
        }
      } else {
        throw new Error(`enunciado de multivariable sin patrón reconocido: "${enunciado}"`);
      }
    }
  });
});

// ---------- Render: TODA fórmula emitida debe compilar en KaTeX ----------

const MODOS = ["derivadas", "integrales", "series", "multivariable"] as const;

function fragmentosMath(texto: string): string[] {
  return [...texto.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
}

describe("Calculia — formato $...$ (MathText/KaTeX)", () => {
  it("cada $...$ de enunciado, opciones y respuesta compila en KaTeX (throwOnError) — 100 pulls por modo y nivel", () => {
    // Cada expresión distinta se compila UNA vez (hay muchísimas repetidas);
    // los fallos se juntan y se afirman al final (un expect() por texto
    // haría el test 10 veces más lento sin verificar nada más).
    const yaCompiladas = new Set<string>();
    const fallos: string[] = [];
    for (const modo of MODOS) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 100; i++) {
          const p = generarProblemaCalculia(modo, nivel);
          const textos = p.entrada === "opciones" ? [p.enunciado, ...p.opciones] : [p.enunciado];
          for (const t of textos) {
            if ((t.match(/\$/g) ?? []).length % 2 !== 0) fallos.push(`$ sin cerrar en "${t}"`);
            for (const expr of fragmentosMath(t)) {
              if (yaCompiladas.has(expr)) continue;
              yaCompiladas.add(expr);
              try {
                katex.renderToString(expr, { throwOnError: true });
              } catch (e) {
                fallos.push(`KaTeX no compila "${expr}": ${(e as Error).message}`);
              }
            }
          }
        }
      }
    }
    expect(yaCompiladas.size).toBeGreaterThan(50);
    expect(fallos).toEqual([]);
  }, 60_000);

  it("fuera de $...$ no queda notación cruda (^, \\frac, ∫, ∂) en ningún enunciado ni opción", () => {
    for (const modo of MODOS) {
      for (let i = 0; i < 200; i++) {
        const p = generarProblemaCalculia(modo, 1 + (i % 10));
        const textos = p.entrada === "opciones" ? [p.enunciado, ...p.opciones] : [p.enunciado];
        for (const t of textos) {
          const fuera = t.replace(/\$[^$]+\$/g, "");
          expect(fuera, `notación cruda fuera de $ en "${t}"`).not.toMatch(/[\^∫∂∑√]|\\[a-z]|\d\/\d/);
        }
      }
    }
  });

  it("las respuestas de opción múltiple con matemática van completas entre $ (la opción ES la respuesta, mismo string)", () => {
    for (let i = 0; i < 200; i++) {
      const p = generarProblemaCalculia("derivadas", 1 + (i % 4));
      if (p.entrada !== "opciones") continue;
      expect(p.respuesta).toMatch(/^\$[^$]+\$$/);
      expect(p.opciones.filter((o) => o === p.respuesta)).toHaveLength(1);
    }
  });
});
