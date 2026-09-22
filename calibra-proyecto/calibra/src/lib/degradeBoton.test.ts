import { describe, expect, it } from "vitest";
import {
  DEGRADE_PRIMARIO_DEFAULT,
  contrasteConBlanco,
  degradeCalidoMundo,
  gradientePrimario,
  paradasPrimario,
} from "@/lib/degradeBoton";
import { MUNDOS_LANDING } from "@/lib/mundos";

// Regresión: el degradé viejo de Boton.tsx era `colorHex → #FFC53D` (o
// `var(--primario) → var(--logro)` sin colorHex) — plano, 2 paradas, y
// SIEMPRE terminaba en el mismo amarillo dorado sin importar el mundo. Acá
// se verifica que el degradé nuevo (3 paradas cálidas) no vuelva a caer en
// eso, y que cumpla contraste WCAG AA (≥4.5:1) contra texto blanco en TODAS
// las paradas, para el default y para los 13 colores reales de los mundos.
describe("degradeBoton", () => {
  it("el degradé por defecto no usa el amarillo plano viejo (#FFC53D)", () => {
    const css = gradientePrimario();
    expect(css.toUpperCase()).not.toContain("#FFC53D");
    expect(css).toContain("linear-gradient(120deg,");
  });

  it("el degradé de un mundo no termina en el amarillo plano viejo, sea cual sea el colorHex", () => {
    for (const { colorHex } of MUNDOS_LANDING) {
      const css = gradientePrimario(colorHex);
      expect(css.toUpperCase()).not.toContain("#FFC53D");
    }
  });

  it("el color propio del mundo sigue siendo la primera parada (protagonista): mismo matiz, solo puede oscurecerse", () => {
    const hue = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      const r = ((n >> 16) & 255) / 255;
      const g = ((n >> 8) & 255) / 255;
      const b = (n & 255) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max === min) return 0;
      const d = max - min;
      let h;
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      return h * 60;
    };
    for (const { slug, colorHex } of MUNDOS_LANDING) {
      const [s1] = degradeCalidoMundo(colorHex);
      expect(s1).toMatch(/^#[0-9a-fA-F]{6}$/);
      const diff = Math.abs(hue(s1) - hue(colorHex));
      expect(Math.min(diff, 360 - diff), `${slug}: matiz de ${s1} se alejó demasiado de ${colorHex}`).toBeLessThan(2);
    }
  });

  it("degradé por defecto: las 3 paradas cumplen contraste AA (>=4.5:1) contra blanco", () => {
    for (const parada of DEGRADE_PRIMARIO_DEFAULT) {
      expect(contrasteConBlanco(parada)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("las 13 paradas iniciales/intermedias/finales de TODOS los mundos cumplen contraste AA", () => {
    expect(MUNDOS_LANDING.length).toBe(13);
    for (const { slug, colorHex } of MUNDOS_LANDING) {
      const paradas = degradeCalidoMundo(colorHex);
      for (const parada of paradas) {
        expect(
          contrasteConBlanco(parada),
          `${slug} (${colorHex}) → parada ${parada} no llega a 4.5:1`
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("paradasPrimario sin colorHex devuelve el default; con colorHex devuelve el del mundo", () => {
    expect(paradasPrimario()).toEqual(DEGRADE_PRIMARIO_DEFAULT);
    const calculia = MUNDOS_LANDING.find((m) => m.slug === "calculia")!;
    expect(paradasPrimario(calculia.colorHex)).toEqual(degradeCalidoMundo(calculia.colorHex));
  });
});
