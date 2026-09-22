import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import katex from "katex";
import fs from "node:fs";
import path from "node:path";
import MathText from "@/components/MathText";
import { textoPlano } from "@/lib/texto/latexAPlano";
import { generarProblemaCalculia } from "./calculia";
import { generarProblemaCircuitia } from "./circuitia";
import { generarProblemaEstadistica, MODOS_ESTADISTICA } from "./estadistica";
import { generarProblemaTrigonometria } from "./trigonometria";
import { generarProblemaPotencia } from "./potencias";
import { generarProblemaAlgebra } from "./algebra";
import { generarProblemaDecimal } from "./decimales";

// El crash de Codia pasó por no ejercitar el render. Acá se hace las dos
// cosas para TODOS los generadores que emiten LaTeX entre $...$:
//  1. cada $...$ compila en KaTeX con throwOnError:true (una fórmula rota se
//     vería en rojo en pantalla);
//  2. el MISMO componente <MathText> que usan los runners, renderizado a HTML
//     (react-dom/server), produce elementos de KaTeX (clase "katex") y NO deja
//     ningún "$", "\" ni "^" visible como texto (se ignora el MathML oculto,
//     que guarda el TeX original en <annotation>).

const PULLS = 60;

interface Muestra {
  mundo: string;
  textos: string[]; // enunciado + opciones + respuesta (strings con marcas)
}

function textosDe(p: { enunciado: string; opciones?: string[]; respuesta: string | number }): string[] {
  const t = [p.enunciado];
  if (p.opciones) t.push(...p.opciones, String(p.respuesta));
  return t;
}

function recolectar(): Muestra[] {
  const m: Muestra[] = [];
  const niveles = [1, 3, 5, 7, 9, 10];
  for (let i = 0; i < PULLS; i++) {
    const nivel = niveles[i % niveles.length];
    for (const modo of ["derivadas", "integrales", "series", "multivariable"] as const) {
      m.push({ mundo: "calculia", textos: textosDe(generarProblemaCalculia(modo, nivel)) });
    }
    for (const modo of ["serie", "paralelo", "mixto", "cualitativo"] as const) {
      m.push({ mundo: "circuitia", textos: textosDe(generarProblemaCircuitia(modo, Math.max(nivel, modo === "mixto" ? 4 : 1))) });
    }
    for (const modo of MODOS_ESTADISTICA) {
      if (modo === "graficos") continue;
      m.push({ mundo: "estadistica", textos: textosDe(generarProblemaEstadistica(modo, nivel)) });
    }
    for (const modo of ["razones", "circulo", "identidades", "leyes"] as const) {
      m.push({ mundo: "trigonometria", textos: textosDe(generarProblemaTrigonometria(modo, nivel)) });
    }
    const nivelPorTipo = { potencia: nivel, raiz: nivel, notacion: nivel };
    m.push({ mundo: "potencias", textos: [generarProblemaPotencia(nivelPorTipo).enunciado] });
    m.push({ mundo: "algebra", textos: [generarProblemaAlgebra({ evaluar: nivel, "un-paso": nivel, "dos-pasos": nivel }).enunciado] });
    m.push({ mundo: "decimales", textos: [generarProblemaDecimal({ convertir: nivel, porcentaje: nivel, redondear: nivel }).enunciado] });
  }
  return m;
}

function textoVisible(html: string): string {
  return html
    .replace(/<span class="katex-mathml">[\s\S]*?<\/span><span class="katex-html"/g, '<span class="katex-html"')
    .replace(/<[^>]+>/g, "");
}

describe("render de fórmulas de práctica (KaTeX + MathText)", () => {
  const muestras = recolectar();

  it("cada $...$ de todos los generadores compila en KaTeX (throwOnError)", () => {
    const vistas = new Set<string>();
    const fallos: string[] = [];
    let total = 0;
    for (const { textos } of muestras) {
      for (const t of textos) {
        if ((t.match(/\$/g) ?? []).length % 2 !== 0) fallos.push(`$ sin cerrar: ${t}`);
        for (const m of t.matchAll(/\$([^$]+)\$/g)) {
          total++;
          if (vistas.has(m[1])) continue;
          vistas.add(m[1]);
          try {
            katex.renderToString(m[1], { throwOnError: true });
          } catch (e) {
            fallos.push(`"${m[1]}": ${(e as Error).message}`);
          }
        }
      }
    }
    expect(total).toBeGreaterThan(500);
    expect(fallos).toEqual([]);
  });

  it("cada mundo con LaTeX emite fórmulas (no quedó texto plano sin convertir)", () => {
    for (const mundo of ["calculia", "circuitia", "estadistica", "trigonometria", "potencias", "algebra", "decimales"]) {
      const enunciados = muestras.filter((m) => m.mundo === mundo).map((m) => m.textos[0]);
      const conMath = enunciados.filter((e) => /\$[^$]+\$/.test(e)).length;
      const minimo = { estadistica: 0.3, potencias: 0.5, decimales: 0.2 }[mundo] ?? 0.95; // potencias/decimales/estadística tienen tipos solo-texto
      expect(conMath / enunciados.length, mundo).toBeGreaterThanOrEqual(minimo);
    }
  });

  it("MathText renderizado (SSR): hay elementos katex y ningún $, \\ ni ^ visible", () => {
    const problemas = new Set<string>(); // strings distintos (muchos se repiten)
    for (const { textos } of muestras) for (const t of textos) problemas.add(t);
    let conKatex = 0;
    for (const t of problemas) {
      const html = renderToStaticMarkup(createElement(MathText, { texto: t }));
      const visible = textoVisible(html);
      // \hat{y} se dibuja con el acento circunflejo (^) de KaTeX: es el sombrero, no un ^ crudo.
      expect(visible, `visible: ${visible}\norigen: ${t}`).not.toMatch(t.includes("\\hat") ? /[$\\]/ : /[$\\^]/);
      if (/\$[^$]+\$/.test(t)) {
        conKatex++;
        expect(html, t).toContain('class="katex"');
        expect(html, t).not.toContain("katex-error");
      }
    }
    expect(conKatex).toBeGreaterThan(300);
  }, 60_000);

  it("un string sin $ se renderiza igual que texto plano (retrocompatible)", () => {
    const html = renderToStaticMarkup(createElement(MathText, { texto: "Aumenta" }));
    expect(textoVisible(html)).toBe("Aumenta");
    expect(html).not.toContain("katex");
  });
});

