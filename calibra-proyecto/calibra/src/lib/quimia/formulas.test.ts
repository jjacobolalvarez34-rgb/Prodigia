import { describe, it, expect } from "vitest";
import katex from "katex";
import { contarAtomos, conFormulas, f, formulaLatex, formulaUnicode, ion, ionLatex, masaMolar, numeroOxidacion, ox } from "./formulas";

describe("contarAtomos", () => {
  it("fórmulas simples, con paréntesis y con subíndices de dos dígitos", () => {
    expect(contarAtomos("H2O")).toEqual({ H: 2, O: 1 });
    expect(contarAtomos("Ca(OH)2")).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(contarAtomos("Al2(SO4)3")).toEqual({ Al: 2, S: 3, O: 12 });
    expect(contarAtomos("C6H12O6")).toEqual({ C: 6, H: 12, O: 6 });
    expect(contarAtomos("(NH4)2SO4")).toEqual({ N: 2, H: 8, S: 1, O: 4 });
    expect(contarAtomos("Ca3(PO4)2")).toEqual({ Ca: 3, P: 2, O: 8 });
  });
  it("una fórmula mal formada lanza (así un typo en una lección rompe el test)", () => {
    expect(() => contarAtomos("Ca(OH2")).toThrow();
    expect(() => contarAtomos("CaOH)2")).toThrow();
    expect(() => contarAtomos("ca2")).toThrow();
    expect(() => contarAtomos("H2 O")).toThrow();
  });
});

describe("masaMolar (suma de masas atómicas de DATOS_ELEMENTOS)", () => {
  it("valores conocidos redondeados a 1 decimal coinciden con los libros", () => {
    const r1 = (x: number) => Math.round(x * 10) / 10;
    expect(r1(masaMolar("H2O"))).toBe(18.0);
    expect(r1(masaMolar("CO2"))).toBe(44.0);
    expect(r1(masaMolar("NaCl"))).toBe(58.4);
    expect(r1(masaMolar("H2SO4"))).toBe(98.1);
    expect(r1(masaMolar("Ca(OH)2"))).toBe(74.1);
    expect(r1(masaMolar("CaCO3"))).toBe(100.1);
    expect(r1(masaMolar("C6H12O6"))).toBe(180.2);
    expect(r1(masaMolar("O2"))).toBe(32.0);
    expect(r1(masaMolar("NH3"))).toBe(17.0);
    expect(r1(masaMolar("Al2O3"))).toBe(102.0);
  });
  it("2 decimales exactos con las masas de 2 decimales", () => {
    expect(masaMolar("H2O")).toBe(18.02);
    expect(masaMolar("NaCl")).toBe(58.44);
    expect(masaMolar("CO2")).toBe(44.01);
  });
  it("un elemento sin masa cargada lanza", () => {
    expect(() => masaMolar("UF6")).toThrow();
  });
});

describe("LaTeX de fórmulas e iones", () => {
  it("subíndices y cargas", () => {
    expect(formulaLatex("Ca(OH)2")).toBe("\\mathrm{Ca(OH)_2}");
    expect(formulaLatex("Al2O3")).toBe("\\mathrm{Al_2O_3}");
    expect(formulaLatex("C6H12O6")).toBe("\\mathrm{C_6H_{12}O_6}");
    expect(ionLatex("SO4", -2)).toBe("\\mathrm{SO_4^{2-}}");
    expect(ionLatex("Fe", 3)).toBe("\\mathrm{Fe^{3+}}");
    expect(ionLatex("Cl", -1)).toBe("\\mathrm{Cl^{-}}");
    expect(f("NaCl")).toBe("$\\mathrm{NaCl}$");
    expect(ion("Na", 1)).toBe("$\\mathrm{Na^{+}}$");
    expect(ox("Fe", 3)).toBe("$\\overset{+3}{\\mathrm{Fe}}$");
    expect(ox("O", -2)).toBe("$\\overset{-2}{\\mathrm{O}}$");
  });
  it("número de oxidación como texto", () => {
    expect(numeroOxidacion(3)).toBe("+3");
    expect(numeroOxidacion(-2)).toBe("−2");
    expect(numeroOxidacion(0)).toBe("0");
  });
  it("fórmula con subíndices Unicode para textos planos", () => {
    expect(formulaUnicode("H2SO4")).toBe("H₂SO₄");
    expect(formulaUnicode("Ca(OH)2")).toBe("Ca(OH)₂");
    expect(formulaUnicode("Al2(SO4)3")).toBe("Al₂(SO₄)₃");
    expect(formulaUnicode("C6H12O6")).toBe("C₆H₁₂O₆");
    expect(formulaUnicode("NaCl")).toBe("NaCl");
  });
  it("conFormulas reemplaza {{...}}", () => {
    expect(conFormulas("El {{H2O}} es agua")).toBe("El $\\mathrm{H_2O}$ es agua");
  });
  it("todos los patrones de la convención se renderizan con KaTeX sin error (subíndices, cargas, flechas, sobre-símbolos)", () => {
    const expresiones = [
      formulaLatex("Al2(SO4)3"),
      ionLatex("SO4", -2),
      ionLatex("Fe", 3),
      "\\overset{+3}{\\mathrm{Fe}}",
      "\\mathrm{2H_2 + O_2 \\rightarrow 2H_2O}",
      "\\mathrm{N_2 + 3H_2 \\rightleftharpoons 2NH_3}",
      "\\mathrm{Ca^{2+} + O^{2-} \\rightarrow CaO}",
    ];
    for (const e of expresiones) {
      const html = katex.renderToString(e, { throwOnError: true });
      expect(html, e).toContain("katex");
      expect(html).not.toContain("katex-error");
    }
  });
});
