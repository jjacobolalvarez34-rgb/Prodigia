import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import type { FilaRanking } from "./Podio";
import LeaderboardClient from "./LeaderboardClient";

export const metadata: Metadata = {
  title: "Ranking",
  description: "Ranking semanal de Experiencia entre jugadores de Prodigia.",
};

export default async function LeaderboardPage() {
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
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Ranking semanal</h1>
          <p className="mt-1 text-sm text-texto-secundario">
            Experiencia ganada esta semana — es temporal, se reinicia solo cada lunes. No tiene nada
            que ver con tus Chispas totales, esas no bajan nunca.
          </p>
        </div>

        <LeaderboardClient rankingInicial={ranking} miUserId={user.id} />
      </div>
    </>
  );
}
