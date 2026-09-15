import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import TrastiendaClient from "@/components/trastienda/TrastiendaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Tienda.metadata");
  return { title: t("title"), description: t("description") };
}

// Edad mínima real (pedido en vivo, 2026-09-15) — la Trastienda es
// casino/apuestas (ruleta, doble o nada), no un cosmético más. Sin
// edad_ingresada (cuentas viejas de antes de este gate, o invitados que
// nunca la cargaron) se deja pasar — el gate es "si sabemos que es
// menor, bloquear", no "exigir la edad retroactivamente a todo el mundo".
const EDAD_MINIMA_TRASTIENDA = 14;

export default async function TrastiendaPage() {
  const t = await getTranslations("Tienda.trastiendaGateEdad");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/trastienda");

  const { data: profile } = await supabase
    .from("profiles")
    .select("puntos_total, apuesta_monto, ocultar_doble_o_nada, edad_ingresada")
    .eq("id", user.id)
    .single();

  const esMenor = profile?.edad_ingresada != null && profile.edad_ingresada < EDAD_MINIMA_TRASTIENDA;

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      {esMenor ? (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <span className="text-4xl">🔒</span>
          <h1 className="font-display text-xl font-bold text-foreground">{t("titulo")}</h1>
          <p className="text-sm text-texto-secundario">{t("descripcion", { n: EDAD_MINIMA_TRASTIENDA })}</p>
        </div>
      ) : (
        <TrastiendaClient
          puntosIniciales={profile?.puntos_total ?? 0}
          apuestaActivaInicial={(profile?.apuesta_monto ?? 0) > 0}
          ocultarDobleONada={profile?.ocultar_doble_o_nada ?? false}
        />
      )}
    </>
  );
}