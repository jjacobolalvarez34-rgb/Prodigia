import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoQuimia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import QuimiaPracticaClient from "../../QuimiaPracticaClient";
import { cargarDatosPracticaQuimia } from "@/lib/quimia/cargarPractica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Quimia.practicaPaginas.formulas");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function QuimiaPracticaFormulasPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoQuimia(supabase, "/quimia/practica/formulas");

  const { modo, nivelInicial, escudosExtra, hielosDisponibles, tiemposExtraDisponibles, boostActivo, dueloInfo } = await cargarDatosPracticaQuimia(
    supabase,
    user.id,
    "formulas",
    duelo
  );

  return (
    <>
      <Header autenticado />
      <QuimiaPracticaClient
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
