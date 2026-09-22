import type { ClaseNumeria } from "./tipos";

// Las 5 Clases nuevas de Numeria, en el orden pedido por el usuario
// (2026-09-22): conceptos básicos, multiplicación, división, mínimo común
// múltiplo, y operaciones entre fracciones. Cada una vive bajo el
// `problemType` del tema al que más corresponde (así entran naturalmente
// en TEMAS_ORDEN sin tocar el resto del camino):
//
//   - Clase 1 (valor posicional + acarreo/préstamo) -> "suma": el ejemplo
//     ancla es una suma, aunque el paso 3 también cubre resta/préstamo.
//   - Clase 2 (multiplicación en columna)           -> "multiplicacion"
//   - Clase 3 (división larga)                      -> "division"
//   - Clase 4 (MCM) y Clase 5 (operaciones entre
//     fracciones)                                    -> "fracciones": el
//     MCM se pide en este encuadre específicamente como paso previo al
//     denominador común, así que temáticamente pertenece a fracciones más
//     que a un tema propio.
//
// Todos los números que se muestran (sumas, productos parciales, pasos de
// la división, múltiplos, fracciones) están recalculados de forma
// independiente en lecciones.test.ts con aritmética nativa de JS — no son
// inventados a mano.
export const CLASES_NUMERIA: ClaseNumeria[] = [
  {
    slug: "numeria-clase-conceptos-basicos",
    problemType: "suma",
    orden: 1,
    requierePro: true,
    nombre: "Conceptos básicos: valor posicional, sumar y restar",
    descripcion:
      "Qué significa cada dígito según su posición, y de dónde salen el acarreo (al sumar) y el préstamo (al restar).",
    pasos: [
      "Cada dígito de un número vale distinto según su posición: en 248, el 2 es 2 centenas (200), el 4 es 4 decenas (40) y el 8 es 8 unidades.",
      "Sumar es juntar, columna por columna. Cuando una columna se pasa de 9, se \"lleva\" 1 a la columna siguiente — por ejemplo, si las unidades dan 14, anotas el 4 y le sumas ese 1 a las decenas.",
      "Restar es quitar. Si el dígito de arriba es más chico que el de abajo, esa columna \"le pide prestado\" 1 a la posición siguiente: la que presta baja en 1, y la que pide gana 10.",
    ],
    visuales: [
      { tipo: "numeria.columnas", operacion: "suma", a: 248, b: 176, despuesDePaso: 1, titulo: "248 + 176, columna por columna" },
      { tipo: "numeria.columnas", operacion: "resta", a: 532, b: 178, despuesDePaso: 2, titulo: "532 − 178, pidiendo prestado" },
    ],
    quiz: [
      {
        pregunta: "¿Cuánto vale el 4 en el número 248?",
        opciones: ["4 unidades", "4 decenas (40)", "4 centenas (400)"],
        respuesta: "4 decenas (40)",
        explicacion: "En 248, el 2 está en centenas, el 4 en decenas y el 8 en unidades: el 4 vale 40.",
      },
      {
        pregunta: "Al sumar 248 + 176, ¿qué pasa en la columna de las unidades?",
        opciones: ["8+6=14, se anota 4 y se lleva 1", "8+6=14, se anota 1 y se lleva 4", "8+6=14, se anota 14"],
        respuesta: "8+6=14, se anota 4 y se lleva 1",
        explicacion: "14 tiene un dígito de más: el 4 queda en unidades y el 1 se lleva a la columna de decenas.",
      },
      {
        pregunta: "Al restar 532 − 178, ¿qué pasa en la columna de las unidades?",
        opciones: ["2 es menor que 8: se pide prestado y 12−8=4", "2 es menor que 8: el resultado es negativo", "2−8=6"],
        respuesta: "2 es menor que 8: se pide prestado y 12−8=4",
        explicacion: "Como 2 < 8, esa columna le pide prestado 1 a las decenas: 12−8=4.",
      },
    ],
  },
  {
    slug: "numeria-clase-multiplicacion",
    problemType: "multiplicacion",
    orden: 1,
    requierePro: true,
    nombre: "Multiplicación en columna: productos parciales",
    descripcion: "Qué significa multiplicar y cómo se arma la multiplicación en columna con productos parciales.",
    pasos: [
      "Multiplicar a×b significa sumar a, b veces: 23×3 es 23+23+23. Para números más grandes usamos un atajo, la multiplicación en columna.",
      "Multiplicas el número de arriba por cada dígito del de abajo, empezando por las unidades — cada producto parcial se corre un lugar hacia la izquierda porque ese dígito vale diez veces más que el anterior.",
      "El resultado final es la suma de todos los productos parciales.",
    ],
    visuales: [{ tipo: "numeria.multiplicacion", a: 23, b: 14, despuesDePaso: 1, titulo: "23 × 14, producto por producto" }],
    quiz: [
      {
        pregunta: "En 23×14, ¿qué representa el producto parcial 230?",
        opciones: ["23×1 (la decena de 14), corrido un lugar", "23×4, corrido un lugar", "23×14 completo"],
        respuesta: "23×1 (la decena de 14), corrido un lugar",
        explicacion: "El 1 de 14 vale 10 (una decena), así que 23×1 se corre un lugar: 230.",
      },
      {
        pregunta: "¿Cuánto da 23×14?",
        opciones: ["322", "312", "342"],
        respuesta: "322",
        explicacion: "92 (23×4) + 230 (23×10) = 322.",
      },
    ],
  },
  {
    slug: "numeria-clase-division",
    problemType: "division",
    orden: 1,
    requierePro: true,
    nombre: "División larga: la \"casita\", paso a paso",
    descripcion: "Cómo repartir el dividendo dígito por dígito: bajar, ver cuántas veces entra, multiplicar y restar.",
    pasos: [
      "La división larga (\"casita\") reparte el dividendo dígito por dígito: bajas un dígito, ves cuántas veces entra el divisor, multiplicas y restas.",
      "Repites el proceso bajando el siguiente dígito hasta usarlos todos. Lo que sobra al terminar es el resto.",
    ],
    visuales: [{ tipo: "numeria.division", dividendo: 937, divisor: 4, despuesDePaso: 1, titulo: "937 ÷ 4, la casita" }],
    quiz: [
      {
        pregunta: "Al dividir 937 entre 4, ¿cuántas veces entra 4 en el primer 9?",
        opciones: ["2 veces (resto 1)", "3 veces (resto 0)", "9 veces"],
        respuesta: "2 veces (resto 1)",
        explicacion: "4×2=8, y 9−8=1: entra 2 veces con resto 1 (ese 1 se arrastra a la siguiente columna).",
      },
      {
        pregunta: "¿Cuál es el cociente de 937 ÷ 4?",
        opciones: ["234", "243", "324"],
        respuesta: "234",
        explicacion: "Bajando cada dígito: 9÷4=2 (resto 1), 13÷4=3 (resto 1), 17÷4=4 (resto 1) → cociente 234.",
      },
      {
        pregunta: "¿Cuál es el resto final de 937 ÷ 4?",
        opciones: ["1", "0", "4"],
        respuesta: "1",
        explicacion: "234×4=936, y 937−936=1.",
      },
    ],
  },
  {
    slug: "numeria-clase-mcm",
    problemType: "fracciones",
    orden: 1,
    requierePro: true,
    nombre: "Mínimo común múltiplo (MCM)",
    descripcion: "Qué es el MCM y cómo encontrarlo listando los múltiplos de cada número hasta que coincidan.",
    pasos: [
      "El mínimo común múltiplo (MCM) de dos números es el primer número que aparece en las dos tablas de multiplicar.",
      "Listas los múltiplos de cada número hasta que aparezca el mismo valor en las dos listas — ese es el MCM.",
      "El MCM de los denominadores es el \"terreno común\" que se usa para sumar o restar fracciones con denominadores distintos, en la próxima clase.",
    ],
    visuales: [{ tipo: "numeria.mcm", a: 4, b: 6, despuesDePaso: 1, titulo: "MCM de 4 y 6" }],
    quiz: [
      {
        pregunta: "¿Cuál es el MCM de 4 y 6?",
        opciones: ["12", "24", "10"],
        respuesta: "12",
        explicacion: "Múltiplos de 4: 4, 8, 12... Múltiplos de 6: 6, 12... El primero en común es 12.",
      },
      {
        pregunta: "¿Para qué sirve el MCM al trabajar con fracciones?",
        opciones: ["Para encontrar un denominador común", "Para simplificar cualquier fracción", "Para multiplicar numeradores"],
        respuesta: "Para encontrar un denominador común",
        explicacion: "El MCM de los denominadores da el denominador común más chico posible.",
      },
    ],
  },
  {
    slug: "numeria-clase-fracciones-operaciones",
    problemType: "fracciones",
    orden: 2,
    requierePro: true,
    nombre: "Operaciones entre fracciones",
    descripcion: "Sumar y restar con denominador común, y multiplicar y dividir fracciones — cada una con su propio procedimiento.",
    pasos: [
      "Para sumar o restar fracciones con distinto denominador, primero las conviertes al denominador común (el MCM que viste en la clase anterior) y después sumas o restas solo los numeradores.",
      "Para multiplicar fracciones, multiplicas numerador por numerador y denominador por denominador — no hace falta denominador común.",
      "Para dividir fracciones, multiplicas por la fracción recíproca del segundo término (inviertes su numerador y denominador).",
    ],
    visuales: [
      { tipo: "numeria.fraccion", operacion: "suma", num1: 1, den1: 4, num2: 1, den2: 6, despuesDePaso: 0, titulo: "1/4 + 1/6" },
      { tipo: "numeria.fraccion", operacion: "multiplicacion", num1: 2, den1: 3, num2: 3, den2: 5, despuesDePaso: 1, titulo: "2/3 × 3/5" },
      { tipo: "numeria.fraccion", operacion: "division", num1: 2, den1: 3, num2: 3, den2: 5, despuesDePaso: 2, titulo: "2/3 ÷ 3/5" },
    ],
    quiz: [
      {
        pregunta: "¿Cuánto da 1/4 + 1/6 con denominador común?",
        opciones: ["5/12", "2/10", "1/12"],
        respuesta: "5/12",
        explicacion: "MCM(4,6)=12: 1/4=3/12 y 1/6=2/12. 3/12+2/12=5/12.",
      },
      {
        pregunta: "¿Cuánto da 2/3 × 3/5?",
        opciones: ["2/5", "6/8", "5/6"],
        respuesta: "2/5",
        explicacion: "2×3=6 (numerador) y 3×5=15 (denominador): 6/15, que simplificado es 2/5.",
      },
      {
        pregunta: "¿Cuánto da 2/3 ÷ 3/5?",
        opciones: ["10/9", "6/15", "9/10"],
        respuesta: "10/9",
        explicacion: "Dividir es multiplicar por la recíproca: 2/3 × 5/3 = 10/9.",
      },
    ],
  },
];
