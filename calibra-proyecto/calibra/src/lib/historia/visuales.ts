import type { VisualBase } from "@/lib/aprender/visuales";
import type { EpocaId, Region } from "./tipos";
import { HECHOS } from "./hechos";

// Visuales propios de Historia (prefijo "historia."), mismo criterio que
// Trigonometría/Anatomía/Quimia: cada componente (src/components/historia/visuales/)
// solo DIBUJA lo que calculó una función pura de src/lib/historia/visualesDatos.ts,
// y esas funciones leen la TABLA CANÓNICA (hechos.ts y personajes.ts): en el JSON de
// la lección solo viajan IDS de hechos y de personajes. El nombre y el año de cada
// hecho salen de la tabla, nunca se escriben dos veces. Si un id no existe o una
// relación no está en la tabla, la función de datos lanza y el visual se omite
// (la lección sigue funcionando), y historiaVisuales.test.ts lo detecta.
//
// Para AGREGAR un visual nuevo: 1) su tipo acá y en la unión VisualHistoria,
// 2) su función de datos en visualesDatos.ts (con test), 3) el componente en
// src/components/historia/visuales/ y su entrada en registro.ts, 4) las claves de
// Historia.visuales.<nombre> en messages/es.json y en.json.

// ---------- línea de tiempo ----------
// Los hechos (ids) se ordenan por año. Cada paso agrega el siguiente hecho.
//  - "proporcional": la posición vertical de cada punto en el eje es proporcional
//    al año (con marcas de años redondos); un conector lo une a su etiqueta;
//  - "orden": los hechos van uno debajo del otro SIN proporción (se usa cuando los
//    años están separados por miles o millones de años, como en la Prehistoria) y
//    la figura lo avisa.
export interface VisualHistoriaLinea extends VisualBase {
  tipo: "historia.linea";
  hechos: string[];
  escala?: "proporcional" | "orden";
}

// ---------- las 5 épocas ----------
// Las épocas con su hecho frontera. `resaltar` marca las que importan en la lección;
// `ejemplos` agrega hasta 3 hechos (ids) de cada época como referencia.
export interface VisualHistoriaEpocas extends VisualBase {
  tipo: "historia.epocas";
  resaltar?: EpocaId[];
  ejemplos?: Partial<Record<EpocaId, string[]>>;
}

// ---------- cadena causal ----------
// causa -> hecho -> consecuencia. Cada eslabón tiene que ser una relación de la
// tabla (`causas` del siguiente contiene al anterior).
export interface VisualHistoriaCausas extends VisualBase {
  tipo: "historia.causas";
  cadena: string[];
}

// ---------- año a siglo ----------
// Cada ejemplo es un año (número con signo, a. C. negativo) o el id de un hecho.
export interface VisualHistoriaSiglos extends VisualBase {
  tipo: "historia.siglos";
  ejemplos: (number | string)[];
}

// ---------- sincronía: qué pasaba a la vez en otras partes ----------
export interface CarrilSincronia {
  region: Region;
  hechos: string[];
}

export interface VisualHistoriaSincronia extends VisualBase {
  tipo: "historia.sincronia";
  carriles: CarrilSincronia[];
}

// ---------- fichas de personajes ----------
export interface VisualHistoriaPersonaje extends VisualBase {
  tipo: "historia.personaje";
  personajes: string[];
}

export type VisualHistoria =
  | VisualHistoriaLinea
  | VisualHistoriaEpocas
  | VisualHistoriaCausas
  | VisualHistoriaSiglos
  | VisualHistoriaSincronia
  | VisualHistoriaPersonaje;

export const TIPOS_VISUAL_HISTORIA = [
  "historia.linea",
  "historia.epocas",
  "historia.causas",
  "historia.siglos",
  "historia.sincronia",
  "historia.personaje",
] as const;

// Ids de hechos y de personajes que un visual muestra (para que la lección
// declare `ensena` y para el test de coherencia).
export function idsDeVisual(v: VisualHistoria): { hechos: string[]; personajes: string[] } {
  switch (v.tipo) {
    case "historia.linea":
      return { hechos: v.hechos, personajes: [] };
    case "historia.epocas":
      // Muestra siempre los 4 hechos frontera, más los ejemplos que se pidan.
      return { hechos: [...HECHOS.filter((h) => h.frontera).map((h) => h.id), ...Object.values(v.ejemplos ?? {}).flat()], personajes: [] };
    case "historia.causas":
      return { hechos: v.cadena, personajes: [] };
    case "historia.siglos":
      return { hechos: v.ejemplos.filter((e): e is string => typeof e === "string"), personajes: [] };
    case "historia.sincronia":
      return { hechos: v.carriles.flatMap((c) => c.hechos), personajes: [] };
    case "historia.personaje":
      return { hechos: [], personajes: v.personajes };
  }
}
