import { inicioEventoMs, rangosDelAnio } from "@/lib/temas/calendario";
import { esDueloEmparejado } from "@/lib/duelos/emparejamiento";
import { finSemanaGuerraMs } from "@/lib/clanes/guerra";
import { finTemporadaMs, temporadaRankedDe } from "@/lib/rankeds/temporadas";
import { CELEBRACIONES } from "@/lib/temas/celebracion";
import { TEMAS } from "@/lib/temas/temas";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { esAndroid, hayPushRemoto } from "./entorno";
import { alineacionEnCurso, DURACION_EVENTO_MS, proximaAlineacion } from "@/lib/ciudades/cicloDia";
import { supabase } from "./supabase";
import { MUNDO_POR_SLUG, MUNDOS, type MundoSlug } from "~/tema";

// Avisos de la app (docs/app-nativa/04-BUCLE-DE-ENGANCHE.md §5 y
// calibra/docs/avance/NOTIFICACIONES.md). Dos fuentes:
//   - Push del servidor (Edge Functions de calibra/supabase/functions) por
//     categoría: mensajes, duelos, racha en peligro y novedades.
//   - Avisos locales que programa el propio teléfono con un planificador único
//     (replanificarAvisos): recordatorio, Gran Alineación, festividades, temporada
//     de rankeds, guerra de clanes y recompensas por reclamar. Se vuelven a armar
//     cada vez que cambia el estado del jugador (después de cada partida, al abrir).
//
// Reglas: cada tipo se puede apagar; nada entre las 21:00 y las 08:00 de este
// teléfono; como mucho 2 avisos locales por día; los textos cambian de un día a
// otro, sin emojis ni culpa; el permiso se pide después de una partida.

// Categorías del servidor (device_push_tokens.categorias, 0243).
export type Categoria = "mensajes" | "duelos" | "racha" | "novedades";
// Tipos que programa el teléfono.
export type TipoLocal = "alineacion" | "evento" | "temporada" | "guerra" | "regalos";

type Icono = "mensaje" | "duelo" | "racha" | "novedad" | "alineacion" | "evento" | "temporada" | "guerra" | "regalo";

export interface TipoAviso {
  id: Categoria | TipoLocal;
  nombre: string;
  descripcion: string;
  icono: Icono;
  color: string;
  // Solo con cuenta (los invitados no reciben push ni tienen clan o rankeds).
  conCuenta: boolean;
}

export const CATEGORIAS: { id: Categoria; nombre: string; descripcion: string; icono: Icono; color: string; importancia: Notifications.AndroidImportance }[] = [
  {
    id: "mensajes",
    nombre: "Mensajes",
    descripcion: "De tus amigos y del chat de tu clan (como mucho uno cada 30 min por conversación).",
    icono: "mensaje",
    color: "#7C5CFF",
    importancia: Notifications.AndroidImportance.HIGH,
  },
  {
    id: "duelos",
    nombre: "Retos a duelo",
    descripcion: "Cuando un amigo te reta. Los duelos que encuentras buscando rival no avisan.",
    icono: "duelo",
    color: "#FF5D5D",
    importancia: Notifications.AndroidImportance.HIGH,
  },
  {
    id: "racha",
    nombre: "Racha en peligro",
    descripcion: "Uno al final del día, solo si todavía no jugaste y tu racha está por cortarse.",
    icono: "racha",
    color: "#FF8A3D",
    importancia: Notifications.AndroidImportance.DEFAULT,
  },
  {
    id: "novedades",
    nombre: "Novedades de Prodigia",
    descripcion: "Mundos nuevos y mejoras grandes. Nunca de noche.",
    icono: "novedad",
    color: "#FFB627",
    importancia: Notifications.AndroidImportance.DEFAULT,
  },
];

