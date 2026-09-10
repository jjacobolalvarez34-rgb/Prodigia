// Verifica que 0128 difiera de las definiciones originales SOLO en los literal
// de raise exception (y comentarios de encabezado), nunca en lógica/firma.
import { readFileSync } from "node:fs";

const originales = JSON.parse(readFileSync("scripts/_analisis-voseo-fn.json", "utf8"));
const gen = readFileSync("supabase/migrations/0128_espanol_neutro.sql", "utf8");

const RE_FN = /create or replace function\s+(?:public\.)?([a-z0-9_]+)[\s\S]*?\$\$;/gi;
const genPorNombre = new Map();
let m;
while ((m = RE_FN.exec(gen)) !== null) genPorNombre.set(m[1], m[0]);

// normaliza: quita comentarios y contenido de raise exception
const soloLogica = (def) =>
  def
    .replace(/(--[^\n]*)/g, "")
    .replace(/raise exception\s+'[^']*'/gi, "raise exception <MSG>")
    .replace(/\s+/g, " ")
    .trim();

let ok = true;
for (const { nombre, def } of originales) {
  const nuevo = genPorNombre.get(nombre);
  if (!nuevo) {
    console.log(`FALTA en 0128: ${nombre}`);
    ok = false;
    continue;
  }
  const a = soloLogica(def.replace(/^create\s+(or replace\s+)?function/i, "create or replace function"));
  const b = soloLogica(nuevo);
  if (a !== b) {
    ok = false;
    console.log(`DIFIERE EN LÓGICA: ${nombre}`);
    console.log("  orig:", a.slice(0, 400));
    console.log("  gen :", b.slice(0, 400));
  } else {
    console.log(`ok      ${nombre}`);
  }
}
console.log(ok ? "\nTODO OK: solo difieren mensajes." : "\nHUBO DIFERENCIAS.");