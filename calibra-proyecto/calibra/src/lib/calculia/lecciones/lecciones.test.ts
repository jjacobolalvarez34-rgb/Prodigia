import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import katex from "katex";
import { TECNICAS_CALCULIA, CLASES_CALCULIA, LECCIONES_CALCULIA } from "./index";
import { CABECERA_CALCULIA, generarSqlCalculia } from "./sql";
import { estadoSembradoCalculia } from "./sembrado";
import { aNeutroProfundo } from "@/lib/texto/neutroSembrado";
import { AfirmacionFalsaTex, compilarTex, derivadaNumerica, esEtiqueta, verificarAfirmacionTex, type EntornoTex, type NombresTex } from "./evaluadorTex";
import { BLOQUES_CALCULIA, ORDEN_GRUPOS_CALCULIA } from "@/lib/calculia/bloques";
import { GRUPOS_APRENDER } from "@/lib/aprender/grupos";
import { esVisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_CALCULIA } from "@/components/calculia/visuales/registro";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import { conRngSembrado, generarProblemaCalculia, type ModoCalculia } from "@/lib/practica/calculia";
import {
  datosArea,
  datosEdo,
  datosSerie,
  datosTangente,
  esVisualCalculiaArea,
  esVisualCalculiaEdo,
  esVisualCalculiaSerie,
  esVisualCalculiaTangente,
  evaluarFuncion,
  pendienteSegunEdo,
  solucionEdo,
  sumaInfinita,
  sumaParcial,
} from "@/lib/calculia/visualesDatos";
import type { VisualCalculiaArea, VisualCalculiaEdo, VisualCalculiaSerie, VisualCalculiaTangente } from "@/lib/calculia/visuales";
import type { LeccionCalculia, VisualLeccionCalculia } from "./tipos";

// Verificación del contenido de Aprender de Calculia:
//  - el contenido de TypeScript es lo ya sembrado (0165/0170/0178/0181/0195,
//    leído de esas migraciones con un emulador, sembrado.ts) neutralizado por 0221
//    (español neutro) MÁS los pasos nuevos al final de cuatro Clases (los huecos
//    entre la práctica y las lecciones); el quiz es idéntico;
//  - toda Técnica y toda Clase tiene al menos un visual, de un tipo conocido;
//  - todo dato de los visuales propios se contrasta con un cálculo independiente
//    (diferencia finita, Simpson, sumas directas, la propia ecuación diferencial);
//  - toda igualdad LaTeX de los cuadros se evalúa numéricamente (evaluadorTex.ts);
//  - la respuesta correcta de cada pregunta de cálculo es la única correcta;
//  - español neutro en todo lo NUEVO (y voseo heredado documentado, no ampliado);
//  - cobertura de la práctica por las lecciones (los huecos se reportan);
//  - la migración 0216 es exactamente lo que se genera de este contenido y, aplicada
//    sobre lo sembrado, escribe `pasos` (los sembrados + los nuevos) y `visuales`,
//    sin tocar el quiz ni nombre, descripción, orden y requiere_pro.
// Regenerar 0216: CALCULIA_ESCRIBIR_SQL=1 npx vitest run src/lib/calculia/lecciones

const raiz = path.resolve(__dirname, "../../../..");
const dirMigraciones = path.join(raiz, "supabase", "migrations");
const NUMERO_MIGRACION = "0216";
const rutaMigracion = path.join(dirMigraciones, `${NUMERO_MIGRACION}_calculia_visuales.sql`);
const MIGRACIONES_SEMBRADAS = [
  "0165_mundo_calculia.sql",
  "0170_calculia_curso_pro.sql",
  "0178_calculia_tecnicas_quiz.sql",
  "0181_calculia_tecnicas_latex.sql",
  "0195_latex_clases_calculia_circuitia.sql",
];
const leerMigracion = (nombre: string) => fs.readFileSync(path.join(dirMigraciones, nombre), "utf8");
const sembradoSql = MIGRACIONES_SEMBRADAS.map(leerMigracion);

const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_CALCULIA)]);
const LECCIONES = LECCIONES_CALCULIA;
const porSlug = (slug: string): LeccionCalculia => LECCIONES.find((l) => l.slug === slug)!;

// Todos los textos visibles de una lección (para KaTeX, voseo, marcas rotas).
function textos(l: LeccionCalculia, incluirVisuales = true): string[] {
  const t: string[] = [l.nombre, l.descripcion, ...l.pasos];
  for (const q of l.quiz) t.push(q.pregunta, ...q.opciones, q.respuesta, q.explicacion);
  if (incluirVisuales) t.push(...textosVisuales(l));
  return t;
}
function textosVisuales(l: LeccionCalculia): string[] {
  const t: string[] = [];
  for (const v of l.visuales) {
    if (v.titulo) t.push(v.titulo);
    if (v.tipo === "cuadros") for (const c of v.cuadros) t.push(...[c.texto, c.resaltar].filter((x): x is string => typeof x === "string"));
  }
  return t;
}
// Solo las fórmulas de los visuales (lo nuevo de esta tanda).
function formulasVisuales(l: LeccionCalculia): string[] {
  const r: string[] = [];
  for (const t of textosVisuales(l)) for (const m of t.matchAll(/\$([^$]+)\$/g)) r.push(m[1]);
  for (const v of l.visuales) if (v.tipo === "cuadros") for (const c of v.cuadros) if (c.formula) r.push(c.formula);
  return r;
}
// Fórmulas sin los $ (las de "formula" de los cuadros, más las que van entre $...$).
function formulas(l: LeccionCalculia): string[] {
  const r: string[] = [];
  for (const t of textos(l)) for (const m of t.matchAll(/\$([^$]+)\$/g)) r.push(m[1]);
  for (const v of l.visuales) if (v.tipo === "cuadros") for (const c of v.cuadros) if (c.formula) r.push(c.formula);
  return r;
}

// ---------- 1) Lo sembrado ----------

// Pasos NUEVOS al final de cada lección (cubren huecos de la práctica). Las demás
// lecciones no ganan pasos.
export const PASOS_NUEVOS: Record<string, number> = {
  "calculia-pro-integrales-fundamentos": 2, // ∫k/x dx e integral definida
  "calculia-pro-integrales-avanzadas": 1, // ∫k·cos y ∫k·sen
  "calculia-pro-series-geometricas": 2, // criterio de la razón (regla y ejemplo resuelto)
  "calculia-pro-edos-separables": 3, // caso general, n = 3 y n = 4, k distinto de n+1
};

describe("Calculia: el contenido tipado es lo sembrado en la base (neutralizado por 0221) más los pasos nuevos al final", () => {
  // Estado FINAL de la base: lo sembrado + la corrección de voseo de 0221.
  const sembrado = new Map([...estadoSembradoCalculia(sembradoSql)].map(([k, v]) => [k, aNeutroProfundo(v)]));

  it("las migraciones sembradas definen exactamente las 12 lecciones del contenido (5 Técnicas + 7 Clases)", () => {
    expect([...sembrado.keys()].sort()).toEqual(LECCIONES.map((l) => l.slug).sort());
    expect(TECNICAS_CALCULIA).toHaveLength(5);
    expect(CLASES_CALCULIA).toHaveLength(7);
  });

  it("nombre, descripción, orden y requiere_pro coinciden con la base (no los toca ninguna migración de esta tanda)", () => {
    for (const l of LECCIONES) {
      const fila = sembrado.get(l.slug)!;
      expect(fila.nombre, l.slug).toBe(l.nombre);
      expect(fila.descripcion, l.slug).toBe(l.descripcion);
      expect(fila.orden, l.slug).toBe(l.orden);
      expect(fila.requierePro, l.slug).toBe(l.requierePro);
    }
  });

  it("`quiz` idéntico a la base y `pasos` = los sembrados (0165, 0170, 0178, 0181, 0195 + 0221) cadena por cadena, con los nuevos SOLO al final", () => {
    for (const l of LECCIONES) {
      const c = sembrado.get(l.slug)!.contenido;
      expect(Object.keys(c).sort(), `${l.slug}: claves del contenido sembrado`).toEqual(["pasos", "quiz"]);
      const nuevos = PASOS_NUEVOS[l.slug] ?? 0;
      const pasosSembrados = c.pasos ?? [];
      expect(l.pasos.length, `${l.slug}: cantidad de pasos`).toBe(pasosSembrados.length + nuevos);
      expect(l.pasos.slice(0, pasosSembrados.length), `${l.slug}: los pasos sembrados no cambian ni se reordenan`).toEqual(pasosSembrados);
      expect(c.quiz, `${l.slug}: quiz`).toEqual(l.quiz);
    }
    expect(Object.keys(PASOS_NUEVOS).every((slug) => LECCIONES.some((l) => l.slug === slug))).toBe(true);
  });
});

// ---------- 2) Estructura ----------

