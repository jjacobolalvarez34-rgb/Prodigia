import type { Lenguaje } from "./tipos";

// Catálogo curado de sintaxis (modo "sintaxis", niveles 1-3). Cada caso
// se VERIFICA ejecutándolo (codia.test.ts recorre el catálogo COMPLETO,
// no una muestra): la opción correcta debe compilar/correr e imprimir
// `stdout`, y CADA distractor debe fallar (error de sintaxis, de
// compilación o de ejecución) o imprimir algo distinto. Ningún
// distractor es "otra forma válida": solo se listan construcciones que
// de verdad no funcionan en ese lenguaje.

export const MARCA = "«»";

export interface CasoSintaxis {
  ok: string;
  malas: string[];
  // Líneas de contexto ANTES y DESPUÉS del fragmento (dentro de main en Java).
  pre?: string[];
  post?: string[];
  // Java: el fragmento es un miembro de la clase (una función static).
  miembro?: boolean;
  stdout: string;
}

export interface AccionSintaxis {
  id: string;
  nivel: number;
  // Completa "¿Cuál de estas opciones ... en <Lenguaje>?"
  accion: string;
  casos: Record<Lenguaje, CasoSintaxis>;
}

const L = (...lineas: string[]) => lineas.join("\n");

export const ACCIONES_SINTAXIS: AccionSintaxis[] = [
  {
    id: "declarar-entero",
    nivel: 1,
    accion: "declara una variable x con el valor 5",
    casos: {
      python: { ok: "x = 5", malas: ["int x = 5", "let x = 5", "x := 5", "5 = x"], post: ["print(x)"], stdout: "5" },
      java: { ok: "int x = 5;", malas: ["x = 5;", "int x = 5", "integer x = 5;", "let x = 5;"], post: ["System.out.println(x);"], stdout: "5" },
      javascript: { ok: "let x = 5;", malas: ["int x = 5;", "let x := 5;", "let 5x = 5;", "x = int 5;"], post: ["console.log(x);"], stdout: "5" },
      typescript: { ok: "let x: number = 5;", malas: ["int x = 5;", "let x: int = 5;", 'let x: number = "5";', "number x = 5;"], post: ["console.log(x);"], stdout: "5" },
    },
  },
  {
    id: "declarar-texto",
    nivel: 1,
    accion: "guarda el texto Hola en una variable llamada saludo",
    casos: {
      python: { ok: 'saludo = "Hola"', malas: ["saludo = Hola", 'saludo = "Hola', 'String saludo = "Hola"', 'saludo := "Hola"'], post: ["print(saludo)"], stdout: "Hola" },
      java: { ok: 'String saludo = "Hola";', malas: ['string saludo = "Hola";', "String saludo = 'Hola';", "String saludo = Hola;", 'String saludo = "Hola"'], post: ["System.out.println(saludo);"], stdout: "Hola" },
      javascript: { ok: 'let saludo = "Hola";', malas: ["let saludo = Hola;", 'let saludo = "Hola;', 'string saludo = "Hola";', `let saludo = 'Hola";`], post: ["console.log(saludo);"], stdout: "Hola" },
      typescript: { ok: 'let saludo: string = "Hola";', malas: ["let saludo: string = 5;", "let saludo: string = Hola;", 'string saludo = "Hola";', 'let saludo: text = "Hola";'], post: ["console.log(saludo);"], stdout: "Hola" },
    },
  },
  {
    id: "imprimir",
    nivel: 1,
    accion: "imprime el texto Hola",
    casos: {
      python: { ok: 'print("Hola")', malas: ['print "Hola"', 'Print("Hola")', 'echo("Hola")', 'print("Hola"'], stdout: "Hola" },
      java: { ok: 'System.out.println("Hola");', malas: ['System.out.println("Hola")', 'system.out.println("Hola");', 'System.out.println("Hola);', 'Console.log("Hola");'], stdout: "Hola" },
      javascript: { ok: 'console.log("Hola");', malas: ['console.print("Hola");', 'Console.log("Hola");', 'console.log("Hola";', 'log.console("Hola");'], stdout: "Hola" },
      typescript: { ok: 'console.log("Hola");', malas: ['console.print("Hola");', 'Console.log("Hola");', 'console.log("Hola";', "console.log(Hola);"], stdout: "Hola" },
    },
  },
  {
    id: "si-igual",
    nivel: 2,
    accion: "imprime cinco solo si x es igual a 5",
    casos: {
      python: {
        pre: ["x = 5"],
        ok: L("if x == 5:", '    print("cinco")'),
        malas: [L("if x = 5:", '    print("cinco")'), L("if x == 5", '    print("cinco")'), L("if (x == 5) {", '    print("cinco")', "}"), L("if x === 5:", '    print("cinco")')],
        stdout: "cinco",
      },
      java: {
        pre: ["int x = 5;"],
        ok: L("if (x == 5) {", '    System.out.println("cinco");', "}"),
        malas: [L("if (x = 5) {", '    System.out.println("cinco");', "}"), L("if x == 5 {", '    System.out.println("cinco");', "}"), L("if (x == 5) then {", '    System.out.println("cinco");', "}"), L("if (x === 5) {", '    System.out.println("cinco");', "}")],
        stdout: "cinco",
      },
      javascript: {
        pre: ["let x = 5;"],
        ok: L("if (x === 5) {", '    console.log("cinco");', "}"),
        malas: [L("if x === 5 {", '    console.log("cinco");', "}"), L("if (x === 5) then {", '    console.log("cinco");', "}"), L("if (x === 5):", '    console.log("cinco")'), L("if (x === 5) {", '    console.log("cinco");')],
        stdout: "cinco",
      },
      typescript: {
        pre: ["let x: number = 5;"],
        ok: L("if (x === 5) {", '    console.log("cinco");', "}"),
        malas: [L("if x === 5 {", '    console.log("cinco");', "}"), L("if (x === 5):", '    console.log("cinco")'), L('if (x === "5") {', '    console.log("cinco");', "}"), L("if (x === 5) then {", '    console.log("cinco");', "}")],
        stdout: "cinco",
      },
    },
  },
  {
    id: "comentario",
    nivel: 2,
    accion: "escribe un comentario de una línea",
    casos: {
      python: { ok: "# esto es un comentario", malas: ["// esto es un comentario", "/* esto es un comentario */", "-- esto es un comentario", "** esto es un comentario **"], post: ['print("ok")'], stdout: "ok" },
      java: { ok: "// esto es un comentario", malas: ["# esto es un comentario", "-- esto es un comentario", "** esto es un comentario **", "/* esto es un comentario"], post: ['System.out.println("ok");'], stdout: "ok" },
      javascript: { ok: "// esto es un comentario", malas: ["# esto es un comentario", "-- esto es un comentario", "** esto es un comentario **", "/* esto es un comentario"], post: ['console.log("ok");'], stdout: "ok" },
      typescript: { ok: "// esto es un comentario", malas: ["# esto es un comentario", "-- esto es un comentario", "** esto es un comentario **", "/* esto es un comentario"], post: ['console.log("ok");'], stdout: "ok" },
    },
  },
  {
    id: "lista",
    nivel: 2,
    accion: "crea una lista llamada nums con los números 1, 2 y 3",
    casos: {
      python: { ok: "nums = [1, 2, 3]", malas: ["nums = {1; 2; 3}", "nums = [1 2 3]", "int nums[] = [1, 2, 3]", "nums = list(1, 2, 3)"], post: ["print(len(nums))"], stdout: "3" },
      java: { ok: "int[] nums = {1, 2, 3};", malas: ["int[] nums = [1, 2, 3];", "int nums = {1, 2, 3};", "int[] nums = (1, 2, 3);", "int nums[] = [1, 2, 3];"], post: ["System.out.println(nums.length);"], stdout: "3" },
      javascript: { ok: "let nums = [1, 2, 3];", malas: ["let nums = {1, 2, 3};", "let nums = [1; 2; 3];", "let nums = <1, 2, 3>;", "let nums = list(1, 2, 3);"], post: ["console.log(nums.length);"], stdout: "3" },
      typescript: { ok: "let nums: number[] = [1, 2, 3];", malas: ["let nums: number[] = {1, 2, 3};", "let nums: array = [1, 2, 3];", "number[] nums = [1, 2, 3];", "let nums: number[] = [1; 2; 3];"], post: ["console.log(nums.length);"], stdout: "3" },
    },
  },
  {
    id: "for",
    nivel: 3,
    accion: "imprime los números 0, 1 y 2 con un bucle for",
    casos: {
      python: {
        ok: L("for i in range(3):", "    print(i)"),
        malas: [L("for i in 3:", "    print(i)"), L("for (i = 0; i < 3; i++):", "    print(i)"), L("for i in range(3)", "    print(i)"), L("foreach i in range(3):", "    print(i)")],
        stdout: "0\n1\n2",
      },
      java: {
        ok: L("for (int i = 0; i < 3; i++) {", "    System.out.println(i);", "}"),
        malas: [L("for (int i = 0, i < 3, i++) {", "    System.out.println(i);", "}"), L("for i in range(3) {", "    System.out.println(i);", "}"), L("for (i = 0; i < 3; i++) {", "    System.out.println(i);", "}"), L("for (int i = 0; i < 3; i++ {", "    System.out.println(i);", "}")],
        stdout: "0\n1\n2",
      },
      javascript: {
        ok: L("for (let i = 0; i < 3; i++) {", "    console.log(i);", "}"),
        malas: [L("for (let i = 0, i < 3, i++) {", "    console.log(i);", "}"), L("for i in range(3) {", "    console.log(i);", "}"), L("for (let i = 0; i < 3; i++):", "    console.log(i)"), L("for let i = 0; i < 3; i++ {", "    console.log(i);", "}")],
        stdout: "0\n1\n2",
      },
      typescript: {
        ok: L("for (let i = 0; i < 3; i++) {", "    console.log(i);", "}"),
        malas: [L("for (let i: number = 0, i < 3, i++) {", "    console.log(i);", "}"), L("for i in range(3) {", "    console.log(i);", "}"), L("for (let i = 0; i < 3; i++):", "    console.log(i)"), L("for (let i: int = 0; i < 3; i++) {", "    console.log(i);", "}")],
        stdout: "0\n1\n2",
      },
    },
  },
  {
    id: "funcion-sumar",
    nivel: 3,
    accion: "define una función sumar que devuelve a + b",
    casos: {
      python: {
        ok: L("def sumar(a, b):", "    return a + b"),
        malas: [L("function sumar(a, b):", "    return a + b"), L("def sumar(a, b)", "    return a + b"), L("def sumar(int a, int b):", "    return a + b"), L("def sumar(a, b):", "return a + b")],
        post: ["print(sumar(2, 3))"],
        stdout: "5",
      },
      java: {
        miembro: true,
        ok: L("static int sumar(int a, int b) {", "    return a + b;", "}"),
        malas: [L("static sumar(int a, int b) {", "    return a + b;", "}"), L("static int sumar(a, b) {", "    return a + b;", "}"), L("def sumar(int a, int b) {", "    return a + b;", "}"), L("static int sumar(int a, int b) {", "    return a + b", "}")],
        post: ["System.out.println(sumar(2, 3));"],
        stdout: "5",
      },
      javascript: {
        ok: L("function sumar(a, b) {", "    return a + b;", "}"),
        malas: [L("function sumar(a, b):", "    return a + b"), L("def sumar(a, b) {", "    return a + b;", "}"), L("function sumar(a, b)", "    return a + b;", "}"), L("function sumar(int a, int b) {", "    return a + b;", "}")],
        post: ["console.log(sumar(2, 3));"],
        stdout: "5",
      },
      typescript: {
        ok: L("function sumar(a: number, b: number): number {", "    return a + b;", "}"),
        malas: [L("function sumar(a: number, b: number): number", "    return a + b;", "}"), L("function sumar(number a, number b): number {", "    return a + b;", "}"), L("function sumar(a: number, b: number): int {", "    return a + b;", "}"), L("function sumar(a: number, b: number) => number {", "    return a + b;", "}")],
        post: ["console.log(sumar(2, 3));"],
        stdout: "5",
      },
    },
  },
  {
    id: "while",
    nivel: 3,
    accion: "repite mientras x sea menor que 3 sumándole 1 a x",
    casos: {
      python: {
        pre: ["x = 0"],
        ok: L("while x < 3:", "    x = x + 1"),
        malas: [L("while x < 3", "    x = x + 1"), L("while (x < 3) {", "    x = x + 1", "}"), L("while x < 3:", "x = x + 1"), L("until x == 3:", "    x = x + 1")],
        post: ["print(x)"],
        stdout: "3",
      },
      java: {
        pre: ["int x = 0;"],
        ok: L("while (x < 3) {", "    x = x + 1;", "}"),
        malas: [L("while x < 3 {", "    x = x + 1;", "}"), L("while (x < 3):", "    x = x + 1;"), L("while (x < 3) {", "    x = x + 1", "}"), L("while (x < 3) do {", "    x = x + 1;", "}")],
        post: ["System.out.println(x);"],
        stdout: "3",
      },
      javascript: {
        pre: ["let x = 0;"],
        ok: L("while (x < 3) {", "    x = x + 1;", "}"),
        malas: [L("while x < 3 {", "    x = x + 1;", "}"), L("while (x < 3):", "    x = x + 1;"), L("while (x < 3) do {", "    x = x + 1;", "}"), L("while (x < 3) {", "    x = x + 1;")],
        post: ["console.log(x);"],
        stdout: "3",
      },
      typescript: {
        pre: ["let x: number = 0;"],
        ok: L("while (x < 3) {", "    x = x + 1;", "}"),
        malas: [L("while x < 3 {", "    x = x + 1;", "}"), L("while (x < 3):", "    x = x + 1;"), L("while (x < 3) do {", "    x = x + 1;", "}"), L('while (x < "3") {', "    x = x + 1;", "}")],
        post: ["console.log(x);"],
        stdout: "3",
      },
    },
  },
];

