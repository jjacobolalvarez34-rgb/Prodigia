// Estado del mensaje "sin errores" que muestra la pantalla de resumen de
// partida (se usa en TODOS los mundos, ~17 componentes de resumen casi
// idénticos). Antes, esa pantalla solo distinguía "hubo errores" vs "no
// hubo errores" (`errores.length === 0`), sin mirar si la partida
// efectivamente se completó — así que una partida sin ninguna respuesta
// (se acabó el tiempo sin tocar nada) o con solo algunas preguntas
// respondidas mostraba igual el mensaje festivo de "Ninguno fallado",
// que no correspondía. Esta función centraliza la lógica de 3+1 casos
// para que cada componente de resumen la use en vez de reimplementar la
// condición a mano.
export type EstadoResumenPartida =
  | "repasemosEsto"
  | "sinRespuestas"
  | "incompletaSinErrores"
  | "ningunoFallado";

/**
 * Determina qué mensaje mostrar en el bloque "sin errores" del resumen
 * de partida.
 *
 * @param total Preguntas efectivamente respondidas (`sprint.total`).
 * @param correctos Preguntas respondidas correctamente (`sprint.correctos`).
 * @param erroresLength Cantidad de errores (`errores.length`).
 * @param objetivo Tamaño esperado de una partida completa (la constante
 *   local del mundo, ej. `TOTAL_PREGUNTAS`/`TOTAL_PROBLEMAS`).
 */
export function estadoResumenPartida(
  total: number,
  correctos: number,
  erroresLength: number,
  objetivo: number
): EstadoResumenPartida {
  if (erroresLength > 0) return "repasemosEsto";
  if (total === 0) return "sinRespuestas";
  if (total < objetivo) return "incompletaSinErrores";
  return "ningunoFallado";
}
