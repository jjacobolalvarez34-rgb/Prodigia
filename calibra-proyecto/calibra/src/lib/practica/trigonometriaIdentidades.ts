// Modo "identidades" de Trigonometría (opción múltiple). Las identidades se
// resuelven por sustitución con valores exactos (anillo Q(√2, √3) de
// exactos.ts) y las expresiones equivalentes salen de EQUIVALENCIAS
// (identidades.ts), donde un test comprueba numéricamente que la correcta
// coincide en decenas de ángulos y que cada distractor falla en alguno. No hay
// ningún parser simbólico: cada tipo de problema tiene una única respuesta
// exacta sin ambigüedad.

import { frac } from "@/lib/trigonometria/fracciones";
import {
  EXACTO_UNO,
  OPERADOR_TEX,
  cosExacto,
  cotExacto,
  divE,
  exacto,
  funcionExacta,
  mulE,
  negE,
  restaE,
  senExacto,
  sumaE,
  tanExacto,
  texE,
  type Exacto,
  type FuncionTrig,
} from "@/lib/trigonometria/exactos";
import { EQUIVALENCIAS } from "@/lib/trigonometria/identidades";
import type { Radical } from "@/lib/trigonometria/radicales";
import { azar, elegir, m } from "./trigonometriaBase";
import { opcionDeExacto, opcionDeGrados, opcionDeRadical, opcionDeTex, resultadoOpciones, type Opcion } from "./trigonometriaOpciones";
import type { ProblemaTrigonometriaOpciones } from "./trigonometriaTipos";

const resultado = (enunciado: string, correcta: Opcion, preferidos: Opcion[], pool: Opcion[]): ProblemaTrigonometriaOpciones =>
  resultadoOpciones("identidades", enunciado, correcta, preferidos, pool);

// Fracción n/d (con el signo delante, nunca en el numerador: "-\frac{24}{7}").
const fr = (n: number, d: number): Radical => {
  const f = frac(n, d);
  return { signo: f.n < 0 ? -1 : 1, coef: frac(Math.abs(f.n), f.d), m: 1 };
};
const opFr = (n: number, d: number): Opcion => opcionDeRadical(fr(n, d));
const op = (x: Exacto | null): Opcion => opcionDeExacto(x);
const SEN = "\\operatorname{sen}";
const tex = (fn: FuncionTrig, arg: string): string => `${OPERADOR_TEX[fn]}(${arg})`;

// Ternas para valores racionales (sen = 3/5 y cos = 4/5...).
const TERNAS: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];

const Q1_NOTABLES = [30, 45, 60];

// Valores de sen/cos de tabla del primer cuadrante, como opciones de relleno.
const POOL_Q1: Opcion[] = [0, 30, 45, 60, 90].flatMap((g) => [op(senExacto(g)), op(cosExacto(g))]);
const POOL_TAN: Opcion[] = [30, 45, 60].flatMap((g) => [op(tanExacto(g)), op(cotExacto(g))]);

