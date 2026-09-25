import { describe, it, expect } from "vitest";
import katex from "katex";
import fs from "node:fs";
import path from "node:path";
import { LECCIONES_CIRCUITIA, TECNICAS, CLASES } from "./index";
import { generarSqlCircuitia } from "./sql";
import { esVisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_CIRCUITIA } from "@/components/circuitia/visuales/registro";
import { TIPOS_VISUAL_CIRCUITIA, type VisualCircuitia } from "@/lib/circuitia/visuales";
import { datosLeyOhm, datosResistenciaEquivalente, redondear2, resolverParaVisual } from "@/lib/circuitia/visualesDatos";
import { resolverCircuito, type NodoCircuito } from "@/lib/circuitos/resolver";
import { aNeutroProfundo } from "@/lib/texto/neutroSembrado";

// Verificación del contenido visual de Aprender de Circuitia:
//  - estructura: 5 Técnicas + 7 Clases con los mismos slug/orden/requiere_pro
//    que 0167/0171;
//  - `pasos` y `quiz` son EXACTAMENTE los que dejó 0195 (el contrato de
//    /api/aprender/completar valida el quiz por igualdad exacta): se
//    comparan contra el SQL, no contra una copia;
//  - cada lección tiene >= 1 visual, de tipo conocido y bien formado;
//  - los números de los visuales de las Clases (trabajadas con cifras) son
//    los mismos que dicen los pasos, recalculados por código;
//  - la migración de visuales es exactamente lo que se genera de este
//    contenido. Regenerar: CIRCUITIA_ESCRIBIR_SQL=1 npx vitest run src/lib/circuitia/lecciones

const NUMERO_MIGRACION = "0217";
const raiz = path.resolve(__dirname, "../../../..");
const dirMigraciones = path.join(raiz, "supabase", "migrations");
const ruta = (n: string) => path.join(dirMigraciones, n);
const rutaVisuales = ruta(`${NUMERO_MIGRACION}_circuitia_visuales.sql`);

interface Contenido {
  pasos: string[];
  visuales?: unknown[];
  quiz: { pregunta: string; opciones: string[]; respuesta: string; explicacion?: string }[];
}

// Orden y requiere_pro de las filas sembradas (0167: Técnicas, sin requiere_pro
// => false; 0171: Clases, con requiere_pro).
function filasSembradas(): { slug: string; orden: number; requierePro: boolean }[] {
  const salida: { slug: string; orden: number; requierePro: boolean }[] = [];
  const s0167Completo = fs.readFileSync(ruta("0167_mundo_circuitia.sql"), "utf8");
  // Solo la sección de las 5 lecciones (antes hay logros con slug circuitia-*).
  const s0167 = s0167Completo.slice(s0167Completo.indexOf("5 lecciones de Circuitia"));
  for (const m of s0167.matchAll(/^\('(circuitia-[a-z0-9-]+)',[\s\S]*?\r?\n {2}(\d+)\)/gm)) {
    salida.push({ slug: m[1], orden: Number(m[2]), requierePro: false });
  }
  const s0171 = fs.readFileSync(ruta("0171_circuitia_curso_pro.sql"), "utf8");
  for (const m of s0171.matchAll(/^\('(circuitia-[a-z0-9-]+)',[\s\S]*?\r?\n {2}(\d+), (true|false)\)/gm)) {
    salida.push({ slug: m[1], orden: Number(m[2]), requierePro: m[3] === "true" });
  }
  return salida;
}

// Contenido FINAL (pasos + quiz) de cada lección: el que dejó 0195, que
// reescribe el `contenido` completo de las 12.
function contenidoFinal0195(): Map<string, Contenido> {
  const sql = fs.readFileSync(ruta("0195_latex_clases_calculia_circuitia.sql"), "utf8");
  const mapa = new Map<string, Contenido>();
  // Una sentencia por bloque (el contenido de otras lecciones no se mezcla).
  for (const bloque of sql.split(/\r?\n(?=update public\.techniques\r?\nset contenido)/)) {
    const m = /^update public\.techniques\r?\nset contenido = '([\s\S]*)'::jsonb\r?\nwhere slug = '(circuitia-[^']+)';/.exec(bloque.trim());
    if (m) mapa.set(m[2], JSON.parse(m[1].replace(/''/g, "'")) as Contenido);
  }
  return mapa;
}

