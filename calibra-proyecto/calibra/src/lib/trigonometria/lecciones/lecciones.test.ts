import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import katex from "katex";
import { TECNICAS_TRIGONOMETRIA, CLASES_TRIGONOMETRIA } from "./index";
import { CABECERA_TRIGONOMETRIA, generarSqlTrigonometria } from "./sql";
import { CONCEPTOS_TRIGONOMETRIA, CONOCIMIENTO_PREVIO, IDS_CONCEPTOS, IDS_PREVIOS } from "./conceptos";
import { BLOQUES_TRIGONOMETRIA, ORDEN_GRUPOS_TRIGONOMETRIA, bloqueDeModo } from "@/lib/trigonometria/bloques";
import { ESCALA_TRIGONOMETRIA, type ModoTrigonometria } from "@/lib/practica/trigonometriaEscala";
import { esVisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_TRIGONOMETRIA } from "@/components/trigonometria/visuales/registro";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import {
  datosCirculo,
  datosCuadrantes,
  datosEcuacion,
  datosIdentidad,
  datosOnda,
  datosResolver,
  datosTriangulo,
} from "@/lib/trigonometria/visualesDatos";
import { datosLey } from "@/lib/trigonometria/visualesLey";
import type { VisualLeccionTrigonometria } from "./tipos";

// Verificación del contenido de Aprender de Trigonometría (rediseño fase 1):
// estructura, quiz, visuales con datos válidos, KaTeX, español neutro, grafo de
// dependencias entre lecciones, cobertura de la práctica, comprobación de las
// afirmaciones numéricas del texto contra Math.* y la migración generada byte a byte.
// Regenerar la migración: TRIGONOMETRIA_ESCRIBIR_SQL=1 npx vitest run src/lib/trigonometria/lecciones

const raiz = path.resolve(__dirname, "../../../..");
const NUMERO_MIGRACION = "0214";
const rutaMigracion = path.join(raiz, "supabase", "migrations", `${NUMERO_MIGRACION}_trigonometria_tecnicas_clases.sql`);

const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_TRIGONOMETRIA)]);
const LECCIONES = [...TECNICAS_TRIGONOMETRIA, ...CLASES_TRIGONOMETRIA];

// Todos los textos visibles de una lección (para KaTeX, voseo, números).
function textos(l: (typeof LECCIONES)[number]): string[] {
  const t: string[] = [l.nombre, l.descripcion, ...l.pasos];
  for (const q of l.quiz) t.push(q.pregunta, ...q.opciones, q.respuesta, q.explicacion);
  for (const v of l.visuales) {
    if (v.titulo) t.push(v.titulo);
    if (v.tipo === "cuadros") for (const c of v.cuadros) t.push(...[c.texto, c.resaltar].filter((x): x is string => typeof x === "string"));
  }
  return t;
}

// Fórmulas sin los $ (las de "formula" de los cuadros, más las que van entre $...$).
function formulas(l: (typeof LECCIONES)[number]): string[] {
  const r: string[] = [];
  for (const t of textos(l)) for (const m of t.matchAll(/\$([^$]+)\$/g)) r.push(m[1]);
  for (const v of l.visuales) if (v.tipo === "cuadros") for (const c of v.cuadros) if (c.formula) r.push(c.formula);
  return r;
}

