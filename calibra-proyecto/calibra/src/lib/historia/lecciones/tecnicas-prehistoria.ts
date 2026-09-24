import type { TecnicaHistoria } from "./tipos";
import { A, DIST, N, NA, Q, causas, epocas, linea, preg, pregCausa, pregConsecuencia, pregEpoca, pregPrimero } from "./ayudas";

// Técnicas de la época «Prehistoria» (gratis, atajos cortos con visual y quiz):
// las cuatro anclas de época, la línea de tiempo mental, las fechas aproximadas y
// la cadena causa -> hecho -> consecuencia. Los nombres y los años salen de la
// tabla canónica (src/lib/historia/hechos.ts) por id.

const ENSENA_P1 = {
  hechos: ["escritura-cuneiforme", "batalla-de-maraton", "caida-de-roma-occidente", "llegada-de-colon", "de-revolutionibus", "toma-de-la-bastilla"],
  personajes: [],
};

const ENSENA_P2 = {
  hechos: ["herramientas-de-piedra", "uso-del-fuego", "homo-sapiens", "humanos-en-australia", "pinturas-de-lascaux", "poblamiento-de-america"],
  personajes: [],
};

const ENSENA_P3 = {
  hechos: ["fin-de-la-glaciacion", "gobekli-tepe", "inicio-de-la-agricultura", "primeros-objetos-de-cobre"],
  personajes: [],
};

const ENSENA_P4 = {
  hechos: ["fin-de-la-glaciacion", "inicio-de-la-agricultura", "escritura-cuneiforme"],
  personajes: [],
};

