import { SONIDOS } from "@/lib/recompensas/catalogo";

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
      // Pedido 2026-10-01: los efectos tienen que sonar por el volumen
      // multimedia aunque el teléfono esté en silencio (como un juego), no
      // como un tono de llamada. La Audio Session API (Safari 16.4+, y en
      // camino en Chrome) lo declara explícito; donde no existe no hace nada.
      const sesion = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
      if (sesion) sesion.type = "playback";
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AudioCtx();
    }
    // Algunos navegadores dejan el contexto suspendido hasta un gesto: se reanuda.
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

interface Nota {
  freq: number;
  // Si está, la altura se desliza hasta acá durante la nota (el «ehhh» del error).
  freqFin?: number;
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
    const t0 = ahora + nota.inicio;
    osc.frequency.setValueAtTime(nota.freq, t0);
    if (nota.freqFin) osc.frequency.exponentialRampToValueAtTime(nota.freqFin, t0 + nota.duracion);
    const vol = nota.volumen ?? 0.12;
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + nota.duracion);
    osc.start(t0);
    osc.stop(t0 + nota.duracion);
  }
}

// Fase 7 (Melodía, modo "oído absoluto"): reproduce la frecuencia real
// de una nota musical (A4 = 440Hz, temperamento igual — mismo cálculo
// que melodia.ts usa para el pentagrama, ver semitonoAbsoluto) como
// tono sintetizado — nada de archivos de audio externos, mismo
// criterio que el resto de esta función. Dos armónicos suaves además
// de la fundamental (no un seno puro) para que se sienta más "nota de
// instrumento" que un beep de prueba de audio.
export function reproducirNotaMusical(freq: number) {
  if (!sonidoHabilitado() || typeof window === "undefined") return;
  try {
    reproducirSecuencia([
      { freq, inicio: 0, duracion: 1.1, tipoOnda: "triangle", volumen: 0.14 },
      { freq: freq * 2, inicio: 0, duracion: 0.9, tipoOnda: "sine", volumen: 0.03 },
    ]);
  } catch {
    // audio no disponible en este navegador/contexto
  }
}

// Oído absoluto de acordes (Melodía, niveles 7-10): las notas del acorde a la
// vez, con el mismo timbre que reproducirNotaMusical y el volumen repartido
// para que el acorde no sature.
export function reproducirAcorde(freqs: number[]) {
  if (!sonidoHabilitado() || typeof window === "undefined" || freqs.length === 0) return;
  const vol = 0.3 / freqs.length;
  try {
    reproducirSecuencia(
      freqs.flatMap((freq) => [
        { freq, inicio: 0, duracion: 1.4, tipoOnda: "triangle" as OscillatorType, volumen: vol },
        { freq: freq * 2, inicio: 0, duracion: 1.1, tipoOnda: "sine" as OscillatorType, volumen: vol / 5 },
      ])
    );
  } catch {
    // audio no disponible
  }
}

