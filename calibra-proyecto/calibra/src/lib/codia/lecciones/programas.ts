import {
  arr, asig, call, conId, decl, ds, dsDecl, exec, ix, largo, mientras, n, op, para, paraCada, print, retorna, s, si, v,
  type Func, type Prog, type SId,
} from "../tipos";
import type { SerieCrecimiento } from "../visuales";

// Programas del IR (el mismo que arma la práctica, src/lib/codia/tipos.ts)
// que usan los visuales "codia.traza", "codia.comparar", "codia.flujo" y
// "codia.crecimiento" de las lecciones. Se renderizan y se ejecutan de
// verdad (visualesDatos.ts): nunca se tipea a mano un código, una salida
// ni una tabla de variables para un visual. Cada programa reproduce el
// ejemplo del paso de la lección al que acompaña (mismos nombres y
// mismos números).
//
// Los ids ("s1", "f2"...) marcan las sentencias que la traza resalta;
// una sentencia sin id se ejecuta pero no genera fila en la traza.

function prog(main: SId[], funcs: Func[] = []): Prog {
  return { funcs, main };
}

const romper = (): SId => ({ k: "romper" });
const com = (texto: string): SId => ({ k: "com", t: texto });

// ======================= codia.traza / codia.flujo =======================

// Técnica 1: a=3, b=4, a=a+b, b=a-b -> 7 3 (la tabla de seguimiento).
export const TRAZA_TABLA_SEGUIMIENTO: Prog = prog([
  conId("s1", decl("a", "int", n(3))),
  conId("s2", decl("b", "int", n(4))),
  conId("s3", asig("a", op("+", v("a"), v("b")))),
  conId("s4", asig("b", op("-", v("a"), v("b")))),
  conId("s5", print(v("a"), v("b"))),
]);

// Técnica 1: la trampa de intercambiar sin variable temporal -> 2 2.
export const TRAZA_INTERCAMBIO_ROTO: Prog = prog([
  conId("s1", decl("a", "int", n(1))),
  conId("s2", decl("b", "int", n(2))),
  conId("s3", asig("a", v("b"))),
  conId("s4", asig("b", v("a"))),
  conId("s5", print(v("a"), v("b"))),
]);

// Técnica 2: el límite superior de un for con rango no se incluye (2, 3, 4, 5).
export const TRAZA_FOR_RANGO: Prog = prog([conId("s1", para("i", n(2), n(6), [conId("s2", print(v("i")))]))]);

// Técnica 2: while que reduce n a la mitad (20 -> 10 -> 5 -> 2 -> 1): 4 vueltas.
export const TRAZA_WHILE_MITAD: Prog = prog([
  conId("s1", decl("n", "int", n(20))),
  conId("s2", decl("vueltas", "int", n(0))),
  conId(
    "s3",
    mientras(op(">", v("n"), n(1)), [
      conId("s4", asig("n", op("div", v("n"), n(2)))),
      conId("s5", asig("vueltas", op("+", v("vueltas"), n(1)))),
    ])
  ),
  conId("s6", print(v("vueltas"), v("n"))),
]);

// Técnica 2: acumulador con for (2 + 4 + 6 + 8 = 20).
export const TRAZA_BUCLE_ACUMULADOR: Prog = prog([
  conId("s1", decl("total", "int", n(0))),
  conId("s2", para("i", n(1), n(5), [conId("s3", asig("total", op("+", v("total"), op("*", v("i"), n(2)))))])),
  conId("s4", print(v("total"))),
]);

// Técnica 4: el resto como ciclo (i % 3 da 0, 1, 2, 0, 1, 2).
export const TRAZA_RESTO_CICLO: Prog = prog([conId("s1", para("i", n(0), n(6), [conId("s2", print(op("mod", v("i"), n(3))))]))]);

// Técnica 5: dos bucles anidados sobre n = 3 -> 9 vueltas del cuerpo, O(n²).
const contarAnidadoN3: Func = {
  nombre: "contar",
  params: [{ n: "n", ty: "int" }],
  ret: "int",
  cuerpo: [
    conId("f1", decl("total", "int", n(0))),
    conId(
      "f2",
      para("i", n(0), v("n"), [conId("f3", para("j", n(0), v("n"), [conId("f4", asig("total", op("+", v("total"), n(1))))]))])
    ),
    conId("f5", retorna(v("total"))),
  ],
};
export const TRAZA_COMPLEJIDAD_ANIDADA: Prog = prog([conId("m1", print(call("contar", n(3))))], [contarAnidadoN3]);

