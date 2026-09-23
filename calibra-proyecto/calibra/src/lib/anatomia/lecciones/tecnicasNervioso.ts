import type { TecnicaAnatomia } from "./tipos";
import { FLUJO_ARCO_REFLEJO, gruposParesEnOrden, gruposParesPorTipo } from "@/lib/anatomia/datos";

// Técnicas del sistema nervioso. Cubren los 4 términos de nivel bajo
// (cerebro, cerebelo, médula espinal, nervio periférico) y los 12 pares
// craneales de nivel alto que evalúa la práctica. La clasificación sensitivo
// / motor / mixto es la clásica de colegio (simplificación marcada).
export const TECNICAS_NERVIOSO: TecnicaAnatomia[] = [
  {
    slug: "anatomia-nervios-por-funcion",
    grupo: "nervioso",
    orden: 1,
    requierePro: false,
    nombre: "Pares craneales: agrúpalos por función, no por número",
    descripcion:
      "En vez de memorizar los 12 en fila, sepáralos en 3 grupos según lo que hacen: sensitivos (I olfatorio, II óptico, VIII vestibulococlear), motores (III oculomotor, IV troclear, VI abducens, XI accesorio, XII hipogloso) y mixtos (V trigémino, VII facial, IX glosofaríngeo, X vago).",
    pasos: [
      "Sensitivos (solo llevan información al encéfalo): I olfatorio, II óptico y VIII vestibulococlear.",
      "Motores (solo llevan órdenes a un músculo): III oculomotor, IV troclear, VI abducens, XI accesorio y XII hipogloso.",
      "Mixtos (hacen las dos cosas): V trigémino, VII facial, IX glosofaríngeo y X vago.",
      "Son 3 categorías de 3 a 5 pares en vez de una lista de 12. Simplificación: algunos pares «motores» llevan además fibras del sistema autónomo (el III cierra la pupila) y algunos textos clasifican distinto el XI; esta es la clasificación clásica de colegio.",
    ],
    visuales: [
      { tipo: "anatomia.grupos", despuesDePaso: 3, titulo: "Tres grupos de pares craneales", grupos: gruposParesPorTipo(false) },
    ],
    quiz: [
      {
        pregunta: "¿A qué grupo pertenece el nervio óptico (II), según esta técnica?",
        opciones: ["Motor", "Mixto", "Sensitivo"],
        respuesta: "Sensitivo",
        explicacion: "Junto con el olfatorio y el vestibulococlear, solo lleva información al encéfalo: no mueve nada.",
      },
      {
        pregunta: "¿Cuál de estos pares craneales es motor?",
        opciones: ["Óptico (II)", "Abducens (VI)", "Trigémino (V)", "Vago (X)"],
        respuesta: "Abducens (VI)",
        explicacion: "Junto con oculomotor, troclear, accesorio e hipogloso, solo lleva órdenes a músculos.",
      },
      {
        pregunta: "¿Qué tienen en común el trigémino, el facial, el glosofaríngeo y el vago?",
        opciones: ["Son todos sensitivos", "Son todos motores", "Son mixtos: llevan información y órdenes", "No se conoce su función"],
        respuesta: "Son mixtos: llevan información y órdenes",
        explicacion: "Es el tercer grupo de la técnica: los que hacen las dos cosas.",
      },
      {
        pregunta: "¿Cuántos pares craneales son mixtos?",
        opciones: ["3", "4", "5", "12"],
        respuesta: "4",
        explicacion: "Los mixtos son el V, VII, IX y X: cuatro pares.",
      },
    ],
  },
  {
    slug: "anatomia-pares-craneales-en-orden",
    grupo: "nervioso",
    orden: 2,
    requierePro: false,
    nombre: "Los 12 pares en orden: de tres en tres",
    descripcion:
      "Son 12 pares, se numeran con romanos de adelante hacia atrás y se recuerdan en cuatro tandas de tres: I-III, IV-VI, VII-IX y X-XII, cada una con su función.",
    pasos: [
      "Son 12 pares y se nombran con números romanos, de adelante hacia atrás.",
      "I a III: olfatorio (olfato), óptico (visión) y oculomotor (mueve el ojo).",
      "IV a VI: troclear (mueve el ojo), trigémino (sensibilidad de la cara y masticación) y abducens (lleva el ojo hacia afuera).",
      "VII a IX: facial (expresión de la cara), vestibulococlear (oído y equilibrio) y glosofaríngeo (gusto y deglución).",
      "X a XII: vago (corazón, pulmones y digestivo), accesorio (hombro y cuello) e hipogloso (lengua). Los pares de los ojos son el II, III, IV y VI: «ver y mover».",
    ],
    visuales: [{ tipo: "anatomia.grupos", despuesDePaso: 4, titulo: "Cuatro tandas de tres", grupos: gruposParesEnOrden() }],
    quiz: [
      {
        pregunta: "¿Qué nervio craneal es el par número II?",
        opciones: ["Olfatorio", "Óptico", "Oculomotor", "Troclear"],
        respuesta: "Óptico",
        explicacion: "El I es el olfatorio y el II es el óptico: los dos sentidos «a distancia» abren la lista.",
      },
      {
        pregunta: "¿Qué número tiene el nervio vago?",
        opciones: ["IX", "XI", "X", "VII"],
        respuesta: "X",
        explicacion: "Los últimos tres son X vago, XI accesorio y XII hipogloso.",
      },
      {
        pregunta: "¿Cuál es el par craneal XII?",
        opciones: ["Hipogloso", "Accesorio", "Glosofaríngeo", "Facial"],
        respuesta: "Hipogloso",
        explicacion: "El XII, hipogloso, mueve la lengua.",
      },
      {
        pregunta: "¿Cuál de estos pares NO mueve el ojo?",
        opciones: ["Oculomotor", "Troclear", "Abducens", "Facial"],
        respuesta: "Facial",
        explicacion: "Los que mueven el ojo son el III, IV y VI; el facial mueve los músculos de la expresión.",
      },
    ],
  },
  {
    slug: "anatomia-pares-craneales-nombre-pista",
    grupo: "nervioso",
    orden: 3,
    requierePro: false,
    nombre: "El nombre del nervio es una pista",
    descripcion:
      "Los nombres de los pares craneales vienen del griego y del latín y casi siempre dicen qué hacen o dónde van: oculomotor (mueve el ojo), trigémino (tres ramas), glosofaríngeo (lengua y faringe), hipogloso (bajo la lengua).",
    pasos: [
      "Oculomotor: «mueve el ojo» (ocular y motor). Troclear: mueve un músculo del ojo que pasa por una polea (tróclea). Abducens: abduce el ojo, o sea lo lleva hacia afuera.",
      "Trigémino: «tres gemelos», porque tiene tres ramas (oftálmica, maxilar y mandibular) que llevan la sensibilidad de la frente, la mejilla y la mandíbula.",
      "Vestibulococlear: el vestíbulo (equilibrio) y la cóclea (audición), las dos partes del oído interno. Glosofaríngeo: glosos es lengua, más la faringe. Hipogloso: hypo es «debajo», más glosos: corre por debajo de la lengua.",
      "Vago: del latín «vagabundo», porque recorre el cuello, el tórax y el abdomen. Accesorio: recibe fibras de la médula espinal además del encéfalo; mueve el trapecio y el esternocleidomastoideo.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "De la raíz del nombre a la función",
        grupos: [
          {
            nombre: "Los ojos",
            items: [
              { texto: "Oculomotor", marca: "III", detalle: "ocular + motor: mueve el ojo" },
              { texto: "Troclear", marca: "IV", detalle: "tróclea = polea" },
              { texto: "Abducens", marca: "VI", detalle: "abduce: lleva el ojo hacia afuera" },
            ],
          },
          { nombre: "La cara", items: [{ texto: "Trigémino", marca: "V", detalle: "tres ramas" }] },
          {
            nombre: "Oído, lengua y garganta",
            items: [
              { texto: "Vestibulococlear", marca: "VIII", detalle: "vestíbulo + cóclea" },
              { texto: "Glosofaríngeo", marca: "IX", detalle: "glosos (lengua) + faringe" },
              { texto: "Hipogloso", marca: "XII", detalle: "debajo (hypo) de la lengua" },
            ],
          },
          {
            nombre: "Cuerpo y cuello",
            items: [
              { texto: "Vago", marca: "X", detalle: "«vagabundo»: cuello, tórax y abdomen" },
              { texto: "Accesorio", marca: "XI", detalle: "trapecio y esternocleidomastoideo" },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué indica el nombre «trigémino»?",
        opciones: ["Que tiene tres ramas", "Que tiene tres núcleos en el ojo", "Que es el tercer par craneal", "Que mueve tres músculos"],
        respuesta: "Que tiene tres ramas",
        explicacion: "Tri = tres: la rama oftálmica, la maxilar y la mandibular.",
      },
      {
        pregunta: "¿Qué hace el nervio abducens (VI)?",
        opciones: ["Lleva el ojo hacia afuera", "Mueve la lengua", "Da el olfato", "Mueve el hombro"],
        respuesta: "Lleva el ojo hacia afuera",
        explicacion: "Abducir es alejar del centro: el abducens lleva el ojo hacia afuera.",
      },
      {
        pregunta: "«Hipogloso» significa «debajo de la lengua». ¿Qué mueve este nervio?",
        opciones: ["El ojo", "La mandíbula", "La lengua", "El hombro"],
        respuesta: "La lengua",
        explicacion: "El hipogloso (XII) es el nervio motor de la lengua.",
      },
      {
        pregunta: "¿Por qué el nervio X se llama «vago»?",
        opciones: [
          "Porque casi no hace nada",
          "Porque recorre el cuello, el tórax y el abdomen (vaga por el cuerpo)",
          "Porque solo sale por la espalda",
          "Porque nadie conoce su función",
        ],
        respuesta: "Porque recorre el cuello, el tórax y el abdomen (vaga por el cuerpo)",
        explicacion: "Vago viene del latín «errante»: es el nervio craneal que llega más lejos.",
      },
    ],
  },
  {
    slug: "anatomia-snc-vs-snp",
    grupo: "nervioso",
    orden: 4,
    requierePro: false,
    nombre: "Central o periférico: lo que está dentro del hueso y lo que sale",
    descripcion:
      "El sistema nervioso central (SNC) es el encéfalo y la médula espinal, protegidos por hueso. El sistema nervioso periférico (SNP) son los nervios que salen de ellos hacia todo el cuerpo.",
    pasos: [
      "Sistema nervioso central (SNC): encéfalo y médula espinal. Están protegidos por hueso: el encéfalo, dentro del cráneo, y la médula espinal, dentro de la columna vertebral.",
      "En el encéfalo: el cerebro (pensamiento, movimiento voluntario, sentidos) y el cerebelo (coordinación y equilibrio), además del tronco encefálico.",
      "Sistema nervioso periférico (SNP): todos los nervios que salen del SNC, los 12 pares craneales y los 31 pares espinales, y llegan hasta la piel, los músculos y los órganos.",
      "Regla: dentro del hueso es central; lo que sale es periférico. Cerebro, cerebelo y médula espinal son centrales; un nervio periférico es periférico.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Central y periférico",
        grupos: [
          {
            nombre: "Sistema nervioso central (dentro del hueso)",
            items: [
              { texto: "Cerebro", detalle: "pensamiento, movimiento voluntario y sentidos" },
              { texto: "Cerebelo", detalle: "coordinación y equilibrio" },
              { texto: "Médula espinal", detalle: "conduce las señales entre el encéfalo y el cuerpo" },
            ],
          },
          { nombre: "Sistema nervioso periférico (lo que sale)", items: [{ texto: "Nervio periférico", detalle: "craneal o espinal: lleva señales al cuerpo y desde el cuerpo" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "La médula espinal pertenece al sistema nervioso...",
        opciones: ["Periférico", "Central", "Digestivo", "Endocrino"],
        respuesta: "Central",
        explicacion: "El SNC es el encéfalo más la médula espinal.",
      },
      {
        pregunta: "¿Qué parte del encéfalo coordina el equilibrio y los movimientos?",
        opciones: ["Cerebelo", "Médula espinal", "Nervio periférico", "Bazo"],
        respuesta: "Cerebelo",
        explicacion: "El cerebelo está detrás y debajo del cerebro y coordina el equilibrio y la precisión del movimiento.",
      },
      {
        pregunta: "¿Cuántos pares de nervios craneales hay?",
        opciones: ["12", "31", "10", "8"],
        respuesta: "12",
        explicacion: "Hay 12 pares craneales (los 31 pares son los nervios espinales).",
      },
      {
        pregunta: "Un nervio periférico es una parte del sistema nervioso que...",
        opciones: ["Está dentro del cráneo", "Sale del sistema nervioso central hacia el cuerpo", "Solo existe en el cerebro", "Es lo mismo que la médula"],
        respuesta: "Sale del sistema nervioso central hacia el cuerpo",
        explicacion: "Los nervios periféricos conectan el SNC con la piel, los músculos y los órganos.",
      },
    ],
  },
  {
    slug: "anatomia-arco-reflejo",
    grupo: "nervioso",
    orden: 5,
    requierePro: false,
    nombre: "El arco reflejo: una respuesta que no espera al cerebro",
    descripcion:
      "Un reflejo es una respuesta rápida e involuntaria. Su camino tiene 5 pasos: receptor, neurona sensitiva, médula espinal, neurona motora y efector.",
    pasos: [
      "Un reflejo es una respuesta rápida e involuntaria: la señal no espera a que el cerebro decida.",
      "Camino: estímulo, receptor, neurona sensitiva (aferente), médula espinal, neurona motora (eferente) y efector (un músculo o una glándula).",
      "Truco: aferente significa que llega al sistema nervioso central (como un afluente que llega a un río); eferente significa que sale (como el egreso).",
      "Ejemplo: al tocar algo muy caliente retiras la mano antes de sentir dolor. El cerebro se entera después, por otra vía.",
    ],
    visuales: [{ tipo: "anatomia.flujo", despuesDePaso: 1, titulo: "Arco reflejo", etapas: FLUJO_ARCO_REFLEJO }],
    quiz: [
      {
        pregunta: "¿Qué neurona lleva la señal desde el receptor hasta la médula espinal?",
        opciones: ["Motora (eferente)", "Sensitiva (aferente)", "Ninguna, va directo", "La del efector"],
        respuesta: "Sensitiva (aferente)",
        explicacion: "Aferente = llega al sistema nervioso central.",
      },
      {
        pregunta: "En un reflejo simple, ¿dónde se integra la señal?",
        opciones: ["En la médula espinal", "En el cerebelo", "En la piel", "En el corazón"],
        respuesta: "En la médula espinal",
        explicacion: "La médula pasa la señal de la neurona sensitiva a la motora sin esperar una decisión del cerebro.",
      },
      {
        pregunta: "¿Qué es el efector?",
        opciones: ["El receptor de la piel", "El músculo o la glándula que responde", "La neurona sensitiva", "El estímulo"],
        respuesta: "El músculo o la glándula que responde",
        explicacion: "El efector es quien ejecuta la respuesta: por ejemplo, el músculo que retira la mano.",
      },
      {
        pregunta: "¿Por qué el reflejo es tan rápido?",
        opciones: [
          "Porque la respuesta se decide en la médula, sin esperar al cerebro",
          "Porque las neuronas van más rápido de noche",
          "Porque no usa neuronas",
          "Porque sucede antes del estímulo",
        ],
        respuesta: "Porque la respuesta se decide en la médula, sin esperar al cerebro",
        explicacion: "El camino es corto: receptor, médula y efector.",
      },
    ],
  },
];
