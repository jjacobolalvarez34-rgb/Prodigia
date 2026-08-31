import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoTrigonometria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import TrigonometriaPracticaClient from "../../TrigonometriaPracticaClient";
import { cargarDatosPracticaTrigonometria } from "@/lib/trigonometria/cargarPractica";

export const metadata: Metadata = {
  title: "Practicar Círculo unitario",
  description: "Valores exactos de seno/coseno/tangente en los ángulos notables, en grados y radianes.",
};

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function TrigonometriaPracticaCirculoPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoTrigonometria(supabase, "/trigonometria/practica/circulo");

  const { modo, nivelInicial, escudosExtra, boostActivo, dueloInfo } = await cargarDatosPracticaTrigonometria(supabase, user.id, "circulo", duelo);

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
