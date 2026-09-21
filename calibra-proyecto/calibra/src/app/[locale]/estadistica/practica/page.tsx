import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoEstadistica } from "@/lib/auth/guard";
import Header from "@/components/Header";
import EstadisticaPracticaClient from "../EstadisticaPracticaClient";
import { cargarDatosPracticaEstadistica } from "@/lib/estadistica/cargarPractica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Estadistica.practica.central.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function EstadisticaPracticaCentralPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoEstadistica(supabase, "/estadistica/practica", Boolean(duelo));

  const { modo, nivelInicial, escudosExtra, hielosDisponibles, tiemposExtraDisponibles, boostActivo, dueloInfo } = await cargarDatosPracticaEstadistica(supabase, user.id, "central", duelo);

  return (
    <>
      <Header autenticado />
      <EstadisticaPracticaClient
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
