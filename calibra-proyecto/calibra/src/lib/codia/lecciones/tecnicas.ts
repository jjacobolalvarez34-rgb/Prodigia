import type { LeccionCodia } from "./tipos";

// 5 Técnicas GRATIS de Codia (orden 1-5): atajos para leer código sin
// ejecutarlo. Cada fragmento se ejecuta de verdad en lecciones.test.ts.
export const TECNICAS: LeccionCodia[] = [
  {
    slug: "codia-tecnica-tabla-seguimiento",
    nombre: "Trazar variables a mano con una tabla de seguimiento",
    descripcion: "Antes de adivinar qué imprime un fragmento, anotá cómo cambia cada variable línea por línea.",
    orden: 1,
    requierePro: false,
    pasos: [
      "Para saber qué imprime un fragmento no adivines: haz una tabla con una columna por variable y una fila por cada línea que cambia algo. Así no dependes de la memoria y encuentras el resultado paso a paso.",
      `Ejemplo resuelto. Sigue este programa:
~~~python
a = 3
b = 4
a = a + b
b = a - b
print(a, b)
~~~
Tabla: línea 1 deja a=3. Línea 2 deja a=3, b=4. Línea 3 calcula a + b = 7 y lo guarda en a: a=7, b=4. Línea 4 calcula a - b = 7 - 4 = 3 con el valor NUEVO de a y lo guarda en b: a=7, b=3. El print muestra:
~~~salida
7 3
~~~`,
      "Regla de oro: en a = a + b primero se calcula el lado derecho con los valores que las variables tienen AHORA, y recién después se guarda el resultado en el lado izquierdo. El signo = no es una igualdad de matemática: significa guarda esto en esa variable.",
      `El mismo programa en los otros tres lenguajes: la tabla es idéntica, solo cambia cómo se escribe.
~~~java
int a = 3;
int b = 4;
a = a + b;
b = a - b;
System.out.println(a + " " + b);
~~~
~~~javascript
let a = 3;
let b = 4;
a = a + b;
b = a - b;
console.log(a, b);
~~~
~~~typescript
let a: number = 3;
let b: number = 4;
a = a + b;
b = a - b;
console.log(a, b);
~~~
~~~salida
7 3
~~~`,
      `Trampa clásica: intercambiar dos variables sin una tercera se rompe. Trazalo:
~~~python
a = 1
b = 2
a = b
b = a
print(a, b)
~~~
Línea 3: a pasa a valer 2 y el 1 original se pierde. Línea 4: b = a copia ese 2. Las dos quedan iguales:
~~~salida
2 2
~~~
Para intercambiar necesitas una variable temporal: t = a, luego a = b y por último b = t.`,
      "Consejo de examen: tachá el valor viejo cada vez que una variable cambia y escribe el nuevo al lado. Si el fragmento tiene un bucle, agrega una fila por vuelta. Tardas un minuto y evitas casi todos los errores de lectura.",
    ],
    quiz: [
      {
        pregunta: `¿Qué imprime este programa?
~~~python
x = 5
y = x * 2
x = y - 3
print(x, y)
~~~`,
        opciones: ["7 10", "5 10", "7 7", "10 7"],
        respuesta: "7 10",
        explicacion: "x=5; y=10; x = y - 3 = 7 (y sigue valiendo 10). Se imprime 7 10.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `Si x vale 4 y luego se ejecuta x = x * x + 1, ¿cuánto vale x?
~~~python
x = 4
x = x * x + 1
print(x)
~~~`,
        opciones: ["17", "16", "9", "5"],
        respuesta: "17",
        explicacion: "Se calcula con el valor viejo: 4 * 4 + 1 = 17, y recién entonces se guarda en x.",
        verifica: { tipo: "salida" },
      },
    ],
  },
  {
    slug: "codia-tecnica-leer-bucles",
    nombre: "Leer un bucle: cuántas vueltas da y qué cambia en cada una",
    descripcion: "Tres preguntas para cualquier bucle: dónde empieza, cuándo termina y cuánto cambia por vuelta.",
    orden: 2,
    requierePro: false,
    pasos: [
      "Frente a un bucle haz siempre tres preguntas: ¿con qué valor arranca? ¿cuándo se corta? ¿qué cambia en cada vuelta? Con esas tres respuestas sabes cuántas vueltas da y no te pierdes.",
      `En un for con rango el límite superior NO se incluye: range(2, 6) recorre 2, 3, 4 y 5. Las vueltas son límite - inicio = 6 - 2 = 4.
~~~python
for i in range(2, 6):
    print(i)
~~~
~~~salida
2
3
4
5
~~~
En Java, JavaScript y TypeScript pasa lo mismo con la condición i < 6.
~~~java
for (int i = 2; i < 6; i++) {
    System.out.println(i);
}
~~~
~~~javascript
for (let i = 2; i < 6; i++) {
    console.log(i);
}
~~~
~~~typescript
for (let i = 2; i < 6; i++) {
    console.log(i);
}
~~~
~~~salida
2
3
4
5
~~~`,
      `En un while, mira qué cambia en cada vuelta y cuándo deja de cumplirse la condición. Ejemplo resuelto:
~~~python
n = 20
vueltas = 0
while n > 1:
    n = n // 2
    vueltas = vueltas + 1
print(vueltas, n)
~~~
Vuelta 1: n pasa de 20 a 10. Vuelta 2: a 5. Vuelta 3: a 2. Vuelta 4: a 1, y como 1 > 1 es falso el bucle termina.
~~~salida
4 1
~~~`,
      "Con un acumulador (total = total + algo) anotá el valor de total al final de cada vuelta. Si el bucle es de 4 vueltas, son 4 filas en tu tabla. No calcules todo de golpe.",
      "Cuidado con dos errores muy comunes: contar una vuelta de más o de menos por el límite (off-by-one) y olvidarte de que en Java, JavaScript y TypeScript con i <= 5 SÍ se incluye el 5 mientras que range(5) de Python llega hasta 4.",
    ],
    quiz: [
      {
        pregunta: "¿Cuántas vueltas da un for i in range(3, 8) en Python?",
        opciones: ["5", "4", "6", "8"],
        respuesta: "5",
        explicacion: "El 8 no se incluye: i toma 3, 4, 5, 6 y 7, o sea 8 - 3 = 5 vueltas.",
      },
      {
        pregunta: `¿Qué imprime este código?
~~~python
total = 0
for i in range(1, 5):
    total = total + i * 2
print(total)
~~~`,
        opciones: ["20", "10", "30", "12"],
        respuesta: "20",
        explicacion: "i = 1, 2, 3, 4: se suman 2, 4, 6 y 8 (acumulado 2, 6, 12, 20).",
        verifica: { tipo: "salida" },
      },
    ],
  },
  {
    slug: "codia-tecnica-errores-tipicos",
    nombre: "Reconocer los errores típicos por el mensaje",
    descripcion: "Cada error tiene un nombre y una causa habitual: aprender a leerlo te dice dónde mirar.",
    orden: 3,
    requierePro: false,
    pasos: [
      "Un error no es un fracaso: es una pista. El nombre del error te dice qué tipo de problema es y la línea te dice dónde buscar. Hay cinco que aparecen todo el tiempo.",
      `1) Error de sintaxis: el programa ni siquiera empieza. Casi siempre falta un dos puntos, un paréntesis, una llave o una comilla.
~~~python!
if 3 > 2
    print("si")
~~~
~~~salida
SyntaxError
~~~`,
      `2) Nombre inexistente: usaste una variable o función que no existe, muchas veces por un error de tipeo.
~~~python!
total = 10
print(totl)
~~~
~~~salida
NameError
~~~
En Java el mismo problema no llega a ejecutarse: el compilador lo frena antes.
~~~java!
int total = 10;
System.out.println(totl);
~~~
~~~salida
error de compilación
~~~`,
      `3) Índice fuera de rango: pediste la posición n en una lista de n elementos. Las posiciones van de 0 a n - 1.
~~~python!
datos = [4, 5, 6]
print(datos[3])
~~~
~~~salida
IndexError
~~~
~~~java!
int[] datos = {4, 5, 6};
System.out.println(datos[3]);
~~~
~~~salida
ArrayIndexOutOfBoundsException
~~~`,
      `4) División por cero: en Python y en Java con enteros es un error.