// Clase 1: asignar es guardar, no comparar (10 -> 15 -> 30).
export const TRAZA_PUNTOS: Prog = prog([
  conId("s1", decl("puntos", "int", n(10))),
  conId("s2", asig("puntos", op("+", v("puntos"), n(5)))),
  conId("s3", asig("puntos", op("*", v("puntos"), n(2)))),
  conId("s4", print(v("puntos"))),
]);

// Clase 1: precio de una compra (8 * 3 = 24, menos 4 = 20).
export const TRAZA_COMPRA: Prog = prog([
  conId("s1", decl("precio", "int", n(8))),
  conId("s2", decl("cantidad", "int", n(3))),
  conId("s3", decl("total", "int", op("*", v("precio"), v("cantidad")))),
  conId("s4", decl("descuento", "int", n(4))),
  conId("s5", asig("total", op("-", v("total"), v("descuento")))),
  conId("s6", print(v("total"))),
]);

// Clase 1: repetir un texto con * (solo Python): "ab" * 3 -> ababab, largo 6.
export const TRAZA_REPETIR_TEXTO: Prog = prog([
  conId("s1", decl("r", "str", op("*", s("ab"), n(3)))),
  conId("s2", print(v("r"))),
  conId("s3", print(largo(v("r"), "str"))),
]);

// Clase 2: if / else con x = 7.
export const FLUJO_IF_ELSE: Prog = prog([
  conId("s1", decl("x", "int", n(7))),
  conId("s2", si(op(">", v("x"), n(5)), [conId("s3", print(s("grande")))], [conId("s4", print(s("chico")))])),
]);

// Clase 2: varias ramas con nota = 72: gana la PRIMERA condición verdadera (B).
export const FLUJO_NOTA: Prog = prog([
  conId("s1", decl("nota", "int", n(72))),
  conId(
    "s2",
    si(
      op(">=", v("nota"), n(90)),
      [conId("s3", print(s("A")))],
      [conId("s4", si(op(">=", v("nota"), n(70)), [conId("s5", print(s("B")))], [conId("s6", print(s("C")))]))]
    )
  ),
]);

// Clase 2: ejemplo resuelto del estado según la temperatura (24 -> templado).
export const FLUJO_TEMPERATURA: Prog = prog([
  conId("s1", decl("temp", "int", n(24))),
  conId("s2", decl("estado", "str", s(""))),
  conId(
    "s3",
    si(
      op(">", v("temp"), n(30)),
      [conId("s4", asig("estado", s("calor")))],
      [
        conId(
          "s5",
          si(op(">", v("temp"), n(20)), [conId("s6", asig("estado", s("templado")))], [conId("s7", asig("estado", s("frio")))])
        ),
      ]
    )
  ),
  conId("s8", print(v("estado"))),
]);

// Clase 3: acumulador, suma de 1 a 5 (15).
export const TRAZA_SUMA_1_A_5: Prog = prog([
  conId("s1", decl("total", "int", n(0))),
  conId("s2", para("i", n(1), n(6), [conId("s3", asig("total", op("+", v("total"), v("i"))))])),
  conId("s4", print(v("total"))),
]);

// Clase 3: asignación aumentada, suma y producto de 1 a 4 (10 y 24) con += y *=.
export const TRAZA_AUMENTADAS: Prog = prog([
  conId("s1", decl("suma", "int", n(0))),
  conId("s2", decl("producto", "int", n(1))),
  conId(
    "s3",
    para("i", n(1), n(5), [conId("s4", asig("suma", v("i"), "+")), conId("s5", asig("producto", v("i"), "*"))])
  ),
  conId("s6", print(v("suma"), v("producto"))),
]);

