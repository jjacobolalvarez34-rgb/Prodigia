import type { EtapaFlujoAnatomia, GrupoVisualAnatomia, EntradaCuerpo } from "./visuales";

// Datos anatómicos que las lecciones y los visuales de Anatomía comparten
// (fuente única). Nivel colegio: las simplificaciones se marcan en el texto
// de cada lección. lecciones.test.ts cruza TODO esto contra una tabla de
// referencia escrita aparte, dentro del propio test, y contra los términos
// que evalúa la práctica (src/lib/practica/anatomia.ts).

// ---------- Pares craneales ----------

export type TipoPar = "S" | "M" | "B"; // sensitivo, motor, mixto (B = "ambos")

export interface ParCraneal {
  numero: number;
  romano: string;
  // Mismo nombre que evalúa la práctica (NERVIOSO_ALTO).
  nombre: string;
  tipo: TipoPar;
  funcion: string;
}

export const PARES_CRANEALES: ParCraneal[] = [
  { numero: 1, romano: "I", nombre: "Olfatorio", tipo: "S", funcion: "olfato" },
  { numero: 2, romano: "II", nombre: "Óptico", tipo: "S", funcion: "visión" },
  { numero: 3, romano: "III", nombre: "Oculomotor", tipo: "M", funcion: "mueve el ojo y sube el párpado; cierra la pupila" },
  { numero: 4, romano: "IV", nombre: "Troclear", tipo: "M", funcion: "mueve el ojo (músculo oblicuo superior)" },
  { numero: 5, romano: "V", nombre: "Trigémino", tipo: "B", funcion: "sensibilidad de la cara; mueve los músculos de la masticación" },
  { numero: 6, romano: "VI", nombre: "Abducens", tipo: "M", funcion: "lleva el ojo hacia afuera" },
  { numero: 7, romano: "VII", nombre: "Facial", tipo: "B", funcion: "músculos de la expresión facial; gusto de la parte anterior de la lengua; lágrimas y saliva" },
  { numero: 8, romano: "VIII", nombre: "Vestibulococlear", tipo: "S", funcion: "audición y equilibrio" },
  { numero: 9, romano: "IX", nombre: "Glosofaríngeo", tipo: "B", funcion: "gusto de la parte posterior de la lengua; deglución" },
  { numero: 10, romano: "X", nombre: "Vago", tipo: "B", funcion: "corazón, pulmones y aparato digestivo; voz y deglución" },
  { numero: 11, romano: "XI", nombre: "Accesorio", tipo: "M", funcion: "mueve el trapecio y el esternocleidomastoideo" },
  { numero: 12, romano: "XII", nombre: "Hipogloso", tipo: "M", funcion: "mueve la lengua" },
];

export const ETIQUETA_TIPO_PAR: Record<TipoPar, string> = { S: "Sensitivo", M: "Motor", B: "Mixto" };

function itemsDePares(filtro: (p: ParCraneal) => boolean, conFuncion: boolean) {
  return PARES_CRANEALES.filter(filtro).map((p) => ({
    texto: p.nombre,
    marca: p.romano,
    ...(conFuncion ? { detalle: p.funcion } : {}),
  }));
}

// Los 3 grupos por función (sensitivos, motores, mixtos), con o sin la
// función de cada par al lado.
export function gruposParesPorTipo(conFuncion: boolean): GrupoVisualAnatomia[] {
  return [
    { nombre: "Sensitivos: solo llevan información al encéfalo", items: itemsDePares((p) => p.tipo === "S", conFuncion) },
    { nombre: "Motores: solo llevan órdenes a un músculo", items: itemsDePares((p) => p.tipo === "M", conFuncion) },
    { nombre: "Mixtos: hacen las dos cosas", items: itemsDePares((p) => p.tipo === "B", conFuncion) },
  ];
}

// Los pares en orden numérico, en 4 tandas de 3 (I-III, IV-VI, VII-IX, X-XII).
export function gruposParesEnOrden(): GrupoVisualAnatomia[] {
  const tandas: [string, number, number][] = [
    ["Pares I a III", 1, 3],
    ["Pares IV a VI", 4, 6],
    ["Pares VII a IX", 7, 9],
    ["Pares X a XII", 10, 12],
  ];
  return tandas.map(([nombre, a, b]) => ({
    nombre,
    items: itemsDePares((p) => p.numero >= a && p.numero <= b, true),
  }));
}

// ---------- Cavidades y órganos ----------

export type IdCavidad = "craneal" | "toracica" | "abdominal" | "pelvica";