export const TECNICAS_HISTORIA_PREHISTORIA: TecnicaHistoria[] = [
  // ---------------------------------------------------------------- 1 (existente: 0109 + quiz de 0176)
  {
    slug: "historia-anclaje-cronologico",
    grupo: "prehistoria",
    orden: 1,
    requierePro: false,
    existente: true,
    nombre: "Anclaje cronológico: cuatro fechas que ordenan todo",
    descripcion: "Usa unas pocas fechas que ya sabes como puntos de referencia y ubica cualquier hecho por su distancia a la más cercana.",
    conceptos: { introduce: ["anclas", "epocas-historicas"], usa: [] },
    ensena: ENSENA_P1,
    pasos: [
      "Una fecha ancla es una que ya conoces bien y usas como punto de referencia. En vez de memorizar cada año suelto, ubicas el hecho nuevo por su distancia a un ancla.",
      `La historia escolar tiene cuatro anclas naturales, las que separan las cinco épocas: ${A("escritura-cuneiforme")} (la invención de la escritura), ${A("caida-de-roma-occidente")} (la caída del Imperio romano de Occidente), ${A("llegada-de-colon")} (la llegada de Colón a América) y ${A("toma-de-la-bastilla")} (la Revolución francesa).`,
      `Son convenciones, no leyes de la naturaleza: otros textos ponen el final de la Edad Media en la caída de Constantinopla (${A("caida-de-constantinopla")}) y el de la Edad Moderna en la independencia de Estados Unidos (${A("independencia-de-estados-unidos")}) o en Waterloo (${A("waterloo")}). Usa las cuatro anclas escolares, pero sabe que existen variantes.`,
      `Ejemplo: ${Q("batalla-de-maraton")} ocurrió en ${A("batalla-de-maraton")}. Es posterior a ${A("escritura-cuneiforme")} y anterior a ${A("caida-de-roma-occidente")}, así que cae en la Antigüedad. Y ${Q("de-revolutionibus")}, de ${A("de-revolutionibus")}, está solo ${DIST("de-revolutionibus", "llegada-de-colon")} años después de la llegada de Colón: pertenece a la Edad Moderna.`,
      "Para ubicar un hecho nuevo, pregúntate primero entre qué dos anclas está y después a cuál queda más cerca.",
    ],
    visuales: [
      epocas(1, "Las cuatro anclas entre las cinco épocas"),
      linea(3, "Dos ejemplos entre las anclas", ENSENA_P1.hechos),
    ],
    quiz: [
      preg(
        "¿Qué hecho marca, por convención escolar, el comienzo de la Edad Media?",
        N("caida-de-roma-occidente"),
        [N("llegada-de-colon"), N("toma-de-la-bastilla"), N("escritura-cuneiforme")],
        `Por convención escolar la Edad Media empieza con la caída del Imperio romano de Occidente (${A("caida-de-roma-occidente")}). La llegada de Colón abre la Edad Moderna, la Revolución francesa la Contemporánea y la escritura, la Antigüedad.`
      ),
      pregEpoca("batalla-de-hastings"),
      preg(
        "¿Por qué se dice que las fronteras entre épocas son convenciones?",
        "Porque las eligen los historiadores para ordenar el estudio, y otros textos usan fechas distintas",
        ["Porque esos hechos no ocurrieron de verdad", "Porque los años de esos hechos cambian cada siglo", "Porque cada país celebra su propia fecha oficial"],
        "Una convención es un acuerdo útil para ordenar el estudio. Los hechos de las anclas sí ocurrieron, pero otros libros ponen las fronteras en otras fechas."
      ),
      preg(
        `¿A cuál de estas anclas está más cerca ${Q("de-revolutionibus")}?`,
        NA("llegada-de-colon"),
        [NA("escritura-cuneiforme"), NA("caida-de-roma-occidente"), NA("toma-de-la-bastilla")],
        `${N("de-revolutionibus")} es de ${A("de-revolutionibus")}: está ${DIST("de-revolutionibus", "llegada-de-colon")} años después de la llegada de Colón y ${DIST("toma-de-la-bastilla", "de-revolutionibus")} años antes de la Revolución francesa.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 2 (existente: 0109 + quiz de 0176)
  {
    slug: "historia-linea-de-tiempo-mental",
    grupo: "prehistoria",
    orden: 2,
    requierePro: false,
    existente: true,
    nombre: "Línea de tiempo mental",
    descripcion: "Imagina los hechos como puntos de una línea que va del pasado más lejano a hoy, y recórrela en vez de recitar una lista.",
    conceptos: { introduce: ["linea-de-tiempo"], usa: [] },
    ensena: ENSENA_P2,
    pasos: [
      "Imagina una línea recta: en un extremo, el pasado más lejano; en el otro, hoy. Cada hecho nuevo es un punto que colocas en ella, cerca de los que ya conoces.",
      "Cuando te pidan ordenar varios hechos, no recites una lista: recorre la línea de un extremo al otro. Así ordenar deja de ser calcular y pasa a ser leer.",
      "Aplícalo a la Prehistoria, que es la parte más larga de la línea. Estos seis hechos ocurrieron antes de que existiera la escritura y se ordenan de izquierda a derecha, del más antiguo al más reciente.",
      "Entre el primero y el último pasan millones de años, así que la línea de la Prehistoria no puede dibujarse a escala: se recuerda el orden de los hechos, no las distancias.",
    ],
    visuales: [linea(2, "Seis hechos de la Prehistoria, en orden (sin escala)", ENSENA_P2.hechos, "orden")],
    quiz: [
      preg(
        "Según esta técnica, ¿cómo conviene imaginar los hechos de un período histórico?",
        "Como puntos ubicados en una línea, del pasado más lejano a hoy",
        ["Como una lista ordenada alfabéticamente", "Como una tabla de filas y columnas", "Como un árbol genealógico"],
        "La técnica propone una línea imaginaria: ordenar se convierte en recorrerla de un extremo al otro."
      ),
      pregPrimero("uso-del-fuego", "pinturas-de-lascaux"),
      preg(
        "¿Por qué la línea de la Prehistoria no se dibuja a escala?",
        "Porque entre los primeros hechos y los últimos pasan millones de años",
        ["Porque la Prehistoria no tiene hechos", "Porque las fechas a. C. no se pueden dibujar", "Porque la escala solo sirve para hechos con fecha exacta"],
        `Entre ${Q("herramientas-de-piedra")} (${A("herramientas-de-piedra")}) y ${Q("pinturas-de-lascaux")} (${A("pinturas-de-lascaux")}) hay más de dos millones de años: los hechos más recientes quedarían pegados unos a otros.`
      ),
      pregEpoca("pinturas-de-lascaux"),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "historia-tecnica-fechas-aproximadas",
    grupo: "prehistoria",
    orden: 3,
    requierePro: false,
    nombre: "Cuando no hay años: fechas aproximadas y «hacia»",
    descripcion: "Antes de la escritura las fechas son estimaciones: aprende a leer «hacia» y a guardar la época y el orden, no el año.",
    conceptos: { introduce: ["fechas-aproximadas"], usa: [] },
    ensena: ENSENA_P3,
    pasos: [
      "Antes de la escritura nadie anotó fechas. Los especialistas estiman la edad de los restos con métodos científicos, y el resultado es una estimación con un margen de error, no un año exacto.",
      `Por eso las fechas de la Prehistoria se escriben con «hacia»: ${Q("inicio-de-la-agricultura")} ocurrió ${A("inicio-de-la-agricultura")}. Cuanto más antiguo es un hecho, más grande es el margen: unos siglos para la agricultura, cientos de miles de años para las primeras herramientas.`,
      `Otras fechas son convencionales: la escuela las fija aunque los libros discrepen un poco. La invención de la escritura se sitúa en ${A("escritura-cuneiforme")} por convención, y esa fecha marca el final de la Prehistoria.`,
      "Regla práctica: si una fecha lleva «hacia», no la memorices como un año exacto. Guarda el orden de los hechos y la época en que ocurrieron; el año es solo un orden de magnitud.",
    ],
    visuales: [linea(1, "Cuatro hechos con fecha aproximada", ENSENA_P3.hechos)],
    quiz: [
      preg(
        "¿Qué significa «hacia 9000 a. C.»?",
        "Que ocurrió aproximadamente en ese año, con un margen de error",
        ["Que ocurrió exactamente ese año", "Que ocurrió después de ese año", "Que la fecha todavía es secreta"],
        "«Hacia» avisa de que la fecha es una estimación: el hecho ocurrió alrededor de ese año, con un margen de error."
      ),
      preg(
        "¿Por qué la fecha de la invención de la escritura se considera convencional?",
        "Porque la escuela fija un año de referencia aunque los libros discrepan un poco",
        ["Porque nadie inventó la escritura", "Porque es la única fecha exacta de la Prehistoria", "Porque cambia cada vez que se abre un libro"],
        `La escritura no apareció de un día para otro: se toma ${A("escritura-cuneiforme")} como referencia para separar la Prehistoria de la Antigüedad.`
      ),
      pregEpoca("inicio-de-la-agricultura"),
      pregPrimero("fin-de-la-glaciacion", "primeros-objetos-de-cobre"),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "historia-tecnica-causa-y-consecuencia",
    grupo: "prehistoria",
    orden: 4,
    requierePro: false,
    nombre: "Causa, hecho y consecuencia",
    descripcion: "Une los hechos con «porque» y «entonces»: qué provocó un hecho y qué provocó él.",
    conceptos: { introduce: ["causa-y-consecuencia"], usa: [] },
    ensena: ENSENA_P4,
    pasos: [
      "Un hecho rara vez ocurre solo: una causa lo empuja y él empuja una consecuencia. Buscar esa cadena ayuda a recordar el orden, porque una consecuencia nunca es anterior a su causa.",
      `Ejemplo: cuando terminó la última glaciación (${A("fin-de-la-glaciacion")}) el clima se hizo más templado y estable, y en Oriente Próximo comenzó la agricultura (${A("inicio-de-la-agricultura")}). Con alimento almacenado, las aldeas crecieron y, en Sumeria, apareció la escritura (${A("escritura-cuneiforme")}); sus primeros usos conocidos fueron llevar cuentas.`,
      "Para comprobar una cadena, léela hacia atrás con «porque» y hacia delante con «entonces». Si alguna frase no suena bien, hay un eslabón mal puesto.",
      "Cuidado: que un hecho ocurra después de otro no prueba que sea su consecuencia. Simplificación de nivel escolar: los hechos reales tienen varias causas; aquí se muestra la cadena principal.",
    ],
    visuales: [causas(1, "De la glaciación a la escritura", ENSENA_P4.hechos)],
    quiz: [
      pregConsecuencia("inicio-de-la-agricultura", "escritura-cuneiforme", ["uso-del-fuego", "pinturas-de-lascaux", "homo-sapiens"]),
      pregCausa("inicio-de-la-agricultura", "fin-de-la-glaciacion", ["escritura-cuneiforme", "unificacion-de-egipto", "piramide-de-keops"]),
      preg(
        "Si un hecho ocurre después de otro, ¿se puede afirmar que es su consecuencia?",
        "No: ocurrir después no prueba que sea consecuencia; hay que conocer la relación entre ambos",
        ["Sí, siempre", "Sí, si ocurrieron en el mismo siglo", "Solo si ocurrieron en la misma región"],
        "«Después de» no es lo mismo que «a causa de». Para hablar de causa y consecuencia hace falta una relación explicada por los historiadores."
      ),
      preg(
        "¿Cómo se comprueba una cadena de causas y consecuencias?",
        "Leyéndola hacia atrás con «porque» y hacia delante con «entonces»",
        ["Ordenando los hechos por su nombre", "Sumando los años entre los hechos", "Buscando hechos de la misma región"],
        "Si «esto ocurrió porque ocurrió lo anterior» y «entonces ocurrió lo siguiente» suenan bien, la cadena tiene sentido."
      ),
    ],
  },
];
