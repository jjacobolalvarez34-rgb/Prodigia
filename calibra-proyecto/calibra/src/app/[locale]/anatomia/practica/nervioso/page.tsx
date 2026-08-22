import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoAnatomia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { cargarDatosPracticaAnatomia } from "@/lib/anatomia/cargarPractica";
import AnatomiaPracticaClient from "../../AnatomiaPracticaClient";

export const metadata: Metadata = {
  title: "Sistema nervioso",
  description: "Sistema nervioso y pares craneales, con dificultad adaptativa.",
};

export default async function AnatomiaNerviosoPage() {
  const supabase = await createClient();
  const { user } = await requireMundoAnatomia(supabase, "/anatomia/practica/nervioso");

  const { nivelInicial, escudosExtra, boostActivo } = await cargarDatosPracticaAnatomia(supabase, user.id, "nervioso");

  return (
    <>
      <Header autenticado />
      <AnatomiaPracticaClient modo="nervioso" nivelInicial={nivelInicial} escudosExtra={escudosExtra} boostActivo={boostActivo} />
    </>
  );
}
