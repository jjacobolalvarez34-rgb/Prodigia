import { CAPSULAS, NOMBRE_RAREZA, type Rareza, type TipoCapsula } from "./catalogo";

// Qué puede traer cada cápsula y con qué probabilidad: espejo de contenido_capsula()
// en su última definición (0297_temas_app.sql; contenidoCapsulas.test.ts compara las
// filas). El peso de cada fila es su porcentaje (cada cápsula suma 100). La web y la
// app muestran esta tabla en «¿Qué trae cada cápsula?»; al abrir una cápsula, lo que
// manda es la base (la tabla se pide con contenido_capsula, así que si 0297 todavía no
// se corrió, se ve la de antes, sin temas).

export interface FilaContenido {
  premio: string;
  peso: number;
  minimo: number;
  maximo: number;
}

const f = (premio: string, peso: number, minimo = 1, maximo = 1): FilaContenido => ({ premio, peso, minimo, maximo });

export const CONTENIDO_CAPSULAS: Record<TipoCapsula, FilaContenido[]> = {
  diaria: [f("chispas", 70, 100, 140), f("hielo", 10), f("tiempo_extra", 10), f("escudo", 10)],
  misiones: [f("chispas", 70, 100, 140), f("hielo", 10), f("tiempo_extra", 10), f("escudo", 10)],
  racha: [f("chispas", 60, 120, 220), f("cosmetico_comun", 25), f("cosmetico_raro", 15)],
  nivel: [f("chispas", 80, 100, 160), f("cosmetico_raro", 20)],
  ciudad: [f("coleccion", 100)],
  liga: [f("chispas", 100, 100, 180)],
  liga_bronce: [f("chispas", 60, 150, 260), f("cosmetico_raro", 40)],
  liga_plata: [f("cosmetico_raro", 60), f("cosmetico_epico", 40)],
  liga_oro: [f("cosmetico_epico", 60), f("cosmetico_legendario", 40)],
  coleccion: [f("marco_coleccion", 100)],
  // Las cuatro más poderosas pueden traer un tema de la app (0297).
  pro: [f("cosmetico_epico", 50), f("cosmetico_legendario", 27), f("chispas", 15, 150, 300), f("tema_app", 8)],
  estelar: [f("cosmetico_raro", 50), f("cosmetico_epico", 40), f("cosmetico_legendario", 10)],
  supernova: [f("cosmetico_epico", 55), f("cosmetico_legendario", 35), f("tema_app", 10)],
  plata: [f("chispas", 40, 150, 260), f("cosmetico_comun", 30), f("cosmetico_raro", 30)],
  oro: [f("cosmetico_raro", 50), f("cosmetico_epico", 35), f("chispas", 15, 250, 400)],
  prisma: [f("cosmetico_epico", 55), f("cosmetico_legendario", 35), f("tema_app", 10)],
  alineacion: [f("cosmetico_epico", 65), f("cosmetico_legendario", 27), f("tema_app", 8)],
  temporada: [f("pieza_evento", 45), f("cosmetico_epico", 35), f("cosmetico_legendario", 20)],
};

