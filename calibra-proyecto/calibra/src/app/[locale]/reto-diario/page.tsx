import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import { generarRetoDelDia } from "@/lib/retoDiario";
import Header from "@/components/Header";
import RetoDiarioClient from "./RetoDiarioClient";

export const metadata: Metadata = {
  title: "Reto diario",
  description: "5 problemas iguales para todos, cada día.",
};

export default async function RetoDiarioPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/reto-diario");

  const hoyIso = new Date().toISOString().slice(0, 10);
  const { data: completado } = await supabase
    .from("retos_diarios_completados")
    .select("correctos, puntos_bonus")
    .eq("user_id", user.id)
    .eq("fecha", hoyIso)
    .maybeSingle();

  const problemas = generarRetoDelDia(hoyIso);

  return (
    <>
      <Header autenticado />
      <RetoDiarioClient
        fecha={hoyIso}
        problemas={problemas}
        yaCompletado={
          completado ? { correctos: completado.correctos, puntosBonus: completado.puntos_bonus } : null
        }
      />
    </>
  );
}
