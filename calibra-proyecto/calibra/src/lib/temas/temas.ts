import { hoyUtc, temaDeFecha, type FaseTema, type IdTema, type TemaHoy } from "./calendario";
import type { AdornoCapsula, TipoAccesorio, TipoParticula, TipoPasante } from "./dibujos";

// Ficha de cada festividad (docs/eventos/PLAN_FESTIVIDADES.md §3): qué capas usa y con
// qué colores. La web y la app leen esto mismo; cambiar una fiesta es cambiar sus datos.

// Adornos de las ciudades (cada plataforma sabe dibujarlos sobre sus edificios).
export type AdornoCiudad = "nieve_techos" | "luces" | "arbol" | "calabazas" | "luna_llena" | "papel_picado" | "faroles" | "corazones" | "serpentinas" | "diyas" | "huevos" | "plantas" | "fuegos" | "polvo_colores" | "linternas";

// Borde de los botones principales.
export type BordeBoton = "caramelo" | "calabaza" | "dorado" | "corazones" | "rombos" | "papel_picado" | "verde";

export interface Tema {
  id: IdTema;
  nombre: string;
  nombreEn: string;
  escala: "grande" | "media" | "chica" | "tienda";
  acento: string;
  acento2: string;
  particulas?: { tipo: TipoParticula; colores: string[]; movimiento: "cae" | "sube" | "flota"; cantidad: number };
  ciudad?: AdornoCiudad[];
  pasante?: TipoPasante;
  borde?: BordeBoton;
  accesorio?: TipoAccesorio;
  capsula?: { adorno: AdornoCapsula; colores?: [string, string]; particulas: TipoParticula };
  constelacion?: { estrella: TipoParticula; color: string };
  // Frase corta para el cartel del Inicio en cada fase.
  frase: { decoracion: string; evento: string; decoracionEn: string; eventoEn: string };
}

