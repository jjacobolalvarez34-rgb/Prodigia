import { describe, expect, it } from "vitest";
import { tokenizar, tokensPorLinea } from "@/components/codia/resaltado";
import { generarProblemaCodia, MODOS_CODIA } from "@/lib/practica/codia";
import { LENGUAJES } from "@/lib/codia/tipos";

// Regresión (bug real 2026-09-21): el resaltador armaba su RegExp con un
// string normal, las barras invertidas se perdían, el RegExp quedaba
// inválido y CADA pregunta de Codia con código crasheaba la página en el
// navegador. Los tests de generadores nunca renderizaban el bloque de
// código, por eso no lo vieron: este archivo sí lo ejercita.
describe("resaltado de código (Codia)", () => {
  it("tokeniza sin tirar excepción en los 4 lenguajes y conserva el texto", () => {
    const muestras: Record<string, string> = {
      python: 'def f(x):\n    # comentario\n    return "a\\"b" + str(x * 12)\n',
      java: 'public class A { int x = 10; // c\n /* bloque\n multilínea */ String s = "hola"; }',
      javascript: "const a = 'x'; // c\nlet b = 3.5 + a.length;\n/* fin */",
      typescript: 'let n: number = 42; const s: string = "t"; // c',
    };
    for (const lang of LENGUAJES) {
      const codigo = muestras[lang];
      const tokens = tokenizar(codigo, lang);
      expect(tokens.map((t) => t.texto).join("")).toBe(codigo);
    }
  });

  it("reconoce comentarios, cadenas, números y palabras clave", () => {
    const t = tokenizar('x = 5 # nota\ny = "hi"\nif True: pass', "python");
    expect(t.find((k) => k.tipo === "comentario")?.texto).toBe("# nota");
    expect(t.find((k) => k.tipo === "cadena")?.texto).toBe('"hi"');
    expect(t.find((k) => k.tipo === "numero")?.texto).toBe("5");
    expect(t.some((k) => k.tipo === "clave" && k.texto === "True")).toBe(true);
  });

  it("todo el código que genera el mundo se tokeniza y conserva el texto", () => {
    for (const modo of MODOS_CODIA) {
      for (let i = 0; i < 60; i++) {
        for (const lang of LENGUAJES) {
          const p = generarProblemaCodia(modo, 1 + (i % 10), lang);
          if (!p.codigo) continue;
          expect(tokenizar(p.codigo, lang).map((t) => t.texto).join("")).toBe(p.codigo);
          expect(tokensPorLinea(p.codigo, lang).length).toBe(p.codigo.split("\n").length);
        }
      }
    }
  });
});
