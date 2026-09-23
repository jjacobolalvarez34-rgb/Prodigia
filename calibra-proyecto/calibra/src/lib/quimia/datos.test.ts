import { describe, it, expect } from "vitest";
import { ELEMENTOS } from "@/lib/practica/quimia";
import {
  DATOS_ELEMENTOS,
  GASES_NOBLES_Z,
  ORDEN_MOELLER,
  capasOcupadas,
  configuracionAbreviada,
  configuracionConSuperindices,
  configuracionElectronica,
  configuracionTexto,
  datosDe,
  electronesDeValencia,
  esExcepcionAufbau,
} from "./datos";
import { bloqueDe } from "./tabla";

describe("configuración electrónica: propiedades que se calculan sin ninguna tabla", () => {
  it("la suma de electrones es Z y ninguna subcapa pasa su capacidad, para los 118", () => {
    for (let z = 1; z <= 118; z++) {
      const c = configuracionElectronica(z);
      expect(c.reduce((a, s) => a + s.electrones, 0), `Z=${z}`).toBe(z);
      for (const s of c) expect(s.electrones, `Z=${z} ${s.nombre}`).toBeLessThanOrEqual(s.capacidad);
    }
  });

  it("el orden de Moeller coincide con la regla n + l (a igual n + l, menor n)", () => {
    const l = { s: 0, p: 1, d: 2, f: 3 } as const;
    const generado: { n: number; letra: "s" | "p" | "d" | "f" }[] = [];
    for (let n = 1; n <= 7; n++) for (const letra of ["s", "p", "d", "f"] as const) if (l[letra] < n) generado.push({ n, letra });
    generado.sort((a, b) => a.n + l[a.letra] - (b.n + l[b.letra]) || a.n - b.n);
    // Solo las 19 subcapas que llegan a llenarse con los 118 elementos conocidos.
    expect(ORDEN_MOELLER.map((o) => `${o.n}${o.l}`)).toEqual(generado.slice(0, 19).map((g) => `${g.n}${g.letra}`));
  });

  it("los gases nobles cierran capa: 2 electrones el He y 8 en la capa externa el resto", () => {
    for (const z of GASES_NOBLES_Z) {
      expect(electronesDeValencia(z), `Z=${z}`).toBe(z === 2 ? 2 : 8);
    }
  });

  it("los electrones de valencia de los grupos principales salen del número de grupo (1, 2 y 13-18: grupo − 10)", () => {
    for (const e of ELEMENTOS) {
      const b = bloqueDe(e);
      if (b !== "s" && b !== "p") continue;
      if (e.simbolo === "He") continue;
      const esperado = e.grupo <= 2 ? e.grupo : e.grupo - 10;
      expect(electronesDeValencia(e.numeroAtomico), `${e.simbolo}`).toBe(esperado);
    }
  });

  it("período = capas ocupadas (única rareza: el paladio, que tiene 4 capas y está en el período 5)", () => {
    for (const e of ELEMENTOS) {
      if (e.simbolo === "Pd") {
        expect(capasOcupadas(46)).toBe(4);
        continue;
      }
      expect(capasOcupadas(e.numeroAtomico), e.simbolo).toBe(e.periodo);
    }
  });

  it("solo 20 elementos rompen la regla de Aufbau (Cr y Cu entre los de colegio)", () => {
    const excepciones = Array.from({ length: 118 }, (_, i) => i + 1).filter(esExcepcionAufbau);
    expect(excepciones).toEqual([24, 29, 41, 42, 44, 45, 46, 47, 57, 58, 64, 78, 79, 89, 90, 91, 92, 93, 96, 103]);
  });

  // Tabla escrita a mano y contrastada contra un conjunto de datos abierto
  // (PeriodicTableJSON) para los 118 elementos.
  const ESPERADAS: Record<number, string> = {
    1: "1s1",
    2: "1s2",
    3: "1s2 2s1",
    6: "1s2 2s2 2p2",
    7: "1s2 2s2 2p3",
    8: "1s2 2s2 2p4",
    9: "1s2 2s2 2p5",
    10: "1s2 2s2 2p6",
    11: "1s2 2s2 2p6 3s1",
    12: "1s2 2s2 2p6 3s2",
    13: "1s2 2s2 2p6 3s2 3p1",
    14: "1s2 2s2 2p6 3s2 3p2",
    15: "1s2 2s2 2p6 3s2 3p3",
    16: "1s2 2s2 2p6 3s2 3p4",
    17: "1s2 2s2 2p6 3s2 3p5",
    18: "1s2 2s2 2p6 3s2 3p6",
    19: "1s2 2s2 2p6 3s2 3p6 4s1",
    20: "1s2 2s2 2p6 3s2 3p6 4s2",
    21: "1s2 2s2 2p6 3s2 3p6 4s2 3d1",
    24: "1s2 2s2 2p6 3s2 3p6 4s1 3d5",
    26: "1s2 2s2 2p6 3s2 3p6 4s2 3d6",
    29: "1s2 2s2 2p6 3s2 3p6 4s1 3d10",
    30: "1s2 2s2 2p6 3s2 3p6 4s2 3d10",
    35: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p5",
    36: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6",
    47: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d10",
    79: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s1 4f14 5d10",
  };
  it("configuraciones de referencia (H, C, N, O, Na, Cl, Fe, Cr, Cu, Br, Ag, Au...)", () => {
    for (const [z, texto] of Object.entries(ESPERADAS)) {
      expect(configuracionTexto(Number(z)), `Z=${z}`).toBe(texto);
    }
  });

  it("los exponentes se pueden mostrar como superíndices Unicode", () => {
    expect(configuracionConSuperindices("1s2 2s2 2p6")).toBe("1s² 2s² 2p⁶");
    expect(configuracionConSuperindices("[Ar] 4s2 3d10")).toBe("[Ar] 4s² 3d¹⁰");
    expect(configuracionConSuperindices(configuracionAbreviada(26))).toBe("[Ar] 4s² 3d⁶");
  });

  it("configuración abreviada con el gas noble anterior", () => {
    expect(configuracionAbreviada(1)).toBe("1s1");
    expect(configuracionAbreviada(11)).toBe("[Ne] 3s1");
    expect(configuracionAbreviada(17)).toBe("[Ne] 3s2 3p5");
    expect(configuracionAbreviada(26)).toBe("[Ar] 4s2 3d6");
    expect(configuracionAbreviada(24)).toBe("[Ar] 4s1 3d5");
    expect(configuracionAbreviada(29)).toBe("[Ar] 4s1 3d10");
    expect(configuracionAbreviada(18)).toBe("[Ne] 3s2 3p6");
  });
});

