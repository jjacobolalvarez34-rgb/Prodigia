import type { Continente } from "@/lib/practica/geografia";

// Sub-regiones pedagógicas de Geografía (retrofit Técnicas | Clases, ver
// docs/PARIDAD_MUNDOS.md fila 22/23 y "Geografía: Técnicas y Clases por
// continente"). No existe en el código ninguna partición país→sub-región
// (src/lib/practica/geografia.ts solo tiene país→continente) — acá se
// curan sub-regiones NUEVAS, pensadas para enseñar, no para practicar.
//
// ALCANCE DELIBERADAMENTE ACOTADO (decisión de alcance, mismo criterio de
// honestidad que el resto de la sesión — ver docs/PARIDAD_MUNDOS.md línea
// 82): NO se curó la sub-región de los 153 países de PAISES_POR_CONTINENTE.
// Solo se le asignó una sub-región formal a los países "ancla" que las
// Clases nuevas realmente usan como ejemplo (los más reconocibles/de menor
// dificultad de cada sub-región, según el campo `dificultad` de
// src/lib/practica/geografia.ts) — entre 4 y 6 por sub-región, ~40 países
// en total de los 153. El resto de los países de cada continente NO tiene
// sub-región asignada en el código: se los menciona en el texto de la
// lección como parte del bloque completo (p. ej. "toda Centroamérica"),
// pero no hay un id→sub-región formal para ellos. Ampliar esto a los 153
// países es trabajo de contenido aparte, no de esta fase.
export type SubRegionId =
  | "america-cono-sur"
  | "america-andina"
  | "america-centro-caribe"
  | "america-norte"
  | "europa-occidental"
  | "europa-este"
  | "europa-escandinavia-baltico"
  | "europa-mediterranea"
  | "africa-norte"
  | "africa-occidental"
  | "africa-oriental"
  | "africa-austral"
  | "asia-oriental"
  | "asia-sudeste-meridional"
  | "asia-oriente-medio"
  | "oceania";

export interface SubRegion {
  id: SubRegionId;
  continente: Continente;
  nombre: string;
}

export const SUBREGIONES: SubRegion[] = [
  { id: "america-cono-sur", continente: "america", nombre: "Cono Sur" },
  { id: "america-andina", continente: "america", nombre: "Región Andina" },
  { id: "america-centro-caribe", continente: "america", nombre: "Centroamérica y el Caribe" },
  { id: "america-norte", continente: "america", nombre: "Norteamérica" },
  { id: "europa-occidental", continente: "europa", nombre: "Europa Occidental" },
  { id: "europa-este", continente: "europa", nombre: "Europa del Este" },
  { id: "europa-escandinavia-baltico", continente: "europa", nombre: "Escandinavia y el Báltico" },
  { id: "europa-mediterranea", continente: "europa", nombre: "Región Mediterránea" },
  { id: "africa-norte", continente: "africa", nombre: "Norte de África (Magreb)" },
  { id: "africa-occidental", continente: "africa", nombre: "África Occidental" },
  { id: "africa-oriental", continente: "africa", nombre: "África Oriental" },
  { id: "africa-austral", continente: "africa", nombre: "África Austral" },
  { id: "asia-oriental", continente: "asia_oceania", nombre: "Asia Oriental" },
  { id: "asia-sudeste-meridional", continente: "asia_oceania", nombre: "Sudeste Asiático y Asia Meridional" },
  { id: "asia-oriente-medio", continente: "asia_oceania", nombre: "Oriente Medio" },
  { id: "oceania", continente: "asia_oceania", nombre: "Oceanía" },
];

export const SUBREGIONES_POR_CONTINENTE: Record<Continente, SubRegion[]> = {
  america: SUBREGIONES.filter((s) => s.continente === "america"),
  europa: SUBREGIONES.filter((s) => s.continente === "europa"),
  africa: SUBREGIONES.filter((s) => s.continente === "africa"),
  asia_oceania: SUBREGIONES.filter((s) => s.continente === "asia_oceania"),
};

