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

// Alias por compatibilidad: /practica y /aprender son de Numeria, así
// que el guard viejo (usado en casi todo el árbol de ese mundo) ahora
// es exactamente requireMundoNumeria.
export const requireUsuarioOnboarded = requireMundoNumeria;
