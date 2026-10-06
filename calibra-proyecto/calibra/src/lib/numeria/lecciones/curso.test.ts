import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { REGISTRO_VISUALES_NUMERIA } from "@/components/numeria/visuales/registro";
import { decimal, distributiva, ecuacion, exponentes, metodoFraccion, porcentaje, raiz, terminosSemejantes } from "../cursoDatos";
import { CLASES_NUMERIA } from "./clases";
import { CURSO_NUMERIA, REORDEN_CLASES_EXISTENTES } from "./curso";
import { generarSqlCurso } from "./sql";

// Curso completo de Numeria (2026-10-06): estructura, que cada visual se pueda
// calcular, que cada respuesta del quiz esté entre las opciones, y que los
// resultados de los métodos coincidan con aritmética independiente.
// Regenerar la migración: NUMERIA_CURSO_ESCRIBIR_SQL=1 npx vitest run src/lib/numeria/lecciones/curso.test.ts

const raizRepo = path.resolve(__dirname, "../../../..");
const ruta0251 = path.join(raizRepo, "supabase", "migrations", "0251_numeria_curso_completo.sql");
const TIPOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_NUMERIA)]);

function mcdInd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : mcdInd(b, a % b);
}
function simp(n: number, d: number): [number, number] {
  const k = mcdInd(n, d) || 1;
  return [n / k, d / k];
}

