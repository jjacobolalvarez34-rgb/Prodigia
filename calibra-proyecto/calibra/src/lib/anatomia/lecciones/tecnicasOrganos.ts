import type { TecnicaAnatomia } from "./tipos";
import {
  ENTRADAS_ORGANOS,
  FLUJO_AIRE,
  FLUJO_ALIMENTO,
  FLUJO_SANGRE,
  gruposCavidades,
} from "@/lib/anatomia/datos";

// Técnicas de órganos. Cubren los 10 órganos que evalúa la práctica
// (ORGANOS): corazón, pulmones, hígado, riñones, estómago, cerebro,
// intestino, páncreas, vejiga y bazo.
export const TECNICAS_ORGANOS: TecnicaAnatomia[] = [
  {
    slug: "anatomia-organos-por-cavidad",
    grupo: "organos",
    orden: 1,
    requierePro: false,
    nombre: "Los órganos, por cavidad",
    descripcion:
      "Los 10 órganos principales viven en 4 cavidades: craneal (cerebro), torácica (corazón, pulmones), abdominal (hígado, estómago, riñones, intestino, páncreas, bazo) y pélvica (vejiga). Ubícalos por cavidad, no como una lista suelta.",
    pasos: [
      "Craneal (dentro de la cabeza): el cerebro.",
      "Torácica (el pecho): el corazón y los pulmones.",
      "Abdominal (la «panza»): hígado, estómago, riñones, intestino, páncreas y bazo.",
      "Pélvica (la parte más baja del tronco): la vejiga. Simplificación: algunos órganos quedan detrás de la membrana que envuelve el abdomen (riñones, páncreas) y el tramo final del intestino, el recto, está en la pelvis; a nivel colegio se ubican en la cavidad abdominal.",
    ],
    visuales: [
      { tipo: "anatomia.grupos", despuesDePaso: 3, titulo: "Cuatro cavidades", grupos: gruposCavidades() },
      { tipo: "anatomia.cuerpo", despuesDePaso: 3, titulo: "Dónde queda cada órgano", entradas: ENTRADAS_ORGANOS },
    ],
    quiz: [
      {
        pregunta: "¿En qué cavidad está el hígado?",
        opciones: ["Torácica", "Abdominal", "Pélvica", "Craneal"],
        respuesta: "Abdominal",
        explicacion: "El hígado está en la cavidad abdominal, arriba a la derecha, junto con estómago, riñones, intestino, páncreas y bazo.",
      },
      {
        pregunta: "¿Qué órganos están en la cavidad torácica?",
        opciones: ["Hígado y estómago", "Corazón y pulmones", "Vejiga", "Cerebro"],
        respuesta: "Corazón y pulmones",
        explicacion: "El tórax (el pecho) contiene el corazón y los pulmones.",
      },
      {
        pregunta: "¿Cuál de estos órganos está en la cavidad pélvica?",
        opciones: ["Vejiga", "Riñones", "Bazo", "Páncreas"],
        respuesta: "Vejiga",
        explicacion: "La vejiga es el órgano de la lista que queda dentro de la pelvis.",
      },
      {
        pregunta: "¿Qué órgano de la lista vive en la cavidad craneal?",
        opciones: ["Corazón", "Cerebro", "Bazo", "Pulmones"],
        respuesta: "Cerebro",
        explicacion: "El cerebro está dentro del cráneo, protegido por los huesos craneales.",
      },
    ],
  },
  {
    slug: "anatomia-organos-por-aparato",
    grupo: "organos",
    orden: 2,
    requierePro: false,
    nombre: "Cada órgano, en su aparato",
    descripcion:
      "Además de la cavidad, cada órgano trabaja en un aparato: digestivo (estómago, intestino, hígado, páncreas), respiratorio (pulmones), circulatorio (corazón), excretor (riñones, vejiga), linfático (bazo) y nervioso (cerebro).",
    pasos: [
      "Digestivo: estómago e intestino forman el tubo por donde pasa el alimento; el hígado y el páncreas son glándulas que vierten sus jugos al intestino.",
      "Respiratorio: los pulmones. Circulatorio: el corazón, junto con los vasos sanguíneos.",
      "Excretor (urinario): los riñones filtran la sangre y forman la orina; la vejiga la almacena. Nervioso: el cerebro.",
      "Dos casos especiales: el bazo es del sistema linfático (filtra la sangre y ayuda a las defensas) y el páncreas, además de digestivo, es una glándula endocrina (produce insulina).",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Un aparato, sus órganos",
        grupos: [
          { nombre: "Digestivo", items: [{ texto: "Estómago" }, { texto: "Intestino" }, { texto: "Hígado" }, { texto: "Páncreas" }] },
          { nombre: "Respiratorio", items: [{ texto: "Pulmones" }] },
          { nombre: "Circulatorio", items: [{ texto: "Corazón" }] },
          { nombre: "Excretor (urinario)", items: [{ texto: "Riñones" }, { texto: "Vejiga" }] },
          { nombre: "Linfático", items: [{ texto: "Bazo" }] },
          { nombre: "Nervioso", items: [{ texto: "Cerebro" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿A qué aparato pertenecen los riñones y la vejiga?",
        opciones: ["Digestivo", "Respiratorio", "Excretor (urinario)", "Circulatorio"],
        respuesta: "Excretor (urinario)",
        explicacion: "Los riñones forman la orina y la vejiga la almacena: es el aparato excretor o urinario.",
      },
      {
        pregunta: "¿Cuál de estos órganos NO pertenece al aparato digestivo?",
        opciones: ["Estómago", "Pulmones", "Páncreas", "Hígado"],
        respuesta: "Pulmones",
        explicacion: "Los pulmones son del aparato respiratorio.",
      },
      {
        pregunta: "El bazo pertenece al sistema...",
        opciones: ["Digestivo", "Linfático (defensas)", "Excretor", "Nervioso"],
        respuesta: "Linfático (defensas)",
        explicacion: "El bazo filtra la sangre y participa en las defensas del cuerpo.",
      },
      {
        pregunta: "¿Qué dos funciones tiene el páncreas?",
        opciones: ["Digestiva y endocrina", "Respiratoria y excretora", "Circulatoria y nerviosa", "Solo digestiva"],
        respuesta: "Digestiva y endocrina",
        explicacion: "Produce jugo pancreático para digerir e insulina y glucagón, que son hormonas.",
      },
    ],
  },
  {
    slug: "anatomia-camino-del-alimento",
    grupo: "organos",
    orden: 3,
    requierePro: false,
    nombre: "El camino del alimento, de la boca al ano",
    descripcion:
      "Aprende el aparato digestivo como un recorrido: boca, faringe, esófago, estómago, intestino delgado, intestino grueso, recto y ano. Los órganos que están en el camino (estómago, intestino) y los que solo aportan jugos (hígado, páncreas) se distinguen fácil.",
    pasos: [
      "El alimento recorre un tubo: boca, faringe, esófago, estómago, intestino delgado, intestino grueso y recto y ano.",
      "En la boca masticas y la saliva empieza a digerir el almidón. El esófago solo transporta. En el estómago, el jugo gástrico (ácido) lo convierte en una pasta.",
      "En el intestino delgado se absorbe casi todo lo que el cuerpo aprovecha. En el intestino grueso se absorbe agua y se forman las heces.",
      "El hígado y el páncreas no están en el camino: son glándulas que vierten sus jugos (la bilis y el jugo pancreático) en el intestino delgado.",
    ],
    visuales: [{ tipo: "anatomia.flujo", despuesDePaso: 3, titulo: "Recorrido del alimento", etapas: FLUJO_ALIMENTO }],
    quiz: [
      {
        pregunta: "¿Qué órgano viene justo después del esófago?",
        opciones: ["Intestino delgado", "Faringe", "Hígado", "Estómago"],
        respuesta: "Estómago",
        explicacion: "El esófago lleva el alimento hasta el estómago.",
      },
      {
        pregunta: "¿Dónde se absorbe la mayor parte de los nutrientes?",
        opciones: ["Estómago", "Intestino delgado", "Intestino grueso", "Esófago"],
        respuesta: "Intestino delgado",
        explicacion: "El intestino delgado es el lugar principal de absorción de nutrientes.",
      },
      {
        pregunta: "¿Qué ocurre principalmente en el intestino grueso?",
        opciones: ["Se digiere la proteína", "Se produce la bilis", "Se absorbe agua y se forman las heces", "Se filtra la sangre"],
        respuesta: "Se absorbe agua y se forman las heces",
        explicacion: "El intestino grueso recupera agua y da forma a las heces.",
      },
      {
        pregunta: "¿Cuál de estos órganos NO forma parte del camino del alimento?",
        opciones: ["Estómago", "Esófago", "Hígado", "Intestino delgado"],
        respuesta: "Hígado",
        explicacion: "El alimento no pasa por el hígado: esta glándula solo vierte bilis en el intestino.",
      },
    ],
  },
  {
    slug: "anatomia-camino-del-aire",
    grupo: "organos",
    orden: 4,
    requierePro: false,
    nombre: "El camino del aire: de la nariz a los alvéolos",
    descripcion:
      "El aire recorre siempre el mismo camino: nariz, faringe, laringe, tráquea, bronquios, bronquiolos y alvéolos. En los alvéolos, dentro de los pulmones, el oxígeno pasa a la sangre.",
    pasos: [
      "Orden de las vías respiratorias: nariz, faringe, laringe, tráquea, bronquios, bronquiolos y alvéolos.",
      "Los alvéolos son sacos diminutos rodeados de capilares: allí el oxígeno pasa a la sangre y el dióxido de carbono sale.",
      "Los pulmones son dos y no son iguales: el derecho tiene 3 lóbulos y el izquierdo 2, porque comparte espacio con el corazón.",
      "El diafragma, un músculo bajo los pulmones, baja al inspirar y sube al espirar.",
    ],
    visuales: [{ tipo: "anatomia.flujo", despuesDePaso: 1, titulo: "Recorrido del aire", etapas: FLUJO_AIRE }],
    quiz: [
      {
        pregunta: "¿Dónde ocurre el intercambio de gases con la sangre?",
        opciones: ["En la tráquea", "En los alvéolos", "En la laringe", "En el diafragma"],
        respuesta: "En los alvéolos",
        explicacion: "Los alvéolos están rodeados de capilares: allí entra el oxígeno y sale el dióxido de carbono.",
      },
      {
        pregunta: "¿Cuántos lóbulos tiene el pulmón izquierdo?",
        opciones: ["3", "2", "4", "1"],
        respuesta: "2",
        explicacion: "El izquierdo tiene 2 lóbulos (el derecho tiene 3) porque deja lugar al corazón.",
      },
      {
        pregunta: "¿Qué estructura viene justo antes de los bronquios?",
        opciones: ["Laringe", "Alvéolos", "Tráquea", "Faringe"],
        respuesta: "Tráquea",
        explicacion: "La tráquea se divide en los dos bronquios, uno para cada pulmón.",
      },
      {
        pregunta: "¿Qué músculo baja cuando inspiras?",
        opciones: ["Recto abdominal", "Diafragma", "Trapecio", "Masetero"],
        respuesta: "Diafragma",
        explicacion: "Al bajar, el diafragma agranda el tórax y entra el aire.",
      },
    ],
  },
  {
    slug: "anatomia-camino-de-la-sangre",
    grupo: "organos",
    orden: 5,
    requierePro: false,
    nombre: "El camino de la sangre: dos circuitos, cuatro cavidades",
    descripcion:
      "El corazón tiene 4 cavidades (2 aurículas que reciben y 2 ventrículos que impulsan) y la sangre hace dos circuitos: el menor, por los pulmones, y el mayor, por el resto del cuerpo.",
    pasos: [
      "El corazón tiene 4 cavidades: 2 aurículas (arriba, reciben la sangre) y 2 ventrículos (abajo, la impulsan). El lado derecho maneja sangre pobre en oxígeno; el izquierdo, sangre oxigenada.",
      "Truco: las Arterias se Alejan del corazón; las Venas Vuelven a él. Cuidado: «arteria» no significa «sangre oxigenada»: las arterias pulmonares llevan sangre pobre en oxígeno.",
      "Circuito completo: aurícula derecha, ventrículo derecho, pulmones, aurícula izquierda, ventrículo izquierdo, cuerpo y de nuevo aurícula derecha.",
      "El ventrículo izquierdo tiene la pared más gruesa porque impulsa la sangre a todo el cuerpo.",
    ],
    visuales: [{ tipo: "anatomia.flujo", despuesDePaso: 2, titulo: "Un ciclo de la sangre", etapas: FLUJO_SANGRE, ciclo: true }],
    quiz: [
      {
        pregunta: "¿Qué cavidad del corazón impulsa la sangre al resto del cuerpo?",
        opciones: ["Aurícula derecha", "Ventrículo derecho", "Aurícula izquierda", "Ventrículo izquierdo"],
        respuesta: "Ventrículo izquierdo",
        explicacion: "Su pared gruesa impulsa la sangre oxigenada a través de la aorta.",
      },
      {
        pregunta: "¿Qué hacen las arterias?",
        opciones: ["Traen la sangre al corazón", "Sacan la sangre del corazón", "Almacenan la sangre", "Filtran la sangre"],
        respuesta: "Sacan la sangre del corazón",
        explicacion: "Arteria = se Aleja del corazón; vena = Vuelve al corazón.",
      },
      {
        pregunta: "¿Qué cavidad recibe la sangre oxigenada que viene de los pulmones?",
        opciones: ["Aurícula izquierda", "Aurícula derecha", "Ventrículo derecho", "Aorta"],
        respuesta: "Aurícula izquierda",
        explicacion: "Las venas pulmonares llevan la sangre oxigenada a la aurícula izquierda.",
      },
      {
        pregunta: "¿Cuántas cavidades tiene el corazón?",
        opciones: ["2", "3", "4", "6"],
        respuesta: "4",
        explicacion: "Dos aurículas y dos ventrículos.",
      },
    ],
  },
];