// ---------- pitagorica ----------
export function generarPitagorica(dif: number): ProblemaTrigonometriaOpciones {
  if (dif === 0) {
    const g = elegir(Q1_NOTABLES);
    const darSeno = azar() < 0.5;
    const dado = darSeno ? senExacto(g) : cosExacto(g);
    const buscado = darSeno ? cosExacto(g) : senExacto(g);
    const nombreDado = darSeno ? "sen" : "cos";
    const nombreBuscado = darSeno ? "cos" : "sen";
    // errores: 1 − dado (usar suma en vez de suma de cuadrados), el dado mismo, el cuadrado sin la raíz
    const pref = [op(restaE(EXACTO_UNO, dado)), op(dado), op(mulE(buscado, buscado))];
    return resultado(
      `Si ${m(`${tex(nombreDado, "\\theta")}=${texE(dado)}`)} y ${m("\\theta")} está en el primer cuadrante, ¿cuánto vale ${m(tex(nombreBuscado, "\\theta"))}? Usa ${m(`${SEN}^{2}(\\theta)+\\cos^{2}(\\theta)=1`)}.`,
      op(buscado),
      pref,
      POOL_Q1
    );
  }
  const [x, y, z] = elegir(TERNAS);
  const [a, b] = azar() < 0.5 ? [x, y] : [y, x];
  if (dif === 1) {
    // sen θ = a/z (primer cuadrante) -> cos θ = b/z
    const darSeno = azar() < 0.5;
    const [dado, buscado] = darSeno ? [a, b] : [b, a];
    const nombreDado = darSeno ? "sen" : "cos";
    const nombreBuscado = darSeno ? "cos" : "sen";
    const pref = [opFr(z - dado, z), opFr(dado, z), opFr(buscado * buscado, z * z), opFr(z, buscado), opFr(dado, buscado)];
    return resultado(
      `Si ${m(`${tex(nombreDado, "\\theta")}=\\frac{${dado}}{${z}}`)} y ${m("\\theta")} es un ángulo agudo, ¿cuánto vale ${m(tex(nombreBuscado, "\\theta"))}?`,
      opFr(buscado, z),
      pref,
      [opFr(dado, z), opFr(buscado, z), opFr(a, b), opFr(b, a)]
    );
  }
  if (dif === 2) {
    // 1 + tan² = sec²  /  1 + cot² = cosec²  (ángulo agudo, ternas)
    const usaTan = azar() < 0.5;
    if (usaTan) {
      // tan θ = a/b -> sec θ = z/b
      const pref = [opFr(a + b, b), opFr(a * a + b * b, b * b), opFr(b, z), opFr(a, z)];
      return resultado(
        `Si ${m(`\\tan(\\theta)=\\frac{${a}}{${b}}`)} y ${m("\\theta")} es un ángulo agudo, ¿cuánto vale ${m("\\sec(\\theta)")}? Usa ${m("1+\\tan^{2}(\\theta)=\\sec^{2}(\\theta)")}.`,
        opFr(z, b),
        pref,
        [opFr(a, b), opFr(z, a), opFr(b, a)]
      );
    }
    const pref = [opFr(a + b, a), opFr(a * a + b * b, a * a), opFr(a, z), opFr(b, z)];
    return resultado(
      `Si ${m(`\\cot(\\theta)=\\frac{${b}}{${a}}`)} y ${m("\\theta")} es un ángulo agudo, ¿cuánto vale ${m(`${OPERADOR_TEX.cosec}(\\theta)`)}? Usa ${m(`1+\\cot^{2}(\\theta)=${OPERADOR_TEX.cosec}^{2}(\\theta)`)}.`,
      opFr(z, a),
      pref,
      [opFr(b, a), opFr(z, b), opFr(a, b)]
    );
  }
  // dif >= 3: sec θ o cosec θ con signo de cuadrante y pedir tan/cot
  const cuadrante = elegir<2 | 3 | 4>([2, 3, 4]);
  // tan < 0 en 2 y 4, > 0 en 3; sec < 0 en 2 y 3, > 0 en 4.
  const signoSec = cuadrante === 4 ? 1 : -1;
  const signoTan = cuadrante === 3 ? 1 : -1;
  const nombre = { 2: "segundo", 3: "tercer", 4: "cuarto" }[cuadrante];
  const correcta = fr(signoTan * a, b); // |tan| = a/b con sec = ±z/b
  const pref = [opFr(-signoTan * a, b), opFr(signoTan * b, a), opFr(signoSec * z, b), opFr(-signoTan * b, a)];
  return resultado(
    `Si ${m(`\\sec(\\theta)=${signoSec < 0 ? "-" : ""}\\frac{${z}}{${b}}`)} y ${m("\\theta")} está en el ${nombre} cuadrante, ¿cuánto vale ${m("\\tan(\\theta)")}? Usa ${m("1+\\tan^{2}(\\theta)=\\sec^{2}(\\theta)")} y el signo del cuadrante.`,
    opcionDeRadical(correcta),
    pref,
    [opFr(a, z), opFr(b, z), opFr(a, b)]
  );
}

