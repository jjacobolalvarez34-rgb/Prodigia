// Anatomía: formatos de pregunta además de "¿cuál de estas opciones es un músculo?".
// Antes los modos muscular, órganos y nervioso tenían un solo formato sobre ~10
// términos y se repetían mucho. Todo sale de datos que ya están verificados en las
// lecciones (src/lib/anatomia/datos.ts y lecciones/): función de cada músculo,
// ubicación y cavidad de cada órgano, los recorridos (aire, alimento, sangre, orina,
// impulso, reflejo, contracción) y los 12 pares craneales. Nada se inventa acá.
//
// Regla de cada formato: una sola opción correcta. Los distractores se filtran para
// que ninguno cumpla también el enunciado (p. ej. masetero y temporal elevan los dos
// la mandíbula: si la respuesta es uno, el otro no puede salir de opción).
import {
  CAVIDADES,
  ENTRADAS_MUSCULOS_GRANDES,
  ENTRADAS_ORGANOS,
  FLUJO_AIRE,
  FLUJO_ALIMENTO,
  FLUJO_ARCO_REFLEJO,
  FLUJO_CONTRACCION,
  FLUJO_IMPULSO,
  FLUJO_ORINA,
  FLUJO_SANGRE,
  PARES_CRANEALES,
  ETIQUETA_TIPO_PAR,
} from "@/lib/anatomia/datos";
import type { EtapaFlujoAnatomia } from "@/lib/anatomia/visuales";

export type Rng = () => number;

export type FormatoAnatomia =
  | "clasificacion"
  | "funcion_a_musculo"
  | "musculo_a_funcion"
  | "region_musculo"
  | "vista_musculo"
  | "nervio_de_musculo"
  | "antagonista"
  | "funcion_a_organo"
  | "cavidad_de_organo"
  | "organo_en_cavidad"
  | "flujo"
  | "encefalo"
  | "neurona"
  | "par_por_numero"
  | "numero_de_par"
  | "par_por_funcion"
  | "tipo_de_par";

export interface PreguntaFormato {
  enunciado: string;
  opciones: string[];
  respuesta: string;
  clave: string;
  formato: FormatoAnatomia;
}

// ---------- Utilidades ----------

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

// Prefiere lo que no salió en este sprint; si ya salió todo, vuelve a empezar.
function sinUsar<T>(candidatos: T[], clave: (x: T) => string, usados: Set<string>): T[] {
  const libres = candidatos.filter((x) => !usados.has(clave(x)));
  return libres.length > 0 ? libres : candidatos;
}

// Correcta + hasta `cantidad - 1` distractores distintos de ella, mezclados.
function armar(correcta: string, distractores: string[], rng: Rng, cantidad = 4): string[] {
  const unicos = Array.from(new Set(distractores.filter((d) => d !== correcta)));
  return mezclar([correcta, ...mezclar(unicos, rng).slice(0, cantidad - 1)], rng);
}

const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- Músculos ----------

interface Musculo {
  nombre: string;
  // Se lee en "¿Cuál de estos músculos ___?" y, con mayúscula, como opción de "¿Qué hace…?".
  accion: string;
  grupo: "grande" | "cabeza";
  region?: string;
  posterior?: boolean;
  // Par craneal que lo mueve (solo cabeza y cuello, según las lecciones).
  nervio?: string;
}

// Grandes: ENTRADAS_MUSCULOS_GRANDES (datos.ts). Cabeza y cuello: clase "Músculos de
// la cabeza" (lecciones/clasesMuscular.ts, "Expresión y masticación").
const REGION: Record<string, string> = {
  hombro: "El hombro",
  torax: "El tórax (pecho)",
  abdomen: "El abdomen",
  brazo: "El brazo",
  muslo: "El muslo",
  pierna: "La pierna (pantorrilla)",
  pelvis: "La cadera y la pelvis",
  cuello: "El cuello",
};

