// Emparejamiento de duelos (Rankeds y casual), lado «pasivo»: cuando el rival nos
// encuentra a nosotros, buscar_rival_duelo le devuelve el duelo solo a él y nuestra
// fila de la cola desaparece. Hay que descubrir el duelo nuevo donde somos el retado.
//
// Bug del 2026-10-13 (web + app, duelo amistoso): esa búsqueda filtraba por
// «creado después de que empecé a buscar» con el reloj del dispositivo. Si el reloj
// iba unos segundos adelantado respecto de la base, el duelo nunca aparecía: el
// pasivo seguía buscando, le llegaba el aviso de «te retaron» y al aceptarlo se
// trababa. Ahora no depende del reloj: al empezar se anotan los duelos pendientes
// que ya existían y el primero NUEVO es el del emparejamiento. La ventana de
// tiempo es solo un tope amplio (10 min) para no traer historia vieja.
// Lo usan RankedsClient (web) y duelo/buscar (app).

export const MARGEN_RELOJ_MS = 10 * 60_000;

export function desdeConMargen(inicioMs: number): string {
  return new Date(inicioMs - MARGEN_RELOJ_MS).toISOString();
}

export function dueloNuevo<T extends { id: string }>(filas: readonly T[] | null | undefined, conocidos: ReadonlySet<string>): T | null {
  return (filas ?? []).find((f) => !conocidos.has(f.id)) ?? null;
}

// Mientras se busca rival, el aviso de «te retaron» no se muestra: el duelo que
// llega es el del emparejamiento y la búsqueda entra sola (si no, aparecía un aviso
// para aceptar un duelo que ya era tuyo).
//
// Arreglo del 2026-10-29: al encontrar el duelo, la búsqueda se cierra (y la marca se
// apagaba) ANTES de que llegara el INSERT por Realtime, que a veces se demora unos
// segundos; entonces el que esperaba veía «te retaron» de su propio duelo casual.
// Ahora el duelo que encontró el emparejamiento queda anotado (no se avisa nunca) y,
// si la búsqueda terminó por encontrarlo, la marca dura 30 s más: así tampoco se
// avisan las otras rondas de una serie, que nacen juntas. Cancelar la búsqueda no
// deja esa gracia (un reto de un amigo justo después sí se avisa). Además,
// desde 0307 la base marca la fila con `emparejado = true` (ver esDueloEmparejado).
export const GRACIA_FIN_BUSQUEDA_MS = 30_000;
let buscando = false;
let finBusqueda = 0;
const emparejados = new Set<string>();

export function marcarBuscandoDuelo(valor: boolean) {
  buscando = valor;
}
export function estaBuscandoDuelo(ahora: number = Date.now()): boolean {
  return buscando || (finBusqueda > 0 && ahora - finBusqueda < GRACIA_FIN_BUSQUEDA_MS);
}
export function anotarDueloEmparejado(duelId: string, ahora: number = Date.now()) {
  emparejados.add(duelId);
  finBusqueda = ahora;
}

// ¿Este duelo nuevo donde soy el retado viene del emparejamiento (casual o rankeds)
// y no de un reto de verdad? Si es así, no se muestra el aviso de «te retaron».
export function esDueloEmparejado(fila: { id: string; emparejado?: boolean | null }, ahora: number = Date.now()): boolean {
  return fila.emparejado === true || emparejados.has(fila.id) || estaBuscandoDuelo(ahora);
}
