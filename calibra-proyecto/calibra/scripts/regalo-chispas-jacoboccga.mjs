// Regalo puntual de Chispas pedido por el dueño del proyecto (2026-10-06):
// +10.000 Chispas (profiles.puntos_total) a la cuenta con correo
// jacoboccga@gmail.com. Corrido una sola vez, a mano, vía Admin API con
// SUPABASE_SERVICE_ROLE_KEY. Se deja en el repo como registro de auditoría,
// no para volver a correrlo: NO es idempotente (cada corrida vuelve a sumar).
//
// Uso: node scripts/regalo-chispas-jacoboccga.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CORREO = "jacoboccga@gmail.com";
const CHISPAS = 10000;

function leerEnv(nombreArchivo) {
  const vars = {};
  for (const linea of readFileSync(path.join(RAIZ, nombreArchivo), "utf-8").split("\n")) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2].trim();
  }
  return vars;
}

const env = leerEnv(".env.local");
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function buscarUsuario(correo) {
  for (let page = 1; page < 100; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const u = data.users.find((x) => (x.email ?? "").toLowerCase() === correo);
    if (u) return u;
    if (data.users.length < 1000) return null;
  }
  return null;
}

async function main() {
  const usuario = await buscarUsuario(CORREO);
  if (!usuario) throw new Error(`No existe ninguna cuenta con el correo ${CORREO}`);

  const { data: antes, error: e1 } = await admin.from("profiles").select("display_name, puntos_total").eq("id", usuario.id).single();
  if (e1) throw e1;

  const { error: e2 } = await admin.from("profiles").update({ puntos_total: antes.puntos_total + CHISPAS }).eq("id", usuario.id);
  if (e2) throw e2;

  const { data: despues, error: e3 } = await admin.from("profiles").select("puntos_total").eq("id", usuario.id).single();
  if (e3) throw e3;

  console.log(JSON.stringify({ id: usuario.id, nombre: antes.display_name, antes: antes.puntos_total, despues: despues.puntos_total }));
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
