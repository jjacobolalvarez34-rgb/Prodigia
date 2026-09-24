// Modo "círculo" de Trigonometría (opción múltiple). Los valores exactos NO
// están escritos a mano: salen de src/lib/trigonometria/exactos.ts (anillo
// Q(√2, √3), contrastado con Math.sin/Math.cos en los tests) y los ángulos de
// angulos.ts. Los distractores representan errores reales: el signo del
// cuadrante equivocado, confundir sen con cos, usar el valor del ángulo en vez
// del de su referencia, convertir con 360 en vez de 180.

import { frac, mulF } from "@/lib/trigonometria/fracciones";
import { radianesTex, referenciaGrados } from "@/lib/trigonometria/angulos";
import { OPERADOR_TEX, funcionExacta, negE } from "@/lib/trigonometria/exactos";
import { negRadical, radicalDe, cosYTanDesdeSeno, type Radical } from "@/lib/trigonometria/radicales";
import { azar, elegir, m } from "./trigonometriaBase";
import { opcionDeExacto, opcionDeGrados, opcionDePi, opcionDeRadical, resultadoOpciones, type Opcion } from "./trigonometriaOpciones";
import type { ProblemaTrigonometriaOpciones } from "./trigonometriaTipos";

type Fn = "sen" | "cos" | "tan";

const resultado = (enunciado: string, correcta: Opcion, preferidos: Opcion[], pool: Opcion[]): ProblemaTrigonometriaOpciones =>
  resultadoOpciones("circulo", enunciado, correcta, preferidos, pool);

// Los ángulos "de tabla" de una vuelta: 30°, 45°, 60° y los ejes.
export const ANGULOS_TABLA = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
const EJES = [0, 90, 180, 270];
const FUNCIONES: Fn[] = ["sen", "cos", "tan"];

const anguloTex = (g: number, enGrados: boolean): string => (enGrados ? `${g}^{\\circ}` : radianesTex(g));

const ACLARA_INDEFINIDO = " Si la función no está definida, elige «indefinido».";

// "¿Cuánto vale fn(g)?" con distractores de errores típicos.
function preguntaValor(fn: Fn, g: number, enGrados: boolean, aclaracion = ""): ProblemaTrigonometriaOpciones {
  const correcta = funcionExacta(fn, g);
  const ref = referenciaGrados(g);
  const pref: Opcion[] = [];
  if (correcta !== null) pref.push(opcionDeExacto(negE(correcta))); // signo equivocado
  for (const otra of FUNCIONES.filter((f) => f !== fn)) pref.push(opcionDeExacto(funcionExacta(otra, g))); // sen por cos
  for (const f of FUNCIONES) pref.push(opcionDeExacto(funcionExacta(f, ref))); // valor de la referencia
  const pool: Opcion[] = [];
  for (const a of ANGULOS_TABLA) {
    const v = funcionExacta(fn, a);
    pool.push(opcionDeExacto(v));
    if (v !== null) pool.push(opcionDeExacto(negE(v)));
  }
  return resultado(
    `¿Cuánto vale ${m(`${OPERADOR_TEX[fn]}(${anguloTex(g, enGrados)})`)}? Da el valor exacto, no un decimal.${aclaracion}`,
    opcionDeExacto(correcta),
    pref,
    pool
  );
}

// ---------- q1-exactos ----------
export function generarQ1Exactos(dif: number): ProblemaTrigonometriaOpciones {
  // Nivel 1: los cinco ángulos del primer cuadrante en grados; nivel 2 suma radianes; nivel 3, aclaración de «indefinido».
  let g: number;
  let fn: Fn;
  do {
    g = elegir([0, 30, 45, 60, 90]);
    fn = elegir(FUNCIONES);
  } while (fn === "tan" && g === 90 && dif === 0);
  const enGrados = dif === 0 ? true : azar() < 0.5;
  return preguntaValor(fn, g, enGrados, dif >= 1 && fn === "tan" ? ACLARA_INDEFINIDO : "");
}

