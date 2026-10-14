import { describe, expect, it } from "vitest";
import { PRODUCTOS } from "./productos";
import { ahorroAnual, bonoPorcentaje, MAS_ELEGIDO, mejorValor, PAQUETES_CHISPAS, PAQUETES_COMETAS, precioTexto } from "./vitrina";
import { ilustracionPaquete, ILUSTRACION_GENERICA } from "@/lib/tienda/ilustracionesPaquetes";
import { PAQUETES } from "@/lib/recompensas/catalogo";

describe("vitrina de pagos", () => {
  it("el paquete base no tiene bono y los demás crecen con el tamaño", () => {
    for (const lista of [PAQUETES_CHISPAS, PAQUETES_COMETAS]) {
      expect(bonoPorcentaje(lista[0])).toBe(0);
      for (let i = 1; i < lista.length; i++) expect(bonoPorcentaje(lista[i])).toBeGreaterThan(bonoPorcentaje(lista[i - 1]));
    }
  });

  it("el bono nunca promete más de lo que da", () => {
    for (const p of [...PAQUETES_CHISPAS, ...PAQUETES_COMETAS]) {
      const lista = PRODUCTOS[p].tipo === "cometas" ? PAQUETES_COMETAS : PAQUETES_CHISPAS;
      const d = PRODUCTOS[p];
      const base = PRODUCTOS[lista[0]];
      const real = ((d.montoCometas ?? d.montoChispas ?? 0) / d.precioUsd / ((base.montoCometas ?? base.montoChispas ?? 0) / base.precioUsd) - 1) * 100;
      expect(bonoPorcentaje(p)).toBeLessThanOrEqual(real);
    }
  });

  it("los números concretos de hoy", () => {
    expect(bonoPorcentaje("chispas_15000")).toBe(99);
    expect(bonoPorcentaje("cometas_7000")).toBe(38);
    expect(mejorValor(PAQUETES_CHISPAS)).toBe("chispas_15000");
    expect(mejorValor(PAQUETES_COMETAS)).toBe("cometas_7000");
    expect(ahorroAnual()).toEqual({ usd: 19.89, porcentaje: 33, porMes: 3.33 });
    expect(precioTexto(4.99)).toBe("US$4.99");
  });

  it("los más elegidos existen en las listas", () => {
    for (const p of MAS_ELEGIDO) expect([...PAQUETES_CHISPAS, ...PAQUETES_COMETAS]).toContain(p);
  });

  it("cada paquete de la tienda tiene su ilustración propia", () => {
    for (const p of PAQUETES) expect(ilustracionPaquete(p.item), p.item).not.toBe(ILUSTRACION_GENERICA);
  });
});
