import {
  arr, asig, call, decl, ix, largo, mientras, n, op, para, paraCada, print, retorna, s, si, v,
  type Func, type Lenguaje, type Prog, type SId,
} from "./tipos";
import { interpretar, formatoValor, textoSalida } from "./interprete";
import { ensamblar, renderizar, textoCodigo } from "./render";
import { armarOpciones, distractoresSalida, elegir, NOMBRES_TXT, nombresVar, randomInt } from "./util";
import type { ModoCodia, ProblemaCodia } from "./problema";

// Un borrador de pregunta "¿qué imprime?": un programa del IR, y a lo
// sumo salidas alternativas plausibles que aporta la propia plantilla.
export interface Borrador {
  prog: Prog;
  extras?: string[];
}

export function progSimple(main: SId[], funcs: Func[] = []): Prog {
  return { funcs, main };
}

// Renderiza, calcula la respuesta con el intérprete (semántica REAL del
// lenguaje) y arma las opciones. Lanza si el intérprete falla: una
// plantilla de "salida" nunca debe producir un programa que falle.
export function finalizarSalida(modo: ModoCodia, lang: Lenguaje, bo: Borrador, enunciado = "¿Qué imprime este fragmento?"): ProblemaCodia {
  const r = interpretar(bo.prog, { lang });
  if (r.fallo) throw new Error(`plantilla de salida con fallo ${r.fallo}
${textoCodigo(renderizar(bo.prog, lang))}`);
  const correcta = textoSalida(r);
  const render = renderizar(bo.prog, lang);
  const { codigo } = ensamblar(lang, render.lineas, render.nImports, render.nFuncs);
  const distractores = distractoresSalida(bo.prog, lang, correcta, bo.extras ?? []);
  return {
    modo,
    entrada: "opciones",
    lenguaje: lang,
    enunciado,
    codigo: textoCodigo(render),
    opciones: armarOpciones(correcta, distractores),
    respuesta: correcta,
    verificacion: { tipo: "salida", ejecutable: codigo, stdout: correcta },
  };
}

type Plantilla = { nivelMin: number; nivelMax?: number; langs?: Lenguaje[]; gen: (lang: Lenguaje) => Borrador };

const OPS_ARIT = ["+", "-", "*"] as const;

// ---------- nivel 3: secuencias simples ----------
const aritmetica: Plantilla = {
  nivelMin: 3,
  gen: () => {
    const [x, y, z] = nombresVar(3);
    const A = randomInt(3, 15);
    const B = randomInt(2, 9);
    const o1 = elegir(OPS_ARIT);
    const o2 = elegir(OPS_ARIT);
    return {
      prog: progSimple([
        decl(x, "int", n(A)),
        decl(y, "int", n(B)),
        decl(z, "int", op(o1, v(x), v(y))),
        print(v(z)),
        print(op(o2, v(z), v(y))),
      ]),
    };
  },
};

const reasignar: Plantilla = {
  nivelMin: 3,
  gen: () => {
    const [x] = nombresVar(1);
    const usaAug = randomInt(0, 1) === 1;
    const B = randomInt(2, 9);
    const C = randomInt(2, 5);
    const pasos: SId[] = usaAug
      ? [asig(x, n(B), "+"), asig(x, n(C), "*")]
      : [asig(x, op("+", v(x), n(B))), asig(x, op("*", v(x), n(C)))];
    return { prog: progSimple([decl(x, "int", n(randomInt(1, 9))), ...pasos, print(v(x))]) };
  },
};

const cadena: Plantilla = {
  nivelMin: 3,
  gen: () => {
    const nombre = elegir(NOMBRES_TXT);
    const [saludo] = nombresVar(1);
    return {
      prog: progSimple([
        decl("nombre", "str", s(nombre)),
        decl(saludo, "str", op("+", s("Hola "), v("nombre"))),
        print(v(saludo)),
        print(largo(v(saludo), "str")),
      ]),
    };
  },
};

const intercambio: Plantilla = {
  nivelMin: 3,
  gen: () => {
    const A = randomInt(1, 9);
    let B = randomInt(1, 9);
    if (B === A) B += 1;
    return {
      prog: progSimple([
        decl("a", "int", n(A)),
        decl("b", "int", n(B)),
        decl("t", "int", v("a")),
        asig("a", v("b")),
        asig("b", v("t")),
        print(v("a"), v("b")),
      ]),
    };
  },
};

