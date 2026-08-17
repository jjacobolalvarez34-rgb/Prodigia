import type { SupabaseClient } from "@supabase/supabase-js";
import type { Achievement } from "@/types/database";
import { calcularRachaDiaria } from "@/lib/practica/racha";

// Chequea los criterios de todos los logros que el usuario todavía no
// tiene, y desbloquea (inserta en user_achievements) los que se
// cumplieron. Se llama después de eventos que podrían destrabar uno:
// terminar un sprint, completar una lección. Devuelve los recién
// desbloqueados (para la celebración / feed).
export async function verificarLogros(supabase: SupabaseClient, userId: string): Promise<Achievement[]> {
  const [{ data: achievements }, { data: yaDesbloqueados }] = await Promise.all([
    supabase.from("achievements").select("id, slug, nombre, descripcion, categoria, criterio"),
    supabase.from("user_achievements").select("achievement_id").eq("user_id", userId),
  ]);

  const idsDesbloqueados = new Set((yaDesbloqueados ?? []).map((r) => r.achievement_id));
  const pendientes = (achievements ?? []).filter((a) => !idsDesbloqueados.has(a.id)) as Achievement[];
  if (pendientes.length === 0) return [];

  // Solo se calculan las métricas que realmente hacen falta, una vez.
  const tiposNecesarios = new Set(pendientes.map((a) => a.criterio.tipo));
  const hoyIso = new Date().toISOString().slice(0, 10);

  let rachaDias = 0;
  if (tiposNecesarios.has("racha_dias")) {
    const { data: dailyRows } = await supabase
      .from("daily_progress")
      .select("fecha, meta_alcanzada")
      .eq("user_id", userId)
      .order("fecha", { ascending: false })
      .limit(120);
    rachaDias = calcularRachaDiaria(dailyRows ?? [], hoyIso);
  }

  let problemasTotales = 0;
  if (tiposNecesarios.has("problemas_totales")) {
    const { count } = await supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    problemasTotales = count ?? 0;
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

    // "semana completa" con precisión sostenida: pedimos un volumen
    // mínimo de intentos para que no sea un logro por 2 respuestas.
    if (attemptsSemana && attemptsSemana.length >= 20) {
      precisionSemana = attemptsSemana.filter((a) => a.correct).length / attemptsSemana.length;
    }
  }

  let tecnicasDominadas = 0;
  if (tiposNecesarios.has("tecnicas_dominadas")) {
    const { count } = await supabase
      .from("technique_progress")
      .select("technique_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("dominado", true);
    tecnicasDominadas = count ?? 0;
  }

  let logicaProblemasTotales = 0;
  if (tiposNecesarios.has("logica_problemas_totales")) {
    const { count } = await supabase
      .from("logic_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    logicaProblemasTotales = count ?? 0;
  }

  let logicaTecnicasDominadas = 0;
  if (tiposNecesarios.has("logica_tecnicas_dominadas")) {
    const { count } = await supabase
      .from("logic_technique_progress")
      .select("technique_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("dominado", true);
    logicaTecnicasDominadas = count ?? 0;
  }

  let duelosGanados = 0;
  if (tiposNecesarios.has("duelos_ganados")) {
    const { count } = await supabase
      .from("duels")
      .select("id", { count: "exact", head: true })
      .eq("ganador_id", userId);
    duelosGanados = count ?? 0;
  }

  let rachaRetosDiarios = 0;
  if (tiposNecesarios.has("racha_retos_diarios")) {
    const { data: retoRows } = await supabase
      .from("retos_diarios_completados")
      .select("fecha")
      .eq("user_id", userId)
      .order("fecha", { ascending: false })
      .limit(120);
    rachaRetosDiarios = calcularRachaDiaria(
      (retoRows ?? []).map((r) => ({ fecha: r.fecha, meta_alcanzada: true })),
      hoyIso
    );
  }

  const desbloqueadosAhora: Achievement[] = [];
  for (const a of pendientes) {
    const { tipo, valor } = a.criterio;
    let cumplido = false;
    if (tipo === "racha_dias") cumplido = rachaDias >= valor;
    else if (tipo === "problemas_totales") cumplido = problemasTotales >= valor;
    else if (tipo === "precision_semana") cumplido = precisionSemana !== null && precisionSemana >= valor;
    else if (tipo === "tecnicas_dominadas") cumplido = tecnicasDominadas >= valor;
    else if (tipo === "logica_problemas_totales") cumplido = logicaProblemasTotales >= valor;
    else if (tipo === "logica_tecnicas_dominadas") cumplido = logicaTecnicasDominadas >= valor;
    else if (tipo === "duelos_ganados") cumplido = duelosGanados >= valor;
    else if (tipo === "racha_retos_diarios") cumplido = rachaRetosDiarios >= valor;

    if (cumplido) desbloqueadosAhora.push(a);
  }

  if (desbloqueadosAhora.length > 0) {
    await supabase.from("user_achievements").insert(
      desbloqueadosAhora.map((a) => ({ user_id: userId, achievement_id: a.id }))
    );
    // Cada medalla nueva genera su propia tarjeta en el feed — auto-generada,
    // el usuario no escribe nada.
    await supabase.from("feed_posts").insert(
      desbloqueadosAhora.map((a) => ({ user_id: userId, tipo: "logro", achievement_id: a.id }))
    );
  }

  return desbloqueadosAhora;
}