// Clase 3: factorial con un for (factorial(5) = 120).
const factorialFn: Func = {
  nombre: "factorial",
  params: [{ n: "n", ty: "int" }],
  ret: "int",
  cuerpo: [
    conId("f1", decl("r", "int", n(1))),
    conId("f2", para("i", n(2), op("+", v("n"), n(1)), [conId("f3", asig("r", v("i"), "*"))])),
    conId("f4", retorna(v("r"))),
  ],
};
export const TRAZA_FACTORIAL: Prog = prog([conId("m1", print(call("factorial", n(5))))], [factorialFn]);

// Clase 3: while de cuenta regresiva (3, 2, 1).
export const FLUJO_MIENTRAS_CUENTA: Prog = prog([
  conId("s1", decl("n", "int", n(3))),
  conId("s2", mientras(op(">", v("n"), n(0)), [conId("s3", print(v("n"))), conId("s4", asig("n", op("-", v("n"), n(1))))])),
]);

// Clase 3: break corta el bucle en el primer múltiplo de 4 desde 10 (12).
export const TRAZA_BREAK: Prog = prog([
  conId(
    "s1",
    para("i", n(10), n(30), [
      conId("s2", si(op("==", op("mod", v("i"), n(4)), n(0)), [conId("s3", print(v("i"))), conId("s4", romper())])),
    ])
  ),
]);

// Clase 3: suma de cuadrados de 1 a 3 (1 + 4 + 9 = 14).
export const TRAZA_SUMA_CUADRADOS: Prog = prog([
  conId("s1", decl("total", "int", n(0))),
  conId("s2", para("i", n(1), n(4), [conId("s3", asig("total", op("+", v("total"), op("*", v("i"), v("i")))))])),
  conId("s4", print(v("total"))),
]);

// Clase 3: el error más común, una vuelta de menos (range(1, 5) llega a 4).
export const TRAZA_UNA_VUELTA_MENOS: Prog = prog([
  conId("s1", decl("total", "int", n(0))),
  conId("s2", para("i", n(1), n(5), [conId("s3", asig("total", op("+", v("total"), v("i"))))])),
  conId("s4", print(v("total"))),
]);

// Clase 4: una función con condicional y un return en cada camino.
const mayorFn: Func = {
  nombre: "mayor",
  params: [
    { n: "a", ty: "int" },
    { n: "b", ty: "int" },
  ],
  ret: "int",
  cuerpo: [conId("g1", si(op(">", v("a"), v("b")), [conId("g2", retorna(v("a")))])), conId("g3", retorna(v("b")))],
};
export const TRAZA_MAYOR: Prog = prog([conId("m1", print(call("mayor", n(3), n(9))))], [mayorFn]);

// Clase 4: llamadas anidadas triple(doble(2)) -> 12 (de adentro hacia afuera).
const dobleConResultado: Func = {
  nombre: "doble",
  params: [{ n: "x", ty: "int" }],
  ret: "int",
  cuerpo: [conId("d1", decl("resultado", "int", op("*", v("x"), n(2)))), conId("d2", retorna(v("resultado")))],
};
const tripleConResultado: Func = {
  nombre: "triple",
  params: [{ n: "x", ty: "int" }],
  ret: "int",
  cuerpo: [conId("t1", decl("resultado", "int", op("*", v("x"), n(3)))), conId("t2", retorna(v("resultado")))],
};
export const TRAZA_LLAMADAS_ANIDADAS: Prog = prog(
  [conId("m1", print(call("triple", call("doble", n(2)))))],
  [dobleConResultado, tripleConResultado]
);

// Clase 5: recorrer una lista y acumular (4 + 8 + 15 = 27).
export const TRAZA_LISTA_SUMA: Prog = prog([
  conId("s1", decl("nums", "arr", arr(4, 8, 15))),
  conId("s2", decl("suma", "int", n(0))),
  conId("s3", paraCada("x", v("nums"), [conId("s4", asig("suma", op("+", v("suma"), v("x"))))])),
  conId("s5", print(v("suma"))),
]);