const ACCION_GRANDE: Record<string, string> = {
  Deltoides: "levanta el brazo hacia el costado",
  "Pectoral mayor": "lleva el brazo hacia adelante y hacia adentro",
  "Recto abdominal": "flexiona el tronco hacia adelante",
  Bíceps: "flexiona el codo",
  Cuádriceps: "extiende la rodilla",
  Trapecio: "sube y junta los omóplatos",
  "Dorsal ancho": "lleva el brazo hacia atrás y hacia abajo",
  Tríceps: "extiende el codo",
  Glúteos: "extiende la cadera",
  Gastrocnemio: "levanta el talón (ponerse en puntas de pie)",
};

export const MUSCULOS: Musculo[] = [
  ...ENTRADAS_MUSCULOS_GRANDES.map((e) => ({
    nombre: e.nombre,
    accion: ACCION_GRANDE[e.nombre],
    grupo: "grande" as const,
    // Los que abarcan dos regiones (trapecio, dorsal ancho) no entran en la pregunta de región.
    region: e.regiones.length === 1 ? REGION[e.regiones[0]] : undefined,
    posterior: e.vista === "posterior",
  })),
  { nombre: "Frontal", accion: "sube las cejas", grupo: "cabeza", nervio: "Facial" },
  { nombre: "Orbicular de los ojos", accion: "cierra los párpados", grupo: "cabeza", nervio: "Facial" },
  { nombre: "Orbicular de la boca", accion: "cierra y frunce los labios", grupo: "cabeza", nervio: "Facial" },
  { nombre: "Cigomático mayor", accion: "levanta la comisura de la boca al sonreír", grupo: "cabeza", nervio: "Facial" },
  { nombre: "Buccinador", accion: "comprime la mejilla", grupo: "cabeza", nervio: "Facial" },
  { nombre: "Occipital", accion: "tira del cuero cabelludo hacia atrás", grupo: "cabeza", nervio: "Facial" },
  { nombre: "Platisma", accion: "baja el labio inferior y la mandíbula", grupo: "cabeza", nervio: "Facial" },
  { nombre: "Masetero", accion: "eleva la mandíbula al masticar", grupo: "cabeza", nervio: "Trigémino" },
  { nombre: "Temporal", accion: "eleva la mandíbula al masticar", grupo: "cabeza", nervio: "Trigémino" },
];

// El deltoides se ve de frente y de espalda: no entra en la pregunta de "adelante / atrás".
const SIN_VISTA_CLARA = new Set(["Deltoides"]);

// Único par antagonista que dan las lecciones con las dos acciones (codo).
const ANTAGONISTAS: [string, string][] = [
  ["Bíceps", "Tríceps"],
  ["Tríceps", "Bíceps"],
];

function musculosDe(alto: boolean): Musculo[] {
  return MUSCULOS.filter((m) => m.grupo === (alto ? "cabeza" : "grande"));
}

function funcionAMusculo(alto: boolean, usados: Set<string>, rng: Rng): PreguntaFormato {
  const pool = musculosDe(alto);
  const m = elegir(sinUsar(pool, (x) => `fm:${x.nombre}`, usados), rng);
  const distractores = pool.filter((x) => x.accion !== m.accion).map((x) => x.nombre);
  return { enunciado: `¿Cuál de estos músculos ${m.accion}?`, opciones: armar(m.nombre, distractores, rng), respuesta: m.nombre, clave: `fm:${m.nombre}`, formato: "funcion_a_musculo" };
}

function musculoAFuncion(alto: boolean, usados: Set<string>, rng: Rng): PreguntaFormato {
  const pool = musculosDe(alto);
  const m = elegir(sinUsar(pool, (x) => `mf:${x.nombre}`, usados), rng);
  const distractores = pool.filter((x) => x.accion !== m.accion).map((x) => mayuscula(x.accion));
  const articulo = m.nombre === "Glúteos" ? "los" : "el";
  const verbo = m.nombre === "Glúteos" ? "hacen" : "hace";
  return {
    enunciado: `¿Qué ${verbo} ${articulo} ${m.nombre.toLowerCase()}?`,
    opciones: armar(mayuscula(m.accion), distractores, rng),
    respuesta: mayuscula(m.accion),
    clave: `mf:${m.nombre}`,
    formato: "musculo_a_funcion",
  };
}

