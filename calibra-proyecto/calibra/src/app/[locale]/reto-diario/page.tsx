import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import { generarRetoDelDia, type MundoRetoDiario } from "@/lib/retoDiario";
import { calcularRachaDiaria } from "@/lib/practica/racha";
import Header from "@/components/Header";
import RetoClient, { type FilaRankingReto } from "@/components/reto/RetoClient";

export const metadata: Metadata = {
  title: "Reto diario",
  description: "5 preguntas de tus ciudades desbloqueadas, las mismas para todos, cada día.",
};

export default async function RetoDiarioPage() {
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/reto-diario");

  const hoyIso = new Date().toISOString().slice(0, 10);

  const [{ data: completado }, { data: retoRows }, { data: rankingRows }] = await Promise.all([
    supabase
      .from("retos_diarios_completados")
      .select("correctos, puntos_bonus")
      .eq("user_id", user.id)
      .eq("fecha", hoyIso)
      .maybeSingle(),
    supabase
      .from("retos_diarios_completados")
      .select("fecha")
      .eq("user_id", user.id)
      .order("fecha", { ascending: false })
      .limit(120),
    supabase.rpc("ranking_reto_diario", { p_fecha: hoyIso }),
  ]);

  const racha = calcularRachaDiaria(
    (retoRows ?? []).map((r) => ({ fecha: r.fecha, meta_alcanzada: true })),
    hoyIso
  );

  // Fase 12 ("Mundos por Chispas"): "desbloqueada" es el desbloqueo
  // real (mundos_desbloqueados) — un mundo comprado pero sin
  // diagnosticar todavía igual debe poder salir en el reto.
  const mundosDesbloqueados = (profile.mundos_desbloqueados ?? ["numeria"]) as MundoRetoDiario[];

  const problemas = generarRetoDelDia(hoyIso, mundosDesbloqueados);

  return (
    <>
      <Header autenticado />
      <RetoClient
        tipo="diario"
        clave={hoyIso}
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
