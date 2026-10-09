import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { esAndroid, hayPushRemoto } from "./entorno";
import { alineacionEnCurso, DURACION_EVENTO_MS, proximaAlineacion } from "@/lib/ciudades/cicloDia";
import { supabase } from "./supabase";

// Avisos de la app (docs/app-nativa/04-BUCLE-DE-ENGANCHE.md §5). El push remoto lo
// mandan las Edge Functions de la web (calibra/supabase/functions) al token de este
// dispositivo; el recordatorio de práctica es local (lo programa el propio teléfono).
//
// Reglas por el público (8-15 años): cada categoría se puede apagar, nada entre las
// 21:00 y las 08:00, el permiso se pide después del primer sprint y con una pantalla
// que explica para qué, y los textos son concretos y sin culpa.

export type Categoria = "mensajes" | "duelos" | "racha" | "novedades";

export const CATEGORIAS: { id: Categoria; nombre: string; descripcion: string; icono: string; color: string; importancia: Notifications.AndroidImportance }[] = [
  {
    id: "mensajes",
    nombre: "Mensajes",
    descripcion: "Mensajes de tus amigos y del chat de tu clan (agrupados, como mucho uno cada 30 min por conversación).",
    icono: "💬",
    color: "#7C5CFF",
    importancia: Notifications.AndroidImportance.HIGH,
  },
  {
    id: "duelos",
    nombre: "Duelos",
    descripcion: "Cuando alguien te reta a un duelo.",
    icono: "⚔️",
    color: "#FF5D5D",
    importancia: Notifications.AndroidImportance.HIGH,
  },
  {
    id: "racha",
    nombre: "Racha",
    descripcion: "Un aviso al día como mucho, si todavía no jugaste y tu racha está por cortarse.",
    icono: "🔥",
    color: "#FF8A3D",
    importancia: Notifications.AndroidImportance.DEFAULT,
  },
  {
    id: "novedades",
    nombre: "Novedades y eventos",
    descripcion: "Mundos nuevos, eventos y mejoras de Prodigia. Nunca de noche.",
    icono: "🎉",
    color: "#FFB627",
    importancia: Notifications.AndroidImportance.DEFAULT,
  },
];

export interface PreferenciasAvisos {
  categorias: Categoria[];
  recordatorio: { activo: boolean; hora: number };
  permisoPedido: boolean;
}

const CLAVE = "prodigia:avisos";
const PREFERENCIAS_INICIALES: PreferenciasAvisos = {
  categorias: ["mensajes", "duelos", "racha", "novedades"],
  recordatorio: { activo: false, hora: 18 },
  permisoPedido: false,
};

// Horas permitidas para el recordatorio: fuera del horario silencioso 21:00-08:00.
export const HORAS_RECORDATORIO = [8, 12, 16, 17, 18, 19, 20];

