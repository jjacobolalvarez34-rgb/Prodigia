import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoAnatomia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { cargarDatosPracticaAnatomia } from "@/lib/anatomia/cargarPractica";
import AnatomiaPracticaClient from "../AnatomiaPracticaClient";

export const metadata: Metadata = {
  title: "Sistema óseo",
  description: "Huesos del cuerpo humano, con dificultad adaptativa.",
};

export default async function AnatomiaOseoPage() {
  const supabase = await createClient();
  const { user } = await requireMundoAnatomia(supabase, "/anatomia/practica");

  const { nivelInicial, escudosExtra, boostActivo } = await cargarDatosPracticaAnatomia(supabase, user.id, "oseo");

  return (
    <>
      <Header autenticado />
      <AnatomiaPracticaClient modo="oseo" nivelInicial={nivelInicial} escudosExtra={escudosExtra} boostActivo={boostActivo} />
    </>
  );
}
