// Mundo Vitalia (Biología, mundo 15). Seis modos con niveles 1 a 10 cada uno
// (docs/PLAN_MUNDOS_FISICA_BIOLOGIA.md §4).
//
// - Lo que no se calcula sale de tablas curadas de este archivo (organelos,
//   hormonas, reinos…), escritas para revisarse a mano. Biología pregunta
//   CÓMO FUNCIONA algo; los nombres y la ubicación de huesos, músculos y
//   órganos son de Anatomía y no se repiten acá.
// - La genética se calcula: hebras complementarias, ARN, codones, cuadros de
//   Punnett, grupos ABO, herencia ligada al X y Chargaff.
// - Clasificación: los 5 reinos de colegio (Moneras, Protistas, Hongos,
//   Plantas, Animales) y, en los niveles altos, los 3 dominios.

import { pasosVitalia } from "@/lib/vitalia/pasos";
import { armarOpciones, clamp, conRngSembrado, elegir, elegirPonderado, mezclar, randomInt } from "@/lib/estadistica/util";
import { NOMBRE_ORGANELO, type FaseMitosis, type ModoVitalia, type Organelo, type ProblemaVitalia, type ProblemaVitaliaNumero, type ProblemaVitaliaOpciones, type DiagramaVitalia } from "@/lib/vitalia/tipos";

export { DESCRIPCION_MODO_VITALIA, MODOS_VITALIA, NOMBRE_MODO_VITALIA, NOMBRE_ORGANELO, SIMBOLO_MODO_VITALIA } from "@/lib/vitalia/tipos";
export type { DiagramaVitalia, FaseMitosis, ModoVitalia, Organelo, ProblemaVitalia } from "@/lib/vitalia/tipos";
export { conRngSembrado };

// ---------- Constructores ----------

function num(modo: ModoVitalia, tipo: string, enunciado: string, respuesta: number, diagrama?: DiagramaVitalia): ProblemaVitaliaNumero {
  return { modo, entrada: "numero", enunciado, respuesta, tolerancia: Number.isInteger(respuesta) ? 0 : 0.01, diagrama, detalle: { tipo } };
}

function opc(modo: ModoVitalia, tipo: string, enunciado: string, correcta: string, distractores: readonly string[], diagrama?: DiagramaVitalia): ProblemaVitaliaOpciones {
  const otras = armarOpciones(correcta, mezclar(distractores)).filter((o) => o !== correcta).slice(0, 3);
  return { modo, entrada: "opciones", enunciado, opciones: mezclar([correcta, ...otras]), respuesta: correcta, diagrama, detalle: { tipo } };
}

interface Item {
  q: string;
  ok: string;
  no?: readonly string[];
}

// Pregunta de una tabla: los distractores son los propios (`no`) o, si no
// tiene, las respuestas de las demás filas del mismo grupo.
function deTabla(modo: ModoVitalia, tipo: string, tabla: readonly Item[], diagrama?: DiagramaVitalia): ProblemaVitaliaOpciones {
  const it = elegir(tabla);
  const otras = it.no ?? [...new Set(tabla.map((x) => x.ok))].filter((x) => x !== it.ok);
  return opc(modo, tipo, it.q, it.ok, otras, diagrama);
}

// Tipo de pregunta por nivel (auditoría 2026-10-29): cada tipo vive en una
// ventana [desde, hasta] de niveles. Antes solo había «desde» y en nivel 1-2 quedaba
// UN tipo (6-7 preguntas); y los básicos seguían saliendo en nivel 10. Los tipos que
// recién se abren pesan el doble (igual que elegirPonderado).
function elegirTipo<T extends string>(entradas: ReadonlyArray<readonly [T, number, number]>, nivel: number): T {
  const enVentana = entradas.filter(([, desde, hasta]) => nivel >= desde && nivel <= hasta).map(([t, desde]) => [t, desde] as const);
  return elegirPonderado(enVentana, nivel);
}

// 1,5 → "1,5" (coma decimal, como el resto de la app).
function coma(n: number): string {
  return String(n).replace(".", ",");
}

// ============================================================
// 1) La célula
// ============================================================

const FUNCION_ORGANELO: Record<Organelo, string> = {
  nucleo: "Guarda el ADN y controla la célula",
  mitocondria: "Obtiene energía (ATP) de la glucosa",
  ribosoma: "Fabrica proteínas",
  reticulo: "Fabrica y transporta proteínas y lípidos",
  golgi: "Empaca y envía las proteínas",
  lisosoma: "Digiere desechos y partes viejas",
  cloroplasto: "Hace la fotosíntesis",
  vacuola: "Guarda agua y sustancias",
  pared: "Da rigidez y protege a la célula vegetal",
  membrana: "Controla qué entra y qué sale",
};
const ORGANELOS = Object.keys(FUNCION_ORGANELO) as Organelo[];
const SOLO_VEGETAL: Organelo[] = ["cloroplasto", "pared"];

const TEORIA_CELULAR: Item[] = [
  { q: "Según la teoría celular, todos los seres vivos…", ok: "Están formados por una o más células", no: ["Tienen núcleo", "Hacen fotosíntesis", "Son pluricelulares"] },
  { q: "Según la teoría celular, una célula nueva nace…", ok: "De otra célula que se divide", no: ["De la materia sin vida", "Del agua y la luz", "Solo en los animales"] },
  { q: "¿Qué tienen las células eucariotas que NO tienen las procariotas?", ok: "Un núcleo con membrana", no: ["Membrana plasmática", "Ribosomas", "ADN"] },
  { q: "Una bacteria es una célula…", ok: "Procariota", no: ["Eucariota", "Vegetal", "Animal"] },
  { q: "Las células de una levadura, un hongo, son…", ok: "Eucariotas", no: ["Procariotas", "Bacterias", "Virus"] },
  { q: "Una ameba está formada por…", ok: "Una sola célula", no: ["Muchas células", "Ninguna célula", "Dos células"] },
  { q: "Un árbol es un ser…", ok: "Pluricelular", no: ["Unicelular", "Procariota", "Sin células"] },
  { q: "¿Cuál es la unidad más pequeña que está viva?", ok: "La célula", no: ["El átomo", "El órgano", "El tejido"] },
  { q: "Un grupo de células parecidas que trabajan juntas forma…", ok: "Un tejido", no: ["Un organelo", "Una molécula", "Un ecosistema"] },
  { q: "¿Con qué instrumento se descubrieron las células?", ok: "El microscopio", no: ["El telescopio", "La lupa de mano solamente", "El termómetro"] },
  { q: "Una bacteria, ¿tiene ADN?", ok: "Sí, suelto en el citoplasma", no: ["No, nunca", "Sí, dentro de un núcleo", "Solo cuando se divide"] },
];
const CELULA_ANIMAL_VEGETAL: Item[] = [
  { q: "Una célula tiene pared celular, cloroplastos y una vacuola grande. Es…", ok: "Vegetal", no: ["Animal", "Bacteriana", "De un hongo"] },
  { q: "Una célula no tiene pared ni cloroplastos y tiene muchas vacuolas chicas. Es…", ok: "Animal", no: ["Vegetal", "Bacteriana", "De un alga"] },
  { q: "¿Qué parte tiene la célula vegetal y NO la animal?", ok: "Cloroplastos", no: ["Núcleo", "Mitocondrias", "Ribosomas"] },
  { q: "¿Qué parte tienen TANTO la célula animal como la vegetal?", ok: "Mitocondrias", no: ["Pared celular", "Cloroplastos", "Una vacuola central grande"] },
  { q: "¿Qué parte da a la célula vegetal su forma rígida, casi cuadrada?", ok: "La pared celular", no: ["El núcleo", "La mitocondria", "El ribosoma"] },
  { q: "¿Por qué las hojas son verdes?", ok: "Sus células tienen cloroplastos con clorofila", no: ["Sus células no tienen núcleo", "Tienen mucha agua", "Sus células son animales"] },
];
// Objetivos del microscopio escolar y tamaños de células reales para el
// cálculo de tamaño real (aumento total = ocular × objetivo).
const OCULARES = [5, 10, 15, 20];
const OBJETIVOS = [4, 10, 40, 100];
// Lado de una célula cúbica (µm) con 6/L exacto a ≤ 2 decimales.
const LADOS_CUBO = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 25, 30];

const MEDIOS: Item[] = [
  { q: "Una célula animal entra en un medio hipotónico (con menos sal que ella). ¿Qué le pasa?", ok: "Entra agua y se hincha", no: ["Sale agua y se arruga", "No cambia", "Pierde el núcleo"] },
  { q: "Una célula animal entra en un medio hipertónico (con más sal que ella). ¿Qué le pasa?", ok: "Sale agua y se arruga", no: ["Entra agua y se hincha", "No cambia", "Se divide"] },
  { q: "Una célula animal entra en un medio isotónico (igual de salado). ¿Qué le pasa?", ok: "No cambia", no: ["Se hincha", "Se arruga", "Estalla"] },
  { q: "Una planta se riega con agua sin sal. Sus células quedan…", ok: "Firmes (turgentes)", no: ["Arrugadas", "Sin vacuola", "Sin pared"] },
  { q: "El paso de agua a través de la membrana, hacia donde hay más sal, se llama…", ok: "Ósmosis", no: ["Difusión", "Transporte activo", "Fotosíntesis"] },
  { q: "El perfume se esparce por un cuarto, de donde hay más a donde hay menos. Es…", ok: "Difusión", no: ["Ósmosis", "Transporte activo", "Respiración"] },
  { q: "La célula mete sodio y potasio en contra de la corriente gastando ATP. Es…", ok: "Transporte activo", no: ["Difusión", "Ósmosis", "Fermentación"] },
];

