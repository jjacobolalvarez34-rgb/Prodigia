import type { DsOp, E, Func, Lenguaje, Op, Prog, S, SId, Tipo, TipoDs } from "./tipos";

// Renderizador del IR a Python / Java / JavaScript / TypeScript. Puro y
// determinista: el mismo programa siempre da el mismo texto. Además de
// las líneas "de pantalla" devuelve las piezas para armar el programa
// EJECUTABLE (Java necesita clase + main; el resto corre tal cual) y la
// línea de pantalla de cada sentencia con id (para las preguntas de
// "¿en qué línea está el error?").

export interface Render {
  lenguaje: Lenguaje;
  // Líneas mostradas al usuario (imports + funciones + sentencias).
  lineas: string[];
  nImports: number; // líneas de imports (incluye la línea en blanco final)
  nFuncs: number; // líneas de funciones (incluye la línea en blanco final)
  lineaDe: Record<string, number>; // id de sentencia -> línea (1-based) de pantalla
}

interface Linea {
  t: string;
  id?: string;
}

const PREC: Record<string, number> = { o: 1, y: 2, eq: 4, rel: 5, add: 6, mul: 7, atomo: 9 };

function precOp(o: Op, lang: Lenguaje): number {
  switch (o) {
    case "o":
      return PREC.o;
    case "y":
      return PREC.y;
    case "==":
    case "!=":
    case "eqLaxo":
    case "igCad":
      return PREC.eq;
    case "<":
    case "<=":
    case ">":
    case ">=":
      return PREC.rel;
    case "+":
    case "-":
      return PREC.add;
    case "div":
      return lang === "javascript" || lang === "typescript" ? PREC.atomo : PREC.mul;
    default:
      return PREC.mul;
  }
}

function tipoTexto(t: Tipo, lang: Lenguaje): string {
  if (lang === "java") return { int: "int", str: "String", bool: "boolean", arr: "int[]" }[t];
  return { int: "number", str: "string", bool: "boolean", arr: "number[]" }[t];
}

const DS_JAVA: Record<TipoDs, string> = {
  lista: "List<Integer>",
  pila: "Deque<Integer>",
  cola: "Queue<Integer>",
  conj: "Set<Integer>",
  mapa: "Map<String, Integer>",
};
const DS_JAVA_NEW: Record<TipoDs, string> = {
  lista: "new ArrayList<>()",
  pila: "new ArrayDeque<>()",
  cola: "new ArrayDeque<>()",
  conj: "new HashSet<>()",
  mapa: "new HashMap<>()",
};

function usaDs(prog: Prog): Set<TipoDs> {
  const usados = new Set<TipoDs>();
  const rec = (ss: SId[]) => {
    for (const st of ss) {
      if (st.k === "dsDecl") usados.add(st.ty);
      if (st.k === "si") {
        rec(st.entonces);
        if (st.sino) rec(st.sino);
      }
      if (st.k === "para" || st.k === "paraCada" || st.k === "mientras") rec(st.cuerpo);
    }
  };
  rec(prog.main);
  prog.funcs.forEach((f) => rec(f.cuerpo));
  return usados;
}

function reasignados(prog: Prog): Set<string> {
  const r = new Set<string>();
  const rec = (ss: SId[]) => {
    for (const st of ss) {
      if (st.k === "asig") r.add(st.n);
      if (st.k === "si") {
        rec(st.entonces);
        if (st.sino) rec(st.sino);
      }
      if (st.k === "para" || st.k === "paraCada" || st.k === "mientras") rec(st.cuerpo);
    }
  };
  rec(prog.main);
  prog.funcs.forEach((f) => rec(f.cuerpo));
  return r;
}

