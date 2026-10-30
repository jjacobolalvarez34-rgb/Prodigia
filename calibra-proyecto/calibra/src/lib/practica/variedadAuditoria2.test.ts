// Mínimos de variedad de los mundos arreglados en la auditoría del 2026-10-29
// (docs/AUDITORIA_PREGUNTAS.md, docs/avance/AUDITORIA_ANATOMIA_TRIGO.md): Anatomía,
// Trigonometría, Codia (sintaxis), Calculia (derivadas), Historia (fechas) y
// Geografía (mapa). Igual que variedadNumeria.test.ts: si alguien vuelve a achicar un
// generador, falla. Para ver la tabla:
//   AUDITAR_VARIEDAD=1 npx vitest run src/lib/practica/variedadAuditoria2
import { describe, expect, it } from "vitest";
import { ADAPTADORES, type MundoSlug, type PreguntaMundo } from "@/lib/mundosJugables";
import { elegirPaisAleatorio, MIN_CANDIDATOS_MAPA, PAISES_POR_CONTINENTE, type Continente } from "./geografia";
import { encabezadoTabla, filaTabla, medirVariedad } from "./variedad";

const N = 200;

function clave(p: PreguntaMundo): string {
  const e = p.entrada;
  const opciones = e.tipo === "opciones" ? [...e.opciones].sort().join("|") : "";
  const respuesta = e.tipo === "numero" ? String(e.respuesta) : e.respuesta;
  return `${p.enunciado}#${opciones}#${respuesta}#${JSON.stringify(p.visuales ?? [])}#${JSON.stringify(p.memoria ?? null)}`;
}

interface Caso {
  nombre: string;
  generar: (nivel: number) => string;
  minimo: number;
  // Solapamiento 1↔10 y meseta máximos (por defecto 0,5 y < 0,5, como Numeria).
  maxSolapamiento?: number;
}

function modo(slug: MundoSlug, modoId: string, minimo: number, filtro?: string, extra: Partial<Caso> = {}): Caso {
  const def = ADAPTADORES[slug]!;
  return {
    nombre: `${slug} · ${modoId}${filtro ? ` (${filtro})` : ""}`,
    minimo,
    generar: (nivel) => {
      const niveles = Object.fromEntries(def.modos.map((m) => [m.id, nivel]));
      return clave(def.generar(modoId, nivel, new Set(), null, undefined, filtro, niveles));
    },
    ...extra,
  };
}

const CASOS: Caso[] = [
  ...["oseo", "muscular", "organos", "nervioso"].map((m) => modo("anatomia", m, 30)),
  ...["razones", "circulo", "identidades", "leyes"].map((m) => modo("trigonometria", m, 30)),
  // Codia sintaxis: el solapamiento 1↔10 ronda el 50 % y depende del azar de la muestra
  // (sale 0,49-0,51 entre corridas); se permite hasta 55 % para que el test no sea inestable.
  ...["python", "java", "javascript", "typescript"].map((l) => modo("codia", "sintaxis", 30, l, { maxSolapamiento: 0.55 })),
  modo("calculia", "derivadas", 30),
  modo("historia", "fechas", 30),
  // Geografía (mapa): banco fijo de países por continente (América y Europa tienen ≈ 27
  // cada uno, con su dibujo en el mapa); el piso es MIN_CANDIDATOS_MAPA (la ventana de
  // dificultad se ensancha hasta tenerlos, ver geografia.ts). Con tan pocos países, los
  // extremos comparten la mitad del banco: el solapamiento 1↔10 se permite hasta 65 %.
  ...(Object.keys(PAISES_POR_CONTINENTE) as Continente[]).map(
    (c): Caso => ({
      nombre: `geografia · ${c} (mapa)`,
      minimo: MIN_CANDIDATOS_MAPA,
      maxSolapamiento: 0.65,
      generar: (nivel) => elegirPaisAleatorio(PAISES_POR_CONTINENTE[c], nivel, new Set())?.id ?? "",
    })
  ),
];

describe("variedad de Anatomía, Trigonometría y hallazgos medios (con mínimos)", () => {
  const resultados = CASOS.map((c) => ({ ...c, v: medirVariedad(c.generar, N) }));

  if (process.env.AUDITAR_VARIEDAD) {
    it("tabla", () => {
      console.log(`\n${encabezadoTabla()}\n${resultados.map((r) => filaTabla(r.nombre, r.v)).join("\n")}\n`);
    });
  }

  for (const r of resultados) {
    it(`${r.nombre}: al menos ${r.minimo} preguntas distintas en cada nivel`, () => {
      const pobres = r.v.porNivel.filter((p) => p.distintas < r.minimo).map((p) => `N${p.nivel}=${p.distintas}`);
      expect(pobres, pobres.join(", ")).toEqual([]);
    });
    it(`${r.nombre}: el nivel 10 no pregunta lo mismo que el nivel 1`, () => {
      expect(r.v.solapamiento1a10).toBeLessThanOrEqual(r.maxSolapamiento ?? 0.5);
    });
    it(`${r.nombre}: subir de banda cambia lo que se pregunta (sin mesetas)`, () => {
      expect(r.v.meseta, `N${r.v.mesetaEntre[0]}→N${r.v.mesetaEntre[1]}`).toBeLessThan(0.5);
    });
  }
});
