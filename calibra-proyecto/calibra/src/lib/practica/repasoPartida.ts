import { MAX_FALLAS_REPASO, type FallaRepaso } from "./repaso";

// Errores de la partida en curso, para el repaso del resumen (web). Cada runner llama
// a reiniciarRepaso() al empezar y a anotarFalla() cuando el jugador falla; el resumen
// los lee con fallasDeLaPartida(). Así ningún runner cambia lo que le pasa a su
// pantalla de resumen. Una sola partida a la vez por pestaña.

let fallas: FallaRepaso[] = [];

export function reiniciarRepaso() {
  fallas = [];
}

export function anotarFalla(f: FallaRepaso) {
  if (fallas.length < MAX_FALLAS_REPASO) fallas.push({ ...f, tuRespuesta: f.tuRespuesta?.trim() ? f.tuRespuesta.trim() : null });
}

export function fallasDeLaPartida(): FallaRepaso[] {
  return fallas;
}
