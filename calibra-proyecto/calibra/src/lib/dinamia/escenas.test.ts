import { describe, expect, it } from "vitest";
import type { Escena } from "@/lib/dibujo/escena";
import { escenaDinamia } from "./escenas";
import { TIPOS_VISUALES_DINAMIA, type VisualDinamia } from "./visuales";

// Un ejemplo (o varios) de cada tipo y modo.
export const EJEMPLOS_DINAMIA: VisualDinamia[] = [
  { tipo: "dinamia.trayecto", v0: 0, a: 2, segundos: 4 },
  { tipo: "dinamia.trayecto", v0: 10, a: 0, segundos: 3 },
  { tipo: "dinamia.trayecto", v0: 12, a: -3, segundos: 4 },
  { tipo: "dinamia.grafica", eje: "x-t", v0: 2, a: 1, segundos: 4 },
  { tipo: "dinamia.grafica", eje: "v-t", v0: 10, a: -2, segundos: 5, x0: 3 },
  { tipo: "dinamia.caida", g: 10, v0: 0, segundos: 3 },
  { tipo: "dinamia.caida", g: 10, v0: 20, segundos: 4 },
  { tipo: "dinamia.parabola", v0: 20, angulo: 45 },
  { tipo: "dinamia.parabola", v0: 10, angulo: 30 },
  { tipo: "dinamia.vectores", modo: "suma", vectores: [{ nombre: "A", x: 3, y: 0 }, { nombre: "B", x: 0, y: 4 }] },
  { tipo: "dinamia.vectores", modo: "componentes", vectores: [{ nombre: "F", x: 6, y: 8 }] },
  { tipo: "dinamia.vectores", modo: "equilibrante", vectores: [{ nombre: "F₁", x: 5, y: 0 }, { nombre: "F₂", x: -2, y: 4 }] },
  { tipo: "dinamia.cuerpoLibre", situacion: "piso", masa: 5 },
  { tipo: "dinamia.cuerpoLibre", situacion: "empujado", masa: 10, empuje: 50, mu: 0.2 },
  { tipo: "dinamia.cuerpoLibre", situacion: "plano", masa: 4, angulo: 30, mu: 0.1 },
  { tipo: "dinamia.cuerpoLibre", situacion: "colgando", masa: 3 },
  { tipo: "dinamia.poleas", m1: 3, m2: 2 },
  { tipo: "dinamia.circular", masa: 2, radio: 4, v: 6 },
  { tipo: "dinamia.energia", masa: 2, altura: 5 },
  { tipo: "dinamia.energia", masa: 1, altura: 20, perdida: 0.25 },
  { tipo: "dinamia.choque", m1: 2, v1: 6, m2: 1, v2: 0, clase: "plastico" },
  { tipo: "dinamia.choque", m1: 1, v1: 4, m2: 1, v2: 0, clase: "elastico" },
  { tipo: "dinamia.termometro", modo: "escalas", temperaturas: [0, 25, 100] },
  { tipo: "dinamia.termometro", modo: "calentamiento" },
  { tipo: "dinamia.particulas", modo: "temperatura", valores: [200, 300, 450] },
  { tipo: "dinamia.particulas", modo: "boyle", valores: [4, 2, 1], inicial: 1 },
  { tipo: "dinamia.particulas", modo: "charles", valores: [300, 450, 600], inicial: 2 },
  { tipo: "dinamia.ciclo", qc: 1000, w: 300 },
  { tipo: "dinamia.fluido", modo: "presion", profundidades: [1, 3, 5] },
  { tipo: "dinamia.fluido", modo: "prensa", f1: 100, a1: 0.01, a2: 0.5 },
  { tipo: "dinamia.fluido", modo: "flota", densidad: 600, liquido: 1000 },
  { tipo: "dinamia.fluido", modo: "flota", densidad: 2700, liquido: 1000 },
  { tipo: "dinamia.tubo", modo: "continuidad", v1: 2, k: 3 },
  { tipo: "dinamia.tubo", modo: "torricelli", h: 5 },
];

// Revisa que cada cuadro de la escena tenga solo números finitos y textos sanos.
export function revisarEscena(e: Escena): string[] {
  const fallas: string[] = [];
  if (!Number.isInteger(e.pasos) || e.pasos < 1) fallas.push(`pasos ${e.pasos}`);
  if (!(e.ms > 0)) fallas.push(`ms ${e.ms}`);
  if (!e.alternativa || /NaN|undefined|Infinity/.test(e.alternativa)) fallas.push(`alternativa «${e.alternativa}»`);
  for (let paso = 0; paso <= e.pasos; paso++) {
    const ley = e.leyenda(paso);
    if (ley !== null && /NaN|undefined|Infinity/.test(ley)) fallas.push(`leyenda ${paso}: «${ley}»`);
    for (const t of [0, 0.37, 1]) {
      const d = e.dibujar(paso, t);
      if (!(d.ancho > 0 && d.alto > 0)) fallas.push(`tamaño ${paso}/${t}`);
      for (const p of d.prims) {
        for (const [k, val] of Object.entries(p)) {
          if (typeof val === "number" && !Number.isFinite(val)) fallas.push(`${paso}/${t} ${p.t}.${k} = ${val}`);
          if (typeof val === "string" && /NaN|undefined|Infinity/.test(val)) fallas.push(`${paso}/${t} ${p.t}.${k} = «${val}»`);
        }
      }
    }
  }
  return fallas;
}

describe("escenas de Dinamia", () => {
  it("hay ejemplo de cada tipo", () => {
    const tipos = new Set(EJEMPLOS_DINAMIA.map((v) => v.tipo));
    for (const t of TIPOS_VISUALES_DINAMIA) expect(tipos.has(t), t).toBe(true);
  });

  for (const v of EJEMPLOS_DINAMIA) {
    it(`${v.tipo} ${JSON.stringify(v).slice(0, 80)}`, () => {
      const e = escenaDinamia(v);
      expect(e).not.toBeNull();
      expect(revisarEscena(e!)).toEqual([]);
    });
  }

  it("con datos rotos no arma escena", () => {
    const malos = [
      { tipo: "dinamia.trayecto", v0: NaN, a: 1, segundos: 3 },
      { tipo: "dinamia.parabola", v0: 10, angulo: 50 },
      { tipo: "dinamia.vectores", modo: "suma", vectores: [] },
      { tipo: "dinamia.choque", m1: 1, v1: 0, m2: 1, v2: 3, clase: "plastico" },
      { tipo: "dinamia.ciclo", qc: 100, w: 200 },
      { tipo: "dinamia.fluido", modo: "prensa", f1: 10, a1: 2, a2: 1 },
      { tipo: "dinamia.desconocido" },
    ] as unknown as VisualDinamia[];
    for (const v of malos) expect(escenaDinamia(v), v.tipo).toBeNull();
  });

  it("los números van con coma decimal", () => {
    const e = escenaDinamia({ tipo: "dinamia.caida", g: 9.8, v0: 0, segundos: 1.5 })!;
    const textos = [1, 2, 3].map((p) => e.leyenda(p) ?? "").join(" ");
    expect(textos).not.toMatch(/\d\.\d/);
  });
});
