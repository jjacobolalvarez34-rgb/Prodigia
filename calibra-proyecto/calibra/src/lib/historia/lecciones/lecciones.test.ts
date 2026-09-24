import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { TECNICAS_HISTORIA, CLASES_HISTORIA } from "./index";
import { CABECERA_HISTORIA, generarSqlHistoria } from "./sql";
import { CONCEPTOS_HISTORIA, CONCEPTO_POR_ID, CONOCIMIENTO_PREVIO, IDS_CONCEPTOS, IDS_PREVIOS } from "./conceptos";
import { BLOQUES_HISTORIA, ORDEN_GRUPOS_HISTORIA, type GrupoHistoria } from "@/lib/historia/bloques";
import { EPOCAS } from "@/lib/historia/epocas";
import { HECHOS, PERSONAJES, HECHO_POR_ID, PERSONAJE_POR_ID } from "@/lib/historia/tabla";
import { ESCALA_HISTORIA } from "@/lib/practica/historiaEscala";
import { idsDeVisual, TIPOS_VISUAL_HISTORIA, type VisualHistoria } from "@/lib/historia/visuales";
import { datosCausas, datosEpocas, datosLinea, datosPersonajes, datosSiglos, datosSincronia } from "@/lib/historia/visualesDatos";
import { REGISTRO_VISUALES_HISTORIA } from "@/components/historia/visuales/registro";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import type { LeccionHistoria } from "./tipos";

// Verificación del contenido de Aprender de Historia (rediseño): estructura, quiz,
// visuales con datos válidos, español neutro, años del texto contra la tabla
// canónica, grafo de dependencias dentro de cada época, cobertura de la práctica
// (todo hecho y todo personaje se enseña en una Clase y una Técnica de su época) y la
// migración generada byte a byte.
// Regenerar la migración: HISTORIA_ESCRIBIR_SQL=1 npx vitest run src/lib/historia/lecciones

const raiz = path.resolve(__dirname, "../../../..");
const NUMERO_MIGRACION = "0215";
const rutaMigracion = path.join(raiz, "supabase", "migrations", `${NUMERO_MIGRACION}_historia_tecnicas_clases.sql`);

const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_HISTORIA)]);
const LECCIONES: LeccionHistoria[] = [...TECNICAS_HISTORIA, ...CLASES_HISTORIA];

const ES_CLASE = (l: LeccionHistoria) => l.requierePro;

// Todos los textos visibles de una lección (para voseo, años y caracteres raros).
function textos(l: LeccionHistoria, conOpciones = true): string[] {
  const t: string[] = [l.nombre, l.descripcion, ...l.pasos];
  for (const q of l.quiz) {
    t.push(q.pregunta, q.explicacion);
    if (conOpciones) t.push(...q.opciones, q.respuesta);
  }
  for (const v of l.visuales) {
    if (v.titulo) t.push(v.titulo);
    if (v.tipo === "cuadros") for (const c of v.cuadros) t.push(...[c.texto, c.resaltar].filter((x): x is string => typeof x === "string"));
  }
  return t;
}

const visualesHistoria = (l: LeccionHistoria): VisualHistoria[] => l.visuales.filter((v): v is VisualHistoria => v.tipo.startsWith("historia."));

