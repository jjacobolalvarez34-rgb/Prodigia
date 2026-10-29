// Anatomía: formatos de los niveles medios y altos (auditoría de variedad 2026-10-29,
// docs/AUDITORIA_PREGUNTAS.md). Antes los niveles 7-8 y 9-10 daban exactamente lo
// mismo (el generador solo miraba `banda >= 3`) y el modo óseo tenía un único formato
// en los niveles 3-6 (~25 preguntas). Todo lo que hay acá sale de las lecciones de
// Anatomía (src/lib/anatomia/lecciones y datos.ts): o se copia el dato tal cual del
// texto de la lección, o se usa directamente el quiz de la lección (pregunta,
// opciones, respuesta y explicación ya revisadas). anatomia.test.ts comprueba que
// cada respuesta de estos bancos aparezca en las lecciones de su sistema.
import { CLASES_ANATOMIA, TECNICAS_ANATOMIA, type PreguntaLeccionAnatomia } from "@/lib/anatomia/lecciones";
import type { GrupoAnatomia } from "@/lib/anatomia/grupos";
import type { FormatoAnatomia, PreguntaFormato } from "./anatomiaFormatos";

export type Rng = () => number;
type Generador = (usados: Set<string>, rng: Rng) => PreguntaFormato;

function mezclar<T>(arr: T[], rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function elegir<T>(arr: T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

function sinUsar<T>(candidatos: T[], clave: (x: T) => string, usados: Set<string>): T[] {
  const libres = candidatos.filter((x) => !usados.has(clave(x)));
  return libres.length > 0 ? libres : candidatos;
}

function armar(correcta: string, distractores: string[], rng: Rng, cantidad = 4): string[] {
  const unicos = Array.from(new Set(distractores.filter((d) => d !== correcta)));
  return mezclar([correcta, ...mezclar(unicos, rng).slice(0, cantidad - 1)], rng);
}

// ---------- Bancos de datos (enunciado, respuesta, alternativas incorrectas) ----------

export interface DatoAnatomia {
  e: string;
  r: string;
  // Alternativas INCORRECTAS (se eligen 3 al azar). Nunca incluyen otra respuesta válida.
  alt: string[];
  // Explicación para «Cómo se resuelve» (copiada o resumida de la lección).
  x: string;
}

function deDatos(prefijo: string, banco: DatoAnatomia[], formato: FormatoAnatomia): Generador {
  return (usados, rng) => {
    const d = elegir(sinUsar(banco, (x) => `${prefijo}:${x.e}`, usados), rng);
    return { enunciado: d.e, opciones: armar(d.r, d.alt, rng), respuesta: d.r, clave: `${prefijo}:${d.e}`, formato, pasos: [d.x, `Respuesta: ${d.r}`] };
  };
}

// Clase «El hueso por dentro» y «Cinturas y extremidades», Técnicas de mano y pie.
export const CANTIDADES_OSEO_MEDIO: DatoAnatomia[] = [
  { e: "¿Cuántos huesos tiene el esqueleto de un adulto?", r: "206", alt: ["106", "186", "226", "306"], x: "El esqueleto adulto tiene 206 huesos (el recién nacido, más de 270: varios se fusionan al crecer)." },
  { e: "¿Cuántas vértebras cervicales (del cuello) hay?", r: "7", alt: ["5", "8", "12"], x: "Regla 7 - 12 - 5: 7 cervicales, 12 torácicas y 5 lumbares." },
  { e: "¿Cuántas vértebras torácicas hay?", r: "12", alt: ["5", "7", "10"], x: "Regla 7 - 12 - 5: 7 cervicales, 12 torácicas y 5 lumbares." },
  { e: "¿Cuántas vértebras lumbares hay?", r: "5", alt: ["4", "7", "12"], x: "Regla 7 - 12 - 5: 7 cervicales, 12 torácicas y 5 lumbares." },
  { e: "¿Cuántos pares de costillas tiene la caja torácica?", r: "12", alt: ["7", "10", "24"], x: "Son 12 pares de costillas (aunque solo 7 pares sean verdaderas)." },
  { e: "¿Cuántos huesos carpianos tiene cada muñeca?", r: "8", alt: ["5", "7", "14"], x: "La mano tiene 8 carpianos, 5 metacarpianos y 14 falanges." },
  { e: "¿Cuántos huesos tarsianos tiene cada pie?", r: "7", alt: ["5", "8", "14"], x: "El pie tiene 7 tarsianos, 5 metatarsianos y 14 falanges (la mano tiene 8 carpianos)." },
  { e: "¿Cuántos metacarpianos tiene cada mano?", r: "5", alt: ["7", "8", "14"], x: "La mano tiene 8 carpianos, 5 metacarpianos y 14 falanges." },
  { e: "¿Cuántos metatarsianos tiene cada pie?", r: "5", alt: ["7", "8", "14"], x: "El pie tiene 7 tarsianos, 5 metatarsianos y 14 falanges." },
];

export const CANTIDADES_OSEO_ALTO: DatoAnatomia[] = [
  { e: "¿Cuántas falanges tiene cada mano?", r: "14", alt: ["5", "10", "15"], x: "La mano tiene 8 carpianos, 5 metacarpianos y 14 falanges." },
  { e: "¿Cuántas falanges tiene cada pie?", r: "14", alt: ["5", "10", "15"], x: "El pie tiene 7 tarsianos, 5 metatarsianos y 14 falanges." },
  { e: "¿Cuántos huesos tiene cada miembro superior?", r: "30", alt: ["26", "32", "60"], x: "Húmero, radio, cúbito y la mano (8 + 5 + 14): 30 huesos por lado." },
  { e: "¿Cuántos huesos tiene el cráneo en total?", r: "22", alt: ["8", "14", "28"], x: "8 craneales (protegen el encéfalo) y 14 faciales: 22 huesos." },
  { e: "¿Cuántos huesos faciales tiene el cráneo?", r: "14", alt: ["8", "12", "22"], x: "8 craneales y 14 faciales: 22 huesos en total." },
  { e: "¿Cuántos huesos tiene el esqueleto axial?", r: "80", alt: ["60", "106", "126"], x: "Axial (cráneo, columna, costillas y esternón): 80. Apendicular: 126. 80 + 126 = 206." },
  { e: "¿Cuántos huesos tiene el esqueleto apendicular?", r: "126", alt: ["80", "106", "146"], x: "Apendicular (cinturas y extremidades): 126. Axial: 80. 80 + 126 = 206." },
  { e: "¿Cuántos pares de costillas son verdaderas (llegan al esternón por su cartílago)?", r: "7", alt: ["3", "10", "12"], x: "Pares 1 a 7: verdaderas; 8 a 10: falsas; 11 y 12: flotantes." },
  { e: "¿Cuántas vértebras fusionadas forman el sacro?", r: "5", alt: ["3", "4", "7"], x: "El sacro son 5 vértebras fusionadas; el cóccix, de 3 a 5 (casi siempre 4)." },
  { e: "¿Cuántos huesecillos hay en cada oído medio?", r: "3", alt: ["2", "4", "6"], x: "Martillo, yunque y estribo: el estribo es el hueso más pequeño del cuerpo." },
];

// Clase «El hueso por dentro»: partes de un hueso largo, tejido y células.
export const HUESO_POR_DENTRO: DatoAnatomia[] = [
  { e: "¿Cómo se llama el cuerpo o eje de un hueso largo?", r: "Diáfisis", alt: ["Epífisis", "Periostio", "Cavidad medular"], x: "Un hueso largo tiene la diáfisis (el eje), dos epífisis (los extremos), el periostio (lo envuelve) y la cavidad medular." },
  { e: "¿Cómo se llaman los extremos de un hueso largo, cubiertos de cartílago articular?", r: "Epífisis", alt: ["Diáfisis", "Periostio", "Cavidad medular"], x: "Las epífisis son los dos extremos; la diáfisis es el eje." },
  { e: "¿Cómo se llama la membrana que envuelve el hueso, por donde entran vasos y nervios?", r: "Periostio", alt: ["Diáfisis", "Epífisis", "Cavidad medular"], x: "El periostio es la membrana que envuelve el hueso." },
  { e: "¿Cómo se llama el hueco dentro de la diáfisis, con médula amarilla en el adulto?", r: "Cavidad medular", alt: ["Diáfisis", "Epífisis", "Periostio"], x: "La cavidad medular está dentro de la diáfisis." },
  { e: "¿Qué tejido óseo, con pequeñas cavidades, aloja la médula ósea roja?", r: "Hueso esponjoso", alt: ["Hueso compacto", "Periostio", "Cartílago articular"], x: "El hueso compacto es denso y forma la capa exterior; el esponjoso, más liviano, aloja la médula ósea roja." },
  { e: "¿Qué tejido óseo, denso, forma la capa exterior del hueso?", r: "Hueso compacto", alt: ["Hueso esponjoso", "Periostio", "Cartílago articular"], x: "El hueso compacto es denso y forma la capa exterior; el esponjoso está adentro." },
  { e: "¿Qué células forman hueso nuevo?", r: "Osteoblastos", alt: ["Osteoclastos", "Osteocitos", "Glóbulos rojos"], x: "Los osteoblastos forman hueso; los osteoclastos lo reabsorben; los osteocitos lo mantienen." },
  { e: "¿Qué células reabsorben el hueso?", r: "Osteoclastos", alt: ["Osteoblastos", "Osteocitos", "Glóbulos rojos"], x: "Los osteoblastos forman hueso; los osteoclastos lo reabsorben; los osteocitos lo mantienen." },
  { e: "¿Qué células mantienen el hueso maduro?", r: "Osteocitos", alt: ["Osteoblastos", "Osteoclastos", "Glóbulos rojos"], x: "Los osteoblastos forman hueso; los osteoclastos lo reabsorben; los osteocitos lo mantienen." },
];

// Clase «El cráneo: 22 huesos y sus suturas», «Columna vertebral y caja torácica» y
// «Las articulaciones».
const SUTURAS = ["Coronal", "Sagital", "Lambdoidea", "Escamosa"];
const UNE_SUTURA = ["Frontal y parietales", "Los dos parietales", "Parietales y occipital", "Temporal y parietal"];
export const OSEO_EXPERTO: DatoAnatomia[] = [
  { e: "¿Qué sutura une el frontal con los parietales?", r: "Coronal", alt: SUTURAS, x: "Coronal: frontal y parietales. Sagital: entre los dos parietales. Lambdoidea: parietales y occipital. Escamosa: temporal y parietal." },
  { e: "¿Qué sutura recorre el techo del cráneo, entre los dos parietales?", r: "Sagital", alt: SUTURAS, x: "Coronal: frontal y parietales. Sagital: entre los dos parietales. Lambdoidea: parietales y occipital. Escamosa: temporal y parietal." },
  { e: "¿Qué sutura une los parietales con el occipital?", r: "Lambdoidea", alt: SUTURAS, x: "Coronal: frontal y parietales. Sagital: entre los dos parietales. Lambdoidea: parietales y occipital. Escamosa: temporal y parietal." },
  { e: "¿Qué sutura une el temporal con el parietal?", r: "Escamosa", alt: SUTURAS, x: "Coronal: frontal y parietales. Sagital: entre los dos parietales. Lambdoidea: parietales y occipital. Escamosa: temporal y parietal." },
  { e: "¿Qué huesos une la sutura coronal?", r: "Frontal y parietales", alt: UNE_SUTURA, x: "La sutura coronal está entre el frontal y los parietales." },
  { e: "¿Qué huesos une la sutura lambdoidea?", r: "Parietales y occipital", alt: UNE_SUTURA, x: "La sutura lambdoidea está entre los parietales y el occipital." },
  { e: "¿Qué huesos une la sutura escamosa?", r: "Temporal y parietal", alt: UNE_SUTURA, x: "La sutura escamosa está entre el temporal y el parietal." },
  { e: "¿En qué hueso está el agujero magno, por donde pasa la médula espinal?", r: "Occipital", alt: ["Frontal", "Esfenoides", "Etmoides", "Parietal"], x: "El occipital forma la nuca y la base del cráneo, con el agujero magno." },
  { e: "¿Cuál es el hueso más pequeño del cuerpo?", r: "Estribo", alt: ["Martillo", "Yunque", "Hioides", "Nasal"], x: "Martillo, yunque y estribo están en el oído medio; el estribo es el más pequeño del cuerpo." },
  { e: "¿Qué hueso suelto del cuello sostiene la lengua?", r: "Hioides", alt: ["Atlas", "Axis", "Estribo", "Mandíbula"], x: "El hioides es un hueso suelto en el cuello que sostiene la lengua." },
  { e: "¿Cómo se llama la primera vértebra cervical (C1), que sostiene el cráneo?", r: "Atlas", alt: ["Axis", "Sacro", "Cóccix"], x: "El atlas (C1) sostiene el cráneo; el axis (C2), con su diente, permite girar la cabeza." },
  { e: "¿Cómo se llama la segunda vértebra cervical (C2), cuyo diente permite girar la cabeza?", r: "Axis", alt: ["Atlas", "Sacro", "Cóccix"], x: "El atlas (C1) sostiene el cráneo; el axis (C2), con su diente, permite girar la cabeza." },
  { e: "¿Cómo se llaman los pares de costillas 11 y 12, que no llegan por delante?", r: "Flotantes", alt: ["Verdaderas", "Falsas", "Cervicales"], x: "Pares 1 a 7: verdaderas; 8 a 10: falsas; 11 y 12: flotantes (sí se unen atrás a la columna)." },
  { e: "¿Cómo se llaman los pares de costillas 1 a 7, que llegan al esternón por su cartílago?", r: "Verdaderas", alt: ["Flotantes", "Falsas", "Cervicales"], x: "Pares 1 a 7: verdaderas; 8 a 10: falsas; 11 y 12: flotantes." },
  { e: "¿Qué tipo de articulación sinovial es el hombro?", r: "Esférica", alt: ["Bisagra", "Pivote", "Plana"], x: "Esférica: hombro y cadera (todas las direcciones). Bisagra: codo. Pivote: atlas y axis. Plana: entre los carpianos." },
  { e: "¿Qué tipo de articulación sinovial es la cadera?", r: "Esférica", alt: ["Bisagra", "Pivote", "Plana"], x: "Esférica: hombro y cadera (todas las direcciones). Bisagra: codo. Pivote: atlas y axis. Plana: entre los carpianos." },
  { e: "¿Qué tipo de articulación sinovial es el codo?", r: "Bisagra", alt: ["Esférica", "Pivote", "Plana"], x: "Bisagra: el codo, que hace flexión y extensión." },
  { e: "¿Qué tipo de articulación sinovial hay entre el atlas y el axis?", r: "Pivote", alt: ["Esférica", "Bisagra", "Plana"], x: "Pivote: entre el atlas y el axis, permite girar la cabeza." },
  { e: "¿Qué tipo de articulación sinovial hay entre los carpianos?", r: "Plana", alt: ["Esférica", "Bisagra", "Pivote"], x: "Plana: entre los carpianos, permite deslizamientos." },
  { e: "¿Qué une un hueso con otro hueso en una articulación?", r: "Ligamento", alt: ["Tendón", "Periostio", "Cartílago articular"], x: "Ligamento: hueso con hueso. Tendón: músculo con hueso." },
  { e: "¿Qué une un músculo con un hueso?", r: "Tendón", alt: ["Ligamento", "Periostio", "Cartílago articular"], x: "Ligamento: hueso con hueso. Tendón: músculo con hueso." },
];

// ---------- Óseo: forma de cada hueso ----------

// Clase «El hueso por dentro»: «Por su forma, los huesos se clasifican en largos
// (fémur, húmero, tibia, peroné, radio, cúbito y falanges), cortos (carpianos y
// tarsianos), planos (frontal, parietales, occipital, esternón, escápula y costillas),
// irregulares (vértebras, esfenoides, etmoides y mandíbula) y sesamoideos (la rótula)».
export const FORMA_HUESO: { nombre: string; articulo: string; plural?: boolean; forma: string }[] = [
  { nombre: "Fémur", articulo: "el", forma: "Largo" },
  { nombre: "Húmero", articulo: "el", forma: "Largo" },
  { nombre: "Tibia", articulo: "la", forma: "Largo" },
  { nombre: "Peroné", articulo: "el", forma: "Largo" },
  { nombre: "Radio", articulo: "el", forma: "Largo" },
  { nombre: "Cúbito", articulo: "el", forma: "Largo" },
  { nombre: "Falanges", articulo: "las", plural: true, forma: "Largo" },
  { nombre: "Carpianos", articulo: "los", plural: true, forma: "Corto" },
  { nombre: "Tarsianos", articulo: "los", plural: true, forma: "Corto" },
  { nombre: "Frontal", articulo: "el", forma: "Plano" },
  { nombre: "Parietal", articulo: "el", forma: "Plano" },
  { nombre: "Occipital", articulo: "el", forma: "Plano" },
  { nombre: "Esternón", articulo: "el", forma: "Plano" },
  { nombre: "Escápula", articulo: "la", forma: "Plano" },
  { nombre: "Costillas", articulo: "las", plural: true, forma: "Plano" },
  { nombre: "Vértebras", articulo: "las", plural: true, forma: "Irregular" },
  { nombre: "Esfenoides", articulo: "el", forma: "Irregular" },
  { nombre: "Etmoides", articulo: "el", forma: "Irregular" },
  { nombre: "Mandíbula", articulo: "la", forma: "Irregular" },
  { nombre: "Rótula", articulo: "la", forma: "Sesamoideo" },
];
const FORMAS = ["Largo", "Corto", "Plano", "Irregular", "Sesamoideo"];
const EXPLICACION_FORMA =
  "Largos: fémur, húmero, tibia, peroné, radio, cúbito y falanges. Cortos: carpianos y tarsianos. Planos: frontal, parietales, occipital, esternón, escápula y costillas. Irregulares: vértebras, esfenoides, etmoides y mandíbula. Sesamoideo: la rótula.";

const formaDeHueso: Generador = (usados, rng) => {
  const h = elegir(sinUsar(FORMA_HUESO, (x) => `fh:${x.nombre}`, usados), rng);
  return {
    enunciado: `Por su forma, ¿qué tipo de hueso ${h.plural ? "son" : "es"} ${h.articulo} ${h.nombre.toLowerCase()}?`,
    opciones: armar(h.forma, FORMAS, rng),
    respuesta: h.forma,
    clave: `fh:${h.nombre}`,
    formato: "forma_hueso",
    pasos: [EXPLICACION_FORMA, `Respuesta: ${h.forma}`],
  };
};

const huesoDeForma: Generador = (usados, rng) => {
  const forma = elegir(sinUsar(FORMAS, (f) => `hf:${f}`, usados), rng);
  const correcto = elegir(FORMA_HUESO.filter((h) => h.forma === forma), rng);
  const distractores = FORMA_HUESO.filter((h) => h.forma !== forma).map((h) => h.nombre);
  return {
    enunciado: `Por su forma, ¿cuál de estos huesos es ${forma.toLowerCase()}?`,
    opciones: armar(correcto.nombre, distractores, rng),
    respuesta: correcto.nombre,
    clave: `hf:${forma}`,
    formato: "hueso_de_forma",
    pasos: [EXPLICACION_FORMA, `Respuesta: ${correcto.nombre}`],
  };
};

// ---------- Óseo: esqueleto axial o apendicular ----------

// Clase «Cinturas y extremidades»: axial = cráneo, columna, costillas y esternón;
// apendicular = cinturas (clavícula, escápula, coxal) y extremidades. La pelvis no
// entra: es un conjunto (dos coxales, que son apendiculares, más el sacro y el cóccix).
const AXIAL = ["Cráneo", "Columna vertebral", "Costillas", "Esternón"];
const APENDICULAR = ["Clavícula", "Escápula", "Coxal", "Húmero", "Radio", "Cúbito", "Fémur", "Rótula", "Tibia", "Peroné", "Carpianos", "Tarsianos"];
const esqueletoAxial: Generador = (usados, rng) => {
  const axial = rng() < 0.5;
  const [buenos, malos] = axial ? [AXIAL, APENDICULAR] : [APENDICULAR, AXIAL];
  const r = elegir(sinUsar(buenos, (x) => `ax:${x}`, usados), rng);
  return {
    enunciado: `¿Cuál de estos forma parte del esqueleto ${axial ? "axial (el eje del cuerpo)" : "apendicular (cinturas y extremidades)"}?`,
    opciones: armar(r, malos, rng),
    respuesta: r,
    clave: `ax:${r}`,
    formato: "esqueleto_axial",
    pasos: ["Axial: cráneo, columna, costillas y esternón (80 huesos). Apendicular: las cinturas (clavículas, escápulas y coxales) y las extremidades (126 huesos).", `Respuesta: ${r}`],
  };
};

// ---------- Óseo: descripción → hueso (las mismas descripciones de «Cómo se resuelve») ----------

export function descripcionAHueso(descripciones: Record<string, string>, pool: string[]): Generador {
  const candidatos = pool.filter((n) => descripciones[n]);
  return (usados, rng) => {
    const n = elegir(sinUsar(candidatos, (x) => `dh:${x}`, usados), rng);
    return {
      enunciado: `¿Qué hueso o parte del esqueleto se describe así: «${descripciones[n]}»?`,
      opciones: armar(n, candidatos, rng),
      respuesta: n,
      clave: `dh:${n}`,
      formato: "descripcion_hueso",
      pasos: [`${n}: ${descripciones[n]}`, `Respuesta: ${n}`],
    };
  };
}

// ---------- Muscular ----------

// Clase «Nombres, origen e inserción de los músculos grandes».
const ORIGEN_INSERCION: { m: string; o: string; i: string }[] = [
  { m: "Bíceps", o: "la escápula", i: "el radio" },
  { m: "Tríceps", o: "la escápula y el húmero", i: "el cúbito" },
  { m: "Deltoides", o: "la clavícula y la escápula", i: "el húmero" },
  { m: "Pectoral mayor", o: "la clavícula, el esternón y las costillas", i: "el húmero" },
  { m: "Dorsal ancho", o: "la espalda baja, el sacro y la cadera", i: "el húmero" },
  { m: "Trapecio", o: "el occipital y las vértebras", i: "la clavícula y la escápula" },
  { m: "Recto abdominal", o: "el pubis", i: "el esternón y las costillas 5 a 7" },
  { m: "Glúteos", o: "el ilion, el sacro y el cóccix", i: "el fémur" },
  { m: "Cuádriceps", o: "la cadera y el fémur", i: "la tibia, por la rótula" },
  { m: "Gastrocnemio", o: "el fémur", i: "el calcáneo, por el tendón de Aquiles" },
];
const origenInsercion: Generador = (usados, rng) => {
  const x = elegir(sinUsar(ORIGEN_INSERCION, (y) => `oi:${y.m}`, usados), rng);
  if (rng() < 0.5) {
    return {
      enunciado: `¿Qué músculo va de ${x.o} a ${x.i}?`,
      opciones: armar(x.m, ORIGEN_INSERCION.map((y) => y.m), rng),
      respuesta: x.m,
      clave: `oi:${x.m}`,
      formato: "origen_insercion",
      pasos: [`${x.m}: origen en ${x.o}, inserción en ${x.i}`, `Respuesta: ${x.m}`],
    };
  }
  const mayus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const r = mayus(x.i);
  const articulo = x.m === "Glúteos" ? "los" : "el";
  const verbo = x.m === "Glúteos" ? "se insertan" : "se inserta";
  return {
    enunciado: `¿Dónde ${verbo} ${articulo} ${x.m.toLowerCase()} (su extremo móvil)?`,
    opciones: armar(r, ORIGEN_INSERCION.map((y) => mayus(y.i)), rng),
    respuesta: r,
    clave: `io:${x.m}`,
    formato: "origen_insercion",
    pasos: [`${x.m}: origen en ${x.o}, inserción en ${x.i}`, `Respuesta: ${r}`],
  };
};

// Clases «Tipos de músculo», «Músculos de los brazos y las piernas», «Músculos del
// tronco» y «Músculos de la cabeza y el cuello».
const TIPOS_MUSCULO = ["Esquelético", "Liso", "Cardíaco"];
export const MUSCULAR_MEDIO: DatoAnatomia[] = [
  { e: "¿Qué tipo de músculo es voluntario y está unido a los huesos?", r: "Esquelético", alt: TIPOS_MUSCULO, x: "Esquelético: estriado, voluntario, unido a los huesos. Liso: no estriado, involuntario. Cardíaco: estriado, involuntario, solo en el corazón." },
  { e: "¿Qué tipo de músculo es involuntario y está solo en el corazón?", r: "Cardíaco", alt: TIPOS_MUSCULO, x: "Esquelético: estriado, voluntario, unido a los huesos. Liso: no estriado, involuntario. Cardíaco: estriado, involuntario, solo en el corazón." },
  { e: "¿Qué tipo de músculo NO es estriado y forma las paredes del estómago, el intestino y los vasos?", r: "Liso", alt: TIPOS_MUSCULO, x: "Esquelético: estriado, voluntario, unido a los huesos. Liso: no estriado, involuntario. Cardíaco: estriado, involuntario, solo en el corazón." },
  { e: "¿Cuántas cabezas tiene el bíceps?", r: "2", alt: ["1", "3", "4"], x: "El nombre dice el número de cabezas: bíceps 2, tríceps 3, cuádriceps 4." },
  { e: "¿Cuántas cabezas tiene el tríceps?", r: "3", alt: ["1", "2", "4"], x: "El nombre dice el número de cabezas: bíceps 2, tríceps 3, cuádriceps 4." },
  { e: "¿Cuántas cabezas tiene el cuádriceps?", r: "4", alt: ["1", "2", "3"], x: "El nombre dice el número de cabezas: bíceps 2, tríceps 3, cuádriceps 4." },
  { e: "¿Qué músculos flexionan la rodilla?", r: "Isquiotibiales", alt: ["Cuádriceps", "Gastrocnemio", "Tibial anterior", "Glúteos"], x: "En la rodilla, el cuádriceps extiende y los isquiotibiales flexionan." },
  { e: "¿Qué músculo extiende la rodilla?", r: "Cuádriceps", alt: ["Isquiotibiales", "Gastrocnemio", "Tibial anterior", "Glúteos"], x: "En la rodilla, el cuádriceps extiende y los isquiotibiales flexionan." },
  { e: "¿Qué músculo levanta la punta del pie?", r: "Tibial anterior", alt: ["Gastrocnemio", "Cuádriceps", "Isquiotibiales", "Glúteos"], x: "En el tobillo, el gastrocnemio levanta el talón y el tibial anterior levanta la punta." },
  { e: "¿Qué músculo hace lo contrario del cuádriceps en la rodilla?", r: "Isquiotibiales", alt: ["Gastrocnemio", "Tibial anterior", "Glúteos", "Bíceps"], x: "En la rodilla, el cuádriceps extiende y los isquiotibiales flexionan: son antagonistas." },
  { e: "¿Qué músculo hace lo contrario del gastrocnemio en el tobillo?", r: "Tibial anterior", alt: ["Cuádriceps", "Isquiotibiales", "Glúteos", "Tríceps"], x: "En el tobillo, el gastrocnemio levanta el talón y el tibial anterior levanta la punta: son antagonistas." },
];

export const MUSCULAR_EXPERTO: DatoAnatomia[] = [
  { e: "¿Cuál es el músculo más profundo de la pared abdominal?", r: "Transverso del abdomen", alt: ["Recto abdominal", "Oblicuo externo", "Oblicuo interno"], x: "Pared abdominal: recto abdominal (vertical; flexiona el tronco), oblicuos externo e interno (giran e inclinan el tronco) y transverso del abdomen (el más profundo; comprime)." },
  { e: "¿Qué músculo de la pared abdominal es vertical y flexiona el tronco?", r: "Recto abdominal", alt: ["Transverso del abdomen", "Oblicuo externo", "Oblicuo interno"], x: "Pared abdominal: recto abdominal (vertical; flexiona el tronco), oblicuos externo e interno (giran e inclinan el tronco) y transverso del abdomen (el más profundo; comprime)." },
  { e: "¿Qué músculo del cuello gira e inclina la cabeza?", r: "Esternocleidomastoideo", alt: ["Platisma", "Masetero", "Buccinador", "Occipital"], x: "El esternocleidomastoideo gira e inclina la cabeza; lo mueve el nervio accesorio (XI)." },
  { e: "¿Por qué tendón se inserta el gastrocnemio en el calcáneo?", r: "El tendón de Aquiles", alt: ["El tendón del cuádriceps", "El ligamento de la rodilla", "El tendón del bíceps"], x: "El gastrocnemio va del fémur al calcáneo, por el tendón de Aquiles." },
];

// ---------- Órganos ----------

// Clases «Corazón, vasos, sangre y bazo» y «Aparato respiratorio».
const PARTES_SANGRE = ["Plasma", "Glóbulos rojos", "Glóbulos blancos", "Plaquetas"];
export const ORGANOS_MEDIO: DatoAnatomia[] = [
  { e: "¿Qué parte de la sangre es la parte líquida?", r: "Plasma", alt: PARTES_SANGRE, x: "Plasma: parte líquida. Glóbulos rojos: transportan oxígeno. Glóbulos blancos: defensa. Plaquetas: coagulación." },
  { e: "¿Qué parte de la sangre transporta el oxígeno?", r: "Glóbulos rojos", alt: PARTES_SANGRE, x: "Plasma: parte líquida. Glóbulos rojos: transportan oxígeno. Glóbulos blancos: defensa. Plaquetas: coagulación." },
  { e: "¿Qué parte de la sangre se encarga de la defensa?", r: "Glóbulos blancos", alt: PARTES_SANGRE, x: "Plasma: parte líquida. Glóbulos rojos: transportan oxígeno. Glóbulos blancos: defensa. Plaquetas: coagulación." },
  { e: "¿Qué parte de la sangre se encarga de la coagulación?", r: "Plaquetas", alt: PARTES_SANGRE, x: "Plasma: parte líquida. Glóbulos rojos: transportan oxígeno. Glóbulos blancos: defensa. Plaquetas: coagulación." },
  { e: "¿Cuántos lóbulos tiene el pulmón derecho?", r: "3", alt: ["1", "2", "4"], x: "Pulmón derecho: 3 lóbulos. Pulmón izquierdo: 2, porque deja lugar al corazón." },
  { e: "¿Cuántos lóbulos tiene el pulmón izquierdo?", r: "2", alt: ["1", "3", "4"], x: "Pulmón derecho: 3 lóbulos. Pulmón izquierdo: 2, porque deja lugar al corazón." },
  { e: "¿Qué órgano guarda la bilis?", r: "Vesícula biliar", alt: ["Hígado", "Páncreas", "Bazo", "Estómago"], x: "El hígado produce la bilis y la vesícula biliar la guarda." },
];

// ---------- Nervioso ----------

// Clases «El encéfalo» y «Sistema nervioso central y periférico».
const LOBULOS = ["Frontal", "Parietal", "Temporal", "Occipital"];
const FUNCION_LOBULO = ["Movimiento voluntario, planificación y lenguaje", "Tacto, presión y posición del cuerpo", "Audición y memoria", "Visión"];
export const NERVIOSO_MEDIO: DatoAnatomia[] = [
  { e: "¿Qué lóbulo del cerebro se encarga de la visión?", r: "Occipital", alt: LOBULOS, x: "Frontal: movimiento voluntario, planificación y lenguaje. Parietal: tacto y posición del cuerpo. Temporal: audición y memoria. Occipital: visión." },
  { e: "¿Qué lóbulo del cerebro se encarga de la audición y la memoria?", r: "Temporal", alt: LOBULOS, x: "Frontal: movimiento voluntario, planificación y lenguaje. Parietal: tacto y posición del cuerpo. Temporal: audición y memoria. Occipital: visión." },
  { e: "¿Qué lóbulo del cerebro se encarga del tacto, la presión y la posición del cuerpo?", r: "Parietal", alt: LOBULOS, x: "Frontal: movimiento voluntario, planificación y lenguaje. Parietal: tacto y posición del cuerpo. Temporal: audición y memoria. Occipital: visión." },
  { e: "¿Qué lóbulo del cerebro se encarga del movimiento voluntario, la planificación y el lenguaje?", r: "Frontal", alt: LOBULOS, x: "Frontal: movimiento voluntario, planificación y lenguaje. Parietal: tacto y posición del cuerpo. Temporal: audición y memoria. Occipital: visión." },
  { e: "¿De qué se encarga el lóbulo occipital?", r: "Visión", alt: FUNCION_LOBULO, x: "El lóbulo occipital se encarga de la visión." },
  { e: "¿De qué se encarga el lóbulo temporal?", r: "Audición y memoria", alt: FUNCION_LOBULO, x: "El lóbulo temporal se encarga de la audición y la memoria." },
  { e: "¿De qué se encarga el lóbulo parietal?", r: "Tacto, presión y posición del cuerpo", alt: FUNCION_LOBULO, x: "El lóbulo parietal se encarga del tacto, la presión y la posición del cuerpo." },
  { e: "¿De qué se encarga el lóbulo frontal?", r: "Movimiento voluntario, planificación y lenguaje", alt: FUNCION_LOBULO, x: "El lóbulo frontal se encarga del movimiento voluntario, la planificación y el lenguaje." },
];

export const NERVIOSO_EXPERTO: DatoAnatomia[] = [
  { e: "¿Cuántos pares de nervios espinales hay en total?", r: "31", alt: ["12", "24", "33"], x: "31 pares espinales: 8 cervicales, 12 torácicos, 5 lumbares, 5 sacros y 1 coccígeo (más los 12 pares craneales)." },
  { e: "¿Cuántos pares de nervios espinales cervicales hay?", r: "8", alt: ["5", "7", "12"], x: "8 pares cervicales (aunque haya 7 vértebras cervicales), 12 torácicos, 5 lumbares, 5 sacros y 1 coccígeo." },
  { e: "¿Cuántos pares de nervios espinales torácicos hay?", r: "12", alt: ["5", "7", "8"], x: "8 pares cervicales, 12 torácicos, 5 lumbares, 5 sacros y 1 coccígeo." },
  { e: "¿Cuántos pares de nervios espinales lumbares hay?", r: "5", alt: ["7", "8", "12"], x: "8 pares cervicales, 12 torácicos, 5 lumbares, 5 sacros y 1 coccígeo." },
  { e: "¿Cuántos pares de nervios coccígeos hay?", r: "1", alt: ["2", "3", "5"], x: "8 pares cervicales, 12 torácicos, 5 lumbares, 5 sacros y 1 coccígeo." },
  { e: "¿Cuál es el principal nervio parasimpático?", r: "Vago", alt: ["Facial", "Trigémino", "Hipogloso", "Accesorio"], x: "El nervio vago (X) es el gran nervio parasimpático: llega al corazón, los pulmones y el aparato digestivo." },
  { e: "La raíz dorsal (posterior) de un nervio espinal, ¿qué tipo de fibras lleva?", r: "Sensitivas", alt: ["Motoras", "Mixtas"], x: "Raíz dorsal: sensitiva (entra a la médula). Raíz ventral: motora (sale). El nervio espinal une las dos: es mixto." },
  { e: "La raíz ventral (anterior) de un nervio espinal, ¿qué tipo de fibras lleva?", r: "Motoras", alt: ["Sensitivas", "Mixtas"], x: "Raíz dorsal: sensitiva (entra a la médula). Raíz ventral: motora (sale). El nervio espinal une las dos: es mixto." },
  { e: "¿Qué neuronas conectan neuronas dentro del sistema nervioso central?", r: "Interneuronas", alt: ["Neuronas sensitivas", "Neuronas motoras", "Botones terminales"], x: "Sensitivas (aferentes): llevan información al SNC. Motoras (eferentes): llevan órdenes a músculos y glándulas. Interneuronas: conectan neuronas dentro del SNC." },
  { e: "¿Qué neuronas llevan órdenes a los músculos y las glándulas?", r: "Neuronas motoras", alt: ["Neuronas sensitivas", "Interneuronas", "Dendritas"], x: "Sensitivas (aferentes): llevan información al SNC. Motoras (eferentes): llevan órdenes a músculos y glándulas. Interneuronas: conectan neuronas dentro del SNC." },
  { e: "¿Qué neuronas llevan la información de los sentidos al sistema nervioso central?", r: "Neuronas sensitivas", alt: ["Neuronas motoras", "Interneuronas", "Axones"], x: "Sensitivas (aferentes): llevan información al SNC. Motoras (eferentes): llevan órdenes a músculos y glándulas. Interneuronas: conectan neuronas dentro del SNC." },
];

// ---------- Quiz de las lecciones (Técnicas = básico, Clases = avanzado) ----------

function quizDe(lecciones: { grupo: GrupoAnatomia; quiz: PreguntaLeccionAnatomia[] }[], grupo: GrupoAnatomia): PreguntaLeccionAnatomia[] {
  return lecciones.filter((l) => l.grupo === grupo).flatMap((l) => l.quiz);
}

function quizLeccion(banco: PreguntaLeccionAnatomia[], prefijo: string): Generador {
  return (usados, rng) => {
    const q = elegir(sinUsar(banco, (x) => `${prefijo}:${x.pregunta}`, usados), rng);
    return {
      enunciado: q.pregunta,
      opciones: mezclar(q.opciones, rng),
      respuesta: q.respuesta,
      clave: `${prefijo}:${q.pregunta}`,
      formato: "leccion",
      pasos: [q.explicacion, `Respuesta: ${q.respuesta}`],
    };
  };
}

// Quiz de las lecciones de cada sistema que tienen al menos 3 opciones (el formato de la práctica).
export function quizTecnicas(grupo: GrupoAnatomia): Generador {
  return quizLeccion(quizDe(TECNICAS_ANATOMIA, grupo).filter((q) => q.opciones.length >= 3), `qt-${grupo}`);
}
export function quizClases(grupo: GrupoAnatomia): Generador {
  return quizLeccion(quizDe(CLASES_ANATOMIA, grupo).filter((q) => q.opciones.length >= 3), `qc-${grupo}`);
}

// ---------- Generadores listos ----------

export const GEN = {
  formaDeHueso,
  huesoDeForma,
  esqueletoAxial,
  origenInsercion,
  cantidadesOseoMedio: deDatos("cm", CANTIDADES_OSEO_MEDIO, "cantidad"),
  cantidadesOseoAlto: deDatos("ca", CANTIDADES_OSEO_ALTO, "cantidad"),
  huesoPorDentro: deDatos("hd", HUESO_POR_DENTRO, "dato"),
  oseoExperto: deDatos("ox", OSEO_EXPERTO, "dato"),
  muscularMedio: deDatos("mm", MUSCULAR_MEDIO, "dato"),
  muscularExperto: deDatos("mx", MUSCULAR_EXPERTO, "dato"),
  organosMedio: deDatos("om", ORGANOS_MEDIO, "dato"),
  nerviosoMedio: deDatos("nm2", NERVIOSO_MEDIO, "dato"),
  nerviosoExperto: deDatos("nx", NERVIOSO_EXPERTO, "dato"),
};
