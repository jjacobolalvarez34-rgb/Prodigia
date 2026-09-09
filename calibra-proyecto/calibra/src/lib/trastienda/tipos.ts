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