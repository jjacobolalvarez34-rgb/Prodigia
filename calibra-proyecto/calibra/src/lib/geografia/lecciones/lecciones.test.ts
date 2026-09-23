import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { TECNICAS_GEOGRAFIA, TECNICAS_GENERALES_GEOGRAFIA, CLASES_GEOGRAFIA } from "./index";
import { generarSqlGeografia, generarSqlGeografiaGenerales } from "./sql";
import { esVisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_GEOGRAFIA } from "@/components/geografia/visuales/registro";
import { COORDENADAS_PAIS, resolverPaisesResaltados } from "../visualesDatos";
import { IDS_POR_CONTINENTE, PAISES_POR_CONTINENTE } from "@/lib/practica/geografia";
import { PAIS_SUBREGION, SUBREGIONES_POR_CONTINENTE } from "../subregiones";

// Verificación del contenido de las 20 Técnicas + 16 Clases nuevas de
// Geografía (retrofit completo a Técnicas | Clases por continente, ver
// docs/PARIDAD_MUNDOS.md fila 1 + fila 22/23): estructura (slugs, orden,
// requierePro, quiz), visuales con tipos conocidos, y que cada país
// mencionado en un visual "geografia.mapa" sea un país real de ESE
// continente (cruzado contra IDS_POR_CONTINENTE, la fuente de verdad de
// src/lib/practica/geografia.ts) con una coordenada curada.
// Regenerar la migración 0208: GEOGRAFIA_ESCRIBIR_SQL=1 npx vitest run src/lib/geografia/lecciones

const raiz = path.resolve(__dirname, "../../../..");
const ruta0208 = path.join(raiz, "supabase", "migrations", "0208_geografia_mas_contenido.sql");
const ruta0210 = path.join(raiz, "supabase", "migrations", "0210_geografia_tecnicas_generales.sql");

const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_GEOGRAFIA)]);
const CONTINENTES_VALIDOS = new Set(["america", "europa", "africa", "asia_oceania"]);

