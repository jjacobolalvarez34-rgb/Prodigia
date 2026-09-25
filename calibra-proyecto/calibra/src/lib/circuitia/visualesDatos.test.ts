import { describe, it, expect } from "vitest";
import { clasificarCircuito, datosLeyOhm, datosResistenciaEquivalente, listarResistores, redondear2, resolverParaVisual } from "./visualesDatos";
import { resolverCircuito, type NodoCircuito } from "@/lib/circuitos/resolver";

// Los datos de los visuales de Circuitia se verifican contra cálculos
// INDEPENDIENTES de resolver.ts: valores de libro escritos a mano (Ley de
// Ohm, serie, paralelo, mixto) y propiedades físicas (ley de mallas, ley de
// nodos y conservación de la potencia) sobre muchos circuitos.

const r = (id: string, ohmios: number): NodoCircuito => ({ tipo: "resistor", id, ohmios });
const serie = (...hijos: NodoCircuito[]): NodoCircuito => ({ tipo: "serie", hijos });
const paralelo = (...hijos: NodoCircuito[]): NodoCircuito => ({ tipo: "paralelo", hijos });

function valores(topologia: NodoCircuito, v: number) {
  return Object.fromEntries(resolverParaVisual(topologia, v).map((x) => [x.id, { v: x.voltaje, i: x.corriente }]));
}

