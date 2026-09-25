import { describe, it, expect } from "vitest";
import {
  generarProblemaCodia,
  preguntaCodia,
  verificacionesCatalogoSintaxis,
  conRngSembrado,
  MODOS_CODIA,
  NOMBRE_MODO_CODIA,
  LENGUAJES_CODIA,
  type ModoCodia,
  type ProblemaCodia,
  type LenguajeCodia,
} from "./codia";
import { mulberry32 } from "@/lib/rng";
import { MARCA } from "@/lib/codia/catalogoSintaxis";
import { etiquetaConsecuencia } from "@/lib/codia/plantillasError";
import { ejecutar, hayJava, hayPython, type ResultadoReal } from "@/lib/codia/ejecutores";
import type { Verificacion } from "@/lib/codia/problema";

// Verificación por EJECUCIÓN REAL. Para cada modo × lenguaje se generan N
// problemas (CODIA_PULLS, por defecto 100), se ejecutan los fragmentos
// con el runtime de verdad (python, node, typescript con chequeo de
// tipos + node, javac --release 8 + JVM) y se compara:
//   - salida / estructuras: stdout REAL == respuesta del intérprete;
//   - complejidad: los conteos REALES para n = 8..64 crecen como la clase;
//   - sintaxis: solo la opción correcta corre e imprime lo esperado, cada
//     distractor falla o imprime otra cosa (y se recorre el catálogo
//     COMPLETO, no solo una muestra);
//   - error: la causa REAL (SyntaxError, NameError, IndexError,
//     ZeroDivisionError, TypeError, error de compilación, excepción de
//     Java, salida de JS) y la línea reportada coinciden con lo predicho,
//     y el programa corregido imprime lo esperado.
// Los runtimes ausentes se saltean; en la máquina de desarrollo corren.

const PULLS = Number(process.env.CODIA_PULLS ?? 100);
const TIMEOUT = 600_000;

const RUNTIME: Record<LenguajeCodia, boolean> = {
  python: hayPython(),
  java: hayJava(),
  javascript: true,
  typescript: true,
};

// ---------- utilidades ----------
function generar(modo: ModoCodia, lang: LenguajeCodia, i: number): ProblemaCodia {
  const semilla = 7919 * (i + 1) + 104729 * MODOS_CODIA.indexOf(modo) + 31 * LENGUAJES_CODIA.indexOf(lang);
  const nivel = (i % 10) + 1;
  return conRngSembrado(mulberry32(semilla), () => generarProblemaCodia(modo, nivel, lang));
}

function ultimaLinea(s: string): string {
  const l = s.split("\n");
  return l[l.length - 1] ?? "";
}

function clasificarCrecimiento(c: number[]): string {
  const r = (a: number, b: number) => b / a;
  const cls = (x: number) => (x < 1.05 ? "O(1)" : x < 1.5 ? "O(log n)" : x < 2.2 ? "O(n)" : x < 3 ? "O(n log n)" : x < 5 ? "O(n²)" : "O(n³)");
  const a = cls(r(c[0], c[1]));
  const b = cls(r(c[1], c[2]));
  const d = cls(r(c[2], c[3]));
  expect([a, b, d], `conteos ${c.join(",")}`).toEqual([d, d, d]);
  return d;
}

// Causa real -> clave de mutación esperada.
function claseReal(lang: LenguajeCodia, r: ResultadoReal): string {
  const e = r.error;
  if (!e) return "sin-error";
  const t = e.tipo;
  const m = e.mensaje;
  if (lang === "python") {
    if (t === "SyntaxError" || t === "IndentationError") return "sintaxis";
    if (t === "NameError") return "nombre";
    if (t === "IndexError") return "indice";
    if (t === "ZeroDivisionError") return "divcero";
    if (t === "TypeError") return "tipo";
    return `otro:${t}`;
  }
  if (lang === "java") {
    if (e.tipo === "compilacion") {
      if (m.includes("cannot find symbol")) return "nombre";
      if (m.includes("incompatible types")) return "tipo";
      if (m.includes("expected")) return "sintaxis";
      return `otro:${m}`;
    }
    if (t === "ArrayIndexOutOfBoundsException" || t === "IndexOutOfBoundsException") return "indice";
    if (t === "ArithmeticException") return "divcero";
    return `otro:${t}`;
  }
  if (lang === "javascript") {
    if (t === "SyntaxError") return "sintaxis";
    if (t === "ReferenceError") return "nombre";
    return `otro:${t}`;
  }
  // typescript
  if (e.codigo === 2304 || e.codigo === 2552) return "nombre";
  if (e.codigo === 2322) return "tipo";
  if (e.codigo === 1002) return "sintaxis";
  return `otro:${e.codigo}:${m}`;
}

interface Trabajo {
  codigo: string;
  verificar: (r: ResultadoReal) => void;
}

