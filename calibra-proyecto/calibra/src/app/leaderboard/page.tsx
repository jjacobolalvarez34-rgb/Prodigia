import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import Podio, { type FilaRanking } from "./Podio";
import ListaRanking from "./ListaRanking";

export const metadata: Metadata = {
  title: "Ranking",
  description: "Ranking semanal de Experiencia entre jugadores de Prodigia.",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/leaderboard");

  const { data } = await supabase.rpc("ranking_semanal");
  const ranking = (data ?? []) as FilaRanking[];

  const posicionUsuario = ranking.findIndex((f) => f.user_id === user.id);
  const top3 = ranking.slice(0, 3);
  // Fase R3 v2: antes se cortaba en el puesto 10 (más un bloque aparte
  // "tu posición" si quedabas afuera) — ahora la lista de abajo muestra
  // el resto COMPLETO, con buscador propio para encontrar a cualquiera
  // sin depender de scrollear a mano.
  const resto = ranking.slice(3);

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Ranking semanal</h1>
          <p className="mt-1 text-sm text-texto-secundario">
            Experiencia ganada esta semana — es temporal, se reinicia solo cada lunes. No tiene nada
            que ver con tus Puntos totales, esos no bajan nunca.
          </p>
        </div>

        {ranking.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-texto-secundario">
            Todavía nadie sumó experiencia esta semana — ¡arrancá vos!
          </p>
        ) : (
          <>
            <Podio top3={top3} miUserId={user.id} />
            <ListaRanking resto={resto} miUserId={user.id} />
          </>
        )}

        {ranking.length > 0 && posicionUsuario === -1 && (
          <p className="text-sm text-texto-secundario">
            Todavía no sumaste experiencia esta semana — practicá para entrar al ranking.
          </p>
        )}
      </div>
    </>
  );
}
