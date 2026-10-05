// Verificación de paridad web ↔ app (../calibra/docs/PARIDAD_APP_WEB.md).
// Uso: npm run paridad   (sale con código 1 si algo existe en un lado y no en el otro)
//
// Revisa, leyendo el código fuente (sin ejecutar nada):
//   1. Modos: cada clave de NOMBRE_MODO_* / NOMBRE_CATEGORIA_ENIGMIA de la web que
//      usa un adaptador de la app tiene que estar completa (todos los modos).
//   2. Mundos: los 13 con enApp: true en src/tema.ts y con adaptador o pantalla propia.
//   3. Visuales de lecciones: los mismos `tipo` registrados en la web
//      (components/<mundo>/visuales/registro.ts) y en la app (src/ui/aprender/registro.ts).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const web = resolve(raiz, "../calibra/src");
const leer = (p) => readFileSync(p, "utf8");
const problemas = [];
const avisos = [];

// Busca en la web el objeto `export const NOMBRE = { clave: ..., }` y devuelve sus claves.
const cacheObjetos = new Map();
function clavesDeObjetoWeb(nombre) {
  if (cacheObjetos.has(nombre)) return cacheObjetos.get(nombre);
  const pila = [web];
  while (pila.length) {
    const dir = pila.pop();
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name !== "node_modules" && e.name !== "__tests__") pila.push(p);
        continue;
      }
      if (!/\.tsx?$/.test(e.name) || /\.test\./.test(e.name)) continue;
      const s = leer(p);
      const m = new RegExp(`export const ${nombre}\\b[^=]*=\\s*\\{([\\s\\S]*?)\\n\\};`).exec(s);
      if (m) {
        const claves = [...m[1].matchAll(/^\s*"?([a-z_0-9]+)"?\s*:/gm)].map((x) => x[1]);
        cacheObjetos.set(nombre, claves);
        return claves;
      }
    }
  }
  cacheObjetos.set(nombre, null);
  return null;
}

// ---------- 1. Modos de cada mundo ----------
const dirAdaptadores = join(raiz, "src/lib/mundosJugables");
const adaptadores = readdirSync(dirAdaptadores).filter((f) => f.endsWith(".ts") && !["index.ts", "tipos.ts"].includes(f));
for (const archivo of adaptadores) {
  const s = leer(join(dirAdaptadores, archivo));
  const usados = new Map();
  for (const m of s.matchAll(/(NOMBRE_(?:MODO_[A-Z]+|CATEGORIA_ENIGMIA))\.([a-z_0-9]+)/g)) {
    if (!usados.has(m[1])) usados.set(m[1], new Set());
    usados.get(m[1]).add(m[2]);
  }
  if (usados.size === 0) problemas.push(`${archivo}: no usa los nombres de modo de la web (NOMBRE_MODO_*)`);
  for (const [objeto, claves] of usados) {
    const deWeb = clavesDeObjetoWeb(objeto);
    if (!deWeb) {
      problemas.push(`${archivo}: no encuentro ${objeto} en la web`);
      continue;
    }
    const faltan = deWeb.filter((k) => !claves.has(k));
    if (faltan.length) problemas.push(`${archivo}: faltan modos de la web en la app → ${faltan.join(", ")}`);
  }
}

// ---------- 2. Mundos ----------
const tema = leer(join(raiz, "src/tema.ts"));
const mundos = [...tema.matchAll(/slug: "([a-z]+)",[^\n]*enApp: (true|false)/g)].map((m) => ({ slug: m[1], enApp: m[2] === "true" }));
if (mundos.length !== 13) problemas.push(`tema.ts: se esperaban 13 mundos y hay ${mundos.length}`);
const conPantallaPropia = new Set(["numeria", "geografia"]);
const registro = leer(join(dirAdaptadores, "index.ts"));
for (const m of mundos) {
  if (!m.enApp) problemas.push(`tema.ts: ${m.slug} no está habilitado en la app (enApp: false)`);
  if (!conPantallaPropia.has(m.slug) && !new RegExp(`\\b${m.slug}:`).test(registro)) problemas.push(`mundosJugables/index.ts: ${m.slug} no tiene adaptador`);
}

// ---------- 3. Visuales de lecciones ----------
const tiposWeb = new Set(["cuadros"]);
for (const e of readdirSync(join(web, "components"), { withFileTypes: true })) {
  const reg = join(web, "components", e.name, "visuales/registro.ts");
  if (!e.isDirectory() || !existsSync(reg)) continue;
  for (const m of leer(reg).matchAll(/^\s*"([a-z]+\.[a-zA-Z_-]+)"\s*:/gm)) tiposWeb.add(m[1]);
}
const regApp = join(raiz, "src/ui/aprender/registro.ts");
const tiposApp = new Set();
if (existsSync(regApp)) for (const m of leer(regApp).matchAll(/^\s*"?([a-z]+(?:\.[a-zA-Z_-]+)?)"?\s*:/gm)) tiposApp.add(m[1]);
const faltanApp = [...tiposWeb].filter((t) => !tiposApp.has(t)).sort();
const sobranApp = [...tiposApp].filter((t) => !tiposWeb.has(t)).sort();
if (faltanApp.length) problemas.push(`visuales de lecciones que la web tiene y la app no (${faltanApp.length}): ${faltanApp.join(", ")}`);
if (sobranApp.length) avisos.push(`visuales de la app que la web no registra: ${sobranApp.join(", ")}`);

// ---------- Resultado ----------
console.log(`Paridad web ↔ app: ${adaptadores.length} adaptadores, ${mundos.length} mundos, ${tiposWeb.size} visuales de lecciones en la web, ${tiposApp.size} en la app.`);
for (const a of avisos) console.log(`  aviso: ${a}`);
if (problemas.length) {
  console.error(`\n✗ ${problemas.length} diferencia(s):`);
  for (const p of problemas) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("✓ Web y app alineadas.");