~~~python!
print(10 // 0)
~~~
~~~salida
ZeroDivisionError
~~~
~~~java!
System.out.println(10 / 0);
~~~
~~~salida
ArithmeticException
~~~
JavaScript es distinto: no falla, imprime Infinity.
~~~javascript
console.log(10 / 0);
~~~
~~~salida
Infinity
~~~`,
      `5) Tipos incompatibles: mezclar cosas que no se pueden combinar.
~~~python!
print("edad: " + 30)
~~~
~~~salida
TypeError
~~~
En Java y TypeScript el compilador lo detecta antes de ejecutar.
~~~typescript!
let edad: number = "treinta";
~~~
~~~salida
error de compilación
~~~`,
    ],
    quiz: [
      {
        pregunta: `¿Qué error produce este código?
~~~python
datos = [1, 2, 3]
print(datos[3])
~~~`,
        opciones: ["IndexError", "NameError", "SyntaxError", "ZeroDivisionError"],
        respuesta: "IndexError",
        explicacion: "La lista tiene posiciones 0, 1 y 2; pedir la 3 se sale de rango.",
        verifica: { tipo: "error", error: "IndexError" },
      },
      {
        pregunta: `¿Qué imprime este código en JavaScript?
~~~javascript
console.log(5 / 0);
~~~`,
        opciones: ["Infinity", "Un error de división por cero", "0", "undefined"],
        respuesta: "Infinity",
        explicacion: "JavaScript no lanza error al dividir por cero: da Infinity.",
        verifica: { tipo: "salida" },
      },
    ],
  },
  {
    slug: "codia-tecnica-division-entera-modulo",
    nombre: "División entera y resto: cuidado con los negativos",
    descripcion: "// en Python, / entre enteros en Java y Math.trunc en JavaScript: casi siempre coinciden, salvo con negativos.",
    orden: 4,
    requierePro: false,
    pasos: [
      `La división entera descarta los decimales y el resto (módulo, %) es lo que sobra. Con números positivos los cuatro lenguajes coinciden: 17 = 3 * 5 + 2.
