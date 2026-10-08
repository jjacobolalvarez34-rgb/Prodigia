import type { SupabaseClient } from "@supabase/supabase-js";
import type { NodoCaminoConClases, NodoEstado } from "@/lib/aprender/clases";
import { GRUPOS_APRENDER } from "@/lib/aprender/grupos";
import { localeServidor, localizarFilas } from "@/lib/i18n-lecciones/localizar";

// Camino de Aprender (Técnicas | Clases) con desbloqueo por tema, el mismo que
// tienen Estadística o Codia (ver src/lib/estadistica/path.ts), escrito una sola
// vez para los mundos nuevos (Dinamia y Vitalia):
//   - Cada tema de GRUPOS_APRENDER[mundo] tiene su propio puntero «activo».
//   - Dentro de un tema, orden lineal por `orden`.
//   - Clases (Pro): la primera del mundo es gratis; el resto pide Pro.

export interface NodoCaminoPorTema extends NodoCaminoConClases {
  grupo: string;
}

export interface FilaLeccion {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: unknown;
  orden: number;
  requiere_pro: boolean;
}

type Pestana = "tecnicas" | "clases";

export function grupoDeSlugEn(mundo: string, slug: string, pestana: Pestana): string {
  const def = GRUPOS_APRENDER[mundo]?.[pestana].find((g) => g.slugs.includes(slug));
  return def ? def.id : "otras";
}

export function puedeAbrirNodo(nodo: Pick<NodoCaminoPorTema, "estado">): boolean {
  return nodo.estado !== "bloqueado";
}

function nodoDe(mundo: string, t: FilaLeccion, estado: NodoEstado, pestana: Pestana, bloqueadoPorPlan: boolean): NodoCaminoPorTema {
  return {
    id: t.id,
    slug: t.slug,
    nombre: t.nombre,
    descripcion: t.descripcion,
    contenido: t.contenido as NodoCaminoPorTema["contenido"],
    estado,
    grupo: grupoDeSlugEn(mundo, t.slug, pestana),
    requierePro: pestana === "clases",
    bloqueadoPorPlan,
  };
}

export function calcularCaminoPorTema(mundo: string, filas: FilaLeccion[], dominadas: Set<string>, esPro: boolean): NodoCaminoPorTema[] {
  const porOrden = (a: FilaLeccion, b: FilaLeccion) => a.orden - b.orden;
  const tecnicas = filas.filter((t) => !t.requiere_pro).sort(porOrden);
  const clases = filas.filter((t) => t.requiere_pro).sort(porOrden);

  const activoT = new Set<string>();
  const nodosT = tecnicas.map((t) => {
    if (dominadas.has(t.id)) return nodoDe(mundo, t, "completado", "tecnicas", false);
    const g = grupoDeSlugEn(mundo, t.slug, "tecnicas");
    if (!activoT.has(g)) {
      activoT.add(g);
      return nodoDe(mundo, t, "activo", "tecnicas", false);
    }
    return nodoDe(mundo, t, "bloqueado", "tecnicas", false);
  });

  const activoC = new Set<string>();
  const nodosC = clases.map((t, i) => {
    if (dominadas.has(t.id)) return nodoDe(mundo, t, "completado", "clases", false);
    const g = grupoDeSlugEn(mundo, t.slug, "clases");
    if (i === 0) {
      activoC.add(g);
      return nodoDe(mundo, t, "activo", "clases", false);
    }
    if (!esPro) return nodoDe(mundo, t, "bloqueado", "clases", true);
    if (!activoC.has(g)) {
      activoC.add(g);
      return nodoDe(mundo, t, "activo", "clases", false);
    }
    return nodoDe(mundo, t, "bloqueado", "clases", false);
  });

  return [...nodosT, ...nodosC];
}

export async function obtenerCaminoPorTema(mundo: string, supabase: SupabaseClient, userId: string, esPro: boolean): Promise<NodoCaminoPorTema[]> {
  const locale = await localeServidor();
  const [{ data: filas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, nombre_en, descripcion_en, contenido_en, orden, requiere_pro")
      .eq("problem_type", mundo)
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);
  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id as string));
  return calcularCaminoPorTema(mundo, localizarFilas(filas, locale) as FilaLeccion[], dominadas, esPro);
}

export const obtenerCaminoDinamia = (sb: SupabaseClient, userId: string, esPro: boolean) => obtenerCaminoPorTema("dinamia", sb, userId, esPro);
export const obtenerCaminoVitalia = (sb: SupabaseClient, userId: string, esPro: boolean) => obtenerCaminoPorTema("vitalia", sb, userId, esPro);
