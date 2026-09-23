import { describe, it, expect } from "vitest";
import { ESTRUCTURAS_LEWIS, capaCompleta, electronesTotales, electronesUsados, textoEnlaces, textoLibres, estructuraLewis } from "./lewis";
import { contarAtomos } from "./formulas";

describe("estructuras de Lewis de la Clase de enlace químico", () => {
  it("los átomos de cada estructura coinciden con la fórmula", () => {
    for (const e of ESTRUCTURAS_LEWIS) {
      const cont: Record<string, number> = {};
      for (const a of e.atomos) cont[a.simbolo] = (cont[a.simbolo] ?? 0) + 1;
      expect(cont, e.formula).toEqual(contarAtomos(e.formula));
    }
  });

  it("cada átomo cumple el octeto (dueto para el H)", () => {
    for (const e of ESTRUCTURAS_LEWIS) {
      e.atomos.forEach((a, i) => expect(capaCompleta(e, i), `${e.formula}: ${a.simbolo} #${i}`).toBe(true));
    }
  });

  it("se conservan los electrones de valencia: los de los átomos = los que aparecen como enlaces y pares libres", () => {
    for (const e of ESTRUCTURAS_LEWIS) {
      expect(electronesUsados(e), e.formula).toBe(electronesTotales(e));
    }
  });

  it("totales conocidos: H2O 8, NH3 8, CH4 8, CO2 16, N2 10, O2 12, HCl 8, H2 2", () => {
    const total = (f: string) => electronesTotales(estructuraLewis(f));
    expect(["H2O", "NH3", "CH4", "CO2", "N2", "O2", "HCl", "H2"].map(total)).toEqual([8, 8, 8, 16, 10, 12, 8, 2]);
  });

  it("textos de resumen", () => {
    expect(textoEnlaces(estructuraLewis("H2O"))).toBe("2 enlaces simples");
    expect(textoEnlaces(estructuraLewis("CO2"))).toBe("2 enlaces dobles");
    expect(textoEnlaces(estructuraLewis("N2"))).toBe("1 enlace triple");
    expect(textoLibres(estructuraLewis("H2O"))).toBe("2 en el O");
    expect(textoLibres(estructuraLewis("CO2"))).toBe("2 en cada O");
    expect(textoLibres(estructuraLewis("CH4"))).toBe("ninguno");
  });
});
