import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { BENEFICIOS_PRO } from "@/lib/pro/beneficios";
import ProClient from "./ProClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal.pro.metadata");
  return { title: t("title"), description: t("description") };
}

// Fase 4 (infraestructura de pagos): ya no es solo informativa — el
// checkout real vive en ProClient.tsx (pega a /api/pagos/checkout,
// mismo Payment Service que la Tienda). Acá solo se resuelve si el
// usuario ya es Pro (profiles.plan, ver 0145/0146) para decidir qué
// variante de ProClient mostrar.
export default async function ProPage() {
  const t = await getTranslations("Legal.pro");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/pro");
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-primario">{t("marca")}</span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
          <p className="mt-2 text-sm text-texto-secundario">
            {t("subtitulo")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFICIOS_PRO.map((b) => (
            <div
              key={b.titulo}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-5"
            >
              <span className="text-2xl">{b.emoji}</span>
              <h2 className="font-display text-base font-bold text-foreground">{b.titulo}</h2>
              <p className="text-sm text-texto-secundario">{b.descripcion}</p>
            </div>
          ))}
        </div>

        <ProClient esPro={profile?.plan === "pro"} />
      </div>
    </>
  );
}