// Clase 5: máximo de una lista (7, 3, 9, 4 -> 9): parte del primero y reemplaza si aparece uno mayor.
export const TRAZA_MAXIMO: Prog = prog([
  conId("s1", decl("datos", "arr", arr(7, 3, 9, 4))),
  conId("s2", decl("mayor", "int", ix(v("datos"), n(0)))),
  conId("s3", paraCada("x", v("datos"), [conId("s4", si(op(">", v("x"), v("mayor")), [conId("s5", asig("mayor", v("x")))]))])),
  conId("s6", print(v("mayor"))),
]);

// Clase 5: lista dinámica, la lista crece con agregar (4, 8, 15).
export const TRAZA_LISTA_DINAMICA: Prog = prog([
  conId("s1", dsDecl("lista", "lista")),
  conId("s2", exec(ds("lista", "agregar", n(4)))),
  conId("s3", exec(ds("lista", "agregar", n(8)))),
  conId("s4", exec(ds("lista", "agregar", n(15)))),
  conId("s5", print(ds("lista", "obt", n(1)), ds("lista", "tam"), ds("lista", "obt", op("-", ds("lista", "tam"), n(1))))),
]);

// Clase 5: diccionario de edades; asignar a una clave existente la sobrescribe.
export const TRAZA_MAPA_EDADES: Prog = prog([
  conId("s1", dsDecl("edades", "mapa")),
  conId("s2", exec(ds("edades", "poner", s("ana"), n(15)))),
  conId("s3", exec(ds("edades", "poner", s("luis"), n(17)))),
  conId("s4", exec(ds("edades", "poner", s("ana"), n(16)))),
  conId("s5", print(ds("edades", "obt", s("ana")), ds("edades", "tam"))),
]);

// Clase 6: un bucle que duplica i en cada vuelta es logarítmico (n = 8: 3 vueltas).
export const TRAZA_LOGARITMICO: Prog = prog([
  conId("s1", decl("n", "int", n(8))),
  conId("s2", decl("total", "int", n(0))),
  conId("s3", decl("i", "int", n(1))),
  conId(
    "s4",
    mientras(op("<", v("i"), v("n")), [
      conId("s5", asig("total", op("+", v("total"), n(1)))),
      conId("s6", asig("i", op("*", v("i"), n(2)))),
    ])
  ),
  conId("s7", print(v("total"))),
]);

// Clase 7: la suma de 1 a 4 que da 6 (range(1, 4) no llega al 4).
export const TRAZA_ERROR_LOGICO: Prog = prog([
  conId("s1", decl("total", "int", n(0))),
  conId("s2", para("i", n(1), n(4), [conId("s3", asig("total", op("+", v("total"), v("i"))))])),
  conId("s4", print(v("total"))),
]);

// Clase 7: depurar con print, mostrando i y total en cada vuelta.
export const TRAZA_DEPURAR_PRINT: Prog = prog([
  conId("s1", decl("total", "int", n(0))),
  conId(
    "s2",
    para("i", n(1), n(4), [
      conId("s3", asig("total", op("+", v("total"), v("i")))),
      conId("s4", print(s("i ="), v("i"), s("total ="), v("total"))),
    ])
  ),
  conId("s5", print(v("total"))),
]);

// Clase 8: un conjunto no guarda repetidos (2, 6, 2, 6, 1 -> tamaño 3).
export const TRAZA_CONJUNTO: Prog = prog([
  conId("s1", dsDecl("s", "conj")),
  conId("s2", paraCada("x", arr(2, 6, 2, 6, 1), [conId("s3", exec(ds("s", "agregar", v("x"))))])),
  conId("s4", print(ds("s", "tam"))),
  conId("s5", print(ds("s", "tiene", n(6)))),
]);

// Clase 8: invertir con una pila (entra 1, 2, 3 y sale 3, 2, 1).
export const TRAZA_PILA_INVERTIR: Prog = prog([
  conId("s1", decl("datos", "arr", arr(1, 2, 3))),
  conId("s2", dsDecl("pila", "pila")),
  conId("s3", paraCada("x", v("datos"), [conId("s4", exec(ds("pila", "apilar", v("x"))))])),
  conId("s5", mientras(op(">", ds("pila", "tam"), n(0)), [conId("s6", print(ds("pila", "desapilar")))])),
]);

