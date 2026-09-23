import type { TecnicaGeneralGeografia } from "./tipos";

// Las 3 Técnicas genéricas históricas de Geografía (grupo "general"),
// reescritas: antes eran solo texto + quiz (0027 y 0172), sin ninguna
// animación —a diferencia de las 20 Técnicas por continente— y con voseo
// rioplatense ("agrupalos", "Aprendé", "Fijate"), contra la convención de
// español neutro de docs/ESPECIFICACION.md. Mismos slugs y misma idea de
// cada técnica; ahora cada una trae mapas animados (geografia.mapa) con
// países reales y curados (src/lib/geografia/visualesDatos.ts). Los ejemplos
// son los mismos que ya traía cada lección (Centroamérica y Sudamérica,
// Brasil y Argentina, Italia y Chile), todos hechos geográficos conocidos.
export const TECNICAS_GENERALES_GEOGRAFIA: TecnicaGeneralGeografia[] = [
  {
    slug: "dividir-en-subregiones",
    nombre: "Divide y vencerás",
    descripcion: "Agrupar países en sub-regiones mentales es mucho más fácil que memorizarlos sueltos.",
    pasos: [
      "En vez de memorizar los países sueltos, agrúpalos en sub-regiones: Centroamérica es un bloque aparte de Sudamérica, y Europa del Este es distinta de Europa Occidental.",
      "Aprende primero dónde está cada sub-región como un bloque grande en el mapa.",
      "Recién después ubica los países dentro de cada bloque: es mucho más fácil recordar 5 países de una región que 25 sueltos.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["320", "340", "188", "591"], despuesDePaso: 1, titulo: "Centroamérica: un bloque aparte, con Guatemala, Honduras, Costa Rica y Panamá" },
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["152", "032", "858", "600"], despuesDePaso: 2, titulo: "Dentro de Sudamérica, el Cono Sur: Chile, Argentina, Uruguay y Paraguay" },
    ],
    quiz: [
      {
        pregunta: "¿Cuál es la ventaja principal de agrupar países en sub-regiones antes de memorizarlos?",
        opciones: ["Es más fácil recordar pocos bloques grandes que muchos países sueltos", "Los países cambian de nombre según la región", "Todas las regiones tienen la misma cantidad de países", "No hace falta aprender ningún país individual"],
        respuesta: "Es más fácil recordar pocos bloques grandes que muchos países sueltos",
        explicacion: "Es la idea central de la técnica: 5 países de una región se recuerdan mucho más fácil que 25 sueltos.",
      },
      {
        pregunta: "¿Cuál de estos es un ejemplo real de sub-región dentro de un continente?",
        opciones: ["Centroamérica (dentro de América)", "El hemisferio norte (dentro de la Tierra)", "El océano Pacífico (dentro de Asia)", "La capital de un país (dentro de ese país)"],
        respuesta: "Centroamérica (dentro de América)",
        explicacion: "Es el mismo ejemplo de la lección: Centroamérica es un bloque distinto de Sudamérica.",
      },
      {
        pregunta: "Según esta técnica, ¿qué conviene aprender primero?",
        opciones: ["Dónde está el bloque de la sub-región completa en el mapa", "El nombre de la capital de cada país", "La bandera de cada país", "La población exacta de cada país"],
        respuesta: "Dónde está el bloque de la sub-región completa en el mapa",
        explicacion: "Recién después de ubicar el bloque grande conviene ubicar los países de adentro, uno por uno.",
      },
    ],
  },
  {
    slug: "anclar-por-vecinos",
    nombre: "Ancla por vecinos",
    descripcion: "Usa un país que ya ubicas sin dudar como referencia para encontrar los de al lado.",
    pasos: [
      "Elige un país que ya ubiques sin dudar: tu ancla. Si ya sabes dónde está Brasil o Francia, úsalo como punto de partida.",
      "Para ubicar un país nuevo, pregúntate: ¿está al norte, sur, este u oeste de mi ancla?",
      "Cada país que aprendes bien se convierte en una nueva ancla: el mapa se arma en cadena, no de una sola vez.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["076", "032"], despuesDePaso: 1, titulo: "Con Brasil como ancla, Argentina queda al sur" },
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["032", "858", "600"], despuesDePaso: 2, titulo: "Ahora Argentina es el ancla: Uruguay y Paraguay son sus vecinos" },
    ],
    quiz: [
      {
        pregunta: "Según esta técnica, ¿qué necesitas primero para ubicar un país nuevo?",
        opciones: ["Un país que ya ubicas sin dudar, para usar de referencia", "Memorizar las coordenadas exactas", "Aprender la bandera del país nuevo", "Saber cuántos habitantes tiene"],
        respuesta: "Un país que ya ubicas sin dudar, para usar de referencia",
        explicacion: "Esa es el ancla: el punto de partida desde el que se ubica todo lo demás.",
      },
      {
        pregunta: "Si tu ancla es Brasil (que ya ubicas bien), ¿en qué dirección aproximada buscas Argentina?",
        opciones: ["Al sur", "Al norte", "Al este", "Al oeste"],
        respuesta: "Al sur",
        explicacion: "Argentina está al sur de Brasil: exactamente el tipo de pregunta que resuelve esta técnica.",
      },
      {
        pregunta: "¿Qué pasa con cada país que aprendes bien, según esta técnica?",
        opciones: ["Se convierte en una nueva ancla para ubicar otros países", "Deja de servir como referencia una vez aprendido", "Solo sirve para ubicar países del mismo continente", "Se olvida apenas aprendes uno nuevo"],
        respuesta: "Se convierte en una nueva ancla para ubicar otros países",
        explicacion: "El mapa se arma en cadena: cada país nuevo aprendido se puede usar de ancla para el siguiente.",
      },
    ],
  },
  {
    slug: "forma-caracteristica",
    nombre: "Forma característica",
    descripcion: "Reconocer un país por su silueta distintiva, antes de mirar sus fronteras exactas.",
    pasos: [
      "Fíjate en la silueta general del país antes que en los detalles de la frontera: muchos se reconocen de un vistazo.",
      "Ejemplos: Italia tiene forma de bota, y Chile es una franja larga y angosta pegada a la cordillera.",
      "Practica tapando el nombre: ¿reconoces la forma sin leer nada?",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "europa", paisesIds: ["380"], despuesDePaso: 1, titulo: "Italia: una bota que se adentra en el Mediterráneo" },
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["152"], despuesDePaso: 1, titulo: "Chile: una franja larga y angosta" },
    ],
    quiz: [
      {
        pregunta: "Según esta técnica, ¿qué conviene mirar primero para reconocer un país en el mapa?",
        opciones: ["Su silueta general, antes que los detalles de la frontera", "El color con el que está pintado en el mapa", "El tamaño exacto en kilómetros cuadrados", "El nombre escrito arriba del país"],
        respuesta: "Su silueta general, antes que los detalles de la frontera",
        explicacion: "Muchos países se reconocen de un vistazo por su forma general, sin necesidad de ver los detalles finos de la frontera.",
      },
      {
        pregunta: "¿Qué país tiene una forma característica de bota?",
        opciones: ["Italia", "Chile", "Egipto", "Japón"],
        respuesta: "Italia",
        explicacion: "Es el mismo ejemplo de la lección: la bota es la silueta más reconocible de Europa.",
      },
      {
        pregunta: "¿Qué país es una franja larga y angosta pegada a la cordillera?",
        opciones: ["Chile", "Italia", "Brasil", "México"],
        respuesta: "Chile",
        explicacion: "Es el mismo ejemplo de la lección: Chile es alargado de norte a sur y muy angosto de este a oeste.",
      },
    ],
  },
];
