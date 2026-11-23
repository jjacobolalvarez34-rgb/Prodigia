import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import DemoPanelClient from "./DemoPanelClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Docentes.v2.demo");
  return { title: t("titulo") };
}

// Demo pública del panel docente (2026-11-23): el mismo panel de /profesor/[grupo] con
// un curso de ejemplo (lib/docentes/demo.ts), sin cuenta y sin tocar la base.
export default async function DemoDocentesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const conSesion = !!user && !user.is_anonymous;

  return (
    <>
      <div className="print:hidden">{user ? <Header autenticado invitado={user.is_anonymous} /> : null}</div>
      <DemoPanelClient conSesion={conSesion} />
    </>
  );
}
