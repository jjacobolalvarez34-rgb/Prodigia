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
  acierto_campanitas0: require("../../assets/sonidos/acierto_campanitas0.wav"),
  acierto_campanitas1: require("../../assets/sonidos/acierto_campanitas1.wav"),
  acierto_campanitas2: require("../../assets/sonidos/acierto_campanitas2.wav"),
  acierto_campanitas3: require("../../assets/sonidos/acierto_campanitas3.wav"),
  acierto_campanitas4: require("../../assets/sonidos/acierto_campanitas4.wav"),
  acierto_campanitas5: require("../../assets/sonidos/acierto_campanitas5.wav"),
  acierto_campanitas6: require("../../assets/sonidos/acierto_campanitas6.wav"),
  acierto_campanitas7: require("../../assets/sonidos/acierto_campanitas7.wav"),
  acierto_ochobits0: require("../../assets/sonidos/acierto_ochobits0.wav"),
  acierto_ochobits1: require("../../assets/sonidos/acierto_ochobits1.wav"),
  acierto_ochobits2: require("../../assets/sonidos/acierto_ochobits2.wav"),
  acierto_ochobits3: require("../../assets/sonidos/acierto_ochobits3.wav"),
  acierto_ochobits4: require("../../assets/sonidos/acierto_ochobits4.wav"),
  acierto_ochobits5: require("../../assets/sonidos/acierto_ochobits5.wav"),
  acierto_ochobits6: require("../../assets/sonidos/acierto_ochobits6.wav"),
  acierto_ochobits7: require("../../assets/sonidos/acierto_ochobits7.wav"),
  acierto_marimba0: require("../../assets/sonidos/acierto_marimba0.wav"),
  acierto_marimba1: require("../../assets/sonidos/acierto_marimba1.wav"),
  acierto_marimba2: require("../../assets/sonidos/acierto_marimba2.wav"),
  acierto_marimba3: require("../../assets/sonidos/acierto_marimba3.wav"),
  acierto_marimba4: require("../../assets/sonidos/acierto_marimba4.wav"),
  acierto_marimba5: require("../../assets/sonidos/acierto_marimba5.wav"),
  acierto_marimba6: require("../../assets/sonidos/acierto_marimba6.wav"),
  acierto_marimba7: require("../../assets/sonidos/acierto_marimba7.wav"),
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
  tic: require("../../assets/sonidos/tic.wav"),
  tic_urgente: require("../../assets/sonidos/tic_urgente.wav"),
  tiempo_fin: require("../../assets/sonidos/tiempo_fin.wav"),
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

// Mientras se ve la intro de Mamut y la pantalla de carga, la app ya está montada
// detrás (el contador de Chispas sube, etc.): nada suena hasta que termina la carga
// (_layout.tsx llama a habilitarSonidos). Así no se mezcla nada con el logo.
let arranqueTerminado = false;
export function habilitarSonidos() {
  arranqueTerminado = true;
}

export function sonar(nombre: Sonido) {
  if (!arranqueTerminado || !leerAjustes().sonido) return;
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
// Paquete de sonido de acierto equipado en la tienda ("clasico" = el de siempre).
let paqueteAcierto = "clasico";
export function fijarPaqueteAcierto(paquete: string) {
  paqueteAcierto = paquete;
}

export function sonarAcierto(combo: number) {
  const altura = Math.min(7, Math.max(0, combo - 1));
  const conPaquete = `acierto_${paqueteAcierto}${altura}`;
  sonar((paqueteAcierto !== "clasico" && conPaquete in FUENTES ? conPaquete : `acierto${altura}`) as Sonido);
}

// Muestra de un paquete (en la tienda).
export function probarPaqueteAcierto(paquete: string) {
  const nombre = `acierto_${paquete}2`;
  sonar((paquete !== "clasico" && nombre in FUENTES ? nombre : "acierto2") as Sonido);
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