~~~python
print(17 // 5, 17 % 5)
~~~
~~~salida
3 2
~~~
~~~java
System.out.println(17 / 5 + " " + 17 % 5);
~~~
~~~javascript
console.log(Math.trunc(17 / 5), 17 % 5);
~~~
~~~typescript
console.log(Math.trunc(17 / 5), 17 % 5);
~~~
~~~salida
3 2
~~~
En Java dos enteros ya dividen entero con /. En JavaScript y TypeScript el / siempre da decimales, por eso se usa Math.trunc.`,
      `Con negativos Python redondea hacia abajo (piso) y los demás hacia cero. Mismo cálculo, dos resultados:
~~~python
print(-7 // 2, -7 % 3)
~~~
~~~salida
-4 2
~~~
~~~java
System.out.println(-7 / 2 + " " + -7 % 3);
~~~
~~~salida
-3 -1
~~~
~~~javascript
console.log(Math.trunc(-7 / 2), -7 % 3);
~~~
~~~salida
-3 -1
~~~`,
      "Cómo recordarlo: en Python el resto lleva el signo del divisor (por eso -7 % 3 da 2); en Java, JavaScript y TypeScript lleva el signo del dividendo (por eso da -1). Si el fragmento no tiene negativos, no te preocupes: dan lo mismo.",
      `Uso práctico del resto: saber si un número es par (n % 2 == 0) o repetir un ciclo (i % 3 da 0, 1, 2, 0, 1, 2...).
~~~python
for i in range(6):
    print(i % 3)
~~~
~~~salida
0
1
2
0
1
2
~~~`,
    ],
    quiz: [
      {
        pregunta: `¿Qué imprime este código en Python?
~~~python
print(17 // 5, 17 % 5)
~~~`,
        opciones: ["3 2", "3.4 2", "2 3", "4 2"],
        respuesta: "3 2",
        explicacion: "17 // 5 es 3 (cociente entero) y 17 % 5 es 2 (resto).",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué imprime este código en Java?
~~~java
System.out.println(-7 / 2);
~~~`,
        opciones: ["-3", "-4", "-3.5", "3"],
        respuesta: "-3",
        explicacion: "Java trunca hacia cero: -3,5 pasa a -3. (Python daría -4 con //.)",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué imprime este código en Python?
~~~python
print(-7 // 2)
~~~`,
        opciones: ["-4", "-3", "-3.5", "4"],
        respuesta: "-4",
        explicacion: "Python redondea hacia abajo: -3,5 pasa a -4.",
        verifica: { tipo: "salida" },
      },
    ],
  },
  {
    slug: "codia-tecnica-complejidad-vistazo",
    nombre: "Complejidad de un vistazo: contar bucles anidados",
    descripcion: "Con contar cuántos bucles anidados recorren n ya sabes si el código es O(n) o O(n²).",
    orden: 5,
    requierePro: false,
    pasos: [
      "La complejidad temporal dice cómo crece el trabajo cuando crece n (por ejemplo, el largo de una lista). No mide segundos: mide cuántas veces se repite la operación principal.",
      `Regla de un vistazo: sin bucles sobre n es O(1); un bucle sobre n es O(n); dos bucles anidados sobre n son O(n²). Probalo contando cuántas veces corre total = total + 1 cuando n se duplica:
~~~python
def contar(n):
    total = 0
    for i in range(n):
        total = total + 1
    return total

print(contar(4), contar(8))
~~~
~~~salida
4 8
~~~
Con un bucle, al duplicar n el trabajo se duplica. Con dos anidados:
~~~python
def contar(n):
    total = 0
    for i in range(n):
        for j in range(n):
            total = total + 1
    return total

print(contar(4), contar(8))
~~~
~~~salida
16 64
~~~
Duplicar n multiplicó el trabajo por cuatro: es O(n²).`,
      `Bucles en secuencia se suman, no se multiplican: dos bucles de n vueltas, uno después del otro, hacen 2n operaciones, que sigue siendo O(n).
~~~python
def contar(n):
    total = 0
    for i in range(n):
        total = total + 1
    for j in range(n):
        total = total + 1
    return total

print(contar(4), contar(8))
~~~
~~~salida
8 16
~~~`,
      `Un bucle interno que siempre da 3 vueltas es una constante: el total es 3n, o sea O(n). Solo cuentan los bucles que dependen de n.
~~~python
def contar(n):
    total = 0
    for i in range(n):
        for j in range(3):
            total = total + 1
    return total

print(contar(4), contar(8))
~~~
~~~salida
12 24
~~~`,
    ],
    quiz: [
      {
        pregunta: "Un código tiene un bucle que va de 0 a n y, después (no adentro), otro bucle que va de 0 a n. ¿Cuál es su complejidad?",
        opciones: ["O(n)", "O(n²)", "O(1)", "O(2 elevado a n)"],
        respuesta: "O(n)",
        explicacion: "Se suman: n + n = 2n operaciones, que crece igual que n.",
      },
      {
        pregunta: `¿Qué devuelve contar(5)?
~~~python
def contar(n):
    total = 0
    for i in range(n):
        for j in range(n):
            total = total + 1
    return total

print(contar(5))
~~~`,
        opciones: ["25", "5", "10", "20"],
        respuesta: "25",
        explicacion: "Dos bucles anidados de n vueltas: 5 * 5 = 25.",
        verifica: { tipo: "salida" },
      },
    ],
  },
];
