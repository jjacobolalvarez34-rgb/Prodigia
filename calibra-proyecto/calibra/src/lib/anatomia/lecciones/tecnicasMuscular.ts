import type { TecnicaAnatomia } from "./tipos";
import { ENTRADAS_MUSCULOS_GRANDES } from "@/lib/anatomia/datos";

// Técnicas del sistema muscular. Cubren los 19 músculos que evalúa la
// práctica (MUSCULAR_BAJO + MUSCULAR_ALTO). Acciones a nivel colegio
// (acción principal, no todas las acciones de cada músculo).
export const TECNICAS_MUSCULAR: TecnicaAnatomia[] = [
  {
    slug: "anatomia-simple-a-compuesto",
    grupo: "muscular",
    orden: 1,
    requierePro: false,
    nombre: "De lo simple a lo compuesto: primero el cuerpo, después la cabeza",
    descripcion:
      "Los músculos grandes (bíceps, cuádriceps, pectoral, trapecio...) son los que ya conoces por el ejercicio: empieza por esos. Los de la cabeza y el cuello son un grupo aparte, más fino: déjalos para cuando el primer grupo esté firme.",
    pasos: [
      "Grupo 1 (grande y cotidiano): bíceps, tríceps, deltoides, pectoral mayor, recto abdominal, trapecio, dorsal ancho, glúteos, cuádriceps y gastrocnemio.",
      "Domina ese grupo primero: son los que más se repiten y los que puedes notar en tu propio cuerpo al moverte.",
      "Grupo 2 (cabeza y cuello, más fino): frontal, orbicular de los ojos, orbicular de la boca, cigomático mayor, buccinador, masetero, temporal, occipital y platisma.",
      "Es el mismo truco que con los países en Geografía: lo grande y conocido primero, lo específico después.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 2,
        titulo: "Dos grupos, en este orden de estudio",
        grupos: [
          {
            nombre: "1. Cuerpo (grandes)",
            items: [
              { texto: "Bíceps" },
              { texto: "Tríceps" },
              { texto: "Deltoides" },
              { texto: "Pectoral mayor" },
              { texto: "Recto abdominal" },
              { texto: "Trapecio" },
              { texto: "Dorsal ancho" },
              { texto: "Glúteos" },
              { texto: "Cuádriceps" },
              { texto: "Gastrocnemio" },
            ],
          },
          {
            nombre: "2. Cabeza y cuello (finos)",
            items: [
              { texto: "Frontal" },
              { texto: "Orbicular de los ojos" },
              { texto: "Orbicular de la boca" },
              { texto: "Cigomático mayor" },
              { texto: "Buccinador" },
              { texto: "Masetero" },
              { texto: "Temporal" },
              { texto: "Occipital" },
              { texto: "Platisma" },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "Según esta técnica, ¿qué grupo de músculos conviene dominar primero?",
        opciones: [
          "Los de la cabeza y el cuello",
          "Los dos grupos a la vez, sin orden",
          "Los grandes y cotidianos (bíceps, cuádriceps, pectoral...)",
          "Ninguno en particular",
        ],
        respuesta: "Los grandes y cotidianos (bíceps, cuádriceps, pectoral...)",
        explicacion: "Son los que más se repiten y los más fáciles de reconocer en tu propio cuerpo.",
      },
      {
        pregunta: "¿Cuál de estos es un músculo del grupo grande y cotidiano?",
        opciones: ["Masetero", "Buccinador", "Cuádriceps", "Orbicular de la boca"],
        respuesta: "Cuádriceps",
        explicacion: "El cuádriceps está en el grupo 1, junto con bíceps, tríceps, pectoral mayor y trapecio.",
      },
      {
        pregunta: "¿Cuál de estos es un músculo del grupo de la cabeza y el cuello?",
        opciones: ["Bíceps", "Masetero", "Trapecio", "Glúteos"],
        respuesta: "Masetero",
        explicacion: "El masetero (masticación) está en la mejilla: es del grupo 2.",
      },
    ],
  },
  {
    slug: "anatomia-musculos-por-region",
    grupo: "muscular",
    orden: 2,
    requierePro: false,
    nombre: "Ubica cada músculo por región del cuerpo",
    descripcion:
      "En vez de una lista de 10 nombres, recórrelos por regiones, de arriba hacia abajo: hombro y pecho, brazo, tronco (por delante y por detrás), cadera y pierna.",
    pasos: [
      "Hombro y pecho: deltoides (el hombro redondeado) y pectoral mayor (el pecho).",
      "Brazo: el bíceps está por delante (flexiona el codo) y el tríceps por detrás (lo extiende).",
      "Tronco: el recto abdominal está por delante (los «cuadritos» del abdomen); por detrás, el trapecio cubre el cuello y la espalda alta y el dorsal ancho la espalda baja y lateral.",
      "Cadera y pierna: los glúteos en la cadera (por detrás), el cuádriceps en el muslo (por delante) y el gastrocnemio en la pantorrilla (por detrás). Este visual es un esquema de regiones, no un dibujo anatómico.",
    ],
    visuales: [
      { tipo: "anatomia.cuerpo", despuesDePaso: 3, titulo: "Cada músculo, en su región", entradas: ENTRADAS_MUSCULOS_GRANDES },
    ],
    quiz: [
      {
        pregunta: "¿Cuál de estos músculos está en la cara posterior (de atrás) del brazo?",
        opciones: ["Bíceps", "Deltoides", "Tríceps", "Pectoral mayor"],
        respuesta: "Tríceps",
        explicacion: "El tríceps está detrás del brazo; el bíceps está por delante.",
      },
      {
        pregunta: "¿Dónde está el gastrocnemio?",
        opciones: ["En el muslo, por delante", "En la pantorrilla, por detrás", "En el antebrazo", "En el abdomen"],
        respuesta: "En la pantorrilla, por detrás",
        explicacion: "Es el músculo de la pantorrilla: forma el «bulto» de la parte de atrás de la pierna.",
      },
      {
        pregunta: "¿Qué músculo ocupa la parte delantera del muslo?",
        opciones: ["Glúteos", "Cuádriceps", "Gastrocnemio", "Recto abdominal"],
        respuesta: "Cuádriceps",
        explicacion: "Cuádriceps = cuatro cabezas en la parte delantera del muslo.",
      },
      {
        pregunta: "¿Qué dos músculos cubren la espalda?",
        opciones: ["Trapecio y dorsal ancho", "Deltoides y pectoral mayor", "Bíceps y tríceps", "Recto abdominal y glúteos"],
        respuesta: "Trapecio y dorsal ancho",
        explicacion: "El trapecio cubre el cuello y la espalda alta; el dorsal ancho, la espalda baja y lateral.",
      },
    ],
  },
  {
    slug: "anatomia-nombre-por-forma-numero-y-accion",
    grupo: "muscular",
    orden: 3,
    requierePro: false,
    nombre: "Lee el nombre: forma, número, ubicación y acción",
    descripcion:
      "Muchos nombres de músculos describen algo: su forma (deltoides = triángulo), cuántas cabezas tiene (bíceps, tríceps, cuádriceps), dónde está (pectoral, glúteos) o lo que hace (masetero = masticador).",
    pasos: [
      "Forma: deltoides viene de la letra griega delta (un triángulo); trapecio, de la figura del trapecio; orbicular, de «orbe»: circular.",
      "Número de cabezas (orígenes): bíceps tiene 2, tríceps tiene 3 y cuádriceps tiene 4.",
      "Ubicación: pectoral (del latín pectus, pecho), glúteos (nalgas), frontal, temporal y occipital (la región que cubren). Gastrocnemio viene del griego «vientre de la pierna».",
      "Dirección y tamaño: recto abdominal (fibras verticales, en el abdomen), dorsal ancho (el ancho de la espalda), pectoral mayor (hay también uno menor).",
      "Acción: masetero viene del griego «masticador»; flexor y extensor dicen si doblan o estiran una articulación.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 4,
        titulo: "Del nombre a la pista",
        grupos: [
          {
            nombre: "Forma",
            items: [
              { texto: "Deltoides", detalle: "triángulo (delta)" },
              { texto: "Trapecio", detalle: "figura de trapecio" },
            ],
          },
          {
            nombre: "Número de cabezas",
            items: [
              { texto: "Bíceps", marca: "2" },
              { texto: "Tríceps", marca: "3" },
              { texto: "Cuádriceps", marca: "4" },
            ],
          },
          {
            nombre: "Ubicación y tamaño",
            items: [
              { texto: "Pectoral mayor", detalle: "pecho; el mayor" },
              { texto: "Glúteos", detalle: "nalgas" },
              { texto: "Dorsal ancho", detalle: "espalda, el más ancho" },
              { texto: "Recto abdominal", detalle: "fibras rectas, en el abdomen" },
              { texto: "Gastrocnemio", detalle: "«vientre de la pierna»" },
            ],
          },
          { nombre: "Acción", items: [{ texto: "Masetero", detalle: "«masticador»" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué indica que un músculo se llame «cuádriceps»?",
        opciones: ["Que tiene cuatro cabezas", "Que tiene cuatro huesos", "Que está en el cuarto piso muscular", "Que se contrae cuatro veces"],
        respuesta: "Que tiene cuatro cabezas",
        explicacion: "Bíceps (2), tríceps (3) y cuádriceps (4) cuentan las cabezas de origen del músculo.",
      },
      {
        pregunta: "«Deltoides» toma su nombre de...",
        opciones: ["Su acción", "Su número de cabezas", "La letra delta: tiene forma de triángulo", "El hueso donde se ancla"],
        respuesta: "La letra delta: tiene forma de triángulo",
        explicacion: "Es un ejemplo de nombre por forma, igual que trapecio.",
      },
      {
        pregunta: "Masetero viene del griego «masticador». ¿Qué hace este músculo?",
        opciones: ["Levanta el brazo", "Cierra la mandíbula para masticar", "Flexiona el codo", "Extiende la rodilla"],
        respuesta: "Cierra la mandíbula para masticar",
        explicacion: "El masetero es uno de los músculos de la masticación: eleva la mandíbula.",
      },
      {
        pregunta: "En «recto abdominal», ¿qué indica la palabra «recto»?",
        opciones: ["Que sus fibras son verticales", "Que es un músculo del recto (intestino)", "Que es el más fuerte", "Que solo se mueve en línea recta al caminar"],
        respuesta: "Que sus fibras son verticales",
        explicacion: "Recto describe la dirección de las fibras; abdominal, la región donde está.",
      },
    ],
  },
  {
    slug: "anatomia-agonista-y-antagonista",
    grupo: "muscular",
    orden: 4,
    requierePro: false,
    nombre: "Cada músculo tiene su opuesto",
    descripcion:
      "Un músculo solo puede tirar, no empujar, así que trabajan en pares opuestos: cuando el agonista se contrae, el antagonista se relaja. Bíceps y tríceps, cuádriceps e isquiotibiales, pectoral y dorsal.",
    pasos: [
      "Agonista es el músculo que hace el movimiento; antagonista es el que hace el movimiento contrario y devuelve el hueso a su posición. Saber uno te dice el otro.",
      "Codo: el bíceps lo flexiona (lo dobla) y el tríceps lo extiende (lo estira).",
      "Rodilla: el cuádriceps la extiende y los isquiotibiales, en la parte de atrás del muslo, la flexionan. Hombro: el pectoral mayor lleva el brazo hacia adelante y el dorsal ancho lo lleva hacia atrás y abajo.",
      "Pie: el gastrocnemio levanta el talón (te pones de puntas) y el tibial anterior levanta la punta del pie. Simplificación: en cada movimiento real participan también otros músculos ayudantes (sinergistas).",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Pares de músculos opuestos",
        grupos: [
          { nombre: "Codo", items: [{ texto: "Bíceps", marca: "flexiona" }, { texto: "Tríceps", marca: "extiende" }] },
          { nombre: "Rodilla", items: [{ texto: "Cuádriceps", marca: "extiende" }, { texto: "Isquiotibiales", marca: "flexionan" }] },
          {
            nombre: "Hombro",
            items: [
              { texto: "Pectoral mayor", detalle: "brazo hacia adelante" },
              { texto: "Dorsal ancho", detalle: "brazo hacia atrás y abajo" },
            ],
          },
          { nombre: "Pie", items: [{ texto: "Gastrocnemio", detalle: "levanta el talón" }, { texto: "Tibial anterior", detalle: "levanta la punta del pie" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué músculo extiende (estira) el codo?",
        opciones: ["Bíceps", "Tríceps", "Deltoides", "Gastrocnemio"],
        respuesta: "Tríceps",
        explicacion: "El tríceps extiende el codo; su antagonista, el bíceps, lo flexiona.",
      },
      {
        pregunta: "¿Cuál es el antagonista del cuádriceps?",
        opciones: ["Los isquiotibiales", "El bíceps", "El deltoides", "El recto abdominal"],
        respuesta: "Los isquiotibiales",
        explicacion: "El cuádriceps extiende la rodilla; los isquiotibiales (parte de atrás del muslo) la flexionan.",
      },
      {
        pregunta: "Al ponerte de puntas, ¿qué músculo de la pantorrilla trabaja?",
        opciones: ["Cuádriceps", "Glúteos", "Tibial anterior", "Gastrocnemio"],
        respuesta: "Gastrocnemio",
        explicacion: "El gastrocnemio levanta el talón; el tibial anterior hace lo contrario con la punta del pie.",
      },
      {
        pregunta: "El músculo que realiza el movimiento se llama...",
        opciones: ["Antagonista", "Agonista", "Tendón", "Ligamento"],
        respuesta: "Agonista",
        explicacion: "El agonista hace el movimiento; el antagonista se le opone y lo equilibra.",
      },
    ],
  },
  {
    slug: "anatomia-nombre-del-musculo",
    grupo: "muscular",
    orden: 5,
    requierePro: false,
    nombre: "El nombre del músculo ya te dice dónde está",
    descripcion:
      "Muchos nombres de músculos de la cabeza son literales: «orbicular» rodea una órbita (ojo o boca), «temporal» está en la sien y «occipital» en la nuca. Lee el nombre antes de memorizarlo.",
    pasos: [
      "Orbicular de los ojos: forma un círculo alrededor del ojo y cierra los párpados.",
      "Orbicular de la boca: el mismo patrón, alrededor de la boca; cierra y frunce los labios.",
      "Cigomático mayor: se ancla en el hueso cigomático (el pómulo) y sube la comisura de la boca: es el músculo de la sonrisa.",
      "Frontal (la frente), temporal (la sien) y occipital (la nuca) repiten el nombre del hueso que cubren. Cuidado: el mismo nombre sirve para el hueso y para el músculo; el contexto te dice cuál es.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "El nombre como pista",
        grupos: [
          {
            nombre: "Rodean algo",
            items: [
              { texto: "Orbicular de los ojos", detalle: "círculo alrededor del ojo" },
              { texto: "Orbicular de la boca", detalle: "círculo alrededor de la boca" },
            ],
          },
          { nombre: "Se anclan en un hueso", items: [{ texto: "Cigomático mayor", detalle: "hueso cigomático (pómulo)" }] },
          {
            nombre: "Cubren una zona",
            items: [
              { texto: "Frontal", detalle: "la frente" },
              { texto: "Temporal", detalle: "la sien" },
              { texto: "Occipital", detalle: "la nuca" },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Por qué se llama «orbicular» el músculo que rodea el ojo?",
        opciones: [
          "Porque forma un círculo alrededor del ojo",
          "Es un nombre arbitrario",
          "Porque solo se mueve en órbitas grandes",
          "Porque está dentro de la órbita ósea",
        ],
        respuesta: "Porque forma un círculo alrededor del ojo",
        explicacion: "El nombre describe la forma circular del músculo: la técnica es leer el nombre como pista.",
      },
      {
        pregunta: "El músculo temporal está en...",
        opciones: ["La nuca", "La sien", "El cuello", "La mandíbula inferior"],
        respuesta: "La sien",
        explicacion: "Temporal designa la región de la sien, a los lados de la cabeza.",
      },
      {
        pregunta: "¿Dónde se ancla el cigomático mayor?",
        opciones: ["En el hueso frontal", "En la mandíbula", "En el hueso cigomático (el pómulo)", "En el hueso occipital"],
        respuesta: "En el hueso cigomático (el pómulo)",
        explicacion: "El nombre señala directamente el hueso al que se une.",
      },
    ],
  },
  {
    slug: "anatomia-cara-expresion-y-masticacion",
    grupo: "muscular",
    orden: 6,
    requierePro: false,
    nombre: "Cabeza y cuello: los que expresan y los que mastican",
    descripcion:
      "Los 9 músculos de cabeza y cuello se dividen en dos grupos: los de la expresión (mueven la piel: frontal, orbiculares, cigomático mayor, buccinador, occipital, platisma) y los de la masticación (masetero y temporal, mueven la mandíbula).",
    pasos: [
      "Expresión facial: mueven la piel de la cara, no un hueso. Frontal (sube las cejas), orbicular de los ojos, orbicular de la boca, cigomático mayor (sonrisa) y buccinador (la mejilla: sopla y ayuda a mantener el alimento entre los dientes).",
      "Occipital (la parte de atrás del cuero cabelludo) y platisma (una lámina delgada en el cuello) también son de este grupo. Por eso la práctica los llama músculos de la cabeza o del cuello, no solo de la cara.",
      "Masticación: masetero (en la mejilla, sobre el ángulo de la mandíbula) y temporal (en la sien). Los dos elevan la mandíbula para cerrar la boca.",
      "Nervios: los de la expresión facial los mueve el nervio facial (VII); los de la masticación, el trigémino (V).",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Dos grupos, dos nervios",
        grupos: [
          {
            nombre: "Expresión (nervio facial, VII)",
            items: [
              { texto: "Frontal", detalle: "sube las cejas" },
              { texto: "Orbicular de los ojos", detalle: "cierra los párpados" },
              { texto: "Orbicular de la boca", detalle: "cierra y frunce los labios" },
              { texto: "Cigomático mayor", detalle: "sonrisa" },
              { texto: "Buccinador", detalle: "mejilla" },
              { texto: "Occipital", detalle: "nuca (cuero cabelludo)" },
              { texto: "Platisma", detalle: "cuello, superficial" },
            ],
          },
          {
            nombre: "Masticación (nervio trigémino, V)",
            items: [
              { texto: "Masetero", detalle: "mejilla; eleva la mandíbula" },
              { texto: "Temporal", detalle: "sien; eleva la mandíbula" },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuál de estos es un músculo de la masticación?",
        opciones: ["Cigomático mayor", "Frontal", "Platisma", "Masetero"],
        respuesta: "Masetero",
        explicacion: "Masetero y temporal elevan la mandíbula al masticar.",
      },
      {
        pregunta: "¿Qué nervio craneal mueve los músculos de la expresión facial?",
        opciones: ["Facial (VII)", "Trigémino (V)", "Vago (X)", "Óptico (II)"],
        respuesta: "Facial (VII)",
        explicacion: "El nervio facial inerva los músculos de la expresión; el trigémino, los de la masticación.",
      },
      {
        pregunta: "¿Qué hace el cigomático mayor?",
        opciones: ["Cierra los párpados", "Sube la comisura de la boca (sonrisa)", "Eleva la mandíbula", "Baja la lengua"],
        respuesta: "Sube la comisura de la boca (sonrisa)",
        explicacion: "Se ancla en el pómulo y tira de la comisura de la boca hacia arriba.",
      },
      {
        pregunta: "¿Dónde está el platisma?",
        opciones: ["En la frente", "En la nuca", "En el cuello, bajo la piel", "En la sien"],
        respuesta: "En el cuello, bajo la piel",
        explicacion: "Es una lámina superficial del cuello; por eso no es solo un músculo «de la cara».",
      },
    ],
  },
];
