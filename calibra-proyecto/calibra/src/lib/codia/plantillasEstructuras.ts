import {
  arr, asig, call, decl, ds, dsDecl, exec, mientras, n, op, para, paraCada, print, retorna, s, si, txt, v,
  type E, type Func, type Lenguaje, type Prog, type SId,
} from "./tipos";
import { interpretar, textoSalida } from "./interprete";
import { ensamblar, renderizar, textoCodigo } from "./render";
import { armarOpciones, elegir, mezclar, randomInt } from "./util";
import { finalizarSalida, progSimple, type Borrador } from "./plantillasSalida";
import type { ClaseComplejidad, ProblemaCodia } from "./problema";

const no = (a: E): E => ({ k: "no", a });

// ---------- T1: operaciones sobre estructuras ----------
function valores(k: number, min = 1, max = 9): number[] {
  const usados = new Set<number>();
  while (usados.size < k) usados.add(randomInt(min, max));
  return mezclar([...usados]);
}

const pilaBasica = (): Borrador => {
  const vals = valores(randomInt(3, 4));
  const pops = randomInt(1, 2);
  const main: SId[] = [dsDecl("pila", "pila"), ...vals.map((x) => exec(ds("pila", "apilar", n(x))))];
  for (let i = 0; i < pops; i++) main.push(decl(`sale${i + 1}`, "int", ds("pila", "desapilar")), print(v(`sale${i + 1}`)));
  main.push(print(ds("pila", "tope"), ds("pila", "tam")));
  return { prog: progSimple(main) };
};

const colaBasica = (): Borrador => {
  const vals = valores(randomInt(3, 4));
  const outs = randomInt(1, 2);
  const main: SId[] = [dsDecl("cola", "cola"), ...vals.map((x) => exec(ds("cola", "encolar", n(x))))];
  for (let i = 0; i < outs; i++) main.push(decl(`sale${i + 1}`, "int", ds("cola", "desencolar")), print(v(`sale${i + 1}`)));
  main.push(print(ds("cola", "frente"), ds("cola", "tam")));
  return { prog: progSimple(main) };
};

const listaOps = (): Borrador => {
  const vals = valores(randomInt(3, 4), 1, 20);
  const main: SId[] = [dsDecl("lista", "lista"), ...vals.map((x) => exec(ds("lista", "agregar", n(x))))];
  main.push(print(ds("lista", "obt", n(1))), print(ds("lista", "tam")), print(ds("lista", "obt", op("-", ds("lista", "tam"), n(1)))));
  return { prog: progSimple(main) };
};

const conjunto = (): Borrador => {
  const base = valores(3, 1, 6);
  const con = [...base, base[0], base[1], base[0]];
  const main: SId[] = [dsDecl("conj", "conj"), ...con.map((x) => exec(ds("conj", "agregar", n(x))))];
  main.push(print(ds("conj", "tam")), print(ds("conj", "tiene", n(base[2]))), print(ds("conj", "tiene", n(10))));
  return { prog: progSimple(main) };
};

const mapa = (): Borrador => {
  const [k1, k2] = mezclar(["ana", "luis", "marta", "pablo"]).slice(0, 2);
  const [a, b2, c] = valores(3, 1, 9);
  const main: SId[] = [
    dsDecl("edades", "mapa"),
    exec(ds("edades", "poner", s(k1), n(a))),
    exec(ds("edades", "poner", s(k2), n(b2))),
    exec(ds("edades", "poner", s(k1), n(c))),
    print(ds("edades", "obt", s(k1)), ds("edades", "obt", s(k2))),
    print(ds("edades", "tam")),
  ];
  return { prog: progSimple(main) };
};

const invertirPila = (): Borrador => {
  const vals = valores(randomInt(3, 5));
  return {
    prog: progSimple([
      decl("datos", "arr", arr(...vals)),
      dsDecl("pila", "pila"),
      paraCada("x", v("datos"), [exec(ds("pila", "apilar", v("x")))]),
      mientras(no(ds("pila", "vacia")), [print(ds("pila", "desapilar"))]),
    ]),
  };
};

const colaTurnos = (): Borrador => {
  const vals = valores(randomInt(3, 4), 1, 9);
  return {
    prog: progSimple([
      dsDecl("cola", "cola"),
      ...vals.map((x) => exec(ds("cola", "encolar", n(x)))),
      mientras(no(ds("cola", "vacia")), [
        decl("x", "int", ds("cola", "desencolar")),
        si(op("==", op("mod", v("x"), n(2)), n(0)), [print(v("x"))], [exec(ds("cola", "encolar", op("+", v("x"), n(1))))]),
      ]),
    ]),
  };
};

