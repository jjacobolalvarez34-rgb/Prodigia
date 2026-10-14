// Recuperar la contraseña con preguntas (pedido 2026-10-14, sin proveedor de correo):
// 1) ¿Entraste con Google?  2) ¿Cuáles fueron tus dos primeros mundos?
// 3) ¿Cuál es tu correo? (entre varias opciones). Si aciertas las tres, cambias la
// contraseña. 3 intentos fallidos bloquean la recuperación y hay que escribirnos.
// Lógica pura (sin red); la usan las rutas /api/recuperar/* y la pantalla /recuperar.
//
// Privacidad (endurecido tras la revisión del 2026-10-14): el correo nunca se muestra
// entero, y las 4 opciones tienen las MISMAS dos primeras letras; solo cambia el
// dominio, así la verdadera no se distingue a simple vista. Las opciones dependen solo
// del nombre de usuario (recargar no las cambia) y un usuario que no existe recibe
// opciones con el mismo formato.

export const MAX_INTENTOS_RECUPERACION = 3;
export const MAX_INTENTOS_POR_HORA_IP = 20;
export const CORREO_SOPORTE = "prodigia.oficial@gmail.com";

const DOMINIOS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "live.com"];

export function enmascararCorreo(correo: string): string {
  const [usuario, dominio] = correo.trim().toLowerCase().split("@");
  if (!usuario || !dominio) return "•••";
  return `${usuario.slice(0, 2)}•••@${dominio}`;
}

// Generador con semilla (mismo nombre → mismas opciones).
function azarDe(semilla: string) {
  let h = 2166136261;
  for (const c of semilla.toLowerCase()) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// 4 opciones enmascaradas con las mismas iniciales: la verdadera (si hay correo) y
// 3 con otros dominios comunes, mezcladas.
export function opcionesDeCorreo(usuario: string, correoReal: string | null): string[] {
  const azar = azarDe(`recuperar:${usuario}`);
  const [inicioReal, dominioReal] = correoReal ? correoReal.trim().toLowerCase().split("@") : [null, null];
  const letras = (inicioReal ?? usuario.toLowerCase().replace(/[^a-z0-9]/g, "")).slice(0, 2).padEnd(2, "x");
  const dominios = DOMINIOS.filter((d) => d !== dominioReal);
  for (let i = dominios.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [dominios[i], dominios[j]] = [dominios[j], dominios[i]];
  }
  const elegidos = dominioReal ? [dominioReal, ...dominios.slice(0, 3)] : dominios.slice(0, 4);
  const lista = elegidos.map((d) => `${letras}•••@${d}`);
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

// Los dos primeros mundos, sin importar el orden. Una cuenta vieja con menos de dos
// mundos acierta si elige los que tiene (más cualquiera para completar dos).
export function mundosCoinciden(elegidos: readonly string[], primeros: readonly string[]): boolean {
  if (elegidos.length !== 2) return false;
  const reales = primeros.slice(0, 2);
  if (reales.length < 2) return reales.every((m) => elegidos.includes(m));
  return [...elegidos].sort().join("|") === [...reales].sort().join("|");
}
