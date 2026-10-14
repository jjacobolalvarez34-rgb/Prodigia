import { describe, expect, it } from "vitest";
import { CATALOGO_NUEVO } from "@/lib/recompensas/catalogo";
import { msHastaCambioDiario, PUESTOS, relojHasta, rotacionDelDia } from "./bazar";

describe("bazar A + C", () => {
  it("la rotación es la misma para todos el mismo día y cambia de un día a otro", () => {
    const a = rotacionDelDia("2026-10-14", CATALOGO_NUEVO, 2);
    expect(a).toEqual(rotacionDelDia("2026-10-14", CATALOGO_NUEVO, 2));
    expect(a.otros).toHaveLength(3);
    expect(new Set([a.destacado, ...a.otros]).size).toBe(4);
    expect(rotacionDelDia("2026-10-15", CATALOGO_NUEVO, 2)).not.toEqual(a);
  });

  it("el destacado es épico o legendario y todo está a la venta", () => {
    for (let d = 1; d <= 28; d++) {
      const fecha = `2026-11-${String(d).padStart(2, "0")}`;
      const r = rotacionDelDia(fecha, CATALOGO_NUEVO, 3);
      const dest = CATALOGO_NUEVO.find((x) => x.item === r.destacado)!;
      expect(["epico", "legendario"]).toContain(dest.rareza);
      for (const slug of [r.destacado, ...r.otros]) {
        const it = CATALOGO_NUEVO.find((x) => x.item === slug)!;
        expect(it.vendible).toBe(true);
        expect(it.temporada == null || it.temporada === 3).toBe(true);
      }
    }
  });

  it("cada categoría vendible tiene su puesto en la calle", () => {
    const enPuestos = new Set(PUESTOS.flatMap((p) => p.categorias));
    for (const it of CATALOGO_NUEVO.filter((x) => x.vendible)) expect(enPuestos.has(it.categoria), it.item).toBe(true);
  });

  it("el reloj cuenta hasta la medianoche UTC", () => {
    expect(msHastaCambioDiario(Date.parse("2026-10-14T23:00:00Z"))).toBe(3_600_000);
    expect(relojHasta(3_725_000)).toBe("01:02:05");
  });
});
