import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoCodia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import CodiaPracticaClient from "../../CodiaPracticaClient";
import { cargarDatosPracticaCodia } from "@/lib/codia/cargarPractica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Codia.practica.salida.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function CodiaPracticaSalidaPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoCodia(supabase, "/codia/practica/salida", Boolean(duelo));

  const { modo, nivelInicial, escudosExtra, hielosDisponibles, tiemposExtraDisponibles, boostActivo, dueloInfo } = await cargarDatosPracticaCodia(supabase, user.id, "salida", duelo);

  return (
    <>
      <Header autenticado />
      <CodiaPracticaClient
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
