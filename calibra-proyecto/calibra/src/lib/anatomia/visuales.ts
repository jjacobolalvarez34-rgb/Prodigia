import type { VisualBase } from "@/lib/aprender/visuales";

// Visuales propios de Anatomía (prefijo "anatomia."). Cuatro primitivos; el
// componente de cada uno SOLO dibuja — los datos salen de
// src/lib/anatomia/datos.ts / de las propias lecciones, verificados en
// tests contra src/lib/practica/anatomia.ts y una tabla de referencia.
//
// Honestidad de lo dibujado (pedido explícito): NADA de anatomía humana está
// dibujado "de memoria".
//   - anatomia.esqueleto usa el SVG REAL de dominio público que ya usa la
//     práctica (public/data/esqueleto-oseo.svg, LadyofHats / Wikimedia
//     Commons): solo resalta los grupos que ese archivo ya trae separados.
//   - anatomia.cuerpo es un ESQUEMA de regiones (cajas rotuladas con forma de
//     figura): ubica una estructura por región del cuerpo, no dibuja el
//     músculo ni el órgano.
//   - anatomia.grupos y anatomia.flujo son diagramas de cajas y flechas.

// Claves data-hueso del SVG del esqueleto (ver HUESO_CLICKEABLE en
// src/lib/practica/anatomia.ts). Se revelan una a una, con su nombre.
export interface VisualAnatomiaEsqueleto extends VisualBase {
  tipo: "anatomia.esqueleto";
  huesos: string[];
}

export type RegionCuerpo =
  | "cabeza"
  | "cuello"
  | "hombro"
  | "torax"
  | "abdomen"
  | "pelvis"
  | "brazo"
  | "antebrazo"
  | "muslo"
  | "pierna";

export interface EntradaCuerpo {
  // Nombre tal cual lo enseña/evalúa Prodigia (p. ej. "Bíceps", "Corazón").
  nombre: string;
  regiones: RegionCuerpo[];
  // Cara del cuerpo en la que se ubica (por defecto anterior).
  vista?: "anterior" | "posterior";
  // Una frase corta (acción, función...). Texto plano.
  detalle?: string;
}

// Esquema de regiones del cuerpo (figura de cajas, vista anterior y
// posterior): resalta la región de cada entrada, una a una.
export interface VisualAnatomiaCuerpo extends VisualBase {
  tipo: "anatomia.cuerpo";
  entradas: EntradaCuerpo[];
}

export interface ItemGrupoAnatomia {
  texto: string;
  // Marca corta al lado del texto (p. ej. "II", "S", "M", "B").
  marca?: string;
  // Descripción de una línea (función, ubicación...).
  detalle?: string;
}

export interface GrupoVisualAnatomia {
  nombre: string;
  items: ItemGrupoAnatomia[];
}

// Cajas rotuladas: se revela un grupo por paso, con sus elementos dentro.
export interface VisualAnatomiaGrupos extends VisualBase {
  tipo: "anatomia.grupos";
  grupos: GrupoVisualAnatomia[];
}

export interface EtapaFlujoAnatomia {
  titulo: string;
  detalle?: string;
}

// Cadena de etapas con flechas (camino del alimento, arco reflejo...): se
// revela una etapa por paso. `ciclo` agrega el retorno "vuelve al inicio".
export interface VisualAnatomiaFlujo extends VisualBase {
  tipo: "anatomia.flujo";
  etapas: EtapaFlujoAnatomia[];
  ciclo?: boolean;
}

export type VisualAnatomia =
  | VisualAnatomiaEsqueleto
  | VisualAnatomiaCuerpo
  | VisualAnatomiaGrupos
  | VisualAnatomiaFlujo;
