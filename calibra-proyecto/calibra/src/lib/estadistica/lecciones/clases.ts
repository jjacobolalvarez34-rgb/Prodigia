import type { ClaseEstadistica } from "./tipos";
import { cuadroFactorial, cuadrosCombinacion, cuadrosPermutacion, expandir, fraccionTex } from "./ayudas";
import { combinaciones } from "@/lib/estadistica/visualesDatos";

// Ejemplo resuelto de "dato que falta" (Clase 2): la media de 5 datos es 8 y
// cuatro datos son conocidos. Los números que muestran los cuadros salen de
// aquí; lecciones.test.ts los contrasta con la aritmética hecha a mano.
const DATO_FALTANTE = (() => {
  const media = 8;
  const n = 5;
  const conocidos = [4, 9, 11, 7];
  const total = media * n;
  const sumaConocidos = conocidos.reduce((a, d) => a + d, 0);
  return { media, n, conocidos, total, sumaConocidos, faltante: total - sumaConocidos };
})();

// Ejemplo resuelto de rango percentil (Clase 6): los mismos 10 datos de los
// percentiles, con x = 33.
const RANGO_PERCENTIL = (() => {
  const datos = [12, 15, 18, 21, 24, 27, 30, 33, 36, 39];
  const x = 33;
  const menoresOIguales = datos.filter((d) => d <= x).length;
  return { datos, x, n: datos.length, menoresOIguales, porcentaje: (menoresOIguales * 100) / datos.length };
})();

