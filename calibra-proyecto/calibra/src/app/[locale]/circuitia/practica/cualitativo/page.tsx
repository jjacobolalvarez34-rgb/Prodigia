import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoCircuitia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import CircuitiaPracticaClient from "../../CircuitiaPracticaClient";
import { cargarDatosPracticaCircuitia } from "@/lib/circuitia/cargarPractica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Circuitia.practica.cualitativo.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function CircuitiaPracticaCualitativoPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoCircuitia(supabase, "/circuitia/practica/cualitativo");

  const { modo, nivelInicial, escudosExtra, hielosDisponibles, tiemposExtraDisponibles, boostActivo, dueloInfo } = await cargarDatosPracticaCircuitia(supabase, user.id, "cualitativo", duelo);

  return (
    <>
      <Header autenticado />
      <CircuitiaPracticaClient
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