export interface Cavidad {
  id: IdCavidad;
  nombre: string;
  ubicacion: string;
  // Solo los órganos que evalúa la práctica (ORGANOS), con su mismo nombre.
  organos: string[];
}

export const CAVIDADES: Cavidad[] = [
  { id: "craneal", nombre: "Cavidad craneal", ubicacion: "dentro del cráneo (cabeza)", organos: ["Cerebro"] },
  { id: "toracica", nombre: "Cavidad torácica", ubicacion: "el tórax (pecho), sobre el diafragma", organos: ["Corazón", "Pulmones"] },
  {
    id: "abdominal",
    nombre: "Cavidad abdominal",
    ubicacion: "bajo el diafragma, hasta el borde de la pelvis",
    organos: ["Hígado", "Estómago", "Riñones", "Intestino", "Páncreas", "Bazo"],
  },
  { id: "pelvica", nombre: "Cavidad pélvica", ubicacion: "dentro de la pelvis, la parte más baja del tronco", organos: ["Vejiga"] },
];

export function gruposCavidades(): GrupoVisualAnatomia[] {
  return CAVIDADES.map((c) => ({
    nombre: `${c.nombre} (${c.ubicacion})`,
    items: c.organos.map((o) => ({ texto: o })),
  }));
}

// ---------- Región del cuerpo de cada estructura (visual anatomia.cuerpo) ----------

// Regiones GRUESAS (nivel colegio). Un órgano o músculo que abarca varias
// (trapecio: cuello y espalda alta) lista todas.
export const ENTRADAS_ORGANOS: EntradaCuerpo[] = [
  { nombre: "Cerebro", regiones: ["cabeza"], detalle: "dentro del cráneo" },
  { nombre: "Corazón", regiones: ["torax"], detalle: "en el centro del tórax, algo inclinado a la izquierda" },
  { nombre: "Pulmones", regiones: ["torax"], detalle: "uno a cada lado del corazón" },
  { nombre: "Hígado", regiones: ["abdomen"], detalle: "arriba a la derecha del abdomen" },
  { nombre: "Estómago", regiones: ["abdomen"], detalle: "arriba a la izquierda del abdomen" },
  { nombre: "Bazo", regiones: ["abdomen"], detalle: "arriba a la izquierda, junto al estómago" },
  { nombre: "Páncreas", regiones: ["abdomen"], detalle: "detrás del estómago" },
  { nombre: "Riñones", regiones: ["abdomen"], detalle: "en la parte de atrás del abdomen, a cada lado de la columna" },
  { nombre: "Intestino", regiones: ["abdomen"], detalle: "ocupa gran parte del abdomen; el tramo final baja a la pelvis" },
  { nombre: "Vejiga", regiones: ["pelvis"], detalle: "en la pelvis, detrás del pubis" },
];

export const ENTRADAS_MUSCULOS_GRANDES: EntradaCuerpo[] = [
  { nombre: "Deltoides", regiones: ["hombro"], detalle: "levanta el brazo hacia el costado" },
  { nombre: "Pectoral mayor", regiones: ["torax"], detalle: "lleva el brazo hacia adelante y hacia adentro" },
  { nombre: "Recto abdominal", regiones: ["abdomen"], detalle: "flexiona el tronco hacia adelante" },
  { nombre: "Bíceps", regiones: ["brazo"], detalle: "flexiona el codo" },
  { nombre: "Cuádriceps", regiones: ["muslo"], detalle: "extiende la rodilla" },
  { nombre: "Trapecio", regiones: ["cuello", "torax"], vista: "posterior", detalle: "sube y junta los omóplatos; sostiene el cuello" },
  { nombre: "Dorsal ancho", regiones: ["torax", "abdomen"], vista: "posterior", detalle: "lleva el brazo hacia atrás y abajo" },
  { nombre: "Tríceps", regiones: ["brazo"], vista: "posterior", detalle: "extiende el codo" },
  { nombre: "Glúteos", regiones: ["pelvis"], vista: "posterior", detalle: "extienden la cadera" },
  { nombre: "Gastrocnemio", regiones: ["pierna"], vista: "posterior", detalle: "la pantorrilla: levanta el talón (puntas de pie)" },
];

// ---------- Flujos (visual anatomia.flujo) ----------

