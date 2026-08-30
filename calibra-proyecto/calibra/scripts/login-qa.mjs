// Helper reutilizable para sesiones futuras: loguea con la cuenta fija
// de QA (ver scripts/crear-usuario-qa.mjs) y devuelve la cookie exacta
// que @supabase/ssr espera en el server de Next (src/lib/supabase/server.ts
// solo lee cookies, nunca un header Authorization) — así un script de
// Node puede pegarle a las rutas reales de la app (/api/attempts, etc.)
// como si fuera un browser logueado, sin Playwright ni nada headless.
//
// Formato de la cookie verificado leyendo el código fuente instalado:
// - nombre: `sb-${ref}-auth-token`, ref = subdominio de NEXT_PUBLIC_SUPABASE_URL
//   (@supabase/supabase-js, SupabaseClient.ts: defaultStorageKey)
// - valor: "base64-" + base64url(JSON.stringify(session)), sin chunking
//   porque una sesión normal entra debajo de MAX_CHUNK_SIZE (3180)
//   (@supabase/ssr, cookies.js + utils/chunker.js)
//
// Uso directo: node scripts/login-qa.mjs
//   (imprime la cookie lista para pegar en un header Cookie: a mano)
// Uso como módulo:
//   import { cookieQA } from "./login-qa.mjs";
//   const { header } = await cookieQA();
//   await fetch("http://localhost:3000/api/attempts", { headers: { Cookie: header }, ... });

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function leerEnv(nombreArchivo) {
  const contenido = readFileSync(path.join(RAIZ, nombreArchivo), "utf-8");
  const vars = {};
  for (const linea of contenido.split("\n")) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2].trim();
  }
  return vars;
}

// slot: "1" (default, cuenta principal) o "2" (segunda cuenta, para
// simular el otro lado de un duelo — ver QA_SLOT en crear-usuario-qa.mjs).
export async function cookieQA(slot = "1") {
  const envLocal = leerEnv(".env.local");
  const envTest = leerEnv(".env.test.local");
  const sufijo = slot === "1" ? "" : `_${slot}`;

  const SUPABASE_URL = envLocal.NEXT_PUBLIC_SUPABASE_URL;
  const ANON_KEY = envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const QA_EMAIL = envTest[`QA_EMAIL${sufijo}`];
  const QA_PASSWORD = envTest[`QA_PASSWORD${sufijo}`];

  if (!SUPABASE_URL || !ANON_KEY) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL/ANON_KEY en .env.local");
  if (!QA_EMAIL || !QA_PASSWORD) {
    throw new Error(
      `Falta QA_EMAIL${sufijo}/QA_PASSWORD${sufijo} en .env.test.local — corré QA_SLOT=${slot} node scripts/crear-usuario-qa.mjs`
    );
  }

  const supabase = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({ email: QA_EMAIL, password: QA_PASSWORD });
  if (error) throw error;

  const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
  const nombreCookie = `sb-${ref}-auth-token`;
  const valorCookie = "base64-" + Buffer.from(JSON.stringify(data.session), "utf-8").toString("base64url");

  return {
    userId: data.user.id,
    email: data.user.email,
    nombreCookie,
    valorCookie,
    header: `${nombreCookie}=${valorCookie}`,
  };
}

// Comparar contra pathToFileURL (no un template string a mano) — en
// Windows import.meta.url es "file:///D:/..." mientras que
// process.argv[1] es "D:\..." (barras invertidas, sin prefijo file://),
// así que la comparación ingenua nunca matcheaba y el script quedaba
// mudo (ni error ni output) al correrlo directo.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { userId, email, header } = await cookieQA(process.argv[2] || "1");
  console.log(`Logueado como ${email} (${userId})`);
  console.log("\nHeader Cookie para fetch/curl contra http://localhost:3000:\n");
  console.log(header);
}
