import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoNaipia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import NaipiaPracticaClient from "../../NaipiaPracticaClient";
import { cargarDatosPracticaNaipia } from "@/lib/naipia/cargarPractica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Naipia.practica.verdadero.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function NaipiaPracticaVerdaderoPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoNaipia(supabase, "/naipia/practica/verdadero", Boolean(duelo));

  const { modo, nivelInicial, escudosExtra, hielosDisponibles, tiemposExtraDisponibles, boostActivo, dueloInfo } = await cargarDatosPracticaNaipia(supabase, user.id, "verdadero", duelo);

  return (
    <>
      <Header autenticado />
      <NaipiaPracticaClient
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
