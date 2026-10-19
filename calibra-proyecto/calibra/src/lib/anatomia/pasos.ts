import { CAVIDADES, ETIQUETA_TIPO_PAR, FLUJO_AIRE, FLUJO_ALIMENTO, FLUJO_ARCO_REFLEJO, FLUJO_CONTRACCION, FLUJO_IMPULSO, FLUJO_ORINA, FLUJO_SANGRE, PARES_CRANEALES } from "./datos";
import { MUSCULOS } from "@/lib/practica/anatomiaFormatos";
import type { ModoAnatomia, PreguntaAnatomia } from "@/lib/practica/anatomia";

// «Cómo se resuelve» de Anatomía (pedido 2026-10-18): qué es y dónde está lo que se
// preguntó, con los mismos datos de las lecciones (músculos, cavidades, recorridos y
// pares craneales); los huesos, con su ubicación.

const HUESO: Record<string, string> = {
  Fémur: "el hueso del muslo, entre la cadera y la rodilla: el más largo del cuerpo",
  Húmero: "el hueso del brazo, entre el hombro y el codo",
  Tibia: "el hueso grueso de la pierna, adelante y del lado de adentro (la canilla)",
  Peroné: "el hueso delgado de la pierna, al costado de afuera de la tibia",
  Radio: "el hueso del antebrazo del lado del pulgar",
  Cúbito: "el hueso del antebrazo del lado del meñique; forma la punta del codo",
  Costillas: "12 pares de huesos curvos que forman la caja torácica y protegen el corazón y los pulmones",
  "Columna vertebral": "33 vértebras a lo largo de la espalda; protege la médula espinal",
  Cráneo: "los huesos de la cabeza que protegen el cerebro",
  Pelvis: "el anillo de huesos de la cadera; une la columna con las piernas",
  Frontal: "el hueso de la frente",
  Parietal: "los dos huesos del techo y los costados de arriba de la cabeza",
  Temporal: "los huesos de los costados de la cabeza, alrededor de la oreja",
  Occipital: "el hueso de la nuca, atrás y abajo del cráneo",
  Esfenoides: "el hueso con forma de mariposa en la base del cráneo, detrás de los ojos",
  Etmoides: "el hueso entre los dos ojos, detrás de la nariz",
  Maxilar: "el hueso de la mandíbula de arriba; sostiene los dientes superiores",
  Mandíbula: "el único hueso de la cara que se mueve; sostiene los dientes de abajo",
  Cigomático: "el hueso del pómulo",
  Nasal: "los huesitos del puente de la nariz",
  Carpianos: "los 8 huesitos de la muñeca",
  Metacarpianos: "los 5 huesos de la palma de la mano",
  "Falanges de la mano": "los huesos de los dedos de la mano",
  Tarsianos: "los 7 huesos del tobillo y el talón",
  Metatarsianos: "los 5 huesos del empeine",
  "Falanges del pie": "los huesos de los dedos del pie",
};

const ORGANO: Record<string, string> = {
  Corazón: "bombea la sangre a todo el cuerpo; tiene dos aurículas y dos ventrículos",
  Pulmones: "ahí el oxígeno del aire pasa a la sangre y sale el dióxido de carbono",
  Hígado: "produce la bilis y guarda glucosa como glucógeno; está arriba a la derecha del abdomen",
  Riñones: "filtran la sangre y forman la orina",
  Estómago: "el jugo gástrico convierte el alimento en una pasta",
  Cerebro: "está dentro del cráneo: pensamiento, memoria y movimiento voluntario",
  Intestino: "ahí se absorbe la mayoría de los nutrientes (delgado) y el agua (grueso)",
  Páncreas: "produce la insulina y el glucagón, y jugos para la digestión",
  Vejiga: "almacena la orina",
  Bazo: "filtra la sangre y ayuda a las defensas; está arriba a la izquierda, junto al estómago",
};

const NERVIOSO: Record<string, string> = {
  Cerebro: "la parte más grande del encéfalo: pensamiento y movimiento voluntario",
  Cerebelo: "la parte del encéfalo que se encarga del equilibrio y la coordinación",
  "Médula espinal": "va dentro de la columna: lleva las señales entre el encéfalo y el cuerpo y hace los reflejos",
  "Nervio periférico": "parte del sistema nervioso periférico: conecta la médula con el resto del cuerpo",
  "Tronco encefálico": "controla la respiración y el ritmo cardíaco",
};

const RECORRIDOS = [
  { nombre: "el alimento", etapas: FLUJO_ALIMENTO },
  { nombre: "el aire", etapas: FLUJO_AIRE },
  { nombre: "la orina", etapas: FLUJO_ORINA },
  { nombre: "la sangre", etapas: FLUJO_SANGRE },
  { nombre: "el arco reflejo", etapas: FLUJO_ARCO_REFLEJO },
  { nombre: "el impulso nervioso", etapas: FLUJO_IMPULSO },
  { nombre: "la contracción", etapas: FLUJO_CONTRACCION },
];

