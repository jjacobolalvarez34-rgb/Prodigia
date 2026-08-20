import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

// Guards en capas (Fase V/W): Prodigia (la cuenta) es la capa de afuera,
// cada mundo (Numeria, Enigmia...) tiene su propio diagnóstico adentro.
// - requireUsuario: solo sesión + nombre puesto. Para páginas de cuenta
//   (home "/", ranking, feed, tienda, perfil, profesor) que no son de
//   ningún mundo en particular y no deben forzar el diagnóstico de uno.
// - requireMundoNumeria / requireMundoEnigmia: además exigen que ESE
//   mundo específico ya tenga su diagnóstico hecho (o salteado).
export async function requireUsuario(supabase: SupabaseClient, pathActual: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(pathActual)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.display_name) {
    redirect(`/onboarding?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile: profile as Profile };
}

export async function requireMundoNumeria(supabase: SupabaseClient, pathActual: string) {
  const { user, profile } = await requireUsuario(supabase, pathActual);

  if (!profile.onboarding_completado) {
    redirect(`/onboarding/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

export async function requireMundoEnigmia(supabase: SupabaseClient, pathActual: string) {
  const { user, profile } = await requireUsuario(supabase, pathActual);

  if (!profile.onboarding_enigmia_completado) {
    redirect(`/enigmia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

export async function requireMundoQuimia(supabase: SupabaseClient, pathActual: string) {
  const { user, profile } = await requireUsuario(supabase, pathActual);

  if (!profile.onboarding_quimia_completado) {
    redirect(`/quimia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Alias por compatibilidad: /practica y /aprender son de Numeria, así
// que el guard viejo (usado en casi todo el árbol de ese mundo) ahora
// es exactamente requireMundoNumeria.
export const requireUsuarioOnboarded = requireMundoNumeria;

// Un invitado (supabase.auth.signInAnonymously, ver /login) puede ver
// el ranking y practicar en la matriz reducida de accesoInvitado.ts,
// pero no tiene cuenta real todavía — nada de Aprender (progreso
// curricular), Rankeds (competitivo con ELO), Feed ni Social/Amigos/
// Grupos (todo lo que asume una identidad persistente y visible para
// otros), ni temas/continentes/categorías fuera de lo permitido. Se
// llama DESPUÉS de requireUsuario/requireMundo*, para no interferir con
// el onboarding (nombre + diagnóstico), que un invitado también hace
// normalmente. `etiqueta` es el nombre legible de lo que se bloqueó
// ("Aprender", "Fracciones", "Europa"...) — se muestra tal cual en la
// pantalla corta de /invitado-bloqueado, así que no hace falta mantener
// un mapa de traducción aparte por cada sección nueva que se agregue.
// Defensa en profundidad a nivel de página — la línea PRINCIPAL de
// defensa real es middleware.ts (corta el pedido antes de renderizar
// nada; ver rutasInvitado.ts, la lista centralizada que usan los dos).
// Esta función se deja para las pantallas que ya la llamaban, pero
// ninguna sección nueva debería depender solo de esto.
export function bloquearInvitado(user: { is_anonymous?: boolean }, etiqueta: string) {
  if (user.is_anonymous) {
    redirect(`/invitado-bloqueado?seccion=${encodeURIComponent(etiqueta)}`);
  }
}
