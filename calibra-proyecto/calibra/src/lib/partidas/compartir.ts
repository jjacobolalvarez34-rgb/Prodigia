// Compartir el resultado de una partida (2026-10-21): la «tarjeta» con lo que se
// muestra en la imagen y en la página pública /partida/<id>. Lógica pura, sin
// clientes de Supabase: la web y la app hacen sus llamadas (compartir_duelo,
// compartir_sprint, partida_compartida — 0300_compartir_partidas.sql) y pasan
// las filas por acá.
import { normalizarRespuestas, rachaMaxima, type RespuestaPartida } from "./estadisticas";

export type ResultadoTarjeta = "victoria" | "derrota" | "empate" | "pendiente" | null;

export interface LadoTarjeta {
  nombre: string | null;
  correctos: number | null;
  total: number | null;
  precision: number | null;
  // Puntaje del duelo = Exp de la partida (registrar_resultado_duelo recibe el xp).
  puntaje: number | null;
  tiempoPromedioMs: number | null;
  respuestas: RespuestaPartida[] | null;
}

export interface TarjetaPartida {
  tipo: "sprint" | "duelo";
  mundo: string;
  clasificatorio: boolean | null;
  fecha: string | null;
  rachaMax: number | null;
  yo: LadoTarjeta;
  rival: (LadoTarjeta & { esBot: boolean }) | null;
  resultado: ResultadoTarjeta;
}

export const MUNDOS_TARJETA = [
  "numeria", "enigmia", "geografia", "quimia", "anatomia", "melodia", "trigonometria", "historia",
  "calculia", "circuitia", "estadistica", "naipia", "codia", "dinamia", "vitalia",
] as const;

export function esMundoTarjeta(m: unknown): m is (typeof MUNDOS_TARJETA)[number] {
  return typeof m === "string" && (MUNDOS_TARJETA as readonly string[]).includes(m);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function esUuid(s: unknown): s is string {
  return typeof s === "string" && UUID.test(s);
}

// La migración 0300 todavía no corrió (la función no existe en la base): se
// comparte solo la imagen, sin enlace. PostgREST: PGRST202; Postgres: 42883.
export function esFuncionFaltante(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: unknown; message?: unknown };
  return e.code === "PGRST202" || e.code === "42883" || (typeof e.message === "string" && /could not find the function|does not exist/i.test(e.message));
}

export function rutaPartidaPublica(id: string, locale = "es"): string {
  return `/${locale === "en" ? "en" : "es"}/partida/${id}`;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null;
}

function texto(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v.slice(0, 40) : null;
}

function resultadoValido(v: unknown): ResultadoTarjeta {
  return v === "victoria" || v === "derrota" || v === "empate" || v === "pendiente" ? v : null;
}

// Fila de partida_compartida (0300) → tarjeta.
export function filaATarjeta(fila: Record<string, unknown> | null | undefined): TarjetaPartida | null {
  if (!fila || !esMundoTarjeta(fila.mundo)) return null;
  const tipo = fila.tipo === "duelo" ? "duelo" : "sprint";
  const respuestas = normalizarRespuestas(fila.respuestas);
  const rivalRespuestas = normalizarRespuestas(fila.rival_respuestas);
  return {
    tipo,
    mundo: fila.mundo,
    clasificatorio: typeof fila.clasificatorio === "boolean" ? fila.clasificatorio : null,
    fecha: typeof fila.creado_at === "string" ? fila.creado_at : null,
    rachaMax: num(fila.racha_max) ?? (respuestas ? rachaMaxima(respuestas) : null),
    yo: {
      nombre: texto(fila.jugador_nombre),
      correctos: num(fila.correctos),
      total: num(fila.total),
      precision: num(fila.precision_partida),
      puntaje: num(fila.experiencia),
      tiempoPromedioMs: num(fila.tiempo_promedio_ms),
      respuestas,
    },
    rival:
      tipo === "duelo"
        ? {
            nombre: texto(fila.rival_nombre),
            esBot: fila.rival_es_bot === true,
            correctos: num(fila.rival_correctos),
            total: num(fila.rival_total),
            precision: num(fila.rival_precision),
            puntaje: num(fila.rival_puntaje),
            tiempoPromedioMs: num(fila.rival_tiempo_promedio_ms),
            respuestas: rivalRespuestas,
          }
        : null,
    resultado: tipo === "duelo" ? resultadoValido(fila.resultado) : null,
  };
}

// «7/10» si hay conteo; si no, la precisión («70 %»); si no, «—».
export function aciertosTexto(l: Pick<LadoTarjeta, "correctos" | "total" | "precision">): string {
  if (l.correctos != null && l.total != null && l.total > 0) return `${l.correctos}/${l.total}`;
  if (l.precision != null) return `${Math.round(l.precision * 100)}%`;
  return "—";
}

// ---------- tarjeta en la URL (imagen sin enlace público) ----------
// Si la migración no corrió, la imagen se arma con los datos que ya tiene la
// pantalla del resultado: van en la URL de /api/partida/tarjeta?d=..., en JSON
// compacto y base64url. Solo dibuja una imagen: no se guarda nada ni se publica.

const MAX_RESPUESTAS_URL = 30;

function aBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function ladoCorto(l: LadoTarjeta) {
  return {
    n: l.nombre,
    c: l.correctos,
    t: l.total,
    p: l.precision,
    x: l.puntaje,
    m: l.tiempoPromedioMs == null ? null : Math.round(l.tiempoPromedioMs),
    r: l.respuestas ? l.respuestas.slice(0, MAX_RESPUESTAS_URL).map((x) => [x.correct ? 1 : 0, x.timeMs]) : null,
  };
}

