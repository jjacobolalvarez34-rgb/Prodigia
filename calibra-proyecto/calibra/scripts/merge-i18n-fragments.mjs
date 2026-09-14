// Mergea los fragmentos JSON escritos por los 16 agentes del sprint de
// cobertura next-intl (ES/EN) en messages/es.json y messages/en.json.
// Uso: node scripts/merge-i18n-fragments.mjs <carpeta-de-fragmentos>
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const carpeta = process.argv[2];
if (!carpeta) {
  console.error("Uso: node scripts/merge-i18n-fragments.mjs <carpeta-de-fragmentos>");
  process.exit(1);
}

const RUTA_ES = "messages/es.json";
const RUTA_EN = "messages/en.json";

const es = JSON.parse(readFileSync(RUTA_ES, "utf8"));
const en = JSON.parse(readFileSync(RUTA_EN, "utf8"));

const archivos = readdirSync(carpeta);
const nombres = new Set(
  archivos
    .filter((f) => f.endsWith(".es.json") || f.endsWith(".en.json"))
    .map((f) => f.replace(/\.(es|en)\.json$/, ""))
);

const colisiones = [];
const reporte = [];

function deepMerge(destino, fuente, rutaClave, colisiones) {
  for (const [k, v] of Object.entries(fuente)) {
    const claveCompleta = rutaClave ? `${rutaClave}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (destino[k] === undefined) destino[k] = {};
      if (typeof destino[k] !== "object" || Array.isArray(destino[k])) {
        colisiones.push(`${claveCompleta}: destino no es objeto, no se puede fusionar`);
        continue;
      }
      deepMerge(destino[k], v, claveCompleta, colisiones);
    } else {
      if (Object.prototype.hasOwnProperty.call(destino, k)) {
        colisiones.push(`${claveCompleta}: YA EXISTE (valor actual: ${JSON.stringify(destino[k])}, nuevo: ${JSON.stringify(v)}) — NO sobreescrito`);
        continue;
      }
      destino[k] = v;
    }
  }
}

for (const nombre of [...nombres].sort()) {
  if (nombre === "Demo") {
    reporte.push(`Demo: saltado (fragmento vacío, lote sin texto propio)`);
    continue;
  }
  const rutaEs = join(carpeta, `${nombre}.es.json`);
  const rutaEn = join(carpeta, `${nombre}.en.json`);
  let fragEs, fragEn;
  try {
    fragEs = JSON.parse(readFileSync(rutaEs, "utf8"));
  } catch (e) {
    reporte.push(`${nombre}: FALTA o JSON inválido en ${rutaEs} (${e.message})`);
    continue;
  }
  try {
    fragEn = JSON.parse(readFileSync(rutaEn, "utf8"));
  } catch (e) {
    reporte.push(`${nombre}: FALTA o JSON inválido en ${rutaEn} (${e.message})`);
    continue;
  }

  const esExtension = nombre.endsWith("-extra");
  const namespace = esExtension ? nombre.replace(/-extra$/, "") : nombre;

  if (esExtension) {
    if (es[namespace] === undefined) es[namespace] = {};
    if (en[namespace] === undefined) en[namespace] = {};
    const colEs = [];
    const colEn = [];
    deepMerge(es[namespace], fragEs, namespace, colEs);
    deepMerge(en[namespace], fragEn, namespace, colEn);
    colisiones.push(...colEs.map((c) => `[es] ${c}`), ...colEn.map((c) => `[en] ${c}`));
    reporte.push(`${namespace}: EXTENDIDO (fragmento ${nombre}) — ${colEs.length + colEn.length} colisiones`);
  } else {
    if (es[namespace] !== undefined) {
      colisiones.push(`[es] ${namespace}: namespace YA EXISTE como top-level — se esperaba nuevo, se hace deep-merge por seguridad`);
      deepMerge(es[namespace], fragEs, namespace, colisiones);
    } else {
      es[namespace] = fragEs;
    }
    if (en[namespace] !== undefined) {
      colisiones.push(`[en] ${namespace}: namespace YA EXISTE como top-level — se esperaba nuevo, se hace deep-merge por seguridad`);
      deepMerge(en[namespace], fragEn, namespace, colisiones);
    } else {
      en[namespace] = fragEn;
    }
    reporte.push(`${namespace}: CREADO (nuevo namespace top-level)`);
  }
}

writeFileSync(RUTA_ES, JSON.stringify(es, null, 2) + "\n", "utf8");
writeFileSync(RUTA_EN, JSON.stringify(en, null, 2) + "\n", "utf8");

console.log("=== Reporte de merge ===");
for (const r of reporte) console.log("- " + r);
console.log(`\n=== Colisiones (${colisiones.length}) ===`);
for (const c of colisiones) console.log("! " + c);
if (colisiones.length === 0) console.log("(ninguna)");