function regionMusculo(usados: Set<string>, rng: Rng): PreguntaFormato {
  const pool = MUSCULOS.filter((m) => m.region);
  const m = elegir(sinUsar(pool, (x) => `rm:${x.nombre}`, usados), rng);
  const distractores = Object.values(REGION).filter((r) => r !== m.region);
  const articulo = m.nombre === "Glúteos" ? "los" : "el";
  const verbo = m.nombre === "Glúteos" ? "están" : "está";
  return { enunciado: `¿Dónde ${verbo} ${articulo} ${m.nombre.toLowerCase()}?`, opciones: armar(m.region!, distractores, rng), respuesta: m.region!, clave: `rm:${m.nombre}`, formato: "region_musculo" };
}

function vistaMusculo(usados: Set<string>, rng: Rng): PreguntaFormato {
  const pool = musculosDe(false).filter((m) => !SIN_VISTA_CLARA.has(m.nombre));
  const atras = rng() < 0.5;
  const correctos = pool.filter((m) => !!m.posterior === atras);
  const m = elegir(sinUsar(correctos, (x) => `vm:${x.nombre}`, usados), rng);
  const distractores = pool.filter((x) => !!x.posterior !== atras).map((x) => x.nombre);
  return {
    enunciado: atras ? "¿Cuál de estos músculos se ve en la parte de atrás del cuerpo?" : "¿Cuál de estos músculos se ve en la parte de adelante del cuerpo?",
    opciones: armar(m.nombre, distractores, rng),
    respuesta: m.nombre,
    clave: `vm:${m.nombre}`,
    formato: "vista_musculo",
  };
}

function nervioDeMusculo(usados: Set<string>, rng: Rng): PreguntaFormato {
  // Trapecio y esternocleidomastoideo: nervio accesorio (XI), según la clase de cabeza y cuello.
  const pool: { nombre: string; nervio: string }[] = [
    ...MUSCULOS.filter((m) => m.nervio).map((m) => ({ nombre: m.nombre, nervio: m.nervio! })),
    { nombre: "Esternocleidomastoideo", nervio: "Accesorio" },
  ];
  const m = elegir(sinUsar(pool, (x) => `nm:${x.nombre}`, usados), rng);
  const distractores = ["Facial", "Trigémino", "Accesorio", "Hipogloso", "Vago", "Oculomotor"].filter((n) => n !== m.nervio);
  return {
    enunciado: `¿Qué par craneal mueve el músculo ${m.nombre.toLowerCase()}?`,
    opciones: armar(m.nervio, distractores, rng),
    respuesta: m.nervio,
    clave: `nm:${m.nombre}`,
    formato: "nervio_de_musculo",
  };
}

function antagonista(usados: Set<string>, rng: Rng): PreguntaFormato {
  const [de, es] = elegir(sinUsar(ANTAGONISTAS, ([a]) => `an:${a}`, usados), rng);
  const distractores = musculosDe(false).map((m) => m.nombre).filter((n) => n !== de && n !== es);
  return { enunciado: `¿Qué músculo hace lo contrario del ${de.toLowerCase()} en el codo?`, opciones: armar(es, distractores, rng), respuesta: es, clave: `an:${de}`, formato: "antagonista" };
}

// ---------- Órganos ----------

