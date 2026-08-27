import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoMelodia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import MelodiaPracticaClient from "../../MelodiaPracticaClient";
import { cargarDatosPracticaMelodia } from "@/lib/melodia/cargarPractica";

export const metadata: Metadata = {
  title: "Practicar Oído absoluto",
  description: "Escuchá la nota e identificala — el modo más difícil de Melodía.",
};

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function MelodiaPracticaOidoAbsolutoPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoMelodia(supabase, "/melodia/practica/oido-absoluto");

  const { modo, nivelInicial, escudosExtra, boostActivo, dueloInfo } = await cargarDatosPracticaMelodia(supabase, user.id, "oido_absoluto", duelo);

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
