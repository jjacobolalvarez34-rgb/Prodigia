import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import TiendaClient from "./TiendaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Tienda.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function TiendaPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/tienda");

  const [{ data: profile }, { data: mundosRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "puntos_total, escudos_extra_pendientes, congelamientos_disponibles, boost_multiplicador_pendiente, fuente_nombre, fuentes_desbloqueadas, marco_perfil, marcos_desbloqueados, apuesta_monto, ocultar_doble_o_nada"
      )
      .eq("id", user.id)
      .single(),
    supabase.from("world_progress").select("world, nivel_mundo").eq("user_id", user.id),
  ]);

  const hoyIso = new Date().toISOString().slice(0, 10);
  const nivelesMundo = Object.fromEntries((mundosRows ?? []).map((w) => [w.world, w.nivel_mundo])) as Record<string, number>;

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
        nivelesMundo={nivelesMundo}
        apuestaActiva={(profile?.apuesta_monto ?? 0) > 0}
        ocultarDobleONadaInicial={profile?.ocultar_doble_o_nada ?? false}
        fechaHoy={hoyIso}
      />
    </>
  );
}
