import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";

// Práctica sin conexión (roadmap 4.4). Los generadores de problemas viven en el
// teléfono, así que sin internet se puede jugar igual: lo que no se puede es
// guardar. Cada intento que no llega a la base se guarda acá (AsyncStorage) con un
// client_id propio y se sube al volver la conexión con insertar_intento_sincronizado
// (0245), que no lo duplica aunque la respuesta se pierda y se reintente. El XP se
// calcula en la base igual que en línea y cuenta para el día en que se sube.
// Duelos, tienda y lo social siguen necesitando conexión.

type Pendiente =
  | { id: string; tipo: "intento"; problemType: string; nivel: number; correcto: boolean; timeMs: number; protegido: boolean; calibrar: boolean }
  | { id: string; tipo: "logica"; puzzleId: string; dificultad: number; correcto: boolean; timeMs: number; categoria: string; protegido: boolean }
  // Una partida cerrada sin conexión: al subirla se registra el XP del día y el
  // nivel de mundo (las dos funciones ya suman el XP real, son idempotentes).
  | { id: string; tipo: "partida"; mundo: string }
  // Una lección de Aprender completada sin conexión (el quiz ya se validó en el
  // teléfono con las respuestas de la lección; la base lo vuelve a validar al subir).
  | { id: string; tipo: "leccion"; tabla: string; leccionId: string; respuestas: string[] | null };

type NuevoPendiente = Pendiente extends infer P ? (P extends Pendiente ? Omit<P, "id"> : never) : never;

const CLAVE = "prodigia:pendientes";

let cola: Pendiente[] = [];
let cargada = false;
let sinRed = false;
let sincronizando: Promise<void> | null = null;
const oyentes = new Set<() => void>();
let instantanea = { pendientes: 0, sinRed: false };

function emitir() {
  instantanea = { pendientes: cola.length, sinRed };
  oyentes.forEach((o) => o());
}

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Un fallo de red (sin internet, timeout) y no un error de la base.
export function esErrorDeRed(e: unknown): boolean {
  if (!e) return false;
  const err = e as { message?: string; code?: string; name?: string };
  const msg = `${err.name ?? ""} ${err.message ?? ""}`;
  return !err.code && /network|fetch|timeout|timed out|abort|connection/i.test(msg);
}

export function marcarSinRed(valor: boolean) {
  if (sinRed === valor) return;
  sinRed = valor;
  emitir();
}

async function cargar() {
  if (cargada) return;
  cargada = true;
  try {
    const crudo = await AsyncStorage.getItem(CLAVE);
    const guardada = crudo ? (JSON.parse(crudo) as Pendiente[]) : [];
    cola = [...guardada, ...cola];
  } catch {
    // Si el almacenamiento falla, la cola vive solo en memoria.
  }
  emitir();
}

async function persistir() {
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(cola));
  } catch {
    // Igual queda en memoria hasta cerrar la app.
  }
}

export async function encolar(p: NuevoPendiente) {
  await cargar();
  cola = [...cola, { ...p, id: uuid() } as Pendiente];
  marcarSinRed(true);
  emitir();
  await persistir();
}

async function subir(p: Pendiente): Promise<"ok" | "red" | "esperar"> {
  let error: { message?: string; code?: string } | null = null;
  try {
    if (p.tipo === "intento") {
      ({ error } = await supabase.rpc("insertar_intento_sincronizado", {
        p_client_id: p.id,
        p_problem_type: p.problemType,
        p_level: p.nivel,
        p_correct: p.correcto,
        p_time_ms: p.timeMs,
        p_protegido: p.protegido,
        p_calibrar: p.calibrar,
      }));
    } else if (p.tipo === "logica") {
      ({ error } = await supabase.rpc("insertar_intento_logica_sincronizado", {
        p_client_id: p.id,
        p_puzzle_id: p.puzzleId,
        p_dificultad: p.dificultad,
        p_correct: p.correcto,
        p_time_ms: p.timeMs,
        p_categoria: p.categoria,
        p_protegido: p.protegido,
      }));
    } else if (p.tipo === "leccion") {
      ({ error } = await supabase.rpc("completar_leccion", { p_tabla: p.tabla, p_technique_id: p.leccionId, p_respuestas: p.respuestas }));
      if (!error) {
        const { quitarLeccionLocal } = await import("./aprender");
        quitarLeccionLocal(p.leccionId);
      }
    } else {
      ({ error } = await supabase.rpc("registrar_xp_diario", { p_xp: 0 }));
      if (!error) ({ error } = await supabase.rpc("registrar_progreso_mundo", { p_world: p.mundo, p_puntos: 0 }));
    }
  } catch (e) {
    return esErrorDeRed(e) ? "red" : "esperar";
  }
  if (!error) return "ok";
  if (esErrorDeRed(error)) return "red";
  // La función todavía no existe en la base (migración 0245 sin aplicar): se
  // guarda para más tarde. Cualquier otro rechazo de la base no se va a arreglar
  // reintentando, así que ese intento se descarta.
  if (error.code === "PGRST202" || error.code === "42883") return "esperar";
  return "ok";
}

// Sube todo lo pendiente en orden. Se corta en el primer fallo de red.
export function sincronizar(): Promise<void> {
  if (sincronizando) return sincronizando;
  sincronizando = (async () => {
    await cargar();
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    let subioAlgo = false;
    while (cola.length > 0) {
      const r = await subir(cola[0]);
      if (r !== "ok") {
        marcarSinRed(r === "red");
        break;
      }
      cola = cola.slice(1);
      subioAlgo = true;
      await persistir();
      emitir();
    }
    if (cola.length === 0) marcarSinRed(false);
    if (subioAlgo) {
      const { recargarJugador } = await import("./jugador");
      recargarJugador();
    }
  })().finally(() => {
    sincronizando = null;
  });
  return sincronizando;
}

export function hayPendientes() {
  return cola.length > 0;
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => oyentes.delete(o);
}

// { pendientes, sinRed } para mostrar el aviso de "sin conexión".
export function useSinConexion() {
  return useSyncExternalStore(suscribir, () => instantanea);
}

// Arranque: carga la cola guardada y reintenta cada 30 s mientras quede algo.
let intervalo: ReturnType<typeof setInterval> | null = null;
export function iniciarSincronizacion() {
  cargar().then(() => sincronizar());
  if (intervalo) return;
  intervalo = setInterval(() => {
    if (cola.length > 0) sincronizar();
  }, 30_000);
}

// Lectura con copia en el teléfono: si la base responde se guarda; si no hay red,
// se usa la última copia (niveles, banco de acertijos, estado del jugador).
export async function conCopia<T>(clave: string, leer: () => Promise<T | null>): Promise<T | null> {
  const k = `prodigia:copia:${clave}`;
  let valor: T | null = null;
  try {
    valor = await leer();
  } catch {
    valor = null;
  }
  if (valor != null) {
    AsyncStorage.setItem(k, JSON.stringify(valor)).catch(() => undefined);
    return valor;
  }
  try {
    const crudo = await AsyncStorage.getItem(k);
    return crudo ? (JSON.parse(crudo) as T) : null;
  } catch {
    return null;
  }
}
