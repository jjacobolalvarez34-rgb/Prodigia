import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";

// Controles por edad (PROD-02, migración 0245) y bloqueo de jugadores.
// La edad se pregunta una vez (mes y año) y queda fija. Menores de 13: en los
// mensajes y el chat del clan solo frases rápidas, y no ven los mensajes de texto
// libre de los demás. La base hace cumplir todo esto (enviar_mensaje_directo,
// enviar_mensaje_clan, mensajes_de_clan); la app solo muestra la interfaz que
// corresponde.

// Misma lista que es_frase_rapida() en la base: un cambio acá va también allá.
export const FRASES_RAPIDAS = [
  "¡Hola!",
  "¡Buena partida!",
  "¡Bien hecho!",
  "¡Gracias!",
  "¿Jugamos un duelo?",
  "¡Vamos, equipo!",
  "¡Lo logramos!",
  "¡Casi!",
  "¡Sigamos!",
  "¡Nos vemos!",
  "👍",
  "🔥",
  "🎉",
  "😂",
  "💪",
  "👏",
];

export function esFraseRapida(texto: string): boolean {
  return FRASES_RAPIDAS.includes(texto.trim());
}

export const TEXTO_OCULTO = "Mensaje oculto";

// null: todavía no se sabe (cargando o sin conexión).
export interface EstadoEdad {
  tieneFecha: boolean;
  esMenor: boolean;
}

let estado: EstadoEdad | null = null;
const oyentes = new Set<() => void>();

function emitir() {
  oyentes.forEach((o) => o());
}

export async function cargarEstadoEdad(): Promise<EstadoEdad | null> {
  const { data, error } = await supabase.rpc("mi_estado_edad");
  if (error) return estado;
  const f = (data as { tiene_fecha: boolean; es_menor: boolean }[] | null)?.[0];
  estado = f ? { tieneFecha: f.tiene_fecha, esMenor: f.es_menor } : null;
  emitir();
  return estado;
}

export function limpiarEstadoEdad() {
  estado = null;
  emitir();
}

export async function registrarFechaNacimiento(anio: number, mes: number): Promise<boolean> {
  const fecha = `${anio}-${String(mes).padStart(2, "0")}-01`;
  const { data, error } = await supabase.rpc("registrar_fecha_nacimiento", { p_fecha: fecha });
  if (error) {
    if (error.message.includes("ya registraste")) throw new Error("Ya registraste tu fecha de nacimiento.");
    if (error.message.includes("inválida")) throw new Error("Esa fecha no es válida.");
    throw error;
  }
  estado = { tieneFecha: true, esMenor: !!data };
  emitir();
  return !!data;
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => oyentes.delete(o);
}

export function useEdad(): EstadoEdad | null {
  return useSyncExternalStore(suscribir, () => estado);
}

// ---------- Bloqueos ----------

export async function bloquearJugador(id: string) {
  const { error } = await supabase.rpc("bloquear_usuario", { p_user: id });
  if (error) throw error;
}

export async function desbloquearJugador(id: string) {
  const { error } = await supabase.rpc("desbloquear_usuario", { p_user: id });
  if (error) throw error;
}

export async function estaBloqueado(miId: string, id: string): Promise<boolean> {
  const { data } = await supabase.from("bloqueos_usuario").select("bloqueado_id").eq("bloqueador_id", miId).eq("bloqueado_id", id).maybeSingle();
  return !!data;
}

export interface Bloqueado {
  id: string;
  nombre: string | null;
  avatarUrl: string | null;
}

export async function misBloqueados(): Promise<Bloqueado[]> {
  const { data } = await supabase.rpc("mis_bloqueados");
  return ((data as { id: string; nombre: string | null; avatar_url: string | null }[] | null) ?? []).map((b) => ({ id: b.id, nombre: b.nombre, avatarUrl: b.avatar_url }));
}

// Mensajes de error de la base, en palabras de la app.
export function errorDeChat(e: unknown): string | null {
  const m = (e as { message?: string })?.message ?? "";
  if (m.includes("frases rápidas")) return "Aquí solo se pueden mandar frases rápidas.";
  if (m.includes("este jugador")) return "No puedes mandarle mensajes a este jugador.";
  return null;
}
