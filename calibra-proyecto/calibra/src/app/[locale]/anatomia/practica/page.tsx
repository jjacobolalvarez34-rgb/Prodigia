import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoAnatomia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { cargarDatosPracticaAnatomia } from "@/lib/anatomia/cargarPractica";
import AnatomiaPracticaClient from "../AnatomiaPracticaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Anatomia.practica.oseo.metadata");
  return { title: t("titulo"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function AnatomiaOseoPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoAnatomia(supabase, "/anatomia/practica");

  const { modo, nivelInicial, escudosExtra, boostActivo, dueloInfo } = await cargarDatosPracticaAnatomia(supabase, user.id, "oseo", duelo);

  return (
    <>
      <Header autenticado />
      <AnatomiaPracticaClient
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
