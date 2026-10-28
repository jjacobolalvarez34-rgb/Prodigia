// Pantallas de juego (segmentos de la ruta): ahí no va la decoración de temporada ni
// la capa de la Gran Alineación.
export const PANTALLAS_DE_JUEGO = new Set(["sprint", "duelo", "reto", "zen", "diagnostico", "reto-finde"]);

// Donde una cinemática de evento no interrumpe (eventos en vivo, 2026-10-28): las
// partidas, su resultado, Dígitos de π y las lecciones; también la primera vez y el
// acceso. Al salir de ahí, la app va al Inicio y recién entonces sale el video.
const SIN_INTERRUPCION = new Set([...PANTALLAS_DE_JUEGO, "resultado", "pi", "aprender", "bienvenida", "elegir-mundos", "login", "auth"]);

export function noInterrumpir(segmentos: readonly string[]): boolean {
  return segmentos.some((x) => SIN_INTERRUPCION.has(x));
}

// El Inicio: la pestaña principal.
export function enInicio(segmentos: readonly string[]): boolean {
  return segmentos[0] === "(tabs)" && (segmentos.length === 1 || segmentos[1] === "index");
}
