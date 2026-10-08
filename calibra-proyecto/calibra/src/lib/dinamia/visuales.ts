import type { VisualBase } from "@/lib/aprender/visuales";

// Animaciones de las lecciones de Dinamia (docs/PLAN_MUNDOS_FISICA_BIOLOGIA.md §3.1).
// Cada una trae solo los datos físicos; todo lo que se muestra (posiciones,
// velocidades, fuerzas, energías) lo calcula src/lib/dinamia/escenas.ts.

export interface VisualDinamiaTrayecto extends VisualBase {
  tipo: "dinamia.trayecto";
  v0: number;
  a: number;
  segundos: number;
}
export interface VisualDinamiaGrafica extends VisualBase {
  tipo: "dinamia.grafica";
  eje: "x-t" | "v-t";
  v0: number;
  a: number;
  segundos: number;
  x0?: number;
}
export interface VisualDinamiaCaida extends VisualBase {
  tipo: "dinamia.caida";
  g: number;
  // 0 = se suelta; > 0 = se lanza hacia arriba.
  v0: number;
  // Segundos que se muestran, en saltos de medio segundo.
  segundos: number;
}
export interface VisualDinamiaParabola extends VisualBase {
  tipo: "dinamia.parabola";
  v0: number;
  angulo: 30 | 45 | 60;
}
export interface VisualDinamiaVectores extends VisualBase {
  tipo: "dinamia.vectores";
  modo: "suma" | "componentes" | "equilibrante";
  vectores: { nombre: string; x: number; y: number }[];
}
export interface VisualDinamiaCuerpoLibre extends VisualBase {
  tipo: "dinamia.cuerpoLibre";
  situacion: "piso" | "empujado" | "plano" | "colgando";
  masa: number;
  empuje?: number;
  mu?: number;
  angulo?: 30 | 45 | 60;
}
export interface VisualDinamiaPoleas extends VisualBase {
  tipo: "dinamia.poleas";
  m1: number;
  m2: number;
}
export interface VisualDinamiaCircular extends VisualBase {
  tipo: "dinamia.circular";
  masa: number;
  radio: number;
  v: number;
}
export interface VisualDinamiaEnergia extends VisualBase {
  tipo: "dinamia.energia";
  masa: number;
  altura: number;
  // Fracción de la energía que se va en calor a lo largo de todo el recorrido (0 a 0,5).
  perdida?: number;
}
export interface VisualDinamiaChoque extends VisualBase {
  tipo: "dinamia.choque";
  m1: number;
  v1: number;
  m2: number;
  v2: number;
  clase: "plastico" | "elastico";
}
export interface VisualDinamiaTermometro extends VisualBase {
  tipo: "dinamia.termometro";
  modo: "escalas" | "calentamiento";
  // Para "escalas": las temperaturas en °C que va marcando.
  temperaturas?: number[];
}
export interface VisualDinamiaParticulas extends VisualBase {
  tipo: "dinamia.particulas";
  modo: "temperatura" | "boyle" | "charles";
  // temperatura y charles: kelvin de cada paso; boyle: litros de cada paso.
  valores: number[];
  // Presión inicial en atm (boyle) o volumen inicial en L (charles).
  inicial?: number;
}
export interface VisualDinamiaCiclo extends VisualBase {
  tipo: "dinamia.ciclo";
  qc: number;
  w: number;
}
export interface VisualDinamiaFluido extends VisualBase {
  tipo: "dinamia.fluido";
  modo: "presion" | "prensa" | "flota";
  profundidades?: number[];
  f1?: number;
  a1?: number;
  a2?: number;
  densidad?: number;
  liquido?: number;
}
export interface VisualDinamiaTubo extends VisualBase {
  tipo: "dinamia.tubo";
  modo: "continuidad" | "torricelli";
  v1?: number;
  k?: number;
  h?: number;
}

export type VisualDinamia =
  | VisualDinamiaTrayecto
  | VisualDinamiaGrafica
  | VisualDinamiaCaida
  | VisualDinamiaParabola
  | VisualDinamiaVectores
  | VisualDinamiaCuerpoLibre
  | VisualDinamiaPoleas
  | VisualDinamiaCircular
  | VisualDinamiaEnergia
  | VisualDinamiaChoque
  | VisualDinamiaTermometro
  | VisualDinamiaParticulas
  | VisualDinamiaCiclo
  | VisualDinamiaFluido
  | VisualDinamiaTubo;

export const TIPOS_VISUALES_DINAMIA = [
  "dinamia.trayecto",
  "dinamia.grafica",
  "dinamia.caida",
  "dinamia.parabola",
  "dinamia.vectores",
  "dinamia.cuerpoLibre",
  "dinamia.poleas",
  "dinamia.circular",
  "dinamia.energia",
  "dinamia.choque",
  "dinamia.termometro",
  "dinamia.particulas",
  "dinamia.ciclo",
  "dinamia.fluido",
  "dinamia.tubo",
] as const;
