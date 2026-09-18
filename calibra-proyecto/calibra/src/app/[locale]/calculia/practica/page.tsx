import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoCalculia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import CalculiaPracticaClient from "../CalculiaPracticaClient";
import { cargarDatosPracticaCalculia } from "@/lib/calculia/cargarPractica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Calculia.practica.derivadas.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function CalculiaPracticaDerivadasPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoCalculia(supabase, "/calculia/practica", Boolean(duelo));

  const { modo, nivelInicial, escudosExtra, hielosDisponibles, tiemposExtraDisponibles, boostActivo, dueloInfo } = await cargarDatosPracticaCalculia(supabase, user.id, "derivadas", duelo);

  return (
    <>
      <Header autenticado />
      <CalculiaPracticaClient
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
