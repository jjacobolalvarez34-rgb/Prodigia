import type { VisualBase } from "@/lib/aprender/visuales";
import type { SelectorTabla } from "./tabla";

// Visuales propios de Quimia (prefijo "quimia."), mismo criterio que
// Numeria/Naipia/Enigmia/Geografía: cada componente
// (src/components/quimia/visuales/) solo DIBUJA lo que calculó una función
// pura de src/lib/quimia/ (tabla.ts, datos.ts, nomenclatura.ts) — ningún
// dato químico está escrito a mano en el componente ni en el JSON de la
// lección más allá de qué símbolo/ion/enlace mostrar.
//
// Para AGREGAR un visual nuevo: 1) su tipo acá y en la unión VisualQuimia,
// 2) el componente en src/components/quimia/visuales/ y su entrada en
// registro.ts, 3) las claves de Quimia.visuales.<nombre> en messages/es.json
// y en.json, 4) un test de render en visuales.test.ts.

export type FlechaTabla = "derecha" | "izquierda" | "abajo" | "arriba";

// Un paso del visual "quimia.tabla": qué casilleros se resaltan y qué se dice.
export interface PasoTablaPeriodica {
  // Sin `seleccion`, la tabla se muestra entera sin resaltar nada.
  seleccion?: SelectorTabla;
  // Texto del paso (admite $...$).
  etiqueta: string;
  // Flecha de tendencia dibujada sobre la tabla (propiedades periódicas).
  flecha?: FlechaTabla;
}

// Tabla periódica de 118 elementos (18 columnas x 7 períodos + las dos filas
// del bloque f) que resalta, paso a paso, grupos, períodos, bloques,
// familias o elementos sueltos.
export interface VisualQuimiaTabla extends VisualBase {
  tipo: "quimia.tabla";
  pasos: PasoTablaPeriodica[];
}

export type CampoFicha =
  | "numeroAtomico"
  | "simbolo"
  | "nombre"
  | "masa"
  | "configuracion"
  | "electronegatividad"
  | "oxidacion"
  | "estado"
  | "posicion"
  | "familia";

// Ficha de un elemento: cada dato aparece con su explicación. Los datos
// salen de ELEMENTOS (práctica) + DATOS_ELEMENTOS (src/lib/quimia/datos.ts).
export interface VisualQuimiaElemento extends VisualBase {
  tipo: "quimia.elemento";
  simbolo: string;
  // Orden en que se revela cada campo (uno por paso).
  campos: CampoFicha[];
}

export type EjemploEnlace = "NaCl" | "MgO" | "H2" | "O2" | "N2" | "HCl" | "Na" | "Mg";
export type TipoEnlace = "ionico" | "covalente" | "metalico";

// Enlace iónico (transferencia de electrones), covalente (compartir) o
// metálico (mar de electrones), con un ejemplo real de cada uno.
export interface VisualQuimiaEnlace extends VisualBase {
  tipo: "quimia.enlace";
  enlace: TipoEnlace;
  ejemplo: EjemploEnlace;
}

// Método de "cruzar las cargas" para armar la fórmula de un compuesto
// iónico. `cation`/`anion` son ids de src/lib/quimia/nomenclatura.ts
// ("Al3+", "O2-", "SO4^2-").
export interface VisualQuimiaCruce extends VisualBase {
  tipo: "quimia.cruce";
  cation: string;
  anion: string;
}

// Tabla de datos que se va armando fila por fila (admite $...$ en las celdas).
export interface VisualQuimiaCuadro extends VisualBase {
  tipo: "quimia.cuadro";
  columnas: string[];
  filas: string[][];
}

// Orden de llenado de las subcapas (diagrama de Moeller) para un elemento:
// va apareciendo cada subcapa con sus electrones.
export interface VisualQuimiaOrbitales extends VisualBase {
  tipo: "quimia.orbitales";
  z: number;
}

// ---------- Tanda 2: redox ----------

// Reacción redox paso a paso: números de oxidación sobre cada átomo, quién
// sube y quién baja, electrones y agentes. `ejemplo` es un id de
// EJEMPLOS_REDOX (src/lib/quimia/redox.ts).
export interface VisualQuimiaRedox extends VisualBase {
  tipo: "quimia.redox";
  ejemplo: string;
}

// Cálculo del número de oxidación de UN elemento (regla de la suma cero /
// carga del ion). `fijos` aclara excepciones (H −1 en hidruros, O −1 en
// peróxidos).
export interface VisualQuimiaOxidacion extends VisualBase {
  tipo: "quimia.oxidacion";
  formula: string;
  carga?: number;
  incognita: string;
  fijos?: Record<string, number>;
}

// Balanceo ion-electrón de un caso de CASOS_BALANCEO, por pasos (medio ácido
// o básico).
export interface VisualQuimiaBalanceo extends VisualBase {
  tipo: "quimia.balanceo";
  caso: string;
}

// Pila galvánica esquemática (ánodo, cátodo, cable, puente salino) de dos
// metales de POTENCIALES; el ánodo es el de menor potencial.
export interface VisualQuimiaPila extends VisualBase {
  tipo: "quimia.pila";
  anodo: string;
  catodo: string;
}

// ---------- Tanda 2: orgánica ----------

// Esqueleto 2D de una molécula de CATALOGO_MOLECULAS. `modo` "nombrar": cadena
// principal, numeración, ramificaciones y nombre; "formulas": esqueleto,
// hidrógenos de cada carbono, fórmula condensada y molecular.
export interface VisualQuimiaCadena extends VisualBase {
  tipo: "quimia.cadena";
  molecula: string;
  modo?: "nombrar" | "formulas";
}

// Un grupo funcional por paso, sobre distintas moléculas (con el grupo
// resaltado, su fórmula general y el nombre).
export interface VisualQuimiaGrupos extends VisualBase {
  tipo: "quimia.grupos";
  moleculas: string[];
}

// Isómeros de una misma fórmula molecular, uno por paso.
export interface VisualQuimiaIsomeria extends VisualBase {
  tipo: "quimia.isomeria";
  moleculas: string[];
  isomeria?: "cadena" | "posicion" | "funcion" | "geometrica";
}

// Hibridación del carbono (sp³, sp², sp) de metano, eteno o etino, con
// enlaces sigma y pi y el ángulo.
export interface VisualQuimiaHibridacion extends VisualBase {
  tipo: "quimia.hibridacion";
  molecula: "metano" | "eteno" | "etino";
}

export type VisualQuimia =
  | VisualQuimiaTabla
  | VisualQuimiaElemento
  | VisualQuimiaEnlace
  | VisualQuimiaCruce
  | VisualQuimiaCuadro
  | VisualQuimiaOrbitales
  | VisualQuimiaRedox
  | VisualQuimiaOxidacion
  | VisualQuimiaBalanceo
  | VisualQuimiaPila
  | VisualQuimiaCadena
  | VisualQuimiaGrupos
  | VisualQuimiaIsomeria
  | VisualQuimiaHibridacion;
