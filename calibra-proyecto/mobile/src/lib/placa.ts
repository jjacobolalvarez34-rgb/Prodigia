// La Placa de jugador (02-SISTEMA-VISUAL.md §10): un solo contrato de datos para
// todas las variantes (Completa, VS, Tarjeta, Fila, Mini). Las constantes de
// cosméticos (rangos, marcos, fondos) salen del mismo código de la web.
import { FONDO_PERFIL_ESTILO, MARCOS_MUNDO, MARCOS_NEON, RANGOS_ELO, rangoDeElo, type FondoPerfil, type RangoElo } from "@/types/database";
import { ciudadDeMarcoColeccion, marcoTemporadaDe } from "@/lib/recompensas/catalogo";
import { urlAbsoluta } from "./entorno";
import { supabase } from "./supabase";

export { rangoDeElo, RANGOS_ELO, type RangoElo };

export interface PlacaDatos {
  id: string;
  nombre: string;
  avatarUrl: string | null;
  marco: string;
  fuente: string;
  animacion: string;
  colorNombre: string | null;
  fondo: string;
  fondoUrl: string | null;
  titulo: string | null;
  elo: number;
  nivel: number;
  chispas: number;
  clan?: { nombre: string; tag: string | null; color: string } | null;
  // Ciudad de la Placa (tienda ampliada, 0248): skyline detrás del avatar.
  ciudad?: string | null;
}

// Fuentes de nombre compradas en la tienda → familias empaquetadas en la app.
export const FUENTE_FAMILIA: Record<string, string | undefined> = {
  default: undefined,
  mono: "JetBrainsMono_700Bold",
  serif: "PlayfairDisplay_700Bold",
  manuscrita: "Caveat_700Bold",
  impacto: "BebasNeue_400Regular",
  script: "Pacifico_400Regular",
  futurista: "Orbitron_700Bold",
  urbana: "Anton_400Regular",
  elegante: "DancingScript_700Bold",
};

// Los degradés de fondo de la web (FONDO_PERFIL_ESTILO) como lista de colores.
export function coloresFondo(fondo: string): string[] | null {
  const css = FONDO_PERFIL_ESTILO[fondo as FondoPerfil];
  if (!css) return null;
  return css.match(/#[0-9a-fA-F]{6}/g) ?? null;
}

export function tieneFondo(fondo: string, url: string | null): boolean {
  if (!fondo || fondo === "ninguno") return false;
  if (fondo === "personalizado") return !!url;
  return !!coloresFondo(fondo);
}

// Marco: de rango (tiñe el aro y el borde de la Placa), neón (aro animado) o de
// mundo (anillo PNG/SVG de la web superpuesto al avatar).
export type InfoMarco =
  | { tipo: "ninguno"; color: string }
  | { tipo: "rango"; color: string }
  | { tipo: "neon"; color: string }
  | { tipo: "mundo"; color: string; imagen: string }
  // Tienda ampliada (0248): de temporada (aro con degradé que gira) y de colección
  // (el anillo del mundo con un resplandor de su color que late).
  | { tipo: "temporada"; color: string; colores: [string, string] }
  | { tipo: "coleccion"; color: string; imagen: string };

export function infoMarco(marco: string | null | undefined): InfoMarco {
  if (!marco || marco === "ninguno") return { tipo: "ninguno", color: "#7C5CFF" };
  const rango = RANGOS_ELO.find((r) => r.slug === marco);
  if (rango) return { tipo: "rango", color: rango.colorHex };
  const neon = MARCOS_NEON.find((m) => m.slug === marco);
  if (neon) return { tipo: "neon", color: neon.colorHex };
  const temporada = marcoTemporadaDe(marco);
  if (temporada) return { tipo: "temporada", color: temporada.colores[0], colores: temporada.colores };
  const coleccion = ciudadDeMarcoColeccion(marco);
  if (coleccion && MARCOS_MUNDO[coleccion.slug]) return { tipo: "coleccion", color: coleccion.color, imagen: urlAbsoluta(MARCOS_MUNDO[coleccion.slug].imagen) ?? "" };
  const mundo = MARCOS_MUNDO[marco];
  if (mundo) return { tipo: "mundo", color: "#FFB627", imagen: urlAbsoluta(mundo.imagen) ?? "" };
  return { tipo: "ninguno", color: "#7C5CFF" };
}

export function imagenRango(slug: string): string {
  return urlAbsoluta(`/rangos/${slug}.png`) ?? "";
}

// Divisiones dentro de cada rango (Oro III → Oro I), como en la maqueta de Competir:
// tres tramos iguales entre el mínimo del rango y el del siguiente.
export function divisionDeElo(elo: number): { nombre: string; proximo: string | null; siguiente: RangoElo | null; faltan: number; progreso: number } {
  const rango = rangoDeElo(elo);
  const i = RANGOS_ELO.findIndex((r) => r.slug === rango.slug);
  const siguiente = RANGOS_ELO[i + 1] ?? null;
  if (!siguiente) return { nombre: rango.nombre, proximo: null, siguiente: null, faltan: 0, progreso: 1 };
  const tramo = (siguiente.min - rango.min) / 3;
  const div = Math.min(2, Math.floor((elo - rango.min) / tramo));
  const romanos = ["III", "II", "I"];
  const techo = div === 2 ? siguiente.min : rango.min + tramo * (div + 1);
  return {
    nombre: `${rango.nombre} ${romanos[div]}`,
    proximo: div === 2 ? `${siguiente.nombre} III` : `${rango.nombre} ${romanos[div + 1]}`,
    siguiente,
    faltan: Math.max(0, Math.ceil(techo - elo)),
    progreso: (elo - rango.min) / (siguiente.min - rango.min),
  };
}

const COLUMNAS_PERFIL =
  "id, display_name, avatar_url, marco_perfil, fuente_nombre, animacion_nombre, color_nombre, fondo_perfil, fondo_perfil_url, titulo_activo, elo_rating, nivel_cuenta, puntos_total";

type FilaPerfil = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  marco_perfil: string | null;
  fuente_nombre: string | null;
  animacion_nombre: string | null;
  color_nombre: string | null;
  fondo_perfil: string | null;
  fondo_perfil_url: string | null;
  titulo_activo?: string | null;
  titulo_nombre?: string | null;
  elo_rating: number | null;
  nivel_cuenta: number | null;
  puntos_total: number | null;
};

