import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import katex from "katex";
import { TECNICAS_QUIMIA, CLASES_QUIMIA, TECNICAS_QUIMIA_TANDA1, CLASES_QUIMIA_TANDA1, TECNICAS_QUIMIA_TANDA2, CLASES_QUIMIA_TANDA2, type VisualLeccionQuimia } from "./index";
import { CABECERA_TANDA1, CABECERA_TANDA2, generarSqlQuimia } from "./sql";
import { ORDEN_GRUPOS_QUIMIA } from "@/lib/quimia/grupos";
import { esVisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_QUIMIA } from "@/components/quimia/visuales/registro";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import { ELEMENTOS } from "@/lib/practica/quimia";
import { ORDEN_FAMILIAS, simbolosDeSelector, tipoDe, periodoPorZ, CIERRES_DE_PERIODO } from "@/lib/quimia/tabla";
import { DATOS_ELEMENTOS, datosDe } from "@/lib/quimia/datos";
import { ejemploEnlace } from "@/lib/quimia/enlaces";
import { ANIONES, CATIONES, COMPUESTOS_IONICOS, OXIDOS_NO_METALICOS, OXOACIDOS, oxidacionCentral } from "@/lib/quimia/nomenclatura";
import { cargaTipicaPorGrupo } from "@/lib/quimia/valencia";
import { masaMolar } from "@/lib/quimia/formulas";
import { POTENCIALES, POTENCIAL_HIDROGENO_CV, voltios } from "@/lib/quimia/redox";

// Verificación del contenido de Aprender de Quimia (tandas 1 y 2 del retrofit a
// Técnicas | Clases, docs/PARIDAD_MUNDOS.md filas 22/23): estructura, quiz,
// visuales con datos válidos, KaTeX, español neutro, datos numéricos cruzados
// con las tablas de referencia y la migración 0209 generada byte a byte.
// Regenerar la migración: QUIMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/quimia/lecciones

const raiz = path.resolve(__dirname, "../../../..");
const ruta0209 = path.join(raiz, "supabase", "migrations", "0209_quimia_tecnicas_clases.sql");

const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_QUIMIA)]);
const LECCIONES = [...TECNICAS_QUIMIA, ...CLASES_QUIMIA];

// Todos los textos visibles de una lección (para KaTeX, voseo, números).
function textos(l: (typeof LECCIONES)[number]): string[] {
  const t: string[] = [l.nombre, l.descripcion, ...l.pasos];
  for (const q of l.quiz) t.push(q.pregunta, ...q.opciones, q.respuesta, q.explicacion);
  for (const v of l.visuales) {
    if (v.titulo) t.push(v.titulo);
    if (v.tipo === "quimia.cuadro") t.push(...v.columnas, ...v.filas.flat());
    if (v.tipo === "quimia.tabla") t.push(...v.pasos.map((p) => p.etiqueta));
    if (v.tipo === "cuadros") for (const c of v.cuadros) t.push(...[c.texto, c.formula ? `$${c.formula}$` : undefined, c.resaltar].filter((x): x is string => !!x));
  }
  return t;
}

