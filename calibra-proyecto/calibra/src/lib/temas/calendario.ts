// Calendario de las festividades (docs/eventos/PLAN_FESTIVIDADES.md §2). Dice qué tema
// toca en una fecha y en qué fase está: «decoracion» (unos días antes), «evento» o
// «cierre» (un día para canjear Fichas). Fechas en UTC, como el resto del juego. Nunca
// hay dos temas a la vez: un evento en curso le gana a la decoración del siguiente; si
// dos eventos se pisan (Año Nuevo Lunar y Carnaval en 2027), se ve el que termina antes
// en sus días y el otro antes y después; entre decoraciones, la del evento más próximo.

import { DURACION_EVENTO_MS, proximaAlineacion } from "@/lib/ciudades/cicloDia";

export type IdTema =
  | "halloween"
  | "muertos"
  | "diwali"
  | "viernes_estelar"
  | "navidad"
  | "anio_nuevo"
  | "anio_nuevo_lunar"
  | "amor_amistad"
  | "carnaval"
  | "dia_pi"
  | "holi"
  | "pascua"
  | "linternas"
  | "dia_tierra"
  | "dia_musica"
  | "vuelta_clases";

export type FaseTema = "decoracion" | "evento" | "cierre";

// Momento exacto en que abre un evento: el comienzo de su primer día (UTC), salvo que una
// Gran Alineación lo cruce. Ningún evento abre durante la Alineación: abre cuando termina
// (pedido 2026-10-18: Halloween 2026 empieza el sábado 24 a las 21:00 de Colombia).
const VENTANA_ALINEACION_MS = 30 * 3_600_000;
export function inicioEventoMs(r: Pick<RangoTema, "desde">): number {
  const dia = Date.parse(`${r.desde}T00:00:00Z`);
  const alineacion = proximaAlineacion(dia - DURACION_EVENTO_MS);
  if (alineacion < dia + VENTANA_ALINEACION_MS) return Math.max(dia, alineacion + DURACION_EVENTO_MS);
  return dia;
}

export interface RangoTema {
  id: IdTema;
  decoracion: string; // primer día con decoración (YYYY-MM-DD)
  desde: string; // primer día del evento
  hasta: string; // último día del evento
  cierre: boolean; // ¿tiene un día de cierre para canjear?
}

// Fechas que dependen de la luna: se revisan cada año (PLAN_FESTIVIDADES.md §1).
const LUNARES: Record<"anio_nuevo_lunar" | "diwali" | "holi" | "linternas", Record<number, string>> = {
  anio_nuevo_lunar: { 2026: "02-17", 2027: "02-06", 2028: "01-26", 2029: "02-13", 2030: "02-03" },
  diwali: { 2026: "11-08", 2027: "10-29", 2028: "10-17", 2029: "11-05", 2030: "10-26" },
  holi: { 2026: "03-04", 2027: "03-22", 2028: "03-11", 2029: "03-01", 2030: "03-20" },
  // Fin del Ramadán (Eid al-Fitr); se confirma con la luna.
  linternas: { 2026: "03-20", 2027: "03-10", 2028: "02-27", 2029: "02-14", 2030: "02-04" },
};

const DIA = 86_400_000;

function aFecha(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

function aIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function mover(iso: string, dias: number): string {
  return aIso(aFecha(iso) + dias * DIA);
}

function f(anio: number, mmdd: string): string {
  return `${anio}-${mmdd}`;
}

// Domingo de Pascua (algoritmo gregoriano anónimo).
export function pascua(anio: number): string {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const g = Math.floor((8 * b + 13) / 25);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 19 * l) / 433);
  const mes = Math.floor((h + l - 7 * m + 90) / 25);
  const dia = (h + l - 7 * m + 33 * mes + 19) % 32;
  return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

// Cuarto jueves de noviembre (Acción de Gracias); el Viernes Estelar es el día siguiente.
function cuartoJuevesNoviembre(anio: number): string {
  const primero = new Date(Date.UTC(anio, 10, 1)).getUTCDay();
  const primerJueves = 1 + ((4 - primero + 7) % 7);
  return `${anio}-11-${String(primerJueves + 21).padStart(2, "0")}`;
}

