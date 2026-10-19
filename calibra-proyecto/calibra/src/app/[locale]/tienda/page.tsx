import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import TiendaClient from "./TiendaClient";
import { pagosHabilitados } from "@/lib/pagos/flags";
import TiendaAmpliada from "./TiendaAmpliada";
import SeccionCometas from "@/components/tienda/SeccionCometas";
import { VitrinaMonedas } from "@/components/pagos/Vitrina";
import CapsulasCometas from "@/components/tienda/CapsulasCometas";
import PaquetesCapsulas from "@/components/tienda/PaquetesCapsulas";
import { productosConPrecio } from "@/lib/pagos/paddle";
import { PRODUCTOS } from "@/lib/pagos/productos";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Tienda.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function TiendaPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/tienda");

  const [{ data: profile }, { data: mundosRows }, { data: fondosGaleriaRows }, { data: desbloqueadosRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "puntos_total, escudos_extra_pendientes, congelamientos_disponibles, boost_multiplicador_pendiente, hielos_disponibles, tiempos_extra_disponibles, fuente_nombre, fuentes_desbloqueadas, marco_perfil, marcos_desbloqueados, animacion_nombre, animaciones_desbloqueadas, fondo_perfil, fondo_perfil_url, fondos_desbloqueados, color_nombre_desbloqueado, ocultar_doble_o_nada, plan"
      )
      .eq("id", user.id)
      .single(),
    supabase.from("world_progress").select("world, nivel_mundo").eq("user_id", user.id),
    supabase.from("fondos_galeria").select("slug, nombre, url, costo").eq("activo", true).order("orden"),
    supabase.from("fondos_galeria_desbloqueados").select("slug").eq("user_id", user.id),
  ]);

  // Cometas en consulta aparte: si 0279 todavía no se aplicó, la columna no existe
  // y la tienda sigue andando con saldo 0.
  const { data: filaCometas } = await supabase.from("profiles").select("cometas").eq("id", user.id).maybeSingle();
  const paquetesCometas = productosConPrecio().filter((p) => PRODUCTOS[p].tipo === "cometas");

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
        hielosIniciales={profile?.hielos_disponibles ?? 0}
        tiemposExtraIniciales={profile?.tiempos_extra_disponibles ?? 0}
        fuenteActual={(profile?.fuente_nombre as string) ?? "default"}
        fuentesDesbloqueadas={(profile?.fuentes_desbloqueadas as string[]) ?? ["default"]}
        marcoActual={(profile?.marco_perfil as string) ?? "ninguno"}
        marcosDesbloqueados={(profile?.marcos_desbloqueados as string[]) ?? ["ninguno"]}
        animacionActual={(profile?.animacion_nombre as string) ?? "ninguna"}
        animacionesDesbloqueadas={(profile?.animaciones_desbloqueadas as string[]) ?? ["ninguna"]}
        fondoActual={(profile?.fondo_perfil as string) ?? "ninguno"}
        fondosDesbloqueados={(profile?.fondos_desbloqueados as string[]) ?? ["ninguno"]}
        fondoPerfilUrlActual={(profile?.fondo_perfil_url as string | null) ?? null}
        fondosGaleria={fondosGaleriaRows ?? []}
        fondosGaleriaDesbloqueados={(desbloqueadosRows ?? []).map((r) => r.slug)}
        colorNombreDesbloqueadoInicial={profile?.color_nombre_desbloqueado ?? false}
        ocultarTrastienda={profile?.ocultar_doble_o_nada ?? false}
        esPro={profile?.plan === "pro"}
        nivelesMundo={nivelesMundo}
        fechaHoy={hoyIso}
        pagosHabilitados={pagosHabilitados()}
        cometasIniciales={(filaCometas as { cometas?: number } | null)?.cometas ?? 0}
        seccionCometas={
          <>
            <VitrinaMonedas pagosHabilitados={pagosHabilitados() && !user.is_anonymous} cometasDisponibles={paquetesCometas} esPro={profile?.plan === "pro"} />
            <SeccionCometas cometasIniciales={(filaCometas as { cometas?: number } | null)?.cometas ?? 0} />
            {!user.is_anonymous && <PaquetesCapsulas />}
            {!user.is_anonymous && <CapsulasCometas />}
          </>
        }
      />
      <TiendaAmpliada paquetesConDinero={pagosHabilitados() && !user.is_anonymous && productosConPrecio().includes("paquete_cosmetico")} />
    </>
  );
}
