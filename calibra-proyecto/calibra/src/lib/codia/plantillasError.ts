import { arr, asig, call, decl, ix, largo, n, op, para, paraCada, print, retorna, s, si, v, type E, type Func, type Lenguaje, type Prog, type SId } from "./tipos";
import { interpretar, textoSalida } from "./interprete";
import { ensamblar, renderizar, textoCodigo, type Render } from "./render";
import { armarOpciones, elegir, mezclar, nombresVar, randomInt } from "./util";
import type { MutacionError, ProblemaCodia } from "./problema";

// Modo "Encuentra el error". Cada problema parte de un programa CORRECTO
// del IR y le inyecta UN defecto conocido (por construcción sabemos qué
// falla, dónde y con qué consecuencia). codia.test.ts EJECUTA el
// programa con defecto y el corregido en los 4 lenguajes y comprueba:
// la causa real (SyntaxError / NameError / IndexError / ZeroDivisionError
// / TypeError / error de compilación / excepción de Java / salida de JS),
// la línea reportada por el runtime, y que el corregido imprime lo que
// el intérprete predijo.

interface Borrador {
  mutacion: MutacionError;
  progOk: Prog;
  progMal: Prog;
  // Sentencia con el defecto (línea donde el runtime debe reportarlo).
  idError?: string;
  // Defectos de texto (sintaxis/igualdad): devuelven las líneas mutadas y
  // el índice (0-based) de la línea tocada.
  mutarTexto?: (lineas: string[], r: Render) => { lineas: string[]; indice: number } | null;
}

function typo(nombre: string, usados: string[]): string {
  for (let k = nombre.length - 2; k >= 1; k--) {
    const cand = nombre.slice(0, k) + nombre.slice(k + 1);
    if (!usados.includes(cand)) return cand;
  }
  return nombre + "x";
}

function prefacio(): SId[] {
  return randomInt(0, 1) === 1 ? [print(s("inicio"))] : [];
}

// ---------- bases con defecto de ejecución ----------
function baseNombre(): Borrador {
  const [a, bb, t] = nombresVar(3);
  const A = randomInt(2, 12);
  const B = randomInt(2, 12);
  const variante = randomInt(0, 2);
  const pre = prefacio();
  const usados = [a, bb, t, "doble"];
  if (variante === 0) {
    const mk = (nombre: string): Prog => ({
      funcs: [],
      main: [...pre, decl(a, "int", n(A)), decl(bb, "int", n(B)), decl(t, "int", op("+", v(a), v(bb))), { ...print(v(nombre)), id: "e" }],
    });
    return { mutacion: "nombre", progOk: mk(t), progMal: mk(typo(t, usados)), idError: "e" };
  }
  if (variante === 1) {
    const f: Func = { nombre: "doble", params: [{ n: "x", ty: "int" }], ret: "int", cuerpo: [retorna(op("*", v("x"), n(2)))] };
    const mk = (fn: string): Prog => ({
      funcs: [f],
      main: [...pre, decl(a, "int", n(A)), { ...print(call(fn, v(a))), id: "e" }],
    });
    return { mutacion: "nombre", progOk: mk("doble"), progMal: mk("dobl"), idError: "e" };
  }
  const mk = (nombre: string): Prog => ({
    funcs: [],
    main: [...pre, decl(a, "int", n(A)), decl(bb, "int", n(B)), { ...decl(t, "int", op("+", v(a), v(nombre))), id: "e" }, print(v(t))],
  });
  return { mutacion: "nombre", progOk: mk(bb), progMal: mk(typo(bb, usados)), idError: "e" };
}

