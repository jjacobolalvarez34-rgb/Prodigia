import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { LECCIONES_CODIA, CLASES, TECNICAS, LECCIONES_LENGUAJES, TECNICAS_LENGUAJES, CLASES_LENGUAJES, GRUPOS_LENGUAJES, GRUPO_DE_LECCION_LENGUAJE } from "./index";
import { GRUPOS_APRENDER } from "@/lib/aprender/grupos";
import { fences, type LeccionCodia, type PreguntaLeccion } from "./tipos";
import { ARCHIVO_MIGRACION_LENGUAJES_CODIA, contenidoJson, generarSqlCodia, generarSqlLenguajesCodia, generarSqlVisualesCodia } from "./sql";
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
      // Lo básico (0193) y Codia por lenguaje (0255): todo se ejecuta de verdad.
      for (const l of [...LECCIONES_CODIA, ...LECCIONES_LENGUAJES]) {
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

// ---------- visuales ----------
describe("Codia: visuales de Aprender (estructura)", () => {
  it("TODA Técnica y Clase tiene al menos un visual, con despuesDePaso dentro de sus pasos", () => {
    for (const l of LECCIONES_CODIA) {
      expect(l.visuales?.length ?? 0, `${l.slug}: sin visuales`).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales ?? []) {
        expect(v.tipo.startsWith("codia."), `${l.slug}: tipo ${v.tipo}`).toBe(true);
        expect(Number.isInteger(v.despuesDePaso), `${l.slug}: despuesDePaso`).toBe(true);
        expect(v.despuesDePaso!, `${l.slug}: despuesDePaso fuera de los pasos`).toBeLessThan(l.pasos.length);
        expect(v.despuesDePaso!).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("los cuatro tipos de visual se usan en alguna lección", () => {
    const usados = new Set(LECCIONES_CODIA.flatMap((l) => (l.visuales ?? []).map((v) => v.tipo)));
    expect([...usados].sort()).toEqual(["codia.comparar", "codia.crecimiento", "codia.flujo", "codia.traza"]);
  });

  it("no usa el signo de dólar en los títulos (MathText lo trataría como LaTeX)", () => {
    for (const l of LECCIONES_CODIA) for (const v of l.visuales ?? []) expect(v.titulo ?? "", l.slug).not.toContain("$");
  });
});

describe("Codia: migración 0219 (visuales)", () => {
  const ruta = path.resolve(__dirname, "../../../../supabase/migrations/0219_codia_visuales.sql");
  const esperado = generarSqlVisualesCodia(LECCIONES_CODIA);

  it("el archivo de la migración es exactamente lo generado del contenido verificado", () => {
    if (process.env.CODIA_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta, esperado, "utf8");
    expect(fs.existsSync(ruta), "falta 0219_codia_visuales.sql: CODIA_ESCRIBIR_SQL=1 npx vitest run ...").toBe(true);
    expect(fs.readFileSync(ruta, "utf8").replace(/\r\n/g, "\n")).toBe(esperado);
  });

  it("solo hace update por slug sobre problem_type codia: pone pasos y visuales, nunca el quiz", () => {
    const updates = [
      ...esperado.matchAll(
        /^update public\.techniques set contenido = contenido \|\| jsonb_build_object\(\n  'pasos', \$codia\$([\s\S]*?)\$codia\$::jsonb,\n  'visuales', \$codia\$([\s\S]*?)\$codia\$::jsonb\)\nwhere slug = '([^']+)' and problem_type = 'codia';$/gm
      ),
    ];
    expect(updates).toHaveLength(LECCIONES_CODIA.length);
    expect(updates.map((u) => u[3])).toEqual(LECCIONES_CODIA.map((l) => l.slug));
    for (const u of updates) {
      const pasos = JSON.parse(u[1]) as string[];
      const visuales = JSON.parse(u[2]) as { tipo: string }[];
      expect(Array.isArray(visuales) && visuales.length > 0).toBe(true);
      // Los pasos de la migración son EXACTAMENTE los de 0193 (misma fuente).
      const leccion = LECCIONES_CODIA.find((x) => x.slug === u[3])!;
      expect(pasos).toEqual(JSON.parse(contenidoJson(leccion)).pasos);
    }
    expect(esperado).not.toMatch(/'quiz'/);
    expect(esperado).not.toMatch(/insert into|delete from|drop /i);
  });
});

// ---------- Codia por lenguaje (0255) ----------
describe("Codia por lenguaje: estructura", () => {
  const TODAS = [...LECCIONES_CODIA, ...LECCIONES_LENGUAJES];

  it("orden continuo después de Lo básico (Técnicas 14-17, Clases 18-30), slugs únicos y Pro solo en las Clases", () => {
    expect(TECNICAS_LENGUAJES.map((l) => l.orden)).toEqual([14, 15, 16, 17]);
    expect(CLASES_LENGUAJES.map((l) => l.orden)).toEqual(CLASES_LENGUAJES.map((_, i) => 18 + i));
    expect(new Set(TODAS.map((l) => l.slug)).size).toBe(TODAS.length);
    expect(TECNICAS_LENGUAJES.every((l) => !l.requierePro)).toBe(true);
    expect(CLASES_LENGUAJES.every((l) => l.requierePro)).toBe(true);
  });

  it("cada lenguaje tiene su Técnica y 3 Clases, más la Clase panorama, y cada lección figura en el sidebar con su grupo", () => {
    for (const lang of ["python", "java", "javascript", "typescript"] as const) {
      expect(TECNICAS_LENGUAJES.filter((l) => GRUPO_DE_LECCION_LENGUAJE[l.slug] === lang), lang).toHaveLength(1);
      expect(CLASES_LENGUAJES.filter((l) => GRUPO_DE_LECCION_LENGUAJE[l.slug] === lang), lang).toHaveLength(3);
    }
    expect(CLASES_LENGUAJES.filter((l) => GRUPO_DE_LECCION_LENGUAJE[l.slug] === "lenguajes")).toHaveLength(1);
    const enGrupos = (pestana: "tecnicas" | "clases", slug: string) => GRUPOS_APRENDER.codia![pestana].find((g) => g.slugs.includes(slug))?.id;
    for (const t of TECNICAS_LENGUAJES) expect(enGrupos("tecnicas", t.slug), t.slug).toBe("lenguajes");
    for (const c of CLASES_LENGUAJES) expect(enGrupos("clases", c.slug), c.slug).toBe(GRUPO_DE_LECCION_LENGUAJE[c.slug]);
    // Lo básico va primero: la Clase gratis de muestra sigue siendo la 1.
    expect(GRUPOS_APRENDER.codia!.clases[0].slugs[0]).toBe("codia-clase-01-variables-y-tipos");
    expect(GRUPOS_APRENDER.codia!.clases.map((g) => g.id)).toEqual(["basicos", "estructuras", "complejidad", ...GRUPOS_LENGUAJES.map((g) => g.id)]);
  });

  it("pasos, quiz y visuales válidos; sin signo de dólar ni bloques sin cerrar", () => {
    for (const l of LECCIONES_LENGUAJES) {
      expect(l.pasos.length, l.slug).toBeGreaterThanOrEqual(l.requierePro ? 5 : 4);
      expect(l.quiz.length, l.slug).toBeGreaterThanOrEqual(2);
      expect(l.quiz.length, l.slug).toBeLessThanOrEqual(3);
      for (const q of l.quiz) {
        expect(q.opciones, `${l.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size).toBe(q.opciones.length);
        expect(q.opciones.length).toBeGreaterThanOrEqual(3);
        expect(q.explicacion.trim().length).toBeGreaterThan(10);
      }
      const todo = [l.nombre, l.descripcion, ...l.pasos, ...l.quiz.flatMap((q) => [q.pregunta, ...q.opciones, q.explicacion]), ...(l.visuales ?? []).map((v) => JSON.stringify(v))].map(fences).join("\n");
      expect(todo.includes("$"), l.slug).toBe(false);
      for (const p of l.pasos) expect(fences(p).split("```").length % 2, `${l.slug}: bloques sin cerrar`).toBe(1);
      expect(l.visuales?.length ?? 0, l.slug).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales ?? []) expect(v.despuesDePaso!, l.slug).toBeLessThan(l.pasos.length);
    }
  });

  it("cada Clase de un lenguaje muestra código de ESE lenguaje en al menos 3 pasos (y la panorama, los 4 lenguajes juntos)", () => {
    for (const c of CLASES_LENGUAJES) {
      const grupo = GRUPO_DE_LECCION_LENGUAJE[c.slug];
      if (grupo === "lenguajes") {
        const conLos4 = c.pasos.filter((p) => LANGS.every((lang) => extraer(p, c.slug).some((b) => b.lang === lang)));
        expect(conLos4.length, c.slug).toBeGreaterThanOrEqual(2);
        continue;
      }
      const conCodigo = c.pasos.filter((p) => extraer(p, c.slug).some((b) => b.lang === grupo));
      expect(conCodigo.length, c.slug).toBeGreaterThanOrEqual(3);
      // Y nada de otro lenguaje: cada sección es de un solo lenguaje.
      for (const p of c.pasos) for (const b of extraer(p, c.slug)) expect(b.lang, c.slug).toBe(grupo);
    }
  });
});

describe(`Codia por lenguaje: migración ${ARCHIVO_MIGRACION_LENGUAJES_CODIA}`, () => {
  const ruta = path.resolve(__dirname, `../../../../supabase/migrations/${ARCHIVO_MIGRACION_LENGUAJES_CODIA}`);
  const esperado = generarSqlLenguajesCodia(LECCIONES_LENGUAJES);

  it("el archivo es exactamente lo generado del contenido verificado", () => {
    if (process.env.CODIA_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta, esperado, "utf8");
    expect(fs.existsSync(ruta), `falta ${ARCHIVO_MIGRACION_LENGUAJES_CODIA}`).toBe(true);
    expect(fs.readFileSync(ruta, "utf8").replace(/\r\n/g, "\n")).toBe(esperado);
  });

  it("cada fila tiene JSON válido con pasos, quiz y visuales, y ningún slug está en otra migración", () => {
    const filas = [...esperado.matchAll(/\$codia\$([\s\S]*?)\$codia\$::jsonb/g)];
    expect(filas).toHaveLength(LECCIONES_LENGUAJES.length);
    for (const f of filas) {
      const o = JSON.parse(f[1]) as { pasos: string[]; quiz: unknown[]; visuales: unknown[] };
      expect(o.pasos.length).toBeGreaterThan(0);
      expect(o.quiz.length).toBeGreaterThan(0);
      expect(o.visuales.length).toBeGreaterThan(0);
    }
    const dir = path.dirname(ruta);
    for (const archivo of fs.readdirSync(dir).filter((n) => n.endsWith(".sql") && n !== ARCHIVO_MIGRACION_LENGUAJES_CODIA)) {
      const otro = fs.readFileSync(path.join(dir, archivo), "utf8");
      for (const l of LECCIONES_LENGUAJES) expect(otro.includes(`'${l.slug}'`), `${archivo} ya usa ${l.slug}`).toBe(false);
    }
  }, 30_000);
});
