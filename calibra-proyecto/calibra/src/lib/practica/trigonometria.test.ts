import { describe, it, expect, vi } from "vitest";
import katex from "katex";
import { mulberry32 } from "@/lib/rng";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import {
  ESCALA_TRIGONOMETRIA,
  GENERADORES_TRIGONOMETRIA,
  activosEnNivel,
  conRngSembrado,
  firmaDeNivel,
  generarProblemaTrigonometria,
  generarProblemaTrigonometriaDetallado,
  type ModoTrigonometria,
  type ProblemaTrigonometria,
} from "./trigonometria";
import { EQUIVALENCIAS } from "@/lib/trigonometria/identidades";
import { formatoLado, formatoAngulo, calcularVertices } from "@/components/trigonometria/TrianguloSVG";

// Auditoría y verificación de la práctica de Trigonometría (rediseño fase 1):
//  - la escala de dificultad declarativa (tabla tipo -> niveles y pesos) cubre 1-10
//    en cada modo, cambia de nivel en nivel y todos sus tipos salen de verdad;
//  - determinismo con conRngSembrado (Reto Diario);
//  - cada problema es coherente: el enunciado y el dibujo dicen lo mismo y la
//    respuesta coincide con un cálculo INDEPENDIENTE que se rehace desde el texto
//    del enunciado (ley del seno, coordenadas, tablas de Math.*, etc.);
//  - las opciones no repiten valores ni ofrecen dos respuestas válidas.
//
// Errores de datos que tenía la práctica vieja y que estos tests impiden que vuelvan
// (ver docs/PARIDAD_MUNDOS.md, "Trigonometría: rediseño del mundo (fase 1)"):
//  1. el dibujo de las razones mostraba el ángulo A redondeado a entero (el de 3-4-5 salía
//     37°, cuando mide 36,87°): quien lo usaba en la calculadora obtenía otro resultado
//     (con 20-21-29, tan 44° = 0,966 contra 0,952: fuera de la tolerancia de 0,01);
//  2. la ley del coseno sacaba el ángulo A con asin, que confunde un ángulo obtuso con su
//     suplementario: con a=15, b=4, C=30° el dibujo mostraba A=40° (real: 140°);
//  3. la tolerancia de las leyes era el 1% del resultado (hasta 0,3) sin relación con el redondeo pedido (2 decimales);
//  4. el círculo pedía tan(90°) = «indefinido» ya en el nivel 1;
//  5. "leyes" ignoraba el nivel, "razones" no cambiaba desde el nivel 3 y el círculo solo
//     subía por cuadrantes.

const MODOS: ModoTrigonometria[] = ["razones", "circulo", "identidades", "leyes"];
const NIVELES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const MODOS_OPCIONES = new Set<ModoTrigonometria>(["circulo", "identidades"]);

// ---------- una calculadora mínima de LaTeX (para verificar las opciones) ----------
function evalTex(fuente: string): number {
  const s = fuente
    .replace(/\s+/g, "")
    .replace(/\\left|\\right|\\,/g, "")
    .replace(/\\dfrac/g, "\\frac")
    .replace(/\^\{\\circ\}/g, "");
  let i = 0;
  const numero = (): number => {
    const m = /^\d+(?:\{,\}\d+)?(?:\.\d+)?/.exec(s.slice(i));
    if (!m) throw new Error(`Número esperado en «${s}» posición ${i}`);
    i += m[0].length;
    return Number(m[0].replace("{,}", "."));
  };
  const expr = (): number => {
    let v = term();
    while (i < s.length && (s[i] === "+" || s[i] === "-")) {
      const op = s[i++];
      const t = term();
      v = op === "+" ? v + t : v - t;
    }
    return v;
  };
  const term = (): number => {
    let v = factor();
    while (i < s.length && s[i] !== "+" && s[i] !== "-" && s[i] !== "}" && s[i] !== ")") v *= factor();
    return v;
  };
  const factor = (): number => {
    if (s[i] === "-") {
      i++;
      return -factor();
    }
    if (s.startsWith("\\sqrt{", i)) {
      i += 6;
      const v = expr();
      i++;
      return Math.sqrt(v);
    }
    if (s.startsWith("\\frac{", i)) {
      i += 6;
      const n = expr();
      i += 2; // "}{"
      const d = expr();
      i++;
      return n / d;
    }
    if (s.startsWith("\\pi", i)) {
      i += 3;
      return Math.PI;
    }
    if (s[i] === "(") {
      i++;
      const v = expr();
      i++;
      return v;
    }
    return numero();
  };
  const r = expr();
  if (i !== s.length) throw new Error(`Sobró texto en «${s}» desde ${i}`);
  return r;
}

const sinDolar = (t: string): string => t.replace(/^\$|\$$/g, "");

describe("calculadora de LaTeX del test", () => {
  it("evalúa el subconjunto que usan las opciones", () => {
    expect(evalTex("\\frac{\\sqrt{3}}{2}")).toBeCloseTo(0.8660254, 6);
    expect(evalTex("-\\frac{\\sqrt{6}-\\sqrt{2}}{4}")).toBeCloseTo(-0.258819, 6);
    expect(evalTex("2+\\sqrt{3}")).toBeCloseTo(3.7320508, 6);
    expect(evalTex("\\frac{5\\pi}{6}")).toBeCloseTo((5 * Math.PI) / 6, 9);
    expect(evalTex("52{,}5^{\\circ}")).toBe(52.5);
    expect(evalTex("-\\frac{3\\sqrt{10}}{20}")).toBeCloseTo(-0.4743416, 6);
    expect(evalTex("\\sqrt{3}")).toBeCloseTo(1.7320508, 6);
    expect(evalTex("2(60)")).toBe(120);
  });
});

