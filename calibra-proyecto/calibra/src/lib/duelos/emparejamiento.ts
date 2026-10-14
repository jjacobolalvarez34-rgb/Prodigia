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
let buscando = false;
export function marcarBuscandoDuelo(valor: boolean) {
  buscando = valor;
}
export function estaBuscandoDuelo(): boolean {
  return buscando;
}
