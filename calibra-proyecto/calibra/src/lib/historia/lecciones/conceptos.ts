// Vocabulario de conceptos del currículo de Historia (grafo de dependencias). Cada
// lección declara `introduce`, `usa` y `repasa` con IDs de esta lista;
// lecciones.test.ts comprueba que:
//   - todo ID declarado exista acá (un error de tipeo falla);
//   - como las épocas se pueden empezar en cualquier orden (Técnicas y Clases se
//     desbloquean por época), una lección solo puede USAR un concepto que se
//     introdujo antes EN LA MISMA ÉPOCA (mismo tipo de lección), que ella misma
//     introduce o REPASA, o que es conocimiento previo del colegio;
//   - toda lección que REPASA un concepto lo re-explica en un paso «Contexto:»
//     (Clases) o «Recuerda:» (Técnicas) que menciona algo del concepto (`pista`);
//   - ninguna época introduce dos veces el mismo concepto en el mismo tipo de lección;
//   - todo concepto lo introduce al menos una lección, y los conceptos que la
//     práctica pregunta (src/lib/practica/historiaEscala.ts) los introduce al menos
//     una Clase y una Técnica.
// Agregar una lección nueva es agregarle sus conceptos acá: el test dice de
// inmediato si quedó algo usado antes de enseñarse.

export interface ConceptoHistoria {
  id: string;
  nombre: string;
  // «metodo»: cómo estudiar historia (lo que evalúa la práctica); «tema»: contenido
  // histórico de una Clase.
  tipo: "metodo" | "tema";
  // Palabras que tiene que mencionar el paso «Contexto:»/«Recuerda:» de una lección
  // que repasa el concepto.
  pista: RegExp;
}

// Conocimientos que el colegio ya dio antes de Historia: no se enseñan acá.
export const CONOCIMIENTO_PREVIO: { id: string; nombre: string }[] = [
  { id: "numeros-romanos", nombre: "Leer números romanos hasta el XXI" },
  { id: "restar-y-comparar-numeros", nombre: "Restar y comparar números" },
];

const m = (id: string, nombre: string, pista: RegExp): ConceptoHistoria => ({ id, nombre, tipo: "metodo", pista });
const t = (id: string, nombre: string, pista: RegExp): ConceptoHistoria => ({ id, nombre, tipo: "tema", pista });

