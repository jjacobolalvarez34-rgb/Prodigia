import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { TECNICAS_ENIGMIA_NUEVAS, CLASES_ENIGMIA_NUEVAS, CLASES_ENIGMIA } from "./index";
import { generarSqlEnigmiaMasContenido } from "./sql";
import { esVisualLeccion, type VisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_ENIGMIA } from "@/components/enigmia/visuales/registro";
import {
  secuenciaAritmetica,
  secuenciaGeometrica,
  agruparEnBloques,
  trazarAlgoritmo,
  resolverPorEliminacion,
  asociarLoci,
} from "../visualesDatos";

// Verificación del contenido NUEVO de Enigmia (2026-09-22, expansión "está
// muy vacío"): 10 Técnicas nuevas (TECNICAS_ENIGMIA_NUEVAS, requiere_pro
// false, CON visuales — a diferencia de las 6 históricas de 0015/0020) y 5
// Clases nuevas (CLASES_ENIGMIA_NUEVAS, requiere_pro true). Mismo criterio
// que lecciones.test.ts: estructura + cada dato de cada visual recalculado
// con aritmética/lógica independiente + migración generada = migración
// escrita a mano. Regenerar 0206:
// ENIGMIA_MAS_ESCRIBIR_SQL=1 npx vitest run src/lib/enigmia/lecciones/masContenido.test.ts

const raiz = path.resolve(__dirname, "../../../..");
const ruta0206 = path.join(raiz, "supabase", "migrations", "0206_enigmia_mas_contenido.sql");

const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_ENIGMIA)]);
const CATEGORIAS_VALIDAS = new Set(["memoria", "patrones", "deduccion", "computacional"]);

// orden de las 6 Técnicas HISTÓRICAS por categoría (0015_mundo_enigmia.sql
// / 0020_enigmia_categorias.sql, confirmado por grep — no vive en TS
// porque esas filas nunca se reescribieron a este formato). Las nuevas
// tienen que continuar la numeración de forma correlativa por categoría.
const ORDEN_TECNICAS_HISTORICAS: Record<string, number[]> = {
  patrones: [1, 2, 3],
  deduccion: [4],
  memoria: [5],
  computacional: [6],
};