// ---------- Completar el hueco ("___") ----------
export interface CasoHueco {
  // Líneas mostradas, con `___` en el hueco.
  lineas: string[];
  // Java: cuántas de las primeras líneas son miembros de la clase (funciones).
  nMiembros?: number;
  correcta: string;
  malas: string[];
  stdout: string;
}

export interface AccionHueco {
  id: string;
  nivel: number;
  objetivo: string; // "para que imprima Hola"
  casos: Record<Lenguaje, CasoHueco>;
}

export const ACCIONES_HUECO: AccionHueco[] = [
  {
    id: "hueco-imprimir",
    nivel: 1,
    objetivo: "para que imprima Hola",
    casos: {
      python: { lineas: ['___("Hola")'], correcta: "print", malas: ["echo", "puts", "printf"], stdout: "Hola" },
      java: { lineas: ['System.out.___("Hola");'], correcta: "println", malas: ["printn", "echo", "writeln"], stdout: "Hola" },
      javascript: { lineas: ['console.___("Hola");'], correcta: "log", malas: ["print", "write", "show"], stdout: "Hola" },
      typescript: { lineas: ['console.___("Hola");'], correcta: "log", malas: ["print", "write", "show"], stdout: "Hola" },
    },
  },
  {
    id: "hueco-bucle",
    nivel: 1,
    objetivo: "para que imprima 0, 1 y 2",
    casos: {
      python: { lineas: ["for i in ___(3):", "    print(i)"], correcta: "range", malas: ["rango", "loop", "repeat"], stdout: "0\n1\n2" },
      java: { lineas: ["for (int i = 0; i ___ 3; i++) {", "    System.out.println(i);", "}"], correcta: "<", malas: ["<=", ">", "=>"], stdout: "0\n1\n2" },
      javascript: { lineas: ["for (let i = 0; i ___ 3; i++) {", "    console.log(i);", "}"], correcta: "<", malas: ["<=", ">", "=>"], stdout: "0\n1\n2" },
      typescript: { lineas: ["for (let i = 0; i ___ 3; i++) {", "    console.log(i);", "}"], correcta: "<", malas: ["<=", ">", "=>"], stdout: "0\n1\n2" },
    },
  },
  {
    id: "hueco-if",
    nivel: 2,
    objetivo: "para que imprima grande",
    casos: {
      python: { lineas: ["x = 7", "___ x > 5:", '    print("grande")'], correcta: "if", malas: ["when", "check", "unless"], stdout: "grande" },
      java: { lineas: ["int x = 7;", "___ (x > 5) {", '    System.out.println("grande");', "}"], correcta: "if", malas: ["when", "check", "unless"], stdout: "grande" },
      javascript: { lineas: ["let x = 7;", "___ (x > 5) {", '    console.log("grande");', "}"], correcta: "if", malas: ["when", "check", "unless"], stdout: "grande" },
      typescript: { lineas: ["let x: number = 7;", "___ (x > 5) {", '    console.log("grande");', "}"], correcta: "if", malas: ["when", "check", "unless"], stdout: "grande" },
    },
  },
  {
    id: "hueco-return",
    nivel: 2,
    objetivo: "para que imprima 8",
    casos: {
      python: { lineas: ["def doble(x):", "    ___ x * 2", "", "print(doble(4))"], correcta: "return", malas: ["give", "out", "respond"], stdout: "8" },
      java: { lineas: ["static int doble(int x) {", "    ___ x * 2;", "}", "", "System.out.println(doble(4));"], nMiembros: 4, correcta: "return", malas: ["give", "out", "respond"], stdout: "8" },
      javascript: { lineas: ["function doble(x) {", "    ___ x * 2;", "}", "", "console.log(doble(4));"], correcta: "return", malas: ["give", "out", "respond"], stdout: "8" },
      typescript: { lineas: ["function doble(x: number): number {", "    ___ x * 2;", "}", "", "console.log(doble(4));"], correcta: "return", malas: ["give", "out", "respond"], stdout: "8" },
    },
  },
  {
    id: "hueco-declarar",
    nivel: 3,
    objetivo: "para declarar total con el valor 10 e imprimirlo",
    casos: {
      python: { lineas: ["total ___ 10", "print(total)"], correcta: "=", malas: ["==", ":=", "=>"], stdout: "10" },
      java: { lineas: ["___ total = 10;", "System.out.println(total);"], correcta: "int", malas: ["integer", "num", "number"], stdout: "10" },
      javascript: { lineas: ["___ total = 10;", "console.log(total);"], correcta: "let", malas: ["int", "dim", "number"], stdout: "10" },
      typescript: { lineas: ["___ total: number = 10;", "console.log(total);"], correcta: "let", malas: ["int", "dim", "num"], stdout: "10" },
    },
  },
  {
    id: "hueco-longitud",
    nivel: 3,
    objetivo: "para que imprima la cantidad de elementos (3)",
    casos: {
      python: { lineas: ["datos = [4, 5, 6]", "print(___(datos))"], correcta: "len", malas: ["size", "count", "length"], stdout: "3" },
      java: { lineas: ["int[] datos = {4, 5, 6};", "System.out.println(datos.___);"], correcta: "length", malas: ["size()", "length()", "len"], stdout: "3" },
      javascript: { lineas: ["let datos = [4, 5, 6];", "console.log(datos.___);"], correcta: "length", malas: ["size", "len", "count"], stdout: "3" },
      typescript: { lineas: ["let datos: number[] = [4, 5, 6];", "console.log(datos.___);"], correcta: "length", malas: ["size", "len", "count"], stdout: "3" },
    },
  },
];