// ---------- complementarios ----------
export function generarComplementarios(dif: number): ProblemaTrigonometriaOpciones {
  if (dif <= 1) {
    const fn = dif === 0 ? "sen" : elegir<"sen" | "cos" | "tan">(["sen", "cos", "tan"]);
    const g = elegir(Q1_NOTABLES);
    const cofuncion = { sen: "cos", cos: "sen", tan: "cot" }[fn] as FuncionTrig;
    const correcta = funcionExacta(cofuncion, g);
    const mismo = funcionExacta(fn, g);
    const pref = [op(mismo), op(mismo === null ? null : negE(mismo))];
    const idTex = { sen: `${SEN}(90^{\\circ}-x)=\\cos(x)`, cos: `\\cos(90^{\\circ}-x)=${SEN}(x)`, tan: "\\tan(90^{\\circ}-x)=\\cot(x)" }[fn];
    const ayuda = dif === 0 ? ` Usa ${m(idTex)}.` : "";
    return resultado(`¿Cuánto vale ${m(`${tex(fn, `90^{\\circ}-${g}^{\\circ}`)}`)}?${ayuda}`, op(correcta), pref, POOL_Q1.concat(POOL_TAN));
  }
  // dif >= 2: ¿para qué ángulo θ se cumple fn(a°) = cofn(θ)?
  const a = elegir([10, 15, 20, 25, 35, 40, 55, 65, 70, 75]);
  const fn = elegir<"sen" | "cos" | "tan">(["sen", "cos", "tan"]);
  const cof = { sen: "cos", cos: "sen", tan: "cot" }[fn] as FuncionTrig;
  const pref = [opcionDeGrados(a), opcionDeGrados(180 - a), opcionDeGrados(90 + a), opcionDeGrados(a + 5)];
  return resultado(
    `Si ${m(`${tex(fn, `${a}^{\\circ}`)}=${tex(cof, "\\theta")}`)} y ${m("\\theta")} es un ángulo agudo, ¿cuánto mide ${m("\\theta")}?`,
    opcionDeGrados(90 - a),
    pref,
    [15, 20, 25, 35, 40, 50, 55, 65, 70, 75].map(opcionDeGrados)
  );
}

// ---------- cociente ----------
export function generarCociente(dif: number): ProblemaTrigonometriaOpciones {
  if (dif === 0) {
    const g = elegir(Q1_NOTABLES);
    const s = senExacto(g);
    const c = cosExacto(g);
    const pref = [op(divE(c, s)), op(mulE(s, c)), op(sumaE(s, c)), op(s)];
    return resultado(
      `Si ${m(`${SEN}(\\theta)=${texE(s)}`)} y ${m(`\\cos(\\theta)=${texE(c)}`)}, ¿cuánto vale ${m("\\tan(\\theta)")}? Usa ${m(`\\tan(\\theta)=\\dfrac{${SEN}(\\theta)}{\\cos(\\theta)}`)}.`,
      op(tanExacto(g)),
      pref,
      POOL_TAN
    );
  }
  const [x, y, z] = elegir(TERNAS);
  const [a, b] = azar() < 0.5 ? [x, y] : [y, x];
  if (dif === 1) {
    const pref = [opFr(b, a), opFr(a * b, z * z), opFr(a + b, z), opFr(a, z)];
    return resultado(
      `Si ${m(`${SEN}(\\theta)=\\frac{${a}}{${z}}`)} y ${m(`\\cos(\\theta)=\\frac{${b}}{${z}}`)}, ¿cuánto vale ${m("\\tan(\\theta)")}?`,
      opFr(a, b),
      pref,
      [opFr(a, z), opFr(b, z), opFr(z, a), opFr(z, b)]
    );
  }
  const pref = [opFr(a, b), opFr(a * b, z * z), opFr(a + b, z), opFr(b, z)];
  return resultado(
    `Si ${m(`${SEN}(\\theta)=\\frac{${a}}{${z}}`)} y ${m(`\\cos(\\theta)=\\frac{${b}}{${z}}`)}, ¿cuánto vale ${m("\\cot(\\theta)")}? Usa ${m(`\\cot(\\theta)=\\dfrac{\\cos(\\theta)}{${SEN}(\\theta)}`)}.`,
    opFr(b, a),
    pref,
    [opFr(a, z), opFr(b, z), opFr(z, a), opFr(z, b)]
  );
}