// ---------- conversion ----------
const CONVERSION_POR_NIVEL: number[][] = [
  [30, 45, 60, 90, 120, 135, 150, 180],
  [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360],
  [15, 75, 105, 165, 195, 255, 285, 345, 210, 225, 240, 300, 315, 330],
  [-30, -45, -60, -90, -135, -180, -270, 390, 405, 420, 450, 540],
];
const POOL_CONVERSION = CONVERSION_POR_NIVEL[1];

export function generarConversion(dif: number): ProblemaTrigonometriaOpciones {
  const g = elegir(CONVERSION_POR_NIVEL[Math.min(dif, CONVERSION_POR_NIVEL.length - 1)]);
  const f = frac(g, 180); // el ángulo como fracción de π
  const invertible = f.n !== 0 && Math.abs(f.n) !== 1;
  if (azar() < 0.5) {
    // Errores: dividir por 360 (la mitad), multiplicar por 2, invertir la fracción, correrse 30°.
    const pref = [opcionDePi(mulF(f, frac(1, 2))), opcionDePi(mulF(f, frac(2))), opcionDePi(frac(g + 30, 180)), opcionDePi(frac(g - 30, 180))];
    if (invertible) pref.push(opcionDePi(frac(f.d, f.n)));
    return resultado(`Convierte ${m(`${g}^{\\circ}`)} a radianes.`, opcionDePi(f), pref, POOL_CONVERSION.map((x) => opcionDePi(frac(x, 180))));
  }
  const pref = [opcionDeGrados(g / 2), opcionDeGrados(g * 2), opcionDeGrados(g + 30), opcionDeGrados(g - 30)];
  if (invertible && Number.isInteger((180 * f.d) / f.n)) pref.push(opcionDeGrados((180 * f.d) / f.n));
  return resultado(`¿Cuántos grados son ${m(radianesTex(g))} radianes?`, opcionDeGrados(g), pref, POOL_CONVERSION.map(opcionDeGrados));
}

// ---------- ref-q2q3 ----------
const SEGUNDO = [120, 135, 150];
const TERCERO = [210, 225, 240];

export function generarRefQ2Q3(dif: number): ProblemaTrigonometriaOpciones {
  const g = elegir(dif === 0 ? SEGUNDO : [...SEGUNDO, ...TERCERO]);
  if (dif >= 1 && azar() < 0.3) {
    const ref = referenciaGrados(g);
    // Errores: quedarse con el ángulo, restar 90°, usar 180° − ref, o el suplemento del tercer cuadrante.
    const pref = [opcionDeGrados(180 - ref), opcionDeGrados(g), opcionDeGrados(g - 90), opcionDeGrados(360 - g), opcionDeGrados(Math.abs(g - 180 - 90))];
    return resultado(
      `¿Cuál es el ángulo de referencia de ${m(`${g}^{\\circ}`)}? (El ángulo agudo que forma su lado terminal con el eje horizontal.)`,
      opcionDeGrados(ref),
      pref,
      [30, 45, 60, 120, 135, 150, 210, 225, 240].map(opcionDeGrados)
    );
  }
  const enGrados = dif < 2 ? true : azar() < 0.4;
  return preguntaValor(elegir(FUNCIONES), g, enGrados);
}

// ---------- todos-cuadrantes ----------
export function generarTodosCuadrantes(dif: number): ProblemaTrigonometriaOpciones {
  const g = elegir(dif === 0 ? ANGULOS_TABLA.filter((x) => !EJES.includes(x)) : ANGULOS_TABLA);
  const fn = elegir(FUNCIONES);
  const enGrados = dif === 0 ? azar() < 0.6 : dif === 1 ? azar() < 0.5 : azar() < 0.3;
  return preguntaValor(fn, g, enGrados, fn === "tan" && dif >= 1 ? ACLARA_INDEFINIDO : "");
}

