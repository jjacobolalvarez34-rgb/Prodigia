// Inverso "aproximado" de la convención $...$ de MathText: quita las
// marcas `$` y pasa el LaTeX de cada fragmento a un texto plano legible
// (`\frac{x^{3}}{3}` -> `x^3/3`, `R_{1}` -> `R1`, `\sqrt{3}` -> `√3`).
//
// Se usa para dos cosas:
//  1. aria-label / title / texto para compartir, donde no se puede
//     renderizar KaTeX.
//  2. Los tests de los generadores (Calculia, Circuitia, Estadística...):
//     sus parsers independientes verifican la matemática leyendo el
//     texto plano, así que reciben `textoPlano(p.enunciado)` — la
//     verificación no se debilita, solo se le presenta el mismo formato
//     de siempre.
//
// SOLO se convierte lo que está entre $...$: el resto del string (por
// ejemplo los datos `{1, 2, 3}` de Estadística) queda intacto.

const SIMBOLOS: Record<string, string> = {
  cdot: "·",
  times: "×",
  div: "÷",
  pm: "±",
  int: "∫ ",
  sum: "∑ ",
  partial: "∂",
  infty: "∞",
  to: "→",
  rightarrow: "→",
  sigma: "σ",
  mu: "μ",
  theta: "θ",
  pi: "π",
  Omega: "Ω",
  omega: "ω",
  Delta: "Δ",
  delta: "δ",
  alpha: "α",
  beta: "β",
  lambda: "λ",
  leq: "≤",
  le: "≤",
  geq: "≥",
  ge: "≥",
  neq: "≠",
  ne: "≠",
  approx: "≈",
  circ: "°",
  lceil: "⌈",
  rceil: "⌉",
  lfloor: "⌊",
  rfloor: "⌋",
  degree: "°",
  quad: " ",
  qquad: " ",
  lim: "lim",
  ln: "ln",
  log: "log",
  sin: "sen",
  cos: "cos",
  tan: "tan",
  cot: "cot",
  sec: "sec",
  csc: "csc",
  exp: "exp",
};

const CONSUME_ESPACIO = new Set(["int", "sum", "partial"]);

const CON_GRUPO_TRANSPARENTE = new Set(["operatorname", "text", "mathrm", "textbf", "mathbf", "mathit", "mathsf"]);

function leerGrupo(s: string, desde: number): [string, number] {
  let i = desde;
  while (i < s.length && s[i] === " ") i++;
  if (s[i] !== "{") return [s[i] ?? "", i + 1];
  let profundidad = 0;
  const inicio = i + 1;
  for (; i < s.length; i++) {
    if (s[i] === "{") profundidad++;
    else if (s[i] === "}") {
      profundidad--;
      if (profundidad === 0) return [s.slice(inicio, i), i + 1];
    }
  }
  return [s.slice(inicio), s.length];
}

// Un operando de fracción/raíz necesita paréntesis si tiene un operador
// (+, −, espacio) fuera de paréntesis: `x^3/3`, `-3/4` no; `(x − μ)/σ` sí.
function necesitaParentesis(s: string): boolean {
  let profundidad = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(") profundidad++;
    else if (c === ")") profundidad--;
    else if (profundidad === 0 && (c === " " || c === "+" || c === "−" || (c === "-" && i > 0))) return true;
  }
  return false;
}

const envolver = (s: string) => (necesitaParentesis(s) ? `(${s})` : s);

function convertir(s: string): string {
  let salida = "";
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === "\\") {
      const m = /^\\([a-zA-Z]+)/.exec(s.slice(i));
      if (m) {
        const nombre = m[1];
        i += m[0].length;
        if (nombre === "frac" || nombre === "dfrac" || nombre === "tfrac") {
          const [a, i2] = leerGrupo(s, i);
          const [b, i3] = leerGrupo(s, i2);
          salida += `${envolver(convertir(a))}/${envolver(convertir(b))}`;
          i = i3;
        } else if (nombre === "sqrt") {
          const [a, i2] = leerGrupo(s, i);
          salida += `√${envolver(convertir(a))}`;
          i = i2;
        } else if (nombre === "bar" || nombre === "overline" || nombre === "hat") {
          // x̄ (barra) e ŷ (sombrero): el signo diacrítico combinado va DESPUÉS de la letra.
          const [a, i2] = leerGrupo(s, i);
          salida += `${convertir(a)}${nombre === "hat" ? "̂" : "̄"}`;
          i = i2;
        } else if (CON_GRUPO_TRANSPARENTE.has(nombre)) {
          const [a, i2] = leerGrupo(s, i);
          salida += convertir(a);
          i = i2;
        } else if (nombre === "left" || nombre === "right") {
          // el delimitador que sigue se procesa como un carácter común
          if (s[i] === ".") i++;
        } else {
          salida += SIMBOLOS[nombre] ?? nombre;
          // TeX ignora el espacio que sigue a una palabra de control: acá se
          // consume cuando solo separa el comando de lo que sigue (\cdot x -> ·x,
          // \partial f -> ∂f, \int 3x -> "∫ 3x"), pero se conserva cuando lo que
          // sigue es un operador (`\mu = 3` -> "μ = 3", `\sigma + 1`).
          if (s[i] === " " && (CONSUME_ESPACIO.has(nombre) || !/^ [=+\-−<>]/.test(s.slice(i, i + 2)))) i++;
        }
        continue;
      }
      const siguiente = s[i + 1] ?? "";
      i += 2;
      salida += siguiente === "," || siguiente === ";" || siguiente === " " || siguiente === ":" ? " " : siguiente === "!" ? "" : siguiente;
      continue;
    }
    if (c === "^" || c === "_") {
      const [a, i2] = leerGrupo(s, i + 1);
      i = i2;
      const interior = convertir(a);
      if (c === "^" && interior === "°") {
        salida += "°"; // 30^{\circ} -> 30°
        continue;
      }
      const simple = /^-?[\w.]+$/.test(interior);
      if (c === "_") {
        // R_{1} -> R1 (así se leía antes de LaTeX); a_{n} -> a_n; a_{n+1} -> a_(n+1)
        salida += /^\d$/.test(interior) ? interior : simple && interior.length === 1 ? `_${interior}` : `_(${interior})`;
      } else {
        salida += simple ? `^${interior}` : `^(${interior})`;
      }
      continue;
    }
    if (c === "{" || c === "}") {
      i++;
      continue;
    }
    salida += c;
    i++;
  }
  return salida;
}

export function textoPlano(texto: string): string {
  return texto.replace(/\$([^$]+)\$/g, (_, expr: string) => convertir(expr));
}
