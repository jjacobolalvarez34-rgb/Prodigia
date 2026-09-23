import type { TecnicaQuimia } from "./tipos";
import { preg, en } from "./ayudas";

// Técnicas del grupo "tabla" (atajos gratis para leer la tabla periódica).
// Las dos primeras (agrupar-por-familia, tabla-como-mapa) ya existían
// (0056 + quiz de 0175): acá se reescriben en español neutro, con las
// precisiones químicas que faltaban y con visuales. La migración generada
// las ACTUALIZA por slug. El resto son nuevas.

export const TECNICAS_QUIMIA_TABLA: TecnicaQuimia[] = [
  {
    slug: "agrupar-por-familia",
    existente: true,
    grupo: "tabla",
    orden: 1,
    requierePro: false,
    nombre: "Agrupar por familia",
    descripcion: "En vez de memorizar elementos sueltos, agruparlos por familia química.",
    pasos: [
      "No memorices los elementos sueltos, uno por uno: agrúpalos por familia. Los metales alcalinos (Li, Na, K...), los halógenos (F, Cl, Br...) y los gases nobles (He, Ne, Ar...) son familias.",
      "Cada familia comparte comportamiento. Si sabes que el sodio (Na) es un metal alcalino muy reactivo, ya sabes algo real del litio (Li) y del potasio (K) sin memorizarlos aparte.",
      "Menos datos sueltos y más patrones que reconocer: así funciona la memoria a largo plazo.",
    ],
    visuales: [
      {
        tipo: "quimia.tabla",
        despuesDePaso: 0,
        pasos: [
          { etiqueta: "La tabla periódica reúne a los elementos en familias; aquí cada familia tiene su color." },
          { seleccion: { por: "familia", familia: "alcalino" }, etiqueta: "Metales alcalinos (Li, Na, K...): metales blandos y muy reactivos." },
          { seleccion: { por: "familia", familia: "halogeno" }, etiqueta: "Halógenos (F, Cl, Br, I...): no metales muy reactivos." },
          { seleccion: { por: "familia", familia: "gasNoble" }, etiqueta: "Gases nobles (He, Ne, Ar...): casi no reaccionan con nada." },
        ],
      },
    ],
    quiz: [
      preg(
        "¿Cuál es la ventaja principal de agrupar los elementos por familia química en vez de memorizarlos sueltos?",
        [
          "Compartir comportamiento significa que conocer uno te da información sobre los demás",
          "Todos los elementos de una familia tienen el mismo número atómico",
          "Las familias químicas cambian según el compuesto",
          "Ya no hace falta aprender ningún elemento individual",
        ],
        0,
        "Es la idea central: si el sodio es un metal alcalino reactivo, ya sabes algo real de sus parientes de familia sin memorizarlos aparte."
      ),
      preg(
        "¿Cuáles de estos tres elementos pertenecen a la misma familia (los metales alcalinos)?",
        ["Cloro, flúor y bromo", "Litio, sodio y potasio", "Helio, neón y argón", "Hierro, cobre y oro"],
        1,
        "Li, Na y K son metales alcalinos, de la columna 1 de la tabla (cloro, flúor y bromo son halógenos; helio, neón y argón son gases nobles)."
      ),
      preg(
        "Si sabes que el sodio (Na) es un metal alcalino muy reactivo, ¿qué puedes suponer del litio (Li) y del potasio (K) sin memorizarlos aparte?",
        [
          "Que también son metales alcalinos reactivos, por ser de la misma familia",
          "Que tienen el mismo número atómico que el sodio",
          "Que no reaccionan con nada",
          "Que son gases nobles",
        ],
        0,
        "Conocer una familia te da el comportamiento general de todos sus miembros: los alcalinos son metales blandos y reactivos."
      ),
      preg(
        "¿Cuál de estos conjuntos es una familia de la tabla periódica?",
        ["Sodio, cloro y hierro", "Flúor, cloro y bromo (los halógenos)", "Oxígeno, calcio y helio", "Carbono, plata y neón"],
        1,
        "Flúor, cloro y bromo son halógenos: no metales muy reactivos del grupo 17. Los otros conjuntos mezclan elementos de familias distintas."
      ),
    ],
  },
  {
    slug: "tabla-como-mapa",
    existente: true,
    grupo: "tabla",
    orden: 2,
    requierePro: false,
    nombre: "Leer la tabla como un mapa, no como una lista",
    descripcion: "Usar la posición (fila = período, columna = grupo) como coordenada para ubicar un elemento.",
    pasos: [
      "La tabla periódica no es una lista para memorizar de memoria: es un mapa con coordenadas, la fila (período) y la columna (grupo).",
      "Es el mismo truco que usas en Geografía con país y vecino: si sabes dónde está el sodio (Na, período 3, grupo 1), el magnesio (Mg) está justo al lado: período 3, grupo 2.",
      "Los elementos de una misma columna se parecen entre sí. Usa esa cercanía como pista y no memorices cada casillero suelto.",
    ],
    visuales: [
      {
        tipo: "quimia.tabla",
        despuesDePaso: 1,
        pasos: [
          { seleccion: { por: "elementos", simbolos: ["Na"] }, etiqueta: "El sodio (Na) está en el período 3 (fila 3) y en el grupo 1 (columna 1)." },
          { seleccion: { por: "elementos", simbolos: ["Na", "Mg"] }, etiqueta: "El magnesio (Mg) está justo a su derecha: período 3, grupo 2." },
          { seleccion: { por: "familia", familia: "alcalino" }, etiqueta: "En la misma columna que el sodio están el litio (Li) y el potasio (K): se comportan de forma parecida." },
        ],
      },
    ],
    quiz: [
      preg(
        "Según esta técnica, ¿qué dos coordenadas ubican a un elemento en la tabla periódica, igual que en un mapa?",
        ["Período (fila) y grupo (columna)", "Número atómico y masa atómica", "Punto de fusión y punto de ebullición", "Color y estado de la materia"],
        0,
        "Es la idea central: la tabla es un mapa con coordenadas de fila y de columna, no una lista para memorizar."
      ),
      preg(
        "Si el sodio (Na) está en el período 3, grupo 1, ¿en qué período está el magnesio (Mg), que está justo al lado?",
        ["Período 1", "Período 2", "Período 3", "Período 4"],
        2,
        "El Mg está en el período 3, grupo 2: a la derecha del Na, en la misma fila."
      ),
      preg(
        "Según esta técnica, ¿qué tienen en común los elementos de un mismo grupo (misma columna)?",
        [
          "Se parecen entre sí en su comportamiento químico",
          "Tienen el mismo número atómico",
          "Están siempre en el mismo período",
          "No tienen ninguna relación entre sí",
        ],
        0,
        "La cercanía en columna indica parecido de comportamiento: por eso no hace falta memorizar cada casillero suelto."
      ),
    ],
  },
  {
    slug: "quimia-tecnica-gases-nobles-hitos",
    grupo: "tabla",
    orden: 3,
    requierePro: false,
    nombre: "Los gases nobles como hitos",
    descripcion: "Encontrar el período y el grupo de un elemento mirando cuál gas noble tiene cerca.",
    pasos: [
      "Los gases nobles cierran cada período de la tabla. Sus números atómicos son 2 (He), 10 (Ne), 18 (Ar), 36 (Kr), 54 (Xe), 86 (Rn) y 118 (Og). Apréndelos como hitos, como los mojones de una ruta.",
      "Para hallar el período de un elemento, mira entre qué dos gases nobles cae su número atómico Z. El hierro tiene Z = 26: está después del argón (18) y antes del kriptón (36), así que es del período 4.",
      "Para los grupos principales, cuenta cuántos lugares faltan para el gas noble que sigue y réstalos de 18. El cloro (Z = 17) está a un lugar del argón (18): grupo 18 − 1 = 17. El oxígeno (Z = 8) está a dos lugares del neón (10): grupo 18 − 2 = 16.",
      "Si el elemento viene justo después de un gas noble, el grupo es cuántos lugares avanzó: el sodio (Z = 11) está un lugar después del neón (10), grupo 1; el calcio (Z = 20), dos lugares después del argón (18), grupo 2. Ojo: esta cuenta sirve para los grupos 1, 2 y 13 a 18; los metales de transición (grupos 3 a 12) quedan en el medio y no la cumplen.",
    ],
    visuales: [
      {
        tipo: "quimia.tabla",
        despuesDePaso: 1,
        pasos: [
          { seleccion: { por: "familia", familia: "gasNoble" }, etiqueta: "Los gases nobles cierran cada período: He (2), Ne (10), Ar (18), Kr (36), Xe (54), Rn (86) y Og (118)." },
          { seleccion: { por: "elementos", simbolos: ["Ar", "Fe", "Kr"] }, etiqueta: "El hierro (Fe, Z = 26) está entre el Ar (18) y el Kr (36): período 4." },
        ],
      },
      {
        tipo: "quimia.tabla",
        despuesDePaso: 2,
        pasos: [
          { seleccion: { por: "elementos", simbolos: ["Cl", "Ar"] }, etiqueta: "El cloro (Cl) está un lugar antes del argón (Ar): grupo 17, período 3." },
          { seleccion: { por: "elementos", simbolos: ["O", "Ne"] }, etiqueta: "El oxígeno (O) está dos lugares antes del neón (Ne): grupo 16, período 2." },
        ],
      },
    ],
    quiz: [
      preg("¿En qué período está el hierro (Fe), cuyo número atómico es 26?", ["Período 3", "Período 4", "Período 5", "Período 6"], 1, "El Z = 26 está entre el argón (18) y el kriptón (36): son los 18 elementos del período 4."),
      preg("¿Qué gas noble cierra el período 3?", ["Neón (Ne)", "Argón (Ar)", "Kriptón (Kr)", "Xenón (Xe)"], 1, "El período 3 va del sodio (11) al argón (18): el neón cierra el 2 y el kriptón el 4."),
      preg(
        "Un elemento del bloque p está dos lugares antes de un gas noble. ¿En qué grupo está?",
        ["Grupo 14", "Grupo 15", "Grupo 16", "Grupo 17"],
        2,
        "Al gas noble (grupo 18) se le restan los lugares que faltan: 18 − 2 = 16. Es el caso del oxígeno, dos lugares antes del neón."
      ),
      preg(
        "El cloro tiene Z = 17. ¿Cuál es su grupo y su período?",
        ["Grupo 17, período 3", "Grupo 7, período 2", "Grupo 17, período 2", "Grupo 18, período 3"],
        0,
        "Está un lugar antes del argón (18), así que es del grupo 18 − 1 = 17, y como está entre el neón (10) y el argón (18), del período 3."
      ),
    ],
  },
  {
    slug: "quimia-tecnica-escalera-metaloides",
    grupo: "tabla",
    orden: 4,
    requierePro: false,
    nombre: "La escalera de los metaloides",
    descripcion: "Distinguir metales, metaloides y no metales por su posición respecto de una escalera diagonal.",
    pasos: [
      "Imagina una escalera que baja en diagonal desde el boro (B), del lado derecho de la tabla. A la izquierda y abajo de la escalera están los metales; arriba y a la derecha, los no metales.",
      "Los metaloides están justo sobre los escalones y tienen propiedades intermedias: boro (B), silicio (Si), germanio (Ge), arsénico (As), antimonio (Sb) y telurio (Te). Son seis. Algunos libros suman el polonio y el astato.",
      "La gran mayoría de los elementos son metales: brillan, conducen bien el calor y la electricidad y son sólidos a temperatura ambiente, salvo el mercurio (Hg), que es líquido.",
      "El hidrógeno (H) es la excepción: está en la columna 1, arriba a la izquierda, pero es un no metal.",
    ],
    visuales: [
      {
        tipo: "quimia.tabla",
        despuesDePaso: 1,
        pasos: [
          { seleccion: { por: "tipo", tipo: "metaloide" }, etiqueta: "Metaloides: B, Si, Ge, As, Sb y Te, sobre los escalones de la diagonal." },
          { seleccion: { por: "tipo", tipo: "metal" }, etiqueta: "Metales: a la izquierda y abajo de la escalera (y en el centro de la tabla)." },
          { seleccion: { por: "tipo", tipo: "nometal" }, etiqueta: "No metales: arriba y a la derecha de la escalera, más el hidrógeno." },
        ],
      },
    ],
    quiz: [
      preg("¿Cuál de estos elementos es un metaloide?", ["Sodio (Na)", "Silicio (Si)", "Cloro (Cl)", "Hierro (Fe)"], 1, "El silicio está sobre la escalera de la tabla, junto con B, Ge, As, Sb y Te."),
      preg(
        "El hidrógeno está en la columna 1. ¿Es un metal?",
        ["Sí, porque está con los metales alcalinos", "No, es un no metal aunque esté en el grupo 1", "Sí, pero es líquido", "Es un metaloide"],
        1,
        "El hidrógeno es la excepción: está arriba a la izquierda, pero es un no metal (un gas a temperatura ambiente)."
      ),
      preg(
        "¿Dónde están los metales en la tabla periódica?",
        ["Arriba a la derecha", "A la izquierda y en el centro, y abajo de la escalera", "Solo en la columna 1", "Solo en la fila de abajo"],
        1,
        "Los metales son la gran mayoría: ocupan la izquierda, el centro y la parte de abajo, del lado izquierdo de la escalera."
      ),
      preg("¿Cuál de estos metales es líquido a temperatura ambiente?", ["Hierro (Fe)", "Sodio (Na)", "Mercurio (Hg)", "Cobre (Cu)"], 2, "El mercurio (Hg) es el único metal común que es líquido a 25 °C."),
    ],
  },
  {
    slug: "quimia-tecnica-electronegatividad-fluor",
    grupo: "tabla",
    orden: 5,
    requierePro: false,
    nombre: "La electronegatividad crece hacia el flúor",
    descripcion: "Comparar dos elementos sin datos: la electronegatividad aumenta hacia arriba y hacia la derecha.",
    pasos: [
      "La electronegatividad mide cuánto atrae un átomo los electrones de un enlace. La regla: crece hacia arriba y hacia la derecha de la tabla, apuntando al flúor.",
      `En un período aumenta de izquierda a derecha: en el período 2 va de ${en("Li")} (Li) a ${en("F")} (F). En un grupo aumenta de abajo hacia arriba: en los halógenos, F ${en("F")} > Cl ${en("Cl")} > Br ${en("Br")} > I ${en("I")}.`,
      `El flúor es el más electronegativo de todos (${en("F")}) y el oxígeno le sigue entre los comunes (${en("O")}). En el otro extremo están los metales de la izquierda, como el sodio (${en("Na")}) y el potasio (${en("K")}).`,
      "Para comparar dos elementos, ubícalos en la tabla: gana el que está más arriba y más a la derecha. El cloro (período 3, grupo 17) es más electronegativo que el sodio (período 3, grupo 1); el oxígeno es más que el azufre porque está arriba en el mismo grupo.",
      "Los gases nobles quedan fuera de esta regla: casi no forman enlaces y, a este nivel, no se les asigna un valor.",
    ],
    visuales: [
      {
        tipo: "quimia.tabla",
        despuesDePaso: 1,
        pasos: [
          { flecha: "derecha", etiqueta: "De izquierda a derecha en un período: la electronegatividad aumenta." },
          { flecha: "arriba", etiqueta: "De abajo hacia arriba en un grupo: la electronegatividad aumenta." },
          { seleccion: { por: "elementos", simbolos: ["F"] }, etiqueta: `Arriba a la derecha está el flúor: el más electronegativo (${en("F")}).` },
        ],
      },
    ],
    quiz: [
      preg("¿Cuál es el elemento más electronegativo de la tabla periódica?", ["Oxígeno (O)", "Cloro (Cl)", "Flúor (F)", "Francio (Fr)"], 2, "El flúor, arriba a la derecha (sin contar los gases nobles), tiene el valor más alto: 3,98."),
      preg("Entre el sodio (Na) y el cloro (Cl), ambos del período 3, ¿cuál es más electronegativo?", ["El sodio", "El cloro", "Los dos por igual", "Ninguno tiene electronegatividad"], 1, "El cloro está más a la derecha en el mismo período: 3,16 contra 0,93."),
      preg("El oxígeno y el azufre son del grupo 16. ¿Cuál es más electronegativo?", ["El azufre, porque tiene más electrones", "El oxígeno, porque está más arriba", "Los dos por igual", "Depende del compuesto"], 1, "Dentro de un grupo la electronegatividad aumenta hacia arriba: O 3,44 y S 2,58."),
      preg("Al bajar por un grupo, la electronegatividad...", ["aumenta", "disminuye", "no cambia", "se hace cero"], 1, "El átomo tiene más capas y el núcleo atrae menos a los electrones externos: en los halógenos va de 3,98 (F) a 2,66 (I)."),
    ],
  },
];