describe("Quimia: Técnicas (estructura)", () => {
  it("son 30 en total (tanda 1: 16; tanda 2: 14): 5 tabla, 3 símbolos, 3 fórmulas, 5 nomenclatura, 6 redox y 8 orgánica; todas gratis, slugs únicos", () => {
    expect(TECNICAS_QUIMIA).toHaveLength(30);
    expect(TECNICAS_QUIMIA_TANDA1).toHaveLength(16);
    expect(TECNICAS_QUIMIA_TANDA2).toHaveLength(14);
    expect(TECNICAS_QUIMIA.every((t) => t.requierePro === false)).toBe(true);
    expect(new Set(TECNICAS_QUIMIA.map((t) => t.slug)).size).toBe(30);
    const porGrupo: Record<string, number> = {};
    for (const t of TECNICAS_QUIMIA) porGrupo[t.grupo] = (porGrupo[t.grupo] ?? 0) + 1;
    expect(porGrupo).toEqual({ tabla: 5, simbolos: 3, formulas: 3, nomenclatura: 5, redox: 6, organica: 8 });
    // la tanda 2 solo trae grupos nuevos
    expect(new Set(TECNICAS_QUIMIA_TANDA2.map((t) => t.grupo))).toEqual(new Set(["redox", "organica"]));
  });

  it("las 4 Técnicas viejas conservan su slug (se actualizan, no se duplican) y las 26 nuevas llevan prefijo quimia-tecnica-", () => {
    const viejas = TECNICAS_QUIMIA.filter((t) => t.existente).map((t) => t.slug).sort();
    expect(viejas).toEqual(["agrupar-por-familia", "asociacion-color-uso", "patrones-en-formulas", "tabla-como-mapa"]);
    for (const t of TECNICAS_QUIMIA.filter((x) => !x.existente)) expect(t.slug, t.slug).toMatch(/^quimia-tecnica-[a-z0-9-]+$/);
  });

  it("el orden es correlativo 1..n dentro de cada grupo, sin huecos ni repetidos", () => {
    for (const g of ORDEN_GRUPOS_QUIMIA) {
      const ordenes = TECNICAS_QUIMIA.filter((t) => t.grupo === g).map((t) => t.orden).sort((a, b) => a - b);
      expect(ordenes, g).toEqual(ordenes.map((_, i) => i + 1));
    }
  });

  it("3 a 5 pasos y 3 a 5 preguntas por Técnica", () => {
    for (const t of TECNICAS_QUIMIA) {
      expect(t.pasos.length, t.slug).toBeGreaterThanOrEqual(3);
      expect(t.pasos.length, t.slug).toBeLessThanOrEqual(5);
      expect(t.quiz.length, t.slug).toBeGreaterThanOrEqual(3);
      expect(t.quiz.length, t.slug).toBeLessThanOrEqual(5);
    }
  });
});

describe("Quimia: Clases (estructura)", () => {
  it("son 34 en total (tanda 1: 17; tanda 2: 17): 4 tabla, 2 símbolos, 3 fórmulas, 8 nomenclatura, 7 redox y 10 orgánica; todas Pro, slugs únicos", () => {
    expect(CLASES_QUIMIA).toHaveLength(34);
    expect(CLASES_QUIMIA_TANDA1).toHaveLength(17);
    expect(CLASES_QUIMIA_TANDA2).toHaveLength(17);
    expect(CLASES_QUIMIA.every((c) => c.requierePro === true)).toBe(true);
    expect(new Set(CLASES_QUIMIA.map((c) => c.slug)).size).toBe(34);
    for (const c of CLASES_QUIMIA) expect(c.slug, c.slug).toMatch(/^quimia-clase-[a-z0-9-]+$/);
    const porGrupo: Record<string, number> = {};
    for (const c of CLASES_QUIMIA) porGrupo[c.grupo] = (porGrupo[c.grupo] ?? 0) + 1;
    expect(porGrupo).toEqual({ tabla: 4, simbolos: 2, formulas: 3, nomenclatura: 8, redox: 7, organica: 10 });
    expect(new Set(CLASES_QUIMIA_TANDA2.map((c) => c.grupo))).toEqual(new Set(["redox", "organica"]));
  });

  it("el arreglo está en orden de curso: (grupo en ORDEN_GRUPOS_QUIMIA, orden) siempre crece", () => {
    for (let i = 1; i < CLASES_QUIMIA.length; i++) {
      const a = CLASES_QUIMIA[i - 1];
      const b = CLASES_QUIMIA[i];
      const ga = ORDEN_GRUPOS_QUIMIA.indexOf(a.grupo);
      const gb = ORDEN_GRUPOS_QUIMIA.indexOf(b.grupo);
      expect(ga < gb || (ga === gb && a.orden < b.orden), `${a.slug} -> ${b.slug}`).toBe(true);
    }
    for (const g of ORDEN_GRUPOS_QUIMIA) {
      const ordenes = CLASES_QUIMIA.filter((c) => c.grupo === g).map((c) => c.orden);
      expect(ordenes, g).toEqual(ordenes.map((_, i) => i + 1));
    }
  });

  it("explicación desarrollada (6 o más pasos) y quiz de 4 a 6 preguntas", () => {
    for (const c of CLASES_QUIMIA) {
      expect(c.pasos.length, c.slug).toBeGreaterThanOrEqual(6);
      expect(c.quiz.length, c.slug).toBeGreaterThanOrEqual(4);
      expect(c.quiz.length, c.slug).toBeLessThanOrEqual(6);
    }
  });

  it("toda Clase Pro tiene quiz: /api/aprender/completar solo exige plan Pro a las lecciones con quiz", () => {
    for (const c of CLASES_QUIMIA) expect(c.quiz.length, c.slug).toBeGreaterThan(0);
  });

  it("los grupos 'redox' y 'organica' quedaron llenos en la tanda 2: van al final del curso, después de nomenclatura, y las Clases de la tanda 2 son las últimas 17", () => {
    expect(ORDEN_GRUPOS_QUIMIA).toEqual(["tabla", "simbolos", "formulas", "nomenclatura", "redox", "organica"]);
    for (const g of ["redox", "organica"]) {
      expect(TECNICAS_QUIMIA.filter((t) => t.grupo === g).length, g).toBeGreaterThan(0);
      expect(CLASES_QUIMIA.filter((c) => c.grupo === g).length, g).toBeGreaterThan(0);
    }
    expect(CLASES_QUIMIA.slice(-17).map((c) => c.slug)).toEqual(CLASES_QUIMIA_TANDA2.map((c) => c.slug));
    expect(CLASES_QUIMIA.slice(0, 17).map((c) => c.slug)).toEqual(CLASES_QUIMIA_TANDA1.map((c) => c.slug));
  });
});

