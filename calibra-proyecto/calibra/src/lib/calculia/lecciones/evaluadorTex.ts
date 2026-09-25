// Evaluador numérico de las fórmulas LaTeX que usan las lecciones de Calculia.
// Sirve para VERIFICAR por código que cada igualdad escrita en un visual (una
// derivada, una integral, una cadena de cálculos) es cierta: cada lado se evalúa
// en varios puntos y se compara; el operador de derivada (\dfrac{d}{dx} o el
// apóstrofo de (…)') se calcula por diferencia finita centrada, así que la
// comprobación NO reutiliza ninguna fórmula de derivación del proyecto (es un
// cálculo independiente de src/lib/calculia/visualesDatos.ts).
//
// Cubre solo el subconjunto de LaTeX que aparece en estas lecciones: números,
// x, y, e, π, potencias, fracciones, \cdot, paréntesis, \ln|…|, \cos, sen,
// derivadas y nombres propios de cada lección (u, v, f'(x), ∂f/∂x…) que el
// llamador define con su cálculo independiente.

// Lo que se afirma en el texto es FALSO (distinto de "no sé evaluarlo": eso lanza
// un Error común).
export class AfirmacionFalsaTex extends Error {}

export interface EntornoTex {
  x: number;
  y: number;
}
export type NodoTex = (env: EntornoTex) => number;
export type NombresTex = Record<string, NodoTex>;

// Valor de la constante arbitraria A cuando aparece suelta (cualquier valor
// positivo sirve: la igualdad tiene que cumplirse para todos).
const VALOR_A = 1.7;

function normalizar(tex: string): string {
  return tex
    .replace(/\\left|\\right/g, "")
    .replace(/\\[,;! ]/g, " ")
    .replace(/\\dfrac/g, "\\frac")
    .replace(/\\operatorname\{sen\}/g, "\\sen");
}

