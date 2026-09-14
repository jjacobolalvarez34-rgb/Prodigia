// Verificación en vivo de 0140 (invitar_a_clan) — correr DESPUÉS de que
// el propietario aplique 0138, 0139 y 0140 en Supabase.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function leerEnv(f) {
  const c = readFileSync(f, "utf-8");
  const v = {};
  for (const l of c.split("\n")) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) v[m[1]] = m[2].trim();
  }
  return v;
}

const envLocal = leerEnv(".env.local");
const envTest = leerEnv(".env.test.local");

async function clienteLogueado(slot) {
  const sufijo = slot === "1" ? "" : `_${slot}`;
  const supabase = createClient(envLocal.NEXT_PUBLIC_SUPABASE_URL, envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({
    email: envTest[`QA_EMAIL${sufijo}`],
    password: envTest[`QA_PASSWORD${sufijo}`],
  });
  if (error) throw error;
  return { supabase, userId: data.user.id, email: data.user.email };
}

const uno = await clienteLogueado("1");
const dos = await clienteLogueado("2");
console.log("QA1:", uno.email, uno.userId);
console.log("QA2:", dos.email, dos.userId);

async function probar(nombre, fn) {
  try {
    const { data, error } = await fn();
    if (error) console.log(`[${nombre}] ERROR code=${error.code} message=${error.message}`);
    else console.log(`[${nombre}] OK ->`, JSON.stringify(data));
  } catch (e) {
    console.log(`[${nombre}] EXCEPCION:`, e.message);
  }
}

await probar("mis_invitaciones_clan (QA1)", () => uno.supabase.rpc("mis_invitaciones_clan"));
await probar("amigos_invitables_a_mi_clan (QA1)", () => uno.supabase.rpc("amigos_invitables_a_mi_clan"));
await probar("mi_clan (QA1)", () => uno.supabase.rpc("mi_clan"));

// Si QA1 tiene clan y QA1/QA2 son amigos, esto invita de verdad.
// Comentado a propósito — descomentar a mano cuando se quiera probar
// el flujo completo (deja estado real en la base).
// await probar("invitar_a_clan (QA1 -> QA2)", () => uno.supabase.rpc("invitar_a_clan", { p_user_id: dos.userId }));
