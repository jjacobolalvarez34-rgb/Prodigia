// Detalle de un duelo del historial (2026-10-21): tú contra tu rival, pregunta
// por pregunta. Se arma con lo que ya existe y ya pueden leer los dos
// participantes (RLS de duels y duel_results, 0012) más el nombre del rival
// (obtener_duelo). Sin migraciones: anda aunque 0300 no se haya corrido.
// Lógica pura: la web y la app hacen las consultas y pasan las filas.
import type { TarjetaPartida, ResultadoTarjeta } from "./compartir";
import { estadisticasDe, normalizarRespuestas, type EstadisticasPartida, type RespuestaPartida } from "./estadisticas";

export interface FilaDueloDetalle {
  id: string;
  mundo: string;
  sub_tipo: string | null;
  operation_type: string | null;
  clasificatorio: boolean | null;
  creado_at: string;
  estado: string;
  ganador_id: string | null;
  retador_id: string;
  retado_id: string;
}

export interface FilaResultadoDuelo {
  user_id: string;
  precision: number | string | null;
  tiempo_promedio: number | string | null;
  puntaje_final: number | null;
  respuestas: unknown;
}

export interface LadoDetalle {
  puntaje: number;
  precision: number | null;
  tiempoPromedioMs: number | null;
  respuestas: RespuestaPartida[] | null;
  stats: EstadisticasPartida | null;
}

export interface DetalleDuelo {
  duelId: string;
  mundo: string;
  subTipo: string | null;
  operationType: string | null;
  clasificatorio: boolean;
  creadoAt: string;
  resultado: ResultadoTarjeta;
  rivalNombre: string | null;
  rivalEsBot: boolean;
  yo: LadoDetalle | null;
  rival: LadoDetalle | null;
}

// Lo que se pide a la base, igual en la web y en la app.
export const COLUMNAS_DUELO_DETALLE = "id, mundo, sub_tipo, operation_type, clasificatorio, creado_at, estado, ganador_id, retador_id, retado_id";
export const COLUMNAS_RESULTADO_DETALLE = "user_id, precision, tiempo_promedio, puntaje_final, respuestas";

function aNumero(v: number | string | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function lado(f: FilaResultadoDuelo | undefined): LadoDetalle | null {
  if (!f) return null;
  const respuestas = normalizarRespuestas(f.respuestas);
  return {
    puntaje: f.puntaje_final ?? 0,
    precision: aNumero(f.precision),
    tiempoPromedioMs: aNumero(f.tiempo_promedio),
    respuestas,
    stats: respuestas ? estadisticasDe(respuestas) : null,
  };
}

export function resultadoDuelo(d: Pick<FilaDueloDetalle, "estado" | "ganador_id">, userId: string): ResultadoTarjeta {
  if (d.estado !== "completado" && d.estado !== "abandonado") return "pendiente";
  if (!d.ganador_id) return "empate";
  return d.ganador_id === userId ? "victoria" : "derrota";
}

export function armarDetalleDuelo(
  duelo: FilaDueloDetalle | null,
  resultados: readonly FilaResultadoDuelo[] | null,
  userId: string,
  rival: { nombre: string | null; esBot: boolean } | null
): DetalleDuelo | null {
  if (!duelo || (duelo.retador_id !== userId && duelo.retado_id !== userId)) return null;
  const rivalId = duelo.retador_id === userId ? duelo.retado_id : duelo.retador_id;
  const filas = resultados ?? [];
  return {
    duelId: duelo.id,
    mundo: duelo.mundo,
    subTipo: duelo.sub_tipo,
    operationType: duelo.operation_type,
    clasificatorio: duelo.clasificatorio !== false,
    creadoAt: duelo.creado_at,
    resultado: resultadoDuelo(duelo, userId),
    rivalNombre: rival?.nombre ?? null,
    rivalEsBot: rival?.esBot ?? false,
    yo: lado(filas.find((f) => f.user_id === userId)),
    rival: lado(filas.find((f) => f.user_id === rivalId)),
  };
}

// La tarjeta para compartir desde el detalle (sin enlace o antes de tenerlo).
export function tarjetaDeDetalle(d: DetalleDuelo, miNombre: string | null): TarjetaPartida {
  const ladoTarjeta = (l: LadoDetalle | null, nombre: string | null) => ({
    nombre,
    correctos: l?.stats?.aciertos ?? null,
    total: l?.stats?.total ?? null,
    precision: l?.precision ?? null,
    puntaje: l?.puntaje ?? null,
    tiempoPromedioMs: l?.tiempoPromedioMs ?? null,
    respuestas: l?.respuestas ?? null,
  });
  return {
    tipo: "duelo",
    mundo: d.mundo,
    clasificatorio: d.clasificatorio,
    fecha: d.creadoAt,
    rachaMax: d.yo?.stats?.rachaMax ?? null,
    yo: ladoTarjeta(d.yo, miNombre),
    rival: { ...ladoTarjeta(d.rival, d.rivalNombre), esBot: d.rivalEsBot },
    resultado: d.resultado,
  };
}