const BIOMOLECULAS: Item[] = [
  { q: "¿De qué ladrillos están hechas las proteínas?", ok: "Aminoácidos" },
  { q: "¿De qué ladrillos está hecho el almidón?", ok: "Glucosa" },
  { q: "¿De qué ladrillos está hecho el ADN?", ok: "Nucleótidos" },
  { q: "¿De qué están hechas las grasas?", ok: "Ácidos grasos y glicerol" },
  { q: "Las enzimas, que aceleran las reacciones de la célula, son…", ok: "Proteínas", no: ["Grasas", "Azúcares", "Minerales"] },
  { q: "Si una enzima se calienta demasiado…", ok: "Se deforma y deja de funcionar", no: ["Trabaja más rápido para siempre", "Se convierte en grasa", "Se divide en dos enzimas"] },
  { q: "¿Qué biomolécula da energía rápida a la célula?", ok: "Los carbohidratos", no: ["Los ácidos nucleicos", "Las vitaminas", "El agua"] },
  { q: "¿Qué biomolécula forma la doble capa de la membrana celular?", ok: "Los fosfolípidos", no: ["El almidón", "El ADN", "La celulosa"] },
  { q: "¿De qué está hecha la pared de la célula vegetal?", ok: "Celulosa", no: ["Quitina", "Colesterol", "Queratina"] },
  { q: "¿Qué azúcar guardan los animales en el hígado y los músculos?", ok: "Glucógeno", no: ["Almidón", "Celulosa", "Sacarosa"] },
  { q: "¿Qué azúcar de reserva guardan las plantas, por ejemplo en la papa?", ok: "Almidón", no: ["Glucógeno", "Quitina", "Lactosa"] },
  { q: "¿Qué ácido nucleico lleva la copia de un gen desde el núcleo al ribosoma?", ok: "El ARN mensajero", no: ["El ADN", "El ATP", "La glucosa"] },
  { q: "¿Qué molécula es la «moneda de energía» que gasta la célula?", ok: "El ATP", no: ["El ADN", "El agua", "El colesterol"] },
];

function celula(nivel: number): ProblemaVitalia {
  const n = clamp(nivel, 1, 10);
  const M: ModoVitalia = "celula";
  const tipo = elegirTipo(
    [
      ["teoria", 1, 4],
      ["funcion", 1, 6],
      ["organelo_de", 1, 6],
      ["animal_vegetal", 1, 4],
      ["senalar", 1, 8],
      ["microscopio", 3, 8],
      ["medios", 5, 10],
      ["medio_conc", 5, 10],
      ["biomoleculas", 7, 10],
      ["sup_vol", 7, 10],
      ["difusion", 7, 10],
    ] as const,
    n
  );
  switch (tipo) {
    case "microscopio": {
      const oc = elegir(OCULARES);
      const ob = elegir(OBJETIVOS);
      const aumento = oc * ob;
      if (n <= 4 || elegir([true, false])) return num(M, "microscopio_aumento", `Un microscopio tiene un ocular de ${oc}× y un objetivo de ${ob}×. ¿Cuál es el aumento total?`, aumento);
      // Tamaño real (µm) = tamaño en la imagen (mm) × 1000 ÷ aumento, entero.
      const posibles = Array.from({ length: 30 }, (_, i) => i + 1).filter((mm) => (mm * 1000) % aumento === 0 && (mm * 1000) / aumento <= 500);
      if (posibles.length === 0) return num(M, "microscopio_aumento", `Un microscopio tiene un ocular de ${oc}× y un objetivo de ${ob}×. ¿Cuál es el aumento total?`, aumento);
      const mm = elegir(posibles);
      return num(M, "microscopio_tamano", `Con un aumento total de ${aumento}×, una célula se ve de ${mm} mm en la imagen. ¿Cuánto mide en realidad, en micrómetros (µm)? (1 mm = 1000 µm)`, (mm * 1000) / aumento);
    }
    case "medio_conc": {
      // Concentración de sal dentro de la célula y en el medio (en décimas de %).
      const dentro = elegir([7, 8, 9, 10, 11]);
      const medio = elegir([0, 2, 3, 5, dentro, dentro, 15, 20, 30, 35]);
      const animal = elegir([true, false]);
      const ser = animal ? "Un glóbulo rojo" : "Una célula de una hoja";
      const ok = medio < dentro ? (animal ? "Entra agua y se hincha (puede estallar)" : "Entra agua y queda firme (turgente)") : medio > dentro ? (animal ? "Sale agua y se arruga" : "Sale agua y la membrana se despega de la pared (plasmólisis)") : "No cambia: entra y sale la misma agua";
      const todas = animal
        ? ["Entra agua y se hincha (puede estallar)", "Sale agua y se arruga", "No cambia: entra y sale la misma agua", "Entra sal y pierde el núcleo"]
        : ["Entra agua y queda firme (turgente)", "Sale agua y la membrana se despega de la pared (plasmólisis)", "No cambia: entra y sale la misma agua", "Pierde la pared celular"];
      return opc(M, "medio_conc", `${ser} tiene ${coma(dentro / 10)} % de sal por dentro y se pone en agua con ${coma(medio / 10)} % de sal. ¿Qué le pasa?`, ok, todas.filter((x) => x !== ok));
    }
    case "sup_vol": {
      const L = elegir(LADOS_CUBO);
      const que = elegir(["superficie", "volumen", "relacion"] as const);
      if (que === "superficie") return num(M, "sup_superficie", `Una célula con forma de cubo mide ${L} µm de lado. ¿Cuánta superficie de membrana tiene, en µm²? (6 caras de L × L)`, 6 * L * L);
      if (que === "volumen") return num(M, "sup_volumen", `Una célula con forma de cubo mide ${L} µm de lado. ¿Cuál es su volumen, en µm³?`, L * L * L);
      return num(M, "sup_relacion", `Una célula con forma de cubo mide ${L} µm de lado. ¿Cuál es su relación superficie ÷ volumen?`, (6 * L * L) / (L * L * L));
    }
    case "difusion": {
      const sustancia = elegir(["glucosa", "oxígeno", "dióxido de carbono", "urea"]);
      const dentro = randomInt(1, 12) * 5;
      const fuera = elegir([dentro, randomInt(1, 12) * 5, randomInt(1, 12) * 5]);
      const ok = fuera > dentro ? "Entra a la célula" : fuera < dentro ? "Sale de la célula" : "No hay movimiento neto";
      return opc(M, "difusion", `Dentro de una célula hay ${dentro} unidades de ${sustancia} por litro y afuera hay ${fuera}. Por difusión, sin gastar energía, ¿hacia dónde va la ${sustancia}?`.replace("la oxígeno", "el oxígeno").replace("la dióxido", "el dióxido"), ok, ["Entra a la célula", "Sale de la célula", "No hay movimiento neto", "Solo se mueve gastando ATP"].filter((x) => x !== ok));
    }
    case "teoria":
      return deTabla(M, "teoria", TEORIA_CELULAR);
    case "funcion": {
      const o = elegir(ORGANELOS);
      return opc(M, "funcion", `¿Qué hace ${o === "pared" || o === "membrana" || o === "mitocondria" || o === "vacuola" ? "la" : "el"} ${NOMBRE_ORGANELO[o].toLowerCase()}?`, FUNCION_ORGANELO[o], ORGANELOS.filter((x) => x !== o).map((x) => FUNCION_ORGANELO[x]));
    }
    case "organelo_de": {
      const o = elegir(ORGANELOS);
      return opc(M, "organelo_de", `¿Qué parte de la célula cumple esta función? «${FUNCION_ORGANELO[o]}»`, NOMBRE_ORGANELO[o], ORGANELOS.filter((x) => x !== o).map((x) => NOMBRE_ORGANELO[x]));
    }
    case "senalar": {
      const variante = elegir(["animal", "vegetal"] as const);
      const posibles = variante === "animal" ? ORGANELOS.filter((x) => !SOLO_VEGETAL.includes(x) && x !== "lisosoma") : ORGANELOS.filter((x) => x !== "lisosoma");
      const o = elegir(posibles);
      return opc(M, "senalar", `¿Qué parte de la célula señala la flecha?`, NOMBRE_ORGANELO[o], posibles.filter((x) => x !== o).map((x) => NOMBRE_ORGANELO[x]), { tipo: "celula", variante, senalado: o });
    }
    case "animal_vegetal": {
      const variante = elegir(["animal", "vegetal"] as const);
      if (elegir([true, false])) return opc(M, "animal_vegetal", "¿Esta célula es animal o vegetal?", variante === "animal" ? "Animal" : "Vegetal", [variante === "animal" ? "Vegetal" : "Animal", "Bacteriana"], { tipo: "celula", variante });
      return deTabla(M, "animal_vegetal", CELULA_ANIMAL_VEGETAL);
    }
    case "medios":
      return deTabla(M, "medios", MEDIOS);
    case "biomoleculas":
      return deTabla(M, "biomoleculas", BIOMOLECULAS);
  }
}

// ============================================================
// 2) Procesos celulares
// ============================================================

