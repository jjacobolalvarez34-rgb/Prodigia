import { describe, expect, it } from "vitest";
import { PRODUCTOS } from "@/lib/pagos/productos";
import { preciosPresentacion } from "./precios";

describe("precios de la presentación", () => {
  it("salen del catálogo real, con coma decimal en español", () => {
    const p = preciosPresentacion("es");
    expect(p.mensual).toBe(PRODUCTOS.pro_mensual.precioUsd.toLocaleString("es", { minimumFractionDigits: 2 }));
    expect(p.anual).toBe("39,99");
    expect(p.mensual).toBe("4,99");
    expect(p.minimo).toBe("0,99");
    expect(p.mundo).toBe("2,99");
  });

  it("calcula el ahorro del plan anual frente a 12 meses", () => {
    const { mensual, anual } = { mensual: PRODUCTOS.pro_mensual.precioUsd, anual: PRODUCTOS.pro_anual.precioUsd };
    expect(preciosPresentacion("es").ahorro).toBe(Math.round((1 - anual / (mensual * 12)) * 100));
    expect(preciosPresentacion("es").ahorro).toBe(33);
  });

  it("en inglés usa punto", () => {
    expect(preciosPresentacion("en").mensual).toBe("4.99");
  });
});
