import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { LECCIONES_CODIA, CLASES, TECNICAS } from "./index";
import { fences, type LeccionCodia, type PreguntaLeccion } from "./tipos";
import { generarSqlCodia } from "./sql";
import { ejecutar, hayJava, hayPython, type ResultadoReal } from "../ejecutores";
import type { Lenguaje } from "../tipos";

// Verificación del contenido de Aprender de Codia:
//  - estructura (orden continuo, 5 técnicas + 8 clases, quiz válido,
//    ni un signo de dólar: MathText lo interpretaría como LaTeX);
//  - CADA fragmento de código de pasos y quiz se EJECUTA de verdad (python,
//    node, typescript con chequeo de tipos, javac + JVM) y la salida real
//    coincide con la mostrada en la lección;
//  - la migración 0193 es exactamente lo que se genera de este contenido.
// Para regenerar la migración: CODIA_ESCRIBIR_SQL=1 npx vitest run <este archivo>.

const RUNTIME: Record<Lenguaje, boolean> = { python: hayPython(), java: hayJava(), javascript: true, typescript: true };
const TIMEOUT = 300_000;
const LANGS: Lenguaje[] = ["python", "java", "javascript", "typescript"];

interface Bloque {
  lang: Lenguaje;
  codigo: string;
  debeFallar: boolean;
  salida?: string; // salida esperada (o tipo de error si debeFallar)
  origen: string;
}

// Extrae los bloques de un texto y asocia cada ~~~salida a todos los
// bloques de código acumulados desde la salida anterior.
function extraer(texto: string, origen: string): Bloque[] {
  const partes = fences(texto).split("```");
  const bloques: Bloque[] = [];
  let pendientes: Bloque[] = [];
  partes.forEach((parte, i) => {
    if (i % 2 === 0) return;
    const salto = parte.indexOf("\n");
    const etiqueta = parte.slice(0, salto).trim();
    const cuerpo = parte.slice(salto + 1).replace(/\n$/, "");
    if (etiqueta === "salida") {
      pendientes.forEach((b) => (b.salida = cuerpo));
      pendientes = [];
      return;
    }
    const debeFallar = etiqueta.endsWith("!");
    const lang = etiqueta.replace(/!$/, "") as Lenguaje;
    expect(LANGS, `${origen}: lenguaje desconocido «${etiqueta}»`).toContain(lang);
    const b: Bloque = { lang, codigo: cuerpo, debeFallar, origen };
    bloques.push(b);
    pendientes.push(b);
  });
  return bloques;
}

// Un fragmento de Java son sentencias: los import van arriba, los
// métodos static (columna 0, hasta el } de columna 0) son miembros y el
// resto va dentro de main.
function envolverJava(codigo: string): string {
  const lineas = codigo.split("\n");
  const imports: string[] = [];
  const miembros: string[] = [];
  const cuerpo: string[] = [];
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    if (l.startsWith("import ")) imports.push(l);
    else if (l.startsWith("static ")) {
      while (i < lineas.length) {
        miembros.push(`    ${lineas[i]}`);
        if (lineas[i] === "}") break;
        i++;
      }
      miembros.push("");
    } else cuerpo.push(`        ${l}`);
  }
  return `${imports.join("\n")}\npublic class Main {\n${miembros.join("\n")}\n    public static void main(String[] args) {\n${cuerpo.join("\n")}\n    }\n}\n`;
}

function programa(b: { lang: Lenguaje; codigo: string }): string {
  return b.lang === "java" ? envolverJava(b.codigo) : b.codigo;
}

function tipoReal(r: ResultadoReal, lang: Lenguaje): string {
  if (!r.error) return "sin error";
  if (r.fase === "compilacion" && (lang === "java" || lang === "typescript")) return "error de compilación";
  return r.error.tipo;
}

