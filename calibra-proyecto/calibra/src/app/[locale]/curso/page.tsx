import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import type { MiTarea } from "@/lib/docentes/panel";
import CursoClient, { type MiGrupo } from "./CursoClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Curso.estudiante.metadata");
  return { title: t("title"), description: t("description") };
}

// «Mi curso» (piloto para colegios, 0318): el estudiante se une con el código de su
// docente, ve sus cursos y sus tareas. Sin la 0318 las funciones no existen y todo
// sale vacío, menos unirse (unirse_a_grupo existe desde 0014).
export default async function CursoPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/curso");

  const [{ data: grupos }, { data: tareas }] = await Promise.all([supabase.rpc("mis_grupos"), supabase.rpc("mis_tareas")]);

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <CursoClient invitado={!!user.is_anonymous} grupos={(grupos ?? []) as MiGrupo[]} tareas={(tareas ?? []) as MiTarea[]} />
    </>
  );
}
