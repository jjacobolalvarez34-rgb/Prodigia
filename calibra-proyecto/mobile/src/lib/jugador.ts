import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { actualizarContextoAvisos, limpiarContextoAvisos } from "./notificaciones";
import { cargarMiPlaca, type PlacaDatos } from "./placa";
import { recargarCosmeticos, recargarPendientes } from "./recompensas";
import { cargarResumen, type Resumen } from "./resumen";
import { supabase } from "./supabase";
import { actualizarWidgets } from "~/widgets/registro";

// Estado del jugador que comparten el HUD y todas las pestañas: la Placa (avatar,
// marco, rango), la racha, las Chispas y los avisos sin leer. Se refresca al volver
// a una pantalla y después de cada partida o compra.
export interface EstadoJugador {
  placa: PlacaDatos | null;
  resumen: Resumen | null;
  plan: string;
  mundos: string[];
  esInvitado: boolean;
  // Tu Pro terminó y todavía no viste el aviso (0276).
  proTermino?: boolean;
}

let estado: EstadoJugador = { placa: null, resumen: null, plan: "free", mundos: [], esInvitado: false };
const oyentes = new Set<() => void>();
let enCurso: Promise<void> | null = null;

function emitir() {
  oyentes.forEach((o) => o());
}

export function leerJugador() {
  return estado;
}

// Al abrir la app: lo último que se supo del jugador (sirve para jugar sin conexión).
export async function cargarJugadorGuardado(userId: string): Promise<void> {
  try {
    const crudo = await AsyncStorage.getItem(`prodigia:copia:jugador:${userId}`);
    if (crudo && !estado.placa) {
      estado = JSON.parse(crudo) as EstadoJugador;
      emitir();
    }
  } catch {
    // Sin copia: se espera la carga normal.
  }
}

export async function recargarJugador(): Promise<void> {
  if (enCurso) return enCurso;
  enCurso = (async () => {
    const { data: sesion } = await supabase.auth.getSession();
    const user = sesion.session?.user;
    if (!user) {
      estado = { placa: null, resumen: null, plan: "free", mundos: [], esInvitado: false };
      emitir();
      return;
    }
    // revisar_mi_pro (0276) apaga Pro si ya venció y dice si falta mostrar el aviso;
    // va primero para que el plan que se lee después ya esté al día.
    const { data: pro } = user.is_anonymous ? { data: null } : await supabase.rpc("revisar_mi_pro");
    const revisado = ((pro as { plan: string; aviso: boolean }[] | null) ?? [])[0];
    const [resumen, placa, { data: perfil }] = await Promise.all([
      cargarResumen(),
      cargarMiPlaca(user.id),
      supabase.from("profiles").select("plan, mundos_desbloqueados").eq("id", user.id).single(),
    ]);
    const p = perfil as { plan: string; mundos_desbloqueados: string[] } | null;
    estado = {
      placa: placa ?? estado.placa,
      resumen: resumen ?? estado.resumen,
      // Sin conexión no llega el perfil: se conserva lo último (o la copia guardada).
      plan: p?.plan ?? estado.plan,
      mundos: p?.mundos_desbloqueados ?? estado.mundos,
      esInvitado: !!user.is_anonymous,
      proTermino: revisado?.aviso ?? false,
    };
    emitir();
    if (p) AsyncStorage.setItem(`prodigia:copia:jugador:${user.id}`, JSON.stringify(estado)).catch(() => undefined);
    actualizarWidgets(estado.resumen);
    // Avisos locales personalizados (notificaciones.ts): se rearman con la racha, si
    // ya jugaste hoy, tu clan y lo que tengas por reclamar.
    const r = estado.resumen;
    actualizarContextoAvisos({
      nombre: r?.nombre ?? estado.placa?.nombre ?? null,
      racha: r?.racha ?? 0,
      jugoHoy: !!r && r.metaDiaria > 0 && r.xpHoy >= r.metaDiaria,
      esInvitado: !!user.is_anonymous,
      clan: estado.placa?.clan?.nombre ?? null,
      mundos: estado.mundos,
    });
    if (!user.is_anonymous) {
      recargarCosmeticos(user.id);
      recargarPendientes()
        .then((p) => actualizarContextoAvisos({ capsulas: p.capsulas, regalos: p.regalos, misiones: p.misiones, calendario: p.calendario }))
        .catch(() => undefined);
    }
  })().finally(() => {
    enCurso = null;
  });
  return enCurso;
}

// Cambio inmediato de Chispas (compra, recompensa) mientras llega la recarga real.
export function fijarChispas(total: number) {
  if (estado.resumen) estado = { ...estado, resumen: { ...estado.resumen, chispas: total } };
  if (estado.placa) estado = { ...estado, placa: { ...estado.placa, chispas: total } };
  emitir();
}

// Saldo de Cometas después de canjear o comprar (0279).
export function fijarCometas(total: number) {
  if (estado.resumen) estado = { ...estado, resumen: { ...estado.resumen, cometas: total } };
  emitir();
}

// El aviso de «tu Pro terminó» ya se vio (o se tocó «Renovar»).
export async function cerrarAvisoProTermino() {
  estado = { ...estado, proTermino: false };
  emitir();
  await supabase.rpc("marcar_aviso_pro_visto");
}

export function limpiarJugador() {
  estado = { placa: null, resumen: null, plan: "free", mundos: [], esInvitado: false };
  limpiarContextoAvisos();
  emitir();
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => oyentes.delete(o);
}

export function useJugador(): EstadoJugador {
  return useSyncExternalStore(suscribir, leerJugador, leerJugador);
}