export function placaDesdeFila(f: FilaPerfil, titulo: string | null = f.titulo_nombre ?? null): PlacaDatos {
  return {
    id: f.id,
    nombre: f.display_name ?? "Jugador",
    avatarUrl: f.avatar_url,
    marco: f.marco_perfil ?? "ninguno",
    fuente: f.fuente_nombre ?? "default",
    animacion: f.animacion_nombre ?? "ninguna",
    colorNombre: f.color_nombre,
    fondo: f.fondo_perfil ?? "ninguno",
    fondoUrl: f.fondo_perfil_url,
    titulo,
    elo: f.elo_rating ?? 1000,
    nivel: f.nivel_cuenta ?? 1,
    chispas: f.puntos_total ?? 0,
  };
}

export async function cargarMiPlaca(userId: string): Promise<PlacaDatos | null> {
  const [{ data }, { data: titulo }, { data: clan }, { data: ciudad }] = await Promise.all([
    supabase.from("profiles").select(COLUMNAS_PERFIL).eq("id", userId).single(),
    supabase.rpc("titulo_nombre_de", { p_user_id: userId }),
    supabase.rpc("mi_clan"),
    supabase.rpc("ciudad_placa_de", { p_user_id: userId }),
  ]);
  if (!data) return null;
  const placa = placaDesdeFila(data as FilaPerfil, (titulo as string | null) ?? null);
  const c = (clan as { nombre: string; tag: string | null; color_estandarte: string }[] | null)?.[0];
  placa.clan = c ? { nombre: c.nombre, tag: c.tag, color: c.color_estandarte } : null;
  placa.ciudad = (ciudad as string | null) ?? null;
  return placa;
}

export async function cargarPlacaPublica(userId: string): Promise<PlacaDatos | null> {
  const [{ data }, { data: clan }, { data: ciudad }] = await Promise.all([
    supabase.rpc("obtener_perfil_publico", { p_user_id: userId }),
    supabase.rpc("clan_de_usuario", { p_user_id: userId }),
    supabase.rpc("ciudad_placa_de", { p_user_id: userId }),
  ]);
  const fila = (data as FilaPerfil[] | null)?.[0];
  if (!fila) return null;
  const placa = placaDesdeFila(fila);
  placa.ciudad = (ciudad as string | null) ?? null;
  const c = (clan as { nombre: string; tag: string | null; color_estandarte: string }[] | null)?.[0];
  placa.clan = c ? { nombre: c.nombre, tag: c.tag, color: c.color_estandarte } : null;
  return placa;
}

// Placa mínima cuando solo se conoce el nombre (rankings, chats).
export function placaBasica(id: string, nombre: string | null, extra: Partial<PlacaDatos> = {}): PlacaDatos {
  return {
    id,
    nombre: nombre ?? "Jugador",
    avatarUrl: null,
    marco: "ninguno",
    fuente: "default",
    animacion: "ninguna",
    colorNombre: null,
    fondo: "ninguno",
    fondoUrl: null,
    titulo: null,
    elo: 1000,
    nivel: 1,
    chispas: 0,
    ...extra,
  };
}
