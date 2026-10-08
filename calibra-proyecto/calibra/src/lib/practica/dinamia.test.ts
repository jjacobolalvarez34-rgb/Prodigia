import { describe, expect, it } from "vitest";
import { mulberry32 } from "@/lib/rng";
import { conRngSembrado, f, generarProblemaDinamia, MODOS_DINAMIA, preguntaDinamia, type ProblemaDinamia } from "./dinamia";

const VUELTAS = 250;

function todos(): ProblemaDinamia[] {
  const out: ProblemaDinamia[] = [];
  for (const modo of MODOS_DINAMIA) for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < VUELTAS; i++) out.push(generarProblemaDinamia(modo, nivel));
  return out;
}

// "12,5" → 12.5 ; toma todos los números del enunciado en orden.
function numeros(s: string): number[] {
  return [...s.replace(/(\d)\.(\d{3})/g, "$1$2").matchAll(/-?\d+(?:,\d+)?/g)].map((m) => Number(m[0].replace(",", ".")));
}

describe("generador de Dinamia", () => {
  const lista = todos();

  it("toda pregunta tiene enunciado limpio y una respuesta válida", { timeout: 30_000 }, () => {
    for (const p of lista) {
      expect(p.enunciado.length, p.detalle.tipo).toBeGreaterThan(20);
      expect(p.enunciado, p.detalle.tipo).not.toMatch(/NaN|undefined|Infinity|\[object/);
      if (p.entrada === "numero") {
        expect(Number.isFinite(p.respuesta), p.enunciado).toBe(true);
        expect(Math.abs(p.respuesta * 10 - Math.round(p.respuesta * 10)) < 1e-6, p.enunciado).toBe(true);
        // Si no pide redondear, la respuesta es exacta.
        if (!p.enunciado.includes("Redondea")) expect(p.tolerancia, p.enunciado).toBeLessThanOrEqual(0.01);
      } else {
        expect(p.opciones, p.enunciado).toContain(p.respuesta);
        expect(new Set(p.opciones).size, p.enunciado).toBe(p.opciones.length);
        expect(p.opciones.length, p.enunciado).toBeGreaterThanOrEqual(2);
        expect(p.opciones.length, p.enunciado).toBeLessThanOrEqual(4);
      }
    }
  });

  it("cada modo usa todos sus tipos de pregunta en algún nivel", () => {
    const porModo = new Map<string, Set<string>>();
    for (const p of lista) {
      if (!porModo.has(p.modo)) porModo.set(p.modo, new Set());
      porModo.get(p.modo)!.add(p.detalle.tipo);
    }
    for (const modo of MODOS_DINAMIA) expect(porModo.get(modo)!.size, modo).toBeGreaterThanOrEqual(8);
  });

  it("la gravedad está en el enunciado cuando la pregunta la usa", () => {
    for (const p of lista) if (/caida_|vertical_|^peso$|^masa$|roce|plano|atwood|^ep$|perdida/.test(p.detalle.tipo)) expect(p.enunciado, p.detalle.tipo).toMatch(/g = (10|9,8) m\/s²/);
  });

  it("recalcula respuestas a partir de los datos del enunciado", () => {
    for (const p of lista) {
      if (p.entrada !== "numero") continue;
      const x = numeros(p.enunciado);
      const r = p.respuesta;
      const cerca = (v: number) => expect(Math.abs(v - r), `${p.detalle.tipo}: ${p.enunciado}`).toBeLessThanOrEqual(0.051);
      switch (p.detalle.tipo) {
        case "mru_d":
          cerca(x[0] * x[1]);
          break;
        case "mrua_d":
          cerca(x[0] * x[2] + 0.5 * x[1] * x[2] * x[2]);
          break;
        case "mrua_v":
          cerca(x[0] + x[1] * x[2]);
          break;
        case "caida_h":
          cerca(0.5 * x[1] * x[0] * x[0]);
          break;
        case "fma_f":
          cerca(x[0] * x[1]);
          break;
        case "ec":
          cerca(0.5 * x[0] * x[1] * x[1]);
          break;
        case "hidrostatica":
          cerca(x[0] * 10);
          break;
        case "c_k":
          cerca(x[0] + 273);
          break;
        case "mezcla":
          cerca((x[0] * x[1] + x[2] * x[3]) / (x[0] + x[2]));
          break;
        case "prensa":
          cerca((x[0] * x[2]) / x[1]);
          break;
      }
    }
  });

  it("con la misma semilla sale la misma pregunta (duelos)", () => {
    for (const modo of MODOS_DINAMIA) {
      const a = conRngSembrado(mulberry32(42), () => generarProblemaDinamia(modo, 7));
      const b = conRngSembrado(mulberry32(42), () => generarProblemaDinamia(modo, 7));
      expect(a).toEqual(b);
    }
  });

  it("el reto diario es opción múltiple con la correcta incluida", () => {
    for (let s = 1; s < 200; s++) {
      const p = preguntaDinamia(mulberry32(s));
      expect(p.opciones).toContain(p.respuesta);
      expect(new Set(p.opciones).size).toBe(p.opciones.length);
    }
  });

  it("formato con coma decimal y sin ceros de más", () => {
    expect(f(12.5)).toBe("12,5");
    expect(f(3)).toBe("3");
    expect(f(0.10000001)).toBe("0,1");
    expect(f(-0)).toBe("0");
  });
});
