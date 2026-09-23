import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CLASES_ENIGMIA } from "./index";
import { generarSqlEnigmia } from "./sql";
import { esVisualLeccion, type VisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_ENIGMIA } from "@/components/enigmia/visuales/registro";
import { secuenciaAritmetica, secuenciaGeometrica, secuenciaLetras, agruparEnBloques, trazarAlgoritmo } from "../visualesDatos";

// Verificación del contenido de las 6 Clases nuevas de Enigmia (fila 22 +
// fila 23 de docs/PARIDAD_MUNDOS.md): estructura (slugs, categoría, orden,
// requiere_pro, quiz), visuales con tipos conocidos, y sobre todo que CADA
// dato mostrado se recalcula con lógica/aritmética independiente (no las
// mismas funciones que dibuja el componente: acá se reimplementan a mano,
// separadas de src/lib/enigmia/visualesDatos.ts).
// Regenerar la migración 0203: ENIGMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/enigmia/lecciones

const raiz = path.resolve(__dirname, "../../../..");
const ruta0203 = path.join(raiz, "supabase", "migrations", "0203_enigmia_clases.sql");

const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_ENIGMIA)]);
const CATEGORIAS_VALIDAS = new Set(["memoria", "patrones", "deduccion", "computacional"]);

describe("Enigmia: Clases nuevas (estructura)", () => {
  it("son 6, todas requiere_pro, distribuidas en las 4 categorías", () => {
    expect(CLASES_ENIGMIA).toHaveLength(6);
    expect(CLASES_ENIGMIA.every((c) => c.requierePro === true)).toBe(true);
    const slugs = CLASES_ENIGMIA.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(6);
    for (const c of CLASES_ENIGMIA) expect(CATEGORIAS_VALIDAS.has(c.categoria), c.slug).toBe(true);
    const porCategoria = new Map<string, number>();
    for (const c of CLASES_ENIGMIA) porCategoria.set(c.categoria, (porCategoria.get(c.categoria) ?? 0) + 1);
    expect(Object.fromEntries(porCategoria)).toEqual({ patrones: 2, deduccion: 2, memoria: 1, computacional: 1 });
  });

  it("el orden es correlativo (1, 2...) dentro de cada categoría", () => {
    const porCategoria = new Map<string, number[]>();
    for (const c of CLASES_ENIGMIA) porCategoria.set(c.categoria, [...(porCategoria.get(c.categoria) ?? []), c.orden]);
    for (const [cat, ordenes] of porCategoria) {
      const esperado = ordenes.map((_, i) => i + 1);
      expect(ordenes.slice().sort((a, b) => a - b), cat).toEqual(esperado);
    }
  });

  it("cada quiz: respuesta entre las opciones, sin opciones repetidas, al menos 2 preguntas", () => {
    for (const c of CLASES_ENIGMIA) {
      expect(c.quiz.length, c.slug).toBeGreaterThanOrEqual(2);
      for (const q of c.quiz) {
        expect(q.opciones, `${c.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size).toBe(q.opciones.length);
      }
    }
  });

  it("los pasos son una introducción corta (2-4 pasos, sin $ desparejados)", () => {
    for (const c of CLASES_ENIGMIA) {
      expect(c.pasos.length, c.slug).toBeGreaterThanOrEqual(2);
      expect(c.pasos.length, c.slug).toBeLessThanOrEqual(4);
      for (const p of c.pasos) {
        expect(p.length, `${c.slug}: paso demasiado largo`).toBeLessThanOrEqual(430);
        expect((p.match(/\$/g) ?? []).length % 2, `${c.slug}: $ desparejado en «${p}»`).toBe(0);
        expect(p).not.toMatch(/undefined|NaN/);
      }
    }
  });

  it("ninguna clase queda solo con texto y cada visual es válido", () => {
    for (const c of CLASES_ENIGMIA) {
      expect(c.visuales.length, `${c.slug} sin visuales`).toBeGreaterThanOrEqual(1);
      for (const v of c.visuales) {
        expect(esVisualLeccion(v), c.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${c.slug}: tipo ${v.tipo}`).toBe(true);
        expect(v.despuesDePaso, `${c.slug}: despuesDePaso obligatorio`).toBeDefined();
        expect(v.despuesDePaso!).toBeLessThan(c.pasos.length);
      }
    }
  });
});

