// Sonido y háptica de la app (02-SISTEMA-VISUAL.md §8). Los sonidos son los mismos
// tonos que la web (src/lib/sonido.ts) sintetizados a archivo (assets/sonidos), sin
// samples con licencia. Suenan por el volumen MULTIMEDIA, como un juego: con el
// teléfono en silencio igual se oyen (pedido 2026-10-01); se apagan desde Ajustes.
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { leerAjustes } from "./ajustes";

const FUENTES = {
  acierto0: require("../../assets/sonidos/acierto0.wav"),
  acierto1: require("../../assets/sonidos/acierto1.wav"),
  acierto2: require("../../assets/sonidos/acierto2.wav"),
  acierto3: require("../../assets/sonidos/acierto3.wav"),
  acierto4: require("../../assets/sonidos/acierto4.wav"),
  acierto5: require("../../assets/sonidos/acierto5.wav"),
  acierto6: require("../../assets/sonidos/acierto6.wav"),
  acierto7: require("../../assets/sonidos/acierto7.wav"),
  error: require("../../assets/sonidos/error.wav"),
  moneda: require("../../assets/sonidos/moneda.wav"),
  tecla: require("../../assets/sonidos/tecla.wav"),
  boton: require("../../assets/sonidos/boton.wav"),
  combo: require("../../assets/sonidos/combo.wav"),
  nivel: require("../../assets/sonidos/nivel.wav"),
  victoria: require("../../assets/sonidos/victoria.wav"),
  derrota: require("../../assets/sonidos/derrota.wav"),
  racha: require("../../assets/sonidos/racha.wav"),
  cuenta: require("../../assets/sonidos/cuenta.wav"),
  ya: require("../../assets/sonidos/ya.wav"),
  recompensa: require("../../assets/sonidos/recompensa.wav"),
  logro: require("../../assets/sonidos/logro.wav"),
  notificacion: require("../../assets/sonidos/notificacion.wav"),
  nivel_cuenta: require("../../assets/sonidos/nivel_cuenta.wav"),
  swoosh: require("../../assets/sonidos/swoosh.wav"),
} as const;

export type Sonido = keyof typeof FUENTES;

const VOLUMEN: Partial<Record<Sonido, number>> = { tecla: 0.5, boton: 0.6, moneda: 0.6, swoosh: 0.6 };

const reproductores = new Map<Sonido, AudioPlayer>();
let modoListo = false;

function reproductor(nombre: Sonido): AudioPlayer | null {
  try {
    let p = reproductores.get(nombre);
    if (!p) {
      p = createAudioPlayer(FUENTES[nombre]);
      p.volume = VOLUMEN[nombre] ?? 0.8;
      reproductores.set(nombre, p);
    }
    return p;
  } catch {
    return null;
  }
}

// Precarga los sonidos de partida para que el primer acierto no llegue tarde.
export function prepararSonidos() {
  if (!modoListo) {
    modoListo = true;
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "mixWithOthers", shouldPlayInBackground: false }).catch(() => {});
  }
  (["acierto0", "acierto1", "acierto2", "acierto3", "error", "moneda", "tecla", "boton", "cuenta", "ya"] as Sonido[]).forEach(reproductor);
}

const ultimoSonido = new Map<Sonido, number>();

export function sonar(nombre: Sonido) {
  if (!leerAjustes().sonido) return;
  // El mismo sonido no se repite en menos de 70 ms (monedas que llegan en ráfaga).
  const ahora = Date.now();
  if (ahora - (ultimoSonido.get(nombre) ?? 0) < 70) return;
  ultimoSonido.set(nombre, ahora);
  const p = reproductor(nombre);
  if (!p) return;
  // Volver al inicio y recién ahí reproducir: si se llama play() mientras el
  // seek no terminó, Android corta el principio y suena "sucio".
  p.pause();
  p.seekTo(0)
    .then(() => p.play())
    .catch(() => p.play());
}

// El "tick" de acierto de la web (seno de 880 Hz) que sube por la escala mayor con
// el combo: 8 alturas, de ×1 a ×8 o más.
export function sonarAcierto(combo: number) {
  sonar(`acierto${Math.min(7, Math.max(0, combo - 1))}` as Sonido);
}

let ultimaSeleccion = 0;

export const vibrar = {
  seleccion() {
    if (!leerAjustes().haptica) return;
    // Máximo una cada 60 ms (las Chispas que llegan al HUD no pueden zumbar sin parar).
    const ahora = Date.now();
    if (ahora - ultimaSeleccion < 60) return;
    ultimaSeleccion = ahora;
    Haptics.selectionAsync().catch(() => {});
  },
  ligero() {
    if (leerAjustes().haptica) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medio() {
    if (leerAjustes().haptica) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  fuerte() {
    if (leerAjustes().haptica) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  },
  exito() {
    if (leerAjustes().haptica) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  error() {
    if (leerAjustes().haptica) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
};
