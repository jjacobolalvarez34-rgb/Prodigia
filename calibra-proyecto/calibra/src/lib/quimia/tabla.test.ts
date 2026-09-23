import { describe, it, expect } from "vitest";
import { ELEMENTOS } from "@/lib/practica/quimia";
import {
  ORDEN_FAMILIAS,
  bloqueDe,
  familiaDe,
  periodoPorZ,
  posicionEnTabla,
  simbolosDeSelector,
  tieneGrupoDefinido,
  tipoDe,
  FILAS_TABLA,
  COLUMNAS_TABLA,
} from "./tabla";

// Cálculo independiente del período y el grupo de un elemento SOLO a partir
// de su número atómico (longitud de los períodos: 2, 8, 8, 18, 18, 32, 32).
// Devuelve grupo=null para el bloque f (La–Lu y Ac–Lr, convención de la
// tabla de 15 elementos por fila).
function ubicacionPorZ(z: number): { periodo: number; grupo: number | null } {
  const largos = [2, 8, 8, 18, 18, 32, 32];
  let resto = z;
  for (let p = 0; p < largos.length; p++) {
    if (resto <= largos[p]) {
      const i = resto;
      const periodo = p + 1;
      if (periodo === 1) return { periodo, grupo: i === 1 ? 1 : 18 };
      if (periodo <= 3) return { periodo, grupo: i <= 2 ? i : i + 10 };
      if (periodo <= 5) return { periodo, grupo: i };
      if (i <= 2) return { periodo, grupo: i };
      if (i <= 17) return { periodo, grupo: null }; // bloque f
      return { periodo, grupo: i - 14 };
    }
    resto -= largos[p];
  }
  throw new Error("Z fuera de rango");
}

describe("tabla: ubicación derivada de ELEMENTOS", () => {
  it("118 elementos, número atómico 1..118 sin repetir", () => {
    expect(ELEMENTOS).toHaveLength(118);
    expect(new Set(ELEMENTOS.map((e) => e.numeroAtomico)).size).toBe(118);
    expect(new Set(ELEMENTOS.map((e) => e.simbolo)).size).toBe(118);
  });

  it("período y grupo de los 118 coinciden con el cálculo independiente por Z", () => {
    for (const e of ELEMENTOS) {
      const u = ubicacionPorZ(e.numeroAtomico);
      expect(e.periodo, `${e.simbolo}: período`).toBe(u.periodo);
      expect(periodoPorZ(e.numeroAtomico), `${e.simbolo}: periodoPorZ`).toBe(u.periodo);
      if (u.grupo === null) {
        // Bloque f: ELEMENTOS los guarda con grupo 3 (convención) y NO tienen grupo definido.
        expect(tieneGrupoDefinido(e), e.simbolo).toBe(false);
        expect(e.grupo).toBe(3);
      } else {
        expect(tieneGrupoDefinido(e), e.simbolo).toBe(true);
        expect(e.grupo, `${e.simbolo}: grupo`).toBe(u.grupo);
      }
    }
  });

  it("cada elemento ocupa una casilla distinta dentro de la grilla de 10 x 18", () => {
    const vistas = new Set<string>();
    for (const e of ELEMENTOS) {
      const p = posicionEnTabla(e);
      expect(p.fila).toBeGreaterThanOrEqual(1);
      expect(p.fila).toBeLessThanOrEqual(FILAS_TABLA);
      expect(p.columna).toBeGreaterThanOrEqual(1);
      expect(p.columna).toBeLessThanOrEqual(COLUMNAS_TABLA);
      const k = `${p.fila},${p.columna}`;
      expect(vistas.has(k), `${e.simbolo} choca en ${k}`).toBe(false);
      vistas.add(k);
    }
  });
});

describe("tabla: familias, bloques y tipos", () => {
  const conteo = (fn: (e: (typeof ELEMENTOS)[number]) => string) => {
    const m: Record<string, number> = {};
    for (const e of ELEMENTOS) m[fn(e)] = (m[fn(e)] ?? 0) + 1;
    return m;
  };

  it("cantidad de elementos por familia (suma 118)", () => {
    const c = conteo(familiaDe);
    expect(c).toEqual({
      alcalino: 6,
      alcalinoterreo: 6,
      transicion: 38,
      otrosMetales: 12,
      metaloide: 6,
      noMetal: 7,
      halogeno: 6,
      gasNoble: 7,
      lantanido: 15,
      actinido: 15,
    });
    expect(Object.values(c).reduce((a, b) => a + b, 0)).toBe(118);
    expect(Object.keys(c).sort()).toEqual([...ORDEN_FAMILIAS].sort());
  });

  it("familias con elementos conocidos", () => {
    const de = (s: string) => familiaDe(ELEMENTOS.find((e) => e.simbolo === s)!);
    expect(de("Na")).toBe("alcalino");
    expect(de("H")).toBe("noMetal"); // el H no es alcalino
    expect(de("Ca")).toBe("alcalinoterreo");
    expect(de("Fe")).toBe("transicion");
    expect(de("Zn")).toBe("transicion");
    expect(de("Al")).toBe("otrosMetales");
    expect(de("Pb")).toBe("otrosMetales");
    expect(de("Si")).toBe("metaloide");
    expect(de("O")).toBe("noMetal");
    expect(de("Cl")).toBe("halogeno");
    expect(de("Ne")).toBe("gasNoble");
    expect(de("Ce")).toBe("lantanido");
    expect(de("U")).toBe("actinido");
  });

  it("bloques s/p/d/f: 14 + 36 + 38 + 30 = 118", () => {
    expect(conteo(bloqueDe)).toEqual({ s: 14, p: 36, d: 38, f: 30 });
    const de = (s: string) => bloqueDe(ELEMENTOS.find((e) => e.simbolo === s)!);
    expect(de("He")).toBe("s"); // grupo 18 pero bloque s
    expect(de("Na")).toBe("s");
    expect(de("Cl")).toBe("p");
    expect(de("Fe")).toBe("d");
    expect(de("Nd")).toBe("f");
  });

  it("tipo metal / metaloide / no metal", () => {
    expect(conteo(tipoDe)).toEqual({ metal: 92, metaloide: 6, nometal: 20 });
  });

  it("los selectores devuelven lo esperado (grupo, período, bloque)", () => {
    expect(simbolosDeSelector({ por: "grupo", n: 1 })).toEqual(["H", "Li", "Na", "K", "Rb", "Cs", "Fr"]);
    expect(simbolosDeSelector({ por: "grupo", n: 18 })).toEqual(["He", "Ne", "Ar", "Kr", "Xe", "Rn", "Og"]);
    expect(simbolosDeSelector({ por: "periodo", n: 2 })).toEqual(["Li", "Be", "B", "C", "N", "O", "F", "Ne"]);
    // Los períodos 6 y 7 NO incluyen el bloque f en el selector de período.
    expect(simbolosDeSelector({ por: "periodo", n: 6 })).toHaveLength(32 - 15);
    expect(simbolosDeSelector({ por: "bloque", bloque: "f" })).toHaveLength(30);
    expect(simbolosDeSelector({ por: "elementos", simbolos: ["Fe", "Xx"] })).toEqual(["Fe"]);
  });
});
