import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import { generarRetoDelDia, type MundoRetoDiario } from "@/lib/retoDiario";
import Header from "@/components/Header";
import RetoDiarioClient from "./RetoDiarioClient";

export const metadata: Metadata = {
  title: "Reto diario",
  description: "45 preguntas de tus ciudades desbloqueadas, las mismas para todos, cada día.",
};

export default async function RetoDiarioPage() {
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/reto-diario");

  const hoyIso = new Date().toISOString().slice(0, 10);
  const { data: completado } = await supabase
    .from("retos_diarios_completados")
    .select("correctos, puntos_bonus")
    .eq("user_id", user.id)
    .eq("fecha", hoyIso)
    .maybeSingle();

  // Fase 12 ("Mundos por Chispas"): "desbloqueada" ahora es el
  // desbloqueo real (mundos_desbloqueados), no un proxy por diagnóstico
  // completado — un mundo comprado pero sin diagnosticar todavía igual
  // debe poder salir en el reto (no depende de haber jugado ahí antes).
  const mundosDesbloqueados = (profile.mundos_desbloqueados ?? ["numeria"]) as MundoRetoDiario[];

  const problemas = generarRetoDelDia(hoyIso, mundosDesbloqueados);

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