export function renderizar(prog: Prog, lang: Lenguaje): Render {
  const py = lang === "python";
  const java = lang === "java";
  const ts = lang === "typescript";
  const mut = reasignados(prog);
  const dsUsados = usaDs(prog);

  // ---------- expresiones ----------
  function hijo(e: E, padre: number, esDerecho: boolean, padreComparativo = false): string {
    const r = expr(e);
    let c = PREC.atomo;
    if (e.k === "op") c = precOp(e.op, lang);
    else if (e.k === "no") c = PREC.atomo;
    else if (e.k === "n" && e.v < 0 && esDerecho) c = 0;
    else if (e.k === "ds" && e.op === "tiene" && py) c = PREC.eq;
    const compar = c === PREC.eq || c === PREC.rel;
    if (c < padre || (c === padre && esDerecho) || (padreComparativo && compar)) return `(${r})`;
    return r;
  }

  function expr(e: E): string {
    switch (e.k) {
      case "n":
        return String(e.v);
      case "s":
        return JSON.stringify(e.v);
      case "b":
        return py ? (e.v ? "True" : "False") : String(e.v);
      case "v":
        return e.n;
      case "no": {
        const atomico = e.a.k === "v" || e.a.k === "call" || e.a.k === "b" || (java && e.a.k === "ds" && e.a.op === "vacia");
        const inner = atomico ? expr(e.a) : `(${expr(e.a)})`;
        return py ? `not ${inner}` : `!${inner}`;
      }
      case "txt":
        return py ? `str(${expr(e.a)})` : java ? `String.valueOf(${expr(e.a)})` : `String(${expr(e.a)})`;
      case "long": {
        const a = e.a.k === "v" ? expr(e.a) : `(${expr(e.a)})`;
        if (py) return `len(${expr(e.a)})`;
        if (java && e.de === "str") return `${a}.length()`;
        return `${a}.length`;
      }
      case "ix":
        return `${expr(e.a)}[${expr(e.i)}]`;
      case "arr":
        return java ? `{${e.items.map(expr).join(", ")}}` : `[${e.items.map(expr).join(", ")}]`;
      case "call":
        return `${e.f}(${e.args.map(expr).join(", ")})`;
      case "ds":
        return dsExpr(e.n, e.op, e.args);
      case "op": {
        const p = precOp(e.op, lang);
        if (e.op === "div" && (lang === "javascript" || ts)) return `Math.trunc(${expr(e.a)} / ${expr(e.b)})`;
        const comp = p === PREC.eq || p === PREC.rel;
        const a = hijo(e.a, p, false, comp);
        const bb = hijo(e.b, p, true, comp);
        return `${a} ${simbolo(e.op)} ${bb}`;
      }
    }
  }

  function simbolo(o: Op): string {
    switch (o) {
      case "div":
        return py ? "//" : "/";
      case "mod":
        return "%";
      case "y":
        return py ? "and" : "&&";
      case "o":
        return py ? "or" : "||";
      case "==":
        return py || java ? "==" : "===";
      case "!=":
        return py || java ? "!=" : "!==";
      case "eqLaxo":
        return "==";
      case "igCad":
        return py ? "==" : java ? "==" : "===";
      default:
        return o;
    }
  }

  function dsExpr(nombre: string, o: DsOp, args: E[]): string {
    const a0 = args[0] ? expr(args[0]) : "";
    const a1 = args[1] ? expr(args[1]) : "";
    // tipo de la estructura no viaja en la expresión: se infiere por la operación.
    switch (o) {
      case "agregar":
        if (dsTipos[nombre] === "conj") return `${nombre}.add(${a0})`;
        return py ? `${nombre}.append(${a0})` : java ? `${nombre}.add(${a0})` : `${nombre}.push(${a0})`;
      case "apilar":
        return py ? `${nombre}.append(${a0})` : `${nombre}.push(${a0})`;
      case "encolar":
        return py ? `${nombre}.append(${a0})` : java ? `${nombre}.add(${a0})` : `${nombre}.push(${a0})`;
      case "desapilar":
        return ts ? `${nombre}.pop()!` : `${nombre}.pop()`;
      case "desencolar":
        return py ? `${nombre}.popleft()` : java ? `${nombre}.poll()` : ts ? `${nombre}.shift()!` : `${nombre}.shift()`;
      case "tope":
        return py ? `${nombre}[-1]` : java ? `${nombre}.peek()` : `${nombre}[${nombre}.length - 1]`;
      case "frente":
        return py ? `${nombre}[0]` : java ? `${nombre}.peek()` : `${nombre}[0]`;
      case "vacia":
        return py ? `len(${nombre}) == 0` : java ? `${nombre}.isEmpty()` : `${nombre}.length === 0`;
      case "obt": {
        const tipo = dsTipos[nombre];
        if (tipo === "mapa") return py ? `${nombre}[${a0}]` : java ? `${nombre}.get(${a0})` : ts ? `${nombre}.get(${a0})!` : `${nombre}.get(${a0})`;
        return py ? `${nombre}[${a0}]` : java ? `${nombre}.get(${a0})` : `${nombre}[${a0}]`;
      }
      case "tam": {
        const tipo = dsTipos[nombre];
        return py ? `len(${nombre})` : java ? `${nombre}.size()` : tipo === "conj" || tipo === "mapa" ? `${nombre}.size` : `${nombre}.length`;
      }
      case "tiene": {
        const tipo = dsTipos[nombre];
        return py ? `${a0} in ${nombre}` : java ? (tipo === "mapa" ? `${nombre}.containsKey(${a0})` : `${nombre}.contains(${a0})`) : `${nombre}.has(${a0})`;
      }
      case "quitar":
        return py ? `${nombre}.discard(${a0})` : java ? `${nombre}.remove(${a0})` : `${nombre}.delete(${a0})`;
      case "poner":
        return py ? `${nombre}[${a0}] = ${a1}` : java ? `${nombre}.put(${a0}, ${a1})` : `${nombre}.set(${a0}, ${a1})`;
    }
  }

  const dsTipos: Record<string, TipoDs> = {};

  // ---------- sentencias ----------
  const fin = py ? "" : ";";
  const sangria = (n: number) => "    ".repeat(n);

  function bloque(ss: SId[], nivel: number, out: Linea[]) {
    for (const st of ss) sentencia(st, nivel, out);
  }

  function cabeceraPy(cond: string, kw: string, nivel: number, id: string | undefined, out: Linea[]) {
    out.push({ t: `${sangria(nivel)}${kw} ${cond}:`, id });
  }

  function sentencia(st: SId, nivel: number, out: Linea[]) {
    const ind = sangria(nivel);
    const id = st.id;
    switch (st.k) {
      case "com":
        out.push({ t: `${ind}${py ? "#" : "//"} ${st.t}`, id });
        return;
      case "decl": {
        if (py) out.push({ t: `${ind}${st.n} = ${expr(st.e)}`, id });
        else if (java) out.push({ t: `${ind}${tipoTexto(st.ty, lang)} ${st.n} = ${expr(st.e)};`, id });
        else {
          const kw = mut.has(st.n) ? "let" : "const";
          out.push({ t: ts ? `${ind}${kw} ${st.n}: ${tipoTexto(st.ty, lang)} = ${expr(st.e)};` : `${ind}${kw} ${st.n} = ${expr(st.e)};`, id });
        }
        return;
      }
      case "dsDecl": {
        dsTipos[st.n] = st.ty;
        if (py) {
          const init = st.ty === "conj" ? "set()" : st.ty === "cola" ? "deque()" : st.ty === "mapa" ? "{}" : "[]";
          out.push({ t: `${ind}${st.n} = ${init}`, id });
        } else if (java) {
          out.push({ t: `${ind}${DS_JAVA[st.ty]} ${st.n} = ${DS_JAVA_NEW[st.ty]};`, id });
        } else {
          const init = st.ty === "conj" ? (ts ? "new Set<number>()" : "new Set()") : st.ty === "mapa" ? (ts ? "new Map<string, number>()" : "new Map()") : "[]";
          const anot = ts ? `: ${st.ty === "conj" ? "Set<number>" : st.ty === "mapa" ? "Map<string, number>" : "number[]"}` : "";
          out.push({ t: `${ind}const ${st.n}${anot} = ${init};`, id });
        }
        return;
      }
      case "asig":
        out.push({ t: `${ind}${st.n} ${st.aug ? `${st.aug}=` : "="} ${expr(st.e)}${fin}`, id });
        return;
      case "asigIx":
        out.push({ t: `${ind}${st.n}[${expr(st.i)}] = ${expr(st.e)}${fin}`, id });
        return;
      case "print": {
        let cuerpo: string;
        if (py) cuerpo = `print(${st.args.map(expr).join(", ")})`;
        else if (java) {
          if (st.args.length === 1) cuerpo = `System.out.println(${expr(st.args[0])});`;
          else {
            const partes = st.args.map((a, i) => {
              const r = expr(a);
              const esSuma = a.k === "op" && precOp(a.op, lang) <= PREC.add;
              const necesita = i === 0 ? a.k === "op" && precOp(a.op, lang) < PREC.add : esSuma;
              return necesita ? `(${r})` : r;
            });
            cuerpo = `System.out.println(${partes.join(' + " " + ')});`;
          }
        } else cuerpo = `console.log(${st.args.map(expr).join(", ")});`;
        out.push({ t: ind + cuerpo, id });
        return;
      }
      case "exec":
        out.push({ t: `${ind}${expr(st.e)}${fin}`, id });
        return;
      case "retorna":
        out.push({ t: `${ind}return ${expr(st.e)}${fin}`, id });
        return;
      case "romper":
        out.push({ t: `${ind}break${fin}`, id });
        return;
      case "si": {
        if (py) {
          cabeceraPy(expr(st.cond), "if", nivel, id, out);
          bloque(st.entonces, nivel + 1, out);
          let resto = st.sino;
          while (resto) {
            if (resto.length === 1 && resto[0].k === "si") {
              const inner = resto[0] as Extract<S, { k: "si" }> & { id?: string };
              cabeceraPy(expr(inner.cond), "elif", nivel, inner.id, out);
              bloque(inner.entonces, nivel + 1, out);
              resto = inner.sino;
            } else {
              out.push({ t: `${ind}else:` });
              bloque(resto, nivel + 1, out);
              resto = undefined;
            }
          }
        } else {
          out.push({ t: `${ind}if (${expr(st.cond)}) {`, id });
          bloque(st.entonces, nivel + 1, out);
          let resto = st.sino;
          while (resto) {
            if (resto.length === 1 && resto[0].k === "si") {
              const inner = resto[0] as Extract<S, { k: "si" }> & { id?: string };
              out.push({ t: `${ind}} else if (${expr(inner.cond)}) {`, id: inner.id });
              bloque(inner.entonces, nivel + 1, out);
              resto = inner.sino;
            } else {
              out.push({ t: `${ind}} else {` });
              bloque(resto, nivel + 1, out);
              resto = undefined;
            }
          }
          out.push({ t: `${ind}}` });
        }
        return;
      }
      case "para": {
        if (py) {
          const rango = st.desde.k === "n" && st.desde.v === 0 ? expr(st.hasta) : `${expr(st.desde)}, ${expr(st.hasta)}`;
          out.push({ t: `${ind}for ${st.v} in range(${rango}):`, id });
          bloque(st.cuerpo, nivel + 1, out);
        } else {
          const decl = java ? "int" : "let";
          out.push({ t: `${ind}for (${decl} ${st.v} = ${expr(st.desde)}; ${st.v} < ${expr(st.hasta)}; ${st.v}++) {`, id });
          bloque(st.cuerpo, nivel + 1, out);
          out.push({ t: `${ind}}` });
        }
        return;
      }
      case "paraCada": {
        if (py) {
          out.push({ t: `${ind}for ${st.v} in ${expr(st.en)}:`, id });
          bloque(st.cuerpo, nivel + 1, out);
        } else {
          out.push({ t: java ? `${ind}for (int ${st.v} : ${expr(st.en)}) {` : `${ind}for (const ${st.v} of ${expr(st.en)}) {`, id });
          bloque(st.cuerpo, nivel + 1, out);
          out.push({ t: `${ind}}` });
        }
        return;
      }
      case "mientras": {
        if (py) {
          out.push({ t: `${ind}while ${expr(st.cond)}:`, id });
          bloque(st.cuerpo, nivel + 1, out);
        } else {
          out.push({ t: `${ind}while (${expr(st.cond)}) {`, id });
          bloque(st.cuerpo, nivel + 1, out);
          out.push({ t: `${ind}}` });
        }
        return;
      }
    }
  }

  function funcion(f: Func, out: Linea[]) {
    const ps = f.params.map((p) => (py ? p.n : java ? `${tipoTexto(p.ty, lang)} ${p.n}` : ts ? `${p.n}: ${tipoTexto(p.ty, lang)}` : p.n)).join(", ");
    if (py) out.push({ t: `def ${f.nombre}(${ps}):` });
    else if (java) out.push({ t: `static ${tipoTexto(f.ret, lang)} ${f.nombre}(${ps}) {` });
    else out.push({ t: ts ? `function ${f.nombre}(${ps}): ${tipoTexto(f.ret, lang)} {` : `function ${f.nombre}(${ps}) {` });
    bloque(f.cuerpo, 1, out);
    if (!py) out.push({ t: "}" });
  }

  const imports: Linea[] = [];
  if (py && dsUsados.has("cola")) imports.push({ t: "from collections import deque" });
  if (java && dsUsados.size > 0) imports.push({ t: "import java.util.*;" });
  if (imports.length) imports.push({ t: "" });

  const funcs: Linea[] = [];
  prog.funcs.forEach((f, i) => {
    funcion(f, funcs);
    if (i < prog.funcs.length - 1 || true) funcs.push({ t: "" });
  });

  const main: Linea[] = [];
  bloque(prog.main, 0, main);

  const todas = [...imports, ...funcs, ...main];
  const lineaDe: Record<string, number> = {};
  todas.forEach((l, i) => {
    if (l.id && lineaDe[l.id] === undefined) lineaDe[l.id] = i + 1;
  });
  return { lenguaje: lang, lineas: todas.map((l) => l.t), nImports: imports.length, nFuncs: funcs.length, lineaDe };
}

