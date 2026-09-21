import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoCodia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import CodiaPracticaClient from "../CodiaPracticaClient";
import { cargarDatosPracticaCodia } from "@/lib/codia/cargarPractica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Codia.practica.sintaxis.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function CodiaPracticaSintaxisPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoCodia(supabase, "/codia/practica", Boolean(duelo));

  const { modo, nivelInicial, escudosExtra, hielosDisponibles, tiemposExtraDisponibles, boostActivo, dueloInfo } = await cargarDatosPracticaCodia(supabase, user.id, "sintaxis", duelo);

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