function correrTrabajos(lang: LenguajeCodia, trabajos: Trabajo[]) {
  const unicos = [...new Set(trabajos.map((t) => t.codigo))];
  const res = ejecutar(lang, unicos);
  const porCodigo = new Map(unicos.map((c, i) => [c, res[i]]));
  for (const t of trabajos) t.verificar(porCodigo.get(t.codigo)!);
}

function trabajosDe(p: ProblemaCodia, lang: LenguajeCodia): Trabajo[] {
  const v: Verificacion = p.verificacion;
  const tag = `[${lang}/${p.modo}] ${p.enunciado}\n${p.codigo}`;
  if (v.tipo === "salida") {
    return [
      {
        codigo: v.ejecutable,
        verificar: (r) => {
          expect(r.error, `${tag}\nerror real: ${JSON.stringify(r.error)}`).toBeNull();
          expect(r.stdout, `${tag}\n(stdout real vs respuesta)`).toBe(v.stdout);
          expect(p.respuesta).toBe(v.stdout);
        },
      },
    ];
  }
  if (v.tipo === "complejidad") {
    return [
      {
        codigo: v.ejecutable,
        verificar: (r) => {
          expect(r.error, `${tag}\n${JSON.stringify(r.error)}`).toBeNull();
          expect(r.stdout, tag).toBe(v.stdout);
          const conteos = r.stdout.split("\n").map(Number);
          expect(conteos).toHaveLength(v.ns.length);
          expect(clasificarCrecimiento(conteos), `${tag}\nconteos reales ${conteos.join(",")}`).toBe(v.clase);
          expect(p.respuesta).toBe(v.clase);
        },
      },
    ];
  }
  if (v.tipo === "hueco") {
    return v.opciones.map((op) => ({
      codigo: v.plantilla.split(MARCA).join(op),
      verificar: (r: ResultadoReal) => {
        const funciona = r.error === null && r.stdout === v.stdout;
        expect(funciona, `${tag}\nopción «${op}» → ${JSON.stringify(r)}`).toBe(op === v.correcta);
      },
    }));
  }
  // error
  const trabajos: Trabajo[] = [];
  trabajos.push({
    codigo: v.ejecutableOk,
    verificar: (r) => {
      expect(r.error, `${tag}\n(programa corregido) ${JSON.stringify(r.error)}`).toBeNull();
      expect(r.stdout, `${tag}\n(programa corregido)`).toBe(v.stdoutOk);
    },
  });
  trabajos.push({
    codigo: v.ejecutable,
    verificar: (r) => {
      if (v.mutacion === "logica") {
        expect(r.error, tag).toBeNull();
        expect(r.stdout, tag).toBe(v.stdoutMal);
        expect(r.stdout).not.toBe(v.stdoutOk);
        return;
      }
      const esperada = v.mutacion === "igualdad" ? (lang === "python" ? "sintaxis" : "tipo") : v.mutacion;
      const real = claseReal(lang, r);
      const ctx = `${tag}\nmutación ${v.mutacion}, real: ${JSON.stringify(r)}`;
      const sinFalloEnJs = (lang === "javascript" || lang === "typescript") && (v.mutacion === "indice" || v.mutacion === "divcero" || (lang === "javascript" && v.mutacion === "tipo"));
      if (sinFalloEnJs) {
        expect(r.error, ctx).toBeNull();
        expect(r.stdout, ctx).toBe(v.stdoutMal);
        if (v.forma === "consecuencia") expect(p.respuesta, ctx).toContain(ultimaLinea(r.stdout));
        return;
      }
      expect(real, ctx).toBe(esperada);
      if (v.lineaEjecutable !== null) expect(r.error?.linea, `${ctx}\nlínea esperada ${v.lineaEjecutable}`).toBe(v.lineaEjecutable);
      if (v.forma === "consecuencia") {
        expect(p.respuesta, ctx).toBe(etiquetaConsecuencia(lang, v.mutacion, ""));
      }
      if (v.forma === "linea") expect(p.respuesta, ctx).toBe(`Línea ${v.lineaPantalla}`);
    },
  });
  return trabajos;
}

function verificarForma(p: ProblemaCodia) {
  expect(p.opciones, `${p.enunciado}\n${p.codigo}`).toContain(p.respuesta);
  expect(new Set(p.opciones).size, `opciones repetidas: ${JSON.stringify(p.opciones)}`).toBe(p.opciones.length);
  expect(p.opciones.length, `pocas opciones: ${p.modo}/${p.lenguaje}
${p.enunciado}
${p.codigo}
${JSON.stringify(p.opciones)}`).toBeGreaterThanOrEqual(3);
  expect(p.opciones.length).toBeLessThanOrEqual(4);
  expect(p.enunciado.length).toBeGreaterThan(5);
  expect(p.respuesta.trim()).not.toBe("");
  expect(p.opciones.filter((o) => o === p.respuesta)).toHaveLength(1);
  expect(p.opciones.every((o) => o.trim() !== "")).toBe(true);
}

