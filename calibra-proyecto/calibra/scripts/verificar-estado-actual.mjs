import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function leerEnv(nombreArchivo) {
  const contenido = readFileSync(nombreArchivo, "utf-8");
  const vars = {};
  for (const linea of contenido.split("\n")) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2].trim();
  }
  return vars;
}
const envLocal = leerEnv(".env.local");
const envTest = leerEnv(".env.test.local");
const admin = createClient(envLocal.NEXT_PUBLIC_SUPABASE_URL, envLocal.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function chequear(nombre, fn) {
  try {
    const r = await fn();
    console.log(`[OK] ${nombre}:`, r);
  } catch (e) {
    console.log(`[ERROR] ${nombre}:`, e.message ?? e);
  }
}

async function main() {
  await chequear("profiles.es_cuenta_prueba (0126)", async () => {
    const { data, error } = await admin.from("profiles").select("es_cuenta_prueba").limit(1);
    if (error) throw error;
    return `columna existe`;
  });
  await chequear("trastienda_reloj (debería NO existir, borrada en 0126)", async () => {
    const { error } = await admin.from("trastienda_reloj").select("id", { count: "exact", head: true });
    if (error) return `no existe (esperado): ${error.message}`;
    return "TODAVÍA EXISTE";
  });
  await chequear("trastienda_casino_elementos (0127) — cantidad real", async () => {
    const { data, error } = await admin.from("trastienda_casino_elementos").select("simbolo");
    if (error) throw error;
    return `${data.length} filas (118 esperado)`;
  });
  await chequear("profiles.afinidad_banner (0125)", async () => {
    const { error } = await admin.from("profiles").select("afinidad_banner").limit(1);
    if (error) throw error;
    return "columna existe";
  });

  const client = createClient(envLocal.NEXT_PUBLIC_SUPABASE_URL, envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: loginError } = await client.auth.signInWithPassword({ email: envTest.QA_EMAIL, password: envTest.QA_PASSWORD });
  if (loginError) {
    console.log("[ERROR] login QA1:", loginError.message);
    return;
  }

  await chequear("elegir_mundo_inicial legacy (debería estar revocada, 0116)", async () => {
    const { error } = await client.rpc("elegir_mundo_inicial", { p_mundo: "numeria" });
    if (!error) return "TODAVÍA CALLABLE (no se revocó)";
    if (error.message.includes("permission denied") || error.code === "42501") return `revocada correctamente: ${error.message}`;
    return `responde con error de negocio (no revocada): ${error.message}`;
  });

  await chequear("ventana_predicciones (0126)", async () => {
    const { data, error } = await client.rpc("ventana_predicciones");
    if (error) throw error;
    return JSON.stringify(data);
  });

  await chequear("registrar_xp_diario real (0120, deriva del xp real del dia)", async () => {
    const { data, error } = await client.rpc("registrar_xp_diario", { p_xp: 0 });
    if (error) throw error;
    return JSON.stringify(data);
  });

  await client.auth.signOut();
}

main().catch((e) => {
  console.error("FALLÓ:", e);
  process.exit(1);
});
