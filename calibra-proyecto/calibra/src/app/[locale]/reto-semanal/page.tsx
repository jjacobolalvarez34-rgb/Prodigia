import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import { generarRetoSemanal, type MundoRetoDiario } from "@/lib/retoDiario";
import { calcularRachaSemanal, lunesDeEstaSemanaIso } from "@/lib/practica/racha";
import Header from "@/components/Header";
import RetoClient, { type FilaRankingReto } from "@/components/reto/RetoClient";

export const metadata: Metadata = {
  title: "Reto semanal",
  description: "45 preguntas de tus ciudades desbloqueadas, las mismas para todos, cada semana.",
};

export default async function RetoSemanalPage() {
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/reto-semanal");

  const semanaIso = lunesDeEstaSemanaIso();

  const [{ data: completado }, { data: semanaRows }, { data: rankingRows }] = await Promise.all([
    supabase
      .from("retos_semanales_completados")
      .select("correctos, puntos_bonus")
      .eq("user_id", user.id)
      .eq("semana_inicio", semanaIso)
      .maybeSingle(),
    supabase
      .from("retos_semanales_completados")
      .select("semana_inicio")
      .eq("user_id", user.id)
      .order("semana_inicio", { ascending: false })
      .limit(60),
    supabase.rpc("ranking_reto_semanal", { p_semana: semanaIso }),
  ]);

  const racha = calcularRachaSemanal((semanaRows ?? []).map((r) => r.semana_inicio), semanaIso);

  const mundosDesbloqueados = (profile.mundos_desbloqueados ?? ["numeria"]) as MundoRetoDiario[];

  const problemas = generarRetoSemanal(semanaIso, mundosDesbloqueados);

  return (
    <>
      <Header autenticado />
      <RetoClient
        tipo="semanal"
        clave={semanaIso}
        problemas={problemas}
        yaCompletado={
          completado ? { correctos: completado.correctos, puntosBonus: completado.puntos_bonus } : null
        }
        racha={racha}
        miUserId={user.id}
        rankingInicial={(rankingRows ?? []) as FilaRankingReto[]}
      />
    </>
  );
}
