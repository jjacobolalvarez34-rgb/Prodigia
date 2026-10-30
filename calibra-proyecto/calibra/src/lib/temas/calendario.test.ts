import { describe, expect, it } from "vitest";
import { inicioEventoMs, pascua, rangosDelAnio, temaDeFecha } from "./calendario";
import { temaActivo } from "./temas";

describe("calendario de festividades", () => {
  it("calcula la Pascua de cada año", () => {
    expect(pascua(2026)).toBe("2026-04-05");
    expect(pascua(2027)).toBe("2027-03-28");
    expect(pascua(2028)).toBe("2028-04-16");
  });

  it("Halloween: decoración desde el 20, evento del 24 al 31 y cierre el 1, pero el 1 ya es Día de Muertos", () => {
    expect(temaDeFecha("2026-10-19")).toBeNull();
    expect(temaDeFecha("2026-10-20")).toMatchObject({ id: "halloween", fase: "decoracion" });
    expect(temaDeFecha("2026-10-24")).toMatchObject({ id: "halloween", fase: "evento" });
    expect(temaDeFecha("2026-10-31")).toMatchObject({ id: "halloween", fase: "evento" });
    expect(temaDeFecha("2026-11-01")).toMatchObject({ id: "muertos", fase: "evento" });
    // Día de Muertos tiene colección (0309): el 3 es su día de cierre; el 4, nada.
    expect(temaDeFecha("2026-11-03")).toMatchObject({ id: "muertos", fase: "cierre" });
    expect(temaDeFecha("2026-11-04")).toBeNull();
  });

  it("Diwali 2026 entra después de Muertos; Navidad y Año Nuevo se pasan la posta", () => {
    expect(temaDeFecha("2026-11-06")).toMatchObject({ id: "diwali", fase: "decoracion" });
    expect(temaDeFecha("2026-11-08")).toMatchObject({ id: "diwali", fase: "evento" });
    expect(temaDeFecha("2026-11-27")).toMatchObject({ id: "viernes_estelar", fase: "evento" });
    expect(temaDeFecha("2026-12-01")).toMatchObject({ id: "navidad", fase: "evento" });
    expect(temaDeFecha("2026-12-26")).toMatchObject({ id: "navidad", fase: "evento" });
    expect(temaDeFecha("2026-12-31")).toMatchObject({ id: "anio_nuevo", fase: "evento" });
    expect(temaDeFecha("2027-01-02")).toMatchObject({ id: "anio_nuevo", fase: "evento" });
  });

  it("Carnaval y Pascua salen de la fecha de Pascua", () => {
    // En 2027 se pisan: Carnaval en sus días (6 – 9 feb) y el Año Nuevo Lunar sigue después.
    expect(temaDeFecha("2027-02-06")).toMatchObject({ id: "carnaval", fase: "evento" });
    expect(temaDeFecha("2027-02-09")).toMatchObject({ id: "carnaval", fase: "evento" });
    expect(temaDeFecha("2027-02-10")).toMatchObject({ id: "anio_nuevo_lunar", fase: "evento" });
    expect(temaDeFecha("2027-03-26")).toMatchObject({ id: "pascua", fase: "evento" });
    expect(temaDeFecha("2027-03-29")).toMatchObject({ id: "pascua", fase: "evento" });
  });

  it("nunca hay dos temas a la vez: un día da un solo tema", () => {
    for (let d = Date.UTC(2026, 9, 1); d < Date.UTC(2028, 0, 1); d += 86_400_000) {
      const iso = new Date(d).toISOString().slice(0, 10);
      const t = temaDeFecha(iso);
      if (t) expect(["decoracion", "evento", "cierre"]).toContain(t.fase);
    }
    const ids = rangosDelAnio(2027).map((r) => r.id);
    expect(ids).toContain("navidad");
    expect(ids).toContain("diwali");
  });

  it("ningún evento abre durante la Gran Alineación: Halloween 2026 abre al terminar (25/10 02:00 UTC)", () => {
    expect(inicioEventoMs({ desde: "2026-10-24" })).toBe(Date.UTC(2026, 9, 25, 2));
    // Un evento sin Alineación cerca abre a las 00:00 UTC de su primer día.
    expect(inicioEventoMs({ desde: "2026-12-01" })).toBe(Date.UTC(2026, 11, 1));
    // Antes de abrir sigue en decoración; después, en evento.
    expect(temaActivo(Date.UTC(2026, 9, 24, 23, 30))?.fase).toBe("decoracion");
    expect(temaActivo(Date.UTC(2026, 9, 25, 2, 1))?.fase).toBe("evento");
  });
});
