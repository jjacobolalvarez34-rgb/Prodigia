import { describe, expect, it } from "vitest";
import { momentoAlineacion } from "./alineacion";

const H = 3_600_000;
const PRIMERA = Date.UTC(2026, 9, 24, 23);

describe("momento de la Gran Alineación", () => {
  it("3 días antes aparece el cartel; durante las 3 horas, «durante»; después, el resumen por 3 días", () => {
    expect(momentoAlineacion(PRIMERA - 4 * 24 * H).momento).toBe("nada");
    expect(momentoAlineacion(PRIMERA - 2 * 24 * H)).toMatchObject({ momento: "antes", numero: 1 });
    expect(momentoAlineacion(PRIMERA + H)).toMatchObject({ momento: "durante", numero: 1, fin: PRIMERA + 3 * H });
    expect(momentoAlineacion(PRIMERA + 5 * H)).toMatchObject({ momento: "despues", numero: 1 });
    expect(momentoAlineacion(PRIMERA + 3 * H + 4 * 24 * H).momento).toBe("nada");
    expect(momentoAlineacion(PRIMERA + 28 * 24 * H + H)).toMatchObject({ momento: "durante", numero: 2 });
  });
});
