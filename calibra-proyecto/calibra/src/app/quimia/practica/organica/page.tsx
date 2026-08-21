import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoQuimia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import QuimiaPracticaClient from "../../QuimiaPracticaClient";
import { cargarDatosPracticaQuimia } from "@/lib/quimia/cargarPractica";

export const metadata: Metadata = {
  title: "Practicar Química orgánica",
  description: "Identificá compuestos orgánicos comunes a partir de su fórmula estructural.",
};

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function QuimiaPracticaOrganicaPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoQuimia(supabase, "/quimia/practica/organica");

  const { modo, nivelInicial, escudosExtra, boostActivo, dueloInfo } = await cargarDatosPracticaQuimia(
    supabase,
    user.id,
    "organica",
    duelo
  );

  return (
    <>
      <Header autenticado />
      <QuimiaPracticaClient
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
