// Reconexión en un duelo de la web, como chess.com (2026-11-02, igual que la app):
// si recargas la página o se cae la conexión a mitad de la ronda, al volver sigues
// donde ibas. El reloj cuenta desde el arranque original (siguió corriendo mientras no
// estabas) y el cierre (/api/practica/finish) suma todos los intentos desde ese mismo
// arranque, así que lo que ya respondiste cuenta y no se repite la ronda. Si vuelves
// con el tiempo agotado, la ronda se cierra al instante con lo que alcanzaste.

const PREFIJO = "prodigia:duelo:web:";
// Pasado esto no hay ronda que retomar (0312 cierra el duelo por ausencia a los pocos minutos).
const VIGENCIA_MS = 30 * 60_000;

interface Guardado {
  iso: string;
  epoch: number;
  respondidos: number;
  correctos: number;
  xp: number;
}

function leer(duelId: string): Guardado | null {
  try {
    const g = JSON.parse(localStorage.getItem(PREFIJO + duelId) ?? "null") as Guardado | null;
    if (!g || Date.now() - g.epoch > VIGENCIA_MS) return null;
    return g;
  } catch {
    return null;
  }
}

function escribir(duelId: string, g: Guardado) {
  try {
    localStorage.setItem(PREFIJO + duelId, JSON.stringify(g));
  } catch {
    // Sin almacenamiento (modo privado): no hay reconexión, la ronda sigue igual.
  }
}

// Arranque de la ronda: cuándo empezó (hora del servidor si llegó) para retomarla.
export function guardarInicioDuelo(duelId: string | null | undefined, iso: string) {
  if (!duelId) return;
  const previo = leer(duelId);
  escribir(duelId, { respondidos: 0, correctos: 0, xp: 0, ...previo, iso, epoch: previo?.epoch ?? Date.now() });
}

export function leerInicioDuelo(duelId: string | null | undefined): { iso: string; epoch: number } | null {
  if (!duelId) return null;
  const g = leer(duelId);
  return g ? { iso: g.iso, epoch: g.epoch } : null;
}

// performance.now() equivalente al arranque original (para el reloj del sprint).
export function perfDesdeEpoch(epoch: number): number {
  return performance.now() - (Date.now() - epoch);
}

export function leerAvanceDuelo(duelId: string | null | undefined): { respondidos: number; correctos: number; xp: number } | null {
  if (!duelId) return null;
  const g = leer(duelId);
  return g ? { respondidos: g.respondidos, correctos: g.correctos, xp: g.xp } : null;
}

export function guardarAvanceDuelo(duelId: string | null | undefined, avance: { respondidos: number; correctos: number; xp: number }) {
  if (!duelId) return;
  const g = leer(duelId);
  if (g) escribir(duelId, { ...g, ...avance });
}

export function borrarDueloGuardado(duelId: string | null | undefined) {
  if (!duelId) return;
  try {
    localStorage.removeItem(PREFIJO + duelId);
  } catch {
    // nada
  }
}
