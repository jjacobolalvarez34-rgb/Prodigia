import type { ClaseGeografia } from "./tipos";

// 16 Clases nuevas de Geografía (4 por continente, una por cada
// sub-región curada en src/lib/geografia/subregiones.ts — ver la nota de
// alcance ahí: solo los países "ancla" de cada sub-región tienen un
// id→sub-región formal, no los 153 de PAISES_POR_CONTINENTE). Curso
// progresivo real (retrofit Técnicas | Clases por continente, ver
// docs/PARIDAD_MUNDOS.md fila 1 y fila 22/23): cada Clase enseña desde
// cero dónde queda esa sub-región dentro del continente, qué países la
// forman y un rasgo distintivo, con quiz de identificación. requierePro:
// true; la primera Clase de cada continente (orden 1) es preview gratis —
// ver src/lib/geografia/path.ts.
export const CLASES_GEOGRAFIA: ClaseGeografia[] = [
  // ---------------- América ----------------
  {
    slug: "geografia-clase-cono-sur",
    continente: "america",
    orden: 1,
    requierePro: true,
    nombre: "Cono Sur: Argentina, Chile, Uruguay y Paraguay",
    descripcion: "El bloque más al sur de Sudamérica: 4 países con climas templados, muy distintos entre sí en forma y tamaño.",
    pasos: [
      "El Cono Sur es el bloque de países ubicado en el extremo sur de Sudamérica, donde el continente se angosta.",
      "Lo forman 4 países: Argentina (el más grande de los 4, con grandes llanuras — las pampas), Chile (una franja angosta pegada a los Andes), Uruguay (chico, entre Argentina y Brasil) y Paraguay (sin salida al mar).",
      "Un rasgo distintivo del grupo: de los 4, solo Paraguay no tiene costa oceánica — está completamente rodeado de tierra.",
      "Practicar identificando estos 4 países en el mapa antes de avanzar a la Región Andina, más al norte.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["032", "152", "858", "600"], despuesDePaso: 2, titulo: "Cono Sur: Argentina, Chile, Uruguay y Paraguay" },
    ],
    quiz: [
      {
        pregunta: "¿Qué 4 países forman el Cono Sur?",
        opciones: ["Argentina, Chile, Uruguay y Paraguay", "Argentina, Brasil, Chile y Perú", "Chile, Perú, Bolivia y Ecuador", "Uruguay, Paraguay, Brasil y Bolivia"],
        respuesta: "Argentina, Chile, Uruguay y Paraguay",
        explicacion: "Son los 4 países del extremo sur de Sudamérica, donde el continente se angosta hacia la Patagonia.",
      },
      {
        pregunta: "¿Cuál de los 4 países del Cono Sur no tiene salida al mar?",
        opciones: ["Paraguay", "Argentina", "Chile", "Uruguay"],
        respuesta: "Paraguay",
        explicacion: "Paraguay está completamente rodeado de tierra, sin costa sobre ningún océano.",
      },
      {
        pregunta: "¿Qué país del Cono Sur tiene grandes llanuras conocidas como las pampas?",
        opciones: ["Argentina", "Chile", "Uruguay", "Paraguay"],
        respuesta: "Argentina",
        explicacion: "Las pampas son las grandes llanuras fértiles del centro de Argentina.",
      },
      {
        pregunta: "¿Qué país del Cono Sur es una franja angosta pegada a la cordillera de los Andes?",
        opciones: ["Chile", "Argentina", "Uruguay", "Paraguay"],
        respuesta: "Chile",
        explicacion: "Chile está apretado entre los Andes y el océano Pacífico, muy largo y muy angosto.",
      },
    ],
  },
  {
    slug: "geografia-clase-region-andina",
    continente: "america",
    orden: 2,
    requierePro: true,
    nombre: "Región Andina: Colombia, Venezuela, Ecuador, Perú y Bolivia",
    descripcion: "5 países atravesados por la cordillera de los Andes, en el norte y oeste de Sudamérica.",
    pasos: [
      "La Región Andina agrupa a los países atravesados por la cordillera de los Andes, en el norte y oeste de Sudamérica.",
      "La forman 5 países: Colombia y Venezuela (los más al norte, con costa caribeña), Ecuador (el más chico, cruzado por el ecuador terrestre), Perú y Bolivia (los más al sur del grupo, con la meseta andina y el lago Titicaca).",
      "Un rasgo distintivo: Bolivia, como Paraguay, no tiene salida al mar — la perdió en una guerra con Chile en el siglo XIX.",
      "Los 5 países comparten la misma cordillera como columna vertebral, aunque su clima varía mucho de norte a sur.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["170", "862", "218", "604"], despuesDePaso: 2, titulo: "Región Andina: Colombia, Venezuela, Ecuador y Perú" },
    ],
    quiz: [
      {
        pregunta: "¿Qué cordillera atraviesa a los 5 países de la Región Andina?",
        opciones: ["Los Andes", "Los Alpes", "El Himalaya", "Las Rocosas"],
        respuesta: "Los Andes",
        explicacion: "La cordillera de los Andes recorre de norte a sur los 5 países de esta región.",
      },
      {
        pregunta: "¿Cuál de estos países andinos no tiene salida al mar?",
        opciones: ["Bolivia", "Perú", "Colombia", "Ecuador"],
        respuesta: "Bolivia",
        explicacion: "Bolivia perdió su salida al mar frente a Chile en el siglo XIX y hoy está rodeada de tierra.",
      },
      {
        pregunta: "¿Qué país andino es el más chico y está cruzado por el ecuador terrestre?",
        opciones: ["Ecuador", "Colombia", "Perú", "Venezuela"],
        respuesta: "Ecuador",
        explicacion: "Ecuador debe su nombre a la línea del ecuador terrestre, que cruza su territorio.",
      },
      {
        pregunta: "¿Qué dos países andinos tienen costa sobre el mar Caribe?",
        opciones: ["Colombia y Venezuela", "Perú y Bolivia", "Ecuador y Perú", "Bolivia y Colombia"],
        respuesta: "Colombia y Venezuela",
        explicacion: "Son los dos países andinos más al norte, ambos con costa caribeña además de la andina.",
      },
    ],
  },
  {
    slug: "geografia-clase-centroamerica-y-caribe",
    continente: "america",
    orden: 3,
    requierePro: true,
    nombre: "Centroamérica y el Caribe: el istmo y las islas",
    descripcion: "El puente de tierra entre México y Sudamérica, más las islas del mar Caribe.",
    pasos: [
      "Esta sub-región combina dos partes: el istmo centroamericano (una franja de tierra) y las islas del mar Caribe.",
      "En el istmo: Guatemala (el más al norte), Costa Rica y Panamá (los más al sur, antes de llegar a Sudamérica).",
      "En las islas: Cuba (la más grande), República Dominicana y Jamaica.",
      "Un rasgo distintivo: a diferencia de Sudamérica (un bloque continuo), acá se combinan tierra firme angosta e islas — dos tipos de geografía distintos en la misma sub-región.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["320", "188", "591", "192"], despuesDePaso: 2, titulo: "Guatemala, Costa Rica, Panamá y Cuba" },
    ],
    quiz: [
      {
        pregunta: "¿Qué dos tipos de geografía combina esta sub-región?",
        opciones: ["Istmo (tierra firme) e islas", "Solo islas", "Solo cordillera", "Solo desierto"],
        respuesta: "Istmo (tierra firme) e islas",
        explicacion: "Centroamérica es una franja de tierra firme; el Caribe son islas — dos geografías distintas en la misma sub-región.",
      },
      {
        pregunta: "¿Cuál es la isla más grande del Caribe, mencionada en esta lección?",
        opciones: ["Cuba", "Jamaica", "República Dominicana", "Puerto Rico"],
        respuesta: "Cuba",
        explicacion: "Cuba es la isla más grande del Caribe.",
      },
      {
        pregunta: "¿Cuál es el país centroamericano que conecta el istmo con Sudamérica?",
        opciones: ["Panamá", "Guatemala", "Costa Rica", "Cuba"],
        respuesta: "Panamá",
        explicacion: "Panamá, en el extremo sur del istmo, limita con Colombia.",
      },
      {
        pregunta: "¿Cuál de estos países pertenece al istmo centroamericano, no a las islas del Caribe?",
        opciones: ["Costa Rica", "Cuba", "Jamaica", "República Dominicana"],
        respuesta: "Costa Rica",
        explicacion: "Costa Rica es parte de la franja de tierra firme centroamericana, no una isla.",
      },
    ],
  },
  {
    slug: "geografia-clase-norteamerica",
    continente: "america",
    orden: 4,
    requierePro: true,
    nombre: "Norteamérica: Estados Unidos, Canadá y México",
    descripcion: "Los 3 países grandes del norte del continente, de mayor a menor tamaño: Canadá, Estados Unidos y México.",
    pasos: [
      "Norteamérica, en esta sub-región, agrupa a solo 3 países — pero entre los más grandes del mundo.",
      "Canadá, el más al norte, es el segundo país más grande del mundo por superficie, aunque con poca población comparada con su tamaño.",
      "Estados Unidos, al sur de Canadá, se extiende de costa a costa entre el océano Pacífico y el Atlántico.",
      "México, el más al sur de los 3, conecta Norteamérica con el istmo centroamericano.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["124", "840", "484"], despuesDePaso: 2, titulo: "Canadá, Estados Unidos y México" },
    ],
    quiz: [
      {
        pregunta: "¿Cuál de los 3 países de Norteamérica es el más grande por superficie?",
        opciones: ["Canadá", "Estados Unidos", "México", "Los tres tienen el mismo tamaño"],
        respuesta: "Canadá",
        explicacion: "Canadá es el segundo país más grande del mundo por superficie, más grande que Estados Unidos.",
      },
      {
        pregunta: "¿Qué país conecta Norteamérica con el istmo centroamericano?",
        opciones: ["México", "Canadá", "Estados Unidos", "Guatemala"],
        respuesta: "México",
        explicacion: "México es el país más al sur de los 3 y limita con Guatemala, ya en Centroamérica.",
      },
      {
        pregunta: "¿Entre qué dos océanos se extiende Estados Unidos, de costa a costa?",
        opciones: ["El Pacífico y el Atlántico", "El Atlántico y el Índico", "El Pacífico y el Índico", "El Ártico y el Atlántico"],
        respuesta: "El Pacífico y el Atlántico",
        explicacion: "Estados Unidos tiene costa sobre ambos océanos, de costa a costa.",
      },
    ],
  },

  // ---------------- Europa ----------------
  {
    slug: "geografia-clase-europa-occidental",
    continente: "europa",
    orden: 1,
    requierePro: true,
    nombre: "Europa Occidental: Francia, Alemania, Países Bajos y Bélgica",
    descripcion: "El bloque de países más al oeste del centro de Europa, con algunas de las economías más grandes del continente.",
    pasos: [
      "Europa Occidental agrupa a los países del oeste-centro del continente, entre el Atlántico y Alemania.",
      "Francia, el más grande de los 4, tiene costa tanto en el Atlántico como en el Mediterráneo.",
      "Alemania, al este de Francia, es el país más poblado de la región y comparte frontera con muchos vecinos.",
      "Países Bajos y Bélgica, los más chicos de los 4, quedan pegados al mar del Norte, entre Francia y Alemania.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "europa", paisesIds: ["250", "276", "528", "056"], despuesDePaso: 2, titulo: "Francia, Alemania, Países Bajos y Bélgica" },
    ],
    quiz: [
      {
        pregunta: "¿Qué país de Europa Occidental tiene costa tanto en el Atlántico como en el Mediterráneo?",
        opciones: ["Francia", "Alemania", "Países Bajos", "Bélgica"],
        respuesta: "Francia",
        explicacion: "Francia es el único de los 4 con costa en ambos mares.",
      },
      {
        pregunta: "¿Cuáles son los dos países más chicos del grupo, pegados al mar del Norte?",
        opciones: ["Países Bajos y Bélgica", "Francia y Alemania", "Alemania y Bélgica", "Francia y Países Bajos"],
        respuesta: "Países Bajos y Bélgica",
        explicacion: "Ambos son mucho más chicos que Francia o Alemania y quedan sobre el mar del Norte.",
      },
      {
        pregunta: "¿Qué país de Europa Occidental es el más poblado de la región?",
        opciones: ["Alemania", "Bélgica", "Países Bajos", "Ninguno, todos tienen la misma población"],
        respuesta: "Alemania",
        explicacion: "Alemania tiene la mayor población de los 4 países de esta sub-región.",
      },
    ],
  },
  {
    slug: "geografia-clase-europa-del-este",
    continente: "europa",
    orden: 2,
    requierePro: true,
    nombre: "Europa del Este: Polonia, Ucrania, Hungría y Rumania",
    descripcion: "El bloque entre Alemania y Rusia, con Ucrania como el país más grande de los 4 por superficie.",
    pasos: [
      "Europa del Este agrupa a los países entre Alemania y Rusia, muchos de ellos antiguos miembros del bloque soviético.",
      "Polonia, al este de Alemania, es uno de los países más poblados de la región.",
      "Ucrania, más al este, es el país más grande de los 4 por superficie — una de las mayores llanuras agrícolas de Europa.",
      "Hungría y Rumania, más al sur, completan el grupo, ambos en la cuenca del río Danubio.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "europa", paisesIds: ["616", "804", "348", "642"], despuesDePaso: 2, titulo: "Polonia, Ucrania, Hungría y Rumania" },
    ],
    quiz: [
      {
        pregunta: "¿Cuál de estos 4 países de Europa del Este es el más grande por superficie?",
        opciones: ["Ucrania", "Polonia", "Hungría", "Rumania"],
        respuesta: "Ucrania",
        explicacion: "Ucrania es, por lejos, el más grande de los 4 por superficie.",
      },
      {
        pregunta: "¿Qué río atraviesa tanto a Hungría como a Rumania?",
        opciones: ["El Danubio", "El Rin", "El Volga", "El Sena"],
        respuesta: "El Danubio",
        explicacion: "El Danubio atraviesa varios países de Europa del Este, incluidos Hungría y Rumania.",
      },
      {
        pregunta: "¿Qué país queda al este de Alemania, iniciando el bloque de Europa del Este?",
        opciones: ["Polonia", "Ucrania", "Rumania", "Hungría"],
        respuesta: "Polonia",
        explicacion: "Polonia es el país que limita directamente con Alemania por el este.",
      },
    ],
  },
  {
    slug: "geografia-clase-escandinavia-baltico",
    continente: "europa",
    orden: 3,
    requierePro: true,
    nombre: "Escandinavia y el Báltico: Suecia, Noruega, Dinamarca y Finlandia",
    descripcion: "El bloque del norte de Europa, con climas fríos y una economía basada históricamente en el mar.",
    pasos: [
      "Esta sub-región agrupa a los países nórdicos, en el extremo norte de Europa.",
      "Suecia y Noruega comparten la península escandinava; Noruega, con su costa de fiordos, mira al Atlántico, y Suecia al mar Báltico.",
      "Dinamarca, el más chico y el más al sur de los 4, conecta la península escandinava con el resto de Europa continental.",
      "Finlandia, al este de Suecia, se distingue por sus miles de lagos y su larga frontera con Rusia.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "europa", paisesIds: ["752", "578", "208", "246"], despuesDePaso: 2, titulo: "Suecia, Noruega, Dinamarca y Finlandia" },
    ],
    quiz: [
      {
        pregunta: "¿Qué dos países comparten la península escandinava?",
        opciones: ["Suecia y Noruega", "Suecia y Dinamarca", "Noruega y Finlandia", "Dinamarca y Finlandia"],
        respuesta: "Suecia y Noruega",
        explicacion: "Ambos países ocupan la misma península, con Noruega al oeste y Suecia al este.",
      },
      {
        pregunta: "¿Cuál de los 4 países nórdicos es el más chico y el más al sur?",
        opciones: ["Dinamarca", "Suecia", "Noruega", "Finlandia"],
        respuesta: "Dinamarca",
        explicacion: "Dinamarca es el más chico de los 4 y el que conecta la región con el resto de Europa continental.",
      },
      {
        pregunta: "¿Qué país nórdico tiene una larga frontera con Rusia?",
        opciones: ["Finlandia", "Dinamarca", "Noruega", "Suecia"],
        respuesta: "Finlandia",
        explicacion: "Finlandia limita al este con Rusia a lo largo de una frontera extensa.",
      },
    ],
  },
  {
    slug: "geografia-clase-region-mediterranea",
    continente: "europa",
    orden: 4,
    requierePro: true,
    nombre: "Región Mediterránea: España, Italia, Grecia y Portugal",
    descripcion: "El sur de Europa, con climas cálidos y costa sobre el mar Mediterráneo (salvo Portugal, sobre el Atlántico).",
    pasos: [
      "La Región Mediterránea agrupa a los países del sur de Europa, la mayoría con costa sobre el mar Mediterráneo.",
      "España e Italia son los dos más grandes del grupo — España en la península ibérica, Italia en la península itálica.",
      "Grecia, en el extremo sureste, tiene miles de islas propias repartidas por el mar Egeo.",
      "Portugal es la excepción: comparte península con España, pero toda su costa mira al océano Atlántico, no al Mediterráneo.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "europa", paisesIds: ["724", "380", "300", "620"], despuesDePaso: 2, titulo: "España, Italia, Grecia y Portugal" },
    ],
    quiz: [
      {
        pregunta: "¿Cuál de estos 4 países NO tiene costa sobre el mar Mediterráneo?",
        opciones: ["Portugal", "España", "Italia", "Grecia"],
        respuesta: "Portugal",
        explicacion: "Toda la costa de Portugal mira al océano Atlántico, no al Mediterráneo.",
      },
      {
        pregunta: "¿Qué país mediterráneo tiene miles de islas propias en el mar Egeo?",
        opciones: ["Grecia", "España", "Italia", "Portugal"],
        respuesta: "Grecia",
        explicacion: "Grecia tiene miles de islas repartidas por el mar Egeo, un rasgo muy distintivo del país.",
      },
      {
        pregunta: "¿Qué dos países comparten la península ibérica dentro de esta sub-región?",
        opciones: ["España y Portugal", "España e Italia", "Italia y Grecia", "Portugal e Italia"],
        respuesta: "España y Portugal",
        explicacion: "Ambos comparten la misma península, en el suroeste de Europa.",
      },
    ],
  },

  // ---------------- África ----------------
  {
    slug: "geografia-clase-norte-de-africa-magreb",
    continente: "africa",
    orden: 1,
    requierePro: true,
    nombre: "Norte de África (Magreb): Marruecos, Argelia, Túnez y Libia",
    descripcion: "El bloque al norte del Sahara, entre el Mediterráneo y el gran desierto.",
    pasos: [
      "El Magreb es el bloque de países del norte de África, al norte del desierto del Sahara y con costa sobre el mar Mediterráneo.",
      "Marruecos, el más al oeste, es el más cercano a Europa — separado de España por el estrecho de Gibraltar.",
      "Argelia, al este de Marruecos, es el país más grande de África por superficie.",
      "Túnez y Libia completan el bloque hacia el este, ambos también con costa mediterránea.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "africa", paisesIds: ["504", "012", "788", "434"], despuesDePaso: 2, titulo: "Marruecos, Argelia, Túnez y Libia" },
    ],
    quiz: [
      {
        pregunta: "¿Qué mar separa a Marruecos de España, en su punto más angosto?",
        opciones: ["El estrecho de Gibraltar", "El mar Rojo", "El golfo Pérsico", "El canal de Suez"],
        respuesta: "El estrecho de Gibraltar",
        explicacion: "El estrecho de Gibraltar es el paso angosto que separa el norte de Marruecos del sur de España.",
      },
      {
        pregunta: "¿Cuál de estos 4 países del Magreb es el más grande de África por superficie?",
        opciones: ["Argelia", "Marruecos", "Túnez", "Libia"],
        respuesta: "Argelia",
        explicacion: "Argelia es el país más grande de todo el continente africano por superficie.",
      },
      {
        pregunta: "¿Sobre qué mar tienen costa los 4 países del Magreb?",
        opciones: ["El mar Mediterráneo", "El mar Rojo", "El océano Índico", "El golfo de Guinea"],
        respuesta: "El mar Mediterráneo",
        explicacion: "Los 4 países del Magreb comparten costa sobre el mar Mediterráneo, al norte del Sahara.",
      },
    ],
  },
  {
    slug: "geografia-clase-africa-occidental",
    continente: "africa",
    orden: 2,
    requierePro: true,
    nombre: "África Occidental: Nigeria, Ghana, Senegal y Costa de Marfil",
    descripcion: "El bloque costero sobre el golfo de Guinea, con Nigeria como el país más poblado de todo el continente.",
    pasos: [
      "África Occidental agrupa a los países costeros sobre el golfo de Guinea, en el oeste del continente.",
      "Nigeria, el más al este de los 4, es el país más poblado de toda África.",
      "Ghana, más al oeste, tiene costa directa sobre el golfo de Guinea, igual que Costa de Marfil, su vecino.",
      "Senegal, el más al norte y al oeste de los 4, es la punta más occidental del continente africano.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "africa", paisesIds: ["566", "288", "686", "384"], despuesDePaso: 2, titulo: "Nigeria, Ghana, Senegal y Costa de Marfil" },
    ],
    quiz: [
      {
        pregunta: "¿Qué país de África Occidental es el más poblado de todo el continente?",
        opciones: ["Nigeria", "Ghana", "Senegal", "Costa de Marfil"],
        respuesta: "Nigeria",
        explicacion: "Nigeria es, por lejos, el país más poblado de África.",
      },
      {
        pregunta: "¿Sobre qué golfo tienen costa Nigeria, Ghana y Costa de Marfil?",
        opciones: ["El golfo de Guinea", "El golfo Pérsico", "El golfo de Adén", "El golfo de Omán"],
        respuesta: "El golfo de Guinea",
        explicacion: "Los tres países comparten costa sobre el golfo de Guinea, en el oeste de África.",
      },
      {
        pregunta: "¿Cuál de estos 4 países queda en la punta más occidental del continente africano?",
        opciones: ["Senegal", "Nigeria", "Ghana", "Costa de Marfil"],
        respuesta: "Senegal",
        explicacion: "Senegal ocupa el extremo más al oeste de todo el continente africano.",
      },
    ],
  },
  {
    slug: "geografia-clase-africa-oriental",
    continente: "africa",
    orden: 3,
    requierePro: true,
    nombre: "África Oriental: Kenia, Etiopía, Tanzania y Uganda",
    descripcion: "El bloque del este del continente, atravesado por el Gran Valle del Rift y algunos de los lagos más grandes de África.",
    pasos: [
      "África Oriental agrupa a los países del este del continente, atravesados por el Gran Valle del Rift.",
      "Kenia y Tanzania tienen costa sobre el océano Índico y comparten algunas de las sabanas más conocidas de África.",
      "Etiopía, más al norte, no tiene salida al mar y es uno de los países más antiguos del continente en mantener su independencia.",
      "Uganda, en el interior, está atravesada por el lago Victoria, uno de los lagos más grandes del mundo, compartido con Kenia y Tanzania.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "africa", paisesIds: ["404", "231", "834", "800"], despuesDePaso: 2, titulo: "Kenia, Etiopía, Tanzania y Uganda" },
    ],
    quiz: [
      {
        pregunta: "¿Qué gran accidente geográfico atraviesa a los países de África Oriental?",
        opciones: ["El Gran Valle del Rift", "El desierto del Sahara", "La cordillera del Atlas", "El río Congo"],
        respuesta: "El Gran Valle del Rift",
        explicacion: "El Gran Valle del Rift es una enorme fractura geológica que recorre África Oriental de norte a sur.",
      },
      {
        pregunta: "¿Cuál de estos 4 países de África Oriental no tiene salida al mar?",
        opciones: ["Etiopía", "Kenia", "Tanzania", "Ninguno, los 4 tienen costa"],
        respuesta: "Etiopía",
        explicacion: "Etiopía está en el interior, rodeada por Eritrea, Yibuti, Somalia, Kenia, Sudán del Sur y Sudán.",
      },
      {
        pregunta: "¿Qué lago grande comparten Uganda, Kenia y Tanzania?",
        opciones: ["El lago Victoria", "El lago Titicaca", "El mar Muerto", "El lago Baikal"],
        respuesta: "El lago Victoria",
        explicacion: "El lago Victoria es uno de los lagos más grandes del mundo y está compartido por los tres países.",
      },
    ],
  },
  {
    slug: "geografia-clase-africa-austral",
    continente: "africa",
    orden: 4,
    requierePro: true,
    nombre: "África Austral: Sudáfrica, Namibia, Botsuana y Zimbabue",
    descripcion: "El bloque del extremo sur del continente, con Sudáfrica como el país más desarrollado económicamente de la región.",
    pasos: [
      "África Austral agrupa a los países del extremo sur del continente.",
      "Sudáfrica, en la punta sur, tiene costa sobre dos océanos: el Atlántico y el Índico.",
      "Namibia, al noroeste de Sudáfrica, tiene costa sobre el Atlántico y una larga franja recta hacia el este (la Franja de Caprivi).",
      "Botsuana y Zimbabue, en el interior, no tienen salida al mar y comparten frontera tanto con Sudáfrica como con Namibia o Zambia.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "africa", paisesIds: ["710", "516", "072", "716"], despuesDePaso: 2, titulo: "Sudáfrica, Namibia, Botsuana y Zimbabue" },
    ],
    quiz: [
      {
        pregunta: "¿Sobre qué dos océanos tiene costa Sudáfrica?",
        opciones: ["El Atlántico y el Índico", "El Atlántico y el Pacífico", "El Índico y el Pacífico", "Solo el Índico"],
        respuesta: "El Atlántico y el Índico",
        explicacion: "Sudáfrica está en la punta sur del continente, con costa sobre ambos océanos.",
      },
      {
        pregunta: "¿Cuáles de estos 4 países de África Austral no tienen salida al mar?",
        opciones: ["Botsuana y Zimbabue", "Sudáfrica y Namibia", "Solo Sudáfrica", "Ninguno, los 4 tienen costa"],
        respuesta: "Botsuana y Zimbabue",
        explicacion: "Ambos están en el interior del continente, rodeados de tierra.",
      },
      {
        pregunta: "¿Qué país de África Austral tiene una larga franja recta hacia el este (la Franja de Caprivi)?",
        opciones: ["Namibia", "Sudáfrica", "Botsuana", "Zimbabue"],
        respuesta: "Namibia",
        explicacion: "La Franja de Caprivi es una prolongación angosta y recta del territorio de Namibia.",
      },
    ],
  },

  // ---------------- Asia + Oceanía ----------------
  {
    slug: "geografia-clase-asia-oriental",
    continente: "asia_oceania",
    orden: 1,
    requierePro: true,
    nombre: "Asia Oriental: China, Japón, Corea del Sur y Mongolia",
    descripcion: "El bloque del este de Asia, con China como el país más grande y poblado de la región.",
    pasos: [
      "Asia Oriental agrupa a los países del extremo este del continente asiático.",
      "China, el más grande de los 4, domina la región tanto en territorio como en población.",
      "Japón, un archipiélago frente a la costa este de China, está separado del continente por el mar de Japón.",
      "Corea del Sur, en la península coreana, y Mongolia, en el interior entre China y Rusia, completan el bloque.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "asia_oceania", paisesIds: ["156", "392", "410", "496"], despuesDePaso: 2, titulo: "China, Japón, Corea del Sur y Mongolia" },
    ],
    quiz: [
      {
        pregunta: "¿Qué país de Asia Oriental es un archipiélago, separado del continente por el mar de Japón?",
        opciones: ["Japón", "China", "Corea del Sur", "Mongolia"],
        respuesta: "Japón",
        explicacion: "Japón está formado por varias islas, separadas del continente asiático por el mar de Japón.",
      },
      {
        pregunta: "¿Qué país de Asia Oriental queda en el interior, entre China y Rusia, sin salida al mar?",
        opciones: ["Mongolia", "Japón", "Corea del Sur", "China"],
        respuesta: "Mongolia",
        explicacion: "Mongolia está en el interior del continente, rodeada por China y Rusia.",
      },
      {
        pregunta: "¿En qué península está ubicada Corea del Sur?",
        opciones: ["La península coreana", "La península arábiga", "Indochina", "La península itálica"],
        respuesta: "La península coreana",
        explicacion: "Corea del Sur ocupa la mitad sur de la península coreana, que sobresale hacia el este de China.",
      },
    ],
  },
  {
    slug: "geografia-clase-sudeste-asiatico-y-meridional",
    continente: "asia_oceania",
    orden: 2,
    requierePro: true,
    nombre: "Sudeste Asiático y Asia Meridional: Indonesia, Filipinas, Vietnam e India",
    descripcion: "Dos regiones vecinas: los archipiélagos e Indochina al sureste, y el subcontinente indio al sur.",
    pasos: [
      "Esta Clase combina dos regiones vecinas: el Sudeste Asiático (islas y la península de Indochina) y Asia Meridional (el subcontinente indio).",
      "Indonesia y Filipinas son archipiélagos, países formados por miles de islas, en el Sudeste Asiático.",
      "Vietnam, en la península de Indochina, se extiende como una franja larga y curva a lo largo de la costa este.",
      "India, en Asia Meridional, domina un subcontinente propio, separado del resto de Asia por el Himalaya al norte.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "asia_oceania", paisesIds: ["360", "608", "704", "356"], despuesDePaso: 2, titulo: "Indonesia, Filipinas, Vietnam e India" },
    ],
    quiz: [
      {
        pregunta: "¿Qué cordillera separa a India del resto de Asia por el norte?",
        opciones: ["El Himalaya", "Los Andes", "Los Alpes", "El Atlas"],
        respuesta: "El Himalaya",
        explicacion: "El Himalaya, la cordillera más alta del mundo, separa el subcontinente indio del resto de Asia.",
      },
      {
        pregunta: "¿Qué país de esta lección tiene forma de franja larga y curva a lo largo de la costa de Indochina?",
        opciones: ["Vietnam", "India", "Indonesia", "Filipinas"],
        respuesta: "Vietnam",
        explicacion: "Vietnam se extiende en una franja larga y curva a lo largo de la costa este de la península de Indochina.",
      },
      {
        pregunta: "¿Cuáles de estos 4 países son archipiélagos?",
        opciones: ["Indonesia y Filipinas", "Vietnam e India", "India e Indonesia", "Vietnam y Filipinas"],
        respuesta: "Indonesia y Filipinas",
        explicacion: "Ambos están formados por miles de islas, a diferencia de Vietnam e India, que son bloques de tierra continua.",
      },
    ],
  },
  {
    slug: "geografia-clase-oriente-medio",
    continente: "asia_oceania",
    orden: 3,
    requierePro: true,
    nombre: "Oriente Medio: Arabia Saudita, Irán, Turquía e Israel",
    descripcion: "El bloque entre el Mediterráneo y el golfo Pérsico, con Arabia Saudita como el país más grande por territorio.",
    pasos: [
      "Oriente Medio agrupa a los países entre el mar Mediterráneo y el golfo Pérsico, en el suroeste de Asia.",
      "Arabia Saudita, en la península arábiga, es el país más grande de la región por territorio.",
      "Turquía, al noroeste, tiene una pequeña porción de su territorio en Europa — es el único país de esta lección con territorio en dos continentes.",
      "Irán, al este, y su vecino más pequeño, Israel, sobre la costa del Mediterráneo, completan el bloque.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "asia_oceania", paisesIds: ["682", "364", "792", "376"], despuesDePaso: 2, titulo: "Arabia Saudita, Irán, Turquía e Israel" },
    ],
    quiz: [
      {
        pregunta: "¿Qué país de esta lección tiene territorio en dos continentes (Asia y Europa)?",
        opciones: ["Turquía", "Arabia Saudita", "Irán", "Israel"],
        respuesta: "Turquía",
        explicacion: "Una pequeña porción de Turquía, al noroeste, está en Europa; el resto está en Asia.",
      },
      {
        pregunta: "¿Cuál de estos 4 países es el más grande por territorio?",
        opciones: ["Arabia Saudita", "Israel", "Turquía", "Irán"],
        respuesta: "Arabia Saudita",
        explicacion: "Arabia Saudita ocupa la mayor parte de la península arábiga, el más grande de los 4.",
      },
      {
        pregunta: "¿Qué país de esta lección tiene costa directa sobre el mar Mediterráneo, en el extremo oeste del grupo?",
        opciones: ["Israel", "Irán", "Arabia Saudita", "Ninguno tiene costa mediterránea"],
        respuesta: "Israel",
        explicacion: "Israel tiene costa sobre el mar Mediterráneo, a diferencia de Arabia Saudita e Irán.",
      },
    ],
  },
  {
    slug: "geografia-clase-oceania",
    continente: "asia_oceania",
    orden: 4,
    requierePro: true,
    nombre: "Oceanía: Australia, Nueva Zelanda, Papúa Nueva Guinea y Fiyi",
    descripcion: "La región más aislada de las cuatro: un continente-isla enorme y varios archipiélagos mucho más chicos.",
    pasos: [
      "Oceanía es la región más aislada de las cuatro: está formada por Australia y una serie de islas repartidas por el océano Pacífico.",
      "Australia es, a la vez, un país y un continente propio — casi tan grande como toda Europa.",
      "Nueva Zelanda, al sureste de Australia, está formada por dos islas principales, con un clima mucho más frío y montañoso.",
      "Papúa Nueva Guinea, al norte de Australia, y Fiyi, más al este, son dos archipiélagos mucho más chicos, cerca del ecuador.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "asia_oceania", paisesIds: ["036", "554", "598", "242"], despuesDePaso: 2, titulo: "Australia, Nueva Zelanda, Papúa Nueva Guinea y Fiyi" },
    ],
    quiz: [
      {
        pregunta: "¿Qué país de Oceanía es, a la vez, un continente propio?",
        opciones: ["Australia", "Nueva Zelanda", "Papúa Nueva Guinea", "Fiyi"],
        respuesta: "Australia",
        explicacion: "Australia es el único país del mundo que ocupa un continente entero.",
      },
      {
        pregunta: "¿Cuál de estos países de Oceanía queda al norte de Australia, cerca del ecuador?",
        opciones: ["Papúa Nueva Guinea", "Nueva Zelanda", "Ninguno, todos están al sur", "Fiyi"],
        respuesta: "Papúa Nueva Guinea",
        explicacion: "Papúa Nueva Guinea está al norte de Australia, mucho más cerca del ecuador que Nueva Zelanda.",
      },
      {
        pregunta: "¿Cuántas islas principales forman Nueva Zelanda?",
        opciones: ["Dos", "Una", "Cinco", "Ninguna, es parte del continente australiano"],
        respuesta: "Dos",
        explicacion: "Nueva Zelanda está formada por dos islas principales, Isla Norte e Isla Sur.",
      },
    ],
  },
];