describe("Quimia: quiz de todas las lecciones", () => {
  it("la respuesta está entre las opciones, sin opciones repetidas, 3 o 4 opciones, con explicación", () => {
    for (const l of LECCIONES) {
      for (const q of l.quiz) {
        const donde = `${l.slug}: ${q.pregunta}`;
        expect(q.opciones, donde).toContain(q.respuesta);
        expect(new Set(q.opciones).size, donde).toBe(q.opciones.length);
        expect(q.opciones.length, donde).toBeGreaterThanOrEqual(3);
        expect(q.opciones.length, donde).toBeLessThanOrEqual(4);
        expect(q.explicacion.length, donde).toBeGreaterThan(15);
        expect(q.pregunta.length, donde).toBeGreaterThan(8);
      }
    }
  });

  it("la respuesta correcta no está siempre en la misma posición (no se puede adivinar por patrón)", () => {
    const posiciones = new Map<number, number>();
    for (const l of LECCIONES) for (const q of l.quiz) posiciones.set(q.opciones.indexOf(q.respuesta), (posiciones.get(q.opciones.indexOf(q.respuesta)) ?? 0) + 1);
    const total = [...posiciones.values()].reduce((a, b) => a + b, 0);
    for (const [pos, n] of posiciones) expect(n / total, `posición ${pos}`).toBeLessThan(0.5);
    expect(posiciones.size).toBeGreaterThanOrEqual(3);
  });
});