// ---------- reciprocas-id ----------
type FnRecip = "cosec" | "sec" | "cot";
const RECIP_FACIL: [FnRecip, number][] = [["cosec", 30], ["sec", 60], ["cot", 45], ["cosec", 90], ["sec", 0]];
const RECIP_RADICALES: [FnRecip, number][] = (["cosec", "sec", "cot"] as FnRecip[]).flatMap((f) => [30, 45, 60].map((g) => [f, g] as [FnRecip, number])).filter(([f, g]) => !RECIP_FACIL.some(([f2, g2]) => f === f2 && g === g2));
const RECIP_CUADRANTES: [FnRecip, number][] = (["cosec", "sec", "cot"] as FnRecip[]).flatMap((f) => [120, 135, 150, 210, 225, 240, 300, 315, 330].map((g) => [f, g] as [FnRecip, number]));

function elegirRecip(dif: number): [FnRecip, number] {
  return elegir(dif === 0 ? RECIP_FACIL : dif === 1 ? RECIP_RADICALES : RECIP_CUADRANTES);
}
export function generarReciprocasId(dif: number): ProblemaTrigonometriaOpciones {
  const [fn, g] = elegirRecip(dif);
  const base = { cosec: "sen", sec: "cos", cot: "tan" }[fn] as FuncionTrig;
  const correcta = funcionExacta(fn, g);
  const otraRecip = { cosec: "sec", sec: "cosec", cot: "tan" }[fn] as FuncionTrig;
  const pref = [op(funcionExacta(base, g)), op(funcionExacta(otraRecip, g)), op(correcta === null ? null : negE(correcta))];
  const idTex = { cosec: `${OPERADOR_TEX.cosec}(x)=\\dfrac{1}{${SEN}(x)}`, sec: "\\sec(x)=\\dfrac{1}{\\cos(x)}", cot: "\\cot(x)=\\dfrac{1}{\\tan(x)}" }[fn];
  const ayuda = dif === 0 ? ` Usa ${m(idTex)}.` : "";
  const pool = [30, 45, 60].flatMap((x) => [op(funcionExacta("cosec", x)), op(funcionExacta("sec", x)), op(funcionExacta("cot", x))]);
  return resultado(`¿Cuánto vale ${m(tex(fn, `${g}^{\\circ}`))}?${ayuda}`, op(correcta), pref, pool);
}

// ---------- doble: con θ notable ----------
export function generarDoble(dif: number): ProblemaTrigonometriaOpciones {
  const fn = elegir<"sen" | "cos" | "tan">(dif <= 1 ? ["sen", "cos"] : ["sen", "cos", "tan"]);
  // Los ángulos de 15° y 75° piden calcular sen y cos de θ con la fórmula de la diferencia (más difícil).
  const angulos = dif === 0 ? Q1_NOTABLES : [15, 30, 45, 60, 75];
  const g = elegir(fn === "tan" ? angulos.filter((x) => x !== 45) : angulos);
  const s = senExacto(g);
  const c = cosExacto(g);
  const t = fn === "tan" ? tanExacto(g)! : EXACTO_UNO;
  const dos = exacto(2);
  let correcta: Exacto;
  let pref: Opcion[];
  let ayuda: string;
  if (fn === "sen") {
    correcta = mulE(dos, mulE(s, c));
    pref = [op(mulE(dos, s)), op(mulE(s, c)), op(mulE(s, s)), op(mulE(dos, c))];
    ayuda = `${SEN}(2\\theta)=2\\,${SEN}(\\theta)\\cos(\\theta)`;
  } else if (fn === "cos") {
    correcta = restaE(mulE(c, c), mulE(s, s));
    pref = [op(mulE(dos, c)), op(sumaE(mulE(c, c), mulE(s, s))), op(mulE(c, c)), op(mulE(dos, mulE(s, c)))];
    ayuda = `\\cos(2\\theta)=\\cos^{2}(\\theta)-${SEN}^{2}(\\theta)`;
  } else {
    // tan 2θ = 2 tan θ / (1 − tan² θ); errores: olvidar el denominador y usar (1 + tan² θ)
    correcta = divE(mulE(dos, t), restaE(EXACTO_UNO, mulE(t, t)));
    pref = [op(mulE(dos, t)), op(divE(mulE(dos, t), sumaE(EXACTO_UNO, mulE(t, t)))), op(mulE(t, t)), op(divE(t, restaE(EXACTO_UNO, mulE(t, t))))];
    ayuda = `\\tan(2\\theta)=\\dfrac{2\\tan(\\theta)}{1-\\tan^{2}(\\theta)}`;
  }
  return resultado(`Si ${m(`\\theta=${g}^{\\circ}`)}, ¿cuánto vale ${m(tex(fn, "2\\theta"))}? Usa ${m(ayuda)}.`, op(correcta), pref, POOL_Q1.concat(POOL_TAN));
}

