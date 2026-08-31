import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoTrigonometria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import TrigonometriaPracticaClient from "../../TrigonometriaPracticaClient";
import { cargarDatosPracticaTrigonometria } from "@/lib/trigonometria/cargarPractica";

export const metadata: Metadata = {
  title: "Practicar Leyes de seno y coseno",
  description: "Resolvé triángulos oblicuos con los datos suficientes — el modo más difícil.",
};

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function TrigonometriaPracticaLeyesPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoTrigonometria(supabase, "/trigonometria/practica/leyes");

  const { modo, nivelInicial, escudosExtra, boostActivo, dueloInfo } = await cargarDatosPracticaTrigonometria(supabase, user.id, "leyes", duelo);

  return (
    <>
      <Header autenticado />
      <TrigonometriaPracticaClient
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
