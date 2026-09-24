import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { TECNICAS_MELODIA, CLASES_MELODIA, SLUGS_TECNICAS_HISTORICAS } from "./index";
import { generarSqlMelodia, ARCHIVO_MIGRACION_MELODIA } from "./sql";
import { esVisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_MELODIA } from "@/components/melodia/visuales/registro";
import {
  GRADOS_ACORDE,
  MAX_FIGURAS,
  MAX_NOTAS_FRECUENCIA,
  MAX_NOTAS_PENTAGRAMA,
  MAX_NOTAS_TECLADO,
  formatoHz,
  nombreSinOctava,
  parseNota,
  resolverAcorde,
  resolverEscala,
  resolverFrecuencia,
  resolverNotas,
  resolverPentagrama,
  resolverRitmo,
  resolverTeclado,
  textoDeCuadros,
  textoDeVisual,
} from "@/lib/melodia/visualesDatos";
import {
  FIGURAS,
  FIGURAS_POR_BANDA,
  FORMULA_ACORDE,
  FORMULA_ESCALA,
  DURACION_FIGURA,
  LETRAS,
  LETRA_A_CIFRADO,
  MODOS_MELODIA,
  NOMBRE_ACORDE,
  NOMBRE_ESCALA,
  NOMBRE_FIGURA,
  POOL_OIDO_POR_BANDA,
  RANGO_LECTURA_POR_BANDA,
  frecuenciaDeNota,
  generarPreguntaMelodia,
  indiceDiatonicoAbsoluto,
  nombreNota,
  type NotaMusical,
  type TipoAcorde,
  type TipoEscala,
} from "@/lib/practica/melodia";
import { ORDEN_GRUPOS_MELODIA } from "@/lib/melodia/grupos";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import type { VisualLeccionMelodia } from "./tipos";

// Verificación del contenido de Aprender de Melodía (18 Técnicas + 18
// Clases): estructura, visuales, cobertura de TODO lo que evalúa la práctica y
// datos musicales cruzados contra una TABLA DE REFERENCIA escrita aparte, aquí
// mismo (no sale del contenido que verifica ni de practica/melodia.ts).
// Regenerar la migración:
//   MELODIA_ESCRIBIR_SQL=1 npx vitest run src/lib/melodia/lecciones

const raiz = path.resolve(__dirname, "../../../..");
const rutaMigracion = path.join(raiz, "supabase", "migrations", ARCHIVO_MIGRACION_MELODIA);

const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_MELODIA)]);
const TODAS = [...TECNICAS_MELODIA, ...CLASES_MELODIA];
const GRUPOS = ORDEN_GRUPOS_MELODIA;

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

type Leccion = (typeof TODAS)[number];
const visualComoObjeto = (v: VisualLeccionMelodia) => v as unknown as { tipo: string } & Record<string, unknown>;

// Texto completo enseñado por una lección: pasos, quiz y el texto de todos sus
// visuales (notas, saltos, frecuencias...).
function corpus(l: Leccion): string {
  return norm(
    [
      l.nombre,
      l.descripcion,
      ...l.pasos,
      ...l.quiz.flatMap((q) => [q.pregunta, ...q.opciones, q.explicacion]),
      ...l.visuales.map((v) => textoDeVisual(visualComoObjeto(v))),
      ...l.visuales.map((v) => textoDeCuadros(visualComoObjeto(v))),
      ...l.visuales.map((v) => v.titulo ?? ""),
    ].join(" \n ")
  );
}

// Notas (texto, con octava) de los visuales de pentagrama y teclado de una lección.
function notasDeVisuales(l: Leccion): string[] {
  const salida: string[] = [];
  for (const v of l.visuales) {
    if (v.tipo === "melodia.pentagrama") {
      const r = resolverPentagrama(v);
      if (r) salida.push(...r.notas.map(nombreNota));
    }
  }
  return salida;
}

