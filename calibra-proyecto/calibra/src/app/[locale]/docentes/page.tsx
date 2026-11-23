import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import DocentesLanding from "./DocentesLanding";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Docentes.metadata");
  return { title: t("title"), description: t("description") };
}

// Página pública de venta a colegios (/docentes). Pública, sin requireUsuario: un
// colegio interesado no debería tener que crearse una cuenta solo para leerla. Desde
// 2026-11-23 vende el piloto real (0318: licencias, tareas y panel del curso) y deja el
// formulario de siempre (leads_colegios, 0150). Con sesión se ve el Header de la app.
export default async function DocentesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <DocentesLanding conSesion={!!user && !user.is_anonymous} cabecera={user ? <Header autenticado invitado={user.is_anonymous} /> : undefined} />;
}
