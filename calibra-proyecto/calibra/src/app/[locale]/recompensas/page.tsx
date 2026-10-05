import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import RecompensasClient from "./RecompensasClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Recompensas.metadata");
  return { title: t("title"), description: t("description") };
}

// Recompensas (docs/economy/PROPUESTA_TIENDA_Y_RECOMPENSAS.md, aprobada el
// 2026-10-05): cápsulas, calendario de 7 días, misiones del día, regalos y
// colecciones por ciudad. Misma pantalla que /recompensas en la app.
export default async function RecompensasPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/recompensas");
  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <RecompensasClient invitado={!!user.is_anonymous} />
    </>
  );
}