export const TIPOS_LOCALES: (TipoAviso & { id: TipoLocal })[] = [
  { id: "alineacion", nombre: "Gran Alineación", descripcion: "Una hora antes y cuando empieza: 3 horas de Exp doble en las 15 ciudades.", icono: "alineacion", color: "#FFB627", conCuenta: false },
  { id: "evento", nombre: "Festividades", descripcion: "Cuando abre un evento (Halloween, Navidad…), a mitad y el último día.", icono: "evento", color: "#FF6FB5", conCuenta: false },
  { id: "temporada", nombre: "Temporada de rankeds", descripcion: "El día antes del cierre y si te queda una recompensa por reclamar.", icono: "temporada", color: "#E8B34D", conCuenta: true },
  { id: "guerra", nombre: "Guerra de clanes", descripcion: "Las últimas 3 horas de la guerra semanal y cuando sale el resultado.", icono: "guerra", color: "#3FB88B", conCuenta: true },
  { id: "regalos", nombre: "Recompensas por reclamar", descripcion: "Si te quedan cápsulas, regalos o misiones sin abrir (uno al día como mucho).", icono: "regalo", color: "#9B85FF", conCuenta: true },
];

export interface PreferenciasAvisos {
  categorias: Categoria[];
  locales: TipoLocal[];
  recordatorio: { activo: boolean; hora: number };
  permisoPedido: boolean;
}

const CLAVE = "prodigia:avisos";
const TODOS_LOCALES: TipoLocal[] = ["alineacion", "evento", "temporada", "guerra", "regalos"];
const PREFERENCIAS_INICIALES: PreferenciasAvisos = {
  categorias: ["mensajes", "duelos", "racha", "novedades"],
  locales: TODOS_LOCALES,
  recordatorio: { activo: false, hora: 18 },
  permisoPedido: false,
};

// Horas permitidas para el recordatorio: fuera del horario silencioso 21:00-08:00.
export const HORAS_RECORDATORIO = [8, 10, 12, 14, 16, 17, 18, 19, 20];
const HORA_DESDE = 8;
const HORA_HASTA = 21;
// Tope de avisos que programa el teléfono por día (los push del servidor tienen el
// suyo: 2 de retención por día, _shared/avisos.ts).
export const MAX_LOCALES_POR_DIA = 2;

export async function leerPreferencias(): Promise<PreferenciasAvisos> {
  try {
    const raw = await AsyncStorage.getItem(CLAVE);
    if (!raw) return PREFERENCIAS_INICIALES;
    const guardadas = JSON.parse(raw) as Partial<PreferenciasAvisos>;
    const prefs = { ...PREFERENCIAS_INICIALES, ...guardadas };
    // Preferencias de antes de los tipos locales: la Alineación y las festividades
    // colgaban de «Novedades»; si estaba apagada, quedan apagadas.
    if (!guardadas.locales && guardadas.categorias && !guardadas.categorias.includes("novedades")) {
      prefs.locales = TODOS_LOCALES.filter((t) => t !== "alineacion" && t !== "evento");
    }
    return prefs;
  } catch {
    return PREFERENCIAS_INICIALES;
  }
}

async function guardarPreferencias(p: PreferenciasAvisos) {
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(p));
  } catch {
    // Si no se puede guardar, la próxima vez se vuelven a pedir los valores por defecto.
  }
}

// Con la app abierta, el aviso se muestra igual como banner, salvo los de duelo:
// el reto ya aparece como tarjeta dentro de la app (AvisoDuelo.tsx), que además deja
// su propio aviso local en la barra; el push del servidor del mismo reto llegaba
// encima y quedaban tres avisos del mismo duelo (2026-10-29).
Notifications.setNotificationHandler({
  handleNotification: async (n) => {
    const data = n.request.content.data as Record<string, unknown> | undefined;
    const esDuelo = data?.tipo === "duelo";
    // El push de «te retaron» del duelo que acabas de encontrar buscando rival (casual
    // o rankeds) no es un reto: con la app abierta no se muestra (2026-10-29).
    const delEmparejamiento = esDuelo && typeof data?.duelId === "string" && esDueloEmparejado({ id: data.duelId as string });
    const remotoDeDuelo = esDuelo && data?.local !== true;
    const callar = delEmparejamiento || remotoDeDuelo;
    return {
      shouldShowBanner: data?.local !== true && !callar,
      shouldShowList: !callar,
      shouldPlaySound: !callar,
      shouldSetBadge: !callar,
    };
  },
});

