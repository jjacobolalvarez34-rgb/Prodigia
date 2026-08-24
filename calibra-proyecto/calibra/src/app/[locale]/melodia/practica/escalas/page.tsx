import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoMelodia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import MelodiaPracticaClient from "../../MelodiaPracticaClient";
import { cargarDatosPracticaMelodia } from "@/lib/melodia/cargarPractica";

export const metadata: Metadata = {
  title: "Practicar Escalas",
  description: "Escalas mayor, menor natural y pentatónicas, con dificultad adaptativa.",
};

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function MelodiaPracticaEscalasPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoMelodia(supabase, "/melodia/practica/escalas");

  const { modo, nivelInicial, escudosExtra, boostActivo, dueloInfo } = await cargarDatosPracticaMelodia(supabase, user.id, "escalas", duelo);

  return (
    <>
      <Header autenticado />
      <MelodiaPracticaClient
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
