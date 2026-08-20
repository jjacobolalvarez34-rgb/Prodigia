import type { SupabaseClient } from "@supabase/supabase-js";
import { calcularRachaDiaria } from "@/lib/practica/racha";
import { CATALOGO_TITULOS, type TituloCatalogo } from "./catalogo";

const TIPOS_NUMERIA = ["suma", "resta", "multiplicacion", "division", "fracciones", "decimales", "potencias", "algebra"];
const TIPOS_QUIMIA = ["quimia_simbolos", "quimia_formulas", "quimia_tabla"];

// Mismo espíritu que verificarLogros (src/lib/logros/verificar.ts):
// solo calcula lo que hace falta para los títulos todavía no
// desbloqueados, y llama a desbloquear_titulo (idempotente, RPC ya
// existente para rango) por cada uno que se cumple. Se llama desde los
// mismos puntos que verificarLogros — después de cualquier evento que
// podría destrabar uno.
export async function verificarTitulos(supabase: SupabaseClient, userId: string): Promise<TituloCatalogo[]> {
  const { data: yaDesbloqueados } = await supabase.from("titulos_usuario").select("slug").eq("user_id", userId);
  const slugsDesbloqueados = new Set((yaDesbloqueados ?? []).map((r) => r.slug));
  const pendientes = CATALOGO_TITULOS.filter((t) => !slugsDesbloqueados.has(t.slug));
  if (pendientes.length === 0) return [];

  const tiposNecesarios = new Set(pendientes.map((t) => t.criterio.tipo));
  const hoyIso = new Date().toISOString().slice(0, 10);

  let partidasTotales = 0;
  if (tiposNecesarios.has("partidas_totales")) {
    const [{ count: attemptsCount }, { count: logicCount }] = await Promise.all([
      supabase.from("attempts").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("logic_attempts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);
    partidasTotales = Math.floor(((attemptsCount ?? 0) + (logicCount ?? 0)) / 10);
  }

  let precisionSemana: number | null = null;
  if (tiposNecesarios.has("precision_semana")) {
    const inicioSemana = new Date();
    const dia = inicioSemana.getDay();
    const diffAlLunes = dia === 0 ? 6 : dia - 1;
    inicioSemana.setDate(inicioSemana.getDate() - diffAlLunes);
    inicioSemana.setHours(0, 0, 0, 0);
    const { data: attemptsSemana } = await supabase
      .from("attempts")
      .select("correct")
      .eq("user_id", userId)
      .gte("created_at", inicioSemana.toISOString());
    if (attemptsSemana && attemptsSemana.length >= 20) {
      precisionSemana = attemptsSemana.filter((a) => a.correct).length / attemptsSemana.length;
    }
  }

  let duelosGanados = 0;
  if (tiposNecesarios.has("duelos_ganados")) {
    const { count } = await supabase.from("duels").select("id", { count: "exact", head: true }).eq("ganador_id", userId);
    duelosGanados = count ?? 0;
  }

  let duelosJugados = 0;
  if (tiposNecesarios.has("duelos_jugados")) {
    const { count } = await supabase
      .from("duels")
      .select("id", { count: "exact", head: true })
      .or(`retador_id.eq.${userId},retado_id.eq.${userId}`)
      .eq("estado", "completado");
    duelosJugados = count ?? 0;
  }

  let rachaDuelosGanados = 0;
  if (tiposNecesarios.has("racha_duelos_ganados")) {
    const { data: duelosRows } = await supabase
      .from("duels")
      .select("ganador_id, creado_at")
      .or(`retador_id.eq.${userId},retado_id.eq.${userId}`)
      .eq("estado", "completado")
      .order("creado_at", { ascending: false })
      .limit(50);
    for (const d of duelosRows ?? []) {
      if (d.ganador_id === userId) rachaDuelosGanados++;
      else break;
    }
  }

  let rachaDias = 0;
  if (tiposNecesarios.has("racha_dias")) {
    const { data: dailyRows } = await supabase
      .from("daily_progress")
      .select("fecha, meta_alcanzada")
      .eq("user_id", userId)
      .order("fecha", { ascending: false })
      .limit(400);
    rachaDias = calcularRachaDiaria(dailyRows ?? [], hoyIso);
  }

  let rachaRetosDiarios = 0;
  if (tiposNecesarios.has("racha_retos_diarios")) {
    const { data: retoRows } = await supabase
      .from("retos_diarios_completados")
      .select("fecha")
      .eq("user_id", userId)
      .order("fecha", { ascending: false })
      .limit(400);
    rachaRetosDiarios = calcularRachaDiaria(
      (retoRows ?? []).map((r) => ({ fecha: r.fecha, meta_alcanzada: true })),
      hoyIso
    );
  }

  let mundosExplorados = 0;
  if (tiposNecesarios.has("mundos_explorados")) {
    const { data: worldRows } = await supabase.from("world_progress").select("world").eq("user_id", userId).gt("puntos_mundo", 0);
    mundosExplorados = new Set((worldRows ?? []).map((r) => r.world)).size;
  }

  let esEmbajador = false;
  if (tiposNecesarios.has("embajador")) {
    const { count } = await supabase
      .from("duel_invites")
      .select("id", { count: "exact", head: true })
      .eq("creador_id", userId)
      .eq("estado", "usada");
    esEmbajador = (count ?? 0) > 0;
  }

  let chispasBalance = 0;
  if (tiposNecesarios.has("chispas_balance")) {
    const { data: perfil } = await supabase.from("profiles").select("puntos_total").eq("id", userId).single();
    chispasBalance = perfil?.puntos_total ?? 0;
  }

  // mundo_completado y aprender_completo se calculan por mundo, solo
  // para los mundos que realmente hacen falta (no los 4 siempre).
  const mundosCompletadoNecesarios = new Set(
    pendientes.filter((t) => t.criterio.tipo === "mundo_completado").map((t) => (t.criterio as { mundo: string }).mundo)
  );
  const mundoCompletado = new Map<string, boolean>();
  for (const mundo of mundosCompletadoNecesarios) {
    if (mundo === "numeria") {
      const { data: rows } = await supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", userId).in("problem_type", TIPOS_NUMERIA);
      mundoCompletado.set(mundo, (rows ?? []).length === TIPOS_NUMERIA.length && (rows ?? []).every((r) => r.nivel >= 10));
    } else if (mundo === "quimia") {
      const { data: rows } = await supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", userId).in("problem_type", TIPOS_QUIMIA);
      mundoCompletado.set(mundo, (rows ?? []).length === TIPOS_QUIMIA.length && (rows ?? []).every((r) => r.nivel >= 10));
    } else if (mundo === "geografia") {
      const { data: row } = await supabase.from("skill_levels").select("nivel").eq("user_id", userId).eq("problem_type", "geografia").maybeSingle();
      mundoCompletado.set(mundo, (row?.nivel ?? 0) >= 10);
    } else if (mundo === "enigmia") {
      const { data: row } = await supabase.from("logic_skill_levels").select("nivel").eq("user_id", userId).maybeSingle();
      mundoCompletado.set(mundo, (row?.nivel ?? 0) >= 10);
    }
  }

  const aprenderCompletoNecesarios = new Set(
    pendientes.filter((t) => t.criterio.tipo === "aprender_completo").map((t) => (t.criterio as { mundo: string }).mundo)
  );
  const aprenderCompleto = new Map<string, boolean>();
  for (const mundo of aprenderCompletoNecesarios) {
    if (mundo === "enigmia") {
      const [{ count: total }, { count: dominadas }] = await Promise.all([
        supabase.from("logic_techniques").select("id", { count: "exact", head: true }),
        supabase.from("logic_technique_progress").select("technique_id", { count: "exact", head: true }).eq("user_id", userId).eq("dominado", true),
      ]);
      aprenderCompleto.set(mundo, (total ?? 0) > 0 && (dominadas ?? 0) >= (total ?? 0));
    } else {
      const tipos = mundo === "numeria" ? TIPOS_NUMERIA : [mundo];
      const { data: tecnicasDelMundo } = await supabase.from("techniques").select("id").in("problem_type", tipos);
      const idsDelMundo = (tecnicasDelMundo ?? []).map((t) => t.id);
      if (idsDelMundo.length === 0) {
        aprenderCompleto.set(mundo, false);
        continue;
      }
      const { count: dominadas } = await supabase
        .from("technique_progress")
        .select("technique_id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("dominado", true)
        .in("technique_id", idsDelMundo);
      aprenderCompleto.set(mundo, (dominadas ?? 0) >= idsDelMundo.length);
    }
  }

  const desbloqueadosAhora: TituloCatalogo[] = [];
  for (const t of pendientes) {
    const c = t.criterio;
    let cumplido = false;
    if (c.tipo === "partidas_totales") cumplido = partidasTotales >= c.valor;
    else if (c.tipo === "precision_semana") cumplido = precisionSemana !== null && precisionSemana >= c.valor;
    else if (c.tipo === "duelos_ganados") cumplido = duelosGanados >= c.valor;
    else if (c.tipo === "duelos_jugados") cumplido = duelosJugados >= c.valor;
    else if (c.tipo === "racha_duelos_ganados") cumplido = rachaDuelosGanados >= c.valor;
    else if (c.tipo === "racha_dias") cumplido = rachaDias >= c.valor;
    else if (c.tipo === "racha_retos_diarios") cumplido = rachaRetosDiarios >= c.valor;
    else if (c.tipo === "mundos_explorados") cumplido = mundosExplorados >= c.valor;
    else if (c.tipo === "embajador") cumplido = esEmbajador;
    else if (c.tipo === "chispas_balance") cumplido = chispasBalance >= c.valor;
    else if (c.tipo === "mundo_completado") cumplido = mundoCompletado.get(c.mundo) ?? false;
    else if (c.tipo === "aprender_completo") cumplido = aprenderCompleto.get(c.mundo) ?? false;

    if (cumplido) desbloqueadosAhora.push(t);
  }

  for (const t of desbloqueadosAhora) {
    await supabase.rpc("desbloquear_titulo", { p_user_id: userId, p_slug: t.slug, p_nombre: t.nombre, p_origen: t.categoria });
  }

  return desbloqueadosAhora;
}
