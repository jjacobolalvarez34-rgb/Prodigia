import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { BENEFICIOS_PRO } from "@/lib/pro/beneficios";
import ProClient from "./ProClient";
import { pagosHabilitados } from "@/lib/pagos/flags";
import { ahorroAnual } from "@/lib/pagos/vitrina";
import IconoTrazo from "@/components/IconoTrazo";

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
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  const tBen = await getTranslations("ProBeneficios");
  bloquearInvitado(user, tBloqueos("pro"));
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  // Contador de Pro (2026-10-13): la suscripción más reciente, si la hay.
  const { data: suscripcion } = await supabase
    .from("subscriptions")
    .select("current_period_end, cancel_at_period_end, status")
    .eq("user_id", user.id)
    .order("current_period_end", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  const esPro = profile?.plan === "pro";
  return (
    <>
      <Header autenticado />
      <div className="flex-1 bg-[radial-gradient(120%_80%_at_50%_0%,#2A1F5C_0%,#0B1022_55%,#05060F_100%)] text-white">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
          <div className="text-center">
            <span className="inline-block rounded-full border-2 border-[#05060F] bg-[#FFC53D] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#05060F] shadow-[3px_3px_0_0_#05060F]">
              {t("marca")} Pro
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">{t("tituloVenta")}</h1>
            <p className="mx-auto mt-3 max-w-lg text-base text-white/75">{t("subtituloVenta")}</p>
          </div>

          <ProClient esPro={esPro} pagosHabilitados={pagosHabilitados()} suscripcion={suscripcion ?? null} ahorro={ahorroAnual()} />

          <section className="flex flex-col gap-4">
            <h2 className="text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FFD36B]">{t("incluye")}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {BENEFICIOS_PRO.map((b) => (
                <div key={b.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#05060F] bg-[#FFC53D] text-[#05060F] shadow-[2px_2px_0_0_#05060F]">
                    <IconoTrazo nombre={b.icono} className="h-5 w-5" ancho={2.2} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-bold leading-tight">{tBen(`${b.id}.titulo`)}</h3>
                    <p className="mt-1 text-xs leading-snug text-white/65">{tBen(`${b.id}.descripcion`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
