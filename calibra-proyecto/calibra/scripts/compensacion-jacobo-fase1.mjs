// Compensación puntual por el bug de Fase 1 (auditoría de
// estabilización, 2026-08-30): Enigmia no registraba NINGÚN acierto en
// ningún modo (Practicar/Rankeds/Reto diario) — logic_attempts.puzzle_id
// era `uuid references logic_puzzles(id)`, pero los acertijos
// procedurales (memoria/patrones/computacional, ~75% de Practicar/
// Rankeds y 100% de Reto diario) mandan un id sintético no-uuid, así
// que el insert fallaba SIEMPRE para ese contenido — en silencio, el
// cliente ignora el error del fetch. Ver migración
// 0099_fix_logic_attempts_puzzle_id.sql para el fix real.
//
// La cuenta "jacobo" reportó haber respondido TODO bien en una partida
// y terminar con 0 correctas y 0 Experiencia — exactamente el síntoma
// de este bug. Compensación acordada (NO mezclada con el fix en sí, ver
// abajo):
//   +6000 Chispas (puntos_total, gastable)
//   nivel de cuenta -> 5 (con xp_historico_total ajustado al piso real
//     de nivel 5 según xp_requerido_nivel_cuenta, para que la barra de
//     progreso de /perfil quede coherente, no solo el número)
//   +3000 Experiencia específica de Enigmia (world_progress.puntos_mundo,
//     con nivel_mundo recalculado con la MISMA fórmula que
//     registrar_puntos_mundo — no un número inventado)
//
// Corrido una sola vez, a mano, el 2026-08-30 (yo, Claude, vía Admin
// API con SUPABASE_SERVICE_ROLE_KEY) — se deja el script en el repo
// como registro de auditoría, no para volver a correrlo (correrlo de
// nuevo DUPLICARÍA la compensación, no es idempotente a propósito: cada
// corrida sería una nueva ejecución que vuelve a sumar Chispas/XP).
//
// Uso: node scripts/compensacion-jacobo-fase1.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const env = leerEnv(".env.local");
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const JACOBO_ID = "814276f4-d006-42e6-97ed-7ad702f8199d"; // display_name = 'jacobo', confirmado por búsqueda directa
const CHISPAS_COMPENSACION = 6000;
const NIVEL_CUENTA_OBJETIVO = 5;
const XP_ENIGMIA_COMPENSACION = 3000;

async function main() {
  const { data: perfilAntes, error: errorPerfil } = await admin
    .from("profiles")
    .select("puntos_total, nivel_cuenta, xp_historico_total")
    .eq("id", JACOBO_ID)
    .single();
  if (errorPerfil) throw errorPerfil;
  console.log("Antes:", perfilAntes);

  const { data: xpReqFila, error: errorXpReq } = await admin.rpc("xp_requerido_nivel_cuenta", { p_nivel: NIVEL_CUENTA_OBJETIVO });
  if (errorXpReq) throw errorXpReq;
  const xpHistoricoObjetivo = Math.max(perfilAntes.xp_historico_total, xpReqFila);

  const { error: errorUpdatePerfil } = await admin
    .from("profiles")
    .update({
      puntos_total: perfilAntes.puntos_total + CHISPAS_COMPENSACION,
      nivel_cuenta: Math.max(perfilAntes.nivel_cuenta, NIVEL_CUENTA_OBJETIVO),
      xp_historico_total: xpHistoricoObjetivo,
    })
    .eq("id", JACOBO_ID);
  if (errorUpdatePerfil) throw errorUpdatePerfil;
  console.log(`Chispas +${CHISPAS_COMPENSACION}, nivel_cuenta -> ${NIVEL_CUENTA_OBJETIVO}, xp_historico_total -> ${xpHistoricoObjetivo}`);

  // world_progress de Enigmia — misma fórmula que registrar_puntos_mundo
  // (0089_mundo_melodia.sql), rama 'enigmia': v_temas_totales=1,
  // v_frac_volumen = min(1, puntos/50000), v_frac_dominio =
  // temas_en_10/1, v_frac_lecciones = completadas/totales.
  const { data: wpAntes } = await admin.from("world_progress").select("puntos_mundo").eq("user_id", JACOBO_ID).eq("world", "enigmia").maybeSingle();
  const puntosMundoNuevo = (wpAntes?.puntos_mundo ?? 0) + XP_ENIGMIA_COMPENSACION;

  const { count: temasEn10 } = await admin.from("logic_skill_levels").select("id", { count: "exact", head: true }).eq("user_id", JACOBO_ID).eq("nivel", 10);
  const { count: leccionesTotales } = await admin.from("logic_techniques").select("id", { count: "exact", head: true });
  const { count: leccionesCompletadas } = await admin
    .from("logic_technique_progress")
    .select("technique_id", { count: "exact", head: true })
    .eq("user_id", JACOBO_ID)
    .eq("dominado", true);

  const fracVolumen = Math.min(1, puntosMundoNuevo / 50000);
  const fracDominio = (temasEn10 ?? 0) / 1;
  const fracLecciones = (leccionesTotales ?? 0) > 0 ? (leccionesCompletadas ?? 0) / leccionesTotales : 1;
  const nivelMundo = Math.max(1, Math.min(100, Math.round(100 * (0.3 * fracVolumen + 0.5 * fracDominio + 0.2 * fracLecciones))));

  const { error: errorWp } = await admin.from("world_progress").upsert(
    {
      user_id: JACOBO_ID,
      world: "enigmia",
      puntos_mundo: puntosMundoNuevo,
      nivel_mundo: nivelMundo,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,world" }
  );
  if (errorWp) throw errorWp;
  console.log(`world_progress enigmia: puntos_mundo -> ${puntosMundoNuevo}, nivel_mundo -> ${nivelMundo}`);

  const { data: perfilDespues } = await admin
    .from("profiles")
    .select("puntos_total, nivel_cuenta, xp_historico_total")
    .eq("id", JACOBO_ID)
    .single();
  console.log("Después:", perfilDespues);
  console.log("Compensación aplicada.");
}

main().catch((err) => {
  console.error("FALLÓ:", err);
  process.exit(1);
});