describe("Enigmia: Técnicas nuevas (estructura)", () => {
  it("son 10, todas requiere_pro=false, distribuidas en las 4 categorías", () => {
    expect(TECNICAS_ENIGMIA_NUEVAS).toHaveLength(10);
    expect(TECNICAS_ENIGMIA_NUEVAS.every((t) => t.requierePro === false)).toBe(true);
    const slugs = TECNICAS_ENIGMIA_NUEVAS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(10);
    for (const t of TECNICAS_ENIGMIA_NUEVAS) expect(CATEGORIAS_VALIDAS.has(t.categoria), t.slug).toBe(true);
    const porCategoria = new Map<string, number>();
    for (const t of TECNICAS_ENIGMIA_NUEVAS) porCategoria.set(t.categoria, (porCategoria.get(t.categoria) ?? 0) + 1);
    expect(Object.fromEntries(porCategoria)).toEqual({ patrones: 1, deduccion: 3, memoria: 3, computacional: 3 });
  });

  it("el orden de cada Técnica nueva es mayor que el máximo histórico de su categoría, sin repetidos, en el orden pedido", () => {
    const porCategoria = new Map<string, number[]>();
    for (const t of TECNICAS_ENIGMIA_NUEVAS) porCategoria.set(t.categoria, [...(porCategoria.get(t.categoria) ?? []), t.orden]);
    for (const [cat, ordenesNuevos] of porCategoria) {
      const maxHistorico = Math.max(...ORDEN_TECNICAS_HISTORICAS[cat]);
      expect(ordenesNuevos.every((o) => o > maxHistorico), cat).toBe(true);
      expect(new Set(ordenesNuevos).size, cat).toBe(ordenesNuevos.length);
      // en el orden en que aparecen en el arreglo (= orden pedagógico pedido), tienen que ser crecientes
      expect(ordenesNuevos, cat).toEqual([...ordenesNuevos].sort((a, b) => a - b));
    }
  });

  it("no repiten ningún slug de las 6 Técnicas históricas ni de las Clases", () => {
    const slugsHistoricos = new Set([
      "patron-numerico",
      "encontrar-intruso",
      "analogias",
      "condicional-si-entonces",
      "tecnicas-de-memoria",
      "pensar-como-algoritmo",
    ]);
    const slugsClases = new Set([...CLASES_ENIGMIA, ...CLASES_ENIGMIA_NUEVAS].map((c) => c.slug));
    for (const t of TECNICAS_ENIGMIA_NUEVAS) {
      expect(slugsHistoricos.has(t.slug), t.slug).toBe(false);
      expect(slugsClases.has(t.slug), t.slug).toBe(false);
    }
  });

  it("cada quiz: 4-5 preguntas, respuesta entre las opciones, sin opciones repetidas, con explicación", () => {
    for (const t of TECNICAS_ENIGMIA_NUEVAS) {
      expect(t.quiz.length, t.slug).toBeGreaterThanOrEqual(4);
      expect(t.quiz.length, t.slug).toBeLessThanOrEqual(5);
      for (const q of t.quiz) {
        expect(q.opciones, `${t.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size, `${t.slug}: ${q.pregunta}`).toBe(q.opciones.length);
        expect(q.explicacion, `${t.slug}: ${q.pregunta}`).toBeTruthy();
      }
    }
  });

  it("los pasos son una introducción corta (2-4 pasos, sin $ desparejados, sin undefined/NaN)", () => {
    for (const t of TECNICAS_ENIGMIA_NUEVAS) {
      expect(t.pasos.length, t.slug).toBeGreaterThanOrEqual(2);
      expect(t.pasos.length, t.slug).toBeLessThanOrEqual(4);
      for (const p of t.pasos) {
        expect(p.length, `${t.slug}: paso demasiado largo`).toBeLessThanOrEqual(430);
        expect((p.match(/\$/g) ?? []).length % 2, `${t.slug}: $ desparejado en «${p}»`).toBe(0);
        expect(p).not.toMatch(/undefined|NaN/);
      }
    }
  });

  it("cada Técnica tiene al menos un visual válido y despuesDePaso en rango", () => {
    for (const t of TECNICAS_ENIGMIA_NUEVAS) {
      expect(t.visuales.length, `${t.slug} sin visuales`).toBeGreaterThanOrEqual(1);
      for (const v of t.visuales) {
        expect(esVisualLeccion(v), t.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${t.slug}: tipo ${v.tipo}`).toBe(true);
        expect(v.despuesDePaso, `${t.slug}: despuesDePaso obligatorio`).toBeDefined();
        expect(v.despuesDePaso!).toBeLessThan(t.pasos.length);
      }
    }
  });
});