describe("Trigonometría: valores exactos del círculo verificados numéricamente", () => {
  // Independiente del generador: lee el texto plano y lo evalúa con Math.sin/cos/tan.
  function evaluar(v: string): number {
    if (v === "indefinido") return NaN;
    const neg = v.startsWith("-");
    const cuerpo = neg ? v.slice(1) : v;
    const [n, d] = cuerpo.split("/");
    const num = n.startsWith("√") ? Math.sqrt(Number(n.slice(1))) : Number(n);
    const val = num / (d === undefined ? 1 : Number(d));
    return neg ? -val : val;
  }
  function anguloRad(txt: string): number {
    const g = /^(\d+)°$/.exec(txt);
    if (g) return (Number(g[1]) * Math.PI) / 180;
    const r = /^(\d*)π(?:\/(\d+))?$/.exec(txt);
    if (r) return (Number(r[1] || 1) * Math.PI) / Number(r[2] ?? 1);
    if (txt === "0") return 0;
    throw new Error(`ángulo no reconocido: ${txt}`);
  }

  it("modo círculo: la respuesta coincide con sen/cos/tan real (300 pulls) y la opción correcta es una de las opciones", () => {
    for (let i = 0; i < 300; i++) {
      const p = generarProblemaTrigonometria("circulo", 1 + (i % 10));
      if (p.entrada !== "opciones") throw new Error("círculo debe ser de opciones");
      expect(p.opciones).toContain(p.respuesta);
      const e = textoPlano(p.enunciado);
      const m = /^¿Cuánto es (sen|cos|tan)\((.+)\)\? Valor exacto/.exec(e);
      expect(m, e).not.toBeNull();
      const rad = anguloRad(m![2]);
      const fn = m![1] === "sen" ? Math.sin : m![1] === "cos" ? Math.cos : Math.tan;
      const esperado = fn(rad);
      const dado = evaluar(textoPlano(p.respuesta));
      if (Number.isNaN(dado)) {
        expect(Math.abs(esperado)).toBeGreaterThan(1e10); // tan(90°), tan(270°)
      } else {
        expect(dado).toBeCloseTo(esperado, 9);
      }
    }
  });
});

describe("puntos de render: los componentes que muestran preguntas usan MathText", () => {
  const raiz = path.resolve(__dirname, "../..");
  const leer = (rel: string) => fs.readFileSync(path.join(raiz, rel), "utf8");

  it("runners de Calculia/Circuitia/Estadística/Trigonometría: enunciado y botones de opción", () => {
    for (const f of [
      "app/[locale]/calculia/CalculiaSprintRunner.tsx",
      "app/[locale]/circuitia/CircuitiaSprintRunner.tsx",
      "app/[locale]/estadistica/EstadisticaSprintRunner.tsx",
      "app/[locale]/trigonometria/TrigonometriaSprintRunner.tsx",
    ]) {
      const s = leer(f);
      expect(s, f).toContain("<MathText texto={problema.enunciado} />");
      expect(s, f).toContain("<MathText texto={op} />");
    }
  });

  it("diagnósticos, resúmenes de errores, reto diario y 'respuesta correcta' pasan por MathText", () => {
    for (const f of [
      "app/[locale]/calculia/diagnostico/DiagnosticoCalculiaClient.tsx",
      "app/[locale]/circuitia/diagnostico/DiagnosticoCircuitiaClient.tsx",
      "app/[locale]/estadistica/diagnostico/DiagnosticoEstadisticaClient.tsx",
      "app/[locale]/trigonometria/diagnostico/DiagnosticoTrigonometriaClient.tsx",
    ]) {
      expect(leer(f), f).toContain("<MathText texto={pregunta.enunciado} />");
    }
    for (const f of [
      "app/[locale]/calculia/CalculiaPracticaClient.tsx",
      "app/[locale]/circuitia/CircuitiaPracticaClient.tsx",
      "app/[locale]/estadistica/EstadisticaPracticaClient.tsx",
      "app/[locale]/trigonometria/TrigonometriaPracticaClient.tsx",
    ]) {
      expect(leer(f), f).toContain("<MathText texto={String(p.respuesta)} />");
    }
    expect(leer("components/practica/RevelarRespuesta.tsx")).toContain("<MathText");
    const reto = leer("components/reto/RetoClient.tsx");
    expect(reto).toContain("<MathText texto={pregunta.enunciado} />");
    expect(reto).toContain("<MathText texto={op} />");
    expect(leer("components/EnunciadoSprintRunner.tsx")).toContain("<MathText texto={problema.enunciado} />");
  });
});
