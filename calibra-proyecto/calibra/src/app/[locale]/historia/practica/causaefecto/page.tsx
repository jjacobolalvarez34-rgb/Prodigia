import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoHistoria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import HistoriaPracticaClient from "../../HistoriaPracticaClient";
import { cargarDatosPracticaHistoria } from "@/lib/historia/cargarPractica";

export const metadata: Metadata = {
  title: "Practicar Causa y efecto",
  description: "La consecuencia directa más reconocida de un evento histórico.",
};

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function HistoriaPracticaCausaEfectoPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoHistoria(supabase, "/historia/practica/causaefecto");

  const { modo, nivelInicial, escudosExtra, boostActivo, dueloInfo } = await cargarDatosPracticaHistoria(supabase, user.id, "causaefecto", duelo);

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