// Preguntas de función y de ubicación de cada órgano de ORGANOS, con lo que dicen las
// lecciones (clases de órganos y ENTRADAS_ORGANOS). Una o más por órgano.
const FUNCION_ORGANO: { organo: string; enunciado: string }[] = [
  { organo: "Corazón", enunciado: "¿Qué órgano bombea la sangre a todo el cuerpo?" },
  { organo: "Corazón", enunciado: "¿Qué órgano tiene dos aurículas y dos ventrículos?" },
  { organo: "Pulmones", enunciado: "¿En qué órganos el oxígeno pasa a la sangre?" },
  { organo: "Hígado", enunciado: "¿Qué órgano produce la bilis?" },
  { organo: "Hígado", enunciado: "¿Qué órgano guarda glucosa en forma de glucógeno?" },
  { organo: "Riñones", enunciado: "¿Qué órganos filtran la sangre y forman la orina?" },
  { organo: "Estómago", enunciado: "¿En qué órgano el jugo gástrico convierte el alimento en una pasta?" },
  { organo: "Intestino", enunciado: "¿En qué órgano se absorbe la mayoría de los nutrientes?" },
  { organo: "Páncreas", enunciado: "¿Qué órgano produce la insulina y el glucagón?" },
  { organo: "Vejiga", enunciado: "¿Qué órgano almacena la orina?" },
  { organo: "Cerebro", enunciado: "¿Qué órgano está dentro del cráneo?" },
  ...ENTRADAS_ORGANOS.filter((e) => ["Hígado", "Estómago", "Bazo", "Páncreas"].includes(e.nombre)).map((e) => ({
    organo: e.nombre,
    enunciado: `¿Qué órgano está ${e.detalle}?`,
  })),
];

const ORGANOS_DE_CAVIDADES = CAVIDADES.flatMap((c) => c.organos);

function funcionAOrgano(usados: Set<string>, rng: Rng): PreguntaFormato {
  const q = elegir(sinUsar(FUNCION_ORGANO, (x) => `fo:${x.enunciado}`, usados), rng);
  // Bazo, estómago: los dos están "arriba a la izquierda"; el enunciado del bazo dice
  // "junto al estómago", así que el estómago no puede ser distractor del bazo ni al revés.
  const vecinos: Record<string, string[]> = { Bazo: ["Estómago"], Estómago: ["Bazo"] };
  const distractores = ORGANOS_DE_CAVIDADES.filter((o) => o !== q.organo && !(vecinos[q.organo] ?? []).includes(o));
  return { enunciado: q.enunciado, opciones: armar(q.organo, distractores, rng), respuesta: q.organo, clave: `fo:${q.enunciado}`, formato: "funcion_a_organo" };
}

function cavidadDeOrgano(usados: Set<string>, rng: Rng): PreguntaFormato {
  const organo = elegir(sinUsar(ORGANOS_DE_CAVIDADES, (x) => `co:${x}`, usados), rng);
  const cavidad = CAVIDADES.find((c) => c.organos.includes(organo))!;
  const plural = organo === "Pulmones" || organo === "Riñones";
  return {
    enunciado: `¿En qué cavidad del cuerpo ${plural ? "están los" : "está el"} ${organo.toLowerCase()}?`.replace("está el vejiga", "está la vejiga"),
    opciones: armar(cavidad.nombre, CAVIDADES.map((c) => c.nombre), rng),
    respuesta: cavidad.nombre,
    clave: `co:${organo}`,
    formato: "cavidad_de_organo",
  };
}

function organoEnCavidad(usados: Set<string>, rng: Rng): PreguntaFormato {
  const cavidad = elegir(sinUsar(CAVIDADES, (c) => `oc:${c.id}`, usados), rng);
  const organo = elegir(cavidad.organos, rng);
  const distractores = ORGANOS_DE_CAVIDADES.filter((o) => !cavidad.organos.includes(o));
  return {
    enunciado: `¿Cuál de estos órganos está en la ${cavidad.nombre.toLowerCase()}?`,
    opciones: armar(organo, distractores, rng),
    respuesta: organo,
    clave: `oc:${cavidad.id}`,
    formato: "organo_en_cavidad",
  };
}

