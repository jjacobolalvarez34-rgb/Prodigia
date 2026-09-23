import { DATOS_ELEMENTOS } from "./datos";

// Utilidades para fórmulas químicas escritas en texto plano ("Ca(OH)2",
// "Al2(SO4)3", "NH4NO3"): contar átomos, calcular masa molar y dibujarlas
// con KaTeX. Las lecciones escriben SIEMPRE las fórmulas a través de
// `f()`/`ion()` (nunca LaTeX a mano), así que el contenido y estos
// cálculos comparten una sola representación.
//
// Convención KaTeX del proyecto para contenido de lecciones (no hay
// mhchem): `$\mathrm{Al_2O_3}$`, `$\mathrm{Ca(OH)_2}$`,
// `$\mathrm{SO_4^{2-}}$`, `$\mathrm{Fe^{3+}}$`.

export type Conteo = Record<string, number>;

// Descompone una fórmula en {símbolo: cantidad}. Admite paréntesis
// anidados con su subíndice. Lanza si la fórmula está mal formada (así un
// typo en el contenido rompe el test en vez de mostrarse mal).
export function contarAtomos(formula: string): Conteo {
  let i = 0;
  function numero(): number {
    let s = "";
    while (i < formula.length && /\d/.test(formula[i])) s += formula[i++];
    return s === "" ? 1 : parseInt(s, 10);
  }
  function grupo(): Conteo {
    const total: Conteo = {};
    while (i < formula.length) {
      const c = formula[i];
      if (c === "(") {
        i++;
        const interno = grupo();
        if (formula[i] !== ")") throw new Error(`Fórmula mal formada (falta ")"): ${formula}`);
        i++;
        const m = numero();
        for (const [k, v] of Object.entries(interno)) total[k] = (total[k] ?? 0) + v * m;
      } else if (c === ")") {
        return total;
      } else if (/[A-Z]/.test(c)) {
        let sim = c;
        i++;
        while (i < formula.length && /[a-z]/.test(formula[i])) sim += formula[i++];
        const m = numero();
        total[sim] = (total[sim] ?? 0) + m;
      } else {
        throw new Error(`Carácter inesperado "${c}" en la fórmula ${formula}`);
      }
    }
    return total;
  }
  const r = grupo();
  if (i < formula.length) throw new Error(`Fórmula mal formada (sobra ")"): ${formula}`);
  return r;
}

// Masa molar (g/mol) sumando masas atómicas de DATOS_ELEMENTOS. Lanza si
// algún elemento no tiene masa cargada.
export function masaMolar(formula: string): number {
  const cont = contarAtomos(formula);
  let total = 0;
  for (const [sim, n] of Object.entries(cont)) {
    const d = DATOS_ELEMENTOS.find((x) => x.simbolo === sim);
    if (!d) throw new Error(`Sin masa atómica cargada para ${sim} (fórmula ${formula})`);
    total += d.masa * n;
  }
  return Math.round(total * 100) / 100;
}

// "Ca(OH)2" -> "Ca(OH)_2" para LaTeX: cada dígito que sigue a una letra o
// a ")" pasa a subíndice.
export function subindices(formula: string): string {
  let out = "";
  let i = 0;
  while (i < formula.length) {
    const c = formula[i];
    if (/\d/.test(c)) {
      let n = "";
      while (i < formula.length && /\d/.test(formula[i])) n += formula[i++];
      out += n.length === 1 ? `_${n}` : `_{${n}}`;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

// LaTeX (SIN los signos de dólar) de una fórmula neutra: `\mathrm{Ca(OH)_2}`.
export function formulaLatex(formula: string): string {
  contarAtomos(formula); // valida
  return `\\mathrm{${subindices(formula)}}`;
}

function cargaLatex(carga: number): string {
  const n = Math.abs(carga);
  const signo = carga > 0 ? "+" : "-";
  return n === 1 ? signo : `${n}${signo}`;
}

// LaTeX de un ion: `\mathrm{SO_4^{2-}}`, `\mathrm{Fe^{3+}}`, `\mathrm{Cl^{-}}`.
export function ionLatex(formula: string, carga: number): string {
  contarAtomos(formula);
  return `\\mathrm{${subindices(formula)}^{${cargaLatex(carga)}}}`;
}

// Versiones listas para pegar en el texto de una lección (con $...$).
export function f(formula: string): string {
  return `$${formulaLatex(formula)}$`;
}
export function ion(formula: string, carga: number): string {
  return `$${ionLatex(formula, carga)}$`;
}

// Número de oxidación como superíndice "+3" o "−2" sobre un símbolo:
// `\overset{+3}{\mathrm{Fe}}`.
export function oxLatex(simbolo: string, ox: number): string {
  const s = ox > 0 ? `+${ox}` : ox < 0 ? `-${Math.abs(ox)}` : "0";
  return `\\overset{${s}}{\\mathrm{${simbolo}}}`;
}
export function ox(simbolo: string, n: number): string {
  return `$${oxLatex(simbolo, n)}$`;
}

// Número de oxidación como texto plano: "+3", "−2", "0" (con signo menos
// tipográfico).
export function numeroOxidacion(n: number): string {
  if (n === 0) return "0";
  return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

const SUB: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };

// "H2SO4" -> "H₂SO₄": la fórmula como texto plano con subíndices
// Unicode (para captions y textos que no pasan por KaTeX).
export function formulaUnicode(formula: string): string {
  contarAtomos(formula); // valida
  return formula.replace(/(?<=[A-Za-z)])\d+/g, (n) => n.replace(/\d/g, (d) => SUB[d]));
}

// Escribe una reacción o expresión libre con fórmulas: reemplaza cada
// {{Formula}} por su versión LaTeX inline ($...$). Útil para pasos largos.
export function conFormulas(texto: string): string {
  return texto.replace(/\{\{([^}]+)\}\}/g, (_m, formula: string) => f(formula.trim()));
}
