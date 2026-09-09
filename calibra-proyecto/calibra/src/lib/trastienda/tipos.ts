// Tipos de las respuestas RPC de la Trastienda (0121_trastienda_economia.sql).

export interface ResultadoRuleta {
  segmento: string;
  premio_tipo: string | null;
  premio_detalle: Record<string, unknown> | null;
  chispas_ganadas: number;
  puntos_total: number;
  giros_hoy: number;
  pity_activo: boolean;
  costo_aplicado: number;
}

export interface ResultadoVolado {
  cara: boolean;
  ganaste: boolean;
  entrada: number;
  chispas_ganadas: number;
  puntos_total: number;
}

export interface InicioPizarra {
  pizarra_id: string;
  entrada: number;
  partidas_hoy: number;
  puntos_total: number;
}

export interface AdivinanzaPizarra {
  ganaste: boolean;
  terminado: boolean;
  intentos: number;
  pista: string | null;
  chispas_ganadas: number;
  puntos_total: number;
}

export interface ItemHistorial {
  tipo: string;
  titulo: string;
  detalle: Record<string, unknown> | null;
  monto: number;
  creado_at: string;
}

// Mecánica 1 — apuestas a partidas de otros (0123).
export interface PartidaDisponible {
  partida_id: string;
  tipo: string;
  estado: string;
  operation_type: string;
  jugador_a_id: string;
  jugador_b_id: string;
  nombre_a: string;
  nombre_b: string;
  elo_a: number;
  elo_b: number;
}

export interface MiApuesta {
  id: string;
  partida_id: string;
  partida_tipo: string;
  eleccion: "a" | "b" | "empate";
  monto: number;
  multiplier: number;
  ganancia_potencial: number;
  estado: "pendiente" | "ganada" | "perdida" | "empate_devuelto";
  resultado_final: "a" | "b" | "empate" | null;
  payout: number;
  creado_at: string;
}

export interface LimitesApuestas {
  apuestas_realizadas: number;
  monto_total_apostado: number;
  perdida_total: number;
}

export interface PreviewApuesta {
  multiplier: number;
  ganancia_potencial: number;
  puntos_total: number;
}

export interface ResultadoApostar {
  apuesta_id: string;
  multiplier: number;
  ganancia_potencial: number;
  puntos_total: number;
  apuestas_hoy: number;
  monto_hoy: number;
}

// Mecánica 2 — predicción de ranking (0123).
export type PuestoPredicho = "1" | "2" | "3" | "4-5" | "6-10" | "11-20" | "21+";

export interface PrediccionActual {
  id: string;
  semana_inicio: string;
  puesto_predicho: PuestoPredicho;
  monto: number;
  multiplier: number;
  ganancia_potencial: number;
  estado: "pendiente" | "ganada" | "parcial" | "perdida";
  payout: number;
  puesto_real: number | null;
}

export interface ResultadoPrediccion {
  prediccion_id: string;
  semana: string;
  multiplier: number;
  ganancia_potencial: number;
  puntos_total: number;
}

// Minijuegos corte 2 (0124). Los RPC devuelven `id` (no *_id) y el
// resultado como `resolvio`/`ganado` + `payout`, según función.
export interface InicioLaCalcu {
  id: string;
  numeros: number[];
  target: number;
  puntos_total: number;
}

export interface ResultadoLaCalcu {
  resolvio: boolean;
  payout: number;
  puntos_total: number;
}

export interface InicioAcertijos {
  id: string;
  secuencia: number[];
  dificultad: "facil" | "media" | "dificil";
  puntos_total: number;
}

export interface ResultadoAcertijos {
  ganado: boolean;
  payout: number;
  puntos_total: number;
}

export interface ProblemaReloj {
  idx: number;
  a: number;
  b: number;
  op: "suma" | "resta";
}

export interface InicioElReloj {
  id: string;
  problemas: ProblemaReloj[];
  puntos_total: number;
}

export interface ResultadoElReloj {
  correctas: number;
  payout: number;
  puntos_total: number;
}