export const TEMAS: Record<IdTema, Tema> = {
  halloween: {
    id: "halloween",
    nombre: "Noche de los esqueletos",
    nombreEn: "Night of the Skeletons",
    escala: "grande",
    acento: "#FF8A1F",
    acento2: "#7C3AED",
    particulas: { tipo: "hoja", colores: ["#E07A2E", "#B85C1E", "#FFB347"], movimiento: "cae", cantidad: 14 },
    ciudad: ["calabazas", "luna_llena"],
    pasante: "bruja",
    borde: "calabaza",
    accesorio: "sombrero_bruja",
    capsula: { adorno: "calabaza", colores: ["#FF8A1F", "#E0660F"], particulas: "murcielago" },
    constelacion: { estrella: "murcielago", color: "#FF8A1F" },
    frase: { decoracion: "Algo se acerca a las ciudades…", evento: "¡Noche de los esqueletos! Truco o trato", decoracionEn: "Something is coming to the cities…", eventoEn: "Night of the Skeletons! Trick or treat" },
  },
  muertos: {
    id: "muertos",
    nombre: "La ofrenda",
    nombreEn: "The Offering",
    escala: "media",
    acento: "#FF9F1C",
    acento2: "#FF5D8F",
    particulas: { tipo: "petalo", colores: ["#FF9F1C", "#FFBF47"], movimiento: "cae", cantidad: 12 },
    ciudad: ["papel_picado"],
    borde: "papel_picado",
    accesorio: "corona_flores",
    capsula: { adorno: "papel_picado", particulas: "petalo" },
    constelacion: { estrella: "petalo", color: "#FF9F1C" },
    frase: { decoracion: "", evento: "Día de Muertos: la ofrenda", decoracionEn: "", eventoEn: "Day of the Dead: the offering" },
  },
  diwali: {
    id: "diwali",
    nombre: "Fiesta de las luces",
    nombreEn: "Festival of Lights",
    escala: "media",
    acento: "#FFC53D",
    acento2: "#FF5D8F",
    particulas: { tipo: "chispa", colores: ["#FFD36B", "#FFB347"], movimiento: "sube", cantidad: 12 },
    ciudad: ["diyas", "luces", "fuegos"],
    borde: "dorado",
    capsula: { adorno: "diya", colores: ["#B35400", "#FFB347"], particulas: "chispa" },
    constelacion: { estrella: "chispa", color: "#FFC53D" },
    frase: { decoracion: "Las ciudades preparan sus lámparas", evento: "Diwali: enciende las ciudades", decoracionEn: "The cities are lighting their lamps", eventoEn: "Diwali: light up the cities" },
  },
  viernes_estelar: {
    id: "viernes_estelar",
    nombre: "Viernes Estelar",
    nombreEn: "Starry Friday",
    escala: "tienda",
    acento: "#5DE4FF",
    acento2: "#FFC53D",
    frase: { decoracion: "", evento: "Viernes Estelar: ofertas en el Bazar", decoracionEn: "", eventoEn: "Starry Friday: deals in the Bazaar" },
  },
  navidad: {
    id: "navidad",
    nombre: "Navidad en las ciudades",
    nombreEn: "Christmas in the Cities",
    escala: "grande",
    acento: "#E63946",
    acento2: "#2A9D5C",
    particulas: { tipo: "nieve", colores: ["#FFFFFF", "#E8F6FF"], movimiento: "cae", cantidad: 22 },
    ciudad: ["nieve_techos", "luces", "arbol"],
    pasante: "trineo",
    borde: "caramelo",
    accesorio: "gorro_navidad",
    capsula: { adorno: "mono", colores: ["#2A9D5C", "#1E7A45"], particulas: "nieve" },
    constelacion: { estrella: "nieve", color: "#E8F6FF" },
    frase: { decoracion: "Empieza a nevar en las ciudades", evento: "Navidad en las ciudades", decoracionEn: "It's starting to snow in the cities", eventoEn: "Christmas in the cities" },
  },
  anio_nuevo: {
    id: "anio_nuevo",
    nombre: "Cuenta regresiva",
    nombreEn: "Countdown",
    escala: "media",
    acento: "#FFC53D",
    acento2: "#A794FF",
    particulas: { tipo: "confeti", colores: ["#FFC53D", "#FFFFFF", "#A794FF", "#5DE4FF"], movimiento: "cae", cantidad: 16 },
    ciudad: ["fuegos"],
    borde: "dorado",
    accesorio: "gafas_fiesta",
    capsula: { adorno: "estrellas", colores: ["#2A1F5C", "#FFC53D"], particulas: "confeti" },
    constelacion: { estrella: "estrella", color: "#FFC53D" },
    frase: { decoracion: "Se viene la cuenta regresiva", evento: "¡Feliz año nuevo!", decoracionEn: "The countdown is coming", eventoEn: "Happy new year!" },
  },
  anio_nuevo_lunar: {
    id: "anio_nuevo_lunar",
    nombre: "Faroles y dragones",
    nombreEn: "Lanterns and Dragons",
    escala: "media",
    acento: "#E63946",
    acento2: "#FFC53D",
    particulas: { tipo: "farol", colores: ["#E63946"], movimiento: "sube", cantidad: 8 },
    ciudad: ["faroles"],
    pasante: "dragon",
    borde: "dorado",
    capsula: { adorno: "sobre_rojo", colores: ["#E63946", "#A4161A"], particulas: "chispa" },
    constelacion: { estrella: "farol", color: "#FFC53D" },
    frase: { decoracion: "Las ciudades cuelgan sus faroles", evento: "Año Nuevo Lunar", decoracionEn: "The cities hang their lanterns", eventoEn: "Lunar New Year" },
  },
  amor_amistad: {
    id: "amor_amistad",
    nombre: "Amor y amistad",
    nombreEn: "Love and Friendship",
    escala: "chica",
    acento: "#FF5D8F",
    acento2: "#FFB3C7",
    particulas: { tipo: "corazon", colores: ["#FF5D8F", "#FF8FB1"], movimiento: "sube", cantidad: 10 },
    ciudad: ["corazones"],
    pasante: "globo_corazon",
    borde: "corazones",
    accesorio: "diadema_corazones",
    capsula: { adorno: "corazon", colores: ["#FF5D8F", "#C9184A"], particulas: "corazon" },
    constelacion: { estrella: "corazon", color: "#FF5D8F" },
    frase: { decoracion: "Algo bonito se acerca", evento: "Amor y amistad: regala a tus amigos", decoracionEn: "Something lovely is coming", eventoEn: "Love and friendship: send gifts to friends" },
  },
  carnaval: {
    id: "carnaval",
    nombre: "Carnaval",
    nombreEn: "Carnival",
    escala: "media",
    acento: "#3DDC97",
    acento2: "#FFC53D",
    particulas: { tipo: "confeti", colores: ["#3DDC97", "#FFC53D", "#FF5D8F", "#5DE4FF", "#A794FF"], movimiento: "cae", cantidad: 18 },
    ciudad: ["serpentinas"],
    borde: "rombos",
    accesorio: "antifaz",
    capsula: { adorno: "estrellas", colores: ["#7C5CFF", "#3DDC97"], particulas: "confeti" },
    constelacion: { estrella: "estrella", color: "#3DDC97" },
    frase: { decoracion: "Se escuchan tambores…", evento: "¡Carnaval!", decoracionEn: "Drums in the distance…", eventoEn: "Carnival!" },
  },
  dia_pi: {
    id: "dia_pi",
    nombre: "Día de Pi",
    nombreEn: "Pi Day",
    escala: "chica",
    acento: "#9B85FF",
    acento2: "#5DE4FF",
    frase: { decoracion: "", evento: "Día de Pi: 3,14 minutos de reto", decoracionEn: "", eventoEn: "Pi Day: a 3.14-minute challenge" },
  },
  holi: {
    id: "holi",
    nombre: "Festival de colores",
    nombreEn: "Festival of Colors",
    escala: "chica",
    acento: "#FF5D8F",
    acento2: "#3DDC97",
    particulas: { tipo: "polvo", colores: ["#FF5D8F", "#FFC53D", "#3DDC97", "#5DE4FF", "#A794FF"], movimiento: "flota", cantidad: 10 },
    ciudad: ["polvo_colores"],
    capsula: { adorno: "estrellas", particulas: "polvo" },
    frase: { decoracion: "Los colores están por llegar", evento: "Holi: el festival de colores", decoracionEn: "The colors are coming", eventoEn: "Holi: the festival of colors" },
  },
  pascua: {
    id: "pascua",
    nombre: "Huevos escondidos",
    nombreEn: "Hidden Eggs",
    escala: "media",
    acento: "#9BE7FF",
    acento2: "#FFB3C7",
    particulas: { tipo: "petalo", colores: ["#FFB3C7", "#FFFFFF"], movimiento: "cae", cantidad: 10 },
    ciudad: ["huevos", "plantas"],
    pasante: "conejo",
    borde: "verde",
    accesorio: "orejas_conejo",
    capsula: { adorno: "huevo", colores: ["#9BE7FF", "#FFB3C7"], particulas: "petalo" },
    constelacion: { estrella: "huevo", color: "#FFB3C7" },
    frase: { decoracion: "Alguien escondió huevos en las ciudades", evento: "Pascua: encuentra los huevos escondidos", decoracionEn: "Someone hid eggs in the cities", eventoEn: "Easter: find the hidden eggs" },
  },
  linternas: {
    id: "linternas",
    nombre: "Noches de linternas",
    nombreEn: "Lantern Nights",
    escala: "chica",
    acento: "#FFC53D",
    acento2: "#3DDC97",
    particulas: { tipo: "linterna", colores: ["#FFB347"], movimiento: "sube", cantidad: 6 },
    ciudad: ["linternas"],
    pasante: "linternas",
    capsula: { adorno: "estrellas", colores: ["#0B4A35", "#FFC53D"], particulas: "estrella" },
    constelacion: { estrella: "estrella", color: "#FFC53D" },
    frase: { decoracion: "", evento: "Noches de linternas", decoracionEn: "", eventoEn: "Lantern nights" },
  },
  dia_tierra: {
    id: "dia_tierra",
    nombre: "Día de la Tierra",
    nombreEn: "Earth Day",
    escala: "chica",
    acento: "#3DDC97",
    acento2: "#5DE4FF",
    particulas: { tipo: "hoja", colores: ["#3DDC97", "#2A9D5C"], movimiento: "cae", cantidad: 8 },
    ciudad: ["plantas"],
    borde: "verde",
    frase: { decoracion: "", evento: "Día de la Tierra: planta árboles jugando", decoracionEn: "", eventoEn: "Earth Day: plant trees by playing" },
  },
  dia_musica: {
    id: "dia_musica",
    nombre: "Día de la Música",
    nombreEn: "Music Day",
    escala: "chica",
    acento: "#FFC53D",
    acento2: "#A794FF",
    particulas: { tipo: "nota", colores: ["#FFFFFF", "#FFC53D"], movimiento: "flota", cantidad: 8 },
    frase: { decoracion: "", evento: "Día de la Música: Melodía al doble", decoracionEn: "", eventoEn: "Music Day: double Sparks in Melodía" },
  },
  vuelta_clases: {
    id: "vuelta_clases",
    nombre: "Vuelta a clases",
    nombreEn: "Back to School",
    escala: "chica",
    acento: "#5DE4FF",
    acento2: "#FFC53D",
    accesorio: "lapiz",
    frase: { decoracion: "", evento: "Vuelta a clases: misiones más fáciles", decoracionEn: "", eventoEn: "Back to school: easier missions" },
  },
};