// Cómo se consigue cada una (mismas reglas que la base: revisar_recompensas 0249,
// fusionar_capsulas 0290, comprar_capsula_con_cometas 0287, paquetes 0291, Pro 0283,
// temporadas de rankeds 0296).
export const COMO_SE_CONSIGUE: Record<TipoCapsula, string> = {
  diaria: "Con tu primera partida del día (y una más al día viendo un anuncio).",
  misiones: "Al reclamar las 3 misiones del día.",
  racha: "Cada 7 días seguidos cumpliendo tu meta diaria.",
  nivel: "Cada vez que subes de nivel de cuenta.",
  ciudad: "Al llegar a los niveles 10, 20, 30… de un mundo y al dominarlo.",
  liga: "Al cerrar la liga semanal fuera del top 50, o la temporada de rankeds en Hierro.",
  liga_bronce: "Al cerrar la liga semanal en el top 50, o la temporada de rankeds en Bronce.",
  liga_plata: "Al cerrar la liga semanal en el top 10, o la temporada de rankeds en Plata.",
  liga_oro: "Al cerrar la liga semanal en el top 3, o la temporada de rankeds en Oro o más.",
  coleccion: "Al completar la colección de una ciudad.",
  pro: "Con Prodigia Pro: 2 cada semana.",
  estelar: "Con Cometas (120, o 5 por 500), o al cerrar la temporada de rankeds en Platino.",
  supernova: "Con Cometas (300, o 3 por 750), o al cerrar la temporada de rankeds en Diamante o Prodigio.",
  plata: "Fusionando 3 cápsulas de nivel 1 (diaria, misiones, nivel o liga) y 50 Chispas.",
  oro: "Fusionando 3 cápsulas de nivel 2 (racha, liga Bronce o plata) y 150 Chispas.",
  prisma: "Fusionando 3 cápsulas de nivel 3 (liga Plata u oro) y 400 Chispas, o al cerrar la temporada de rankeds en Prodigio.",
  alineacion: "Jugando 3 partidas durante la Gran Alineación.",
  temporada: "Con Cometas mientras dura un evento (por ejemplo, Halloween).",
};

// Grupos para la guía, de lo más común a lo más poderoso.
export const GRUPOS_CAPSULAS: { id: "jugando" | "liga" | "fusion" | "cometas" | "pro"; titulo: string; tipos: TipoCapsula[] }[] = [
  { id: "jugando", titulo: "Jugando", tipos: ["diaria", "misiones", "racha", "nivel", "ciudad", "coleccion", "alineacion"] },
  { id: "liga", titulo: "Liga y rankeds", tipos: ["liga", "liga_bronce", "liga_plata", "liga_oro"] },
  { id: "fusion", titulo: "Fusión", tipos: ["plata", "oro", "prisma"] },
  { id: "cometas", titulo: "Con Cometas", tipos: ["estelar", "supernova", "temporada"] },
  { id: "pro", titulo: "Prodigia Pro", tipos: ["pro"] },
];

// Las que pueden traer un tema de la app.
export const CAPSULAS_CON_TEMAS: TipoCapsula[] = (Object.keys(CONTENIDO_CAPSULAS) as TipoCapsula[]).filter((t) => CONTENIDO_CAPSULAS[t].some((x) => x.premio === "tema_app"));

// Porcentaje de una fila dentro de su cápsula (los pesos ya suman 100, pero la tabla
// que llega de la base puede ser otra: siempre se calcula sobre el total).
export function porcentaje(filas: { peso: number }[], fila: { peso: number }): string {
  const total = filas.reduce((a, x) => a + x.peso, 0) || 1;
  const p = (fila.peso / total) * 100;
  return `${Number.isInteger(p) ? p : p.toFixed(1)} %`;
}

// Nombre legible de un premio, con cantidades.
export function nombrePremio(premio: string, minimo: number, maximo: number, mundo?: string | null): string {
  if (premio === "chispas") return minimo === maximo ? `${minimo} Chispas` : `${minimo} a ${maximo} Chispas`;
  if (premio === "hielo") return "1 hielo (congela el reloj)";
  if (premio === "tiempo_extra") return "1 tiempo extra (+3 segundos)";
  if (premio === "escudo") return "1 escudo de racha";
  if (premio.startsWith("cosmetico_")) {
    const r = premio.slice(10) as Rareza;
    return NOMBRE_RAREZA[r] ? `Un cosmético ${NOMBRE_RAREZA[r].toLowerCase()} al azar` : premio;
  }
  if (premio === "tema_app") return "Un tema de la app que no tengas";
  if (premio === "coleccion") return mundo ? `Una pieza de la colección de la ciudad que te falte` : "Una pieza de la colección de la ciudad que te falte";
  if (premio === "pieza_evento") return "Una pieza de la colección del evento que te falte";
  if (premio === "marco_coleccion") return "El marco animado de colección de la ciudad";
  return premio.replace(/_/g, " ");
}

export function nombreCapsula(tipo: TipoCapsula): string {
  return CAPSULAS[tipo]?.nombre ?? tipo;
}
