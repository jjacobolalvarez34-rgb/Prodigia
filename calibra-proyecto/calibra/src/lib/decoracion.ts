// «Decoración de temporada» (festividades, src/lib/temas): copos, hojas, lo que cruza
// el cielo, accesorios y bordes. Encendida por defecto; se apaga en Ajustes. Nunca
// cambia nada de lo que se juega.
const CLAVE = "prodigia-decoracion";

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeDecoracion(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function decoracionHabilitada(): boolean {
  try {
    return localStorage.getItem(CLAVE) !== "off";
  } catch {
    return true;
  }
}

export function decoracionHabilitadaServerSnapshot(): boolean {
  return true;
}

export function setDecoracionHabilitada(habilitada: boolean) {
  try {
    localStorage.setItem(CLAVE, habilitada ? "on" : "off");
  } catch {
    // sin localStorage vuelve a su default (encendida)
  }
  listeners.forEach((l) => l());
}
