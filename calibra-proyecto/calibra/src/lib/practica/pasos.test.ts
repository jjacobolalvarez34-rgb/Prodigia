import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { generarAcertijoProcedural } from "@/lib/enigmia/generadores";
import { pasosEnigmia } from "@/lib/enigmia/pasos";
import { pasosMelodia } from "@/lib/melodia/pasos";
import { generarPreguntaMelodia, MODOS_MELODIA } from "./melodia";
import { generarPreguntaQuimia } from "./quimia";
import { generarPreguntaOrganica } from "./quimicaOrganica";
import { generarProblemaCalculia, type ModoCalculia } from "./calculia";
import { generarProblemaCircuitia, type ModoCircuitia } from "./circuitia";
import { generarProblemaCodia } from "./codia";
import { generarProblemaDinamia } from "./dinamia";
import { generarProblemaVitalia } from "./vitalia";
import { generarProblemaNaipia } from "./naipia";
import { generarProblemaTrigonometria } from "./trigonometria";

// Cada pregunta trae su «cómo se resuelve» (pedido 2026-10-18), sin huecos raros.
// En Codia «NaN», «Infinity» y «undefined» pueden ser la salida real de un programa (JS).
function revisar(pasos: string[] | undefined, donde: string, codigo = false) {
  expect(pasos?.length, donde).toBeGreaterThan(0);
  for (const p of pasos ?? []) expect(p, donde).not.toMatch(codigo ? /\[object|\f/ : /NaN|undefined|Infinity|\[object|\f/);
}

describe("pasos de cada mundo", () => {
  it("Calculia", () => {
    for (const modo of ["derivadas", "integrales", "series", "multivariable"] as ModoCalculia[])
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 20; i++) revisar(generarProblemaCalculia(modo, nivel).pasos, `calculia ${modo} ${nivel}`);
  });

  it("Circuitia", () => {
    for (const modo of ["serie", "paralelo", "mixto", "cualitativo"] as ModoCircuitia[])
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 15; i++) revisar(generarProblemaCircuitia(modo, nivel).pasos, `circuitia ${modo} ${nivel}`);
  });

  it("Trigonometría", () => {
    for (const modo of ["razones", "circulo", "identidades", "leyes"] as const)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 15; i++) revisar(generarProblemaTrigonometria(modo, nivel).pasos, `trigonometria ${modo} ${nivel}`);
  });

  it("Codia", () => {
    for (const modo of ["sintaxis", "salida", "error", "estructuras"] as const)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 8; i++) revisar(generarProblemaCodia(modo, nivel).pasos, `codia ${modo} ${nivel}`, true);
  });

  it("Naipia", () => {
    for (const modo of ["hilo", "ko", "hiopt2", "omega2", "verdadero"] as const)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 10; i++) revisar(generarProblemaNaipia(modo, nivel).pasos, `naipia ${modo} ${nivel}`);
  });

  it("Dinamia", () => {
    for (const modo of ["cinematica", "vectores", "newton", "energia", "termo", "fluidos"] as const)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 15; i++) revisar(generarProblemaDinamia(modo, nivel).pasos, `dinamia ${modo} ${nivel}`);
  });

  it("Vitalia", () => {
    for (const modo of ["celula", "procesos", "genetica", "sistemas", "reinos", "ecologia"] as const)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 15; i++) {
        const p = generarProblemaVitalia(modo, nivel);
        revisar(p.pasos, `vitalia ${modo} ${nivel}`);
        expect(p.pasos?.[0], `vitalia sin idea propia: ${p.detalle.tipo}`).not.toMatch(/^Piensa en la idea/);
      }
  });

  it("Quimia", () => {
    for (const modo of ["simbolos", "formulas", "tabla", "nomenclatura"] as const)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 15; i++) revisar(generarPreguntaQuimia(modo, nivel, new Set()).pasos, `quimia ${modo} ${nivel}`);
    for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 10; i++) revisar(generarPreguntaOrganica(nivel, new Set()).pasos, `quimia organica ${nivel}`);
  });

  it("Melodía", () => {
    for (const modo of MODOS_MELODIA)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 20; i++) {
        const p = generarPreguntaMelodia(modo, nivel);
        const pasos = pasosMelodia(p);
        revisar(pasos, `melodia ${modo} ${nivel}`);
        expect(pasos[0], `melodia sin explicación: ${p.enunciado}`).not.toMatch(/^Respuesta/);
      }
  });

  it("Enigmia: el cómputo rehecho da la respuesta y cada serie dice su regla", () => {
    for (const c of ["memoria", "patrones", "computacional"] as const)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 20; i++) {
        const p = generarAcertijoProcedural(c, nivel);
        const pasos = pasosEnigmia(p);
        revisar(pasos, `enigmia ${c} ${nivel}`);
        expect(pasos.length, `enigmia sin explicación: ${p.contenido.enunciado}`).toBeGreaterThan(1);
        if (c === "computacional" && !p.contenido.enunciado.includes("termine en")) expect(pasos.join(" ")).toMatch(new RegExp(`= ${p.respuesta}$`));
        if (c === "patrones") expect(pasos[pasos.length - 1]).toMatch(new RegExp(`= ${p.respuesta}$`));
      }
  });

  it("Enigmia: cada acertijo de deducción del banco tiene su explicación", () => {
    const sql = ["0015_mundo_enigmia", "0020_enigmia_categorias", "0164_mas_acertijos_deduccion"].map((f) => readFileSync(`supabase/migrations/${f}.sql`, "utf8")).join("\n");
    const filas = [...sql.matchAll(/\('deduccion', \d+, '(\{.*?\})', '/g)];
    expect(filas.length).toBeGreaterThan(30);
    for (const [, json] of filas) {
      const contenido = JSON.parse(json.replace(/''/g, "'"));
      const pasos = pasosEnigmia({ id: "x", tipo: "deduccion", dificultad: 1, contenido, respuesta: "?" });
      expect(pasos.length, contenido.enunciado).toBeGreaterThan(1);
    }
  });
});
