// Sonido y háptica de la app (02-SISTEMA-VISUAL.md §8). Los sonidos son síntesis
// propia (assets/sonidos, ~440 KB en total), sin samples con licencia. Respetan los
// interruptores de Ajustes y el modo silencio del teléfono.
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
  swoosh: require("../../assets/sonidos/swoosh.wav"),
} as const;

export type Sonido = keyof typeof FUENTES;

const VOLUMEN: Partial<Record<Sonido, number>> = { tecla: 0.35, boton: 0.5, moneda: 0.55, swoosh: 0.6 };

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
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: "mixWithOthers" }).catch(() => {});
  }
  (["acierto0", "acierto1", "acierto2", "error", "moneda", "tecla", "boton"] as Sonido[]).forEach(reproductor);
}

export function sonar(nombre: Sonido) {
  if (!leerAjustes().sonido) return;
  const p = reproductor(nombre);
  if (!p) return;
  p.seekTo(0).catch(() => {});
  p.play();
}

// "Ding" con tono según el combo: 8 alturas de una escala pentatónica.
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
