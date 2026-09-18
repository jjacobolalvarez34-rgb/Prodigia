import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoHistoria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import HistoriaPracticaClient from "../../HistoriaPracticaClient";
import { cargarDatosPracticaHistoria } from "@/lib/historia/cargarPractica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Historia.practicaPages.causaefecto.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function HistoriaPracticaCausaEfectoPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoHistoria(supabase, "/historia/practica/causaefecto", Boolean(duelo));

  const { modo, nivelInicial, escudosExtra, hielosDisponibles, tiemposExtraDisponibles, boostActivo, dueloInfo } = await cargarDatosPracticaHistoria(supabase, user.id, "causaefecto", duelo);

  return (
    <>
      <Header autenticado />
      <HistoriaPracticaClient
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