const conteoMapa = (): Borrador => {
  const len = randomInt(5, 7);
  const items = Array.from({ length: len }, () => randomInt(1, 12));
  items[0] = 3 * randomInt(1, 4); // garantiza que la clave "c0" exista
  const clave = op("+", s("c"), txt(op("mod", v("x"), n(3))));
  return {
    prog: progSimple([
      decl("datos", "arr", arr(...items)),
      dsDecl("conteo", "mapa"),
      paraCada("x", v("datos"), [
        decl("clave", "str", clave),
        si(
          ds("conteo", "tiene", v("clave")),
          [exec(ds("conteo", "poner", v("clave"), op("+", ds("conteo", "obt", v("clave")), n(1))))],
          [exec(ds("conteo", "poner", v("clave"), n(1)))]
        ),
      ]),
      print(ds("conteo", "obt", s("c0")), ds("conteo", "tam")),
    ]),
  };
};

// ---------- T2: complejidad por la forma del código ----------
// Toda función `contar(n)` suma 1 a `total` en su sentencia de trabajo y
// devuelve `total`: así la cantidad de veces que corre esa línea se puede
// MEDIR ejecutando de verdad con n = 8, 16, 32, 64 (codia.test.ts).
const NS_COMPLEJIDAD = [8, 16, 32, 64];

interface Cuerpo {
  clase: ClaseComplejidad;
  cuerpo: SId[];
}

const trabajo = (): SId => asig("total", n(1), "+");
const arranque = (): SId => decl("total", "int", n(0));
const fin = (): SId => retorna(v("total"));

function cuerposComplejidad(k: number): Record<ClaseComplejidad, () => Cuerpo> {
  const nn = v("n");
  return {
    "O(1)": () =>
      elegir([
        (): Cuerpo => ({ clase: "O(1)", cuerpo: [arranque(), trabajo(), trabajo(), fin()] }),
        (): Cuerpo => ({ clase: "O(1)", cuerpo: [arranque(), para("i", n(0), n(k + 2), [trabajo()]), fin()] }),
      ])(),
    "O(log n)": () =>
      elegir([
        (): Cuerpo => ({ clase: "O(log n)", cuerpo: [arranque(), decl("i", "int", n(1)), mientras(op("<", v("i"), nn), [trabajo(), asig("i", op("*", v("i"), n(2)))]), fin()] }),
        (): Cuerpo => ({ clase: "O(log n)", cuerpo: [arranque(), decl("i", "int", nn), mientras(op(">", v("i"), n(1)), [trabajo(), asig("i", op("div", v("i"), n(2)))]), fin()] }),
      ])(),
    "O(n)": () =>
      elegir([
        (): Cuerpo => ({ clase: "O(n)", cuerpo: [arranque(), para("i", n(0), nn, [trabajo()]), fin()] }),
        (): Cuerpo => ({ clase: "O(n)", cuerpo: [arranque(), para("i", n(0), nn, [trabajo()]), para("j", n(0), nn, [trabajo()]), fin()] }),
        (): Cuerpo => ({ clase: "O(n)", cuerpo: [arranque(), para("i", n(0), nn, [para("j", n(0), n(k), [trabajo()])]), fin()] }),
      ])(),
    "O(n log n)": () => ({
      clase: "O(n log n)",
      cuerpo: [arranque(), para("i", n(0), nn, [decl("j", "int", n(1)), mientras(op("<", v("j"), nn), [trabajo(), asig("j", op("*", v("j"), n(2)))])]), fin()],
    }),
    "O(n²)": () =>
      elegir([
        (): Cuerpo => ({ clase: "O(n²)", cuerpo: [arranque(), para("i", n(0), nn, [para("j", n(0), nn, [trabajo()])]), fin()] }),
        (): Cuerpo => ({ clase: "O(n²)", cuerpo: [arranque(), para("i", n(0), nn, [para("j", n(0), v("i"), [trabajo()])]), fin()] }),
        (): Cuerpo => ({ clase: "O(n²)", cuerpo: [arranque(), para("i", n(0), nn, [trabajo()]), para("i", n(0), nn, [para("j", n(0), nn, [trabajo()])]), fin()] }),
      ])(),
    "O(n³)": () => ({
      clase: "O(n³)",
      cuerpo: [arranque(), para("i", n(0), nn, [para("j", n(0), nn, [para("k", n(0), nn, [trabajo()])])]), fin()],
    }),
  };
}

const ORDEN_CLASES: ClaseComplejidad[] = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)"];

