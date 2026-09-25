import type { E, Func, Lenguaje, Prog, SId, TipoDs } from "./tipos";

// Intérprete mínimo del subconjunto de Codia. Calcula la salida de un
// programa del IR con la semántica REAL de cada lenguaje en lo que
// difiere (división entera, módulo con negativos, coerción de JS,
// índice fuera de rango, formato de booleanos). Las variantes
// (Semantica.*) reproducen errores conceptuales típicos y se usan SOLO
// para fabricar distractores plausibles: nunca para la respuesta.

export interface Semantica {
  lang: Lenguaje;
  rangoIncl?: boolean;
  saltaPrimero?: boolean;
  limiteCompara?: boolean;
  divFlotante?: boolean;
  divOtro?: boolean;
  modOtro?: boolean;
  pilaComoCola?: boolean;
  colaComoPila?: boolean;
  conjLista?: boolean;
  mapaNoSobrescribe?: boolean;
  limitePasos?: number;
}

export type TipoFallo = "DivCero" | "IndiceFuera" | "Tipo" | "ColeccionVacia" | "ClaveFaltante" | "Limite";

export class FalloEjecucion extends Error {
  constructor(public tipo: TipoFallo, mensaje = "") {
    super(`${tipo}${mensaje ? `: ${mensaje}` : ""}`);
  }
}

export interface ResultadoInterp {
  salida: string[];
  fallo: TipoFallo | null;
}

type Valor = number | string | boolean | undefined | number[] | Ds;
interface Ds {
  ty: TipoDs;
  arr: number[];
  set: Set<number>;
  map: Map<string, number>;
}

const LIMITE_PASOS = 300_000;

function esPython(l: Lenguaje) {
  return l === "python";
}

export function formatoValor(x: Valor, lang: Lenguaje): string {
  if (typeof x === "boolean") return esPython(lang) ? (x ? "True" : "False") : x ? "true" : "false";
  if (x === undefined) return "undefined";
  if (typeof x === "number") return String(x);
  if (typeof x === "string") return x;
  throw new FalloEjecucion("Tipo", "no se imprime una colección");
}

class Retorno {
  constructor(public valor: Valor) {}
}
class Corte {}

// Descripción corta de una variable para la tabla de la traza (visual
// "codia.traza"): números y booleanos tal cual se imprimirían, textos
// entre comillas, arreglos como "[1, 2, 3]" y las colecciones dinámicas
// como su contenido: lista "[1, 2]", pila "[1, 2] (tope: 2)", cola
// "[1, 2] (frente: 1)", conjunto "{1, 2}" y mapa "{ana: 15}".
function describirValor(x: Valor, lang: Lenguaje): string {
  if (Array.isArray(x)) return `[${x.join(", ")}]`;
  if (typeof x === "string") return JSON.stringify(x);
  if (x !== null && typeof x === "object") {
    const d = x as Ds;
    if (d.ty === "conj") return `{${[...d.set].join(", ")}}`;
    if (d.ty === "mapa") return `{${[...d.map].map(([k, val]) => `${k}: ${val}`).join(", ")}}`;
    const lista = `[${d.arr.join(", ")}]`;
    if (d.arr.length === 0) return lista;
    if (d.ty === "pila") return `${lista} (tope: ${d.arr[d.arr.length - 1]})`;
    if (d.ty === "cola") return `${lista} (frente: ${d.arr[0]})`;
    return lista;
  }
  return formatoValor(x, lang);
}

// Se llama después de ejecutar una sentencia CON id (decl/asig/print/...),
// al entrar a cada vuelta de un si/para/mientras/paraCada CON id y, con
// `finDeBucle` en true, una vez cuando un para/mientras/paraCada termina
// normalmente (sin break), con una foto de las variables en ese momento.
// Lo usan SOLO los visuales "codia.traza" y "codia.flujo"
// (src/lib/codia/visualesDatos.ts). Con `alPaso` sin pasar, `interpretar`
// se comporta exactamente igual que antes (la práctica no lo usa).
export type AlPaso = (id: string, variables: Record<string, string>, finDeBucle?: boolean) => void;

