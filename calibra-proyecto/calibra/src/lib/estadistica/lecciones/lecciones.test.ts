import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import katex from "katex";
import { TECNICAS_ESTADISTICA, CLASES_ESTADISTICA } from "./index";
import { CABECERA_ESTADISTICA, generarSqlEstadistica } from "./sql";
import type { VisualLeccionEstadistica } from "./tipos";
import { REGISTRO_VISUALES_ESTADISTICA } from "@/components/estadistica/visuales/registro";
import { esVisualLeccion } from "@/lib/aprender/visuales";
import { GRUPOS_APRENDER } from "@/lib/aprender/grupos";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import { generarProblemaEstadistica, MODOS_ESTADISTICA, conRngSembrado, type ModoEstadistica, type TipoProblemaEstadistica } from "@/lib/practica/estadistica";
import { esGraficoEstadistica, esListaNumeros, esRamas } from "@/lib/estadistica/visualesDatos";

// Verificación del contenido de Aprender de Estadística (visuales): estructura,
// el texto sembrado en 0191 intacto (salvo el voseo, que se corrige), quiz
// idéntico, visuales con datos válidos y verificados contra cálculos hechos a
// mano, KaTeX, español neutro, cobertura de la práctica (los huecos se
// REPORTAN, no se rellenan) y la migración generada byte a byte.
// Regenerar la migración: ESTADISTICA_ESCRIBIR_SQL=1 npx vitest run src/lib/estadistica/lecciones

const raiz = path.resolve(__dirname, "../../../..");
const NUMERO_MIGRACION = "0218";
const rutaMigracion = path.join(raiz, "supabase", "migrations", `${NUMERO_MIGRACION}_estadistica_visuales.sql`);
const rutaSembrado = path.join(raiz, "supabase", "migrations", "0191_estadistica_contenido.sql");

const LECCIONES = [...TECNICAS_ESTADISTICA, ...CLASES_ESTADISTICA];
const porSlug = (slug: string) => LECCIONES.find((l) => l.slug === slug)!;
const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_ESTADISTICA)]);

const T = {
  media: "estadistica-media-desde-una-media-provisoria",
  mediana: "estadistica-mediana-por-posicion",
  cuartiles: "estadistica-cuartiles-por-mitades",
  combinatoria: "estadistica-combinatoria-sin-factoriales-enormes",
  varianza: "estadistica-varianza-con-desvios",
} as const;
const C = {
  datos: "estadistica-clase-1-datos-y-tipos-de-variable",
  central: "estadistica-clase-2-tendencia-central",
  dispersion: "estadistica-clase-3-dispersion",
  probabilidad: "estadistica-clase-4-probabilidad",
  combinatoria: "estadistica-clase-5-combinatoria",
  z: "estadistica-clase-6-normal-z-y-percentiles",
  correlacion: "estadistica-clase-7-correlacion-y-regresion",
  graficos: "estadistica-clase-8-lectura-critica-de-graficos",
} as const;

// Preguntas de quiz por Clase: 3 sembradas en 0191 (idénticas) y, AL FINAL, las
// agregadas para cubrir lo que la práctica evalúa y la lección no enseñaba.
const PREGUNTAS_POR_CLASE: Record<string, number> = {
  [C.central]: 4, // + dato que falta
  [C.z]: 4, // + rango percentil
  [C.graficos]: 5, // + histograma acumulado y mayor aumento en líneas
};

function visualesDe<K extends VisualLeccionEstadistica["tipo"]>(slug: string, tipo: K): Extract<VisualLeccionEstadistica, { tipo: K }>[] {
  return porSlug(slug).visuales.filter((v) => v.tipo === tipo) as unknown as Extract<VisualLeccionEstadistica, { tipo: K }>[];
}

// Todos los textos visibles de una lección (para KaTeX y voseo).
function textos(l: (typeof LECCIONES)[number]): string[] {
  const t: string[] = [l.nombre, l.descripcion, ...l.pasos];
  if ("quiz" in l) for (const q of l.quiz) t.push(q.pregunta, ...q.opciones, q.respuesta, q.explicacion);
  for (const v of l.visuales) {
    if (v.titulo) t.push(v.titulo);
    if (v.tipo === "cuadros") for (const c of v.cuadros) t.push(...[c.texto, c.resaltar].filter((x): x is string => typeof x === "string"));
    if (v.tipo === "estadistica.arbol") {
      t.push(v.raiz);
      const recorrer = (ns: typeof v.ramas) => ns.forEach((n) => (t.push(n.etiqueta), n.hijos && recorrer(n.hijos)));
      recorrer(v.ramas);
    }
    if (v.tipo === "estadistica.grafico") t.push(v.grafico.titulo);
    if (v.tipo === "estadistica.desvios") t.push(v.etiquetaCentro);
  }
  return t;
}

function formulas(l: (typeof LECCIONES)[number]): string[] {
  const r: string[] = [];
  for (const t of textos(l)) for (const m of t.matchAll(/\$([^$]+)\$/g)) r.push(m[1]);
  for (const v of l.visuales) if (v.tipo === "cuadros") for (const c of v.cuadros) if (c.formula) r.push(c.formula);
  return r;
}

// ---------- Lo sembrado en 0191 ----------

interface Sembrada {
  slug: string;
  nombre: string;
  descripcion: string;
  contenido: { pasos: string[]; quiz?: { pregunta: string; opciones: string[]; respuesta: string; explicacion: string }[] };
  orden: number;
  requierePro: boolean;
}

