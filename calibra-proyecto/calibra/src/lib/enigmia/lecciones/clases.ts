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

// 5 Clases NUEVAS (2026-09-22, expansión de contenido — mismo pedido del
// usuario que TECNICAS_ENIGMIA_NUEVAS: "está muy vacío"). Van en un
// arreglo APARTE de CLASES_ENIGMIA a propósito: ese arreglo genera la
// migración 0203 ya aplicada/comparada byte a byte en lecciones.test.ts —
// agregar filas ahí rompería esa comparación. Estas 5 generan la migración
// 0205 (ver sql.ts: generarSqlEnigmiaMasContenido). `orden` continúa la
// numeración de CLASES_ENIGMIA dentro de cada categoría (patrones hasta 2,
// deduccion hasta 2, memoria hasta 1, computacional hasta 1) — el sort
// real (pathClases.ts) es (categoria, orden), y las dos fuentes (0203 +
// 0205) terminan compartiendo la misma tabla en runtime.
export const CLASES_ENIGMIA_NUEVAS: ClaseEnigmia[] = [
  {
    slug: "enigmia-clase-patrones-compuestos-dos-reglas",
    categoria: "patrones",
    orden: 3,
    requierePro: true,
    nombre: "Patrones compuestos: dos reglas combinadas",
    descripcion: "Cuando una secuencia no tiene una sola regla, separa las posiciones impares de las pares — cada una puede seguir su propia regla.",
    pasos: [
      "Un patrón compuesto combina dos reglas distintas en una sola secuencia — una regla para las posiciones impares (1ª, 3ª, 5ª...) y otra para las pares (2ª, 4ª, 6ª...).",
      "Para resolverlo, separa la secuencia en dos listas: los términos de posición impar por un lado, los de posición par por otro.",
      "Encuentra el patrón de cada lista por separado (puede ser aritmético en una y geométrico en la otra) y aplícalo para hallar el término que falta.",
    ],
    visuales: [
      { tipo: "enigmia.secuencia", modo: "aritmetica", primerTermino: 1, paso: 4, cantidad: 5, despuesDePaso: 1, titulo: "Posiciones impares: secuencia aritmética +4" },
      { tipo: "enigmia.secuencia", modo: "geometrica", primerTermino: 2, paso: 3, cantidad: 4, despuesDePaso: 1, titulo: "Posiciones pares: secuencia geométrica ×3" },
      {
        tipo: "cuadros",
        despuesDePaso: 2,
        titulo: "La secuencia combinada",
        cuadros: [{ texto: "1, 2, 5, 6, 9, 18, 13, 54, ?", resaltar: "Impares: 1, 5, 9, 13, 17 (+4) — Pares: 2, 6, 18, 54 (×3)" }],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuál es el siguiente número: 1, 2, 5, 6, 9, 18, 13, 54, ?",
        opciones: ["17", "21", "162", "20"],
        respuesta: "17",
        explicacion: "La posición 9 es impar: la secuencia de posiciones impares es 1, 5, 9, 13, 17 (+4 cada vez), así que el siguiente término es 17.",
      },
      {
        pregunta: "En la secuencia de posiciones impares 1, 5, 9, 13, 17, ¿qué tipo de patrón es?",
        opciones: ["Aritmético, con diferencia constante +4", "Geométrico, con razón ×4", "Alternante entre pares e impares", "No tiene ningún patrón"],
        respuesta: "Aritmético, con diferencia constante +4",
        explicacion: "Cada término es el anterior más 4: 5−1=4, 9−5=4, 13−9=4, 17−13=4 — diferencia constante.",
      },
      {
        pregunta: "En la secuencia de posiciones pares 2, 6, 18, 54, ¿qué tipo de patrón es?",
        opciones: ["Geométrico, con razón constante ×3", "Aritmético, con diferencia +4", "Alternante", "No tiene patrón"],
        respuesta: "Geométrico, con razón constante ×3",
        explicacion: "Cada término es el anterior multiplicado por 3: 6/2=3, 18/6=3, 54/18=3 — razón constante.",
      },
      {
        pregunta: "¿Cómo se resuelve un patrón compuesto de dos reglas?",
        opciones: [
          "Separando la secuencia en posiciones impares y pares, y buscando el patrón de cada una por separado",
          "Buscando una sola regla que explique todos los términos juntos",
          "Es imposible resolverlo sin más información",
          "Promediando todos los términos",
        ],
        respuesta: "Separando la secuencia en posiciones impares y pares, y buscando el patrón de cada una por separado",
        explicacion: "Un patrón compuesto mezcla dos reglas distintas — separarlas por posición (impar/par) revela cada regla individual.",
      },
      {
        pregunta: "¿Puede una de las dos reglas ser aritmética y la otra geométrica, dentro del mismo patrón compuesto?",
        opciones: [
          "Sí, cada posición (impar o par) puede seguir un tipo de regla distinto",
          "No, las dos reglas siempre tienen que ser del mismo tipo",
          "Solo si la secuencia tiene menos de 4 términos",
          "No, un patrón compuesto siempre es aritmético",
        ],
        respuesta: "Sí, cada posición (impar o par) puede seguir un tipo de regla distinto",
        explicacion: "Es justamente el caso de este ejemplo: posiciones impares aritméticas (+4), posiciones pares geométricas (×3).",
      },
    ],
  },
  {
    slug: "enigmia-clase-deduccion-por-eliminacion",
    categoria: "deduccion",
    orden: 3,
    requierePro: true,
    nombre: "Deducción por eliminación",
    descripcion: "Cuando ninguna pista apunta directo a la respuesta, pero cada una descarta una opción, la que sobrevive a todas es la conclusión.",
    pasos: [
      "La eliminación es una forma de deducción indirecta: en vez de probar que algo ES cierto, se prueba que todas las demás opciones NO lo son.",
      "Cada pista descarta exactamente un candidato — no hace falta que ninguna pista mencione a la respuesta correcta.",
      "Si al aplicar todas las pistas queda un solo candidato sin descartar, esa es la conclusión — con la misma certeza que si una pista lo hubiera confirmado directamente.",
      "Este método funciona porque las opciones son mutuamente excluyentes: si no puede ser ninguna de las otras, tiene que ser la que queda.",
    ],
    visuales: [
      {
        tipo: "enigmia.eliminacion",
        candidatos: ["Bruno", "Elena", "Marco", "Sofía"],
        descartes: [
          { candidato: "Bruno", motivo: "no llegó tarde esa noche" },
          { candidato: "Marco", motivo: "no tiene el pelo castaño" },
          { candidato: "Sofía", motivo: "no estaba en el edificio esa noche" },
        ],
        despuesDePaso: 1,
        titulo: "¿Quién queda tras descartar a los otros tres?",
      },
    ],
    quiz: [
      {
        pregunta: "Bruno no llegó tarde. Marco no tiene el pelo castaño. Sofía no estaba en el edificio. Entre Bruno, Elena, Marco y Sofía, ¿quién queda como el único candidato posible?",
        opciones: ["Elena", "Bruno", "Marco", "Sofía"],
        respuesta: "Elena",
        explicacion: "Las tres pistas descartan a Bruno, Marco y Sofía — el único candidato que no se descarta es Elena.",
      },
      {
        pregunta: "¿Qué prueba la eliminación, a diferencia de una deducción directa?",
        opciones: [
          "Que todas las opciones excepto una NO son ciertas, en vez de probar directamente cuál SÍ lo es",
          "Que la respuesta es siempre la primera opción",
          "Que ninguna pista puede usarse dos veces",
          "Que hace falta una pista que confirme la respuesta",
        ],
        respuesta: "Que todas las opciones excepto una NO son ciertas, en vez de probar directamente cuál SÍ lo es",
        explicacion: "Es un razonamiento indirecto: se descarta todo lo que NO puede ser, y lo que sobrevive es la conclusión.",
      },
      {
        pregunta: "¿Por qué funciona la eliminación cuando las opciones son mutuamente excluyentes?",
        opciones: [
          "Porque si ninguna de las otras puede ser la respuesta, la que queda tiene que serlo",
          "Porque las opciones se pueden repetir",
          "Porque siempre hay más de una respuesta posible",
          "No funciona, hace falta una pista directa",
        ],
        respuesta: "Porque si ninguna de las otras puede ser la respuesta, la que queda tiene que serlo",
        explicacion: "Si exactamente una de las opciones es correcta, y se descartan todas menos una, esa una es forzosamente la correcta.",
      },
      {
        pregunta: "¿Hace falta que alguna pista mencione directamente al candidato correcto?",
        opciones: [
          "No, alcanza con que las pistas descarten a todos los demás",
          "Sí, siempre hace falta una pista directa",
          "Solo si hay más de 4 candidatos",
          "Solo si las pistas son ambiguas",
        ],
        respuesta: "No, alcanza con que las pistas descarten a todos los demás",
        explicacion: "La eliminación funciona incluso sin ninguna pista directa — el candidato que sobrevive a todos los descartes es la respuesta.",
      },
      {
        pregunta: "Si en el ejemplo una cuarta pista descartara también a Elena, ¿qué pasaría?",
        opciones: [
          "No quedaría ningún candidato posible — habría un error en las pistas o en la lista de candidatos",
          "La respuesta seguiría siendo Elena de todas formas",
          "Se agregaría un candidato nuevo automáticamente",
          "No cambiaría nada",
        ],
        respuesta: "No quedaría ningún candidato posible — habría un error en las pistas o en la lista de candidatos",
        explicacion: "Si se descarta a todos los candidatos, algo está mal planteado: la respuesta correcta tiene que sobrevivir a las pistas verdaderas.",
      },
    ],
  },
  {
    slug: "enigmia-clase-repeticion-espaciada-y-recuerdo-activo",
    categoria: "memoria",
    orden: 2,
    requierePro: true,
    nombre: "Repetición espaciada y recuerdo activo",
    descripcion: "Repasar un dato en intervalos cada vez más largos, y probarte a ti mismo en vez de releer, multiplica cuánto tiempo lo recuerdas.",
    pasos: [
      "La repetición espaciada consiste en repasar un dato en intervalos cada vez más largos, en vez de repasarlo todos los días seguidos.",
      "Un patrón simple es duplicar el intervalo cada vez: repasas al día 1, después al día 2, después al día 4, y así — cada repaso hace que el siguiente pueda esperar más.",
      'El recuerdo activo consiste en probarte a ti mismo ("¿qué era esto?") antes de mirar la respuesta, en vez de solo releer el material — cuesta más en el momento, pero se recuerda mejor después.',
      "Combinar las dos técnicas (espaciar los repasos y probarte activamente en cada uno) es lo que más multiplica cuánto tiempo se recuerda un dato.",
    ],
    visuales: [
      { tipo: "enigmia.secuencia", modo: "geometrica", primerTermino: 1, paso: 2, cantidad: 5, despuesDePaso: 1, titulo: "Intervalos de repaso que se duplican: día 1, 2, 4, 8, 16" },
      {
        tipo: "cuadros",
        despuesDePaso: 2,
        titulo: "Recuerdo activo vs. releer",
        cuadros: [
          { texto: "Releer: mirar el material de nuevo, de principio a fin, sin ponerte a prueba.", resaltar: "Se siente fácil, pero se recuerda poco" },
          { texto: "Recuerdo activo: taparte la respuesta e intentar recordarla antes de mirarla.", resaltar: "Cuesta más en el momento, se recuerda mucho más después" },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "Si el primer repaso es al día 1 y cada intervalo se duplica, ¿en qué día cae el quinto repaso?",
        opciones: ["16", "8", "10", "32"],
        respuesta: "16",
        explicacion: "1, 2, 4, 8, 16: cada intervalo es el doble del anterior — el quinto término de esa secuencia geométrica es 16.",
      },
      {
        pregunta: "¿Cuál es la razón constante de la secuencia de intervalos 1, 2, 4, 8, 16?",
        opciones: ["×2", "+2", "×4", "+1"],
        respuesta: "×2",
        explicacion: "Cada intervalo es el doble del anterior: 2/1=2, 4/2=2, 8/4=2, 16/8=2 — razón constante ×2.",
      },
      {
        pregunta: "¿Qué es el recuerdo activo?",
        opciones: ["Probarte a ti mismo antes de mirar la respuesta, en vez de solo releer", "Repasar el material todos los días sin excepción", "Escribir el material una sola vez", "Escuchar el material en voz alta"],
        respuesta: "Probarte a ti mismo antes de mirar la respuesta, en vez de solo releer",
        explicacion: "El recuerdo activo obliga a la mente a recuperar el dato por sí misma, lo que lo fija mucho mejor que solo releerlo.",
      },
      {
        pregunta: "¿Por qué repasar en intervalos cada vez más largos (en vez de todos los días) ayuda a recordar más tiempo?",
        opciones: [
          "Porque cada repaso exitoso demuestra que el dato ya está más fijo, y puede esperar más antes del siguiente repaso",
          "Porque repasar todos los días está prohibido",
          "Porque los intervalos largos hacen el dato más corto",
          "Porque no importa cuándo se repasa",
        ],
        respuesta: "Porque cada repaso exitoso demuestra que el dato ya está más fijo, y puede esperar más antes del siguiente repaso",
        explicacion: "Espaciar los repasos aprovecha que, cuanto mejor fijado está un dato, más tiempo tarda en olvidarse — no hace falta repasarlo todos los días.",
      },
      {
        pregunta: "¿Qué combinación multiplica más cuánto tiempo se recuerda un dato?",
        opciones: ["Espaciar los repasos Y probarte activamente en cada uno", "Solo releer todos los días", "Solo espaciar los repasos, sin probarte", "Ninguna combinación cambia nada"],
        respuesta: "Espaciar los repasos Y probarte activamente en cada uno",
        explicacion: "Las dos técnicas se refuerzan: espaciar aprovecha la curva del olvido, y el recuerdo activo fija el dato mejor en cada repaso.",
      },
    ],
  },
  {
    slug: "enigmia-clase-bucles-y-repeticion",
    categoria: "computacional",
    orden: 2,
    requierePro: true,
    nombre: "Bucles y repetición",
    descripcion: "Un bucle repite el mismo bloque de instrucciones varias veces — entender cuántas veces se repite y sobre qué valor es la clave para trazarlo bien.",
    pasos: [
      "Un bucle es una instrucción que se repite un número de veces, o hasta que se cumple una condición — en vez de escribir la misma instrucción una y otra vez, el bucle la repite por ti.",
      "Cada repetición del bucle se aplica sobre el resultado de la repetición anterior, nunca sobre el valor original con el que empezó el bucle.",
      "Para trazar un bucle a mano, simula cada repetición una por una, anotando el valor después de cada una — es exactamente lo mismo que escribir la instrucción repetida esa cantidad de veces.",
    ],
    visuales: [
      {
        tipo: "enigmia.algoritmo",
        inicial: 0,
        pasos: [
          { tipo: "sumar", valor: 2 },
          { tipo: "sumar", valor: 2 },
          { tipo: "sumar", valor: 2 },
          { tipo: "sumar", valor: 2 },
        ],
        despuesDePaso: 1,
        titulo: "x=0: bucle que repite 'x = x + 2' cuatro veces",
      },
      {
        tipo: "cuadros",
        despuesDePaso: 2,
        titulo: "Por qué el bucle no vuelve a arrancar del valor original",
        cuadros: [{ texto: "Cada vuelta del bucle parte del resultado de la vuelta anterior, no de x=0 de nuevo.", resaltar: "Por eso 4 repeticiones de +2 dan 8, no 2" }],
      },
    ],
    quiz: [
      {
        pregunta: "x=0. Un bucle repite 'x = x + 2' cuatro veces. ¿Cuánto vale x al final?",
        opciones: ["8", "2", "6", "10"],
        respuesta: "8",
        explicacion: "0+2=2, 2+2=4, 4+2=6, 6+2=8 — cuatro repeticiones de +2, cada una sobre el resultado anterior.",
      },
      {
        pregunta: "¿Cuántas veces se repitió la instrucción para llegar de 0 a 8 sumando de a 2?",
        opciones: ["4", "2", "8", "1"],
        respuesta: "4",
        explicacion: "0→2→4→6→8 son cuatro pasos de +2 — la misma cantidad que se repitió el bucle.",
      },
      {
        pregunta: "¿Sobre qué valor se aplica la segunda repetición de un bucle?",
        opciones: ["Sobre el resultado de la primera repetición", "Sobre el valor original con el que empezó el bucle", "Sobre un valor al azar", "Sobre el resultado de la última repetición"],
        respuesta: "Sobre el resultado de la primera repetición",
        explicacion: "Cada repetición encadena con la anterior — la segunda parte de donde dejó la primera, no del valor inicial.",
      },
      {
        pregunta: "¿Qué es, en esencia, un bucle?",
        opciones: [
          "Una instrucción que se repite un número de veces o hasta que se cumple una condición",
          "Una instrucción que se ejecuta una sola vez",
          "Un tipo de variable que guarda texto",
          "Una forma de saltarse pasos de un algoritmo",
        ],
        respuesta: "Una instrucción que se repite un número de veces o hasta que se cumple una condición",
        explicacion: "Esa es la definición central de un bucle: repetición controlada, ya sea por una cantidad fija o por una condición.",
      },
      {
        pregunta: "¿Por qué trazar un bucle a mano da el mismo resultado que escribir la instrucción repetida esa cantidad de veces?",
        opciones: [
          "Porque un bucle ES, en el fondo, la misma instrucción repetida esa cantidad de veces",
          "Porque son dos cosas completamente distintas",
          "Porque trazar a mano siempre da un resultado distinto",
          "Porque los bucles no se pueden trazar a mano",
        ],
        respuesta: "Porque un bucle ES, en el fondo, la misma instrucción repetida esa cantidad de veces",
        explicacion: 'Un bucle es un atajo para no repetir la instrucción a mano — trazarlo a mano es "desenrollar" ese atajo, paso por paso.',
      },
    ],
  },
  {
    slug: "enigmia-clase-depuracion-por-que-falla-un-algoritmo",
    categoria: "computacional",
    orden: 3,
    requierePro: true,
    nombre: "Depuración: por qué falla un algoritmo",
    descripcion: "Cuando un algoritmo no da el resultado esperado, el error más común no está en los pasos en sí, sino en el orden en que se ejecutan.",
    pasos: [
      'Depurar es encontrar por qué un algoritmo no da el resultado esperado — casi nunca es un paso "mal escrito", sino un paso en el orden equivocado.',
      "Para depurar, ejecuta el algoritmo paso a paso (traza a mano) y compara el valor después de cada paso con lo que esperabas — el primer paso donde se separan es donde está el error.",
      "Si los mismos pasos, en otro orden, dan el resultado esperado, el bug era el orden — no hace falta cambiar ninguna operación, solo reordenarlas.",
    ],
    visuales: [
      {
        tipo: "enigmia.algoritmo",
        inicial: 10,
        pasos: [
          { tipo: "dividir", valor: 2 },
          { tipo: "restar", valor: 4 },
        ],
        despuesDePaso: 1,
        titulo: "Algoritmo con bug: divide primero, después resta",
      },
      {
        tipo: "enigmia.algoritmo",
        inicial: 10,
        pasos: [
          { tipo: "restar", valor: 4 },
          { tipo: "dividir", valor: 2 },
        ],
        despuesDePaso: 1,
        titulo: "Algoritmo corregido: resta primero, después divide",
      },
    ],
    quiz: [
      {
        pregunta: "El resultado esperado es 3. El algoritmo (dividir entre 2, después restar 4), empezando en 10, da 1. ¿Cuál es el bug?",
        opciones: ["Los pasos están en el orden equivocado", "Falta un paso adicional", "El valor inicial está mal", "No hay ningún bug, 1 es correcto"],
        respuesta: "Los pasos están en el orden equivocado",
        explicacion: "10÷2=5, 5−4=1 (el algoritmo con bug). Restar primero y dividir después da el resultado esperado.",
      },
      {
        pregunta: "¿Cuál es el resultado del algoritmo corregido (restar 4, después dividir entre 2), empezando en 10?",
        opciones: ["3", "1", "6", "2"],
        respuesta: "3",
        explicacion: "10−4=6, 6÷2=3 — el orden corregido da el resultado esperado.",
      },
      {
        pregunta: "Al depurar un algoritmo, ¿qué paso señala dónde está el error?",
        opciones: [
          "El primer paso donde el valor trazado a mano se separa del valor esperado",
          "Siempre el último paso",
          "Siempre el primer paso, sin importar el resultado",
          "Ningún paso lo señala, hay que adivinar",
        ],
        respuesta: "El primer paso donde el valor trazado a mano se separa del valor esperado",
        explicacion: "Comparar paso a paso contra lo esperado ubica exactamente dónde empieza a desviarse — ahí está el bug.",
      },
      {
        pregunta: "Si reordenar los mismos pasos arregla el resultado, ¿qué significa eso sobre el bug?",
        opciones: [
          "El bug era el orden — no hace falta cambiar ninguna operación",
          "El bug estaba en una operación mal escrita",
          "No había ningún bug real",
          "Hay que agregar un paso nuevo",
        ],
        respuesta: "El bug era el orden — no hace falta cambiar ninguna operación",
        explicacion: "Las mismas operaciones, en otro orden, dando el resultado esperado confirman que el problema nunca fue QUÉ se hacía, sino CUÁNDO.",
      },
    ],
  },
];