describe("Historia: Técnicas (estructura)", () => {
  it("son 25: 4 Prehistoria, 5 Antigüedad, 5 Edad Media, 5 Edad Moderna y 6 Edad Contemporánea; slugs únicos con prefijo", () => {
    expect(TECNICAS_HISTORIA).toHaveLength(25);
    const porGrupo: Record<string, number> = {};
    for (const t of TECNICAS_HISTORIA) porGrupo[t.grupo] = (porGrupo[t.grupo] ?? 0) + 1;
    expect(porGrupo).toEqual({ prehistoria: 4, antiguedad: 5, "edad-media": 5, "edad-moderna": 5, contemporanea: 6 });
    expect(new Set(TECNICAS_HISTORIA.map((t) => t.slug)).size).toBe(25);
    for (const t of TECNICAS_HISTORIA) expect(t.slug, t.slug).toMatch(/^historia-[a-z0-9-]+$/);
    expect(TECNICAS_HISTORIA.every((t) => t.requierePro === false)).toBe(true);
  });

  it("las 5 Técnicas históricas (0109) se reescriben por slug, en la época que les corresponde, y las demás son nuevas", () => {
    const viejas = TECNICAS_HISTORIA.filter((t) => t.existente).map((t) => t.slug).sort();
    expect(viejas).toEqual([
      "historia-anclaje-cronologico",
      "historia-asociacion-memorable",
      "historia-bloques-por-siglo",
      "historia-linea-de-tiempo-mental",
      "historia-siglas-para-secuencias",
    ]);
    const g = (s: string) => TECNICAS_HISTORIA.find((t) => t.slug === s)!.grupo;
    expect(g("historia-anclaje-cronologico")).toBe("prehistoria");
    expect(g("historia-linea-de-tiempo-mental")).toBe("prehistoria");
    expect(g("historia-bloques-por-siglo")).toBe("antiguedad");
    expect(g("historia-asociacion-memorable")).toBe("edad-media");
    expect(g("historia-siglas-para-secuencias")).toBe("edad-media");
    for (const t of TECNICAS_HISTORIA.filter((x) => !x.existente)) expect(t.slug, t.slug).toMatch(/^historia-tecnica-[a-z0-9-]+$/);
  });

  it("el orden es correlativo 1..n dentro de cada época y el arreglo está en orden de época", () => {
    for (const g of ORDEN_GRUPOS_HISTORIA) {
      const ordenes = TECNICAS_HISTORIA.filter((t) => t.grupo === g).map((t) => t.orden);
      expect(ordenes, g).toEqual(ordenes.map((_, i) => i + 1));
    }
    for (let i = 1; i < TECNICAS_HISTORIA.length; i++) {
      expect(ORDEN_GRUPOS_HISTORIA.indexOf(TECNICAS_HISTORIA[i].grupo), TECNICAS_HISTORIA[i].slug).toBeGreaterThanOrEqual(ORDEN_GRUPOS_HISTORIA.indexOf(TECNICAS_HISTORIA[i - 1].grupo));
    }
  });

  it("3 a 5 pasos y un quiz de exactamente 4 preguntas por Técnica", () => {
    for (const t of TECNICAS_HISTORIA) {
      expect(t.pasos.length, t.slug).toBeGreaterThanOrEqual(3);
      expect(t.pasos.length, t.slug).toBeLessThanOrEqual(5);
      expect(t.quiz.length, t.slug).toBe(4);
    }
  });

  it("una Técnica que repasa un concepto abre con un paso «Recuerda:»", () => {
    for (const t of TECNICAS_HISTORIA) if ((t.conceptos.repasa ?? []).length > 0) expect(t.pasos[0], t.slug).toMatch(/^Recuerda:/);
  });
});

