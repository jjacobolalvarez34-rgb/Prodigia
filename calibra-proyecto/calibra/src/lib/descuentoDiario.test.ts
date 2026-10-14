import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { obtenerDescuentoDelDia, precioConDescuento } from "./descuentoDiario";

// La base cobra el precio exacto (0285): su lista de artículos con descuento tiene que
// ser la misma que la de acá, en el mismo orden.
const sql0285 = readFileSync(path.join(__dirname, "..", "..", "supabase", "migrations", "0285_ajustes_revision.sql"), "utf8");

describe("descuento del día", () => {
  it("la lista de la base es la misma que la de TypeScript", () => {
    const enSql = sql0285.match(/select array\[([^\]]+)\]::text\[\] as items/)![1].split(",").map((x) => x.trim().replace(/'/g, ""));
    const vistos = new Set<string>();
    for (let d = 0; d < 400; d++) vistos.add(obtenerDescuentoDelDia(new Date(Date.UTC(2026, 0, 1) + d * 86_400_000).toISOString().slice(0, 10)).item);
    expect(new Set(enSql)).toEqual(vistos);
    expect(enSql).not.toContain("fuente_manuscrita");
    expect(enSql).not.toContain("marco_prodigio");
  });

  it("el precio con descuento redondea igual que la base", () => {
    const { item, porcentaje } = obtenerDescuentoDelDia("2026-10-14");
    expect(precioConDescuento(1200, item, "2026-10-14")).toBe(Math.round(1200 * (1 - porcentaje / 100)));
    expect(precioConDescuento(1200, "otro", "2026-10-14")).toBe(1200);
  });
});