function funcionContar(cuerpo: SId[]): Func {
  return { nombre: "contar", params: [{ n: "n", ty: "int" }], ret: "int", cuerpo };
}

export function generarComplejidadClase(lang: Lenguaje, nivelEfectivo: number): ProblemaCodia {
  const clases: ClaseComplejidad[] = nivelEfectivo >= 10 ? [...ORDEN_CLASES] : ["O(1)", "O(n)", "O(n²)"];
  const clase = elegir(clases);
  const k = randomInt(2, 3);
  const { cuerpo } = cuerposComplejidad(k)[clase]();
  const f = funcionContar(cuerpo);
  const progDisplay: Prog = { funcs: [f], main: [] };
  const progExec: Prog = { funcs: [f], main: NS_COMPLEJIDAD.map((x) => print(call("contar", n(x)))) };
  const res = interpretar(progExec, { lang, limitePasos: 60_000_000 });
  if (res.fallo) throw new Error("complejidad: el programa falló");
  const stdout = textoSalida(res);
  const render = renderizar(progDisplay, lang);
  const renderExec = renderizar(progExec, lang);
  const { codigo } = ensamblar(lang, renderExec.lineas, renderExec.nImports, renderExec.nFuncs);

  const idx = ORDEN_CLASES.indexOf(clase);
  const dist0 = ORDEN_CLASES.filter((c) => c !== clase).map((c) => ({ c, d: Math.abs(ORDEN_CLASES.indexOf(c) - idx) + randomInt(0, 99) / 100 }));
  const otros = dist0.sort((x, y) => x.d - y.d).map((x) => x.c);
  const dist = otros.slice(0, 3);
  return {
    modo: "estructuras",
    entrada: "opciones",
    lenguaje: lang,
    enunciado: "La línea que suma 1 a total es la operación que cuenta. ¿Cuál es la complejidad temporal de contar(n) en función de n?",
    codigo: textoCodigo(render).replace(/\n+$/, ""),
    opciones: armarOpciones(clase, dist),
    respuesta: clase,
    verificacion: { tipo: "complejidad", ejecutable: codigo, stdout, clase, ns: NS_COMPLEJIDAD },
  };
}

// "¿Cuántas veces corre la línea?": conteo exacto con n chico.
function contarVeces(): Borrador {
  const N = randomInt(3, 6);
  const variante = randomInt(0, 3);
  let cuerpo: SId[];
  if (variante === 0) cuerpo = [arranque(), para("i", n(0), v("n"), [para("j", n(0), v("n"), [trabajo()])]), fin()];
  else if (variante === 1) cuerpo = [arranque(), para("i", n(0), v("n"), [para("j", n(0), v("i"), [trabajo()])]), fin()];
  else if (variante === 2) cuerpo = [arranque(), para("i", n(0), v("n"), [trabajo()]), para("j", n(0), v("n"), [trabajo()]), fin()];
  else cuerpo = [arranque(), para("i", n(1), v("n"), [para("j", n(0), n(2), [trabajo()])]), fin()];
  return { prog: progSimple([print(call("contar", n(N)))], [funcionContar(cuerpo)]) };
}

const T1: Array<{ nivelMin: number; gen: () => Borrador }> = [
  { nivelMin: 7, gen: pilaBasica },
  { nivelMin: 7, gen: colaBasica },
  { nivelMin: 7, gen: listaOps },
  { nivelMin: 8, gen: conjunto },
  { nivelMin: 8, gen: mapa },
  { nivelMin: 8, gen: contarVeces },
  { nivelMin: 9, gen: invertirPila },
  { nivelMin: 10, gen: colaTurnos },
  { nivelMin: 10, gen: conteoMapa },
];

export function generarEstructuras(lang: Lenguaje, nivelEfectivo: number): ProblemaCodia {
  // Desde nivel 9 la complejidad por forma del código pesa fuerte.
  if (nivelEfectivo >= 9 && randomInt(1, 100) <= (nivelEfectivo === 9 ? 45 : 40)) return generarComplejidadClase(lang, nivelEfectivo);
  const cand = T1.filter((t) => t.nivelMin <= nivelEfectivo);
  const maxN = Math.max(...cand.map((c) => c.nivelMin));
  const pesadas = cand.flatMap((c) => (c.nivelMin === maxN ? [c, c] : [c]));
  const bo = elegir(pesadas).gen();
  const esConteo = bo.prog.funcs.length > 0;
  const p = finalizarSalida("estructuras", lang, bo, esConteo ? "La línea que suma 1 a total corre cada vez que se cumple su bucle. ¿Qué imprime este fragmento?" : "¿Qué imprime este fragmento?");
  return p;
}
