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
];

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
];

function celula(nivel: number): ProblemaVitalia {
  const n = clamp(nivel, 1, 10);
  const M: ModoVitalia = "celula";
  const tipo = elegirPonderado(
    [
      ["teoria", 1],
      ["funcion", 3],
      ["organelo_de", 3],
      ["senalar", 5],
      ["animal_vegetal", 5],
      ["medios", 7],
      ["biomoleculas", 9],
    ] as const,
    n
  );
  switch (tipo) {
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
      return deTabla(M, "animal_vegetal", [
        { q: "Una célula tiene pared celular, cloroplastos y una vacuola grande. Es…", ok: "Vegetal", no: ["Animal", "Bacteriana", "De un hongo"] },
        { q: "Una célula no tiene pared ni cloroplastos y tiene muchas vacuolas chicas. Es…", ok: "Animal", no: ["Vegetal", "Bacteriana", "De un alga"] },
        { q: "¿Qué parte tiene la célula vegetal y NO la animal?", ok: "Cloroplastos", no: ["Núcleo", "Mitocondrias", "Ribosomas"] },
        { q: "¿Qué parte tienen TANTO la célula animal como la vegetal?", ok: "Mitocondrias", no: ["Pared celular", "Cloroplastos", "Una vacuola central grande"] },
      ]);
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
];
const LUGARES: Item[] = [
  { q: "¿Dónde ocurre la fotosíntesis?", ok: "En los cloroplastos" },
  { q: "¿Dónde ocurre la respiración celular con oxígeno?", ok: "En las mitocondrias" },
  { q: "¿Dónde ocurre la glucólisis, el primer paso para romper la glucosa?", ok: "En el citoplasma" },
  { q: "¿Dónde se copia el ADN antes de dividirse una célula eucariota?", ok: "En el núcleo" },
  { q: "¿Dónde se fabrican las proteínas?", ok: "En los ribosomas" },
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
  const tipo = elegirPonderado(
    [
      ["foto_resp", 1],
      ["lugares", 3],
      ["quien", 3],
      ["fase_dibujo", 5],
      ["fase_texto", 5],
      ["orden", 6],
      ["cromosomas", 7],
      ["ciclo", 8],
      ["atp", 9],
    ] as const,
    n
  );
  switch (tipo) {
    case "foto_resp":
      return deTabla(M, "foto_resp", FOTO_RESP);
    case "lugares":
      return deTabla(M, "lugares", LUGARES);
    case "quien":
      return deTabla(M, "quien", QUIEN_FOTO);
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
      const que = elegir(["gameto", "mitosis", "meiosis"] as const);
      if (que === "gameto") return num(M, "cromosomas_gameto", `Las células del cuerpo de ${e.nombre} tienen ${e.dosN} cromosomas (2n). ¿Cuántos tiene un gameto (óvulo o espermatozoide)?`, e.dosN / 2);
      if (que === "mitosis") return num(M, "cromosomas_mitosis", `Una célula de ${e.nombre} con ${e.dosN} cromosomas hace mitosis. ¿Cuántos cromosomas tiene cada célula hija?`, e.dosN);
      return num(M, "cromosomas_meiosis", `Una célula de ${e.nombre} con ${e.dosN} cromosomas termina la meiosis. ¿Cuántas células se forman?`, 4);
    }
    case "ciclo":
      return deTabla(M, "ciclo", CICLO);
    case "atp": {
      const g = randomInt(2, 9);
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
];
const MUTACIONES: Item[] = [
  { q: "Una letra del ADN cambia por otra (ATG → ACG). Es una mutación por…", ok: "Sustitución", no: ["Inserción", "Deleción", "Duplicación del cromosoma"] },
  { q: "Se agrega una letra nueva al ADN. Es una mutación por…", ok: "Inserción", no: ["Sustitución", "Deleción", "Traducción"] },
  { q: "Se pierde una letra del ADN. Es una mutación por…", ok: "Deleción", no: ["Inserción", "Sustitución", "Transcripción"] },
];

function genetica(nivel: number): ProblemaVitalia {
  const n = clamp(nivel, 1, 10);
  const M: ModoVitalia = "genetica";
  const tipo = elegirPonderado(
    [
      ["vocabulario", 1],
      ["complementaria", 3],
      ["transcripcion", 4],
      ["traduccion", 5],
      ["punnett", 5],
      ["dihibrido", 7],
      ["incompleta", 7],
      ["abo", 8],
      ["ligado_x", 9],
      ["chargaff", 9],
      ["mutacion", 9],
    ] as const,
    n
  );
  switch (tipo) {
    case "vocabulario":
      return deTabla(M, "vocabulario", VOCABULARIO);
    case "complementaria": {
      const h = hebra(6 + (n > 3 ? 3 : 0));
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
  const tipo = elegirPonderado(
    [
      ["que_hace", 1],
      ["digestion", 3],
      ["circulacion", 5],
      ["rinon", 7],
      ["hormonas", 7],
      ["defensas", 9],
      ["nervioso", 9],
    ] as const,
    n
  );
  const tablas = { que_hace: QUE_HACE, digestion: DIGESTION, circulacion: CIRCULACION, rinon: RINON, hormonas: HORMONAS, defensas: DEFENSAS, nervioso: NERVIOSO };
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
];
const PLANTAS_HONGOS: Item[] = [
  { q: "El musgo no tiene vasos para llevar agua. ¿A qué grupo pertenece?", ok: "Briofitas", no: ["Helechos", "Gimnospermas", "Angiospermas"] },
  { q: "El helecho tiene vasos pero no semillas: se reproduce por esporas. ¿Qué grupo es?", ok: "Helechos (pteridofitas)", no: ["Briofitas", "Gimnospermas", "Angiospermas"] },
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
];

function reinos(nivel: number): ProblemaVitalia {
  const n = clamp(nivel, 1, 10);
  const M: ModoVitalia = "reinos";
  const tipo = elegirPonderado(
    [
      ["organismo", 1],
      ["rasgos", 3],
      ["vertebrados", 5],
      ["invertebrados", 6],
      ["plantas_hongos", 7],
      ["categorias", 9],
      ["nombre_cientifico", 9],
      ["dominios", 9],
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
      const i = randomInt(0, CATEGORIAS.length - 2);
      return opc(M, "categorias", `En la clasificación, ¿qué categoría va justo después de «${CATEGORIAS[i]}» (de lo más amplio a lo más chico)?`, CATEGORIAS[i + 1], CATEGORIAS.filter((_, k) => k !== i + 1 && k !== i));
    }
    case "nombre_cientifico": {
      const [g, e] = elegir([["Homo", "sapiens"], ["Canis", "lupus"], ["Felis", "catus"], ["Zea", "mays"], ["Panthera", "leo"]] as const);
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
];
const ROL = ["Productor", "Consumidor primario", "Consumidor secundario", "Consumidor terciario"];
const RELACIONES: Item[] = [
  { q: "La abeja toma néctar y a la vez poliniza la flor. Las dos ganan. Es…", ok: "Mutualismo" },
  { q: "La garrapata le chupa sangre al perro y lo perjudica. Es…", ok: "Parasitismo" },
  { q: "La rémora come las sobras del tiburón, que ni gana ni pierde. Es…", ok: "Comensalismo" },
  { q: "Dos leones pelean por la misma presa. Es…", ok: "Competencia" },
  { q: "El búho caza al ratón y se lo come. Es…", ok: "Depredación" },
];
const CICLOS: Item[] = [
  { q: "¿Qué proceso saca dióxido de carbono del aire?", ok: "La fotosíntesis", no: ["La respiración", "Quemar combustibles", "La descomposición"] },
  { q: "¿Qué devuelve carbono al aire como dióxido de carbono?", ok: "La respiración de los seres vivos", no: ["La fotosíntesis", "La lluvia", "La condensación"] },
  { q: "El vapor de agua se enfría en el cielo y forma nubes. Es la…", ok: "Condensación", no: ["Evaporación", "Precipitación", "Infiltración"] },
  { q: "El sol calienta el mar y el agua sube como vapor. Es la…", ok: "Evaporación", no: ["Condensación", "Precipitación", "Transpiración del suelo"] },
  { q: "¿Quiénes devuelven al suelo los nutrientes de los seres muertos?", ok: "Los descomponedores (hongos y bacterias)", no: ["Los productores", "Los consumidores primarios", "Los depredadores"] },
];

function ecologia(nivel: number): ProblemaVitalia {
  const n = clamp(nivel, 1, 10);
  const M: ModoVitalia = "ecologia";
  const tipo = elegirPonderado(
    [
      ["rol", 1],
      ["diez", 5],
      ["relaciones", 6],
      ["ciclos", 8],
    ] as const,
    n
  );
  switch (tipo) {
    case "rol": {
      const c = elegir(CADENAS);
      const i = randomInt(0, 3);
      return opc(M, "rol", `En la cadena ${c.eslabones.join(" → ")}, ¿qué papel cumple ${c.eslabones[i]}?`, ROL[i], [...ROL.filter((_, k) => k !== i), "Descomponedor"]);
    }
    case "diez": {
      const base = elegir([1000, 10000, 20000, 50000, 100000]);
      const nivelT = randomInt(2, 4);
      const nombre = ["", "", "los consumidores primarios", "los consumidores secundarios", "los consumidores terciarios"][nivelT];
      return num(M, "diez_por_ciento", `Los productores de un ecosistema tienen ${miles(base)} kcal. Si a cada nivel pasa solo el 10 %, ¿cuántas kcal llegan a ${nombre}?`, base / 10 ** (nivelT - 1));
    }
    case "relaciones":
      return deTabla(M, "relaciones", RELACIONES);
    case "ciclos":
      return deTabla(M, "ciclos", CICLOS);
  }
}

// ============================================================

export function generarProblemaVitalia(modo: ModoVitalia, nivel: number): ProblemaVitalia {
  if (modo === "celula") return celula(nivel);
  if (modo === "procesos") return procesos(nivel);
  if (modo === "genetica") return genetica(nivel);
  if (modo === "sistemas") return sistemas(nivel);
  if (modo === "reinos") return reinos(nivel);
  return ecologia(nivel);
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
