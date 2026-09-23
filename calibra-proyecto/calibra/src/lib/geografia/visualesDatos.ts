import type { Continente } from "@/lib/practica/geografia";

// Cálculos puros del visual animado nuevo de Geografía ("geografia.mapa",
// ver src/lib/geografia/visuales.ts y src/components/geografia/visuales/Mapa.tsx)
// — mismo patrón que src/lib/enigmia/visualesDatos.ts: el componente SOLO
// dibuja lo que esta función ya resolvió, y lecciones.test.ts recalcula
// cada resultado de forma independiente.
//
// A diferencia de una secuencia numérica, acá no hay una fórmula que
// derive "dónde queda" un país — la posición es un dato geográfico real,
// no calculado. Por eso esta tabla es una lista curada de coordenadas
// aproximadas (centro del país, no su capital) para cada país que
// aparece en al menos un visual de una Técnica o Clase nueva de
// Geografía — no los 153 de PAISES_POR_CONTINENTE, solo los usados como
// ejemplo (ver también la nota de alcance de src/lib/geografia/subregiones.ts).
// Los valores están verificados contra coordenadas geográficas reales
// conocidas (redondeadas a un grado), suficientes para ubicar una
// etiqueta sobre un mapa Mercator de baja resolución — no para precisión
// cartográfica.
export interface CoordenadaPais {
  id: string;
  nombre: string;
  continente: Continente;
  lon: number;
  lat: number;
}

const AMERICA: CoordenadaPais[] = [
  { id: "032", nombre: "Argentina", continente: "america", lon: -64, lat: -34 },
  { id: "152", nombre: "Chile", continente: "america", lon: -71, lat: -30 },
  { id: "858", nombre: "Uruguay", continente: "america", lon: -56, lat: -32.5 },
  { id: "600", nombre: "Paraguay", continente: "america", lon: -58.4, lat: -23.4 },
  { id: "076", nombre: "Brasil", continente: "america", lon: -51.9, lat: -14.2 },
  { id: "170", nombre: "Colombia", continente: "america", lon: -74, lat: 4 },
  { id: "862", nombre: "Venezuela", continente: "america", lon: -66, lat: 8 },
  { id: "218", nombre: "Ecuador", continente: "america", lon: -78.5, lat: -1.8 },
  { id: "604", nombre: "Perú", continente: "america", lon: -76, lat: -9.2 },
  { id: "068", nombre: "Bolivia", continente: "america", lon: -64.7, lat: -16.7 },
  { id: "320", nombre: "Guatemala", continente: "america", lon: -90.5, lat: 15.5 },
  { id: "084", nombre: "Belice", continente: "america", lon: -88.5, lat: 17.2 },
  { id: "340", nombre: "Honduras", continente: "america", lon: -86.6, lat: 15 },
  { id: "222", nombre: "El Salvador", continente: "america", lon: -88.9, lat: 13.8 },
  { id: "558", nombre: "Nicaragua", continente: "america", lon: -85, lat: 12.9 },
  { id: "188", nombre: "Costa Rica", continente: "america", lon: -84, lat: 9.7 },
  { id: "591", nombre: "Panamá", continente: "america", lon: -80.2, lat: 8.5 },
  { id: "192", nombre: "Cuba", continente: "america", lon: -79.5, lat: 21.5 },
  { id: "388", nombre: "Jamaica", continente: "america", lon: -77.3, lat: 18.1 },
  { id: "332", nombre: "Haití", continente: "america", lon: -72.3, lat: 18.9 },
  { id: "214", nombre: "República Dominicana", continente: "america", lon: -70.7, lat: 18.7 },
  { id: "044", nombre: "Bahamas", continente: "america", lon: -77.4, lat: 24.3 },
  { id: "840", nombre: "Estados Unidos", continente: "america", lon: -98, lat: 39.8 },
  { id: "124", nombre: "Canadá", continente: "america", lon: -95, lat: 44 },
  { id: "484", nombre: "México", continente: "america", lon: -102, lat: 23.6 },
];

