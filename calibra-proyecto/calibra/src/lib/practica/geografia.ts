// Países con su id numérico ISO 3166-1 (coincide con el `id` de cada
// geometría en el topojson de world-atlas) y una dificultad 1-10
// aproximada por qué tan conocido/grande es el país.
export interface PaisAmerica {
  id: string; // id numérico ISO como string, para matchear contra la geometría
  nombre: string;
  dificultad: number;
}

export type Continente = "america" | "europa" | "africa" | "asia_oceania";

export const PAISES_AMERICA: PaisAmerica[] = [
  { id: "840", nombre: "Estados Unidos", dificultad: 1 },
  { id: "124", nombre: "Canadá", dificultad: 1 },
  { id: "076", nombre: "Brasil", dificultad: 1 },
  { id: "032", nombre: "Argentina", dificultad: 1 },
  { id: "484", nombre: "México", dificultad: 2 },
  { id: "152", nombre: "Chile", dificultad: 2 },
  { id: "170", nombre: "Colombia", dificultad: 2 },
  { id: "604", nombre: "Perú", dificultad: 3 },
  { id: "862", nombre: "Venezuela", dificultad: 4 },
  { id: "218", nombre: "Ecuador", dificultad: 4 },
  { id: "068", nombre: "Bolivia", dificultad: 4 },
  { id: "192", nombre: "Cuba", dificultad: 4 },
  { id: "600", nombre: "Paraguay", dificultad: 5 },
  { id: "858", nombre: "Uruguay", dificultad: 5 },
  { id: "320", nombre: "Guatemala", dificultad: 5 },
  { id: "591", nombre: "Panamá", dificultad: 6 },
  { id: "188", nombre: "Costa Rica", dificultad: 6 },
  { id: "214", nombre: "República Dominicana", dificultad: 6 },
  { id: "340", nombre: "Honduras", dificultad: 7 },
  { id: "558", nombre: "Nicaragua", dificultad: 7 },
  { id: "222", nombre: "El Salvador", dificultad: 8 },
  { id: "388", nombre: "Jamaica", dificultad: 8 },
  { id: "332", nombre: "Haití", dificultad: 8 },
  { id: "084", nombre: "Belice", dificultad: 9 },
  { id: "044", nombre: "Bahamas", dificultad: 9 },
  { id: "328", nombre: "Guyana", dificultad: 9 },
  { id: "740", nombre: "Surinam", dificultad: 10 },
  { id: "780", nombre: "Trinidad y Tobago", dificultad: 10 },
];

// Fase B2: segundo continente jugable, mismo patrón técnico que
// América (react-simple-maps + el mismo topojson real, nada dibujado
// a mano).
export const PAISES_EUROPA: PaisAmerica[] = [
  { id: "250", nombre: "Francia", dificultad: 1 },
  { id: "276", nombre: "Alemania", dificultad: 1 },
  { id: "724", nombre: "España", dificultad: 1 },
  { id: "380", nombre: "Italia", dificultad: 1 },
  { id: "826", nombre: "Reino Unido", dificultad: 2 },
  { id: "620", nombre: "Portugal", dificultad: 2 },
  { id: "528", nombre: "Países Bajos", dificultad: 3 },
  { id: "756", nombre: "Suiza", dificultad: 3 },
  { id: "056", nombre: "Bélgica", dificultad: 4 },
  { id: "040", nombre: "Austria", dificultad: 4 },
  { id: "752", nombre: "Suecia", dificultad: 4 },
  { id: "616", nombre: "Polonia", dificultad: 5 },
  { id: "578", nombre: "Noruega", dificultad: 5 },
  { id: "208", nombre: "Dinamarca", dificultad: 5 },
  { id: "246", nombre: "Finlandia", dificultad: 6 },
  { id: "372", nombre: "Irlanda", dificultad: 6 },
  { id: "300", nombre: "Grecia", dificultad: 6 },
  { id: "804", nombre: "Ucrania", dificultad: 7 },
  { id: "348", nombre: "Hungría", dificultad: 7 },
  { id: "642", nombre: "Rumania", dificultad: 7 },
  { id: "203", nombre: "República Checa", dificultad: 8 },
  { id: "191", nombre: "Croacia", dificultad: 8 },
  { id: "703", nombre: "Eslovaquia", dificultad: 9 },
  { id: "100", nombre: "Bulgaria", dificultad: 9 },
  { id: "688", nombre: "Serbia", dificultad: 9 },
  { id: "352", nombre: "Islandia", dificultad: 10 },
];

