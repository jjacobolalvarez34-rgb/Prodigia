import { type StyleProp, type TextStyle } from "react-native";
import Texto, { type Variante } from "./Texto";

// Fórmulas en texto: la web usa KaTeX para los $…$; en la app se traducen a
// Unicode (fracciones, potencias, raíces, letras griegas) para leerse bien sin un
// motor de LaTeX.

const SUPER: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻", "−": "⁻", n: "ⁿ", x: "ˣ", i: "ⁱ", "(": "⁽", ")": "⁾" };
const SUB: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", "+": "₊", "-": "₋", i: "ᵢ", n: "ₙ", x: "ₓ", "(": "₍", ")": "₎" };
const COMANDOS: Record<string, string> = {
  cdot: "·", times: "×", div: "÷", pm: "±", mp: "∓", le: "≤", leq: "≤", ge: "≥", geq: "≥", neq: "≠", ne: "≠", approx: "≈", infty: "∞",
  pi: "π", theta: "θ", alpha: "α", beta: "β", gamma: "γ", delta: "δ", Delta: "Δ", lambda: "λ", mu: "μ", sigma: "σ", Sigma: "Σ", omega: "ω", Omega: "Ω", phi: "φ", rho: "ρ", tau: "τ", epsilon: "ε", varepsilon: "ε",
  int: "∫", sum: "∑", partial: "∂", nabla: "∇", to: "→", rightarrow: "→", Rightarrow: "⇒", leftarrow: "←", cdots: "⋯", ldots: "…", dots: "…", circ: "°", degree: "°",
  sin: "sin", cos: "cos", tan: "tan", ln: "ln", log: "log", lim: "lim", sec: "sec", csc: "csc", cot: "cot", arcsin: "arcsin", arccos: "arccos", arctan: "arctan",
  lceil: "⌈", rceil: "⌉", lfloor: "⌊", rfloor: "⌋",
  quad: " ", qquad: "  ", ",": " ", ";": " ", "!": "", left: "", right: "", displaystyle: "", mathrm: "", text: "", operatorname: "",
};

function mapear(s: string, tabla: Record<string, string>): string | null {
  let r = "";
  for (const ch of s) {
    const m = tabla[ch];
    if (m === undefined) return null;
    r += m;
  }
  return r;
}

// Saca el contenido de un grupo {…} balanceado desde la posición `i` (que apunta a "{").
function grupo(s: string, i: number): [string, number] {
  if (s[i] !== "{") return [s[i] ?? "", i + 1];
  let nivel = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === "{") nivel++;
    else if (s[j] === "}") {
      nivel--;
      if (nivel === 0) return [s.slice(i + 1, j), j + 1];
    }
  }
  return [s.slice(i + 1), s.length];
}

export function latexAUnicode(entrada: string): string {
  let s = entrada;
  let out = "";
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "\\") {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i));
      const cmd = m ? m[1] : "";
      i += 1 + cmd.length;
      if (cmd === "frac" || cmd === "dfrac" || cmd === "tfrac") {
        const [num, j] = grupo(s, i);
        const [den, k] = grupo(s, j);
        i = k;
        const n = latexAUnicode(num);
        const d = latexAUnicode(den);
        out += `${n.length > 1 ? `(${n})` : n}/${d.length > 1 ? `(${d})` : d}`;
      } else if (cmd === "sqrt") {
        let indice = "";
        if (s[i] === "[") {
          const fin = s.indexOf("]", i);
          indice = s.slice(i + 1, fin);
          i = fin + 1;
        }
        const [rad, j] = grupo(s, i);
        i = j;
        const r = latexAUnicode(rad);
        out += `${indice ? mapear(indice, SUPER) ?? indice : ""}√${r.length > 1 ? `(${r})` : r}`;
      } else if (cmd === "bar" || cmd === "overline" || cmd === "vec" || cmd === "hat") {
        const [g, j] = grupo(s, i);
        i = j;
        out += latexAUnicode(g) + (cmd === "bar" || cmd === "overline" ? "̄" : cmd === "vec" ? "⃗" : "̂");
      } else if (cmd === "text" || cmd === "mathrm" || cmd === "mathbf" || cmd === "operatorname" || cmd === "textbf") {
        const [g, j] = grupo(s, i);
        i = j;
        out += g;
      } else {
        out += COMANDOS[cmd] ?? cmd;
      }
    } else if (ch === "^" || ch === "_") {
      const [g, j] = grupo(s, i + 1);
      i = j;
      const interior = latexAUnicode(g);
      const mapeado = mapear(interior, ch === "^" ? SUPER : SUB);
      out += mapeado ?? `${ch}(${interior})`;
    } else if (ch === "{" || ch === "}") {
      i++;
    } else {
      out += ch;
      i++;
    }
  }
  s = out;
  return s.replace(/\s+/g, " ").trim();
}

// Reemplaza solo lo que está entre $…$ (Codia trae "$" de verdad en el código: por
// eso el llamador decide si el mundo usa fórmulas).
export function textoConFormulas(texto: string): string {
  return texto.replace(/\$\$([^$]+)\$\$|\$([^$]+)\$/g, (_, a, b) => latexAUnicode(a ?? b));
}

export default function TextoMate({ texto, v = "cuerpo", c, estilo, conFormulas = true, centro }: { texto: string; v?: Variante; c?: string; estilo?: StyleProp<TextStyle>; conFormulas?: boolean; centro?: boolean }) {
  return (
    <Texto v={v} c={c} style={estilo} centro={centro}>
      {conFormulas ? textoConFormulas(texto) : texto}
    </Texto>
  );
}
