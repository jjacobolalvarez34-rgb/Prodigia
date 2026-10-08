// Tipos públicos del mundo Dinamia (Física, mundo 14). Viven acá para que los
// dibujos (web y app) los importen sin depender del generador.

export type ModoDinamia = "cinematica" | "vectores" | "newton" | "energia" | "termo" | "fluidos";

export const MODOS_DINAMIA: readonly ModoDinamia[] = ["cinematica", "vectores", "newton", "energia", "termo", "fluidos"];

export const NOMBRE_MODO_DINAMIA: Record<ModoDinamia, string> = {
  cinematica: "Cinemática",
  vectores: "Vectores",
  newton: "Leyes de Newton",
  energia: "Trabajo y energía",
  termo: "Termodinámica",
  fluidos: "Fluidos",
};

export const SIMBOLO_MODO_DINAMIA: Record<ModoDinamia, string> = {
  cinematica: "v",
  vectores: "⇀",
  newton: "F",
  energia: "E",
  termo: "°",
  fluidos: "ρ",
};

export const DESCRIPCION_MODO_DINAMIA: Record<ModoDinamia, string> = {
  cinematica: "MRU, MRUA, caída libre y tiros.",
  vectores: "Sumar, descomponer y equilibrar.",
  newton: "Fuerzas, rozamiento y planos.",
  energia: "Trabajo, potencia y conservación.",
  termo: "Temperatura, calor y gases.",
  fluidos: "Densidad, presión y empuje.",
};

// Lo que se dibuja arriba del enunciado cuando hace falta verlo.
export type DiagramaDinamia =
  | {
      tipo: "grafica";
      // x-t: posición (m) contra tiempo (s); v-t: velocidad (m/s) contra tiempo.
      eje: "x-t" | "v-t";
      puntos: [number, number][];
    }
  | {
      tipo: "vectores";
      // Componentes enteras en una cuadrícula; se dibujan desde el origen.
      vectores: { nombre: string; x: number; y: number }[];
    };

export type TipoProblemaDinamia = string;

interface Base {
  modo: ModoDinamia;
  enunciado: string;
  diagrama?: DiagramaDinamia;
  detalle: { tipo: TipoProblemaDinamia; params?: Record<string, number | string> };
}

export interface ProblemaDinamiaNumero extends Base {
  entrada: "numero";
  respuesta: number;
  tolerancia: number;
}

export interface ProblemaDinamiaOpciones extends Base {
  entrada: "opciones";
  opciones: string[];
  respuesta: string;
}

export type ProblemaDinamia = ProblemaDinamiaNumero | ProblemaDinamiaOpciones;
