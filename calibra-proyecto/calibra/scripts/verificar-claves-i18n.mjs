// Verifica que toda llamada t("clave")/t.rich("clave") en src/**/*.{ts,tsx}
// resuelva contra una clave real de messages/es.json, dado el namespace que
// useTranslations(...)/getTranslations(...) declaró en ese mismo archivo.
// No es un chequeo perfecto (no sigue variables dinámicas en la clave, ni
// namespaces pasados como variable) pero atrapa el caso común: typo o clave
// que el agente olvidó escribir en el fragmento.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const es = JSON.parse(readFileSync("messages/es.json", "utf8"));

function resolver(namespace, clave) {
  const partes = [...namespace.split("."), ...clave.split(".")];
  let cur = es;
  for (const p of partes) {
    if (cur == null || typeof cur !== "object") return false;
    cur = cur[p];
  }
  return cur !== undefined;
}

function* archivos(dir) {
  for (const nombre of readdirSync(dir)) {
    if (nombre === "node_modules" || nombre === ".next") continue;
    const ruta = join(dir, nombre);
    const info = statSync(ruta);
    if (info.isDirectory()) yield* archivos(ruta);
    else if ([".ts", ".tsx"].includes(extname(nombre))) yield ruta;
  }
}

const problemas = [];
let totalLlamadas = 0;

for (const ruta of archivos("src")) {
  const texto = readFileSync(ruta, "utf8");
  // Namespaces declarados en el archivo: useTranslations("X") / getTranslations("X") / getTranslations({ namespace: "X" })
  const namespaces = [];
  for (const m of texto.matchAll(/(?:useTranslations|getTranslations)\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
    namespaces.push(m[1]);
  }
  for (const m of texto.matchAll(/getTranslations\(\s*\{\s*[^}]*namespace:\s*["'`]([^"'`]+)["'`]/g)) {
    namespaces.push(m[1]);
  }
  if (namespaces.length === 0) continue;

  // Llamadas t("clave") / t.rich("clave") / t.markup("clave") con clave literal.
  for (const m of texto.matchAll(/\bt\.?(?:rich|markup)?\(\s*["'`]([^"'`]+)["'`]/g)) {
    const clave = m[1];
    totalLlamadas++;
    const resuelve = namespaces.some((ns) => resolver(ns, clave));
    if (!resuelve) {
      problemas.push({ ruta, clave, namespaces });
    }
  }
}

console.log(`Chequeadas ${totalLlamadas} llamadas t(...) en total.`);
if (problemas.length === 0) {
  console.log("Sin problemas: toda clave literal resuelve contra al menos uno de los namespaces declarados en su archivo.");
} else {
  console.log(`\n${problemas.length} clave(s) que NO resuelven:`);
  for (const p of problemas) {
    console.log(`- ${p.ruta}: t("${p.clave}") — namespaces del archivo: [${p.namespaces.join(", ")}]`);
  }
}