describe("Quimia: KaTeX, español neutro y caracteres raros en todo el texto", () => {
  it("cada $...$ tiene el $ apareado y se renderiza con KaTeX sin error", () => {
    let expresiones = 0;
    for (const l of LECCIONES) {
      for (const t of textos(l)) {
        expect((t.match(/\$/g) ?? []).length % 2, `${l.slug}: $ desparejado en «${t.slice(0, 80)}»`).toBe(0);
        for (const m of t.matchAll(/\$([^$]+)\$/g)) {
          const html = katex.renderToString(m[1], { throwOnError: true });
          expect(html, `${l.slug}: ${m[1]}`).not.toContain("katex-error");
          expresiones++;
        }
      }
    }
    expect(expresiones).toBeGreaterThan(500);
  }, 60_000);

  it("sin voseo (español neutro) en ninguna lección", () => {
    for (const l of LECCIONES) {
      for (const t of textos(l)) {
        const h = detectarVoseo(t);
        expect(h, `${l.slug}: «${t.slice(0, 80)}»`).toEqual([]);
      }
    }
  });

  it("sin placeholders rotos, dobles espacios ni comillas rectas sueltas en los pasos", () => {
    for (const l of LECCIONES) {
      for (const t of textos(l)) {
        // Fuera de las fórmulas ($...$, donde "}}" es LaTeX válido).
        expect(t.replace(/\$[^$]+\$/g, " "), l.slug).not.toMatch(/undefined|NaN|\[object|\{\{|\}\}|null/);
      }
      for (const p of l.pasos) expect(p, `${l.slug}: doble espacio`).not.toMatch(/ {2}/);
    }
  });

  it("los números con coma decimal del texto salen de datos verificados (electronegatividades, masas, diferencias, masas molares) o de constantes conocidas", () => {
    // Constantes del texto (umbrales de polaridad, número de Avogadro...) y
    // masas molares que aparecen SOLO como opciones incorrectas de un quiz
    // (88,0 = doble del CO2; 49,0 y 34,1 = errores típicos de H2SO4).
    // Tanda 2: 109,5 es el ángulo del tetraedro (constante) y los potenciales
    // estándar salen de la tabla POTENCIALES (redox.ts); los de las pilas y
    // las reacciones son diferencias de dos potenciales de esa tabla.
    const permitidos = new Set<string>(["1,7", "0,4", "0,7", "4,0", "1,6", "6,02", "35,45", "0,9", "88,0", "49,0", "34,1", "109,5"]);
    const fmt = (n: number, d: number) => n.toFixed(d).replace(".", ",");
    const ens = DATOS_ELEMENTOS.map((d) => d.electronegatividad).filter((x): x is number => x !== null);
    for (const e of ens) {
      permitidos.add(fmt(e, 2));
      for (const e2 of ens) permitidos.add(fmt(Math.abs(e - e2), 2));
    }
    for (const d of DATOS_ELEMENTOS) permitidos.add(fmt(d.masa, 2)).add(fmt(d.masa, 1));
    const formulas = [
      ...COMPUESTOS_IONICOS.map((c) => c.formula),
      ...OXIDOS_NO_METALICOS.map((c) => c.formula),
      ...OXOACIDOS.map((c) => c.formula),
      "H2O", "CO2", "CO", "NaCl", "H2SO4", "Ca(OH)2", "CaCO3", "C6H12O6", "O2", "NH3", "Al2O3", "Al2(SO4)3", "HCl",
    ];
    for (const fo of formulas) {
      try {
        const m = masaMolar(fo);
        permitidos.add(fmt(m, 2)).add(fmt(m, 1));
      } catch {
        // fórmulas con elementos sin masa cargada: no se usan en texto con masa
      }
    }
    // potenciales de reducción y sus diferencias (potencial de cada reacción o pila), en V con coma
    const potenciales = [...POTENCIALES.map((p) => p.cV), POTENCIAL_HIDROGENO_CV];
    for (const a of potenciales) {
      permitidos.add(voltios(a).replace("−", ""));
      for (const b of potenciales) permitidos.add(voltios(Math.abs(a - b)).replace("−", ""));
    }
    // porcentajes de composición del agua
    permitidos.add(fmt((16 / masaMolar("H2O")) * 100, 1)).add(fmt(((2 * 1.01) / masaMolar("H2O")) * 100, 1));
    const sospechosos: string[] = [];
    for (const l of LECCIONES) {
      for (const t of textos(l)) {
        // Las listas de localizadores de la nomenclatura orgánica ("2,4-dimetilhexano", "buta-1,3-dieno")
        // no son decimales: van entre guiones o pegadas a un nombre.
        const sinLocalizadores = t.replace(/\$[^$]+\$/g, " ").replace(/\d+(?:,\d+)+(?=-[a-záéíóúñ])/gi, " ");
        for (const m of sinLocalizadores.matchAll(/\d+,\d+/g)) {
          if (!permitidos.has(m[0])) sospechosos.push(`${l.slug}: ${m[0]} en «${t.slice(0, 70)}»`);
        }
      }
    }
    expect(sospechosos).toEqual([]);
  });
});

describe("Quimia: visuales de las lecciones", () => {
  const TODAS = LECCIONES;

  it("cada lección tiene al menos 1 visual de tipo conocido, con despuesDePaso dentro de sus pasos", () => {
    for (const l of TODAS) {
      expect(l.visuales.length, `${l.slug} sin visuales`).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales) {
        expect(esVisualLeccion(v), l.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${l.slug}: tipo ${v.tipo}`).toBe(true);
        expect(v.despuesDePaso, `${l.slug}: despuesDePaso obligatorio`).toBeDefined();
        expect(v.despuesDePaso!, `${l.slug}: despuesDePaso fuera de los pasos`).toBeLessThan(l.pasos.length);
      }
    }
  });

  const visualesDe = (tipo: string): { slug: string; v: VisualLeccionQuimia }[] =>
    TODAS.flatMap((l) => l.visuales.filter((v) => v.tipo === tipo).map((v) => ({ slug: l.slug, v })));

  it("quimia.tabla: cada selector es válido y resalta al menos un elemento real", () => {
    const visuales = visualesDe("quimia.tabla");
    expect(visuales.length).toBeGreaterThan(10);
    for (const { slug, v } of visuales) {
      if (v.tipo !== "quimia.tabla") continue;
      expect(v.pasos.length, slug).toBeGreaterThan(0);
      for (const p of v.pasos) {
        expect(p.etiqueta.length, slug).toBeGreaterThan(5);
        if (!p.seleccion) continue;
        const s = p.seleccion;
        if (s.por === "grupo") expect(s.n >= 1 && s.n <= 18, `${slug}: grupo ${s.n}`).toBe(true);
        if (s.por === "periodo") expect(s.n >= 1 && s.n <= 7, `${slug}: período ${s.n}`).toBe(true);
        if (s.por === "familia") expect(ORDEN_FAMILIAS, slug).toContain(s.familia);
        if (s.por === "elementos") for (const sim of s.simbolos) expect(ELEMENTOS.some((e) => e.simbolo === sim), `${slug}: símbolo ${sim}`).toBe(true);
        expect(simbolosDeSelector(s).length, `${slug}: ${JSON.stringify(s)}`).toBeGreaterThan(0);
      }
    }
  });

  it("quimia.elemento: el elemento tiene datos cargados y los campos son válidos", () => {
    for (const { slug, v } of visualesDe("quimia.elemento")) {
      if (v.tipo !== "quimia.elemento") continue;
      expect(datosDe(v.simbolo), `${slug}: ${v.simbolo}`).toBeDefined();
      expect(v.campos.length, slug).toBeGreaterThan(2);
      expect(new Set(v.campos).size, slug).toBe(v.campos.length);
    }
  });

  it("quimia.enlace: el ejemplo existe y su tipo coincide con el visual", () => {
    for (const { slug, v } of visualesDe("quimia.enlace")) {
      if (v.tipo !== "quimia.enlace") continue;
      const e = ejemploEnlace(v.ejemplo);
      expect(e, `${slug}: ${v.ejemplo}`).toBeDefined();
      expect(e!.tipo, `${slug}: ${v.ejemplo}`).toBe(v.enlace);
    }
  });

  it("quimia.cruce: el catión y el anión existen en las tablas de iones", () => {
    const visuales = visualesDe("quimia.cruce");
    expect(visuales.length).toBeGreaterThan(8);
    for (const { slug, v } of visuales) {
      if (v.tipo !== "quimia.cruce") continue;
      expect(CATIONES.some((c) => c.id === v.cation), `${slug}: ${v.cation}`).toBe(true);
      expect(ANIONES.some((a) => a.id === v.anion), `${slug}: ${v.anion}`).toBe(true);
    }
  });

  it("quimia.cuadro: cada fila tiene tantas celdas como columnas", () => {
    const visuales = visualesDe("quimia.cuadro");
    expect(visuales.length).toBeGreaterThan(20);
    for (const { slug, v } of visuales) {
      if (v.tipo !== "quimia.cuadro") continue;
      expect(v.filas.length, slug).toBeGreaterThan(0);
      expect(v.filas.length, `${slug}: máximo 24 filas`).toBeLessThanOrEqual(24);
      for (const fila of v.filas) expect(fila.length, `${slug}: ${fila.join("|")}`).toBe(v.columnas.length);
    }
  });

  it("quimia.orbitales: Z entre 1 y 118", () => {
    for (const { slug, v } of visualesDe("quimia.orbitales")) {
      if (v.tipo !== "quimia.orbitales") continue;
      expect(v.z >= 1 && v.z <= 118, slug).toBe(true);
    }
  });
});

describe("Quimia: afirmaciones químicas de las lecciones contra cálculos independientes", () => {
  it("gases nobles como hitos: período por Z y grupo 18 − (lugares al gas noble siguiente) para todos los grupos principales", () => {
    // Cierres de período usados en la Técnica.
    expect(CIERRES_DE_PERIODO).toEqual([2, 10, 18, 36, 54, 86, 118]);
    for (const e of ELEMENTOS) expect(periodoPorZ(e.numeroAtomico), e.simbolo).toBe(e.periodo);
    for (const e of ELEMENTOS) {
      const z = e.numeroAtomico;
      if (z === 1 || (z >= 57 && z <= 71) || (z >= 89 && z <= 103)) continue;
      const bloqueD = e.grupo >= 3 && e.grupo <= 12;
      if (bloqueD || e.grupo === 18) continue;
      const siguiente = CIERRES_DE_PERIODO.find((c) => c >= z)!;
      const previo = [0, ...CIERRES_DE_PERIODO].filter((c) => c < z).pop()!;
      const grupoPorRegla = e.grupo >= 13 ? 18 - (siguiente - z) : z - previo;
      expect(grupoPorRegla, `${e.simbolo}`).toBe(e.grupo);
    }
    // Ejemplos concretos del texto
    const z = (s: string) => ELEMENTOS.find((e) => e.simbolo === s)!.numeroAtomico;
    expect([z("Fe"), z("Cl"), z("O"), z("Na"), z("Ca")]).toEqual([26, 17, 8, 11, 20]);
  });

  it("la carga por grupo de la Técnica 'la carga sale del grupo' figura entre los estados de oxidación de cada elemento de esos grupos", () => {
    for (const d of DATOS_ELEMENTOS) {
      const e = ELEMENTOS.find((x) => x.simbolo === d.simbolo)!;
      const carga = cargaTipicaPorGrupo(e.grupo);
      if (carga === null || e.grupo > 17) continue;
      // H (grupo 1) y B (13) sí; los de transición nunca llegan (grupos 3-12).
      expect(d.estadosOxidacion, `${d.simbolo}: grupo ${e.grupo}`).toContain(carga);
    }
  });

  it("los metaloides de la Técnica son exactamente 6: B, Si, Ge, As, Sb, Te", () => {
    const m = ELEMENTOS.filter((e) => tipoDe(e) === "metaloide").map((e) => e.simbolo);
    expect([...m].sort()).toEqual(["As", "B", "Ge", "Sb", "Si", "Te"]);
  });

  it("oxácidos del cloro: 1 a 4 oxígenos ↔ +1, +3, +5, +7", () => {
    expect(["HClO", "HClO2", "HClO3", "HClO4"].map(oxidacionCentral)).toEqual([1, 3, 5, 7]);
  });

  it("regla de los oxoácidos: n impar HXO((n+1)/2), n par H2XO((n+2)/2) (sin fósforo y boro, que son ácidos 'orto')", () => {
    for (const a of OXOACIDOS) {
      if (a.formula === "H3PO4" || a.formula === "H3BO3") continue;
      const n = oxidacionCentral(a.formula);
      const centro = a.formula.match(/[A-Z][a-z]?/g)!.find((s) => s !== "H" && s !== "O")!;
      const esperada = n % 2 === 1 ? `H${centro}O${(n + 1) / 2 === 1 ? "" : (n + 1) / 2}` : `H2${centro}O${(n + 2) / 2}`;
      expect(a.formula, `${a.formula} (n = ${n})`).toBe(esperada);
    }
  });

  it("las sales ácidas: la carga del anión es −(cantidad de H⁺ que perdió el ácido)", () => {
    const ACIDOS: Record<string, number> = { "HCO3-": 1, "HSO4-": 1, "HSO3-": 1, "HS-": 1, "H2PO4-": 2, "HPO4^2-": 1 };
    // H del ácido de origen: H2CO3 (2), H2SO4 (2), H2SO3 (2), H2S (2), H3PO4 (3) → carga = −(H del ácido − H que conserva)
    const ORIGEN: Record<string, number> = { "HCO3-": 2, "HSO4-": 2, "HSO3-": 2, "HS-": 2, "H2PO4-": 3, "HPO4^2-": 3 };
    for (const [id, conserva] of Object.entries(ACIDOS)) {
      const a = ANIONES.find((x) => x.id === id)!;
      expect(-a.carga, id).toBe(ORIGEN[id] - conserva);
    }
  });
});

describe("Quimia: migración 0209", () => {
  const esperado = generarSqlQuimia({ cabecera: CABECERA_TANDA1, tecnicas: TECNICAS_QUIMIA_TANDA1, clases: CLASES_QUIMIA_TANDA1 });

  it("es exactamente lo que se genera de src/lib/quimia/lecciones/", () => {
    if (process.env.QUIMIA_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta0209, esperado, "utf8");
    expect(fs.existsSync(ruta0209), "falta 0209: QUIMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/quimia/lecciones").toBe(true);
    expect(fs.readFileSync(ruta0209, "utf8")).toBe(esperado);
  });

  it("estructura: 4 UPDATE (las Técnicas viejas) y 2 INSERT (Técnicas nuevas y Clases), en ese orden", () => {
    const sql = fs.readFileSync(ruta0209, "utf8");
    expect((sql.match(/^update public\.techniques/gm) ?? []).length).toBe(4);
    expect((sql.match(/insert into public\.techniques/g) ?? []).length).toBe(2);
    const iUpdate = sql.lastIndexOf("update public.techniques");
    const iInsert = sql.indexOf("insert into public.techniques");
    expect(iUpdate, "los UPDATE van antes que los INSERT").toBeLessThan(iInsert);
    // ningún insert vuelve a tocar un slug que ya existía
    for (const t of TECNICAS_QUIMIA_TANDA1.filter((x) => x.existente)) {
      expect(sql.split(`('${t.slug}',`).length - 1, `${t.slug} no se inserta`).toBe(0);
    }
  });

  it("cada bloque de contenido es JSON válido con pasos, visuales de tipo conocido y quiz con respuesta entre las opciones", () => {
    const sql = fs.readFileSync(ruta0209, "utf8");
    let total = 0;
    for (const m of sql.matchAll(/\$quimia\$([\s\S]*?)\$quimia\$::jsonb/g)) {
      const c = JSON.parse(m[1]) as { pasos: string[]; visuales: { tipo: string }[]; quiz: { opciones: string[]; respuesta: string }[] };
      expect(Array.isArray(c.pasos)).toBe(true);
      for (const v of c.visuales) expect(TIPOS_CONOCIDOS.has(v.tipo)).toBe(true);
      for (const q of c.quiz) expect(q.opciones).toContain(q.respuesta);
      total++;
    }
    expect(total).toBe(33); // 16 técnicas + 17 clases
  });

  it("las Técnicas nuevas y las Clases se insertan con requiere_pro correcto (false / true)", () => {
    const sql = fs.readFileSync(ruta0209, "utf8");
    const bloques = sql.split("insert into public.techniques");
    expect(bloques).toHaveLength(3);
    expect(/\),\s*\n?\s*false\)|false\);/.test(bloques[1])).toBe(true);
    expect(bloques[1]).not.toMatch(/,\n\s+true\)/);
    expect(bloques[2]).not.toMatch(/,\n\s+false\)/);
    expect((bloques[2].match(/,\n {2}true\)/g) ?? []).length).toBe(17);
  });
});

describe("Quimia: migración de la tanda 2 (0211)", () => {
  const ruta0211 = path.join(raiz, "supabase", "migrations", "0211_quimia_redox_organica.sql");
  const esperado = generarSqlQuimia({ cabecera: CABECERA_TANDA2, tecnicas: TECNICAS_QUIMIA_TANDA2, clases: CLASES_QUIMIA_TANDA2 });

  it("es exactamente lo que se genera de src/lib/quimia/lecciones/", () => {
    if (process.env.QUIMIA_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta0211, esperado, "utf8");
    expect(fs.existsSync(ruta0211), "falta 0211: QUIMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/quimia/lecciones").toBe(true);
    expect(fs.readFileSync(ruta0211, "utf8")).toBe(esperado);
  });

  it("solo INSERT (sin UPDATE ni DELETE): 2 sentencias, Técnicas (gratis) y después Clases (Pro), 14 + 17 filas", () => {
    const sql = fs.readFileSync(ruta0211, "utf8");
    expect(sql).not.toMatch(/^\s*(update|delete|alter|drop)\b/im);
    const bloques = sql.split("insert into public.techniques");
    expect(bloques).toHaveLength(3);
    expect(bloques[1]).not.toMatch(/,\n\s+true\)/);
    expect((bloques[1].match(/,\n {2}false\)/g) ?? []).length).toBe(14);
    expect(bloques[2]).not.toMatch(/,\n\s+false\)/);
    expect((bloques[2].match(/,\n {2}true\)/g) ?? []).length).toBe(17);
  });

  it("los slugs no chocan con los de 0209 (techniques.slug es único) ni se repiten entre sí", () => {
    const sql0211 = fs.readFileSync(ruta0211, "utf8");
    const sql0209 = fs.readFileSync(ruta0209, "utf8");
    const slugs = (sql: string) => [...sql.matchAll(/^\('([a-z0-9-]+)', '/gm)].map((m) => m[1]);
    const nuevos = slugs(sql0211);
    expect(nuevos).toHaveLength(31);
    expect(new Set(nuevos).size).toBe(31);
    const viejos = new Set(slugs(sql0209));
    for (const s of nuevos) expect(viejos.has(s), s).toBe(false);
    for (const s of nuevos) expect(s).toMatch(/^quimia-(tecnica|clase)-(redox|organica)-/);
  });

  it("cada bloque de contenido es JSON válido con pasos, visuales de tipo conocido y quiz con respuesta entre las opciones", () => {
    const sql = fs.readFileSync(ruta0211, "utf8");
    let total = 0;
    for (const m of sql.matchAll(/\$quimia\$([\s\S]*?)\$quimia\$::jsonb/g)) {
      const c = JSON.parse(m[1]) as { pasos: string[]; visuales: { tipo: string }[]; quiz: { opciones: string[]; respuesta: string }[] };
      expect(c.visuales.length).toBeGreaterThan(0);
      for (const v of c.visuales) expect(TIPOS_CONOCIDOS.has(v.tipo)).toBe(true);
      for (const q of c.quiz) expect(q.opciones).toContain(q.respuesta);
      total++;
    }
    expect(total).toBe(31);
  });

  it("las dos migraciones juntas cubren todo el contenido sin duplicar filas", () => {
    expect(TECNICAS_QUIMIA.length + CLASES_QUIMIA.length).toBe(16 + 17 + 14 + 17);
    expect(new Set([...TECNICAS_QUIMIA, ...CLASES_QUIMIA].map((l) => l.slug)).size).toBe(64);
  });
});
