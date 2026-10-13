import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import RetoFindeClient, { type FilaRankingFinde, type IntentoFinde } from "@/components/reto/RetoFindeClient";
import { generarRetoFinde, proximoSabado, sabadoAnterior, sabadoDelFinde } from "@/lib/retoFinde";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RetoFinde.metadata");
  return { title: t("title"), description: t("description") };
}

// Reto de fin de semana (0281): se juega sábado y domingo; de lunes a viernes
// muestra cuánto falta y cómo terminó el anterior (y paga su premio).
export default async function RetoFindePage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/reto-finde");

  const sabado = sabadoDelFinde();
  const sabadoRanking = sabado ?? sabadoAnterior();

  // El premio del finde pasado se cobra solo al entrar (paga una vez).
  const [{ data: premioRows }, { data: intentosRows }, { data: rankingRows }] = await Promise.all([
    supabase.rpc("premio_reto_finde"),
    sabado
      ? supabase.from("retos_finde_intentos").select("intento, correctos, tiempo_ms, terminado_at").eq("user_id", user.id).eq("sabado", sabado).order("intento")
      : Promise.resolve({ data: [] }),
    supabase.rpc("ranking_reto_finde", { p_sabado: sabadoRanking }),
  ]);
  const premio = ((premioRows ?? []) as { puesto: number; cometas: number }[])[0] ?? null;

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <RetoFindeClient
        sabado={sabado}
        proximo={proximoSabado()}
        preguntas={sabado ? generarRetoFinde(sabado) : []}
        intentosIniciales={(intentosRows ?? []) as IntentoFinde[]}
        rankingInicial={(rankingRows ?? []) as FilaRankingFinde[]}
        miUserId={user.id}
        premio={premio}
      />
    </>
  );
}
