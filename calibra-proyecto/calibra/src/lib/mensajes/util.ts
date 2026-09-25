// Utilidades puras de los avisos de mensajes y de las respuestas (sin React ni
// Supabase, para poder probarlas). Los avisos viajan por Broadcast, igual que
// el resto del tiempo real del proyecto (ChatDeClan, MensajeDirectoClient):
// quien manda, una vez que el servidor aceptó el mensaje, retransmite un aviso
// chico a la persona (o al clan) para que lo vea aunque no tenga el chat abierto.

export const LARGO_CITA = 140;
export const LARGO_VISTA_PREVIA = 90;

// Canal personal de avisos de mensajes directos, uno por persona.
export function canalAvisosDirectos(userId: string): string {
  return `avisos-dm:${userId}`;
}

// Canal de avisos del chat de un clan, compartido por sus miembros.
export function canalAvisosClan(clanId: string): string {
  return `avisos-clan:${clanId}`;
}

export interface AvisoDirecto {
  mensajeId: string;
  deId: string;
  deNombre: string | null;
  deAvatarUrl: string | null;
  texto: string;
}

export interface AvisoClan {
  mensajeId: string;
  autorId: string;
  autorNombre: string | null;
  texto: string;
}

// Recorta un texto para una vista previa sin cortar a mitad de un par
// sustituto (emoji) ni dejar espacios sobrando; agrega "…" solo si recortó.
export function recortar(texto: string, max = LARGO_VISTA_PREVIA): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  const simbolos = Array.from(limpio);
  if (simbolos.length <= max) return limpio;
  return simbolos.slice(0, max).join("").trimEnd() + "…";
}

// ¿La persona ya está mirando esa conversación? (pathname sin prefijo de idioma,
// como lo entrega usePathname de next-intl).
export function conversacionAbierta(pathname: string | null | undefined, amigoId: string): boolean {
  if (!pathname) return false;
  return pathname === `/social/mensajes/${amigoId}` || pathname.startsWith(`/social/mensajes/${amigoId}/`);
}

// El chat de clan vive en /clanes (la página del clan), no en /clanes/mundo.
export function chatDeClanVisible(pathname: string | null | undefined): boolean {
  return pathname === "/clanes";
}

export interface CitaMensaje {
  id: string;
  autorId: string | null;
  texto: string;
}

// Arma la cita ("respondiendo a…") de un mensaje ya cargado, con el mismo
// recorte que aplica el servidor.
export function citaDe(id: string, autorId: string | null, texto: string): CitaMensaje {
  return { id, autorId, texto: Array.from(texto).slice(0, LARGO_CITA).join("") };
}

// Total para la insignia: nunca más de 99+.
export function textoInsignia(n: number): string {
  return n > 99 ? "99+" : String(n);
}
