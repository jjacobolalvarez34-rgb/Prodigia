import type { TecnicaAnatomia } from "./tipos";

// Técnicas del sistema óseo. Datos verificados en lecciones.test.ts contra
// la tabla de referencia (22 huesos del cráneo = 8 craneales + 14
// faciales; mano 8-5-14; pie 7-5-14; columna 7-12-5 + sacro + cóccix; 12
// pares de costillas). Simplificaciones de nivel colegio marcadas en el
// texto ("simplificación").
export const TECNICAS_OSEO: TecnicaAnatomia[] = [
  {
    slug: "anatomia-craneo-por-zona",
    grupo: "oseo",
    orden: 1,
    requierePro: false,
    nombre: "Huesos del cráneo: agrúpalos por zona",
    descripcion:
      "En vez de memorizar 10 huesos sueltos, divídelos en 3 zonas: la bóveda (frontal, parietales, temporales, occipital), el centro de la base (esfenoides y etmoides) y la cara (maxilar, mandíbula, cigomáticos, nasales).",
    pasos: [
      "Bóveda, la «tapa» que rodea el cerebro por arriba y por los lados: frontal (la frente), 2 parietales, 2 temporales (las sienes) y occipital (la nuca).",
      "Centro de la base del cráneo, casi sin verse desde afuera: esfenoides y etmoides. Quedan entre la cara y el cerebro.",
      "Cara, los que se ven de frente: maxilar (la mandíbula superior), mandíbula (la única que se mueve), 2 cigomáticos (los pómulos) y 2 nasales (el puente de la nariz).",
      "Cifras: 8 huesos craneales (frontal, 2 parietales, 2 temporales, occipital, esfenoides y etmoides) y 14 faciales. Simplificación: aquí solo aprendes los 10 nombres que más se usan; entre los faciales faltan, por ejemplo, los lagrimales y los palatinos.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 2,
        titulo: "Tres zonas en vez de diez huesos sueltos",
        grupos: [
          {
            nombre: "Bóveda",
            items: [
              { texto: "Frontal", detalle: "la frente" },
              { texto: "Parietal", detalle: "2, los lados y el techo" },
              { texto: "Temporal", detalle: "2, las sienes" },
              { texto: "Occipital", detalle: "la nuca" },
            ],
          },
          {
            nombre: "Centro de la base",
            items: [
              { texto: "Esfenoides", detalle: "detrás de los ojos, en el centro" },
              { texto: "Etmoides", detalle: "entre los ojos, detrás de la nariz" },
            ],
          },
          {
            nombre: "Cara",
            items: [
              { texto: "Maxilar", detalle: "2, la mandíbula superior" },
              { texto: "Mandíbula", detalle: "la inferior, es móvil" },
              { texto: "Cigomático", detalle: "2, los pómulos" },
              { texto: "Nasal", detalle: "2, el puente de la nariz" },
            ],
          },
        ],
      },
      { tipo: "anatomia.esqueleto", despuesDePaso: 3, titulo: "El cráneo, en el esqueleto", huesos: ["craneo"] },
    ],
    quiz: [
      {
        pregunta: "¿A qué zona pertenece el hueso frontal?",
        opciones: ["Cara", "Bóveda", "Centro de la base"],
        respuesta: "Bóveda",
        explicacion: "El frontal (la frente) forma parte de la bóveda, junto con los parietales, los temporales y el occipital.",
      },
      {
        pregunta: "¿Cuál es el hueso de la cabeza que se mueve al abrir y cerrar la boca?",
        opciones: ["Maxilar", "Cigomático", "Mandíbula", "Occipital"],
        respuesta: "Mandíbula",
        explicacion: "La mandíbula es el único hueso móvil del cráneo (sin contar los huesecillos del oído); el maxilar está fijo.",
      },
      {
        pregunta: "¿Qué dos huesos forman el centro de la base del cráneo, casi sin verse desde afuera?",
        opciones: ["Maxilar y mandíbula", "Frontal y parietal", "Esfenoides y etmoides", "Cigomático y nasal"],
        respuesta: "Esfenoides y etmoides",
        explicacion: "Esfenoides y etmoides quedan entre la cara y el cerebro, por eso casi no se ven desde afuera.",
      },
      {
        pregunta: "¿Cuántos huesos craneales (los que protegen el cerebro) hay en total?",
        opciones: ["22", "14", "8", "10"],
        respuesta: "8",
        explicacion: "Frontal, 2 parietales, 2 temporales, occipital, esfenoides y etmoides: 8. Los otros 14 son faciales (22 en total).",
      },
    ],
  },
  {
    slug: "anatomia-huesos-largos-de-los-miembros",
    grupo: "oseo",
    orden: 2,
    requierePro: false,
    nombre: "Brazo y pierna: mismo plano, distinto nombre",
    descripcion:
      "El brazo y la pierna se construyen igual: 1 hueso arriba (húmero o fémur) y 2 abajo (radio y cúbito, o tibia y peroné). Aprende el patrón una vez y sirve para los dos.",
    pasos: [
      "Arriba hay un solo hueso largo: el húmero en el brazo y el fémur en el muslo. El fémur es el hueso más largo y más fuerte del cuerpo.",
      "Abajo hay dos huesos paralelos. En el antebrazo: radio y cúbito. En la pierna: tibia y peroné.",
      "Con la palma hacia adelante (posición anatómica), el radio queda del lado del pulgar y el cúbito del lado del meñique. En la pierna, la tibia es la gruesa, por delante y hacia adentro (la «espinilla»), y el peroné es el delgado, por fuera.",
      "Nombres alternativos: en la nomenclatura anatómica internacional el cúbito se llama ulna y el peroné se llama fíbula. Prodigia usa cúbito y peroné.",
    ],
    visuales: [
      {
        tipo: "anatomia.esqueleto",
        despuesDePaso: 2,
        titulo: "Los seis huesos largos, uno por uno",
        huesos: ["humero", "radio", "cubito", "femur", "tibia", "perone"],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué dos huesos forman el antebrazo?",
        opciones: ["Húmero y radio", "Radio y cúbito", "Tibia y peroné", "Fémur y tibia"],
        respuesta: "Radio y cúbito",
        explicacion: "El antebrazo tiene radio y cúbito; el brazo tiene un solo hueso, el húmero.",
      },
      {
        pregunta: "¿Cuál es el hueso más largo del cuerpo?",
        opciones: ["Húmero", "Tibia", "Fémur", "Cúbito"],
        respuesta: "Fémur",
        explicacion: "El fémur (el hueso del muslo) es el más largo y el más fuerte.",
      },
      {
        pregunta: "En la posición anatómica, ¿qué hueso del antebrazo queda del lado del pulgar?",
        opciones: ["Cúbito", "Radio", "Húmero", "Peroné"],
        respuesta: "Radio",
        explicacion: "El radio está del lado del pulgar; el cúbito, del lado del meñique.",
      },
      {
        pregunta: "¿Cuál de estos huesos es delgado y queda en la parte externa de la pierna?",
        opciones: ["Tibia", "Fémur", "Radio", "Peroné"],
        respuesta: "Peroné",
        explicacion: "El peroné es el hueso delgado de la pierna; la tibia, a su lado, es la gruesa y soporta el peso.",
      },
    ],
  },
  {
    slug: "anatomia-mano-y-pie-por-filas",
    grupo: "oseo",
    orden: 3,
    requierePro: false,
    nombre: "Mano y pie: tres filas, de la muñeca a la punta",
    descripcion:
      "La mano y el pie se organizan en tres filas de huesos: carpianos o tarsianos (la base), metacarpianos o metatarsianos (la palma o el empeine) y falanges (los dedos). Se cuentan 8-5-14 en la mano y 7-5-14 en el pie.",
    pasos: [
      "Mano: 8 carpianos (huesos pequeños de la muñeca), 5 metacarpianos (la palma) y 14 falanges (los dedos).",
      "Pie: 7 tarsianos (talón y parte posterior del pie; entre ellos el calcáneo y el astrágalo), 5 metatarsianos y 14 falanges.",
      "Falanges: el pulgar de la mano y el dedo gordo del pie tienen 2; los otros cuatro dedos tienen 3 cada uno. Cuenta: 2 + 4 × 3 = 14.",
      "Regla: es el mismo esquema en las dos extremidades. La única diferencia de cifras está en la primera fila: 8 carpianos y 7 tarsianos.",
    ],
    visuales: [
      {
        tipo: "anatomia.esqueleto",
        despuesDePaso: 2,
        titulo: "De la muñeca a los dedos, y del talón a los dedos del pie",
        huesos: ["carpianos", "metacarpianos", "falanges_mano", "tarsianos", "metatarsianos", "falanges_pie"],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuántos carpianos tiene cada mano?",
        opciones: ["5", "7", "14", "8"],
        respuesta: "8",
        explicacion: "Son 8 huesos pequeños en la muñeca. En el pie, la primera fila (tarsianos) tiene 7.",
      },
      {
        pregunta: "¿Cuántas falanges tiene cada dedo de la mano, salvo el pulgar?",
        opciones: ["2", "3", "4", "5"],
        respuesta: "3",
        explicacion: "El pulgar tiene 2 y cada uno de los otros cuatro dedos tiene 3: en total 14.",
      },
      {
        pregunta: "¿Qué huesos forman la palma de la mano?",
        opciones: ["Carpianos", "Falanges", "Metacarpianos", "Metatarsianos"],
        respuesta: "Metacarpianos",
        explicacion: "Los 5 metacarpianos forman la palma; los carpianos están en la muñeca y las falanges en los dedos.",
      },
      {
        pregunta: "¿Cuántos tarsianos tiene cada pie?",
        opciones: ["7", "5", "8", "14"],
        respuesta: "7",
        explicacion: "El tarso tiene 7 huesos (entre ellos el calcáneo, el del talón). El pie tiene además 5 metatarsianos y 14 falanges.",
      },
    ],
  },
  {
    slug: "anatomia-columna-y-torax",
    grupo: "oseo",
    orden: 4,
    requierePro: false,
    nombre: "Columna y tórax: el horario 7-12-5",
    descripcion:
      "La columna se recuerda con un horario: 7 vértebras cervicales, 12 torácicas y 5 lumbares (7-12-5), más el sacro y el cóccix. Cada vértebra torácica se une a un par de costillas: 12 pares.",
    pasos: [
      "De arriba abajo: 7 cervicales (el cuello), 12 torácicas (la espalda alta, donde se unen las costillas), 5 lumbares (la espalda baja), el sacro (5 vértebras fusionadas en un hueso) y el cóccix (unas 4 vértebras fusionadas).",
      "Truco del horario: desayuno a las 7, almuerzo a las 12 y cena a las 5, o sea 7 - 12 - 5.",
      "Costillas: 12 pares, uno por cada vértebra torácica (24 costillas). Los pares 1 a 7 llegan hasta el esternón (verdaderas); los pares 8 a 10 se unen al cartílago de la costilla de arriba (falsas); los pares 11 y 12 no llegan por delante (flotantes). Simplificación: algunos textos llaman «falsas» a los pares 8 a 12.",
      "Cifras: 24 vértebras móviles (7 + 12 + 5) más el sacro y el cóccix dan unas 33 vértebras; el cóccix puede tener de 3 a 5, por eso a veces se lee 32 o 34.",
    ],
    visuales: [
      { tipo: "anatomia.esqueleto", despuesDePaso: 1, titulo: "La columna vertebral", huesos: ["columna"] },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Vértebras por región",
        grupos: [
          { nombre: "Cervicales", items: [{ texto: "7 vértebras", detalle: "cuello" }] },
          { nombre: "Torácicas", items: [{ texto: "12 vértebras", detalle: "espalda alta, con las costillas" }] },
          { nombre: "Lumbares", items: [{ texto: "5 vértebras", detalle: "espalda baja" }] },
          { nombre: "Sacro y cóccix", items: [{ texto: "Sacro (5 fusionadas)" }, { texto: "Cóccix (unas 4 fusionadas)" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuántas vértebras lumbares hay?",
        opciones: ["7", "12", "5", "4"],
        respuesta: "5",
        explicacion: "El horario 7-12-5 da las vértebras cervicales, torácicas y lumbares, en ese orden.",
      },
      {
        pregunta: "¿Por qué hay 12 pares de costillas?",
        opciones: [
          "Porque hay 12 vértebras torácicas y cada una se une a un par",
          "Porque hay 12 vértebras cervicales",
          "Porque el esternón tiene 12 partes",
          "Es una cifra sin relación con la columna",
        ],
        respuesta: "Porque hay 12 vértebras torácicas y cada una se une a un par",
        explicacion: "Cada vértebra torácica se articula con un par de costillas.",
      },
      {
        pregunta: "¿Qué pares de costillas se llaman flotantes?",
        opciones: ["Los pares 1 y 2", "Los pares 11 y 12", "Los pares 7 y 8", "Todos los pares"],
        respuesta: "Los pares 11 y 12",
        explicacion: "Los pares 11 y 12 no llegan al esternón ni al cartílago de otra costilla: quedan libres por delante.",
      },
      {
        pregunta: "¿Cuántas vértebras móviles tiene la columna (sin contar sacro ni cóccix)?",
        opciones: ["33", "24", "26", "12"],
        respuesta: "24",
        explicacion: "7 cervicales + 12 torácicas + 5 lumbares = 24.",
      },
    ],
  },
  {
    slug: "anatomia-clasificar-huesos-por-forma",
    grupo: "oseo",
    orden: 5,
    requierePro: false,
    nombre: "Clasifica los huesos por su forma",
    descripcion:
      "Hay cinco formas de hueso: largos, cortos, planos, irregulares y sesamoideos. Si reconoces la forma, deduces la función: los largos son palancas, los planos protegen, los cortos dan estabilidad.",
    pasos: [
      "Largos: más largos que anchos, funcionan como palancas. Fémur, húmero, tibia, peroné, radio y cúbito; también los metacarpianos, los metatarsianos y las falanges.",
      "Cortos: tan anchos como largos. Los carpianos y los tarsianos: dan estabilidad y algo de movimiento.",
      "Planos: láminas delgadas que protegen o dan superficie a los músculos. Frontal, parietales, occipital, esternón, escápula y costillas.",
      "Irregulares: forma compleja, como las vértebras, el esfenoides, el etmoides y la mandíbula. Sesamoideos: pequeños, dentro de un tendón; el mayor es la rótula. Simplificación: algunos huesos (como el temporal) mezclan formas y se clasifican distinto según el texto.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Cinco formas de hueso",
        grupos: [
          { nombre: "Largos", items: [{ texto: "Fémur" }, { texto: "Húmero" }, { texto: "Tibia" }, { texto: "Radio" }] },
          { nombre: "Cortos", items: [{ texto: "Carpianos" }, { texto: "Tarsianos" }] },
          { nombre: "Planos", items: [{ texto: "Frontal" }, { texto: "Parietal" }, { texto: "Esternón" }, { texto: "Escápula" }, { texto: "Costillas" }] },
          { nombre: "Irregulares", items: [{ texto: "Vértebras" }, { texto: "Esfenoides" }, { texto: "Etmoides" }, { texto: "Mandíbula" }] },
          { nombre: "Sesamoideos", items: [{ texto: "Rótula" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué forma tiene el fémur?",
        opciones: ["Corto", "Plano", "Largo", "Irregular"],
        respuesta: "Largo",
        explicacion: "Es mucho más largo que ancho y trabaja como palanca.",
      },
      {
        pregunta: "Los carpianos y los tarsianos son huesos...",
        opciones: ["Largos", "Cortos", "Planos", "Sesamoideos"],
        respuesta: "Cortos",
        explicacion: "Son tan anchos como largos: dan estabilidad a la muñeca y al tobillo.",
      },
      {
        pregunta: "El esternón, la escápula y las costillas son huesos...",
        opciones: ["Planos", "Largos", "Irregulares", "Cortos"],
        respuesta: "Planos",
        explicacion: "Son láminas que protegen los órganos del tórax y ofrecen superficie a los músculos.",
      },
      {
        pregunta: "La rótula es un hueso...",
        opciones: ["Largo", "Plano", "Sesamoideo", "Corto"],
        respuesta: "Sesamoideo",
        explicacion: "Está dentro de un tendón (el del cuádriceps) y es el hueso sesamoideo más grande.",
      },
    ],
  },
];
