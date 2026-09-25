import type { VisualBase } from "@/lib/aprender/visuales";
import type { NodoCircuito } from "@/lib/circuitos/resolver";

// Visuales propios de Circuitia (prefijo "circuitia."), mismo criterio que
// Naipia/Trigonometría: cada componente (src/components/circuitia/visuales/)
// solo DIBUJA lo que calculó una función pura de
// src/lib/circuitia/visualesDatos.ts (que a su vez SIEMPRE delega la física
// real a src/lib/circuitos/resolver.ts) — ningún voltaje/corriente/resistencia
// está escrito a mano en el componente ni inventado en el JSON de la lección
// más allá de los DATOS de entrada (topología, ohmios, voltaje de la fuente).
//
// Para AGREGAR un visual nuevo: 1) su tipo acá y en la unión VisualCircuitia,
// 2) su función de datos en visualesDatos.ts (con test contra un cálculo
// independiente), 3) el componente en src/components/circuitia/visuales/ y
// su entrada en registro.ts, 4) las claves de Circuitia.visuales.<nombre> en
// messages/es.json y en.json.

// ---------- Diagrama esquemático de un circuito ----------
// Dibuja la topología con el esquema de las lecciones (src/lib/circuitia/
// esquema.ts: batería, resistores en zigzag, cables y uniones, con la
// corriente convencional animada; Práctica y Diagnóstico siguen usando
// CircuitoSVG sin cambios) y, opcionalmente, revela el voltaje/corriente de
// cada resistor (siempre recalculados por resolverCircuito, nunca escritos a
// mano). Soporta serie, paralelo y una serie con UN bloque en paralelo.
export interface VisualCircuitiaCircuito extends VisualBase {
  tipo: "circuitia.circuito";
  topologia: NodoCircuito;
  vFuente: number;
  // Resistor a resaltar (id crudo "R1"/"Rp1", igual que en la práctica).
  resaltarId?: string;
  // Qué magnitud revelar sobre cada resistor. Por defecto "ninguna" (solo la
  // geometría — para las lecciones de "reconocer el tipo de circuito").
  mostrarValores?: "ninguna" | "voltaje" | "corriente" | "ambas";
  // Corriente animada fluyendo por los cables (marcha de guiones). Se apaga
  // sola con "reducir movimiento".
  animarCorriente?: boolean;
}

// ---------- Resistencia equivalente armada paso a paso ----------
// Serie: suma directa de los resistores. Paralelo: suma de recíprocos y
// luego se invierte — incluye el caso especial de 2 resistores iguales
// (R/2). Los resistores aparecen de a uno y al final se funden en un único
// resistor equivalente con el valor calculado.
export interface VisualCircuitiaResistenciaEquivalente extends VisualBase {
  tipo: "circuitia.resistenciaEquivalente";
  modo: "serie" | "paralelo";
  // 2 o 3 resistores (mismo rango que usa el generador de práctica).
  ohmios: number[];
}

// ---------- Ley de Ohm: triángulo V / I / R ----------
// Exactamente 2 de los 3 valores se dan como conocidos; el tercero se
// calcula (V = I·R) y se resalta al final de la animación.
export interface VisualCircuitiaLeyOhm extends VisualBase {
  tipo: "circuitia.leyOhm";
  v?: number;
  i?: number;
  r?: number;
}

export type VisualCircuitia = VisualCircuitiaCircuito | VisualCircuitiaResistenciaEquivalente | VisualCircuitiaLeyOhm;

export const TIPOS_VISUAL_CIRCUITIA = ["circuitia.circuito", "circuitia.resistenciaEquivalente", "circuitia.leyOhm"] as const;