const divmodPositivo: Plantilla = {
  nivelMin: 3,
  gen: () => {
    const A = randomInt(10, 99);
    const B = randomInt(2, 9);
    return { prog: progSimple([decl("a", "int", n(A)), print(op("div", v("a"), n(B)), op("mod", v("a"), n(B)))]) };
  },
};

// ---------- nivel 4: condicionales y lógica ----------
const siDoble: Plantilla = {
  nivelMin: 4,
  gen: () => {
    const [x] = nombresVar(1);
    const X = randomInt(3, 30);
    const umbral = randomInt(5, 20);
    const cmp = elegir([">", "<", ">=", "<="] as const);
    const prog = progSimple([
      decl(x, "int", n(X)),
      si(op(cmp, v(x), n(umbral)), [print(s("alto"))], [print(s("bajo"))]),
      si(op("==", op("mod", v(x), n(2)), n(0)), [print(s("par"))], [print(s("impar"))]),
    ]);
    const combos = ["alto", "bajo"].flatMap((p) => ["par", "impar"].map((q) => `${p}\n${q}`));
    return { prog, extras: combos };
  },
};

const tresVias: Plantilla = {
  nivelMin: 4,
  gen: () => {
    const [x] = nombresVar(1);
    const bajo = randomInt(5, 12);
    const alto = bajo + randomInt(6, 12);
    const X = randomInt(1, alto + 8);
    const prog = progSimple([
      decl(x, "int", n(X)),
      si(op("<", v(x), n(bajo)), [print(s("bajo"))], [si(op("<", v(x), n(alto)), [print(s("medio"))], [print(s("alto"))])]),
    ]);
    return { prog, extras: ["bajo", "medio", "alto"] };
  },
};

const logicos: Plantilla = {
  nivelMin: 4,
  gen: () => {
    const A = randomInt(1, 9);
    const B = randomInt(1, 9);
    const C = randomInt(1, 9);
    const D = randomInt(1, 9);
    const prog = progSimple([
      decl("a", "int", n(A)),
      decl("b", "int", n(B)),
      print(op("y", op(">", v("a"), n(C)), op("<", v("b"), n(D)))),
      print(op("o", op(">", v("a"), n(C)), op("<", v("b"), n(D)))),
    ]);
    return { prog, extras: [] };
  },
};

// ---------- nivel 5: bucles, funciones, arreglos ----------
const sumaFor: Plantilla = {
  nivelMin: 5,
  gen: () => {
    const [t] = nombresVar(1);
    const desde = randomInt(1, 3);
    const hasta = desde + randomInt(3, 6);
    return { prog: progSimple([decl(t, "int", n(0)), para("i", n(desde), n(hasta), [asig(t, op("+", v(t), v("i")))]), print(v(t))]) };
  },
};

const whileCuenta: Plantilla = {
  nivelMin: 5,
  gen: () => {
    const [c] = nombresVar(1);
    const paso = randomInt(2, 4);
    const N = paso * randomInt(3, 6) + randomInt(0, paso - 1);
    return {
      prog: progSimple([
        decl("n", "int", n(N)),
        decl(c, "int", n(0)),
        mientras(op(">", v("n"), n(0)), [asig("n", n(paso), "-"), asig(c, n(1), "+")]),
        print(v(c)),
        print(v("n")),
      ]),
    };
  },
};

const forImprime: Plantilla = {
  nivelMin: 5,
  gen: () => {
    const k = randomInt(2, 5);
    const desde = randomInt(1, 3);
    const hasta = desde + randomInt(3, 4);
    return { prog: progSimple([para("i", n(desde), n(hasta), [print(op("*", v("i"), n(k)))])]) };
  },
};

const funcLineal: Plantilla = {
  nivelMin: 5,
  gen: () => {
    const nombre = elegir(["doble", "triple", "puntaje", "bono"]);
    const k = randomInt(2, 4);
    const c = randomInt(1, 5);
    const f: Func = { nombre, params: [{ n: "x", ty: "int" }], ret: "int", cuerpo: [retorna(op("+", op("*", v("x"), n(k)), n(c)))] };
    const A = randomInt(1, 9);
    const B = randomInt(1, 9);
    return { prog: progSimple([print(call(nombre, n(A)), call(nombre, n(B)))], [f]) };
  },
};

