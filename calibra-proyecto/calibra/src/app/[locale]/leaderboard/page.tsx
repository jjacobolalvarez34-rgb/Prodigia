import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import CountdownSemanal from "@/components/CountdownSemanal";
import type { FilaRanking } from "./Podio";
import LeaderboardClient from "./LeaderboardClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Leaderboard.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function LeaderboardPage() {
  const t = await getTranslations("Leaderboard");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/leaderboard");

  // Carga inicial: Global / Experiencia total (los mismos defaults del
  // filtro en LeaderboardClient) — el resto de las combinaciones se
  // piden client-side vía ranking_semanal_filtrado apenas se toca un
  // filtro, para no depender de un round-trip al servidor por cada clic.
  const { data } = await supabase.rpc("ranking_semanal_filtrado", { p_mundo: null, p_solo_amigos: false });
  const ranking = (data ?? []) as FilaRanking[];

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
          <p className="mt-1 text-sm text-texto-secundario">
            {t("descripcion")}
          </p>
          <CountdownSemanal className="mt-2" />
        </div>

        <LeaderboardClient rankingInicial={ranking} miUserId={user.id} />
      </div>
    </>
  );
}