function filasVisuales(): { slug: string; contenido: { pasos: string[]; visuales: unknown[] } }[] {
  const sql = fs.readFileSync(rutaVisuales, "utf8");
  const filas: { slug: string; contenido: { pasos: string[]; visuales: unknown[] } }[] = [];
  for (const m of sql.matchAll(/update public\.techniques\nset contenido = contenido \|\| \$circuitia\$([\s\S]*?)\$circuitia\$::jsonb\nwhere slug = '([^']+)' and problem_type = 'circuitia';/g)) {
    filas.push({ slug: m[2], contenido: JSON.parse(m[1]) });
  }
  return filas;
}

const TIPOS_CONOCIDOS = new Set<string>(["cuadros", ...Object.keys(REGISTRO_VISUALES_CIRCUITIA)]);

describe("Circuitia: lecciones visuales (estructura)", () => {
  it("son 12: 5 técnicas gratis + 7 clases Pro, con orden continuo 1-12", () => {
    expect(TECNICAS).toHaveLength(5);
    expect(CLASES).toHaveLength(7);
    expect(LECCIONES_CIRCUITIA.map((l) => l.orden)).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
    expect(TECNICAS.every((l) => !l.requierePro)).toBe(true);
    expect(CLASES.every((l) => l.requierePro)).toBe(true);
  });

  it("mismos slug, orden y requiere_pro que 0167 / 0171", () => {
    const sembradas = filasSembradas();
    expect(sembradas).toHaveLength(12);
    for (const s of sembradas) {
      const l = LECCIONES_CIRCUITIA.find((x) => x.slug === s.slug);
      expect(l, `falta ${s.slug}`).toBeDefined();
      expect(l!.orden, s.slug).toBe(s.orden);
      expect(l!.requierePro, s.slug).toBe(s.requierePro);
    }
  });

  it("el quiz es IDÉNTICO al que dejó 0195 y los pasos sembrados no se tocan: solo se AGREGAN pasos al final de tres Clases", () => {
    const finales = contenidoFinal0195();
    expect(finales.size).toBe(12);
    const conPasosNuevos: string[] = [];
    for (const l of LECCIONES_CIRCUITIA) {
      const original = finales.get(l.slug);
      expect(original, `0195 no tiene ${l.slug}`).toBeDefined();
      const sembrados = aNeutroProfundo(original!.pasos);
      expect(l.pasos.slice(0, sembrados.length), `${l.slug}: los pasos sembrados siguen iguales y en el mismo orden`).toEqual(sembrados);
      if (l.pasos.length > sembrados.length) conPasosNuevos.push(l.slug);
      expect(l.quiz, `${l.slug}: quiz`).toEqual(aNeutroProfundo(original!.quiz));
    }
    expect(conPasosNuevos.sort()).toEqual(["circuitia-pro-cualitativo-cuando-no-cambia", "circuitia-pro-cualitativo-sube-o-baja", "circuitia-pro-fundamentos-ohm-serie"]);
  });

  it("cada quiz: respuesta entre las opciones, sin opciones repetidas", () => {
    for (const l of LECCIONES_CIRCUITIA) {
      expect(l.quiz.length).toBeGreaterThanOrEqual(3);
      for (const q of l.quiz) {
        expect(q.opciones, `${l.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size).toBe(q.opciones.length);
      }
    }
  });

  it("los pasos tienen los $ de LaTeX balanceados y ningún undefined/NaN", () => {
    for (const l of LECCIONES_CIRCUITIA) {
      for (const p of l.pasos) {
        expect((p.match(/\$/g) ?? []).length % 2, `${l.slug}: $ desparejado en «${p}»`).toBe(0);
        expect(p).not.toMatch(/undefined|NaN/);
      }
    }
  });

  it("TODA Técnica y Clase tiene al menos un visual, de un tipo conocido y bien formado", () => {
    for (const l of LECCIONES_CIRCUITIA) {
      expect(l.visuales.length, `${l.slug} sin visuales`).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales) {
        expect(esVisualLeccion(v), l.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${l.slug}: tipo ${v.tipo}`).toBe(true);
        expect(v.despuesDePaso, `${l.slug}: despuesDePaso obligatorio en el contenido real`).toBeDefined();
        expect(Number.isInteger(v.despuesDePaso) && v.despuesDePaso! >= 0 && v.despuesDePaso! < l.pasos.length, `${l.slug}: despuesDePaso`).toBe(true);
      }
    }
  });

  it("los tipos del registro coinciden con TIPOS_VISUAL_CIRCUITIA y llevan el prefijo circuitia.", () => {
    expect(Object.keys(REGISTRO_VISUALES_CIRCUITIA).sort()).toEqual([...TIPOS_VISUAL_CIRCUITIA].sort());
    for (const t of TIPOS_VISUAL_CIRCUITIA) expect(t.startsWith("circuitia.")).toBe(true);
  });
});

