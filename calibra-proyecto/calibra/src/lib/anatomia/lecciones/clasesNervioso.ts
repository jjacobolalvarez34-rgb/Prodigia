import type { ClaseAnatomia } from "./tipos";
import { FLUJO_ARCO_REFLEJO, FLUJO_IMPULSO, gruposParesPorTipo } from "@/lib/anatomia/datos";

// Clases (Pro) del sistema nervioso: 6 lecciones. Cubren los 4 términos de
// nivel bajo (cerebro, cerebelo, médula espinal, nervio periférico) y los
// 12 pares craneales de nivel alto. Cifras verificadas en lecciones.test.ts
// (12 pares craneales; 31 pares espinales = 8+12+5+5+1). Sin contenido
// médico: solo descripción de estructuras y funciones. Se dejó FUERA el
// tema «sentidos» (ojo, oído...) porque la práctica no evalúa ninguna
// estructura sensorial más allá de los pares craneales.
export const CLASES_NERVIOSO: ClaseAnatomia[] = [
  {
    slug: "anatomia-clase-neurona-y-sinapsis",
    grupo: "nervioso",
    orden: 1,
    requierePro: true,
    nombre: "La neurona y la sinapsis",
    descripcion:
      "Las partes de una neurona, cómo viaja el impulso nervioso, qué pasa en la sinapsis y la diferencia entre neurona y nervio.",
    pasos: [
      "El tejido nervioso está formado por neuronas, las células que transmiten señales, y por células de la glía, que las sostienen, las protegen y las nutren.",
      "Una neurona tiene un cuerpo celular (soma), con el núcleo; dendritas, ramificaciones que reciben señales; y un axón, una prolongación larga que las conduce hacia otras células y termina en los botones terminales. Muchos axones están cubiertos de mielina, una capa aislante que acelera el impulso.",
      "El impulso nervioso es una señal eléctrica (potencial de acción) que viaja por el axón. En la sinapsis, el espacio entre dos neuronas (o entre una neurona y un músculo), la señal pasa de forma química: el axón libera neurotransmisores, como la acetilcolina, que se unen a receptores de la célula siguiente.",
      "Por su función, las neuronas son sensitivas o aferentes (llevan la información desde los receptores hacia el sistema nervioso central), motoras o eferentes (llevan órdenes a los músculos y las glándulas) e interneuronas (conectan neuronas dentro del sistema nervioso central).",
      "Un nervio es un haz de axones envueltos en tejido conectivo que sale del sistema nervioso central: por eso es «periférico». Puede ser sensitivo, motor o mixto.",
      "Errores comunes: confundir neurona con nervio (el nervio es un conjunto de axones de muchas neuronas); creer que las neuronas se tocan directamente (hay un espacio, la sinapsis) y pensar que el impulso es una corriente eléctrica como la de un cable (es un cambio de cargas a través de la membrana).",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 1,
        titulo: "Partes de una neurona",
        grupos: [
          { nombre: "Recibe", items: [{ texto: "Dendritas", detalle: "ramificaciones que reciben señales" }] },
          { nombre: "Integra", items: [{ texto: "Cuerpo celular (soma)", detalle: "contiene el núcleo" }] },
          { nombre: "Conduce", items: [{ texto: "Axón", detalle: "prolongación larga; a menudo con mielina" }] },
          { nombre: "Transmite", items: [{ texto: "Botones terminales", detalle: "liberan neurotransmisores" }] },
        ],
      },
      { tipo: "anatomia.flujo", despuesDePaso: 2, titulo: "Camino del impulso nervioso", etapas: FLUJO_IMPULSO },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Tres tipos de neurona",
        grupos: [
          { nombre: "Sensitivas (aferentes)", items: [{ texto: "Llevan información al SNC" }] },
          { nombre: "Motoras (eferentes)", items: [{ texto: "Llevan órdenes a músculos y glándulas" }] },
          { nombre: "Interneuronas", items: [{ texto: "Conectan neuronas dentro del SNC" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué parte de la neurona recibe las señales de otras células?",
        opciones: ["Las dendritas", "El axón", "La mielina", "Los botones terminales"],
        respuesta: "Las dendritas",
        explicacion: "Las dendritas son ramificaciones que reciben señales; el axón las conduce hacia otras células.",
      },
      {
        pregunta: "¿Qué es la sinapsis?",
        opciones: [
          "Un tipo de neurona",
          "El espacio de comunicación entre dos células nerviosas (o con un músculo)",
          "La capa aislante del axón",
          "El líquido que rodea el encéfalo",
        ],
        respuesta: "El espacio de comunicación entre dos células nerviosas (o con un músculo)",
        explicacion: "En la sinapsis la señal pasa de forma química, con neurotransmisores.",
      },
      {
        pregunta: "¿Qué acelera el impulso nervioso a lo largo del axón?",
        opciones: ["La mielina", "El soma", "La glía", "El calcio óseo"],
        respuesta: "La mielina",
        explicacion: "Es una capa aislante que rodea muchos axones.",
      },
      {
        pregunta: "¿Qué neurona lleva la información desde un receptor hacia el sistema nervioso central?",
        opciones: ["Motora (eferente)", "Sensitiva (aferente)", "Interneurona", "Ninguna"],
        respuesta: "Sensitiva (aferente)",
        explicacion: "Aferente = llega al SNC; eferente = sale.",
      },
      {
        pregunta: "¿Qué es un nervio?",
        opciones: ["Una sola neurona muy larga", "Un haz de axones envueltos en tejido conectivo", "Una parte del cerebro", "Un tipo de músculo"],
        respuesta: "Un haz de axones envueltos en tejido conectivo",
        explicacion: "Un nervio reúne los axones de muchas neuronas.",
      },
    ],
  },
  {
    slug: "anatomia-clase-snc-y-snp",
    grupo: "nervioso",
    orden: 2,
    requierePro: true,
    nombre: "Sistema nervioso central y periférico",
    descripcion:
      "Las dos grandes divisiones del sistema nervioso, cómo se protege el central, los 12 pares craneales, los 31 pares espinales y la división somática y autónoma del periférico.",
    pasos: [
      "El sistema nervioso se divide en dos: el sistema nervioso central (SNC), formado por el encéfalo y la médula espinal, y el sistema nervioso periférico (SNP), formado por los nervios y ganglios que salen de ellos hacia el resto del cuerpo.",
      "El SNC está protegido por hueso (el cráneo y la columna vertebral), por tres capas de membranas llamadas meninges (duramadre, aracnoides y piamadre) y por el líquido cefalorraquídeo, que amortigua.",
      "El encéfalo incluye el cerebro, el cerebelo y el tronco encefálico. El cerebro es la parte más grande; el cerebelo coordina el equilibrio y el movimiento; el tronco encefálico conecta el encéfalo con la médula y controla funciones vitales. La médula espinal recorre el conducto vertebral.",
      "El SNP tiene 12 pares de nervios craneales (salen del encéfalo) y 31 pares de nervios espinales (salen de la médula: 8 cervicales, 12 torácicos, 5 lumbares, 5 sacros y 1 coccígeo).",
      "Según lo que controla, el SNP se divide en somático (movimientos voluntarios y sensibilidad consciente) y autónomo (funciones involuntarias: latidos, digestión, glándulas).",
      "Errores comunes: creer que los nervios craneales y espinales son parte del SNC (son periféricos, aunque nazcan en el SNC); creer que el cerebro es todo el sistema nervioso y pensar que hay 7 pares de nervios cervicales por haber 7 vértebras cervicales (son 8 pares).",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 2,
        titulo: "Central y periférico",
        grupos: [
          {
            nombre: "SNC (dentro del hueso)",
            items: [
              { texto: "Cerebro", detalle: "la parte más grande del encéfalo" },
              { texto: "Cerebelo", detalle: "equilibrio y coordinación" },
              { texto: "Médula espinal", detalle: "en el conducto vertebral" },
            ],
          },
          { nombre: "SNP (lo que sale)", items: [{ texto: "Nervio periférico", detalle: "12 pares craneales y 31 espinales" }] },
        ],
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "31 pares de nervios espinales",
        grupos: [
          { nombre: "Cervicales", items: [{ texto: "8 pares" }] },
          { nombre: "Torácicos", items: [{ texto: "12 pares" }] },
          { nombre: "Lumbares", items: [{ texto: "5 pares" }] },
          { nombre: "Sacros y coccígeo", items: [{ texto: "5 pares sacros" }, { texto: "1 par coccígeo" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuántas capas tienen las meninges?",
        opciones: ["2", "3", "4", "5"],
        respuesta: "3",
        explicacion: "Duramadre, aracnoides y piamadre.",
      },
      {
        pregunta: "¿Cuántos pares de nervios espinales hay?",
        opciones: ["12", "31", "24", "8"],
        respuesta: "31",
        explicacion: "8 cervicales, 12 torácicos, 5 lumbares, 5 sacros y 1 coccígeo.",
      },
      {
        pregunta: "¿Cuál de estas estructuras es parte del sistema nervioso central?",
        opciones: ["Nervio periférico", "Médula espinal", "Nervio craneal", "Ganglio"],
        respuesta: "Médula espinal",
        explicacion: "El SNC es el encéfalo más la médula espinal; los nervios son periféricos.",
      },
      {
        pregunta: "¿Qué parte del encéfalo coordina el equilibrio y el movimiento?",
        opciones: ["Cerebelo", "Cerebro", "Meninges", "Médula espinal"],
        respuesta: "Cerebelo",
        explicacion: "El cerebelo afina y coordina los movimientos.",
      },
      {
        pregunta: "¿Qué parte del sistema nervioso periférico controla las funciones involuntarias?",
        opciones: ["Somática", "Autónoma", "Craneal", "Cerebelosa"],
        respuesta: "Autónoma",
        explicacion: "El sistema autónomo regula los latidos, la digestión y las glándulas.",
      },
    ],
  },
  {
    slug: "anatomia-clase-encefalo",
    grupo: "nervioso",
    orden: 3,
    requierePro: true,
    nombre: "El encéfalo: cerebro, cerebelo y tronco encefálico",
    descripcion:
      "Las partes del encéfalo, los cuatro lóbulos del cerebro y sus funciones, el diencéfalo, el cerebelo y el tronco encefálico, de donde salen la mayoría de los pares craneales.",
    pasos: [
      "El encéfalo pesa alrededor de 1,4 kg en un adulto y tiene tres partes principales: el cerebro, el cerebelo y el tronco encefálico. Está dentro de la cavidad craneal.",
      "El cerebro se divide en dos hemisferios, derecho e izquierdo, unidos por el cuerpo calloso. Su superficie, la corteza cerebral, está plegada en circunvoluciones, lo que aumenta su superficie. Cada hemisferio tiene cuatro lóbulos.",
      "Lóbulos: el frontal (movimiento voluntario, planificación y lenguaje hablado), el parietal (sensibilidad del tacto, la presión y la posición del cuerpo), el temporal (audición y memoria) y el occipital (visión).",
      "Bajo la corteza está el diencéfalo, con el tálamo (retransmite las señales sensoriales) y el hipotálamo (regula la temperatura, el hambre, la sed y el sueño).",
      "El cerebelo está en la parte de atrás y de abajo, bajo el lóbulo occipital. Coordina el movimiento, el equilibrio y la postura: no inicia el movimiento, lo afina.",
      "El tronco encefálico (mesencéfalo, puente y bulbo raquídeo) conecta el encéfalo con la médula espinal y controla funciones vitales como la respiración y el ritmo cardíaco. De él salen los pares craneales III a XII (el XI recibe además fibras de la médula cervical); solo el I y el II nacen más arriba.",
      "Errores comunes: decir «cerebro» para todo el encéfalo; pensar que el cerebelo está delante o que «piensa» (coordina) y creer que usamos «solo el 10 %» del cerebro: es un mito, se usa en su conjunto.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 2,
        titulo: "Cuatro lóbulos",
        grupos: [
          { nombre: "Frontal", items: [{ texto: "Movimiento voluntario, planificación y lenguaje" }] },
          { nombre: "Parietal", items: [{ texto: "Tacto, presión y posición del cuerpo" }] },
          { nombre: "Temporal", items: [{ texto: "Audición y memoria" }] },
          { nombre: "Occipital", items: [{ texto: "Visión" }] },
        ],
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 5,
        titulo: "Tres partes del encéfalo",
        grupos: [
          { nombre: "Cerebro", items: [{ texto: "Pensamiento, movimiento voluntario y sentidos" }] },
          { nombre: "Cerebelo", items: [{ texto: "Coordinación, equilibrio y postura" }] },
          { nombre: "Tronco encefálico", items: [{ texto: "Respiración y ritmo cardíaco; salen los pares III a XII" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué lóbulo del cerebro se encarga principalmente de la visión?",
        opciones: ["Frontal", "Parietal", "Occipital", "Temporal"],
        respuesta: "Occipital",
        explicacion: "El lóbulo occipital, en la parte de atrás, procesa la información visual.",
      },
      {
        pregunta: "¿Qué estructura une los dos hemisferios cerebrales?",
        opciones: ["El cuerpo calloso", "El tálamo", "El bulbo raquídeo", "El cerebelo"],
        respuesta: "El cuerpo calloso",
        explicacion: "Es un haz de fibras que conecta el hemisferio derecho con el izquierdo.",
      },
      {
        pregunta: "¿Qué parte del encéfalo coordina el equilibrio y la postura?",
        opciones: ["Cerebelo", "Corteza frontal", "Hipotálamo", "Cuerpo calloso"],
        respuesta: "Cerebelo",
        explicacion: "Está bajo el occipital y afina los movimientos.",
      },
      {
        pregunta: "¿Qué funciones vitales controla el tronco encefálico?",
        opciones: ["El lenguaje y la memoria", "La respiración y el ritmo cardíaco", "El tacto y la visión", "El equilibrio solamente"],
        respuesta: "La respiración y el ritmo cardíaco",
        explicacion: "Por eso es tan importante: conecta además el encéfalo con la médula.",
      },
      {
        pregunta: "¿De qué parte del encéfalo salen la mayoría de los pares craneales (III a XII)?",
        opciones: ["Del cerebelo", "Del tronco encefálico", "Del lóbulo frontal", "Del cuerpo calloso"],
        respuesta: "Del tronco encefálico",
        explicacion: "Solo el I (olfatorio) y el II (óptico) nacen más arriba.",
      },
    ],
  },
  {
    slug: "anatomia-clase-medula-y-reflejos",
    grupo: "nervioso",
    orden: 4,
    requierePro: true,
    nombre: "La médula espinal y los reflejos",
    descripcion:
      "La médula espinal: dónde está, sustancia gris y blanca, raíces dorsal y ventral, y cómo funciona un arco reflejo.",
    pasos: [
      "La médula espinal es un cordón de tejido nervioso de unos 45 cm que recorre el conducto vertebral. Empieza en el bulbo raquídeo y, en el adulto, termina a la altura de las vértebras L1-L2; más abajo, los nervios continúan como un manojo llamado cola de caballo.",
      "En un corte se ve una zona interior en forma de mariposa (o de H), la sustancia gris, con cuerpos de neuronas, rodeada de sustancia blanca: axones con mielina que forman las vías que suben al encéfalo y bajan de él.",
      "De la médula salen 31 pares de nervios espinales. Cada uno se forma con dos raíces: la raíz dorsal (posterior), que trae la información sensitiva, y la raíz ventral (anterior), que lleva las órdenes motoras. Fuera de la médula se unen en un nervio mixto.",
      "Un reflejo es una respuesta rápida e involuntaria cuya señal se procesa en la médula sin esperar al cerebro. El arco reflejo tiene cinco partes: receptor, neurona sensitiva, centro integrador (la médula), neurona motora y efector. Ejemplo: el reflejo rotuliano, en el que un golpe suave en el tendón bajo la rótula hace que la pierna se extienda sola.",
      "Además de los reflejos, la médula es una vía de comunicación: las señales sensitivas suben al encéfalo y las órdenes voluntarias bajan a los músculos. El nivel de la médula por el que sale cada nervio determina qué zona del cuerpo controla.",
      "Errores comunes: creer que la médula llega hasta el final de la columna (termina hacia L1-L2); creer que todos los reflejos pasan por el cerebro y creer que un nervio espinal es solo sensitivo o solo motor (es mixto).",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 2,
        titulo: "Cómo se forma un nervio espinal",
        grupos: [
          { nombre: "Raíz dorsal (posterior)", items: [{ texto: "Sensitiva", detalle: "entra a la médula" }] },
          { nombre: "Raíz ventral (anterior)", items: [{ texto: "Motora", detalle: "sale de la médula" }] },
          { nombre: "Nervio espinal", items: [{ texto: "Mixto", detalle: "une las dos raíces" }] },
        ],
      },
      { tipo: "anatomia.flujo", despuesDePaso: 3, titulo: "Arco reflejo", etapas: FLUJO_ARCO_REFLEJO },
    ],
    quiz: [
      {
        pregunta: "¿Por qué raíz entra la información sensitiva a la médula?",
        opciones: ["Ventral", "Dorsal", "Ninguna, entra por el cerebro", "Por las dos"],
        respuesta: "Dorsal",
        explicacion: "La raíz dorsal es sensitiva; la ventral, motora.",
      },
      {
        pregunta: "¿Qué contiene la sustancia gris de la médula?",
        opciones: ["Cuerpos de neuronas", "Solo mielina", "Hueso", "Líquido cefalorraquídeo"],
        respuesta: "Cuerpos de neuronas",
        explicacion: "La sustancia blanca está formada por axones con mielina.",
      },
      {
        pregunta: "¿Cuántos pares de nervios espinales salen de la médula?",
        opciones: ["12", "24", "31", "33"],
        respuesta: "31",
        explicacion: "8 + 12 + 5 + 5 + 1 = 31.",
      },
      {
        pregunta: "¿Dónde se procesa un reflejo simple?",
        opciones: ["En la médula espinal", "En el lóbulo occipital", "En el cerebelo", "En el receptor"],
        respuesta: "En la médula espinal",
        explicacion: "Por eso es más rápido: no espera al cerebro.",
      },
      {
        pregunta: "¿A qué altura termina la médula espinal en el adulto?",
        opciones: ["Al final del sacro", "En L1-L2", "En C1", "En T1"],
        respuesta: "En L1-L2",
        explicacion: "Más abajo solo hay nervios (la cola de caballo).",
      },
    ],
  },
  {
    slug: "anatomia-clase-pares-craneales",
    grupo: "nervioso",
    orden: 5,
    requierePro: true,
    nombre: "Los 12 pares craneales",
    descripcion:
      "Cada par craneal con su número, su nombre, su función y su tipo (sensitivo, motor o mixto): olfatorio, óptico, oculomotor, troclear, trigémino, abducens, facial, vestibulococlear, glosofaríngeo, vago, accesorio e hipogloso.",
    pasos: [
      "Los pares craneales son 12 pares de nervios que salen directamente del encéfalo, sobre todo del tronco encefálico, y pasan por agujeros del cráneo. Se nombran con números romanos, de adelante hacia atrás. Cada uno puede ser sensitivo, motor o mixto.",
      "Sensitivos: I olfatorio (olfato), II óptico (visión) y VIII vestibulococlear (audición y equilibrio).",
      "Motores: III oculomotor (mueve el ojo y sube el párpado; cierra la pupila), IV troclear (mueve el ojo), VI abducens (lleva el ojo hacia afuera), XI accesorio (mueve el trapecio y el esternocleidomastoideo) y XII hipogloso (mueve la lengua).",
      "Mixtos: V trigémino (sensibilidad de la cara y músculos de la masticación), VII facial (expresión facial, gusto de la parte anterior de la lengua, lágrimas y saliva), IX glosofaríngeo (gusto de la parte posterior de la lengua y deglución) y X vago (corazón, pulmones y aparato digestivo; voz y deglución).",
      "Los ojos usan cuatro pares: el II para ver y el III, IV y VI para moverlos. La lengua usa tres: el VII y el IX para el gusto y el XII para moverse. El vago es el más largo: llega hasta el abdomen.",
      "Simplificación de nivel colegio: la clasificación en sensitivo, motor y mixto es la clásica; además, algunos pares llevan fibras del sistema autónomo (III, VII, IX y X) y el XI se describe de distinta forma según el texto. Errores comunes: confundir el abducens con el accesorio y creer que el nervio óptico mueve el ojo (solo lleva la visión).",
    ],
    visuales: [
      { tipo: "anatomia.grupos", despuesDePaso: 3, titulo: "Los 12 pares, por función", grupos: gruposParesPorTipo(true) },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 4,
        titulo: "Ojos y lengua",
        grupos: [
          {
            nombre: "Ojos",
            items: [
              { texto: "Óptico", marca: "II", detalle: "ver" },
              { texto: "Oculomotor", marca: "III", detalle: "mover" },
              { texto: "Troclear", marca: "IV", detalle: "mover" },
              { texto: "Abducens", marca: "VI", detalle: "mover" },
            ],
          },
          {
            nombre: "Lengua",
            items: [
              { texto: "Facial", marca: "VII", detalle: "gusto (parte anterior)" },
              { texto: "Glosofaríngeo", marca: "IX", detalle: "gusto (parte posterior)" },
              { texto: "Hipogloso", marca: "XII", detalle: "movimiento" },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué nervio craneal lleva la información de la visión?",
        opciones: ["Óptico (II)", "Oculomotor (III)", "Trigémino (V)", "Vago (X)"],
        respuesta: "Óptico (II)",
        explicacion: "El óptico es sensitivo; el oculomotor solo mueve el ojo.",
      },
      {
        pregunta: "¿Qué par craneal es el motor de la lengua?",
        opciones: ["Facial (VII)", "Glosofaríngeo (IX)", "Hipogloso (XII)", "Vago (X)"],
        respuesta: "Hipogloso (XII)",
        explicacion: "Hipogloso: «debajo de la lengua»; la mueve.",
      },
      {
        pregunta: "¿Qué par mixto lleva la sensibilidad de la cara y mueve los músculos de la masticación?",
        opciones: ["Trigémino (V)", "Facial (VII)", "Accesorio (XI)", "Abducens (VI)"],
        respuesta: "Trigémino (V)",
        explicacion: "Tiene tres ramas: oftálmica, maxilar y mandibular.",
      },
      {
        pregunta: "¿Qué par lleva el ojo hacia afuera?",
        opciones: ["Troclear (IV)", "Oculomotor (III)", "Abducens (VI)", "Óptico (II)"],
        respuesta: "Abducens (VI)",
        explicacion: "Abducir es alejar del centro: mueve el ojo hacia afuera.",
      },
      {
        pregunta: "¿Cuántos pares craneales son sensitivos (según la clasificación clásica)?",
        opciones: ["3", "4", "5", "12"],
        respuesta: "3",
        explicacion: "Olfatorio (I), óptico (II) y vestibulococlear (VIII).",
      },
    ],
  },
  {
    slug: "anatomia-clase-sistema-autonomo",
    grupo: "nervioso",
    orden: 6,
    requierePro: true,
    nombre: "El sistema nervioso autónomo: simpático y parasimpático",
    descripcion:
      "Qué controla el sistema autónomo y cómo se reparten el trabajo sus dos divisiones: la simpática («lucha o huida») y la parasimpática («reposo y digestión»).",
    pasos: [
      "El sistema nervioso autónomo controla funciones involuntarias: los latidos, la respiración, la digestión, el tamaño de la pupila y las glándulas. Actúa sobre músculo liso, músculo cardíaco y glándulas, y forma parte del sistema nervioso periférico.",
      "Tiene dos divisiones que suelen actuar de forma opuesta: la simpática y la parasimpática.",
      "La simpática es la de «lucha o huida»: prepara al cuerpo para la acción. Aumenta la frecuencia cardíaca, dilata las pupilas y los bronquios y reduce la actividad digestiva. Su neurotransmisor principal en los órganos es la noradrenalina. Sus nervios salen de la médula torácica y de la lumbar alta.",
      "La parasimpática es la de «reposo y digestión»: ahorra energía. Disminuye la frecuencia cardíaca, contrae las pupilas y estimula la digestión. Su neurotransmisor es la acetilcolina. Sus fibras salen del tronco encefálico (con los pares craneales III, VII, IX y X) y de la médula sacra. El nervio vago (X) es el gran nervio parasimpático: llega al corazón, los pulmones y el aparato digestivo.",
      "La mayoría de los órganos reciben las dos divisiones y su actividad resulta de un equilibrio, como los pares de músculos agonista y antagonista. Simplificación: hay excepciones, y existe además un sistema nervioso entérico propio del intestino.",
      "Errores comunes: creer que el sistema autónomo es un sistema aparte del sistema nervioso (es parte del periférico); creer que la simpática solo actúa ante el miedo (siempre tiene cierta actividad) y confundir simpático con parasimpático.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Dos divisiones, efectos opuestos",
        grupos: [
          {
            nombre: "Simpático: lucha o huida",
            items: [
              { texto: "Corazón", detalle: "acelera los latidos" },
              { texto: "Pupilas", detalle: "las dilata" },
              { texto: "Bronquios", detalle: "los dilata" },
              { texto: "Digestión", detalle: "la reduce" },
            ],
          },
          {
            nombre: "Parasimpático: reposo y digestión",
            items: [
              { texto: "Corazón", detalle: "disminuye los latidos" },
              { texto: "Pupilas", detalle: "las contrae" },
              { texto: "Digestión", detalle: "la estimula" },
              { texto: "Nervio vago (X)", detalle: "el principal nervio parasimpático" },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué división del sistema autónomo prepara al cuerpo para «lucha o huida»?",
        opciones: ["Parasimpática", "Simpática", "Somática", "Entérica"],
        respuesta: "Simpática",
        explicacion: "Acelera el corazón, dilata las pupilas y reduce la digestión.",
      },
      {
        pregunta: "¿Qué efecto tiene la parasimpática sobre la frecuencia cardíaca?",
        opciones: ["La aumenta", "La disminuye", "No tiene efecto", "La detiene"],
        respuesta: "La disminuye",
        explicacion: "Es la división de «reposo y digestión».",
      },
      {
        pregunta: "¿Cuál es el principal nervio craneal parasimpático?",
        opciones: ["Vago (X)", "Óptico (II)", "Hipogloso (XII)", "Trigémino (V)"],
        respuesta: "Vago (X)",
        explicacion: "Llega al corazón, los pulmones y el aparato digestivo.",
      },
      {
        pregunta: "¿Qué hace la simpática con las pupilas?",
        opciones: ["Las contrae", "Las dilata", "Las cierra", "No las controla"],
        respuesta: "Las dilata",
        explicacion: "La parasimpática, en cambio, las contrae.",
      },
      {
        pregunta: "¿Qué controla el sistema nervioso autónomo?",
        opciones: ["Los movimientos voluntarios", "Las funciones involuntarias", "Solo la visión", "Solo el equilibrio"],
        respuesta: "Las funciones involuntarias",
        explicacion: "Latidos, digestión, tamaño de la pupila y glándulas.",
      },
    ],
  },
];