export async function leerPreferencias(): Promise<PreferenciasAvisos> {
  try {
    const raw = await AsyncStorage.getItem(CLAVE);
    return raw ? { ...PREFERENCIAS_INICIALES, ...(JSON.parse(raw) as Partial<PreferenciasAvisos>) } : PREFERENCIAS_INICIALES;
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

// Con la app abierta, el aviso se muestra igual como banner. El del reto a duelo que
// genera la propia app (AvisoDuelo.tsx, `local`) ya se ve como tarjeta dentro de la
// app: ese solo queda en la barra de notificaciones, sin banner repetido.
Notifications.setNotificationHandler({
  handleNotification: async (n) => ({
    shouldShowBanner: n.request.content.data?.local !== true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Un canal de Android por categoría: el sistema deja silenciar cada uno por separado
// y las Edge Functions eligen el canal (fcm.ts, campo `canal`).
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

async function registrarTokenRemoto(categorias: Categoria[]) {
  if (!hayPushRemoto) return;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  // Los invitados no reciben push (igual que en la web: NativePush.tsx).
  if (!user || user.is_anonymous) return;
  const token = (await Notifications.getDevicePushTokenAsync()).data as string;
  tokenRegistrado = token;
  await supabase.rpc("registrar_push_token", { p_token: token, p_platform: esAndroid ? "android" : "ios" });
  // 0243: si la base todavía no la tiene, el aviso llega igual para todas las categorías.
  await supabase.rpc("actualizar_categorias_push", { p_token: token, p_categorias: categorias });
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
  return true;
}

export async function marcarPermisoPedido() {
  const prefs = await leerPreferencias();
  await guardarPreferencias({ ...prefs, permisoPedido: true });
}

// Al abrir la app con sesión: si el permiso ya estaba dado, vuelve a registrar el
// token (puede haber cambiado) con las categorías guardadas.
export async function sincronizarAvisos() {
  await configurarCanales();
  if (!(await permisoConcedido())) return;
  const prefs = await leerPreferencias();
  try {
    await registrarTokenRemoto(prefs.categorias);
  } catch {
    // Se reintenta la próxima vez que se abra la app.
  }
  await programarAvisosAlineacion(prefs.categorias.includes("novedades"));
}

// Gran Alineación (PLAN_PRIMERA_VEZ_APP.md §6): aviso local el día anterior y 10
// minutos antes de la próxima, si «Novedades» está activa. Nunca entre las 21:00 y
// las 08:00 de este teléfono (si cae ahí, ese aviso no se manda).
const IDS_ALINEACION = ["alineacion-dia-antes", "alineacion-10-min"] as const;

export async function programarAvisosAlineacion(activa: boolean) {
  await Promise.all(IDS_ALINEACION.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  if (!activa) return;
  const ahora = Date.now();
  const proxima = alineacionEnCurso(ahora) ? proximaAlineacion(ahora + DURACION_EVENTO_MS) : proximaAlineacion(ahora);
  const hora = new Date(proxima).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  const avisos = [
    { id: IDS_ALINEACION[0], cuando: proxima - 24 * 3_600_000, titulo: "✦ Mañana: la Gran Alineación", cuerpo: `Las 15 ciudades amanecen juntas a las ${hora}. 3 horas de Exp doble y constelaciones con premio doble.` },
    { id: IDS_ALINEACION[1], cuando: proxima - 10 * 60_000, titulo: "✦ En 10 minutos, la Gran Alineación", cuerpo: "Exp doble en todas las ciudades durante 3 horas. ¡Prepárate!" },
  ];
  for (const a of avisos) {
    const h = new Date(a.cuando).getHours();
    if (a.cuando <= ahora || h < 8 || h >= 21) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: a.id,
      content: { title: a.titulo, body: a.cuerpo, data: { tipo: "alineacion" }, color: "#FFB627" },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(a.cuando), channelId: "novedades" },
    }).catch(() => undefined);
  }
}

export async function cambiarCategoria(id: Categoria, activa: boolean): Promise<PreferenciasAvisos> {
  const prefs = await leerPreferencias();
  const categorias = activa ? Array.from(new Set([...prefs.categorias, id])) : prefs.categorias.filter((c) => c !== id);
  const nuevas = { ...prefs, categorias };
  await guardarPreferencias(nuevas);
  if (tokenRegistrado) {
    await supabase.rpc("actualizar_categorias_push", { p_token: tokenRegistrado, p_categorias: categorias });
    if (id === "novedades") await programarAvisosAlineacion(activa);
  } else {
    await sincronizarAvisos();
  }
  return nuevas;
}

const ID_RECORDATORIO = "recordatorio-practica";

export async function cambiarRecordatorio(activo: boolean, hora: number): Promise<PreferenciasAvisos> {
  const prefs = await leerPreferencias();
  const nuevas = { ...prefs, recordatorio: { activo, hora } };
  await guardarPreferencias(nuevas);
  await Notifications.cancelScheduledNotificationAsync(ID_RECORDATORIO).catch(() => undefined);
  if (activo) {
    await configurarCanales();
    await Notifications.scheduleNotificationAsync({
      identifier: ID_RECORDATORIO,
      content: {
        title: "🔥 Un sprint y listo",
        body: "60 segundos de Numeria y tu racha suma un día más.",
        data: { tipo: "recordatorio", url: "/numeria" },
        color: "#FF8A3D",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: hora, minute: 0, channelId: "racha" },
    });
  }
  return nuevas;
}

// A qué pantalla de la app lleva tocar un aviso. Lo que todavía no está en la app
// (chat, clanes, duelos) abre el centro de avisos, que ofrece seguir en la web.
// A dónde lleva tocar un aviso: el chat con quien te escribió, el chat del clan, el
// duelo que te mandaron, o a jugar si la racha está en riesgo.
export function rutaDeAviso(data: Record<string, unknown> | undefined): string {
  const tipo = typeof data?.tipo === "string" ? data.tipo : "";
  if (tipo === "recordatorio" || tipo === "racha_riesgo") return "/numeria";
  if (tipo === "mensaje_directo" && typeof data?.remitenteId === "string") return `/chat/${data.remitenteId}`;
  if (tipo === "clan_mensaje") return "/clan/chat";
  if (tipo === "duelo" && typeof data?.duelId === "string") return `/duelo/${data.duelId}`;
  if (tipo === "anuncio") return "/avisos";
  if (tipo === "alineacion") return "/mundos";
  return "/";
}