// ---------------------------------------------------------------------------
// Tabla de referencia (independiente del contenido y de practica/melodia.ts).
// Teoría musical de nivel colegio, temperamento igual, octavas científicas
// (Do4 = Do central, La4 = 440 Hz).
// ---------------------------------------------------------------------------
const REF = {
  cifrado: { Do: "C", Re: "D", Mi: "E", Fa: "F", Sol: "G", La: "A", Si: "B" } as Record<string, string>,
  // Duración en pulsos de negra.
  figuras: { redonda: 4, blanca: 2, negra: 1, corchea: 0.5 } as Record<string, number>,
  nombresFigura: { redonda: "Redonda", blanca: "Blanca", negra: "Negra", corchea: "Corchea" } as Record<string, string>,
  // Pasos en semitonos entre grados consecutivos.
  escalas: {
    mayor: [2, 2, 1, 2, 2, 2, 1],
    menor_natural: [2, 1, 2, 2, 1, 2, 2],
    pentatonica_mayor: [2, 2, 3, 2, 3],
    pentatonica_menor: [3, 2, 2, 3, 2],
  } as Record<string, number[]>,
  // Semitonos desde la fundamental.
  acordes: {
    mayor: [0, 4, 7],
    menor: [0, 3, 7],
    disminuido: [0, 3, 6],
    aumentado: [0, 4, 8],
    maj7: [0, 4, 7, 11],
    dominante7: [0, 4, 7, 10],
    menor7: [0, 3, 7, 10],
    disminuido7: [0, 3, 6, 9],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    add9: [0, 4, 7, 14],
    novena: [0, 4, 7, 10, 14],
    oncena: [0, 4, 7, 10, 14, 17],
    trecena: [0, 4, 7, 10, 14, 17, 21],
  } as Record<string, number[]>,
  // Escalas con su ortografía correcta (una letra por grado; no salen de
  // construirEscala). Clave: fundamental|tipo|bemoles.
  escalasEscritas: {
    "Do4|mayor|false": "Do Re Mi Fa Sol La Si Do",
    "Sol4|mayor|false": "Sol La Si Do Re Mi Fa♯ Sol",
    "Fa4|mayor|true": "Fa Sol La Si♭ Do Re Mi Fa",
    "La3|menor_natural|false": "La Si Do Re Mi Fa Sol La",
    "Mi4|menor_natural|false": "Mi Fa♯ Sol La Si Do Re Mi",
    "Re4|menor_natural|true": "Re Mi Fa Sol La Si♭ Do Re",
    "Do4|pentatonica_mayor|false": "Do Re Mi Sol La Do",
    "La3|pentatonica_menor|false": "La Do Re Mi Sol La",
    "Do4|pentatonica_menor|true": "Do Mi♭ Fa Sol Si♭ Do",
  } as Record<string, string>,
  // Acordes con su ortografía correcta. Clave: fundamental|tipo|bemoles.
  // dim7 escribe la 7.ª como Si con doble bemol; la Práctica usa La (suena igual).
  acordesEscritos: {
    "Do4|mayor|false": "Do Mi Sol",
    "Do4|menor|true": "Do Mi♭ Sol",
    "Do4|disminuido|true": "Do Mi♭ Sol♭",
    "Do4|aumentado|false": "Do Mi Sol♯",
    "Do4|maj7|false": "Do Mi Sol Si",
    "Do4|dominante7|true": "Do Mi Sol Si♭",
    "Do4|menor7|true": "Do Mi♭ Sol Si♭",
    "Do4|disminuido7|true": "Do Mi♭ Sol♭ La",
    "Do4|sus2|false": "Do Re Sol",
    "Do4|sus4|false": "Do Fa Sol",
    "Do4|add9|false": "Do Mi Sol Re",
    "Do4|novena|true": "Do Mi Sol Si♭ Re",
    "Do4|oncena|true": "Do Mi Sol Si♭ Re Fa",
    "Do4|trecena|true": "Do Mi Sol Si♭ Re Fa La",
  } as Record<string, string>,
  // Frecuencias en Hz (redondeadas a 2 decimales), temperamento igual, La4 = 440.
  frecuencias: {
    Do4: 261.63,
    "Do♯4": 277.18,
    Re4: 293.66,
    Mi4: 329.63,
    Fa4: 349.23,
    Sol4: 392.0,
    La3: 220,
    La4: 440,
    La5: 880,
    Si4: 493.88,
    Do5: 523.25,
  } as Record<string, number>,
  lineas: ["Mi4", "Sol4", "Si4", "Re5", "Fa5"],
  espacios: ["Fa4", "La4", "Do5", "Mi5"],
  // Posiciones en el pentagrama en clave de sol: pasos sobre la línea de abajo (Mi4 = 0).
  // Líneas: pares 0-8; espacios: impares 1-7; líneas adicionales: pares fuera de 0-8.
  razonSemitono: Math.pow(2, 1 / 12),
};

const nombresSinOctava = (notas: NotaMusical[]) => notas.map(nombreSinOctava).join(" ");
const claveEscala = (fund: string, tipo: string, bem?: boolean) => `${fund}|${tipo}|${bem === true}`;

describe("Melodía: Técnicas (estructura)", () => {
  it("son 18: fundamentos 3, lectura 3, alteraciones 3, escalas 3, acordes 4, oído 2; todas requierePro=false", () => {
    expect(TECNICAS_MELODIA).toHaveLength(18);
    expect(TECNICAS_MELODIA.every((t) => t.requierePro === false)).toBe(true);
    const por = Object.fromEntries(GRUPOS.map((g) => [g, TECNICAS_MELODIA.filter((t) => t.grupo === g).length]));
    expect(por).toEqual({ fundamentos: 3, lectura: 3, alteraciones: 3, escalas: 3, acordes: 4, oido_absoluto: 2 });
  });

  it("slugs únicos con prefijo melodia-, y las 5 históricas de 0089 siguen existiendo", () => {
    const slugs = TECNICAS_MELODIA.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s.startsWith("melodia-"), s).toBe(true);
    for (const h of SLUGS_TECNICAS_HISTORICAS) expect(slugs, h).toContain(h);
    expect(SLUGS_TECNICAS_HISTORICAS).toHaveLength(5);
  });

  it("3 a 5 pasos y de 3 a 5 preguntas de quiz por Técnica", () => {
    for (const t of TECNICAS_MELODIA) {
      expect(t.pasos.length, t.slug).toBeGreaterThanOrEqual(3);
      expect(t.pasos.length, t.slug).toBeLessThanOrEqual(5);
      expect(t.quiz.length, t.slug).toBeGreaterThanOrEqual(3);
      expect(t.quiz.length, t.slug).toBeLessThanOrEqual(5);
    }
  });
});

describe("Melodía: Clases (estructura)", () => {
  it("son 18: fundamentos 3, lectura 3, alteraciones 3, escalas 3, acordes 4, oído 2; todas requierePro=true, slug melodia-clase-*", () => {
    expect(CLASES_MELODIA).toHaveLength(18);
    expect(CLASES_MELODIA.every((c) => c.requierePro === true)).toBe(true);
    const por = Object.fromEntries(GRUPOS.map((g) => [g, CLASES_MELODIA.filter((c) => c.grupo === g).length]));
    expect(por).toEqual({ fundamentos: 3, lectura: 3, alteraciones: 3, escalas: 3, acordes: 4, oido_absoluto: 2 });
    const slugs = CLASES_MELODIA.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s.startsWith("melodia-clase-"), s).toBe(true);
  });

  it("la primera Clase de todas (la preview gratis) es el sonido y la nota", () => {
    expect(CLASES_MELODIA[0].slug).toBe("melodia-clase-sonido-y-nota");
    expect(CLASES_MELODIA[0].orden).toBe(1);
    expect(CLASES_MELODIA[0].grupo).toBe("fundamentos");
  });

  it("5 a 7 pasos desarrollados y 5 preguntas de quiz con explicación por Clase", () => {
    for (const c of CLASES_MELODIA) {
      expect(c.pasos.length, c.slug).toBeGreaterThanOrEqual(5);
      expect(c.pasos.length, c.slug).toBeLessThanOrEqual(7);
      expect(c.quiz.length, c.slug).toBe(5);
      // Cada Clase termina con un paso de errores comunes o de simplificación.
      expect(norm(c.pasos.join(" ")), c.slug).toMatch(/errores comunes|error comun|simplificacion/);
    }
  });
});

