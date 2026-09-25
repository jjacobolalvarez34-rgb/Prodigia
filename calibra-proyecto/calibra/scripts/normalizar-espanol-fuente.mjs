// Extiende normalizar-espanol.mjs (que solo toca messages/es.json) a todo el
// código fuente (src/**/*.ts, src/**/*.tsx): recorre cada archivo de texto y
// aplica el mismo mapeo de voseo/rioplatense -> español neutro latinoamericano,
// con los mismos límites de palabra Unicode-aware (nunca substrings). No toca
// identificadores porque el mapeo es de formas conjugadas reales (con tilde en
// la sílaba tónica), que no coinciden con cómo se nombran variables/funciones
// en este proyecto (infinitivos sin tildar: "crear", "elegir", etc.).
// Uso: node scripts/normalizar-espanol-fuente.mjs [--write]
// Sin --write: solo reporta lo que cambiaría (dry run). Con --write: aplica.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const RAIZ = "src";
const ESCRIBIR = process.argv.includes("--write");

// Mismo mapeo que normalizar-espanol.mjs, con algunos tokens adicionales
// encontrados en generadores de contenido de práctica que ese script no cubría
// (nunca se habían corrido sobre archivos .ts/.tsx, solo sobre messages/es.json).
const TOKENS = [
  ["tenes", "tienes"], ["tenés", "tienes"],
  ["podes", "puedes"], ["podés", "puedes"],
  ["queres", "quieres"], ["querés", "quieres"],
  ["sos", "eres"],
  ["jugas", "juegas"], ["jugás", "juegas"],
  ["perdes", "pierdes"], ["perdés", "pierdes"],
  ["sabés", "sabes"],
  ["necesitás", "necesitas"],
  ["identificás", "identificas"],
  ["practicás", "practicas"],
  ["dominás", "dominas"],
  ["conocés", "conoces"],
  ["comparás", "comparas"],
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
  ["apretés", "aprietes"],
  ["arranqués", "arranques"],
  ["llegués", "llegues"],
  ["pongás", "pongas"],
  ["marqués", "marques"],
  ["dejame", "déjame"],
  ["mandame", "mándame"],
  ["avisame", "avísame"],
  ["pegalo", "pégalo"],
  ["tomate", "tómate"],
  ["ponele", "ponle"],
  ["buscalos", "búscalos"],
  ["mandale", "mándale"],
  // --- adicionales, encontrados en generadores de contenido / comentarios ---
  ["usá", "usa"],
  ["usás", "usas"],
  ["resolvé", "resuelve"],
  ["respondé", "responde"],
  ["repetí", "repite"],
  ["mostrá", "muestra"],
  ["armate", "ármate"],
  ["fijáte", "fíjate"],
  ["acordate", "acuérdate"],
  ["quedate", "quédate"],
  ["sentate", "siéntate"],
  ["ponete", "ponte"],
  ["andate", "vete"],
  ["comprá", "compra"],
  ["apretá", "aprieta"],
  ["escuchá", "escucha"],
  ["cumplí", "cumple"],
  ["competí", "compite"],
  ["simplificá", "simplifica"],
  ["reforzá", "refuerza"],
  ["corregí", "corrige"],
  ["anotá", "anota"],
  ["marcá", "marca"],
  ["señalá", "señala"],
  ["arrastrá", "arrastra"],
  ["soltá", "suelta"],
  ["girá", "gira"],
  ["rotá", "rota"],
  ["medí", "mide"],
  ["sumale", "súmale"],
  ["restale", "réstale"],
  ["ordená", "ordena"],
  ["clasificá", "clasifica"],
  ["identificá", "identifica"],
  ["nombrá", "nombra"],
  ["indicá", "indica"],
  ["observá", "observa"],
  ["analizá", "analiza"],
  ["describí", "describe"],
  ["explicá", "explica"],
  ["definí", "define"],
  ["repasá", "repasa"],
  ["verificá", "verifica"],
  ["comprobá", "comprueba"],
  ["estimá", "estima"],
  ["aproximá", "aproxima"],
  ["simplificá", "simplifica"],
  ["reducí", "reduce"],
  ["expandí", "expande"],
  ["factorizá", "factoriza"],
  ["despejá", "despeja"],
  ["graficá", "grafica"],
  ["dibujá", "dibuja"],
  ["escribí", "escribe"],
  ["nombralo", "nómbralo"],
  ["armalo", "ármalo"],
  ["armala", "ármala"],
  ["resolvelo", "resuélvelo"],
  ["resolvela", "resuélvela"],
  ["unite", "únete"],
  ["arrancás", "arrancas"],
  ["preferís", "prefieres"],
  ["reportás", "reportas"],
  ["apagás", "apagas"],
  ["apostás", "apuestas"],
  ["ganás", "ganas"],
  ["venís", "vienes"],
  ["subís", "subes"],
  ["elegís", "eliges"],
  ["empezás", "empiezas"],
  ["mandás", "mandas"],
  ["borrás", "borras"],
  ["encontrás", "encuentras"],
  ["entendés", "entiendes"],
  ["olvidás", "olvidas"],
  ["confirmás", "confirmas"],
  ["recordás", "recuerdas"],
  ["aprendés", "aprendes"],
  ["repetís", "repites"],
  ["escribís", "escribes"],
  ["recibís", "recibes"],
  ["preguntás", "preguntas"],
  ["dudás", "dudas"],
  ["cambiás", "cambias"],
  ["armás", "armas"],
  ["contás", "cuentas"],
  ["mostrás", "muestras"],
  ["seleccionás", "seleccionas"],
  // --- barrido 2026-09-25 (voseo en lecciones de Calculia/Circuitia/Codia y textos de UI) ---
  ["desbloqueá", "desbloquea"], ["encontrá", "encuentra"], ["pedí", "pide"],
  ["trazá", "traza"], ["tachá", "tacha"], ["reproducí", "reproduce"],
  ["cambiá", "cambia"], ["tapá", "tapa"], ["destapá", "destapa"],
  ["derivá", "deriva"], ["integrá", "integra"], ["compará", "compara"],
  ["llamá", "llama"], ["aplicá", "aplica"], ["agrupá", "agrupa"],
  ["bajá", "baja"], ["partí", "parte"], ["cancelá", "cancela"],
  ["reemplazá", "reemplaza"], ["recorré", "recorre"], ["corré", "corre"],
  ["aprendé", "aprende"], ["activá", "activa"], ["salí", "sal"],
  ["separá", "separa"], ["memorizá", "memoriza"], ["ajustá", "ajusta"],
  ["deshacé", "deshaz"], ["invitá", "invita"], ["hallá", "halla"],
  ["extendé", "extiende"], ["suponé", "supón"], ["razoná", "razona"],
  ["predecí", "predice"], ["pagá", "paga"], ["dominá", "domina"],
  ["decidí", "decide"], ["clickeá", "haz clic"], ["caminá", "camina"],
  ["duplicá", "duplica"], ["desconfiá", "desconfía"], ["editá", "edita"],
  ["renombrá", "renombra"], ["seleccioná", "selecciona"], ["regulá", "regula"],
  ["reintentá", "reintenta"], ["reiniciá", "reinicia"], ["realizá", "realiza"],
  ["optimizá", "optimiza"], ["navegá", "navega"], ["mové", "mueve"],
  ["meté", "mete"], ["liberá", "libera"], ["leé", "lee"], ["ingresá", "ingresa"],
  ["golpeá", "golpea"], ["enviá", "envía"], ["entrá", "entra"], ["empujá", "empuja"],
  ["echá", "echa"], ["descargá", "descarga"], ["borrá", "borra"], ["avisá", "avisa"],
  ["aumentá", "aumenta"], ["aflojá", "afloja"], ["disminuí", "disminuye"],
  ["validá", "valida"], ["tirá", "tira"], ["preferí", "prefiere"], ["escogé", "escoge"],
  ["acarreá", "acarrea"], ["cerrá", "cierra"], ["decí", "di"],
  // Frases con "vos" como objeto de preposición: el pronombre tónico cambia de
  // forma según la preposición (a/de/por/para/sin -> "ti"; "con" -> "contigo"),
  // no es un simple vos->tú. Estas frases van ANTES del reemplazo suelto de
  // "vos" de abajo (el array se aplica en orden sobre el string ya mutado).
  ["a vos", "a ti"],
  ["de vos", "de ti"],
  ["por vos", "por ti"],
  ["para vos", "para ti"],
  ["sin vos", "sin ti"],
  ["con vos", "contigo"],
  // "vos" como sujeto suelto (ya cubiertas las formas con preposición arriba)
  // -> "tú".
  ["vos", "tú"],
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

function transformar(texto) {
  let salida = texto;
  for (const [re, objetivo] of PAREJAS) {
    salida = salida.replace(re, (m) => capitalizarIgual(m, objetivo));
  }
  return salida;
}

function* archivos(dir) {
  for (const nombre of readdirSync(dir)) {
    if (nombre === "node_modules" || nombre === ".next" || nombre.startsWith("espanolNeutro")) continue;
    const ruta = join(dir, nombre);
    const info = statSync(ruta);
    if (info.isDirectory()) {
      yield* archivos(ruta);
    } else if ([".ts", ".tsx"].includes(extname(nombre)) && !/.test.tsx?$/.test(nombre)) {
      yield ruta;
    }
  }
}

let totalArchivos = 0;
let totalCambios = 0;
for (const ruta of archivos(RAIZ)) {
  const original = readFileSync(ruta, "utf8");
  const nuevo = transformar(original);
  if (nuevo !== original) {
    totalArchivos++;
    // Contar cuántas líneas cambiaron para el reporte.
    const antesLineas = original.split("\n");
    const despuesLineas = nuevo.split("\n");
    for (let i = 0; i < antesLineas.length; i++) {
      if (antesLineas[i] !== despuesLineas[i]) {
        totalCambios++;
        console.log(`${ruta}:${i + 1}`);
        console.log(`  - ${antesLineas[i].trim()}`);
        console.log(`  + ${despuesLineas[i].trim()}`);
      }
    }
    if (ESCRIBIR) writeFileSync(ruta, nuevo, "utf8");
  }
}

console.log(`\n${ESCRIBIR ? "Escrito" : "Detectado (dry-run)"}: ${totalCambios} líneas en ${totalArchivos} archivos.`);
if (!ESCRIBIR) console.log("Corré con --write para aplicar.");