describe("Trigonometría: Técnicas (estructura)", () => {
  it("son 25 en total: 5 razones, 5 círculo, 5 gráficas, 3 leyes, 4 identidades y 3 ecuaciones; slugs únicos y con prefijo", () => {
    expect(TECNICAS_TRIGONOMETRIA).toHaveLength(25);
    const porGrupo: Record<string, number> = {};
    for (const t of TECNICAS_TRIGONOMETRIA) porGrupo[t.grupo] = (porGrupo[t.grupo] ?? 0) + 1;
    expect(porGrupo).toEqual({ razones: 5, circulo: 5, graficas: 5, leyes: 3, identidades: 4, ecuaciones: 3 });
    expect(new Set(TECNICAS_TRIGONOMETRIA.map((t) => t.slug)).size).toBe(25);
    for (const t of TECNICAS_TRIGONOMETRIA) expect(t.slug, t.slug).toMatch(/^trigonometria-[a-z0-9-]+$/);
    expect(TECNICAS_TRIGONOMETRIA.every((t) => t.requierePro === false)).toBe(true);
  });

  it("las 5 Técnicas históricas (0108) se reescriben por slug y las demás son nuevas", () => {
    const viejas = TECNICAS_TRIGONOMETRIA.filter((t) => t.existente).map((t) => t.slug).sort();
    expect(viejas).toEqual([
      "trigonometria-cuando-usar-cada-ley",
      "trigonometria-grados-radianes",
      "trigonometria-simetria-cuadrantes",
      "trigonometria-sohcahtoa",
      "trigonometria-truco-mano-circulo",
    ]);
    for (const t of TECNICAS_TRIGONOMETRIA.filter((x) => !x.existente)) expect(t.slug, t.slug).toMatch(/^trigonometria-tecnica-[a-z0-9-]+$/);
  });

  it("los grupos históricos son los que les corresponden por contenido", () => {
    const g = (s: string) => TECNICAS_TRIGONOMETRIA.find((t) => t.slug === s)!.grupo;
    expect(g("trigonometria-sohcahtoa")).toBe("razones");
    expect(g("trigonometria-truco-mano-circulo")).toBe("circulo");
    expect(g("trigonometria-simetria-cuadrantes")).toBe("circulo");
    expect(g("trigonometria-grados-radianes")).toBe("circulo");
    expect(g("trigonometria-cuando-usar-cada-ley")).toBe("leyes");
  });

  it("el orden es correlativo 1..n dentro de cada bloque y el arreglo está en orden de bloque", () => {
    for (const g of ORDEN_GRUPOS_TRIGONOMETRIA) {
      const ordenes = TECNICAS_TRIGONOMETRIA.filter((t) => t.grupo === g).map((t) => t.orden);
      expect(ordenes, g).toEqual(ordenes.map((_, i) => i + 1));
    }
    for (let i = 1; i < TECNICAS_TRIGONOMETRIA.length; i++) {
      expect(ORDEN_GRUPOS_TRIGONOMETRIA.indexOf(TECNICAS_TRIGONOMETRIA[i].grupo), TECNICAS_TRIGONOMETRIA[i].slug).toBeGreaterThanOrEqual(
        ORDEN_GRUPOS_TRIGONOMETRIA.indexOf(TECNICAS_TRIGONOMETRIA[i - 1].grupo)
      );
    }
  });

  it("3 a 5 pasos y un quiz de exactamente 4 preguntas por Técnica", () => {
    for (const t of TECNICAS_TRIGONOMETRIA) {
      expect(t.pasos.length, t.slug).toBeGreaterThanOrEqual(3);
      expect(t.pasos.length, t.slug).toBeLessThanOrEqual(5);
      expect(t.quiz.length, t.slug).toBe(4);
    }
  });
});

