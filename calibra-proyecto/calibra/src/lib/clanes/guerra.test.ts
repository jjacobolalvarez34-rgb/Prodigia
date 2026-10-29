import { describe, expect, it } from "vitest";
import { estadoGuerra, finSemanaGuerraMs, fraseGuerra, textoCierreGuerra } from "./guerra";

const clan = (id: string, xp: number) => ({ clan_id: id, nombre: id, tag: id.toUpperCase(), color_estandarte: "#fff", xp_semana: xp });
// Jueves 2026-10-29 12:00 UTC.
const JUEVES = Date.UTC(2026, 9, 29, 12);

describe("guerra de clanes", () => {
  it("cierra el lunes siguiente a las 00:00 UTC", () => {
    expect(new Date(finSemanaGuerraMs(JUEVES)).toISOString()).toBe("2026-11-02T00:00:00.000Z");
    expect(new Date(finSemanaGuerraMs(Date.UTC(2026, 10, 1, 23))).toISOString()).toBe("2026-11-02T00:00:00.000Z");
    expect(new Date(finSemanaGuerraMs(Date.UTC(2026, 10, 2, 0, 5))).toISOString()).toBe("2026-11-09T00:00:00.000Z");
    expect(textoCierreGuerra(finSemanaGuerraMs(JUEVES), JUEVES)).toBe("3 d 12 h");
  });

  it("persigue al de arriba", () => {
    const e = estadoGuerra([clan("bot", 9178), clan("mio", 2500)], "mio", JUEVES);
    expect(e).toMatchObject({ situacion: "persigue", puesto: 2, total: 2, diferencia: 6678 });
    expect(e.rival?.clan_id).toBe("bot");
    expect(fraseGuerra(e)).toMatch(/a 6.?678 Exp de \[BOT\]/);
  });

  it("lidera y mira al de abajo", () => {
    const e = estadoGuerra([clan("otro", 100), clan("mio", 400)], "mio", JUEVES);
    expect(e).toMatchObject({ situacion: "lidera", puesto: 1, diferencia: 300 });
    expect(e.rival?.clan_id).toBe("otro");
  });

  it("solo en la tabla", () => {
    expect(estadoGuerra([clan("mio", 5)], "mio", JUEVES).situacion).toBe("solo");
  });

  it("sin Exp esta semana: igual muestra al líder (antes no se veía nada)", () => {
    const e = estadoGuerra([clan("bot", 9178)], "mio", JUEVES);
    expect(e).toMatchObject({ situacion: "sin_exp", puesto: 0, miXp: 0, diferencia: 9178 });
    expect(fraseGuerra(estadoGuerra([], "mio", JUEVES))).toContain("Ningún clan");
  });
});