function ladoLargo(o: unknown): LadoTarjeta | null {
  if (!o || typeof o !== "object") return null;
  const l = o as Record<string, unknown>;
  const r = Array.isArray(l.r) ? normalizarRespuestas(l.r.map((x) => (Array.isArray(x) ? { correct: x[0] === 1, timeMs: x[1] } : null))) : null;
  return {
    nombre: texto(l.n),
    correctos: num(l.c),
    total: num(l.t),
    precision: num(l.p),
    puntaje: num(l.x),
    tiempoPromedioMs: num(l.m),
    respuestas: r ? r.slice(0, MAX_RESPUESTAS_URL) : null,
  };
}

export function codificarTarjeta(t: TarjetaPartida): string {
  return aBase64Url(
    JSON.stringify({
      k: t.tipo === "duelo" ? 1 : 0,
      w: t.mundo,
      q: t.clasificatorio,
      f: t.fecha,
      s: t.rachaMax,
      y: ladoCorto(t.yo),
      v: t.rival ? { ...ladoCorto(t.rival), b: t.rival.esBot ? 1 : 0 } : null,
      o: t.resultado,
    })
  );
}

export function decodificarTarjeta(s: string | null | undefined): TarjetaPartida | null {
  if (!s || s.length > 6000) return null;
  try {
    const o = JSON.parse(deBase64Url(s)) as Record<string, unknown>;
    if (!esMundoTarjeta(o.w)) return null;
    const yo = ladoLargo(o.y);
    if (!yo) return null;
    const tipo = o.k === 1 ? "duelo" : "sprint";
    const rivalBase = tipo === "duelo" ? ladoLargo(o.v) : null;
    return {
      tipo,
      mundo: o.w,
      clasificatorio: typeof o.q === "boolean" ? o.q : null,
      fecha: typeof o.f === "string" && !Number.isNaN(Date.parse(o.f)) ? o.f : null,
      rachaMax: num(o.s),
      yo,
      rival: rivalBase ? { ...rivalBase, esBot: (o.v as Record<string, unknown>).b === 1 } : null,
      resultado: tipo === "duelo" ? resultadoValido(o.o) : null,
    };
  } catch {
    return null;
  }
}

// ---------- desde la pantalla del resultado ----------
// Lo que la pantalla de fin de partida ya tiene (resumen de /api/practica/finish
// o del cierre de la app, y el resultado del duelo si hubo) → de dónde sale el
// enlace y la tarjeta para la imagen.

export type OrigenCompartir = { duelId: string } | { mundo: string; cantidad: number; desde: string | null };

export interface DueloFinPartida {
  resuelto?: boolean | null;
  gane?: boolean | null;
  empate?: boolean | null;
  mi_puntaje?: number | null;
  rival_puntaje?: number | null;
  oponente_nombre?: string | null;
  oponente_es_bot?: boolean | null;
  clasificatorio?: boolean | null;
  rival_precision?: number | null;
  rival_tiempo_promedio?: number | null;
}

export interface DatosFinPartida {
  mundo: string;
  // started_at del sprint (hora del servidor en la web); null si no se sabe.
  desde: string | null;
  sprint: { total: number; correctos: number; precision?: number | null; xpGanado: number; avgTimeMs: number | null };
  // Cuántas respuestas se dieron (si se sabe); si no, el total de la partida.
  respondidas?: number | null;
  // Acierto + tiempo de cada respuesta, si la pantalla las tiene (la app sí).
  respuestas?: RespuestaPartida[] | null;
  nombre?: string | null;
  duelId?: string | null;
  duelo?: DueloFinPartida | null;
  rivalNombre?: string | null;
}

export function compartirFinPartida(d: DatosFinPartida): { origen: OrigenCompartir; tarjeta: TarjetaPartida } {
  const esDuelo = !!d.duelId;
  const du = d.duelo ?? null;
  const respuestas = d.respuestas && d.respuestas.length > 0 ? d.respuestas : null;
  const promedio = respuestas ? respuestas.reduce((acc, r) => acc + r.timeMs, 0) / respuestas.length : null;
  const resultado: ResultadoTarjeta = !esDuelo ? null : !du?.resuelto ? "pendiente" : du.empate ? "empate" : du.gane ? "victoria" : "derrota";
  return {
    origen: esDuelo && d.duelId ? { duelId: d.duelId } : { mundo: d.mundo, cantidad: Math.max(1, d.respondidas ?? respuestas?.length ?? d.sprint.total), desde: d.desde },
    tarjeta: {
      tipo: esDuelo ? "duelo" : "sprint",
      mundo: d.mundo,
      clasificatorio: esDuelo ? (du?.clasificatorio ?? null) : null,
      // Sin fecha: la imagen pone la de hoy (así la clave de la tarjeta no cambia en cada render).
      fecha: null,
      rachaMax: respuestas ? rachaMaxima(respuestas) : null,
      yo: {
        nombre: d.nombre ?? null,
        correctos: d.sprint.correctos,
        total: d.sprint.total,
        precision: d.sprint.precision ?? (d.sprint.total > 0 ? d.sprint.correctos / d.sprint.total : null),
        puntaje: esDuelo ? (du?.mi_puntaje ?? d.sprint.xpGanado) : d.sprint.xpGanado,
        tiempoPromedioMs: d.sprint.avgTimeMs ?? promedio,
        respuestas,
      },
      rival: esDuelo
        ? {
            nombre: du?.oponente_nombre ?? d.rivalNombre ?? null,
            esBot: du?.oponente_es_bot === true,
            correctos: null,
            total: null,
            precision: du?.rival_precision ?? null,
            puntaje: du?.resuelto ? (du.rival_puntaje ?? null) : null,
            tiempoPromedioMs: du?.rival_tiempo_promedio ?? null,
            respuestas: null,
          }
        : null,
      resultado,
    },
  };
}