const EUROPA: CoordenadaPais[] = [
  { id: "578", nombre: "Noruega", continente: "europa", lon: 8.5, lat: 60.5 },
  { id: "752", nombre: "Suecia", continente: "europa", lon: 15, lat: 62 },
  { id: "246", nombre: "Finlandia", continente: "europa", lon: 26, lat: 64 },
  { id: "208", nombre: "Dinamarca", continente: "europa", lon: 9.5, lat: 56 },
  { id: "250", nombre: "Francia", continente: "europa", lon: 2.5, lat: 46.5 },
  { id: "276", nombre: "Alemania", continente: "europa", lon: 10.5, lat: 51 },
  { id: "528", nombre: "Países Bajos", continente: "europa", lon: 5.3, lat: 52.2 },
  { id: "056", nombre: "Bélgica", continente: "europa", lon: 4.5, lat: 50.6 },
  { id: "756", nombre: "Suiza", continente: "europa", lon: 8.2, lat: 46.8 },
  { id: "040", nombre: "Austria", continente: "europa", lon: 14.5, lat: 47.5 },
  { id: "203", nombre: "República Checa", continente: "europa", lon: 15.5, lat: 49.8 },
  { id: "616", nombre: "Polonia", continente: "europa", lon: 19.5, lat: 52 },
  { id: "804", nombre: "Ucrania", continente: "europa", lon: 31.2, lat: 49 },
  { id: "348", nombre: "Hungría", continente: "europa", lon: 19.5, lat: 47.2 },
  { id: "642", nombre: "Rumania", continente: "europa", lon: 25, lat: 46 },
  { id: "724", nombre: "España", continente: "europa", lon: -3.7, lat: 40.3 },
  { id: "380", nombre: "Italia", continente: "europa", lon: 12.5, lat: 42.8 },
  { id: "300", nombre: "Grecia", continente: "europa", lon: 21.8, lat: 39.1 },
  { id: "620", nombre: "Portugal", continente: "europa", lon: -8, lat: 39.5 },
  { id: "191", nombre: "Croacia", continente: "europa", lon: 15.5, lat: 45.1 },
  { id: "688", nombre: "Serbia", continente: "europa", lon: 21, lat: 44 },
  { id: "100", nombre: "Bulgaria", continente: "europa", lon: 25.5, lat: 42.7 },
  { id: "826", nombre: "Reino Unido", continente: "europa", lon: -2, lat: 54 },
  { id: "372", nombre: "Irlanda", continente: "europa", lon: -8, lat: 53.2 },
  // Islandia queda fuera del recorte visible del mapa de Europa (mismo
  // PROYECCION_POR_CONTINENTE que usa /geografia/practica — centrado
  // demasiado al este para que Islandia entre en cuadro con su nombre
  // legible, confirmado renderizando el mapa real). Se mantiene la
  // coordenada curada (por si el recorte cambia en el futuro) pero
  // ningún visual la usa hoy — ver "islas-europeas-separadas" en
  // tecnicas.ts, que la nombra solo en el texto/quiz.
  { id: "352", nombre: "Islandia", continente: "europa", lon: -19, lat: 65 },
];

const AFRICA: CoordenadaPais[] = [
  { id: "504", nombre: "Marruecos", continente: "africa", lon: -6, lat: 32 },
  { id: "012", nombre: "Argelia", continente: "africa", lon: 2, lat: 28 },
  { id: "788", nombre: "Túnez", continente: "africa", lon: 9.5, lat: 30 },
  { id: "434", nombre: "Libia", continente: "africa", lon: 17, lat: 27 },
  { id: "818", nombre: "Egipto", continente: "africa", lon: 30, lat: 27 },
  { id: "566", nombre: "Nigeria", continente: "africa", lon: 8, lat: 9.1 },
  { id: "288", nombre: "Ghana", continente: "africa", lon: -1.2, lat: 7.9 },
  { id: "686", nombre: "Senegal", continente: "africa", lon: -14.5, lat: 14.5 },
  { id: "384", nombre: "Costa de Marfil", continente: "africa", lon: -5.5, lat: 7.5 },
  { id: "404", nombre: "Kenia", continente: "africa", lon: 38, lat: 1 },
  { id: "231", nombre: "Etiopía", continente: "africa", lon: 39, lat: 8 },
  { id: "834", nombre: "Tanzania", continente: "africa", lon: 35, lat: -6.4 },
  { id: "800", nombre: "Uganda", continente: "africa", lon: 32.3, lat: 1.4 },
  { id: "706", nombre: "Somalia", continente: "africa", lon: 46, lat: 5.2 },
  { id: "232", nombre: "Eritrea", continente: "africa", lon: 39, lat: 15.2 },
  { id: "262", nombre: "Yibuti", continente: "africa", lon: 42.6, lat: 11.6 },
  { id: "710", nombre: "Sudáfrica", continente: "africa", lon: 24, lat: -29 },
  { id: "516", nombre: "Namibia", continente: "africa", lon: 17, lat: -22.5 },
  { id: "072", nombre: "Botsuana", continente: "africa", lon: 24, lat: -22 },
  { id: "716", nombre: "Zimbabue", continente: "africa", lon: 30, lat: -19 },
  { id: "426", nombre: "Lesoto", continente: "africa", lon: 28.2, lat: -29.6 },
  { id: "148", nombre: "Chad", continente: "africa", lon: 19, lat: 15 },
  { id: "466", nombre: "Malí", continente: "africa", lon: -4, lat: 17 },
  { id: "894", nombre: "Zambia", continente: "africa", lon: 27.8, lat: -13.1 },
];

