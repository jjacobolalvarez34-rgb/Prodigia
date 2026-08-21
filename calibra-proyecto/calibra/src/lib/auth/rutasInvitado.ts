// Lista única de qué secciones están bloqueadas para invitados
// (supabase.auth.signInAnonymously) — sin imports de Next.js a propósito,
// para que sea seguro usarla tanto desde middleware.ts (runtime Edge)
// como desde src/lib/auth/guard.ts (Server Components). Agregar una
// sección nueva que deba bloquearse: sumarla acá, nada más — tanto el
// middleware (primera línea de defensa, corta el pedido antes de
// renderizar nada) como el guard de cada página (defensa en profundidad)
// leen de esta misma lista.
export const RUTAS_BLOQUEADAS_INVITADO: { prefijo: string; etiqueta: string }[] = [
  { prefijo: "/geografia/aprender", etiqueta: "Aprender" },
  { prefijo: "/enigmia/aprender", etiqueta: "Aprender" },
  { prefijo: "/aprender", etiqueta: "Aprender" },
  { prefijo: "/rankeds", etiqueta: "Rankeds" },
  { prefijo: "/social", etiqueta: "Social (Feed y Amigos)" },
  { prefijo: "/profesor", etiqueta: "Grupos" },
  { prefijo: "/duelo/invitacion", etiqueta: "Amigos" },
  { prefijo: "/clanes", etiqueta: "Clanes" },
];

export function rutaBloqueadaParaInvitado(pathname: string): string | null {
  for (const { prefijo, etiqueta } of RUTAS_BLOQUEADAS_INVITADO) {
    if (pathname === prefijo || pathname.startsWith(prefijo + "/")) return etiqueta;
  }
  return null;
}
