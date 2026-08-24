import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoAnatomia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { cargarDatosPracticaAnatomia } from "@/lib/anatomia/cargarPractica";
import AnatomiaPracticaClient from "../../AnatomiaPracticaClient";

export const metadata: Metadata = {
  title: "Órganos",
  description: "Órganos principales del cuerpo humano, con dificultad adaptativa.",
};

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function AnatomiaOrganosPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoAnatomia(supabase, "/anatomia/practica/organos");

  const { modo, nivelInicial, escudosExtra, boostActivo, dueloInfo } = await cargarDatosPracticaAnatomia(supabase, user.id, "organos", duelo);

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
