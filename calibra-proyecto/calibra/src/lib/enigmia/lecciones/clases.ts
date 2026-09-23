import type { ClaseEnigmia } from "./tipos";

// Las 6 Clases nuevas de Enigmia (2026-09-22, docs/PARIDAD_MUNDOS.md filas
// 22+23): a diferencia de las 6 Técnicas rápidas ya existentes (atajos
// puntuales — "buscar el patrón", "encontrar el intruso"...), estas
// enseñan los CONCEPTOS de razonamiento lógico desde cero, agrupadas en
// las 4 categorías reales de Enigmia (src/lib/enigmia/path.ts):
//
//   - Patrones (2): qué es una secuencia (aritmética vs. geométrica), y
//     patrones no numéricos (letras/formas/colores).
//   - Deducción (2): proposiciones/valor de verdad + "si...entonces" y su
//     contrapositiva, y silogismos simples (A→B, B→C ⟹ A→C).
//   - Memoria (1): chunking (agrupar en bloques) + asociación.
//   - Computacional (1): qué es un algoritmo, condicionales, y por qué el
//     orden de los pasos importa.
//
// Cada categoría desbloquea su propia Clase de forma independiente (mismo
// criterio que ya tiene obtenerCaminoEnigmia para las Técnicas — ver
// src/lib/enigmia/pathClases.ts); la Clase 1 (Patrones, orden más bajo del
// recorrido global) es la única preview gratis, el resto exige Pro. Todos
// los números/datos mostrados salen de src/lib/enigmia/visualesDatos.ts y
// se recalculan de forma independiente en lecciones.test.ts.
export const CLASES_ENIGMIA: ClaseEnigmia[] = [
  {
    slug: "enigmia-clase-secuencias-aritmeticas-geometricas",
    categoria: "patrones",
    orden: 1,
    requierePro: true,
    nombre: "Qué es una secuencia: diferencia constante vs. razón constante",
    descripcion: "La diferencia entre una secuencia aritmética (se suma siempre lo mismo) y una geométrica (se multiplica siempre lo mismo).",
    pasos: [
      "Una secuencia es una lista ordenada de números donde cada uno depende del anterior según una regla fija.",
      "En una secuencia aritmética, la diferencia entre un término y el anterior es siempre la misma — se suma (o resta) una cantidad constante.",
      "En una secuencia geométrica, la razón entre un término y el anterior es siempre la misma — se multiplica (o divide) por una cantidad constante.",
    ],
    visuales: [
      { tipo: "enigmia.secuencia", modo: "aritmetica", primerTermino: 3, paso: 4, cantidad: 5, despuesDePaso: 1, titulo: "Secuencia aritmética: +4 cada vez" },
      { tipo: "enigmia.secuencia", modo: "geometrica", primerTermino: 2, paso: 3, cantidad: 5, despuesDePaso: 2, titulo: "Secuencia geométrica: ×3 cada vez" },
    ],
    quiz: [
      {
        pregunta: "¿Cuál es el siguiente término de esta secuencia aritmética: 3, 7, 11, 15, ?",
        opciones: ["19", "18", "21", "17"],
        respuesta: "19",
        explicacion: "La diferencia entre términos es siempre +4 (7−3=4, 11−7=4, 15−11=4) — el siguiente es 15+4=19.",
      },
      {
        pregunta: "¿Cuál es el siguiente término de esta secuencia geométrica: 2, 6, 18, 54, ?",
        opciones: ["162", "108", "216", "150"],
        respuesta: "162",
        explicacion: "Cada término es el anterior multiplicado por 3 (razón constante) — 54×3=162.",
      },
      {
        pregunta: "¿Qué diferencia a una secuencia aritmética de una geométrica?",
        opciones: [
          "La aritmética suma siempre lo mismo; la geométrica multiplica siempre por lo mismo",
          "La aritmética siempre empieza en 0",
          "La geométrica solo funciona con números pares",
          "No hay ninguna diferencia real",
        ],
        respuesta: "La aritmética suma siempre lo mismo; la geométrica multiplica siempre por lo mismo",
        explicacion: "Esa es exactamente la diferencia: diferencia constante (suma/resta) contra razón constante (multiplicación/división).",
      },
    ],
  },
  {
    slug: "enigmia-clase-patrones-no-numericos",
    categoria: "patrones",
    orden: 2,
    requierePro: true,
    nombre: "Patrones no numéricos: letras, formas y colores",
    descripcion: "La misma lógica de las secuencias numéricas, aplicada a letras, formas o colores que se repiten con un ritmo fijo.",
    pasos: [
      "No todos los patrones son de números: también pueden ser de letras, formas o colores — la lógica para resolverlos es la misma.",
      "En un patrón de letras, cada letra puede avanzar una cantidad fija de posiciones en el alfabeto, igual que sumar un número en una secuencia.",
      "En un patrón de formas o colores, busca qué se repite y cada cuántos elementos — la mayoría son ciclos cortos que se repiten una y otra vez.",
    ],
    visuales: [
      { tipo: "enigmia.secuencia", modo: "letras", primeraLetra: "A", paso: 2, cantidad: 5, despuesDePaso: 1, titulo: "A, C, E, G, ? — avanza 2 letras cada vez" },
      {
        tipo: "cuadros",
        despuesDePaso: 2,
        titulo: "Patrones de color y de forma",
        cuadros: [
          { texto: "Rojo, Azul, Rojo, Azul, ?", resaltar: "Se repite cada 2 — sigue Rojo" },
          { texto: "△, ○, △, ○, ?", resaltar: "Mismo ciclo de 2 — sigue △" },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuál es la siguiente letra en A, C, E, G, ?",
        opciones: ["I", "H", "F", "J"],
        respuesta: "I",
        explicacion: "Cada letra avanza 2 posiciones en el alfabeto (A→C→E→G→I).",
      },
      {
        pregunta: "En el patrón Rojo, Azul, Rojo, Azul, ?, ¿qué color sigue?",
        opciones: ["Rojo", "Azul", "Verde", "Amarillo"],
        respuesta: "Rojo",
        explicacion: "El patrón alterna de a dos colores — después de Azul vuelve a aparecer Rojo.",
      },
      {
        pregunta: "Un patrón no numérico (letras, formas, colores) se resuelve...",
        opciones: [
          "Buscando qué se repite o qué salto se aplica, igual que en una secuencia numérica",
          "Solo por ensayo y error, sin ninguna regla",
          "Nunca tiene una regla fija",
          "Memorizando cada caso de memoria",
        ],
        respuesta: "Buscando qué se repite o qué salto se aplica, igual que en una secuencia numérica",
        explicacion: "Es la misma lógica que una secuencia aritmética/geométrica, aplicada a otro tipo de elemento.",
      },
    ],
  },
  {
    slug: "enigmia-clase-proposiciones-y-contrapositiva",
    categoria: "deduccion",
    orden: 1,
    requierePro: true,
    nombre: "Proposiciones, valor de verdad y la contrapositiva",
    descripcion: "Qué es una proposición, qué dice realmente un \"si...entonces\", y por qué su contrapositiva siempre vale lo mismo.",
    pasos: [
      "Una proposición es una afirmación que puede ser verdadera o falsa, nunca las dos cosas a la vez — \"llueve\" es una proposición; \"qué lindo día\" no lo es (no tiene un valor de verdad).",
      "Una afirmación \"si P entonces Q\" dice que, cada vez que se cumple P, también se cumple Q — pero que se cumpla Q no prueba que se cumplió P (podría haber otra causa).",
      "La contrapositiva de \"si P entonces Q\" es \"si no Q entonces no P\" — dice exactamente lo mismo, solo que negado y dado vuelta, y siempre tiene el mismo valor de verdad que la original.",
    ],
    visuales: [
      { tipo: "enigmia.cadena", nodos: ["Llueve", "El piso se moja"], despuesDePaso: 1, titulo: "Si llueve, entonces el piso se moja" },
      { tipo: "enigmia.cadena", nodos: ["El piso no está mojado", "No llovió"], despuesDePaso: 2, titulo: "Contrapositiva: si el piso no está mojado, entonces no llovió" },
    ],
    quiz: [
      {
        pregunta: "Si llueve, el piso se moja. El piso está mojado. ¿Llovió seguro?",
        opciones: ["No se sabe", "Sí", "No", "Siempre"],
        respuesta: "No se sabe",
        explicacion: "El piso podría estar mojado por otra causa — que se cumpla la conclusión no prueba la condición.",
      },
      {
        pregunta: "¿Cuál es la contrapositiva de \"si llueve, el piso se moja\"?",
        opciones: [
          "Si el piso no está mojado, no llovió",
          "Si no llueve, el piso no se moja",
          "Si el piso se moja, llovió",
          "Si llovió, el piso no se moja",
        ],
        respuesta: "Si el piso no está mojado, no llovió",
        explicacion: "La contrapositiva niega y da vuelta la afirmación: \"si NO la consecuencia, entonces NO la condición\".",
      },
      {
        pregunta: "Si \"si P entonces Q\" es verdadera, ¿qué pasa con su contrapositiva?",
        opciones: ["Siempre es verdadera también", "Siempre es falsa", "Depende del caso", "No tiene valor de verdad"],
        respuesta: "Siempre es verdadera también",
        explicacion: "Es una propiedad lógica: una implicación y su contrapositiva siempre comparten el mismo valor de verdad.",
      },
    ],
  },
  {
    slug: "enigmia-clase-silogismos-simples",
    categoria: "deduccion",
    orden: 2,
    requierePro: true,
    nombre: "Silogismos simples: si A→B y B→C, entonces A→C",
    descripcion: "Cómo encadenar dos afirmaciones \"si...entonces\" que comparten un término, para deducir una conclusión nueva.",
    pasos: [
      "Un silogismo encadena dos afirmaciones \"si...entonces\" que comparten un término en el medio: si A implica B, y B implica C, entonces A implica C.",
      "El truco es identificar el término que se repite en las dos premisas (B, en este caso) — ese es el que arma el puente entre A y C.",
      "La conclusión (A implica C) es válida aunque nunca se haya comprobado directamente — se deduce solo con la lógica de las dos premisas.",
    ],
    visuales: [
      {
        tipo: "enigmia.cadena",
        nodos: ["Es un perro", "Es un mamífero", "Tiene columna vertebral"],
        concluir: true,
        despuesDePaso: 1,
        titulo: "Si es perro → es mamífero, y si es mamífero → tiene columna vertebral",
      },
    ],
    quiz: [
      {
        pregunta: "Si todo perro es mamífero, y todo mamífero tiene columna vertebral, ¿qué se puede concluir sobre los perros?",
        opciones: ["Tienen columna vertebral", "No tienen columna vertebral", "Podrían no tener columna vertebral", "No se puede saber"],
        respuesta: "Tienen columna vertebral",
        explicacion: "Es la conclusión del silogismo: perro→mamífero y mamífero→columna vertebral encadenan en perro→columna vertebral.",
      },
      {
        pregunta: "Un silogismo \"si A→B y B→C, entonces A→C\" es válido porque...",
        opciones: [
          "La conclusión encadena las dos premisas por el término que comparten (B)",
          "Siempre es verdad sin importar qué sean A, B o C en la realidad",
          "Solo aplica a ejemplos con animales",
          "Hace falta comprobarlo con un ejemplo cada vez",
        ],
        respuesta: "La conclusión encadena las dos premisas por el término que comparten (B)",
        explicacion: "B es el puente: aparece como consecuencia de A y como condición de C, así que A termina llevando a C.",
      },
      {
        pregunta: "Todos los Bloops son Razzies. Todos los Razzies son Lazzies. ¿Todos los Bloops son Lazzies?",
        opciones: ["Sí", "No", "No se sabe", "Solo algunos"],
        respuesta: "Sí",
        explicacion: "Bloops→Razzies y Razzies→Lazzies encadenan en Bloops→Lazzies, mismo patrón que perro→mamífero→columna vertebral.",
      },
    ],
  },
  {
    slug: "enigmia-clase-chunking-y-asociacion",
    categoria: "memoria",
    orden: 1,
    requierePro: true,
    nombre: "Chunking y asociación: agrupar para recordar más",
    descripcion: "Dos técnicas que se combinan: partir una lista larga en bloques chicos, y ligar cada dato a algo que ya conoces.",
    pasos: [
      "Chunking es agrupar una lista larga en bloques chicos — es mucho más fácil recordar 3 bloques de 3 que 9 números sueltos.",
      "Asociación es ligar un dato nuevo a algo que ya conoces bien — una imagen o una historia fuera de lo común se recuerda mejor que un número solo.",
      "Combinar las dos técnicas (agrupar en bloques y asociar cada bloque a algo conocido) es lo que más multiplica lo que puedes recordar.",
    ],
    visuales: [
      { tipo: "enigmia.agrupacion", items: ["4", "8", "2", "9", "1", "5", "6", "3", "7"], tamanos: [3, 3, 3], despuesDePaso: 0, titulo: "482915637, agrupado en bloques de 3" },
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        titulo: "Asociación: ligar un bloque a algo conocido",
        cuadros: [
          { texto: "Para recordar el bloque 482, imagina: \"4 elefantes con 8 patas cada uno y 2 orejas gigantes\".", resaltar: "Una imagen rara se recuerda mejor que un número suelto" },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "El código 482915637 se agrupa en bloques de 3: 482 - 915 - 637. ¿Cuál es el segundo bloque?",
        opciones: ["915", "482", "637", "491"],
        respuesta: "915",
        explicacion: "Los tres bloques de 3 dígitos son 482, 915 y 637 — el segundo es 915.",
      },
      {
        pregunta: "¿Por qué ayuda el chunking (agrupar en bloques) a memorizar?",
        opciones: [
          "Porque reduce la cantidad de piezas que hay que recordar por separado",
          "Porque hace el número más corto de verdad",
          "Porque solo funciona con números pares",
          "Porque evita tener que prestar atención",
        ],
        respuesta: "Porque reduce la cantidad de piezas que hay que recordar por separado",
        explicacion: "3 bloques son menos piezas que 9 dígitos sueltos, aunque la cantidad de información sea la misma.",
      },
      {
        pregunta: "La técnica de asociación consiste en...",
        opciones: [
          "Ligar un dato nuevo a algo que ya conoces bien, para que sea más fácil de recordar",
          "Repetir el dato sin parar hasta memorizarlo",
          "Anotar el dato en un papel",
          "Ignorar el dato hasta que haga falta",
        ],
        respuesta: "Ligar un dato nuevo a algo que ya conoces bien, para que sea más fácil de recordar",
        explicacion: "Conectar lo nuevo con lo conocido (sobre todo con una imagen fuera de lo común) ayuda a que se fije en la memoria.",
      },
    ],
  },
  {
    slug: "enigmia-clase-que-es-un-algoritmo",
    categoria: "computacional",
    orden: 1,
    requierePro: true,
    nombre: "Qué es un algoritmo: pasos, condicionales y el orden",
    descripcion: "Una secuencia de pasos ordenados y repetibles, con decisiones \"si...entonces\" en el medio — y por qué el orden de los pasos importa.",
    pasos: [
      "Un algoritmo es una secuencia de pasos ordenados y repetibles que resuelve un problema — los mismos pasos, con los mismos datos de entrada, siempre dan el mismo resultado.",
      "Un condicional (\"si...entonces...si no...\") es una decisión dentro del algoritmo: según se cumpla o no una condición, se ejecuta un paso u otro.",
      "El orden de los pasos importa: ejecutar los mismos pasos en otro orden puede dar un resultado distinto — nunca asumas que da lo mismo.",
    ],
    visuales: [
      {
        tipo: "enigmia.algoritmo",
        inicial: 0,
        pasos: [
          { tipo: "sumar", valor: 5 },
          { tipo: "condicional", comparacion: ">", umbral: 3, siVerdadero: { tipo: "sumar", valor: 2 }, siFalso: { tipo: "restar", valor: 2 } },
          { tipo: "multiplicar", valor: 3 },
        ],
        despuesDePaso: 1,
        titulo: "x=0: suma 5, si x>3 suma 2 (si no, resta 2), después multiplica ×3",
      },
      {
        tipo: "enigmia.algoritmo",
        inicial: 20,
        pasos: [
          { tipo: "restar", valor: 4 },
          { tipo: "dividir", valor: 2 },
        ],
        despuesDePaso: 2,
        titulo: "Orden A — x=20: primero resta 4, después divide entre 2",
      },
      {
        tipo: "enigmia.algoritmo",
        inicial: 20,
        pasos: [
          { tipo: "dividir", valor: 2 },
          { tipo: "restar", valor: 4 },
        ],
        despuesDePaso: 2,
        titulo: "Orden B — x=20: los mismos pasos, invertidos",
      },
    ],
    quiz: [
      {
        pregunta: "x=0. Pasos: 1) x=x+5, 2) si x>3 entonces x=x+2, si no x=x−2, 3) x=x×3. ¿Cuánto vale x al final?",
        opciones: ["21", "15", "9", "7"],
        respuesta: "21",
        explicacion: "0+5=5; como 5>3, x=5+2=7; 7×3=21.",
      },
      {
        pregunta: "x=20. Orden A (restar 4, después dividir entre 2) da x final=8. Orden B (dividir entre 2, después restar 4) da x final=6. ¿Qué demuestra esto?",
        opciones: [
          "Que el orden de los pasos de un algoritmo puede cambiar el resultado final",
          "Que siempre hay que dividir primero",
          "Que restar y dividir dan siempre el mismo resultado",
          "Que el algoritmo está mal escrito",
        ],
        respuesta: "Que el orden de los pasos de un algoritmo puede cambiar el resultado final",
        explicacion: "Los mismos dos pasos, en orden distinto, dan 8 en un caso y 6 en el otro — el orden no es un detalle menor.",
      },
      {
        pregunta: "¿Qué es un algoritmo?",
        opciones: [
          "Una secuencia de pasos ordenados y repetibles para resolver un problema",
          "Una adivinanza sin reglas fijas",
          "Un tipo de acertijo de memoria",
          "Un número muy grande",
        ],
        respuesta: "Una secuencia de pasos ordenados y repetibles para resolver un problema",
        explicacion: "Esa es la definición central: pasos ordenados, repetibles, que con la misma entrada siempre dan la misma salida.",
      },
    ],
  },
];
