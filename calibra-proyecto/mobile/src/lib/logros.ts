// Logros y títulos: mismo catálogo y misma verificación que la web
// (src/lib/logros/verificar.ts y src/lib/titulos). Los títulos de la Trastienda no
// se muestran en la app (PROD-01).
import { CATALOGO_TITULOS } from "@/lib/titulos/catalogo";
import { supabase } from "./supabase";

export interface Logro {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  desbloqueadoAt: string | null;
}

export async function cargarLogros(userId: string): Promise<Logro[]> {
  const [{ data: todos }, { data: mios }] = await Promise.all([
    supabase.from("achievements").select("id, slug, nombre, descripcion, categoria"),
    supabase.from("user_achievements").select("achievement_id, desbloqueado_at").eq("user_id", userId),
  ]);
  const fechas = new Map(((mios as { achievement_id: string; desbloqueado_at: string }[] | null) ?? []).map((m) => [m.achievement_id, m.desbloqueado_at]));
  return ((todos as Omit<Logro, "desbloqueadoAt">[] | null) ?? [])
    .map((a) => ({ ...a, desbloqueadoAt: fechas.get(a.id) ?? null }))
    .sort((a, b) => Number(!!b.desbloqueadoAt) - Number(!!a.desbloqueadoAt));
}

export interface Titulo {
  slug: string;
  nombre: string;
  categoria: string;
  ganado: boolean;
  activo: boolean;
}

export async function cargarTitulos(userId: string): Promise<Titulo[]> {
  const [{ data: mios }, { data: perfil }] = await Promise.all([
    supabase.rpc("mis_titulos"),
    supabase.from("profiles").select("titulo_activo").eq("id", userId).single(),
  ]);
  const activo = (perfil as { titulo_activo: string | null } | null)?.titulo_activo ?? null;
  const ganados = new Map(((mios as { slug: string; nombre: string; origen: string }[] | null) ?? []).map((t) => [t.slug, t]));
  const catalogo = CATALOGO_TITULOS.filter((t) => t.categoria !== "trastienda");
  const lista: Titulo[] = catalogo.map((t) => ({ slug: t.slug, nombre: t.nombre, categoria: t.categoria, ganado: ganados.has(t.slug), activo: activo === t.slug }));
  // Títulos de rango (y otros ganados que no están en el catálogo, como los de rango).
  for (const [slug, t] of ganados) {
    if (!lista.some((x) => x.slug === slug) && t.origen !== "trastienda") lista.unshift({ slug, nombre: t.nombre, categoria: t.origen, ganado: true, activo: activo === slug });
  }
  return lista.sort((a, b) => Number(b.ganado) - Number(a.ganado));
}

export async function elegirTitulo(slug: string) {
  const { error } = await supabase.rpc("elegir_titulo_activo", { p_slug: slug });
  if (error) throw error;
}
