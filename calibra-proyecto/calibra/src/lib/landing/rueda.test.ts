import { describe, expect, it } from "vitest";
import { MUNDOS_LANDING } from "@/lib/mundos";
import { ajustar, anguloDesdeCentro, deltaAngulo, destinoConInercia, giroParaIndice, indiceArriba, NEON_MUNDO, ordenEncendido, paso } from "./rueda";

const N = 15;

describe("rueda de ciudades", () => {
  it("cada ciudad ocupa 24 grados", () => {
    expect(paso(N)).toBe(24);
  });

  it("sabe qué ciudad queda arriba, girando para los dos lados", () => {
    expect(indiceArriba(0, N)).toBe(0);
    expect(indiceArriba(-24, N)).toBe(1);
    expect(indiceArriba(24, N)).toBe(14);
    expect(indiceArriba(-360 - 48, N)).toBe(2);
    expect(indiceArriba(-35, N)).toBe(1);
  });

  it("frena siempre justo en una ciudad", () => {
    expect(ajustar(37, N)).toBe(48);
    expect(ajustar(-11, N) === 0).toBe(true);
    expect(ajustar(-13, N)).toBe(-24);
  });

  it("al tocar una ciudad gira por el camino más corto", () => {
    expect(giroParaIndice(0, 1, N)).toBe(-24);
    expect(giroParaIndice(0, 14, N)).toBe(24);
    expect(giroParaIndice(-720, 3, N)).toBe(-792);
    for (let i = 0; i < N; i++) {
      const g = giroParaIndice(100, i, N);
      expect(indiceArriba(g, N)).toBe(i);
      expect(Math.abs(g - 100)).toBeLessThanOrEqual(192);
    }
  });

  it("mide el ángulo desde arriba en sentido horario", () => {
    expect(anguloDesdeCentro(0, -10, 0, 0)).toBeCloseTo(0);
    expect(anguloDesdeCentro(10, 0, 0, 0)).toBeCloseTo(90);
    expect(anguloDesdeCentro(-10, 0, 0, 0)).toBeCloseTo(-90);
  });

  it("no salta al cruzar los 180 grados", () => {
    expect(deltaAngulo(170, -170)).toBe(20);
    expect(deltaAngulo(-170, 170)).toBe(-20);
  });

  it("la inercia queda ajustada y limitada", () => {
    expect(destinoConInercia(0, 0, N)).toBe(0);
    expect(destinoConInercia(0, 10, N) % 24).toBe(0);
    expect(Math.abs(destinoConInercia(0, 10, N))).toBeLessThanOrEqual(552);
  });

  it("todas las ciudades tienen neón y glifo", () => {
    for (const m of MUNDOS_LANDING) {
      expect(NEON_MUNDO[m.slug]?.neon).toMatch(/^#[0-9A-F]{6}$/i);
      expect(NEON_MUNDO[m.slug]?.glifo.length).toBeGreaterThan(0);
    }
  });

  it("el letrero se enciende en desorden pero igual en servidor y cliente", () => {
    const a = ordenEncendido(12);
    expect(a).toEqual(ordenEncendido(12));
    expect([...a].sort((x, y) => x - y)).toEqual(Array.from({ length: 12 }, (_, i) => i));
    expect(a).not.toEqual(Array.from({ length: 12 }, (_, i) => i));
  });
});