function baseIndice(): Borrador {
  const len = randomInt(3, 4);
  const items = Array.from({ length: len }, () => randomInt(2, 30));
  const pre = prefacio();
  if (randomInt(0, 1) === 0) {
    const mk = (i: E): Prog => ({
      funcs: [],
      main: [...pre, decl("datos", "arr", arr(...items)), { ...print(ix(v("datos"), i)), id: "e" }],
    });
    const malIdx = randomInt(0, 1) === 0 ? n(len) : largo(v("datos"));
    return { mutacion: "indice", progOk: mk(n(len - 1)), progMal: mk(malIdx), idError: "e" };
  }
  const mk = (limite: E): Prog => ({
    funcs: [],
    main: [
      ...pre,
      decl("datos", "arr", arr(...items)),
      decl("total", "int", n(0)),
      para("i", n(0), limite, [{ ...asig("total", ix(v("datos"), v("i")), "+"), id: "e" }]),
      print(v("total")),
    ],
  });
  return { mutacion: "indice", progOk: mk(largo(v("datos"))), progMal: mk(op("+", largo(v("datos")), n(1))), idError: "e" };
}

function baseDivCero(): Borrador {
  const A = randomInt(6, 40);
  const B = randomInt(2, 6);
  const usaMod = randomInt(0, 1) === 1;
  const pre = prefacio();
  const mk = (divisor: number): Prog => ({
    funcs: [],
    main: [...pre, decl("a", "int", n(A)), decl("b", "int", n(divisor)), { ...print(op(usaMod ? "mod" : "div", v("a"), v("b"))), id: "e" }],
  });
  return { mutacion: "divcero", progOk: mk(B), progMal: mk(0), idError: "e" };
}

function baseTipo(): Borrador {
  const [x, y, t] = nombresVar(3);
  const A = randomInt(2, 9);
  const B = randomInt(2, 9);
  const pre = prefacio();
  const mk = (mal: boolean): Prog => ({
    funcs: [],
    main: [
      ...pre,
      decl(x, "int", n(A)),
      mal ? decl(y, "str", s(String(B))) : decl(y, "int", n(B)),
      { ...decl(t, "int", op("+", v(x), v(y))), id: "e" },
      print(v(t)),
    ],
  });
  return { mutacion: "tipo", progOk: mk(false), progMal: mk(true), idError: "e" };
}

