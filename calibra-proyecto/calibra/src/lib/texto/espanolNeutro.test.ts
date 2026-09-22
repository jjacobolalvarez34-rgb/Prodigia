import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { detectarVoseo, detectarVoseoEnMensajes } from "./espanolNeutro";

const RAIZ = path.resolve(__dirname, "../../..");

describe("detectarVoseo (unidad)", () => {
  it("reconoce imperativos y presentes voseo comunes", () => {
    expect(detectarVoseo("hacé click acá").map((h) => h.termino)).toContain("hacé");
    expect(detectarVoseo("seguí practicando")[0]?.termino).toBe("seguí");
    expect(detectarVoseo("tenés que elegir")[0]?.termino).toBe("tenés");
    expect(detectarVoseo("vos podés lograrlo").length).toBeGreaterThan(0);
  });

  it("no marca falsos positivos (palabras normales que terminan parecido)", () => {
    expect(detectarVoseo("Practica todos los días")).toEqual([]);
    expect(detectarVoseo("Guarda tu progreso y sigue jugando")).toEqual([]);
    expect(detectarVoseo("mamá, sofá, quizá, además, así")).toEqual([]);
    expect(detectarVoseo("los dioses griegos y los meses del año")).toEqual([]);
    expect(detectarVoseo("Después de esto, tienes más práctica, además del país y el inglés")).toEqual([]);
  });
});

describe("español neutro (sin voseo) en messages/es.json", () => {
  it("ningún valor de messages/es.json usa voseo", () => {
    const es = JSON.parse(readFileSync(path.join(RAIZ, "messages/es.json"), "utf8"));
    const hallazgos = detectarVoseoEnMensajes(es);
    if (hallazgos.length > 0) {
      const detalle = hallazgos.map((h) => `  ${h.ruta}: "${h.hallazgo.termino}" en «…${h.hallazgo.contexto}…»`).join("\n");
      throw new Error(`Voseo encontrado en messages/es.json (español neutro, sin voseo — ver docs/PARIDAD_MUNDOS.md):\n${detalle}`);
    }
    expect(hallazgos).toEqual([]);
  });
});

// Deuda histórica (pedido del usuario 2026-09-22, ver docs/ESPECIFICACION.md
// "Español neutro — sin voseo"): estas migraciones son ANTERIORES a esta
// regla y ya están aplicadas en la base real — editar el archivo no cambia
// nada en producción (haría falta una migración UPDATE nueva por cada una,
// fila por fila, un trabajo de contenido aparte, tipo "Proceso 3" en
// docs/PLAN_REVISION_CONTENIDO.md). Grandfathered a propósito para que la
// suite quede en verde SIN silenciar la regla hacia adelante: cualquier
// archivo nuevo, o cualquier edición a uno de estos, tiene que pasar el
// chequeo — solo estos nombres exactos quedan exceptuados. Sacar un nombre
// de esta lista en cuanto se le escriba su migración de corrección.
const DEUDA_HISTORICA_VOSEO = new Set([
  "0005_modificadores_y_camino.sql",
  "0007_contenido_tecnicas.sql",
  "0015_mundo_enigmia.sql",
  "0018_lecciones_numeria.sql",
  "0019_fracciones.sql",
  "0020_enigmia_categorias.sql",
  "0026_decimales_potencias.sql",
  "0027_geografia_lecciones.sql",
  "0032_algebra_basica.sql",
  "0056_mundo_quimia.sql",
  "0065_anuncios.sql",
  "0079_practicar_subtemas.sql",
  "0081_mundo_anatomia.sql",
  "0089_mundo_melodia.sql",
  "0101_lecciones_avanzadas_numeria.sql",
  "0108_mundo_trigonometria.sql",
  "0109_mundo_historia.sql",
  "0147_trigonometria_estimar_no_notables.sql",
  "0165_mundo_calculia.sql",
  "0167_mundo_circuitia.sql",
  "0170_calculia_curso_pro.sql",
  "0171_circuitia_curso_pro.sql",
  "0172_geografia_lecciones_quiz.sql",
  "0175_quimia_lecciones_quiz.sql",
  "0176_historia_lecciones_quiz.sql",
  "0177_trigonometria_lecciones_quiz.sql",
  "0178_calculia_tecnicas_quiz.sql",
  "0179_circuitia_tecnicas_quiz.sql",
  "0180_fix_trigonometria_truco_mano.sql",
  "0181_calculia_tecnicas_latex.sql",
  "0182_numeria_quiz_aritmetica_basica.sql",
  "0183_numeria_quiz_fracciones_decimales_potencias.sql",
  "0184_numeria_quiz_algebra_geometria.sql",
  "0185_numeria_notacion_latex.sql",
]);

describe("español neutro (sin voseo) en el contenido de las migraciones (lecciones/técnicas/quiz)", () => {
  const dir = path.join(RAIZ, "supabase/migrations");
  const archivos = readdirSync(dir).filter((f) => /^\d{4}.*\.sql$/.test(f) && !DEUDA_HISTORICA_VOSEO.has(f));

  for (const archivo of archivos) {
    it(`${archivo}: sin voseo en los literales de texto`, () => {
      const sql = readFileSync(path.join(dir, archivo), "utf8");
      // Solo analiza migraciones que insertan/actualizan contenido de
      // lecciones o anuncios (texto libre pensado para leerse) — el resto
      // del SQL (DDL, nombres de columnas, RPCs de mecánica) no es prosa y
      // daría falsos positivos sobre identificadores.
      if (!/insert into public\.(techniques|logic_techniques|anuncios|achievements)|update public\.techniques/i.test(sql)) return;
      const hallazgos = detectarVoseo(sql);
      if (hallazgos.length > 0) {
        const detalle = hallazgos
          .slice(0, 15)
          .map((h) => `  "${h.termino}" en «…${h.contexto}…»`)
          .join("\n");
        throw new Error(`Voseo encontrado en ${archivo} (español neutro, sin voseo):\n${detalle}${hallazgos.length > 15 ? `\n  (+${hallazgos.length - 15} más)` : ""}`);
      }
      expect(hallazgos).toEqual([]);
    });
  }
});