// Clase 8: cola de turnos. Sale el primero: si es par se imprime y si es
// impar vuelve al final sumándole 1 (cola 3, 4, 5 -> imprime 4, 4, 6).
export const TRAZA_COLA_TURNOS: Prog = prog([
  conId("s1", dsDecl("cola", "cola")),
  conId("s2", exec(ds("cola", "encolar", n(3)))),
  conId("s3", exec(ds("cola", "encolar", n(4)))),
  conId("s4", exec(ds("cola", "encolar", n(5)))),
  conId(
    "s5",
    mientras(op(">", ds("cola", "tam"), n(0)), [
      conId("s6", decl("x", "int", ds("cola", "desencolar"))),
      conId(
        "s7",
        si(
          op("==", op("mod", v("x"), n(2)), n(0)),
          [conId("s8", print(v("x")))],
          [conId("s9", exec(ds("cola", "encolar", op("+", v("x"), n(1)))))]
        )
      ),
    ])
  ),
]);

// ========================== codia.comparar ==========================

// Clase 1: variables y tipos (nombre, edad, mayor de edad).
export const COMPARAR_VARIABLES_TIPOS: Prog = prog([
  decl("edad", "int", n(15)),
  decl("nombre", "str", s("Ana")),
  decl("mayor", "bool", op(">=", v("edad"), n(18))),
  print(v("nombre"), v("edad"), v("mayor")),
]);

// Clase 1: comentarios (# en Python, // en los demás); no cambian la salida.
export const COMPARAR_COMENTARIOS: Prog = prog([
  com("Guarda la edad de Ana"),
  decl("edad", "int", n(15)),
  com("Muestra la edad"),
  print(v("edad")),
]);

// Clase 1: el orden de la suma con texto (35 y 123 en Java, JavaScript y TypeScript; Python rompe).
export const COMPARAR_ORDEN_SUMA_TEXTO: Prog = prog([
  print(op("+", op("+", n(1), n(2)), s("5"))),
  print(op("+", op("+", s("1"), n(2)), n(3))),
]);

// Técnica 3: pedir la posición n de una lista de n elementos.
export const COMPARAR_INDICE_FUERA: Prog = prog([decl("datos", "arr", arr(4, 5, 6)), print(ix(v("datos"), n(3)))]);

// Técnica 3: dividir por cero (Python y Java rompen; JavaScript y TypeScript dan Infinity).
export const COMPARAR_DIVISION_CERO: Prog = prog([print(op("div", n(10), n(0)))]);

// Técnica 3: mezclar texto y número con + (Python rompe; los otros tres concatenan).
export const COMPARAR_TEXTO_MAS_NUMERO: Prog = prog([print(op("+", s("edad: "), n(30)))]);

// Técnica 4: división entera y resto con positivos (los cuatro coinciden).
export const COMPARAR_DIV_MOD_POSITIVOS: Prog = prog([print(op("div", n(17), n(5)), op("mod", n(17), n(5)))]);

// Técnica 4: con negativos Python usa piso y los otros tres truncan hacia cero.
export const COMPARAR_DIV_MOD_NEGATIVOS: Prog = prog([print(op("div", n(-7), n(2)), op("mod", n(-7), n(3)))]);

// Clase 2: condiciones combinadas (and en Python, && en los demás).
export const COMPARAR_CONDICION_Y: Prog = prog([
  decl("edad", "int", n(15)),
  si(op("y", op(">=", v("edad"), n(12)), op("<=", v("edad"), n(17))), [print(s("adolescente"))]),
]);

// Clase 3: for de 0 a 2 (el límite superior no se incluye).
export const COMPARAR_FOR_TRES: Prog = prog([para("i", n(0), n(3), [print(v("i"))])]);

// Clase 4: una función que duplica un número.
const dobleSimple: Func = {
  nombre: "doble",
  params: [{ n: "x", ty: "int" }],
  ret: "int",
  cuerpo: [retorna(op("*", v("x"), n(2)))],
};
export const COMPARAR_DOBLE: Prog = prog([print(call("doble", n(4)))], [dobleSimple]);

// Clase 5: lista, primer elemento y longitud.
export const COMPARAR_LISTAS: Prog = prog([decl("nums", "arr", arr(4, 8, 15)), print(ix(v("nums"), n(0)), largo(v("nums")))]);

