import { describe, expect, it } from "vitest";
import { MUNDOS_LANDING as MUNDOS } from "@/lib/mundos";
import {
  alineacionEnCurso,
  CICLO_TOTAL_HORAS,
  CICLO_TOTAL_MS,
  DURACION_EVENTO_MS,
  esDeNoche,
  estadoCielo,
  faseDelDia,
  HORAS_DIA_CIUDAD,
  PRIMERA_ALINEACION_MS,
  proximaAlineacion,
} from "./cicloDia";

const HORA = 3_600_000;

describe("ciclo de día de las ciudades", () => {
  it("cada una de las 15 ciudades tiene su propio largo de día, todos distintos y divisores del ciclo de 28 días", () => {
    const slugs = MUNDOS.map((m) => m.slug).sort();
    expect(Object.keys(HORAS_DIA_CIUDAD).sort()).toEqual(slugs);
    const horas = Object.values(HORAS_DIA_CIUDAD);
    expect(new Set(horas).size).toBe(15);
    for (const h of horas) expect(CICLO_TOTAL_HORAS % h, String(h)).toBe(0);
    expect(CICLO_TOTAL_HORAS).toBe(28 * 24);
  });

  it("en cada alineación las 15 amanecen a la vez, y no antes: 28 días es el primer momento en que coinciden", () => {
    for (const k of [0, 1, 5]) {
      const t = PRIMERA_ALINEACION_MS + k * CICLO_TOTAL_MS;
      for (const slug of Object.keys(HORAS_DIA_CIUDAD)) expect(faseDelDia(slug, t), `${slug} k=${k}`).toBeCloseTo(0, 9);
    }
    // El mínimo común múltiplo de los largos es exactamente el ciclo.
    const mcd = (a: number, b: number): number => (b ? mcd(b, a % b) : a);
    const mcm = Object.values(HORAS_DIA_CIUDAD).reduce((a, b) => (a * b) / mcd(a, b), 1);
    expect(mcm).toBe(CICLO_TOTAL_HORAS);
    // A mitad de ciclo no están todas juntas.
    const medio = PRIMERA_ALINEACION_MS + CICLO_TOTAL_MS / 2;
    const fases = Object.keys(HORAS_DIA_CIUDAD).map((s) => faseDelDia(s, medio));
    expect(fases.some((f) => f > 0.01 && f < 0.99)).toBe(true);
  });

  it("la fase avanza con el reloj al ritmo de cada ciudad y siempre está en [0, 1)", () => {
    const t = PRIMERA_ALINEACION_MS + 6 * HORA;
    expect(faseDelDia("codia", t)).toBeCloseTo(0.5, 9); // 6 h de un día de 12 h: atardecer
    expect(faseDelDia("geografia", t)).toBeCloseTo(0.25, 9); // 6 h de 24: mediodía
    for (let k = -100; k < 100; k += 7) {
      const f = faseDelDia("historia", PRIMERA_ALINEACION_MS + k * 13 * HORA);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
    }
  });

  it("próxima alineación y evento en curso", () => {
    expect(proximaAlineacion(PRIMERA_ALINEACION_MS - HORA)).toBe(PRIMERA_ALINEACION_MS);
    expect(proximaAlineacion(PRIMERA_ALINEACION_MS + HORA)).toBe(PRIMERA_ALINEACION_MS + CICLO_TOTAL_MS);
    expect(alineacionEnCurso(PRIMERA_ALINEACION_MS + HORA)).toEqual({ inicio: PRIMERA_ALINEACION_MS, fin: PRIMERA_ALINEACION_MS + DURACION_EVENTO_MS });
    expect(alineacionEnCurso(PRIMERA_ALINEACION_MS + DURACION_EVENTO_MS + 1)).toBeNull();
    expect(alineacionEnCurso(PRIMERA_ALINEACION_MS - 1)).toBeNull();
    // La primera es un sábado a las 18:00 de Colombia (UTC−5).
    const d = new Date(PRIMERA_ALINEACION_MS - 5 * HORA);
    expect([d.getUTCDay(), d.getUTCHours()]).toEqual([6, 18]);
  });

  it("el cielo: de día hay sol y nada de noche; a medianoche, luna y noche cerrada; colores válidos", () => {
    const mediodia = estadoCielo(0.25);
    expect(mediodia.noche).toBe(0);
    expect(mediodia.sol).not.toBeNull();
    expect(mediodia.luna).toBeNull();
    expect(mediodia.sol!.y).toBeLessThan(0.3);
    const medianoche = estadoCielo(0.75);
    expect(medianoche.noche).toBe(1);
    expect(medianoche.luna).not.toBeNull();
    expect(medianoche.arriba).toBe("#0c1024");
    for (let f = 0; f < 1; f += 0.013) {
      const e = estadoCielo(f);
      expect(e.arriba).toMatch(/^#[0-9a-f]{6}$/);
      expect(e.noche).toBeGreaterThanOrEqual(0);
      expect(e.noche).toBeLessThanOrEqual(1);
    }
  });
});

describe("noche de cada ciudad (mismo corte que ciudad_de_noche de 0259)", () => {
  it("es de noche entre las fases 0,55 y 0,95 del día de esa ciudad", () => {
    const h = HORAS_DIA_CIUDAD.geografia * HORA;
    expect(esDeNoche("geografia", PRIMERA_ALINEACION_MS)).toBe(false);
    expect(esDeNoche("geografia", PRIMERA_ALINEACION_MS + h * 0.54)).toBe(false);
    expect(esDeNoche("geografia", PRIMERA_ALINEACION_MS + h * 0.56)).toBe(true);
    expect(esDeNoche("geografia", PRIMERA_ALINEACION_MS + h * 0.94)).toBe(true);
    expect(esDeNoche("geografia", PRIMERA_ALINEACION_MS + h * 0.96)).toBe(false);
    // Antes de la primera alineación también vale (la cuenta es módulo el largo del día).
    expect(esDeNoche("codia", PRIMERA_ALINEACION_MS - HORAS_DIA_CIUDAD.codia * HORA * 0.3)).toBe(true);
  });

  it("casi siempre hay alguna ciudad de noche (solo no la hay en las horas que siguen a la alineación, cuando todas amanecieron)", () => {
    let conNoche = 0;
    const muestras = 2000;
    for (let k = 0; k < muestras; k++) {
      const t = PRIMERA_ALINEACION_MS + ((k * CICLO_TOTAL_MS) / muestras);
      if (Object.keys(HORAS_DIA_CIUDAD).some((s) => esDeNoche(s, t))) conNoche++;
    }
    expect(conNoche / muestras).toBeGreaterThan(0.95);
    expect(Object.keys(HORAS_DIA_CIUDAD).some((s) => esDeNoche(s, PRIMERA_ALINEACION_MS + 2 * HORA))).toBe(false);
  });
});
