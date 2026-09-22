import type { LeccionCodia } from "./tipos";

// 8 Clases PRO de Codia (orden 6-13). La primera es preview gratis
// (la primera fila requiere_pro=true). Progresivas y dependientes:
// variables y tipos -> condicionales -> bucles -> funciones -> listas y
// diccionarios -> recorridos y complejidad -> errores y depuración ->
// pilas, colas y conjuntos. Cada clase muestra el MISMO ejemplo en
// Python, Java, JavaScript y TypeScript en al menos tres de sus pasos.
export const CLASES: LeccionCodia[] = [
  // ------------------------------------------------------------------
  {
    slug: "codia-clase-01-variables-y-tipos",
    nombre: "Clase 1: Variables y tipos — guardar y nombrar datos",
    descripcion: "Qué es una variable, qué tipos básicos existen y cómo se escribe lo mismo en Python, Java, JavaScript y TypeScript.",
    orden: 6,
    requierePro: true,
    pasos: [
      "Una variable es un nombre que apunta a un valor guardado en memoria. Los tipos básicos son el entero (15), el texto (\"Ana\") y el booleano (verdadero o falso). Python y JavaScript deducen el tipo solos; Java y TypeScript te piden declararlo, y por eso detectan más errores antes de correr.",
      `Mismo programa en los cuatro lenguajes. Python:
~~~python
edad = 15
nombre = "Ana"
mayor = edad >= 18
print(nombre, edad, mayor)
~~~
~~~salida
Ana 15 False
~~~
Java, JavaScript y TypeScript:
~~~java
int edad = 15;
String nombre = "Ana";
boolean mayor = edad >= 18;
System.out.println(nombre + " " + edad + " " + mayor);
~~~
~~~javascript
let edad = 15;
const nombre = "Ana";
const mayor = edad >= 18;
console.log(nombre, edad, mayor);
~~~
~~~typescript
let edad: number = 15;
const nombre: string = "Ana";
const mayor: boolean = edad >= 18;
console.log(nombre, edad, mayor);
~~~
~~~salida
Ana 15 false
~~~
Detalle: Python escribe True y False con mayúscula; los otros tres, true y false.`,
      `Java y TypeScript no dejan cambiar el tipo de una variable: asignar un texto a un entero es un error de compilación. Python y JavaScript sí lo permiten.
~~~java!
int x = "hola";
~~~
~~~salida
error de compilación
~~~
~~~typescript!
let x: number = "hola";
~~~
~~~salida
error de compilación
~~~
~~~python
x = 5
x = "hola"
print(x)
~~~
~~~salida
hola
~~~`,
      `Asignar es guardar, no comparar: cada línea usa el valor actual y guarda el resultado. Trazá este programa con una tabla (puntos: 10, luego 15, luego 30):
~~~python
puntos = 10
puntos = puntos + 5
puntos = puntos * 2
print(puntos)
~~~
~~~java
int puntos = 10;
puntos = puntos + 5;
puntos = puntos * 2;
System.out.println(puntos);
~~~
~~~javascript
let puntos = 10;
puntos = puntos + 5;
puntos = puntos * 2;
console.log(puntos);
~~~
~~~typescript
let puntos: number = 10;
puntos = puntos + 5;
puntos = puntos * 2;
console.log(puntos);
~~~
~~~salida
30
~~~`,
      `Unir texto con números: Java, JavaScript y TypeScript convierten el número solos al usar +; Python exige str().
~~~python
edad = 15
print("Edad: " + str(edad))
~~~
~~~java
int edad = 15;
System.out.println("Edad: " + edad);
~~~
~~~javascript
const edad = 15;
console.log("Edad: " + edad);
~~~
~~~typescript
const edad: number = 15;
console.log("Edad: " + edad);
~~~
~~~salida
Edad: 15
~~~
Sin el str(), Python protesta:
~~~python!
print("Edad: " + 15)
~~~
~~~salida
TypeError
~~~`,
      `Ejemplo resuelto: precio de una compra.
~~~python
precio = 8
cantidad = 3
total = precio * cantidad
descuento = 4
total = total - descuento
print(total)
~~~
Tabla: precio=8; cantidad=3; total=24 (8 * 3); descuento=4; total=20 (24 - 4). El print muestra 20 y, como cada línea usa el valor actual de la variable, el orden de las líneas importa.
~~~salida
20
~~~
En los otros tres lenguajes solo cambia la declaración (int, let, let ... : number): la lógica y el resultado son idénticos.`,
    ],
    quiz: [
      {
        pregunta: `¿Qué imprime este código?
~~~python
x = 4
y = x + 3
x = y * 2
print(x, y)
~~~`,
        opciones: ["14 7", "8 7", "14 14", "7 14"],
        respuesta: "14 7",
        explicacion: "x=4; y=7; x = y * 2 = 14 (y sigue en 7).",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "¿Cuál de estas líneas NO compila en Java?",
        opciones: ["int x = \"hola\";", "String s = \"hola\";", "boolean b = true;", "int y = 3 + 4;"],
        respuesta: "int x = \"hola\";",
        explicacion: "Un int no puede guardar un texto: Java lo rechaza al compilar.",
        verifica: { tipo: "opciones", lang: "java", respuestaFunciona: false },
      },
      {
        pregunta: `¿Qué imprime este código en Python?
~~~python
print(3 >= 2)
~~~`,
        opciones: ["True", "true", "1", "3"],
        respuesta: "True",
        explicacion: "La comparación da un booleano y Python lo escribe con mayúscula inicial.",
        verifica: { tipo: "salida" },
      },
    ],
  },
  // ------------------------------------------------------------------
  {
    slug: "codia-clase-02-condicionales",
    nombre: "Clase 2: Condicionales — decidir qué camino sigue el código",
    descripcion: "if, else y else if; operadores de comparación y lógicos; y la trampa de = contra == (y === en JavaScript).",
    orden: 7,
    requierePro: true,
    pasos: [
      "Un condicional ejecuta un bloque solo si una condición (un booleano) es verdadera. Los comparadores son ==, !=, <, <=, > y >=; para combinar condiciones, Python usa and, or, not y los otros tres lenguajes usan &&, || y !.",
      `Mismo if/else en los cuatro lenguajes (x vale 7): Python usa dos puntos e indentación; los otros usan paréntesis y llaves.
~~~python
x = 7
if x > 5:
    print("grande")
else:
    print("chico")
~~~
~~~java
int x = 7;
if (x > 5) {
    System.out.println("grande");
} else {
    System.out.println("chico");
}
~~~
~~~javascript
let x = 7;
if (x > 5) {
    console.log("grande");
} else {
    console.log("chico");
}
~~~
~~~typescript
let x: number = 7;
if (x > 5) {
    console.log("grande");
} else {
    console.log("chico");
}
~~~
~~~salida
grande
~~~`,
      `Varias ramas: se evalúan en orden y gana la PRIMERA condición verdadera (elif en Python, else if en los demás). Con nota = 72:
~~~python
nota = 72
if nota >= 90:
    print("A")
elif nota >= 70:
    print("B")
else:
    print("C")
~~~
~~~java
int nota = 72;
if (nota >= 90) {
    System.out.println("A");
} else if (nota >= 70) {
    System.out.println("B");
} else {
    System.out.println("C");
}
~~~
~~~javascript
let nota = 72;
if (nota >= 90) {
    console.log("A");
} else if (nota >= 70) {
    console.log("B");
} else {
    console.log("C");
}
~~~
~~~typescript
let nota: number = 72;
if (nota >= 90) {
    console.log("A");
} else if (nota >= 70) {
    console.log("B");
} else {
    console.log("C");
}
~~~
~~~salida
B
~~~
72 no llega a 90, sí llega a 70: imprime B y las ramas de abajo ni se miran.`,
      `Condiciones combinadas: los dos lados de un and (&&) deben ser verdaderos; con or (||) alcanza uno. Edad 15:
~~~python
edad = 15
if edad >= 12 and edad <= 17:
    print("adolescente")
~~~
~~~java
int edad = 15;
if (edad >= 12 && edad <= 17) {
    System.out.println("adolescente");
}
~~~
~~~javascript
let edad = 15;
if (edad >= 12 && edad <= 17) {
    console.log("adolescente");
}
~~~
~~~typescript
let edad: number = 15;
if (edad >= 12 && edad <= 17) {
    console.log("adolescente");
}
~~~
~~~salida
adolescente
~~~`,
      `La trampa de = contra ==: un solo signo = ASIGNA, dos COMPARAN. Python y Java lo detectan y frenan el programa:
~~~python!
x = 5
if x = 5:
    print("cinco")
~~~
~~~salida
SyntaxError
~~~
~~~java!
int x = 5;
if (x = 5) {
    System.out.println("cinco");
}
~~~
~~~salida
error de compilación
~~~
En JavaScript hay un detalle más: == convierte tipos y === no. Por eso se recomienda ===.
~~~javascript
console.log("5" == 5);
console.log("5" === 5);
~~~
~~~salida
true
false
~~~`,
      `Ejemplo resuelto: qué estado imprime.
~~~python
temp = 24
if temp > 30:
    estado = "calor"
elif temp > 20:
    estado = "templado"
else:
    estado = "frio"
print(estado)
~~~
Trazá: 24 > 30 es falso, se salta esa rama; 24 > 20 es verdadero, estado = "templado" y no se mira el else.
~~~salida
templado
~~~`,
    ],
    quiz: [
      {
        pregunta: `¿Qué imprime este código?
~~~python
x = 10
if x % 2 == 0 and x > 5:
    print("A")
else:
    print("B")
~~~`,
        opciones: ["A", "B", "A y después B", "No imprime nada"],
        respuesta: "A",
        explicacion: "10 es par y mayor que 5: las dos condiciones se cumplen.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "En JavaScript, ¿qué operador compara igualdad SIN convertir tipos?",
        opciones: ["===", "=", "==", "=>"],
        respuesta: "===",
        explicacion: "=== compara valor y tipo; == convierte antes de comparar (\"5\" == 5 es true).",
      },
      {
        pregunta: `¿Qué imprime este código?
~~~python
score = 85
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("C")
~~~`,
        opciones: ["B", "A", "C", "A y B"],
        respuesta: "B",
        explicacion: "85 no cumple >= 90 pero sí >= 80: gana esa rama y las demás no se evalúan.",
        verifica: { tipo: "salida" },
      },
    ],
  },
  // ------------------------------------------------------------------
  {
    slug: "codia-clase-03-bucles",
    nombre: "Clase 3: Bucles — repetir sin copiar y pegar",
    descripcion: "for y while, acumuladores, break y el error de una vuelta de más o de menos, en los cuatro lenguajes.",
    orden: 8,
    requierePro: true,
    pasos: [
      "Un bucle repite un bloque. Usa for cuando sabes cuántas vueltas hay (recorrer un rango o una lista) y while cuando repites hasta que algo cambie. En los dos casos haz las tres preguntas: dónde arranca, cuándo termina, qué cambia por vuelta.",
      `for de 0 a 2 en los cuatro lenguajes (el límite superior no se incluye):
~~~python
for i in range(3):
    print(i)
~~~
~~~java
for (int i = 0; i < 3; i++) {
    System.out.println(i);
}
~~~
~~~javascript
for (let i = 0; i < 3; i++) {
    console.log(i);
}
~~~
~~~typescript
for (let i = 0; i < 3; i++) {
    console.log(i);
}
~~~
~~~salida
0
1
2
~~~`,
      `Acumulador: una variable que junta el resultado. Suma de 1 a 5:
~~~python
total = 0
for i in range(1, 6):
    total = total + i
print(total)
~~~
~~~java
int total = 0;
for (int i = 1; i <= 5; i++) {
    total = total + i;
}
System.out.println(total);
~~~
~~~javascript
let total = 0;
for (let i = 1; i <= 5; i++) {
    total = total + i;
}
console.log(total);
~~~
~~~typescript
let total: number = 0;
for (let i = 1; i <= 5; i++) {
    total = total + i;
}
console.log(total);
~~~
~~~salida
15
~~~
Fíjate que range(1, 6) equivale a i <= 5: las dos formas llegan hasta 5.`,
      `while: cuenta regresiva. La condición se revisa ANTES de cada vuelta y algo adentro tiene que acercarla a falsa; si no, el bucle no termina nunca.
~~~python
n = 3
while n > 0:
    print(n)
    n = n - 1
~~~
~~~java
int n = 3;
while (n > 0) {
    System.out.println(n);
    n = n - 1;
}
~~~
~~~javascript
let n = 3;
while (n > 0) {
    console.log(n);
    n = n - 1;
}
~~~
~~~typescript
let n: number = 3;
while (n > 0) {
    console.log(n);
    n = n - 1;
}
~~~
~~~salida
3
2
1
~~~`,
      `break corta el bucle apenas se cumple algo. Primer múltiplo de 4 desde 10:
~~~python
for i in range(10, 30):
    if i % 4 == 0:
        print(i)
        break
~~~
~~~java
for (int i = 10; i < 30; i++) {
    if (i % 4 == 0) {
        System.out.println(i);
        break;
    }
}
~~~
~~~javascript
for (let i = 10; i < 30; i++) {
    if (i % 4 == 0) {
        console.log(i);
        break;
    }
}
~~~
~~~typescript
for (let i = 10; i < 30; i++) {
    if (i % 4 === 0) {
        console.log(i);
        break;
    }
}
~~~
~~~salida
12
~~~
Prueba 10 (resto 2), 11 (resto 3), 12 (resto 0): imprime 12 y sale.`,
      `Ejemplo resuelto con tabla: suma de cuadrados.
~~~python
total = 0
for i in range(1, 4):
    total = total + i * i
print(total)
~~~
Vuelta 1: i=1, total = 0 + 1 = 1. Vuelta 2: i=2, total = 1 + 4 = 5. Vuelta 3: i=3, total = 5 + 9 = 14. Termina porque range(1, 4) no incluye el 4.
~~~salida
14
~~~`,
      `El error más común: una vuelta de más o de menos. range(1, 5) llega hasta 4, no hasta 5:
~~~python
total = 0
for i in range(1, 5):
    total = total + i
print(total)
~~~
~~~salida
10
~~~
Si querías sumar de 1 a 5 (15) tenías que escribir range(1, 6). En Java, JavaScript y TypeScript el equivalente es escribir i < 5 cuando necesitabas i <= 5.`,
    ],
    quiz: [
      {
        pregunta: `¿Qué imprime este código?
~~~python
n = 5
c = 0
while n > 0:
    n = n - 2
    c = c + 1
print(c, n)
~~~`,
        opciones: ["3 -1", "2 1", "3 0", "2 -1"],
        respuesta: "3 -1",
        explicacion: "n: 5 -> 3 -> 1 -> -1. Son 3 vueltas y termina con n = -1.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "¿Cuántas veces se ejecuta el cuerpo de un for i in range(2, 6) en Python?",
        opciones: ["4", "3", "5", "6"],
        respuesta: "4",
        explicacion: "i vale 2, 3, 4 y 5: son 6 - 2 = 4 vueltas.",
      },
      {
        pregunta: `¿Qué imprime este código en Java?
~~~java
int t = 0;
for (int i = 1; i <= 4; i++) {
    t += i;
}
System.out.println(t);
~~~`,
        opciones: ["10", "6", "15", "4"],
        respuesta: "10",
        explicacion: "Con <= el 4 se incluye: 1 + 2 + 3 + 4 = 10.",
        verifica: { tipo: "salida" },
      },
    ],
  },
  // ------------------------------------------------------------------
  {
    slug: "codia-clase-04-funciones",
    nombre: "Clase 4: Funciones — nombrar un bloque de código y reutilizarlo",
    descripcion: "Parámetros, return, la diferencia entre imprimir y devolver, y el alcance de las variables.",
    orden: 9,
    requierePro: true,
    pasos: [
      "Una función agrupa código bajo un nombre. Recibe parámetros (los datos de entrada) y con return devuelve un resultado a quien la llamó. Reutilizas la lógica sin copiarla y puedes probarla con distintos valores.",
      `Una función que duplica un número, en los cuatro lenguajes:
~~~python
def doble(x):
    return x * 2

print(doble(4))
~~~
~~~java
static int doble(int x) {
    return x * 2;
}

System.out.println(doble(4));
~~~
~~~javascript
function doble(x) {
    return x * 2;
}

console.log(doble(4));
~~~
~~~typescript
function doble(x: number): number {
    return x * 2;
}

console.log(doble(4));
~~~
~~~salida
8
~~~
En Java y TypeScript los parámetros y lo que devuelve llevan tipo (int, number).`,
      `Imprimir no es devolver: print muestra algo en pantalla; return entrega un valor. Una función sin return devuelve nada (None en Python, undefined en JavaScript):
~~~python
def saludar(n):
    print("Hola", n)

r = saludar("Ana")
print(r)
~~~
~~~salida
Hola Ana
None
~~~
~~~javascript
function saludar(n) {
    console.log("Hola", n);
}

const r = saludar("Ana");
console.log(r);
~~~
~~~salida
Hola Ana
undefined
~~~
En Java, un método void ni siquiera permite guardar su resultado:
~~~java!
static void saludar(String n) {
    System.out.println("Hola " + n);
}

int r = saludar("Ana");
~~~
~~~salida
error de compilación
~~~`,
      `Alcance: una variable creada dentro de una función solo existe ahí adentro.
~~~python!
def f():
    x = 5

f()
print(x)
~~~
~~~salida
NameError
~~~
~~~javascript!
function f() {
    let x = 5;
}

f();
console.log(x);
~~~
~~~salida
ReferenceError
~~~
~~~java!
static void f() {
    int x = 5;
}

f();
System.out.println(x);
~~~
~~~salida
error de compilación
~~~
~~~typescript!
function f(): void {
    let x: number = 5;
}

f();
console.log(x);
~~~
~~~salida
error de compilación
~~~`,
      `Una función con condicional: devuelve el mayor de dos números. Fíjate que hay un return en cada camino.
~~~python
def mayor(a, b):
    if a > b:
        return a
    return b

print(mayor(3, 9))
~~~
~~~java
static int mayor(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

System.out.println(mayor(3, 9));
~~~
~~~javascript
function mayor(a, b) {
    if (a > b) {
        return a;
    }
    return b;
}

console.log(mayor(3, 9));
~~~
~~~typescript
function mayor(a: number, b: number): number {
    if (a > b) {
        return a;
    }
    return b;
}

console.log(mayor(3, 9));
~~~
~~~salida
9
~~~`,
      `Ejemplo resuelto: llamadas anidadas. Se evalúa de adentro hacia afuera.
~~~python
def doble(x):
    return x * 2

def triple(x):
    return x * 3

print(triple(doble(2)))
~~~
Paso 1: doble(2) devuelve 4. Paso 2: triple(4) devuelve 12. Recién entonces print muestra el valor.
~~~salida
12
~~~
En los otros tres lenguajes la lectura es exactamente la misma: primero el paréntesis de más adentro.`,
    ],
    quiz: [
      {
        pregunta: `¿Qué imprime este código?
~~~python
def f(a, b):
    return a * b + 1

print(f(2, 3))
~~~`,
        opciones: ["7", "6", "8", "5"],
        respuesta: "7",
        explicacion: "2 * 3 + 1 = 7.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué imprime este código en Python?
~~~python
def saludar(n):
    print("Hola", n)

print(saludar("Ana"))
~~~`,
        opciones: ["Hola Ana\nNone", "Hola Ana", "None", "Hola Ana\nHola Ana"],
        respuesta: "Hola Ana\nNone",
        explicacion: "Adentro de la función se imprime Hola Ana; como no devuelve nada, el print de afuera muestra None.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué imprime este código en JavaScript?
~~~javascript
function f(x) {
    if (x > 3) {
        return "alto";
    }
    return "bajo";
}

console.log(f(5), f(1));
~~~`,
        opciones: ["alto bajo", "bajo alto", "alto alto", "bajo bajo"],
        respuesta: "alto bajo",
        explicacion: "f(5): 5 > 3 devuelve alto. f(1): no entra al if y devuelve bajo.",
        verifica: { tipo: "salida" },
      },
    ],
  },
  // ------------------------------------------------------------------
  {
    slug: "codia-clase-05-listas-y-diccionarios",
    nombre: "Clase 5: Listas y diccionarios — guardar muchos datos",
    descripcion: "Listas o arreglos con índice desde 0, recorrerlos, y diccionarios (mapas) clave-valor, con el mismo ejemplo en los cuatro lenguajes.",
    orden: 10,
    requierePro: true,
    pasos: [
      "Una lista (arreglo) guarda varios valores en orden y se accede por posición, empezando en 0. Un diccionario (mapa) guarda pares clave-valor y se accede por clave: la clave identifica al valor, no su posición.",
      `Crear una lista, leer un elemento y ver cuántos tiene:
~~~python
nums = [4, 8, 15]
print(nums[0], len(nums))
~~~
~~~java
int[] nums = {4, 8, 15};
System.out.println(nums[0] + " " + nums.length);
~~~
~~~javascript
const nums = [4, 8, 15];
console.log(nums[0], nums.length);
~~~
~~~typescript
const nums: number[] = [4, 8, 15];
console.log(nums[0], nums.length);
~~~
~~~salida
4 3
~~~`,
      `Recorrer y acumular: suma de todos los elementos.
~~~python
nums = [4, 8, 15]
suma = 0
for x in nums:
    suma = suma + x
print(suma)
~~~
~~~java
int[] nums = {4, 8, 15};
int suma = 0;
for (int x : nums) {
    suma = suma + x;
}
System.out.println(suma);
~~~
~~~javascript
const nums = [4, 8, 15];
let suma = 0;
for (const x of nums) {
    suma = suma + x;
}
console.log(suma);
~~~
~~~typescript
const nums: number[] = [4, 8, 15];
let suma: number = 0;
for (const x of nums) {
    suma = suma + x;
}
console.log(suma);
~~~
~~~salida
27
~~~`,
      `Índice fuera de rango: con 3 elementos las posiciones son 0, 1 y 2. Pedir la 3 rompe Python y Java...
~~~python!
nums = [4, 8, 15]
print(nums[3])
~~~
~~~salida
IndexError
~~~
~~~java!
int[] nums = {4, 8, 15};
System.out.println(nums[3]);
~~~
~~~salida
ArrayIndexOutOfBoundsException
~~~
...pero JavaScript no falla: devuelve undefined, y ese valor puede colarse en cálculos después.
~~~javascript
const nums = [4, 8, 15];
console.log(nums[3]);
~~~
~~~salida
undefined
~~~`,
      `Diccionario (mapa): guardar edades por nombre. Asignar a una clave que ya existe la sobrescribe.
~~~python
edades = {"ana": 15, "luis": 17}
edades["ana"] = 16
print(edades["ana"], len(edades))
~~~
~~~java
import java.util.*;

Map<String, Integer> edades = new HashMap<>();
edades.put("ana", 15);
edades.put("luis", 17);
edades.put("ana", 16);
System.out.println(edades.get("ana") + " " + edades.size());
~~~
~~~javascript
const edades = new Map();
edades.set("ana", 15);
edades.set("luis", 17);
edades.set("ana", 16);
console.log(edades.get("ana"), edades.size);
~~~
~~~typescript
const edades = new Map<string, number>();
edades.set("ana", 15);
edades.set("luis", 17);
edades.set("ana", 16);
console.log(edades.get("ana"), edades.size);
~~~
~~~salida
16 2
~~~
Hay dos claves (ana y luis): la segunda asignación a ana no agregó una entrada, cambió su valor.`,
      `Ejemplo resuelto: contar cuántas veces aparece cada número con un diccionario. Trazá con datos = 1, 2, 1, 3, 1: el conteo va {1:1}, {1:1, 2:1}, {1:2, 2:1}, {1:2, 2:1, 3:1}, {1:3, 2:1, 3:1}.
~~~python
datos = [1, 2, 1, 3, 1]
conteo = {}
for x in datos:
    if x in conteo:
        conteo[x] = conteo[x] + 1
    else:
        conteo[x] = 1
print(conteo[1], len(conteo))
~~~
~~~java
import java.util.*;

int[] datos = {1, 2, 1, 3, 1};
Map<Integer, Integer> conteo = new HashMap<>();
for (int x : datos) {
    if (conteo.containsKey(x)) {
        conteo.put(x, conteo.get(x) + 1);
    } else {
        conteo.put(x, 1);
    }
}
System.out.println(conteo.get(1) + " " + conteo.size());
~~~
~~~javascript
const datos = [1, 2, 1, 3, 1];
const conteo = new Map();
for (const x of datos) {
    if (conteo.has(x)) {
        conteo.set(x, conteo.get(x) + 1);
    } else {
        conteo.set(x, 1);
    }
}
console.log(conteo.get(1), conteo.size);
~~~
~~~typescript
const datos: number[] = [1, 2, 1, 3, 1];
const conteo = new Map<number, number>();
for (const x of datos) {
    if (conteo.has(x)) {
        conteo.set(x, conteo.get(x)! + 1);
    } else {
        conteo.set(x, 1);
    }
}
console.log(conteo.get(1), conteo.size);
~~~
~~~salida
3 3
~~~`,
    ],
    quiz: [
      {
        pregunta: `¿Qué imprime este código?
~~~python
nums = [5, 6, 7]
print(nums[1] + nums[2])
~~~`,
        opciones: ["13", "11", "12", "18"],
        respuesta: "13",
        explicacion: "nums[1] es 6 y nums[2] es 7: la posición 0 es el 5.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué imprime este código en JavaScript?
~~~javascript
const a = [1, 2, 3];
console.log(a[3]);
~~~`,
        opciones: ["undefined", "3", "0", "Lanza un error"],
        respuesta: "undefined",
        explicacion: "JavaScript no lanza error por un índice fuera de rango: devuelve undefined.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué imprime este código en Python?
~~~python
d = {"a": 1}
d["a"] = 5
d["b"] = 2
print(d["a"], len(d))
~~~`,
        opciones: ["5 2", "1 2", "5 1", "1 1"],
        respuesta: "5 2",
        explicacion: "La clave a se sobrescribe (1 pasa a 5) y b agrega una segunda entrada.",
        verifica: { tipo: "salida" },
      },
    ],
  },
  // ------------------------------------------------------------------
  {
    slug: "codia-clase-06-recorridos-y-complejidad",
    nombre: "Clase 6: Recorridos y complejidad — O(n) contra O(n²)",
    descripcion: "Contar bucles para saber cómo crece el trabajo: O(1), O(log n), O(n) y O(n²), y por qué importa la estructura elegida.",
    orden: 11,
    requierePro: true,
    pasos: [
      "La complejidad temporal describe cómo crece el número de operaciones cuando crece n. La medimos contando cuántas veces se ejecuta la operación principal. Nos interesa la forma del crecimiento: si n se duplica, ¿el trabajo se duplica (O(n)), se cuadruplica (O(n²)) o casi no cambia (O(1))?",
      `Dos bucles anidados sobre n, en los cuatro lenguajes. La función devuelve cuántas veces corre la línea total = total + 1:
~~~python
def contar(n):
    total = 0
    for i in range(n):
        for j in range(n):
            total = total + 1
    return total

print(contar(8), contar(16))
~~~
~~~java
static int contar(int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            total = total + 1;
        }
    }
    return total;
}

System.out.println(contar(8) + " " + contar(16));
~~~
~~~javascript
function contar(n) {
    let total = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            total = total + 1;
        }
    }
    return total;
}

console.log(contar(8), contar(16));
~~~
~~~typescript
function contar(n: number): number {
    let total: number = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            total = total + 1;
        }
    }
    return total;
}

console.log(contar(8), contar(16));
~~~
~~~salida
64 256
~~~
Al duplicar n de 8 a 16 el trabajo pasó de 64 a 256: se multiplicó por 4. Es O(n²).`,
      `Un solo bucle da O(n): al duplicar n el trabajo se duplica.
~~~python
def contar(n):
    total = 0
    for i in range(n):
        total = total + 1
    return total

print(contar(8), contar(16))
~~~
~~~java
static int contar(int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total = total + 1;
    }
    return total;
}

System.out.println(contar(8) + " " + contar(16));
~~~
~~~javascript
function contar(n) {
    let total = 0;
    for (let i = 0; i < n; i++) {
        total = total + 1;
    }
    return total;
}

console.log(contar(8), contar(16));
~~~
~~~typescript
function contar(n: number): number {
    let total: number = 0;
    for (let i = 0; i < n; i++) {
        total = total + 1;
    }
    return total;
}

console.log(contar(8), contar(16));
~~~
~~~salida
8 16
~~~
Dos bucles UNO DESPUÉS DEL OTRO también son O(n): 8 + 8 = 16 y 16 + 16 = 32, se suman, no se multiplican.
~~~python
def contar(n):
    total = 0
    for i in range(n):
        total = total + 1
    for j in range(n):
        total = total + 1
    return total

print(contar(8), contar(16))
~~~
~~~salida
16 32
~~~`,
      `Trampa: un bucle interno que depende de i sigue siendo O(n²). Con j desde 0 hasta i - 1 se hacen 0 + 1 + 2 + ... + (n - 1) = n(n-1)/2 operaciones:
~~~python
def contar(n):
    total = 0
    for i in range(n):
        for j in range(i):
            total = total + 1
    return total

print(contar(8), contar(16))
~~~
~~~salida
28 120
~~~
28 y 120: al duplicar n se multiplica por algo cercano a 4 (y más cerca de 4 cuanto más grande es n). Las constantes como 1/2 no cambian la forma.`,
      `Un bucle interno de largo fijo es una constante: no cuenta como bucle sobre n.
~~~python
def contar(n):
    total = 0
    for i in range(n):
        for j in range(3):
            total = total + 1
    return total

print(contar(8), contar(16))
~~~
~~~salida
24 48
~~~
3n operaciones: O(n). Y si el valor se reduce a la mitad en cada vuelta, el bucle es logarítmico:
~~~python
def contar(n):
    total = 0
    i = 1
    while i < n:
        total = total + 1
        i = i * 2
    return total

print(contar(8), contar(16))
~~~
~~~java
static int contar(int n) {
    int total = 0;
    int i = 1;
    while (i < n) {
        total = total + 1;
        i = i * 2;
    }
    return total;
}

System.out.println(contar(8) + " " + contar(16));
~~~
~~~javascript
function contar(n) {
    let total = 0;
    let i = 1;
    while (i < n) {
        total = total + 1;
        i = i * 2;
    }
    return total;
}

console.log(contar(8), contar(16));
~~~
~~~typescript
function contar(n: number): number {
    let total: number = 0;
    let i: number = 1;
    while (i < n) {
        total = total + 1;
        i = i * 2;
    }
    return total;
}

console.log(contar(8), contar(16));
~~~
~~~salida
3 4
~~~
Duplicar n suma UNA vuelta: es O(log n).`,
      `Ejemplo resuelto: la estructura importa. Preguntar si un nombre está en una lista recorre los elementos (O(n) en el peor caso); en un conjunto (set en Python, HashSet en Java, Set en JavaScript) la búsqueda es O(1) en promedio.
~~~python
nombres = ["ana", "luis", "marta"]
print("luis" in nombres)
conjunto = {"ana", "luis", "marta"}
print("luis" in conjunto)
~~~
~~~salida
True
True
~~~
El resultado es el mismo; lo que cambia es cuánto trabajo hace la computadora cuando hay millones de elementos.`,
    ],
    quiz: [
      {
        pregunta: `¿Qué devuelve contar(6)?
~~~python
def contar(n):
    total = 0
    for i in range(n):
        for j in range(i):
            total = total + 1
    return total

print(contar(6))
~~~`,
        opciones: ["15", "36", "6", "21"],
        respuesta: "15",
        explicacion: "0 + 1 + 2 + 3 + 4 + 5 = 15 = 6 * 5 / 2.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: "Un bucle de 0 a n con otro bucle de 0 a n adentro. ¿Cuál es su complejidad?",
        opciones: ["O(n²)", "O(n)", "O(1)", "O(log n)"],
        respuesta: "O(n²)",
        explicacion: "Dos bucles anidados sobre n hacen n * n operaciones.",
      },
      {
        pregunta: `¿Qué devuelve contar(16)?
~~~python
def contar(n):
    total = 0
    i = 1
    while i < n:
        total = total + 1
        i = i * 2
    return total

print(contar(16))
~~~`,
        opciones: ["4", "16", "8", "15"],
        respuesta: "4",
        explicacion: "i vale 1, 2, 4 y 8 (16 ya no cumple i < 16): 4 vueltas, log2(16).",
        verifica: { tipo: "salida" },
      },
    ],
  },
  // ------------------------------------------------------------------
  {
    slug: "codia-clase-07-errores-y-depuracion",
    nombre: "Clase 7: Errores comunes y depuración",
    descripcion: "Errores de sintaxis, de ejecución y de lógica: cómo distinguirlos y cómo encontrar la línea culpable.",
    orden: 12,
    requierePro: true,
    pasos: [
      "Hay tres familias de errores. De sintaxis (o de compilación): el programa ni arranca. De ejecución: arranca y se rompe en una línea. De lógica: corre sin quejarse pero da un resultado equivocado; son los más difíciles porque nadie te avisa.",
      `Errores de sintaxis en los cuatro lenguajes: falta un dos puntos en Python, un punto y coma en Java y una comilla de cierre en JavaScript y TypeScript.
~~~python!
if 3 > 2
    print("si")
~~~
~~~salida
SyntaxError
~~~
~~~java!
int x = 5
System.out.println(x);
~~~
~~~salida
error de compilación
~~~
~~~javascript!
console.log("hola);
~~~
~~~salida
SyntaxError
~~~
~~~typescript!
console.log("hola);
~~~
~~~salida
error de compilación
~~~`,
      `Nombre inexistente (casi siempre un error de tipeo): Python y JavaScript lo descubren al ejecutar esa línea; Java y TypeScript, al compilar.
~~~python!
total = 10
print(totl)
~~~
~~~salida
NameError
~~~
~~~java!
int total = 10;
System.out.println(totl);
~~~
~~~salida
error de compilación
~~~
~~~javascript!
const total = 10;
console.log(totl);
~~~
~~~salida
ReferenceError
~~~
~~~typescript!
const total: number = 10;
console.log(totl);
~~~
~~~salida
error de compilación
~~~`,
      `Errores de ejecución: índice fuera de rango y división por cero.
~~~python!
datos = [1, 2, 3]
print(datos[3])
~~~
~~~salida
IndexError
~~~
~~~java!
int[] datos = {1, 2, 3};
System.out.println(datos[3]);
~~~
~~~salida
ArrayIndexOutOfBoundsException
~~~
~~~python!
print(8 // 0)
~~~
~~~salida
ZeroDivisionError
~~~
~~~java!
System.out.println(8 / 0);
~~~
~~~salida
ArithmeticException
~~~
En JavaScript y TypeScript ninguno de los dos rompe: dan undefined e Infinity, por eso el error aparece más tarde y es más difícil de rastrear.
~~~javascript
const datos = [1, 2, 3];
console.log(datos[3], 8 / 0);
~~~
~~~typescript
const datos: number[] = [1, 2, 3];
console.log(datos[3], 8 / 0);
~~~
~~~salida
undefined Infinity
~~~`,
      `Errores de lógica: el clásico es una vuelta de más o de menos. Queríamos la suma de 1 a 4 (10) y da otra cosa:
~~~python
total = 0
for i in range(1, 4):
    total = total + i
print(total)
~~~
~~~salida
6
~~~
Diagnóstico: range(1, 4) llega hasta 3. Para incluir el 4 hay que escribir range(1, 5). Cuando el resultado no es el esperado, no busques en todo el código: compará contra lo que hiciste a mano.`,
      `Depurar con print: mostrá el valor de las variables en cada vuelta y compará contra tu tabla de seguimiento.
~~~python
total = 0
for i in range(1, 4):
    total = total + i
    print("i =", i, "total =", total)
print(total)
~~~
~~~salida
i = 1 total = 1
i = 2 total = 3
i = 3 total = 6
6
~~~
Método: 1) lee el nombre del error y la línea; 2) reproducí el problema con el fragmento más chico posible; 3) trazá con una tabla o con print; 4) cambiá UNA cosa por vez y vuelve a probar.`,
    ],
    quiz: [
      {
        pregunta: `¿Qué error produce este código?
~~~python
datos = [1, 2, 3]
print(datos[3])
~~~`,
        opciones: ["IndexError", "NameError", "SyntaxError", "TypeError"],
        respuesta: "IndexError",
        explicacion: "La lista tiene posiciones 0, 1 y 2: la 3 no existe.",
        verifica: { tipo: "error", error: "IndexError" },
      },
      {
        pregunta: `¿Qué imprime este código en JavaScript?
~~~javascript
console.log(10 / 0);
~~~`,
        opciones: ["Infinity", "Un error de división por cero", "0", "NaN"],
        respuesta: "Infinity",
        explicacion: "JavaScript no lanza error: dividir un número positivo por cero da Infinity.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `Queríamos sumar de 1 a 4, pero ¿qué imprime realmente este código?
~~~python
total = 0
for i in range(1, 4):
    total = total + i
print(total)
~~~`,
        opciones: ["6", "10", "4", "3"],
        respuesta: "6",
        explicacion: "range(1, 4) recorre 1, 2 y 3 (1 + 2 + 3 = 6). Para llegar al 4 haría falta range(1, 5).",
        verifica: { tipo: "salida" },
      },
    ],
  },
  // ------------------------------------------------------------------
  {
    slug: "codia-clase-08-pilas-colas-y-conjuntos",
    nombre: "Clase 8: Pilas, colas y conjuntos",
    descripcion: "LIFO, FIFO y sin repetidos: cómo se usan en Python, Java, JavaScript y TypeScript, y cuándo conviene cada una.",
    orden: 13,
    requierePro: true,
    pasos: [
      "Una pila es LIFO: el último en entrar es el primero en salir (como una pila de platos). Una cola es FIFO: el primero en entrar es el primero en salir (como la fila de una caja). Un conjunto guarda elementos sin repetir y responde rápido si un elemento está o no.",
      `Pila: apilar 1, 2 y 3 y desapilar dos veces. Sale primero el 3.
~~~python
pila = []
pila.append(1)
pila.append(2)
pila.append(3)
print(pila.pop())
print(pila.pop())
~~~
~~~java
import java.util.*;

Deque<Integer> pila = new ArrayDeque<>();
pila.push(1);
pila.push(2);
pila.push(3);
System.out.println(pila.pop());
System.out.println(pila.pop());
~~~
~~~javascript
const pila = [];
pila.push(1);
pila.push(2);
pila.push(3);
console.log(pila.pop());
console.log(pila.pop());
~~~
~~~typescript
const pila: number[] = [];
pila.push(1);
pila.push(2);
pila.push(3);
console.log(pila.pop());
console.log(pila.pop());
~~~
~~~salida
3
2
~~~`,
      `Cola: encolar 1, 2 y 3 y desencolar dos veces. Sale primero el 1.
~~~python
from collections import deque

cola = deque()
cola.append(1)
cola.append(2)
cola.append(3)
print(cola.popleft())
print(cola.popleft())
~~~
~~~java
import java.util.*;

Queue<Integer> cola = new ArrayDeque<>();
cola.add(1);
cola.add(2);
cola.add(3);
System.out.println(cola.poll());
System.out.println(cola.poll());
~~~
~~~javascript
const cola = [];
cola.push(1);
cola.push(2);
cola.push(3);
console.log(cola.shift());
console.log(cola.shift());
~~~
~~~typescript
const cola: number[] = [];
cola.push(1);
cola.push(2);
cola.push(3);
console.log(cola.shift());
console.log(cola.shift());
~~~
~~~salida
1
2
~~~
En Python usa deque para colas: con una lista, pop(0) mueve todos los elementos de lugar (O(n)); popleft de deque es O(1).`,
      `Conjunto: agregar elementos repetidos no hace nada. Agregamos 2, 6, 2, 6 y 1:
~~~python
s = set()
for x in [2, 6, 2, 6, 1]:
    s.add(x)
print(len(s))
print(6 in s)
~~~
~~~salida
3
True
~~~
~~~java
import java.util.*;

Set<Integer> s = new HashSet<>();
for (int x : new int[]{2, 6, 2, 6, 1}) {
    s.add(x);
}
System.out.println(s.size());
System.out.println(s.contains(6));
~~~
~~~javascript
const s = new Set();
for (const x of [2, 6, 2, 6, 1]) {
    s.add(x);
}
console.log(s.size);
console.log(s.has(6));
~~~
~~~typescript
const s = new Set<number>();
for (const x of [2, 6, 2, 6, 1]) {
    s.add(x);
}
console.log(s.size);
console.log(s.has(6));
~~~
~~~salida
3
true
~~~`,
      `Uso típico de una pila: invertir. Se apila cada elemento y después se desapila hasta vaciarla, y sale en orden inverso.
~~~python
datos = [1, 2, 3]
pila = []
for x in datos:
    pila.append(x)
while len(pila) > 0:
    print(pila.pop())
~~~
~~~java
import java.util.*;

int[] datos = {1, 2, 3};
Deque<Integer> pila = new ArrayDeque<>();
for (int x : datos) {
    pila.push(x);
}
while (!pila.isEmpty()) {
    System.out.println(pila.pop());
}
~~~
~~~javascript
const datos = [1, 2, 3];
const pila = [];
for (const x of datos) {
    pila.push(x);
}
while (pila.length > 0) {
    console.log(pila.pop());
}
~~~
~~~typescript
const datos: number[] = [1, 2, 3];
const pila: number[] = [];
for (const x of datos) {
    pila.push(x);
}
while (pila.length > 0) {
    console.log(pila.pop());
}
~~~
~~~salida
3
2
1
~~~`,
      `Ejemplo resuelto: una cola de turnos. Se saca al primero; si es par se imprime y si es impar vuelve al final sumándole 1. Con la cola 3, 4, 5:
~~~python
from collections import deque

cola = deque([3, 4, 5])
while len(cola) > 0:
    x = cola.popleft()
    if x % 2 == 0:
        print(x)
    else:
        cola.append(x + 1)
~~~
Trazá: sale 3 (impar), vuelve 4 y la cola es 4, 5, 4. Sale 4 (par): imprime 4. Sale 5 (impar), vuelve 6: cola 4, 6. Sale 4: imprime 4. Sale 6: imprime 6. La cola queda vacía.
~~~salida
4
4
6
~~~`,
    ],
    quiz: [
      {
        pregunta: `Se apilan 1, 2 y 3 y luego se desapila una vez. ¿Qué imprime?
~~~python
pila = []
pila.append(1)
pila.append(2)
pila.append(3)
print(pila.pop())
~~~`,
        opciones: ["3", "1", "2", "123"],
        respuesta: "3",
        explicacion: "Una pila es LIFO: el último en entrar (el 3) es el primero en salir.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `Se encolan 1, 2 y 3 y luego se desencola una vez. ¿Qué imprime?
~~~python
from collections import deque

q = deque()
q.append(1)
q.append(2)
q.append(3)
print(q.popleft())
~~~`,
        opciones: ["1", "3", "2", "123"],
        respuesta: "1",
        explicacion: "Una cola es FIFO: el primero en entrar (el 1) es el primero en salir.",
        verifica: { tipo: "salida" },
      },
      {
        pregunta: `¿Qué imprime este código?
~~~python
s = {1, 2, 2, 3, 3, 3}
print(len(s))
~~~`,
        opciones: ["3", "6", "2", "1"],
        respuesta: "3",
        explicacion: "Un conjunto no guarda repetidos: quedan 1, 2 y 3.",
        verifica: { tipo: "salida" },
      },
    ],
  },
];
