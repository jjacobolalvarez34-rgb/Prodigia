import { describe, expect, it } from "vitest";
import { agruparCapsulas, fusionesPosibles, nivelFusion } from "./fusion";
import type { Capsula } from "./api";

const cap = (id: string, tipo: Capsula["tipo"], creada = "2026-10-1" + id): Capsula => ({ id, tipo, mundo: null, detalle: null, creada_at: creada });

describe("fusión de cápsulas", () => {
  it("usa el mismo mapa de niveles que la base (0290)", () => {
    expect(nivelFusion("diaria")).toBe(1);
    expect(nivelFusion("racha")).toBe(2);
    expect(nivelFusion("oro")).toBe(3);
    expect(nivelFusion("prisma")).toBeNull();
    expect(nivelFusion("alineacion")).toBeNull();
  });

  it("propone fusionar solo con 3 o más del mismo nivel, las más viejas primero", () => {
    const lista = [cap("4", "misiones"), cap("1", "diaria"), cap("2", "nivel"), cap("3", "liga"), cap("5", "racha"), cap("6", "plata")];
    const f = fusionesPosibles(lista);
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ nivel: 1, cuantas: 4, destino: "plata", costo: 50, ids: ["1", "2", "3"] });
  });

  it("agrupa por tipo y pone arriba las de mayor rango", () => {
    const g = agruparCapsulas([cap("1", "diaria"), cap("2", "diaria"), cap("3", "prisma")]);
    expect(g.map((x) => [x.tipo, x.capsulas.length])).toEqual([["prisma", 1], ["diaria", 2]]);
  });
});
