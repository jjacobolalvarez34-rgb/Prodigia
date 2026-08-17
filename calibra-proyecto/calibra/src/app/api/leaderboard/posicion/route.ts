import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface FilaRanking {
  user_id: string;
  xp_semana: number;
}

// GET /api/leaderboard/posicion
// Posición actual del usuario en el ranking semanal (1-based) o null si
// todavía no sumó XP esta semana. Liviano a propósito: lo llama
// SprintRunner después de cada acierto para el indicador "subiste al
// puesto N" — solo necesita la posición, no el ranking completo.
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("ranking_semanal");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const ranking = (data ?? []) as FilaRanking[];
  const indice = ranking.findIndex((f) => f.user_id === user.id);

  return NextResponse.json({ posicion: indice === -1 ? null : indice + 1 });
}