// ---------- Recorridos (flujos de las lecciones) ----------

interface Recorrido {
  id: string;
  nombre: string;
  etapas: EtapaFlujoAnatomia[];
}

const RECORRIDOS_ORGANOS: Recorrido[] = [
  { id: "alimento", nombre: "En el recorrido del alimento", etapas: FLUJO_ALIMENTO },
  { id: "aire", nombre: "En el recorrido del aire", etapas: FLUJO_AIRE },
  { id: "orina", nombre: "En el recorrido de la orina", etapas: FLUJO_ORINA },
  { id: "sangre", nombre: "En el recorrido de la sangre por el corazón y los pulmones", etapas: FLUJO_SANGRE },
];
const RECORRIDOS_NERVIOSO: Recorrido[] = [
  { id: "reflejo", nombre: "En el arco reflejo", etapas: FLUJO_ARCO_REFLEJO },
  { id: "impulso", nombre: "En el camino del impulso nervioso", etapas: FLUJO_IMPULSO },
];
const RECORRIDOS_MUSCULO: Recorrido[] = [{ id: "contraccion", nombre: "En la contracción de un músculo", etapas: FLUJO_CONTRACCION }];

function flujo(recorridos: Recorrido[], usados: Set<string>, rng: Rng): PreguntaFormato {
  const pares = recorridos.flatMap((r) => r.etapas.slice(0, -1).map((e, i) => ({ r, i, e })));
  const { r, i, e } = elegir(sinUsar(pares, (p) => `fl:${p.r.id}:${p.i}`, usados), rng);
  const siguiente = r.etapas[i + 1].titulo;
  // Ni la etapa de la pregunta ni la siguiente pueden ser distractores. Los recorridos
  // cortos (orina: 4 etapas) se completan con etapas de los otros recorridos.
  const delMismo = mezclar(r.etapas.filter((x, j) => j !== i && j !== i + 1).map((x) => x.titulo), rng);
  const deOtros = mezclar(
    recorridos.filter((x) => x.id !== r.id).flatMap((x) => x.etapas.map((y) => y.titulo)).filter((t) => t !== siguiente && t !== e.titulo),
    rng
  );
  const relleno = [...RECORRIDOS_ORGANOS, ...RECORRIDOS_NERVIOSO]
    .flatMap((x) => x.etapas.map((y) => y.titulo))
    .filter((t) => t !== siguiente && t !== e.titulo && !r.etapas.some((y) => y.titulo === t));
  const distractores = Array.from(new Set([...delMismo, ...deOtros, ...mezclar(relleno, rng)])).filter((t) => t !== siguiente).slice(0, 3);
  return {
    enunciado: `${r.nombre}, ¿qué viene justo después de «${e.titulo}»?`,
    opciones: mezclar([siguiente, ...distractores], rng),
    respuesta: siguiente,
    clave: `fl:${r.id}:${i}`,
    formato: "flujo",
  };
}

// ---------- Sistema nervioso ----------

// Clase "Sistema nervioso central y periférico" y "Tres partes del encéfalo".
const ENCEFALO: { respuesta: string; enunciado: string; opciones: string[] }[] = [
  { respuesta: "Cerebelo", enunciado: "¿Qué parte del encéfalo se encarga del equilibrio y la coordinación?", opciones: ["Cerebro", "Tronco encefálico", "Médula espinal"] },
  { respuesta: "Cerebro", enunciado: "¿Cuál es la parte más grande del encéfalo?", opciones: ["Cerebelo", "Tronco encefálico", "Médula espinal"] },
  { respuesta: "Cerebro", enunciado: "¿Qué parte del encéfalo se encarga del pensamiento y el movimiento voluntario?", opciones: ["Cerebelo", "Tronco encefálico", "Médula espinal"] },
  { respuesta: "Tronco encefálico", enunciado: "¿Qué parte del encéfalo controla la respiración y el ritmo cardíaco?", opciones: ["Cerebro", "Cerebelo", "Médula espinal"] },
  { respuesta: "Médula espinal", enunciado: "¿Qué parte del sistema nervioso va dentro del conducto vertebral?", opciones: ["Cerebro", "Cerebelo", "Nervio periférico"] },
  { respuesta: "Nervio periférico", enunciado: "¿Cuál de estas partes es del sistema nervioso periférico?", opciones: ["Cerebro", "Cerebelo", "Médula espinal"] },
];

