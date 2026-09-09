import { describe, it, expect } from "vitest";
import {
  SEGMENTOS_RULETA,
  VALOR_SEGMENTO_CHISPAS,
  angulosRuleta,
  conicGradientRuleta,
  rotacionParaSegmento,
  evGiroRuleta,
} from "./ruleta";

describe("ruleta de la Trastienda (espejo de gira_ruleta en 0121)", () => {
  it("las probabilidades suman 100 (mismo orden que el SQL)", () => {
    const total = SEGMENTOS_RULETA.reduce((acc, s) => acc + s.probabilidad, 0);
    expect(total).toBeCloseTo(100, 3);
    // Orden fijo del SQL: boost, escudo, congelamiento, 50, 25, 100, fuente, marco, titulo, nada.
    expect(SEGMENTOS_RULETA.map((s) => s.slug)).toEqual([
      "boost",
      "escudo",
      "congelamiento",
      "chispas_50",
      "chispas_25",
      "chispas_100",
      "fuente",
      "marco",
      "titulo",
      "nada",
    ]);
  });

  it("los ángulos cubren los 360° sin huecos ni solapamiento", () => {
    const porciones = angulosRuleta();
    expect(porciones[0].inicio).toBe(0);
    for (let i = 0; i < porciones.length - 1; i++) {
      expect(porciones[i].fin).toBeCloseTo(porciones[i + 1].inicio, 3);
    }
    expect(porciones[porciones.length - 1].fin).toBeCloseTo(360, 3);
  });

  it("el conic-gradient usa las porciones exactas", () => {
    expect(conicGradientRuleta()).toContain("conic-gradient(");
    expect(conicGradientRuleta()).toContain("262b36 208.8deg 360deg"); // el tramo 'nada'
  });

  it("la rotación aterriza el centro del segmento en la aguja (norte)", () => {
    for (const s of SEGMENTOS_RULETA) {
      const rot = rotacionParaSegmento(s.slug, 1);
      // Tras rotar R (horario), el punto que estaba en (rot - 360) cae en el norte.
      const posicionFinal = rot - 360;
      const esperado = 360 - angulosRuleta().find((a) => a.slug === s.slug)!.centro;
      expect(posicionFinal % 360).toBeCloseTo(esperado % 360, 6);
    }
  });

  it("EV por giro < 1 (house edge), con pity incluido y costo normal (objetivo ~0.86-0.92)", () => {
    const ev = evGiroRuleta();
    expect(ev).toBeLessThan(1);
    expect(ev).toBeGreaterThan(0.7);
  });

  it("el segmento 'titulo' vale como el escudo (placeholder de Mecánica 3)", () => {
    expect(VALOR_SEGMENTO_CHISPAS.titulo).toBe(VALOR_SEGMENTO_CHISPAS.escudo);
  });
});