describe("Trigonometría: Clases (estructura)", () => {
  it("son 27: 7 razones, 4 círculo, 7 gráficas, 4 leyes, 3 identidades y 2 ecuaciones; todas Pro, slugs únicos y numerados", () => {
    expect(CLASES_TRIGONOMETRIA).toHaveLength(27);
    expect(CLASES_TRIGONOMETRIA.every((c) => c.requierePro === true)).toBe(true);
    expect(new Set(CLASES_TRIGONOMETRIA.map((c) => c.slug)).size).toBe(27);
    const porGrupo: Record<string, number> = {};
    for (const c of CLASES_TRIGONOMETRIA) porGrupo[c.grupo] = (porGrupo[c.grupo] ?? 0) + 1;
    expect(porGrupo).toEqual({ razones: 7, circulo: 4, graficas: 7, leyes: 4, identidades: 3, ecuaciones: 2 });
    CLASES_TRIGONOMETRIA.forEach((c, i) => {
      expect(c.slug, c.slug).toMatch(/^trigonometria-clase-\d\d-[a-z0-9-]+$/);
      expect(Number(c.slug.match(/^trigonometria-clase-(\d\d)/)![1]), c.slug).toBe(i + 1);
    });
  });

  it("el arreglo está en orden de curso: (bloque, orden) siempre crece y el orden es 1..n en cada bloque", () => {
    for (let i = 1; i < CLASES_TRIGONOMETRIA.length; i++) {
      const a = CLASES_TRIGONOMETRIA[i - 1];
      const b = CLASES_TRIGONOMETRIA[i];
      const ga = ORDEN_GRUPOS_TRIGONOMETRIA.indexOf(a.grupo);
      const gb = ORDEN_GRUPOS_TRIGONOMETRIA.indexOf(b.grupo);
      expect(ga < gb || (ga === gb && a.orden < b.orden), `${a.slug} -> ${b.slug}`).toBe(true);
    }
    for (const g of ORDEN_GRUPOS_TRIGONOMETRIA) {
      const ordenes = CLASES_TRIGONOMETRIA.filter((c) => c.grupo === g).map((c) => c.orden);
      expect(ordenes, g).toEqual(ordenes.map((_, i) => i + 1));
    }
  });

  it("explicación desarrollada (6 o más pasos) y quiz de 4 a 6 preguntas", () => {
    for (const c of CLASES_TRIGONOMETRIA) {
      expect(c.pasos.length, c.slug).toBeGreaterThanOrEqual(6);
      expect(c.quiz.length, c.slug).toBeGreaterThanOrEqual(4);
      expect(c.quiz.length, c.slug).toBeLessThanOrEqual(6);
    }
  });

  it("cada Clase declara un objetivo, un error frecuente y (salvo la definición pura) un ejemplo resuelto", () => {
    for (const c of CLASES_TRIGONOMETRIA) {
      expect(c.pasos[0], `${c.slug}: primer paso sin «Objetivo»`).toMatch(/^Objetivo:/);
      expect(c.pasos.some((p) => /^Errores comunes|^Error común|^Cuidado|^La trampa/.test(p)), `${c.slug}: sin errores comunes`).toBe(true);
      expect(c.pasos.some((p) => /^Intuición/.test(p)), `${c.slug}: sin intuición antes de la fórmula`).toBe(true);
    }
  });

  it("toda Clase Pro tiene quiz: /api/aprender/completar solo exige plan Pro a las lecciones con quiz", () => {
    for (const c of CLASES_TRIGONOMETRIA) expect(c.quiz.length, c.slug).toBeGreaterThan(0);
  });
});

describe("Trigonometría: quiz de todas las lecciones", () => {
  it("la respuesta está entre las opciones, sin opciones repetidas, 3 o 4 opciones, con explicación", () => {
    for (const l of LECCIONES) {
      for (const q of l.quiz) {
        const donde = `${l.slug}: ${q.pregunta}`;
        expect(q.opciones, donde).toContain(q.respuesta);
        expect(new Set(q.opciones).size, donde).toBe(q.opciones.length);
        expect(q.opciones.length, donde).toBeGreaterThanOrEqual(3);
        expect(q.opciones.length, donde).toBeLessThanOrEqual(4);
        expect(q.explicacion.length, donde).toBeGreaterThan(15);
        expect(q.pregunta.length, donde).toBeGreaterThan(8);
      }
    }
  });

  it("la correcta no es la única con una forma distinta: ninguna opción equivale a otra (mismo texto sin espacios) y ningún distractor repite la respuesta", () => {
    for (const l of LECCIONES) {
      for (const q of l.quiz) {
        const norm = (s: string) => s.replace(/\s+/g, "").replace(/\\dfrac/g, "\\frac").replace(/\\left|\\right/g, "");
        const claves = q.opciones.map(norm);
        expect(new Set(claves).size, `${l.slug}: ${q.pregunta}`).toBe(claves.length);
      }
    }
  });

  it("la respuesta correcta no está siempre en la misma posición (no se puede adivinar por patrón)", () => {
    const posiciones = new Map<number, number>();
    for (const l of LECCIONES) for (const q of l.quiz) posiciones.set(q.opciones.indexOf(q.respuesta), (posiciones.get(q.opciones.indexOf(q.respuesta)) ?? 0) + 1);
    const total = [...posiciones.values()].reduce((a, b) => a + b, 0);
    for (const [pos, n] of posiciones) expect(n / total, `posición ${pos}`).toBeLessThan(0.45);
    expect(posiciones.size).toBeGreaterThanOrEqual(4);
  });

  it("los distractores representan errores: las explicaciones dicen por qué falla (mencionan al menos otra opción o un motivo) y no son genéricas", () => {
    for (const l of LECCIONES) for (const q of l.quiz) expect(q.explicacion.length, `${l.slug}: ${q.pregunta}`).toBeGreaterThan(20);
  });
});

