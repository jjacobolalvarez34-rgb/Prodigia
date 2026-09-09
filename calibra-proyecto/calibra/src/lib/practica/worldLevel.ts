import type { SupabaseClient } from "@supabase/supabase-js";

const TOTAL_SUBTEMAS: Record<string, number> = {
  numeria: 20,
  geografia: 1,
  quimia: 5,
  enigmia: 1,
  anatomia: 4,
  melodia: 6,
  trigonometria: 4,
  historia: 4,
};

const SUBTIPOS: Record<string, string[]> = {
  numeria: [
    "suma", "resta", "multiplicacion", "division",
    "fracciones_simplificar", "fracciones_comparar", "fracciones_sumar",
    "decimales_convertir", "decimales_porcentaje", "decimales_redondear",
    "potencias_potencia", "potencias_raiz", "potencias_notacion",
    "algebra_evaluar", "algebra_un-paso", "algebra_dos-pasos",
    "geometria_perimetro", "geometria_area", "geometria_angulos", "geometria_ternas",
  ],
  geografia: ["geografia"],
  quimia: [
    "quimia_simbolos", "quimia_formulas", "quimia_tabla",
    "quimia_nomenclatura", "quimia_organica",
  ],
  enigmia: ["enigmia"],
  anatomia: [
    "anatomia_oseo", "anatomia_muscular", "anatomia_organos", "anatomia_nervioso",
  ],
  melodia: [
    "melodia_fundamentos", "melodia_lectura", "melodia_alteraciones",
    "melodia_escalas", "melodia_acordes", "melodia_oido_absoluto",
  ],
  trigonometria: [
    "trigonometria_razones", "trigonometria_circulo",
    "trigonometria_identidades", "trigonometria_leyes",
  ],
  historia: [
    "historia_cronologia", "historia_personajes",
    "historia_causaefecto", "historia_fechas",
  ],
};

export const VOLUMEN_TECHO = 25000;
export const PESO_VOLUMEN = 0.34;
export const PESO_DOMINIO = 0.45;
export const PESO_LECCIONES = 0.21;
export const NIVEL_MIN_DOMINIO = 4;
export const NIVEL_MAX_DOMINIO = 10;

export function fraccionDominio(
  niveles: Record<string, number>,
  world: string,
): number {
  const subtipos = SUBTIPOS[world] ?? [];
  const total = TOTAL_SUBTEMAS[world] ?? 1;
  if (total <= 0 || subtipos.length === 0) return 0;
  let suma = 0;
  for (const st of subtipos) {
    const nivel = niveles[st] ?? 1;
    suma += Math.max(
      0,
      Math.min(1, (nivel - NIVEL_MIN_DOMINIO) / (NIVEL_MAX_DOMINIO - NIVEL_MIN_DOMINIO)),
    );
  }
  return suma / total;
}

export function fraccionLecciones(completadas: number, total: number): number {
  return total > 0 ? completadas / total : 1;
}

export function calcularNivelMundo(
  xpMundo: number,
  dominio: number,
  lecciones: number,
): number {
  const fracVolumen = Math.min(1.0, xpMundo / VOLUMEN_TECHO);
  return Math.max(1, Math.min(100, Math.round(
    100 * (PESO_VOLUMEN * fracVolumen + PESO_DOMINIO * dominio + PESO_LECCIONES * lecciones),
  )));
}

export async function calcularNivelMundoDB(
  supabase: SupabaseClient,
  userId: string,
  world: string,
): Promise<{
  nivel_mundo: number;
  puntos_mundo: number;
  fraccion_volumen: number;
  fraccion_dominio: number;
  fraccion_lecciones: number;
}> {
  const { data: wp } = await supabase
    .from("world_progress")
    .select("puntos_mundo")
    .eq("user_id", userId)
    .eq("world", world)
    .maybeSingle();

  const xpMundo = wp?.puntos_mundo ?? 0;

  let dominio = 0;
  const subtipos = SUBTIPOS[world] ?? [];
  if (subtipos.length > 0) {
    const { data: sl } = await supabase
      .from("skill_levels")
      .select("problem_type, nivel")
      .eq("user_id", userId)
      .in("problem_type", subtipos);
    dominio = fraccionDominio(
      Object.fromEntries((sl ?? []).map((r) => [r.problem_type, r.nivel ?? 1])),
      world,
    );
  }

  let leccionesFrac = 1;
  if (world === "enigmia") {
    const { count: totalLecc } = await supabase
      .from("logic_techniques")
      .select("*", { count: "exact", head: true });
    const { count: compLecc } = await supabase
      .from("logic_technique_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("dominado", true);
    leccionesFrac = fraccionLecciones(compLecc ?? 0, totalLecc ?? 0);
  } else {
    const typesNumeria = [
      "suma", "resta", "multiplicacion", "division",
      "fracciones", "decimales", "potencias", "algebra", "geometria",
    ];
    const problemTypeFilter = world === "numeria" ? typesNumeria : [world];
    const { count: totalLecc } = await supabase
      .from("techniques")
      .select("*", { count: "exact", head: true })
      .in("problem_type", problemTypeFilter);
    const { count: compLecc } = await supabase
      .from("technique_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("dominado", true);
    leccionesFrac = fraccionLecciones(compLecc ?? 0, totalLecc ?? 0);
  }

  const nivel = calcularNivelMundo(xpMundo, dominio, leccionesFrac);

  return {
    nivel_mundo: nivel,
    puntos_mundo: xpMundo,
    fraccion_volumen: Math.min(1.0, xpMundo / VOLUMEN_TECHO),
    fraccion_dominio: dominio,
    fraccion_lecciones: leccionesFrac,
  };
}