describe("Numeria: curso completo", () => {
  it("slugs únicos (también contra las Clases de 0199) y todas requiere_pro", () => {
    const slugs = [...CLASES_NUMERIA, ...CURSO_NUMERIA].map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(CURSO_NUMERIA.every((c) => c.requierePro)).toBe(true);
  });

  it("dentro de cada tema el orden no se repite (contando las clases reubicadas)", () => {
    const porTema = new Map<string, number[]>();
    for (const c of CURSO_NUMERIA) porTema.set(c.problemType, [...(porTema.get(c.problemType) ?? []), c.orden]);
    for (const r of REORDEN_CLASES_EXISTENTES) porTema.set("fracciones", [...(porTema.get("fracciones") ?? []), r.orden]);
    for (const [tema, ordenes] of porTema) expect(new Set(ordenes).size, tema).toBe(ordenes.length);
  });

  it("cubre los temas pedidos: fracciones, decimales y porcentajes, potencias y raíces, álgebra y geometría", () => {
    const temas = new Set(CURSO_NUMERIA.map((c) => c.problemType));
    for (const t of ["fracciones", "decimales", "potencias", "algebra", "geometria"]) expect(temas.has(t as never), t).toBe(true);
    const fracciones = CURSO_NUMERIA.filter((c) => c.problemType === "fracciones").flatMap((c) => c.visuales.map((v) => (v as { modo?: string }).modo));
    for (const m of ["carita", "cruz", "oreja", "mcmVarias", "amplificar", "multiplicar"]) expect(fracciones, m).toContain(m);
  });

  it("cada quiz: la respuesta está entre las opciones y no hay opciones repetidas", () => {
    for (const c of CURSO_NUMERIA) {
      expect(c.quiz.length, c.slug).toBeGreaterThanOrEqual(2);
      for (const q of c.quiz) {
        expect(q.opciones, `${c.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size, `${c.slug}: ${q.pregunta}`).toBe(q.opciones.length);
        expect(q.respuesta.length, c.slug).toBeGreaterThan(0);
      }
    }
  });

  it("cada visual es de un tipo conocido y sus datos se pueden calcular", () => {
    for (const c of CURSO_NUMERIA) {
      for (const v of c.visuales) {
        const x = v as unknown as Record<string, never>;
        expect(TIPOS.has(v.tipo), `${c.slug}: ${v.tipo}`).toBe(true);
        let ok: unknown = true;
        if (v.tipo === "numeria.metodoFraccion") ok = metodoFraccion({ modo: x.modo, fracciones: x.fracciones, operacion: x.operacion, factor: x.factor });
        if (v.tipo === "numeria.decimal") ok = decimal({ modo: x.modo, a: x.a, b: x.b, operacion: x.operacion, num: x.num, den: x.den });
        if (v.tipo === "numeria.porcentaje") ok = porcentaje({ modo: x.modo, porcentaje: x.porcentaje, base: x.base, tipo: x.tipoCambio });
        if (v.tipo === "numeria.exponentes") ok = exponentes(x.ley, x.base, x.m, x.n);
        if (v.tipo === "numeria.raiz") ok = raiz(x.n);
        if (v.tipo === "numeria.terminos") ok = terminosSemejantes(x.terminos);
        if (v.tipo === "numeria.distributiva") ok = distributiva(x.factor, x.sumandos);
        if (v.tipo === "numeria.ecuacion") ok = ecuacion(x.a, x.b, x.c, x.d);
        expect(ok, `${c.slug}: ${v.tipo}`).toBeTruthy();
      }
    }
  });

  it("los métodos de fracciones dan lo mismo que la aritmética directa", () => {
    const casos: [Parameters<typeof metodoFraccion>[0], [number, number]][] = [
      [{ modo: "carita", fracciones: [[2, 3], [1, 4]], operacion: "suma" }, simp(2 * 4 + 3 * 1, 12)],
      [{ modo: "carita", fracciones: [[5, 6], [1, 4]], operacion: "resta" }, simp(5 * 4 - 6, 24)],
      [{ modo: "mcmVarias", fracciones: [[1, 2], [2, 3], [3, 4]], operacion: "suma" }, simp(6 + 8 + 9, 12)],
      [{ modo: "multiplicar", fracciones: [[4, 9], [3, 8]] }, simp(12, 72)],
      [{ modo: "cruz", fracciones: [[3, 4], [5, 6]] }, simp(18, 20)],
      [{ modo: "oreja", fracciones: [[2, 3], [4, 5]] }, simp(10, 12)],
      [{ modo: "igualDen", fracciones: [[5, 8], [1, 8]], operacion: "resta" }, simp(4, 8)],
    ];
    for (const [e, esperado] of casos) expect(metodoFraccion(e)?.resultado, e.modo).toEqual(esperado);
    // Y el valor numérico coincide con operar en coma flotante.
    const r = metodoFraccion({ modo: "carita", fracciones: [[2, 3], [1, 4]], operacion: "suma" })!.resultado;
    expect(r[0] / r[1]).toBeCloseTo(2 / 3 + 1 / 4, 12);
  });

  it("decimales, porcentajes, potencias, raíces y álgebra coinciden con la cuenta directa", () => {
    expect(decimal({ modo: "sumaResta", a: "12.5", b: "3.75", operacion: "suma" })?.resultado).toBe("16,25");
    expect(decimal({ modo: "sumaResta", a: "8.3", b: "2.47", operacion: "resta" })?.resultado).toBe("5,83");
    expect(decimal({ modo: "multiplicar", a: "2.5", b: "1.3" })?.resultado).toBe("3,25");
    expect(decimal({ modo: "fraccionADecimal", num: 3, den: 8 })?.resultado).toBe("0,375");
    expect(decimal({ modo: "fraccionADecimal", num: 1, den: 3 })?.periodico).toBe(true);
    expect(porcentaje({ modo: "de", porcentaje: 35, base: 80 })?.resultado).toBe((35 * 80) / 100);
    expect(porcentaje({ modo: "cambio", porcentaje: 15, base: 200, tipo: "aumento" })?.resultado).toBe(230);
    expect(porcentaje({ modo: "cambio", porcentaje: 25, base: 80, tipo: "descuento" })?.resultado).toBe(60);
    expect(exponentes("producto", 2, 3, 4)?.exponenteFinal).toBe(Math.log2(2 ** 3 * 2 ** 4));
    expect(exponentes("cociente", 5, 6, 2)?.exponenteFinal).toBe(Math.round(Math.log(5 ** 6 / 5 ** 2) / Math.log(5)));
    expect(exponentes("potencia", 3, 2, 3)?.exponenteFinal).toBe(6);
    expect(raiz(49)?.abajo).toBe(7);
    expect(raiz(50)).toMatchObject({ abajo: 7, arriba: 8, exacta: false });
    expect(ecuacion(5, 3, 2, 15)?.x).toBe(4);
    expect(5 * 4 + 3).toBe(2 * 4 + 15);
    expect(terminosSemejantes([{ coef: 3, var: "x" }, { coef: 2, var: "" }, { coef: -1, var: "x" }, { coef: 5, var: "" }])?.resultado).toEqual([
      { coef: 2, var: "x" },
      { coef: 7, var: "" },
    ]);
    expect(distributiva(3, [{ coef: 1, var: "x" }, { coef: 4, var: "" }])?.productos).toEqual([
      { coef: 3, var: "x" },
      { coef: 12, var: "" },
    ]);
  });

  it("la migración 0251 está generada desde este contenido", () => {
    const sql = generarSqlCurso(CURSO_NUMERIA, REORDEN_CLASES_EXISTENTES);
    if (process.env.NUMERIA_CURSO_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta0251, sql);
    expect(fs.readFileSync(ruta0251, "utf8").replace(/\r\n/g, "\n")).toBe(sql);
  });
});
