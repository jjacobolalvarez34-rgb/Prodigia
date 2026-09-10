// Genera 0128_espanol_neutro.sql recreando (create or replace function) las funciones
// cuya ÚLTIMA definición contiene voseo en literales (raise exception), solo cambiando
// esos mensajes a español neutro. Sin cambios de lógica. Apoya al analizador
// analizar-voseo-funciones.mjs. Uso: node scripts/generar-migracion-neutro.mjs
import { readFileSync, writeFileSync } from "node:fs";

const PENDIENTES = JSON.parse(readFileSync("scripts/_analisis-voseo-fn.json", "utf8"));

const PAREJAS = [
  ["tenes", "tienes"],
  ["tenés", "tienes"],
  ["podes", "puedes"],
  ["podés", "puedes"],
  ["querés", "quieres"],
  ["queres", "quieres"],
  ["sos", "eres"],
  ["probá", "prueba"],
  ["elegí", "elige"],
  ["seguí", "sigue"],
  ["andá", "anda"],
  ["mirá", "mira"],
  ["salí", "sal"],
  ["llegá", "llega"],
  ["tenés", "tienes"],
].map(([a, b]) => [new RegExp(`(?<![\\p{L}\\p{N}_])${a}(?![\\p{L}\\p{N}_])`, "giu"), b]);

const RE_A_VOS = /a\s+vos\b/giu;

function capitalizarIgual(fuente, objetivo) {
  if (!fuente) return objetivo;
  if (fuente[0] === fuente[0].toUpperCase() && fuente[0] !== fuente[0].toLowerCase()) {
    return objetivo[0].toUpperCase() + objetivo.slice(1);
  }
  return objetivo;
}

function normalizar(texto) {
  let out = texto;
  for (const [re, obj] of PAREJAS) {
    out = out.replace(re, (m) => capitalizarIgual(m, obj));
  }
  out = out.replace(RE_A_VOS, "a ti");
  return out;
}

const funciones = pendientesOrdenados(PENDIENTES);
const bloques = [];
for (const { nombre, def } of funciones) {
  const nuevo = normalizar(def);
  const igual = nuevo === def;
  console.log(`${igual ? "SIN CAMBIO" : "cambiada  "} ${nombre}`);
  if (!igual) bloques.push({ nombre, def, nuevo });
}

const header = `-- 0128: Español neutro latinoamericano — mensajes de negocio (RPC) sin voseo.
-- Sigue a 0127_trastienda_ruleta_casino.sql.
--
-- Recrea funciones que todavía exponían rioplatense en sus raise exception,
-- únicamente cambiando esos mensajes a formas neutras ('tenés'→'tienes',
-- 'podés'→'puedes', 'no sos'→'no eres', 'elegí'→'elige', 'probá'→'prueba',
-- 'salí'→'sal', 'a vos'→'a ti'). NINGÚN cambio de lógica; mismas firmas y
-- grants (se recrean con create or replace function).
--
-- Orden de aplicación recomendado: 0123 → 0124 → 0125 → 0126 → 0127 → 0128.
-- Idempotente.

`;

const body = bloques
  .map(({ def, nuevo }) => {
    const soloMensajes = mensajesCambiados(def, nuevo);
    return `---------- ${firstPara(def)} ----------
-- Mensajes cambiados:
${soloMensajes}
${final(nuevo)}`;
  })
  .join("\n");

writeFileSync("supabase/migrations/0128_espanol_neutro.sql", header + body, "utf8");
console.log(`\nEscrito supabase/migrations/0128_espanol_neutro.sql (${bloques.length} funciones).`);

// --- helpers ---
function pendientesOrdenados(lista) {
  // Ordena por archivo de origen (orden cronológico de migración).
  return lista.sort((a, b) => a.archivo.localeCompare(b.archivo));
}
function final(def) {
  return def.replace(/^create\s+(or replace\s+)?function/i, "create or replace function");
}
function firstPara(def) {
  const m = def.match(/function\s+(?:public\.)?[a-z0-9_]+/i);
  return (m && m[0]) || "función";
}
function mensajesCambiados(def, nuevo) {
  const antes = def.match(/raise exception\s+'[^']*'/gi) || [];
  const despues = nuevo.match(/raise exception\s+'[^']*'/gi) || [];
  const lineas = [];
  const n = Math.max(antes.length, despues.length);
  for (let i = 0; i < n; i++) {
    const a = (antes[i] || "").replace(/^raise exception\s+'/, "'").replace(/'$/, "");
    const d = (despues[i] || "").replace(/^raise exception\s+'/, "'").replace(/'$/, "");
    lineas.push(`   ${a}  →  ${d}`);
  }
  return lineas.join("\n");
}