const funcMayor: Plantilla = {
  nivelMin: 5,
  gen: () => {
    const f: Func = {
      nombre: "mayor",
      params: [{ n: "a", ty: "int" }, { n: "b", ty: "int" }],
      ret: "int",
      cuerpo: [si(op(">", v("a"), v("b")), [retorna(v("a"))], [retorna(v("b"))])],
    };
    const A = randomInt(1, 30);
    const B = randomInt(1, 30);
    const C = randomInt(1, 30);
    return { prog: progSimple([print(call("mayor", n(A), n(B))), print(call("mayor", call("mayor", n(A), n(B)), n(C)))], [f]) };
  },
};

const arrSuma: Plantilla = {
  nivelMin: 5,
  gen: () => {
    const len = randomInt(3, 5);
    const items = Array.from({ length: len }, () => randomInt(1, 9));
    return {
      prog: progSimple([
        decl("datos", "arr", arr(...items)),
        decl("suma", "int", n(0)),
        paraCada("x", v("datos"), [asig("suma", v("x"), "+")]),
        print(v("suma"), largo(v("datos"))),
      ]),
    };
  },
};

const arrIndice: Plantilla = {
  nivelMin: 5,
  gen: () => {
    const len = randomInt(4, 6);
    const items = Array.from({ length: len }, () => randomInt(1, 20));
    const i = randomInt(0, len - 2);
    return {
      prog: progSimple([
        decl("datos", "arr", arr(...items)),
        print(ix(v("datos"), n(i))),
        print(ix(v("datos"), op("-", largo(v("datos")), n(1)))),
        print(op("+", ix(v("datos"), n(0)), ix(v("datos"), n(i + 1)))),
      ]),
    };
  },
};

// ---------- nivel 6: anidados, break, funciones con bucles, quirks ----------
const anidados: Plantilla = {
  nivelMin: 6,
  gen: () => {
    const [t] = nombresVar(1);
    const a = randomInt(2, 4);
    const bb = randomInt(2, 3);
    return {
      prog: progSimple([
        decl(t, "int", n(0)),
        para("i", n(1), n(a + 1), [para("j", n(1), n(bb + 1), [asig(t, op("*", v("i"), v("j")), "+")])]),
        print(v(t)),
      ]),
    };
  },
};

const conBreak: Plantilla = {
  nivelMin: 6,
  gen: () => {
    const k = randomInt(3, 7);
    const arranque = randomInt(1, 5);
    return {
      prog: progSimple([
        para("i", n(arranque), n(60), [
          si(op("==", op("mod", v("i"), n(k)), n(0)), [print(v("i")), { k: "romper" }]),
        ]),
        print(s("fin")),
      ]),
    };
  },
};

const contarPares: Plantilla = {
  nivelMin: 6,
  gen: () => {
    const len = randomInt(5, 7);
    const items = Array.from({ length: len }, () => randomInt(1, 20));
    const f: Func = {
      nombre: "contar",
      params: [{ n: "datos", ty: "arr" }],
      ret: "int",
      cuerpo: [
        decl("cont", "int", n(0)),
        paraCada("x", v("datos"), [si(op("==", op("mod", v("x"), n(2)), n(0)), [asig("cont", n(1), "+")])]),
        retorna(v("cont")),
      ],
    };
    return { prog: progSimple([decl("nums", "arr", arr(...items)), print(call("contar", v("nums")))], [f]) };
  },
};

const maximoArr: Plantilla = {
  nivelMin: 6,
  gen: () => {
    const len = randomInt(4, 6);
    const items = Array.from({ length: len }, () => randomInt(1, 40));
    return {
      prog: progSimple([
        decl("datos", "arr", arr(...items)),
        decl("mayor", "int", ix(v("datos"), n(0))),
        paraCada("x", v("datos"), [si(op(">", v("x"), v("mayor")), [asig("mayor", v("x"))])]),
        print(v("mayor")),
      ]),
    };
  },
};