export const CONCEPTOS_HISTORIA: ConceptoHistoria[] = [
  // ---- método (lo que evalúa la práctica y cómo se estudia)
  m("anclas", "Fechas ancla", /ancla/i),
  m("epocas-historicas", "Las cinco épocas de la historia", /época|Edad|Antigüedad|Prehistoria/i),
  m("fronteras-de-epoca", "Las fronteras entre épocas son convenciones", /convención|frontera|Edad (Media|Moderna|Contemporánea)|1492|476|1789/i),
  m("linea-de-tiempo", "Línea de tiempo", /línea/i),
  m("fechas-aproximadas", "Fechas aproximadas y «hacia»", /hacia|aproximad/i),
  m("causa-y-consecuencia", "Causa y consecuencia", /causa|consecuencia/i),
  m("cadenas-causales", "Cadenas de dos pasos", /cadena|provoca/i),
  m("siglos", "De año a siglo", /siglo/i),
  m("agrupar-por-bloques", "Agrupar por bloques de tiempo", /bloque/i),
  m("anio-antes-de-cristo", "Los años a. C. se cuentan hacia atrás", /a\. C\./),
  m("sincronia", "Sincronía: qué pasaba a la vez", /sincron|a la vez|al mismo tiempo/i),
  m("personajes-por-rol", "Reconocer personajes por su rol", /\brol\b/i),
  m("personajes-y-hechos", "Relacionar personajes y hechos", /hecho/i),
  m("nemotecnia-honesta", "Asociaciones memorables sin inventar datos", /asociaci/i),
  m("siglas-secuencias", "Siglas para recordar secuencias", /sigla/i),
  m("hechos-y-opiniones", "Separar hechos de opiniones", /hecho|opini/i),
  // ---- tema: Prehistoria
  t("paleolitico", "El Paleolítico", /Paleol|nómad|cazador/i),
  t("neolitico", "El Neolítico y la revolución agrícola", /agricultura|Neolít/i),
  // ---- tema: Antigüedad
  t("mesopotamia", "Mesopotamia", /Mesopotamia|Tigris|Sumeria/i),
  t("egipto-antiguo", "Egipto antiguo", /Egipto|Nilo|faraón/i),
  t("india-antigua", "La India antigua", /India|Indo|Buda|maurya/i),
  t("china-antigua", "La China antigua", /China|Han|Qin/i),
  t("grecia-clasica", "La Grecia clásica", /Grecia|Atenas|polis/i),
  t("persia-antigua", "El Imperio persa", /Persia|persa/i),
  t("helenismo", "Alejandro Magno y el helenismo", /Alejandro|helen/i),
  t("roma-republica", "Roma: monarquía y República", /Roma|República/i),
  t("roma-imperio", "El Imperio romano", /Imperio|Augusto|Roma/i),
  t("cristianismo-y-fin-de-roma", "El cristianismo y el final del Imperio romano", /cristian|Constantino|Imperio|Roma/i),
  t("africa-y-america-antiguas", "África y América antiguas", /Cartago|Aksum|olmeca|maya|África|América/i),
  // ---- tema: Edad Media
  t("bizancio", "El Imperio bizantino", /bizantin|Constantinopla/i),
  t("islam-medieval", "El mundo islámico", /islam|Mahoma|Bagdad/i),
  t("feudalismo", "El feudalismo", /feudal|señor|vasall|campesin/i),
  t("baja-edad-media", "La crisis de la Baja Edad Media", /imprenta|Gutenberg|Edad Media|peste/i),
  t("asia-medieval", "Asia medieval", /Delhi|shogun|Ming|dinastía|Japón|China|Tang/i),
  t("imperio-mongol", "El imperio mongol", /mongol|Gengis/i),
  t("africa-medieval", "África medieval", /Mali|África|Sahara/i),
  t("america-precolombina", "América precolombina", /azteca|inca|mexica|Tenochtitlan|Cusco/i),
  // ---- tema: Edad Moderna
  t("renacimiento", "El Renacimiento", /Renacimiento/i),
  t("reforma", "La Reforma protestante", /Reforma|Lutero/i),
  t("exploracion-y-conquista", "Exploración y conquista de América", /explor|conquista|Colón|colonia|colonias|América/i),
  t("asia-moderna", "Asia moderna: mogoles, Tokugawa y Qing", /Japón|Tokugawa|Qing|mogol|shogun|Delhi|Ming/i),
  t("revolucion-cientifica", "La revolución científica", /cient[ií]fic|Galileo|Copérnico|Newton/i),
  t("ilustracion", "La Ilustración", /Ilustración|razón|Rousseau/i),
  t("mundo-atlantico", "El mundo atlántico: colonias y esclavitud", /atlántic|trata|esclav|colonia/i),
  t("independencia-eeuu", "La independencia de Estados Unidos", /Estados Unidos|independencia/i),
  // ---- tema: Edad Contemporánea
  t("revolucion-francesa", "La Revolución francesa", /Revoluci[oó]n francesa|Bastilla/i),
  t("independencias-americanas", "Revolución haitiana e independencias de Hispanoamérica", /independencia|Haití|Bolívar|San Martín/i),
  t("revolucion-industrial-y-ciencia", "La industrialización y los avances científicos", /industri|vapor|ciencia/i),
  t("imperialismo-y-abolicion", "Imperialismo y abolición de la esclavitud", /imperi|colon|abolici/i),
  t("primera-guerra-mundial-y-entreguerras", "Primera Guerra Mundial, Revolución rusa y entreguerras", /Primera Guerra|1929|entreguerras|Versalles/i),
  t("segunda-guerra-mundial", "La Segunda Guerra Mundial", /Segunda Guerra|1939/i),
  t("onu-y-guerra-fria", "ONU, derechos humanos y Guerra Fría", /Guerra Fría|Naciones Unidas|ONU/i),
  t("descolonizacion-y-mundo-actual", "Descolonización y mundo actual", /descoloniz|independen|Guerra Fría/i),
];

export const IDS_CONCEPTOS = new Set(CONCEPTOS_HISTORIA.map((c) => c.id));
export const IDS_PREVIOS = new Set(CONOCIMIENTO_PREVIO.map((c) => c.id));
export const CONCEPTO_POR_ID = new Map(CONCEPTOS_HISTORIA.map((c) => [c.id, c]));