const TOKEN = /\s*(\\frac|\\cdot|\\ln|\\cos|\\sen|\\pi|@\d+|\d+(?:\.\d+)?|[a-zA-Z]|[-+*/^(){}|'])/y;

function tokenizar(s: string): string[] {
  const tokens: string[] = [];
  TOKEN.lastIndex = 0;
  let pos = 0;
  while (pos < s.length) {
    if (/^\s*$/.test(s.slice(pos))) break;
    TOKEN.lastIndex = pos;
    const m = TOKEN.exec(s);
    if (!m) throw new Error(`token no reconocido en «${s}» posición ${pos}: «${s.slice(pos, pos + 12)}»`);
    tokens.push(m[1]);
    pos = TOKEN.lastIndex;
  }
  return tokens;
}

export function derivadaNumerica(f: NodoTex, env: EntornoTex): number {
  const h = 1e-5 * Math.max(1, Math.abs(env.x));
  return (f({ ...env, x: env.x + h }) - f({ ...env, x: env.x - h })) / (2 * h);
}

export function compilarTex(fuente: string, nombres: NombresTex = {}): NodoTex {
  let s = normalizar(fuente);
  const lista: NodoTex[] = [];
  // Los comandos (\frac, \ln, \sen, \cdot...) se enmascaran antes de reemplazar los
  // nombres propios: un nombre de una letra (u, v, a, n...) no debe tocar sus letras.
  const comandos: string[] = [];
  const enmascarar = (texto: string) => texto.replace(/\\[a-zA-Z]+/g, (m) => `<<${comandos.includes(m) ? comandos.indexOf(m) : comandos.push(m) - 1}>>`);
  s = enmascarar(s);
  for (const clave of Object.keys(nombres).sort((a, b) => b.length - a.length)) {
    const k = enmascarar(normalizar(clave));
    if (!s.includes(k)) continue;
    s = s.split(k).join(` @${lista.length} `);
    lista.push(nombres[clave]);
  }
  s = s.replace(/<<(\d+)>>/g, (_, n) => comandos[Number(n)]);
  const t = tokenizar(s);
  let i = 0;
  const ver = () => t[i];
  const tomar = (esperado?: string) => {
    const v = t[i++];
    if (esperado !== undefined && v !== esperado) throw new Error(`se esperaba «${esperado}» y llegó «${v}» en «${fuente}»`);
    return v;
  };

  const empiezaAtomo = (v: string | undefined) => v !== undefined && (/^(\d|[a-zA-Z]|@)/.test(v) || v === "(" || v === "{" || v === "\\frac" || v === "\\ln" || v === "\\cos" || v === "\\sen" || v === "\\pi");

  function expr(): NodoTex {
    let acc = termino();
    while (ver() === "+" || ver() === "-") {
      const op = tomar();
      const der = termino();
      const izq = acc;
      acc = op === "+" ? (e) => izq(e) + der(e) : (e) => izq(e) - der(e);
    }
    return acc;
  }

  function termino(): NodoTex {
    let acc = unario();
    for (;;) {
      const v = ver();
      if (v === "\\cdot" || v === "*") {
        tomar();
        const der = unario();
        const izq = acc;
        acc = (e) => izq(e) * der(e);
      } else if (v === "/") {
        tomar();
        const der = unario();
        const izq = acc;
        acc = (e) => izq(e) / der(e);
      } else if (empiezaAtomo(v)) {
        const der = unario();
        const izq = acc;
        acc = (e) => izq(e) * der(e);
      } else return acc;
    }
  }

  function esOperadorDerivada(): boolean {
    return ver() === "\\frac" && t[i + 1] === "{" && t[i + 2] === "d" && t[i + 3] === "}" && t[i + 4] === "{" && t[i + 5] === "d" && t[i + 6] === "x" && t[i + 7] === "}";
  }

  function unario(): NodoTex {
    if (ver() === "-") {
      tomar();
      const v = unario();
      return (e) => -v(e);
    }
    if (ver() === "+") {
      tomar();
      return unario();
    }
    if (esOperadorDerivada()) {
      i += 8;
      const operando = termino();
      return (e) => derivadaNumerica(operando, e);
    }
    return potencia();
  }

  function potencia(): NodoTex {
    const base = postfijo();
    if (ver() === "^") {
      tomar();
      let exp: NodoTex;
      if (ver() === "{") {
        tomar("{");
        exp = expr();
        tomar("}");
      } else exp = atomo().fn;
      return (e) => Math.pow(base(e), exp(e));
    }
    return base;
  }

  function postfijo(): NodoTex {
    const a = atomo();
    if (a.agrupado && ver() === "'") {
      tomar();
      return (e) => derivadaNumerica(a.fn, e);
    }
    return a.fn;
  }

  function atomo(): { fn: NodoTex; agrupado: boolean } {
    const v = tomar();
    if (/^\d/.test(v)) {
      const n = Number(v);
      return { fn: () => n, agrupado: false };
    }
    if (v.startsWith("@")) {
      const nodo = lista[Number(v.slice(1))];
      return { fn: nodo, agrupado: false };
    }
    if (v === "(") {
      const d = expr();
      tomar(")");
      return { fn: d, agrupado: true };
    }
    if (v === "{") {
      const d = expr();
      tomar("}");
      return { fn: d, agrupado: false };
    }
    if (v === "\\frac") {
      tomar("{");
      const num = expr();
      tomar("}");
      tomar("{");
      const den = expr();
      tomar("}");
      return { fn: (e) => num(e) / den(e), agrupado: false };
    }
    if (v === "\\pi") return { fn: () => Math.PI, agrupado: false };
    if (v === "\\ln") {
      let d: NodoTex;
      if (ver() === "|") {
        tomar("|");
        d = expr();
        tomar("|");
      } else {
        tomar("(");
        d = expr();
        tomar(")");
      }
      return { fn: (e) => Math.log(Math.abs(d(e))), agrupado: false };
    }
    if (v === "\\cos" || v === "\\sen") {
      tomar("(");
      const d = expr();
      tomar(")");
      return { fn: v === "\\cos" ? (e) => Math.cos(d(e)) : (e) => Math.sin(d(e)), agrupado: false };
    }
    if (v === "x") return { fn: (e) => e.x, agrupado: false };
    if (v === "y") return { fn: (e) => e.y, agrupado: false };
    if (v === "e") return { fn: () => Math.E, agrupado: false };
    if (v === "A") return { fn: () => VALOR_A, agrupado: false };
    throw new Error(`símbolo desconocido «${v}» en «${fuente}»`);
  }

  const raiz = expr();
  if (i !== t.length) throw new Error(`sobró «${t.slice(i).join(" ")}» en «${fuente}»`);
  return raiz;
}

export interface ResultadoVerificacion {
  // "verificada": todas las igualdades evaluadas y ciertas; "informativa": no
  // afirma nada calculable (una definición, una expresión suelta).
  estado: "verificada" | "informativa";
  igualdades: number;
}

const PUNTOS: EntornoTex[] = [
  { x: 0.7, y: 1.4 },
  { x: 1.3, y: 2.2 },
  { x: 2.1, y: 0.9 },
];

export function esEtiqueta(lado: string): boolean {
  // Un lado que solo nombra algo: «S», «n», «u'», «f(x)», «f(x,2)», «F(x)», «A».
  return /^\s*(?:[a-zA-Z](?:_\w|_\{[^}]*\})?'?|[a-zA-Z]'?\([^)]*\))\s*$/.test(lado);
}