// Partes de la neurona (FLUJO_IMPULSO): la función de cada una.
const NEURONA: { respuesta: string; enunciado: string }[] = [
  { respuesta: "Dendritas", enunciado: "¿Qué parte de la neurona recibe la señal de otras neuronas?" },
  { respuesta: "Cuerpo celular (soma)", enunciado: "¿Qué parte de la neurona integra las señales que recibe?" },
  { respuesta: "Axón", enunciado: "¿Qué parte de la neurona conduce el impulso eléctrico?" },
  { respuesta: "Botones terminales", enunciado: "¿Qué parte de la neurona libera los neurotransmisores?" },
];

function encefalo(usados: Set<string>, rng: Rng): PreguntaFormato {
  const q = elegir(sinUsar(ENCEFALO, (x) => `en:${x.enunciado}`, usados), rng);
  return { enunciado: q.enunciado, opciones: armar(q.respuesta, q.opciones, rng), respuesta: q.respuesta, clave: `en:${q.enunciado}`, formato: "encefalo" };
}

function neurona(usados: Set<string>, rng: Rng): PreguntaFormato {
  const q = elegir(sinUsar(NEURONA, (x) => `ne:${x.respuesta}`, usados), rng);
  const distractores = NEURONA.map((x) => x.respuesta).filter((r) => r !== q.respuesta);
  return { enunciado: q.enunciado, opciones: armar(q.respuesta, distractores, rng), respuesta: q.respuesta, clave: `ne:${q.respuesta}`, formato: "neurona" };
}

// Función de cada par escrita como pregunta (de PARES_CRANEALES.funcion).
const PREGUNTA_PAR: Record<number, string> = {
  1: "¿Qué par craneal lleva el olfato?",
  2: "¿Qué par craneal lleva la visión?",
  3: "¿Qué par craneal sube el párpado y cierra la pupila?",
  4: "¿Qué par craneal mueve el músculo oblicuo superior del ojo?",
  5: "¿Qué par craneal da la sensibilidad de la cara y mueve los músculos de la masticación?",
  6: "¿Qué par craneal lleva el ojo hacia afuera?",
  7: "¿Qué par craneal mueve los músculos de la expresión facial?",
  8: "¿Qué par craneal lleva la audición y el equilibrio?",
  9: "¿Qué par craneal lleva el gusto de la parte posterior de la lengua?",
  10: "¿Qué par craneal llega al corazón, los pulmones y el aparato digestivo?",
  11: "¿Qué par craneal mueve el trapecio y el esternocleidomastoideo?",
  12: "¿Qué par craneal mueve la lengua?",
};

function parPorNumero(usados: Set<string>, rng: Rng): PreguntaFormato {
  const p = elegir(sinUsar(PARES_CRANEALES, (x) => `pn:${x.numero}`, usados), rng);
  // Los vecinos de número confunden más.
  const distractores = mezclar(PARES_CRANEALES.filter((x) => x.numero !== p.numero && Math.abs(x.numero - p.numero) <= 3), rng).map((x) => x.nombre);
  return { enunciado: `¿Cómo se llama el par craneal ${p.romano}?`, opciones: armar(p.nombre, distractores, rng), respuesta: p.nombre, clave: `pn:${p.numero}`, formato: "par_por_numero" };
}