function musculo(nombre: string): string | null {
  const m = MUSCULOS.find((x) => x.nombre === nombre);
  if (!m) return null;
  const partes = [m.accion];
  if (m.region) partes.push(`está en ${m.region.charAt(0).toLowerCase()}${m.region.slice(1)}`);
  if (m.nervio) partes.push(`lo mueve el nervio ${m.nervio.toLowerCase()}`);
  return `${m.nombre}: ${partes.join("; ")}`;
}

function par(nombre: string): string | null {
  const p = PARES_CRANEALES.find((x) => x.nombre === nombre || x.romano === nombre);
  return p ? `Par ${p.romano}, ${p.nombre.toLowerCase()} (${ETIQUETA_TIPO_PAR[p.tipo].toLowerCase()}): ${p.funcion}` : null;
}

function describir(t: string, modo: ModoAnatomia): string {
  if (modo === "oseo" && HUESO[t]) return `${t}: ${HUESO[t]}`;
  if (modo === "muscular") return musculo(t) ?? t;
  if (modo === "organos" && ORGANO[t]) {
    const cav = CAVIDADES.find((c) => c.organos.includes(t));
    return `${t}: ${ORGANO[t]}${cav ? ` (${cav.nombre.toLowerCase()})` : ""}`;
  }
  if (NERVIOSO[t]) return `${t}: ${NERVIOSO[t]}`;
  return par(t) ?? t;
}

// El músculo nombrado en el enunciado («¿Qué hace el bíceps?»).
function musculoDelEnunciado(enunciado: string): string | null {
  const e = enunciado.toLowerCase();
  return MUSCULOS.map((m) => m.nombre).sort((a, b) => b.length - a.length).find((n) => e.includes(n.toLowerCase())) ?? null;
}

export function pasosAnatomia(modo: ModoAnatomia, p: PreguntaAnatomia): string[] {
  const r = p.respuesta;
  const formato = p.tipo === "opcion" ? p.formato : undefined;
  if (p.tipo === "click") return [describir(r, "oseo"), `Respuesta: ${r}`];
  switch (formato) {
    case "musculo_a_funcion":
    case "region_musculo":
    case "nervio_de_musculo": {
      const m = musculoDelEnunciado(p.enunciado);
      return [m ? (musculo(m) ?? r) : r, `Respuesta: ${r}`];
    }
    case "funcion_a_musculo":
    case "vista_musculo":
      return [musculo(r) ?? r, `Respuesta: ${r}`];
    case "antagonista":
      return [`El bíceps flexiona el codo y el tríceps lo extiende: hacen movimientos opuestos sobre la misma articulación (son antagonistas)`, `Respuesta: ${r}`];
    case "cavidad_de_organo":
    case "organo_en_cavidad": {
      const cav = CAVIDADES.find((c) => c.nombre === r || c.organos.includes(r));
      return [cav ? `${cav.nombre} (${cav.ubicacion}): ${cav.organos.join(", ")}` : describir(r, "organos"), `Respuesta: ${r}`];
    }
    case "flujo": {
      const desde = /«(.+)»/.exec(p.enunciado)?.[1];
      const rec = RECORRIDOS.find((x) => x.etapas.some((e) => e.titulo === r) && (!desde || x.etapas.some((e) => e.titulo === desde)));
      return [rec ? `El recorrido ${rec.nombre.startsWith("el ") ? `del ${rec.nombre.slice(3)}` : `de ${rec.nombre}`}: ${rec.etapas.map((e) => e.titulo).join(" → ")}` : describir(r, modo), `Respuesta: ${r}`];
    }
    case "neurona":
      return [`La señal entra por las dendritas → el cuerpo celular la integra → el axón la conduce → los botones terminales liberan los neurotransmisores`, `Respuesta: ${r}`];
    case "par_por_numero":
    case "numero_de_par":
    case "par_por_funcion":
    case "tipo_de_par": {
      const nombre = /nervio ([a-záéíóúñ]+)/i.exec(p.enunciado)?.[1];
      const desc = par(r) ?? (nombre ? par(nombre.charAt(0).toUpperCase() + nombre.slice(1)) : null);
      return [desc ?? r, `Respuesta: ${r}`];
    }
    case "clasificacion":
    case undefined:
      return [describir(r, modo), `Las otras opciones son de otros sistemas del cuerpo`, `Respuesta: ${r}`];
    default:
      return [describir(r, modo), `Respuesta: ${r}`];
  }
}
