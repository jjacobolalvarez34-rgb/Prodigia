import { describe, it, expect } from "vitest";
import { mulberry32 } from "@/lib/rng";
import {
  generarProblemaNaipia,
  preguntaNaipia,
  conRngSembrado,
  enunciadoCompleto,
  cartasATexto,
  BANDA_NAIPIA,
  NIVEL_MIN_MEMORIA,
  TOPE_TOTAL_MEMORIA_MS,
  msPorCartaBase,
  memoriaParaNivel,
  type ProblemaNaipia,
  type SistemaConteo,
} from "./naipia";

// Modo memoria (niveles altos): umbral, tabla de ritmo, tope de tiempo y que
// el enunciado NO filtre la secuencia. La corrección de las respuestas de
// estos mismos problemas la cubre naipia.test.ts (verificarProblema recalcula
// cada respuesta con un método independiente, también con `memoria`).

const MODOS_SECUENCIA: SistemaConteo[] = ["hilo", "ko", "hiopt2", "omega2"];

// true si el enunciado no contiene la secuencia como texto: ni "7♠ K♥ ...",
// ni "Cartas:", ni un palo escrito con símbolo, ni "7 de picas", ni la
// palabra "indicadas" (que remite a cartas a la vista).
function enunciadoNoFiltraSecuencia(p: ProblemaNaipia): boolean {
  const e = p.enunciado;
  if (e.includes(cartasATexto(p.cartas))) return false;
  if (/Cartas:/i.test(e)) return false;
  if (/[♠♥♦♣]/.test(e)) return false;
  if (/\b(10|[2-9AJQK]) de (picas|corazones|diamantes|tr[eé]boles)/i.test(e)) return false;
  if (/indicadas/i.test(e)) return false;
  return true;
}

