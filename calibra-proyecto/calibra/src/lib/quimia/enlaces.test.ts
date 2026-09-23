import { describe, it, expect } from "vitest";
import { datosDe } from "./datos";
import { EJEMPLOS_ENLACE, electronesParaCompletar, polaridad, valenciaDe } from "./enlaces";
import { contarAtomos } from "./formulas";

describe("ejemplos de enlace: coherencia con la regla del octeto y la electronegatividad", () => {
  it("valencia calculada desde la configuración: H 1, N 5, O 6, Na 1, Mg 2, Cl 7", () => {
    expect(["H", "N", "O", "Na", "Mg", "Cl"].map(valenciaDe)).toEqual([1, 5, 6, 1, 2, 7]);
  });

  it("iónico: los electrones transferidos son los de valencia del catión y los que le faltan al anión para el octeto", () => {
    for (const e of Object.values(EJEMPLOS_ENLACE)) {
      if (e.tipo !== "ionico") continue;
      expect(valenciaDe(e.cation), `${e.formula}: catión`).toBe(e.transferidos);
      expect(electronesParaCompletar(e.anion) - valenciaDe(e.anion)!, `${e.formula}: anión`).toBe(e.transferidos);
      // diferencia de electronegatividad grande (> 1,7)
      const dif = datosDe(e.anion)!.electronegatividad! - datosDe(e.cation)!.electronegatividad!;
      expect(dif, e.formula).toBeGreaterThan(1.7);
      // fórmula: 1 catión y 1 anión con la misma carga
      expect(contarAtomos(e.formula)[e.cation]).toBe(1);
    }
  });

  it("covalente: los pares compartidos completan la capa de cada átomo (regla del octeto / dueto del H)", () => {
    for (const e of Object.values(EJEMPLOS_ENLACE)) {
      if (e.tipo !== "covalente") continue;
      for (const s of [e.a, e.b]) {
        // cada par compartido aporta 1 electrón propio a cada átomo: valencia + pares = capa completa
        expect(valenciaDe(s)! + e.pares, `${e.formula}: ${s} completa su capa`).toBe(electronesParaCompletar(s));
      }
    }
  });

  it("covalente: H2, O2 y N2 apolares (átomos iguales); HCl polar (Δ 0,96)", () => {
    expect(polaridad("H", "H")).toBe("apolar");
    expect(polaridad("O", "O")).toBe("apolar");
    expect(polaridad("N", "N")).toBe("apolar");
    expect(polaridad("H", "Cl")).toBe("polar");
    const dif = datosDe("Cl")!.electronegatividad! - datosDe("H")!.electronegatividad!;
    expect(Math.round(dif * 100) / 100).toBe(0.96);
    expect(dif).toBeLessThan(1.7);
  });

  it("metálico: los electrones aportados son los de valencia; los metales tienen electronegatividad baja", () => {
    for (const e of Object.values(EJEMPLOS_ENLACE)) {
      if (e.tipo !== "metalico") continue;
      expect(valenciaDe(e.simbolo), e.simbolo).toBe(e.aportados);
      expect(datosDe(e.simbolo)!.electronegatividad!).toBeLessThan(1.5);
    }
  });

  it("H2 simple, O2 doble, N2 triple", () => {
    const pares = (id: string) => (EJEMPLOS_ENLACE[id] as { pares: number }).pares;
    expect([pares("H2"), pares("O2"), pares("N2"), pares("HCl")]).toEqual([1, 2, 3, 1]);
  });
});