export const FLUJO_ARCO_REFLEJO: EtapaFlujoAnatomia[] = [
  { titulo: "Estímulo", detalle: "por ejemplo, tocar algo muy caliente" },
  { titulo: "Receptor", detalle: "capta el estímulo (terminaciones nerviosas de la piel)" },
  { titulo: "Neurona sensitiva (aferente)", detalle: "lleva la señal hacia la médula espinal" },
  { titulo: "Centro integrador", detalle: "en la médula espinal: la señal pasa a la neurona motora" },
  { titulo: "Neurona motora (eferente)", detalle: "lleva la orden desde la médula hasta el músculo" },
  { titulo: "Efector", detalle: "el músculo se contrae y retira la mano" },
];

export const FLUJO_ALIMENTO: EtapaFlujoAnatomia[] = [
  { titulo: "Boca", detalle: "se mastica y la saliva empieza a digerir el almidón" },
  { titulo: "Faringe", detalle: "cruce entre vía digestiva y vía respiratoria" },
  { titulo: "Esófago", detalle: "tubo que lleva el alimento al estómago" },
  { titulo: "Estómago", detalle: "el jugo gástrico convierte el alimento en una pasta" },
  { titulo: "Intestino delgado", detalle: "se absorbe la mayoría de los nutrientes" },
  { titulo: "Intestino grueso", detalle: "se absorbe agua y se forman las heces" },
  { titulo: "Recto y ano", detalle: "salida de las heces" },
];

export const FLUJO_AIRE: EtapaFlujoAnatomia[] = [
  { titulo: "Nariz", detalle: "entra el aire, se calienta y se filtra" },
  { titulo: "Faringe", detalle: "vía común con el aparato digestivo" },
  { titulo: "Laringe", detalle: "contiene las cuerdas vocales" },
  { titulo: "Tráquea", detalle: "tubo con anillos de cartílago" },
  { titulo: "Bronquios", detalle: "uno para cada pulmón" },
  { titulo: "Bronquiolos", detalle: "ramas cada vez más finas" },
  { titulo: "Alvéolos", detalle: "el oxígeno pasa a la sangre y el dióxido de carbono sale" },
];

export const FLUJO_SANGRE: EtapaFlujoAnatomia[] = [
  { titulo: "Aurícula derecha", detalle: "recibe la sangre pobre en oxígeno del cuerpo" },
  { titulo: "Ventrículo derecho", detalle: "la envía hacia los pulmones" },
  { titulo: "Arterias pulmonares", detalle: "llevan la sangre a los pulmones" },
  { titulo: "Pulmones", detalle: "la sangre se carga de oxígeno" },
  { titulo: "Venas pulmonares", detalle: "traen la sangre oxigenada al corazón" },
  { titulo: "Aurícula izquierda", detalle: "recibe la sangre oxigenada" },
  { titulo: "Ventrículo izquierdo", detalle: "la impulsa con fuerza al resto del cuerpo" },
  { titulo: "Aorta y arterias", detalle: "reparten la sangre a todo el cuerpo" },
  { titulo: "Venas cavas", detalle: "devuelven la sangre al corazón" },
];

export const FLUJO_ORINA: EtapaFlujoAnatomia[] = [
  { titulo: "Riñones", detalle: "filtran la sangre y forman la orina" },
  { titulo: "Uréteres", detalle: "dos tubos que llevan la orina a la vejiga" },
  { titulo: "Vejiga", detalle: "almacena la orina" },
  { titulo: "Uretra", detalle: "conducto de salida al exterior" },
];

export const FLUJO_IMPULSO: EtapaFlujoAnatomia[] = [
  { titulo: "Dendritas", detalle: "reciben la señal de otras neuronas" },
  { titulo: "Cuerpo celular (soma)", detalle: "integra las señales recibidas" },
  { titulo: "Axón", detalle: "conduce el impulso eléctrico" },
  { titulo: "Botones terminales", detalle: "liberan neurotransmisores" },
  { titulo: "Sinapsis", detalle: "el neurotransmisor cruza el espacio entre las dos neuronas" },
  { titulo: "Célula siguiente", detalle: "otra neurona, un músculo o una glándula" },
];

export const FLUJO_CONTRACCION: EtapaFlujoAnatomia[] = [
  { titulo: "Neurona motora", detalle: "envía el impulso al músculo" },
  { titulo: "Unión neuromuscular", detalle: "libera acetilcolina sobre la fibra muscular" },
  { titulo: "Fibra muscular", detalle: "libera calcio en su interior" },
  { titulo: "Actina y miosina", detalle: "los filamentos se deslizan, usando ATP" },
  { titulo: "Contracción", detalle: "el músculo se acorta y tira del hueso" },
];
