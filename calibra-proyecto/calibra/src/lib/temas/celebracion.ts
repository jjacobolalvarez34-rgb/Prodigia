import type { IdTema } from "./calendario";
import type { TipoParticula } from "./dibujos";

// Que TODO celebre la fecha (PLAN_FESTIVIDADES.md §6, PARIDAD_EVENTOS.md): lo que cada
// evento suma además de su tema visual (temas.ts). Por ahora lo usa la galería de
// diseño para que el usuario lo apruebe (pendiente 83); después lo leen la web y la app.
// Textos con {nombre} = el nombre del jugador.

export type DondeMinievento = "ranked" | "amigos" | "partida" | "inicio" | "bazar";

export interface Celebracion {
  // Saludo del Inicio.
  saludo: string;
  // La palabra del botón principal de jugar.
  boton: string;
  // Adorno en las esquinas de las tarjetas (mundos, misiones, la pregunta).
  esquina: TipoParticula;
  // Acierto: el «+N» y el estallido con los colores de la fecha y su instrumento.
  acierto: { colores: [string, string]; instrumento: string };
  // Frase del resultado cuando la partida es perfecta.
  perfecta: string;
  // Minievento dentro del evento (uno por fecha; los grandes, uno por semana).
  minievento: { nombre: string; texto: string; donde: DondeMinievento };
  // La fecha en las Rankeds (null: las rankeds solo llevan la piel).
  ranked: { nombre: string; texto: string } | null;
  // La fecha en Amigos (null: solo la piel).
  amigos: { accion: string; texto: string } | null;
  // Avisos: al empezar, a mitad y el último día.
  avisos: [string, string, string];
  // Para las fechas sin partículas propias: un símbolo en el logo y en el cartel.
  simbolo?: string;
}