// Un canal de Android por categoría del servidor: el sistema deja silenciar cada uno
// por separado y las Edge Functions eligen el canal (fcm.ts, campo `canal`). Los
// avisos locales usan «racha» (recordatorio) y «novedades» (el resto).
export async function configurarCanales() {
  if (!esAndroid) return;
  await Promise.all(
    CATEGORIAS.map((c) =>
      Notifications.setNotificationChannelAsync(c.id, {
        name: c.nombre,
        description: c.descripcion,
        importance: c.importancia,
        lightColor: c.color,
        vibrationPattern: c.importancia === Notifications.AndroidImportance.HIGH ? [0, 180, 90, 180] : [0, 120],
        showBadge: true,
      })
    )
  );
}

let tokenRegistrado: string | null = null;

function zonaHoraria(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

async function registrarTokenRemoto(categorias: Categoria[]) {
  if (!hayPushRemoto) return;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  // Los invitados no reciben push (igual que en la web: NativePush.tsx).
  if (!user || user.is_anonymous) return;
  const token = (await Notifications.getDevicePushTokenAsync()).data as string;
  await supabase.rpc("registrar_push_token", { p_token: token, p_platform: esAndroid ? "android" : "ios" });
  tokenRegistrado = token;
  // 0243: si la base todavía no la tiene, el aviso llega igual para todas las categorías.
  await supabase.rpc("actualizar_categorias_push", { p_token: token, p_categorias: categorias });
  // 0308: la zona del teléfono, para que «racha en peligro» llegue a su hora. Sin la
  // migración, el servidor usa la zona por defecto.
  const zona = zonaHoraria();
  if (zona) await supabase.rpc("actualizar_zona_push", { p_token: token, p_zona: zona });
}

export async function permisoConcedido(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

// Pide el permiso del sistema (Android 13+ / iOS) y registra el dispositivo.
export async function activarAvisos(): Promise<boolean> {
  const prefs = await leerPreferencias();
  await guardarPreferencias({ ...prefs, permisoPedido: true });
  await configurarCanales();
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return false;
  try {
    await registrarTokenRemoto(prefs.categorias);
  } catch {
    // Sin push remoto (p. ej. sin servicios de Google) siguen andando los avisos locales.
  }
  await replanificarAvisos();
  return true;
}

export async function marcarPermisoPedido() {
  const prefs = await leerPreferencias();
  await guardarPreferencias({ ...prefs, permisoPedido: true });
}

// Al abrir la app con sesión: si el permiso ya estaba dado, vuelve a registrar el
// token (puede haber cambiado) con las categorías guardadas y rearma los locales.
export async function sincronizarAvisos() {
  await configurarCanales();
  if (!(await permisoConcedido())) return;
  const prefs = await leerPreferencias();
  try {
    await registrarTokenRemoto(prefs.categorias);
  } catch {
    // Se reintenta la próxima vez que se abra la app.
  }
  await replanificarAvisos();
}

export async function cambiarCategoria(id: Categoria, activa: boolean): Promise<PreferenciasAvisos> {
  const prefs = await leerPreferencias();
  const categorias = activa ? Array.from(new Set([...prefs.categorias, id])) : prefs.categorias.filter((c) => c !== id);
  const nuevas = { ...prefs, categorias };
  await guardarPreferencias(nuevas);
  if (tokenRegistrado) await supabase.rpc("actualizar_categorias_push", { p_token: tokenRegistrado, p_categorias: categorias });
  else await sincronizarAvisos();
  // «Racha» decide también el aviso local de respaldo (sin push remoto).
  if (id === "racha") await replanificarAvisos();
  return nuevas;
}

export async function cambiarTipoLocal(id: TipoLocal, activo: boolean): Promise<PreferenciasAvisos> {
  const prefs = await leerPreferencias();
  const locales = activo ? Array.from(new Set([...prefs.locales, id])) : prefs.locales.filter((t) => t !== id);
  const nuevas = { ...prefs, locales };
  await guardarPreferencias(nuevas);
  await replanificarAvisos();
  return nuevas;
}

export async function cambiarRecordatorio(activo: boolean, hora: number): Promise<PreferenciasAvisos> {
  const prefs = await leerPreferencias();
  const nuevas = { ...prefs, recordatorio: { activo, hora } };
  await guardarPreferencias(nuevas);
  await configurarCanales();
  await replanificarAvisos();
  return nuevas;
}

// ---------------------------------------------------------------------------
// Planificador de avisos locales
// ---------------------------------------------------------------------------

// Lo que se sabe del jugador para personalizar (lo carga jugador.ts).
export interface ContextoAvisos {
  nombre: string | null;
  racha: number;
  // Meta del día ya cumplida (el día de la racha es el día UTC: current_date).
  jugoHoy: boolean;
  esInvitado: boolean;
  clan: string | null;
  // Ciudades del jugador, para variar a dónde invita el recordatorio.
  mundos: string[];
  capsulas: number;
  regalos: number;
  misiones: number;
  calendario: boolean;
  temporadaPendiente: boolean;
}

const CONTEXTO_VACIO: ContextoAvisos = {
  nombre: null,
  racha: 0,
  jugoHoy: false,
  esInvitado: false,
  clan: null,
  mundos: [],
  capsulas: 0,
  regalos: 0,
  misiones: 0,
  calendario: false,
  temporadaPendiente: false,
};

let contexto: ContextoAvisos = CONTEXTO_VACIO;
let temporizador: ReturnType<typeof setTimeout> | null = null;

// jugador.ts llama acá después de cada recarga (al abrir, tras cada partida o
// compra). Se agrupan los cambios seguidos en un solo replanificado.
export function actualizarContextoAvisos(c: Partial<ContextoAvisos>) {
  contexto = { ...contexto, ...c };
  if (temporizador) clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    temporizador = null;
    void replanificarAvisos();
  }, 1500);
}

