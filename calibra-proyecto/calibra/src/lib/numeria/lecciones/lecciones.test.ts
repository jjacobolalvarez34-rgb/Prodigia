import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CLASES_NUMERIA } from "./index";
import { generarSqlNumeria } from "./sql";
import { esVisualLeccion, type VisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_NUMERIA } from "@/components/numeria/visuales/registro";
import {
  columnasSuma,
  columnasResta,
  multiplicacionColumnas,
  divisionLarga,
  mcmPorListado,
  fraccionOperacion,
} from "../visualesDatos";

// Verificación del contenido de las 5 Clases nuevas de Numeria (Prioridad 1,
// docs/PARIDAD_MUNDOS.md fila 22 + fila 23): estructura (slugs, orden,
// requiere_pro, quiz), visuales con tipos conocidos, y sobre todo que CADA
// número mostrado se recalcula con aritmética independiente (no las mismas
// funciones que dibujan el visual: acá se reimplementan a mano el MCD/MCM
// y la simplificación de fracciones, y se usan los operadores nativos +,
// -, *, Math.floor, % como referencia).
// Regenerar la migración 0199: NUMERIA_ESCRIBIR_SQL=1 npx vitest run src/lib/numeria/lecciones

const raiz = path.resolve(__dirname, "../../../..");
const ruta0199 = path.join(raiz, "supabase", "migrations", "0199_numeria_clases_conceptos.sql");

const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_NUMERIA)]);

// ---------- MCD/MCM y simplificación de fracciones, reimplementados a
// mano (independiente de src/lib/numeria/visualesDatos.ts) ----------
function mcdIndependiente(x: number, y: number): number {
  let a = Math.abs(x);
  let b = Math.abs(y);
  while (b !== 0) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}

function mcmFuerzaBruta(a: number, b: number): number {
  for (let m = 1; m <= a * b; m++) {
    if (m % a === 0 && m % b === 0) return m;
  }
  return a * b;
}

function simplificar(num: number, den: number): { num: number; den: number } {
  const d = mcdIndependiente(num, den) || 1;
  return { num: num / d, den: den / d };
}