describe("resolverParaVisual: valores de libro a mano", () => {
  it("serie 10 Ω + 20 Ω con 12 V: I = 12/30 = 0,4 A; V1 = 4 V; V2 = 8 V", () => {
    expect(valores(serie(r("R1", 10), r("R2", 20)), 12)).toEqual({ R1: { v: 4, i: 0.4 }, R2: { v: 8, i: 0.4 } });
  });

  it("paralelo 10 Ω || 20 Ω con 12 V: cada uno ve 12 V; I1 = 1,2 A; I2 = 0,6 A", () => {
    expect(valores(paralelo(r("R1", 10), r("R2", 20)), 12)).toEqual({ R1: { v: 12, i: 1.2 }, R2: { v: 12, i: 0.6 } });
  });

  it("paralelo 4 Ω, 6 Ω, 12 Ω con 12 V: 3 A, 2 A y 1 A", () => {
    expect(valores(paralelo(r("R1", 4), r("R2", 6), r("R3", 12)), 12)).toEqual({ R1: { v: 12, i: 3 }, R2: { v: 12, i: 2 }, R3: { v: 12, i: 1 } });
  });

  it("paralelo 4 Ω, 12 Ω, 12 Ω con 12 V: la rama R3 sigue en 1 A (no cambia al duplicar R2)", () => {
    const antes = valores(paralelo(r("R1", 4), r("R2", 6), r("R3", 12)), 12);
    const despues = valores(paralelo(r("R1", 4), r("R2", 12), r("R3", 12)), 12);
    expect(despues.R2.i).toBe(1);
    expect(despues.R3.i).toBe(antes.R3.i);
    expect(despues.R1.i).toBe(antes.R1.i);
  });

  it("mixto Rs1 = 10 Ω + (20 Ω || 20 Ω) con 12 V: R_eq = 20 Ω, I = 0,6 A; Rs1 = 6 V; el bloque 6 V con 0,3 A por rama", () => {
    expect(valores(serie(r("Rs1", 10), paralelo(r("Rp1", 20), r("Rp2", 20))), 12)).toEqual({
      Rs1: { v: 6, i: 0.6 },
      Rp1: { v: 6, i: 0.3 },
      Rp2: { v: 6, i: 0.3 },
    });
  });

  it("mixto 5 Ω + (20 Ω || 20 Ω) + 5 Ω con 20 V: I = 1 A; 5 V + 10 V + 5 V; 0,5 A por rama", () => {
    expect(valores(serie(r("Rs1", 5), paralelo(r("Rp1", 20), r("Rp2", 20)), r("Rs2", 5)), 20)).toEqual({
      Rs1: { v: 5, i: 1 },
      Rp1: { v: 10, i: 0.5 },
      Rp2: { v: 10, i: 0.5 },
      Rs2: { v: 5, i: 1 },
    });
  });

  it("serie 10 Ω + 10 Ω con 20 V: 1 A; con R1 = 20 Ω: 0,67 A; con R1 = 5 Ω: 1,33 A", () => {
    expect(valores(serie(r("R1", 10), r("R2", 10)), 20).R1.i).toBe(1);
    expect(valores(serie(r("R1", 20), r("R2", 10)), 20).R1.i).toBe(0.67);
    expect(valores(serie(r("R1", 5), r("R2", 10)), 20).R1.i).toBe(1.33);
  });

  it("serie de 3: 10 Ω + 20 Ω + 30 Ω con 12 V: R_eq = 60 Ω, I = 0,2 A; 2 V + 4 V + 6 V = 12 V", () => {
    expect(valores(serie(r("R1", 10), r("R2", 20), r("R3", 30)), 12)).toEqual({ R1: { v: 2, i: 0.2 }, R2: { v: 4, i: 0.2 }, R3: { v: 6, i: 0.2 } });
  });

  it("serie 10 Ω + 10 Ω con 20 V, voltajes: 10 V cada uno; con R1 = 20 Ω: 13,33 V y 6,67 V; con R1 = 5 Ω: 6,67 V y 13,33 V (siempre suman 20 V)", () => {
    // I = 20/30 y V = I·R escritos a mano: 20·20/30 = 13,33; 20·10/30 = 6,67.
    expect(valores(serie(r("R1", 10), r("R2", 10)), 20)).toEqual({ R1: { v: 10, i: 1 }, R2: { v: 10, i: 1 } });
    expect(valores(serie(r("R1", 20), r("R2", 10)), 20)).toEqual({ R1: { v: 13.33, i: 0.67 }, R2: { v: 6.67, i: 0.67 } });
    expect(valores(serie(r("R1", 5), r("R2", 10)), 20)).toEqual({ R1: { v: 6.67, i: 1.33 }, R2: { v: 13.33, i: 1.33 } });
  });

  it("paralelo 4/6/12 Ω con 12 V: al reducir R2 a 3 Ω sube a 4 A y R1 y R3 no cambian (12 V; 3 A y 1 A)", () => {
    expect(valores(paralelo(r("R1", 4), r("R2", 3), r("R3", 12)), 12)).toEqual({ R1: { v: 12, i: 3 }, R2: { v: 12, i: 4 }, R3: { v: 12, i: 1 } });
  });

  it("mixto 10 Ω + (20 Ω || Rp2) con 12 V: la rama HERMANA sí cambia (a mano con fracciones)", () => {
    // Rp2 = 40: bloque = 20·40/60 = 40/3; R_eq = 10 + 40/3 = 70/3; I = 12·3/70 = 36/70;
    // Rs1 = 10·36/70 = 360/70; bloque = 12 − 360/70 = 480/70; Rp1: (480/70)/20; Rp2: (480/70)/40.
    const dup = valores(serie(r("Rs1", 10), paralelo(r("Rp1", 20), r("Rp2", 40))), 12);
    expect(dup.Rs1.i).toBeCloseTo(36 / 70, 2);
    expect(dup.Rs1.v).toBeCloseTo(360 / 70, 2);
    expect(dup.Rp1.v).toBeCloseTo(480 / 70, 2);
    expect(dup.Rp1.i).toBeCloseTo(480 / 70 / 20, 2);
    expect(dup.Rp2.i).toBeCloseTo(480 / 70 / 40, 2);
    expect([dup.Rs1.i, dup.Rs1.v, dup.Rp1.v, dup.Rp1.i, dup.Rp2.i]).toEqual([0.51, 5.14, 6.86, 0.34, 0.17]);
    // Rp2 = 10: bloque = 20·10/30 = 20/3; R_eq = 10 + 20/3 = 50/3; I = 12·3/50 = 0,72;
    // Rs1 = 7,2 V; bloque = 4,8 V; Rp1 = 4,8/20 = 0,24; Rp2 = 4,8/10 = 0,48.
    expect(valores(serie(r("Rs1", 10), paralelo(r("Rp1", 20), r("Rp2", 10))), 12)).toEqual({
      Rs1: { v: 7.2, i: 0.72 },
      Rp1: { v: 4.8, i: 0.24 },
      Rp2: { v: 4.8, i: 0.48 },
    });
    // Contra la base (0,3 A y 6 V en Rp1): duplicar Rp2 AUMENTA a Rp1; reducirlo la DISMINUYE.
    const base = valores(serie(r("Rs1", 10), paralelo(r("Rp1", 20), r("Rp2", 20))), 12);
    expect(dup.Rp1.i).toBeGreaterThan(base.Rp1.i);
    expect(dup.Rp1.v).toBeGreaterThan(base.Rp1.v);
  });

  it("listarResistores devuelve los resistores en orden de lectura", () => {
    const t = serie(r("Rs1", 5), paralelo(r("Rp1", 20), r("Rp2", 20)), r("Rs2", 5));
    expect(listarResistores(t).map((x) => x.id)).toEqual(["Rs1", "Rp1", "Rp2", "Rs2"]);
  });
});

