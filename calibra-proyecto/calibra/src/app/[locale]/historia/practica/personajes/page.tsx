import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoHistoria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import HistoriaPracticaClient from "../../HistoriaPracticaClient";
import { cargarDatosPracticaHistoria } from "@/lib/historia/cargarPractica";

export const metadata: Metadata = {
  title: "Practicar Personajes",
  description: "Identificá la figura histórica a partir de pistas, con dificultad adaptativa.",
};

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function HistoriaPracticaPersonajesPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoHistoria(supabase, "/historia/practica/personajes");

  const { modo, nivelInicial, escudosExtra, boostActivo, dueloInfo } = await cargarDatosPracticaHistoria(supabase, user.id, "personajes", duelo);

  return (
    <>
      <Header autenticado />
      <HistoriaPracticaClient
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