// Clase 5: lista dinámica (agregar 4, 8, 15; leer la posición 1, el tamaño y el último).
export const COMPARAR_LISTA_DINAMICA: Prog = prog([
  dsDecl("lista", "lista"),
  exec(ds("lista", "agregar", n(4))),
  exec(ds("lista", "agregar", n(8))),
  exec(ds("lista", "agregar", n(15))),
  print(ds("lista", "obt", n(1)), ds("lista", "tam"), ds("lista", "obt", op("-", ds("lista", "tam"), n(1)))),
]);

// Clase 5: índice fuera de rango en una lista de 3 elementos.
export const COMPARAR_LISTA_FUERA: Prog = prog([decl("nums", "arr", arr(4, 8, 15)), print(ix(v("nums"), n(3)))]);

// Clase 5: diccionario de edades (ana se sobrescribe, quedan 2 claves).
export const COMPARAR_MAPA_EDADES: Prog = prog([
  dsDecl("edades", "mapa"),
  exec(ds("edades", "poner", s("ana"), n(15))),
  exec(ds("edades", "poner", s("luis"), n(17))),
  exec(ds("edades", "poner", s("ana"), n(16))),
  print(ds("edades", "obt", s("ana")), ds("edades", "tam")),
]);

// Clase 7: errores de ejecución (índice fuera de rango y división por cero
// en el mismo print: Python y Java se detienen en el primero).
export const COMPARAR_ERRORES_EJECUCION: Prog = prog([decl("datos", "arr", arr(1, 2, 3)), print(ix(v("datos"), n(3)), op("div", n(8), n(0)))]);

// Clase 8: pila LIFO (apilar 1, 2, 3 y desapilar dos veces: sale 3, 2).
export const COMPARAR_PILA: Prog = prog([
  dsDecl("pila", "pila"),
  exec(ds("pila", "apilar", n(1))),
  exec(ds("pila", "apilar", n(2))),
  exec(ds("pila", "apilar", n(3))),
  print(ds("pila", "desapilar")),
  print(ds("pila", "desapilar")),
]);

// Clase 8: cola FIFO (encolar 1, 2, 3 y desencolar dos veces: sale 1, 2).
export const COMPARAR_COLA: Prog = prog([
  dsDecl("cola", "cola"),
  exec(ds("cola", "encolar", n(1))),
  exec(ds("cola", "encolar", n(2))),
  exec(ds("cola", "encolar", n(3))),
  print(ds("cola", "desencolar")),
  print(ds("cola", "desencolar")),
]);

// ========================= codia.crecimiento =========================
// Cada función `contar(n)` devuelve cuántas veces corre la operación
// principal (total = total + 1); el visual la ejecuta para varios n.

function contar(cuerpo: SId[]): Func {
  return { nombre: "contar", params: [{ n: "n", ty: "int" }], ret: "int", cuerpo };
}
const sumar1 = (id: string): SId => conId(id, asig("total", op("+", v("total"), n(1))));

// Un bucle sobre n: O(n).
export const CONTAR_UN_BUCLE: Func = contar([
  conId("c1", decl("total", "int", n(0))),
  conId("c2", para("i", n(0), v("n"), [sumar1("c3")])),
  conId("c4", retorna(v("total"))),
]);

// Dos bucles anidados sobre n: O(n²).
export const CONTAR_ANIDADOS: Func = contar([
  conId("c1", decl("total", "int", n(0))),
  conId("c2", para("i", n(0), v("n"), [conId("c3", para("j", n(0), v("n"), [sumar1("c4")]))])),
  conId("c5", retorna(v("total"))),
]);

// Dos bucles uno después del otro: 2n, O(n).
export const CONTAR_EN_SECUENCIA: Func = contar([
  conId("c1", decl("total", "int", n(0))),
  conId("c2", para("i", n(0), v("n"), [sumar1("c3")])),
  conId("c4", para("j", n(0), v("n"), [sumar1("c5")])),
  conId("c6", retorna(v("total"))),
]);