const FOTO_RESP: Item[] = [
  { q: "¿Qué gas libera la fotosíntesis?", ok: "Oxígeno", no: ["Dióxido de carbono", "Nitrógeno", "Metano"] },
  { q: "¿Qué gas toma la planta del aire para hacer fotosíntesis?", ok: "Dióxido de carbono", no: ["Oxígeno", "Nitrógeno", "Hidrógeno"] },
  { q: "¿Qué azúcar fabrica la fotosíntesis?", ok: "Glucosa", no: ["Lactosa", "Sacarosa refinada", "Almidón de papa"] },
  { q: "La respiración celular usa glucosa y oxígeno. ¿Qué libera?", ok: "Dióxido de carbono, agua y energía (ATP)", no: ["Oxígeno y glucosa", "Solo oxígeno", "Luz y calor"] },
  { q: "¿Qué energía usa la fotosíntesis?", ok: "La luz", no: ["El calor de la tierra", "La electricidad", "El sonido"] },
  { q: "¿Qué necesita la fotosíntesis para funcionar?", ok: "Agua, dióxido de carbono y luz", no: ["Oxígeno y glucosa", "Agua y oxígeno", "Glucosa y luz"] },
  { q: "¿Qué pigmento verde atrapa la luz para la fotosíntesis?", ok: "La clorofila", no: ["La hemoglobina", "La melanina", "La queratina"] },
  { q: "¿Por qué parte de la planta entra el dióxido de carbono?", ok: "Por los estomas de las hojas", no: ["Por las raíces", "Por las flores", "Por el tallo leñoso"] },
  { q: "¿Por dónde toma la planta casi toda el agua?", ok: "Por las raíces", no: ["Por las flores", "Por los estomas", "Por las semillas"] },
  { q: "¿Qué seres vivos hacen respiración celular?", ok: "Todos: plantas, animales, hongos y bacterias", no: ["Solo los animales", "Solo los que tienen pulmones", "Solo las plantas de noche"] },
  { q: "¿Para qué respira la célula?", ok: "Para sacar energía (ATP) de la glucosa", no: ["Para fabricar glucosa", "Para hacer fotosíntesis", "Para guardar oxígeno"] },
  { q: "De noche, sin luz, una planta…", ok: "Solo respira: toma oxígeno y suelta dióxido de carbono", no: ["Sigue haciendo fotosíntesis igual", "Deja de estar viva", "Suelta más oxígeno que de día"] },
  { q: "¿Qué gas necesita la respiración celular?", ok: "Oxígeno", no: ["Dióxido de carbono", "Nitrógeno", "Helio"] },
  { q: "Si una planta pasa días a oscuras, ¿qué no puede hacer?", ok: "Fotosíntesis", no: ["Respirar", "Tener células", "Guardar agua"] },
];
// Quién hace fotosíntesis: las preguntas se arman con un ser de cada lista.
const HACEN_FOTO = ["Un alga", "Una cianobacteria", "Un helecho", "Un musgo", "Un pino", "Un rosal", "Una planta de maíz", "Un cactus", "Un girasol"];
const NO_HACEN_FOTO = ["Un champiñón", "Una levadura", "Una vaca", "Una ameba", "Un perro", "El moho del pan", "Una lombriz", "Un tiburón"];
const LUGARES: Item[] = [
  { q: "¿Dónde ocurre la fotosíntesis?", ok: "En los cloroplastos" },
  { q: "¿Dónde ocurre la respiración celular con oxígeno?", ok: "En las mitocondrias" },
  { q: "¿Dónde ocurre la glucólisis, el primer paso para romper la glucosa?", ok: "En el citoplasma" },
  { q: "¿Dónde se copia el ADN antes de dividirse una célula eucariota?", ok: "En el núcleo" },
  { q: "¿Dónde se fabrican las proteínas?", ok: "En los ribosomas" },
  { q: "¿Dónde ocurre la fermentación?", ok: "En el citoplasma" },
  { q: "¿Dónde se guarda la información para fabricar las proteínas?", ok: "En el núcleo" },
  { q: "¿Dónde se fabrica el ATP cuando hay oxígeno?", ok: "En las mitocondrias" },
];
const QUIEN_FOTO: Item[] = [
  { q: "¿Cuál de estos seres hace fotosíntesis?", ok: "Un alga", no: ["Un hongo", "Una vaca", "Una ameba"] },
  { q: "¿Cuál de estos seres hace fotosíntesis?", ok: "Una cianobacteria", no: ["Un champiñón", "Un perro", "Una levadura"] },
  { q: "¿Cuál de estos seres NO hace fotosíntesis?", ok: "Un champiñón", no: ["Un helecho", "Un musgo", "Un alga"] },
];
const FASES: { fase: FaseMitosis; nombre: string; describe: string }[] = [
  { fase: "profase", nombre: "Profase", describe: "Los cromosomas se condensan y la envoltura del núcleo desaparece" },
  { fase: "metafase", nombre: "Metafase", describe: "Los cromosomas se alinean en el centro de la célula" },
  { fase: "anafase", nombre: "Anafase", describe: "Las cromátidas se separan hacia los polos" },
  { fase: "telofase", nombre: "Telofase", describe: "Se forman dos núcleos nuevos y la célula empieza a partirse" },
];
const ESPECIES: { nombre: string; dosN: number }[] = [
  { nombre: "el ser humano", dosN: 46 },
  { nombre: "el perro", dosN: 78 },
  { nombre: "el gato", dosN: 38 },
  { nombre: "la mosca de la fruta", dosN: 8 },
  { nombre: "el maíz", dosN: 20 },
  { nombre: "el chimpancé", dosN: 48 },
  { nombre: "el arroz", dosN: 24 },
  { nombre: "el caballo", dosN: 64 },
  { nombre: "la gallina", dosN: 78 },
  { nombre: "el ratón", dosN: 40 },
];
const CICLO: Item[] = [
  { q: "¿En qué fase del ciclo celular se copia el ADN?", ok: "Fase S", no: ["Fase G1", "Fase G2", "Mitosis"] },
  { q: "¿En qué fase la célula se divide en dos?", ok: "Mitosis (fase M)", no: ["Fase S", "Fase G1", "Fase G2"] },
  { q: "¿Qué tipo de división forma óvulos y espermatozoides?", ok: "Meiosis", no: ["Mitosis", "Fisión binaria", "Gemación"] },
  { q: "¿Qué división hace crecer el cuerpo y cerrar una herida?", ok: "Mitosis", no: ["Meiosis", "Fecundación", "Fotosíntesis"] },
  { q: "El entrecruzamiento, que mezcla genes de los dos padres, ocurre en…", ok: "La meiosis", no: ["La mitosis", "La fase S", "La fotosíntesis"] },
  { q: "Tu músculo trabaja sin suficiente oxígeno y hace fermentación…", ok: "Láctica", no: ["Alcohólica", "Acética", "Clorofílica"] },
  { q: "La levadura que infla el pan hace fermentación…", ok: "Alcohólica", no: ["Láctica", "Fotosintética", "Muscular"] },
];

function procesos(nivel: number): ProblemaVitalia {
  const n = clamp(nivel, 1, 10);
  const M: ModoVitalia = "procesos";
  const tipo = elegirTipo(
    [
      ["foto_resp", 1, 4],
      ["lugares", 1, 6],
      ["quien", 1, 4],
      ["fase_dibujo", 3, 8],
      ["fase_texto", 3, 8],
      ["orden", 5, 8],
      ["cromosomas", 5, 10],
      ["ciclo", 5, 10],
      ["divisiones", 7, 10],
      ["atp", 7, 10],
      ["ecuacion", 7, 10],
    ] as const,
    n
  );
  switch (tipo) {
    case "foto_resp":
      return deTabla(M, "foto_resp", FOTO_RESP);
    case "lugares":
      return deTabla(M, "lugares", LUGARES);
    case "quien": {
      if (elegir([true, false, false])) return deTabla(M, "quien", QUIEN_FOTO);
      if (elegir([true, false])) {
        const ok = elegir(HACEN_FOTO);
        return opc(M, "quien", "¿Cuál de estos seres hace fotosíntesis?", ok, mezclar(NO_HACEN_FOTO).slice(0, 3));
      }
      const ok = elegir(NO_HACEN_FOTO);
      return opc(M, "quien", "¿Cuál de estos seres NO hace fotosíntesis?", ok, mezclar(HACEN_FOTO).slice(0, 3));
    }
    case "divisiones": {
      if (elegir([true, false])) {
        const k = randomInt(2, 8);
        return num(M, "divisiones_mitosis", `Una célula se divide por mitosis y cada célula hija vuelve a dividirse, ${k} veces seguidas en total. ¿Cuántas células hay al final?`, 2 ** k);
      }
      const cada = elegir([20, 30]);
      const horas = randomInt(1, cada === 20 ? 3 : 4);
      const veces = (horas * 60) / cada;
      return num(M, "divisiones_bacteria", `Una bacteria se divide en dos cada ${cada} minutos. Si empiezas con una sola, ¿cuántas bacterias hay después de ${horas} ${horas === 1 ? "hora" : "horas"}?`, 2 ** veces);
    }
    case "ecuacion": {
      // 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂ (y la respiración, al revés).
      const k = randomInt(2, 12);
      const que = elegir(["o2_foto", "co2_foto", "co2_resp", "glucosa"] as const);
      if (que === "o2_foto") return num(M, "ecuacion", `La fotosíntesis es 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂. ¿Cuántas moléculas de oxígeno se liberan al fabricar ${k} glucosas?`, 6 * k);
      if (que === "co2_foto") return num(M, "ecuacion", `La fotosíntesis es 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂. ¿Cuántas moléculas de CO₂ hacen falta para fabricar ${k} glucosas?`, 6 * k);
      if (que === "co2_resp") return num(M, "ecuacion", `La respiración es C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O. ¿Cuántas moléculas de CO₂ salen al quemar ${k} glucosas?`, 6 * k);
      return num(M, "ecuacion", `La fotosíntesis es 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂. Con ${6 * k} moléculas de CO₂ (y agua de sobra), ¿cuántas glucosas se pueden fabricar?`, k);
    }
    case "fase_dibujo": {
      const f = elegir(FASES);
      return opc(M, "fase_dibujo", "¿En qué fase de la mitosis está esta célula?", f.nombre, FASES.filter((x) => x !== f).map((x) => x.nombre), { tipo: "division", fase: f.fase });
    }
    case "fase_texto": {
      const f = elegir(FASES);
      return opc(M, "fase_texto", `«${f.describe}». ¿Qué fase de la mitosis es?`, f.nombre, FASES.filter((x) => x !== f).map((x) => x.nombre));
    }
    case "orden": {
      const correcto = FASES.map((x) => x.nombre).join(" → ");
      const malos = new Set<string>();
      while (malos.size < 3) {
        const m = mezclar(FASES.map((x) => x.nombre)).join(" → ");
        if (m !== correcto) malos.add(m);
      }
      return opc(M, "orden", "¿Cuál es el orden correcto de las fases de la mitosis?", correcto, [...malos]);
    }
    case "cromosomas": {
      const e = elegir(ESPECIES);
      const que = elegir(["gameto", "mitosis", "meiosis", "meiosis_n"] as const);
      if (que === "meiosis_n") return num(M, "cromosomas_gameto", `Una célula ${deArticulo(e.nombre)} con ${e.dosN} cromosomas termina la meiosis. ¿Cuántos cromosomas tiene cada célula que se forma?`, e.dosN / 2);
      if (que === "gameto") return num(M, "cromosomas_gameto", `Las células del cuerpo ${deArticulo(e.nombre)} tienen ${e.dosN} cromosomas (2n). ¿Cuántos tiene un gameto (óvulo o espermatozoide)?`, e.dosN / 2);
      if (que === "mitosis") return num(M, "cromosomas_mitosis", `Una célula ${deArticulo(e.nombre)} con ${e.dosN} cromosomas hace mitosis. ¿Cuántos cromosomas tiene cada célula hija?`, e.dosN);
      return num(M, "cromosomas_meiosis", `Una célula ${deArticulo(e.nombre)} con ${e.dosN} cromosomas termina la meiosis. ¿Cuántas células se forman?`, 4);
    }
    case "ciclo":
      return deTabla(M, "ciclo", CICLO);
    case "atp": {
      const g = randomInt(2, n >= 9 ? 20 : 9);
      if (n >= 9 && elegir([true, false])) {
        const sin = randomInt(2, 12);
        return num(M, "atp_mezcla", `Una célula quema ${g} glucosas con oxígeno (unos 36 ATP cada una) y ${sin} sin oxígeno, por fermentación (2 ATP cada una). ¿Cuántos ATP obtiene en total?`, g * 36 + sin * 2);
      }
      if (elegir([true, false])) return num(M, "atp_aerobica", `La respiración con oxígeno da unos 36 ATP por cada glucosa. ¿Cuántos ATP dan ${g} glucosas?`, g * 36);
      return num(M, "atp_fermentacion", `La fermentación da solo 2 ATP por cada glucosa. ¿Cuántos ATP dan ${g} glucosas?`, g * 2);
    }
  }
}

