// Decimales (reporte 2026-10-23: «convertir» repetía siempre «1/2 a decimal»).
// Cada forma de enunciado se recalcula desde el texto (lo que ve el jugador) y se
// compara con la respuesta guardada; un enunciado que no encaje con ninguna forma
// conocida también falla, para que nada quede sin verificar.
import { describe, expect, it } from "vitest";
import { desarrolloDecimal, generarProblemaDecimal, TIPOS_DECIMAL, type TipoDecimal } from "./decimales";
import { conSemilla } from "./variedad";

const num = (s: string) => Number(s.replace(",", "."));
const mcd = (a: number, b: number): number => (b === 0 ? a : mcd(b, a % b));
const cerca = (a: number, b: number) => Math.abs(a - b) < 1e-9;

// Redondeo «mitad hacia arriba» exacto, sobre el texto (BigInt, sin coma flotante).
function redondearTexto(texto: string, k: number): number {
  const [ent, decs = ""] = texto.split(",");
  const n = BigInt(ent + decs);
  const d = decs.length;
  const [uno, dos, diez] = [BigInt(1), BigInt(2), BigInt(10)];
  let salto = uno;
  for (let i = 0; i < d - k; i++) salto *= diez;
  const r = ((n * dos + salto) / (dos * salto)) * salto;
  return Number(r) / 10 ** d;
}

const roundFrac = (n: number, d: number, k: number) => Math.floor((2 * n * 10 ** k + d) / (2 * d)) / 10 ** k;

const POSICION: Record<string, number> = { "al millar": -3, "a la centena": -2, "a la decena": -1, "al entero": 0, "a 1 decimal": 1 };

// Devuelve la respuesta correcta recalculada, o null si el enunciado no es de una forma conocida.
function recalcular(e: string): { respuesta: number; extra?: () => void } | null {
  let m: RegExpExecArray | null;
  if ((m = /^Convierte \$\\frac\{(\d+)\}\{(\d+)\}\$ a decimal$/.exec(e))) {
    const [n, d] = [Number(m[1]), Number(m[2])];
    return { respuesta: n / d, extra: () => expect(mcd(n, d), e).toBe(1) };
  }
  if ((m = /^Convierte \$\\frac\{(\d+)\}\{(\d+)\}\$ a decimal \(redondea a (\d) decimales\)$/.exec(e))) return { respuesta: roundFrac(Number(m[1]), Number(m[2]), Number(m[3])) };
  if ((m = /^([\d,]+) = \? %$/.exec(e))) return { respuesta: num(m[1]) * 100 };
  if ((m = /^Escribe ([\d,]+) % como decimal$/.exec(e))) return { respuesta: num(m[1]) / 100 };
  if ((m = /^\$\\frac\{(\d+)\}\{(\d+)\}\$ = \? %$/.exec(e))) return { respuesta: (Number(m[1]) * 100) / Number(m[2]) };
  if ((m = /^\$\\frac\{(\d+)\}\{(\d+)\}\$ = \? % \(redondea a 1 decimal\)$/.exec(e))) return { respuesta: roundFrac(Number(m[1]) * 100, Number(m[2]), 1) };
  if ((m = /^Completa: ([\d,]+) = \$\\frac\{\?\}\{(\d+)\}\$$/.exec(e))) return { respuesta: Math.round(num(m[1]) * Number(m[2])) };
  if ((m = /^([\d,]+) % escrito como fracción irreducible es \$\\frac\{(\d+)\}\{\?\}\$$/.exec(e))) {
    const [p, n] = [num(m[1]), Number(m[2])];
    const d = Math.round((n * 100) / p);
    return { respuesta: d, extra: () => (expect(cerca(n / d, p / 100), e).toBe(true), expect(mcd(n, d), e).toBe(1)) };
  }
  if ((m = /^El decimal periódico (\d+),(\d+)… es igual a \$\\frac\{(\?|\d+)\}\{(\?|\d+)\}\$$/.exec(e))) {
    const cifras = m[2];
    const valor = num(`${m[1]},${cifras}`);
    // La fracción buscada: se completa la incógnita y se comprueba el desarrollo.
    const n = m[3] === "?" ? Math.round(valor * Number(m[4])) : Number(m[3]);
    const d = m[4] === "?" ? Math.round(n / valor) : Number(m[4]);
    return {
      respuesta: m[3] === "?" ? n : d,
      extra: () => {
        expect(mcd(n, d), e).toBe(1);
        const { anteperiodo, periodo } = desarrolloDecimal(n, d);
        expect(periodo.length, e).toBeGreaterThan(0);
        expect((anteperiodo + periodo.repeat(20)).startsWith(cifras), e).toBe(true);
      },
    };
  }
  if ((m = /^¿Cuánto es ([\d,]+) % de (\d+)\?$/.exec(e))) return { respuesta: (num(m[1]) * Number(m[2])) / 100 };
  if ((m = /^¿Qué porcentaje de (\d+) es (\d+)\?$/.exec(e))) return { respuesta: (Number(m[2]) / Number(m[1])) * 100 };
  if ((m = /^Un precio de (\d+) (sube|baja) un (\d+) %\. ¿Cuánto queda\?$/.exec(e))) {
    const [b, p] = [Number(m[1]), Number(m[3])];
    return { respuesta: m[2] === "sube" ? b * (1 + p / 100) : b * (1 - p / 100) };
  }
  if ((m = /^El (\d+) % de un número es ([\d,]+)\. ¿Cuál es el número\?$/.exec(e))) return { respuesta: (num(m[2]) * 100) / Number(m[1]) };
  if ((m = /^Un precio (sube|baja) un (\d+) % y después (sube|baja) un (\d+) %\. ¿Qué porcentaje del precio original queda\?$/.exec(e))) {
    const f = (dir: string, p: number) => (dir === "sube" ? 1 + p / 100 : 1 - p / 100);
    return { respuesta: f(m[1], Number(m[2])) * f(m[3], Number(m[4])) * 100 };
  }
  if ((m = /^Redondea ([\d,]+) (al millar|a la centena|a la decena|al entero|a 1 decimal|a (\d) decimales)$/.exec(e))) {
    const k = m[3] ? Number(m[3]) : POSICION[m[2]];
    const texto = m[1].includes(",") ? m[1] : `${m[1]},`;
    return { respuesta: redondearTexto(texto.replace(/,$/, ""), k) };
  }
  return null;
}