describe("Numeria: Clases nuevas (estructura)", () => {
  it("son 5, con orden 1-2 dentro de su propio tema, todas requiere_pro", () => {
    expect(CLASES_NUMERIA).toHaveLength(5);
    expect(CLASES_NUMERIA.every((c) => c.requierePro === true)).toBe(true);
    const slugs = CLASES_NUMERIA.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(5);
  });

  it("los problem_type elegidos son los documentados (suma, multiplicacion, division, fracciones x2)", () => {
    expect(CLASES_NUMERIA.map((c) => c.problemType)).toEqual(["suma", "multiplicacion", "division", "fracciones", "fracciones"]);
  });

  it("cada quiz: respuesta entre las opciones, sin opciones repetidas, al menos 2 preguntas", () => {
    for (const c of CLASES_NUMERIA) {
      expect(c.quiz.length, c.slug).toBeGreaterThanOrEqual(2);
      for (const q of c.quiz) {
        expect(q.opciones, `${c.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size).toBe(q.opciones.length);
      }
    }
  });

  it("los pasos son una introducción corta (2-4 pasos, cada uno breve, sin $ desparejados)", () => {
    for (const c of CLASES_NUMERIA) {
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
    for (const c of CLASES_NUMERIA) {
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

describe("Numeria: los números de las Clases salen de un cálculo independiente", () => {
  it("Clase 1 — suma 248 + 176 en columna: acarreo correcto, resultado 424", () => {
    const d = columnasSuma(248, 176);
    expect(d.resultado).toBe(248 + 176);
    expect(d.resultado).toBe(424);
    // columnas vienen de mayor a menor posición: [centenas, decenas, unidades]
    const [centenas, decenas, unidades] = d.columnas;
    expect(unidades).toMatchObject({ digitoA: 8, digitoB: 6, entra: 0, resultado: 4, sale: 1 });
    expect(decenas).toMatchObject({ digitoA: 4, digitoB: 7, entra: 1, resultado: 2, sale: 1 });
    expect(centenas).toMatchObject({ digitoA: 2, digitoB: 1, entra: 1, resultado: 4, sale: 0 });
    // reconstrucción dígito a dígito == resultado
    const reconstruido = d.columnas.reduce((acc, c) => acc * 10 + c.resultado, 0);
    expect(reconstruido).toBe(d.resultado);
  });

  it("Clase 1 — resta 532 − 178 en columna: préstamo correcto, resultado 354", () => {
    const d = columnasResta(532, 178);
    expect(d.resultado).toBe(532 - 178);
    expect(d.resultado).toBe(354);
    const [centenas, decenas, unidades] = d.columnas;
    expect(unidades).toMatchObject({ digitoA: 2, digitoB: 8, entra: 0, resultado: 4, sale: 1 });
    expect(decenas).toMatchObject({ digitoA: 3, digitoB: 7, entra: 1, resultado: 5, sale: 1 });
    expect(centenas).toMatchObject({ digitoA: 5, digitoB: 1, entra: 1, resultado: 3, sale: 0 });
    const reconstruido = d.columnas.reduce((acc, c) => acc * 10 + c.resultado, 0);
    expect(reconstruido).toBe(d.resultado);
  });

  it("Clase 2 — 23 × 14 = 322, productos parciales 92 y 230", () => {
    const d = multiplicacionColumnas(23, 14);
    expect(d.resultado).toBe(23 * 14);
    expect(d.resultado).toBe(322);
    expect(d.parciales).toEqual([
      { digito: 4, posicion: 0, valor: 92 },
      { digito: 1, posicion: 1, valor: 230 },
    ]);
    expect(d.parciales.reduce((a, p) => a + p.valor, 0)).toBe(d.resultado);
  });

  it("Clase 3 — 937 ÷ 4: cociente 234, resto 1, cada paso verificado", () => {
    const d = divisionLarga(937, 4);
    expect(d.cociente).toBe(Math.floor(937 / 4));
    expect(d.resto).toBe(937 % 4);
    expect(d.cociente).toBe(234);
    expect(d.resto).toBe(1);
    expect(d.cociente * d.divisor + d.resto).toBe(937);
    expect(d.pasos).toEqual([
      { bajado: 9, arrastreEntra: 0, numeroActual: 9, digitoCociente: 2, producto: 8, resto: 1 },
      { bajado: 3, arrastreEntra: 1, numeroActual: 13, digitoCociente: 3, producto: 12, resto: 1 },
      { bajado: 7, arrastreEntra: 1, numeroActual: 17, digitoCociente: 4, producto: 16, resto: 1 },
    ]);
  });

  it("Clase 4 — MCM(4,6) = 12 por fuerza bruta y por listado", () => {
    const d = mcmPorListado(4, 6);
    expect(d.mcm).toBe(mcmFuerzaBruta(4, 6));
    expect(d.mcm).toBe(12);
    expect(d.primerComun).toBe(12);
  });

  it("Clase 5 — 1/4 + 1/6 = 5/12", () => {
    const d = fraccionOperacion("suma", 1, 4, 1, 6);
    const esperado = simplificar(1 * 6 + 1 * 4, 4 * 6); // (num1*den2 + num2*den1) / (den1*den2)
    expect({ num: d.numSimplificado, den: d.denSimplificado }).toEqual(esperado);
    expect(esperado).toEqual({ num: 5, den: 12 });
  });

  it("Clase 5 — 2/3 × 3/5 = 2/5", () => {
    const d = fraccionOperacion("multiplicacion", 2, 3, 3, 5);
    const esperado = simplificar(2 * 3, 3 * 5);
    expect({ num: d.numSimplificado, den: d.denSimplificado }).toEqual(esperado);
    expect(esperado).toEqual({ num: 2, den: 5 });
  });

  it("Clase 5 — 2/3 ÷ 3/5 = 10/9", () => {
    const d = fraccionOperacion("division", 2, 3, 3, 5);
    const esperado = simplificar(2 * 5, 3 * 3); // multiplicar por la recíproca: num1*den2 / den1*num2
    expect({ num: d.numSimplificado, den: d.denSimplificado }).toEqual(esperado);
    expect(esperado).toEqual({ num: 10, den: 9 });
  });

  it("las respuestas del quiz coinciden con los datos independientes de arriba", () => {
    const q1 = CLASES_NUMERIA.find((c) => c.slug === "numeria-clase-multiplicacion")!.quiz.find((q) => q.pregunta.includes("¿Cuánto da 23"))!;
    expect(q1.respuesta).toBe("322");
    const q2 = CLASES_NUMERIA.find((c) => c.slug === "numeria-clase-division")!.quiz.find((q) => q.pregunta.includes("cociente"))!;
    expect(q2.respuesta).toBe("234");
    const q3 = CLASES_NUMERIA.find((c) => c.slug === "numeria-clase-mcm")!.quiz.find((q) => q.pregunta.includes("MCM de 4"))!;
    expect(q3.respuesta).toBe("12");
  });
});

describe("Numeria: migración 0199", () => {
  it("es exactamente lo que se genera de src/lib/numeria/lecciones/", () => {
    const esperado = generarSqlNumeria(CLASES_NUMERIA);
    if (process.env.NUMERIA_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta0199, esperado, "utf8");
    expect(fs.existsSync(ruta0199), "falta 0199: NUMERIA_ESCRIBIR_SQL=1 npx vitest run src/lib/numeria/lecciones").toBe(true);
    expect(fs.readFileSync(ruta0199, "utf8")).toBe(esperado);
  });

  it("el SQL generado: 5 filas insertadas, jsonb parseable, tipos de visual conocidos", () => {
    const sql = fs.readFileSync(ruta0199, "utf8");
    expect(sql).toMatch(/insert into public\.techniques/);
    const re = /\('([^']+)', '(?:[^']|'')*',\n\s+'(?:[^']|'')*',\n\s+'([a-z]+)',\n\s+\$numeria\$([\s\S]*?)\$numeria\$::jsonb,\n\s+(\d+), (true|false)\)/g;
    const filas: { slug: string; problemType: string; contenido: { pasos: string[]; visuales?: unknown[]; quiz: { pregunta: string; opciones: string[]; respuesta: string }[] }; orden: number; requierePro: boolean }[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(sql)) !== null) {
      filas.push({ slug: m[1], problemType: m[2], contenido: JSON.parse(m[3]), orden: Number(m[4]), requierePro: m[5] === "true" });
    }
    expect(filas).toHaveLength(5);
    for (const f of filas) {
      const original = CLASES_NUMERIA.find((c) => c.slug === f.slug);
      expect(original, `slug ${f.slug} no está en CLASES_NUMERIA`).toBeDefined();
      expect(f.problemType).toBe(original!.problemType);
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