// Las 8 Clases (Pro) de Estadística. Fuente ÚNICA de la migración
// 0218_estadistica_visuales.sql: `pasos` y `quiz` son los sembrados en 0191
// (el quiz IDÉNTICO: /api/aprender/completar valida por igualdad exacta; los
// `pasos` solo cambian el voseo) y `visuales` es lo nuevo.
export const CLASES_ESTADISTICA: ClaseEstadistica[] = [
  {
    slug: "estadistica-clase-1-datos-y-tipos-de-variable",
    orden: 6,
    requierePro: true,
    nombre: "Clase 1: Datos y tipos de variable",
    descripcion: "Qué es un dato, población y muestra, y cómo clasificar cualquier variable.",
    pasos: [
      "La estadística trabaja con datos: observaciones de una característica en un grupo. La población es todo el grupo que te interesa; la muestra es la parte que realmente mides. Un número calculado sobre la población se llama parámetro; calculado sobre la muestra, estadístico.",
      "Cada característica que se observa es una variable. Hay dos familias: cualitativas (categorías, como el color de ojos o el talle) y cuantitativas (números con sentido, como la edad o la cantidad de hermanos).",
      "Cualitativa nominal: las categorías no tienen un orden natural (color de ojos). Cualitativa ordinal: las categorías sí se ordenan (talle S, M, L).",
      "Cuantitativa discreta: toma valores sueltos y se cuenta (cantidad de hermanos: $0, 1, 2, \\dots$). Cuantitativa continua: puede tomar cualquier valor de un intervalo y se mide (estatura: $1.62$ m, $1.625$ m, $\\dots$).",
      "Ejemplo resuelto: en una encuesta a 30 personas se registran (a) barrio donde vive, (b) satisfacción: baja, media o alta, (c) cantidad de mascotas y (d) minutos de viaje al trabajo. Clasificación: (a) cualitativa nominal, (b) cualitativa ordinal, (c) cuantitativa discreta y (d) cuantitativa continua.",
      "Por qué importa: el tipo de variable decide qué se puede calcular. Tiene sentido la media de la cantidad de mascotas, pero no el \"promedio\" de los barrios; para una variable nominal se usa la moda.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 4,
        titulo: "Clasificar las cuatro variables de la encuesta",
        cuadros: [
          { texto: "Una encuesta a 30 personas registra cuatro variables." },
          { texto: "(a) Barrio donde vive: son categorías sin un orden natural.", resaltar: "Cualitativa nominal" },
          { texto: "(b) Satisfacción (baja, media o alta): son categorías que sí se ordenan.", resaltar: "Cualitativa ordinal" },
          { texto: "(c) Cantidad de mascotas: son valores sueltos que se cuentan.", resaltar: "Cuantitativa discreta" },
          { texto: "(d) Minutos de viaje al trabajo: puede ser cualquier valor de un intervalo y se mide.", resaltar: "Cuantitativa continua" },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué tipo de variable es \"cantidad de goles en un partido\"?",
        opciones: ["Cuantitativa discreta", "Cuantitativa continua", "Cualitativa nominal", "Cualitativa ordinal"],
        respuesta: "Cuantitativa discreta",
        explicacion: "Se cuenta con valores sueltos ($0, 1, 2, \\dots$), por eso es cuantitativa discreta.",
      },
      {
        pregunta: "El nivel de estudios (primario, secundario, universitario) es una variable:",
        opciones: ["Cualitativa nominal", "Cuantitativa continua", "Cualitativa ordinal", "Cuantitativa discreta"],
        respuesta: "Cualitativa ordinal",
        explicacion: "Son categorías (cualitativa) y tienen un orden natural, así que es ordinal.",
      },
      {
        pregunta: "Se mide la altura de 40 estudiantes elegidos de una escuela con 900. Los 900 estudiantes son la ___ y los 40 son la ___.",
        opciones: ["muestra; población", "variable; parámetro", "población; muestra", "parámetro; estadístico"],
        respuesta: "población; muestra",
        explicacion: "La población es todo el grupo de interés (900); la muestra es la parte que se mide (40).",
      },
    ],
  },
  {
    slug: "estadistica-clase-2-tendencia-central",
    orden: 7,
    requierePro: true,
    nombre: "Clase 2: Media, mediana y moda",
    descripcion: "Las tres medidas de tendencia central, cuándo usar cada una y por qué los extremos las afectan distinto.",
    pasos: [
      "La tendencia central resume un conjunto de datos con un único valor \"típico\". Las tres medidas clásicas son la media, la mediana y la moda.",
      "Media: $\\bar{x} = \\dfrac{\\sum x_i}{n}$, la suma de los datos dividida por la cantidad. Es el punto de equilibrio de los datos.",
      "Mediana: el valor del medio de los datos ordenados (el promedio de los dos centrales si $n$ es par). La mitad de los datos queda por debajo y la mitad por encima.",
      "Moda: el valor que más se repite. Puede no existir o haber más de una.",
      "Ejemplo resuelto: sueldos (en miles) de 5 empleados: $3, 5, 5, 7, 50$. Media: $\\dfrac{3+5+5+7+50}{5} = \\dfrac{70}{5} = 14$. Mediana: ya están ordenados y la posición $3$ vale $5$. Moda: $5$ (aparece dos veces).",
      "Lectura: el $50$ (un valor extremo) arrastra la media hasta $14$, un valor que no representa a casi nadie. La mediana ($5$) resiste los extremos. Con datos muy asimétricos o con atípicos conviene la mediana.",
      "Tabla de frecuencias: si el valor $x_i$ aparece $f_i$ veces, la media es $\\bar{x} = \\dfrac{\\sum x_i f_i}{\\sum f_i}$. Con valores $1, 2, 3$ y frecuencias $2, 5, 3$: $\\dfrac{1 \\cdot 2 + 2 \\cdot 5 + 3 \\cdot 3}{10} = \\dfrac{21}{10} = 2.1$.",
      "Dato que falta: si conoces la media, conoces la suma total, porque $\\text{suma total} = \\bar{x} \\cdot n$. Ejemplo: la media de $5$ datos es $8$ y los otros cuatro datos son $4, 9, 11, 7$. Suma total: $8 \\cdot 5 = 40$. Suma de los datos conocidos: $4 + 9 + 11 + 7 = 31$. El dato que falta es la diferencia: $40 - 31 = 9$.",
      "Otra forma de verlo: las desviaciones respecto de la media siempre suman $0$. Las de los datos conocidos son $-4, +1, +3, -1$ y suman $-1$, así que al dato que falta le toca $+1$: $8 + 1 = 9$. Comprobación: $\\dfrac{4+9+11+7+9}{5} = \\dfrac{40}{5} = 8$.",
    ],
    visuales: [
      {
        tipo: "estadistica.ordenar",
        despuesDePaso: 4,
        titulo: "La mediana de los sueldos",
        datos: [3, 5, 5, 7, 50],
        resaltar: "mediana",
      },
      {
        tipo: "estadistica.frecuencias",
        despuesDePaso: 4,
        titulo: "La moda y la media de los sueldos",
        datos: [3, 5, 5, 7, 50],
        mostrarMedia: true,
      },
      {
        tipo: "estadistica.desvios",
        despuesDePaso: 5,
        titulo: "La media es el punto de equilibrio: las desviaciones suman 0",
        datos: [3, 5, 5, 7, 50],
        centro: 14,
        etiquetaCentro: "Media",
      },
      {
        tipo: "estadistica.frecuencias",
        despuesDePaso: 6,
        titulo: "Los valores 1, 2 y 3 con frecuencias 2, 5 y 3",
        datos: expandir([1, 2, 3], [2, 5, 3]),
        mostrarMedia: true,
      },
      {
        tipo: "cuadros",
        despuesDePaso: 7,
        titulo: "Hallar el dato que falta a partir de la media",
        cuadros: [
          { texto: "La media de $5$ datos es $8$; cuatro datos son $4, 9, 11, 7$. La suma total sale de la media." },
          { formula: `${DATO_FALTANTE.media} \\cdot ${DATO_FALTANTE.n}`, resaltar: `$= ${DATO_FALTANTE.total}$` },
          { texto: `Los datos conocidos suman $${DATO_FALTANTE.conocidos.join(" + ")} = ${DATO_FALTANTE.sumaConocidos}$.` },
          { formula: `${DATO_FALTANTE.total} - ${DATO_FALTANTE.sumaConocidos}`, resaltar: `$= ${DATO_FALTANTE.faltante}$ (el dato que falta)` },
        ],
      },
      {
        tipo: "estadistica.desvios",
        despuesDePaso: 8,
        titulo: "Con el dato que falta (9) incluido, las desviaciones suman 0",
        datos: [...DATO_FALTANTE.conocidos, DATO_FALTANTE.faltante],
        centro: DATO_FALTANTE.media,
        etiquetaCentro: "Media",
      },
    ],
    quiz: [
      {
        pregunta: "Datos $2, 4, 4, 6, 9$. ¿Cuánto vale la media?",
        opciones: ["$4$", "$5$", "$6$", "$4.5$"],
        respuesta: "$5$",
        explicacion: "$2 + 4 + 4 + 6 + 9 = 25$ y $25 / 5 = 5$.",
      },
      {
        pregunta: "Con los datos $1, 2, 3, 4, 100$, ¿qué medida describe mejor a un dato típico?",
        opciones: ["La media ($22$)", "La mediana ($3$)", "El rango ($99$)", "La media, porque usa todos los datos"],
        respuesta: "La mediana ($3$)",
        explicacion: "El $100$ arrastra la media hasta $22$, mientras que la mediana ($3$) no se mueve por el extremo.",
      },
      {
        pregunta: "Datos $8, 3, 5, 10$. ¿Cuánto vale la mediana?",
        opciones: ["$5$", "$8$", "$6.5$", "$6$"],
        respuesta: "$6.5$",
        explicacion: "Ordenados: $3, 5, 8, 10$. Con $n$ par, la mediana es el promedio de los centrales: $\\dfrac{5+8}{2} = 6.5$.",
      },
      {
        pregunta: "La media de $4$ datos es $10$. Tres de los datos son $8, 12$ y $9$. ¿Cuál es el cuarto dato?",
        opciones: ["$9$", "$10$", "$11$", "$12$"],
        respuesta: "$11$",
        explicacion: "La suma total es $10 \\cdot 4 = 40$ y los tres datos conocidos suman $8 + 12 + 9 = 29$, así que falta $40 - 29 = 11$. El $10$ es la media, no el dato que falta.",
      },
    ],
  },
  {
    slug: "estadistica-clase-3-dispersion",
    orden: 8,
    requierePro: true,
    nombre: "Clase 3: Dispersión, varianza y desvío",
    descripcion: "Rango, rango intercuartílico, varianza poblacional y muestral, y cómo cambian al transformar los datos.",
    pasos: [
      "Dos grupos pueden tener la misma media y ser muy distintos: $4, 5, 6$ y $0, 5, 10$ tienen media $5$. La dispersión mide cuánto se alejan los datos de su centro.",
      "Rango: $\\text{máx} - \\text{mín}$. Es simple, pero depende solo de dos datos. Rango intercuartílico: $IQR = Q_3 - Q_1$ (cuartiles por el método de las mitades); ignora los extremos.",
      "Varianza poblacional: $\\sigma^2 = \\dfrac{\\sum (x_i - \\mu)^2}{N}$. Varianza muestral: $s^2 = \\dfrac{\\sum (x_i - \\bar{x})^2}{n-1}$. El desvío estándar es la raíz ($\\sigma$ o $s$) y queda en las mismas unidades que los datos.",
      "Por qué $n - 1$ en la muestral: como $\\bar{x}$ se calcula con los mismos datos, las desviaciones salen un poco más chicas que respecto de la media real; dividir entre $n - 1$ compensa ese sesgo. Usa $n$ solo si tienes toda la población.",
      "Ejemplo resuelto con $4, 8, 6, 5, 12$: la media es $\\dfrac{35}{5} = 7$. Desviaciones: $-3, 1, -1, -2, 5$. Cuadrados: $9, 1, 1, 4, 25$, con suma $40$.",
      "Si es toda la población: $\\sigma^2 = \\dfrac{40}{5} = 8$ y $\\sigma = \\sqrt{8} \\approx 2.83$. Si es una muestra: $s^2 = \\dfrac{40}{4} = 10$ y $s = \\sqrt{10} \\approx 3.16$.",
      "Efecto de transformar los datos: sumar una constante mueve la media pero no cambia ninguna medida de dispersión; multiplicar por $k$ multiplica el desvío por $|k|$ y la varianza por $k^2$. Con los datos del ejemplo multiplicados por $2$ ($8, 16, 12, 10, 24$), la varianza poblacional pasa de $8$ a $32$ y el desvío poblacional de $\\sqrt{8}$ a $2\\sqrt{8}$.",
    ],
    visuales: [
      {
        tipo: "estadistica.desvios",
        despuesDePaso: 0,
        titulo: "Datos 4, 5 y 6: cerca de la media",
        datos: [4, 5, 6],
        centro: 5,
        etiquetaCentro: "Media",
        mostrarCuadrados: true,
      },
      {
        tipo: "estadistica.desvios",
        despuesDePaso: 0,
        titulo: "Datos 0, 5 y 10: lejos de la media",
        datos: [0, 5, 10],
        centro: 5,
        etiquetaCentro: "Media",
        mostrarCuadrados: true,
      },
      {
        tipo: "estadistica.desvios",
        despuesDePaso: 4,
        titulo: "Desviaciones y cuadrados del ejemplo resuelto",
        datos: [4, 8, 6, 5, 12],
        centro: 7,
        etiquetaCentro: "Media",
        mostrarCuadrados: true,
      },
      {
        tipo: "estadistica.desvios",
        despuesDePaso: 6,
        titulo: "Los datos multiplicados por 2",
        datos: [8, 16, 12, 10, 24],
        centro: 14,
        etiquetaCentro: "Media",
        mostrarCuadrados: true,
      },
    ],
    quiz: [
      {
        pregunta: "Datos $3, 5, 7, 9$ (toda la población). ¿Cuánto vale la varianza poblacional?",
        opciones: ["$20$", "$6.67$", "$5$", "$2.24$"],
        respuesta: "$5$",
        explicacion: "La media es $6$; las desviaciones al cuadrado son $9, 1, 1, 9$ (suma $20$). $\\sigma^2 = \\dfrac{20}{4} = 5$. El $6.67$ sería la muestral y el $2.24$ es el desvío.",
      },
      {
        pregunta: "Con esos mismos datos $3, 5, 7, 9$ pero como MUESTRA, ¿cuánto vale la varianza muestral?",
        opciones: ["$5$", "$\\dfrac{20}{3} \\approx 6.67$", "$20$", "$4$"],
        respuesta: "$\\dfrac{20}{3} \\approx 6.67$",
        explicacion: "En la muestral se divide entre $n - 1 = 3$: $s^2 = \\dfrac{20}{3} \\approx 6.67$.",
      },
      {
        pregunta: "Si a todos los datos les sumas 10, ¿qué le pasa al desvío estándar?",
        opciones: ["Aumenta 10", "No cambia", "Se multiplica por 10", "Aumenta 100"],
        respuesta: "No cambia",
        explicacion: "Sumar una constante desplaza todos los datos igual: la media sube 10 pero las distancias entre datos (y por lo tanto el desvío) no cambian.",
      },
    ],
  },
  {
    slug: "estadistica-clase-4-probabilidad",
    orden: 9,
    requierePro: true,
    nombre: "Clase 4: Probabilidad simple, independiente y condicional",
    descripcion: "De contar casos favorables a eventos independientes, dependientes y probabilidad condicional con tablas.",
    pasos: [
      "Con casos igualmente probables, $P(A) = \\dfrac{\\text{casos favorables}}{\\text{casos posibles}}$. Siempre está entre $0$ y $1$.",
      "Ejemplo: una bolsa con 3 bolas rojas, 5 azules y 2 verdes (10 en total). $P(\\text{roja}) = \\dfrac{3}{10}$.",
      "Complemento: $P(\\text{no } A) = 1 - P(A)$. Entonces $P(\\text{no roja}) = 1 - \\dfrac{3}{10} = \\dfrac{7}{10}$ (que también es $\\dfrac{5+2}{10}$).",
      "Eventos independientes (con reposición): $P(A \\text{ y } B) = P(A) \\cdot P(B)$. Roja y luego azul devolviendo la bola: $\\dfrac{3}{10} \\cdot \\dfrac{5}{10} = \\dfrac{15}{100} = \\dfrac{3}{20}$.",
      "Sin reposición, el segundo evento depende del primero: quedan $9$ bolas. Roja y luego azul: $\\dfrac{3}{10} \\cdot \\dfrac{5}{9} = \\dfrac{15}{90} = \\dfrac{1}{6}$.",
      "Probabilidad condicional: $P(B \\mid A) = \\dfrac{P(A \\text{ y } B)}{P(A)}$; en la práctica, \"de los casos donde ocurrió $A$, ¿en cuántos ocurre $B$?\". Ejemplo con una tabla: de 40 estudiantes, 18 estudiaron y aprobaron, 6 estudiaron y reprobaron, 4 no estudiaron y aprobaron, 12 no estudiaron y reprobaron.",
      "$P(\\text{aprobó} \\mid \\text{estudió}) = \\dfrac{18}{18+6} = \\dfrac{18}{24} = \\dfrac{3}{4}$. No es lo mismo que $P(\\text{estudió} \\mid \\text{aprobó}) = \\dfrac{18}{18+4} = \\dfrac{18}{22} = \\dfrac{9}{11}$: invertir la condición cambia la respuesta.",
    ],
    visuales: [
      {
        tipo: "estadistica.arbol",
        despuesDePaso: 3,
        titulo: "Dos bolas devolviendo la primera: los eventos son independientes",
        raiz: "Bolsa: 3 rojas, 5 azules y 2 verdes",
        ramas: [
          {
            etiqueta: "1.ª roja",
            probabilidad: 0.3,
            hijos: [
              { etiqueta: "2.ª azul", probabilidad: 0.5 },
              { etiqueta: "2.ª no azul", probabilidad: 0.5 },
            ],
          },
          {
            etiqueta: "1.ª no roja",
            probabilidad: 0.7,
            hijos: [
              { etiqueta: "2.ª azul", probabilidad: 0.5 },
              { etiqueta: "2.ª no azul", probabilidad: 0.5 },
            ],
          },
        ],
      },
      {
        tipo: "estadistica.arbol",
        despuesDePaso: 6,
        titulo: "Los 40 estudiantes: cada rama es una probabilidad condicional",
        raiz: "40 estudiantes",
        ramas: [
          {
            etiqueta: "Estudió",
            probabilidad: 0.6,
            hijos: [
              { etiqueta: "Aprobó", probabilidad: 0.75 },
              { etiqueta: "Reprobó", probabilidad: 0.25 },
            ],
          },
          {
            etiqueta: "No estudió",
            probabilidad: 0.4,
            hijos: [
              { etiqueta: "Aprobó", probabilidad: 0.25 },
              { etiqueta: "Reprobó", probabilidad: 0.75 },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "Un dado justo de 6 caras. ¿Cuál es la probabilidad de sacar un número primo (2, 3 o 5)?",
        opciones: ["$\\dfrac{1}{3}$", "$\\dfrac{1}{2}$", "$\\dfrac{2}{3}$", "$\\dfrac{1}{6}$"],
        respuesta: "$\\dfrac{1}{2}$",
        explicacion: "Hay $3$ casos favorables de $6$ posibles: $\\dfrac{3}{6} = \\dfrac{1}{2}$.",
      },
      {
        pregunta: "Una bolsa tiene 4 bolas rojas y 6 azules. Se sacan 2 bolas, una tras otra y sin devolverlas. ¿Cuál es la probabilidad de que las dos sean rojas?",
        opciones: ["$\\dfrac{4}{25}$", "$\\dfrac{3}{10}$", "$\\dfrac{2}{15}$", "$\\dfrac{1}{5}$"],
        respuesta: "$\\dfrac{2}{15}$",
        explicacion: "Sin reposición: $\\dfrac{4}{10} \\cdot \\dfrac{3}{9} = \\dfrac{12}{90} = \\dfrac{2}{15}$. El $\\dfrac{4}{25}$ sería el resultado con reposición ($\\dfrac{4}{10} \\cdot \\dfrac{4}{10}$).",
      },
      {
        pregunta: "De 50 clientes, 20 usaron un cupón y, de ellos, 15 compraron. ¿Cuánto vale P(compró | usó cupón)?",
        opciones: ["$\\dfrac{3}{10}$", "$\\dfrac{2}{5}$", "$\\dfrac{1}{4}$", "$\\dfrac{3}{4}$"],
        respuesta: "$\\dfrac{3}{4}$",
        explicacion: "Se mira solo a quienes usaron cupón: $\\dfrac{15}{20} = \\dfrac{3}{4}$. El $\\dfrac{3}{10}$ ($\\dfrac{15}{50}$) divide entre todos los clientes, no entre los que usaron cupón.",
      },
    ],
  },
  {
    slug: "estadistica-clase-5-combinatoria",
    orden: 10,
    requierePro: true,
    nombre: "Clase 5: Combinatoria — contar sin listar",
    descripcion: "Principio multiplicativo, factorial, permutaciones y combinaciones, y su uso en probabilidad.",
    pasos: [
      "Combinatoria es contar sin listar. Principio multiplicativo: si un proceso tiene pasos con $a$, $b$, $c$, $\\dots$ opciones, en total hay $a \\cdot b \\cdot c \\cdots$ formas. Con $3$ remeras y $4$ pantalones hay $3 \\cdot 4 = 12$ conjuntos.",
      "Factorial: $n! = n \\cdot (n-1) \\cdots 2 \\cdot 1$, con $0! = 1$. Es la cantidad de formas de ordenar $n$ objetos distintos: $5! = 120$ personas en fila se ordenan de $120$ maneras.",
      "Permutaciones: elegir $r$ de $n$ cuando el ORDEN importa, $P(n, r) = \\dfrac{n!}{(n-r)!}$. Un podio (1.º, 2.º y 3.º) entre $8$ corredores: $P(8, 3) = 8 \\cdot 7 \\cdot 6 = 336$.",
      "Combinaciones: elegir $r$ de $n$ cuando el orden NO importa, $C(n, r) = \\dfrac{n!}{r!\\,(n-r)!} = \\dfrac{P(n, r)}{r!}$. Un comité de $3$ personas entre $8$: $C(8, 3) = \\dfrac{336}{3!} = \\dfrac{336}{6} = 56$.",
      "Cómo elegir: cambia el orden de los mismos elegidos y pregúntate si es otro resultado. En un podio sí (permutación); en un comité no (combinación).",
      "Combinatoria y probabilidad: una bolsa con $4$ bolas rojas y $6$ azules, se sacan $2$ a la vez. Casos posibles: $C(10, 2) = 45$. Casos con las dos rojas: $C(4, 2) = 6$. Entonces $P = \\dfrac{6}{45} = \\dfrac{2}{15}$, igual que calcularlo en fila sin reposición: $\\dfrac{4}{10} \\cdot \\dfrac{3}{9}$.",
      "Una roja y una azul: hay $4 \\cdot 6 = 24$ pares favorables (cualquier roja con cualquier azul), así que $P = \\dfrac{24}{45} = \\dfrac{8}{15}$.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 0,
        titulo: "Principio multiplicativo",
        cuadros: [
          { texto: "Con $3$ remeras y $4$ pantalones, cada remera se combina con cada pantalón." },
          { formula: "3 \\cdot 4", resaltar: `$= ${3 * 4}$ conjuntos` },
        ],
      },
      { tipo: "cuadros", despuesDePaso: 1, titulo: "Factorial", cuadros: cuadroFactorial(5) },
      { tipo: "cuadros", despuesDePaso: 2, titulo: "Un podio entre 8 corredores", cuadros: cuadrosPermutacion(8, 3) },
      { tipo: "cuadros", despuesDePaso: 3, titulo: "Un comité de 3 entre 8 personas", cuadros: cuadrosCombinacion(8, 3) },
      {
        tipo: "cuadros",
        despuesDePaso: 5,
        titulo: "Las dos bolas son rojas",
        cuadros: [
          { texto: `Casos posibles al sacar $2$ bolas de $10$: $C(10, 2) = ${combinaciones(10, 2)}$.` },
          { texto: `Casos con las dos rojas: $C(4, 2) = ${combinaciones(4, 2)}$.` },
          { formula: `P = \\dfrac{${combinaciones(4, 2)}}{${combinaciones(10, 2)}}`, resaltar: `$= ${fraccionTex(combinaciones(4, 2), combinaciones(10, 2))}$` },
        ],
      },
      {
        tipo: "cuadros",
        despuesDePaso: 6,
        titulo: "Una bola roja y una azul",
        cuadros: [
          { texto: `Cada roja se puede emparejar con cada azul: $4 \\cdot 6 = ${4 * 6}$ pares favorables.` },
          { formula: `P = \\dfrac{${4 * 6}}{${combinaciones(10, 2)}}`, resaltar: `$= ${fraccionTex(4 * 6, combinaciones(10, 2))}$` },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿De cuántas formas se pueden ordenar 4 libros distintos en un estante?",
        opciones: ["$16$", "$12$", "$24$", "$4$"],
        respuesta: "$24$",
        explicacion: "Son las formas de ordenar $4$ objetos distintos: $4! = 4 \\cdot 3 \\cdot 2 \\cdot 1 = 24$.",
      },
      {
        pregunta: "Un club elige presidente y tesorero (cargos distintos) entre 6 socios. ¿De cuántas maneras puede hacerlo?",
        opciones: ["$15$", "$30$", "$12$", "$36$"],
        respuesta: "$30$",
        explicacion: "Los cargos son distintos, así que el orden importa: $P(6, 2) = 6 \\cdot 5 = 30$. El $15$ sería $C(6, 2)$, si el orden no importara.",
      },
      {
        pregunta: "Se eligen 3 postres distintos entre 7 (el orden no importa). ¿Cuántas selecciones hay?",
        opciones: ["$210$", "$21$", "$343$", "$35$"],
        respuesta: "$35$",
        explicacion: "$C(7, 3) = \\dfrac{7 \\cdot 6 \\cdot 5}{3 \\cdot 2 \\cdot 1} = \\dfrac{210}{6} = 35$. El $210$ es $P(7, 3)$, que cuenta también el orden.",
      },
    ],
  },
  {
    slug: "estadistica-clase-6-normal-z-y-percentiles",
    orden: 11,
    requierePro: true,
    nombre: "Clase 6: Puntaje z, regla empírica y percentiles",
    descripcion: "Medir cuántos desvíos se aleja un dato, comparar escalas distintas y ubicar un dato dentro del conjunto.",
    pasos: [
      "Puntaje z: cuántos desvíos estándar se aleja un dato de la media, $z = \\dfrac{x - \\mu}{\\sigma}$. Positivo: por encima de la media; negativo: por debajo; $0$: justo en la media.",
      "Ejemplo: en una prueba $\\mu = 70$ y $\\sigma = 8$. Alguien saca $86$: $z = \\dfrac{86 - 70}{8} = 2$, a dos desvíos por encima. Alguien saca $62$: $z = \\dfrac{62 - 70}{8} = -1$.",
      "Inverso: $x = \\mu + z\\sigma$. ¿Qué nota corresponde a $z = 1.5$? $x = 70 + 1.5 \\cdot 8 = 82$.",
      "Comparar cosas distintas: en Matemática ($\\mu = 70$, $\\sigma = 8$) alguien sacó $78$, con $z = 1$; en Lengua ($\\mu = 75$, $\\sigma = 6$) sacó $84$, con $z = 1.5$. Como los $z$ están en la misma escala, se ve que en Lengua le fue relativamente mejor.",
      "Regla empírica (distribución normal): aproximadamente el 68 % de los datos está a menos de $1\\sigma$ de la media, el 95 % a menos de $2\\sigma$ y el 99.7 % a menos de $3\\sigma$. Con $\\mu = 100$ y $\\sigma = 15$: entre $85$ y $115$ está el 68 %; entre $70$ y $130$, el 95 %.",
      "Las colas son simétricas: si el 95 % está entre $70$ y $130$, queda 5 % afuera, mitad en cada lado; por encima de $130$ hay aproximadamente 2.5 %.",
      "Percentiles (método del rango más cercano): el percentil $P$ es el dato en la posición $\\lceil P \\cdot N / 100 \\rceil$ del conjunto ordenado. Con $N = 10$ datos $12, 15, 18, 21, 24, 27, 30, 33, 36, 39$: el percentil $70$ está en la posición $\\lceil 7 \\rceil = 7$, es decir $30$; el percentil $25$ está en $\\lceil 2.5 \\rceil = 3$, es decir $18$.",
      "Rango percentil (el camino inverso): dado un valor $x$, ¿qué porcentaje de los datos es menor o igual que $x$? Se cuenta cuántos datos son menores o iguales que $x$ y se divide entre $N$: $\\dfrac{\\text{datos} \\le x}{N} \\cdot 100$. Con los mismos $N = 10$ datos y $x = 33$: hay $8$ datos menores o iguales ($12, 15, 18, 21, 24, 27, 30, 33$), así que $\\dfrac{8}{10} \\cdot 100 = 80$ %.",
      "Comprobación con el método anterior: el percentil $80$ está en la posición $\\lceil 80 \\cdot 10 / 100 \\rceil = 8$, es decir $33$. Un camino va del porcentaje al dato y el otro, del dato al porcentaje. Ojo: se cuentan los datos, no el valor: $33$ no es el $33$ %.",
    ],
    visuales: [
      {
        tipo: "estadistica.desvios",
        despuesDePaso: 1,
        titulo: "Puntaje z de los puntajes 86 y 62",
        datos: [86, 62],
        centro: 70,
        etiquetaCentro: "Media",
        sigma: 8,
      },
      {
        tipo: "estadistica.desvios",
        despuesDePaso: 3,
        titulo: "Matemática: el puntaje z de un 78",
        datos: [78],
        centro: 70,
        etiquetaCentro: "Media",
        sigma: 8,
      },
      {
        tipo: "estadistica.desvios",
        despuesDePaso: 3,
        titulo: "Lengua: el puntaje z de un 84",
        datos: [84],
        centro: 75,
        etiquetaCentro: "Media",
        sigma: 6,
      },
      {
        tipo: "estadistica.normal",
        despuesDePaso: 4,
        titulo: "Regla empírica con media 100 y desvío 15",
        media: 100,
        sigma: 15,
      },
      {
        tipo: "estadistica.ordenar",
        despuesDePaso: 6,
        titulo: "Percentil 70 con N = 10 datos",
        datos: [12, 15, 18, 21, 24, 27, 30, 33, 36, 39],
        resaltar: "posicion",
        posicion: 7,
        etiquetaPosicion: "Percentil 70",
      },
      {
        tipo: "estadistica.ordenar",
        despuesDePaso: 6,
        titulo: "Percentil 25 con N = 10 datos",
        datos: [12, 15, 18, 21, 24, 27, 30, 33, 36, 39],
        resaltar: "posicion",
        posicion: 3,
        etiquetaPosicion: "Percentil 25",
      },
      {
        tipo: "estadistica.ordenar",
        despuesDePaso: 7,
        titulo: "Rango percentil del 33 con N = 10 datos",
        datos: RANGO_PERCENTIL.datos,
        resaltar: "posicion",
        posicion: RANGO_PERCENTIL.menoresOIguales,
        etiquetaPosicion: `El ${RANGO_PERCENTIL.x} es el último de ${RANGO_PERCENTIL.menoresOIguales} datos menores o iguales`,
      },
      {
        tipo: "cuadros",
        despuesDePaso: 7,
        titulo: "De un valor al porcentaje de datos",
        cuadros: [
          { texto: `Con $N = ${RANGO_PERCENTIL.n}$ datos, los menores o iguales que $${RANGO_PERCENTIL.x}$ son $${RANGO_PERCENTIL.menoresOIguales}$.` },
          { formula: `\\dfrac{${RANGO_PERCENTIL.menoresOIguales}}{${RANGO_PERCENTIL.n}} \\cdot 100`, resaltar: `$= ${RANGO_PERCENTIL.porcentaje}$ %` },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "Con $\\mu = 50$ y $\\sigma = 5$, ¿qué puntaje $z$ tiene $x = 60$?",
        opciones: ["$10$", "$0.2$", "$-2$", "$2$"],
        respuesta: "$2$",
        explicacion: "$z = \\dfrac{60 - 50}{5} = 2$: el dato está a dos desvíos por encima de la media.",
      },
      {
        pregunta: "En una variable normal con $\\mu = 100$ y $\\sigma = 15$, ¿qué porcentaje aproximado de los datos hay entre $70$ y $130$?",
        opciones: ["68 %", "95 %", "99.7 %", "50 %"],
        respuesta: "95 %",
        explicacion: "$70 = \\mu - 2\\sigma$ y $130 = \\mu + 2\\sigma$, y a $\\pm 2\\sigma$ está aproximadamente el 95 %.",
      },
      {
        pregunta: "Con N = 20 datos ordenados, ¿en qué posición está el percentil 90 según el método del rango más cercano?",
        opciones: ["La posición 20", "La posición 19", "La posición 18", "La posición 9"],
        respuesta: "La posición 18",
        explicacion: "La posición es $\\lceil 90 \\cdot 20 / 100 \\rceil = \\lceil 18 \\rceil = 18$.",
      },
      {
        pregunta: "En un conjunto de $N = 20$ datos, $15$ datos son menores o iguales que $62$. ¿Qué porcentaje de los datos es menor o igual que $62$?",
        opciones: ["15 %", "25 %", "62 %", "75 %"],
        respuesta: "75 %",
        explicacion: "Se divide la cantidad de datos entre el total: $\\dfrac{15}{20} \\cdot 100 = 75$ %. El $25$ % es lo que queda por encima, y el $62$ es el valor, no un porcentaje.",
      },
    ],
  },
  {
    slug: "estadistica-clase-7-correlacion-y-regresion",
    orden: 12,
    requierePro: true,
    nombre: "Clase 7: Correlación y regresión lineal simple",
    descripcion: "Medir la relación entre dos variables, ajustar una recta de mínimos cuadrados y no sacar conclusiones de más.",
    pasos: [
      "A veces se miden dos variables en las mismas personas (horas de estudio y nota). La correlación mide qué tan bien una recta describe la relación entre ambas. El coeficiente de Pearson $r$ va de $-1$ a $1$.",
      "Signo: $r > 0$, cuando una sube la otra tiende a subir; $r < 0$, cuando una sube la otra tiende a bajar; $r$ cerca de $0$, no hay relación LINEAL. Valores cerca de $\\pm 1$ indican una relación lineal fuerte.",
      "Fórmula: $r = \\dfrac{S_{xy}}{\\sqrt{S_{xx}\\,S_{yy}}}$, con $S_{xy} = \\sum (x_i - \\bar{x})(y_i - \\bar{y})$, $S_{xx} = \\sum (x_i - \\bar{x})^2$ y $S_{yy} = \\sum (y_i - \\bar{y})^2$.",
      "Ejemplo resuelto: $x = 1, 2, 3, 4, 5$ e $y = 1, 3, 2, 5, 4$. Medias: $\\bar{x} = 3$ y $\\bar{y} = 3$. Desviaciones de $x$: $-2, -1, 0, 1, 2$; de $y$: $-2, 0, -1, 2, 1$.",
      "Productos: $4, 0, 0, 2, 2$, así que $S_{xy} = 8$. Además $S_{xx} = 4 + 1 + 0 + 1 + 4 = 10$ y $S_{yy} = 4 + 0 + 1 + 4 + 1 = 10$. Entonces $r = \\dfrac{8}{\\sqrt{10 \\cdot 10}} = \\dfrac{8}{10} = 0.8$: correlación positiva fuerte.",
      "Recta de mínimos cuadrados $\\hat{y} = a + bx$: la pendiente es $b = \\dfrac{S_{xy}}{S_{xx}} = \\dfrac{8}{10} = 0.8$ y el intercepto $a = \\bar{y} - b\\bar{x} = 3 - 0.8 \\cdot 3 = 0.6$. Predicción para $x = 6$: $\\hat{y} = 0.6 + 0.8 \\cdot 6 = 5.4$.",
      "Dos advertencias. (1) $r = 0$ no significa \"sin relación\": con $x = 1, \\dots, 5$ e $y = 4, 1, 0, 1, 4$ hay una relación curva perfecta, pero $S_{xy} = 0$ y por lo tanto $r = 0$. (2) Correlación no es causalidad: que dos variables se muevan juntas no prueba que una cause a la otra. Además, extrapolar (predecir lejos del rango de $x$) es riesgoso.",
    ],
    visuales: [
      {
        tipo: "estadistica.dispersion",
        despuesDePaso: 4,
        titulo: "Correlación positiva fuerte y su recta de mínimos cuadrados",
        x: [1, 2, 3, 4, 5],
        y: [1, 3, 2, 5, 4],
        etiquetaX: "x",
        etiquetaY: "y",
        mostrarRecta: true,
      },
      {
        tipo: "estadistica.dispersion",
        despuesDePaso: 6,
        titulo: "Una relación curva perfecta con r = 0",
        x: [1, 2, 3, 4, 5],
        y: [4, 1, 0, 1, 4],
        etiquetaX: "x",
        etiquetaY: "y",
        mostrarRecta: true,
      },
    ],
    quiz: [
      {
        pregunta: "Si $S_{xy} = -12$, $S_{xx} = 10$ y $S_{yy} = 14.4$, ¿cuánto vale $r$?",
        opciones: ["$-0.83$", "$-1$", "$1$", "$-1.2$"],
        respuesta: "$-1$",
        explicacion: "$r = \\dfrac{-12}{\\sqrt{10 \\cdot 14.4}} = \\dfrac{-12}{\\sqrt{144}} = \\dfrac{-12}{12} = -1$. El $-0.83$ sale de dividir entre $14.4$ por error.",
      },
      {
        pregunta: "Con la recta $\\hat{y} = 2 + 3x$, ¿qué valor predice para $x = 4$?",
        opciones: ["$12$", "$9$", "$14$", "$11$"],
        respuesta: "$14$",
        explicacion: "$\\hat{y} = 2 + 3 \\cdot 4 = 14$.",
      },
      {
        pregunta: "Dos variables tienen $r = 0.9$. ¿Qué afirmación es correcta?",
        opciones: ["Una variable causa a la otra", "No hay relación entre las variables", "Si x sube 1, y sube exactamente 0.9", "Hay una relación lineal positiva fuerte, pero eso no prueba que una cause a la otra"],
        respuesta: "Hay una relación lineal positiva fuerte, pero eso no prueba que una cause a la otra",
        explicacion: "Un r cercano a 1 indica relación lineal positiva fuerte. La correlación describe cómo se mueven juntas, no por qué.",
      },
    ],
  },
  {
    slug: "estadistica-clase-8-lectura-critica-de-graficos",
    orden: 13,
    requierePro: true,
    nombre: "Clase 8: Lectura crítica de gráficos",
    descripcion: "Cómo leer barras, líneas, histogramas y diagramas de caja, y cómo detectar gráficos que engañan por escala.",
    pasos: [
      "Un gráfico es un argumento visual: antes de leer los datos, lee el título, las unidades y, sobre todo, el eje. Un gráfico puede estar bien dibujado y aun así engañar.",
      "Barras: cada barra es una categoría y su ALTURA representa el valor, por eso el eje debe empezar en $0$. Histograma: barras pegadas para una variable continua agrupada en clases; cada clase es $[a, b)$ (incluye el límite inferior, no el superior) y la altura es la frecuencia.",
      "Líneas: sirven para series ordenadas en el tiempo. Se lee valor por valor y se compara la pendiente entre puntos consecutivos: el tramo más empinado es donde más cambió.",
      "Diagrama de caja: la caja va de $Q_1$ a $Q_3$ (contiene el 50 % central), la línea interior es la mediana, los bigotes llegan hasta el último dato que no es atípico y los puntos sueltos son atípicos.",
      "Regla de atípicos: un dato es atípico si es menor que $Q_1 - 1.5\\,IQR$ o mayor que $Q_3 + 1.5\\,IQR$. Con $Q_1 = 40$ y $Q_3 = 60$: $IQR = 20$ y las cercas quedan en $40 - 30 = 10$ y $60 + 30 = 90$. Un dato en $95$ es atípico; uno en $85$ no.",
      "Gráfico engañoso por escala. Dos productos venden $100$ y $104$ unidades: la diferencia real es $\\dfrac{104 - 100}{100} = 0.04$, o sea 4 %. Si el eje arranca en $96$ en vez de $0$, la barra de $100$ mide $100 - 96 = 4$ unidades de alto y la de $104$ mide $104 - 96 = 8$: se ve el doble de alta, aunque solo es 4 % mayor.",
      "Cómo protegerte: (1) mira dónde empieza el eje; (2) calcula la diferencia real con los números, no con la altura; (3) desconfía de los ejes cortados, de las escalas distintas entre gráficos que se comparan y de los íconos que agrandan el área.",
      "Entrenamiento con barras. Ventas por sucursal (eje de $0$ a $50$, con marcas cada $10$): Norte $30$, Sur $45$, Este $20$ y Oeste $35$. Valor de una barra: sigue su extremo superior hasta el eje; la de Sur llega a $45$. Mayor y menor: la respuesta es la CATEGORÍA, no el número; la mayor es Sur y la menor es Este. Diferencia: Sur menos Este es $45 - 20 = 25$ unidades. Total: $30 + 45 + 20 + 35 = 130$.",
      "Entrenamiento con líneas, primera parte: valor, máximo y mayor aumento. Visitas por mes de enero a mayo: $10, 20, 25, 40, 45$. El valor en marzo es $25$ y el máximo se alcanza en mayo. Para el mayor aumento se restan puntos consecutivos: $+10, +5, +15, +5$; el más grande es $+15$, entre marzo y abril.",
      "Entrenamiento con líneas, segunda parte: la tendencia general. Si cada punto supera al anterior, la serie crece (las visitas: $10 < 20 < 25 < 40 < 45$). Si cada punto es menor que el anterior, decrece. Si sube y luego baja, se describe como «sube y luego baja» ($20, 40, 50, 30, 10$). Y si varía como máximo media guía (con marcas cada $10$, una variación total de $5$ o menos), se mantiene casi constante: en $30, 32, 30, 33, 31$ la variación es $33 - 30 = 3$.",
      "Entrenamiento con histogramas. Puntajes agrupados en clases de $10$: $[0, 10)$ tiene $3$ datos, $[10, 20)$ tiene $8$, $[20, 30)$ tiene $12$, $[30, 40)$ tiene $7$ y $[40, 50)$ tiene $2$. Total de datos: se suman las frecuencias, $3 + 8 + 12 + 7 + 2 = 32$. Clase modal: la de mayor frecuencia, $[20, 30)$ con $12$ datos (la respuesta es la clase, no el $12$). Datos menores que $30$: se suman las clases que quedan a la izquierda del límite $30$, $3 + 8 + 12 = 23$, porque cada clase incluye su límite inferior y no el superior.",
    ],
    visuales: [
      {
        tipo: "estadistica.grafico",
        despuesDePaso: 1,
        titulo: "Histograma: cada clase incluye su límite inferior y no el superior",
        grafico: {
          tipo: "histograma",
          titulo: "Clases [10, 20), [20, 30) y [30, 40)",
          limites: [10, 20, 30, 40],
          frecuencias: [4, 9, 5],
          eje: { min: 0, max: 10, tick: 2, etiqueta: "Frecuencia" },
          etiquetaX: "Valor",
        },
      },
      {
        tipo: "estadistica.grafico",
        despuesDePaso: 2,
        titulo: "Líneas: el tramo más empinado es donde más cambió",
        grafico: {
          tipo: "lineas",
          titulo: "Ventas por mes",
          etiquetas: ["Ene", "Feb", "Mar", "Abr", "May"],
          valores: [20, 24, 40, 44, 46],
          eje: { min: 0, max: 50, tick: 10, etiqueta: "Unidades" },
        },
      },
      {
        tipo: "estadistica.grafico",
        despuesDePaso: 3,
        titulo: "Diagrama de caja: caja, mediana, bigotes y atípico",
        grafico: {
          tipo: "boxplot",
          titulo: "Distribución de los datos",
          min: 20,
          q1: 40,
          mediana: 50,
          q3: 60,
          max: 85,
          atipicos: [95],
          eje: { min: 0, max: 100, tick: 10, etiqueta: "Valor" },
        },
      },
      {
        tipo: "estadistica.grafico",
        despuesDePaso: 5,
        titulo: "Con el eje desde 0, la diferencia se ve pequeña (4 %)",
        grafico: {
          tipo: "barras",
          titulo: "Ventas con el eje desde 0",
          categorias: ["Producto A", "Producto B"],
          valores: [100, 104],
          eje: { min: 0, max: 120, tick: 20, etiqueta: "Unidades" },
        },
      },
      {
        tipo: "estadistica.grafico",
        despuesDePaso: 5,
        titulo: "Con el eje cortado en 96, el mismo 4 % parece el doble",
        grafico: {
          tipo: "barras",
          titulo: "Ventas con el eje desde 96",
          categorias: ["Producto A", "Producto B"],
          valores: [100, 104],
          eje: { min: 96, max: 108, tick: 4, etiqueta: "Unidades" },
        },
      },
      {
        tipo: "estadistica.grafico",
        despuesDePaso: 7,
        titulo: "Barras: el valor, la categoría mayor, la diferencia y el total",
        grafico: {
          tipo: "barras",
          titulo: "Ventas por sucursal",
          categorias: ["Norte", "Sur", "Este", "Oeste"],
          valores: [30, 45, 20, 35],
          eje: { min: 0, max: 50, tick: 10, etiqueta: "Unidades" },
        },
      },
      {
        tipo: "estadistica.grafico",
        despuesDePaso: 8,
        titulo: "Líneas: el valor en marzo y el mayor aumento (marzo a abril)",
        grafico: {
          tipo: "lineas",
          titulo: "Visitas por mes",
          etiquetas: ["Ene", "Feb", "Mar", "Abr", "May"],
          valores: [10, 20, 25, 40, 45],
          eje: { min: 0, max: 50, tick: 10, etiqueta: "Visitas" },
        },
      },
      {
        tipo: "estadistica.grafico",
        despuesDePaso: 9,
        titulo: "Tendencia: sube y luego baja",
        grafico: {
          tipo: "lineas",
          titulo: "Pedidos por mes",
          etiquetas: ["Ene", "Feb", "Mar", "Abr", "May"],
          valores: [20, 40, 50, 30, 10],
          eje: { min: 0, max: 50, tick: 10, etiqueta: "Pedidos" },
        },
      },
      {
        tipo: "estadistica.grafico",
        despuesDePaso: 9,
        titulo: "Tendencia: se mantiene casi constante",
        grafico: {
          tipo: "lineas",
          titulo: "Temperatura al mediodía",
          etiquetas: ["Lun", "Mar", "Mié", "Jue", "Vie"],
          valores: [30, 32, 30, 33, 31],
          eje: { min: 0, max: 40, tick: 10, etiqueta: "°C" },
        },
      },
      {
        tipo: "estadistica.grafico",
        despuesDePaso: 10,
        titulo: "Histograma: total, clase modal y datos menores que 30",
        grafico: {
          tipo: "histograma",
          titulo: "Distribución de puntajes",
          limites: [0, 10, 20, 30, 40, 50],
          frecuencias: [3, 8, 12, 7, 2],
          eje: { min: 0, max: 14, tick: 2, etiqueta: "Frecuencia" },
          etiquetaX: "Puntaje",
        },
      },
    ],
    quiz: [
      {
        pregunta: "Un gráfico de barras tiene el eje vertical empezando en 45 y dos barras valen 50 y 55. ¿En qué porcentaje es realmente mayor la segunda que la primera?",
        opciones: ["100 %", "5 %", "10 %", "50 %"],
        respuesta: "10 %",
        explicacion: "La diferencia real es $\\dfrac{55 - 50}{50} = 0.1$, o sea 10 %. Visualmente las barras miden $5$ y $10$ unidades (parece $100$ % más), pero es un efecto del eje cortado.",
      },
      {
        pregunta: "En un diagrama de caja, $Q_1 = 30$ y $Q_3 = 50$. ¿A partir de qué valor un dato es atípico por arriba?",
        opciones: ["Mayor que $60$", "Mayor que $70$", "Mayor que $80$", "Mayor que $100$"],
        respuesta: "Mayor que $80$",
        explicacion: "$IQR = 50 - 30 = 20$ y la cerca superior es $50 + 1.5 \\cdot 20 = 80$.",
      },
      {
        pregunta: "En un histograma con clases $[10, 20)$, $[20, 30)$ y $[30, 40)$, ¿a qué clase pertenece el dato $20$?",
        opciones: ["A $[10, 20)$", "A ninguna", "A ambas", "A $[20, 30)$"],
        respuesta: "A $[20, 30)$",
        explicacion: "Cada clase incluye su límite inferior y no el superior: el $20$ va en $[20, 30)$.",
      },
      {
        pregunta: "Un histograma tiene las clases $[0, 10)$, $[10, 20)$ y $[20, 30)$ con frecuencias $3, 8$ y $12$. ¿Cuántos datos son menores que $20$?",
        opciones: ["$8$", "$11$", "$12$", "$23$"],
        respuesta: "$11$",
        explicacion: "Solo cuentan las clases a la izquierda del límite $20$: $3 + 8 = 11$. El $23$ es el total de datos y el $12$ es la frecuencia de la clase $[20, 30)$, que empieza en $20$.",
      },
      {
        pregunta: "Un gráfico de líneas marca $20, 35, 30, 50$ y $45$ de enero a mayo. ¿En qué tramo hubo el mayor aumento?",
        opciones: ["Entre enero y febrero", "Entre febrero y marzo", "Entre marzo y abril", "Entre abril y mayo"],
        respuesta: "Entre marzo y abril",
        explicacion: "Las diferencias entre puntos consecutivos son $+15, -5, +20, -5$: el mayor aumento es $+20$, entre marzo y abril. Entre febrero y marzo y entre abril y mayo la serie baja.",
      },
    ],
  },
];
