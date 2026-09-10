import fs from "node:fs";
import { createClient as createSvc } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

function leerEnv() {
  const s = fs.readFileSync(process.cwd() + "/.env.local", "utf8");
  const out = {};
  for (const l of s.split(/\r?\n/)) {
    const m = l.match(/^([A-Z_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const env = leerEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = "http://localhost:3000";

const svc = createSvc(url, service, { auth: { persistSession: false, autoRefreshToken: false } });

console.log("== 1) Crear usuario confirmado ==");
const email = `e2e-${Date.now()}@calibra.local`;
const password = "Diag!Test12345";
const { data: creado, error: errC } = await svc.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { nombre: "QA E2E" } });
if (errC || !creado.user) { console.log("ERR createUser:", errC.message); process.exit(1); }
const uid = creado.user.id;
console.log("OK", uid);

console.log("\n== 2) Login con el mismo cliente SSR y capturar la cookie real ==");
const jar = new Map();
const ssr = createServerClient(url, anon, {
  cookies: {
    getAll() { return [...jar].map(([name, { value, options }]) => ({ name, value, options })); },
    setAll(cookiesToSet) {
      cookiesToSet.forEach((c) => jar.set(c.name, { value: c.value, options: c.options }));
    },
  },
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: login, error: errL } = await ssr.auth.signInWithPassword({ email, password });
if (errL || !login.session) { console.log("ERR login:", errL.message); process.exit(1); }
console.log("sesion OK. Cookies que pondria la app:");
const cookiesHeader = [...jar].map(([name, { value }]) => `${name}=${value}`).join("; ");
[...jar].forEach(([name, { value }]) => console.log(`  ${name} (${value.length} chars)`));

console.log("\n== 3) POST /api/attempts (ruta real, cookie real) ==");
const res = await fetch(`${BASE}/api/attempts`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookiesHeader },
  body: JSON.stringify({ problem_type: "suma", level: 1, correct: true, time_ms: 3000 }),
});
const resJson = await res.json().catch(() => null);
console.log("HTTP:", res.status, "| respuesta:", JSON.stringify(resJson));

console.log("\n== 4) POST /api/practica/finish ==");
const started_at = new Date(Date.now() - 60000).toISOString();
const res2 = await fetch(`${BASE}/api/practica/finish`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookiesHeader },
  body: JSON.stringify({ started_at, total_problemas: 1 }),
});
const res2Json = await res2.json().catch(() => null);
console.log("HTTP:", res2.status, "| sprint:", JSON.stringify(res2Json && res2Json.sprint ? res2Json.sprint : res2Json));

const xpOK = resJson && resJson.ok === true && resJson.xp > 0;
const finishOK = res2Json && res2Json.sprint && res2Json.sprint.correctos === 1 && res2Json.sprint.xpGanado > 0;
console.log("\n>>> E2E:", xpOK && finishOK ? "FUNCIONA — el problema NO esta en codigo ni base" : "FALLA — un error real del runtime, arriba");

console.log("\n== 5) Limpieza ==");
await svc.from("attempts").delete().eq("user_id", uid);
await svc.from("skill_levels").delete().eq("user_id", uid);
await svc.from("daily_progress").delete().eq("user_id", uid);
await svc.from("world_progress").delete().eq("user_id", uid);
const du = await svc.auth.admin.deleteUser(uid);
console.log("limpieza:", du.error ? `ERR ${du.error.message}` : "OK");