// Fase FF2: tercer y cuarto continente jugable. Misma fuente real de
// geometrías (world-atlas, sin nada dibujado a mano) — la lista incluye
// TODOS los países soberanos presentes en el topojson de 110m que se
// usa en el proyecto (algunos estados chicos/insulares no están en esa
// resolución y por lo tanto no pueden jugarse: por ejemplo Cabo Verde,
// Comoras, Mauricio, Seychelles, Singapur o los micro-estados del
// Pacífico). Sahara Occidental se incluye porque tiene su propia
// geometría en el topojson (si no, quedaría un hueco gris sin país
// asociado en el mapa).
export const PAISES_AFRICA: PaisAmerica[] = [
  { id: "818", nombre: "Egipto", dificultad: 1 },
  { id: "710", nombre: "Sudáfrica", dificultad: 1 },
  { id: "566", nombre: "Nigeria", dificultad: 2 },
  { id: "504", nombre: "Marruecos", dificultad: 2 },
  { id: "404", nombre: "Kenia", dificultad: 2 },
  { id: "012", nombre: "Argelia", dificultad: 3 },
  { id: "231", nombre: "Etiopía", dificultad: 3 },
  { id: "288", nombre: "Ghana", dificultad: 3 },
  { id: "434", nombre: "Libia", dificultad: 4 },
  { id: "788", nombre: "Túnez", dificultad: 4 },
  { id: "834", nombre: "Tanzania", dificultad: 4 },
  { id: "024", nombre: "Angola", dificultad: 4 },
  { id: "800", nombre: "Uganda", dificultad: 5 },
  { id: "716", nombre: "Zimbabue", dificultad: 5 },
  { id: "508", nombre: "Mozambique", dificultad: 5 },
  { id: "120", nombre: "Camerún", dificultad: 5 },
  { id: "686", nombre: "Senegal", dificultad: 5 },
  { id: "894", nombre: "Zambia", dificultad: 6 },
  { id: "516", nombre: "Namibia", dificultad: 6 },
  { id: "072", nombre: "Botsuana", dificultad: 6 },
  { id: "384", nombre: "Costa de Marfil", dificultad: 6 },
  { id: "450", nombre: "Madagascar", dificultad: 6 },
  { id: "466", nombre: "Malí", dificultad: 6 },
  { id: "646", nombre: "Ruanda", dificultad: 7 },
  { id: "729", nombre: "Sudán", dificultad: 7 },
  { id: "728", nombre: "Sudán del Sur", dificultad: 7 },
  { id: "706", nombre: "Somalia", dificultad: 7 },
  { id: "148", nombre: "Chad", dificultad: 7 },
  { id: "562", nombre: "Níger", dificultad: 7 },
  { id: "854", nombre: "Burkina Faso", dificultad: 7 },
  { id: "180", nombre: "República Democrática del Congo", dificultad: 7 },
  { id: "178", nombre: "Congo", dificultad: 7 },
  { id: "266", nombre: "Gabón", dificultad: 7 },
  { id: "454", nombre: "Malaui", dificultad: 7 },
  { id: "426", nombre: "Lesoto", dificultad: 8 },
  { id: "748", nombre: "Esuatini", dificultad: 8 },
  { id: "478", nombre: "Mauritania", dificultad: 8 },
  { id: "324", nombre: "Guinea", dificultad: 8 },
  { id: "694", nombre: "Sierra Leona", dificultad: 8 },
  { id: "430", nombre: "Liberia", dificultad: 8 },
  { id: "768", nombre: "Togo", dificultad: 8 },
  { id: "204", nombre: "Benín", dificultad: 8 },
  { id: "232", nombre: "Eritrea", dificultad: 8 },
  { id: "262", nombre: "Yibuti", dificultad: 9 },
  { id: "108", nombre: "Burundi", dificultad: 9 },
  { id: "140", nombre: "República Centroafricana", dificultad: 9 },
  { id: "270", nombre: "Gambia", dificultad: 9 },
  { id: "226", nombre: "Guinea Ecuatorial", dificultad: 9 },
  { id: "732", nombre: "Sahara Occidental", dificultad: 10 },
];