describe("DATOS_ELEMENTOS: masa, electronegatividad, estado, estados de oxidación", () => {
  it("cada símbolo existe en ELEMENTOS, sin repetir", () => {
    const simbolos = DATOS_ELEMENTOS.map((d) => d.simbolo);
    expect(new Set(simbolos).size).toBe(simbolos.length);
    for (const s of simbolos) expect(ELEMENTOS.some((e) => e.simbolo === s), s).toBe(true);
  });

  it("la masa crece con el número atómico, salvo las inversiones históricas K (tras Ar) y Ni (tras Co)", () => {
    const filas = DATOS_ELEMENTOS.map((d) => ({ d, z: ELEMENTOS.find((e) => e.simbolo === d.simbolo)!.numeroAtomico })).sort((a, b) => a.z - b.z);
    const INVERSIONES = new Set(["K", "Ni"]); // K (39,10) < Ar (39,95); Ni (58,69) < Co (58,93)
    for (let i = 1; i < filas.length; i++) {
      if (INVERSIONES.has(filas[i].d.simbolo)) continue;
      expect(filas[i].d.masa, `${filas[i].d.simbolo} vs ${filas[i - 1].d.simbolo}`).toBeGreaterThan(filas[i - 1].d.masa);
    }
    // masa entre 1 y 3 veces Z (aprox.) — detecta un typo de magnitud
    for (const { d, z } of filas) {
      expect(d.masa).toBeGreaterThanOrEqual(z);
      expect(d.masa).toBeLessThanOrEqual(z * 3);
    }
  });

  it("gases nobles: sin electronegatividad; el resto entre 0,7 y 4,0", () => {
    for (const d of DATOS_ELEMENTOS) {
      if (["He", "Ne", "Ar"].includes(d.simbolo)) expect(d.electronegatividad).toBeNull();
      else {
        expect(d.electronegatividad!, d.simbolo).toBeGreaterThan(0.7);
        expect(d.electronegatividad!, d.simbolo).toBeLessThanOrEqual(4.0);
      }
    }
  });

  it("tendencias verificables: la electronegatividad crece a lo largo del período 2 y baja en los grupos 1 y 17", () => {
    const en = (s: string) => datosDe(s)!.electronegatividad!;
    const p2 = ["Li", "Be", "B", "C", "N", "O", "F"].map(en);
    for (let i = 1; i < p2.length; i++) expect(p2[i]).toBeGreaterThan(p2[i - 1]);
    expect(en("Li")).toBeGreaterThan(en("Na"));
    expect(en("Na")).toBeGreaterThan(en("K"));
    expect(en("F")).toBeGreaterThan(en("Cl"));
    expect(en("Cl")).toBeGreaterThan(en("Br"));
    expect(en("Br")).toBeGreaterThan(en("I"));
    // El flúor es el más electronegativo de todos los cargados.
    expect(Math.max(...DATOS_ELEMENTOS.map((d) => d.electronegatividad ?? 0))).toBe(en("F"));
  });

  it("estados de agregación a 25 °C: solo Br y Hg líquidos; gases: H, He, N, O, F, Ne, Cl, Ar", () => {
    expect(DATOS_ELEMENTOS.filter((d) => d.estado === "liquido").map((d) => d.simbolo)).toEqual(["Br", "Hg"]);
    expect(DATOS_ELEMENTOS.filter((d) => d.estado === "gas").map((d) => d.simbolo)).toEqual(["H", "He", "N", "O", "F", "Ne", "Cl", "Ar"]);
  });

  it("los estados de oxidación cargados incluyen el `estadoOxidacionComun` de la práctica y están ordenados", () => {
    for (const d of DATOS_ELEMENTOS) {
      const e = ELEMENTOS.find((x) => x.simbolo === d.simbolo)!;
      expect(d.estadosOxidacion, `${d.simbolo}: común ${e.estadoOxidacionComun}`).toContain(e.estadoOxidacionComun);
      expect(d.estadosOxidacion).toEqual([...d.estadosOxidacion].sort((a, b) => a - b));
      for (const n of d.estadosOxidacion) {
        expect(n).toBeGreaterThanOrEqual(-4);
        expect(n).toBeLessThanOrEqual(7);
      }
    }
  });

  it("el estado de oxidación positivo máximo de un elemento de grupo principal no supera su número de electrones de valencia", () => {
    for (const d of DATOS_ELEMENTOS) {
      const e = ELEMENTOS.find((x) => x.simbolo === d.simbolo)!;
      if (bloqueDe(e) !== "p" && bloqueDe(e) !== "s") continue;
      if (e.simbolo === "He" || e.grupo === 18) continue;
      const valencia = e.grupo <= 2 ? e.grupo : e.grupo - 10;
      // H puede ser +1 (grupo 1) y el flúor solo −1; el oxígeno solo llega a positivos en OF2 (no cargado).
      expect(Math.max(...d.estadosOxidacion), d.simbolo).toBeLessThanOrEqual(Math.max(valencia, 1));
    }
  });
});