// ---------- Datos de cada visual ----------

function ids(n: NodoCircuito): string[] {
  return n.tipo === "resistor" ? [n.id] : n.hijos.flatMap(ids);
}
function ohmios(n: NodoCircuito): number[] {
  return n.tipo === "resistor" ? [n.ohmios] : n.hijos.flatMap(ohmios);
}

const visualesCircuitia = (): { slug: string; v: VisualCircuitia }[] =>
  LECCIONES_CIRCUITIA.flatMap((l) => l.visuales.filter((v) => v.tipo.startsWith("circuitia.")).map((v) => ({ slug: l.slug, v: v as VisualCircuitia })));

describe("Circuitia: los datos de cada visual son válidos", () => {
  it("circuito: ids únicos, ohmios y voltaje positivos, resaltarId existente, y resuelve sin errores", () => {
    let n = 0;
    for (const { slug, v } of visualesCircuitia()) {
      if (v.tipo !== "circuitia.circuito") continue;
      const lista = ids(v.topologia);
      expect(new Set(lista).size, `${slug}: ids repetidos`).toBe(lista.length);
      expect(ohmios(v.topologia).every((o) => Number.isFinite(o) && o > 0), slug).toBe(true);
      expect(v.vFuente, slug).toBeGreaterThan(0);
      if (v.resaltarId) expect(lista, `${slug}: resaltarId`).toContain(v.resaltarId);
      expect(resolverParaVisual(v.topologia, v.vFuente).length).toBe(lista.length);
      n++;
    }
    expect(n).toBeGreaterThanOrEqual(15);
  });

  it("resistenciaEquivalente: 2 o 3 resistores positivos", () => {
    for (const { slug, v } of visualesCircuitia()) {
      if (v.tipo !== "circuitia.resistenciaEquivalente") continue;
      expect(["serie", "paralelo"], slug).toContain(v.modo);
      expect(v.ohmios.length, slug).toBeGreaterThanOrEqual(2);
      expect(v.ohmios.length, slug).toBeLessThanOrEqual(3);
      expect(v.ohmios.every((o) => o > 0), slug).toBe(true);
    }
  });

  it("leyOhm: exactamente 2 de los 3 valores, y calcula el tercero", () => {
    let n = 0;
    for (const { slug, v } of visualesCircuitia()) {
      if (v.tipo !== "circuitia.leyOhm") continue;
      const dados = (["v", "i", "r"] as const).filter((k) => typeof v[k] === "number");
      expect(dados, slug).toHaveLength(2);
      const d = datosLeyOhm(v);
      expect(redondear2(d.v)).toBe(redondear2(d.i * d.r));
      n++;
    }
    expect(n).toBeGreaterThanOrEqual(2);
  });
});

// El número `valor` aparece en el texto tal cual, o (si es un periódico) con
// más decimales — p. ej. 6.67 se escribe 6.6667 y 1.33 se escribe 1.333.
function aparece(texto: string, valor: number): boolean {
  const candidatos = new Set([String(Math.round(valor * 100) / 100), String(Math.round(valor * 1000) / 1000), String(Math.round(valor * 10000) / 10000)]);
  return [...candidatos].some((c) => new RegExp(`(?<![\\d.])${c.replace(".", "\\.")}(?![\\d])`).test(texto));
}

describe("Circuitia: las cifras de los visuales de las Clases coinciden con las que dicen los pasos", () => {
  it("cada voltaje/corriente/resistencia que muestra un visual de una Clase aparece en sus pasos", () => {
    let verificados = 0;
    for (const l of CLASES) {
      const texto = l.pasos.join("\n");
      for (const v of l.visuales as VisualCircuitia[]) {
        if (v.tipo === "circuitia.circuito" && (v.mostrarValores ?? "ninguna") !== "ninguna") {
          const crudos = resolverCircuito(v.topologia, v.vFuente);
          for (const r of resolverParaVisual(v.topologia, v.vFuente)) {
            const crudo = crudos.get(r.id)!;
            const mostrados = [];
            if (v.mostrarValores === "corriente" || v.mostrarValores === "ambas") mostrados.push(["corriente", crudo.corriente] as const);
            if (v.mostrarValores === "voltaje" || v.mostrarValores === "ambas") mostrados.push(["voltaje", crudo.voltaje] as const);
            for (const [que, valor] of mostrados) {
              expect(aparece(texto, valor), `${l.slug} (${v.titulo}): ${que} de ${r.id} = ${valor}`).toBe(true);
              verificados++;
            }
          }
        }
        if (v.tipo === "circuitia.resistenciaEquivalente") {
          const d = v.modo === "serie" ? v.ohmios.reduce((a, b) => a + b, 0) : 1 / v.ohmios.reduce((a, o) => a + 1 / o, 0);
          expect(aparece(texto, d), `${l.slug}: R_eq ${v.modo}`).toBe(true);
          verificados++;
        }
        if (v.tipo === "circuitia.leyOhm") {
          const d = datosLeyOhm(v);
          expect(aparece(texto, d[d.incognita]), `${l.slug}: incógnita ${d.incognita}`).toBe(true);
          verificados++;
        }
      }
    }
    expect(verificados).toBeGreaterThanOrEqual(30);
  });
});

