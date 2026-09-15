import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoMelodia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import MelodiaPracticaClient from "../../MelodiaPracticaClient";
import { cargarDatosPracticaMelodia } from "@/lib/melodia/cargarPractica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Melodia.practicaPaginas.acordes.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function MelodiaPracticaAcordesPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoMelodia(supabase, "/melodia/practica/acordes");

  const { modo, nivelInicial, escudosExtra, hielosDisponibles, tiemposExtraDisponibles, boostActivo, dueloInfo } = await cargarDatosPracticaMelodia(supabase, user.id, "acordes", duelo);

  return (
    <>
      <Header autenticado />
      <MelodiaPracticaClient
        modo={modo}
        nivelInicial={nivelInicial}
        escudosExtra={escudosExtra}
        hielosDisponibles={hielosDisponibles}
        tiemposExtraDisponibles={tiemposExtraDisponibles}
        boostActivo={boostActivo}
        duelo={dueloInfo}
        miUserId={user.id}
      />
    </>
  );
}
