import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { LECCIONES_CODIA } from "./index";
import { ACCIONES_HUECO, ACCIONES_SINTAXIS } from "../catalogoSintaxis";

// Cobertura práctica <-> lecciones: qué evalúa la práctica de Codia
// (sintaxis, salida, error, estructuras) y si alguna Técnica o Clase lo
// ENSEÑA en sus pasos (el quiz no cuenta: una pregunta sobre algo que
// ningún paso explica no es enseñanza).
//
// La lista de temas de la práctica sale del CÓDIGO de la práctica (nombres
// de plantillas parseados de plantillasSalida.ts / plantillasEstructuras.ts,
// los tipos de problema.ts y el catálogo de sintaxis importado): si la
// práctica suma una plantilla, este test falla hasta que se le asigne un
// criterio. Los HUECOS reales se REPORTAN (HUECOS_CONOCIDOS), no se
// rellenan acá: si un hueco se cierra (o aparece uno nuevo) el test falla
// para que se actualice la lista a propósito.

const raiz = path.resolve(__dirname, "..");
const leerFuente = (archivo: string) => fs.readFileSync(path.join(raiz, archivo), "utf8");

// Texto que ENSEÑAN las lecciones: solo los pasos (con los ~~~ ya en ```).
const ENSENANZA = LECCIONES_CODIA.map((l) => ({ slug: l.slug, texto: l.pasos.join("\n") }));
const QUIZ = LECCIONES_CODIA.map((l) => ({ slug: l.slug, texto: l.quiz.map((q) => `${q.pregunta}\n${q.opciones.join("\n")}\n${q.explicacion}`).join("\n") }));

interface Tema {
  id: string;
  descripcion: string;
  // Cómo se reconoce en el texto de una lección que ese tema se enseña.
  marca: RegExp;
}

const t = (id: string, descripcion: string, marca: RegExp): Tema => ({ id, descripcion, marca });