// ============================================================
// 3) Genética (todo calculado)
// ============================================================

const BASES = ["A", "T", "G", "C"] as const;
const COMPLEMENTO: Record<string, string> = { A: "T", T: "A", G: "C", C: "G" };
const A_ARN: Record<string, string> = { A: "U", T: "A", G: "C", C: "G" };

const CODONES: Record<string, string> = {
  AUG: "Met",
  UUU: "Fen",
  GGC: "Gli",
  GCU: "Ala",
  UGG: "Trp",
  AAA: "Lis",
  GAU: "Asp",
  CAU: "His",
  UCU: "Ser",
  CCU: "Pro",
  GUU: "Val",
};

// 10000 → "10.000" (sin depender del Intl del teléfono).
function miles(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function hebra(largo: number): string {
  return Array.from({ length: largo }, () => elegir(BASES)).join("");
}
function enTripletes(s: string): string {
  return s.match(/.{1,3}/g)!.join("-");
}

type Genotipo = "AA" | "Aa" | "aa";
// Fracción de alelos recesivos que da cada padre.
const Q: Record<Genotipo, number> = { AA: 0, Aa: 0.5, aa: 1 };

const RASGOS = [
  { dom: "semilla amarilla", rec: "semilla verde" },
  { dom: "flor violeta", rec: "flor blanca" },
  { dom: "tallo alto", rec: "tallo enano" },
  { dom: "pelaje negro", rec: "pelaje blanco" },
] as const;

type Alelo = "A" | "B" | "O";
const GENOTIPOS_ABO: { texto: string; alelos: [Alelo, Alelo] }[] = [
  { texto: "AA", alelos: ["A", "A"] },
  { texto: "AO", alelos: ["A", "O"] },
  { texto: "BB", alelos: ["B", "B"] },
  { texto: "BO", alelos: ["B", "O"] },
  { texto: "AB", alelos: ["A", "B"] },
  { texto: "OO", alelos: ["O", "O"] },
];
function grupoDe(a: Alelo, b: Alelo): string {
  const s = new Set([a, b]);
  if (s.has("A") && s.has("B")) return "AB";
  if (s.has("A")) return "A";
  if (s.has("B")) return "B";
  return "O";
}
const ORDEN_GRUPOS = ["A", "B", "AB", "O"];
function textoGrupos(g: Set<string>): string {
  const l = ORDEN_GRUPOS.filter((x) => g.has(x));
  return l.length === 1 ? `Solo ${l[0]}` : `${l.slice(0, -1).join(", ")} y ${l[l.length - 1]}`;
}
export function gruposHijos(p1: [Alelo, Alelo], p2: [Alelo, Alelo]): Set<string> {
  const out = new Set<string>();
  for (const a of p1) for (const b of p2) out.add(grupoDe(a, b));
  return out;
}

const VOCABULARIO: Item[] = [
  { q: "¿Qué genotipo es heterocigoto?", ok: "Aa", no: ["AA", "aa", "A"] },
  { q: "¿Qué genotipo es homocigoto recesivo?", ok: "aa", no: ["AA", "Aa", "A"] },
  { q: "El aspecto que se ve de un rasgo (por ejemplo, ojos marrones) se llama…", ok: "Fenotipo", no: ["Genotipo", "Alelo", "Cromosoma"] },
  { q: "La combinación de alelos de un individuo (por ejemplo, Aa) se llama…", ok: "Genotipo", no: ["Fenotipo", "Gen", "Gameto"] },
  { q: "Cada versión distinta de un mismo gen se llama…", ok: "Alelo", no: ["Cromosoma", "Codón", "Nucleótido"] },
  { q: "Un alelo que se nota aunque haya una sola copia es…", ok: "Dominante", no: ["Recesivo", "Mutante", "Neutro"] },
  { q: "Un alelo que solo se nota si hay dos copias es…", ok: "Recesivo", no: ["Dominante", "Codominante", "Mutante"] },
  { q: "¿Qué genotipo es homocigoto dominante?", ok: "AA", no: ["Aa", "aa", "a"] },
  { q: "Un trozo de ADN con la instrucción para fabricar una proteína se llama…", ok: "Gen", no: ["Alelo", "Cromosoma", "Gameto"] },
  { q: "¿Dónde está guardado el ADN en una célula humana?", ok: "En el núcleo", no: ["En la membrana", "En los ribosomas", "En la vacuola"] },
  { q: "¿Qué forma tiene la molécula de ADN?", ok: "Una doble hélice", no: ["Un círculo simple", "Una esfera", "Una sola hebra recta"] },
  { q: "¿Cuántos cromosomas tiene una célula del cuerpo humano?", ok: "46", no: ["23", "48", "92"] },
  { q: "¿Cuántas «letras» (bases) distintas tiene el ADN?", ok: "4", no: ["2", "20", "64"] },
  { q: "¿Quién descubrió las leyes de la herencia cruzando arvejas?", ok: "Gregor Mendel", no: ["Charles Darwin", "Louis Pasteur", "Robert Hooke"] },
];
const MUTACIONES: Item[] = [
  { q: "Una letra del ADN cambia por otra (ATG → ACG). Es una mutación por…", ok: "Sustitución", no: ["Inserción", "Deleción", "Duplicación del cromosoma"] },
  { q: "Se agrega una letra nueva al ADN. Es una mutación por…", ok: "Inserción", no: ["Sustitución", "Deleción", "Traducción"] },
  { q: "Se pierde una letra del ADN. Es una mutación por…", ok: "Deleción", no: ["Inserción", "Sustitución", "Transcripción"] },
];

function genetica(nivel: number): ProblemaVitalia {
  const n = clamp(nivel, 1, 10);
  const M: ModoVitalia = "genetica";
  const tipo = elegirTipo(
    [
      ["vocabulario", 1, 4],
      ["complementaria", 1, 6],
      ["transcripcion", 3, 8],
      ["traduccion", 5, 10],
      ["punnett", 5, 10],
      ["dihibrido", 7, 10],
      ["incompleta", 7, 10],
      ["abo", 7, 10],
      ["ligado_x", 9, 10],
      ["chargaff", 7, 10],
      ["mutacion", 7, 10],
    ] as const,
    n
  );
  switch (tipo) {
    case "vocabulario":
      return deTabla(M, "vocabulario", VOCABULARIO);
    case "complementaria": {
      // Nivel 1-2: hebras de 4-5 bases; sube hasta 9.
      const h = hebra(n <= 2 ? randomInt(4, 5) : n <= 4 ? randomInt(6, 7) : randomInt(8, 9));
      const ok = [...h].map((b) => COMPLEMENTO[b]).join("");
      const conU = [...h].map((b) => A_ARN[b]).join("");
      const alReves = [...ok].reverse().join("");
      const misma = h;
      return opc(M, "complementaria", `¿Cuál es la hebra de ADN complementaria de ${h}?`, ok, [conU, alReves, misma].filter((x) => x !== ok));
    }
    case "transcripcion": {
      const h = hebra(9);
      const ok = [...h].map((b) => A_ARN[b]).join("");
      const conT = [...h].map((b) => COMPLEMENTO[b]).join("");
      const sinCambio = h.replace(/T/g, "U");
      const alReves = [...ok].reverse().join("");
      return opc(M, "transcripcion", `¿Qué ARN mensajero sale de transcribir esta hebra de ADN: ${h}?`, ok, [conT, sinCambio, alReves].filter((x) => x !== ok));
    }
    case "traduccion": {
      const usados = mezclar(Object.keys(CODONES).filter((c) => c !== "AUG")).slice(0, 2);
      const arn = ["AUG", ...usados];
      const ok = arn.map((c) => CODONES[c]).join("-");
      const tabla = mezclar([...arn, ...mezclar(Object.keys(CODONES).filter((c) => !arn.includes(c))).slice(0, 2)])
        .map((c) => `${c} = ${CODONES[c]}`)
        .join(", ");
      const otros = [
        ["AUG", usados[1], usados[0]].map((c) => CODONES[c]).join("-"),
        [usados[0], "AUG", usados[1]].map((c) => CODONES[c]).join("-"),
        ["AUG", usados[0], mezclar(Object.keys(CODONES).filter((c) => !arn.includes(c)))[0]].map((c) => CODONES[c]).join("-"),
      ];
      return opc(M, "traduccion", `Traduce el ARN mensajero ${enTripletes(arn.join(""))} con esta tabla: ${tabla}.`, ok, otros.filter((x) => x !== ok));
    }
    case "punnett": {
      const p1 = elegir(["AA", "Aa", "aa"] as const);
      const p2 = elegir(["Aa", "Aa", "aa", "AA"] as const);
      const r = elegir(RASGOS);
      const recesivo = Q[p1] * Q[p2];
      const hetero = (1 - Q[p1]) * Q[p2] + Q[p1] * (1 - Q[p2]);
      const que = elegir(["dom", "rec", "het"] as const);
      const base = `En arvejas, «${r.dom}» (A) domina sobre «${r.rec}» (a). Cruzas ${p1} × ${p2}.`;
      if (que === "dom") return num(M, "punnett_dom", `${base} ¿Qué porcentaje de las crías tiene ${r.dom}?`, (1 - recesivo) * 100);
      if (que === "rec") return num(M, "punnett_rec", `${base} ¿Qué porcentaje de las crías tiene ${r.rec}?`, recesivo * 100);
      return num(M, "punnett_het", `${base} ¿Qué porcentaje de las crías es heterocigota (Aa)?`, hetero * 100);
    }
    case "dihibrido": {
      // AaBb × AaBb: amarilla (A) / verde (a), lisa (B) / rugosa (b).
      const casos = [
        { q: "amarillas y lisas", n16: 9 },
        { q: "amarillas y rugosas", n16: 3 },
        { q: "verdes y lisas", n16: 3 },
        { q: "verdes y rugosas", n16: 1 },
      ];
      const c = elegir(casos);
      return num(M, "dihibrido", `En arvejas, amarilla (A) domina sobre verde (a) y lisa (B) sobre rugosa (b). Cruzas AaBb × AaBb. ¿Cuántas de cada 16 semillas salen ${c.q}?`, c.n16);
    }
    case "incompleta": {
      if (elegir([true, false])) return opc(M, "incompleta", "En el dondiego de noche, flor roja × flor blanca da todas rosadas (dominancia incompleta). Si cruzas dos rosadas, ¿qué sale?", "1 roja : 2 rosadas : 1 blanca", ["Todas rosadas", "3 rojas : 1 blanca", "1 roja : 1 blanca"]);
      return num(M, "incompleta_pct", "En el dondiego de noche, roja × blanca da rosadas (dominancia incompleta). Si cruzas dos rosadas, ¿qué porcentaje de las crías sale rosada?", 50);
    }
    case "abo": {
      const p1 = elegir(GENOTIPOS_ABO);
      const p2 = elegir(GENOTIPOS_ABO);
      const ok = textoGrupos(gruposHijos(p1.alelos, p2.alelos));
      const posibles = ["Solo A", "Solo B", "Solo AB", "Solo O", "A y O", "B y O", "A y B", "A, B y AB", "A, B, AB y O", "A y AB", "B y AB"];
      return opc(M, "abo", `Una madre de genotipo ${p1.texto} y un padre ${p2.texto} (grupos sanguíneos ABO; O es recesivo, A y B son codominantes). ¿Qué grupos pueden tener sus hijos?`, ok, posibles.filter((x) => x !== ok));
    }
    case "ligado_x": {
      const madre = elegir([
        { texto: "XᴰXᴰ (sana)", d: 0 },
        { texto: "XᴰXᵈ (portadora)", d: 0.5 },
        { texto: "XᵈXᵈ (daltónica)", d: 1 },
      ]);
      const padreDalt = elegir([true, false]);
      const padre = padreDalt ? "XᵈY (daltónico)" : "XᴰY (sano)";
      const que = elegir(["hijos", "hijas", "portadoras"] as const);
      const base = `El daltonismo es recesivo y va en el cromosoma X. Madre ${madre.texto} y padre ${padre}.`;
      if (que === "hijos") return num(M, "x_hijos", `${base} ¿Qué porcentaje de sus hijos VARONES será daltónico?`, madre.d * 100);
      if (que === "hijas") return num(M, "x_hijas", `${base} ¿Qué porcentaje de sus hijas MUJERES será daltónica?`, (padreDalt ? madre.d : 0) * 100);
      // Portadora = Xᴰ de un lado y Xᵈ del otro.
      const portadoras = padreDalt ? 1 - madre.d : madre.d;
      return num(M, "x_portadoras", `${base} ¿Qué porcentaje de sus hijas MUJERES será portadora (XᴰXᵈ)?`, portadoras * 100);
    }
    case "chargaff": {
      const a = randomInt(10, 40);
      const que = elegir(["T", "G", "C"] as const);
      return num(M, `chargaff_${que}`, `En un ADN, el ${a} % de las bases son adenina (A). ¿Qué porcentaje son ${que === "T" ? "timina (T)" : que === "G" ? "guanina (G)" : "citosina (C)"}?`, que === "T" ? a : 50 - a);
    }
    case "mutacion":
      return deTabla(M, "mutacion", MUTACIONES);
  }
}

// ============================================================
// 4) Sistemas del cuerpo (cómo funcionan)
// ============================================================

const QUE_HACE: Item[] = [
  { q: "¿Qué sistema lleva oxígeno y nutrientes a todas las células?", ok: "Circulatorio" },
  { q: "¿Qué sistema rompe los alimentos en partes que el cuerpo puede usar?", ok: "Digestivo" },
  { q: "¿Qué sistema intercambia oxígeno y dióxido de carbono con el aire?", ok: "Respiratorio" },
  { q: "¿Qué sistema filtra la sangre y forma la orina?", ok: "Excretor (urinario)" },
  { q: "¿Qué sistema manda mensajes con hormonas?", ok: "Endocrino" },
  { q: "¿Qué sistema defiende al cuerpo de microbios?", ok: "Inmune" },
  { q: "¿Qué sistema manda mensajes rápidos con impulsos eléctricos?", ok: "Nervioso" },
  { q: "Corres y respiras más rápido. ¿Qué sistema trabaja más para darte oxígeno?", ok: "Respiratorio" },
  { q: "Tienes fiebre por una infección. ¿Qué sistema está peleando contra el microbio?", ok: "Inmune" },
  { q: "Orinas más después de tomar mucha agua. ¿Qué sistema saca el agua de más?", ok: "Excretor (urinario)" },
  { q: "Sientes el corazón latir fuerte después de subir una escalera. ¿Qué sistema es?", ok: "Circulatorio" },
  { q: "Retiras la mano de algo caliente antes de pensarlo. ¿Qué sistema lo hace?", ok: "Nervioso" },
  { q: "Creces durante la adolescencia por señales que van por la sangre. ¿Qué sistema las manda?", ok: "Endocrino" },
  { q: "Después de comer, tu cuerpo convierte el pan en azúcar que puede absorber. ¿Qué sistema lo hace?", ok: "Digestivo" },
];
// Nutrientes y hábitos (niveles 1-4): cómo usa el cuerpo lo que come y respira.
const NUTRICION: Item[] = [
  { q: "¿Qué nutriente usa el cuerpo sobre todo para crecer y reparar tejidos?", ok: "Proteínas", no: ["Azúcares", "Agua", "Fibra"] },
  { q: "¿Qué nutriente da energía rápida, como el pan y el arroz?", ok: "Carbohidratos", no: ["Proteínas", "Vitaminas", "Minerales"] },
  { q: "¿Qué mineral hace fuertes el esqueleto y los dientes?", ok: "Calcio", no: ["Sodio", "Yodo", "Flúor del aire"] },
  { q: "¿Qué mineral forma parte de la hemoglobina, que lleva el oxígeno en la sangre?", ok: "Hierro", no: ["Calcio", "Potasio", "Zinc"] },
  { q: "La fibra de las verduras ayuda sobre todo a…", ok: "Que el intestino funcione bien", no: ["Fabricar músculos", "Llevar oxígeno", "Ver de noche"] },
  { q: "¿Qué vitamina fabrica la piel con la luz del sol?", ok: "Vitamina D", no: ["Vitamina C", "Vitamina A", "Vitamina B12"] },
  { q: "¿Qué gas sale del cuerpo cuando exhalas, como desecho?", ok: "Dióxido de carbono", no: ["Oxígeno puro", "Nitrógeno nuevo", "Hidrógeno"] },
  { q: "¿Por qué se acelera el pulso al hacer ejercicio?", ok: "Los músculos necesitan más oxígeno y glucosa", no: ["Para enfriar la sangre", "Porque se acaban los glóbulos rojos", "Para digerir más rápido"] },
  { q: "¿Qué parte de la sangre lleva el oxígeno?", ok: "Los glóbulos rojos", no: ["Las plaquetas", "Los glóbulos blancos", "El plasma solo"] },
  { q: "¿Qué parte de la sangre defiende de los microbios?", ok: "Los glóbulos blancos", no: ["Los glóbulos rojos", "Las plaquetas", "El agua del plasma"] },
];
const DIGESTION: Item[] = [
  { q: "¿Dónde empieza la digestión del almidón (el pan, la papa)?", ok: "En la boca, con la saliva", no: ["En el estómago", "En el intestino grueso", "En el hígado"] },
  { q: "¿Dónde empieza la digestión de las proteínas?", ok: "En el estómago", no: ["En la boca", "En el intestino grueso", "En el esófago"] },
  { q: "¿Dónde se absorben la mayoría de los nutrientes?", ok: "En el intestino delgado", no: ["En el estómago", "En el intestino grueso", "En la boca"] },
  { q: "¿Dónde se absorbe sobre todo el agua que queda?", ok: "En el intestino grueso", no: ["En el estómago", "En el esófago", "En la boca"] },
  { q: "¿Qué enzima rompe el almidón?", ok: "Amilasa", no: ["Pepsina", "Lipasa", "Insulina"] },
  { q: "¿Qué enzima del estómago rompe las proteínas?", ok: "Pepsina", no: ["Amilasa", "Lipasa", "Bilis"] },
  { q: "¿Qué enzima rompe las grasas?", ok: "Lipasa", no: ["Amilasa", "Pepsina", "Glucagón"] },
  { q: "¿Qué hace la bilis con las grasas?", ok: "Las separa en gotitas para digerirlas mejor", no: ["Las convierte en azúcar", "Las absorbe", "Las expulsa sin digerir"] },
];
const CIRCULACION: Item[] = [
  { q: "La sangre sale del ventrículo derecho. ¿Adónde va?", ok: "A los pulmones, por la arteria pulmonar", no: ["Al cuerpo, por la aorta", "A la aurícula izquierda", "Al hígado"] },
  { q: "La sangre vuelve de los pulmones, cargada de oxígeno. ¿Adónde llega?", ok: "A la aurícula izquierda", no: ["A la aurícula derecha", "Al ventrículo derecho", "A la vena cava"] },
  { q: "La sangre sale del ventrículo izquierdo. ¿Por dónde va al cuerpo?", ok: "Por la aorta", no: ["Por la arteria pulmonar", "Por las venas cavas", "Por las venas pulmonares"] },
  { q: "La sangre del cuerpo vuelve al corazón por las venas cavas. ¿Adónde llega?", ok: "A la aurícula derecha", no: ["A la aurícula izquierda", "Al ventrículo izquierdo", "A los pulmones"] },
  { q: "¿Qué hacen las arterias?", ok: "Llevan sangre desde el corazón", no: ["Traen sangre hacia el corazón", "Filtran la sangre", "Fabrican sangre"] },
  { q: "¿Dónde pasan el oxígeno y los nutrientes de la sangre a las células?", ok: "En los capilares", no: ["En las arterias grandes", "En la aorta", "En el corazón"] },
  { q: "En el alvéolo pulmonar, ¿qué pasa del aire a la sangre?", ok: "Oxígeno", no: ["Dióxido de carbono", "Glucosa", "Agua"] },
  { q: "En el alvéolo pulmonar, ¿qué pasa de la sangre al aire?", ok: "Dióxido de carbono", no: ["Oxígeno", "Glucosa", "Proteínas"] },
];
const HORMONAS: Item[] = [
  { q: "¿Qué hormona baja el azúcar en la sangre?", ok: "Insulina" },
  { q: "¿Qué hormona sube el azúcar en la sangre cuando hace falta?", ok: "Glucagón" },
  { q: "¿Qué hormona te prepara para huir o pelear ante un susto?", ok: "Adrenalina" },
  { q: "¿Qué hormona de la tiroides regula la velocidad del metabolismo?", ok: "Tiroxina" },
  { q: "¿Qué hormona hace que los riñones guarden agua y orines menos?", ok: "Antidiurética (ADH)" },
  { q: "¿Qué hormona ayuda a dormir cuando oscurece?", ok: "Melatonina" },
  { q: "¿Qué glándula fabrica la insulina?", ok: "El páncreas", no: ["La tiroides", "La hipófisis", "Las suprarrenales"] },
  { q: "¿Qué glándulas fabrican la adrenalina?", ok: "Las suprarrenales", no: ["El páncreas", "La tiroides", "La pineal"] },
];
const RINON: Item[] = [
  { q: "En la nefrona, ¿cómo se llama el paso donde la sangre se cuela y sale el líquido con desechos?", ok: "Filtración", no: ["Reabsorción", "Secreción", "Digestión"] },
  { q: "En la nefrona, la glucosa y el agua útil vuelven a la sangre. Es la…", ok: "Reabsorción", no: ["Filtración", "Secreción", "Excreción"] },
  { q: "¿Qué desecho de las proteínas elimina sobre todo la orina?", ok: "Urea", no: ["Glucosa", "Oxígeno", "Bilis"] },
];
const DEFENSAS: Item[] = [
  { q: "La piel, el moco y las lágrimas son defensas…", ok: "Innatas: actúan rápido contra cualquier microbio", no: ["Adquiridas: aprenden de cada microbio", "Hormonales", "Digestivas"] },
  { q: "¿Qué células fabrican los anticuerpos?", ok: "Los linfocitos B", no: ["Los glóbulos rojos", "Las plaquetas", "Las neuronas"] },
  { q: "¿Por qué funciona una vacuna?", ok: "El cuerpo aprende a reconocer al microbio y lo recuerda", no: ["Mata todos los microbios del cuerpo", "Reemplaza a los glóbulos blancos", "Es un antibiótico"] },
  { q: "La segunda vez que te encuentras con el mismo virus, la defensa es…", ok: "Más rápida y más fuerte", no: ["Igual de lenta", "Más débil", "Inexistente"] },
  { q: "Te cortas y la sangre se coagula. ¿Quiénes ayudan primero?", ok: "Las plaquetas", no: ["Los glóbulos rojos", "Los linfocitos B", "Las neuronas"] },
];
const NERVIOSO: Item[] = [
  { q: "En un reflejo (tocas algo caliente), ¿cuál es el orden?", ok: "Receptor → neurona sensitiva → médula → neurona motora → músculo", no: ["Músculo → médula → receptor → cerebro", "Cerebro → receptor → músculo → médula", "Receptor → músculo → médula → neurona"] },
  { q: "¿Cómo pasa el mensaje de una neurona a la siguiente en la sinapsis?", ok: "Con sustancias químicas (neurotransmisores)", no: ["Con sangre", "Con hormonas que van por la sangre", "Con aire"] },
  { q: "Sudas cuando hace calor y tiemblas cuando hace frío. El cuerpo está…", ok: "Manteniendo su temperatura estable (homeostasis)", no: ["Enfermándose", "Haciendo digestión", "Fabricando anticuerpos"] },
  { q: "Comes, sube el azúcar en la sangre, sale insulina y el azúcar baja. Es…", ok: "Retroalimentación negativa", no: ["Retroalimentación positiva", "Un reflejo", "Una fermentación"] },
];

function sistemas(nivel: number): ProblemaVitalia {
  const n = clamp(nivel, 1, 10);
  const M: ModoVitalia = "sistemas";
  const tipo = elegirTipo(
    [
      ["que_hace", 1, 4],
      ["nutricion", 1, 4],
      ["pulso", 1, 6],
      ["digestion", 1, 6],
      ["circulacion", 3, 10],
      ["rinon", 5, 10],
      ["hormonas", 5, 10],
      ["defensas", 7, 10],
      ["nervioso", 7, 10],
      ["gasto", 7, 10],
    ] as const,
    n
  );
  if (tipo === "pulso") {
    const s = elegir([10, 15, 20, 30]);
    const latidos = randomInt(Math.ceil((55 * s) / 60), Math.floor((110 * s) / 60));
    return num(M, "pulso", `Cuentas ${latidos} latidos de tu corazón en ${s} segundos. ¿Cuántas pulsaciones por minuto son?`, (latidos * 60) / s);
  }
  if (tipo === "gasto") {
    const f = randomInt(12, 20) * 5;
    const v = randomInt(12, 16) * 5;
    if (elegir([true, false])) return num(M, "gasto", `El corazón late ${f} veces por minuto y en cada latido bombea ${v} mL de sangre. ¿Cuántos mL bombea por minuto?`, f * v);
    return num(M, "gasto", `El corazón bombea ${miles(f * v)} mL de sangre por minuto, ${v} mL en cada latido. ¿Cuántas veces late por minuto?`, f);
  }
  const tablas = { que_hace: QUE_HACE, nutricion: NUTRICION, digestion: DIGESTION, circulacion: CIRCULACION, rinon: RINON, hormonas: HORMONAS, defensas: DEFENSAS, nervioso: NERVIOSO };
  return deTabla(M, tipo, tablas[tipo]);
}

// ============================================================
// 5) Reinos y clasificación
// ============================================================

const REINO = { monera: "Moneras (bacterias)", protista: "Protistas", hongo: "Hongos", planta: "Plantas", animal: "Animales" } as const;
const ORGANISMOS: { nombre: string; reino: keyof typeof REINO }[] = [
  { nombre: "un perro", reino: "animal" },
  { nombre: "un águila", reino: "animal" },
  { nombre: "una esponja de mar", reino: "animal" },
  { nombre: "un coral", reino: "animal" },
  { nombre: "una lombriz", reino: "animal" },
  { nombre: "un helecho", reino: "planta" },
  { nombre: "un rosal", reino: "planta" },
  { nombre: "un musgo", reino: "planta" },
  { nombre: "un pino", reino: "planta" },
  { nombre: "un champiñón", reino: "hongo" },
  { nombre: "la levadura del pan", reino: "hongo" },
  { nombre: "el moho del pan", reino: "hongo" },
  { nombre: "una ameba", reino: "protista" },
  { nombre: "un paramecio", reino: "protista" },
  { nombre: "la bacteria Escherichia coli", reino: "monera" },
  { nombre: "una cianobacteria", reino: "monera" },
  { nombre: "una medusa", reino: "animal" },
  { nombre: "una mariposa", reino: "animal" },
  { nombre: "un cactus", reino: "planta" },
  { nombre: "un roble", reino: "planta" },
  { nombre: "una seta venenosa", reino: "hongo" },
  { nombre: "un alga parda gigante", reino: "protista" },
  { nombre: "la bacteria del yogur", reino: "monera" },
];
const RASGOS_REINO: Item[] = [
  { q: "Células sin núcleo, una sola célula. ¿Qué reino es?", ok: REINO.monera },
  { q: "Eucariotas, casi todos de una sola célula, como la ameba. ¿Qué reino es?", ok: REINO.protista },
  { q: "Pared de quitina; se alimentan absorbiendo lo que descomponen. ¿Qué reino es?", ok: REINO.hongo },
  { q: "Pluricelulares, con pared de celulosa, fabrican su propio alimento. ¿Qué reino es?", ok: REINO.planta },
  { q: "Pluricelulares, sin pared celular, comen a otros seres vivos. ¿Qué reino es?", ok: REINO.animal },
];
const CLASE_VERTEBRADO = { mamifero: "Mamífero", ave: "Ave", reptil: "Reptil", anfibio: "Anfibio", pez: "Pez" } as const;
const VERTEBRADOS: { nombre: string; clase: keyof typeof CLASE_VERTEBRADO }[] = [
  { nombre: "el delfín", clase: "mamifero" },
  { nombre: "el murciélago", clase: "mamifero" },
  { nombre: "la ballena", clase: "mamifero" },
  { nombre: "el pingüino", clase: "ave" },
  { nombre: "el avestruz", clase: "ave" },
  { nombre: "la tortuga", clase: "reptil" },
  { nombre: "el cocodrilo", clase: "reptil" },
  { nombre: "la serpiente", clase: "reptil" },
  { nombre: "la rana", clase: "anfibio" },
  { nombre: "la salamandra", clase: "anfibio" },
  { nombre: "el tiburón", clase: "pez" },
  { nombre: "el caballito de mar", clase: "pez" },
];
const INVERTEBRADOS: { nombre: string; grupo: string }[] = [
  { nombre: "la araña", grupo: "Artrópodos" },
  { nombre: "la mariposa", grupo: "Artrópodos" },
  { nombre: "el cangrejo", grupo: "Artrópodos" },
  { nombre: "el caracol", grupo: "Moluscos" },
  { nombre: "el pulpo", grupo: "Moluscos" },
  { nombre: "la lombriz de tierra", grupo: "Anélidos" },
  { nombre: "la medusa", grupo: "Cnidarios" },
  { nombre: "la estrella de mar", grupo: "Equinodermos" },
  { nombre: "el erizo de mar", grupo: "Equinodermos" },
  { nombre: "la hormiga", grupo: "Artrópodos" },
  { nombre: "el ciempiés", grupo: "Artrópodos" },
  { nombre: "el calamar", grupo: "Moluscos" },
  { nombre: "la almeja", grupo: "Moluscos" },
  { nombre: "la sanguijuela", grupo: "Anélidos" },
  { nombre: "el coral", grupo: "Cnidarios" },
  { nombre: "la anémona de mar", grupo: "Cnidarios" },
];
const PLANTAS_HONGOS: Item[] = [
  { q: "El musgo no tiene vasos para llevar agua. ¿A qué grupo pertenece?", ok: "Briofitas", no: ["Helechos", "Gimnospermas", "Angiospermas"] },
  { q: "Una planta tiene vasos pero no semillas: se reproduce por esporas. ¿Qué grupo es?", ok: "Helechos (pteridofitas)", no: ["Briofitas", "Gimnospermas", "Angiospermas"] },
  { q: "El pino tiene semillas en conos, sin fruto. ¿Qué grupo es?", ok: "Gimnospermas", no: ["Angiospermas", "Helechos", "Briofitas"] },
  { q: "El manzano tiene flores y sus semillas van dentro de un fruto. ¿Qué grupo es?", ok: "Angiospermas", no: ["Gimnospermas", "Helechos", "Briofitas"] },
  { q: "¿Qué tienen las angiospermas que no tiene ningún otro grupo de plantas?", ok: "Flores y frutos", no: ["Hojas", "Raíces", "Clorofila"] },
  { q: "La levadura es un hongo…", ok: "De una sola célula", no: ["Con flores", "Que hace fotosíntesis", "Sin ADN"] },
  { q: "¿Cómo se alimentan los hongos?", ok: "Absorben nutrientes de lo que descomponen", no: ["Hacen fotosíntesis", "Cazan con tentáculos", "Filtran el aire"] },
];
const CATEGORIAS = ["Dominio", "Reino", "Filo", "Clase", "Orden", "Familia", "Género", "Especie"];
const DOMINIOS: Item[] = [
  { q: "Una bacteria del suelo pertenece al dominio…", ok: "Bacteria", no: ["Archaea", "Eukarya", "Animalia"] },
  { q: "Un microbio que vive en aguas termales hirviendo, sin núcleo y distinto de las bacterias, es del dominio…", ok: "Archaea", no: ["Bacteria", "Eukarya", "Fungi"] },
  { q: "Un ser humano, un hongo y una planta son del dominio…", ok: "Eukarya", no: ["Bacteria", "Archaea", "Monera"] },
  { q: "¿Qué tienen en común los dominios Bacteria y Archaea?", ok: "Sus células no tienen núcleo", no: ["Hacen todos fotosíntesis", "Son pluricelulares", "Tienen pared de celulosa"] },
  { q: "Una ameba y un paramecio son del dominio…", ok: "Eukarya", no: ["Bacteria", "Archaea", "Protista"] },
  { q: "Un microbio del intestino de una vaca que produce metano, sin núcleo y que no es bacteria, es del dominio…", ok: "Archaea", no: ["Bacteria", "Eukarya", "Fungi"] },
  { q: "¿Cuántos dominios hay en la clasificación actual de los seres vivos?", ok: "3", no: ["2", "5", "8"] },
];
// Nombres científicos (género + especie) para preguntar cuál está bien escrito.
const ESPECIES_CIENTIFICAS = [
  ["Homo", "sapiens"],
  ["Canis", "lupus"],
  ["Felis", "catus"],
  ["Zea", "mays"],
  ["Panthera", "leo"],
  ["Panthera", "tigris"],
  ["Equus", "caballus"],
  ["Bos", "taurus"],
  ["Gallus", "gallus"],
  ["Musca", "domestica"],
  ["Oryza", "sativa"],
  ["Escherichia", "coli"],
] as const;

function reinos(nivel: number): ProblemaVitalia {
  const n = clamp(nivel, 1, 10);
  const M: ModoVitalia = "reinos";
  const tipo = elegirTipo(
    [
      ["organismo", 1, 4],
      ["rasgos", 1, 6],
      ["vertebrados", 1, 8],
      ["invertebrados", 3, 8],
      ["plantas_hongos", 5, 10],
      ["categorias", 7, 10],
      ["nombre_cientifico", 7, 10],
      ["dominios", 7, 10],
    ] as const,
    n
  );
  switch (tipo) {
    case "organismo": {
      const o = elegir(ORGANISMOS);
      return opc(M, "organismo", `¿A qué reino pertenece ${o.nombre}?`, REINO[o.reino], Object.values(REINO).filter((x) => x !== REINO[o.reino]));
    }
    case "rasgos":
      return deTabla(M, "rasgos", RASGOS_REINO);
    case "vertebrados": {
      const v = elegir(VERTEBRADOS);
      return opc(M, "vertebrados", `¿A qué clase de vertebrados pertenece ${v.nombre}?`, CLASE_VERTEBRADO[v.clase], Object.values(CLASE_VERTEBRADO).filter((x) => x !== CLASE_VERTEBRADO[v.clase]));
    }
    case "invertebrados": {
      const v = elegir(INVERTEBRADOS);
      return opc(M, "invertebrados", `¿A qué grupo de invertebrados pertenece ${v.nombre}?`, v.grupo, [...new Set(INVERTEBRADOS.map((x) => x.grupo))].filter((x) => x !== v.grupo));
    }
    case "plantas_hongos":
      return deTabla(M, "plantas_hongos", PLANTAS_HONGOS);
    case "categorias": {
      if (elegir([true, false])) {
        // ¿Cuál agrupa a más seres vivos? (la más amplia de dos categorías)
        const [a, b] = mezclar(CATEGORIAS.map((_, k) => k)).slice(0, 2);
        const ok = CATEGORIAS[Math.min(a, b)];
        return opc(M, "categorias", `¿Qué categoría agrupa a más seres vivos: «${CATEGORIAS[a]}» o «${CATEGORIAS[b]}»?`, ok, [CATEGORIAS[Math.max(a, b)], "Las dos agrupan los mismos", "Depende del ser vivo"]);
      }
      if (elegir([true, false])) {
        const i = randomInt(1, CATEGORIAS.length - 1);
        return opc(M, "categorias", `En la clasificación, ¿qué categoría va justo antes de «${CATEGORIAS[i]}» (de lo más amplio a lo más chico)?`, CATEGORIAS[i - 1], CATEGORIAS.filter((_, k) => k !== i - 1 && k !== i));
      }
      const i = randomInt(0, CATEGORIAS.length - 2);
      return opc(M, "categorias", `En la clasificación, ¿qué categoría va justo después de «${CATEGORIAS[i]}» (de lo más amplio a lo más chico)?`, CATEGORIAS[i + 1], CATEGORIAS.filter((_, k) => k !== i + 1 && k !== i));
    }
    case "nombre_cientifico": {
      const [g, e] = elegir(ESPECIES_CIENTIFICAS);
      const ok = `${g} ${e}`;
      return opc(M, "nombre_cientifico", "¿Cuál está bien escrito como nombre científico (y va en cursiva)?", ok, [`${g.toLowerCase()} ${e}`, `${g} ${e[0].toUpperCase()}${e.slice(1)}`, `${g.toUpperCase()} ${e.toUpperCase()}`, `${e} ${g}`]);
    }
    case "dominios":
      return deTabla(M, "dominios", DOMINIOS);
  }
}

// ============================================================
// 6) Ecología
// ============================================================

const CADENAS: { eslabones: string[] }[] = [
  { eslabones: ["el pasto", "el conejo", "el zorro", "el águila"] },
  { eslabones: ["las algas", "el pez pequeño", "la foca", "el tiburón"] },
  { eslabones: ["el maíz", "el saltamontes", "la rana", "la serpiente"] },
  { eslabones: ["las hojas", "la oruga", "el pájaro", "el halcón"] },
  { eslabones: ["el fitoplancton", "el krill", "el pingüino", "la orca"] },
  { eslabones: ["el trigo", "el ratón", "la culebra", "el búho"] },
  { eslabones: ["las bellotas", "la ardilla", "el zorro", "el lobo"] },
  { eslabones: ["el néctar de las flores", "la abeja", "la araña", "la lagartija"] },
];
const ROL = ["Productor", "Consumidor primario", "Consumidor secundario", "Consumidor terciario"];
const RELACIONES: Item[] = [
  { q: "La abeja toma néctar y a la vez poliniza la flor. Las dos ganan. Es…", ok: "Mutualismo" },
  { q: "La garrapata le chupa sangre al perro y lo perjudica. Es…", ok: "Parasitismo" },
  { q: "La rémora come las sobras del tiburón, que ni gana ni pierde. Es…", ok: "Comensalismo" },
  { q: "Dos leones pelean por la misma presa. Es…", ok: "Competencia" },
  { q: "El búho caza al ratón y se lo come. Es…", ok: "Depredación" },
  { q: "El pez payaso vive entre los tentáculos de la anémona, que lo protege, y él la limpia. Es…", ok: "Mutualismo" },
  { q: "La tenia vive en el intestino de una persona y se alimenta de lo que ella come. Es…", ok: "Parasitismo" },
  { q: "Una orquídea crece sobre la rama de un árbol para tener luz, sin dañarlo. Es…", ok: "Comensalismo" },
  { q: "Dos plantas vecinas se disputan la misma luz y la misma agua. Es…", ok: "Competencia" },
  { q: "El guepardo persigue y atrapa a una gacela. Es…", ok: "Depredación" },
];
const CICLOS: Item[] = [
  { q: "¿Qué proceso saca dióxido de carbono del aire?", ok: "La fotosíntesis", no: ["La respiración", "Quemar combustibles", "La descomposición"] },
  { q: "¿Qué devuelve carbono al aire como dióxido de carbono?", ok: "La respiración de los seres vivos", no: ["La fotosíntesis", "La lluvia", "La condensación"] },
  { q: "El vapor de agua se enfría en el cielo y forma nubes. Es la…", ok: "Condensación", no: ["Evaporación", "Precipitación", "Infiltración"] },
  { q: "El sol calienta el mar y el agua sube como vapor. Es la…", ok: "Evaporación", no: ["Condensación", "Precipitación", "Transpiración del suelo"] },
  { q: "¿Quiénes devuelven al suelo los nutrientes de los seres muertos?", ok: "Los descomponedores (hongos y bacterias)", no: ["Los productores", "Los consumidores primarios", "Los depredadores"] },
  { q: "¿Qué seres convierten el nitrógeno del aire en nitratos que las plantas pueden usar?", ok: "Bacterias fijadoras de nitrógeno", no: ["Los hongos de sombrero", "Los animales herbívoros", "Las algas del mar"] },
  { q: "Quemar petróleo y carbón agrega al aire sobre todo…", ok: "Dióxido de carbono", no: ["Oxígeno", "Nitrógeno", "Vapor de agua solamente"] },
  { q: "El agua que se filtra en el suelo y llega a las napas subterráneas. Es la…", ok: "Infiltración", no: ["Evaporación", "Condensación", "Transpiración"] },
  { q: "Las plantas sueltan vapor de agua por sus hojas. Es la…", ok: "Transpiración", no: ["Precipitación", "Infiltración", "Condensación"] },
  { q: "El aumento de dióxido de carbono en el aire refuerza…", ok: "El efecto invernadero y el calentamiento global", no: ["La capa de ozono", "La fotosíntesis de noche", "El enfriamiento de los océanos"] },
  { q: "¿Cómo pasa el nitrógeno de las plantas a los animales?", ok: "Cuando los animales comen plantas", no: ["Respirando aire", "Tomando agua de lluvia", "Con la luz del sol"] },
];

function ecologia(nivel: number): ProblemaVitalia {
  const n = clamp(nivel, 1, 10);
  const M: ModoVitalia = "ecologia";
  const tipo = elegirTipo(
    [
      ["rol", 1, 6],
      ["relaciones", 1, 8],
      ["diez", 5, 10],
      ["ciclos", 7, 10],
      ["recaptura", 7, 10],
      ["densidad", 3, 8],
    ] as const,
    n
  );
  switch (tipo) {
    case "rol": {
      const c = elegir(CADENAS);
      const i = randomInt(0, 3);
      return opc(M, "rol", `En la cadena ${c.eslabones.join(" → ")}, ¿qué papel ${/^(los|las) /.test(c.eslabones[i]) ? "cumplen" : "cumple"} ${c.eslabones[i]}?`, ROL[i], [...ROL.filter((_, k) => k !== i), "Descomponedor"]);
    }
    case "diez": {
      const base = elegir([1000, 10000, 20000, 50000, 100000]);
      const nivelT = randomInt(2, 4);
      const nombre = ["", "", "los consumidores primarios", "los consumidores secundarios", "los consumidores terciarios"][nivelT];
      if (n >= 7 && elegir([true, false])) {
        const llega = elegir([10, 20, 50, 100, 200, 500]);
        return num(M, "diez_inverso", `Si a cada nivel de la cadena pasa solo el 10 % de la energía, ¿cuántas kcal tienen que tener los productores para que lleguen ${llega} kcal a ${nombre}?`, llega * 10 ** (nivelT - 1));
      }
      return num(M, "diez_por_ciento", `Los productores de un ecosistema tienen ${miles(base)} kcal. Si a cada nivel pasa solo el 10 %, ¿cuántas kcal llegan a ${nombre}?`, base / 10 ** (nivelT - 1));
    }
    case "densidad": {
      const area = elegir([10, 20, 25, 50, 100]);
      const d = randomInt(2, 12);
      const ser = elegir(["margaritas", "caracoles", "hormigueros", "tréboles", "lombrices"]);
      return num(M, "densidad", `En un terreno de ${area} m² se cuentan ${d * area} ${ser}. ¿Cuál es la densidad de población, en ${ser} por m²?`, d);
    }
    case "recaptura": {
      // Captura y recaptura (Lincoln-Petersen): N = marcados × capturados ÷ recapturados marcados.
      const marcados = randomInt(4, 12) * 5;
      const recap = randomInt(2, 10);
      const factor = randomInt(2, 8);
      const capturados = recap * factor;
      const animal = elegir(["peces", "ratones", "mariposas", "escarabajos", "ranas"]);
      return num(M, "recaptura", `Para contar ${animal} de un lugar, se marcan ${marcados} y se sueltan. Días después se capturan ${capturados} y ${recap} tienen marca. ¿Cuántos ${animal} hay en total, aproximadamente?`, (marcados * capturados) / recap);
    }
    case "relaciones":
      return deTabla(M, "relaciones", RELACIONES);
    case "ciclos":
      return deTabla(M, "ciclos", CICLOS);
  }
}

// ============================================================

// «de» + nombre con artículo: «de el gato» → «del gato»; «de la mosca» queda igual.
function deArticulo(nombre: string): string {
  return nombre.startsWith("el ") ? `del ${nombre.slice(3)}` : `de ${nombre}`;
}

export function generarProblemaVitalia(modo: ModoVitalia, nivel: number): ProblemaVitalia {
  const p =
    modo === "celula" ? celula(nivel) : modo === "procesos" ? procesos(nivel) : modo === "genetica" ? genetica(nivel) : modo === "sistemas" ? sistemas(nivel) : modo === "reinos" ? reinos(nivel) : ecologia(nivel);
  return { ...p, pasos: pasosVitalia(p) };
}

export function claveVitalia(p: ProblemaVitalia): string {
  return `${p.enunciado}|${p.respuesta}|${p.diagrama ? JSON.stringify(p.diagrama) : ""}`;
}

// ---------- Reto diario (opción múltiple, sin dibujos) ----------

export interface PreguntaVitaliaReto {
  mundo: "vitalia";
  enunciado: string;
  opciones: string[];
  respuesta: string;
}

export function preguntaVitalia(rng: () => number): PreguntaVitaliaReto {
  return conRngSembrado(rng, () => {
    let p = generarProblemaVitalia(elegir(["celula", "procesos", "genetica", "sistemas", "reinos", "ecologia"] as const), randomInt(2, 8));
    while (p.diagrama || p.entrada === "numero") p = generarProblemaVitalia(elegir(["celula", "procesos", "genetica", "sistemas", "reinos", "ecologia"] as const), randomInt(2, 8));
    return { mundo: "vitalia" as const, enunciado: p.enunciado, opciones: p.opciones, respuesta: p.respuesta };
  });
}
