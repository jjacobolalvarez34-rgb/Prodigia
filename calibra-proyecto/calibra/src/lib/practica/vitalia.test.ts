import { describe, expect, it } from "vitest";
import { mulberry32 } from "@/lib/rng";
import { conRngSembrado, generarProblemaVitalia, gruposHijos, MODOS_VITALIA, preguntaVitalia, type ProblemaVitalia } from "./vitalia";

const VUELTAS = 250;

function todos(): ProblemaVitalia[] {
  const out: ProblemaVitalia[] = [];
  for (const modo of MODOS_VITALIA) for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < VUELTAS; i++) out.push(generarProblemaVitalia(modo, nivel));
  return out;
}

const COMP: Record<string, string> = { A: "T", T: "A", G: "C", C: "G" };
const ARN: Record<string, string> = { A: "U", T: "A", G: "C", C: "G" };

describe("generador de Vitalia", () => {
  const lista = todos();

  it("toda pregunta tiene enunciado limpio y respuesta válida", { timeout: 30_000 }, () => {
    for (const p of lista) {
      expect(p.enunciado.length, p.detalle.tipo).toBeGreaterThan(15);
      expect(p.enunciado).not.toMatch(/NaN|undefined|\[object/);
      if (p.entrada === "numero") {
        expect(Number.isFinite(p.respuesta), p.enunciado).toBe(true);
        expect(p.respuesta, p.enunciado).toBeGreaterThanOrEqual(0);
      } else {
        expect(p.opciones, p.enunciado).toContain(p.respuesta);
        expect(new Set(p.opciones).size, p.enunciado).toBe(p.opciones.length);
        expect(p.opciones.length, p.enunciado).toBeGreaterThanOrEqual(2);
        expect(p.opciones.length, p.enunciado).toBeLessThanOrEqual(4);
      }
    }
  });

  it("cada modo usa varios tipos de pregunta", () => {
    for (const modo of MODOS_VITALIA) {
      const tipos = new Set(lista.filter((p) => p.modo === modo).map((p) => p.detalle.tipo));
      expect(tipos.size, modo).toBeGreaterThanOrEqual(4);
    }
  });

  it("la genética calculada coincide con otra cuenta", () => {
    for (const p of lista) {
      if (p.detalle.tipo === "complementaria") {
        const h = p.enunciado.match(/de ([ATGC]+)\?/)![1];
        expect(p.respuesta).toBe([...h].map((b) => COMP[b]).join(""));
      }
      if (p.detalle.tipo === "transcripcion") {
        const h = p.enunciado.match(/ADN: ([ATGC]+)\?/)![1];
        expect(p.respuesta).toBe([...h].map((b) => ARN[b]).join(""));
      }
      if (p.detalle.tipo.startsWith("punnett_") && p.entrada === "numero") {
        const [, g1, g2] = p.enunciado.match(/Cruzas (A{2}|Aa|aa) × (A{2}|Aa|aa)/)!;
        // Cuenta las 4 casillas del cuadro.
        let rec = 0;
        let het = 0;
        for (const a of g1) for (const b of g2) {
          if (a === "a" && b === "a") rec++;
          else if (a !== b) het++;
        }
        const esperado = p.detalle.tipo === "punnett_rec" ? rec * 25 : p.detalle.tipo === "punnett_het" ? het * 25 : (4 - rec) * 25;
        expect(p.respuesta, p.enunciado).toBe(esperado);
      }
      if (p.detalle.tipo === "chargaff_G" || p.detalle.tipo === "chargaff_C") {
        const a = Number(p.enunciado.match(/el (\d+) %/)![1]);
        expect(p.respuesta).toBe(50 - a);
      }
    }
  });

  it("grupos ABO de los hijos", () => {
    expect([...gruposHijos(["A", "O"], ["B", "O"])].sort()).toEqual(["A", "AB", "B", "O"]);
    expect([...gruposHijos(["O", "O"], ["O", "O"])]).toEqual(["O"]);
    expect([...gruposHijos(["A", "A"], ["B", "B"])]).toEqual(["AB"]);
  });

  it("los dibujos de célula y de mitosis traen lo que hace falta", () => {
    for (const p of lista) {
      if (p.detalle.tipo === "senalar") expect(p.diagrama?.tipo === "celula" && p.diagrama.senalado).toBeTruthy();
      if (p.detalle.tipo === "fase_dibujo") expect(p.diagrama?.tipo).toBe("division");
    }
  });

  it("no repite preguntas de Anatomía (nombres de huesos o músculos)", () => {
    for (const p of lista) expect(p.enunciado).not.toMatch(/hueso|músculo se llama|¿Cómo se llama este/i);
  });

  it("con la misma semilla sale la misma pregunta (duelos) y el reto incluye la correcta", () => {
    for (const modo of MODOS_VITALIA) {
      const a = conRngSembrado(mulberry32(7), () => generarProblemaVitalia(modo, 8));
      const b = conRngSembrado(mulberry32(7), () => generarProblemaVitalia(modo, 8));
      expect(a).toEqual(b);
    }
    for (let s = 1; s < 200; s++) {
      const p = preguntaVitalia(mulberry32(s));
      expect(p.opciones).toContain(p.respuesta);
    }
  });
});
