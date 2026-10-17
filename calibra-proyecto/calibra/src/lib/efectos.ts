const CLAVE = "prodigia-efectos";

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((l) => l());
}

export function subscribeEfectos(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Fase P2: toggle global de efectos decorativos (fondos flotantes,
// partículas, el gesto del logo) — apagarlo NO afecta la funcionalidad,
// solo el adorno. Independiente de prefers-reduced-motion (que también
// se respeta en cada animación por separado) porque acá es una
// preferencia explícita del usuario, no del sistema operativo.
// Lo que elegiste en Ajustes manda; si nunca lo tocaste, se sigue al sistema
// («reducir movimiento»). Antes el sistema ganaba siempre y en una PC con Windows en
// «mejor rendimiento» los efectos no se podían prender (2026-10-16).
export function efectosHabilitados(): boolean {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === "on") return true;
    if (guardado === "off") return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return true;
  }
}

export function efectosHabilitadosServerSnapshot(): boolean {
  return true;
}

export function setEfectosHabilitados(habilitado: boolean) {
  try {
    localStorage.setItem(CLAVE, habilitado ? "on" : "off");
  } catch {
    // si localStorage falla, los efectos vuelven a su default (on)
  }
  emitChange();
}
