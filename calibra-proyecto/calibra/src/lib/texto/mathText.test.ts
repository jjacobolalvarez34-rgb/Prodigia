import { describe, it, expect } from "vitest";
import { partirMathText } from "./mathText";

describe("partirMathText", () => {
  it("un string sin $ devuelve un único fragmento de texto igual al original", () => {
    const partes = partirMathText("Deriva f(x) = 5x^4 usando la regla de la potencia.");
    expect(partes).toEqual([{ tipo: "texto", valor: "Deriva f(x) = 5x^4 usando la regla de la potencia." }]);
  });

  it("un string vacío devuelve un array vacío", () => {
    expect(partirMathText("")).toEqual([]);
  });

  it("un fragmento $...$ en el medio devuelve texto-formula-texto en orden", () => {
    const partes = partirMathText("Deriva $f(x) = 5x^4$ y verifica el resultado.");
    expect(partes).toHaveLength(3);
    expect(partes[0]).toEqual({ tipo: "texto", valor: "Deriva " });
    expect(partes[1].tipo).toBe("formula");
    if (partes[1].tipo === "formula") {
      expect(partes[1].html).toContain("katex");
    }
    expect(partes[2]).toEqual({ tipo: "texto", valor: " y verifica el resultado." });
  });

  it("un fragmento $...$ al principio no antepone un fragmento de texto vacío", () => {
    const partes = partirMathText("$x^2$ es el resultado.");
    expect(partes[0].tipo).toBe("formula");
    expect(partes[1]).toEqual({ tipo: "texto", valor: " es el resultado." });
  });

  it("múltiples fragmentos $...$ se detectan todos, en orden", () => {
    const partes = partirMathText("Si $a=2$ y $b=3$, entonces $a+b=5$.");
    const tipos = partes.map((p) => p.tipo);
    expect(tipos).toEqual(["texto", "formula", "texto", "formula", "texto", "formula", "texto"]);
  });

  it("un $ suelto sin cerrar nunca rompe — queda como texto plano tal cual", () => {
    const original = "Esto cuesta $10 y no es una fórmula.";
    const partes = partirMathText(original);
    expect(partes).toEqual([{ tipo: "texto", valor: original }]);
  });

  it("una expresión LaTeX inválida no lanza excepción — se degrada visualmente, nunca rompe el render", () => {
    expect(() => partirMathText("Esto es $\\comandoquenoexiste$ inválido.")).not.toThrow();
  });

  it("una fórmula real produce HTML que contiene las clases reales de KaTeX (no un simple passthrough del texto)", () => {
    const partes = partirMathText("$\\frac{1}{2}$");
    expect(partes[0].tipo).toBe("formula");
    if (partes[0].tipo === "formula") {
      expect(partes[0].html).toContain("katex");
      expect(partes[0].html).not.toBe("\\frac{1}{2}");
    }
  });
});