export function limpiarContextoAvisos() {
  contexto = CONTEXTO_VACIO;
}

type Prioridad = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface Candidato {
  id: string;
  cuando: number;
  titulo: string;
  cuerpo: string;
  ruta: string;
  tipo: string;
  canal: "racha" | "novedades";
  color: string;
  // 1 = el más importante (el tope diario deja los de menor número).
  prioridad: Prioridad;
}

const PREFIJO = "pg:";
// Ids de versiones anteriores (se cancelan para no duplicar con el planificador).
const IDS_VIEJOS = ["recordatorio-practica", "alineacion-dia-antes", "alineacion-10-min", "evento-inicio", "evento-mitad", "evento-final"];
const HORA_MS = 3_600_000;
const DIA_MS = 86_400_000;

function decente(ms: number): boolean {
  const h = new Date(ms).getHours();
  return h >= HORA_DESDE && h < HORA_HASTA;
}

// Si cae de noche, lo corre a las 9:00 siguientes.
function horaDecente(ms: number): number {
  const d = new Date(ms);
  if (d.getHours() >= HORA_HASTA) {
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
  } else if (d.getHours() < HORA_DESDE) d.setHours(9, 0, 0, 0);
  return d.getTime();
}

// Si cae de noche, lo adelanta a las 20:00 anteriores (para avisos con fecha límite).
function antesDeLaNoche(ms: number): number {
  const d = new Date(ms);
  const h = d.getHours();
  if (h >= HORA_DESDE && h < HORA_HASTA) return ms;
  if (h < HORA_DESDE) d.setDate(d.getDate() - 1);
  d.setHours(HORA_HASTA - 1, 0, 0, 0);
  return d.getTime();
}

function enDiaLocal(base: number, diasDespues: number, hora: number, minuto = 0): number {
  const d = new Date(base);
  d.setDate(d.getDate() + diasDespues);
  d.setHours(hora, minuto, 0, 0);
  return d.getTime();
}

function claveDia(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Número de día local, para rotar los textos sin repetir el de ayer.
function numeroDia(ms: number): number {
  const d = new Date(ms);
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60_000) / DIA_MS);
}

