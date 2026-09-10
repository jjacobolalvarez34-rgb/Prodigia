// Analiza migraciones 00*.sql: para cada función (create or replace function),
// guarda la ÚLTIMA definición (por nombre), y reporta cuáles contienen voseo
// en cadenas literal (raise exception u otras). Solo lectura.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const dir = "supabase/migrations";
const VOSEO = /(?<![\p{L}\p{N}_])(?:pod[ée]s|ten[ée]s|tenes|tenés|quer[ée]s|elegí|prob[áa]|mirá|no sos|a vos|andá|seguí|estás en|salí del|vos\b)(?![\p{L}\p{N}_])/giu;

const archivos = readdirSync(dir).filter((f) => /^\d{4}/.test(f) && f.endsWith(".sql")).sort();

function extraerDefiniciones(sql, nombreArchivo) {
  const defs = [];
  const re = /create (?:or replace )?function\s+(?:public\.)?([a-z0-9_]+)/gi;
  let m;
  while ((m = re.exec(sql)) !== null) {
    const nombre = m[1];
    const restante = sql.slice(m.index);
    const idxApertura = restante.indexOf("$$");
    if (idxApertura === -1) continue;
    const idxFin = restante.indexOf("$$;", idxApertura + 2);
    if (idxFin === -1) {
      console.log(`  [warn] ${nombreArchivo}: no encuentro fin de ${nombre}`);
      continue;
    }
    const def = restante.slice(0, idxFin + 3);
    defs.push({ nombre, def });
    re.lastIndex = m.index + def.length;
  }
  return defs;
}

const porNombre = new Map(); // nombre -> {archivo, def}
for (const f of archivos) {
  const sql = readFileSync(`${dir}/${f}`, "utf8");
  for (const d of extraerDefiniciones(sql, f)) {
    porNombre.set(d.nombre, { archivo: f, def: d.def });
  }
}

console.log(`Total funciones (última definición): ${porNombre.size}\n`);
let conVoseo = 0;
const pendientes = [];
for (const [nombre, { archivo, def }] of porNombre) {
  const texto = def.replace(/(--[^\n]*)/g, "");
  if (VOSEO.test(texto)) {
    conVoseo++;
    const raises = (def.match(/raise exception '[^']*'/gi) || []).map((r) => r.replace("raise exception ", ""));
    pendientes.push({ nombre, archivo, def, raises });
    console.log(`- ${nombre}  [${archivo}]`);
    for (const r of raises) console.log(`    raise: ${r}`);
  }
}
console.log(`\nFunciones con voseo en literales: ${conVoseo}`);
writeFileSync("scripts/_analisis-voseo-fn.json", JSON.stringify(pendientes, null, 2));
console.log("Detalle en scripts/_analisis-voseo-fn.json");