function rango(id: IdTema, desde: string, hasta: string, diasDecoracion: number, cierre = false): RangoTema {
  return { id, decoracion: mover(desde, -diasDecoracion), desde, hasta, cierre };
}

// Todas las festividades que tocan un año (algunas empiezan el año anterior).
export function rangosDelAnio(anio: number): RangoTema[] {
  const p = pascua(anio);
  const lista: RangoTema[] = [
    rango("anio_nuevo", f(anio - 1, "12-31"), f(anio, "01-02"), 4),
    rango("dia_pi", f(anio, "03-14"), f(anio, "03-14"), 0),
    rango("dia_tierra", f(anio, "04-22"), f(anio, "04-22"), 0),
    rango("dia_musica", f(anio, "06-21"), f(anio, "06-21"), 0),
    rango("amor_amistad", f(anio, "02-12"), f(anio, "02-15"), 3),
    rango("carnaval", mover(p, -50), mover(p, -47), 3),
    rango("pascua", mover(p, -2), mover(p, 1), 5, true),
    rango("vuelta_clases", f(anio, "09-01"), f(anio, "09-07"), 0),
    rango("halloween", f(anio, "10-24"), f(anio, "10-31"), 4, true),
    rango("muertos", f(anio, "11-01"), f(anio, "11-02"), 0),
    rango("viernes_estelar", mover(cuartoJuevesNoviembre(anio), 1), mover(cuartoJuevesNoviembre(anio), 4), 0),
    rango("navidad", f(anio, "12-01"), f(anio, "12-26"), 5, true),
    rango("anio_nuevo", f(anio, "12-31"), f(anio + 1, "01-02"), 4),
  ];
  const lunar = (id: keyof typeof LUNARES, dias: number, deco: number) => {
    const fecha = LUNARES[id][anio];
    if (fecha) lista.push(rango(id, f(anio, fecha), mover(f(anio, fecha), dias - 1), deco));
  };
  lunar("anio_nuevo_lunar", 7, 3);
  lunar("diwali", 5, 2);
  lunar("holi", 2, 2);
  lunar("linternas", 3, 0);
  return lista;
}

export interface TemaHoy {
  id: IdTema;
  fase: FaseTema;
  rango: RangoTema;
}

// Qué tema toca en una fecha (YYYY-MM-DD), o null si ninguno.
export function temaDeFecha(iso: string): TemaHoy | null {
  const anio = Number(iso.slice(0, 4));
  const candidatos = [...rangosDelAnio(anio - 1), ...rangosDelAnio(anio), ...rangosDelAnio(anio + 1)];
  let mejor: TemaHoy | null = null;
  const peso = (t: TemaHoy) => (t.fase === "evento" ? 3 : t.fase === "cierre" ? 2 : 1);
  for (const r of candidatos) {
    let fase: FaseTema | null = null;
    if (iso >= r.desde && iso <= r.hasta) fase = "evento";
    else if (r.cierre && iso === mover(r.hasta, 1)) fase = "cierre";
    else if (iso >= r.decoracion && iso < r.desde) fase = "decoracion";
    if (!fase) continue;
    const t: TemaHoy = { id: r.id, fase, rango: r };
    const empate = mejor && peso(t) === peso(mejor);
    const gana = !mejor || peso(t) > peso(mejor) || (empate && (t.fase === "decoracion" ? r.desde < mejor!.rango.desde : r.hasta < mejor!.rango.hasta || (r.hasta === mejor!.rango.hasta && r.desde > mejor!.rango.desde)));
    if (gana) mejor = t;
  }
  return mejor;
}

export function hoyUtc(ahora = Date.now()): string {
  return aIso(ahora);
}

// Cuántos días faltan para que empiece el evento (0 = ya empezó).
export function diasParaEvento(t: TemaHoy, iso: string): number {
  return Math.max(0, Math.round((aFecha(t.rango.desde) - aFecha(iso)) / DIA));
}
