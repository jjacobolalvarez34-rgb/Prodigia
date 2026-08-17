const CLAVE = "prodigia-sonido";

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((l) => l());
}

export function subscribeSonido(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function sonidoHabilitado(): boolean {
  try {
    return localStorage.getItem(CLAVE) !== "off";
  } catch {
    return true;
  }
}

// Snapshot fijo para el render en servidor: siempre "habilitado", nunca
// se reproduce nada ahí de todas formas (reproducirTono chequea
// `typeof window`), solo hace falta que el snapshot sea estable.
export function sonidoHabilitadoServerSnapshot(): boolean {
  return true;
}

export function setSonidoHabilitado(habilitado: boolean) {
  try {
    localStorage.setItem(CLAVE, habilitado ? "on" : "off");
  } catch {
    // si localStorage falla, el sonido simplemente vuelve a su default (on)
  }
  emitChange();
}

let ctx: AudioContext | null = null;

function prefiereMenosEstimulo(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function obtenerContexto(): AudioContext | null {
  try {
    if (!ctx) {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AudioCtx();
    }
    return ctx;
  } catch {
    return null;
  }
}

interface Nota {
  freq: number;
  inicio: number; // segundos desde que arranca la secuencia
  duracion: number;
  volumen?: number;
  tipoOnda?: OscillatorType;
}

function reproducirSecuencia(notas: Nota[]) {
  const audioCtx = obtenerContexto();
  if (!audioCtx) return;
  const ahora = audioCtx.currentTime;
  for (const nota of notas) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = nota.tipoOnda ?? "sine";
    osc.frequency.value = nota.freq;
    const t0 = ahora + nota.inicio;
    const vol = nota.volumen ?? 0.12;
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + nota.duracion);
    osc.start(t0);
    osc.stop(t0 + nota.duracion);
  }
}

export type TipoTono = "correcto" | "error" | "nivel" | "logro" | "duelo_gano" | "duelo_perdio";

// Tonos generados con Web Audio (sin archivos de audio con licencia):
// tick agudo al acertar, uno grave al fallar, chime ascendente al subir
// de nivel, fanfarria corta al desbloquear un logro, y un tono distinto
// para ganar vs. perder un duelo (Fase I2) — nunca uno punitivo para la
// derrota, solo más apagado. Respeta el mute de /ajustes y
// prefers-reduced-motion.
export function reproducirTono(tipo: TipoTono) {
  if (!sonidoHabilitado() || prefiereMenosEstimulo()) return;
  if (typeof window === "undefined") return;

  try {
    if (tipo === "correcto") {
      reproducirSecuencia([{ freq: 880, inicio: 0, duracion: 0.22 }]);
    } else if (tipo === "error") {
      reproducirSecuencia([{ freq: 220, inicio: 0, duracion: 0.22 }]);
    } else if (tipo === "nivel") {
      reproducirSecuencia([
        { freq: 523.25, inicio: 0, duracion: 0.16, tipoOnda: "triangle" },
        { freq: 659.25, inicio: 0.09, duracion: 0.16, tipoOnda: "triangle" },
        { freq: 784.0, inicio: 0.18, duracion: 0.28, tipoOnda: "triangle" },
      ]);
    } else if (tipo === "logro") {
      reproducirSecuencia([
        { freq: 523.25, inicio: 0, duracion: 0.14, tipoOnda: "square", volumen: 0.08 },
        { freq: 659.25, inicio: 0.08, duracion: 0.14, tipoOnda: "square", volumen: 0.08 },
        { freq: 784.0, inicio: 0.16, duracion: 0.14, tipoOnda: "square", volumen: 0.08 },
        { freq: 1046.5, inicio: 0.24, duracion: 0.4, tipoOnda: "square", volumen: 0.1 },
      ]);
    } else if (tipo === "duelo_gano") {
      reproducirSecuencia([
        { freq: 659.25, inicio: 0, duracion: 0.18, tipoOnda: "triangle" },
        { freq: 784.0, inicio: 0.1, duracion: 0.18, tipoOnda: "triangle" },
        { freq: 1046.5, inicio: 0.2, duracion: 0.45, tipoOnda: "triangle" },
      ]);
    } else if (tipo === "duelo_perdio") {
      // Descendente pero suave — nunca punitivo, apenas un cierre de
      // partida distinto al de ganar.
      reproducirSecuencia([
        { freq: 392.0, inicio: 0, duracion: 0.2, volumen: 0.08 },
        { freq: 329.6, inicio: 0.12, duracion: 0.3, volumen: 0.07 },
      ]);
    }
  } catch {
    // audio no disponible en este navegador/contexto — no rompe la partida
  }
}
