import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoHistoria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import HistoriaPracticaClient from "../HistoriaPracticaClient";
import { cargarDatosPracticaHistoria } from "@/lib/historia/cargarPractica";

export const metadata: Metadata = {
  title: "Practicar Cronología",
  description: "Ordená eventos históricos o identificá el siglo, con dificultad adaptativa.",
};

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function HistoriaPracticaCronologiaPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoHistoria(supabase, "/historia/practica");

  const { modo, nivelInicial, escudosExtra, boostActivo, dueloInfo } = await cargarDatosPracticaHistoria(supabase, user.id, "cronologia", duelo);

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