export function interpretar(prog: Prog, sem: Semantica, alPaso?: AlPaso): ResultadoInterp {
  const salida: string[] = [];
  const funcs = new Map<string, Func>(prog.funcs.map((f) => [f.nombre, f]));
  let pasos = 0;
  const lang = sem.lang;
  const vacioJs = lang === "javascript" || lang === "typescript";

  function marcar(id: string | undefined, env: Map<string, Valor>, finDeBucle = false) {
    if (!alPaso || !id) return;
    const variables: Record<string, string> = {};
    for (const [k, val] of env) variables[k] = describirValor(val, lang);
    alPaso(id, variables, finDeBucle);
  }

  function tick() {
    if (++pasos > (sem.limitePasos ?? LIMITE_PASOS)) throw new FalloEjecucion("Limite");
  }

  function num(x: Valor): number {
    if (typeof x === "number") return x;
    if (x === undefined) return NaN;
    if (typeof x === "string" && lang === "javascript") return Number(x);
    throw new FalloEjecucion("Tipo", "se esperaba un número");
  }

  function evalE(e: E, env: Map<string, Valor>): Valor {
    tick();
    switch (e.k) {
      case "n":
        return e.v;
      case "s":
        return e.v;
      case "b":
        return e.v;
      case "v": {
        if (!env.has(e.n)) throw new FalloEjecucion("Tipo", `variable ${e.n} no definida`);
        return env.get(e.n);
      }
      case "no":
        return !evalE(e.a, env);
      case "txt": {
        const x = evalE(e.a, env);
        return typeof x === "boolean" ? (esPython(lang) ? (x ? "True" : "False") : String(x)) : String(x);
      }
      case "long": {
        const x = evalE(e.a, env);
        if (typeof x === "string" || Array.isArray(x)) return x.length;
        throw new FalloEjecucion("Tipo");
      }
      case "ix": {
        const a = evalE(e.a, env);
        const i = num(evalE(e.i, env));
        if (!Array.isArray(a)) throw new FalloEjecucion("Tipo");
        if (i < 0 || i >= a.length) {
          if (vacioJs) return undefined;
          throw new FalloEjecucion("IndiceFuera");
        }
        return a[i];
      }
      case "arr":
        return e.items.map((it) => num(evalE(it, env)));
      case "call": {
        const f = funcs.get(e.f);
        if (!f) throw new FalloEjecucion("Tipo", `función ${e.f}`);
        const local = new Map<string, Valor>();
        f.params.forEach((p, i) => local.set(p.n, evalE(e.args[i], env)));
        try {
          ejecutarBloque(f.cuerpo, local);
        } catch (r) {
          if (r instanceof Retorno) return r.valor;
          throw r;
        }
        return undefined;
      }
      case "ds":
        return evalDs(e, env);
      case "op":
        return evalOp(e.op, evalE, e, env);
    }
  }

  function evalOp(o: string, ev: typeof evalE, e: Extract<E, { k: "op" }>, env: Map<string, Valor>): Valor {
    if (o === "y") {
      const a = ev(e.a, env);
      return a ? ev(e.b, env) : a;
    }
    if (o === "o") {
      const a = ev(e.a, env);
      return a ? a : ev(e.b, env);
    }
    return aplicarOp(o, ev(e.a, env), ev(e.b, env));
  }

  function aplicarOp(o: string, a: Valor, bb: Valor): Valor {
    switch (o) {
      case "+": {
        if (typeof a === "number" && typeof bb === "number") return a + bb;
        if (typeof a === "string" && typeof bb === "string") return a + bb;
        if (typeof a === "string" || typeof bb === "string") {
          if (esPython(lang)) throw new FalloEjecucion("Tipo", "str + int");
          const f = (x: Valor) => (typeof x === "boolean" ? String(x) : x === undefined ? "undefined" : String(x));
          return f(a) + f(bb);
        }
        return num(a) + num(bb);
      }
      case "-":
        if ((typeof a === "string" || typeof bb === "string") && lang !== "javascript") throw new FalloEjecucion("Tipo", "resta con str");
        return num(a) - num(bb);
      case "*":
        if (typeof a === "string" && typeof bb === "number" && esPython(lang)) return a.repeat(bb);
        if ((typeof a === "string" || typeof bb === "string") && lang !== "javascript") throw new FalloEjecucion("Tipo");
        return num(a) * num(bb);
      case "div": {
        const x = num(a);
        const y = num(bb);
        if (sem.divFlotante) return x / y;
        const piso = sem.divOtro ? !esPython(lang) : esPython(lang);
        if (y === 0) {
          if (lang === "python" || lang === "java") throw new FalloEjecucion("DivCero");
          return x === 0 ? NaN : x > 0 ? Infinity : -Infinity;
        }
        return piso ? Math.floor(x / y) : Math.trunc(x / y);
      }
      case "mod": {
        const x = num(a);
        const y = num(bb);
        if (y === 0) {
          if (lang === "python" || lang === "java") throw new FalloEjecucion("DivCero");
          return NaN;
        }
        const piso = sem.modOtro ? !esPython(lang) : esPython(lang);
        return piso ? ((x % y) + y) % y : x % y;
      }
      case "<":
        return sem.limiteCompara ? num(a) <= num(bb) : num(a) < num(bb);
      case "<=":
        return sem.limiteCompara ? num(a) < num(bb) : num(a) <= num(bb);
      case ">":
        return sem.limiteCompara ? num(a) >= num(bb) : num(a) > num(bb);
      case ">=":
        return sem.limiteCompara ? num(a) > num(bb) : num(a) >= num(bb);
      case "==":
      case "igCad":
        return a === bb;
      case "!=":
        return a !== bb;
      case "eqLaxo": {
        if (typeof a === "string" && typeof bb === "number") return Number(a) === bb;
        if (typeof a === "number" && typeof bb === "string") return a === Number(bb);
        return a === bb;
      }
      default:
        throw new FalloEjecucion("Tipo", `operador ${o}`);
    }
  }

  function getDs(nombre: string, env: Map<string, Valor>): Ds {
    const d = env.get(nombre);
    if (!d || typeof d !== "object" || Array.isArray(d)) throw new FalloEjecucion("Tipo", `no es una colección: ${nombre}`);
    return d as Ds;
  }

  function evalDs(e: Extract<E, { k: "ds" }>, env: Map<string, Valor>): Valor {
    const d = getDs(e.n, env);
    const args = e.args.map((a) => evalE(a, env));
    switch (e.op) {
      case "agregar":
        if (d.ty === "conj" && !sem.conjLista) d.set.add(num(args[0]));
        else d.arr.push(num(args[0]));
        return undefined;
      case "apilar":
      case "encolar":
        d.arr.push(num(args[0]));
        return undefined;
      case "desapilar": {
        if (d.arr.length === 0) {
          if (vacioJs) return undefined;
          throw new FalloEjecucion("ColeccionVacia");
        }
        return sem.pilaComoCola ? d.arr.shift() : d.arr.pop();
      }
      case "desencolar": {
        if (d.arr.length === 0) {
          if (vacioJs) return undefined;
          throw new FalloEjecucion("ColeccionVacia");
        }
        return sem.colaComoPila ? d.arr.pop() : d.arr.shift();
      }
      case "tope":
        if (d.arr.length === 0) throw new FalloEjecucion("ColeccionVacia");
        return sem.pilaComoCola ? d.arr[0] : d.arr[d.arr.length - 1];
      case "frente":
        if (d.arr.length === 0) throw new FalloEjecucion("ColeccionVacia");
        return sem.colaComoPila ? d.arr[d.arr.length - 1] : d.arr[0];
      case "vacia":
        return d.arr.length === 0;
      case "obt": {
        if (d.ty === "mapa") {
          const k = String(args[0]);
          if (!d.map.has(k)) throw new FalloEjecucion("ClaveFaltante", k);
          return d.map.get(k);
        }
        const i = num(args[0]);
        if (i < 0 || i >= d.arr.length) {
          if (vacioJs) return undefined;
          throw new FalloEjecucion("IndiceFuera");
        }
        return d.arr[i];
      }
      case "tam":
        if (d.ty === "conj") return sem.conjLista ? d.arr.length : d.set.size;
        if (d.ty === "mapa") return d.map.size;
        return d.arr.length;
      case "tiene":
        if (d.ty === "mapa") return d.map.has(String(args[0]));
        return sem.conjLista ? d.arr.includes(num(args[0])) : d.set.has(num(args[0]));
      case "quitar":
        d.set.delete(num(args[0]));
        return undefined;
      case "poner": {
        const k = String(args[0]);
        if (sem.mapaNoSobrescribe && d.map.has(k)) return undefined;
        d.map.set(k, num(args[1]));
        return undefined;
      }
    }
  }

  function ejecutarBloque(cuerpo: SId[], env: Map<string, Valor>) {
    for (const st of cuerpo) ejecutar(st, env);
  }

  function ejecutar(st: SId, env: Map<string, Valor>) {
    tick();
    switch (st.k) {
      case "com":
        return;
      case "decl":
        env.set(st.n, evalE(st.e, env));
        marcar(st.id, env);
        return;
      case "dsDecl":
        env.set(st.n, { ty: st.ty, arr: [], set: new Set(), map: new Map() });
        marcar(st.id, env);
        return;
      case "asig": {
        const nuevo = evalE(st.e, env);
        env.set(st.n, st.aug ? aplicarOp(st.aug, env.get(st.n), nuevo) : nuevo);
        marcar(st.id, env);
        return;
      }
      case "asigIx": {
        const a = env.get(st.n);
        const i = num(evalE(st.i, env));
        if (!Array.isArray(a)) throw new FalloEjecucion("Tipo");
        if (i < 0 || i >= a.length) throw new FalloEjecucion("IndiceFuera");
        a[i] = num(evalE(st.e, env));
        marcar(st.id, env);
        return;
      }
      case "print":
        salida.push(st.args.map((a) => formatoValor(evalE(a, env), lang)).join(" "));
        marcar(st.id, env);
        return;
      case "si": {
        marcar(st.id, env);
        if (evalE(st.cond, env)) ejecutarBloque(st.entonces, env);
        else if (st.sino) ejecutarBloque(st.sino, env);
        return;
      }
      case "para": {
        const desde = num(evalE(st.desde, env)) + (sem.saltaPrimero ? 1 : 0);
        const hasta = num(evalE(st.hasta, env)) + (sem.rangoIncl ? 1 : 0);
        try {
          for (let i = desde; i < hasta; i++) {
            env.set(st.v, i);
            marcar(st.id, env);
            ejecutarBloque(st.cuerpo, env);
          }
          marcar(st.id, env, true);
        } catch (c) {
          if (!(c instanceof Corte)) throw c;
        }
        return;
      }
      case "paraCada": {
        const a = evalE(st.en, env);
        if (!Array.isArray(a)) throw new FalloEjecucion("Tipo");
        try {
          for (const x of [...a]) {
            env.set(st.v, x);
            marcar(st.id, env);
            ejecutarBloque(st.cuerpo, env);
          }
          marcar(st.id, env, true);
        } catch (c) {
          if (!(c instanceof Corte)) throw c;
        }
        return;
      }
      case "mientras": {
        try {
          while (evalE(st.cond, env)) {
            marcar(st.id, env);
            ejecutarBloque(st.cuerpo, env);
          }
          marcar(st.id, env, true);
        } catch (c) {
          if (!(c instanceof Corte)) throw c;
        }
        return;
      }
      case "retorna": {
        const valor = evalE(st.e, env);
        marcar(st.id, env);
        throw new Retorno(valor);
      }
      case "romper":
        marcar(st.id, env);
        throw new Corte();
      case "exec":
        evalE(st.e, env);
        marcar(st.id, env);
        return;
    }
  }

  const env = new Map<string, Valor>();
  try {
    ejecutarBloque(prog.main, env);
    return { salida, fallo: null };
  } catch (err) {
    if (err instanceof FalloEjecucion) return { salida, fallo: err.tipo };
    throw err;
  }
}

// Salida como texto (líneas unidas con \n, sin \n final).
export function textoSalida(r: ResultadoInterp): string {
  return r.salida.join("\n");
}
