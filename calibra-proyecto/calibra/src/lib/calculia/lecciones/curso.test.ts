import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import katex from "katex";
import { CLASES_CALCULIA, CLASES_CURSO_CALCULIA, LECCIONES_CALCULIA, LECCIONES_CALCULIA_BASE, ORDEN_CURSO_CALCULIA, TECNICAS_CALCULIA, TECNICAS_CURSO_CALCULIA } from "./index";
import { ARCHIVO_MIGRACION_CURSO_CALCULIA, generarSqlCursoCalculia } from "./sql";
import { AfirmacionFalsaTex, compilarTex, derivadaNumerica, verificarAfirmacionTex, type EntornoTex } from "./evaluadorTex";
import { ORDEN_GRUPOS_CALCULIA } from "@/lib/calculia/bloques";
import { GRUPOS_APRENDER } from "@/lib/aprender/grupos";
import { esVisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_CALCULIA } from "@/components/calculia/visuales/registro";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import {
  areaExacta,
  datosArea,
  datosEdo,
  datosSerie,
  datosTangente,
  esVisualCalculiaArea,
  esVisualCalculiaEdo,
  esVisualCalculiaSerie,
  esVisualCalculiaTangente,
  sumaInfinita,
} from "@/lib/calculia/visualesDatos";
import type { LeccionCalculia } from "./tipos";

// Curso de Calculia dividido por reglas (2026-10-06): estructura y orden,
// KaTeX, español neutro, visuales válidos, TODA igualdad evaluable de las
// lecciones nuevas es cierta (evaluadorTex), cada respuesta de cálculo es la
// única correcta, y la migración 0254 es exactamente lo generado.
// Regenerar 0254: CALCULIA_CURSO_ESCRIBIR_SQL=1 npx vitest run src/lib/calculia/lecciones/curso.test.ts

const raiz = path.resolve(__dirname, "../../../..");
const dirMigraciones = path.join(raiz, "supabase", "migrations");
const rutaMigracion = path.join(dirMigraciones, ARCHIVO_MIGRACION_CURSO_CALCULIA);
const NUEVAS = [...TECNICAS_CURSO_CALCULIA, ...CLASES_CURSO_CALCULIA];
const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_CALCULIA)]);
const porSlug = (slug: string): LeccionCalculia => NUEVAS.find((l) => l.slug === slug)!;

function textos(l: LeccionCalculia): string[] {
  const t: string[] = [l.nombre, l.descripcion, ...l.pasos];
  for (const q of l.quiz) t.push(q.pregunta, ...q.opciones, q.explicacion);
  for (const v of l.visuales) {
    if (v.titulo) t.push(v.titulo);
    if (v.tipo === "cuadros") for (const c of v.cuadros) t.push(...[c.texto, c.resaltar].filter((x): x is string => typeof x === "string"));
  }
  return t;
}
function fragmentos(l: LeccionCalculia): string[] {
  const r: string[] = [];
  for (const t of textos(l)) for (const m of t.matchAll(/\$([^$]+)\$/g)) r.push(m[1]);
  for (const v of l.visuales) if (v.tipo === "cuadros") for (const c of v.cuadros) if (c.formula) r.push(c.formula);
  return r;
}

