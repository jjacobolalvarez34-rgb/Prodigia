// Normaliza el español rioplatense/voseo a español neutro latinoamericano (tuteo)
// en messages/es.json (solo valores, nunca claves). Uso: node scripts/normalizar-espanol.mjs
// Mapeo CUIRADO (token por token) con límites de palabra Unicode-aware
// (lookarounds con propiedad \p{L}): nunca sustituye substrings ni pierde acentos.
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "messages/es.json";

// [voseo/rioplatense, neutro] — ambos en minúscula; se respeta el capitalizado de origen.
const TOKENS = [
  // presente voseo (terminan en "s") -> tuteo
  ["tenes", "tienes"],
  ["tenés", "tienes"],
  ["podes", "puedes"],
  ["podés", "puedes"],
  ["queres", "quieres"],
  ["querés", "quieres"],
  ["sos", "eres"],
  ["jugas", "juegas"],
  ["jugás", "juegas"],
  ["perdes", "pierdes"],
  ["perdés", "pierdes"],
  ["sabes", "sabes"],
  ["sabés", "sabes"],
  ["vas", "vas"],
  ["necesitás", "necesitas"],
  ["identificás", "identificas"],
  ["practicás", "practicas"],
  ["dominás", "dominas"],
  ["conocés", "conoces"],
  ["comparás", "comparas"],
  // imperativos voseo (acento final o monosílabo) -> tuteo
  ["hacé", "haz"],
  ["jugá", "juega"],
  ["probá", "prueba"],
  ["elegí", "elige"],
  ["mirá", "mira"],
  ["intentá", "intenta"],
  ["completá", "completa"],
  ["empezá", "empieza"],
  ["arrancá", "arranca"],
  ["agregá", "agrega"],
  ["compartí", "comparte"],
  ["guardá", "guarda"],
  ["esperá", "espera"],
  ["sumá", "suma"],
  ["mandá", "manda"],
  ["andá", "anda"],
  ["vení", "ven"],
  ["decí", "di"],
  ["poné", "pon"],
  ["sacá", "saca"],
  ["pasá", "pasa"],
  ["meté", "mete"],
  ["pensá", "piensa"],
  ["entrá", "entra"],
  ["buscá", "busca"],
  ["enviá", "envía"],
  ["tomá", "toma"],
  ["contá", "cuenta"],
  ["dejá", "deja"],
  ["volvé", "vuelve"],
  ["tocá", "toca"],
  ["armá", "arma"],
  ["abrí", "abre"],
  ["levantá", "levanta"],
  ["copiá", "copia"],
  ["fijate", "fíjate"],
  ["aceptá", "acepta"],
  ["practicá", "practica"],
  ["saltá", "salta"],
  ["seguí", "sigue"],
  ["subí", "sube"],
  ["creá", "crea"],
  ["gastá", "gasta"],
  ["probalo", "pruébalo"],
  ["retalos", "rétalos"],
  ["revisá", "revisa"],
  ["calculá", "calcula"],
  ["convertí", "convierte"],
  ["despejá", "despeja"],
  ["dividí", "divide"],
  ["entrená", "entrena"],
  ["multiplicá", "multiplica"],
  ["redondeá", "redondea"],
  ["restá", "resta"],
  ["trabajá", "trabaja"],
  ["ubicá", "ubica"],
  // subjuntivos voseo -> tuteo
  ["apretes", "aprietes"],
  ["apretés", "aprietes"],
  ["arranques", "arranques"],
  ["arranqués", "arranques"],
  ["llegues", "llegues"],
  ["llegués", "llegues"],
  ["pongas", "pongas"],
  ["pongás", "pongas"],
  ["marques", "marques"],
  ["marqués", "marques"],
  // formas enclíticas rioplatenses de USE común (imperativo + pronombre)
  ["dejame", "déjame"],
  ["mandame", "mándame"],
  ["avisame", "avísame"],
  ["pegalo", "pégalo"],
  ["tomate", "tómate"],
  ["ponele", "ponle"],
  ["buscalos", "búscalos"],
  ["mandale", "mándale"],
];

const PAREJAS = TOKENS.map(([a, b]) => [
  new RegExp(`(?<![\\p{L}\\p{N}_])${a}(?![\\p{L}\\p{N}_])`, "giu"),
  b,
]);

function capitalizarIgual(fuente, objetivo) {
  if (!fuente) return objetivo;
  if (fuente[0] === fuente[0].toUpperCase() && fuente[0] !== fuente[0].toLowerCase()) {
    return objetivo[0].toUpperCase() + objetivo.slice(1);
  }
  if (fuente === fuente.toUpperCase() && fuente.length > 1) return objetivo.toUpperCase();
  return objetivo;
}

function transformarCadena(texto) {
  let salida = texto;
  for (const [re, objetivo] of PAREJAS) {
    salida = salida.replace(re, (m) => capitalizarIgual(m, objetivo));
  }
  return salida;
}

function recorrer(obj, prefijo, cambios) {
  for (const [k, v] of Object.entries(obj)) {
    const clave = prefijo ? `${prefijo}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      recorrer(v, clave, cambios);
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item && typeof item === "object") recorrer(item, `${clave}[${i}]`, cambios);
      });
    } else if (typeof v === "string") {
      const nuevo = transformarCadena(v);
      if (nuevo !== v) cambios.push({ clave, antes: v, despues: nuevo });
      obj[k] = nuevo;
    }
  }
  return obj;
}

const original = JSON.parse(readFileSync(RUTA, "utf8"));
const cambios = [];
recorrer(original, "", cambios);

console.log(`Cambios: ${cambios.length}`);
for (const c of cambios) {
  console.log(`- ${c.clave}\n    ANTES : ${c.antes}\n    DESPUÉS: ${c.despues}`);
}

writeFileSync(RUTA, JSON.stringify(original, null, 2) + "\n", "utf8");
console.log(`\nEscrito en ${RUTA}`);