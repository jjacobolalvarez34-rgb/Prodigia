import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import ProfesorClient, { type LicenciaDocente } from "./ProfesorClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profesor.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

// Panel docente (piloto para colegios, 0318): licencia del colegio, cursos y cómo
// empezar. Unirse a un curso como estudiante vive ahora en /curso.
export default async function ProfesorPage() {
  const t = await getTranslations("Profesor");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/profesor");
  bloquearInvitado(user, t("guardLabel"));

  const [{ data: grupos }, { data: licencias }] = await Promise.all([
    supabase
      .from("groups")
      .select("id, nombre, codigo_invitacion, group_members(count)")
      .eq("profesor_id", user.id)
      .order("created_at", { ascending: false }),
    // Sin la 0318 aplicada la función no existe: se trata igual que «sin licencia».
    supabase.rpc("mi_licencia_docente"),
  ]);

  const cursos = (grupos ?? []).map((g) => ({
    id: g.id as string,
    nombre: g.nombre as string,
    codigo: g.codigo_invitacion as string,
    estudiantes: ((g.group_members as { count: number }[] | null)?.[0]?.count ?? 0) as number,
  }));
  const licencia = ((licencias as LicenciaDocente[] | null) ?? [])[0] ?? null;

  return (
    <>
      <Header autenticado />
      <ProfesorClient cursos={cursos} licencia={licencia} />
    </>
  );
}
