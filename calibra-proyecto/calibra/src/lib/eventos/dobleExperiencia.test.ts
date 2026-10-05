import { describe, expect, it } from "vitest";
import { mundoDobleExperiencia, ORDEN_MUNDOS_EVENTO } from "./dobleExperiencia";

describe("doble experiencia", () => {
  it("rota por los 13 mundos sin repetir en 13 días seguidos", () => {
    const vistos = new Set<string>();
    for (let d = 0; d < 13; d++) {
      const f = new Date(Date.UTC(2026, 9, 1 + d)).toISOString().slice(0, 10);
      vistos.add(mundoDobleExperiencia(f));
    }
    expect(vistos.size).toBe(13);
  });
  it("coincide con la fórmula de la base (0247): ((días desde 1970) * 7 + 3) % 13", () => {
    // 2026-10-05: 20731 días desde 1970-01-01 → (20731*7+3) % 13
    const dia = 20731;
    expect(mundoDobleExperiencia("2026-10-05")).toBe(ORDEN_MUNDOS_EVENTO[(dia * 7 + 3) % 13]);
  });
});
