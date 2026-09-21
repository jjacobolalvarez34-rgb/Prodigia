import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoNaipia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import NaipiaPracticaClient from "../NaipiaPracticaClient";
import { cargarDatosPracticaNaipia } from "@/lib/naipia/cargarPractica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Naipia.practica.hilo.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function NaipiaPracticaHiloPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoNaipia(supabase, "/naipia/practica", Boolean(duelo));

  const { modo, nivelInicial, escudosExtra, hielosDisponibles, tiemposExtraDisponibles, boostActivo, dueloInfo } = await cargarDatosPracticaNaipia(supabase, user.id, "hilo", duelo);

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
