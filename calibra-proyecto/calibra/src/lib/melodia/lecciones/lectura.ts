import type { ClaseMelodia, TecnicaMelodia } from "./tipos";
import { q, vPentagrama, vTeclado } from "./ayudas";

// Grupo "lectura" (modo de práctica Lectura en pentagrama): nombre y octava de
// notas naturales sobre el pentagrama en clave de sol, incluidas las líneas
// adicionales. La práctica (RANGO_LECTURA_POR_BANDA) pregunta las cinco líneas
// (Mi4 Sol4 Si4 Re5 Fa5), Do4 y, según el nivel, hasta Fa3 por abajo y Do6 por
// arriba; los cuatro espacios (Fa4 La4 Do5 Mi5) y Re4 no se preguntan, pero se
// enseñan porque hacen falta para ubicar todo lo demás.

export const TECNICAS_LECTURA: TecnicaMelodia[] = [
  {
    slug: "melodia-lineas-y-espacios",
    grupo: "lectura",
    orden: 1,
    requierePro: false,
    nombre: "Lee el pentagrama por posición, no nota por nota",
    descripcion:
      "El pentagrama tiene 5 líneas y 4 espacios (se cuentan de abajo hacia arriba). En clave de sol, cada línea y cada espacio es siempre la misma nota: memoriza la posición, no cada nota suelta.",
    pasos: [
      "Las 5 líneas, de abajo hacia arriba, son: Mi, Sol, Si, Re, Fa.",
      "Los 4 espacios, de abajo hacia arriba, son: Fa, La, Do, Mi.",
      "Una vez que sabes esas 9 posiciones fijas, cualquier nota dentro del pentagrama es una de ellas: no hay que adivinar de nuevo cada vez.",
      "Las notas que quedan por encima o por debajo de las 5 líneas usan líneas adicionales cortas (ledger lines): siguen la misma lógica, solo que fuera del pentagrama.",
    ],
    visuales: [
      vPentagrama(["Mi4", "Sol4", "Si4", "Re5", "Fa5"], { despuesDePaso: 0, titulo: "Las 5 líneas, de abajo hacia arriba", etiquetas: "letra" }),
      vPentagrama(["Fa4", "La4", "Do5", "Mi5"], { despuesDePaso: 1, titulo: "Los 4 espacios, de abajo hacia arriba", etiquetas: "letra" }),
    ],
    quiz: [
      q("En clave de sol, ¿qué nota es la 3.ª línea del pentagrama (la del medio), contando desde abajo?", "Si", ["Sol", "Re", "Fa"], "Las 5 líneas de abajo hacia arriba son Mi-Sol-Si-Re-Fa: la del medio es la 3.ª, Si."),
      q("¿Cuál es la nota del espacio más bajo del pentagrama, en clave de sol?", "Fa", ["Mi", "La", "Do"], "Los 4 espacios de abajo hacia arriba son Fa-La-Do-Mi: el más bajo es Fa."),
      q("¿Qué son las «líneas adicionales» (ledger lines)?", "Líneas cortas que extienden el pentagrama para notas más agudas o más graves", ["Un tipo de alteración musical", "Las líneas que separan los compases", "Líneas que solo existen en clave de fa"], "Siguen la misma lógica de línea y espacio, solo que fuera de las cinco líneas."),
      q("¿Qué nota está en la 5.ª línea, la de arriba, en clave de sol?", "Fa", ["Mi", "Re", "Sol"], "La quinta línea de Mi-Sol-Si-Re-Fa es Fa."),
    ],
  },
  {
    slug: "melodia-truco-lineas-espacios",
    grupo: "lectura",
    orden: 2,
    requierePro: false,
    nombre: "Un truco para no olvidar las 9 posiciones",
    descripcion:
      "Arma una frase corta con esas 9 letras en orden: sirve cualquiera que te resulte fácil de recordar, no hace falta que sea una frase «oficial». Lo importante es el orden de las letras, no la frase en sí.",
    pasos: [
      "Líneas (Mi-Sol-Si-Re-Fa): prueba algo como «Mi Sobrina Siempre Repite Frases».",
      "Espacios (Fa-La-Do-Mi): prueba algo como «Fabio Lava Dos Manzanas».",
      "No son frases estándar ni las vas a encontrar en un libro: arma la tuya propia, la que más se te pegue.",
      "El objetivo es reconocer la posición de un vistazo, sin contar línea por línea cada vez.",
    ],
    visuales: [
      vPentagrama(["Mi4", "Sol4", "Si4", "Re5", "Fa5"], { despuesDePaso: 0, titulo: "Mi · Sol · Si · Re · Fa", etiquetas: "letra" }),
      vPentagrama(["Fa4", "La4", "Do5", "Mi5"], { despuesDePaso: 1, titulo: "Fa · La · Do · Mi", etiquetas: "letra" }),
    ],
    quiz: [
      q("Según esta técnica, ¿qué es lo más importante de la frase que armes?", "El orden de las letras, no la frase exacta", ["Que sea una frase oficial de un libro", "Que rime perfectamente", "Que use solo palabras musicales"], "Sirve cualquier frase fácil de recordar; lo que importa es el orden de las 9 letras."),
      q("¿Para qué sirve armar una frase con las letras de líneas y espacios?", "Para reconocer la posición de un vistazo, sin contar una por una", ["Para memorizar la letra de una canción", "Para afinar un instrumento", "Para escribir partituras más rápido"], "Es el objetivo central: reconocimiento inmediato, no conteo línea por línea."),
      q("En el ejemplo «Mi Sobrina Siempre Repite Frases», ¿qué representa cada palabra?", "Las 5 líneas: Mi-Sol-Si-Re-Fa", ["Los 4 espacios: Fa-La-Do-Mi", "Una escala de Do mayor", "Las notas de un acorde"], "Es la frase de ejemplo para las líneas: las iniciales siguen Mi-Sol-Si-Re-Fa."),
    ],
  },
  {
    slug: "melodia-notas-fuera-del-pentagrama",
    grupo: "lectura",
    orden: 3,
    requierePro: false,
    nombre: "Fuera del pentagrama: sigue la alternancia línea, espacio, línea",
    descripcion:
      "Las notas por encima y por debajo del pentagrama siguen la misma alternancia de línea y espacio. Apóyate en tres puntos fijos: Do4 en la primera línea adicional de abajo, Fa5 en la última línea y Do6 en la segunda adicional de arriba.",
    pasos: [
      "Las líneas adicionales continúan el pentagrama: línea, espacio, línea, espacio... Cada paso hacia arriba es la nota siguiente del nombre (Fa5, Sol5, La5...) y cada paso hacia abajo, la anterior.",
      "Hacia abajo: Mi4 es la línea de más abajo; el espacio debajo es Re4; en la primera línea adicional está Do4 (el Do central). Después Si3 (espacio), La3 (2.ª línea adicional), Sol3 (espacio) y Fa3 (3.ª línea adicional).",
      "Hacia arriba: Fa5 es la línea de más arriba; el espacio encima es Sol5; en la primera línea adicional está La5, luego Si5 (espacio) y Do6 (2.ª línea adicional).",
      "El número de octava sube al llegar a Do: Si3 está justo debajo de Do4, y Si5 justo debajo de Do6. Comprueba siempre en qué octava estás además del nombre.",
    ],
    visuales: [
      vPentagrama(["Do4", "Si3", "La3", "Sol3", "Fa3"], { despuesDePaso: 1, titulo: "Hacia abajo desde Do4", etiquetas: "nombre" }),
      vPentagrama(["Fa5", "Sol5", "La5", "Si5", "Do6"], { despuesDePaso: 2, titulo: "Hacia arriba desde Fa5", etiquetas: "nombre" }),
    ],
    quiz: [
      q("¿Qué nota está en la primera línea adicional por debajo del pentagrama, en clave de sol?", "Do4", ["Re4", "Si3", "La3"], "Do4, el Do central, se escribe en una línea adicional justo debajo de la línea Mi4."),
      q("¿Qué nota queda en el espacio inmediatamente encima de la línea de arriba (Fa5)?", "Sol5", ["La5", "Mi5", "Fa6"], "Después de Fa5 sigue Sol5, en el espacio de arriba."),
      q("¿Cuál está en la primera línea adicional por encima del pentagrama?", "La5", ["Sol5", "Si5", "Do6"], "Fa5 (línea), Sol5 (espacio), La5 (primera línea adicional)."),
      q("¿Qué nota está justo debajo de Do4 (en el espacio bajo la línea adicional)?", "Si3", ["Si4", "Re4", "La3"], "El número baja a 3 porque pasamos de Do a Si, la nota anterior de la octava de abajo."),
    ],
  },
];

