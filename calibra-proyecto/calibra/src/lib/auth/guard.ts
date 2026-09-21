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

// `enDuelo` (agregado cuando Rankeds pasó a permitir "Todas las
// ciudades" sin importar qué mundos compraste — pedido explícito del
// usuario 2026-09-18): un duelo real (ranked O casual, viene de
// matchmaking, de un reto a un amigo, o de una invitación) nunca debe
// poder trabarte a mitad de partida contra una pantalla de "comprá
// este mundo" o "hacé el diagnóstico primero" — eso rompería la serie
// (mejor de 3) o dejaría a tu rival esperando sin salida. Con
// enDuelo=true se saltea el chequeo de compra Y el de diagnóstico
// completo; sin él (el 99% de los casos, práctica normal) el
// comportamiento es exactamente el de siempre. El nivel de dificultad
// de un duelo nunca depende de skill_levels/onboarding de todos modos
// (viene resuelto server-side en el propio duelo, ver
// nivel_<mundo>_por_rango en buscar_rival_duelo), así que saltear el
// diagnóstico no deja ningún hueco de "qué nivel le doy".
export async function requireMundoNumeria(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
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

export async function requireMundoEnigmia(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
  requireMundoComprado(profile, "enigmia", pathActual);

  if (!profile.onboarding_enigmia_completado) {
    redirect(`/enigmia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

export async function requireMundoQuimia(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
  requireMundoComprado(profile, "quimia", pathActual);

  if (!profile.onboarding_quimia_completado) {
    redirect(`/quimia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Fase 5 ("Anatomía"): mismo patrón que los demás mundos — diagnóstico
// inicial propio antes de dejar entrar a practicar/aprender.
export async function requireMundoAnatomia(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
  requireMundoComprado(profile, "anatomia", pathActual);

  if (!profile.onboarding_anatomia_completado) {
    redirect(`/anatomia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Mundo Melodía (Fase 1, 2026-08-24): mismo patrón que Quimia/Anatomía.
export async function requireMundoMelodia(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
  requireMundoComprado(profile, "melodia", pathActual);

  if (!profile.onboarding_melodia_completado) {
    redirect(`/melodia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Mundo Trigonometría: mismo patrón que Quimia/Anatomía/Melodía.
export async function requireMundoTrigonometria(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
  requireMundoComprado(profile, "trigonometria", pathActual);

  if (!profile.onboarding_trigonometria_completado) {
    redirect(`/trigonometria/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Mundo Historia: mismo patrón que Trigonometría/Quimia/Anatomía/Melodía.
export async function requireMundoHistoria(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
  requireMundoComprado(profile, "historia", pathActual);

  if (!profile.onboarding_historia_completado) {
    redirect(`/historia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Mundo Calculia: mismo patrón que Trigonometría/Historia/Quimia/
// Anatomía/Melodía.
export async function requireMundoCalculia(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
  requireMundoComprado(profile, "calculia", pathActual);

  if (!profile.onboarding_calculia_completado) {
    redirect(`/calculia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Mundo Circuitia: mismo patrón que Calculia/Trigonometría/Historia/
// Quimia/Anatomía/Melodía.
export async function requireMundoCircuitia(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
  requireMundoComprado(profile, "circuitia", pathActual);

  if (!profile.onboarding_circuitia_completado) {
    redirect(`/circuitia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Mundos 11-13 (Estadística, Naipia, Codia): mismo patrón que Calculia/
// Circuitia. Las páginas /<mundo>/diagnostico las crea la Fase 1 de cada
// mundo; el redirect apunta a ellas.
export async function requireMundoEstadistica(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
  requireMundoComprado(profile, "estadistica", pathActual);

  if (!profile.onboarding_estadistica_completado) {
    redirect(`/estadistica/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

export async function requireMundoNaipia(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
  requireMundoComprado(profile, "naipia", pathActual);

  if (!profile.onboarding_naipia_completado) {
    redirect(`/naipia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

export async function requireMundoCodia(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
  requireMundoComprado(profile, "codia", pathActual);

  if (!profile.onboarding_codia_completado) {
    redirect(`/codia/diagnostico?next=${encodeURIComponent(pathActual)}`);
  }

  return { user, profile };
}

// Geografía nunca tuvo diagnóstico propio (arranca directo) — con Fase
// 12 pasa a necesitar este guard nuevo en vez de requireUsuario a
// secas, solo para el chequeo de compra.
export async function requireMundoGeografia(supabase: SupabaseClient, pathActual: string, enDuelo = false) {
  const { user, profile } = await requireUsuario(supabase, pathActual);
  if (enDuelo) return { user, profile };
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
// primero "¿eres cuenta real?", después "¿tu cuenta ya es lo bastante
// veterana?".
export const NIVEL_CUENTA_MINIMO_RANKEDS = 5;

export function requireNivelCuentaRankeds(profile: Profile) {
  if ((profile.nivel_cuenta ?? 1) < NIVEL_CUENTA_MINIMO_RANKEDS) {
    redirect(`/rankeds-bloqueado?nivel=${profile.nivel_cuenta ?? 1}`);
  }
}

// Fase 4 (infraestructura de pagos): profiles.plan (0145/0146) recién
// empieza a aplicarse en código real — esta es la primera pantalla
// gateada. Redirige a /pro (la propia página de venta) en vez de un
// "bloqueado" genérico, para que quien tropieza acá vea justo la
// oferta que le falta.
export function requirePro(profile: Profile, pathActual: string) {
  if (profile.plan !== "pro") {
    redirect(`/pro?next=${encodeURIComponent(pathActual)}`);
  }
}