function leerSembrado(): Sembrada[] {
  const sql = fs.readFileSync(rutaSembrado, "utf8").replace(/\r\n/g, "\n");
  const patron = /\('([^']+)', '((?:[^']|'')*)',\n {2}'((?:[^']|'')*)',\n {2}'estadistica',\n {2}'((?:[^']|'')*)'::jsonb,\n {2}(\d+), (true|false)\)/g;
  const filas: Sembrada[] = [];
  for (const m of sql.matchAll(patron)) {
    filas.push({
      slug: m[1],
      nombre: m[2].replace(/''/g, "'"),
      descripcion: m[3].replace(/''/g, "'"),
      contenido: JSON.parse(m[4].replace(/''/g, "'")),
      orden: Number(m[5]),
      requierePro: m[6] === "true",
    });
  }
  return filas;
}

// Las ÚNICAS diferencias de texto entre lo sembrado en 0191 y estas
// lecciones: voseo rioplatense pasado a español neutro. Palabra sembrada ->
// palabra corregida.
const REEMPLAZOS_VOSEO: [string, string][] = [
  ["suponé", "supón"],
  ["anotá", "anota"],
  ["Ordená", "Ordena"],
  ["Partí", "Parte"],
  ["partí", "parte"],
  ["Cancelá", "Cancela"],
  ["cancelá", "cancela"],
  ["calculá", "calcula"],
  ["preguntate", "pregúntate"],
  ["cambiá", "cambia"],
  ["desconfiá", "desconfía"],
  ["acá", "aquí"],
];
function neutro(texto: string): string {
  let r = texto;
  for (const [a, b] of REEMPLAZOS_VOSEO) r = r.replace(new RegExp(`(?<![\\p{L}\\p{N}_])${a}(?![\\p{L}\\p{N}_])`, "gu"), b);
  return r;
}

describe("Estadística: estructura de las Técnicas y Clases", () => {
  it("son 5 Técnicas gratis y 8 Clases Pro, con orden global 1-13, slugs únicos y con prefijo", () => {
    expect(TECNICAS_ESTADISTICA).toHaveLength(5);
    expect(CLASES_ESTADISTICA).toHaveLength(8);
    expect(TECNICAS_ESTADISTICA.every((t) => t.requierePro === false)).toBe(true);
    expect(CLASES_ESTADISTICA.every((c) => c.requierePro === true)).toBe(true);
    expect(LECCIONES.map((l) => l.orden)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(new Set(LECCIONES.map((l) => l.slug)).size).toBe(13);
    for (const l of LECCIONES) expect(l.slug, l.slug).toMatch(/^estadistica-[a-z0-9-]+$/);
    for (const c of CLASES_ESTADISTICA) expect(c.slug, c.slug).toMatch(/^estadistica-clase-\d-/);
  });

  it("cada Clase tiene un quiz (3 preguntas sembradas y, al final, las agregadas para cubrir huecos de la práctica) cuya respuesta es una de las opciones (sin opciones repetidas) y una explicación", () => {
    for (const c of CLASES_ESTADISTICA) {
      expect(c.quiz, c.slug).toHaveLength(PREGUNTAS_POR_CLASE[c.slug] ?? 3);
      for (const q of c.quiz) {
        expect(q.opciones, `${c.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size, `${c.slug}: ${q.pregunta}`).toBe(q.opciones.length);
        expect(q.opciones.length).toBeGreaterThanOrEqual(3);
        expect(q.explicacion.length, `${c.slug}: ${q.pregunta}`).toBeGreaterThan(10);
      }
    }
  });
});

// Pasos agregados (al final) a lecciones sembradas: los huecos de cobertura de
// la práctica que ahora se enseñan.
const PASOS_NUEVOS: Record<string, number> = {
  [C.central]: 2, // dato que falta (dos métodos)
  [C.z]: 2, // rango percentil y su comprobación
  [C.graficos]: 4, // entrenamiento con barras, líneas (2) e histogramas
};

describe("Estadística: lo sembrado en 0191 queda intacto (solo cambia el voseo y se agregan visuales)", () => {
  const sembradas = leerSembrado();

  it("0191 trae las 13 filas y se leyeron todas", () => {
    expect(sembradas).toHaveLength(13);
  });

  it("mismo slug, nombre, orden y requiere_pro que lo sembrado", () => {
    for (const s of sembradas) {
      const l = porSlug(s.slug);
      expect(l, s.slug).toBeDefined();
      expect(l.nombre, s.slug).toBe(s.nombre);
      expect(l.orden, s.slug).toBe(s.orden);
      expect(l.requierePro, s.slug).toBe(s.requierePro);
    }
  });

  it("descripción y pasos: los sembrados quedan idénticos una vez corregido el voseo y lo único nuevo son pasos AGREGADOS AL FINAL", () => {
    for (const s of sembradas) {
      const l = porSlug(s.slug);
      expect(l.descripcion, s.slug).toBe(neutro(s.descripcion));
      expect(l.pasos.slice(0, s.contenido.pasos.length), s.slug).toEqual(s.contenido.pasos.map(neutro));
      expect(l.pasos.length - s.contenido.pasos.length, s.slug).toBe(PASOS_NUEVOS[s.slug] ?? 0);
    }
  });

  it("las preguntas sembradas del quiz de cada Clase son IDÉNTICAS (mismo orden, opciones y respuesta correcta; las nuevas van solo al final) y las Técnicas no tienen quiz", () => {
    for (const s of sembradas) {
      const l = porSlug(s.slug);
      if ("quiz" in l) expect(l.quiz.slice(0, s.contenido.quiz!.length), s.slug).toEqual(s.contenido.quiz);
      else expect(s.contenido.quiz, s.slug).toBeUndefined();
    }
  });

  it("la corrección de voseo tocó solo 4 Técnicas y 2 Clases (las que traían voseo) y las demás quedaron literalmente iguales", () => {
    const cambiadas = sembradas
      .filter((s) => {
        const l = porSlug(s.slug);
        return [s.descripcion, ...s.contenido.pasos].join("\n") !== [l.descripcion, ...l.pasos.slice(0, s.contenido.pasos.length)].join("\n");
      })
      .map((s) => s.slug);
    expect(cambiadas).toEqual([T.media, T.mediana, T.cuartiles, T.combinatoria, C.combinatoria, C.graficos]);
  });
});

describe("Estadística: visuales de cada lección", () => {
  it("TODA Técnica y Clase tiene al menos un visual (bug de Geografía)", () => {
    for (const l of LECCIONES) expect(l.visuales.length, l.slug).toBeGreaterThanOrEqual(1);
    const total = LECCIONES.reduce((a, l) => a + l.visuales.length, 0);
    expect(total).toBe(50);
  });

  it("cada visual tiene un tipo conocido, `despuesDePaso` dentro de los pasos y forma válida", () => {
    for (const l of LECCIONES) {
      for (const v of l.visuales) {
        expect(esVisualLeccion(v), l.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${l.slug}: ${v.tipo}`).toBe(true);
        expect(v.despuesDePaso, `${l.slug} ${v.tipo}`).toBeDefined();
        expect(Number.isInteger(v.despuesDePaso) && v.despuesDePaso! >= 0 && v.despuesDePaso! < l.pasos.length, `${l.slug} ${v.tipo} despuesDePaso`).toBe(true);
        expect(v.titulo, `${l.slug} ${v.tipo}`).toBeTruthy();
      }
    }
  });

  it("los datos de cada visual son válidos para su componente", () => {
    for (const l of LECCIONES) {
      for (const v of l.visuales as VisualLeccionEstadistica[]) {
        const donde = `${l.slug} ${v.tipo}`;
        switch (v.tipo) {
          case "estadistica.ordenar":
            expect(esListaNumeros(v.datos), donde).toBe(true);
            if (v.resaltar === "posicion") expect(Number.isInteger(v.posicion) && v.posicion! >= 1 && v.posicion! <= v.datos.length, donde).toBe(true);
            break;
          case "estadistica.frecuencias":
            expect(esListaNumeros(v.datos), donde).toBe(true);
            break;
          case "estadistica.desvios":
            expect(esListaNumeros(v.datos, 1), donde).toBe(true);
            expect(v.etiquetaCentro.length, donde).toBeGreaterThan(0);
            break;
          case "estadistica.dispersion":
            expect(esListaNumeros(v.x) && esListaNumeros(v.y) && v.x.length === v.y.length, donde).toBe(true);
            break;
          case "estadistica.arbol":
            expect(esRamas(v.ramas), donde).toBe(true);
            break;
          case "estadistica.grafico":
            expect(esGraficoEstadistica(v.grafico), donde).toBe(true);
            break;
          case "estadistica.normal":
            expect(v.sigma, donde).toBeGreaterThan(0);
            break;
          case "cuadros":
            expect(v.cuadros.length, donde).toBeGreaterThan(0);
            break;
        }
      }
    }
  });

  it("se usan los 7 visuales propios de Estadística y el primitivo de cuadros", () => {
    const usados = new Set(LECCIONES.flatMap((l) => l.visuales.map((v) => v.tipo)));
    expect([...usados].sort()).toEqual(["cuadros", ...Object.keys(REGISTRO_VISUALES_ESTADISTICA)].sort());
  });
});

// Valores esperados HECHOS A MANO (no salen de ninguna función del proyecto).
describe("Estadística: lo que muestran los visuales, verificado a mano", () => {
  it("Técnica 1: media provisoria 60 con 61, 64, 58, 67, 60 (diferencias +1 +4 −2 +7 0, suma 10, 10/5 = 2, media 62)", () => {
    const [v] = visualesDe(T.media, "estadistica.desvios");
    expect(v.datos).toEqual([61, 64, 58, 67, 60]);
    expect(v.centro).toBe(60);
    expect(v.datos.map((d) => d - v.centro)).toEqual([1, 4, -2, 7, 0]);
    expect(v.datos.reduce((a, d) => a + (d - v.centro), 0)).toBe(10);
    expect(v.centro + 10 / 5).toBe(62);
    expect((61 + 64 + 58 + 67 + 60) / 5).toBe(62);
  });

  it("Técnica 2: medianas 7 (n = 7, posición 4), 8 (n = 4) y 8 con el extremo en 120", () => {
    const vs = visualesDe(T.mediana, "estadistica.ordenar");
    expect(vs.map((v) => [...v.datos].sort((a, b) => a - b))).toEqual([
      [1, 3, 5, 7, 8, 9, 11],
      [4, 7, 9, 12],
      [4, 7, 9, 120],
    ]);
    // Hechas a mano: el 4.º de 7 es el 7; el promedio de 7 y 9 es 8; lo mismo con el 120 (no cambia los centrales).
    expect([7, (7 + 9) / 2, (7 + 9) / 2]).toEqual([7, 8, 8]);
    expect(vs.every((v) => v.resaltar === "mediana")).toBe(true);
  });

  it("Técnica 3: cuartiles por mitades (2, 4, 4, 5 | 7, 8, 9, 12 y 1, 3, 4 | 6 | 8, 9, 11)", () => {
    const vs = visualesDe(T.cuartiles, "estadistica.ordenar");
    expect(vs.map((v) => v.datos)).toEqual([
      [2, 4, 4, 5, 7, 8, 9, 12],
      [1, 3, 4, 6, 8, 9, 11],
    ]);
    // Q1 = (4+4)/2 = 4, Q3 = (8+9)/2 = 8.5, IQR = 4.5; Q1 = 3, Q3 = 9, IQR = 6.
    expect([(4 + 4) / 2, (8 + 9) / 2, (8 + 9) / 2 - (4 + 4) / 2]).toEqual([4, 8.5, 4.5]);
    expect([3, 9, 9 - 3]).toEqual([3, 9, 6]);
    expect(vs.every((v) => v.resaltar === "cuartiles")).toBe(true);
  });

  it("Técnica 4 (cuadros): C(10,3) = 120, C(10,8) = 45, P(8,3) = 336 y C(8,3) = 56, con el triángulo de Pascal", () => {
    const pascal = (n: number, r: number): number => (r === 0 || r === n ? 1 : pascal(n - 1, r - 1) + pascal(n - 1, r));
    const cuadros = visualesDe(T.combinatoria, "cuadros");
    const resaltados = cuadros.map((c) => c.cuadros.map((x) => x.resaltar).filter(Boolean).join(""));
    expect(resaltados).toEqual([`$= ${pascal(10, 3)}$`, `$= ${pascal(10, 8)}$`, "$= 336$", `$= ${pascal(8, 3)}$`]);
    expect([pascal(10, 3), pascal(10, 8), pascal(8, 3)]).toEqual([120, 45, 56]);
    expect(8 * 7 * 6).toBe(336);
    // La fórmula muestra los factores hacia abajo y el divisor r!.
    const formulas0 = cuadros[0].cuadros.map((x) => x.formula).filter(Boolean)[0]!;
    expect(formulas0).toBe("C(10, 3) = \\dfrac{10 \\cdot 9 \\cdot 8}{3 \\cdot 2 \\cdot 1} = \\dfrac{720}{6}");
    expect(10 * 9 * 8).toBe(720);
  });

  it("Técnica 5: 2, 4, 4, 4, 5, 5, 7, 9 con media 5; cuadrados 9, 1, 1, 1, 0, 0, 4, 16 (suma 32, σ² = 4, σ = 2)", () => {
    const [v] = visualesDe(T.varianza, "estadistica.desvios");
    expect(v.mostrarCuadrados).toBe(true);
    const suma = v.datos.reduce((a, d) => a + d, 0);
    expect(suma).toBe(40);
    expect(suma / v.datos.length).toBe(5);
    expect(v.centro).toBe(5);
    const cuadrados = [9, 1, 1, 1, 0, 0, 4, 16];
    expect(v.datos.map((d) => (d - 5) ** 2)).toEqual(cuadrados);
    expect(cuadrados.reduce((a, b) => a + b, 0)).toBe(32);
    expect(32 / 8).toBe(4);
  });

  it("Clase 2: sueldos 3, 5, 5, 7, 50 (media 14, mediana 5, moda 5) y la tabla 1, 2, 3 con frecuencias 2, 5, 3 (media 2.1, moda 2)", () => {
    const [ord] = visualesDe(C.central, "estadistica.ordenar");
    expect(ord.datos).toEqual([3, 5, 5, 7, 50]);
    const [frec, tabla] = visualesDe(C.central, "estadistica.frecuencias");
    expect(frec.datos).toEqual([3, 5, 5, 7, 50]);
    expect((3 + 5 + 5 + 7 + 50) / 5).toBe(14);
    expect(frec.datos.filter((d) => d === 5)).toHaveLength(2);
    expect(tabla.datos).toEqual([1, 1, 2, 2, 2, 2, 2, 3, 3, 3]);
    expect((1 * 2 + 2 * 5 + 3 * 3) / 10).toBe(2.1);
    expect(frec.mostrarMedia && tabla.mostrarMedia).toBe(true);
    const [des] = visualesDe(C.central, "estadistica.desvios");
    expect(des.centro).toBe(14);
    // Desviaciones respecto de la media: −11, −9, −9, −7, +36 (suman 0).
    expect(des.datos.map((d) => d - 14)).toEqual([-11, -9, -9, -7, 36]);
    expect(-11 - 9 - 9 - 7 + 36).toBe(0);
  });

  it("Clase 3: suma de cuadrados 2 (4, 5, 6), 50 (0, 5, 10), 40 (4, 8, 6, 5, 12 con media 7) y 160 (los datos por 2, media 14)", () => {
    const vs = visualesDe(C.dispersion, "estadistica.desvios");
    expect(vs.map((v) => v.datos)).toEqual([[4, 5, 6], [0, 5, 10], [4, 8, 6, 5, 12], [8, 16, 12, 10, 24]]);
    expect(vs.map((v) => v.centro)).toEqual([5, 5, 7, 14]);
    // El centro de cada visual ES la media de sus datos (calculada a mano: 15/3, 15/3, 35/5, 70/5).
    expect([15 / 3, 15 / 3, 35 / 5, 70 / 5]).toEqual([5, 5, 7, 14]);
    // Cuadrados hechos a mano.
    expect([1 + 0 + 1, 25 + 0 + 25, 9 + 1 + 1 + 4 + 25, 36 + 4 + 4 + 16 + 100]).toEqual([2, 50, 40, 160]);
    // σ² poblacional 8 y muestral 10; con los datos por 2 la varianza se multiplica por 4 (8 -> 32).
    expect([40 / 5, 40 / 4, 160 / 5, (160 / 5) / (40 / 5)]).toEqual([8, 10, 32, 4]);
    expect(vs.every((v) => v.mostrarCuadrados)).toBe(true);
  });

  it("Clase 4: los árboles (3/10 y 5/10 con reposición; 24/40, 18/24 y 4/16 con la tabla) suman 1 en cada nodo y dan 15/100 y 18/40", () => {
    const [reposicion, tabla] = visualesDe(C.probabilidad, "estadistica.arbol");
    // Con reposición: 3 rojas de 10; 5 azules de 10 en cada extracción.
    expect(reposicion.ramas.map((r) => r.probabilidad)).toEqual([3 / 10, 7 / 10]);
    for (const r of reposicion.ramas) expect(r.hijos!.map((h) => h.probabilidad)).toEqual([5 / 10, 5 / 10]);
    expect(3 / 10 * (5 / 10)).toBeCloseTo(15 / 100, 12);
    // Tabla: 18 estudiaron y aprobaron, 6 estudiaron y reprobaron, 4 no estudiaron y aprobaron, 12 no estudiaron y reprobaron.
    expect(tabla.ramas.map((r) => r.probabilidad)).toEqual([24 / 40, 16 / 40]);
    expect(tabla.ramas[0].hijos!.map((h) => h.probabilidad)).toEqual([18 / 24, 6 / 24]);
    expect(tabla.ramas[1].hijos!.map((h) => h.probabilidad)).toEqual([4 / 16, 12 / 16]);
    expect((24 / 40) * (18 / 24)).toBeCloseTo(18 / 40, 12);
    for (const a of [reposicion, tabla]) {
      expect(a.ramas.reduce((s, r) => s + r.probabilidad, 0)).toBeCloseTo(1, 12);
      for (const r of a.ramas) expect(r.hijos!.reduce((s, h) => s + h.probabilidad, 0)).toBeCloseTo(1, 12);
    }
  });

  it("Clase 5 (cuadros): 3·4 = 12, 5! = 120, P(8,3) = 336, C(8,3) = 56, C(10,2) = 45, C(4,2) = 6, 6/45 = 2/15, 4·6 = 24 y 24/45 = 8/15", () => {
    const resaltados = visualesDe(C.combinatoria, "cuadros").map((c) => c.cuadros.map((x) => x.resaltar).filter(Boolean).join(" | "));
    expect(resaltados).toEqual([
      "$= 12$ conjuntos",
      "$= 120$",
      "$= 336$",
      "$= 56$",
      "$= \\dfrac{2}{15}$",
      "$= \\dfrac{8}{15}$",
    ]);
    expect(3 * 4).toBe(12);
    expect(5 * 4 * 3 * 2 * 1).toBe(120);
    expect(8 * 7 * 6).toBe(336);
    expect((8 * 7 * 6) / (3 * 2 * 1)).toBe(56);
    expect((10 * 9) / 2).toBe(45);
    expect((4 * 3) / 2).toBe(6);
    expect(6 * 15).toBe(2 * 45); // 6/45 = 2/15
    expect(4 * 6).toBe(24);
    expect(24 * 15).toBe(8 * 45); // 24/45 = 8/15
  });

  it("Clase 6: z = 2 y −1 con μ = 70, σ = 8; z = 1 (Matemática) y 1.5 (Lengua); percentiles 70 y 25 de N = 10 en las posiciones 7 y 3 (valores 30 y 18)", () => {
    const desv = visualesDe(C.z, "estadistica.desvios");
    expect(desv.map((d) => [d.datos, d.centro, d.sigma])).toEqual([
      [[86, 62], 70, 8],
      [[78], 70, 8],
      [[84], 75, 6],
    ]);
    expect([(86 - 70) / 8, (62 - 70) / 8, (78 - 70) / 8, (84 - 75) / 6]).toEqual([2, -1, 1, 1.5]);
    const [normal] = visualesDe(C.z, "estadistica.normal");
    expect([normal.media, normal.sigma]).toEqual([100, 15]);
    expect([100 - 15, 100 + 15, 100 - 30, 100 + 30, 100 - 45, 100 + 45]).toEqual([85, 115, 70, 130, 55, 145]);
    const [p70, p25] = visualesDe(C.z, "estadistica.ordenar");
    expect(p70.datos).toEqual([12, 15, 18, 21, 24, 27, 30, 33, 36, 39]);
    // Posición ⌈P·N/100⌉ a mano: ⌈70·10/100⌉ = 7 y ⌈25·10/100⌉ = ⌈2.5⌉ = 3.
    expect([Math.ceil((70 * 10) / 100), Math.ceil((25 * 10) / 100)]).toEqual([7, 3]);
    expect([p70.posicion, p25.posicion]).toEqual([7, 3]);
    expect([p70.datos[6], p25.datos[2]]).toEqual([30, 18]);
  });

  it("Clase 7: x = 1..5, y = 1, 3, 2, 5, 4 (Sxy = 8, Sxx = 10, Syy = 10, r = 0.8, recta 0.6 + 0.8x, predicción 5.4) y la parábola con r = 0", () => {
    const [lineal, curva] = visualesDe(C.correlacion, "estadistica.dispersion");
    expect(lineal.x).toEqual([1, 2, 3, 4, 5]);
    expect(lineal.y).toEqual([1, 3, 2, 5, 4]);
    // A mano: x̄ = ȳ = 3; productos (−2)(−2), (−1)(0), (0)(−1), (1)(2), (2)(1) = 4, 0, 0, 2, 2.
    expect([4 + 0 + 0 + 2 + 2, 4 + 1 + 0 + 1 + 4, 4 + 0 + 1 + 4 + 1]).toEqual([8, 10, 10]);
    expect(8 / Math.sqrt(10 * 10)).toBe(0.8);
    expect(3 - 0.8 * 3).toBeCloseTo(0.6, 12);
    expect(0.6 + 0.8 * 6).toBeCloseTo(5.4, 12);
    // Parábola: ȳ = 2; productos (−2)(2), (−1)(−1), 0(−2), (1)(−1), (2)(2) = −4, 1, 0, −1, 4 -> Sxy = 0.
    expect(curva.y).toEqual([4, 1, 0, 1, 4]);
    expect([-4 + 1 + 0 - 1 + 4]).toEqual([0]);
    expect([lineal.mostrarRecta, curva.mostrarRecta]).toEqual([true, true]);
  });

  it("Clase 8: boxplot con cercas 10 y 90 (Q1 = 40, Q3 = 60, IQR = 20), bigotes dentro de las cercas y el 95 como atípico; 100 vs 104 es 4 % y con el eje en 96 las barras miden 4 y 8", () => {
    const [histograma, lineas, caja, honesto, cortado] = visualesDe(C.graficos, "estadistica.grafico").map((v) => v.grafico);
    if (caja.tipo !== "boxplot") throw new Error("se esperaba un boxplot");
    const iqr = caja.q3 - caja.q1;
    expect([caja.q1, caja.q3, iqr]).toEqual([40, 60, 20]);
    const cercaInf = caja.q1 - 1.5 * iqr;
    const cercaSup = caja.q3 + 1.5 * iqr;
    expect([cercaInf, cercaSup]).toEqual([10, 90]);
    expect(caja.min).toBeGreaterThanOrEqual(cercaInf);
    expect(caja.max).toBeLessThanOrEqual(cercaSup);
    expect(caja.atipicos).toEqual([95]);
    expect(caja.atipicos.every((a) => a < cercaInf || a > cercaSup)).toBe(true);
    expect(caja.mediana > caja.q1 && caja.mediana < caja.q3).toBe(true);
    expect(85 <= cercaSup && 95 > cercaSup).toBe(true); // "un dato en 95 es atípico; uno en 85 no"
    if (honesto.tipo !== "barras" || cortado.tipo !== "barras") throw new Error("se esperaban barras");
    expect(honesto.valores).toEqual([100, 104]);
    expect(cortado.valores).toEqual([100, 104]);
    expect((104 - 100) / 100).toBe(0.04);
    expect(honesto.eje.min).toBe(0);
    expect(cortado.eje.min).toBe(96);
    expect([100 - cortado.eje.min, 104 - cortado.eje.min]).toEqual([4, 8]);
    expect(8 / 4).toBe(2);
    if (histograma.tipo !== "histograma") throw new Error("se esperaba un histograma");
    expect(histograma.limites).toEqual([10, 20, 30, 40]);
    expect(histograma.limites.length).toBe(histograma.frecuencias.length + 1);
    if (lineas.tipo !== "lineas") throw new Error("se esperaba un gráfico de líneas");
    // Tramo más empinado: Feb -> Mar (+16); los demás suben 4, 4 y 2.
    const saltos = lineas.valores.slice(1).map((v, i) => v - lineas.valores[i]);
    expect(saltos).toEqual([4, 16, 4, 2]);
  });

  it("Clase 2, dato que falta: media 8 con 5 datos, conocidos 4, 9, 11, 7 (suma 31), total 40, falta 9 y las desviaciones suman 0", () => {
    const cuadros = visualesDe(C.central, "cuadros").at(-1)!;
    expect(cuadros.despuesDePaso).toBe(7);
    // A mano: 8 · 5 = 40; 4 + 9 + 11 + 7 = 31; 40 − 31 = 9.
    expect(cuadros.cuadros.map((c) => c.resaltar).filter(Boolean)).toEqual(["$= 40$", "$= 9$ (el dato que falta)"]);
    expect(cuadros.cuadros.map((c) => c.formula).filter(Boolean)).toEqual(["8 \\cdot 5", "40 - 31"]);
    expect(cuadros.cuadros.map((c) => c.texto).join(" ")).toContain("$4 + 9 + 11 + 7 = 31$");
    const des = visualesDe(C.central, "estadistica.desvios").at(-1)!;
    expect(des.datos).toEqual([4, 9, 11, 7, 9]);
    expect(des.centro).toBe(8);
    // (4+9+11+7+9)/5 = 40/5 = 8 y las desviaciones −4, +1, +3, −1, +1 suman 0.
    expect((4 + 9 + 11 + 7 + 9) / 5).toBe(8);
    expect(-4 + 1 + 3 - 1 + 1).toBe(0);
    expect(des.datos.map((d) => d - 8)).toEqual([-4, 1, 3, -1, 1]);
  });

  it("Clase 6, rango percentil: de 12, 15, ..., 39 (N = 10) hay 8 datos menores o iguales que 33 -> 80 %, y coincide con el percentil 80 (posición 8)", () => {
    const [, , posicion] = visualesDe(C.z, "estadistica.ordenar");
    expect(posicion.datos).toEqual([12, 15, 18, 21, 24, 27, 30, 33, 36, 39]);
    // A mano, contando: 12, 15, 18, 21, 24, 27, 30 y 33 son ocho.
    expect(posicion.posicion).toBe(8);
    expect(posicion.datos[7]).toBe(33);
    expect(posicion.titulo).toContain("33");
    expect((8 / 10) * 100).toBe(80);
    expect(Math.ceil((80 * 10) / 100)).toBe(8); // el percentil 80 es la posición 8
    const cuadros = visualesDe(C.z, "cuadros").at(-1)!;
    expect(cuadros.cuadros.map((c) => c.formula).filter(Boolean)).toEqual(["\\dfrac{8}{10} \\cdot 100"]);
    expect(cuadros.cuadros.map((c) => c.resaltar).filter(Boolean)).toEqual(["$= 80$ %"]);
  });

  it("Clase 8, entrenamiento con barras: Norte 30, Sur 45, Este 20, Oeste 35 (mayor Sur, menor Este, Sur − Este = 25, total 130)", () => {
    const g = visualesDe(C.graficos, "estadistica.grafico")[5].grafico;
    if (g.tipo !== "barras") throw new Error("se esperaban barras");
    expect(g.categorias).toEqual(["Norte", "Sur", "Este", "Oeste"]);
    expect(g.valores).toEqual([30, 45, 20, 35]);
    expect(g.eje.min).toBe(0);
    expect(g.categorias[g.valores.indexOf(Math.max(...g.valores))]).toBe("Sur");
    expect(g.categorias[g.valores.indexOf(Math.min(...g.valores))]).toBe("Este");
    expect(45 - 20).toBe(25);
    expect(30 + 45 + 20 + 35).toBe(130);
    expect(g.valores.reduce((a, v) => a + v, 0)).toBe(130);
  });

  it("Clase 8, entrenamiento con líneas: 10, 20, 25, 40, 45 crece (saltos +10, +5, +15, +5: mayor aumento entre marzo y abril); 20, 40, 50, 30, 10 sube y baja; 30, 32, 30, 33, 31 casi constante", () => {
    const graficos = visualesDe(C.graficos, "estadistica.grafico").map((v) => v.grafico);
    const [crece, sube, constante] = graficos.slice(6, 9);
    if (crece.tipo !== "lineas" || sube.tipo !== "lineas" || constante.tipo !== "lineas") throw new Error("se esperaban líneas");
    expect(crece.valores).toEqual([10, 20, 25, 40, 45]);
    const saltos = crece.valores.slice(1).map((v, i) => v - crece.valores[i]);
    expect(saltos).toEqual([10, 5, 15, 5]);
    expect(saltos.indexOf(Math.max(...saltos))).toBe(2); // entre el punto 3 (Mar) y el 4 (Abr)
    expect(crece.etiquetas[2]).toBe("Mar");
    expect(crece.etiquetas[3]).toBe("Abr");
    expect(crece.valores[2]).toBe(25);
    expect(crece.etiquetas[crece.valores.indexOf(Math.max(...crece.valores))]).toBe("May");
    // Crece: cada punto supera al anterior (la práctica lo define así).
    expect(crece.valores.every((v, i) => i === 0 || v > crece.valores[i - 1])).toBe(true);
    // Sube y luego baja: sube hasta el 50 (marzo) y luego baja.
    expect(sube.valores).toEqual([20, 40, 50, 30, 10]);
    expect(sube.valores.indexOf(50)).toBe(2);
    expect(sube.valores.every((v, i) => i === 0 || v > sube.valores[i - 1])).toBe(false);
    expect(sube.valores.every((v, i) => i === 0 || v < sube.valores[i - 1])).toBe(false);
    // Casi constante: variación total 33 − 30 = 3 <= media guía = 10 / 2 = 5.
    expect(constante.valores).toEqual([30, 32, 30, 33, 31]);
    expect(Math.max(...constante.valores) - Math.min(...constante.valores)).toBe(3);
    expect(constante.eje.tick).toBe(10);
    expect(3 <= constante.eje.tick / 2).toBe(true);
    // Además el texto de la lección enseña las cuatro tendencias.
    const texto = porSlug(C.graficos).pasos.join("\n");
    for (const t of ["crece", "decrece", "sube y luego baja", "casi constante"]) expect(texto).toContain(t);
  });

  it("Clase 8, entrenamiento con histogramas: frecuencias 3, 8, 12, 7, 2 en clases de 10 (total 32, clase modal [20, 30) con 12, menores que 30: 23)", () => {
    const g = visualesDe(C.graficos, "estadistica.grafico")[9].grafico;
    if (g.tipo !== "histograma") throw new Error("se esperaba un histograma");
    expect(g.limites).toEqual([0, 10, 20, 30, 40, 50]);
    expect(g.frecuencias).toEqual([3, 8, 12, 7, 2]);
    expect(3 + 8 + 12 + 7 + 2).toBe(32);
    expect(g.frecuencias.reduce((a, f) => a + f, 0)).toBe(32);
    expect(g.frecuencias.indexOf(Math.max(...g.frecuencias))).toBe(2); // la clase [20, 30)
    expect(g.limites[2]).toBe(20);
    expect(g.limites[3]).toBe(30);
    expect(g.frecuencias.filter((f) => f === 12)).toHaveLength(1); // la clase modal es única
    expect(3 + 8 + 12).toBe(23); // menores que 30: las clases a la izquierda del límite 30
    expect(g.frecuencias.slice(0, g.limites.indexOf(30)).reduce((a, f) => a + f, 0)).toBe(23);
  });

  it("los datos de cada gráfico caben en su eje (min <= valor <= max)", () => {
    for (const v of visualesDe(C.graficos, "estadistica.grafico")) {
      const g = v.grafico;
      const valores = g.tipo === "barras" || g.tipo === "lineas" ? g.valores : g.tipo === "histograma" ? g.frecuencias : [g.min, g.q1, g.mediana, g.q3, g.max, ...g.atipicos];
      for (const x of valores) {
        expect(x, `${g.titulo}`).toBeGreaterThanOrEqual(g.eje.min);
        expect(x, `${g.titulo}`).toBeLessThanOrEqual(g.eje.max);
      }
    }
  });
});

describe("Estadística: afirmaciones numéricas del texto (verificadas con aritmética independiente)", () => {
  const pasos = (slug: string) => porSlug(slug).pasos.join("\n");
  const explic = (slug: string) => (("quiz" in porSlug(slug) ? (porSlug(slug) as (typeof CLASES_ESTADISTICA)[number]).quiz : []).map((q) => q.explicacion).join("\n"));

  const AFIRMACIONES: [string, string, () => boolean][] = [
    [T.media, "$61 + 64 + 58 + 67 + 60 = 310$ y $310 / 5 = 62$", () => 61 + 64 + 58 + 67 + 60 === 310 && 310 / 5 === 62],
    [T.media, "$1 + 4 - 2 + 7 + 0 = 10$", () => 1 + 4 - 2 + 7 + 0 === 10],
    [T.media, "$10 / 5 = 2$", () => 10 / 5 === 2],
    [T.mediana, "$\\dfrac{7+1}{2} = 4$", () => (7 + 1) / 2 === 4],
    [T.mediana, "mediana $= \\dfrac{7+9}{2} = 8$", () => (7 + 9) / 2 === 8],
    [T.cuartiles, "$Q_1 = \\dfrac{4+4}{2} = 4$", () => (4 + 4) / 2 === 4],
    [T.cuartiles, "$Q_3 = \\dfrac{8+9}{2} = 8.5$", () => (8 + 9) / 2 === 8.5],
    [T.cuartiles, "$IQR = 8.5 - 4 = 4.5$", () => 8.5 - 4 === 4.5],
    [T.cuartiles, "$Q_1 = 3$, $Q_3 = 9$ e $IQR = 6$", () => 9 - 3 === 6],
    [T.combinatoria, "$C(10, 3) = \\dfrac{10 \\cdot 9 \\cdot 8}{3 \\cdot 2 \\cdot 1} = \\dfrac{720}{6} = 120$", () => (10 * 9 * 8) / (3 * 2 * 1) === 120 && 10 * 9 * 8 === 720],
    [T.combinatoria, "$C(10, 8) = C(10, 2) = \\dfrac{10 \\cdot 9}{2 \\cdot 1} = 45$", () => (10 * 9) / (2 * 1) === 45],
    [T.combinatoria, "$P(8, 3) = 8 \\cdot 7 \\cdot 6 = 336$", () => 8 * 7 * 6 === 336],
    [T.combinatoria, "$C(8, 3) = \\dfrac{336}{6} = 56$", () => 336 / 6 === 56],
    [T.varianza, "la suma es $40$, hay $n = 8$ datos y la media es $\\bar{x} = 5$", () => 2 + 4 + 4 + 4 + 5 + 5 + 7 + 9 === 40 && 40 / 8 === 5],
    [T.varianza, "$9 + 1 + 1 + 1 + 0 + 0 + 4 + 16 = 32$", () => 9 + 1 + 1 + 1 + 0 + 0 + 4 + 16 === 32],
    [T.varianza, "$\\sigma^2 = \\dfrac{32}{8} = 4$", () => 32 / 8 === 4],
    [T.varianza, "$s^2 = \\dfrac{32}{7} \\approx 4.57$", () => Math.round((32 / 7) * 100) / 100 === 4.57],
    [C.central, "$\\dfrac{3+5+5+7+50}{5} = \\dfrac{70}{5} = 14$", () => (3 + 5 + 5 + 7 + 50) / 5 === 14],
    [C.central, "$\\dfrac{1 \\cdot 2 + 2 \\cdot 5 + 3 \\cdot 3}{10} = \\dfrac{21}{10} = 2.1$", () => (1 * 2 + 2 * 5 + 3 * 3) / 10 === 2.1],
    [C.dispersion, "$\\sigma^2 = \\dfrac{40}{5} = 8$ y $\\sigma = \\sqrt{8} \\approx 2.83$", () => Math.round(Math.sqrt(8) * 100) / 100 === 2.83],
    [C.dispersion, "$s^2 = \\dfrac{40}{4} = 10$ y $s = \\sqrt{10} \\approx 3.16$", () => Math.round(Math.sqrt(10) * 100) / 100 === 3.16],
    [C.dispersion, "$\\dfrac{35}{5} = 7$", () => 4 + 8 + 6 + 5 + 12 === 35],
    [C.probabilidad, "$\\dfrac{3}{10} \\cdot \\dfrac{5}{10} = \\dfrac{15}{100} = \\dfrac{3}{20}$", () => 15 * 20 === 3 * 100 && 3 * 5 === 15],
    [C.probabilidad, "$\\dfrac{3}{10} \\cdot \\dfrac{5}{9} = \\dfrac{15}{90} = \\dfrac{1}{6}$", () => 15 * 6 === 90],
    [C.probabilidad, "$P(\\text{aprobó} \\mid \\text{estudió}) = \\dfrac{18}{18+6} = \\dfrac{18}{24} = \\dfrac{3}{4}$", () => 18 / 24 === 3 / 4],
    [C.probabilidad, "\\dfrac{18}{18+4} = \\dfrac{18}{22} = \\dfrac{9}{11}$", () => 18 * 11 === 9 * 22],
    [C.combinatoria, "$P(8, 3) = 8 \\cdot 7 \\cdot 6 = 336$", () => 8 * 7 * 6 === 336],
    [C.combinatoria, "$C(8, 3) = \\dfrac{336}{3!} = \\dfrac{336}{6} = 56$", () => 336 / 6 === 56],
    [C.combinatoria, "$C(10, 2) = 45$", () => (10 * 9) / 2 === 45],
    [C.combinatoria, "$C(4, 2) = 6$", () => (4 * 3) / 2 === 6],
    [C.combinatoria, "$P = \\dfrac{6}{45} = \\dfrac{2}{15}$", () => 6 * 15 === 2 * 45],
    [C.combinatoria, "$P = \\dfrac{24}{45} = \\dfrac{8}{15}$", () => 24 * 15 === 8 * 45],
    [C.z, "$z = \\dfrac{86 - 70}{8} = 2$", () => (86 - 70) / 8 === 2],
    [C.z, "$z = \\dfrac{62 - 70}{8} = -1$", () => (62 - 70) / 8 === -1],
    [C.z, "$x = 70 + 1.5 \\cdot 8 = 82$", () => 70 + 1.5 * 8 === 82],
    [C.z, "entre $85$ y $115$ está el 68 %; entre $70$ y $130$, el 95 %", () => 100 - 15 === 85 && 100 + 15 === 115 && 100 - 30 === 70 && 100 + 30 === 130],
    [C.z, "$\\lceil 7 \\rceil = 7$, es decir $30$", () => Math.ceil((70 * 10) / 100) === 7 && 12 + 3 * (7 - 1) === 30],
    [C.z, "$\\lceil 2.5 \\rceil = 3$, es decir $18$", () => Math.ceil((25 * 10) / 100) === 3 && 12 + 3 * (3 - 1) === 18],
    [C.correlacion, "$S_{xy} = 8$", () => 4 + 0 + 0 + 2 + 2 === 8],
    [C.correlacion, "$r = \\dfrac{8}{\\sqrt{10 \\cdot 10}} = \\dfrac{8}{10} = 0.8$", () => 8 / Math.sqrt(100) === 0.8],
    [C.correlacion, "$a = \\bar{y} - b\\bar{x} = 3 - 0.8 \\cdot 3 = 0.6$", () => Math.abs(3 - 0.8 * 3 - 0.6) < 1e-12],
    [C.correlacion, "$\\hat{y} = 0.6 + 0.8 \\cdot 6 = 5.4$", () => Math.abs(0.6 + 0.8 * 6 - 5.4) < 1e-12],
    [C.graficos, "$IQR = 20$ y las cercas quedan en $40 - 30 = 10$ y $60 + 30 = 90$", () => 60 - 40 === 20 && 40 - 1.5 * 20 === 10 && 60 + 1.5 * 20 === 90],
    [C.graficos, "$\\dfrac{104 - 100}{100} = 0.04$", () => (104 - 100) / 100 === 0.04],
    [C.graficos, "$100 - 96 = 4$ unidades de alto y la de $104$ mide $104 - 96 = 8$", () => 100 - 96 === 4 && 104 - 96 === 8],
    [C.central, "Suma total: $8 \\cdot 5 = 40$", () => 8 * 5 === 40],
    [C.central, "$4 + 9 + 11 + 7 = 31$", () => 4 + 9 + 11 + 7 === 31],
    [C.central, "$40 - 31 = 9$", () => 40 - 31 === 9],
    [C.central, "Las de los datos conocidos son $-4, +1, +3, -1$ y suman $-1$", () => 4 - 8 === -4 && 9 - 8 === 1 && 11 - 8 === 3 && 7 - 8 === -1 && -4 + 1 + 3 - 1 === -1],
    [C.central, "$\\dfrac{4+9+11+7+9}{5} = \\dfrac{40}{5} = 8$", () => (4 + 9 + 11 + 7 + 9) / 5 === 8],
    [C.z, "hay $8$ datos menores o iguales ($12, 15, 18, 21, 24, 27, 30, 33$), así que $\\dfrac{8}{10} \\cdot 100 = 80$ %", () => [12, 15, 18, 21, 24, 27, 30, 33, 36, 39].filter((d) => d <= 33).length === 8 && (8 / 10) * 100 === 80],
    [C.z, "$\\lceil 80 \\cdot 10 / 100 \\rceil = 8$, es decir $33$", () => Math.ceil((80 * 10) / 100) === 8 && 12 + 3 * (8 - 1) === 33],
    [C.graficos, "Total: $30 + 45 + 20 + 35 = 130$", () => 30 + 45 + 20 + 35 === 130],
    [C.graficos, "Sur menos Este es $45 - 20 = 25$ unidades", () => 45 - 20 === 25],
    [C.graficos, "$+10, +5, +15, +5$; el más grande es $+15$", () => 20 - 10 === 10 && 25 - 20 === 5 && 40 - 25 === 15 && 45 - 40 === 5],
    [C.graficos, "la variación es $33 - 30 = 3$", () => 33 - 30 === 3],
    [C.graficos, "$3 + 8 + 12 + 7 + 2 = 32$", () => 3 + 8 + 12 + 7 + 2 === 32],
    [C.graficos, "$3 + 8 + 12 = 23$", () => 3 + 8 + 12 === 23],
  ];

  it.each(AFIRMACIONES.map((a, i) => [i + 1, a[0], a[1], a[2]] as const))("#%i %s: «%s»", (_i, slug, fragmento, comprobar) => {
    expect(pasos(slug), `no aparece el fragmento en ${slug}`).toContain(fragmento);
    expect(comprobar(), `la aritmética de «${fragmento}» no cierra`).toBe(true);
  });

  it("quiz de las Clases: respuestas verificadas a mano", () => {
    const quiz = (slug: string, i: number) => (porSlug(slug) as (typeof CLASES_ESTADISTICA)[number]).quiz[i];
    // Clase 2: media de 2, 4, 4, 6, 9 = 25 / 5 = 5; mediana de 3, 5, 8, 10 = 6.5.
    expect(quiz(C.central, 0).respuesta).toBe(`$${(2 + 4 + 4 + 6 + 9) / 5}$`);
    expect(quiz(C.central, 2).respuesta).toBe(`$${(5 + 8) / 2}$`);
    // Clase 3: varianza poblacional de 3, 5, 7, 9 (media 6): (9+1+1+9)/4 = 5; muestral 20/3.
    expect(quiz(C.dispersion, 0).respuesta).toBe(`$${(9 + 1 + 1 + 9) / 4}$`);
    expect(quiz(C.dispersion, 1).respuesta).toContain("6.67");
    expect(Math.round((20 / 3) * 100) / 100).toBe(6.67);
    // Clase 4: 3 primos (2, 3, 5) de 6 -> 1/2; 4/10 · 3/9 = 2/15; 15/20 = 3/4.
    expect(quiz(C.probabilidad, 0).respuesta).toBe("$\\dfrac{1}{2}$");
    expect(4 * 3 * 15).toBe(2 * 10 * 9);
    expect(quiz(C.probabilidad, 1).respuesta).toBe("$\\dfrac{2}{15}$");
    expect(quiz(C.probabilidad, 2).respuesta).toBe("$\\dfrac{3}{4}$");
    expect(15 / 20).toBe(3 / 4);
    // Clase 5: 4! = 24; P(6,2) = 30; C(7,3) = 35.
    expect([4 * 3 * 2 * 1, 6 * 5, (7 * 6 * 5) / (3 * 2 * 1)]).toEqual([24, 30, 35]);
    expect([quiz(C.combinatoria, 0).respuesta, quiz(C.combinatoria, 1).respuesta, quiz(C.combinatoria, 2).respuesta]).toEqual(["$24$", "$30$", "$35$"]);
    // Clase 6: z = (60 − 50)/5 = 2; ±2σ = 95 %; ⌈90·20/100⌉ = 18.
    expect(quiz(C.z, 0).respuesta).toBe(`$${(60 - 50) / 5}$`);
    expect(quiz(C.z, 1).respuesta).toBe("95 %");
    expect(quiz(C.z, 2).respuesta).toBe(`La posición ${Math.ceil((90 * 20) / 100)}`);
    // Clase 7: r = −12 / √(10 · 14.4) = −12/12 = −1; ŷ = 2 + 3·4 = 14.
    expect(-12 / Math.sqrt(10 * 14.4)).toBeCloseTo(-1, 12);
    expect(quiz(C.correlacion, 0).respuesta).toBe("$-1$");
    expect(quiz(C.correlacion, 1).respuesta).toBe(`$${2 + 3 * 4}$`);
    // Clase 8: (55 − 50)/50 = 10 %; cerca superior 50 + 1.5·20 = 80; el 20 va en [20, 30).
    expect(quiz(C.graficos, 0).respuesta).toBe(`${((55 - 50) / 50) * 100} %`);
    expect(quiz(C.graficos, 1).respuesta).toBe(`Mayor que $${50 + 1.5 * (50 - 30)}$`);
    expect(explic(C.graficos)).toContain("[20, 30)");
    // Preguntas agregadas al final. Clase 2: 10 · 4 = 40 y 40 − (8 + 12 + 9) = 11.
    expect(10 * 4 - (8 + 12 + 9)).toBe(11);
    expect(quiz(C.central, 3).respuesta).toBe(`$${10 * 4 - (8 + 12 + 9)}$`);
    // Clase 6: 15 de 20 = 75 %.
    expect(quiz(C.z, 3).respuesta).toBe(`${(15 / 20) * 100} %`);
    // Clase 8: menores que 20 en [0, 10), [10, 20), [20, 30) con 3, 8, 12 -> 3 + 8 = 11; saltos de 20, 35, 30, 50, 45: +15, −5, +20, −5 -> entre marzo y abril.
    expect(quiz(C.graficos, 3).respuesta).toBe(`$${3 + 8}$`);
    const saltosQuiz = [35 - 20, 30 - 35, 50 - 30, 45 - 50];
    expect(saltosQuiz).toEqual([15, -5, 20, -5]);
    expect(saltosQuiz.indexOf(Math.max(...saltosQuiz))).toBe(2);
    expect(quiz(C.graficos, 4).respuesta).toBe("Entre marzo y abril");
  });

  it("las fórmulas C(n, r) y P(n, r) del texto coinciden con el triángulo de Pascal (verificación general por regex)", () => {
    const pascal = (n: number, r: number): number => (r === 0 || r === n ? 1 : pascal(n - 1, r - 1) + pascal(n - 1, r));
    const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
    let revisadas = 0;
    for (const l of LECCIONES) {
      const texto = [...l.pasos, ...("quiz" in l ? l.quiz.map((q) => q.explicacion) : [])].join("\n");
      for (const m of texto.matchAll(/\$C\((\d+), (\d+)\)[^$]*?= (\d+)\$/g)) {
        expect(Number(m[3]), `${l.slug}: ${m[0]}`).toBe(pascal(Number(m[1]), Number(m[2])));
        revisadas++;
      }
      for (const m of texto.matchAll(/\$P\((\d+), (\d+)\)[^$]*?= (\d+)\$/g)) {
        expect(Number(m[3]), `${l.slug}: ${m[0]}`).toBe(pascal(Number(m[1]), Number(m[2])) * factorial(Number(m[2])));
        revisadas++;
      }
    }
    expect(revisadas).toBeGreaterThanOrEqual(6);
  });
});

describe("Estadística: KaTeX y español neutro", () => {
  it("todas las fórmulas de las 13 lecciones (texto, quiz y visuales) compilan con KaTeX", () => {
    let total = 0;
    for (const l of LECCIONES) {
      for (const f of formulas(l)) {
        expect(() => katex.renderToString(f, { throwOnError: true }), `${l.slug}: ${f}`).not.toThrow();
        total++;
      }
    }
    expect(total).toBeGreaterThan(300);
  });

  it("los `$` de cada texto están balanceados (cantidad par)", () => {
    for (const l of LECCIONES) for (const t of textos(l)) expect((t.match(/\$/g) ?? []).length % 2, `${l.slug}: ${t}`).toBe(0);
  });

  it("cero voseo: ni el detector del proyecto ni un chequeo más amplio de imperativos con acento final (-á, -é, -í) lo encuentran", () => {
    // Palabras normales del español que terminan en vocal acentuada y NO son voseo.
    const permitidas = new Set(["qué", "así", "está", "aquí", "sí", "comité", "allí", "cómo", "dónde", "cuál", "más", "también", "además", "después", "según", "quién", "cuándo"]);
    for (const l of LECCIONES) {
      for (const t of textos(l)) {
        expect(detectarVoseo(t), `${l.slug}: ${t}`).toEqual([]);
        for (const m of t.matchAll(/(?<![\p{L}\p{N}_$\\])[\p{L}]{3,}[áéí](?![\p{L}\p{N}_])/gu)) {
          expect(permitidas.has(m[0].toLowerCase()), `${l.slug}: posible voseo «${m[0]}» en «${t}»`).toBe(true);
        }
      }
    }
  });
});

describe("Estadística: cobertura práctica <-> lecciones (cada tipo evaluado se enseña; un hueco nuevo se REPORTA)", () => {
  type Nivel = "cubierto" | "parcial" | "hueco";
  interface Entrada {
    nivel: Nivel;
    // Lecciones que lo enseñan (vacío en los huecos).
    slugs: string[];
    // Debe aparecer en los pasos de esas lecciones (cubierto/parcial) o en NINGUNA lección (hueco).
    palabra: RegExp;
    nota?: string;
  }
  const c = (nivel: Nivel, slugs: string[], palabra: RegExp, nota?: string): Entrada => ({ nivel, slugs, palabra, nota });
  // Cada TipoProblemaEstadistica de src/lib/estadistica/tipos.ts tiene que estar
  // acá (el tipo Record lo obliga a compilar): un tipo nuevo de práctica sin
  // decisión sobre su lección rompe este test.
  const COBERTURA: Record<TipoProblemaEstadistica, Entrada> = {
    media: c("cubierto", [C.central, T.media], /Media: /),
    mediana: c("cubierto", [C.central, T.mediana], /Mediana: /),
    moda: c("cubierto", [C.central], /Moda: /),
    rango: c("cubierto", [C.dispersion], /Rango: /),
    media_frecuencias: c("cubierto", [C.central], /Tabla de frecuencias/),
    dato_faltante: c("cubierto", [C.central], /Dato que falta: /),
    iqr: c("cubierto", [T.cuartiles, C.dispersion], /IQR = Q_3 - Q_1/),
    varianza_poblacional: c("cubierto", [C.dispersion, T.varianza], /Varianza poblacional/),
    desvio_poblacional: c("cubierto", [C.dispersion, T.varianza], /desvío estándar/),
    varianza_muestral: c("cubierto", [C.dispersion], /Varianza muestral/),
    desvio_muestral: c("cubierto", [C.dispersion], /s = \\sqrt\{10\}/),
    transformacion_varianza: c("cubierto", [C.dispersion], /Efecto de transformar los datos/),
    transformacion_desvio: c("cubierto", [C.dispersion], /multiplica el desvío por \$\|k\|\$/),
    prob_simple: c("cubierto", [C.probabilidad], /casos favorables/),
    prob_dado: c("cubierto", [C.probabilidad], /casos favorables/, "Es probabilidad simple; el dado solo aparece en el quiz de la Clase 4."),
    prob_complemento: c("cubierto", [C.probabilidad], /Complemento/),
    prob_independientes: c("cubierto", [C.probabilidad], /independientes/),
    prob_condicional_tabla: c("cubierto", [C.probabilidad], /Probabilidad condicional/),
    prob_sin_reposicion: c("cubierto", [C.probabilidad], /Sin reposición/),
    prob_combinatoria: c("cubierto", [C.combinatoria], /Combinatoria y probabilidad/),
    factorial: c("cubierto", [C.combinatoria], /Factorial/),
    permutaciones: c("cubierto", [C.combinatoria, T.combinatoria], /Permutaciones/),
    combinaciones: c("cubierto", [C.combinatoria, T.combinatoria], /Combinaciones/),
    percentil: c("cubierto", [C.z], /Percentiles/),
    rango_percentil: c("cubierto", [C.z], /Rango percentil \(el camino inverso\)/),
    z_score: c("cubierto", [C.z], /Puntaje z/),
    z_inverso: c("cubierto", [C.z], /Inverso: /),
    z_comparar: c("cubierto", [C.z], /Comparar cosas distintas/),
    regla_empirica: c("cubierto", [C.z], /Regla empírica/),
    atipicos_cantidad: c("cubierto", [C.graficos], /Regla de atípicos/),
    atipicos_valor: c("cubierto", [C.graficos], /Regla de atípicos/),
    atipicos_cerca: c("cubierto", [C.graficos], /cercas/),
    correlacion_signo: c("cubierto", [C.correlacion], /Signo: /),
    regresion_pendiente: c("cubierto", [C.correlacion], /la pendiente es/),
    regresion_intercepto: c("cubierto", [C.correlacion], /el intercepto/),
    regresion_prediccion: c("cubierto", [C.correlacion], /Predicción para/),
    correlacion_r: c("cubierto", [C.correlacion], /Fórmula: \$r =/),
    grafico_valor: c("cubierto", [C.graficos], /Valor de una barra/),
    grafico_mayor: c("cubierto", [C.graficos], /Mayor y menor: la respuesta es la CATEGORÍA/),
    grafico_menor: c("cubierto", [C.graficos], /Mayor y menor: la respuesta es la CATEGORÍA/),
    grafico_diferencia: c("cubierto", [C.graficos], /Diferencia: Sur menos Este/),
    grafico_total: c("cubierto", [C.graficos], /Total: \$30 \+ 45/),
    grafico_tendencia: c("cubierto", [C.graficos], /la tendencia general/),
    grafico_mayor_aumento: c("cubierto", [C.graficos], /tramo más empinado/),
    histograma_total: c("cubierto", [C.graficos], /Total de datos: se suman las frecuencias/),
    histograma_clase_modal: c("cubierto", [C.graficos], /Clase modal: la de mayor frecuencia/),
    histograma_acumulado: c("cubierto", [C.graficos], /Datos menores que \$30\$: se suman las clases/),
    boxplot_valor: c("cubierto", [C.graficos], /Diagrama de caja: la caja va de/),
    boxplot_iqr: c("cubierto", [C.graficos], /Diagrama de caja: la caja va de/),
    boxplot_atipicos: c("cubierto", [C.graficos], /puntos sueltos son atípicos/),
    boxplot_porcentaje: c("cubierto", [C.graficos], /contiene el 50 % central/),
    engano_escala: c("cubierto", [C.graficos], /el eje debe empezar en/),
    engano_porcentaje: c("cubierto", [C.graficos], /diferencia real/),
    engano_aparente: c("cubierto", [C.graficos], /Gráfico engañoso por escala/),
  };

  const textoDe = (slugs: string[]) => slugs.map((s) => porSlug(s).pasos.join("\n")).join("\n");
  const todo = LECCIONES.map((l) => l.pasos.join("\n")).join("\n");

  it("cada tipo de problema tiene su entrada, los slugs existen y la palabra clave aparece en las lecciones (o en ninguna si es un hueco)", () => {
    for (const [tipo, e] of Object.entries(COBERTURA)) {
      for (const s of e.slugs) expect(porSlug(s), `${tipo}: slug ${s}`).toBeDefined();
      if (e.nivel === "hueco") {
        expect(e.slugs, tipo).toEqual([]);
        expect(todo, `${tipo} figura como hueco pero una lección lo enseña`).not.toMatch(e.palabra);
        expect(e.nota, tipo).toBeTruthy();
      } else {
        expect(textoDe(e.slugs), `${tipo}: no aparece ${e.palabra} en ${e.slugs.join(", ")}`).toMatch(e.palabra);
        if (e.nivel === "parcial") expect(e.nota, tipo).toBeTruthy();
      }
    }
  });

  it("todo tipo que generan los 5 modos de práctica (niveles 1-10) figura en la tabla de cobertura", () => {
    const vistos = new Set<string>();
    let semilla = 12345;
    const rng = () => {
      semilla = (semilla * 1664525 + 1013904223) % 4294967296;
      return semilla / 4294967296;
    };
    conRngSembrado(rng, () => {
      for (const modo of MODOS_ESTADISTICA as readonly ModoEstadistica[]) {
        for (let nivel = 1; nivel <= 10; nivel++) {
          for (let i = 0; i < 120; i++) vistos.add(generarProblemaEstadistica(modo, nivel).detalle.tipo);
        }
      }
    });
    for (const tipo of vistos) expect(Object.keys(COBERTURA), `el tipo de práctica «${tipo}» no está en la tabla de cobertura`).toContain(tipo);
    expect(vistos.size).toBeGreaterThanOrEqual(45);
  }, 60_000);

  it("INFORME de huecos: ya no queda ningún tipo de práctica sin lección ni enseñado solo en parte (un tipo nuevo sin cubrir rompe este test)", () => {
    const huecos = Object.entries(COBERTURA).filter(([, e]) => e.nivel === "hueco").map(([t]) => t);
    const parciales = Object.entries(COBERTURA).filter(([, e]) => e.nivel === "parcial").map(([t]) => t);
    expect(huecos).toEqual([]);
    expect(parciales).toEqual([]);
  });

  it("cada uno de los 5 modos de práctica tiene al menos una lección que lo enseña", () => {
    const porModo: Record<ModoEstadistica, string[]> = {
      central: [C.central, T.media, T.mediana],
      dispersion: [C.dispersion, T.cuartiles, T.varianza],
      probabilidad: [C.probabilidad, C.combinatoria, T.combinatoria],
      datos: [C.z, C.correlacion],
      graficos: [C.graficos],
    };
    for (const modo of MODOS_ESTADISTICA as readonly ModoEstadistica[]) {
      expect(porModo[modo].length, modo).toBeGreaterThan(0);
      for (const s of porModo[modo]) expect(porSlug(s), `${modo}: ${s}`).toBeDefined();
    }
  });
});

describe("Estadística: temas del sidebar (GRUPOS_APRENDER) cubren exactamente las lecciones", () => {
  it("cada Técnica y cada Clase aparece exactamente una vez en su pestaña y nada cae en «Otras»", () => {
    const g = GRUPOS_APRENDER.estadistica;
    for (const [lista, esperados] of [
      [g.tecnicas, TECNICAS_ESTADISTICA],
      [g.clases, CLASES_ESTADISTICA],
    ] as const) {
      const cubiertos = lista.flatMap((x) => x.slugs);
      expect(new Set(cubiertos).size).toBe(cubiertos.length);
      expect([...cubiertos].sort()).toEqual(esperados.map((l) => l.slug).sort());
    }
  });
});

describe("Estadística: la migración generada (0218)", () => {
  const esperado = generarSqlEstadistica({ cabecera: CABECERA_ESTADISTICA, tecnicas: TECNICAS_ESTADISTICA, clases: CLASES_ESTADISTICA });

  it("el archivo de la migración coincide byte a byte con lo generado desde las lecciones tipadas", () => {
    if (process.env.ESTADISTICA_ESCRIBIR_SQL === "1") fs.writeFileSync(rutaMigracion, esperado, "utf8");
    expect(fs.existsSync(rutaMigracion), `falta ${NUMERO_MIGRACION}: ESTADISTICA_ESCRIBIR_SQL=1 npx vitest run src/lib/estadistica/lecciones`).toBe(true);
    expect(fs.readFileSync(rutaMigracion, "utf8").replace(/\r\n/g, "\n")).toBe(esperado);
  });

  it("solo hace UPDATE por slug de las 13 filas de 'estadistica' (sin INSERT, ALTER, DELETE ni tocar progreso o skill_levels)", () => {
    const sql = esperado;
    const codigo = sql
      .split("\n")
      .filter((l) => !l.startsWith("--"))
      .join("\n");
    expect(sql.match(/^update public\.techniques$/gm)).toHaveLength(13);
    expect(sql.match(/^where slug = '[a-z0-9-]+' and problem_type = 'estadistica';$/gm)).toHaveLength(13);
    expect(codigo).not.toMatch(/\b(insert|alter|delete|drop|truncate|create)\b\s+(into|table|from|function|policy|index)/i);
    expect(codigo).not.toMatch(/technique_progress|skill_levels|requiere_pro\s*=|orden\s*=|nombre\s*=/);
    for (const l of LECCIONES) expect(sql, l.slug).toContain(`where slug = '${l.slug}' and problem_type = 'estadistica';`);
  });

  it("los UPDATE van en el orden de las lecciones (Técnicas y luego Clases) y cada `contenido` conserva pasos, visuales y quiz", () => {
    const orden = [...esperado.matchAll(/where slug = '([a-z0-9-]+)' and/g)].map((m) => m[1]);
    expect(orden).toEqual(LECCIONES.map((l) => l.slug));
    const bloques = [...esperado.matchAll(/\$estadistica\$(\{[\s\S]*?\})\$estadistica\$::jsonb/g)].map((m) => JSON.parse(m[1]));
    expect(bloques).toHaveLength(13);
    bloques.forEach((b, i) => {
      const l = LECCIONES[i];
      expect(b.pasos).toEqual(l.pasos);
      expect(b.visuales).toEqual(JSON.parse(JSON.stringify(l.visuales)));
      if ("quiz" in l) expect(b.quiz).toEqual(l.quiz);
      else expect(b.quiz).toBeUndefined();
    });
  });

  it("la etiqueta de dólares nunca aparece dentro del contenido (no puede cerrar el literal antes de tiempo)", () => {
    for (const l of LECCIONES) {
      const json = JSON.stringify(l);
      expect(json.includes("$estadistica$"), l.slug).toBe(false);
    }
  });
});