export const CLASES_LECTURA: ClaseMelodia[] = [
  {
    slug: "melodia-clase-pentagrama-y-clave-de-sol",
    grupo: "lectura",
    orden: 1,
    requierePro: true,
    nombre: "El pentagrama y la clave de sol",
    descripcion:
      "Cómo está construido el pentagrama, qué le dice la clave de sol a cada línea y espacio y cómo leer las cinco líneas y los cuatro espacios sin contar.",
    pasos: [
      "El pentagrama es un conjunto de cinco líneas horizontales y cuatro espacios entre ellas. Líneas y espacios se numeran de abajo hacia arriba: la primera línea es la de abajo. Cada posición representa una altura distinta.",
      "Para saber qué nota es cada posición hace falta una clave. La clave de sol tiene su espiral alrededor de la segunda línea y esa línea es Sol (Sol4). A partir de ahí queda fijado todo el pentagrama.",
      "Líneas, de abajo hacia arriba: Mi4, Sol4, Si4, Re5, Fa5. Espacios: Fa4, La4, Do5, Mi5. Fíjate en que el orden alterna: línea, espacio, línea... y cada posición es la nota siguiente en la serie Do-Re-Mi-Fa-Sol-La-Si.",
      "La cabeza de la nota decide la altura: solo importa dónde está sobre las líneas. Si toca una línea es una nota de línea; si queda entre dos, de espacio. La forma (hueca, rellena, con plica) informa de la duración, no de la altura.",
      "En la Práctica se pregunta el nombre y la octava de una nota escrita: por ejemplo «Sol4». Empieza siempre por ubicar la posición (línea o espacio y cuál), después su nombre y por último su octava.",
      "Errores comunes: contar las líneas desde arriba (se cuentan de abajo hacia arriba); confundir la línea de Sol con la de Fa (la clave de sol rodea la segunda línea desde abajo); y creer que la plica cambia el nombre de la nota (no lo hace). Simplificación: existen otras claves (fa, do) que asignan otras notas; aquí solo se usa la clave de sol.",
    ],
    visuales: [
      vPentagrama(["Mi4", "Sol4", "Si4", "Re5", "Fa5"], { despuesDePaso: 2, titulo: "Las 5 líneas", etiquetas: "nombre" }),
      vPentagrama(["Fa4", "La4", "Do5", "Mi5"], { despuesDePaso: 2, titulo: "Los 4 espacios", etiquetas: "nombre" }),
    ],
    quiz: [
      q("¿En qué línea empieza la espiral de la clave de sol y qué nota es?", "En la segunda línea, Sol", ["En la primera línea, Mi", "En la tercera línea, Si", "En la quinta línea, Fa"], "La clave de sol rodea la segunda línea desde abajo: esa línea es Sol."),
      q("¿Cómo se cuentan las líneas y los espacios del pentagrama?", "De abajo hacia arriba", ["De arriba hacia abajo", "De izquierda a derecha", "Depende de la figura"], "La primera línea es la de abajo, y se sigue hacia arriba."),
      q("En clave de sol, ¿qué nota es el espacio entre la 3.ª y la 4.ª línea?", "Do5", ["Re5", "La4", "Mi5"], "Los espacios son Fa4, La4, Do5, Mi5: el tercero (entre la 3.ª y la 4.ª línea) es Do5."),
      q("¿Qué determina la altura de una nota sobre el pentagrama?", "Su posición sobre las líneas y espacios", ["Que tenga plica o no", "Que su cabeza esté rellena", "El tamaño de la cabeza"], "La posición da la altura; la forma indica la duración."),
      q("¿Qué nota es la 4.ª línea del pentagrama en clave de sol?", "Re5", ["Si4", "Fa5", "Do5"], "Líneas: Mi4, Sol4, Si4, Re5, Fa5: la cuarta es Re5."),
    ],
  },
  {
    slug: "melodia-clase-lineas-adicionales",
    grupo: "lectura",
    orden: 2,
    requierePro: true,
    nombre: "Líneas adicionales: leer más allá de las cinco líneas",
    descripcion:
      "Cómo se escriben las notas más graves y más agudas con líneas adicionales, cómo calcular su nombre desde una nota conocida y cuál es el rango que se practica (de Fa3 a Do6).",
    pasos: [
      "El pentagrama solo alcanza de Mi4 a Fa5 (y sus espacios). Para notas más graves o más agudas se añaden líneas adicionales: trazos cortos, del ancho de la nota, que prolongan el pentagrama con la misma separación entre líneas.",
      "La lógica no cambia: sigue la alternancia de línea y espacio. Cada posición hacia arriba es la nota siguiente del nombre y cada posición hacia abajo, la anterior.",
      "Hacia abajo: desde la línea Mi4 baja el espacio Re4; luego, la primera línea adicional es Do4 (el Do central). Siguen Si3 (espacio), La3 (segunda adicional), Sol3 (espacio) y Fa3 (tercera adicional).",
      "Hacia arriba: desde la línea Fa5 sube el espacio Sol5; la primera línea adicional es La5. Siguen Si5 (espacio) y Do6 (segunda adicional).",
      "Estrategia: apóyate en puntos de referencia y cuenta desde ellos. Do4 (adicional de abajo), Mi4 (primera línea), Sol4 (segunda línea), Fa5 (última línea) y La5 y Do6 (las de arriba) son buenos anclajes; el resto se cuenta de a un paso.",
      "En la Práctica el rango llega de Fa3 a Do6 en los niveles altos: los primeros niveles usan solo las líneas y Do4; luego se suman Si3 y Sol5, después La3 y La5, y así hasta Fa3 y Do6. Errores comunes: olvidar contar la línea adicional como una posición más (una línea adicional es una nota); y confundir Do4 con Do5 (Do4 queda debajo del pentagrama, en una línea adicional; Do5 es el tercer espacio, entre la 3.ª y la 4.ª línea).",
    ],
    visuales: [
      vPentagrama(["Do4", "Si3", "La3", "Sol3", "Fa3"], { despuesDePaso: 2, titulo: "Por debajo del pentagrama", etiquetas: "nombre" }),
      vPentagrama(["Fa5", "Sol5", "La5", "Si5", "Do6"], { despuesDePaso: 3, titulo: "Por encima del pentagrama", etiquetas: "nombre" }),
    ],
    quiz: [
      q("¿En qué posición se escribe Do4 (el Do central) en clave de sol?", "En la primera línea adicional por debajo del pentagrama", ["En la primera línea del pentagrama", "En el primer espacio", "En la segunda línea adicional por debajo"], "Do4 se apoya sobre una línea adicional corta justo debajo del pentagrama."),
      q("Contando hacia abajo desde Do4, ¿cuál es la nota siguiente?", "Si3", ["Re4", "Si4", "La4"], "La nota anterior a Do es Si, y como se pasa a la octava de abajo, es Si3."),
      q("¿Qué nota se escribe en la primera línea adicional por encima del pentagrama?", "La5", ["Sol5", "Si5", "Do6"], "Fa5 (línea), Sol5 (espacio), La5 (primera adicional)."),
      q("¿Qué nota está en la segunda línea adicional por encima del pentagrama?", "Do6", ["Si5", "La5", "Re6"], "La5 (1.ª adicional), Si5 (espacio), Do6 (2.ª adicional)."),
      q("¿Qué nota está en la tercera línea adicional por debajo del pentagrama?", "Fa3", ["Sol3", "La3", "Mi3"], "Do4 (1.ª), La3 (2.ª) y Fa3 (3.ª adicional), con Si3 y Sol3 en los espacios."),
    ],
  },
  {
    slug: "melodia-clase-nombre-y-octava",
    grupo: "lectura",
    orden: 3,
    requierePro: true,
    nombre: "El nombre completo de una nota: letra y octava",
    descripcion:
      "Cómo pasar de una posición en el pentagrama a un nombre con octava (Sol4, Re5, Si3...), qué papel cumple el Do y cómo se relaciona con las teclas del piano.",
    pasos: [
      "El nombre completo de una nota tiene dos partes: la letra (Do, Re, Mi...) y el número de octava. La posición en el pentagrama da las dos cosas a la vez: no basta con saber que es un Sol, hay que saber cuál Sol.",
      "Cómo saber la octava: el número sube cada vez que pasas de Si a Do. Con las notas de referencia del pentagrama: de Do4 a Si4 es la octava 4 (Do4, Re4, Mi4, Fa4, Sol4, La4, Si4); de Do5 a Si5, la 5; hacia abajo, Si3 es la última de la octava 3.",
      "Ejemplos: la segunda línea es Sol4; la línea de arriba, Fa5; el espacio entre la 3.ª y la 4.ª línea, Do5; una nota justo debajo de Do4 se llama Si3, no Si4.",
      "Para responder rápido: primero ubica la posición (línea o espacio), después la letra (con la frase de las 9 posiciones) y al final la octava (¿está por encima o por debajo de Do4? ¿cruzó un Do?).",
      "Errores comunes: dar la octava por «la más cercana» sin fijarse en Do (Si3 y Si4 están a una octava de distancia, y Si3 queda debajo de Do4); cambiar de octava en La en vez de en Do; y confundir el nombre de una nota con su posición en el teclado (una posición del pentagrama es una nota natural; las teclas negras se escriben con alteraciones).",
    ],
    visuales: [
      vPentagrama(["Sol4", "Do5", "Fa5"], { despuesDePaso: 2, titulo: "Sol4, Do5 y Fa5", etiquetas: "nombre" }),
      vPentagrama(["Si3", "Do4", "Re4"], { despuesDePaso: 2, titulo: "Si3, justo debajo de Do4", etiquetas: "nombre" }),
      vTeclado(["Si3", "Do4"], { despuesDePaso: 3, titulo: "En el teclado: Si3 y Do4 son vecinas", desde: "Sol3", hasta: "Mi4", nombres: "todas" }),
    ],
    quiz: [
      q("En clave de sol, ¿qué nota es la segunda línea desde abajo?", "Sol4", ["Sol5", "Si4", "Mi4"], "La segunda línea es Sol y está en la octava 4."),
      q("¿Qué nota escrita justo debajo de Do4 tiene el número de octava correcto?", "Si3", ["Si4", "Si5", "La4"], "El número de octava sube en Do: la nota anterior a Do4 es Si3."),
      q("¿Qué nota es la línea de más arriba del pentagrama en clave de sol?", "Fa5", ["Fa4", "Mi5", "Sol5"], "La quinta línea es Fa y está en la octava 5."),
      q("¿Cuál es el orden más útil para leer una nota del pentagrama?", "Posición, luego letra y luego octava", ["Octava, luego color, luego letra", "Letra, luego forma, luego plica", "Duración, luego letra, luego octava"], "Primero ubicas dónde está, después su letra y por último la octava."),
      q("Una nota escrita justo debajo de Do4 es una Si. ¿Por qué se llama Si3 y no Si4?", "Porque el número de octava sube en Do: Si3 es la nota anterior a Do4", ["Porque Si siempre es de la octava 3", "Porque está en una línea adicional", "Porque es una nota alterada"], "Si3 y Si4 están a una octava de distancia; la que queda pegada debajo de Do4 es Si3."),
    ],
  },
];