describe("Enigmia: los datos de las Clases salen de un cálculo independiente", () => {
  it("Clase 1 — secuencia aritmética 3,7,11,15,19 (diferencia +4)", () => {
    const d = secuenciaAritmetica(3, 4, 5);
    const esperado: number[] = [];
    for (let i = 0; i < 5; i++) esperado.push(3 + 4 * i);
    expect(d.terminos).toEqual(esperado);
    expect(d.terminos).toEqual([3, 7, 11, 15, 19]);
    for (let i = 1; i < d.terminos.length; i++) expect(d.terminos[i] - d.terminos[i - 1]).toBe(4);
  });

  it("Clase 1 — secuencia geométrica 2,6,18,54,162 (razón ×3)", () => {
    const d = secuenciaGeometrica(2, 3, 5);
    const esperado: number[] = [];
    let actual = 2;
    for (let i = 0; i < 5; i++) {
      esperado.push(actual);
      actual = actual * 3;
    }
    expect(d.terminos).toEqual(esperado);
    expect(d.terminos).toEqual([2, 6, 18, 54, 162]);
    for (let i = 1; i < d.terminos.length; i++) expect(d.terminos[i] / d.terminos[i - 1]).toBe(3);
  });

  it("Clase 2 — secuencia de letras A,C,E,G,I (paso +2)", () => {
    const d = secuenciaLetras("A", 2, 5);
    const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const esperado = [0, 2, 4, 6, 8].map((i) => alfabeto[i]);
    expect(d.letras).toEqual(esperado);
    expect(d.letras).toEqual(["A", "C", "E", "G", "I"]);
  });

  it("Clase 5 — 482915637 agrupado en bloques de 3: 482, 915, 637", () => {
    const items = "482915637".split("");
    const d = agruparEnBloques(items, [3, 3, 3]);
    expect(d.bloques.map((b) => b.join(""))).toEqual(["482", "915", "637"]);
    // reconstrucción == original
    expect(d.bloques.flat().join("")).toBe("482915637");
  });

  it("Clase 6 — traza con condicional: x=0 → +5=5 → (5>3) +2=7 → ×3=21", () => {
    const d = trazarAlgoritmo(0, [
      { tipo: "sumar", valor: 5 },
      { tipo: "condicional", comparacion: ">", umbral: 3, siVerdadero: { tipo: "sumar", valor: 2 }, siFalso: { tipo: "restar", valor: 2 } },
      { tipo: "multiplicar", valor: 3 },
    ]);
    // reimplementación manual, independiente
    let x = 0;
    x = x + 5;
    expect(x).toBe(5);
    x = x > 3 ? x + 2 : x - 2;
    expect(x).toBe(7);
    x = x * 3;
    expect(x).toBe(21);
    expect(d.final).toBe(21);
    expect(d.final).toBe(x);
    expect(d.pasos[1].ramaTomada).toBe("verdadero");
  });

  it("Clase 6 — orden A (restar 4, dividir 2) desde 20 da 8; orden B (invertido) da 6", () => {
    const a = trazarAlgoritmo(20, [
      { tipo: "restar", valor: 4 },
      { tipo: "dividir", valor: 2 },
    ]);
    const b = trazarAlgoritmo(20, [
      { tipo: "dividir", valor: 2 },
      { tipo: "restar", valor: 4 },
    ]);
    expect(a.final).toBe((20 - 4) / 2);
    expect(a.final).toBe(8);
    expect(b.final).toBe(20 / 2 - 4);
    expect(b.final).toBe(6);
    expect(a.final).not.toBe(b.final);
  });

  it("las respuestas del quiz coinciden con los datos independientes de arriba", () => {
    const q1 = CLASES_ENIGMIA.find((c) => c.slug === "enigmia-clase-secuencias-aritmeticas-geometricas")!.quiz.find((q) => q.pregunta.includes("aritmética"))!;
    expect(q1.respuesta).toBe("19");
    const q2 = CLASES_ENIGMIA.find((c) => c.slug === "enigmia-clase-patrones-no-numericos")!.quiz.find((q) => q.pregunta.includes("A, C, E, G"))!;
    expect(q2.respuesta).toBe("I");
    const q3 = CLASES_ENIGMIA.find((c) => c.slug === "enigmia-clase-que-es-un-algoritmo")!.quiz.find((q) => q.pregunta.includes("Orden A"))!;
    expect(q3.respuesta).toContain("orden de los pasos");
  });
});

describe("Enigmia: migración 0203", () => {
  it("es exactamente lo que se genera de src/lib/enigmia/lecciones/", () => {
    const esperado = generarSqlEnigmia(CLASES_ENIGMIA);
    if (process.env.ENIGMIA_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta0203, esperado, "utf8");
    expect(fs.existsSync(ruta0203), "falta 0203: ENIGMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/enigmia/lecciones").toBe(true);
    expect(fs.readFileSync(ruta0203, "utf8")).toBe(esperado);
  });

  it("el SQL generado: 6 filas insertadas, jsonb parseable, tipos de visual conocidos", () => {
    const sql = fs.readFileSync(ruta0203, "utf8");
    expect(sql).toMatch(/insert into public\.logic_techniques/);
    expect(sql).toMatch(/alter table public\.logic_techniques add column if not exists requiere_pro/);
    const re = /\('([^']+)', '(?:[^']|'')*',\n\s+'(?:[^']|'')*',\n\s+(\d+),\n\s+'([a-z]+)',\n\s+\$enigmia\$([\s\S]*?)\$enigmia\$::jsonb,\n\s+(true|false)\)/g;
    const filas: {
      slug: string;
      orden: number;
      categoria: string;
      contenido: { pasos: string[]; visuales?: unknown[]; quiz: { pregunta: string; opciones: string[]; respuesta: string }[] };
      requierePro: boolean;
    }[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(sql)) !== null) {
      filas.push({ slug: m[1], orden: Number(m[2]), categoria: m[3], contenido: JSON.parse(m[4]), requierePro: m[5] === "true" });
    }
    expect(filas).toHaveLength(6);
    for (const f of filas) {
      const original = CLASES_ENIGMIA.find((c) => c.slug === f.slug);
      expect(original, `slug ${f.slug} no está en CLASES_ENIGMIA`).toBeDefined();
      expect(f.categoria).toBe(original!.categoria);
      expect(f.orden).toBe(original!.orden);
      expect(f.requierePro).toBe(true);
      expect(f.contenido.pasos).toEqual(original!.pasos);
      expect(Array.isArray(f.contenido.visuales) && f.contenido.visuales!.length > 0, f.slug).toBe(true);
      for (const v of f.contenido.visuales!) {
        expect(esVisualLeccion(v), f.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has((v as VisualLeccion).tipo), `${f.slug}: ${(v as VisualLeccion).tipo}`).toBe(true);
      }
      for (const q of f.contenido.quiz) expect(q.opciones).toContain(q.respuesta);
    }
  });
});