export interface TemaActivo {
  tema: Tema;
  fase: FaseTema;
  hoy: TemaHoy;
}

// Para ver un tema fuera de su fecha (pruebas y vistas previas): ?tema=navidad en la web.
let forzado: IdTema | null = null;
export function forzarTema(id: IdTema | null) {
  forzado = id;
}

export function temaActivo(ahora = Date.now()): TemaActivo | null {
  if (forzado) {
    const hoy = temaDeFecha(hoyUtc(ahora));
    return { tema: TEMAS[forzado], fase: "evento", hoy: hoy ?? { id: forzado, fase: "evento", rango: { id: forzado, decoracion: "", desde: "", hasta: "", cierre: false } } };
  }
  const hoy = temaDeFecha(hoyUtc(ahora));
  if (!hoy) return null;
  return { tema: TEMAS[hoy.id], fase: hoy.fase, hoy };
}

// En la decoración se ven el ambiente, las ciudades y la interfaz; el resto, en el evento.
export function capaVisible(t: TemaActivo | null, capa: "ambiente" | "ciudad" | "interfaz" | "pasante" | "capsula" | "constelacion"): boolean {
  if (!t) return false;
  if (t.fase === "evento") return true;
  return capa === "ambiente" || capa === "ciudad" || capa === "interfaz";
}
