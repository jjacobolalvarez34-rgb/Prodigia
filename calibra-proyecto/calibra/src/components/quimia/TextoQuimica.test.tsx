import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TextoQuimica, { partirSubindices } from "./TextoQuimica";

describe("TextoQuimica: subíndices de fórmulas", () => {
  it("Al2O3 -> Al, sub 2, O, sub 3", () => {
    expect(partirSubindices("Al2O3")).toEqual([
      { texto: "Al", sub: false },
      { texto: "2", sub: true },
      { texto: "O", sub: false },
      { texto: "3", sub: true },
    ]);
  });

  it("Ca(OH)2 subindiza el número pegado al paréntesis", () => {
    expect(partirSubindices("Ca(OH)2")).toEqual([
      { texto: "Ca(OH)", sub: false },
      { texto: "2", sub: true },
    ]);
  });

  it("C6H12O6 con números de 2 dígitos", () => {
    const html = renderToStaticMarkup(<TextoQuimica texto="C6H12O6" />);
    expect(html).toContain("<sub>6</sub>");
    expect(html).toContain("<sub>12</sub>");
  });

  it("dentro de una pregunta, solo la fórmula lleva subíndices", () => {
    const html = renderToStaticMarkup(<TextoQuimica texto={'¿Cómo se llama "Fe2O3"?'} />);
    expect(html).toContain("<sub>2</sub>");
    expect(html).toContain("<sub>3</sub>");
    expect(html).toContain("¿Cómo se llama &quot;");
  });

  it("estados de oxidación (+2, -1) y números sueltos NO se subindizan", () => {
    for (const t of ["+2", "-1", "+3", "Periodo 3", "79"]) {
      expect(renderToStaticMarkup(<TextoQuimica texto={t} />)).not.toContain("<sub>");
    }
  });

  it("nombres sin dígitos quedan iguales", () => {
    expect(renderToStaticMarkup(<TextoQuimica texto="Óxido de hierro (III)" />)).not.toContain("<sub>");
  });
});