function numeroDePar(usados: Set<string>, rng: Rng): PreguntaFormato {
  const p = elegir(sinUsar(PARES_CRANEALES, (x) => `np:${x.numero}`, usados), rng);
  const distractores = mezclar(PARES_CRANEALES.filter((x) => x.numero !== p.numero && Math.abs(x.numero - p.numero) <= 3), rng).map((x) => x.romano);
  return { enunciado: `¿Qué número tiene el nervio ${p.nombre.toLowerCase()}?`, opciones: armar(p.romano, distractores, rng), respuesta: p.romano, clave: `np:${p.numero}`, formato: "numero_de_par" };
}

function parPorFuncion(usados: Set<string>, rng: Rng): PreguntaFormato {
  const p = elegir(sinUsar(PARES_CRANEALES, (x) => `pf:${x.numero}`, usados), rng);
  const distractores = PARES_CRANEALES.filter((x) => x.numero !== p.numero).map((x) => x.nombre);
  return { enunciado: PREGUNTA_PAR[p.numero], opciones: armar(p.nombre, distractores, rng), respuesta: p.nombre, clave: `pf:${p.numero}`, formato: "par_por_funcion" };
}

function tipoDePar(usados: Set<string>, rng: Rng): PreguntaFormato {
  const p = elegir(sinUsar(PARES_CRANEALES, (x) => `tp:${x.numero}`, usados), rng);
  const tipos = Object.values(ETIQUETA_TIPO_PAR);
  return {
    enunciado: `El nervio ${p.nombre.toLowerCase()} (${p.romano}), ¿es sensitivo, motor o mixto?`,
    // Solo hay 3 tipos: esta pregunta tiene 3 opciones.
    opciones: armar(ETIQUETA_TIPO_PAR[p.tipo], tipos, rng, 3),
    respuesta: ETIQUETA_TIPO_PAR[p.tipo],
    clave: `tp:${p.numero}`,
    formato: "tipo_de_par",
  };
}

// ---------- Qué formatos tiene cada modo y nivel ----------

type Generador = (usados: Set<string>, rng: Rng) => PreguntaFormato;

// banda: 0 (nivel 1-2) … 4 (nivel 9-10). `null` en la primera posición = el formato
// de clasificación de siempre (lo arma anatomia.ts); va primero a propósito.
export function formatosDe(modo: "muscular" | "organos" | "nervioso", banda: number): (Generador | null)[] {
  const alto = banda >= 3;
  if (modo === "muscular") {
    if (!alto) {
      const lista: (Generador | null)[] = [null, (u, r) => funcionAMusculo(false, u, r), (u, r) => musculoAFuncion(false, u, r), regionMusculo];
      if (banda >= 1) lista.push(vistaMusculo, antagonista);
      if (banda >= 2) lista.push((u, r) => flujo(RECORRIDOS_MUSCULO, u, r));
      return lista;
    }
    return [null, (u, r) => funcionAMusculo(true, u, r), (u, r) => musculoAFuncion(true, u, r), nervioDeMusculo, (u, r) => flujo(RECORRIDOS_MUSCULO, u, r)];
  }
  if (modo === "organos") {
    const lista: (Generador | null)[] = [null, funcionAOrgano, cavidadDeOrgano];
    if (banda >= 1) lista.push(organoEnCavidad);
    if (banda >= 2) lista.push((u, r) => flujo(RECORRIDOS_ORGANOS.filter((x) => x.id !== "sangre"), u, r));
    if (banda >= 3) lista.push((u, r) => flujo(RECORRIDOS_ORGANOS, u, r));
    return lista;
  }
  if (!alto) {
    const lista: (Generador | null)[] = [null, encefalo];
    if (banda >= 1) lista.push(neurona);
    if (banda >= 2) lista.push((u, r) => flujo(RECORRIDOS_NERVIOSO, u, r));
    return lista;
  }
  return [null, parPorNumero, numeroDePar, parPorFuncion, tipoDePar, (u, r) => flujo(RECORRIDOS_NERVIOSO, u, r)];
}