// ---------- estructura ----------
describe("Codia: contenido de Aprender — estructura", () => {
  it("5 técnicas gratis + 8 clases Pro, orden continuo y slugs únicos", () => {
    expect(TECNICAS).toHaveLength(5);
    expect(CLASES.length).toBeGreaterThanOrEqual(6);
    expect(CLASES.length).toBeLessThanOrEqual(8);
    expect(LECCIONES_CODIA.map((l) => l.orden)).toEqual(LECCIONES_CODIA.map((_, i) => i + 1));
    expect(new Set(LECCIONES_CODIA.map((l) => l.slug)).size).toBe(LECCIONES_CODIA.length);
    expect(TECNICAS.every((l) => !l.requierePro)).toBe(true);
    expect(CLASES.every((l) => l.requierePro)).toBe(true);
    expect(LECCIONES_CODIA.every((l) => l.slug.startsWith("codia-"))).toBe(true);
  });

  it("cada lección tiene pasos, quiz de 2-3 preguntas con explicación y la respuesta entre las opciones", () => {
    for (const l of LECCIONES_CODIA) {
      expect(l.pasos.length, l.slug).toBeGreaterThanOrEqual(4);
      expect(l.quiz.length, l.slug).toBeGreaterThanOrEqual(2);
      expect(l.quiz.length, l.slug).toBeLessThanOrEqual(3);
      for (const q of l.quiz) {
        expect(q.opciones, `${l.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size).toBe(q.opciones.length);
        expect(q.opciones.length).toBeGreaterThanOrEqual(3);
        expect(q.explicacion.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("no usa el signo de dólar (MathText lo trataría como LaTeX) ni deja marcas ~~~ sin convertir", () => {
    for (const l of LECCIONES_CODIA) {
      const todo = [l.nombre, l.descripcion, ...l.pasos, ...l.quiz.flatMap((q) => [q.pregunta, ...q.opciones, q.respuesta, q.explicacion])].map(fences).join("\n");
      expect(todo.includes("$"), l.slug).toBe(false);
      expect(todo.split("```").length % 2, `${l.slug}: bloques sin cerrar`).toBe(1);
    }
  });

  it("cada Clase muestra el MISMO ejemplo en los 4 lenguajes en al menos 3 pasos", () => {
    for (const c of CLASES) {
      const pasosCon4 = c.pasos.filter((p) => {
        const langs = new Set(extraer(p, c.slug).map((b) => b.lang));
        return LANGS.every((l) => langs.has(l));
      });
      expect(pasosCon4.length, `${c.slug}: pasos con los 4 lenguajes`).toBeGreaterThanOrEqual(3);
    }
  });

  it("las clases son dependientes: cada una parte de lo que enseña la anterior (títulos numerados en orden)", () => {
    CLASES.forEach((c, i) => expect(c.nombre.startsWith(`Clase ${i + 1}:`), c.nombre).toBe(true));
  });
});

// ---------- ejecución real ----------
interface Trabajo {
  lang: Lenguaje;
  codigo: string;
  verificar: (r: ResultadoReal) => void;
}

function trabajosDeBloques(bloques: Bloque[]): Trabajo[] {
  return bloques.map((b) => ({
    lang: b.lang,
    codigo: programa(b),
    verificar: (r) => {
      const ctx = `${b.origen}\n${b.codigo}\n-> ${JSON.stringify(r)}`;
      if (b.debeFallar) {
        expect(r.error, `debía fallar\n${ctx}`).not.toBeNull();
        expect(b.salida, `${b.origen}: un bloque ! necesita ~~~salida con el tipo de error`).toBeDefined();
        expect(tipoReal(r, b.lang), ctx).toBe(b.salida);
      } else {
        expect(r.error, `no debía fallar\n${ctx}`).toBeNull();
        if (b.salida !== undefined) expect(r.stdout, `salida mostrada vs real\n${ctx}`).toBe(b.salida);
      }
    },
  }));
}

function trabajosDePregunta(l: LeccionCodia, q: PreguntaLeccion, idx: number): Trabajo[] {
  const origen = `${l.slug} quiz #${idx + 1}`;
  const bloques = extraer(q.pregunta, origen);
  const v = q.verifica;
  const trabajos: Trabajo[] = [];
  if (!v) {
    return trabajosDeBloques(bloques);
  }
  if (v.tipo === "salida") {
    expect(bloques.length, `${origen}: verifica salida necesita un bloque`).toBeGreaterThan(0);
    for (const b of bloques)
      trabajos.push({
        lang: b.lang,
        codigo: programa(b),
        verificar: (r) => {
          expect(r.error, `${origen}\n${JSON.stringify(r)}`).toBeNull();
          expect(r.stdout, `${origen}: la respuesta del quiz debe ser la salida real`).toBe(q.respuesta);
        },
      });
  } else if (v.tipo === "error") {
    for (const b of bloques)
      trabajos.push({
        lang: b.lang,
        codigo: programa(b),
        verificar: (r) => {
          expect(r.error, `${origen}: debía fallar`).not.toBeNull();
          expect(tipoReal(r, b.lang), origen).toBe(v.error);
          expect(q.respuesta).toContain(v.error);
        },
      });
  } else {
    for (const op of q.opciones)
      trabajos.push({
        lang: v.lang,
        codigo: programa({ lang: v.lang, codigo: op }),
        verificar: (r) => {
          const esLaRespuesta = op === q.respuesta;
          const funciona = r.error === null;
          expect(funciona, `${origen}: opción «${op}» -> ${JSON.stringify(r)}`).toBe(esLaRespuesta ? v.respuestaFunciona : !v.respuestaFunciona);
        },
      });
  }
  return trabajos;
}

describe.each(LANGS)("Codia: contenido de Aprender — ejecución real de los fragmentos en %s", (lang) => {
  it.skipIf(!RUNTIME[lang])(
    "cada bloque corre (o falla como dice la lección) y su salida mostrada es la real",
    () => {
      const trabajos: Trabajo[] = [];
      let bloquesTotales = 0;
      for (const l of LECCIONES_CODIA) {
        l.pasos.forEach((p, i) => {
          const bs = extraer(p, `${l.slug} paso #${i + 1}`).filter((b) => b.lang === lang);
          bloquesTotales += bs.length;
          trabajos.push(...trabajosDeBloques(bs).map((t) => t));
        });
        l.quiz.forEach((q, i) => {
          trabajosDePregunta(l, q, i)
            .filter((t) => t.lang === lang)
            .forEach((t) => trabajos.push(t));
        });
      }
      expect(trabajos.length, `hay fragmentos en ${lang}`).toBeGreaterThan(5);
      const unicos = [...new Set(trabajos.map((t) => t.codigo))];
      const res = ejecutar(lang, unicos);
      const mapa = new Map(unicos.map((c, i) => [c, res[i]]));
      for (const t of trabajos) t.verificar(mapa.get(t.codigo)!);
      expect(bloquesTotales).toBeGreaterThan(0);
    },
    TIMEOUT
  );
});

// ---------- migración ----------
describe("Codia: migración 0193", () => {
  const ruta = path.resolve(__dirname, "../../../../supabase/migrations/0193_codia_contenido.sql");
  const esperado = generarSqlCodia(LECCIONES_CODIA);

  it("el archivo de la migración es exactamente lo generado del contenido verificado", () => {
    if (process.env.CODIA_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta, esperado, "utf8");
    expect(fs.existsSync(ruta), "falta 0193_codia_contenido.sql: CODIA_ESCRIBIR_SQL=1 npx vitest run ...").toBe(true);
    expect(fs.readFileSync(ruta, "utf8")).toBe(esperado);
  });

  it("el contenido JSON de cada fila es JSON válido con pasos y quiz", () => {
    const filas = [...esperado.matchAll(/\$codia\$([\s\S]*?)\$codia\$::jsonb/g)];
    expect(filas).toHaveLength(LECCIONES_CODIA.length);
    for (const f of filas) {
      const o = JSON.parse(f[1]) as { pasos: string[]; quiz: unknown[] };
      expect(Array.isArray(o.pasos)).toBe(true);
      expect(Array.isArray(o.quiz)).toBe(true);
    }
  });
});