// ---------- escala de dificultad ----------
describe("escala de dificultad declarativa", () => {
  it("cada modo cubre los niveles 1 a 10 sin huecos y todos los pesos son positivos o cero", () => {
    for (const modo of MODOS) {
      for (const nivel of NIVELES) expect(activosEnNivel(modo, nivel).length, `${modo} N${nivel}`).toBeGreaterThan(0);
      for (const t of ESCALA_TRIGONOMETRIA[modo]) {
        expect(t.desde, `${modo}/${t.tipo}`).toBeGreaterThanOrEqual(1);
        expect(t.desde + t.pesos.length - 1, `${modo}/${t.tipo}`).toBeLessThanOrEqual(10);
        expect(t.pesos.every((p) => p > 0), `${modo}/${t.tipo}: peso cero dentro del rango`).toBe(true);
        expect(t.conceptos.length, `${modo}/${t.tipo}`).toBeGreaterThan(0);
        expect(t.descripcion.length, `${modo}/${t.tipo}`).toBeGreaterThan(10);
      }
    }
  });

  it("NINGÚN modo tiene niveles planos: la huella (tipos, pesos y parámetros) cambia en cada nivel", () => {
    for (const modo of MODOS) {
      for (const nivel of NIVELES.slice(1)) {
        expect(firmaDeNivel(modo, nivel), `${modo}: el nivel ${nivel} es igual al ${nivel - 1}`).not.toBe(firmaDeNivel(modo, nivel - 1));
      }
    }
  });

  it("y el conjunto de TIPOS cambia en cada banda de dos niveles (1-2, 3-4, 5-6, 7-8, 9-10)", () => {
    const banda = (modo: ModoTrigonometria, k: number): string =>
      [...new Set([...activosEnNivel(modo, 2 * k - 1), ...activosEnNivel(modo, 2 * k)].map((a) => a.tipo))].sort().join(",");
    for (const modo of MODOS) {
      for (let k = 2; k <= 5; k++) expect(banda(modo, k), `${modo}: banda ${k} igual a la ${k - 1}`).not.toBe(banda(modo, k - 1));
      // y un tipo nuevo entra al menos en cada banda (algo que no había en la anterior)
      for (let k = 2; k <= 5; k++) {
        const previa = new Set(banda(modo, k - 1).split(","));
        const nuevos = banda(modo, k).split(",").filter((t) => !previa.has(t));
        expect(nuevos.length, `${modo}: la banda ${k} no trae ningún tipo nuevo`).toBeGreaterThan(0);
      }
    }
  });

  it("el nivel 10 es más difícil que el 1: comparten como máximo un tipo y el 10 no repite los del 1", () => {
    for (const modo of MODOS) {
      const t1 = new Set(activosEnNivel(modo, 1).map((a) => a.tipo));
      const t10 = activosEnNivel(modo, 10).map((a) => a.tipo);
      expect(t10.filter((t) => t1.has(t)), modo).toEqual([]);
    }
  });

  it("todo tipo declarado tiene generador y no sobra ningún generador", () => {
    for (const modo of MODOS) {
      const declarados = ESCALA_TRIGONOMETRIA[modo].map((t) => t.tipo).sort();
      expect(Object.keys(GENERADORES_TRIGONOMETRIA[modo]).sort(), modo).toEqual(declarados);
      expect(new Set(declarados).size, `${modo}: tipos repetidos`).toBe(declarados.length);
    }
  });

  it("en cada nivel salen TODOS los tipos activos y NUNCA uno inactivo (muestreo de 700 problemas por nivel)", () => {
    for (const modo of MODOS) {
      for (const nivel of NIVELES) {
        const activos = new Set(activosEnNivel(modo, nivel).map((a) => a.tipo));
        const vistos = new Set<string>();
        for (let i = 0; i < 700; i++) {
          const { tipo, problema } = generarProblemaTrigonometriaDetallado(modo, nivel);
          expect(activos.has(tipo), `${modo} N${nivel}: salió «${tipo}», que no está activo`).toBe(true);
          expect(problema.modo, `${modo}/${tipo}`).toBe(modo);
          vistos.add(tipo);
        }
        expect([...vistos].sort(), `${modo} N${nivel}`).toEqual([...activos].sort());
      }
    }
  }, 120_000);

  it("modo y entrada: razones y leyes piden un número; círculo e identidades, opciones (en TODOS los niveles)", () => {
    for (const modo of MODOS) {
      for (const nivel of NIVELES) {
        for (let i = 0; i < 80; i++) {
          const p = generarProblemaTrigonometria(modo, nivel);
          expect(p.entrada, `${modo} N${nivel}`).toBe(MODOS_OPCIONES.has(modo) ? "opciones" : "numero");
        }
      }
    }
  });

  it("un nivel fuera de 1-10 (o decimal) se acota sin romper", () => {
    for (const modo of MODOS) {
      expect(generarProblemaTrigonometria(modo, 0).modo).toBe(modo);
      expect(generarProblemaTrigonometria(modo, 99).modo).toBe(modo);
      expect(generarProblemaTrigonometria(modo, 4.6).modo).toBe(modo);
    }
  });
});

// ---------- determinismo ----------
describe("determinismo con conRngSembrado (Reto Diario)", () => {
  it("la misma semilla da EXACTAMENTE las mismas preguntas, en todos los modos y niveles", () => {
    for (const modo of MODOS) {
      for (const nivel of NIVELES) {
        const generar = (semilla: number) => conRngSembrado(mulberry32(semilla), () => Array.from({ length: 25 }, () => generarProblemaTrigonometria(modo, nivel)));
        expect(JSON.stringify(generar(12345)), `${modo} N${nivel}`).toBe(JSON.stringify(generar(12345)));
        expect(JSON.stringify(generar(12345)), `${modo} N${nivel}`).not.toBe(JSON.stringify(generar(54321)));
      }
    }
  });

  it("con semilla NO se usa Math.random (ni se altera el estado del azar de afuera)", () => {
    const espia = vi.spyOn(Math, "random");
    for (const modo of MODOS) for (const nivel of NIVELES) conRngSembrado(mulberry32(7), () => generarProblemaTrigonometria(modo, nivel));
    expect(espia).not.toHaveBeenCalled();
    espia.mockRestore();
  });

  it("afuera de conRngSembrado vuelve a Math.random, incluso si la función sembrada lanza", () => {
    expect(() =>
      conRngSembrado(mulberry32(1), () => {
        throw new Error("x");
      })
    ).toThrow("x");
    const espia = vi.spyOn(Math, "random");
    generarProblemaTrigonometria("razones", 1);
    expect(espia).toHaveBeenCalled();
    espia.mockRestore();
  });

  it("dos rivales con semillas distintas ven preguntas distintas (variedad suficiente)", () => {
    for (const modo of MODOS) {
      for (const nivel of NIVELES) {
        const claves = new Set<string>();
        for (let i = 0; i < 200; i++) claves.add(generarProblemaTrigonometria(modo, nivel).enunciado);
        expect(claves.size, `${modo} N${nivel}: pocas variantes`).toBeGreaterThanOrEqual(nivel <= 2 ? 6 : 10);
      }
    }
  });
});

// ---------- coherencia general de cada problema ----------
const MUESTRAS = 120;

function muestrasDe(modo: ModoTrigonometria, nivel: number): { p: ProblemaTrigonometria; tipo: string; dif: number }[] {
  return Array.from({ length: MUESTRAS }, () => {
    const { problema, tipo, dif } = generarProblemaTrigonometriaDetallado(modo, nivel);
    return { p: problema, tipo, dif };
  });
}

function textosDe(p: ProblemaTrigonometria): string[] {
  return p.entrada === "opciones" ? [p.enunciado, ...p.opciones, p.respuesta] : [p.enunciado];
}

