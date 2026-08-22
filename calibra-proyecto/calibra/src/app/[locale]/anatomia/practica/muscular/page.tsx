import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoAnatomia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { cargarDatosPracticaAnatomia } from "@/lib/anatomia/cargarPractica";
import AnatomiaPracticaClient from "../../AnatomiaPracticaClient";

export const metadata: Metadata = {
  title: "Sistema muscular",
  description: "Músculos del cuerpo humano, con dificultad adaptativa.",
};

export default async function AnatomiaMuscularPage() {
  const supabase = await createClient();
  const { user } = await requireMundoAnatomia(supabase, "/anatomia/practica/muscular");

  const { nivelInicial, escudosExtra, boostActivo } = await cargarDatosPracticaAnatomia(supabase, user.id, "muscular");

  return (
    <>
      <Header autenticado />
      <AnatomiaPracticaClient modo="muscular" nivelInicial={nivelInicial} escudosExtra={escudosExtra} boostActivo={boostActivo} />
    </>
  );
}
