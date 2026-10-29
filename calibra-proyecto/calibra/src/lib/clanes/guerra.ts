// Guerra de clanes semanal: estado visible para tu clan (web y app).
//
// La guerra es el ranking semanal de Exp de los clanes (ranking_clanes_semanal,
// 0070): suma lo que ganan sus miembros de lunes a domingo (UTC) y al empezar la
// semana siguiente procesar_cierre_semana_clanes le da +1 guerra ganada al clan
// jugador con más Exp. Antes solo se veía un «tu clan vs rival» cuando había un
// clan justo por encima; si tu clan iba primero o todavía no sumaba Exp esta semana
// (por ejemplo los lunes) no aparecía nada y parecía que no existía (2026-10-29).
// Ahora siempre hay estado: tu puesto, contra quién vas y cuándo cierra.

export interface ClanEnGuerra {
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  xp_semana: number;
}

export type SituacionGuerra =
  // Hay un clan justo por encima: hay que alcanzarlo.
  | "persigue"
  // Tu clan va primero: el que viene detrás es la amenaza.
  | "lidera"
  // Primero y solo en la tabla.
  | "solo"
  // Tu clan todavía no suma Exp esta semana.
  | "sin_exp";

export interface EstadoGuerra {
  situacion: SituacionGuerra;
  miXp: number;
  // 1 = primero; 0 si tu clan todavía no está en la tabla.
  puesto: number;
  total: number;
  // El rival a mirar: el de arriba (persigue / sin_exp: el líder) o el de abajo (lidera).
  rival: ClanEnGuerra | null;
  // Exp que te separan del rival (siempre >= 0).
  diferencia: number;
  cierraMs: number;
}

export interface UltimaGuerra {
  semana_inicio: string;
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  xp_semana: number;
}

// El servidor corta con date_trunc('week', current_date): lunes 00:00 UTC.
export function finSemanaGuerraMs(ahora: number = Date.now()): number {
  const d = new Date(ahora);
  const dia = d.getUTCDay(); // 0 = domingo
  const hastaLunes = dia === 0 ? 1 : 8 - dia;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + hastaLunes);
}

export function estadoGuerra(ranking: readonly ClanEnGuerra[], miClanId: string, ahora: number = Date.now()): EstadoGuerra {
  const tabla = ranking.map((c) => ({ ...c, xp_semana: Number(c.xp_semana) || 0 })).sort((a, b) => b.xp_semana - a.xp_semana);
  const cierraMs = finSemanaGuerraMs(ahora);
  const i = tabla.findIndex((c) => c.clan_id === miClanId);
  if (i < 0) {
    const lider = tabla[0] ?? null;
    return { situacion: "sin_exp", miXp: 0, puesto: 0, total: tabla.length, rival: lider, diferencia: lider?.xp_semana ?? 0, cierraMs };
  }
  const miXp = tabla[i].xp_semana;
  if (i > 0) {
    const rival = tabla[i - 1];
    return { situacion: "persigue", miXp, puesto: i + 1, total: tabla.length, rival, diferencia: Math.max(0, rival.xp_semana - miXp), cierraMs };
  }
  const siguiente = tabla[1] ?? null;
  if (!siguiente) return { situacion: "solo", miXp, puesto: 1, total: tabla.length, rival: null, diferencia: 0, cierraMs };
  return { situacion: "lidera", miXp, puesto: 1, total: tabla.length, rival: siguiente, diferencia: Math.max(0, miXp - siguiente.xp_semana), cierraMs };
}

// «3 d 4 h», «5 h 12 min», «8 min».
export function textoCierreGuerra(cierraMs: number, ahora: number = Date.now()): string {
  const min = Math.max(0, Math.floor((cierraMs - ahora) / 60_000));
  const dias = Math.floor(min / 1440);
  const horas = Math.floor((min % 1440) / 60);
  if (dias > 0) return `${dias} d ${horas} h`;
  if (horas > 0) return `${horas} h ${min % 60} min`;
  return `${min} min`;
}

// Frase corta del estado, en español (la app; la web usa sus mensajes traducidos).
export function fraseGuerra(e: EstadoGuerra): string {
  const n = (x: number) => x.toLocaleString("es");
  const rival = e.rival ? (e.rival.tag ? `[${e.rival.tag}]` : e.rival.nombre) : "";
  switch (e.situacion) {
    case "persigue":
      return `#${e.puesto} de ${e.total} · a ${n(e.diferencia)} Exp de ${rival}`;
    case "lidera":
      return `#1 de ${e.total} · ${n(e.diferencia)} Exp por delante de ${rival}`;
    case "solo":
      return `#1 · ningún otro clan suma Exp esta semana`;
    case "sin_exp":
      return e.rival ? `Tu clan aún no suma Exp · ${rival} lidera con ${n(e.rival.xp_semana)}` : "Ningún clan suma Exp todavía: una partida y entran";
  }
}