// Programa ejecutable a partir de las líneas de pantalla (que pueden
// haber sido mutadas). Devuelve el texto y el mapa línea de pantalla
// (1-based) -> línea del ejecutable (1-based).
export function ensamblar(
  lang: Lenguaje,
  lineas: string[],
  nImports: number,
  nFuncs: number,
  clase = "Main"
): { codigo: string; mapa: number[] } {
  if (lang !== "java") {
    return { codigo: lineas.join("\n") + "\n", mapa: lineas.map((_, i) => i + 1) };
  }
  const out: string[] = [];
  const mapa: number[] = [];
  const push = (t: string, disp?: number) => {
    out.push(t);
    if (disp !== undefined) mapa[disp] = out.length;
  };
  lineas.slice(0, nImports).forEach((l, i) => push(l, i));
  push(`public class ${clase} {`);
  lineas.slice(nImports, nImports + nFuncs).forEach((l, i) => push(l === "" ? "" : `    ${l}`, nImports + i));
  push("    public static void main(String[] args) {");
  lineas.slice(nImports + nFuncs).forEach((l, i) => push(l === "" ? "" : `        ${l}`, nImports + nFuncs + i));
  push("    }");
  push("}");
  return { codigo: out.join("\n") + "\n", mapa };
}

export function textoCodigo(r: Render): string {
  // Las líneas en blanco finales de bloques se recortan solo al final.
  return r.lineas.join("\n").replace(/\n+$/, "");
}
