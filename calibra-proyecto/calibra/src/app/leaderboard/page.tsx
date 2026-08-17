import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";

interface FilaRanking {
  user_id: string;
  display_name: string | null;
  xp_semana: number;
}

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
  const top10 = ranking.slice(0, 10);
  const enTop10 = posicionUsuario !== -1 && posicionUsuario < 10;

  let entornoUsuario: { fila: FilaRanking; posicion: number }[] = [];
  if (posicionUsuario !== -1 && !enTop10) {
    const desde = Math.max(0, posicionUsuario - 2);
    const hasta = Math.min(ranking.length, posicionUsuario + 3);
    entornoUsuario = ranking.slice(desde, hasta).map((fila, i) => ({ fila, posicion: desde + i }));
  }

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Ranking semanal</h1>
          <p className="mt-1 text-sm text-texto-secundario">
            Experiencia ganada esta semana — es temporal, se reinicia solo cada lunes. No tiene nada
            que ver con tus Puntos totales, esos no bajan nunca.
          </p>
        </div>

        {top10.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-texto-secundario">
            Todavía nadie sumó experiencia esta semana — ¡arrancá vos!
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {top10.map((fila, i) => (
              <FilaRankingItem
                key={fila.user_id}
                fila={fila}
                posicion={i}
                esUsuarioActual={fila.user_id === user.id}
              />
            ))}
          </ol>
        )}

        {!enTop10 && posicionUsuario !== -1 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Tu posición</p>
            <ol className="flex flex-col gap-2">
              {entornoUsuario.map(({ fila, posicion }) => (
                <FilaRankingItem
                  key={fila.user_id}
                  fila={fila}
                  posicion={posicion}
                  esUsuarioActual={fila.user_id === user.id}
                />
              ))}
            </ol>
          </div>
        )}

        {posicionUsuario === -1 && (
          <p className="text-sm text-texto-secundario">
            Todavía no sumaste experiencia esta semana — practicá para entrar al ranking.
          </p>
        )}
      </div>
    </>
  );
}

function FilaRankingItem({
  fila,
  posicion,
  esUsuarioActual,
}: {
  fila: FilaRanking;
  posicion: number;
  esUsuarioActual: boolean;
}) {
  return (
    <li
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
        esUsuarioActual ? "border-primario/40 bg-primario/5" : "border-border bg-surface"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="w-6 text-center font-mono text-sm text-texto-secundario">{posicion + 1}</span>
        <span className="font-medium text-foreground">{fila.display_name ?? "Jugador"}</span>
      </div>
      <span className="font-mono font-semibold text-primario">{fila.xp_semana} Exp</span>
    </li>
  );
}
