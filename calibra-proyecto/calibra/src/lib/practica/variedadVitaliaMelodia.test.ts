// Test de variedad de Vitalia y Melodía (auditoría 2026-10-29, docs/AUDITORIA_PREGUNTAS.md
// y docs/avance/AUDITORIA_VITALIA_MELODIA.md). Igual que variedadNumeria.test.ts:
// para cada modo y cada nivel se generan N preguntas con semillas distintas y se
// exige un mínimo de preguntas distintas, que el nivel 10 pregunte otra cosa que
// el nivel 1 y que subir de banda cambie lo que se pregunta.
//
// La clave cuenta la PREGUNTA (enunciado + respuesta + lo que se dibuja o suena),
// sin las opciones: barajar distractores distintos sobre la misma pregunta no es
// variedad real (así Alteraciones parecía tener 140+ en nivel 1 y eran 28).
// Para ver la tabla (con y sin opciones):
//   AUDITAR_VARIEDAD=1 npx vitest run src/lib/practica/variedadVitaliaMelodia
import { describe, expect, it } from "vitest";
import { ADAPTADORES, type PreguntaMundo } from "@/lib/mundosJugables";
import { encabezadoTabla, filaTabla, medirVariedad } from "./variedad";

const N = 200;

function clavePregunta(p: PreguntaMundo): string {
  const e = p.entrada;
  const respuesta = e.tipo === "numero" ? String(e.respuesta) : e.respuesta;
  return `${p.enunciado}#${respuesta}#${JSON.stringify(p.visuales ?? [])}`;
}
// La de variedadMundos.test.ts (con las opciones), para comparar con la primera medición.
function claveConOpciones(p: PreguntaMundo): string {
  const e = p.entrada;
  const opciones = e.tipo === "opciones" ? [...e.opciones].sort().join("|") : "";
  return `${clavePregunta(p)}#${opciones}`;
}

type Clave = (p: PreguntaMundo) => string;

function modos(slugs: ("vitalia" | "melodia")[], clave: Clave): { nombre: string; generar: (nivel: number) => string }[] {
  return slugs.flatMap((slug) => {
    const def = ADAPTADORES[slug]!;
    return def.modos.map((modo) => ({
      nombre: `${slug} · ${modo.id}`,
      generar: (nivel: number) => clave(def.generar(modo.id, nivel, new Set(), null, undefined, undefined, Object.fromEntries(def.modos.map((m) => [m.id, nivel])))),
    }));
  });
}

const MINIMO_DISTINTAS = 30;
const MAXIMO_SOLAPAMIENTO = 0.5;
const MAXIMA_MESETA = 0.5;
// Pisos propios, documentados en docs/AUDITORIA_PREGUNTAS.md.
const MINIMO_PROPIO: Record<string, number> = {};

describe("variedad de Vitalia y Melodía por modo y nivel", () => {
  const resultados = modos(["vitalia", "melodia"], clavePregunta).map((m) => ({ ...m, v: medirVariedad(m.generar, N) }));

  if (process.env.AUDITAR_VARIEDAD) {
    it("tabla", { timeout: 120_000 }, () => {
      const conOpciones = modos(["vitalia", "melodia"], claveConOpciones).map((m) => filaTabla(m.nombre, medirVariedad(m.generar, N)));
      console.log(`\nSin opciones (la que vigila este test):\n${encabezadoTabla()}\n${resultados.map((r) => filaTabla(r.nombre, r.v)).join("\n")}\n\nCon opciones (como variedadMundos):\n${encabezadoTabla()}\n${conOpciones.join("\n")}\n`);
    });
  }

  for (const r of resultados) {
    const minimo = MINIMO_PROPIO[r.nombre] ?? MINIMO_DISTINTAS;
    it(`${r.nombre}: al menos ${minimo} preguntas distintas en cada nivel`, () => {
      const pobres = r.v.porNivel.filter((p) => p.distintas < minimo).map((p) => `N${p.nivel}=${p.distintas}`);
      expect(pobres, pobres.join(", ")).toEqual([]);
    });
    it(`${r.nombre}: el nivel 10 no pregunta lo mismo que el nivel 1`, () => {
      expect(r.v.solapamiento1a10).toBeLessThanOrEqual(MAXIMO_SOLAPAMIENTO);
    });
    it(`${r.nombre}: subir de banda cambia lo que se pregunta (sin mesetas)`, () => {
      expect(r.v.meseta, `N${r.v.mesetaEntre[0]}→N${r.v.mesetaEntre[1]}`).toBeLessThan(MAXIMA_MESETA);
    });
  }
});
