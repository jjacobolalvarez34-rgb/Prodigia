import { describe, expect, it } from "vitest";
import { anilloEn, CINE, crearEstrellasCine, destelloEn, logoEn, recorrido, tablaRecorrido, velocidadEstrellas } from "./cinematicaPro";

describe("cinemática de Pro", () => {
  it("el logo llega al centro y después sube para el título", () => {
    const lejos = logoEn(0);
    const llegado = logoEn(CINE.llegaHasta);
    const final = logoEn(CINE.fin);
    expect(lejos.escala).toBeLessThan(0.1);
    expect(Math.abs(llegado.x)).toBeLessThan(0.01);
    expect(final.y).toBeLessThan(llegado.y);
  });

  it("las estrellas aceleran, frenan en la carga y casi se paran al estallar", () => {
    expect(velocidadEstrellas(1.4)).toBeGreaterThan(velocidadEstrellas(0.1));
    expect(velocidadEstrellas(CINE.estallido)).toBeLessThan(velocidadEstrellas(1.4));
    expect(velocidadEstrellas(CINE.fin)).toBeLessThan(0.3);
  });

  it("el recorrido tabulado siempre crece", () => {
    const tabla = tablaRecorrido();
    for (let t = 0.05; t < CINE.fin; t += 0.37) expect(recorrido(tabla, t + 0.1)).toBeGreaterThan(recorrido(tabla, t));
  });

  it("destello solo al estallar; anillos de a uno; estrellas fijas", () => {
    expect(destelloEn(CINE.estallido - 0.1)).toBe(0);
    expect(destelloEn(CINE.estallido + 0.08)).toBeCloseTo(1);
    expect(anilloEn(CINE.cargaDesde - 0.1, 0).opacidad).toBe(0);
    expect(anilloEn(CINE.cargaDesde + 0.45, 0).opacidad).toBeGreaterThan(0.5);
    expect(crearEstrellasCine(5)).toEqual(crearEstrellasCine(5));
  });
});