describe("Melodía: quiz de las 36 lecciones", () => {
  it("la respuesta está entre las opciones, sin opciones repetidas, con explicación real y 3 a 4 opciones", () => {
    for (const l of TODAS) {
      for (const q of l.quiz) {
        const donde = `${l.slug}: ${q.pregunta}`;
        expect(q.opciones, donde).toContain(q.respuesta);
        expect(new Set(q.opciones).size, donde).toBe(q.opciones.length);
        expect(q.opciones.length, donde).toBeGreaterThanOrEqual(3);
        expect(q.opciones.length, donde).toBeLessThanOrEqual(4);
        expect(q.explicacion.length, donde).toBeGreaterThan(10);
        expect(q.pregunta.length, donde).toBeGreaterThan(8);
      }
    }
  });

  it("ningún distractor es una respuesta también válida escrita de otra forma (mismo sonido con otro nombre, mismo número)", () => {
    // Una opción errónea no puede ser una grafía enarmónica de la correcta
    // (p. ej. La♯ frente a Si♭) ni repetir el mismo texto normalizado.
    const ENARMONICOS: Record<string, string> = { "Do♯": "Re♭", "Re♯": "Mi♭", "Fa♯": "Sol♭", "Sol♯": "La♭", "La♯": "Si♭" };
    const pares = new Set<string>();
    for (const [a, b] of Object.entries(ENARMONICOS)) {
      pares.add(`${a}|${b}`);
      pares.add(`${b}|${a}`);
    }
    for (const l of TODAS) {
      for (const q of l.quiz) {
        // Solo preguntas cuya respuesta es una nota suelta ("Fa♯", "Si♭"...).
        if (!/^[A-Za-zñ]{2,3}[♯♭]$/.test(q.respuesta)) continue;
        for (const o of q.opciones) {
          if (o === q.respuesta) continue;
          expect(pares.has(`${q.respuesta}|${o}`), `${l.slug}: «${q.pregunta}» ofrece ${o}, que suena igual que la respuesta ${q.respuesta}`).toBe(false);
        }
      }
    }
  });

  it("la respuesta correcta no está siempre en la misma posición (no se adivina por posición)", () => {
    const posiciones = new Map<number, number>();
    let total = 0;
    for (const l of TODAS) {
      for (const q of l.quiz) {
        const i = q.opciones.indexOf(q.respuesta);
        posiciones.set(i, (posiciones.get(i) ?? 0) + 1);
        total++;
      }
    }
    for (const [pos, n] of posiciones) expect(n / total, `posición ${pos}`).toBeLessThan(0.5);
    expect(posiciones.size).toBeGreaterThanOrEqual(3);
  });

  it("el gating Pro del servidor aplica: toda Clase tiene quiz, y /api/aprender/completar solo valida requiere_pro cuando hay quiz", () => {
    for (const c of CLASES_MELODIA) expect(c.quiz.length, c.slug).toBeGreaterThan(0);
    const ruta = fs.readFileSync(path.join(raiz, "src", "app", "api", "aprender", "completar", "route.ts"), "utf8");
    expect(ruta).toMatch(/if \(quiz\.length > 0\)[\s\S]*tecnica\.requiere_pro[\s\S]*plan !== "pro"[\s\S]*403/);
  });
});