// ---------- doble-dado: dado sen θ = a/z (θ agudo) ----------
export function generarDobleDado(dif: number): ProblemaTrigonometriaOpciones {
  const [x, y, z] = elegir(TERNAS.slice(0, 4));
  const [a, b] = azar() < 0.5 ? [x, y] : [y, x];
  const fn = elegir<"sen" | "cos" | "tan">(dif <= 1 ? ["sen", "cos"] : ["sen", "cos", "tan"]);
  const z2 = z * z;
  let correcta: Opcion;
  let pref: Opcion[];
  if (fn === "sen") {
    correcta = opFr(2 * a * b, z2);
    pref = [opFr(2 * a, z), opFr(a * b, z2), opFr(a * a, z2), opFr(a * b, z)];
  } else if (fn === "cos") {
    correcta = opFr(b * b - a * a, z2);
    pref = [opFr(a * a - b * b, z2), opFr(2 * b, z), opFr(b * b, z2), opFr(a * a + b * b, z2)];
  } else {
    correcta = opFr(2 * a * b, b * b - a * a);
    pref = [opFr(2 * a, b), opFr(2 * a * b, z2), opFr(b * b - a * a, 2 * a * b), opFr(a * a, b * b)];
  }
  return resultado(
    `Si ${m(`${SEN}(\\theta)=\\frac{${a}}{${z}}`)} y ${m("\\theta")} es un ángulo agudo, ¿cuánto vale ${m(tex(fn, "2\\theta"))}?`,
    correcta,
    pref,
    [opFr(a, z), opFr(b, z), opFr(2 * a * b, z2), opFr(b * b - a * a, z2)]
  );
}

// ---------- suma-diferencia ----------
const PARES_SUMA: [number, number][] = [[45, 30], [30, 45], [60, 45], [45, 60], [60, 30], [30, 60]];

export function generarSumaDiferencia(dif: number): ProblemaTrigonometriaOpciones {
  if (dif >= 2) return sumaConTernas();
  const fn = dif === 0 ? elegir<"sen" | "cos">(["sen", "cos"]) : elegir<"sen" | "cos" | "tan">(["sen", "cos", "tan"]);
  // Nunca se suma 90° (tan 90° no existe y la cuenta sería trivial), y solo se resta cuando A > B (con A + B ≠ 90°: 1 − tan A · tan B sería 0).
  const candidatos = PARES_SUMA.flatMap(([p, q]) => {
    const r: [number, number, boolean][] = [];
    if (p + q !== 90) r.push([p, q, true]);
    if (p > q && p + q !== 90) r.push([p, q, false]);
    return r;
  });
  const [A, B, suma] = elegir(candidatos);
  const total = suma ? A + B : A - B;
  const sA = senExacto(A);
  const cA = cosExacto(A);
  const sB = senExacto(B);
  const cB = cosExacto(B);
  const tA = tanExacto(A)!;
  const tB = tanExacto(B)!;
  // Errores típicos por función: "distribuir" la función, cambiar el signo del medio, mezclar sen y cos.
  let pref: Opcion[];
  if (fn === "sen") {
    pref = [
      op(suma ? sumaE(sA, sB) : restaE(sA, sB)),
      op(suma ? restaE(mulE(sA, cB), mulE(cA, sB)) : sumaE(mulE(sA, cB), mulE(cA, sB))),
      op(suma ? sumaE(mulE(cA, cB), mulE(sA, sB)) : restaE(mulE(cA, cB), mulE(sA, sB))),
      op(mulE(sA, sB)),
    ];
  } else if (fn === "cos") {
    pref = [
      op(suma ? sumaE(cA, cB) : restaE(cA, cB)),
      op(suma ? sumaE(mulE(cA, cB), mulE(sA, sB)) : restaE(mulE(cA, cB), mulE(sA, sB))),
      op(suma ? sumaE(mulE(sA, cB), mulE(cA, sB)) : restaE(mulE(sA, cB), mulE(cA, sB))),
      op(mulE(cA, cB)),
    ];
  } else {
    pref = [
      op(suma ? sumaE(tA, tB) : restaE(tA, tB)),
      op(divE(suma ? sumaE(tA, tB) : restaE(tA, tB), suma ? sumaE(EXACTO_UNO, mulE(tA, tB)) : restaE(EXACTO_UNO, mulE(tA, tB)))),
      op(mulE(tA, tB)),
    ];
  }
  const idTex = fn === "sen" ? `${SEN}(a${suma ? "+" : "-"}b)` : fn === "cos" ? `\\cos(a${suma ? "+" : "-"}b)` : `\\tan(a${suma ? "+" : "-"}b)`;
  const pool = [15, 75, 105].flatMap((g) => [op(senExacto(g)), op(cosExacto(g))]).concat(POOL_TAN);
  return resultado(
    `Usa ${m(`${tex(fn, `${A}^{\\circ}${suma ? "+" : "-"}${B}^{\\circ}`)}`)} (es decir, ${m(idTex)} con ${m(`a=${A}^{\\circ}`)} y ${m(`b=${B}^{\\circ}`)}) para calcular el valor exacto de ${m(tex(fn, `${total}^{\\circ}`))}.`,
    op(funcionExacta(fn, total)),
    pref,
    pool
  );
}