// ---------- coterminales ----------
export function generarCoterminales(dif: number): ProblemaTrigonometriaOpciones {
  const enGrados = dif === 0 ? true : azar() < 0.4;
  const base = elegir(ANGULOS_TABLA.filter((x) => (dif === 0 ? !EJES.includes(x) : true)));
  const k = enGrados ? elegir([-2, -1, 1, 2]) : elegir([-1, 1]);
  const fn = elegir(FUNCIONES);
  return preguntaValor(fn, base + 360 * k, enGrados, fn === "tan" ? ACLARA_INDEFINIDO : "");
}

// ---------- dado-valor: dado sen θ (o cos θ) y el cuadrante, hallar otra razón ----------
const NOMBRE_CUADRANTE = { 1: "primer", 2: "segundo", 3: "tercer", 4: "cuarto" } as const;
const PARES_CON_RAIZ_EXACTA: [number, number][] = [[3, 5], [4, 5], [5, 13], [12, 13], [8, 17], [15, 17], [7, 25], [24, 25]];
const PARES_CON_RADICAL: [number, number][] = [[1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [2, 7], [3, 7]];

// Signo de sen y de cos en cada cuadrante.
const SIGNOS: Record<1 | 2 | 3 | 4, { sen: 1 | -1; cos: 1 | -1 }> = {
  1: { sen: 1, cos: 1 },
  2: { sen: 1, cos: -1 },
  3: { sen: -1, cos: -1 },
  4: { sen: -1, cos: 1 },
};

const conSigno = (r: Radical, s: 1 | -1): Radical => ({ ...r, signo: s });

export function generarDadoValor(dif: number): ProblemaTrigonometriaOpciones {
  const [p, q] = elegir(dif === 0 ? PARES_CON_RAIZ_EXACTA : PARES_CON_RADICAL);
  const cuadrante = elegir<1 | 2 | 3 | 4>([2, 2, 3, 3, 4, 4, 1]);
  const s = SIGNOS[cuadrante];
  const dadoEsSeno = azar() < 0.5;
  const pideTan = azar() < 0.4;
  const N = q * q - p * p;
  const otroAbs = radicalDe(N, q); // el otro valor entre sen y cos: √N/q
  // |tan θ|: sen dado -> p/√N = p√N/N; cos dado -> √N/p.
  const tanAbs = dadoEsSeno ? cosYTanDesdeSeno(p, q).tan : radicalDe(N, p);
  const signoTan = (s.sen * s.cos) as 1 | -1;
  const signoDado = dadoEsSeno ? s.sen : s.cos;
  const signoOtro = dadoEsSeno ? s.cos : s.sen;
  const correcta = pideTan ? conSigno(tanAbs, signoTan) : conSigno(otroAbs, signoOtro);

  // Errores típicos: el signo contrario, repetir el valor dado, confundir la tangente con la otra razón, el recíproco.
  const pref: Opcion[] = [
    opcionDeRadical(negRadical(correcta)),
    opcionDeRadical({ signo: signoDado, coef: frac(p, q), m: 1 }),
    opcionDeRadical(pideTan ? conSigno(otroAbs, signoTan) : conSigno(tanAbs, signoOtro)),
    opcionDeRadical(pideTan ? conSigno(otroAbs, (signoTan * -1) as 1 | -1) : conSigno(tanAbs, (signoOtro * -1) as 1 | -1)),
  ];
  const pool: Opcion[] = [opcionDeRadical(radicalDe(N, q)), opcionDeRadical({ signo: 1, coef: frac(q, p), m: 1 })];

  const dado = dadoEsSeno ? "sen" : "cos";
  const pedida: Fn = pideTan ? "tan" : dadoEsSeno ? "cos" : "sen";
  const dadoTex = `${OPERADOR_TEX[dado]}(\\theta)=${signoDado < 0 ? "-" : ""}\\frac{${p}}{${q}}`;
  return resultado(
    `Si ${m(dadoTex)} y ${m("\\theta")} está en el ${NOMBRE_CUADRANTE[cuadrante]} cuadrante, ¿cuánto vale ${m(`${OPERADOR_TEX[pedida]}(\\theta)`)}? Da el valor exacto.`,
    opcionDeRadical(correcta),
    pref,
    pool
  );
}