// Asia y Oceanía agrupados como una sola región (así ya estaba
// planteado en la UI de /geografia antes de esta fase).
export const PAISES_ASIA_OCEANIA: PaisAmerica[] = [
  { id: "156", nombre: "China", dificultad: 1 },
  { id: "356", nombre: "India", dificultad: 1 },
  { id: "392", nombre: "Japón", dificultad: 1 },
  { id: "643", nombre: "Rusia", dificultad: 1 },
  { id: "036", nombre: "Australia", dificultad: 1 },
  { id: "360", nombre: "Indonesia", dificultad: 2 },
  { id: "364", nombre: "Irán", dificultad: 2 },
  { id: "376", nombre: "Israel", dificultad: 2 },
  { id: "410", nombre: "Corea del Sur", dificultad: 2 },
  { id: "554", nombre: "Nueva Zelanda", dificultad: 2 },
  { id: "792", nombre: "Turquía", dificultad: 2 },
  { id: "158", nombre: "Taiwán", dificultad: 3 },
  { id: "368", nombre: "Irak", dificultad: 3 },
  { id: "408", nombre: "Corea del Norte", dificultad: 3 },
  { id: "458", nombre: "Malasia", dificultad: 3 },
  { id: "586", nombre: "Pakistán", dificultad: 3 },
  { id: "608", nombre: "Filipinas", dificultad: 3 },
  { id: "682", nombre: "Arabia Saudita", dificultad: 3 },
  { id: "704", nombre: "Vietnam", dificultad: 3 },
  { id: "400", nombre: "Jordania", dificultad: 4 },
  { id: "524", nombre: "Nepal", dificultad: 4 },
  { id: "784", nombre: "Emiratos Árabes Unidos", dificultad: 4 },
  { id: "050", nombre: "Bangladés", dificultad: 4 },
  { id: "104", nombre: "Myanmar", dificultad: 5 },
  { id: "116", nombre: "Camboya", dificultad: 5 },
  { id: "144", nombre: "Sri Lanka", dificultad: 5 },
  { id: "398", nombre: "Kazajistán", dificultad: 5 },
  { id: "414", nombre: "Kuwait", dificultad: 5 },
  { id: "760", nombre: "Siria", dificultad: 5 },
  { id: "031", nombre: "Azerbaiyán", dificultad: 6 },
  { id: "196", nombre: "Chipre", dificultad: 6 },
  { id: "268", nombre: "Georgia", dificultad: 6 },
  { id: "418", nombre: "Laos", dificultad: 6 },
  { id: "496", nombre: "Mongolia", dificultad: 6 },
  { id: "512", nombre: "Omán", dificultad: 6 },
  { id: "634", nombre: "Catar", dificultad: 6 },
  { id: "860", nombre: "Uzbekistán", dificultad: 6 },
  { id: "887", nombre: "Yemen", dificultad: 6 },
  { id: "004", nombre: "Afganistán", dificultad: 7 },
  { id: "242", nombre: "Fiyi", dificultad: 7 },
  { id: "417", nombre: "Kirguistán", dificultad: 7 },
  { id: "598", nombre: "Papúa Nueva Guinea", dificultad: 7 },
  { id: "795", nombre: "Turkmenistán", dificultad: 7 },
  { id: "064", nombre: "Bután", dificultad: 8 },
  { id: "096", nombre: "Brunéi", dificultad: 8 },
  { id: "762", nombre: "Tayikistán", dificultad: 8 },
  { id: "764", nombre: "Tailandia", dificultad: 3 },
  { id: "090", nombre: "Islas Salomón", dificultad: 9 },
  { id: "548", nombre: "Vanuatu", dificultad: 9 },
  { id: "626", nombre: "Timor Oriental", dificultad: 9 },
];

export const PAISES_POR_CONTINENTE: Record<Continente, PaisAmerica[]> = {
  america: PAISES_AMERICA,
  europa: PAISES_EUROPA,
  africa: PAISES_AFRICA,
  asia_oceania: PAISES_ASIA_OCEANIA,
};

export const IDS_AMERICA = new Set(PAISES_AMERICA.map((p) => p.id));
export const IDS_EUROPA = new Set(PAISES_EUROPA.map((p) => p.id));
export const IDS_AFRICA = new Set(PAISES_AFRICA.map((p) => p.id));
export const IDS_ASIA_OCEANIA = new Set(PAISES_ASIA_OCEANIA.map((p) => p.id));
export const IDS_POR_CONTINENTE: Record<Continente, Set<string>> = {
  america: IDS_AMERICA,
  europa: IDS_EUROPA,
  africa: IDS_AFRICA,
  asia_oceania: IDS_ASIA_OCEANIA,
};

// Banda ancha (±3) porque el dataset es chico — con ±1 quedarían muy
// pocas opciones para elegir al azar en los niveles extremos.
export function elegirPaisAleatorio(paises: PaisAmerica[], nivel: number, usados: Set<string>): PaisAmerica | null {
  const candidatos = paises.filter((p) => Math.abs(p.dificultad - nivel) <= 3 && !usados.has(p.id));
  const pool = candidatos.length > 0 ? candidatos : paises.filter((p) => !usados.has(p.id));
  const poolFinal = pool.length > 0 ? pool : paises;
  return poolFinal[Math.floor(Math.random() * poolFinal.length)] ?? null;
}