// ---------- modo sintaxis (catálogo importado) ----------
const SINTAXIS: Record<string, Tema> = {
  "declarar-entero": t("declarar-entero", "declarar una variable entera", /(?:^|\n)\s*(?:int|let|const) \w+(?:: number)? = \d|(?:^|\n)\w+ = \d/),
  "declarar-texto": t("declarar-texto", "declarar una variable de texto", /String \w+ = "|(?:const|let) \w+(?:: string)? = "|\w+ = "/),
  imprimir: t("imprimir", "imprimir por pantalla", /print\(|System\.out\.println|console\.log/),
  "si-igual": t("si-igual", "un if que compara con ==", /if \(?\w+ (?:%\s*\d+ )?(?:==|===) /),
  comentario: t("comentario", "comentarios (# en Python, // en los demás)", /comentario|(?:^|\n)\s*# \w|(?:^|\n)\s*\/\/ \w/),
  lista: t("lista", "crear una lista o arreglo", /\[4, 8, 15\]|\{4, 8, 15\}/),
  for: t("for", "bucle for", /for \w+ in range|for \(/),
  "funcion-sumar": t("funcion-sumar", "función con dos parámetros y return", /def \w+\(\w+, \w+\):|function \w+\(\w+, \w+\)/),
  while: t("while", "bucle while", /while /),
  "hueco-imprimir": t("hueco-imprimir", "completar un print", /print\(|System\.out\.println|console\.log/),
  "hueco-bucle": t("hueco-bucle", "completar la cabecera de un bucle", /for \w+ in range|for \(/),
  "hueco-if": t("hueco-if", "completar la condición de un if", /if \(?\w+ [<>=!]/),
  "hueco-return": t("hueco-return", "completar un return", /return /),
  "hueco-declarar": t("hueco-declarar", "completar una declaración", /(?:^|\n)\s*(?:int|let|const) \w+/),
  "hueco-longitud": t("hueco-longitud", "longitud de una lista (len / length)", /len\(\w+\)|\.length/),
};

// ---------- modo error (MutacionError de problema.ts) ----------
const ERRORES: Record<string, Tema> = {
  sintaxis: t("sintaxis", "error de sintaxis", /SyntaxError/),
  nombre: t("nombre", "nombre inexistente", /NameError/),
  indice: t("indice", "índice fuera de rango", /IndexError/),
  divcero: t("divcero", "división por cero", /ZeroDivisionError/),
  tipo: t("tipo", "tipos incompatibles", /TypeError/),
  igualdad: t("igualdad", "= en lugar de == en un if", /ASIGNA, dos COMPARAN/),
  logica: t("logica", "error de lógica (una vuelta de más o de menos)", /vuelta de más o de menos|errores? de lógica/i),
};

// ---------- modo salida (plantillas de plantillasSalida.ts) ----------
const SALIDA: Record<string, Tema> = {
  aritmetica: t("aritmetica", "aritmética entre variables (+ - *)", /\b\w+ = \w+ [*+-] \w+/),
  reasignar: t("reasignar", "asignación aumentada (+=, *=)", /\+= |\*= |-= /),
  cadena: t("cadena", "concatenar texto con +", /"[^"\n]*" \+ (?:str\(|\w)/),
  intercambio: t("intercambio", "intercambiar dos variables con una temporal", /variable temporal/),
  divmodPositivo: t("divmodPositivo", "división entera y resto con positivos", /17 \/\/ 5|17 % 5/),
  siDoble: t("siDoble", "if / else", /else:|\} else \{/),
  tresVias: t("tresVias", "if / elif / else (tres ramas)", /elif |else if/),
  logicos: t("logicos", "operadores lógicos and / or / not", /\band\b[\s\S]*\bor\b|&&/),
  sumaFor: t("sumaFor", "acumulador con for", /total = total \+ i/),
  whileCuenta: t("whileCuenta", "while con cuenta regresiva", /while n > 0/),
  forImprime: t("forImprime", "for que imprime el contador", /for i in range\(\d\):\n\s+print\(i\)/),
  funcLineal: t("funcLineal", "función que devuelve una expresión", /def doble\(x\):/),
  funcMayor: t("funcMayor", "función con if y return en cada camino", /def mayor\(a, b\):/),
  arrSuma: t("arrSuma", "recorrer un arreglo y acumular", /for x in nums:/),
  arrIndice: t("arrIndice", "último elemento de un arreglo (largo - 1)", /len\(\w+\) - 1|\.length - 1|de 0 a n - 1/),
  anidados: t("anidados", "bucles anidados", /for j in range\(n\)/),
  conBreak: t("conBreak", "break", /break/),
  contarPares: t("contarPares", "contar pares con % 2 == 0", /% 2 == 0/),
  maximoArr: t("maximoArr", "máximo de un arreglo", /m[aá]ximo/i),
  factorialFor: t("factorialFor", "factorial con un for", /factorial/i),
  quirkDivModNeg: t("quirkDivModNeg", "división y resto con negativos", /-7 \/\/ 2/),
  quirkConcat: t("quirkConcat", "concatenación contra suma según el orden (1 + 2 + \"a\")", /\d \+ \d \+ "|"\w*" \+ \d \+ \d/),
  quirkCoercion: t("quirkCoercion", "coerción de JavaScript: == contra ===", /"5" == 5/),
  quirkRepeticion: t("quirkRepeticion", "repetir un texto con * en Python", /"[^"\n]+" \* \d/),
};
// Subtemas que una plantilla mezcla (no tienen nombre propio en el código).
const SALIDA_EXTRA: Tema[] = [t("cadena-largo", "largo de un texto (len / length())", /len\((?:"|saludo|nombre|texto)|\.length\(\)/)];

// ---------- modo estructuras (plantillasEstructuras.ts + ClaseComplejidad) ----------
const ESTRUCTURAS: Record<string, Tema> = {
  pilaBasica: t("pilaBasica", "pila (LIFO)", /LIFO/),
  colaBasica: t("colaBasica", "cola (FIFO)", /FIFO/),
  listaOps: t("listaOps", "lista dinámica: agregar, leer por posición y tamaño", /(?:lista|nums|datos)\.(?:append|add|push)\(|ArrayList/),
  conjunto: t("conjunto", "conjunto sin repetidos", /set\(\)|HashSet/),
  mapa: t("mapa", "diccionario o mapa", /HashMap|new Map|\{"ana"/),
  invertirPila: t("invertirPila", "invertir con una pila", /invertir/i),
  colaTurnos: t("colaTurnos", "cola de turnos (sacar y volver a encolar)", /cola de turnos/i),
  conteoMapa: t("conteoMapa", "contar apariciones con un mapa", /cu[aá]ntas veces aparece/i),
  contarVeces: t("contarVeces", "contar cuántas veces corre una línea", /cuántas veces (?:se repite|corre|se ejecuta)|contar\(\d+\)/i),
};
const COMPLEJIDAD: Record<string, Tema> = {
  "O(1)": t("O(1)", "complejidad O(1)", /O\(1\)/),
  "O(log n)": t("O(log n)", "complejidad O(log n)", /O\(log n\)/),
  "O(n)": t("O(n)", "complejidad O(n)", /O\(n\)/),
  "O(n log n)": t("O(n log n)", "complejidad O(n log n)", /O\(n log n\)|n log n/),
  "O(n²)": t("O(n²)", "complejidad O(n²)", /O\(n²\)/),
  "O(n³)": t("O(n³)", "complejidad O(n³) (tres bucles anidados)", /O\(n³\)|n³/),
};

function leerNombres(archivo: string, re: RegExp): string[] {
  return [...leerFuente(archivo).matchAll(re)].map((m) => m[1]);
}

interface Cobertura {
  tema: string;
  modo: string;
  descripcion: string;
  ensenan: string[]; // slugs cuyos PASOS lo enseñan
  soloQuiz: string[]; // slugs que lo usan solo en el quiz
}

function cubrir(modo: string, temas: Tema[]): Cobertura[] {
  return temas.map((tema) => ({
    tema: `${modo}:${tema.id}`,
    modo,
    descripcion: tema.descripcion,
    ensenan: ENSENANZA.filter((e) => tema.marca.test(e.texto)).map((e) => e.slug),
    soloQuiz: QUIZ.filter((q) => tema.marca.test(q.texto) && !ENSENANZA.find((e) => e.slug === q.slug && tema.marca.test(e.texto))).map((q) => q.slug),
  }));
}

// El mapa completo: cada tema del código de la práctica -> criterio.
function todos(): Cobertura[] {
  const out: Cobertura[] = [];
  out.push(...cubrir("sintaxis", [...ACCIONES_SINTAXIS, ...ACCIONES_HUECO].map((a) => SINTAXIS[a.id]).filter(Boolean)));
  out.push(...cubrir("error", Object.values(ERRORES)));
  out.push(...cubrir("salida", [...Object.values(SALIDA), ...SALIDA_EXTRA]));
  out.push(...cubrir("estructuras", [...Object.values(ESTRUCTURAS), ...Object.values(COMPLEJIDAD)]));
  return out;
}

// HUECOS REALES: temas que la práctica evalúa y ninguna lección enseña en sus
// pasos. Hoy no queda ninguno: los 10 que había (comentarios, += y *=, largo de
// un texto, orden de la suma con textos, repetir un texto, máximo, factorial,
// lista dinámica, O(n log n) y O(n³)) se cerraron con pasos y visuales nuevos
// (2026-09-25). Si la práctica suma un tema que nadie enseña, o una edición
// borra la explicación de uno, este test falla y hay que decidirlo a propósito.
const HUECOS_CONOCIDOS: string[] = [];

// Dónde se enseña cada tema que antes era un hueco.
const CERRADOS_EN: Record<string, string> = {
  "sintaxis:comentario": "codia-clase-01-variables-y-tipos",
  "salida:quirkConcat": "codia-clase-01-variables-y-tipos",
  "salida:cadena-largo": "codia-clase-01-variables-y-tipos",
  "salida:quirkRepeticion": "codia-clase-01-variables-y-tipos",
  "salida:reasignar": "codia-clase-03-bucles",
  "salida:factorialFor": "codia-clase-03-bucles",
  "estructuras:listaOps": "codia-clase-05-listas-y-diccionarios",
  "salida:maximoArr": "codia-clase-05-listas-y-diccionarios",
  "estructuras:O(n log n)": "codia-clase-06-recorridos-y-complejidad",
  "estructuras:O(n³)": "codia-clase-06-recorridos-y-complejidad",
};

describe("Codia: cobertura de la práctica por las lecciones", () => {
  it("todo tema de la práctica tiene criterio (si la práctica crece, este test lo pide)", () => {
    expect(leerNombres("plantillasSalida.ts", /^const (\w+): Plantilla = \{/gm).sort()).toEqual(Object.keys(SALIDA).sort());
    expect(leerNombres("plantillasEstructuras.ts", /^const (\w+) = \(\): Borrador => \{/gm).sort()).toEqual(
      Object.keys(ESTRUCTURAS).filter((k) => k !== "contarVeces").sort()
    );
    expect(leerNombres("plantillasEstructuras.ts", /^function (contarVeces)\(\): Borrador/gm)).toEqual(["contarVeces"]);
    const problema = leerFuente("problema.ts");
    const clases = /export type ClaseComplejidad = ([^;]+);/.exec(problema)![1].match(/"[^"]+"/g)!.map((x) => x.slice(1, -1));
    expect(clases.sort()).toEqual(Object.keys(COMPLEJIDAD).sort());
    const mutaciones = /export type MutacionError =([^;]+);/.exec(problema)![1].match(/"[^"]+"/g)!.map((x) => x.slice(1, -1));
    expect(mutaciones.sort()).toEqual(Object.keys(ERRORES).sort());
    for (const a of [...ACCIONES_SINTAXIS, ...ACCIONES_HUECO]) expect(SINTAXIS[a.id], `falta criterio para el catálogo ${a.id}`).toBeDefined();
  });

  it("los huecos reales son exactamente los conocidos (cerrar uno o abrir otro exige actualizar la lista)", () => {
    const huecos = todos()
      .filter((c) => c.ensenan.length === 0)
      .map((c) => c.tema)
      .sort();
    expect(huecos).toEqual([...HUECOS_CONOCIDOS].sort());
  });

  it("los huecos que se cerraron se enseñan en la lección prevista (en los pasos, no solo en el quiz)", () => {
    const porTema = new Map(todos().map((c) => [c.tema, c]));
    for (const [tema, slug] of Object.entries(CERRADOS_EN)) {
      expect(porTema.get(tema), tema).toBeDefined();
      expect(porTema.get(tema)!.ensenan, tema).toContain(slug);
    }
  });

  it("imprime el informe de cobertura (para el reporte de la tarea)", () => {
    const filas = todos();
    const informe = filas.map((c) => `${c.ensenan.length === 0 ? "HUECO " : "ok    "}${c.tema.padEnd(34)} ${c.ensenan.map((s) => s.replace("codia-", "")).join(", ") || (c.soloQuiz.length ? `(solo en quiz: ${c.soloQuiz.join(", ")})` : "-")}`);
    // CODIA_INFORME_COBERTURA=<ruta> guarda el informe completo en ese archivo.
    if (process.env.CODIA_INFORME_COBERTURA) fs.writeFileSync(process.env.CODIA_INFORME_COBERTURA, informe.join("\n"), "utf8");
    expect(filas.length).toBeGreaterThan(40);
  });
});