// Verifica una afirmación LaTeX: sentencias separadas por \qquad o por flechas
// (\longrightarrow), cada una una cadena de igualdades a = b = c. Un lado que es
// una etiqueta en la primera posición se descarta; una integral
// «\int E\,dx = R + C» se comprueba derivando R (con C = 0) y comparando con E.
export function verificarAfirmacionTex(afirmacion: string, nombres: NombresTex = {}, puntos: EntornoTex[] = PUNTOS): ResultadoVerificacion {
  const sentencias = afirmacion.split(/\\qquad|\\;\s*\\longrightarrow\s*\\;/).map((p) => p.trim()).filter(Boolean);
  let igualdades = 0;
  for (const sentencia of sentencias) {
    const integral = /^\\int\s+(.+?)\\,dx\s*=\s*(.+)$/.exec(sentencia);
    if (integral) {
      const integrando = compilarTex(integral[1], nombres);
      const resultado = compilarTex(integral[2].replace(/\+\s*C\s*$/, ""), nombres);
      for (const p of puntos) {
        const esperado = integrando(p);
        const real = derivadaNumerica(resultado, p);
        if (!(Math.abs(real - esperado) <= 1e-5 * Math.max(1, Math.abs(esperado)))) throw new AfirmacionFalsaTex(`«${sentencia}»: la derivada del resultado (${real}) no es el integrando (${esperado}) en x=${p.x}`);
      }
      igualdades++;
      continue;
    }
    let lados = sentencia.split("=").map((p) => p.trim());
    if (lados.length < 2) continue;
    if (esEtiqueta(lados[0]) && !(lados[0] in nombres)) lados = lados.slice(1);
    if (lados.length < 2) continue;
    const fns = lados.map((l) => compilarTex(l, nombres));
    for (const p of puntos) {
      const base = fns[0](p);
      for (let k = 1; k < fns.length; k++) {
        const otro = fns[k](p);
        if (!(Math.abs(base - otro) <= 1e-5 * Math.max(1, Math.abs(base)))) throw new AfirmacionFalsaTex(`«${sentencia}»: «${lados[0]}» = ${base} pero «${lados[k]}» = ${otro} en x=${p.x}, y=${p.y}`);
      }
    }
    igualdades += lados.length - 1;
  }
  return { estado: igualdades > 0 ? "verificada" : "informativa", igualdades };
}