describe("Naipia — modo memoria (niveles altos)", () => {
  it("niveles bajos y medios: SIEMPRE cartas visibles, sin campo memoria", () => {
    for (const modo of MODOS_SECUENCIA) {
      for (let nivel = 1; nivel < NIVEL_MIN_MEMORIA; nivel++) {
        for (let i = 0; i < 60; i++) {
          expect(generarProblemaNaipia(modo, nivel).memoria, `${modo} ${nivel}`).toBeUndefined();
        }
      }
    }
  });

  it("umbral por sistema: memoria desde el nivel 6 salvo el primer escalón de la banda (Omega II: desde el 8)", () => {
    const primerNivelConMemoria: Record<SistemaConteo, number> = { hilo: 6, ko: 6, hiopt2: 6, omega2: 8 };
    for (const modo of MODOS_SECUENCIA) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        const conMemoria = nivel >= primerNivelConMemoria[modo];
        for (let i = 0; i < 40; i++) {
          const p = generarProblemaNaipia(modo, nivel);
          expect(p.memoria !== undefined, `${modo} nivel ${nivel}`).toBe(conMemoria);
        }
      }
    }
  });

  it("el primer escalón de cada banda (donde se muestra la tabla) nunca es memoria", () => {
    for (const modo of MODOS_SECUENCIA) {
      const { min, max } = BANDA_NAIPIA[modo];
      for (let nivel = 1; nivel <= 10; nivel++) {
        if (Math.min(max, Math.max(min, nivel)) !== min) continue;
        expect(memoriaParaNivel(modo, nivel, 10), `${modo} ${nivel}`).toBeNull();
      }
    }
  });

  it("conteo verdadero: nunca memoria (los datos ya vienen calculados)", () => {
    for (let nivel = 1; nivel <= 10; nivel++) {
      for (let i = 0; i < 100; i++) expect(generarProblemaNaipia("verdadero", nivel).memoria).toBeUndefined();
    }
    expect(memoriaParaNivel("verdadero", 10, 12)).toBeNull();
  });

  it("tabla nivel -> ms por carta: 1600 a 500, estrictamente decreciente", () => {
    const tabla = [6, 7, 8, 9, 10].map(msPorCartaBase);
    expect(tabla).toEqual([1600, 1325, 1050, 775, 500]);
    for (let k = 1; k < tabla.length; k++) expect(tabla[k]).toBeLessThan(tabla[k - 1]);
  });

  it("los ms por carta no crecen con el nivel para una misma secuencia", () => {
    for (const modo of MODOS_SECUENCIA) {
      for (const n of [6, 10, 14, 18]) {
        let previo = Infinity;
        for (let nivel = 6; nivel <= 10; nivel++) {
          const m = memoriaParaNivel(modo, nivel, n);
          if (!m) continue; // primer escalón de la banda
          expect(m.msPorCarta).toBeLessThanOrEqual(previo);
          previo = m.msPorCarta;
        }
      }
    }
    // A largo corto se ve la tabla completa (sin tope).
    expect(memoriaParaNivel("hilo", 6, 8)!.msPorCarta).toBe(1600);
    expect(memoriaParaNivel("hilo", 10, 8)!.msPorCarta).toBe(500);
  });

  it("tope de tiempo total: n x ms nunca supera TOPE_TOTAL_MEMORIA_MS (secuencias largas van más rápido)", () => {
    let conMemoria = 0;
    for (const modo of MODOS_SECUENCIA) {
      for (let nivel = 6; nivel <= 10; nivel++) {
        for (let i = 0; i < 100; i++) {
          const p = generarProblemaNaipia(modo, nivel);
          if (!p.memoria) continue;
          conMemoria++;
          expect(p.memoria.msPorCarta * p.cartas.length).toBeLessThanOrEqual(TOPE_TOTAL_MEMORIA_MS);
        }
      }
    }
    expect(conMemoria).toBeGreaterThan(1000);
    expect(memoriaParaNivel("omega2", 8, 18)!.msPorCarta).toBe(Math.floor(TOPE_TOTAL_MEMORIA_MS / 18));
  });

  it("el enunciado de un problema con memoria no filtra la secuencia (todos los modos, niveles y tipos)", () => {
    let vistos = 0;
    const tipos = new Set<string>();
    for (const modo of MODOS_SECUENCIA) {
      for (let nivel = 6; nivel <= 10; nivel++) {
        for (let i = 0; i < 150; i++) {
          const p = generarProblemaNaipia(modo, nivel);
          if (!p.memoria) continue;
          vistos++;
          tipos.add(p.tipo);
          expect(p.cartas.length).toBeGreaterThan(0);
          expect(enunciadoNoFiltraSecuencia(p), p.enunciado).toBe(true);
        }
      }
    }
    expect(vistos).toBeGreaterThan(1000);
    expect(tipos).toEqual(new Set(["corriente", "restante"]));
  });

  it("el detector de fuga funciona (sanidad): la versión de texto plano SÍ se detecta", () => {
    const p = generarProblemaNaipia("hilo", 6);
    expect(p.memoria).toBeDefined();
    expect(enunciadoNoFiltraSecuencia({ ...p, enunciado: enunciadoCompleto(p) })).toBe(false);
    expect(enunciadoNoFiltraSecuencia({ ...p, enunciado: "Ya salieron las cartas indicadas" })).toBe(false);
    expect(enunciadoNoFiltraSecuencia({ ...p, enunciado: "El 7 de picas sale primero" })).toBe(false);
  });

  it("sinMemoria fuerza cartas visibles aunque el nivel sea alto (diagnóstico y reto)", () => {
    for (const modo of MODOS_SECUENCIA) {
      for (let i = 0; i < 40; i++) {
        const p = generarProblemaNaipia(modo, 10, { sinMemoria: true });
        expect(p.memoria).toBeUndefined();
        expect(p.enunciado).not.toMatch(/desaparecen/);
      }
    }
  });

  it("activar el modo memoria no cambia la secuencia ni la respuesta con la misma semilla", () => {
    for (const modo of MODOS_SECUENCIA) {
      for (let seed = 1; seed <= 60; seed++) {
        const con = conRngSembrado(mulberry32(seed), () => generarProblemaNaipia(modo, 9));
        const sin = conRngSembrado(mulberry32(seed), () => generarProblemaNaipia(modo, 9, { sinMemoria: true }));
        expect(con.memoria).toBeDefined();
        expect(con.cartas).toEqual(sin.cartas);
        expect(con.respuesta).toBe(sin.respuesta);
        expect(con.tipo).toBe(sin.tipo);
      }
    }
  });

  it("el ritmo sale de la semilla y del nivel, sin Math.random (mismo nivel forzado en un duelo, mismo ritmo)", () => {
    const original = Math.random;
    Math.random = () => {
      throw new Error("Math.random no debe usarse dentro de conRngSembrado");
    };
    try {
      for (let seed = 1; seed <= 30; seed++) {
        const a = conRngSembrado(mulberry32(seed), () => generarProblemaNaipia("ko", 8));
        const b = conRngSembrado(mulberry32(seed), () => generarProblemaNaipia("ko", 8));
        expect(a).toEqual(b);
        expect(a.memoria).toEqual(memoriaParaNivel("ko", 8, a.cartas.length));
      }
    } finally {
      Math.random = original;
    }
  });

  it("el reto diario nunca entra en modo memoria: la secuencia viaja como texto", () => {
    for (let s = 1; s <= 400; s++) {
      const q = preguntaNaipia(mulberry32(s));
      expect(q.enunciado).toMatch(/Cartas: /);
      expect(q.enunciado).not.toMatch(/desaparecen/);
    }
  });
});