// Modo Tempo de Melodía: un metrónomo de `pulsos` clics a `bpm`, con el tiempo
// fuerte (más agudo) cada `acentoCada`. Los clics se programan en el reloj del
// AudioContext (exactos, sin el temblor de setTimeout) y `alPulso` avisa a la UI
// en cada clic para que lo marque. Devuelve una función que lo detiene.
export function reproducirPulso(bpm: number, pulsos: number, acentoCada: number, alPulso?: (i: number) => void): () => void {
  const temporizadores: ReturnType<typeof setTimeout>[] = [];
  const osciladores: OscillatorNode[] = [];
  const parar = () => {
    for (const t of temporizadores) clearTimeout(t);
    for (const o of osciladores) {
      try {
        o.stop();
      } catch {
        // ya terminó
      }
    }
  };
  if (!sonidoHabilitado() || typeof window === "undefined") return parar;
  const audioCtx = obtenerContexto();
  if (!audioCtx) return parar;
  const intervalo = 60 / bpm;
  const ahora = audioCtx.currentTime + 0.08;
  for (let i = 0; i < pulsos; i++) {
    const fuerte = i % acentoCada === 0;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.value = fuerte ? 1568 : 1046.5;
    const t0 = ahora + i * intervalo;
    gain.gain.setValueAtTime(fuerte ? 0.16 : 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
    osc.start(t0);
    osc.stop(t0 + 0.07);
    osciladores.push(osc);
    if (alPulso) temporizadores.push(setTimeout(() => alPulso(i), (t0 - audioCtx.currentTime) * 1000));
  }
  if (alPulso) temporizadores.push(setTimeout(() => alPulso(-1), (ahora + pulsos * intervalo - audioCtx.currentTime) * 1000));
  return parar;
}

// Tienda ampliada (0248): paquete de sonido de acierto equipado y aviso de cada
// tono (el estallido del efecto de acierto escucha el "correcto" aunque el sonido
// esté apagado).
let paqueteAcierto = "clasico";
export function fijarPaqueteAcierto(paquete: string) {
  paqueteAcierto = paquete;
}

type OyenteTono = (tipo: TipoTono) => void;
const oyentesTono = new Set<OyenteTono>();
export function alReproducirTono(o: OyenteTono) {
  oyentesTono.add(o);
  return () => {
    oyentesTono.delete(o);
  };
}

// Muestra de un paquete de sonido (en la tienda).
export function probarPaqueteAcierto(paquete: string) {
  if (typeof window === "undefined") return;
  const p = SONIDOS[paquete] ?? SONIDOS.clasico;
  try {
    reproducirSecuencia(p.notas.map((n) => ({ freq: 880 * n.rel, inicio: n.inicio, duracion: n.duracion, tipoOnda: n.onda, volumen: n.volumen })));
  } catch {
    // audio no disponible
  }
}

export type TipoTono = "correcto" | "error" | "nivel" | "nivel_cuenta" | "logro" | "duelo_gano" | "duelo_perdio" | "compra" | "notificacion" | "cuenta" | "ya" | "tic" | "tic_urgente" | "tiempo_fin";

// Tonos generados con Web Audio (sin archivos de audio con licencia):
// tick agudo al acertar, uno grave al fallar, chime ascendente al subir
// de nivel, fanfarria corta al desbloquear un logro, y un tono distinto
// para ganar vs. perder un duelo (Fase I2) — nunca uno punitivo para la
// derrota, solo más apagado. Fase 10: 2 tonos más — "compra" (un
// clinc-clinc corto tipo caja registradora, para la Tienda) y
// "notificacion" (un ping breve de 2 notas, para la campanita de
// Social). Respeta el mute de /ajustes y prefers-reduced-motion.
export function reproducirTono(tipo: TipoTono) {
  oyentesTono.forEach((o) => o(tipo));
  if (!sonidoHabilitado() || prefiereMenosEstimulo()) return;
  if (typeof window === "undefined") return;

  try {
    if (tipo === "correcto") {
      const p = SONIDOS[paqueteAcierto];
      if (p && paqueteAcierto !== "clasico") {
        reproducirSecuencia(p.notas.map((n) => ({ freq: 880 * n.rel, inicio: n.inicio, duracion: n.duracion, tipoOnda: n.onda, volumen: n.volumen })));
      } else {
        reproducirSecuencia([{ freq: 880, inicio: 0, duracion: 0.22 }]);
      }
    } else if (tipo === "error") {
      // «Eh-ehhh»: dos notas que caen, la segunda deslizándose hacia abajo
      // (pedido 2026-10-09). Mismos números en mobile/scripts/generar-sonidos.py.
      reproducirSecuencia([
        { freq: 330, freqFin: 294, inicio: 0, duracion: 0.13, tipoOnda: "triangle", volumen: 0.1 },
        { freq: 294, freqFin: 185, inicio: 0.15, duracion: 0.42, tipoOnda: "triangle", volumen: 0.11 },
      ]);
    } else if (tipo === "nivel") {
      reproducirSecuencia([
        { freq: 523.25, inicio: 0, duracion: 0.16, tipoOnda: "triangle" },
        { freq: 659.25, inicio: 0.09, duracion: 0.16, tipoOnda: "triangle" },
        { freq: 784.0, inicio: 0.18, duracion: 0.28, tipoOnda: "triangle" },
      ]);
    } else if (tipo === "nivel_cuenta") {
      // Pedido en vivo (2026-09-15, "cápsula de chispas" al subir de
      // nivel de cuenta) — mismo criterio conceptual que el spec previo
      // (docs/audits/LEVEL-UP-ANIMACION-2026-09-08.md): un glissando
      // corto que "carga" energía, un golpe grave (la cápsula se abre),
      // y una fanfarria mayor arriba (la recompensa) — todo en una sola
      // secuencia Web Audio, sin archivos de audio.
      reproducirSecuencia([
        { freq: 392.0, inicio: 0, duracion: 0.1, tipoOnda: "triangle", volumen: 0.05 },
        { freq: 440.0, inicio: 0.08, duracion: 0.1, tipoOnda: "triangle", volumen: 0.06 },
        { freq: 523.25, inicio: 0.16, duracion: 0.12, tipoOnda: "triangle", volumen: 0.07 },
        { freq: 130.81, inicio: 0.3, duracion: 0.15, tipoOnda: "square", volumen: 0.1 },
        { freq: 659.25, inicio: 0.42, duracion: 0.18, tipoOnda: "triangle", volumen: 0.1 },
        { freq: 784.0, inicio: 0.54, duracion: 0.18, tipoOnda: "triangle", volumen: 0.1 },
        { freq: 1046.5, inicio: 0.66, duracion: 0.5, tipoOnda: "triangle", volumen: 0.12 },
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
    } else if (tipo === "compra") {
      reproducirSecuencia([
        { freq: 1318.5, inicio: 0, duracion: 0.09, tipoOnda: "square", volumen: 0.07 },
        { freq: 1760.0, inicio: 0.07, duracion: 0.16, tipoOnda: "square", volumen: 0.09 },
      ]);
    } else if (tipo === "cuenta") {
      // Cuenta regresiva antes de la partida (3, 2, 1) y el "¡Ya!" final.
      reproducirSecuencia([{ freq: 660, inicio: 0, duracion: 0.16, volumen: 0.1 }]);
    } else if (tipo === "ya") {
      reproducirSecuencia([
        { freq: 990, inicio: 0, duracion: 0.32, volumen: 0.1 },
        { freq: 1320, inicio: 0, duracion: 0.32, volumen: 0.07 },
      ]);
    } else if (tipo === "tic") {
      // Cuenta regresiva de los últimos 10 segundos.
      reproducirSecuencia([
        { freq: 1250, inicio: 0, duracion: 0.045, volumen: 0.09 },
        { freq: 2500, inicio: 0, duracion: 0.02, volumen: 0.03 },
      ]);
    } else if (tipo === "tic_urgente") {
      // Los últimos 3 segundos: más agudo y fuerte.
      reproducirSecuencia([
        { freq: 1650, inicio: 0, duracion: 0.07, volumen: 0.11 },
        { freq: 3300, inicio: 0, duracion: 0.03, volumen: 0.04 },
      ]);
    } else if (tipo === "tiempo_fin") {
      // Se acabó el tiempo: tres notas que bajan y una base grave.
      reproducirSecuencia([
        { freq: 880, inicio: 0, duracion: 0.12, tipoOnda: "square", volumen: 0.07 },
        { freq: 698.46, inicio: 0.12, duracion: 0.12, tipoOnda: "square", volumen: 0.07 },
        { freq: 587.33, inicio: 0.24, duracion: 0.5, tipoOnda: "square", volumen: 0.08 },
        { freq: 293.66, inicio: 0.24, duracion: 0.5, tipoOnda: "triangle", volumen: 0.06 },
      ]);
    } else if (tipo === "notificacion") {
      reproducirSecuencia([
        { freq: 987.77, inicio: 0, duracion: 0.1, tipoOnda: "sine", volumen: 0.08 },
        { freq: 1318.5, inicio: 0.09, duracion: 0.14, tipoOnda: "sine", volumen: 0.08 },
      ]);
    }
  } catch {
    // audio no disponible en este navegador/contexto — no rompe la partida
  }
}