describe("formato de los problemas", () => {
  it("cada $...$ tiene el $ apareado y compila en KaTeX; sin undefined, NaN, {{ ni comillas rectas", () => {
    for (const modo of MODOS) {
      for (const nivel of NIVELES) {
        for (const { p } of muestrasDe(modo, nivel)) {
          for (const t of textosDe(p)) {
            expect((t.match(/\$/g) ?? []).length % 2, `${modo} N${nivel}: $ desparejado en «${t}»`).toBe(0);
            for (const m of t.matchAll(/\$([^$]+)\$/g)) katex.renderToString(m[1], { throwOnError: true });
            expect(t.replace(/\$[^$]+\$/g, " "), `${modo} N${nivel}`).not.toMatch(/undefined|NaN|\[object|\{\{|\}\}|null|Infinity/);
            expect(t, `${modo} N${nivel}`).not.toMatch(/ {2}|"/);
          }
        }
      }
    }
  }, 120_000);

  it("español neutro: ningún enunciado tiene voseo", () => {
    for (const modo of MODOS) for (const nivel of NIVELES) for (const { p } of muestrasDe(modo, nivel)) expect(detectarVoseo(p.enunciado), p.enunciado).toEqual([]);
  });

  it("todo número escrito dentro de una fórmula usa la coma decimal con llaves ({,}), nunca punto", () => {
    for (const modo of MODOS) {
      for (const nivel of NIVELES) {
        for (const { p } of muestrasDe(modo, nivel)) {
          for (const t of textosDe(p)) for (const m of t.matchAll(/\$([^$]+)\$/g)) expect(m[1], `${p.enunciado}`).not.toMatch(/\d\.\d/);
        }
      }
    }
  });

  it("respuestas numéricas: finitas, con tolerancia razonable (≤ 2% del valor y ≤ 10 unidades), y ángulos en (0°, 180°)", () => {
    for (const modo of ["razones", "leyes"] as const) {
      for (const nivel of NIVELES) {
        for (const { p } of muestrasDe(modo, nivel)) {
          if (p.entrada !== "numero") continue;
          expect(Number.isFinite(p.respuesta), p.enunciado).toBe(true);
          expect(p.tolerancia, p.enunciado).toBeGreaterThanOrEqual(0);
          // Tope absoluto = 2 % de 500 m: los problemas con contexto (dos-pasos, nivel 10) usan 2 % por los
          // redondeos intermedios y sus respuestas llegan a ~360 m (medido: tolerancia máxima 7,25 en 80 000 muestras).
          expect(p.tolerancia, p.enunciado).toBeLessThanOrEqual(10);
          if (!/ángulo en grados/.test(p.enunciado)) expect(p.tolerancia, p.enunciado).toBeLessThanOrEqual(Math.max(0.02 * Math.abs(p.respuesta), 0.1) + 1e-3);
          expect(p.respuesta, p.enunciado).toBeGreaterThanOrEqual(0);
          if (/ángulo en grados/.test(p.enunciado)) {
            expect(p.respuesta, p.enunciado).toBeGreaterThan(0);
            expect(p.respuesta, p.enunciado).toBeLessThan(180);
            expect(p.tolerancia, p.enunciado).toBe(0.1);
          }
        }
      }
    }
  });

  it("opciones: exactamente 4, distintas, la respuesta es una de ellas y ninguna es una fórmula vacía", () => {
    for (const modo of ["circulo", "identidades"] as const) {
      for (const nivel of NIVELES) {
        for (const { p } of muestrasDe(modo, nivel)) {
          if (p.entrada !== "opciones") continue;
          expect(p.opciones.length, p.enunciado).toBe(4);
          expect(new Set(p.opciones).size, `${p.enunciado}: ${p.opciones.join(" | ")}`).toBe(4);
          expect(p.opciones, p.enunciado).toContain(p.respuesta);
          for (const o of p.opciones) expect(o.length, p.enunciado).toBeGreaterThan(0);
        }
      }
    }
  });
});

// ---------- opciones: exactamente una es correcta, ninguna es equivalente a otra ----------
function valorOpcion(o: string): number | "indefinido" {
  if (o === "indefinido") return "indefinido";
  return evalTex(sinDolar(o));
}

describe("las opciones no repiten valores ni ofrecen dos respuestas válidas", () => {
  it("todas las opciones de una pregunta valen algo DISTINTO (formas equivalentes como √3/3 y 1/√3 no conviven)", () => {
    for (const modo of ["circulo", "identidades"] as const) {
      for (const nivel of NIVELES) {
        for (const { p, tipo } of muestrasDe(modo, nivel)) {
          if (p.entrada !== "opciones" || tipo.startsWith("equivalente")) continue;
          const valores = p.opciones.map(valorOpcion);
          const numericos = valores.filter((v): v is number => v !== "indefinido");
          for (let i = 0; i < numericos.length; i++) {
            for (let j = i + 1; j < numericos.length; j++) {
              expect(Math.abs(numericos[i] - numericos[j]), `${p.enunciado}: «${p.opciones.join(" | ")}»`).toBeGreaterThan(1e-9);
            }
          }
          expect(valores.filter((v) => v === "indefinido").length).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});

// ---------- oráculos: la respuesta correcta se rehace, desde el enunciado, con otro método ----------
const FN = String.raw`(\\operatorname\{sen\}|\\operatorname\{cosec\}|\\cos|\\tan|\\sec|\\cot)`;
type NombreFn = "sen" | "cosec" | "cos" | "tan" | "sec" | "cot";
const nombreFn = (tex: string): NombreFn =>
  ({ "\\operatorname{sen}": "sen", "\\operatorname{cosec}": "cosec", "\\cos": "cos", "\\tan": "tan", "\\sec": "sec", "\\cot": "cot" } as Record<string, NombreFn>)[tex];
const fnNum = (fn: NombreFn, x: number): number =>
  ({ sen: Math.sin(x), cos: Math.cos(x), tan: Math.tan(x), cosec: 1 / Math.sin(x), sec: 1 / Math.cos(x), cot: 1 / Math.tan(x) })[fn];
const rad = (g: number): number => (g * Math.PI) / 180;
const grados = (r: number): number => (r * 180) / Math.PI;
const num = (s: string): number => Number(s.replace("{,}", ".").replace(",", "."));

function req(re: RegExp, texto: string): RegExpExecArray {
  const m = re.exec(texto);
  if (!m) throw new Error(`El enunciado no coincide con ${re}: «${texto}»`);
  return m;
}

// Un ángulo agudo con fn(θ) = valor (θ0) y su posición en el cuadrante pedido.
function anguloDeFuncion(fn: NombreFn, valor: number): number {
  const v = Math.abs(valor);
  switch (fn) {
    case "sen":
      return Math.asin(v);
    case "cos":
      return Math.acos(v);
    case "tan":
      return Math.atan(v);
    case "cosec":
      return Math.asin(1 / v);
    case "sec":
      return Math.acos(1 / v);
    case "cot":
      return Math.atan(1 / v);
  }
}

function enCuadrante(theta0: number, cuadrante: number): number {
  return [0, theta0, Math.PI - theta0, Math.PI + theta0, 2 * Math.PI - theta0][cuadrante];
}

const CUADRANTE: Record<string, number> = { primer: 1, segundo: 2, tercer: 3, cuarto: 4 };

// Devuelve el valor numérico que debe tener la respuesta ("indefinido" incluido).
function oraculoOpciones(p: ProblemaTrigonometria, tipo: string): number | "indefinido" | "catalogo" {
  const e = p.enunciado;
  if (tipo.startsWith("equivalente")) return "catalogo";

  // ¿Cuánto vale FN(arg)?  (círculo, complementarios, recíprocas, doble con θ)
  const cuanto = new RegExp(String.raw`¿[Cc]uánto vale \$${FN}\((.+?)\)\$\?`).exec(e);
  const cuantoSuma = new RegExp(String.raw`valor exacto de \$${FN}\((.+?)\)\$`).exec(e);
  const preguntaDirecta = cuanto ?? cuantoSuma;
  if (preguntaDirecta) {
    const m = preguntaDirecta;
    let arg = m[2];
    const theta = /\\theta=(\d+)\^\{\\circ\}/.exec(e);
    let enGrados = /\^\{\\circ\}/.test(arg);
    let evaluable = !/[A-Za-z]/.test(arg.replace(/\\(?:frac|dfrac|sqrt|pi|circ|left|right)/g, ""));
    if (theta && arg.includes("\\theta")) {
      arg = arg.replaceAll("\\theta", `(${theta[1]})`);
      enGrados = true;
      evaluable = true;
    }
    // Si el argumento es θ sin valor numérico (Si sen θ = ..., ¿cuánto vale cos θ?), se resuelve más abajo.
    if (evaluable) {
      const v = evalTex(arg);
      const x = enGrados ? rad(v) : v;
      const esperado = fnNum(nombreFn(m[1]), x);
      if (!Number.isFinite(esperado) || Math.abs(esperado) > 1e9) return "indefinido";
      return esperado;
    }
  }

  // Convierte g° a radianes / ¿Cuántos grados son X radianes?
  const aRad = /Convierte \$(-?\d+)\^\{\\circ\}\$ a radianes/.exec(e);
  if (aRad) return rad(Number(aRad[1]));
  const aGrados = /¿Cuántos grados son \$(.+?)\$ radianes\?/.exec(e);
  if (aGrados) return grados(evalTex(aGrados[1]));

  // ángulo de referencia
  const ref = /ángulo de referencia de \$(\d+)\^\{\\circ\}\$/.exec(e);
  if (ref) return grados(Math.acos(Math.abs(Math.cos(rad(Number(ref[1]))))));

  // Si sen(a°) = cos(θ) y θ agudo, ¿cuánto mide θ?  (complementarios)
  const compl = new RegExp(String.raw`Si \$${FN}\((\d+)\^\{\\circ\}\)=${FN}\(\\theta\)\$ y \$\\theta\$ es un ángulo agudo`).exec(e);
  if (compl) {
    const v = fnNum(nombreFn(compl[1]), rad(Number(compl[2])));
    return grados(anguloDeFuncion(nombreFn(compl[3]), v));
  }

  // Sean A y B agudos con sen(A) = a y cos(B) = b: fn(A + B)
  const suma = new RegExp(String.raw`\$${FN}\(A\)=\\frac\{(\d+)\}\{(\d+)\}\$ y \$${FN}\(B\)=\\frac\{(\d+)\}\{(\d+)\}\$\. ¿Cuánto vale \$${FN}\(A\+B\)\$`).exec(e);
  if (suma) {
    const A = anguloDeFuncion(nombreFn(suma[1]), Number(suma[2]) / Number(suma[3]));
    const B = anguloDeFuncion(nombreFn(suma[4]), Number(suma[5]) / Number(suma[6]));
    return fnNum(nombreFn(suma[7]), A + B);
  }

  // cociente: Si sen θ = A y cos θ = B, ¿cuánto vale tan θ / cot θ?
  const coc = new RegExp(String.raw`Si \$\\operatorname\{sen\}\(\\theta\)=(.+?)\$ y \$\\cos\(\\theta\)=(.+?)\$, ¿cuánto vale \$${FN}\(\\theta\)\$`).exec(e);
  if (coc) {
    const s = evalTex(coc[1]);
    const c = evalTex(coc[2]);
    // los dos valores describen un ángulo real: sen² + cos² = 1
    expect(s * s + c * c, e).toBeCloseTo(1, 9);
    return fnNum(nombreFn(coc[3]), Math.atan2(s, c));
  }

  // Si FN(θ) = V y θ está en el X cuadrante / es agudo, ¿cuánto vale GN(kθ)?
  const dado = new RegExp(String.raw`Si \$${FN}\(\\theta\)=(-?)(.+?)\$ y \$\\theta\$ (?:es un ángulo agudo|está en el (primer|segundo|tercer|cuarto) cuadrante), ¿cuánto vale \$${FN}\((2?)\\theta\)\$`).exec(e);
  if (dado) {
    const fnDado = nombreFn(dado[1]);
    const signo = dado[2] === "-" ? -1 : 1;
    const valorAbs = evalTex(dado[3]);
    const cuadrante = dado[4] ? CUADRANTE[dado[4]] : 1;
    const theta = enCuadrante(anguloDeFuncion(fnDado, valorAbs), cuadrante);
    // el enunciado es coherente: el signo dado es el que la función tiene en ese cuadrante
    expect(Math.sign(fnNum(fnDado, theta)), `signo incoherente: ${e}`).toBe(signo);
    expect(fnNum(fnDado, theta), e).toBeCloseTo(signo * valorAbs, 9);
    const k = dado[6] === "2" ? 2 : 1;
    const esperado = fnNum(nombreFn(dado[5]), k * theta);
    return Math.abs(esperado) > 1e9 ? "indefinido" : esperado;
  }

  // Si FN(θ) = V (sin cuadrante; recíprocas) ... ¿cuánto vale GN(θ)?
  const sinCuadrante = new RegExp(String.raw`Si \$${FN}\(\\theta\)=(.+?)\$, ¿cuánto vale \$${FN}\(\\theta\)\$`).exec(e);
  if (sinCuadrante) return fnNum(nombreFn(sinCuadrante[3]), anguloDeFuncion(nombreFn(sinCuadrante[1]), evalTex(sinCuadrante[2])));

  throw new Error(`Sin oráculo para «${tipo}»: ${e}`);
}

describe("la respuesta correcta de círculo e identidades coincide con un cálculo independiente (Math.*)", () => {
  it("se rehace desde el enunciado y coincide con la opción correcta; los distractores NO valen lo mismo", () => {
    let verificados = 0;
    for (const modo of ["circulo", "identidades"] as const) {
      for (const nivel of NIVELES) {
        for (const { p, tipo } of muestrasDe(modo, nivel)) {
          if (p.entrada !== "opciones") continue;
          const esperado = oraculoOpciones(p, tipo);
          if (esperado === "catalogo") {
            const q = EQUIVALENCIAS.find((x) => p.enunciado.includes(`$${x.expr.tex}$`));
            expect(q, `equivalencia no encontrada: ${p.enunciado}`).toBeDefined();
            expect(p.respuesta).toBe(`$${q!.correcta.tex}$`);
            for (const mala of q!.incorrectas) expect(p.respuesta).not.toBe(`$${mala.tex}$`);
            verificados++;
            continue;
          }
          const obtenido = valorOpcion(p.respuesta);
          if (esperado === "indefinido") expect(obtenido, p.enunciado).toBe("indefinido");
          else {
            expect(obtenido, `${p.enunciado} -> ${p.respuesta}`).not.toBe("indefinido");
            expect(obtenido as number, `${p.enunciado} -> ${p.respuesta}`).toBeCloseTo(esperado, 8);
          }
          // los distractores NO son la respuesta: ninguno vale lo mismo que el esperado
          for (const o of p.opciones) {
            if (o === p.respuesta) continue;
            const v = valorOpcion(o);
            if (esperado === "indefinido") expect(v, `${p.enunciado}: «${o}» también vale indefinido`).not.toBe("indefinido");
            else if (v !== "indefinido") expect(Math.abs(v - esperado), `${p.enunciado}: «${o}» vale lo mismo que la respuesta`).toBeGreaterThan(1e-7);
          }
          verificados++;
        }
      }
    }
    expect(verificados).toBeGreaterThan(2000);
  }, 120_000);

  it("'indefinido' solo es la respuesta cuando de verdad lo es, y nunca en el nivel 1 del círculo (bug viejo: tan 90° en el nivel 1)", () => {
    for (let i = 0; i < 400; i++) {
      const p = generarProblemaTrigonometria("circulo", 1);
      if (p.entrada !== "opciones") continue;
      expect(p.respuesta, p.enunciado).not.toBe("indefinido");
    }
    let vistas = 0;
    for (let nivel = 2; nivel <= 10; nivel++) {
      for (const { p, tipo } of muestrasDe("circulo", nivel)) {
        if (p.entrada === "opciones" && p.respuesta === "indefinido") {
          expect(oraculoOpciones(p, tipo), p.enunciado).toBe("indefinido");
          vistas++;
        }
      }
    }
    expect(vistas).toBeGreaterThan(0);
  });
});

// ---------- oráculos de razones y leyes (respuestas numéricas) ----------
function coordenadas(a: number, b: number, C: number): { x: number; y: number }[] {
  // SAS con vértice C en el origen: los lados a y b salen de C.
  return [
    { x: 0, y: 0 },
    { x: a, y: 0 },
    { x: b * Math.cos(rad(C)), y: b * Math.sin(rad(C)) },
  ];
}
const dist = (p: { x: number; y: number }, q: { x: number; y: number }): number => Math.hypot(p.x - q.x, p.y - q.y);

function raicesSSA(a: number, b: number, A: number): number[] {
  const disc = a * a - (b * Math.sin(rad(A))) ** 2;
  if (disc < -1e-9) return [];
  const raiz = Math.sqrt(Math.max(0, disc));
  const xs = disc < 1e-9 ? [b * Math.cos(rad(A))] : [b * Math.cos(rad(A)) + raiz, b * Math.cos(rad(A)) - raiz];
  return xs.filter((x) => x > 1e-9);
}

function oraculoNumerico(p: ProblemaTrigonometria, tipo: string): number {
  const e = p.enunciado;
  switch (tipo) {
    case "razon-ternas":
    case "reciprocas": {
      const abc = /\$a=(\d+)\$, \$b=(\d+)\$ y \$c=(\d+)\$/.exec(e);
      if (abc) {
        const [a, b, c] = [Number(abc[1]), Number(abc[2]), Number(abc[3])];
        expect(a * a + b * b, e).toBe(c * c);
        const m = req(new RegExp(String.raw`¿Cuánto vale \$${FN}\((A|B)\)\$`), e);
        const angulo = m[2] === "A" ? Math.atan2(a, b) : Math.atan2(b, a);
        return fnNum(nombreFn(m[1]), angulo);
      }
      const dif4 = new RegExp(String.raw`\$${FN}\(A\)=\\frac\{(\d+)\}\{(\d+)\}\$\. ¿Cuánto vale \$${FN}\(A\)\$`).exec(e);
      if (dif4) return fnNum(nombreFn(dif4[4]), anguloDeFuncion(nombreFn(dif4[1]), Number(dif4[2]) / Number(dif4[3])));
      const calc = new RegExp(String.raw`Calcula \$${FN}\((\d+)\^\{\\circ\}\)\$`).exec(e);
      if (calc) return fnNum(nombreFn(calc[1]), rad(Number(calc[2])));
      const sinTri = new RegExp(String.raw`Si \$${FN}\(\\theta\)=(.+?)\$, ¿cuánto vale \$${FN}\(\\theta\)\$`).exec(e);
      if (sinTri) return fnNum(nombreFn(sinTri[3]), anguloDeFuncion(nombreFn(sinTri[1]), evalTex(sinTri[2])));
      break;
    }
    case "lado-notable":
    case "lado-calculadora": {
      const m = req(
        /el ángulo \$([AB])\$ mide \$(\d+)\^\{\\circ\}\$ y .*?\$([abc])\$.*? mide ([\d,]+)\. ¿Cuánto mide .*?\$([abc])\$/,
        e
      );
      const angulo = Number(m[2]);
      const A = m[1] === "A" ? angulo : 90 - angulo;
      const opuesto: Record<string, number> = { a: rad(A), b: rad(90 - A), c: rad(90) };
      // ley del seno en el triángulo (A, 90° − A, 90°)
      return (num(m[4]) * Math.sin(opuesto[m[5]])) / Math.sin(opuesto[m[3]]);
    }
    case "angulo-inverso": {
      const rampa = /Una rampa de ([\d,]+) m de largo llega a ([\d,]+) m de altura/.exec(e);
      if (rampa) return grados(Math.asin(num(rampa[2]) / num(rampa[1])));
      const escalera = /Una escalera de ([\d,]+) m se apoya en una pared con el pie a ([\d,]+) m/.exec(e);
      if (escalera) return grados(Math.acos(num(escalera[2]) / num(escalera[1])));
      const poste = /Un poste vertical de ([\d,]+) m proyecta una sombra de ([\d,]+) m/.exec(e);
      if (poste) return grados(Math.atan(num(poste[1]) / num(poste[2])));
      const m = req(/se conocen \$([abc])=([\d{},]+)\$ y \$([abc])=([\d{},]+)\$.*¿Cuánto mide el ángulo \$([AB])\$/, e);
      const lados: Record<string, number> = { [m[1]]: num(m[2]), [m[3]]: num(m[4]) };
      if (lados.c === undefined) lados.c = Math.hypot(lados.a, lados.b);
      if (lados.a === undefined) lados.a = Math.sqrt(lados.c ** 2 - lados.b ** 2);
      if (lados.b === undefined) lados.b = Math.sqrt(lados.c ** 2 - lados.a ** 2);
      // ley del coseno para el ángulo del vértice pedido
      const [opuesto, adyacente] = m[5] === "A" ? [lados.a, lados.b] : [lados.b, lados.a];
      return grados(Math.acos((adyacente ** 2 + lados.c ** 2 - opuesto ** 2) / (2 * adyacente * lados.c)));
    }
    case "elevacion": {
      let m = /Un observador está a (\d+) m de la base de .*ángulo de elevación de \$(\d+)\^\{\\circ\}\$\. ¿Qué altura/.exec(e);
      if (m) return Number(m[1]) * Math.tan(rad(Number(m[2])));
      m = /Una escalera de (\d+) m se apoya en una pared vertical y forma un ángulo de \$(\d+)\^\{\\circ\}\$/.exec(e);
      if (m) return Number(m[1]) * Math.sin(rad(Number(m[2])));
      m = /de (\d+) m de altura se ve con un ángulo de elevación de \$(\d+)\^\{\\circ\}\$\. ¿A qué distancia horizontal/.exec(e);
      if (m) return Number(m[1]) / Math.tan(rad(Number(m[2])));
      m = /Desde un punto a (\d+) m de la base de .* de (\d+) m de altura, ¿cuál es el ángulo de elevación/.exec(e);
      if (m) return grados(Math.atan2(Number(m[2]), Number(m[1])));
      m = /hilo tenso de (\d+) m que forma un ángulo de \$(\d+)\^\{\\circ\}\$/.exec(e);
      if (m) return Number(m[1]) * Math.sin(rad(Number(m[2])));
      m = /Un poste de (\d+) m de altura proyecta una sombra de (\d+) m/.exec(e);
      if (m) return grados(Math.atan2(Number(m[1]), Number(m[2])));
      break;
    }
    case "depresion": {
      let m = /de (\d+) m de altura, el ángulo de depresión hacia .* es de \$(\d+)\^\{\\circ\}\$\. ¿A qué distancia horizontal/.exec(e);
      if (m) return Number(m[1]) / Math.tan(rad(Number(m[2])));
      m = /de (\d+) m de altura, el ángulo de depresión hacia .* es de \$(\d+)\^\{\\circ\}\$\. ¿A qué distancia en línea recta/.exec(e);
      if (m) return Number(m[1]) / Math.sin(rad(Number(m[2])));
      m = /de (\d+) m de altura se ve .* a (\d+) m de la base\. ¿Cuál es el ángulo de depresión/.exec(e);
      if (m) return grados(Math.atan2(Number(m[1]), Number(m[2])));
      break;
    }
    case "dos-pasos": {
      let m = /ojos están a ([\d,]+) m del suelo se ubica a (\d+) m de un edificio y ve la azotea con un ángulo de elevación de \$(\d+)\^/.exec(e);
      if (m) return num(m[1]) + Number(m[2]) * Math.tan(rad(Number(m[3])));
      m = /a (\d+) m de la base de un edificio, la azotea se ve con un ángulo de elevación de \$(\d+)\^\{\\circ\}\$ y la punta de un mástil .* con \$(\d+)\^/.exec(e);
      if (m) return Number(m[1]) * (Math.tan(rad(Number(m[3]))) - Math.tan(rad(Number(m[2]))));
      m = /elevación de \$(\d+)\^\{\\circ\}\$\. Se aleja (\d+) m en línea recta y ahora la ve con \$(\d+)\^/.exec(e);
      if (m) {
        // Dos ecuaciones: h = x·tan α y h = (x + d)·tan β  =>  x = d·tanβ / (tanα − tanβ)
        const [alfa, d, beta] = [rad(Number(m[1])), Number(m[2]), rad(Number(m[3]))];
        return (d * Math.tan(beta) * Math.tan(alfa)) / (Math.tan(alfa) - Math.tan(beta));
      }
      m = /faro de (\d+) m se ven dos barcos .* depresión de \$(\d+)\^\{\\circ\}\$ y \$(\d+)\^/.exec(e);
      if (m) {
        const h = Number(m[1]);
        return h / Math.tan(rad(Number(m[3]))) - h / Math.tan(rad(Number(m[2])));
      }
      break;
    }
    case "seno-lado": {
      const m = req(
        /se conocen \$([ABC])=(\d+)\^\{\\circ\}\$ y \$([ABC])=(\d+)\^\{\\circ\}\$ y el lado \$([abc])\$ \(opuesto a \$([ABC])\$\) mide (\d+)\. ¿Cuánto mide el lado \$([abc])\$ \(opuesto a \$([ABC])\$\)/,
        e
      );
      const angulos: Record<string, number> = { [m[1]]: Number(m[2]), [m[3]]: Number(m[4]) };
      const faltante = ["A", "B", "C"].find((v) => angulos[v] === undefined)!;
      angulos[faltante] = 180 - Number(m[2]) - Number(m[4]);
      expect(m[5].toUpperCase(), e).toBe(m[6]);
      expect(m[8].toUpperCase(), e).toBe(m[9]);
      return (Number(m[7]) * Math.sin(rad(angulos[m[9]]))) / Math.sin(rad(angulos[m[6]]));
    }
    case "coseno-lado": {
      const m = req(/dos lados de (\d+) y (\d+) y el ángulo comprendido entre ellos mide \$(\d+)\^/, e);
      const [P, Q, R] = coordenadas(Number(m[1]), Number(m[2]), Number(m[3]));
      void P;
      return dist(Q, R);
    }
    case "coseno-angulo": {
      const m = req(/lados \$a=(\d+)\$, \$b=(\d+)\$ y \$c=(\d+)\$.*¿Cuánto mide el ángulo \$([ABC])\$/, e);
      const [a, b, c] = [Number(m[1]), Number(m[2]), Number(m[3])];
      // A=(0,0), B=(c,0), C=(x,y) con |AC|=b y |BC|=a
      const x = (b * b + c * c - a * a) / (2 * c);
      const y = Math.sqrt(b * b - x * x);
      const V = { A: { x: 0, y: 0 }, B: { x: c, y: 0 }, C: { x, y } };
      const otros = (["A", "B", "C"] as const).filter((v) => v !== m[4]);
      const v1 = { x: V[otros[0]].x - V[m[4] as "A"].x, y: V[otros[0]].y - V[m[4] as "A"].y };
      const v2 = { x: V[otros[1]].x - V[m[4] as "A"].x, y: V[otros[1]].y - V[m[4] as "A"].y };
      return grados(Math.abs(Math.atan2(v1.x * v2.y - v1.y * v2.x, v1.x * v2.x + v1.y * v2.y)));
    }
    case "area": {
      const m = req(/dos (?:lados|bordes) de (\d+)(?: m| dm)? y (\d+)(?: m| dm)?.*(?:comprendido entre ellos mide|ángulo de) \$(\d+)\^/, e);
      const [P, Q, R] = coordenadas(Number(m[1]), Number(m[2]), Number(m[3]));
      return 0.5 * Math.abs((Q.x - P.x) * (R.y - P.y) - (R.x - P.x) * (Q.y - P.y));
    }
    case "aplicacion": {
      let m = /\$PA\$ mide (\d+) m, \$PB\$ mide (\d+) m y el ángulo \$APB\$ mide \$(\d+)\^/.exec(e);
      if (m) {
        const [P, Q, R] = coordenadas(Number(m[1]), Number(m[2]), Number(m[3]));
        void P;
        return dist(Q, R);
      }
      m = /a (\d+) m uno del otro.*\$CAB\$ de \$(\d+)\^\{\\circ\}\$ y desde \$B\$ con un ángulo \$CBA\$ de \$(\d+)\^/.exec(e);
      if (m) {
        const [base, alfa, beta] = [Number(m[1]), rad(Number(m[2])), rad(Number(m[3]))];
        // A en el origen, B en (base, 0); C es la intersección de las dos visuales
        const t = (base * Math.sin(beta)) / Math.sin(alfa + beta);
        const C = { x: t * Math.cos(alfa), y: t * Math.sin(alfa) };
        // el ángulo en B de esa C es beta: comprobación cruzada
        expect(Math.atan2(C.y, base - C.x), e).toBeCloseTo(beta, 9);
        return Math.hypot(C.x, C.y);
      }
      m = /forman un ángulo de \$(\d+)\^\{\\circ\}\$\. Uno navega a (\d+) km\/h y el otro a (\d+) km\/h.* después de (\d+) horas/.exec(e);
      if (m) {
        const h = Number(m[4]);
        return dist({ x: Number(m[2]) * h, y: 0 }, { x: Number(m[3]) * h * Math.cos(rad(Number(m[1]))), y: Number(m[3]) * h * Math.sin(rad(Number(m[1]))) });
      }
      m = /dos lados de (\d+) m y (\d+) m que forman un ángulo de \$(\d+)\^\{\\circ\}\$\. ¿Cuánto mide su perímetro/.exec(e);
      if (m) {
        const [P, Q, R] = coordenadas(Number(m[1]), Number(m[2]), Number(m[3]));
        return dist(P, Q) + dist(Q, R) + dist(R, P);
      }
      m = /lados de (\d+) m, (\d+) m y (\d+) m\. ¿Cuánto mide su ángulo mayor/.exec(e);
      if (m) {
        const lados = [Number(m[1]), Number(m[2]), Number(m[3])].sort((x, y) => y - x);
        const [c, a, b] = lados;
        // el mayor ángulo es el opuesto al lado mayor: se calcula con el producto punto en coordenadas
        const x = (b * b + c * c - a * a) / (2 * c); // A=(0,0), B=(c,0)
        const y = Math.sqrt(b * b - x * x);
        const C = { x, y };
        const u = { x: -C.x, y: -C.y }; // C -> A
        const v = { x: c - C.x, y: -C.y }; // C -> B
        return grados(Math.acos((u.x * v.x + u.y * v.y) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y))));
      }
      m = /camina (\d+) km en línea recta, gira \$(\d+)\^\{\\circ\}\$ hacia la derecha y camina (\d+) km/.exec(e);
      if (m) {
        const giro = rad(Number(m[2]));
        return Math.hypot(Number(m[1]) + Number(m[3]) * Math.cos(-giro), Number(m[3]) * Math.sin(-giro));
      }
      break;
    }
    case "ambiguo": {
      const m = req(/\$a=(\d+)\$, \$b=(\d+)\$ y \$A=(\d+)\^/, e);
      const [a, b, A] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const xs = raicesSSA(a, b, A);
      if (/mayor de los dos ángulos/.test(e)) {
        expect(xs.length, e).toBe(2);
        // ángulo en B de cada triángulo posible: entre los vectores B->A y B->C, con C = b(cosA, sinA) y B = (x, 0)
        const C = { x: b * Math.cos(rad(A)), y: b * Math.sin(rad(A)) };
        const angulosB = xs.map((x) => grados(Math.abs(Math.atan2(C.y, C.x - x) - Math.atan2(0, -x))));
        return Math.max(...angulosB.map((g) => (g > 180 ? 360 - g : g)));
      }
      return xs.length;
    }
  }
  throw new Error(`Sin oráculo para «${tipo}»: ${e}`);
}

describe("la respuesta numérica de razones y leyes coincide con un cálculo independiente rehecho desde el enunciado", () => {
  it("razones y leyes: en TODOS los tipos y niveles la respuesta es la que dice el enunciado", () => {
    const porTipo = new Map<string, number>();
    for (const modo of ["razones", "leyes"] as const) {
      for (const nivel of NIVELES) {
        for (const { p, tipo } of muestrasDe(modo, nivel)) {
          if (p.entrada !== "numero") continue;
          const esperado = oraculoNumerico(p, tipo);
          const tolRedondeo = /ángulo en grados/.test(p.enunciado) ? 0.0501 : 0.0051;
          expect(Math.abs(p.respuesta - esperado), `${modo}/${tipo} N${nivel}: ${p.enunciado} -> ${p.respuesta} (oráculo ${esperado})`).toBeLessThanOrEqual(
            p.enunciado.includes("Escribe 0, 1 o 2") ? 0 : tolRedondeo + 1e-9
          );
          porTipo.set(`${modo}/${tipo}`, (porTipo.get(`${modo}/${tipo}`) ?? 0) + 1);
        }
      }
    }
    // todos los tipos se verificaron
    for (const modo of ["razones", "leyes"] as const) for (const t of ESCALA_TRIGONOMETRIA[modo]) expect(porTipo.get(`${modo}/${t.tipo}`) ?? 0, `${modo}/${t.tipo}`).toBeGreaterThan(20);
  }, 120_000);

  it("caso ambiguo: aparecen los tres resultados (0, 1 y 2 triángulos) y el pedido del mayor B", () => {
    const cantidades = new Set<number>();
    let mayorB = 0;
    for (let i = 0; i < 400; i++) {
      const { problema: p } = generarProblemaTrigonometriaDetallado("leyes", 10);
      if (p.entrada !== "numero") continue;
      if (/Escribe 0, 1 o 2/.test(p.enunciado)) cantidades.add(p.respuesta);
      if (/mayor de los dos/.test(p.enunciado)) mayorB++;
    }
    expect([...cantidades].sort()).toEqual([0, 1, 2]);
    expect(mayorB).toBeGreaterThan(5);
  });
});

// ---------- el dibujo coincide con el enunciado ----------
describe("el diagrama del triángulo es coherente con los datos y con el enunciado", () => {
  it("geometría real: Pitágoras o ley del coseno con los tres lados, ángulos que suman 180° y coherentes con los lados", () => {
    let dibujos = 0;
    for (const modo of ["razones", "leyes"] as const) {
      for (const nivel of NIVELES) {
        for (const { p } of muestrasDe(modo, nivel)) {
          const t = p.triangulo;
          if (!t) continue;
          dibujos++;
          expect(t.anguloA + t.anguloB + t.anguloC, p.enunciado).toBeCloseTo(180, 6);
          for (const [angulo, opuesto, l1, l2] of [
            [t.anguloA, t.ladoA, t.ladoB, t.ladoC],
            [t.anguloB, t.ladoB, t.ladoA, t.ladoC],
            [t.anguloC, t.ladoC, t.ladoA, t.ladoB],
          ] as const) {
            expect(grados(Math.acos((l1 * l1 + l2 * l2 - opuesto * opuesto) / (2 * l1 * l2))), p.enunciado).toBeCloseTo(angulo, 5);
          }
          expect(t.ladoA + t.ladoB, p.enunciado).toBeGreaterThan(t.ladoC);
          expect(t.ladoA + t.ladoC, p.enunciado).toBeGreaterThan(t.ladoB);
          expect(t.ladoB + t.ladoC, p.enunciado).toBeGreaterThan(t.ladoA);
          if (t.marcarRectoEn === "C") {
            expect(t.anguloC).toBe(90);
            expect(t.ladoA ** 2 + t.ladoB ** 2, p.enunciado).toBeCloseTo(t.ladoC ** 2, 6);
            // el dibujo tiene los catetos horizontal y vertical y la hipotenusa del tamaño correcto
            const { A, B, C } = calcularVertices(t);
            expect(C.y).toBe(0);
            expect(B.x).toBe(C.x);
            expect(Math.hypot(B.x - A.x, B.y - A.y)).toBeCloseTo(t.ladoC, 1);
          } else {
            const { A, B, C } = calcularVertices(t);
            expect(Math.hypot(B.x - A.x, B.y - A.y)).toBeCloseTo(t.ladoC, 1);
            expect(Math.hypot(C.x - B.x, C.y - B.y)).toBeCloseTo(t.ladoA, 1);
            expect(Math.hypot(C.x - A.x, C.y - A.y)).toBeCloseTo(t.ladoB, 1);
          }
        }
      }
    }
    expect(dibujos).toBeGreaterThan(500);
  });

  it("el dibujo solo muestra lo que dice el enunciado: cada lado y ángulo visible aparece en el texto y la incógnita va como «?»", () => {
    for (const modo of ["razones", "leyes"] as const) {
      for (const nivel of NIVELES) {
        for (const { p, tipo } of muestrasDe(modo, nivel)) {
          const t = p.triangulo;
          if (!t) continue;
          const texto = p.enunciado.replace(/\$/g, "").replace(/\^\{\\circ\}/g, "°").replace(/\{,\}/g, ",");
          const ocultos = new Set(t.ocultarLados ?? []);
          const omitidos = new Set(t.omitirLados ?? []);
          for (const k of ["ladoA", "ladoB", "ladoC"] as const) {
            if (omitidos.has(k) || ocultos.has(k)) continue;
            // el número que se ve (formatoLado) está escrito en el enunciado
            expect(texto, `${tipo}: falta ${formatoLado(t[k])} en «${texto}»`).toMatch(new RegExp(`(^|[^\\d,])${formatoLado(t[k]).replace(",", ",")}([^\\d]|$)`));
          }
          for (const [v, k] of [["A", "anguloA"], ["B", "anguloB"], ["C", "anguloC"]] as const) {
            if ((t.ocultarAngulos ?? []).includes(v) || v === t.marcarRectoEn) continue;
            expect(texto, `${tipo}: falta ${formatoAngulo(t[k])} en «${texto}»`).toContain(formatoAngulo(t[k]));
          }
          // un lado oculto: su valor real es la respuesta si el enunciado pide un lado
          if (ocultos.size === 1 && /Redondea a 2 decimales/.test(p.enunciado) && p.entrada === "numero") {
            const k = [...ocultos][0];
            expect(Math.abs(t[k] - p.respuesta), p.enunciado).toBeLessThanOrEqual(0.0051);
          }
        }
      }
    }
  });

  it("las razones con los tres lados dados NO muestran los ángulos agudos (bug viejo: el A redondeado llevaba a otra respuesta)", () => {
    let n = 0;
    for (let nivel = 1; nivel <= 6; nivel++) {
      for (const { p, tipo } of muestrasDe("razones", nivel)) {
        if (tipo !== "razon-ternas" || !p.triangulo) continue;
        n++;
        expect(p.triangulo.ocultarAngulos, p.enunciado).toEqual(["A", "B"]);
      }
    }
    expect(n).toBeGreaterThan(50);
    // y el bug concreto: con 20-21-29 el ángulo A redondeado (44°) da tan(44°) = 0,966, fuera de la tolerancia de tan A = 20/21 = 0,952
    expect(Math.abs(Math.tan(rad(44)) - 20 / 21)).toBeGreaterThan(0.01);
  });

  it("la ley del coseno con un lado mayor y ángulo agudo dibuja un ángulo obtuso donde corresponde (bug viejo: asin)", () => {
    let obtusos = 0;
    for (let nivel = 3; nivel <= 9; nivel++) {
      for (const { p, tipo } of muestrasDe("leyes", nivel)) {
        if (tipo !== "coseno-lado" || !p.triangulo) continue;
        const t = p.triangulo;
        // el mayor lado es opuesto al mayor ángulo
        const mayorLado = Math.max(t.ladoA, t.ladoB, t.ladoC);
        const mayorAngulo = Math.max(t.anguloA, t.anguloB, t.anguloC);
        const opuestoAlMayor = mayorLado === t.ladoA ? t.anguloA : mayorLado === t.ladoB ? t.anguloB : t.anguloC;
        expect(opuestoAlMayor, p.enunciado).toBeCloseTo(mayorAngulo, 6);
        if (mayorAngulo > 90) obtusos++;
      }
    }
    expect(obtusos).toBeGreaterThan(10);
  });
});

// ---------- coherencia con lo que existe (diagnóstico, demo, reto) ----------
describe("consumidores existentes", () => {
  it("el diagnóstico (razones, entrada numérica) y el demo (razones nivel 1) siguen recibiendo problemas numéricos con la misma forma", () => {
    for (const nivel of NIVELES) {
      for (let i = 0; i < 50; i++) {
        const p = generarProblemaTrigonometria("razones", nivel);
        expect(p.entrada).toBe("numero");
        if (p.entrada === "numero") {
          expect(typeof p.respuesta).toBe("number");
          expect(typeof p.tolerancia).toBe("number");
          expect(typeof p.enunciado).toBe("string");
        }
      }
    }
  });

  it("el Reto Diario usa 'circulo' e 'identidades': siempre opciones, en cualquier nivel medio (3 a 7)", () => {
    for (const modo of ["circulo", "identidades"] as const) {
      for (let nivel = 3; nivel <= 7; nivel++) for (let i = 0; i < 100; i++) expect(generarProblemaTrigonometria(modo, nivel).entrada).toBe("opciones");
    }
  });

  it("la clave de deduplicación del sprint (enunciado|respuesta) da variedad: en 20 preguntas del mismo nivel hay pocas repeticiones", () => {
    for (const modo of MODOS) {
      for (const nivel of NIVELES) {
        const vistos = new Set<string>();
        for (let i = 0; i < 20; i++) {
          const p = generarProblemaTrigonometria(modo, nivel);
          vistos.add(`${p.enunciado}|${p.respuesta}`);
        }
        expect(vistos.size, `${modo} N${nivel}`).toBeGreaterThanOrEqual(nivel <= 2 ? 5 : 7);
      }
    }
  });
});
