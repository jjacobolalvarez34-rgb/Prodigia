import type { TecnicaEstadistica } from "./tipos";
import { cuadrosCombinacion, cuadrosPermutacion, cuadrosSimetria } from "./ayudas";

// Las 5 Técnicas (gratis) de Estadística. Fuente ÚNICA de la migración
// 0218_estadistica_visuales.sql: los `pasos` y el texto son los sembrados en
// 0191 (español neutro: solo se corrigió el voseo) y `visuales` es lo nuevo.
// Los números de los visuales salen de funciones puras
// (src/lib/estadistica/visualesDatos.ts) y lecciones.test.ts los contrasta con
// un cálculo independiente.
export const TECNICAS_ESTADISTICA: TecnicaEstadistica[] = [
  {
    slug: "estadistica-media-desde-una-media-provisoria",
    orden: 1,
    requierePro: false,
    nombre: "Calcular una media larga con una media provisoria",
    descripcion: "Cuando los datos son grandes pero parecidos, supón una media y suma solo las diferencias.",
    pasos: [
      "Sumar cifras grandes es lento y propenso a errores. Con los datos $61, 64, 58, 67, 60$, todos cerca de $60$, hay un atajo.",
      "Elige una media provisoria $m$ cercana a los datos (aquí, $m = 60$) y anota la diferencia de cada dato con $m$: $+1, +4, -2, +7, 0$.",
      "Suma esas diferencias: $1 + 4 - 2 + 7 + 0 = 10$. Divide entre la cantidad de datos: $10 / 5 = 2$.",
      "La media real es la provisoria más ese promedio de diferencias: $\\bar{x} = 60 + 2 = 62$.",
      "Chequeo: $61 + 64 + 58 + 67 + 60 = 310$ y $310 / 5 = 62$. Si las diferencias se cancelan (suman $0$), la media provisoria era justo la media.",
    ],
    visuales: [
      {
        tipo: "estadistica.desvios",
        despuesDePaso: 1,
        titulo: "Diferencias con la media provisoria",
        datos: [61, 64, 58, 67, 60],
        centro: 60,
        etiquetaCentro: "Media provisoria",
      },
    ],
  },
  {
    slug: "estadistica-mediana-por-posicion",
    orden: 2,
    requierePro: false,
    nombre: "Hallar la mediana por posición",
    descripcion: "Ordena primero y calcula en qué posición está el dato del medio, sin contar de a uno.",
    pasos: [
      "Ordena siempre los datos de menor a mayor antes de buscar la mediana: sin ese paso, cualquier resultado es incorrecto.",
      "Con $n$ impar, la mediana está en la posición $\\dfrac{n+1}{2}$. Datos $9, 3, 7, 5, 11, 1, 8$ → ordenados $1, 3, 5, 7, 8, 9, 11$; con $n = 7$, la posición es $\\dfrac{7+1}{2} = 4$ y la mediana es $7$.",
      "Con $n$ par hay dos valores centrales (posiciones $\\dfrac{n}{2}$ y $\\dfrac{n}{2}+1$): la mediana es su promedio. Datos $12, 4, 9, 7$ → ordenados $4, 7, 9, 12$; centrales $7$ y $9$; mediana $= \\dfrac{7+9}{2} = 8$.",
      "Los valores extremos no la mueven: si en $4, 7, 9, 12$ el $12$ fuera $120$, la mediana seguiría siendo $8$.",
    ],
    visuales: [
      {
        tipo: "estadistica.ordenar",
        despuesDePaso: 1,
        titulo: "Con n impar, la mediana es el dato del medio",
        datos: [9, 3, 7, 5, 11, 1, 8],
        resaltar: "mediana",
      },
      {
        tipo: "estadistica.ordenar",
        despuesDePaso: 2,
        titulo: "Con n par, la mediana es el promedio de los dos centrales",
        datos: [12, 4, 9, 7],
        resaltar: "mediana",
      },
      {
        tipo: "estadistica.ordenar",
        despuesDePaso: 3,
        titulo: "Aunque el 12 fuera 120, la mediana no se mueve",
        datos: [120, 4, 9, 7],
        resaltar: "mediana",
      },
    ],
  },
  {
    slug: "estadistica-cuartiles-por-mitades",
    orden: 3,
    requierePro: false,
    nombre: "Cuartiles y rango intercuartílico por mitades",
    descripcion: "Parte los datos ordenados en dos mitades y saca la mediana de cada una.",
    pasos: [
      "Ordena y parte los datos por la mediana en dos mitades: la inferior y la superior. Si $n$ es impar, la mediana no va en ninguna mitad.",
      "$Q_1$ es la mediana de la mitad inferior y $Q_3$ la de la mitad superior. El rango intercuartílico es $IQR = Q_3 - Q_1$.",
      "Ejemplo con $n = 8$: $2, 4, 4, 5 \\mid 7, 8, 9, 12$. Mitad inferior $2, 4, 4, 5$ → $Q_1 = \\dfrac{4+4}{2} = 4$. Mitad superior $7, 8, 9, 12$ → $Q_3 = \\dfrac{8+9}{2} = 8.5$. Entonces $IQR = 8.5 - 4 = 4.5$.",
      "Ejemplo con $n = 7$: $1, 3, 4 \\mid 6 \\mid 8, 9, 11$. El $6$ (la mediana) queda afuera de las dos mitades. $Q_1 = 3$, $Q_3 = 9$ e $IQR = 6$.",
      "Este es el método que usa la práctica de Estadística y siempre lo declara en el enunciado: existen otros métodos de cuartiles que dan valores un poco distintos.",
    ],
    visuales: [
      {
        tipo: "estadistica.ordenar",
        despuesDePaso: 2,
        titulo: "Ocho datos: dos mitades de cuatro",
        datos: [2, 4, 4, 5, 7, 8, 9, 12],
        resaltar: "cuartiles",
      },
      {
        tipo: "estadistica.ordenar",
        despuesDePaso: 3,
        titulo: "Siete datos: la mediana queda afuera de las mitades",
        datos: [1, 3, 4, 6, 8, 9, 11],
        resaltar: "cuartiles",
      },
    ],
  },
  {
    slug: "estadistica-combinatoria-sin-factoriales-enormes",
    orden: 4,
    requierePro: false,
    nombre: "Combinatoria sin factoriales enormes",
    descripcion: "Cancela en vez de calcular factoriales completos y usa la simetría de las combinaciones.",
    pasos: [
      "No calcules factoriales completos: cancela. $C(n, r) = \\dfrac{n!}{r!\\,(n-r)!}$ se resuelve multiplicando $r$ factores hacia abajo desde $n$ y dividiendo entre $r!$.",
      "$C(10, 3) = \\dfrac{10 \\cdot 9 \\cdot 8}{3 \\cdot 2 \\cdot 1} = \\dfrac{720}{6} = 120$.",
      "Usa la simetría $C(n, r) = C(n, n-r)$ para achicar la cuenta: $C(10, 8) = C(10, 2) = \\dfrac{10 \\cdot 9}{2 \\cdot 1} = 45$.",
      "Permutaciones (el orden importa): $P(n, r) = n \\cdot (n-1) \\cdots (n-r+1)$, sin dividir. $P(8, 3) = 8 \\cdot 7 \\cdot 6 = 336$.",
      "Relación útil: $C(n, r) = \\dfrac{P(n, r)}{r!}$. Por ejemplo, $C(8, 3) = \\dfrac{336}{6} = 56$.",
      "Para elegir entre las dos, pregúntate: si cambio el orden de los elegidos, ¿es un resultado distinto? Sí → permutación; no → combinación.",
    ],
    visuales: [
      { tipo: "cuadros", despuesDePaso: 1, titulo: "Combinaciones sin factoriales enormes", cuadros: cuadrosCombinacion(10, 3) },
      { tipo: "cuadros", despuesDePaso: 2, titulo: "Simetría de las combinaciones", cuadros: cuadrosSimetria(10, 8) },
      { tipo: "cuadros", despuesDePaso: 3, titulo: "Permutaciones: el orden importa", cuadros: cuadrosPermutacion(8, 3) },
      { tipo: "cuadros", despuesDePaso: 4, titulo: "De las permutaciones a las combinaciones", cuadros: cuadrosCombinacion(8, 3) },
    ],
  },
  {
    slug: "estadistica-varianza-con-desvios",
    orden: 5,
    requierePro: false,
    nombre: "Varianza a partir de las desviaciones",
    descripcion: "Con una media entera, las desviaciones son enteras y la varianza sale sin decimales complicados.",
    pasos: [
      "Para la varianza poblacional busca primero la media: si es un entero, todas las desviaciones son enteras y la cuenta queda limpia.",
      "Datos $2, 4, 4, 4, 5, 5, 7, 9$: la suma es $40$, hay $n = 8$ datos y la media es $\\bar{x} = 5$.",
      "Desviaciones $x - \\bar{x}$: $-3, -1, -1, -1, 0, 0, 2, 4$. Elevadas al cuadrado: $9, 1, 1, 1, 0, 0, 4, 16$.",
      "Suma los cuadrados: $9 + 1 + 1 + 1 + 0 + 0 + 4 + 16 = 32$. Varianza poblacional: $\\sigma^2 = \\dfrac{32}{8} = 4$.",
      "El desvío estándar es la raíz de la varianza: $\\sigma = \\sqrt{4} = 2$.",
      "Para la varianza muestral se divide entre $n - 1$ en vez de $n$: $s^2 = \\dfrac{32}{7} \\approx 4.57$. Fíjate siempre cuál de las dos piden.",
    ],
    visuales: [
      {
        tipo: "estadistica.desvios",
        despuesDePaso: 2,
        titulo: "Desviaciones respecto de la media y sus cuadrados",
        datos: [2, 4, 4, 4, 5, 5, 7, 9],
        centro: 5,
        etiquetaCentro: "Media",
        mostrarCuadrados: true,
      },
    ],
  },
];
