import type { VisualCuadros } from "@/lib/aprender/visuales";
import type { LeccionCodia } from "./tipos";

// Codia por lenguaje (pedido del usuario, 2026-10-06): primero «Lo básico»
// (la lógica, igual en los cuatro lenguajes: clases 1-8), y después cada
// lenguaje por separado, con su forma de escribirse y sus usos reales:
//   - «Los cuatro lenguajes»: compilado o interpretado, tipado estático o
//     dinámico y para qué se usa cada uno.
//   - Python, Java, JavaScript y TypeScript: 3 Clases cada uno (sintaxis
//     propia, lo característico del lenguaje y dónde se usa) y una Técnica
//     de «chuleta» por lenguaje.
// Misma convención que el resto del contenido (tipos.ts): ~~~lenguaje para el
// código, ~~~lenguaje! para lo que debe fallar y ~~~salida para la salida real.
// lecciones.test.ts EJECUTA cada fragmento (Python, javac + JVM 8, Node y
// TypeScript estricto). Java: solo sentencias de main, clases como
// `static class` en la columna 0, y nada de tildes en lo que se imprime (la
// consola de la JVM no siempre es UTF-8). Nunca el signo de dólar.
// Migración generada: 0255_codia_lenguajes.sql.

const cuadros = (despuesDePaso: number, titulo: string, textos: string[]): VisualCuadros => ({
  tipo: "cuadros",
  despuesDePaso,
  titulo,
  cuadros: textos.map((texto) => ({ texto })),
});

// Grupos del sidebar (src/lib/aprender/grupos.ts los usa tal cual).
export const GRUPOS_LENGUAJES = [
  { id: "lenguajes", es: "Los cuatro lenguajes", en: "The four languages" },
  { id: "python", es: "Python", en: "Python" },
  { id: "java", es: "Java", en: "Java" },
  { id: "javascript", es: "JavaScript", en: "JavaScript" },
  { id: "typescript", es: "TypeScript", en: "TypeScript" },
] as const;
export type GrupoLenguaje = (typeof GRUPOS_LENGUAJES)[number]["id"];

export const GRUPO_DE_LECCION_LENGUAJE: Record<string, GrupoLenguaje> = {};

function en<T extends LeccionCodia>(grupo: GrupoLenguaje, l: T): T {
  GRUPO_DE_LECCION_LENGUAJE[l.slug] = grupo;
  return l;
}