const ASIA_OCEANIA: CoordenadaPais[] = [
  { id: "156", nombre: "China", continente: "asia_oceania", lon: 104, lat: 35 },
  { id: "392", nombre: "Japón", continente: "asia_oceania", lon: 138, lat: 37 },
  { id: "410", nombre: "Corea del Sur", continente: "asia_oceania", lon: 127.8, lat: 36.3 },
  { id: "408", nombre: "Corea del Norte", continente: "asia_oceania", lon: 127.2, lat: 40 },
  { id: "496", nombre: "Mongolia", continente: "asia_oceania", lon: 103.8, lat: 46.9 },
  { id: "360", nombre: "Indonesia", continente: "asia_oceania", lon: 113.9, lat: -0.8 },
  { id: "608", nombre: "Filipinas", continente: "asia_oceania", lon: 121.8, lat: 12.9 },
  { id: "704", nombre: "Vietnam", continente: "asia_oceania", lon: 105.8, lat: 16.2 },
  { id: "356", nombre: "India", continente: "asia_oceania", lon: 79, lat: 22 },
  { id: "682", nombre: "Arabia Saudita", continente: "asia_oceania", lon: 45, lat: 24 },
  { id: "364", nombre: "Irán", continente: "asia_oceania", lon: 53.7, lat: 32.4 },
  { id: "792", nombre: "Turquía", continente: "asia_oceania", lon: 35, lat: 39 },
  { id: "376", nombre: "Israel", continente: "asia_oceania", lon: 34.9, lat: 31.5 },
  { id: "887", nombre: "Yemen", continente: "asia_oceania", lon: 48, lat: 15.5 },
  { id: "512", nombre: "Omán", continente: "asia_oceania", lon: 56.5, lat: 21 },
  { id: "784", nombre: "Emiratos Árabes Unidos", continente: "asia_oceania", lon: 54, lat: 24 },
  { id: "634", nombre: "Catar", continente: "asia_oceania", lon: 51.2, lat: 25.3 },
  { id: "414", nombre: "Kuwait", continente: "asia_oceania", lon: 47.6, lat: 29.3 },
  { id: "368", nombre: "Irak", continente: "asia_oceania", lon: 44, lat: 33.2 },
  { id: "400", nombre: "Jordania", continente: "asia_oceania", lon: 36.8, lat: 31.2 },
  { id: "398", nombre: "Kazajistán", continente: "asia_oceania", lon: 66.9, lat: 48 },
  { id: "860", nombre: "Uzbekistán", continente: "asia_oceania", lon: 64.6, lat: 41.4 },
  { id: "795", nombre: "Turkmenistán", continente: "asia_oceania", lon: 59.6, lat: 38.9 },
  { id: "417", nombre: "Kirguistán", continente: "asia_oceania", lon: 74.8, lat: 41.2 },
  { id: "762", nombre: "Tayikistán", continente: "asia_oceania", lon: 71, lat: 38.9 },
  { id: "036", nombre: "Australia", continente: "asia_oceania", lon: 134, lat: -25.3 },
  { id: "554", nombre: "Nueva Zelanda", continente: "asia_oceania", lon: 165, lat: -41.5 },
  { id: "598", nombre: "Papúa Nueva Guinea", continente: "asia_oceania", lon: 144, lat: -6.3 },
  { id: "242", nombre: "Fiyi", continente: "asia_oceania", lon: 178, lat: -17.7 },
];

export const COORDENADAS_PAIS: Record<string, CoordenadaPais> = Object.fromEntries(
  [...AMERICA, ...EUROPA, ...AFRICA, ...ASIA_OCEANIA].map((p) => [p.id, p])
);

// Resuelve una lista de ids de país (en orden de aparición del visual) a
// sus coordenadas conocidas. Un id sin coordenada curada se descarta en
// silencio (mismo criterio defensivo que el resto de los visuales — un
// dato malo no debe romper la lección), nunca lanza.
export function resolverPaisesResaltados(ids: string[]): CoordenadaPais[] {
  return ids.map((id) => COORDENADAS_PAIS[id]).filter((c): c is CoordenadaPais => c !== undefined);
}
