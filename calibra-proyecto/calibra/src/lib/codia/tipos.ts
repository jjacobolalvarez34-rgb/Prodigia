// IR mínimo de Codia. Cada problema de "salida", "error" y "estructuras"
// se construye como un programa en este IR, se RENDERIZA a los 4
// lenguajes (render.ts) y su salida se CALCULA con un intérprete propio
// del subconjunto usado (interprete.ts) — la respuesta correcta nunca
// se parsea de texto. codia.test.ts además EJECUTA de verdad los
// fragmentos renderizados y compara stdout real contra el intérprete.

export type Lenguaje = "python" | "java" | "javascript" | "typescript";
export const LENGUAJES: readonly Lenguaje[] = ["python", "java", "javascript", "typescript"];
export const NOMBRE_LENGUAJE: Record<Lenguaje, string> = {
  python: "Python",
  java: "Java",
  javascript: "JavaScript",
  typescript: "TypeScript",
};

// arr: arreglo de enteros de tamaño fijo (índice + longitud).
export type Tipo = "int" | "str" | "bool" | "arr";
// Estructuras dinámicas (mundo Estructuras).
export type TipoDs = "lista" | "pila" | "cola" | "conj" | "mapa";

export type Op =
  | "+" | "-" | "*"
  | "div" // división entera (semántica según el lenguaje)
  | "mod"
  | "<" | "<=" | ">" | ">="
  | "==" | "!="
  | "eqLaxo" // == de JavaScript con coerción (solo JS)
  | "igCad" // igualdad de cadenas (.equals en Java)
  | "y" | "o";

export type DsOp =
  | "agregar" | "obt" | "tam" // lista
  | "apilar" | "desapilar" | "tope" | "vacia" // pila
  | "encolar" | "desencolar" | "frente" // cola
  | "tiene" | "quitar" // conj / mapa
  | "poner"; // mapa

export type E =
  | { k: "n"; v: number }
  | { k: "s"; v: string }
  | { k: "b"; v: boolean }
  | { k: "v"; n: string }
  | { k: "op"; op: Op; a: E; b: E }
  | { k: "no"; a: E }
  | { k: "long"; a: E; de: "str" | "arr" }
  | { k: "ix"; a: E; i: E }
  | { k: "arr"; items: E[] }
  | { k: "txt"; a: E }
  | { k: "call"; f: string; args: E[] }
  | { k: "ds"; n: string; op: DsOp; args: E[] };

export type S =
  | { k: "decl"; n: string; ty: Tipo; e: E }
  | { k: "dsDecl"; n: string; ty: TipoDs }
  | { k: "asig"; n: string; e: E; aug?: "+" | "-" | "*" }
  | { k: "asigIx"; n: string; i: E; e: E }
  | { k: "print"; args: E[] }
  | { k: "si"; cond: E; entonces: S[]; sino?: S[] }
  | { k: "para"; v: string; desde: E; hasta: E; cuerpo: S[] } // hasta exclusivo
  | { k: "paraCada"; v: string; en: E; cuerpo: S[] } // en: arr
  | { k: "mientras"; cond: E; cuerpo: S[] }
  | { k: "retorna"; e: E }
  | { k: "romper" }
  | { k: "exec"; e: E }
  | { k: "com"; t: string };

// Cada S puede llevar un id para ubicar su línea renderizada.
export type SId = S & { id?: string };

export interface Func {
  nombre: string;
  params: { n: string; ty: Tipo }[];
  ret: Tipo;
  cuerpo: SId[];
}

export interface Prog {
  funcs: Func[];
  main: SId[];
}

// ---- constructores ----
export const n = (v: number): E => ({ k: "n", v });
export const s = (v: string): E => ({ k: "s", v });
export const b = (v: boolean): E => ({ k: "b", v });
export const v = (nombre: string): E => ({ k: "v", n: nombre });
export const op = (o: Op, a: E, bb: E): E => ({ k: "op", op: o, a, b: bb });
export const txt = (a: E): E => ({ k: "txt", a });
export const call = (f: string, ...args: E[]): E => ({ k: "call", f, args });
export const ds = (nombre: string, o: DsOp, ...args: E[]): E => ({ k: "ds", n: nombre, op: o, args });
export const ix = (a: E, i: E): E => ({ k: "ix", a, i });
export const largo = (a: E, de: "str" | "arr" = "arr"): E => ({ k: "long", a, de });
export const arr = (...items: number[]): E => ({ k: "arr", items: items.map(n) });
export const decl = (nombre: string, ty: Tipo, e: E): SId => ({ k: "decl", n: nombre, ty, e });
export const asig = (nombre: string, e: E, aug?: "+" | "-" | "*"): SId => ({ k: "asig", n: nombre, e, aug });
export const print = (...args: E[]): SId => ({ k: "print", args });
export const si = (cond: E, entonces: SId[], sino?: SId[]): SId => ({ k: "si", cond, entonces, sino });
export const para = (vv: string, desde: E, hasta: E, cuerpo: SId[]): SId => ({ k: "para", v: vv, desde, hasta, cuerpo });
export const paraCada = (vv: string, en: E, cuerpo: SId[]): SId => ({ k: "paraCada", v: vv, en, cuerpo });
export const mientras = (cond: E, cuerpo: SId[]): SId => ({ k: "mientras", cond, cuerpo });
export const retorna = (e: E): SId => ({ k: "retorna", e });
export const exec = (e: E): SId => ({ k: "exec", e });
export const dsDecl = (nombre: string, ty: TipoDs): SId => ({ k: "dsDecl", n: nombre, ty });
export const conId = <T extends SId>(id: string, st: T): T => ({ ...st, id });