describe("Calculia curso: estructura y orden", () => {
  it("slugs nuevos únicos, que no chocan con los sembrados; Técnicas gratis y Clases Pro", () => {
    const todos = LECCIONES_CALCULIA.map((l) => l.slug);
    expect(new Set(todos).size).toBe(todos.length);
    expect(todos.length).toBe(LECCIONES_CALCULIA_BASE.length + NUEVAS.length);
    expect(TECNICAS_CURSO_CALCULIA.every((l) => !l.requierePro)).toBe(true);
    expect(CLASES_CURSO_CALCULIA.every((l) => l.requierePro)).toBe(true);
    expect(Object.keys(ORDEN_CURSO_CALCULIA).sort()).toEqual(LECCIONES_CALCULIA_BASE.map((l) => l.slug).sort());
  });

  it("orden correlativo en toda la tabla: Técnicas 1..20 y Clases 21..40", () => {
    expect(TECNICAS_CALCULIA.map((l) => l.orden)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(CLASES_CALCULIA.map((l) => l.orden)).toEqual(Array.from({ length: 20 }, (_, i) => i + 21));
  });

  it("cada tema queda bien dividido: varias Técnicas y varias Clases, y la Clase más baja (preview gratis) sigue siendo derivadas desde cero", () => {
    const cuenta = (ls: LeccionCalculia[]) => Object.fromEntries(ORDEN_GRUPOS_CALCULIA.map((g) => [g, ls.filter((l) => l.grupo === g).length]));
    expect(cuenta(TECNICAS_CALCULIA)).toEqual({ derivadas: 5, integrales: 6, series: 5, multivariable: 4 });
    expect(cuenta(CLASES_CALCULIA)).toEqual({ derivadas: 5, integrales: 6, series: 4, multivariable: 5 });
    expect(CLASES_CALCULIA[0].slug).toBe("calculia-pro-derivadas-fundamentos");
    // Dentro de cada tema el orden respeta las dependencias: las reglas sueltas antes que el repaso que las junta.
    const orden = (slug: string) => LECCIONES_CALCULIA.find((l) => l.slug === slug)!.orden;
    for (const s of ["calculia-clase-regla-producto", "calculia-clase-regla-cociente", "calculia-clase-regla-cadena"]) expect(orden(s)).toBeLessThan(orden("calculia-pro-derivadas-producto-cociente-cadena"));
    for (const s of ["calculia-clase-exponencial-y-logaritmo", "calculia-clase-integrales-trigonometricas", "calculia-clase-sustitucion"]) expect(orden(s)).toBeLessThan(orden("calculia-pro-integrales-avanzadas"));
    expect(orden("calculia-clase-sucesiones-y-series")).toBeLessThan(orden("calculia-pro-series-geometricas"));
    expect(orden("calculia-clase-que-es-una-edo")).toBeLessThan(orden("calculia-pro-edos-separables"));
  });

  it("GRUPOS_APRENDER.calculia deriva del contenido (mismos slugs, mismo orden)", () => {
    const e = GRUPOS_APRENDER.calculia;
    expect(e.tecnicas.flatMap((g) => g.slugs)).toEqual(ORDEN_GRUPOS_CALCULIA.flatMap((g) => TECNICAS_CALCULIA.filter((l) => l.grupo === g).map((l) => l.slug)));
    expect(e.clases.flatMap((g) => g.slugs)).toEqual(ORDEN_GRUPOS_CALCULIA.flatMap((g) => CLASES_CALCULIA.filter((l) => l.grupo === g).map((l) => l.slug)));
  });

  it("Técnicas: 3-5 pasos y 3 preguntas; Clases: 6 pasos (el último, errores comunes) y 5 preguntas", () => {
    for (const t of TECNICAS_CURSO_CALCULIA) {
      expect(t.pasos.length, t.slug).toBeGreaterThanOrEqual(3);
      expect(t.pasos.length, t.slug).toBeLessThanOrEqual(5);
      expect(t.quiz.length, t.slug).toBe(3);
    }
    for (const c of CLASES_CURSO_CALCULIA) {
      expect(c.pasos.length, c.slug).toBe(6);
      expect(c.quiz.length, c.slug).toBe(5);
      expect(c.pasos[5], c.slug).toMatch(/^Errores comunes/);
    }
  });
});

describe("Calculia curso: quiz, KaTeX y español neutro", () => {
  it("la respuesta es exactamente una de las opciones, sin repetidos, con 2 a 4 opciones y explicación", () => {
    for (const l of NUEVAS) {
      for (const q of l.quiz) {
        const donde = `${l.slug}: ${q.pregunta}`;
        expect(q.opciones, donde).toContain(q.respuesta);
        expect(new Set(q.opciones).size, donde).toBe(q.opciones.length);
        expect(q.opciones.length, donde).toBeGreaterThanOrEqual(2);
        expect(q.opciones.length, donde).toBeLessThanOrEqual(4);
        expect(q.explicacion.length, donde).toBeGreaterThan(15);
      }
    }
    // La respuesta no está siempre en la misma posición.
    const posiciones = NUEVAS.flatMap((l) => l.quiz.filter((q) => q.opciones.length === 4).map((q) => q.opciones.indexOf(q.respuesta)));
    for (let i = 0; i < 4; i++) expect(posiciones.filter((x) => x === i).length / posiciones.length, `posición ${i}`).toBeLessThan(0.5);
  });

  it("todo $ está apareado y toda fórmula se renderiza con KaTeX sin error; seno se escribe sen", () => {
    for (const l of NUEVAS) {
      for (const t of textos(l)) expect((t.match(/\$/g) ?? []).length % 2, `${l.slug}: «${t}»`).toBe(0);
      for (const f of fragmentos(l)) {
        expect(() => katex.renderToString(f, { throwOnError: true }), `${l.slug}: ${f}`).not.toThrow();
        expect(f, l.slug).not.toContain("\\sin");
      }
    }
  });

  it("sin voseo", () => {
    for (const l of NUEVAS) expect(detectarVoseo(textos(l).join("\n")), l.slug).toEqual([]);
  });
});

describe("Calculia curso: visuales", () => {
  it("toda lección tiene al menos un visual de tipo conocido, con despuesDePaso válido, que pasa su validador y se puede calcular", () => {
    for (const l of NUEVAS) {
      expect(l.visuales.length, l.slug).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales) {
        expect(esVisualLeccion(v), l.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${l.slug}: ${v.tipo}`).toBe(true);
        expect(v.despuesDePaso!, l.slug).toBeLessThan(l.pasos.length);
        if (v.tipo === "calculia.tangente") {
          expect(esVisualCalculiaTangente(v), l.slug).toBe(true);
          expect(() => datosTangente(v)).not.toThrow();
        }
        if (v.tipo === "calculia.area") {
          expect(esVisualCalculiaArea(v), l.slug).toBe(true);
          expect(() => datosArea(v)).not.toThrow();
        }
        if (v.tipo === "calculia.serie") {
          expect(esVisualCalculiaSerie(v), l.slug).toBe(true);
          expect(() => datosSerie(v)).not.toThrow();
        }
        if (v.tipo === "calculia.edo") {
          expect(esVisualCalculiaEdo(v), l.slug).toBe(true);
          expect(() => datosEdo(v)).not.toThrow();
        }
        if (v.tipo === "cuadros") expect(v.cuadros.length, l.slug).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("lo que dicen los títulos de los visuales coincide con sus datos (áreas, sumas y pendientes)", () => {
    const simpson = (f: (x: number) => number, a: number, b: number) => {
      const n = 200;
      const h = (b - a) / n;
      let s = f(a) + f(b);
      for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
      return (s * h) / 3;
    };
    const areas: Record<string, number> = {
      "calculia-tec-integral-potencia": 8,
      "calculia-clase-integral-definida|1": 8,
      "calculia-clase-integral-definida|2": 10,
    };
    for (const l of NUEVAS) {
      let k = 0;
      for (const v of l.visuales) {
        if (v.tipo !== "calculia.area") continue;
        k++;
        const exacta = areaExacta(v.funcion, v.desde, v.hasta);
        const f = (x: number) => v.funcion.reduce((s, t) => s + (t.tipo === "potencia" ? t.c * x ** t.n : t.c * (t.a * x + t.b) ** t.n), 0);
        expect(exacta, l.slug).toBeCloseTo(simpson(f, v.desde, v.hasta), 6);
        const esperado = areas[l.slug] ?? areas[`${l.slug}|${k}`];
        if (esperado !== undefined) expect(exacta, `${l.slug} área ${k}`).toBeCloseTo(esperado, 10);
      }
    }
    // Las series de los títulos: 3/(1-1/2) = 6, 4/(1-1/2) = 8, 1/(1-1/2) = 2 y a_n = 4·(1/2)^n empieza en 2.
    expect(sumaInfinita(3, 1 / 2)).toBeCloseTo(6, 12);
    expect(sumaInfinita(4, 1 / 2)).toBeCloseTo(8, 12);
    expect(sumaInfinita(1, 1 / 2)).toBeCloseTo(2, 12);
    const razon = porSlug("calculia-clase-criterio-de-la-razon").visuales.find((v) => v.tipo === "calculia.serie")!;
    expect(razon.tipo === "calculia.serie" && razon.a).toBe(4 * (1 / 2));
    // Pendientes de las tangentes: f'(x0) por diferencia finita.
    const pendientes: Record<string, number> = { "calculia-tec-potencia-baja-exponente": 3, "calculia-clase-regla-producto": 6, "calculia-clase-regla-cadena": 6 };
    for (const [slug, esperado] of Object.entries(pendientes)) {
      const v = porSlug(slug).visuales.find((x) => x.tipo === "calculia.tangente")!;
      if (v.tipo !== "calculia.tangente") throw new Error("sin tangente");
      const f = (x: number) => v.funcion.reduce((s, t) => s + (t.tipo === "potencia" ? t.c * x ** t.n : t.c * (t.a * x + t.b) ** t.n), 0);
      const h = 1e-6;
      expect((f(v.x0 + h) - f(v.x0 - h)) / (2 * h), slug).toBeCloseTo(esperado, 4);
      expect(datosTangente(v).pendiente, slug).toBeCloseTo(esperado, 2);
    }
    // Series p de los resaltados: con 10 términos (p = 2) suma 1,55 y la armónica pasa de 7 con 1000.
    const sp = (p: number, n: number) => Array.from({ length: n }, (_, i) => 1 / (i + 1) ** p).reduce((a, b) => a + b, 0);
    expect(sp(2, 10).toFixed(2)).toBe("1.55");
    expect(sp(1, 1000)).toBeGreaterThan(7);
    expect(Math.PI ** 2 / 6).toBeCloseTo(1.645, 3);
  });
});

describe("Calculia curso: toda igualdad evaluable es cierta", () => {
  it("pasos, quiz, títulos y cuadros: ninguna igualdad falsa, y muchas verificadas", () => {
    const falsas: string[] = [];
    let verificadas = 0;
    for (const l of NUEVAS) {
      for (const f of new Set(fragmentos(l))) {
        if (!f.includes("=")) continue;
        try {
          const r = verificarAfirmacionTex(f);
          if (r.estado === "verificada") verificadas += r.igualdades;
        } catch (e) {
          if (e instanceof AfirmacionFalsaTex) falsas.push(`${l.slug}: ${e.message}`);
          // otro error = símbolos que el evaluador no conoce (u, v, ∂, Σ, lim): no se evalúa
        }
      }
    }
    expect(falsas).toEqual([]);
    expect(verificadas).toBeGreaterThan(70);
  });

  it("afirmaciones con parciales y series que el evaluador no lee solo se comprueban aparte", () => {
    const parcialX = (f: (x: number, y: number) => number) => (e: EntornoTex) => (f(e.x + 1e-5, e.y) - f(e.x - 1e-5, e.y)) / 2e-5;
    const parcialY = (f: (x: number, y: number) => number) => (e: EntornoTex) => (f(e.x, e.y + 1e-5) - f(e.x, e.y - 1e-5)) / 2e-5;
    const igual = (a: (e: EntornoTex) => number, b: (e: EntornoTex) => number) =>
      [{ x: 0.6, y: 1.5 }, { x: 1.4, y: 0.8 }, { x: 2.3, y: 2.1 }].every((p) => Math.abs(a(p) - b(p)) <= 1e-4 * Math.max(1, Math.abs(a(p))));
    const f1 = (x: number, y: number) => 4 * x ** 3 * y ** 2 + 5 * x ** 2 + 7 * y ** 3;
    expect(igual(compilarTex("12x^{2}y^{2} + 10x"), parcialX(f1))).toBe(true);
    expect(igual(compilarTex("8x^{3}y + 21y^{2}"), parcialY(f1))).toBe(true);
    const f2 = (x: number, y: number) => 3 * x ** 2 * y + 5 * x * y ** 3 - 2 * y ** 2;
    expect(igual(compilarTex("6xy + 5y^{3}"), parcialX(f2))).toBe(true);
    expect(igual(compilarTex("3x^{2} + 15xy^{2} - 4y"), parcialY(f2))).toBe(true);
    expect(parcialX(f2)({ x: 1, y: 2 })).toBeCloseTo(52, 4);
    // Los textos dicen exactamente eso.
    expect(porSlug("calculia-tec-parcial-terminos-mixtos").pasos.join(" ")).toContain("$12x^{2}y^{2} + 10x$");
    expect(porSlug("calculia-tec-parcial-terminos-mixtos").pasos.join(" ")).toContain("$8x^{3}y + 21y^{2}$");
    expect(porSlug("calculia-clase-parciales-polinomios").pasos.join(" ")).toContain("$6xy + 5y^{3}$");
    expect(porSlug("calculia-clase-parciales-polinomios").pasos.join(" ")).toContain("$3x^{2} + 15xy^{2} - 4y$");
    // Criterio de la razón con 2^n/n: el cociente es 2n/(n+1), que tiende a 2.
    const a = (n: number) => 2 ** n / n;
    for (const n of [3, 10, 40]) expect(a(n + 1) / a(n)).toBeCloseTo((2 * n) / (n + 1), 10);
    // Crecimiento exponencial: 200e ≈ 544 y ln 2 / 0,5 ≈ 1,39.
    expect(Math.round(200 * Math.E)).toBe(544);
    expect((Math.log(2) / 0.5).toFixed(2)).toBe("1.39");
  });
});

// La respuesta marcada de cada pregunta de cálculo es correcta y ninguna otra opción lo es.
describe("Calculia curso: respuestas de cálculo recalculadas", () => {
  const limpia = (s: string) => s.replace(/^\$|\$$/g, "").replace(/\s*\+\s*C\s*$/, "");
  const pts: EntornoTex[] = [
    { x: 0.6, y: 1.5 },
    { x: 1.4, y: 0.8 },
    { x: 2.3, y: 2.1 },
  ];
  const igual = (a: (e: EntornoTex) => number, b: (e: EntornoTex) => number) => pts.every((p) => Math.abs(a(p) - b(p)) <= 1e-5 * Math.max(1, Math.abs(b(p))));
  const D = (f: (x: number) => number) => (e: EntornoTex) => derivadaNumerica((z) => f(z.x), e);
  const I = (f: (x: number) => number) => (e: EntornoTex) => f(e.x);
  const px = (f: (x: number, y: number) => number) => (e: EntornoTex) => (f(e.x + 1e-5, e.y) - f(e.x - 1e-5, e.y)) / 2e-5;
  const py = (f: (x: number, y: number) => number) => (e: EntornoTex) => (f(e.x, e.y + 1e-5) - f(e.x, e.y - 1e-5)) / 2e-5;
  type Calc = [slug: string, inicio: string, objetivo: (e: EntornoTex) => number, modo: "funcion" | "antiderivada"];
  const CALCULOS: Calc[] = [
    ["calculia-tec-potencia-baja-exponente", "Deriva $f(x) = 7x^{4}$", D((x) => 7 * x ** 4), "funcion"],
    ["calculia-tec-potencia-baja-exponente", "Deriva $f(x) = x^{6} - 5x + 2$", D((x) => x ** 6 - 5 * x + 2), "funcion"],
    ["calculia-tec-potencia-baja-exponente", "¿Cuál es la derivada de $f(x) = 8x$", D((x) => 8 * x), "funcion"],
    ["calculia-tec-producto-mnemotecnia", "Con la regla del producto, deriva", D((x) => x ** 3 * (x ** 2 + 4)), "funcion"],
    ["calculia-tec-cociente-mnemotecnia", "Deriva $f(x) = \\dfrac{2x}{x+3}$", D((x) => (2 * x) / (x + 3)), "funcion"],
    ["calculia-tec-cadena-afuera-adentro", "Deriva $f(x) = (5x-1)^{3}$", D((x) => (5 * x - 1) ** 3), "funcion"],
    ["calculia-tec-cadena-afuera-adentro", "Deriva $f(x) = (x^{2}+1)^{5}$", D((x) => (x * x + 1) ** 5), "funcion"],
    ["calculia-tec-integral-potencia", "Calcula $\\int 8x^{3}", I((x) => 8 * x ** 3), "antiderivada"],
    ["calculia-tec-integral-potencia", "Calcula $\\int 5\\,dx", I(() => 5), "antiderivada"],
    ["calculia-tec-integral-uno-sobre-x", "Calcula $\\int \\dfrac{5}{x}", I((x) => 5 / x), "antiderivada"],
    ["calculia-tec-integral-uno-sobre-x", "¿Cuál es la derivada de $\\ln|x|$", D((x) => Math.log(Math.abs(x))), "funcion"],
    ["calculia-tec-integral-exponencial", "Calcula $\\int e^{4x}", I((x) => Math.exp(4 * x)), "antiderivada"],
    ["calculia-tec-integral-exponencial", "Calcula $\\int 10e^{5x}", I((x) => 10 * Math.exp(5 * x)), "antiderivada"],
    ["calculia-tec-integral-exponencial", "¿Cuál es la derivada de $e^{x}$", D((x) => Math.exp(x)), "funcion"],
    ["calculia-tec-integral-seno-coseno", "Calcula $\\int 6\\cos(x)", I((x) => 6 * Math.cos(x)), "antiderivada"],
    ["calculia-tec-integral-seno-coseno", "Calcula $\\int 2\\operatorname{sen}(x)", I((x) => 2 * Math.sin(x)), "antiderivada"],
    ["calculia-tec-integral-seno-coseno", "¿Cuál es la derivada de $\\cos(x)$", D((x) => Math.cos(x)), "funcion"],
    ["calculia-tec-sustitucion-reconocer", "Calcula $\\int 12(3x+1)^{3}", I((x) => 12 * (3 * x + 1) ** 3), "antiderivada"],
    ["calculia-tec-parcial-terminos-mixtos", "Para $f(x,y) = 3x^{2}y^{4} + 2y$, calcula $\\dfrac{\\partial f}{\\partial x}$", px((x, y) => 3 * x * x * y ** 4 + 2 * y), "funcion"],
    ["calculia-tec-parcial-terminos-mixtos", "Para $f(x,y) = 3x^{2}y^{4} + 2y$, calcula $\\dfrac{\\partial f}{\\partial y}$", py((x, y) => 3 * x * x * y ** 4 + 2 * y), "funcion"],
    ["calculia-clase-regla-producto", "Deriva $f(x) = x^{2}(x^{3} + 5)$", D((x) => x * x * (x ** 3 + 5)), "funcion"],
    ["calculia-clase-regla-producto", "Deriva $f(x) = x\\cdot e^{x}$", D((x) => x * Math.exp(x)), "funcion"],
    ["calculia-clase-regla-cociente", "Deriva $f(x) = \\dfrac{x}{x+1}$", D((x) => x / (x + 1)), "funcion"],
    ["calculia-clase-regla-cociente", "Deriva $f(x) = \\dfrac{2x^{2}}{x+3}$", D((x) => (2 * x * x) / (x + 3)), "funcion"],
    ["calculia-clase-regla-cociente", "¿Cuál es la derivada de $\\dfrac{3}{x}$", D((x) => 3 / x), "funcion"],
    ["calculia-clase-regla-cadena", "Deriva $f(x) = (4x-3)^{5}$", D((x) => (4 * x - 3) ** 5), "funcion"],
    ["calculia-clase-regla-cadena", "Deriva $f(x) = e^{6x}$", D((x) => Math.exp(6 * x)), "funcion"],
    ["calculia-clase-regla-cadena", "Deriva $f(x) = \\cos(2x)$", D((x) => Math.cos(2 * x)), "funcion"],
    ["calculia-clase-regla-cadena", "Deriva $f(x) = (x^{3}+2)^{2}$", D((x) => (x ** 3 + 2) ** 2), "funcion"],
    ["calculia-clase-exponencial-y-logaritmo", "Calcula $\\int e^{5x}", I((x) => Math.exp(5 * x)), "antiderivada"],
    ["calculia-clase-exponencial-y-logaritmo", "Calcula $\\int 8e^{2x}", I((x) => 8 * Math.exp(2 * x)), "antiderivada"],
    ["calculia-clase-exponencial-y-logaritmo", "Calcula $\\int \\dfrac{3}{x}", I((x) => 3 / x), "antiderivada"],
    ["calculia-clase-exponencial-y-logaritmo", "Calcula $\\int x^{-3}", I((x) => x ** -3), "antiderivada"],
    ["calculia-clase-integrales-trigonometricas", "Calcula $\\int 3\\operatorname{sen}(x)", I((x) => 3 * Math.sin(x)), "antiderivada"],
    ["calculia-clase-integrales-trigonometricas", "Calcula $\\int 4\\cos(x)", I((x) => 4 * Math.cos(x)), "antiderivada"],
    ["calculia-clase-integrales-trigonometricas", "Calcula $\\int \\cos(3x)", I((x) => Math.cos(3 * x)), "antiderivada"],
    ["calculia-clase-integrales-trigonometricas", "¿Cuál es la derivada de $\\operatorname{sen}(x)$", D((x) => Math.sin(x)), "funcion"],
    ["calculia-clase-sustitucion", "Calcula $\\int 8(2x+1)^{3}", I((x) => 8 * (2 * x + 1) ** 3), "antiderivada"],
    ["calculia-clase-sustitucion", "Calcula $\\int 6x(x^{2}-4)^{2}", I((x) => 6 * x * (x * x - 4) ** 2), "antiderivada"],
    ["calculia-clase-parciales-polinomios", "Para $f(x,y) = 2x^{3}y^{2} + 4y$, calcula $\\dfrac{\\partial f}{\\partial x}$", px((x, y) => 2 * x ** 3 * y * y + 4 * y), "funcion"],
    ["calculia-clase-parciales-polinomios", "Para $f(x,y) = 2x^{3}y^{2} + 4y$, calcula $\\dfrac{\\partial f}{\\partial y}$", py((x, y) => 2 * x ** 3 * y * y + 4 * y), "funcion"],
    ["calculia-clase-parciales-polinomios", "Para $f(x,y) = x^{2} + xy + y^{2}$", px((x, y) => x * x + x * y + y * y), "funcion"],
  ];

  it("cada pregunta de cálculo: la marcada coincide con el cálculo independiente y las demás no", () => {
    for (const [slug, inicio, objetivo, modo] of CALCULOS) {
      const q = porSlug(slug).quiz.find((x) => x.pregunta.startsWith(inicio));
      expect(q, `${slug}: no encontré «${inicio}»`).toBeDefined();
      const evaluar = (op: string): ((e: EntornoTex) => number) => {
        const f = compilarTex(limpia(op));
        return modo === "funcion" ? f : (e) => derivadaNumerica(f, e);
      };
      expect(igual(evaluar(q!.respuesta), objetivo), `${slug}: la respuesta ${q!.respuesta} no es correcta`).toBe(true);
      for (const op of q!.opciones.filter((o) => o !== q!.respuesta)) expect(igual(evaluar(op), objetivo), `${slug}: la opción ${op} también es correcta`).toBe(false);
    }
  });

  it("EDO: la solución marcada cumple la ecuación (derivada numérica) y los distractores no", () => {
    const casos: [string, string, (x: number, y: number) => number][] = [
      ["calculia-tec-edo-exponencial", "¿Cuál es la solución general", (_x, y) => 5 * y],
      ["calculia-clase-crecimiento-exponencial", "¿Cuál es la solución general", (_x, y) => -2 * y],
    ];
    for (const [slug, inicio, rhs] of casos) {
      const q = porSlug(slug).quiz.find((x) => x.pregunta.startsWith(inicio))!;
      const cumple = (op: string) => {
        const y = compilarTex(limpia(op).replace(/^y\s*=\s*/, ""));
        return pts.every((p) => Math.abs(derivadaNumerica(y, p) - rhs(p.x, y(p))) <= 1e-4 * Math.max(1, Math.abs(y(p))));
      };
      expect(cumple(q.respuesta), `${slug}: ${q.respuesta}`).toBe(true);
      for (const op of q.opciones.filter((o) => o !== q.respuesta)) expect(cumple(op), `${slug}: ${op}`).toBe(false);
    }
    // ¿y = 4e^{2x} resuelve dy/dx = 2y? Sí.
    const y = (x: number) => 4 * Math.exp(2 * x);
    expect(derivadaNumerica((e) => y(e.x), { x: 0.4, y: 0 })).toBeCloseTo(2 * y(0.4), 4);
  });

  it("preguntas numéricas: sumas geométricas, integrales definidas, criterio de la razón y parciales", () => {
    const resp = (slug: string, inicio: string) => porSlug(slug).quiz.find((q) => q.pregunta.startsWith(inicio))!.respuesta;
    const num = (s: string) => Number(s.replace(",", "."));
    expect(num(resp("calculia-tec-suma-geometrica", "Calcula la suma infinita con primer término 9"))).toBeCloseTo(sumaInfinita(9, 2 / 3), 10);
    expect(num(resp("calculia-tec-suma-geometrica", "Calcula la suma infinita con primer término 10"))).toBeCloseTo(sumaInfinita(10, -1 / 4), 10);
    expect(num(resp("calculia-clase-integral-definida", "Calcula $\\int_{0}^{3} 2x"))).toBeCloseTo(areaExacta([{ tipo: "potencia", c: 2, n: 1 }], 0, 3), 10);
    expect(num(resp("calculia-clase-integral-definida", "Calcula $\\int_{1}^{2} 3x^{2}"))).toBeCloseTo(areaExacta([{ tipo: "potencia", c: 3, n: 2 }], 1, 2), 10);
    expect(num(resp("calculia-clase-integral-definida", "Calcula $\\int_{0}^{1} (-4x^{3})"))).toBeCloseTo(areaExacta([{ tipo: "potencia", c: -4, n: 3 }], 0, 1), 10);
    expect(num(resp("calculia-clase-criterio-de-la-razon", "Para $a_{n} = 6"))).toBeCloseTo(2 / 5, 10);
    expect(resp("calculia-clase-criterio-de-la-razon", "Para $a_{n} = 3")).toBe(Math.abs(-5 / 4) > 1 ? "Diverge" : "Converge");
    expect(resp("calculia-tec-geometrica-converge", "¿La serie geométrica con razón $r = -")).toBe(Math.abs(-2 / 3) < 1 ? "Converge" : "Diverge");
    expect(resp("calculia-tec-geometrica-converge", "¿La serie geométrica con razón $r = \\dfrac{5}")).toBe(Math.abs(5 / 4) < 1 ? "Converge" : "Diverge");
    expect(num(resp("calculia-clase-parciales-polinomios", "Para $f(x,y) = 3x^{2}y"))).toBe(6 * 1 * 2 + 5 * 2 ** 3);
    expect(num(resp("calculia-clase-sucesiones-y-series", "¿Cuánto vale $S_{3}$"))).toBe(2 + 4 + 6);
    expect(num(resp("calculia-clase-crecimiento-exponencial", "Con $k = 0{,}5$"))).toBeCloseTo(Math.log(2) / 0.5, 2);
  });
});

describe(`Calculia curso: migración ${ARCHIVO_MIGRACION_CURSO_CALCULIA}`, () => {
  const esperado = () => generarSqlCursoCalculia(NUEVAS, ORDEN_CURSO_CALCULIA);

  it("es exactamente lo que se genera del contenido", () => {
    if (process.env.CALCULIA_CURSO_ESCRIBIR_SQL === "1") fs.writeFileSync(rutaMigracion, esperado(), "utf8");
    expect(fs.existsSync(rutaMigracion), "falta la migración").toBe(true);
    expect(fs.readFileSync(rutaMigracion, "utf8").replace(/\r\n/g, "\n")).toBe(esperado());
  });

  it("número libre, 12 UPDATE de orden y un INSERT con jsonb parseable; los slugs nuevos no están en ninguna otra migración", () => {
    expect(fs.readdirSync(dirMigraciones).filter((f) => f.startsWith(ARCHIVO_MIGRACION_CURSO_CALCULIA.slice(0, 5)))).toEqual([ARCHIVO_MIGRACION_CURSO_CALCULIA]);
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    expect((sql.match(/^update public\.techniques set orden = \d+ where problem_type = 'calculia'/gm) ?? []).length).toBe(12);
    expect((sql.match(/^insert into public\.techniques/gm) ?? []).length).toBe(1);
    let bloques = 0;
    for (const m of sql.matchAll(/\$calculia\$([\s\S]*?)\$calculia\$::jsonb/g)) {
      const c = JSON.parse(m[1]) as { pasos: string[]; quiz: { respuesta: string; opciones: string[] }[] };
      expect(c.pasos.length).toBeGreaterThan(0);
      for (const q of c.quiz) expect(q.opciones).toContain(q.respuesta);
      bloques++;
    }
    expect(bloques).toBe(NUEVAS.length);
    expect(detectarVoseo(sql)).toEqual([]);
    for (const f of fs.readdirSync(dirMigraciones).filter((n) => n.endsWith(".sql") && n !== ARCHIVO_MIGRACION_CURSO_CALCULIA)) {
      const otro = fs.readFileSync(path.join(dirMigraciones, f), "utf8");
      for (const l of NUEVAS) expect(otro.includes(`'${l.slug}'`), `${f} ya usa ${l.slug}`).toBe(false);
    }
  }, 30_000);
});