// País ancla → sub-región (solo los ~40 usados como ejemplo en las Clases
// nuevas — ver nota de alcance arriba). El id es el mismo ISO numérico de
// PAISES_POR_CONTINENTE (src/lib/practica/geografia.ts), así que un test
// puede cruzar ambas fuentes.
export const PAIS_SUBREGION: Record<string, SubRegionId> = {
  // Cono Sur
  "032": "america-cono-sur", // Argentina
  "152": "america-cono-sur", // Chile
  "858": "america-cono-sur", // Uruguay
  "600": "america-cono-sur", // Paraguay
  // Región Andina
  "170": "america-andina", // Colombia
  "862": "america-andina", // Venezuela
  "218": "america-andina", // Ecuador
  "604": "america-andina", // Perú
  "068": "america-andina", // Bolivia
  // Centroamérica y el Caribe
  "320": "america-centro-caribe", // Guatemala
  "188": "america-centro-caribe", // Costa Rica
  "591": "america-centro-caribe", // Panamá
  "192": "america-centro-caribe", // Cuba
  "214": "america-centro-caribe", // República Dominicana
  "388": "america-centro-caribe", // Jamaica
  // Norteamérica
  "840": "america-norte", // Estados Unidos
  "124": "america-norte", // Canadá
  "484": "america-norte", // México

  // Europa Occidental
  "250": "europa-occidental", // Francia
  "276": "europa-occidental", // Alemania
  "528": "europa-occidental", // Países Bajos
  "056": "europa-occidental", // Bélgica
  // Europa del Este
  "616": "europa-este", // Polonia
  "804": "europa-este", // Ucrania
  "348": "europa-este", // Hungría
  "642": "europa-este", // Rumania
  // Escandinavia y el Báltico
  "752": "europa-escandinavia-baltico", // Suecia
  "578": "europa-escandinavia-baltico", // Noruega
  "208": "europa-escandinavia-baltico", // Dinamarca
  "246": "europa-escandinavia-baltico", // Finlandia
  // Región Mediterránea
  "724": "europa-mediterranea", // España
  "380": "europa-mediterranea", // Italia
  "300": "europa-mediterranea", // Grecia
  "620": "europa-mediterranea", // Portugal

  // Norte de África (Magreb)
  "504": "africa-norte", // Marruecos
  "012": "africa-norte", // Argelia
  "788": "africa-norte", // Túnez
  "434": "africa-norte", // Libia
  // África Occidental
  "566": "africa-occidental", // Nigeria
  "288": "africa-occidental", // Ghana
  "686": "africa-occidental", // Senegal
  "384": "africa-occidental", // Costa de Marfil
  // África Oriental
  "404": "africa-oriental", // Kenia
  "231": "africa-oriental", // Etiopía
  "834": "africa-oriental", // Tanzania
  "800": "africa-oriental", // Uganda
  // África Austral
  "710": "africa-austral", // Sudáfrica
  "516": "africa-austral", // Namibia
  "072": "africa-austral", // Botsuana
  "716": "africa-austral", // Zimbabue

  // Asia Oriental
  "156": "asia-oriental", // China
  "392": "asia-oriental", // Japón
  "410": "asia-oriental", // Corea del Sur
  "496": "asia-oriental", // Mongolia
  // Sudeste Asiático y Asia Meridional
  "360": "asia-sudeste-meridional", // Indonesia
  "608": "asia-sudeste-meridional", // Filipinas
  "704": "asia-sudeste-meridional", // Vietnam
  "356": "asia-sudeste-meridional", // India
  // Oriente Medio
  "682": "asia-oriente-medio", // Arabia Saudita
  "364": "asia-oriente-medio", // Irán
  "792": "asia-oriente-medio", // Turquía
  "376": "asia-oriente-medio", // Israel
  // Oceanía
  "036": "oceania", // Australia
  "554": "oceania", // Nueva Zelanda
  "598": "oceania", // Papúa Nueva Guinea
  "242": "oceania", // Fiyi
};