describe("Circuitia: KaTeX sin errores en pasos, quiz, títulos de visuales y fórmulas generadas", () => {
  it("todo $...$ y toda fórmula de resistencia equivalente se renderiza con KaTeX estricto (throwOnError)", () => {
    const fragmentos = (t: string) => [...t.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
    let n = 0;
    for (const l of LECCIONES_CIRCUITIA) {
      const textos = [...l.pasos, ...l.quiz.flatMap((q) => [q.pregunta, q.explicacion, ...q.opciones]), ...(l.visuales as VisualCircuitia[]).map((v) => v.titulo ?? "")];
      for (const t of textos) {
        expect((t.match(/\$/g) ?? []).length % 2, `${l.slug}: $ desparejado en «${t.slice(0, 60)}»`).toBe(0);
        for (const f of fragmentos(t)) {
          expect(katex.renderToString(f, { throwOnError: true }), `${l.slug}: ${f}`).not.toContain("katex-error");
          n++;
        }
      }
      for (const v of l.visuales as VisualCircuitia[]) {
        if (v.tipo !== "circuitia.resistenciaEquivalente") continue;
        for (const f of datosResistenciaEquivalente(v.modo, v.ohmios).formulas) {
          expect(katex.renderToString(f, { throwOnError: true }), `${l.slug}: ${f}`).not.toContain("katex-error");
          n++;
        }
      }
    }
    expect(n).toBeGreaterThan(100);
  });
});

describe("Circuitia: migración de visuales", () => {
  it(`${NUMERO_MIGRACION}_circuitia_visuales.sql es exactamente lo que se genera de src/lib/circuitia/lecciones/`, () => {
    const esperado = generarSqlCircuitia(LECCIONES_CIRCUITIA, NUMERO_MIGRACION);
    if (process.env.CIRCUITIA_ESCRIBIR_SQL === "1") fs.writeFileSync(rutaVisuales, esperado, "utf8");
    expect(fs.existsSync(rutaVisuales), "falta la migración: CIRCUITIA_ESCRIBIR_SQL=1 npx vitest run src/lib/circuitia/lecciones").toBe(true);
    expect(fs.readFileSync(rutaVisuales, "utf8")).toBe(esperado);
  });

  it("es un merge de `pasos` y `visuales` (el quiz no se toca, nada de insertar filas ni de reemplazar todo el contenido)", () => {
    const sql = fs.readFileSync(rutaVisuales, "utf8");
    const sentencias = sql.replace(/--.*$/gm, "").match(/update public\.techniques/gi) ?? [];
    expect(sentencias).toHaveLength(12);
    expect(sql).not.toMatch(/insert into/i);
    expect(sql).not.toMatch(/"quiz"/);
    expect(sql.match(/"pasos": \[/g)).toHaveLength(12);
    expect(sql.match(/set contenido = contenido \|\| /g)).toHaveLength(12);
  });

  it("los 12 jsonb parsean, los slugs existen en 0195 y pasos y visuales son los del contenido tipado", () => {
    const filas = filasVisuales();
    expect(filas).toHaveLength(12);
    const finales = contenidoFinal0195();
    for (const f of filas) {
      expect(finales.has(f.slug), `slug ${f.slug} no existe`).toBe(true);
      const l = LECCIONES_CIRCUITIA.find((x) => x.slug === f.slug)!;
      expect(f.contenido.pasos).toEqual(l.pasos);
      expect(f.contenido.visuales).toEqual(JSON.parse(JSON.stringify(l.visuales)));
      for (const v of f.contenido.visuales) {
        expect(esVisualLeccion(v), f.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has((v as VisualCircuitia).tipo), `${f.slug}: ${(v as VisualCircuitia).tipo}`).toBe(true);
        expect((v as VisualCircuitia).despuesDePaso ?? 0).toBeLessThan(l.pasos.length);
      }
    }
  });
});