export const CELEBRACIONES: Record<IdTema, Celebracion> = {
  halloween: {
    saludo: "Truco o trato, {nombre}",
    boton: "¡Truco o trato!",
    esquina: "murcielago",
    acierto: { colores: ["#FF8A1F", "#FFD27A"], instrumento: "Crujido de hojas y un órgano suave" },
    perfecta: "¡Los esqueletos bailan por ti!",
    minievento: { nombre: "La noche del esqueleto", texto: "El sábado 31, cada acierto en Anatomía vale doble de Caramelos y el esqueleto brilla en la oscuridad.", donde: "partida" },
    ranked: { nombre: "Duelo de la luna llena", texto: "Ganar una ranked da 3 Caramelos. El rival aparece con su sombrero de bruja." },
    amigos: { accion: "Dar un dulce", texto: "Regálale un Caramelo a un amigo una vez al día: los dos ganan uno." },
    avisos: ["La Noche de los esqueletos empezó: hay Caramelos esperándote.", "Te faltan piezas de la colección. Quedan 4 días de Halloween.", "Último día de Halloween: canjea tus Caramelos antes de medianoche."],
  },
  muertos: {
    saludo: "Hoy recordamos, {nombre}",
    boton: "Encender una vela",
    esquina: "petalo",
    acierto: { colores: ["#FF9F1C", "#FF5D8F"], instrumento: "Campanita de barro" },
    perfecta: "La ofrenda quedó completa.",
    minievento: { nombre: "La ofrenda", texto: "Cada día, una pregunta de Historia sobre un personaje que ya no está; acertarla enciende una vela en tu ofrenda.", donde: "inicio" },
    ranked: null,
    amigos: { accion: "Dejar una flor", texto: "Deja una flor de cempasúchil en la placa de un amigo." },
    avisos: ["Día de Muertos: la ofrenda ya está puesta en las 15 ciudades.", "Te queda una vela por encender en tu ofrenda.", "Último día de la ofrenda."],
  },
  diwali: {
    saludo: "Que tu día brille, {nombre}",
    boton: "Encender lámparas",
    esquina: "chispa",
    acierto: { colores: ["#FFC53D", "#FF5D8F"], instrumento: "Campanita de templo" },
    perfecta: "Encendiste todas las lámparas.",
    minievento: { nombre: "Enciende 100 lámparas", texto: "Cada acierto enciende una lámpara de tu ciudad. Con 100, la ciudad entera se ilumina.", donde: "partida" },
    ranked: { nombre: "Duelo de luces", texto: "El ganador enciende 10 lámparas de su ciudad." },
    amigos: { accion: "Enviar dulces", texto: "Manda una caja de dulces: cuenta para la misión de la semana." },
    avisos: ["Diwali empezó: enciende tus lámparas.", "Tu ciudad lleva {n} lámparas encendidas.", "Última noche de Diwali."],
  },
  viernes_estelar: {
    saludo: "Viernes Estelar, {nombre}",
    boton: "Ver ofertas",
    esquina: "estrella",
    acierto: { colores: ["#5DE4FF", "#FFC53D"], instrumento: "El de siempre" },
    perfecta: "¡Partida estelar!",
    minievento: { nombre: "Estrella fugaz", texto: "Cada día cae una oferta sorpresa en el Bazar durante 2 horas.", donde: "bazar" },
    ranked: null,
    amigos: null,
    avisos: ["Viernes Estelar: ofertas reales en el Bazar por 4 días.", "Cayó una estrella fugaz en el Bazar: oferta por 2 horas.", "Último día de ofertas."],
  },
  navidad: {
    saludo: "Felices fiestas, {nombre}",
    boton: "¡A jugar!",
    esquina: "nieve",
    acierto: { colores: ["#FFFFFF", "#E63946"], instrumento: "Cascabel" },
    perfecta: "¡Jo jo jo! Partida perfecta.",
    minievento: { nombre: "Calendario de adviento", texto: "Del 1 al 24, una casilla por día con un regalo; los domingos, una cápsula del evento.", donde: "inicio" },
    ranked: { nombre: "Guerra de bolas de nieve", texto: "Semana 2: cada ranked ganada lanza una bola de nieve a la ciudad rival (marcador entre ciudades)." },
    amigos: { accion: "Regalo bajo el árbol", texto: "Deja un regalo bajo el árbol de un amigo; se abre el 24." },
    avisos: ["Navidad llegó a las ciudades: abre la casilla 1 del calendario.", "Hoy hay casilla nueva en tu calendario de adviento.", "Noche buena: doble de todo hasta medianoche."],
  },
  anio_nuevo: {
    saludo: "Feliz año nuevo, {nombre}",
    boton: "Empezar el año",
    esquina: "confeti",
    acierto: { colores: ["#FFC53D", "#A794FF"], instrumento: "Chispa de bengala" },
    perfecta: "¡Empezaste el año perfecto!",
    minievento: { nombre: "Reto 2027", texto: "Entre toda la comunidad, 2027 operaciones de Numeria en un día; si se llega, cápsula para todos.", donde: "inicio" },
    ranked: { nombre: "Primera ranked del año", texto: "La primera ranked ganada del año da una insignia con el año." },
    amigos: { accion: "Brindar", texto: "Brinda con tus amigos: el que más brindis recibe gana un título." },
    avisos: ["Último día del año: cuenta regresiva a las 23:00.", "¡Feliz año nuevo! Tu cápsula de regalo te espera.", "Termina la fiesta de año nuevo."],
  },
  anio_nuevo_lunar: {
    saludo: "Feliz año nuevo lunar, {nombre}",
    boton: "Seguir al dragón",
    esquina: "farol",
    acierto: { colores: ["#E63946", "#FFC53D"], instrumento: "Gong pequeño" },
    perfecta: "El dragón te saluda.",
    minievento: { nombre: "Sobres rojos", texto: "Cada día, 3 sobres rojos escondidos en las misiones: cada uno trae Chispas.", donde: "inicio" },
    ranked: { nombre: "Danza del dragón", texto: "Las rankeds en racha encienden faroles en tu ciudad." },
    amigos: { accion: "Dar un sobre rojo", texto: "Regala un sobre rojo con Chispas a un amigo." },
    avisos: ["Año Nuevo Lunar: los faroles ya suben en las ciudades.", "Te quedan sobres rojos por abrir.", "Último día de los faroles."],
  },
  amor_amistad: {
    saludo: "Feliz día de la amistad, {nombre}",
    boton: "Jugar con amigos",
    esquina: "corazon",
    acierto: { colores: ["#FF5D8F", "#FFB3C7"], instrumento: "Dos notas que se juntan" },
    perfecta: "Partida para enmarcar.",
    minievento: { nombre: "Dúo de la amistad", texto: "Juega un duelo amistoso con un amigo: los dos ganan una pieza.", donde: "amigos" },
    ranked: null,
    amigos: { accion: "Regalar", texto: "Los regalos a amigos dan el doble y cuentan para la misión de la semana." },
    avisos: ["Amor y amistad: los regalos a tus amigos dan doble.", "Tienes amigos que todavía no recibieron tu regalo.", "Último día para regalar doble."],
  },
  carnaval: {
    saludo: "¡Que empiece el carnaval, {nombre}!",
    boton: "¡A la comparsa!",
    esquina: "confeti",
    acierto: { colores: ["#3DDC97", "#FFC53D"], instrumento: "Golpe de tambor" },
    perfecta: "¡La comparsa te aplaude!",
    minievento: { nombre: "Comparsa", texto: "Melodía con ritmos de carnaval y una tabla de puntaje del fin de semana.", donde: "partida" },
    ranked: { nombre: "Batalla de comparsas", texto: "Las ciudades compiten: cada ranked ganada suma a tu ciudad." },
    amigos: { accion: "Invitar a la comparsa", texto: "Arma una comparsa de 3 amigos: si los 3 juegan, todos ganan." },
    avisos: ["¡Carnaval! La comparsa sale hoy.", "Tu ciudad va {puesto}.ª en la batalla de comparsas.", "Último día de carnaval."],
  },
  dia_pi: {
    saludo: "Feliz día de π, {nombre}",
    boton: "Reto de 3,14 min",
    esquina: "estrella",
    acierto: { colores: ["#9B85FF", "#5DE4FF"], instrumento: "El de siempre" },
    perfecta: "Irracionalmente perfecta.",
    minievento: { nombre: "3,14 minutos", texto: "Un reto de Numeria y Trigonometría de 3,14 minutos; el mejor puntaje gana el título «Irracional».", donde: "partida" },
    ranked: null,
    amigos: null,
    avisos: ["Hoy es 3,14: el reto de π está abierto.", "Quedan horas para el reto de π.", "Último rato del día de π."],
    simbolo: "π",
  },
  holi: {
    saludo: "¡Feliz Holi, {nombre}!",
    boton: "Lanzar colores",
    esquina: "polvo",
    acierto: { colores: ["#FF5D8F", "#3DDC97"], instrumento: "Tambor dhol" },
    perfecta: "¡Tu ciudad quedó llena de color!",
    minievento: { nombre: "Ciudad de colores", texto: "Cada acierto tiñe tu ciudad de un color; al final del día, se comparte.", donde: "partida" },
    ranked: null,
    amigos: { accion: "Lanzar color", texto: "Lánzale polvo de color a la placa de un amigo." },
    avisos: ["Holi: los colores llegaron a las ciudades.", "Tu ciudad va {pct} % pintada.", "Último día de Holi."],
  },
  pascua: {
    saludo: "Felices pascuas, {nombre}",
    boton: "Buscar huevos",
    esquina: "huevo",
    acierto: { colores: ["#9BE7FF", "#FFB3C7"], instrumento: "Un «pop»" },
    perfecta: "¡Encontraste todos los huevos!",
    minievento: { nombre: "Huevos escondidos", texto: "Un huevo escondido por día en alguna pantalla de la app: tocarlo da Fichas. Con los 15, la pieza grande.", donde: "inicio" },
    ranked: null,
    amigos: { accion: "Esconder un huevo", texto: "Esconde un huevo en la placa de un amigo para que lo encuentre." },
    avisos: ["Pascua: hay huevos escondidos en la app.", "Hoy hay un huevo nuevo escondido.", "Último día para encontrar huevos."],
  },
  linternas: {
    saludo: "Buenas noches de linternas, {nombre}",
    boton: "Jugar",
    esquina: "linterna",
    acierto: { colores: ["#FFC53D", "#3DDC97"], instrumento: "El de siempre" },
    perfecta: "Una noche serena.",
    minievento: { nombre: "Noches de luna", texto: "Estadística con las fases de la luna; tono sereno, sin premios de apuro.", donde: "partida" },
    ranked: null,
    amigos: null,
    avisos: ["Noches de linternas: la luna creciente está sobre las ciudades.", "Una linterna más sube en tu ciudad.", "Última noche de linternas."],
  },
  dia_tierra: {
    saludo: "Feliz día de la Tierra, {nombre}",
    boton: "Plantar jugando",
    esquina: "hoja",
    acierto: { colores: ["#3DDC97", "#5DE4FF"], instrumento: "El de siempre" },
    perfecta: "¡Plantaste un bosque!",
    minievento: { nombre: "Bosque compartido", texto: "Cada misión cumplida planta un árbol en una ciudad que es de todos.", donde: "inicio" },
    ranked: null,
    amigos: { accion: "Plantar juntos", texto: "Planta un árbol con un amigo: vale doble." },
    avisos: ["Día de la Tierra: cada misión planta un árbol.", "El bosque compartido ya tiene {n} árboles.", "Últimas horas del día de la Tierra."],
  },
  dia_musica: {
    saludo: "Feliz día de la música, {nombre}",
    boton: "Tocar",
    esquina: "nota",
    acierto: { colores: ["#FFC53D", "#A794FF"], instrumento: "Cada acierto es una nota de una melodía que se completa" },
    perfecta: "¡Tocaste la melodía completa!",
    minievento: { nombre: "Melodía al doble", texto: "Melodía da el doble de Chispas y un sonido de acierto de regalo.", donde: "partida" },
    ranked: null,
    amigos: null,
    avisos: ["Día de la música: Melodía al doble.", "Te falta una partida para el sonido de regalo.", "Últimas horas del día de la música."],
  },
  vuelta_clases: {
    saludo: "Buen regreso a clases, {nombre}",
    boton: "Empezar la semana",
    esquina: "estrella",
    acierto: { colores: ["#5DE4FF", "#FFC53D"], instrumento: "«Visto bueno» de lápiz" },
    perfecta: "¡Diez de diez!",
    minievento: { nombre: "Semana de repaso", texto: "Misiones más fáciles y premio doble por la racha durante una semana.", donde: "inicio" },
    ranked: null,
    amigos: { accion: "Estudiar juntos", texto: "Juega un duelo amistoso con un compañero: los dos suman a la racha." },
    avisos: ["Vuelta a clases: esta semana las misiones son más fáciles.", "Tu racha cuenta doble esta semana.", "Último día de la semana de repaso."],
  },
};