describe("Melodía: español neutro y texto limpio", () => {
  it("ninguna lección tiene voseo", () => {
    for (const l of TODAS) {
      const texto = [l.nombre, l.descripcion, ...l.pasos, ...l.quiz.flatMap((q) => [q.pregunta, ...q.opciones, q.explicacion]), ...l.visuales.map((v) => v.titulo ?? "")].join("\n");
      expect(detectarVoseo(texto), l.slug).toEqual([]);
      // Formas de voseo que el detector no lista: -alo/-elo/-ilo enclíticos y "vos".
      expect(texto, l.slug).not.toMatch(/\b(agrupalos|dividilos|leelo|leé|separalos|dejalos|ubicalos|fijate|acordate|mirá|tenés|sabés|podés|querés|armá|probá|pensalo|arrancás|servís|practicá|usá|vos)\b/i);
    }
  });

  it("sin $ desparejados, placeholders rotos ni glifos musicales fuera del BMP que pueden salir como cuadrados", () => {
    for (const l of TODAS) {
      for (const p of [...l.pasos, ...l.quiz.flatMap((q) => [q.pregunta, ...q.opciones, q.explicacion])]) {
        expect((p.match(/\$/g) ?? []).length % 2, `${l.slug}: «${p}»`).toBe(0);
        expect(p, l.slug).not.toMatch(/undefined|NaN|\[object/);
        // Solo ♯ ♭ ♮ (BMP); nada de 𝄫 𝄪 (U+1D12B, U+1D12A): no están en todas las fuentes.
        expect(/[\u{1D100}-\u{1D1FF}]/u.test(p), `${l.slug}: glifo musical astral`).toBe(false);
      }
    }
  });

  it("sin promesas ni afirmaciones pseudocientíficas sobre el oído absoluto o la música", () => {
    for (const l of TODAS) {
      expect(corpus(l), l.slug).not.toMatch(/(?<!sin )\b(garantiza|garantizado|cura|curar|inteligencia|mozart|432 hz|sanar|milagro|en \d+ dias|tendras oido absoluto|conseguiras oido absoluto)/);
    }
  });
});

describe("Melodía: visuales (estructura y datos verificados)", () => {
  it("TODA Técnica y TODA Clase tiene al menos 1 visual (también las históricas reescritas), de tipo conocido y con despuesDePaso válido", () => {
    for (const l of TODAS) {
      expect(l.visuales.length, `${l.slug} sin visuales`).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales) {
        expect(esVisualLeccion(v), l.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${l.slug}: tipo ${v.tipo}`).toBe(true);
        expect(v.despuesDePaso, `${l.slug}: despuesDePaso obligatorio`).toBeDefined();
        expect(v.despuesDePaso!, l.slug).toBeLessThan(l.pasos.length);
      }
    }
  });

  it("los 6 tipos de visual propios se usan en alguna lección", () => {
    const usados = new Set<string>(TODAS.flatMap((l) => l.visuales.map((v) => v.tipo)));
    for (const tipo of Object.keys(REGISTRO_VISUALES_MELODIA)) expect(usados.has(tipo), tipo).toBe(true);
  });

  it("ningún dato de visual se descarta al resolverlo (notas, escalas, acordes, figuras y frecuencias válidas)", () => {
    for (const l of TODAS) {
      for (const v of l.visuales) {
        const donde = `${l.slug}: ${v.tipo} «${v.titulo ?? ""}»`;
        if (v.tipo === "melodia.pentagrama") {
          const r = resolverPentagrama(v);
          expect(r, donde).not.toBeNull();
          if (v.notas) {
            expect(v.notas.length, donde).toBeLessThanOrEqual(MAX_NOTAS_PENTAGRAMA);
            expect(resolverNotas(v.notas, MAX_NOTAS_PENTAGRAMA), donde).toHaveLength(v.notas.length);
          }
        } else if (v.tipo === "melodia.teclado") {
          expect(v.notas.length, donde).toBeLessThanOrEqual(MAX_NOTAS_TECLADO);
          expect(resolverTeclado(v), donde).not.toBeNull();
          expect(resolverNotas(v.notas, MAX_NOTAS_TECLADO), donde).toHaveLength(v.notas.length);
          if (v.desde) expect(parseNota(v.desde), donde).not.toBeNull();
          if (v.hasta) expect(parseNota(v.hasta), donde).not.toBeNull();
        } else if (v.tipo === "melodia.escala") {
          expect(resolverEscala(v.escala), donde).not.toBeNull();
        } else if (v.tipo === "melodia.acorde") {
          expect(resolverAcorde(v.acorde), donde).not.toBeNull();
        } else if (v.tipo === "melodia.ritmo") {
          expect(v.figuras.length, donde).toBeLessThanOrEqual(MAX_FIGURAS);
          expect(resolverRitmo(v), donde).toHaveLength(v.figuras.length);
        } else if (v.tipo === "melodia.frecuencia") {
          expect(v.notas.length, donde).toBeLessThanOrEqual(MAX_NOTAS_FRECUENCIA);
          expect(resolverFrecuencia(v), donde).toHaveLength(v.notas.length);
        }
      }
    }
  });

  it("el botón «Escuchar» es opcional y ninguna lección depende de él para entenderse (todo visual con audio trae alternativa textual)", () => {
    for (const l of TODAS) {
      for (const v of l.visuales) {
        if ("escuchar" in v && v.escuchar) expect(textoDeVisual(visualComoObjeto(v)).length, `${l.slug}: ${v.tipo}`).toBeGreaterThan(20);
      }
    }
  });
});

describe("Melodía: datos musicales contra la tabla de referencia", () => {
  it("la práctica y la referencia coinciden en fórmulas de escalas y acordes, cifrado, figuras y nombres", () => {
    for (const tipo of Object.keys(REF.escalas) as TipoEscala[]) {
      expect(FORMULA_ESCALA[tipo], tipo).toEqual(REF.escalas[tipo]);
      expect(REF.escalas[tipo].reduce((a, b) => a + b, 0), `${tipo} suma una octava`).toBe(12);
    }
    for (const tipo of Object.keys(REF.acordes) as TipoAcorde[]) expect(FORMULA_ACORDE[tipo], tipo).toEqual(REF.acordes[tipo]);
    expect(Object.keys(FORMULA_ACORDE).sort()).toEqual(Object.keys(REF.acordes).sort());
    expect(Object.keys(FORMULA_ESCALA).sort()).toEqual(Object.keys(REF.escalas).sort());
    expect(LETRA_A_CIFRADO).toEqual(REF.cifrado);
    expect(DURACION_FIGURA).toEqual(REF.figuras);
    expect(NOMBRE_FIGURA).toEqual(REF.nombresFigura);
    expect(FIGURAS).toEqual(["redonda", "blanca", "negra", "corchea"]);
  });

  it("cada escala que muestra una lección (teclado o pentagrama) está en la tabla de escalas escritas y coincide letra por letra", () => {
    let vistas = 0;
    for (const l of TODAS) {
      for (const v of l.visuales) {
        const params = v.tipo === "melodia.escala" ? v.escala : v.tipo === "melodia.pentagrama" ? v.escala : undefined;
        if (!params) continue;
        const clave = claveEscala(params.fundamental, params.tipo, params.bemoles);
        const esperado = REF.escalasEscritas[clave];
        expect(esperado, `${l.slug}: escala ${clave} no está en la tabla de referencia`).toBeDefined();
        const r = resolverEscala(params)!;
        expect(nombresSinOctava(r.notas), `${l.slug}: ${clave}`).toBe(esperado);
        vistas++;
      }
    }
    expect(vistas).toBeGreaterThan(12);
  });

  it("cada acorde que muestra una lección está en la tabla de acordes escritos y coincide nota por nota (ortografía correcta)", () => {
    let vistos = 0;
    for (const l of TODAS) {
      for (const v of l.visuales) {
        const params = v.tipo === "melodia.acorde" ? v.acorde : v.tipo === "melodia.pentagrama" ? v.acorde : undefined;
        if (!params) continue;
        const clave = claveEscala(params.fundamental, params.tipo, params.bemoles);
        const esperado = REF.acordesEscritos[clave];
        expect(esperado, `${l.slug}: acorde ${clave} no está en la tabla de referencia`).toBeDefined();
        const r = resolverAcorde(params)!;
        expect(nombresSinOctava(r.notas), `${l.slug}: ${clave}`).toBe(esperado);
        vistos++;
      }
    }
    expect(vistos).toBeGreaterThan(20);
  });

  it("ortografía: las escalas de 7 notas usan una letra por grado y los acordes, una letra por grado de acorde (1-3-5-7-9-11-13); dim7 es la única excepción documentada", () => {
    const indiceLetra = (n: NotaMusical) => LETRAS.indexOf(n.letra);
    for (const [clave, texto] of Object.entries(REF.escalasEscritas)) {
      if (clave.includes("pentatonica")) continue;
      const letras = texto.split(" ").map((x) => x.replace(/[♯♭]/g, ""));
      letras.slice(1).forEach((letra, i) => expect(LETRAS.indexOf(letra as never), `${clave}: ${letras.join(" ")}`).toBe((LETRAS.indexOf(letras[0] as never) + i + 1) % 7));
    }
    for (const [clave, tipo] of Object.entries(REF.acordesEscritos).map(([k]) => [k, k.split("|")[1] as TipoAcorde] as const)) {
      if (tipo === "disminuido7") continue;
      const [fund, , bem] = clave.split("|");
      const r = resolverAcorde({ fundamental: fund, tipo, bemoles: bem === "true" })!;
      const base = indiceLetra(r.notas[0]);
      r.notas.forEach((n, i) => expect(indiceLetra(n), `${clave}: nota ${i + 1}`).toBe((base + Number(GRADOS_ACORDE[tipo][i]) - 1) % 7));
    }
  });

  it("los semitonos de cada nota de cada acorde y escala mostrados coinciden con la fórmula de la referencia (no de practica/melodia.ts)", () => {
    const semitono = (n: NotaMusical) => n.octava * 12 + [0, 2, 4, 5, 7, 9, 11][LETRAS.indexOf(n.letra)] + (n.alteracion === "sostenido" ? 1 : n.alteracion === "bemol" ? -1 : 0);
    let vistos = 0;
    for (const l of TODAS) {
      for (const v of l.visuales) {
        const acorde = v.tipo === "melodia.acorde" ? v.acorde : v.tipo === "melodia.pentagrama" ? v.acorde : undefined;
        if (acorde) {
          const r = resolverAcorde(acorde)!;
          expect(r.notas.map((n) => semitono(n) - semitono(r.notas[0])), `${l.slug}: ${acorde.tipo}`).toEqual(REF.acordes[acorde.tipo]);
          vistos++;
        }
        const escala = v.tipo === "melodia.escala" ? v.escala : v.tipo === "melodia.pentagrama" ? v.escala : undefined;
        if (escala) {
          const r = resolverEscala(escala)!;
          const pasos = r.notas.slice(1).map((n, i) => semitono(n) - semitono(r.notas[i]));
          expect(pasos, `${l.slug}: ${escala.tipo}`).toEqual(REF.escalas[escala.tipo]);
          vistos++;
        }
      }
    }
    expect(vistos).toBeGreaterThan(30);
  });

  it("frecuencias: todas las notas de referencia coinciden con frecuenciaDeNota a 2 decimales, la octava duplica y el semitono multiplica por 2^(1/12)", () => {
    for (const [nombre, hz] of Object.entries(REF.frecuencias)) {
      const nota = parseNota(nombre)!;
      expect(Math.round(frecuenciaDeNota(nota) * 100) / 100, nombre).toBe(hz);
    }
    expect(frecuenciaDeNota(parseNota("La5")!) / frecuenciaDeNota(parseNota("La4")!)).toBeCloseTo(2, 10);
    expect(frecuenciaDeNota(parseNota("Do♯4")!) / frecuenciaDeNota(parseNota("Do4")!)).toBeCloseTo(REF.razonSemitono, 10);
    expect(REF.razonSemitono.toFixed(4)).toBe("1.0595");
    // Cada visual de frecuencia usa solo notas de la tabla, con la razón entre vecinas correcta.
    for (const l of TODAS) {
      for (const v of l.visuales) {
        if (v.tipo !== "melodia.frecuencia") continue;
        for (const n of v.notas) expect(REF.frecuencias[n], `${l.slug}: ${n}`).toBeDefined();
        resolverFrecuencia(v).forEach((f) => expect(formatoHz(f.hz, "en"), `${l.slug}: ${nombreNota(f.nota)}`).toBe(`${REF.frecuencias[nombreNota(f.nota)]} Hz`));
      }
    }
  });

  it("los Hz y la razón que escribe una lección en el texto son los de la tabla (nada tipeado a ojo)", () => {
    const valores = new Set(Object.values(REF.frecuencias).map((n) => String(n).replace(".", ",")));
    for (const l of TODAS) {
      // Solo el texto que la lección afirma (pasos y explicaciones), no las opciones erróneas del quiz.
      const t = norm([...l.pasos, ...l.quiz.map((q) => q.explicacion), ...l.visuales.map((v) => textoDeVisual(visualComoObjeto(v)))].join(" "));
      for (const m of t.matchAll(/(\d+(?:,\d+)?) hz/g)) {
        const numero = m[1];
        // Referencias de afinación históricas (415 Hz barroco) y ejemplos de la clase de frecuencia.
        if (["415", "12"].includes(numero)) continue;
        expect(valores.has(numero) || valores.has(numero + ",0"), `${l.slug}: «${numero} Hz» no está en la tabla`).toBe(true);
      }
    }
  });

  it("las lecciones escriben las escalas y acordes de la tabla tal como se calculan (texto de pasos y quiz)", () => {
    const escalas = norm(CLASES_MELODIA.filter((c) => c.grupo === "escalas").map((c) => c.pasos.join(" ") + c.quiz.map((q) => q.opciones.join(" ")).join(" ")).join(" "));
    for (const tira of ["Do-Re-Mi-Fa-Sol-La-Si-Do", "Sol-La-Si-Do-Re-Mi-Fa♯-Sol", "Fa-Sol-La-Si♭-Do-Re-Mi-Fa", "La-Si-Do-Re-Mi-Fa-Sol", "Mi-Fa♯-Sol-La-Si-Do-Re", "Re-Mi-Fa-Sol-La-Si♭-Do-Re", "Do-Re-Mi-Sol-La", "La-Do-Re-Mi-Sol"]) {
      expect(escalas, tira).toContain(norm(tira));
    }
    const acordes = norm(CLASES_MELODIA.filter((c) => c.grupo === "acordes").map((c) => c.pasos.join(" ")).join(" "));
    for (const tira of ["Do-Mi-Sol", "Do-Mi♭-Sol", "Do-Mi♭-Sol♭", "Do-Mi-Sol♯", "Do-Mi-Sol-Si", "Do-Mi-Sol-Si♭", "Do-Mi♭-Sol-Si♭", "Do-Re-Sol", "Do-Fa-Sol", "Do-Mi-Sol-Re"]) {
      expect(acordes, tira).toContain(norm(tira));
    }
  });

  it("pentagrama: las 5 líneas y los 4 espacios de las lecciones están en las posiciones correctas (paso 0-8 par = línea, impar = espacio)", () => {
    const pasos = (n: string) => indiceDiatonicoAbsoluto(parseNota(n)!) - (4 * 7 + 2);
    for (const n of REF.lineas) expect(pasos(n) % 2, n).toBe(0);
    REF.lineas.forEach((n, i) => expect(pasos(n), n).toBe(i * 2));
    REF.espacios.forEach((n, i) => expect(pasos(n), n).toBe(i * 2 + 1));
    // Do4 y Fa3 están en líneas adicionales (por debajo); La5 y Do6, por encima.
    expect(pasos("Do4")).toBe(-2);
    expect(pasos("La3")).toBe(-4);
    expect(pasos("Fa3")).toBe(-6);
    expect(pasos("La5")).toBe(10);
    expect(pasos("Do6")).toBe(12);
    const texto = TODAS.filter((l) => l.slug === "melodia-lineas-y-espacios").map(corpus).join(" ");
    expect(texto).toContain("mi, sol, si, re, fa");
    expect(texto).toContain("fa, la, do, mi");
  });

  it("las lecciones enseñan las cifras de la referencia y ninguna afirmación conocida como falsa", () => {
    const FALSAS = [
      "la4 = 432",
      "do4 = 440",
      "una octava tiene 10 semitonos",
      "una octava tiene 8 semitonos",
      "una octava tiene 7 semitonos",
      "un tono son 3 semitonos",
      "un tono es un semitono",
      "la redonda dura 2 pulsos",
      "la blanca dura 1 pulso",
      "la negra dura 2 pulsos",
      "la corchea dura 1 pulso",
      "do es a",
      "la es c",
      "un sostenido baja",
      "un bemol sube",
      "la escala mayor tiene 6 notas",
      "la pentatonica tiene 7 notas",
      "la formula de la escala mayor es t-s-t",
      "el do central es do5",
      "el do central es do3",
    ];
    for (const l of TODAS) for (const f of FALSAS) expect(corpus(l), `${l.slug}: «${f}»`).not.toContain(f);
    const clase = (slug: string) => corpus(CLASES_MELODIA.find((c) => c.slug === slug)!);
    expect(clase("melodia-clase-sonido-y-nota")).toContain("12 semitonos");
    expect(clase("melodia-clase-sonido-y-nota")).toContain("440 hz");
    expect(clase("melodia-clase-tonos-y-semitonos")).toContain("5 × 2 + 2 = 12");
    expect(clase("melodia-clase-frecuencia-y-octava")).toContain("880 hz");
    expect(clase("melodia-clase-frecuencia-y-octava")).toContain("1,0595");
    expect(clase("melodia-clase-frecuencia-y-octava")).toContain("261,63");
    expect(clase("melodia-clase-figuras-y-compas")).toContain("redonda dura 4");
  });
});

describe("Melodía: cobertura de TODO lo que evalúa la práctica", () => {
  it("los 6 modos de la práctica (MODOS_MELODIA) tienen al menos una Técnica y una Clase (si se agrega un modo sin lección, falla)", () => {
    expect([...GRUPOS]).toEqual([...MODOS_MELODIA]);
    for (const modo of MODOS_MELODIA) {
      expect(TECNICAS_MELODIA.some((t) => t.grupo === modo), `Técnicas de ${modo}`).toBe(true);
      expect(CLASES_MELODIA.some((c) => c.grupo === modo), `Clases de ${modo}`).toBe(true);
    }
  });

  const clasesDe = (g: string) => CLASES_MELODIA.filter((c) => c.grupo === g);
  const leccionesDe = (g: string) => TODAS.filter((l) => l.grupo === g);

  it("fundamentos: las 4 figuras (con su duración) y las 7 notas con su cifrado, en los dos sentidos, en una lección del grupo y en una Clase", () => {
    for (const fuente of [leccionesDe("fundamentos"), clasesDe("fundamentos")]) {
      const t = fuente.map(corpus).join(" ");
      for (const f of FIGURAS) {
        expect(t, `figura ${f}`).toContain(norm(NOMBRE_FIGURA[f]));
        expect(t, `duración de ${f}`).toContain(norm(f));
      }
      for (const [nota, letra] of Object.entries(LETRA_A_CIFRADO)) expect(t, `${nota} = ${letra}`).toContain(norm(`${nota} = ${letra}`));
      // Ambos sentidos: Nota -> letra y letra -> Nota.
      expect(t).toMatch(/que nota (corresponde a|es) la letra/);
      expect(t).toMatch(/cual es el cifrado/);
    }
    // El visual del ritmo cubre las 4 figuras, y el teclado con cifrado, las 7 notas.
    const ritmo = new Set(clasesDe("fundamentos").flatMap((c) => c.visuales.flatMap((v) => (v.tipo === "melodia.ritmo" ? v.figuras : []))));
    for (const f of FIGURAS) expect(ritmo.has(f), f).toBe(true);
    const cifrados = clasesDe("fundamentos").flatMap((c) => c.visuales.flatMap((v) => (v.tipo === "melodia.teclado" && v.cifrado ? v.notas.map((n) => parseNota(n)!.letra) : [])));
    for (const letra of LETRAS) expect(cifrados, letra).toContain(letra);
  });

  it("fundamentos: toda figura y toda nota que los generadores pueden preguntar (barrido de preguntas reales) está enseñada", () => {
    const t = clasesDe("fundamentos").map(corpus).join(" ");
    for (let nivel = 1; nivel <= 10; nivel++) {
      for (const f of FIGURAS_POR_BANDA[Math.min(4, Math.floor((nivel - 1) / 2))]) expect(t, `nivel ${nivel}: ${f}`).toContain(f);
    }
    const vistas = new Set<string>();
    for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 40; i++) vistas.add(generarPreguntaMelodia("fundamentos", nivel).respuesta);
    for (const r of vistas) {
      if (r.length === 1) expect(t, `cifrado ${r}`).toContain(`= ${norm(r)}`);
      else expect(t, `respuesta ${r}`).toContain(norm(r));
    }
  });

  it("lectura: TODA nota que puede aparecer en el modo Lectura (Fa3 a Do6, según el nivel) se dibuja en un pentagrama de una lección del grupo y de una Clase", () => {
    const pool = new Map<string, NotaMusical>();
    for (const banda of RANGO_LECTURA_POR_BANDA) for (const n of banda) pool.set(nombreNota({ ...n, alteracion: null }), { ...n, alteracion: null });
    expect(pool.size).toBeGreaterThanOrEqual(14);
    const enLecciones = new Set(leccionesDe("lectura").flatMap(notasDeVisuales));
    const enClases = new Set(clasesDe("lectura").flatMap(notasDeVisuales));
    for (const nombre of pool.keys()) {
      expect(enLecciones.has(nombre), `${nombre} no está en ningún pentagrama de una lección de lectura`).toBe(true);
      expect(enClases.has(nombre), `${nombre} no está en ningún pentagrama de una Clase de lectura`).toBe(true);
    }
    // Y también se enseñan los 4 espacios y Re4 (no se preguntan, pero hacen falta para ubicar todo).
    for (const n of REF.espacios) expect(enClases.has(n), n).toBe(true);
    expect(enClases.has("Re4")).toBe(true);
  });

  it("lectura: barrido de 600 preguntas reales; toda respuesta (nombre con octava) está dibujada en una Clase de lectura", () => {
    const enClases = new Set(clasesDe("lectura").flatMap(notasDeVisuales));
    const vistas = new Set<string>();
    for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 60; i++) vistas.add(generarPreguntaMelodia("lectura", nivel).respuesta);
    for (const r of vistas) expect(enClases.has(r), r).toBe(true);
    expect(clasesDe("lectura").map(corpus).join(" ")).toContain("clave de sol");
  });

  it("alteraciones: las 7 letras con ♯ y con ♭, los 4 casos que suenan como tecla blanca, la natural y el enarmónico se enseñan en el grupo y en una Clase", () => {
    for (const fuente of [leccionesDe("alteraciones"), clasesDe("alteraciones")]) {
      const t = fuente.map(corpus).join(" ");
      for (const letra of LETRAS) {
        expect(t, `${letra}♯`).toContain(norm(`${letra}♯`));
        expect(t, `${letra}♭`).toContain(norm(`${letra}♭`));
      }
      for (const caso of ["mi♯ = fa", "si♯ = do", "fa♭ = mi", "do♭ = si"]) expect(t, caso).toContain(caso);
      expect(t).toContain("enarmonic");
    }
    const clases = clasesDe("alteraciones").map(corpus).join(" ");
    for (const c of ["becuadro", "sostenido", "bemol", "posicion"]) expect(clases, c).toContain(c);
  });

  it("alteraciones: toda respuesta real de los generadores es una nota que se enseña como alterada (letra + símbolo)", () => {
    const t = clasesDe("alteraciones").map(corpus).join(" ");
    const vistas = new Set<string>();
    for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 80; i++) vistas.add(generarPreguntaMelodia("alteraciones", nivel).respuesta.replace(/\d+$/, ""));
    for (const r of vistas) expect(t, r).toContain(norm(r));
    expect(vistas.size).toBeGreaterThanOrEqual(10);
  });

  it("escalas: los 4 tipos, con su fórmula y construidos en una Clase (visual), y cómo reconocerlos; barrido de preguntas reales", () => {
    const tipos = Object.keys(NOMBRE_ESCALA) as TipoEscala[];
    const clases = clasesDe("escalas");
    const t = clases.map(corpus).join(" ");
    const visualesTipo = new Set(clases.flatMap((c) => c.visuales.flatMap((v) => (v.tipo === "melodia.escala" ? [v.escala.tipo] : []))));
    for (const tipo of tipos) {
      expect(t, NOMBRE_ESCALA[tipo]).toContain(norm(NOMBRE_ESCALA[tipo]));
      expect(t, `fórmula de ${tipo}`).toContain(FORMULA_ESCALA[tipo].join("-"));
      expect(visualesTipo.has(tipo), `visual de ${tipo}`).toBe(true);
    }
    const tecnicas = leccionesDe("escalas").map(corpus).join(" ");
    for (const tipo of ["mayor", "menor natural", "pentatonica"]) expect(tecnicas, tipo).toContain(tipo);
    const vistas = new Set<string>();
    for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 40; i++) vistas.add(generarPreguntaMelodia("escalas", nivel).respuesta);
    expect([...vistas].sort()).toEqual(Object.values(NOMBRE_ESCALA).sort());
  });

  it("acordes: los 14 tipos que puede preguntar la práctica, con su fórmula en semitonos y un visual, en una Clase; y las Técnicas cubren tríadas, séptimas y suspendidos/extendidos", () => {
    const tipos = Object.keys(NOMBRE_ACORDE) as TipoAcorde[];
    const clases = clasesDe("acordes");
    const t = clases.map(corpus).join(" ");
    const visualesTipo = new Set(clases.flatMap((c) => c.visuales.flatMap((v) => (v.tipo === "melodia.acorde" ? [v.acorde.tipo] : []))));
    for (const tipo of tipos) {
      expect(t, `fórmula de ${tipo}`).toContain(FORMULA_ACORDE[tipo].join("-"));
      expect(visualesTipo.has(tipo), `visual de ${tipo}`).toBe(true);
    }
    // Los nombres tal cual los muestra la práctica (NOMBRE_ACORDE), los que salen en las opciones.
    for (const nombre of ["maj7", "dominante (7)", "m7", "dim7", "sus2", "sus4", "add9", "novena (9)", "oncena (11)", "trecena (13)"]) {
      expect(t, nombre).toContain(nombre);
    }
    const tecnicas = leccionesDe("acordes").map(corpus).join(" ");
    for (const c of ["triada", "septima", "sus2", "sus4", "add9", "oncena", "trecena"]) expect(tecnicas, c).toContain(c);
  });

  it("acordes: barrido de 1200 preguntas reales; toda respuesta es un tipo enseñado y los 14 aparecen", () => {
    const vistas = new Set<string>();
    for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 120; i++) vistas.add(generarPreguntaMelodia("acordes", nivel).respuesta);
    expect([...vistas].sort()).toEqual(Object.values(NOMBRE_ACORDE).sort());
  });

  it("oído absoluto: se enseñan la frecuencia, La4 = 440 Hz, la octava (×2), el semitono, los sostenidos, las opciones más separadas (Do4, Fa4, Sol4, Do5), el registro y el oído relativo", () => {
    for (const fuente of [leccionesDe("oido_absoluto"), clasesDe("oido_absoluto")]) {
      const t = fuente.map(corpus).join(" ");
      for (const c of ["440 hz", "octava", "semitono", "sostenido", "frecuencia", "grave", "agud"]) expect(t, c).toContain(c);
    }
    const clases = clasesDe("oido_absoluto").map(corpus).join(" ");
    for (const c of ["do4", "fa4", "sol4", "do5", "oido relativo", "oido absoluto", "sintetizad", "temperamento igual"]) expect(clases, c).toContain(c);
    // Las notas del banco de oído son naturales de una o dos octavas y sostenidos de Do, Re, Fa, Sol y La: todas se ven en el grupo de lectura/alteraciones.
    const pool = POOL_OIDO_POR_BANDA.flat();
    const enseñadas = TODAS.map(corpus).join(" ");
    for (const n of pool) expect(enseñadas, nombreNota(n)).toContain(norm(nombreSinOctava(n)));
  });

  it("los términos musicales que salen en los enunciados de la práctica se enseñan al menos una vez (cifrado americano, fundamental, escala, acorde, séptima...)", () => {
    const t = TODAS.map(corpus).join(" ");
    for (const c of ["cifrado americano", "fundamental", "escala", "acorde", "septima", "pentagrama", "figura ritmica", "alteracion", "semitono", "octava"]) expect(t, c).toContain(c);
  });
});

describe("Melodía: migración generada", () => {
  const esperado = () => generarSqlMelodia(TECNICAS_MELODIA, CLASES_MELODIA, SLUGS_TECNICAS_HISTORICAS);

  it("es exactamente lo que se genera de src/lib/melodia/lecciones/", () => {
    if (process.env.MELODIA_ESCRIBIR_SQL === "1") fs.writeFileSync(rutaMigracion, esperado(), "utf8");
    expect(fs.existsSync(rutaMigracion), "falta la migración: MELODIA_ESCRIBIR_SQL=1 npx vitest run src/lib/melodia/lecciones").toBe(true);
    expect(fs.readFileSync(rutaMigracion, "utf8")).toBe(esperado());
  });

  it("el número de migración no choca con ninguna otra (0213 o el siguiente libre por encima de 0212)", () => {
    const dir = path.join(raiz, "supabase", "migrations");
    const numero = ARCHIVO_MIGRACION_MELODIA.slice(0, 4);
    expect(Number(numero)).toBeGreaterThanOrEqual(213);
    const iguales = fs.readdirSync(dir).filter((f) => f.startsWith(numero + "_"));
    expect(iguales).toEqual([ARCHIVO_MIGRACION_MELODIA]);
  });

  it("el orden de las sentencias es seguro: UPDATE de las 5 históricas, después los INSERT (nunca pisa un slug existente)", () => {
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    const idxUpdate = sql.indexOf("update public.techniques");
    const idxInsert = sql.indexOf("insert into public.techniques");
    expect(idxUpdate).toBeGreaterThan(-1);
    expect(idxInsert).toBeGreaterThan(idxUpdate);
    expect((sql.match(/^update public\.techniques/gm) ?? []).length).toBe(5);
    expect((sql.match(/^insert into public\.techniques/gm) ?? []).length).toBe(2);
    // Cada UPDATE apunta a una fila que 0089 sembró (slug histórico).
    const objetivos = [...sql.matchAll(/where problem_type = 'melodia' and slug = '([a-z0-9-]+)';/g)].map((m) => m[1]);
    expect(objetivos.sort()).toEqual([...SLUGS_TECNICAS_HISTORICAS].sort());
    // Ningún slug insertado coincide con un slug histórico ni con otro de la propia migración.
    const insertados = [...sql.matchAll(/^\('(melodia-[a-z0-9-]+)', '/gm)].map((m) => m[1]);
    expect(insertados).toHaveLength(13 + 18);
    expect(new Set(insertados).size).toBe(insertados.length);
    for (const h of SLUGS_TECNICAS_HISTORICAS) expect(insertados).not.toContain(h);
  });

  it("los slugs insertados no chocan con ninguno sembrado por migraciones anteriores (slug es unique)", () => {
    const dir = path.join(raiz, "supabase", "migrations");
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    const nuevos = new Set([...sql.matchAll(/^\('(melodia-[a-z0-9-]+)', '/gm)].map((m) => m[1]));
    for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".sql") && n !== ARCHIVO_MIGRACION_MELODIA)) {
      const otro = fs.readFileSync(path.join(dir, f), "utf8");
      if (!otro.includes("'melodia-") || !/insert into public\.techniques/i.test(otro)) continue;
      for (const m of otro.matchAll(/^\s*\('(melodia-[a-z0-9-]+)',\s*'/gm)) {
        expect(nuevos.has(m[1]) && !SLUGS_TECNICAS_HISTORICAS.includes(m[1]), `${f} ya siembra ${m[1]}`).toBe(false);
      }
    }
  }, 30_000);

  it("cada bloque jsonb es parseable, con pasos, visuales de tipo conocido y quiz", () => {
    const sql = fs.readFileSync(rutaMigracion, "utf8");
    let total = 0;
    for (const m of sql.matchAll(/\$melodia\$([\s\S]*?)\$melodia\$::jsonb/g)) {
      const c = JSON.parse(m[1]) as { pasos: string[]; visuales: { tipo: string }[]; quiz: { respuesta: string; opciones: string[] }[] };
      expect(Array.isArray(c.pasos)).toBe(true);
      expect(c.visuales.length).toBeGreaterThan(0);
      for (const v of c.visuales) expect(TIPOS_CONOCIDOS.has(v.tipo)).toBe(true);
      for (const q of c.quiz) expect(q.opciones).toContain(q.respuesta);
      total++;
    }
    expect(total).toBe(18 + 18);
  });

  it("la migración no tiene voseo (español neutro)", () => {
    expect(detectarVoseo(fs.readFileSync(rutaMigracion, "utf8"))).toEqual([]);
  });
});
