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

  // Fase 12 (Rankeds): rango alcanzado — se compara directo contra
  // profiles.elo_rating, no hace falta guardar nada aparte.
  let eloActual = 0;
  if (tiposNecesarios.has("elo_minimo")) {
    const { data: perfilElo } = await supabase.from("profiles").select("elo_rating").eq("id", userId).single();
    eloActual = perfilElo?.elo_rating ?? 0;
  }

  // Racha de duelos ganados SEGUIDOS, contando desde el más reciente
  // hacia atrás — se corta apenas aparece uno que no fue victoria
  // (derrota o empate). No distingue mundo/modo a propósito: "3
  // seguidas" es sobre duelos en general, no por ciudad.
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

  // Sección 5 (auditoría de variedad): "quimia_problemas_totales" y
  // "quimia_modos_variados" cuentan sobre los 5 modos (los 2 nuevos
  // suman acá) — a diferencia de TIPOS_QUIMIA_MUNDO más abajo (logro
  // "mundo completado"), que se deja en los 3 modos originales a
  // propósito: ya lo desbloquearon usuarios reales con ese criterio, no
  // corresponde subirles la vara retroactivamente.
  const TIPOS_QUIMIA = ["quimia_simbolos", "quimia_formulas", "quimia_tabla", "quimia_nomenclatura", "quimia_organica"];

  let quimiaProblemasTotales = 0;
  if (tiposNecesarios.has("quimia_problemas_totales")) {
    const { count } = await supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("problem_type", TIPOS_QUIMIA);
    quimiaProblemasTotales = count ?? 0;
  }

  let quimiaModosVariados = 0;
  if (tiposNecesarios.has("quimia_modos_variados")) {
    const { data: quimiaRows } = await supabase
      .from("attempts")
      .select("problem_type")
      .eq("user_id", userId)
      .in("problem_type", TIPOS_QUIMIA);
    quimiaModosVariados = new Set((quimiaRows ?? []).map((r) => r.problem_type)).size;
  }

  let quimiaNivelMundo = 0;
  if (tiposNecesarios.has("quimia_nivel_mundo")) {
    const { data: worldRow } = await supabase
      .from("world_progress")
      .select("nivel_mundo")
      .eq("user_id", userId)
      .eq("world", "quimia")
      .maybeSingle();
    quimiaNivelMundo = worldRow?.nivel_mundo ?? 0;
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

  // Sección 9: "mundo completado" — nivel 10 en TODOS los temas de ese
  // mundo. Mismo criterio que usa verificarTitulos para "Maestro de
  // X" (llamada aparte, en los mismos puntos que esta función) — acá
  // solo se resuelve el logro/medalla, no el título, para no duplicar
  // la llamada a desbloquear_titulo desde dos lugares.
  const TIPOS_NUMERIA = ["suma", "resta", "multiplicacion", "division", "fracciones", "decimales", "potencias", "algebra"];
  const TIPOS_QUIMIA_MUNDO = ["quimia_simbolos", "quimia_formulas", "quimia_tabla"];

  let numeriaCompletado = false;
  if (tiposNecesarios.has("mundo_completado_numeria")) {
    const { data: rows } = await supabase.from("skill_levels").select("nivel").eq("user_id", userId).in("problem_type", TIPOS_NUMERIA);
    numeriaCompletado = (rows ?? []).length === TIPOS_NUMERIA.length && (rows ?? []).every((r) => r.nivel >= 10);
  }

  let geografiaCompletado = false;
  if (tiposNecesarios.has("mundo_completado_geografia")) {
    const { data: row } = await supabase.from("skill_levels").select("nivel").eq("user_id", userId).eq("problem_type", "geografia").maybeSingle();
    geografiaCompletado = (row?.nivel ?? 0) >= 10;
  }

  let quimiaCompletado = false;
  if (tiposNecesarios.has("mundo_completado_quimia")) {
    const { data: rows } = await supabase.from("skill_levels").select("nivel").eq("user_id", userId).in("problem_type", TIPOS_QUIMIA_MUNDO);
    quimiaCompletado = (rows ?? []).length === TIPOS_QUIMIA_MUNDO.length && (rows ?? []).every((r) => r.nivel >= 10);
  }

  let enigmiaCompletado = false;
  if (tiposNecesarios.has("mundo_completado_enigmia")) {
    const { data: row } = await supabase.from("logic_skill_levels").select("nivel").eq("user_id", userId).maybeSingle();
    enigmiaCompletado = (row?.nivel ?? 0) >= 10;
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
    else if (tipo === "elo_minimo") cumplido = eloActual >= valor;
    else if (tipo === "racha_duelos_ganados") cumplido = rachaDuelosGanados >= valor;
    else if (tipo === "quimia_problemas_totales") cumplido = quimiaProblemasTotales >= valor;
    else if (tipo === "quimia_modos_variados") cumplido = quimiaModosVariados >= valor;
    else if (tipo === "quimia_nivel_mundo") cumplido = quimiaNivelMundo >= valor;
    else if (tipo === "mundo_completado_numeria") cumplido = numeriaCompletado;
    else if (tipo === "mundo_completado_geografia") cumplido = geografiaCompletado;
    else if (tipo === "mundo_completado_quimia") cumplido = quimiaCompletado;
    else if (tipo === "mundo_completado_enigmia") cumplido = enigmiaCompletado;

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