const factorialFor: Plantilla = {
  nivelMin: 6,
  gen: () => {
    const N = randomInt(3, 6);
    const f: Func = {
      nombre: "factorial",
      params: [{ n: "n", ty: "int" }],
      ret: "int",
      cuerpo: [decl("r", "int", n(1)), para("i", n(2), op("+", v("n"), n(1)), [asig("r", v("i"), "*")]), retorna(v("r"))],
    };
    return { prog: progSimple([print(call("factorial", n(N)))], [f]) };
  },
};

// Quirk curado #1: división entera y módulo con negativos (Python usa
// piso; Java/JS/TS truncan hacia cero). La respuesta sale del
// intérprete con la semántica REAL de cada lenguaje.
const quirkDivModNeg: Plantilla = {
  nivelMin: 6,
  gen: () => {
    const B = randomInt(2, 5);
    let A = randomInt(5, 20);
    if (A % B === 0) A += 1;
    return { prog: progSimple([print(op("div", n(-A), n(B))), print(op("mod", n(-A), n(B)))]) };
  },
};

// Quirk curado #2 (Java/JS/TS): concatenación vs suma según el orden.
const quirkConcat: Plantilla = {
  nivelMin: 6,
  langs: ["java", "javascript", "typescript"],
  gen: () => {
    const A = randomInt(1, 9);
    const B = randomInt(1, 9);
    const C = randomInt(1, 9);
    return {
      prog: progSimple([print(op("+", op("+", n(A), n(B)), s(String(C)))), print(op("+", op("+", s(String(A)), n(B)), n(C)))]),
    };
  },
};

// Quirk curado #3 (solo JavaScript): coerción básica y == vs ===.
const quirkCoercion: Plantilla = {
  nivelMin: 6,
  langs: ["javascript"],
  gen: () => {
    const A = randomInt(2, 9);
    const B = randomInt(1, 5);
    return {
      prog: progSimple([
        print(op("+", s(String(A)), n(B))),
        print(op("-", s(String(A)), n(B))),
        print(op("eqLaxo", s(String(A)), n(A))),
        print(op("==", s(String(A)), n(A))),
      ]),
      extras: [],
    };
  },
};

// Quirk curado #4 (solo Python): repetición de cadenas.
const quirkRepeticion: Plantilla = {
  nivelMin: 6,
  langs: ["python"],
  gen: () => {
    const p = elegir(["ab", "xy", "ha", "no"]);
    const k = randomInt(2, 4);
    return { prog: progSimple([decl("r", "str", op("*", s(p), n(k))), print(v("r")), print(largo(v("r"), "str"))]) };
  },
};

const PLANTILLAS: Plantilla[] = [
  aritmetica, reasignar, cadena, intercambio, divmodPositivo,
  siDoble, tresVias, logicos,
  sumaFor, whileCuenta, forImprime, funcLineal, funcMayor, arrSuma, arrIndice,
  anidados, conBreak, contarPares, maximoArr, factorialFor, quirkDivModNeg, quirkConcat, quirkCoercion, quirkRepeticion,
];

// Las plantillas booleanas necesitan extras con el formato del lenguaje
// (True/False en Python): se calculan al generar.
function extrasLogicos(lang: Lenguaje): string[] {
  const f = (x: boolean) => formatoValor(x, lang);
  const combos: string[] = [];
  for (const p of [true, false]) for (const q of [true, false]) combos.push(`${f(p)}\n${f(q)}`);
  return combos;
}

export function generarSalida(lang: Lenguaje, nivelEfectivo: number): ProblemaCodia {
  const candidatas = PLANTILLAS.filter(
    (p) => p.nivelMin <= nivelEfectivo && (p.nivelMax === undefined || nivelEfectivo <= p.nivelMax) && (!p.langs || p.langs.includes(lang))
  );
  // Las de nivel más alto pesan más para no repetir siempre lo básico.
  const maxNivel = Math.max(...candidatas.map((c) => c.nivelMin));
  const pesadas = candidatas.flatMap((c) => (c.nivelMin === maxNivel ? [c, c] : [c]));
  const pl = elegir(pesadas);
  const bo = pl.gen(lang);
  if (pl === logicos) bo.extras = extrasLogicos(lang);
  return finalizarSalida("salida", lang, bo);
}

