import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoTrigonometria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import TrigonometriaPracticaClient from "../../TrigonometriaPracticaClient";
import { cargarDatosPracticaTrigonometria } from "@/lib/trigonometria/cargarPractica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Trigonometria.practica.leyes.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function TrigonometriaPracticaLeyesPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoTrigonometria(supabase, "/trigonometria/practica/leyes");

  const { modo, nivelInicial, escudosExtra, hielosDisponibles, tiemposExtraDisponibles, boostActivo, dueloInfo } = await cargarDatosPracticaTrigonometria(supabase, user.id, "leyes", duelo);

  return (
    <>
      <Header autenticado />
      <TrigonometriaPracticaClient
        modo={modo}
        nivelInicial={nivelInicial}
        escudosExtra={escudosExtra}
        hielosDisponibles={hielosDisponibles}
        tiemposExtraDisponibles={tiemposExtraDisponibles}
        boostActivo={boostActivo}
        duelo={dueloInfo}
        miUserId={user.id}
      />
    </>
  );
}