describe("Geografía: Técnicas nuevas (estructura)", () => {
  it("son 20, todas requierePro=false, 5 por continente", () => {
    expect(TECNICAS_GEOGRAFIA).toHaveLength(20);
    expect(TECNICAS_GEOGRAFIA.every((t) => t.requierePro === false)).toBe(true);
    const slugs = TECNICAS_GEOGRAFIA.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(20);
    for (const t of TECNICAS_GEOGRAFIA) expect(CONTINENTES_VALIDOS.has(t.continente), t.slug).toBe(true);
    const porContinente = new Map<string, number>();
    for (const t of TECNICAS_GEOGRAFIA) porContinente.set(t.continente, (porContinente.get(t.continente) ?? 0) + 1);
    expect(Object.fromEntries(porContinente)).toEqual({ america: 5, europa: 5, africa: 5, asia_oceania: 5 });
  });

  it("cada quiz: respuesta entre las opciones, sin opciones repetidas, al menos 3 preguntas", () => {
    for (const t of TECNICAS_GEOGRAFIA) {
      expect(t.quiz.length, t.slug).toBeGreaterThanOrEqual(3);
      for (const q of t.quiz) {
        expect(q.opciones, `${t.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size).toBe(q.opciones.length);
        expect(q.explicacion.length, `${t.slug}: ${q.pregunta}`).toBeGreaterThan(10);
      }
    }
  });

  it("los pasos son una introducción corta (2-4 pasos) sin $ desparejados ni placeholders rotos", () => {
    for (const t of TECNICAS_GEOGRAFIA) {
      expect(t.pasos.length, t.slug).toBeGreaterThanOrEqual(2);
      expect(t.pasos.length, t.slug).toBeLessThanOrEqual(4);
      for (const p of t.pasos) {
        expect((p.match(/\$/g) ?? []).length % 2, `${t.slug}: $ desparejado en «${p}»`).toBe(0);
        expect(p).not.toMatch(/undefined|NaN/);
      }
    }
  });

  it("cada técnica tiene al menos 1 visual válido de tipo conocido", () => {
    for (const t of TECNICAS_GEOGRAFIA) {
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

describe("Geografía: Clases nuevas (estructura)", () => {
  it("son 16, todas requierePro=true, 4 por continente", () => {
    expect(CLASES_GEOGRAFIA).toHaveLength(16);
    expect(CLASES_GEOGRAFIA.every((c) => c.requierePro === true)).toBe(true);
    const slugs = CLASES_GEOGRAFIA.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(16);
    for (const c of CLASES_GEOGRAFIA) expect(CONTINENTES_VALIDOS.has(c.continente), c.slug).toBe(true);
    const porContinente = new Map<string, number>();
    for (const c of CLASES_GEOGRAFIA) porContinente.set(c.continente, (porContinente.get(c.continente) ?? 0) + 1);
    expect(Object.fromEntries(porContinente)).toEqual({ america: 4, europa: 4, africa: 4, asia_oceania: 4 });
  });

  it("el orden es correlativo (1..4) dentro de cada continente, sin huecos ni repetidos", () => {
    for (const continente of CONTINENTES_VALIDOS) {
      const ordenes = CLASES_GEOGRAFIA.filter((c) => c.continente === continente)
        .map((c) => c.orden)
        .sort((a, b) => a - b);
      expect(ordenes, continente).toEqual([1, 2, 3, 4]);
    }
  });

  it("cada quiz: respuesta entre las opciones, sin repetidas, al menos 3 preguntas", () => {
    for (const c of CLASES_GEOGRAFIA) {
      expect(c.quiz.length, c.slug).toBeGreaterThanOrEqual(3);
      for (const q of c.quiz) {
        expect(q.opciones, `${c.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size).toBe(q.opciones.length);
      }
    }
  });

  it("cada clase tiene al menos 1 visual válido de tipo conocido", () => {
    for (const c of CLASES_GEOGRAFIA) {
      expect(c.visuales.length, `${c.slug} sin visuales`).toBeGreaterThanOrEqual(1);
      for (const v of c.visuales) {
        expect(esVisualLeccion(v), c.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${c.slug}: tipo ${v.tipo}`).toBe(true);
      }
    }
  });
});

describe("Geografía: cada país de un visual 'geografia.mapa' es real y tiene coordenada curada", () => {
  const TODAS = [...TECNICAS_GEOGRAFIA, ...CLASES_GEOGRAFIA];

  it("1 a 4 países por visual, todos pertenecen al continente declarado (IDS_POR_CONTINENTE)", () => {
    for (const leccion of TODAS) {
      for (const v of leccion.visuales) {
        if (v.tipo !== "geografia.mapa") continue;
        expect(v.paisesIds.length, leccion.slug).toBeGreaterThanOrEqual(1);
        expect(v.paisesIds.length, leccion.slug).toBeLessThanOrEqual(4);
        expect(new Set(v.paisesIds).size, `${leccion.slug}: ids repetidos`).toBe(v.paisesIds.length);
        const ids = IDS_POR_CONTINENTE[v.continente];
        for (const id of v.paisesIds) {
          expect(ids.has(id), `${leccion.slug}: país ${id} no pertenece a ${v.continente}`).toBe(true);
        }
      }
    }
  });

  it("resolverPaisesResaltados no pierde ningún país (todas las coordenadas están curadas)", () => {
    for (const leccion of TODAS) {
      for (const v of leccion.visuales) {
        if (v.tipo !== "geografia.mapa") continue;
        const resueltos = resolverPaisesResaltados(v.paisesIds);
        expect(resueltos.length, `${leccion.slug}: falta coordenada para alguno de ${v.paisesIds.join(",")}`).toBe(
          v.paisesIds.length
        );
      }
    }
  });

  it("cada país usado también existe en PAISES_POR_CONTINENTE con el mismo nombre (cruce independiente)", () => {
    for (const leccion of TODAS) {
      for (const v of leccion.visuales) {
        if (v.tipo !== "geografia.mapa") continue;
        for (const id of v.paisesIds) {
          const real = PAISES_POR_CONTINENTE[v.continente].find((p) => p.id === id);
          expect(real, `${leccion.slug}: id ${id} no está en PAISES_POR_CONTINENTE.${v.continente}`).toBeDefined();
          const curado = COORDENADAS_PAIS[id];
          expect(curado?.nombre, `${leccion.slug}: nombre distinto para ${id}`).toBe(real!.nombre);
        }
      }
    }
  });

  // Bounding box aproximado por continente, reimplementado de forma
  // independiente (no sale de COORDENADAS_PAIS) — solo para detectar un
  // typo grueso de signo o de magnitud en una coordenada curada.
  const CAJAS: Record<string, { lonMin: number; lonMax: number; latMin: number; latMax: number }> = {
    america: { lonMin: -170, lonMax: -34, latMin: -56, latMax: 84 },
    europa: { lonMin: -25, lonMax: 40, latMin: 34, latMax: 71 },
    africa: { lonMin: -20, lonMax: 52, latMin: -35, latMax: 38 },
    asia_oceania: { lonMin: 25, lonMax: 180, latMin: -48, latMax: 55 },
  };

  it("cada coordenada curada cae dentro de la caja aproximada de su continente", () => {
    for (const [id, c] of Object.entries(COORDENADAS_PAIS)) {
      const caja = CAJAS[c.continente];
      expect(c.lon, `${id} ${c.nombre}: longitud fuera de rango`).toBeGreaterThanOrEqual(caja.lonMin);
      expect(c.lon, `${id} ${c.nombre}: longitud fuera de rango`).toBeLessThanOrEqual(caja.lonMax);
      expect(c.lat, `${id} ${c.nombre}: latitud fuera de rango`).toBeGreaterThanOrEqual(caja.latMin);
      expect(c.lat, `${id} ${c.nombre}: latitud fuera de rango`).toBeLessThanOrEqual(caja.latMax);
    }
  });
});

describe("Geografía: sub-regiones (alcance acotado, ver src/lib/geografia/subregiones.ts)", () => {
  it("cada país ancla de PAIS_SUBREGION existe en PAISES_POR_CONTINENTE del continente correcto", () => {
    for (const [id, subId] of Object.entries(PAIS_SUBREGION)) {
      const sub = Object.values(SUBREGIONES_POR_CONTINENTE)
        .flat()
        .find((s) => s.id === subId);
      expect(sub, `sub-región ${subId} no está definida`).toBeDefined();
      const real = PAISES_POR_CONTINENTE[sub!.continente].find((p) => p.id === id);
      expect(real, `país ${id} no existe en PAISES_POR_CONTINENTE.${sub!.continente}`).toBeDefined();
    }
  });

  it("cada Clase usa como ejemplo solo países anclados a SU sub-región (o, al menos, a su continente)", () => {
    for (const c of CLASES_GEOGRAFIA) {
      for (const v of c.visuales) {
        if (v.tipo !== "geografia.mapa") continue;
        for (const id of v.paisesIds) {
          expect(IDS_POR_CONTINENTE[v.continente].has(id), `${c.slug}: ${id} no es de ${v.continente}`).toBe(true);
        }
      }
    }
  });

  it("16 sub-regiones en total, 4 por continente", () => {
    const total = Object.values(SUBREGIONES_POR_CONTINENTE).flat();
    expect(total).toHaveLength(16);
    for (const continente of CONTINENTES_VALIDOS) {
      expect(SUBREGIONES_POR_CONTINENTE[continente as keyof typeof SUBREGIONES_POR_CONTINENTE]).toHaveLength(4);
    }
  });
});

describe("Geografía: migración 0208", () => {
  it("es exactamente lo que se genera de src/lib/geografia/lecciones/", () => {
    const esperado = generarSqlGeografia(TECNICAS_GEOGRAFIA, CLASES_GEOGRAFIA);
    if (process.env.GEOGRAFIA_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta0208, esperado, "utf8");
    expect(fs.existsSync(ruta0208), "falta 0208: GEOGRAFIA_ESCRIBIR_SQL=1 npx vitest run src/lib/geografia/lecciones").toBe(true);
    expect(fs.readFileSync(ruta0208, "utf8")).toBe(esperado);
  });

  it("el SQL generado: filas insertadas, jsonb parseable por bloque, tipos de visual conocidos", () => {
    const sql = fs.readFileSync(ruta0208, "utf8");
    expect(sql).toMatch(/insert into public\.techniques/);
    expect((sql.match(/insert into public\.techniques/g) ?? []).length).toBe(2);
    const re = /\$geografia\$([\s\S]*?)\$geografia\$::jsonb/g;
    let total = 0;
    for (const m of sql.matchAll(re)) {
      const contenido = JSON.parse(m[1]) as { pasos: string[]; visuales?: { tipo: string }[]; quiz?: unknown[] };
      expect(Array.isArray(contenido.pasos)).toBe(true);
      for (const v of contenido.visuales ?? []) expect(TIPOS_CONOCIDOS.has(v.tipo)).toBe(true);
      total++;
    }
    expect(total).toBe(36); // 20 técnicas + 16 clases
  });
});

describe("Geografía: Técnicas generales (grupo \"general\") con mapas y español neutro", () => {
  const SLUGS_HISTORICOS = ["dividir-en-subregiones", "anclar-por-vecinos", "forma-caracteristica"];

  it("son las 3 históricas de 0027, con sus mismos slugs (se reescriben por slug, no se insertan)", () => {
    expect(TECNICAS_GENERALES_GEOGRAFIA.map((t) => t.slug)).toEqual(SLUGS_HISTORICOS);
  });

  it("cada una trae al menos un mapa animado válido, con países reales que tienen coordenada curada", () => {
    for (const t of TECNICAS_GENERALES_GEOGRAFIA) {
      expect(t.visuales.length, `${t.slug} sin visuales (es lo que se reportó: solo texto)`).toBeGreaterThanOrEqual(1);
      for (const v of t.visuales) {
        expect(esVisualLeccion(v), t.slug).toBe(true);
        expect(v.tipo).toBe("geografia.mapa");
        expect(v.despuesDePaso, `${t.slug}: despuesDePaso obligatorio`).toBeDefined();
        expect(v.despuesDePaso!).toBeLessThan(t.pasos.length);
        expect(v.paisesIds.length).toBeGreaterThanOrEqual(1);
        expect(v.paisesIds.length).toBeLessThanOrEqual(4);
        for (const id of v.paisesIds) {
          expect(IDS_POR_CONTINENTE[v.continente].has(id), `${t.slug}: ${id} no es de ${v.continente}`).toBe(true);
          expect(COORDENADAS_PAIS[id], `${t.slug}: ${id} sin coordenada curada`).toBeDefined();
        }
        expect(resolverPaisesResaltados(v.paisesIds)).toHaveLength(v.paisesIds.length);
      }
    }
  });

  it("cada quiz: 3 preguntas, respuesta entre las opciones, sin opciones repetidas", () => {
    for (const t of TECNICAS_GENERALES_GEOGRAFIA) {
      expect(t.quiz).toHaveLength(3);
      for (const q of t.quiz) {
        expect(q.opciones, `${t.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size).toBe(q.opciones.length);
        expect(q.explicacion.length).toBeGreaterThan(10);
      }
    }
  });

  it("español neutro: sin voseo en pasos, quiz ni descripción", () => {
    // Solo las formas acentuadas del voseo: "practica tapando" es tuteo correcto, "practicá" no.
    const VOSEO = /(agrupalos|aprendé|ubicás|buscás|necesitás|fijate|practicá|elegí|usalo|preguntate|sabés|reconocés|recordás|podés)/i;
    for (const t of TECNICAS_GENERALES_GEOGRAFIA) {
      const textos = [t.nombre, t.descripcion, ...t.pasos, ...t.quiz.flatMap((q) => [q.pregunta, q.explicacion, q.respuesta, ...q.opciones])];
      for (const x of textos) expect(x, `${t.slug}: voseo en «${x}»`).not.toMatch(VOSEO);
    }
  });

  it("la migración 0210 es exactamente lo que se genera del contenido tipado", () => {
    const esperado = generarSqlGeografiaGenerales(TECNICAS_GENERALES_GEOGRAFIA, "0210");
    if (process.env.GEOGRAFIA_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta0210, esperado, "utf8");
    expect(fs.existsSync(ruta0210), "falta 0210: GEOGRAFIA_ESCRIBIR_SQL=1 npx vitest run src/lib/geografia/lecciones").toBe(true);
    expect(fs.readFileSync(ruta0210, "utf8")).toBe(esperado);
  });

  it("el SQL: 3 updates por slug con jsonb parseable y sin insert", () => {
    const sql = fs.readFileSync(ruta0210, "utf8");
    expect(sql).not.toMatch(/insert into/);
    expect((sql.match(/update public\.techniques/g) ?? []).length).toBe(3);
    const bloques = [...sql.matchAll(/\$geografia\$([\s\S]*?)\$geografia\$::jsonb/g)];
    expect(bloques).toHaveLength(3);
    for (const m of bloques) {
      const c = JSON.parse(m[1]) as { pasos: string[]; visuales: { tipo: string }[]; quiz: unknown[] };
      expect(c.visuales.length).toBeGreaterThanOrEqual(1);
      for (const v of c.visuales) expect(TIPOS_CONOCIDOS.has(v.tipo)).toBe(true);
    }
  });
});
