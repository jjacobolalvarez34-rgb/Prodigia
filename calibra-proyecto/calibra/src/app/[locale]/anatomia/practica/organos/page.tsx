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

export default async function AnatomiaOrganosPage() {
  const supabase = await createClient();
  const { user } = await requireMundoAnatomia(supabase, "/anatomia/practica/organos");

  const { nivelInicial, escudosExtra, boostActivo } = await cargarDatosPracticaAnatomia(supabase, user.id, "organos");

  return (
    <>
      <Header autenticado />
      <AnatomiaPracticaClient modo="organos" nivelInicial={nivelInicial} escudosExtra={escudosExtra} boostActivo={boostActivo} />
    </>
  );
}
