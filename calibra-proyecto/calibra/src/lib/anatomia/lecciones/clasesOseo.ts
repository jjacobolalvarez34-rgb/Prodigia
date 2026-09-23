import type { ClaseAnatomia } from "./tipos";

// Clases (Pro) del sistema óseo: 6 lecciones en orden de dependencia. Las
// cifras (206 huesos = 80 axiales + 126 apendiculares; cráneo 22 = 8 + 14;
// columna 7-12-5 + sacro + cóccix; miembro superior e inferior de 30 huesos
// cada uno) se verifican en lecciones.test.ts contra la tabla de
// referencia. Simplificaciones de nivel colegio marcadas en el texto.
export const CLASES_OSEO: ClaseAnatomia[] = [
  {
    slug: "anatomia-clase-posicion-y-planos",
    grupo: "oseo",
    orden: 1,
    requierePro: true,
    nombre: "Posición anatómica, planos y direcciones",
    descripcion:
      "El lenguaje común de la anatomía: la posición anatómica de referencia, los tres planos de corte y los términos de dirección (superior e inferior, anterior y posterior, medial y lateral, proximal y distal).",
    pasos: [
      "Toda descripción anatómica parte de la misma postura de referencia, la posición anatómica: de pie, de frente, con los brazos a los costados y las palmas hacia adelante. Aunque una persona real esté sentada o de lado, las palabras se refieren a esa postura. Derecha e izquierda son siempre las de la persona descrita, no las de quien mira.",
      "Tres planos de corte imaginarios ordenan el cuerpo. El plano sagital lo divide en derecha e izquierda. El plano coronal (o frontal) lo divide en una parte de adelante y otra de atrás. El plano transversal (u horizontal) lo divide en una parte de arriba y otra de abajo.",
      "Las direcciones se dicen en pares opuestos: superior (hacia la cabeza) e inferior (hacia los pies); anterior (adelante) y posterior (atrás); medial (hacia la línea media del cuerpo) y lateral (hacia el costado); proximal (más cerca de la raíz del miembro) y distal (más lejos); superficial y profundo.",
      "Ejemplos: el corazón está por encima (superior) del estómago; el esternón es anterior a la columna; en posición anatómica el radio es lateral al cúbito (queda del lado del pulgar); el codo es proximal respecto a la muñeca.",
      "Errores comunes: creer que «medial» significa «en el medio» de cualquier cosa (significa hacia la línea media del cuerpo); creer que «anterior» significa «antes» (significa delante); y usar «superior» e «inferior» para los miembros, donde se prefiere proximal y distal.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 1,
        titulo: "Los tres planos",
        grupos: [
          { nombre: "Sagital", items: [{ texto: "derecha | izquierda" }] },
          { nombre: "Coronal (frontal)", items: [{ texto: "anterior | posterior" }] },
          { nombre: "Transversal (horizontal)", items: [{ texto: "superior | inferior" }] },
        ],
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 2,
        titulo: "Direcciones, en pares",
        grupos: [
          { nombre: "Vertical", items: [{ texto: "Superior", detalle: "hacia la cabeza" }, { texto: "Inferior", detalle: "hacia los pies" }] },
          { nombre: "Adelante y atrás", items: [{ texto: "Anterior", detalle: "adelante" }, { texto: "Posterior", detalle: "atrás" }] },
          { nombre: "Respecto al centro", items: [{ texto: "Medial", detalle: "hacia la línea media" }, { texto: "Lateral", detalle: "hacia el costado" }] },
          { nombre: "En los miembros", items: [{ texto: "Proximal", detalle: "cerca de la raíz" }, { texto: "Distal", detalle: "lejos de la raíz" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué plano divide el cuerpo en una parte anterior y otra posterior?",
        opciones: ["Sagital", "Transversal", "Coronal (frontal)", "Medial"],
        respuesta: "Coronal (frontal)",
        explicacion: "El plano coronal separa el frente de la espalda; el sagital separa derecha e izquierda; el transversal, arriba y abajo.",
      },
      {
        pregunta: "¿Qué plano divide el cuerpo en derecha e izquierda?",
        opciones: ["Sagital", "Coronal", "Transversal", "Proximal"],
        respuesta: "Sagital",
        explicacion: "El plano sagital recorre el cuerpo de adelante hacia atrás, separando la mitad derecha de la izquierda.",
      },
      {
        pregunta: "En posición anatómica, el radio es ___ respecto al cúbito.",
        opciones: ["Medial", "Lateral", "Posterior", "Proximal"],
        respuesta: "Lateral",
        explicacion: "El radio queda del lado del pulgar, o sea hacia el costado; el cúbito queda del lado del meñique, más cerca de la línea media.",
      },
      {
        pregunta: "¿Cuál de estas afirmaciones es correcta?",
        opciones: [
          "La muñeca es proximal respecto al codo",
          "El codo es proximal respecto a la muñeca",
          "El pie es superior respecto a la rodilla",
          "La columna es anterior al esternón",
        ],
        respuesta: "El codo es proximal respecto a la muñeca",
        explicacion: "Proximal es más cerca de la raíz del miembro (el tronco); el codo está más cerca que la muñeca.",
      },
      {
        pregunta: "¿Qué describe la posición anatómica?",
        opciones: [
          "Sentado, con las manos sobre las rodillas",
          "De pie, de frente, con los brazos a los costados y las palmas hacia adelante",
          "Acostado boca abajo",
          "De pie, de espaldas, con los brazos cruzados",
        ],
        respuesta: "De pie, de frente, con los brazos a los costados y las palmas hacia adelante",
        explicacion: "Es la postura de referencia: todas las direcciones se describen como si el cuerpo estuviera así.",
      },
    ],
  },
  {
    slug: "anatomia-clase-tejido-oseo",
    grupo: "oseo",
    orden: 2,
    requierePro: true,
    nombre: "El hueso por dentro: funciones y tejido",
    descripcion:
      "Qué hace un hueso (sostén, protección, movimiento, reserva de minerales y formación de sangre), de qué está hecho, las partes de un hueso largo y las cinco formas de hueso.",
    pasos: [
      "El esqueleto adulto tiene 206 huesos (un recién nacido tiene más de 270, porque varios se fusionan al crecer). Sus funciones: sostén del cuerpo, protección de órganos (el cráneo y la caja torácica), palanca para el movimiento (los músculos tiran de los huesos), reserva de calcio y fósforo, y producción de células de la sangre en la médula ósea roja.",
      "El hueso es un tejido vivo. Su matriz combina colágeno, que da flexibilidad, y sales de calcio, que dan dureza. Tres tipos de células lo trabajan: los osteoblastos forman hueso nuevo, los osteocitos mantienen el hueso maduro y los osteoclastos lo reabsorben. Así el hueso se renueva durante toda la vida.",
      "Hay dos tipos de tejido óseo: el hueso compacto, denso, en la capa exterior, y el hueso esponjoso, con pequeñas cavidades, en el interior y sobre todo en los extremos. El esponjoso es más liviano y aloja la médula ósea roja.",
      "Un hueso largo, como el fémur, tiene la diáfisis (el cuerpo o eje), dos epífisis (los extremos, cubiertos de cartílago articular en la zona donde se une con otro hueso), el periostio (la membrana que lo envuelve, por donde entran vasos y nervios) y la cavidad medular (dentro de la diáfisis, con médula amarilla en el adulto). En los niños el hueso crece en longitud en el cartílago de crecimiento, entre la diáfisis y la epífisis.",
      "Por su forma, los huesos se clasifican en largos (fémur, húmero, tibia, peroné, radio, cúbito y falanges), cortos (carpianos y tarsianos), planos (frontal, parietales, occipital, esternón, escápula y costillas), irregulares (vértebras, esfenoides, etmoides y mandíbula) y sesamoideos (pequeños, dentro de un tendón: la rótula).",
      "Error común: pensar que el hueso es una pieza muerta y dura como una piedra. Es un tejido vivo, con vasos, nervios y células que lo renuevan; por eso puede repararse.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 0,
        titulo: "Cinco funciones del esqueleto",
        grupos: [
          { nombre: "Sostén y forma", items: [{ texto: "El cuerpo mantiene su postura" }] },
          { nombre: "Protección", items: [{ texto: "Cráneo: cerebro. Caja torácica: corazón y pulmones" }] },
          { nombre: "Movimiento", items: [{ texto: "Los músculos tiran de los huesos, que funcionan como palancas" }] },
          { nombre: "Reserva de minerales", items: [{ texto: "Calcio y fósforo" }] },
          { nombre: "Formación de sangre", items: [{ texto: "En la médula ósea roja" }] },
        ],
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Partes de un hueso largo",
        grupos: [
          { nombre: "Diáfisis", items: [{ texto: "El cuerpo o eje del hueso" }] },
          { nombre: "Epífisis", items: [{ texto: "Los dos extremos, con cartílago articular" }] },
          { nombre: "Periostio", items: [{ texto: "Membrana que lo envuelve" }] },
          { nombre: "Cavidad medular", items: [{ texto: "Hueco central con médula ósea" }] },
        ],
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 4,
        titulo: "Cinco formas de hueso",
        grupos: [
          { nombre: "Largos", items: [{ texto: "Fémur" }, { texto: "Húmero" }, { texto: "Tibia" }, { texto: "Peroné" }, { texto: "Radio" }, { texto: "Cúbito" }, { texto: "Falanges" }] },
          { nombre: "Cortos", items: [{ texto: "Carpianos" }, { texto: "Tarsianos" }] },
          { nombre: "Planos", items: [{ texto: "Frontal" }, { texto: "Parietal" }, { texto: "Occipital" }, { texto: "Esternón" }, { texto: "Escápula" }, { texto: "Costillas" }] },
          { nombre: "Irregulares", items: [{ texto: "Vértebras" }, { texto: "Esfenoides" }, { texto: "Etmoides" }, { texto: "Mandíbula" }] },
          { nombre: "Sesamoideos", items: [{ texto: "Rótula" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuántos huesos tiene el esqueleto de un adulto?",
        opciones: ["106", "206", "306", "270"],
        respuesta: "206",
        explicacion: "El adulto tiene 206 huesos; el recién nacido tiene más porque varios se fusionan durante el crecimiento.",
      },
      {
        pregunta: "¿Qué células forman hueso nuevo?",
        opciones: ["Osteoclastos", "Osteoblastos", "Neuronas", "Glóbulos rojos"],
        respuesta: "Osteoblastos",
        explicacion: "Los osteoblastos forman hueso; los osteoclastos lo reabsorben; los osteocitos lo mantienen.",
      },
      {
        pregunta: "¿Cómo se llama el cuerpo o eje de un hueso largo?",
        opciones: ["Epífisis", "Periostio", "Diáfisis", "Cartílago articular"],
        respuesta: "Diáfisis",
        explicacion: "La diáfisis es el eje; las epífisis son los dos extremos.",
      },
      {
        pregunta: "¿Dónde se producen las células de la sangre?",
        opciones: ["En la médula ósea roja", "En el periostio", "En el cartílago articular", "En los ligamentos"],
        respuesta: "En la médula ósea roja",
        explicacion: "La médula ósea roja, en el hueso esponjoso, fabrica glóbulos rojos, glóbulos blancos y plaquetas.",
      },
      {
        pregunta: "La rótula es un hueso...",
        opciones: ["Largo", "Plano", "Corto", "Sesamoideo"],
        respuesta: "Sesamoideo",
        explicacion: "Está incluida en un tendón (el del cuádriceps), como todos los sesamoideos.",
      },
    ],
  },
  {
    slug: "anatomia-clase-craneo",
    grupo: "oseo",
    orden: 3,
    requierePro: true,
    nombre: "El cráneo: 22 huesos y sus suturas",
    descripcion:
      "El cráneo tiene 22 huesos: 8 craneales que protegen el encéfalo y 14 faciales. Cada uno con su ubicación, más las suturas que los unen.",
    pasos: [
      "El cráneo se divide en neurocráneo (8 huesos que protegen el encéfalo) y viscerocráneo, la cara (14 huesos). Total: 22 huesos.",
      "Los 8 craneales son: frontal (1), parietales (2), temporales (2), occipital (1), esfenoides (1) y etmoides (1). El frontal forma la frente; los parietales, el techo y los lados; los temporales, las sienes (alojan el oído); el occipital, la nuca y la base, con el agujero magno por donde pasa la médula espinal; el esfenoides, con forma de mariposa, está en el centro de la base; el etmoides, entre las órbitas, forma parte de la nariz.",
      "Los 14 faciales son: 2 maxilares, 2 cigomáticos, 2 nasales, 2 lagrimales, 2 palatinos, 2 cornetes nasales inferiores, el vómer y la mandíbula. Los que evalúa Prodigia: el maxilar (la mandíbula superior, con los dientes de arriba), la mandíbula (la única móvil, con los dientes de abajo), el cigomático (el pómulo) y el nasal (el puente de la nariz).",
      "Las suturas son articulaciones inmóviles entre los huesos del cráneo: la coronal (entre el frontal y los parietales), la sagital (entre los dos parietales), la lambdoidea (entre los parietales y el occipital) y la escamosa (entre el temporal y el parietal). En el bebé, las fontanelas son espacios blandos entre los huesos, que se cierran durante los primeros años.",
      "Además, cada oído medio tiene 3 huesecillos (martillo, yunque y estribo, los huesos más pequeños del cuerpo) y en el cuello está el hioides, un hueso suelto que sostiene la lengua. No forman parte del cráneo, pero sí del esqueleto axial.",
      "Errores comunes: creer que maxilar y mandíbula son el mismo hueso (el maxilar es superior y fijo; la mandíbula es inferior y móvil) y olvidar que frontal, temporal y occipital son también nombres de músculos: el contexto dice si se habla del hueso o del músculo.",
    ],
    visuales: [
      { tipo: "anatomia.esqueleto", despuesDePaso: 0, titulo: "El cráneo", huesos: ["craneo"] },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 2,
        titulo: "8 craneales y los faciales que evalúa Prodigia",
        grupos: [
          {
            nombre: "8 huesos craneales",
            items: [
              { texto: "Frontal", detalle: "1: la frente" },
              { texto: "Parietal", detalle: "2: techo y lados" },
              { texto: "Temporal", detalle: "2: las sienes" },
              { texto: "Occipital", detalle: "1: nuca y base" },
              { texto: "Esfenoides", detalle: "1: centro de la base" },
              { texto: "Etmoides", detalle: "1: entre las órbitas" },
            ],
          },
          {
            nombre: "14 huesos faciales (los principales)",
            items: [
              { texto: "Maxilar", detalle: "2: mandíbula superior" },
              { texto: "Mandíbula", detalle: "1: inferior y móvil" },
              { texto: "Cigomático", detalle: "2: pómulos" },
              { texto: "Nasal", detalle: "2: puente de la nariz" },
            ],
          },
        ],
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Cuatro suturas",
        grupos: [
          { nombre: "Coronal", items: [{ texto: "frontal y parietales" }] },
          { nombre: "Sagital", items: [{ texto: "entre los dos parietales" }] },
          { nombre: "Lambdoidea", items: [{ texto: "parietales y occipital" }] },
          { nombre: "Escamosa", items: [{ texto: "temporal y parietal" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuántos huesos forman el cráneo en total (craneales y faciales)?",
        opciones: ["8", "14", "22", "28"],
        respuesta: "22",
        explicacion: "8 craneales más 14 faciales.",
      },
      {
        pregunta: "¿Qué hueso tiene el agujero por donde pasa la médula espinal?",
        opciones: ["Frontal", "Occipital", "Esfenoides", "Mandíbula"],
        respuesta: "Occipital",
        explicacion: "El agujero magno está en el occipital, en la base del cráneo.",
      },
      {
        pregunta: "¿Qué sutura une los dos huesos parietales?",
        opciones: ["Coronal", "Lambdoidea", "Sagital", "Escamosa"],
        respuesta: "Sagital",
        explicacion: "La sagital recorre el techo del cráneo, entre los dos parietales.",
      },
      {
        pregunta: "¿Cuál es el único hueso móvil del cráneo?",
        opciones: ["Maxilar", "Mandíbula", "Cigomático", "Etmoides"],
        respuesta: "Mandíbula",
        explicacion: "La mandíbula se articula con el temporal y permite abrir y cerrar la boca; el maxilar es fijo.",
      },
      {
        pregunta: "¿Cuál de estos es uno de los huesecillos del oído?",
        opciones: ["Esfenoides", "Estribo", "Cigomático", "Nasal"],
        respuesta: "Estribo",
        explicacion: "Martillo, yunque y estribo: el estribo es el hueso más pequeño del cuerpo.",
      },
    ],
  },
  {
    slug: "anatomia-clase-columna-y-torax",
    grupo: "oseo",
    orden: 4,
    requierePro: true,
    nombre: "Columna vertebral y caja torácica",
    descripcion:
      "Las regiones de la columna (7-12-5 más sacro y cóccix), cómo es una vértebra, las curvas de la espalda y la caja torácica con sus 12 pares de costillas.",
    pasos: [
      "La columna vertebral tiene unas 33 vértebras: 7 cervicales (C1 a C7), 12 torácicas (T1 a T12), 5 lumbares (L1 a L5), el sacro (5 vértebras fusionadas) y el cóccix (de 3 a 5 fusionadas, casi siempre 4). Las 24 primeras son móviles; sacro y cóccix se funden en un solo hueso cada uno. Regla del horario: 7 - 12 - 5.",
      "Las dos primeras cervicales tienen nombre propio: el atlas (C1), que sostiene el cráneo, y el axis (C2), cuyo diente permite girar la cabeza. Una vértebra típica tiene un cuerpo (adelante, soporta el peso), un arco con una apófisis espinosa (la que se palpa en la espalda) y un agujero; todos los agujeros juntos forman el conducto vertebral, por donde pasa la médula espinal.",
      "Vista de lado, la columna no es recta: tiene cuatro curvas. La cervical y la lumbar se curvan hacia adelante (lordosis); la torácica y la sacra, hacia atrás (cifosis). Las curvas reparten el peso y amortiguan. Entre una vértebra y otra hay discos intervertebrales de cartílago, que amortiguan y dan movilidad.",
      "La caja torácica está formada por el esternón (hueso plano en el centro del pecho, con manubrio, cuerpo y apófisis xifoides) y 12 pares de costillas unidas atrás a las vértebras torácicas. Los pares 1 a 7 son costillas verdaderas (llegan al esternón por su cartílago); los pares 8 a 10 son falsas (se unen al cartílago de la costilla de arriba); los pares 11 y 12 son flotantes (no llegan por delante). Simplificación: algunos textos llaman falsas a los pares 8 a 12.",
      "La caja torácica protege el corazón y los pulmones, y su movimiento junto con los músculos intercostales y el diafragma hace posible respirar. La columna, las costillas y el esternón son parte del esqueleto axial.",
      "Errores comunes: decir que hay 7 pares de costillas (son 12, aunque solo 7 sean verdaderas); creer que las costillas flotantes están sueltas (sí se unen atrás a la columna) y confundir el sacro y el cóccix con vértebras móviles.",
    ],
    visuales: [
      { tipo: "anatomia.esqueleto", despuesDePaso: 0, titulo: "La columna vertebral", huesos: ["columna"] },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 0,
        titulo: "Vértebras por región",
        grupos: [
          { nombre: "Cervicales", items: [{ texto: "7 vértebras", marca: "C", detalle: "cuello" }] },
          { nombre: "Torácicas", items: [{ texto: "12 vértebras", marca: "T", detalle: "con las costillas" }] },
          { nombre: "Lumbares", items: [{ texto: "5 vértebras", marca: "L", detalle: "espalda baja" }] },
          { nombre: "Sacro y cóccix", items: [{ texto: "Sacro", detalle: "5 fusionadas" }, { texto: "Cóccix", detalle: "unas 4 fusionadas" }] },
        ],
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Los 12 pares de costillas",
        grupos: [
          { nombre: "Verdaderas", items: [{ texto: "Pares 1 a 7", detalle: "llegan al esternón" }] },
          { nombre: "Falsas", items: [{ texto: "Pares 8 a 10", detalle: "se unen al cartílago de la costilla de arriba" }] },
          { nombre: "Flotantes", items: [{ texto: "Pares 11 y 12", detalle: "no llegan por delante" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuántas vértebras cervicales hay?",
        opciones: ["12", "5", "7", "4"],
        respuesta: "7",
        explicacion: "Hay 7 cervicales (cuello), 12 torácicas y 5 lumbares.",
      },
      {
        pregunta: "¿Cómo se llama la primera vértebra cervical, la que sostiene el cráneo?",
        opciones: ["Axis", "Atlas", "Sacro", "Cóccix"],
        respuesta: "Atlas",
        explicacion: "El atlas es C1; el axis es C2.",
      },
      {
        pregunta: "¿Qué pares de costillas son las verdaderas?",
        opciones: ["Los pares 1 a 7", "Los pares 8 a 10", "Los pares 11 y 12", "Todos los pares"],
        respuesta: "Los pares 1 a 7",
        explicacion: "Son las que llegan hasta el esternón por su propio cartílago.",
      },
      {
        pregunta: "¿Qué regiones de la columna se curvan hacia adelante (lordosis)?",
        opciones: ["Torácica y sacra", "Cervical y lumbar", "Solo la sacra", "Ninguna"],
        respuesta: "Cervical y lumbar",
        explicacion: "La cervical y la lumbar son lordosis; la torácica y la sacra, cifosis.",
      },
      {
        pregunta: "¿Qué estructura pasa por el conducto vertebral?",
        opciones: ["El esófago", "La médula espinal", "El corazón", "El diafragma"],
        respuesta: "La médula espinal",
        explicacion: "Los agujeros de las vértebras forman un conducto que protege la médula espinal.",
      },
    ],
  },
  {
    slug: "anatomia-clase-esqueleto-apendicular",
    grupo: "oseo",
    orden: 5,
    requierePro: true,
    nombre: "Cinturas y extremidades: el esqueleto apendicular",
    descripcion:
      "El esqueleto se divide en axial (80 huesos) y apendicular (126): las cinturas escapular y pélvica, el miembro superior y el inferior, con sus 30 huesos por lado.",
    pasos: [
      "El esqueleto se divide en axial (el eje del cuerpo: cráneo, columna, costillas y esternón, con 80 huesos) y apendicular (los apéndices: las cinturas y las extremidades, con 126 huesos). 80 + 126 = 206.",
      "La cintura escapular une el brazo al tronco: la clavícula (adelante, con forma de S) y la escápula u omóplato (hueso plano en la espalda). Cada miembro superior tiene 30 huesos: húmero (brazo), radio y cúbito (antebrazo) y la mano, con 8 carpianos, 5 metacarpianos y 14 falanges.",
      "La cintura pélvica está formada por dos huesos coxales (cada uno con tres partes: ilion, isquion y pubis). Junto con el sacro y el cóccix forman la pelvis, que sostiene el peso del tronco y protege órganos como la vejiga. En promedio es más ancha en la mujer.",
      "Cada miembro inferior tiene 30 huesos: fémur (muslo), rótula (delante de la rodilla), tibia y peroné (pierna) y el pie, con 7 tarsianos, 5 metatarsianos y 14 falanges. El fémur es el hueso más largo y más fuerte del cuerpo.",
      "Cuentas del esqueleto apendicular: las cinturas suman 6 huesos (2 clavículas, 2 escápulas y 2 coxales), los dos miembros superiores 60 y los dos miembros inferiores 60. Total: 126.",
      "Errores comunes: llamar «pelvis» a un solo hueso (es un conjunto de cuatro: dos coxales, el sacro y el cóccix); confundir el húmero (brazo) con el fémur (muslo) y olvidar que la primera fila del pie tiene 7 huesos y la de la mano, 8.",
    ],
    visuales: [
      {
        tipo: "anatomia.esqueleto",
        despuesDePaso: 1,
        titulo: "Miembro superior",
        huesos: ["humero", "radio", "cubito", "carpianos", "metacarpianos", "falanges_mano"],
      },
      {
        tipo: "anatomia.esqueleto",
        despuesDePaso: 3,
        titulo: "Pelvis y miembro inferior",
        huesos: ["pelvis", "femur", "tibia", "perone", "tarsianos", "metatarsianos", "falanges_pie"],
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 4,
        titulo: "126 huesos apendiculares",
        grupos: [
          { nombre: "Cinturas", items: [{ texto: "6 huesos", detalle: "2 clavículas, 2 escápulas, 2 coxales" }] },
          { nombre: "Miembros superiores", items: [{ texto: "60 huesos", detalle: "30 por lado" }] },
          { nombre: "Miembros inferiores", items: [{ texto: "60 huesos", detalle: "30 por lado" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuántos huesos tiene el esqueleto apendicular?",
        opciones: ["80", "126", "206", "60"],
        respuesta: "126",
        explicacion: "80 axiales + 126 apendiculares = 206.",
      },
      {
        pregunta: "¿Qué dos huesos forman la cintura escapular?",
        opciones: ["Clavícula y escápula", "Húmero y radio", "Ilion y pubis", "Fémur y rótula"],
        respuesta: "Clavícula y escápula",
        explicacion: "La cintura escapular une el miembro superior al tronco con la clavícula y la escápula.",
      },
      {
        pregunta: "¿Qué huesos forman la pelvis?",
        opciones: ["Solo el sacro", "Los dos coxales, el sacro y el cóccix", "Los fémures y las tibias", "Las últimas costillas"],
        respuesta: "Los dos coxales, el sacro y el cóccix",
        explicacion: "La pelvis no es un hueso, sino un conjunto de cuatro.",
      },
      {
        pregunta: "¿Cuántos huesos tiene cada miembro superior?",
        opciones: ["30", "27", "60", "14"],
        respuesta: "30",
        explicacion: "1 húmero + 2 huesos del antebrazo + 27 de la mano (8 + 5 + 14).",
      },
      {
        pregunta: "¿Cuál es el hueso más largo y fuerte del cuerpo?",
        opciones: ["Húmero", "Tibia", "Fémur", "Peroné"],
        respuesta: "Fémur",
        explicacion: "El fémur es el hueso del muslo.",
      },
    ],
  },
  {
    slug: "anatomia-clase-articulaciones",
    grupo: "oseo",
    orden: 6,
    requierePro: true,
    nombre: "Las articulaciones: cómo se unen los huesos",
    descripcion:
      "Los tres tipos de articulación según su movilidad, las partes de una articulación sinovial, la diferencia entre ligamento y tendón y los movimientos básicos.",
    pasos: [
      "Una articulación es el lugar donde dos o más huesos se unen. Según su movilidad hay tres tipos: las fibrosas son casi inmóviles (las suturas del cráneo), las cartilaginosas son poco móviles (los discos entre las vértebras) y las sinoviales son muy móviles (hombro, codo, cadera, rodilla).",
      "Una articulación sinovial tiene cartílago articular (cubre los extremos de los huesos y reduce la fricción), una cápsula articular (la envuelve), una membrana sinovial que produce el líquido sinovial (lubrica y nutre) y ligamentos, que unen hueso con hueso. No confundas ligamento (hueso con hueso) con tendón (músculo con hueso).",
      "Tipos de articulación sinovial: la esférica, en el hombro y la cadera, se mueve en todas direcciones; la de bisagra, en el codo (y, con matices, la rodilla), hace flexión y extensión; la de pivote, entre el atlas y el axis, permite girar la cabeza; y la plana, entre los carpianos, permite deslizamientos. Simplificación: algunos textos clasifican la rodilla como bicondílea.",
      "Movimientos básicos: flexión (disminuye el ángulo entre dos huesos) y extensión (lo aumenta); abducción (alejar del plano medio) y aducción (acercar); rotación (girar sobre su eje) y circunducción (dibujar un círculo). Por ejemplo, el bíceps flexiona el codo y el tríceps lo extiende.",
      "Dos datos útiles: el hombro es la articulación con más libertad de movimiento y la rodilla es la más grande y compleja; esta última tiene además meniscos, láminas de cartílago que amortiguan.",
      "Errores comunes: creer que todas las articulaciones se mueven (las suturas del cráneo no) y llamar «hueso» al cartílago articular (es cartílago, otro tejido).",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 0,
        titulo: "Tres tipos de articulación",
        grupos: [
          { nombre: "Fibrosas (casi inmóviles)", items: [{ texto: "Suturas del cráneo" }] },
          { nombre: "Cartilaginosas (poco móviles)", items: [{ texto: "Discos entre las vértebras" }] },
          { nombre: "Sinoviales (muy móviles)", items: [{ texto: "Hombro" }, { texto: "Codo" }, { texto: "Cadera" }, { texto: "Rodilla" }] },
        ],
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 2,
        titulo: "Tipos de articulación sinovial",
        grupos: [
          { nombre: "Esférica", items: [{ texto: "Hombro y cadera", detalle: "todas las direcciones" }] },
          { nombre: "Bisagra", items: [{ texto: "Codo (y rodilla)", detalle: "flexión y extensión" }] },
          { nombre: "Pivote", items: [{ texto: "Atlas y axis", detalle: "girar la cabeza" }] },
          { nombre: "Plana", items: [{ texto: "Entre carpianos", detalle: "deslizamientos" }] },
        ],
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Movimientos en pares",
        grupos: [
          { nombre: "Flexión y extensión", items: [{ texto: "Flexión", detalle: "cierra el ángulo" }, { texto: "Extensión", detalle: "lo abre" }] },
          { nombre: "Abducción y aducción", items: [{ texto: "Abducción", detalle: "aleja del plano medio" }, { texto: "Aducción", detalle: "acerca" }] },
          { nombre: "Giros", items: [{ texto: "Rotación", detalle: "sobre su eje" }, { texto: "Circunducción", detalle: "dibuja un círculo" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "Las articulaciones entre los huesos del cráneo (suturas) son...",
        opciones: ["Sinoviales", "Fibrosas, casi inmóviles", "Esféricas", "De bisagra"],
        respuesta: "Fibrosas, casi inmóviles",
        explicacion: "Las suturas unen los huesos con tejido fibroso y prácticamente no permiten movimiento.",
      },
      {
        pregunta: "¿Qué une un ligamento?",
        opciones: ["Un músculo con un hueso", "Un hueso con otro hueso", "Dos músculos", "La piel con el hueso"],
        respuesta: "Un hueso con otro hueso",
        explicacion: "El tendón une músculo con hueso; el ligamento, hueso con hueso.",
      },
      {
        pregunta: "El hombro y la cadera son articulaciones...",
        opciones: ["De bisagra", "Planas", "Esféricas", "De pivote"],
        respuesta: "Esféricas",
        explicacion: "La cabeza redondeada de un hueso encaja en una cavidad: se mueve en todas direcciones.",
      },
      {
        pregunta: "¿Qué es la flexión?",
        opciones: ["Aumentar el ángulo entre dos huesos", "Disminuir el ángulo entre dos huesos", "Girar sobre el eje", "Alejar del plano medio"],
        respuesta: "Disminuir el ángulo entre dos huesos",
        explicacion: "Doblar el codo es una flexión; estirarlo, una extensión.",
      },
      {
        pregunta: "¿Para qué sirve el líquido sinovial?",
        opciones: ["Fabrica sangre", "Une los huesos entre sí", "Lubrica y nutre la articulación", "Da dureza al hueso"],
        respuesta: "Lubrica y nutre la articulación",
        explicacion: "Lo produce la membrana sinovial y reduce la fricción entre los cartílagos.",
      },
    ],
  },
];