describe("Enigmia: Clases nuevas (estructura)", () => {
  it("son 5, todas requiere_pro, distribuidas en las 4 categorías", () => {
    expect(CLASES_ENIGMIA_NUEVAS).toHaveLength(5);
    expect(CLASES_ENIGMIA_NUEVAS.every((c) => c.requierePro === true)).toBe(true);
    const slugs = CLASES_ENIGMIA_NUEVAS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(5);
    const porCategoria = new Map<string, number>();
    for (const c of CLASES_ENIGMIA_NUEVAS) porCategoria.set(c.categoria, (porCategoria.get(c.categoria) ?? 0) + 1);
    expect(Object.fromEntries(porCategoria)).toEqual({ patrones: 1, deduccion: 1, memoria: 1, computacional: 2 });
  });

  it("el orden continúa de forma correlativa después de las 6 Clases históricas (0203), por categoría", () => {
    const historicoPorCategoria = new Map<string, number[]>();
    for (const c of CLASES_ENIGMIA) historicoPorCategoria.set(c.categoria, [...(historicoPorCategoria.get(c.categoria) ?? []), c.orden]);
    const nuevoPorCategoria = new Map<string, number[]>();
    for (const c of CLASES_ENIGMIA_NUEVAS) nuevoPorCategoria.set(c.categoria, [...(nuevoPorCategoria.get(c.categoria) ?? []), c.orden]);
    for (const [cat, ordenesNuevos] of nuevoPorCategoria) {
      const combinado = [...(historicoPorCategoria.get(cat) ?? []), ...ordenesNuevos].sort((a, b) => a - b);
      const esperado = combinado.map((_, i) => i + 1);
      expect(combinado, cat).toEqual(esperado);
    }
  });

  it("cada quiz: 4-5 preguntas, respuesta entre las opciones, sin repetidas, con explicación", () => {
    for (const c of CLASES_ENIGMIA_NUEVAS) {
      expect(c.quiz.length, c.slug).toBeGreaterThanOrEqual(4);
      expect(c.quiz.length, c.slug).toBeLessThanOrEqual(5);
      for (const q of c.quiz) {
        expect(q.opciones, `${c.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size, `${c.slug}: ${q.pregunta}`).toBe(q.opciones.length);
        expect(q.explicacion, `${c.slug}: ${q.pregunta}`).toBeTruthy();
      }
    }
  });

  it("los pasos son una introducción corta (2-4 pasos, sin $ desparejados)", () => {
    for (const c of CLASES_ENIGMIA_NUEVAS) {
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
    for (const c of CLASES_ENIGMIA_NUEVAS) {
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

describe("Enigmia: los datos de las Técnicas/Clases nuevas salen de un cálculo independiente", () => {
  it("Técnica 'patrones-alternantes': impares 2,5,8,11,14 (+3); pares 10,8,6,4 (−2); siguiente=14", () => {
    const impares = secuenciaAritmetica(2, 3, 5);
    expect(impares.terminos).toEqual([2, 5, 8, 11, 14]);
    const pares = secuenciaAritmetica(10, -2, 4);
    expect(pares.terminos).toEqual([10, 8, 6, 4]);
    // reconstrucción manual de la lista combinada
    const combinada: number[] = [];
    for (let i = 0; i < 4; i++) {
      combinada.push(impares.terminos[i], pares.terminos[i]);
    }
    expect(combinada).toEqual([2, 10, 5, 8, 8, 6, 11, 4]);
    expect(impares.terminos[4]).toBe(14);
  });

  it("Clase 'patrones-compuestos-dos-reglas': impares 1,5,9,13,17 (+4); pares 2,6,18,54 (×3); siguiente=17", () => {
    const impares = secuenciaAritmetica(1, 4, 5);
    expect(impares.terminos).toEqual([1, 5, 9, 13, 17]);
    const pares = secuenciaGeometrica(2, 3, 4);
    expect(pares.terminos).toEqual([2, 6, 18, 54]);
    const combinada: number[] = [];
    for (let i = 0; i < 4; i++) combinada.push(impares.terminos[i], pares.terminos[i]);
    expect(combinada).toEqual([1, 2, 5, 6, 9, 18, 13, 54]);
    expect(impares.terminos[4]).toBe(17);
  });

  it("Técnica 'eliminacion-por-descarte': Ana/Beto/Caro/Dani → restante Ana", () => {
    const d = resolverPorEliminacion(
      ["Ana", "Beto", "Caro", "Dani"],
      [
        { candidato: "Beto", motivo: "no tiene mascota" },
        { candidato: "Caro", motivo: "vive en un departamento sin patio" },
        { candidato: "Dani", motivo: "es alérgico a los animales" },
      ]
    );
    expect(d.restante).toBe("Ana");
    // reimplementación manual, independiente
    const candidatos = ["Ana", "Beto", "Caro", "Dani"];
    const descartados = new Set(["Beto", "Caro", "Dani"]);
    const restantes = candidatos.filter((c) => !descartados.has(c));
    expect(restantes).toEqual(["Ana"]);
  });

  it("Clase 'deduccion-por-eliminacion': Bruno/Elena/Marco/Sofía → restante Elena", () => {
    const d = resolverPorEliminacion(
      ["Bruno", "Elena", "Marco", "Sofía"],
      [
        { candidato: "Bruno", motivo: "no llegó tarde esa noche" },
        { candidato: "Marco", motivo: "no tiene el pelo castaño" },
        { candidato: "Sofía", motivo: "no estaba en el edificio esa noche" },
      ]
    );
    expect(d.restante).toBe("Elena");
  });

  it("Técnica 'metodo-de-loci': Puerta→Leche, Living→Huevos, Cocina→Pan, Dormitorio→Manzanas", () => {
    const d = asociarLoci(["Puerta", "Living", "Cocina", "Dormitorio"], ["Leche", "Huevos", "Pan", "Manzanas"]);
    expect(d.pares).toEqual([
      { lugar: "Puerta", item: "Leche" },
      { lugar: "Living", item: "Huevos" },
      { lugar: "Cocina", item: "Pan" },
      { lugar: "Dormitorio", item: "Manzanas" },
    ]);
    // zip manual, independiente
    const lugares = ["Puerta", "Living", "Cocina", "Dormitorio"];
    const items = ["Leche", "Huevos", "Pan", "Manzanas"];
    for (let i = 0; i < lugares.length; i++) expect(d.pares[i]).toEqual({ lugar: lugares[i], item: items[i] });
  });

  it("Técnica 'agrupar-por-categoria': 9 elementos en 3 bloques de 3 (frutas/animales/colores)", () => {
    const items = ["Manzana", "Pera", "Uva", "Perro", "Gato", "León", "Rojo", "Azul", "Verde"];
    const d = agruparEnBloques(items, [3, 3, 3]);
    expect(d.bloques).toEqual([
      ["Manzana", "Pera", "Uva"],
      ["Perro", "Gato", "León"],
      ["Rojo", "Azul", "Verde"],
    ]);
    expect(d.bloques.flat()).toEqual(items);
  });

  it("Técnica 'trazar-un-bucle-a-mano': x=1, ×2 tres veces = 8", () => {
    const d = trazarAlgoritmo(1, [
      { tipo: "multiplicar", valor: 2 },
      { tipo: "multiplicar", valor: 2 },
      { tipo: "multiplicar", valor: 2 },
    ]);
    let x = 1;
    x *= 2;
    x *= 2;
    x *= 2;
    expect(x).toBe(8);
    expect(d.final).toBe(8);
    expect(d.final).toBe(x);
  });

  it("Técnica 'condicion-de-corte': x=1, mientras x<10 suma 3 → se detiene en el 4º paso con x=10", () => {
    const paso = { tipo: "condicional" as const, comparacion: "<" as const, umbral: 10, siVerdadero: { tipo: "sumar" as const, valor: 3 }, siFalso: { tipo: "restar" as const, valor: 0 } };
    const d = trazarAlgoritmo(1, [paso, paso, paso, paso]);
    expect(d.pasos.map((p) => p.valorDespues)).toEqual([4, 7, 10, 10]);
    expect(d.pasos.map((p) => p.ramaTomada)).toEqual(["verdadero", "verdadero", "verdadero", "falso"]);
    expect(d.final).toBe(10);
  });

  it("Técnica 'simplificar-antes-de-ejecutar': sumar 5 tres veces == sumar 15 una vez, ambos dan 15", () => {
    const a = trazarAlgoritmo(0, [
      { tipo: "sumar", valor: 5 },
      { tipo: "sumar", valor: 5 },
      { tipo: "sumar", valor: 5 },
    ]);
    const b = trazarAlgoritmo(0, [{ tipo: "sumar", valor: 15 }]);
    expect(a.final).toBe(15);
    expect(b.final).toBe(15);
    expect(a.final).toBe(b.final);
  });

  it("Clase 'repeticion-espaciada-y-recuerdo-activo': intervalos 1,2,4,8,16 (razón ×2)", () => {
    const d = secuenciaGeometrica(1, 2, 5);
    expect(d.terminos).toEqual([1, 2, 4, 8, 16]);
    for (let i = 1; i < d.terminos.length; i++) expect(d.terminos[i] / d.terminos[i - 1]).toBe(2);
  });

  it("Clase 'bucles-y-repeticion': x=0, +2 cuatro veces = 8", () => {
    const d = trazarAlgoritmo(0, [
      { tipo: "sumar", valor: 2 },
      { tipo: "sumar", valor: 2 },
      { tipo: "sumar", valor: 2 },
      { tipo: "sumar", valor: 2 },
    ]);
    expect(d.pasos.map((p) => p.valorDespues)).toEqual([2, 4, 6, 8]);
    expect(d.final).toBe(8);
  });

  it("Clase 'depuracion-por-que-falla-un-algoritmo': orden con bug da 1; orden corregido da 3", () => {
    const bug = trazarAlgoritmo(10, [
      { tipo: "dividir", valor: 2 },
      { tipo: "restar", valor: 4 },
    ]);
    const corregido = trazarAlgoritmo(10, [
      { tipo: "restar", valor: 4 },
      { tipo: "dividir", valor: 2 },
    ]);
    expect(bug.final).toBe(10 / 2 - 4);
    expect(bug.final).toBe(1);
    expect(corregido.final).toBe((10 - 4) / 2);
    expect(corregido.final).toBe(3);
  });
});

describe("Enigmia: migración 0206", () => {
  it("es exactamente lo que se genera de src/lib/enigmia/lecciones/", () => {
    const esperado = generarSqlEnigmiaMasContenido(TECNICAS_ENIGMIA_NUEVAS, CLASES_ENIGMIA_NUEVAS);
    if (process.env.ENIGMIA_MAS_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta0206, esperado, "utf8");
    expect(fs.existsSync(ruta0206), "falta 0206: ENIGMIA_MAS_ESCRIBIR_SQL=1 npx vitest run src/lib/enigmia/lecciones/masContenido.test.ts").toBe(true);
    expect(fs.readFileSync(ruta0206, "utf8")).toBe(esperado);
  });

  it("el SQL generado: 15 filas insertadas (10 técnicas + 5 clases), jsonb parseable, tipos de visual conocidos", () => {
    const sql = fs.readFileSync(ruta0206, "utf8");
    expect(sql).toMatch(/insert into public\.logic_techniques/);
    expect(sql).not.toMatch(/alter table/);
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
    expect(filas).toHaveLength(15);
    const todas = [...TECNICAS_ENIGMIA_NUEVAS, ...CLASES_ENIGMIA_NUEVAS];
    for (const f of filas) {
      const original = todas.find((c) => c.slug === f.slug);
      expect(original, `slug ${f.slug} no está en el contenido nuevo`).toBeDefined();
      expect(f.categoria).toBe(original!.categoria);
      expect(f.orden).toBe(original!.orden);
      expect(f.requierePro).toBe(original!.requierePro);
      expect(f.contenido.pasos).toEqual(original!.pasos);
      expect(f.contenido.quiz.length).toBeGreaterThanOrEqual(4);
      expect(Array.isArray(f.contenido.visuales) && f.contenido.visuales!.length > 0, f.slug).toBe(true);
      for (const v of f.contenido.visuales!) {
        expect(esVisualLeccion(v), f.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has((v as VisualLeccion).tipo), `${f.slug}: ${(v as VisualLeccion).tipo}`).toBe(true);
      }
      for (const q of f.contenido.quiz) expect(q.opciones).toContain(q.respuesta);
    }
    expect(filas.filter((f) => !f.requierePro)).toHaveLength(10);
    expect(filas.filter((f) => f.requierePro)).toHaveLength(5);
  });
});
