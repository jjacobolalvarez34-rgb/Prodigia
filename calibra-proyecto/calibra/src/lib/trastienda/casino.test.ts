import { describe, it, expect } from "vitest";
import {
  ELEMENTOS_CASINO,
  TOTAL_ELEMENTOS_CASINO,
  ELEMENTO_CASINO_POR_SIMBOLO,
  FICHAS_CASINO,
  LIMITE_CASINO_DIARIO,
  EV_CASA_CASINO,
  zonaElementoCasino,
  esZonaCasinoValida,
  conteoZonaCasino,
  multCasino,
  gananciaCasino,
  type TipoElemento,
} from "./casino";

const TIPOS: TipoElemento[] = [
  "alcalino",
  "alcalinoterreo",
  "transicion",
  "post_transicion",
  "metaloides",
  "no_metal",
  "halogeno",
  "gas_noble",
  "lantanido",
  "actinido",
];

describe("ruleta casino (espejo de apostar_casino_elementos en 0127)", () => {
  it("la mesa completa tiene los 118 elementos sin duplicados", () => {
    expect(TOTAL_ELEMENTOS_CASINO).toBe(118);
    expect(new Set(ELEMENTOS_CASINO.map((e) => e.simbolo)).size).toBe(118);
    expect(ELEMENTO_CASINO_POR_SIMBOLO.size).toBe(118);
  });

  it("los tipos suman 118 y cada familia devuelve su conteo exacto", () => {
    const porTipo = TIPOS.reduce(
      (acc, t) => ({ ...acc, [t]: conteoZonaCasino(`tipo:${t}`) }),
      {} as Record<TipoElemento, number>
    );
    expect(Object.values(porTipo).reduce((a, b) => a + b, 0)).toBe(118);
    expect(porTipo.alcalino).toBe(6);
    expect(porTipo.alcalinoterreo).toBe(6);
    expect(porTipo.transicion).toBe(38);
    expect(porTipo.post_transicion).toBe(12);
    expect(porTipo.metaloides).toBe(6);
    expect(porTipo.no_metal).toBe(7);
    expect(porTipo.halogeno).toBe(6);
    expect(porTipo.gas_noble).toBe(7);
    expect(porTipo.lantanido).toBe(15);
    expect(porTipo.actinido).toBe(15);
  });

  it("paridad y grupo se cuentan contra el catálogo completo", () => {
    expect(conteoZonaCasino("paridad:par")).toBe(59);
    expect(conteoZonaCasino("paridad:impar")).toBe(59);
    expect(conteoZonaCasino("grupo:transicion")).toBe(conteoZonaCasino("tipo:transicion"));
    expect(conteoZonaCasino("grupo:1")).toBe(7); // alcalinos + el hidrógeno
    expect(conteoZonaCasino("grupo:18")).toBe(7); // gases nobles
  });

  it("elemento individual: zona válida y conteo 1", () => {
    for (const e of ELEMENTOS_CASINO) {
      expect(conteoZonaCasino(zonaElementoCasino(e.simbolo))).toBe(1);
      expect(esZonaCasinoValida(`elemento:${e.simbolo.toUpperCase()}`)).toBe(true);
    }
    expect(esZonaCasinoValida("elemento:au")).toBe(true);
    expect(esZonaCasinoValida("elemento:Xx")).toBe(false);
  });

  it("zonas inválidas se rechazan", () => {
    expect(esZonaCasinoValida("grupo:99")).toBe(false);
    expect(esZonaCasinoValida("periodo:8")).toBe(false);
    expect(esZonaCasinoValida("tipo:noexiste")).toBe(false);
    expect(esZonaCasinoValida("ruleta")).toBe(false);
    expect(esZonaCasinoValida("")).toBe(false);
  });

  it("el EV de casa por zona queda en ~0.88 (0.85-0.95)", () => {
    const zonas = [
      "paridad:par",
      "tipo:transicion",
      "tipo:gas_noble",
      "grupo:1",
      "grupo:18",
      "periodo:4",
      "elemento:Au",
      "elemento:H",
    ];
    for (const zona of zonas) {
      const n = conteoZonaCasino(zona);
      const ev = (n / TOTAL_ELEMENTOS_CASINO) * multCasino(n);
      expect(ev).toBeCloseTo(EV_CASA_CASINO, 2);
      expect(ev).toBeLessThan(0.95);
      expect(ev).toBeGreaterThan(0.85);
    }
  });

  it("la ganancia mínima es 1 Chispa y escala con la ficha", () => {
    expect(gananciaCasino(100, 59)).toBeGreaterThanOrEqual(1);
    expect(gananciaCasino(FICHAS_CASINO[0], conteoZonaCasino("elemento:H"))).toBeGreaterThan(10000);
    expect(gananciaCasino(0, 1)).toBe(1);
  });

  it("las fichas tienen valor alto (decisión PO) y el límite es 20/día", () => {
    expect(FICHAS_CASINO).toEqual([100, 250, 500, 1000]);
    expect(LIMITE_CASINO_DIARIO).toBe(20);
  });
});