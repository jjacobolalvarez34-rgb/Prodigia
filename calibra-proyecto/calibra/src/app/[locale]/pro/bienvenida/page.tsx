import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import BienvenidaPro from "./BienvenidaPro";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProBienvenida");
  return { title: t("metaTitulo") };
}

// A donde llega el checkout de Pro al terminar (pedido 2026-10-13): espera a que el
// webhook active Pro, festeja con la cinemática y muestra todo lo nuevo.
// Con ?demo=1 se ve la cinemática sin pagar (solo la animación: no da nada).
export default async function BienvenidaProPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/pro/bienvenida");
  return <BienvenidaPro userId={user.id} yaEraPro={demo === "1" || profile.plan === "pro"} />;
}
