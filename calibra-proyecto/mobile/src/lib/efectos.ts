// Sonido y háptica de la app (02-SISTEMA-VISUAL.md §8). Los sonidos son los mismos
// tonos que la web (src/lib/sonido.ts) sintetizados a archivo (assets/sonidos), sin
// samples con licencia. Suenan por el volumen MULTIMEDIA, como un juego: con el
// teléfono en silencio igual se oyen (pedido 2026-10-01); se apagan desde Ajustes.
import { temaActivo } from "@/lib/temas/temas";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { leerAjustes } from "./ajustes";

const FUENTES = {
  temporada_halloween: require("../../assets/sonidos/temporada_halloween.wav"),
  temporada_navidad: require("../../assets/sonidos/temporada_navidad.wav"),
  temporada_muertos: require("../../assets/sonidos/temporada_muertos.wav"),
  temporada_diwali: require("../../assets/sonidos/temporada_diwali.wav"),
  temporada_anio_nuevo: require("../../assets/sonidos/temporada_anio_nuevo.wav"),
  temporada_anio_nuevo_lunar: require("../../assets/sonidos/temporada_anio_nuevo_lunar.wav"),
  temporada_amor_amistad: require("../../assets/sonidos/temporada_amor_amistad.wav"),
  temporada_carnaval: require("../../assets/sonidos/temporada_carnaval.wav"),
  temporada_holi: require("../../assets/sonidos/temporada_holi.wav"),
  temporada_pascua: require("../../assets/sonidos/temporada_pascua.wav"),
  temporada_dia_musica: require("../../assets/sonidos/temporada_dia_musica.wav"),
  temporada_vuelta_clases: require("../../assets/sonidos/temporada_vuelta_clases.wav"),
  acierto0: require("../../assets/sonidos/acierto0.wav"),
  acierto1: require("../../assets/sonidos/acierto1.wav"),
  acierto2: require("../../assets/sonidos/acierto2.wav"),
  acierto3: require("../../assets/sonidos/acierto3.wav"),
  acierto4: require("../../assets/sonidos/acierto4.wav"),
  acierto5: require("../../assets/sonidos/acierto5.wav"),
  acierto6: require("../../assets/sonidos/acierto6.wav"),
  acierto7: require("../../assets/sonidos/acierto7.wav"),
  acierto8: require("../../assets/sonidos/acierto8.wav"),
  acierto9: require("../../assets/sonidos/acierto9.wav"),
  acierto10: require("../../assets/sonidos/acierto10.wav"),
  acierto11: require("../../assets/sonidos/acierto11.wav"),
  acierto12: require("../../assets/sonidos/acierto12.wav"),
  acierto13: require("../../assets/sonidos/acierto13.wav"),
  acierto14: require("../../assets/sonidos/acierto14.wav"),
  acierto_campanitas0: require("../../assets/sonidos/acierto_campanitas0.wav"),
  acierto_campanitas1: require("../../assets/sonidos/acierto_campanitas1.wav"),
  acierto_campanitas2: require("../../assets/sonidos/acierto_campanitas2.wav"),
  acierto_campanitas3: require("../../assets/sonidos/acierto_campanitas3.wav"),
  acierto_campanitas4: require("../../assets/sonidos/acierto_campanitas4.wav"),
  acierto_campanitas5: require("../../assets/sonidos/acierto_campanitas5.wav"),
  acierto_campanitas6: require("../../assets/sonidos/acierto_campanitas6.wav"),
  acierto_campanitas7: require("../../assets/sonidos/acierto_campanitas7.wav"),
  acierto_campanitas8: require("../../assets/sonidos/acierto_campanitas8.wav"),
  acierto_campanitas9: require("../../assets/sonidos/acierto_campanitas9.wav"),
  acierto_campanitas10: require("../../assets/sonidos/acierto_campanitas10.wav"),
  acierto_campanitas11: require("../../assets/sonidos/acierto_campanitas11.wav"),
  acierto_campanitas12: require("../../assets/sonidos/acierto_campanitas12.wav"),
  acierto_campanitas13: require("../../assets/sonidos/acierto_campanitas13.wav"),
  acierto_campanitas14: require("../../assets/sonidos/acierto_campanitas14.wav"),
  acierto_ochobits0: require("../../assets/sonidos/acierto_ochobits0.wav"),
  acierto_ochobits1: require("../../assets/sonidos/acierto_ochobits1.wav"),
  acierto_ochobits2: require("../../assets/sonidos/acierto_ochobits2.wav"),
  acierto_ochobits3: require("../../assets/sonidos/acierto_ochobits3.wav"),
  acierto_ochobits4: require("../../assets/sonidos/acierto_ochobits4.wav"),
  acierto_ochobits5: require("../../assets/sonidos/acierto_ochobits5.wav"),
  acierto_ochobits6: require("../../assets/sonidos/acierto_ochobits6.wav"),
  acierto_ochobits7: require("../../assets/sonidos/acierto_ochobits7.wav"),
  acierto_ochobits8: require("../../assets/sonidos/acierto_ochobits8.wav"),
  acierto_ochobits9: require("../../assets/sonidos/acierto_ochobits9.wav"),
  acierto_ochobits10: require("../../assets/sonidos/acierto_ochobits10.wav"),
  acierto_ochobits11: require("../../assets/sonidos/acierto_ochobits11.wav"),
  acierto_ochobits12: require("../../assets/sonidos/acierto_ochobits12.wav"),
  acierto_ochobits13: require("../../assets/sonidos/acierto_ochobits13.wav"),
  acierto_ochobits14: require("../../assets/sonidos/acierto_ochobits14.wav"),
  acierto_marimba0: require("../../assets/sonidos/acierto_marimba0.wav"),
  acierto_marimba1: require("../../assets/sonidos/acierto_marimba1.wav"),
  acierto_marimba2: require("../../assets/sonidos/acierto_marimba2.wav"),
  acierto_marimba3: require("../../assets/sonidos/acierto_marimba3.wav"),
  acierto_marimba4: require("../../assets/sonidos/acierto_marimba4.wav"),
  acierto_marimba5: require("../../assets/sonidos/acierto_marimba5.wav"),
  acierto_marimba6: require("../../assets/sonidos/acierto_marimba6.wav"),
  acierto_marimba7: require("../../assets/sonidos/acierto_marimba7.wav"),
  acierto_marimba8: require("../../assets/sonidos/acierto_marimba8.wav"),
  acierto_marimba9: require("../../assets/sonidos/acierto_marimba9.wav"),
  acierto_marimba10: require("../../assets/sonidos/acierto_marimba10.wav"),
  acierto_marimba11: require("../../assets/sonidos/acierto_marimba11.wav"),
  acierto_marimba12: require("../../assets/sonidos/acierto_marimba12.wav"),
  acierto_marimba13: require("../../assets/sonidos/acierto_marimba13.wav"),
  acierto_marimba14: require("../../assets/sonidos/acierto_marimba14.wav"),
  acierto_xilofono0: require("../../assets/sonidos/acierto_xilofono0.wav"),
  acierto_xilofono1: require("../../assets/sonidos/acierto_xilofono1.wav"),
  acierto_xilofono2: require("../../assets/sonidos/acierto_xilofono2.wav"),
  acierto_xilofono3: require("../../assets/sonidos/acierto_xilofono3.wav"),
  acierto_xilofono4: require("../../assets/sonidos/acierto_xilofono4.wav"),
  acierto_xilofono5: require("../../assets/sonidos/acierto_xilofono5.wav"),
  acierto_xilofono6: require("../../assets/sonidos/acierto_xilofono6.wav"),
  acierto_xilofono7: require("../../assets/sonidos/acierto_xilofono7.wav"),
  acierto_xilofono8: require("../../assets/sonidos/acierto_xilofono8.wav"),
  acierto_xilofono9: require("../../assets/sonidos/acierto_xilofono9.wav"),
  acierto_xilofono10: require("../../assets/sonidos/acierto_xilofono10.wav"),
  acierto_xilofono11: require("../../assets/sonidos/acierto_xilofono11.wav"),
  acierto_xilofono12: require("../../assets/sonidos/acierto_xilofono12.wav"),
  acierto_xilofono13: require("../../assets/sonidos/acierto_xilofono13.wav"),
  acierto_xilofono14: require("../../assets/sonidos/acierto_xilofono14.wav"),
  acierto_arcade0: require("../../assets/sonidos/acierto_arcade0.wav"),
  acierto_arcade1: require("../../assets/sonidos/acierto_arcade1.wav"),
  acierto_arcade2: require("../../assets/sonidos/acierto_arcade2.wav"),
  acierto_arcade3: require("../../assets/sonidos/acierto_arcade3.wav"),
  acierto_arcade4: require("../../assets/sonidos/acierto_arcade4.wav"),
  acierto_arcade5: require("../../assets/sonidos/acierto_arcade5.wav"),
  acierto_arcade6: require("../../assets/sonidos/acierto_arcade6.wav"),
  acierto_arcade7: require("../../assets/sonidos/acierto_arcade7.wav"),
  acierto_arcade8: require("../../assets/sonidos/acierto_arcade8.wav"),
  acierto_arcade9: require("../../assets/sonidos/acierto_arcade9.wav"),
  acierto_arcade10: require("../../assets/sonidos/acierto_arcade10.wav"),
  acierto_arcade11: require("../../assets/sonidos/acierto_arcade11.wav"),
  acierto_arcade12: require("../../assets/sonidos/acierto_arcade12.wav"),
  acierto_arcade13: require("../../assets/sonidos/acierto_arcade13.wav"),
  acierto_arcade14: require("../../assets/sonidos/acierto_arcade14.wav"),
  acierto_arpa0: require("../../assets/sonidos/acierto_arpa0.wav"),
  acierto_arpa1: require("../../assets/sonidos/acierto_arpa1.wav"),
  acierto_arpa2: require("../../assets/sonidos/acierto_arpa2.wav"),
  acierto_arpa3: require("../../assets/sonidos/acierto_arpa3.wav"),
  acierto_arpa4: require("../../assets/sonidos/acierto_arpa4.wav"),
  acierto_arpa5: require("../../assets/sonidos/acierto_arpa5.wav"),
  acierto_arpa6: require("../../assets/sonidos/acierto_arpa6.wav"),
  acierto_arpa7: require("../../assets/sonidos/acierto_arpa7.wav"),
  acierto_arpa8: require("../../assets/sonidos/acierto_arpa8.wav"),
  acierto_arpa9: require("../../assets/sonidos/acierto_arpa9.wav"),
  acierto_arpa10: require("../../assets/sonidos/acierto_arpa10.wav"),
  acierto_arpa11: require("../../assets/sonidos/acierto_arpa11.wav"),
  acierto_arpa12: require("../../assets/sonidos/acierto_arpa12.wav"),
  acierto_arpa13: require("../../assets/sonidos/acierto_arpa13.wav"),
  acierto_arpa14: require("../../assets/sonidos/acierto_arpa14.wav"),
  acierto_cristal0: require("../../assets/sonidos/acierto_cristal0.wav"),
  acierto_cristal1: require("../../assets/sonidos/acierto_cristal1.wav"),
  acierto_cristal2: require("../../assets/sonidos/acierto_cristal2.wav"),
  acierto_cristal3: require("../../assets/sonidos/acierto_cristal3.wav"),
  acierto_cristal4: require("../../assets/sonidos/acierto_cristal4.wav"),
  acierto_cristal5: require("../../assets/sonidos/acierto_cristal5.wav"),
  acierto_cristal6: require("../../assets/sonidos/acierto_cristal6.wav"),
  acierto_cristal7: require("../../assets/sonidos/acierto_cristal7.wav"),
  acierto_cristal8: require("../../assets/sonidos/acierto_cristal8.wav"),
  acierto_cristal9: require("../../assets/sonidos/acierto_cristal9.wav"),
  acierto_cristal10: require("../../assets/sonidos/acierto_cristal10.wav"),
  acierto_cristal11: require("../../assets/sonidos/acierto_cristal11.wav"),
  acierto_cristal12: require("../../assets/sonidos/acierto_cristal12.wav"),
  acierto_cristal13: require("../../assets/sonidos/acierto_cristal13.wav"),
  acierto_cristal14: require("../../assets/sonidos/acierto_cristal14.wav"),
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

// Carga antes los sonidos de una escena (cápsulas, cinemáticas): crear el reproductor
// la primera vez que suena traba un cuadro justo en el momento fuerte.
export function precargarSonidos(lista: Sonido[]) {
  lista.forEach(reproductor);
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
// el combo: 15 alturas (dos octavas), de ×1 a ×15, y luego alterna las dos últimas.
// Paquete de sonido de acierto equipado en la tienda ("clasico" = el de siempre).
let paqueteAcierto = "clasico";
export function fijarPaqueteAcierto(paquete: string) {
  paqueteAcierto = paquete;
}

export function sonarAcierto(combo: number) {
  // 15 alturas (dos octavas); después alterna las dos más altas para que la racha
  // larga nunca suene igual (2026-10-19).
  const n = Math.max(0, combo - 1);
  const altura = n <= 14 ? n : 14 - ((n - 14) % 2);
  const conPaquete = `acierto_${paqueteAcierto}${altura}`;
  sonar((paqueteAcierto !== "clasico" && conPaquete in FUENTES ? conPaquete : `acierto${altura}`) as Sonido);
  // Durante un evento, el toque de la fecha (celebracion.ts «acierto.instrumento»).
  const tema = temaActivo();
  const toque = tema && tema.fase === "evento" ? `temporada_${tema.tema.id}` : null;
  if (toque && toque in FUENTES) sonar(toque as Sonido);
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