// ---------- estructura y bandas (sin runtimes) ----------
describe("Codia: forma general", () => {
  it("expone los mismos modos y nombres que el módulo provisorio", () => {
    expect(MODOS_CODIA).toEqual(["sintaxis", "salida", "error", "estructuras"]);
    expect(NOMBRE_MODO_CODIA).toEqual({
      sintaxis: "Sintaxis",
      salida: "Salida del código",
      error: "Encuentra el error",
      estructuras: "Estructuras y complejidad",
    });
  });

  it("cada problema tiene forma válida, 3-4 opciones distintas y la respuesta entre ellas (todos los modos × lenguajes × niveles)", () => {
    for (const modo of MODOS_CODIA) {
      for (const lang of LENGUAJES_CODIA) {
        for (let i = 0; i < 60; i++) {
          const p = generar(modo, lang, i);
          expect(p.modo).toBe(modo);
          expect(p.lenguaje).toBe(lang);
          verificarForma(p);
        }
      }
    }
  });

  it("es determinista con la misma semilla y cambia con otra", () => {
    const a = conRngSembrado(mulberry32(42), () => generarProblemaCodia("salida", 5, "python"));
    const b = conRngSembrado(mulberry32(42), () => generarProblemaCodia("salida", 5, "python"));
    expect(a).toEqual(b);
    const otros = new Set(Array.from({ length: 20 }, (_, i) => conRngSembrado(mulberry32(i), () => generarProblemaCodia("salida", 5, "python")).codigo));
    expect(otros.size).toBeGreaterThan(5);
  });

  it("sin lenguaje fijo sortea los 4 lenguajes", () => {
    const vistos = new Set<string>();
    for (let i = 0; i < 80; i++) vistos.add(conRngSembrado(mulberry32(i + 500), () => generarProblemaCodia("salida", 4)).lenguaje);
    expect([...vistos].sort()).toEqual([...LENGUAJES_CODIA].sort());
  });

  it("preguntaCodia devuelve una pregunta de opción múltiple válida para el reto diario", () => {
    for (let i = 0; i < 100; i++) {
      const q = preguntaCodia(mulberry32(1234 + i));
      expect(q.mundo).toBe("codia");
      expect(q.opciones).toContain(q.respuesta);
      expect(new Set(q.opciones).size).toBe(q.opciones.length);
      expect(q.enunciado).toMatch(/^\[(Python|Java|JavaScript|TypeScript)\]/);
    }
    expect(preguntaCodia(mulberry32(9))).toEqual(preguntaCodia(mulberry32(9)));
  });

  it("los quirks curados (división/módulo con negativos, coerción de JS, repetición de cadenas) sí se generan en cada lenguaje", () => {
    const busca = (lang: LenguajeCodia, re: RegExp) => {
      for (let i = 0; i < 600; i++) {
        const p = conRngSembrado(mulberry32(i + 3000), () => generarProblemaCodia("salida", 6, lang));
        if (re.test(p.codigo)) return true;
      }
      return false;
    };
    expect(busca("python", /print\(-\d+ \/\/ \d+\)/)).toBe(true);
    expect(busca("java", /println\(-\d+ \/ \d+\)/)).toBe(true);
    expect(busca("javascript", /Math\.trunc\(-\d+ \/ \d+\)/)).toBe(true);
    expect(busca("javascript", /console\.log\("\d" == \d\)/)).toBe(true);
    expect(busca("typescript", /console\.log\(\d \+ \d \+ "\d"\)/)).toBe(true);
    expect(busca("python", /\* \d/)).toBe(true);
  });
});

// ---------- ejecución real ----------
const LANGS = LENGUAJES_CODIA;

describe.each(LANGS)("Codia: ejecución real — %s", (lang) => {
  const corre = RUNTIME[lang];

  it.skipIf(!corre)(
    `catálogo de sintaxis COMPLETO: solo la opción correcta funciona`,
    () => {
      const trabajos = verificacionesCatalogoSintaxis(lang).flatMap((v) =>
        trabajosDe({ modo: "sintaxis", entrada: "opciones", lenguaje: lang, enunciado: "catálogo", codigo: "", opciones: [], respuesta: "", verificacion: v }, lang)
      );
      expect(trabajos.length).toBeGreaterThan(30);
      correrTrabajos(lang, trabajos);
    },
    TIMEOUT
  );

  for (const modo of MODOS_CODIA) {
    it.skipIf(!corre)(
      `${modo}: ${PULLS} problemas ejecutados de verdad coinciden con lo predicho`,
      () => {
        const problemas = Array.from({ length: PULLS }, (_, i) => generar(modo, lang, i));
        problemas.forEach(verificarForma);
        correrTrabajos(lang, problemas.flatMap((p) => trabajosDe(p, lang)));
      },
      TIMEOUT
    );
  }
});