const niveles = (n: number) => Object.fromEntries(TIPOS_DECIMAL.map((t) => [t, n])) as Record<TipoDecimal, number>;

describe("decimales: respuestas correctas y enunciados claros", () => {
  for (const tipo of TIPOS_DECIMAL) {
    it(`${tipo}: toda respuesta coincide con la recalculada desde el enunciado`, () => {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 200; i++) {
          const p = conSemilla(nivel * 1000 + i, () => generarProblemaDecimal(niveles(nivel), [tipo]));
          const r = recalcular(p.enunciado);
          expect(r, `forma desconocida: ${p.enunciado}`).not.toBeNull();
          r!.extra?.();
          expect(cerca(p.respuesta, r!.respuesta), `${p.enunciado} → ${p.respuesta} (debería ser ${r!.respuesta})`).toBe(true);
          // Respuestas sin signo (la app no tiene tecla de «−» en Decimales) y sin ruido;
          // solo redondear puede dar 0 («Redondea 0,23 al entero»).
          expect(p.respuesta).toBeGreaterThanOrEqual(tipo === "redondear" ? 0 : Number.MIN_VALUE);
          expect(String(p.respuesta)).not.toMatch(/\d\.\d{7,}/);
          expect(p.tolerancia).toBe(0);
          expect(p.pasos?.length ?? 0).toBeGreaterThan(0);
        }
      }
    });
  }

  it("convertir ya no es siempre «1/2 a decimal» en nivel 1 (bug del 2026-10-23)", () => {
    const vistos = new Set<string>();
    for (let i = 0; i < 300; i++) vistos.add(conSemilla(i, () => generarProblemaDecimal(niveles(1), ["convertir"]).enunciado));
    expect(vistos.size).toBeGreaterThanOrEqual(30);
  });

  it("los decimales periódicos aparecen solo en niveles altos (la dificultad se nota)", () => {
    const conPeriodo = (nivel: number) => {
      let c = 0;
      for (let i = 0; i < 300; i++) {
        const e = conSemilla(i, () => generarProblemaDecimal(niveles(nivel), ["convertir"]).enunciado);
        if (/periódico|redondea/.test(e)) c++;
      }
      return c;
    };
    expect(conPeriodo(1)).toBe(0);
    expect(conPeriodo(4)).toBe(0);
    expect(conPeriodo(8)).toBeGreaterThan(100);
    expect(conPeriodo(10)).toBeGreaterThan(100);
  });

  it("desarrolloDecimal separa anteperíodo y período", () => {
    expect(desarrolloDecimal(1, 6)).toEqual({ entero: 0, anteperiodo: "1", periodo: "6" });
    expect(desarrolloDecimal(3, 11)).toEqual({ entero: 0, anteperiodo: "", periodo: "27" });
    expect(desarrolloDecimal(7, 4)).toEqual({ entero: 1, anteperiodo: "75", periodo: "" });
    expect(desarrolloDecimal(1, 27)).toEqual({ entero: 0, anteperiodo: "", periodo: "037" });
  });
});