// Un bucle interno de largo fijo (3 vueltas): 3n, O(n).
export const CONTAR_INTERNO_FIJO: Func = contar([
  conId("c1", decl("total", "int", n(0))),
  conId("c2", para("i", n(0), v("n"), [conId("c3", para("j", n(0), n(3), [sumar1("c4")]))])),
  conId("c5", retorna(v("total"))),
]);

// Bucle interno que depende de i: n(n-1)/2, sigue siendo O(n²).
export const CONTAR_TRIANGULAR: Func = contar([
  conId("c1", decl("total", "int", n(0))),
  conId("c2", para("i", n(0), v("n"), [conId("c3", para("j", n(0), v("i"), [sumar1("c4")]))])),
  conId("c5", retorna(v("total"))),
]);

// i se duplica en cada vuelta: O(log n).
export const CONTAR_LOGARITMICO: Func = contar([
  conId("c1", decl("total", "int", n(0))),
  conId("c2", decl("i", "int", n(1))),
  conId("c3", mientras(op("<", v("i"), v("n")), [sumar1("c4"), conId("c5", asig("i", op("*", v("i"), n(2)))) ])),
  conId("c6", retorna(v("total"))),
]);

// Un bucle sobre n con un contador que se duplica adentro: n log n, O(n log n).
export const CONTAR_N_LOG_N: Func = contar([
  conId("c1", decl("total", "int", n(0))),
  conId(
    "c2",
    para("i", n(0), v("n"), [
      conId("c3", decl("j", "int", n(1))),
      conId("c4", mientras(op("<", v("j"), v("n")), [sumar1("c5"), conId("c6", asig("j", op("*", v("j"), n(2))))])),
    ])
  ),
  conId("c7", retorna(v("total"))),
]);

// Tres bucles anidados sobre n: O(n³).
export const CONTAR_CUBICO: Func = contar([
  conId("c1", decl("total", "int", n(0))),
  conId("c2", para("i", n(0), v("n"), [conId("c3", para("j", n(0), v("n"), [conId("c4", para("k", n(0), v("n"), [sumar1("c5")]))]))])),
  conId("c6", retorna(v("total"))),
]);

// Series de los visuales "codia.crecimiento" (nombre en español + etiqueta
// de complejidad; el conteo lo calcula el visual ejecutando cada función).
const UN_BUCLE: SerieCrecimiento = { nombre: "Un bucle sobre n", etiqueta: "O(n)", funcion: CONTAR_UN_BUCLE };
const ANIDADOS: SerieCrecimiento = { nombre: "Dos bucles anidados", etiqueta: "O(n²)", funcion: CONTAR_ANIDADOS };

export const SERIES_UNO_Y_ANIDADOS: SerieCrecimiento[] = [UN_BUCLE, ANIDADOS];

export const SERIES_TECNICA_COMPLEJIDAD: SerieCrecimiento[] = [
  UN_BUCLE,
  ANIDADOS,
  { nombre: "Dos bucles, uno después del otro", etiqueta: "O(n)", funcion: CONTAR_EN_SECUENCIA },
  { nombre: "Bucle interno de 3 vueltas fijas", etiqueta: "O(n)", funcion: CONTAR_INTERNO_FIJO },
];

export const SERIES_CLASE_COMPLEJIDAD: SerieCrecimiento[] = [
  UN_BUCLE,
  ANIDADOS,
  { nombre: "Bucle interno que depende de i", etiqueta: "O(n²)", funcion: CONTAR_TRIANGULAR },
  { nombre: "El contador se duplica en cada vuelta", etiqueta: "O(log n)", funcion: CONTAR_LOGARITMICO },
];

// Clase 6: de O(n) a O(n²) pasando por O(n log n).
export const SERIES_CLASE_N_LOG_N: SerieCrecimiento[] = [
  UN_BUCLE,
  { nombre: "Un bucle con un contador que se duplica adentro", etiqueta: "O(n log n)", funcion: CONTAR_N_LOG_N },
  ANIDADOS,
];

// Clase 6: dos y tres bucles anidados.
export const SERIES_CLASE_CUBICA: SerieCrecimiento[] = [
  ANIDADOS,
  { nombre: "Tres bucles anidados", etiqueta: "O(n³)", funcion: CONTAR_CUBICO },
];
