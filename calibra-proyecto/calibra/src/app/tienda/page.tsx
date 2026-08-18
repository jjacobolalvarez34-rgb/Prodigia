import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import TiendaClient from "./TiendaClient";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Gastá tus Puntos en escudos, boosts y cosméticos de dial.",
};

export default async function TiendaPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/tienda");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "puntos_total, escudos_extra_pendientes, congelamientos_disponibles, boost_multiplicador_pendiente, color_dial, colores_dial_desbloqueados, marco_perfil, marcos_desbloqueados, apuesta_monto"
    )
    .eq("id", user.id)
    .single();

  const hoyIso = new Date().toISOString().slice(0, 10);

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <TiendaClient
        puntosIniciales={profile?.puntos_total ?? 0}
        escudosIniciales={profile?.escudos_extra_pendientes ?? 0}
        congelamientosIniciales={profile?.congelamientos_disponibles ?? 0}
        boostIniciales={(profile?.boost_multiplicador_pendiente ?? 1) > 1 ? 1 : 0}
        colorActual={(profile?.color_dial as string) ?? "violeta"}
        coloresDesbloqueados={(profile?.colores_dial_desbloqueados as string[]) ?? ["violeta"]}
        marcoActual={(profile?.marco_perfil as string) ?? "ninguno"}
        marcosDesbloqueados={(profile?.marcos_desbloqueados as string[]) ?? ["ninguno"]}
        apuestaActiva={(profile?.apuesta_monto ?? 0) > 0}
        fechaHoy={hoyIso}
      />
    </>
  );
}
