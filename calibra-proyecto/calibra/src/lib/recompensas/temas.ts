// Temas de la app (pedido 2026-10-12): cambian toda la estética de Prodigia (colores,
// letras, tarjetas y botones), nunca el contenido. Todavía no se pueden comprar: la
// tienda de la web y la de la app los muestran como «Próximamente». Las maquetas de
// cada uno están en docs/rediseno (esteticas.html).
//
// `colores` alimenta la miniatura de la tienda: fondo de la pantalla, tarjeta,
// borde, botón (acento) y un segundo color de detalle. `radio` y `borde` dan la
// forma de las tarjetas; `sombra` "dura" es la sombra corrida de las cartas.

export interface TemaApp {
  slug: string;
  nombre: string;
  inspiracion: string;
  descripcion: string;
  colores: { fondo: string; tarjeta: string; borde: string; acento: string; detalle: string; texto: string };
  radio: number;
  borde: number;
  sombra: "dura" | "suave" | "ninguna";
}

export const TEMAS_APP: TemaApp[] = [
  {
    slug: "roguelike",
    nombre: "Mesa de cartas",
    inspiracion: "Roguelikes indie",
    descripcion: "Cada tarjeta es una carta color hueso con contorno negro y sombra corrida, sobre una mesa que gira despacio. Letra pixelada.",
    colores: { fondo: "#3A2470", tarjeta: "#F4EDE0", borde: "#0D0A14", acento: "#3B7BFF", detalle: "#FF4D3D", texto: "#1A1426" },
    radio: 5,
    borde: 2,
    sombra: "dura",
  },
  {
    slug: "rpg",
    nombre: "Reino",
    inspiracion: "Fantasía RPG",
    descripcion: "Paneles azules con marco dorado, botones gordos que se hunden al tocarlos y títulos con contorno. Todo con volumen.",
    colores: { fondo: "#4A6FE8", tarjeta: "#1D2B6B", borde: "#FFB627", acento: "#3A86FF", detalle: "#3DDC97", texto: "#FFFFFF" },
    radio: 7,
    borde: 2,
    sombra: "suave",
  },
  {
    slug: "cozy",
    nombre: "Huerto",
    inspiracion: "Pixel art acogedor",
    descripcion: "Marcos de madera en tres tonos, papel cálido adentro y pasto de fondo. Píxeles grandes, todo amable.",
    colores: { fondo: "#5F9E3A", tarjeta: "#FBE2A8", borde: "#8A3F0A", acento: "#7ED957", detalle: "#FFB627", texto: "#3B1D07" },
    radio: 0,
    borde: 2,
    sombra: "ninguna",
  },
  {
    slug: "portatil",
    nombre: "Portátil",
    inspiracion: "Consolas de bolsillo de los 90",
    descripcion: "La pantalla de cuatro verdes con su trama de puntos. Bordes dobles y nada de curvas.",
    colores: { fondo: "#9BBC0F", tarjeta: "#9BBC0F", borde: "#0F380F", acento: "#0F380F", detalle: "#306230", texto: "#0F380F" },
    radio: 0,
    borde: 2,
    sombra: "ninguna",
  },
  {
    slug: "academia",
    nombre: "Biblioteca",
    inspiracion: "Dark academia",
    descripcion: "Cuero oscuro, páginas envejecidas y filetes de bronce. El violeta de Prodigia como tinta y botones de lacre.",
    colores: { fondo: "#21160F", tarjeta: "#DCCDAB", borde: "#A07D42", acento: "#5B3FC4", detalle: "#8A1F2B", texto: "#2A1A12" },
    radio: 2,
    borde: 1,
    sombra: "suave",
  },
  {
    slug: "mitologia",
    nombre: "Olimpo",
    inspiracion: "Mitología ilustrada",
    descripcion: "Negro profundo, fuego y oro. Esquinas cortadas en diagonal, grecas doradas y títulos tallados.",
    colores: { fondo: "#0C0606", tarjeta: "#1D0F0B", borde: "#B8862C", acento: "#E0482C", detalle: "#F2C14E", texto: "#F6E8CC" },
    radio: 0,
    borde: 1,
    sombra: "ninguna",
  },
  {
    slug: "suizo",
    nombre: "Imprenta",
    inspiracion: "Diseño editorial suizo",
    descripcion: "Blanco, negro y un solo color fuerte. Bordes gruesos, títulos enormes y la retícula a la vista.",
    colores: { fondo: "#FFFFFF", tarjeta: "#FFFFFF", borde: "#0A0A0A", acento: "#5B3CF5", detalle: "#FFB000", texto: "#0A0A0A" },
    radio: 0,
    borde: 2,
    sombra: "dura",
  },
  {
    slug: "papeleria",
    nombre: "Cuaderno",
    inspiracion: "Papelería japonesa",
    descripcion: "Papel cuadriculado, cinta washi, resaltador y sellos. Los colores de cada mundo en pastel.",
    colores: { fondo: "#FBFAF5", tarjeta: "#FFFFFF", borde: "#36314D", acento: "#B3A6FF", detalle: "#FFF07A", texto: "#36314D" },
    radio: 6,
    borde: 1,
    sombra: "dura",
  },
  {
    slug: "espacial",
    nombre: "Misión",
    inspiracion: "Carrera espacial retro",
    descripcion: "Consolas de control con tornillos, luces piloto, retícula de puntos y naranja de cohete.",
    colores: { fondo: "#0A1020", tarjeta: "#152140", borde: "#2C3B62", acento: "#FF8A3D", detalle: "#3AC7C0", texto: "#F1E6CF" },
    radio: 7,
    borde: 1,
    sombra: "ninguna",
  },
  {
    slug: "geometria",
    nombre: "Atardecer",
    inspiracion: "Geometría imposible",
    descripcion: "Cielo pastel en degradé, bloques con canto sólido como piezas isométricas y letra fina y espaciada.",
    colores: { fondo: "#F7DCCF", tarjeta: "#FFF6EF", borde: "#E0BFD8", acento: "#9D8DF1", detalle: "#EF8B78", texto: "#3D3358" },
    radio: 3,
    borde: 0,
    sombra: "dura",
  },
  {
    slug: "arcade",
    nombre: "Recreativa",
    inspiracion: "Salones arcade de los 90",
    descripcion: "Negro de pantalla de tubo, neón magenta y cian, bordes de píxel y números de marcador.",
    colores: { fondo: "#07020F", tarjeta: "#0D0520", borde: "#2FF3FF", acento: "#FFE14D", detalle: "#FF2FD6", texto: "#F6F2FF" },
    radio: 0,
    borde: 1,
    sombra: "ninguna",
  },
  {
    slug: "atlas",
    nombre: "Atlas",
    inspiracion: "Mapas antiguos",
    descripcion: "Papel de mapa con curvas de nivel, tinta azul de imprenta, cartelas de doble filete y los mundos en acuarela.",
    colores: { fondo: "#EFE3C6", tarjeta: "#F6EDD6", borde: "#3A3324", acento: "#1F2C45", detalle: "#C4502A", texto: "#1F2C45" },
    radio: 2,
    borde: 1,
    sombra: "ninguna",
  },
];
