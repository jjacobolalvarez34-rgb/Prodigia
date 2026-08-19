import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import TiendaClient from "./TiendaClient";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Gastá tus Chispas en escudos, boosts y cosméticos del bazar de Prodigia.",
};

export default async function TiendaPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/tienda");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "puntos_total, escudos_extra_pendientes, congelamientos_disponibles, boost_multiplicador_pendiente, fuente_nombre, fuentes_desbloqueadas, marco_perfil, marcos_desbloqueados, apuesta_monto, ocultar_doble_o_nada"
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
        fuenteActual={(profile?.fuente_nombre as string) ?? "default"}
        fuentesDesbloqueadas={(profile?.fuentes_desbloqueadas as string[]) ?? ["default"]}
        marcoActual={(profile?.marco_perfil as string) ?? "ninguno"}
        marcosDesbloqueados={(profile?.marcos_desbloqueados as string[]) ?? ["ninguno"]}
        apuestaActiva={(profile?.apuesta_monto ?? 0) > 0}
        ocultarDobleONadaInicial={profile?.ocultar_doble_o_nada ?? false}
        fechaHoy={hoyIso}
      />
    </>
  );
}