export const TECNICAS_LENGUAJES: LeccionCodia[] = [
  en("python", {
    slug: "codia-tecnica-python-chuleta",
    nombre: "Python en un vistazo: dos puntos, sangría y print",
    descripcion: "Lo mínimo para leer y escribir Python sin tropezar: bloques con sangría, variables sin tipo, True y False con mayúscula y las dos divisiones.",
    orden: 14,
    requierePro: false,
    pasos: [
      `Bloques con sangría: después de if, for, while o def van dos puntos, y las líneas de adentro se corren 4 espacios.
~~~python
for i in range(3):
    print(i)
~~~
~~~salida
0
1
2
~~~`,
      `Sin tipos ni punto y coma: la variable toma el tipo del valor que le das, y puede cambiarlo.
~~~python
x = 5
x = "cinco"
print(x)
~~~
~~~salida
cinco
~~~`,
      `True y False van con mayúscula, y los operadores lógicos se escriben con palabras: and, or, not.
~~~python
print(3 > 2 and not False)
~~~
~~~salida
True
~~~`,
      `Dos divisiones: / siempre da decimal y // da la parte entera.
~~~python
print(10 / 4, 10 // 4)
~~~
~~~salida
2.5 2
~~~`,
    ],
    visuales: [cuadros(0, "Python en tres reglas", ["Dos puntos y sangría marcan cada bloque", "La variable toma el tipo del valor", "True, False, and, or y not se escriben así"])],
    quiz: [
      {
        pregunta: `¿Qué imprime?
~~~python
print(list(range(2, 5)))
~~~`,
        opciones: ["[2, 3, 4]", "[2, 3, 4, 5]", "[3, 4]"],
        respuesta: "[2, 3, 4]",
        explicacion: "range(2, 5) empieza en 2 y se detiene antes del 5.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "¿Cómo se escribe «verdadero» en Python?",
        opciones: ["true", "True", "TRUE"],
        respuesta: "True",
        explicacion: "En Python los booleanos llevan mayúscula: True y False.",
      },
    ],
  }),
  en("java", {
    slug: "codia-tecnica-java-chuleta",
    nombre: "Java en un vistazo: tipos, punto y coma y llaves",
    descripcion: "Lo mínimo para leer Java: cada variable declara su tipo, cada sentencia termina en punto y coma y los bloques van entre llaves.",
    orden: 15,
    requierePro: false,
    pasos: [
      `Cada sentencia termina en punto y coma y los bloques van entre llaves.
~~~java
for (int i = 0; i < 3; i++) {
    System.out.println(i);
}
~~~
~~~salida
0
1
2
~~~`,
      `Cada variable declara su tipo y no puede cambiarlo: si no coincide, el programa ni siquiera compila.
~~~java!
int x = 5;
x = "cinco";
~~~
~~~salida
error de compilación
~~~`,
      `Para imprimir se usa System.out.println, y para unir texto, el signo +.
~~~java
String mundo = "Codia";
System.out.println("Hola, " + mundo);
~~~
~~~salida
Hola, Codia
~~~`,
      `Cuidado: un int dividido por otro int descarta los decimales. Con un decimal en la cuenta, el resultado es decimal.
~~~java
System.out.println(10 / 4);
System.out.println(10 / 4.0);
~~~
~~~salida
2
2.5
~~~`,
    ],
    visuales: [cuadros(0, "Java en tres reglas", ["Cada variable declara su tipo", "Cada sentencia termina en punto y coma", "Los bloques van entre llaves"])],
    quiz: [
      {
        pregunta: `¿Qué imprime?
~~~java
System.out.println(9 / 2);
~~~`,
        opciones: ["4.5", "4", "5"],
        respuesta: "4",
        explicacion: "9 y 2 son int: la división entera descarta el .5.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "¿Con qué termina cada sentencia en Java?",
        opciones: ["Con punto y coma", "Con dos puntos", "Con un salto de línea"],
        respuesta: "Con punto y coma",
        explicacion: "Java exige ; al final de cada sentencia.",
      },
    ],
  }),
  en("javascript", {
    slug: "codia-tecnica-javascript-chuleta",
    nombre: "JavaScript en un vistazo: const, === y las sorpresas del +",
    descripcion: "Lo mínimo para no caer en las trampas de JavaScript: const y let, comparar siempre con === y cuidado con sumar texto y números.",
    orden: 16,
    requierePro: false,
    pasos: [
      `const para lo que no cambia y let para lo que sí. En código nuevo no se usa var.
~~~javascript
const base = 10;
let total = base;
total += 5;
console.log(total);
~~~
~~~salida
15
~~~`,
      `Compara siempre con ===, que exige el mismo valor y el mismo tipo. El == convierte los tipos antes de comparar y da sorpresas.
~~~javascript
console.log(1 == "1", 1 === "1");
~~~
~~~salida
true false
~~~`,
      `Con un texto de por medio, + une en vez de sumar. Para sumar, convierte primero con Number.
~~~javascript
console.log("2" + 2);
console.log(Number("2") + 2);
~~~
~~~salida
22
4
~~~`,
      `Para imprimir varias cosas, sepáralas con coma en console.log: se muestran con un espacio en medio.
~~~javascript
const nombre = "Ana";
console.log("Hola", nombre);
~~~
~~~salida
Hola Ana
~~~`,
    ],
    visuales: [cuadros(1, "JavaScript en tres reglas", ["const por defecto; let si va a cambiar", "Compara con ===", "Texto + número une, no suma"])],
    quiz: [
      {
        pregunta: `¿Qué imprime?
~~~javascript
console.log("5" + 1);
~~~`,
        opciones: ["6", "51", "Error"],
        respuesta: "51",
        explicacion: "Con un texto de por medio, + une: «5» y «1» dan «51».",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué imprime?
~~~javascript
console.log(2 === 2.0);
~~~`,
        opciones: ["true", "false", "Error"],
        respuesta: "true",
        explicacion: "En JavaScript todos los números son del mismo tipo: 2 y 2.0 son el mismo valor.",
        verifica: { tipo: "salida" },
      },
    ],
  }),
  en("typescript", {
    slug: "codia-tecnica-typescript-chuleta",
    nombre: "TypeScript en un vistazo: dos puntos y el tipo",
    descripcion: "TypeScript es JavaScript con tipos: el tipo va después del nombre, con dos puntos, y si no coincide el programa no compila.",
    orden: 17,
    requierePro: false,
    pasos: [
      `El tipo va después del nombre, con dos puntos.
~~~typescript
let edad: number = 15;
console.log(edad + 1);
~~~
~~~salida
16
~~~`,
      `Si el valor no coincide con el tipo, no compila: el error aparece antes de ejecutar.
~~~typescript!
let edad: number = "quince";
~~~
~~~salida
error de compilación
~~~`,
      `Las funciones declaran el tipo de cada parámetro y del resultado.
~~~typescript
function area(base: number, altura: number): number {
  return (base * altura) / 2;
}
console.log(area(6, 4));
~~~
~~~salida
12
~~~`,
      `Todo lo demás es JavaScript: const, let, ===, arreglos y objetos funcionan igual.
~~~typescript
const xs: number[] = [1, 2, 3];
console.log(xs.length === 3);
~~~
~~~salida
true
~~~`,
    ],
    visuales: [cuadros(0, "TypeScript en tres reglas", ["nombre: tipo", "Si el tipo no coincide, no compila", "El resto es JavaScript"])],
    quiz: [
      {
        pregunta: `¿Qué pasa con este código?
~~~typescript
function f(n: number): number {
  return n;
}
f("1");
~~~`,
        opciones: ["No compila: error de compilación", "Devuelve 1", "Devuelve «1»"],
        respuesta: "No compila: error de compilación",
        explicacion: "f pide un number y le pasan un string: el compilador lo rechaza.",
        verifica: { tipo: "error", error: "error de compilación" },
      },
      {
        pregunta: "¿Dónde se escribe el tipo de una variable en TypeScript?",
        opciones: ["Después del nombre, con dos puntos", "Antes del nombre, como en Java", "En un comentario"],
        respuesta: "Después del nombre, con dos puntos",
        explicacion: "Por ejemplo: let edad: number = 15.",
      },
    ],
  }),
];

export const CLASES_LENGUAJES: LeccionCodia[] = [
  // ------------------------------------------------------------------
  en("lenguajes", {
    slug: "codia-clase-lenguajes-panorama",
    nombre: "Cuatro lenguajes, cuatro mundos: para qué sirve cada uno",
    descripcion: "Las ideas de Lo básico son las mismas en todos los lenguajes; cambia cómo se escriben y para qué se usan. Compilado o interpretado, tipado estático o dinámico, y el lugar de Python, Java, JavaScript y TypeScript.",
    orden: 18,
    requierePro: true,
    pasos: [
      "Ya sabes lo básico: variables, condicionales, bucles, funciones y estructuras de datos. Esas ideas son las mismas en todos los lenguajes. Lo que cambia es cómo se escriben, cómo se ejecutan y para qué se usa cada uno.",
      "Interpretado o compilado. Python y JavaScript se ejecutan con un intérprete, que lee el programa y lo va corriendo. Java se compila primero a bytecode, que después corre en la máquina virtual de Java (JVM). TypeScript se compila a JavaScript, revisando los tipos en el camino.",
      `Tipado dinámico o estático. En Python y JavaScript el tipo lo tiene el valor y los errores de tipo aparecen al correr. En Java y TypeScript declaras los tipos y el compilador avisa antes. Mira qué pasa al unir un texto con un número. Python se niega:
~~~python!
print("Edad: " + 15)
~~~
~~~salida
TypeError
~~~
Java, JavaScript y TypeScript convierten el número en texto:
~~~java
System.out.println("Edad: " + 15);
~~~
~~~javascript
console.log("Edad: " + 15);
~~~
~~~typescript
console.log("Edad: " + 15);
~~~
~~~salida
Edad: 15
~~~`,
      "Para qué se usa cada uno. Python: ciencia de datos, inteligencia artificial, automatizar tareas y enseñar a programar. Java: apps Android, sistemas de bancos y empresas grandes, servidores. JavaScript: todo lo que se mueve en una página web, y también servidores con Node.js. TypeScript: JavaScript con tipos, para proyectos web grandes hechos en equipo (Prodigia está escrita en TypeScript).",
      `El primer programa de siempre, en los cuatro:
~~~python
print("Hola, mundo")
~~~
~~~java
System.out.println("Hola, mundo");
~~~
~~~javascript
console.log("Hola, mundo");
~~~
~~~typescript
console.log("Hola, mundo");
~~~
~~~salida
Hola, mundo
~~~`,
      "No hay un lenguaje «mejor»: hay herramientas para trabajos distintos. Lo que aprendiste en Lo básico se transfiere: quien entiende un bucle en Python lo entiende en Java en minutos. En las secciones siguientes ves cada lenguaje por dentro y en qué se usa.",
    ],
    visuales: [
      cuadros(1, "¿Cómo se ejecuta?", ["Python: lo lee y lo corre un intérprete", "JavaScript: lo corre el navegador o Node.js", "Java: se compila a bytecode y lo corre la JVM", "TypeScript: se revisa, se compila a JavaScript y corre como JavaScript"]),
      cuadros(3, "¿Para qué se usa?", ["Python: datos e inteligencia artificial", "Java: Android y empresas", "JavaScript: la web", "TypeScript: proyectos web grandes"]),
    ],
    quiz: [
      {
        pregunta: "¿Qué lenguaje entienden directamente todos los navegadores?",
        opciones: ["Python", "JavaScript", "Java"],
        respuesta: "JavaScript",
        explicacion: "JavaScript es el lenguaje de las páginas web; TypeScript se compila a JavaScript para correr ahí.",
      },
      {
        pregunta: `¿Qué pasa al correr esto en Python?
~~~python
print("Puntos: " + 10)
~~~`,
        opciones: ["Imprime Puntos: 10", "Falla con TypeError", "Imprime Puntos: 10.0"],
        respuesta: "Falla con TypeError",
        explicacion: "Python no une texto con números por su cuenta: hay que convertir con str(10).",
        verifica: { tipo: "error", error: "TypeError" },
      },
      {
        pregunta: "¿Qué hace el compilador de TypeScript antes de ejecutar?",
        opciones: ["Revisa los tipos y lo convierte a JavaScript", "Lo convierte a Python", "Lo ejecuta en la JVM"],
        respuesta: "Revisa los tipos y lo convierte a JavaScript",
        explicacion: "Los tipos se revisan al compilar y desaparecen en el JavaScript que se ejecuta.",
      },
    ],
  }),

  // ------------------------------------------------------------------ Python
  en("python", {
    slug: "codia-clase-python-1-sintaxis",
    nombre: "Python 1: un lenguaje que se lee casi como inglés",
    descripcion: "Bloques con sangría, f-strings, listas y bucles, las tres operaciones de división y las comprensiones de lista.",
    orden: 19,
    requierePro: true,
    pasos: [
      `Python se diseñó para leerse fácil. No usa punto y coma ni llaves: los bloques se marcan con dos puntos y sangría de 4 espacios.
~~~python
edad = 16
if edad >= 18:
    print("Puede votar")
else:
    print("Todavía no")
print("Fin")
~~~
~~~salida
Todavía no
Fin
~~~`,
      `La sangría no es decoración: si falta, el programa ni arranca.
~~~python!
if True:
print("hola")
~~~
~~~salida
IndentationError
~~~`,
      `Las f-strings meten variables dentro del texto con llaves, y print separa con un espacio lo que le pasas con comas.
~~~python
nombre = "Ana"
puntos = 120
print(f"{nombre} tiene {puntos} puntos")
print(nombre, puntos)
~~~
~~~salida
Ana tiene 120 puntos
Ana 120
~~~`,
      `Listas y el bucle for, que recorre directamente los elementos. sum y len resuelven el promedio en una línea.
~~~python
notas = [7, 9, 6]
for n in notas:
    print(n * 2)
print(sum(notas) / len(notas))
~~~
~~~salida
14
18
12
7.333333333333333
~~~`,
      `Tres operaciones que confunden al principio: / siempre da decimal, // es la división entera y ** es la potencia.
~~~python
print(7 / 2)
print(7 // 2)
print(2 ** 10)
~~~
~~~salida
3.5
3
1024
~~~`,
      `Las comprensiones de lista construyen una lista nueva en una sola línea: «x por x, para cada x del 1 al 5».
~~~python
cuadrados = [x * x for x in range(1, 6)]
print(cuadrados)
~~~
~~~salida
[1, 4, 9, 16, 25]
~~~`,
    ],
    visuales: [cuadros(0, "Lo propio de Python", ["Bloques con dos puntos y sangría", "f-strings: f\"{variable}\"", "/ decimal, // entera, ** potencia", "Comprensiones: [x * x for x in lista]"])],
    quiz: [
      {
        pregunta: `¿Qué imprime?
~~~python
print(9 // 2, 9 / 2)
~~~`,
        opciones: ["4 4.5", "4.5 4.5", "4 4"],
        respuesta: "4 4.5",
        explicacion: "// es la división entera (4) y / siempre da decimal (4.5).",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "¿Cómo marca Python dónde empieza y termina un bloque?",
        opciones: ["Con llaves", "Con la sangría", "Con punto y coma"],
        respuesta: "Con la sangría",
        explicacion: "Dos puntos al final de la línea y las de adentro corridas 4 espacios.",
      },
      {
        pregunta: `¿Qué imprime?
~~~python
print([x * 2 for x in [1, 2, 3]])
~~~`,
        opciones: ["[2, 4, 6]", "[1, 2, 3, 1, 2, 3]", "[2, 4, 6, 2]"],
        respuesta: "[2, 4, 6]",
        explicacion: "La comprensión multiplica cada elemento por 2.",
        verifica: { tipo: "salida" },
      },
    ],
  }),
  en("python", {
    slug: "codia-clase-python-2-diccionarios-y-funciones",
    nombre: "Python 2: diccionarios, funciones y módulos",
    descripcion: "Guardar datos por nombre con diccionarios, escribir funciones con valores por defecto, importar módulos y evitar el KeyError.",
    orden: 20,
    requierePro: true,
    pasos: [
      `Un diccionario guarda pares clave-valor: buscas por nombre en vez de por posición.
~~~python
alumno = {"nombre": "Luis", "edad": 15}
alumno["edad"] = 16
print(alumno["nombre"], alumno["edad"])
print(len(alumno))
~~~
~~~salida
Luis 16
2
~~~`,
      `Para recorrerlo, items() da cada clave con su valor (en el orden en que se agregaron).
~~~python
precios = {"pan": 2, "leche": 3}
for producto, precio in precios.items():
    print(producto, precio)
~~~
~~~salida
pan 2
leche 3
~~~`,
      `Las funciones se definen con def. Un parámetro puede tener un valor por defecto, que se usa si no lo pasas.
~~~python
def saludar(nombre, saludo="Hola"):
    return f"{saludo}, {nombre}"

print(saludar("Ana"))
print(saludar("Ana", "Buenas"))
~~~
~~~salida
Hola, Ana
Buenas, Ana
~~~`,
      `Python trae muchos módulos listos. Con import los usas: math tiene raíces, pi y mucho más.
~~~python
import math
print(math.sqrt(81))
print(math.pi > 3)
~~~
~~~salida
9.0
True
~~~`,
      `El error típico de los diccionarios: pedir una clave que no existe.
~~~python!
edades = {"Ana": 15}
print(edades["Luis"])
~~~
~~~salida
KeyError
~~~
Con get pides la clave y das un valor por si no está:
~~~python
edades = {"Ana": 15}
print(edades.get("Luis", 0))
~~~
~~~salida
0
~~~`,
    ],
    visuales: [cuadros(0, "Diccionarios en Python", ["d[\"clave\"] = valor guarda o cambia", "for k, v in d.items() recorre", "d.get(\"clave\", 0) no falla si falta"])],
    quiz: [
      {
        pregunta: `¿Qué imprime?
~~~python
d = {"a": 1, "b": 2}
d["a"] = 5
print(d["a"] + d["b"])
~~~`,
        opciones: ["7", "3", "6"],
        respuesta: "7",
        explicacion: "d[\"a\"] pasa a valer 5, y 5 + 2 = 7.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué pasa al correr esto?
~~~python
print({"x": 1}["y"])
~~~`,
        opciones: ["Imprime None", "Falla con KeyError", "Imprime 0"],
        respuesta: "Falla con KeyError",
        explicacion: "La clave «y» no existe. Con .get(\"y\") devolvería None sin fallar.",
        verifica: { tipo: "error", error: "KeyError" },
      },
      {
        pregunta: "¿Para qué sirve import en Python?",
        opciones: ["Para usar código de otro módulo, como math", "Para crear una variable", "Para imprimir en pantalla"],
        respuesta: "Para usar código de otro módulo, como math",
        explicacion: "import math trae las funciones del módulo math (sqrt, pi, etc.).",
      },
    ],
  }),
  en("python", {
    slug: "codia-clase-python-3-usos",
    nombre: "Python 3: dónde se usa — datos, automatización e inteligencia artificial",
    descripcion: "Por qué Python es el lenguaje de los datos y la IA, con ejemplos chicos de análisis, orden y conteo de palabras, y cuál es su punto débil.",
    orden: 21,
    requierePro: true,
    pasos: [
      "Python domina en ciencia de datos e inteligencia artificial (con bibliotecas como NumPy, pandas, scikit-learn y PyTorch), en la automatización de tareas (renombrar archivos, leer hojas de cálculo, descargar datos), en servidores web (Django y Flask) y en la enseñanza.",
      `Un análisis de datos chico, sin ninguna biblioteca: máximo, mínimo y promedio.
~~~python
temperaturas = [21, 25, 19, 30, 24]
print("Máxima:", max(temperaturas))
print("Mínima:", min(temperaturas))
print("Promedio:", sum(temperaturas) / len(temperaturas))
~~~
~~~salida
Máxima: 30
Mínima: 19
Promedio: 23.8
~~~`,
      `Automatizar es ordenar y limpiar datos en pocas líneas: aquí, poner mayúscula inicial y ordenar alfabéticamente.
~~~python
nombres = ["sofía", "ana", "Luis", "bruno"]
ordenados = sorted(n.capitalize() for n in nombres)
print(ordenados)
~~~
~~~salida
['Ana', 'Bruno', 'Luis', 'Sofía']
~~~`,
      `Contar palabras es la base del análisis de texto (y de cómo empiezan muchos modelos de lenguaje).
~~~python
texto = "el gato y el perro y el pez"
conteo = {}
for palabra in texto.split():
    conteo[palabra] = conteo.get(palabra, 0) + 1
print(conteo["el"], conteo["y"])
~~~
~~~salida
3 2
~~~`,
      "Por qué Python ganó en IA: la sintaxis es corta, hay miles de bibliotecas y la comunidad científica lo adoptó. Su punto débil es la velocidad: para cálculos pesados es más lento que Java, y por eso las bibliotecas grandes están escritas en C por dentro y Python solo las «dirige».",
    ],
    visuales: [cuadros(0, "Python en el mundo real", ["Datos e IA: NumPy, pandas, PyTorch", "Automatizar: archivos, planillas, descargas", "Web: Django y Flask", "Punto débil: la velocidad"])],
    quiz: [
      {
        pregunta: `¿Qué imprime?
~~~python
print(max([3, 8, 2]) - min([3, 8, 2]))
~~~`,
        opciones: ["6", "8", "11"],
        respuesta: "6",
        explicacion: "El máximo es 8 y el mínimo 2: 8 − 2 = 6.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "¿En qué área se usa más Python?",
        opciones: ["Apps de iPhone", "Ciencia de datos e inteligencia artificial", "Animar páginas web en el navegador"],
        respuesta: "Ciencia de datos e inteligencia artificial",
        explicacion: "Bibliotecas como NumPy, pandas y PyTorch lo hicieron el estándar en datos e IA.",
      },
      {
        pregunta: `¿Qué imprime?
~~~python
palabras = "a b a".split()
print(palabras.count("a"))
~~~`,
        opciones: ["1", "2", "3"],
        respuesta: "2",
        explicacion: "split separa por espacios: [\"a\", \"b\", \"a\"], y «a» aparece 2 veces.",
        verifica: { tipo: "salida" },
      },
    ],
  }),

  // ------------------------------------------------------------------ Java
  en("java", {
    slug: "codia-clase-java-1-estructura",
    nombre: "Java 1: tipos declarados y todo dentro de una clase",
    descripcion: "Cómo es un programa Java, por qué se compila, los tipos básicos, los métodos static, los arreglos y la división entera.",
    orden: 22,
    requierePro: true,
    pasos: [
      "Un programa Java completo es una clase con un método main: public class Main, y adentro public static void main(String[] args). En estas lecciones mostramos solo lo que va dentro de main. Java se compila: javac revisa todo el programa y lo convierte en bytecode, que después ejecuta la máquina virtual de Java (JVM). Por eso se dice «escribe una vez, corre en cualquier lado».",
      `Cada variable declara su tipo: int (entero), double (decimal), String (texto) y boolean (verdadero o falso).
~~~java
int edad = 16;
double altura = 1.68;
String nombre = "Luis";
boolean estudia = true;
System.out.println(nombre + " tiene " + edad);
System.out.println(altura * 2);
System.out.println(estudia);
~~~
~~~salida
Luis tiene 16
3.36
true
~~~`,
      `El compilador atrapa los errores de tipo antes de ejecutar nada:
~~~java!
int edad = "dieciseis";
~~~
~~~salida
error de compilación
~~~`,
      `Las funciones en Java se llaman métodos y también declaran tipos: el del resultado y el de cada parámetro.
~~~java
static int doble(int n) {
    return n * 2;
}
System.out.println(doble(21));
~~~
~~~salida
42
~~~`,
      `Los arreglos tienen tamaño fijo, y el for de Java tiene una forma corta para recorrerlos.
~~~java
int[] notas = {7, 9, 6};
int suma = 0;
for (int n : notas) {
    suma += n;
}
System.out.println(suma);
System.out.println(suma / notas.length);
~~~
~~~salida
22
7
~~~`,
      `Ojo con la división: entre dos int, Java descarta los decimales. Con un double en la cuenta, el resultado es decimal.
~~~java
System.out.println(7 / 2);
System.out.println(7 / 2.0);
~~~
~~~salida
3
3.5
~~~`,
    ],
    visuales: [cuadros(0, "Cómo corre Java", ["Escribes Main.java", "javac revisa y compila a bytecode", "La JVM ejecuta el bytecode en cualquier sistema"])],
    quiz: [
      {
        pregunta: `¿Qué imprime?
~~~java
System.out.println(10 / 4);
~~~`,
        opciones: ["2.5", "2", "3"],
        respuesta: "2",
        explicacion: "10 y 4 son int: la división entera da 2.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué pasa con este código?
~~~java
String s = 5;
~~~`,
        opciones: ["Imprime 5", "No compila: error de compilación", "Guarda null"],
        respuesta: "No compila: error de compilación",
        explicacion: "Un int no se puede guardar en una variable String.",
        verifica: { tipo: "error", error: "error de compilación" },
      },
      {
        pregunta: "¿Qué ejecuta los programas Java ya compilados?",
        opciones: ["El navegador", "La máquina virtual de Java (JVM)", "El intérprete de Python"],
        respuesta: "La máquina virtual de Java (JVM)",
        explicacion: "javac genera bytecode y la JVM lo ejecuta.",
      },
    ],
  }),
  en("java", {
    slug: "codia-clase-java-2-objetos",
    nombre: "Java 2: clases y objetos",
    descripcion: "La idea central de Java: una clase es un molde y un objeto es algo concreto hecho con ese molde. Constructores, métodos, ArrayList y un error en tiempo de ejecución.",
    orden: 23,
    requierePro: true,
    pasos: [
      "Java es un lenguaje orientado a objetos. Una clase es un molde: dice qué datos (atributos) y qué acciones (métodos) tiene algo. Un objeto es una cosa concreta hecha con ese molde, con sus propios datos.",
      `Una clase Mascota con un constructor (el método que arma el objeto) y un método. Con new se crea un objeto.
~~~java
static class Mascota {
    String nombre;
    int edad;

    Mascota(String nombre, int edad) {
        this.nombre = nombre;
        this.edad = edad;
    }

    String presentarse() {
        return nombre + " tiene " + edad;
    }
}
Mascota m = new Mascota("Toby", 3);
System.out.println(m.presentarse());
~~~
~~~salida
Toby tiene 3
~~~`,
      `Cada objeto guarda sus propios datos: sumar en uno no cambia el otro.
~~~java
static class Contador {
    int valor = 0;

    void sumar() {
        valor++;
    }
}
Contador a = new Contador();
Contador b = new Contador();
a.sumar();
a.sumar();
b.sumar();
System.out.println(a.valor + " " + b.valor);
~~~
~~~salida
2 1
~~~`,
      `Para listas que crecen se usa ArrayList, que hay que importar. Entre los signos < > va el tipo de lo que guarda.
~~~java
import java.util.ArrayList;
ArrayList<String> nombres = new ArrayList<>();
nombres.add("Ana");
nombres.add("Luis");
nombres.add("Bea");
System.out.println(nombres.size());
System.out.println(nombres.get(1));
System.out.println(nombres);
~~~
~~~salida
3
Luis
[Ana, Luis, Bea]
~~~`,
      `Hay errores que el compilador no puede ver, porque dependen de los datos: aparecen al ejecutar.
~~~java!
int[] a = {1, 2, 3};
System.out.println(a[3]);
~~~
~~~salida
ArrayIndexOutOfBoundsException
~~~`,
    ],
    visuales: [cuadros(1, "Clase y objeto", ["Clase: el molde (Mascota)", "Objeto: algo concreto (Toby, 3 años)", "new crea el objeto; el constructor lo llena"])],
    quiz: [
      {
        pregunta: `¿Qué imprime?
~~~java
static class Caja {
    int n;

    Caja(int n) {
        this.n = n;
    }
}
Caja c = new Caja(5);
c.n = c.n + 2;
System.out.println(c.n);
~~~`,
        opciones: ["5", "7", "2"],
        respuesta: "7",
        explicacion: "El objeto empieza con n = 5 y después se le suma 2.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "¿Qué es un objeto en Java?",
        opciones: ["Un tipo de bucle", "Una cosa concreta creada con el molde de una clase", "Un archivo .java"],
        respuesta: "Una cosa concreta creada con el molde de una clase",
        explicacion: "La clase es el molde; con new se crean objetos a partir de él.",
      },
      {
        pregunta: `¿Qué imprime?
~~~java
import java.util.ArrayList;
ArrayList<Integer> xs = new ArrayList<>();
xs.add(4);
xs.add(8);
System.out.println(xs.size() + xs.get(0));
~~~`,
        opciones: ["6", "12", "24"],
        respuesta: "6",
        explicacion: "size() es 2 y get(0) es 4: 2 + 4 = 6.",
        verifica: { tipo: "salida" },
      },
    ],
  }),
  en("java", {
    slug: "codia-clase-java-3-usos",
    nombre: "Java 3: dónde se usa — Android, empresas y servidores",
    descripcion: "Por qué bancos, empresas y Android confían en Java, con un ejemplo de cuenta bancaria, un HashMap de inventario y el precio de su seguridad: escribir más.",
    orden: 24,
    requierePro: true,
    pasos: [
      "Java nació en 1995 con la promesa de «escribe una vez, corre en cualquier lado»: el mismo bytecode corre en Windows, Mac, Linux o un teléfono. Hoy está en las apps Android (junto con Kotlin), en los sistemas de bancos y empresas grandes, en servidores (con Spring) y en videojuegos como la edición Java de Minecraft.",
      "Por qué lo eligen las empresas: los tipos estrictos y el compilador atrapan muchos errores antes de que el sistema llegue a los usuarios, la JVM es muy rápida, y organizar todo en clases ayuda a que cientos de personas trabajen en el mismo código.",
      `Un ejemplo típico de empresa: una cuenta bancaria. El saldo es private (solo la propia clase lo toca) y se cambia con métodos que controlan las reglas, como no retirar más de lo que hay.
~~~java
static class Cuenta {
    private int saldo = 0;

    void depositar(int monto) {
        saldo += monto;
    }

    boolean retirar(int monto) {
        if (monto > saldo) {
            return false;
        }
        saldo -= monto;
        return true;
    }

    int getSaldo() {
        return saldo;
    }
}
Cuenta c = new Cuenta();
c.depositar(100);
System.out.println(c.retirar(30));
System.out.println(c.retirar(500));
System.out.println(c.getSaldo());
~~~
~~~salida
true
false
70
~~~`,
      `Un inventario con HashMap, el diccionario de Java: guarda pares clave-valor.
~~~java
import java.util.HashMap;
HashMap<String, Integer> stock = new HashMap<>();
stock.put("lapiz", 10);
stock.put("cuaderno", 4);
stock.put("lapiz", stock.get("lapiz") - 3);
System.out.println(stock.get("lapiz"));
System.out.println(stock.containsKey("goma"));
~~~
~~~salida
7
false
~~~`,
      `El precio de esa seguridad: Java pide escribir más. Lo que en Python es una línea de print, en Java va dentro de una clase y de un main, con el tipo de cada cosa declarado:
~~~java
String saludo = "hola";
System.out.println(saludo);
~~~
~~~salida
hola
~~~
Se escribe más, pero el compilador te protege más: por eso brilla en sistemas grandes que tienen que funcionar durante años.`,
    ],
    visuales: [cuadros(0, "Java en el mundo real", ["Apps Android", "Bancos y empresas", "Servidores con Spring", "Minecraft (edición Java)"])],
    quiz: [
      {
        pregunta: `¿Qué imprime?
~~~java
int saldo = 50;
int retiro = 80;
if (retiro > saldo) {
    System.out.println("Fondos insuficientes");
} else {
    saldo -= retiro;
    System.out.println(saldo);
}
~~~`,
        opciones: ["-30", "Fondos insuficientes", "50"],
        respuesta: "Fondos insuficientes",
        explicacion: "80 es mayor que 50, así que entra al if y no descuenta nada.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "¿En qué se usa mucho Java?",
        opciones: ["Apps Android y sistemas de empresas", "Solo páginas web en el navegador", "Hojas de cálculo"],
        respuesta: "Apps Android y sistemas de empresas",
        explicacion: "Android, bancos, empresas y servidores son su terreno principal.",
      },
      {
        pregunta: "¿Qué significa que un atributo sea private?",
        opciones: ["Que es constante", "Que solo lo puede usar el código de su propia clase", "Que se borra al terminar el programa"],
        respuesta: "Que solo lo puede usar el código de su propia clase",
        explicacion: "Así nadie cambia el saldo sin pasar por las reglas de depositar y retirar.",
      },
    ],
  }),

  // ------------------------------------------------------------------ JavaScript
  en("javascript", {
    slug: "codia-clase-javascript-1-sintaxis",
    nombre: "JavaScript 1: el lenguaje de la web",
    descripcion: "Por qué JavaScript está en todas las páginas, const y let, == contra ===, los métodos de arreglos y cómo son sus números.",
    orden: 25,
    requierePro: true,
    pasos: [
      "JavaScript es el único lenguaje que entienden todos los navegadores: cada botón que reacciona, cada menú que se abre y cada animación de una página lo usan. Fuera del navegador corre con Node.js.",
      `const para lo que no cambia y let para lo que sí. Un const no se puede reasignar:
~~~javascript
const nombre = "Ana";
let puntos = 10;
puntos = puntos + 5;
console.log(nombre + " tiene " + puntos);
~~~
~~~salida
Ana tiene 15
~~~
~~~javascript!
const vidas = 3;
vidas = 2;
~~~
~~~salida
TypeError
~~~`,
      `== compara convirtiendo tipos y da sorpresas; === exige el mismo valor y el mismo tipo. Usa siempre ===.
~~~javascript
console.log(5 == "5");
console.log(5 === "5");
console.log(0 == false);
~~~
~~~salida
true
false
true
~~~`,
      `Los arreglos traen métodos muy usados: map transforma cada elemento, filter se queda con algunos y join los une en un texto.
~~~javascript
const notas = [7, 9, 6];
const dobles = notas.map((n) => n * 2);
const aprobadas = notas.filter((n) => n >= 7);
console.log(dobles.join(", "));
console.log(aprobadas.length);
~~~
~~~salida
14, 18, 12
2
~~~`,
      `Todos los números son del mismo tipo (no hay enteros aparte): 7 / 2 da 3.5 y, para la parte entera, se usa Math.floor. Los decimales se guardan en binario, y por eso aparecen restos como en 0.1 + 0.2.
~~~javascript
console.log(7 / 2);
console.log(Math.floor(7 / 2));
console.log(0.1 + 0.2);
~~~
~~~salida
3.5
3
0.30000000000000004
~~~`,
    ],
    visuales: [cuadros(1, "JavaScript en la web", ["El navegador lo ejecuta en cada página", "const y let declaran variables", "Usa === para comparar", "map, filter y join para arreglos"])],
    quiz: [
      {
        pregunta: `¿Qué imprime?
~~~javascript
console.log("3" + 4);
~~~`,
        opciones: ["7", "34", "Error"],
        respuesta: "34",
        explicacion: "Con un texto de por medio, + une: «3» y «4» dan «34».",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué imprime?
~~~javascript
console.log([1, 2, 3].map((x) => x * x).join("-"));
~~~`,
        opciones: ["1-4-9", "1-2-3", "2-4-6"],
        respuesta: "1-4-9",
        explicacion: "map eleva cada número al cuadrado y join los une con guiones.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "¿Qué diferencia hay entre == y ===?",
        opciones: ["Ninguna", "=== compara también el tipo", "== es más estricto"],
        respuesta: "=== compara también el tipo",
        explicacion: "5 == \"5\" da true porque convierte; 5 === \"5\" da false.",
      },
    ],
  }),
  en("javascript", {
    slug: "codia-clase-javascript-2-objetos-y-funciones",
    nombre: "JavaScript 2: objetos, funciones flecha y JSON",
    descripcion: "Objetos con propiedades, funciones normales y flecha, desestructuración, JSON (el formato de datos de la web) y el famoso undefined.",
    orden: 26,
    requierePro: true,
    pasos: [
      `Un objeto agrupa datos con nombre, como un diccionario de Python.
~~~javascript
const alumno = { nombre: "Luis", edad: 15 };
alumno.edad = 16;
console.log(alumno.nombre, alumno.edad);
console.log(Object.keys(alumno).length);
~~~
~~~salida
Luis 16
2
~~~`,
      `Hay dos formas de escribir funciones: la normal y la flecha, más corta.
~~~javascript
function sumar(a, b) {
  return a + b;
}
const restar = (a, b) => a - b;
console.log(sumar(5, 3), restar(5, 3));
~~~
~~~salida
8 2
~~~`,
      `La desestructuración saca propiedades a variables, y los tres puntos copian un arreglo dentro de otro.
~~~javascript
const punto = { x: 3, y: 4 };
const { x, y } = punto;
console.log(x * y);
const lista = [1, 2];
const mas = [...lista, 3];
console.log(mas.length);
~~~
~~~salida
12
3
~~~`,
      `JSON es el formato con el que viajan los datos por internet. JSON.stringify convierte un objeto en texto y JSON.parse hace lo contrario.
~~~javascript
const datos = { mundo: "Codia", nivel: 4 };
const texto = JSON.stringify(datos);
console.log(texto);
const otra = JSON.parse(texto);
console.log(otra.nivel + 1);
~~~
~~~salida
{"mundo":"Codia","nivel":4}
5
~~~`,
      `Pedir una propiedad que no existe no falla: da undefined.
~~~javascript
const o = { a: 1 };
console.log(o.b);
~~~
~~~salida
undefined
~~~
Pero pedirle algo a undefined sí falla, y es uno de los errores más comunes de la web:
~~~javascript!
const o = { a: 1 };
console.log(o.b.c);
~~~
~~~salida
TypeError
~~~`,
    ],
    visuales: [cuadros(3, "Un dato que viaja por internet", ["Objeto en el navegador", "JSON.stringify: lo convierte en texto", "Viaja al servidor", "JSON.parse: vuelve a ser objeto"])],
    quiz: [
      {
        pregunta: `¿Qué imprime?
~~~javascript
const p = { a: 2, b: 3 };
console.log(p.a * p.b);
~~~`,
        opciones: ["5", "6", "23"],
        respuesta: "6",
        explicacion: "p.a es 2 y p.b es 3: 2 × 3 = 6.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué imprime?
~~~javascript
console.log(JSON.stringify({ x: 1 }));
~~~`,
        opciones: ["{\"x\":1}", "{ x: 1 }", "x:1"],
        respuesta: "{\"x\":1}",
        explicacion: "JSON pone las claves entre comillas dobles y no deja espacios.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué pasa al correr esto?
~~~javascript
const u = undefined;
console.log(u.largo);
~~~`,
        opciones: ["Imprime undefined", "Falla con TypeError", "Imprime 0"],
        respuesta: "Falla con TypeError",
        explicacion: "No se puede leer una propiedad de undefined.",
        verifica: { tipo: "error", error: "TypeError" },
      },
    ],
  }),
  en("javascript", {
    slug: "codia-clase-javascript-3-usos",
    nombre: "JavaScript 3: dónde se usa — páginas web, servidores y apps",
    descripcion: "Del navegador a los servidores y los teléfonos: React, Node.js, React Native y Electron, la idea de callback y por qué tanta flexibilidad pide cuidado.",
    orden: 27,
    requierePro: true,
    pasos: [
      "En el navegador, JavaScript cambia la página cuando haces algo: un clic, escribir, deslizar. Las páginas grandes usan frameworks como React, Vue o Angular. Prodigia, por ejemplo, está hecha con React.",
      "Fuera del navegador está en todas partes: servidores con Node.js, apps de teléfono con React Native (como la app Android de Prodigia) y programas de escritorio con Electron (como el editor VS Code).",
      `La web funciona con la idea de «cuando pase esto, haz aquello»: le pasas una función a otra para que la llame en el momento justo. Esa función se llama callback.
~~~javascript
function alHacerClic(accion) {
  console.log("Clic recibido");
  accion();
}
alHacerClic(() => console.log("Abriendo el panel"));
~~~
~~~salida
Clic recibido
Abriendo el panel
~~~`,
      `Un carrito de compras, típico de una tienda en línea: reduce recorre la lista acumulando el total.
~~~javascript
const carrito = [
  { producto: "lapiz", precio: 2 },
  { producto: "cuaderno", precio: 5 },
];
const total = carrito.reduce((suma, item) => suma + item.precio, 0);
console.log("Total: " + total);
~~~
~~~salida
Total: 7
~~~`,
      `Ventaja y cuidado: JavaScript está en todos lados y es muy flexible, pero esa flexibilidad trae sorpresas que no avisan:
~~~javascript
console.log("3" + 4);
console.log(1 == "1");
~~~
~~~salida
34
true
~~~
Por eso los proyectos grandes suelen pasarse a TypeScript, que agrega los tipos.`,
    ],
    visuales: [cuadros(0, "JavaScript en el mundo real", ["Páginas web: React, Vue, Angular", "Servidores: Node.js", "Apps de teléfono: React Native", "Escritorio: Electron"])],
    quiz: [
      {
        pregunta: "¿Dónde corre JavaScript, además del navegador?",
        opciones: ["Solo en el navegador", "En servidores, con Node.js", "En la JVM"],
        respuesta: "En servidores, con Node.js",
        explicacion: "Node.js permite usar JavaScript fuera del navegador.",
      },
      {
        pregunta: `¿Qué imprime?
~~~javascript
console.log([2, 3, 4].reduce((a, b) => a + b, 0));
~~~`,
        opciones: ["9", "24", "234"],
        respuesta: "9",
        explicacion: "reduce suma todo empezando en 0: 2 + 3 + 4 = 9.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "¿Qué es un callback?",
        opciones: ["Un error de JavaScript", "Una función que se pasa a otra para que la llame después", "Una variable constante"],
        respuesta: "Una función que se pasa a otra para que la llame después",
        explicacion: "Es la base de «cuando pase esto, haz aquello» en la web.",
      },
    ],
  }),

  // ------------------------------------------------------------------ TypeScript
  en("typescript", {
    slug: "codia-clase-typescript-1-tipos",
    nombre: "TypeScript 1: JavaScript con tipos",
    descripcion: "Qué agrega TypeScript a JavaScript: anotaciones de tipo, errores antes de ejecutar, inferencia y funciones tipadas.",
    orden: 28,
    requierePro: true,
    pasos: [
      "TypeScript es JavaScript con tipos. El compilador revisa que cada valor sea del tipo esperado y después genera JavaScript normal: los tipos desaparecen al ejecutar. Todo programa JavaScript válido es casi siempre TypeScript válido.",
      `Las anotaciones van después del nombre, con dos puntos:
~~~typescript
let nombre: string = "Ana";
let edad: number = 15;
let activo: boolean = true;
console.log(nombre, edad + 1, activo);
~~~
~~~salida
Ana 16 true
~~~`,
      `Lo que en JavaScript sería un error al ejecutar (o un error silencioso), aquí ni siquiera compila:
~~~typescript!
let puntos: number = 10;
puntos = "diez";
~~~
~~~salida
error de compilación
~~~`,
      `No hace falta escribir todos los tipos: TypeScript los deduce (inferencia). Sabe que precios es una lista de números y no deja meter un texto.
~~~typescript
const precios = [3, 5, 2];
const total = precios.reduce((a, b) => a + b, 0);
console.log(total.toFixed(2));
~~~
~~~salida
10.00
~~~
~~~typescript!
const precios = [3, 5, 2];
precios.push("gratis");
~~~
~~~salida
error de compilación
~~~`,
      `Las funciones declaran el tipo de sus parámetros y de su resultado, y quien las llama mal se entera antes de ejecutar.
~~~typescript
function promedio(notas: number[]): number {
  return notas.reduce((a, b) => a + b, 0) / notas.length;
}
console.log(promedio([6, 8, 10]));
~~~
~~~salida
8
~~~
~~~typescript!
function doble(n: number): number {
  return n * 2;
}
doble("4");
~~~
~~~salida
error de compilación
~~~`,
    ],
    visuales: [cuadros(0, "Cómo corre TypeScript", ["Escribes código con tipos", "tsc revisa los tipos", "Genera JavaScript sin tipos", "Corre como cualquier JavaScript"])],
    quiz: [
      {
        pregunta: `¿Qué pasa con este código?
~~~typescript
let x: string = 5;
~~~`,
        opciones: ["Guarda «5»", "No compila: error de compilación", "Guarda 5"],
        respuesta: "No compila: error de compilación",
        explicacion: "x es un string y 5 es un number: el compilador lo rechaza.",
        verifica: { tipo: "error", error: "error de compilación" },
      },
      {
        pregunta: "¿Qué queda de los tipos cuando el programa se ejecuta?",
        opciones: ["Nada: se borran al compilar a JavaScript", "Se revisan otra vez en cada línea", "Se guardan en un archivo aparte"],
        respuesta: "Nada: se borran al compilar a JavaScript",
        explicacion: "Los tipos solo existen para el compilador; lo que corre es JavaScript.",
      },
      {
        pregunta: `¿Qué imprime?
~~~typescript
const n: number = 7;
console.log(n * 3);
~~~`,
        opciones: ["21", "73", "777"],
        respuesta: "21",
        explicacion: "n es un número: 7 × 3 = 21.",
        verifica: { tipo: "salida" },
      },
    ],
  }),
  en("typescript", {
    slug: "codia-clase-typescript-2-interfaces",
    nombre: "TypeScript 2: interfaces, uniones y null",
    descripcion: "Describir la forma de un objeto con interface, limitar valores con tipos unión y tratar con cuidado lo que puede ser null.",
    orden: 29,
    requierePro: true,
    pasos: [
      `Una interface describe la forma que debe tener un objeto. Un signo de pregunta marca una propiedad opcional.
~~~typescript
interface Jugador {
  nombre: string;
  nivel: number;
  clan?: string;
}
const j: Jugador = { nombre: "Bea", nivel: 7 };
console.log(j.nombre, j.nivel);
console.log(j.clan === undefined);
~~~
~~~salida
Bea 7
true
~~~`,
      `Si falta una propiedad obligatoria, no compila:
~~~typescript!
interface Jugador {
  nombre: string;
  nivel: number;
}
const j: Jugador = { nombre: "Bea" };
~~~
~~~salida
error de compilación
~~~`,
      `Un tipo unión limita los valores posibles. Así, un rango solo puede ser uno de los que existen:
~~~typescript
type Rango = "bronce" | "plata" | "oro";
function siguiente(r: Rango): Rango {
  if (r === "bronce") return "plata";
  return "oro";
}
console.log(siguiente("bronce"));
~~~
~~~salida
plata
~~~
~~~typescript!
type Rango = "bronce" | "plata" | "oro";
const r: Rango = "diamante";
~~~
~~~salida
error de compilación
~~~`,
      `Si algo puede faltar, se escribe con | null, y el compilador obliga a revisarlo antes de usarlo.
~~~typescript
function largo(texto: string | null): number {
  if (texto === null) {
    return 0;
  }
  return texto.length;
}
console.log(largo("hola"), largo(null));
~~~
~~~salida
4 0
~~~`,
      "Por qué importa: en JavaScript, olvidarse de que algo puede ser null o undefined es una de las causas más comunes de errores en páginas web. TypeScript convierte ese olvido en un aviso del editor antes de que llegue a los usuarios.",
    ],
    visuales: [cuadros(0, "Herramientas de TypeScript", ["interface: la forma de un objeto", "prop?: propiedad opcional", "\"a\" | \"b\": solo esos valores", "| null: puede faltar, hay que revisarlo"])],
    quiz: [
      {
        pregunta: `¿Qué pasa con este código?
~~~typescript
interface P {
  x: number;
}
const p: P = { x: "1" };
~~~`,
        opciones: ["Compila y x vale «1»", "No compila: error de compilación", "Compila y x vale 1"],
        respuesta: "No compila: error de compilación",
        explicacion: "x tiene que ser number y le dan un string.",
        verifica: { tipo: "error", error: "error de compilación" },
      },
      {
        pregunta: `¿Qué imprime?
~~~typescript
type Color = "rojo" | "azul";
const c: Color = "azul";
console.log(c.toUpperCase());
~~~`,
        opciones: ["azul", "AZUL", "Azul"],
        respuesta: "AZUL",
        explicacion: "c es un texto: toUpperCase lo pasa a mayúsculas.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "¿Para qué sirve una interface?",
        opciones: ["Para dibujar la interfaz de una página", "Para describir la forma que debe tener un objeto", "Para importar módulos"],
        respuesta: "Para describir la forma que debe tener un objeto",
        explicacion: "Dice qué propiedades tiene y de qué tipo es cada una.",
      },
    ],
  }),
  en("typescript", {
    slug: "codia-clase-typescript-3-usos",
    nombre: "TypeScript 3: dónde se usa — proyectos grandes y equipos",
    descripcion: "Dónde se usa TypeScript, cómo ayuda a un equipo, un ejemplo realista con datos de una partida, genéricos y cuándo conviene JavaScript a secas.",
    orden: 30,
    requierePro: true,
    pasos: [
      "TypeScript se usa donde se usaría JavaScript, pero en proyectos grandes: páginas con React, Angular o Vue, servidores con Node.js y apps de teléfono con React Native. Lo creó Microsoft en 2012, y hoy lo usa buena parte de la industria web. Prodigia está escrita en TypeScript.",
      `La ventaja en equipo: el editor autocompleta y marca errores mientras escribes. Si alguien cambia el nombre de una propiedad, TypeScript señala todos los lugares que quedaron usando el nombre viejo:
~~~typescript!
interface Usuario {
  nombreCompleto: string;
}
const u: Usuario = { nombreCompleto: "Ana Paz" };
console.log(u.nombre);
~~~
~~~salida
error de compilación
~~~
En un proyecto de miles de archivos, eso evita muchísimos errores.`,
      `Un ejemplo realista: describir los datos de una partida y calcular la precisión.
~~~typescript
interface Partida {
  mundo: string;
  correctas: number;
  total: number;
}
function precision(p: Partida): string {
  return Math.round((p.correctas / p.total) * 100) + "%";
}
const partida: Partida = { mundo: "Codia", correctas: 8, total: 10 };
console.log(precision(partida));
~~~
~~~salida
80%
~~~`,
      `Los genéricos permiten escribir una función que sirve para cualquier tipo sin perder cuál es: T es «el tipo que sea».
~~~typescript
function primero<T>(lista: T[]): T {
  return lista[0];
}
const n = primero([4, 5, 6]);
const s = primero(["a", "b"]);
console.log(n + 1, s.toUpperCase());
~~~
~~~salida
5 A
~~~`,
      "El costo: hay que compilar y escribir tipos. Regla práctica: para un script chico o un proyecto de una sola persona, JavaScript alcanza; para un proyecto grande o hecho en equipo, TypeScript se paga solo.",
    ],
    visuales: [cuadros(0, "TypeScript en el mundo real", ["Páginas grandes con React o Angular", "Servidores con Node.js", "Apps con React Native", "Equipos grandes: el editor avisa los errores"])],
    quiz: [
      {
        pregunta: `¿Qué imprime?
~~~typescript
function total(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}
console.log(total([1, 2, 3]));
~~~`,
        opciones: ["6", "123", "3"],
        respuesta: "6",
        explicacion: "reduce suma la lista: 1 + 2 + 3 = 6.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "¿Quién creó TypeScript?",
        opciones: ["Google", "Microsoft", "Oracle"],
        respuesta: "Microsoft",
        explicacion: "Microsoft lo presentó en 2012.",
      },
      {
        pregunta: "¿Cuándo conviene más TypeScript que JavaScript?",
        opciones: ["En un script de diez líneas", "En proyectos grandes o hechos en equipo", "Nunca: son lo mismo"],
        respuesta: "En proyectos grandes o hechos en equipo",
        explicacion: "Los tipos ayudan a que muchas personas cambien el código sin romperlo.",
      },
    ],
  }),
];

export const LECCIONES_LENGUAJES: LeccionCodia[] = [...TECNICAS_LENGUAJES, ...CLASES_LENGUAJES];
