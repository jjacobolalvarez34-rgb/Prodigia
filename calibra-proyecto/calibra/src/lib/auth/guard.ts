import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { type MundoPago } from "@/lib/mundos/precios";

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

  // Fase 12 (ajuste) + 0116: el onboarding exige DOS mundos gratis, no
  // uno. Cuentas con menos de 2 mundos vuelven a /onboarding — incluida
  // la deuda heredada de la fase vieja de 1 mundo gratis (quedaban con
  // exactamente ['numeria'] sin forma de repararlo por la UI). Con 2+
  // mundos ya pasó por el flujo y no se le vuelve a pedir.
  if (!profile?.mundos_desbloqueados || profile.mundos_desbloqueados.length < 2) {
    redirect(`/onboarding?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile: profile as Profile };
}

export async function requireMundoNumeria(supabase: SupabaseClient, pathActual: string) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  requireMundoComprado(profile, "numeria", pathActual);

  if (!profile.onboarding_completado) {
    redirect(`/onboarding/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Fase 12 ("Mundos por Chispas"): se chequea ANTES que el diagnóstico
// propio de cada mundo — si no lo compró, ni siquiera debe llegar a
// /X/diagnostico (que solo exige requireUsuario, porque es lo que
// resuelve ese chequeo puntual — si el de compra fuera después, se
// podría completar el diagnóstico de un mundo no comprado tipeando la
// URL directo). redirige a /mundo-bloqueado, que muestra el precio y
// deja comprarlo ahí mismo.
function requireMundoComprado(profile: Profile, mundo: MundoPago, pathActual: string) {
  if (!profile.mundos_desbloqueados?.includes(mundo)) {
    redirect(`/mundo-bloqueado?mundo=${mundo}&next=${encodeURIComponent(pathActual)}`);
  }
}

export async function requireMundoEnigmia(supabase: SupabaseClient, pathActual: string) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  requireMundoComprado(profile, "enigmia", pathActual);

  if (!profile.onboarding_enigmia_completado) {
    redirect(`/enigmia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

export async function requireMundoQuimia(supabase: SupabaseClient, pathActual: string) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  requireMundoComprado(profile, "quimia", pathActual);

  if (!profile.onboarding_quimia_completado) {
    redirect(`/quimia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Fase 5 ("Anatomía"): mismo patrón que los demás mundos — diagnóstico
// inicial propio antes de dejar entrar a practicar/aprender.
export async function requireMundoAnatomia(supabase: SupabaseClient, pathActual: string) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  requireMundoComprado(profile, "anatomia", pathActual);

  if (!profile.onboarding_anatomia_completado) {
    redirect(`/anatomia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Mundo Melodía (Fase 1, 2026-08-24): mismo patrón que Quimia/Anatomía.
export async function requireMundoMelodia(supabase: SupabaseClient, pathActual: string) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  requireMundoComprado(profile, "melodia", pathActual);

  if (!profile.onboarding_melodia_completado) {
    redirect(`/melodia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Mundo Trigonometría: mismo patrón que Quimia/Anatomía/Melodía.
export async function requireMundoTrigonometria(supabase: SupabaseClient, pathActual: string) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  requireMundoComprado(profile, "trigonometria", pathActual);

  if (!profile.onboarding_trigonometria_completado) {
    redirect(`/trigonometria/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Mundo Historia: mismo patrón que Trigonometría/Quimia/Anatomía/Melodía.
export async function requireMundoHistoria(supabase: SupabaseClient, pathActual: string) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  requireMundoComprado(profile, "historia", pathActual);

  if (!profile.onboarding_historia_completado) {
    redirect(`/historia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Geografía nunca tuvo diagnóstico propio (arranca directo) — con Fase
// 12 pasa a necesitar este guard nuevo en vez de requireUsuario a
// secas, solo para el chequeo de compra.
export async function requireMundoGeografia(supabase: SupabaseClient, pathActual: string) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  requireMundoComprado(profile, "geografia", pathActual);

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
// defensa real es src/proxy.ts (corta el pedido antes de renderizar
// nada; ver rutasInvitado.ts, la lista centralizada que usan los dos).
// Esta función se deja para las pantallas que ya la llamaban, pero
// ninguna sección nueva debería depender solo de esto.
export function bloquearInvitado(user: { is_anonymous?: boolean }, etiqueta: string) {
  if (user.is_anonymous) {
    redirect(`/invitado-bloqueado?seccion=${encodeURIComponent(etiqueta)}`);
  }
}

// Fase 13 ("Nivel 5 de cuenta desbloquea Rankeds"): nivel_cuenta es el
// nivel GENERAL de la cuenta (XP histórico total, ver 0054-ish "Fase 4
// (nivel de cuenta)" y xp_requerido_nivel_cuenta) — nada que ver con el
// nivel de un mundo puntual (skill_levels.nivel / world_progress). Se
// llama después de bloquearInvitado, mismo orden que ese otro gate:
// primero "¿sos cuenta real?", después "¿tu cuenta ya es lo bastante
// veterana?".
export const NIVEL_CUENTA_MINIMO_RANKEDS = 5;

export function requireNivelCuentaRankeds(profile: Profile) {
  if ((profile.nivel_cuenta ?? 1) < NIVEL_CUENTA_MINIMO_RANKEDS) {
    redirect(`/rankeds-bloqueado?nivel=${profile.nivel_cuenta ?? 1}`);
  }
}
