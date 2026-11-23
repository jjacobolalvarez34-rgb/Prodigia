import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import AdminColegiosClient, { type LicenciaAdmin } from "./AdminColegiosClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Curso.admin.metadata");
  return { title: t("title") };
}

// Licencias de colegio (piloto para colegios, 0318): solo profiles.es_admin, igual que
// /admin/anuncios. Aquí se crea el código que se le da al docente del colegio.
export default async function AdminColegiosPage() {
  const t = await getTranslations("Curso.admin");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/admin/colegios");
  if (!profile.es_admin) {
    redirect("/");
  }

  const { data } = await supabase.rpc("listar_licencias_admin");

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t("titulo")}</h1>
          <p className="mt-1 text-sm text-texto-secundario">{t("subtitulo")}</p>
        </div>
        <AdminColegiosClient licencias={(data as LicenciaAdmin[] | null) ?? []} />
      </div>
    </>
  );
}