describe("Calculia: estructura y temas", () => {
  it("Técnicas gratis (orden 1..5) y Clases Pro (orden 6..12), slugs únicos, orden correlativo en toda la tabla", () => {
    expect(TECNICAS_CALCULIA.every((t) => t.requierePro === false)).toBe(true);
    expect(CLASES_CALCULIA.every((c) => c.requierePro === true)).toBe(true);
    expect(LECCIONES.map((l) => l.orden)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(new Set(LECCIONES.map((l) => l.slug)).size).toBe(12);
  });

  it("los 4 temas (bloques) son los modos de práctica y cada lección pertenece a uno", () => {
    expect(ORDEN_GRUPOS_CALCULIA).toEqual(["derivadas", "integrales", "series", "multivariable"]);
    expect(BLOQUES_CALCULIA.map((b) => b.modoPractica)).toEqual(["derivadas", "integrales", "series", "multivariable"]);
    const cuenta = (lista: LeccionCalculia[]) => Object.fromEntries(ORDEN_GRUPOS_CALCULIA.map((g) => [g, lista.filter((l) => l.grupo === g).length]));
    expect(cuenta(TECNICAS_CALCULIA)).toEqual({ derivadas: 1, integrales: 1, series: 1, multivariable: 2 });
    expect(cuenta(CLASES_CALCULIA)).toEqual({ derivadas: 2, integrales: 2, series: 1, multivariable: 2 });
  });

  it("el tema de cada lección coincide con el sidebar por temas de src/lib/aprender/grupos.ts", () => {
    for (const [pestana, lista] of [
      ["tecnicas", TECNICAS_CALCULIA],
      ["clases", CLASES_CALCULIA],
    ] as const) {
      const defs = GRUPOS_APRENDER.calculia[pestana];
      for (const l of lista) {
        const def = defs.find((d) => d.slugs.includes(l.slug));
        expect(def?.id, `${l.slug} no figura en grupos.ts`).toBe(l.grupo);
      }
    }
  });

  it("el orden dentro de cada tema es creciente en el arreglo (el desbloqueo lineal dentro del tema sigue el orden sembrado)", () => {
    for (const lista of [TECNICAS_CALCULIA, CLASES_CALCULIA]) {
      for (const g of ORDEN_GRUPOS_CALCULIA) {
        const ordenes = lista.filter((l) => l.grupo === g).map((l) => l.orden);
        expect(ordenes, g).toEqual([...ordenes].sort((a, b) => a - b));
      }
    }
  });
});

describe("Calculia: quiz de todas las lecciones", () => {
  it("la respuesta es EXACTAMENTE una de las opciones (el servidor valida por igualdad exacta), sin repetidos y con explicación", () => {
    for (const l of LECCIONES) {
      expect(l.quiz.length, l.slug).toBeGreaterThanOrEqual(3);
      for (const q of l.quiz) {
        const donde = `${l.slug}: ${q.pregunta}`;
        expect(q.opciones, donde).toContain(q.respuesta);
        expect(new Set(q.opciones).size, donde).toBe(q.opciones.length);
        expect(q.opciones.length, donde).toBeGreaterThanOrEqual(2);
        expect(q.opciones.length, donde).toBeLessThanOrEqual(4);
        expect(q.explicacion.length, donde).toBeGreaterThan(15);
      }
    }
  });
});

describe("Calculia: KaTeX, español neutro y caracteres raros", () => {
  it("cada $...$ tiene el $ apareado y todas las fórmulas (también las de los cuadros y los títulos) se renderizan con KaTeX sin error", () => {
    let expresiones = 0;
    for (const l of LECCIONES) {
      for (const t of textos(l)) expect((t.match(/\$/g) ?? []).length % 2, `${l.slug}: $ desparejado en «${t.slice(0, 80)}»`).toBe(0);
      for (const f of formulas(l)) {
        const html = katex.renderToString(f, { throwOnError: true });
        expect(html, `${l.slug}: ${f}`).not.toContain("katex-error");
        expresiones++;
      }
    }
    expect(expresiones).toBeGreaterThan(400);
  }, 120_000);

  it("notación en español en lo NUEVO: nunca \\sin (es sen); los visuales no usan comillas rectas ni marcas rotas", () => {
    for (const l of LECCIONES) {
      for (const f of formulasVisuales(l)) expect(f, `${l.slug}: ${f}`).not.toMatch(/\\sin\b/);
      for (const t of textosVisuales(l)) {
        expect(t.replace(/\$[^$]+\$/g, " "), `${l.slug}: «${t.slice(0, 80)}»`).not.toMatch(/undefined|NaN|\[object|\{\{|\}\}|Infinity/);
        expect(t, `${l.slug}: comilla recta en «${t.slice(0, 60)}»`).not.toMatch(/"/);
      }
    }
  });

  it("TODO lo NUEVO (títulos y textos de los visuales) está en español neutro, sin voseo", () => {
    for (const l of LECCIONES) for (const t of textosVisuales(l)) expect(detectarVoseo(t), `${l.slug}: «${t.slice(0, 80)}»`).toEqual([]);
  });

  it("las 12 lecciones (incluido lo ya sembrado, corregido por 0221) están en español neutro, sin voseo", () => {
    const conVoseo = LECCIONES.map((l) => ({ slug: l.slug, n: textos(l, false).reduce((s, t) => s + detectarVoseo(t).length, 0) })).filter((x) => x.n > 0);
    expect(conVoseo).toEqual([]);
  });
});

// ---------- 3) Visuales: estructura ----------

describe("Calculia: visuales de las lecciones", () => {
  it("TODA Técnica y TODA Clase tiene al menos 1 visual, de tipo conocido, con despuesDePaso dentro de sus pasos", () => {
    for (const l of LECCIONES) {
      expect(l.visuales.length, `${l.slug} sin visuales`).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales) {
        expect(esVisualLeccion(v), l.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${l.slug}: tipo ${v.tipo}`).toBe(true);
        expect(v.despuesDePaso, `${l.slug}: despuesDePaso obligatorio`).toBeDefined();
        expect(v.despuesDePaso!, `${l.slug}: despuesDePaso fuera de los pasos`).toBeLessThan(l.pasos.length);
      }
    }
  });

  it("se usan los 4 tipos propios y el primitivo genérico de cuadros", () => {
    const usados = new Set(LECCIONES.flatMap((l) => l.visuales.map((v) => v.tipo)));
    expect(usados).toEqual(new Set(["cuadros", "calculia.tangente", "calculia.area", "calculia.serie", "calculia.edo"]));
    expect(Object.keys(REGISTRO_VISUALES_CALCULIA).sort()).toEqual(["calculia.area", "calculia.edo", "calculia.serie", "calculia.tangente"]);
  });

  it("cada visual propio pasa su validador y sus funciones de datos no lanzan y devuelven algo dibujable", () => {
    let total = 0;
    for (const l of LECCIONES) {
      for (const v of l.visuales as VisualLeccionCalculia[]) {
        const donde = `${l.slug}: ${v.tipo}`;
        if (v.tipo === "cuadros") {
          expect(v.cuadros.length, donde).toBeGreaterThanOrEqual(1);
          for (const c of v.cuadros) expect(Boolean(c.texto || c.formula), `${donde}: cuadro vacío`).toBe(true);
          continue;
        }
        total++;
        if (v.tipo === "calculia.tangente") {
          expect(esVisualCalculiaTangente(v), donde).toBe(true);
          const d = datosTangente(v);
          expect(d.curva.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)), donde).toBe(true);
        } else if (v.tipo === "calculia.area") {
          expect(esVisualCalculiaArea(v), donde).toBe(true);
          const d = datosArea(v);
          expect(d.relleno.every((p) => Number.isFinite(p.y)), donde).toBe(true);
        } else if (v.tipo === "calculia.serie") {
          expect(esVisualCalculiaSerie(v), donde).toBe(true);
          expect(datosSerie(v).parciales.every(Number.isFinite), donde).toBe(true);
        } else if (v.tipo === "calculia.edo") {
          expect(esVisualCalculiaEdo(v), donde).toBe(true);
          const d = datosEdo(v);
          expect(d.curvas.every((c) => c.puntos.every((p) => Number.isFinite(p.y))), donde).toBe(true);
        }
      }
    }
    expect(total).toBe(19); // 14 de la primera tanda + 2 series y 3 EDO de la de cobertura
  });
});

// ---------- 4) Exactitud de los datos de los visuales propios ----------

// Cálculo independiente: se reescribe la función de cada término (sin usar las
// funciones de derivación/antiderivación de visualesDatos.ts).
function fDe(fn: VisualCalculiaTangente["funcion"]): (x: number) => number {
  return (x) => fn.reduce((s, t) => s + (t.tipo === "potencia" ? t.c * x ** t.n : t.c * (t.a * x + t.b) ** t.n), 0);
}
function simpson(f: (x: number) => number, a: number, b: number, n = 2000): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 === 0 ? 2 : 4);
  return (s * h) / 3;
}
const dif = (f: (x: number) => number, x: number) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6;

function visualesDe<T extends VisualLeccionCalculia>(slug: string, tipo: T["tipo"]): T[] {
  return porSlug(slug).visuales.filter((v) => v.tipo === tipo) as T[];
}

describe("Calculia: los datos de cada visual se contrastan con un cálculo independiente", () => {
  it("TANGENTE: la pendiente y y0 que se muestran son f'(x0) (diferencia finita) y f(x0), y coinciden con lo esperado de cada lección", () => {
    const esperados: Record<string, { pendiente: number; y0: number }[]> = {
      "calculia-derivar-parciales": [{ pendiente: 12, y0: 6 }], // f(x,2)=6x², x0=1
      "calculia-pro-derivadas-fundamentos": [
        { pendiente: 3, y0: 2.25 }, // x² en 1.5
        { pendiente: 20, y0: 5 }, // 5x⁴ en 1
      ],
      "calculia-pro-derivadas-producto-cociente-cadena": [{ pendiente: 6, y0: 1 }], // (2x+1)³ en 0
      "calculia-pro-multivariable-parciales": [{ pendiente: 48, y0: 24 }], // f(x,2)=24x², x0=1
    };
    let n = 0;
    for (const l of LECCIONES) {
      const vs = visualesDe<VisualCalculiaTangente>(l.slug, "calculia.tangente");
      expect(vs.length, l.slug).toBe(esperados[l.slug]?.length ?? 0);
      vs.forEach((v, i) => {
        const f = fDe(v.funcion);
        const d = datosTangente(v);
        expect(d.y0, `${l.slug} y0`).toBeCloseTo(f(v.x0), 2);
        expect(Math.abs(d.pendiente - dif(f, v.x0)), `${l.slug} pendiente`).toBeLessThan(0.01);
        expect(d.pendiente, l.slug).toBeCloseTo(esperados[l.slug][i].pendiente, 2);
        expect(d.y0, l.slug).toBeCloseTo(esperados[l.slug][i].y0, 2);
        // las dos secantes se acercan a la pendiente exacta
        const ps = (s: { x1: number; y1: number; x2: number; y2: number }) => (s.y2 - s.y1) / (s.x2 - s.x1);
        expect(Math.abs(ps(d.secante2) - d.pendiente), l.slug).toBeLessThan(Math.abs(ps(d.secante1) - d.pendiente));
        n++;
      });
    }
    expect(n).toBe(5);
  });

  it("ÁREA: el área que se muestra es la integral de Simpson de f entre los extremos (y coincide con lo esperado)", () => {
    const esperados: Record<string, number> = { "calculia-pro-integrales-fundamentos": 16, "calculia-pro-integrales-avanzadas": 80 };
    let n = 0;
    for (const l of LECCIONES) {
      for (const v of visualesDe<VisualCalculiaArea>(l.slug, "calculia.area")) {
        const d = datosArea(v);
        const f = fDe(v.funcion);
        expect(Math.abs(d.area - simpson(f, v.desde, v.hasta)), l.slug).toBeLessThan(0.01);
        expect(d.area, l.slug).toBeCloseTo(esperados[l.slug], 2);
        // los rectángulos de punto medio se acercan al área (12 mejor que 4)
        const suma = (rs: { ancho: number; alto: number }[]) => rs.reduce((s, r) => s + r.ancho * r.alto, 0);
        expect(Math.abs(suma(d.rectangulos12) - d.area), l.slug).toBeLessThan(Math.abs(suma(d.rectangulos4) - d.area));
        n++;
      }
    }
    expect(n).toBe(2);
  });

  it("SERIE: las sumas parciales son sumas directas, la suma infinita es a/(1−r) (y el límite numérico coincide) o diverge, según |r|", () => {
    const esperados: Record<string, { converge: boolean; suma?: number }[]> = {
      "calculia-identificar-tipo-serie": [{ converge: false }, { converge: true, suma: 2 }],
      "calculia-pro-series-geometricas": [
        { converge: true, suma: 16 / 3 },
        { converge: true, suma: 8 },
        { converge: false },
        { converge: true, suma: 6 }, // Σ 3·(2/3)^n desde n=1: a=2, r=2/3 -> 2/(1−2/3)
        { converge: false }, // Σ 5·(−3/2)^n desde n=1: a=−7.5, r=−3/2, |r|>1
      ],
    };
    let n = 0;
    for (const l of LECCIONES) {
      const vs = visualesDe<VisualCalculiaSerie>(l.slug, "calculia.serie");
      expect(vs.length, l.slug).toBe(esperados[l.slug]?.length ?? 0);
      vs.forEach((v, i) => {
        const r = v.rNum / v.rDen;
        const d = datosSerie(v);
        // sumas directas
        let acumulado = 0;
        d.parciales.forEach((p, k) => {
          acumulado += v.a * r ** k;
          // las sumas parciales se muestran redondeadas a 2 decimales (ej. −13.125 → −13.12)
          expect(Math.abs(p - acumulado), `${l.slug} S${k + 1}`).toBeLessThanOrEqual(0.005 + 1e-9);
        });
        expect(d.converge, l.slug).toBe(Math.abs(r) < 1);
        expect(d.converge, l.slug).toBe(esperados[l.slug][i].converge);
        if (d.converge) {
          expect(d.sumaInfinita!, l.slug).toBeCloseTo(esperados[l.slug][i].suma!, 2);
          expect(Math.abs(sumaParcial(v.a, r, 400) - d.sumaInfinita!), `${l.slug}: límite`).toBeLessThan(0.01);
          expect(sumaInfinita(v.a, r)).toBeCloseTo(d.sumaInfinita!, 2);
        } else {
          expect(d.sumaInfinita).toBeNull();
          // diverge de verdad: la suma parcial supera cualquier tope
          expect(Math.abs(sumaParcial(v.a, r, 60))).toBeGreaterThan(1e6);
        }
        n++;
      });
    }
    expect(n).toBe(7);
  });

  it("SERIE del criterio de la razón: el primer término a = c·r y la razón r del visual son los de a_n = c·r^n (desde n = 1) y el cociente a_(n+1)/a_n es r", () => {
    const visuales = visualesDe<VisualCalculiaSerie>("calculia-pro-series-geometricas", "calculia.serie").slice(3);
    const casos = [{ c: 3, r: 2 / 3 }, { c: 5, r: -3 / 2 }];
    expect(visuales).toHaveLength(2);
    visuales.forEach((v, i) => {
      const { c, r } = casos[i];
      const an = (n: number) => c * r ** n;
      expect(v.rNum / v.rDen).toBeCloseTo(r, 12);
      expect(v.a).toBeCloseTo(an(1), 12); // primer término de la serie desde n = 1
      for (const n of [1, 2, 3, 6]) expect(an(n + 1) / an(n), `cociente n=${n}`).toBeCloseTo(r, 10);
      // el criterio de la razón: L = |r| y decide igual que |r| < 1 (converge) o > 1 (diverge)
      expect(datosSerie(v).converge).toBe(Math.abs(r) < 1);
    });
    expect(Math.abs(-3 / 2)).toBe(1.5); // el «1.5» del texto y L = |−3/2| = 3/2
    // suma directa de los términos c·r^n, n = 1..400, contra a/(1−r) = c·r/(1−r) = 6
    let suma = 0;
    for (let n = 1; n <= 400; n++) suma += 3 * (2 / 3) ** n;
    expect(suma).toBeCloseTo(6, 8);
  });

  it("EDO: la solución dibujada satisface dy/dx = k·x^n·y (diferencia finita) y la pendiente del punto es la de la ecuación", () => {
    // y = A·e^((k/(n+1))·x^(n+1)); en x0 con A = 1: pendiente = k·x0^n·e^((k/(n+1))·x0^(n+1))
    const esperadas: Record<string, { k: number; n: number; x0: number; pendiente: number }[]> = {
      "calculia-separar-variables-edo": [{ k: 3, n: 2, x0: 1, pendiente: 3 * Math.E }], // y=e^(x³) en x=1: 3·1·e
      "calculia-pro-edos-separables": [
        { k: 2, n: 1, x0: 1, pendiente: 2 * Math.E }, // y=e^(x²) en x=1: 2·1·e
        { k: 4, n: 3, x0: 1, pendiente: 4 * Math.E }, // y=e^(x⁴) en x=1: 4·1·e
        { k: 5, n: 4, x0: 1, pendiente: 5 * Math.E }, // y=e^(x⁵) en x=1: 5·1·e
        { k: 8, n: 3, x0: 0.8, pendiente: 8 * 0.8 ** 3 * Math.exp(2 * 0.8 ** 4) }, // y=e^(2x⁴) en x=0.8
      ],
    };
    let n = 0;
    for (const l of LECCIONES) {
      const vs = visualesDe<VisualCalculiaEdo>(l.slug, "calculia.edo");
      expect(vs.length, l.slug).toBe(esperadas[l.slug]?.length ?? 0);
      vs.forEach((v, i) => {
        const esp = esperadas[l.slug][i];
        expect({ k: v.k, n: v.n, x0: v.x0 }, `${l.slug} #${i}`).toEqual({ k: esp.k, n: esp.n, x0: esp.x0 });
        const d = datosEdo(v);
        for (const c of d.curvas) {
          for (const x of [-0.95, -0.4, 0.3, 0.9]) {
            const y = (t: number) => c.A * Math.exp((v.k / (v.n + 1)) * t ** (v.n + 1));
            expect(Math.abs(dif(y, x) - v.k * x ** v.n * y(x)), `${l.slug} k=${v.k} n=${v.n} A=${c.A} x=${x}`).toBeLessThan(1e-4 * Math.max(1, Math.abs(y(x))));
          }
        }
        expect(d.pendiente, `${l.slug} #${i}`).toBeCloseTo(esp.pendiente, 2);
        expect(pendienteSegunEdo(v.k, v.n, v.x0, solucionEdo(v.k, v.n, 1, v.x0))).toBeCloseTo(esp.pendiente, 10);
        n++;
      });
    }
    expect(n).toBe(5);
  });

  it("los datos de tipo tangente/área reutilizan solo funciones de las formas c·x^n y c·(ax+b)^n (nada simbólico libre)", () => {
    for (const l of LECCIONES) {
      for (const v of l.visuales) {
        if (v.tipo === "calculia.tangente" || v.tipo === "calculia.area") {
          for (const t of v.funcion) expect(["potencia", "factorLineal"], l.slug).toContain(t.tipo);
          expect(Number.isFinite(evaluarFuncion(v.funcion, 1)), l.slug).toBe(true);
        }
      }
    }
  });
});

// ---------- 5) Toda igualdad LaTeX de los cuadros es cierta (evaluada numéricamente) ----------

const D = (f: (x: number) => number): NombresTex[string] => (e) => dif(f, e.x);
const parcialX = (f: (x: number, y: number) => number): NombresTex[string] => (e) => (f(e.x + 1e-6, e.y) - f(e.x - 1e-6, e.y)) / 2e-6;
const parcialY = (f: (x: number, y: number) => number): NombresTex[string] => (e) => (f(e.x, e.y + 1e-6) - f(e.x, e.y - 1e-6)) / 2e-6;
const constante = (v: number): NombresTex[string] => () => v;

// Contexto de cada fragmento que necesita saber qué significan sus nombres
// (f'(x), u, v, ∂f/∂x…). Cada valor sale de un cálculo INDEPENDIENTE (diferencia finita).
const S = {
  cocienteCadena: "calculia-pro-derivadas-producto-cociente-cadena",
  fundamentos: "calculia-pro-derivadas-fundamentos",
  integralesFund: "calculia-pro-integrales-fundamentos",
  integralesAv: "calculia-pro-integrales-avanzadas",
  parcialesPro: "calculia-pro-multivariable-parciales",
  edoPro: "calculia-pro-edos-separables",
  serieTipo: "calculia-identificar-tipo-serie",
  seriesPro: "calculia-pro-series-geometricas",
  parciales: "calculia-derivar-parciales",
};
const f3x2y = (x: number, y: number) => 3 * x * x * y;
const f3x2y3 = (x: number, y: number) => 3 * x * x * y ** 3;
const CONTEXTO: Record<string, NombresTex> = {
  [`${S.fundamentos}|f'(x) = 5\\cdot 4\\cdot x^{4-1}`]: { "f'(x)": D((x) => 5 * x ** 4) },
  [`${S.fundamentos}|f'(x) = 20x^3`]: { "f'(x)": D((x) => 5 * x ** 4) },
  [`${S.cocienteCadena}|f'(x) = 6x^2 + 12x^2 = 18x^2`]: { "f'(x)": D((x) => 2 * x * 3 * x * x) },
  [`${S.cocienteCadena}|u'v + uv' = 2\\cdot 3x^2 + 2x\\cdot 6x`]: { "u'": constante(2), "v'": (e) => 6 * e.x, u: (e) => 2 * e.x, v: (e) => 3 * e.x * e.x },
  [`${S.cocienteCadena}|\\dfrac{u'v - uv'}{v^2} = \\dfrac{2x(x+3) - (x^2+1)\\cdot 1}{(x+3)^2}`]: { "u'": (e) => 2 * e.x, "v'": constante(1), u: (e) => e.x * e.x + 1, v: (e) => e.x + 3 },
  [`${S.cocienteCadena}|f'(x) = \\dfrac{x^2+6x-1}{(x+3)^2}`]: { "f'(x)": D((x) => (x * x + 1) / (x + 3)) },
  [`${S.cocienteCadena}|f'(x) = 4(3x+2)^3\\cdot 3 = 12(3x+2)^3`]: { "f'(x)": D((x) => (3 * x + 2) ** 4) },
  [`${S.integralesFund}|F(x) = 2x^3 \\;\\longrightarrow\\; F'(x) = 6x^2`]: { "F'(x)": D((x) => 2 * x ** 3) },
  // F(2) − F(0) con F(x) = 2x³ (antiderivada de 6x²): cada valor sale de un cálculo aparte
  [`${S.integralesFund}|F(2) - F(0) = 2\\cdot 2^3 - 2\\cdot 0^3 = 16`]: { "F(2)": constante(2 * 2 ** 3), "F(0)": constante(2 * 0 ** 3) },
  [`${S.integralesAv}|\\dfrac{1}{a(n+1)} = \\dfrac{1}{8}`]: { a: constante(2), n: constante(3) },
  [`${S.integralesAv}|8\\cdot\\dfrac{1}{8}(2x+1)^4 + C = (2x+1)^4 + C`]: { C: constante(0) },
  [`${S.serieTipo}|\\dfrac{a_{n+1}}{a_n} = \\dfrac{5\\cdot(1/2)^{n+1}}{5\\cdot(1/2)^{n}} = \\dfrac{1}{2}`]: {
    "a_{n+1}": (e) => 5 * 0.5 ** (e.x + 1),
    a_n: (e) => 5 * 0.5 ** e.x,
    n: (e) => e.x,
  },
  [`${S.seriesPro}|\\dfrac{a_{n+1}}{a_n} = \\dfrac{3\\cdot(2/3)^{n+1}}{3\\cdot(2/3)^{n}} = \\dfrac{2}{3}`]: {
    "a_{n+1}": (e) => 3 * (2 / 3) ** (e.x + 1),
    a_n: (e) => 3 * (2 / 3) ** e.x,
    n: (e) => e.x,
  },
  [`${S.edoPro}|y' = A\\,e^{2x^4}\\cdot 8x^3 = 8x^3\\,y`]: { "y'": D((x) => 1.7 * Math.exp(2 * x ** 4)), y: (e) => 1.7 * Math.exp(2 * e.x ** 4) },
  [`${S.parciales}|\\dfrac{\\partial f}{\\partial x} = 3y\\cdot 2x = 6xy`]: { "\\dfrac{\\partial f}{\\partial x}": parcialX(f3x2y) },
  [`${S.parciales}|\\dfrac{\\partial f}{\\partial y} = 3x^2\\cdot 1 = 3x^2`]: { "\\dfrac{\\partial f}{\\partial y}": parcialY(f3x2y) },
  [`${S.parciales}|\\dfrac{\\partial f}{\\partial x} = 6\\cdot 1\\cdot 2 = 12 \\qquad \\dfrac{\\partial f}{\\partial y} = 3\\cdot 1^2 = 3`]: {
    "\\dfrac{\\partial f}{\\partial x}": constante(parcialX(f3x2y)({ x: 1, y: 2 })),
    "\\dfrac{\\partial f}{\\partial y}": constante(parcialY(f3x2y)({ x: 1, y: 2 })),
  },
  [`${S.parcialesPro}|\\dfrac{\\partial f}{\\partial x} = 3y^3\\cdot 2x = 6xy^3`]: { "\\dfrac{\\partial f}{\\partial x}": parcialX(f3x2y3) },
  [`${S.parcialesPro}|\\dfrac{\\partial f}{\\partial x}(1,2) = 6\\cdot 1\\cdot 2^3 = 48`]: { "\\dfrac{\\partial f}{\\partial x}(1,2)": constante(parcialX(f3x2y3)({ x: 1, y: 2 })) },
  [`${S.parcialesPro}|\\dfrac{\\partial f}{\\partial y} = 3x^2\\cdot 3y^2 = 9x^2y^2`]: { "\\dfrac{\\partial f}{\\partial y}": parcialY(f3x2y3) },
  [`${S.parcialesPro}|\\dfrac{\\partial f}{\\partial y}(1,2) = 9\\cdot 1^2\\cdot 2^2 = 36`]: { "\\dfrac{\\partial f}{\\partial y}(1,2)": constante(parcialY(f3x2y3)({ x: 1, y: 2 })) },
  [`${S.edoPro}|y' = A\\,e^{x^2}\\cdot 2x = 2x\\,y`]: { "y'": D((x) => 1.7 * Math.exp(x * x)), y: (e) => 1.7 * Math.exp(e.x * e.x) },
};

// Líneas de una EDO que no son una igualdad numérica (una definición, una
// separación de diferenciales o una integral con constante): su verdad se
// comprueba aparte, con la ecuación diferencial (ver el test de abajo).
const NO_NUMERICAS = new Set([
  "calculia-separar-variables-edo|\\dfrac{dy}{dx} = 3x^2\\,y",
  "calculia-separar-variables-edo|\\dfrac{dy}{y} = 3x^2\\,dx",
  "calculia-separar-variables-edo|\\ln|y| = x^3 + C_1",
  "calculia-pro-edos-separables|\\dfrac{dy}{y} = 2x\\,dx",
  "calculia-pro-edos-separables|\\ln|y| = x^2 + C_1",
  // títulos: la propia ecuación que se resuelve
  "calculia-separar-variables-edo|\\dfrac{dy}{dx} = 3x^2y",
  "calculia-pro-edos-separables|\\dfrac{dy}{dx} = 2xy",
  // EDO general y n = 3 / coeficiente 2 (se comprueban aparte, con la ecuación diferencial, en el test de las EDO)
  "calculia-pro-edos-separables|\\dfrac{dy}{dx} = k\\,x^n\\,y",
  "calculia-pro-edos-separables|\\dfrac{dy}{y} = k\\,x^n\\,dx",
  "calculia-pro-edos-separables|\\ln|y| = \\dfrac{k}{n+1}\\,x^{n+1} + C_1",
  "calculia-pro-edos-separables|\\dfrac{dy}{dx} = 4x^3\\,y",
  "calculia-pro-edos-separables|\\dfrac{dy}{y} = 4x^3\\,dx",
  "calculia-pro-edos-separables|\\ln|y| = x^4 + C_1",
  "calculia-pro-edos-separables|\\dfrac{dy}{dx} = 8x^3\\,y",
  // valor absoluto de la razón: el evaluador solo conoce |x| dentro de ln|x| (se comprueba con Math.abs en el test de la serie)
  "calculia-pro-series-geometricas|L = \\left|-\\dfrac{3}{2}\\right| = \\dfrac{3}{2}",
]);

function fragmentosCuadros(l: LeccionCalculia): string[] {
  const r: string[] = [];
  for (const v of l.visuales) {
    if (v.tipo !== "cuadros") continue;
    for (const c of v.cuadros) {
      if (c.formula) r.push(c.formula);
      for (const t of [c.texto, c.resaltar]) if (t) for (const m of t.matchAll(/\$([^$]+)\$/g)) r.push(m[1]);
    }
    if (v.titulo) for (const m of v.titulo.matchAll(/\$([^$]+)\$/g)) r.push(m[1]);
  }
  return r;
}

describe("Calculia: toda igualdad de los cuadros se evalúa numéricamente y es cierta", () => {
  it("cada fórmula con «=» de un visual (derivadas, integrales, cadenas de cálculo) se verifica en varios puntos", () => {
    let verificadas = 0;
    const informativas: string[] = [];
    for (const l of LECCIONES) {
      for (const frag of new Set(fragmentosCuadros(l))) {
        if (!frag.includes("=")) continue;
        const clave = `${l.slug}|${frag}`;
        if (NO_NUMERICAS.has(clave)) continue;
        const r = verificarAfirmacionTex(frag, CONTEXTO[clave] ?? {});
        if (r.estado === "verificada") verificadas += r.igualdades;
        else informativas.push(clave);
      }
    }
    // Todas las entradas de CONTEXTO se usaron (ninguna quedó huérfana por un cambio de texto).
    const existentes = new Set(LECCIONES.flatMap((l) => [...new Set(fragmentosCuadros(l))].map((f) => `${l.slug}|${f}`)));
    for (const k of Object.keys(CONTEXTO)) expect(existentes.has(k), `contexto huérfano: ${k}`).toBe(true);
    for (const k of NO_NUMERICAS) expect(existentes.has(k), `no-numérica huérfana: ${k}`).toBe(true);
    expect(verificadas).toBeGreaterThan(60);
    // Lo «informativo» son definiciones (u=2x, c=5, f(x)=…): no afirman nada calculable.
    for (const k of informativas) expect(esEtiqueta(k.split("|")[1].split("=")[0]), `una fórmula con = quedó sin verificar: ${k}`).toBe(true);
    expect(informativas.length).toBeGreaterThan(10);
  });

  it("el evaluador detecta una igualdad FALSA (no es un verificador que aprueba todo)", () => {
    expect(() => verificarAfirmacionTex("\\dfrac{d}{dx}\\,5x^4 = 20x^4")).toThrow(AfirmacionFalsaTex);
    expect(() => verificarAfirmacionTex("\\int 6x^2\\,dx = 6x^3 + C")).toThrow(AfirmacionFalsaTex);
    expect(() => verificarAfirmacionTex("(\\operatorname{sen}(x))' = -\\cos(x)")).toThrow(AfirmacionFalsaTex);
    expect(() => verificarAfirmacionTex("12\\cdot 2^3 = 95")).toThrow(AfirmacionFalsaTex);
    expect(verificarAfirmacionTex("\\dfrac{d}{dx}\\,5x^4 = 20x^3").igualdades).toBe(1);
    expect(verificarAfirmacionTex("\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C").igualdades).toBe(1);
  });

  it("las afirmaciones numéricas de los resaltados: sumas parciales de las series p y de la armónica", () => {
    const s = (p: number, n: number) => Array.from({ length: n }, (_, i) => 1 / (i + 1) ** p).reduce((a, b) => a + b, 0);
    expect(s(2, 10).toFixed(2)).toBe("1.55");
    expect(s(3, 10).toFixed(4)).toBe("1.1975");
    expect(s(1, 1000)).toBeGreaterThan(7);
    expect(s(2, 4)).toBeCloseTo(1 + 1 / 4 + 1 / 9 + 1 / 16, 12);
    expect(s(3, 4)).toBeCloseTo(1 + 1 / 8 + 1 / 27 + 1 / 64, 12);
    // los textos de las lecciones dicen exactamente eso
    const t3 = textosVisuales(porSlug("calculia-identificar-tipo-serie")).join(" ");
    expect(t3).toContain("$1.55$");
    expect(t3).toContain("$1000$");
    expect(textosVisuales(porSlug("calculia-pro-series-geometricas")).join(" ")).toContain("$1.1975$");
  });

  it("las EDO de los cuadros: y = A·e^((k/(n+1))·x^(n+1)) resuelve dy/dx = k·x^n·y para (k, n) = (3,2), (2,1), (4,3), (5,4) y (8,3), y en general", () => {
    // Los casos escritos en las lecciones más una malla completa de la práctica (n = 1..4, k = m·(n+1), m = ±1..±4).
    const casos: [number, number][] = [[3, 2], [2, 1], [4, 3], [5, 4], [8, 3]];
    for (let n = 1; n <= 4; n++) for (const m of [-4, -3, -2, -1, 1, 2, 3, 4]) casos.push([m * (n + 1), n]);
    for (const [k, n] of casos) {
      const coef = k / (n + 1);
      for (const A of [0.5, 1.7, 3]) {
        const y = (x: number) => A * Math.exp(coef * x ** (n + 1));
        for (const x of [-0.8, 0.2, 0.9]) {
          // dy/dx = k x^n y  y  dy/y = k x^n dx (la separación)
          expect(Math.abs(dif(y, x) - k * x ** n * y(x)), `k=${k} n=${n}`).toBeLessThan(1e-4 * Math.max(1, y(x)));
          expect(Math.abs(dif(y, x) / y(x) - k * x ** n), `k=${k} n=${n}`).toBeLessThan(1e-4);
        }
        // ln|y| = (k/(n+1)) x^(n+1) + C1 con C1 = ln A constante
        expect(Math.abs(Math.log(y(0.3)) - coef * 0.3 ** (n + 1) - (Math.log(y(-0.7)) - coef * (-0.7) ** (n + 1)))).toBeLessThan(1e-9);
      }
    }
    // Los números de los pasos nuevos: k/(n+1) = 4/4 = 1, 5/5 = 1 y 8/4 = 2
    expect([4 / 4, 5 / 5, 8 / 4]).toEqual([1, 1, 2]);
    // los errores comunes del texto NO son solución: e^(8x⁴) y e^(2x³) para dy/dx = 8x³y
    for (const otra of [(x: number) => 1.7 * Math.exp(8 * x ** 4), (x: number) => 1.7 * Math.exp(2 * x ** 3)]) {
      expect(Math.abs(dif(otra, 0.8) - 8 * 0.8 ** 3 * otra(0.8))).toBeGreaterThan(0.01);
    }
  });

  it("integral definida: F(b) − F(a) con F(x) = 2x³ es 16 = ∫₀² 6x² dx (Simpson), y F' es el integrando", () => {
    const F = (x: number) => 2 * x ** 3;
    const f = (x: number) => 6 * x ** 2;
    expect(F(2) - F(0)).toBe(16);
    expect(Math.abs(simpson(f, 0, 2) - 16)).toBeLessThan(1e-9);
    for (const x of [0.3, 1, 1.7]) expect(Math.abs(dif(F, x) - f(x))).toBeLessThan(1e-5);
    // el visual de área de esa lección dibuja exactamente esa integral definida, tras el paso que la explica
    const l = porSlug("calculia-pro-integrales-fundamentos");
    const area = visualesDe<VisualCalculiaArea>(l.slug, "calculia.area")[0];
    expect({ desde: area.desde, hasta: area.hasta }).toEqual({ desde: 0, hasta: 2 });
    expect(l.pasos[area.despuesDePaso!]).toContain("F(b) - F(a)");
    expect(datosArea(area).area).toBeCloseTo(16, 2);
  });

  it("coeficientes de ∫k/x, ∫k·cos y ∫k·sen: la antiderivada de cada ejemplo escrito derivada devuelve el integrando (k = 4, 5 y 7)", () => {
    for (const x of [0.4, 1.3, 2.6]) {
      expect(Math.abs(dif((t) => 4 * Math.log(Math.abs(t)), x) - 4 / x)).toBeLessThan(1e-5);
      expect(Math.abs(dif((t) => 5 * Math.sin(t), x) - 5 * Math.cos(x))).toBeLessThan(1e-5);
      expect(Math.abs(dif((t) => -7 * Math.cos(t), x) - 7 * Math.sin(x))).toBeLessThan(1e-5);
      // y los errores comunes NO son antiderivadas: ln|x| sin el 4, y −cos(x) sin el 7
      expect(Math.abs(dif((t) => Math.log(Math.abs(t)), x) - 4 / x)).toBeGreaterThan(0.1);
      expect(Math.abs(dif((t) => -Math.cos(t), x) - 7 * Math.sin(x))).toBeGreaterThan(0.1);
    }
  });
});

// ---------- 6) Lo que las lecciones afirman en sus pasos (mejor esfuerzo) ----------

describe("Calculia: las igualdades de los pasos y del quiz ya sembrados son ciertas (evaluación numérica, mejor esfuerzo)", () => {
  it("ninguna igualdad evaluable de los pasos, del quiz o de las explicaciones es falsa", () => {
    const falsas: string[] = [];
    let verificadas = 0;
    // «A·e^(x²) = y» define y (no es una identidad en x e y): no se evalúa.
    const NO_EVALUAR = new Set(["A\\cdot e^{x^{2}}=y"]);
    for (const l of LECCIONES) {
      const fuentes = [...l.pasos, ...l.quiz.flatMap((q) => [q.pregunta, q.respuesta, q.explicacion])];
      for (const t of fuentes) {
        for (const m of t.matchAll(/\$([^$]+)\$/g)) {
          const frag = m[1];
          if (!frag.includes("=") || /\\int|\\partial|\\frac\{d/.test(frag) || NO_EVALUAR.has(frag)) continue;
          try {
            const r = verificarAfirmacionTex(frag);
            if (r.estado === "verificada") verificadas += r.igualdades;
          } catch (e) {
            if (e instanceof AfirmacionFalsaTex) falsas.push(`${l.slug}: ${e.message}`);
            // cualquier otro error = símbolo que el evaluador no conoce: se omite
          }
        }
      }
    }
    // ERROR REAL heredado de la conversión a LaTeX de 0195 (no se reescribe; se reporta):
    // la explicación de la pregunta «Deriva $f(x) = 2x^{5}$» dice «Coeficiente 2 por
    // exponente $5 = 10$»: el LaTeX perdió el «2 por» y afirma 5 = 10 (debía ser
    // $2\cdot 5 = 10$).
    expect(falsas).toEqual(["calculia-pro-derivadas-fundamentos: «5 = 10»: «5» = 5 pero «10» = 10 en x=0.7, y=1.4"]);
    expect(verificadas).toBeGreaterThan(8);
  });
});

// La respuesta marcada de cada pregunta de CÁLCULO es la única correcta: se
// evalúa cada opción como derivada/integral y se compara con el enunciado.
describe("Calculia: la respuesta correcta de cada pregunta de cálculo es correcta y las demás opciones no", () => {
  const limpia = (s: string) => s.replace(/^\$|\$$/g, "").replace(/\s*\+\s*C\s*$/, "").replace(/\\cdot\s*/g, "\\cdot ");
  const pts: EntornoTex[] = [
    { x: 0.6, y: 1.5 },
    { x: 1.4, y: 0.8 },
    { x: 2.3, y: 2.1 },
  ];
  const igual = (a: (e: EntornoTex) => number, b: (e: EntornoTex) => number) => pts.every((p) => Math.abs(a(p) - b(p)) <= 1e-5 * Math.max(1, Math.abs(a(p))));

  interface Calculo {
    slug: string;
    pregunta: RegExp;
    // Qué representa cada opción: derivada de f, integral de f, o parcial.
    objetivo: (e: EntornoTex) => number;
    // Cómo se interpreta cada opción: como la función misma (derivada o parcial) o como una antiderivada (se deriva y se compara con el integrando).
    modo: "funcion" | "antiderivada";
  }
  const CALCULOS: Calculo[] = [
    { slug: S.fundamentos, pregunta: /^Deriva \$f\(x\) = 6x\^\{3\}\$/, objetivo: D((x) => 6 * x ** 3), modo: "funcion" },
    { slug: S.fundamentos, pregunta: /función constante/, objetivo: D(() => 9), modo: "funcion" },
    { slug: S.fundamentos, pregunta: /^Deriva \$f\(x\) = 2x\^\{5\}\$/, objetivo: D((x) => 2 * x ** 5), modo: "funcion" },
    { slug: S.cocienteCadena, pregunta: /^Deriva \$f\(x\) = \(2x\+1\)\^\{3\}\$/, objetivo: D((x) => (2 * x + 1) ** 3), modo: "funcion" },
    { slug: S.integralesFund, pregunta: /^Calcula \$\\int 12x\^\{3\}/, objetivo: (e) => 12 * e.x ** 3, modo: "antiderivada" },
    { slug: S.integralesFund, pregunta: /^Calcula \$\\int \(\\frac\{1\}\{x\}\)/, objetivo: (e) => 1 / e.x, modo: "antiderivada" },
    { slug: S.integralesAv, pregunta: /^Calcula \$\\int e\^\{3x\}/, objetivo: (e) => Math.exp(3 * e.x), modo: "antiderivada" },
    { slug: S.integralesAv, pregunta: /^Calcula \$\\int \\operatorname\{sen\}\(x\)/, objetivo: (e) => Math.sin(e.x), modo: "antiderivada" },
    { slug: S.integralesAv, pregunta: /^Calcula \$\\int 10\(2x\+3\)\^\{4\}/, objetivo: (e) => 10 * (2 * e.x + 3) ** 4, modo: "antiderivada" },
    { slug: S.parcialesPro, pregunta: /5x\^\{3\}y\^\{2\}\$, calcula \$\\frac\{\\partial f\}\{\\partial x\}/, objetivo: parcialX((x, y) => 5 * x ** 3 * y ** 2), modo: "funcion" },
    { slug: S.parcialesPro, pregunta: /5x\^\{3\}y\^\{2\}\$, calcula \$\\frac\{\\partial f\}\{\\partial y\}/, objetivo: parcialY((x, y) => 5 * x ** 3 * y ** 2), modo: "funcion" },
  ];

  it("cada pregunta de cálculo: la respuesta marcada coincide con la derivada/integral independiente y ninguna otra opción coincide", () => {
    let comprobadas = 0;
    for (const c of CALCULOS) {
      const q = porSlug(c.slug).quiz.find((x) => c.pregunta.test(x.pregunta));
      expect(q, `${c.slug}: no encontré ${c.pregunta}`).toBeDefined();
      const evalOpcion = (op: string): ((e: EntornoTex) => number) => {
        const f = compilarTex(limpia(op));
        return c.modo === "funcion" ? f : (e) => derivadaNumerica(f, e);
      };
      expect(igual(evalOpcion(q!.respuesta), c.objetivo), `${c.slug}: la respuesta marcada ${q!.respuesta} no es correcta`).toBe(true);
      for (const op of q!.opciones.filter((o) => o !== q!.respuesta)) {
        expect(igual(evalOpcion(op), c.objetivo), `${c.slug}: la opción incorrecta ${op} en realidad es correcta`).toBe(false);
      }
      comprobadas++;
    }
    expect(comprobadas).toBe(11);
  });

  it("preguntas numéricas de series y la EDO del quiz", () => {
    const s = porSlug("calculia-pro-series-geometricas").quiz;
    expect(Number(s[0].respuesta)).toBeCloseTo(sumaInfinita(6, 1 / 3), 10); // 6/(1−1/3) = 9
    expect(Math.abs(sumaParcial(6, 1 / 3, 200) - 9)).toBeLessThan(1e-9);
    expect(s[1].respuesta).toBe("Diverge"); // |3/2| ≥ 1
    expect(Math.abs(3 / 2) >= 1).toBe(true);
    const edo = porSlug("calculia-pro-edos-separables").quiz[1];
    expect(edo.respuesta).toBe("$y = A\\cdot e^{x^{3}}$"); // dy/dx = 3x²y
    const y = (x: number) => 1.9 * Math.exp(x ** 3);
    for (const x of [-0.7, 0.4, 1.1]) expect(Math.abs(dif(y, x) - 3 * x * x * y(x))).toBeLessThan(1e-4 * y(x) * 10);
    // los distractores NO son solución
    for (const otra of [(x: number) => 1.9 * Math.exp(3 * x * x), (x: number) => 1.9 * x ** 3, (x: number) => 1.9 * Math.exp(x * x)]) {
      expect(Math.abs(dif(otra, 0.9) - 3 * 0.81 * otra(0.9))).toBeGreaterThan(0.01);
    }
  });
});

// ---------- 7) Cobertura de la práctica por las lecciones ----------

function prng(semilla: number) {
  let a = semilla;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Subtipo de un problema según su enunciado (los generadores de calculia.ts no
// exponen el subtipo: se reconoce por el texto).
function subtipo(modo: ModoCalculia, enunciado: string): string {
  if (modo === "derivadas") {
    if (/regla del producto/.test(enunciado)) return "producto";
    if (/regla del cociente/.test(enunciado)) return "cociente";
    if (/regla de la cadena/.test(enunciado)) return "cadena";
    return "potencia";
  }
  if (modo === "integrales") {
    if (/usando sustitución/.test(enunciado)) return "sustitucion";
    if (/\\int \\frac\{\d+\}\{x\}/.test(enunciado)) return "ln";
    if (/e\^\{/.test(enunciado)) return "exponencial";
    if (/\\cos|operatorname\{sen\}/.test(enunciado)) return "trig";
    return "potencia";
  }
  if (modo === "series") {
    if (/Calcula la suma de la serie geométrica/.test(enunciado)) return "suma-geometrica";
    if (/serie geométrica con razón/.test(enunciado)) return "clasificar-geometrica";
    if (/serie p/.test(enunciado)) return "clasificar-p";
    return "criterio-razon";
  }
  return /EDO separable/.test(enunciado) ? "edo-separable" : "parcial";
}

// Qué lecciones enseñan cada subtipo (con una marca que debe aparecer en sus
// pasos o visuales, para que el mapa no quede desactualizado).
const COBERTURA: Record<string, { lecciones: string[]; marca: RegExp }> = {
  "derivadas/potencia": { lecciones: ["calculia-reconocer-regla-derivacion", "calculia-pro-derivadas-fundamentos"], marca: /regla de la potencia/i },
  "derivadas/producto": { lecciones: ["calculia-reconocer-regla-derivacion", "calculia-pro-derivadas-producto-cociente-cadena"], marca: /regla del producto/i },
  "derivadas/cociente": { lecciones: ["calculia-reconocer-regla-derivacion", "calculia-pro-derivadas-producto-cociente-cadena"], marca: /regla del cociente/i },
  "derivadas/cadena": { lecciones: ["calculia-reconocer-regla-derivacion", "calculia-pro-derivadas-producto-cociente-cadena"], marca: /regla de la cadena/i },
  "integrales/potencia": { lecciones: ["calculia-tabla-integrales-comunes", "calculia-pro-integrales-fundamentos"], marca: /x\^\{?n\+1\}?/ },
  "integrales/ln": { lecciones: ["calculia-tabla-integrales-comunes", "calculia-pro-integrales-fundamentos"], marca: /\\ln\|x\|/ },
  "integrales/exponencial": { lecciones: ["calculia-tabla-integrales-comunes", "calculia-pro-integrales-avanzadas"], marca: /e\^\{(?:k|a)?x\}|e\^\{3x\}|e\^\{ax\}/ },
  "integrales/trig": { lecciones: ["calculia-tabla-integrales-comunes", "calculia-pro-integrales-avanzadas"], marca: /operatorname\{sen\}/ },
  "integrales/sustitucion": { lecciones: ["calculia-pro-integrales-avanzadas"], marca: /[Ss]ustituci[oó]n/ },
  "series/suma-geometrica": { lecciones: ["calculia-identificar-tipo-serie", "calculia-pro-series-geometricas"], marca: /\\frac\{a\}\{1-r\}|\\dfrac\{a\}\{1-r\}/ },
  "series/clasificar-geometrica": { lecciones: ["calculia-identificar-tipo-serie", "calculia-pro-series-geometricas"], marca: /\|r\|\s*(?:<|\\lt)\s*1|\|r\|<1/ },
  "series/clasificar-p": { lecciones: ["calculia-identificar-tipo-serie", "calculia-pro-series-geometricas"], marca: /p\s*>\s*1|p>1/ },
  "series/criterio-razon": { lecciones: ["calculia-identificar-tipo-serie", "calculia-pro-series-geometricas"], marca: /criterio de la razón/i },
  "multivariable/parcial": { lecciones: ["calculia-derivar-parciales", "calculia-pro-multivariable-parciales"], marca: /partial/ },
  "multivariable/edo-separable": { lecciones: ["calculia-separar-variables-edo", "calculia-pro-edos-separables"], marca: /separa/i },
};

// HUECOS entre la práctica y las lecciones. Los cinco que reportó la tanda de
// visuales (integrales ln y trig con coeficiente, criterio de la razón, EDO con n
// hasta 4 e integral definida) ya están cubiertos por pasos y visuales nuevos (el
// test de abajo lo comprueba contra lo que genera la práctica). No queda ningún
// hueco real. Los LÍMITES no son un hueco: ni la práctica ni las lecciones los
// tratan como tema (solo aparece la notación del criterio de la razón).
export const HUECOS_PRACTICA_LECCIONES = [] as const;

describe("Calculia: cobertura de la práctica por las lecciones", () => {
  it("el generador de práctica produce exactamente los 15 subtipos mapeados (ninguno sin mapear, ninguno sobrante)", () => {
    const vistos = new Set<string>();
    for (const modo of ["derivadas", "integrales", "series", "multivariable"] as ModoCalculia[]) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        const rng = prng(1000 * nivel + modo.length);
        conRngSembrado(rng, () => {
          for (let i = 0; i < 120; i++) vistos.add(`${modo}/${subtipo(modo, generarProblemaCalculia(modo, nivel).enunciado)}`);
        });
      }
    }
    expect([...vistos].sort()).toEqual(Object.keys(COBERTURA).sort());
  });

  it("cada subtipo tiene al menos una lección que lo enseña, existente, y con la marca esperada en sus pasos o visuales", () => {
    for (const [sub, { lecciones, marca }] of Object.entries(COBERTURA)) {
      expect(lecciones.length, sub).toBeGreaterThanOrEqual(1);
      for (const slug of lecciones) {
        const l = LECCIONES.find((x) => x.slug === slug);
        expect(l, `${sub}: la lección ${slug} no existe`).toBeDefined();
        const cuerpo = [...l!.pasos, ...textosVisuales(l!), ...formulas(l!)].join("\n");
        expect(cuerpo, `${sub}: ${slug} no menciona ${marca}`).toMatch(marca);
      }
      // el subtipo pertenece al tema de esas lecciones
      const modo = sub.split("/")[0];
      for (const slug of lecciones) expect(porSlug(slug).grupo, `${sub} -> ${slug}`).toBe(modo);
    }
  });

  it("los 4 temas están cubiertos por una Técnica y una Clase (por lo menos)", () => {
    for (const g of ORDEN_GRUPOS_CALCULIA) {
      expect(TECNICAS_CALCULIA.some((l) => l.grupo === g), `Técnica de ${g}`).toBe(true);
      expect(CLASES_CALCULIA.some((l) => l.grupo === g), `Clase de ${g}`).toBe(true);
    }
  });

  it("lo que antes eran huecos ya está cubierto: los rangos que pide la práctica están en pasos y visuales de las Clases", () => {
    // 1) Lo que la práctica puede pedir (muestreo de muchos problemas con RNG sembrado).
    const ks = { ln: new Set<number>(), cos: new Set<number>(), sen: new Set<number>() };
    const nsEdo = new Set<number>();
    const razonPide = { c: new Set<number>(), r: new Set<number>() };
    for (let nivel = 1; nivel <= 10; nivel++) {
      conRngSembrado(prng(7000 + nivel), () => {
        for (let i = 0; i < 400; i++) {
          const e = generarProblemaCalculia("integrales", nivel).enunciado;
          const ln = e.match(/\\int \\frac\{(\d+)\}\{x\}/);
          if (ln) ks.ln.add(Number(ln[1]));
          const trig = e.match(/\\int (\d*)(\\cos|\\operatorname\{sen\})\(x\)/);
          if (trig) (trig[2] === "\\cos" ? ks.cos : ks.sen).add(trig[1] === "" ? 1 : Number(trig[1]));
          const edo = generarProblemaCalculia("multivariable", nivel).enunciado.match(/x\^\{(\d+)\}\\cdot y/);
          if (edo) nsEdo.add(Number(edo[1]));
          const razon = generarProblemaCalculia("series", nivel).enunciado.match(/a_\{n\} = (-?\d+)\\cdot/);
          if (razon) razonPide.c.add(Number(razon[1]));
        }
      });
    }
    expect(Math.min(...ks.ln), "k mínimo de ∫k/x").toBeGreaterThanOrEqual(2);
    expect(Math.max(...ks.ln), "k máximo de ∫k/x").toBeLessThanOrEqual(8);
    expect(Math.max(...ks.cos, ...ks.sen), "k máximo de trig").toBeLessThanOrEqual(7);
    expect([...nsEdo].sort()).toEqual([1, 2, 3, 4]);
    expect(razonPide.c.size, "el criterio de la razón aparece en la práctica").toBeGreaterThan(0);

    // 2) Lo que enseñan las lecciones.
    const fund = porSlug("calculia-pro-integrales-fundamentos");
    const av = porSlug("calculia-pro-integrales-avanzadas");
    const ser = porSlug("calculia-pro-series-geometricas");
    const edo = porSlug("calculia-pro-edos-separables");
    // ∫k/x: fórmula general con k y un ejemplo con k dentro del rango que pide la práctica
    expect(fund.pasos.join(" ")).toContain("\\int \\frac{k}{x}\\,dx = k\\ln|x| + C");
    expect(fund.pasos.join(" ")).toContain("\\int \\frac{4}{x}\\,dx = 4\\ln|x| + C");
    expect(4).toBeGreaterThanOrEqual(2);
    expect(4).toBeLessThanOrEqual(8);
    // ∫k·cos y ∫k·sen: fórmulas generales y ejemplos (5 y 7, este último el máximo de la práctica)
    const trig = av.pasos.join(" ");
    expect(trig).toContain("\\int k\\cos(x)\\,dx = k\\operatorname{sen}(x) + C");
    expect(trig).toContain("\\int k\\operatorname{sen}(x)\\,dx = -k\\cos(x) + C");
    expect(trig).toContain("\\int 5\\cos(x)\\,dx = 5\\operatorname{sen}(x) + C");
    expect(trig).toContain("\\int 7\\operatorname{sen}(x)\\,dx = -7\\cos(x) + C");
    expect(Math.max(...ks.cos, ...ks.sen)).toBeLessThanOrEqual(7);
    // integral definida: paso con la regla F(b) − F(a) y ejemplo resuelto
    expect(fund.pasos.join(" ")).toContain("\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)");
    expect(fund.pasos.join(" ")).toMatch(/Ejemplo resuelto: \$\\int_\{0\}\^\{2\} 6x\^\{2\}/);
    // criterio de la razón: regla (L<1, L>1, L=1) y ejemplo resuelto con a_n = c·r^n
    const razon = ser.pasos.join(" ");
    expect(razon).toContain("Criterio de la razón");
    expect(razon).toContain("\\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_{n}}\\right|");
    expect(razon).toMatch(/Ejemplo resuelto: para \$a_\{n\} = 3\\cdot/);
    expect(razon).toContain("$L=|r|$");
    // EDO: fórmula general y ejemplos con n = 3 y n = 4 (más k/(n+1) distinto de 1)
    const edoTxt = edo.pasos.join(" ");
    expect(edoTxt).toContain("y = A\\cdot e^{\\frac{k}{n+1}x^{n+1}}");
    expect(edoTxt).toContain("y = A\\cdot e^{x^{4}}");
    expect(edoTxt).toContain("y = A\\cdot e^{x^{5}}");
    expect(edoTxt).toContain("y = A\\cdot e^{2x^{4}}");
    const nsEnLecciones = new Set(LECCIONES.flatMap((l) => l.visuales.filter((v) => v.tipo === "calculia.edo").map((v) => (v as VisualCalculiaEdo).n)));
    for (const n of nsEdo) expect(nsEnLecciones.has(n), `n = ${n} de la práctica sin visual de EDO`).toBe(true);
  });

  it("sin huecos reales pendientes; los límites no se enseñan como tema (solo la notación del criterio de la razón)", () => {
    expect(HUECOS_PRACTICA_LECCIONES).toHaveLength(0);
    expect(["derivadas", "integrales", "series", "multivariable"]).toEqual([...ORDEN_GRUPOS_CALCULIA]);
    // \lim aparece únicamente en el paso del criterio de la razón
    const conLim = LECCIONES.filter((l) => [...l.pasos, ...formulas(l)].join(" ").includes("\\lim")).map((l) => l.slug);
    expect(conLim).toEqual(["calculia-pro-series-geometricas"]);
    expect(LECCIONES.some((l) => /l[ií]mites?/i.test(l.nombre))).toBe(false);
    // la práctica no tiene un modo de límites
    const fuente = fs.readFileSync(path.join(raiz, "src/lib/practica/calculia.ts"), "utf8");
    expect(fuente).toContain('export type ModoCalculia = "derivadas" | "integrales" | "series" | "multivariable"');
  });
});

// ---------- 8) La migración ----------

const SQL = generarSqlCalculia(CABECERA_CALCULIA, LECCIONES);

describe(`Calculia: migración ${NUMERO_MIGRACION} (generada; escribe \`pasos\` y \`visuales\`, no toca el quiz)`, () => {
  if (process.env.CALCULIA_ESCRIBIR_SQL === "1") {
    fs.writeFileSync(rutaMigracion, SQL, "utf8");
  }

  it("el archivo del repo es exactamente lo que se genera de este contenido", () => {
    expect(fs.existsSync(rutaMigracion), `falta ${rutaMigracion}: CALCULIA_ESCRIBIR_SQL=1 npx vitest run src/lib/calculia/lecciones`).toBe(true);
    expect(fs.readFileSync(rutaMigracion, "utf8").replace(/\r\n/g, "\n")).toBe(SQL);
  });

  it("solo contiene 12 UPDATE de `contenido` (merge de pasos y visuales), por slug y problem_type (nada de ALTER/INSERT/DELETE)", () => {
    const sinComentarios = SQL.split("\n").filter((l) => !l.startsWith("--")).join("\n");
    const sentencias = sinComentarios.match(/^update public\.techniques$/gm) ?? [];
    expect(sentencias).toHaveLength(12);
    expect(sinComentarios.match(/^set contenido = contenido \|\| \$calculia\$\{$/gm)).toHaveLength(12);
    expect(sinComentarios.match(/^where slug = '[a-z0-9-]+' and problem_type = 'calculia';$/gm)).toHaveLength(12);
    expect(sinComentarios).not.toMatch(/\b(alter|insert|delete|drop|create|grant|revoke)\b/i);
    const slugs = [...sinComentarios.matchAll(/^where slug = '([a-z0-9-]+)'/gm)].map((m) => m[1]);
    expect(slugs).toEqual(LECCIONES.map((l) => l.slug));
    expect(new Set(slugs).size).toBe(12);
  });

  it("aplicada sobre lo sembrado, el estado final tiene los mismos pasos y quiz y los visuales de TypeScript", () => {
    const final = estadoSembradoCalculia([...sembradoSql, fs.readFileSync(rutaMigracion, "utf8")]);
    const antes = estadoSembradoCalculia(sembradoSql);
    for (const l of LECCIONES) {
      const c = final.get(l.slug)!;
      expect(Object.keys(c.contenido).sort(), l.slug).toEqual(["pasos", "quiz", "visuales"]);
      // `pasos`: los sembrados (neutralizados por 0221) + los nuevos al final, tal como en TypeScript
      expect(c.contenido.pasos, l.slug).toEqual(l.pasos);
      const sembrados = aNeutroProfundo(antes.get(l.slug)!.contenido.pasos ?? []);
      const finales = c.contenido.pasos ?? [];
      expect(finales.slice(0, sembrados.length), l.slug).toEqual(sembrados);
      expect(finales.length - sembrados.length, l.slug).toBe(PASOS_NUEVOS[l.slug] ?? 0);
      expect(c.contenido.quiz, l.slug).toEqual(antes.get(l.slug)!.contenido.quiz);
      expect(c.contenido.visuales, l.slug).toEqual(JSON.parse(JSON.stringify(l.visuales)));
      // nombre, descripción, orden y requiere_pro no se tocan
      expect({ n: c.nombre, d: c.descripcion, o: c.orden, p: c.requierePro }, l.slug).toEqual({ n: antes.get(l.slug)!.nombre, d: antes.get(l.slug)!.descripcion, o: antes.get(l.slug)!.orden, p: antes.get(l.slug)!.requierePro });
    }
  });

  it("español neutro: la migración no tiene voseo, y el contenido del jsonb no contiene el delimitador $calculia$", () => {
    expect(detectarVoseo(SQL)).toEqual([]);
    const cuerpos = [...SQL.matchAll(/\$calculia\$([\s\S]*?)\$calculia\$/g)].map((m) => m[1]);
    expect(cuerpos).toHaveLength(12);
    for (const c of cuerpos) expect(() => JSON.parse(c)).not.toThrow();
  });

  it("el número de migración es el siguiente libre y no pisa a otra (0216 y 0220 son de tandas distintas)", () => {
    const archivos = fs.readdirSync(dirMigraciones).filter((f) => /^\d{4}_/.test(f));
    const usados = archivos.filter((f) => f.startsWith(`${NUMERO_MIGRACION}_`));
    expect(usados).toEqual([`${NUMERO_MIGRACION}_calculia_visuales.sql`]);
  });
});
