import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import TrastiendaClient from "@/components/trastienda/TrastiendaClient";
import ConfirmarEdadTrastienda from "@/components/trastienda/ConfirmarEdadTrastienda";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Tienda.metadata");
  return { title: t("title"), description: t("description") };
}

// Edad mínima real (pedido en vivo, 2026-09-15) — la Trastienda es
// casino/apuestas (ruleta, doble o nada), no un cosmético más.
//
// SEG-03 (docs/audits/REVISION-GENERAL-2026-09-26.md, corregido 2026-09-27):
// antes, sin edad_ingresada (cuentas viejas, o quien nunca la cargó) se
// dejaba pasar como si fuera adulto, y ninguna RPC volvía a chequearlo —
// el gate real vivía SOLO acá. Ahora null se trata como "todavía no
// sabemos": se pide la edad ahí mismo (ConfirmarEdadTrastienda) en vez de
// dejar jugar. El servidor (puede_usar_trastienda, migración 0241) exige
// lo mismo en cada RPC de la Trastienda, así que esto ya no es la única
// barrera.
const EDAD_MINIMA_TRASTIENDA = 14;

export default async function TrastiendaPage() {
  const t = await getTranslations("Tienda.trastiendaGateEdad");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/trastienda");

  const { data: profile } = await supabase
    .from("profiles")
    .select("monedas_trastienda, apuesta_monto, ocultar_doble_o_nada, edad_ingresada")
    .eq("id", user.id)
    .single();

  const edadSinConfirmar = profile?.edad_ingresada == null;
  const esMenor = !edadSinConfirmar && profile!.edad_ingresada! < EDAD_MINIMA_TRASTIENDA;

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      {edadSinConfirmar || esMenor ? (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <span className="text-4xl">🔒</span>
          {edadSinConfirmar ? (
            <>
              <h1 className="font-display text-xl font-bold text-foreground">{t("tituloConfirmar")}</h1>
              <p className="text-sm text-texto-secundario">{t("descripcionConfirmar", { n: EDAD_MINIMA_TRASTIENDA })}</p>
              <ConfirmarEdadTrastienda />
            </>
          ) : (
            <>
              <h1 className="font-display text-xl font-bold text-foreground">{t("titulo")}</h1>
              <p className="text-sm text-texto-secundario">{t("descripcion", { n: EDAD_MINIMA_TRASTIENDA })}</p>
            </>
          )}
        </div>
      ) : (
        <TrastiendaClient
          puntosIniciales={profile?.monedas_trastienda ?? 0}
          apuestaActivaInicial={(profile?.apuesta_monto ?? 0) > 0}
          ocultarDobleONada={profile?.ocultar_doble_o_nada ?? false}
        />
      )}
    </>
  );
}