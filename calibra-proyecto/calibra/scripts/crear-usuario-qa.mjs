// Crea (o reconfirma) cuentas fijas de QA que las sesiones de Claude
// Code usan para loguearse y probar flujos reales de punta a punta
// (duelos, rachas, world_progress, compras...) sin depender de un
// correo de confirmación real — algo que se repetía como bloqueo en
// casi todas las sesiones anteriores.
//
// Usa el Admin API de Supabase (auth.admin.createUser con
// email_confirm: true) en vez del dashboard: confirma la cuenta en el
// mismo paso en el que la crea, sin tocar ningún botón a mano. Por eso
// necesita SUPABASE_SERVICE_ROLE_KEY en .env.local (Settings → API →
// service_role en el dashboard de Supabase) — la misma variable que ya
// pedía src/lib/supabase/admin.ts para /api/perfil/eliminar-cuenta, así
// que agregarla acá destraba las dos cosas a la vez.
//
// La cuenta queda con TODOS los mundos desbloqueados y todo diagnóstico
// salteado (a propósito: el objetivo es probar mecánicas de juego, no
// repetir el onboarding cada vez) y un saldo generoso de Chispas para
// poder probar compras también.
//
// Uso: node scripts/crear-usuario-qa.mjs
// Segunda cuenta (para probar duelos de verdad, un lado en cada
// cuenta): QA_SLOT=2 node scripts/crear-usuario-qa.mjs
// (opcional: QA_EMAIL=otra@direccion.com también funciona para pisar
// el email por defecto de ese slot)
//
// Las credenciales resultantes se guardan en .env.test.local (una
// sección QA_EMAIL/QA_PASSWORD/QA_USER_ID por slot, sin pisar las de
// otros slots) — gitignoreado por la regla existente ".env*.local"
// (nunca .env.test a secas, esa NO está cubierta por esa regla).

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function leerEnvLocal(nombreArchivo) {
  const ruta = path.join(RAIZ, nombreArchivo);
  if (!existsSync(ruta)) return {};
  const contenido = readFileSync(ruta, "utf-8");
  const vars = {};
  for (const linea of contenido.split("\n")) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2].trim();
  }
  return vars;
}

const env = leerEnvLocal(".env.local");
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local — " +
      "agregá SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role en el dashboard de Supabase) y volvé a correr este script."
  );
  process.exit(1);
}

const SLOT = process.env.QA_SLOT?.trim() || "1";
const SUFIJO = SLOT === "1" ? "" : `_${SLOT}`;
const QA_EMAIL = process.env.QA_EMAIL || `solirinaalmacen+prodigia-qa${SLOT === "1" ? "" : `-${SLOT}`}@gmail.com`;
const QA_PASSWORD = randomBytes(18).toString("base64url");
const NOMBRE_PERFIL = SLOT === "1" ? "QA Tester" : `QA Tester ${SLOT}`;

const TODOS_LOS_MUNDOS = ["numeria", "geografia", "enigmia", "quimia", "anatomia", "melodia"];

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Si ya existe (segunda corrida de este script — ej. para resetear la
  // contraseña), la reconfirmamos y actualizamos en vez de fallar por
  // "usuario duplicado".
  const { data: listado, error: errorListado } = await admin.auth.admin.listUsers();
  if (errorListado) throw errorListado;
  const existente = listado.users.find((u) => u.email === QA_EMAIL);

  let userId;
  if (existente) {
    const { data, error } = await admin.auth.admin.updateUserById(existente.id, {
      password: QA_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Cuenta QA (slot ${SLOT}) ya existía (${QA_EMAIL}) — contraseña reseteada y reconfirmada.`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: QA_EMAIL,
      password: QA_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Cuenta QA (slot ${SLOT}) creada y confirmada: ${QA_EMAIL}`);
  }

  // handle_new_user() (0001_init.sql) ya insertó la fila de profiles al
  // crear el usuario — acá solo la dejamos lista para probar mecánicas
  // de juego sin tener que pasar por onboarding/diagnósticos/compras
  // cada vez que se use esta cuenta.
  const { error: errorPerfil } = await admin
    .from("profiles")
    .update({
      display_name: NOMBRE_PERFIL,
      mundos_desbloqueados: TODOS_LOS_MUNDOS,
      onboarding_completado: true,
      onboarding_enigmia_completado: true,
      onboarding_quimia_completado: true,
      onboarding_anatomia_completado: true,
      onboarding_melodia_completado: true,
      puntos_total: 50000,
    })
    .eq("id", userId);
  if (errorPerfil) throw errorPerfil;
  console.log(`Perfil QA (slot ${SLOT}) listo: todos los mundos desbloqueados, diagnósticos salteados, 50000 Chispas.`);

  // Merge, no overwrite: si ya hay un .env.test.local con otro slot
  // guardado (ej. slot 1), no lo pisamos — solo reemplazamos las 3
  // líneas de ESTE slot.
  const existentes = leerEnvLocal(".env.test.local");
  existentes[`QA_EMAIL${SUFIJO}`] = QA_EMAIL;
  existentes[`QA_PASSWORD${SUFIJO}`] = QA_PASSWORD;
  existentes[`QA_USER_ID${SUFIJO}`] = userId;

  const lineas = Object.entries(existentes).map(([k, v]) => `${k}=${v}`);
  const envTest = `# Generado por scripts/crear-usuario-qa.mjs — NO se sube al repo
# (.env*.local está en .gitignore). Cuentas de prueba fijas, con email
# ya confirmado vía el Admin API — usar estas credenciales para
# loguearse en sesiones futuras y probar flujos reales (duelos, rachas,
# world_progress, compras) sin depender de un correo de confirmación
# real. QA_EMAIL/QA_PASSWORD es la cuenta principal; QA_EMAIL_2/etc. son
# cuentas extra para simular ambos lados de un duelo. Si hace falta
# resetear una contraseña, volvé a correr scripts/crear-usuario-qa.mjs
# (con QA_SLOT=2 para la segunda, etc.).
${lineas.join("\n")}
`;
  writeFileSync(path.join(RAIZ, ".env.test.local"), envTest, "utf-8");
  console.log("Credenciales guardadas en .env.test.local");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
