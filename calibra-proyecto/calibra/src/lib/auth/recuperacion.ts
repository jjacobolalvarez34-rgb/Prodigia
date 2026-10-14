// Recuperar la contraseña con preguntas (pedido 2026-10-14, sin proveedor de correo):
// 1) ¿Entraste con Google?  2) ¿Cuáles fueron tus dos primeros mundos?
// 3) ¿Cuál es tu correo? (entre varias opciones). Si aciertas las tres, cambias la
// contraseña. 3 intentos fallidos bloquean la recuperación y hay que escribirnos.
// Lógica pura (sin red); la usan las rutas /api/recuperar/* y la pantalla /recuperar.
//
// Cuidado de privacidad: el correo nunca se muestra entero, solo enmascarado
// ("ja•••@gmail.com"), y las opciones dependen solo del nombre de usuario: recargar
// no cambia las opciones falsas (si cambiaran, la verdadera sería la única fija).
// Para un usuario que no existe se arman 4 opciones falsas con el mismo formato, así
// desde afuera no se puede saber si un nombre existe.

export const MAX_INTENTOS_RECUPERACION = 3;
export const CORREO_SOPORTE = "prodigia.oficial@gmail.com";

const DOMINIOS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"];
const LETRAS = "abcdefghijklmnopqrstuvwxyz";

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

// 4 opciones enmascaradas: la verdadera (si hay correo) y falsas creíbles, mezcladas.
export function opcionesDeCorreo(usuario: string, correoReal: string | null): string[] {
  const azar = azarDe(`recuperar:${usuario}`);
  const verdadera = correoReal ? enmascararCorreo(correoReal) : null;
  const opciones = new Set<string>(verdadera ? [verdadera] : []);
  while (opciones.size < 4) {
    const a = LETRAS[Math.floor(azar() * 26)];
    const b = LETRAS[Math.floor(azar() * 26)];
    opciones.add(`${a}${b}•••@${DOMINIOS[Math.floor(azar() * DOMINIOS.length)]}`);
  }
  const lista = [...opciones];
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

// Los dos primeros mundos, sin importar el orden.
export function mundosCoinciden(elegidos: readonly string[], primeros: readonly string[]): boolean {
  if (elegidos.length !== 2 || primeros.length < 2) return false;
  const a = [...elegidos].sort().join("|");
  const b = [...primeros.slice(0, 2)].sort().join("|");
  return a === b;
}