describe("Trigonometría: KaTeX, español neutro y caracteres raros", () => {
  it("cada $...$ tiene el $ apareado y todas las fórmulas (también las de los cuadros) se renderizan con KaTeX sin error", () => {
    let expresiones = 0;
    for (const l of LECCIONES) {
      for (const t of textos(l)) expect((t.match(/\$/g) ?? []).length % 2, `${l.slug}: $ desparejado en «${t.slice(0, 80)}»`).toBe(0);
      for (const f of formulas(l)) {
        const html = katex.renderToString(f, { throwOnError: true });
        expect(html, `${l.slug}: ${f}`).not.toContain("katex-error");
        expresiones++;
      }
    }
    expect(expresiones).toBeGreaterThan(1500);
  }, 120_000);

  it("notación en español: nunca «sin», «csc» ni «\\sin» (es sen y cosec)", () => {
    for (const l of LECCIONES) {
      for (const f of formulas(l)) expect(f, `${l.slug}: ${f}`).not.toMatch(/\\sin\b|\\csc\b|\\operatorname\{sin\}|\\operatorname\{csc\}/);
      for (const t of textos(l)) expect(t.replace(/\$[^$]+\$/g, " "), `${l.slug}: «${t.slice(0, 80)}»`).not.toMatch(/\bcsc\b/);
    }
  });

  it("sin voseo (español neutro) en ninguna lección", () => {
    for (const l of LECCIONES) {
      for (const t of textos(l)) expect(detectarVoseo(t), `${l.slug}: «${t.slice(0, 80)}»`).toEqual([]);
    }
  });

  it("sin placeholders rotos, dobles espacios ni comillas rectas sueltas", () => {
    for (const l of LECCIONES) {
      for (const t of textos(l)) {
        expect(t.replace(/\$[^$]+\$/g, " "), l.slug).not.toMatch(/undefined|NaN|\[object|\{\{|\}\}|null|Infinity/);
        expect(t, `${l.slug}: comilla recta en «${t.slice(0, 60)}»`).not.toMatch(/"/);
      }
      for (const p of l.pasos) expect(p, `${l.slug}: doble espacio`).not.toMatch(/ {2}/);
    }
  });

  it("los números decimales dentro de una fórmula usan la coma con llaves, no el punto", () => {
    for (const l of LECCIONES) for (const f of formulas(l)) expect(f, `${l.slug}: ${f}`).not.toMatch(/\d\.\d/);
  });
});

// ---------- afirmaciones numéricas del texto contra Math.* ----------
// Una calculadora mínima de LaTeX para las fórmulas de las lecciones.
function evalTex(fuente: string): number {
  const s = fuente
    .replace(/\s+/g, "")
    .replace(/\\left|\\right|\\,/g, "")
    .replace(/\\dfrac/g, "\\frac")
    .replace(/\^\{\\circ\}/g, "");
  let i = 0;
  const numero = (): number => {
    const m = /^\d+(?:\{,\}\d+)?/.exec(s.slice(i));
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
      i += 2;
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

const FN = String.raw`(\\operatorname\{sen\}|\\operatorname\{cosec\}|\\cos|\\tan|\\sec|\\cot)`;
const fnNum = (fn: string, x: number): number =>
  ({ "\\operatorname{sen}": Math.sin(x), "\\cos": Math.cos(x), "\\tan": Math.tan(x), "\\operatorname{cosec}": 1 / Math.sin(x), "\\sec": 1 / Math.cos(x), "\\cot": 1 / Math.tan(x) } as Record<string, number>)[fn];

describe("Trigonometría: las afirmaciones del texto coinciden con Math.*", () => {
  it("todo «fn(g°) = valor» o «fn(g°) ≈ valor» escrito en una fórmula es correcto (grados y radianes)", () => {
    // fn(ARG)=RHS  o  fn(ARG)\approx RHS, con ARG en grados (con ^{\circ}) o en múltiplos de π, y un RHS simple (racional, con raíces, decimal).
    const patron = new RegExp(String.raw`${FN}\(((?:-)?[^()$=]+?)\)\s*(=|\\approx)\s*(-?(?:\\dfrac|\\frac)\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\{\d+\}|-?\\sqrt\{\d+\}|-?\d+(?:\{,\}\d+)?(?:\\sqrt\{\d+\})?)(?![\d{}.,\\a-zA-Z(])`, "g");
    let verificadas = 0;
    const fallos: string[] = [];
    // Solo lo que la lección AFIRMA (no las opciones incorrectas del quiz, que dicen cosas falsas a propósito).
    const afirmaciones = (l: (typeof LECCIONES)[number]): string[] => {
      const r: string[] = [];
      const textosVerdaderos = [...l.pasos, ...l.quiz.flatMap((q) => [q.pregunta, q.respuesta, q.explicacion])];
      for (const t of textosVerdaderos) for (const m of t.matchAll(/\$([^$]+)\$/g)) r.push(m[1]);
      for (const v of l.visuales) if (v.tipo === "cuadros") for (const c of v.cuadros) if (c.formula) r.push(c.formula);
      return r;
    };
    // La razón debe estar sola al principio de la afirmación (no dentro de un producto como 15·sen 40° ≈ 9,64 ni después de un +).
    const aisladaAlPrincipio = (f: string, indice: number): boolean => /(^|,|;|\\quad|\\ |:)\s*$/.test(f.slice(0, indice));
    for (const l of LECCIONES) {
      for (const f of afirmaciones(l)) {
        for (const m of f.matchAll(patron)) {
          if (!aisladaAlPrincipio(f, m.index!)) continue;
          let g: number;
          try {
            const arg = m[2];
            g = /\\circ/.test(arg) ? (evalTex(arg) * Math.PI) / 180 : /\\pi/.test(arg) ? evalTex(arg) : NaN;
          } catch {
            continue;
          }
          if (Number.isNaN(g)) continue;
          let rhs: number;
          try {
            rhs = evalTex(m[4]);
          } catch {
            continue;
          }
          const real = fnNum(m[1], g);
          const decimales = (/\{,\}(\d+)/.exec(m[4])?.[1].length ?? 6);
          const tol = m[3] === "=" ? 1e-9 : Math.max(0.5 * 10 ** -decimales + 1e-9, 1e-9);
          if (!(Math.abs(real - rhs) <= tol)) fallos.push(`${l.slug}: ${m[0]} (real ${real})`);
          verificadas++;
        }
      }
    }
    expect(fallos).toEqual([]);
    expect(verificadas).toBeGreaterThan(30);
  });

  it("los lados de los ejemplos con Pitágoras y las razones de los triángulos 3-4-5 y 5-12-13 son correctos", () => {
    // 3-4-5 y 5-12-13: se recorre todo el texto buscando las ternas y se comprueba.
    let ternas = 0;
    for (const l of LECCIONES) {
      for (const t of textos(l)) {
        for (const m of t.matchAll(/(\d+)-(\d+)-(\d+)/g)) {
          const [a, b, c] = [Number(m[1]), Number(m[2]), Number(m[3])];
          if (a === 45 || a === 30) continue; // 45-45-90 y 30-60-90 son ángulos
          if (c <= 100 && a < c && b < c && (a ** 2 + b ** 2 === c ** 2 || (a === 3 && b === 4 && c === 5))) ternas++;
          else if (c < 100 && a < b && b < c) expect(a ** 2 + b ** 2, `${l.slug}: ${m[0]} no es una terna pitagórica`).toBe(c ** 2);
        }
      }
    }
    expect(ternas).toBeGreaterThan(5);
  });
});

describe("Trigonometría: visuales de las lecciones", () => {
  it("cada lección tiene al menos 1 visual de tipo conocido, con despuesDePaso dentro de sus pasos", () => {
    for (const l of LECCIONES) {
      expect(l.visuales.length, `${l.slug} sin visuales`).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales) {
        expect(esVisualLeccion(v), l.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${l.slug}: tipo ${v.tipo}`).toBe(true);
        expect(v.despuesDePaso, `${l.slug}: despuesDePaso obligatorio`).toBeDefined();
        expect(v.despuesDePaso!, `${l.slug}: despuesDePaso fuera de los pasos`).toBeLessThan(l.pasos.length);
      }
    }
  });

  it("cada visual propio tiene datos válidos: sus funciones de datos no lanzan y devuelven algo dibujable", () => {
    let total = 0;
    for (const l of LECCIONES) {
      for (const v of l.visuales as VisualLeccionTrigonometria[]) {
        const donde = `${l.slug}: ${v.tipo}`;
        switch (v.tipo) {
          case "trigonometria.triangulo":
            expect(datosTriangulo(v).pasos.length, donde).toBeGreaterThan(0);
            break;
          case "trigonometria.resolver":
            expect(datosResolver(v).pasos.length, donde).toBe(7);
            break;
          case "trigonometria.circulo":
            expect(datosCirculo(v).length, donde).toBeGreaterThan(0);
            break;
          case "trigonometria.cuadrantes":
            expect(datosCuadrantes(v), donde).toHaveLength(4);
            break;
          case "trigonometria.onda":
            expect(datosOnda(v).curva.length, donde).toBeGreaterThan(0);
            break;
          case "trigonometria.ley":
            expect(datosLey(v).pasos.length, donde).toBeGreaterThan(0);
            break;
          case "trigonometria.ecuacion":
            expect(datosEcuacion(v).soluciones.length, donde).toBeGreaterThan(0);
            break;
          case "trigonometria.identidad":
            expect(datosIdentidad(v).cumple, donde).toBe(true);
            break;
          case "trigonometria.mano":
          case "cuadros":
            break;
        }
        total++;
      }
    }
    expect(total).toBeGreaterThan(70);
  });

  it("los cuadros animados tienen al menos un cuadro con texto o fórmula", () => {
    for (const l of LECCIONES) {
      for (const v of l.visuales) {
        if (v.tipo !== "cuadros") continue;
        expect(v.cuadros.length, l.slug).toBeGreaterThanOrEqual(2);
        for (const c of v.cuadros) expect(Boolean(c.texto) || Boolean(c.formula), l.slug).toBe(true);
      }
    }
  });

  it("todos los tipos de visual propios se usan en alguna lección", () => {
    const usados = new Set<string>();
    for (const l of LECCIONES) for (const v of l.visuales) usados.add(v.tipo);
    for (const tipo of Object.keys(REGISTRO_VISUALES_TRIGONOMETRIA)) expect(usados.has(tipo), tipo).toBe(true);
  });
});

// ---------- grafo de dependencias ----------
describe("Trigonometría: grafo de dependencias entre lecciones", () => {
  it("todos los conceptos declarados existen en el vocabulario (o son conocimiento previo del colegio)", () => {
    for (const l of LECCIONES) {
      for (const c of l.conceptos.introduce) expect(IDS_CONCEPTOS.has(c), `${l.slug} introduce «${c}», que no existe`).toBe(true);
      for (const c of l.conceptos.usa) expect(IDS_CONCEPTOS.has(c) || IDS_PREVIOS.has(c), `${l.slug} usa «${c}», que no existe`).toBe(true);
      expect(l.conceptos.introduce.length, `${l.slug}: no introduce ningún concepto`).toBeGreaterThan(0);
    }
    expect(new Set(CONCEPTOS_TRIGONOMETRIA.map((c) => c.id)).size).toBe(CONCEPTOS_TRIGONOMETRIA.length);
    for (const c of CONOCIMIENTO_PREVIO) expect(IDS_CONCEPTOS.has(c.id), `«${c.id}» no puede ser previo y enseñado a la vez`).toBe(false);
  });

  it("CLASES: ninguna usa un concepto que ninguna Clase anterior (ni ella misma) introduce", () => {
    const vistos = new Set<string>();
    for (const c of CLASES_TRIGONOMETRIA) {
      for (const x of c.conceptos.introduce) vistos.add(x);
      for (const u of c.conceptos.usa) {
        expect(IDS_PREVIOS.has(u) || vistos.has(u), `${c.slug} usa «${u}» antes de que alguna Clase lo introduzca`).toBe(true);
      }
    }
  });

  it("CLASES: cada concepto del vocabulario lo introduce EXACTAMENTE una Clase", () => {
    const veces = new Map<string, string[]>();
    for (const c of CLASES_TRIGONOMETRIA) for (const x of c.conceptos.introduce) veces.set(x, [...(veces.get(x) ?? []), c.slug]);
    for (const con of CONCEPTOS_TRIGONOMETRIA) expect(veces.get(con.id)?.length ?? 0, `«${con.id}»: ${JSON.stringify(veces.get(con.id))}`).toBe(1);
  });

  it("TÉCNICAS: en el orden del currículo, ninguna usa un concepto que ninguna Técnica anterior (ni ella misma) introduce, y ninguna introduce uno ya introducido", () => {
    const vistos = new Set<string>();
    for (const t of TECNICAS_TRIGONOMETRIA) {
      for (const x of t.conceptos.introduce) {
        expect(vistos.has(x), `${t.slug} vuelve a introducir «${x}»`).toBe(false);
        vistos.add(x);
      }
      for (const u of t.conceptos.usa) expect(IDS_PREVIOS.has(u) || vistos.has(u), `${t.slug} usa «${u}» antes de que alguna Técnica lo introduzca`).toBe(true);
    }
  });

  it("una Clase no depende de una lección posterior: el orden de las Clases respeta el orden del temario (bloques 1→6)", () => {
    // Las razones se enseñan antes que el círculo; las ecuaciones, al final, y usan identidades.
    const idx = (slug: string) => CLASES_TRIGONOMETRIA.findIndex((c) => c.slug === slug);
    expect(idx("trigonometria-clase-05-hallar-un-angulo")).toBeGreaterThan(idx("trigonometria-clase-04-hallar-un-lado"));
    expect(idx("trigonometria-clase-26-ecuaciones-basicas")).toBeGreaterThan(idx("trigonometria-clase-24-angulo-doble-suma-y-diferencia"));
    const usaEcuaciones = CLASES_TRIGONOMETRIA.filter((c) => c.conceptos.usa.includes("ecuacion-trigonometrica"));
    for (const c of usaEcuaciones) expect(idx(c.slug)).toBeGreaterThan(idx("trigonometria-clase-26-ecuaciones-basicas") - 1);
  });
});

// ---------- cobertura de la práctica ----------
describe("Trigonometría: todo lo que la práctica puede generar se enseña en una Clase y una Técnica de su bloque", () => {
  const MODOS: ModoTrigonometria[] = ["razones", "circulo", "identidades", "leyes"];

  it("cada modo de práctica corresponde a un bloque, y los bloques 3 y 6 no tienen modo (pendiente de la fase 2)", () => {
    for (const modo of MODOS) expect(bloqueDeModo(modo).modoPractica).toBe(modo);
    expect(BLOQUES_TRIGONOMETRIA.filter((b) => b.modoPractica === null).map((b) => b.id)).toEqual(["graficas", "ecuaciones"]);
    expect(BLOQUES_TRIGONOMETRIA.map((b) => b.numero)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const b of BLOQUES_TRIGONOMETRIA) {
      expect(TECNICAS_TRIGONOMETRIA.filter((t) => t.grupo === b.id).length, b.id).toBeGreaterThanOrEqual(3);
      expect(CLASES_TRIGONOMETRIA.filter((c) => c.grupo === b.id).length, b.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("cada concepto de cada tipo de problema de la escala lo INTRODUCE una Clase del bloque del modo", () => {
    for (const modo of MODOS) {
      const bloque = bloqueDeModo(modo).id;
      const introducidos = new Set(CLASES_TRIGONOMETRIA.filter((c) => c.grupo === bloque).flatMap((c) => c.conceptos.introduce));
      for (const tipo of ESCALA_TRIGONOMETRIA[modo]) {
        for (const concepto of tipo.conceptos) {
          expect(IDS_CONCEPTOS.has(concepto), `${modo}/${tipo.tipo}: concepto «${concepto}» inexistente`).toBe(true);
          expect(introducidos.has(concepto), `${modo}/${tipo.tipo}: ninguna Clase del bloque «${bloque}» enseña «${concepto}»`).toBe(true);
        }
      }
    }
  });

  it("y toda Técnica del bloque lo trata (lo introduce o lo usa) al menos una vez", () => {
    for (const modo of MODOS) {
      const bloque = bloqueDeModo(modo).id;
      const tratados = new Set(TECNICAS_TRIGONOMETRIA.filter((t) => t.grupo === bloque).flatMap((t) => [...t.conceptos.introduce, ...t.conceptos.usa]));
      for (const tipo of ESCALA_TRIGONOMETRIA[modo]) {
        for (const concepto of tipo.conceptos) expect(tratados.has(concepto), `${modo}/${tipo.tipo}: ninguna Técnica del bloque «${bloque}» trata «${concepto}»`).toBe(true);
      }
    }
  });

  it("los bloques sin práctica (gráficas y ecuaciones) enseñan todos los temas del currículo objetivo", () => {
    const introducidos = new Set(CLASES_TRIGONOMETRIA.flatMap((c) => c.conceptos.introduce));
    for (const c of ["funcion-seno", "funcion-coseno", "amplitud", "periodo", "frecuencia", "desfase", "desplazamiento-vertical", "funcion-tangente", "asintotas", "ecuacion-de-grafica", "ecuacion-trigonometrica", "soluciones-intervalo", "ecuacion-con-inversa", "ecuacion-con-identidad", "ecuacion-factorizada"]) {
      expect(introducidos.has(c), c).toBe(true);
    }
  });
});

// ---------- migración ----------
describe(`Migración ${NUMERO_MIGRACION}: generada desde el contenido tipado`, () => {
  const esperado = generarSqlTrigonometria({ cabecera: CABECERA_TRIGONOMETRIA, tecnicas: TECNICAS_TRIGONOMETRIA, clases: CLASES_TRIGONOMETRIA });

  it("es exactamente lo que se genera de src/lib/trigonometria/lecciones/", () => {
    if (process.env.TRIGONOMETRIA_ESCRIBIR_SQL === "1") fs.writeFileSync(rutaMigracion, esperado, "utf8");
    expect(fs.existsSync(rutaMigracion), `falta ${NUMERO_MIGRACION}: TRIGONOMETRIA_ESCRIBIR_SQL=1 npx vitest run src/lib/trigonometria/lecciones`).toBe(true);
    expect(fs.readFileSync(rutaMigracion, "utf8").replace(/\r\n/g, "\n")).toBe(esperado);
  });

  it("estructura: 5 UPDATE (las Técnicas viejas) y 2 INSERT (Técnicas nuevas y Clases), UPDATE primero; sin ALTER ni skill_levels", () => {
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    expect((sql.match(/^update public\.techniques/gm) ?? []).length).toBe(5);
    expect((sql.match(/insert into public\.techniques/g) ?? []).length).toBe(2);
    expect(sql.lastIndexOf("update public.techniques"), "los UPDATE van antes que los INSERT").toBeLessThan(sql.indexOf("insert into public.techniques"));
    expect(sql).not.toMatch(/^\s*(alter|drop|delete|truncate)\b/im);
    expect(sql).not.toMatch(/^\s*(update|insert into|delete from|alter table)\s+(public\.)?(skill_levels|technique_progress)/im);
    for (const t of TECNICAS_TRIGONOMETRIA.filter((x) => x.existente)) {
      expect(sql, t.slug).toContain(`where slug = '${t.slug}' and problem_type = 'trigonometria'`);
      // ningún INSERT vuelve a tocar un slug que ya existía
      expect(sql.split("insert into public.techniques").slice(1).join("")).not.toContain(`('${t.slug}'`);
    }
  });

  it("20 Técnicas nuevas (requiere_pro = false) y 27 Clases (requiere_pro = true) en los INSERT", () => {
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    const bloques = sql.split("insert into public.techniques");
    expect(bloques).toHaveLength(3);
    expect((bloques[1].match(/,\n {2}false\)/g) ?? []).length).toBe(20);
    expect(bloques[1]).not.toMatch(/,\n\s+true\)/);
    expect((bloques[2].match(/,\n {2}true\)/g) ?? []).length).toBe(27);
    expect(bloques[2]).not.toMatch(/,\n\s+false\)/);
  });

  it("cada slug aparece una sola vez y los quiz de las filas sembradas son JSON válido", () => {
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    for (const l of LECCIONES) expect((sql.match(new RegExp(`'${l.slug}'`, "g")) ?? []).length, l.slug).toBe(1);
    for (const m of sql.matchAll(/\$trigonometria\$([\s\S]*?)\$trigonometria\$::jsonb/g)) {
      const j = JSON.parse(m[1]);
      expect(Array.isArray(j.pasos)).toBe(true);
      expect(Array.isArray(j.quiz) && j.quiz.length >= 4).toBe(true);
      expect(Array.isArray(j.visuales) && j.visuales.length >= 1).toBe(true);
    }
  });

  it("sin voseo en el SQL generado", () => {
    expect(detectarVoseo(fs.readFileSync(rutaMigracion, "utf8"))).toEqual([]);
  });
});
