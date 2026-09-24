import { UNO, aNumero, divF, frac, igualF, mulF, restaF, sumaF, negF, type Frac } from "./fracciones";

// Funciones sinusoidales y tangente en la forma
//     y = a · f(b · (x − c)) + d ,   f ∈ {sen, cos, tan}
// con a (amplitud), b > 0 (frecuencia angular: cuántos ciclos caben en 2π),
// c (desfase, en múltiplos de π: se mide en el eje x) y d (desplazamiento
// vertical = línea media). Todo se guarda con fracciones exactas y se evalúa
// SOLO cuando hace falta dibujar. Los visuales dibujan muestreando valorOnda()
// y los tests contrastan periodo, amplitud y puntos clave con la fórmula.
//
// Convención de la app: usar la forma FACTORIZADA b(x − c), no la forma bx − k,
// porque así el desfase c se lee directo (con bx − k el desfase es k/b, y
// olvidarse de dividir por b es un error clásico, que las Clases advierten).

export type FuncionOnda = "sen" | "cos" | "tan";

export interface Onda {
  fn: FuncionOnda;
  a: Frac;
  b: Frac; // > 0
  cPi: Frac; // desfase, en múltiplos de π
  d: Frac;
}

export function onda(fn: FuncionOnda, a: number | Frac = 1, b: number | Frac = 1, cPi: number | Frac = 0, d: number | Frac = 0): Onda {
  const f = (v: number | Frac): Frac => (typeof v === "number" ? frac(v) : v);
  const o = { fn, a: f(a), b: f(b), cPi: f(cPi), d: f(d) };
  if (o.b.n <= 0) throw new Error("b debe ser positivo");
  if (o.a.n === 0) throw new Error("a no puede ser 0");
  return o;
}

// Evalúa la función en x (radianes). En una asíntota de la tangente devuelve NaN.
export function valorOnda(o: Onda, x: number): number {
  const u = (aNumero(o.b) * (x - aNumero(o.cPi) * Math.PI));
  const a = aNumero(o.a);
  const d = aNumero(o.d);
  if (o.fn === "sen") return a * Math.sin(u) + d;
  if (o.fn === "cos") return a * Math.cos(u) + d;
  if (Math.abs(Math.cos(u)) < 1e-9) return NaN;
  return a * Math.tan(u) + d;
}

// Periodo como múltiplo de π: sen y cos 2π/b; tan π/b.
export function periodoPi(o: Onda): Frac {
  return divF(o.fn === "tan" ? UNO : frac(2), o.b);
}
export const periodo = (o: Onda): number => aNumero(periodoPi(o)) * Math.PI;

// Frecuencia: ciclos por unidad de x (1/periodo), como fracción de 1/π: b/2π -> (b/2)·(1/π).
export function frecuenciaPorPi(o: Onda): Frac {
  return divF(UNO, periodoPi(o));
}

export const amplitud = (o: Onda): Frac => (o.a.n < 0 ? negF(o.a) : o.a);
export const lineaMedia = (o: Onda): Frac => o.d;
export const maximo = (o: Onda): Frac => sumaF(o.d, amplitud(o));
export const minimo = (o: Onda): Frac => restaF(o.d, amplitud(o));

export interface PuntoOnda {
  xPi: Frac; // x en múltiplos de π
  y: Frac;
  tipo: "inicio" | "maximo" | "minimo" | "medio" | "fin";
}

// Los cinco puntos clave de UN ciclo (empieza en x = c): para a > 0,
//   sen: (c, d) (c+P/4, d+a) (c+P/2, d) (c+3P/4, d−a) (c+P, d)
//   cos: (c, d+a) (c+P/4, d) (c+P/2, d−a) (c+3P/4, d) (c+P, d+a)
// (con a < 0 se invierten máximo y mínimo).
export function puntosClave(o: Onda): PuntoOnda[] {
  if (o.fn === "tan") throw new Error("La tangente no tiene ciclo de 5 puntos");
  const P = periodoPi(o);
  const cuarto = divF(P, frac(4));
  const x = (k: number) => sumaF(o.cPi, mulF(cuarto, frac(k)));
  const arriba = sumaF(o.d, o.a);
  const abajo = restaF(o.d, o.a);
  if (o.fn === "sen") {
    return [
      { xPi: x(0), y: o.d, tipo: "inicio" },
      { xPi: x(1), y: arriba, tipo: o.a.n > 0 ? "maximo" : "minimo" },
      { xPi: x(2), y: o.d, tipo: "medio" },
      { xPi: x(3), y: abajo, tipo: o.a.n > 0 ? "minimo" : "maximo" },
      { xPi: x(4), y: o.d, tipo: "fin" },
    ];
  }
  return [
    { xPi: x(0), y: arriba, tipo: o.a.n > 0 ? "maximo" : "minimo" },
    { xPi: x(1), y: o.d, tipo: "medio" },
    { xPi: x(2), y: abajo, tipo: o.a.n > 0 ? "minimo" : "maximo" },
    { xPi: x(3), y: o.d, tipo: "medio" },
    { xPi: x(4), y: arriba, tipo: o.a.n > 0 ? "maximo" : "minimo" },
  ];
}