// A y B agudos con sen A = a/z y cos B = c/w (ternas): sen(A + B) o cos(A + B).
function sumaConTernas(): ProblemaTrigonometriaOpciones {
  const [x, y, z] = TERNAS[0]; // 3-4-5
  const [u, v, w] = TERNAS[1]; // 5-12-13
  // A: sen A = x/z, cos A = y/z ; B: sen B = u/w, cos B = v/w
  const sinRaiz = azar() < 0.5;
  if (sinRaiz) {
    // sen(A + B) = (3/5)(12/13) + (4/5)(5/13) = 56/65
    const num = x * v + y * u;
    return resultado(
      `Sean ${m("A")} y ${m("B")} ángulos agudos con ${m(`${SEN}(A)=\\frac{${x}}{${z}}`)} y ${m(`\\cos(B)=\\frac{${v}}{${w}}`)}. ¿Cuánto vale ${m(`${SEN}(A+B)`)}?`,
      opFr(num, z * w),
      [opFr(x * v - y * u, z * w), opFr(x * v, z * w), opFr(x * u + y * v, z * w), opFr(x + u, z + w)],
      [opFr(y * v - x * u, z * w), opFr(x * y, z * w)]
    );
  }
  // cos(A + B) = (4/5)(12/13) − (3/5)(5/13) = 33/65
  const num = y * v - x * u;
  return resultado(
    `Sean ${m("A")} y ${m("B")} ángulos agudos con ${m(`${SEN}(A)=\\frac{${x}}{${z}}`)} y ${m(`\\cos(B)=\\frac{${v}}{${w}}`)}. ¿Cuánto vale ${m("\\cos(A+B)")}?`,
    opFr(num, z * w),
    [opFr(y * v + x * u, z * w), opFr(y * v, z * w), opFr(x * v + y * u, z * w), opFr(y + v, z + w)],
    [opFr(x * v - y * u, z * w), opFr(x * u, z * w)]
  );
}

// ---------- equivalente / equivalente-doble ----------
function preguntaEquivalente(niveles: number[]): ProblemaTrigonometriaOpciones {
  const q = elegir(EQUIVALENCIAS.filter((e) => niveles.includes(e.nivel)));
  return resultado(
    `¿Cuál de estas expresiones es equivalente a ${m(q.expr.tex)}? (Vale para todo ${m("x")} donde ambas están definidas.)`,
    opcionDeTex(q.correcta.tex),
    q.incorrectas.map((e) => opcionDeTex(e.tex)),
    []
  );
}

export const generarEquivalente = (dif: number): ProblemaTrigonometriaOpciones => preguntaEquivalente(dif === 0 ? [0] : [0, 1]);
export const generarEquivalenteDoble = (dif: number): ProblemaTrigonometriaOpciones => preguntaEquivalente(dif === 0 ? [1, 2] : [2]);
