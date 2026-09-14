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

const supabase = createClient(envLocal.NEXT_PUBLIC_SUPABASE_URL, envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: envTest.QA_EMAIL,
  password: envTest.QA_PASSWORD,
});
if (authError) {
  console.error("LOGIN FALLO:", authError);
  process.exit(1);
}
console.log(`Logueado como ${authData.user.email} (${authData.user.id})\n`);

async function probar(nombre, fn) {
  try {
    const { data, error } = await fn();
    if (error) {
      console.log(`[${nombre}] ERROR code=${error.code} message=${error.message}`);
      if (error.details) console.log(`  details: ${error.details}`);
      if (error.hint) console.log(`  hint: ${error.hint}`);
    } else {
      console.log(`[${nombre}] OK ->`, JSON.stringify(data).slice(0, 300));
    }
  } catch (e) {
    console.log(`[${nombre}] EXCEPCION:`, e.message);
  }
}

await probar("fetch_apuestas_disponibles", () => supabase.rpc("fetch_apuestas_disponibles"));
await probar("girar_ruleta", () => supabase.rpc("girar_ruleta"));
await probar("fetch_trastienda_historial", () => supabase.rpc("fetch_trastienda_historial"));
await probar("iniciar_la_calcu", () => supabase.rpc("iniciar_la_calcu"));
await probar("iniciar_la_pizarra", () => supabase.rpc("iniciar_la_pizarra"));
await probar("ventana_predicciones", () => supabase.rpc("ventana_predicciones"));
await probar("cobrar_predicciones_pendientes", () => supabase.rpc("cobrar_predicciones_pendientes"));
await probar("apostar_casino_elementos (zona=grupo:18, monto=100)", () =>
  supabase.rpc("apostar_casino_elementos", { p_zona: "grupo:18", p_monto: 100 })
);
await probar("apostar_casino_elementos_multi (2 zonas)", () =>
  supabase.rpc("apostar_casino_elementos_multi", {
    p_zonas: ["grupo:18", "tipo:alcalino"],
    p_montos: [100, 100],
  })
);
await probar("tirar_volado (ronda=1)", () => supabase.rpc("tirar_volado", { p_ronda: 1, p_eleccion: true }));
await probar("crear_clan (esperado: rechazo de negocio, no 42702)", () =>
  supabase.rpc("crear_clan", { p_nombre: "zzz_test_diag", p_tag: null, p_color: null, p_descripcion: null })
);