// Asíntotas verticales de la tangente dentro de (x0, x1) (ambos en múltiplos de π):
// x = c + π/(2b) + k·π/b.
export function asintotasTan(o: Onda, x0Pi: Frac, x1Pi: Frac): Frac[] {
  if (o.fn !== "tan") throw new Error("Solo la tangente tiene asíntotas");
  const paso = periodoPi(o);
  const primera = sumaF(o.cPi, divF(paso, frac(2)));
  const r: Frac[] = [];
  // k mínimo con primera + k·paso >= x0
  let k = Math.ceil(aNumero(divF(restaF(x0Pi, primera), paso)) - 1e-9);
  for (; ; k++) {
    const x = sumaF(primera, mulF(paso, frac(k)));
    if (aNumero(x) > aNumero(x1Pi) + 1e-9) break;
    r.push(x);
  }
  return r;
}

export interface Muestra {
  x: number;
  y: number;
}

// Muestrea la función en [x0, x1] (múltiplos de π) con n+1 puntos. Los valores
// se redondean a 3 decimales para que el servidor y el navegador dibujen
// exactamente lo mismo (Math.sin/cos difieren en el último bit).
export function muestrear(o: Onda, x0Pi: Frac, x1Pi: Frac, n: number): Muestra[] {
  const x0 = aNumero(x0Pi) * Math.PI;
  const x1 = aNumero(x1Pi) * Math.PI;
  const r: Muestra[] = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    r.push({ x: Math.round(x * 1000) / 1000, y: Math.round(valorOnda(o, x) * 1000) / 1000 });
  }
  return r;
}

// ---------- Formato ----------
export function fracTex(f: Frac): string {
  const signo = f.n < 0 ? "-" : "";
  return f.d === 1 ? `${f.n}` : `${signo}\\frac{${Math.abs(f.n)}}{${f.d}}`;
}

// Múltiplo de π: 1/6 -> \frac{\pi}{6}, 2 -> 2\pi, 0 -> 0, -1/4 -> -\frac{\pi}{4}.
export function multiploPiTex(f: Frac): string {
  if (f.n === 0) return "0";
  const signo = f.n < 0 ? "-" : "";
  const n = Math.abs(f.n);
  const num = n === 1 ? "\\pi" : `${n}\\pi`;
  return f.d === 1 ? `${signo}${num}` : `${signo}\\frac{${num}}{${f.d}}`;
}

export function multiploPiPlano(f: Frac): string {
  if (f.n === 0) return "0";
  const signo = f.n < 0 ? "-" : "";
  const n = Math.abs(f.n);
  const num = n === 1 ? "π" : `${n}π`;
  return f.d === 1 ? `${signo}${num}` : `${signo}${num}/${f.d}`;
}

const NOMBRE_TEX: Record<FuncionOnda, string> = { sen: "\\operatorname{sen}", cos: "\\cos", tan: "\\tan" };

// y = 2\operatorname{sen}\left(3\left(x-\frac{\pi}{6}\right)\right)+1 (sin los $).
export function ecuacionTex(o: Onda): string {
  const bUno = igualF(o.b, UNO);
  const bTex = bUno ? "" : o.b.d === 1 ? `${o.b.n}` : fracTex(o.b);
  let interior: string;
  if (o.cPi.n === 0) {
    interior = `${bTex}x`;
  } else {
    const c = o.cPi.n > 0 ? `x-${multiploPiTex(o.cPi)}` : `x+${multiploPiTex(negF(o.cPi))}`;
    interior = bUno ? c : `${bTex}\\left(${c}\\right)`;
  }
  const negativo = o.a.n < 0;
  const aAbs = negativo ? negF(o.a) : o.a;
  const aTex = igualF(aAbs, UNO) ? "" : fracTex(aAbs);
  const cuerpo = `${negativo ? "-" : ""}${aTex}${NOMBRE_TEX[o.fn]}\\left(${interior}\\right)`;
  const dTex = o.d.n === 0 ? "" : o.d.n > 0 ? `+${fracTex(o.d)}` : `-${fracTex(negF(o.d))}`;
  return `y=${cuerpo}${dTex}`;
}

export function ecuacionPlano(o: Onda): string {
  const bTxt = igualF(o.b, UNO) ? "" : o.b.d === 1 ? `${o.b.n}` : `${o.b.n}/${o.b.d}`;
  const c = o.cPi.n === 0 ? "" : o.cPi.n > 0 ? ` - ${multiploPiPlano(o.cPi)}` : ` + ${multiploPiPlano(negF(o.cPi))}`;
  const interior = bTxt !== "" && c !== "" ? `${bTxt}(x${c})` : `${bTxt}x${c}`;
  const aTxt = igualF(amplitud(o), UNO) ? "" : o.a.d === 1 ? `${Math.abs(o.a.n)}` : `${Math.abs(o.a.n)}/${o.a.d}`;
  const d = o.d.n === 0 ? "" : o.d.n > 0 ? ` + ${o.d.d === 1 ? o.d.n : `${o.d.n}/${o.d.d}`}` : ` - ${o.d.d === 1 ? -o.d.n : `${-o.d.n}/${o.d.d}`}`;
  return `y = ${o.a.n < 0 ? "-" : ""}${aTxt}${o.fn}(${interior})${d}`;
}