// Generador determinista (LCG) para las propiedades.
function crearRng(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe("resolverCircuito: propiedades físicas sobre muchos circuitos (sin redondear)", () => {
  const POOL = [10, 22, 33, 47, 68, 100, 150, 220, 330, 470];
  const VOLTAJES = [6, 9, 12, 15, 18, 24];
  const cerca = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

  it("V = I·R en cada resistor, ley de mallas (serie), ley de nodos (paralelo) y potencia entregada = disipada", () => {
    const rng = crearRng(20260924);
    const elegir = <T,>(a: T[]) => a[Math.floor(rng() * a.length)];
    for (let k = 0; k < 300; k++) {
      const vf = elegir(VOLTAJES);
      const forma = k % 4;
      let topologia: NodoCircuito;
      if (forma === 0) topologia = serie(r("R1", elegir(POOL)), r("R2", elegir(POOL)), r("R3", elegir(POOL)));
      else if (forma === 1) topologia = paralelo(r("R1", elegir(POOL)), r("R2", elegir(POOL)), r("R3", elegir(POOL)));
      else if (forma === 2) topologia = serie(r("Rs1", elegir(POOL)), paralelo(r("Rp1", elegir(POOL)), r("Rp2", elegir(POOL))));
      else topologia = serie(r("Rs1", elegir(POOL)), paralelo(r("Rp1", elegir(POOL)), r("Rp2", elegir(POOL))), r("Rs2", elegir(POOL)));
      const lista = listarResistores(topologia);
      const res = resolverCircuito(topologia, vf);
      for (const { id, ohmios } of lista) expect(cerca(res.get(id)!.voltaje, res.get(id)!.corriente * ohmios), `${k} ${id}: V = I·R`).toBe(true);
      if (forma === 0) {
        expect(cerca(lista.reduce((a, x) => a + res.get(x.id)!.voltaje, 0), vf), `${k}: suma de voltajes = fuente`).toBe(true);
        expect(new Set(lista.map((x) => res.get(x.id)!.corriente)).size, `${k}: misma corriente`).toBe(1);
      }
      if (forma === 1) {
        expect(lista.every((x) => res.get(x.id)!.voltaje === vf), `${k}: mismo voltaje`).toBe(true);
        const iTotal = lista.reduce((a, x) => a + res.get(x.id)!.corriente, 0);
        expect(cerca(iTotal, vf * lista.reduce((a, x) => a + 1 / x.ohmios, 0)), `${k}: nodos`).toBe(true);
      }
      if (forma >= 2) {
        const rs1 = res.get("Rs1")!;
        expect(res.get("Rp1")!.voltaje, `${k}: bloque`).toBe(res.get("Rp2")!.voltaje);
        expect(cerca(res.get("Rp1")!.corriente + res.get("Rp2")!.corriente, rs1.corriente), `${k}: nodo del bloque`).toBe(true);
        // La suma de los voltajes a lo largo de la serie (Rs1, bloque, Rs2) es la fuente.
        const vSerie = rs1.voltaje + res.get("Rp1")!.voltaje + (res.get("Rs2")?.voltaje ?? 0);
        expect(cerca(vSerie, vf), `${k}: mallas`).toBe(true);
      }
      const iFuente = forma === 1 ? lista.reduce((a, x) => a + res.get(x.id)!.corriente, 0) : res.get(lista[0].id)!.corriente;
      const disipada = lista.reduce((a, x) => a + res.get(x.id)!.corriente ** 2 * x.ohmios, 0);
      expect(cerca(disipada, vf * iFuente), `${k}: potencia`).toBe(true);
    }
  });
});

describe("datosResistenciaEquivalente", () => {
  it("serie 8 Ω + 8 Ω = 16 Ω", () => {
    const d = datosResistenciaEquivalente("serie", [8, 8]);
    expect(d.total).toBe(16);
    expect(d.formulas).toHaveLength(1);
    expect(d.formulas[0]).toContain("8\\,\\Omega + 8\\,\\Omega = 16\\,\\Omega");
  });

  it("paralelo 8 Ω || 8 Ω = 4 Ω (el caso especial R/2)", () => {
    const d = datosResistenciaEquivalente("paralelo", [8, 8]);
    expect(d.total).toBe(4);
    expect(d.formulas).toHaveLength(2);
    expect(d.formulas[0]).toContain("\\frac{1}{8} + \\frac{1}{8} = 0.25");
    expect(d.formulas[1]).toBe("R_{\\text{eq}} = 4\\,\\Omega");
  });

  it("paralelo 10 Ω || 20 Ω: 1/R = 0,15 y R_eq = 6,67 Ω", () => {
    const d = datosResistenciaEquivalente("paralelo", [10, 20]);
    expect(d.total).toBe(6.67);
    expect(d.formulas[0]).toContain("= 0.15");
  });

  it("paralelo 20 Ω || 20 Ω = 10 Ω", () => {
    expect(datosResistenciaEquivalente("paralelo", [20, 20]).total).toBe(10);
  });

  it("paralelo de 3: la suma de recíprocos que se muestra es consistente con el resultado", () => {
    const d = datosResistenciaEquivalente("paralelo", [10, 20, 30]);
    // 1/10 + 1/20 + 1/30 = 11/60 = 0,18333… -> R_eq = 60/11 = 5,4545…
    expect(d.total).toBe(5.45);
    expect(d.formulas[0]).toContain("= 0.1833");
    expect(Math.abs(1 / 0.1833 - d.total)).toBeLessThan(0.01);
  });

  it("el paralelo siempre da menos que el resistor más pequeño; la serie más que el mayor", () => {
    const rng = crearRng(7);
    for (let k = 0; k < 100; k++) {
      const oh = Array.from({ length: 2 + (k % 2) }, () => 1 + Math.floor(rng() * 200));
      expect(datosResistenciaEquivalente("paralelo", oh).total).toBeLessThanOrEqual(Math.min(...oh));
      expect(datosResistenciaEquivalente("serie", oh).total).toBe(oh.reduce((a, b) => a + b, 0));
    }
  });

  it("rechaza menos de 2 resistores", () => {
    expect(() => datosResistenciaEquivalente("serie", [5])).toThrow();
  });
});

describe("datosLeyOhm (V = I·R)", () => {
  it("dados V y R calcula I", () => {
    expect(datosLeyOhm({ v: 12, r: 30 })).toEqual({ v: 12, i: 0.4, r: 30, incognita: "i" });
    expect(datosLeyOhm({ v: 20, r: 20 })).toMatchObject({ i: 1, incognita: "i" });
  });
  it("dados I y R calcula V", () => {
    expect(datosLeyOhm({ i: 0.5, r: 10 })).toEqual({ v: 5, i: 0.5, r: 10, incognita: "v" });
  });
  it("dados V e I calcula R", () => {
    expect(datosLeyOhm({ v: 12, i: 2 })).toEqual({ v: 12, i: 2, r: 6, incognita: "r" });
  });
  it("exige exactamente 2 de los 3 valores y evita dividir por cero", () => {
    expect(() => datosLeyOhm({ v: 1 })).toThrow();
    expect(() => datosLeyOhm({ v: 1, i: 1, r: 1 })).toThrow();
    expect(() => datosLeyOhm({ v: 5, r: 0 })).toThrow();
    expect(() => datosLeyOhm({ v: 5, i: 0 })).toThrow();
  });
  it("redondear2 redondea a 2 decimales", () => {
    expect(redondear2(2 / 3)).toBe(0.67);
  });
});

describe("clasificarCircuito", () => {
  it("distingue serie, paralelo y mixto", () => {
    expect(clasificarCircuito(serie(r("R1", 1), r("R2", 1)))).toBe("serie");
    expect(clasificarCircuito(paralelo(r("R1", 1), r("R2", 1)))).toBe("paralelo");
    expect(clasificarCircuito(serie(r("R1", 1), paralelo(r("R2", 1), r("R3", 1))))).toBe("mixto");
    expect(clasificarCircuito(r("R1", 1))).toBe("serie");
  });
});
