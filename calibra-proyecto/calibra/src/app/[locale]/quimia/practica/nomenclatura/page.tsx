import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoQuimia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import QuimiaPracticaClient from "../../QuimiaPracticaClient";
import { cargarDatosPracticaQuimia } from "@/lib/quimia/cargarPractica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Quimia.practicaPaginas.nomenclatura");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function QuimiaPracticaNomenclaturaPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoQuimia(supabase, "/quimia/practica/nomenclatura");

  const { modo, nivelInicial, escudosExtra, boostActivo, dueloInfo } = await cargarDatosPracticaQuimia(
    supabase,
    user.id,
    "nomenclatura",
    duelo
  );

  return (
    <>
      <Header autenticado />
      <QuimiaPracticaClient
        modo={modo}
        nivelInicial={nivelInicial}
        escudosExtra={escudosExtra}
        boostActivo={boostActivo}
        duelo={dueloInfo}
        miUserId={user.id}
      />
    </>
  );
}