// ---------- bases con defecto de texto ----------
function baseSintaxis(): Borrador {
  const [a, bb, t] = nombresVar(3);
  const A = randomInt(2, 9);
  const B = randomInt(2, 9);
  const K = randomInt(5, 12);
  const prog: Prog = {
    funcs: [],
    main: [
      decl(a, "int", n(A)),
      decl(bb, "int", n(B)),
      decl(t, "int", op("+", v(a), v(bb))),
      si(op(">", v(t), n(K)), [print(s("grande"))], [print(s("chico"))]),
      para("i", n(0), n(randomInt(2, 3)), [print(op("*", v("i"), v(a)))]),
      print(s("fin")),
    ],
  };
  const mutarTexto = (lineas: string[], r: Render) => {
    const cand: number[] = [];
    lineas.forEach((l, i) => {
      const t2 = l.trimEnd();
      if (r.lenguaje === "python" && t2.endsWith(":")) cand.push(i);
      if (r.lenguaje === "java" && t2.endsWith(";") && !t2.trimStart().startsWith("for")) cand.push(i);
      if ((r.lenguaje === "javascript" || r.lenguaje === "typescript") && /^\s*console\.log\("[^"]*"\);$/.test(t2)) cand.push(i);
    });
    if (cand.length === 0) return null;
    const i = elegir(cand);
    const l = lineas[i].trimEnd();
    let nueva: string;
    if (r.lenguaje === "python") nueva = l.slice(0, -1);
    else if (r.lenguaje === "java") nueva = l.slice(0, -1);
    else nueva = l.replace(/"\);$/, ");");
    const copia = [...lineas];
    copia[i] = nueva;
    return { lineas: copia, indice: i };
  };
  return { mutacion: "sintaxis", progOk: prog, progMal: prog, mutarTexto };
}

function baseIgualdad(): Borrador {
  const X = randomInt(2, 9);
  const prog: Prog = {
    funcs: [],
    main: [decl("x", "int", n(X)), si(op("==", v("x"), n(X)), [print(s("igual"))], [print(s("distinto"))])],
  };
  const mutarTexto = (lineas: string[]) => {
    const i = lineas.findIndex((l) => l.includes(" == "));
    if (i < 0) return null;
    const copia = [...lineas];
    copia[i] = copia[i].replace(" == ", " = ");
    return { lineas: copia, indice: i };
  };
  return { mutacion: "igualdad", progOk: prog, progMal: prog, mutarTexto };
}

// ---------- bases con defecto lógico (E3) ----------
interface BaseLogica {
  progOk: Prog;
  mutaciones: { prog: Prog; desc: string }[]; // defectos aplicables
  falsas: string[]; // enunciados que NO valen para este código
}

function baseSuma(): BaseLogica {
  const [t] = nombresVar(1);
  const N = randomInt(4, 8);
  const mk = (o: { hasta?: number; reinicia?: boolean; resta?: boolean; inicio?: number }): Prog => ({
    funcs: [],
    main: [
      decl(t, "int", n(o.inicio ?? 0)),
      para("i", n(1), n(o.hasta ?? N + 1), [...(o.reinicia ? [asig(t, n(0))] : []), o.resta ? asig(t, op("-", v(t), v("i"))) : asig(t, op("+", v(t), v("i")))]),
      print(v(t)),
    ],
  });
  return {
    progOk: mk({}),
    mutaciones: [
      { prog: mk({ hasta: N }), desc: `El bucle se detiene un número antes: nunca suma el ${N}` },
      { prog: mk({ reinicia: true }), desc: `${t} se reinicia a 0 en cada vuelta, así que solo queda el último valor` },
      { prog: mk({ resta: true }), desc: `En el bucle se resta i en vez de sumarlo` },
      { prog: mk({ inicio: 1 }), desc: `${t} empieza en 1 en vez de empezar en 0` },
    ],
    falsas: [],
  };
}

function baseMaximo(): BaseLogica {
  let items: number[] = [];
  for (let intento = 0; intento < 50; intento++) {
    items = mezclar(Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, randomInt(4, 5));
    const max = Math.max(...items);
    if (items[0] !== max && items[items.length - 1] !== max && items[0] !== Math.min(...items)) break;
  }
  const mk = (o: { cmp?: "<" | ">"; sinActualizar?: boolean }): Prog => ({
    funcs: [],
    main: [
      decl("datos", "arr", arr(...items)),
      decl("mayor", "int", ix(v("datos"), n(0))),
      paraCada("x", v("datos"), [si(op(o.cmp ?? ">", v("x"), v("mayor")), [asig("mayor", o.sinActualizar ? v("mayor") : v("x"))])]),
      print(v("mayor")),
    ],
  });
  // `x` fuera del bucle no existe en Java/JS: la variante "imprimeX" se
  // arma dentro del bucle en su lugar.
  const imprimeUltimo: Prog = {
    funcs: [],
    main: [
      decl("datos", "arr", arr(...items)),
      decl("mayor", "int", ix(v("datos"), n(0))),
      paraCada("x", v("datos"), [si(op(">", v("x"), v("mayor")), [asig("mayor", v("x"))]), print(v("x"))]),
    ],
  };
  return {
    progOk: mk({}),
    mutaciones: [
      { prog: mk({ cmp: "<" }), desc: "La comparación está invertida: busca el menor en vez del mayor" },
      { prog: mk({ sinActualizar: true }), desc: "Dentro del if se asigna mayor a sí mismo, así que nunca se actualiza" },
      { prog: imprimeUltimo, desc: "Se imprime x dentro del bucle, en vez de imprimir mayor al final" },
    ],
    falsas: ["La variable mayor no se inicializa antes del bucle"],
  };
}

function baseParesLogica(): BaseLogica {
  const items = Array.from({ length: randomInt(5, 7) }, () => randomInt(1, 30));
  const mk = (o: { resto?: number; suma?: boolean; divisor?: number }): Prog => ({
    funcs: [],
    main: [
      decl("cont", "int", n(0)),
      decl("datos", "arr", arr(...items)),
      paraCada("x", v("datos"), [
        si(op("==", op("mod", v("x"), n(o.divisor ?? 2)), n(o.resto ?? 0)), [o.suma ? asig("cont", v("x"), "+") : asig("cont", n(1), "+")]),
      ]),
      print(v("cont")),
    ],
  });
  return {
    progOk: mk({}),
    mutaciones: [
      { prog: mk({ resto: 1 }), desc: "La condición cuenta los impares en vez de los pares" },
      { prog: mk({ suma: true }), desc: "Se suma x a cont en vez de sumar 1" },
      { prog: mk({ divisor: 3 }), desc: "Se pregunta por múltiplos de 3 en vez de por números pares" },
    ],
    falsas: ["La variable cont no se inicializa en 0 antes del bucle"],
  };
}

// ---------- etiquetas de consecuencia (E1) ----------
export function etiquetaConsecuencia(lang: Lenguaje, m: MutacionError, valorFinal = ""): string {
  const py = lang === "python";
  const java = lang === "java";
  const ts = lang === "typescript";
  switch (m) {
    case "sintaxis":
      return py ? "SyntaxError: el programa ni siquiera empieza a ejecutarse" : java ? "Error de compilación: falta un punto y coma" : ts ? "Error de compilación: hay una cadena de texto sin cerrar" : "SyntaxError: el programa ni siquiera empieza a ejecutarse";
    case "nombre":
      return py ? "NameError: usa un nombre que no existe" : java ? "Error de compilación: símbolo no encontrado (nombre no declarado)" : ts ? "Error de compilación: nombre no encontrado" : "ReferenceError: usa un nombre que no existe";
    case "indice":
      return py ? "IndexError: índice fuera de rango" : java ? "Compila, pero lanza ArrayIndexOutOfBoundsException" : `No falla: imprime ${valorFinal}`;
    case "divcero":
      return py ? "ZeroDivisionError: división por cero" : java ? "Compila, pero lanza ArithmeticException (/ by zero)" : `No falla: imprime ${valorFinal}`;
    case "tipo":
      return py ? "TypeError: mezcla tipos incompatibles" : java ? "Error de compilación: tipos incompatibles" : ts ? "Error de compilación: string no es asignable a number" : `No falla: concatena en vez de sumar (imprime ${valorFinal})`;
    case "igualdad":
      return py ? etiquetaConsecuencia(lang, "sintaxis") : etiquetaConsecuencia(lang, "tipo");
    default:
      return "";
  }
}

const GENERICAS: Record<Lenguaje, string[]> = {
  python: ["KeyError: clave inexistente", "AttributeError: atributo inexistente", "RecursionError: recursión infinita"],
  java: ["Compila, pero lanza NullPointerException", "Compila, pero lanza StackOverflowError", "Compila y funciona: imprime un resultado incorrecto"],
  javascript: ["RangeError: valor fuera de rango permitido", "TypeError: intenta llamar algo que no es una función", "Se cuelga en un bucle infinito"],
  typescript: ["Error de compilación: falta un punto y coma", "Error de compilación: falta un import", "Se cuelga en un bucle infinito"],
};

const KINDS_POR_LANG: Record<Lenguaje, MutacionError[]> = {
  python: ["sintaxis", "nombre", "indice", "divcero", "tipo"],
  java: ["sintaxis", "nombre", "indice", "divcero", "tipo"],
  javascript: ["sintaxis", "nombre", "indice", "divcero", "tipo"],
  typescript: ["sintaxis", "nombre", "indice", "divcero", "tipo"],
};

// ---------- construcción ----------
function crearBase(m: MutacionError): Borrador {
  if (m === "nombre") return baseNombre();
  if (m === "indice") return baseIndice();
  if (m === "divcero") return baseDivCero();
  if (m === "tipo") return baseTipo();
  if (m === "igualdad") return baseIgualdad();
  return baseSintaxis();
}

function kindsAplicables(lang: Lenguaje, nivel: number, forma: "consecuencia" | "linea"): MutacionError[] {
  let base: MutacionError[] = ["sintaxis", "nombre", "indice", "divcero"];
  if (nivel >= 6) base = [...base, "tipo"];
  if (nivel >= 6 && (lang === "python" || lang === "java")) base.push("igualdad");
  if (forma === "linea") {
    // Solo defectos cuya línea reporta el runtime de forma inequívoca.
    base = base.filter((k) => {
      if (lang === "javascript") return k === "sintaxis" || k === "nombre";
      if (lang === "typescript") return k === "sintaxis" || k === "nombre" || k === "tipo";
      return true;
    });
  }
  return base;
}

function generarConsecuenciaOLinea(lang: Lenguaje, nivel: number, forma: "consecuencia" | "linea", intento = 0): ProblemaCodia {
  const m = elegir(kindsAplicables(lang, nivel, forma));
  const bo = crearBase(m);
  const render = renderizar(bo.progMal, lang);
  let lineas = render.lineas;
  let indiceTexto: number | null = null;
  if (bo.mutarTexto) {
    const r = bo.mutarTexto(render.lineas, render);
    if (!r) return generarConsecuenciaOLinea(lang, nivel, forma, intento + 1);
    lineas = r.lineas;
    indiceTexto = r.indice;
  }
  const { codigo, mapa } = ensamblar(lang, lineas, render.nImports, render.nFuncs);
  const renderOk = renderizar(bo.progOk, lang);
  const ok = ensamblar(lang, renderOk.lineas, renderOk.nImports, renderOk.nFuncs);
  const resOk = interpretar(bo.progOk, { lang });
  if (resOk.fallo) throw new Error("programa correcto de error-mode falló");
  const stdoutOk = textoSalida(resOk);

  // Salida predicha del defectuoso cuando llega a ejecutarse sin fallar.
  let stdoutMal: string | null = null;
  let valorFinal = "";
  if (!bo.mutarTexto) {
    const resMal = interpretar(bo.progMal, { lang });
    if (!resMal.fallo) {
      stdoutMal = textoSalida(resMal);
      valorFinal = resMal.salida[resMal.salida.length - 1] ?? "";
    }
  }
  // JS/TS: el intérprete reproduce la coerción (tipo -> concatena).
  if ((lang === "javascript") && m === "tipo") {
    const resMal = interpretar(bo.progMal, { lang });
    stdoutMal = textoSalida(resMal);
    valorFinal = resMal.salida[resMal.salida.length - 1] ?? "";
  }

  const indicePantalla = indiceTexto !== null ? indiceTexto : bo.idError ? render.lineaDe[bo.idError] - 1 : null;
  const lineaPantalla = indicePantalla !== null ? indicePantalla + 1 : null;
  const lineaEjecutable = indicePantalla !== null ? mapa[indicePantalla] : null;

  const codigoMostrado = lineas.join("\n").replace(/\n+$/, "");
  let enunciado: string;
  let respuesta: string;
  let opciones: string[];

  if (forma === "consecuencia") {
    enunciado = "¿Qué ocurre al ejecutar este código?";
    respuesta = etiquetaConsecuencia(lang, m, valorFinal);
    const pool = KINDS_POR_LANG[lang]
      .filter((k) => k !== m)
      .map((k) => etiquetaConsecuencia(lang, k, k === "tipo" ? "57" : k === "indice" ? "undefined" : "Infinity"));
    const dist = mezclar([...pool, ...GENERICAS[lang]]).filter((t) => t !== respuesta);
    // Para JS/TS un "No falla: imprime X" ajeno solo es plausible si difiere en el valor.
    opciones = armarOpciones(respuesta, dist.slice(0, 3));
  } else {
    enunciado = "Este fragmento falla. ¿En qué línea está el error?";
    respuesta = `Línea ${lineaPantalla}`;
    const lineasCodigo = codigoMostrado.split("\n").map((l, i) => ({ l, i: i + 1 })).filter((x) => x.l.trim() !== "" && !/^\s*[})]?\s*(else\s*\{)?\s*$/.test(x.l) && x.i !== lineaPantalla);
    // Con muy pocas líneas de código la pregunta no tiene gracia: reintenta con otro defecto.
    if (lineasCodigo.length < 3) return generarConsecuenciaOLinea(lang, nivel, intento >= 12 ? "consecuencia" : forma, intento + 1);
    const otros = mezclar(lineasCodigo.map((x) => x.i)).slice(0, 3);
    opciones = armarOpciones(respuesta, otros.map((i) => `Línea ${i}`));
  }

  return {
    modo: "error",
    entrada: "opciones",
    lenguaje: lang,
    enunciado,
    codigo: codigoMostrado,
    opciones,
    respuesta,
    verificacion: {
      tipo: "error",
      forma,
      mutacion: m,
      ejecutable: codigo,
      ejecutableOk: ok.codigo,
      stdoutOk,
      stdoutMal,
      lineaEjecutable,
      lineaPantalla,
    },
  };
}

