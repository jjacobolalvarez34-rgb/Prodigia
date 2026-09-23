import type { TecnicaEnigmia } from "./tipos";

// 10 Técnicas NUEVAS de Enigmia (2026-09-22, expansión de contenido — el
// usuario probó las 6 Clases + 6 Técnicas históricas y dijo "está muy
// vacío": pidió más Técnicas, más Clases, más preguntas de quiz por
// lección, y animaciones para todo lo nuevo). A diferencia de las 6
// Técnicas históricas (0015/0020/0186/0204 — sin `visuales`, solo texto
// plano), estas SÍ traen `contenido.visuales` animados, mismo criterio que
// las Clases. Una Técnica es un atajo rápido y puntual (más corta que una
// Clase, sin necesidad de depender de una lección anterior) — donde el
// tema ya tiene una Clase que lo enseña a fondo, la Técnica da la versión
// rápida/atajo (ver comentario de cada categoría abajo).
//
// orden: continúa la numeración de las 6 Técnicas históricas dentro de
// cada categoría (patrones hasta 3, deduccion hasta 4, memoria hasta 5,
// computacional hasta 6 — confirmado contra 0015/0020) — el sort real
// (src/lib/enigmia/pathClases.ts) es (categoria, orden), así que solo
// importa el orden relativo DENTRO de cada categoría, nunca global.
export const TECNICAS_ENIGMIA_NUEVAS: TecnicaEnigmia[] = [
  // ---------- Patrones (3 históricas + 1 nueva = 4) ----------
  {
    slug: "enigmia-tecnica-patrones-alternantes",
    categoria: "patrones",
    orden: 4,
    requierePro: false,
    nombre: "Patrones alternantes: dos secuencias en una",
    descripcion: "Cuando una lista de números no sigue un solo patrón, prueba si en realidad son dos secuencias intercaladas.",
    pasos: [
      "Si restar términos consecutivos no da siempre lo mismo, es posible que la lista mezcle dos secuencias distintas: una en las posiciones impares y otra en las pares.",
      "Separa los términos en dos listas: los que están en la posición 1, 3, 5... por un lado, y los que están en la posición 2, 4, 6... por otro.",
      "Busca el patrón de cada lista por separado — cada una suele ser una secuencia simple (aritmética o geométrica).",
    ],
    visuales: [
      { tipo: "enigmia.secuencia", modo: "aritmetica", primerTermino: 2, paso: 3, cantidad: 5, despuesDePaso: 1, titulo: "Posiciones impares: +3 cada vez" },
      { tipo: "enigmia.secuencia", modo: "aritmetica", primerTermino: 10, paso: -2, cantidad: 4, despuesDePaso: 1, titulo: "Posiciones pares: −2 cada vez" },
      {
        tipo: "cuadros",
        despuesDePaso: 2,
        titulo: "La lista combinada",
        cuadros: [{ texto: "2, 10, 5, 8, 8, 6, 11, 4, ?", resaltar: "Impares: 2, 5, 8, 11, 14 (+3) — Pares: 10, 8, 6, 4 (−2)" }],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuál es el siguiente número: 2, 10, 5, 8, 8, 6, 11, 4, ?",
        opciones: ["14", "9", "17", "2"],
        respuesta: "14",
        explicacion: "La posición 9 es impar: la secuencia de posiciones impares es 2, 5, 8, 11, 14 (+3 cada vez), así que el siguiente término es 14.",
      },
      {
        pregunta: "En la secuencia de posiciones impares 2, 5, 8, 11, 14, ¿cuál es la diferencia constante?",
        opciones: ["+3", "+2", "+4", "−3"],
        respuesta: "+3",
        explicacion: "Cada término impar es el anterior más 3: 5−2=3, 8−5=3, 11−8=3, 14−11=3.",
      },
      {
        pregunta: "En la secuencia de posiciones pares 10, 8, 6, 4, ¿cuál es la diferencia constante?",
        opciones: ["−2", "+2", "−4", "−1"],
        respuesta: "−2",
        explicacion: "Cada término par es el anterior menos 2: 8−10=−2, 6−8=−2, 4−6=−2.",
      },
      {
        pregunta: "¿Cómo reconoces un patrón alternante?",
        opciones: [
          "La diferencia entre términos consecutivos no es constante, pero sí lo es entre términos separados de a dos",
          "Todos los términos son pares",
          "La lista tiene menos de 4 elementos",
          "Nunca se puede resolver",
        ],
        respuesta: "La diferencia entre términos consecutivos no es constante, pero sí lo es entre términos separados de a dos",
        explicacion: "Esa es la señal: separar en dos listas (impares/pares) revela dos patrones simples, aunque la lista completa no tenga un único patrón.",
      },
    ],
  },

  // ---------- Deducción (1 histórica + 3 nuevas = 4) ----------
  {
    slug: "enigmia-tecnica-silogismos-dos-premisas",
    categoria: "deduccion",
    orden: 5,
    requierePro: false,
    nombre: "Silogismos: atajo para encadenar dos premisas",
    descripcion: "Cuando dos afirmaciones comparten un término, encadénalas directo para sacar la conclusión sin pensarlo de más.",
    pasos: [
      "Busca el término que se repite en las dos premisas — ese es el puente entre la primera y la tercera idea.",
      "Encadena: si la primera lleva a ese término compartido, y ese término lleva a la tercera idea, entonces la primera lleva directo a la tercera.",
      "No hace falta verificar el ejemplo en la realidad — la conclusión es válida solo por la forma del razonamiento.",
    ],
    visuales: [
      {
        tipo: "enigmia.cadena",
        nodos: ["Todo Zimbo es Velar", "Todo Velar es Tornaz", "Todo Zimbo es Tornaz"],
        concluir: true,
        despuesDePaso: 1,
        titulo: "El término compartido (Velar) arma el puente",
      },
    ],
    quiz: [
      {
        pregunta: "Todo Zimbo es Velar. Todo Velar es Tornaz. ¿Qué se puede concluir sobre los Zimbo?",
        opciones: ["Todo Zimbo es Tornaz", "Ningún Zimbo es Tornaz", "No se puede concluir nada", "Todo Tornaz es Zimbo"],
        respuesta: "Todo Zimbo es Tornaz",
        explicacion: "Velar es el término que comparten las dos premisas — encadena Zimbo→Velar→Tornaz en Zimbo→Tornaz.",
      },
      {
        pregunta: "En un silogismo de dos premisas, ¿cuál es el término que arma el puente entre la primera y la tercera idea?",
        opciones: ["El que se repite en las dos premisas", "El primero que aparece", "El más largo de escribir", "Ninguno, no hay puente"],
        respuesta: "El que se repite en las dos premisas",
        explicacion: "Ese término compartido es el que conecta la condición de la primera premisa con la conclusión de la segunda.",
      },
      {
        pregunta: "Todos los Glimms son Fasos. Todos los Fasos son Ruxos. ¿Todos los Glimms son Ruxos?",
        opciones: ["Sí", "No", "Solo algunos", "No se sabe"],
        respuesta: "Sí",
        explicacion: "Mismo patrón: Glimms→Fasos→Ruxos encadena en Glimms→Ruxos, sin importar qué signifiquen las palabras.",
      },
      {
        pregunta: "¿Por qué la conclusión de un silogismo válido no necesita comprobarse con un ejemplo real?",
        opciones: [
          "Porque es válida solo por la estructura del razonamiento, sin importar el contenido",
          "Porque siempre habla de animales",
          "Porque las premisas nunca pueden ser falsas",
          "Porque solo aplica a dos premisas exactamente",
        ],
        respuesta: "Porque es válida solo por la estructura del razonamiento, sin importar el contenido",
        explicacion: "La validez lógica depende de la forma (A→B, B→C ⟹ A→C), no de si A, B o C existen en la realidad.",
      },
    ],
  },
  {
    slug: "enigmia-tecnica-negacion-ningun-x-es-y",
    categoria: "deduccion",
    orden: 6,
    requierePro: false,
    nombre: 'Negación: qué significa "ningún X es Y"',
    descripcion: '"Ningún X es Y" descarta a TODOS los X de ser Y — te deja concluir con certeza apenas sabes que algo es X.',
    pasos: [
      '"Ningún X es Y" es una negación total: ni un solo caso de X puede ser Y, sin excepciones.',
      "Si sabes que algo es X, ya puedes concluir con certeza que no es Y — no hace falta ningún dato extra.",
      'Es un atajo más fuerte que el "si...entonces" común: acá la conclusión negativa es automática.',
    ],
    visuales: [
      {
        tipo: "enigmia.cadena",
        nodos: ["Ningún reptil es mamífero", "Una serpiente es un reptil", "Una serpiente no es mamífero"],
        concluir: true,
        despuesDePaso: 1,
        titulo: "La negación total se transmite directo",
      },
    ],
    quiz: [
      {
        pregunta: "Ningún reptil es mamífero. Una serpiente es un reptil. ¿Una serpiente es mamífero?",
        opciones: ["No", "Sí", "Depende de la serpiente", "No se sabe"],
        respuesta: "No",
        explicacion: '"Ningún reptil es mamífero" descarta a TODOS los reptiles de ser mamíferos, sin excepciones — la serpiente, al ser reptil, queda descartada.',
      },
      {
        pregunta: '¿Qué significa exactamente "ningún X es Y"?',
        opciones: ["Que ni un solo caso de X puede ser Y", "Que la mayoría de los X no son Y", "Que algunos X podrían ser Y", "Que Y nunca existe"],
        respuesta: "Que ni un solo caso de X puede ser Y",
        explicacion: 'Es una negación total, sin excepciones — distinto de "la mayoría" o "algunos", que sí dejarían casos abiertos.',
      },
      {
        pregunta: "Ningún pájaro es reptil. Un loro es un pájaro. ¿Puede un loro ser reptil?",
        opciones: ["No", "Sí", "Solo si vuela poco", "No se sabe"],
        respuesta: "No",
        explicacion: 'Mismo patrón: la negación total de "ningún pájaro es reptil" descarta a todos los pájaros, incluido el loro.',
      },
      {
        pregunta: '¿Por qué "ningún X es Y" es un atajo más fuerte que un "si...entonces" común?',
        opciones: [
          "Porque la conclusión negativa es automática apenas se sabe que algo es X, sin datos extra",
          "Porque siempre es falso",
          "Porque solo aplica a animales",
          "Porque nunca se puede usar en deducción",
        ],
        respuesta: "Porque la conclusión negativa es automática apenas se sabe que algo es X, sin datos extra",
        explicacion: 'A diferencia de un "si...entonces" donde a veces "no se sabe", acá la negación total permite concluir con certeza inmediata.',
      },
    ],
  },
  {
    slug: "enigmia-tecnica-eliminacion-por-descarte",
    categoria: "deduccion",
    orden: 7,
    requierePro: false,
    nombre: "Eliminación por descarte",
    descripcion: "Cuando tienes varios candidatos y pistas que descartan a todos menos uno, el que queda es la respuesta.",
    pasos: [
      "Anota todos los candidatos posibles antes de mirar ninguna pista.",
      "Aplica cada pista una por una: si descarta a un candidato, táchalo — no hace falta que la pista diga directamente quién es.",
      "El candidato que queda sin tachar después de todas las pistas es la respuesta — no necesitas ninguna pista que lo confirme directamente.",
    ],
    visuales: [
      {
        tipo: "enigmia.eliminacion",
        candidatos: ["Ana", "Beto", "Caro", "Dani"],
        descartes: [
          { candidato: "Beto", motivo: "no tiene mascota" },
          { candidato: "Caro", motivo: "vive en un departamento sin patio" },
          { candidato: "Dani", motivo: "es alérgico a los animales" },
        ],
        despuesDePaso: 1,
        titulo: "¿Quién tiene un perro?",
      },
    ],
    quiz: [
      {
        pregunta: "Beto no tiene mascota. Caro vive en un departamento sin patio. Dani es alérgico a los animales. Entre Ana, Beto, Caro y Dani, ¿quién tiene un perro?",
        opciones: ["Ana", "Beto", "Caro", "Dani"],
        respuesta: "Ana",
        explicacion: "Las tres pistas descartan a Beto, Caro y Dani — el único candidato que queda es Ana.",
      },
      {
        pregunta: "En eliminación por descarte, ¿qué necesitas para llegar a una conclusión con certeza?",
        opciones: [
          "Que las pistas descarten a todos los candidatos menos uno",
          "Que una pista confirme directamente al candidato correcto",
          "Al menos 5 candidatos",
          "Que todas las pistas sean sobre la misma persona",
        ],
        respuesta: "Que las pistas descarten a todos los candidatos menos uno",
        explicacion: "No hace falta una pista que apunte directamente a la respuesta — alcanza con eliminar a todos los demás.",
      },
      {
        pregunta: "Si una pista descarta a un candidato que ya estaba descartado por otra pista, ¿qué pasa?",
        opciones: ["No cambia nada: ese candidato sigue descartado", "Se lo vuelve a incluir", "Rompe la deducción", "Hay que empezar de nuevo"],
        respuesta: "No cambia nada: ese candidato sigue descartado",
        explicacion: "Descartar dos veces al mismo candidato no lo reincorpora — el resultado final es el mismo.",
      },
      {
        pregunta: "¿Por qué el candidato que queda sin tachar es la respuesta, aunque ninguna pista lo mencione directamente?",
        opciones: [
          "Porque si se descartaron todos los demás, no queda otra opción posible",
          "Porque siempre es el primero de la lista",
          "Porque las pistas lo confirman en secreto",
          "No es la respuesta, hace falta una pista directa",
        ],
        respuesta: "Porque si se descartaron todos los demás, no queda otra opción posible",
        explicacion: "Es la misma lógica que resolver un caso: al eliminar todas las alternativas salvo una, esa una tiene que ser la correcta.",
      },
    ],
  },

  // ---------- Memoria (1 histórica + 3 nuevas = 4) ----------
  {
    slug: "enigmia-tecnica-metodo-de-loci",
    categoria: "memoria",
    orden: 6,
    requierePro: false,
    nombre: "Método de loci: memorizar con un recorrido",
    descripcion: "Asocia cada dato que quieres recordar a un lugar de un recorrido que ya conoces de memoria — después solo recorres el camino mentalmente.",
    pasos: [
      "Elige un recorrido que conozcas bien de memoria (tu casa, tu camino a la escuela) y divídelo en lugares fijos, siempre en el mismo orden.",
      "Asocia cada dato de la lista a un lugar del recorrido, en orden — el primer dato al primer lugar, el segundo al segundo, y así.",
      "Para recordar la lista completa, camina el recorrido mentalmente en el mismo orden: cada lugar te devuelve el dato asociado.",
    ],
    visuales: [
      {
        tipo: "enigmia.loci",
        lugares: ["Puerta", "Living", "Cocina", "Dormitorio"],
        items: ["Leche", "Huevos", "Pan", "Manzanas"],
        despuesDePaso: 1,
        titulo: "Lista de compras asociada a un recorrido por la casa",
      },
    ],
    quiz: [
      {
        pregunta: "En el recorrido Puerta→Living→Cocina→Dormitorio asociado a Leche, Huevos, Pan, Manzanas, ¿qué elemento está en la Cocina?",
        opciones: ["Pan", "Leche", "Huevos", "Manzanas"],
        respuesta: "Pan",
        explicacion: "El tercer lugar (Cocina) está asociado al tercer elemento de la lista (Pan), en el mismo orden del recorrido.",
      },
      {
        pregunta: "¿Qué característica necesita el recorrido elegido para el método de loci?",
        opciones: ["Que ya lo conozcas de memoria, en un orden fijo", "Que tenga exactamente 10 lugares", "Que sea un lugar que nunca visitaste", "Que cambie de orden cada vez"],
        respuesta: "Que ya lo conozcas de memoria, en un orden fijo",
        explicacion: "El recorrido es solo el andamio — si ya lo sabes de memoria, no tienes que esforzarte en recordar el orden, solo las asociaciones.",
      },
      {
        pregunta: "¿Qué elemento está asociado al Dormitorio en el ejemplo?",
        opciones: ["Manzanas", "Leche", "Pan", "Huevos"],
        respuesta: "Manzanas",
        explicacion: "El cuarto lugar (Dormitorio) corresponde al cuarto elemento de la lista (Manzanas).",
      },
      {
        pregunta: "Para recuperar la lista completa con el método de loci, ¿qué tienes que hacer?",
        opciones: [
          "Recorrer los lugares en el mismo orden en que asociaste cada dato",
          "Recordar los lugares al azar",
          "Memorizar la lista de nuevo desde cero",
          "Dibujar un mapa nuevo cada vez",
        ],
        respuesta: "Recorrer los lugares en el mismo orden en que asociaste cada dato",
        explicacion: "Cada lugar del recorrido, en orden, te devuelve el dato que le asociaste — por eso el orden del recorrido importa.",
      },
    ],
  },
  {
    slug: "enigmia-tecnica-agrupar-por-categoria",
    categoria: "memoria",
    orden: 7,
    requierePro: false,
    nombre: "Agrupar por categoría antes de memorizar",
    descripcion: "Antes de agrupar una lista en bloques por tamaño, ordénala por categoría — cada grupo se vuelve mucho más fácil de recordar.",
    pasos: [
      "Antes de partir la lista en bloques, revisa si los elementos se pueden agrupar por una categoría en común (frutas, animales, colores).",
      "Ordena la lista para que los elementos de la misma categoría queden juntos, y arma un bloque por categoría.",
      'Cada bloque se vuelve una sola idea ("frutas", "animales", "colores") en vez de varios elementos sueltos, así que hay menos piezas que recordar.',
    ],
    visuales: [
      {
        tipo: "enigmia.agrupacion",
        items: ["Manzana", "Pera", "Uva", "Perro", "Gato", "León", "Rojo", "Azul", "Verde"],
        tamanos: [3, 3, 3],
        despuesDePaso: 1,
        titulo: "9 elementos agrupados en 3 categorías",
      },
    ],
    quiz: [
      {
        pregunta: "Manzana, Pera, Uva, Perro, Gato, León, Rojo, Azul, Verde — agrupados por categoría en bloques de 3, ¿cuál es el segundo bloque?",
        opciones: ["Perro, Gato, León", "Manzana, Pera, Uva", "Rojo, Azul, Verde", "Pera, Perro, Rojo"],
        respuesta: "Perro, Gato, León",
        explicacion: "Los tres bloques son Manzana/Pera/Uva (frutas), Perro/Gato/León (animales) y Rojo/Azul/Verde (colores) — el segundo es el de animales.",
      },
      {
        pregunta: "¿Por qué agrupar por categoría (en vez de solo por tamaño fijo) ayuda más a memorizar?",
        opciones: [
          "Porque cada grupo se vuelve una sola idea reconocible, en vez de elementos sueltos sin relación",
          "Porque hace la lista más corta de verdad",
          "Porque solo funciona con 9 elementos exactos",
          "Porque evita tener que agrupar del todo",
        ],
        respuesta: "Porque cada grupo se vuelve una sola idea reconocible, en vez de elementos sueltos sin relación",
        explicacion: 'Un grupo con sentido ("las frutas") pesa menos en la memoria que tres elementos sin ninguna relación entre sí.',
      },
      {
        pregunta: "¿Cuál es el tercer bloque de la lista de arriba?",
        opciones: ["Rojo, Azul, Verde", "Manzana, Pera, Uva", "Perro, Gato, León", "León, Verde, Uva"],
        respuesta: "Rojo, Azul, Verde",
        explicacion: "El tercer bloque, después de frutas y animales, es el de los colores: Rojo, Azul, Verde.",
      },
      {
        pregunta: "Si una lista no tiene ninguna categoría natural en común, ¿qué conviene hacer?",
        opciones: [
          "Agrupar por tamaño fijo (chunking simple), como en la técnica de memoria básica",
          "Es imposible memorizarla",
          "Memorizarla letra por letra sin agrupar",
          "Descartar la técnica de memoria por completo",
        ],
        respuesta: "Agrupar por tamaño fijo (chunking simple), como en la técnica de memoria básica",
        explicacion: "Agrupar por categoría es una mejora cuando hay categorías reales — si no las hay, el chunking por tamaño fijo sigue funcionando.",
      },
    ],
  },
  {
    slug: "enigmia-tecnica-visualizar-en-vez-de-repetir",
    categoria: "memoria",
    orden: 8,
    requierePro: false,
    nombre: "Visualizar en vez de repetir",
    descripcion: "Una imagen mental vívida y fuera de lo común se recuerda mejor que repetir un dato una y otra vez sin pensarlo.",
    pasos: [
      'Repetir un dato sin pensarlo ("la llave está bajo la maceta", una y otra vez) ayuda poco: la mente no le presta atención real.',
      "En cambio, arma una imagen mental exagerada o fuera de lo común del dato — cuanto más rara o divertida, mejor se fija.",
      "No hace falta que la imagen tenga sentido lógico: el objetivo es que sea memorable, no realista.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        titulo: "Dos formas de recordar el mismo dato",
        cuadros: [
          { texto: 'Estrategia A: repetir "la llave está bajo la maceta" veinte veces seguidas, sin imaginar nada.', resaltar: "Repetición sin imagen: se olvida rápido" },
          {
            texto: "Estrategia B: imaginar una maceta gigante que se abre de golpe y escupe una llave dorada brillante por el aire.",
            resaltar: "Imagen vívida y fuera de lo común: se recuerda mucho más tiempo",
          },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "Según esta técnica, ¿qué se recuerda mejor?",
        opciones: ["Una imagen mental vívida y fuera de lo común", "Repetir el dato muchas veces sin pensarlo", "Escribir el dato en un papel y guardarlo", "Ignorar el dato hasta necesitarlo"],
        respuesta: "Una imagen mental vívida y fuera de lo común",
        explicacion: "Una imagen exagerada o rara capta más atención real que la repetición mecánica, y por eso se fija mejor en la memoria.",
      },
      {
        pregunta: "¿Por qué repetir un dato sin pensarlo ayuda poco a memorizarlo?",
        opciones: [
          "Porque la mente no le presta atención real, solo repite sonidos",
          "Porque repetir está prohibido",
          "Porque hace falta repetirlo al revés",
          "Porque solo funciona con números",
        ],
        respuesta: "Porque la mente no le presta atención real, solo repite sonidos",
        explicacion: "La repetición mecánica no obliga a procesar el significado del dato, así que se olvida casi igual de rápido que si no se hubiera repetido.",
      },
      {
        pregunta: "¿Necesita tener sentido lógico la imagen mental que se usa para memorizar?",
        opciones: ["No, el objetivo es que sea memorable, no realista", "Sí, siempre tiene que ser realista", "Solo si el dato es un número", "Solo si hay tiempo de sobra"],
        respuesta: "No, el objetivo es que sea memorable, no realista",
        explicacion: "Una imagen absurda o exagerada (una maceta gigante que escupe una llave) se recuerda mejor que una imagen realista y aburrida.",
      },
      {
        pregunta: '¿Cuál de estas imágenes ayudaría MÁS a recordar "la llave está bajo la maceta"?',
        opciones: [
          "Una maceta gigante que se abre de golpe y escupe una llave dorada por el aire",
          "Repetir la frase en voz baja",
          "Una maceta común, sin nada especial",
          "No pensar en la maceta",
        ],
        respuesta: "Una maceta gigante que se abre de golpe y escupe una llave dorada por el aire",
        explicacion: "Es la imagen exagerada y fuera de lo común — la misma lógica que hace que las imágenes vívidas se recuerden más que la repetición.",
      },
    ],
  },

  // ---------- Pensamiento computacional (1 histórica + 3 nuevas = 4) ----------
  {
    slug: "enigmia-tecnica-trazar-un-bucle-a-mano",
    categoria: "computacional",
    orden: 7,
    requierePro: false,
    nombre: "Trazar un bucle a mano",
    descripcion: "Un bucle repite la misma instrucción varias veces — para seguirlo a mano, aplica la instrucción una vez por cada repetición, en orden.",
    pasos: [
      'Un bucle dice "repite esta instrucción N veces" — para trazarlo a mano, escribe la instrucción tantas veces como se repite, una debajo de la otra.',
      "Aplica cada repetición sobre el resultado de la anterior, nunca sobre el valor original.",
      "El valor después de la última repetición es el resultado final del bucle.",
    ],
    visuales: [
      {
        tipo: "enigmia.algoritmo",
        inicial: 1,
        pasos: [
          { tipo: "multiplicar", valor: 2 },
          { tipo: "multiplicar", valor: 2 },
          { tipo: "multiplicar", valor: 2 },
        ],
        despuesDePaso: 1,
        titulo: "x=1: repite 'x = x × 2' tres veces",
      },
    ],
    quiz: [
      {
        pregunta: 'x=1. Repites tres veces la instrucción "x = x × 2". ¿Cuánto vale x al final?',
        opciones: ["8", "6", "4", "2"],
        respuesta: "8",
        explicacion: "1×2=2, 2×2=4, 4×2=8 — cada repetición se aplica sobre el resultado de la anterior.",
      },
      {
        pregunta: "¿Sobre qué valor se aplica cada repetición de un bucle?",
        opciones: ["Sobre el resultado de la repetición anterior", "Siempre sobre el valor original", "Sobre un valor al azar", "Sobre el valor final, antes de empezar"],
        respuesta: "Sobre el resultado de la repetición anterior",
        explicacion: "Un bucle encadena repeticiones: cada una parte de donde dejó la anterior, no del valor inicial.",
      },
      {
        pregunta: 'x=2. Repites cuatro veces la instrucción "x = x + 3". ¿Cuánto vale x al final?',
        opciones: ["14", "12", "10", "17"],
        respuesta: "14",
        explicacion: "2+3=5, 5+3=8, 8+3=11, 11+3=14 — cuatro repeticiones de +3 sobre el resultado anterior.",
      },
      {
        pregunta: '¿Cómo se traza un bucle "a mano" (sin ejecutarlo en una computadora)?',
        opciones: [
          "Escribiendo la instrucción una vez por cada repetición y aplicándola en orden",
          "Aplicando la instrucción una sola vez, sin importar cuántas repeticiones diga",
          "Adivinando el resultado final",
          "Solo es posible con una computadora",
        ],
        respuesta: "Escribiendo la instrucción una vez por cada repetición y aplicándola en orden",
        explicacion: "Trazar a mano es simular el bucle paso a paso: tantos pasos como repeticiones, cada uno sobre el resultado anterior.",
      },
    ],
  },
  {
    slug: "enigmia-tecnica-condicion-de-corte",
    categoria: "computacional",
    orden: 8,
    requierePro: false,
    nombre: "Identificar la condición de corte",
    descripcion: "Un bucle necesita una condición que, tarde o temprano, deje de cumplirse — si nunca deja de cumplirse, el bucle no para.",
    pasos: [
      "La condición de corte es la pregunta que el bucle revisa en cada repetición para decidir si sigue o se detiene.",
      "Mientras la condición se cumpla, el bucle sigue repitiendo; apenas deja de cumplirse, se detiene.",
      "Si la condición nunca deja de cumplirse (por ejemplo, si el valor nunca cambia en la dirección correcta), el bucle no se detiene nunca.",
    ],
    visuales: [
      {
        tipo: "enigmia.algoritmo",
        inicial: 1,
        pasos: [
          { tipo: "condicional", comparacion: "<", umbral: 10, siVerdadero: { tipo: "sumar", valor: 3 }, siFalso: { tipo: "restar", valor: 0 } },
          { tipo: "condicional", comparacion: "<", umbral: 10, siVerdadero: { tipo: "sumar", valor: 3 }, siFalso: { tipo: "restar", valor: 0 } },
          { tipo: "condicional", comparacion: "<", umbral: 10, siVerdadero: { tipo: "sumar", valor: 3 }, siFalso: { tipo: "restar", valor: 0 } },
          { tipo: "condicional", comparacion: "<", umbral: 10, siVerdadero: { tipo: "sumar", valor: 3 }, siFalso: { tipo: "restar", valor: 0 } },
        ],
        despuesDePaso: 1,
        titulo: "x=1, mientras x<10 suma 3 — ¿en qué paso se detiene?",
      },
    ],
    quiz: [
      {
        pregunta: "x=1. En cada paso, si x<10 se suma 3; si no, x no cambia. ¿En qué paso deja de cumplirse la condición x<10 por primera vez?",
        opciones: ["El cuarto paso", "El segundo paso", "El tercer paso", "Nunca deja de cumplirse"],
        respuesta: "El cuarto paso",
        explicacion: "1→4→7→10: recién en el cuarto paso x vale 10, que ya no es menor que 10 — ahí la condición deja de cumplirse.",
      },
      {
        pregunta: "En el ejemplo anterior (x=1, +3 mientras x<10), ¿cuál es el valor final de x?",
        opciones: ["10", "13", "7", "4"],
        respuesta: "10",
        explicacion: "1+3=4, 4+3=7, 7+3=10; en el cuarto paso la condición ya no se cumple y x se queda en 10.",
      },
      {
        pregunta: "¿Qué es una condición de corte en un bucle?",
        opciones: ["La condición que el bucle revisa cada vez para decidir si sigue o se detiene", "El primer paso del bucle, siempre", "Un error que hay que evitar por completo", "Un tipo de variable"],
        respuesta: "La condición que el bucle revisa cada vez para decidir si sigue o se detiene",
        explicacion: 'Es la pregunta que se repite en cada vuelta del bucle — mientras la respuesta sea "sí", el bucle sigue.',
      },
      {
        pregunta: "¿Qué pasa si la condición de corte de un bucle nunca deja de cumplirse?",
        opciones: ["El bucle no se detiene nunca", "El bucle se detiene después de una vuelta", "El bucle da un error de sintaxis", "No pasa nada distinto"],
        respuesta: "El bucle no se detiene nunca",
        explicacion: "Sin una condición que eventualmente falle, no hay ninguna señal para que el bucle pare — sigue repitiendo para siempre.",
      },
    ],
  },
  {
    slug: "enigmia-tecnica-simplificar-antes-de-ejecutar",
    categoria: "computacional",
    orden: 9,
    requierePro: false,
    nombre: "Simplificar antes de ejecutar",
    descripcion: "Antes de trazar un algoritmo paso a paso, revisa si se puede simplificar en menos pasos con el mismo resultado — ahorra tiempo y errores.",
    pasos: [
      "Antes de ejecutar un algoritmo paso a paso, revisa si varias instrucciones seguidas se pueden combinar en una sola.",
      "Por ejemplo, sumar el mismo número varias veces seguidas es lo mismo que sumar una sola vez el total de esas sumas.",
      "Simplificar no cambia el resultado final — solo reduce la cantidad de pasos, así que hay menos lugares donde cometer un error.",
    ],
    visuales: [
      {
        tipo: "enigmia.algoritmo",
        inicial: 0,
        pasos: [
          { tipo: "sumar", valor: 5 },
          { tipo: "sumar", valor: 5 },
          { tipo: "sumar", valor: 5 },
        ],
        despuesDePaso: 1,
        titulo: "Sin simplificar: sumar 5 tres veces",
      },
      { tipo: "enigmia.algoritmo", inicial: 0, pasos: [{ tipo: "sumar", valor: 15 }], despuesDePaso: 1, titulo: "Simplificado: sumar 15 una sola vez" },
    ],
    quiz: [
      {
        pregunta: "Empezando en 0, ¿cuánto da sumar 5 tres veces seguidas?",
        opciones: ["15", "10", "20", "5"],
        respuesta: "15",
        explicacion: "0+5=5, 5+5=10, 10+5=15 — el resultado final es 15.",
      },
      {
        pregunta: "¿Qué algoritmo llega al mismo resultado con menos pasos, empezando en 0: sumar 5 tres veces, o sumar 15 una vez?",
        opciones: [
          "Los dos dan 15, pero sumar 15 una vez usa menos pasos",
          "Solo sumar 5 tres veces da 15",
          "Sumar 15 una vez da un resultado distinto",
          "Ninguno de los dos llega a 15",
        ],
        respuesta: "Los dos dan 15, pero sumar 15 una vez usa menos pasos",
        explicacion: "Sumar 5 tres veces (0→5→10→15) y sumar 15 una vez (0→15) dan el mismo resultado final, pero el segundo usa un solo paso.",
      },
      {
        pregunta: "¿Qué gana simplificar un algoritmo antes de ejecutarlo?",
        opciones: [
          "Menos pasos, y por lo tanto menos lugares donde cometer un error",
          "Un resultado distinto, más preciso",
          "Nada, el resultado siempre cambia",
          "Solo sirve para algoritmos con números negativos",
        ],
        respuesta: "Menos pasos, y por lo tanto menos lugares donde cometer un error",
        explicacion: "Simplificar no cambia el resultado — reduce la cantidad de pasos, y cada paso de menos es una oportunidad de error de menos.",
      },
      {
        pregunta: "Sumar 4 el mismo número cuatro veces seguidas, empezando en 0, ¿a qué paso simplificado equivale?",
        opciones: ["Sumar 16 una sola vez", "Sumar 4 una sola vez", "Sumar 8 dos veces", "Restar 16 una vez"],
        respuesta: "Sumar 16 una sola vez",
        explicacion: "Sumar 4 cuatro veces seguidas (0→4→8→12→16) da el mismo resultado que sumar 16 de una sola vez (4×4=16).",
      },
    ],
  },
];
