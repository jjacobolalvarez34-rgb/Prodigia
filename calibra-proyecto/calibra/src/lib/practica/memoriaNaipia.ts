// Máquina de estados y temporización del modo memoria de Naipia, sin React
// ni DOM para poder probarla con fake timers. La usa MemoriaCartas.
//
// Línea de tiempo (t = 0 es el montaje del componente):
//   [0, INICIO_MEMORIA_MS)                    fase "preparando" (dorsos, nada visible)
//   [INICIO + i*ms, INICIO + (i+1)*ms)        carta i visible; las anteriores boca abajo
//   >= INICIO + n*ms                          fase "terminada": todas boca abajo
//
// El reloj de respuesta (timeMs que va a /api/attempts, calibración y racha)
// arranca en el instante `finMs`, cuando se llama a `onFin`: el tiempo de
// reparto NUNCA cuenta como tiempo de respuesta.

// Cuenta regresiva corta antes de la primera carta: sin ella la carta 1 salía
// pegada a la aparición de la tarjeta y se perdía.
export const INICIO_MEMORIA_MS = 900;

export interface CalendarioMemoria {
  nCartas: number;
  msPorCarta: number;
  // Instante en que aparece cada carta (y se oculta la anterior).
  apareceMs: number[];
  // Instante en que se oculta la última y termina el reparto.
  finMs: number;
}

export function calendarioMemoria(nCartas: number, msPorCarta: number): CalendarioMemoria {
  const apareceMs = Array.from({ length: nCartas }, (_, i) => INICIO_MEMORIA_MS + i * msPorCarta);
  return { nCartas, msPorCarta, apareceMs, finMs: INICIO_MEMORIA_MS + nCartas * msPorCarta };
}

export type FaseMemoria = "preparando" | "mostrando" | "terminada";

export interface EstadoMemoria {
  fase: FaseMemoria;
  // Índice (0-based) de la carta visible; null si no hay ninguna.
  visible: number | null;
  // Cuántas cartas ya se dieron vuelta (dorso).
  ocultas: number;
}

export function estadoMemoriaEn(cal: CalendarioMemoria, tMs: number): EstadoMemoria {
  if (tMs >= cal.finMs) return { fase: "terminada", visible: null, ocultas: cal.nCartas };
  if (tMs < INICIO_MEMORIA_MS) return { fase: "preparando", visible: null, ocultas: 0 };
  const i = Math.min(cal.nCartas - 1, Math.floor((tMs - INICIO_MEMORIA_MS) / cal.msPorCarta));
  return { fase: "mostrando", visible: i, ocultas: i };
}

export function estadoInicialMemoria(cal: CalendarioMemoria): EstadoMemoria {
  return estadoMemoriaEn(cal, 0);
}

interface Callbacks {
  onEstado: (e: EstadoMemoria) => void;
  onFin: () => void;
}

// Programa los cambios de estado con setTimeout (todos con offset absoluto
// desde ahora: no acumulan deriva). Devuelve la función que cancela todo
// (desmontar / cambiar de pregunta). `onFin` se llama UNA sola vez, justo
// después de emitir el estado "terminada".
export function programarMemoria(cal: CalendarioMemoria, cb: Callbacks): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  cb.onEstado(estadoInicialMemoria(cal));
  cal.apareceMs.forEach((t, i) => {
    timers.push(setTimeout(() => cb.onEstado({ fase: "mostrando", visible: i, ocultas: i }), t));
  });
  timers.push(
    setTimeout(() => {
      cb.onEstado({ fase: "terminada", visible: null, ocultas: cal.nCartas });
      cb.onFin();
    }, cal.finMs)
  );
  return () => timers.forEach((id) => clearTimeout(id));
}

// Cronómetro de respuesta del modo memoria: `marcarInicio` se llama cuando el
// reparto termina; `transcurrido` es el tiempo de respuesta (timeMs). Es la
// misma lógica que usa NaipiaSprintRunner (shownAtRef) extraída para probarla.
export function crearCronometroRespuesta(ahora: () => number = () => performance.now()) {
  let inicio: number | null = null;
  return {
    marcarInicio() {
      inicio = ahora();
    },
    transcurrido(): number {
      return inicio === null ? 0 : Math.round(ahora() - inicio);
    },
  };
}