function generarLogica(lang: Lenguaje, nivel: number): ProblemaCodia {
  const bases = nivel >= 8 ? [baseSuma, baseParesLogica, baseMaximo] : [baseSuma, baseParesLogica];
  for (let intento = 0; intento < 30; intento++) {
    const base = elegir(bases)();
    const okRes = interpretar(base.progOk, { lang });
    const mut = elegir(base.mutaciones);
    const malRes = interpretar(mut.prog, { lang });
    if (okRes.fallo || malRes.fallo) continue;
    const okTxt = textoSalida(okRes);
    const malTxt = textoSalida(malRes);
    if (okTxt === malTxt) continue;
    const otrasDescs = [...base.mutaciones.filter((m) => m !== mut).map((m) => m.desc), ...base.falsas];
    const renderMal = renderizar(mut.prog, lang);
    const renderOk = renderizar(base.progOk, lang);
    const ej = ensamblar(lang, renderMal.lineas, renderMal.nImports, renderMal.nFuncs);
    const ok = ensamblar(lang, renderOk.lineas, renderOk.nImports, renderOk.nFuncs);
    return {
      modo: "error",
      entrada: "opciones",
      lenguaje: lang,
      enunciado: `Este fragmento debería imprimir ${okTxt.includes("\n") ? "\n" + okTxt : okTxt}, pero imprime ${malTxt.includes("\n") ? "\n" + malTxt : malTxt}. ¿Cuál es el error?`,
      codigo: textoCodigo(renderMal),
      opciones: armarOpciones(mut.desc, mezclar(otrasDescs).slice(0, 3)),
      respuesta: mut.desc,
      verificacion: {
        tipo: "error",
        forma: "logica",
        mutacion: "logica",
        ejecutable: ej.codigo,
        ejecutableOk: ok.codigo,
        stdoutOk: okTxt,
        stdoutMal: malTxt,
        lineaEjecutable: null,
        lineaPantalla: null,
      },
    };
  }
  throw new Error("no se pudo generar un problema lógico");
}

export function generarError(lang: Lenguaje, nivelEfectivo: number): ProblemaCodia {
  if (nivelEfectivo <= 5) return generarConsecuenciaOLinea(lang, nivelEfectivo, "consecuencia");
  const dado = randomInt(1, 100);
  if (nivelEfectivo === 6) return dado <= 60 ? generarConsecuenciaOLinea(lang, 6, "consecuencia") : generarConsecuenciaOLinea(lang, 6, "linea");
  if (nivelEfectivo === 7) {
    if (dado <= 20) return generarConsecuenciaOLinea(lang, 7, "consecuencia");
    if (dado <= 70) return generarConsecuenciaOLinea(lang, 7, "linea");
    return generarLogica(lang, 7);
  }
  if (dado <= 20) return generarConsecuenciaOLinea(lang, 8, "consecuencia");
  if (dado <= 55) return generarConsecuenciaOLinea(lang, 8, "linea");
  return generarLogica(lang, 8);
}

