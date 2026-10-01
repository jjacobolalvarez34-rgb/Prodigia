// Nivel de mundo (1-100) y "continuar donde lo dejaste". El nivel lo calcula la
// base (detalle_nivel_mundo, 0223) con los mismos pesos que la web
// (src/lib/mundos/progresoNivel.ts): volumen, dominio y lecciones.
import { faltanteParaSubir, nivelDesdeFracciones } from "@/lib/mundos/progresoNivel";
import { MUNDO_POR_SLUG, type MundoSlug } from "~/tema";
import { SECCIONES, TODOS_LOS_TIPOS } from "./numeria";
import { supabase } from "./supabase";

export interface ProgresoMundo {
  nivel: number;
  // Avance dentro del nivel actual (0..1) para la barra.
  avance: number;
  faltaTexto: string;
}

export async function progresoMundo(userId: string, mundo: MundoSlug): Promise<ProgresoMundo> {
  const { data } = await supabase.rpc("detalle_nivel_mundo", { p_user_id: userId, p_world: mundo });
  const f = (data as { puntos_mundo: number; nivel_mundo: number; frac_volumen: number; frac_dominio: number; frac_lecciones: number }[] | null)?.[0];
  if (!f) return { nivel: 1, avance: 0, faltaTexto: "Juega tu primera partida" };
  const v = Number(f.frac_volumen ?? 0);
  const d = Number(f.frac_dominio ?? 0);
  const l = Number(f.frac_lecciones ?? 0);
  const continuo = 100 * (0.34 * Math.min(1, v) + 0.45 * Math.min(1, d) + 0.21 * Math.min(1, l));
  const nivel = f.nivel_mundo ?? nivelDesdeFracciones(v, d, l);
  const avance = nivel >= 100 ? 1 : Math.max(0, Math.min(1, continuo - (nivel - 0.5)));
  const falta = faltanteParaSubir({ puntos: f.puntos_mundo, nivel, fracVolumen: v, fracDominio: d, fracLecciones: l });
  const faltaTexto =
    falta.tipo === "maximo" ? "Nivel máximo" : falta.tipo === "dominio" ? "Sube tu precisión para el próximo nivel" : `${falta.xpFaltante.toLocaleString("es")} Exp para el Nv ${nivel + 1}`;
  return { nivel, avance, faltaTexto };
}

export async function nivelesDeMundos(userId: string): Promise<Record<string, number>> {
  const { data } = await supabase.from("world_progress").select("world, nivel_mundo").eq("user_id", userId);
  return Object.fromEntries(((data as { world: string; nivel_mundo: number }[] | null) ?? []).map((w) => [w.world, w.nivel_mundo]));
}

const CONTINENTES: Record<string, string> = { america: "América", europa: "Europa", africa: "África", asia_oceania: "Asia y Oceanía" };

export interface Continuar {
  mundo: MundoSlug;
  tema: string;
  ruta: "/numeria" | "/geografia";
}

// Última partida jugada en un mundo que ya está en la app.
export async function ultimoJugado(userId: string): Promise<Continuar> {
  const { data } = await supabase
    .from("attempts")
    .select("problem_type")
    .eq("user_id", userId)
    .or(`problem_type.in.(${TODOS_LOS_TIPOS.join(",")}),problem_type.like.geografia_%`)
    .order("created_at", { ascending: false })
    .limit(1);
  const tipo = (data as { problem_type: string }[] | null)?.[0]?.problem_type ?? "suma";
  if (tipo.startsWith("geografia_")) {
    return { mundo: "geografia", tema: CONTINENTES[tipo.replace("geografia_", "")] ?? "Mapas", ruta: "/geografia" };
  }
  const seccion = SECCIONES.find((sec) => sec.temas.some((t) => t.problemType === tipo));
  const tema = seccion?.temas.find((t) => t.problemType === tipo);
  return { mundo: "numeria", tema: seccion && tema ? (seccion.id === "aritmetica" ? tema.nombre : `${seccion.nombre}: ${tema.nombre}`) : "Cálculo mental", ruta: "/numeria" };
}

export function nombreMundo(slug: string): string {
  return MUNDO_POR_SLUG[slug as MundoSlug]?.nombre ?? slug;
}