function hhmm(ms: number): string {
  const d = new Date(ms);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function primerNombre(nombre: string | null): string | null {
  const n = (nombre ?? "").trim().split(/\s+/)[0];
  return n && n.length <= 18 ? n : null;
}

function dias(n: number): string {
  return `${n} ${n === 1 ? "día" : "días"}`;
}

// Ciudad a la que invita el recordatorio: rota entre las del jugador (las que ya
// tiene la app), así no es siempre Numeria.
function ciudadDelDia(c: ContextoAvisos, ms: number): { slug: MundoSlug; nombre: string } {
  const jugables = MUNDOS.filter((m) => m.enApp && (c.mundos.length === 0 || c.mundos.includes(m.slug) || m.slug === "numeria"));
  const lista = jugables.length > 0 ? jugables : [MUNDO_POR_SLUG.numeria];
  const m = lista[numeroDia(ms) % lista.length];
  return { slug: m.slug, nombre: m.nombre };
}

function recordatorios(prefs: PreferenciasAvisos, c: ContextoAvisos, ahora: number): Candidato[] {
  if (!prefs.recordatorio.activo) return [];
  const lista: Candidato[] = [];
  const nombre = primerNombre(c.nombre);
  let primero = true;
  for (let k = 0; k < 7; k++) {
    const cuando = enDiaLocal(ahora, k, prefs.recordatorio.hora);
    if (cuando <= ahora) continue;
    // Hoy ya cumpliste la meta: hoy no hace falta.
    if (k === 0 && c.jugoHoy) continue;
    const ciudad = ciudadDelDia(c, cuando);
    // El número de la racha solo se sabe para el próximo aviso; los demás, sin cifras.
    const racha = primero ? c.racha : 0;
    primero = false;
    const variantes: [string, string][] = [
      [nombre ? `${nombre}, tu sprint de hoy` : "Tu sprint de hoy", racha > 0 ? `60 segundos en ${ciudad.nombre} y tu racha llega a ${dias(racha + 1)}.` : `60 segundos en ${ciudad.nombre} y el día ya cuenta para tu racha.`],
      [`${ciudad.nombre} te está esperando`, "Una partida corta ahora y no tienes que pensar más en la racha hoy."],
      ["¿Mejoras tu marca?", `Un sprint en ${ciudad.nombre}: en un minuto sabes si superaste la de ayer.`],
      [racha > 0 ? `Racha de ${dias(racha)}` : "Un minuto para tu cabeza", racha > 0 ? `Hoy toca el día ${racha + 1}. Un sprint y listo.` : `Practica en ${ciudad.nombre}: 60 segundos bastan para sumar el día.`],
    ];
    const [titulo, cuerpo] = variantes[numeroDia(cuando) % variantes.length];
    lista.push({ id: `${PREFIJO}recordatorio-${k}`, cuando, titulo, cuerpo, ruta: `/${ciudad.slug}`, tipo: "recordatorio", canal: "racha", color: "#FF8A3D", prioridad: 1 });
  }
  return lista;
}

// Respaldo local de «racha en peligro» para quien no recibe el push del servidor
// (invitados, teléfonos sin servicios de Google). La racha se cuenta por día UTC
// (current_date): el día se corta a la medianoche UTC, que en América cae de tarde.
// Se avisa 2 h antes de ese corte, o a las 20:00 si el corte cae de noche.
function rachaLocal(prefs: PreferenciasAvisos, c: ContextoAvisos, ahora: number): Candidato[] {
  if (!prefs.categorias.includes("racha") || tokenRegistrado || prefs.recordatorio.activo) return [];
  if (c.racha <= 0 || c.jugoHoy) return [];
  const inicioDiaUtc = Math.floor(ahora / DIA_MS) * DIA_MS;
  const corte = inicioDiaUtc + DIA_MS;
  const cuando = antesDeLaNoche(corte - 2 * HORA_MS);
  if (cuando <= ahora || cuando < inicioDiaUtc + HORA_MS || !decente(cuando)) return [];
  const horas = Math.max(1, Math.round((corte - cuando) / HORA_MS));
  const nombre = primerNombre(c.nombre);
  const ciudad = ciudadDelDia(c, cuando);
  return [
    {
      id: `${PREFIJO}racha`,
      cuando,
      titulo: `Tu racha de ${dias(c.racha)} está en peligro`,
      cuerpo: `${nombre ? `${nombre}, te quedan` : "Te quedan"} ${horas} h para salvarla. Un sprint de 60 segundos en ${ciudad.nombre} basta.`,
      ruta: `/${ciudad.slug}`,
      tipo: "racha_riesgo",
      canal: "racha",
      color: "#FF8A3D",
      prioridad: 2,
    },
  ];
}

// Gran Alineación (PLAN_PRIMERA_VEZ_APP.md §6): 1 h antes y al empezar. Es a la
// misma hora en todo el mundo: si en este teléfono cae de noche, ese aviso no sale.
function alineacion(prefs: PreferenciasAvisos, c: ContextoAvisos, ahora: number): Candidato[] {
  if (!prefs.locales.includes("alineacion")) return [];
  const proxima = alineacionEnCurso(ahora) ? proximaAlineacion(ahora + DURACION_EVENTO_MS) : proximaAlineacion(ahora);
  const fin = proxima + DURACION_EVENTO_MS;
  const nombre = primerNombre(c.nombre);
  const cierreTemporada = !c.esInvitado ? " y es el cierre de la temporada de rankeds" : "";
  const lista: Candidato[] = [
    {
      id: `${PREFIJO}alineacion-1h`,
      cuando: proxima - HORA_MS,
      titulo: "En 1 hora, la Gran Alineación",
      cuerpo: `A las ${hhmm(proxima)} las 15 ciudades amanecen juntas: 3 horas de Exp doble${cierreTemporada}.`,
      ruta: "/mundos",
      tipo: "alineacion",
      canal: "novedades",
      color: "#FFB627",
      prioridad: 3,
    },
    {
      id: `${PREFIJO}alineacion-ya`,
      cuando: proxima,
      titulo: "Empezó la Gran Alineación",
      cuerpo: `${nombre ? `${nombre}, h` : "H"}asta las ${hhmm(fin)} todo da Exp doble y las constelaciones, premio doble.`,
      ruta: "/mundos",
      tipo: "alineacion",
      canal: "novedades",
      color: "#FFB627",
      prioridad: 3,
    },
  ];
  return lista.filter((a) => decente(a.cuando));
}

// Festividades (PARIDAD_EVENTOS.md fila 16): al empezar, a mitad y el último día,
// con el tono de la fecha (celebracion.ts). Si cae de noche, sale a las 9:00. Nunca
// antes de que empiece (sin vistas previas de eventos).
function evento(prefs: PreferenciasAvisos, ahora: number): Candidato[] {
  if (!prefs.locales.includes("evento")) return [];
  const anio = new Date(ahora).getFullYear();
  const r = [...rangosDelAnio(anio), ...rangosDelAnio(anio + 1)]
    .filter((x) => new Date(`${x.hasta}T21:00:00`).getTime() > ahora)
    .sort((a, b) => (a.desde < b.desde ? -1 : 1))[0];
  if (!r) return [];
  const cel = CELEBRACIONES[r.id];
  const tema = TEMAS[r.id];
  const inicio = horaDecente(inicioEventoMs(r));
  const final = new Date(`${r.hasta}T12:00:00`).getTime();
  const mitadDia = new Date((inicio + final) / 2);
  mitadDia.setHours(12, 0, 0, 0);
  const mitad = mitadDia.getTime();
  // Los textos con datos de la partida ({n}, {puesto}…) no se pueden saber de antemano.
  const texto = (t: string) => (t.includes("{") ? `${tema.frase.evento}: todavía estás a tiempo.` : t);
  const lista: Candidato[] = [
    { id: `${PREFIJO}evento-inicio`, cuando: inicio, titulo: tema.nombre, cuerpo: texto(cel.avisos[0]), ruta: "/evento", tipo: "evento", canal: "novedades", color: tema.acento, prioridad: 4 },
    { id: `${PREFIJO}evento-final`, cuando: final, titulo: tema.nombre, cuerpo: texto(cel.avisos[2]), ruta: "/evento", tipo: "evento", canal: "novedades", color: tema.acento, prioridad: 4 },
  ];
  // A mitad solo si el evento dura lo suficiente para que no se encime.
  if (mitad - inicio >= DIA_MS && final - mitad >= DIA_MS) {
    lista.push({ id: `${PREFIJO}evento-mitad`, cuando: mitad, titulo: tema.nombre, cuerpo: texto(cel.avisos[1]), ruta: "/evento", tipo: "evento", canal: "novedades", color: tema.acento, prioridad: 6 });
  }
  return lista;
}

// Temporada de rankeds (0296/0302): el día antes del cierre, y si al abrir la app
// quedó una recompensa sin reclamar, un recordatorio al día siguiente (AnuncioTemporada
// la muestra al entrar).
function temporada(prefs: PreferenciasAvisos, c: ContextoAvisos, ahora: number): Candidato[] {
  if (!prefs.locales.includes("temporada") || c.esInvitado) return [];
  const lista: Candidato[] = [];
  const n = temporadaRankedDe(ahora);
  const fin = finTemporadaMs(n);
  const vispera = enDiaLocal(fin - DIA_MS, 0, 18);
  lista.push({
    id: `${PREFIJO}temporada-vispera`,
    cuando: vispera,
    titulo: `La temporada ${n} de rankeds cierra mañana`,
    cuerpo: "Sube de rango antes del cierre: tu rango final decide las cápsulas que te llevas.",
    ruta: "/competir",
    tipo: "temporada",
    canal: "novedades",
    color: "#E8B34D",
    prioridad: 4,
  });
  if (c.temporadaPendiente) {
    lista.push({
      id: `${PREFIJO}temporada-recompensa`,
      cuando: enDiaLocal(ahora, 1, 13),
      titulo: "Tu recompensa de temporada te espera",
      cuerpo: "Entra y reclama las cápsulas de tu rango antes de que empiece a contar la temporada nueva.",
      ruta: "/",
      tipo: "temporada",
      canal: "novedades",
      color: "#E8B34D",
      prioridad: 5,
    });
  }
  return lista;
}

// Guerra de clanes (semanal, cierra el lunes 00:00 UTC): las últimas 3 horas y el
// resultado. Solo con clan.
function guerra(prefs: PreferenciasAvisos, c: ContextoAvisos, ahora: number): Candidato[] {
  if (!prefs.locales.includes("guerra") || !c.clan || c.esInvitado) return [];
  const cierre = finSemanaGuerraMs(ahora);
  const ultimas = cierre - 3 * HORA_MS;
  // Una hora después del cierre (o a la mañana siguiente si cae de noche), nunca antes de las 10:00.
  const tras = horaDecente(cierre + HORA_MS);
  const resultado = Math.max(tras, enDiaLocal(tras, 0, 10));
  const lista: Candidato[] = [];
  if (decente(ultimas)) {
    lista.push({
      id: `${PREFIJO}guerra-cierre`,
      cuando: ultimas,
      titulo: "Últimas 3 horas de la guerra de clanes",
      cuerpo: `Cada sprint suma Exp para ${c.clan}. Cierra a las ${hhmm(cierre)}.`,
      ruta: "/social?seccion=clan",
      tipo: "guerra",
      canal: "novedades",
      color: "#3FB88B",
      prioridad: 4,
    });
  }
  lista.push({
    id: `${PREFIJO}guerra-resultado`,
    cuando: resultado,
    titulo: "Guerra de clanes: ya hay ganador",
    cuerpo: `Mira cómo quedó ${c.clan} y contra quién van esta semana.`,
    ruta: "/social?seccion=clan",
    tipo: "guerra",
    canal: "novedades",
    color: "#3FB88B",
    prioridad: 6,
  });
  return lista;
}

// Recompensas por reclamar: un recordatorio al día siguiente (si siguen ahí cuando
// vuelvas a abrir la app, se vuelve a programar; si las abriste, se cancela).
function regalos(prefs: PreferenciasAvisos, c: ContextoAvisos, ahora: number): Candidato[] {
  if (!prefs.locales.includes("regalos") || c.esInvitado) return [];
  const partes: string[] = [];
  if (c.capsulas > 0) partes.push(`${c.capsulas} ${c.capsulas === 1 ? "cápsula" : "cápsulas"} sin abrir`);
  if (c.regalos > 0) partes.push(`${c.regalos} ${c.regalos === 1 ? "regalo" : "regalos"}`);
  if (c.misiones > 0) partes.push(`${c.misiones} ${c.misiones === 1 ? "misión cumplida" : "misiones cumplidas"} por cobrar`);
  if (c.calendario) partes.push("el premio del calendario de hoy");
  if (partes.length === 0) return [];
  const lista = partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
  return [
    {
      id: `${PREFIJO}regalos`,
      cuando: enDiaLocal(ahora, 1, 13),
      titulo: "Tienes cosas por reclamar",
      cuerpo: `Te esperan ${lista}.`,
      ruta: "/recompensas",
      tipo: "regalos",
      canal: "novedades",
      color: "#9B85FF",
      prioridad: 7,
    },
  ];
}

// Tope diario: por cada día local quedan los MAX_LOCALES_POR_DIA más importantes.
// Dos avisos de un mismo día, separados al menos por 1 hora.
function aplicarTope(lista: Candidato[]): Candidato[] {
  const porDia = new Map<string, Candidato[]>();
  for (const c of [...lista].sort((a, b) => a.prioridad - b.prioridad || a.cuando - b.cuando)) {
    const clave = claveDia(c.cuando);
    const elegidos = porDia.get(clave) ?? [];
    if (elegidos.length >= MAX_LOCALES_POR_DIA) continue;
    if (elegidos.some((e) => Math.abs(e.cuando - c.cuando) < HORA_MS && e.tipo !== c.tipo)) continue;
    elegidos.push(c);
    porDia.set(clave, elegidos);
  }
  return [...porDia.values()].flat();
}

async function cancelarLocales() {
  const programados = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  const ids = new Set<string>(IDS_VIEJOS);
  for (const n of programados) if (n.identifier.startsWith(PREFIJO)) ids.add(n.identifier);
  await Promise.all([...ids].map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
}

let cola: Promise<void> = Promise.resolve();

// Rearma todos los avisos locales (en fila: dos llamadas seguidas no se pisan).
export function replanificarAvisos(): Promise<void> {
  cola = cola.then(planificar).catch(() => undefined);
  return cola;
}

async function planificar() {
  await cancelarLocales();
  if (!(await permisoConcedido())) return;
  const prefs = await leerPreferencias();
  const ahora = Date.now();
  const c = contexto;
  const candidatos = [
    ...recordatorios(prefs, c, ahora),
    ...rachaLocal(prefs, c, ahora),
    ...alineacion(prefs, c, ahora),
    ...evento(prefs, ahora),
    ...temporada(prefs, c, ahora),
    ...guerra(prefs, c, ahora),
    ...regalos(prefs, c, ahora),
  ].filter((x) => x.cuando > ahora + 60_000 && decente(x.cuando));
  for (const a of aplicarTope(candidatos)) {
    await Notifications.scheduleNotificationAsync({
      identifier: a.id,
      content: { title: a.titulo, body: a.cuerpo, data: { tipo: a.tipo, ruta: a.ruta }, color: a.color },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(a.cuando), channelId: a.canal },
    }).catch(() => undefined);
  }
}

// A dónde lleva tocar un aviso: el chat con quien te escribió, el chat del clan, el
// duelo que te mandaron, la ciudad del recordatorio, el evento… Los locales traen su
// `ruta`; los del servidor, su tipo (su `url` es de la web).
export function rutaDeAviso(data: Record<string, unknown> | undefined): string {
  const tipo = typeof data?.tipo === "string" ? data.tipo : "";
  if (typeof data?.ruta === "string" && data.ruta.startsWith("/")) return data.ruta;
  if (tipo === "racha_riesgo" && typeof data?.mundo === "string" && data.mundo in MUNDO_POR_SLUG && MUNDO_POR_SLUG[data.mundo as MundoSlug].enApp) return `/${data.mundo}`;
  if (tipo === "recordatorio" || tipo === "racha_riesgo") return "/numeria";
  if (tipo === "mensaje_directo" && typeof data?.remitenteId === "string") return `/chat/${data.remitenteId}`;
  if (tipo === "clan_mensaje") return "/clan/chat";
  if (tipo === "duelo" && typeof data?.duelId === "string") return `/duelo/${data.duelId}`;
  if (tipo === "anuncio") return "/avisos";
  if (tipo === "alineacion") return "/mundos";
  if (tipo === "evento") return "/evento";
  return "/";
}