describe("Historia: Clases (estructura)", () => {
  it("son 31: 2 Prehistoria, 8 Antigüedad, 7 Edad Media, 6 Edad Moderna y 8 Edad Contemporánea; todas Pro, slugs únicos y numerados en orden", () => {
    expect(CLASES_HISTORIA).toHaveLength(31);
    expect(CLASES_HISTORIA.every((c) => c.requierePro === true)).toBe(true);
    expect(new Set(CLASES_HISTORIA.map((c) => c.slug)).size).toBe(31);
    const porGrupo: Record<string, number> = {};
    for (const c of CLASES_HISTORIA) porGrupo[c.grupo] = (porGrupo[c.grupo] ?? 0) + 1;
    expect(porGrupo).toEqual({ prehistoria: 2, antiguedad: 8, "edad-media": 7, "edad-moderna": 6, contemporanea: 8 });
    CLASES_HISTORIA.forEach((c, i) => {
      expect(c.slug, c.slug).toMatch(/^historia-clase-\d\d-[a-z0-9-]+$/);
      expect(Number(c.slug.match(/^historia-clase-(\d\d)/)![1]), c.slug).toBe(i + 1);
    });
  });

  it("el arreglo está en el orden cronológico recomendado (época y luego orden) y el orden es 1..n en cada época", () => {
    for (let i = 1; i < CLASES_HISTORIA.length; i++) {
      const a = CLASES_HISTORIA[i - 1];
      const b = CLASES_HISTORIA[i];
      const ga = ORDEN_GRUPOS_HISTORIA.indexOf(a.grupo);
      const gb = ORDEN_GRUPOS_HISTORIA.indexOf(b.grupo);
      expect(ga < gb || (ga === gb && a.orden < b.orden), `${a.slug} -> ${b.slug}`).toBe(true);
    }
    for (const g of ORDEN_GRUPOS_HISTORIA) {
      const ordenes = CLASES_HISTORIA.filter((c) => c.grupo === g).map((c) => c.orden);
      expect(ordenes, g).toEqual(ordenes.map((_, i) => i + 1));
    }
  });

  it("explicación desarrollada (8 o más pasos) y quiz de 4 a 6 preguntas", () => {
    for (const c of CLASES_HISTORIA) {
      expect(c.pasos.length, c.slug).toBeGreaterThanOrEqual(8);
      expect(c.quiz.length, c.slug).toBeGreaterThanOrEqual(4);
      expect(c.quiz.length, c.slug).toBeLessThanOrEqual(6);
    }
  });

  it("cada Clase declara objetivo, contexto, personajes clave, causas y consecuencias, conexiones y errores comunes, en ese orden", () => {
    const ETIQUETAS = [/^Objetivo:/, /^Contexto:/, /^Personajes clave:/, /^Causas y consecuencias:/, /^Conecta con:/, /^Errores comunes/];
    for (const c of CLASES_HISTORIA) {
      const posiciones = ETIQUETAS.map((re) => c.pasos.findIndex((p) => re.test(p)));
      for (let i = 0; i < ETIQUETAS.length; i++) expect(posiciones[i], `${c.slug}: falta ${ETIQUETAS[i]}`).toBeGreaterThanOrEqual(0);
      expect(posiciones[0], c.slug).toBe(0);
      expect(posiciones[1], c.slug).toBe(1);
      expect(posiciones, c.slug).toEqual([...posiciones].sort((a, b) => a - b));
    }
  });

  it("toda Clase Pro tiene quiz: /api/aprender/completar solo exige plan Pro a las lecciones con quiz", () => {
    for (const c of CLASES_HISTORIA) expect(c.quiz.length, c.slug).toBeGreaterThan(0);
  });

  it("el bloque de cada época coincide con las épocas de la periodización (5 bloques, los cuatro modos de práctica)", () => {
    expect(BLOQUES_HISTORIA.map((b) => b.id)).toEqual(EPOCAS.map((e) => e.id));
    for (const b of BLOQUES_HISTORIA) {
      expect(b.modosPractica.slice().sort(), b.id).toEqual(["causaefecto", "cronologia", "fechas", "personajes"]);
      expect(TECNICAS_HISTORIA.filter((t) => t.grupo === b.id).length, b.id).toBeGreaterThanOrEqual(4);
      expect(CLASES_HISTORIA.filter((c) => c.grupo === b.id).length, b.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("Historia: quiz de todas las lecciones", () => {
  it("la respuesta está entre las opciones, sin opciones repetidas, 3 o 4 opciones, con explicación", () => {
    for (const l of LECCIONES) {
      const preguntas = new Set<string>();
      for (const q of l.quiz) {
        const donde = `${l.slug}: ${q.pregunta}`;
        expect(q.opciones, donde).toContain(q.respuesta);
        expect(new Set(q.opciones).size, donde).toBe(q.opciones.length);
        expect(q.opciones.length, donde).toBeGreaterThanOrEqual(3);
        expect(q.opciones.length, donde).toBeLessThanOrEqual(4);
        expect(q.explicacion.length, donde).toBeGreaterThan(15);
        expect(q.pregunta.length, donde).toBeGreaterThan(8);
        expect(preguntas.has(q.pregunta), `${donde}: pregunta repetida en la lección`).toBe(false);
        preguntas.add(q.pregunta);
      }
    }
  });

  it("ninguna opción equivale a otra (mismo texto sin espacios ni mayúsculas) y ningún distractor repite la respuesta", () => {
    for (const l of LECCIONES) {
      for (const q of l.quiz) {
        const claves = q.opciones.map((o) => o.replace(/\s+/g, "").toLowerCase());
        expect(new Set(claves).size, `${l.slug}: ${q.pregunta}`).toBe(claves.length);
      }
    }
  });

  it("la respuesta correcta no está siempre en la misma posición (no se puede adivinar por patrón)", () => {
    const posiciones = new Map<number, number>();
    for (const l of LECCIONES) for (const q of l.quiz) posiciones.set(q.opciones.indexOf(q.respuesta), (posiciones.get(q.opciones.indexOf(q.respuesta)) ?? 0) + 1);
    const total = [...posiciones.values()].reduce((a, b) => a + b, 0);
    for (const [pos, n] of posiciones) expect(n / total, `posición ${pos}`).toBeLessThan(0.45);
    expect(posiciones.size).toBeGreaterThanOrEqual(3);
  });

  it("la pregunta no contiene la respuesta (salvo que sea una comparación entre las opciones)", () => {
    for (const l of LECCIONES) {
      for (const q of l.quiz) {
        if (q.respuesta.length < 12) continue;
        // Las preguntas «¿Cuál ocurrió primero: A o B?» nombran las opciones a propósito.
        if (/primero:|entre |o «/.test(q.pregunta)) continue;
        expect(q.pregunta.includes(q.respuesta), `${l.slug}: ${q.pregunta}`).toBe(false);
      }
    }
  });
});

describe("Historia: español neutro, caracteres raros y neutralidad", () => {
  it("sin voseo (español neutro) en ninguna lección", () => {
    for (const l of LECCIONES) for (const t of textos(l)) expect(detectarVoseo(t), `${l.slug}: «${t.slice(0, 80)}»`).toEqual([]);
  });

  it("sin placeholders rotos, dobles espacios, comillas rectas ni signos $ (no hay fórmulas)", () => {
    for (const l of LECCIONES) {
      for (const t of textos(l)) {
        expect(t, `${l.slug}: «${t.slice(0, 60)}»`).not.toMatch(/undefined|NaN|\[object|\{\{|\}\}|Infinity|\$/);
        expect(t, `${l.slug}: comilla recta en «${t.slice(0, 60)}»`).not.toMatch(/"/);
        expect(t, `${l.slug}: «hacia hacia» en «${t.slice(0, 60)}»`).not.toMatch(/hacia hacia/i);
        expect(t, `${l.slug}: «a. C..» en «${t.slice(0, 60)}»`).not.toMatch(/[ad]\. C\.\.(?!\.)/);
      }
      for (const p of l.pasos) expect(p, `${l.slug}: doble espacio`).not.toMatch(/ {2}/);
    }
  });

  it("sin juicios morales ni carga política en el texto (siglo XX incluido)", () => {
    const prohibido = /genocid|v[ií]ctimas|muertos|masacre|criminal|tirano|culpa|cruel|brutal|heroic|villan|injust|terroris|agresi[oó]n|imperialista|\bmillones de (muertos|v)/i;
    for (const l of LECCIONES) for (const t of textos(l, false)) expect(t, `${l.slug}: «${t.slice(0, 80)}»`).not.toMatch(prohibido);
  });

  it("los años escritos en el texto salen de la tabla canónica (o son años redondos o cierres de siglo de un ejemplo)", () => {
    const permitidos = new Set<number>();
    for (const h of HECHOS) permitidos.add(Math.abs(h.anio));
    for (const p of PERSONAJES) {
      for (const a of [p.nac, p.mue, p.auge]) if (a !== null) permitidos.add(Math.abs(a));
      for (const m of p.logro.matchAll(/\b(\d{3,4})\b/g)) permitidos.add(Number(m[1]));
    }
    for (const e of EPOCAS) permitidos.add(Math.abs(e.desde));
    for (let k = 1; k <= 40; k++) {
      permitidos.add(k * 100);
      permitidos.add(k * 100 + 1);
    }
    const RE = /\d{1,3}(?: \d{3})+|\b\d{3,4}\b/g;
    for (const l of LECCIONES) {
      for (const t of textos(l, false)) {
        // Se ignoran duraciones («297 años») y magnitudes que no son años.
        const limpio = t.replace(/\d[\d ]* años/g, "").replace(/\d+ (?:tesis|días|siglos|centenas|milenios)/g, "");
        for (const m of limpio.matchAll(RE)) {
          const n = Number(m[0].replace(/ /g, ""));
          expect(permitidos.has(n), `${l.slug}: el año ${m[0]} no figura en la tabla canónica («${t.slice(0, 90)}»)`).toBe(true);
        }
      }
    }
  });

  it("las Clases y Técnicas de la época contemporánea solo enseñan hechos que la tabla marca con certeza exacta o convencional (nunca aproximados) en año concreto", () => {
    // Un hecho aproximado se escribe siempre con «hacia»: A() lo hace y el test lo comprueba en el texto.
    const aprox = HECHOS.filter((h) => h.certeza === "aproximada" && h.anio > 0 && h.anio < 1900);
    expect(aprox.length).toBeGreaterThan(0);
    for (const h of aprox) {
      const anio = String(h.anio);
      for (const l of LECCIONES) {
        for (const p of l.pasos) {
          if (!p.includes(h.nombre)) continue;
          const i = p.indexOf(h.nombre);
          const cerca = p.slice(i, i + h.nombre.length + 30);
          if (cerca.includes(`(${anio}`) || cerca.includes(` ${anio})`)) expect(cerca, `${l.slug}: ${h.id} sin «hacia»`).toMatch(/hacia/);
        }
      }
    }
  });
});

describe("Historia: visuales", () => {
  it("todos los visuales son de un tipo conocido y tienen forma válida (despuesDePaso dentro de los pasos)", () => {
    for (const l of LECCIONES) {
      expect(l.visuales.length, l.slug).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales) {
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${l.slug}: tipo ${v.tipo}`).toBe(true);
        if (v.despuesDePaso !== undefined) {
          expect(Number.isInteger(v.despuesDePaso) && v.despuesDePaso >= 0, `${l.slug}: despuesDePaso`).toBe(true);
          expect(v.despuesDePaso, `${l.slug}: despuesDePaso fuera de los pasos`).toBeLessThan(l.pasos.length);
        }
      }
    }
  });

  it("cada visual propio tiene datos válidos: sus funciones de datos no lanzan y devuelven algo dibujable", () => {
    let total = 0;
    for (const l of LECCIONES) {
      for (const v of visualesHistoria(l)) {
        const donde = `${l.slug}: ${v.tipo}`;
        switch (v.tipo) {
          case "historia.linea":
            expect(datosLinea(v).filas.length, donde).toBeGreaterThanOrEqual(2);
            break;
          case "historia.epocas":
            expect(datosEpocas(v), donde).toHaveLength(5);
            break;
          case "historia.causas":
            expect(datosCausas(v).length, donde).toBeGreaterThanOrEqual(2);
            break;
          case "historia.siglos":
            expect(datosSiglos(v).length, donde).toBeGreaterThanOrEqual(1);
            break;
          case "historia.sincronia":
            expect(datosSincronia(v).carriles.length, donde).toBeGreaterThanOrEqual(2);
            break;
          case "historia.personaje":
            expect(datosPersonajes(v).length, donde).toBeGreaterThanOrEqual(1);
            break;
        }
        total++;
      }
    }
    expect(total).toBeGreaterThan(100);
  });

  it("los cuadros animados tienen al menos un cuadro con texto o fórmula", () => {
    for (const l of LECCIONES) for (const v of l.visuales) if (v.tipo === "cuadros") for (const c of v.cuadros) expect(Boolean(c.texto) || Boolean(c.formula), l.slug).toBe(true);
  });

  it("todos los tipos de visual propios se usan en alguna lección", () => {
    const usados = new Set<string>();
    for (const l of LECCIONES) for (const v of l.visuales) usados.add(v.tipo);
    for (const tipo of TIPOS_VISUAL_HISTORIA) expect(usados.has(tipo), tipo).toBe(true);
    expect(Object.keys(REGISTRO_VISUALES_HISTORIA).sort()).toEqual([...TIPOS_VISUAL_HISTORIA].sort());
  });

  it("los visuales se arman con los ids que la lección declara enseñar: todo id declarado se ve en un visual y ningún visual muestra un id no declarado", () => {
    for (const l of LECCIONES) {
      const hechos = new Set<string>();
      const personajes = new Set<string>();
      for (const v of visualesHistoria(l)) {
        const ids = idsDeVisual(v);
        ids.hechos.forEach((h) => hechos.add(h));
        ids.personajes.forEach((p) => personajes.add(p));
      }
      for (const h of hechos) expect(l.ensena.hechos, `${l.slug}: muestra el hecho ${h} sin declararlo en ensena`).toContain(h);
      for (const p of personajes) expect(l.ensena.personajes, `${l.slug}: muestra al personaje ${p} sin declararlo en ensena`).toContain(p);
      for (const h of l.ensena.hechos) expect(hechos.has(h), `${l.slug}: declara ${h} pero ningún visual lo muestra`).toBe(true);
      for (const p of l.ensena.personajes) expect(personajes.has(p), `${l.slug}: declara ${p} pero ninguna ficha lo muestra`).toBe(true);
      expect(new Set(l.ensena.hechos).size, l.slug).toBe(l.ensena.hechos.length);
      expect(new Set(l.ensena.personajes).size, l.slug).toBe(l.ensena.personajes.length);
      for (const h of l.ensena.hechos) expect(HECHO_POR_ID.has(h), `${l.slug}: hecho ${h}`).toBe(true);
      for (const p of l.ensena.personajes) expect(PERSONAJE_POR_ID.has(p), `${l.slug}: personaje ${p}`).toBe(true);
    }
  });
});

// ---------- grafo de dependencias ----------
describe("Historia: grafo de dependencias entre lecciones (dentro de cada época)", () => {
  it("todos los conceptos declarados existen en el vocabulario (o son conocimiento previo del colegio)", () => {
    for (const l of LECCIONES) {
      for (const c of l.conceptos.introduce) expect(IDS_CONCEPTOS.has(c), `${l.slug} introduce «${c}», que no existe`).toBe(true);
      for (const c of l.conceptos.usa) expect(IDS_CONCEPTOS.has(c) || IDS_PREVIOS.has(c), `${l.slug} usa «${c}», que no existe`).toBe(true);
      for (const c of l.conceptos.repasa ?? []) expect(IDS_CONCEPTOS.has(c), `${l.slug} repasa «${c}», que no existe`).toBe(true);
      expect(l.conceptos.introduce.length + (l.conceptos.repasa ?? []).length, `${l.slug}: no introduce ni repasa nada`).toBeGreaterThan(0);
    }
    expect(new Set(CONCEPTOS_HISTORIA.map((c) => c.id)).size).toBe(CONCEPTOS_HISTORIA.length);
    for (const c of CONOCIMIENTO_PREVIO) expect(IDS_CONCEPTOS.has(c.id), `«${c.id}» no puede ser previo y enseñado a la vez`).toBe(false);
  });

  for (const [nombre, lista] of [
    ["Técnicas", TECNICAS_HISTORIA],
    ["Clases", CLASES_HISTORIA],
  ] as const) {
    it(`${nombre}: en el orden de cada época, ninguna lección USA un concepto que no se introdujo antes en la misma época ni ella misma introduce o repasa`, () => {
      for (const grupo of ORDEN_GRUPOS_HISTORIA) {
        const disponibles = new Set<string>();
        for (const l of lista.filter((x) => x.grupo === grupo).sort((a, b) => a.orden - b.orden)) {
          const propios = new Set([...l.conceptos.introduce, ...(l.conceptos.repasa ?? [])]);
          for (const u of l.conceptos.usa) {
            expect(IDS_PREVIOS.has(u) || disponibles.has(u) || propios.has(u), `${l.slug} usa «${u}» sin haberlo introducido antes en «${grupo}» ni repasarlo`).toBe(true);
          }
          for (const r of l.conceptos.repasa ?? []) expect(l.conceptos.usa, `${l.slug}: repasa «${r}» pero no lo usa`).toContain(r);
          propios.forEach((c) => disponibles.add(c));
        }
      }
    });

    it(`${nombre}: una época no introduce dos veces el mismo concepto`, () => {
      for (const grupo of ORDEN_GRUPOS_HISTORIA) {
        const vistos = new Map<string, string>();
        for (const l of lista.filter((x) => x.grupo === grupo)) {
          for (const c of l.conceptos.introduce) {
            expect(vistos.has(c), `${l.slug} vuelve a introducir «${c}» (ya lo hizo ${vistos.get(c)})`).toBe(false);
            vistos.set(c, l.slug);
          }
        }
      }
    });
  }

  it("una lección que repasa un concepto lo re-explica en su paso «Contexto:» (Clases) o «Recuerda:» (Técnicas)", () => {
    for (const l of LECCIONES) {
      const paso = l.pasos.find((p) => (ES_CLASE(l) ? /^Contexto:/ : /^Recuerda:/).test(p));
      if (ES_CLASE(l)) expect(paso, `${l.slug}: sin paso «Contexto:»`).toBeDefined();
      for (const r of l.conceptos.repasa ?? []) {
        expect(paso, `${l.slug}: repasa «${r}» pero no tiene el paso de repaso`).toBeDefined();
        expect(paso!, `${l.slug}: el paso de repaso no menciona «${r}»`).toMatch(CONCEPTO_POR_ID.get(r)!.pista);
      }
    }
  });

  it("cada concepto del vocabulario lo introduce al menos una lección", () => {
    const introducidos = new Set(LECCIONES.flatMap((l) => l.conceptos.introduce));
    for (const c of CONCEPTOS_HISTORIA) expect(introducidos.has(c.id), `«${c.id}» no lo introduce ninguna lección`).toBe(true);
  });

  it("CLASES: una Clase no ensena un hecho cuya causa no se enseñó antes en su época (o en ella misma)", () => {
    for (const grupo of ORDEN_GRUPOS_HISTORIA) {
      const vistos = new Set<string>();
      for (const c of CLASES_HISTORIA.filter((x) => x.grupo === grupo).sort((a, b) => a.orden - b.orden)) {
        const propios = new Set(c.ensena.hechos);
        for (const id of c.ensena.hechos) {
          for (const causa of HECHO_POR_ID.get(id)!.causas) {
            expect(propios.has(causa) || vistos.has(causa), `${c.slug}: enseña «${id}» sin que se haya enseñado su causa «${causa}» antes en la época «${grupo}»`).toBe(true);
          }
        }
        c.ensena.hechos.forEach((h) => vistos.add(h));
      }
    }
  });

  it("CLASES: la primera de cada época está declarada como puerta de entrada (no supone nada de otra época sin repasarlo)", () => {
    for (const grupo of ORDEN_GRUPOS_HISTORIA.slice(1)) {
      const primera = CLASES_HISTORIA.find((c) => c.grupo === grupo)!;
      // Todo concepto que usa una primera Clase de época sale de su propio repaso o de sí misma.
      const propios = new Set([...primera.conceptos.introduce, ...(primera.conceptos.repasa ?? [])]);
      for (const u of primera.conceptos.usa) expect(propios.has(u) || IDS_PREVIOS.has(u), `${primera.slug}: usa «${u}» sin repasarlo`).toBe(true);
    }
  });
});

// ---------- cobertura de la práctica ----------
describe("Historia: todo lo que la práctica puede preguntar se enseña en una Clase y una Técnica de su época", () => {
  it("todo hecho de la tabla aparece en al menos una Clase y una Técnica de SU época", () => {
    for (const h of HECHOS) {
      const enClase = CLASES_HISTORIA.some((c) => c.grupo === h.epoca && c.ensena.hechos.includes(h.id));
      const enTecnica = TECNICAS_HISTORIA.some((t) => t.grupo === h.epoca && t.ensena.hechos.includes(h.id));
      expect(enClase, `«${h.id}» (${h.epoca}) no aparece en ninguna Clase de su época`).toBe(true);
      expect(enTecnica, `«${h.id}» (${h.epoca}) no aparece en ninguna Técnica de su época`).toBe(true);
    }
  });

  it("todo personaje de la tabla aparece en al menos una Clase y una Técnica de SU época", () => {
    for (const p of PERSONAJES) {
      const enClase = CLASES_HISTORIA.some((c) => c.grupo === p.epoca && c.ensena.personajes.includes(p.id));
      const enTecnica = TECNICAS_HISTORIA.some((t) => t.grupo === p.epoca && t.ensena.personajes.includes(p.id));
      expect(enClase, `«${p.id}» (${p.epoca}) no aparece en ninguna Clase de su época`).toBe(true);
      expect(enTecnica, `«${p.id}» (${p.epoca}) no aparece en ninguna Técnica de su época`).toBe(true);
    }
  });

  it("cada concepto de cada tipo de pregunta de la escala lo INTRODUCE al menos una Clase y una Técnica", () => {
    const porClases = new Set(CLASES_HISTORIA.flatMap((c) => c.conceptos.introduce));
    const porTecnicas = new Set(TECNICAS_HISTORIA.flatMap((t) => t.conceptos.introduce));
    for (const modo of Object.keys(ESCALA_HISTORIA) as (keyof typeof ESCALA_HISTORIA)[]) {
      for (const tipo of ESCALA_HISTORIA[modo]) {
        for (const concepto of tipo.conceptos) {
          expect(IDS_CONCEPTOS.has(concepto), `${modo}/${tipo.tipo}: concepto «${concepto}» inexistente`).toBe(true);
          expect(porClases.has(concepto), `${modo}/${tipo.tipo}: ninguna Clase introduce «${concepto}»`).toBe(true);
          expect(porTecnicas.has(concepto), `${modo}/${tipo.tipo}: ninguna Técnica introduce «${concepto}»`).toBe(true);
        }
      }
    }
  });

  it("los hechos de las 4 fronteras de época se enseñan en las lecciones sobre las épocas", () => {
    const anclas = HECHOS.filter((h) => h.frontera).map((h) => h.id);
    const t = TECNICAS_HISTORIA.find((x) => x.slug === "historia-anclaje-cronologico")!;
    for (const id of anclas) expect(t.ensena.hechos, id).toContain(id);
  });
});

// ---------- migración ----------
describe(`Migración ${NUMERO_MIGRACION}: generada desde el contenido tipado`, () => {
  const esperado = generarSqlHistoria({ cabecera: CABECERA_HISTORIA, tecnicas: TECNICAS_HISTORIA, clases: CLASES_HISTORIA });

  it("es exactamente lo que se genera de src/lib/historia/lecciones/", () => {
    if (process.env.HISTORIA_ESCRIBIR_SQL === "1") fs.writeFileSync(rutaMigracion, esperado, "utf8");
    expect(fs.existsSync(rutaMigracion), `falta ${NUMERO_MIGRACION}: HISTORIA_ESCRIBIR_SQL=1 npx vitest run src/lib/historia/lecciones`).toBe(true);
    expect(fs.readFileSync(rutaMigracion, "utf8").replace(/\r\n/g, "\n")).toBe(esperado);
  });

  it("estructura: 5 UPDATE (las Técnicas viejas) y 2 INSERT (Técnicas nuevas y Clases), UPDATE primero; sin ALTER ni skill_levels", () => {
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    expect((sql.match(/^update public\.techniques/gm) ?? []).length).toBe(5);
    expect((sql.match(/insert into public\.techniques/g) ?? []).length).toBe(2);
    expect(sql.lastIndexOf("update public.techniques"), "los UPDATE van antes que los INSERT").toBeLessThan(sql.indexOf("insert into public.techniques"));
    expect(sql).not.toMatch(/^\s*(alter|drop|delete|truncate)\b/im);
    expect(sql).not.toMatch(/^\s*(update|insert into|delete from|alter table)\s+(public\.)?(skill_levels|technique_progress)/im);
    for (const t of TECNICAS_HISTORIA.filter((x) => x.existente)) {
      expect(sql, t.slug).toContain(`where slug = '${t.slug}' and problem_type = 'historia'`);
      expect(sql.split("insert into public.techniques").slice(1).join("")).not.toContain(`('${t.slug}'`);
    }
  });

  it("20 Técnicas nuevas (requiere_pro = false) y 31 Clases (requiere_pro = true) en los INSERT", () => {
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    const bloques = sql.split("insert into public.techniques");
    expect(bloques).toHaveLength(3);
    expect((bloques[1].match(/,\n {2}false\)/g) ?? []).length).toBe(20);
    expect(bloques[1]).not.toMatch(/,\n\s+true\)/);
    expect((bloques[2].match(/,\n {2}true\)/g) ?? []).length).toBe(31);
    expect(bloques[2]).not.toMatch(/,\n\s+false\)/);
  });

  it("cada slug aparece una sola vez y el contenido de cada fila es JSON válido con pasos, visuales y quiz", () => {
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    for (const l of LECCIONES) expect((sql.match(new RegExp(`'${l.slug}'`, "g")) ?? []).length, l.slug).toBe(1);
    let filas = 0;
    for (const m of sql.matchAll(/\$historia\$([\s\S]*?)\$historia\$::jsonb/g)) {
      const j = JSON.parse(m[1]);
      expect(Array.isArray(j.pasos) && j.pasos.length >= 3).toBe(true);
      expect(Array.isArray(j.quiz) && j.quiz.length >= 4).toBe(true);
      expect(Array.isArray(j.visuales) && j.visuales.length >= 1).toBe(true);
      filas++;
    }
    expect(filas).toBe(56);
  });

  it("sin voseo en el SQL generado", () => {
    expect(detectarVoseo(fs.readFileSync(rutaMigracion, "utf8"))).toEqual([]);
  });
});

void (null as unknown as GrupoHistoria);
